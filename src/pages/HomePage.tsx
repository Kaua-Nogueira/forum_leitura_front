import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Film,
  GraduationCap,
  MessageSquareQuote,
  Sparkles,
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
  ChevronDown,
  ChevronUp,
  Send,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AffiliateButton } from '../components/AffiliateButton';
import { RichTextRenderer, getReadingMetrics } from '../components/RichTextRenderer';
import { MediaType } from '../types/schema';

export const HomePage: React.FC = () => {
  const {
    categories,
    works,
    topics,
    settings,
    currentUser,
    isAuthenticated,
    addComment,
    upvoteItem,
    setFlagModalTarget,
    showToast,
  } = useApp();

  const [selectedMediaFilter, setSelectedMediaFilter] = useState<string>('ALL');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Track which book essays are expanded inline on the feed
  const [expandedWorkIds, setExpandedWorkIds] = useState<Record<number, boolean>>({
    1: true, // First essay ("Confissões") already expanded so the user immediately sees a rich long text!
  });

  // Track which book cards have their inline comment drawer open
  const [openCommentsWorkIds, setOpenCommentsWorkIds] = useState<
    Record<number, boolean>
  >({
    1: true,
  });

  const [quickCommentByWorkId, setQuickCommentByWorkId] = useState<
    Record<number, string>
  >({});

  const toggleExpandWork = (id: number) => {
    setExpandedWorkIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCommentsDrawer = (id: number) => {
    setOpenCommentsWorkIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleQuickCommentSubmit = async (e: React.FormEvent, workId: number) => {
    e.preventDefault();
    const text = quickCommentByWorkId[workId]?.trim();
    if (!text) return;
    if (!isAuthenticated) {
      showToast(
        'Faça login para comentar',
        'Entre na sua conta para publicar comentários.',
        'warning'
      );
      return;
    }
    await addComment({
      body: text,
      rating: 5,
      work_id: workId,
      topic_id: null,
      parent_id: null,
    });
    setQuickCommentByWorkId((prev) => ({ ...prev, [workId]: '' }));
  };

  const mediaFilters = [
    { id: 'ALL', label: 'Todas as Leituras', icon: Compass },
    { id: 'BOOK', label: 'Livros & Clássicos', icon: BookOpen },
    { id: 'FILM', label: 'Cinema & Sétima Arte', icon: Film },
    { id: 'ESSAY', label: 'Artigos & Educação', icon: FileText },
    { id: 'SACRED_ART', label: 'Música Sacra & Arte', icon: Music },
  ];

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
    ESSAY: 'Ensaio & Pedagogia',
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* 1. HERO EDITORIAL & CHAMADA PARA ESCRITA */}
      <section className="relative rounded-xl border border-parchment-deep dark:border-slateDark-border bg-gradient-to-br from-parchment-warm via-parchment to-parchment-deep/40 dark:from-slateDark-card dark:via-slateDark-bg dark:to-slateDark-elevated p-6 sm:p-10 shadow-editorial">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-burgundy/10 dark:bg-gold/15 border border-burgundy/20 dark:border-gold/30 text-burgundy dark:text-gold text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Revista Comunitária de Ensaios &amp; Resenhas Literárias</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-[42px] font-bold text-ink dark:text-slateDark-text leading-[1.16] tracking-tight">
              Textos profundos sobre grandes livros, escritos para serem lidos sem pressa.
            </h2>

            <p className="text-ink-secondary dark:text-slateDark-muted text-base sm:text-lg leading-relaxed">
              Cada postagem em nossa comunidade é um ensaio ou resenha meditada sobre uma
              obra clássica, teológica ou educativa — com espaço confortável para leitura,
              citações destacadas e diálogo aberto nos comentários.
            </p>
          </div>

          {/* Quick Action Card to Open the Scriptorium */}
          <div className="lg:col-span-4 p-6 rounded-xl bg-parchment dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border shadow-editorial space-y-4">
            <div className="flex items-center gap-2.5 text-burgundy dark:text-gold">
              <Feather className="w-5 h-5" />
              <h3 className="font-serif text-lg font-bold text-ink dark:text-slateDark-text">
                Publique sua Leitura
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-ink-secondary dark:text-slateDark-muted leading-relaxed">
              Terminou um livro marcante? Abra nosso <strong>Scriptorium</strong> em tela
              cheia para redigir sua resenha com subtítulos, citações e preview ao vivo.
            </p>
            <Link
              to="/escrever"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-md bg-burgundy hover:bg-burgundy-hover dark:bg-gold dark:hover:bg-gold-light text-parchment dark:text-slateDark-bg text-xs sm:text-sm font-semibold tracking-wide transition-colors shadow-sm"
            >
              <Feather className="w-4 h-4" />
              <span>Abrir Estúdio de Escrita</span>
            </Link>
          </div>
        </div>

        {/* Search & Media Filter Bar */}
        <div className="mt-8 pt-6 border-t border-parchment-deep/80 dark:border-slateDark-border flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {mediaFilters.map((filter) => {
              const Icon = filter.icon;
              const active = selectedMediaFilter === filter.id;
              return (
                <button
                  key={filter.id}
                  onClick={() => setSelectedMediaFilter(filter.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-xs font-medium transition-all ${
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
              placeholder="Buscar livro, autor ou tema do ensaio..."
              className="w-full pl-9 pr-4 py-2 rounded-md text-xs sm:text-sm bg-parchment dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border text-ink dark:text-slateDark-text placeholder:text-ink-muted/70 focus:outline-none focus:border-burgundy dark:focus:border-gold"
            />
          </div>
        </div>
      </section>

      {/* 2. FILTRO RÁPIDO PELAS 4 CÁTEDRAS TEMÁTICAS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {categories.map((cat) => {
          const Icon = getCategoryIcon(cat.icon_name);
          const isSelected = selectedCategorySlug === cat.slug;
          return (
            <button
              key={cat.id}
              onClick={() =>
                setSelectedCategorySlug(isSelected ? 'ALL' : cat.slug)
              }
              className={`text-left p-4 rounded-lg border transition-all duration-200 ${
                isSelected
                  ? 'border-burgundy dark:border-gold bg-burgundy/5 dark:bg-gold/10 shadow-editorial-hover ring-1 ring-burgundy/30'
                  : 'border-parchment-deep dark:border-slateDark-border bg-parchment-warm/60 dark:bg-slateDark-card hover:border-burgundy/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 font-serif font-bold text-base text-ink dark:text-slateDark-text">
                  <Icon className="w-4 h-4 text-burgundy dark:text-gold" />
                  {cat.name}
                </span>
                <span className="font-literary italic text-xs text-ink-muted dark:text-gold-light">
                  {cat.latin_motto}
                </span>
              </div>
              <p className="text-xs text-ink-muted dark:text-slateDark-muted line-clamp-2 leading-relaxed">
                {cat.description}
              </p>
            </button>
          );
        })}
      </section>

      {/* 3. FEED PRINCIPAL DE ENSAIOS & RESENHAS LONGAS SOBRE LIVROS + SIDEBAR */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Coluna Principal de Leitura dos Textos sobre Livros (8 colunas largas) */}
        <div className="lg:col-span-8 space-y-8">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-parchment-deep dark:border-slateDark-border pb-4">
            <div>
              <span className="text-[11px] uppercase tracking-widest font-semibold text-burgundy dark:text-gold block">
                Caderno de Leituras &amp; Ensaios Críticos
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ink dark:text-slateDark-text">
                Postagens &amp; Resenhas sobre Obras
              </h3>
            </div>
            <Link
              to="/escrever"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg text-xs font-semibold hover:opacity-95 shadow-sm"
            >
              <Feather className="w-3.5 h-3.5" />
              <span>+ Escrever Novo Texto</span>
            </Link>
          </div>

          {approvedWorks.map((work) => {
            const isExpanded = Boolean(expandedWorkIds[work.id]);
            const isCommentsOpen = Boolean(openCommentsWorkIds[work.id]);
            const metrics = getReadingMetrics(work.synopsis);
            const firstQuote = work.notable_quotes?.[0];
            const previewParagraphs = work.synopsis
              .split(/\n\n+/)
              .slice(0, 2)
              .join('\n\n');
            const commentsList = work.comments || [];

            return (
              <article
                key={work.id}
                className="rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-card shadow-editorial overflow-hidden transition-all"
              >
                {/* Cabeçalho do Livro + Autor da Postagem */}
                <div className="p-6 sm:p-8 bg-parchment-warm/70 dark:bg-slateDark-elevated/60 border-b border-parchment-deep/80 dark:border-slateDark-border">
                  <div className="flex flex-col sm:flex-row gap-6 items-start">
                    {/* Capa do Livro */}
                    <Link
                      to={`/obras/${work.slug}`}
                      className="shrink-0 mx-auto sm:mx-0"
                    >
                      <img
                        src={work.cover_url}
                        alt={work.title}
                        className="w-32 sm:w-36 h-48 sm:h-52 object-cover rounded-lg shadow-md border border-parchment-deep dark:border-slateDark-border hover:scale-[1.02] transition-transform"
                      />
                    </Link>

                    {/* Metadados do Livro & Título do Ensaio */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="px-2.5 py-0.5 rounded bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg font-semibold uppercase tracking-wider text-[11px]">
                          {mediaLabelMap[work.media_type]}
                        </span>
                        {work.category && (
                          <span className="px-2.5 py-0.5 rounded bg-parchment dark:bg-slateDark-card border border-parchment-deep dark:border-slateDark-border font-medium text-ink-secondary dark:text-slateDark-text text-[11px]">
                            {work.category.name}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 text-ink-muted dark:text-slateDark-muted ml-auto">
                          <Clock className="w-3.5 h-3.5 text-burgundy dark:text-gold" />
                          {metrics.words} palavras • ~{metrics.minutes} min de leitura
                        </span>
                      </div>

                      <div>
                        <Link to={`/obras/${work.slug}`} className="group">
                          <h4 className="font-serif text-2xl sm:text-3xl font-bold text-ink dark:text-slateDark-text group-hover:text-burgundy dark:group-hover:text-gold transition-colors leading-tight">
                            {work.title}
                          </h4>
                        </Link>
                        <p className="text-xs sm:text-sm font-semibold text-burgundy dark:text-gold mt-1">
                          Obra de {work.creator} ({work.release_year}) •{' '}
                          <span className="font-normal text-ink-muted dark:text-slateDark-muted">
                            {work.publisher_or_studio}
                          </span>
                        </p>
                      </div>

                      {work.subtitle && (
                        <p className="font-literary italic text-base sm:text-lg text-ink-secondary dark:text-slateDark-muted leading-snug">
                          “{work.subtitle}”
                        </p>
                      )}

                      <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted dark:text-slateDark-muted">
                        <span>
                          Resenha por{' '}
                          <strong className="text-ink dark:text-slateDark-text">
                            {work.submitted_by?.name || 'Prof. Augusto Vasconcelos'}
                          </strong>
                        </span>
                        <span className="inline-flex items-center gap-1 text-gold font-bold">
                          <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                          {work.editorial_rating.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Corpo do Texto sobre o Livro (Espaço Agradável de Leitura) */}
                <div className="p-6 sm:p-10 space-y-6">
                  {firstQuote && (
                    <blockquote className="p-4 sm:p-5 rounded-lg bg-parchment-warm/70 dark:bg-slateDark-elevated border-l-4 border-burgundy dark:border-gold">
                      <p className="font-literary italic text-lg sm:text-xl text-ink dark:text-slateDark-text leading-relaxed">
                        “{firstQuote.quote_text}”
                      </p>
                      <footer className="mt-1.5 text-xs font-semibold uppercase tracking-wider text-burgundy dark:text-gold-light">
                        — {firstQuote.source_note}
                      </footer>
                    </blockquote>
                  )}

                  {/* Texto Médio/Grande Formatado */}
                  <div className="relative">
                    <RichTextRenderer
                      content={isExpanded ? work.synopsis : previewParagraphs}
                      dropcap={true}
                      fontSize="large"
                      fontFamily="serif"
                    />

                    {!isExpanded && work.synopsis.length > previewParagraphs.length && (
                      <div className="mt-4 pt-4 border-t border-dashed border-parchment-deep dark:border-slateDark-border flex flex-wrap items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => toggleExpandWork(work.id)}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-parchment-warm dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border text-xs sm:text-sm font-semibold text-burgundy dark:text-gold hover:border-burgundy transition-colors"
                        >
                          <ChevronDown className="w-4 h-4" />
                          <span>
                            Continuar Lendo o Texto Completo Aqui ({metrics.words}{' '}
                            palavras)
                          </span>
                        </button>

                        <Link
                          to={`/obras/${work.slug}`}
                          className="text-xs font-semibold text-ink-secondary dark:text-slateDark-muted hover:text-burgundy dark:hover:text-gold underline"
                        >
                          Abrir em tela de leitura dedicada →
                        </Link>
                      </div>
                    )}

                    {isExpanded && (
                      <div className="mt-6 pt-4 border-t border-dashed border-parchment-deep dark:border-slateDark-border flex items-center justify-between">
                        <button
                          type="button"
                          onClick={() => toggleExpandWork(work.id)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-ink-muted hover:text-ink"
                        >
                          <ChevronUp className="w-4 h-4" />
                          <span>Recolher texto</span>
                        </button>

                        <Link
                          to={`/obras/${work.slug}`}
                          className="text-xs font-semibold text-burgundy dark:text-gold hover:underline"
                        >
                          Abrir em Modo Leitura Tela Cheia →
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Barra de Ações da Postagem: Compra Afiliada + Botão de Comentários */}
                  <div className="pt-4 border-t border-parchment-deep dark:border-slateDark-border grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-7">
                      <AffiliateButton work={work} variant="compact" />
                    </div>

                    <div className="md:col-span-5 flex flex-wrap items-center justify-end gap-2.5">
                      <button
                        type="button"
                        onClick={() => toggleCommentsDrawer(work.id)}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-semibold border transition-colors ${
                          isCommentsOpen
                            ? 'bg-burgundy text-parchment border-burgundy dark:bg-gold dark:text-slateDark-bg'
                            : 'bg-parchment-warm dark:bg-slateDark-elevated text-ink dark:text-slateDark-text border-parchment-deep dark:border-slateDark-border hover:border-burgundy'
                        }`}
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>
                          Comentários ({commentsList.length}) • Comentar
                        </span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Gaveta Inline de Comentários (Ler e Digitar Comentário Direto no Post!) */}
                {isCommentsOpen && (
                  <div className="p-6 sm:p-8 bg-parchment-warm/60 dark:bg-slateDark-elevated/50 border-t border-parchment-deep dark:border-slateDark-border space-y-5">
                    <div className="flex items-center justify-between">
                      <h5 className="font-serif text-lg font-bold text-ink dark:text-slateDark-text flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-burgundy dark:text-gold" />
                        <span>
                          Comentários sobre “{work.title}” ({commentsList.length})
                        </span>
                      </h5>
                      <Link
                        to={`/obras/${work.slug}#comentarios`}
                        className="text-xs font-semibold text-burgundy dark:text-gold hover:underline"
                      >
                        Ver thread completa →
                      </Link>
                    </div>

                    {/* Caixa Rápida e Espaçosa para Comentar */}
                    <form
                      onSubmit={(e) => handleQuickCommentSubmit(e, work.id)}
                      className="space-y-3"
                    >
                      <textarea
                        rows={3}
                        required
                        value={quickCommentByWorkId[work.id] || ''}
                        onChange={(e) =>
                          setQuickCommentByWorkId((prev) => ({
                            ...prev,
                            [work.id]: e.target.value,
                          }))
                        }
                        placeholder={`Escreva seu comentário sobre "${work.title}"... (Use '>' para citar um trecho)`}
                        className="w-full px-4 py-3 rounded-lg border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text text-sm sm:text-base font-literary leading-relaxed focus:outline-none focus:border-burgundy"
                      />
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-ink-muted dark:text-slateDark-muted">
                          {isAuthenticated ? (
                            <>
                              Comentando como <strong>{currentUser.name}</strong>
                            </>
                          ) : (
                            <Link
                              to="/login"
                              className="text-burgundy dark:text-gold font-semibold hover:underline"
                            >
                              Entre na sua conta para comentar →
                            </Link>
                          )}
                        </span>
                        <button
                          type="submit"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-burgundy hover:bg-burgundy-hover dark:bg-gold dark:text-slateDark-bg text-parchment text-xs font-semibold shadow-sm"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Publicar Comentário</span>
                        </button>
                      </div>
                    </form>

                    {/* Lista de Comentários do Livro */}
                    {commentsList.length > 0 && (
                      <div className="space-y-3 pt-2">
                        {commentsList.map((c) => (
                          <div
                            key={c.id}
                            className="p-4 rounded-lg bg-parchment dark:bg-slateDark-card border border-parchment-deep dark:border-slateDark-border space-y-2"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-ink dark:text-slateDark-text">
                                {c.author?.name || 'Leitor'}
                              </span>
                              <button
                                type="button"
                                onClick={() => upvoteItem('COMMENT', c.id)}
                                className="inline-flex items-center gap-1 text-ink-muted hover:text-burgundy dark:hover:text-gold"
                              >
                                <ThumbsUp className="w-3 h-3" />
                                <span>{c.upvotes_count}</span>
                              </button>
                            </div>
                            <RichTextRenderer
                              content={c.body}
                              fontSize="normal"
                              fontFamily="serif"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>

        {/* Coluna Lateral: Ensaios Temáticos da Comunidade & Carta de Princípios (4 colunas) */}
        <aside className="lg:col-span-4 space-y-6 sticky top-24">
          {/* Ensaios e Diálogos dos Membros */}
          <div className="p-6 rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment-warm/80 dark:bg-slateDark-card space-y-4 shadow-editorial">
            <div className="flex items-center justify-between border-b border-parchment-deep dark:border-slateDark-border pb-3">
              <div>
                <span className="text-[10px] uppercase tracking-widest font-bold text-navy dark:text-gold block">
                  Fórum &amp; Colóquios
                </span>
                <h4 className="font-serif text-lg font-bold text-ink dark:text-slateDark-text">
                  Debates &amp; Ensaios Abertos
                </h4>
              </div>
              <Link
                to="/escrever"
                className="text-xs font-semibold text-burgundy dark:text-gold hover:underline"
              >
                + Novo
              </Link>
            </div>

            <div className="divide-y divide-parchment-deep/70 dark:divide-slateDark-border">
              {filteredTopics.map((topic) => (
                <div key={topic.id} className="py-3.5 first:pt-1 last:pb-1 space-y-2">
                  <div className="flex items-center gap-1.5 text-[11px]">
                    {topic.is_pinned && (
                      <Pin className="w-3 h-3 text-burgundy dark:text-gold shrink-0" />
                    )}
                    <span className="font-semibold text-burgundy dark:text-gold">
                      {topic.category?.name}
                    </span>
                    <span className="text-ink-muted">•</span>
                    <span className="text-ink-muted dark:text-slateDark-muted">
                      {topic.author?.name}
                    </span>
                  </div>

                  <Link
                    to={`/topicos/${topic.slug}`}
                    className="block font-serif font-bold text-base text-ink dark:text-slateDark-text hover:text-burgundy dark:hover:text-gold leading-snug"
                  >
                    {topic.title}
                  </Link>

                  <p className="text-xs text-ink-muted dark:text-slateDark-muted line-clamp-2 leading-relaxed">
                    {topic.excerpt}
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-ink-muted pt-1">
                    <button
                      onClick={() => upvoteItem('TOPIC', topic.id)}
                      className="inline-flex items-center gap-1 hover:text-burgundy dark:hover:text-gold"
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>{topic.upvotes_count}</span>
                    </button>
                    <Link
                      to={`/topicos/${topic.slug}`}
                      className="inline-flex items-center gap-1 hover:text-ink dark:hover:text-white"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>{topic.comments_count} comentários</span>
                    </Link>
                    <button
                      onClick={() =>
                        setFlagModalTarget({
                          target_type: 'TOPIC',
                          target_id: topic.id,
                          target_title: topic.title,
                          target_excerpt: topic.excerpt,
                          target_author_name: topic.author?.name || 'Membro',
                        })
                      }
                      className="ml-auto hover:text-burgundy"
                    >
                      <Flag className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Carta de Princípios */}
          <div className="p-6 rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment-warm/90 dark:bg-slateDark-card space-y-3 shadow-editorial">
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
    </div>
  );
};
