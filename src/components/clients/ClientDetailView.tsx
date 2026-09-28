import React, { useState } from 'react';
import {
  Building2,
  Sparkles,
  GitPullRequest,
  CheckSquare,
  FileText,
  KeyRound,
  Users2,
  Calendar,
  LifeBuoy,
  FolderLock,
  BarChart3,
  DollarSign,
  History,
  ShieldCheck,
  ChevronRight,
  MessageSquare,
  AlertTriangle,
  Send,
  UserCheck,
  FileCheck2,
  ExternalLink,
  Cloud,
  HardDrive,
  Edit3,
  ArrowLeft
} from 'lucide-react';
import { useAgency, PIPELINE_STAGE_LABELS } from '../../context/AgencyContext';
import { BriefingForm } from '../onboarding/BriefingForm';
import { AccessChecklistVault } from '../onboarding/AccessChecklistVault';
import { WhatsAppStep } from '../onboarding/WhatsAppStep';
import { ClientOnboardingFlow } from '../onboarding/ClientOnboardingFlow';
import { PipelineKanbanView } from '../pipeline/PipelineKanbanView';
import { EditClientModal } from './EditClientModal';

export const ClientDetailView: React.FC = () => {
  const {
    activeClient,
    clients,
    tasks,
    contents,
    financials,
    users,
    briefings,
    accesses,
    meetings,
    tickets,
    documents,
    reports,
    auditLogs,
    updateClient,
    advancePipelineStage,
    generateMonthlyCycleTasks,
    currentUser,
    setCurrentUser,
    setActiveTab,
    setActiveClientId
  } = useAgency();

  const [activeSubTab, setActiveSubTab] = useState<string>('visao_geral');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!activeClient) {
    return (
      <div className="p-12 text-center text-slate-400">
        <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-600" />
        <p className="text-sm font-semibold">Nenhum cliente selecionado.</p>
      </div>
    );
  }

  const clientTasks = tasks.filter((t) => t.clientId === activeClient.id);
  const clientContents = contents.filter((c) => c.clientId === activeClient.id);
  const clientAccesses = accesses.filter((a) => a.clientId === activeClient.id);
  const clientFin = financials.find((f) => f.clientId === activeClient.id);
  const clientMeetings = meetings.filter((m) => m.clientId === activeClient.id);
  const clientTickets = tickets.filter((t) => t.clientId === activeClient.id);
  const clientDocs = documents.filter((d) => d.clientId === activeClient.id);
  const clientAudit = auditLogs.filter((l) => l.clientId === activeClient.id);
  const clientBriefing = briefings[activeClient.id];

  const clientUser = users.find((u) => u.clientId === activeClient.id);

  const tabs = [
    { id: 'visao_geral', label: 'Visão Geral', icon: Building2 },
    { id: 'pipeline', label: 'Pipeline Operacional', icon: GitPullRequest },
    { id: 'onboarding', label: 'Onboarding Imersivo', icon: Sparkles, badge: `${activeClient.onboardingProgress}%` },
    { id: 'briefing', label: 'Briefing', icon: FileText, badge: clientBriefing?.isComplete ? 'OK' : 'Pendente' },
    { id: 'acessos', label: 'Central de Acessos', icon: KeyRound, badge: `${clientAccesses.filter((a) => a.status === 'VALIDADO').length}/${clientAccesses.length}` },
    { id: 'equipe', label: 'Equipe Atribuída', icon: Users2 },
    { id: 'tarefas', label: 'Tarefas', icon: CheckSquare, badge: `${clientTasks.filter((t) => t.status !== 'CONCLUIDA').length}` },
    { id: 'conteudo', label: 'Conteúdos & Aprovação', icon: FileCheck2, badge: `${clientContents.filter((c) => c.status === 'AGUARDANDO_CLIENTE').length}` },
    { id: 'calendario', label: 'Reuniões & Agenda', icon: Calendar },
    { id: 'solicitacoes', label: 'Chamados / SLA', icon: LifeBuoy, badge: `${clientTickets.filter((t) => t.status !== 'RESOLVIDO').length}` },
    { id: 'documentos', label: 'Documentos & Arquivos', icon: FolderLock },
    { id: 'relatorios', label: 'Relatórios de Métricas', icon: BarChart3 },
    { id: 'financeiro', label: 'Financeiro & Contrato', icon: DollarSign },
    { id: 'historico', label: 'Timeline & Auditoria', icon: History }
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Back to Clients list button */}
      <div>
        <button
          onClick={() => setActiveClientId('')}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-xs font-semibold text-gray-300 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-indigo-400" />
          <span>Voltar para Todos os Clientes</span>
        </button>
      </div>

      {/* Header Banner */}
      <div className="p-6 rounded-xl bg-gray-800 border border-gray-700 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-14 h-14 rounded-lg bg-gradient-to-tr from-[#5850ec] via-[#4f46e5] to-[#e6ca65] flex items-center justify-center font-black text-black text-xl shadow-lg shrink-0">
              {activeClient.tradingName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl font-extrabold text-white tracking-tight">
                  {activeClient.tradingName}
                </h1>
                <span
                  className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full border ${
                    activeClient.status === 'ATIVO'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : activeClient.status === 'ONBOARDING'
                      ? 'bg-indigo-600/20 text-indigo-300 border-indigo-600/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  }`}
                >
                  {activeClient.status}
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-gray-700 border border-gray-600 text-gray-200 font-medium">
                  {PIPELINE_STAGE_LABELS[activeClient.pipelineStage]}
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {activeClient.companyName} • CNPJ: {activeClient.cnpj || 'Não informado'} • {activeClient.segment}
              </p>
            </div>
          </div>

          {/* Quick Actions for this Client */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Edit Client Button */}
            {(currentUser.role === 'ADMIN' || currentUser.role === 'GESTOR') && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-3 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 border border-gray-600 text-xs font-semibold text-white transition-colors flex items-center space-x-1.5 cursor-pointer"
                title="Editar informações cadastrais do cliente"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-300" />
                <span>Editar Cliente</span>
              </button>
            )}

            {/* Generate Monthly Recurring Cycle */}
            {(currentUser.role === 'ADMIN' || currentUser.role === 'GESTOR') && (
              <button
                onClick={() => generateMonthlyCycleTasks(activeClient.id)}
                className="px-3 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 border border-gray-600 text-xs font-semibold text-white transition-colors flex items-center space-x-1.5 cursor-pointer"
                title="Gera automaticamente a grade de tarefas do mês de acordo com o plano"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                <span>Gerar Ciclo Mensal</span>
              </button>
            )}

            {/* Simulate Client Login */}
            {clientUser && currentUser.role !== 'CLIENTE' && (
              <button
                onClick={() => {
                  setCurrentUser(clientUser);
                  setActiveTab('dashboard');
                }}
                className="px-3 py-2 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-600/40 text-indigo-300 text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Entrar como Cliente</span>
              </button>
            )}
          </div>
        </div>

        {/* Client Tabs Navigation */}
        <div className="flex items-center space-x-1 overflow-x-auto pt-2 border-t border-gray-700 scrollbar-none">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = activeSubTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveSubTab(t.id)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span>{t.label}</span>
                {t.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-gray-900 text-gray-300'
                    }`}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sub-Tab Content Rendering */}
      {activeSubTab === 'visao_geral' && (
        <div className="space-y-6">
          {/* Health Score Banner */}
          <div className="p-5 rounded-lg bg-gray-800 border border-gray-700 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-indigo-300" />
                <h3 className="text-sm font-bold text-white">Client Health Score (0 - 100)</h3>
              </div>
              <span
                className={`text-base font-black px-3 py-1 rounded-xl ${
                  activeClient.healthScore >= 80
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : activeClient.healthScore >= 60
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                }`}
              >
                {activeClient.healthScore} / 100 pts
              </span>
            </div>

            <p className="text-xs text-gray-200 leading-relaxed bg-gray-700 p-3 rounded-xl border border-gray-700">
              {activeClient.healthScoreDetails.summary}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
              <div className="p-3 rounded-xl bg-gray-700 border border-gray-700">
                <span className="text-gray-400 text-[10px] uppercase font-semibold block">Penalidade de Atrasos:</span>
                <span className="font-bold text-rose-400">{activeClient.healthScoreDetails.overdueTasksPenalty} pts</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-700 border border-gray-700">
                <span className="text-gray-400 text-[10px] uppercase font-semibold block">Aprovações Pendentes:</span>
                <span className="font-bold text-amber-400">{activeClient.healthScoreDetails.pendingApprovalsPenalty} pts</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-700 border border-gray-700">
                <span className="text-gray-400 text-[10px] uppercase font-semibold block">Comunicação WhatsApp:</span>
                <span className="font-bold text-emerald-400">{activeClient.healthScoreDetails.communicationScore}%</span>
              </div>
              <div className="p-3 rounded-xl bg-gray-700 border border-gray-700">
                <span className="text-gray-400 text-[10px] uppercase font-semibold block">Status Pagamentos:</span>
                <span className="font-bold text-emerald-400">{activeClient.healthScoreDetails.paymentStatusScore}%</span>
              </div>
            </div>
          </div>

          {/* Quick Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Contract & Social Data */}
            <div className="p-5 rounded-lg bg-gray-800 border border-gray-700 space-y-4">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Dados do Contrato & Canais Digitais
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-gray-700">
                  <span className="text-gray-400">Responsável:</span>
                  <span className="text-white font-semibold">{activeClient.contactName}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-700">
                  <span className="text-gray-400">E-mail:</span>
                  <span className="text-white font-mono">{activeClient.email}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-700">
                  <span className="text-gray-400">WhatsApp:</span>
                  <span className="text-white font-mono">{activeClient.whatsapp}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-700">
                  <span className="text-gray-400">Instagram:</span>
                  <span className="text-indigo-300 font-semibold">{activeClient.instagram || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-700">
                  <span className="text-gray-400">Plano Contratado:</span>
                  <span className="text-indigo-300 font-bold">
                    {activeClient.plan} (R$ {activeClient.monthlyValue.toLocaleString('pt-BR')}/mês)
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-gray-700">
                  <span className="text-gray-400">Início / Renovação:</span>
                  <span className="text-gray-200">
                    {activeClient.startDate} até {activeClient.renewalDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: WhatsApp Group & Onboarding Checklist */}
            <div className="p-5 rounded-lg bg-gray-800 border border-gray-700 space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Etapa WhatsApp & Onboarding
                </h3>

                <div className="p-3.5 rounded-xl bg-gray-700 border border-gray-700 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">Grupo no WhatsApp:</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        activeClient.whatsappGroup.status === 'CONFIRMADO'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {activeClient.whatsappGroup.status}
                    </span>
                  </div>
                  {activeClient.whatsappGroup.link && (
                    <a
                      href={activeClient.whatsappGroup.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-400 text-[11px] truncate block hover:underline"
                    >
                      {activeClient.whatsappGroup.link}
                    </a>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-gray-700 border border-gray-700 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">Briefing da Empresa:</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        clientBriefing?.isComplete
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {clientBriefing?.isComplete ? 'Preenchido' : 'Pendente'}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    {clientBriefing?.isComplete
                      ? 'Todas as 16 diretrizes estratégicas e personas registradas.'
                      : 'Aguardando preenchimento completo pelo cliente.'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveSubTab('onboarding')}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
              >
                <span>Acessar Etapas de Onboarding</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'pipeline' && (
        <PipelineKanbanView focusedClientId={activeClient.id} />
      )}

      {activeSubTab === 'onboarding' && (
        <ClientOnboardingFlow client={activeClient} />
      )}

      {activeSubTab === 'briefing' && (
        <BriefingForm clientId={activeClient.id} />
      )}

      {activeSubTab === 'acessos' && (
        <AccessChecklistVault clientId={activeClient.id} />
      )}

      {activeSubTab === 'equipe' && (
        <div className="p-6 rounded-lg bg-gray-800 border border-gray-700 space-y-4">
          <h3 className="text-sm font-bold text-white">Equipe Responsável pela Conta</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { role: 'Account Manager', userId: activeClient.team.accountManagerId },
              { role: 'Social Media', userId: activeClient.team.socialMediaId },
              { role: 'Designer', userId: activeClient.team.designerId },
              { role: 'Copywriter', userId: activeClient.team.copywriterId },
              { role: 'Gestor de Tráfego', userId: activeClient.team.trafficManagerId }
            ].map((slot, idx) => {
              const user = users.find((u) => u.id === slot.userId);
              return (
                <div key={idx} className="p-4 rounded-xl bg-gray-700 border border-gray-600 flex items-center space-x-3">
                  {user ? (
                    <>
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-gray-600" />
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">{slot.role}</span>
                        <p className="text-xs font-bold text-white truncate">{user.name}</p>
                        <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                      </div>
                    </>
                  ) : (
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{slot.role}</span>
                      <p className="text-xs text-gray-400 italic">Não atribuído</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeSubTab === 'tarefas' && (
        <div className="p-6 rounded-lg bg-gray-800 border border-gray-700 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-700">
            <h3 className="text-sm font-bold text-white">Tarefas do Projeto ({clientTasks.length})</h3>
            <button
              onClick={() => setActiveTab('tarefas')}
              className="text-xs text-indigo-300 hover:text-indigo-300 font-semibold cursor-pointer"
            >
              Abrir Módulo de Tarefas
            </button>
          </div>
          <div className="space-y-2">
            {clientTasks.map((t) => (
              <div key={t.id} className="p-3 rounded-xl bg-gray-700 border border-gray-600 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-white">{t.title}</p>
                  <p className="text-[11px] text-gray-400">Prazo: {t.dueDate} • Categoria: {t.category}</p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-600 text-gray-200">
                  {t.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'conteudo' && (
        <div className="p-6 rounded-lg bg-gray-800 border border-gray-700 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-700">
            <h3 className="text-sm font-bold text-white">Grade Editorial & Aprovações</h3>
            <button
              onClick={() => setActiveTab('conteudo')}
              className="text-xs text-indigo-300 hover:text-indigo-300 font-semibold cursor-pointer"
            >
              Abrir Calendário Completo
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clientContents.map((cnt) => (
              <div key={cnt.id} className="p-4 rounded-xl bg-gray-700 border border-gray-600 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-indigo-300">{cnt.format} • {cnt.platform}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-gray-600 text-gray-200">{cnt.status}</span>
                </div>
                <h4 className="text-sm font-bold text-white">{cnt.title}</h4>
                <p className="text-xs text-gray-300 line-clamp-2">{cnt.caption}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'calendario' && (
        <div className="p-6 rounded-lg bg-gray-800 border border-gray-700 space-y-4">
          <h3 className="text-sm font-bold text-white">Reuniões Agendadas</h3>
          <div className="space-y-3">
            {clientMeetings.map((m) => (
              <div key={m.id} className="p-4 rounded-xl bg-gray-700 border border-gray-600 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-white">{m.title}</h4>
                  <p className="text-gray-400">{m.date} às {m.time} ({m.durationMinutes} min) • Tipo: {m.type}</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-bold">{m.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'solicitacoes' && (
        <div className="p-6 rounded-lg bg-gray-800 border border-gray-700 space-y-4">
          <h3 className="text-sm font-bold text-white">Chamados & Solicitações de Suporte</h3>
          <div className="space-y-3">
            {clientTickets.map((t) => (
              <div key={t.id} className="p-4 rounded-xl bg-gray-700 border border-gray-600 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-white">{t.title}</h4>
                  <p className="text-gray-400">{t.description}</p>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">{t.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'documentos' && (
        <div className="p-6 rounded-lg bg-gray-800 border border-gray-700 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-700">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <FolderLock className="w-4 h-4 text-indigo-300" />
                <span>Documentos, Ativos & Google Drive ({clientDocs.length})</span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Arquivos do cliente sincronizados e vinculados à conta.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('documentos')}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center space-x-1.5 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <span>Abrir Gerenciador de Arquivos</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          {activeClient.driveFolder?.isLinked && (
            <div className="p-3.5 rounded-xl bg-gray-700 border border-[#1a73e8]/30 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-2.5">
                <HardDrive className="w-4 h-4 text-[#8ab4f8]" />
                <div>
                  <span className="font-bold text-white">{activeClient.driveFolder.name}</span>
                  <span className="text-[10px] text-gray-400 ml-2 font-mono">Pasta Conectada</span>
                </div>
              </div>
              {activeClient.driveFolder.webViewLink && (
                <a
                  href={activeClient.driveFolder.webViewLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#8ab4f8] hover:underline flex items-center space-x-1"
                >
                  <span>Ver Pasta no Drive</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {clientDocs.map((d) => (
              <div key={d.id} className="p-3.5 rounded-xl bg-gray-700 border border-gray-600 text-xs space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-600/15 text-indigo-300 uppercase">
                      {d.category}
                    </span>
                    {d.isDriveSync && (
                      <span className="text-[9px] font-semibold text-[#8ab4f8] flex items-center space-x-1">
                        <Cloud className="w-2.5 h-2.5" />
                        <span>Drive</span>
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-white truncate mt-2">{d.name}</p>
                  <p className="text-[10px] text-gray-400">{d.fileSize}</p>
                </div>
                <a
                  href={d.driveWebViewLink || d.url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-1.5 rounded-lg bg-gray-600 hover:bg-[#2c2c2c] text-gray-200 text-[11px] font-semibold flex items-center justify-center space-x-1 transition-colors"
                >
                  <ExternalLink className="w-3 h-3 text-indigo-300" />
                  <span>Acessar</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSubTab === 'relatorios' && (
        <div className="p-6 rounded-lg bg-gray-800 border border-gray-700 space-y-4">
          <h3 className="text-sm font-bold text-white">Relatórios de Desempenho</h3>
          <p className="text-xs text-gray-400">Consulte relatórios mensais e evolução de métricas de tráfego e engajamento.</p>
        </div>
      )}

      {activeSubTab === 'financeiro' && (
        <div className="p-6 rounded-lg bg-gray-800 border border-gray-700 space-y-4">
          <h3 className="text-sm font-bold text-white">Faturamento & Cobrança</h3>
          {clientFin && (
            <div className="p-4 rounded-xl bg-gray-700 border border-gray-600 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Plano:</span>
                <span className="font-bold text-white">{clientFin.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Mensalidade:</span>
                <span className="font-bold text-indigo-300">R$ {clientFin.monthlyValue.toLocaleString('pt-BR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Status de Pagamento:</span>
                <span className="font-bold text-white">{clientFin.status}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'historico' && (
        <div className="p-6 rounded-lg bg-gray-800 border border-gray-700 space-y-4">
          <h3 className="text-sm font-bold text-white">Timeline Operacional & Auditoria</h3>
          <div className="space-y-2.5">
            {clientAudit.map((log) => (
              <div key={log.id} className="p-3 rounded-xl bg-gray-700 border border-gray-700 text-xs">
                <div className="flex items-center justify-between text-gray-400 text-[10px]">
                  <span>{log.userName}</span>
                  <span>{new Date(log.timestamp).toLocaleString()}</span>
                </div>
                <p className="text-white font-medium mt-1">{log.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {isEditModalOpen && (
        <EditClientModal client={activeClient} onClose={() => setIsEditModalOpen(false)} />
      )}
    </div>
  );
};
