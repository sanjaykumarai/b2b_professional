import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWorkflow } from '../../context/WorkflowContext';
import { api } from '../../services/api';
import {
  Building2,
  Sparkles,
  X,
  AlertCircle,
  RefreshCw,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BusinessOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TEMPLATES = [
  {
    name: 'Omni Logistics Freight',
    industry: 'Freight & Supply Chain Logistics',
    description: 'B2B international cargo shipping, customs clearing, and multimodal transport.',
    requirements:
      'Shippers submit freight booking requests with cargo volume and destination. Freight forwarding staff reviews manifests and assigns customs brokers. Operations manager approves release before cargo dispatch.',
  },
  {
    name: 'Vanguard Legal Advisors',
    industry: 'Corporate Law & Compliance',
    description: 'Contract review, merger diligence, and intellectual property audits.',
    requirements:
      'Corporate clients submit NDA reviews and contract drafts. Staff paralegal clears conflicts, associate attorney redlines document, and Senior Partner signs off on legal opinion.',
  },
  {
    name: 'Nexus Outpatient Clinic',
    industry: 'Healthcare & Specialized Medicine',
    description: 'Specialty medical consultations, diagnostic scheduling, and patient intake.',
    requirements:
      'Patients submit intake symptoms and history. Triage nurse verifies vitals, specialist physician creates treatment protocol, and Medical Director approves discharge plan.',
  },
];

export const BusinessOnboardingModal: React.FC<BusinessOnboardingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { refreshUsersAndBusinesses, switchBusiness } = useAuth();
  const { generateWorkflowFromPrompt, saveAndActivateGeneratedWorkflow } = useWorkflow();

  const [bizName, setBizName] = useState('');
  const [industry, setIndustry] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSelectTemplate = (tpl: typeof TEMPLATES[0]) => {
    setBizName(tpl.name);
    setIndustry(tpl.industry);
    setDescription(tpl.description);
    setRequirements(tpl.requirements);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizName.trim() || !industry.trim() || !requirements.trim()) {
      setErrorMsg('Please fill in business name, industry, and requirements.');
      return;
    }

    setErrorMsg('');
    setIsProcessing(true);

    try {
      // 1. Create Business
      const newBiz = await api.createBusiness({
        name: bizName,
        industry,
        description: description || `${bizName} operations on OmniFlow.`,
      });

      // 2. Generate Workflow using AI
      const payload = await generateWorkflowFromPrompt({
        businessName: newBiz.name,
        industry: newBiz.industry,
        description: newBiz.description,
        requirements,
      });

      // 3. Save & Activate Workflow
      await saveAndActivateGeneratedWorkflow(payload, newBiz.id);

      // 4. Refresh & Switch to new business
      await refreshUsersAndBusinesses();
      switchBusiness(newBiz.id);

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
        });
      } catch (_) {}

      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to onboard business.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-3xl rounded-3xl backdrop-blur-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-200 bg-[#0A0C10]/95 border-white/[0.12] text-slate-100 light:bg-white/95 light:border-slate-200 light:text-slate-900">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] light:border-slate-200 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 border border-white/20 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-serif italic font-semibold text-slate-100 light:text-slate-900">Onboard New Business Workspace</h3>
              <p className="text-xs text-slate-400 light:text-slate-600">
                Instantly provision a multi-tenant workspace with an AI-generated custom workflow.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white light:hover:text-slate-900 hover:bg-white/[0.06] light:hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Preset Buttons */}
          <div>
            <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 light:text-slate-600 mb-2">
              1-Click Industry Templates:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {TEMPLATES.map((t, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleSelectTemplate(t)}
                  className="p-3 rounded-2xl border backdrop-blur-md transition-all text-left group bg-white/[0.03] border-white/[0.08] hover:border-indigo-500/40 hover:bg-white/[0.06] light:bg-slate-50 light:border-slate-200 light:hover:border-indigo-300"
                >
                  <div className="font-semibold text-xs text-slate-200 light:text-slate-800 group-hover:text-indigo-300 light:group-hover:text-indigo-600 flex items-center justify-between">
                    <span>{t.name}</span>
                    <Zap className="w-3.5 h-3.5 text-amber-400 opacity-0 group-hover:opacity-100 transition" />
                  </div>
                  <div className="text-[10px] text-slate-400 light:text-slate-500 truncate mt-0.5 font-mono">{t.industry}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
                Business Name <span className="text-indigo-400">*</span>
              </label>
              <input
                type="text"
                value={bizName}
                onChange={(e) => setBizName(e.target.value)}
                placeholder="e.g. Apex Global Consulting"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] light:bg-slate-50 border border-white/[0.08] light:border-slate-200 text-slate-100 light:text-slate-900 text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
                Industry Domain <span className="text-indigo-400">*</span>
              </label>
              <input
                type="text"
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                placeholder="e.g. Environmental Engineering, Veterinary, etc."
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] light:bg-slate-50 border border-white/[0.08] light:border-slate-200 text-slate-100 light:text-slate-900 text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
                Business Description (Optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of business operations..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] light:bg-slate-50 border border-white/[0.08] light:border-slate-200 text-slate-100 light:text-slate-900 text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
                Describe Workflow Requirements <span className="text-indigo-400">*</span>
              </label>
              <textarea
                rows={4}
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                placeholder="Describe how customers place orders, how staff processes them, what deliverables are uploaded, and who approves..."
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] light:bg-slate-50 border border-white/[0.08] light:border-slate-200 text-slate-100 light:text-slate-900 text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono leading-relaxed transition"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-white/[0.08] light:border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white light:text-slate-600 light:hover:text-slate-900 transition"
            >
              Cancel
            </button>

            <button
              id="btn-submit-onboard-business"
              type="submit"
              disabled={isProcessing}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-500/20 border border-white/20"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Synthesizing Workflow & Provisioning...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Provision Business & Activate Workflow</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
