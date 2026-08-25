import React, { useState } from 'react';
import { Workflow, WorkflowStep, CustomerRequest } from '../../types';
import { StatusBadge, RoleBadge } from '../common/Badge';
import {
  ArrowRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  FileUp,
  UserCheck,
  HelpCircle,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface WorkflowGraphProps {
  workflow: Workflow;
  requests?: CustomerRequest[];
  onSelectStep?: (step: WorkflowStep) => void;
}

export const WorkflowGraph: React.FC<WorkflowGraphProps> = ({
  workflow,
  requests = [],
  onSelectStep,
}) => {
  const [selectedStepId, setSelectedStepId] = useState<string | null>(
    workflow.steps[0]?.id || null
  );

  const selectedStep = workflow.steps.find((s) => s.id === selectedStepId) || workflow.steps[0];

  const getStepRequestCount = (step: WorkflowStep) => {
    return requests.filter(
      (r) =>
        r.status === step.statusResult ||
        (step.order === 1 && r.status === 'SUBMITTED') ||
        (step.order === 6 && r.status === 'COMPLETED')
    ).length;
  };

  return (
    <div className="bg-white/[0.03] border border-white/[0.08] light:bg-white light:border-slate-300 light:shadow-sm rounded-2xl p-5 backdrop-blur-xl space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] light:border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-base font-serif italic font-semibold text-slate-100 light:text-slate-900">{workflow.name}</h3>
            <span
              className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest rounded-md ${
                workflow.isActive
                  ? 'bg-indigo-500/20 text-indigo-300 light:bg-indigo-50 light:text-indigo-700 border border-indigo-500/30 light:border-indigo-200'
                  : 'bg-white/[0.05] text-slate-400 light:bg-slate-100 light:text-slate-600 border border-white/[0.08] light:border-slate-300'
              }`}
            >
              {workflow.isActive ? 'ACTIVE PIPELINE' : 'INACTIVE'}
            </span>
          </div>
          <p className="text-xs text-slate-400 light:text-slate-600 mt-1 max-w-2xl">{workflow.description}</p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 light:text-slate-500 font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
            <span>{workflow.steps.length} Steps</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
            <span>{workflow.services.length} Services</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{workflow.requiredFields.length} Ingestion Fields</span>
          </span>
        </div>
      </div>

      {/* Horizontal Interactive Pipeline Stepper */}
      <div className="relative">
        <div className="flex items-stretch gap-3 overflow-x-auto pb-3 pt-1">
          {workflow.steps.map((step, idx) => {
            const isSelected = selectedStep?.id === step.id;
            const activeCount = getStepRequestCount(step);
            const isLast = idx === workflow.steps.length - 1;

            return (
              <React.Fragment key={step.id}>
                <div
                  onClick={() => {
                    setSelectedStepId(step.id);
                    if (onSelectStep) onSelectStep(step);
                  }}
                  className={`flex-1 min-w-[210px] max-w-[240px] rounded-xl p-4 cursor-pointer transition-all duration-150 border flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-600/15 border-indigo-500/60 shadow-[0_0_15px_rgba(99,102,241,0.2)] light:bg-indigo-50 light:border-indigo-400'
                      : 'bg-white/[0.02] border-white/[0.08] hover:bg-white/[0.05] hover:border-indigo-500/40 light:bg-slate-50/80 light:border-slate-300 light:hover:bg-slate-100 light:hover:border-slate-400'
                  }`}
                >
                  <div>
                    {/* Top Row: Step Index & Role */}
                    <div className="flex items-center justify-between gap-1 mb-2.5">
                      <span className="w-5 h-5 rounded-md bg-white/[0.05] light:bg-white border border-white/[0.08] light:border-slate-300 flex items-center justify-center text-[10px] font-mono text-slate-200 light:text-slate-800 font-bold">
                        {idx + 1}
                      </span>
                      <RoleBadge role={step.responsibleRole} />
                    </div>

                    {/* Step Title */}
                    <h4 className="text-xs font-semibold text-slate-100 light:text-slate-900 tracking-tight leading-tight line-clamp-1">
                      {step.title}
                    </h4>

                    {/* Step Description */}
                    <p className="text-[11px] text-slate-400 light:text-slate-600 mt-1.5 line-clamp-2 leading-snug">
                      {step.description}
                    </p>
                  </div>

                  {/* Bottom Meta */}
                  <div className="mt-3.5 pt-2.5 border-t border-white/[0.06] light:border-slate-200 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1.5 text-slate-400 light:text-slate-500">
                      <Clock className="w-3 h-3 text-indigo-400" />
                      <span>{step.slaHours || 24}h SLA</span>
                    </div>

                    {activeCount > 0 ? (
                      <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 light:bg-indigo-100 light:text-indigo-800 font-mono font-bold text-[10px] border border-indigo-500/30">
                        {activeCount} active
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500 light:text-slate-400">0 active</span>
                    )}
                  </div>
                </div>

                {!isLast && (
                  <div className="flex items-center justify-center text-slate-500 light:text-slate-400 shrink-0 px-0.5">
                    <ChevronRight className="w-4 h-4 text-slate-500 light:text-slate-400" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Selected Step Detailed Inspection Panel */}
      {selectedStep && (
        <div className="bg-white/[0.02] light:bg-slate-50/80 border border-white/[0.08] light:border-slate-300 rounded-xl p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/[0.08] light:border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-white/[0.05] light:bg-white text-slate-200 light:text-slate-800 font-bold text-[9px] uppercase tracking-widest border border-white/[0.08] light:border-slate-300">
                STEP {selectedStep.order} SPECIFICATION
              </span>
              <h4 className="text-sm font-medium text-slate-100 light:text-slate-900">{selectedStep.title}</h4>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 light:text-slate-600">Status Result:</span>
              <StatusBadge status={selectedStep.statusResult} size="sm" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-xs">
            <div>
              <span className="text-slate-400 light:text-slate-600 font-medium font-mono text-[10px] uppercase tracking-wider block mb-1">Responsible Operator:</span>
              <div className="mt-1 flex items-center gap-2">
                <RoleBadge role={selectedStep.responsibleRole} />
                <span className="text-slate-200 light:text-slate-800 text-xs">
                  {selectedStep.responsibleRole === 'CUSTOMER'
                    ? 'Client Request Initiator'
                    : selectedStep.responsibleRole === 'OWNER'
                    ? 'Managing Executive / Owner'
                    : 'Assigned Staff Specialist'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 light:text-slate-600 font-medium font-mono text-[10px] uppercase tracking-wider block mb-1">Allowed Execution Actions:</span>
              <div className="mt-1 flex flex-wrap gap-1">
                {selectedStep.allowedActions?.map((action, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-white/[0.04] light:bg-white text-slate-200 light:text-slate-800 border border-white/[0.08] light:border-slate-200 text-[11px]"
                  >
                    {action}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <span className="text-slate-400 light:text-slate-600 font-medium font-mono text-[10px] uppercase tracking-wider block mb-1">Quality & Compliance Rules:</span>
              <div className="mt-1 space-y-1 text-[11px] text-slate-200 light:text-slate-800">
                {selectedStep.requiresApproval && (
                  <div className="flex items-center gap-1.5 text-indigo-400 light:text-indigo-600 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Requires Owner Approval</span>
                  </div>
                )}
                {selectedStep.requiresDocumentUpload && (
                  <div className="flex items-center gap-1.5 text-slate-300 light:text-slate-700">
                    <FileUp className="w-3.5 h-3.5 text-slate-400" />
                    <span>Mandatory Deliverable Upload</span>
                  </div>
                )}
                <div className="text-slate-400 light:text-slate-500 font-mono">Target SLA: {selectedStep.slaHours || 24} hours max</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
