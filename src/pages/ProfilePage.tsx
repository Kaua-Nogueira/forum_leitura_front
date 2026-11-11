import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  User as UserIcon,
  BookOpen,
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
  ShieldCheck,
  LogIn,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Comment, Work, Topic } from '../types/schema';
import { RichTextRenderer, getReadingMetrics } from '../components/RichTextRenderer';

interface FlattenedUserComment {
  comment: Comment;
  targetType: 'WORK' | 'TOPIC';
  targetTitle: string;
  targetSlug: string;
  targetSubtitle?: string;
}

export const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const {
    currentUser,
    isAuthenticated,
    usersList,
    works,
    topics,
    updateUserProfile,
    deleteContent,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'WORKS' | 'TOPICS' | 'COMMENTS'>('WORKS');
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

      // Also search in works/topics/comments authors if not in usersList yet
      for (const w of works) {
        if (w.submitted_by?.id === targetId) return w.submitted_by;
      }
      for (const t of topics) {
        if (t.author?.id === targetId) return t.author;
      }
    }
    return currentUser;
  }, [id, currentUser, usersList, works, topics]);

  const isOwnProfile =
    isAuthenticated && (!id || Number(id) === currentUser.id);

  // Edit profile form state
  const [editName, setEditName] = useState(profileUser.name);
  const [editBadge, setEditBadge] = useState(profileUser.title_badge || '');
  const [editBio, setEditBio] = useState(profileUser.bio || '');

  const startEditing = () => {
    setEditName(currentUser.name);
    setEditBadge(currentUser.title_badge || '');
    setEditBio(currentUser.bio || '');
    setIsEditing(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    await updateUserProfile({
      name: editName.trim(),
      title_badge: editBadge.trim(),
      bio: editBio.trim(),
    });
    setIsEditing(false);
  };

  // 1. Works / Book Essays written by this user
  const userWorks = useMemo((): Work[] => {
    return works.filter(
      (w) =>
        w.submitted_by_id === profileUser.id ||
        w.submitted_by?.id === profileUser.id ||
        (w.submitted_by?.name &&
          w.submitted_by.name.toLowerCase() === profileUser.name.toLowerCase())
    );
  }, [works, profileUser]);

  // 2. Topics / Essays written by this user
  const userTopics = useMemo((): Topic[] => {
    return topics.filter(
      (t) =>
        t.author_id === profileUser.id ||
        t.author?.id === profileUser.id ||
        (t.author?.name &&
          t.author.name.toLowerCase() === profileUser.name.toLowerCase())
    );
  }, [topics, profileUser]);

  // 3. All Comments & Replies written by this user across Works and Topics
  const userComments = useMemo((): FlattenedUserComment[] => {
    const collected: FlattenedUserComment[] = [];

    const traverseComments = (
      list: Comment[] | undefined,
      targetType: 'WORK' | 'TOPIC',
      targetTitle: string,
      targetSlug: string,
      targetSubtitle?: string
    ) => {
      if (!list) return;
      for (const c of list) {
        const matchesAuthor =
          c.author_id === profileUser.id ||
          c.author?.id === profileUser.id ||
          (c.author?.name &&
            c.author.name.toLowerCase() === profileUser.name.toLowerCase());

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
      traverseComments(w.comments, 'WORK', w.title, w.slug, w.creator);
    }

    for (const t of topics) {
      traverseComments(t.comments, 'TOPIC', t.title, t.slug, t.category?.name);
    }

    return collected.sort(
      (a, b) =>
        new Date(b.comment.created_at).getTime() -
        new Date(a.comment.created_at).getTime()
    );
  }, [works, topics, profileUser]);

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
      : 'Membro da Comunidade';

  const pendingCount =
    userWorks.filter((w) => w.status === 'PENDING').length +
    userTopics.filter((t) => t.status === 'PENDING').length;

  return (
    <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* 1. CABEÇALHO DO PERFIL DO AUTOR */}
      <section className="rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment-warm dark:bg-slateDark-card p-4 sm:p-8 shadow-editorial space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-burgundy dark:bg-slateDark-elevated border-2 border-burgundy/30 dark:border-gold/50 flex items-center justify-center font-serif text-2xl sm:text-3xl font-bold text-parchment dark:text-gold shadow-md shrink-0">
              {profileUser.name.charAt(0).toUpperCase()}
            </div>

            {/* Identificação */}
            <div className="space-y-2">
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

              {profileUser.bio && (
                <p className="text-sm sm:text-base text-ink dark:text-slateDark-text max-w-2xl leading-relaxed pt-1">
                  {profileUser.bio}
                </p>
              )}
            </div>
          </div>

          {/* Ações do Próprio Perfil */}
          {isOwnProfile && (
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {!isEditing && (
                <button
                  type="button"
                  onClick={startEditing}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-elevated text-xs sm:text-sm font-semibold text-ink dark:text-slateDark-text hover:border-burgundy transition-colors"
                >
                  <Edit3 className="w-4 h-4 text-burgundy dark:text-gold" />
                  <span>Editar Perfil</span>
                </button>
              )}
              <Link
                to="/escrever"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-burgundy hover:bg-burgundy-hover dark:bg-gold dark:text-slateDark-bg text-parchment text-xs sm:text-sm font-semibold shadow-sm transition-colors"
              >
                <Feather className="w-4 h-4" />
                <span>Escrever Novo Texto</span>
              </Link>
            </div>
          )}
        </div>

        {/* Formulário de Edição Rápida do Perfil */}
        {isOwnProfile && isEditing && (
          <form
            onSubmit={handleSaveProfile}
            className="pt-5 border-t border-parchment-deep dark:border-slateDark-border space-y-4"
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-parchment-deep dark:border-slateDark-border">
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
      </section>

      {/* 2. ABAS: RESENHAS DE OBRAS | ENSAIOS | COMENTÁRIOS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 sm:flex-wrap no-scrollbar -mx-3.5 px-3.5 sm:mx-0 sm:px-0 border-b border-parchment-deep dark:border-slateDark-border">
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

                    <div className="pt-1 flex items-center justify-between text-xs">
                      <span className="text-ink-muted dark:text-slateDark-muted">
                        {work.comments?.length || 0} comentários recebidos
                      </span>
                      <div className="flex items-center gap-3">
                        {isOwnProfile && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Tem certeza que deseja apagar a resenha "${work.title}"?`)) {
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

                  <div className="pt-2 flex items-center justify-between text-xs text-ink-secondary dark:text-slateDark-muted">
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
                    <div className="flex items-center gap-3">
                      {isOwnProfile && (
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`Tem certeza que deseja apagar o ensaio "${topic.title}"?`)) {
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
                  : `/topicos/${targetSlug}#comentarios-topico`;

              return (
                <div
                  key={`uc-${comment.id}`}
                  className="p-4 sm:p-6 rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-card shadow-editorial space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-parchment-deep dark:border-slateDark-border text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-parchment-warm dark:bg-slateDark-elevated font-bold text-burgundy dark:text-gold">
                        Comentou em {targetType === 'WORK' ? 'Obra' : 'Ensaio'}:
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
                          onClick={() => {
                            if (window.confirm('Tem certeza que deseja apagar este comentário?')) {
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
