import React, { useState } from 'react';
import {
  GitPullRequest,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Building2,
  Users2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useAgency, PIPELINE_STAGE_LABELS } from '../../context/AgencyContext';
import { PipelineStage, Client } from '../../types';

interface PipelineKanbanViewProps {
  focusedClientId?: string;
}

const ALL_STAGES: PipelineStage[] = [
  'NOVO_CLIENTE',
  'BOAS_VINDAS',
  'GRUPO_WHATSAPP',
  'BRIEFING',
  'ACESSOS',
  'ESTRATÉGIA',
  'PLANEJAMENTO',
  'PRODUÇÃO',
  'APROVAÇÃO',
  'PUBLICAÇÃO',
  'ANÁLISE',
  'RELATÓRIO',
  'RECORRÊNCIA'
];

export const PipelineKanbanView: React.FC<PipelineKanbanViewProps> = ({ focusedClientId }) => {
  const {
    clients,
    advancePipelineStage,
    setActiveClientId,
    setActiveTab,
    users,
    currentUser
  } = useAgency();

  const [selectedClient, setSelectedClient] = useState<string>(focusedClientId || 'TODOS');
  const [blockedAlert, setBlockedAlert] = useState<{ clientName: string; reason: string } | null>(null);

  const displayClients = clients.filter((c) =>
    selectedClient === 'TODOS' ? true : c.id === selectedClient
  );

  const handleAdvance = (client: Client) => {
    const currentIndex = ALL_STAGES.indexOf(client.pipelineStage);
    if (currentIndex < ALL_STAGES.length - 1) {
      const nextStage = ALL_STAGES[currentIndex + 1];
      const result = advancePipelineStage(client.id, nextStage);
      if (!result.success && result.reason) {
        setBlockedAlert({ clientName: client.tradingName, reason: result.reason });
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="p-5 rounded-lg bg-gray-800 border border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <GitPullRequest className="w-5 h-5 text-indigo-300" />
            <h1 className="text-base sm:text-lg font-bold text-white">
              Pipeline Operacional da Agência (13 Etapas)
            </h1>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Fluxo operacional com travas automáticas (Gating Rules) para garantir qualidade e sem etapas puladas
          </p>
        </div>

        {/* Filter by client */}
        <div className="flex items-center space-x-2">
          <label className="text-xs text-gray-400 hidden sm:block">Filtrar:</label>
          <select
            value={selectedClient}
            onChange={(e) => setSelectedClient(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
          >
            <option value="TODOS">Todos os Clientes</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.tradingName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Blocked Stage Gating Alert Modal / Toast */}
      {blockedAlert && (
        <div className="p-4 rounded-lg bg-rose-950/50 border border-rose-500/50 text-rose-200 text-xs flex items-center justify-between animate-in fade-in shadow-xl">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-rose-100">
                Avanço Bloqueado para {blockedAlert.clientName} (Trava Operacional)
              </p>
              <p className="text-rose-300/90 mt-0.5">{blockedAlert.reason}</p>
            </div>
          </div>
          <button
            onClick={() => setBlockedAlert(null)}
            className="px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 text-xs font-semibold cursor-pointer"
          >
            Entendido
          </button>
        </div>
      )}

      {/* Kanban Board Container with horizontal scroll */}
      <div className="overflow-x-auto pb-4 pt-1">
        <div className="flex items-start space-x-3 min-w-max">
          {ALL_STAGES.map((stage, idx) => {
            const stageClients = displayClients.filter((c) => c.pipelineStage === stage);

            return (
              <div
                key={stage}
                className="w-72 rounded-lg bg-gray-800 border border-gray-700 p-3.5 flex flex-col space-y-3 shrink-0"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-gray-700">
                  <div className="flex items-center space-x-1.5 truncate">
                    <span className="w-5 h-5 rounded-full bg-gray-700 border border-gray-600 text-gray-300 font-mono text-[10px] font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs font-bold text-white truncate">
                      {PIPELINE_STAGE_LABELS[stage]}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-gray-700 border border-gray-600 text-indigo-300">
                    {stageClients.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="space-y-2.5 min-h-[160px]">
                  {stageClients.length === 0 ? (
                    <div className="h-24 rounded-xl border border-dashed border-gray-700 flex items-center justify-center text-[11px] text-gray-400">
                      Nenhum cliente nesta etapa
                    </div>
                  ) : (
                    stageClients.map((client) => {
                      const manager = users.find((u) => u.id === client.team.accountManagerId);
                      return (
                        <div
                          key={client.id}
                          className="p-3.5 rounded-xl bg-gray-700 border border-gray-600 hover:border-gray-600 transition-all space-y-2.5 shadow-sm group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                              {client.tradingName}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                client.healthScore >= 80
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : client.healthScore >= 60
                                  ? 'bg-amber-500/20 text-amber-400'
                                  : 'bg-rose-500/20 text-rose-400'
                              }`}
                            >
                              {client.healthScore} pts
                            </span>
                          </div>

                          <div className="text-[11px] text-gray-400 flex items-center justify-between">
                            <span>{client.segment}</span>
                            <span className="font-mono text-gray-300">R$ {client.monthlyValue.toLocaleString('pt-BR')}</span>
                          </div>

                          {/* Manager & Action */}
                          <div className="pt-2 border-t border-gray-700 flex items-center justify-between">
                            <div className="flex items-center space-x-1.5 text-[11px] text-gray-400 truncate">
                              {manager && (
                                <img
                                  src={manager.avatar}
                                  alt={manager.name}
                                  className="w-4 h-4 rounded-full border border-gray-600"
                                />
                              )}
                              <span className="truncate">{manager?.name.split(' ')[0] || 'Equipe'}</span>
                            </div>

                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => {
                                  setActiveClientId(client.id);
                                  setActiveTab('clientes');
                                }}
                                className="p-1 rounded bg-gray-600 hover:bg-[#333333] text-gray-200 text-[10px] cursor-pointer"
                                title="Ver Projeto"
                              >
                                Ver
                              </button>

                              {idx < ALL_STAGES.length - 1 && (
                                <button
                                  onClick={() => handleAdvance(client)}
                                  className="p-1 rounded bg-indigo-600 hover:bg-indigo-500 text-black text-[10px] flex items-center space-x-0.5 font-bold cursor-pointer"
                                  title={`Avançar para ${PIPELINE_STAGE_LABELS[ALL_STAGES[idx + 1]]}`}
                                >
                                  <span>Avançar</span>
                                  <ChevronRight className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
