import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  KeyRound,
  UserPlus,
  Mail,
  Lock,
  User as UserIcon,
  Award,
  ArrowRight,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthPage: React.FC = () => {
  const {
    currentUser,
    isAuthenticated,
    loginWithCredentials,
    registerAccount,
    logoutUser,
  } = useApp();

  const navigate = useNavigate();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Register fields
  const [name, setName] = useState('');
  const [titleBadge, setTitleBadge] = useState('');
  const [bio, setBio] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    try {
      if (mode === 'LOGIN') {
        await loginWithCredentials(email, password);
      } else {
        await registerAccount({
          name,
          email,
          password,
          title_badge: titleBadge || 'Membro • Leitor Clássico',
          bio,
        });
      }
      navigate('/');
    } catch (err: any) {
      setErrorMsg(
        err.message || 'Não foi possível autenticar. Verifique suas credenciais.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-14 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2.5">
        <div className="w-12 h-12 rounded-xl bg-burgundy dark:bg-slateDark-elevated border border-burgundy/20 dark:border-gold/40 flex items-center justify-center text-parchment dark:text-gold mx-auto shadow-sm">
          <BookOpen className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-ink dark:text-slateDark-text">
          {mode === 'LOGIN' ? 'Entrar na Comunidade' : 'Criar Conta de Membro'}
        </h1>
        <p className="text-sm text-ink-muted dark:text-slateDark-muted">
          Acesse sua conta para publicar ensaios sobre livros e participar dos
          comentários.
        </p>
      </div>

      {/* Centered Login / Register Card */}
      <div className="rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-card shadow-editorial overflow-hidden">
        {/* Tabs */}
        <div className="grid grid-cols-2 border-b border-parchment-deep dark:border-slateDark-border bg-parchment-warm dark:bg-slateDark-elevated">
          <button
            type="button"
            onClick={() => {
              setMode('LOGIN');
              setErrorMsg(null);
            }}
            className={`py-4 text-xs sm:text-sm font-serif font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              mode === 'LOGIN'
                ? 'border-burgundy dark:border-gold text-burgundy dark:text-gold bg-parchment dark:bg-slateDark-card'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Entrar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('REGISTER');
              setErrorMsg(null);
            }}
            className={`py-4 text-xs sm:text-sm font-serif font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
              mode === 'REGISTER'
                ? 'border-burgundy dark:border-gold text-burgundy dark:text-gold bg-parchment dark:bg-slateDark-card'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>Criar Conta</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-lg bg-burgundy/10 border border-burgundy/30 text-xs text-burgundy dark:text-red-300 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {mode === 'REGISTER' && (
            <>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted mb-1.5">
                  Nome Completo *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="w-full pl-10 pr-4 py-2.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text text-sm focus:outline-none focus:border-burgundy"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted mb-1.5">
                  Área de Interesse (Opcional)
                </label>
                <div className="relative">
                  <Award className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={titleBadge}
                    onChange={(e) => setTitleBadge(e.target.value)}
                    placeholder="Ex: Literatura Clássica, Teologia, Educação"
                    className="w-full pl-10 pr-4 py-2.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text text-sm focus:outline-none focus:border-burgundy"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted mb-1.5">
              E-mail *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text text-sm focus:outline-none focus:border-burgundy"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted mb-1.5">
              Senha *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text text-sm focus:outline-none focus:border-burgundy"
              />
            </div>
          </div>

          {mode === 'REGISTER' && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted mb-1.5">
                Breve Apresentação (Opcional)
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Conte quais autores ou obras você mais aprecia..."
                className="w-full px-3.5 py-2 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text text-xs focus:outline-none focus:border-burgundy"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-5 rounded-md bg-burgundy hover:bg-burgundy-hover dark:bg-gold dark:hover:bg-gold-light text-parchment dark:text-slateDark-bg font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm disabled:opacity-60"
          >
            <span>
              {submitting
                ? 'Autenticando...'
                : mode === 'LOGIN'
                ? 'Entrar'
                : 'Criar Conta'}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {isAuthenticated && (
          <div className="px-6 py-4 bg-parchment-warm dark:bg-slateDark-elevated border-t border-parchment-deep dark:border-slateDark-border flex flex-wrap items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-ink-muted dark:text-slateDark-muted">
                Logado como:{' '}
              </span>
              <strong className="text-ink dark:text-slateDark-text">
                {currentUser.name}
              </strong>
            </div>
            <button
              type="button"
              onClick={logoutUser}
              className="text-burgundy dark:text-red-400 font-semibold hover:underline"
            >
              Sair da conta
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
