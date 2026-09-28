import React, { useState } from 'react';
import {
  LifeBuoy,
  Plus,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Building2,
  X,
  Send,
  Search,
  Filter
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { Ticket, TicketPriority } from '../../types';

export const TicketsPage: React.FC = () => {
  const { tickets, clients, users, createTicket, updateTicketStatus, activeClient, currentUser } = useAgency();

  const [selectedClient, setSelectedClient] = useState<string>(activeClient?.id || 'TODOS');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'ABERTO' | 'EM_ANDAMENTO' | 'RESOLVIDO'>('TODOS');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);

  const [newTicket, setNewTicket] = useState({
    clientId: activeClient?.id || (clients[0]?.id || ''),
    title: '',
    description: '',
    priority: 'MEDIA' as TicketPriority
  });

  const filteredTickets = tickets.filter((t) => {
    const matchesClient = selectedClient === 'TODOS' ? true : t.clientId === selectedClient;
    const matchesStatus = statusFilter === 'TODOS' ? true : t.status === statusFilter;
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesClient && matchesStatus && matchesSearch;
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.title || !newTicket.clientId) return;

    createTicket({
      clientId: newTicket.clientId,
      title: newTicket.title,
      description: newTicket.description,
      priority: newTicket.priority,
      status: 'ABERTO',
      createdByUserId: currentUser.id
    });

    setNewTicket({
      clientId: activeClient?.id || (clients[0]?.id || ''),
      title: '',
      description: '',
      priority: 'MEDIA'
    });
    setShowNewModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <LifeBuoy className="w-5 h-5 text-indigo-400" />
            <span>Central de Solicitações & Chamados ({filteredTickets.length})</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Canal oficial para dúvidas, pedidos extras de arte, ajustes urgentes e suporte com SLA garantido
          </p>
        </div>

        <button
          onClick={() => setShowNewModal(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/20 flex items-center space-x-1.5 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Abrir Novo Chamado</span>
        </button>
      </div>

      {/* SLA Policy Banner */}
      <div className="p-4 rounded-xl bg-gray-800 border border-gray-700 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-gray-700/60 border border-gray-600">
          <span className="text-[10px] uppercase font-bold text-rose-400 block">Urgente (SLA 4h)</span>
          <span className="text-gray-300">Queda de anúncios, erros em publicações</span>
        </div>
        <div className="p-3 rounded-lg bg-gray-700/60 border border-gray-600">
          <span className="text-[10px] uppercase font-bold text-indigo-300 block">Alta (SLA 8h)</span>
          <span className="text-gray-300">Artes para eventos de última hora</span>
        </div>
        <div className="p-3 rounded-lg bg-gray-700/60 border border-gray-600">
          <span className="text-[10px] uppercase font-bold text-sky-400 block">Média (SLA 24h)</span>
          <span className="text-gray-300">Ajustes gerais de copy ou pautas</span>
        </div>
        <div className="p-3 rounded-lg bg-gray-700/60 border border-gray-600">
          <span className="text-[10px] uppercase font-bold text-gray-400 block">Baixa (SLA 48h)</span>
          <span className="text-gray-300">Dúvidas conceituais ou futuras</span>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="p-4 rounded-xl bg-gray-800 border border-gray-700 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto flex-1">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar chamado..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {currentUser.role !== 'CLIENTE' && (
            <div className="w-full sm:w-56">
              <select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="TODOS">Todos os Clientes</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.tradingName}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-1 w-full md:w-auto overflow-x-auto">
          {(['TODOS', 'ABERTO', 'EM_ANDAMENTO', 'RESOLVIDO'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              {status === 'TODOS'
                ? 'Todos'
                : status === 'ABERTO'
                ? 'Abertos'
                : status === 'EM_ANDAMENTO'
                ? 'Em Andamento'
                : 'Resolvidos'}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="p-5 rounded-lg bg-gray-800 border border-gray-700 space-y-3">
        {filteredTickets.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs">
            Nenhum chamado aberto no momento.
          </div>
        ) : (
          filteredTickets.map((t) => {
            const client = clients.find((c) => c.id === t.clientId);
            const creator = users.find((u) => u.id === t.createdByUserId);

            return (
              <div
                key={t.id}
                className="p-4 rounded-xl bg-gray-700 border border-gray-600 hover:border-gray-600 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        t.priority === 'URGENTE'
                          ? 'bg-rose-500/20 text-rose-300'
                          : t.priority === 'ALTA'
                          ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-600/30'
                          : 'bg-gray-600 text-gray-300'
                      }`}
                    >
                      {t.priority} (SLA: {t.slaHours}h)
                    </span>
                    <span className="text-xs font-bold text-white">{t.title}</span>
                  </div>

                  <p className="text-xs text-gray-300 leading-relaxed">{t.description}</p>

                  <div className="flex items-center space-x-2 text-[11px] text-gray-400 pt-1">
                    <span className="font-semibold text-indigo-300">{client?.tradingName}</span>
                    <span>•</span>
                    <span>Criado por {creator?.name || 'Cliente'} em {new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <select
                    value={t.status}
                    onChange={(e) => updateTicketStatus(t.id, e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl bg-gray-800 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
                  >
                    <option value="ABERTO">Aberto</option>
                    <option value="EM_ANALISE">Em Análise</option>
                    <option value="EM_EXECUCAO">Em Execução</option>
                    <option value="RESOLVIDO">Resolvido</option>
                  </select>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Ticket Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateTicket}
            className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-2xl space-y-4 text-white"
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-700">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <LifeBuoy className="w-4 h-4 text-indigo-300" />
                <span>Abrir Solicitação de Suporte</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-xs text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                  Cliente *
                </label>
                <select
                  required
                  value={newTicket.clientId}
                  onChange={(e) => setNewTicket({ ...newTicket, clientId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.tradingName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                  Assunto da Solicitação *
                </label>
                <input
                  type="text"
                  required
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                  placeholder="Ex: Preciso alterar o telefone no banner do site"
                  className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                  Nível de Urgência / SLA
                </label>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as TicketPriority })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
                >
                  <option value="BAIXA">Baixa (Até 48h)</option>
                  <option value="MEDIA">Média (Até 24h)</option>
                  <option value="ALTA">Alta (Até 8h)</option>
                  <option value="URGENTE">Urgente (Até 4h)</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                  Descrição Detalhada do Pedido *
                </label>
                <textarea
                  rows={4}
                  required
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                  placeholder="Explique com detalhes o que precisa..."
                  className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-700">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-3 py-2 rounded-xl bg-gray-700 text-gray-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Enviar Chamado
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
