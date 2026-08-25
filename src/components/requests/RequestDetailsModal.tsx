import React, { useState } from 'react';
import { CustomerRequest } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useWorkflow } from '../../context/WorkflowContext';
import { StatusBadge, PriorityBadge, RoleBadge } from '../common/Badge';
import { pdfReports } from '../../services/pdfGenerator';
import {
  X,
  ShieldCheck,
  FileText,
  UploadCloud,
  CheckCircle2,
  FileDown,
  Layers,
  Activity,
  Check,
} from 'lucide-react';

interface RequestDetailsModalProps {
  request: CustomerRequest;
  onClose: () => void;
}

export const RequestDetailsModal: React.FC<RequestDetailsModalProps> = ({ request, onClose }) => {
  const { currentRole, allUsers, currentBusiness } = useAuth();
  const {
    activities,
    updateRequestStatus,
    assignStaffToRequest,
    uploadDeliverableFile,
  } = useWorkflow();

  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'deliverables'>('overview');
  const [statusNotes, setStatusNotes] = useState('');
  const [selectedStaffId, setSelectedStaffId] = useState(request.assignedStaffId || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [isDeliverable] = useState(true);

  const requestActivities = activities.filter((a) => a.requestId === request.id);
  const staffMembers = allUsers.filter(
    (u) => u.businessId === currentBusiness?.id && (u.role === 'STAFF' || u.role === 'OWNER')
  );

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await updateRequestStatus(
        request.id,
        newStatus,
        statusNotes || `Transitioned status to ${newStatus}`,
        statusNotes
      );
      setStatusNotes('');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssign = async () => {
    if (!selectedStaffId) return;
    const staff = staffMembers.find((s) => s.id === selectedStaffId);
    if (!staff) return;
    setIsUpdating(true);
    try {
      await assignStaffToRequest(request.id, staff.id, staff.name);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileName.trim()) return;
    setIsUpdating(true);
    try {
      await uploadDeliverableFile(request.id, uploadFileName, '4.2 MB', isDeliverable);
      setUploadFileName('');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownloadDossier = () => {
    if (!currentBusiness) return;
    pdfReports.generateRequestDossier(currentBusiness, request, requestActivities);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl rounded-3xl backdrop-blur-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-colors duration-200 bg-[#0A0C10]/95 border-white/[0.12] text-slate-100 light:bg-white/95 light:border-slate-200 light:text-slate-900">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] light:border-slate-200 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-indigo-400 light:text-indigo-600 font-bold tracking-wider">
                {request.id}
              </span>
              <StatusBadge status={request.status} />
              <PriorityBadge priority={request.priority} />
            </div>
            <h3 className="text-lg font-serif italic font-semibold text-slate-100 light:text-slate-900 mt-1">{request.title}</h3>
            <div className="text-xs text-slate-400 light:text-slate-600 mt-0.5">
              Service: <span className="text-slate-200 light:text-slate-800 font-medium">{request.serviceName}</span> • Client:{' '}
              <span className="text-slate-200 light:text-slate-800 font-medium">{request.customerName}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-export-request-dossier"
              onClick={handleDownloadDossier}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-slate-200 hover:text-white light:bg-slate-100 light:text-slate-800 light:hover:bg-slate-200 border border-white/[0.08] light:border-slate-200 transition"
            >
              <FileDown className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export PDF Dossier</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white light:hover:text-slate-900 hover:bg-white/[0.06] light:hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2.5 border-b border-white/[0.06] light:border-slate-200 bg-black/20 light:bg-slate-50 flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 text-xs font-semibold uppercase font-mono tracking-wider ${
              activeTab === 'overview'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] light:text-slate-600 light:hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Specifications</span>
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 text-xs font-semibold uppercase font-mono tracking-wider ${
              activeTab === 'timeline'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] light:text-slate-600 light:hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Audit Timeline ({requestActivities.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('deliverables')}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 text-xs font-semibold uppercase font-mono tracking-wider ${
              activeTab === 'deliverables'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.06] light:text-slate-600 light:hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Deliverables ({request.documents?.length || 0})</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* Quick Action Control Bar for Staff and Owner */}
          <div className="p-4 rounded-2xl border backdrop-blur-md bg-white/[0.03] border-white/[0.08] light:bg-slate-50 light:border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-bold text-slate-200 light:text-slate-800 font-mono uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Lifecycle Operations ({currentRole} View)</span>
              </div>
              <div className="text-[11px] text-slate-400 light:text-slate-600">
                Assigned: <span className="text-slate-200 light:text-slate-800 font-medium">{request.assignedStaffName || 'Unassigned'}</span>
              </div>
            </div>

            {/* Role Specific Actions */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {/* STAFF ACTIONS */}
              {currentRole === 'STAFF' && (
                <>
                  {request.status === 'SUBMITTED' && (
                    <button
                      onClick={() => handleStatusChange('IN_REVIEW')}
                      disabled={isUpdating}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 shadow-md"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept & Start Review</span>
                    </button>
                  )}

                  {(request.status === 'IN_REVIEW' || request.status === 'ASSIGNED') && (
                    <button
                      onClick={() => handleStatusChange('IN_PROGRESS')}
                      disabled={isUpdating}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 shadow-md"
                    >
                      <Activity className="w-3.5 h-3.5" />
                      <span>Start Production</span>
                    </button>
                  )}

                  {request.status === 'IN_PROGRESS' && (
                    <button
                      onClick={() => handleStatusChange('APPROVAL')}
                      disabled={isUpdating}
                      className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 shadow-md"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Submit for Owner QA</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleStatusChange('WAITING_FOR_CUSTOMER')}
                    disabled={isUpdating}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 light:bg-slate-200 light:text-slate-800 text-xs font-medium border border-white/[0.08] light:border-slate-300 transition"
                  >
                    Request Client Info
                  </button>
                </>
              )}

              {/* OWNER ACTIONS */}
              {currentRole === 'OWNER' && (
                <>
                  {request.status === 'APPROVAL' && (
                    <button
                      onClick={() => handleStatusChange('COMPLETED')}
                      disabled={isUpdating}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 shadow-md border border-white/20"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Authorize & Release Deliverables</span>
                    </button>
                  )}

                  {request.status !== 'COMPLETED' && (
                    <button
                      onClick={() => handleStatusChange('COMPLETED')}
                      disabled={isUpdating}
                      className="px-3 py-1.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-white light:bg-slate-200 light:text-slate-900 text-xs font-semibold border border-white/[0.08] light:border-slate-300 transition"
                    >
                      Mark Complete
                    </button>
                  )}

                  <button
                    onClick={() => handleStatusChange('IN_PROGRESS')}
                    disabled={isUpdating}
                    className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-300 hover:text-white light:bg-slate-100 light:text-slate-700 text-xs font-medium border border-white/[0.08] light:border-slate-200 transition"
                  >
                    Request Revisions
                  </button>
                </>
              )}

              {/* CUSTOMER ACTIONS */}
              {currentRole === 'CUSTOMER' && (
                <div className="text-xs text-slate-400 light:text-slate-600">
                  {request.status === 'COMPLETED'
                    ? 'Your request is fulfilled and signed off. Official assets are available below.'
                    : 'Staff is currently processing your request in accordance with SLA benchmarks.'}
                </div>
              )}
            </div>

            {/* Staff Assignment Bar (Owner & Staff) */}
            {(currentRole === 'OWNER' || currentRole === 'STAFF') && (
              <div className="pt-2 border-t border-white/[0.06] light:border-slate-200 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400 light:text-slate-600">Assign Staff:</span>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(e.target.value)}
                  className="px-3 py-1 rounded-xl bg-black/40 light:bg-white border border-white/[0.08] light:border-slate-200 text-slate-100 light:text-slate-900 text-xs"
                >
                  <option value="">-- Choose Specialist --</option>
                  {staffMembers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.title || s.role})
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAssign}
                  disabled={!selectedStaffId || isUpdating}
                  className="px-3 py-1 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-bold uppercase tracking-wider disabled:opacity-40 transition shadow-sm"
                >
                  Update Assignee
                </button>
              </div>
            )}
          </div>

          {/* TAB 1: OVERVIEW & SPECS */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl border backdrop-blur-md bg-white/[0.03] border-white/[0.08] light:bg-slate-50 light:border-slate-200">
                  <div className="text-slate-400 light:text-slate-500 text-[10px] font-mono uppercase tracking-widest">Submitted By</div>
                  <div className="font-medium text-slate-100 light:text-slate-900 mt-1">{request.customerName}</div>
                  <div className="text-[11px] text-slate-400 light:text-slate-600 truncate font-mono">{request.customerEmail}</div>
                </div>

                <div className="p-3.5 rounded-2xl border backdrop-blur-md bg-white/[0.03] border-white/[0.08] light:bg-slate-50 light:border-slate-200">
                  <div className="text-slate-400 light:text-slate-500 text-[10px] font-mono uppercase tracking-widest">Target Launch Date</div>
                  <div className="font-medium text-slate-100 light:text-slate-900 mt-1">{request.dueDate || 'Standard SLA (3-5d)'}</div>
                  <div className="text-[11px] text-slate-400 light:text-slate-600 font-mono">Created: {new Date(request.createdAt).toLocaleDateString()}</div>
                </div>

                <div className="p-3.5 rounded-2xl border backdrop-blur-md bg-white/[0.03] border-white/[0.08] light:bg-slate-50 light:border-slate-200">
                  <div className="text-slate-400 light:text-slate-500 text-[10px] font-mono uppercase tracking-widest">Approval State</div>
                  <div className="font-medium text-slate-100 light:text-slate-900 mt-1">{request.approvalStatus || 'PENDING'}</div>
                  <div className="text-[11px] text-slate-400 light:text-slate-600">Owner Signoff Required: Yes</div>
                </div>
              </div>

              {/* Ingestion Fields Values */}
              <div>
                <h4 className="text-[10px] font-mono font-bold text-slate-400 light:text-slate-600 uppercase tracking-widest mb-2">
                  Client Ingestion Specifications
                </h4>
                <div className="p-4 rounded-2xl border backdrop-blur-md bg-white/[0.03] border-white/[0.08] light:bg-white light:border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {Object.entries(request.customData || {}).map(([key, val]) => (
                    <div key={key} className="p-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08] light:bg-slate-50 light:border-slate-200">
                      <div className="text-[9px] font-bold font-mono text-slate-400 light:text-slate-500 uppercase tracking-widest">
                        {key.replace(/_/g, ' ')}
                      </div>
                      <div className="font-medium text-slate-100 light:text-slate-900 mt-1 whitespace-pre-wrap">
                        {String(val)}
                      </div>
                    </div>
                  ))}

                  {Object.keys(request.customData || {}).length === 0 && (
                    <div className="text-slate-400 light:text-slate-600 text-xs col-span-2">
                      {request.description || 'No additional custom fields.'}
                    </div>
                  )}
                </div>
              </div>

              {/* Deliverable Summary if present */}
              {request.deliverableSummary && (
                <div className="p-4 rounded-2xl border backdrop-blur-md bg-indigo-500/10 border-indigo-500/30 light:bg-indigo-50 light:border-indigo-200 text-xs">
                  <div className="font-bold text-slate-100 light:text-slate-900 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Deliverable Status Note</span>
                  </div>
                  <p className="text-slate-300 light:text-slate-700 mt-1.5 leading-relaxed">{request.deliverableSummary}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: AUDIT TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-3">
              <h4 className="text-[10px] font-mono font-bold text-slate-400 light:text-slate-600 uppercase tracking-widest">
                Full Execution Audit Trail
              </h4>
              <div className="space-y-2.5">
                {requestActivities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3.5 rounded-2xl border backdrop-blur-md bg-white/[0.03] border-white/[0.08] light:bg-white light:border-slate-200 text-xs flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-100 light:text-slate-900">{act.actorName}</span>
                        <RoleBadge role={act.actorRole} />
                        <span className="px-1.5 py-0.5 rounded-md bg-black/40 text-[10px] text-slate-300 light:bg-slate-100 light:text-slate-700 font-mono border border-white/[0.08] light:border-slate-200">
                          {act.action}
                        </span>
                      </div>
                      <p className="text-slate-300 light:text-slate-700 text-[11px] leading-relaxed">{act.notes}</p>
                      {act.documentName && (
                        <div className="text-[10px] text-indigo-400 light:text-indigo-600 flex items-center gap-1 font-medium font-mono">
                          <FileText className="w-3 h-3" />
                          <span>Asset: {act.documentName}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-[10px] text-slate-400 light:text-slate-500 font-mono whitespace-nowrap">
                      {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: DELIVERABLES & DOCUMENTS */}
          {activeTab === 'deliverables' && (
            <div className="space-y-4">
              {/* Upload Deliverable (Staff / Owner) */}
              {(currentRole === 'STAFF' || currentRole === 'OWNER') && (
                <form onSubmit={handleUpload} className="p-4 rounded-2xl border backdrop-blur-md bg-white/[0.03] border-white/[0.08] light:bg-slate-50 light:border-slate-200 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-100 light:text-slate-900 flex items-center gap-1.5 uppercase font-mono tracking-wider">
                    <UploadCloud className="w-4 h-4 text-indigo-400" />
                    <span>Upload Deliverable Artifact</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={uploadFileName}
                      onChange={(e) => setUploadFileName(e.target.value)}
                      placeholder="e.g. Final_Deliverable_Package_v2.pdf"
                      className="sm:col-span-2 px-3.5 py-2 rounded-xl bg-white/[0.04] light:bg-white border border-white/[0.08] light:border-slate-200 text-slate-100 light:text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={!uploadFileName || isUpdating}
                      className="px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-bold uppercase tracking-wider transition disabled:opacity-40 shadow-md"
                    >
                      Upload Asset
                    </button>
                  </div>
                </form>
              )}

              {/* Documents List */}
              <div className="space-y-2">
                {request.documents?.map((doc) => (
                  <div
                    key={doc.id}
                    className="p-3.5 rounded-2xl border backdrop-blur-md bg-white/[0.03] border-white/[0.08] light:bg-white light:border-slate-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 light:bg-indigo-50 light:text-indigo-700 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-100 light:text-slate-900 flex items-center gap-2">
                          <span>{doc.name}</span>
                          {doc.isDeliverable && (
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] bg-emerald-500/20 text-emerald-300 light:bg-emerald-100 light:text-emerald-800 font-mono font-bold uppercase tracking-wider border border-emerald-500/30">
                              DELIVERABLE
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 light:text-slate-500 font-mono">
                          Uploaded by {doc.uploadedBy} • {doc.size} • {new Date(doc.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleDownloadDossier}
                      className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white light:bg-slate-100 light:text-slate-800 light:hover:bg-slate-200 text-[11px] font-semibold border border-white/[0.08] light:border-slate-200 transition"
                    >
                      Download
                    </button>
                  </div>
                ))}

                {(!request.documents || request.documents.length === 0) && (
                  <div className="text-center py-8 text-xs text-slate-400 light:text-slate-500">
                    No files or deliverables uploaded for this request yet.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-white/[0.08] light:border-slate-200 bg-black/20 light:bg-slate-50 flex items-center justify-between text-xs">
          <div className="text-slate-400 light:text-slate-600">
            Tenant: <span className="text-slate-200 light:text-slate-800 font-medium">{currentBusiness?.name}</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white light:bg-slate-200 light:text-slate-800 font-semibold border border-white/[0.08] light:border-slate-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
