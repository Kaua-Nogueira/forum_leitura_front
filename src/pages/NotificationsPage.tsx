import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Bell,
  UserPlus,
  UserCheck,
  MessageSquare,
  MessageCircle,
  ThumbsUp,
  CheckCircle2,
  ShieldAlert,
  Award,
  Trash2,
  Check,
  CheckCheck,
  RefreshCw,
  LogIn,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserNotification } from '../types/schema';

type NotifFilter =
  | 'ALL'
  | 'UNREAD'
  | 'FOLLOW'
  | 'COMMENTS'
  | 'UPVOTE'
  | 'DIRECT_MESSAGE'
  | 'MODERATION';

function formatNotifTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diffSec < 60) return 'agora mesmo';
  if (diffSec < 3600) return `há ${Math.floor(diffSec / 60)} min`;
  if (diffSec < 86400) return `há ${Math.floor(diffSec / 3600)}h`;
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getNotifVisual(type: string): {
  icon: React.FC<{ className?: string }>;
  badgeClass: string;
  label: string;
} {
  switch (type) {
    case 'FOLLOW':
      return {
        icon: UserPlus,
        badgeClass: 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30',
        label: 'Novo Seguidor',
      };
    case 'DIRECT_MESSAGE':
      return {
        icon: MessageSquare,
        badgeClass: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30',
        label: 'Mensagem Privada',
      };
    case 'COMMENT_ON_POST':
    case 'REPLY_TO_COMMENT':
      return {
        icon: MessageCircle,
        badgeClass: 'bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30',
        label: type === 'REPLY_TO_COMMENT' ? 'Resposta' : 'Comentário',
      };
    case 'UPVOTE':
      return {
        icon: ThumbsUp,
        badgeClass: 'bg-pink-500/15 text-pink-700 dark:text-pink-300 border-pink-500/30',
        label: 'Apreciação',
      };
    case 'MODERATION_APPROVED':
      return {
        icon: CheckCircle2,
        badgeClass: 'bg-forest/15 text-forest dark:text-emerald-300 border-forest/30',
        label: 'Aprovado',
      };
    case 'MODERATION_REJECTED':
    case 'MODERATION_DELETED':
      return {
        icon: ShieldAlert,
        badgeClass: 'bg-red-600/15 text-red-700 dark:text-red-300 border-red-600/30',
        label: type === 'MODERATION_DELETED' ? 'Removido' : 'Ajustes Solicitados',
      };
    case 'ROLE_UPDATED':
      return {
        icon: Award,
        badgeClass: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
        label: 'Conta / RBAC',
      };
    default:
      return {
        icon: Bell,
        badgeClass: 'bg-burgundy/15 text-burgundy dark:text-gold border-burgundy/30',
        label: 'Atividade',
      };
  }
}

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    notifications,
    unreadNotificationsCount,
    refreshNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    isFollowingUser,
    toggleFollowUser,
  } = useApp();

  const [filter, setFilter] = useState<NotifFilter>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshNotifications();
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      if (filter === 'UNREAD') return !n.read_at;
      if (filter === 'FOLLOW') return n.type === 'FOLLOW';
      if (filter === 'COMMENTS') {
        return n.type === 'COMMENT_ON_POST' || n.type === 'REPLY_TO_COMMENT';
      }
      if (filter === 'UPVOTE') return n.type === 'UPVOTE';
      if (filter === 'DIRECT_MESSAGE') return n.type === 'DIRECT_MESSAGE';
      if (filter === 'MODERATION') {
        return n.type.startsWith('MODERATION_') || n.type === 'ROLE_UPDATED';
      }
      return true;
    });
  }, [notifications, filter]);

  const handleOpenNotification = async (n: UserNotification) => {
    if (!n.read_at) {
      await markNotificationRead(n.id);
    }
    if (n.action_url) {
      navigate(n.action_url);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-14 h-14 rounded-full bg-burgundy/10 dark:bg-gold/15 text-burgundy dark:text-gold flex items-center justify-center mx-auto">
          <Bell className="w-7 h-7" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-ink dark:text-slateDark-text">
          Entre para acompanhar suas Notificações
        </h2>
        <p className="text-base text-ink-secondary dark:text-slateDark-muted">
          Veja quem seguiu você, comentou em seus textos, respondeu seus comentários ou
          enviou mensagens privadas.
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

  return (
    <div className="max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-parchment-deep dark:border-slateDark-border pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-burgundy dark:text-gold shrink-0" />
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink dark:text-slateDark-text">
              Notificações &amp; Atividades Recentes
            </h1>
            {unreadNotificationsCount > 0 && (
              <span className="px-2.5 py-0.5 rounded-full bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg text-xs font-bold">
                {unreadNotificationsCount} não lida(s)
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-ink-muted dark:text-slateDark-muted">
            Tudo o que aconteceu recentemente com você e suas publicações na comunidade.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-parchment-deep dark:border-slateDark-border bg-parchment-warm dark:bg-slateDark-card text-xs font-semibold text-ink dark:text-slateDark-text hover:border-burgundy transition-colors"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isRefreshing ? 'animate-spin text-burgundy dark:text-gold' : ''
              }`}
            />
            <span>Atualizar</span>
          </button>

          {unreadNotificationsCount > 0 && (
            <button
              type="button"
              onClick={markAllNotificationsRead}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-burgundy hover:bg-burgundy-hover dark:bg-gold dark:text-slateDark-bg text-parchment text-xs font-semibold shadow-xs transition-colors"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Marcar todas como lidas</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
        {(
          [
            { id: 'ALL', label: `Todas (${notifications.length})` },
            { id: 'UNREAD', label: `Não Lidas (${unreadNotificationsCount})` },
            { id: 'FOLLOW', label: 'Seguidores' },
            { id: 'COMMENTS', label: 'Comentários & Respostas' },
            { id: 'UPVOTE', label: 'Apreciações' },
            { id: 'DIRECT_MESSAGE', label: 'Mensagens' },
            { id: 'MODERATION', label: 'Moderação & Conta' },
          ] as Array<{ id: NotifFilter; label: string }>
        ).map((pill) => (
          <button
            key={pill.id}
            type="button"
            onClick={() => setFilter(pill.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
              filter === pill.id
                ? 'bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg shadow-xs'
                : 'bg-parchment-warm dark:bg-slateDark-card text-ink-secondary dark:text-slateDark-muted border border-parchment-deep dark:border-slateDark-border hover:border-burgundy/40'
            }`}
          >
            {pill.label}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <div className="p-10 rounded-xl border border-dashed border-parchment-deep dark:border-slateDark-border bg-parchment-warm/50 dark:bg-slateDark-card text-center space-y-2.5">
          <Bell className="w-8 h-8 text-burgundy dark:text-gold mx-auto opacity-60" />
          <p className="font-serif text-lg font-bold text-ink dark:text-slateDark-text">
            Nenhuma notificação nesta categoria
          </p>
          <p className="text-xs text-ink-muted dark:text-slateDark-muted">
            Quando alguém seguir você, comentar em um texto seu, curtir ou enviar mensagem, aparecerá aqui.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((n) => {
            const visual = getNotifVisual(n.type);
            const Icon = visual.icon;
            const isUnread = !n.read_at;
            const canFollowBack =
              n.type === 'FOLLOW' && Boolean(n.actor_id) && !isFollowingUser(n.actor_id!);

            return (
              <div
                key={n.id}
                className={`p-4 sm:p-5 rounded-xl border transition-all shadow-editorial flex flex-col sm:flex-row sm:items-start justify-between gap-3 ${
                  isUnread
                    ? 'bg-burgundy/[0.06] dark:bg-gold/[0.08] border-burgundy/40 dark:border-gold/50'
                    : 'bg-parchment-warm/70 dark:bg-slateDark-card border-parchment-deep dark:border-slateDark-border'
                }`}
              >
                <div
                  onClick={() => handleOpenNotification(n)}
                  className="flex items-start gap-3.5 min-w-0 flex-1 cursor-pointer"
                >
                  {/* Avatar or Type Icon */}
                  <div className="relative shrink-0">
                    {n.actor_avatar_url ? (
                      <img
                        src={n.actor_avatar_url}
                        alt={n.actor_name}
                        className="w-11 h-11 rounded-full object-cover border border-burgundy/30 dark:border-gold/40"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg font-serif font-bold text-base flex items-center justify-center">
                        {(n.actor_name || 'S').charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span
                      className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center border ${visual.badgeClass} bg-parchment dark:bg-slateDark-card`}
                    >
                      <Icon className="w-3 h-3" />
                    </span>
                  </div>

                  <div className="min-w-0 space-y-1 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${visual.badgeClass}`}
                      >
                        {visual.label}
                      </span>
                      {isUnread && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-burgundy dark:text-gold">
                          <span className="w-2 h-2 rounded-full bg-burgundy dark:bg-gold" />
                          Nova
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-[11px] text-ink-muted ml-auto">
                        <Clock className="w-3 h-3" />
                        {formatNotifTime(n.created_at)}
                      </span>
                    </div>

                    <p className="font-serif font-bold text-sm sm:text-base text-ink dark:text-slateDark-text">
                      {n.title}
                    </p>

                    {n.body && (
                      <p className="text-xs sm:text-sm text-ink-secondary dark:text-slateDark-muted line-clamp-2">
                        {n.body}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0 sm:pt-1">
                  {canFollowBack && (
                    <button
                      type="button"
                      onClick={() => toggleFollowUser(n.actor_id!)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-burgundy hover:bg-burgundy-hover dark:bg-gold dark:text-slateDark-bg text-parchment text-xs font-semibold shadow-2xs"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Seguir de volta</span>
                    </button>
                  )}
                  {n.type === 'FOLLOW' && n.actor_id && isFollowingUser(n.actor_id) && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-forest/15 text-forest dark:text-emerald-300 text-xs font-semibold">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Seguindo</span>
                    </span>
                  )}

                  {n.action_url && (
                    <button
                      type="button"
                      onClick={() => handleOpenNotification(n)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-elevated text-xs font-semibold text-ink dark:text-slateDark-text hover:border-burgundy"
                    >
                      <span>Abrir</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}

                  {isUnread && (
                    <button
                      type="button"
                      onClick={() => markNotificationRead(n.id)}
                      title="Marcar como lida"
                      className="p-1.5 rounded-md border border-parchment-deep dark:border-slateDark-border text-ink-muted hover:text-forest dark:hover:text-emerald-300"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => deleteNotification(n.id)}
                    title="Remover notificação"
                    className="p-1.5 rounded-md border border-parchment-deep dark:border-slateDark-border text-ink-muted hover:text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
