import {
  Work,
  Topic,
  Comment,
  Category,
  ModerationFlag,
  ModerationLog,
  UpvoteRecord,
  PlatformSettings,
  User,
  UserRole,
  UserPermissions,
  AuthResponse,
  FlagReason,
  ReadingSeries,
  SeriesEntry,
  UserFollowRecord,
  DirectMessage,
} from '../types/schema';

declare global {
  interface Window {
    __ENV__?: {
      VITE_API_URL?: string;
      API_URL?: string;
    };
  }
}

function isLocalhostUrl(url: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(\/|$)/i.test(url.trim());
}

function resolveApiBaseUrl(): string {
  const isBrowserOnLocalhost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1');

  const runtimeUrl = (
    (typeof window !== 'undefined' &&
      (window.__ENV__?.VITE_API_URL || window.__ENV__?.API_URL)) ||
    ''
  ).trim();

  if (runtimeUrl && (isBrowserOnLocalhost || !isLocalhostUrl(runtimeUrl))) {
    return runtimeUrl.replace(/\/+$/, '');
  }

  const buildEnvUrl = (import.meta.env.VITE_API_URL || '').trim();
  if (buildEnvUrl && (isBrowserOnLocalhost || !isLocalhostUrl(buildEnvUrl))) {
    return buildEnvUrl.replace(/\/+$/, '');
  }

  if (isBrowserOnLocalhost) {
    return 'http://127.0.0.1:8000/api';
  }

  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('-frontend.')) {
      return `${window.location.protocol}//${host.replace('-frontend.', '-backend.')}/api`;
    }
    if (host.includes('-front.')) {
      return `${window.location.protocol}//${host.replace('-front.', '-back.')}/api`;
    }
  }

  return 'https://forum-leitura-backend.vs5wec.easypanel.host/api';
}

const API_BASE_URL = resolveApiBaseUrl();

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
      can_manage_series: false,
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
    can_manage_series: role === 'COLUMNIST' || role === 'MODERATOR' || role === 'ADMIN',
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
  const savedUserRaw = localStorage.getItem(USER_STORAGE_KEY);
  let currentUserId = '';
  let currentUserEmail = '';
  if (savedUserRaw) {
    try {
      const parsed = JSON.parse(savedUserRaw);
      if (parsed?.id && parsed?.role !== 'VISITOR') {
        currentUserId = String(parsed.id);
      }
      if (parsed?.email && parsed?.role !== 'VISITOR') {
        currentUserEmail = String(parsed.email);
      }
    } catch {
      // ignore
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Demo-Role': currentRole,
    ...(currentUserId ? { 'X-User-Id': currentUserId } : {}),
    ...(currentUserEmail ? { 'X-User-Email': currentUserEmail } : {}),
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
    if (errorBody?.errors && typeof errorBody.errors === 'object') {
      const messages = Object.values(errorBody.errors)
        .flat()
        .filter(Boolean)
        .join(' ');
      if (messages) {
        throw new Error(messages);
      }
    }
    throw new Error(errorBody.message || `Não foi possível concluir a operação (Erro HTTP ${response.status}).`);
  }

  return response.json();
}

export interface BootstrapResponse {
  categories: Category[];
  works: Work[];
  topics: Topic[];
  series?: ReadingSeries[];
  moderation_flags: ModerationFlag[];
  moderation_logs?: ModerationLog[];
  upvotes?: UpvoteRecord[];
  settings: PlatformSettings;
  users?: User[];
  user_follows?: UserFollowRecord[];
  direct_messages?: DirectMessage[];
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

  async updateProfile(
    payload: {
      name: string;
      title_badge?: string;
      bio?: string;
      avatar_url?: string | null;
      cover_url?: string | null;
      user_id?: number;
      email?: string;
    },
    role: UserRole = 'MEMBER',
    userId?: number,
    userEmail?: string
  ): Promise<{ user: User; log?: ModerationLog; message: string }> {
    return request<{ user: User; log?: ModerationLog; message: string }>(
      '/auth/profile',
      {
        method: 'PUT',
        headers: {
          ...(userId ? { 'X-User-Id': String(userId) } : {}),
          ...(userEmail ? { 'X-User-Email': userEmail } : {}),
        },
        body: JSON.stringify({
          ...payload,
          ...(userId ? { user_id: userId } : {}),
          ...(userEmail ? { email: userEmail } : {}),
        }),
      },
      role
    );
  },

  async listUsers(role: UserRole): Promise<{ users: User[] }> {
    return request<{ users: User[] }>('/users', { method: 'GET' }, role);
  },

  async listSystemLogs(
    role: UserRole,
    limit = 1000
  ): Promise<{ logs: ModerationLog[] }> {
    return request<{ logs: ModerationLog[] }>(
      `/moderation/logs?limit=${limit}`,
      { method: 'GET' },
      role
    );
  },

  async updateUserRole(
    userId: number,
    payload: {
      role?: 'MEMBER' | 'COLUMNIST' | 'MODERATOR' | 'ADMIN';
      is_banned?: boolean;
      title_badge?: string;
    },
    currentRole: UserRole
  ): Promise<{ user: User; log?: ModerationLog; message: string }> {
    return request<{ user: User; log?: ModerationLog; message: string }>(
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
    payload: Partial<Work> & {
      user_id?: number;
      author_id?: number;
      submitted_by_id?: number;
      email?: string;
    },
    role: UserRole
  ): Promise<{ work: Work; flag?: ModerationFlag; log?: ModerationLog }> {
    return request<{ work: Work; flag?: ModerationFlag; log?: ModerationLog }>(
      '/works',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      role
    );
  },

  async updateWork(
    workId: number,
    payload: Partial<Work>,
    role: UserRole
  ): Promise<{ work: Work; log?: ModerationLog; message?: string }> {
    return request<{ work: Work; log?: ModerationLog; message?: string }>(
      `/works/${workId}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      role
    );
  },

  async updateTopic(
    topicId: number,
    payload: Partial<Topic>,
    role: UserRole
  ): Promise<{ topic: Topic; log?: ModerationLog; message?: string }> {
    return request<{ topic: Topic; log?: ModerationLog; message?: string }>(
      `/topics/${topicId}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      role
    );
  },

  async trackAffiliateClick(
    workId: number,
    role: UserRole
  ): Promise<{ clicks_count: number; log?: ModerationLog }> {
    return request<{ clicks_count: number; log?: ModerationLog }>(
      `/works/${workId}/affiliate-click`,
      { method: 'POST' },
      role
    );
  },

  async createTopic(
    payload: Partial<Topic> & {
      user_id?: number;
      author_id?: number;
      email?: string;
    },
    role: UserRole
  ): Promise<{ topic: Topic; flag?: ModerationFlag; log?: ModerationLog }> {
    return request<{ topic: Topic; flag?: ModerationFlag; log?: ModerationLog }>(
      '/topics',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      role
    );
  },

  async moderateWorkStatus(
    workId: number,
    status: 'APPROVED' | 'REJECTED' | 'HIDDEN',
    moderationNote: string,
    role: UserRole,
    affiliate?: {
      affiliate_url?: string;
      affiliate_cta_label?: string;
      affiliate_price_hint?: string;
    }
  ): Promise<{ work: Work; log?: ModerationLog }> {
    return request<{ work: Work; log?: ModerationLog }>(
      `/moderation/works/${workId}/status`,
      {
        method: 'POST',
        body: JSON.stringify({
          status,
          moderation_note: moderationNote,
          ...(affiliate || {}),
        }),
      },
      role
    );
  },

  async updateWorkAffiliate(
    workId: number,
    payload: {
      affiliate_url: string;
      affiliate_cta_label?: string;
      affiliate_price_hint?: string;
    },
    role: UserRole
  ): Promise<{ work: Work; log?: ModerationLog; message?: string }> {
    return request<{ work: Work; log?: ModerationLog; message?: string }>(
      `/moderation/works/${workId}/affiliate`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
      role
    );
  },

  async moderateTopicStatus(
    topicId: number,
    status: 'APPROVED' | 'REJECTED' | 'HIDDEN',
    moderationNote: string,
    role: UserRole
  ): Promise<{ topic: Topic; log?: ModerationLog }> {
    return request<{ topic: Topic; log?: ModerationLog }>(
      `/moderation/topics/${topicId}/status`,
      {
        method: 'POST',
        body: JSON.stringify({ status, moderation_note: moderationNote }),
      },
      role
    );
  },

  async deleteContentByModerator(
    payload: {
      target_type: 'WORK' | 'TOPIC' | 'COMMENT';
      target_id: number;
      reason: string;
    },
    role: UserRole
  ): Promise<{
    deleted: boolean;
    target_type: 'WORK' | 'TOPIC' | 'COMMENT';
    target_id: number;
    log: ModerationLog;
    message: string;
  }> {
    return request(
      '/moderation/delete',
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
      series_entry_id?: number | null;
      parent_id?: number | null;
      user_id?: number;
      author_id?: number;
      email?: string;
    },
    role: UserRole
  ): Promise<{ comment: Comment; log?: ModerationLog }> {
    return request<{ comment: Comment; log?: ModerationLog }>(
      '/comments',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      role
    );
  },

  async toggleUpvote(
    targetType: 'TOPIC' | 'COMMENT' | 'SERIES_ENTRY',
    targetId: number,
    role: UserRole
  ): Promise<{ upvotes_count: number; already_upvoted?: boolean; log?: ModerationLog }> {
    return request<{ upvotes_count: number; already_upvoted?: boolean; log?: ModerationLog }>(
      '/upvotes',
      {
        method: 'POST',
        body: JSON.stringify({ target_type: targetType, target_id: targetId }),
      },
      role
    );
  },

  // Séries & Cadernos (Publicações Recorrentes)
  async createSeries(
    payload: Partial<ReadingSeries>,
    role: UserRole
  ): Promise<{ series: ReadingSeries; log?: ModerationLog; message?: string }> {
    return request<{ series: ReadingSeries; log?: ModerationLog; message?: string }>(
      '/series',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      role
    );
  },

  async deleteSeries(
    seriesId: number,
    role: UserRole
  ): Promise<{ deleted: boolean; series_id: number; log?: ModerationLog }> {
    return request<{ deleted: boolean; series_id: number; log?: ModerationLog }>(
      `/series/${seriesId}`,
      { method: 'DELETE' },
      role
    );
  },

  async createSeriesEntry(
    seriesId: number,
    payload: {
      title: string;
      reference_label?: string;
      entry_number?: number;
      body: string;
    },
    role: UserRole
  ): Promise<{ entry: SeriesEntry; series_id: number; log?: ModerationLog; message?: string }> {
    return request<{ entry: SeriesEntry; series_id: number; log?: ModerationLog; message?: string }>(
      `/series/${seriesId}/entries`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      role
    );
  },

  async updateSeriesEntry(
    seriesId: number,
    entryId: number,
    payload: Partial<SeriesEntry>,
    role: UserRole
  ): Promise<{ entry: SeriesEntry; log?: ModerationLog; message?: string }> {
    return request<{ entry: SeriesEntry; log?: ModerationLog; message?: string }>(
      `/series/${seriesId}/entries/${entryId}`,
      {
        method: 'PUT',
        body: JSON.stringify(payload),
      },
      role
    );
  },

  async deleteSeriesEntry(
    seriesId: number,
    entryId: number,
    role: UserRole
  ): Promise<{ deleted: boolean; series_id: number; entry_id: number; log?: ModerationLog }> {
    return request<{ deleted: boolean; series_id: number; entry_id: number; log?: ModerationLog }>(
      `/series/${seriesId}/entries/${entryId}`,
      { method: 'DELETE' },
      role
    );
  },

  async createFlag(
    payload: {
      target_type: 'WORK' | 'TOPIC' | 'COMMENT';
      target_id: number;
      target_title: string;
      target_excerpt?: string;
      target_author_name?: string;
      reason: FlagReason;
      details?: string;
    },
    role: UserRole
  ): Promise<{ flag: ModerationFlag; log?: ModerationLog }> {
    return request<{ flag: ModerationFlag; log?: ModerationLog }>(
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
  ): Promise<{ flag: ModerationFlag; log?: ModerationLog }> {
    return request<{ flag: ModerationFlag; log?: ModerationLog }>(
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
  ): Promise<{ settings: PlatformSettings; log?: ModerationLog }> {
    return request<{ settings: PlatformSettings; log?: ModerationLog }>(
      '/moderation/settings',
      {
        method: 'PUT',
        body: JSON.stringify(settings),
      },
      role
    );
  },

  // Rede Social (Seguir Pessoas) & Chat Privado
  async getSocialOverview(role: UserRole): Promise<{
    follows: UserFollowRecord[];
    users: User[];
    messages: DirectMessage[];
    unread_count: number;
  }> {
    return request(
      '/social/overview',
      { method: 'GET' },
      role
    );
  },

  async toggleFollowUser(
    targetUserId: number,
    role: UserRole
  ): Promise<{
    following: boolean;
    follower_id: number;
    following_id: number;
    log?: ModerationLog;
    message?: string;
  }> {
    return request(
      `/social/follow/${targetUserId}`,
      { method: 'POST' },
      role
    );
  },

  async sendDirectMessage(
    payload: {
      recipient_id: number;
      body: string;
      shared_type?: 'WORK' | 'TOPIC' | 'SERIES' | 'SERIES_ENTRY' | null;
      shared_slug?: string | null;
      shared_title?: string | null;
    },
    role: UserRole
  ): Promise<{ message_item: DirectMessage; log?: ModerationLog }> {
    return request(
      '/chat/messages',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
      role
    );
  },

  async markConversationRead(
    partnerId: number,
    role: UserRole
  ): Promise<{ read_count: number; partner_id: number }> {
    return request(
      `/chat/messages/${partnerId}/read`,
      { method: 'POST' },
      role
    );
  },

  async deleteDirectMessage(
    messageId: number,
    role: UserRole
  ): Promise<{ deleted: boolean; message_id: number; log?: ModerationLog }> {
    return request(
      `/chat/messages/${messageId}`,
      { method: 'DELETE' },
      role
    );
  },
};
