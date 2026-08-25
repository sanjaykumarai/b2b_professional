export type UserRole = 'OWNER' | 'STAFF' | 'CUSTOMER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  businessId: string;
  avatar?: string;
  department?: string;
  title?: string;
  createdAt: string;
}

export interface Business {
  id: string;
  name: string;
  industry: string;
  description: string;
  ownerId: string;
  logo?: string;
  primaryColor?: string;
  createdAt: string;
  settings: {
    currency: string;
    slaTracking: boolean;
    autoAssignStaff: boolean;
    requireOwnerApproval: boolean;
  };
}

export interface WorkflowField {
  id: string;
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'date' | 'file' | 'boolean' | 'email';
  required: boolean;
  placeholder?: string;
  options?: string[];
  description?: string;
  defaultValue?: string | number | boolean;
}

export interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  order: number;
  responsibleRole: UserRole | string;
  allowedActions: string[];
  statusResult: string;
  slaHours?: number;
  requiresDocumentUpload?: boolean;
  requiresApproval?: boolean;
  color: string;
}

export interface ServiceOffering {
  id: string;
  name: string;
  slug: string;
  description: string;
  estimatedTurnaround: string;
  category: string;
  iconName?: string;
  priceEstimate?: string;
}

export interface Workflow {
  id: string;
  businessId: string;
  name: string;
  description: string;
  businessContext: string;
  isActive: boolean;
  version: number;
  services: ServiceOffering[];
  requiredFields: WorkflowField[];
  steps: WorkflowStep[];
  statuses: string[];
  approvalRequired: boolean;
  staffAssignmentRules: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RequestActivity {
  id: string;
  requestId: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  previousStatus?: string;
  newStatus?: string;
  notes?: string;
  documentUrl?: string;
  documentName?: string;
  timestamp: string;
}

export interface RequestDocument {
  id: string;
  requestId: string;
  name: string;
  size: string;
  type: string;
  uploadedBy: string;
  uploaderRole: UserRole;
  url: string;
  timestamp: string;
  isDeliverable?: boolean;
}

export interface RequestChatMessage {
  id: string;
  requestId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  message: string;
  timestamp: string;
  isAi?: boolean;
}

export interface CustomerRequest {
  id: string;
  businessId: string;
  workflowId: string;
  serviceId: string;
  serviceName: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: string; // e.g. SUBMITTED, IN_REVIEW, ASSIGNED, IN_PROGRESS, WAITING_FOR_CUSTOMER, APPROVAL, COMPLETED, REJECTED
  customerId: string;
  customerName: string;
  customerEmail: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  customData: Record<string, any>;
  documents: RequestDocument[];
  currentStepId: string;
  createdAt: string;
  updatedAt: string;
  dueDate?: string;
  completedAt?: string;
  deliverableSummary?: string;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED';
}

export interface BusinessDocument {
  id: string;
  businessId: string;
  title: string;
  category: string;
  content: string;
  tags: string[];
  uploadedAt: string;
}

export type GeminiChatModelMode = 'fast' | 'general' | 'complex';

export interface RagChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  modelUsed?: string;
  sources?: {
    type: 'workflow' | 'document' | 'request' | 'business';
    title: string;
    snippet: string;
  }[];
}

export interface LoginPayload {
  email: string;
  password?: string;
  role?: UserRole;
  businessId?: string;
}

export interface SignupPayload {
  role: UserRole;
  name: string;
  email: string;
  password?: string;
  // Owner specific
  businessName?: string;
  industry?: string;
  businessDescription?: string;
  // Staff / Customer specific
  businessId?: string;
  title?: string;
  department?: string;
  companyName?: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  business: Business;
  token?: string;
  message?: string;
}

export interface AiGeneratedWorkflowPayload {
  business_context: string;
  workflow_name: string;
  description: string;
  services: {
    name: string;
    description: string;
    turnaround_time: string;
    category: string;
    price_estimate?: string;
  }[];
  required_fields: {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'select' | 'date' | 'file' | 'boolean';
    required: boolean;
    placeholder?: string;
    options?: string[];
  }[];
  workflow_steps: {
    title: string;
    description: string;
    responsible_role: string;
    allowed_actions: string[];
    status_result: string;
    sla_hours: number;
    requires_approval?: boolean;
    color?: string;
  }[];
  approval_required: boolean;
  statuses: string[];
  staff_assignment_rules: string[];
}
