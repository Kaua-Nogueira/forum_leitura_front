import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  Feather,
  BookOpen,
  Quote,
  Heading2,
  Bold,
  Italic,
  Minus,
  Eye,
  Columns,
  Edit3,
  ShoppingBag,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  Plus,
  Trash2,
  AlertCircle,
  AlignJustify,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RichTextRenderer, getReadingMetrics } from '../components/RichTextRenderer';
import { MediaType, WorkQuote } from '../types/schema';

type PostMode = 'CONCEPT_ESSAY' | 'NEW_BOOK_ESSAY' | 'EXISTING_BOOK_ESSAY';
type ConceptPlacement = 'MAIN_FEED' | 'FORUM_COLUMN';
type EditorLayout = 'WRITE' | 'SPLIT' | 'PREVIEW';

export const WriteEssayPage: React.FC = () => {
  const {
    categories,
    works,
    topics,
    settings,
    currentUser,
    permissions,
    textAlign,
    setTextAlign,
    switchRole,
    createWork,
    updateWork,
    createTopic,
    updateTopic,
    showToast,
  } = useApp();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedWorkId = searchParams.get('obra');
  const editWorkIdParam = searchParams.get('editWork');
  const editTopicIdParam = searchParams.get('editTopic');

  const editingWork = editWorkIdParam
    ? works.find((w) => w.id === Number(editWorkIdParam))
    : undefined;
  const editingTopic = editTopicIdParam
    ? topics.find((t) => t.id === Number(editTopicIdParam))
    : undefined;
  const isEditingExisting = Boolean(editingWork || editingTopic);

  const [postMode, setPostMode] = useState<PostMode>(
    editingTopic
      ? editingTopic.work_id
        ? 'EXISTING_BOOK_ESSAY'
        : 'CONCEPT_ESSAY'
      : preselectedWorkId
      ? 'EXISTING_BOOK_ESSAY'
      : 'CONCEPT_ESSAY'
  );
  const [conceptPlacement, setConceptPlacement] =
    useState<ConceptPlacement>('MAIN_FEED');
  const [conceptTheme, setConceptTheme] = useState<string>('');
  const [editorLayout, setEditorLayout] = useState<EditorLayout>('SPLIT');
  const [writerFont, setWriterFont] = useState<'serif' | 'sans'>('serif');

  // Common Essay Fields
  const [essayTitle, setEssayTitle] = useState<string>(
    () => localStorage.getItem('veritas_draft_title') || ''
  );
  const [essaySubtitle, setEssaySubtitle] = useState<string>(
    () => localStorage.getItem('veritas_draft_subtitle') || ''
  );
  const [categoryId, setCategoryId] = useState<number>(1);
  const [essayBody, setEssayBody] = useState<string>(
    () => localStorage.getItem('veritas_draft_body') || ''
  );

  // Fields when writing about a NEW Book/Work
  const [bookAuthor, setBookAuthor] = useState<string>(
    () => localStorage.getItem('veritas_draft_author') || ''
  );
  const [mediaType, setMediaType] = useState<MediaType>('BOOK');
  const [releaseYear, setReleaseYear] = useState<number>(1950);
  const [publisher, setPublisher] = useState<string>('');
  const [coverUrl, setCoverUrl] = useState<string>(
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85'
  );
  const [affiliateUrl, setAffiliateUrl] = useState<string>('');
  const [affiliateCta] = useState<string>('Adquirir na Amazon');
  const [affiliatePriceHint] = useState<string>('Edição Recomendada');
  const [quotes, setQuotes] = useState<WorkQuote[]>([
    { quote_text: '', source_note: '' },
  ]);

  // Fields when writing about an EXISTING Book/Work
  const [selectedWorkId, setSelectedWorkId] = useState<string>(
    preselectedWorkId || String(works[0]?.id || '')
  );
  const [tagsInput, setTagsInput] = useState<string>(
    'Leitura Clássica, Resenha Crítica, Teologia'
  );

  // Validation & Error feedback state
  const [submitErrors, setSubmitErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const authorInputRef = useRef<HTMLInputElement | null>(null);

  // Populate fields when editing an existing Work or Topic
  useEffect(() => {
    if (editingWork) {
      const isConceptWork =
        editingWork.media_type === 'ESSAY' &&
        (!editingWork.creator ||
          editingWork.creator === editingWork.submitted_by?.name ||
          editingWork.creator === currentUser.name);
      setPostMode(isConceptWork ? 'CONCEPT_ESSAY' : 'NEW_BOOK_ESSAY');
      setConceptPlacement('MAIN_FEED');
      setConceptTheme(editingWork.publisher_or_studio || '');
      setEssayTitle(editingWork.title || '');
      setEssaySubtitle(editingWork.subtitle || '');
      setCategoryId(editingWork.category_id || 1);
      setEssayBody(editingWork.synopsis || '');
      setBookAuthor(editingWork.creator || '');
      setMediaType(editingWork.media_type || 'BOOK');
      setReleaseYear(editingWork.release_year || 1950);
      setPublisher(editingWork.publisher_or_studio || '');
      setCoverUrl(
        editingWork.cover_url ||
          'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85'
      );
      setAffiliateUrl(editingWork.affiliate_url || '');
      setQuotes(
        editingWork.notable_quotes?.length
          ? editingWork.notable_quotes
          : [{ quote_text: '', source_note: '' }]
      );
    } else if (editingTopic) {
      if (editingTopic.work_id) {
        setPostMode('EXISTING_BOOK_ESSAY');
      } else {
        setPostMode('CONCEPT_ESSAY');
        setConceptPlacement('FORUM_COLUMN');
        setConceptTheme((editingTopic.tags || [])[0] || '');
      }
      setEssayTitle(editingTopic.title || '');
      setEssaySubtitle(editingTopic.excerpt || '');
      setCategoryId(editingTopic.category_id || 1);
      setEssayBody(editingTopic.body || '');
      setSelectedWorkId(editingTopic.work_id ? String(editingTopic.work_id) : '');
      setTagsInput((editingTopic.tags || []).join(', '));
    }
  }, [editingWork?.id, editingTopic?.id]);

  // Auto-save draft (only when creating new content)
  useEffect(() => {
    if (isEditingExisting) return;
    localStorage.setItem('veritas_draft_title', essayTitle);
    localStorage.setItem('veritas_draft_subtitle', essaySubtitle);
    localStorage.setItem('veritas_draft_body', essayBody);
    localStorage.setItem('veritas_draft_author', bookAuthor);
  }, [essayTitle, essaySubtitle, essayBody, bookAuthor, isEditingExisting]);

  const metrics = getReadingMetrics(essayBody);

  const insertAtCursor = (prefix: string, suffix = '', placeholder = '') => {
    const el = textareaRef.current;
    if (!el) {
      setEssayBody((prev) => `${prev}${prefix}${placeholder}${suffix}`);
      return;
    }

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = essayBody.substring(start, end) || placeholder;
    const before = essayBody.substring(0, start);
    const after = essayBody.substring(end);

    const updated = `${before}${prefix}${selected}${suffix}${after}`;
    setEssayBody(updated);

    setTimeout(() => {
      el.focus();
      const newCursorPos = start + prefix.length + selected.length + suffix.length;
      el.setSelectionRange(newCursorPos, newCursorPos);
    }, 10);
  };

  const applyClassicalTemplate = () => {
    const template =
      postMode === 'CONCEPT_ESSAY'
        ? `Apresente no parágrafo de abertura o conceito, doutrina ou questão filosófica que será examinada neste artigo, situando sua relevância intelectual e espiritual.

> Insira aqui uma epígrafe, passagem bíblica ou definição clássica que sirva de alicerce para o desenvolvimento do tema.

## I. Definição e Raízes do Conceito

Explique a origem do conceito, seus termos fundamentais e como a tradição cristã ou filosófica o compreendeu ao longo da história, distinguindo-o de equívocos comuns.

* * *

## II. Desenvolvimento e Fundamentação

Aprofunde os argumentos centrais do seu ensaio. Mobilize exemplos históricos, textos confessionais ou conexões teológicas e culturais que iluminem a tese.

> Destaque aqui uma síntese ou formulação essencial para a meditação do leitor.

## III. Implicações Práticas e Conclusão

Conclua apontando como a reta compreensão deste conceito transforma nossa visão de mundo, nossa prática cristã ou nossa formação intelectual.`
        : `Escreva aqui o parágrafo de abertura contextualizando a obra, o momento histórico em que o autor a compôs e a tese central que torna este livro indispensável.

> Insira aqui uma citação marcante retirada diretamente do livro para iluminar o ponto de partida da sua reflexão.

## I. A Arquitetura da Obra e seus Temas Centrais

Desenvolva nos parágrafos seguintes os argumentos principais do livro. Analise como o autor constrói seu raciocínio, quais fontes clássicas ou bíblicas ele mobiliza e qual visão de mundo emerge de suas páginas.

* * *

## II. Diálogo Crítico e Passagens Memoráveis

Destaque os capítulos mais densos ou belos da obra. Você pode intercalar sua análise com trechos comentados:

> Outra passagem textual da obra que merece meditação demorada por parte dos leitores.

## III. Conclusão: Por que ler esta obra hoje?

Encerre sua resenha apontando o fruto espiritual, intelectual ou pedagógico que esta leitura oferece ao leitor contemporâneo e qual edição ou tradução você recomenda.`;

    if (essayBody.trim().length > 40) {
      setEssayBody((prev) => `${prev}\n\n${template}`);
    } else {
      setEssayBody(template);
    }
    showToast(
      'Estrutura Editorial Inserida',
      'Sinta-se livre para editar cada seção no seu ritmo.',
      'info'
    );
  };

  const handleAddQuote = () => {
    setQuotes((prev) => [...prev, { quote_text: '', source_note: '' }]);
  };

  const handleRemoveQuote = (idx: number) => {
    setQuotes((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleQuoteChange = (
    idx: number,
    field: 'quote_text' | 'source_note',
    val: string
  ) => {
    setQuotes((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, [field]: val } : q))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitErrors([]);

    const missing: string[] = [];

    if (!essayTitle.trim()) {
      missing.push(
        postMode === 'NEW_BOOK_ESSAY'
          ? 'Informe o Título do Livro ou da Obra.'
          : 'Informe o Título do seu Artigo ou Ensaio.'
      );
    }

    if (postMode === 'NEW_BOOK_ESSAY' && !bookAuthor.trim()) {
      missing.push('Informe o Autor / Criador do Livro ou Obra.');
    }

    if (!essayBody.trim()) {
      missing.push('O corpo do texto está vazio. Escreva seu artigo, ensaio ou resenha antes de publicar.');
    }

    if (missing.length > 0) {
      setSubmitErrors(missing);
      showToast(
        'Não foi possível publicar',
        missing.join(' '),
        'error'
      );

      if (!essayTitle.trim() && titleInputRef.current) {
        titleInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        titleInputRef.current.focus();
      } else if (postMode === 'NEW_BOOK_ESSAY' && !bookAuthor.trim() && authorInputRef.current) {
        authorInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        authorInputRef.current.focus();
      } else if (!essayBody.trim()) {
        if (editorLayout === 'PREVIEW') {
          setEditorLayout('SPLIT');
        }
        setTimeout(() => {
          textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
          textareaRef.current?.focus();
        }, 50);
      }
      return;
    }

    setIsSubmitting(true);

    try {
      if (currentUser.role === 'VISITOR') {
        await switchRole('MEMBER');
      }

      if (editingWork) {
        const validQuotes = quotes.filter((q) => q.quote_text.trim().length > 0);
        const isConceptMode = postMode === 'CONCEPT_ESSAY';
        await updateWork(editingWork.id, {
          title: essayTitle.trim(),
          subtitle:
            essaySubtitle.trim() ||
            (isConceptMode
              ? `Artigo & ensaio por ${currentUser.name}`
              : `Ensaio crítico e resenha literária por ${currentUser.name}`),
          creator: isConceptMode
            ? currentUser.name
            : bookAuthor.trim() || 'Autor Clássico',
          media_type: isConceptMode ? 'ESSAY' : mediaType,
          release_year: isConceptMode
            ? new Date().getFullYear()
            : releaseYear || 1950,
          category_id: categoryId,
          cover_url:
            coverUrl.trim() ||
            'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=900&q=85',
          synopsis: essayBody.trim(),
          notable_quotes: validQuotes.length ? validQuotes : editingWork.notable_quotes,
          publisher_or_studio: isConceptMode
            ? conceptTheme.trim() || 'Ensaio & Conceito'
            : publisher.trim() || 'Edição Recomendada',
        });
        navigate('/perfil');
      } else if (editingTopic) {
        const parsedTags = tagsInput
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
        if (postMode === 'CONCEPT_ESSAY' && conceptTheme.trim() && !parsedTags.includes(conceptTheme.trim())) {
          parsedTags.unshift(conceptTheme.trim());
        }
        await updateTopic(editingTopic.id, {
          title: essayTitle.trim(),
          excerpt:
            essaySubtitle.trim() ||
            essayBody.replace(/>/g, '').replace(/#/g, '').slice(0, 180) + '...',
          body: essayBody.trim(),
          category_id: categoryId,
          work_id:
            postMode === 'CONCEPT_ESSAY'
              ? null
              : selectedWorkId
              ? Number(selectedWorkId)
              : null,
          tags: parsedTags.length ? parsedTags : ['Ensaio Conceptual'],
        });
        navigate('/perfil');
      } else if (postMode === 'CONCEPT_ESSAY' && conceptPlacement === 'MAIN_FEED') {
        const validQuotes = quotes.filter((q) => q.quote_text.trim().length > 0);
        const createdWork = await createWork({
          title: essayTitle.trim(),
          subtitle:
            essaySubtitle.trim() ||
            (conceptTheme.trim()
              ? `Estudo e reflexão sobre ${conceptTheme.trim()}`
              : `Artigo e reflexão conceptual por ${currentUser.name}`),
          creator: currentUser.name,
          media_type: 'ESSAY',
          release_year: new Date().getFullYear(),
          category_id: categoryId,
          cover_url:
            coverUrl.trim() ||
            'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&w=900&q=85',
          synopsis: essayBody.trim(),
          notable_quotes: validQuotes,
          affiliate_url: '',
          affiliate_cta_label: affiliateCta,
          affiliate_price_hint: affiliatePriceHint,
          publisher_or_studio: conceptTheme.trim() || 'Artigo & Conceito Livre',
          is_featured: true,
        });

        localStorage.removeItem('veritas_draft_title');
        localStorage.removeItem('veritas_draft_subtitle');
        localStorage.removeItem('veritas_draft_body');
        localStorage.removeItem('veritas_draft_author');
        if (createdWork.status === 'APPROVED' || permissions.can_moderate_queue) {
          navigate(`/obras/${createdWork.slug}`);
        } else {
          navigate('/');
        }
      } else if (postMode === 'NEW_BOOK_ESSAY') {
        const validQuotes = quotes.filter((q) => q.quote_text.trim().length > 0);
        const createdWork = await createWork({
          title: essayTitle.trim(),
          subtitle:
            essaySubtitle.trim() ||
            `Ensaio crítico e resenha literária por ${currentUser.name}`,
          creator: bookAuthor.trim() || 'Autor Clássico',
          media_type: mediaType,
          release_year: releaseYear || 1950,
          category_id: categoryId,
          cover_url:
            coverUrl.trim() ||
            'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=85',
          synopsis: essayBody.trim(),
          notable_quotes: validQuotes.length
            ? validQuotes
            : [
                {
                  quote_text:
                    'A leitura de todos os bons livros é como uma conversação com as mentes mais nobres dos séculos passados.',
                  source_note: essayTitle.trim(),
                },
              ],
          affiliate_url: permissions.can_moderate_queue ? affiliateUrl.trim() : '',
          affiliate_cta_label: affiliateCta,
          affiliate_price_hint: affiliatePriceHint,
          publisher_or_studio: publisher.trim() || 'Edição Recomendada',
          is_featured: true,
        });

        localStorage.removeItem('veritas_draft_title');
        localStorage.removeItem('veritas_draft_subtitle');
        localStorage.removeItem('veritas_draft_body');
        localStorage.removeItem('veritas_draft_author');
        if (createdWork.status === 'APPROVED' || permissions.can_moderate_queue) {
          navigate(`/obras/${createdWork.slug}`);
        } else {
          navigate('/');
        }
      } else {
        const parsedTags = tagsInput
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
        if (
          postMode === 'CONCEPT_ESSAY' &&
          conceptTheme.trim() &&
          !parsedTags.includes(conceptTheme.trim())
        ) {
          parsedTags.unshift(conceptTheme.trim());
        }
        const createdTopic = await createTopic({
          title: essayTitle.trim(),
          excerpt:
            essaySubtitle.trim() ||
            essayBody.replace(/>/g, '').replace(/#/g, '').slice(0, 180) + '...',
          body: essayBody.trim(),
          category_id: categoryId,
          work_id:
            postMode === 'CONCEPT_ESSAY'
              ? null
              : selectedWorkId
              ? Number(selectedWorkId)
              : null,
          tags: parsedTags.length ? parsedTags : ['Ensaio & Conceito'],
        });

        localStorage.removeItem('veritas_draft_title');
        localStorage.removeItem('veritas_draft_subtitle');
        localStorage.removeItem('veritas_draft_body');
        localStorage.removeItem('veritas_draft_author');
        if (createdTopic.status === 'APPROVED' || permissions.can_moderate_queue) {
          navigate(`/topicos/${createdTopic.slug}`);
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      const errorMessage =
        err?.message ||
        'Ocorreu um erro inesperado ao publicar seu texto. Verifique sua conexão e tente novamente.';
      setSubmitErrors([errorMessage]);
      showToast('Erro ao publicar', errorMessage, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-parchment-deep dark:border-slateDark-border pb-5">
        <div className="space-y-1">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-burgundy dark:hover:text-gold mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Acervo &amp; Leituras</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <Feather className="w-5 h-5 sm:w-6 sm:h-6 text-burgundy dark:text-gold shrink-0" />
            <h1 className="font-serif text-xl sm:text-3xl font-bold text-ink dark:text-slateDark-text">
              {isEditingExisting
                ? 'Revisar & Reenviar Publicação'
                : 'Scriptorium — Estúdio de Escrita'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-ink-muted dark:text-slateDark-muted">
            {isEditingExisting
              ? 'Faça os ajustes solicitados pela moderação e reenvie seu texto para aprovação.'
              : 'Um ambiente amplo, silencioso e agradável para redigir textos sobre grandes livros.'}
          </p>
        </div>

        {/* Layout Mode Selector (Escrita Focada / Split / Preview) */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="inline-flex rounded-lg border border-parchment-deep dark:border-slateDark-border bg-parchment-warm dark:bg-slateDark-card p-1 text-xs">
            <button
              type="button"
              onClick={() => setEditorLayout('WRITE')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                editorLayout === 'WRITE'
                  ? 'bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg shadow-sm'
                  : 'text-ink-secondary dark:text-slateDark-muted hover:text-ink'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Escrita Focada</span>
            </button>
            <button
              type="button"
              onClick={() => setEditorLayout('SPLIT')}
              className={`hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                editorLayout === 'SPLIT'
                  ? 'bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg shadow-sm'
                  : 'text-ink-secondary dark:text-slateDark-muted hover:text-ink'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Lado a Lado</span>
            </button>
            <button
              type="button"
              onClick={() => setEditorLayout('PREVIEW')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                editorLayout === 'PREVIEW'
                  ? 'bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg shadow-sm'
                  : 'text-ink-secondary dark:text-slateDark-muted hover:text-ink'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Prévia Final</span>
            </button>
          </div>
        </div>
      </div>

      {(editingWork?.moderation_note || editingTopic?.moderation_note) && (
        <div className="p-4 sm:p-5 rounded-xl border-2 border-red-500/70 bg-red-50 dark:bg-red-950/40 text-red-950 dark:text-red-200 space-y-1.5 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-burgundy dark:text-gold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Comentário da Moderação — Ajustes Solicitados</span>
          </div>
          <p className="text-sm leading-relaxed whitespace-pre-line">
            {editingWork?.moderation_note || editingTopic?.moderation_note}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        {/* 1. Escolha do Tipo de Publicação e Dados do Livro */}
        <div className="p-6 rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment-warm dark:bg-slateDark-card shadow-editorial space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-parchment-deep dark:border-slateDark-border pb-4">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setPostMode('CONCEPT_ESSAY');
                  setSubmitErrors([]);
                }}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold border transition-all ${
                  postMode === 'CONCEPT_ESSAY'
                    ? 'bg-burgundy text-parchment border-burgundy dark:bg-gold dark:text-slateDark-bg dark:border-gold shadow-sm'
                    : 'bg-parchment dark:bg-slateDark-elevated text-ink dark:text-slateDark-text border-parchment-deep dark:border-slateDark-border'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Artigo, Ensaio ou Conceito Livre (Sem Livro)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPostMode('NEW_BOOK_ESSAY');
                  setSubmitErrors([]);
                }}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold border transition-all ${
                  postMode === 'NEW_BOOK_ESSAY'
                    ? 'bg-forest text-parchment border-forest dark:bg-gold dark:text-slateDark-bg dark:border-gold shadow-sm'
                    : 'bg-parchment dark:bg-slateDark-elevated text-ink dark:text-slateDark-text border-parchment-deep dark:border-slateDark-border'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Resenha de Livro ou Obra</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPostMode('EXISTING_BOOK_ESSAY');
                  setSubmitErrors([]);
                }}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs sm:text-sm font-semibold border transition-all ${
                  postMode === 'EXISTING_BOOK_ESSAY'
                    ? 'bg-navy text-parchment border-navy dark:bg-gold dark:text-slateDark-bg dark:border-gold shadow-sm'
                    : 'bg-parchment dark:bg-slateDark-elevated text-ink dark:text-slateDark-text border-parchment-deep dark:border-slateDark-border'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Ensaio sobre Livro já Cadastrado</span>
              </button>
            </div>

            <div className="flex items-center gap-3 text-sm text-ink dark:text-slateDark-text font-medium">
              <span>Cátedra Temática:</span>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="px-3.5 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text font-semibold"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Metadata Inputs according to PostMode */}
          {postMode === 'CONCEPT_ESSAY' ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink dark:text-slateDark-text mb-1.5">
                    Conceito, Doutrina ou Tema Central (Opcional)
                  </label>
                  <input
                    type="text"
                    value={conceptTheme}
                    onChange={(e) => setConceptTheme(e.target.value)}
                    placeholder="Ex: Graça Comum, Livre-Arbítrio, Trivium, Lei Moral, Estética..."
                    className="w-full px-3.5 py-2.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text text-sm focus:outline-none focus:border-burgundy"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink dark:text-slateDark-text mb-1.5">
                    Onde Exibir esta Publicação
                  </label>
                  <select
                    value={conceptPlacement}
                    onChange={(e) =>
                      setConceptPlacement(e.target.value as ConceptPlacement)
                    }
                    disabled={isEditingExisting}
                    className="w-full px-3.5 py-2.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text text-sm font-medium disabled:opacity-60"
                  >
                    <option value="MAIN_FEED">
                      Feed Principal (Artigo em Destaque com Leitura Completa)
                    </option>
                    <option value="FORUM_COLUMN">
                      Coluna de Debates &amp; Ensaios Abertos
                    </option>
                  </select>
                </div>

                {conceptPlacement === 'MAIN_FEED' ? (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink dark:text-slateDark-text mb-1.5">
                      Imagem / Ilustração do Artigo (Opcional)
                    </label>
                    <input
                      type="text"
                      value={coverUrl}
                      onChange={(e) => setCoverUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text text-sm"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-ink dark:text-slateDark-text mb-1.5">
                      Tags / Palavras-chave (separadas por vírgula)
                    </label>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="Ex: Teologia, Filosofia, Conceito, Doutrina"
                      className="w-full px-3.5 py-2.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text text-sm"
                    />
                  </div>
                )}
              </div>

              {conceptPlacement === 'MAIN_FEED' && (
                <div className="p-4 rounded-lg bg-parchment dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-burgundy dark:text-gold flex items-center gap-1.5">
                      <Quote className="w-3.5 h-3.5" />
                      Epígrafe ou Citações de Destaque do Artigo (Opcional)
                    </span>
                    <button
                      type="button"
                      onClick={handleAddQuote}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-burgundy dark:text-gold hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Adicionar Citação
                    </button>
                  </div>

                  {quotes.map((q, idx) => (
                    <div
                      key={idx}
                      className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center"
                    >
                      <input
                        type="text"
                        value={q.quote_text}
                        onChange={(e) =>
                          handleQuoteChange(idx, 'quote_text', e.target.value)
                        }
                        placeholder="Ex: “A fé busca compreender.”"
                        className="md:col-span-8 px-3 py-2 rounded border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-xs font-literary italic text-ink dark:text-slateDark-text"
                      />
                      <input
                        type="text"
                        value={q.source_note}
                        onChange={(e) =>
                          handleQuoteChange(idx, 'source_note', e.target.value)
                        }
                        placeholder="Autor / Fonte (Ex: Santo Anselmo, Proslogion)"
                        className="md:col-span-3 px-3 py-2 rounded border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-xs text-ink dark:text-slateDark-text"
                      />
                      {quotes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuote(idx)}
                          className="md:col-span-1 p-2 text-ink-muted hover:text-burgundy flex justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : postMode === 'NEW_BOOK_ESSAY' ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink dark:text-slateDark-text mb-1.5">
                    Autor / Criador do Livro ou Obra *
                  </label>
                  <input
                    ref={authorInputRef}
                    type="text"
                    value={bookAuthor}
                    onChange={(e) => {
                      setBookAuthor(e.target.value);
                      if (submitErrors.length) setSubmitErrors([]);
                    }}
                    placeholder="Ex: Fiódor Dostoiévski, Santo Agostinho, C. S. Lewis..."
                    className={`w-full px-3.5 py-2.5 rounded-md border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text text-sm focus:outline-none ${
                      submitErrors.length > 0 && !bookAuthor.trim()
                        ? 'border-red-600 ring-2 ring-red-500/20'
                        : 'border-parchment-deep dark:border-slateDark-border focus:border-burgundy'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink dark:text-slateDark-text mb-1.5">
                    Mídia
                  </label>
                  <select
                    value={mediaType}
                    onChange={(e) => setMediaType(e.target.value as MediaType)}
                    className="w-full px-3.5 py-2.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text text-sm"
                  >
                    <option value="BOOK">Livro Clássico / Teologia</option>
                    <option value="ESSAY">Ensaio &amp; Educação</option>
                    <option value="FILM">Cinema &amp; Sétima Arte</option>
                    <option value="DOCUMENTARY">Documentário</option>
                    <option value="SACRED_ART">Música Sacra &amp; Arte</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink dark:text-slateDark-text mb-1.5">
                    Ano da Obra
                  </label>
                  <input
                    type="number"
                    value={releaseYear}
                    onChange={(e) => setReleaseYear(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink dark:text-slateDark-text mb-1.5">
                    Editora / Tradução Recomendada (Opcional)
                  </label>
                  <input
                    type="text"
                    value={publisher}
                    onChange={(e) => setPublisher(e.target.value)}
                    placeholder="Ex: Editora 34 / Penguin / Ecclesiae"
                    className="w-full px-3.5 py-2.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink dark:text-slateDark-text mb-1.5">
                    URL da Capa do Livro (Imagem)
                  </label>
                  <input
                    type="text"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text text-sm"
                  />
                </div>

                {permissions.can_moderate_queue && (
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-forest dark:text-emerald-300 mb-1.5 flex items-center gap-1">
                      <ShoppingBag className="w-4 h-4" />
                      <span>Link de Afiliado Amazon (Exclusivo Moderação • Tag: {settings.amazon_associate_tag})</span>
                    </label>
                    <input
                      type="text"
                      value={affiliateUrl}
                      onChange={(e) => setAffiliateUrl(e.target.value)}
                      placeholder="https://www.amazon.com.br/dp/..."
                      className="w-full px-3.5 py-2.5 rounded-md border border-forest/40 bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text text-sm"
                    />
                  </div>
                )}
              </div>

              {/* Notable Quotes Builder */}
              <div className="p-4 rounded-lg bg-parchment dark:bg-slateDark-elevated border border-parchment-deep dark:border-slateDark-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-burgundy dark:text-gold flex items-center gap-1.5">
                    <Quote className="w-3.5 h-3.5" />
                    Citações de Destaque do Livro (Aparecem no Topo da Página da Obra)
                  </span>
                  <button
                    type="button"
                    onClick={handleAddQuote}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-burgundy dark:text-gold hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Adicionar Citação
                  </button>
                </div>

                {quotes.map((q, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center"
                  >
                    <input
                      type="text"
                      value={q.quote_text}
                      onChange={(e) =>
                        handleQuoteChange(idx, 'quote_text', e.target.value)
                      }
                      placeholder="Ex: “A beleza salvará o mundo.”"
                      className="md:col-span-8 px-3 py-2 rounded border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-xs font-literary italic text-ink dark:text-slateDark-text"
                    />
                    <input
                      type="text"
                      value={q.source_note}
                      onChange={(e) =>
                        handleQuoteChange(idx, 'source_note', e.target.value)
                      }
                      placeholder="Parte III, Cap. 5"
                      className="md:col-span-3 px-3 py-2 rounded border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-xs text-ink dark:text-slateDark-text"
                    />
                    {quotes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuote(idx)}
                        className="md:col-span-1 p-2 text-ink-muted hover:text-burgundy flex justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted mb-1.5">
                  Livro / Obra em Análise
                </label>
                <select
                  value={selectedWorkId}
                  onChange={(e) => setSelectedWorkId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-bg text-ink dark:text-slateDark-text text-sm"
                >
                  <option value="">Ensaio Livre (Sem livro específico)</option>
                  {works
                    .filter((w) => w.status === 'APPROVED')
                    .map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.title} — {w.creator} ({w.release_year})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted mb-1.5">
                  Tags do Ensaio (separadas por vírgula)
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-bg text-ink dark:text-slateDark-text text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* 2. FOLHA EDITORIAL DE ESCRITA E LEITURA (O CORAÇÃO DO SCRIPTORIUM) */}
        <div className="rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-card shadow-editorial overflow-hidden">
          {/* Formatting & Comfort Toolbar */}
          <div className="bg-parchment-warm dark:bg-slateDark-elevated border-b border-parchment-deep dark:border-slateDark-border px-3 sm:px-6 py-2.5 sm:py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 -mx-1 px-1 shrink-0">
              <button
                type="button"
                onClick={() =>
                  insertAtCursor('\n\n## ', '\n\n', 'Título da Seção')
                }
                title="Inserir Subtítulo de Seção (##)"
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded bg-parchment dark:bg-slateDark-card border border-parchment-deep dark:border-slateDark-border text-xs font-semibold text-ink dark:text-slateDark-text hover:border-burgundy dark:hover:border-gold transition-colors whitespace-nowrap shrink-0"
              >
                <Heading2 className="w-3.5 h-3.5 text-burgundy dark:text-gold" />
                <span>Subtítulo</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  insertAtCursor(
                    '\n\n> ',
                    '\n\n',
                    'Insira aqui o trecho citado do livro...'
                  )
                }
                title="Inserir Citação Longa / Blockquote (>)"
                className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded bg-parchment dark:bg-slateDark-card border border-parchment-deep dark:border-slateDark-border text-xs font-semibold text-ink dark:text-slateDark-text hover:border-burgundy dark:hover:border-gold transition-colors whitespace-nowrap shrink-0"
              >
                <Quote className="w-3.5 h-3.5 text-burgundy dark:text-gold" />
                <span>Citação (&gt;)</span>
              </button>

              <button
                type="button"
                onClick={() => insertAtCursor('**', '**', 'texto em destaque')}
                title="Negrito (**texto**)"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-parchment dark:bg-slateDark-card border border-parchment-deep dark:border-slateDark-border text-xs font-semibold text-ink dark:text-slateDark-text hover:border-burgundy shrink-0"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => insertAtCursor('*', '*', 'termo em itálico')}
                title="Itálico (*texto*)"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-parchment dark:bg-slateDark-card border border-parchment-deep dark:border-slateDark-border text-xs font-semibold text-ink dark:text-slateDark-text hover:border-burgundy shrink-0"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => insertAtCursor('\n\n* * *\n\n', '', '')}
                title="Divisor de Seção Clássico (* * *)"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-parchment dark:bg-slateDark-card border border-parchment-deep dark:border-slateDark-border text-xs font-semibold text-ink dark:text-slateDark-text hover:border-burgundy whitespace-nowrap shrink-0"
              >
                <Minus className="w-3.5 h-3.5" />
                <span>Divisor</span>
              </button>

              <button
                type="button"
                onClick={applyClassicalTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-burgundy/10 dark:bg-gold/15 border border-burgundy/25 dark:border-gold/30 text-xs font-semibold text-burgundy dark:text-gold hover:bg-burgundy hover:text-parchment transition-colors whitespace-nowrap shrink-0"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Carregar Modelo</span>
              </button>
            </div>

            {/* Font comfort switch + Text Alignment + live metrics */}
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-ink-muted dark:text-slateDark-muted self-end md:self-auto shrink-0">
              {/* Text Alignment / Justification Switch */}
              <div className="inline-flex items-center rounded border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-card p-0.5">
                <button
                  type="button"
                  onClick={() => setTextAlign('justify')}
                  title="Justificar Texto (Editorial)"
                  aria-label="Justificar Texto"
                  className={`p-1 rounded transition-colors ${
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
                  className={`p-1 rounded transition-colors ${
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
                  className={`p-1 rounded transition-colors ${
                    textAlign === 'center'
                      ? 'bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg'
                      : 'text-ink-muted hover:text-ink dark:hover:text-white'
                  }`}
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setTextAlign('right')}
                  title="Alinhar à Direita"
                  aria-label="Alinhar à Direita"
                  className={`p-1 rounded transition-colors ${
                    textAlign === 'right'
                      ? 'bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg'
                      : 'text-ink-muted hover:text-ink dark:hover:text-white'
                  }`}
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="hidden sm:flex items-center gap-1">
                <span>Fonte:</span>
                <button
                  type="button"
                  onClick={() =>
                    setWriterFont(writerFont === 'serif' ? 'sans' : 'serif')
                  }
                  className="px-2 py-0.5 rounded border border-parchment-deep dark:border-slateDark-border font-semibold text-ink dark:text-slateDark-text"
                >
                  {writerFont === 'serif' ? 'Serif Literária' : 'Sans Limpa'}
                </button>
              </div>

              <span className="inline-flex items-center gap-1 font-medium text-ink-secondary dark:text-slateDark-text">
                <Clock className="w-3.5 h-3.5 text-burgundy dark:text-gold" />
                {metrics.words} palavras • ~{metrics.minutes} min
              </span>
            </div>
          </div>

          {/* Title & Subtitle Inputs inside the Editorial Sheet */}
          <div className="px-4 sm:px-12 pt-6 sm:pt-8 pb-4 sm:pb-5 border-b border-parchment-deep dark:border-slateDark-border space-y-2 sm:space-y-3.5 max-w-5xl mx-auto">
            <input
              ref={titleInputRef}
              type="text"
              value={essayTitle}
              onChange={(e) => {
                setEssayTitle(e.target.value);
                if (submitErrors.length) setSubmitErrors([]);
              }}
              placeholder={
                postMode === 'NEW_BOOK_ESSAY'
                  ? 'Título do Livro * (Ex: Os Irmãos Karamázov)'
                  : postMode === 'CONCEPT_ESSAY'
                  ? 'Título do seu Artigo ou Ensaio Conceptual * (Ex: A Natureza da Graça Comum)'
                  : 'Título do seu Ensaio sobre o Livro *...'
              }
              className={`w-full bg-transparent font-serif text-xl sm:text-4xl font-bold text-ink dark:text-slateDark-text focus:outline-none rounded px-2 py-1 -mx-2 ${
                submitErrors.length > 0 && !essayTitle.trim()
                  ? 'border-2 border-red-600 bg-red-500/5'
                  : ''
              }`}
            />
            <input
              type="text"
              value={essaySubtitle}
              onChange={(e) => setEssaySubtitle(e.target.value)}
              placeholder="Subtítulo da sua reflexão (Opcional)"
              className="w-full bg-transparent font-literary italic text-base sm:text-2xl text-ink-secondary dark:text-slateDark-muted focus:outline-none"
            />
          </div>

          {/* Main Writing / Split / Preview Canvas */}
          <div
            className={`grid ${
              editorLayout === 'SPLIT'
                ? 'grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-parchment-deep dark:divide-slateDark-border'
                : 'grid-cols-1'
            }`}
          >
            {/* Editor Pane */}
            {editorLayout !== 'PREVIEW' && (
              <div className="p-3.5 sm:p-10 lg:p-12">
                <div className="max-w-3xl mx-auto">
                  <textarea
                    ref={textareaRef}
                    rows={18}
                    value={essayBody}
                    onChange={(e) => {
                      setEssayBody(e.target.value);
                      if (submitErrors.length) setSubmitErrors([]);
                    }}
                    placeholder={`Comece a escrever seu texto aqui com calma...\n\nDicas rápidas:\n• Deixe uma linha em branco entre os parágrafos.\n• Digite "## Título" para uma nova seção.\n• Digite "> texto" para destacar uma citação.`}
                    className={`w-full min-h-[380px] sm:min-h-[520px] bg-transparent resize-y focus:outline-none text-ink dark:text-slateDark-text leading-[1.8] sm:leading-[1.9] rounded p-2 -m-2 ${
                      writerFont === 'serif'
                        ? 'font-literary text-lg sm:text-[20px]'
                        : 'font-sans text-base sm:text-[18px]'
                    } ${
                      textAlign === 'justify'
                        ? 'text-justify text-justify-editorial'
                        : textAlign === 'center'
                        ? 'text-center'
                        : textAlign === 'right'
                        ? 'text-right'
                        : 'text-left'
                    } ${
                      submitErrors.length > 0 && !essayBody.trim()
                        ? 'border-2 border-red-600 bg-red-500/5'
                        : ''
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Live Preview Pane */}
            {editorLayout !== 'WRITE' && (
              <div className="p-6 sm:p-10 lg:p-12 bg-parchment-warm/50 dark:bg-slateDark-bg/50">
                <div className="max-w-3xl mx-auto space-y-6">
                  <div className="flex items-center justify-between border-b border-parchment-deep dark:border-slateDark-border pb-3">
                    <span className="text-xs uppercase tracking-widest font-bold text-burgundy dark:text-gold flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      Pré-visualização da Página de Leitura
                    </span>
                    <span className="text-xs font-medium text-ink-muted dark:text-slateDark-muted">
                      {metrics.paragraphs} parágrafos • {metrics.words} palavras
                    </span>
                  </div>

                  {essayTitle && (
                    <div className="space-y-1.5">
                      <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink dark:text-slateDark-text">
                        {essayTitle}
                      </h2>
                      {essaySubtitle && (
                        <p className="font-literary italic text-xl text-ink-secondary dark:text-slateDark-muted">
                          {essaySubtitle}
                        </p>
                      )}
                    </div>
                  )}

                  {essayBody.trim() ? (
                    <RichTextRenderer
                      content={essayBody}
                      dropcap={true}
                      fontSize="large"
                      fontFamily={writerFont}
                      textAlign={textAlign}
                    />
                  ) : (
                    <p className="py-16 text-center font-literary italic text-xl text-ink-muted dark:text-slateDark-muted">
                      À medida que você digitar seu texto ao lado, ele aparecerá aqui
                      diagramado como em uma revista literária clássica...
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Visible Validation / Submission Error Banner right above the Submit Button */}
          {submitErrors.length > 0 && (
            <div className="mx-4 sm:mx-6 mb-4 p-3.5 sm:p-4 rounded-lg bg-red-50 dark:bg-red-950/60 border-2 border-red-600 dark:border-red-500 text-red-900 dark:text-red-200 flex items-start gap-3 shadow-sm">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-serif font-bold text-sm sm:text-base">
                  Não foi possível publicar ainda — verifique os itens abaixo:
                </p>
                <ul className="list-disc list-inside space-y-1 font-medium text-xs sm:text-sm">
                  {submitErrors.map((err, index) => (
                    <li key={index}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Bottom Bar: Draft Status & Submit */}
          <div className="bg-parchment-warm dark:bg-slateDark-elevated border-t border-parchment-deep dark:border-slateDark-border px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-ink-secondary dark:text-slateDark-muted">
              <CheckCircle2 className="w-4 h-4 text-forest dark:text-emerald-400 shrink-0" />
              <span>
                Rascunho salvo no navegador
                {currentUser.role !== 'VISITOR' && (
                  <>
                    {' '}
                    • Publicando como{' '}
                    <strong className="text-ink dark:text-slateDark-text">
                      {currentUser.name}
                    </strong>
                  </>
                )}
              </span>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Link
                to="/"
                className="px-4 py-2.5 rounded-md border border-parchment-deep dark:border-slateDark-border text-xs sm:text-sm font-semibold text-ink dark:text-slateDark-text hover:bg-parchment text-center"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-md bg-burgundy hover:bg-burgundy-hover dark:bg-gold dark:hover:bg-gold-light text-parchment dark:text-slateDark-bg text-xs sm:text-sm md:text-base font-semibold tracking-wide shadow-sm transition-all disabled:opacity-60 text-center"
              >
                <Feather className="w-4 h-4 shrink-0" />
                <span>
                  {isSubmitting
                    ? 'Enviando para revisão...'
                    : isEditingExisting
                    ? 'Salvar Ajustes e Reenviar para Moderação'
                    : 'Enviar Texto para Revisão'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
