import React from 'react';
import {
  Users,
  Sparkles,
  AlertTriangle,
  Clock,
  CheckSquare,
  FileCheck2,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  ChevronRight,
  Activity,
  Plus
} from 'lucide-react';
import { useAgency, PIPELINE_STAGE_LABELS } from '../../context/AgencyContext';

interface AdminDashboardProps {
  onOpenNewClient: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onOpenNewClient }) => {
  const {
    clients,
    tasks,
    contents,
    financials,
    meetings,
    setActiveClientId,
    setActiveTab,
    currentUser
  } = useAgency();

  // Date helpers
  const todayStr = new Date().toISOString().split('T')[0];

  // Metric computations
  const activeClients = clients.filter((c) => c.status === 'ATIVO');
  const onboardingClients = clients.filter((c) => c.status === 'ONBOARDING');
  const atRiskClients = clients.filter((c) => c.status === 'EM_RISCO' || c.healthScore < 60);

  const overdueTasks = tasks.filter(
    (t) => t.dueDate < todayStr && t.status !== 'CONCLUIDA' && t.status !== 'CANCELADA'
  );
  const todayTasks = tasks.filter(
    (t) => t.dueDate === todayStr && t.status !== 'CONCLUIDA' && t.status !== 'CANCELADA'
  );
  const pendingApprovals = contents.filter((c) => c.status === 'AGUARDANDO_CLIENTE');

  // Meetings this week
  const upcomingMeetings = meetings.filter((m) => m.status === 'AGENDADA');

  // Financial Metrics
  const totalMRR = financials.reduce((acc, f) => acc + (f.status !== 'CANCELADO' ? f.monthlyValue : 0), 0);
  const overdueFinancials = financials.filter((f) => f.status === 'ATRASADO');

  // Renewals in next 30 days
  const now = new Date();
  const thirtyDaysAhead = new Date();
  thirtyDaysAhead.setDate(now.getDate() + 30);
  const upcomingRenewals = clients.filter((c) => {
    const ren = new Date(c.renewalDate);
    return ren >= now && ren <= thirtyDaysAhead;
  });

  // Pipeline distribution counts
  const pipelineCounts = {
    'Novo Cliente': clients.filter((c) => c.pipelineStage === 'NOVO_CLIENTE' || c.pipelineStage === 'BOAS_VINDAS').length,
    'Onboarding & Acessos': clients.filter((c) => ['GRUPO_WHATSAPP', 'BRIEFING', 'ACESSOS'].includes(c.pipelineStage)).length,
    'Estratégia & Planejamento': clients.filter((c) => ['ESTRATÉGIA', 'PLANEJAMENTO'].includes(c.pipelineStage)).length,
    'Produção': clients.filter((c) => c.pipelineStage === 'PRODUÇÃO').length,
    'Aprovação': clients.filter((c) => c.pipelineStage === 'APROVAÇÃO').length,
    'Ativo / Recorrência': clients.filter((c) => ['PUBLICAÇÃO', 'ANÁLISE', 'RELATÓRIO', 'RECORRÊNCIA'].includes(c.pipelineStage)).length,
    'Em Risco': atRiskClients.length
  };

  const healthyClientsCount = clients.filter((c) => c.healthScore >= 80).length;
  const warningClientsCount = clients.filter((c) => c.healthScore >= 60 && c.healthScore < 80).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Operational Slogan */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
            Painel Executivo • AgencyOS
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            "Nenhum cliente pode ficar esquecido." Pipeline operacional, riscos e receitas em tempo real.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('pipeline')}
            className="px-4 py-2 bg-gray-800 border border-gray-700 text-gray-300 rounded-md text-sm font-medium hover:bg-gray-700 hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
          >
            <span>Ver Pipeline Kanban</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid (8 Operational Metrics matching executive spec) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Clientes Ativos */}
        <div
          onClick={() => setActiveTab('clientes')}
          className="bg-gray-800 rounded-lg p-5 border border-gray-700 flex flex-col justify-between cursor-pointer hover:border-gray-500 transition-colors"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Clientes Ativos</h3>
            <Building2 className="w-4 h-4 text-gray-500" />
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-2">{activeClients.length}</div>
            <div className="flex items-center text-sm">
              <TrendingUp className="w-3.5 h-3.5 text-green-400 mr-1.5" />
              <span className="text-green-400">Total: {clients.length} no sistema</span>
            </div>
          </div>
        </div>

        {/* 2. Em Onboarding */}
        <div
          onClick={() => setActiveTab('pipeline')}
          className="bg-gray-800 rounded-lg p-5 border border-gray-700 flex flex-col justify-between cursor-pointer hover:border-gray-500 transition-colors"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Em Onboarding</h3>
            <Sparkles className="w-4 h-4 text-yellow-500" />
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-2">{onboardingClients.length}</div>
            <p className="text-sm text-gray-400">Etapa de ativação rápida</p>
          </div>
        </div>

        {/* 3. Em Risco / Churn */}
        <div
          onClick={() => setActiveTab('clientes')}
          className="bg-red-900/20 rounded-lg p-5 border border-red-900/50 flex flex-col justify-between cursor-pointer hover:border-red-500 transition-colors"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider">Em Risco / Churn</h3>
            <AlertTriangle className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <div className="text-3xl font-bold text-red-400 mb-2">{atRiskClients.length}</div>
            <p className="text-sm text-red-400/80">Requer intervenção imediata</p>
          </div>
        </div>

        {/* 4. Tarefas Atrasadas */}
        <div
          onClick={() => setActiveTab('tarefas')}
          className="bg-gray-800 rounded-lg p-5 border border-gray-700 flex flex-col justify-between cursor-pointer hover:border-gray-500 transition-colors"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tarefas Atrasadas</h3>
            <Clock className="w-4 h-4 text-yellow-500" />
          </div>
          <div>
            <div className="text-3xl font-bold text-yellow-500 mb-2">{overdueTasks.length}</div>
            <p className="text-sm text-gray-400">De {tasks.length} tarefas totais</p>
          </div>
        </div>

        {/* 5. Aguardando Cliente */}
        <div
          onClick={() => setActiveTab('conteudo')}
          className="bg-gray-800 rounded-lg p-5 border border-gray-700 flex flex-col justify-between cursor-pointer hover:border-gray-500 transition-colors"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Aguardando Cliente</h3>
            <FileCheck2 className="w-4 h-4 text-green-400" />
          </div>
          <div>
            <div className="text-3xl font-bold text-green-400 mb-2">{pendingApprovals.length}</div>
            <p className="text-sm text-gray-400">Conteúdos em aprovação</p>
          </div>
        </div>

        {/* 6. Reuniões */}
        <div
          onClick={() => setActiveTab('calendario')}
          className="bg-gray-800 rounded-lg p-5 border border-gray-700 flex flex-col justify-between cursor-pointer hover:border-gray-500 transition-colors"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Reuniões</h3>
            <Calendar className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-2">{upcomingMeetings.length}</div>
            <p className="text-sm text-gray-400">Alinhamentos agendados</p>
          </div>
        </div>

        {/* 7. Receita Mensal (MRR) */}
        <div
          onClick={() => setActiveTab('financeiro')}
          className="bg-gray-800 rounded-lg p-5 border border-gray-700 flex flex-col justify-between cursor-pointer hover:border-gray-500 transition-colors"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Receita Mensal (MRR)</h3>
            <DollarSign className="w-4 h-4 text-gray-500" />
          </div>
          <div>
            <div className="text-3xl font-bold text-yellow-500 mb-2">
              R$ {totalMRR.toLocaleString('pt-BR')}
            </div>
            <p className="text-sm text-gray-400">Recorrência ativa</p>
          </div>
        </div>

        {/* 8. Inadimplência */}
        <div
          onClick={() => setActiveTab('financeiro')}
          className="bg-red-900/10 rounded-lg p-5 border border-red-900/30 flex flex-col justify-between cursor-pointer hover:border-red-500/50 transition-colors"
        >
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xs font-semibold text-red-400 uppercase tracking-wider">Inadimplência</h3>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <div className="text-3xl font-bold text-red-400 mb-2">{overdueFinancials.length}</div>
            <p className="text-sm text-red-400/80">Cobrança pendente</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Pipeline Breakdown & Health Score Traffic Light */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Operational Pipeline Breakdown (Etapas) */}
        <div className="lg:col-span-2 bg-gray-800 rounded-lg border border-gray-700 p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-gray-400" />
                Distribuição de Clientes por Etapa do Pipeline
              </h3>
              <p className="text-sm text-gray-400">Acompanhamento contínuo de fluxo operacional</p>
            </div>
            <button
              onClick={() => setActiveTab('pipeline')}
              className="text-sm text-yellow-500 hover:text-yellow-400 font-medium flex items-center gap-1 cursor-pointer"
            >
              <span>Ver Kanban Completo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-5">
            {Object.entries(pipelineCounts).map(([stageName, count]) => {
              const percentage = clients.length > 0 ? Math.round((count / clients.length) * 100) : 0;
              return (
                <div key={stageName}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-300 font-medium">{stageName}</span>
                    <span className="text-gray-400">
                      {count} cliente(s) • <span className="text-white font-semibold">{percentage}%</span>
                    </span>
                  </div>
                  <div className="w-full bg-gray-900 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        stageName === 'Em Risco'
                          ? 'bg-red-500'
                          : stageName === 'Aprovação'
                          ? 'bg-yellow-500'
                          : stageName === 'Onboarding & Acessos'
                          ? 'bg-blue-500'
                          : stageName === 'Produção'
                          ? 'bg-yellow-600'
                          : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.max(percentage > 0 ? 5 : 0, percentage)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Operational Traffic Light / Semáforo da Agência */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
              <ShieldCheck className="w-5 h-5 text-gray-400" />
              Semáforo Operacional
            </h3>

            <div className="space-y-4">
              {/* Healthy */}
              <div className="p-4 rounded-lg bg-green-900/10 border border-green-900/30 flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                <div>
                  <h4 className="text-sm font-semibold text-green-400">
                    Saudáveis (80-100): {healthyClientsCount} clientes
                  </h4>
                  <p className="text-xs text-green-400/70 mt-1 leading-relaxed">
                    Fluxo em dia, aprovações rápidas e pagamentos regulares.
                  </p>
                </div>
              </div>

              {/* Warning */}
              <div className="p-4 rounded-lg bg-yellow-900/10 border border-yellow-900/30 flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(234,179,8,0.6)]"></div>
                <div>
                  <h4 className="text-sm font-semibold text-yellow-500">
                    Atenção (60-79): {warningClientsCount} clientes
                  </h4>
                  <p className="text-xs text-yellow-500/70 mt-1 leading-relaxed">
                    Onboarding com acessos pendentes ou tarefas próximas do prazo.
                  </p>
                </div>
              </div>

              {/* Critical */}
              <div className="p-4 rounded-lg bg-red-900/10 border border-red-900/30 flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div>
                <div>
                  <h4 className="text-sm font-semibold text-red-400">
                    Risco Crítico (&lt;60): {atRiskClients.length} cliente(s)
                  </h4>
                  <p className="text-xs text-red-400/70 mt-1 leading-relaxed">
                    Tarefas atrasadas ou conteúdos sem aprovação há dias.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick client direct link if at risk */}
          {atRiskClients.length > 0 && (
            <button
              onClick={() => {
                setActiveClientId(atRiskClients[0].id);
                setActiveTab('clientes');
              }}
              className="mt-6 w-full py-3 px-4 bg-red-900/30 hover:bg-red-900/50 border border-red-500/50 text-red-300 rounded-lg text-sm font-medium transition-colors flex items-center justify-between group cursor-pointer"
            >
              <span>Resolver {atRiskClients[0].tradingName}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom Priority Table: Clientes com Acompanhamento Imediato */}
      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-700">
          <div>
            <h2 className="text-base font-bold text-white">Controle Operacional dos Clientes</h2>
            <p className="text-xs text-gray-400">Visão unificada de estágio, health score e responsáveis</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          {clients.length === 0 ? (
            <div className="p-8 text-center space-y-2">
              <Building2 className="w-8 h-8 text-gray-600 mx-auto" />
              <p className="text-xs font-semibold text-gray-300">Nenhum cliente cadastrado no sistema</p>
              <p className="text-[11px] text-gray-500">
                Clique no botão "Novo Cliente" no cabeçalho acima para iniciar o onboarding do seu primeiro cliente real.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-700 text-gray-400 uppercase text-[10px] tracking-wider">
                  <th className="pb-3 font-semibold">Cliente & Empresa</th>
                  <th className="pb-3 font-semibold">Segmento</th>
                  <th className="pb-3 font-semibold">Etapa Atual</th>
                  <th className="pb-3 font-semibold">Health Score</th>
                  <th className="pb-3 font-semibold">Plano</th>
                  <th className="pb-3 font-semibold">Status Financeiro</th>
                  <th className="pb-3 font-semibold text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#374151]">
                {clients.map((c) => {
                  const fin = financials.find((f) => f.clientId === c.id);
                  return (
                    <tr key={c.id} className="hover:bg-gray-700/50 transition-colors">
                      <td className="py-3 font-semibold text-white">
                        <div>{c.tradingName}</div>
                        <div className="text-[11px] text-gray-400 font-normal">{c.contactName}</div>
                      </td>
                      <td className="py-3 text-gray-300">{c.segment}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full bg-gray-900 border border-gray-700 text-[11px] font-medium text-gray-300">
                          {PIPELINE_STAGE_LABELS[c.pipelineStage]}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              c.healthScore >= 80
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : c.healthScore >= 60
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {c.healthScore} pts
                          </span>
                        </div>
                      </td>
                      <td className="py-3 font-medium text-yellow-500">
                        {c.plan} (R$ {c.monthlyValue.toLocaleString('pt-BR')})
                      </td>
                      <td className="py-3">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                            fin?.status === 'ATIVO'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : fin?.status === 'ATRASADO'
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-gray-800 text-gray-400'
                          }`}
                        >
                          {fin?.status || 'REGULAR'}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => {
                            setActiveClientId(c.id);
                            setActiveTab('clientes');
                          }}
                          className="px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-600/40 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Ver Projeto
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
