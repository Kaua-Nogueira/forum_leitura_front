import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import {
  MessageSquare,
  Search,
  Send,
  UserPlus,
  UserCheck,
  Users,
  BookOpen,
  BookMarked,
  Sparkles,
  Trash2,
  Share2,
  X,
  Check,
  CheckCheck,
  ArrowLeft,
  RefreshCw,
  LogIn,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { User, DirectMessage } from '../types/schema';

type SidebarTab = 'CHATS' | 'PEOPLE' | 'SEARCH_ALL';
type PeopleSubFilter = 'ALL' | 'FOLLOWING' | 'FOLLOWERS';

interface ShareableItem {
  type: 'WORK' | 'TOPIC' | 'SERIES' | 'SERIES_ENTRY';
  typeLabel: string;
  slug: string;
  url: string;
  title: string;
  subtitle?: string;
}

export const ChatPage: React.FC = () => {
  const { userId: paramUserId } = useParams<{ userId?: string }>();
  const navigate = useNavigate();

  const {
    currentUser,
    isAuthenticated,
    usersList,
    works,
    topics,
    series,
    directMessages,
    isFollowingUser,
    getFollowersOf,
    getFollowingOf,
    toggleFollowUser,
    sendDirectMessage,
    markConversationRead,
    deleteDirectMessage,
    refreshSocialAndChat,
    requestConfirm,
  } = useApp();

  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('CHATS');
  const [peopleFilter, setPeopleFilter] = useState<PeopleSubFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPartnerId, setSelectedPartnerId] = useState<number | null>(
    paramUserId ? Number(paramUserId) : null
  );
  const [messageInput, setMessageInput] = useState('');
  const [attachedItem, setAttachedItem] = useState<ShareableItem | null>(null);
  const [showSharePicker, setShowSharePicker] = useState(false);
  const [shareSearchQuery, setShareSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Sync URL param `:userId`
  useEffect(() => {
    if (paramUserId) {
      const idNum = Number(paramUserId);
      if (!Number.isNaN(idNum) && idNum !== currentUser.id) {
        setSelectedPartnerId(idNum);
      }
    }
  }, [paramUserId, currentUser.id]);

  // Initial & periodic polling (every 5s)
  useEffect(() => {
    refreshSocialAndChat();
    const interval = setInterval(() => {
      refreshSocialAndChat();
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshSocialAndChat]);

  // Mark messages from selectedPartnerId as read whenever viewing conversation
  useEffect(() => {
    if (selectedPartnerId && isAuthenticated) {
      markConversationRead(selectedPartnerId);
    }
  }, [selectedPartnerId, directMessages.length, isAuthenticated, markConversationRead]);

  // Scroll to bottom when active conversation messages change
  const activeMessages = useMemo((): DirectMessage[] => {
    if (!selectedPartnerId) return [];
    return directMessages
      .filter(
        (m) =>
          (Number(m.sender_id) === Number(currentUser.id) &&
            Number(m.recipient_id) === Number(selectedPartnerId)) ||
          (Number(m.sender_id) === Number(selectedPartnerId) &&
            Number(m.recipient_id) === Number(currentUser.id))
      )
      .sort(
        (a, b) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime() ||
          a.id - b.id
      );
  }, [directMessages, currentUser.id, selectedPartnerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length, selectedPartnerId]);

  // All other members (excluding current user and banned accounts)
  const otherUsers = useMemo((): User[] => {
    return usersList.filter(
      (u) => Number(u.id) !== Number(currentUser.id) && !u.is_banned
    );
  }, [usersList, currentUser.id]);

  // Build conversations list with last message & unread count
  const conversations = useMemo(() => {
    const map = new Map<
      number,
      {
        partner: User;
        lastMessage: DirectMessage | null;
        unreadCount: number;
      }
    >();

    // First include all users who have message history with currentUser
    for (const m of directMessages) {
      const isOutgoing = Number(m.sender_id) === Number(currentUser.id);
      const isIncoming = Number(m.recipient_id) === Number(currentUser.id);
      if (!isOutgoing && !isIncoming) continue;

      const partnerId = isOutgoing ? Number(m.recipient_id) : Number(m.sender_id);
      const partnerObj =
        otherUsers.find((u) => Number(u.id) === partnerId) ||
        (isOutgoing ? m.recipient : m.sender);

      if (!partnerObj) continue;

      const prev = map.get(partnerId) || {
        partner: partnerObj,
        lastMessage: null,
        unreadCount: 0,
      };

      if (
        !prev.lastMessage ||
        new Date(m.created_at).getTime() >=
          new Date(prev.lastMessage.created_at).getTime()
      ) {
        prev.lastMessage = m;
      }

      if (isIncoming && !m.read_at) {
        prev.unreadCount += 1;
      }

      map.set(partnerId, prev);
    }

    // Also include users that currentUser follows so they are easy to message right away
    for (const u of otherUsers) {
      if (isFollowingUser(u.id) && !map.has(Number(u.id))) {
        map.set(Number(u.id), {
          partner: u,
          lastMessage: null,
          unreadCount: 0,
        });
      }
    }

    return Array.from(map.values()).sort((a, b) => {
      const tA = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : 0;
      const tB = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : 0;
      return tB - tA || a.partner.name.localeCompare(b.partner.name);
    });
  }, [directMessages, currentUser.id, otherUsers, isFollowingUser]);

  // Selected partner User object
  const selectedPartner = useMemo((): User | null => {
    if (!selectedPartnerId) return null;
    return (
      otherUsers.find((u) => Number(u.id) === Number(selectedPartnerId)) ||
      conversations.find((c) => Number(c.partner.id) === Number(selectedPartnerId))
        ?.partner ||
      null
    );
  }, [selectedPartnerId, otherUsers, conversations]);

  // All shareable / searchable platform items ("coisas": Obras, Artigos, Ensaios, Séries e Notas)
  const allCatalogItems = useMemo((): ShareableItem[] => {
    const items: ShareableItem[] = [];

    for (const w of works) {
      if (w.status !== 'APPROVED') continue;
      items.push({
        type: 'WORK',
        typeLabel: w.media_type === 'ESSAY' ? 'Artigo & Conceito' : 'Obra / Resenha',
        slug: w.slug,
        url: `/obras/${w.slug}`,
        title: w.title,
        subtitle:
          w.media_type === 'ESSAY'
            ? w.publisher_or_studio || 'Ensaio Livre'
            : `${w.creator} (${w.release_year})`,
      });
    }

    for (const t of topics) {
      if (t.status !== 'APPROVED') continue;
      items.push({
        type: 'TOPIC',
        typeLabel: 'Ensaio / Debate',
        slug: t.slug,
        url: `/topicos/${t.slug}`,
        title: t.title,
        subtitle: t.author?.name ? `por ${t.author.name}` : 'Diálogo Comunitário',
      });
    }

    for (const s of series) {
      items.push({
        type: 'SERIES',
        typeLabel: 'Série & Caderno',
        slug: s.slug,
        url: `/series/${s.slug}`,
        title: s.title,
        subtitle: `${s.entries?.length || s.entries_count} notas • ${s.book_title || s.cadence_label}`,
      });

      for (const e of s.entries || []) {
        items.push({
          type: 'SERIES_ENTRY',
          typeLabel: `Nota #${String(e.entry_number).padStart(2, '0')} (${s.title})`,
          slug: `${s.slug}/${e.slug}`,
          url: `/series/${s.slug}/${e.slug}`,
          title: `${e.reference_label ? `${e.reference_label} — ` : ''}${e.title}`,
          subtitle: e.body.slice(0, 110) + '...',
        });
      }
    }

    return items;
  }, [works, topics, series]);

  // Filtered shareable items for the in-chat Share Picker
  const filteredShareItems = useMemo(() => {
    const q = shareSearchQuery.trim().toLowerCase();
    if (!q) return allCatalogItems.slice(0, 25);
    return allCatalogItems
      .filter(
        (it) =>
          it.title.toLowerCase().includes(q) ||
          (it.subtitle || '').toLowerCase().includes(q) ||
          it.typeLabel.toLowerCase().includes(q)
      )
      .slice(0, 40);
  }, [allCatalogItems, shareSearchQuery]);

  // Filtered lists for Sidebar Search
  const qLower = searchQuery.trim().toLowerCase();

  const filteredConversations = useMemo(() => {
    if (!qLower) return conversations;
    return conversations.filter(
      (c) =>
        c.partner.name.toLowerCase().includes(qLower) ||
        (c.partner.username || '').toLowerCase().includes(qLower) ||
        (c.partner.title_badge || '').toLowerCase().includes(qLower) ||
        (c.lastMessage?.body || '').toLowerCase().includes(qLower)
    );
  }, [conversations, qLower]);

  const filteredPeople = useMemo(() => {
    return otherUsers.filter((u) => {
      if (peopleFilter === 'FOLLOWING' && !isFollowingUser(u.id)) return false;
      if (peopleFilter === 'FOLLOWERS' && !isFollowingUser(currentUser.id, u.id)) {
        return false;
      }
      if (!qLower) return true;
      return (
        u.name.toLowerCase().includes(qLower) ||
        (u.username || '').toLowerCase().includes(qLower) ||
        (u.email || '').toLowerCase().includes(qLower) ||
        (u.title_badge || '').toLowerCase().includes(qLower) ||
        (u.bio || '').toLowerCase().includes(qLower)
      );
    });
  }, [otherUsers, peopleFilter, isFollowingUser, currentUser.id, qLower]);

  const matchingMessagesInSearch = useMemo(() => {
    if (!qLower) return [];
    return directMessages
      .filter(
        (m) =>
          m.body.toLowerCase().includes(qLower) ||
          (m.shared_title || '').toLowerCase().includes(qLower)
      )
      .slice(-30)
      .reverse();
  }, [directMessages, qLower]);

  const matchingThingsInSearch = useMemo(() => {
    if (!qLower) return allCatalogItems.slice(0, 12);
    return allCatalogItems
      .filter(
        (it) =>
          it.title.toLowerCase().includes(qLower) ||
          (it.subtitle || '').toLowerCase().includes(qLower) ||
          it.typeLabel.toLowerCase().includes(qLower)
      )
      .slice(0, 25);
  }, [allCatalogItems, qLower]);

  const selectPartner = (userId: number) => {
    setSelectedPartnerId(userId);
    navigate(`/mensagens/${userId}`, { replace: true });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartner) return;
    const text =
      messageInput.trim() ||
      (attachedItem ? `Compartilhou: ${attachedItem.title}` : '');
    if (!text) return;

    setIsSending(true);
    try {
      await sendDirectMessage(
        selectedPartner.id,
        text,
        attachedItem
          ? {
              type: attachedItem.type,
              slug: attachedItem.slug,
              title: attachedItem.title,
            }
          : undefined
      );
      setMessageInput('');
      setAttachedItem(null);
      setShowSharePicker(false);
    } finally {
      setIsSending(false);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshSocialAndChat();
    } finally {
      setIsRefreshing(false);
    }
  };

  const resolveSharedUrl = (
    type?: string | null,
    slug?: string | null
  ): string => {
    if (!type || !slug) return '/';
    if (type === 'WORK') return `/obras/${slug}`;
    if (type === 'TOPIC') return `/topicos/${slug}`;
    if (type === 'SERIES' || type === 'SERIES_ENTRY') return `/series/${slug}`;
    return '/';
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-14 h-14 rounded-full bg-burgundy/10 dark:bg-gold/15 text-burgundy dark:text-gold flex items-center justify-center mx-auto">
          <MessageSquare className="w-7 h-7" />
        </div>
        <h2 className="font-serif text-3xl font-bold text-ink dark:text-slateDark-text">
          Entre para acessar o Chat Privado &amp; Comunidade
        </h2>
        <p className="text-base text-ink-secondary dark:text-slateDark-muted">
          Faça login na sua conta para seguir autores e membros, pesquisar pessoas e
          textos, e trocar mensagens privadas.
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

  const myFollowers = getFollowersOf(currentUser.id);
  const myFollowing = getFollowingOf(currentUser.id);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink dark:text-slateDark-text flex items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-burgundy dark:text-gold shrink-0" />
            <span>Chat Privado, Pessoas &amp; Pesquisa</span>
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted dark:text-slateDark-muted">
            Converse em privado, siga membros da comunidade ({myFollowing.length}{' '}
            seguindo • {myFollowers.length} seguidores) e compartilhe textos, notas e
            livros.
          </p>
        </div>

        <button
          type="button"
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-parchment-deep dark:border-slateDark-border bg-parchment-warm dark:bg-slateDark-card text-xs font-semibold text-ink dark:text-slateDark-text hover:border-burgundy transition-colors"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${
              isRefreshing ? 'animate-spin text-burgundy dark:text-gold' : ''
            }`}
          />
          <span>Atualizar Chat</span>
        </button>
      </div>

      {/* Main 2-Column Chat & Discovery Shell */}
      <div className="grid grid-cols-1 lg:grid-cols-12 rounded-2xl border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-card shadow-editorial overflow-hidden min-h-[640px]">
        {/* LEFT SIDEBAR: SEARCH + TABS (CONVERSAS | PESSOAS | PESQUISAR TUDO) */}
        <aside className="lg:col-span-5 xl:col-span-4 border-b lg:border-b-0 lg:border-r border-parchment-deep dark:border-slateDark-border flex flex-col bg-parchment-warm/60 dark:bg-slateDark-elevated/40">
          {/* Universal Search Bar */}
          <div className="p-3.5 border-b border-parchment-deep dark:border-slateDark-border space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquisar pessoas, mensagens, livros, notas..."
                className="w-full pl-9 pr-8 py-2 rounded-lg border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-xs sm:text-sm text-ink dark:text-slateDark-text focus:outline-none focus:border-burgundy dark:focus:border-gold"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* 3 Mode Tabs */}
            <div className="grid grid-cols-3 gap-1 bg-parchment dark:bg-slateDark-bg p-1 rounded-lg border border-parchment-deep dark:border-slateDark-border">
              <button
                type="button"
                onClick={() => setSidebarTab('CHATS')}
                className={`py-1.5 px-2 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                  sidebarTab === 'CHATS'
                    ? 'bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg shadow-xs'
                    : 'text-ink-secondary dark:text-slateDark-muted hover:text-ink'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                <span>Conversas</span>
              </button>

              <button
                type="button"
                onClick={() => setSidebarTab('PEOPLE')}
                className={`py-1.5 px-2 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                  sidebarTab === 'PEOPLE'
                    ? 'bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg shadow-xs'
                    : 'text-ink-secondary dark:text-slateDark-muted hover:text-ink'
                }`}
              >
                <Users className="w-3.5 h-3.5 shrink-0" />
                <span>Pessoas ({otherUsers.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setSidebarTab('SEARCH_ALL')}
                className={`py-1.5 px-2 rounded-md text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                  sidebarTab === 'SEARCH_ALL'
                    ? 'bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg shadow-xs'
                    : 'text-ink-secondary dark:text-slateDark-muted hover:text-ink'
                }`}
              >
                <Search className="w-3.5 h-3.5 shrink-0" />
                <span>Explorar</span>
              </button>
            </div>
          </div>

          {/* Sidebar List Content */}
          <div className="flex-1 overflow-y-auto max-h-[540px] divide-y divide-parchment-deep/60 dark:divide-slateDark-border/60">
            {sidebarTab === 'CHATS' && (
              <>
                {filteredConversations.length === 0 ? (
                  <div className="p-8 text-center space-y-3">
                    <Users className="w-8 h-8 text-burgundy dark:text-gold mx-auto opacity-70" />
                    <p className="font-serif text-base font-bold text-ink dark:text-slateDark-text">
                      Nenhuma conversa iniciada ainda
                    </p>
                    <p className="text-xs text-ink-muted dark:text-slateDark-muted">
                      Clique na aba <strong>Pessoas</strong> para seguir membros e
                      iniciar uma conversa privada!
                    </p>
                    <button
                      type="button"
                      onClick={() => setSidebarTab('PEOPLE')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg text-xs font-semibold"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Ver Pessoas da Comunidade</span>
                    </button>
                  </div>
                ) : (
                  filteredConversations.map(({ partner, lastMessage, unreadCount }) => {
                    const isSelected = Number(selectedPartnerId) === Number(partner.id);
                    const following = isFollowingUser(partner.id);
                    return (
                      <button
                        key={partner.id}
                        type="button"
                        onClick={() => selectPartner(partner.id)}
                        className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors ${
                          isSelected
                            ? 'bg-burgundy/12 dark:bg-gold/15 border-l-4 border-l-burgundy dark:border-l-gold'
                            : 'hover:bg-parchment-warm dark:hover:bg-slateDark-card'
                        }`}
                      >
                        {/* Avatar */}
                        {partner.avatar_url ? (
                          <img
                            src={partner.avatar_url}
                            alt={partner.name}
                            className="w-10 h-10 rounded-full object-cover border border-burgundy/30 dark:border-gold/40 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg font-serif font-bold text-sm flex items-center justify-center shrink-0">
                            {partner.name.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-serif font-bold text-sm text-ink dark:text-slateDark-text truncate">
                              {partner.name}
                            </span>
                            {lastMessage && (
                              <span className="text-[10px] font-mono text-ink-muted shrink-0">
                                {new Date(lastMessage.created_at).toLocaleTimeString(
                                  'pt-BR',
                                  { hour: '2-digit', minute: '2-digit' }
                                )}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 text-[11px] text-burgundy dark:text-gold font-medium">
                            <span>{partner.role}</span>
                            {following && (
                              <span className="px-1.5 py-0.2 rounded bg-forest/15 text-forest dark:text-emerald-300 text-[10px] font-bold">
                                Seguindo
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between gap-2 mt-1">
                            <p className="text-xs text-ink-secondary dark:text-slateDark-muted truncate">
                              {lastMessage ? (
                                <>
                                  {Number(lastMessage.sender_id) ===
                                  Number(currentUser.id)
                                    ? 'Você: '
                                    : ''}
                                  {lastMessage.body}
                                </>
                              ) : (
                                <span className="italic text-ink-muted">
                                  Clique para enviar a primeira mensagem...
                                </span>
                              )}
                            </p>
                            {unreadCount > 0 && (
                              <span className="px-2 py-0.5 rounded-full bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg text-[10px] font-bold shrink-0">
                                {unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </>
            )}

            {sidebarTab === 'PEOPLE' && (
              <div>
                {/* Sub-filters: Todos | Seguindo | Seguidores */}
                <div className="p-2.5 bg-parchment/70 dark:bg-slateDark-card/70 border-b border-parchment-deep/60 dark:border-slateDark-border/60 flex items-center gap-1.5">
                  {(
                    [
                      { id: 'ALL', label: `Todos (${otherUsers.length})` },
                      { id: 'FOLLOWING', label: `Seguindo (${myFollowing.length})` },
                      { id: 'FOLLOWERS', label: `Seguidores (${myFollowers.length})` },
                    ] as Array<{ id: PeopleSubFilter; label: string }>
                  ).map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setPeopleFilter(f.id)}
                      className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                        peopleFilter === f.id
                          ? 'bg-navy text-parchment dark:bg-gold dark:text-slateDark-bg'
                          : 'bg-parchment-warm dark:bg-slateDark-elevated text-ink-secondary dark:text-slateDark-muted'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {filteredPeople.length === 0 ? (
                  <div className="p-8 text-center text-xs text-ink-muted">
                    Nenhuma pessoa encontrada para este filtro.
                  </div>
                ) : (
                  <div className="divide-y divide-parchment-deep/60 dark:divide-slateDark-border/60">
                    {filteredPeople.map((person) => {
                      const following = isFollowingUser(person.id);
                      const followsMe = isFollowingUser(currentUser.id, person.id);
                      return (
                        <div
                          key={person.id}
                          className="p-3.5 flex items-center justify-between gap-2.5 hover:bg-parchment-warm/80 dark:hover:bg-slateDark-card transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Link to={`/perfil/${person.id}`} className="shrink-0">
                              {person.avatar_url ? (
                                <img
                                  src={person.avatar_url}
                                  alt={person.name}
                                  className="w-10 h-10 rounded-full object-cover border border-burgundy/30 dark:border-gold/40"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg font-serif font-bold text-sm flex items-center justify-center">
                                  {person.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </Link>

                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <Link
                                  to={`/perfil/${person.id}`}
                                  className="font-serif font-bold text-sm text-ink dark:text-slateDark-text hover:text-burgundy dark:hover:text-gold truncate"
                                >
                                  {person.name}
                                </Link>
                                {followsMe && (
                                  <span className="px-1.5 py-0.2 rounded bg-parchment-deep dark:bg-slateDark-elevated text-[10px] font-semibold text-ink-secondary dark:text-slateDark-muted shrink-0">
                                    Segue você
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-burgundy dark:text-gold truncate">
                                {person.title_badge || person.role}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => toggleFollowUser(person.id)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                                following
                                  ? 'bg-forest/15 text-forest dark:text-emerald-300 border border-forest/30 hover:bg-red-500/15 hover:text-red-700'
                                  : 'bg-parchment dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border text-ink dark:text-slateDark-text hover:border-burgundy'
                              }`}
                              title={following ? 'Deixar de seguir' : 'Seguir pessoa'}
                            >
                              {following ? (
                                <>
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>Seguindo</span>
                                </>
                              ) : (
                                <>
                                  <UserPlus className="w-3.5 h-3.5" />
                                  <span>Seguir</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                selectPartner(person.id);
                                setSidebarTab('CHATS');
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-burgundy hover:bg-burgundy-hover dark:bg-gold dark:text-slateDark-bg text-parchment text-xs font-semibold shadow-2xs"
                              title="Abrir chat privado"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Chat</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {sidebarTab === 'SEARCH_ALL' && (
              <div className="p-3.5 space-y-5">
                {/* 1. Pessoas encontradas */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-burgundy dark:text-gold flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>Pessoas ({filteredPeople.length})</span>
                  </h4>
                  {filteredPeople.slice(0, 5).map((u) => (
                    <div
                      key={`srch-u-${u.id}`}
                      className="p-2.5 rounded-lg bg-parchment dark:bg-slateDark-card border border-parchment-deep dark:border-slateDark-border flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <Link
                          to={`/perfil/${u.id}`}
                          className="font-serif font-bold text-xs text-ink dark:text-slateDark-text hover:underline block truncate"
                        >
                          {u.name}
                        </Link>
                        <span className="text-[11px] text-ink-muted block truncate">
                          {u.title_badge || u.role}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => toggleFollowUser(u.id)}
                          className="px-2 py-1 rounded border border-parchment-deep dark:border-slateDark-border text-[11px] font-semibold"
                        >
                          {isFollowingUser(u.id) ? 'Seguindo' : 'Seguir'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            selectPartner(u.id);
                            setSidebarTab('CHATS');
                          }}
                          className="px-2 py-1 rounded bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg text-[11px] font-semibold"
                        >
                          Conversar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 2. Mensagens Encontradas */}
                {qLower && (
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-burgundy dark:text-gold flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>
                        Mensagens no Chat ({matchingMessagesInSearch.length})
                      </span>
                    </h4>
                    {matchingMessagesInSearch.length === 0 ? (
                      <p className="text-xs text-ink-muted">
                        Nenhuma mensagem contém &ldquo;{searchQuery}&rdquo;.
                      </p>
                    ) : (
                      matchingMessagesInSearch.map((m) => {
                        const partnerId =
                          Number(m.sender_id) === Number(currentUser.id)
                            ? Number(m.recipient_id)
                            : Number(m.sender_id);
                        const partner = otherUsers.find(
                          (u) => Number(u.id) === partnerId
                        );
                        return (
                          <button
                            key={`srch-m-${m.id}`}
                            type="button"
                            onClick={() => {
                              selectPartner(partnerId);
                              setSidebarTab('CHATS');
                            }}
                            className="w-full text-left p-2.5 rounded-lg bg-parchment dark:bg-slateDark-card border border-parchment-deep dark:border-slateDark-border hover:border-burgundy space-y-1"
                          >
                            <div className="flex items-center justify-between text-[11px] text-burgundy dark:text-gold font-bold">
                              <span>Conversa com {partner?.name || 'Membro'}</span>
                              <span>
                                {new Date(m.created_at).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                            <p className="text-xs text-ink dark:text-slateDark-text line-clamp-2">
                              {m.body}
                            </p>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}

                {/* 3. Textos, Obras, Ensaios e Notas da CFW ("Coisas") */}
                <div className="space-y-2">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-burgundy dark:text-gold flex items-center gap-1.5">
                    <BookMarked className="w-3.5 h-3.5" />
                    <span>
                      Textos, Séries, Notas &amp; Obras ({matchingThingsInSearch.length})
                    </span>
                  </h4>
                  {matchingThingsInSearch.map((item, idx) => (
                    <div
                      key={`srch-it-${idx}`}
                      className="p-2.5 rounded-lg bg-parchment dark:bg-slateDark-card border border-parchment-deep dark:border-slateDark-border space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-burgundy/15 text-burgundy dark:bg-gold/20 dark:text-gold text-[10px] font-bold uppercase">
                          {item.typeLabel}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {selectedPartner && (
                            <button
                              type="button"
                              onClick={() => {
                                setAttachedItem(item);
                                setSidebarTab('CHATS');
                              }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-forest text-parchment text-[10px] font-bold"
                              title={`Anexar na conversa com ${selectedPartner.name}`}
                            >
                              <Share2 className="w-2.5 h-2.5" />
                              <span>Enviar no Chat</span>
                            </button>
                          )}
                          <Link
                            to={item.url}
                            className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-burgundy dark:text-gold hover:underline"
                          >
                            <span>Abrir</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        </div>
                      </div>
                      <p className="font-serif font-bold text-xs text-ink dark:text-slateDark-text">
                        {item.title}
                      </p>
                      {item.subtitle && (
                        <p className="text-[11px] text-ink-muted line-clamp-1">
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* RIGHT PANE: ACTIVE PRIVATE CONVERSATION */}
        <section className="lg:col-span-7 xl:col-span-8 flex flex-col bg-parchment dark:bg-slateDark-card">
          {!selectedPartner ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-burgundy/10 dark:bg-gold/15 text-burgundy dark:text-gold flex items-center justify-center">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div className="max-w-md space-y-1.5">
                <h2 className="font-serif text-2xl font-bold text-ink dark:text-slateDark-text">
                  Selecione uma pessoa para conversar
                </h2>
                <p className="text-xs sm:text-sm text-ink-secondary dark:text-slateDark-muted leading-relaxed">
                  Escolha um membro na lista à esquerda ou pesquise por nome, área de
                  interesse, livro ou nota da Confissão de Fé de Westminster para
                  iniciar um diálogo privado.
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSidebarTab('PEOPLE')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg text-xs sm:text-sm font-semibold shadow-xs"
                >
                  <Users className="w-4 h-4" />
                  <span>Descobrir Pessoas para Seguir e Conversar</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Active Partner Header */}
              <header className="p-4 border-b border-parchment-deep dark:border-slateDark-border bg-parchment-warm/80 dark:bg-slateDark-elevated/70 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={() => setSelectedPartnerId(null)}
                    className="lg:hidden p-1.5 rounded-md border border-parchment-deep dark:border-slateDark-border text-ink-secondary"
                    title="Voltar para lista"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>

                  <Link to={`/perfil/${selectedPartner.id}`} className="shrink-0">
                    {selectedPartner.avatar_url ? (
                      <img
                        src={selectedPartner.avatar_url}
                        alt={selectedPartner.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-burgundy/30 dark:border-gold/50"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg font-serif font-bold text-base flex items-center justify-center">
                        {selectedPartner.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Link>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={`/perfil/${selectedPartner.id}`}
                        className="font-serif font-bold text-base sm:text-lg text-ink dark:text-slateDark-text hover:text-burgundy dark:hover:text-gold truncate"
                      >
                        {selectedPartner.name}
                      </Link>
                      <span className="px-2 py-0.5 rounded bg-burgundy/15 text-burgundy dark:bg-gold/20 dark:text-gold text-[10px] font-bold uppercase">
                        {selectedPartner.role}
                      </span>
                    </div>
                    <p className="text-xs text-ink-secondary dark:text-slateDark-muted truncate">
                      {selectedPartner.title_badge || 'Membro da Comunidade'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => toggleFollowUser(selectedPartner.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isFollowingUser(selectedPartner.id)
                        ? 'bg-forest/15 text-forest dark:text-emerald-300 border border-forest/30'
                        : 'bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg'
                    }`}
                  >
                    {isFollowingUser(selectedPartner.id) ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Seguindo</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Seguir</span>
                      </>
                    )}
                  </button>

                  <Link
                    to={`/perfil/${selectedPartner.id}`}
                    className="px-3 py-1.5 rounded-lg border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-card text-xs font-semibold text-ink dark:text-slateDark-text hover:border-burgundy"
                  >
                    Ver Perfil
                  </Link>
                </div>
              </header>

              {/* Messages Stream */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto max-h-[460px] space-y-3 bg-parchment/50 dark:bg-slateDark-bg/40">
                {activeMessages.length === 0 ? (
                  <div className="py-16 text-center space-y-2">
                    <Sparkles className="w-7 h-7 text-burgundy dark:text-gold mx-auto opacity-70" />
                    <p className="font-serif text-base font-bold text-ink dark:text-slateDark-text">
                      Inicie sua conversa privada com {selectedPartner.name}
                    </p>
                    <p className="text-xs text-ink-muted max-w-sm mx-auto">
                      Envie uma mensagem abaixo ou clique em{' '}
                      <strong>Compartilhar Texto/Nota</strong> para enviar uma
                      referência de leitura.
                    </p>
                  </div>
                ) : (
                  activeMessages.map((msg) => {
                    const isMine =
                      Number(msg.sender_id) === Number(currentUser.id);
                    const timeStr = new Date(msg.created_at).toLocaleTimeString(
                      'pt-BR',
                      { hour: '2-digit', minute: '2-digit' }
                    );
                    const dateStr = new Date(msg.created_at).toLocaleDateString(
                      'pt-BR',
                      { day: '2-digit', month: '2-digit' }
                    );

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${
                          isMine ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[72%] rounded-2xl px-4 py-2.5 shadow-xs space-y-2 ${
                            isMine
                              ? 'bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg rounded-br-xs'
                              : 'bg-parchment-warm dark:bg-slateDark-elevated text-ink dark:text-slateDark-text border border-parchment-deep dark:border-slateDark-border rounded-bl-xs'
                          }`}
                        >
                          {/* Shared Content Card inside Message */}
                          {msg.shared_title && msg.shared_slug && (
                            <Link
                              to={resolveSharedUrl(
                                msg.shared_type,
                                msg.shared_slug
                              )}
                              className={`block p-2.5 rounded-xl border text-xs transition-opacity hover:opacity-95 ${
                                isMine
                                  ? 'bg-black/20 border-white/20 text-parchment dark:bg-black/15 dark:border-black/20 dark:text-slateDark-bg'
                                  : 'bg-parchment dark:bg-slateDark-card border-parchment-deep dark:border-slateDark-border text-ink dark:text-slateDark-text'
                              }`}
                            >
                              <div className="flex items-center justify-between gap-2 font-bold text-[10px] uppercase tracking-wider opacity-85">
                                <span>
                                  📚 Conteúdo Compartilhado ({msg.shared_type})
                                </span>
                                <ExternalLink className="w-3 h-3 shrink-0" />
                              </div>
                              <p className="font-serif font-bold text-sm mt-0.5 underline">
                                {msg.shared_title}
                              </p>
                            </Link>
                          )}

                          <p className="text-sm whitespace-pre-line leading-relaxed break-words">
                            {msg.body}
                          </p>

                          <div
                            className={`flex items-center justify-end gap-2 text-[10px] ${
                              isMine
                                ? 'text-parchment/80 dark:text-slateDark-bg/75'
                                : 'text-ink-muted dark:text-slateDark-muted'
                            }`}
                          >
                            <span>
                              {dateStr} às {timeStr}
                            </span>
                            {isMine && (
                              <>
                                {msg.read_at ? (
                                  <span
                                    className="inline-flex items-center gap-0.5 font-semibold"
                                    title="Visualizada"
                                  >
                                    <CheckCheck className="w-3.5 h-3.5" />
                                  </span>
                                ) : (
                                  <span
                                    className="inline-flex items-center gap-0.5"
                                    title="Enviada"
                                  >
                                    <Check className="w-3 h-3" />
                                  </span>
                                )}
                                <button
                                  type="button"
                                  onClick={async () => {
                                    const ok = await requestConfirm({
                                      title: 'Excluir Mensagem',
                                      description:
                                        'Deseja excluir esta mensagem da conversa?',
                                      confirmLabel: 'Sim, Excluir',
                                      cancelLabel: 'Cancelar',
                                      variant: 'danger',
                                    });
                                    if (ok) {
                                      deleteDirectMessage(msg.id);
                                    }
                                  }}
                                  className="hover:opacity-100 opacity-75 ml-1"
                                  title="Excluir mensagem"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* In-Chat Content Share Picker Drawer ("Pesquisar Coisas no Chat") */}
              {showSharePicker && (
                <div className="p-3.5 border-t border-parchment-deep dark:border-slateDark-border bg-parchment-warm dark:bg-slateDark-elevated space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-burgundy dark:text-gold flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>
                        Pesquisar &amp; Anexar Livro, Artigo, Ensaio ou Nota da CFW
                      </span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowSharePicker(false)}
                      className="text-ink-muted hover:text-ink"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={shareSearchQuery}
                      onChange={(e) => setShareSearchQuery(e.target.value)}
                      placeholder="Digite o título do livro, capítulo da CFW, artigo ou tema..."
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-xs text-ink dark:text-slateDark-text focus:outline-none focus:border-burgundy"
                    />
                  </div>

                  <div className="max-h-44 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredShareItems.map((it, i) => (
                      <button
                        key={`pick-${i}`}
                        type="button"
                        onClick={() => {
                          setAttachedItem(it);
                          setShowSharePicker(false);
                        }}
                        className="p-2 rounded-lg border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-card hover:border-burgundy text-left space-y-0.5"
                      >
                        <span className="text-[10px] font-bold uppercase text-burgundy dark:text-gold block">
                          {it.typeLabel}
                        </span>
                        <p className="font-serif font-bold text-xs text-ink dark:text-slateDark-text truncate">
                          {it.title}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Attached Content Preview Pill */}
              {attachedItem && (
                <div className="px-4 py-2 bg-burgundy/10 dark:bg-gold/15 border-t border-burgundy/25 dark:border-gold/30 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <Share2 className="w-3.5 h-3.5 text-burgundy dark:text-gold shrink-0" />
                    <span className="font-bold text-burgundy dark:text-gold shrink-0">
                      Anexado ({attachedItem.typeLabel}):
                    </span>
                    <span className="font-serif font-bold text-ink dark:text-slateDark-text truncate">
                      {attachedItem.title}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAttachedItem(null)}
                    className="text-ink-muted hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Message Composer Footer */}
              <form
                onSubmit={handleSend}
                className="p-3.5 sm:p-4 border-t border-parchment-deep dark:border-slateDark-border bg-parchment-warm/70 dark:bg-slateDark-elevated/60 flex items-end gap-2"
              >
                <button
                  type="button"
                  onClick={() => setShowSharePicker((v) => !v)}
                  title="Pesquisar e anexar livro, ensaio ou nota da CFW na mensagem"
                  className={`p-2.5 rounded-xl border transition-colors shrink-0 ${
                    showSharePicker
                      ? 'bg-burgundy text-parchment border-burgundy dark:bg-gold dark:text-slateDark-bg'
                      : 'bg-parchment dark:bg-slateDark-card border-parchment-deep dark:border-slateDark-border text-ink-secondary dark:text-gold hover:border-burgundy'
                  }`}
                >
                  <Share2 className="w-4 h-4" />
                </button>

                <textarea
                  rows={1}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                  placeholder={`Escreva uma mensagem privada para ${selectedPartner.name}... (Enter para enviar)`}
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-xs sm:text-sm text-ink dark:text-slateDark-text focus:outline-none focus:border-burgundy dark:focus:border-gold resize-none"
                />

                <button
                  type="submit"
                  disabled={
                    isSending || (!messageInput.trim() && !attachedItem)
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-burgundy hover:bg-burgundy-hover dark:bg-gold dark:text-slateDark-bg text-parchment text-xs sm:text-sm font-semibold shadow-sm transition-all disabled:opacity-50 shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Enviar</span>
                </button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
};
