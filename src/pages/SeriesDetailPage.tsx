import React, { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookMarked,
  BookOpen,
  Plus,
  Search,
  Calendar,
  Clock,
  ThumbsUp,
  MessageSquare,
  Trash2,
  Edit3,
  Type,
  AlignJustify,
  AlignLeft,
  AlignCenter,
  Bold,
  Italic,
  Quote,
  Heading2,
  X,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RichTextRenderer, getReadingMetrics } from '../components/RichTextRenderer';
import { CommentThread } from '../components/CommentThread';
import { AffiliateButton } from '../components/AffiliateButton';

export const SeriesDetailPage: React.FC = () => {
  const { slug, entrySlug } = useParams<{ slug: string; entrySlug?: string }>();
  const navigate = useNavigate();
  const {
    series,
    works,
    currentUser,
    isAuthenticated,
    permissions,
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
    textAlign,
    setTextAlign,
    createSeriesEntry,
    updateSeriesEntry,
    deleteSeriesEntry,
    deleteSeries,
    upvoteItem,
    hasUserUpvoted,
    showToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showNewEntryForm, setShowNewEntryForm] = useState(false);
  const [isPublishingEntry, setIsPublishingEntry] = useState(false);

  // New entry fields
  const [entryRefLabel, setEntryRefLabel] = useState('');
  const [entryTitle, setEntryTitle] = useState('');
  const [entryBody, setEntryBody] = useState('');

  // Inline edit entry state
  const [isEditingEntry, setIsEditingEntry] = useState(false);
  const [editRefLabel, setEditRefLabel] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');

  const currentSeries = series.find((s) => s.slug === slug);

  const entries = useMemo(() => {
    if (!currentSeries?.entries) return [];
    return [...currentSeries.entries].sort(
      (a, b) => a.entry_number - b.entry_number || a.id - b.id
    );
  }, [currentSeries]);

  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const q = searchQuery.toLowerCase();
    return entries.filter(
      (e) =>
        e.title.toLowerCase().includes(q) ||
        (e.reference_label || '').toLowerCase().includes(q) ||
        e.body.toLowerCase().includes(q)
    );
  }, [entries, searchQuery]);

  if (!currentSeries) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <BookMarked className="w-10 h-10 text-burgundy dark:text-gold mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-ink dark:text-slateDark-text">
          Série / Caderno não encontrado
        </h2>
        <Link
          to="/series"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar às Séries &amp; Cadernos</span>
        </Link>
      </div>
    );
  }

  const isSeriesOwner =
    isAuthenticated &&
    currentUser.id === (currentSeries.author?.id || currentSeries.author_id);
  const canPublishInSeries =
    permissions.can_moderate_queue || (isSeriesOwner && permissions.can_manage_series);
  const canDeleteSeries = permissions.can_moderate_queue || isSeriesOwner;

  const linkedWork = currentSeries.work_id
    ? works.find((w) => w.id === currentSeries.work_id) || currentSeries.work
    : null;

  const activeEntryIndex = entrySlug
    ? entries.findIndex((e) => e.slug === entrySlug)
    : -1;
  const activeEntry = activeEntryIndex >= 0 ? entries[activeEntryIndex] : null;
  const prevEntry = activeEntryIndex > 0 ? entries[activeEntryIndex - 1] : null;
  const nextEntry =
    activeEntryIndex >= 0 && activeEntryIndex < entries.length - 1
      ? entries[activeEntryIndex + 1]
      : null;

  const nextNumber =
    entries.length > 0 ? Math.max(...entries.map((e) => e.entry_number)) + 1 : 1;

  const handlePublishEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!entryTitle.trim() || !entryBody.trim()) {
      showToast(
        'Campos obrigatórios',
        'Preencha o título e o texto da nota antes de publicar.',
        'warning'
      );
      return;
    }

    setIsPublishingEntry(true);
    try {
      const created = await createSeriesEntry(currentSeries.id, {
        title: entryTitle.trim(),
        reference_label:
          entryRefLabel.trim() || `Nota #${String(nextNumber).padStart(2, '0')}`,
        entry_number: nextNumber,
        body: entryBody.trim(),
      });
      setEntryTitle('');
      setEntryRefLabel('');
      setEntryBody('');
      setShowNewEntryForm(false);
      navigate(`/series/${currentSeries.slug}/${created.slug}`);
    } catch (err: any) {
      showToast('Erro ao publicar nota', err?.message || 'Tente novamente.', 'error');
    } finally {
      setIsPublishingEntry(false);
    }
  };

  const startEditingActiveEntry = () => {
    if (!activeEntry) return;
    setEditRefLabel(activeEntry.reference_label || '');
    setEditTitle(activeEntry.title);
    setEditBody(activeEntry.body);
    setIsEditingEntry(true);
  };

  const handleSaveEntryEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeEntry || !editTitle.trim() || !editBody.trim()) return;
    await updateSeriesEntry(currentSeries.id, activeEntry.id, {
      title: editTitle.trim(),
      reference_label: editRefLabel.trim() || activeEntry.reference_label,
      body: editBody.trim(),
    });
    setIsEditingEntry(false);
  };

  // =========================================================================
  // MODO LEITURA DE UMA NOTA ESPECÍFICA (/series/:slug/:entrySlug)
  // =========================================================================
  if (entrySlug && activeEntry) {
    const metrics = getReadingMetrics(activeEntry.body);
    const alreadyLiked = hasUserUpvoted('SERIES_ENTRY', activeEntry.id);
    const canEditOrDeleteEntry =
      permissions.can_moderate_queue ||
      (isAuthenticated &&
        currentUser.id === (activeEntry.author?.id || activeEntry.author_id));

    return (
      <div className="max-w-4xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-9 space-y-6 sm:space-y-8">
        {/* Top Breadcrumb */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted dark:text-slateDark-muted">
          <Link
            to={`/series/${currentSeries.slug}`}
            className="inline-flex items-center gap-1.5 font-semibold text-burgundy dark:text-gold hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Índice: {currentSeries.title}</span>
          </Link>

          <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-parchment-warm dark:bg-slateDark-card border border-parchment-deep dark:border-slateDark-border">
            Nota #{String(activeEntry.entry_number).padStart(2, '0')} de {entries.length}
          </span>
        </div>

        {/* Reading Card */}
        <article className="rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-card shadow-editorial overflow-hidden">
          {/* Sleek Uniform Reading Comfort Bar */}
          <div className="bg-parchment-warm dark:bg-slateDark-elevated border-b border-parchment-deep dark:border-slateDark-border px-4 sm:px-6 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5 font-medium text-ink-secondary dark:text-slateDark-text whitespace-nowrap">
              <Clock className="w-3.5 h-3.5 text-burgundy dark:text-gold" />
              {metrics.words} palavras • ~{metrics.minutes} min de leitura
            </span>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Font Family */}
              <div className="inline-flex items-center h-8 rounded-md border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-card p-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setFontFamily('serif')}
                  className={`h-full px-2.5 rounded text-xs font-serif whitespace-nowrap transition-colors ${
                    fontFamily === 'serif'
                      ? 'bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg font-bold'
                      : 'text-ink-muted hover:text-ink dark:hover:text-white'
                  }`}
                >
                  Serif
                </button>
                <button
                  type="button"
                  onClick={() => setFontFamily('sans')}
                  className={`h-full px-2.5 rounded text-xs font-sans whitespace-nowrap transition-colors ${
                    fontFamily === 'sans'
                      ? 'bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg font-bold'
                      : 'text-ink-muted hover:text-ink dark:hover:text-white'
                  }`}
                >
                  Sans
                </button>
              </div>

              {/* Font Size */}
              <div className="inline-flex items-center h-8 rounded-md border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-card p-0.5 shrink-0">
                <Type className="w-3.5 h-3.5 text-ink-muted ml-1.5 mr-1 shrink-0" />
                {(
                  [
                    { id: 'normal', label: 'A-' },
                    { id: 'large', label: 'A' },
                    { id: 'xlarge', label: 'A+' },
                  ] as const
                ).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setFontSize(s.id)}
                    className={`h-full px-2 rounded text-xs font-semibold whitespace-nowrap transition-colors ${
                      fontSize === s.id
                        ? 'bg-ink text-parchment dark:bg-gold dark:text-slateDark-bg'
                        : 'text-ink-muted hover:text-ink dark:hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Alignment */}
              <div className="inline-flex items-center h-8 rounded-md border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-card p-0.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setTextAlign('justify')}
                  title="Texto Justificado"
                  className={`h-full px-2 rounded inline-flex items-center justify-center transition-colors ${
                    textAlign === 'justify'
                      ? 'bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg'
                      : 'text-ink-muted hover:text-ink dark:hover:text-white'
                  }`}
                >
                  <AlignJustify className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setTextAlign('left')}
                  title="Alinhar à Esquerda"
                  className={`h-full px-2 rounded inline-flex items-center justify-center transition-colors ${
                    textAlign === 'left'
                      ? 'bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg'
                      : 'text-ink-muted hover:text-ink dark:hover:text-white'
                  }`}
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setTextAlign('center')}
                  title="Centralizar Texto"
                  className={`h-full px-2 rounded inline-flex items-center justify-center transition-colors ${
                    textAlign === 'center'
                      ? 'bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg'
                      : 'text-ink-muted hover:text-ink dark:hover:text-white'
                  }`}
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="px-5 sm:px-12 py-7 sm:py-12 space-y-6">
            <header className="space-y-3 border-b border-parchment-deep dark:border-slateDark-border pb-5">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2.5 py-0.5 rounded bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg font-bold uppercase tracking-wider">
                  {activeEntry.reference_label ||
                    `Nota #${String(activeEntry.entry_number).padStart(2, '0')}`}
                </span>
                {currentSeries.book_title && (
                  <span className="text-ink-secondary dark:text-slateDark-muted font-medium">
                    {currentSeries.book_title}
                  </span>
                )}
              </div>

              <h1 className="font-serif text-2xl sm:text-4xl font-bold text-ink dark:text-slateDark-text leading-tight">
                {activeEntry.title}
              </h1>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted dark:text-slateDark-muted pt-1">
                <Link
                  to={`/perfil/${activeEntry.author?.id || activeEntry.author_id}`}
                  className="font-semibold text-ink dark:text-slateDark-text hover:text-burgundy dark:hover:text-gold underline decoration-burgundy/30"
                >
                  por {activeEntry.author?.name || currentSeries.author?.name || 'Colunista'}
                </Link>
                <span className="inline-flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(activeEntry.published_at || activeEntry.created_at).toLocaleDateString(
                    'pt-BR'
                  )}
                </span>
              </div>
            </header>

            {isEditingEntry ? (
              <form onSubmit={handleSaveEntryEdit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    value={editRefLabel}
                    onChange={(e) => setEditRefLabel(e.target.value)}
                    placeholder="Referência (Ex: Cap. I, §1)"
                    className="px-3 py-2 rounded border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-sm"
                  />
                  <input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Título da nota"
                    className="sm:col-span-2 px-3 py-2 rounded border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-sm font-serif font-bold"
                  />
                </div>
                <textarea
                  rows={10}
                  required
                  value={editBody}
                  onChange={(e) => setEditBody(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-sm font-literary leading-relaxed"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingEntry(false)}
                    className="px-3.5 py-1.5 rounded border border-parchment-deep dark:border-slateDark-border text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1 px-4 py-1.5 rounded bg-forest text-parchment text-xs font-bold"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Salvar Alterações</span>
                  </button>
                </div>
              </form>
            ) : (
              <RichTextRenderer
                content={activeEntry.body}
                dropcap={true}
                fontSize={fontSize}
                fontFamily={fontFamily}
                textAlign={textAlign}
              />
            )}

            {/* Footer actions: Upvote, Edit, Delete */}
            <footer className="pt-6 border-t border-parchment-deep dark:border-slateDark-border flex flex-wrap items-center justify-between gap-3 text-xs">
              <button
                type="button"
                onClick={() => upvoteItem('SERIES_ENTRY', activeEntry.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md font-semibold transition-colors ${
                  alreadyLiked
                    ? 'bg-burgundy/15 text-burgundy dark:bg-gold/20 dark:text-gold border border-burgundy/30 dark:border-gold/40'
                    : 'bg-parchment-warm dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border text-ink dark:text-slateDark-text hover:border-burgundy'
                }`}
              >
                <ThumbsUp className={`w-3.5 h-3.5 ${alreadyLiked ? 'fill-current' : ''}`} />
                <span>
                  {alreadyLiked ? 'Curtido' : 'Curtir esta nota'} ({activeEntry.upvotes_count})
                </span>
              </button>

              {canEditOrDeleteEntry && !isEditingEntry && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={startEditingActiveEntry}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded border border-parchment-deep dark:border-slateDark-border text-ink-secondary hover:text-burgundy dark:hover:text-gold font-semibold"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm(`Deseja apagar a nota "${activeEntry.title}"?`)) {
                        await deleteSeriesEntry(currentSeries.id, activeEntry.id);
                        navigate(`/series/${currentSeries.slug}`);
                      }
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-red-500/10 text-red-700 dark:text-red-300 border border-red-500/30 font-semibold hover:bg-red-500/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir</span>
                  </button>
                </div>
              )}
            </footer>
          </div>
        </article>

        {/* Sequential Navigation: Previous / Next */}
        <nav className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {prevEntry ? (
            <Link
              to={`/series/${currentSeries.slug}/${prevEntry.slug}`}
              className="p-4 rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment-warm/70 dark:bg-slateDark-card hover:border-burgundy dark:hover:border-gold transition-colors space-y-1"
            >
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Anterior • {prevEntry.reference_label || `#${prevEntry.entry_number}`}</span>
              </span>
              <p className="font-serif font-bold text-base text-ink dark:text-slateDark-text line-clamp-1">
                {prevEntry.title}
              </p>
            </Link>
          ) : (
            <div />
          )}

          {nextEntry && (
            <Link
              to={`/series/${currentSeries.slug}/${nextEntry.slug}`}
              className="p-4 rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment-warm/70 dark:bg-slateDark-card hover:border-burgundy dark:hover:border-gold transition-colors space-y-1 sm:text-right"
            >
              <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-burgundy dark:text-gold sm:justify-end">
                <span>Próxima • {nextEntry.reference_label || `#${nextEntry.entry_number}`}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
              <p className="font-serif font-bold text-base text-ink dark:text-slateDark-text line-clamp-1">
                {nextEntry.title}
              </p>
            </Link>
          )}
        </nav>

        {/* Comments on this daily note */}
        <section id="comentarios-nota" className="pt-2">
          <CommentThread
            comments={activeEntry.comments || []}
            seriesEntryId={activeEntry.id}
          />
        </section>
      </div>
    );
  }

  // =========================================================================
  // MODO ÍNDICE DA SÉRIE (/series/:slug)
  // =========================================================================
  return (
    <div className="max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-9 space-y-8">
      <div className="flex items-center justify-between text-xs text-ink-muted">
        <Link
          to="/series"
          className="inline-flex items-center gap-1.5 font-semibold text-ink-secondary dark:text-slateDark-text hover:text-burgundy dark:hover:text-gold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar para Séries &amp; Cadernos</span>
        </Link>

        {canDeleteSeries && (
          <button
            type="button"
            onClick={async () => {
              if (
                window.confirm(
                  `Tem certeza que deseja excluir a série "${currentSeries.title}" e todas as suas notas?`
                )
              ) {
                await deleteSeries(currentSeries.id);
                navigate('/series');
              }
            }}
            className="inline-flex items-center gap-1 text-red-700 dark:text-red-400 hover:underline font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Excluir Série</span>
          </button>
        )}
      </div>

      {/* Series Hero Card */}
      <section className="rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment-warm/80 dark:bg-slateDark-card p-5 sm:p-8 shadow-editorial">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-4 lg:col-span-3">
            <img
              src={
                currentSeries.cover_url ||
                'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=900&q=85'
              }
              alt={currentSeries.title}
              className="w-full h-48 sm:h-56 object-cover rounded-lg border border-parchment-deep dark:border-slateDark-border shadow-md"
            />
          </div>

          <div className="md:col-span-8 lg:col-span-9 space-y-3.5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="px-2.5 py-0.5 rounded bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg font-bold uppercase tracking-wider">
                {currentSeries.cadence_label}
              </span>
              {currentSeries.category && (
                <span className="px-2.5 py-0.5 rounded bg-parchment dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border font-semibold">
                  {currentSeries.category.name}
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-ink-secondary dark:text-slateDark-muted font-medium">
                <BookOpen className="w-3.5 h-3.5 text-burgundy dark:text-gold" />
                {entries.length} {entries.length === 1 ? 'nota' : 'notas'}
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-ink dark:text-slateDark-text leading-tight">
              {currentSeries.title}
            </h1>

            {currentSeries.subtitle && (
              <p className="font-literary italic text-base sm:text-lg text-ink-secondary dark:text-slateDark-muted">
                “{currentSeries.subtitle}”
              </p>
            )}

            {currentSeries.book_title && (
              <p className="text-xs sm:text-sm font-semibold text-burgundy dark:text-gold">
                Livro de Referência: {currentSeries.book_title}
                {currentSeries.book_author ? ` — ${currentSeries.book_author}` : ''}
              </p>
            )}

            <p className="text-sm text-ink-secondary dark:text-slateDark-muted leading-relaxed">
              {currentSeries.description}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Link
                to={`/perfil/${currentSeries.author?.id || currentSeries.author_id}`}
                className="text-xs font-semibold text-ink dark:text-slateDark-text hover:text-burgundy dark:hover:text-gold underline decoration-burgundy/30"
              >
                Colunista: {currentSeries.author?.name || 'Autor'}
              </Link>

              {canPublishInSeries && (
                <button
                  type="button"
                  onClick={() => setShowNewEntryForm((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-burgundy hover:bg-burgundy-hover dark:bg-gold dark:text-slateDark-bg text-parchment text-xs sm:text-sm font-semibold shadow-sm"
                >
                  {showNewEntryForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>
                    {showNewEntryForm ? 'Fechar Editor' : 'Publicar Nova Nota / Capítulo'}
                  </span>
                </button>
              )}
            </div>

            {linkedWork && (
              <div className="pt-2 max-w-md">
                <AffiliateButton work={linkedWork} variant="compact" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Quick Daily Entry Composer */}
      {canPublishInSeries && showNewEntryForm && (
        <form
          onSubmit={handlePublishEntry}
          className="rounded-xl border-2 border-burgundy/40 dark:border-gold/40 bg-parchment dark:bg-slateDark-card p-5 sm:p-7 shadow-editorial space-y-4"
        >
          <div className="flex items-center justify-between border-b border-parchment-deep dark:border-slateDark-border pb-3">
            <h2 className="font-serif text-lg sm:text-xl font-bold text-ink dark:text-slateDark-text">
              Nova Nota na Série (#{String(nextNumber).padStart(2, '0')})
            </h2>
            <span className="text-xs text-ink-muted">Publicação rápida e direta</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted mb-1">
                Referência / Seção
              </label>
              <input
                type="text"
                value={entryRefLabel}
                onChange={(e) => setEntryRefLabel(e.target.value)}
                placeholder={`Ex: Cap. I, §${nextNumber} ou Dia ${nextNumber}`}
                className="w-full px-3 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-sm text-ink dark:text-slateDark-text"
              />
            </div>

            <div className="sm:col-span-8">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted mb-1">
                Título da Nota *
              </label>
              <input
                type="text"
                required
                value={entryTitle}
                onChange={(e) => setEntryTitle(e.target.value)}
                placeholder="Ex: Da Necessidade da Sagrada Escritura"
                className="w-full px-3 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-sm font-serif font-bold text-ink dark:text-slateDark-text"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted">
                Texto da Nota *
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setEntryBody((p) => `${p}${p ? '\n\n' : ''}## Subtítulo\n\n`)}
                  className="p-1.5 rounded bg-parchment-warm dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border"
                  title="Subtítulo"
                >
                  <Heading2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setEntryBody((p) => `${p}${p ? '\n\n' : ''}> Citação...\n\n`)}
                  className="p-1.5 rounded bg-parchment-warm dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border"
                  title="Citação"
                >
                  <Quote className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setEntryBody((p) => `${p}**negrito**`)}
                  className="p-1.5 rounded bg-parchment-warm dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border"
                  title="Negrito"
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setEntryBody((p) => `${p}*itálico*`)}
                  className="p-1.5 rounded bg-parchment-warm dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border"
                  title="Itálico"
                >
                  <Italic className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <textarea
              rows={8}
              required
              value={entryBody}
              onChange={(e) => setEntryBody(e.target.value)}
              placeholder="Escreva ou cole aqui o comentário do dia..."
              className="w-full px-3.5 py-2.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-sm sm:text-base font-literary leading-relaxed text-ink dark:text-slateDark-text"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowNewEntryForm(false)}
              className="px-4 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border text-xs font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPublishingEntry}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-md bg-burgundy hover:bg-burgundy-hover dark:bg-gold dark:text-slateDark-bg text-parchment text-xs font-bold shadow-sm disabled:opacity-60"
            >
              <Plus className="w-4 h-4" />
              <span>{isPublishingEntry ? 'Publicando...' : 'Publicar Nota na Série'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Book-style Index of Entries */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink dark:text-slateDark-text">
            Índice de Notas &amp; Capítulos ({entries.length})
          </h2>

          {entries.length > 0 && (
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar por capítulo, seção ou título..."
                className="w-full pl-9 pr-3 py-1.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-card text-xs sm:text-sm text-ink dark:text-slateDark-text"
              />
            </div>
          )}
        </div>

        {filteredEntries.length === 0 ? (
          <div className="p-10 rounded-xl border border-dashed border-parchment-deep dark:border-slateDark-border bg-parchment-warm/50 dark:bg-slateDark-card text-center space-y-2">
            <BookOpen className="w-8 h-8 text-burgundy/70 dark:text-gold/70 mx-auto" />
            <p className="font-serif text-lg font-bold text-ink dark:text-slateDark-text">
              {entries.length === 0
                ? 'Nenhuma nota publicada nesta série ainda'
                : 'Nenhuma nota encontrada para essa busca'}
            </p>
            {canPublishInSeries && entries.length === 0 && (
              <p className="text-xs sm:text-sm text-ink-secondary dark:text-slateDark-muted">
                Clique em <strong>“Publicar Nova Nota / Capítulo”</strong> acima para
                começar o caderno.
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-parchment-deep dark:divide-slateDark-border rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-card shadow-editorial overflow-hidden">
            {filteredEntries.map((entry) => {
              const metrics = getReadingMetrics(entry.body);
              return (
                <Link
                  key={entry.id}
                  to={`/series/${currentSeries.slug}/${entry.slug}`}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-parchment-warm/70 dark:hover:bg-slateDark-elevated/70 transition-colors group"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <span className="w-9 h-9 rounded-lg bg-burgundy/10 dark:bg-gold/15 text-burgundy dark:text-gold font-mono font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      #{String(entry.entry_number).padStart(2, '0')}
                    </span>
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-[11px]">
                        {entry.reference_label && (
                          <span className="px-2 py-0.5 rounded bg-parchment-warm dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border font-bold text-burgundy dark:text-gold">
                            {entry.reference_label}
                          </span>
                        )}
                        <span className="text-ink-muted dark:text-slateDark-muted">
                          {new Date(entry.published_at || entry.created_at).toLocaleDateString(
                            'pt-BR'
                          )}
                        </span>
                        <span className="text-ink-muted dark:text-slateDark-muted">
                          • ~{metrics.minutes} min
                        </span>
                      </div>
                      <h3 className="font-serif text-lg font-bold text-ink dark:text-slateDark-text group-hover:text-burgundy dark:group-hover:text-gold leading-snug">
                        {entry.title}
                      </h3>
                      <p className="text-xs text-ink-secondary dark:text-slateDark-muted line-clamp-1">
                        {entry.body.replace(/>/g, '').replace(/#/g, '')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-ink-muted dark:text-slateDark-muted shrink-0 pl-12 sm:pl-0">
                    <span className="inline-flex items-center gap-1">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      {entry.upvotes_count}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5" />
                      {entry.comments_count}
                    </span>
                    <ArrowRight className="w-4 h-4 text-burgundy dark:text-gold opacity-70 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
