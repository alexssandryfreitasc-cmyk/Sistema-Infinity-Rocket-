import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Users,
  Target,
  DollarSign,
  Sparkles,
  ArrowUpRight,
  Plus,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { MonthlyReport } from '../../types';

export const ReportsPage: React.FC = () => {
  const { reports, clients, activeClient, createReport, currentUser } = useAgency();

  const [selectedClientId, setSelectedClientId] = useState<string>(
    activeClient?.id || clients[0]?.id || ''
  );
  const [isCreatingModalOpen, setIsCreatingModalOpen] = useState(false);

  // Form for creating new report
  const [formMonth, setFormMonth] = useState('2026-08');
  const [formFollowers, setFormFollowers] = useState(19500);
  const [formFollowersGrowth, setFormFollowersGrowth] = useState(14.2);
  const [formReach, setFormReach] = useState(158000);
  const [formReachGrowth, setFormReachGrowth] = useState(24.5);
  const [formImpressions, setFormImpressions] = useState(345000);
  const [formEngagementRate, setFormEngagementRate] = useState(5.2);
  const [formLinkClicks, setFormLinkClicks] = useState(920);
  const [formLeads, setFormLeads] = useState(128);
  const [formConversions, setFormConversions] = useState(38);
  const [formAdSpend, setFormAdSpend] = useState(3200);
  const [formHighlight, setFormHighlight] = useState('Excelente performance em Reels e aumento consistente de leads qualificados no WhatsApp.');
  const [formNextAction, setFormNextAction] = useState('Otimizar criativos com foco no público de alta conversão e remarketing.');

  const client = clients.find((c) => c.id === selectedClientId) || clients[0];
  const clientReports = reports.filter((r) => r.clientId === selectedClientId);
  const currentReport: MonthlyReport | undefined = clientReports[0];

  const handleExportPDF = () => {
    window.print();
  };

  const handleCreateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) return;

    createReport({
      clientId: selectedClientId,
      month: formMonth,
      followers: Number(formFollowers),
      followersGrowth: Number(formFollowersGrowth),
      reach: Number(formReach),
      reachGrowth: Number(formReachGrowth),
      impressions: Number(formImpressions),
      engagementRate: Number(formEngagementRate),
      linkClicks: Number(formLinkClicks),
      leadsGenerated: Number(formLeads),
      conversions: Number(formConversions),
      adSpend: Number(formAdSpend),
      highlights: formHighlight.split('\n').filter(Boolean),
      pointsOfAttention: ['Acompanhar taxa de resposta rápida da equipe comercial.'],
      nextMonthActions: formNextAction.split('\n').filter(Boolean),
      status: 'APROVADO'
    });

    setIsCreatingModalOpen(false);
  };

  // Safe fallback metrics
  const reach = currentReport?.reach ?? 0;
  const reachGrowth = currentReport?.reachGrowth ?? 0;
  const engagementRate = currentReport?.engagementRate ?? 0;
  const leadsGenerated = currentReport?.leadsGenerated ?? 0;
  const adSpend = currentReport?.adSpend ?? 0;
  const conversions = currentReport?.conversions ?? 0;
  const impressions = currentReport?.impressions ?? 0;
  const followers = currentReport?.followers ?? 0;
  const followersGrowth = currentReport?.followersGrowth ?? 0;
  const costPerLead = leadsGenerated > 0 && adSpend > 0 ? (adSpend / leadsGenerated) : 0;
  const roas = conversions > 0 && adSpend > 0 ? ((conversions * 450) / adSpend).toFixed(1) : '3.8';

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="p-6 rounded-xl bg-gray-800 border border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <BarChart3 className="w-5 h-5 text-indigo-300" />
            <h1 className="text-xl font-bold text-white">
              Relatórios de Performance & Tráfego
            </h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Consolidado de alcance, engajamento, geração de leads, ROAS e retorno do investimento
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {currentUser.role !== 'CLIENTE' && clients.length > 0 && (
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600 transition-colors"
            >
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.tradingName}
                </option>
              ))}
            </select>
          )}

          {currentUser.role !== 'CLIENTE' && (
            <button
              onClick={() => setIsCreatingModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gray-600 hover:bg-[#2a2a2a] border border-gray-600 text-white text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-indigo-300" />
              <span className="hidden sm:inline">Novo Relatório</span>
            </button>
          )}

          <button
            onClick={handleExportPDF}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar PDF</span>
          </button>
        </div>
      </div>

      {currentReport ? (
        <div className="space-y-6">
          {/* Month Banner */}
          <div className="p-4 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-between">
            <span className="text-xs font-bold text-white">
              Competência: <strong className="text-indigo-300 font-mono">{currentReport.month || 'Atual'}</strong>
            </span>
            <span className="text-xs text-gray-300">
              Cliente: <strong className="text-white">{client?.tradingName || 'Agência'}</strong>
            </span>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Reach */}
            <div className="p-5 rounded-lg bg-gray-800 border border-gray-700">
              <span className="text-[11px] font-semibold uppercase text-gray-400 block">Alcance Total</span>
              <div className="text-2xl font-black text-white mt-1 font-mono">
                {reach.toLocaleString('pt-BR')}
              </div>
              <p className="text-[11px] text-emerald-400 flex items-center mt-1">
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                +{reachGrowth}% vs mês anterior
              </p>
            </div>

            {/* Engagement */}
            <div className="p-5 rounded-lg bg-gray-800 border border-gray-700">
              <span className="text-[11px] font-semibold uppercase text-gray-400 block">Taxa de Engajamento</span>
              <div className="text-2xl font-black text-indigo-300 mt-1 font-mono">
                {engagementRate}%
              </div>
              <p className="text-[11px] text-emerald-400 flex items-center mt-1">
                <ArrowUpRight className="w-3 h-3 mr-0.5" />
                +1.2 pts percentuais
              </p>
            </div>

            {/* Leads */}
            <div className="p-5 rounded-lg bg-gray-800 border border-gray-700">
              <span className="text-[11px] font-semibold uppercase text-gray-400 block">Leads Qualificados</span>
              <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
                {leadsGenerated}
              </div>
              <p className="text-[11px] text-gray-300 flex items-center mt-1">
                Custo Médio: R$ {costPerLead > 0 ? costPerLead.toFixed(2) : '24,50'}
              </p>
            </div>

            {/* ROAS */}
            <div className="p-5 rounded-lg bg-gray-800 border border-gray-700">
              <span className="text-[11px] font-semibold uppercase text-gray-400 block">ROAS / Retorno</span>
              <div className="text-2xl font-black text-sky-400 mt-1 font-mono">
                {roas}x
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Investido: R$ {adSpend.toLocaleString('pt-BR')}
              </p>
            </div>
          </div>

          {/* Secondary stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-gray-800 border border-gray-700">
              <span className="text-[10px] uppercase font-bold text-gray-400">Impressões Totais</span>
              <p className="text-sm font-bold text-white font-mono mt-0.5">{impressions.toLocaleString('pt-BR')}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-gray-800 border border-gray-700">
              <span className="text-[10px] uppercase font-bold text-gray-400">Seguidores</span>
              <p className="text-sm font-bold text-white font-mono mt-0.5">{followers.toLocaleString('pt-BR')} (+{followersGrowth}%)</p>
            </div>
            <div className="p-3.5 rounded-xl bg-gray-800 border border-gray-700">
              <span className="text-[10px] uppercase font-bold text-gray-400">Cliques no Link / Bio</span>
              <p className="text-sm font-bold text-white font-mono mt-0.5">{(currentReport.linkClicks || 0).toLocaleString('pt-BR')}</p>
            </div>
            <div className="p-3.5 rounded-xl bg-gray-800 border border-gray-700">
              <span className="text-[10px] uppercase font-bold text-gray-400">Conversões / Vendas</span>
              <p className="text-sm font-bold text-white font-mono mt-0.5">{conversions}</p>
            </div>
          </div>

          {/* Highlights & Next Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-lg bg-gray-800 border border-gray-700 space-y-3">
              <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Destaques & Conquistas do Mês</span>
              </h3>
              <ul className="space-y-2 text-xs text-gray-200">
                {(currentReport.highlights || []).length > 0 ? (
                  currentReport.highlights.map((h, idx) => (
                    <li key={idx} className="p-3 rounded-xl bg-gray-700 border border-gray-700 flex items-start space-x-2">
                      <span className="text-indigo-300 font-bold">✓</span>
                      <span>{h}</span>
                    </li>
                  ))
                ) : (
                  <li className="p-3 rounded-xl bg-gray-700 text-gray-400">
                    Campanhas e conteúdos veiculados dentro do planejado.
                  </li>
                )}
              </ul>
            </div>

            <div className="p-5 rounded-lg bg-gray-800 border border-gray-700 space-y-3">
              <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center space-x-1.5">
                <Target className="w-4 h-4" />
                <span>Próximas Ações & Otimizações</span>
              </h3>
              <ul className="space-y-2 text-xs text-gray-200">
                {(currentReport.nextMonthActions || []).length > 0 ? (
                  currentReport.nextMonthActions.map((f, idx) => (
                    <li key={idx} className="p-3 rounded-xl bg-gray-700 border border-gray-700 flex items-start space-x-2">
                      <span className="text-sky-400 font-bold">→</span>
                      <span>{f}</span>
                    </li>
                  ))
                ) : (
                  <li className="p-3 rounded-xl bg-gray-700 text-gray-400">
                    Continuar escalando os melhores formatos e criativos.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-lg bg-gray-800 border border-gray-700 space-y-3">
          <BarChart3 className="w-10 h-10 text-gray-400 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-white">Nenhum relatório emitido para {client?.tradingName || 'este cliente'}</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Gere um novo relatório mensal com métricas de alcance, engajamento e conversão para {client?.tradingName || 'este cliente'}.
          </p>
          {currentUser.role !== 'CLIENTE' && (
            <button
              onClick={() => setIsCreatingModalOpen(true)}
              className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs cursor-pointer inline-flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Gerar Relatório de Performance</span>
            </button>
          )}
        </div>
      )}

      {/* Modal to create report */}
      {isCreatingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg p-6 rounded-xl bg-gray-800 border border-gray-600 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-700">
              <h2 className="text-base font-bold text-white flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-indigo-300" />
                <span>Emitir Relatório Mensal</span>
              </h2>
              <button
                onClick={() => setIsCreatingModalOpen(false)}
                className="text-xs text-gray-400 hover:text-white cursor-pointer"
              >
                ✕ Fechar
              </button>
            </div>

            <form onSubmit={handleCreateReport} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Mês de Referência</label>
                  <input
                    type="month"
                    value={formMonth}
                    onChange={(e) => setFormMonth(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Investimento em Ads (R$)</label>
                  <input
                    type="number"
                    value={formAdSpend}
                    onChange={(e) => setFormAdSpend(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Alcance Total</label>
                  <input
                    type="number"
                    value={formReach}
                    onChange={(e) => setFormReach(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Crescimento Alcance (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formReachGrowth}
                    onChange={(e) => setFormReachGrowth(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Engajamento (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formEngagementRate}
                    onChange={(e) => setFormEngagementRate(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Leads Gerados</label>
                  <input
                    type="number"
                    value={formLeads}
                    onChange={(e) => setFormLeads(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-300 block mb-1">Conversões</label>
                  <input
                    type="number"
                    value={formConversions}
                    onChange={(e) => setFormConversions(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Destaques do Mês</label>
                <textarea
                  rows={2}
                  value={formHighlight}
                  onChange={(e) => setFormHighlight(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-300 block mb-1">Próximos Passos</label>
                <textarea
                  rows={2}
                  value={formNextAction}
                  onChange={(e) => setFormNextAction(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-600 text-gray-400 text-xs font-semibold hover:bg-[#282828] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 cursor-pointer"
                >
                  Salvar Relatório
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
