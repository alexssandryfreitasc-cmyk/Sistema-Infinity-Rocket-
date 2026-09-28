import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import {
  User,
  UserRole,
  Client,
  PipelineStage,
  Task,
  TaskStatus,
  ContentItem,
  BriefingData,
  AccessCredential,
  Meeting,
  Ticket,
  DocumentFile,
  FinancialRecord,
  Transaction,
  MonthlyReport,
  AutomationRule,
  AuditLog,
  ProcessTemplate,
  NotificationItem,
  PlanConfig
} from '../types';
import {
  INITIAL_PLANS,
  INITIAL_BRIEFINGS,
  INITIAL_AUTOMATIONS,
  INITIAL_TEMPLATES
} from '../data/mockData';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  fbSignOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  uploadClientFileToStorage,
  deleteFileFromStorage
} from '../services/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import {
  setFirestoreDoc,
  getFirestoreDoc,
  updateFirestoreDoc,
  deleteFirestoreDoc,
  subscribeToCollection,
  subscribeToClientCollection,
  subscribeToDocument,
  sanitizeLegacyUserPasswords
} from '../services/firestoreDb';

export const PIPELINE_STAGES_ORDER: PipelineStage[] = [
  'NOVO_CLIENTE',
  'BOAS_VINDAS',
  'GRUPO_WHATSAPP',
  'BRIEFING',
  'ACESSOS',
  'ESTRATÉGIA',
  'PLANEJAMENTO',
  'PRODUÇÃO',
  'APROVAÇÃO',
  'PUBLICAÇÃO',
  'ANÁLISE',
  'RELATÓRIO',
  'RECORRÊNCIA'
];

export const PIPELINE_STAGE_LABELS: Record<PipelineStage, string> = {
  NOVO_CLIENTE: 'Novo Cliente',
  BOAS_VINDAS: 'Boas-Vindas',
  GRUPO_WHATSAPP: 'Grupo WhatsApp',
  BRIEFING: 'Briefing',
  ACESSOS: 'Central Acessos',
  ESTRATÉGIA: 'Estratégia',
  PLANEJAMENTO: 'Planejamento',
  PRODUÇÃO: 'Produção',
  APROVAÇÃO: 'Aprovação',
  PUBLICAÇÃO: 'Publicação',
  ANÁLISE: 'Análise de Dados',
  RELATÓRIO: 'Relatório Mensal',
  RECORRÊNCIA: 'Recorrência Ativa'
};

interface AgencyContextType {
  currentUser: User;
  users: User[];
  clients: Client[];
  activeClient: Client | null;
  activeClientId: string;
  activeTab: string;
  tasks: Task[];
  contents: ContentItem[];
  briefings: Record<string, BriefingData>;
  accesses: AccessCredential[];
  meetings: Meeting[];
  tickets: Ticket[];
  documents: DocumentFile[];
  financials: FinancialRecord[];
  transactions: Transaction[];
  reports: MonthlyReport[];
  automations: AutomationRule[];
  templates: ProcessTemplate[];
  auditLogs: AuditLog[];
  notifications: NotificationItem[];
  plans: PlanConfig[];
  welcomeEmailModalClient: Client | null;
  globalSearchOpen: boolean;
  isAuthenticated: boolean;
  isLoadingAuth: boolean;
  isFirestoreConnected: boolean;

  // Real Auth Actions
  loginWithGoogle: () => Promise<{ success: boolean; message?: string }>;
  login: (email: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  register: (userData: Omit<User, 'id'>, password: string) => Promise<{ success: boolean; message?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  setCurrentUser: (user: User) => void;
  setActiveClientId: (id: string) => void;
  setActiveTab: (tab: string) => void;
  setGlobalSearchOpen: (open: boolean) => void;
  setWelcomeEmailModalClient: (client: Client | null) => void;

  // Client Management
  createClient: (newClientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'healthScore' | 'healthScoreDetails' | 'onboardingProgress'>) => Client;
  updateClient: (id: string, data: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  advancePipelineStage: (clientId: string, targetStage: PipelineStage) => { success: boolean; message?: string };

  // Onboarding & Briefing
  confirmWhatsAppGroup: (clientId: string, link: string) => void;
  saveBriefing: (clientId: string, data: Partial<BriefingData>) => void;

  // Access Management (Secure, zero plaintext passwords)
  addAccess: (credential: Omit<AccessCredential, 'id' | 'updatedAt'>) => void;
  updateAccess: (id: string, data: Partial<AccessCredential>) => void;
  validateAccess: (id: string) => void;
  deleteAccess: (id: string) => void;

  // Tasks
  createTask: (task: Omit<Task, 'id' | 'createdAt' | 'commentsCount'>) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  updateTask: (taskId: string, data: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;

  // Content & Approvals
  createContent: (content: Omit<ContentItem, 'id' | 'createdAt' | 'currentVersion' | 'approvalHistory'>) => void;
  updateContent: (id: string, data: Partial<ContentItem>) => void;
  deleteContent: (id: string) => void;
  approveContent: (contentId: string, comment?: string) => void;
  requestContentRevision: (contentId: string, reason: string) => void;

  // Tickets & SLA
  createTicket: (ticket: Omit<Ticket, 'id' | 'createdAt'>) => void;
  updateTicketStatus: (ticketId: string, status: Ticket['status']) => void;

  // Meetings & Documents (Storage Integrated)
  createMeeting: (meeting: Omit<Meeting, 'id'>) => void;
  updateMeeting: (meetingId: string, data: Partial<Meeting>) => void;
  deleteMeeting: (meetingId: string) => void;
  uploadDocument: (doc: Omit<DocumentFile, 'id' | 'uploadedAt'>, file?: File) => Promise<{ success: boolean; message?: string }>;
  deleteDocument: (docId: string) => Promise<void>;

  // Finance & Reports
  updateFinancial: (id: string, data: Partial<FinancialRecord>) => void;
  updateFinancialStatus: (id: string, status: FinancialRecord['status']) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransactionStatus: (id: string, status: Transaction['status']) => void;
  deleteTransaction: (id: string) => void;
  createReport: (report: Omit<MonthlyReport, 'id' | 'createdAt'>) => void;

  // Team Management & Auth Approvals
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  deleteUser: (id: string) => void;
  requestAccess: (userData: Omit<User, 'id'>, password?: string) => Promise<{ success: boolean; message?: string }>;
  approveUser: (id: string) => void;
  rejectUser: (id: string) => void;

  // Automations & Templates
  triggerAutomation: (ruleId: string) => void;
  toggleAutomation: (ruleId: string) => void;
  createAutomationRule: (rule: Omit<AutomationRule, 'id' | 'timesTriggered'>) => void;
  deleteAutomationRule: (ruleId: string) => void;
  applyTemplateToClient: (templateId: string, clientId: string) => void;
  createProcessTemplate: (template: Omit<ProcessTemplate, 'id'>) => void;
  generateMonthlyCycleTasks: (clientId: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  resetDemoData: () => void;
  clearAllData: () => void;
}

const AgencyContext = createContext<AgencyContextType | undefined>(undefined);

const BOOTSTRAP_ADMIN_EMAIL = 'alexssandryfreitasc@gmail.com';

export const AgencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Pure in-memory reactive state (NO localStorage for auth or operational data)
  const [currentUser, setCurrentUser] = useState<User>(() => ({
    id: '',
    name: 'Carregando...',
    email: '',
    role: 'COLABORADOR',
    status: 'PENDENTE_APROVACAO',
    createdAt: new Date().toISOString()
  }));

  const [users, setUsers] = useState<User[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [isFirestoreConnected, setIsFirestoreConnected] = useState<boolean>(false);

  const [clients, setClients] = useState<Client[]>([]);
  const [activeClientId, setActiveClientId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [tasks, setTasks] = useState<Task[]>([]);
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [briefings, setBriefings] = useState<Record<string, BriefingData>>(() => INITIAL_BRIEFINGS);
  const [accesses, setAccesses] = useState<AccessCredential[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [documents, setDocuments] = useState<DocumentFile[]>([]);
  const [financials, setFinancials] = useState<FinancialRecord[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [automations, setAutomations] = useState<AutomationRule[]>(() => INITIAL_AUTOMATIONS);
  const [templates, setTemplates] = useState<ProcessTemplate[]>(INITIAL_TEMPLATES);
  const [plans] = useState<PlanConfig[]>(INITIAL_PLANS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const [welcomeEmailModalClient, setWelcomeEmailModalClient] = useState<Client | null>(null);
  const [globalSearchOpen, setGlobalSearchOpen] = useState<boolean>(false);

  // Real Firebase Auth state observer (Single Source of Truth)
  useEffect(() => {
    let profileUnsub: (() => void) | null = null;

    const unsubAuth = onAuthStateChanged(auth, async (fbUser) => {
      if (profileUnsub) {
        profileUnsub();
        profileUnsub = null;
      }

      if (!fbUser) {
        // Logged out: Clear all in-memory operational state cleanly
        setCurrentUser({
          id: '',
          name: '',
          email: '',
          role: 'COLABORADOR',
          status: 'PENDENTE_APROVACAO',
          createdAt: new Date().toISOString()
        });
        setIsAuthenticated(false);
        setIsLoadingAuth(false);
        setUsers([]);
        setClients([]);
        setTasks([]);
        setContents([]);
        setAccesses([]);
        setMeetings([]);
        setTickets([]);
        setDocuments([]);
        setFinancials([]);
        setTransactions([]);
        setReports([]);
        setAuditLogs([]);
        setNotifications([]);
        return;
      }

      const cleanEmail = (fbUser.email || '').toLowerCase().trim();
      const isBootstrapAdmin = cleanEmail === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

      try {
        let profile = await getFirestoreDoc<User>('users', fbUser.uid);

        if (!profile) {
          // If no document exists in Firestore (e.g. Google Sign-In for first time):
          // Bootstrap admin gets ADMIN + ATIVO. All other accounts get COLABORADOR + PENDENTE_APROVACAO.
          profile = {
            id: fbUser.uid,
            name: fbUser.displayName || (isBootstrapAdmin ? 'Administrador AgencyOS' : 'Novo Usuário'),
            email: cleanEmail,
            role: isBootstrapAdmin ? 'ADMIN' : 'COLABORADOR',
            avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            title: isBootstrapAdmin ? 'Diretor Geral & Administrador' : 'Colaborador da Agência',
            department: isBootstrapAdmin ? 'Diretoria' : 'Operações',
            status: isBootstrapAdmin ? 'ATIVO' : 'PENDENTE_APROVACAO',
            workloadHours: 0,
            maxCapacityHours: 40,
            createdAt: new Date().toISOString()
          };
          await setFirestoreDoc('users', profile);
          if (isBootstrapAdmin) {
            await setFirestoreDoc('admins', {
              id: fbUser.uid,
              email: cleanEmail,
              role: 'ADMIN',
              updatedAt: new Date().toISOString()
            });
          }
        }

        // Bootstrap Admin safeguard: Ensure admin role & active status
        if (isBootstrapAdmin && (profile.role !== 'ADMIN' || profile.status !== 'ATIVO')) {
          profile.role = 'ADMIN';
          profile.status = 'ATIVO';
          await setFirestoreDoc('users', profile);
          await setFirestoreDoc('admins', {
            id: fbUser.uid,
            email: cleanEmail,
            role: 'ADMIN',
            updatedAt: new Date().toISOString()
          });
        }

        setCurrentUser(profile);
        setIsAuthenticated(true);
        setIsLoadingAuth(false);

        // If admin, execute silent non-destructive legacy password cleanup
        if (profile.role === 'ADMIN') {
          sanitizeLegacyUserPasswords().catch(() => {});
        }

        // Real-time listener for live updates to current user's profile (e.g. approval by admin)
        profileUnsub = onSnapshot(doc(db, 'users', fbUser.uid), (snap) => {
          if (snap.exists()) {
            const liveData = snap.data() as User;
            setCurrentUser((prev) => ({
              ...prev,
              ...liveData,
              role: isBootstrapAdmin ? 'ADMIN' : liveData.role,
              status: isBootstrapAdmin ? 'ATIVO' : liveData.status
            }));
          }
        });
      } catch (err) {
        console.warn('Profile initialization notice:', err);
        setIsLoadingAuth(false);
      }
    });

    return () => {
      unsubAuth();
      if (profileUnsub) profileUnsub();
    };
  }, []);

  // Real-time Collections Subscriptions based on Authenticated Role & Approval Status
  useEffect(() => {
    if (!isAuthenticated || !currentUser?.id) {
      setIsFirestoreConnected(false);
      return;
    }

    // Pending accounts are blocked from confidential data
    if (currentUser.status === 'PENDENTE_APROVACAO' && currentUser.role !== 'ADMIN') {
      setIsFirestoreConnected(true);
      return;
    }

    const unsubs: (() => void)[] = [];
    const role = currentUser.role;
    const userClientId = currentUser.clientId;

    try {
      if (role === 'CLIENTE') {
        // CLIENT PORTAL: Strictly isolated to their own clientId
        setTasks([]);
        setFinancials([]);
        setTransactions([]);

        if (userClientId) {
          const unsubClientDoc = subscribeToDocument<Client>('clients', userClientId, (item) => {
            if (item) {
              setClients([item]);
              setActiveClientId(item.id);
            }
          });
          unsubs.push(unsubClientDoc);

          const unsubContents = subscribeToClientCollection<ContentItem>('contents', userClientId, (items) => {
            if (items) setContents(items);
          });
          unsubs.push(unsubContents);

          const unsubTickets = subscribeToClientCollection<Ticket>('tickets', userClientId, (items) => {
            if (items) setTickets(items);
          });
          unsubs.push(unsubTickets);

          const unsubDocs = subscribeToClientCollection<DocumentFile>('documents', userClientId, (items) => {
            if (items) setDocuments(items);
          });
          unsubs.push(unsubDocs);

          const unsubMeetings = subscribeToClientCollection<Meeting>('meetings', userClientId, (items) => {
            if (items) setMeetings(items);
          });
          unsubs.push(unsubMeetings);

          const unsubAccesses = subscribeToClientCollection<AccessCredential>('accesses', userClientId, (items) => {
            if (items) setAccesses(items);
          });
          unsubs.push(unsubAccesses);
        }
      } else {
        // INTERNAL AGENCY STAFF (ADMIN, GESTOR, COLABORADOR)
        const unsubClients = subscribeToCollection<Client>('clients', (items) => {
          if (items) {
            setClients(items);
            if (items.length > 0 && !activeClientId) {
              setActiveClientId(items[0].id);
            }
          }
        });
        unsubs.push(unsubClients);

        const unsubTasks = subscribeToCollection<Task>('tasks', (items) => {
          if (items) setTasks(items);
        });
        unsubs.push(unsubTasks);

        const unsubContents = subscribeToCollection<ContentItem>('contents', (items) => {
          if (items) setContents(items);
        });
        unsubs.push(unsubContents);

        const unsubMeetings = subscribeToCollection<Meeting>('meetings', (items) => {
          if (items) setMeetings(items);
        });
        unsubs.push(unsubMeetings);

        const unsubTickets = subscribeToCollection<Ticket>('tickets', (items) => {
          if (items) setTickets(items);
        });
        unsubs.push(unsubTickets);

        const unsubDocuments = subscribeToCollection<DocumentFile>('documents', (items) => {
          if (items) setDocuments(items);
        });
        unsubs.push(unsubDocuments);

        const unsubAccesses = subscribeToCollection<AccessCredential>('accesses', (items) => {
          if (items) setAccesses(items);
        });
        unsubs.push(unsubAccesses);

        const unsubBriefings = subscribeToCollection<BriefingData>('briefings', (items) => {
          if (items) {
            const map: Record<string, BriefingData> = {};
            items.forEach((b) => {
              const key = b.id || (b as any).clientId;
              if (key) map[key] = b;
            });
            setBriefings((prev) => ({ ...prev, ...map }));
          }
        });
        unsubs.push(unsubBriefings);

        const unsubReports = subscribeToCollection<MonthlyReport>('reports', (items) => {
          if (items) setReports(items);
        });
        unsubs.push(unsubReports);

        const unsubAudit = subscribeToCollection<AuditLog>('auditLogs', (items) => {
          if (items) setAuditLogs(items);
        });
        unsubs.push(unsubAudit);

        const unsubNotifs = subscribeToCollection<NotificationItem>('notifications', (items) => {
          if (items) setNotifications(items);
        });
        unsubs.push(unsubNotifs);

        // Restricted to ADMIN & GESTOR:
        if (role === 'ADMIN' || role === 'GESTOR') {
          const unsubUsers = subscribeToCollection<User>('users', (items) => {
            if (items) setUsers(items);
          });
          unsubs.push(unsubUsers);

          const unsubFinancials = subscribeToCollection<FinancialRecord>('financials', (items) => {
            if (items) setFinancials(items);
          });
          unsubs.push(unsubFinancials);

          const unsubTransactions = subscribeToCollection<Transaction>('transactions', (items) => {
            if (items) setTransactions(items);
          });
          unsubs.push(unsubTransactions);
        } else {
          setFinancials([]);
          setTransactions([]);
        }
      }

      setIsFirestoreConnected(true);
    } catch (err) {
      console.warn('Realtime subscription error:', err);
      setIsFirestoreConnected(false);
    }

    return () => {
      unsubs.forEach((unsub) => {
        try {
          unsub();
        } catch {
          // ignore
        }
      });
    };
  }, [isAuthenticated, currentUser?.role, currentUser?.clientId, currentUser?.status]);

  // When switching to CLIENTE, bind activeClientId
  useEffect(() => {
    if (currentUser?.role === 'CLIENTE' && currentUser?.clientId) {
      setActiveClientId(currentUser.clientId);
    }
  }, [currentUser]);

  // Active client object
  const activeClient = useMemo(() => {
    if (!clients || clients.length === 0) return null;
    return clients.find((c) => c.id === activeClientId) || clients[0] || null;
  }, [clients, activeClientId]);

  // Health Score & Progress Recalculation
  const recalculateClientHealthAndOnboarding = (cId: string, currentClients = clients) => {
    const client = currentClients.find((c) => c.id === cId);
    if (!client) return;

    const clientTasks = tasks.filter((t) => t.clientId === cId);
    const clientContents = contents.filter((c) => c.clientId === cId);
    const clientAccesses = accesses.filter((a) => a.clientId === cId);
    const clientFin = financials.find((f) => f.clientId === cId);

    const overdueCount = clientTasks.filter((t) => {
      if (t.status === 'CONCLUIDA' || !t.dueDate) return false;
      return t.dueDate < new Date().toISOString().split('T')[0];
    }).length;

    const pendingApprovalsCount = clientContents.filter((c) => c.status === 'AGUARDANDO_CLIENTE').length;
    const validatedAccessCount = clientAccesses.filter((a) => a.status === 'VALIDADO').length;

    let overduePenalty = overdueCount * 12;
    let pendingApprovalPenalty = pendingApprovalsCount * 5;
    let paymentScore = clientFin?.status === 'ATRASADO' ? 30 : clientFin?.status === 'PENDENTE' ? 70 : 100;
    let commScore = 95;

    let totalScore = Math.max(10, Math.min(100, 100 - overduePenalty - pendingApprovalPenalty));

    let onboardingScore = 20;
    if (client.whatsappGroup?.status === 'CONFIRMADO') onboardingScore += 25;
    if (briefings[cId]?.isComplete) onboardingScore += 25;
    if (validatedAccessCount > 0) onboardingScore += 30;

    let summaryText = 'Operação em dia com excelente saúde.';
    if (overdueCount > 0) {
      summaryText = `Atenção: ${overdueCount} tarefa(s) com prazo estourado impactando a entrega.`;
    } else if (pendingApprovalsCount > 1) {
      summaryText = `Aguardando o cliente aprovar ${pendingApprovalsCount} criativos pendentes no portal.`;
    }

    const updatedData: Partial<Client> = {
      healthScore: totalScore,
      status: totalScore < 50 ? 'EM_RISCO' : client.status === 'EM_RISCO' ? 'ATIVO' : client.status,
      healthScoreDetails: {
        overdueTasksPenalty: -overduePenalty,
        pendingApprovalsPenalty: -pendingApprovalPenalty,
        communicationScore: commScore,
        paymentStatusScore: paymentScore,
        satisfactionScore: 90,
        summary: summaryText
      },
      onboardingProgress: onboardingScore
    };

    setClients((prev) =>
      prev.map((c) => (c.id === cId ? { ...c, ...updatedData } : c))
    );

    updateFirestoreDoc('clients', cId, updatedData).catch(() => {});
  };

  // REAL FIREBASE AUTHENTICATION FLOWS

  // 1. Google Sign-In
  const loginWithGoogle = async (): Promise<{ success: boolean; message?: string }> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const cleanEmail = (fbUser.email || '').toLowerCase().trim();
      const isBootstrapAdmin = cleanEmail === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

      let profile = await getFirestoreDoc<User>('users', fbUser.uid);
      if (!profile) {
        profile = {
          id: fbUser.uid,
          name: fbUser.displayName || (isBootstrapAdmin ? 'Administrador AgencyOS' : 'Colaborador'),
          email: cleanEmail,
          role: isBootstrapAdmin ? 'ADMIN' : 'COLABORADOR',
          avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          title: isBootstrapAdmin ? 'Diretor Geral & Administrador' : 'Colaborador da Agência',
          department: isBootstrapAdmin ? 'Diretoria' : 'Operações',
          status: isBootstrapAdmin ? 'ATIVO' : 'PENDENTE_APROVACAO',
          workloadHours: 0,
          maxCapacityHours: 40,
          createdAt: new Date().toISOString()
        };
        await setFirestoreDoc('users', profile);
        if (isBootstrapAdmin) {
          await setFirestoreDoc('admins', {
            id: fbUser.uid,
            email: cleanEmail,
            role: 'ADMIN',
            updatedAt: new Date().toISOString()
          });
        }
      }

      setCurrentUser(profile);
      setIsAuthenticated(true);
      if (profile.role === 'CLIENTE' && profile.clientId) {
        setActiveClientId(profile.clientId);
      }
      setActiveTab('dashboard');
      return { success: true };
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      return {
        success: false,
        message: error?.message || 'Falha ao autenticar com a conta Google. Tente novamente.'
      };
    }
  };

  // 2. Real Email & Password Login
  const login = async (email: string, password?: string): Promise<{ success: boolean; message?: string }> => {
    if (!password) {
      return { success: false, message: 'Por favor, informe sua senha.' };
    }
    const cleanEmail = email.trim().toLowerCase();

    try {
      const result = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const fbUser = result.user;

      let profile = await getFirestoreDoc<User>('users', fbUser.uid);
      const isBootstrapAdmin = cleanEmail === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();

      if (!profile) {
        profile = {
          id: fbUser.uid,
          name: fbUser.displayName || (isBootstrapAdmin ? 'Administrador AgencyOS' : 'Colaborador'),
          email: cleanEmail,
          role: isBootstrapAdmin ? 'ADMIN' : 'COLABORADOR',
          avatar: fbUser.photoURL || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          title: isBootstrapAdmin ? 'Diretor Geral & Administrador' : 'Colaborador da Agência',
          department: isBootstrapAdmin ? 'Diretoria' : 'Operações',
          status: isBootstrapAdmin ? 'ATIVO' : 'PENDENTE_APROVACAO',
          workloadHours: 0,
          maxCapacityHours: 40,
          createdAt: new Date().toISOString()
        };
        await setFirestoreDoc('users', profile);
        if (isBootstrapAdmin) {
          await setFirestoreDoc('admins', {
            id: fbUser.uid,
            email: cleanEmail,
            role: 'ADMIN',
            updatedAt: new Date().toISOString()
          });
        }
      }

      setCurrentUser(profile);
      setIsAuthenticated(true);

      if (profile.status === 'PENDENTE_APROVACAO' && profile.role !== 'ADMIN') {
        return {
          success: true,
          message: 'Sua solicitação de cadastro foi recebida e está aguardando liberação do Administrador.'
        };
      }

      if (profile.role === 'CLIENTE' && profile.clientId) {
        setActiveClientId(profile.clientId);
      }

      setActiveTab('dashboard');
      return { success: true };
    } catch (err: any) {
      let message = 'Falha ao autenticar. Verifique seus dados.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'E-mail ou senha incorretos.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Muitas tentativas sem sucesso. Tente novamente em alguns minutos.';
      } else if (err.message) {
        message = err.message;
      }
      return { success: false, message };
    }
  };

  // 3. Real Account Registration in Firebase Auth
  const register = async (userData: Omit<User, 'id'>, password: string): Promise<{ success: boolean; message?: string }> => {
    if (!password || password.length < 6) {
      return { success: false, message: 'A senha deve conter no mínimo 6 caracteres.' };
    }

    const cleanEmail = userData.email.trim().toLowerCase();

    try {
      const res = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const fbUser = res.user;

      await updateProfile(fbUser, {
        displayName: userData.name
      });

      const isBootstrapAdmin = cleanEmail === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
      // RBAC Security Enforcement: Public registration can NEVER self-assign ADMIN or GESTOR
      const safeRole: UserRole = isBootstrapAdmin
        ? 'ADMIN'
        : userData.role === 'CLIENTE'
        ? 'CLIENTE'
        : 'COLABORADOR';

      const newUser: User = {
        id: fbUser.uid,
        name: userData.name.trim(),
        email: cleanEmail,
        role: safeRole,
        avatar: userData.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        title: userData.title || (safeRole === 'CLIENTE' ? 'Representante do Cliente' : 'Colaborador da Agência'),
        department: userData.department || (safeRole === 'CLIENTE' ? 'Cliente' : 'Operações'),
        clientId: safeRole === 'CLIENTE' ? userData.clientId : undefined,
        phone: userData.phone || '',
        workloadHours: 0,
        maxCapacityHours: userData.maxCapacityHours || 40,
        status: isBootstrapAdmin ? 'ATIVO' : 'PENDENTE_APROVACAO',
        createdAt: new Date().toISOString()
      };

      await setFirestoreDoc('users', newUser);
      if (isBootstrapAdmin) {
        await setFirestoreDoc('admins', {
          id: fbUser.uid,
          email: cleanEmail,
          role: 'ADMIN',
          updatedAt: new Date().toISOString()
        });
      }

      setCurrentUser(newUser);
      setIsAuthenticated(true);

      return {
        success: true,
        message: isBootstrapAdmin
          ? 'Conta de Administrador Master criada com sucesso!'
          : 'Cadastro realizado com sucesso! Sua conta começará pendente de aprovação por um Administrador.'
      };
    } catch (err: any) {
      let message = 'Falha ao registrar conta.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'Este e-mail já está em uso por outro usuário.';
      } else if (err.code === 'auth/weak-password') {
        message = 'A senha informada é fraca. Escolha ao menos 6 caracteres.';
      } else if (err.message) {
        message = err.message;
      }
      return { success: false, message };
    }
  };

  // 4. Request Access (Alias for backwards compatibility)
  const requestAccess = async (userData: Omit<User, 'id'>, password?: string): Promise<{ success: boolean; message?: string }> => {
    if (password) {
      return register(userData, password);
    }
    return {
      success: false,
      message: 'Por favor, forneça uma senha de no mínimo 6 caracteres para o cadastro seguro.'
    };
  };

  // 5. Password Reset via Firebase Auth
  const resetPassword = async (email: string): Promise<{ success: boolean; message?: string }> => {
    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      return {
        success: true,
        message: 'Link de redefinição de senha enviado com sucesso para seu e-mail!'
      };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Erro ao solicitar redefinição de senha.'
      };
    }
  };

  // 6. Logout
  const logout = async () => {
    try {
      await fbSignOut(auth);
    } catch {
      // ignore
    }
    setCurrentUser({
      id: '',
      name: '',
      email: '',
      role: 'COLABORADOR',
      status: 'PENDENTE_APROVACAO',
      createdAt: new Date().toISOString()
    });
    setIsAuthenticated(false);
    setUsers([]);
    setClients([]);
    setTasks([]);
    setContents([]);
    setAccesses([]);
    setMeetings([]);
    setTickets([]);
    setDocuments([]);
    setFinancials([]);
    setTransactions([]);
    setReports([]);
    setAuditLogs([]);
    setNotifications([]);
  };

  // CLIENT MANAGEMENT
  const createClient = (newClientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'healthScore' | 'healthScoreDetails' | 'onboardingProgress'>): Client => {
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'GESTOR') {
      console.warn('Permissão negada: apenas Administradores e Gestores podem cadastrar novos clientes.');
      return {} as Client;
    }

    const newId = `cli-${Date.now().toString().slice(-6)}`;
    const nowIso = new Date().toISOString();

    const createdClient: Client = {
      ...newClientData,
      id: newId,
      status: 'ONBOARDING',
      pipelineStage: 'NOVO_CLIENTE',
      healthScore: 100,
      healthScoreDetails: {
        overdueTasksPenalty: 0,
        pendingApprovalsPenalty: 0,
        communicationScore: 100,
        paymentStatusScore: 100,
        satisfactionScore: 100,
        summary: 'Cliente recém-cadastrado. Onboarding inicial em andamento.'
      },
      onboardingProgress: 10,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    // Standard Onboarding Tasks
    const today = new Date();
    const addDays = (d: Date, days: number) => {
      const copy = new Date(d);
      copy.setDate(copy.getDate() + days);
      return copy.toISOString().split('T')[0];
    };

    const initialTasks: Task[] = [
      {
        id: `task-${newId}-1`,
        clientId: newId,
        title: 'Enviar E-mail de Boas-Vindas & Abertura do Portal',
        description: 'Enviar convite de acesso seguro ao AgencyOS e link do grupo de WhatsApp.',
        assignedToId: currentUser.id,
        createdById: currentUser.id,
        priority: 'ALTA',
        dueDate: addDays(today, 1),
        status: 'A_FAZER',
        category: 'ONBOARDING',
        createdAt: nowIso
      },
      {
        id: `task-${newId}-2`,
        clientId: newId,
        title: 'Realizar Reunião de Alinhamento & Briefing Estratégico',
        description: 'Coletar objetivos, público-alvo e definir tom de voz.',
        assignedToId: currentUser.id,
        createdById: currentUser.id,
        priority: 'ALTA',
        dueDate: addDays(today, 3),
        status: 'A_FAZER',
        category: 'REUNIAO',
        createdAt: nowIso
      }
    ];

    const initialFinancial: FinancialRecord = {
      id: `fin-${newId}`,
      clientId: newId,
      monthlyValue: createdClient.monthlyValue,
      plan: createdClient.plan,
      billingDay: 10,
      paymentMethod: 'PIX',
      status: 'ATIVO',
      lastPaymentDate: nowIso.split('T')[0],
      nextPaymentDate: addDays(today, 30)
    };

    setClients((prev) => [createdClient, ...prev]);
    setActiveClientId(newId);
    setTasks((prev) => [...initialTasks, ...prev]);
    setFinancials((prev) => [initialFinancial, ...prev]);

    setFirestoreDoc('clients', createdClient).catch((err) =>
      console.error('Error saving client to Firestore:', err)
    );
    setFirestoreDoc('financials', initialFinancial).catch(() => {});
    initialTasks.forEach((t) => setFirestoreDoc('tasks', t).catch(() => {}));

    const auditLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: nowIso,
      userId: currentUser.id,
      userName: currentUser.name,
      clientId: newId,
      clientName: createdClient.tradingName,
      actionType: 'CLIENTE_CRIADO',
      description: `Cadastrou o cliente "${createdClient.tradingName}" no Plano ${createdClient.plan} (R$ ${createdClient.monthlyValue.toLocaleString('pt-BR')}/mês).`
    };
    setAuditLogs((prev) => [auditLog, ...prev]);
    setFirestoreDoc('auditLogs', auditLog).catch(() => {});

    confetti({
      particleCount: 60,
      spread: 70,
      origin: { y: 0.6 }
    });

    return createdClient;
  };

  const updateClient = (id: string, data: Partial<Client>) => {
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'GESTOR') {
      console.warn('Permissão negada: apenas Administradores e Gestores podem atualizar clientes.');
      return;
    }
    setClients((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c))
    );
    updateFirestoreDoc('clients', id, { ...data, updatedAt: new Date().toISOString() }).catch((err) =>
      console.error('Error updating client in Firestore:', err)
    );
  };

  const deleteClient = (id: string) => {
    if (currentUser.role !== 'ADMIN') {
      console.warn('Permissão negada: apenas Administradores podem excluir clientes.');
      return;
    }
    setClients((prev) => prev.filter((c) => c.id !== id));
    setTasks((prev) => prev.filter((t) => t.clientId !== id));
    setContents((prev) => prev.filter((cnt) => cnt.clientId !== id));
    setAccesses((prev) => prev.filter((a) => a.clientId !== id));
    setMeetings((prev) => prev.filter((m) => m.clientId !== id));
    setFinancials((prev) => prev.filter((f) => f.clientId !== id));

    if (activeClientId === id) {
      const remaining = clients.filter((c) => c.id !== id);
      setActiveClientId(remaining[0]?.id || '');
    }

    deleteFirestoreDoc('clients', id).catch(() => {});
  };

  const advancePipelineStage = (clientId: string, targetStage: PipelineStage): { success: boolean; message?: string } => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return { success: false, message: 'Cliente não encontrado.' };

    const currentIndex = PIPELINE_STAGES_ORDER.indexOf(client.pipelineStage);
    const targetIndex = PIPELINE_STAGES_ORDER.indexOf(targetStage);

    if (targetIndex < 0) return { success: false, message: 'Etapa inválida.' };

    if (targetIndex > currentIndex + 1 && currentUser.role !== 'ADMIN') {
      return { success: false, message: 'Não é possível avançar mais de uma etapa por vez.' };
    }

    updateClient(clientId, { pipelineStage: targetStage });
    return { success: true };
  };

  const confirmWhatsAppGroup = (clientId: string, link: string) => {
    updateClient(clientId, {
      whatsappGroup: {
        link,
        status: 'CONFIRMADO',
        confirmedAt: new Date().toISOString()
      }
    });
    setTimeout(() => recalculateClientHealthAndOnboarding(clientId), 100);
  };

  const saveBriefing = (clientId: string, data: Partial<BriefingData>) => {
    const nowIso = new Date().toISOString();
    const updated: BriefingData = {
      isComplete: true,
      updatedAt: nowIso,
      ...briefings[clientId],
      ...data
    };
    setBriefings((prev) => ({ ...prev, [clientId]: updated }));
    setFirestoreDoc('briefings', { ...updated, id: clientId }).catch(() => {});
    setTimeout(() => recalculateClientHealthAndOnboarding(clientId), 100);
  };

  // ACCESS MANAGEMENT (Zero-plaintext passwords)
  const addAccess = (credential: Omit<AccessCredential, 'id' | 'updatedAt'>) => {
    const newId = `acc-${Date.now()}`;
    const sanitized = { ...credential };
    delete (sanitized as any).passwordOrToken;
    delete (sanitized as any).password;
    delete (sanitized as any).secret;
    delete (sanitized as any).token;

    const newCred: AccessCredential = {
      ...sanitized,
      id: newId,
      updatedAt: new Date().toISOString()
    };
    setAccesses((prev) => [newCred, ...prev]);
    setFirestoreDoc('accesses', newCred).catch(() => {});
  };

  const updateAccess = (id: string, data: Partial<AccessCredential>) => {
    const sanitized = { ...data };
    delete (sanitized as any).passwordOrToken;
    delete (sanitized as any).password;
    delete (sanitized as any).secret;
    delete (sanitized as any).token;

    setAccesses((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...sanitized, updatedAt: new Date().toISOString() } : a))
    );
    updateFirestoreDoc('accesses', id, { ...sanitized, updatedAt: new Date().toISOString() }).catch(() => {});
  };

  const validateAccess = (id: string) => {
    const updated = {
      status: 'VALIDADO' as const,
      validatedBy: currentUser.name,
      validatedAt: new Date().toISOString()
    };
    setAccesses((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updated } : a))
    );
    updateFirestoreDoc('accesses', id, updated).catch(() => {});
    const item = accesses.find((a) => a.id === id);
    if (item) {
      setTimeout(() => recalculateClientHealthAndOnboarding(item.clientId), 100);
    }
  };

  const deleteAccess = (id: string) => {
    setAccesses((prev) => prev.filter((a) => a.id !== id));
    deleteFirestoreDoc('accesses', id).catch(() => {});
  };

  // TASKS
  const createTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'commentsCount'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      commentsCount: 0
    };
    setTasks((prev) => [newTask, ...prev]);
    setFirestoreDoc('tasks', newTask).catch((err) =>
      console.error('Error saving task to Firestore:', err)
    );
    setTimeout(() => recalculateClientHealthAndOnboarding(taskData.clientId), 100);
  };

  const updateTaskStatus = (taskId: string, status: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status,
              completedAt: status === 'CONCLUIDA' ? new Date().toISOString() : undefined
            }
          : t
      )
    );
    updateFirestoreDoc('tasks', taskId, {
      status,
      completedAt: status === 'CONCLUIDA' ? new Date().toISOString() : null
    }).catch(() => {});

    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setTimeout(() => recalculateClientHealthAndOnboarding(task.clientId), 100);
    }
  };

  const updateTask = (taskId: string, data: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, ...data } : t))
    );
    updateFirestoreDoc('tasks', taskId, data).catch(() => {});
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      setTimeout(() => recalculateClientHealthAndOnboarding(task.clientId), 100);
    }
  };

  const deleteTask = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    deleteFirestoreDoc('tasks', taskId).catch(() => {});
    if (task) {
      setTimeout(() => recalculateClientHealthAndOnboarding(task.clientId), 100);
    }
  };

  // CONTENT & APPROVALS
  const createContent = (contentData: Omit<ContentItem, 'id' | 'createdAt' | 'currentVersion' | 'approvalHistory'>) => {
    const newContent: ContentItem = {
      ...contentData,
      id: `cnt-${Date.now()}`,
      currentVersion: 1,
      approvalHistory: [],
      createdAt: new Date().toISOString()
    };
    setContents((prev) => [newContent, ...prev]);
    setFirestoreDoc('contents', newContent).catch((err) =>
      console.error('Error saving content to Firestore:', err)
    );
    setTimeout(() => recalculateClientHealthAndOnboarding(contentData.clientId), 100);
  };

  const updateContent = (id: string, data: Partial<ContentItem>) => {
    setContents((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c))
    );
    updateFirestoreDoc('contents', id, data).catch(() => {});
    const item = contents.find((c) => c.id === id);
    if (item) {
      setTimeout(() => recalculateClientHealthAndOnboarding(item.clientId), 100);
    }
  };

  const deleteContent = (id: string) => {
    const item = contents.find((c) => c.id === id);
    setContents((prev) => prev.filter((c) => c.id !== id));
    deleteFirestoreDoc('contents', id).catch(() => {});
    if (item) {
      setTimeout(() => recalculateClientHealthAndOnboarding(item.clientId), 100);
    }
  };

  const approveContent = (contentId: string, comment?: string) => {
    const item = contents.find((c) => c.id === contentId);
    if (!item) return;

    const newApproval = {
      id: `app-hist-${Date.now()}`,
      version: item.currentVersion,
      status: 'APROVADO' as const,
      authorName: currentUser.name,
      authorRole: currentUser.role === 'CLIENTE' ? 'Cliente' : currentUser.title,
      timestamp: new Date().toISOString(),
      comment
    };

    const updatedData = {
      status: 'APROVADO' as const,
      approvalHistory: [newApproval, ...item.approvalHistory]
    };

    setContents((prev) =>
      prev.map((c) => (c.id === contentId ? { ...c, ...updatedData } : c))
    );
    updateFirestoreDoc('contents', contentId, updatedData).catch(() => {});
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    setTimeout(() => recalculateClientHealthAndOnboarding(item.clientId), 100);
  };

  const requestContentRevision = (contentId: string, reason: string) => {
    const item = contents.find((c) => c.id === contentId);
    if (!item) return;

    const newRevision = {
      id: `app-hist-${Date.now()}`,
      version: item.currentVersion,
      status: 'SOLICITADA_ALTERACAO' as const,
      authorName: currentUser.name,
      authorRole: currentUser.role === 'CLIENTE' ? 'Cliente' : currentUser.title,
      timestamp: new Date().toISOString(),
      comment: reason
    };

    const updatedData = {
      status: 'REPROVADO' as const,
      revisionRequestReason: reason,
      approvalHistory: [newRevision, ...item.approvalHistory]
    };

    setContents((prev) =>
      prev.map((c) => (c.id === contentId ? { ...c, ...updatedData } : c))
    );
    updateFirestoreDoc('contents', contentId, updatedData).catch(() => {});
    setTimeout(() => recalculateClientHealthAndOnboarding(item.clientId), 100);
  };

  // TICKETS
  const createTicket = (ticketData: Omit<Ticket, 'id' | 'createdAt'>) => {
    const newTicket: Ticket = {
      ...ticketData,
      id: `tkt-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setTickets((prev) => [newTicket, ...prev]);
    setFirestoreDoc('tickets', newTicket).catch(() => {});
  };

  const updateTicketStatus = (ticketId: string, status: Ticket['status']) => {
    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status,
              resolvedAt: status === 'RESOLVIDO' ? new Date().toISOString() : undefined
            }
          : t
      )
    );
    updateFirestoreDoc('tickets', ticketId, {
      status,
      resolvedAt: status === 'RESOLVIDO' ? new Date().toISOString() : null
    }).catch(() => {});
  };

  // MEETINGS
  const createMeeting = (meetingData: Omit<Meeting, 'id'>) => {
    if (currentUser.role === 'CLIENTE') {
      console.warn('Clientes não possuem permissão para agendar reuniões internas.');
      return;
    }
    const newMeeting: Meeting = {
      ...meetingData,
      id: `meet-${Date.now()}`
    };
    setMeetings((prev) => [newMeeting, ...prev]);
    setFirestoreDoc('meetings', newMeeting).catch((err) =>
      console.error('Error saving meeting to Firestore:', err)
    );
  };

  const updateMeeting = (meetingId: string, data: Partial<Meeting>) => {
    if (currentUser.role === 'CLIENTE') {
      console.warn('Clientes não possuem permissão para alterar reuniões.');
      return;
    }
    setMeetings((prev) =>
      prev.map((m) => (m.id === meetingId ? { ...m, ...data } : m))
    );
    updateFirestoreDoc('meetings', meetingId, data).catch(() => {});
  };

  const deleteMeeting = (meetingId: string) => {
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'GESTOR') {
      console.warn('Permissão negada: apenas Administradores e Gestores podem excluir reuniões.');
      return;
    }
    setMeetings((prev) => prev.filter((m) => m.id !== meetingId));
    deleteFirestoreDoc('meetings', meetingId).catch(() => {});
  };

  // DOCUMENTS & STORAGE INTEGRATION
  const uploadDocument = async (
    docData: Omit<DocumentFile, 'id' | 'uploadedAt'>,
    file?: File
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const docId = `doc-${Date.now()}`;
      let downloadURL = docData.url || '';
      let storagePath = docData.storagePath;

      if (file) {
        // Real upload to Firebase Storage with size (<50MB) and MIME validation
        const uploadResult = await uploadClientFileToStorage(docData.clientId, file, 'documents');
        downloadURL = uploadResult.downloadURL;
        storagePath = uploadResult.storagePath;
      }

      const newDoc: DocumentFile = {
        ...docData,
        id: docId,
        url: downloadURL,
        downloadURL: downloadURL,
        storagePath: storagePath,
        uploadedAt: new Date().toISOString()
      };

      setDocuments((prev) => [newDoc, ...prev]);
      await setFirestoreDoc('documents', newDoc);
      return { success: true };
    } catch (err: any) {
      console.error('Document upload error:', err);
      return {
        success: false,
        message: err?.message || 'Falha ao realizar upload do arquivo para o Firebase Storage.'
      };
    }
  };

  const deleteDocument = async (docId: string): Promise<void> => {
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'GESTOR') {
      console.warn('Permissão negada: apenas Administradores e Gestores podem excluir documentos.');
      return;
    }
    const docToDelete = documents.find((d) => d.id === docId);
    if (docToDelete?.storagePath) {
      try {
        await deleteFileFromStorage(docToDelete.storagePath);
      } catch (err) {
        console.warn('Notice: Storage file deletion warning:', err);
      }
    }
    setDocuments((prev) => prev.filter((d) => d.id !== docId));
    await deleteFirestoreDoc('documents', docId);
  };

  // FINANCE & TRANSACTIONS
  const updateFinancial = (id: string, data: Partial<FinancialRecord>) => {
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'GESTOR') {
      console.warn('Permissão negada: acesso restrito a dados financeiros.');
      return;
    }
    setFinancials((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...data } : f))
    );
    updateFirestoreDoc('financials', id, data).catch(() => {});
    const fin = financials.find((f) => f.id === id);
    if (fin) {
      setTimeout(() => recalculateClientHealthAndOnboarding(fin.clientId), 100);
    }
  };

  const updateFinancialStatus = (id: string, status: FinancialRecord['status']) => {
    updateFinancial(id, { status });
  };

  const addTransaction = (trxData: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'GESTOR') {
      console.warn('Permissão negada: apenas Administradores e Gestores podem lançar transações.');
      return;
    }
    const newTrx: Transaction = {
      ...trxData,
      id: `trx-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setTransactions((prev) => [newTrx, ...prev]);
    setFirestoreDoc('transactions', newTrx).catch(() => {});
  };

  const updateTransactionStatus = (id: string, status: Transaction['status']) => {
    if (currentUser.role !== 'ADMIN' && currentUser.role !== 'GESTOR') return;
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
    updateFirestoreDoc('transactions', id, { status }).catch(() => {});
  };

  const deleteTransaction = (id: string) => {
    if (currentUser.role !== 'ADMIN') return;
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    deleteFirestoreDoc('transactions', id).catch(() => {});
  };

  const createReport = (reportData: Omit<MonthlyReport, 'id' | 'createdAt'>) => {
    const newReport: MonthlyReport = {
      ...reportData,
      id: `rep-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setReports((prev) => [newReport, ...prev]);
    setFirestoreDoc('reports', newReport).catch(() => {});
  };

  // TEAM MANAGEMENT & AUTH APPROVALS
  const addUser = (userData: Omit<User, 'id'>) => {
    if (currentUser.role !== 'ADMIN') {
      console.warn('Somente administradores podem convidar usuários para a equipe.');
      return;
    }
    const newId = `user-${Date.now()}`;
    const newUser: User = {
      ...userData,
      id: newId,
      status: 'PENDENTE_APROVACAO',
      createdAt: new Date().toISOString()
    };
    setUsers((prev) => [newUser, ...prev]);
    setFirestoreDoc('users', newUser).catch(() => {});
  };

  const updateUser = (id: string, data: Partial<User>) => {
    // Non-admins cannot elevate their own or others' roles or statuses
    if (currentUser.role !== 'ADMIN') {
      const sanitizedData = { ...data };
      delete sanitizedData.role;
      delete sanitizedData.status;
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...sanitizedData } : u))
      );
      if (currentUser.id === id) {
        setCurrentUser((prev) => ({ ...prev, ...sanitizedData }));
      }
      updateFirestoreDoc('users', id, sanitizedData).catch(() => {});
      return;
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...data } : u))
    );
    if (currentUser.id === id) {
      setCurrentUser((prev) => ({ ...prev, ...data }));
    }
    updateFirestoreDoc('users', id, data).catch(() => {});
  };

  const deleteUser = (id: string) => {
    if (currentUser.role !== 'ADMIN') {
      console.warn('Somente administradores podem excluir usuários.');
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== id));
    deleteFirestoreDoc('users', id).catch(() => {});
  };

  const approveUser = (id: string) => {
    if (currentUser.role !== 'ADMIN') {
      console.warn('Somente administradores podem aprovar contas.');
      return;
    }
    updateUser(id, { status: 'ATIVO' });
  };

  const rejectUser = (id: string) => {
    if (currentUser.role !== 'ADMIN') {
      console.warn('Somente administradores podem rejeitar solicitações.');
      return;
    }
    deleteUser(id);
  };

  // AUTOMATIONS & TEMPLATES
  const triggerAutomation = (ruleId: string) => {
    setAutomations((prev) =>
      prev.map((a) =>
        a.id === ruleId
          ? { ...a, timesTriggered: a.timesTriggered + 1, lastTriggeredAt: new Date().toISOString() }
          : a
      )
    );
  };

  const toggleAutomation = (ruleId: string) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === ruleId ? { ...a, isActive: !a.isActive } : a))
    );
  };

  const createAutomationRule = (ruleData: Omit<AutomationRule, 'id' | 'timesTriggered'>) => {
    const newRule: AutomationRule = {
      ...ruleData,
      id: `aut-${Date.now()}`,
      timesTriggered: 0
    };
    setAutomations((prev) => [newRule, ...prev]);
  };

  const deleteAutomationRule = (ruleId: string) => {
    setAutomations((prev) => prev.filter((a) => a.id !== ruleId));
  };

  const createProcessTemplate = (templateData: Omit<ProcessTemplate, 'id'>) => {
    const newTemplate: ProcessTemplate = {
      ...templateData,
      id: `tpl-${Date.now()}`
    };
    setTemplates((prev) => [newTemplate, ...prev]);
  };

  const applyTemplateToClient = (templateId: string, clientId: string) => {
    const template = templates.find((t) => t.id === templateId);
    const client = clients.find((c) => c.id === clientId);
    if (!template || !client) return;

    const today = new Date();
    const addDays = (d: Date, days: number) => {
      const copy = new Date(d);
      copy.setDate(copy.getDate() + days);
      return copy.toISOString().split('T')[0];
    };

    const newTasks: Task[] = template.defaultTasks.map((dt, idx) => {
      let assignedToId = currentUser.id;
      if (dt.defaultRole === 'ACCOUNT_MANAGER' && client.team?.accountManagerId) {
        assignedToId = client.team.accountManagerId;
      } else if (dt.defaultRole === 'SOCIAL_MEDIA' && client.team?.socialMediaId) {
        assignedToId = client.team.socialMediaId;
      } else if (dt.defaultRole === 'DESIGNER' && client.team?.designerId) {
        assignedToId = client.team.designerId;
      } else if (dt.defaultRole === 'COPYWRITER' && client.team?.copywriterId) {
        assignedToId = client.team.copywriterId;
      } else if (dt.defaultRole === 'TRAFFIC_MANAGER' && client.team?.trafficManagerId) {
        assignedToId = client.team.trafficManagerId;
      }

      return {
        id: `task-tpl-${Date.now()}-${idx}`,
        clientId: client.id,
        title: `${dt.title} - ${client.tradingName}`,
        description: `Tarefa gerada a partir do template "${template.name}".`,
        assignedToId,
        createdById: currentUser.id,
        priority: 'MEDIA',
        dueDate: addDays(today, dt.relativeDays),
        status: 'A_FAZER',
        category: dt.category,
        isAutomated: true,
        createdAt: new Date().toISOString()
      };
    });

    setTasks((prev) => [...newTasks, ...prev]);
    newTasks.forEach((t) => setFirestoreDoc('tasks', t).catch(() => {}));
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
  };

  const generateMonthlyCycleTasks = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    if (!client) return;

    const today = new Date();
    const addDays = (d: Date, days: number) => {
      const copy = new Date(d);
      copy.setDate(copy.getDate() + days);
      return copy.toISOString().split('T')[0];
    };

    const cycleTasks: Task[] = [
      {
        id: `task-cyc-${clientId}-1`,
        clientId,
        title: `Planejamento Editorial & Calendário Mensal - ${client.tradingName}`,
        description: 'Definição de temas, datas sazonais e pautas de conteúdo.',
        assignedToId: client.team?.socialMediaId || currentUser.id,
        createdById: currentUser.id,
        priority: 'ALTA',
        dueDate: addDays(today, 3),
        status: 'A_FAZER',
        category: 'CONTEUDO',
        createdAt: new Date().toISOString()
      },
      {
        id: `task-cyc-${clientId}-2`,
        clientId,
        title: `Redação de Copys e Roteiros de Reels`,
        description: 'Produção dos textos persuasivos para os posts do mês.',
        assignedToId: client.team?.copywriterId || currentUser.id,
        createdById: currentUser.id,
        priority: 'NORMAL',
        dueDate: addDays(today, 6),
        status: 'A_FAZER',
        category: 'COPY',
        createdAt: new Date().toISOString()
      },
      {
        id: `task-cyc-${clientId}-3`,
        clientId,
        title: `Design dos Criativos & Carrosséis`,
        description: 'Criação das artes visuais seguindo a identidade da marca.',
        assignedToId: client.team?.designerId || currentUser.id,
        createdById: currentUser.id,
        priority: 'NORMAL',
        dueDate: addDays(today, 10),
        status: 'A_FAZER',
        category: 'DESIGN',
        createdAt: new Date().toISOString()
      },
      {
        id: `task-cyc-${clientId}-4`,
        clientId,
        title: `Otimização de Campanhas de Tráfego Pago`,
        description: 'Análise de CTR, CPA e escala de criativos validados.',
        assignedToId: client.team?.trafficManagerId || currentUser.id,
        createdById: currentUser.id,
        priority: 'ALTA',
        dueDate: addDays(today, 15),
        status: 'A_FAZER',
        category: 'TRAFEGO',
        createdAt: new Date().toISOString()
      }
    ];

    setTasks((prev) => [...cycleTasks, ...prev]);
    cycleTasks.forEach((t) => setFirestoreDoc('tasks', t).catch(() => {}));
    confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const resetDemoData = () => {
    setClients([]);
    setTasks([]);
    setContents([]);
    setMeetings([]);
    setFinancials([]);
    setTransactions([]);
    setAuditLogs([]);
  };

  const clearAllData = () => {
    setClients([]);
    setTasks([]);
    setContents([]);
    setMeetings([]);
    setFinancials([]);
    setTransactions([]);
  };

  return (
    <AgencyContext.Provider
      value={{
        currentUser,
        users,
        clients,
        activeClient,
        activeClientId,
        activeTab,
        tasks,
        contents,
        briefings,
        accesses,
        meetings,
        tickets,
        documents,
        financials,
        transactions,
        reports,
        automations,
        templates,
        auditLogs,
        notifications,
        plans,
        welcomeEmailModalClient,
        globalSearchOpen,
        isAuthenticated,
        isLoadingAuth,
        isFirestoreConnected,
        loginWithGoogle,
        login,
        register,
        resetPassword,
        logout,
        setCurrentUser,
        setActiveClientId,
        setActiveTab,
        setGlobalSearchOpen,
        setWelcomeEmailModalClient,
        createClient,
        updateClient,
        deleteClient,
        advancePipelineStage,
        confirmWhatsAppGroup,
        saveBriefing,
        addAccess,
        updateAccess,
        validateAccess,
        deleteAccess,
        createTask,
        updateTaskStatus,
        updateTask,
        deleteTask,
        createContent,
        updateContent,
        deleteContent,
        approveContent,
        requestContentRevision,
        createTicket,
        updateTicketStatus,
        createMeeting,
        updateMeeting,
        deleteMeeting,
        uploadDocument,
        deleteDocument,
        updateFinancial,
        updateFinancialStatus,
        addTransaction,
        updateTransactionStatus,
        deleteTransaction,
        createReport,
        triggerAutomation,
        toggleAutomation,
        createAutomationRule,
        deleteAutomationRule,
        applyTemplateToClient,
        createProcessTemplate,
        generateMonthlyCycleTasks,
        addUser,
        updateUser,
        deleteUser,
        requestAccess,
        approveUser,
        rejectUser,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        resetDemoData,
        clearAllData
      }}
    >
      {children}
    </AgencyContext.Provider>
  );
};

export const useAgency = () => {
  const context = useContext(AgencyContext);
  if (!context) {
    throw new Error('useAgency must be used within an AgencyProvider');
  }
  return context;
};
