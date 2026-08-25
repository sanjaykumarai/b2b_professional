import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWorkflow } from '../../context/WorkflowContext';
import { WorkflowGraph } from '../workflow/WorkflowGraph';
import { RequestKanban } from '../requests/RequestKanban';
import { RequestDetailsModal } from '../requests/RequestDetailsModal';
import { StatusBadge, PriorityBadge, RoleBadge } from '../common/Badge';
import { SlaAnalyticsDashboard } from '../sla/SlaAnalyticsDashboard';
import { pdfReports } from '../../services/pdfGenerator';
import { User, UserRole } from '../../types';
import {
  GitBranch,
  Inbox,
  Users,
  FileBarChart,
  Sparkles,
  Clock,
  TrendingUp,
  FileDown,
  ShieldCheck,
  Trash2,
  UserPlus,
  Search,
  AlertTriangle,
  CheckCircle2,
  X,
  UserCheck,
  UserX,
  Filter,
} from 'lucide-react';

interface OwnerViewProps {
  currentTab: string;
}

export const OwnerView: React.FC<OwnerViewProps> = ({ currentTab }) => {
  const { currentBusiness, allUsers, currentUser, removeUser, addUser } = useAuth();
  const {
    workflows,
    activeWorkflow,
    requests,
    setIsAiGeneratorModalOpen,
    setIsReportsOpen,
    selectedRequest,
    setSelectedRequest,
  } = useWorkflow();

  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');

  // User Management State
  const [userRoleFilter, setUserRoleFilter] = useState<'ALL' | 'STAFF' | 'CUSTOMER' | 'OWNER'>('ALL');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserData, setNewUserData] = useState<{
    name: string;
    email: string;
    role: UserRole;
    title: string;
    department: string;
  }>({
    name: '',
    email: '',
    role: 'STAFF',
    title: '',
    department: 'Operations',
  });
  const [notification, setNotification] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const totalReqs = requests.length;
  const completedReqs = requests.filter((r) => r.status === 'COMPLETED').length;
  const pendingApprovals = requests.filter((r) => r.status === 'APPROVAL').length;
  const inProgressReqs = requests.filter(
    (r) => r.status === 'IN_PROGRESS' || r.status === 'ASSIGNED' || r.status === 'IN_REVIEW'
  ).length;

  const fulfillmentRate = totalReqs > 0 ? Math.round((completedReqs / totalReqs) * 100) : 100;

  // Filtered Users
  const staffCount = allUsers.filter((u) => u.role === 'STAFF').length;
  const customerCount = allUsers.filter((u) => u.role === 'CUSTOMER').length;
  const ownerCount = allUsers.filter((u) => u.role === 'OWNER').length;

  const filteredUsers = allUsers.filter((u) => {
    const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
    const searchLower = userSearchQuery.trim().toLowerCase();
    const matchesSearch =
      !searchLower ||
      u.name.toLowerCase().includes(searchLower) ||
      u.email.toLowerCase().includes(searchLower) ||
      (u.title && u.title.toLowerCase().includes(searchLower)) ||
      (u.department && u.department.toLowerCase().includes(searchLower));
    return matchesRole && matchesSearch;
  });

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      setIsDeletingUser(true);
      const res = await removeUser(userToDelete.id);
      if (res.success) {
        setNotification({
          text: `Successfully removed ${userToDelete.name} (${userToDelete.role.toLowerCase()}) from the workspace.`,
          type: 'success',
        });
        setUserToDelete(null);
      } else {
        setNotification({
          text: res.error || 'Failed to remove user account.',
          type: 'error',
        });
      }
    } catch (err: any) {
      setNotification({
        text: err.message || 'An unexpected error occurred while removing user.',
        type: 'error',
      });
    } finally {
      setIsDeletingUser(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleCreateNewUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserData.name.trim() || !newUserData.email.trim()) {
      setNotification({ text: 'Please provide both name and email address.', type: 'error' });
      return;
    }
    if (!currentBusiness?.id) return;

    try {
      setIsCreatingUser(true);
      await addUser({
        name: newUserData.name.trim(),
        email: newUserData.email.trim().toLowerCase(),
        role: newUserData.role,
        businessId: currentBusiness.id,
        title: newUserData.title.trim() || (newUserData.role === 'STAFF' ? 'Operational Specialist' : newUserData.role === 'CUSTOMER' ? 'Client Member' : 'Co-Owner'),
        department: newUserData.department.trim() || (newUserData.role === 'STAFF' ? 'Service Operations' : 'Client Accounts'),
      });

      setNotification({
        text: `New ${newUserData.role.toLowerCase()} account "${newUserData.name}" created successfully.`,
        type: 'success',
      });
      setIsAddUserModalOpen(false);
      setNewUserData({ name: '', email: '', role: 'STAFF', title: '', department: 'Operations' });
    } catch (err: any) {
      setNotification({ text: err.message || 'Failed to create user account.', type: 'error' });
    } finally {
      setIsCreatingUser(false);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Metric Cards with Linear Glassmorphism */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border backdrop-blur-xl transition-all duration-200 bg-white/[0.03] border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] light:bg-white light:border-slate-300 light:shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between text-slate-400 light:text-slate-600 text-xs">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-widest">Active Workflows</span>
            <GitBranch className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="font-serif text-3xl text-slate-100 light:text-slate-900 mt-2 font-normal">{workflows.length}</div>
          <div className="text-[11px] text-slate-400 light:text-slate-600 mt-1.5 flex items-center gap-1 font-mono truncate">
            <span>{activeWorkflow?.name ? activeWorkflow.name.slice(0, 24) : 'Default System'}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border backdrop-blur-xl transition-all duration-200 bg-white/[0.03] border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] light:bg-white light:border-slate-300 light:shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between text-slate-400 light:text-slate-600 text-xs">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-widest">In-Flight Requests</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-serif text-3xl text-slate-100 light:text-slate-900 mt-2 font-normal">{inProgressReqs}</div>
          <div className="text-[11px] text-slate-400 light:text-slate-600 mt-1.5 flex items-center gap-1">
            <span>{pendingApprovals} awaiting sign-off</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border backdrop-blur-xl transition-all duration-200 bg-white/[0.03] border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] light:bg-white light:border-slate-300 light:shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between text-slate-400 light:text-slate-600 text-xs">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-widest">Executive Approvals</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-serif text-3xl text-slate-100 light:text-slate-900 mt-2 font-normal">{pendingApprovals}</div>
          <div className="text-[11px] text-slate-400 light:text-slate-600 mt-1.5">
            {pendingApprovals > 0 ? 'Action required in QA gate' : 'All deliverables approved'}
          </div>
        </div>

        <div className="p-5 rounded-2xl border backdrop-blur-xl transition-all duration-200 bg-white/[0.03] border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] light:bg-white light:border-slate-300 light:shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between text-slate-400 light:text-slate-600 text-xs">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-widest">Fulfillment Rate</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="font-serif text-3xl text-slate-100 light:text-slate-900 mt-2 font-normal">{fulfillmentRate}%</div>
          <div className="text-[11px] text-slate-400 light:text-slate-600 mt-1.5">
            <span>{completedReqs} of {totalReqs} fulfilled</span>
          </div>
        </div>
      </div>

      {/* Hero Banner: AI Workflow Engine Callout with Linear Glassmorphism */}
      <div className="p-6 rounded-2xl border backdrop-blur-xl transition-all duration-200 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent border-indigo-500/20 shadow-xl light:from-indigo-50 light:via-purple-50 light:to-white light:border-indigo-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-serif font-bold text-xs shadow-md shadow-indigo-500/20 border border-white/20">
              AI
            </div>
            <h3 className="text-lg font-serif italic font-semibold text-slate-100 light:text-slate-900">
              Adaptive Operations Synthesizer
            </h3>
            <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 light:bg-indigo-100 light:text-indigo-800 text-[9px] font-mono font-bold uppercase tracking-widest border border-indigo-500/30">
              Universal Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 light:text-slate-600 max-w-2xl leading-relaxed">
            Translate any natural-language operational charter into an active, multi-role state machine with dynamic ingestion schemas, SLA velocity metrics, and deliverable sign-offs.
          </p>
        </div>

        <button
          id="btn-open-ai-gen-banner"
          onClick={() => setIsAiGeneratorModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-indigo-500/20 transition flex items-center gap-2 shrink-0 border border-white/20"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>Architect Workflow</span>
        </button>
      </div>

      {/* TAB 1: WORKFLOW ENGINE / GRAPH */}
      {(currentTab === 'owner_dashboard' || currentTab === 'owner_workflows') && activeWorkflow && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-semibold font-mono text-slate-100 light:text-slate-900 uppercase tracking-widest">
                Executable Workflow Pipeline Architecture
              </h3>
            </div>
            <button
              onClick={() => {
                if (currentBusiness && activeWorkflow) {
                  pdfReports.generateWorkflowBlueprint(currentBusiness, activeWorkflow);
                }
              }}
              className="text-xs font-medium text-slate-400 hover:text-slate-100 light:text-slate-600 light:hover:text-slate-900 flex items-center gap-1.5 transition"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>Export Blueprint PDF</span>
            </button>
          </div>

          <WorkflowGraph workflow={activeWorkflow} requests={requests} />
        </div>
      )}

      {/* TAB 2: REQUEST MONITOR / KANBAN */}
      {(currentTab === 'owner_dashboard' || currentTab === 'owner_requests') && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4 text-indigo-400" />
              <h3 className="text-xs font-semibold font-mono text-slate-100 light:text-slate-900 uppercase tracking-widest">
                Request Lifecycle Matrix ({requests.length})
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-black/40 light:bg-slate-100 border border-white/[0.08] light:border-slate-300 p-1 rounded-xl flex items-center text-xs">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition ${
                    viewMode === 'kanban'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-100 light:text-slate-600 light:hover:text-slate-900'
                  }`}
                >
                  Kanban Matrix
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition ${
                    viewMode === 'table'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-100 light:text-slate-600 light:hover:text-slate-900'
                  }`}
                >
                  Data Register
                </button>
              </div>

              <button
                onClick={() => setIsReportsOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-slate-200 hover:text-white light:bg-white light:border-slate-300 light:text-slate-700 flex items-center gap-1.5 transition shadow-2xs"
              >
                <FileDown className="w-3.5 h-3.5 text-slate-400" />
                <span>Executive Reports</span>
              </button>
            </div>
          </div>

          {viewMode === 'kanban' ? (
            <RequestKanban requests={requests} onSelectRequest={setSelectedRequest} />
          ) : (
            <div className="rounded-2xl border backdrop-blur-xl overflow-hidden shadow-xl bg-white/[0.03] border-white/[0.08] light:bg-white light:border-slate-300">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-200 light:text-slate-800">
                  <thead className="bg-black/30 light:bg-slate-50 text-slate-400 light:text-slate-600 font-semibold border-b border-white/[0.06] light:border-slate-200 uppercase text-[10px] font-mono tracking-widest">
                    <tr>
                      <th className="p-3.5">ID</th>
                      <th className="p-3.5">Title</th>
                      <th className="p-3.5">Service</th>
                      <th className="p-3.5">Client</th>
                      <th className="p-3.5">Specialist</th>
                      <th className="p-3.5">Priority</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06] light:divide-slate-200">
                    {requests.map((r) => (
                      <tr
                        key={r.id}
                        onClick={() => setSelectedRequest(r)}
                        className="hover:bg-white/[0.04] light:hover:bg-slate-50 transition cursor-pointer"
                      >
                        <td className="p-3.5 font-mono text-indigo-400 light:text-indigo-600 font-medium">{r.id}</td>
                        <td className="p-3.5 font-medium text-slate-100 light:text-slate-900 max-w-xs truncate">{r.title}</td>
                        <td className="p-3.5 text-slate-400 light:text-slate-600">{r.serviceName}</td>
                        <td className="p-3.5 text-slate-200 light:text-slate-800">{r.customerName}</td>
                        <td className="p-3.5 text-slate-400 light:text-slate-600">
                          {r.assignedStaffName || <span className="text-slate-500 italic">Unassigned</span>}
                        </td>
                        <td className="p-3.5">
                          <PriorityBadge priority={r.priority} />
                        </td>
                        <td className="p-3.5">
                          <StatusBadge status={r.status} size="sm" />
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRequest(r);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-100 light:bg-slate-100 light:hover:bg-slate-200 light:text-slate-800 text-[11px] font-medium border border-white/[0.08] light:border-slate-300"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 light:bg-emerald-50 light:border-emerald-300 light:text-emerald-800'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300 light:bg-rose-50 light:border-rose-300 light:text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span className="font-medium">{notification.text}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-200 light:text-slate-600 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TAB 3: USERS & CUSTOMERS */}
      {currentTab === 'owner_users' && (
        <div className="space-y-5">
          {/* Header & Quick Action */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold font-mono text-slate-100 light:text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" />
                <span>Workspace Access & Team Directory</span>
              </h3>
              <p className="text-xs text-slate-400 light:text-slate-600 mt-0.5">
                Manage operational staff specialists, client contacts, and assignees with role-based access control.
              </p>
            </div>
            <button
              onClick={() => setIsAddUserModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/20 transition cursor-pointer self-start sm:self-auto"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Member / Client</span>
            </button>
          </div>

          {/* Directory Filter Chips & Search Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3.5 rounded-2xl border bg-white/[0.02] border-white/[0.08] light:bg-slate-50 light:border-slate-300">
            {/* Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
              <button
                onClick={() => setUserRoleFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  userRoleFilter === 'ALL'
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 light:bg-indigo-100 light:text-indigo-800'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] light:text-slate-600 light:hover:bg-slate-200'
                }`}
              >
                All Users ({allUsers.length})
              </button>
              <button
                onClick={() => setUserRoleFilter('STAFF')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  userRoleFilter === 'STAFF'
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 light:bg-emerald-100 light:text-emerald-800'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] light:text-slate-600 light:hover:bg-slate-200'
                }`}
              >
                Staff Specialists ({staffCount})
              </button>
              <button
                onClick={() => setUserRoleFilter('CUSTOMER')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  userRoleFilter === 'CUSTOMER'
                    ? 'bg-amber-600/20 text-amber-300 border border-amber-500/30 light:bg-amber-100 light:text-amber-800'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] light:text-slate-600 light:hover:bg-slate-200'
                }`}
              >
                Clients / Consumers ({customerCount})
              </button>
              <button
                onClick={() => setUserRoleFilter('OWNER')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  userRoleFilter === 'OWNER'
                    ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30 light:bg-purple-100 light:text-purple-800'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] light:text-slate-600 light:hover:bg-slate-200'
                }`}
              >
                Owners ({ownerCount})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                placeholder="Search by name, email, role..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border bg-black/20 border-white/[0.08] text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 light:bg-white light:border-slate-300 light:text-slate-900"
              />
              {userSearchQuery && (
                <button
                  onClick={() => setUserSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Directory Table */}
          <div className="rounded-2xl border backdrop-blur-xl overflow-hidden shadow-xl bg-white/[0.03] border-white/[0.08] light:bg-white light:border-slate-300">
            {filteredUsers.length === 0 ? (
              <div className="p-12 text-center space-y-2">
                <Users className="w-8 h-8 text-slate-500 mx-auto opacity-50" />
                <div className="text-sm font-medium text-slate-300 light:text-slate-700">No matching members found</div>
                <p className="text-xs text-slate-500">Try adjusting your search query or role filter.</p>
              </div>
            ) : (
              <table className="w-full text-left text-xs text-slate-200 light:text-slate-800">
                <thead className="bg-black/30 light:bg-slate-50 text-slate-400 light:text-slate-600 font-semibold border-b border-white/[0.06] light:border-slate-200 uppercase text-[10px] font-mono tracking-widest">
                  <tr>
                    <th className="p-3.5">User / Contact</th>
                    <th className="p-3.5">Role</th>
                    <th className="p-3.5">Email Address</th>
                    <th className="p-3.5">Title & Department</th>
                    <th className="p-3.5">Tenant / Joined</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] light:divide-slate-200">
                  {filteredUsers.map((u) => {
                    const isSelf = u.id === currentUser?.id;
                    const isOnlyWorkspaceOwner = u.role === 'OWNER' && ownerCount <= 1;

                    return (
                      <tr key={u.id} className="hover:bg-white/[0.04] light:hover:bg-slate-50 transition">
                        <td className="p-3.5 font-medium text-slate-100 light:text-slate-900 flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 light:bg-indigo-100 light:text-indigo-700 flex items-center justify-center font-serif text-xs font-bold shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold flex items-center gap-1.5">
                              <span>{u.name}</span>
                              {isSelf && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 light:text-slate-500">{u.title || 'Team Member'}</div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <RoleBadge role={u.role} />
                        </td>
                        <td className="p-3.5 text-slate-300 light:text-slate-700 font-mono text-[11px]">{u.email}</td>
                        <td className="p-3.5 text-slate-400 light:text-slate-600">
                          {u.department || 'Operations'}
                        </td>
                        <td className="p-3.5 text-slate-400 light:text-slate-500 text-[11px]">
                          <span className="font-mono text-[10px] text-slate-500 block truncate max-w-[120px]">{u.businessId}</span>
                          <span className="text-[10px] text-slate-400">
                            {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active'}
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          {isSelf ? (
                            <span className="text-[11px] text-slate-500 font-mono italic px-2 py-1">
                              Current Session
                            </span>
                          ) : isOnlyWorkspaceOwner ? (
                            <span className="text-[11px] text-slate-500 font-mono italic px-2 py-1" title="Primary workspace owner cannot be removed">
                              Primary Owner
                            </span>
                          ) : (
                            <button
                              onClick={() => setUserToDelete(u)}
                              title={`Remove ${u.name} (${u.role.toLowerCase()}) from workspace`}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border transition text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 light:bg-rose-50 light:hover:bg-rose-100 light:text-rose-700 light:border-rose-300 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Remove</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* TAB: SLA & ML BREACH PREDICTOR */}
      {currentTab === 'owner_sla' && currentBusiness && (
        <SlaAnalyticsDashboard
          business={currentBusiness}
          requests={requests}
          workflows={workflows}
          users={allUsers}
          isOwner={true}
          onSelectRequest={setSelectedRequest}
        />
      )}

      {/* TAB 4: REPORTS CENTER */}
      {currentTab === 'owner_reports' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl border backdrop-blur-xl bg-white/[0.03] border-white/[0.08] light:bg-white light:border-slate-300 shadow-xl space-y-4">
            <h3 className="text-base font-serif italic font-semibold text-slate-100 light:text-slate-900 flex items-center gap-2">
              <FileBarChart className="w-5 h-5 text-indigo-400" />
              <span>Executive Business Audit & PDF Reporting Center</span>
            </h3>
            <p className="text-xs text-slate-400 light:text-slate-600">
              Download auditable PDF reports including operations summary, workflow schemas, SLA velocity metrics, and request lifecycle registers.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <button
                onClick={() => {
                  if (currentBusiness) {
                    pdfReports.generateBusinessSummary(currentBusiness, workflows, requests, allUsers);
                  }
                }}
                className="p-5 rounded-2xl border backdrop-blur-md bg-white/[0.02] border-white/[0.08] hover:border-indigo-500/40 light:bg-slate-50 light:border-slate-300 light:hover:border-indigo-400 transition text-left space-y-2 group shadow-sm"
              >
                <FileDown className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition" />
                <div className="font-semibold text-sm text-slate-100 light:text-slate-900">Operations Summary PDF</div>
                <p className="text-xs text-slate-400 light:text-slate-600">Comprehensive KPI, tenant, and request registry.</p>
              </button>

              <button
                onClick={() => {
                  if (currentBusiness && activeWorkflow) {
                    pdfReports.generateWorkflowBlueprint(currentBusiness, activeWorkflow);
                  }
                }}
                className="p-5 rounded-2xl border backdrop-blur-md bg-white/[0.02] border-white/[0.08] hover:border-indigo-500/40 light:bg-slate-50 light:border-slate-300 light:hover:border-indigo-400 transition text-left space-y-2 group shadow-sm"
              >
                <GitBranch className="w-6 h-6 text-purple-400 group-hover:scale-110 transition" />
                <div className="font-semibold text-sm text-slate-100 light:text-slate-900">Workflow Blueprint PDF</div>
                <p className="text-xs text-slate-400 light:text-slate-600">Full technical step rules, SLAs, and ingestion schema.</p>
              </button>

              <button
                onClick={() => {
                  if (currentBusiness) {
                    pdfReports.generatePerformanceSla(currentBusiness, requests, allUsers);
                  }
                }}
                className="p-5 rounded-2xl border backdrop-blur-md bg-white/[0.02] border-white/[0.08] hover:border-indigo-500/40 light:bg-slate-50 light:border-slate-300 light:hover:border-indigo-400 transition text-left space-y-2 group shadow-sm"
              >
                <TrendingUp className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition" />
                <div className="font-semibold text-sm text-slate-100 light:text-slate-900">SLA Velocity Report PDF</div>
                <p className="text-xs text-slate-400 light:text-slate-600">Staff capacity distribution and turnaround targets.</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE USER CONFIRMATION */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-md w-full rounded-2xl border shadow-2xl overflow-hidden bg-[#0F1117] border-rose-500/30 light:bg-white light:border-slate-300 text-slate-100 light:text-slate-900">
            {/* Header */}
            <div className="p-5 border-b border-white/[0.08] light:border-slate-200 flex items-center justify-between bg-rose-500/10 light:bg-rose-50">
              <div className="flex items-center gap-2.5 text-rose-400 light:text-rose-700">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-semibold text-sm">Confirm Account Removal</h3>
              </div>
              <button
                onClick={() => setUserToDelete(null)}
                disabled={isDeletingUser}
                className="text-slate-400 hover:text-slate-200 light:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-300 light:text-slate-700">
                Are you sure you want to remove this {userToDelete.role === 'STAFF' ? 'staff specialist' : userToDelete.role === 'CUSTOMER' ? 'consumer / client' : 'member'} from the organization?
              </p>

              {/* User summary card */}
              <div className="p-3.5 rounded-xl border bg-black/40 border-white/[0.08] light:bg-slate-50 light:border-slate-200 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 light:bg-rose-100 light:text-rose-700 flex items-center justify-center font-serif text-sm font-bold shrink-0">
                  {userToDelete.name.charAt(0)}
                </div>
                <div className="space-y-0.5 overflow-hidden">
                  <div className="font-semibold text-sm text-slate-100 light:text-slate-900 truncate">
                    {userToDelete.name}
                  </div>
                  <div className="text-slate-400 font-mono text-[11px] truncate">{userToDelete.email}</div>
                  <div className="flex items-center gap-2 pt-1">
                    <RoleBadge role={userToDelete.role} />
                    <span className="text-[11px] text-slate-400">{userToDelete.title || userToDelete.department}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 light:bg-amber-50 light:border-amber-200 light:text-amber-800 text-[11px] space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <UserX className="w-3.5 h-3.5" />
                  <span>Access Revocation & Request Reassignment</span>
                </div>
                <p className="opacity-90">
                  This user will immediately lose access to the portal. Any open requests currently assigned to this specialist will be automatically unassigned and routed back to the operations triage queue.
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-white/[0.08] light:border-slate-200 flex items-center justify-end gap-2.5 bg-black/30 light:bg-slate-50">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                disabled={isDeletingUser}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] light:text-slate-700 light:bg-slate-200 light:hover:bg-slate-300 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                disabled={isDeletingUser}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/30 transition flex items-center gap-1.5"
              >
                {isDeletingUser ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Removing...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove User Account</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD USER */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="max-w-md w-full rounded-2xl border shadow-2xl overflow-hidden bg-[#0F1117] border-indigo-500/30 light:bg-white light:border-slate-300 text-slate-100 light:text-slate-900">
            {/* Header */}
            <div className="p-5 border-b border-white/[0.08] light:border-slate-200 flex items-center justify-between bg-indigo-500/10 light:bg-indigo-50">
              <div className="flex items-center gap-2 text-indigo-400 light:text-indigo-700">
                <UserPlus className="w-5 h-5" />
                <h3 className="font-semibold text-sm">Add New Member or Client</h3>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                disabled={isCreatingUser}
                className="text-slate-400 hover:text-slate-200 light:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateNewUser}>
              <div className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 light:text-slate-700 font-medium mb-1">
                    Role Category *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewUserData({ ...newUserData, role: 'STAFF', department: 'Service Operations' })}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                        newUserData.role === 'STAFF'
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 light:bg-emerald-50 light:border-emerald-300 light:text-emerald-800 font-semibold'
                          : 'bg-black/20 border-white/[0.08] text-slate-400 light:bg-slate-50 light:border-slate-200 light:text-slate-600'
                      }`}
                    >
                      <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <div className="font-medium">Staff Specialist</div>
                        <div className="text-[10px] opacity-75">Executes requests</div>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewUserData({ ...newUserData, role: 'CUSTOMER', department: 'Client Accounts' })}
                      className={`p-2.5 rounded-xl border text-left transition flex items-center gap-2 ${
                        newUserData.role === 'CUSTOMER'
                          ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 light:bg-amber-50 light:border-amber-300 light:text-amber-800 font-semibold'
                          : 'bg-black/20 border-white/[0.08] text-slate-400 light:bg-slate-50 light:border-slate-200 light:text-slate-600'
                      }`}
                    >
                      <Users className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <div className="font-medium">Client / Consumer</div>
                        <div className="text-[10px] opacity-75">Submits briefs</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 light:text-slate-700 font-medium mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newUserData.name}
                    onChange={(e) => setNewUserData({ ...newUserData, name: e.target.value })}
                    placeholder="e.g. Jordan Miller"
                    className="w-full px-3 py-2 rounded-xl border bg-black/20 border-white/[0.08] text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 light:bg-white light:border-slate-300 light:text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 light:text-slate-700 font-medium mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    placeholder="e.g. jordan@example.com"
                    className="w-full px-3 py-2 rounded-xl border bg-black/20 border-white/[0.08] text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 light:bg-white light:border-slate-300 light:text-slate-900"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 light:text-slate-700 font-medium mb-1">
                      Job Title / Position
                    </label>
                    <input
                      type="text"
                      value={newUserData.title}
                      onChange={(e) => setNewUserData({ ...newUserData, title: e.target.value })}
                      placeholder={newUserData.role === 'STAFF' ? 'e.g. Senior Associate' : 'e.g. Account VP'}
                      className="w-full px-3 py-2 rounded-xl border bg-black/20 border-white/[0.08] text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 light:bg-white light:border-slate-300 light:text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 light:text-slate-700 font-medium mb-1">
                      Department / Unit
                    </label>
                    <input
                      type="text"
                      value={newUserData.department}
                      onChange={(e) => setNewUserData({ ...newUserData, department: e.target.value })}
                      placeholder="e.g. Delivery Ops"
                      className="w-full px-3 py-2 rounded-xl border bg-black/20 border-white/[0.08] text-slate-100 placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 light:bg-white light:border-slate-300 light:text-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-white/[0.08] light:border-slate-200 flex items-center justify-end gap-2.5 bg-black/30 light:bg-slate-50">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  disabled={isCreatingUser}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.1] light:text-slate-700 light:bg-slate-200 light:hover:bg-slate-300 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingUser}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5"
                >
                  {isCreatingUser ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Add User</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Details */}
      {selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
};
