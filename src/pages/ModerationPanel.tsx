import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  CheckCircle2,
  EyeOff,
  UserX,
  Settings,
  ShoppingBag,
  AlertTriangle,
  Filter,
  Lock,
  ExternalLink,
  Save,
  Users,
  ShieldCheck,
  LogIn,
  Trash2,
  ClipboardList,
  Clock,
  BookOpen,
  MessageSquare,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FlagReason, Comment } from '../types/schema';
import { buildAffiliateUrl } from '../services/api';

export const ModerationPanel: React.FC = () => {
  const {
    currentUser,
    permissions,
    usersList,
    updateUserRoleRbac,
    moderationFlags,
    moderationLogs,
    works,
    topics,
    settings,
    resolveFlag,
    moderateWorkStatus,
    moderateTopicStatus,
    deleteByModerator,
    updateGlobalSettings,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    'QUEUE' | 'CONTENT_MANAGER' | 'AUDIT_LOGS' | 'RBAC_USERS'
  >('QUEUE');
  const [filterStatus, setFilterStatus] = useState<'PENDING' | 'ALL'>('PENDING');
  const [notesByFlagId, setNotesByFlagId] = useState<Record<number, string>>({});
  const [deleteTarget, setDeleteTarget] = useState<{
    type: 'WORK' | 'TOPIC' | 'COMMENT';
    id: number;
    title: string;
    authorName: string;
  } | null>(null);
  const [deleteReasonInput, setDeleteReasonInput] = useState(
    'Conteúdo removido pela Moderação por descumprimento das diretrizes editoriais.'
  );

  // Admin Affiliate Tag Configuration State
  const [tagInput, setTagInput] = useState(settings.amazon_associate_tag);
  const [disclaimerInput, setDisclaimerInput] = useState(
    settings.default_affiliate_disclaimer
  );
  const [requireModInput, setRequireModInput] = useState(
    settings.require_moderation_for_new_works
  );

  const isAuthorized = permissions.can_moderate_queue;
  const isAdmin = permissions.can_manage_roles;

  const reasonLabels: Record<FlagReason, { label: string; color: string }> = {
    SPAM: {
      label: 'Spam Comercial / Bot',
      color: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
    },
    UNETHICAL_CONDUCT: {
      label: 'Conduta Antiética',
      color: 'bg-red-500/15 text-red-800 dark:text-red-300 border-red-500/30',
    },
    GUIDELINE_VIOLATION: {
      label: 'Violação da Carta de Princípios',
      color: 'bg-burgundy/15 text-burgundy dark:text-gold border-burgundy/30',
    },
    IRREVERENCE: {
      label: 'Irreverência Grave',
      color: 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30',
    },
    BROKEN_AFFILIATE_LINK: {
      label: 'Revisão de Curadoria / Link de Afiliado',
      color: 'bg-forest/15 text-forest dark:text-emerald-300 border-forest/30',
    },
  };

  const displayedFlags = moderationFlags.filter((f) =>
    filterStatus === 'PENDING' ? f.status === 'PENDING' : true
  );

  const pendingWorks = works.filter((w) => w.status === 'PENDING');
  const pendingTopics = topics.filter((t) => t.status === 'PENDING');

  // Flatten all comments across works and topics for the Content Manager tab
  const allCommentsFlat = React.useMemo(() => {
    const list: Array<{
      comment: Comment;
      contextLabel: string;
      contextLink: string;
    }> = [];
    const walk = (items: Comment[], label: string, link: string) => {
      for (const c of items) {
        if (c.status !== 'HIDDEN') {
          list.push({ comment: c, contextLabel: label, contextLink: link });
        }
        if (c.replies?.length) {
          walk(c.replies, label, link);
        }
      }
    };
    works.forEach((w) =>
      walk(w.comments || [], `Obra: ${w.title}`, `/obras/${w.slug}`)
    );
    topics.forEach((t) =>
      walk(t.comments || [], `Ensaio: ${t.title}`, `/topicos/${t.slug}`)
    );
    return list;
  }, [works, topics]);

  const formatActionBadge = (actionType: string) => {
    if (actionType.startsWith('DELETE_')) {
      return {
        label: actionType.replace('DELETE_', 'EXCLUSÃO DE '),
        color: 'bg-red-600/15 text-red-700 dark:text-red-300 border-red-600/30',
      };
    }
    if (actionType.includes('APPROVE')) {
      return {
        label: 'APROVAÇÃO EDITORIAL',
        color: 'bg-forest/15 text-forest dark:text-emerald-300 border-forest/30',
      };
    }
    if (actionType.includes('REJECT') || actionType.includes('HIDE')) {
      return {
        label: 'REPROVAÇÃO / OCULTAÇÃO',
        color: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
      };
    }
    if (actionType.includes('BAN')) {
      return {
        label: 'SUSPENSÃO DE CONTA',
        color: 'bg-red-700 text-white border-red-800',
      };
    }
    return {
      label: actionType,
      color: 'bg-navy/15 text-navy dark:text-gold border-navy/30',
    };
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateGlobalSettings({
      amazon_associate_tag: tagInput.trim() || 'veritaslitterae-20',
      default_affiliate_disclaimer: disclaimerInput.trim(),
      require_moderation_for_new_works: requireModInput,
    });
  };

  if (!isAuthorized) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="p-8 rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment-warm dark:bg-slateDark-card text-center space-y-5 shadow-editorial">
          <div className="w-12 h-12 rounded-full bg-burgundy/10 dark:bg-gold/15 text-burgundy dark:text-gold flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-ink dark:text-slateDark-text">
            Acesso Restrito pelo Controle RBAC
          </h2>
          <p className="text-sm text-ink-secondary dark:text-slateDark-muted max-w-lg mx-auto leading-relaxed">
            Seu papel atual é <strong>{currentUser.role}</strong> ({currentUser.name}).
            Apenas usuários autenticados com papel <strong>MODERATOR</strong> ou{' '}
            <strong>ADMIN</strong> possuem permissão para acessar a Fila de Moderação e a
            Gestão de Usuários.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-md bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg text-xs font-semibold"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Fazer Login</span>
            </Link>
            <Link
              to="/"
              className="px-4 py-2.5 rounded-md border border-parchment-deep dark:border-slateDark-border text-xs font-medium text-ink-secondary dark:text-slateDark-muted"
            >
              Voltar ao Início
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-parchment-deep dark:border-slateDark-border pb-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-burgundy dark:text-gold">
            <ShieldAlert className="w-4 h-4" />
            <span>Governança Comunitária, RBAC &amp; Curadoria Ética</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-ink dark:text-slateDark-text">
            Painel de Moderação, RBAC &amp; Afiliados
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted dark:text-slateDark-muted">
            Autenticado como <strong>{currentUser.name}</strong> • Papel RBAC:{' '}
            <span className="px-2 py-0.5 rounded bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg font-bold text-xs">
              {currentUser.role}
            </span>
          </p>
        </div>

        {/* Tab Selector: Fila, Exclusão de Conteúdos, Logs de Auditoria, e Usuários RBAC */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('QUEUE')}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold border transition-all ${
              activeTab === 'QUEUE'
                ? 'bg-burgundy text-parchment border-burgundy dark:bg-gold dark:text-slateDark-bg'
                : 'bg-parchment-warm dark:bg-slateDark-card text-ink-secondary dark:text-slateDark-muted border-parchment-deep dark:border-slateDark-border'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>
              Fila de Revisão (
              {moderationFlags.filter((f) => f.status === 'PENDING').length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CONTENT_MANAGER')}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold border transition-all ${
              activeTab === 'CONTENT_MANAGER'
                ? 'bg-red-700 text-white border-red-700'
                : 'bg-parchment-warm dark:bg-slateDark-card text-ink-secondary dark:text-slateDark-muted border-parchment-deep dark:border-slateDark-border'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>
              Excluir Conteúdos (
              {works.length + topics.length + allCommentsFlat.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('AUDIT_LOGS')}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold border transition-all ${
              activeTab === 'AUDIT_LOGS'
                ? 'bg-forest text-parchment border-forest dark:bg-emerald-500 dark:text-slateDark-bg'
                : 'bg-parchment-warm dark:bg-slateDark-card text-ink-secondary dark:text-slateDark-muted border-parchment-deep dark:border-slateDark-border'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>Logs de Auditoria ({moderationLogs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('RBAC_USERS')}
            className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-lg text-xs font-semibold border transition-all ${
              activeTab === 'RBAC_USERS'
                ? 'bg-navy text-parchment border-navy dark:bg-gold dark:text-slateDark-bg'
                : 'bg-parchment-warm dark:bg-slateDark-card text-ink-secondary dark:text-slateDark-muted border-parchment-deep dark:border-slateDark-border'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Usuários RBAC ({usersList.length})</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT/MAIN COLUMN (8 COLS) */}
        <div className="lg:col-span-8 space-y-6">
          {activeTab === 'QUEUE' ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="font-serif text-2xl font-bold text-ink dark:text-slateDark-text flex items-center gap-2">
                  <Filter className="w-5 h-5 text-burgundy dark:text-gold" />
                  <span>Fila de Sinalizações &amp; Curadoria</span>
                </h2>

                <div className="inline-flex rounded-md border border-parchment-deep dark:border-slateDark-border bg-parchment-warm dark:bg-slateDark-card p-0.5 text-xs">
                  <button
                    onClick={() => setFilterStatus('PENDING')}
                    className={`px-3 py-1 rounded font-medium ${
                      filterStatus === 'PENDING'
                        ? 'bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg'
                        : 'text-ink-muted'
                    }`}
                  >
                    Pendentes (
                    {moderationFlags.filter((f) => f.status === 'PENDING').length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('ALL')}
                    className={`px-3 py-1 rounded font-medium ${
                      filterStatus === 'ALL'
                        ? 'bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg'
                        : 'text-ink-muted'
                    }`}
                  >
                    Histórico Completo ({moderationFlags.length})
                  </button>
                </div>
              </div>

              {displayedFlags.length === 0 ? (
                <div className="p-10 rounded-lg border border-parchment-deep dark:border-slateDark-border bg-parchment-warm/50 dark:bg-slateDark-card text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-forest dark:text-emerald-400 mx-auto" />
                  <p className="font-serif text-lg font-bold text-ink dark:text-slateDark-text">
                    A fila de moderação está limpa!
                  </p>
                  <p className="text-xs text-ink-muted dark:text-slateDark-muted">
                    Todas as sinalizações pendentes foram deliberadas pelo Conselho
                    Editorial.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayedFlags.map((flag) => {
                    const reasonMeta =
                      reasonLabels[flag.reason] || reasonLabels.GUIDELINE_VIOLATION;
                    const isPending = flag.status === 'PENDING';

                    return (
                      <div
                        key={flag.id}
                        className="p-5 sm:p-6 rounded-lg border border-parchment-deep dark:border-slateDark-border bg-parchment-warm/70 dark:bg-slateDark-card shadow-editorial space-y-4"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-ink text-parchment dark:bg-slateDark-elevated dark:text-gold">
                              {flag.target_type} #{flag.target_id}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${reasonMeta.color}`}
                            >
                              {reasonMeta.label}
                            </span>
                          </div>

                          <span
                            className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded ${
                              isPending
                                ? 'bg-amber-500/20 text-amber-900 dark:text-amber-300'
                                : flag.status === 'RESOLVED_APPROVED'
                                ? 'bg-forest/20 text-forest dark:text-emerald-300'
                                : 'bg-burgundy/20 text-burgundy dark:text-red-300'
                            }`}
                          >
                            {flag.status === 'PENDING'
                              ? 'Aguardando Deliberação'
                              : flag.status === 'RESOLVED_APPROVED'
                              ? 'Aprovado & Mantido'
                              : flag.status === 'RESOLVED_HIDDEN'
                              ? 'Ocultado (Soft Delete)'
                              : 'Autor Banido'}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <h3 className="font-serif text-lg font-bold text-ink dark:text-slateDark-text">
                            {flag.target_title}
                          </h3>
                          <div className="p-3.5 rounded bg-parchment dark:bg-slateDark-elevated border-l-2 border-burgundy dark:border-gold text-xs sm:text-sm text-ink-secondary dark:text-slateDark-text italic font-literary">
                            “{flag.target_excerpt}”
                          </div>
                        </div>

                        <div className="text-xs text-ink-muted dark:text-slateDark-muted flex flex-wrap items-center justify-between gap-2 bg-parchment/60 dark:bg-slateDark-bg/50 p-3 rounded border border-parchment-deep/60 dark:border-slateDark-border">
                          <div>
                            <strong className="text-ink dark:text-slateDark-text">
                              Autor Sinalizado:
                            </strong>{' '}
                            {flag.target_author_name} •{' '}
                            <strong className="text-ink dark:text-slateDark-text">
                              Reportado por:
                            </strong>{' '}
                            {flag.reporter_name}
                          </div>
                          <p className="w-full text-ink-secondary dark:text-slateDark-muted mt-1">
                            <strong>Nota da denúncia:</strong> {flag.details}
                          </p>
                        </div>

                        {isPending ? (
                          <div className="pt-2 space-y-3">
                            <input
                              type="text"
                              value={notesByFlagId[flag.id] || ''}
                              onChange={(e) =>
                                setNotesByFlagId((prev) => ({
                                  ...prev,
                                  [flag.id]: e.target.value,
                                }))
                              }
                              placeholder="Justificativa do Moderador..."
                              className="w-full px-3 py-2 rounded border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text text-xs focus:outline-none focus:border-burgundy"
                            />

                            <div className="flex flex-wrap items-center gap-2.5">
                              <button
                                onClick={() =>
                                  resolveFlag(
                                    flag.id,
                                    'APPROVE',
                                    notesByFlagId[flag.id] ||
                                      'Conteúdo verificado e aprovado pela curadoria.'
                                  )
                                }
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-forest hover:bg-forest-hover text-parchment text-xs font-semibold transition-colors shadow-sm"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Aprovar &amp; Manter</span>
                              </button>

                              <button
                                onClick={() =>
                                  resolveFlag(
                                    flag.id,
                                    'HIDE',
                                    notesByFlagId[flag.id] ||
                                      'Ocultado (Soft Delete) por descumprimento das diretrizes editoriais.'
                                  )
                                }
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-navy hover:bg-navy-hover text-parchment text-xs font-semibold transition-colors shadow-sm"
                              >
                                <EyeOff className="w-3.5 h-3.5" />
                                <span>Ocultar (Soft Delete)</span>
                              </button>

                              {permissions.can_ban_users ? (
                                <button
                                  onClick={() =>
                                    resolveFlag(
                                      flag.id,
                                      'BAN_USER',
                                      notesByFlagId[flag.id] ||
                                        'Conta banida por spam ou violação grave da Carta de Princípios.'
                                    )
                                  }
                                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-burgundy hover:bg-burgundy-hover text-parchment text-xs font-semibold transition-colors shadow-sm ml-auto"
                                >
                                  <UserX className="w-3.5 h-3.5" />
                                  <span>Banir Autor &amp; Remover (Admin)</span>
                                </button>
                              ) : (
                                <span className="ml-auto text-[11px] text-ink-muted italic">
                                  Banimento permanente restrito ao papel ADMIN
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          flag.moderator_note && (
                            <div className="p-3 rounded bg-forest/10 dark:bg-slateDark-elevated text-xs text-ink-secondary dark:text-slateDark-text">
                              <strong>Parecer da Moderação:</strong> {flag.moderator_note}
                            </div>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {(pendingWorks.length > 0 || pendingTopics.length > 0) && (
                <div className="p-5 rounded-xl border-2 border-amber-500/80 bg-amber-50/80 dark:bg-amber-950/40 space-y-4">
                  <h3 className="font-serif text-xl font-bold text-ink dark:text-slateDark-text flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    <span>
                      Textos Aguardando Revisão Obrigatória (
                      {pendingWorks.length + pendingTopics.length})
                    </span>
                  </h3>

                  {pendingWorks.map((w) => (
                    <div
                      key={`mod-w-${w.id}`}
                      className="p-4 rounded-lg border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-card flex flex-wrap items-center justify-between gap-4"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-burgundy text-parchment text-xs font-bold uppercase">
                            Obra / Resenha
                          </span>
                          <Link
                            to={`/obras/${w.slug}`}
                            className="font-serif font-bold text-lg text-ink dark:text-slateDark-text hover:text-burgundy dark:hover:text-gold"
                          >
                            {w.title} — {w.creator}
                          </Link>
                        </div>
                        <p className="text-xs text-ink-secondary dark:text-slateDark-muted">
                          Submetida por <strong>{w.submitted_by?.name || 'Membro'}</strong> • Ano{' '}
                          {w.release_year}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          to={`/obras/${w.slug}`}
                          className="px-3 py-1.5 rounded border border-parchment-deep dark:border-slateDark-border text-xs font-semibold text-ink dark:text-slateDark-text hover:border-burgundy"
                        >
                          Revisar Texto Completo
                        </Link>
                        <button
                          onClick={() =>
                            moderateWorkStatus(
                              w.id,
                              'APPROVED',
                              'Aprovado pela Moderação.'
                            )
                          }
                          className="px-3.5 py-1.5 rounded bg-forest hover:bg-forest-hover text-parchment text-xs font-semibold"
                        >
                          Aprovar &amp; Publicar
                        </button>
                        <button
                          onClick={() =>
                            moderateWorkStatus(
                              w.id,
                              'REJECTED',
                              'Reprovado na revisão editorial.'
                            )
                          }
                          className="px-3.5 py-1.5 rounded bg-burgundy hover:bg-burgundy-hover text-parchment text-xs font-semibold"
                        >
                          Reprovar
                        </button>
                      </div>
                    </div>
                  ))}

                  {pendingTopics.map((t) => (
                    <div
                      key={`mod-t-${t.id}`}
                      className="p-4 rounded-lg border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-card flex flex-wrap items-center justify-between gap-4"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-navy text-parchment text-xs font-bold uppercase">
                            Ensaio
                          </span>
                          <Link
                            to={`/topicos/${t.slug}`}
                            className="font-serif font-bold text-lg text-ink dark:text-slateDark-text hover:text-burgundy dark:hover:text-gold"
                          >
                            {t.title}
                          </Link>
                        </div>
                        <p className="text-xs text-ink-secondary dark:text-slateDark-muted">
                          Submetido por <strong>{t.author?.name || 'Membro'}</strong>
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Link
                          to={`/topicos/${t.slug}`}
                          className="px-3 py-1.5 rounded border border-parchment-deep dark:border-slateDark-border text-xs font-semibold text-ink dark:text-slateDark-text hover:border-burgundy"
                        >
                          Revisar Ensaio Completo
                        </Link>
                        <button
                          onClick={() =>
                            moderateTopicStatus(
                              t.id,
                              'APPROVED',
                              'Ensaio aprovado pela Moderação.'
                            )
                          }
                          className="px-3.5 py-1.5 rounded bg-forest hover:bg-forest-hover text-parchment text-xs font-semibold"
                        >
                          Aprovar &amp; Publicar
                        </button>
                        <button
                          onClick={() =>
                            moderateTopicStatus(
                              t.id,
                              'REJECTED',
                              'Ensaio reprovado na revisão editorial.'
                            )
                          }
                          className="px-3.5 py-1.5 rounded bg-burgundy hover:bg-burgundy-hover text-parchment text-xs font-semibold"
                        >
                          Reprovar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : activeTab === 'CONTENT_MANAGER' ? (
            /* TAB 2: GERENCIAR & EXCLUIR QUALQUER CONTEÚDO (OBRAS, ENSAIOS, COMENTÁRIOS) COM LOG */
            <div className="space-y-6">
              <div>
                <h2 className="font-serif text-2xl font-bold text-ink dark:text-slateDark-text flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-red-700 dark:text-red-400" />
                  <span>Exclusão Auditada de Conteúdos</span>
                </h2>
                <p className="text-xs sm:text-sm text-ink-muted dark:text-slateDark-muted mt-1">
                  A Moderação pode excluir qualquer obra, ensaio ou comentário da
                  plataforma. Toda exclusão requer justificativa e gera um registro
                  imutável na aba <strong>Logs de Auditoria</strong>.
                </p>
              </div>

              {/* Obras & Resenhas */}
              <div className="space-y-3">
                <h3 className="font-serif text-lg font-bold text-ink dark:text-slateDark-text flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-burgundy dark:text-gold" />
                  <span>Obras &amp; Resenhas ({works.length})</span>
                </h3>
                {works.map((w) => (
                  <div
                    key={`del-w-${w.id}`}
                    className="p-4 rounded-lg border border-parchment-deep dark:border-slateDark-border bg-parchment-warm/70 dark:bg-slateDark-card flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <Link
                        to={`/obras/${w.slug}`}
                        className="font-serif font-bold text-base text-ink dark:text-slateDark-text hover:text-burgundy dark:hover:text-gold"
                      >
                        {w.title} ({w.creator})
                      </Link>
                      <p className="text-xs text-ink-muted dark:text-slateDark-muted">
                        Status: <strong>{w.status}</strong> • Enviado por{' '}
                        {w.submitted_by?.name || 'Curadoria'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteTarget({
                          type: 'WORK',
                          id: w.id,
                          title: w.title,
                          authorName: w.submitted_by?.name || w.creator,
                        });
                        setDeleteReasonInput(
                          'Obra/resenha excluída pela Moderação.'
                        );
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir Obra</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Ensaios & Tópicos */}
              <div className="space-y-3 pt-2">
                <h3 className="font-serif text-lg font-bold text-ink dark:text-slateDark-text flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-navy dark:text-gold" />
                  <span>Ensaios &amp; Tópicos do Fórum ({topics.length})</span>
                </h3>
                {topics.map((t) => (
                  <div
                    key={`del-t-${t.id}`}
                    className="p-4 rounded-lg border border-parchment-deep dark:border-slateDark-border bg-parchment-warm/70 dark:bg-slateDark-card flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <Link
                        to={`/topicos/${t.slug}`}
                        className="font-serif font-bold text-base text-ink dark:text-slateDark-text hover:text-burgundy dark:hover:text-gold"
                      >
                        {t.title}
                      </Link>
                      <p className="text-xs text-ink-muted dark:text-slateDark-muted">
                        Status: <strong>{t.status}</strong> • Autor:{' '}
                        {t.author?.name || 'Membro'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteTarget({
                          type: 'TOPIC',
                          id: t.id,
                          title: t.title,
                          authorName: t.author?.name || 'Membro',
                        });
                        setDeleteReasonInput('Ensaio excluído pela Moderação.');
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir Ensaio</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* Comentários */}
              <div className="space-y-3 pt-2">
                <h3 className="font-serif text-lg font-bold text-ink dark:text-slateDark-text flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-forest dark:text-gold" />
                  <span>Comentários da Comunidade ({allCommentsFlat.length})</span>
                </h3>
                {allCommentsFlat.map(({ comment, contextLabel, contextLink }) => (
                  <div
                    key={`del-c-${comment.id}`}
                    className="p-4 rounded-lg border border-parchment-deep dark:border-slateDark-border bg-parchment-warm/70 dark:bg-slateDark-card flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <strong className="text-ink dark:text-slateDark-text">
                          {comment.author?.name || 'Membro'}
                        </strong>
                        <span className="text-ink-muted">em</span>
                        <Link
                          to={contextLink}
                          className="text-burgundy dark:text-gold font-semibold hover:underline"
                        >
                          {contextLabel}
                        </Link>
                      </div>
                      <p className="text-xs sm:text-sm text-ink-secondary dark:text-slateDark-muted line-clamp-2 font-literary">
                        “{comment.body}”
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setDeleteTarget({
                          type: 'COMMENT',
                          id: comment.id,
                          title: `Comentário #${comment.id}: ${comment.body.slice(0, 70)}`,
                          authorName: comment.author?.name || 'Membro',
                        });
                        setDeleteReasonInput(
                          'Comentário removido pela Moderação.'
                        );
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow-sm shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Excluir Comentário</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === 'AUDIT_LOGS' ? (
            /* TAB 3: LOGS DE AUDITORIA DA MODERAÇÃO */
            <div className="space-y-5">
              <div>
                <h2 className="font-serif text-2xl font-bold text-ink dark:text-slateDark-text flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-forest dark:text-emerald-400" />
                  <span>Livro de Logs de Auditoria da Moderação ({moderationLogs.length})</span>
                </h2>
                <p className="text-xs sm:text-sm text-ink-muted dark:text-slateDark-muted mt-1">
                  Registro transparente e cronológico de todas as exclusões, aprovações,
                  reprovações e alterações administrativas realizadas pelos moderadores.
                </p>
              </div>

              {moderationLogs.length === 0 ? (
                <div className="p-8 rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment-warm/50 dark:bg-slateDark-card text-center text-sm text-ink-muted">
                  Nenhum registro de auditoria até o momento.
                </div>
              ) : (
                <div className="space-y-3">
                  {moderationLogs.map((log) => {
                    const badge = formatActionBadge(log.action_type);
                    return (
                      <div
                        key={log.id}
                        className="p-5 rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment-warm/70 dark:bg-slateDark-card space-y-2.5 shadow-editorial"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase border ${badge.color}`}
                            >
                              {badge.label}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-ink text-parchment dark:bg-slateDark-elevated dark:text-gold text-[10px] font-mono font-bold">
                              {log.target_type} {log.target_id ? `#${log.target_id}` : ''}
                            </span>
                          </div>
                          <span className="inline-flex items-center gap-1 text-xs text-ink-muted dark:text-slateDark-muted">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(log.created_at).toLocaleString('pt-BR')}
                          </span>
                        </div>

                        <div>
                          <h4 className="font-serif font-bold text-base sm:text-lg text-ink dark:text-slateDark-text">
                            {log.target_title}
                          </h4>
                          {log.target_author_name && (
                            <p className="text-xs text-ink-secondary dark:text-slateDark-muted">
                              Autor do conteúdo: <strong>{log.target_author_name}</strong>
                            </p>
                          )}
                        </div>

                        <div className="p-3 rounded-lg bg-parchment dark:bg-slateDark-elevated border border-parchment-deep/70 dark:border-slateDark-border text-xs sm:text-sm text-ink dark:text-slateDark-text">
                          <strong className="text-burgundy dark:text-gold">
                            Justificativa / Motivo registrado:
                          </strong>{' '}
                          {log.reason || 'Ação registrada pela Moderação.'}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted dark:text-slateDark-muted pt-1">
                          <span>
                            Executado por:{' '}
                            <strong className="text-ink dark:text-slateDark-text">
                              {log.actor_name}
                            </strong>{' '}
                            <span className="px-1.5 py-0.5 rounded bg-burgundy/15 text-burgundy dark:bg-gold/20 dark:text-gold font-bold text-[10px]">
                              {log.actor_role}
                            </span>
                          </span>
                          {log.ip_address && (
                            <span className="font-mono text-[11px]">
                              IP: {log.ip_address}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* TAB 4: GESTÃO DE USUÁRIOS & PAPÉIS RBAC */
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-ink dark:text-slateDark-text flex items-center gap-2">
                    <Users className="w-5 h-5 text-burgundy dark:text-gold" />
                    <span>Controle de Acesso Baseado em Papéis (RBAC)</span>
                  </h2>
                  <p className="text-xs text-ink-muted dark:text-slateDark-muted mt-0.5">
                    Gerencie os privilégios de cada membro cadastrado no banco de dados
                    Laravel.
                  </p>
                </div>
              </div>

              {!isAdmin && (
                <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>
                    Você está autenticado como <strong>MODERATOR</strong>. Você pode
                    visualizar o quadro de membros, mas apenas o papel{' '}
                    <strong>ADMIN</strong> pode promover/rebaixar papéis ou banir contas.
                  </span>
                </div>
              )}

              <div className="space-y-3">
                {usersList.map((u) => (
                  <div
                    key={u.id}
                    className="p-5 rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment-warm/70 dark:bg-slateDark-card flex flex-wrap items-center justify-between gap-4 shadow-editorial"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-serif font-bold text-base text-ink dark:text-slateDark-text">
                          {u.name}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            u.role === 'ADMIN'
                              ? 'bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg'
                              : u.role === 'MODERATOR'
                              ? 'bg-navy text-parchment'
                              : 'bg-forest/15 text-forest dark:text-emerald-300'
                          }`}
                        >
                          {u.role}
                        </span>
                        {u.is_banned && (
                          <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[10px] font-bold uppercase">
                            Banido
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-ink-muted dark:text-slateDark-muted font-mono">
                        {u.email} • {u.title_badge || 'Membro'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-ink-muted dark:text-slateDark-muted">
                          Papel RBAC:
                        </span>
                        <select
                          disabled={!isAdmin}
                          value={u.role}
                          onChange={(e) =>
                            updateUserRoleRbac(u.id, {
                              role: e.target.value as 'MEMBER' | 'MODERATOR' | 'ADMIN',
                            })
                          }
                          className="px-2.5 py-1.5 rounded border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text text-xs font-semibold disabled:opacity-50"
                        >
                          <option value="MEMBER">MEMBER (Membro)</option>
                          <option value="MODERATOR">MODERATOR (Moderador)</option>
                          <option value="ADMIN">ADMIN (Administrador)</option>
                        </select>
                      </div>

                      {isAdmin && u.id !== currentUser.id && (
                        <button
                          type="button"
                          onClick={() =>
                            updateUserRoleRbac(u.id, { is_banned: !u.is_banned })
                          }
                          className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                            u.is_banned
                              ? 'bg-forest text-parchment'
                              : 'bg-burgundy/15 text-burgundy dark:text-red-300 hover:bg-burgundy hover:text-parchment'
                          }`}
                        >
                          {u.is_banned ? 'Reativar Conta' : 'Suspender / Banir'}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: GLOBAL AMAZON AFFILIATE CONFIG & RBAC PERMISSIONS MATRIX (4 COLS) */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Active User RBAC Permissions Card */}
          <div className="p-5 rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment-warm/80 dark:bg-slateDark-card space-y-3 shadow-editorial">
            <div className="flex items-center gap-2 text-burgundy dark:text-gold">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="font-serif text-base font-bold text-ink dark:text-slateDark-text">
                Suas Permissões Ativas ({currentUser.role})
              </h3>
            </div>
            <ul className="space-y-1.5 text-xs text-ink-secondary dark:text-slateDark-muted">
              <li>
                • Publicar sem fila de espera:{' '}
                <strong>{permissions.can_publish_directly ? 'Sim' : 'Não'}</strong>
              </li>
              <li>
                • Deliberar fila de moderação:{' '}
                <strong>{permissions.can_moderate_queue ? 'Sim' : 'Não'}</strong>
              </li>
              <li>
                • Banir contas de usuários:{' '}
                <strong>{permissions.can_ban_users ? 'Sim' : 'Não (Apenas Admin)'}</strong>
              </li>
              <li>
                • Alterar Tag Global Amazon:{' '}
                <strong>
                  {permissions.can_manage_affiliate_settings
                    ? 'Sim'
                    : 'Não (Apenas Admin)'}
                </strong>
              </li>
              <li>
                • Promover/Rebaixar Papéis RBAC:{' '}
                <strong>
                  {permissions.can_manage_roles ? 'Sim' : 'Não (Apenas Admin)'}
                </strong>
              </li>
            </ul>
          </div>

          <div className="p-6 rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment-warm/90 dark:bg-slateDark-card shadow-editorial space-y-5">
            <div className="flex items-center gap-2 border-b border-parchment-deep dark:border-slateDark-border pb-3">
              <Settings className="w-5 h-5 text-burgundy dark:text-gold" />
              <div>
                <h3 className="font-serif text-lg font-bold text-ink dark:text-slateDark-text">
                  Configuração de Afiliados
                </h3>
                <p className="text-[11px] text-ink-muted dark:text-slateDark-muted">
                  Monetização Editorial &amp; Compliance Amazon
                </p>
              </div>
            </div>

            {!permissions.can_manage_affiliate_settings && (
              <div className="p-3 rounded bg-amber-500/10 border border-amber-500/30 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Apenas o papel <strong>ADMIN</strong> pode alterar a tag global de
                  afiliado. Você está como {currentUser.role}.
                </span>
              </div>
            )}

            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted mb-1">
                  Tag Global Amazon Associates *
                </label>
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-forest shrink-0" />
                  <input
                    type="text"
                    disabled={!permissions.can_manage_affiliate_settings}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="ex: veritaslitterae-20"
                    className="w-full px-3 py-2 rounded border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg font-mono text-ink dark:text-slateDark-text disabled:opacity-60"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted mb-1">
                  Disclaimer Ético Obrigatório
                </label>
                <textarea
                  rows={3}
                  disabled={!permissions.can_manage_affiliate_settings}
                  value={disclaimerInput}
                  onChange={(e) => setDisclaimerInput(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text disabled:opacity-60"
                />
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  disabled={!permissions.can_manage_affiliate_settings}
                  checked={requireModInput}
                  onChange={(e) => setRequireModInput(e.target.checked)}
                  className="rounded border-parchment-deep text-burgundy focus:ring-burgundy"
                />
                <span className="text-ink-secondary dark:text-slateDark-text font-medium">
                  Exigir aprovação prévia para novas obras indicadas por membros
                </span>
              </label>

              <div className="p-3 rounded bg-parchment dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-forest dark:text-emerald-300 flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  Preview de URL Gerada em Tempo Real:
                </span>
                <p className="font-mono text-[11px] text-ink-muted dark:text-slateDark-muted break-all">
                  {buildAffiliateUrl(
                    'https://www.amazon.com.br/dp/8532654126',
                    tagInput
                  )}
                </p>
              </div>

              {permissions.can_manage_affiliate_settings && (
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-md bg-burgundy hover:bg-burgundy-hover dark:bg-gold dark:text-slateDark-bg text-parchment font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Configuração Global</span>
                </button>
              )}
            </form>
          </div>
        </aside>
      </div>

      {/* Modal de Confirmação de Exclusão com Registro no Log de Auditoria */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border-2 border-red-600/70 bg-parchment dark:bg-slateDark-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-red-700 dark:text-red-400">
              <Trash2 className="w-5 h-5 shrink-0" />
              <h3 className="font-serif text-lg font-bold">
                Excluir Conteúdo e Registrar Log
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-ink-secondary dark:text-slateDark-muted">
              Item selecionado:{' '}
              <strong className="text-ink dark:text-white">
                “{deleteTarget.title}”
              </strong>{' '}
              (por {deleteTarget.authorName}). Esta ação removerá o item da plataforma e
              gravará um registro permanente nos Logs de Auditoria.
            </p>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted">
                Justificativa Obrigatória para o Log
              </label>
              <textarea
                rows={3}
                value={deleteReasonInput}
                onChange={(e) => setDeleteReasonInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-sm text-ink dark:text-slateDark-text focus:outline-none focus:border-red-600"
              />
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border text-xs font-semibold text-ink-secondary hover:text-ink"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  await deleteByModerator(
                    deleteTarget.type,
                    deleteTarget.id,
                    deleteTarget.title,
                    deleteReasonInput,
                    deleteTarget.authorName
                  );
                  setDeleteTarget(null);
                  setActiveTab('AUDIT_LOGS');
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirmar Exclusão e Ver Log</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
