import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Filter,
  Search,
  Calendar,
  Clock,
  UserCheck,
  Building2,
  AlertTriangle,
  CheckCircle2,
  X,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { Task, TaskCategory, TaskPriority, TaskStatus } from '../../types';

export const TasksPage: React.FC = () => {
  const {
    tasks,
    clients,
    users,
    createTask,
    updateTaskStatus,
    deleteTask,
    currentUser,
    activeClient,
    setActiveClientId
  } = useAgency();

  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<string>(activeClient?.id || 'TODOS');
  const [selectedStatus, setSelectedStatus] = useState<string>('TODOS');
  const [selectedPriority, setSelectedPriority] = useState<string>('TODOS');
  const [onlyMine, setOnlyMine] = useState(false);
  const [viewMode, setViewMode] = useState<'LIST' | 'KANBAN'>('LIST');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  // New task form state
  const [newTask, setNewTask] = useState({
    clientId: activeClient?.id || (clients[0]?.id || ''),
    title: '',
    description: '',
    category: 'DESIGN' as TaskCategory,
    priority: 'MEDIA' as TaskPriority,
    assignedToId: currentUser.id,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    estimatedHours: 2
  });

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    const matchesClient = selectedClient === 'TODOS' ? true : t.clientId === selectedClient;
    const matchesStatus = selectedStatus === 'TODOS' ? true : t.status === selectedStatus;
    const matchesPriority = selectedPriority === 'TODOS' ? true : t.priority === selectedPriority;
    const matchesMine = onlyMine ? t.assignedToId === currentUser.id : true;

    return matchesSearch && matchesClient && matchesStatus && matchesPriority && matchesMine;
  });

  const handleCreateTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title || !newTask.clientId) return;

    createTask({
      clientId: newTask.clientId,
      title: newTask.title,
      description: newTask.description,
      category: newTask.category,
      priority: newTask.priority,
      status: 'A_FAZER',
      assignedToId: newTask.assignedToId,
      dueDate: newTask.dueDate,
      estimatedHours: Number(newTask.estimatedHours),
      isAutomated: false
    });

    setNewTask({
      clientId: activeClient?.id || (clients[0]?.id || ''),
      title: '',
      description: '',
      category: 'DESIGN',
      priority: 'MEDIA',
      assignedToId: currentUser.id,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      estimatedHours: 2
    });
    setShowNewTaskModal(false);
  };

  const statusColumns: { id: TaskStatus; label: string }[] = [
    { id: 'A_FAZER', label: 'A Fazer' },
    { id: 'EM_ANDAMENTO', label: 'Em Andamento' },
    { id: 'REVISAO_INTERNA', label: 'Revisão Interna' },
    { id: 'AGUARDANDO_CLIENTE', label: 'Aguardando Cliente' },
    { id: 'CONCLUIDA', label: 'Concluída' }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-indigo-300" />
            <span>Central de Tarefas & Entregas ({filteredTasks.length})</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Gestão operacional de prazos, responsáveis e categorias de produção
          </p>
        </div>

        <button
          onClick={() => setShowNewTaskModal(true)}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/10 flex items-center space-x-1.5 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Criar Nova Tarefa</span>
        </button>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 rounded-lg bg-gray-800 border border-gray-700 space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar tarefas por título, descrição..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-indigo-600"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Client selector */}
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
            >
              <option value="TODOS">Todos os Clientes</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.tradingName}
                </option>
              ))}
            </select>

            {/* Status selector */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="A_FAZER">A Fazer</option>
              <option value="EM_ANDAMENTO">Em Andamento</option>
              <option value="REVISAO_INTERNA">Revisão Interna</option>
              <option value="AGUARDANDO_CLIENTE">Aguardando Cliente</option>
              <option value="CONCLUIDA">Concluída</option>
            </select>

            {/* Priority selector */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
            >
              <option value="TODOS">Todas as Prioridades</option>
              <option value="URGENTE">Urgente</option>
              <option value="ALTA">Alta</option>
              <option value="MEDIA">Média</option>
              <option value="BAIXA">Baixa</option>
            </select>

            {/* Only mine toggle */}
            <button
              onClick={() => setOnlyMine(!onlyMine)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1 cursor-pointer ${
                onlyMine
                  ? 'bg-indigo-600 text-white font-bold'
                  : 'bg-gray-700 text-gray-400 hover:text-white border border-gray-600'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Minhas Tarefas</span>
            </button>

            {/* View Switcher */}
            <div className="flex items-center space-x-1 p-1 bg-gray-700 rounded-xl border border-gray-600">
              <button
                onClick={() => setViewMode('LIST')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  viewMode === 'LIST' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Lista
              </button>
              <button
                onClick={() => setViewMode('KANBAN')}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                  viewMode === 'KANBAN' ? 'bg-gray-600 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                Kanban
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* List View */}
      {viewMode === 'LIST' ? (
        <div className="p-5 rounded-lg bg-gray-800 border border-gray-700 space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="py-12 text-center text-gray-400 text-xs">
              Nenhuma tarefa encontrada com os filtros selecionados.
            </div>
          ) : (
            filteredTasks.map((task) => {
              const client = clients.find((c) => c.id === task.clientId);
              const assignee = users.find((u) => u.id === task.assignedToId);
              const isOverdue =
                task.dueDate < todayStr && task.status !== 'CONCLUIDA' && task.status !== 'CANCELADA';

              return (
                <div
                  key={task.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    task.status === 'CONCLUIDA'
                      ? 'bg-gray-800/50 border-gray-700 opacity-60'
                      : isOverdue
                      ? 'bg-rose-950/20 border-rose-500/30'
                      : 'bg-gray-700 border-gray-600 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() =>
                        updateTaskStatus(
                          task.id,
                          task.status === 'CONCLUIDA' ? 'A_FAZER' : 'CONCLUIDA'
                        )
                      }
                      className={`w-5 h-5 mt-0.5 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                        task.status === 'CONCLUIDA'
                          ? 'bg-emerald-500 border-emerald-500 text-black font-bold'
                          : 'border-gray-600 hover:border-emerald-400 text-transparent'
                      }`}
                    >
                      ✓
                    </button>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`text-xs font-bold ${
                            task.status === 'CONCLUIDA'
                              ? 'line-through text-gray-400'
                              : 'text-white'
                          }`}
                        >
                          {task.title}
                        </span>
                        {task.isAutomated && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-600/15 text-indigo-300 border border-indigo-600/30">
                            Auto
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-gray-400">
                        <span className="text-gray-200 font-semibold">{client?.tradingName}</span>
                        <span>•</span>
                        <span className="px-2 py-0.2 rounded bg-gray-600 text-gray-200">
                          {task.category}
                        </span>
                        <span>•</span>
                        <span className={`font-mono ${isOverdue ? 'text-rose-400 font-bold' : ''}`}>
                          Prazo: {task.dueDate} {isOverdue && '(Atrasada)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end sm:self-center">
                    {/* Priority Tag */}
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        task.priority === 'URGENTE'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : task.priority === 'ALTA'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-gray-600 text-gray-300'
                      }`}
                    >
                      {task.priority}
                    </span>

                    {/* Status Dropdown */}
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value as TaskStatus)}
                      className="px-2.5 py-1 rounded-lg bg-gray-800 border border-gray-600 text-xs text-white focus:outline-none"
                    >
                      <option value="A_FAZER">A Fazer</option>
                      <option value="EM_ANDAMENTO">Em Andamento</option>
                      <option value="REVISAO_INTERNA">Revisão Interna</option>
                      <option value="AGUARDANDO_CLIENTE">Aguardando Cliente</option>
                      <option value="CONCLUIDA">Concluída</option>
                    </select>

                    {/* Assignee Avatar */}
                    {assignee && (
                      <div className="flex items-center space-x-1.5" title={assignee.name}>
                        <img
                          src={assignee.avatar}
                          alt={assignee.name}
                          className="w-6 h-6 rounded-full object-cover border border-gray-600"
                        />
                      </div>
                    )}

                    {/* Delete Task Button */}
                    <button
                      onClick={() => {
                        if (window.confirm(`Excluir a tarefa "${task.title}"?`)) {
                          deleteTask(task.id);
                        }
                      }}
                      className="p-1 rounded-lg text-gray-500 hover:text-rose-400 hover:bg-gray-800 transition-colors cursor-pointer"
                      title="Excluir tarefa"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Kanban View */
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 overflow-x-auto pb-4">
          {statusColumns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className="rounded-lg bg-gray-800 border border-gray-700 p-3.5 flex flex-col space-y-3 min-h-[350px]"
              >
                <div className="flex items-center justify-between pb-2 border-b border-gray-700">
                  <span className="text-xs font-bold text-white">{col.label}</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-gray-700 border border-gray-600 text-gray-300">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {colTasks.map((task) => {
                    const client = clients.find((c) => c.id === task.clientId);
                    const assignee = users.find((u) => u.id === task.assignedToId);
                    return (
                      <div
                        key={task.id}
                        className="p-3 rounded-xl bg-gray-700 border border-gray-600 hover:border-gray-600 transition-all space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold text-indigo-300 truncate">
                            {client?.tradingName}
                          </span>
                          <span
                            className={`text-[8px] font-bold px-1.5 py-0.2 rounded ${
                              task.priority === 'URGENTE'
                                ? 'bg-rose-500/20 text-rose-300'
                                : 'bg-gray-600 text-gray-300'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        <h4 className="text-xs font-bold text-white line-clamp-2">{task.title}</h4>

                        <div className="pt-2 border-t border-gray-700 flex items-center justify-between text-[10px] text-gray-400">
                          <span>{task.dueDate}</span>
                          <div className="flex items-center space-x-1.5">
                            {assignee && (
                              <img
                                src={assignee.avatar}
                                alt={assignee.name}
                                className="w-4 h-4 rounded-full border border-gray-600"
                                title={assignee.name}
                              />
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Excluir a tarefa "${task.title}"?`)) {
                                  deleteTask(task.id);
                                }
                              }}
                              className="text-gray-500 hover:text-rose-400 p-0.5 transition-colors cursor-pointer"
                              title="Excluir tarefa"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Task Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateTaskSubmit}
            className="w-full max-w-lg bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-2xl space-y-4 text-white"
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-700">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <CheckSquare className="w-4 h-4 text-indigo-300" />
                <span>Nova Tarefa Operacional</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowNewTaskModal(false)}
                className="text-xs text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                  Cliente do Projeto *
                </label>
                <select
                  required
                  value={newTask.clientId}
                  onChange={(e) => setNewTask({ ...newTask, clientId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.tradingName} ({c.companyName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                  Título da Tarefa *
                </label>
                <input
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Ex: Criar carrossel comemorativo para quinta-feira"
                  className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                  Descrição & Diretrizes
                </label>
                <textarea
                  rows={2}
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Detalhes, links de referência, formatos..."
                  className="w-full p-3 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                    Categoria
                  </label>
                  <select
                    value={newTask.category}
                    onChange={(e) => setNewTask({ ...newTask, category: e.target.value as TaskCategory })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
                  >
                    <option value="DESIGN">Design</option>
                    <option value="COPYWRITING">Copywriting</option>
                    <option value="VIDEO">Vídeo / Edição</option>
                    <option value="TRAFEGO_PAGO">Tráfego Pago</option>
                    <option value="SOCIAL_MEDIA">Social Media</option>
                    <option value="ONBOARDING">Onboarding</option>
                    <option value="ESTRATEGIA">Estratégia</option>
                    <option value="ATENDIMENTO">Atendimento / CS</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                    Prioridade
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as TaskPriority })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
                  >
                    <option value="BAIXA">Baixa</option>
                    <option value="MEDIA">Média</option>
                    <option value="ALTA">Alta</option>
                    <option value="URGENTE">Urgente</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                    Responsável
                  </label>
                  <select
                    value={newTask.assignedToId}
                    onChange={(e) => setNewTask({ ...newTask, assignedToId: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                    Data de Entrega (Prazo)
                  </label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-700">
              <button
                type="button"
                onClick={() => setShowNewTaskModal(false)}
                className="px-3 py-2 rounded-xl bg-gray-700 text-gray-300 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                Criar Tarefa
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
