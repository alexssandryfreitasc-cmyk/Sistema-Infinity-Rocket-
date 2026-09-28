import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronRight,
  MessageSquare,
  FileText,
  KeyRound,
  Calendar,
  Layers,
  Send,
  ShieldCheck
} from 'lucide-react';
import { useAgency, PIPELINE_STAGE_LABELS } from '../../context/AgencyContext';
import { Client, PipelineStage } from '../../types';
import { WhatsAppStep } from './WhatsAppStep';
import { BriefingForm } from './BriefingForm';
import { AccessChecklistVault } from './AccessChecklistVault';

interface ClientOnboardingFlowProps {
  client: Client;
}

export const ClientOnboardingFlow: React.FC<ClientOnboardingFlowProps> = ({ client }) => {
  const { advancePipelineStage, briefings, accesses, meetings, tasks, setActiveTab } = useAgency();

  const clientBriefing = briefings[client.id];
  const clientAccesses = accesses.filter((a) => a.clientId === client.id);
  const pendingAccessCount = clientAccesses.filter((a) => a.status === 'PENDENTE').length;

  const onboardingSteps: {
    stage: PipelineStage;
    title: string;
    description: string;
    icon: any;
    isDone: boolean;
    isCurrent: boolean;
  }[] = [
    {
      stage: 'BOAS_VINDAS',
      title: '1. Boas-Vindas & Acesso ao Portal',
      description: 'Envio de e-mail com credenciais e link do portal oficial do cliente.',
      icon: Sparkles,
      isDone: client.pipelineStage !== 'NOVO_CLIENTE',
      isCurrent: client.pipelineStage === 'BOAS_VINDAS' || client.pipelineStage === 'NOVO_CLIENTE'
    },
    {
      stage: 'GRUPO_WHATSAPP',
      title: '2. Criação do Grupo no WhatsApp',
      description: 'Grupo padronizado com regras de atendimento e equipe da conta.',
      icon: MessageSquare,
      isDone: client.whatsappGroup.status === 'CONFIRMADO',
      isCurrent: client.pipelineStage === 'GRUPO_WHATSAPP'
    },
    {
      stage: 'BRIEFING',
      title: '3. Preenchimento do Briefing',
      description: '16 diretrizes de negócio, personas, tom de voz e diferenciais.',
      icon: FileText,
      isDone: !!clientBriefing?.isComplete,
      isCurrent: client.pipelineStage === 'BRIEFING'
    },
    {
      stage: 'ACESSOS',
      title: '4. Central de Acessos & Validação',
      description: 'Coleta de Meta Business, Google Ads e validação pelo gestor.',
      icon: KeyRound,
      isDone: clientAccesses.length > 0 && pendingAccessCount === 0,
      isCurrent: client.pipelineStage === 'ACESSOS'
    },
    {
      stage: 'ESTRATÉGIA',
      title: '5. Estratégia & Reunião de Kickoff',
      description: 'Alinhamento estratégico com o cliente e definição de personas.',
      icon: Calendar,
      isDone: ['PLANEJAMENTO', 'PRODUÇÃO', 'APROVAÇÃO', 'PUBLICAÇÃO', 'ANÁLISE', 'RELATÓRIO', 'RECORRÊNCIA'].includes(client.pipelineStage),
      isCurrent: client.pipelineStage === 'ESTRATÉGIA'
    },
    {
      stage: 'PRODUÇÃO',
      title: '6. Produção do Primeiro Lote',
      description: 'Criação das artes, carrosséis, vídeos e roteiros.',
      icon: Layers,
      isDone: ['APROVAÇÃO', 'PUBLICAÇÃO', 'ANÁLISE', 'RELATÓRIO', 'RECORRÊNCIA'].includes(client.pipelineStage),
      isCurrent: client.pipelineStage === 'PRODUÇÃO' || client.pipelineStage === 'PLANEJAMENTO'
    },
    {
      stage: 'APROVAÇÃO',
      title: '7. Aprovação pelo Cliente',
      description: 'Validação de peças no portal em 1 clique.',
      icon: CheckCircle2,
      isDone: ['PUBLICAÇÃO', 'ANÁLISE', 'RELATÓRIO', 'RECORRÊNCIA'].includes(client.pipelineStage),
      isCurrent: client.pipelineStage === 'APROVAÇÃO'
    },
    {
      stage: 'RECORRÊNCIA',
      title: '8. Ativação da Operação Recorrente',
      description: 'Publicações no ar, gestão de tráfego ativa e relatórios mensais.',
      icon: ShieldCheck,
      isDone: client.pipelineStage === 'RECORRÊNCIA',
      isCurrent: client.pipelineStage === 'RECORRÊNCIA'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Onboarding Progress Summary Banner */}
      <div className="p-6 rounded-lg bg-gray-800 border border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-300" />
            <h2 className="text-base font-bold text-white">
              Fluxo de Ativação do Cliente (Onboarding)
            </h2>
          </div>
          <p className="text-xs text-gray-400">
            Acompanhe o desbloqueio passo a passo para garantir a transição perfeita para a operação
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <span className="text-xs font-bold text-gray-300 block">Progresso Geral:</span>
            <span className="text-sm font-black text-indigo-300 font-mono">
              {client.onboardingProgress}% Concluído
            </span>
          </div>
        </div>
      </div>

      {/* 8 Step Pipeline Progression Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {onboardingSteps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-lg border transition-all flex flex-col justify-between space-y-3 ${
                step.isDone
                  ? 'bg-gray-800 border-emerald-500/30'
                  : step.isCurrent
                  ? 'bg-gray-800 border-indigo-600/60 shadow-lg shadow-[#5850ec]/5'
                  : 'bg-gray-800 border-gray-700 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div
                    className={`p-2 rounded-xl ${
                      step.isDone
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : step.isCurrent
                        ? 'bg-indigo-600/20 text-indigo-300'
                        : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  {step.isDone ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                      Concluído
                    </span>
                  ) : step.isCurrent ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-600/20 text-indigo-300 border border-indigo-600/30 animate-pulse">
                      Em Andamento
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold text-gray-400">Pendente</span>
                  )}
                </div>

                <div className="mt-3">
                  <h3 className="text-xs font-bold text-white">{step.title}</h3>
                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{step.description}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Embedded Operational Action Step based on current state */}
      <div className="space-y-6">
        <WhatsAppStep client={client} />
      </div>
    </div>
  );
};
