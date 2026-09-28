import React, { useState } from 'react';
import {
  MessageSquare,
  Copy,
  Check,
  ExternalLink,
  Users,
  Clock,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { Client } from '../../types';

interface WhatsAppStepProps {
  client: Client;
}

export const WhatsAppStep: React.FC<WhatsAppStepProps> = ({ client }) => {
  const { updateClient, users } = useAgency();

  const [groupLink, setGroupLink] = useState(client.whatsappGroup.link || '');
  const [copiedWelcome, setCopiedWelcome] = useState(false);
  const [copiedName, setCopiedName] = useState(false);

  const suggestedGroupName = `InfinityRocket + ${client.tradingName}`;

  const welcomeMessageTemplate = `🚀 *Bem-vindos à InfinityRocket!*

Olá equipe *${client.tradingName}*! É um grande prazer iniciarmos essa parceria para acelerar os resultados e a presença digital de vocês.

📌 *Informações Importantes do Grupo:*
• Horário de atendimento: Segunda a Sexta, das 09h às 18h
• Gestor(a) da conta: ${users.find((u) => u.id === client.team.accountManagerId)?.name || 'Equipe InfinityRocket'}
• Aprovação de conteúdos e chamados oficiais: Utilize o nosso Portal do Cliente.

🔗 *Acesso ao seu Portal Oficial:*
Acesse para acompanhar o onboarding, enviar acessos e aprovar artes em 1 clique:
https://infinityrocket.digital/portal

Qualquer dúvida urgente durante horário comercial, estamos sempre à disposição aqui no grupo!`;

  const handleCopy = (text: string, type: 'NAME' | 'MSG') => {
    navigator.clipboard.writeText(text);
    if (type === 'NAME') {
      setCopiedName(true);
      setTimeout(() => setCopiedName(false), 2000);
    } else {
      setCopiedWelcome(true);
      setTimeout(() => setCopiedWelcome(false), 2000);
    }
  };

  const handleSaveGroup = (status: 'PENDENTE' | 'CRIADO' | 'CONFIRMADO') => {
    updateClient(client.id, {
      whatsappGroup: {
        ...client.whatsappGroup,
        groupName: suggestedGroupName,
        link: groupLink,
        status,
        createdAt: client.whatsappGroup.createdAt || new Date().toISOString().split('T')[0]
      }
    });
  };

  return (
    <div className="p-6 rounded-lg bg-gray-800 border border-gray-700 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-700">
        <div>
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">
              Canal Oficial do Cliente no WhatsApp
            </h2>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Padronização de comunicação ágil, horários de atendimento e link direto para o projeto
          </p>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${
            client.whatsappGroup.status === 'CONFIRMADO'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'bg-indigo-600/20 text-indigo-300 border border-indigo-600/30'
          }`}
        >
          Status: {client.whatsappGroup.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Setup & Group Link */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300 block">
              1. Nome Padronizado do Grupo
            </label>
            <div className="p-3 rounded-xl bg-gray-700 border border-gray-600 flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-indigo-300">{suggestedGroupName}</span>
              <button
                onClick={() => handleCopy(suggestedGroupName, 'NAME')}
                className="px-2.5 py-1 rounded-lg bg-gray-600 hover:bg-[#333] text-[11px] text-white font-semibold flex items-center space-x-1 cursor-pointer transition-colors"
              >
                {copiedName ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-300" />}
                <span>{copiedName ? 'Copiado' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-300 block">
              2. Link de Convite do Grupo do WhatsApp
            </label>
            <input
              type="text"
              value={groupLink}
              onChange={(e) => setGroupLink(e.target.value)}
              placeholder="https://chat.whatsapp.com/..."
              className="w-full px-3 py-2.5 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-indigo-600"
            />
          </div>

          <div className="p-4 rounded-xl bg-gray-700 border border-gray-600 space-y-2 text-xs text-gray-200">
            <div className="font-bold text-white flex items-center space-x-1.5">
              <Clock className="w-4 h-4 text-indigo-300" />
              <span>Regras de Horário e Atendimento</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              O grupo do WhatsApp é destinado a alinhamentos rápidos, avisos e avisos de urgência. Aprovações de posts e chamados complexos devem ser registrados no portal.
            </p>
          </div>

          <div className="pt-2 flex items-center space-x-2">
            <button
              onClick={() => handleSaveGroup('CONFIRMADO')}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar Grupo Ativo</span>
            </button>
            {groupLink && (
              <a
                href={groupLink}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 flex items-center justify-center"
                title="Abrir no WhatsApp"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Right: Copyable Welcome Message Template */}
        <div className="space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-300">
                3. Mensagem de Boas-Vindas Padronizada
              </label>
              <button
                onClick={() => handleCopy(welcomeMessageTemplate, 'MSG')}
                className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-600/30 text-[11px] font-bold flex items-center space-x-1 transition-colors cursor-pointer"
              >
                {copiedWelcome ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedWelcome ? 'Copiado para o WhatsApp!' : 'Copiar Texto Pronto'}</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-gray-900 border border-gray-700 text-xs text-gray-200 whitespace-pre-line leading-relaxed font-sans max-h-72 overflow-y-auto">
              {welcomeMessageTemplate}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
