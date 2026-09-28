import React, { useState } from 'react';
import {
  History,
  ShieldCheck,
  User,
  Clock,
  Building2,
  Filter,
  Search
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';

export const AuditLogPage: React.FC = () => {
  const { auditLogs, clients } = useAgency();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('TODOS');
  const [selectedAction, setSelectedAction] = useState('TODOS');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesClient = selectedClientId === 'TODOS' ? true : log.clientId === selectedClientId;
    const actionLabel = (log as any).action || log.actionType || '';
    const matchesAction = selectedAction === 'TODOS' ? true : actionLabel === selectedAction;
    const matchesSearch =
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      actionLabel.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesClient && matchesAction && matchesSearch;
  });

  const uniqueActions = Array.from(
    new Set(auditLogs.map((l) => (l as any).action || l.actionType).filter(Boolean))
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="p-5 rounded-xl bg-gray-800 border border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-indigo-400" />
            <h1 className="text-xl font-bold text-white">
              Auditoria & Histórico Completo de Ações
            </h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Registro imutável de aprovações de conteúdo, avanço de pipeline, alterações de tarefas e acessos
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-xl bg-gray-700 border border-gray-600 text-xs font-mono text-gray-300">
          {auditLogs.length} Registros de Auditoria
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-gray-800 border border-gray-700 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por descrição, usuário..."
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="TODOS">Todos os Clientes</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.tradingName}
              </option>
            ))}
          </select>

          {uniqueActions.length > 0 && (
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-500"
            >
              <option value="TODOS">Todas as Ações</option>
              {uniqueActions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Timeline Table */}
      <div className="p-5 rounded-xl bg-gray-800 border border-gray-700 space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-xs space-y-2">
            <History className="w-8 h-8 text-gray-500 mx-auto" />
            <p className="font-semibold text-white">Nenhum registro de auditoria encontrado</p>
            <p className="text-gray-400">As ações de pipeline, aprovações e acessos aparecerão aqui automaticamente.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => {
              const client = clients.find((c) => c.id === log.clientId);
              const actionLabel = (log as any).action || log.actionType || 'AÇÃO';

              return (
                <div
                  key={log.id}
                  className="p-4 rounded-xl bg-gray-700/50 border border-gray-700 hover:bg-gray-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold uppercase text-[9px] border border-indigo-500/30">
                        {actionLabel}
                      </span>
                      <span className="font-semibold text-gray-200">{log.description}</span>
                    </div>

                    <div className="flex items-center space-x-3 text-[11px] text-gray-400">
                      <span className="text-gray-300">
                        Usuário: <strong>{log.userName}</strong>
                      </span>
                      {client && (
                        <span>
                          • Cliente: <strong>{client.tradingName}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-[11px] text-gray-400 font-mono shrink-0">
                    {new Date(log.timestamp).toLocaleString('pt-BR')}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
