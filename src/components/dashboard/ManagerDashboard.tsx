import React from 'react';
import {
  Building2,
  CheckSquare,
  Sparkles,
  KeyRound,
  FileCheck2,
  Calendar,
  Users2,
  Clock,
  ChevronRight,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { useAgency, PIPELINE_STAGE_LABELS } from '../../context/AgencyContext';

export const ManagerDashboard: React.FC = () => {
  const {
    clients,
    tasks,
    contents,
    accesses,
    meetings,
    users,
    currentUser,
    setActiveClientId,
    setActiveTab
  } = useAgency();

  const todayStr = new Date().toISOString().split('T')[0];

  // Gestor-specific calculations
  const assignedClients = clients.filter(
    (c) =>
      currentUser.role === 'ADMIN' ||
      c.team.accountManagerId === currentUser.id ||
      currentUser.assignedClientIds?.includes(c.id)
  );

  const pendingAccessValidations = accesses.filter((a) => a.status === 'RECEBIDO' || a.status === 'PENDENTE');
  const pendingApprovals = contents.filter((c) => c.status === 'AGUARDANDO_CLIENTE');
  const teamTasks = tasks.filter((t) => t.status !== 'CONCLUIDA' && t.status !== 'CANCELADA');
  const overdueTeamTasks = teamTasks.filter((t) => t.dueDate < todayStr);

  const overloadedCollabs = users.filter(
    (u) => u.workloadHours && u.maxCapacityHours && u.workloadHours > u.maxCapacityHours
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-5 rounded-lg bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 border border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
            <h1 className="text-xl font-bold text-white">Painel de Gestão & Contas</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Olá, <strong className="text-white">{currentUser.name}</strong>. Acompanhe cronogramas, distribuição de tarefas e desbloqueio de etapas.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('pipeline')}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-black text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center space-x-1.5 cursor-pointer"
          >
            <span>Acompanhar Pipeline</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 4 Cards Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          onClick={() => setActiveTab('clientes')}
          className="p-4 rounded-lg bg-gray-800 border border-gray-700 hover:border-gray-500 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-semibold uppercase">Clientes Atribuídos</span>
            <Building2 className="w-4 h-4 text-indigo-300" />
          </div>
          <div className="text-2xl font-black text-white">{assignedClients.length}</div>
          <p className="text-[11px] text-gray-400 mt-1">Sob sua supervisão direta</p>
        </div>

        <div
          onClick={() => setActiveTab('acessos')}
          className="p-4 rounded-lg bg-gray-800 border border-gray-700 hover:border-sky-500/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-semibold uppercase text-sky-400">Acessos Pendentes</span>
            <KeyRound className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-sky-400">{pendingAccessValidations.length}</div>
          <p className="text-[11px] text-gray-400 mt-1">Aguardando validação do gestor</p>
        </div>

        <div
          onClick={() => setActiveTab('conteudo')}
          className="p-4 rounded-lg bg-gray-800 border border-gray-700 hover:border-emerald-500/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-semibold uppercase text-emerald-400">Aprovações de Conteúdo</span>
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{pendingApprovals.length}</div>
          <p className="text-[11px] text-gray-400 mt-1">Com o cliente para validação</p>
        </div>

        <div
          onClick={() => setActiveTab('tarefas')}
          className="p-4 rounded-lg bg-gray-800 border border-gray-700 hover:border-amber-500/50 cursor-pointer transition-all"
        >
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-semibold uppercase text-amber-400">Tarefas da Equipe</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white">{teamTasks.length}</div>
          <p className="text-[11px] text-rose-400 mt-1">{overdueTeamTasks.length} tarefas atrasadas</p>
        </div>
      </div>

      {/* Overloaded Collaborators Warning Banner if any */}
      {overloadedCollabs.length > 0 && (
        <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-200">
                Alerta de Carga de Trabalho: {overloadedCollabs.map((u) => u.name).join(', ')} está com capacidade acima do limite ({overloadedCollabs[0].workloadHours}h / 40h).
              </p>
              <p className="text-[11px] text-amber-300/80">Redistribua tarefas na aba de Equipe para evitar gargalos operacionais.</p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('equipe')}
            className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-semibold shrink-0"
          >
            Ajustar Capacidade
          </button>
        </div>
      )}

      {/* Grid: Onboarding Checklist & Active Clients Health */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Onboarding Clients in Progress */}
        <div className="p-5 rounded-lg bg-gray-800 border border-gray-700 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-700">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-300" />
              <span>Clientes em Fase de Onboarding</span>
            </h2>
            <span className="text-xs text-gray-400">Ativação Obrigatória</span>
          </div>

          <div className="space-y-3">
            {assignedClients
              .filter((c) => c.status === 'ONBOARDING')
              .map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setActiveClientId(c.id);
                    setActiveTab('clientes');
                  }}
                  className="p-3.5 rounded-xl bg-gray-700 hover:bg-gray-600 border border-gray-600 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">{c.tradingName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-600/15 text-indigo-300 font-medium">
                        {PIPELINE_STAGE_LABELS[c.pipelineStage]}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-400">
                      Grupo: {c.whatsappGroup.status} • Onboarding: {c.onboardingProgress}%
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              ))}
          </div>
        </div>

        {/* Contents Awaiting Approval */}
        <div className="p-5 rounded-lg bg-gray-800 border border-gray-700 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-700">
            <h2 className="text-sm font-bold text-white flex items-center space-x-2">
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span>Conteúdos Aguardando Cliente</span>
            </h2>
            <button
              onClick={() => setActiveTab('conteudo')}
              className="text-xs text-indigo-300 hover:text-indigo-300 font-semibold"
            >
              Ver Todos
            </button>
          </div>

          <div className="space-y-3">
            {pendingApprovals.map((cnt) => {
              const client = clients.find((c) => c.id === cnt.clientId);
              return (
                <div
                  key={cnt.id}
                  onClick={() => {
                    setActiveClientId(cnt.clientId);
                    setActiveTab('conteudo');
                  }}
                  className="p-3 rounded-xl bg-gray-700 hover:bg-gray-600 border border-gray-600 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-semibold text-white">{cnt.title}</div>
                    <div className="text-[11px] text-gray-400">
                      {client?.tradingName} • {cnt.format} ({cnt.platform})
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">
                    Pendente
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
