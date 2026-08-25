import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Workflow,
  CustomerRequest,
  RequestActivity,
  BusinessDocument,
  AiGeneratedWorkflowPayload,
  RagChatMessage,
} from '../types';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';

interface WorkflowContextType {
  workflows: Workflow[];
  activeWorkflow: Workflow | null;
  requests: CustomerRequest[];
  activities: RequestActivity[];
  documents: BusinessDocument[];
  isLoading: boolean;
  isAiGenerating: boolean;
  selectedRequest: CustomerRequest | null;
  setSelectedRequest: (req: CustomerRequest | null) => void;
  isRagOpen: boolean;
  setIsRagOpen: (open: boolean) => void;
  isReportsOpen: boolean;
  setIsReportsOpen: (open: boolean) => void;
  isAiGeneratorModalOpen: boolean;
  setIsAiGeneratorModalOpen: (open: boolean) => void;
  ragMessages: RagChatMessage[];
  setRagMessages: React.Dispatch<React.SetStateAction<RagChatMessage[]>>;
  refreshData: () => Promise<void>;
  generateWorkflowFromPrompt: (payload: {
    businessName: string;
    industry: string;
    description?: string;
    requirements: string;
  }) => Promise<AiGeneratedWorkflowPayload>;
  saveAndActivateGeneratedWorkflow: (
    payload: AiGeneratedWorkflowPayload,
    businessId: string
  ) => Promise<Workflow>;
  createCustomerRequest: (req: Partial<CustomerRequest>) => Promise<CustomerRequest>;
  updateRequestStatus: (
    requestId: string,
    status: string,
    notes?: string,
    deliverableSummary?: string
  ) => Promise<CustomerRequest>;
  assignStaffToRequest: (
    requestId: string,
    staffId: string,
    staffName: string
  ) => Promise<CustomerRequest>;
  uploadDeliverableFile: (
    requestId: string,
    name: string,
    size?: string,
    isDeliverable?: boolean
  ) => Promise<void>;
  askRagAssistant: (query: string, currentRequestId?: string, modelMode?: 'fast' | 'general' | 'complex') => Promise<string>;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(undefined);

export const WorkflowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentBusiness, currentUser } = useAuth();

  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [requests, setRequests] = useState<CustomerRequest[]>([]);
  const [activities, setActivities] = useState<RequestActivity[]>([]);
  const [documents, setDocuments] = useState<BusinessDocument[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<CustomerRequest | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [isRagOpen, setIsRagOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isAiGeneratorModalOpen, setIsAiGeneratorModalOpen] = useState(false);

  const [ragMessages, setRagMessages] = useState<RagChatMessage[]>([
    {
      id: 'init_msg',
      role: 'assistant',
      content:
        'Hello! I am your AI Business Operations Assistant. Ask me anything about available services, current workflow stages, active request statuses, or operational guidelines.',
      timestamp: new Date().toISOString(),
    },
  ]);

  const refreshData = useCallback(async () => {
    if (!currentBusiness?.id) return;
    try {
      const [wfs, reqs, acts, docs] = await Promise.all([
        api.getWorkflows(currentBusiness.id),
        api.getRequests({ businessId: currentBusiness.id }),
        api.getActivities(currentBusiness.id),
        api.getDocuments(currentBusiness.id),
      ]);
      if (Array.isArray(wfs)) setWorkflows(wfs);
      if (Array.isArray(reqs)) setRequests(reqs);
      if (Array.isArray(acts)) setActivities(acts);
      if (Array.isArray(docs)) setDocuments(docs);

      // Keep selected request updated if currently opened
      if (selectedRequest && Array.isArray(reqs)) {
        const updatedSelected = reqs.find((r) => r.id === selectedRequest.id);
        if (updatedSelected) setSelectedRequest(updatedSelected);
      }
    } catch (err: any) {
      console.warn('Sync notice:', err?.message || err);
    } finally {
      setIsLoading(false);
    }
  }, [currentBusiness?.id, selectedRequest]);

  useEffect(() => {
    setIsLoading(true);
    refreshData();
    // Near real-time sync polling every 4 seconds
    const interval = setInterval(() => {
      refreshData();
    }, 4000);
    return () => clearInterval(interval);
  }, [currentBusiness?.id]);

  const activeWorkflow = workflows.find((w) => w.isActive) || workflows[0] || null;

  // AI Workflow generation
  const generateWorkflowFromPrompt = async (payload: {
    businessName: string;
    industry: string;
    description?: string;
    requirements: string;
  }) => {
    setIsAiGenerating(true);
    try {
      const result = await api.generateWorkflowWithAi(payload);
      return result.workflow;
    } finally {
      setIsAiGenerating(false);
    }
  };

  // Save and activate workflow
  const saveAndActivateGeneratedWorkflow = async (
    payload: AiGeneratedWorkflowPayload,
    businessId: string
  ): Promise<Workflow> => {
    const formattedWorkflow: Partial<Workflow> = {
      businessId,
      name: payload.workflow_name,
      description: payload.description,
      businessContext: payload.business_context,
      isActive: true,
      services: payload.services.map((s, idx) => ({
        id: `srv_${Date.now()}_${idx}`,
        name: s.name,
        slug: s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: s.description,
        estimatedTurnaround: s.turnaround_time,
        category: s.category || 'General',
        priceEstimate: s.price_estimate,
      })),
      requiredFields: payload.required_fields.map((f, idx) => ({
        id: `fld_${Date.now()}_${idx}`,
        name: f.name,
        label: f.label,
        type: f.type,
        required: f.required,
        placeholder: f.placeholder,
        options: f.options,
      })),
      steps: payload.workflow_steps.map((st, idx) => ({
        id: `step_${Date.now()}_${idx}`,
        title: st.title,
        description: st.description,
        order: idx + 1,
        responsibleRole: st.responsible_role,
        allowedActions: st.allowed_actions || ['Proceed Step'],
        statusResult: st.status_result || 'IN_PROGRESS',
        slaHours: st.sla_hours || 24,
        requiresApproval: st.requires_approval || false,
        color: st.color || (idx === 0 ? '#64748b' : idx === payload.workflow_steps.length - 1 ? '#10b981' : '#3b82f6'),
      })),
      statuses: payload.statuses || ['SUBMITTED', 'IN_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'APPROVAL', 'COMPLETED', 'REJECTED'],
      approvalRequired: payload.approval_required ?? true,
      staffAssignmentRules: payload.staff_assignment_rules || [],
    };

    const created = await api.createWorkflow(formattedWorkflow);

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (_) {}

    await refreshData();
    return created;
  };

  // Submit customer request
  const createCustomerRequest = async (req: Partial<CustomerRequest>): Promise<CustomerRequest> => {
    if (!currentBusiness || !currentUser) throw new Error('Tenant or user not identified');

    const payload: Partial<CustomerRequest> = {
      businessId: currentBusiness.id,
      workflowId: req.workflowId || activeWorkflow?.id || 'wf_default',
      serviceId: req.serviceId,
      serviceName: req.serviceName,
      title: req.title,
      description: req.description || '',
      priority: req.priority || 'MEDIUM',
      customerId: currentUser.id,
      customerName: currentUser.name,
      customerEmail: currentUser.email,
      customData: req.customData || {},
      documents: req.documents || [],
      dueDate: req.dueDate,
    };

    const created = await api.createRequest(payload);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
      });
    } catch (_) {}

    await refreshData();
    return created;
  };

  // Transition request status
  const updateRequestStatus = async (
    requestId: string,
    status: string,
    notes?: string,
    deliverableSummary?: string
  ): Promise<CustomerRequest> => {
    if (!currentUser) throw new Error('Not authenticated');

    const updated = await api.updateRequestStatus(requestId, {
      status,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      notes,
      deliverableSummary,
    });

    if (status === 'COMPLETED') {
      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.5 },
        });
      } catch (_) {}
    }

    await refreshData();
    return updated;
  };

  // Assign staff
  const assignStaffToRequest = async (
    requestId: string,
    staffId: string,
    staffName: string
  ): Promise<CustomerRequest> => {
    if (!currentUser) throw new Error('Not authenticated');

    const updated = await api.assignStaff(requestId, {
      staffId,
      staffName,
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
    });

    await refreshData();
    return updated;
  };

  // Upload deliverable
  const uploadDeliverableFile = async (
    requestId: string,
    name: string,
    size: string = '3.5 MB',
    isDeliverable: boolean = true
  ) => {
    if (!currentUser) throw new Error('Not authenticated');

    await api.uploadRequestDocument(requestId, {
      name,
      size,
      type: name.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream',
      uploadedBy: currentUser.name,
      uploaderRole: currentUser.role,
      isDeliverable,
    });

    await refreshData();
  };

  // Gemini Chatbot / RAG Assistant Ask
  const askRagAssistant = async (query: string, currentRequestId?: string, modelMode?: 'fast' | 'general' | 'complex'): Promise<string> => {
    if (!currentBusiness) return 'No business context available.';

    const userMessage: RagChatMessage = {
      id: `usr_msg_${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toISOString(),
    };
    setRagMessages((prev) => [...prev, userMessage]);

    try {
      const historyPayload = ragMessages.slice(-8).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.askRagAssistant({
        businessId: currentBusiness.id,
        userRole: currentUser?.role || 'CUSTOMER',
        query,
        currentRequestId,
        chatHistory: historyPayload,
        modelMode,
      });

      const assistantMessage: RagChatMessage = {
        id: `ast_msg_${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        modelUsed: res.modelUsed,
        sources: res.sources,
        timestamp: new Date().toISOString(),
      };

      setRagMessages((prev) => [...prev, assistantMessage]);
      return res.reply;
    } catch (err: any) {
      const errorMsg: RagChatMessage = {
        id: `err_msg_${Date.now()}`,
        role: 'assistant',
        content:
          'I was unable to retrieve context from the server right now. Please verify active workflows and requests in your dashboard.',
        timestamp: new Date().toISOString(),
      };
      setRagMessages((prev) => [...prev, errorMsg]);
      return errorMsg.content;
    }
  };

  return (
    <WorkflowContext.Provider
      value={{
        workflows,
        activeWorkflow,
        requests,
        activities,
        documents,
        isLoading,
        isAiGenerating,
        selectedRequest,
        setSelectedRequest,
        isRagOpen,
        setIsRagOpen,
        isReportsOpen,
        setIsReportsOpen,
        isAiGeneratorModalOpen,
        setIsAiGeneratorModalOpen,
        ragMessages,
        setRagMessages,
        refreshData,
        generateWorkflowFromPrompt,
        saveAndActivateGeneratedWorkflow,
        createCustomerRequest,
        updateRequestStatus,
        assignStaffToRequest,
        uploadDeliverableFile,
        askRagAssistant,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
};

export const useWorkflow = () => {
  const context = useContext(WorkflowContext);
  if (!context) throw new Error('useWorkflow must be used within a WorkflowProvider');
  return context;
};
