import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ShieldAlert,
  Sun,
  Moon,
  Feather,
  UserCheck,
  Server,
  LogIn,
  LogOut,
  User as UserIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types/schema';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    isAuthenticated,
    permissions,
    logoutUser,
    switchRole,
    isDark,
    toggleDark,
    moderationFlags,
    works,
    settings,
    apiConnected,
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();

  const pendingFlagsCount =
    moderationFlags.filter((f) => f.status === 'PENDING').length +
    works.filter((w) => w.status === 'PENDING').length;

  const roles: { role: UserRole; label: string }[] = [
    { role: 'ADMIN', label: 'Admin' },
    { role: 'MODERATOR', label: 'Moderador' },
    { role: 'MEMBER', label: 'Membro' },
    { role: 'VISITOR', label: 'Visitante' },
  ];

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  return (
    <header className="border-b border-parchment-deep dark:border-slateDark-border bg-parchment/95 dark:bg-slateDark-bg/95 backdrop-blur-md sticky top-0 z-40 transition-colors">
      {/* Top Bar: Governance & Quick RBAC Switcher + Active User Session */}
      <div className="bg-parchment-warm dark:bg-slateDark-card border-b border-parchment-deep/70 dark:border-slateDark-border px-4 py-1.5 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-ink-muted dark:text-slateDark-muted">
            <span className="font-literary italic hidden sm:inline text-ink-secondary dark:text-slateDark-text">
              “Omnia probate; quod bonum est tenete.” — I Tessalonicenses 5:21
            </span>
            <span className="hidden md:inline text-parchment-deep dark:text-slateDark-border">
              |
            </span>
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                apiConnected
                  ? 'bg-forest/10 text-forest dark:text-emerald-300 border-forest/30'
                  : 'bg-gold/15 text-ink-secondary dark:text-gold-light border-gold/30'
              }`}
            >
              <Server className="w-2.5 h-2.5" />
              {apiConnected ? 'API Laravel + RBAC Online' : 'Acervo Editorial Ativo'}
            </span>
          </div>

          {/* Right side: Active User Badge + Quick RBAC Switcher */}
          <div className="flex flex-wrap items-center gap-3 ml-auto">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink dark:text-slateDark-text hover:text-burgundy dark:hover:text-gold"
                >
                  <UserIcon className="w-3 h-3 text-burgundy dark:text-gold" />
                  <span>{currentUser.name}</span>
                  <span className="px-1.5 py-0.2 rounded bg-burgundy/15 dark:bg-gold/20 text-burgundy dark:text-gold text-[10px] font-bold">
                    {currentUser.role}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Encerrar sessão (Logout)"
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-burgundy dark:text-red-400 hover:bg-burgundy/10 font-medium"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Sair</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg text-[11px] font-semibold"
              >
                <LogIn className="w-3 h-3" />
                <span>Fazer Login / Criar Conta</span>
              </Link>
            )}

            <span className="hidden lg:inline text-parchment-deep dark:text-slateDark-border">
              |
            </span>

            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-[11px] text-ink-muted dark:text-slateDark-muted flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-burgundy dark:text-gold" />
                <span className="hidden xl:inline">Alternar RBAC:</span>
              </span>
              <div className="inline-flex rounded-md bg-parchment dark:bg-slateDark-elevated p-0.5 border border-parchment-deep dark:border-slateDark-border">
                {roles.map((r) => {
                  const active = currentUser.role === r.role;
                  return (
                    <button
                      key={r.role}
                      onClick={() => switchRole(r.role)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                        active
                          ? 'bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg shadow-sm'
                          : 'text-ink-muted dark:text-slateDark-muted hover:text-ink dark:hover:text-white'
                      }`}
                    >
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Editorial Masthead */}
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

              <Link
                to="/moderacao"
                className={`relative px-3 py-2 rounded-md text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors ${
                  location.pathname === '/moderacao'
                    ? 'bg-burgundy/10 dark:bg-gold/15 text-burgundy dark:text-gold font-semibold border border-burgundy/20 dark:border-gold/30'
                    : 'text-ink-secondary dark:text-slateDark-muted hover:bg-parchment-warm dark:hover:bg-slateDark-card'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-burgundy dark:text-gold" />
                <span>Moderação &amp; RBAC</span>
                {pendingFlagsCount > 0 && permissions.can_moderate_queue && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg">
                    {pendingFlagsCount}
                  </span>
                )}
              </Link>

              <Link
                to="/login"
                className={`px-3 py-2 rounded-md text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors ${
                  location.pathname === '/login'
                    ? 'bg-parchment-deep/70 dark:bg-slateDark-elevated text-ink dark:text-white font-semibold'
                    : 'text-ink-secondary dark:text-slateDark-muted hover:bg-parchment-warm dark:hover:bg-slateDark-card'
                }`}
              >
                <LogIn className="w-4 h-4" />
                <span>{isAuthenticated ? 'Conta' : 'Entrar'}</span>
              </Link>
            </nav>

            {/* Primary Button: Open the Spacious Writing Studio */}
            <Link
              to={isAuthenticated ? '/escrever' : '/login'}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-md text-xs sm:text-sm font-semibold bg-burgundy hover:bg-burgundy-hover dark:bg-gold dark:hover:bg-gold-light text-parchment dark:text-slateDark-bg transition-all shadow-sm"
            >
              <Feather className="w-4 h-4" />
              <span>Escrever sobre um Livro</span>
            </Link>

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
