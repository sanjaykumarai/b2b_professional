import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWorkflow } from '../../context/WorkflowContext';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { SlaBadge } from '../sla/SlaBadge';
import { SlaAnalyticsDashboard } from '../sla/SlaAnalyticsDashboard';
import { RequestDetailsModal } from '../requests/RequestDetailsModal';
import {
  Inbox,
  ShieldCheck,
  Activity,
  BookOpen,
  Search,
  Sparkles,
  ShieldAlert,
} from 'lucide-react';

interface StaffViewProps {
  currentTab: string;
}

export const StaffView: React.FC<StaffViewProps> = ({ currentTab }) => {
  const { currentUser, currentBusiness, allUsers } = useAuth();
  const {
    requests,
    workflows,
    documents,
    updateRequestStatus,
    selectedRequest,
    setSelectedRequest,
    setIsRagOpen,
  } = useWorkflow();

  const [filterState, setFilterState] = useState<'ALL' | 'MINE' | 'REVIEW' | 'IN_PROGRESS'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = requests.filter((r) => {
    if (filterState === 'MINE') return r.assignedStaffId === currentUser?.id;
    if (filterState === 'REVIEW') return r.status === 'SUBMITTED' || r.status === 'IN_REVIEW';
    if (filterState === 'IN_PROGRESS') return r.status === 'IN_PROGRESS' || r.status === 'ASSIGNED';
    return true;
  }).filter((r) =>
    r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const inReviewCount = requests.filter((r) => r.status === 'SUBMITTED' || r.status === 'IN_REVIEW').length;
  const inProgressCount = requests.filter((r) => r.status === 'IN_PROGRESS' || r.status === 'ASSIGNED').length;
  const readyApprovalCount = requests.filter((r) => r.status === 'APPROVAL').length;

  return (
    <div className="space-y-6">
      {/* Staff KPI Header with Glassmorphism */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border backdrop-blur-xl transition-all duration-200 bg-white/[0.03] border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] light:bg-white light:border-slate-300 light:shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between text-slate-400 light:text-slate-600 text-xs">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-widest">Awaiting Triage</span>
            <Inbox className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-serif text-3xl text-slate-100 light:text-slate-900 mt-2 font-normal">{inReviewCount}</div>
          <div className="text-[11px] text-slate-400 light:text-slate-600 mt-1.5">Pending assignment or verification</div>
        </div>

        <div className="p-5 rounded-2xl border backdrop-blur-xl transition-all duration-200 bg-white/[0.03] border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] light:bg-white light:border-slate-300 light:shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between text-slate-400 light:text-slate-600 text-xs">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-widest">In-Flight Production</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="font-serif text-3xl text-slate-100 light:text-slate-900 mt-2 font-normal">{inProgressCount}</div>
          <div className="text-[11px] text-slate-400 light:text-slate-600 mt-1.5">Active drafting and auditing</div>
        </div>

        <div className="p-5 rounded-2xl border backdrop-blur-xl transition-all duration-200 bg-white/[0.03] border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] light:bg-white light:border-slate-300 light:shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between text-slate-400 light:text-slate-600 text-xs">
            <span className="text-[10px] font-mono font-semibold uppercase tracking-widest">Awaiting Sign-off</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-serif text-3xl text-slate-100 light:text-slate-900 mt-2 font-normal">{readyApprovalCount}</div>
          <div className="text-[11px] text-slate-400 light:text-slate-600 mt-1.5">Executive signoff pending</div>
        </div>
      </div>

      {/* TAB 1: TASK EXECUTION QUEUE */}
      {(currentTab === 'staff_dashboard' || currentTab === 'staff_requests') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/[0.03] border border-white/[0.08] light:bg-white light:border-slate-300 light:shadow-sm p-3 rounded-2xl backdrop-blur-xl shadow-md">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                onClick={() => setFilterState('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                  filterState === 'ALL'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-100'
                }`}
              >
                All Requests ({requests.length})
              </button>
              <button
                onClick={() => setFilterState('MINE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                  filterState === 'MINE'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-100'
                }`}
              >
                Assigned to Me
              </button>
              <button
                onClick={() => setFilterState('REVIEW')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                  filterState === 'REVIEW'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-100'
                }`}
              >
                Needs Review ({inReviewCount})
              </button>
              <button
                onClick={() => setFilterState('IN_PROGRESS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition ${
                  filterState === 'IN_PROGRESS'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-100'
                }`}
              >
                In Progress ({inProgressCount})
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search active tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/40 light:bg-slate-50 border border-white/[0.08] light:border-slate-300 text-slate-100 light:text-slate-900 text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>
          </div>

          {/* Task Queue Cards */}
          <div className="space-y-3">
            {filtered.map((req) => (
              <div
                key={req.id}
                onClick={() => setSelectedRequest(req)}
                className="p-5 rounded-2xl border backdrop-blur-xl transition-all duration-200 bg-white/[0.03] border-white/[0.08] hover:border-indigo-500/40 shadow-sm hover:shadow-indigo-500/5 light:bg-white light:border-slate-300 light:hover:border-indigo-400 light:shadow-[0_1px_3px_rgba(0,0,0,0.05)] cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-indigo-400 light:text-indigo-600 font-semibold">{req.id}</span>
                    <StatusBadge status={req.status} size="sm" />
                    <PriorityBadge priority={req.priority} />
                    <SlaBadge status={req.slaInfo?.status} size="sm" />
                    <span className="text-[11px] text-slate-400 light:text-slate-600 font-medium uppercase tracking-wider">{req.serviceName}</span>
                  </div>

                  <h4 className="text-sm font-medium text-slate-100 light:text-slate-900 group-hover:text-indigo-300 light:group-hover:text-indigo-600 transition">
                    {req.title}
                  </h4>

                  <div className="text-xs text-slate-400 light:text-slate-600 flex items-center gap-3">
                    <span>Client: <span className="text-slate-200 light:text-slate-800 font-medium">{req.customerName}</span></span>
                    <span>•</span>
                    <span>Target Due: <span className="text-slate-300 light:text-slate-700 font-mono">{req.dueDate || 'Standard SLA'}</span></span>
                    <span>•</span>
                    <span>Assigned: <span className="text-slate-300 light:text-slate-700">{req.assignedStaffName || 'Unassigned'}</span></span>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  {req.status === 'SUBMITTED' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateRequestStatus(req.id, 'IN_REVIEW', 'Staff accepted request for triage');
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-md"
                    >
                      Accept Task
                    </button>
                  )}

                  {(req.status === 'IN_REVIEW' || req.status === 'ASSIGNED') && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateRequestStatus(req.id, 'IN_PROGRESS', 'Specialist initiated drafting');
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-md"
                    >
                      Start Work
                    </button>
                  )}

                  {req.status === 'IN_PROGRESS' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateRequestStatus(req.id, 'APPROVAL', 'Deliverable finalized, submitted for owner sign-off');
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold uppercase tracking-wider transition shadow-md"
                    >
                      Submit for Sign-off
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRequest(req);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white light:bg-slate-100 light:hover:bg-slate-200 light:text-slate-800 text-xs font-medium border border-white/[0.08] light:border-slate-300 transition"
                  >
                    Details →
                  </button>
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-12 bg-white/[0.02] border border-white/[0.08] light:bg-white light:border-slate-300 rounded-2xl p-6 text-xs text-slate-400 light:text-slate-600 shadow-2xs">
                No matching requests found in this view.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: SLA QUEUE & ANALYTICS */}
      {currentTab === 'staff_sla' && currentBusiness && (
        <SlaAnalyticsDashboard
          business={currentBusiness}
          requests={requests}
          workflows={workflows}
          users={allUsers}
          isOwner={false}
          onSelectRequest={setSelectedRequest}
        />
      )}

      {/* TAB 2: KNOWLEDGE BASE */}
      {currentTab === 'staff_knowledge' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold font-mono text-slate-100 light:text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Workspace Knowledge & Policy Directives ({documents.length})</span>
            </h3>

            <button
              onClick={() => setIsRagOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Ask Gemini Chatbot</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-5 rounded-2xl border backdrop-blur-xl bg-white/[0.03] border-white/[0.08] light:bg-white light:border-slate-200 space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-serif italic text-slate-100 light:text-slate-900 font-semibold">{doc.title}</h4>
                  <span className="px-2 py-0.5 rounded-md text-[9px] uppercase tracking-widest bg-black/40 text-slate-300 font-mono border border-white/[0.08] light:bg-slate-100 light:text-slate-700 light:border-slate-200">
                    {doc.category}
                  </span>
                </div>
                <p className="text-xs text-slate-400 light:text-slate-600 leading-relaxed">{doc.content}</p>
                <div className="text-[10px] text-slate-500 pt-2 border-t border-white/[0.06] light:border-slate-200 uppercase tracking-widest font-mono">
                  Grounding asset for Gemini Chat queries
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Request Details Modal */}
      {selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  );
};
