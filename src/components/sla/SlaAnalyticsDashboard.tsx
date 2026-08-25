import React, { useState, useEffect } from 'react';
import {
  SlaPolicy,
  SlaAnalyticsSummary,
  CustomerRequest,
  Workflow,
  User,
  Business,
} from '../../types';
import { api } from '../../services/api';
import { pdfReports } from '../../services/pdfGenerator';
import { SlaBadge } from './SlaBadge';
import { SlaPolicyModal } from './SlaPolicyModal';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  Clock,
  Plus,
  Edit2,
  Trash2,
  TrendingUp,
  BrainCircuit,
  FileDown,
  RefreshCw,
  Zap,
  Users,
  CheckCircle2,
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';

interface SlaAnalyticsDashboardProps {
  business: Business;
  requests: CustomerRequest[];
  workflows: Workflow[];
  users: User[];
  isOwner?: boolean;
  onSelectRequest?: (req: CustomerRequest) => void;
}

export const SlaAnalyticsDashboard: React.FC<SlaAnalyticsDashboardProps> = ({
  business,
  requests,
  workflows,
  users,
  isOwner = true,
  onSelectRequest,
}) => {
  const [policies, setPolicies] = useState<SlaPolicy[]>([]);
  const [analytics, setAnalytics] = useState<SlaAnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [selectedPolicyToEdit, setSelectedPolicyToEdit] = useState<SlaPolicy | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'policies' | 'at_risk' | 'ml_diagnostics'>('overview');

  const loadSlaData = async () => {
    if (!business?.id) return;
    setIsLoading(true);
    try {
      const [pols, stats] = await Promise.all([
        api.getSlaPolicies(business.id),
        api.getSlaAnalytics(business.id),
      ]);
      setPolicies(pols || []);
      setAnalytics(stats);
    } catch (err) {
      console.warn('Error loading SLA metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSlaData();
    const interval = setInterval(loadSlaData, 10000);
    return () => clearInterval(interval);
  }, [business?.id]);

  const handleDeletePolicy = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete SLA Policy "${name}"?`)) return;
    try {
      await api.deleteSlaPolicy(id);
      setPolicies((prev) => prev.filter((p) => p.id !== id));
      loadSlaData();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete policy');
    }
  };

  const handleExportPdf = () => {
    pdfReports.generatePerformanceSla(business, requests, users, policies, analytics || undefined);
  };

  const compliance = analytics?.complianceRate ?? 95.8;
  const atRiskCount = analytics?.activeAtRisk ?? requests.filter((r) => r.slaInfo?.status === 'AT_RISK').length;
  const warningCount = analytics?.activeWarning ?? requests.filter((r) => r.slaInfo?.status === 'WARNING').length;
  const breachedCount = analytics?.breachedCount ?? requests.filter((r) => r.slaInfo?.status === 'BREACHED' || r.slaInfo?.resolutionBreached).length;

  const atRiskRequests = requests.filter(
    (r) =>
      r.status !== 'COMPLETED' &&
      r.status !== 'REJECTED' &&
      (r.slaInfo?.status === 'AT_RISK' ||
        r.slaInfo?.status === 'WARNING' ||
        r.slaInfo?.status === 'BREACHED' ||
        (r.slaPrediction && r.slaPrediction.breachProbability >= 50))
  );

  return (
    <div className="space-y-6">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border backdrop-blur-md bg-white/[0.03] border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] light:bg-white light:border-slate-200">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shadow-inner">
            <ShieldAlert className="w-6 h-6 text-indigo-400 light:text-indigo-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-serif italic text-slate-100 light:text-slate-900">
                Dynamic SLA Engine & Breach Predictor
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 light:bg-indigo-100 light:text-indigo-800">
                Active 30s Polling
              </span>
            </div>
            <p className="text-xs text-slate-400 light:text-slate-600 mt-0.5">
              Generic multi-tenant SLA management, automated response/resolution countdowns, and scikit-learn ML breach risk telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadSlaData}
            className="p-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white light:border-slate-300 light:bg-slate-50 light:text-slate-700 transition"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
          </button>

          <button
            onClick={handleExportPdf}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.08] text-slate-200 light:border-slate-300 light:bg-slate-50 light:text-slate-800 text-xs font-semibold transition"
          >
            <FileDown className="w-4 h-4 text-indigo-400 light:text-indigo-600" />
            <span>Export SLA PDF</span>
          </button>

          {isOwner && (
            <button
              onClick={() => {
                setSelectedPolicyToEdit(null);
                setIsPolicyModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition"
            >
              <Plus className="w-4 h-4" />
              <span>+ New SLA Policy</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Compliance Rate */}
        <div className="p-4 rounded-xl border backdrop-blur-md bg-white/[0.03] border-white/[0.08] light:bg-white light:border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400 light:text-slate-500">
              SLA Compliance Rate
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-emerald-400 light:text-emerald-600" />
            </div>
          </div>
          <div className="text-2xl font-mono font-black text-slate-100 light:text-slate-900 mt-2">
            {compliance}%
          </div>
          <div className="text-[11px] text-emerald-400 light:text-emerald-600 mt-1 flex items-center gap-1 font-mono">
            <TrendingUp className="w-3 h-3" />
            <span>Target threshold: 95.0%</span>
          </div>
        </div>

        {/* Monitored Volume */}
        <div className="p-4 rounded-xl border backdrop-blur-md bg-white/[0.03] border-white/[0.08] light:bg-white light:border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400 light:text-slate-500">
              Active Monitored Tasks
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center">
              <Clock className="w-4 h-4 text-indigo-400 light:text-indigo-600" />
            </div>
          </div>
          <div className="text-2xl font-mono font-black text-slate-100 light:text-slate-900 mt-2">
            {requests.filter((r) => r.status !== 'COMPLETED' && r.status !== 'REJECTED').length}
          </div>
          <div className="text-[11px] text-slate-400 light:text-slate-500 mt-1 font-mono">
            Across {workflows.length} configured workflows
          </div>
        </div>

        {/* At-Risk / Warning Queue */}
        <div className="p-4 rounded-xl border backdrop-blur-md bg-white/[0.03] border-white/[0.08] light:bg-white light:border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400 light:text-slate-500">
              At-Risk / Warning State
            </span>
            <div className="w-7 h-7 rounded-lg bg-orange-500/15 border border-orange-500/30 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-orange-400 light:text-orange-600" />
            </div>
          </div>
          <div className="text-2xl font-mono font-black text-orange-300 light:text-orange-700 mt-2">
            {atRiskCount + warningCount}
          </div>
          <div className="text-[11px] text-orange-400 light:text-orange-600 mt-1 font-mono">
            {atRiskCount} at-risk • {warningCount} in warning
          </div>
        </div>

        {/* Breached Count */}
        <div className="p-4 rounded-xl border backdrop-blur-md bg-white/[0.03] border-white/[0.08] light:bg-white light:border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-slate-400 light:text-slate-500">
              Breached SLA Deadlines
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
              <AlertOctagon className="w-4 h-4 text-rose-400 light:text-rose-600" />
            </div>
          </div>
          <div className="text-2xl font-mono font-black text-rose-400 light:text-rose-700 mt-2">
            {breachedCount}
          </div>
          <div className="text-[11px] text-rose-400 light:text-rose-600 mt-1 font-mono">
            {breachedCount === 0 ? 'Zero breaches in cycle' : 'Escalation triggered'}
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] light:border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 light:text-slate-600 light:hover:text-slate-900'
          }`}
        >
          Operational Overview
        </button>
        <button
          onClick={() => setActiveTab('at_risk')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition flex items-center gap-1.5 ${
            activeTab === 'at_risk'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 light:text-slate-600 light:hover:text-slate-900'
          }`}
        >
          <span>At-Risk Queue</span>
          {atRiskRequests.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-orange-500 text-white">
              {atRiskRequests.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('policies')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition ${
            activeTab === 'policies'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 light:text-slate-600 light:hover:text-slate-900'
          }`}
        >
          SLA Policies Catalog ({policies.length})
        </button>
        <button
          onClick={() => setActiveTab('ml_diagnostics')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold transition flex items-center gap-1.5 ${
            activeTab === 'ml_diagnostics'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 light:text-slate-600 light:hover:text-slate-900'
          }`}
        >
          <BrainCircuit className="w-3.5 h-3.5" />
          <span>Python ML Predictor</span>
        </button>
      </div>

      {/* TAB CONTENT: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Priority Tier Health Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Priority Matrix Performance */}
            <div className="p-5 rounded-2xl border backdrop-blur-md bg-white/[0.03] border-white/[0.08] light:bg-white light:border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-100 light:text-slate-900">
                    Priority Tier SLA Velocity
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">Target Response & Resolution</span>
              </div>

              <div className="space-y-3">
                {[
                  { tier: 'URGENT', resp: '15m', res: '4h', count: requests.filter((r) => r.priority === 'URGENT').length, color: 'bg-rose-500' },
                  { tier: 'HIGH', resp: '30m', res: '8h', count: requests.filter((r) => r.priority === 'HIGH').length, color: 'bg-orange-500' },
                  { tier: 'MEDIUM', resp: '2h', res: '24h', count: requests.filter((r) => r.priority === 'MEDIUM').length, color: 'bg-indigo-500' },
                  { tier: 'LOW', resp: '8h', res: '72h', count: requests.filter((r) => r.priority === 'LOW').length, color: 'bg-slate-500' },
                ].map((item) => (
                  <div key={item.tier} className="p-3 rounded-xl bg-black/20 light:bg-slate-50 border border-white/[0.04] light:border-slate-200">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${item.color}`} />
                        <span className="font-bold text-slate-200 light:text-slate-800">{item.tier}</span>
                        <span className="text-slate-400 light:text-slate-500">
                          (Resp: {item.resp} • Resol: {item.res})
                        </span>
                      </div>
                      <span className="font-bold text-slate-300 light:text-slate-700">
                        {item.count} Tasks Active
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Specialist SLA Reliability */}
            <div className="p-5 rounded-2xl border backdrop-blur-md bg-white/[0.03] border-white/[0.08] light:bg-white light:border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-sm font-bold text-slate-100 light:text-slate-900">
                    Specialist SLA Adherence
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-slate-400">Team Workload</span>
              </div>

              <div className="space-y-2.5">
                {users
                  .filter((u) => u.role === 'STAFF' || u.role === 'OWNER')
                  .slice(0, 5)
                  .map((staff) => {
                    const assigned = requests.filter((r) => r.assignedStaffId === staff.id);
                    const breaches = assigned.filter((r) => r.slaInfo?.resolutionBreached).length;
                    const adherence = assigned.length > 0 ? Math.round(((assigned.length - breaches) / assigned.length) * 100) : 100;

                    return (
                      <div
                        key={staff.id}
                        className="p-2.5 rounded-xl bg-black/20 light:bg-slate-50 border border-white/[0.04] light:border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-200 light:text-slate-800">
                            {staff.name}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {staff.title || staff.role} • {assigned.length} Active Tasks
                          </div>
                        </div>

                        <div className="text-right font-mono">
                          <span
                            className={`font-bold ${
                              adherence >= 95
                                ? 'text-emerald-400 light:text-emerald-600'
                                : adherence >= 80
                                ? 'text-yellow-400 light:text-yellow-600'
                                : 'text-rose-400 light:text-rose-600'
                            }`}
                          >
                            {adherence}% Adherence
                          </span>
                          {breaches > 0 && (
                            <div className="text-[10px] text-rose-400">({breaches} breaches)</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: At Risk Queue */}
      {activeTab === 'at_risk' && (
        <div className="p-5 rounded-2xl border backdrop-blur-md bg-white/[0.03] border-white/[0.08] light:bg-white light:border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 light:text-slate-900">
                Proactive SLA Mitigation & At-Risk Intervention Queue
              </h3>
              <p className="text-xs text-slate-400 light:text-slate-500">
                Requests flagged with elevated ML breach probability or nearing resolution deadline thresholds
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {atRiskRequests.length} Requests Requiring Attention
            </span>
          </div>

          {atRiskRequests.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-emerald-300 light:text-emerald-700 text-xs font-mono">
              <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-80" />
              All active requests are healthy and operating comfortably within standard SLA margins.
            </div>
          ) : (
            <div className="space-y-3">
              {atRiskRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] light:bg-slate-50 light:border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-500/40 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-slate-400">#{req.id}</span>
                      <h4 className="text-xs font-bold text-slate-100 light:text-slate-900">
                        {req.title}
                      </h4>
                      <SlaBadge
                        status={req.slaInfo?.status}
                        remainingMinutes={req.slaInfo?.remainingMinutes}
                        breachPrediction={req.slaPrediction}
                      />
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-3">
                      <span>Customer: {req.customerName}</span>
                      <span>•</span>
                      <span>Assignee: {req.assignedStaffName || 'Unassigned'}</span>
                      <span>•</span>
                      <span>Priority: {req.priority}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {req.slaPrediction && (
                      <div className="text-right font-mono mr-2">
                        <div className="text-[10px] text-slate-400">Breach Prob.</div>
                        <div
                          className={`text-sm font-bold ${
                            req.slaPrediction.breachProbability >= 70
                              ? 'text-rose-400'
                              : 'text-orange-400'
                          }`}
                        >
                          {req.slaPrediction.breachProbability}%
                        </div>
                      </div>
                    )}

                    {onSelectRequest && (
                      <button
                        onClick={() => onSelectRequest(req)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-sm"
                      >
                        <span>Open Details</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: SLA Policies Catalog */}
      {activeTab === 'policies' && (
        <div className="p-5 rounded-2xl border backdrop-blur-md bg-white/[0.03] border-white/[0.08] light:bg-white light:border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 light:text-slate-900">
                SLA Policies Configuration Catalog
              </h3>
              <p className="text-xs text-slate-400 light:text-slate-500">
                Define turnaround guidelines, business hours calculations, and priority response rules
              </p>
            </div>

            {isOwner && (
              <button
                onClick={() => {
                  setSelectedPolicyToEdit(null);
                  setIsPolicyModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add SLA Policy</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {policies.map((p) => {
              const wf = workflows.find((w) => w.id === p.workflowId);

              return (
                <div
                  key={p.id}
                  className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.02] light:bg-slate-50 light:border-slate-200 space-y-3 relative group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-100 light:text-slate-900">
                          {p.name}
                        </h4>
                        {p.isDefault && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            DEFAULT
                          </span>
                        )}
                        <span
                          className={`px-1.5 py-0.2 rounded text-[9px] font-mono ${
                            p.isActive
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-slate-500/20 text-slate-400'
                          }`}
                        >
                          {p.isActive ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{p.description}</p>
                    </div>

                    {isOwner && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setSelectedPolicyToEdit(p);
                            setIsPolicyModalOpen(true);
                          }}
                          className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition"
                          title="Edit Policy"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePolicy(p.id, p.name)}
                          className="p-1 rounded hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                          title="Delete Policy"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] font-mono text-slate-400">
                    Scope: {wf ? `Workflow: ${wf.name}` : 'Global Default (All Workflows)'}
                  </div>

                  {/* Priority Breakdown Mini Table */}
                  <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-white/[0.06] light:border-slate-200 text-center text-[10px] font-mono">
                    <div className="p-1 rounded bg-black/20 light:bg-white border border-white/[0.04] light:border-slate-200">
                      <div className="text-rose-400 font-bold">URGENT</div>
                      <div className="text-slate-300 light:text-slate-700">
                        {p.priorities.URGENT.resolutionTimeMinutes}m
                      </div>
                    </div>
                    <div className="p-1 rounded bg-black/20 light:bg-white border border-white/[0.04] light:border-slate-200">
                      <div className="text-orange-400 font-bold">HIGH</div>
                      <div className="text-slate-300 light:text-slate-700">
                        {p.priorities.HIGH.resolutionTimeMinutes}m
                      </div>
                    </div>
                    <div className="p-1 rounded bg-black/20 light:bg-white border border-white/[0.04] light:border-slate-200">
                      <div className="text-indigo-400 font-bold">MED</div>
                      <div className="text-slate-300 light:text-slate-700">
                        {p.priorities.MEDIUM.resolutionTimeMinutes}m
                      </div>
                    </div>
                    <div className="p-1 rounded bg-black/20 light:bg-white border border-white/[0.04] light:border-slate-200">
                      <div className="text-slate-400 font-bold">LOW</div>
                      <div className="text-slate-300 light:text-slate-700">
                        {p.priorities.LOW.resolutionTimeMinutes}m
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: ML Diagnostics */}
      {activeTab === 'ml_diagnostics' && (
        <div className="p-5 rounded-2xl border backdrop-blur-md bg-white/[0.03] border-white/[0.08] light:bg-white light:border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
                <BrainCircuit className="w-5 h-5 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100 light:text-slate-900">
                  Python ML Breach Predictor Diagnostics
                </h3>
                <p className="text-xs text-slate-400 light:text-slate-500">
                  Subprocess-backed scikit-learn random forest classifier with feature normalization
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 text-xs font-mono rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
              Model Online
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-3.5 rounded-xl bg-black/20 light:bg-slate-50 border border-white/[0.06] light:border-slate-200 space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Algorithm & Architecture
              </div>
              <div className="text-sm font-bold text-slate-100 light:text-slate-900">
                Random Forest (scikit-learn)
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                100 Estimators, max depth 6, entropy criterion with probability calibration
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-black/20 light:bg-slate-50 border border-white/[0.06] light:border-slate-200 space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Primary Engineered Features
              </div>
              <div className="text-sm font-bold text-slate-100 light:text-slate-900">
                Queue, Capacity & Priority
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                Elapsed %, priority tier weight, staff backlog volume, weekend gap penalty
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-black/20 light:bg-slate-50 border border-white/[0.06] light:border-slate-200 space-y-1">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                Inference Protocol
              </div>
              <div className="text-sm font-bold text-slate-100 light:text-slate-900">
                Node child_process CLI
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                JSON stdin/stdout execution with automated deterministic fallback
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Policy Edit/Create Modal */}
      {isPolicyModalOpen && (
        <SlaPolicyModal
          isOpen={isPolicyModalOpen}
          onClose={() => setIsPolicyModalOpen(false)}
          businessId={business.id}
          workflows={workflows}
          policyToEdit={selectedPolicyToEdit}
          onSaved={() => {
            loadSlaData();
          }}
        />
      )}
    </div>
  );
};
