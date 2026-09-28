import React from 'react';
import {
  CheckSquare,
  Clock,
  Calendar,
  Building2,
  FileText,
  Bell,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';

export const CollabDashboard: React.FC = () => {
  const {
    currentUser,
    tasks,
    contents,
    clients,
    updateTaskStatus,
    setActiveClientId,
    setActiveTab
  } = useAgency();

  const todayStr = new Date().toISOString().split('T')[0];

  // My tasks
  const myTasks = tasks.filter((t) => t.assignedToId === currentUser.id);
  const myPendingTasks = myTasks.filter((t) => t.status !== 'CONCLUIDA' && t.status !== 'CANCELADA');
  const myOverdueTasks = myPendingTasks.filter((t) => t.dueDate < todayStr);
  const myTodayTasks = myPendingTasks.filter((t) => t.dueDate === todayStr);

  // My contents in production
  const myContents = contents.filter(
    (c) => c.designerId === currentUser.id || c.copywriterId === currentUser.id || c.responsibleId === currentUser.id
  );

  // Week days mockup for "Minha Semana"
  const weekDays = [
    { day: 'Segunda', date: '11/08', count: 4 },
    { day: 'Terça', date: '12/08', count: 6 },
    { day: 'Quarta', date: '13/08', count: 3 },
    { day: 'Quinta', date: '14/08 (Hoje)', dateKey: todayStr, count: myTodayTasks.length, isToday: true },
    { day: 'Sexta', date: '15/08', count: 2 }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Banner */}
      <div className="p-5 rounded-lg bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 border border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
            <h1 className="text-xl font-bold text-white">Painel do Colaborador • Minha Produção</h1>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Olá, <strong className="text-white">{currentUser.name}</strong> ({currentUser.title}). Mantenha seus prazos e entregas em dia!
          </p>
        </div>

        <button
          onClick={() => setActiveTab('tarefas')}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-black text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center space-x-1.5 cursor-pointer"
        >
          <CheckSquare className="w-3.5 h-3.5" />
          <span>Ver Todas Minhas Tarefas</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg bg-gray-800 border border-gray-700">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-semibold uppercase">Minhas Tarefas Abertas</span>
            <CheckSquare className="w-4 h-4 text-indigo-300" />
          </div>
          <div className="text-2xl font-black text-white">{myPendingTasks.length}</div>
          <p className="text-[11px] text-gray-400 mt-1">Na sua fila de execução</p>
        </div>

        <div className="p-4 rounded-lg bg-gray-800 border border-gray-700">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-semibold uppercase text-rose-400">Tarefas Atrasadas</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">{myOverdueTasks.length}</div>
          <p className="text-[11px] text-rose-400/80 mt-1">Prioridade máxima de entrega</p>
        </div>

        <div className="p-4 rounded-lg bg-gray-800 border border-gray-700">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-semibold uppercase text-amber-400">Tarefas de Hoje</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{myTodayTasks.length}</div>
          <p className="text-[11px] text-gray-400 mt-1">Vencendo hoje</p>
        </div>

        <div className="p-4 rounded-lg bg-gray-800 border border-gray-700">
          <div className="flex items-center justify-between text-gray-400 mb-1">
            <span className="text-[11px] font-semibold uppercase text-emerald-400">Conteúdos Atribuídos</span>
            <FileText className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{myContents.length}</div>
          <p className="text-[11px] text-gray-400 mt-1">Peças no calendário</p>
        </div>
      </div>

      {/* "Minha Semana" Calendar Schedule Grid */}
      <div className="p-5 rounded-lg bg-gray-800 border border-gray-700 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-gray-700">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-indigo-300" />
            <span>Visão: Minha Semana de Trabalho</span>
          </h2>
          <span className="text-xs text-gray-400">Cronograma de Atividades</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-1">
          {weekDays.map((w, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border text-center transition-all ${
                w.isToday
                  ? 'bg-gray-900 border-indigo-600/50 shadow-md shadow-indigo-600/10'
                  : 'bg-gray-700 border-gray-700 hover:border-gray-500'
              }`}
            >
              <div className="text-xs font-bold text-white">{w.day}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">{w.date}</div>
              <div className="mt-3">
                <span
                  className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                    w.isToday ? 'bg-indigo-600 text-black' : 'bg-gray-600 text-gray-200'
                  }`}
                >
                  {w.count} tarefa(s)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Task Execution List with Quick Status Checkbox */}
      <div className="p-5 rounded-lg bg-gray-800 border border-gray-700 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-700">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span>Minhas Tarefas em Andamento</span>
          </h2>
          <span className="text-xs text-gray-400">Clique para concluir</span>
        </div>

        <div className="space-y-2.5">
          {myPendingTasks.length === 0 ? (
            <div className="py-8 text-center text-gray-400 text-xs">
              Você está em dia com todas as suas tarefas!
            </div>
          ) : (
            myPendingTasks.map((t) => {
              const client = clients.find((c) => c.id === t.clientId);
              return (
                <div
                  key={t.id}
                  className="p-3.5 rounded-xl bg-gray-700 hover:bg-gray-600 border border-gray-600 flex items-center justify-between transition-all"
                >
                  <div className="flex items-center space-x-3 truncate">
                    <button
                      onClick={() => updateTaskStatus(t.id, 'CONCLUIDA')}
                      className="w-5 h-5 rounded border border-gray-600 hover:border-emerald-400 flex items-center justify-center text-transparent hover:text-emerald-400 transition-colors cursor-pointer"
                      title="Marcar como Concluída"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                    <div className="truncate">
                      <p className="text-xs font-semibold text-white truncate">{t.title}</p>
                      <p className="text-[11px] text-gray-400">
                        {client?.tradingName} • Prazo: {t.dueDate} • Categoria: {t.category}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 shrink-0">
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        t.priority === 'URGENTE'
                          ? 'bg-rose-500/20 text-rose-300'
                          : t.priority === 'ALTA'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-gray-600 text-gray-300'
                      }`}
                    >
                      {t.priority}
                    </span>
                    <button
                      onClick={() => {
                        setActiveClientId(t.clientId);
                        setActiveTab('tarefas');
                      }}
                      className="p-1 rounded text-gray-400 hover:text-white"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
