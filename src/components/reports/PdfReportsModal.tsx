import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWorkflow } from '../../context/WorkflowContext';
import { pdfReports } from '../../services/pdfGenerator';
import {
  X,
  Download,
  FileDown,
} from 'lucide-react';

export const PdfReportsModal: React.FC = () => {
  const { currentBusiness, allUsers } = useAuth();
  const { workflows, activeWorkflow, requests, isReportsOpen, setIsReportsOpen } = useWorkflow();

  if (!isReportsOpen || !currentBusiness) return null;

  const handleGenSummary = () => {
    pdfReports.generateBusinessSummary(currentBusiness, workflows, requests, allUsers);
  };

  const handleGenBlueprint = () => {
    if (activeWorkflow) {
      pdfReports.generateWorkflowBlueprint(currentBusiness, activeWorkflow);
    }
  };

  const handleGenSla = () => {
    pdfReports.generatePerformanceSla(currentBusiness, requests, allUsers);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-2xl rounded-3xl backdrop-blur-2xl border shadow-2xl overflow-hidden flex flex-col transition-colors duration-200 bg-[#0A0C10]/95 border-white/[0.12] text-slate-100 light:bg-white/95 light:border-slate-200 light:text-slate-900">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] light:border-slate-200 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 border border-white/20 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <FileDown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-serif italic font-semibold text-slate-100 light:text-slate-900">Executive Reporting Suite</h3>
              <p className="text-xs text-slate-400 light:text-slate-600">
                Generate vector-formatted PDF documents with audit tables and operations analytics.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsReportsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white light:hover:text-slate-900 hover:bg-white/[0.06] light:hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Report Cards Grid */}
        <div className="p-6 space-y-3.5">
          {/* 1. Executive Operations Summary */}
          <div className="p-4 rounded-2xl border backdrop-blur-md bg-white/[0.03] border-white/[0.08] hover:border-indigo-500/40 light:bg-slate-50 light:border-slate-200 light:hover:border-indigo-300 transition flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-serif italic font-semibold text-sm text-slate-100 light:text-slate-900">Executive Operations Summary</span>
                <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-widest bg-indigo-500/20 text-indigo-300 light:bg-indigo-100 light:text-indigo-800 border border-indigo-500/30">
                  Full Suite
                </span>
              </div>
              <p className="text-xs text-slate-400 light:text-slate-600">
                Aggregates high-level metrics, active workflow listings, customer request volume, and fulfillment rates.
              </p>
            </div>

            <button
              onClick={handleGenSummary}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-bold uppercase tracking-wider shrink-0 flex items-center gap-1.5 transition shadow-md border border-white/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>

          {/* 2. Workflow Architecture Blueprint */}
          <div className="p-4 rounded-2xl border backdrop-blur-md bg-white/[0.03] border-white/[0.08] hover:border-indigo-500/40 light:bg-slate-50 light:border-slate-200 light:hover:border-indigo-300 transition flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-serif italic font-semibold text-sm text-slate-100 light:text-slate-900">Workflow Architecture Blueprint</span>
                <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-widest bg-purple-500/20 text-purple-300 light:bg-purple-100 light:text-purple-800 border border-purple-500/30">
                  Technical Spec
                </span>
              </div>
              <p className="text-xs text-slate-400 light:text-slate-600">
                Complete technical specification of current active workflow: process steps, responsible roles, SLA targets, and customer ingestion schema.
              </p>
            </div>

            <button
              onClick={handleGenBlueprint}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-bold uppercase tracking-wider shrink-0 flex items-center gap-1.5 transition shadow-md border border-white/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>

          {/* 3. Staff SLA & Performance Report */}
          <div className="p-4 rounded-2xl border backdrop-blur-md bg-white/[0.03] border-white/[0.08] hover:border-indigo-500/40 light:bg-slate-50 light:border-slate-200 light:hover:border-indigo-300 transition flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-serif italic font-semibold text-sm text-slate-100 light:text-slate-900">Staff SLA Velocity & Capacity</span>
                <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 light:bg-emerald-100 light:text-emerald-800 border border-emerald-500/30">
                  Throughput Audit
                </span>
              </div>
              <p className="text-xs text-slate-400 light:text-slate-600">
                Staff specialist workload capacity, active in-flight vs completed tasks, and priority fulfillment distribution.
              </p>
            </div>

            <button
              onClick={handleGenSla}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-bold uppercase tracking-wider shrink-0 flex items-center gap-1.5 transition shadow-md border border-white/20"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-white/[0.08] light:border-slate-200 bg-black/20 light:bg-slate-50 flex items-center justify-end">
          <button
            onClick={() => setIsReportsOpen(false)}
            className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-slate-200 hover:text-white light:bg-slate-200 light:text-slate-800 light:hover:bg-slate-300 text-xs font-semibold transition border border-white/[0.08] light:border-slate-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
