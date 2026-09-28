import React, { useState } from 'react';
import {
  Zap,
  Plus,
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Search,
  Filter,
  Trash2,
  X,
  Sparkles,
  ArrowRight,
  Cpu
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { AutomationRule } from '../../types';

export const AutomationsPage: React.FC = () => {
  const {
    automations,
    triggerAutomation,
    toggleAutomation,
    createAutomationRule,
    deleteAutomationRule,
    currentUser
  } = useAgency();

  const [search, setSearch] = useState('');
  const [filterActive, setFilterActive] = useState<'TODOS' | 'ATIVAS' | 'INATIVAS'>('TODOS');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testedRuleId, setTestedRuleId] = useState<string | null>(null);

  const [newRule, setNewRule] = useState({
    title: '',
    condition: '',
    action: '',
    isActive: true
  });

  const filteredRules = automations.filter((rule) => {
    const matchesSearch =
      rule.title.toLowerCase().includes(search.toLowerCase()) ||
      rule.condition.toLowerCase().includes(search.toLowerCase()) ||
      rule.action.toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filterActive === 'TODOS'
        ? true
        : filterActive === 'ATIVAS'
        ? rule.isActive
        : !rule.isActive;

    return matchesSearch && matchesFilter;
  });

  const totalTriggered = automations.reduce((acc, r) => acc + (r.timesTriggered || 0), 0);
  const activeCount = automations.filter((r) => r.isActive).length;

  const handleTestTrigger = (ruleId: string) => {
    triggerAutomation(ruleId);
    setTestedRuleId(ruleId);
    setTimeout(() => setTestedRuleId(null), 2500);
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRule.title.trim() || !newRule.condition.trim() || !newRule.action.trim()) return;

    createAutomationRule({
      title: newRule.title.trim(),
      condition: newRule.condition.trim(),
      action: newRule.action.trim(),
      isActive: newRule.isActive,
      lastTriggeredAt: new Date().toISOString()
    });

    setNewRule({
      title: '',
      condition: '',
      action: '',
      isActive: true
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <Zap className="w-5 h-5 text-indigo-400" />
            <span>Automações & Regras Operacionais ({automations.length})</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Travas de qualidade (Gating Rules), alertas de SLA e automações de fluxo para garantir excelência operacional
          </p>
        </div>

        {(currentUser.role === 'ADMIN' || currentUser.role === 'GESTOR') && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center space-x-1.5 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Regra de Automação</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-semibold uppercase">Total de Regras</span>
            <Cpu className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{automations.length}</div>
          <p className="text-[11px] text-gray-400 mt-1">Regras configuradas</p>
        </div>

        <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-semibold uppercase text-emerald-400">Regras Ativas</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{activeCount}</div>
          <p className="text-[11px] text-gray-400 mt-1">Executando em tempo real</p>
        </div>

        <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-semibold uppercase text-indigo-400">Total de Disparos</span>
            <Zap className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-indigo-400">{totalTriggered}</div>
          <p className="text-[11px] text-gray-400 mt-1">Ações automáticas executadas</p>
        </div>

        <div className="p-4 rounded-xl bg-gray-800 border border-gray-700">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-semibold uppercase text-amber-400">Travas de Gating</span>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">
            {automations.filter((r) => r.title.toLowerCase().includes('gating') || r.title.toLowerCase().includes('trava')).length}
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Protegendo a esteira de entregas</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-gray-800 border border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar automação por título, gatilho..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-1 w-full sm:w-auto">
          {(['TODOS', 'ATIVAS', 'INATIVAS'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterActive(mode)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterActive === mode
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {mode === 'TODOS' ? 'Todas' : mode === 'ATIVAS' ? 'Apenas Ativas' : 'Pausadas'}
            </button>
          ))}
        </div>
      </div>

      {/* Automations List */}
      <div className="space-y-3">
        {filteredRules.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-gray-800 border border-gray-700 space-y-3">
            <Zap className="w-10 h-10 text-gray-500 mx-auto" />
            <h3 className="text-sm font-bold text-white">Nenhuma automação encontrada</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Crie regras automáticas para disparar tarefas, verificar aprovações e garantir que etapas não sejam puladas.
            </p>
          </div>
        ) : (
          filteredRules.map((rule) => {
            const isTested = testedRuleId === rule.id;

            return (
              <div
                key={rule.id}
                className={`p-5 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  rule.isActive
                    ? 'bg-gray-800 border-gray-700 hover:border-gray-600'
                    : 'bg-gray-800/50 border-gray-700/50 opacity-70'
                }`}
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center space-x-3">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        rule.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-600'
                      }`}
                    />
                    <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                      <span>{rule.title}</span>
                      {rule.title.toLowerCase().includes('gating') && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Gating Rule
                        </span>
                      )}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-gray-700/50 border border-gray-700">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">
                        Quando (Gatilho)
                      </span>
                      <span className="text-gray-200">{rule.condition}</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-gray-700/50 border border-gray-700">
                      <span className="text-[10px] uppercase font-bold text-indigo-400 block mb-0.5">
                        Então (Ação Automática)
                      </span>
                      <span className="text-gray-200">{rule.action}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4 text-[11px] text-gray-400 pt-1">
                    <span>
                      Disparos realizados: <strong className="text-white">{rule.timesTriggered || 0}</strong>
                    </span>
                    {rule.lastTriggeredAt && (
                      <span>
                        Último disparo:{' '}
                        <strong className="text-gray-300">
                          {new Date(rule.lastTriggeredAt).toLocaleString('pt-BR')}
                        </strong>
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => handleTestTrigger(rule.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 cursor-pointer ${
                      isTested
                        ? 'bg-emerald-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600'
                    }`}
                    title="Simula a execução desta regra e incrementa o contador"
                  >
                    {isTested ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Disparado!</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Testar Disparo</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => toggleAutomation(rule.id)}
                    className={`p-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      rule.isActive
                        ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                        : 'bg-gray-700 text-gray-400 hover:text-white'
                    }`}
                    title={rule.isActive ? 'Pausar automação' : 'Ativar automação'}
                  >
                    {rule.isActive ? (
                      <ToggleRight className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {(currentUser.role === 'ADMIN' || currentUser.role === 'GESTOR') && (
                    <button
                      onClick={() => {
                        if (window.confirm(`Excluir a regra "${rule.title}"?`)) {
                          deleteAutomationRule(rule.id);
                        }
                      }}
                      className="p-2 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-gray-700 transition-colors cursor-pointer"
                      title="Excluir regra"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Rule Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateRule}
            className="w-full max-w-lg bg-gray-800 border border-gray-700 rounded-2xl p-6 shadow-2xl space-y-4 text-white"
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-700">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Zap className="w-4 h-4 text-indigo-400" />
                <span>Nova Regra de Automação & Gating</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-xs text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                  Nome da Regra *
                </label>
                <input
                  type="text"
                  required
                  value={newRule.title}
                  onChange={(e) => setNewRule({ ...newRule, title: e.target.value })}
                  placeholder="Ex: Alerta de Inadimplência em D+5"
                  className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                  Gatilho / Condição de Disparo *
                </label>
                <textarea
                  rows={2}
                  required
                  value={newRule.condition}
                  onChange={(e) => setNewRule({ ...newRule, condition: e.target.value })}
                  placeholder="Ex: Quando a fatura mensal estiver atrasada há mais de 5 dias corridos..."
                  className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                  Ação Executada *
                </label>
                <textarea
                  rows={2}
                  required
                  value={newRule.action}
                  onChange={(e) => setNewRule({ ...newRule, action: e.target.value })}
                  placeholder="Ex: Reduzir Health Score do cliente em 10 pontos e enviar notificação ao Gestor Financeiro..."
                  className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="ruleActive"
                  checked={newRule.isActive}
                  onChange={(e) => setNewRule({ ...newRule, isActive: e.target.checked })}
                  className="rounded border-gray-600 text-indigo-600 focus:ring-0"
                />
                <label htmlFor="ruleActive" className="text-xs text-gray-300 cursor-pointer">
                  Ativar regra imediatamente após a criação
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-700">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-2 rounded-xl bg-gray-700 text-gray-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Salvar Regra
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
