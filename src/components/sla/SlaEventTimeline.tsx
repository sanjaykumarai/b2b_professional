import React from 'react';
import { SlaEvent } from '../../types';
import { Clock, ShieldAlert, CheckCircle2, PauseCircle, PlayCircle, AlertTriangle, AlertOctagon, User } from 'lucide-react';

interface SlaEventTimelineProps {
  events: SlaEvent[];
}

export const SlaEventTimeline: React.FC<SlaEventTimelineProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className="p-4 text-center text-xs text-slate-500 font-mono">
        No SLA audit events recorded yet.
      </div>
    );
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'INITIALIZED':
        return <Clock className="w-3.5 h-3.5 text-indigo-400" />;
      case 'RESPONSE_MET':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'PAUSED':
        return <PauseCircle className="w-3.5 h-3.5 text-amber-400" />;
      case 'RESUMED':
        return <PlayCircle className="w-3.5 h-3.5 text-indigo-400" />;
      case 'WARNING_TRIGGERED':
        return <Clock className="w-3.5 h-3.5 text-yellow-400" />;
      case 'AT_RISK_TRIGGERED':
        return <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />;
      case 'RESOLVED':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      case 'BREACHED':
      case 'RESOLUTION_BREACHED':
      case 'RESPONSE_BREACHED':
        return <AlertOctagon className="w-3.5 h-3.5 text-rose-500" />;
      default:
        return <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'RESPONSE_MET':
      case 'RESOLVED':
        return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 light:bg-emerald-50 light:text-emerald-800';
      case 'PAUSED':
        return 'border-amber-500/30 bg-amber-500/10 text-amber-300 light:bg-amber-50 light:text-amber-800';
      case 'WARNING_TRIGGERED':
        return 'border-yellow-500/30 bg-yellow-500/10 text-yellow-300 light:bg-yellow-50 light:text-yellow-800';
      case 'AT_RISK_TRIGGERED':
        return 'border-orange-500/30 bg-orange-500/10 text-orange-300 light:bg-orange-50 light:text-orange-800';
      case 'BREACHED':
      case 'RESOLUTION_BREACHED':
      case 'RESPONSE_BREACHED':
        return 'border-rose-500/30 bg-rose-500/10 text-rose-300 light:bg-rose-50 light:text-rose-800';
      default:
        return 'border-white/[0.08] bg-white/[0.03] text-slate-300 light:border-slate-200 light:bg-slate-50 light:text-slate-700';
    }
  };

  return (
    <div className="space-y-2">
      {events.map((evt) => (
        <div
          key={evt.id}
          className={`p-2.5 rounded-lg border flex items-start justify-between gap-3 text-xs transition ${getEventColor(
            evt.eventType
          )}`}
        >
          <div className="flex items-start gap-2.5">
            <div className="mt-0.5 shrink-0">{getEventIcon(evt.eventType)}</div>
            <div>
              <div className="font-semibold text-slate-100 light:text-slate-900 flex items-center gap-2">
                <span>{evt.eventType.replace(/_/g, ' ')}</span>
                {evt.actorName && (
                  <span className="text-[10px] text-slate-400 light:text-slate-500 font-mono">
                    by {evt.actorName}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-300 light:text-slate-600 mt-0.5 leading-relaxed">
                {evt.description}
              </p>
            </div>
          </div>

          <div className="text-[10px] font-mono text-slate-400 light:text-slate-500 shrink-0 text-right">
            {new Date(evt.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>
      ))}
    </div>
  );
};
