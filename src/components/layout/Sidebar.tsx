import React from 'react';
import {
  LayoutDashboard,
  Building2,
  GitPullRequest,
  CheckSquare,
  FileText,
  Calendar,
  LifeBuoy,
  FolderLock,
  BarChart3,
  DollarSign,
  Users2,
  Zap,
  Layers,
  History,
  ShieldCheck,
  Sparkles,
  KeyRound,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  MessageSquare,
  Settings,
  LogOut,
  Rocket
} from 'lucide-react';
import { useAgency } from '../../context/AgencyContext';

export const Sidebar: React.FC = () => {
  const {
    currentUser,
    activeTab,
    setActiveTab,
    logout,
    tasks,
    contents,
    tickets,
    clients,
    activeClient
  } = useAgency();

  // Badge calculations
  const myOverdueTasks = tasks.filter(
    (t) =>
      t.dueDate < new Date().toISOString().split('T')[0] &&
      t.status !== 'CONCLUIDA' &&
      t.status !== 'CANCELADA' &&
      (currentUser.role === 'ADMIN' || currentUser.role === 'GESTOR' || t.assignedToId === currentUser.id)
  ).length;

  const pendingApprovalsCount = contents.filter(
    (c) => c.status === 'AGUARDANDO_CLIENTE' && (currentUser.role !== 'CLIENTE' || c.clientId === activeClient?.id)
  ).length;

  const openTicketsCount = tickets.filter(
    (t) => t.status !== 'RESOLVIDO' && (currentUser.role !== 'CLIENTE' || t.clientId === activeClient?.id)
  ).length;

  const onboardingClientsCount = clients.filter((c) => c.status === 'ONBOARDING').length;

  // Build navigation items based on User Role
  const getNavItems = () => {
    switch (currentUser.role) {
      case 'ADMIN':
        return [
          { id: 'dashboard', label: 'Dashboard Executivo', icon: LayoutDashboard },
          { id: 'clientes', label: 'Clientes & Projetos', icon: Building2, badge: onboardingClientsCount > 0 ? `${onboardingClientsCount} Onb` : undefined },
          { id: 'pipeline', label: 'Pipeline Operacional', icon: GitPullRequest },
          { id: 'tarefas', label: 'Gestão de Tarefas', icon: CheckSquare, badge: myOverdueTasks > 0 ? `${myOverdueTasks} atraso` : undefined, badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
          { id: 'conteudo', label: 'Conteúdo & Aprovação', icon: FileText, badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount}` : undefined, badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
          { id: 'calendario', label: 'Calendário & Reuniões', icon: Calendar },
          { id: 'solicitacoes', label: 'Central de Chamados', icon: LifeBuoy, badge: openTicketsCount > 0 ? `${openTicketsCount}` : undefined },
          { id: 'acessos', label: 'Cofre de Acessos', icon: KeyRound },
          { id: 'documentos', label: 'Documentos & Arquivos', icon: FolderLock },
          { id: 'relatorios', label: 'Relatórios de Métricas', icon: BarChart3 },
          { id: 'financeiro', label: 'Gestão Financeira & MRR', icon: DollarSign },
          { id: 'equipe', label: 'Produtividade da Equipe', icon: Users2 },
          { id: 'automacoes', label: 'Automações & Regras', icon: Zap },
          { id: 'templates', label: 'Templates & Processos', icon: Layers },
          { id: 'auditoria', label: 'Auditoria & Logs', icon: History },
          { id: 'configuracoes', label: 'Configurações & Perfil', icon: Settings }
        ];

      case 'GESTOR':
        return [
          { id: 'dashboard', label: 'Dashboard de Gestão', icon: LayoutDashboard },
          { id: 'clientes', label: 'Clientes Atribuídos', icon: Building2 },
          { id: 'pipeline', label: 'Pipeline Operacional', icon: GitPullRequest },
          { id: 'tarefas', label: 'Tarefas da Equipe', icon: CheckSquare, badge: myOverdueTasks > 0 ? `${myOverdueTasks}` : undefined, badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
          { id: 'conteudo', label: 'Conteúdos & Aprovações', icon: FileText, badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount}` : undefined },
          { id: 'calendario', label: 'Calendário & Reuniões', icon: Calendar },
          { id: 'solicitacoes', label: 'Chamados & SLA', icon: LifeBuoy, badge: openTicketsCount > 0 ? `${openTicketsCount}` : undefined },
          { id: 'acessos', label: 'Validação de Acessos', icon: KeyRound },
          { id: 'documentos', label: 'Documentos', icon: FolderLock },
          { id: 'relatorios', label: 'Relatórios Mensais', icon: BarChart3 },
          { id: 'equipe', label: 'Capacidade da Equipe', icon: Users2 },
          { id: 'automacoes', label: 'Automações & Regras', icon: Zap },
          { id: 'templates', label: 'Templates & Processos', icon: Layers },
          { id: 'configuracoes', label: 'Configurações & Perfil', icon: Settings }
        ];

      case 'COLABORADOR':
        return [
          { id: 'dashboard', label: 'Minha Semana (Painel)', icon: LayoutDashboard },
          { id: 'tarefas', label: 'Minhas Tarefas', icon: CheckSquare, badge: myOverdueTasks > 0 ? `${myOverdueTasks}` : undefined, badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
          { id: 'conteudo', label: 'Produção de Conteúdo', icon: FileText },
          { id: 'clientes', label: 'Clientes Designados', icon: Building2 },
          { id: 'calendario', label: 'Calendário de Entregas', icon: Calendar },
          { id: 'solicitacoes', label: 'Solicitações Técnicas', icon: LifeBuoy },
          { id: 'configuracoes', label: 'Configurações & Perfil', icon: Settings }
        ];

      case 'CLIENTE':
        return [
          { id: 'dashboard', label: 'Início & Visão Geral', icon: LayoutDashboard },
          { id: 'onboarding', label: 'Meu Onboarding', icon: Sparkles, badge: `${activeClient?.onboardingProgress || 0}%`, badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
          { id: 'briefing', label: 'Briefing da Empresa', icon: FileText },
          { id: 'acessos', label: 'Central de Acessos', icon: KeyRound },
          { id: 'conteudo', label: 'Aprovar Conteúdos', icon: FileCheck2, badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} pendente` : undefined, badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
          { id: 'calendario', label: 'Calendário Editorial', icon: Calendar },
          { id: 'solicitacoes', label: 'Preciso de Ajuda (Chamados)', icon: LifeBuoy },
          { id: 'documentos', label: 'Documentos & Contratos', icon: FolderLock },
          { id: 'relatorios', label: 'Meus Resultados & Relatórios', icon: BarChart3 },
          { id: 'configuracoes', label: 'Minha Conta & Senha', icon: Settings }
        ];

      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col h-full shrink-0 select-none">
      {/* Brand Logo Header */}
      <div 
        onClick={() => setActiveTab('dashboard')} 
        className="h-16 flex items-center px-6 border-b border-gray-700 cursor-pointer hover:bg-gray-700/30 transition-colors shrink-0"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-indigo-600/30">
            <Rocket className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm leading-tight flex items-center">
              InfinityRocket <span className="text-[10px] text-indigo-300 font-medium ml-1.5 border border-[#8da2fb]/30 px-1 py-0.2 rounded leading-none">PRO</span>
            </h1>
            <p className="text-[10px] text-gray-400">Marketing OS</p>
          </div>
        </div>
      </div>

      {/* Client Quick Focus Card (If Cliente or Client is Focused) */}
      {currentUser.role === 'CLIENTE' && activeClient && (
        <div className="p-3 m-3 bg-gray-900 border border-indigo-600/30 rounded-lg">
          <div className="flex items-center space-x-2 mb-1.5">
            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-[11px] font-semibold text-indigo-300 uppercase tracking-wider">Portal do Cliente</span>
          </div>
          <p className="text-xs font-bold text-white truncate">{activeClient.companyName}</p>
          <div className="mt-2.5">
            <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
              <span>Progresso de Onboarding</span>
              <span className="font-bold text-indigo-300">{activeClient.onboardingProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 transition-all duration-500"
                style={{ width: `${activeClient.onboardingProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Módulos Operacionais
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-3 py-2.5 rounded-md flex items-center justify-between transition-colors group cursor-pointer ${
                isActive
                  ? 'bg-indigo-600/15 text-indigo-300 font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-300' : 'text-gray-400 group-hover:text-white'}`} />
                <span className="text-sm truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    item.badgeColor || (isActive ? 'bg-indigo-600/30 text-indigo-300' : 'bg-gray-700 text-gray-300')
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer User Quick Actions & System Status */}
      <div className="p-4 border-t border-gray-700 space-y-2 shrink-0">
        <button
          onClick={() => setActiveTab('configuracoes')}
          className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
            activeTab === 'configuracoes' ? 'bg-indigo-600/15 text-indigo-300' : 'text-gray-400 hover:text-white hover:bg-gray-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <Settings className="w-4 h-4 text-gray-400" />
            <span className="font-medium">Configurações</span>
          </div>
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center justify-between px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-md transition-colors cursor-pointer"
          title="Encerrar Sessão"
        >
          <div className="flex items-center gap-3">
            <span className="font-medium">Sair</span>
          </div>
          <LogOut className="w-4 h-4" />
        </button>

        <div className="pt-3 px-3 flex items-center justify-between text-xs text-gray-500 border-t border-gray-700/50">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="truncate">{currentUser.name}</span>
          </div>
          <span className="font-mono">v3.2</span>
        </div>
      </div>
    </aside>
  );
};
