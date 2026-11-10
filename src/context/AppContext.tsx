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
  ) => void;
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
  const [settings, setSettings] = useState<PlatformSettings>(INITIAL_SETTINGS);
  const [apiConnected, setApiConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const [isNewWorkModalOpen, setIsNewWorkModalOpen] = useState(false);
  const [isNewTopicModalOpen, setIsNewTopicModalOpen] = useState(false);
  const [flagModalTarget, setFlagModalTarget] = useState<FlagModalTarget | null>(null);

  const isAuthenticated = currentUser.role !== 'VISITOR' && !currentUser.is_banned;

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
        if (data.settings) setSettings(data.settings);
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
        showToast('Permissões RBAC Atualizadas', res.message, 'success');
        return;
      }
    } catch (err: any) {
      showToast('Erro de Permissão RBAC', err.message, 'warning');
      return;
    }

    setUsersList((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, ...payload } : u))
    );
    showToast(
      'Permissões RBAC Atualizadas',
      'O papel do usuário foi atualizado com sucesso.',
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
        const approvedWork: Work = { ...res.work, status: 'APPROVED' };
        setWorks((prev) => [approvedWork, ...prev]);
        if (res.flag) {
          setModerationFlags((prev) => [res.flag!, ...prev]);
        }
        showToast(
          'Publicação realizada com sucesso!',
          `“${approvedWork.title}” já está disponível no catálogo e no feed.`,
          'success'
        );
        return approvedWork;
      }
    } catch (err: any) {
      if (apiConnected && err?.message && !err.message.includes('Failed to fetch')) {
        showToast(
          'Não foi possível publicar',
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
      status: 'APPROVED',
      submitted_by_id: currentUser.id,
      submitted_by: currentUser,
      comments: [],
      created_at: new Date().toISOString(),
    };

    setWorks((prev) => [newWork, ...prev]);

    showToast(
      'Publicação realizada com sucesso!',
      `“${newWork.title}” já está disponível no catálogo e no feed.`,
      'success'
    );
    return newWork;
  };

  const createTopic = async (data: Partial<Topic>): Promise<Topic> => {
    const effectiveRole: UserRole =
      currentUser.role === 'VISITOR' ? 'MEMBER' : currentUser.role;

    try {
      if (apiConnected) {
        const res = await apiService.createTopic(data, effectiveRole);
        setTopics((prev) => [res.topic, ...prev]);
        showToast(
          'Ensaio publicado com sucesso!',
          `“${res.topic.title}” já está aberto para leitura e comentários.`,
          'success'
        );
        return res.topic;
      }
    } catch (err: any) {
      if (apiConnected && err?.message && !err.message.includes('Failed to fetch')) {
        showToast(
          'Não foi possível publicar o ensaio',
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
      status: 'APPROVED',
      comments: [],
      created_at: new Date().toISOString(),
    };

    setTopics((prev) => [newTopic, ...prev]);
    showToast('Ensaio publicado na Cátedra Comunitária', newTopic.title, 'success');
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
    let createdComment: Comment | null = null;

    try {
      if (apiConnected) {
        const res = await apiService.createComment(payload, currentUser.role);
        createdComment = res.comment;
      }
    } catch {
      // Fallback local creation
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
    try {
      if (apiConnected) {
        await apiService.toggleUpvote(targetType, targetId, currentUser.role);
      }
    } catch {
      // ignore
    }

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
    try {
      if (apiConnected) {
        await apiService.resolveModerationFlag(
          flagId,
          action,
          moderatorNote,
          currentUser.role
        );
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

    const actionLabels = {
      APPROVE: 'Item Aprovado e Mantido',
      HIDE: 'Conteúdo Ocultado (Soft Delete)',
      BAN_USER: 'Autor Banido e Conteúdo Ocultado',
    };
    showToast(actionLabels[action], moderatorNote || 'Decisão registrada.', 'info');
  };

  const moderateWorkStatus = (
    workId: number,
    status: 'APPROVED' | 'REJECTED' | 'HIDDEN',
    note?: string
  ) => {
    setWorks((prev) =>
      prev.map((w) =>
        w.id === workId ? { ...w, status, moderation_note: note } : w
      )
    );
    showToast(
      `Status da Obra atualizado: ${status}`,
      note || 'Registro de curadoria salvo.',
      'info'
    );
  };

  const updateGlobalSettings = async (newSettings: Partial<PlatformSettings>) => {
    try {
      if (apiConnected) {
        const res = await apiService.updateSettings(newSettings, currentUser.role);
        setSettings(res.settings);
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
        updateUserRoleRbac,
        switchRole,
        isDark,
        toggleDark,
        categories,
        works,
        topics,
        moderationFlags,
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
