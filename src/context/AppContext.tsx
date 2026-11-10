import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  User,
  UserRole,
  UserPermissions,
  Category,
  Work,
  Topic,
  Comment,
  ModerationFlag,
  ModerationLog,
  UpvoteRecord,
  PlatformSettings,
  FlagReason,
} from '../types/schema';
import {
  DEMO_USERS,
  INITIAL_CATEGORIES,
  INITIAL_WORKS,
  INITIAL_TOPICS,
  INITIAL_MODERATION_FLAGS,
  INITIAL_SETTINGS,
} from '../data/fallbackData';
import {
  apiService,
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
  computePermissionsForRole,
} from '../services/api';

interface FlagModalTarget {
  target_type: 'WORK' | 'TOPIC' | 'COMMENT';
  target_id: number;
  target_title: string;
  target_excerpt: string;
  target_author_name: string;
}

interface ToastMessage {
  id: number;
  title: string;
  description?: string;
  variant: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  currentUser: User;
  isAuthenticated: boolean;
  permissions: UserPermissions;
  usersList: User[];
  loginWithCredentials: (email: string, password: string) => Promise<User>;
  registerAccount: (payload: {
    name: string;
    email: string;
    password: string;
    title_badge?: string;
    bio?: string;
  }) => Promise<User>;
  logoutUser: () => Promise<void>;
  updateUserProfile: (payload: {
    name: string;
    title_badge?: string;
    bio?: string;
  }) => Promise<void>;
  updateUserRoleRbac: (
    userId: number,
    payload: {
      role?: 'MEMBER' | 'MODERATOR' | 'ADMIN';
      is_banned?: boolean;
      title_badge?: string;
    }
  ) => Promise<void>;
  switchRole: (role: UserRole) => void;
  isDark: boolean;
  toggleDark: () => void;
  categories: Category[];
  works: Work[];
  topics: Topic[];
  moderationFlags: ModerationFlag[];
  moderationLogs: ModerationLog[];
  hasUserUpvoted: (
    targetType: 'WORK' | 'TOPIC' | 'COMMENT',
    targetId: number
  ) => boolean;
  settings: PlatformSettings;
  apiConnected: boolean;
  isLoading: boolean;
  toast: ToastMessage | null;
  showToast: (
    title: string,
    description?: string,
    variant?: 'success' | 'info' | 'warning' | 'error'
  ) => void;
  // Modals
  isNewWorkModalOpen: boolean;
  setIsNewWorkModalOpen: (v: boolean) => void;
  isNewTopicModalOpen: boolean;
  setIsNewTopicModalOpen: (v: boolean) => void;
  flagModalTarget: FlagModalTarget | null;
  setFlagModalTarget: (target: FlagModalTarget | null) => void;
  // Actions
  createWork: (data: Partial<Work>) => Promise<Work>;
  createTopic: (data: Partial<Topic>) => Promise<Topic>;
  addComment: (payload: {
    body: string;
    rating?: number | null;
    work_id?: number | null;
    topic_id?: number | null;
    parent_id?: number | null;
  }) => Promise<void>;
  upvoteItem: (
    targetType: 'TOPIC' | 'COMMENT',
    targetId: number,
    workId?: number
  ) => Promise<void>;
  submitFlag: (reason: FlagReason, details: string) => Promise<void>;
  resolveFlag: (
    flagId: number,
    action: 'APPROVE' | 'HIDE' | 'BAN_USER',
    moderatorNote: string
  ) => Promise<void>;
  moderateWorkStatus: (
    workId: number,
    status: 'APPROVED' | 'REJECTED' | 'HIDDEN',
    note?: string
  ) => Promise<void>;
  moderateTopicStatus: (
    topicId: number,
    status: 'APPROVED' | 'REJECTED' | 'HIDDEN',
    note?: string
  ) => Promise<void>;
  deleteByModerator: (
    targetType: 'WORK' | 'TOPIC' | 'COMMENT',
    targetId: number,
    targetTitle: string,
    reason: string,
    targetAuthorName?: string
  ) => Promise<void>;
  updateGlobalSettings: (newSettings: Partial<PlatformSettings>) => Promise<void>;
  trackAffiliateClick: (workId: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const INITIAL_USERS_LIST: User[] = [
  DEMO_USERS.ADMIN,
  DEMO_USERS.MODERATOR,
  DEMO_USERS.MEMBER,
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    if (token && saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEMO_USERS.VISITOR;
  });

  const [permissions, setPermissions] = useState<UserPermissions>(() =>
    computePermissionsForRole(currentUser.role, currentUser.is_banned)
  );

  const [usersList, setUsersList] = useState<User[]>(INITIAL_USERS_LIST);

  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('veritas_theme') === 'dark';
  });

  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [works, setWorks] = useState<Work[]>(INITIAL_WORKS);
  const [topics, setTopics] = useState<Topic[]>(INITIAL_TOPICS);
  const [moderationFlags, setModerationFlags] = useState<ModerationFlag[]>(
    INITIAL_MODERATION_FLAGS
  );
  const [moderationLogs, setModerationLogs] = useState<ModerationLog[]>([
    {
      id: 1,
      actor_id: 2,
      actor_name: 'Helena Monteiro de Barros',
      actor_role: 'MODERATOR',
      action_type: 'APPROVE_WORK',
      target_type: 'WORK',
      target_id: 1,
      target_title: 'Confissões (Santo Agostinho)',
      target_author_name: 'Prof. Augusto Vasconcelos',
      reason: 'Revisão editorial inicial concluída: tradução e aparato crítico verificados.',
      ip_address: '127.0.0.1',
      created_at: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);
  const [upvotesList, setUpvotesList] = useState<UpvoteRecord[]>(() => {
    const raw = localStorage.getItem('veritas_upvotes');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        // ignore
      }
    }
    return [];
  });
  const [settings, setSettings] = useState<PlatformSettings>(INITIAL_SETTINGS);
  const [apiConnected, setApiConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const [isNewWorkModalOpen, setIsNewWorkModalOpen] = useState(false);
  const [isNewTopicModalOpen, setIsNewTopicModalOpen] = useState(false);
  const [flagModalTarget, setFlagModalTarget] = useState<FlagModalTarget | null>(null);

  const isAuthenticated = currentUser.role !== 'VISITOR' && !currentUser.is_banned;

  const hasUserUpvoted = useCallback(
    (targetType: 'WORK' | 'TOPIC' | 'COMMENT', targetId: number): boolean => {
      if (!isAuthenticated) return false;
      return upvotesList.some(
        (u) =>
          u.user_id === currentUser.id &&
          u.target_type === targetType &&
          u.target_id === targetId
      );
    },
    [isAuthenticated, upvotesList, currentUser.id]
  );

  useEffect(() => {
    localStorage.setItem('veritas_upvotes', JSON.stringify(upvotesList));
  }, [upvotesList]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('veritas_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('veritas_theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    setPermissions(computePermissionsForRole(currentUser.role, currentUser.is_banned));
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(currentUser));
  }, [currentUser]);

  const showToast = useCallback(
    (
      title: string,
      description?: string,
      variant: 'success' | 'info' | 'warning' | 'error' = 'success'
    ) => {
      const id = Date.now();
      setToast({ id, title, description, variant });
      setTimeout(() => {
        setToast((prev) => (prev?.id === id ? null : prev));
      }, 6000);
    },
    []
  );

  // Sync initial data & verify session from Laravel API
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    apiService
      .getBootstrap(currentUser.role)
      .then(async (data) => {
        if (!mounted) return;
        if (data.categories?.length) setCategories(data.categories);
        if (data.works?.length) setWorks(data.works);
        if (data.topics?.length) setTopics(data.topics);
        if (data.moderation_flags) setModerationFlags(data.moderation_flags);
        if (data.moderation_logs) setModerationLogs(data.moderation_logs);
        if (data.upvotes) setUpvotesList(data.upvotes);
        if (data.settings) setSettings(data.settings);
        if (data.users?.length) setUsersList(data.users);
        setApiConnected(true);

        // Fetch users list if Moderator or Admin
        if (currentUser.role === 'ADMIN' || currentUser.role === 'MODERATOR') {
          try {
            const uRes = await apiService.listUsers(currentUser.role);
            if (mounted && uRes.users?.length) {
              setUsersList(uRes.users);
            }
          } catch {
            // ignore
          }
        }
      })
      .catch(() => {
        if (!mounted) return;
        setApiConnected(false);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [currentUser.role]);

  const loginWithCredentials = async (
    email: string,
    password: string
  ): Promise<User> => {
    const res = await apiService.login(email, password);
    localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
    setCurrentUser(res.user);
    setPermissions(res.permissions);
    showToast(
      `Bem-vindo, ${res.user.name}!`,
      `Autenticado com papel RBAC: ${res.user.role}`,
      'success'
    );
    return res.user;
  };

  const registerAccount = async (payload: {
    name: string;
    email: string;
    password: string;
    title_badge?: string;
    bio?: string;
  }): Promise<User> => {
    try {
      const res = await apiService.register(payload);
      localStorage.setItem(TOKEN_STORAGE_KEY, res.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
      setCurrentUser(res.user);
      setPermissions(res.permissions);
      setUsersList((prev) => [...prev, res.user]);
      showToast(
        `Conta criada com sucesso!`,
        `Bem-vindo à cátedra, ${res.user.name} (Papel: ${res.user.role})`,
        'success'
      );
      return res.user;
    } catch (err: any) {
      if (!apiConnected) {
        const fallbackUser: User = {
          id: Date.now(),
          name: payload.name,
          username: payload.name.toLowerCase().replace(/\s+/g, '.'),
          email: payload.email,
          role: 'MEMBER',
          title_badge: payload.title_badge || 'Membro Confrade',
          bio: payload.bio || 'Leitor da comunidade.',
          is_banned: false,
          reputation_score: 50,
          created_at: new Date().toISOString(),
        };
        setCurrentUser(fallbackUser);
        setUsersList((prev) => [...prev, fallbackUser]);
        showToast(`Conta criada: ${fallbackUser.name}`, 'Papel RBAC: MEMBER', 'success');
        return fallbackUser;
      }
      throw err;
    }
  };

  const logoutUser = async () => {
    try {
      if (apiConnected) {
        await apiService.logout();
      }
    } catch {
      // ignore
    }
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(DEMO_USERS.VISITOR));
    setCurrentUser(DEMO_USERS.VISITOR);
    showToast(
      'Sessão encerrada',
      'Você está navegando agora como Visitante (somente leitura).',
      'info'
    );
  };

  const updateUserProfile = async (payload: {
    name: string;
    title_badge?: string;
    bio?: string;
  }) => {
    try {
      if (apiConnected) {
        const res = await apiService.updateProfile(payload, currentUser.role);
        setCurrentUser(res.user);
        setUsersList((prev) =>
          prev.map((u) => (u.id === res.user.id ? res.user : u))
        );
        showToast('Perfil atualizado!', res.message, 'success');
        return;
      }
    } catch (err: any) {
      showToast('Erro ao atualizar perfil', err.message, 'error');
      return;
    }

    const updatedUser: User = {
      ...currentUser,
      name: payload.name,
      title_badge: payload.title_badge ?? currentUser.title_badge,
      bio: payload.bio ?? currentUser.bio,
    };
    setCurrentUser(updatedUser);
    setUsersList((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
    showToast('Perfil atualizado!', 'Suas informações foram salvas.', 'success');
  };

  const updateUserRoleRbac = async (
    userId: number,
    payload: {
      role?: 'MEMBER' | 'MODERATOR' | 'ADMIN';
      is_banned?: boolean;
      title_badge?: string;
    }
  ) => {
    try {
      if (apiConnected) {
        const res = await apiService.updateUserRole(
          userId,
          payload,
          currentUser.role
        );
        setUsersList((prev) =>
          prev.map((u) => (u.id === userId ? res.user : u))
        );
        if (currentUser.id === userId) {
          setCurrentUser(res.user);
        }
        if (res.log) {
          setModerationLogs((prev) => [res.log!, ...prev]);
        }
        showToast('Permissões RBAC Atualizadas', res.message, 'success');
        return;
      }
    } catch (err: any) {
      showToast('Erro de Permissão RBAC', err.message, 'warning');
      return;
    }

    const targetUser = usersList.find((u) => u.id === userId);
    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...payload } : u))
    );
    const localLog: ModerationLog = {
      id: Date.now(),
      actor_id: currentUser.id,
      actor_name: currentUser.name,
      actor_role: currentUser.role,
      action_type:
        payload.is_banned !== undefined
          ? payload.is_banned
            ? 'BAN_USER'
            : 'UNBAN_USER'
          : 'UPDATE_USER_ROLE',
      target_type: 'USER',
      target_id: userId,
      target_title: targetUser ? `${targetUser.name} (${targetUser.email})` : `Usuário #${userId}`,
      target_author_name: targetUser?.name || null,
      reason:
        payload.is_banned !== undefined
          ? payload.is_banned
            ? 'Conta suspensa pelo Administrador.'
            : 'Suspensão revogada pelo Administrador.'
          : `Papel RBAC alterado para ${payload.role}.`,
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString(),
    };
    setModerationLogs((prev) => [localLog, ...prev]);
    showToast(
      'Permissões RBAC Atualizadas',
      'O papel do usuário foi atualizado e registrado no log de auditoria.',
      'success'
    );
  };

  const switchRole = async (role: UserRole) => {
    if (role === 'VISITOR') {
      await logoutUser();
      return;
    }

    const demoUser = DEMO_USERS[role] || DEMO_USERS.MEMBER;
    if (apiConnected && demoUser.email) {
      try {
        await loginWithCredentials(demoUser.email, 'password');
        return;
      } catch {
        // fallback below
      }
    }

    setCurrentUser(demoUser);
    showToast(
      `Sessão alternada: ${demoUser.name}`,
      `Nível RBAC ativo: ${role}`,
      'info'
    );
  };

  const toggleDark = () => setIsDark((prev) => !prev);

  const createWork = async (data: Partial<Work>): Promise<Work> => {
    const effectiveRole: UserRole =
      currentUser.role === 'VISITOR' ? 'MEMBER' : currentUser.role;

    try {
      if (apiConnected) {
        const res = await apiService.createWork(data, effectiveRole);
        const pendingWork: Work = { ...res.work, status: 'PENDING' };
        setWorks((prev) => [pendingWork, ...prev]);
        if (res.flag) {
          setModerationFlags((prev) => [res.flag!, ...prev]);
        }
        showToast(
          'Enviado para Revisão da Moderação!',
          `“${pendingWork.title}” foi salvo e aguarda aprovação de um moderador antes de ficar público.`,
          'info'
        );
        return pendingWork;
      }
    } catch (err: any) {
      if (apiConnected && err?.message && !err.message.includes('Failed to fetch')) {
        showToast(
          'Não foi possível enviar o texto',
          err.message,
          'error'
        );
        throw err;
      }
    }

    const cat =
      categories.find((c) => c.id === Number(data.category_id)) || categories[0];
    const slug =
      (data.title || 'obra')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-') +
      '-' +
      Math.floor(Math.random() * 900 + 100);

    const newWork: Work = {
      id: Date.now(),
      title: data.title || 'Nova Obra Clássica',
      subtitle: data.subtitle || '',
      slug,
      creator: data.creator || 'Autor Clássico',
      media_type: data.media_type || 'BOOK',
      release_year: Number(data.release_year) || 1950,
      category_id: cat.id,
      category: cat,
      cover_url:
        data.cover_url ||
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85',
      synopsis: data.synopsis || '',
      notable_quotes: data.notable_quotes?.length
        ? data.notable_quotes
        : [
            {
              quote_text: 'A beleza é o esplendor da verdade.',
              source_note: 'Escolástica Clássica',
            },
          ],
      affiliate_url:
        data.affiliate_url ||
        'https://www.amazon.com.br/s?k=' + encodeURIComponent(data.title || ''),
      affiliate_cta_label: data.affiliate_cta_label || 'Adquirir na Amazon',
      affiliate_price_hint: data.affiliate_price_hint || 'Edição Recomendada',
      affiliate_clicks_count: 0,
      isbn_or_ref: data.isbn_or_ref || 'Catalogação Editorial',
      publisher_or_studio: data.publisher_or_studio || 'Edição Clássica',
      is_featured: Boolean(data.is_featured),
      editorial_rating: 4.9,
      reviews_count: 0,
      status: 'PENDING',
      submitted_by_id: currentUser.id,
      submitted_by: currentUser,
      comments: [],
      created_at: new Date().toISOString(),
    };

    setWorks((prev) => [newWork, ...prev]);

    const autoFlag: ModerationFlag = {
      id: Date.now() + 1,
      target_type: 'WORK',
      target_id: newWork.id,
      target_title: `Revisão de Nova Obra/Resenha: ${newWork.title}`,
      target_excerpt: newWork.synopsis.slice(0, 180) + '...',
      target_author_id: currentUser.id,
      target_author_name: currentUser.name,
      reporter_id: currentUser.id,
      reporter_name: 'Fila Obrigatória de Revisão Editorial',
      reason: 'BROKEN_AFFILIATE_LINK',
      details:
        'Todo texto publicado aguarda revisão obrigatória da moderação antes de ir ao ar.',
      status: 'PENDING',
      created_at: new Date().toISOString(),
    };
    setModerationFlags((prev) => [autoFlag, ...prev]);

    showToast(
      'Enviado para Revisão da Moderação!',
      `“${newWork.title}” aguarda aprovação de um moderador antes de ficar público.`,
      'info'
    );
    return newWork;
  };

  const createTopic = async (data: Partial<Topic>): Promise<Topic> => {
    const effectiveRole: UserRole =
      currentUser.role === 'VISITOR' ? 'MEMBER' : currentUser.role;

    try {
      if (apiConnected) {
        const res = await apiService.createTopic(data, effectiveRole);
        const pendingTopic: Topic = { ...res.topic, status: 'PENDING' };
        setTopics((prev) => [pendingTopic, ...prev]);
        if (res.flag) {
          setModerationFlags((prev) => [res.flag!, ...prev]);
        }
        showToast(
          'Ensaio enviado para Revisão da Moderação!',
          `“${pendingTopic.title}” aguarda aprovação de um moderador antes de ser publicado.`,
          'info'
        );
        return pendingTopic;
      }
    } catch (err: any) {
      if (apiConnected && err?.message && !err.message.includes('Failed to fetch')) {
        showToast(
          'Não foi possível enviar o ensaio',
          err.message,
          'error'
        );
        throw err;
      }
    }

    const cat =
      categories.find((c) => c.id === Number(data.category_id)) || categories[0];
    const linkedWork = data.work_id
      ? works.find((w) => w.id === Number(data.work_id)) || null
      : null;

    const slug =
      (data.title || 'debate')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-') +
      '-' +
      Math.floor(Math.random() * 900 + 100);

    const newTopic: Topic = {
      id: Date.now(),
      title: data.title || 'Novo Diálogo Comunitário',
      slug,
      excerpt:
        data.excerpt ||
        (data.body ? data.body.replace(/>/g, '').slice(0, 150) + '...' : ''),
      body: data.body || '',
      category_id: cat.id,
      category: cat,
      work_id: linkedWork?.id || null,
      work: linkedWork,
      author_id: currentUser.id,
      author: currentUser,
      is_pinned: false,
      views_count: 1,
      upvotes_count: 1,
      comments_count: 0,
      tags: data.tags?.length ? data.tags : ['Diálogo Clássico'],
      status: 'PENDING',
      comments: [],
      created_at: new Date().toISOString(),
    };

    setTopics((prev) => [newTopic, ...prev]);

    const autoFlag: ModerationFlag = {
      id: Date.now() + 2,
      target_type: 'TOPIC',
      target_id: newTopic.id,
      target_title: `Revisão de Novo Ensaio: ${newTopic.title}`,
      target_excerpt: newTopic.excerpt,
      target_author_id: currentUser.id,
      target_author_name: currentUser.name,
      reporter_id: currentUser.id,
      reporter_name: 'Fila Obrigatória de Revisão Editorial',
      reason: 'GUIDELINE_VIOLATION',
      details:
        'Todo ensaio publicado aguarda revisão obrigatória da moderação antes de ir ao ar.',
      status: 'PENDING',
      created_at: new Date().toISOString(),
    };
    setModerationFlags((prev) => [autoFlag, ...prev]);

    showToast(
      'Ensaio enviado para Revisão da Moderação!',
      `“${newTopic.title}” aguarda aprovação de um moderador antes de ser publicado.`,
      'info'
    );
    return newTopic;
  };

  const insertReplyIntoTree = (
    list: Comment[],
    parentId: number,
    newComment: Comment
  ): Comment[] => {
    return list.map((item) => {
      if (item.id === parentId) {
        return {
          ...item,
          replies: [...(item.replies || []), newComment],
        };
      }
      if (item.replies && item.replies.length > 0) {
        return {
          ...item,
          replies: insertReplyIntoTree(item.replies, parentId, newComment),
        };
      }
      return item;
    });
  };

  const addComment = async (payload: {
    body: string;
    rating?: number | null;
    work_id?: number | null;
    topic_id?: number | null;
    parent_id?: number | null;
  }) => {
    if (!isAuthenticated || !permissions.can_comment) {
      showToast(
        'Conta necessária para comentar',
        'Para curtir e comentar é necessário ter uma conta e estar autenticado.',
        'warning'
      );
      return;
    }

    let createdComment: Comment | null = null;

    try {
      if (apiConnected) {
        const res = await apiService.createComment(payload, currentUser.role);
        createdComment = res.comment;
      }
    } catch (err: any) {
      if (apiConnected && err?.message && !err.message.includes('Failed to fetch')) {
        showToast('Não foi possível comentar', err.message, 'error');
        return;
      }
    }

    if (!createdComment) {
      createdComment = {
        id: Date.now(),
        body: payload.body,
        rating: payload.rating || null,
        work_id: payload.work_id || null,
        topic_id: payload.topic_id || null,
        parent_id: payload.parent_id || null,
        author_id: currentUser.id,
        author: currentUser,
        upvotes_count: 1,
        status: 'APPROVED',
        replies: [],
        created_at: new Date().toISOString(),
      };
    }

    if (payload.work_id) {
      setWorks((prev) =>
        prev.map((w) => {
          if (w.id !== payload.work_id) return w;
          const existing = w.comments || [];
          const updatedComments = payload.parent_id
            ? insertReplyIntoTree(existing, payload.parent_id, createdComment!)
            : [createdComment!, ...existing];
          return {
            ...w,
            reviews_count: w.reviews_count + 1,
            comments: updatedComments,
          };
        })
      );
    }

    if (payload.topic_id) {
      setTopics((prev) =>
        prev.map((t) => {
          if (t.id !== payload.topic_id) return t;
          const existing = t.comments || [];
          const updatedComments = payload.parent_id
            ? insertReplyIntoTree(existing, payload.parent_id, createdComment!)
            : [createdComment!, ...existing];
          return {
            ...t,
            comments_count: t.comments_count + 1,
            comments: updatedComments,
          };
        })
      );
    }

    showToast(
      payload.parent_id
        ? 'Resposta publicada na thread'
        : 'Comentário / Resenha publicado',
      'Sua contribuição foi integrada ao diálogo.',
      'success'
    );
  };

  const incrementCommentUpvote = (list: Comment[], commentId: number): Comment[] =>
    list.map((c) => {
      if (c.id === commentId) {
        return { ...c, upvotes_count: c.upvotes_count + 1 };
      }
      if (c.replies?.length) {
        return { ...c, replies: incrementCommentUpvote(c.replies, commentId) };
      }
      return c;
    });

  const upvoteItem = async (targetType: 'TOPIC' | 'COMMENT', targetId: number) => {
    if (!isAuthenticated) {
      showToast(
        'Conta necessária para curtir',
        'Para curtir e comentar é necessário ter uma conta e estar autenticado.',
        'warning'
      );
      return;
    }

    if (hasUserUpvoted(targetType, targetId)) {
      showToast(
        'Curtida já registrada',
        'Cada usuário só pode dar curtida uma única vez neste item.',
        'info'
      );
      return;
    }

    try {
      if (apiConnected) {
        await apiService.toggleUpvote(targetType, targetId, currentUser.role);
      }
    } catch (err: any) {
      if (err?.message && err.message.includes('já deu curtida')) {
        setUpvotesList((prev) => [
          ...prev,
          {
            user_id: currentUser.id,
            target_type: targetType,
            target_id: targetId,
          },
        ]);
        showToast(
          'Curtida já registrada',
          'Cada usuário só pode dar curtida uma única vez neste item.',
          'info'
        );
        return;
      }
      if (apiConnected && err?.message && !err.message.includes('Failed to fetch')) {
        showToast('Não foi possível curtir', err.message, 'warning');
        return;
      }
    }

    setUpvotesList((prev) => [
      ...prev,
      {
        user_id: currentUser.id,
        target_type: targetType,
        target_id: targetId,
      },
    ]);

    if (targetType === 'TOPIC') {
      setTopics((prev) =>
        prev.map((t) =>
          t.id === targetId ? { ...t, upvotes_count: t.upvotes_count + 1 } : t
        )
      );
    } else {
      setWorks((prev) =>
        prev.map((w) => ({
          ...w,
          comments: incrementCommentUpvote(w.comments || [], targetId),
        }))
      );
      setTopics((prev) =>
        prev.map((t) => ({
          ...t,
          comments: incrementCommentUpvote(t.comments || [], targetId),
        }))
      );
    }
  };

  const submitFlag = async (reason: FlagReason, details: string) => {
    if (!flagModalTarget) return;

    try {
      if (apiConnected) {
        const res = await apiService.createFlag(
          {
            ...flagModalTarget,
            reason,
            details,
          },
          currentUser.role
        );
        setModerationFlags((prev) => [res.flag, ...prev]);
        setFlagModalTarget(null);
        showToast(
          'Sinalização enviada à Moderação',
          'O Conselho Editorial analisará o item reportado.',
          'info'
        );
        return;
      }
    } catch {
      // Fallback local
    }

    const newFlag: ModerationFlag = {
      id: Date.now(),
      target_type: flagModalTarget.target_type,
      target_id: flagModalTarget.target_id,
      target_title: flagModalTarget.target_title,
      target_excerpt: flagModalTarget.target_excerpt,
      target_author_id: 99,
      target_author_name: flagModalTarget.target_author_name,
      reporter_id: currentUser.id,
      reporter_name: currentUser.name,
      reason,
      details,
      status: 'PENDING',
      created_at: new Date().toISOString(),
    };

    setModerationFlags((prev) => [newFlag, ...prev]);
    setFlagModalTarget(null);
    showToast(
      'Item sinalizado para a Fila de Moderação',
      'Os moderadores foram notificados.',
      'info'
    );
  };

  const resolveFlag = async (
    flagId: number,
    action: 'APPROVE' | 'HIDE' | 'BAN_USER',
    moderatorNote: string
  ) => {
    let serverLog: ModerationLog | undefined;
    try {
      if (apiConnected) {
        const res = await apiService.resolveModerationFlag(
          flagId,
          action,
          moderatorNote,
          currentUser.role
        );
        serverLog = res.log;
      }
    } catch (err: any) {
      showToast('Acesso Restrito (RBAC)', err.message, 'warning');
      return;
    }

    const targetFlag = moderationFlags.find((f) => f.id === flagId);

    setModerationFlags((prev) =>
      prev.map((f) => {
        if (f.id !== flagId) return f;
        const statusMap = {
          APPROVE: 'RESOLVED_APPROVED' as const,
          HIDE: 'RESOLVED_HIDDEN' as const,
          BAN_USER: 'RESOLVED_BANNED' as const,
        };
        return {
          ...f,
          status: statusMap[action],
          moderator_note:
            moderatorNote ||
            (action === 'APPROVE'
              ? 'Conteúdo aprovado em conformidade com a Carta de Princípios.'
              : action === 'HIDE'
              ? 'Conteúdo ocultado (soft delete) por descumprimento editorial.'
              : 'Usuário banido e conteúdo removido por violação grave.'),
          resolved_at: new Date().toISOString(),
        };
      })
    );

    if (targetFlag) {
      const nextStatus = action === 'APPROVE' ? 'APPROVED' : 'HIDDEN';
      if (targetFlag.target_type === 'WORK') {
        setWorks((prev) =>
          prev.map((w) =>
            w.id === targetFlag.target_id
              ? { ...w, status: nextStatus, moderation_note: moderatorNote }
              : w
          )
        );
      } else if (targetFlag.target_type === 'TOPIC') {
        setTopics((prev) =>
          prev.map((t) =>
            t.id === targetFlag.target_id
              ? { ...t, status: nextStatus, moderation_note: moderatorNote }
              : t
          )
        );
      }
    }

    if (serverLog) {
      setModerationLogs((prev) => [serverLog!, ...prev]);
    } else if (targetFlag) {
      const fallbackLog: ModerationLog = {
        id: Date.now(),
        actor_id: currentUser.id,
        actor_name: currentUser.name,
        actor_role: currentUser.role,
        action_type: `RESOLVE_FLAG_${action}`,
        target_type: targetFlag.target_type,
        target_id: targetFlag.target_id,
        target_title: targetFlag.target_title,
        target_author_name: targetFlag.target_author_name,
        reason: moderatorNote || 'Deliberação registrada na fila de moderação.',
        ip_address: '127.0.0.1',
        created_at: new Date().toISOString(),
      };
      setModerationLogs((prev) => [fallbackLog, ...prev]);
    }

    const actionLabels = {
      APPROVE: 'Item Aprovado e Mantido',
      HIDE: 'Conteúdo Ocultado (Soft Delete)',
      BAN_USER: 'Autor Banido e Conteúdo Ocultado',
    };
    showToast(actionLabels[action], moderatorNote || 'Decisão registrada no log.', 'info');
  };

  const moderateWorkStatus = async (
    workId: number,
    status: 'APPROVED' | 'REJECTED' | 'HIDDEN',
    note?: string
  ) => {
    let serverLog: ModerationLog | undefined;
    try {
      if (apiConnected) {
        const res = await apiService.moderateWorkStatus(
          workId,
          status,
          note || 'Revisado pela Moderação.',
          currentUser.role
        );
        serverLog = res.log;
      }
    } catch (err: any) {
      showToast('Acesso Restrito (RBAC)', err.message, 'error');
      return;
    }

    const targetWork = works.find((w) => w.id === workId);

    setWorks((prev) =>
      prev.map((w) =>
        w.id === workId ? { ...w, status, moderation_note: note } : w
      )
    );

    setModerationFlags((prev) =>
      prev.map((f) =>
        f.target_type === 'WORK' && f.target_id === workId && f.status === 'PENDING'
          ? {
              ...f,
              status: status === 'APPROVED' ? 'RESOLVED_APPROVED' : 'RESOLVED_HIDDEN',
              moderator_note: note || 'Revisado pela Moderação.',
              resolved_at: new Date().toISOString(),
            }
          : f
      )
    );

    if (serverLog) {
      setModerationLogs((prev) => [serverLog!, ...prev]);
    } else if (targetWork) {
      setModerationLogs((prev) => [
        {
          id: Date.now(),
          actor_id: currentUser.id,
          actor_name: currentUser.name,
          actor_role: currentUser.role,
          action_type: status === 'APPROVED' ? 'APPROVE_WORK' : 'REJECT_WORK',
          target_type: 'WORK',
          target_id: workId,
          target_title: targetWork.title,
          target_author_name: targetWork.submitted_by?.name || targetWork.creator,
          reason: note || 'Revisado pela Moderação.',
          ip_address: '127.0.0.1',
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    showToast(
      status === 'APPROVED'
        ? 'Texto aprovado e publicado no Feed!'
        : 'Texto reprovado / ocultado pela Moderação',
      note || 'Decisão da moderação registrada no Log de Auditoria.',
      status === 'APPROVED' ? 'success' : 'warning'
    );
  };

  const moderateTopicStatus = async (
    topicId: number,
    status: 'APPROVED' | 'REJECTED' | 'HIDDEN',
    note?: string
  ) => {
    let serverLog: ModerationLog | undefined;
    try {
      if (apiConnected) {
        const res = await apiService.moderateTopicStatus(
          topicId,
          status,
          note || 'Revisado pela Moderação.',
          currentUser.role
        );
        serverLog = res.log;
      }
    } catch (err: any) {
      showToast('Acesso Restrito (RBAC)', err.message, 'error');
      return;
    }

    const targetTopic = topics.find((t) => t.id === topicId);

    setTopics((prev) =>
      prev.map((t) =>
        t.id === topicId ? { ...t, status, moderation_note: note } : t
      )
    );

    setModerationFlags((prev) =>
      prev.map((f) =>
        f.target_type === 'TOPIC' && f.target_id === topicId && f.status === 'PENDING'
          ? {
              ...f,
              status: status === 'APPROVED' ? 'RESOLVED_APPROVED' : 'RESOLVED_HIDDEN',
              moderator_note: note || 'Revisado pela Moderação.',
              resolved_at: new Date().toISOString(),
            }
          : f
      )
    );

    if (serverLog) {
      setModerationLogs((prev) => [serverLog!, ...prev]);
    } else if (targetTopic) {
      setModerationLogs((prev) => [
        {
          id: Date.now(),
          actor_id: currentUser.id,
          actor_name: currentUser.name,
          actor_role: currentUser.role,
          action_type: status === 'APPROVED' ? 'APPROVE_TOPIC' : 'REJECT_TOPIC',
          target_type: 'TOPIC',
          target_id: topicId,
          target_title: targetTopic.title,
          target_author_name: targetTopic.author?.name || 'Autor',
          reason: note || 'Revisado pela Moderação.',
          ip_address: '127.0.0.1',
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
    }

    showToast(
      status === 'APPROVED'
        ? 'Ensaio aprovado e publicado no Feed!'
        : 'Ensaio reprovado / ocultado pela Moderação',
      note || 'Decisão da moderação registrada no Log de Auditoria.',
      status === 'APPROVED' ? 'success' : 'warning'
    );
  };

  const removeCommentFromTree = (list: Comment[], commentId: number): Comment[] =>
    list
      .filter((c) => c.id !== commentId)
      .map((c) => ({
        ...c,
        replies: c.replies?.length ? removeCommentFromTree(c.replies, commentId) : [],
      }));

  const deleteByModerator = async (
    targetType: 'WORK' | 'TOPIC' | 'COMMENT',
    targetId: number,
    targetTitle: string,
    reason: string,
    targetAuthorName?: string
  ) => {
    if (!permissions.can_moderate_queue) {
      showToast(
        'Acesso negado (RBAC)',
        'Apenas Moderadores e Administradores podem excluir conteúdos.',
        'error'
      );
      return;
    }

    const cleanReason = reason.trim();
    if (cleanReason.length < 3) {
      showToast(
        'Justificativa obrigatória',
        'Informe o motivo da exclusão (mínimo de 3 caracteres) para registro no Log de Auditoria.',
        'warning'
      );
      return;
    }

    let serverLog: ModerationLog | undefined;
    try {
      if (apiConnected) {
        const res = await apiService.deleteContentByModerator(
          {
            target_type: targetType,
            target_id: targetId,
            reason: cleanReason,
          },
          currentUser.role
        );
        serverLog = res.log;
      }
    } catch (err: any) {
      showToast('Erro ao excluir item', err.message, 'error');
      return;
    }

    if (targetType === 'WORK') {
      setWorks((prev) => prev.filter((w) => w.id !== targetId));
    } else if (targetType === 'TOPIC') {
      setTopics((prev) => prev.filter((t) => t.id !== targetId));
    } else if (targetType === 'COMMENT') {
      setWorks((prev) =>
        prev.map((w) => {
          const beforeCount = JSON.stringify(w.comments || []).length;
          const nextComments = removeCommentFromTree(w.comments || [], targetId);
          const changed = JSON.stringify(nextComments).length !== beforeCount;
          return {
            ...w,
            reviews_count: changed ? Math.max(0, w.reviews_count - 1) : w.reviews_count,
            comments: nextComments,
          };
        })
      );
      setTopics((prev) =>
        prev.map((t) => {
          const beforeCount = JSON.stringify(t.comments || []).length;
          const nextComments = removeCommentFromTree(t.comments || [], targetId);
          const changed = JSON.stringify(nextComments).length !== beforeCount;
          return {
            ...t,
            comments_count: changed ? Math.max(0, t.comments_count - 1) : t.comments_count,
            comments: nextComments,
          };
        })
      );
    }

    setModerationFlags((prev) =>
      prev.map((f) =>
        f.target_type === targetType && f.target_id === targetId && f.status === 'PENDING'
          ? {
              ...f,
              status: 'RESOLVED_HIDDEN',
              moderator_note: `Excluído pela Moderação: ${cleanReason}`,
              resolved_at: new Date().toISOString(),
            }
          : f
      )
    );

    const logEntry: ModerationLog = serverLog || {
      id: Date.now(),
      actor_id: currentUser.id,
      actor_name: currentUser.name,
      actor_role: currentUser.role,
      action_type: `DELETE_${targetType}`,
      target_type: targetType,
      target_id: targetId,
      target_title: targetTitle,
      target_author_name: targetAuthorName || 'Membro da Comunidade',
      reason: cleanReason,
      ip_address: '127.0.0.1',
      created_at: new Date().toISOString(),
    };

    setModerationLogs((prev) => [logEntry, ...prev]);

    showToast(
      'Conteúdo excluído pela Moderação',
      `Exclusão registrada no Log de Auditoria por ${currentUser.name}.`,
      'warning'
    );
  };

  const updateGlobalSettings = async (newSettings: Partial<PlatformSettings>) => {
    try {
      if (apiConnected) {
        const res = await apiService.updateSettings(newSettings, currentUser.role);
        setSettings(res.settings);
        if (res.log) {
          setModerationLogs((prev) => [res.log!, ...prev]);
        }
        showToast(
          'Configurações Globais Atualizadas',
          `Tag Amazon ativa: ${res.settings.amazon_associate_tag}`,
          'success'
        );
        return;
      }
    } catch (err: any) {
      showToast('Acesso Restrito (RBAC)', err.message, 'warning');
      return;
    }

    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      showToast(
        'Configurações Globais Atualizadas',
        `Tag Amazon ativa: ${updated.amazon_associate_tag}`,
        'success'
      );
      return updated;
    });
  };

  const trackAffiliateClick = (workId: number) => {
    setWorks((prev) =>
      prev.map((w) =>
        w.id === workId
          ? { ...w, affiliate_clicks_count: w.affiliate_clicks_count + 1 }
          : w
      )
    );
    if (apiConnected) {
      apiService.trackAffiliateClick(workId, currentUser.role).catch(() => {});
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        permissions,
        usersList,
        loginWithCredentials,
        registerAccount,
        logoutUser,
        updateUserProfile,
        updateUserRoleRbac,
        switchRole,
        isDark,
        toggleDark,
        categories,
        works,
        topics,
        moderationFlags,
        moderationLogs,
        hasUserUpvoted,
        settings,
        apiConnected,
        isLoading,
        toast,
        showToast,
        isNewWorkModalOpen,
        setIsNewWorkModalOpen,
        isNewTopicModalOpen,
        setIsNewTopicModalOpen,
        flagModalTarget,
        setFlagModalTarget,
        createWork,
        createTopic,
        addComment,
        upvoteItem,
        submitFlag,
        resolveFlag,
        moderateWorkStatus,
        moderateTopicStatus,
        deleteByModerator,
        updateGlobalSettings,
        trackAffiliateClick,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
