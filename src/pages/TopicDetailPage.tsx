import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ThumbsUp,
  Flag,
  Pin,
  BookOpen,
  Calendar,
  Clock,
  Type,
  MessageSquare,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Trash2,
  AlignJustify,
  AlignLeft,
  AlignCenter,
  Feather,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  RichTextRenderer,
  getReadingMetrics,
} from '../components/RichTextRenderer';
import { CommentThread } from '../components/CommentThread';
import { AffiliateButton } from '../components/AffiliateButton';

export const TopicDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const {
    topics,
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
    moderateTopicStatus,
    deleteContent,
    deleteByModerator,
    upvoteItem,
    hasUserUpvoted,
    setFlagModalTarget,
    showToast,
  } = useApp();

  const [showDeleteBox, setShowDeleteBox] = useState(false);
  const [deleteReason, setDeleteReason] = useState(
    'Ensaio excluído pela Moderação após revisão.'
  );
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState('');

  const topic = topics.find((t) => t.slug === slug);
  const isAuthor =
    isAuthenticated &&
    !!topic &&
    currentUser.id === (topic.author?.id || topic.author_id);

  const rawLinkedWork = topic?.work_id
    ? works.find((w) => w.id === topic.work_id) || topic.work
    : null;
  const linkedWork =
    rawLinkedWork &&
    (rawLinkedWork.status === 'APPROVED' || permissions.can_moderate_queue)
      ? rawLinkedWork
      : null;

  if (
    !topic ||
    (topic.status !== 'APPROVED' && !permissions.can_moderate_queue && !isAuthor)
  ) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <ShieldAlert className="w-10 h-10 text-burgundy dark:text-gold mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-ink dark:text-slateDark-text">
          {topic && topic.status !== 'APPROVED'
            ? 'Ensaio aguardando aprovação da moderação'
            : 'Ensaio não encontrado ou indisponível'}
        </h2>
        <p className="text-sm text-ink-secondary dark:text-slateDark-muted max-w-lg mx-auto">
          {topic && topic.status !== 'APPROVED'
            ? 'Este ensaio ainda não foi aprovado pelo Conselho Editorial e não está liberado para leitura pública.'
            : 'O ensaio solicitado não foi encontrado ou ainda não está liberado para leitura pública.'}
        </p>
        <Link
          to="/"
          className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg text-sm font-semibold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Fórum</span>
        </Link>
      </div>
    );
  }

  const metrics = getReadingMetrics(topic.body);
  const commentsCount = topic.comments?.length || 0;

  return (
    <div className="max-w-5xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-ink-muted dark:text-slateDark-muted">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 font-medium text-ink-secondary dark:text-slateDark-text hover:text-burgundy dark:hover:text-gold transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Voltar aos Ensaios &amp; Leituras</span>
        </Link>

        <span className="font-medium text-burgundy dark:text-gold self-start sm:self-auto">
          {topic.category?.name || 'Diálogos Abertos'}
        </span>
      </div>

      {/* Banner de Status de Revisão da Moderação (quando PENDING ou REJECTED) */}
      {topic.status !== 'APPROVED' && (
        <div
          className={`p-4 sm:p-5 rounded-xl border-2 space-y-4 shadow-sm ${
            topic.status === 'PENDING'
              ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 text-amber-950 dark:text-amber-200'
              : 'bg-red-50 dark:bg-red-950/50 border-red-500 text-red-950 dark:text-red-200'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1.5">
                <span className="inline-block px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-900 dark:text-amber-200">
                  {topic.status === 'PENDING'
                    ? 'Aguardando Revisão da Moderação'
                    : 'Ensaio Reprovado — Requer Ajustes'}
                </span>
                <p className="text-sm font-medium leading-relaxed">
                  {topic.status === 'PENDING'
                    ? 'Nenhum texto é publicado sem revisão. Este ensaio foi salvo com sucesso e ficará visível no feed público assim que for aprovado pela moderação.'
                    : 'Este ensaio foi reprovado pela moderação. Veja o comentário abaixo, faça os ajustes e reenvie para nova aprovação.'}
                </p>
                {topic.moderation_note && (
                  <div className="mt-2 p-3 rounded-lg bg-white/80 dark:bg-slateDark-bg/80 border border-red-400/50 text-sm text-ink dark:text-slateDark-text">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-burgundy dark:text-gold mb-1">
                      Comentário da Moderação:
                    </span>
                    <p className="whitespace-pre-line">{topic.moderation_note}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {isAuthor && (
                <Link
                  to={`/escrever?editTopic=${topic.id}`}
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
                      moderateTopicStatus(
                        topic.id,
                        'APPROVED',
                        'Ensaio revisado e aprovado pela Moderação.'
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
                      if (!rejectFeedback && topic.moderation_note) {
                        setRejectFeedback(topic.moderation_note);
                      }
                      setShowRejectBox((prev) => !prev);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-md bg-burgundy hover:bg-burgundy-hover text-parchment text-xs sm:text-sm font-semibold shadow-sm transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>
                      {topic.status === 'REJECTED'
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
                Comentário para o Autor (ele verá esta mensagem e poderá editar e reenviar o ensaio):
              </label>
              <textarea
                rows={3}
                value={rejectFeedback}
                onChange={(e) => setRejectFeedback(e.target.value)}
                placeholder="Descreva o que precisa ser ajustado para que o ensaio seja aprovado..."
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
                    await moderateTopicStatus(
                      topic.id,
                      'REJECTED',
                      rejectFeedback.trim() ||
                        'Ensaio reprovado na revisão editorial. Ajuste o texto e reenvie para nova análise.'
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

      {/* Main Essay Sheet */}
      <article className="rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-card shadow-editorial overflow-hidden">
        {/* Reading Comfort Bar */}
        <div className="bg-parchment-warm dark:bg-slateDark-elevated border-b border-parchment-deep dark:border-slateDark-border px-4 sm:px-6 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-ink-secondary dark:text-slateDark-text shrink-0">
            <span className="inline-flex items-center gap-1.5 font-medium whitespace-nowrap">
              <Clock className="w-3.5 h-3.5 text-burgundy dark:text-gold" />
              {metrics.words} palavras • ~{metrics.minutes} min de leitura
            </span>
          </div>

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
              href="#comentarios-topico"
              className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md bg-burgundy/10 dark:bg-gold/15 text-burgundy dark:text-gold font-semibold hover:opacity-90 whitespace-nowrap shrink-0"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Comentar ({commentsCount})</span>
            </a>
          </div>
        </div>

        {/* Reading Column */}
        <div className="px-4 sm:px-12 lg:px-20 py-6 sm:py-14 max-w-4xl mx-auto space-y-6 sm:space-y-8">
          <header className="space-y-3 sm:space-y-4 border-b border-parchment-deep dark:border-slateDark-border pb-5 sm:pb-6">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {topic.is_pinned && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-burgundy/10 dark:bg-gold/15 text-burgundy dark:text-gold font-semibold">
                  <Pin className="w-3 h-3" />
                  Ensaio em Destaque
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded bg-parchment-warm dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border font-medium">
                {topic.category?.name}
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-ink dark:text-slateDark-text leading-tight">
              {topic.title}
            </h1>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs sm:text-sm text-ink-muted dark:text-slateDark-muted">
              <Link
                to={`/perfil/${topic.author?.id || topic.author_id || 1}`}
                className="inline-flex items-center gap-2.5 hover:opacity-90 group"
              >
                <span className="w-8 h-8 rounded-full bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg font-serif font-bold text-sm flex items-center justify-center shrink-0">
                  {(topic.author?.name || 'A').charAt(0).toUpperCase()}
                </span>
                <span>
                  Escrito por{' '}
                  <strong className="text-ink dark:text-slateDark-text group-hover:text-burgundy dark:group-hover:text-gold underline">
                    {topic.author?.name}
                  </strong>{' '}
                  ({topic.author?.title_badge || 'Membro'})
                </span>
              </Link>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(topic.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </header>

          <RichTextRenderer
            content={topic.body}
            dropcap={true}
            fontSize={fontSize}
            fontFamily={fontFamily}
            textAlign={textAlign}
          />

          <footer className="pt-6 border-t border-parchment-deep dark:border-slateDark-border flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-1.5">
              {topic.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1 rounded bg-parchment-warm dark:bg-slateDark-elevated text-ink-muted dark:text-slateDark-muted"
                >
                  #{tag}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs">
              {(() => {
                const alreadyLiked = hasUserUpvoted('TOPIC', topic.id);
                return (
                  <button
                    onClick={() => upvoteItem('TOPIC', topic.id)}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md font-semibold transition-all shadow-sm ${
                      alreadyLiked
                        ? 'bg-forest text-parchment dark:bg-emerald-600 dark:text-white'
                        : 'bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg hover:opacity-95'
                    }`}
                  >
                    <ThumbsUp
                      className={`w-3.5 h-3.5 ${alreadyLiked ? 'fill-current' : ''}`}
                    />
                    <span>
                      {alreadyLiked ? 'Curtido' : 'Curtir este Ensaio'} (
                      {topic.upvotes_count})
                    </span>
                  </button>
                );
              })()}

              {(permissions.can_moderate_queue ||
                (isAuthenticated &&
                  currentUser.id ===
                    (topic.author?.id || topic.author_id))) && (
                <button
                  type="button"
                  onClick={() => setShowDeleteBox((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30 font-semibold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>
                    {permissions.can_moderate_queue
                      ? 'Excluir Ensaio (Mod)'
                      : 'Excluir Ensaio'}
                  </span>
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
                className="inline-flex items-center gap-1.5 text-ink-muted hover:text-burgundy dark:hover:text-gold transition-colors"
                title="Sinalizar ensaio à moderação"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Sinalizar</span>
              </button>
            </div>
          </footer>

          {showDeleteBox &&
            (permissions.can_moderate_queue ||
              (isAuthenticated &&
                currentUser.id === (topic.author?.id || topic.author_id))) && (
              <div className="p-4 rounded-lg bg-red-950/10 dark:bg-red-950/30 border border-red-600/40 space-y-3">
                <p className="text-xs font-bold text-red-800 dark:text-red-300">
                  {permissions.can_moderate_queue
                    ? 'Exclusão pela Moderação — Informe o motivo para registro obrigatório no Log de Auditoria:'
                    : 'Tem certeza de que deseja apagar permanentemente este ensaio? Esta ação não pode ser desfeita.'}
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
                        'TOPIC',
                        topic.id,
                        topic.title,
                        deleteReason || 'Excluído pelo autor.',
                        topic.author?.name
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
        </div>
      </article>

      {/* Linked Book Box (if attached to a book) */}
      {linkedWork && (
        <section className="p-6 sm:p-8 rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment-warm/70 dark:bg-slateDark-card grid grid-cols-1 md:grid-cols-12 gap-6 items-center shadow-editorial">
          <div className="md:col-span-3 flex justify-center">
            <Link to={`/obras/${linkedWork.slug}`}>
              <img
                src={linkedWork.cover_url}
                alt={linkedWork.title}
                className="w-36 h-52 object-cover rounded-lg shadow-md"
              />
            </Link>
          </div>
          <div className="md:col-span-9 space-y-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-burgundy dark:text-gold">
              <BookOpen className="w-4 h-4" />
              Livro Analisado neste Texto
            </span>
            <Link to={`/obras/${linkedWork.slug}`} className="block group">
              <h3 className="font-serif text-2xl font-bold text-ink dark:text-slateDark-text group-hover:text-burgundy dark:group-hover:text-gold">
                {linkedWork.title}
              </h3>
              <p className="text-xs sm:text-sm text-ink-muted dark:text-slateDark-muted">
                {linkedWork.creator} ({linkedWork.release_year})
              </p>
            </Link>
            <div className="max-w-md pt-1">
              <AffiliateButton work={linkedWork} variant="compact" />
            </div>
          </div>
        </section>
      )}

      {/* Comments Section */}
      <section id="comentarios-topico" className="scroll-mt-24 space-y-5">
        <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink dark:text-slateDark-text">
          Comentários dos Leitores ({commentsCount})
        </h2>
        <CommentThread
          comments={topic.comments || []}
          topicId={topic.id}
          allowRating={false}
        />
      </section>
    </div>
  );
};
