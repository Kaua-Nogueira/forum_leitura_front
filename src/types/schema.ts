/**
 * ============================================================================
 * VERITAS & LITTERAE — Esquema de Dados, Autenticação e RBAC (Frontend TypeScript)
 * Espelha as tabelas e modelos Eloquent da API Laravel (Desacoplada)
 * ============================================================================
 */

export type UserRole = 'VISITOR' | 'MEMBER' | 'MODERATOR' | 'ADMIN';

export type MediaType = 'BOOK' | 'FILM' | 'DOCUMENTARY' | 'ESSAY' | 'SACRED_ART';

export type ModerationStatus = 'APPROVED' | 'PENDING' | 'REJECTED' | 'HIDDEN';

export type FlagReason =
  | 'INAPPROPRIATE_CONTENT'
  | 'SPAM'
  | 'UNETHICAL_CONDUCT'
  | 'GUIDELINE_VIOLATION'
  | 'IRREVERENCE'
  | 'BROKEN_AFFILIATE_LINK';

export interface UserPermissions {
  can_create_work: boolean;
  can_create_topic: boolean;
  can_comment: boolean;
  can_publish_directly: boolean;
  can_moderate_queue: boolean;
  can_ban_users: boolean;
  can_manage_affiliate_settings: boolean;
  can_manage_roles: boolean;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  bio?: string;
  title_badge?: string;
  is_banned: boolean;
  reputation_score: number;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  permissions: UserPermissions;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  latin_motto: string;
  description: string;
  accent_color: 'burgundy' | 'forest' | 'navy' | 'gold';
  icon_name: string;
  works_count?: number;
  topics_count?: number;
}

export interface WorkQuote {
  id?: number;
  quote_text: string;
  source_note: string;
}

export interface Work {
  id: number;
  title: string;
  subtitle?: string;
  slug: string;
  creator: string;
  media_type: MediaType;
  release_year: number;
  category_id: number;
  category?: Category;
  cover_url: string;
  synopsis: string;
  notable_quotes: WorkQuote[];
  affiliate_url: string;
  affiliate_cta_label: string;
  affiliate_price_hint?: string;
  affiliate_clicks_count: number;
  isbn_or_ref?: string;
  publisher_or_studio?: string;
  is_featured: boolean;
  editorial_rating: number;
  reviews_count: number;
  status: ModerationStatus;
  submitted_by_id: number;
  submitted_by?: User;
  moderation_note?: string;
  comments?: Comment[];
  created_at: string;
}

export interface Topic {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  category_id: number;
  category?: Category;
  work_id?: number | null;
  work?: Work | null;
  author_id: number;
  author: User;
  is_pinned: boolean;
  views_count: number;
  upvotes_count: number;
  comments_count: number;
  tags: string[];
  status: ModerationStatus;
  moderation_note?: string;
  comments?: Comment[];
  created_at: string;
}

export interface Comment {
  id: number;
  body: string;
  rating?: number | null;
  work_id?: number | null;
  topic_id?: number | null;
  parent_id?: number | null;
  author_id: number;
  author: User;
  upvotes_count: number;
  status: ModerationStatus;
  moderation_note?: string;
  replies?: Comment[];
  created_at: string;
}

export interface ModerationFlag {
  id: number;
  target_type: 'WORK' | 'TOPIC' | 'COMMENT';
  target_id: number;
  target_title: string;
  target_excerpt: string;
  target_author_id?: number | null;
  target_author_name: string;
  reporter_id?: number | null;
  reporter_name: string;
  reason: FlagReason;
  details: string;
  status: 'PENDING' | 'RESOLVED_APPROVED' | 'RESOLVED_HIDDEN' | 'RESOLVED_BANNED';
  moderator_note?: string;
  resolved_at?: string;
  created_at: string;
}

export interface PlatformSettings {
  amazon_associate_tag: string;
  default_affiliate_disclaimer: string;
  require_moderation_for_new_works: boolean;
  editorial_edition_label: string;
}

export interface UpvoteRecord {
  user_id: number;
  target_type: 'WORK' | 'TOPIC' | 'COMMENT';
  target_id: number;
}

export interface ModerationLog {
  id: number;
  actor_id: number;
  actor_name: string;
  actor_role: UserRole;
  action_type: string;
  target_type: 'WORK' | 'TOPIC' | 'COMMENT' | 'USER' | 'SETTINGS';
  target_id?: number | null;
  target_title: string;
  target_author_name?: string | null;
  reason?: string | null;
  ip_address?: string | null;
  created_at: string;
}
