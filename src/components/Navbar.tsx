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
    <header className="w-full border-b border-parchment-deep dark:border-slateDark-border bg-parchment/95 dark:bg-slateDark-bg/95 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          {/* Brand Identity */}
          <Link to="/" className="group flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-lg bg-burgundy dark:bg-slateDark-elevated border border-burgundy/20 dark:border-gold/40 flex items-center justify-center text-parchment dark:text-gold shadow-sm shrink-0 group-hover:scale-[1.02] transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-ink dark:text-slateDark-text whitespace-nowrap leading-none">
                VERITAS <span className="font-light text-burgundy dark:text-gold">&amp;</span> LITTERAE
              </h1>
              <p className="hidden xl:block text-xs font-medium text-ink-secondary dark:text-slateDark-muted mt-1 truncate">
                Literatura Clássica, Teologia &amp; Educação
              </p>
            </div>
          </Link>

          {/* Navigation & Actions */}
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3 ml-auto">
            <nav className="flex items-center gap-1.5">
              <Link
                to="/"
                className={`px-3 py-2 rounded-md text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                  location.pathname === '/'
                    ? 'bg-parchment-deep dark:bg-slateDark-elevated text-ink dark:text-white'
                    : 'text-ink-secondary dark:text-slateDark-text hover:bg-parchment-warm dark:hover:bg-slateDark-card'
                }`}
              >
                Leituras &amp; Ensaios
              </Link>

              {isAuthenticated && permissions.can_moderate_queue && (
                <Link
                  to="/moderacao"
                  className={`relative px-3 py-2 rounded-md text-xs sm:text-sm font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                    location.pathname === '/moderacao'
                      ? 'bg-burgundy/15 dark:bg-gold/20 text-burgundy dark:text-gold border border-burgundy/30 dark:border-gold/40'
                      : 'text-ink-secondary dark:text-slateDark-text hover:bg-parchment-warm dark:hover:bg-slateDark-card'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4 text-burgundy dark:text-gold shrink-0" />
                  <span>Moderação</span>
                  {pendingFlagsCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-xs font-bold bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg leading-none">
                      {pendingFlagsCount}
                    </span>
                  )}
                </Link>
              )}
            </nav>

            {/* Primary Button: Write about a Book */}
            <Link
              to="/escrever"
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 bg-burgundy hover:bg-burgundy-hover dark:bg-gold dark:hover:bg-gold-light text-parchment dark:text-slateDark-bg transition-all shadow-sm"
            >
              <Feather className="w-4 h-4 shrink-0" />
              <span>Escrever</span>
            </Link>

            {/* User Session / Login */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2.5 border-l border-parchment-deep dark:border-slateDark-border shrink-0">
                <div className="hidden lg:flex flex-col text-right max-w-[150px]">
                  <span className="text-xs sm:text-sm font-bold text-ink dark:text-slateDark-text leading-tight truncate">
                    {currentUser.name}
                  </span>
                  <span className="text-xs font-medium text-ink-secondary dark:text-slateDark-muted truncate">
                    {currentUser.role === 'ADMIN'
                      ? 'Administrador'
                      : currentUser.role === 'MODERATOR'
                      ? 'Moderador'
                      : 'Membro'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Encerrar sessão"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border bg-parchment-warm dark:bg-slateDark-card text-xs sm:text-sm font-semibold whitespace-nowrap text-ink dark:text-slateDark-text hover:text-burgundy dark:hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4 shrink-0" />
                  <span>Sair</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border bg-parchment-warm dark:bg-slateDark-card text-xs sm:text-sm font-semibold whitespace-nowrap shrink-0 text-ink dark:text-slateDark-text hover:border-burgundy transition-colors"
              >
                <LogIn className="w-4 h-4 text-burgundy dark:text-gold shrink-0" />
                <span>Entrar</span>
              </Link>
            )}

            {/* Theme Switcher */}
            <button
              onClick={toggleDark}
              aria-label="Alternar tema"
              title={isDark ? 'Mudar para Modo Papel Claro' : 'Mudar para Modo Ardósia Noturno'}
              className="p-2 rounded-md border border-parchment-deep dark:border-slateDark-border bg-parchment-warm dark:bg-slateDark-card text-ink-secondary dark:text-gold hover:border-burgundy/40 shrink-0 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
