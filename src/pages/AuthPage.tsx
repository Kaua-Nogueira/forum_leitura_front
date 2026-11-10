import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  KeyRound,
  UserPlus,
  ShieldCheck,
  Mail,
  Lock,
  User as UserIcon,
  Award,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AuthPage: React.FC = () => {
  const {
    currentUser,
    isAuthenticated,
    permissions,
    loginWithCredentials,
    registerAccount,
    logoutUser,
  } = useApp();

  const navigate = useNavigate();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('augusto@veritaslitterae.org');
  const [password, setPassword] = useState('password');

  // Register fields
  const [name, setName] = useState('');
  const [titleBadge, setTitleBadge] = useState('Membro Confrade • Literatura Clássica');
  const [bio, setBio] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const demoAccounts = [
    {
      role: 'ADMIN',
      name: 'Prof. Augusto Vasconcelos',
      email: 'augusto@veritaslitterae.org',
      password: 'password',
      badge: 'Editor-Chefe & Administrador',
      perms: [
        'Publicar obras e ensaios diretamente',
        'Aprovar, ocultar (soft-delete) e banir usuários',
        'Alterar Tag Global de Afiliado Amazon',
        'Promover/Rebaixar papéis RBAC de outros usuários',
      ],
    },
    {
      role: 'MODERATOR',
      name: 'Helena Monteiro de Barros',
      email: 'helena@veritaslitterae.org',
      password: 'password',
      badge: 'Moderadora • Educação Clássica',
      perms: [
        'Publicar obras e ensaios diretamente sem fila',
        'Acessar Painel de Moderação',
        'Aprovar ou Ocultar (soft-delete) postagens sinalizadas',
        'Restrição RBAC: não altera tag Amazon nem bane contas',
      ],
    },
    {
      role: 'MEMBER',
      name: 'Lucas Albuquerque',
      email: 'lucas@leitor.org',
      password: 'password',
      badge: 'Membro Confrade • Leitor',
      perms: [
        'Escrever ensaios e resenhas sobre livros no Scriptorium',
        'Publicar comentários, avaliações e réplicas aninhadas',
        'Sinalizar spam ou violações para a moderação',
        'Restrição RBAC: sem acesso ao Painel de Moderação',
      ],
    },
  ];

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
          title_badge: titleBadge,
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

  const handleQuickDemoLogin = async (demoEmail: string, demoPass: string) => {
    setMode('LOGIN');
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg(null);
    setSubmitting(true);
    try {
      await loginWithCredentials(demoEmail, demoPass);
      navigate('/');
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao autenticar conta de demonstração.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-burgundy/10 dark:bg-gold/15 text-burgundy dark:text-gold text-xs font-semibold uppercase tracking-widest">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Autenticação &amp; Controle de Acesso (RBAC)</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ink dark:text-slateDark-text">
          Pórtico de Acesso à Comunidade
        </h1>
        <p className="text-sm text-ink-muted dark:text-slateDark-muted">
          Entre com suas credenciais para escrever resenhas de livros, comentar nas
          leituras ou acessar as ferramentas de governança conforme seu papel RBAC.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: LOGIN / REGISTER FORM (6 COLS) */}
        <div className="lg:col-span-6 rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-card shadow-editorial overflow-hidden">
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
              <span>Entrar com Conta</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('REGISTER');
                setEmail('');
                setPassword('');
                setErrorMsg(null);
              }}
              className={`py-4 text-xs sm:text-sm font-serif font-bold flex items-center justify-center gap-2 border-b-2 transition-all ${
                mode === 'REGISTER'
                  ? 'border-burgundy dark:border-gold text-burgundy dark:text-gold bg-parchment dark:bg-slateDark-card'
                  : 'border-transparent text-ink-muted hover:text-ink'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Criar Conta de Membro</span>
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
                      placeholder="Ex: Matheus Nogueira"
                      className="w-full pl-10 pr-4 py-2.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text text-sm focus:outline-none focus:border-burgundy"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted mb-1.5">
                    Área de Interesse / Vocação Literária
                  </label>
                  <div className="relative">
                    <Award className="w-4 h-4 text-ink-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={titleBadge}
                      onChange={(e) => setTitleBadge(e.target.value)}
                      placeholder="Ex: Estudante de Teologia & Clássicos"
                      className="w-full pl-10 pr-4 py-2.5 rounded-md border border-parchment-deep dark:border-slateDark-border bg-white dark:bg-slateDark-bg text-ink dark:text-slateDark-text text-sm focus:outline-none focus:border-burgundy"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-secondary dark:text-slateDark-muted mb-1.5">
                E-mail Institucional ou Pessoal *
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
                  placeholder="Conte quais autores clássicos ou temas você mais aprecia..."
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
                  ? 'Autenticando na API Laravel...'
                  : mode === 'LOGIN'
                  ? 'Entrar na Plataforma'
                  : 'Cadastrar & Entrar como Membro'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Current Session Status Footer */}
          {isAuthenticated && (
            <div className="px-6 py-4 bg-parchment-warm dark:bg-slateDark-elevated border-t border-parchment-deep dark:border-slateDark-border flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                <span className="text-ink-muted dark:text-slateDark-muted">
                  Sessão ativa:{' '}
                </span>
                <strong className="text-ink dark:text-slateDark-text">
                  {currentUser.name}
                </strong>{' '}
                <span className="px-2 py-0.5 rounded bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg font-bold text-[10px]">
                  {currentUser.role}
                </span>
              </div>
              <button
                type="button"
                onClick={logoutUser}
                className="text-burgundy dark:text-red-400 font-semibold hover:underline"
              >
                Encerrar Sessão (Logout)
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: RBAC MATRIX & 1-CLICK DEMO ACCOUNTS (6 COLS) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="p-6 rounded-xl border border-parchment-deep dark:border-slateDark-border bg-parchment-warm/80 dark:bg-slateDark-card space-y-4 shadow-editorial">
            <div className="flex items-center justify-between border-b border-parchment-deep dark:border-slateDark-border pb-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-widest text-burgundy dark:text-gold block">
                  Teste Rápido de Credenciais (Banco SQLite Laravel)
                </span>
                <h2 className="font-serif text-xl font-bold text-ink dark:text-slateDark-text">
                  Contas por Nível de Acesso (RBAC)
                </h2>
              </div>
              <BookOpen className="w-5 h-5 text-burgundy dark:text-gold" />
            </div>

            <p className="text-xs text-ink-secondary dark:text-slateDark-muted leading-relaxed">
              Clique em qualquer conta abaixo para fazer <strong>login real</strong> via{' '}
              <code className="font-mono bg-parchment dark:bg-slateDark-elevated px-1.5 py-0.5 rounded">
                POST /api/auth/login
              </code>{' '}
              com token Bearer e testar as permissões de cada papel:
            </p>

            <div className="space-y-3.5">
              {demoAccounts.map((acc) => {
                const isCurrent =
                  isAuthenticated && currentUser.email === acc.email;
                return (
                  <div
                    key={acc.role}
                    className={`p-4 rounded-lg border transition-all ${
                      isCurrent
                        ? 'border-forest bg-forest/5 dark:border-emerald-400/50 dark:bg-emerald-950/20'
                        : 'border-parchment-deep dark:border-slateDark-border bg-parchment dark:bg-slateDark-elevated'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-burgundy text-parchment dark:bg-gold dark:text-slateDark-bg">
                            {acc.role}
                          </span>
                          <h3 className="font-serif font-bold text-sm text-ink dark:text-slateDark-text">
                            {acc.name}
                          </h3>
                        </div>
                        <p className="font-mono text-[11px] text-ink-muted dark:text-slateDark-muted mt-0.5">
                          E-mail: {acc.email} • Senha: {acc.password}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleQuickDemoLogin(acc.email, acc.password)
                        }
                        className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                          isCurrent
                            ? 'bg-forest text-parchment'
                            : 'bg-ink text-parchment dark:bg-gold dark:text-slateDark-bg hover:opacity-90'
                        }`}
                      >
                        {isCurrent ? 'Logado Atualmente' : 'Entrar com esta Conta'}
                      </button>
                    </div>

                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-2 border-t border-parchment-deep/60 dark:border-slateDark-border text-[11px] text-ink-secondary dark:text-slateDark-muted">
                      {acc.perms.map((p, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-forest dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
