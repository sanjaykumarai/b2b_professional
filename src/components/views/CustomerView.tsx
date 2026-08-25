import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWorkflow } from '../../context/WorkflowContext';
import { ServiceOffering } from '../../types';
import { DynamicRequestForm } from '../requests/DynamicRequestForm';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { RequestDetailsModal } from '../requests/RequestDetailsModal';
import {
  Layers,
  PlusCircle,
  Clock,
  Sparkles,
  ArrowRight,
  FileText,
} from 'lucide-react';

interface CustomerViewProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({ currentTab, onSelectTab }) => {
  const { currentBusiness, currentUser } = useAuth();
  const {
    activeWorkflow,
    requests,
    selectedRequest,
    setSelectedRequest,
    setIsRagOpen,
  } = useWorkflow();

  const [selectedService, setSelectedService] = useState<ServiceOffering | null>(
    activeWorkflow?.services[0] || null
  );

  const myRequests = requests.filter(
    (r) => r.customerId === currentUser?.id || r.customerName === currentUser?.name
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Linear Glassmorphism */}
      <div className="p-6 rounded-2xl border backdrop-blur-xl transition-all duration-200 bg-gradient-to-r from-indigo-500/10 via-purple-500/5 to-transparent border-indigo-500/20 shadow-xl light:from-indigo-50 light:via-purple-50 light:to-white light:border-indigo-300 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400 light:text-indigo-600">
            Client Portal Matrix
          </span>
          <h2 className="text-xl font-serif italic font-semibold text-slate-100 light:text-slate-900">
            Welcome to {currentBusiness?.name}
          </h2>
          <p className="text-xs text-slate-400 light:text-slate-600 max-w-2xl leading-relaxed">
            Submit service orders, track progress across verified operational workflow stages, and download final deliverables.
          </p>
        </div>

        <button
          onClick={() => {
            if (activeWorkflow && activeWorkflow.services.length > 0) {
              setSelectedService(activeWorkflow.services[0]);
              onSelectTab('customer_new_request');
            }
          }}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-bold uppercase tracking-widest shadow-lg shadow-indigo-500/20 transition flex items-center gap-2 shrink-0 border border-white/20"
        >
          <PlusCircle className="w-4 h-4 text-white" />
          <span>New Order</span>
        </button>
      </div>

      {/* TAB 1: SERVICE CATALOG / NEW REQUEST */}
      {(currentTab === 'customer_dashboard' || currentTab === 'customer_new_request' || currentTab === 'customer_services') && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold font-mono text-slate-100 light:text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Service Catalog ({activeWorkflow?.services.length || 0})</span>
              </h3>
              <span className="text-xs text-slate-400 light:text-slate-600">Select a service to configure parameters</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeWorkflow?.services.map((srv) => {
                const isSelected = selectedService?.id === srv.id;

                return (
                  <div
                    key={srv.id}
                    onClick={() => {
                      setSelectedService(srv);
                      onSelectTab('customer_new_request');
                    }}
                    className={`p-5 rounded-2xl border backdrop-blur-xl transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)] light:bg-indigo-50 light:border-indigo-400'
                        : 'bg-white/[0.03] border-white/[0.08] hover:border-indigo-500/40 hover:bg-white/[0.06] light:bg-white light:border-slate-300 light:hover:border-indigo-400 light:shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-[9px] font-mono font-bold text-slate-400 light:text-slate-500 uppercase tracking-widest">
                          {srv.category || 'Service'}
                        </span>
                        {srv.priceEstimate && (
                          <span className="text-xs font-mono font-bold text-indigo-300 light:text-indigo-700">
                            {srv.priceEstimate}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-medium text-slate-100 light:text-slate-900">{srv.name}</h4>
                      <p className="text-xs text-slate-400 light:text-slate-600 mt-1 leading-snug">{srv.description}</p>
                    </div>

                    <div className="pt-3 border-t border-white/[0.06] light:border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-400 light:text-slate-500 flex items-center gap-1.5 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" />
                        <span>SLA: {srv.estimatedTurnaround}</span>
                      </span>

                      <span className="text-indigo-300 light:text-indigo-700 font-medium text-xs flex items-center gap-1">
                        <span>Select</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dynamic Ingestion Form */}
          {activeWorkflow && selectedService && (currentTab === 'customer_new_request' || currentTab === 'customer_dashboard') && (
            <div className="pt-2">
              <DynamicRequestForm
                workflow={activeWorkflow}
                selectedService={selectedService}
                onSuccess={() => onSelectTab('customer_requests')}
              />
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MY REQUESTS & STATUS */}
      {(currentTab === 'customer_dashboard' || currentTab === 'customer_requests') && (
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold font-mono text-slate-100 light:text-slate-900 uppercase tracking-widest flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-400" />
              <span>Fulfillment Activity ({myRequests.length})</span>
            </h3>

            <button
              onClick={() => setIsRagOpen(true)}
              className="text-xs font-medium text-slate-400 hover:text-slate-100 light:text-slate-600 light:hover:text-slate-900 flex items-center gap-1.5 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Query Assistant</span>
            </button>
          </div>

          <div className="space-y-3">
            {myRequests.map((req) => (
              <div
                key={req.id}
                onClick={() => setSelectedRequest(req)}
                className="p-5 rounded-2xl border backdrop-blur-xl transition-all duration-200 bg-white/[0.03] border-white/[0.08] hover:border-indigo-500/40 shadow-sm hover:shadow-indigo-500/5 light:bg-white light:border-slate-300 light:hover:border-indigo-400 light:shadow-[0_1px_3px_rgba(0,0,0,0.06)] cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-indigo-400 light:text-indigo-600 font-semibold">{req.id}</span>
                    <StatusBadge status={req.status} size="sm" />
                    <PriorityBadge priority={req.priority} />
                    <span className="text-[11px] text-slate-400 light:text-slate-600 uppercase tracking-wider font-mono">{req.serviceName}</span>
                  </div>

                  <h4 className="text-sm font-medium text-slate-100 light:text-slate-900 group-hover:text-indigo-300 light:group-hover:text-indigo-600 transition">
                    {req.title}
                  </h4>

                  <div className="text-xs text-slate-400 light:text-slate-600 flex items-center gap-3">
                    <span>Due: <span className="text-slate-200 light:text-slate-800 font-medium font-mono">{req.dueDate || 'Standard SLA'}</span></span>
                    <span>•</span>
                    <span>Submitted: {new Date(req.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {req.documents && req.documents.length > 0 && (
                    <span className="px-2.5 py-1 rounded-lg bg-black/40 text-xs text-slate-300 border border-white/[0.08] light:bg-slate-100 light:text-slate-700 light:border-slate-300 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{req.documents.length} Files</span>
                    </span>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedRequest(req);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white light:bg-slate-100 light:hover:bg-slate-200 light:text-slate-800 text-xs font-medium border border-white/[0.08] light:border-slate-300 transition flex items-center gap-1"
                  >
                    <span>View Status</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}

            {myRequests.length === 0 && (
              <div className="text-center py-12 bg-white/[0.02] border border-white/[0.08] light:bg-white light:border-slate-300 rounded-2xl p-6 text-xs text-slate-400 light:text-slate-600 space-y-3 shadow-2xs">
                <p>You have not submitted any service requests yet.</p>
                <button
                  onClick={() => onSelectTab('customer_new_request')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-bold uppercase tracking-wider shadow-md"
                >
                  Create First Request
                </button>
              </div>
            )}
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
