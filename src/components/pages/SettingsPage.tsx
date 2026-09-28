import React, { useState } from 'react';
import {
  Settings,
  User,
  Lock,
  LogOut,
  ShieldCheck,
  Building2,
  Users2,
  KeyRound,
  Key,
  CheckCircle2,
  Trash2,
  RotateCcw,
  Sparkles,
  Mail,
  Phone,
  Briefcase,
  ExternalLink,
  Download
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';

export const SettingsPage: React.FC = () => {
  const {
    currentUser,
    updateUser,
    logout,
    resetPassword,
    clearAllData,
    resetDemoData,
    clients,
    users,
    activeClient,
    tasks,
    contents,
    financials,
    transactions,
    meetings,
    tickets,
    documents,
    reports,
    automations,
    templates
  } = useAgency();

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [title, setTitle] = useState(currentUser?.title || '');
  const [department, setDepartment] = useState(currentUser?.department || '');
  const [isSaved, setIsSaved] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleExportBackup = () => {
    setIsExporting(true);
    const backupData = {
      agencyOSVersion: '2.5.0',
      exportedAt: new Date().toISOString(),
      exportedBy: currentUser.email,
      summary: {
        totalClients: clients.length,
        totalTasks: tasks.length,
        totalContents: contents.length,
        totalTransactions: transactions.length,
        totalDocuments: documents.length
      },
      clients,
      tasks,
      contents,
      financials,
      transactions,
      meetings,
      tickets,
      documents,
      reports,
      automations,
      templates
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `AgencyOS_Backup_${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setTimeout(() => setIsExporting(false), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    updateUser(currentUser.id, {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      title: title.trim(),
      department: department.trim()
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleRequestPasswordReset = async () => {
    if (!currentUser?.email) return;
    const res = await resetPassword(currentUser.email);
    if (res.success) {
      setResetEmailSent(true);
      setTimeout(() => setResetEmailSent(false), 5000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Top Header */}
      <div className="p-5 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-indigo-300" />
            <h1 className="text-xl font-bold text-white">Configurações & Perfil de Acesso</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Gerencie suas credenciais de acesso, e-mail, senha e dados da sua conta no sistema.
          </p>
        </div>

        {/* Quick Logout Button */}
        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sair da Conta (Logout)</span>
        </button>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="md:col-span-1 space-y-4">
          <div className="p-5 rounded-lg bg-gray-800 border border-gray-700 text-center space-y-3">
            <div className="relative inline-block mx-auto">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-20 h-20 rounded-lg object-cover border-2 border-indigo-600/40 mx-auto"
              />
              <span
                className={`absolute -bottom-1 -right-1 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase border ${
                  currentUser.role === 'ADMIN'
                    ? 'bg-indigo-600 text-black border-indigo-600'
                    : currentUser.role === 'CLIENTE'
                    ? 'bg-emerald-500 text-white border-emerald-400'
                    : 'bg-gray-600 text-gray-200 border-gray-600'
                }`}
              >
                {currentUser.role}
              </span>
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">{currentUser.name}</h3>
              <p className="text-xs text-indigo-300 font-medium">{currentUser.title}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{currentUser.email}</p>
            </div>

            {currentUser.role === 'CLIENTE' && activeClient && (
              <div className="p-2.5 rounded-xl bg-gray-700 border border-gray-600 text-left">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                  Empresa Vinculada:
                </span>
                <p className="text-xs font-semibold text-white mt-0.5">{activeClient.companyName}</p>
                <p className="text-[10px] text-indigo-300">Plano {activeClient.plan}</p>
              </div>
            )}

            <div className="pt-2 border-t border-gray-700">
              <button
                onClick={logout}
                className="w-full py-2 rounded-xl bg-gray-700 hover:bg-rose-500/20 hover:text-rose-400 text-gray-300 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Desconectar Sessão</span>
              </button>
            </div>
          </div>

          {/* Quick Stats / Info */}
          <div className="p-4 rounded-lg bg-gray-800 border border-gray-700 space-y-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Segurança da Sessão
            </span>
            <div className="flex items-center space-x-2 text-xs text-gray-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Autenticação Local Ativa</span>
            </div>
            <p className="text-[11px] text-gray-500">
              As alterações feitas no seu perfil são sincronizadas instantaneamente no seu navegador.
            </p>
          </div>
        </div>

        {/* Right Column: Edit Profile & Password Form */}
        <div className="md:col-span-2 space-y-6">
          <div className="p-6 rounded-lg bg-gray-800 border border-gray-700 space-y-5">
            <div className="flex items-center space-x-2 pb-3 border-b border-gray-700">
              <User className="w-4 h-4 text-indigo-300" />
              <h3 className="text-sm font-bold text-white">Editar Dados de Login e Contato</h3>
            </div>

            {isSaved && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>Perfil atualizado com sucesso! Suas novas credenciais estão salvas.</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                    E-mail de Login *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                    Cargo / Especialidade
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Gestora de Contas"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                    Departamento
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Ex: Operações / Marketing"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                    Telefone / WhatsApp
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1.5">
                    Segurança da Senha
                  </label>
                  <button
                    type="button"
                    onClick={handleRequestPasswordReset}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-700 hover:bg-[#202020] border border-gray-600 text-xs text-indigo-300 font-semibold transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Redefinir Senha via E-mail</span>
                  </button>
                </div>
              </div>

              {resetEmailSent && (
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  <span>Link de redefinição de senha enviado com sucesso para seu e-mail pelo Firebase Auth.</span>
                </div>
              )}

              <div className="pt-3 border-t border-gray-700 flex items-center justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  Salvar Minhas Alterações
                </button>
              </div>
            </form>
          </div>

          {/* Admin System Maintenance Zone */}
          {currentUser.role === 'ADMIN' && (
            <div className="p-6 rounded-lg bg-gray-800 border border-indigo-500/20 space-y-4">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Zona de Manutenção & Backups (Administrador)</h3>
              </div>
              <p className="text-xs text-gray-400">
                Opções para exportar cópias de segurança de todos os clientes, tarefas e finanças, ou gerenciar dados de demonstração.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  disabled={isExporting}
                  className="p-3 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                  title="Baixar arquivo JSON completo com todos os dados da agência"
                >
                  <Download className="w-4 h-4 text-indigo-400" />
                  <span>{isExporting ? 'Exportando...' : 'Exportar Backup Completo (JSON)'}</span>
                </button>

                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        'ATENÇÃO: Deseja apagar todos os clientes fictícios e tarefas de exemplo para deixar o sistema 100% pronto do zero?'
                      )
                    ) {
                      clearAllData();
                    }
                  }}
                  className="p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Limpar Fictícios (Zerar)</span>
                </button>

                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        'Deseja restaurar os dados de exemplo padrão para demonstração?'
                      )
                    ) {
                      resetDemoData();
                    }
                  }}
                  className="p-3 rounded-xl bg-gray-700 hover:bg-[#202020] border border-gray-600 text-gray-200 text-xs font-semibold flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restaurar Dados Exemplo</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
