import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  User as UserIcon,
  BookOpen,
  BookMarked,
  FileText,
  MessageSquare,
  Feather,
  Calendar,
  Award,
  Edit3,
  Check,
  X,
  Clock,
  Star,
  ThumbsUp,
  ArrowRight,
  LogIn,
  Trash2,
  Camera,
  Image as ImageIcon,
  UserPlus,
  UserCheck,
  Users,
  Crop,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Comment, Work, Topic, ReadingSeries } from '../types/schema';
import { RichTextRenderer, getReadingMetrics } from '../components/RichTextRenderer';
import { ImageCropModal } from '../components/ImageCropModal';

interface FlattenedUserComment {
  comment: Comment;
  targetType: 'WORK' | 'TOPIC' | 'SERIES_ENTRY';
  targetTitle: string;
  targetSlug: string;
  targetSubtitle?: string;
}

function normalizeName(s?: string | null): string {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo de imagem.'));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

const COVER_PRESETS = [
  {
    label: 'Biblioteca Clássica',
    url: 'https://images.unsplash.com/photo-1507842229356-51c61504d3ab?auto=format&fit=crop&w=1920&q=92',
  },
  {
    label: 'Scriptorium & Manuscritos',
    url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=1920&q=92',
  },
  {
    label: 'Catedral & Luz',
    url: 'https://images.unsplash.com/photo-1548625361-16800b32f097?auto=format&fit=crop&w=1920&q=92',
  },
];

export const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const {
    currentUser,
    isAuthenticated,
    permissions,
    usersList,
    works,
    topics,
    series,
    updateUserProfile,
    deleteContent,
    requestConfirm,
    isFollowingUser,
    getFollowersOf,
    getFollowingOf,
    toggleFollowUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'SERIES' | 'WORKS' | 'TOPICS' | 'COMMENTS'>('SERIES');
  const [socialDrawer, setSocialDrawer] = useState<'FOLLOWERS' | 'FOLLOWING' | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Determine which user's profile we are viewing
  const profileUser = useMemo(() => {
    if (id) {
      const targetId = Number(id);
      if (currentUser.id === targetId && currentUser.role !== 'VISITOR') {
        return currentUser;
      }
      const fromList = usersList.find((u) => u.id === targetId);
      if (fromList) return fromList;

      for (const s of series) {
        if (s.author?.id === targetId) return s.author;
      }
      for (const w of works) {
        if (w.submitted_by?.id === targetId) return w.submitted_by;
      }
      for (const t of topics) {
        if (t.author?.id === targetId) return t.author;
      }
    }
    return currentUser;
  }, [id, currentUser, usersList, series, works, topics]);

  const isOwnProfile =
    isAuthenticated && (!id || Number(id) === currentUser.id);

  // Edit profile form state
  const [editName, setEditName] = useState(profileUser.name);
  const [editBadge, setEditBadge] = useState(profileUser.title_badge || '');
  const [editBio, setEditBio] = useState(profileUser.bio || '');
  const [editAvatarUrl, setEditAvatarUrl] = useState(profileUser.avatar_url || '');
  const [editCoverUrl, setEditCoverUrl] = useState(profileUser.cover_url || '');
  const [editDmPolicy, setEditDmPolicy] = useState<'MUTUAL' | 'FOLLOWERS' | 'EVERYONE'>(
    profileUser.dm_policy || 'MUTUAL'
  );
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [cropModalState, setCropModalState] = useState<{
    isOpen: boolean;
    mode: 'AVATAR' | 'COVER';
    src: string;
  } | null>(null);

  const avatarInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const startEditing = () => {
    setEditName(currentUser.name);
    setEditBadge(currentUser.title_badge || '');
    setEditBio(currentUser.bio || '');
    setEditAvatarUrl(currentUser.avatar_url || '');
    setEditCoverUrl(currentUser.cover_url || '');
    setEditDmPolicy(currentUser.dm_policy || 'MUTUAL');
    setIsEditing(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    await updateUserProfile({
      name: editName.trim(),
      title_badge: editBadge.trim(),
      bio: editBio.trim(),
      avatar_url: editAvatarUrl.trim() || null,
      cover_url: editCoverUrl.trim() || null,
      dm_policy: editDmPolicy,
    });
    setIsEditing(false);
  };

  const handleDirectAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const rawDataUrl = await readFileAsDataUrl(file);
    setCropModalState({
      isOpen: true,
      mode: 'AVATAR',
      src: rawDataUrl,
    });
  };

  const handleDirectCoverFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    const rawDataUrl = await readFileAsDataUrl(file);
    setCropModalState({
      isOpen: true,
      mode: 'COVER',
      src: rawDataUrl,
    });
  };

  const handleApplyCroppedImage = async (croppedDataUrl: string) => {
    if (!cropModalState) return;
    setIsUploadingMedia(true);
    try {
      if (cropModalState.mode === 'AVATAR') {
        setEditAvatarUrl(croppedDataUrl);
        if (!isEditing) {
          await updateUserProfile({
            name: currentUser.name,
            title_badge: currentUser.title_badge,
            bio: currentUser.bio,
            avatar_url: croppedDataUrl,
            cover_url: currentUser.cover_url ?? null,
          });
        }
      } else {
        setEditCoverUrl(croppedDataUrl);
        if (!isEditing) {
          await updateUserProfile({
            name: currentUser.name,
            title_badge: currentUser.title_badge,
            bio: currentUser.bio,
            avatar_url: currentUser.avatar_url ?? null,
            cover_url: croppedDataUrl,
          });
        }
      }
    } finally {
      setIsUploadingMedia(false);
    }
  };

  // 0. Series / Cadernos written by this user
  const userSeries = useMemo((): ReadingSeries[] => {
    const pNorm = normalizeName(profileUser.name);
    const pEmail = (profileUser.email || '').toLowerCase().trim();
    return series.filter((s) => {
      if (s.author_id === profileUser.id || s.author?.id === profileUser.id) return true;
      if (pEmail && s.author?.email && s.author.email.toLowerCase().trim() === pEmail) return true;
      if (pNorm && s.author?.name && normalizeName(s.author.name) === pNorm) return true;
      return false;
    });
  }, [series, profileUser]);

  const userSeriesEntriesCount = useMemo(() => {
    return userSeries.reduce(
      (acc, s) => acc + (s.entries?.length || s.entries_count || 0),
      0
    );
  }, [userSeries]);

  // 1. Works / Book Essays written by this user (only approved unless moderator/admin or own profile)
  const userWorks = useMemo((): Work[] => {
    return works.filter(
      (w) =>
        (w.status === 'APPROVED' || permissions.can_moderate_queue || isOwnProfile) &&
        (w.submitted_by_id === profileUser.id ||
          w.submitted_by?.id === profileUser.id ||
          (w.submitted_by?.name &&
            normalizeName(w.submitted_by.name) === normalizeName(profileUser.name)))
    );
  }, [works, profileUser, permissions.can_moderate_queue, isOwnProfile]);

  // 2. Topics / Essays written by this user (only approved unless moderator/admin or own profile)
  const userTopics = useMemo((): Topic[] => {
    return topics.filter(
      (t) =>
        (t.status === 'APPROVED' || permissions.can_moderate_queue || isOwnProfile) &&
        (t.author_id === profileUser.id ||
          t.author?.id === profileUser.id ||
          (t.author?.name &&
            normalizeName(t.author.name) === normalizeName(profileUser.name)))
    );
  }, [topics, profileUser, permissions.can_moderate_queue, isOwnProfile]);

  useEffect(() => {
    if (userSeries.length > 0) {
      setActiveTab('SERIES');
    } else if (userWorks.length > 0) {
      setActiveTab('WORKS');
    } else if (userTopics.length > 0) {
      setActiveTab('TOPICS');
    }
  }, [profileUser.id, userSeries.length, userWorks.length, userTopics.length]);

  // 3. All Comments & Replies written by this user across Works, Topics, and Series Entries
  const userComments = useMemo((): FlattenedUserComment[] => {
    const collected: FlattenedUserComment[] = [];

    const traverseComments = (
      list: Comment[] | undefined,
      targetType: 'WORK' | 'TOPIC' | 'SERIES_ENTRY',
      targetTitle: string,
      targetSlug: string,
      targetSubtitle?: string
    ) => {
      if (!list) return;
      for (const c of list) {
        if (c.status !== 'APPROVED' && !permissions.can_moderate_queue) continue;

        const matchesAuthor =
          c.author_id === profileUser.id ||
          c.author?.id === profileUser.id ||
          (c.author?.name &&
            normalizeName(c.author.name) === normalizeName(profileUser.name));

        if (matchesAuthor) {
          collected.push({
            comment: c,
            targetType,
            targetTitle,
            targetSlug,
            targetSubtitle,
          });
        }

        if (c.replies && c.replies.length > 0) {
          traverseComments(
            c.replies,
            targetType,
            targetTitle,
            targetSlug,
            targetSubtitle
          );
        }
      }
    };

    for (const w of works) {
      if (w.status !== 'APPROVED' && !permissions.can_moderate_queue) continue;
      traverseComments(w.comments, 'WORK', w.title, w.slug, w.creator);
    }

    for (const t of topics) {
      if (t.status !== 'APPROVED' && !permissions.can_moderate_queue) continue;
      traverseComments(t.comments, 'TOPIC', t.title, t.slug, t.category?.name);
    }

    for (const s of series) {
      for (const entry of s.entries || []) {
        traverseComments(
          entry.comments,
          'SERIES_ENTRY',
          `${s.title} — #${entry.entry_number} ${entry.title}`,
          `${s.slug}/${entry.slug}`,
          entry.reference_label || undefined
        );
      }
    }

    return collected.sort(
      (a, b) =>
        new Date(b.comment.created_at).getTime() -
        new Date(a.comment.created_at).getTime()
    );
  }, [works, topics, series, profileUser, permissions.can_moderate_queue]);

  if (!id && !isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-14 h-14 rounded-full bg-burgundy/10 dark:bg-gold/15 text-burgundy dark:text-gold flex items-center justify-center mx-auto">
          <UserIcon className="w-7 h-7" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-ink dark:text-slateDark-text">
          Entre para acessar seu Perfil Literário
        </h2>
        <p className="text-base text-ink-secondary dark:text-slateDark-muted">
          Faça login ou crie sua conta para visualizar todos os textos, resenhas de
          livros e comentários que você escreveu na comunidade.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg text-sm font-semibold shadow-sm"
        >
          <LogIn className="w-4 h-4" />
          <span>Entrar ou Criar Conta</span>
        </Link>
      </div>
    );
  }

  const roleBadgeLabel =
    profileUser.role === 'ADMIN'
      ? 'Administrador & Curador'
      : profileUser.role === 'MODERATOR'
      ? 'Moderador Editorial'
      : profileUser.role === 'COLUMNIST'
      ? 'Colunista • Séries & Cadernos'
      : 'Membro da Comunidade';

  const pendingCount =
    userWorks.filter((w) => w.status === 'PENDING').length +
    userTopics.filter((t) => t.status === 'PENDING').length;

  return (
    <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Hidden file inputs for 1-click Avatar & Cover upload */}
      {isOwnProfile && (
        <>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleDirectAvatarFile}
            className="hidden"
          />
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleDirectCoverFile}
            className="hidden"
          />
        </>
      )}

      {/* Interactive HD Image Cropper Modal for Avatar & Cover */}
      {cropModalState && (
        <ImageCropModal
          isOpen={cropModalState.isOpen}
          mode={cropModalState.mode}
          imageSrc={cropModalState.src}
          onClose={() => setCropModalState(null)}
          onApply={handleApplyCroppedImage}
          onPickAnotherFile={() => {
            if (cropModalState.mode === 'AVATAR') {
              avatarInputRef.current?.click();
            } else {
              coverInputRef.current?.click();
            }
          }}
        />
      )}

      {/* 1. CABEÇALHO DO PERFIL DO AUTOR (COM CAPA HD E FOTO DE PERFIL) */}
      <section className="rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment-warm dark:bg-slateDark-card shadow-editorial overflow-hidden">
        {/* Banner de Capa em Alta Definição */}
        <div className="relative h-44 sm:h-60 w-full bg-gradient-to-r from-burgundy via-ink to-navy dark:from-slateDark-elevated dark:via-burgundy/60 dark:to-slateDark-bg overflow-hidden">
          {(isEditing ? editCoverUrl : profileUser.cover_url) ? (
            <img
              src={(isEditing ? editCoverUrl : profileUser.cover_url) || ''}
              alt={`Capa de ${profileUser.name}`}
              className="w-full h-full object-cover select-none"
            />
          ) : (
            <div className="w-full h-full opacity-25 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:20px_20px]" />
          )}

          {isOwnProfile && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              {(isEditing ? editCoverUrl : profileUser.cover_url) && (
                <button
                  type="button"
                  disabled={isUploadingMedia}
                  onClick={() =>
                    setCropModalState({
                      isOpen: true,
                      mode: 'COVER',
                      src: (isEditing ? editCoverUrl : profileUser.cover_url) || '',
                    })
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/75 hover:bg-black/90 text-parchment text-xs font-semibold backdrop-blur-xs border border-white/25 shadow-md transition-all"
                  title="Cortar e reposicionar a capa atual"
                >
                  <Crop className="w-3.5 h-3.5 text-gold-light" />
                  <span>Cortar Capa</span>
                </button>
              )}
              <button
                type="button"
                disabled={isUploadingMedia}
                onClick={() => coverInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-black/75 hover:bg-black/90 text-parchment text-xs font-semibold backdrop-blur-xs border border-white/25 shadow-md transition-all"
                title="Enviar e recortar nova imagem de capa"
              >
                <ImageIcon className="w-3.5 h-3.5 text-gold-light" />
                <span>{isUploadingMedia ? 'Salvando...' : 'Alterar Capa'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Conteúdo Principal do Perfil abaixo da Capa */}
        <div className="p-4 sm:p-8 pt-0 sm:pt-0 space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 -mt-10 sm:-mt-12 relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-5">
              {/* Avatar / Foto de Perfil com botões de Trocar e Cortar */}
              <div className="relative group shrink-0">
                {(isEditing ? editAvatarUrl : profileUser.avatar_url) ? (
                  <img
                    src={(isEditing ? editAvatarUrl : profileUser.avatar_url) || ''}
                    alt={profileUser.name}
                    className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl object-cover bg-parchment dark:bg-slateDark-elevated border-4 border-parchment-warm dark:border-slateDark-card shadow-lg"
                  />
                ) : (
                  <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl bg-burgundy dark:bg-slateDark-elevated border-4 border-parchment-warm dark:border-slateDark-card flex items-center justify-center font-serif text-3xl sm:text-4xl font-bold text-parchment dark:text-gold shadow-lg">
                    {profileUser.name.charAt(0).toUpperCase()}
                  </div>
                )}

                {isOwnProfile && (
                  <div className="absolute -bottom-1.5 -right-1.5 flex items-center gap-1">
                    {(isEditing ? editAvatarUrl : profileUser.avatar_url) && (
                      <button
                        type="button"
                        disabled={isUploadingMedia}
                        onClick={() =>
                          setCropModalState({
                            isOpen: true,
                            mode: 'AVATAR',
                            src:
                              (isEditing ? editAvatarUrl : profileUser.avatar_url) ||
                              '',
                          })
                        }
                        className="p-1.5 rounded-full bg-navy hover:bg-navy-hover text-parchment shadow-md border-2 border-parchment-warm dark:border-slateDark-card transition-transform hover:scale-105"
                        title="Cortar e enquadrar foto de perfil"
                      >
                        <Crop className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={isUploadingMedia}
                      onClick={() => avatarInputRef.current?.click()}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-burgundy hover:bg-burgundy-hover dark:bg-gold dark:text-slateDark-bg text-parchment text-[11px] font-bold shadow-md border-2 border-parchment-warm dark:border-slateDark-card transition-transform hover:scale-105"
                      title="Enviar e recortar foto de perfil"
                    >
                      <Camera className="w-3 h-3" />
                      <span>Foto</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Identificação */}
              <div className="space-y-1.5 pt-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink dark:text-slateDark-text">
                    {profileUser.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-md text-xs font-bold uppercase tracking-wider bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg">
                    {roleBadgeLabel}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-ink-secondary dark:text-slateDark-muted">
                  {profileUser.title_badge && (
                    <span className="inline-flex items-center gap-1.5 font-semibold text-burgundy dark:text-gold">
                      <Award className="w-4 h-4" />
                      {profileUser.title_badge}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Membro desde{' '}
                    {new Date(profileUser.created_at || Date.now()).toLocaleDateString(
                      'pt-BR',
                      { month: 'long', year: 'numeric' }
                    )}
                  </span>
                </div>

                {/* Contadores Clicáveis de Seguidores & Seguindo */}
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                  <button
                    type="button"
                    onClick={() =>
                      setSocialDrawer((prev) =>
                        prev === 'FOLLOWERS' ? null : 'FOLLOWERS'
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-parchment dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border font-semibold text-ink dark:text-slateDark-text hover:border-burgundy transition-colors"
                  >
                    <Users className="w-3.5 h-3.5 text-burgundy dark:text-gold" />
                    <strong>{getFollowersOf(profileUser.id).length}</strong>
                    <span className="text-ink-muted">Seguidores</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setSocialDrawer((prev) =>
                        prev === 'FOLLOWING' ? null : 'FOLLOWING'
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-parchment dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border font-semibold text-ink dark:text-slateDark-text hover:border-burgundy transition-colors"
                  >
                    <strong>{getFollowingOf(profileUser.id).length}</strong>
                    <span className="text-ink-muted">Seguindo</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Ações do Próprio Perfil ou de Outro Autor */}
            {isOwnProfile ? (
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {!isEditing && (
                  <button
                    type="button"
                    onClick={startEditing}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-elevated text-xs sm:text-sm font-semibold text-ink dark:text-slateDark-text hover:border-burgundy transition-colors"
                  >
                    <Edit3 className="w-4 h-4 text-burgundy dark:text-gold" />
                    <span>Editar Perfil, Foto &amp; Capa</span>
                  </button>
                )}
                <Link
                  to="/mensagens"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-elevated text-xs sm:text-sm font-semibold text-ink dark:text-slateDark-text hover:border-burgundy transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-burgundy dark:text-gold" />
                  <span>Abrir Chat</span>
                </Link>
                <Link
                  to="/escrever"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-burgundy hover:bg-burgundy-hover dark:bg-gold dark:text-slateDark-bg text-parchment text-xs sm:text-sm font-semibold shadow-sm transition-colors"
                >
                  <Feather className="w-4 h-4" />
                  <span>Escrever Novo Texto</span>
                </Link>
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => toggleFollowUser(profileUser.id)}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs sm:text-sm font-semibold shadow-xs transition-colors ${
                    isFollowingUser(profileUser.id)
                      ? 'bg-forest/15 text-forest dark:text-emerald-300 border border-forest/30'
                      : 'bg-burgundy hover:bg-burgundy-hover dark:bg-gold dark:text-slateDark-bg text-parchment'
                  }`}
                >
                  {isFollowingUser(profileUser.id) ? (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Seguindo</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Seguir Autor</span>
                    </>
                  )}
                </button>

                <Link
                  to={`/mensagens/${profileUser.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-elevated text-xs sm:text-sm font-semibold text-ink dark:text-slateDark-text hover:border-burgundy transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-burgundy dark:text-gold" />
                  <span>
                    {isFollowingUser(profileUser.id) &&
                    isFollowingUser(currentUser.id, profileUser.id)
                      ? 'Enviar Mensagem Privada'
                      : 'Abrir Chat (Mútuo)'}
                  </span>
                </Link>
              </div>
            )}
          </div>

          {/* Drawer de Seguidores / Seguindo */}
          {socialDrawer && (
            <div className="p-4 rounded-xl bg-parchment dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-serif font-bold text-base text-ink dark:text-slateDark-text flex items-center gap-2">
                  <Users className="w-4 h-4 text-burgundy dark:text-gold" />
                  <span>
                    {socialDrawer === 'FOLLOWERS'
                      ? `Seguidores de ${profileUser.name} (${getFollowersOf(profileUser.id).length})`
                      : `Pessoas que ${profileUser.name} segue (${getFollowingOf(profileUser.id).length})`}
                  </span>
                </h3>
                <button
                  type="button"
                  onClick={() => setSocialDrawer(null)}
                  className="text-ink-muted hover:text-ink"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {(socialDrawer === 'FOLLOWERS'
                ? getFollowersOf(profileUser.id)
                : getFollowingOf(profileUser.id)
              ).length === 0 ? (
                <p className="text-xs text-ink-muted py-2">
                  Nenhum membro listado ainda.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {(socialDrawer === 'FOLLOWERS'
                    ? getFollowersOf(profileUser.id)
                    : getFollowingOf(profileUser.id)
                  ).map((u) => (
                    <div
                      key={u.id}
                      className="p-3 rounded-lg bg-parchment-warm dark:bg-slateDark-card border border-parchment-deep dark:border-slateDark-border flex items-center justify-between gap-2"
                    >
                      <Link
                        to={`/perfil/${u.id}`}
                        onClick={() => setSocialDrawer(null)}
                        className="flex items-center gap-2 min-w-0"
                      >
                        {u.avatar_url ? (
                          <img
                            src={u.avatar_url}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover shrink-0"
                          />
                        ) : (
                          <span className="w-8 h-8 rounded-full bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg font-serif font-bold text-xs flex items-center justify-center shrink-0">
                            {u.name.charAt(0).toUpperCase()}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="font-serif font-bold text-xs text-ink dark:text-slateDark-text truncate">
                            {u.name}
                          </p>
                          <p className="text-[10px] text-burgundy dark:text-gold truncate">
                            {u.role}
                          </p>
                        </div>
                      </Link>

                      {u.id !== currentUser.id && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleFollowUser(u.id)}
                            className="px-2 py-1 rounded border border-parchment-deep dark:border-slateDark-border text-[10px] font-semibold"
                          >
                            {isFollowingUser(u.id) ? 'Seguindo' : 'Seguir'}
                          </button>
                          <Link
                            to={`/mensagens/${u.id}`}
                            className="px-2 py-1 rounded bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg text-[10px] font-semibold"
                          >
                            Chat
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {profileUser.bio && (
            <p className="text-sm sm:text-base text-ink dark:text-slateDark-text max-w-3xl leading-relaxed">
              {profileUser.bio}
            </p>
          )}

          {/* Formulário de Edição Rápida do Perfil (Nome, Título, Bio, Foto e Capa) */}
          {isOwnProfile && isEditing && (
            <form
              onSubmit={handleSaveProfile}
              className="pt-5 border-t border-parchment-deep dark:border-slateDark-border space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink dark:text-slateDark-text mb-1">
                    Seu Nome de Autor *
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink dark:text-slateDark-text mb-1">
                    Título / Área de Interesse
                  </label>
                  <input
                    type="text"
                    value={editBadge}
                    onChange={(e) => setEditBadge(e.target.value)}
                    placeholder="Ex: Leitor de Patrística & Literatura Russa"
                    className="w-full px-3.5 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text text-sm"
                  />
                </div>
              </div>

              {/* Controles de Foto de Perfil e Imagem de Capa */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-parchment dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border">
                {/* Foto de Perfil */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-burgundy dark:text-gold">
                    Foto de Perfil
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg text-xs font-semibold"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Enviar &amp; Cortar Foto</span>
                    </button>
                    {editAvatarUrl && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setCropModalState({
                              isOpen: true,
                              mode: 'AVATAR',
                              src: editAvatarUrl,
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-parchment-warm dark:bg-slateDark-card text-xs font-semibold text-ink dark:text-slateDark-text hover:border-burgundy"
                        >
                          <Crop className="w-3.5 h-3.5 text-burgundy dark:text-gold" />
                          <span>Cortar Atual</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditAvatarUrl('')}
                          className="px-2.5 py-1.5 rounded-md border border-red-500/40 text-red-700 dark:text-red-300 text-xs font-semibold hover:bg-red-500/10"
                        >
                          Remover Foto
                        </button>
                      </>
                    )}
                  </div>
                  <input
                    type="text"
                    value={editAvatarUrl.startsWith('data:') ? '' : editAvatarUrl}
                    onChange={(e) => setEditAvatarUrl(e.target.value)}
                    placeholder="Ou cole o link (URL) de uma foto https://..."
                    className="w-full px-3 py-1.5 rounded border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-xs text-ink dark:text-slateDark-text"
                  />
                </div>

                {/* Imagem de Capa */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-burgundy dark:text-gold">
                    Imagem de Capa do Perfil
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => coverInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-navy text-parchment dark:bg-gold dark:text-slateDark-bg text-xs font-semibold"
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>Enviar &amp; Cortar Capa HD</span>
                    </button>
                    {editCoverUrl && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            setCropModalState({
                              isOpen: true,
                              mode: 'COVER',
                              src: editCoverUrl,
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-parchment-warm dark:bg-slateDark-card text-xs font-semibold text-ink dark:text-slateDark-text hover:border-burgundy"
                        >
                          <Crop className="w-3.5 h-3.5 text-burgundy dark:text-gold" />
                          <span>Cortar Atual</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditCoverUrl('')}
                          className="px-2.5 py-1.5 rounded-md border border-red-500/40 text-red-700 dark:text-red-300 text-xs font-semibold hover:bg-red-500/10"
                        >
                          Remover Capa
                        </button>
                      </>
                    )}
                  </div>
                  <input
                    type="text"
                    value={editCoverUrl.startsWith('data:') ? '' : editCoverUrl}
                    onChange={(e) => setEditCoverUrl(e.target.value)}
                    placeholder="Ou cole o link (URL) de uma capa https://..."
                    className="w-full px-3 py-1.5 rounded border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-xs text-ink dark:text-slateDark-text"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-ink-muted">Sugestões rápidas:</span>
                    {COVER_PRESETS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setEditCoverUrl(preset.url)}
                        className="px-2 py-0.5 rounded bg-parchment-warm dark:bg-slateDark-card border border-parchment-deep dark:border-slateDark-border text-[11px] font-semibold text-ink-secondary dark:text-slateDark-text hover:border-burgundy"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink dark:text-slateDark-text mb-1">
                    Apresentação Literária / Bio
                  </label>
                  <textarea
                    rows={2}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink dark:text-slateDark-text mb-1">
                    Privacidade do Chat Privado
                  </label>
                  <select
                    value={editDmPolicy}
                    onChange={(e) =>
                      setEditDmPolicy(
                        e.target.value as 'MUTUAL' | 'FOLLOWERS' | 'EVERYONE'
                      )
                    }
                    className="w-full px-3.5 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text text-sm font-medium"
                  >
                    <option value="MUTUAL">
                      Apenas Conexões Mútuas (Seguindo e sendo seguido)
                    </option>
                    <option value="FOLLOWERS">
                      Quem me segue pode me enviar mensagem
                    </option>
                    <option value="EVERYONE">
                      Qualquer membro da comunidade
                    </option>
                  </select>
                  <p className="text-[11px] text-ink-muted dark:text-slateDark-muted mt-1">
                    Define quem pode iniciar conversas privadas com você.
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center gap-1 px-3.5 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border text-xs font-semibold text-ink-secondary dark:text-slateDark-muted"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancelar</span>
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-forest text-parchment text-xs font-semibold"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </form>
          )}

        {/* Contadores de Atividade Literária */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-parchment-deep dark:border-slateDark-border">
          <div className="p-3.5 rounded-lg bg-parchment dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border">
            <span className="text-xs font-semibold text-ink-secondary dark:text-slateDark-muted block">
              Séries &amp; Notas
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="font-serif text-2xl font-bold text-burgundy dark:text-gold">
                {userSeries.length}
              </span>
              <span className="text-xs font-semibold text-ink-muted dark:text-slateDark-muted">
                ({userSeriesEntriesCount} notas)
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-parchment dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border">
            <span className="text-xs font-semibold text-ink-secondary dark:text-slateDark-muted block">
              Resenhas de Obras
            </span>
            <span className="font-serif text-2xl font-bold text-ink dark:text-slateDark-text">
              {userWorks.length}
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-parchment dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border">
            <span className="text-xs font-semibold text-ink-secondary dark:text-slateDark-muted block">
              Ensaios &amp; Tópicos
            </span>
            <span className="font-serif text-2xl font-bold text-ink dark:text-slateDark-text">
              {userTopics.length}
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-parchment dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border">
            <span className="text-xs font-semibold text-ink-secondary dark:text-slateDark-muted block">
              Comentários Escritos
            </span>
            <span className="font-serif text-2xl font-bold text-ink dark:text-slateDark-text">
              {userComments.length}
            </span>
          </div>

          <div className="p-3.5 rounded-lg bg-parchment dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border">
            <span className="text-xs font-semibold text-ink-secondary dark:text-slateDark-muted block">
              Em Revisão na Moderação
            </span>
            <span className="font-serif text-2xl font-bold text-amber-700 dark:text-amber-400">
              {pendingCount}
            </span>
          </div>
        </div>
        </div>
      </section>

      {/* 2. ABAS: SÉRIES & CADERNOS | RESENHAS DE OBRAS | ENSAIOS | COMENTÁRIOS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 sm:flex-wrap no-scrollbar -mx-3.5 px-3.5 sm:mx-0 sm:px-0 border-b border-parchment-deep dark:border-slateDark-border">
        <button
          type="button"
          onClick={() => setActiveTab('SERIES')}
          className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold border transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'SERIES'
              ? 'bg-burgundy text-parchment border-burgundy dark:bg-gold dark:text-slateDark-bg dark:border-gold shadow-sm'
              : 'bg-parchment-warm dark:bg-slateDark-card text-ink dark:text-slateDark-text border-parchment-deep dark:border-slateDark-border'
          }`}
        >
          <BookMarked className="w-4 h-4" />
          <span>
            Séries &amp; Cadernos ({userSeries.length} • {userSeriesEntriesCount} notas)
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('WORKS')}
          className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold border transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'WORKS'
              ? 'bg-burgundy text-parchment border-burgundy dark:bg-gold dark:text-slateDark-bg dark:border-gold shadow-sm'
              : 'bg-parchment-warm dark:bg-slateDark-card text-ink dark:text-slateDark-text border-parchment-deep dark:border-slateDark-border'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Resenhas de Obras ({userWorks.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('TOPICS')}
          className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold border transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'TOPICS'
              ? 'bg-burgundy text-parchment border-burgundy dark:bg-gold dark:text-slateDark-bg dark:border-gold shadow-sm'
              : 'bg-parchment-warm dark:bg-slateDark-card text-ink dark:text-slateDark-text border-parchment-deep dark:border-slateDark-border'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Ensaios &amp; Debates ({userTopics.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('COMMENTS')}
          className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold border transition-all whitespace-nowrap shrink-0 ${
            activeTab === 'COMMENTS'
              ? 'bg-burgundy text-parchment border-burgundy dark:bg-gold dark:text-slateDark-bg dark:border-gold shadow-sm'
              : 'bg-parchment-warm dark:bg-slateDark-card text-ink dark:text-slateDark-text border-parchment-deep dark:border-slateDark-border'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Comentários ({userComments.length})</span>
        </button>
      </div>

      {/* CONTEÚDO DA ABA SÉRIES & CADERNOS */}
      {activeTab === 'SERIES' && (
        <div className="space-y-6">
          {userSeries.length === 0 ? (
            <div className="p-8 sm:p-10 rounded-xl border border-dashed border-parchment-deep dark:border-slateDark-border bg-parchment-warm/50 dark:bg-slateDark-card text-center space-y-3">
              <BookMarked className="w-8 h-8 text-burgundy dark:text-gold mx-auto" />
              <p className="font-serif text-lg sm:text-xl font-bold text-ink dark:text-slateDark-text">
                Nenhuma Série ou Caderno publicado por este autor
              </p>
              <p className="text-xs sm:text-sm text-ink-secondary dark:text-slateDark-muted">
                As séries de comentários recorrentes e cadernos de estudo deste autor aparecerão listadas aqui.
              </p>
              {isOwnProfile && permissions.can_manage_series && (
                <Link
                  to="/series"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg text-xs sm:text-sm font-semibold"
                >
                  <BookMarked className="w-4 h-4" />
                  <span>Ir para Séries &amp; Cadernos</span>
                </Link>
              )}
            </div>
          ) : (
            userSeries.map((s) => {
              const entries = s.entries || [];
              return (
                <div
                  key={s.id}
                  className="p-5 sm:p-6 rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-card shadow-editorial space-y-5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-parchment-deep/70 dark:border-slateDark-border pb-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="px-2.5 py-0.5 rounded bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg font-bold uppercase tracking-wider">
                          {s.cadence_label || 'Publicação Diária'}
                        </span>
                        {s.category && (
                          <span className="px-2.5 py-0.5 rounded bg-parchment-warm dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border font-semibold">
                            {s.category.name}
                          </span>
                        )}
                        <span className="px-2.5 py-0.5 rounded bg-forest/15 text-forest dark:text-emerald-300 font-bold">
                          {entries.length || s.entries_count} notas publicadas
                        </span>
                      </div>

                      <Link
                        to={`/series/${s.slug}`}
                        className="block font-serif text-2xl sm:text-3xl font-bold text-ink dark:text-slateDark-text hover:text-burgundy dark:hover:text-gold"
                      >
                        {s.title}
                      </Link>

                      {s.book_title && (
                        <p className="text-xs sm:text-sm font-semibold text-burgundy dark:text-gold">
                          Obra de referência: {s.book_title}
                          {s.book_author ? ` — ${s.book_author}` : ''}
                        </p>
                      )}

                      {s.description && (
                        <p className="text-sm text-ink-secondary dark:text-slateDark-muted leading-relaxed">
                          {s.description}
                        </p>
                      )}
                    </div>

                    <Link
                      to={`/series/${s.slug}`}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-burgundy hover:bg-burgundy-hover dark:bg-gold dark:text-slateDark-bg text-parchment text-xs sm:text-sm font-semibold shrink-0 shadow-xs transition-colors"
                    >
                      <BookMarked className="w-4 h-4" />
                      <span>Abrir Caderno Completo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>

                  {/* Lista de Notas desta Série */}
                  {entries.length > 0 && (
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-ink-muted dark:text-slateDark-muted">
                        <span>Índice de Notas Publicadas ({entries.length})</span>
                        <span>Clique em qualquer nota para ler</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-96 overflow-y-auto pr-1">
                        {entries.map((entry) => (
                          <Link
                            key={entry.id}
                            to={`/series/${s.slug}/${entry.slug}`}
                            className="p-3 rounded-lg border border-parchment-deep dark:border-slateDark-border bg-parchment-warm/70 dark:bg-slateDark-elevated hover:border-burgundy dark:hover:border-gold transition-colors space-y-1 group"
                          >
                            <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-burgundy dark:text-gold">
                              <span>
                                #{String(entry.entry_number).padStart(2, '0')} •{' '}
                                {entry.reference_label || 'Nota'}
                              </span>
                              {entry.published_at && (
                                <span className="font-mono text-[10px] text-ink-muted dark:text-slateDark-muted">
                                  {new Date(entry.published_at).toLocaleDateString('pt-BR')}
                                </span>
                              )}
                            </div>
                            <p className="font-serif font-bold text-sm text-ink dark:text-slateDark-text group-hover:text-burgundy dark:group-hover:text-gold line-clamp-1">
                              {entry.title}
                            </p>
                            <p className="text-xs text-ink-secondary dark:text-slateDark-muted line-clamp-2">
                              {entry.body}
                            </p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* CONTEÚDO DA ABA SELECIONADA */}
      {activeTab === 'WORKS' && (
        <div className="space-y-4">
          {userWorks.length === 0 ? (
            <div className="p-8 sm:p-10 rounded-xl border border-dashed border-parchment-deep dark:border-slateDark-border bg-parchment-warm/50 dark:bg-slateDark-card text-center space-y-3">
              <BookOpen className="w-8 h-8 text-burgundy dark:text-gold mx-auto" />
              <p className="font-serif text-lg sm:text-xl font-bold text-ink dark:text-slateDark-text">
                Nenhuma resenha de obra publicada ainda
              </p>
              <p className="text-xs sm:text-sm text-ink-secondary dark:text-slateDark-muted">
                Quando {isOwnProfile ? 'você escrever' : 'este autor escrever'} uma
                resenha sobre um livro, ela aparecerá listada aqui.
              </p>
              {isOwnProfile && (
                <Link
                  to="/escrever"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg text-xs sm:text-sm font-semibold"
                >
                  <Feather className="w-4 h-4" />
                  <span>Escrever Minha Primeira Resenha</span>
                </Link>
              )}
            </div>
          ) : (
            userWorks.map((work) => {
              const metrics = getReadingMetrics(work.synopsis);
              return (
                <div
                  key={work.id}
                  className="p-4 sm:p-6 rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-card shadow-editorial flex flex-col sm:flex-row gap-4 sm:gap-6 items-start"
                >
                  <Link to={`/obras/${work.slug}`} className="shrink-0 mx-auto sm:mx-0">
                    <img
                      src={work.cover_url}
                      alt={work.title}
                      className="w-24 sm:w-28 h-36 sm:h-40 object-cover rounded-lg border border-parchment-deep dark:border-slateDark-border shadow-sm"
                    />
                  </Link>

                  <div className="flex-1 min-w-0 space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span
                        className={`px-2.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                          work.status === 'APPROVED'
                            ? 'bg-forest/20 text-forest dark:text-emerald-300'
                            : work.status === 'PENDING'
                            ? 'bg-amber-500/20 text-amber-900 dark:text-amber-300'
                            : 'bg-red-500/20 text-red-900 dark:text-red-300'
                        }`}
                      >
                        {work.status === 'APPROVED'
                          ? 'Publicado (Aprovado)'
                          : work.status === 'PENDING'
                          ? 'Aguardando Revisão da Moderação'
                          : 'Reprovado / Oculto'}
                      </span>
                      {work.category && (
                        <span className="px-2.5 py-0.5 rounded bg-parchment-warm dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border font-semibold">
                          {work.category.name}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-ink-secondary dark:text-slateDark-muted ml-auto">
                        <Clock className="w-3.5 h-3.5 text-burgundy dark:text-gold" />
                        {metrics.words} palavras • ~{metrics.minutes} min
                      </span>
                    </div>

                    <div>
                      <Link
                        to={`/obras/${work.slug}`}
                        className="font-serif text-xl sm:text-2xl font-bold text-ink dark:text-slateDark-text hover:text-burgundy dark:hover:text-gold"
                      >
                        {work.title}
                      </Link>
                      <p className="text-xs sm:text-sm font-semibold text-burgundy dark:text-gold">
                        Obra de {work.creator} ({work.release_year})
                      </p>
                    </div>

                    {work.subtitle && (
                      <p className="font-literary italic text-base text-ink-secondary dark:text-slateDark-muted">
                        “{work.subtitle}”
                      </p>
                    )}

                    <p className="text-sm text-ink-secondary dark:text-slateDark-muted line-clamp-2 leading-relaxed">
                      {work.synopsis.replace(/>/g, '').replace(/#/g, '')}
                    </p>

                    {work.status !== 'APPROVED' && work.moderation_note && (
                      <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-400/50 text-xs text-red-950 dark:text-red-200 space-y-1">
                        <span className="font-bold uppercase tracking-wider block text-[11px] text-burgundy dark:text-gold">
                          Comentário da Moderação:
                        </span>
                        <p className="whitespace-pre-line">{work.moderation_note}</p>
                      </div>
                    )}

                    <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span className="text-ink-muted dark:text-slateDark-muted">
                        {work.comments?.length || 0} comentários recebidos
                      </span>
                      <div className="flex flex-wrap items-center gap-3">
                        {isOwnProfile && work.status !== 'APPROVED' && (
                          <Link
                            to={`/escrever?editWork=${work.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg font-semibold hover:opacity-90"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Editar e Reenviar</span>
                          </Link>
                        )}
                        {isOwnProfile && (
                          <button
                            type="button"
                            onClick={async () => {
                              const ok = await requestConfirm({
                                title: 'Excluir Publicação',
                                description: `Tem certeza que deseja excluir permanentemente "${work.title}"? Esta ação não pode ser desfeita.`,
                                confirmLabel: 'Sim, Excluir',
                                cancelLabel: 'Cancelar',
                                variant: 'danger',
                              });
                              if (ok) {
                                deleteContent('WORK', work.id, work.title);
                              }
                            }}
                            className="inline-flex items-center gap-1 text-red-700 dark:text-red-400 hover:underline font-semibold"
                            title="Apagar resenha"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Apagar</span>
                          </button>
                        )}
                        <Link
                          to={`/obras/${work.slug}`}
                          className="inline-flex items-center gap-1 font-semibold text-burgundy dark:text-gold hover:underline"
                        >
                          <span>Abrir texto completo</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'TOPICS' && (
        <div className="space-y-4">
          {userTopics.length === 0 ? (
            <div className="p-10 rounded-xl border border-dashed border-parchment-deep dark:border-slateDark-border bg-parchment-warm/50 dark:bg-slateDark-card text-center space-y-3">
              <FileText className="w-8 h-8 text-burgundy dark:text-gold mx-auto" />
              <p className="font-serif text-xl font-bold text-ink dark:text-slateDark-text">
                Nenhum ensaio ou tópico publicado ainda
              </p>
              {isOwnProfile && (
                <Link
                  to="/escrever"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg text-sm font-semibold"
                >
                  <Feather className="w-4 h-4" />
                  <span>Escrever Novo Ensaio</span>
                </Link>
              )}
            </div>
          ) : (
            userTopics.map((topic) => {
              const metrics = getReadingMetrics(topic.body);
              return (
                <div
                  key={topic.id}
                  className="p-4 sm:p-6 rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-card shadow-editorial space-y-3"
                >
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={`px-2.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                        topic.status === 'APPROVED'
                          ? 'bg-forest/20 text-forest dark:text-emerald-300'
                          : topic.status === 'PENDING'
                          ? 'bg-amber-500/20 text-amber-900 dark:text-amber-300'
                          : 'bg-red-500/20 text-red-900 dark:text-red-300'
                      }`}
                    >
                      {topic.status === 'APPROVED'
                        ? 'Publicado (Aprovado)'
                        : topic.status === 'PENDING'
                        ? 'Aguardando Revisão da Moderação'
                        : 'Reprovado / Oculto'}
                    </span>
                    {topic.category && (
                      <span className="px-2.5 py-0.5 rounded bg-parchment-warm dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border font-semibold">
                        {topic.category.name}
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 text-ink-secondary dark:text-slateDark-muted ml-auto">
                      <Clock className="w-3.5 h-3.5 text-burgundy dark:text-gold" />
                      {metrics.words} palavras • ~{metrics.minutes} min
                    </span>
                  </div>

                  <Link
                    to={`/topicos/${topic.slug}`}
                    className="block font-serif text-xl sm:text-2xl font-bold text-ink dark:text-slateDark-text hover:text-burgundy dark:hover:text-gold"
                  >
                    {topic.title}
                  </Link>

                  <p className="text-sm text-ink-secondary dark:text-slateDark-muted line-clamp-2 leading-relaxed">
                    {topic.excerpt}
                  </p>

                  {topic.status !== 'APPROVED' && topic.moderation_note && (
                    <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-400/50 text-xs text-red-950 dark:text-red-200 space-y-1">
                      <span className="font-bold uppercase tracking-wider block text-[11px] text-burgundy dark:text-gold">
                        Comentário da Moderação:
                      </span>
                      <p className="whitespace-pre-line">{topic.moderation_note}</p>
                    </div>
                  )}

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-secondary dark:text-slateDark-muted">
                    <div className="flex items-center gap-4">
                      <span className="inline-flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5 text-burgundy dark:text-gold" />
                        {topic.upvotes_count} apreciações
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-burgundy dark:text-gold" />
                        {topic.comments_count} comentários
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      {isOwnProfile && topic.status !== 'APPROVED' && (
                        <Link
                          to={`/escrever?editTopic=${topic.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg font-semibold hover:opacity-90"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>Editar e Reenviar</span>
                        </Link>
                      )}
                      {isOwnProfile && (
                        <button
                          type="button"
                          onClick={async () => {
                            const ok = await requestConfirm({
                              title: 'Excluir Ensaio',
                              description: `Tem certeza que deseja excluir permanentemente o ensaio "${topic.title}"?`,
                              confirmLabel: 'Sim, Excluir',
                              cancelLabel: 'Cancelar',
                              variant: 'danger',
                            });
                            if (ok) {
                              deleteContent('TOPIC', topic.id, topic.title);
                            }
                          }}
                          className="inline-flex items-center gap-1 text-red-700 dark:text-red-400 hover:underline font-semibold"
                          title="Apagar ensaio"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Apagar</span>
                        </button>
                      )}
                      <Link
                        to={`/topicos/${topic.slug}`}
                        className="inline-flex items-center gap-1 font-semibold text-burgundy dark:text-gold hover:underline"
                      >
                        <span>Ler ensaio</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'COMMENTS' && (
        <div className="space-y-4">
          {userComments.length === 0 ? (
            <div className="p-10 rounded-xl border border-dashed border-parchment-deep dark:border-slateDark-border bg-parchment-warm/50 dark:bg-slateDark-card text-center space-y-2">
              <MessageSquare className="w-8 h-8 text-burgundy dark:text-gold mx-auto" />
              <p className="font-serif text-xl font-bold text-ink dark:text-slateDark-text">
                Nenhum comentário registrado ainda
              </p>
              <p className="text-sm text-ink-secondary dark:text-slateDark-muted">
                Todos os comentários e notas de leitura publicados nas obras e ensaios
                ficam reunidos aqui.
              </p>
            </div>
          ) : (
            userComments.map(({ comment, targetType, targetTitle, targetSlug }) => {
              const targetUrl =
                targetType === 'WORK'
                  ? `/obras/${targetSlug}#comentarios`
                  : targetType === 'SERIES_ENTRY'
                  ? `/series/${targetSlug}`
                  : `/topicos/${targetSlug}#comentarios-topico`;

              return (
                <div
                  key={`uc-${comment.id}`}
                  className="p-4 sm:p-6 rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-card shadow-editorial space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-parchment-deep dark:border-slateDark-border text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-parchment-warm dark:bg-slateDark-elevated font-bold text-burgundy dark:text-gold">
                        Comentou em{' '}
                        {targetType === 'WORK'
                          ? 'Obra'
                          : targetType === 'SERIES_ENTRY'
                          ? 'Série'
                          : 'Ensaio'}
                        :
                      </span>
                      <Link
                        to={targetUrl}
                        className="font-serif font-bold text-sm sm:text-base text-ink dark:text-slateDark-text hover:text-burgundy dark:hover:text-gold underline"
                      >
                        “{targetTitle}”
                      </Link>
                    </div>

                    <div className="flex items-center gap-3 text-ink-secondary dark:text-slateDark-muted">
                      {comment.rating && (
                        <span className="inline-flex items-center gap-1 text-gold font-bold">
                          <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                          {comment.rating}/5
                        </span>
                      )}
                      <span>
                        {new Date(comment.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  <RichTextRenderer
                    content={comment.body}
                    fontSize="normal"
                    fontFamily="serif"
                  />

                  <div className="pt-1 flex items-center justify-between text-xs text-ink-secondary dark:text-slateDark-muted">
                    <span className="inline-flex items-center gap-1">
                      <ThumbsUp className="w-3.5 h-3.5 text-burgundy dark:text-gold" />
                      {comment.upvotes_count} apreciações
                    </span>
                    <div className="flex items-center gap-3">
                      {isOwnProfile && (
                        <button
                          type="button"
                          onClick={async () => {
                            const ok = await requestConfirm({
                              title: 'Excluir Comentário',
                              description: `Tem certeza que deseja excluir seu comentário em "${targetTitle}"?`,
                              confirmLabel: 'Sim, Excluir',
                              cancelLabel: 'Cancelar',
                              variant: 'danger',
                            });
                            if (ok) {
                              deleteContent('COMMENT', comment.id, `Comentário em ${targetTitle}`);
                            }
                          }}
                          className="inline-flex items-center gap-1 text-red-700 dark:text-red-400 hover:underline font-semibold"
                          title="Apagar comentário"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Apagar</span>
                        </button>
                      )}
                      <Link
                        to={targetUrl}
                        className="inline-flex items-center gap-1 font-semibold text-burgundy dark:text-gold hover:underline"
                      >
                        <span>Ver na discussão original</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
