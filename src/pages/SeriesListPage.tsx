import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookMarked,
  Plus,
  Search,
  Calendar,
  BookOpen,
  ArrowRight,
  Layers,
  X,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SeriesListPage: React.FC = () => {
  const {
    series,
    categories,
    works,
    permissions,
    createSeries,
    showToast,
  } = useApp();

  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create Series Form state
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [bookTitle, setBookTitle] = useState('');
  const [bookAuthor, setBookAuthor] = useState('');
  const [cadenceLabel, setCadenceLabel] = useState('Publicação Diária');
  const [categoryId, setCategoryId] = useState<number>(categories[0]?.id || 1);
  const [workId, setWorkId] = useState<string>('');
  const [coverUrl, setCoverUrl] = useState(
    'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=900&q=85'
  );

  const filteredSeries = useMemo(() => {
    return series.filter((s) => {
      if (selectedCategoryId !== 'ALL' && String(s.category_id) !== selectedCategoryId) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          s.title.toLowerCase().includes(q) ||
          (s.book_title || '').toLowerCase().includes(q) ||
          (s.description || '').toLowerCase().includes(q) ||
          (s.author?.name || '').toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [series, selectedCategoryId, searchQuery]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      showToast(
        'Campos obrigatórios',
        'Informe ao menos o título e a apresentação da série.',
        'warning'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await createSeries({
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        description: description.trim(),
        book_title: bookTitle.trim() || null,
        book_author: bookAuthor.trim() || null,
        cadence_label: cadenceLabel.trim() || 'Publicação Diária',
        category_id: categoryId,
        work_id: workId ? Number(workId) : null,
        cover_url: coverUrl.trim() || null,
      });
      setTitle('');
      setSubtitle('');
      setDescription('');
      setBookTitle('');
      setBookAuthor('');
      setShowCreateForm(false);
      navigate(`/series/${created.slug}`);
    } catch (err: any) {
      showToast('Erro ao criar série', err?.message || 'Tente novamente.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      {/* Header Editorial */}
      <section className="rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment-warm/80 dark:bg-slateDark-card p-5 sm:p-8 shadow-editorial space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-burgundy dark:text-gold">
              <BookMarked className="w-3.5 h-3.5" />
              <span>Publicações Recorrentes &amp; Comentários em Sequência</span>
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-ink dark:text-slateDark-text">
              Séries &amp; Cadernos de Estudo
            </h1>
            <p className="text-sm sm:text-base text-ink-secondary dark:text-slateDark-muted leading-relaxed">
              Comentários diários, notas capítulo por capítulo e estudos contínuos
              agrupados em cadernos ordenados para leitura sequencial.
            </p>
          </div>

          {permissions.can_manage_series && (
            <button
              type="button"
              onClick={() => setShowCreateForm((prev) => !prev)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-burgundy hover:bg-burgundy-hover dark:bg-gold dark:hover:bg-gold-light text-parchment dark:text-slateDark-bg text-sm font-semibold shadow-sm transition-colors shrink-0"
            >
              {showCreateForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              <span>{showCreateForm ? 'Fechar Formulário' : 'Criar Nova Série / Caderno'}</span>
            </button>
          )}
        </div>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-parchment-deep/70 dark:border-slateDark-border">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar série, livro de referência ou colunista..."
              className="w-full pl-9 pr-3 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-bg text-sm text-ink dark:text-slateDark-text focus:outline-none focus:border-burgundy dark:focus:border-gold"
            />
          </div>

          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="px-3.5 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-bg text-sm text-ink dark:text-slateDark-text"
          >
            <option value="ALL">Todas as Cátedras</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {/* Inline Create Series Form (COLUMNIST / MODERATOR / ADMIN) */}
      {permissions.can_manage_series && showCreateForm && (
        <form
          onSubmit={handleCreateSubmit}
          className="rounded-xl border-2 border-burgundy/40 dark:border-gold/40 bg-parchment dark:bg-slateDark-card p-5 sm:p-7 shadow-editorial space-y-5"
        >
          <div className="flex items-center gap-2 border-b border-parchment-deep dark:border-slateDark-border pb-3">
            <Sparkles className="w-5 h-5 text-burgundy dark:text-gold" />
            <h2 className="font-serif text-xl font-bold text-ink dark:text-slateDark-text">
              Criar Nova Série / Caderno de Notas
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted mb-1">
                Título da Série / Caderno *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Comentários Diários à Confissão de Fé de Westminster"
                className="w-full px-3.5 py-2.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-sm text-ink dark:text-slateDark-text"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted mb-1">
                Subtítulo (Opcional)
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                placeholder="Ex: Notas breves de leitura, seção por seção"
                className="w-full px-3.5 py-2.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-sm text-ink dark:text-slateDark-text"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted mb-1">
                Periodicidade / Ritmo
              </label>
              <input
                type="text"
                value={cadenceLabel}
                onChange={(e) => setCadenceLabel(e.target.value)}
                placeholder="Ex: Publicação Diária, Semanal, Estudo Contínuo"
                className="w-full px-3.5 py-2.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-sm text-ink dark:text-slateDark-text"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted mb-1">
                Livro / Documento de Referência
              </label>
              <input
                type="text"
                value={bookTitle}
                onChange={(e) => setBookTitle(e.target.value)}
                placeholder="Ex: Confissão de Fé de Westminster (CFW)"
                className="w-full px-3.5 py-2.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-sm text-ink dark:text-slateDark-text"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted mb-1">
                Autor do Livro
              </label>
              <input
                type="text"
                value={bookAuthor}
                onChange={(e) => setBookAuthor(e.target.value)}
                placeholder="Ex: Assembleia de Westminster (1646)"
                className="w-full px-3.5 py-2.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-sm text-ink dark:text-slateDark-text"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted mb-1">
                Cátedra / Categoria *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-sm text-ink dark:text-slateDark-text"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted mb-1">
                Vincular a uma Obra do Catálogo (Opcional)
              </label>
              <select
                value={workId}
                onChange={(e) => setWorkId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-sm text-ink dark:text-slateDark-text"
              >
                <option value="">Sem vínculo direto</option>
                {works
                  .filter((w) => w.status === 'APPROVED')
                  .map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.title} — {w.creator}
                    </option>
                  ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted mb-1">
                URL da Capa (Opcional)
              </label>
              <input
                type="text"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-sm text-ink dark:text-slateDark-text"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted mb-1">
                Apresentação da Série *
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explique o objetivo desta série, o que os leitores encontrarão a cada publicação..."
                className="w-full px-3.5 py-2.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-sm text-ink dark:text-slateDark-text"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border text-xs font-semibold text-ink-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-md bg-burgundy hover:bg-burgundy-hover dark:bg-gold dark:text-slateDark-bg text-parchment text-xs font-bold shadow-sm disabled:opacity-60"
            >
              <Plus className="w-4 h-4" />
              <span>{isSubmitting ? 'Criando...' : 'Criar Série e Abrir Caderno'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Series Grid */}
      {filteredSeries.length === 0 ? (
        <div className="p-12 rounded-xl border border-dashed border-parchment-deep dark:border-slateDark-border bg-parchment-warm/50 dark:bg-slateDark-card text-center space-y-3">
          <Layers className="w-10 h-10 text-burgundy/70 dark:text-gold/70 mx-auto" />
          <h2 className="font-serif text-xl font-bold text-ink dark:text-slateDark-text">
            Nenhuma série publicada ainda
          </h2>
          <p className="text-sm text-ink-secondary dark:text-slateDark-muted max-w-md mx-auto">
            {permissions.can_manage_series
              ? 'Você tem permissão de Colunista/Moderação. Clique no botão acima para criar o primeiro caderno de comentários diários!'
              : 'Em breve nossos colunistas publicarão cadernos e comentários em série por aqui.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSeries.map((item) => {
            const entries = item.entries || [];
            const latestEntry = entries.length > 0 ? entries[entries.length - 1] : null;
            return (
              <article
                key={item.id}
                className="rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-card shadow-editorial overflow-hidden flex flex-col hover:border-burgundy/50 dark:hover:border-gold/50 transition-colors"
              >
                <Link to={`/series/${item.slug}`} className="relative h-44 block overflow-hidden bg-ink">
                  <img
                    src={
                      item.cover_url ||
                      'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=900&q=85'
                    }
                    alt={item.title}
                    className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 rounded bg-burgundy/90 text-parchment text-[10px] font-bold uppercase tracking-wider">
                      {item.cadence_label}
                    </span>
                    {item.category && (
                      <span className="px-2 py-0.5 rounded bg-black/70 text-parchment text-[10px] font-semibold">
                        {item.category.name}
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gold-light">
                      <BookOpen className="w-3.5 h-3.5" />
                      {entries.length} {entries.length === 1 ? 'nota publicada' : 'notas publicadas'}
                    </span>
                  </div>
                </Link>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <Link
                      to={`/series/${item.slug}`}
                      className="block font-serif text-xl font-bold text-ink dark:text-slateDark-text hover:text-burgundy dark:hover:text-gold leading-snug"
                    >
                      {item.title}
                    </Link>
                    {item.book_title && (
                      <p className="text-xs font-semibold text-burgundy dark:text-gold">
                        Livro: {item.book_title}
                        {item.book_author ? ` • ${item.book_author}` : ''}
                      </p>
                    )}
                    <p className="text-xs sm:text-sm text-ink-secondary dark:text-slateDark-muted line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="space-y-3 pt-3 border-t border-parchment-deep/70 dark:border-slateDark-border">
                    {latestEntry && (
                      <Link
                        to={`/series/${item.slug}/${latestEntry.slug}`}
                        className="block p-2.5 rounded-lg bg-parchment-warm/80 dark:bg-slateDark-elevated border border-parchment-deep/60 dark:border-slateDark-border hover:border-burgundy/40 text-xs"
                      >
                        <span className="text-[10px] uppercase tracking-wider font-bold text-ink-muted block">
                          Última nota • {latestEntry.reference_label || `#${latestEntry.entry_number}`}
                        </span>
                        <span className="font-serif font-bold text-sm text-ink dark:text-slateDark-text line-clamp-1">
                          {latestEntry.title}
                        </span>
                      </Link>
                    )}

                    <div className="flex items-center justify-between text-xs text-ink-muted dark:text-slateDark-muted">
                      <span className="inline-flex items-center gap-1 truncate">
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">por {item.author?.name || 'Colunista'}</span>
                      </span>
                      <Link
                        to={`/series/${item.slug}`}
                        className="inline-flex items-center gap-1 font-bold text-burgundy dark:text-gold hover:underline shrink-0"
                      >
                        <span>Abrir Caderno</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};
