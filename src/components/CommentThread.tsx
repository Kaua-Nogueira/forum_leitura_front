import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  ThumbsUp,
  Flag,
  Reply,
  Star,
  Quote,
  Send,
  CornerDownRight,
  Bold,
  Italic,
  Eye,
  Edit3,
  Trash2,
  Lock,
} from 'lucide-react';
import { Comment } from '../types/schema';
import { useApp } from '../context/AppContext';
import { RichTextRenderer } from './RichTextRenderer';

interface CommentThreadProps {
  comments: Comment[];
  workId?: number | null;
  topicId?: number | null;
  allowRating?: boolean;
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  comments,
  workId = null,
  topicId = null,
  allowRating = false,
}) => {
  const {
    currentUser,
    isAuthenticated,
    permissions,
    addComment,
    upvoteItem,
    hasUserUpvoted,
    deleteByModerator,
    setFlagModalTarget,
    showToast,
  } = useApp();

  const [newBody, setNewBody] = useState('');
  const [newRating, setNewRating] = useState<number>(5);
  const [previewComment, setPreviewComment] = useState<boolean>(false);
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyBody, setReplyBody] = useState('');
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);
  const [deleteReason, setDeleteReason] = useState('Violação das diretrizes editoriais da comunidade.');

  const handleRootSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBody.trim()) {
      showToast(
        'Comentário vazio',
        'Escreva seu comentário antes de clicar em publicar.',
        'warning'
      );
      return;
    }
    if (!isAuthenticated) {
      showToast(
        'Faça login para comentar',
        'Entre na sua conta para publicar comentários.',
        'warning'
      );
      return;
    }
    await addComment({
      body: newBody,
      rating: allowRating ? newRating : null,
      work_id: workId,
      topic_id: topicId,
      parent_id: null,
    });
    setNewBody('');
    setPreviewComment(false);
  };

  const handleReplySubmit = async (e: React.FormEvent, parentId: number) => {
    e.preventDefault();
    if (!replyBody.trim()) {
      showToast(
        'Resposta vazia',
        'Escreva sua resposta antes de publicar.',
        'warning'
      );
      return;
    }
    if (!isAuthenticated) {
      showToast(
        'Faça login para responder',
        'Entre na sua conta para responder na discussão.',
        'warning'
      );
      return;
    }
    await addComment({
      body: replyBody,
      rating: null,
      work_id: workId,
      topic_id: topicId,
      parent_id: parentId,
    });
    setReplyBody('');
    setReplyingToId(null);
  };

  const insertFormatting = (snippet: string) => {
    setNewBody((prev) => `${prev}${prev.endsWith('\n') || !prev ? '' : '\n\n'}${snippet}`);
  };

  const renderCommentNode = (comment: Comment, depth = 0) => {
    if (comment.status === 'HIDDEN' || comment.status === 'REJECTED') {
      return null;
    }

    return (
      <div
        key={comment.id}
        className={`${
          depth > 0
            ? 'mt-3.5 sm:mt-5 ml-2 sm:ml-8 pl-2.5 sm:pl-5 border-l-2 border-burgundy/25 dark:border-gold/30'
            : 'p-4 sm:p-7 rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment-warm/60 dark:bg-slateDark-card shadow-editorial'
        }`}
      >
        {/* Comment Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              to={`/perfil/${comment.author?.id || comment.author_id || 1}`}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-burgundy/15 dark:bg-gold/20 border border-burgundy/30 dark:border-gold/40 flex items-center justify-center font-serif font-bold text-xs sm:text-sm text-burgundy dark:text-gold hover:scale-105 transition-transform"
            >
              {comment.author?.name?.charAt(0) || 'L'}
            </Link>
            <div>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <Link
                  to={`/perfil/${comment.author?.id || comment.author_id || 1}`}
                  className="text-xs sm:text-sm font-bold text-ink dark:text-slateDark-text hover:text-burgundy dark:hover:text-gold underline decoration-burgundy/30"
                >
                  {comment.author?.name || 'Membro da Cátedra'}
                </Link>
                {comment.author?.title_badge && (
                  <span className="text-[11px] sm:text-xs px-2 py-0.5 rounded-full bg-parchment dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border text-ink-secondary dark:text-slateDark-muted">
                    {comment.author.title_badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] sm:text-xs text-ink-muted dark:text-slateDark-muted">
                {new Date(comment.created_at).toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {comment.rating && (
            <div className="flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-parchment dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star
                  key={idx}
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${
                    idx < comment.rating! ? 'fill-gold text-gold' : 'opacity-25'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Formatted Comment Body with pleasant reading size */}
        <RichTextRenderer
          content={comment.body}
          fontSize="normal"
          fontFamily="serif"
        />

        {/* Comment Footer Actions */}
        <div className="mt-4 pt-3 border-t border-parchment-deep/60 dark:border-slateDark-border/60 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-muted dark:text-slateDark-muted">
          <div className="flex flex-wrap items-center gap-2">
            {(() => {
              const alreadyLiked = hasUserUpvoted('COMMENT', comment.id);
              return (
                <button
                  type="button"
                  onClick={() => upvoteItem('COMMENT', comment.id)}
                  title={
                    !isAuthenticated
                      ? 'Faça login na sua conta para curtir'
                      : alreadyLiked
                      ? 'Você já curtiu este comentário (1 curtida por usuário)'
                      : 'Curtir comentário'
                  }
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded font-semibold transition-colors ${
                    alreadyLiked
                      ? 'bg-burgundy/15 text-burgundy dark:bg-gold/20 dark:text-gold border border-burgundy/30 dark:border-gold/40'
                      : 'hover:bg-burgundy/10 dark:hover:bg-gold/15 hover:text-burgundy dark:hover:text-gold'
                  }`}
                >
                  <ThumbsUp
                    className={`w-3.5 h-3.5 ${alreadyLiked ? 'fill-current' : ''}`}
                  />
                  <span>
                    {alreadyLiked ? 'Curtido' : 'Curtir'} ({comment.upvotes_count})
                  </span>
                </button>
              );
            })()}

            <button
              type="button"
              onClick={() => {
                if (!isAuthenticated) {
                  showToast(
                    'Conta necessária para comentar',
                    'Faça login ou crie uma conta para responder a comentários.',
                    'warning'
                  );
                  return;
                }
                setReplyingToId(replyingToId === comment.id ? null : comment.id);
              }}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-parchment dark:hover:bg-slateDark-elevated hover:text-ink dark:hover:text-white font-semibold transition-colors"
            >
              <Reply className="w-3.5 h-3.5" />
              <span>Responder</span>
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto sm:ml-0">
            {permissions.can_moderate_queue && (
              <button
                type="button"
                onClick={() => {
                  setDeletingCommentId(
                    deletingCommentId === comment.id ? null : comment.id
                  );
                  setDeleteReason('Violação das diretrizes editoriais da comunidade.');
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-700 dark:text-red-300 border border-red-500/30 font-semibold transition-colors"
                title="Excluir comentário (ação auditada no Log da Moderação)"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Excluir (Mod)</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                setFlagModalTarget({
                  target_type: 'COMMENT',
                  target_id: comment.id,
                  target_title: `Comentário de ${comment.author?.name || 'Membro'}`,
                  target_excerpt: comment.body.slice(0, 140),
                  target_author_name: comment.author?.name || 'Membro',
                });
              }}
              className="inline-flex items-center gap-1 text-ink-muted hover:text-burgundy dark:hover:text-gold transition-colors p-1"
              title="Sinalizar comentário impróprio à moderação"
            >
              <Flag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sinalizar</span>
            </button>
          </div>
        </div>

        {/* Moderator Deletion Box with Mandatory Log Reason */}
        {permissions.can_moderate_queue && deletingCommentId === comment.id && (
          <div className="mt-4 p-4 rounded-lg bg-red-950/10 dark:bg-red-950/30 border border-red-600/40 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-red-800 dark:text-red-300">
              <span>
                Exclusão pela Moderação (Registro Obrigatório no Log de Auditoria)
              </span>
              <button
                type="button"
                onClick={() => setDeletingCommentId(null)}
                className="underline"
              >
                Cancelar
              </button>
            </div>
            <input
              type="text"
              value={deleteReason}
              onChange={(e) => setDeleteReason(e.target.value)}
              placeholder="Informe o motivo da exclusão para o log de auditoria..."
              className="w-full px-3 py-2 rounded border border-red-500/40 bg-white dark:bg-slateDark-bg text-xs sm:text-sm text-ink dark:text-slateDark-text focus:outline-none"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={async () => {
                  await deleteByModerator(
                    'COMMENT',
                    comment.id,
                    `Comentário #${comment.id}: ${comment.body.slice(0, 80)}`,
                    deleteReason,
                    comment.author?.name || 'Membro'
                  );
                  setDeletingCommentId(null);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded bg-red-700 hover:bg-red-800 text-white text-xs font-bold shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirmar Exclusão e Registrar Log</span>
              </button>
            </div>
          </div>
        )}

        {/* Spacious Inline Reply Box */}
        {replyingToId === comment.id && (
          <form
            onSubmit={(e) => handleReplySubmit(e, comment.id)}
            className="mt-4 p-4 sm:p-5 rounded-lg bg-parchment dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border space-y-3 shadow-sm"
          >
            <div className="flex items-center justify-between text-xs text-ink-muted dark:text-slateDark-muted">
              <span className="flex items-center gap-1.5 font-semibold text-burgundy dark:text-gold">
                <CornerDownRight className="w-4 h-4" />
                Respondendo ao comentário de {comment.author?.name}
              </span>
              <button
                type="button"
                onClick={() =>
                  setReplyBody(
                    (prev) =>
                      `${prev}${prev ? '\n\n' : ''}> “Trecho citado...”\n\n`
                  )
                }
                className="text-xs text-burgundy dark:text-gold hover:underline flex items-center gap-1"
              >
                <Quote className="w-3 h-3" />
                + Citar trecho
              </button>
            </div>
            <textarea
              rows={4}
              required
              autoFocus
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder="Escreva sua resposta ou complemento ao argumento..."
              className="w-full px-4 py-3 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text text-sm sm:text-base font-literary leading-relaxed focus:outline-none focus:border-burgundy"
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setReplyingToId(null)}
                className="px-3.5 py-1.5 rounded text-xs font-medium text-ink-muted hover:text-ink"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg text-xs font-semibold shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publicar Resposta</span>
              </button>
            </div>
          </form>
        )}

        {/* Nested Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="space-y-4">
            {comment.replies.map((reply) => renderCommentNode(reply, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Spacious, Pleasant Main Comment & Review Composer */}
      <form
        onSubmit={handleRootSubmit}
        noValidate
        className="rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment-warm dark:bg-slateDark-card shadow-editorial overflow-hidden"
      >
        {/* Composer Header */}
        <div className="px-4 sm:px-6 py-3.5 bg-parchment dark:bg-slateDark-elevated border-b border-parchment-deep dark:border-slateDark-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-burgundy dark:text-gold shrink-0" />
            <div>
              <h4 className="font-serif text-base sm:text-lg font-bold text-ink dark:text-slateDark-text">
                {allowRating
                  ? 'Deixar Comentário ou Nota de Leitura sobre o Livro'
                  : 'Participar da Discussão'}
              </h4>
              <p className="text-xs text-ink-muted dark:text-slateDark-muted">
                Compartilhe suas impressões, cite passagens marcantes ou dialogue com o
                autor do texto
              </p>
            </div>
          </div>

          {allowRating && (
            <div className="flex items-center gap-2 bg-parchment-warm dark:bg-slateDark-card px-3 py-1.5 rounded-lg border border-parchment-deep dark:border-slateDark-border self-start sm:self-auto">
              <span className="text-xs font-medium text-ink-secondary dark:text-slateDark-muted">
                Avaliação:
              </span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setNewRating(star)}
                    className="focus:outline-none hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= newRating
                          ? 'fill-gold text-gold'
                          : 'text-ink-muted/35'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Formatting Toolbar for Comments */}
        <div className="px-3.5 sm:px-6 py-2 bg-parchment-warm/60 dark:bg-slateDark-card border-b border-parchment-deep/60 dark:border-slateDark-border flex items-center justify-between gap-2 text-xs overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() =>
                insertFormatting('> “Cite aqui um trecho do livro ou do texto...”\n\n')
              }
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-parchment dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border font-medium text-ink-secondary dark:text-slateDark-text hover:border-burgundy whitespace-nowrap"
            >
              <Quote className="w-3 h-3 text-burgundy dark:text-gold" />
              <span>Citar Trecho (&gt;)</span>
            </button>

            <button
              type="button"
              onClick={() => setNewBody((p) => `${p} **destaque** `)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-parchment dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border font-medium text-ink-secondary dark:text-slateDark-text hover:border-burgundy whitespace-nowrap"
            >
              <Bold className="w-3 h-3" />
              <span>Negrito</span>
            </button>

            <button
              type="button"
              onClick={() => setNewBody((p) => `${p} *itálico* `)}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-parchment dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border font-medium text-ink-secondary dark:text-slateDark-text hover:border-burgundy whitespace-nowrap"
            >
              <Italic className="w-3 h-3" />
              <span>Itálico</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setPreviewComment((prev) => !prev)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded border border-parchment-deep dark:border-slateDark-border text-ink-secondary dark:text-slateDark-muted hover:text-ink whitespace-nowrap shrink-0"
          >
            {previewComment ? (
              <>
                <Edit3 className="w-3 h-3" />
                <span>Voltar a Digitar</span>
              </>
            ) : (
              <>
                <Eye className="w-3 h-3" />
                <span>Pré-visualizar</span>
              </>
            )}
          </button>
        </div>

        {/* Spacious Writing Area */}
        <div className="p-4 sm:p-6">
          {!isAuthenticated ? (
            <div className="p-5 rounded-lg bg-parchment dark:bg-slateDark-elevated border border-burgundy/30 dark:border-gold/30 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-burgundy dark:text-gold shrink-0" />
                <div>
                  <p className="text-sm font-bold text-ink dark:text-slateDark-text">
                    Para curtir e comentar é necessário ter uma conta
                  </p>
                  <p className="text-xs text-ink-muted dark:text-slateDark-muted mt-0.5">
                    Entre na sua conta ou cadastre-se gratuitamente para publicar comentários e dar curtidas.
                  </p>
                </div>
              </div>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-burgundy hover:bg-burgundy-hover dark:bg-gold dark:hover:bg-gold-light text-parchment dark:text-slateDark-bg text-xs sm:text-sm font-semibold shadow-sm"
              >
                <span>Entrar ou Criar Conta</span>
              </Link>
            </div>
          ) : (
            <>
              {previewComment ? (
                <div className="min-h-[140px] p-4 rounded-lg bg-parchment dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border">
                  {newBody.trim() ? (
                    <RichTextRenderer
                      content={newBody}
                      fontSize="normal"
                      fontFamily="serif"
                    />
                  ) : (
                    <p className="text-sm italic text-ink-muted">
                      Nada digitado ainda para pré-visualizar...
                    </p>
                  )}
                </div>
              ) : (
                <textarea
                  rows={5}
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                  placeholder="Escreva seu comentário, reflexão ou destaque de leitura com tranquilidade... (Use '>' no início de uma linha se quiser destacar uma citação do livro)"
                  className="w-full px-4 py-3.5 rounded-lg border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text text-lg font-literary leading-[1.85] focus:outline-none focus:border-burgundy dark:focus:border-gold resize-y"
                />
              )}

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <span className="text-xs text-ink-muted dark:text-slateDark-muted">
                  Comentando como{' '}
                  <strong className="text-ink dark:text-slateDark-text">
                    {currentUser.name}
                  </strong>
                </span>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-burgundy hover:bg-burgundy-hover dark:bg-gold dark:hover:bg-gold-light text-parchment dark:text-slateDark-bg text-xs sm:text-sm font-semibold tracking-wide transition-colors shadow-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Publicar Comentário</span>
                </button>
              </div>
            </>
          )}
        </div>
      </form>

      {/* Thread List */}
      <div className="space-y-5">
        {comments.length === 0 ? (
          <div className="text-center py-10 px-4 rounded-xl border border-dashed border-parchment-deep dark:border-slateDark-border">
            <p className="font-literary italic text-lg text-ink-muted dark:text-slateDark-muted">
              Ainda não há comentários nesta leitura. Use o espaço acima para inaugurar a
              conversa sobre a obra!
            </p>
          </div>
        ) : (
          comments.map((comment) => renderCommentNode(comment, 0))
        )}
      </div>
    </div>
  );
};
