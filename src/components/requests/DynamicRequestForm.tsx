import React, { useState } from 'react';
import { Workflow, ServiceOffering } from '../../types';
import { useWorkflow } from '../../context/WorkflowContext';
import {
  Send,
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Layers,
} from 'lucide-react';

interface DynamicRequestFormProps {
  workflow: Workflow;
  selectedService: ServiceOffering;
  onSuccess?: () => void;
}

export const DynamicRequestForm: React.FC<DynamicRequestFormProps> = ({
  workflow,
  selectedService,
  onSuccess,
}) => {
  const { createCustomerRequest } = useWorkflow();

  const [title, setTitle] = useState(`${selectedService.name} - Project`);
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [customFields, setCustomFields] = useState<Record<string, any>>({});
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleFieldChange = (fieldName: string, value: any) => {
    setCustomFields((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setUploadedFiles((prev) => [
        ...prev,
        { name: file.name, size: `${sizeMb} MB` },
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!title.trim()) {
      setErrorMsg('Please specify a title for this request.');
      return;
    }

    // Validate required fields
    for (const field of workflow.requiredFields) {
      if (field.required && !customFields[field.name]) {
        setErrorMsg(`Please fill in required field: "${field.label}"`);
        return;
      }
    }

    setIsSubmitting(true);

    try {
      await createCustomerRequest({
        workflowId: workflow.id,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        title,
        description,
        priority,
        dueDate: dueDate || undefined,
        customData: customFields,
        documents: uploadedFiles.map((f, idx) => ({
          id: `doc_up_${Date.now()}_${idx}`,
          requestId: '',
          name: f.name,
          size: f.size,
          type: f.name.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream',
          uploadedBy: 'Customer User',
          uploaderRole: 'CUSTOMER',
          url: '#',
          timestamp: new Date().toISOString(),
        })),
      });

      setSuccessMsg('Request submitted successfully! Staff has been notified.');
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1000);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 rounded-3xl border backdrop-blur-2xl transition-all duration-200 bg-white/[0.03] border-white/[0.08] shadow-xl light:bg-white light:border-slate-200 space-y-6">
      {/* Service Header Info */}
      <div className="p-4 rounded-2xl border backdrop-blur-md bg-indigo-500/10 border-indigo-500/30 light:bg-indigo-50 light:border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[9px] font-bold font-mono uppercase tracking-widest text-indigo-400 light:text-indigo-600">
            Selected Service Offering
          </div>
          <h3 className="text-base font-serif italic font-semibold text-slate-100 light:text-slate-900 mt-0.5">{selectedService.name}</h3>
          <p className="text-xs text-slate-400 light:text-slate-600 mt-0.5">{selectedService.description}</p>
        </div>

        <div className="flex items-center gap-3 text-xs shrink-0 font-mono">
          <div className="bg-black/40 light:bg-white px-3 py-1.5 rounded-xl border border-white/[0.08] light:border-slate-200">
            <span className="text-slate-400 light:text-slate-500">Target SLA:</span>{' '}
            <span className="text-slate-100 light:text-slate-900 font-semibold">{selectedService.estimatedTurnaround}</span>
          </div>
          {selectedService.priceEstimate && (
            <div className="bg-indigo-500/20 light:bg-indigo-100 px-3 py-1.5 rounded-xl border border-indigo-500/30 text-indigo-300 light:text-indigo-800 font-bold">
              {selectedService.priceEstimate}
            </div>
          )}
        </div>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Core Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
            Request Title / Project Subject <span className="text-indigo-400">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] light:bg-slate-50 border border-white/[0.08] light:border-slate-200 text-slate-100 light:text-slate-900 text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">Priority Tier</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as any)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] light:bg-slate-50 border border-white/[0.08] light:border-slate-200 text-slate-100 light:text-slate-900 text-xs focus:outline-none focus:border-indigo-500 uppercase tracking-wider font-mono transition"
          >
            <option value="LOW" className="text-slate-900">LOW (Standard)</option>
            <option value="MEDIUM" className="text-slate-900">MEDIUM (Normal)</option>
            <option value="HIGH" className="text-slate-900">HIGH (Expedited)</option>
            <option value="URGENT" className="text-slate-900">URGENT (Critical 24h)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">Target Completion Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] light:bg-slate-50 border border-white/[0.08] light:border-slate-200 text-slate-100 light:text-slate-900 text-xs focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Dynamically Generated Custom Fields from Workflow Schema */}
      <div className="pt-4 border-t border-white/[0.08] light:border-slate-200 space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <h4 className="text-[10px] font-mono font-bold text-slate-300 light:text-slate-700 uppercase tracking-widest">
            Workflow Required Specifications ({workflow.requiredFields.length})
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workflow.requiredFields.map((field) => {
            const val = customFields[field.name] || '';

            return (
              <div
                key={field.id}
                className={field.type === 'textarea' ? 'md:col-span-2' : undefined}
              >
                <label className="block text-xs font-semibold text-slate-300 light:text-slate-700 mb-1.5">
                  {field.label} {field.required && <span className="text-indigo-400">*</span>}
                </label>

                {field.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    value={val}
                    placeholder={field.placeholder || ''}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    required={field.required}
                    className="w-full px-3.5 py-2 rounded-xl bg-white/[0.04] light:bg-slate-50 border border-white/[0.08] light:border-slate-200 text-slate-100 light:text-slate-900 text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed font-sans transition"
                  />
                ) : field.type === 'select' ? (
                  <select
                    value={val}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    required={field.required}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] light:bg-slate-50 border border-white/[0.08] light:border-slate-200 text-slate-100 light:text-slate-900 text-xs focus:outline-none focus:border-indigo-500 transition"
                  >
                    <option value="" className="text-slate-900">-- Select an option --</option>
                    {field.options?.map((opt, i) => (
                      <option key={i} value={opt} className="text-slate-900">
                        {opt}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'date' ? (
                  <input
                    type="date"
                    value={val}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    required={field.required}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] light:bg-slate-50 border border-white/[0.08] light:border-slate-200 text-slate-100 light:text-slate-900 text-xs focus:outline-none focus:border-indigo-500 transition"
                  />
                ) : field.type === 'number' ? (
                  <input
                    type="number"
                    value={val}
                    placeholder={field.placeholder || ''}
                    onChange={(e) => handleFieldChange(field.name, Number(e.target.value))}
                    required={field.required}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] light:bg-slate-50 border border-white/[0.08] light:border-slate-200 text-slate-100 light:text-slate-900 text-xs focus:outline-none focus:border-indigo-500 transition"
                  />
                ) : (
                  <input
                    type="text"
                    value={val}
                    placeholder={field.placeholder || ''}
                    onChange={(e) => handleFieldChange(field.name, e.target.value)}
                    required={field.required}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.04] light:bg-slate-50 border border-white/[0.08] light:border-slate-200 text-slate-100 light:text-slate-900 text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Support Files Upload */}
      <div className="pt-4 border-t border-white/[0.08] light:border-slate-200 space-y-2">
        <label className="block text-xs font-semibold text-slate-300 light:text-slate-700">
          Supporting Documents & Assets (Optional)
        </label>
        <div className="border border-dashed border-white/[0.15] hover:border-indigo-500/50 light:border-slate-300 light:hover:border-indigo-400 rounded-2xl p-6 text-center transition cursor-pointer bg-white/[0.02] light:bg-slate-50 relative">
          <input
            type="file"
            onChange={handleFileUpload}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
          <UploadCloud className="w-6 h-6 text-indigo-400 mx-auto mb-1.5" />
          <p className="text-xs font-medium text-slate-200 light:text-slate-800">
            Click to upload or drag & drop files here
          </p>
          <p className="text-[11px] text-slate-400 light:text-slate-500 font-mono mt-0.5">PDF, PNG, JPG, FIG, DOCX up to 25MB</p>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {uploadedFiles.map((f, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] light:bg-slate-100 light:border-slate-200 text-xs text-slate-200 light:text-slate-800"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-medium">{f.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">({f.size})</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t border-white/[0.08] light:border-slate-200 flex items-center justify-end">
        <button
          id="btn-submit-dynamic-request"
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-bold uppercase tracking-wider transition flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-500/20 border border-white/20"
        >
          {isSubmitting ? (
            <span>Processing Ingestion...</span>
          ) : (
            <>
              <Send className="w-4 h-4 text-white" />
              <span>Submit Request</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};
