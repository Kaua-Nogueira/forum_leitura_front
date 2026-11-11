import {
  User,
  Category,
  Work,
  Topic,
  ModerationFlag,
  PlatformSettings,
} from '../types/schema';

export const INITIAL_SETTINGS: PlatformSettings = {
  amazon_associate_tag: 'veritaslitterae-20',
  default_affiliate_disclaimer:
    'Comprando por este link, você apoia a curadoria e manutenção editorial deste projeto sem custo adicional.',
  require_moderation_for_new_works: true,
  editorial_edition_label: 'Edição de Outono • Vol. IV — MMXXVI',
};

export const DEMO_USERS: Record<string, User> = {
  ADMIN: {
    id: 1,
    name: 'Prof. Augusto Vasconcelos',
    username: 'augusto.vasconcelos',
    email: 'augusto@veritaslitterae.org',
    role: 'ADMIN',
    title_badge: 'Editor-Chefe & Curador Patrístico',
    bio: 'Doutor em Letras Clássicas e pesquisador da tradição agostiniana e do Trivium.',
    is_banned: false,
    reputation_score: 1420,
    created_at: '2025-01-10T10:00:00Z',
  },
  MODERATOR: {
    id: 2,
    name: 'Helena Monteiro de Barros',
    username: 'helena.barros',
    email: 'helena@veritaslitterae.org',
    role: 'MODERATOR',
    title_badge: 'Moderadora • Educação Clássica',
    bio: 'Preceptora de Artes Liberais, tradutora de latim e estudiosa de Charlotte Mason e Dorothy Sayers.',
    is_banned: false,
    reputation_score: 980,
    created_at: '2025-02-14T14:30:00Z',
  },
  MEMBER: {
    id: 3,
    name: 'Lucas Albuquerque',
    username: 'lucas.albuquerque',
    email: 'lucas@leitor.org',
    role: 'MEMBER',
    title_badge: 'Membro Confrade • Crítica Literária',
    bio: 'Ensaísta e entusiasta da literatura russa, dos Inklings e do cinema contemplativo.',
    is_banned: false,
    reputation_score: 430,
    created_at: '2025-05-01T09:15:00Z',
  },
  MOD_EDITORIAL: {
    id: 5,
    name: 'Moderador Editorial',
    username: 'moderador.veritas',
    email: 'mod@veritas.com',
    role: 'MODERATOR',
    title_badge: 'Conselho de Moderação • Revisão Editorial',
    bio: 'Responsável pela revisão e aprovação das resenhas e ensaios submetidos pelos membros.',
    is_banned: false,
    reputation_score: 1100,
    created_at: '2026-11-10T15:23:31Z',
  },
  ADMIN_GERAL: {
    id: 6,
    name: 'Administrador Geral',
    username: 'admin.veritas',
    email: 'admin@veritas.com',
    role: 'ADMIN',
    title_badge: 'Administrador & Editor-Chefe',
    bio: 'Gestão de papéis RBAC, curadoria e configurações globais.',
    is_banned: false,
    reputation_score: 1500,
    created_at: '2026-11-10T15:23:31Z',
  },
  VISITOR: {
    id: 0,
    name: 'Leitor Visitante',
    username: 'visitante',
    email: '',
    role: 'VISITOR',
    title_badge: 'Visitante do Átrio',
    bio: 'Navegando pelo acervo público e diálogos comunitários.',
    is_banned: false,
    reputation_score: 0,
    created_at: '2026-01-01T00:00:00Z',
  },
};

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 1,
    name: 'Letras & Teologia',
    slug: 'letras-teologia',
    latin_motto: 'Fides quaerens intellectum',
    description:
      'Patrística, teologia histórica, clássicos da literatura universal, devocionais seculares e ficção mitopoética.',
    accent_color: 'burgundy',
    icon_name: 'BookOpen',
    works_count: 0,
    topics_count: 0,
  },
  {
    id: 2,
    name: 'Educação & Mente',
    slug: 'educacao-mente',
    latin_motto: 'Artes Liberales & Paideia',
    description:
      'Educação clássica cristã, Trivium e Quadrivium, formação do imaginário moral, pedagogia de Charlotte Mason e homeschooling.',
    accent_color: 'forest',
    icon_name: 'GraduationCap',
    works_count: 0,
    topics_count: 0,
  },
  {
    id: 3,
    name: 'Sétima Arte & Música',
    slug: 'setima-arte-musica',
    latin_motto: 'Pulchritudo & Contemplatio',
    description:
      'Cinema de alta densidade espiritual, documentários históricos, polifonia sacra, artes plásticas e estética do belo.',
    accent_color: 'navy',
    icon_name: 'Film',
    works_count: 0,
    topics_count: 0,
  },
  {
    id: 4,
    name: 'Diálogos Abertos',
    slug: 'dialogos-abertos',
    latin_motto: 'In necessariis unitas, in dubiis libertas',
    description:
      'Colóquios interdisciplinares, filosofia pública, cultura contemporânea, vocação intelectual e ética cristã.',
    accent_color: 'gold',
    icon_name: 'MessageSquareQuote',
    works_count: 0,
    topics_count: 0,
  },
];

export const INITIAL_WORKS: Work[] = [];

export const INITIAL_TOPICS: Topic[] = [];

export const INITIAL_MODERATION_FLAGS: ModerationFlag[] = [];
