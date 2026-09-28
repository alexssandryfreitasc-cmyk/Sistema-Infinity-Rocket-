import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search,
  X,
  Building2,
  CheckSquare,
  FileText,
  KeyRound,
  Users,
  ArrowRight,
  Sparkles,
  Ticket,
  Calendar
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';

interface GlobalSearchModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose
}) => {
  const {
    globalSearchOpen,
    setGlobalSearchOpen,
    clients,
    tasks,
    contents,
    accesses,
    tickets,
    users,
    setActiveClientId,
    setActiveTab
  } = useAgency();

  const isModalVisible = isOpen !== undefined ? isOpen : globalSearchOpen;
  const handleClose = () => {
    if (onClose) onClose();
    setGlobalSearchOpen(false);
  };

  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isModalVisible) {
          handleClose();
        } else {
          setGlobalSearchOpen(true);
        }
      }
      if (e.key === 'Escape' && isModalVisible) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalVisible]);

  // Focus input when opened
  useEffect(() => {
    if (isModalVisible) {
      setQuery('');
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isModalVisible]);

  const results = useMemo(() => {
    if (!query.trim()) return { clients: [], tasks: [], contents: [], accesses: [], tickets: [], users: [] };
    const q = query.toLowerCase().trim();

    return {
      clients: clients.filter(
        (c) =>
          c.companyName.toLowerCase().includes(q) ||
          c.tradingName.toLowerCase().includes(q) ||
          c.segment.toLowerCase().includes(q) ||
          c.contactName.toLowerCase().includes(q)
      ),
      tasks: tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q) ||
          t.tags?.some((tag) => tag.toLowerCase().includes(q))
      ),
      contents: contents.filter(
        (cnt) =>
          cnt.title.toLowerCase().includes(q) ||
          cnt.caption.toLowerCase().includes(q) ||
          cnt.format.toLowerCase().includes(q)
      ),
      accesses: accesses.filter(
        (a) =>
          a.platform.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.username.toLowerCase().includes(q)
      ),
      tickets: tickets.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.description?.toLowerCase().includes(q)
      ),
      users: users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.title?.toLowerCase().includes(q)
      )
    };
  }, [query, clients, tasks, contents, accesses, tickets, users]);

  if (!isModalVisible) return null;

  const totalResultsCount =
    results.clients.length +
    results.tasks.length +
    results.contents.length +
    results.accesses.length +
    results.tickets.length +
    results.users.length;

  return (
    <div
      id="global-search-backdrop"
      onClick={handleClose}
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/85 backdrop-blur-md animate-fadeIn"
    >
      <div
        id="global-search-container"
        className="w-full max-w-2xl bg-gray-800 border border-gray-600 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input Bar */}
        <div className="p-4 border-b border-gray-700 flex items-center space-x-3 bg-gray-700">
          <Search className="w-5 h-5 text-indigo-300 shrink-0" />
          <input
            ref={inputRef}
            id="global-search-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Pesquisar clientes, tarefas, conteúdos, acessos, equipe..."
            className="w-full bg-transparent text-sm text-white placeholder-[#737373] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-600 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-lg bg-gray-900 border border-gray-600 text-[10px] text-gray-300 font-mono">
            ESC
          </kbd>
        </div>

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!query.trim() ? (
            <div className="py-10 text-center text-gray-400 space-y-3">
              <div className="w-12 h-12 rounded-lg bg-gray-700 border border-gray-600 flex items-center justify-center mx-auto text-indigo-300">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Busca Global Instantânea</p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Digite para localizar qualquer item em todos os módulos operacionais do AgencyOS.
                </p>
              </div>
              <div className="flex flex-wrap justify-center gap-1.5 pt-2 text-[11px]">
                <span className="px-2.5 py-1 bg-gray-700 text-gray-300 rounded-lg border border-[#2a2a2a]">
                  🏢 Clientes
                </span>
                <span className="px-2.5 py-1 bg-gray-700 text-gray-300 rounded-lg border border-[#2a2a2a]">
                  ✓ Tarefas
                </span>
                <span className="px-2.5 py-1 bg-gray-700 text-gray-300 rounded-lg border border-[#2a2a2a]">
                  📄 Conteúdos
                </span>
                <span className="px-2.5 py-1 bg-gray-700 text-gray-300 rounded-lg border border-[#2a2a2a]">
                  🔑 Acessos
                </span>
                <span className="px-2.5 py-1 bg-gray-700 text-gray-300 rounded-lg border border-[#2a2a2a]">
                  👥 Equipe
                </span>
              </div>
            </div>
          ) : totalResultsCount === 0 ? (
            <div className="py-12 text-center text-gray-400 space-y-2">
              <p className="text-xs font-semibold text-white">Nenhum resultado encontrado</p>
              <p className="text-[11px]">Não encontramos registros para "{query}". Tente buscar por outro termo.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Clients Results */}
              {results.clients.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-indigo-300" />
                    <span>Clientes ({results.clients.length})</span>
                  </h4>
                  <div className="space-y-1">
                    {results.clients.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setActiveClientId(c.id);
                          setActiveTab('clientes');
                          handleClose();
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-[#1f1f1f] border border-transparent hover:border-gray-600 flex items-center justify-between transition-colors group cursor-pointer"
                      >
                        <div className="min-w-0 pr-2">
                          <p className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                            {c.tradingName} <span className="text-gray-400 font-normal">({c.companyName})</span>
                          </p>
                          <p className="text-[11px] text-gray-400 truncate">
                            {c.segment} • Etapa: {c.pipelineStage} • Contato: {c.contactName}
                          </p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-indigo-300 opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks Results */}
              {results.tasks.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <CheckSquare className="w-3.5 h-3.5 text-amber-400" />
                    <span>Tarefas ({results.tasks.length})</span>
                  </h4>
                  <div className="space-y-1">
                    {results.tasks.map((t) => {
                      const client = clients.find((c) => c.id === t.clientId);
                      return (
                        <button
                          key={t.id}
                          onClick={() => {
                            setActiveClientId(t.clientId);
                            setActiveTab('tarefas');
                            handleClose();
                          }}
                          className="w-full text-left p-2.5 rounded-xl hover:bg-[#1f1f1f] border border-transparent hover:border-gray-600 flex items-center justify-between transition-colors group cursor-pointer"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-semibold text-white group-hover:text-amber-400 transition-colors truncate">
                              {t.title}
                            </p>
                            <p className="text-[11px] text-gray-400 truncate">
                              {client?.tradingName || 'Geral'} • Prazo: {t.dueDate} • Status: {t.status}
                            </p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Contents Results */}
              {results.contents.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Conteúdos & Posts ({results.contents.length})</span>
                  </h4>
                  <div className="space-y-1">
                    {results.contents.map((cnt) => {
                      const client = clients.find((c) => c.id === cnt.clientId);
                      return (
                        <button
                          key={cnt.id}
                          onClick={() => {
                            setActiveClientId(cnt.clientId);
                            setActiveTab('conteudo');
                            handleClose();
                          }}
                          className="w-full text-left p-2.5 rounded-xl hover:bg-[#1f1f1f] border border-transparent hover:border-gray-600 flex items-center justify-between transition-colors group cursor-pointer"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors truncate">
                              {cnt.title}
                            </p>
                            <p className="text-[11px] text-gray-400 truncate">
                              {client?.tradingName || 'Geral'} • {cnt.format} • Status: {cnt.status}
                            </p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-emerald-400 opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Accesses Results */}
              {results.accesses.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-sky-400" />
                    <span>Central de Acessos ({results.accesses.length})</span>
                  </h4>
                  <div className="space-y-1">
                    {results.accesses.map((a) => {
                      const client = clients.find((c) => c.id === a.clientId);
                      return (
                        <button
                          key={a.id}
                          onClick={() => {
                            setActiveClientId(a.clientId);
                            setActiveTab('acessos');
                            handleClose();
                          }}
                          className="w-full text-left p-2.5 rounded-xl hover:bg-[#1f1f1f] border border-transparent hover:border-gray-600 flex items-center justify-between transition-colors group cursor-pointer"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-semibold text-white group-hover:text-sky-400 transition-colors truncate">
                              {a.platform} <span className="text-gray-400 font-normal">({a.category})</span>
                            </p>
                            <p className="text-[11px] text-gray-400 truncate">
                              {client?.tradingName || 'Geral'} • Usuário: {a.username} • {a.status}
                            </p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-sky-400 opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tickets Results */}
              {results.tickets.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <Ticket className="w-3.5 h-3.5 text-purple-400" />
                    <span>Chamados & Solicitações ({results.tickets.length})</span>
                  </h4>
                  <div className="space-y-1">
                    {results.tickets.map((tk) => {
                      const client = clients.find((c) => c.id === tk.clientId);
                      return (
                        <button
                          key={tk.id}
                          onClick={() => {
                            setActiveClientId(tk.clientId);
                            setActiveTab('solicitacoes');
                            handleClose();
                          }}
                          className="w-full text-left p-2.5 rounded-xl hover:bg-[#1f1f1f] border border-transparent hover:border-gray-600 flex items-center justify-between transition-colors group cursor-pointer"
                        >
                          <div className="min-w-0 pr-2">
                            <p className="text-xs font-semibold text-white group-hover:text-purple-400 transition-colors truncate">
                              {tk.title}
                            </p>
                            <p className="text-[11px] text-gray-400 truncate">
                              {client?.tradingName || 'Geral'} • Prioridade: {tk.priority} • Status: {tk.status}
                            </p>
                          </div>
                          <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-purple-400 opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Users Results */}
              {results.users.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Equipe & Usuários ({results.users.length})</span>
                  </h4>
                  <div className="space-y-1">
                    {results.users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          setActiveTab('equipe');
                          handleClose();
                        }}
                        className="w-full text-left p-2.5 rounded-xl hover:bg-[#1f1f1f] border border-transparent hover:border-gray-600 flex items-center justify-between transition-colors group cursor-pointer"
                      >
                        <div className="flex items-center space-x-2.5 min-w-0 pr-2">
                          <img src={u.avatar} alt={u.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                          <div className="truncate">
                            <p className="text-xs font-semibold text-white group-hover:text-indigo-400 transition-colors truncate">
                              {u.name} <span className="text-[10px] text-gray-400">({u.role})</span>
                            </p>
                            <p className="text-[11px] text-gray-400 truncate">{u.email} • {u.title || u.department}</p>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-all shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-gray-700 border-t border-gray-700 flex items-center justify-between text-[11px] text-gray-400">
          <span>Navegue com o mouse ou atalho <kbd className="font-mono text-gray-300">ESC</kbd> para fechar</span>
          <span className="text-indigo-300 font-medium">AgencyOS Search Engine</span>
        </div>
      </div>
    </div>
  );
};
