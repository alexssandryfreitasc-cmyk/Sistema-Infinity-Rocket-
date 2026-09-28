import React, { useState } from 'react';
import {
  Sparkles,
  FileCheck2,
  Calendar,
  LifeBuoy,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Send,
  Building2,
  FolderLock,
  BarChart3,
  ExternalLink,
  MessageSquare,
  KeyRound
} from 'lucide-react';
import { useAgency, PIPELINE_STAGE_LABELS } from '../../context/AgencyContext';
import { ContentApprovalModal } from '../content/ContentApprovalModal';
import { ContentItem } from '../../types';

export const ClientDashboard: React.FC = () => {
  const {
    currentUser,
    activeClient,
    contents,
    meetings,
    tasks,
    reports,
    accesses,
    briefings,
    tickets,
    setActiveTab
  } = useAgency();

  const [selectedContentForApproval, setSelectedContentForApproval] = useState<ContentItem | null>(null);

  if (!activeClient) {
    return (
      <div className="p-12 text-center text-slate-400">
        <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-600" />
        <p className="text-sm font-semibold">Nenhum projeto de cliente vinculado a esta conta.</p>
      </div>
    );
  }

  const clientContents = contents.filter((c) => c.clientId === activeClient.id);
  const pendingApprovals = clientContents.filter((c) => c.status === 'AGUARDANDO_CLIENTE');
  const clientMeetings = meetings.filter((m) => m.clientId === activeClient.id && m.status === 'AGENDADA');
  const clientTasks = tasks.filter((t) => t.clientId === activeClient.id);
  const clientAccesses = accesses.filter((a) => a.clientId === activeClient.id);
  const clientBriefing = briefings[activeClient.id];
  const pendingAccessCount = clientAccesses.filter((a) => a.status === 'PENDENTE').length;

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Welcoming Hero Banner */}
      <div className="p-6 sm:p-8 rounded-xl bg-gradient-to-br from-gray-800 via-[#1F2937] to-gray-900 border border-gray-600 relative overflow-hidden shadow-2xl">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-600/15 text-indigo-300 border border-indigo-600/30 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Portal Oficial do Cliente</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Olá, {currentUser.name.split(' ')[0]}!
          </h1>

          <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
            Vamos cuidar do seu marketing. Acompanhe abaixo o status do seu projeto, aprove conteúdos da semana e fique por dentro das próximas entregas.
          </p>
        </div>

        {/* Quick Need Help Button on Banner */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => setActiveTab('solicitacoes')}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-black text-xs font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-2 cursor-pointer active:scale-95"
          >
            <LifeBuoy className="w-4 h-4" />
            <span>Preciso de Ajuda / Abrir Solicitação</span>
          </button>

          {activeClient.whatsappGroup.link && (
            <a
              href={activeClient.whatsappGroup.link}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-colors flex items-center space-x-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Abrir Grupo no WhatsApp</span>
            </a>
          )}
        </div>
      </div>

      {/* 2. Onboarding Progress Bar Section */}
      <div className="p-5 rounded-lg bg-gray-800 border border-gray-700 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-300" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Progresso do Onboarding
            </h3>
          </div>
          <span className="text-xs font-bold text-indigo-300 font-mono">
            {activeClient.onboardingProgress}% Concluído
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-3 bg-gray-900 rounded-full overflow-hidden p-0.5 border border-gray-600">
          <div
            className="h-full bg-gradient-to-r from-[#5850ec] via-[#4f46e5] to-[#8da2fb] rounded-full transition-all duration-700"
            style={{ width: `${activeClient.onboardingProgress}%` }}
          />
        </div>

        {/* Onboarding Steps Checklist Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
          {/* Step 1: WhatsApp */}
          <div
            onClick={() => setActiveTab('onboarding')}
            className={`p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-colors ${
              activeClient.whatsappGroup.status === 'CONFIRMADO'
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <div className="flex items-center space-x-2">
              <CheckCircle2
                className={`w-4 h-4 ${
                  activeClient.whatsappGroup.status === 'CONFIRMADO' ? 'text-emerald-400' : 'text-gray-400'
                }`}
              />
              <span>1. Grupo WhatsApp</span>
            </div>
            <span className="text-[10px] uppercase font-bold">
              {activeClient.whatsappGroup.status === 'CONFIRMADO' ? 'OK' : 'Pendente'}
            </span>
          </div>

          {/* Step 2: Briefing */}
          <div
            onClick={() => setActiveTab('briefing')}
            className={`p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-colors ${
              clientBriefing?.isComplete
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <div className="flex items-center space-x-2">
              <CheckCircle2
                className={`w-4 h-4 ${clientBriefing?.isComplete ? 'text-emerald-400' : 'text-gray-400'}`}
              />
              <span>2. Briefing da Empresa</span>
            </div>
            <span className="text-[10px] uppercase font-bold">
              {clientBriefing?.isComplete ? 'OK' : 'Preencher'}
            </span>
          </div>

          {/* Step 3: Accesses */}
          <div
            onClick={() => setActiveTab('acessos')}
            className={`p-3 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-colors ${
              pendingAccessCount === 0
                ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                : 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <div className="flex items-center space-x-2">
              <CheckCircle2
                className={`w-4 h-4 ${pendingAccessCount === 0 ? 'text-emerald-400' : 'text-gray-400'}`}
              />
              <span>3. Central de Acessos</span>
            </div>
            <span className="text-[10px] uppercase font-bold">
              {pendingAccessCount === 0 ? 'OK' : `${pendingAccessCount} pendente(s)`}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Core Action: Conteúdos Aguardando Sua Aprovação */}
      <div className="p-6 rounded-lg bg-gray-800 border border-gray-700 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-gray-700">
          <div>
            <h2 className="text-base font-bold text-white flex items-center space-x-2">
              <FileCheck2 className="w-5 h-5 text-emerald-400" />
              <span>Conteúdos para Aprovação</span>
            </h2>
            <p className="text-xs text-gray-400">
              Revise o visual, a legenda e aprove ou solicite alterações com 1 clique
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
            {pendingApprovals.length} aguardando você
          </span>
        </div>

        {pendingApprovals.length === 0 ? (
          <div className="py-8 text-center bg-gray-900 rounded-xl border border-gray-700">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-white">
              Nenhum conteúdo aguardando aprovação no momento!
            </p>
            <p className="text-[11px] text-gray-400 mt-1">
              Todos os posts enviados foram aprovados ou estão em fase de produção pela equipe.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingApprovals.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-gray-700 border border-gray-600 hover:border-gray-500 transition-all flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-600/15 text-indigo-300 font-semibold uppercase text-[10px]">
                      {item.format} • {item.platform}
                    </span>
                    <span>Data Prevista: {item.scheduledDate}</span>
                  </div>

                  <h3 className="text-sm font-bold text-white line-clamp-1">{item.title}</h3>
                  <p className="text-xs text-gray-300 line-clamp-2 mt-1 whitespace-pre-line">
                    {item.caption}
                  </p>
                </div>

                {item.mediaUrl && (
                  <div className="h-36 rounded-lg overflow-hidden bg-gray-900 relative">
                    <img
                      src={item.mediaUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <button
                  onClick={() => setSelectedContentForApproval(item)}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-black font-bold text-xs flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <FileCheck2 className="w-4 h-4" />
                  <span>Revisar & Aprovar Arte</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. Two Columns: Próxima Reunião & Próximas Entregas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Next Meeting */}
        <div className="p-5 rounded-lg bg-gray-800 border border-gray-700 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-700">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-indigo-300" />
              <span>Próxima Reunião de Alinhamento</span>
            </h3>
            <button
              onClick={() => setActiveTab('calendario')}
              className="text-xs text-indigo-300 hover:text-indigo-300 font-semibold"
            >
              Ver Calendário
            </button>
          </div>

          {clientMeetings.length === 0 ? (
            <div className="py-6 text-center text-gray-400 text-xs">
              Nenhuma reunião agendada no momento.
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-gray-700 border border-gray-600 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">{clientMeetings[0].title}</span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-600/15 text-indigo-300 font-bold uppercase">
                  {clientMeetings[0].type}
                </span>
              </div>
              <p className="text-xs text-gray-300">
                Data: <strong className="text-white">{clientMeetings[0].date}</strong> às <strong className="text-white">{clientMeetings[0].time}</strong> ({clientMeetings[0].durationMinutes} min)
              </p>
              {clientMeetings[0].meetingUrl && (
                <a
                  href={clientMeetings[0].meetingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs text-indigo-300 hover:text-indigo-300 font-semibold"
                >
                  <span>Acessar Sala Virtual</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Next Deliveries / Tasks in Progress */}
        <div className="p-5 rounded-lg bg-gray-800 border border-gray-700 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-700">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <Clock className="w-4 h-4 text-indigo-300" />
              <span>Próximas Entregas da Equipe</span>
            </h3>
            <span className="text-xs text-gray-400">Em produção</span>
          </div>

          <div className="space-y-2">
            {clientTasks.slice(0, 3).map((t) => (
              <div
                key={t.id}
                className="p-2.5 rounded-xl bg-gray-700 border border-gray-700 flex items-center justify-between text-xs"
              >
                <span className="font-semibold text-white truncate pr-2">{t.title}</span>
                <span className="text-[10px] text-gray-400 shrink-0 font-mono">Prazo: {t.dueDate}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Approval Modal */}
      {selectedContentForApproval && (
        <ContentApprovalModal
          content={selectedContentForApproval}
          onClose={() => setSelectedContentForApproval(null)}
        />
      )}
    </div>
  );
};
