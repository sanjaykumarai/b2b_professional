import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Briefcase, ArrowRight, Building2, Mail, User as UserIcon, Lock, CheckCircle2, UserCheck } from 'lucide-react';

export const StaffAuthForm: React.FC<{ mode: 'login' | 'signup'; onToggleMode: () => void }> = ({
  mode,
  onToggleMode,
}) => {
  const { login, signup, allBusinesses, isLoading } = useAuth();

  // Login state
  const [loginEmail, setLoginEmail] = useState('staff@nova.marketing');
  const [loginPassword, setLoginPassword] = useState('••••••••');
  const [selectedBizId, setSelectedBizId] = useState(allBusinesses[0]?.id || '');

  // Signup / Join team state
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [targetBizId, setTargetBizId] = useState(allBusinesses[0]?.id || '');
  const [staffTitle, setStaffTitle] = useState('Senior Operations Specialist');
  const [department, setDepartment] = useState('Service Delivery & Fulfillment');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!loginEmail.trim()) {
      setErrorMsg('Please enter your staff email');
      return;
    }

    const res = await login({
      email: loginEmail.trim(),
      password: loginPassword,
      role: 'STAFF',
      businessId: selectedBizId || undefined,
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to sign in to staff portal');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!staffName.trim() || !staffEmail.trim() || !targetBizId) {
      setErrorMsg('Please provide your name, work email, and select your workspace organization');
      return;
    }

    const res = await signup({
      role: 'STAFF',
      name: staffName.trim(),
      email: staffEmail.trim(),
      password: staffPassword,
      businessId: targetBizId,
      title: staffTitle.trim(),
      department: department.trim(),
    });

    if (!res.success) {
      setErrorMsg(res.error || 'Failed to join team workspace');
    } else {
      setSuccessMsg('Staff credentials activated. Entering workspace queue...');
    }
  };

  return (
    <div id="staff-auth-container" className="w-full">
      <div className="mb-6 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
          <Briefcase className="w-3.5 h-3.5" />
          Specialist Work Queue & Fulfillment Engine
        </div>
        <h2 className="text-xl sm:text-2xl font-serif text-slate-100 font-semibold tracking-tight">
          {mode === 'login' ? 'Sign In to Staff Workspace' : 'Join Operational Team'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {mode === 'login'
            ? 'Access your active Kanban task queue, SLA timers, deliverable upload staging, and status transitions.'
            : 'Register your staff specialist account linked to an active business organization.'}
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
              Target Business Workspace
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={selectedBizId}
                onChange={(e) => setSelectedBizId(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/70 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
              >
                <option value="">Auto-Detect from Staff Credentials</option>
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
              Staff Work Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="e.g. alex@nova.marketing"
                className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/70 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Staff Password
              </label>
              <span className="text-xs text-emerald-400 hover:underline cursor-pointer">
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
                className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/70 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-50 mt-2"
          >
            {isLoading ? 'Authenticating Staff...' : 'Sign In to Staff Workspace'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignup} className="space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Specialist Full Name *
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="e.g. Chloe Bennett"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/70 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Staff Work Email *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  placeholder="e.g. chloe@nova.marketing"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/70 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Select Business Organization to Join *
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={targetBizId}
                onChange={(e) => setTargetBizId(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/70 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
              >
                {allBusinesses.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} — {b.industry}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Specialty / Role Title *
              </label>
              <input
                type="text"
                required
                value={staffTitle}
                onChange={(e) => setStaffTitle(e.target.value)}
                placeholder="e.g. Lead Technical Specialist"
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/70 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g. Creative Campaigns"
                className="w-full px-3 py-2 bg-slate-900/90 border border-slate-700/70 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
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
                value={staffPassword}
                onChange={(e) => setStaffPassword(e.target.value)}
                placeholder="Create secure staff password"
                className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700/70 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-50 mt-2"
          >
            {isLoading ? 'Activating Staff Account...' : 'Register as Staff & Enter Queue'}
            <UserCheck className="w-4 h-4 text-emerald-200" />
          </button>
        </form>
      )}

      <div className="mt-6 pt-4 border-t border-slate-800 text-center">
        <button
          type="button"
          onClick={onToggleMode}
          className="text-xs text-slate-400 hover:text-emerald-300 transition-colors"
        >
          {mode === 'login' ? (
            <span>
              New staff member joining a business?{' '}
              <strong className="text-emerald-400 font-semibold underline underline-offset-2">
                Register as Staff Specialist
              </strong>
            </span>
          ) : (
            <span>
              Already registered as staff?{' '}
              <strong className="text-emerald-400 font-semibold underline underline-offset-2">
                Sign in to existing staff account
              </strong>
            </span>
          )}
        </button>
      </div>
    </div>
  );
};
