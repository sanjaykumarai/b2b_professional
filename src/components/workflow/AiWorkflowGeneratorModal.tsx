import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWorkflow } from '../../context/WorkflowContext';
import { AiGeneratedWorkflowPayload } from '../../types';
import {
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
} from 'lucide-react';

const PRESET_EXAMPLES = [
  {
    title: 'Digital Marketing Agency',
    industry: 'Digital Marketing & Advertising',
    prompt:
      'Customers submit marketing requests. Staff reviews briefs, assigns creative specialists, uploads deliverables and updates progress. The business owner must approve completed deliverables before final client delivery.',
  },
  {
    title: 'Professional Training Institute',
    industry: 'Education & Certification',
    prompt:
      'Students submit requests for official course certificates, fee installments, and faculty doubt sessions. Academic registrar reviews eligibility, instructors prepare documents, and the Dean authorizes certificate release.',
  },
  {
    title: 'Corporate Legal Advisory',
    industry: 'Legal Services & Compliance',
    prompt:
      'Clients submit contract review and compliance audit matters. Staff clears conflicts, assigns associate attorneys to redline drafts, and the Senior Partner signs off before opinion release.',
  },
  {
    title: 'Outpatient Medical Clinic',
    industry: 'Healthcare & Clinical Care',
    prompt:
      'Patients submit intake questionnaires and symptom reports. Triage nurse verifies vitals, attending physician prepares diagnostic plan, and Medical Director approves discharge regimen.',
  },
  {
    title: 'Architecture & Design Studio',
    industry: 'Architecture & Construction',
    prompt:
      'Clients submit architectural floorplan and 3D modeling requests. Lead draftsman produces CAD schematics, and Principal Architect reviews structural specifications and signs off.',
  },
];

export const AiWorkflowGeneratorModal: React.FC = () => {
  const { currentBusiness } = useAuth();
  const {
    isAiGeneratorModalOpen,
    setIsAiGeneratorModalOpen,
    generateWorkflowFromPrompt,
    saveAndActivateGeneratedWorkflow,
    isAiGenerating,
  } = useWorkflow();

  const [industry, setIndustry] = useState(currentBusiness?.industry || 'Custom Business');
  const [requirements, setRequirements] = useState(
    'Customers should submit service requests with deadline and scope. Staff should review, assign specialists, and upload work deliverables. The owner should review and approve before completion.'
  );
  const [generatedPayload, setGeneratedPayload] = useState<AiGeneratedWorkflowPayload | null>(null);
  const [activeTab, setActiveTab] = useState<'prompt' | 'preview'>('prompt');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAiGeneratorModalOpen) return null;

  const handleGenerate = async () => {
    if (!requirements.trim()) {
      setErrorMsg('Please describe your business requirements.');
      return;
    }
    setErrorMsg('');
    try {
      const payload = await generateWorkflowFromPrompt({
        businessName: currentBusiness?.name || 'Enterprise Operations',
        industry,
        requirements,
      });
      setGeneratedPayload(payload);
      setActiveTab('preview');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to generate workflow.');
    }
  };

  const handleActivate = async () => {
    if (!generatedPayload || !currentBusiness) return;
    setIsSaving(true);
    try {
      await saveAndActivateGeneratedWorkflow(generatedPayload, currentBusiness.id);
      setIsAiGeneratorModalOpen(false);
      setGeneratedPayload(null);
      setActiveTab('prompt');
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to activate workflow.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl rounded-3xl backdrop-blur-2xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-200 bg-[#0A0C10]/95 border-white/[0.12] text-slate-100 light:bg-white/95 light:border-slate-200 light:text-slate-900">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] light:border-slate-200 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 border border-white/20 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-100 light:text-slate-900 font-serif italic">AI Workflow Generation Engine</h3>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded-md bg-indigo-500/20 text-indigo-300 light:bg-indigo-50 light:text-indigo-700 border border-indigo-500/30">
                  Gemini Flash
                </span>
              </div>
              <p className="text-xs text-slate-400 light:text-slate-600">
                Describe ANY business process in natural language to generate an executable multi-role SaaS workflow.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsAiGeneratorModalOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white light:hover:text-slate-900 hover:bg-white/[0.06] light:hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher if payload exists */}
        {generatedPayload && (
          <div className="px-6 py-2 border-b border-white/[0.06] light:border-slate-200 bg-black/20 light:bg-slate-50 flex items-center gap-2">
            <button
              onClick={() => setActiveTab('prompt')}
              className={`px-3.5 py-1 text-xs font-semibold rounded-lg transition ${
                activeTab === 'prompt'
                  ? 'bg-white/[0.1] text-white light:bg-slate-200 light:text-slate-900'
                  : 'text-slate-400 hover:text-slate-200 light:text-slate-600'
              }`}
            >
              1. Requirements Prompt
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3.5 py-1 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 ${
                activeTab === 'preview'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 light:text-slate-600'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>2. Generated Schema Preview</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {activeTab === 'prompt' ? (
            <div className="space-y-4">
              {/* Quick Template Presets */}
              <div>
                <label className="block text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 light:text-slate-600 mb-2">
                  Select Quick Industry Preset (or type custom below):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {PRESET_EXAMPLES.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setIndustry(preset.industry);
                        setRequirements(preset.prompt);
                      }}
                      className="text-left p-3 rounded-xl border backdrop-blur-md transition-all group bg-white/[0.03] border-white/[0.08] hover:border-indigo-500/40 hover:bg-white/[0.06] light:bg-slate-50 light:border-slate-200 light:hover:border-indigo-300"
                    >
                      <div className="font-semibold text-xs text-slate-200 light:text-slate-800 group-hover:text-indigo-300 light:group-hover:text-indigo-600 flex items-center justify-between">
                        <span>{preset.title}</span>
                        <Zap className="w-3 h-3 text-amber-400 opacity-0 group-hover:opacity-100 transition" />
                      </div>
                      <div className="text-[10px] text-slate-400 light:text-slate-500 truncate mt-0.5 font-mono">
                        {preset.industry}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Industry / Business Domain */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                  Industry / Business Type (Not restricted to predefined templates):
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="e.g. Biotech Laboratory, Architecture Studio, Hotel Concierge, Legal Firm..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] light:bg-slate-50 border border-white/[0.08] light:border-slate-200 text-slate-100 light:text-slate-900 text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Natural Language Requirements */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1">
                  Describe the Operational Workflow in Plain English:
                </label>
                <textarea
                  rows={5}
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="Explain who submits requests, who reviews, which staff gets assigned, what documents/deliverables are produced, and who gives final approval..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] light:bg-slate-50 border border-white/[0.08] light:border-slate-200 text-slate-100 light:text-slate-900 text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-mono"
                />
              </div>
            </div>
          ) : (
            /* Generated Schema Preview Tab */
            generatedPayload && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl border backdrop-blur-md bg-indigo-500/10 border-indigo-500/30 light:bg-indigo-50 light:border-indigo-200">
                  <h4 className="text-sm font-bold text-slate-100 light:text-slate-900 flex items-center gap-2 font-serif italic">
                    <Sparkles className="w-4 h-4 text-indigo-400" />
                    <span>{generatedPayload.workflow_name}</span>
                  </h4>
                  <p className="text-xs text-slate-300 light:text-slate-700 mt-1">{generatedPayload.description}</p>
                </div>

                {/* Services Catalog */}
                <div>
                  <h5 className="text-xs font-mono font-bold text-slate-300 light:text-slate-700 uppercase tracking-wider mb-2">
                    Generated Service Offerings ({generatedPayload.services.length})
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {generatedPayload.services.map((srv, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl border backdrop-blur-md bg-white/[0.03] border-white/[0.08] light:bg-slate-50 light:border-slate-200 text-xs space-y-1"
                      >
                        <div className="font-bold text-slate-100 light:text-slate-900 flex items-center justify-between">
                          <span>{srv.name}</span>
                          <span className="text-[10px] text-emerald-400 light:text-emerald-700 font-semibold font-mono">
                            {srv.price_estimate || 'Standard'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 light:text-slate-600">{srv.description}</p>
                        <div className="text-[10px] text-indigo-300 light:text-indigo-700 font-medium font-mono">
                          Turnaround SLA: {srv.turnaround_time}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Workflow Steps */}
                <div>
                  <h5 className="text-xs font-mono font-bold text-slate-300 light:text-slate-700 uppercase tracking-wider mb-2">
                    Lifecycle Execution Pipeline ({generatedPayload.workflow_steps.length} Steps)
                  </h5>
                  <div className="space-y-2">
                    {generatedPayload.workflow_steps.map((st, i) => (
                      <div
                        key={i}
                        className="p-3.5 rounded-xl border backdrop-blur-md bg-white/[0.03] border-white/[0.08] light:bg-slate-50 light:border-slate-200 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-300 light:bg-indigo-100 light:text-indigo-700 font-bold flex items-center justify-center text-[11px] font-mono">
                            {i + 1}
                          </span>
                          <div>
                            <div className="font-bold text-slate-100 light:text-slate-900">{st.title}</div>
                            <div className="text-[11px] text-slate-400 light:text-slate-600">{st.description}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-right shrink-0 font-mono">
                          <span className="px-2 py-0.5 rounded bg-black/40 text-[10px] text-slate-300 light:bg-slate-200 light:text-slate-700 font-semibold">
                            Role: {st.responsible_role}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 light:bg-indigo-100 light:text-indigo-800 text-[10px] font-semibold border border-indigo-500/30">
                            {st.sla_hours}h SLA
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Required Fields */}
                <div>
                  <h5 className="text-xs font-mono font-bold text-slate-300 light:text-slate-700 uppercase tracking-wider mb-2">
                    Dynamic Customer Input Fields ({generatedPayload.required_fields.length})
                  </h5>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {generatedPayload.required_fields.map((f, i) => (
                      <div
                        key={i}
                        className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] light:bg-slate-50 light:border-slate-200 text-[11px]"
                      >
                        <div className="font-semibold text-slate-200 light:text-slate-800 truncate">{f.label}</div>
                        <div className="text-[10px] text-slate-400 light:text-slate-500 mt-0.5 flex items-center justify-between font-mono">
                          <span>{f.type}</span>
                          <span className={f.required ? 'text-amber-400 light:text-amber-600 font-semibold' : 'text-slate-500'}>
                            {f.required ? 'Required' : 'Optional'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/[0.08] light:border-slate-200 bg-black/20 light:bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => setIsAiGeneratorModalOpen(false)}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white light:text-slate-600 light:hover:text-slate-900 transition"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            {activeTab === 'prompt' ? (
              <button
                id="btn-generate-ai-workflow"
                onClick={handleGenerate}
                disabled={isAiGenerating}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-500/20 transition flex items-center gap-2 disabled:opacity-50 border border-white/20"
              >
                {isAiGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                    <span>Synthesizing Workflow...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-white" />
                    <span>Generate Structured Workflow</span>
                  </>
                )}
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('prompt')}
                  className="px-4 py-2 rounded-xl text-xs font-medium bg-white/[0.06] text-slate-300 hover:bg-white/[0.12] light:bg-slate-200 light:text-slate-800 transition"
                >
                  Edit Prompt
                </button>
                <button
                  id="btn-activate-ai-workflow"
                  onClick={handleActivate}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Activating Workflow...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Activate & Deploy Workflow</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
