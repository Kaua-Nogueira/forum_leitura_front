import {
  Work,
  Topic,
  Comment,
  Category,
  ModerationFlag,
  PlatformSettings,
  User,
  UserRole,
  UserPermissions,
  AuthResponse,
  FlagReason,
} from '../types/schema';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

export const TOKEN_STORAGE_KEY = 'veritas_auth_token';
export const USER_STORAGE_KEY = 'veritas_auth_user';

export function buildAffiliateUrl(rawUrl: string, globalTag: string): string {
  if (!rawUrl) return '#';
  const cleanTag = (globalTag || 'veritaslitterae-20').trim();
  try {
    const url = new URL(rawUrl);
    if (
      url.hostname.includes('amazon.') ||
      url.hostname.includes('amzn.') ||
      !url.searchParams.has('tag')
    ) {
      url.searchParams.set('tag', cleanTag);
    }
    return url.toString();
  } catch {
    const separator = rawUrl.includes('?') ? '&' : '?';
    return `${rawUrl}${separator}tag=${encodeURIComponent(cleanTag)}`;
  }
}

export function computePermissionsForRole(
  role: UserRole,
  isBanned = false
): UserPermissions {
  if (isBanned || role === 'VISITOR') {
    return {
      can_create_work: false,
      can_create_topic: false,
      can_comment: false,
      can_publish_directly: false,
      can_moderate_queue: false,
      can_ban_users: false,
      can_manage_affiliate_settings: false,
      can_manage_roles: false,
    };
  }

  return {
    can_create_work: true,
    can_create_topic: true,
    can_comment: true,
    can_publish_directly: role === 'MODERATOR' || role === 'ADMIN',
    can_moderate_queue: role === 'MODERATOR' || role === 'ADMIN',
    can_ban_users: role === 'ADMIN',
    can_manage_affiliate_settings: role === 'ADMIN',
    can_manage_roles: role === 'ADMIN',
  };
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  currentRole: UserRole = 'ADMIN'
): Promise<T> {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Demo-Role': currentRole,
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `Erro HTTP ${response.status}`);
  }

  return response.json();
}

export interface BootstrapResponse {
  categories: Category[];
  works: Work[];
  topics: Topic[];
  moderation_flags: ModerationFlag[];
  settings: PlatformSettings;
}

export const apiService = {
  // Autenticação & RBAC
  async login(email: string, password: string): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(payload: {
    name: string;
    email: string;
    password: string;
    title_badge?: string;
    bio?: string;
  }): Promise<AuthResponse> {
    return request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async me(): Promise<{ user: User; permissions: UserPermissions }> {
    return request<{ user: User; permissions: UserPermissions }>('/auth/me', {
      method: 'GET',
    });
  },

  async logout(): Promise<{ message: string }> {
    return request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  },

  async listUsers(role: UserRole): Promise<{ users: User[] }> {
    return request<{ users: User[] }>('/users', { method: 'GET' }, role);
  },

  async updateUserRole(
    userId: number,
    payload: {
      role?: 'MEMBER' | 'MODERATOR' | 'ADMIN';
      is_banned?: boolean;
      title_badge?: string;
    },
    currentRole: UserRole
  ): Promise<{ user: User; message: string }> {
    return request<{ user: User; message: string }>(
      `/users/${userId}/role`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
      currentRole
    );
  },

  // Acervo & Fórum
  async getBootstrap(role: UserRole): Promise<BootstrapResponse> {
    return request<BootstrapResponse>('/bootstrap', { method: 'GET' }, role);
  },

  async createWork(
    payload: Partial<Work>,
    role: UserRole
  ): Promise<{ work: Work; flag?: ModerationFlag }> {
    return request<{ work: Work; flag?: ModerationFlag }>(
      '/works',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      role
    );
  },

  async trackAffiliateClick(
    workId: number,
    role: UserRole
  ): Promise<{ clicks_count: number }> {
    return request<{ clicks_count: number }>(
      `/works/${workId}/affiliate-click`,
      { method: 'POST' },
      role
    );
  },

  async createTopic(
    payload: Partial<Topic>,
    role: UserRole
  ): Promise<{ topic: Topic }> {
    return request<{ topic: Topic }>(
      '/topics',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      role
    );
  },

  async createComment(
    payload: {
      body: string;
      rating?: number | null;
      work_id?: number | null;
      topic_id?: number | null;
      parent_id?: number | null;
    },
    role: UserRole
  ): Promise<{ comment: Comment }> {
    return request<{ comment: Comment }>(
      '/comments',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      role
    );
  },

  async toggleUpvote(
    targetType: 'TOPIC' | 'COMMENT',
    targetId: number,
    role: UserRole
  ): Promise<{ upvotes_count: number }> {
    return request<{ upvotes_count: number }>(
      '/upvotes',
      {
        method: 'POST',
        body: JSON.stringify({ target_type: targetType, target_id: targetId }),
      },
      role
    );
  },

  async createFlag(
    payload: {
      target_type: 'WORK' | 'TOPIC' | 'COMMENT';
      target_id: number;
      target_title: string;
      target_excerpt: string;
      reason: FlagReason;
      details: string;
    },
    role: UserRole
  ): Promise<{ flag: ModerationFlag }> {
    return request<{ flag: ModerationFlag }>(
      '/flags',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      role
    );
  },

  async resolveModerationFlag(
    flagId: number,
    action: 'APPROVE' | 'HIDE' | 'BAN_USER',
    moderatorNote: string,
    role: UserRole
  ): Promise<{ flag: ModerationFlag }> {
    return request<{ flag: ModerationFlag }>(
      `/moderation/flags/${flagId}/resolve`,
      {
        method: 'POST',
        body: JSON.stringify({ action, moderator_note: moderatorNote }),
      },
      role
    );
  },

  async updateSettings(
    settings: Partial<PlatformSettings>,
    role: UserRole
  ): Promise<{ settings: PlatformSettings }> {
    return request<{ settings: PlatformSettings }>(
      '/moderation/settings',
      {
        method: 'PUT',
        body: JSON.stringify(settings),
      },
      role
    );
  },
};
