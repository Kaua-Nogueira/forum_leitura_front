import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  BookMarked,
  ShieldAlert,
  Sun,
  Moon,
  Feather,
  LogIn,
  LogOut,
  User as UserIcon,
  Menu,
  X,
  Sparkles,
  ClipboardList,
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
    topics,
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile drawer whenever route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const pendingFlagsCount =
    moderationFlags.filter((f) => f.status === 'PENDING').length +
    works.filter(
      (w) =>
        w.status === 'PENDING' &&
        !moderationFlags.some(
          (f) => f.status === 'PENDING' && f.target_type === 'WORK' && f.target_id === w.id
        )
    ).length +
    topics.filter(
      (t) =>
        t.status === 'PENDING' &&
        !moderationFlags.some(
          (f) => f.status === 'PENDING' && f.target_type === 'TOPIC' && f.target_id === t.id
        )
    ).length;

  const handleLogout = async () => {
    await logoutUser();
    setIsMobileMenuOpen(false);
    navigate('/login');
  };

  const firstName = (currentUser.name || 'Membro').trim().split(/\s+/)[0];

  return (
    <header className="w-full border-b border-parchment-deep dark:border-slateDark-border bg-parchment/95 dark:bg-slateDark-bg/95 backdrop-blur-md sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between gap-2">
          {/* Brand Identity */}
          <Link to="/" className="group flex items-center gap-2 shrink-0 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-burgundy dark:bg-slateDark-elevated border border-burgundy/20 dark:border-gold/40 flex items-center justify-center text-parchment dark:text-gold shadow-xs shrink-0 group-hover:scale-[1.02] transition-transform">
              <BookOpen className="w-4 h-4" />
            </div>
            <h1 className="font-serif text-base sm:text-lg xl:text-xl font-bold tracking-tight text-ink dark:text-slateDark-text whitespace-nowrap leading-none">
              VERITAS <span className="font-light text-burgundy dark:text-gold">&amp;</span> LITTERAE
            </h1>
          </Link>

          {/* Desktop Navigation & Actions */}
          <div className="hidden lg:flex items-center justify-end gap-1.5 xl:gap-2 ml-auto min-w-0">
            <nav className="flex items-center gap-1">
              <Link
                to="/"
                className={`px-2.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                  location.pathname === '/'
                    ? 'bg-parchment-deep dark:bg-slateDark-elevated text-ink dark:text-white'
                    : 'text-ink-secondary dark:text-slateDark-text hover:bg-parchment-warm dark:hover:bg-slateDark-card'
                }`}
              >
                Leituras
              </Link>

              <Link
                to="/series"
                className={`px-2.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                  location.pathname.startsWith('/series')
                    ? 'bg-parchment-deep dark:bg-slateDark-elevated text-ink dark:text-white'
                    : 'text-ink-secondary dark:text-slateDark-text hover:bg-parchment-warm dark:hover:bg-slateDark-card'
                }`}
              >
                <BookMarked className="w-3.5 h-3.5 text-burgundy dark:text-gold shrink-0" />
                <span>Séries</span>
              </Link>

              {isAuthenticated && permissions.can_moderate_queue && (
                <>
                  <Link
                    to="/moderacao"
                    className={`relative px-2.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                      location.pathname === '/moderacao'
                        ? 'bg-burgundy/15 dark:bg-gold/20 text-burgundy dark:text-gold border border-burgundy/30 dark:border-gold/40'
                        : 'text-ink-secondary dark:text-slateDark-text hover:bg-parchment-warm dark:hover:bg-slateDark-card'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-burgundy dark:text-gold shrink-0" />
                    <span>Moderação</span>
                    {pendingFlagsCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg leading-none">
                        {pendingFlagsCount}
                      </span>
                    )}
                  </Link>

                  <Link
                    to="/logs"
                    className={`px-2.5 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition-colors ${
                      location.pathname === '/logs'
                        ? 'bg-burgundy/15 dark:bg-gold/20 text-burgundy dark:text-gold border border-burgundy/30 dark:border-gold/40'
                        : 'text-ink-secondary dark:text-slateDark-text hover:bg-parchment-warm dark:hover:bg-slateDark-card'
                    }`}
                  >
                    <ClipboardList className="w-3.5 h-3.5 text-burgundy dark:text-gold shrink-0" />
                    <span>Logs</span>
                  </Link>
                </>
              )}
            </nav>

            {/* Primary Button: Write about a Book */}
            <Link
              to="/escrever"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 bg-burgundy hover:bg-burgundy-hover dark:bg-gold dark:hover:bg-gold-light text-parchment dark:text-slateDark-bg transition-all shadow-xs"
            >
              <Feather className="w-3.5 h-3.5 shrink-0" />
              <span>Escrever</span>
            </Link>

            {/* User Session / Login */}
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5 pl-2 border-l border-parchment-deep dark:border-slateDark-border shrink-0">
                <Link
                  to="/perfil"
                  title={`Meu Perfil: ${currentUser.name} (${currentUser.role})`}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-semibold transition-colors ${
                    location.pathname.startsWith('/perfil')
                      ? 'bg-burgundy/15 dark:bg-gold/20 text-burgundy dark:text-gold border-burgundy/30 dark:border-gold/40'
                      : 'bg-parchment-warm dark:bg-slateDark-card border-parchment-deep dark:border-slateDark-border text-ink dark:text-slateDark-text hover:border-burgundy/40'
                  }`}
                >
                  <span className="w-5 h-5 rounded-full bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg font-serif font-bold text-[11px] flex items-center justify-center shrink-0">
                    {firstName.charAt(0).toUpperCase()}
                  </span>
                  <span className="max-w-[90px] truncate">{firstName}</span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Encerrar sessão (Sair)"
                  aria-label="Sair"
                  className="p-1.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-parchment-warm dark:bg-slateDark-card text-ink-secondary dark:text-slateDark-text hover:text-burgundy dark:hover:text-red-400 hover:border-burgundy/40 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-parchment-warm dark:bg-slateDark-card text-xs font-semibold whitespace-nowrap shrink-0 text-ink dark:text-slateDark-text hover:border-burgundy transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-burgundy dark:text-gold shrink-0" />
                <span>Entrar</span>
              </Link>
            )}

            {/* Theme Switcher */}
            <button
              onClick={toggleDark}
              aria-label="Alternar tema"
              title={isDark ? 'Mudar para Modo Papel Claro' : 'Mudar para Modo Ardósia Noturno'}
              className="p-1.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-parchment-warm dark:bg-slateDark-card text-ink-secondary dark:text-gold hover:border-burgundy/40 shrink-0 transition-colors"
            >
              {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Mobile/Tablet Right Controls: Theme + Hamburger Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleDark}
              aria-label="Alternar tema"
              className="p-2 rounded-md border border-parchment-deep dark:border-slateDark-border bg-parchment-warm dark:bg-slateDark-card text-ink-secondary dark:text-gold hover:border-burgundy/40 transition-colors"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label="Abrir menu de navegação"
              className="relative p-2 rounded-md border border-parchment-deep dark:border-slateDark-border bg-parchment-warm dark:bg-slateDark-card text-ink dark:text-slateDark-text hover:border-burgundy/40 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 text-burgundy dark:text-gold" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
              {pendingFlagsCount > 0 && !isMobileMenuOpen && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-burgundy dark:bg-gold ring-2 ring-parchment dark:ring-slateDark-bg" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-bg px-4 py-4 space-y-4 shadow-2xl animate-fade-in">
          {/* User Profile Card (if authenticated) */}
          {isAuthenticated ? (
            <div className="p-3.5 rounded-lg bg-parchment-warm dark:bg-slateDark-card border border-parchment-deep dark:border-slateDark-border flex items-center justify-between gap-3">
              <Link
                to="/perfil"
                className="flex items-center gap-2.5 min-w-0 flex-1 hover:opacity-90"
              >
                <div className="w-9 h-9 rounded-full bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg font-serif font-bold text-sm flex items-center justify-center shrink-0">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-serif font-bold text-sm text-ink dark:text-slateDark-text truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-xs font-semibold text-burgundy dark:text-gold truncate">
                    {currentUser.role === 'ADMIN'
                      ? 'Administrador'
                      : currentUser.role === 'MODERATOR'
                      ? 'Moderador'
                      : currentUser.role === 'COLUMNIST'
                      ? 'Colunista • Séries'
                      : 'Membro da Cátedra'}
                  </p>
                </div>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-elevated text-xs font-semibold text-ink-muted hover:text-burgundy dark:hover:text-red-400 transition-colors"
                title="Sair"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-parchment-warm dark:bg-slateDark-card border border-parchment-deep dark:border-slateDark-border text-sm font-semibold text-ink dark:text-slateDark-text hover:border-burgundy transition-colors"
            >
              <LogIn className="w-4 h-4 text-burgundy dark:text-gold" />
              <span>Entrar ou Criar Conta</span>
            </Link>
          )}

          {/* Primary Action Button */}
          <Link
            to="/escrever"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-burgundy hover:bg-burgundy-hover dark:bg-gold dark:hover:bg-gold-light text-parchment dark:text-slateDark-bg text-sm font-semibold tracking-wide transition-all shadow-md"
          >
            <Feather className="w-4 h-4" />
            <span>Escrever no Scriptorium</span>
          </Link>

          {/* Navigation Links List */}
          <nav className="space-y-1 pt-1 border-t border-parchment-deep/60 dark:border-slateDark-border/60">
            <Link
              to="/"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold transition-colors ${
                location.pathname === '/'
                  ? 'bg-parchment-deep dark:bg-slateDark-elevated text-ink dark:text-white'
                  : 'text-ink-secondary dark:text-slateDark-text hover:bg-parchment-warm dark:hover:bg-slateDark-card'
              }`}
            >
              <BookOpen className="w-4 h-4 text-burgundy dark:text-gold" />
              <span>Leituras &amp; Ensaios</span>
            </Link>

            <Link
              to="/series"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold transition-colors ${
                location.pathname.startsWith('/series')
                  ? 'bg-parchment-deep dark:bg-slateDark-elevated text-ink dark:text-white'
                  : 'text-ink-secondary dark:text-slateDark-text hover:bg-parchment-warm dark:hover:bg-slateDark-card'
              }`}
            >
              <BookMarked className="w-4 h-4 text-burgundy dark:text-gold" />
              <span>Séries &amp; Cadernos</span>
            </Link>

            {isAuthenticated && (
              <Link
                to="/perfil"
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold transition-colors ${
                  location.pathname.startsWith('/perfil')
                    ? 'bg-parchment-deep dark:bg-slateDark-elevated text-ink dark:text-white'
                    : 'text-ink-secondary dark:text-slateDark-text hover:bg-parchment-warm dark:hover:bg-slateDark-card'
                }`}
              >
                <UserIcon className="w-4 h-4 text-burgundy dark:text-gold" />
                <span>Meu Perfil de Autor</span>
              </Link>
            )}

            {isAuthenticated && permissions.can_moderate_queue && (
              <>
                <Link
                  to="/moderacao"
                  className={`flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-semibold transition-colors ${
                    location.pathname === '/moderacao'
                      ? 'bg-burgundy/15 dark:bg-gold/20 text-burgundy dark:text-gold border border-burgundy/30 dark:border-gold/40'
                      : 'text-ink-secondary dark:text-slateDark-text hover:bg-parchment-warm dark:hover:bg-slateDark-card'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="w-4 h-4 text-burgundy dark:text-gold" />
                    <span>Conselho de Moderação</span>
                  </div>
                  {pendingFlagsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg">
                      {pendingFlagsCount} pendentes
                    </span>
                  )}
                </Link>

                <Link
                  to="/logs"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold transition-colors ${
                    location.pathname === '/logs'
                      ? 'bg-burgundy/15 dark:bg-gold/20 text-burgundy dark:text-gold border border-burgundy/30 dark:border-gold/40'
                      : 'text-ink-secondary dark:text-slateDark-text hover:bg-parchment-warm dark:hover:bg-slateDark-card'
                  }`}
                >
                  <ClipboardList className="w-4 h-4 text-burgundy dark:text-gold" />
                  <span>Central de Logs &amp; Auditoria</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
