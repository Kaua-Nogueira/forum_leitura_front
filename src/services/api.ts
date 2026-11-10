import {
  Work,
  Topic,
  Comment,
  Category,
  ModerationFlag,
  PlatformSettings,
  UserRole,
  FlagReason,
} from '../types/schema';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

/**
 * Injetor e Normalizador Dinâmico de Tag de Afiliado Amazon
 * Garante que qualquer link de afiliado receba a tag global configurada pelo Admin
 */
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

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  currentRole: UserRole = 'ADMIN'
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Demo-Role': currentRole,
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.message || `API Error: ${response.status}`);
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

  async trackAffiliateClick(workId: number, role: UserRole): Promise<{ clicks_count: number }> {
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
