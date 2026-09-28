import React, { useState } from 'react';
import { Clock, ShieldAlert, LogOut, RefreshCw, CheckCircle2, UserCheck } from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';

export const PendingApprovalView: React.FC = () => {
  const { currentUser, logout } = useAgency();
  const [isChecking, setIsChecking] = useState(false);

  const handleRefresh = () => {
    setIsChecking(true);
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-gray-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* Top Bar Brand */}
      <header className="h-16 px-6 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 flex items-center justify-center font-black text-black text-base shadow-lg shadow-indigo-500/20">
            A
          </div>
          <div>
            <div className="font-extrabold text-sm tracking-tight text-white flex items-center space-x-1.5">
              <span>AgencyOS</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 font-semibold border border-amber-500/20">
                PENDENTE
              </span>
            </div>
            <p className="text-[10px] text-gray-400">Sistema Operacional de Marketing</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="text-xs text-gray-400 hover:text-rose-400 p-2 rounded-xl hover:bg-gray-800 transition-colors flex items-center space-x-1.5 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </button>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-black text-white tracking-tight">
              Acesso em Análise
            </h1>
            <p className="text-xs text-gray-400 leading-relaxed">
              Sua conta foi registrada com sucesso como <strong className="text-gray-200">COLABORADOR</strong>. Por questões de segurança, novos cadastros não possuem privilégios até que um <strong className="text-indigo-400">Administrador</strong> aprove sua entrada.
            </p>
          </div>

          {/* User Details Box */}
          <div className="p-4 rounded-xl bg-gray-800/80 border border-gray-700/60 text-left space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-gray-700">
              <span className="text-gray-400">Status no Servidor:</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                PENDENTE DE APROVAÇÃO
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Nome:</span>
              <span className="text-white font-semibold">{currentUser?.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">E-mail:</span>
              <span className="text-gray-300 font-mono text-[11px]">{currentUser?.email}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Papel Atribuído:</span>
              <span className="text-indigo-300 font-bold">{currentUser?.role || 'COLABORADOR'}</span>
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-3.5 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-[11px] text-gray-300 text-left flex items-start space-x-2.5">
            <ShieldAlert className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              As regras de segurança do Firestore protegem todos os dados de clientes e faturamento. Assim que o administrador aprovar seu acesso no painel de equipe, seu sistema será liberado automaticamente.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-2 pt-2">
            <button
              onClick={handleRefresh}
              disabled={isChecking}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-lg shadow-indigo-600/20 active:scale-98 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
              <span>{isChecking ? 'Verificando...' : 'Verificar se fui aprovado'}</span>
            </button>

            <button
              onClick={logout}
              className="w-full py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Entrar com Outra Conta
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-gray-400 text-[11px] border-t border-gray-800/60">
        AgencyOS • Governança e Segurança em Tempo Real
      </footer>
    </div>
  );
};
