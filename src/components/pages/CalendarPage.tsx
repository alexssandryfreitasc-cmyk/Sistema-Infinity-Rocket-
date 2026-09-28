import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  Video,
  ExternalLink,
  Users2,
  Building2,
  CheckCircle2,
  X,
  Trash2
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';
import { Meeting } from '../../types';

export const CalendarPage: React.FC = () => {
  const { meetings, clients, users, createMeeting, deleteMeeting, activeClient } = useAgency();

  const [selectedClient, setSelectedClient] = useState<string>(activeClient?.id || 'TODOS');
  const [showNewModal, setShowNewModal] = useState(false);

  const [newMeeting, setNewMeeting] = useState({
    clientId: activeClient?.id || (clients[0]?.id || ''),
    title: '',
    type: 'ALINHAMENTO_SEMANAL' as Meeting['type'],
    date: new Date().toISOString().split('T')[0],
    time: '14:00',
    durationMinutes: 45,
    meetingUrl: 'https://meet.google.com/abc-defg-hij',
    attendeeIds: [] as string[]
  });

  const filteredMeetings = meetings.filter((m) =>
    selectedClient === 'TODOS' ? true : m.clientId === selectedClient
  );

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeeting.title || !newMeeting.clientId) return;

    createMeeting({
      clientId: newMeeting.clientId,
      title: newMeeting.title,
      type: newMeeting.type,
      date: newMeeting.date,
      time: newMeeting.time,
      durationMinutes: Number(newMeeting.durationMinutes),
      meetingUrl: newMeeting.meetingUrl,
      attendeeIds: newMeeting.attendeeIds.length > 0 ? newMeeting.attendeeIds : [users[0].id],
      status: 'AGENDADA'
    });

    setShowNewModal(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center space-x-2">
            <CalendarIcon className="w-5 h-5 text-indigo-300" />
            <span>Calendário & Reuniões de Alinhamento ({filteredMeetings.length})</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Kickoffs de novos clientes, alinhamentos semanais de estratégia e apresentações de relatórios
          </p>
        </div>

        <div className="flex items-center space-x-2">
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

          <button
            onClick={() => setShowNewModal(true)}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/10 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Agendar Reunião</span>
          </button>
        </div>
      </div>

      {/* Meetings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMeetings.map((m) => {
          const client = clients.find((c) => c.id === m.clientId);

          return (
            <div
              key={m.id}
              className="p-5 rounded-lg bg-gray-800 border border-gray-700 hover:border-gray-600 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded bg-indigo-600/15 text-indigo-300 border border-indigo-600/30 uppercase">
                    {m.type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-700 border border-gray-600 text-emerald-400">
                    {m.status}
                  </span>
                </div>

                <div className="mt-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">
                    {client?.tradingName}
                  </span>
                  <h3 className="text-sm font-bold text-white mt-0.5">{m.title}</h3>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-gray-700 border border-gray-600 space-y-1.5 text-xs text-white">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="w-3.5 h-3.5 text-indigo-300" />
                    <span>
                      Data: <strong className="text-gray-200">{m.date}</strong> às <strong className="text-gray-200">{m.time}</strong>
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-400">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>Duração: {m.durationMinutes} minutos</span>
                  </div>
                </div>
              </div>

              {/* Action */}
              <div className="pt-3 border-t border-gray-700 flex items-center justify-between gap-2">
                {m.meetingUrl ? (
                  <a
                    href={m.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 border border-gray-600 text-indigo-300 text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Entrar na Sala Virtual</span>
                  </a>
                ) : (
                  <span className="text-xs text-gray-400">Sem link cadastrado</span>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm(`Excluir a reunião "${m.title}"?`)) {
                      deleteMeeting(m.id);
                    }
                  }}
                  className="p-2 rounded-xl text-gray-500 hover:text-rose-400 hover:bg-gray-700 border border-transparent hover:border-gray-600 transition-colors cursor-pointer"
                  title="Excluir reunião"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Meeting Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form
            onSubmit={handleCreateMeeting}
            className="w-full max-w-md bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-2xl space-y-4 text-white"
          >
            <div className="flex items-center justify-between pb-2 border-b border-gray-700">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <CalendarIcon className="w-4 h-4 text-indigo-300" />
                <span>Agendar Nova Reunião</span>
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
                  value={newMeeting.clientId}
                  onChange={(e) => setNewMeeting({ ...newMeeting, clientId: e.target.value })}
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
                  Pauta / Título *
                </label>
                <input
                  type="text"
                  required
                  value={newMeeting.title}
                  onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                  placeholder="Ex: Reunião de Alinhamento Mensal & Tráfego"
                  className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">Tipo</label>
                <select
                  value={newMeeting.type}
                  onChange={(e) => setNewMeeting({ ...newMeeting, type: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
                >
                  <option value="KICKOFF">Kickoff de Onboarding</option>
                  <option value="ALINHAMENTO_SEMANAL">Alinhamento Semanal</option>
                  <option value="MENSAL_RESULTADOS">Apresentação Mensal de Resultados</option>
                  <option value="URGENCIA">Reunião de Urgência</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-gray-300 block mb-1">Data</label>
                  <input
                    type="date"
                    value={newMeeting.date}
                    onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-gray-300 block mb-1">Horário</label>
                  <input
                    type="time"
                    value={newMeeting.time}
                    onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-gray-300 block mb-1">
                  Link da Sala Virtual (Google Meet / Zoom)
                </label>
                <input
                  type="text"
                  value={newMeeting.meetingUrl}
                  onChange={(e) => setNewMeeting({ ...newMeeting, meetingUrl: e.target.value })}
                  placeholder="https://meet.google.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-gray-700 border border-gray-600 text-xs text-white placeholder-[#737373] focus:outline-none focus:border-indigo-600"
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
                Salvar Reunião
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
