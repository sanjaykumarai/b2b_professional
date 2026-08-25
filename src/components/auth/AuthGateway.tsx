import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { UserRole } from '../../types';
import { OwnerAuthForm } from './OwnerAuthForm';
import { StaffAuthForm } from './StaffAuthForm';
import { CustomerAuthForm } from './CustomerAuthForm';
import {
  ShieldCheck,
  Briefcase,
  Users,
  Layers,
  Zap,
  ArrowRight,
  Sun,
  Moon,
} from 'lucide-react';

export const AuthGateway: React.FC = () => {
  const {
    authPortalRole,
    setAuthPortalRole,
    login,
    isLoading,
  } = useAuth();

  const { theme, toggleTheme } = useTheme();

  const [mode, setMode] = useState<'login' | 'signup'>('login');

  const demoAccounts = [
    {
      name: 'Sarah Sterling',
      email: 'owner@nova.marketing',
      role: 'OWNER' as UserRole,
      bizName: 'Nova Digital Agency',
      tag: 'Executive Owner',
      color: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:border-indigo-500 light:bg-indigo-50 light:text-indigo-700 light:border-indigo-200',
    },
    {
      name: 'Alex Rivera',
      email: 'staff@nova.marketing',
      role: 'STAFF' as UserRole,
      bizName: 'Nova Digital Agency',
      tag: 'Staff Specialist Lead',
      color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:border-emerald-500 light:bg-emerald-50 light:text-emerald-700 light:border-emerald-200',
    },
    {
      name: 'Marcus Vance',
      email: 'customer@acme.corp',
      role: 'CUSTOMER' as UserRole,
      bizName: 'Nova Digital Agency',
      tag: 'Corporate Client (Acme)',
      color: 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:border-amber-500 light:bg-amber-50 light:text-amber-700 light:border-amber-200',
    },
    {
      name: 'Dr. Arthur Pendelton',
      email: 'director@apex.edu',
      role: 'OWNER' as UserRole,
      bizName: 'Apex Institute',
      tag: 'Academic Dean Owner',
      color: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:border-indigo-500 light:bg-indigo-50 light:text-indigo-700 light:border-indigo-200',
    },
    {
      name: 'Prof. Maya Lin',
      email: 'tutor@apex.edu',
      role: 'STAFF' as UserRole,
      bizName: 'Apex Institute',
      tag: 'Registrar & Faculty Staff',
      color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:border-emerald-500 light:bg-emerald-50 light:text-emerald-700 light:border-emerald-200',
    },
    {
      name: 'David Kim',
      email: 'student@apex.edu',
      role: 'CUSTOMER' as UserRole,
      bizName: 'Apex Institute',
      tag: 'Enrolled Student Client',
      color: 'border-amber-500/30 bg-amber-500/10 text-amber-300 hover:border-amber-500 light:bg-amber-50 light:text-amber-700 light:border-amber-200',
    },
  ];

  const handleQuickDemoLogin = async (acc: (typeof demoAccounts)[0]) => {
    setAuthPortalRole(acc.role);
    await login({
      email: acc.email,
      role: acc.role,
    });
  };

  return (
    <div
      id="auth-gateway-screen"
      className={`min-h-screen flex flex-col justify-between selection:bg-indigo-500 selection:text-white transition-colors duration-200 ${
        theme === 'dark'
          ? 'bg-[#08090C] text-slate-100 linear-ambient-dark'
          : 'bg-[#F8FAFC] text-slate-900 linear-ambient-light'
      }`}
    >
      {/* Top Banner & Brand Bar */}
      <header className="border-b transition-colors duration-200 backdrop-blur-xl bg-[#08090C]/80 border-white/[0.08] light:bg-white/80 light:border-slate-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold border border-white/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="font-serif font-bold text-lg text-slate-100 light:text-slate-900 tracking-tight flex items-center gap-2">
                OmniFlow AI
                <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 light:bg-indigo-50 light:text-indigo-600 light:border-indigo-200">
                  B2B Multi-Tenant
                </span>
              </div>
              <p className="text-xs text-slate-400 light:text-slate-500">
                Universal Enterprise Workflow & Service Delivery Platform
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Switcher Toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode (Alt+T)`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all duration-200 bg-white/[0.05] hover:bg-white/[0.1] border-white/[0.08] text-slate-300 hover:text-white light:bg-slate-100 light:hover:bg-slate-200 light:border-slate-300 light:text-slate-700"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-medium">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-medium">Dark</span>
                </>
              )}
            </button>

            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400 light:text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Cloud Engine Live
            </div>
          </div>
        </div>
      </header>

      {/* Main Authentication Card Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col items-center justify-center">
        {/* Role Portal Selector Bar with Linear Glass style */}
        <div className="w-full max-w-xl mb-6">
          <div className="text-center mb-4">
            <span className="text-xs font-mono uppercase tracking-widest text-indigo-400 light:text-indigo-600 font-semibold">
              Select Your Access Portal
            </span>
            <p className="text-xs text-slate-400 light:text-slate-500 mt-0.5">
              Choose the dedicated portal matching your organizational responsibility
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl border backdrop-blur-xl transition-all duration-200 bg-white/[0.03] border-white/[0.08] shadow-2xl light:bg-slate-100/90 light:border-slate-200">
            {/* Owner Tab */}
            <button
              type="button"
              onClick={() => setAuthPortalRole('OWNER')}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-medium transition-all ${
                authPortalRole === 'OWNER'
                  ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30 font-semibold border border-indigo-400/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] light:text-slate-600 light:hover:text-slate-900 light:hover:bg-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4 mb-1" />
              <span>Owner Portal</span>
              <span className="text-[10px] opacity-80 font-normal">Executive</span>
            </button>

            {/* Staff Tab */}
            <button
              type="button"
              onClick={() => setAuthPortalRole('STAFF')}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-medium transition-all ${
                authPortalRole === 'STAFF'
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 font-semibold border border-emerald-400/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] light:text-slate-600 light:hover:text-slate-900 light:hover:bg-white'
              }`}
            >
              <Briefcase className="w-4 h-4 mb-1" />
              <span>Staff Portal</span>
              <span className="text-[10px] opacity-80 font-normal">Operations</span>
            </button>

            {/* Customer Tab */}
            <button
              type="button"
              onClick={() => setAuthPortalRole('CUSTOMER')}
              className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl text-xs font-medium transition-all ${
                authPortalRole === 'CUSTOMER'
                  ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30 font-semibold border border-amber-400/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] light:text-slate-600 light:hover:text-slate-900 light:hover:bg-white'
              }`}
            >
              <Users className="w-4 h-4 mb-1" />
              <span>Client Portal</span>
              <span className="text-[10px] opacity-80 font-normal">Requests</span>
            </button>
          </div>
        </div>

        {/* Dynamic Portal Card with Linear Glassmorphism */}
        <div className="w-full max-w-xl rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-2xl relative overflow-hidden transition-all duration-200 border bg-white/[0.04] border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] light:bg-white/90 light:border-slate-200 light:shadow-xl">
          {/* Subtle Ambient Role Glow */}
          <div
            className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none transition-all ${
              authPortalRole === 'OWNER'
                ? 'bg-indigo-500'
                : authPortalRole === 'STAFF'
                ? 'bg-emerald-500'
                : 'bg-amber-500'
            }`}
          />

          {/* Mode Switcher Tabs (Sign In / Register) */}
          <div className="flex items-center justify-between border-b border-white/[0.06] light:border-slate-200 pb-4 mb-6">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className={`text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-lg transition-all ${
                  mode === 'login'
                    ? 'bg-white/[0.1] text-white border border-white/[0.15] light:bg-slate-900 light:text-white light:border-slate-800'
                    : 'text-slate-400 hover:text-slate-200 light:text-slate-500 light:hover:text-slate-900'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode('signup')}
                className={`text-xs font-semibold uppercase tracking-wider px-3.5 py-1.5 rounded-lg transition-all ${
                  mode === 'signup'
                    ? 'bg-white/[0.1] text-white border border-white/[0.15] light:bg-slate-900 light:text-white light:border-slate-800'
                    : 'text-slate-400 hover:text-slate-200 light:text-slate-500 light:hover:text-slate-900'
                }`}
              >
                {authPortalRole === 'OWNER'
                  ? 'New Business Sign Up'
                  : authPortalRole === 'STAFF'
                  ? 'Join Team Sign Up'
                  : 'Client Sign Up'}
              </button>
            </div>

            <div className="text-[11px] font-mono text-slate-400 light:text-slate-500 hidden sm:block">
              Portal: <strong className="text-slate-200 light:text-slate-800">{authPortalRole}</strong>
            </div>
          </div>

          {/* Render Active Role Form */}
          {authPortalRole === 'OWNER' && (
            <OwnerAuthForm
              mode={mode}
              onToggleMode={() => setMode(mode === 'login' ? 'signup' : 'login')}
            />
          )}

          {authPortalRole === 'STAFF' && (
            <StaffAuthForm
              mode={mode}
              onToggleMode={() => setMode(mode === 'login' ? 'signup' : 'login')}
            />
          )}

          {authPortalRole === 'CUSTOMER' && (
            <CustomerAuthForm
              mode={mode}
              onToggleMode={() => setMode(mode === 'login' ? 'signup' : 'login')}
            />
          )}
        </div>

        {/* Quick Demo One-Click Access Tray */}
        <div className="w-full max-w-3xl mt-8 p-5 rounded-2xl border backdrop-blur-xl transition-all duration-200 bg-white/[0.02] border-white/[0.08] light:bg-white/80 light:border-slate-200 shadow-xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 light:text-slate-800 font-mono">
                Instant Demo Profiles (1-Click Switch & Login)
              </span>
            </div>
            <span className="text-[11px] text-slate-400 light:text-slate-500 font-mono">Pre-seeded Sandbox</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {demoAccounts.map((acc, idx) => (
              <button
                key={idx}
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickDemoLogin(acc)}
                className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all group backdrop-blur-md ${acc.color}`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-xs font-bold text-slate-100 light:text-slate-900 group-hover:text-white light:group-hover:text-indigo-600">
                    {acc.name}
                  </span>
                  <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/40 text-slate-300 light:bg-white light:text-slate-700 light:border light:border-slate-200">
                    {acc.role}
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 light:text-slate-600 truncate w-full">{acc.tag}</div>
                <div className="text-[10px] text-slate-500 light:text-slate-500 truncate w-full mt-1 flex items-center justify-between">
                  <span>{acc.bizName}</span>
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] light:border-slate-200 bg-black/20 light:bg-slate-100/50 px-6 py-4 text-center text-xs text-slate-500">
        OmniFlow AI Enterprise Operations Platform • Multi-Role Authentication System
      </footer>
    </div>
  );
};
