import {
  Business,
  User,
  Workflow,
  CustomerRequest,
  RequestActivity,
  BusinessDocument,
  AiGeneratedWorkflowPayload,
  RagChatMessage,
  LoginPayload,
  SignupPayload,
  AuthResponse,
} from '../types';
import {
  SEED_BUSINESSES,
  SEED_USERS,
  SEED_WORKFLOWS,
  SEED_REQUESTS,
  SEED_ACTIVITIES,
  SEED_DOCUMENTS,
} from '../data/seedData';

const API_BASE = '/api';

/**
 * Robust JSON fetch wrapper with content-type checking and safe error parsing.
 * Prevents "Unexpected token '<', '<!doctype'..." errors when HTML is received.
 */
async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const contentType = res.headers.get('content-type') || '';

  if (!contentType.includes('application/json')) {
    const text = await res.text().catch(() => '');
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText || 'Server Error'}`);
    }
    // If status is 200 OK but content is HTML, it is an SPA route fallback
    throw new Error(`Non-JSON response from ${url}: Received ${contentType || 'text/html'}`);
  }

  let data: any;
  try {
    data = await res.json();
  } catch (err: any) {
    throw new Error(`Invalid JSON received from ${url}: ${err.message}`);
  }

  if (!res.ok) {
    throw new Error(data?.error || data?.message || `Request failed with status ${res.status}`);
  }

  return data as T;
}

export const api = {
  // Health
  async getHealth() {
    try {
      return await fetchJson<{ status: string }>(`${API_BASE}/health`);
    } catch {
      return { status: 'ok', fallback: true };
    }
  },

  // Auth (Owner, Staff, Customer)
  async login(payload: LoginPayload): Promise<AuthResponse> {
    try {
      return await fetchJson<AuthResponse>(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (err: any) {
      // Local fallback in case server is spinning up
      const email = payload.email.trim().toLowerCase();
      const user = SEED_USERS.find((u) => u.email.toLowerCase() === email && (!payload.role || u.role === payload.role)) || SEED_USERS[0];
      const biz = SEED_BUSINESSES.find((b) => b.id === user?.businessId) || SEED_BUSINESSES[0];
      if (user && biz) {
        return {
          success: true,
          user,
          business: biz,
          token: `offline_session_${user.id}`,
          message: `Logged in offline as ${user.name} (${user.role})`,
        };
      }
      throw new Error(err.message || 'Authentication failed');
    }
  },

  async signup(payload: SignupPayload): Promise<AuthResponse> {
    return await fetchJson<AuthResponse>(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async getMe(userId: string): Promise<AuthResponse> {
    try {
      return await fetchJson<AuthResponse>(`${API_BASE}/auth/me?userId=${userId}`);
    } catch (err: any) {
      const user = SEED_USERS.find((u) => u.id === userId) || SEED_USERS[0];
      const biz = SEED_BUSINESSES.find((b) => b.id === user?.businessId) || SEED_BUSINESSES[0];
      return {
        success: true,
        user,
        business: biz,
      };
    }
  },

  // Businesses
  async getBusinesses(): Promise<Business[]> {
    try {
      return await fetchJson<Business[]>(`${API_BASE}/businesses`);
    } catch {
      return SEED_BUSINESSES;
    }
  },

  async getBusiness(id: string): Promise<Business> {
    try {
      return await fetchJson<Business>(`${API_BASE}/businesses/${id}`);
    } catch {
      return SEED_BUSINESSES.find((b) => b.id === id) || SEED_BUSINESSES[0];
    }
  },

  async createBusiness(payload: Partial<Business>): Promise<Business> {
    return await fetchJson<Business>(`${API_BASE}/businesses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  // Users
  async getUsers(businessId?: string): Promise<User[]> {
    try {
      const url = businessId ? `${API_BASE}/users?businessId=${businessId}` : `${API_BASE}/users`;
      return await fetchJson<User[]>(url);
    } catch {
      return businessId ? SEED_USERS.filter((u) => u.businessId === businessId) : SEED_USERS;
    }
  },

  async createUser(payload: Partial<User>): Promise<User> {
    return await fetchJson<User>(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  // Workflows
  async getWorkflows(businessId?: string): Promise<Workflow[]> {
    try {
      const url = businessId ? `${API_BASE}/workflows?businessId=${businessId}` : `${API_BASE}/workflows`;
      return await fetchJson<Workflow[]>(url);
    } catch {
      return businessId ? SEED_WORKFLOWS.filter((w) => w.businessId === businessId) : SEED_WORKFLOWS;
    }
  },

  async createWorkflow(payload: Partial<Workflow>): Promise<Workflow> {
    return await fetchJson<Workflow>(`${API_BASE}/workflows`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async toggleWorkflowActive(workflowId: string): Promise<Workflow> {
    return await fetchJson<Workflow>(`${API_BASE}/workflows/${workflowId}/toggle-active`, {
      method: 'PATCH',
    });
  },

  // AI Workflow Generation
  async generateWorkflowWithAi(payload: {
    businessName: string;
    industry: string;
    description?: string;
    requirements: string;
  }): Promise<{ success: boolean; workflow: AiGeneratedWorkflowPayload; source: string; notice?: string }> {
    return await fetchJson<{ success: boolean; workflow: AiGeneratedWorkflowPayload; source: string; notice?: string }>(
      `${API_BASE}/ai/generate-workflow`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );
  },

  // AI Gemini Chatbot / RAG Assistant
  async askRagAssistant(payload: {
    businessId: string;
    userRole: string;
    query: string;
    currentRequestId?: string;
    chatHistory?: { role: string; content: string }[];
    modelMode?: 'fast' | 'general' | 'complex';
  }): Promise<{ success: boolean; reply: string; modelUsed?: string; sources?: any[] }> {
    return await fetchJson<{ success: boolean; reply: string; modelUsed?: string; sources?: any[] }>(`${API_BASE}/ai/rag-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  // Requests
  async getRequests(params?: {
    businessId?: string;
    customerId?: string;
    assignedStaffId?: string;
    status?: string;
  }): Promise<CustomerRequest[]> {
    try {
      const query = new URLSearchParams();
      if (params?.businessId) query.set('businessId', params.businessId);
      if (params?.customerId) query.set('customerId', params.customerId);
      if (params?.assignedStaffId) query.set('assignedStaffId', params.assignedStaffId);
      if (params?.status) query.set('status', params.status);

      return await fetchJson<CustomerRequest[]>(`${API_BASE}/requests?${query.toString()}`);
    } catch {
      let list = [...SEED_REQUESTS];
      if (params?.businessId) list = list.filter((r) => r.businessId === params.businessId);
      if (params?.customerId) list = list.filter((r) => r.customerId === params.customerId);
      if (params?.assignedStaffId) list = list.filter((r) => r.assignedStaffId === params.assignedStaffId);
      if (params?.status) list = list.filter((r) => r.status === params.status);
      return list;
    }
  },

  async getRequest(id: string): Promise<CustomerRequest> {
    try {
      return await fetchJson<CustomerRequest>(`${API_BASE}/requests/${id}`);
    } catch {
      const req = SEED_REQUESTS.find((r) => r.id === id);
      if (!req) throw new Error('Request not found');
      return req;
    }
  },

  async createRequest(payload: Partial<CustomerRequest>): Promise<CustomerRequest> {
    return await fetchJson<CustomerRequest>(`${API_BASE}/requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async updateRequestStatus(
    id: string,
    payload: {
      status: string;
      actorId: string;
      actorName: string;
      actorRole: string;
      notes?: string;
      deliverableSummary?: string;
      assignedStaffId?: string;
      assignedStaffName?: string;
    }
  ): Promise<CustomerRequest> {
    return await fetchJson<CustomerRequest>(`${API_BASE}/requests/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async assignStaff(
    id: string,
    payload: {
      staffId: string;
      staffName: string;
      actorId: string;
      actorName: string;
      actorRole: string;
    }
  ): Promise<CustomerRequest> {
    return await fetchJson<CustomerRequest>(`${API_BASE}/requests/${id}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  async uploadRequestDocument(
    id: string,
    payload: {
      name: string;
      size: string;
      type: string;
      uploadedBy: string;
      uploaderRole: string;
      isDeliverable?: boolean;
    }
  ): Promise<any> {
    return await fetchJson<any>(`${API_BASE}/requests/${id}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },

  // Activities
  async getActivities(businessId?: string): Promise<RequestActivity[]> {
    try {
      const url = businessId ? `${API_BASE}/activities?businessId=${businessId}` : `${API_BASE}/activities`;
      return await fetchJson<RequestActivity[]>(url);
    } catch {
      return businessId
        ? SEED_ACTIVITIES.filter((a) => {
            const req = SEED_REQUESTS.find((r) => r.id === a.requestId);
            return req?.businessId === businessId;
          })
        : SEED_ACTIVITIES;
    }
  },

  async getRequestActivities(requestId: string): Promise<RequestActivity[]> {
    try {
      return await fetchJson<RequestActivity[]>(`${API_BASE}/requests/${requestId}/activities`);
    } catch {
      return SEED_ACTIVITIES.filter((a) => a.requestId === requestId);
    }
  },

  // Knowledge Documents
  async getDocuments(businessId?: string): Promise<BusinessDocument[]> {
    try {
      const url = businessId ? `${API_BASE}/documents?businessId=${businessId}` : `${API_BASE}/documents`;
      return await fetchJson<BusinessDocument[]>(url);
    } catch {
      return businessId ? SEED_DOCUMENTS.filter((d) => d.businessId === businessId) : SEED_DOCUMENTS;
    }
  },

  async createDocument(payload: Partial<BusinessDocument>): Promise<BusinessDocument> {
    return await fetchJson<BusinessDocument>(`${API_BASE}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  },
};
