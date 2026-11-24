import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  Clock,
  Search,
  Filter,
  RefreshCw,
  Download,
  User as UserIcon,
  ShieldAlert,
  Calendar,
  X,
  Activity,
  Lock,
  LogIn,
  Globe,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ModerationLog } from '../types/schema';

type ActionCategory =
  | 'ALL'
  | 'AUTH'
  | 'CONTENT'
  | 'SERIES'
  | 'MODERATION'
  | 'DELETION'
  | 'INTERACTION'
  | 'AFFILIATE';

type PeriodPreset = 'ALL' | 'TODAY' | '24H' | '7D' | '30D';

export function describeActionType(actionType: string): {
  label: string;
  category: ActionCategory;
  color: string;
} {
  const code = (actionType || '').toUpperCase();

  if (code === 'AUTH_LOGIN') {
    return {
      label: 'Login Realizado',
      category: 'AUTH',
      color: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
    };
  }
  if (code === 'AUTH_LOGOUT') {
    return {
      label: 'Logout / Fim de Sessão',
      category: 'AUTH',
      color: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30',
    };
  }
  if (code === 'AUTH_LOGIN_FAILED' || code === 'AUTH_LOGIN_BLOCKED') {
    return {
      label: code === 'AUTH_LOGIN_BLOCKED' ? 'Login Bloqueado (Banido)' : 'Falha de Login',
      category: 'AUTH',
      color: 'bg-red-600/15 text-red-700 dark:text-red-300 border-red-600/30',
    };
  }
  if (code === 'USER_REGISTER') {
    return {
      label: 'Novo Cadastro de Conta',
      category: 'AUTH',
      color: 'bg-forest/15 text-forest dark:text-emerald-300 border-forest/30',
    };
  }
  if (code === 'UPDATE_PROFILE') {
    return {
      label: 'Atualização de Perfil',
      category: 'AUTH',
      color: 'bg-navy/15 text-navy dark:text-sky-300 border-navy/30',
    };
  }
  if (code === 'UPDATE_USER_ROLE') {
    return {
      label: 'Alteração de Papel RBAC',
      category: 'AUTH',
      color: 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30',
    };
  }
  if (code === 'BAN_USER' || code.includes('BAN')) {
    return {
      label: 'Suspensão / Banimento de Conta',
      category: 'AUTH',
      color: 'bg-red-700 text-white border-red-800',
    };
  }
  if (code === 'UNBAN_USER') {
    return {
      label: 'Reativação de Conta',
      category: 'AUTH',
      color: 'bg-forest/15 text-forest dark:text-emerald-300 border-forest/30',
    };
  }

  if (code === 'CREATE_WORK') {
    return {
      label: 'Nova Obra / Resenha Criada',
      category: 'CONTENT',
      color: 'bg-burgundy/15 text-burgundy dark:text-gold border-burgundy/30',
    };
  }
  if (code === 'UPDATE_WORK') {
    return {
      label: 'Edição / Reenvio de Obra',
      category: 'CONTENT',
      color: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
    };
  }
  if (code === 'CREATE_TOPIC') {
    return {
      label: 'Novo Ensaio Criado',
      category: 'CONTENT',
      color: 'bg-navy/15 text-navy dark:text-sky-300 border-navy/30',
    };
  }
  if (code === 'UPDATE_TOPIC') {
    return {
      label: 'Edição / Reenvio de Ensaio',
      category: 'CONTENT',
      color: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
    };
  }

  if (code === 'CREATE_SERIES') {
    return {
      label: 'Nova Série / Caderno Criado',
      category: 'SERIES',
      color: 'bg-burgundy/15 text-burgundy dark:text-gold border-burgundy/30',
    };
  }
  if (code === 'UPDATE_SERIES') {
    return {
      label: 'Edição de Série / Caderno',
      category: 'SERIES',
      color: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
    };
  }
  if (code === 'CREATE_SERIES_ENTRY') {
    return {
      label: 'Nova Nota Publicada em Série',
      category: 'SERIES',
      color: 'bg-forest/15 text-forest dark:text-emerald-300 border-forest/30',
    };
  }
  if (code === 'UPDATE_SERIES_ENTRY') {
    return {
      label: 'Edição de Nota de Série',
      category: 'SERIES',
      color: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
    };
  }

  if (code.startsWith('DELETE_')) {
    const target = code.replace('DELETE_', '');
    return {
      label: `Exclusão de ${target}`,
      category: 'DELETION',
      color: 'bg-red-600/15 text-red-700 dark:text-red-300 border-red-600/30',
    };
  }

  if (code === 'APPROVE_WORK' || code === 'APPROVE_TOPIC' || code === 'RESOLVE_FLAG_APPROVE') {
    return {
      label: 'Aprovação & Publicação Editorial',
      category: 'MODERATION',
      color: 'bg-forest/15 text-forest dark:text-emerald-300 border-forest/30',
    };
  }
  if (code === 'REJECT_WORK' || code === 'REJECT_TOPIC' || code === 'RESOLVE_FLAG_HIDE') {
    return {
      label: 'Reprovação / Pedido de Ajustes',
      category: 'MODERATION',
      color: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
    };
  }
  if (code === 'CREATE_FLAG') {
    return {
      label: 'Sinalização / Denúncia Enviada',
      category: 'MODERATION',
      color: 'bg-orange-500/15 text-orange-800 dark:text-orange-300 border-orange-500/30',
    };
  }

  if (code === 'CREATE_COMMENT' || code === 'REPLY_COMMENT') {
    return {
      label: code === 'REPLY_COMMENT' ? 'Resposta em Comentário' : 'Novo Comentário Publicado',
      category: 'INTERACTION',
      color: 'bg-sky-500/15 text-sky-800 dark:text-sky-300 border-sky-500/30',
    };
  }
  if (code === 'UPVOTE_ADD' || code === 'UPVOTE_REMOVE') {
    return {
      label: code === 'UPVOTE_ADD' ? 'Curtida Registrada' : 'Curtida Removida',
      category: 'INTERACTION',
      color: 'bg-pink-500/15 text-pink-800 dark:text-pink-300 border-pink-500/30',
    };
  }

  if (code === 'UPDATE_AFFILIATE_LINK') {
    return {
      label: 'Link de Afiliado Definido/Editado',
      category: 'AFFILIATE',
      color: 'bg-forest/15 text-forest dark:text-emerald-300 border-forest/30',
    };
  }
  if (code === 'CLICK_AFFILIATE') {
    return {
      label: 'Clique em Link de Afiliado',
      category: 'AFFILIATE',
      color: 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
    };
  }
  if (code === 'UPDATE_SETTINGS') {
    return {
      label: 'Alteração de Configuração Global',
      category: 'AFFILIATE',
      color: 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30',
    };
  }

  return {
    label: code,
    category: 'MODERATION',
    color: 'bg-navy/15 text-navy dark:text-gold border-navy/30',
  };
}

function formatDateTimeExact(iso: string): {
  datePart: string;
  timePart: string;
  relativePart: string;
} {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return { datePart: iso, timePart: '--:--:--', relativePart: '' };
  }
  const datePart = d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const timePart = d.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
  let relativePart = 'agora mesmo';
  if (diffSec >= 60 && diffSec < 3600) {
    relativePart = `há ${Math.floor(diffSec / 60)} min`;
  } else if (diffSec >= 3600 && diffSec < 86400) {
    relativePart = `há ${Math.floor(diffSec / 3600)}h`;
  } else if (diffSec >= 86400) {
    relativePart = `há ${Math.floor(diffSec / 86400)} dia(s)`;
  } else if (diffSec > 5) {
    relativePart = `há ${diffSec}s`;
  }

  return { datePart, timePart, relativePart };
}

export const SystemLogsViewer: React.FC = () => {
  const { moderationLogs, refreshSystemLogs, usersList } = useApp();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [personFilter, setPersonFilter] = useState<string>('ALL');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<ActionCategory>('ALL');
  const [actionCodeFilter, setActionCodeFilter] = useState<string>('ALL');
  const [targetTypeFilter, setTargetTypeFilter] = useState<string>('ALL');
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('ALL');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  useEffect(() => {
    refreshSystemLogs();
  }, [refreshSystemLogs]);

  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      refreshSystemLogs();
    }, 15000);
    return () => clearInterval(timer);
  }, [autoRefresh, refreshSystemLogs]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshSystemLogs();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Unique people list (combining log actors, target authors, and registered users)
  const peopleOptions = useMemo(() => {
    const counts = new Map<string, number>();
    usersList.forEach((u) => {
      if (u.name) counts.set(u.name, counts.get(u.name) || 0);
    });
    moderationLogs.forEach((l) => {
      if (l.actor_name) {
        counts.set(l.actor_name, (counts.get(l.actor_name) || 0) + 1);
      }
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [moderationLogs, usersList]);

  // Unique specific action types present in logs
  const actionTypeOptions = useMemo(() => {
    const counts = new Map<string, number>();
    moderationLogs.forEach((l) => {
      if (l.action_type) {
        counts.set(l.action_type, (counts.get(l.action_type) || 0) + 1);
      }
    });
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [moderationLogs]);

  const filteredLogs = useMemo(() => {
    const now = Date.now();
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    return moderationLogs.filter((log) => {
      const desc = describeActionType(log.action_type);

      if (categoryFilter !== 'ALL' && desc.category !== categoryFilter) {
        return false;
      }

      if (actionCodeFilter !== 'ALL' && log.action_type !== actionCodeFilter) {
        return false;
      }

      if (targetTypeFilter !== 'ALL' && log.target_type !== targetTypeFilter) {
        return false;
      }

      if (roleFilter !== 'ALL' && (log.actor_role || '').toUpperCase() !== roleFilter) {
        return false;
      }

      if (personFilter !== 'ALL') {
        const pLower = personFilter.toLowerCase();
        const actorMatch = (log.actor_name || '').toLowerCase() === pLower;
        const targetAuthorMatch = (log.target_author_name || '').toLowerCase() === pLower;
        if (!actorMatch && !targetAuthorMatch) {
          return false;
        }
      }

      const logTime = new Date(log.created_at).getTime();
      if (!Number.isNaN(logTime)) {
        if (periodPreset === 'TODAY' && logTime < startOfToday.getTime()) return false;
        if (periodPreset === '24H' && now - logTime > 24 * 3600 * 1000) return false;
        if (periodPreset === '7D' && now - logTime > 7 * 24 * 3600 * 1000) return false;
        if (periodPreset === '30D' && now - logTime > 30 * 24 * 3600 * 1000) return false;

        if (dateFrom) {
          const fromTs = new Date(`${dateFrom}T00:00:00`).getTime();
          if (!Number.isNaN(fromTs) && logTime < fromTs) return false;
        }
        if (dateTo) {
          const toTs = new Date(`${dateTo}T23:59:59`).getTime();
          if (!Number.isNaN(toTs) && logTime > toTs) return false;
        }
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const hay = [
          log.actor_name,
          log.actor_role,
          log.action_type,
          desc.label,
          log.target_type,
          log.target_id ? `#${log.target_id}` : '',
          log.target_title,
          log.target_author_name,
          log.reason,
          log.ip_address,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [
    moderationLogs,
    categoryFilter,
    actionCodeFilter,
    targetTypeFilter,
    roleFilter,
    personFilter,
    periodPreset,
    dateFrom,
    dateTo,
    searchQuery,
  ]);

  const stats = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayTs = startOfToday.getTime();

    const todayCount = moderationLogs.filter(
      (l) => new Date(l.created_at).getTime() >= todayTs
    ).length;
    const uniqueActors = new Set(moderationLogs.map((l) => l.actor_name).filter(Boolean)).size;
    const modActions = moderationLogs.filter((l) => {
      const cat = describeActionType(l.action_type).category;
      return cat === 'MODERATION' || cat === 'DELETION';
    }).length;

    return {
      total: moderationLogs.length,
      filtered: filteredLogs.length,
      todayCount,
      uniqueActors,
      modActions,
    };
  }, [moderationLogs, filteredLogs]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setPersonFilter('ALL');
    setRoleFilter('ALL');
    setCategoryFilter('ALL');
    setActionCodeFilter('ALL');
    setTargetTypeFilter('ALL');
    setPeriodPreset('ALL');
    setDateFrom('');
    setDateTo('');
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    personFilter !== 'ALL' ||
    roleFilter !== 'ALL' ||
    categoryFilter !== 'ALL' ||
    actionCodeFilter !== 'ALL' ||
    targetTypeFilter !== 'ALL' ||
    periodPreset !== 'ALL' ||
    dateFrom !== '' ||
    dateTo !== '';

  const exportCsv = () => {
    const headers = [
      'ID',
      'Data',
      'Hora',
      'Pessoa (Executor)',
      'Papel RBAC',
      'Codigo da Acao',
      'Descricao da Acao',
      'Tipo de Alvo',
      'ID do Alvo',
      'Titulo / Alvo',
      'Autor do Conteudo',
      'Detalhes / Motivo',
      'IP',
    ];
    const rows = filteredLogs.map((l) => {
      const { datePart, timePart } = formatDateTimeExact(l.created_at);
      const desc = describeActionType(l.action_type);
      return [
        l.id,
        datePart,
        timePart,
        l.actor_name || '',
        l.actor_role || '',
        l.action_type || '',
        desc.label,
        l.target_type || '',
        l.target_id ?? '',
        l.target_title || '',
        l.target_author_name || '',
        l.reason || '',
        l.ip_address || '',
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',');
    });
    const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-veritas-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Real-time Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-parchment-deep dark:border-slateDark-border pb-4">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink dark:text-slateDark-text flex items-center gap-2.5">
            <ClipboardList className="w-6 h-6 text-burgundy dark:text-gold shrink-0" />
            <span>Central de Logs &amp; Auditoria em Tempo Real</span>
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted dark:text-slateDark-muted mt-1">
            Monitoramento cronológico completo de todas as ações do sistema — logins, cadastros,
            publicações, edições, aprovações, reprovações, exclusões, comentários, curtidas,
            séries e cliques de afiliado.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setAutoRefresh((v) => !v)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold border transition-all ${
              autoRefresh
                ? 'bg-forest/15 text-forest dark:text-emerald-300 border-forest/40'
                : 'bg-parchment-warm dark:bg-slateDark-card text-ink-muted border-parchment-deep dark:border-slateDark-border'
            }`}
            title="Atualiza automaticamente os logs a cada 15 segundos"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span>{autoRefresh ? 'Ao Vivo (15s)' : 'Auto-Refresh Pausado'}</span>
          </button>

          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-parchment-deep dark:border-slateDark-border bg-parchment-warm dark:bg-slateDark-card text-xs font-semibold text-ink dark:text-slateDark-text hover:border-burgundy transition-all disabled:opacity-60"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                isRefreshing ? 'animate-spin text-burgundy dark:text-gold' : ''
              }`}
            />
            <span>{isRefreshing ? 'Atualizando...' : 'Atualizar Agora'}</span>
          </button>

          <button
            type="button"
            onClick={exportCsv}
            disabled={filteredLogs.length === 0}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-burgundy hover:bg-burgundy-hover dark:bg-gold dark:text-slateDark-bg text-parchment text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV ({filteredLogs.length})</span>
          </button>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment-warm/80 dark:bg-slateDark-card">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted dark:text-slateDark-muted">
            Eventos Exibidos / Total
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-ink dark:text-slateDark-text">
              {stats.filtered}
            </span>
            <span className="text-xs text-ink-muted dark:text-slateDark-muted">
              de {stats.total} registros
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment-warm/80 dark:bg-slateDark-card">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted dark:text-slateDark-muted">
            Ações Realizadas Hoje
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-forest dark:text-emerald-400">
              {stats.todayCount}
            </span>
            <span className="text-xs text-ink-muted dark:text-slateDark-muted">hoje</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment-warm/80 dark:bg-slateDark-card">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted dark:text-slateDark-muted">
            Pessoas Ativas nos Logs
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-burgundy dark:text-gold">
              {stats.uniqueActors}
            </span>
            <span className="text-xs text-ink-muted dark:text-slateDark-muted">usuários</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment-warm/80 dark:bg-slateDark-card">
          <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted dark:text-slateDark-muted">
            Decisões de Moderação &amp; Exclusões
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="font-serif text-2xl sm:text-3xl font-bold text-navy dark:text-sky-300">
              {stats.modActions}
            </span>
            <span className="text-xs text-ink-muted dark:text-slateDark-muted">registros</span>
          </div>
        </div>
      </div>

      {/* Multi-Filter Control Box */}
      <div className="p-4 sm:p-5 rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment-warm/90 dark:bg-slateDark-card space-y-4 shadow-editorial">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-burgundy dark:text-gold">
            <Filter className="w-4 h-4" />
            <span>Filtros Avançados por Pessoa, Ação, Alvo, Papel e Horário</span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-600/15 text-red-700 dark:text-red-300 text-xs font-semibold hover:bg-red-600/25 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar Todos os Filtros</span>
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {(
            [
              { id: 'ALL', label: 'Todas as Ações' },
              { id: 'AUTH', label: 'Logins & Contas' },
              { id: 'CONTENT', label: 'Obras & Ensaios' },
              { id: 'SERIES', label: 'Séries & Cadernos' },
              { id: 'MODERATION', label: 'Moderação & Revisão' },
              { id: 'DELETION', label: 'Exclusões' },
              { id: 'INTERACTION', label: 'Comentários & Curtidas' },
              { id: 'AFFILIATE', label: 'Afiliados & Config' },
            ] as Array<{ id: ActionCategory; label: string }>
          ).map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                categoryFilter === cat.id
                  ? 'bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg shadow-xs'
                  : 'bg-parchment dark:bg-slateDark-bg text-ink-secondary dark:text-slateDark-muted border border-parchment-deep dark:border-slateDark-border hover:border-burgundy/40'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Grid of Dropdowns + Search */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-2 lg:col-span-2 relative">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por pessoa, título, texto, motivo, IP ou #ID..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text focus:outline-none focus:border-burgundy dark:focus:border-gold"
            />
          </div>

          {/* Person Filter */}
          <div>
            <select
              value={personFilter}
              onChange={(e) => setPersonFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text font-medium focus:outline-none focus:border-burgundy"
            >
              <option value="ALL">👤 Todas as Pessoas ({peopleOptions.length})</option>
              {peopleOptions.map(([name, count]) => (
                <option key={name} value={name}>
                  {name} ({count} {count === 1 ? 'ação' : 'ações'})
                </option>
              ))}
            </select>
          </div>

          {/* Specific Action Filter */}
          <div>
            <select
              value={actionCodeFilter}
              onChange={(e) => setActionCodeFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text font-medium focus:outline-none focus:border-burgundy"
            >
              <option value="ALL">⚡ Todas as Funções ({actionTypeOptions.length})</option>
              {actionTypeOptions.map(([code, count]) => (
                <option key={code} value={code}>
                  {describeActionType(code).label} [{code}] ({count})
                </option>
              ))}
            </select>
          </div>

          {/* Target Type Filter */}
          <div>
            <select
              value={targetTypeFilter}
              onChange={(e) => setTargetTypeFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text font-medium focus:outline-none focus:border-burgundy"
            >
              <option value="ALL">🎯 Todos os Tipos de Alvo</option>
              <option value="WORK">WORK (Obras &amp; Resenhas)</option>
              <option value="TOPIC">TOPIC (Ensaios &amp; Tópicos)</option>
              <option value="COMMENT">COMMENT (Comentários)</option>
              <option value="SERIES">SERIES (Séries &amp; Cadernos)</option>
              <option value="SERIES_ENTRY">SERIES_ENTRY (Notas de Série)</option>
              <option value="USER">USER (Contas &amp; Perfis)</option>
              <option value="AUTH">AUTH (Sessões &amp; Login)</option>
              <option value="SETTINGS">SETTINGS (Configurações)</option>
            </select>
          </div>
        </div>

        {/* Second Row: Role Filter + Period & Date Range */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-2 border-t border-parchment-deep/60 dark:border-slateDark-border/60">
          {/* Role Filter */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted mr-1">
              Papel:
            </span>
            {(['ALL', 'ADMIN', 'MODERATOR', 'COLUMNIST', 'MEMBER', 'VISITOR'] as const).map(
              (r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRoleFilter(r)}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                    roleFilter === r
                      ? 'bg-navy text-parchment dark:bg-gold dark:text-slateDark-bg'
                      : 'bg-parchment dark:bg-slateDark-bg text-ink-secondary dark:text-slateDark-muted border border-parchment-deep dark:border-slateDark-border'
                  }`}
                >
                  {r === 'ALL' ? 'Todos' : r}
                </button>
              )
            )}
          </div>

          {/* Period Presets + Custom Dates */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Período:
            </span>
            {(
              [
                { id: 'ALL', label: 'Tudo' },
                { id: 'TODAY', label: 'Hoje' },
                { id: '24H', label: '24h' },
                { id: '7D', label: '7 dias' },
                { id: '30D', label: '30 dias' },
              ] as Array<{ id: PeriodPreset; label: string }>
            ).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriodPreset(p.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  periodPreset === p.id
                    ? 'bg-forest text-parchment dark:bg-emerald-500 dark:text-slateDark-bg'
                    : 'bg-parchment dark:bg-slateDark-bg text-ink-secondary dark:text-slateDark-muted border border-parchment-deep dark:border-slateDark-border'
                }`}
              >
                {p.label}
              </button>
            ))}

            <div className="flex items-center gap-1.5 text-xs">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-2 py-1 rounded border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-xs text-ink dark:text-slateDark-text"
                title="Data inicial"
              />
              <span className="text-ink-muted">até</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-2 py-1 rounded border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-xs text-ink dark:text-slateDark-text"
                title="Data final"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Active Person Quick Banner */}
      {personFilter !== 'ALL' && (
        <div className="p-3.5 rounded-xl bg-burgundy/10 dark:bg-gold/15 border border-burgundy/30 dark:border-gold/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm text-ink dark:text-slateDark-text">
            <UserIcon className="w-4 h-4 text-burgundy dark:text-gold shrink-0" />
            <span>
              Exibindo histórico completo de atividades de{' '}
              <strong className="text-burgundy dark:text-gold">{personFilter}</strong> (
              {filteredLogs.length} {filteredLogs.length === 1 ? 'registro' : 'registros'})
            </span>
          </div>
          <button
            type="button"
            onClick={() => setPersonFilter('ALL')}
            className="px-2.5 py-1 rounded bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg text-xs font-semibold"
          >
            Ver Todas as Pessoas
          </button>
        </div>
      )}

      {/* Chronological Log Entries */}
      {filteredLogs.length === 0 ? (
        <div className="p-10 rounded-xl border border-dashed border-parchment-deep dark:border-slateDark-border bg-parchment-warm/50 dark:bg-slateDark-card text-center space-y-2">
          <Activity className="w-8 h-8 text-burgundy dark:text-gold mx-auto opacity-60" />
          <p className="font-serif text-lg font-bold text-ink dark:text-slateDark-text">
            Nenhum log encontrado para os filtros selecionados
          </p>
          <p className="text-xs text-ink-muted dark:text-slateDark-muted">
            Experimente limpar os filtros ou clicar em &ldquo;Atualizar Agora&rdquo;.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log: ModerationLog) => {
            const desc = describeActionType(log.action_type);
            const { datePart, timePart, relativePart } = formatDateTimeExact(log.created_at);

            return (
              <div
                key={log.id}
                className="p-4 sm:p-5 rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment-warm/80 dark:bg-slateDark-card space-y-3 shadow-editorial hover:border-burgundy/40 dark:hover:border-gold/40 transition-colors"
              >
                {/* Top Row: Action Badge + Target Badge + Exact Timestamp */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-ink-muted dark:text-slateDark-muted">
                      #{log.id}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase border ${desc.color}`}
                    >
                      {desc.label}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-parchment-deep/70 dark:bg-slateDark-elevated text-ink-secondary dark:text-slateDark-muted text-[10px] font-mono font-semibold">
                      {log.action_type}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-ink text-parchment dark:bg-gold/20 dark:text-gold text-[10px] font-mono font-bold">
                      {log.target_type} {log.target_id ? `#${log.target_id}` : ''}
                    </span>
                  </div>

                  {/* Exact Date + Hour:Minute:Second + Relative */}
                  <div className="flex items-center gap-2 text-xs font-mono text-ink-secondary dark:text-slateDark-text bg-parchment dark:bg-slateDark-elevated px-2.5 py-1 rounded-md border border-parchment-deep/70 dark:border-slateDark-border">
                    <Calendar className="w-3.5 h-3.5 text-burgundy dark:text-gold shrink-0" />
                    <span className="font-bold">{datePart}</span>
                    <Clock className="w-3.5 h-3.5 text-forest dark:text-emerald-400 shrink-0 ml-1" />
                    <span className="font-bold text-burgundy dark:text-gold">{timePart}</span>
                    {relativePart && (
                      <span className="text-[11px] font-sans text-ink-muted dark:text-slateDark-muted">
                        ({relativePart})
                      </span>
                    )}
                  </div>
                </div>

                {/* Middle Row: Actor Person + Target Title */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <h4 className="font-serif font-bold text-base sm:text-lg text-ink dark:text-slateDark-text break-words">
                      {log.target_title}
                    </h4>
                    {log.target_author_name && (
                      <p className="text-xs text-ink-secondary dark:text-slateDark-muted">
                        Pessoa / Autor vinculado:{' '}
                        <button
                          type="button"
                          onClick={() => setPersonFilter(log.target_author_name!)}
                          className="font-bold text-burgundy dark:text-gold hover:underline"
                          title="Clique para filtrar todas as ações desta pessoa"
                        >
                          {log.target_author_name}
                        </button>
                      </p>
                    )}
                  </div>

                  {/* Actor Pill with One-Click Filter */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-parchment dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border text-xs">
                      <UserIcon className="w-3.5 h-3.5 text-burgundy dark:text-gold shrink-0" />
                      <span className="text-ink-muted">Executado por:</span>
                      <button
                        type="button"
                        onClick={() =>
                          setPersonFilter(
                            personFilter === log.actor_name ? 'ALL' : log.actor_name
                          )
                        }
                        className="font-bold text-ink dark:text-slateDark-text hover:text-burgundy dark:hover:text-gold hover:underline"
                        title="Filtrar todas as ações desta pessoa"
                      >
                        {log.actor_name}
                      </button>
                      <span className="px-1.5 py-0.5 rounded bg-burgundy/15 text-burgundy dark:bg-gold/20 dark:text-gold font-bold text-[10px]">
                        {log.actor_role}
                      </span>
                    </div>

                    {log.ip_address && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-parchment dark:bg-slateDark-elevated border border-parchment-deep/60 dark:border-slateDark-border font-mono text-[11px] text-ink-muted">
                        <Globe className="w-3 h-3" />
                        <span>{log.ip_address}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Details / Reason Box */}
                {log.reason && (
                  <div className="p-3 rounded-lg bg-parchment dark:bg-slateDark-elevated/70 border border-parchment-deep/70 dark:border-slateDark-border text-xs sm:text-sm text-ink dark:text-slateDark-text">
                    <strong className="text-burgundy dark:text-gold">
                      Detalhes / Registro da Ação:
                    </strong>{' '}
                    <span className="whitespace-pre-line">{log.reason}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const SystemLogsPage: React.FC = () => {
  const { currentUser, permissions } = useApp();

  if (!permissions.can_moderate_queue) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="p-8 rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment-warm dark:bg-slateDark-card text-center space-y-5 shadow-editorial">
          <div className="w-12 h-12 rounded-full bg-burgundy/10 dark:bg-gold/15 text-burgundy dark:text-gold flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-ink dark:text-slateDark-text">
            Acesso Restrito aos Logs do Sistema
          </h2>
          <p className="text-sm text-ink-secondary dark:text-slateDark-muted max-w-lg mx-auto leading-relaxed">
            Seu papel atual é <strong>{currentUser.role}</strong> ({currentUser.name}). Apenas
            usuários autenticados com papel <strong>MODERATOR</strong> ou{' '}
            <strong>ADMIN</strong> possuem permissão para acessar a Central de Logs &amp;
            Auditoria.
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted">
        <div className="inline-flex items-center gap-2 font-bold uppercase tracking-widest text-burgundy dark:text-gold">
          <ShieldAlert className="w-4 h-4" />
          <span>Observabilidade Total &amp; Rastreabilidade por Usuário</span>
        </div>
        <Link
          to="/moderacao"
          className="font-semibold text-burgundy dark:text-gold hover:underline"
        >
          ← Ir para o Painel de Moderação &amp; RBAC
        </Link>
      </div>

      <SystemLogsViewer />
    </div>
  );
};
