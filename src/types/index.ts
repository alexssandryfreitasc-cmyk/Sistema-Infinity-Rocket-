export type UserRole = 'ADMIN' | 'GESTOR' | 'COLABORADOR' | 'CLIENTE';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  title: string;
  department?: string;
  clientId?: string; // If role === 'CLIENTE'
  assignedClientIds?: string[]; // If COLABORADOR or GESTOR
  phone?: string;
  workloadHours?: number;
  maxCapacityHours?: number;
  status?: 'ATIVO' | 'PENDENTE_APROVACAO';
  createdAt?: string;
}

export type PipelineStage = 
  | 'NOVO_CLIENTE'
  | 'BOAS_VINDAS'
  | 'GRUPO_WHATSAPP'
  | 'BRIEFING'
  | 'ACESSOS'
  | 'ESTRATÉGIA'
  | 'PLANEJAMENTO'
  | 'PRODUÇÃO'
  | 'APROVAÇÃO'
  | 'PUBLICAÇÃO'
  | 'ANÁLISE'
  | 'RELATÓRIO'
  | 'RECORRÊNCIA';

export type ClientStatus = 'ONBOARDING' | 'ATIVO' | 'EM_RISCO' | 'PENDENTE' | 'CANCELADO';

export type PlanType = 'BASICO' | 'PRO' | 'PREMIUM' | 'ENTERPRISE';

export interface PlanConfig {
  id: string;
  name: string;
  monthlyValue: number;
  postsPerMonth: number;
  reelsPerMonth: number;
  storiesPerMonth: number;
  trafficManagement: boolean;
  biweeklyMeetings: boolean;
  weeklyReports: boolean;
  prioritySupport: boolean;
  features: string[];
}

export interface TeamAssignment {
  accountManagerId?: string;
  socialMediaId?: string;
  designerId?: string;
  videomakerId?: string;
  copywriterId?: string;
  trafficManagerId?: string;
}

export interface Client {
  id: string;
  companyName: string;
  tradingName: string;
  contactName: string;
  email: string;
  phone: string;
  whatsapp: string;
  cnpj: string;
  segment: string;
  city: string;
  instagram: string;
  facebook?: string;
  site?: string;
  contractedServices: string[];
  plan: PlanType;
  monthlyValue: number;
  startDate: string;
  renewalDate: string;
  cancellationDate?: string;
  cancellationReason?: string;
  status: ClientStatus;
  pipelineStage: PipelineStage;
  healthScore: number; // 0 - 100
  healthScoreDetails: {
    overdueTasksPenalty: number;
    pendingApprovalsPenalty: number;
    communicationScore: number;
    paymentStatusScore: number;
    satisfactionScore: number;
    summary: string;
  };
  team: TeamAssignment;
  notes?: string;
  whatsappGroup: {
    status: 'PENDENTE' | 'CRIADO' | 'CONFIRMADO';
    link?: string;
    confirmedAt?: string;
  };
  driveFolder?: {
    id?: string;
    name?: string;
    webViewLink?: string;
    isLinked?: boolean;
  };
  onboardingProgress: number; // 0 - 100
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  completedAt?: string;
  required: boolean;
  category: string;
}

export interface BriefingData {
  id?: string;
  clientId: string;
  isComplete: boolean;
  updatedAt: string;
  companyHistory?: string;
  productsAndServices?: string;
  differentiators?: string;
  targetAudience?: string;
  buyerPersona?: string;
  brandVoiceAndTone?: string;
  marketingGoals?: string;
  mainCompetitors?: string;
  aestheticReferences?: string;
  dislikesAndRestrictions?: string;
  likesAndInspirations?: string;
  mainOffersAndCampaigns?: string;
  serviceRegions?: string;
  commonClientQuestions?: string;
  mainSalesObjections?: string;

  // Additional fields for rich briefing form
  missionVisionValues?: string;
  mainProductsServices?: string;
  competitiveDifferentiators?: string;
  targetAudiencePersonas?: string;
  competitorsList?: string;
  brandToneOfVoice?: string;
  taboosAndRestrictions?: string;
  visualIdentityGuidelines?: string;
  primaryMarketingGoals?: string;
  priorityChannels?: string;
  monthlyAdBudget?: string;
  previousMarketingHistory?: string;
  admirationReferences?: string;
  clientInternalTeam?: string;
  importantNicheDates?: string;
}

export type AccessCategory = 
  | 'Instagram'
  | 'Facebook'
  | 'Meta Business'
  | 'Google Ads'
  | 'Google Analytics'
  | 'Google Meu Negócio'
  | 'TikTok'
  | 'YouTube'
  | 'Site / WordPress'
  | 'Hospedagem / CPanel'
  | 'Domínio'
  | 'CRM'
  | 'WhatsApp Business'
  | 'REDES_SOCIAIS'
  | 'TRAFEGO'
  | 'SITES_DOMINIOS'
  | 'FERRAMENTAS'
  | 'Outros'
  | string;

export interface AccessCredential {
  id: string;
  clientId: string;
  category: AccessCategory;
  platform?: string;
  platformName?: string;
  url?: string;
  accessUrl?: string;
  username?: string;
  loginOrUser?: string;
  encryptedSecretHint?: string; // Secure masked format
  authMethod?: 'LOGIN_SENHA' | 'CONVITE_GESTOR' | 'OAUTH_TOKEN' | 'CHAVE_API' | string;
  status: 'PENDENTE' | 'RECEBIDO' | 'VALIDADO' | 'ERRO';
  validatedBy?: string;
  validatedAt?: string;
  notes?: string;
  guideInstructions?: string;
  updatedAt?: string;
}

export type AccessItem = AccessCredential;

export type TaskStatus = 
  | 'A_FAZER' 
  | 'EM_ANDAMENTO' 
  | 'REVISAO_INTERNA' 
  | 'AGUARDANDO_CLIENTE' 
  | 'AGUARDANDO' 
  | 'CONCLUIDA' 
  | 'CANCELADA';

export type TaskPriority = 'BAIXA' | 'NORMAL' | 'MEDIA' | 'ALTA' | 'URGENTE';

export type TaskCategory = 
  | 'ONBOARDING' 
  | 'CONTEUDO' 
  | 'DESIGN' 
  | 'COPY' 
  | 'TRAFEGO' 
  | 'REVISAO' 
  | 'REUNIAO' 
  | 'RELATORIO' 
  | 'FINANCEIRO' 
  | 'ESTRATEGIA' 
  | 'GERAL';

export interface Task {
  id: string;
  clientId: string;
  title: string;
  description: string;
  assignedToId: string;
  createdById?: string;
  priority: TaskPriority;
  dueDate: string;
  status: TaskStatus;
  category: TaskCategory;
  tags?: string[];
  attachments?: string[];
  commentsCount?: number;
  isRecurring?: boolean;
  isAutomated?: boolean;
  estimatedHours?: number;
  createdAt?: string;
  completedAt?: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  userAvatar: string;
  text: string;
  createdAt: string;
}

export type ContentFormat = 'CARROSSEL' | 'REELS' | 'ESTATICO' | 'STORIES' | 'VIDEO' | 'ARTIGO' | 'ANUNCIO';
export type ContentPlatform = 'INSTAGRAM' | 'FACEBOOK' | 'TIKTOK' | 'YOUTUBE' | 'LINKEDIN' | 'GOOGLE';
export type ContentStatus = 
  | 'IDEIA'
  | 'BRIEFING'
  | 'PRODUCAO'
  | 'REVISAO_INTERNA'
  | 'AGUARDANDO_CLIENTE'
  | 'APROVADO'
  | 'REPROVADO'
  | 'AGENDADO'
  | 'PUBLICADO';

export interface ContentApprovalHistory {
  id: string;
  version: number;
  status: 'APROVADO' | 'REPROVADO' | 'SOLICITADA_ALTERACAO';
  authorName: string;
  authorRole: string;
  timestamp: string;
  comment?: string;
}

export interface ContentItem {
  id: string;
  clientId: string;
  title: string;
  scheduledDate: string;
  format: ContentFormat;
  platform: ContentPlatform;
  caption: string;
  visualBriefing: string;
  mediaUrl?: string;
  responsibleId: string;
  designerId?: string;
  copywriterId?: string;
  status: ContentStatus;
  currentVersion: number;
  approvalHistory: ContentApprovalHistory[];
  revisionRequestReason?: string;
  createdAt: string;
  publishedAt?: string;
}

export interface Meeting {
  id: string;
  clientId: string;
  title: string;
  date: string;
  time: string;
  durationMinutes: number;
  participants: string[];
  type: 'ONBOARDING' | 'REUNIAO_MENSAL' | 'ESTRATEGIA' | 'COMERCIAL' | 'EXTRA' | 'ALINHAMENTO';
  meetingUrl?: string;
  notes?: string;
  status: 'AGENDADA' | 'CONCLUIDA' | 'CANCELADA';
}

export type TicketStatus = 'ABERTO' | 'EM_ANALISE' | 'EM_ANDAMENTO' | 'AGUARDANDO_CLIENTE' | 'RESOLVIDO';
export type TicketPriority = 'NORMAL' | 'URGENTE' | 'CRITICO';
export type TicketCategory = 'SOLICITACAO' | 'PROBLEMA' | 'ALTERACAO' | 'DUVIDA' | 'NOVO_MATERIAL' | 'URGENCIA';

export interface Ticket {
  id: string;
  clientId: string;
  createdById: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  slaDeadlineHours: number; // e.g. 24, 4, 1
  assignedToId?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface DocumentFile {
  id: string;
  clientId: string;
  name: string;
  category: 'CONTRATOS' | 'BRIEFINGS' | 'IDENTIDADE_VISUAL' | 'FOTOS' | 'VIDEOS' | 'LOGOS' | 'RELATORIOS' | 'MATERIAIS' | 'OUTROS';
  fileSize: string;
  fileType: string;
  uploadedBy: string;
  uploadedAt: string;
  url?: string;
  driveFileId?: string;
  driveWebViewLink?: string;
  driveThumbnailLink?: string;
  isDriveSync?: boolean;
  storagePath?: string;
  downloadURL?: string;
}

export interface FinancialRecord {
  id: string;
  clientId: string;
  plan: PlanType;
  monthlyValue: number;
  billingDay: number;
  paymentMethod: 'PIX' | 'BOLETO' | 'CARTAO' | 'TRANSFERENCIA';
  status: 'ATIVO' | 'PENDENTE' | 'ATRASADO' | 'CANCELADO';
  lastPaymentDate?: string;
  nextPaymentDate: string;
  overdueDays?: number;
}

export type TransactionType = 'INCOME' | 'EXPENSE';
export type TransactionStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELLED';

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  category: string;
  amount: number;
  date: string;
  status: TransactionStatus;
  clientId?: string;
  createdAt: string;
}

export interface MonthlyReport {
  id: string;
  clientId: string;
  month: string; // "2026-08"
  followers: number;
  followersGrowth: number;
  reach: number;
  reachGrowth: number;
  impressions: number;
  engagementRate: number;
  linkClicks: number;
  leadsGenerated: number;
  conversions: number;
  adSpend: number;
  highlights: string[];
  pointsOfAttention: string[];
  nextMonthActions: string[];
  status: 'RASCUNHO' | 'ENVIADO_AO_CLIENTE' | 'APROVADO';
  createdAt: string;
}

export interface AutomationRule {
  id: string;
  title: string;
  condition: string;
  action: string;
  isActive: boolean;
  lastTriggeredAt?: string;
  timesTriggered: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  clientId?: string;
  clientName?: string;
  actionType: 'CLIENTE_CRIADO' | 'ONBOARDING_AVANCADO' | 'ACESSOS_VALIDADOS' | 'CONTEUDO_APROVADO' | 'CONTEUDO_REPROVADO' | 'TAREFA_CRIADA' | 'TAREFA_CONCLUIDA' | 'PAGAMENTO_REGISTRADO' | 'CONFIGURACAO_ALTERADA';
  description: string;
  oldValue?: string;
  newValue?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'TAREFA' | 'APROVACAO' | 'ALTERACAO' | 'ALERTA' | 'ACESSO' | 'REUNIAO' | 'SISTEMA';
  read: boolean;
  createdAt: string;
  linkTab?: string;
  clientId?: string;
}

export interface ProcessTemplate {
  id: string;
  name: string;
  planId: PlanType;
  description: string;
  tasksCount: number;
  defaultTasks: {
    title: string;
    category: Task['category'];
    relativeDays: number;
    defaultRole: 'ACCOUNT_MANAGER' | 'SOCIAL_MEDIA' | 'DESIGNER' | 'COPYWRITER' | 'TRAFFIC_MANAGER';
  }[];
}
