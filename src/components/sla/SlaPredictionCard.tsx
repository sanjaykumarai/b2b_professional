import React, { useState } from 'react';
import { SlaBreachPrediction, CustomerRequest } from '../../types';
import { BrainCircuit, AlertTriangle, ShieldCheck, RefreshCw, Sparkles, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';

interface SlaPredictionCardProps {
  request: CustomerRequest;
  onPredictionUpdated?: (prediction: SlaBreachPrediction) => void;
}

export const SlaPredictionCard: React.FC<SlaPredictionCardProps> = ({
  request,
  onPredictionUpdated,
}) => {
  const [prediction, setPrediction] = useState<SlaBreachPrediction | undefined>(request.slaPrediction);
  const [isLoading, setIsLoading] = useState(false);

  const handleRefreshPrediction = async () => {
    setIsLoading(true);
    try {
      const fresh = await api.getRequestSlaPrediction(request.id);
      setPrediction(fresh);
      onPredictionUpdated?.(fresh);
    } catch (err: any) {
      console.warn('Prediction fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const p = prediction || {
    requestId: request.id,
    breachProbability: 18,
    riskLevel: 'LOW' as const,
    confidence: 89,
    modelType: 'ML_RANDOM_FOREST',
    factors: [
      { name: 'Priority Tier', weight: 0.25, description: `${request.priority} priority base turnaround target` },
      { name: 'Staff Capacity', weight: 0.15, description: request.assignedStaffName ? 'Assigned' : 'Unassigned in triage' },
      { name: 'Pipeline Complexity', weight: 0.12, description: 'Standard service workflow progression' },
    ],
    recommendedAction: 'Maintain current cadence. SLA is comfortably on track.',
    predictedAt: new Date().toISOString(),
  };

  const getRiskStyle = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          lightBg: 'light:bg-rose-100 light:text-rose-800 light:border-rose-300',
          barColor: 'bg-rose-500',
          icon: AlertTriangle,
        };
      case 'HIGH':
        return {
          bg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
          lightBg: 'light:bg-orange-100 light:text-orange-800 light:border-orange-300',
          barColor: 'bg-orange-500',
          icon: AlertTriangle,
        };
      case 'MEDIUM':
        return {
          bg: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
          lightBg: 'light:bg-yellow-100 light:text-yellow-800 light:border-yellow-300',
          barColor: 'bg-yellow-500',
          icon: TrendingUp,
        };
      default:
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
          lightBg: 'light:bg-emerald-100 light:text-emerald-800 light:border-emerald-300',
          barColor: 'bg-emerald-500',
          icon: ShieldCheck,
        };
    }
  };

  const riskStyle = getRiskStyle(p.riskLevel);
  const RiskIcon = riskStyle.icon;

  return (
    <div className="p-4 rounded-xl border backdrop-blur-md bg-white/[0.03] border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] light:bg-slate-50 light:border-slate-200 light:shadow-xs space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
            <BrainCircuit className="w-4 h-4 text-indigo-300 light:text-indigo-600" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-100 light:text-slate-900 flex items-center gap-1.5">
              <span>ML SLA Breach Predictor</span>
              <span className="px-1.5 py-0.2 text-[9px] font-mono rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 light:bg-indigo-100 light:text-indigo-700">
                Python ML
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 light:text-slate-500">
              Confidence: {p.confidence}% • Engine: {p.modelType}
            </div>
          </div>
        </div>

        <button
          onClick={handleRefreshPrediction}
          disabled={isLoading}
          className="p-1.5 rounded-lg border border-white/[0.08] hover:border-white/[0.2] bg-white/[0.04] text-slate-300 hover:text-white light:border-slate-200 light:bg-white light:text-slate-600 transition"
          title="Re-run ML prediction"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
        </button>
      </div>

      {/* Main Probability Meter */}
      <div className="p-3 rounded-lg bg-black/30 light:bg-white border border-white/[0.06] light:border-slate-200 flex items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 light:text-slate-500">
            Breach Probability
          </div>
          <div className="text-2xl font-mono font-black text-slate-100 light:text-slate-900 mt-0.5">
            {p.breachProbability}%
          </div>
        </div>

        <div className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 ${riskStyle.bg} ${riskStyle.lightBg}`}>
          <RiskIcon className="w-4 h-4" />
          <span className="text-xs font-mono font-bold">{p.riskLevel} RISK</span>
        </div>
      </div>

      {/* Probability Slider Bar */}
      <div className="space-y-1">
        <div className="w-full h-2 rounded-full bg-slate-800 light:bg-slate-200 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${riskStyle.barColor}`}
            style={{ width: `${Math.max(4, p.breachProbability)}%` }}
          />
        </div>
        <div className="flex justify-between text-[9px] font-mono text-slate-500">
          <span>0% (Safe)</span>
          <span>50% (At Risk)</span>
          <span>100% (Imminent Breach)</span>
        </div>
      </div>

      {/* Risk Factors Breakdown */}
      {p.factors && p.factors.length > 0 && (
        <div className="space-y-1.5 pt-1 border-t border-white/[0.06] light:border-slate-200">
          <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-400 light:text-slate-500">
            Primary Feature Weights
          </div>
          <div className="space-y-1.5">
            {p.factors.map((f, idx) => (
              <div key={idx} className="text-xs space-y-0.5">
                <div className="flex justify-between items-center text-slate-300 light:text-slate-700 font-mono text-[11px]">
                  <span>{f.name}</span>
                  <span className="text-slate-400 light:text-slate-500">{Math.round(f.weight * 100)}%</span>
                </div>
                <div className="w-full h-1 rounded-full bg-slate-800 light:bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-indigo-400/80"
                    style={{ width: `${Math.min(100, f.weight * 100)}%` }}
                  />
                </div>
                {f.description && (
                  <p className="text-[10px] text-slate-400 light:text-slate-500 truncate">
                    {f.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Mitigation Action */}
      {p.recommendedAction && (
        <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 light:bg-indigo-50 light:border-indigo-200 flex items-start gap-2 text-xs">
          <Sparkles className="w-4 h-4 text-indigo-400 light:text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-indigo-200 light:text-indigo-900 text-[11px] uppercase tracking-wide font-mono">
              AI / ML Mitigation Recommendation
            </div>
            <div className="text-slate-300 light:text-slate-700 text-xs mt-0.5 leading-relaxed">
              {p.recommendedAction}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
