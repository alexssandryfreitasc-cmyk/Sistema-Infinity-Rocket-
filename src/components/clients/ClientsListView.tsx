import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  DollarSign,
  UserCheck,
  CheckCircle2,
  Clock,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { useAgency, PIPELINE_STAGE_LABELS } from '../../context/AgencyContext';
import { ClientStatus } from '../../types';

interface ClientsListViewProps {
  onOpenNewClient: () => void;
}

export const ClientsListView: React.FC<ClientsListViewProps> = ({ onOpenNewClient }) => {
  const {
    clients,
    financials,
    users,
    setActiveClientId,
    setActiveTab,
    setCurrentUser,
    currentUser
  } = useAgency();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');
  const [viewMode, setViewMode] = useState<'CARDS' | 'TABLE'>('CARDS');

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.companyName.toLowerCase().includes(search.toLowerCase()) ||
      c.tradingName.toLowerCase().includes(search.toLowerCase()) ||
      c.segment.toLowerCase().includes(search.toLowerCase()) ||
      c.contactName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'TODOS'
        ? true
        : statusFilter === 'EM_RISCO'
        ? c.status === 'EM_RISCO' || c.healthScore < 60
        : c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-indigo-300" />
            <span>Gestão de Clientes & Projetos ({filteredClients.length})</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Acompanhe saúde operacional, equipe atribuída, contratos e evolução de onboarding
          </p>
        </div>

        {(currentUser.role === 'ADMIN' || currentUser.role === 'GESTOR') && (
          <button
            onClick={onOpenNewClient}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center space-x-1.5 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Cliente</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-lg bg-gray-800 border border-gray-700 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, segmento, contato..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-indigo-600"
          />
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'TODOS', label: 'Todos' },
            { id: 'ATIVO', label: 'Ativos' },
            { id: 'ONBOARDING', label: 'Onboarding' },
            { id: 'EM_RISCO', label: 'Em Risco' }
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                statusFilter === pill.id
                  ? 'bg-indigo-600 text-white font-bold shadow-sm'
                  : 'bg-gray-700 text-gray-400 hover:text-white hover:bg-gray-600'
              }`}
            >
              {pill.label}
            </button>
          ))}

          {/* View Mode Switcher */}
          <div className="ml-auto hidden sm:flex items-center space-x-1 p-1 bg-gray-700 rounded-xl border border-gray-600">
            <button
              onClick={() => setViewMode('CARDS')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                viewMode === 'CARDS' ? 'bg-gray-600 text-white' : 'text-gray-400'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                viewMode === 'TABLE' ? 'bg-gray-600 text-white' : 'text-gray-400'
              }`}
            >
              Tabela
            </button>
          </div>
        </div>
      </div>

      {/* Cards View */}
      {viewMode === 'CARDS' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => {
            const fin = financials.find((f) => f.clientId === client.id);
            const manager = users.find((u) => u.id === client.team.accountManagerId);
            const clientUser = users.find((u) => u.clientId === client.id);

            return (
              <div
                key={client.id}
                className="p-5 rounded-lg bg-gray-800 border border-gray-700 hover:border-gray-500 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  {/* Top Bar: Status & Health */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        client.status === 'ATIVO'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : client.status === 'ONBOARDING'
                          ? 'bg-indigo-600/20 text-indigo-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {client.status}
                    </span>

                    <div className="flex items-center space-x-1.5">
                      <span className="text-[10px] text-gray-400 font-semibold">Health Score:</span>
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded ${
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
                  </div>

                  {/* Company Info */}
                  <div className="mt-3">
                    <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {client.tradingName}
                    </h3>
                    <p className="text-xs text-gray-300">{client.companyName}</p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {client.segment} • {client.city}
                    </p>
                  </div>

                  {/* Pipeline Stage Badge */}
                  <div className="mt-3 p-2 rounded-xl bg-gray-700 border border-gray-700 text-xs flex items-center justify-between">
                    <span className="text-gray-400">Etapa Atual:</span>
                    <span className="font-semibold text-white">
                      {PIPELINE_STAGE_LABELS[client.pipelineStage]}
                    </span>
                  </div>

                  {/* Onboarding progress if in onboarding */}
                  {client.status === 'ONBOARDING' && (
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-[10px] text-gray-400">
                        <span>Onboarding Obrigatório</span>
                        <span className="font-bold text-indigo-300">{client.onboardingProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600"
                          style={{ width: `${client.onboardingProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Financial & Contract Tag */}
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-200 pt-2 border-t border-gray-700">
                    <div>
                      <span className="text-gray-400 text-[10px] block">Plano & Valor:</span>
                      <span className="font-bold text-indigo-300">
                        {client.plan} • R$ {client.monthlyValue.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-gray-400 text-[10px] block">Renovação:</span>
                      <span className="font-mono text-gray-400">{client.renewalDate}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-2 flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setActiveClientId(client.id);
                      setActiveTab('clientes');
                    }}
                    className="flex-1 py-2 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-600/30 text-indigo-300 font-semibold text-xs transition-colors flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <span>Abrir Projeto</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Simulate Login as this Client */}
                  {clientUser && (
                    <button
                      onClick={() => {
                        setCurrentUser(clientUser);
                        setActiveClientId(client.id);
                        setActiveTab('dashboard');
                      }}
                      className="p-2 rounded-xl bg-gray-700 hover:bg-gray-600 border border-gray-600 text-gray-300 hover:text-white transition-colors cursor-pointer"
                      title={`Simular login como ${client.contactName}`}
                    >
                      <UserCheck className="w-4 h-4 text-indigo-300" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="p-5 rounded-lg bg-gray-800 border border-gray-700 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 font-semibold">Cliente & Empresa</th>
                <th className="pb-3 font-semibold">Contato</th>
                <th className="pb-3 font-semibold">Etapa Atual</th>
                <th className="pb-3 font-semibold">Health Score</th>
                <th className="pb-3 font-semibold">Plano</th>
                <th className="pb-3 font-semibold">Mensalidade</th>
                <th className="pb-3 font-semibold text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#262626]">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-700 transition-colors">
                  <td className="py-3 font-semibold text-white">
                    <div>{client.tradingName}</div>
                    <div className="text-[11px] text-gray-400 font-normal">{client.companyName}</div>
                  </td>
                  <td className="py-3 text-gray-300">
                    <div>{client.contactName}</div>
                    <div className="text-[10px] text-gray-400">{client.email}</div>
                  </td>
                  <td className="py-3">
                    <span className="px-2 py-0.5 rounded bg-gray-700 border border-gray-600 text-gray-200 font-medium text-[11px]">
                      {PIPELINE_STAGE_LABELS[client.pipelineStage]}
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        client.healthScore >= 80
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : client.healthScore >= 60
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {client.healthScore} pts
                    </span>
                  </td>
                  <td className="py-3 font-medium text-white">{client.plan}</td>
                  <td className="py-3 font-bold text-indigo-300">
                    R$ {client.monthlyValue.toLocaleString('pt-BR')}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => {
                        setActiveClientId(client.id);
                        setActiveTab('clientes');
                      }}
                      className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer"
                    >
                      Ver Projeto
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
