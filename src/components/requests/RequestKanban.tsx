import React, { useState } from 'react';
import { CustomerRequest } from '../../types';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import {
  Clock,
  User,
  Paperclip,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface RequestKanbanProps {
  requests: CustomerRequest[];
  onSelectRequest: (req: CustomerRequest) => void;
}

const COLUMNS = [
  { id: 'SUBMITTED', title: '1. Ingestion', badge: 'text-slate-400' },
  { id: 'IN_REVIEW', title: '2. Triage & Review', badge: 'text-blue-400' },
  { id: 'IN_PROGRESS', title: '3. Production', badge: 'text-amber-400' },
  { id: 'APPROVAL', title: '4. QA Approval Gate', badge: 'text-pink-400' },
  { id: 'COMPLETED', title: '5. Fulfilled & Closed', badge: 'text-emerald-400' },
];

export const RequestKanban: React.FC<RequestKanbanProps> = ({ requests, onSelectRequest }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('ALL');

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.serviceName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPriority = selectedPriority === 'ALL' || r.priority === selectedPriority;

    return matchesSearch && matchesPriority;
  });

  const getColumnRequests = (colId: string) => {
    if (colId === 'IN_PROGRESS') {
      return filteredRequests.filter((r) => r.status === 'IN_PROGRESS' || r.status === 'ASSIGNED');
    }
    return filteredRequests.filter((r) => r.status === colId);
  };

  return (
    <div className="space-y-4">
      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/[0.03] border border-white/[0.08] light:bg-white light:border-slate-300 light:shadow-sm p-3 rounded-2xl backdrop-blur-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by title, client, or request ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-black/40 light:bg-slate-50 border border-white/[0.08] light:border-slate-300 text-slate-100 light:text-slate-900 text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-[11px] text-slate-400 light:text-slate-600 uppercase font-mono tracking-wider">Priority:</span>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-black/40 light:bg-slate-50 border border-white/[0.08] light:border-slate-300 text-slate-100 light:text-slate-900 text-xs focus:outline-none uppercase font-mono tracking-wider transition"
          >
            <option value="ALL" className="text-slate-900">All Priorities</option>
            <option value="URGENT" className="text-slate-900">URGENT</option>
            <option value="HIGH" className="text-slate-900">HIGH</option>
            <option value="MEDIUM" className="text-slate-900">MEDIUM</option>
            <option value="LOW" className="text-slate-900">LOW</option>
          </select>
        </div>
      </div>

      {/* Kanban Board Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const colReqs = getColumnRequests(col.id);

          return (
            <div
              key={col.id}
              className="rounded-2xl border border-white/[0.08] light:border-slate-300/90 bg-white/[0.02] light:bg-slate-100/70 p-3.5 flex flex-col min-h-[520px] backdrop-blur-xl shadow-xs light:shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-2.5 border-b border-white/[0.08] light:border-slate-300">
                <h4 className="text-[10px] font-bold font-mono text-slate-200 light:text-slate-800 uppercase tracking-widest truncate">
                  {col.title}
                </h4>
                <span className="w-5 h-5 rounded-lg bg-white/[0.05] light:bg-white border border-white/[0.08] light:border-slate-300 text-slate-400 light:text-slate-700 font-mono text-[10px] font-semibold flex items-center justify-center shadow-2xs">
                  {colReqs.length}
                </span>
              </div>

              {/* Cards Container */}
              <div className="space-y-2.5 flex-1 overflow-y-auto">
                {colReqs.map((req) => (
                  <div
                    key={req.id}
                    onClick={() => onSelectRequest(req)}
                    className="bg-white/[0.04] hover:bg-white/[0.08] light:bg-white light:hover:bg-slate-50 border border-white/[0.08] hover:border-indigo-500/40 light:border-slate-300/80 light:hover:border-indigo-300 rounded-xl p-3.5 shadow-sm light:shadow-[0_1px_3px_rgba(0,0,0,0.05)] cursor-pointer transition-all duration-150 space-y-2.5 group"
                  >
                    {/* Top Row: Service & Priority */}
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-[9px] font-bold font-mono text-slate-400 light:text-slate-500 uppercase tracking-widest truncate max-w-[110px]">
                        {req.serviceName}
                      </span>
                      <PriorityBadge priority={req.priority} />
                    </div>

                    {/* Title */}
                    <h5 className="text-xs font-medium text-slate-100 light:text-slate-900 group-hover:text-indigo-300 light:group-hover:text-indigo-600 transition line-clamp-2 leading-snug">
                      {req.title}
                    </h5>

                    {/* Client & Assigned Staff */}
                    <div className="text-[11px] text-slate-400 light:text-slate-600 space-y-1 pt-2 border-t border-white/[0.06] light:border-slate-200">
                      <div className="flex items-center gap-1.5 truncate">
                        <User className="w-3 h-3 text-slate-500 shrink-0" />
                        <span className="text-slate-200 light:text-slate-800 font-medium truncate">{req.customerName}</span>
                      </div>
                      {req.assignedStaffName && (
                        <div className="flex items-center gap-1.5 text-indigo-300 light:text-indigo-700 truncate text-[10px]">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                          <span className="truncate">{req.assignedStaffName}</span>
                        </div>
                      )}
                    </div>

                    {/* Bottom Metadata */}
                    <div className="flex items-center justify-between text-[10px] text-slate-400 light:text-slate-500 pt-1.5 font-mono">
                      <span className="text-slate-400 light:text-slate-600">{req.id}</span>
                      <div className="flex items-center gap-2">
                        {req.documents && req.documents.length > 0 && (
                          <span className="flex items-center gap-1 text-slate-400 light:text-slate-600">
                            <Paperclip className="w-3 h-3" />
                            <span>{req.documents.length}</span>
                          </span>
                        )}
                        <span className="text-slate-400 light:text-slate-600">
                          {req.createdAt ? new Date(req.createdAt).toLocaleDateString([], { month: 'numeric', day: 'numeric' }) : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}

                {colReqs.length === 0 && (
                  <div className="h-32 flex items-center justify-center text-center p-3 text-[10px] font-mono uppercase tracking-widest text-slate-500 light:text-slate-400 border border-dashed border-white/[0.08] light:border-slate-300 rounded-xl">
                    No requests
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
