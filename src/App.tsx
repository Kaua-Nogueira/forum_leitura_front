import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, Info, ShieldCheck } from 'lucide-react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { GlobalModals } from './components/Modals';
import { HomePage } from './pages/HomePage';
import { WorkDetailPage } from './pages/WorkDetailPage';
import { TopicDetailPage } from './pages/TopicDetailPage';
import { ModerationPanel } from './pages/ModerationPanel';
import { WriteEssayPage } from './pages/WriteEssayPage';

const ToastBanner: React.FC = () => {
  const { toast } = useApp();
  if (!toast) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm rounded-lg border border-parchment-deep dark:border-slateDark-border bg-ink text-parchment dark:bg-slateDark-elevated dark:text-slateDark-text px-4 py-3 shadow-2xl flex items-start gap-3 animate-fade-in">
      {toast.variant === 'success' ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
      ) : (
        <Info className="w-5 h-5 text-gold shrink-0 mt-0.5" />
      )}
      <div className="text-xs space-y-0.5">
        <p className="font-serif font-bold text-sm">{toast.title}</p>
        {toast.description && (
          <p className="text-parchment/80 dark:text-slateDark-muted">
            {toast.description}
          </p>
        )}
      </div>
    </div>
  );
};

const Footer: React.FC = () => {
  const { settings } = useApp();
  return (
    <footer className="mt-16 border-t border-parchment-deep dark:border-slateDark-border bg-parchment-warm dark:bg-slateDark-card py-10 text-xs text-ink-muted dark:text-slateDark-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-burgundy dark:text-gold" />
            <span className="font-serif text-lg font-bold text-ink dark:text-slateDark-text">
              VERITAS &amp; LITTERAE
            </span>
          </div>
          <p className="leading-relaxed">
            Plataforma comunitária de ensaios longos e resenhas sobre literatura
            clássica, teologia cristã, educação liberal e contemplação artística.
          </p>
        </div>

        <div className="space-y-2">
          <h4 className="font-serif font-bold text-sm text-ink dark:text-slateDark-text">
            Navegação Editorial
          </h4>
          <ul className="space-y-1.5">
            <li>
              <Link to="/" className="hover:text-burgundy dark:hover:text-gold">
                Caderno de Leituras &amp; Ensaios
              </Link>
            </li>
            <li>
              <Link to="/escrever" className="hover:text-burgundy dark:hover:text-gold">
                Scriptorium — Escrever sobre um Livro
              </Link>
            </li>
            <li>
              <Link
                to="/moderacao"
                className="hover:text-burgundy dark:hover:text-gold"
              >
                Painel de Moderação &amp; Tag Global Amazon
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="font-serif font-bold text-sm text-ink dark:text-slateDark-text flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-forest dark:text-emerald-400" />
            <span>Transparência de Afiliados</span>
          </h4>
          <p className="leading-relaxed">{settings.default_affiliate_disclaimer}</p>
          <p className="font-mono text-[11px]">
            Amazon Associate ID: <strong>{settings.amazon_associate_tag}</strong>
          </p>
        </div>
      </div>
    </footer>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/escrever" element={<WriteEssayPage />} />
              <Route path="/obras/:slug" element={<WorkDetailPage />} />
              <Route path="/topicos/:slug" element={<TopicDetailPage />} />
              <Route path="/moderacao" element={<ModerationPanel />} />
            </Routes>
          </div>
          <Footer />
          <GlobalModals />
          <ToastBanner />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
