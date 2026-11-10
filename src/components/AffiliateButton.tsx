import React from 'react';
import { ExternalLink, ShieldCheck, ShoppingBag } from 'lucide-react';
import { Work } from '../types/schema';
import { useApp } from '../context/AppContext';
import { buildAffiliateUrl } from '../services/api';

interface AffiliateButtonProps {
  work: Work;
  variant?: 'compact' | 'full';
}

export const AffiliateButton: React.FC<AffiliateButtonProps> = ({
  work,
  variant = 'compact',
}) => {
  const { settings, trackAffiliateClick } = useApp();
  const finalAffiliateUrl = buildAffiliateUrl(
    work.affiliate_url,
    settings.amazon_associate_tag
  );

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackAffiliateClick(work.id);
  };

  if (variant === 'compact') {
    return (
      <div className="space-y-1.5">
        <a
          href={finalAffiliateUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleClick}
          className="group flex items-center justify-between w-full px-3.5 py-2.5 rounded-md bg-forest text-parchment hover:bg-forest-hover dark:bg-forest-light dark:hover:bg-forest transition-all duration-200 text-xs font-medium tracking-wide shadow-sm"
        >
          <span className="flex items-center gap-2">
            <ShoppingBag className="w-3.5 h-3.5 text-gold-light shrink-0" />
            <span>{work.affiliate_cta_label || 'Adquirir na Amazon'}</span>
          </span>
          <ExternalLink className="w-3.5 h-3.5 opacity-80 group-hover:translate-x-0.5 transition-transform" />
        </a>
        <p className="text-[11px] leading-snug text-ink-muted dark:text-slateDark-muted flex items-start gap-1">
          <ShieldCheck className="w-3 h-3 text-gold shrink-0 mt-0.5" />
          <span>
            Comprando por este link, você apoia o projeto sem custo adicional.
          </span>
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-parchment-deep dark:border-slateDark-border bg-parchment-warm/80 dark:bg-slateDark-elevated/70 p-5 space-y-3.5 shadow-editorial">
      <div className="flex items-center justify-between gap-2 border-b border-parchment-deep/80 dark:border-slateDark-border pb-3">
        <div>
          <span className="text-[11px] uppercase tracking-widest font-semibold text-burgundy dark:text-gold-light block">
            Curadoria & Aquisição Recomendada
          </span>
          <p className="text-sm font-medium text-ink dark:text-slateDark-text mt-0.5">
            {work.affiliate_price_hint || 'Edição Recomendada pelo Conselho Editorial'}
          </p>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-parchment dark:bg-slateDark-card border border-parchment-deep dark:border-slateDark-border text-ink-muted dark:text-slateDark-muted">
          tag: {settings.amazon_associate_tag}
        </span>
      </div>

      <a
        href={finalAffiliateUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={handleClick}
        className="group flex items-center justify-center gap-2.5 w-full py-3 px-5 rounded-md bg-forest hover:bg-forest-hover dark:bg-forest-light dark:hover:bg-forest text-parchment font-medium text-sm tracking-wide transition-all shadow-sm"
      >
        <ShoppingBag className="w-4 h-4 text-gold-light" />
        <span>{work.affiliate_cta_label || 'Adquirir na Amazon'}</span>
        <ExternalLink className="w-4 h-4 opacity-80 group-hover:translate-x-0.5 transition-transform" />
      </a>

      <div className="flex items-start gap-2 pt-1 text-xs text-ink-muted dark:text-slateDark-muted leading-relaxed">
        <ShieldCheck className="w-4 h-4 text-gold shrink-0 mt-0.5" />
        <p>
          <strong className="font-semibold text-ink-secondary dark:text-slateDark-text">
            Nota de Conformidade Ética:
          </strong>{' '}
          {settings.default_affiliate_disclaimer}
        </p>
      </div>
    </div>
  );
};
