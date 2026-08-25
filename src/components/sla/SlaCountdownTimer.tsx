import React, { useState, useEffect } from 'react';
import { RequestSlaInfo, CustomerRequest } from '../../types';
import { Clock, PauseCircle, PlayCircle, ShieldAlert, CheckCircle, AlertOctagon } from 'lucide-react';
import { api } from '../../services/api';

interface SlaCountdownTimerProps {
  request: CustomerRequest;
  onSlaUpdated?: (updatedSla: RequestSlaInfo) => void;
  canManagePause?: boolean;
}

export const SlaCountdownTimer: React.FC<SlaCountdownTimerProps> = ({
  request,
  onSlaUpdated,
  canManagePause = true,
}) => {
  const [sla, setSla] = useState<RequestSlaInfo | undefined>(request.slaInfo);
  const [isPausing, setIsPausing] = useState(false);

  useEffect(() => {
    setSla(request.slaInfo);
  }, [request.slaInfo]);

  if (!sla) {
    return (
      <div className="p-3.5 rounded-xl border border-white/[0.08] bg-white/[0.02] light:border-slate-200 light:bg-slate-50 text-xs text-slate-400">
        Standard Operating Turnaround Target: 24-48 Hours
      </div>
    );
  }

  const handleTogglePause = async () => {
    setIsPausing(true);
    try {
      if (sla.isPaused) {
        const updated = await api.resumeRequestSla(request.id, 'Operations Specialist', 'STAFF');
        setSla(updated);
        onSlaUpdated?.(updated);
      } else {
        const reason = prompt('Enter reason for pausing SLA (e.g. Awaiting client documents):') || 'Awaiting client response';
        const updated = await api.pauseRequestSla(request.id, reason, 'Operations Specialist', 'STAFF');
        setSla(updated);
        onSlaUpdated?.(updated);
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to update SLA pause state');
    } finally {
      setIsPausing(false);
    }
  };

  const elapsed = sla.elapsedMinutes || 0;
  const target = sla.resolutionTargetMinutes || 1440;
  const remaining = sla.remainingMinutes !== undefined ? sla.remainingMinutes : Math.max(0, target - elapsed);
  const progressPercent = Math.min(100, Math.round((elapsed / target) * 100));

  const isOverdue = remaining < 0 || sla.status === 'BREACHED';
  const isWarning = sla.status === 'WARNING';
  const isAtRisk = sla.status === 'AT_RISK';
  const isPaused = sla.isPaused;
  const isResolved = sla.status === 'RESOLVED' || request.status === 'COMPLETED';

  // Format minutes to "Xd Yh Zm"
  const formatTime = (mins: number) => {
    const absMins = Math.abs(Math.round(mins));
    const days = Math.floor(absMins / 1440);
    const hrs = Math.floor((absMins % 1440) / 60);
    const m = absMins % 60;
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hrs > 0 || days > 0) parts.push(`${hrs}h`);
    parts.push(`${m}m`);
    return parts.join(' ');
  };

  const getProgressColor = () => {
    if (isPaused) return 'bg-amber-400';
    if (isResolved) return 'bg-emerald-400';
    if (isOverdue) return 'bg-rose-500';
    if (isAtRisk) return 'bg-orange-500';
    if (isWarning) return 'bg-yellow-400';
    return 'bg-indigo-500';
  };

  return (
    <div className="p-4 rounded-xl border backdrop-blur-md bg-white/[0.03] border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] light:bg-slate-50 light:border-slate-200 light:shadow-xs space-y-3">
      {/* Header with Title and Policy */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400 light:text-indigo-600" />
          <div>
            <div className="text-xs font-semibold text-slate-200 light:text-slate-800">
              Resolution SLA Timer
            </div>
            <div className="text-[10px] text-slate-400 light:text-slate-500 font-mono">
              Policy: {sla.policyName || 'Standard Operations Policy'}
            </div>
          </div>
        </div>

        {canManagePause && !isResolved && (
          <button
            onClick={handleTogglePause}
            disabled={isPausing}
            className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border flex items-center gap-1.5 transition ${
              isPaused
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30 light:bg-emerald-100 light:text-emerald-800 light:border-emerald-300'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 light:bg-amber-100 light:text-amber-800 light:border-amber-300'
            }`}
          >
            {isPaused ? (
              <>
                <PlayCircle className="w-3.5 h-3.5" />
                <span>Resume Timer</span>
              </>
            ) : (
              <>
                <PauseCircle className="w-3.5 h-3.5" />
                <span>Pause Timer</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Main Countdown metric display */}
      <div className="grid grid-cols-3 gap-2 pt-1 border-t border-white/[0.06] light:border-slate-200 text-center">
        <div className="p-2 rounded-lg bg-black/20 light:bg-white border border-white/[0.04] light:border-slate-200">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 light:text-slate-500">
            Target SLA
          </div>
          <div className="text-sm font-mono font-bold text-slate-100 light:text-slate-900 mt-0.5">
            {formatTime(target)}
          </div>
        </div>

        <div className="p-2 rounded-lg bg-black/20 light:bg-white border border-white/[0.04] light:border-slate-200">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 light:text-slate-500">
            Active Elapsed
          </div>
          <div className="text-sm font-mono font-bold text-slate-100 light:text-slate-900 mt-0.5">
            {formatTime(elapsed)}
          </div>
        </div>

        <div
          className={`p-2 rounded-lg border ${
            isResolved
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 light:bg-emerald-50 light:text-emerald-800'
              : isOverdue
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 light:bg-rose-50 light:text-rose-800 animate-pulse'
              : isAtRisk
              ? 'bg-orange-500/20 border-orange-500/40 text-orange-300 light:bg-orange-50 light:text-orange-800'
              : isWarning
              ? 'bg-yellow-500/15 border-yellow-500/30 text-yellow-300 light:bg-yellow-50 light:text-yellow-800'
              : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 light:bg-indigo-50 light:text-indigo-800'
          }`}
        >
          <div className="text-[10px] font-mono uppercase tracking-wider opacity-80">
            {isResolved ? 'Met On Time' : isOverdue ? 'Overdue By' : 'Remaining'}
          </div>
          <div className="text-sm font-mono font-bold mt-0.5">
            {isResolved ? 'Resolved' : formatTime(remaining)}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] font-mono text-slate-400 light:text-slate-500">
          <span>{progressPercent}% consumed</span>
          <span>
            Deadline:{' '}
            {sla.resolutionDeadline ? new Date(sla.resolutionDeadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-800 light:bg-slate-200 overflow-hidden relative">
          <div
            className={`h-full rounded-full transition-all duration-500 ${getProgressColor()}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* SLA Status Footer Note */}
      {isPaused && (
        <div className="text-[11px] text-amber-300 light:text-amber-700 bg-amber-500/10 border border-amber-500/20 p-2 rounded-lg flex items-center gap-1.5 font-mono">
          <PauseCircle className="w-3.5 h-3.5 shrink-0" />
          <span>Timer is paused. Client response required to continue countdown.</span>
        </div>
      )}
      {isOverdue && !isResolved && (
        <div className="text-[11px] text-rose-300 light:text-rose-700 bg-rose-500/10 border border-rose-500/20 p-2 rounded-lg flex items-center gap-1.5 font-mono">
          <AlertOctagon className="w-3.5 h-3.5 shrink-0" />
          <span>Resolution target breached. Owner and management escalated.</span>
        </div>
      )}
    </div>
  );
};
