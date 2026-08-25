import React, { useState } from 'react';
import { SlaPolicy, SlaPriorityConfig, Workflow } from '../../types';
import { ShieldAlert, X, Check, Clock, Zap, Settings, Calendar, BellRing } from 'lucide-react';
import { api } from '../../services/api';

interface SlaPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessId: string;
  workflows: Workflow[];
  policyToEdit?: SlaPolicy | null;
  onSaved: (policy: SlaPolicy) => void;
}

export const SlaPolicyModal: React.FC<SlaPolicyModalProps> = ({
  isOpen,
  onClose,
  businessId,
  workflows,
  policyToEdit,
  onSaved,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(policyToEdit?.name || 'Default Operations SLA');
  const [description, setDescription] = useState(
    policyToEdit?.description || 'Standard multi-tiered operational response and resolution SLA framework'
  );
  const [workflowId, setWorkflowId] = useState<string>(policyToEdit?.workflowId || '');
  const [isActive, setIsActive] = useState(policyToEdit?.isActive ?? true);
  const [isDefault, setIsDefault] = useState(policyToEdit?.isDefault ?? false);

  // Business hours
  const [businessHoursEnabled, setBusinessHoursEnabled] = useState(
    policyToEdit?.businessHours?.enabled ?? false
  );
  const [startHour, setStartHour] = useState(policyToEdit?.businessHours?.startHour ?? '09:00');
  const [endHour, setEndHour] = useState(policyToEdit?.businessHours?.endHour ?? '17:00');
  const [timezone, setTimezone] = useState(policyToEdit?.businessHours?.timezone ?? 'America/New_York');

  // Priority tiers
  const [priorities, setPriorities] = useState<{
    URGENT: SlaPriorityConfig;
    HIGH: SlaPriorityConfig;
    MEDIUM: SlaPriorityConfig;
    LOW: SlaPriorityConfig;
  }>(
    policyToEdit?.priorities || {
      URGENT: { responseTimeMinutes: 15, resolutionTimeMinutes: 240, warningThresholdPercent: 75, escalationThresholdPercent: 90 },
      HIGH: { responseTimeMinutes: 30, resolutionTimeMinutes: 480, warningThresholdPercent: 75, escalationThresholdPercent: 90 },
      MEDIUM: { responseTimeMinutes: 120, resolutionTimeMinutes: 1440, warningThresholdPercent: 80, escalationThresholdPercent: 95 },
      LOW: { responseTimeMinutes: 480, resolutionTimeMinutes: 4320, warningThresholdPercent: 80, escalationThresholdPercent: 95 },
    }
  );

  // Escalation rules
  const [escalationRules, setEscalationRules] = useState(
    policyToEdit?.escalationRules || [
      { trigger: 'WARNING', action: 'NOTIFY_STAFF', targetRole: 'STAFF', message: 'Request SLA is at 75% elapsed threshold' },
      { trigger: 'BREACH', action: 'ESCALATE_OWNER', targetRole: 'OWNER', message: 'SLA target has been breached' },
    ]
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePriorityChange = (
    tier: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW',
    field: keyof SlaPriorityConfig,
    val: number
  ) => {
    setPriorities((prev) => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        [field]: Number(val),
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: Partial<SlaPolicy> = {
        businessId,
        workflowId: workflowId ? workflowId : undefined,
        name,
        description,
        isDefault,
        isActive,
        businessHours: {
          enabled: businessHoursEnabled,
          startHour,
          endHour,
          timezone,
          workDays: [1, 2, 3, 4, 5],
        },
        priorities,
        escalationRules,
      };

      let saved: SlaPolicy;
      if (policyToEdit?.id) {
        saved = await api.updateSlaPolicy(policyToEdit.id, payload);
      } else {
        saved = await api.createSlaPolicy(payload);
      }

      onSaved(saved);
      onClose();
    } catch (err: any) {
      alert(err?.message || 'Failed to save SLA policy');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl rounded-2xl border bg-[#0d0f17] border-white/10 shadow-2xl light:bg-white light:border-slate-300 my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 light:border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-indigo-400 light:text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 light:text-slate-900">
                {policyToEdit ? 'Edit SLA Policy' : 'Create Generic SLA Policy'}
              </h2>
              <p className="text-xs text-slate-400 light:text-slate-500">
                Configure response & resolution thresholds for any workflow or priority tier
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-200 light:hover:bg-slate-100 light:text-slate-500 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 light:text-slate-700">
                Policy Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Enterprise Client SLA"
                className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-slate-100 light:bg-slate-50 light:border-slate-300 light:text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 light:text-slate-700">
                Target Workflow
              </label>
              <select
                value={workflowId}
                onChange={(e) => setWorkflowId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-slate-100 light:bg-slate-50 light:border-slate-300 light:text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="">Global Default (All Workflows)</option>
                {workflows.map((wf) => (
                  <option key={wf.id} value={wf.id}>
                    {wf.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-300 light:text-slate-700">
              Policy Scope / Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Applicable to all premium tier consulting requests"
              className="w-full px-3 py-2 rounded-lg bg-white/[0.05] border border-white/10 text-slate-100 light:bg-slate-50 light:border-slate-300 light:text-slate-900 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Priority Threshold Matrix */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-300 light:text-indigo-700 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                <span>Priority Turnaround Thresholds</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Times in Minutes</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(['URGENT', 'HIGH', 'MEDIUM', 'LOW'] as const).map((tier) => {
                const cfg = priorities[tier];
                const tierColor =
                  tier === 'URGENT'
                    ? 'border-rose-500/40 bg-rose-500/5'
                    : tier === 'HIGH'
                    ? 'border-orange-500/40 bg-orange-500/5'
                    : tier === 'MEDIUM'
                    ? 'border-indigo-500/40 bg-indigo-500/5'
                    : 'border-slate-500/40 bg-slate-500/5';

                return (
                  <div
                    key={tier}
                    className={`p-3 rounded-xl border ${tierColor} space-y-2.5 light:bg-slate-50 light:border-slate-200`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-slate-200 light:text-slate-800">
                        {tier} Priority
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        ≈ {Math.round(cfg.resolutionTimeMinutes / 60)} hrs target
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[9px] font-mono text-slate-400 uppercase">Response (m)</label>
                        <input
                          type="number"
                          min={1}
                          value={cfg.responseTimeMinutes}
                          onChange={(e) =>
                            handlePriorityChange(tier, 'responseTimeMinutes', Number(e.target.value))
                          }
                          className="w-full px-2 py-1 rounded bg-black/40 border border-white/10 text-xs font-mono text-slate-100 light:bg-white light:border-slate-300 light:text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-mono text-slate-400 uppercase">Resolution (m)</label>
                        <input
                          type="number"
                          min={5}
                          value={cfg.resolutionTimeMinutes}
                          onChange={(e) =>
                            handlePriorityChange(tier, 'resolutionTimeMinutes', Number(e.target.value))
                          }
                          className="w-full px-2 py-1 rounded bg-black/40 border border-white/10 text-xs font-mono text-slate-100 light:bg-white light:border-slate-300 light:text-slate-900"
                        />
                      </div>

                      <div>
                        <label className="text-[9px] font-mono text-slate-400 uppercase">Warning %</label>
                        <input
                          type="number"
                          min={10}
                          max={99}
                          value={cfg.warningThresholdPercent}
                          onChange={(e) =>
                            handlePriorityChange(tier, 'warningThresholdPercent', Number(e.target.value))
                          }
                          className="w-full px-2 py-1 rounded bg-black/40 border border-white/10 text-xs font-mono text-slate-100 light:bg-white light:border-slate-300 light:text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Business Hours Settings */}
          <div className="p-3.5 rounded-xl border border-white/10 bg-white/[0.02] light:bg-slate-50 light:border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold text-slate-200 light:text-slate-800">
                  Business Hours Calculation
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={businessHoursEnabled}
                  onChange={(e) => setBusinessHoursEnabled(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-mono text-slate-300 light:text-slate-700">
                  Exclude Nights & Weekends
                </span>
              </label>
            </div>

            {businessHoursEnabled && (
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/[0.06] light:border-slate-200">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Start Hour</label>
                  <input
                    type="time"
                    value={startHour}
                    onChange={(e) => setStartHour(e.target.value)}
                    className="w-full px-2 py-1.5 rounded bg-black/40 border border-white/10 text-xs font-mono text-slate-100 light:bg-white light:border-slate-300 light:text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase">End Hour</label>
                  <input
                    type="time"
                    value={endHour}
                    onChange={(e) => setEndHour(e.target.value)}
                    className="w-full px-2 py-1.5 rounded bg-black/40 border border-white/10 text-xs font-mono text-slate-100 light:bg-white light:border-slate-300 light:text-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-2 py-1.5 rounded bg-black/40 border border-white/10 text-xs font-mono text-slate-100 light:bg-white light:border-slate-300 light:text-slate-900"
                  >
                    <option value="America/New_York">Eastern (ET)</option>
                    <option value="America/Chicago">Central (CT)</option>
                    <option value="America/Denver">Mountain (MT)</option>
                    <option value="America/Los_Angeles">Pacific (PT)</option>
                    <option value="UTC">UTC Universal</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10 light:border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white light:text-slate-600 light:hover:text-slate-900 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Saving...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Save SLA Policy</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
