import React, { useState } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorkflowProvider, useWorkflow } from './context/WorkflowContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { OwnerView } from './components/views/OwnerView';
import { StaffView } from './components/views/StaffView';
import { CustomerView } from './components/views/CustomerView';
import { AuthGateway } from './components/auth/AuthGateway';
import { AiWorkflowGeneratorModal } from './components/workflow/AiWorkflowGeneratorModal';
import { RagAssistantDrawer } from './components/ai/RagAssistantDrawer';
import { PdfReportsModal } from './components/reports/PdfReportsModal';
import { BusinessOnboardingModal } from './components/onboarding/BusinessOnboardingModal';
import { Loader2 } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentUser, currentRole, isLoading: authLoading } = useAuth();
  const { isLoading: workflowLoading } = useWorkflow();
  const { theme } = useTheme();

  const [currentTab, setCurrentTab] = useState<string>('owner_dashboard');
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  // Sync default tab when role changes
  React.useEffect(() => {
    if (currentRole === 'OWNER') {
      setCurrentTab('owner_dashboard');
    } else if (currentRole === 'STAFF') {
      setCurrentTab('staff_dashboard');
    } else if (currentRole === 'CUSTOMER') {
      setCurrentTab('customer_dashboard');
    }
  }, [currentRole]);

  if (authLoading && workflowLoading && !currentUser) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center space-y-4 transition-colors duration-300 ${
        theme === 'dark' ? 'bg-[#08090C] text-slate-200 linear-ambient-dark' : 'bg-[#F8FAFC] text-slate-800 linear-ambient-light'
      }`}>
        <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center shadow-lg backdrop-blur-md">
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
        </div>
        <div className="text-sm font-semibold tracking-wide font-mono">
          Bootstrapping OmniFlow AI Multi-Tenant B2B Engine...
        </div>
      </div>
    );
  }

  // If no user is logged in, show the dedicated multi-role Auth Gateway
  if (!currentUser) {
    return <AuthGateway />;
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white transition-colors duration-200 ${
      theme === 'dark'
        ? 'bg-[#08090C] text-slate-100 linear-ambient-dark'
        : 'bg-[#F8FAFC] text-slate-900 linear-ambient-light'
    }`}>
      {/* Universal Top Header */}
      <Header onOpenOnboarding={() => setIsOnboardingOpen(true)} />

      {/* Main App Layout */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        {/* Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
        />

        {/* Center Main Stage */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-[calc(100vh-5rem)]">
          {currentRole === 'OWNER' && <OwnerView currentTab={currentTab} />}
          {currentRole === 'STAFF' && <StaffView currentTab={currentTab} />}
          {currentRole === 'CUSTOMER' && (
            <CustomerView currentTab={currentTab} onSelectTab={setCurrentTab} />
          )}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <AiWorkflowGeneratorModal />
      <RagAssistantDrawer />
      <PdfReportsModal />
      <BusinessOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => setIsOnboardingOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WorkflowProvider>
          <MainAppContent />
        </WorkflowProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
