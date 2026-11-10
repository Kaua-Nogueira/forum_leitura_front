import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ShieldAlert,
  Sun,
  Moon,
  Feather,
  LogIn,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    isAuthenticated,
    permissions,
    logoutUser,
    isDark,
    toggleDark,
    moderationFlags,
    works,
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();

  const pendingFlagsCount =
    moderationFlags.filter((f) => f.status === 'PENDING').length +
    works.filter((w) => w.status === 'PENDING').length;

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  return (
    <header className="border-b border-parchment-deep dark:border-slateDark-border bg-parchment/95 dark:bg-slateDark-bg/95 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Brand Identity */}
          <Link to="/" className="group flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-burgundy dark:bg-slateDark-elevated border border-burgundy/20 dark:border-gold/40 flex items-center justify-center text-parchment dark:text-gold shadow-sm group-hover:scale-[1.02] transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-ink dark:text-slateDark-text">
                  VERITAS <span className="font-light text-burgundy dark:text-gold">&amp;</span> LITTERAE
                </h1>
              </div>
              <p className="text-xs text-ink-muted dark:text-slateDark-muted tracking-wide">
                Ensaios sobre Grandes Livros, Teologia, Educação Clássica &amp; Artes
              </p>
            </div>
          </Link>

          {/* Navigation & Actions */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <nav className="flex items-center gap-1 mr-1">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  location.pathname === '/'
                    ? 'bg-parchment-deep/70 dark:bg-slateDark-elevated text-ink dark:text-white font-semibold'
                    : 'text-ink-secondary dark:text-slateDark-muted hover:bg-parchment-warm dark:hover:bg-slateDark-card'
                }`}
              >
                Leituras &amp; Ensaios
              </Link>

              {isAuthenticated && permissions.can_moderate_queue && (
                <Link
                  to="/moderacao"
                  className={`relative px-3 py-2 rounded-md text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors ${
                    location.pathname === '/moderacao'
                      ? 'bg-burgundy/10 dark:bg-gold/15 text-burgundy dark:text-gold font-semibold border border-burgundy/20 dark:border-gold/30'
                      : 'text-ink-secondary dark:text-slateDark-muted hover:bg-parchment-warm dark:hover:bg-slateDark-card'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-burgundy dark:text-gold" />
                  <span>Moderação</span>
                  {pendingFlagsCount > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg">
                      {pendingFlagsCount}
                    </span>
                  )}
                </Link>
              )}
            </nav>

            {/* Primary Button: Write about a Book */}
            <Link
              to={isAuthenticated ? '/escrever' : '/login'}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-xs sm:text-sm font-semibold bg-burgundy hover:bg-burgundy-hover dark:bg-gold dark:hover:bg-gold-light text-parchment dark:text-slateDark-bg transition-all shadow-sm"
            >
              <Feather className="w-4 h-4" />
              <span>Escrever sobre um Livro</span>
            </Link>

            {/* User Session / Login */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 border-l border-parchment-deep dark:border-slateDark-border">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-semibold text-ink dark:text-slateDark-text leading-tight">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-ink-muted dark:text-slateDark-muted">
                    {currentUser.title_badge || 'Membro'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Encerrar sessão"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border bg-parchment-warm dark:bg-slateDark-card text-xs font-medium text-ink-secondary dark:text-slateDark-muted hover:text-burgundy dark:hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-parchment-warm dark:bg-slateDark-card text-xs sm:text-sm font-semibold text-ink dark:text-slateDark-text hover:border-burgundy transition-colors"
              >
                <LogIn className="w-4 h-4 text-burgundy dark:text-gold" />
                <span>Entrar</span>
              </Link>
            )}

            {/* Theme Switcher */}
            <button
              onClick={toggleDark}
              aria-label="Alternar tema"
              title={isDark ? 'Mudar para Modo Papel Claro' : 'Mudar para Modo Ardósia Noturno'}
              className="p-2.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-parchment-warm dark:bg-slateDark-card text-ink-secondary dark:text-gold hover:border-burgundy/40 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
