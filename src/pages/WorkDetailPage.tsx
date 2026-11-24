import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Star,
  Quote,
  Calendar,
  Building2,
  Hash,
  Flag,
  MessageSquare,
  Clock,
  Feather,
  Type,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Trash2,
  AlignJustify,
  AlignLeft,
  AlignCenter,
  ShoppingBag,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AffiliateButton } from '../components/AffiliateButton';
import {
  RichTextRenderer,
  getReadingMetrics,
} from '../components/RichTextRenderer';
import { CommentThread } from '../components/CommentThread';

export const WorkDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const {
    works,
    topics,
    settings,
    currentUser,
    isAuthenticated,
    permissions,
    fontSize,
    setFontSize,
    fontFamily,
    setFontFamily,
    textAlign,
    setTextAlign,
    moderateWorkStatus,
    updateWorkAffiliate,
    deleteContent,
    deleteByModerator,
    setFlagModalTarget,
    showToast,
  } = useApp();

  const [showDeleteBox, setShowDeleteBox] = useState(false);
  const [deleteReason, setDeleteReason] = useState(
    'Obra/resenha excluída pela Moderação após revisão.'
  );

  const work = works.find((w) => w.slug === slug);
  const [modAffiliateUrl, setModAffiliateUrl] = useState<string>(
    work?.affiliate_url || ''
  );
  const [modAffiliatePriceHint, setModAffiliatePriceHint] = useState<string>(
    work?.affiliate_price_hint || ''
  );
  const [isSavingAffiliate, setIsSavingAffiliate] = useState(false);
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState('');

  React.useEffect(() => {
    setModAffiliateUrl(work?.affiliate_url || '');
    setModAffiliatePriceHint(work?.affiliate_price_hint || '');
  }, [work?.id, work?.affiliate_url, work?.affiliate_price_hint]);

  const isAuthor =
    isAuthenticated &&
    !!work &&
    currentUser.id === (work.submitted_by?.id || work.submitted_by_id);

  const relatedTopics = topics.filter(
    (t) => t.work_id === work?.id && t.status === 'APPROVED'
  );

  if (
    !work ||
    (work.status !== 'APPROVED' && !permissions.can_moderate_queue && !isAuthor)
  ) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <ShieldAlert className="w-10 h-10 text-burgundy dark:text-gold mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-ink dark:text-slateDark-text">
          {work && work.status !== 'APPROVED'
            ? 'Texto aguardando aprovação da moderação'
            : 'Obra não localizada ou indisponível'}
        </h2>
        <p className="text-sm text-ink-secondary dark:text-slateDark-muted max-w-lg mx-auto">
          {work && work.status !== 'APPROVED'
            ? 'Este texto ainda não foi aprovado pelo Conselho Editorial e não está liberado para leitura pública.'
            : 'A obra solicitada não foi encontrada ou ainda não está liberada para leitura pública.'}
        </p>
        <Link
          to="/"
          className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Catálogo Editorial</span>
        </Link>
      </div>
    );
  }

  const metrics = getReadingMetrics(work.synopsis);
  const commentsCount = work.comments?.length || 0;

  return (
    <div className="max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-10">
      {/* Top Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-ink-muted dark:text-slateDark-muted">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 font-medium text-ink-secondary dark:text-slateDark-text hover:text-burgundy dark:hover:text-gold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Retornar às Leituras &amp; Ensaios</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to={`/escrever?obra=${work.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-burgundy/10 dark:bg-gold/15 text-burgundy dark:text-gold font-semibold hover:underline"
          >
            <Feather className="w-3.5 h-3.5" />
            <span>Escrever ensaio sobre este livro</span>
          </Link>
        </div>
      </div>

      {/* Banner de Status de Revisão da Moderação (quando PENDING ou REJECTED) */}
      {work.status !== 'APPROVED' && (
        <div
          className={`p-5 rounded-xl border-2 space-y-4 shadow-sm ${
            work.status === 'PENDING'
              ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 text-amber-950 dark:text-amber-200'
              : 'bg-red-50 dark:bg-red-950/50 border-red-500 text-red-950 dark:text-red-200'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-900 dark:text-amber-200">
                  {work.status === 'PENDING'
                    ? 'Aguardando Revisão da Moderação'
                    : 'Publicação Reprovada — Requer Ajustes'}
                </span>
                <p className="text-sm font-medium leading-relaxed">
                  {work.status === 'PENDING'
                    ? 'Nenhum texto é publicado sem revisão. Este texto foi salvo com sucesso e ficará visível no feed público assim que for aprovado pela moderação.'
                    : 'Este texto foi reprovado pela moderação. Veja o comentário abaixo, faça os ajustes e reenvie para nova aprovação.'}
                </p>
                {work.moderation_note && (
                  <div className="mt-2 p-3 rounded-lg bg-white/80 dark:bg-slateDark-bg/80 border border-red-400/50 text-sm text-ink dark:text-slateDark-text">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-burgundy dark:text-gold mb-1">
                      Comentário da Moderação:
                    </span>
                    <p className="whitespace-pre-line">{work.moderation_note}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {isAuthor && (
                <Link
                  to={`/escrever?editWork=${work.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md bg-burgundy hover:bg-burgundy-hover text-parchment dark:bg-gold dark:text-slateDark-bg text-xs sm:text-sm font-semibold shadow-sm transition-colors"
                >
                  <Feather className="w-4 h-4" />
                  <span>Editar e Reenviar</span>
                </Link>
              )}

              {permissions.can_moderate_queue && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      moderateWorkStatus(
                        work.id,
                        'APPROVED',
                        'Texto revisado e aprovado pela Moderação.',
                        {
                          affiliate_url: modAffiliateUrl.trim(),
                          affiliate_price_hint: modAffiliatePriceHint.trim() || undefined,
                        }
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-md bg-forest hover:bg-forest-hover text-parchment text-xs sm:text-sm font-semibold shadow-sm transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Aprovar &amp; Publicar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (!rejectFeedback && work.moderation_note) {
                        setRejectFeedback(work.moderation_note);
                      }
                      setShowRejectBox((prev) => !prev);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-md bg-burgundy hover:bg-burgundy-hover text-parchment text-xs sm:text-sm font-semibold shadow-sm transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>
                      {work.status === 'REJECTED'
                        ? 'Editar Feedback de Reprovação'
                        : 'Reprovar / Pedir Ajustes'}
                    </span>
                  </button>
                </>
              )}
            </div>
          </div>

          {permissions.can_moderate_queue && showRejectBox && (
            <div className="p-4 rounded-lg bg-white/80 dark:bg-slateDark-bg/80 border border-red-500/40 space-y-3">
              <label className="block text-xs font-bold text-red-800 dark:text-red-300">
                Comentário para o Autor (ele verá esta mensagem e poderá editar e reenviar o texto):
              </label>
              <textarea
                rows={3}
                value={rejectFeedback}
                onChange={(e) => setRejectFeedback(e.target.value)}
                placeholder="Descreva o que precisa ser ajustado para que o texto seja aprovado..."
                className="w-full px-3 py-2 rounded border border-red-500/40 bg-white dark:bg-slateDark-card text-sm text-ink dark:text-slateDark-text focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowRejectBox(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-ink-muted hover:text-ink"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    await moderateWorkStatus(
                      work.id,
                      'REJECTED',
                      rejectFeedback.trim() ||
                        'Reprovado na revisão editorial. Ajuste o texto e reenvie para nova análise.'
                    );
                    setShowRejectBox(false);
                    setRejectFeedback('');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded bg-burgundy hover:bg-burgundy-hover text-parchment text-xs font-bold shadow-xs"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>Confirmar Reprovação e Enviar Feedback</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 1. DOSSIÊ DA OBRA (CAPA + FICHA + COMPRA AFILIADO) */}
      <section className="rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment-warm/80 dark:bg-slateDark-card p-4 sm:p-8 shadow-editorial">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
          {/* Book Cover */}
          <div className="md:col-span-4 lg:col-span-3 flex justify-center">
            <div className="relative w-40 sm:w-56 rounded-lg overflow-hidden shadow-xl border border-parchment-deep dark:border-slateDark-border bg-ink">
              <img
                src={work.cover_url}
                alt={work.title}
                className="w-full h-56 sm:h-72 object-cover"
              />
              <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded bg-black/80 text-gold-light text-xs font-bold flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-gold text-gold" />
                <span>{work.editorial_rating.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Book Info & Affiliate Action */}
          <div className="md:col-span-8 lg:col-span-9 space-y-4 sm:space-y-5">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2.5 py-0.5 rounded bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg font-semibold uppercase tracking-wider text-[11px] sm:text-xs">
                  {work.category?.name || 'Letras & Teologia'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-parchment dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border text-ink-secondary dark:text-slateDark-muted font-medium text-[11px] sm:text-xs">
                  <Clock className="w-3 h-3 text-burgundy dark:text-gold" />
                  {metrics.words} palavras • ~{metrics.minutes} min de leitura
                </span>
              </div>

              <h1 className="font-serif text-2xl sm:text-4xl lg:text-[40px] font-bold text-ink dark:text-slateDark-text leading-tight">
                {work.title}
              </h1>

              {work.subtitle && (
                <p className="font-literary italic text-base sm:text-xl text-ink-secondary dark:text-slateDark-muted leading-snug">
                  {work.subtitle}
                </p>
              )}

              <div className="pt-1 flex flex-wrap items-center gap-x-4 sm:gap-x-5 gap-y-1.5 text-xs sm:text-sm text-ink-secondary dark:text-slateDark-muted">
                <span>
                  Autor: <strong className="text-ink dark:text-white">{work.creator}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-burgundy dark:text-gold" />
                  Ano: {work.release_year}
                </span>
                {work.publisher_or_studio && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-burgundy dark:text-gold" />
                    {work.publisher_or_studio}
                  </span>
                )}
                {work.isbn_or_ref && (
                  <span className="flex items-center gap-1 font-mono text-xs">
                    <Hash className="w-3.5 h-3.5 text-burgundy dark:text-gold" />
                    {work.isbn_or_ref}
                  </span>
                )}
              </div>
            </div>

            <div className="max-w-xl space-y-3">
              <AffiliateButton work={work} variant="compact" />

              {permissions.can_moderate_queue && (
                <div className="p-3.5 rounded-lg border border-forest/35 bg-forest/5 dark:bg-forest-light/10 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-forest dark:text-emerald-300">
                      <ShoppingBag className="w-3.5 h-3.5" />
                      Link de Afiliado Amazon (Moderação)
                    </span>
                    <span className="text-[11px] font-mono text-ink-muted dark:text-slateDark-muted">
                      tag: {settings.amazon_associate_tag}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                    <input
                      type="url"
                      value={modAffiliateUrl}
                      onChange={(e) => setModAffiliateUrl(e.target.value)}
                      placeholder="https://www.amazon.com.br/dp/..."
                      className="sm:col-span-7 px-3 py-1.5 rounded border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-xs text-ink dark:text-slateDark-text focus:outline-none focus:border-forest"
                    />
                    <input
                      type="text"
                      value={modAffiliatePriceHint}
                      onChange={(e) => setModAffiliatePriceHint(e.target.value)}
                      placeholder="Edição / Preço (opcional)"
                      className="sm:col-span-5 px-3 py-1.5 rounded border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-xs text-ink dark:text-slateDark-text focus:outline-none focus:border-forest"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      disabled={isSavingAffiliate}
                      onClick={async () => {
                        setIsSavingAffiliate(true);
                        try {
                          await updateWorkAffiliate(work.id, {
                            affiliate_url: modAffiliateUrl.trim(),
                            affiliate_price_hint: modAffiliatePriceHint.trim() || undefined,
                          });
                        } finally {
                          setIsSavingAffiliate(false);
                        }
                      }}
                      className="px-3.5 py-1.5 rounded bg-forest hover:bg-forest-hover text-parchment text-xs font-semibold shadow-xs transition-colors disabled:opacity-60"
                    >
                      {isSavingAffiliate ? 'Salvando...' : 'Salvar Link de Afiliado'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. BARRA DE CONFORTO DE LEITURA & CITAÇÕES PERENES */}
      <article className="rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-card shadow-editorial overflow-hidden">
        {/* Reading Comfort Control Bar */}
        <div className="bg-parchment-warm dark:bg-slateDark-elevated border-b border-parchment-deep dark:border-slateDark-border px-4 sm:px-6 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
          <Link
            to={`/perfil/${work.submitted_by?.id || work.submitted_by_id || 1}`}
            className="flex items-center gap-2.5 text-ink dark:text-slateDark-text font-medium hover:text-burgundy dark:hover:text-gold group min-w-0"
          >
            <span className="w-7 h-7 rounded-full bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg font-serif font-bold text-xs flex items-center justify-center shrink-0">
              {(work.submitted_by?.name || 'A').charAt(0).toUpperCase()}
            </span>
            <span className="truncate">
              Texto escrito por{' '}
              <strong className="underline decoration-burgundy/40">
                {work.submitted_by?.name || 'Prof. Augusto Vasconcelos'}
              </strong>
              {work.submitted_by?.title_badge && (
                <span className="hidden sm:inline text-ink-secondary dark:text-slateDark-muted">
                  {' '}
                  • {work.submitted_by.title_badge}
                </span>
              )}
            </span>
          </Link>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Font Family Switch */}
            <div className="inline-flex items-center h-8 rounded-md border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-card p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setFontFamily('serif')}
                title="Fonte Serif Literária"
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
                title="Fonte Sans Limpa"
                className={`h-full px-2.5 rounded text-xs font-sans whitespace-nowrap transition-colors ${
                  fontFamily === 'sans'
                    ? 'bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg font-bold'
                    : 'text-ink-muted hover:text-ink dark:hover:text-white'
                }`}
              >
                Sans
              </button>
            </div>

            {/* Font Size Switch */}
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

            {/* Text Alignment / Justification Switch */}
            <div className="inline-flex items-center h-8 rounded-md border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-card p-0.5 shrink-0">
              <button
                type="button"
                onClick={() => setTextAlign('justify')}
                title="Texto Justificado (Estilo Editorial)"
                aria-label="Texto Justificado"
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
                aria-label="Alinhar à Esquerda"
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
                aria-label="Centralizar Texto"
                className={`h-full px-2 rounded inline-flex items-center justify-center transition-colors ${
                  textAlign === 'center'
                    ? 'bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg'
                    : 'text-ink-muted hover:text-ink dark:hover:text-white'
                }`}
              >
                <AlignCenter className="w-3.5 h-3.5" />
              </button>
            </div>

            <a
              href="#comentarios"
              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md bg-burgundy/10 dark:bg-gold/15 text-burgundy dark:text-gold font-semibold hover:opacity-90 whitespace-nowrap shrink-0"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Comentários ({commentsCount})</span>
            </a>
          </div>
        </div>

        {/* Main Reading Sheet (Wide, Generous Padding, Ideal Line Width) */}
        <div className="px-4 sm:px-12 lg:px-20 py-6 sm:py-14 max-w-4xl mx-auto space-y-8 sm:space-y-10">
          {/* Notable Quotes Epigraph */}
          {work.notable_quotes && work.notable_quotes.length > 0 && (
            <div className="space-y-4 pb-4 border-b border-parchment-deep/70 dark:border-slateDark-border">
              <span className="text-[11px] font-bold uppercase tracking-widest text-burgundy dark:text-gold flex items-center gap-1.5">
                <Quote className="w-3.5 h-3.5" />
                Epígrafe &amp; Vozes da Obra
              </span>
              <div className="space-y-4">
                {work.notable_quotes.map((q, idx) => (
                  <blockquote
                    key={idx}
                    className="p-4 sm:p-6 rounded-lg bg-parchment-warm/70 dark:bg-slateDark-elevated border-l-4 border-burgundy dark:border-gold"
                  >
                    <p className="font-literary italic text-base sm:text-2xl text-ink dark:text-slateDark-text leading-relaxed">
                      “{q.quote_text}”
                    </p>
                    <footer className="mt-2.5 text-xs font-sans font-semibold uppercase tracking-wider text-burgundy dark:text-gold-light">
                      — {q.source_note}
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          )}

          {/* Full Essay Text */}
          <RichTextRenderer
            content={work.synopsis}
            dropcap={true}
            fontSize={fontSize}
            fontFamily={fontFamily}
            textAlign={textAlign}
          />

          {/* End of Essay Footer & Affiliate Callout */}
          <div className="pt-8 border-t border-parchment-deep dark:border-slateDark-border space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-ink-muted dark:text-slateDark-muted">
              <Link
                to={`/perfil/${work.submitted_by?.id || work.submitted_by_id || 1}`}
                className="inline-flex items-center gap-2 hover:text-burgundy dark:hover:text-gold"
              >
                <span>
                  Publicado por{' '}
                  <strong className="text-ink dark:text-slateDark-text underline">
                    {work.submitted_by?.name || 'Conselho Editorial'}
                  </strong>{' '}
                  — Ver todos os textos deste autor →
                </span>
              </Link>

              <div className="flex items-center gap-4">
                {(permissions.can_moderate_queue ||
                  (isAuthenticated &&
                    currentUser.id ===
                      (work.submitted_by?.id || work.submitted_by_id))) && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteBox((prev) => !prev)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>
                      {permissions.can_moderate_queue
                        ? 'Excluir Obra (Moderação)'
                        : 'Excluir Publicação'}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setFlagModalTarget({
                      target_type: 'WORK',
                      target_id: work.id,
                      target_title: work.title,
                      target_excerpt: work.synopsis.slice(0, 140),
                      target_author_name: work.submitted_by?.name || 'Curadoria',
                    });
                  }}
                  className="inline-flex items-center gap-1.5 hover:text-burgundy dark:hover:text-gold transition-colors"
                  title="Sinalizar conteúdo impróprio à moderação"
                >
                  <Flag className="w-3.5 h-3.5" />
                  <span>Sinalizar texto ou link à moderação</span>
                </button>
              </div>
            </div>

            {showDeleteBox &&
              (permissions.can_moderate_queue ||
                (isAuthenticated &&
                  currentUser.id ===
                    (work.submitted_by?.id || work.submitted_by_id))) && (
                <div className="p-4 rounded-lg bg-red-950/10 dark:bg-red-950/30 border border-red-600/40 space-y-3">
                  <p className="text-xs font-bold text-red-800 dark:text-red-300">
                    {permissions.can_moderate_queue
                      ? 'Exclusão pela Moderação — Informe o motivo para registro obrigatório no Log de Auditoria:'
                      : 'Tem certeza de que deseja apagar permanentemente esta publicação? Esta ação não pode ser desfeita.'}
                  </p>
                  {permissions.can_moderate_queue && (
                    <input
                      type="text"
                      value={deleteReason}
                      onChange={(e) => setDeleteReason(e.target.value)}
                      className="w-full px-3 py-2 rounded border border-red-500/40 bg-white dark:bg-slateDark-bg text-sm text-ink dark:text-slateDark-text"
                    />
                  )}
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDeleteBox(false)}
                      className="px-3 py-1.5 text-xs font-semibold text-ink-muted"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        await deleteContent(
                          'WORK',
                          work.id,
                          work.title,
                          deleteReason || 'Excluído pelo autor.',
                          work.submitted_by?.name || work.creator
                        );
                        navigate('/');
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Confirmar Exclusão</span>
                    </button>
                  </div>
                </div>
              )}

            <AffiliateButton work={work} variant="full" />
          </div>
        </div>
      </article>

      {/* Linked Essays / Topics about this book */}
      {relatedTopics.length > 0 && (
        <section className="p-6 sm:p-8 rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment-warm/50 dark:bg-slateDark-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-xl font-bold text-ink dark:text-slateDark-text flex items-center gap-2">
              <Feather className="w-5 h-5 text-navy dark:text-gold" />
              <span>Outros Ensaios dos Membros sobre “{work.title}”</span>
            </h3>
            <Link
              to={`/escrever?obra=${work.id}`}
              className="text-xs font-semibold text-burgundy dark:text-gold hover:underline"
            >
              + Escrever novo ensaio sobre esta obra
            </Link>
          </div>
          <div className="divide-y divide-parchment-deep/60 dark:divide-slateDark-border">
            {relatedTopics.map((t) => (
              <div
                key={t.id}
                className="py-3 flex flex-wrap items-center justify-between gap-4"
              >
                <div>
                  <Link
                    to={`/topicos/${t.slug}`}
                    className="font-serif font-bold text-base sm:text-lg text-ink dark:text-slateDark-text hover:text-burgundy dark:hover:text-gold"
                  >
                    {t.title}
                  </Link>
                  <p className="text-xs text-ink-muted dark:text-slateDark-muted mt-0.5">
                    Por {t.author?.name} • {t.comments_count} comentários
                  </p>
                </div>
                <Link
                  to={`/topicos/${t.slug}`}
                  className="text-xs font-semibold text-burgundy dark:text-gold hover:underline"
                >
                  Ler ensaio →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. SEÇÃO DE COMENTÁRIOS E NOTAS DOS LEITORES */}
      <section id="comentarios" className="scroll-mt-24 space-y-5">
        <div className="border-b border-parchment-deep dark:border-slateDark-border pb-3 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-widest font-semibold text-burgundy dark:text-gold block">
              Caderno de Leitura Compartilhado
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink dark:text-slateDark-text">
              Comentários &amp; Reflexões dos Leitores ({commentsCount})
            </h2>
          </div>
        </div>

        <CommentThread
          comments={work.comments || []}
          workId={work.id}
          allowRating={true}
        />
      </section>
    </div>
  );
};
