import {
  User,
  Client,
  PlanConfig,
  BriefingData,
  AccessCredential,
  Task,
  ContentItem,
  Meeting,
  Ticket,
  DocumentFile,
  FinancialRecord,
  Transaction,
  MonthlyReport,
  AutomationRule,
  AuditLog,
  ProcessTemplate,
  NotificationItem
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin-default',
    name: 'Administrador InfinityRocket',
    email: 'alexssandryfreitasc@gmail.com',
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Administrador Geral',
    department: 'Diretoria',
    phone: '',
    workloadHours: 0,
    maxCapacityHours: 40,
    status: 'ATIVO',
    createdAt: new Date().toISOString()
  }
];

export const INITIAL_PLANS: PlanConfig[] = [
  {
    id: 'BASICO',
    name: 'Plano Starter',
    monthlyValue: 3500,
    postsPerMonth: 12,
    reelsPerMonth: 4,
    storiesPerMonth: 20,
    trafficManagement: false,
    biweeklyMeetings: false,
    weeklyReports: false,
    prioritySupport: false,
    features: ['12 Posts Mensais (Carrossel/Estático)', '4 Reels Gravados ou Editados', 'Suporte em horário comercial', 'Relatório Mensal']
  },
  {
    id: 'PRO',
    name: 'Plano Growth Pro',
    monthlyValue: 6800,
    postsPerMonth: 20,
    reelsPerMonth: 8,
    storiesPerMonth: 40,
    trafficManagement: true,
    biweeklyMeetings: true,
    weeklyReports: true,
    prioritySupport: true,
    features: ['20 Posts Mensais Estratégicos', '8 Reels com Roteiro e Edição', 'Gestão de Tráfego Pago', 'Reunião Quinzenal de Alinhamento', 'Relatórios Semanais + Mensal']
  },
  {
    id: 'PREMIUM',
    name: 'Plano Scale Premium',
    monthlyValue: 12500,
    postsPerMonth: 30,
    reelsPerMonth: 16,
    storiesPerMonth: 80,
    trafficManagement: true,
    biweeklyMeetings: true,
    weeklyReports: true,
    prioritySupport: true,
    features: ['Produção Diária de Conteúdo', '16 Reels / Vídeos', 'Gestão Completa Multicanal', 'Reuniões Semanais de Estratégia', 'Suporte Prioritário']
  },
  {
    id: 'ENTERPRISE',
    name: 'Plano Enterprise Custom',
    monthlyValue: 20000,
    postsPerMonth: 50,
    reelsPerMonth: 25,
    storiesPerMonth: 120,
    trafficManagement: true,
    biweeklyMeetings: true,
    weeklyReports: true,
    prioritySupport: true,
    features: ['Operação Exclusiva Dedicada', 'Produção Audiovisual Completa', 'Squad Dedicado', 'Consultoria Executiva de Crescimento']
  }
];

export const INITIAL_CLIENTS: Client[] = [];
export const INITIAL_BRIEFINGS: Record<string, BriefingData> = {};
export const INITIAL_ACCESSES: AccessCredential[] = [];
export const INITIAL_TASKS: Task[] = [];
export const INITIAL_CONTENT: ContentItem[] = [];
export const INITIAL_MEETINGS: Meeting[] = [];
export const INITIAL_TICKETS: Ticket[] = [];
export const INITIAL_DOCUMENTS: DocumentFile[] = [];
export const INITIAL_FINANCIAL: FinancialRecord[] = [];
export const INITIAL_TRANSACTIONS: Transaction[] = [];
export const INITIAL_REPORTS: MonthlyReport[] = [];
export const INITIAL_AUTOMATIONS: AutomationRule[] = [
  {
    id: 'aut-gating-briefing',
    title: 'Gating de Briefing Obrigatório',
    condition: 'Quando o cliente tentar avançar além da etapa BRIEFING no pipeline',
    action: 'Bloquear avanço se o formulário de Briefing não estiver 100% preenchido',
    isActive: true,
    lastTriggeredAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    timesTriggered: 12
  },
  {
    id: 'aut-gating-approval',
    title: 'Trava de Produção sem Aprovação',
    condition: 'Quando o status do conteúdo for movido para PUBLICAÇÃO',
    action: 'Impedir publicação sem aprovação explícita do cliente no portal',
    isActive: true,
    lastTriggeredAt: new Date(Date.now() - 3600000 * 18).toISOString(),
    timesTriggered: 34
  },
  {
    id: 'aut-overdue-alert',
    title: 'Alerta de Tarefa Atrasada da Equipe',
    condition: 'Quando uma tarefa atingir prazo vencido (D+1) sem conclusão',
    action: 'Notificar Gestor de Contas e aplicar dedução de 5 pontos no Health Score do projeto',
    isActive: true,
    lastTriggeredAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    timesTriggered: 8
  },
  {
    id: 'aut-onboarding-tasks',
    title: 'Disparo de Tarefas de Kickoff',
    condition: 'Quando um novo cliente for cadastrado com status ONBOARDING',
    action: 'Instanciar automaticamente a grade padrão de 6 tarefas de boas-vindas para o time',
    isActive: true,
    lastTriggeredAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    timesTriggered: 15
  },
  {
    id: 'aut-sla-ticket-priority',
    title: 'Roteamento Urgente de Chamados',
    condition: 'Quando um chamado for aberto pelo cliente com prioridade URGENTE',
    action: 'Atribuir SLA de 4 horas e disparar alerta de alta prioridade na Central',
    isActive: true,
    lastTriggeredAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    timesTriggered: 5
  },
  {
    id: 'aut-mrr-recurring-cycle',
    title: 'Gerador Automático de Ciclo Mensal',
    condition: 'No 1º dia útil de cada mês para clientes ATIVOS com plano regular',
    action: 'Criar tarefas de Planejamento Editorial, Redação, Design e Tráfego do mês',
    isActive: true,
    lastTriggeredAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    timesTriggered: 22
  }
];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_TEMPLATES: ProcessTemplate[] = [
  {
    id: 'tpl-onboarding-padrao',
    name: 'Onboarding Completo de Novo Cliente',
    planId: 'PRO',
    description: 'Fluxo padrão de 14 dias para integração e primeiras entregas',
    tasksCount: 6,
    defaultTasks: [
      { title: 'Enviar mensagem de boas-vindas e agendar Kickoff', category: 'ONBOARDING', relativeDays: 1, defaultRole: 'ACCOUNT_MANAGER' },
      { title: 'Criar grupo de WhatsApp operacional', category: 'ONBOARDING', relativeDays: 2, defaultRole: 'ACCOUNT_MANAGER' },
      { title: 'Coletar e validar formulário de Briefing profundo', category: 'ONBOARDING', relativeDays: 4, defaultRole: 'COPYWRITER' },
      { title: 'Solicitar acessos a Meta Business e Google Ads', category: 'ONBOARDING', relativeDays: 5, defaultRole: 'TRAFFIC_MANAGER' },
      { title: 'Estruturação do Manual de Marca e Linha Editorial', category: 'DESIGN', relativeDays: 8, defaultRole: 'DESIGNER' },
      { title: 'Apresentar Planejamento do 1º Mês ao Cliente', category: 'REUNIAO', relativeDays: 12, defaultRole: 'ACCOUNT_MANAGER' }
    ]
  },
  {
    id: 'tpl-sprint-trafego',
    name: 'Sprint de Lançamento de Tráfego Pago',
    planId: 'PRO',
    description: 'Setup completo de campanhas Meta Ads & Google Ads em 7 dias',
    tasksCount: 5,
    defaultTasks: [
      { title: 'Instalação e verificação do Pixel / CAPI / Tag Manager', category: 'TRAFEGO', relativeDays: 1, defaultRole: 'TRAFFIC_MANAGER' },
      { title: 'Criação dos públicos de remarketing e lookalike', category: 'TRAFEGO', relativeDays: 2, defaultRole: 'TRAFFIC_MANAGER' },
      { title: 'Elaboração de 6 copys de anúncios focados em conversão', category: 'COPY', relativeDays: 3, defaultRole: 'COPYWRITER' },
      { title: 'Produção dos criativos estáticos e vídeos com motion', category: 'DESIGN', relativeDays: 5, defaultRole: 'DESIGNER' },
      { title: 'Subir campanhas e realizar validação pré-lançamento', category: 'TRAFEGO', relativeDays: 7, defaultRole: 'TRAFFIC_MANAGER' }
    ]
  },
  {
    id: 'tpl-recorrencia-mensal',
    name: 'Esteira Mensal de Conteúdo & Branding',
    planId: 'PREMIUM',
    description: 'Ciclo recorrente mensal de produção e publicação contínua',
    tasksCount: 5,
    defaultTasks: [
      { title: 'Planejamento Editorial & Calendário Mensal', category: 'CONTEUDO', relativeDays: 3, defaultRole: 'SOCIAL_MEDIA' },
      { title: 'Roteiros de 8 Reels e Copys para Feed', category: 'COPY', relativeDays: 7, defaultRole: 'COPYWRITER' },
      { title: 'Design dos Criativos & Carrosséis', category: 'DESIGN', relativeDays: 12, defaultRole: 'DESIGNER' },
      { title: 'Envio para Aprovação do Cliente no Portal', category: 'CONTEUDO', relativeDays: 14, defaultRole: 'ACCOUNT_MANAGER' },
      { title: 'Agendamento e Monitoramento de Engajamento', category: 'CONTEUDO', relativeDays: 18, defaultRole: 'SOCIAL_MEDIA' }
    ]
  }
];
