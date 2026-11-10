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
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RichTextRenderer, getReadingMetrics } from '../components/RichTextRenderer';
import { MediaType, WorkQuote } from '../types/schema';

type PostMode = 'NEW_BOOK_ESSAY' | 'EXISTING_BOOK_ESSAY';
type EditorLayout = 'WRITE' | 'SPLIT' | 'PREVIEW';

export const WriteEssayPage: React.FC = () => {
  const {
    categories,
    works,
    settings,
    currentUser,
    switchRole,
    createWork,
    createTopic,
    showToast,
  } = useApp();

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedWorkId = searchParams.get('obra');

  const [postMode, setPostMode] = useState<PostMode>(
    preselectedWorkId ? 'EXISTING_BOOK_ESSAY' : 'NEW_BOOK_ESSAY'
  );
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

  // Auto-save draft
  useEffect(() => {
    localStorage.setItem('veritas_draft_title', essayTitle);
    localStorage.setItem('veritas_draft_subtitle', essaySubtitle);
    localStorage.setItem('veritas_draft_body', essayBody);
    localStorage.setItem('veritas_draft_author', bookAuthor);
  }, [essayTitle, essaySubtitle, essayBody, bookAuthor]);

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
    const template = `Escreva aqui o parágrafo de abertura contextualizando a obra, o momento histórico em que o autor a compôs e a tese central que torna este livro indispensável.

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
          : 'Informe o Título do seu Ensaio.'
      );
    }

    if (postMode === 'NEW_BOOK_ESSAY' && !bookAuthor.trim()) {
      missing.push('Informe o Autor / Criador do Livro ou Obra.');
    }

    if (!essayBody.trim()) {
      missing.push('O corpo do texto está vazio. Escreva sua resenha ou ensaio antes de publicar.');
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

      if (postMode === 'NEW_BOOK_ESSAY') {
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
          affiliate_url:
            affiliateUrl.trim() ||
            `https://www.amazon.com.br/s?k=${encodeURIComponent(essayTitle.trim())}`,
          affiliate_cta_label: affiliateCta,
          affiliate_price_hint: affiliatePriceHint,
          publisher_or_studio: publisher.trim() || 'Edição Recomendada',
          is_featured: true,
        });

        localStorage.removeItem('veritas_draft_title');
        localStorage.removeItem('veritas_draft_subtitle');
        localStorage.removeItem('veritas_draft_body');
        localStorage.removeItem('veritas_draft_author');
        navigate(`/obras/${createdWork.slug}`);
      } else {
        const createdTopic = await createTopic({
          title: essayTitle.trim(),
          excerpt:
            essaySubtitle.trim() ||
            essayBody.replace(/>/g, '').replace(/#/g, '').slice(0, 180) + '...',
          body: essayBody.trim(),
          category_id: categoryId,
          work_id: selectedWorkId ? Number(selectedWorkId) : null,
          tags: tagsInput
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean),
        });

        localStorage.removeItem('veritas_draft_title');
        localStorage.removeItem('veritas_draft_subtitle');
        localStorage.removeItem('veritas_draft_body');
        localStorage.removeItem('veritas_draft_author');
        navigate(`/topicos/${createdTopic.slug}`);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-parchment-deep dark:border-slateDark-border pb-5">
        <div className="space-y-1">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-burgundy dark:hover:text-gold mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Acervo &amp; Leituras</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <Feather className="w-6 h-6 text-burgundy dark:text-gold" />
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink dark:text-slateDark-text">
              Scriptorium — Estúdio de Escrita &amp; Resenha Literária
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-ink-muted dark:text-slateDark-muted">
            Um ambiente amplo, silencioso e agradável para redigir textos médios e longos
            sobre grandes livros.
          </p>
        </div>

        {/* Layout Mode Selector (Escrita Focada / Split / Preview) */}
        <div className="flex flex-wrap items-center gap-2">
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
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                editorLayout === 'SPLIT'
                  ? 'bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg shadow-sm'
                  : 'text-ink-secondary dark:text-slateDark-muted hover:text-ink'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Lado a Lado (Ao Vivo)</span>
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

      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        {/* 1. Escolha do Tipo de Publicação e Dados do Livro */}
        <div className="p-6 rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment-warm dark:bg-slateDark-card shadow-editorial space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-parchment-deep dark:border-slateDark-border pb-4">
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setPostMode('NEW_BOOK_ESSAY');
                  setSubmitErrors([]);
                }}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                  postMode === 'NEW_BOOK_ESSAY'
                    ? 'bg-burgundy text-parchment border-burgundy dark:bg-gold dark:text-slateDark-bg dark:border-gold shadow-sm'
                    : 'bg-parchment dark:bg-slateDark-elevated text-ink dark:text-slateDark-text border-parchment-deep dark:border-slateDark-border'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Publicar Resenha de um Novo Livro (Catálogo + Afiliado)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPostMode('EXISTING_BOOK_ESSAY');
                  setSubmitErrors([]);
                }}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                  postMode === 'EXISTING_BOOK_ESSAY'
                    ? 'bg-navy text-parchment border-navy dark:bg-gold dark:text-slateDark-bg dark:border-gold shadow-sm'
                    : 'bg-parchment dark:bg-slateDark-elevated text-ink dark:text-slateDark-text border-parchment-deep dark:border-slateDark-border'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>Escrever Ensaio sobre Obra já Cadastrada</span>
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

          {/* Book Metadata Inputs */}
          {postMode === 'NEW_BOOK_ESSAY' ? (
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

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-forest dark:text-emerald-300 mb-1.5 flex items-center gap-1">
                    <ShoppingBag className="w-4 h-4" />
                    <span>Link Amazon (Opcional • Tag: {settings.amazon_associate_tag})</span>
                  </label>
                  <input
                    type="text"
                    value={affiliateUrl}
                    onChange={(e) => setAffiliateUrl(e.target.value)}
                    placeholder="https://www.amazon.com.br/dp/... (ou automático)"
                    className="w-full px-3.5 py-2.5 rounded-md border border-forest/40 bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text text-sm"
                  />
                </div>
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
                  {works.map((w) => (
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
          <div className="bg-parchment-warm dark:bg-slateDark-elevated border-b border-parchment-deep dark:border-slateDark-border px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() =>
                  insertAtCursor('\n\n## ', '\n\n', 'Título da Seção')
                }
                title="Inserir Subtítulo de Seção (##)"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-parchment dark:bg-slateDark-card border border-parchment-deep dark:border-slateDark-border text-xs font-semibold text-ink dark:text-slateDark-text hover:border-burgundy dark:hover:border-gold transition-colors"
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
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-parchment dark:bg-slateDark-card border border-parchment-deep dark:border-slateDark-border text-xs font-semibold text-ink dark:text-slateDark-text hover:border-burgundy dark:hover:border-gold transition-colors"
              >
                <Quote className="w-3.5 h-3.5 text-burgundy dark:text-gold" />
                <span>Citar Trecho (&gt;)</span>
              </button>

              <button
                type="button"
                onClick={() => insertAtCursor('**', '**', 'texto em destaque')}
                title="Negrito (**texto**)"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-parchment dark:bg-slateDark-card border border-parchment-deep dark:border-slateDark-border text-xs font-semibold text-ink dark:text-slateDark-text hover:border-burgundy"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => insertAtCursor('*', '*', 'termo em itálico')}
                title="Itálico (*texto*)"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-parchment dark:bg-slateDark-card border border-parchment-deep dark:border-slateDark-border text-xs font-semibold text-ink dark:text-slateDark-text hover:border-burgundy"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => insertAtCursor('\n\n* * *\n\n', '', '')}
                title="Divisor de Seção Clássico (* * *)"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-parchment dark:bg-slateDark-card border border-parchment-deep dark:border-slateDark-border text-xs font-semibold text-ink dark:text-slateDark-text hover:border-burgundy"
              >
                <Minus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Divisor ✦</span>
              </button>

              <button
                type="button"
                onClick={applyClassicalTemplate}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-burgundy/10 dark:bg-gold/15 border border-burgundy/25 dark:border-gold/30 text-xs font-semibold text-burgundy dark:text-gold hover:bg-burgundy hover:text-parchment transition-colors ml-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Carregar Estrutura de Resenha</span>
              </button>
            </div>

            {/* Font comfort switch + live metrics */}
            <div className="flex items-center gap-4 text-xs text-ink-muted dark:text-slateDark-muted">
              <div className="hidden md:flex items-center gap-1">
                <span>Fonte do Editor:</span>
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
                {metrics.words} palavras • ~{metrics.minutes} min de leitura
              </span>
            </div>
          </div>

          {/* Title & Subtitle Inputs inside the Editorial Sheet */}
          <div className="px-6 sm:px-12 pt-8 pb-5 border-b border-parchment-deep dark:border-slateDark-border space-y-3.5 max-w-5xl mx-auto">
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
                  ? 'Título do Livro ou da Obra * (Ex: Os Irmãos Karamázov)'
                  : 'Título do seu Ensaio sobre o Livro *...'
              }
              className={`w-full bg-transparent font-serif text-3xl sm:text-4xl font-bold text-ink dark:text-slateDark-text focus:outline-none rounded px-2 py-1 -mx-2 ${
                submitErrors.length > 0 && !essayTitle.trim()
                  ? 'border-2 border-red-600 bg-red-500/5'
                  : ''
              }`}
            />
            <input
              type="text"
              value={essaySubtitle}
              onChange={(e) => setEssaySubtitle(e.target.value)}
              placeholder="Subtítulo da sua análise (Opcional — Ex: O problema do mal e a redenção pelo amor ativo em Dostoiévski)"
              className="w-full bg-transparent font-literary italic text-xl sm:text-2xl text-ink-secondary dark:text-slateDark-muted focus:outline-none"
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
              <div className="p-6 sm:p-10 lg:p-12">
                <div className="max-w-3xl mx-auto">
                  <textarea
                    ref={textareaRef}
                    rows={22}
                    value={essayBody}
                    onChange={(e) => {
                      setEssayBody(e.target.value);
                      if (submitErrors.length) setSubmitErrors([]);
                    }}
                    placeholder={`Comece a escrever seu texto aqui com calma...\n\nDicas rápidas de formatação:\n• Deixe uma linha em branco entre os parágrafos.\n• Digite "## Título" para criar uma nova seção.\n• Digite "> texto" no início de uma linha para destacar uma citação longa do livro.\n• Digite "* * *" em uma linha isolada para criar um divisor clássico (✦ ✦ ✦).`}
                    className={`w-full min-h-[520px] bg-transparent resize-y focus:outline-none text-ink dark:text-slateDark-text leading-[1.9] rounded p-2 -m-2 ${
                      writerFont === 'serif'
                        ? 'font-literary text-[20px]'
                        : 'font-sans text-[18px]'
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
            <div className="mx-6 mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-950/60 border-2 border-red-600 dark:border-red-500 text-red-900 dark:text-red-200 flex items-start gap-3 shadow-sm">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-serif font-bold text-base">
                  Não foi possível publicar ainda — verifique os itens abaixo:
                </p>
                <ul className="list-disc list-inside space-y-1 font-medium">
                  {submitErrors.map((err, index) => (
                    <li key={index}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Bottom Bar: Draft Status & Submit */}
          <div className="bg-parchment-warm dark:bg-slateDark-elevated border-t border-parchment-deep dark:border-slateDark-border px-6 py-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-ink-secondary dark:text-slateDark-muted">
              <CheckCircle2 className="w-4 h-4 text-forest dark:text-emerald-400" />
              <span>
                Rascunho salvo automaticamente no navegador
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

            <div className="flex items-center gap-3">
              <Link
                to="/"
                className="px-4 py-2.5 rounded-md border border-parchment-deep dark:border-slateDark-border text-sm font-semibold text-ink dark:text-slateDark-text hover:bg-parchment"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-burgundy hover:bg-burgundy-hover dark:bg-gold dark:hover:bg-gold-light text-parchment dark:text-slateDark-bg text-sm sm:text-base font-semibold tracking-wide shadow-sm transition-all disabled:opacity-60"
              >
                <Feather className="w-4 h-4" />
                <span>
                  {isSubmitting
                    ? 'Publicando...'
                    : 'Publicar Texto & Abrir para Comentários'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
