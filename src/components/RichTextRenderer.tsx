import React from 'react';
import { Quote } from 'lucide-react';

export type ReadingFontSize = 'normal' | 'large' | 'xlarge';
export type ReadingFontFamily = 'serif' | 'sans';

interface RichTextRendererProps {
  content: string;
  dropcap?: boolean;
  fontSize?: ReadingFontSize;
  fontFamily?: ReadingFontFamily;
  className?: string;
}

/**
 * Calcula contagem de palavras e tempo estimado de leitura (200 palavras/min)
 */
export function getReadingMetrics(text: string): {
  words: number;
  minutes: number;
  paragraphs: number;
} {
  if (!text || !text.trim()) {
    return { words: 0, minutes: 1, paragraphs: 0 };
  }
  const clean = text.trim();
  const words = clean.split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 190));
  const paragraphs = clean.split(/\n\n+/).filter((b) => b.trim().length > 0).length;
  return { words, minutes, paragraphs };
}

/**
 * Renderizador Editorial Clássico para textos médios e longos:
 * - Suporta ## Subtítulos de Seção
 * - Suporta > Citações longas (Blockquotes literários)
 * - Suporta * * * ou --- (Divisores clássicos de seção)
 * - Suporta **negrito** e *itálico*
 * - Suporta controles de conforto de leitura (tamanho da fonte e família tipográfica)
 */
export const RichTextRenderer: React.FC<RichTextRendererProps> = ({
  content,
  dropcap = false,
  fontSize = 'large',
  fontFamily = 'serif',
  className = '',
}) => {
  if (!content) return null;

  const blocks = content.split(/\n\n+/);
  let firstParagraphRendered = false;

  const sizeClasses: Record<ReadingFontSize, string> = {
    normal: 'text-[16px] leading-[1.85]',
    large: 'text-[18px] sm:text-[19px] leading-[1.92]',
    xlarge: 'text-[20px] sm:text-[21.5px] leading-[1.98]',
  };

  const fontClasses: Record<ReadingFontFamily, string> = {
    serif: 'font-literary',
    sans: 'font-sans',
  };

  const formatInline = (text: string): React.ReactNode[] => {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong
            key={idx}
            className="font-semibold text-ink dark:text-slateDark-text"
          >
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={idx} className="italic text-[1.03em]">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {blocks.map((block, index) => {
        const trimmed = block.trim();
        if (!trimmed) return null;

        // 1. Divisor clássico (* * * ou ---)
        if (/^(\*\s*\*\s*\*|---+|___+)$/.test(trimmed)) {
          return (
            <div
              key={index}
              className="py-4 text-center text-burgundy/60 dark:text-gold/60 font-serif tracking-[0.6em] text-sm select-none"
            >
              ✦ ✦ ✦
            </div>
          );
        }

        // 2. Subtítulo de seção (## Título ou ### Título)
        if (trimmed.startsWith('## ') || trimmed.startsWith('### ')) {
          const headingText = trimmed.replace(/^#{2,3}\s+/, '');
          return (
            <h3
              key={index}
              className="font-serif text-xl sm:text-2xl font-bold text-ink dark:text-slateDark-text pt-4 pb-1 border-b border-parchment-deep/60 dark:border-slateDark-border/60 tracking-tight"
            >
              {formatInline(headingText)}
            </h3>
          );
        }

        // 3. Blockquote / Citação literária (> texto)
        if (trimmed.startsWith('>')) {
          const quoteText = trimmed
            .split('\n')
            .map((line) => line.replace(/^>\s?/, ''))
            .join(' ');

          return (
            <blockquote
              key={index}
              className="editorial-blockquote my-7 py-5 pl-6 pr-5 rounded-r-lg relative shadow-sm"
            >
              <Quote className="w-5 h-5 text-burgundy/40 dark:text-gold/50 mb-2" />
              <p className="font-literary italic text-xl sm:text-[22px] text-ink dark:text-slateDark-text leading-[1.75]">
                “{formatInline(quoteText)}”
              </p>
            </blockquote>
          );
        }

        // 4. Parágrafo regular de leitura longa
        const shouldUseDropcap = dropcap && !firstParagraphRendered;
        firstParagraphRendered = true;

        return (
          <p
            key={index}
            className={`text-ink-secondary dark:text-slateDark-text/95 ${sizeClasses[fontSize]} ${fontClasses[fontFamily]} ${
              shouldUseDropcap ? 'editorial-dropcap' : ''
            }`}
          >
            {formatInline(trimmed)}
          </p>
        );
      })}
    </div>
  );
};
