import React from 'react';
import {
  Mail,
  X,
  ExternalLink,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Send,
  UserCheck
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { Client } from '../../types';

interface WelcomeEmailModalProps {
  client: Client;
  onClose: () => void;
}

export const WelcomeEmailModal: React.FC<WelcomeEmailModalProps> = ({ client, onClose }) => {
  const { users, setCurrentUser, setActiveTab, setActiveClientId } = useAgency();

  // Find client user
  const clientUser = users.find((u) => u.clientId === client.id) || {
    id: `user-client-${client.id}`,
    name: client.contactName,
    email: client.email,
    role: 'CLIENTE' as const,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Responsável da Empresa',
    clientId: client.id
  };

  const handleSimulateClientLogin = () => {
    setCurrentUser(clientUser);
    setActiveClientId(client.id);
    setActiveTab('onboarding');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-gray-800 border border-gray-600 rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col">
        {/* Header Bar */}
        <div className="p-4 border-b border-gray-700 flex items-center justify-between bg-gray-700">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-indigo-600/15 text-indigo-300 border border-indigo-600/30">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">E-mail Automático de Boas-Vindas</h3>
              <p className="text-[11px] text-gray-400">Disparado automaticamente ao cadastrar o cliente</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Email Preview Paper */}
        <div className="p-6 overflow-y-auto space-y-5 bg-gray-900">
          {/* Metadata bar */}
          <div className="p-3 rounded-xl bg-gray-800 border border-gray-700 text-xs space-y-1.5 font-mono text-gray-200">
            <div className="flex justify-between">
              <span className="text-gray-400">De:</span>
              <span className="text-indigo-300">onboarding@agencyos.com.br</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Para:</span>
              <span className="text-white font-semibold">{client.email} ({client.contactName})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Assunto:</span>
              <span className="text-emerald-400 font-semibold">Bem-vindo(a) à InfinityRocket! Vamos cuidar do seu marketing 🚀</span>
            </div>
          </div>

          {/* Email Body */}
          <div className="p-6 rounded-lg bg-gray-800 border border-gray-700 space-y-4 text-gray-200 text-sm leading-relaxed">
            <div className="flex items-center space-x-2 pb-3 border-b border-gray-700">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-xs">
                IR
              </div>
              <span className="font-bold text-white">InfinityRocket • Operação Digital</span>
            </div>

            <p className="text-base font-semibold text-white">
              Olá, {client.contactName}!
            </p>

            <p>
              Estamos muito felizes em começar esse projeto com a <strong className="text-indigo-300">{client.companyName}</strong>.
            </p>

            <p>
              Para iniciarmos a operação com máxima velocidade e alinhamento, precisamos concluir juntos algumas etapas obrigatórias do seu <strong>Onboarding</strong>:
            </p>

            <ul className="space-y-1.5 text-xs text-gray-300 bg-gray-700 p-3 rounded-xl border border-gray-700">
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>1. Criar o Grupo Oficial no WhatsApp com os responsáveis da empresa</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>2. Preencher o formulário detalhado de Briefing & Posicionamento</span>
              </li>
              <li className="flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>3. Enviar os acessos no cofre seguro (Instagram, Meta BM, Google)</span>
              </li>
            </ul>

            {/* Email CTAs */}
            <div className="pt-3 space-y-2.5">
              <button
                onClick={handleSimulateClientLogin}
                className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>ACESSAR MEU PORTAL DO CLIENTE</span>
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setActiveClientId(client.id);
                    setActiveTab('onboarding');
                    onClose();
                  }}
                  className="py-2.5 px-3 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 font-semibold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>CRIAR GRUPO NO WHATSAPP</span>
                </button>

                <button
                  onClick={() => {
                    setActiveClientId(client.id);
                    setActiveTab('briefing');
                    onClose();
                  }}
                  className="py-2.5 px-3 rounded-xl bg-gray-900 hover:bg-gray-600 border border-gray-600 text-white font-semibold text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>INICIAR ONBOARDING</span>
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-400 pt-2 border-t border-gray-700">
              Caso tenha qualquer dúvida, nossa equipe de gestão está à disposição.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-700 bg-gray-800 flex items-center justify-between">
          <button
            onClick={handleSimulateClientLogin}
            className="flex items-center space-x-2 text-xs font-semibold text-indigo-300 hover:text-indigo-300 transition-colors"
          >
            <UserCheck className="w-4 h-4" />
            <span>Simular login como {client.contactName}</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-gray-600 text-white text-xs font-semibold"
          >
            Fechar Visualização
          </button>
        </div>
      </div>
    </div>
  );
};
