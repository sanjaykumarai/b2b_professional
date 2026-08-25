import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWorkflow } from '../../context/WorkflowContext';
import { WorkflowGraph } from '../workflow/WorkflowGraph';
import { RequestKanban } from '../requests/RequestKanban';
import { RequestDetailsModal } from '../requests/RequestDetailsModal';
import { StatusBadge, PriorityBadge, RoleBadge } from '../common/Badge';
import { pdfReports } from '../../services/pdfGenerator';
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
} from 'lucide-react';

interface OwnerViewProps {
  currentTab: string;
}

export const OwnerView: React.FC<OwnerViewProps> = ({ currentTab }) => {
  const { currentBusiness, allUsers } = useAuth();
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

  const totalReqs = requests.length;
  const completedReqs = requests.filter((r) => r.status === 'COMPLETED').length;
  const pendingApprovals = requests.filter((r) => r.status === 'APPROVAL').length;
  const inProgressReqs = requests.filter(
    (r) => r.status === 'IN_PROGRESS' || r.status === 'ASSIGNED' || r.status === 'IN_REVIEW'
  ).length;

  const fulfillmentRate = totalReqs > 0 ? Math.round((completedReqs / totalReqs) * 100) : 100;

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

      {/* TAB 3: USERS & CUSTOMERS */}
      {currentTab === 'owner_users' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold font-mono text-slate-100 light:text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <span>Workspace Directory ({allUsers.length} Users)</span>
            </h3>
          </div>

          <div className="rounded-2xl border backdrop-blur-xl overflow-hidden shadow-xl bg-white/[0.03] border-white/[0.08] light:bg-white light:border-slate-300">
            <table className="w-full text-left text-xs text-slate-200 light:text-slate-800">
              <thead className="bg-black/30 light:bg-slate-50 text-slate-400 light:text-slate-600 font-semibold border-b border-white/[0.06] light:border-slate-200 uppercase text-[10px] font-mono tracking-widest">
                <tr>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Workspace Tenant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06] light:divide-slate-200">
                {allUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.04] light:hover:bg-slate-50 transition">
                    <td className="p-3.5 font-medium text-slate-100 light:text-slate-900 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 light:bg-indigo-100 light:text-indigo-700 flex items-center justify-center font-serif text-[11px] font-bold">
                        {u.name.charAt(0)}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="p-3.5">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="p-3.5 text-slate-400 light:text-slate-600 font-mono text-[11px]">{u.email}</td>
                    <td className="p-3.5 text-slate-400 light:text-slate-600">{u.title || u.department || 'Operations'}</td>
                    <td className="p-3.5 text-slate-500 font-mono text-[11px]">{u.businessId}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
