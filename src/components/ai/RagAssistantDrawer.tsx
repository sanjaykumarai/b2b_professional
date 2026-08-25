import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWorkflow } from '../../context/WorkflowContext';
import { GeminiChatModelMode } from '../../types';
import {
  Sparkles,
  X,
  Send,
  Bot,
  BookOpen,
  RefreshCw,
  HelpCircle,
  Trash2,
  Copy,
  Check,
  Zap,
  Cpu,
  Brain,
  ShieldCheck,
  Activity,
  User as UserIcon,
} from 'lucide-react';

export const RagAssistantDrawer: React.FC = () => {
  const { currentBusiness, currentRole } = useAuth();
  const { isRagOpen, setIsRagOpen, ragMessages, setRagMessages, askRagAssistant, selectedRequest } =
    useWorkflow();

  const [inputQuery, setInputQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [modelMode, setModelMode] = useState<GeminiChatModelMode>('general');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isRagOpen) {
      scrollToBottom();
    }
  }, [ragMessages, isRagOpen]);

  if (!isRagOpen) return null;

  const handleSend = async (queryToSend?: string) => {
    const q = (queryToSend || inputQuery).trim();
    if (!q || isSending) return;

    setInputQuery('');
    setIsSending(true);
    try {
      await askRagAssistant(q, selectedRequest?.id, modelMode);
    } finally {
      setIsSending(false);
    }
  };

  const handleClearHistory = () => {
    setRagMessages([
      {
        id: `reset_${Date.now()}`,
        role: 'assistant',
        content: `Conversation reset. I am your Gemini Operations Chatbot grounded in **${
          currentBusiness?.name || 'your organization'
        }** workflows, SLAs, policies, and tickets. How can I assist you?`,
        timestamp: new Date().toISOString(),
        modelUsed:
          modelMode === 'complex'
            ? 'gemini-3.1-pro-preview'
            : modelMode === 'fast'
            ? 'gemini-3.1-flash-lite'
            : 'gemini-3.5-flash',
      },
    ]);
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Role-specific suggested inquiry prompts
  const getSuggestedQueries = () => {
    if (selectedRequest) {
      return [
        `What is the current status and next step for Request ${selectedRequest.id}?`,
        `Who is assigned to Request ${selectedRequest.id} and what is the SLA deadline?`,
        `What documents are required to complete ${selectedRequest.serviceName}?`,
      ];
    }

    if (currentRole === 'OWNER') {
      return [
        'Analyze bottlenecks and SLA turnaround across all workflow stages.',
        'Which services have the highest volume and longest completion times?',
        'Summarize active requests and any pending manager approvals.',
        'What operational policies are documented in our repository?',
      ];
    }

    if (currentRole === 'STAFF') {
      return [
        'What are the mandatory deliverables for in-progress tasks?',
        'Which client requests are currently approaching their SLA deadline?',
        'Explain the step-by-step procedure for deliverables sign-off.',
        'List active documents and guidelines for our service line.',
      ];
    }

    return [
      'What services does this business offer and what are the standard turnaround times?',
      'What information or files do I need to submit with my request?',
      'How does the quality review and approval process work?',
      'What are the business operating hours and SLA commitments?',
    ];
  };

  const roleLabel =
    currentRole === 'OWNER'
      ? 'Executive AI Architect'
      : currentRole === 'STAFF'
      ? 'Operations Specialist AI'
      : 'Client Concierge AI';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm flex justify-end animate-in fade-in duration-150">
      <div className="w-full max-w-lg backdrop-blur-2xl border-l h-full shadow-2xl flex flex-col justify-between transition-colors duration-200 bg-[#0A0C10]/95 border-white/[0.12] text-slate-100 light:bg-white/95 light:border-slate-200 light:text-slate-900">
        {/* Chatbot Header */}
        <div className="p-4 border-b border-white/[0.08] light:border-slate-200 bg-black/20 light:bg-slate-50/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 border border-white/20 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-100 light:text-slate-900 tracking-wide">Gemini Chatbot</h3>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-indigo-300 light:bg-indigo-50 light:text-indigo-700 text-[10px] font-mono font-medium border border-indigo-500/30 light:border-indigo-200">
                    {roleLabel}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 light:text-slate-500 truncate max-w-[240px]">
                  Grounding in <strong className="text-slate-200 light:text-slate-800">{currentBusiness?.name}</strong> repository
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleClearHistory}
                title="Clear conversation history"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/[0.06] light:hover:bg-slate-100 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsRagOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white light:hover:text-slate-900 hover:bg-white/[0.06] light:hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Model Mode Selector Tabs */}
          <div className="mt-3 pt-3 border-t border-white/[0.06] light:border-slate-200 flex items-center justify-between gap-2 text-xs">
            <div className="text-[10px] uppercase font-mono font-bold tracking-widest text-slate-400 light:text-slate-500 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-indigo-400" />
              <span>Model Mode:</span>
            </div>

            <div className="flex items-center gap-1 bg-black/40 light:bg-slate-100 p-1 rounded-xl border border-white/[0.08] light:border-slate-200">
              <button
                id="gemini-mode-fast"
                onClick={() => setModelMode('fast')}
                title="gemini-3.1-flash-lite: Optimized for rapid, lightweight queries"
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition flex items-center gap-1 ${
                  modelMode === 'fast'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold shadow-xs light:bg-amber-100 light:text-amber-800'
                    : 'text-slate-400 hover:text-slate-200 light:text-slate-600'
                }`}
              >
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Fast</span>
              </button>

              <button
                id="gemini-mode-general"
                onClick={() => setModelMode('general')}
                title="gemini-3.5-flash: Balanced reasoning and speed for general tasks"
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition flex items-center gap-1 ${
                  modelMode === 'general'
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-semibold shadow-xs light:bg-indigo-100 light:text-indigo-800'
                    : 'text-slate-400 hover:text-slate-200 light:text-slate-600'
                }`}
              >
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>General</span>
              </button>

              <button
                id="gemini-mode-complex"
                onClick={() => setModelMode('complex')}
                title="gemini-3.1-pro-preview: Deep multi-step analytical reasoning for complex operations"
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition flex items-center gap-1 ${
                  modelMode === 'complex'
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 font-semibold shadow-xs light:bg-purple-100 light:text-purple-800'
                    : 'text-slate-400 hover:text-slate-200 light:text-slate-600'
                }`}
              >
                <Brain className="w-3 h-3 text-purple-400" />
                <span>Pro Analysis</span>
              </button>
            </div>
          </div>
        </div>

        {/* Scrollable Conversation Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {/* Active Context Banner */}
          {selectedRequest && (
            <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 light:text-indigo-700 light:bg-indigo-50 light:border-indigo-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 truncate">
                <span className="font-mono font-bold">[{selectedRequest.id}]</span>
                <span className="truncate">{selectedRequest.title}</span>
              </div>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-950 text-indigo-200 light:bg-indigo-200 light:text-indigo-900">
                Focused
              </span>
            </div>
          )}

          {ragMessages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4 text-indigo-400 light:text-indigo-600" />
                  </div>
                )}

                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed group relative backdrop-blur-md ${
                    isUser
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium shadow-md'
                      : 'bg-white/[0.04] text-slate-200 border border-white/[0.08] shadow-md light:bg-slate-50 light:border-slate-200 light:text-slate-800'
                  }`}
                >
                  {/* Assistant message model badge */}
                  {!isUser && (
                    <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-white/[0.06] light:border-slate-200 text-[10px]">
                      <div className="flex items-center gap-1 text-indigo-400 light:text-indigo-600 font-mono">
                        <Sparkles className="w-3 h-3" />
                        <span>{msg.modelUsed || (modelMode === 'complex' ? 'gemini-3.1-pro-preview' : modelMode === 'fast' ? 'gemini-3.1-flash-lite' : 'gemini-3.5-flash')}</span>
                      </div>
                      <button
                        onClick={() => handleCopyMessage(msg.id, msg.content)}
                        className="text-slate-400 hover:text-white light:hover:text-slate-900 transition flex items-center gap-1 opacity-70 hover:opacity-100"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span className="text-[9px]">{copiedId === msg.id ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  )}

                  {/* Body Content with formatted paragraphs */}
                  <div className="whitespace-pre-wrap space-y-1">{msg.content}</div>

                  {/* Grounding Source Citations */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-white/[0.06] light:border-slate-200 space-y-1.5">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 light:text-slate-500 font-semibold uppercase tracking-wider">
                        <BookOpen className="w-3 h-3 text-indigo-400" />
                        <span>Grounded Context Sources:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((src, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-black/40 text-slate-300 border border-white/[0.08] font-mono text-[9px] flex items-center gap-1 light:bg-white light:border-slate-200 light:text-slate-700"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            <span className="font-semibold">{src.title}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div
                    className={`text-[9px] mt-2 font-mono text-right ${
                      isUser ? 'text-white/70' : 'text-slate-500'
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-white/[0.08] border border-white/15 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold text-white shadow-xs light:bg-slate-200 light:text-slate-800">
                    {currentRole === 'OWNER' ? (
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                    ) : currentRole === 'STAFF' ? (
                      <Activity className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {isSending && (
            <div className="flex gap-2.5 items-center text-xs text-slate-400 animate-pulse">
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              </div>
              <div className="flex items-center gap-1.5">
                <span>Gemini analyzing repository with</span>
                <span className="font-mono text-indigo-300 light:text-indigo-700 font-semibold">
                  {modelMode === 'complex'
                    ? 'gemini-3.1-pro-preview'
                    : modelMode === 'fast'
                    ? 'gemini-3.1-flash-lite'
                    : 'gemini-3.5-flash'}
                </span>
                <span>...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Quick Prompt Chips */}
        <div className="px-4 py-2.5 bg-black/30 light:bg-slate-50 border-t border-white/[0.08] light:border-slate-200">
          <div className="text-[9px] font-bold uppercase font-mono tracking-widest text-slate-400 light:text-slate-500 mb-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <HelpCircle className="w-3 h-3 text-indigo-400" />
              <span>Suggested Inquiries for {currentRole}</span>
            </div>
            <span className="text-[9px] text-slate-500 font-mono">Click to ask</span>
          </div>
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {getSuggestedQueries().map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q)}
                className="text-[11px] text-left px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-200 hover:text-white border border-white/[0.08] hover:border-indigo-500/40 transition leading-snug truncate max-w-full light:bg-white light:text-slate-700 light:border-slate-200 light:hover:border-indigo-300"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-black/40 light:bg-white border-t border-white/[0.08] light:border-slate-200 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder={
              currentRole === 'OWNER'
                ? 'Ask about SLA analytics, bottlenecks, team capacity...'
                : currentRole === 'STAFF'
                ? 'Ask about task deadlines, deliverable specs, workflow steps...'
                : 'Ask about service packages, turnaround times, request status...'
            }
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-white/[0.04] light:bg-slate-50 border border-white/[0.08] light:border-slate-200 text-slate-100 light:text-slate-900 text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isSending}
            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-medium text-xs transition disabled:opacity-40 flex items-center gap-1.5 shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};
