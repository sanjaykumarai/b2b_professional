import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWorkflow } from '../../context/WorkflowContext';
import { useTheme } from '../../context/ThemeContext';
import { RoleBadge } from './Badge';
import {
  Sparkles,
  FileText,
  Building2,
  ChevronDown,
  User,
  PlusCircle,
  Activity,
  ShieldCheck,
  LogOut,
  Sun,
  Moon,
  Command,
} from 'lucide-react';

interface HeaderProps {
  onOpenOnboarding: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenOnboarding }) => {
  const {
    currentUser,
    currentBusiness,
    allBusinesses,
    currentRole,
    switchBusiness,
    logout,
  } = useAuth();

  const {
    setIsRagOpen,
    setIsReportsOpen,
    setIsAiGeneratorModalOpen,
  } = useWorkflow();

  const { theme, toggleTheme } = useTheme();

  const [bizDropdownOpen, setBizDropdownOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl border-b transition-colors duration-200 bg-[#08090C]/80 border-white/[0.08] text-slate-200 light:bg-white/80 light:border-slate-200 light:text-slate-800">
      {/* Top Portal Status Strip */}
      <div className="border-b px-4 sm:px-8 py-1.5 flex flex-wrap items-center justify-between text-xs gap-2 transition-colors duration-200 bg-black/40 border-white/[0.06] light:bg-slate-50/80 light:border-slate-200/80">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-widest font-semibold border transition-colors bg-white/[0.04] text-slate-300 border-white/[0.08] light:bg-slate-200 light:text-slate-700 light:border-slate-300">
            SECURE PORTAL
          </span>
          <div className="flex items-center gap-1.5">
            {currentRole === 'OWNER' && (
              <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-[11px] font-medium flex items-center gap-1 light:bg-indigo-50 light:text-indigo-600 light:border-indigo-200">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 light:text-indigo-600" />
                <span>Executive Owner Dashboard</span>
              </span>
            )}
            {currentRole === 'STAFF' && (
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-medium flex items-center gap-1 light:bg-emerald-50 light:text-emerald-600 light:border-emerald-200">
                <Activity className="w-3.5 h-3.5 text-emerald-400 light:text-emerald-600" />
                <span>Operations Staff Workspace</span>
              </span>
            )}
            {currentRole === 'CUSTOMER' && (
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-medium flex items-center gap-1 light:bg-amber-50 light:text-amber-600 light:border-amber-200">
                <User className="w-3.5 h-3.5 text-amber-400 light:text-amber-600" />
                <span>Client Service Portal</span>
              </span>
            )}
          </div>
        </div>

        {/* User Session Info, Theme Toggle & Log Out Action */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 light:text-slate-500">
            <span>Signed in as <strong className="text-slate-100 light:text-slate-900 font-medium">{currentUser?.name}</strong></span>
            <span className="text-slate-600 light:text-slate-300">•</span>
            <span className="text-slate-300 light:text-slate-700 font-medium">{currentBusiness?.name}</span>
          </div>

          {/* Sleek Linear Dark/Light Mode Switcher */}
          <button
            id="theme-toggle-header-btn"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode (Alt+T)`}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all duration-200 bg-white/[0.05] hover:bg-white/[0.1] border-white/[0.08] text-slate-300 hover:text-white light:bg-slate-100 light:hover:bg-slate-200 light:border-slate-300 light:text-slate-700"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
                <span className="text-[11px] font-medium">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-600 transition-transform duration-300 -rotate-12 hover:rotate-0" />
                <span className="text-[11px] font-medium">Dark</span>
              </>
            )}
            <span className="hidden md:inline-flex items-center text-[9px] font-mono px-1 py-0.2 rounded bg-black/30 light:bg-white/60 text-slate-400 border border-white/[0.05] light:border-slate-300">
              Alt+T
            </span>
          </button>

          <button
            onClick={logout}
            title="Log Out of this Portal"
            className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs flex items-center gap-1.5 transition font-medium light:bg-rose-50 light:text-rose-600 light:border-rose-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>

      {/* Main App Navbar */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Left: Brand + Tenant Selector */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shadow-md transition bg-gradient-to-br from-indigo-500 to-purple-600 text-white border border-white/20">
              Ω
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-serif italic tracking-tight font-semibold text-slate-100 light:text-slate-900">
                  OmniFlow
                </span>
                <span className="text-[9px] font-bold font-mono tracking-widest uppercase px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 light:bg-indigo-50 light:text-indigo-600 light:border-indigo-200">
                  AI B2B
                </span>
              </div>
              <p className="text-[10px] text-slate-400 light:text-slate-500 uppercase tracking-widest font-medium">
                Operational Architecture
              </p>
            </div>
          </div>

          <div className="h-8 w-[1px] bg-white/[0.08] light:bg-slate-200 hidden sm:block" />

          {/* Business Tenant Dropdown with Glassmorphism */}
          <div className="relative">
            <button
              id="tenant-dropdown-btn"
              onClick={() => setBizDropdownOpen(!bizDropdownOpen)}
              className="flex items-center gap-2.5 px-3 py-1.5 sm:py-2 rounded-lg border transition-all group bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] hover:border-white/[0.15] text-slate-200 light:bg-slate-100/90 light:hover:bg-slate-200/90 light:border-slate-200 light:text-slate-800"
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-400 light:text-indigo-600 group-hover:scale-105 transition" />
              <div className="text-left">
                <div className="text-[9px] uppercase tracking-widest text-slate-400 light:text-slate-500 font-mono">Active Workspace</div>
                <div className="font-serif italic font-semibold text-slate-100 light:text-slate-900 text-sm max-w-[140px] sm:max-w-[200px] truncate leading-tight">
                  {currentBusiness?.name || 'Select Business'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1 group-hover:text-slate-200 transition" />
            </button>

            {bizDropdownOpen && (
              <div className="absolute left-0 mt-2 w-72 backdrop-blur-2xl rounded-xl border py-2 z-50 shadow-2xl animate-in fade-in duration-100 bg-[#0E1017]/95 border-white/[0.12] light:bg-white/95 light:border-slate-200">
                <div className="px-3.5 py-1.5 text-[10px] font-semibold text-slate-400 light:text-slate-500 uppercase tracking-widest border-b border-white/[0.06] light:border-slate-100 font-mono">
                  Select Business Tenant
                </div>
                <div className="py-1 max-h-64 overflow-y-auto">
                  {allBusinesses.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        switchBusiness(b.id);
                        setBizDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 flex items-start gap-2.5 transition text-xs ${
                        currentBusiness?.id === b.id
                          ? 'bg-indigo-600/15 text-indigo-300 border-l-2 border-indigo-500 font-medium light:bg-indigo-50 light:text-indigo-700'
                          : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.04] light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-100'
                      }`}
                    >
                      <Building2 className="w-4 h-4 mt-0.5 text-slate-500 shrink-0" />
                      <div className="truncate">
                        <div className="font-serif italic font-semibold text-sm text-slate-100 light:text-slate-900">{b.name}</div>
                        <div className="text-[10px] text-slate-400 light:text-slate-500 uppercase tracking-wider truncate font-mono">{b.industry}</div>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="border-t border-white/[0.06] light:border-slate-100 mt-1 pt-1.5 px-2">
                  <button
                    id="create-new-business-header-btn"
                    onClick={() => {
                      setBizDropdownOpen(false);
                      onOpenOnboarding();
                    }}
                    className="w-full text-left px-2.5 py-2 flex items-center gap-2 text-xs font-semibold rounded-lg transition uppercase tracking-wider text-[11px] text-indigo-400 hover:text-indigo-300 hover:bg-indigo-600/10 light:text-indigo-600 light:hover:bg-indigo-50"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-indigo-400 light:text-indigo-600" />
                    <span>+ New Custom Business</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions (AI Generator, Gemini Chat, Reports, User Badge) */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* AI Workflow Generator (Owner Only) */}
          {currentRole === 'OWNER' && (
            <button
              id="header-ai-gen-btn"
              onClick={() => setIsAiGeneratorModalOpen(true)}
              className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-semibold uppercase tracking-wider shadow-md hover:shadow-indigo-500/25 transition duration-200"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>Architect Workflow</span>
            </button>
          )}

          {/* Gemini AI Operations Chatbot */}
          <button
            id="header-rag-chat-btn"
            onClick={() => setIsRagOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-lg border transition-all duration-200 shadow-xs bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/30 hover:border-indigo-500/50 text-indigo-300 light:bg-indigo-50 light:hover:bg-indigo-100 light:border-indigo-200 light:text-indigo-700 text-xs font-medium"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 light:text-indigo-600" />
            <span className="hidden sm:inline font-semibold">Gemini Chatbot</span>
          </button>

          {/* PDF Reports Export */}
          <button
            id="header-pdf-reports-btn"
            onClick={() => setIsReportsOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-lg border transition-all duration-200 bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] hover:border-white/[0.15] text-slate-300 hover:text-white light:bg-slate-100 light:hover:bg-slate-200 light:border-slate-200 light:text-slate-700 text-xs font-medium"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">PDF Dossiers</span>
          </button>

          <div className="h-6 w-[1px] bg-white/[0.08] light:bg-slate-200 hidden sm:block" />

          {/* User Profile Pill & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-white/[0.06] light:hover:bg-slate-100 transition"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 border border-white/20 flex items-center justify-center font-serif text-sm font-semibold text-white shadow-sm">
                {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
              </div>
              <div className="hidden lg:block text-left">
                <div className="text-xs font-medium text-slate-100 light:text-slate-900 flex items-center gap-2 leading-tight">
                  <span>{currentUser?.name || 'Authorized User'}</span>
                  <RoleBadge role={currentRole} />
                </div>
                <div className="text-[10px] text-slate-400 light:text-slate-500 truncate max-w-[140px]">
                  {currentUser?.email}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 backdrop-blur-2xl rounded-xl border py-2 z-50 shadow-2xl animate-in fade-in duration-100 bg-[#0E1017]/95 border-white/[0.12] light:bg-white/95 light:border-slate-200">
                <div className="px-4 py-2.5 border-b border-white/[0.06] light:border-slate-100">
                  <div className="font-semibold text-xs text-slate-100 light:text-slate-900">{currentUser?.name}</div>
                  <div className="text-[11px] text-slate-400 light:text-slate-500 truncate">{currentUser?.email}</div>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <RoleBadge role={currentRole} />
                    <span className="text-[10px] text-slate-400 font-mono">{currentUser?.title || currentRole}</span>
                  </div>
                </div>

                <div className="px-4 py-2 border-b border-white/[0.06] light:border-slate-100 text-[11px] text-slate-400 light:text-slate-600">
                  <div className="text-[9px] uppercase font-semibold font-mono tracking-wider text-slate-500">Assigned Organization</div>
                  <div className="text-slate-200 light:text-slate-900 font-medium truncate mt-0.5">{currentBusiness?.name}</div>
                  <div className="text-[10px] text-slate-400 truncate">{currentBusiness?.industry}</div>
                </div>

                <div className="pt-1">
                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition font-medium light:text-rose-600 light:hover:bg-rose-50"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out Account</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
