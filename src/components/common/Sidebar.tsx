import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWorkflow } from '../../context/WorkflowContext';
import {
  LayoutDashboard,
  GitBranch,
  Inbox,
  Users,
  FileBarChart,
  Settings,
  PlusCircle,
  Clock,
  Sparkles,
  BookOpen,
  Layers,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenOnboarding: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: any;
  badge?: string;
  highlight?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, onOpenOnboarding }) => {
  const { currentRole, currentBusiness } = useAuth();
  const { requests, workflows, setIsRagOpen, setIsAiGeneratorModalOpen } = useWorkflow();

  const pendingCount = requests.filter(
    (r) => r.status === 'SUBMITTED' || r.status === 'IN_REVIEW' || r.status === 'APPROVAL'
  ).length;

  const inProgressCount = requests.filter(
    (r) => r.status === 'IN_PROGRESS' || r.status === 'ASSIGNED'
  ).length;

  const atRiskCount = requests.filter(
    (r) =>
      r.status !== 'COMPLETED' &&
      r.status !== 'REJECTED' &&
      (r.slaInfo?.status === 'AT_RISK' ||
        r.slaInfo?.status === 'WARNING' ||
        r.slaInfo?.status === 'BREACHED')
  ).length;

  // Navigation Items per role
  const ownerNav: NavItem[] = [
    { id: 'owner_dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'owner_sla', label: 'SLA & Breach Predictor', icon: ShieldAlert, badge: atRiskCount > 0 ? `${atRiskCount} risk` : undefined, highlight: atRiskCount > 0 },
    { id: 'owner_workflows', label: 'Workflow Engine', icon: GitBranch, badge: `${workflows.length}` },
    { id: 'owner_requests', label: 'Request Master', icon: Inbox, badge: pendingCount > 0 ? `${pendingCount}` : undefined },
    { id: 'owner_users', label: 'Staff & Customers', icon: Users },
    { id: 'owner_reports', label: 'Executive Reports', icon: FileBarChart },
    { id: 'owner_settings', label: 'Tenant Settings', icon: Settings },
  ];

  const staffNav: NavItem[] = [
    { id: 'staff_dashboard', label: 'Staff Workload', icon: LayoutDashboard },
    { id: 'staff_sla', label: 'SLA Health & Queue', icon: ShieldAlert, badge: atRiskCount > 0 ? `${atRiskCount} risk` : undefined },
    { id: 'staff_requests', label: 'Task Execution Queue', icon: Inbox, badge: inProgressCount > 0 ? `${inProgressCount}` : undefined },
    { id: 'staff_knowledge', label: 'Knowledge Base', icon: BookOpen },
    { id: 'staff_reports', label: 'Fulfillment Reports', icon: FileBarChart },
  ];

  const customerNav: NavItem[] = [
    { id: 'customer_dashboard', label: 'Client Portal', icon: LayoutDashboard },
    { id: 'customer_new_request', label: '+ New Request', icon: PlusCircle, highlight: true },
    { id: 'customer_requests', label: 'My Requests & Status', icon: Clock, badge: `${requests.length}` },
    { id: 'customer_services', label: 'Service Catalog', icon: Layers },
  ];

  const navItems =
    currentRole === 'OWNER' ? ownerNav : currentRole === 'STAFF' ? staffNav : customerNav;

  return (
    <aside className="w-64 backdrop-blur-xl border-r transition-colors duration-200 bg-[#08090C]/80 border-white/[0.08] light:bg-white/80 light:border-slate-200 flex flex-col justify-between shrink-0 min-h-[calc(100vh-5rem)] p-3.5 text-slate-200 light:text-slate-800">
      <div className="space-y-4">
        {/* Business Badge with Linear Glass Card */}
        <div className="p-3 rounded-xl border backdrop-blur-md transition-all duration-200 bg-white/[0.03] border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] light:bg-slate-50 light:border-slate-200 light:shadow-xs">
          <div className="text-[9px] font-semibold font-mono uppercase tracking-widest text-slate-400 light:text-slate-500">
            Active Workspace
          </div>
          <div className="font-serif italic font-semibold text-slate-100 light:text-slate-900 text-base truncate mt-0.5">
            {currentBusiness?.name}
          </div>
          <div className="text-[10px] font-mono text-slate-400 light:text-slate-500 uppercase tracking-wider truncate">
            {currentBusiness?.industry}
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id}`}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 group relative ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 font-semibold border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.15)] light:bg-indigo-50 light:text-indigo-700 light:border-indigo-200'
                    : item.highlight
                    ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border border-indigo-500/40 hover:border-indigo-400 light:from-indigo-100 light:to-purple-100 light:text-indigo-800 light:border-indigo-300'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.05] light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-100 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition duration-150 ${
                      isActive
                        ? 'text-indigo-400 light:text-indigo-600'
                        : item.highlight
                        ? 'text-indigo-300 light:text-indigo-700'
                        : 'text-slate-400 group-hover:text-slate-200 light:text-slate-500 light:group-hover:text-slate-800'
                    }`}
                  />
                  <span className="tracking-wide">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-mono font-bold rounded ${
                      isActive
                        ? 'bg-indigo-500/30 text-indigo-200 light:bg-indigo-200 light:text-indigo-800'
                        : 'bg-white/[0.06] text-slate-300 border border-white/[0.06] light:bg-slate-200 light:text-slate-700 light:border-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Blocks per role */}
        {currentRole === 'OWNER' && (
          <div className="pt-3 border-t border-white/[0.06] light:border-slate-200">
            <div className="text-[9px] font-semibold text-slate-400 light:text-slate-500 font-mono uppercase tracking-widest px-3 mb-2">
              AI Automations
            </div>
            <button
              onClick={() => setIsAiGeneratorModalOpen(true)}
              className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border backdrop-blur-md transition-all group bg-gradient-to-r from-indigo-500/10 to-purple-500/10 hover:from-indigo-500/20 hover:to-purple-500/20 border-indigo-500/20 hover:border-indigo-500/40 text-slate-200 light:from-indigo-50 light:to-purple-50 light:border-indigo-200 light:text-slate-800"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-indigo-300 light:text-indigo-600" />
              </div>
              <div className="text-left truncate">
                <div className="font-medium text-xs text-slate-100 light:text-slate-900 group-hover:text-indigo-300 transition">Architect Workflow</div>
                <div className="text-[10px] text-slate-400 light:text-slate-500 truncate">Prompt to Pipeline</div>
              </div>
            </button>
          </div>
        )}

        {currentRole === 'CUSTOMER' && (
          <div className="pt-3 border-t border-white/[0.06] light:border-slate-200">
            <button
              onClick={() => onSelectTab('customer_new_request')}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-bold uppercase tracking-wider shadow-md transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit Request</span>
            </button>
          </div>
        )}
      </div>

      {/* Footer Info / Assistant card with Glassmorphism */}
      <div className="pt-3 border-t border-white/[0.06] light:border-slate-200 space-y-2">
        <div className="p-3 rounded-xl border backdrop-blur-md bg-white/[0.03] border-white/[0.08] light:bg-slate-50 light:border-slate-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-100 light:text-slate-900">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 light:text-indigo-600" />
            <span>Gemini AI Chatbot</span>
          </div>
          <p className="text-[11px] text-slate-400 light:text-slate-500 mt-1 leading-snug">
            Multi-turn operations intelligence for SLAs, policies & requests.
          </p>
          <button
            id="sidebar-ask-gemini-btn"
            onClick={() => setIsRagOpen(true)}
            className="mt-2 w-full text-center py-1.5 rounded-lg bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-300 hover:text-indigo-200 light:bg-indigo-50 light:hover:bg-indigo-100 light:text-indigo-700 text-xs font-medium border border-indigo-500/30 transition flex items-center justify-center gap-1.5"
          >
            <span>Open Gemini Chat</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <button
          onClick={onOpenOnboarding}
          className="w-full text-left px-2 py-1.5 text-[10px] uppercase font-mono tracking-wider text-slate-400 hover:text-slate-200 light:text-slate-500 light:hover:text-slate-900 transition flex items-center justify-between"
        >
          <span>+ Onboard Business</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </aside>
  );
};
