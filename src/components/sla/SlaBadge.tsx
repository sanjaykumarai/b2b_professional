import React from 'react';
import { SlaStatus, SlaBreachPrediction } from '../../types';
import { ShieldCheck, AlertTriangle, AlertOctagon, PauseCircle, CheckCircle2, Clock } from 'lucide-react';

interface SlaBadgeProps {
  status?: SlaStatus;
  remainingMinutes?: number;
  isPaused?: boolean;
  breachPrediction?: SlaBreachPrediction;
  compact?: boolean;
  showIcon?: boolean;
}

export const SlaBadge: React.FC<SlaBadgeProps> = ({
  status = 'ON_TRACK',
  remainingMinutes,
  isPaused = false,
  breachPrediction,
  compact = false,
  showIcon = true,
}) => {
  const getBadgeConfig = () => {
    if (isPaused || status === 'PAUSED') {
      return {
        label: 'SLA Paused',
        icon: PauseCircle,
        bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        lightBg: 'light:bg-amber-100 light:text-amber-800 light:border-amber-300',
        dot: 'bg-amber-400',
      };
    }

    if (status === 'RESOLVED') {
      return {
        label: 'Met SLA',
        icon: CheckCircle2,
        bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        lightBg: 'light:bg-emerald-100 light:text-emerald-800 light:border-emerald-300',
        dot: 'bg-emerald-400',
      };
    }

    if (status === 'BREACHED') {
      return {
        label: 'SLA Breached',
        icon: AlertOctagon,
        bg: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse',
        lightBg: 'light:bg-rose-100 light:text-rose-800 light:border-rose-300',
        dot: 'bg-rose-500',
      };
    }

    if (status === 'AT_RISK') {
      return {
        label: 'At Risk',
        icon: AlertTriangle,
        bg: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        lightBg: 'light:bg-orange-100 light:text-orange-800 light:border-orange-300',
        dot: 'bg-orange-400 animate-ping',
      };
    }

    if (status === 'WARNING') {
      return {
        label: 'Warning',
        icon: Clock,
        bg: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
        lightBg: 'light:bg-yellow-100 light:text-yellow-800 light:border-yellow-300',
        dot: 'bg-yellow-400',
      };
    }

    return {
      label: 'On Track',
      icon: ShieldCheck,
      bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      lightBg: 'light:bg-emerald-100 light:text-emerald-800 light:border-emerald-300',
      dot: 'bg-emerald-400',
    };
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  const formatRemaining = (mins?: number) => {
    if (mins === undefined) return null;
    if (mins < 0) return `${Math.abs(mins)}m overdue`;
    if (mins < 60) return `${Math.round(mins)}m left`;
    const hrs = Math.floor(mins / 60);
    const remainderMins = Math.round(mins % 60);
    return `${hrs}h ${remainderMins}m left`;
  };

  const timeLabel = formatRemaining(remainingMinutes);

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-mono font-medium transition-all ${config.bg} ${config.lightBg}`}
      title={
        breachPrediction
          ? `ML Breach Risk: ${breachPrediction.breachProbability}% (${breachPrediction.riskLevel})`
          : undefined
      }
    >
      {showIcon && <Icon className="w-3 h-3 shrink-0" />}
      <span className="font-semibold tracking-wide">{config.label}</span>
      {timeLabel && !compact && (
        <>
          <span className="opacity-40">•</span>
          <span className="text-[10px] opacity-90">{timeLabel}</span>
        </>
      )}
      {breachPrediction && breachPrediction.riskLevel === 'CRITICAL' && (
        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping shrink-0" />
      )}
    </div>
  );
};
