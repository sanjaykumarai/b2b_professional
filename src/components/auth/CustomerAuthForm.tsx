import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, ArrowRight, Building2, Mail, User as UserIcon, Lock, CheckCircle2, ShoppingBag } from 'lucide-react';

export const CustomerAuthForm: React.FC<{ mode: 'login' | 'signup'; onToggleMode: () => void }> = ({
  mode,
  onToggleMode,
}) => {
  const { login, signup, allBusinesses, isLoading } = useAuth();

  // Login state
  const [loginEmail, setLoginEmail] = useState('customer@acme.corp');
  const [loginPassword, setLoginPassword] = useState('••••••••');
  const [selectedBizId, setSelectedBizId] = useState(allBusinesses[0]?.id || '');

  // Signup state
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPassword, setCustomerPassword] = useState('');
  const [providerBizId, setProviderBizId] = useState(allBusinesses[0]?.id || '');
  const [companyName, setCompanyName] = useState('Acme Growth Labs');
  const [customerTitle, setCustomerTitle] = useState('VP of Operations');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!loginEmail.trim()) {
      setErrorMsg('Please enter your client email address');
      return;
    }

    const res = await login({
      email: loginEmail.trim(),
      password: loginPassword,
      role: 'CUSTOMER',
      businessId: selectedBizId || undefined,
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to sign in to client portal');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!customerName.trim() || !customerEmail.trim() || !providerBizId) {
      setErrorMsg('Please provide your name, email, and select your service provider organization');
      return;
    }

    const res = await signup({
      role: 'CUSTOMER',
      name: customerName.trim(),
      email: customerEmail.trim(),
      password: customerPassword,
      businessId: providerBizId,
      companyName: companyName.trim(),
      title: customerTitle.trim(),
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to create client account');
    } else {
      setSuccessMsg('Client account created. Entering service catalog...');
    }
  };

  return (
    <div id="customer-auth-container" className="w-full">
      <div className="mb-6 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
          <Users className="w-3.5 h-3.5" />
          Client Intake & Service Fulfillment Portal
        </div>
        <h2 className="text-xl sm:text-2xl font-serif text-slate-100 font-semibold tracking-tight">
          {mode === 'login' ? 'Sign In to Client Portal' : 'Register New Client Profile'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {mode === 'login'
            ? 'Submit service briefs, track milestone progress in real-time, communicate with assigned specialists, and review deliverables.'
            : 'Create your client profile to request services, access dedicated workflows, and track deliverables.'}
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
              Service Provider Organization
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedBizId}
                onChange={(e) => setSelectedBizId(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/70 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
              >
                <option value="">Auto-Detect from Account</option>
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
              Client / Account Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="e.g. customer@acme.corp"
                className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/70 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <span className="text-xs text-amber-400 hover:underline cursor-pointer">
                Reset password
              </span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/70 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 transition-all disabled:opacity-50 mt-2"
          >
            {isLoading ? 'Signing in...' : 'Sign In to Client Portal'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignup} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Client Full Name *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Elena Rostova"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/70 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="e.g. elena@lumina.io"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/70 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Select Service Provider Organization *
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={providerBizId}
                onChange={(e) => setProviderBizId(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/70 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
              >
                {allBusinesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.industry})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Client Company / Org
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Corp / Lumina"
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/70 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Role / Title
              </label>
              <input
                type="text"
                value={customerTitle}
                onChange={(e) => setCustomerTitle(e.target.value)}
                placeholder="e.g. Brand Director / Client"
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/70 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                value={customerPassword}
                onChange={(e) => setCustomerPassword(e.target.value)}
                placeholder="Create secure client password"
                className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/70 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-900/30 transition-all disabled:opacity-50 mt-2"
          >
            {isLoading ? 'Creating Client Profile...' : 'Register Client Account & Sign In'}
            <ShoppingBag className="w-4 h-4 text-amber-200" />
          </button>
        </form>
      )}

      <div className="mt-6 pt-4 border-t border-slate-800 text-center">
        <button
          type="button"
          onClick={onToggleMode}
          className="text-xs text-slate-400 hover:text-amber-300 transition-colors"
        >
          {mode === 'login' ? (
            <span>
              New client seeking services?{' '}
              <strong className="text-amber-400 font-semibold underline underline-offset-2">
                Create new client account
              </strong>
            </span>
          ) : (
            <span>
              Already have a client login?{' '}
              <strong className="text-amber-400 font-semibold underline underline-offset-2">
                Sign in to existing client account
              </strong>
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
