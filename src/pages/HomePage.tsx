import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  BookMarked,
  Film,
  GraduationCap,
  MessageSquareQuote,
  Search,
  Star,
  MessageCircle,
  ThumbsUp,
  Pin,
  Flag,
  Compass,
  Award,
  ShieldCheck,
  Music,
  FileText,
  Feather,
  Clock,
  ArrowRight,
  Layers,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Trash2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AffiliateButton } from '../components/AffiliateButton';
import { getReadingMetrics } from '../components/RichTextRenderer';
import { MediaType } from '../types/schema';

export const HomePage: React.FC = () => {
  const {
    categories,
    works,
    topics,
    series,
    settings,
    currentUser,
    isAuthenticated,
    permissions,
    moderateWorkStatus,
    moderateTopicStatus,
    deleteContent,
    deleteByModerator,
    upvoteItem,
    hasUserUpvoted,
    setFlagModalTarget,
  } = useApp();

  const [selectedMediaFilter, setSelectedMediaFilter] = useState<string>('ALL');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [deletePromptTarget, setDeletePromptTarget] = useState<{
    type: 'WORK' | 'TOPIC' | 'COMMENT';
    id: number;
    title: string;
    authorName?: string;
  } | null>(null);
  const [deleteReasonText, setDeleteReasonText] = useState(
    'Remoção pela Moderação por inadequação às diretrizes editoriais.'
  );

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const toPlainExcerpt = (raw: string, maxLength = 220) => {
    const cleaned = raw
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/^>\s+/gm, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
    if (cleaned.length <= maxLength) return cleaned;
    return `${cleaned.slice(0, maxLength).trimEnd()}…`;
  };

  const mediaFilters = [
    { id: 'ALL', label: 'Todas as Publicações', icon: Compass },
    { id: 'ESSAY', label: 'Artigos, Ensaios & Conceitos', icon: FileText },
    { id: 'BOOK', label: 'Livros & Clássicos', icon: BookOpen },
    { id: 'FILM', label: 'Cinema & Sétima Arte', icon: Film },
    { id: 'SACRED_ART', label: 'Música Sacra & Arte', icon: Music },
  ];

  const pendingWorks = useMemo(
    () => works.filter((w) => w.status === 'PENDING'),
    [works]
  );

  const pendingTopics = useMemo(
    () => topics.filter((t) => t.status === 'PENDING'),
    [topics]
  );

  const approvedWorks = useMemo(() => {
    return works.filter((w) => {
      if (w.status !== 'APPROVED') return false;
      if (selectedMediaFilter !== 'ALL' && w.media_type !== selectedMediaFilter) {
        return false;
      }
      if (selectedCategorySlug !== 'ALL') {
        const cat = categories.find((c) => c.id === w.category_id);
        if (cat?.slug !== selectedCategorySlug) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          w.title.toLowerCase().includes(q) ||
          w.creator.toLowerCase().includes(q) ||
          w.synopsis.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [works, selectedMediaFilter, selectedCategorySlug, searchQuery, categories]);

  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      if (t.status !== 'APPROVED') return false;
      if (selectedCategorySlug !== 'ALL') {
        const cat = categories.find((c) => c.id === t.category_id);
        if (cat?.slug !== selectedCategorySlug) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.body.toLowerCase().includes(q) ||
          t.tags.some((tag) => tag.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [topics, selectedCategorySlug, searchQuery, categories]);

  const mediaLabelMap: Record<MediaType, string> = {
    BOOK: 'Livro Clássico',
    FILM: 'Sétima Arte',
    DOCUMENTARY: 'Documentário',
    ESSAY: 'Artigo & Conceito',
    SACRED_ART: 'Música Sacra & Arte',
  };

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'BookOpen':
        return BookOpen;
      case 'GraduationCap':
        return GraduationCap;
      case 'Film':
        return Film;
      default:
        return MessageSquareQuote;
    }
  };

  const featuredWork = useMemo(
    () => approvedWorks[0] || works.find((w) => w.status === 'APPROVED') || null,
    [approvedWorks, works]
  );

  const featuredMetrics = useMemo(
    () => (featuredWork ? getReadingMetrics(featuredWork.synopsis) : null),
    [featuredWork]
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-10 space-y-8 sm:space-y-12">
      {/* 1. HERO EDITORIAL */}
      <section className="relative rounded-2xl border border-parchment-deep dark:border-slateDark-border bg-gradient-to-br from-parchment-warm via-parchment to-parchment-deep/35 dark:from-slateDark-card dark:via-slateDark-bg dark:to-slateDark-elevated px-5 py-8 sm:px-10 sm:py-12 lg:px-14 lg:py-14 shadow-editorial overflow-hidden">
        <div className="max-w-3xl space-y-4 sm:space-y-5">
          <p className="text-[11px] sm:text-xs font-bold tracking-[0.22em] uppercase text-burgundy dark:text-gold">
            VERITAS &amp; LITTERAE
          </p>

          <h1 className="font-serif text-2xl sm:text-4xl lg:text-[44px] font-bold text-ink dark:text-slateDark-text leading-[1.14] tracking-tight">
            Conhecimento que se cultiva. Ideias que se compartilham.
          </h1>

          <p className="font-literary text-base sm:text-xl text-ink-secondary dark:text-slateDark-muted leading-relaxed">
            Publicações, estudos e discussões à luz da tradição reformada.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={() => scrollToSection('em-destaque')}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-burgundy hover:bg-burgundy-hover dark:bg-gold dark:hover:bg-gold-light text-parchment dark:text-slateDark-bg text-sm font-semibold tracking-wide transition-colors shadow-sm"
            >
              <span>Conheça a publicação</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/escrever"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-elevated hover:border-burgundy dark:hover:border-gold text-ink dark:text-slateDark-text text-sm font-semibold transition-colors"
            >
              <Feather className="w-4 h-4 text-burgundy dark:text-gold" />
              <span>Seja um colaborador</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. EM DESTAQUE */}
      <section id="em-destaque" className="scroll-mt-24 space-y-4">
        <div className="flex items-end justify-between border-b border-parchment-deep dark:border-slateDark-border pb-3">
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-burgundy dark:text-gold block">
              Seleção Editorial
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink dark:text-slateDark-text">
              Em destaque
            </h2>
          </div>
          {featuredWork && (
            <Link
              to={`/obras/${featuredWork.slug}`}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-burgundy dark:text-gold hover:underline"
            >
              <span>Ler edição completa</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {featuredWork && featuredMetrics ? (
          <article className="rounded-2xl border border-parchment-deep dark:border-slateDark-border bg-parchment-warm/70 dark:bg-slateDark-card shadow-editorial overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12">
              <Link
                to={`/obras/${featuredWork.slug}`}
                className="lg:col-span-5 relative block bg-parchment-deep/40 dark:bg-slateDark-elevated min-h-[220px] sm:min-h-[280px] overflow-hidden group"
              >
                <img
                  src={featuredWork.cover_url}
                  alt={featuredWork.title}
                  className="w-full h-full max-h-[360px] object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
              </Link>

              <div className="lg:col-span-7 p-5 sm:p-8 lg:p-10 flex flex-col justify-between gap-5">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-burgundy dark:text-gold">
                    <span>{mediaLabelMap[featuredWork.media_type]}</span>
                    {featuredWork.category && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{featuredWork.category.name}</span>
                      </>
                    )}
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 text-ink-secondary dark:text-slateDark-muted">
                      <Clock className="w-3.5 h-3.5" />
                      {featuredMetrics.minutes} MIN DE LEITURA
                    </span>
                  </div>

                  <Link to={`/obras/${featuredWork.slug}`} className="block group">
                    <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ink dark:text-slateDark-text group-hover:text-burgundy dark:group-hover:text-gold transition-colors leading-tight">
                      {featuredWork.title}
                    </h3>
                  </Link>

                  {featuredWork.subtitle && (
                    <p className="font-literary italic text-base sm:text-lg text-ink-secondary dark:text-slateDark-muted">
                      “{featuredWork.subtitle}”
                    </p>
                  )}

                  <p className="text-sm sm:text-base text-ink-secondary dark:text-slateDark-muted leading-relaxed line-clamp-3">
                    {toPlainExcerpt(featuredWork.synopsis, 280)}
                  </p>
                </div>

                <div className="pt-4 border-t border-parchment-deep/80 dark:border-slateDark-border flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs sm:text-sm text-ink-secondary dark:text-slateDark-muted">
                    Por{' '}
                    <Link
                      to={`/perfil/${featuredWork.submitted_by?.id || featuredWork.submitted_by_id || 1}`}
                      className="font-semibold text-ink dark:text-slateDark-text hover:text-burgundy dark:hover:text-gold"
                    >
                      {featuredWork.submitted_by?.name || featuredWork.creator}
                    </Link>
                  </div>

                  <Link
                    to={`/obras/${featuredWork.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-burgundy hover:bg-burgundy-hover dark:bg-gold dark:hover:bg-gold-light text-parchment dark:text-slateDark-bg text-xs sm:text-sm font-semibold transition-colors"
                  >
                    <span>Ler texto completo</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </article>
        ) : (
          <div className="p-6 sm:p-8 rounded-xl border border-dashed border-parchment-deep dark:border-slateDark-border bg-parchment-warm/60 dark:bg-slateDark-card/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="font-serif text-xl font-bold text-ink dark:text-slateDark-text">
                Nenhuma publicação em destaque ainda
              </h3>
              <p className="text-sm text-ink-secondary dark:text-slateDark-muted">
                Publique o primeiro artigo, resenha ou estudo para inaugurar a vitrine editorial.
              </p>
            </div>
            <Link
              to="/escrever"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg text-xs sm:text-sm font-semibold shrink-0"
            >
              <Feather className="w-4 h-4" />
              <span>Escrever publicação</span>
            </Link>
          </div>
        )}
      </section>

      {/* 3. EXPLORE NOSSAS PUBLICAÇÕES */}
      <section id="explorar" className="space-y-4">
        <div>
          <span className="text-[11px] uppercase tracking-[0.2em] font-bold text-burgundy dark:text-gold block">
            Curadoria por Formato
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink dark:text-slateDark-text">
            Explore nossas publicações
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={() => {
              setSelectedMediaFilter('BOOK');
              scrollToSection('publicacoes');
            }}
            className={`text-left p-5 rounded-xl border transition-all group ${
              selectedMediaFilter === 'BOOK'
                ? 'border-burgundy dark:border-gold bg-burgundy/10 dark:bg-gold/15 ring-1 ring-burgundy/30'
                : 'border-parchment-deep dark:border-slateDark-border bg-parchment-warm dark:bg-slateDark-card hover:border-burgundy/50 dark:hover:border-gold/50'
            }`}
          >
            <BookOpen className="w-5 h-5 text-burgundy dark:text-gold mb-3" />
            <h3 className="font-serif text-lg font-bold text-ink dark:text-slateDark-text group-hover:text-burgundy dark:group-hover:text-gold transition-colors">
              Resenhas
            </h3>
            <p className="text-xs sm:text-sm text-ink-secondary dark:text-slateDark-muted mt-1">
              Livros e autores
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedMediaFilter('ESSAY');
              scrollToSection('publicacoes');
            }}
            className={`text-left p-5 rounded-xl border transition-all group ${
              selectedMediaFilter === 'ESSAY'
                ? 'border-burgundy dark:border-gold bg-burgundy/10 dark:bg-gold/15 ring-1 ring-burgundy/30'
                : 'border-parchment-deep dark:border-slateDark-border bg-parchment-warm dark:bg-slateDark-card hover:border-burgundy/50 dark:hover:border-gold/50'
            }`}
          >
            <FileText className="w-5 h-5 text-burgundy dark:text-gold mb-3" />
            <h3 className="font-serif text-lg font-bold text-ink dark:text-slateDark-text group-hover:text-burgundy dark:group-hover:text-gold transition-colors">
              Artigos
            </h3>
            <p className="text-xs sm:text-sm text-ink-secondary dark:text-slateDark-muted mt-1">
              Reflexões e pesquisas
            </p>
          </button>

          <Link
            to="/series"
            className="text-left p-5 rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment-warm dark:bg-slateDark-card hover:border-burgundy/50 dark:hover:border-gold/50 transition-all group block"
          >
            <Layers className="w-5 h-5 text-burgundy dark:text-gold mb-3" />
            <h3 className="font-serif text-lg font-bold text-ink dark:text-slateDark-text group-hover:text-burgundy dark:group-hover:text-gold transition-colors">
              Séries de estudos
            </h3>
            <p className="text-xs sm:text-sm text-ink-secondary dark:text-slateDark-muted mt-1">
              Conteúdo sequencial
            </p>
          </Link>

          <button
            type="button"
            onClick={() => scrollToSection('discussoes')}
            className="text-left p-5 rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment-warm dark:bg-slateDark-card hover:border-burgundy/50 dark:hover:border-gold/50 transition-all group"
          >
            <MessageSquareQuote className="w-5 h-5 text-burgundy dark:text-gold mb-3" />
            <h3 className="font-serif text-lg font-bold text-ink dark:text-slateDark-text group-hover:text-burgundy dark:group-hover:text-gold transition-colors">
              Discussões
            </h3>
            <p className="text-xs sm:text-sm text-ink-secondary dark:text-slateDark-muted mt-1">
              Diálogo e argumentação
            </p>
          </button>
        </div>
      </section>

      {/* 4. FILTRO POR CÁTEDRA & BUSCA */}
      <section className="rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment-warm/50 dark:bg-slateDark-card/60 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 sm:flex-wrap no-scrollbar">
            {mediaFilters.map((filter) => {
              const Icon = filter.icon;
              const active = selectedMediaFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => setSelectedMediaFilter(filter.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                    active
                      ? 'bg-ink text-parchment dark:bg-gold dark:text-slateDark-bg shadow-sm'
                      : 'bg-parchment dark:bg-slateDark-elevated text-ink-secondary dark:text-slateDark-muted border border-parchment-deep dark:border-slateDark-border hover:border-burgundy/40'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{filter.label}</span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:w-80">
            <Search className="w-4 h-4 text-ink-muted dark:text-slateDark-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar título, autor ou tema..."
              className="w-full pl-9 pr-4 py-2 rounded-md text-xs sm:text-sm bg-parchment dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border text-ink dark:text-slateDark-text placeholder:text-ink-muted/70 focus:outline-none focus:border-burgundy dark:focus:border-gold"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:flex-wrap no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedCategorySlug('ALL')}
            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              selectedCategorySlug === 'ALL'
                ? 'bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg'
                : 'bg-parchment dark:bg-slateDark-elevated text-ink-secondary dark:text-slateDark-muted border border-parchment-deep dark:border-slateDark-border hover:border-burgundy/40'
            }`}
          >
            Todas as Cátedras
          </button>
          {categories.map((cat) => {
            const Icon = getCategoryIcon(cat.icon_name);
            const isSelected = selectedCategorySlug === cat.slug;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() =>
                  setSelectedCategorySlug(isSelected ? 'ALL' : cat.slug)
                }
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg'
                    : 'bg-parchment dark:bg-slateDark-elevated text-ink-secondary dark:text-slateDark-muted border border-parchment-deep dark:border-slateDark-border hover:border-burgundy/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 5. ACERVO DE PUBLICAÇÕES & SIDEBAR */}
      <section id="publicacoes" className="scroll-mt-24 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-parchment-deep dark:border-slateDark-border pb-4">
            <div>
              <span className="text-xs uppercase tracking-widest font-bold text-burgundy dark:text-gold block">
                Acervo Editorial
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ink dark:text-slateDark-text">
                Publicações Recentes
              </h3>
            </div>
            <Link
              to="/escrever"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg text-xs sm:text-sm font-semibold hover:opacity-95 shadow-sm"
            >
              <Feather className="w-4 h-4" />
              <span>Escrever Novo Texto</span>
            </Link>
          </div>

          {/* Aviso de Textos Aguardando Revisão Obrigatória da Moderação */}
          {(pendingWorks.length > 0 || pendingTopics.length > 0) && (
            <div className="p-5 rounded-xl border-2 border-amber-500/80 bg-amber-50/90 dark:bg-amber-950/40 space-y-3 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
                  <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                  <h4 className="font-serif font-bold text-base sm:text-lg">
                    Textos Aguardando Revisão da Moderação (
                    {pendingWorks.length + pendingTopics.length})
                  </h4>
                </div>
                {permissions.can_moderate_queue && (
                  <Link
                    to="/moderacao"
                    className="text-xs sm:text-sm font-bold text-burgundy dark:text-gold hover:underline"
                  >
                    Abrir Painel de Moderação →
                  </Link>
                )}
              </div>

              <p className="text-xs sm:text-sm text-amber-950/90 dark:text-amber-200/90">
                Todo texto submetido passa obrigatoriamente pela revisão da moderação
                antes de ser publicado no feed principal.
              </p>

              <div className="space-y-2 pt-1">
                {pendingWorks.map((pw) => (
                  <div
                    key={`pw-${pw.id}`}
                    className="p-3.5 rounded-lg bg-parchment dark:bg-slateDark-card border border-amber-500/40 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-900 dark:text-amber-200">
                          Em Revisão
                        </span>
                        <Link
                          to={`/obras/${pw.slug}`}
                          className="font-serif font-bold text-base text-ink dark:text-slateDark-text hover:text-burgundy dark:hover:text-gold truncate"
                        >
                          {pw.title}
                        </Link>
                      </div>
                      <p className="text-xs text-ink-secondary dark:text-slateDark-muted mt-0.5">
                        Livro de {pw.creator} • Enviado por{' '}
                        {pw.submitted_by?.name || 'Membro'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        to={`/obras/${pw.slug}`}
                        className="px-3 py-1.5 rounded border border-parchment-deep dark:border-slateDark-border text-xs font-semibold text-ink dark:text-slateDark-text hover:border-burgundy"
                      >
                        Ler Texto
                      </Link>
                      {permissions.can_moderate_queue && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              moderateWorkStatus(
                                pw.id,
                                'APPROVED',
                                'Aprovado pela Moderação.'
                              )
                            }
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-forest text-parchment text-xs font-semibold"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Aprovar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              moderateWorkStatus(
                                pw.id,
                                'REJECTED',
                                'Reprovado pela Moderação.'
                              )
                            }
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-burgundy text-parchment text-xs font-semibold"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reprovar</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {pendingTopics.map((pt) => (
                  <div
                    key={`pt-${pt.id}`}
                    className="p-3.5 rounded-lg bg-parchment dark:bg-slateDark-card border border-amber-500/40 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-900 dark:text-amber-200">
                          Em Revisão
                        </span>
                        <Link
                          to={`/topicos/${pt.slug}`}
                          className="font-serif font-bold text-base text-ink dark:text-slateDark-text hover:text-burgundy dark:hover:text-gold truncate"
                        >
                          {pt.title}
                        </Link>
                      </div>
                      <p className="text-xs text-ink-secondary dark:text-slateDark-muted mt-0.5">
                        Ensaio • Enviado por {pt.author?.name || 'Membro'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        to={`/topicos/${pt.slug}`}
                        className="px-3 py-1.5 rounded border border-parchment-deep dark:border-slateDark-border text-xs font-semibold text-ink dark:text-slateDark-text hover:border-burgundy"
                      >
                        Ler Ensaio
                      </Link>
                      {permissions.can_moderate_queue && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              moderateTopicStatus(
                                pt.id,
                                'APPROVED',
                                'Aprovado pela Moderação.'
                              )
                            }
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-forest text-parchment text-xs font-semibold"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Aprovar</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              moderateTopicStatus(
                                pt.id,
                                'REJECTED',
                                'Reprovado pela Moderação.'
                              )
                            }
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-burgundy text-parchment text-xs font-semibold"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reprovar</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {approvedWorks.map((work) => {
            const metrics = getReadingMetrics(work.synopsis);
            const commentsList = work.comments || [];

            return (
              <article
                key={work.id}
                className="rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-card shadow-editorial overflow-hidden hover:border-burgundy/40 dark:hover:border-gold/40 transition-all"
              >
                <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 items-start">
                  <Link
                    to={`/obras/${work.slug}`}
                    className="shrink-0 w-full sm:w-32 md:w-36 h-44 sm:h-44 overflow-hidden rounded-lg border border-parchment-deep dark:border-slateDark-border bg-parchment-warm dark:bg-slateDark-elevated"
                  >
                    <img
                      src={work.cover_url}
                      alt={work.title}
                      className="w-full h-full object-cover hover:scale-[1.03] transition-transform duration-300"
                    />
                  </Link>

                  <div className="flex-1 min-w-0 space-y-2.5 w-full">
                    <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-burgundy dark:text-gold">
                      <span>{mediaLabelMap[work.media_type]}</span>
                      {work.category && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span>{work.category.name}</span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 text-ink-secondary dark:text-slateDark-muted">
                        <Clock className="w-3 h-3" />
                        {metrics.minutes} MIN DE LEITURA
                      </span>
                      <span className="ml-auto inline-flex items-center gap-1 text-gold font-bold">
                        <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                        {work.editorial_rating.toFixed(1)}
                      </span>
                    </div>

                    <div>
                      <Link to={`/obras/${work.slug}`} className="group block">
                        <h4 className="font-serif text-xl sm:text-2xl font-bold text-ink dark:text-slateDark-text group-hover:text-burgundy dark:group-hover:text-gold transition-colors leading-snug">
                          {work.title}
                        </h4>
                      </Link>
                      <p className="text-xs text-ink-secondary dark:text-slateDark-muted mt-0.5">
                        {work.media_type === 'ESSAY' ? (
                          <>
                            {work.publisher_or_studio || 'Artigo & Conceito Livre'} • {work.release_year}
                          </>
                        ) : (
                          <>
                            {work.creator} ({work.release_year}) • {work.publisher_or_studio}
                          </>
                        )}
                      </p>
                    </div>

                    <p className="text-sm text-ink-secondary dark:text-slateDark-muted leading-relaxed line-clamp-3">
                      {toPlainExcerpt(work.synopsis, 240)}
                    </p>

                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-parchment-deep/60 dark:border-slateDark-border/60">
                      <div className="flex flex-wrap items-center gap-3 text-xs text-ink-secondary dark:text-slateDark-muted">
                        <Link
                          to={`/perfil/${work.submitted_by?.id || work.submitted_by_id || 1}`}
                          className="inline-flex items-center gap-1.5 font-semibold text-ink dark:text-slateDark-text hover:text-burgundy dark:hover:text-gold"
                        >
                          <span className="w-5 h-5 rounded-full bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg font-serif font-bold text-[10px] flex items-center justify-center shrink-0">
                            {(work.submitted_by?.name || 'A').charAt(0).toUpperCase()}
                          </span>
                          <span>{work.submitted_by?.name || 'Colaborador'}</span>
                        </Link>
                        <Link
                          to={`/obras/${work.slug}#comentarios`}
                          className="inline-flex items-center gap-1 hover:text-burgundy dark:hover:text-gold"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{commentsList.length}</span>
                        </Link>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 ml-auto">
                        {(permissions.can_moderate_queue ||
                          (isAuthenticated &&
                            currentUser.id ===
                              (work.submitted_by?.id || work.submitted_by_id))) && (
                          <button
                            type="button"
                            onClick={() => {
                              setDeletePromptTarget({
                                type: 'WORK',
                                id: work.id,
                                title: work.title,
                                authorName: work.submitted_by?.name || work.creator,
                              });
                              setDeleteReasonText(
                                permissions.can_moderate_queue
                                  ? 'Remoção pela Moderação por inadequação às diretrizes editoriais.'
                                  : 'Excluído pelo autor.'
                              );
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold text-red-700 dark:text-red-300 hover:bg-red-500/10 transition-colors"
                            title="Excluir esta publicação"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            setFlagModalTarget({
                              target_type: 'WORK',
                              target_id: work.id,
                              target_title: work.title,
                              target_excerpt: work.synopsis.slice(0, 160),
                              target_author_name: work.submitted_by?.name || work.creator,
                            })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-semibold text-ink-muted hover:text-burgundy dark:hover:text-gold transition-colors"
                          title="Sinalizar conteúdo impróprio"
                        >
                          <Flag className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          to={`/obras/${work.slug}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-burgundy/10 hover:bg-burgundy text-burgundy hover:text-parchment dark:bg-gold/15 dark:hover:bg-gold dark:text-gold dark:hover:text-slateDark-bg text-xs font-semibold transition-colors"
                        >
                          <span>Ler texto completo</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}

          {approvedWorks.length === 0 && (
            <div className="p-8 sm:p-14 text-center rounded-xl border border-dashed border-parchment-deep dark:border-slateDark-border bg-parchment-warm/60 dark:bg-slateDark-card/60 space-y-4">
              <BookOpen className="w-12 h-12 mx-auto text-burgundy/60 dark:text-gold/60" />
              <div className="space-y-1.5">
                <h4 className="font-serif text-xl sm:text-2xl font-bold text-ink dark:text-slateDark-text">
                  Nenhuma obra ou resenha publicada ainda
                </h4>
                <p className="text-xs sm:text-sm text-ink-secondary dark:text-slateDark-muted max-w-md mx-auto leading-relaxed">
                  O acervo está pronto e limpo. Seja o primeiro a inaugurar a cátedra com uma nova resenha ou ensaio literário!
                </p>
              </div>
              <Link
                to="/escrever"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-burgundy hover:bg-burgundy-hover dark:bg-gold dark:hover:bg-gold-light dark:text-slateDark-bg text-parchment text-xs sm:text-sm font-semibold transition-colors shadow-sm"
              >
                <Feather className="w-4 h-4" />
                <span>Escrever Primeira Publicação</span>
              </Link>
            </div>
          )}
        </div>

        {/* Coluna Lateral: Séries & Cadernos, Ensaios Temáticos & Carta de Princípios (4 colunas) */}
        <aside className="lg:col-span-4 space-y-6 sticky top-24">
          {/* Bloco Discreto: Séries & Cadernos Recorrentes */}
          <div className="p-4 sm:p-5 rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment-warm dark:bg-slateDark-card space-y-3.5 shadow-editorial">
            <div className="flex items-center justify-between border-b border-parchment-deep dark:border-slateDark-border pb-2.5">
              <div>
                <span className="text-[11px] uppercase tracking-widest font-bold text-burgundy dark:text-gold flex items-center gap-1">
                  <BookMarked className="w-3.5 h-3.5" />
                  <span>Leitura em Sequência</span>
                </span>
                <h4 className="font-serif text-lg font-bold text-ink dark:text-slateDark-text">
                  Séries &amp; Cadernos
                </h4>
              </div>
              <Link
                to="/series"
                className="text-xs font-semibold text-burgundy dark:text-gold hover:underline"
              >
                Ver todas →
              </Link>
            </div>

            {series.length === 0 ? (
              <div className="py-3 text-center space-y-2">
                <p className="text-xs text-ink-secondary dark:text-slateDark-muted">
                  Comentários diários e cadernos de estudo agrupados por livro.
                </p>
                <Link
                  to="/series"
                  className="inline-flex items-center gap-1 text-xs font-bold text-burgundy dark:text-gold hover:underline"
                >
                  <span>Explorar Séries &amp; Cadernos →</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {series.slice(0, 3).map((s) => (
                  <Link
                    key={s.id}
                    to={`/series/${s.slug}`}
                    className="block p-3 rounded-lg bg-parchment dark:bg-slateDark-elevated border border-parchment-deep/70 dark:border-slateDark-border hover:border-burgundy/50 dark:hover:border-gold/50 transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2 text-[10px]">
                      <span className="font-bold uppercase tracking-wider text-burgundy dark:text-gold">
                        {s.cadence_label}
                      </span>
                      <span className="text-ink-muted font-mono">
                        {(s.entries || []).length} notas
                      </span>
                    </div>
                    <p className="font-serif font-bold text-sm text-ink dark:text-slateDark-text leading-snug line-clamp-1">
                      {s.title}
                    </p>
                    {s.book_title && (
                      <p className="text-[11px] text-ink-secondary dark:text-slateDark-muted truncate">
                        {s.book_title}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Ensaios e Diálogos dos Membros */}
          <div id="discussoes" className="scroll-mt-24 p-4 sm:p-6 rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment-warm dark:bg-slateDark-card space-y-4 shadow-editorial">
            <div className="flex items-center justify-between border-b border-parchment-deep dark:border-slateDark-border pb-3">
              <div>
                <span className="text-xs uppercase tracking-widest font-bold text-navy dark:text-gold block">
                  Fórum &amp; Colóquios
                </span>
                <h4 className="font-serif text-xl font-bold text-ink dark:text-slateDark-text">
                  Debates &amp; Ensaios Abertos
                </h4>
              </div>
              <Link
                to="/escrever"
                className="text-xs sm:text-sm font-semibold text-burgundy dark:text-gold hover:underline"
              >
                + Novo
              </Link>
            </div>

            <div className="divide-y divide-parchment-deep dark:divide-slateDark-border">
              {filteredTopics.length === 0 && (
                <div className="py-8 text-center space-y-3">
                  <p className="text-xs sm:text-sm text-ink-secondary dark:text-slateDark-muted">
                    Nenhum ensaio aberto no fórum ainda.
                  </p>
                  <Link
                    to="/escrever"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-burgundy dark:text-gold hover:underline"
                  >
                    <Feather className="w-3.5 h-3.5" />
                    <span>Iniciar Diálogo Clássico</span>
                  </Link>
                </div>
              )}
              {filteredTopics.map((topic) => (
                <div key={topic.id} className="py-4 first:pt-1 last:pb-1 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    {topic.is_pinned && (
                      <Pin className="w-3.5 h-3.5 text-burgundy dark:text-gold shrink-0" />
                    )}
                    <span className="font-bold text-burgundy dark:text-gold">
                      {topic.category?.name}
                    </span>
                    <span className="text-ink-muted">•</span>
                    <Link
                      to={`/perfil/${topic.author?.id || topic.author_id || 1}`}
                      className="font-semibold text-ink-secondary dark:text-slateDark-muted hover:text-burgundy dark:hover:text-gold underline decoration-burgundy/30"
                    >
                      por {topic.author?.name}
                    </Link>
                  </div>

                  <Link
                    to={`/topicos/${topic.slug}`}
                    className="block font-serif font-bold text-lg text-ink dark:text-slateDark-text hover:text-burgundy dark:hover:text-gold leading-snug"
                  >
                    {topic.title}
                  </Link>

                  <p className="text-xs sm:text-sm text-ink-secondary dark:text-slateDark-muted line-clamp-2 leading-relaxed">
                    {topic.excerpt}
                  </p>

                  <div className="flex items-center gap-3 text-xs font-medium text-ink-secondary dark:text-slateDark-muted pt-1">
                    <button
                      onClick={() => upvoteItem('TOPIC', topic.id)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${
                        hasUserUpvoted('TOPIC', topic.id)
                          ? 'bg-burgundy/15 text-burgundy dark:bg-gold/20 dark:text-gold font-bold'
                          : 'hover:text-burgundy dark:hover:text-gold'
                      }`}
                      title={
                        hasUserUpvoted('TOPIC', topic.id)
                          ? 'Você já curtiu este ensaio'
                          : 'Curtir ensaio'
                      }
                    >
                      <ThumbsUp
                        className={`w-3.5 h-3.5 ${
                          hasUserUpvoted('TOPIC', topic.id) ? 'fill-current' : ''
                        }`}
                      />
                      <span>{topic.upvotes_count}</span>
                    </button>
                    <Link
                      to={`/topicos/${topic.slug}`}
                      className="inline-flex items-center gap-1 hover:text-ink dark:hover:text-white"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{topic.comments_count} comentários</span>
                    </Link>
                    {(permissions.can_moderate_queue ||
                      (isAuthenticated &&
                        currentUser.id ===
                          (topic.author?.id || topic.author_id))) && (
                      <button
                        type="button"
                        onClick={() => {
                          setDeletePromptTarget({
                            type: 'TOPIC',
                            id: topic.id,
                            title: topic.title,
                            authorName: topic.author?.name || 'Membro',
                          });
                          setDeleteReasonText(
                            permissions.can_moderate_queue
                              ? 'Ensaio removido pela Moderação.'
                              : 'Excluído pelo autor.'
                          );
                        }}
                        className="inline-flex items-center gap-1 text-red-700 dark:text-red-300 hover:underline font-semibold"
                        title="Excluir ensaio"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Excluir</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setFlagModalTarget({
                          target_type: 'TOPIC',
                          target_id: topic.id,
                          target_title: topic.title,
                          target_excerpt: topic.excerpt,
                          target_author_name: topic.author?.name || 'Membro',
                        });
                      }}
                      className="ml-auto text-ink-muted hover:text-burgundy dark:hover:text-gold transition-colors p-1"
                      title="Sinalizar ensaio à moderação"
                    >
                      <Flag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Carta de Princípios */}
          <div className="p-4 sm:p-6 rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment-warm/90 dark:bg-slateDark-card space-y-3 shadow-editorial">
            <div className="flex items-center gap-2 text-burgundy dark:text-gold">
              <Award className="w-5 h-5" />
              <h4 className="font-serif text-lg font-bold text-ink dark:text-slateDark-text">
                Carta de Princípios
              </h4>
            </div>
            <p className="text-xs text-ink-secondary dark:text-slateDark-muted leading-relaxed">
              Inspirados pela regra agostiniana —{' '}
              <em className="font-literary text-sm">
                “Naquilo que é necessário, unidade; naquilo que é duvidoso, liberdade; em
                tudo, a caridade”
              </em>{' '}
              —, cultivamos a leitura demorada e o debate intelectual caridoso.
            </p>
          </div>

          {/* Transparência de Afiliados */}
          <div className="p-5 rounded-xl border border-forest/25 dark:border-forest-light/40 bg-forest/5 dark:bg-slateDark-elevated space-y-2">
            <div className="flex items-center gap-2 text-forest dark:text-emerald-300">
              <ShieldCheck className="w-4 h-4" />
              <h4 className="font-serif text-sm font-bold">
                Apoio Editorial via Amazon
              </h4>
            </div>
            <p className="text-xs text-ink-secondary dark:text-slateDark-muted leading-relaxed">
              {settings.default_affiliate_disclaimer}
            </p>
          </div>
        </aside>
      </section>

      {/* Modal de Exclusão (Moderação ou Autor) */}
      {deletePromptTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-xl border-2 border-red-600/60 bg-parchment dark:bg-slateDark-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-red-700 dark:text-red-400">
              <Trash2 className="w-5 h-5 shrink-0" />
              <h4 className="font-serif text-lg font-bold">
                {permissions.can_moderate_queue
                  ? 'Confirmar Exclusão pela Moderação'
                  : 'Confirmar Exclusão'}
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-ink-secondary dark:text-slateDark-muted">
              Você está prestes a excluir{' '}
              <strong className="text-ink dark:text-white">
                “{deletePromptTarget.title}”
              </strong>
              .{' '}
              {permissions.can_moderate_queue
                ? 'Toda exclusão realizada pela moderação exige justificativa e fica registrada permanentemente no Log de Auditoria.'
                : 'Tem certeza de que deseja apagar permanentemente? Esta ação não pode ser desfeita.'}
            </p>
            {permissions.can_moderate_queue && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted">
                  Motivo / Justificativa para o Log
                </label>
                <textarea
                  rows={3}
                  value={deleteReasonText}
                  onChange={(e) => setDeleteReasonText(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-sm text-ink dark:text-slateDark-text focus:outline-none focus:border-red-600"
                />
              </div>
            )}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeletePromptTarget(null)}
                className="px-4 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border text-xs font-semibold text-ink-secondary hover:text-ink"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={async () => {
                  await deleteContent(
                    deletePromptTarget.type,
                    deletePromptTarget.id,
                    deletePromptTarget.title,
                    deleteReasonText || 'Excluído pelo autor.',
                    deletePromptTarget.authorName
                  );
                  setDeletePromptTarget(null);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirmar Exclusão</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
