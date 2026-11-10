import React, { useState } from 'react';
import {
  X,
  BookOpen,
  MessageSquarePlus,
  Flag,
  Quote,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FlagReason, MediaType } from '../types/schema';
import { useNavigate } from 'react-router-dom';

export const GlobalModals: React.FC = () => {
  const {
    categories,
    works,
    settings,
    isNewWorkModalOpen,
    setIsNewWorkModalOpen,
    isNewTopicModalOpen,
    setIsNewTopicModalOpen,
    flagModalTarget,
    setFlagModalTarget,
    createWork,
    createTopic,
    submitFlag,
  } = useApp();

  const navigate = useNavigate();

  // State for New Work Modal
  const [workTitle, setWorkTitle] = useState('');
  const [workSubtitle, setWorkSubtitle] = useState('');
  const [workCreator, setWorkCreator] = useState('');
  const [workMediaType, setWorkMediaType] = useState<MediaType>('BOOK');
  const [workYear, setWorkYear] = useState<number>(1950);
  const [workCategoryId, setWorkCategoryId] = useState<number>(1);
  const [workCoverUrl, setWorkCoverUrl] = useState(
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85'
  );
  const [workSynopsis, setWorkSynopsis] = useState('');
  const [workQuoteText, setWorkQuoteText] = useState('');
  const [workQuoteSource, setWorkQuoteSource] = useState('');
  const [workAffiliateUrl, setWorkAffiliateUrl] = useState('');
  const [workCtaLabel, setWorkCtaLabel] = useState('Adquirir na Amazon');
  const [workPriceHint, setWorkPriceHint] = useState('Edição Capa Dura');

  // State for New Topic Modal
  const [topicTitle, setTopicTitle] = useState('');
  const [topicCategoryId, setTopicCategoryId] = useState<number>(1);
  const [topicWorkId, setTopicWorkId] = useState<string>('');
  const [topicBody, setTopicBody] = useState('');
  const [topicTags, setTopicTags] = useState('Clássicos, Teologia, Leitura');

  // State for Flag Modal
  const [flagReason, setFlagReason] = useState<FlagReason>('INAPPROPRIATE_CONTENT');
  const [flagDetails, setFlagDetails] = useState('');

  const handleCreateWork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workTitle.trim() || !workCreator.trim() || !workSynopsis.trim()) return;

    const created = await createWork({
      title: workTitle,
      subtitle: workSubtitle,
      creator: workCreator,
      media_type: workMediaType,
      release_year: workYear,
      category_id: workCategoryId,
      cover_url: workCoverUrl,
      synopsis: workSynopsis,
      notable_quotes: workQuoteText.trim()
        ? [{ quote_text: workQuoteText, source_note: workQuoteSource || workTitle }]
        : [],
      affiliate_url:
        workAffiliateUrl ||
        `https://www.amazon.com.br/s?k=${encodeURIComponent(workTitle)}`,
      affiliate_cta_label: workCtaLabel,
      affiliate_price_hint: workPriceHint,
      is_featured: true,
    });

    setIsNewWorkModalOpen(false);
    setWorkTitle('');
    setWorkSubtitle('');
    setWorkCreator('');
    setWorkSynopsis('');
    setWorkQuoteText('');
    setWorkAffiliateUrl('');
    navigate(`/obras/${created.slug}`);
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTitle.trim() || !topicBody.trim()) return;

    const created = await createTopic({
      title: topicTitle,
      category_id: topicCategoryId,
      work_id: topicWorkId ? Number(topicWorkId) : null,
      body: topicBody,
      tags: topicTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });

    setIsNewTopicModalOpen(false);
    setTopicTitle('');
    setTopicBody('');
    navigate(`/topicos/${created.slug}`);
  };

  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitFlag(flagReason, flagDetails);
    setFlagDetails('');
  };

  const insertBlockquoteInTopic = () => {
    setTopicBody(
      (prev) =>
        prev +
        (prev.endsWith('\n') || !prev ? '' : '\n\n') +
        '> Insira aqui uma citação clássica ou patrística em destaque...\n\n'
    );
  };

  return (
    <>
      {/* 1. MODAL: INDICAR NOVA OBRA AO CATÁLOGO CURADO */}
      {isNewWorkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-parchment dark:bg-slateDark-card border border-parchment-deep dark:border-slateDark-border rounded-lg max-w-2xl w-full p-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-parchment-deep dark:border-slateDark-border pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-5 h-5 text-burgundy dark:text-gold" />
                <div>
                  <h2 className="font-serif text-xl font-bold text-ink dark:text-slateDark-text">
                    Indicar Obra ao Catálogo de Curadoria
                  </h2>
                  <p className="text-xs text-ink-muted dark:text-slateDark-muted">
                    Livros clássicos, teologia, cinema contemplativo, documentários ou música sacra
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewWorkModalOpen(false)}
                className="p-1.5 rounded-md text-ink-muted hover:text-ink dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWork} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted mb-1">
                    Título da Obra *
                  </label>
                  <input
                    type="text"
                    required
                    value={workTitle}
                    onChange={(e) => setWorkTitle(e.target.value)}
                    placeholder="Ex: Didascalicon: Da Arte de Ler"
                    className="w-full px-3 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text focus:outline-none focus:border-burgundy"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted mb-1">
                    Autor / Diretor / Criador *
                  </label>
                  <input
                    type="text"
                    required
                    value={workCreator}
                    onChange={(e) => setWorkCreator(e.target.value)}
                    placeholder="Ex: Hugo de São Vítor"
                    className="w-full px-3 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text focus:outline-none focus:border-burgundy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted mb-1">
                  Subtítulo Editorial
                </label>
                <input
                  type="text"
                  value={workSubtitle}
                  onChange={(e) => setWorkSubtitle(e.target.value)}
                  placeholder="Ex: Tratado Medieval sobre a Ordem e o Método das Leituras"
                  className="w-full px-3 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text focus:outline-none focus:border-burgundy"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted mb-1">
                    Categoria Temática
                  </label>
                  <select
                    value={workCategoryId}
                    onChange={(e) => setWorkCategoryId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted mb-1">
                    Tipo de Mídia
                  </label>
                  <select
                    value={workMediaType}
                    onChange={(e) => setWorkMediaType(e.target.value as MediaType)}
                    className="w-full px-3 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text"
                  >
                    <option value="BOOK">Livro Clássico / Teologia</option>
                    <option value="FILM">Cinema &amp; Sétima Arte</option>
                    <option value="DOCUMENTARY">Documentário</option>
                    <option value="ESSAY">Ensaio &amp; Pedagogia</option>
                    <option value="SACRED_ART">Música Sacra &amp; Arte</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted mb-1">
                    Ano da Obra
                  </label>
                  <input
                    type="number"
                    value={workYear}
                    onChange={(e) => setWorkYear(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted mb-1">
                  Sinopse &amp; Resenha Crítica Principal * (Suporta &gt; para citações)
                </label>
                <textarea
                  rows={4}
                  required
                  value={workSynopsis}
                  onChange={(e) => setWorkSynopsis(e.target.value)}
                  placeholder="Apresente a relevância espiritual, literária e formativa desta obra..."
                  className="w-full px-3 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text focus:outline-none focus:border-burgundy"
                />
              </div>

              <div className="p-3.5 rounded-md bg-parchment-warm dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-burgundy dark:text-gold">
                  <Quote className="w-3.5 h-3.5" />
                  <span>Citação Marcante em Destaque</span>
                </div>
                <input
                  type="text"
                  value={workQuoteText}
                  onChange={(e) => setWorkQuoteText(e.target.value)}
                  placeholder="Ex: Aprende tudo; verás depois que nada é supérfluo."
                  className="w-full px-3 py-1.5 rounded border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text text-xs"
                />
                <input
                  type="text"
                  value={workQuoteSource}
                  onChange={(e) => setWorkQuoteSource(e.target.value)}
                  placeholder="Fonte / Capítulo (Ex: Didascalicon, Livro VI, Cap. 3)"
                  className="w-full px-3 py-1.5 rounded border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text text-xs"
                />
              </div>

              {/* Affiliate Section */}
              <div className="p-3.5 rounded-md bg-forest/5 dark:bg-forest-light/10 border border-forest/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-forest dark:text-emerald-300">
                    <ShoppingBag className="w-3.5 h-3.5" />
                    Módulo de Monetização &amp; Afiliado Amazon
                  </span>
                  <span className="text-[11px] font-mono text-ink-muted dark:text-slateDark-muted">
                    Tag global automática: {settings.amazon_associate_tag}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="url"
                    value={workAffiliateUrl}
                    onChange={(e) => setWorkAffiliateUrl(e.target.value)}
                    placeholder="https://www.amazon.com.br/dp/..."
                    className="w-full px-3 py-1.5 rounded border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text text-xs"
                  />
                  <input
                    type="text"
                    value={workCtaLabel}
                    onChange={(e) => setWorkCtaLabel(e.target.value)}
                    placeholder="Texto do Botão (Ex: Adquirir na Amazon)"
                    className="w-full px-3 py-1.5 rounded border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewWorkModalOpen(false)}
                  className="px-4 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border text-xs font-medium text-ink-secondary dark:text-slateDark-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-md bg-burgundy hover:bg-burgundy-hover text-parchment text-xs font-semibold tracking-wide transition-colors"
                >
                  Submeter Obra ao Catálogo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. MODAL: NOVO TÓPICO DE DEBATE COMUNITÁRIO */}
      {isNewTopicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-parchment dark:bg-slateDark-card border border-parchment-deep dark:border-slateDark-border rounded-lg max-w-2xl w-full p-6 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-parchment-deep dark:border-slateDark-border pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <MessageSquarePlus className="w-5 h-5 text-navy dark:text-gold" />
                <div>
                  <h2 className="font-serif text-xl font-bold text-ink dark:text-slateDark-text">
                    Iniciar Novo Diálogo na Comunidade
                  </h2>
                  <p className="text-xs text-ink-muted dark:text-slateDark-muted">
                    Compartilhe reflexões, notas de leitura ou questões pedagógicas com sobriedade acadêmica
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsNewTopicModalOpen(false)}
                className="p-1.5 rounded-md text-ink-muted hover:text-ink dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTopic} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted mb-1">
                  Título do Tópico / Ensaio *
                </label>
                <input
                  type="text"
                  required
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  placeholder="Ex: A relação entre Graça e Liberdade nas Confissões de Santo Agostinho"
                  className="w-full px-3 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text focus:outline-none focus:border-navy"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted mb-1">
                    Cátedra / Categoria *
                  </label>
                  <select
                    value={topicCategoryId}
                    onChange={(e) => setTopicCategoryId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted mb-1">
                    Vincular a uma Obra do Catálogo (Opcional)
                  </label>
                  <select
                    value={topicWorkId}
                    onChange={(e) => setTopicWorkId(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text"
                  >
                    <option value="">Debate Temático Geral (Sem obra específica)</option>
                    {works.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.title} ({w.creator})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted">
                    Exposição &amp; Argumento * (Suporta Markdown)
                  </label>
                  <button
                    type="button"
                    onClick={insertBlockquoteInTopic}
                    className="inline-flex items-center gap-1 text-xs font-medium text-burgundy dark:text-gold hover:underline"
                  >
                    <Quote className="w-3 h-3" />
                    + Inserir Blockquote Clássico (&gt;)
                  </button>
                </div>
                <textarea
                  rows={6}
                  required
                  value={topicBody}
                  onChange={(e) => setTopicBody(e.target.value)}
                  placeholder="Desenvolva sua reflexão. Use '>' no início de uma linha para destacar uma citação longa em estilo editorial..."
                  className="w-full px-3 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text font-sans focus:outline-none focus:border-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted mb-1">
                  Tags Temáticas (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={topicTags}
                  onChange={(e) => setTopicTags(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewTopicModalOpen(false)}
                  className="px-4 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border text-xs font-medium text-ink-secondary dark:text-slateDark-muted"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-md bg-navy hover:bg-navy-hover dark:bg-gold dark:text-slateDark-bg text-parchment text-xs font-semibold tracking-wide transition-colors"
                >
                  Publicar Tópico no Fórum
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. MODAL: SINALIZAR CONTEÚDO PARA A FILA DE MODERAÇÃO */}
      {flagModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-parchment dark:bg-slateDark-card border border-parchment-deep dark:border-slateDark-border rounded-lg max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-parchment-deep dark:border-slateDark-border pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-burgundy dark:text-gold" />
                <h3 className="font-serif text-lg font-bold text-ink dark:text-slateDark-text">
                  Sinalizar para o Conselho de Moderação
                </h3>
              </div>
              <button
                onClick={() => setFlagModalTarget(null)}
                className="text-ink-muted hover:text-ink dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4 p-3 rounded bg-parchment-warm dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border text-xs">
              <p className="font-semibold text-ink dark:text-slateDark-text">
                {flagModalTarget.target_title}
              </p>
              <p className="text-ink-muted dark:text-slateDark-muted mt-1 line-clamp-2 italic">
                “{flagModalTarget.target_excerpt}”
              </p>
            </div>

            <form onSubmit={handleFlagSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted mb-1">
                  Motivo da Sinalização
                </label>
                <select
                  value={flagReason}
                  onChange={(e) => setFlagReason(e.target.value as FlagReason)}
                  className="w-full px-3 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text text-xs"
                >
                  <option value="INAPPROPRIATE_CONTENT">
                    Conteúdo Impróprio / Ofensivo
                  </option>
                  <option value="GUIDELINE_VIOLATION">
                    Descumprimento das Diretrizes Editoriais / Ataque Pessoal
                  </option>
                  <option value="SPAM">Spam Comercial ou Autopromoção Indevida</option>
                  <option value="UNETHICAL_CONDUCT">
                    Conduta Antiética ou Desonestidade Intelectual
                  </option>
                  <option value="IRREVERENCE">
                    Irreverência Grave à Cosmovisão da Comunidade
                  </option>
                  <option value="BROKEN_AFFILIATE_LINK">
                    Link de Afiliado Incorreto ou Edição Inadequada
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted mb-1">
                  Justificativa para o Moderador (Opcional)
                </label>
                <textarea
                  rows={3}
                  value={flagDetails}
                  onChange={(e) => setFlagDetails(e.target.value)}
                  placeholder="Descreva brevemente por que este conteúdo requer revisão (opcional)..."
                  className="w-full px-3 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text text-xs"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFlagModalTarget(null)}
                  className="px-3.5 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md bg-burgundy hover:bg-burgundy-hover text-parchment text-xs font-semibold"
                >
                  Enviar Sinalização
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
