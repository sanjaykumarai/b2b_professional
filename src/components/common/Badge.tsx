import React from 'react';
import { UserRole } from '../../types';

interface StatusBadgeProps {
  status: string;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '', size = 'md' }) => {
  const getStyles = () => {
    switch (status?.toUpperCase()) {
      case 'SUBMITTED':
        return 'bg-white/[0.04] text-slate-300 border-white/[0.08] light:bg-slate-100 light:text-slate-700 light:border-slate-300';
      case 'IN_REVIEW':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/30 light:bg-blue-50 light:text-blue-700 light:border-blue-200';
      case 'ASSIGNED':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30 light:bg-purple-50 light:text-purple-700 light:border-purple-200';
      case 'IN_PROGRESS':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30 light:bg-amber-50 light:text-amber-800 light:border-amber-200';
      case 'WAITING_FOR_CUSTOMER':
        return 'bg-orange-500/10 text-orange-300 border-orange-500/30 light:bg-orange-50 light:text-orange-800 light:border-orange-200';
      case 'APPROVAL':
        return 'bg-pink-500/10 text-pink-300 border-pink-500/30 light:bg-pink-50 light:text-pink-700 light:border-pink-200';
      case 'COMPLETED':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 light:bg-emerald-50 light:text-emerald-700 light:border-emerald-200';
      case 'REJECTED':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30 light:bg-rose-50 light:text-rose-700 light:border-rose-200';
      default:
        return 'bg-white/[0.04] text-slate-300 border-white/[0.08] light:bg-slate-100 light:text-slate-700 light:border-slate-300';
    }
  };

  const getDotColor = () => {
    switch (status?.toUpperCase()) {
      case 'SUBMITTED':
        return 'bg-slate-400';
      case 'IN_REVIEW':
        return 'bg-blue-400';
      case 'ASSIGNED':
        return 'bg-purple-400';
      case 'IN_PROGRESS':
        return 'bg-amber-400';
      case 'WAITING_FOR_CUSTOMER':
        return 'bg-orange-400';
      case 'APPROVAL':
        return 'bg-pink-400';
      case 'COMPLETED':
        return 'bg-emerald-400';
      case 'REJECTED':
        return 'bg-rose-400';
      default:
        return 'bg-slate-400';
    }
  };

  const formattedLabel = status?.replace(/_/g, ' ') || 'UNKNOWN';
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[9px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono rounded-lg border ${getStyles()} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getDotColor()}`} />
      <span className="whitespace-nowrap tracking-wider uppercase font-semibold">{formattedLabel}</span>
    </span>
  );
};

interface PriorityBadgeProps {
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' | string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  switch (priority?.toUpperCase()) {
    case 'URGENT':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-widest bg-rose-500/20 text-rose-300 light:bg-rose-50 light:text-rose-700 border border-rose-500/40 light:border-rose-200">
          URGENT
        </span>
      );
    case 'HIGH':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-mono font-semibold uppercase tracking-widest bg-orange-500/20 text-orange-300 light:bg-orange-50 light:text-orange-800 border border-orange-500/40 light:border-orange-200">
          HIGH
        </span>
      );
    case 'MEDIUM':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-mono font-medium uppercase tracking-widest bg-white/[0.05] text-slate-300 light:bg-slate-100 light:text-slate-700 border border-white/[0.08] light:border-slate-300">
          MEDIUM
        </span>
      );
    case 'LOW':
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-mono font-medium uppercase tracking-widest bg-white/[0.03] text-slate-400 light:bg-slate-100 light:text-slate-600 border border-white/[0.05] light:border-slate-200">
          LOW
        </span>
      );
  }
};

interface RoleBadgeProps {
  role: UserRole | string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  switch (role?.toUpperCase()) {
    case 'OWNER':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-widest bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xs">
          OWNER
        </span>
      );
    case 'STAFF':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-mono font-semibold uppercase tracking-widest bg-indigo-500/20 text-indigo-300 light:bg-indigo-50 light:text-indigo-700 border border-indigo-500/40 light:border-indigo-200">
          STAFF
        </span>
      );
    case 'CUSTOMER':
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-mono font-semibold uppercase tracking-widest bg-emerald-500/20 text-emerald-300 light:bg-emerald-50 light:text-emerald-700 border border-emerald-500/40 light:border-emerald-200">
          CLIENT
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-mono font-medium uppercase tracking-widest bg-white/[0.04] text-slate-400 border border-white/[0.08] light:bg-slate-100 light:text-slate-600">
          {role}
        </span>
      );
  }
};
