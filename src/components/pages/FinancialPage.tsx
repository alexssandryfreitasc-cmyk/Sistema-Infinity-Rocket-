import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  AlertCircle,
  Calendar,
  CheckCircle2,
  Building2,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  FileCheck,
  Plus,
  Trash2,
  Wallet,
  Filter,
  CreditCard,
  X,
  Clock,
  Search
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { Transaction } from '../../types';

export const FinancialPage: React.FC = () => {
  const {
    financials,
    transactions = [],
    clients,
    updateFinancialStatus,
    addTransaction,
    updateTransactionStatus,
    deleteTransaction
  } = useAgency();

  const [activeTab, setActiveTab] = useState<'CASHFLOW' | 'MRR'>('CASHFLOW');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [typeFilter, setTypeFilter] = useState<'TODOS' | 'INCOME' | 'EXPENSE'>('TODOS');
  const [txnSearch, setTxnSearch] = useState('');
  
  // New Transaction State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTxn, setNewTxn] = useState<Partial<Transaction>>({
    type: 'INCOME',
    date: new Date().toISOString().split('T')[0],
    status: 'PAID',
    category: 'Mensalidade de Cliente',
    paymentMethod: 'PIX'
  });

  // Predefined categories for marketing agency operations
  const incomeCategories = [
    'Mensalidade de Cliente',
    'Setup & Onboarding',
    'Produção Audiovisual / Reels',
    'Consultoria & Planejamento',
    'Bônus por Metas / Performance',
    'Desenvolvimento de Landing Page / Site',
    'Outras Receitas'
  ];

  const expenseCategories = [
    'Equipe Fixa & Freelancers',
    'Ferramentas & Softwares (SaaS)',
    'Anúncios & Tráfego Próprio',
    'Servidores & Hospedagem',
    'Impostos & Contabilidade',
    'Equipamentos & Infraestrutura',
    'Despesas Gerais & Escritório',
    'Outras Despesas'
  ];

  // Core financial metrics MRR
  const totalMRR = financials.reduce(
    (acc, f) => acc + (f.status !== 'CANCELADO' ? f.monthlyValue : 0),
    0
  );
  const overdueCount = financials.filter((f) => f.status === 'ATRASADO').length;
  const overdueAmount = financials
    .filter((f) => f.status === 'ATRASADO')
    .reduce((acc, f) => acc + f.monthlyValue, 0);
  const averageTicket = financials.length > 0 ? Math.round(totalMRR / financials.length) : 0;
  
  const filteredFinancials = financials.filter((f) =>
    statusFilter === 'TODOS' ? true : f.status === statusFilter
  );

  // Cashflow metrics
  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME' && t.status === 'PAID')
    .reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions
    .filter((t) => t.type === 'EXPENSE' && t.status === 'PAID')
    .reduce((acc, t) => acc + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  const pendingIncome = transactions
    .filter((t) => t.type === 'INCOME' && t.status !== 'PAID')
    .reduce((acc, t) => acc + t.amount, 0);

  const pendingExpense = transactions
    .filter((t) => t.type === 'EXPENSE' && t.status !== 'PAID')
    .reduce((acc, t) => acc + t.amount, 0);

  const filteredTransactions = transactions
    .filter((t) => {
      if (typeFilter !== 'TODOS' && t.type !== typeFilter) return false;
      if (txnSearch.trim()) {
        const query = txnSearch.toLowerCase();
        const matchesDesc = t.description.toLowerCase().includes(query);
        const matchesCategory = t.category.toLowerCase().includes(query);
        const client = clients.find((c) => c.id === t.clientId);
        const matchesClient = client ? client.tradingName.toLowerCase().includes(query) : false;
        return matchesDesc || matchesCategory || matchesClient;
      }
      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleCreateTxn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTxn.description?.trim() || !newTxn.amount || !newTxn.category) return;

    addTransaction({
      description: newTxn.description.trim(),
      amount: Number(newTxn.amount),
      type: newTxn.type || 'INCOME',
      category: newTxn.category,
      date: newTxn.date || new Date().toISOString().split('T')[0],
      status: newTxn.status || 'PAID',
      clientId: newTxn.clientId || undefined,
      paymentMethod: newTxn.paymentMethod || 'PIX'
    });

    setIsModalOpen(false);
    setNewTxn({
      type: 'INCOME',
      date: new Date().toISOString().split('T')[0],
      status: 'PAID',
      category: 'Mensalidade de Cliente',
      paymentMethod: 'PIX'
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
              <Wallet className="w-4 h-4" />
            </div>
            <h1 className="text-xl font-bold text-white">
              Gestão Financeira da Agência
            </h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Controle de fluxo de caixa, receitas, despesas, entradas, saídas e previsibilidade de MRR.
          </p>
        </div>
        
        <div className="flex bg-gray-800 border border-gray-700 rounded-xl p-1 shrink-0">
          <button
            onClick={() => setActiveTab('CASHFLOW')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'CASHFLOW'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Fluxo de Caixa (Entradas & Saídas)
          </button>
          <button
            onClick={() => setActiveTab('MRR')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'MRR'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Contratos & MRR
          </button>
        </div>
      </div>

      {activeTab === 'CASHFLOW' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* KPI Cards Cashflow */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800">
              <div className="flex items-center justify-between text-gray-400 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Receitas Recebidas</span>
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-400 mt-2">
                R$ {totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                {pendingIncome > 0 ? `+ R$ ${pendingIncome.toLocaleString('pt-BR')} a receber` : 'Tudo em dia'}
              </p>
            </div>
            
            <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800">
              <div className="flex items-center justify-between text-gray-400 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Despesas Pagas</span>
                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-rose-400 mt-2">
                R$ {totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                {pendingExpense > 0 ? `+ R$ ${pendingExpense.toLocaleString('pt-BR')} a pagar` : 'Custos liquidados'}
              </p>
            </div>
            
            <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800">
              <div className="flex items-center justify-between text-gray-400 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Saldo Líquido</span>
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Wallet className="w-4 h-4" />
                </div>
              </div>
              <div className={`text-2xl font-black mt-2 ${netBalance >= 0 ? 'text-white' : 'text-rose-400'}`}>
                R$ {netBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Margem operacional da agência
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800">
              <div className="flex items-center justify-between text-gray-400 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Total de Lançamentos</span>
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-amber-400 mt-2">
                {transactions.length}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                Registros auditados no banco
              </p>
            </div>
          </div>

          {/* Transactions List */}
          <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-800">
              <div>
                <h2 className="text-sm font-bold text-white">Lançamentos de Caixa</h2>
                <p className="text-xs text-gray-400">Controle individual de entradas e saídas financeiras</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Search Input */}
                <div className="relative w-44 sm:w-56">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={txnSearch}
                    onChange={(e) => setTxnSearch(e.target.value)}
                    placeholder="Buscar lançamento..."
                    className="w-full pl-8 pr-2.5 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Type Filter Buttons */}
                <div className="flex bg-gray-800 rounded-lg p-0.5 border border-gray-700 text-xs">
                  <button
                    onClick={() => setTypeFilter('TODOS')}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      typeFilter === 'TODOS' ? 'bg-indigo-600 text-white font-bold' : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setTypeFilter('INCOME')}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      typeFilter === 'INCOME' ? 'bg-emerald-600 text-white font-bold' : 'text-gray-400 hover:text-emerald-400'
                    }`}
                  >
                    Entradas
                  </button>
                  <button
                    onClick={() => setTypeFilter('EXPENSE')}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      typeFilter === 'EXPENSE' ? 'bg-rose-600 text-white font-bold' : 'text-gray-400 hover:text-rose-400'
                    }`}
                  >
                    Saídas
                  </button>
                </div>

                {/* Add Transaction Button */}
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-600/20 active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Lançamento</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-3 font-semibold">Data</th>
                    <th className="pb-3 font-semibold">Descrição</th>
                    <th className="pb-3 font-semibold">Categoria</th>
                    <th className="pb-3 font-semibold">Cliente Vinculado</th>
                    <th className="pb-3 font-semibold">Tipo</th>
                    <th className="pb-3 font-semibold text-right">Valor</th>
                    <th className="pb-3 font-semibold text-center">Status</th>
                    <th className="pb-3 font-semibold text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredTransactions.map((txn) => {
                    const linkedClient = clients.find((c) => c.id === txn.clientId);
                    return (
                      <tr key={txn.id} className="hover:bg-gray-800/40 transition-colors">
                        <td className="py-3 font-mono text-gray-400 whitespace-nowrap">{txn.date}</td>
                        <td className="py-3 font-bold text-white">
                          <div>{txn.description}</div>
                          {txn.paymentMethod && (
                            <span className="text-[10px] text-gray-400 font-normal">
                              Via {txn.paymentMethod}
                            </span>
                          )}
                        </td>
                        <td className="py-3 text-indigo-300 font-medium">{txn.category}</td>
                        <td className="py-3 text-gray-400">
                          {linkedClient ? (
                            <span className="text-gray-200 font-medium">{linkedClient.tradingName}</span>
                          ) : (
                            <span className="text-gray-400 italic">Agência Geral</span>
                          )}
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              txn.type === 'INCOME'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}
                          >
                            {txn.type === 'INCOME' ? 'ENTRADA' : 'SAÍDA'}
                          </span>
                        </td>
                        <td
                          className={`py-3 font-extrabold font-mono text-right whitespace-nowrap ${
                            txn.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {txn.type === 'INCOME' ? '+' : '-'} R$ {txn.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 text-center whitespace-nowrap">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              txn.status === 'PAID'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : txn.status === 'PENDING'
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-rose-500/20 text-rose-400'
                            }`}
                          >
                            {txn.status === 'PAID'
                              ? 'PAGO'
                              : txn.status === 'PENDING'
                              ? 'PENDENTE'
                              : 'ATRASADO'}
                          </span>
                        </td>
                        <td className="py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end space-x-2">
                            {txn.status !== 'PAID' && (
                              <button
                                onClick={() => updateTransactionStatus(txn.id, 'PAID')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white text-[11px] font-bold transition-colors cursor-pointer"
                                title="Marcar como Liquidado/Pago"
                              >
                                Baixar
                              </button>
                            )}
                            <button
                              onClick={() => {
                                if (window.confirm(`Excluir o lançamento "${txn.description}"?`)) {
                                  deleteTransaction(txn.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-gray-800 transition-colors cursor-pointer"
                              title="Excluir lançamento"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-gray-500">
                        Nenhum lançamento registrado para os filtros selecionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'MRR' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* KPI Cards MRR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800">
              <div className="flex items-center justify-between text-gray-400 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">MRR Recorrente Ativo</span>
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-400 mt-2">
                R$ {totalMRR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Faturamento mensal contratado</p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800">
              <div className="flex items-center justify-between text-gray-400 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Ticket Médio</span>
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-white mt-2">
                R$ {averageTicket.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Média por cliente ativo</p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800">
              <div className="flex items-center justify-between text-gray-400 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Inadimplência (Em Atraso)</span>
                <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-rose-400 mt-2">
                R$ {overdueAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">
                {overdueCount} cliente(s) com cobrança pendente
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800">
              <div className="flex items-center justify-between text-gray-400 mb-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Total de Contratos</span>
                <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Building2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-indigo-400 mt-2">
                {financials.length}
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Planos monitorados</p>
            </div>
          </div>

          {/* MRR Contracts Table */}
          <div className="p-5 rounded-2xl bg-gray-900 border border-gray-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-800">
              <div>
                <h2 className="text-sm font-bold text-white">Contratos e Mensalidades Recorrentes</h2>
                <p className="text-xs text-gray-400">Status de pagamento e cobranças mensais por cliente</p>
              </div>

              <div className="flex items-center space-x-1">
                {['TODOS', 'ATIVO', 'ATRASADO', 'PENDENTE'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      statusFilter === s
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'bg-gray-800 border border-gray-700 text-gray-400 hover:text-white'
                    }`}
                  >
                    {s === 'TODOS' ? 'Todos' : s}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-3 font-semibold">Cliente</th>
                    <th className="pb-3 font-semibold">Plano</th>
                    <th className="pb-3 font-semibold">Valor Mensal</th>
                    <th className="pb-3 font-semibold">Dia Vencimento</th>
                    <th className="pb-3 font-semibold">Método</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredFinancials.map((fin) => {
                    const client = clients.find((c) => c.id === fin.clientId);
                    return (
                      <tr key={fin.id} className="hover:bg-gray-800/40 transition-colors">
                        <td className="py-3 font-bold text-white">
                          <div>{client?.tradingName}</div>
                          <div className="text-[10px] text-gray-400 font-normal">{client?.companyName}</div>
                        </td>
                        <td className="py-3 text-indigo-300 font-medium">{fin.plan}</td>
                        <td className="py-3 font-extrabold text-emerald-400 font-mono">
                          R$ {fin.monthlyValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 font-mono text-gray-200">Dia {fin.billingDay || 10}</td>
                        <td className="py-3 text-gray-400">{fin.paymentMethod || 'PIX'}</td>
                        <td className="py-3">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              fin.status === 'ATIVO'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : fin.status === 'ATRASADO'
                                ? 'bg-rose-500/20 text-rose-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {fin.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          {fin.status !== 'ATIVO' ? (
                            <button
                              onClick={() => updateFinancialStatus(fin.id, 'ATIVO')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow transition-colors cursor-pointer"
                            >
                              Confirmar Pagamento
                            </button>
                          ) : (
                            <button
                              onClick={() => updateFinancialStatus(fin.id, 'ATRASADO')}
                              className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 hover:bg-rose-500/20 text-gray-300 hover:text-rose-300 text-xs transition-colors cursor-pointer"
                            >
                              Marcar Atraso
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredFinancials.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500">
                        Nenhum contrato recorrente encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* New Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-800 flex items-center justify-between bg-gray-850">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-indigo-400" />
                <span>Registrar Lançamento Financeiro</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTxn} className="p-6 overflow-y-auto space-y-4 flex-1">
              {/* Type Switcher (Receita vs Despesa) */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Tipo de Lançamento <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setNewTxn({
                        ...newTxn,
                        type: 'INCOME',
                        category: incomeCategories[0]
                      })
                    }
                    className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 border transition-all cursor-pointer ${
                      newTxn.type === 'INCOME'
                        ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Entrada / Receita (+)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setNewTxn({
                        ...newTxn,
                        type: 'EXPENSE',
                        category: expenseCategories[0]
                      })
                    }
                    className={`py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-2 border transition-all cursor-pointer ${
                      newTxn.type === 'EXPENSE'
                        ? 'bg-rose-600/20 border-rose-500 text-rose-400'
                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
                    }`}
                  >
                    <ArrowDownRight className="w-4 h-4" />
                    <span>Saída / Despesa (-)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Descrição do Lançamento <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    newTxn.type === 'INCOME'
                      ? 'Ex: Mensalidade Fontana Dermatologia - Mês Atual'
                      : 'Ex: Assinatura Meta Ads / Canva Pro / Freelancer'
                  }
                  value={newTxn.description || ''}
                  onChange={(e) => setNewTxn({ ...newTxn, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Valor (R$) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={newTxn.amount || ''}
                    onChange={(e) => setNewTxn({ ...newTxn, amount: Number(e.target.value) })}
                    placeholder="0.00"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Data da Transação <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={newTxn.date || ''}
                    onChange={(e) => setNewTxn({ ...newTxn, date: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Categoria <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={newTxn.category || ''}
                    onChange={(e) => setNewTxn({ ...newTxn, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    {(newTxn.type === 'INCOME' ? incomeCategories : expenseCategories).map(
                      (cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Status do Pagamento
                  </label>
                  <select
                    value={newTxn.status || 'PAID'}
                    onChange={(e) => setNewTxn({ ...newTxn, status: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="PAID">Pago / Concluído</option>
                    <option value="PENDING">Pendente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Cliente Vinculado (Opcional)
                  </label>
                  <select
                    value={newTxn.clientId || ''}
                    onChange={(e) => setNewTxn({ ...newTxn, clientId: e.target.value || undefined })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Geral da Agência (Nenhum)</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.tradingName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Método de Pagamento
                  </label>
                  <select
                    value={newTxn.paymentMethod || 'PIX'}
                    onChange={(e) => setNewTxn({ ...newTxn, paymentMethod: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-800 border border-gray-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="PIX">PIX</option>
                    <option value="BOLETO">Boleto Bancário</option>
                    <option value="CARTAO">Cartão de Crédito</option>
                    <option value="TRANSFERENCIA">Transferência / TED</option>
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-gray-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-gray-800 text-gray-300 hover:text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!newTxn.description?.trim() || !newTxn.amount}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-indigo-600/20"
                >
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
