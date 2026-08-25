import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { ShieldCheck, ArrowRight, Sparkles, Building2, KeyRound, Mail, User as UserIcon, Lock, CheckCircle2 } from 'lucide-react';

export const OwnerAuthForm: React.FC<{ mode: 'login' | 'signup'; onToggleMode: () => void }> = ({
  mode,
  onToggleMode,
}) => {
  const { login, signup, allBusinesses, isLoading } = useAuth();

  // Login form state
  const [loginEmail, setLoginEmail] = useState('owner@nova.marketing');
  const [loginPassword, setLoginPassword] = useState('••••••••');
  const [selectedBizId, setSelectedBizId] = useState(allBusinesses[0]?.id || '');

  // Signup form state
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('Digital Marketing & Creative');
  const [description, setDescription] = useState('');
  const [jobTitle, setJobTitle] = useState('Founder & Managing Director');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!loginEmail.trim()) {
      setErrorMsg('Please enter your executive email address');
      return;
    }

    const res = await login({
      email: loginEmail.trim(),
      password: loginPassword,
      role: 'OWNER',
      businessId: selectedBizId || undefined,
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to sign in');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!ownerName.trim() || !ownerEmail.trim() || !businessName.trim()) {
      setErrorMsg('Please provide your name, email, and company organization name');
      return;
    }

    const res = await signup({
      role: 'OWNER',
      name: ownerName.trim(),
      email: ownerEmail.trim(),
      password: ownerPassword,
      businessName: businessName.trim(),
      industry: industry.trim(),
      businessDescription: description.trim(),
      title: jobTitle.trim(),
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to launch organization workspace');
    } else {
      setSuccessMsg('Enterprise workspace established. Entering dashboard...');
    }
  };

  const industryOptions = [
    'Digital Marketing & Creative Services',
    'Legal Advisory & Corporate Compliance',
    'Healthcare Diagnostics & Outpatient Clinic',
    'Supply Chain & Freight Logistics',
    'Professional Education & Academy',
    'Financial Advisory & Tax Auditing',
    'Software Engineering & Cloud Ops',
    'Architecture & Engineering Consulting',
  ];

  return (
    <div id="owner-auth-container" className="w-full">
      <div className="mb-6 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
          <ShieldCheck className="w-3.5 h-3.5" />
          Executive Governance & Workspace Administration
        </div>
        <h2 className="text-xl sm:text-2xl font-serif text-slate-100 font-semibold tracking-tight">
          {mode === 'login' ? 'Sign In to Owner Workspace' : 'Launch New Business Organization'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {mode === 'login'
            ? 'Access your full multi-tenant portal, workflow blueprints, team assignments, and executive reports.'
            : 'Register your enterprise, auto-provision domain workflows, and set up your multi-tenant operations.'}
        </p>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <span className="font-semibold">Error:</span> {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {mode === 'login' ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Select Business Organization (Optional)
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedBizId}
                onChange={(e) => setSelectedBizId(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/70 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                <option value="">Auto-Detect from Email</option>
                {allBusinesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.industry})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Owner / Admin Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="e.g. owner@company.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/70 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <span className="text-xs text-indigo-400 hover:underline cursor-pointer">
                Forgot password?
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/70 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/30 transition-all disabled:opacity-50 mt-2"
          >
            {isLoading ? 'Signing in...' : 'Sign In to Owner Portal'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignup} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Executive Full Name *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="e.g. Sarah Sterling"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/70 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Executive Work Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  placeholder="e.g. sarah@mybrand.com"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/70 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Organization / Company Name *
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="e.g. Quantum Legal Advisory"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/70 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Industry Sector *
              </label>
              <select
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/70 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {industryOptions.map((ind) => (
                  <option key={ind} value={ind}>
                    {ind}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="password"
                  required
                  value={ownerPassword}
                  onChange={(e) => setOwnerPassword(e.target.value)}
                  placeholder="Create secure password"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/70 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Title / Designation
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Chief Executive Officer"
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/70 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Operational Focus / Overview
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe services offered, client deliverables, and fulfillment standards..."
              className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/70 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/30 transition-all disabled:opacity-50 mt-2"
          >
            {isLoading ? 'Synthesizing Enterprise Workspace...' : 'Launch Workspace & Sign In'}
            <Sparkles className="w-4 h-4 text-indigo-200" />
          </button>
        </form>
      )}

      <div className="mt-6 pt-4 border-t border-slate-800 text-center">
        <button
          type="button"
          onClick={onToggleMode}
          className="text-xs text-slate-400 hover:text-indigo-300 transition-colors"
        >
          {mode === 'login' ? (
            <span>
              Don't have an enterprise workspace?{' '}
              <strong className="text-indigo-400 font-semibold underline underline-offset-2">
                Register new business organization
              </strong>
            </span>
          ) : (
            <span>
              Already registered as an owner?{' '}
              <strong className="text-indigo-400 font-semibold underline underline-offset-2">
                Sign in to existing workspace
              </strong>
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
