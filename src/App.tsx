import React, { useState, useEffect } from 'react';
import { AgencyProvider, useAgency } from './context/AgencyContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { GlobalSearchModal } from './components/layout/GlobalSearchModal';
import { WelcomeEmailModal } from './components/common/WelcomeEmailModal';
import { NewClientModal } from './components/clients/NewClientModal';

// Pages
import { Dashboard } from './components/pages/Dashboard';
import { ClientsListView } from './components/clients/ClientsListView';
import { ClientDetailView } from './components/clients/ClientDetailView';
import { PipelineKanbanView } from './components/pipeline/PipelineKanbanView';
import { TasksPage } from './components/pages/TasksPage';
import { ContentPage } from './components/pages/ContentPage';
import { CalendarPage } from './components/pages/CalendarPage';
import { TeamPage } from './components/pages/TeamPage';
import { FinancialPage } from './components/pages/FinancialPage';
import { ReportsPage } from './components/pages/ReportsPage';
import { TicketsPage } from './components/pages/TicketsPage';
import { DocumentsPage } from './components/pages/DocumentsPage';
import { AuditLogPage } from './components/pages/AuditLogPage';
import { AutomationsPage } from './components/pages/AutomationsPage';
import { TemplatesPage } from './components/pages/TemplatesPage';
import { BriefingForm } from './components/onboarding/BriefingForm';
import { AccessChecklistVault } from './components/onboarding/AccessChecklistVault';
import { ClientOnboardingFlow } from './components/onboarding/ClientOnboardingFlow';
import { SettingsPage } from './components/pages/SettingsPage';
import { LoginPage } from './components/auth/LoginPage';
import { PendingApprovalView } from './components/auth/PendingApprovalView';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    activeClient,
    welcomeEmailModalClient,
    setWelcomeEmailModalClient,
    isAuthenticated,
    isLoadingAuth,
    globalSearchOpen,
    setGlobalSearchOpen,
    currentUser,
    clients
  } = useAgency();

  const [isNewClientOpen, setIsNewClientOpen] = useState(false);

  // While Firebase Auth is confirming session, show authentic secure loading
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center text-gray-300">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mb-4 animate-pulse">
          <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <div className="text-sm font-semibold text-white tracking-wide">InfinityRocket</div>
        <p className="text-xs text-gray-400 mt-1">Verificando sessão segura no Firebase Auth...</p>
      </div>
    );
  }

  // If not authenticated, render the dedicated Login & Portal Page
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // If user account is pending approval by an admin, show secure waiting view
  if (currentUser?.status === 'PENDENTE_APROVACAO' && currentUser?.role !== 'ADMIN') {
    return <PendingApprovalView />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onOpenNewClient={() => setIsNewClientOpen(true)} />;

      case 'pipeline':
        return <PipelineKanbanView />;

      case 'clientes':
        // If an activeClient is selected, show details, else list
        return activeClient ? (
          <ClientDetailView />
        ) : (
          <ClientsListView onOpenNewClient={() => setIsNewClientOpen(true)} />
        );

      case 'onboarding': {
        const targetClient = activeClient || clients[0];
        return targetClient ? (
          <ClientOnboardingFlow client={targetClient} />
        ) : (
          <ClientsListView onOpenNewClient={() => setIsNewClientOpen(true)} />
        );
      }

      case 'briefing':
        return <BriefingForm clientId={activeClient?.id} />;

      case 'acessos':
        return <AccessChecklistVault clientId={activeClient?.id} />;

      case 'tarefas':
        return <TasksPage />;

      case 'conteudo':
        return <ContentPage />;

      case 'calendario':
        return <CalendarPage />;

      case 'equipe':
        return <TeamPage />;

      case 'financeiro':
        return <FinancialPage />;

      case 'relatorios':
        return <ReportsPage />;

      case 'solicitacoes':
        return <TicketsPage />;

      case 'documentos':
        return <DocumentsPage />;

      case 'auditoria':
        return <AuditLogPage />;

      case 'automacoes':
        return <AutomationsPage />;

      case 'templates':
        return <TemplatesPage />;

      case 'configuracoes':
        return <SettingsPage />;

      default:
        return <Dashboard onOpenNewClient={() => setIsNewClientOpen(true)} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#111827] text-gray-100 font-sans antialiased overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <Navbar
          onOpenSearch={() => setGlobalSearchOpen(true)}
          onOpenNewClient={() => setIsNewClientOpen(true)}
        />

        {/* Dynamic Page Container */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 bg-[#111827]">
          <div className="max-w-7xl mx-auto">{renderActiveView()}</div>
        </main>
      </div>

      {/* Global Search ⌘K Modal */}
      <GlobalSearchModal />

      {/* Welcome Email Modal triggered on client creation */}
      {welcomeEmailModalClient && (
        <WelcomeEmailModal
          client={welcomeEmailModalClient}
          onClose={() => setWelcomeEmailModalClient(null)}
        />
      )}

      {/* New Client Creation Modal */}
      {isNewClientOpen && <NewClientModal onClose={() => setIsNewClientOpen(false)} />}
    </div>
  );
};

export default function App() {
  return (
    <AgencyProvider>
      <MainLayout />
    </AgencyProvider>
  );
}
