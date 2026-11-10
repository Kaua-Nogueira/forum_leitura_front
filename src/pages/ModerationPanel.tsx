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
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FlagReason } from '../types/schema';
import { buildAffiliateUrl } from '../services/api';

export const ModerationPanel: React.FC = () => {
  const {
    currentUser,
    permissions,
    usersList,
    updateUserRoleRbac,
    switchRole,
    moderationFlags,
    works,
    settings,
    resolveFlag,
    moderateWorkStatus,
    updateGlobalSettings,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'QUEUE' | 'RBAC_USERS'>('QUEUE');
  const [filterStatus, setFilterStatus] = useState<'PENDING' | 'ALL'>('PENDING');
  const [notesByFlagId, setNotesByFlagId] = useState<Record<number, string>>({});

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

        {/* Tab Selector: Fila de Moderação vs Gestão de Usuários RBAC */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('QUEUE')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold border transition-all ${
              activeTab === 'QUEUE'
                ? 'bg-burgundy text-parchment border-burgundy dark:bg-gold dark:text-slateDark-bg'
                : 'bg-parchment-warm dark:bg-slateDark-card text-ink-secondary dark:text-slateDark-muted border-parchment-deep dark:border-slateDark-border'
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>
              Fila de Moderação (
              {moderationFlags.filter((f) => f.status === 'PENDING').length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('RBAC_USERS')}
            className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold border transition-all ${
              activeTab === 'RBAC_USERS'
                ? 'bg-navy text-parchment border-navy dark:bg-gold dark:text-slateDark-bg'
                : 'bg-parchment-warm dark:bg-slateDark-card text-ink-secondary dark:text-slateDark-muted border-parchment-deep dark:border-slateDark-border'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Usuários &amp; Papéis RBAC ({usersList.length})</span>
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

              {pendingWorks.length > 0 && (
                <div className="pt-4 space-y-3">
                  <h3 className="font-serif text-xl font-bold text-ink dark:text-slateDark-text">
                    Obras Aguardando Publicação no Catálogo ({pendingWorks.length})
                  </h3>
                  {pendingWorks.map((w) => (
                    <div
                      key={w.id}
                      className="p-4 rounded-lg border border-parchment-deep dark:border-slateDark-border bg-parchment-warm dark:bg-slateDark-card flex flex-wrap items-center justify-between gap-4"
                    >
                      <div>
                        <h4 className="font-serif font-bold text-base text-ink dark:text-slateDark-text">
                          {w.title} — {w.creator}
                        </h4>
                        <p className="text-xs text-ink-muted dark:text-slateDark-muted">
                          Submetida por {w.submitted_by?.name || 'Membro'} • Ano{' '}
                          {w.release_year}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            moderateWorkStatus(
                              w.id,
                              'APPROVED',
                              'Aprovado pela Curadoria.'
                            )
                          }
                          className="px-3 py-1.5 rounded bg-forest text-parchment text-xs font-semibold"
                        >
                          Aprovar no Catálogo
                        </button>
                        <button
                          onClick={() =>
                            moderateWorkStatus(
                              w.id,
                              'REJECTED',
                              'Reprovado por falta de referências bibliográficas.'
                            )
                          }
                          className="px-3 py-1.5 rounded bg-burgundy text-parchment text-xs font-semibold"
                        >
                          Reprovar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* TAB 2: GESTÃO DE USUÁRIOS & PAPÉIS RBAC */
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
    </div>
  );
};
