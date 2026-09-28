import React, { useState } from 'react';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users2,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  Clock,
  Briefcase,
  Phone,
  HelpCircle,
  AlertCircle,
  Database,
  Rocket
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { UserRole } from '../../types';

export const LoginPage: React.FC = () => {
  const { loginWithGoogle, login, register, resetPassword, isFirestoreConnected } = useAgency();

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [activePortal, setActivePortal] = useState<'AGENCY' | 'CLIENT'>('AGENCY');

  // Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Register Form State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regTitle, setRegTitle] = useState('');
  const [regDepartment, setRegDepartment] = useState('Operações');
  const [regCompany, setRegCompany] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('COLABORADOR');
  const [isPopupBlocked, setIsPopupBlocked] = useState(false);

  const handleGoogleSignIn = async (useRedirect: boolean = false) => {
    setError(null);
    setSuccessMessage(null);
    setIsPopupBlocked(false);
    setIsGoogleLoading(true);
    try {
      const res = await loginWithGoogle(useRedirect);
      if (!res.success) {
        const msg = res.message || '';
        if (msg === 'auth/popup-blocked' || msg.includes('popup-blocked')) {
          setIsPopupBlocked(true);
          setError('O navegador bloqueou a janela pop-up do Google.');
        } else if (msg.includes('unauthorized-domain')) {
          setError('Domínio não autorizado no Firebase. Adicione este domínio no Firebase Console > Authentication > Configurações > Domínios Autorizados.');
        } else {
          setError(msg || 'Falha ao autenticar com Google.');
        }
      }
    } catch (err: any) {
      const msg = err?.message || '';
      const code = err?.code || '';
      if (code === 'auth/popup-blocked' || msg.includes('popup-blocked')) {
        setIsPopupBlocked(true);
        setError('O navegador bloqueou a janela pop-up do Google.');
      } else if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
        setError('Domínio não autorizado no Firebase. Adicione este domínio no Firebase Console > Authentication > Configurações > Domínios Autorizados.');
      } else {
        setError(msg || 'Erro ao realizar login via Google.');
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setError('Por favor, informe seu e-mail de acesso.');
      return;
    }

    if (!password) {
      setError('Por favor, informe sua senha de acesso.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(email.trim(), password);
      if (!result.success) {
        setError(result.message || 'Erro ao realizar login. Verifique seus dados.');
      }
    } catch (err: any) {
      setError(err?.message || 'Falha ao autenticar com o Firebase Auth.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setSuccessMessage(null);
    if (!email.trim()) {
      setError('Por favor, digite seu e-mail acima para receber o link de redefinição.');
      return;
    }
    const res = await resetPassword(email.trim());
    if (res.success) {
      setSuccessMessage('Um link seguro de redefinição de senha foi enviado para seu e-mail pelo Firebase Auth.');
    } else {
      setError(res.message || 'Não foi possível enviar o e-mail de redefinição.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setError('Por favor, preencha todos os campos obrigatórios (*).');
      return;
    }

    if (regPassword.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setIsLoading(true);
    try {
      // Security Enforcement: Public registration can NEVER self-assign ADMIN or GESTOR.
      // Must always be COLABORADOR (or CLIENTE for client portal) with status PENDENTE_APROVACAO.
      const role: UserRole = activePortal === 'CLIENT' ? 'CLIENTE' : 'COLABORADOR';
      const title =
        activePortal === 'CLIENT'
          ? regCompany
            ? `Representante - ${regCompany}`
            : 'Cliente / Gestor'
          : regTitle || 'Colaborador da Agência';

      const avatar =
        activePortal === 'CLIENT'
          ? 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';

      const result = await register(
        {
          name: regName.trim(),
          email: regEmail.trim().toLowerCase(),
          role: role,
          avatar: avatar,
          title: title,
          department: activePortal === 'AGENCY' ? regDepartment : 'Cliente',
          phone: regPhone.trim(),
          workloadHours: 0,
          maxCapacityHours: 40
        },
        regPassword.trim()
      );

      if (result.success) {
        setSuccessMessage(
          result.message || 'Conta criada com sucesso! Aguarde a aprovação do Administrador.'
        );
        setMode('LOGIN');
        setEmail(regEmail.trim().toLowerCase());
        setPassword('');
      } else {
        setError(result.message || 'Erro ao cadastrar usuário.');
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao processar o cadastro.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Bar Brand */}
      <header className="h-16 px-6 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 flex items-center justify-center font-black text-white text-base shadow-lg shadow-indigo-500/20">
            <Rocket className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-extrabold text-sm tracking-tight text-white flex items-center space-x-1.5">
              <span>InfinityRocket</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 font-semibold border border-indigo-500/20">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-gray-400">Sistema Operacional de Marketing</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium text-[11px]">
            <Database className="w-3.5 h-3.5" />
            <span>Banco Firestore Ativo</span>
          </div>
        </div>
      </header>

      {/* Main Login Card Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl font-black text-white tracking-tight">
              {mode === 'LOGIN' ? 'Acessar o InfinityRocket' : 'Solicitar Cadastro'}
            </h1>
            <p className="text-xs text-gray-400">
              {mode === 'LOGIN'
                ? 'Conecte-se para gerenciar clientes, campanhas e finanças'
                : 'Crie seu perfil com controle de permissões por cargo'}
            </p>
          </div>

          {/* Portal Switcher (Agência vs Cliente) */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-gray-800/80 border border-gray-700/60 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActivePortal('AGENCY')}
              className={`py-2 rounded-lg flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                activePortal === 'AGENCY'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Equipe da Agência</span>
            </button>

            <button
              type="button"
              onClick={() => setActivePortal('CLIENT')}
              className={`py-2 rounded-lg flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                activePortal === 'CLIENT'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Portal do Cliente</span>
            </button>
          </div>

          {/* Mode Tabs (Entrar vs Cadastrar) */}
          <div className="flex border-b border-gray-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('LOGIN');
                setError(null);
              }}
              className={`flex-1 pb-2.5 text-center transition-colors cursor-pointer border-b-2 ${
                mode === 'LOGIN'
                  ? 'border-indigo-500 text-indigo-400 font-bold'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('REGISTER');
                setError(null);
              }}
              className={`flex-1 pb-2.5 text-center transition-colors cursor-pointer border-b-2 ${
                mode === 'REGISTER'
                  ? 'border-indigo-500 text-indigo-400 font-bold'
                  : 'border-transparent text-gray-400 hover:text-gray-200'
              }`}
            >
              Criar Conta
            </button>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="leading-relaxed flex-1">{error}</div>
            </div>
          )}

          {isPopupBlocked && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2.5 animate-in fade-in">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>O navegador bloqueou a janela do Google</span>
              </div>
              <p className="text-gray-300 text-[11px] leading-relaxed">
                Você pode entrar sem pop-up usando o botão abaixo ou liberando os pop-ups no ícone à direita da barra de endereços do seu navegador:
              </p>
              <button
                type="button"
                onClick={() => handleGoogleSignIn(true)}
                disabled={isGoogleLoading}
                className="w-full py-2.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow active:scale-95 disabled:opacity-50"
              >
                <ArrowRight className="w-3.5 h-3.5" />
                <span>{isGoogleLoading ? 'Redirecionando...' : 'Entrar por Redirecionamento Direto'}</span>
              </button>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start space-x-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMessage}</span>
            </div>
          )}

          {/* Google Sign-In Button (Recommended) */}
          {mode === 'LOGIN' && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-gray-100 text-gray-900 font-bold text-xs flex items-center justify-center space-x-3 transition-all cursor-pointer shadow-md active:scale-98 disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.27v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.27C.46 8.2.01 10.04.01 12c0 1.96.45 3.8 1.26 5.42l4.01-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.27 6.58l4.01 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>{isGoogleLoading ? 'Autenticando...' : 'Entrar com Conta Google'}</span>
              </button>

              <div className="relative flex items-center justify-center">
                <div className="border-t border-gray-800 w-full" />
                <span className="bg-gray-900 px-3 text-[10px] text-gray-500 uppercase tracking-widest">
                  ou e-mail
                </span>
                <div className="border-t border-gray-800 w-full" />
              </div>
            </div>
          )}

          {/* Form: LOGIN */}
          {mode === 'LOGIN' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  E-mail de Acesso <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="seu.email@empresa.com.br"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-gray-300">
                    Senha de Acesso
                  </label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors cursor-pointer"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Sua senha"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/20 active:scale-98 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Entrando...</span>
                ) : (
                  <>
                    <span>Entrar no Sistema</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Form: REGISTER / REQUEST ACCESS */}
          {mode === 'REGISTER' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  Nome Completo <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Beatriz Lima"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">
                  E-mail Corporativo <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="beatriz@empresa.com.br"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    Senha <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Mínimo 4 caracteres"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    WhatsApp / Telefone
                  </label>
                  <input
                    type="text"
                    placeholder="(11) 98765-4321"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {activePortal === 'AGENCY' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1">
                      Cargo / Especialidade
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Designer, Tráfego, Social..."
                      value={regTitle}
                      onChange={(e) => setRegTitle(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-300 block mb-1">
                      Departamento
                    </label>
                    <select
                      value={regDepartment}
                      onChange={(e) => setRegDepartment(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Operações">Operações</option>
                      <option value="Criação">Criação & Design</option>
                      <option value="Mídia & Performance">Mídia & Performance</option>
                      <option value="Conteúdo & Copy">Conteúdo & Copy</option>
                      <option value="Atendimento">Atendimento</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">
                    Nome da Sua Empresa / Marca
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Fontana Estética"
                    value={regCompany}
                    onChange={(e) => setRegCompany(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}

              <div className="p-3 rounded-xl bg-gray-800/80 border border-gray-700/60 flex items-start space-x-2 text-[11px] text-gray-300">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  Por segurança, novas contas começam como <strong className="text-white">Colaborador Pendente</strong>. O acesso aos dados e projetos é liberado após aprovação de um Administrador.
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/20 active:scale-98 disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Criando conta...</span>
                ) : (
                  <>
                    <span>Cadastrar Conta</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Security & Multi-device Note */}
          <div className="pt-3 border-t border-gray-800 text-[11px] text-gray-400 text-center space-y-1">
            <div className="flex items-center justify-center space-x-1.5 text-indigo-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Dados Persistentes e Sincronizados em Nuvem</span>
            </div>
            <p>Seus registros ficam salvos e sincronizam entre abas e dispositivos.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="h-12 border-t border-gray-800 flex items-center justify-center text-xs text-gray-500">
        InfinityRocket • Marketing Operations & Financial Suite
      </footer>
    </div>
  );
};
