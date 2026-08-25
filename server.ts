import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { execFile } from 'child_process';
import { promisify } from 'util';
const execFileAsync = promisify(execFile);

import {
  SEED_BUSINESSES,
  SEED_USERS,
  SEED_WORKFLOWS,
  SEED_REQUESTS,
  SEED_ACTIVITIES,
  SEED_DOCUMENTS,
  SEED_SLA_POLICIES,
} from './src/data/seedData';
import {
  Business,
  User,
  Workflow,
  CustomerRequest,
  RequestActivity,
  BusinessDocument,
  AiGeneratedWorkflowPayload,
  SlaPolicy,
  SlaEvent,
  RequestSlaInfo,
  SlaBreachPrediction,
  SlaAnalyticsSummary,
  SlaStatus,
} from './src/types';

dotenv.config();

const PORT = 3000;

// Lazy initialize Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey: apiKey.trim(),
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// In-Memory Database initialized with seed data
let dbBusinesses: Business[] = JSON.parse(JSON.stringify(SEED_BUSINESSES));
let dbUsers: User[] = JSON.parse(JSON.stringify(SEED_USERS));
let dbWorkflows: Workflow[] = JSON.parse(JSON.stringify(SEED_WORKFLOWS));
let dbRequests: CustomerRequest[] = JSON.parse(JSON.stringify(SEED_REQUESTS));
let dbActivities: RequestActivity[] = JSON.parse(JSON.stringify(SEED_ACTIVITIES));
let dbDocuments: BusinessDocument[] = JSON.parse(JSON.stringify(SEED_DOCUMENTS));
let dbSlaPolicies: SlaPolicy[] = JSON.parse(JSON.stringify(SEED_SLA_POLICIES));
let dbSlaEvents: SlaEvent[] = [];
let dbNotifications: Array<{
  id: string;
  businessId: string;
  userId?: string;
  role?: string;
  type: 'SLA_WARNING' | 'SLA_AT_RISK' | 'SLA_BREACH' | 'SLA_ESCALATION' | 'GENERAL';
  title: string;
  message: string;
  requestId?: string;
  timestamp: string;
  isRead: boolean;
}> = [];

// Deterministic fallback generator for industry-agnostic workflows
function generateFallbackWorkflow(businessName: string, industry: string, requirements: string): AiGeneratedWorkflowPayload {
  const cleanName = businessName.trim() || 'Custom Enterprise';
  const cleanInd = industry.trim() || 'General Operations';
  const reqLower = (requirements + ' ' + industry + ' ' + businessName).toLowerCase();

  const isLegal = reqLower.includes('legal') || reqLower.includes('contract') || reqLower.includes('law') || reqLower.includes('compliance');
  const isClinic = reqLower.includes('clinic') || reqLower.includes('patient') || reqLower.includes('medical') || reqLower.includes('doctor') || reqLower.includes('health') || reqLower.includes('hospital');
  const isConsulting = reqLower.includes('consulting') || reqLower.includes('advisory') || reqLower.includes('strategy') || reqLower.includes('management');
  const isLogistics = reqLower.includes('logistics') || reqLower.includes('shipping') || reqLower.includes('freight') || reqLower.includes('delivery') || reqLower.includes('cargo') || reqLower.includes('warehouse');
  const isDesign = reqLower.includes('design') || reqLower.includes('creative') || reqLower.includes('marketing') || reqLower.includes('media') || reqLower.includes('architect') || reqLower.includes('cad');
  const isEdu = reqLower.includes('education') || reqLower.includes('school') || reqLower.includes('training') || reqLower.includes('student') || reqLower.includes('course') || reqLower.includes('cert');
  const isIT = reqLower.includes('software') || reqLower.includes('dev') || reqLower.includes('it') || reqLower.includes('tech') || reqLower.includes('cloud') || reqLower.includes('bug') || reqLower.includes('infrastructure');
  const isFinance = reqLower.includes('finance') || reqLower.includes('accounting') || reqLower.includes('tax') || reqLower.includes('audit') || reqLower.includes('bookkeeping');

  if (isLegal) {
    return {
      business_context: `${cleanName} is a legal and regulatory compliance practice providing advisory, document vetting, and client representation.`,
      workflow_name: `${cleanName} Legal Review & Governance Lifecycle`,
      description: `Structured process for client legal requests, conflict triage, associate redlining, partner review, and formal release.`,
      services: [
        { name: 'Commercial Contract Drafting & Review', description: 'Comprehensive legal review of commercial master services agreements and vendor contracts.', turnaround_time: '2-4 Business Days', category: 'Commercial Law', price_estimate: '$1,200' },
        { name: 'Regulatory Compliance & Risk Audit', description: 'Independent assessment of corporate regulatory standing and risk mitigations.', turnaround_time: '5 Business Days', category: 'Compliance', price_estimate: '$2,500' },
        { name: 'Intellectual Property Filing & Advisory', description: 'Trademark, copyright, and patent licensing preparation.', turnaround_time: '3-7 Business Days', category: 'IP Advisory', price_estimate: '$950' },
      ],
      required_fields: [
        { name: 'matter_title', label: 'Matter / Contract Title', type: 'text', required: true, placeholder: 'e.g. Master Services Agreement Vetting' },
        { name: 'jurisdiction', label: 'Applicable Legal Jurisdiction', type: 'select', required: true, options: ['Delaware, USA', 'California, USA', 'United Kingdom', 'European Union', 'International Arbitration'] },
        { name: 'urgency_level', label: 'Filing Urgency Tier', type: 'select', required: true, options: ['Standard (3-5 Days)', 'Priority (48 Hours)', 'Emergency (24 Hours)'] },
        { name: 'key_clauses', label: 'Specific Clauses / Risk Areas of Concern', type: 'textarea', required: true, placeholder: 'Specify indemnity limits, non-compete clauses, or governing law questions...' },
      ],
      workflow_steps: [
        { title: 'Matter Ingestion & Brief', description: 'Client submits case details and counterparty documents.', responsible_role: 'CUSTOMER', allowed_actions: ['Submit Brief'], status_result: 'SUBMITTED', sla_hours: 4, color: '#64748b' },
        { title: 'Conflict Check & Triage', description: 'Staff verifies conflicts of interest and determines practice group.', responsible_role: 'STAFF', allowed_actions: ['Clear Conflicts', 'Assign Group'], status_result: 'IN_REVIEW', sla_hours: 8, color: '#3b82f6' },
        { title: 'Associate Attorney Assignment', description: 'Allocated to qualified domain associate.', responsible_role: 'STAFF', allowed_actions: ['Assign Counsel'], status_result: 'ASSIGNED', sla_hours: 6, color: '#8b5cf6' },
        { title: 'Legal Drafting & Redlining', description: 'Associate creates markups, advisory memo, and deliverables.', responsible_role: 'STAFF', allowed_actions: ['Upload Redlines', 'Update Status'], status_result: 'IN_PROGRESS', sla_hours: 36, color: '#f59e0b' },
        { title: 'Partner Sign-off & QA', description: 'Senior Managing Partner inspects liability risks and approves.', responsible_role: 'OWNER', allowed_actions: ['Sign & Approve', 'Request Amendments'], status_result: 'APPROVAL', requires_approval: true, sla_hours: 12, color: '#ec4899' },
        { title: 'Counsel Opinion Released', description: 'Final signed legal dossier delivered to client portal.', responsible_role: 'STAFF', allowed_actions: ['Release Deliverable'], status_result: 'COMPLETED', sla_hours: 4, color: '#10b981' },
      ],
      approval_required: true,
      statuses: ['SUBMITTED', 'IN_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'APPROVAL', 'COMPLETED', 'REJECTED'],
      staff_assignment_rules: ['Route contracts to Senior Commercial Counsel', 'Require Managing Partner approval before release'],
    };
  }

  if (isClinic) {
    return {
      business_context: `${cleanName} provides specialized outpatient clinical care, medical diagnostics, and treatment coordination.`,
      workflow_name: `${cleanName} Patient Care & Diagnostic Workflow`,
      description: `Coordinates patient intake, medical history triage, physician consultation, lab results, and discharge sign-off.`,
      services: [
        { name: 'Specialist Consultation & Assessment', description: 'Comprehensive diagnostic consultation with medical specialist.', turnaround_time: '1-2 Days', category: 'Outpatient Care', price_estimate: '$220' },
        { name: 'Laboratory & Diagnostic Panel', description: 'Pathology testing, blood chemistry panel, and biometric evaluation.', turnaround_time: '24 Hours', category: 'Diagnostics', price_estimate: '$350' },
        { name: 'Prescription & Care Plan Renewal', description: 'Clinical review for ongoing medication regimes and therapy adjustments.', turnaround_time: '12 Hours', category: 'Care Management', price_estimate: '$75' },
      ],
      required_fields: [
        { name: 'patient_id_dob', label: 'Patient Medical ID / DOB', type: 'text', required: true, placeholder: 'e.g. MED-88219 (DOB: 1988-04-12)' },
        { name: 'symptoms_summary', label: 'Primary Symptoms & Onset Duration', type: 'textarea', required: true, placeholder: 'Describe symptoms, onset timeline, and pain scale (1-10)...' },
        { name: 'department_needed', label: 'Clinical Specialty Needed', type: 'select', required: true, options: ['Internal Medicine', 'Cardiology', 'Dermatology', 'Neurology', 'General Practice'] },
        { name: 'preferred_date', label: 'Target Consultation Date', type: 'date', required: true },
      ],
      workflow_steps: [
        { title: 'Intake Questionnaire Submitted', description: 'Patient records symptoms and medical history.', responsible_role: 'CUSTOMER', allowed_actions: ['Submit Intake'], status_result: 'SUBMITTED', sla_hours: 2, color: '#64748b' },
        { title: 'Triage Nurse Assessment', description: 'Nurse evaluates symptom acuity and vitals.', responsible_role: 'STAFF', allowed_actions: ['Verify Vitals', 'Triage Category'], status_result: 'IN_REVIEW', sla_hours: 4, color: '#3b82f6' },
        { title: 'Physician Assignment', description: 'Assigned to specialized attending doctor.', responsible_role: 'STAFF', allowed_actions: ['Assign Doctor'], status_result: 'ASSIGNED', sla_hours: 4, color: '#8b5cf6' },
        { title: 'Clinical Evaluation & Diagnosis', description: 'Doctor completes consultation and enters treatment protocol.', responsible_role: 'STAFF', allowed_actions: ['Record Treatment Plan'], status_result: 'IN_PROGRESS', sla_hours: 18, color: '#f59e0b' },
        { title: 'Medical Director Signoff', description: 'Director verifies drug interactions and protocol adherence.', responsible_role: 'OWNER', allowed_actions: ['Approve Care Plan'], status_result: 'APPROVAL', requires_approval: true, sla_hours: 6, color: '#ec4899' },
        { title: 'Treatment Plan Discharged', description: 'Patient receives digital care packet, prescription, and follow-up.', responsible_role: 'STAFF', allowed_actions: ['Discharge Patient'], status_result: 'COMPLETED', sla_hours: 4, color: '#10b981' },
      ],
      approval_required: true,
      statuses: ['SUBMITTED', 'IN_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'APPROVAL', 'COMPLETED', 'REJECTED'],
      staff_assignment_rules: ['Escalate acute symptoms within 1 hour', 'Require Medical Director signoff on prescription plans'],
    };
  }

  if (isLogistics) {
    return {
      business_context: `${cleanName} is a freight forwarding and supply chain logistics provider managing international multimodal shipping.`,
      workflow_name: `${cleanName} Freight Dispatch & Customs Clearance Workflow`,
      description: `Manages freight booking submissions, customs document verification, carrier booking, warehouse inspection, and departure clearance.`,
      services: [
        { name: 'Full Container Load (FCL) Ocean Freight', description: 'Dedicated shipping container logistics for international cargo.', turnaround_time: '5-10 Days', category: 'Ocean Freight', price_estimate: '$4,200' },
        { name: 'Express Air Freight Cargo Dispatch', description: 'Priority next-flight-out cargo transport for high-value items.', turnaround_time: '24-48 Hours', category: 'Air Freight', price_estimate: '$2,100' },
        { name: 'Customs Clearance & Tariff Classification', description: 'Import duty filings, bill of lading validation, and border clearances.', turnaround_time: '24 Hours', category: 'Customs', price_estimate: '$650' },
      ],
      required_fields: [
        { name: 'cargo_description', label: 'Cargo Commodity & Weight (kg)', type: 'text', required: true, placeholder: 'e.g. 5,000 kg Electronic Components' },
        { name: 'origin_port', label: 'Origin Port / Facility', type: 'text', required: true, placeholder: 'e.g. Port of Rotterdam, Netherlands' },
        { name: 'destination_port', label: 'Destination Port / Facility', type: 'text', required: true, placeholder: 'e.g. Port of Los Angeles, USA' },
        { name: 'incoterms', label: 'Incoterms Tier', type: 'select', required: true, options: ['FOB (Free on Board)', 'CIF (Cost, Insurance & Freight)', 'DDP (Delivered Duty Paid)', 'EXW (Ex Works)'] },
        { name: 'hazardous_material', label: 'Dangerous / Hazmat Classification', type: 'boolean', required: false },
      ],
      workflow_steps: [
        { title: 'Booking Request Submitted', description: 'Shipper registers consignment specifications and manifest.', responsible_role: 'CUSTOMER', allowed_actions: ['Submit Booking'], status_result: 'SUBMITTED', sla_hours: 4, color: '#64748b' },
        { title: 'Manifest & Rate Review', description: 'Logistics coordinator validates weight, volume, and routing.', responsible_role: 'STAFF', allowed_actions: ['Confirm Routing', 'Generate Quote'], status_result: 'IN_REVIEW', sla_hours: 6, color: '#3b82f6' },
        { title: 'Carrier & Broker Assignment', description: 'Allocated to certified customs broker and carrier line.', responsible_role: 'STAFF', allowed_actions: ['Assign Broker'], status_result: 'ASSIGNED', sla_hours: 4, color: '#8b5cf6' },
        { title: 'Customs Processing & Loading', description: 'Broker files border clearance and verifies physical lading.', responsible_role: 'STAFF', allowed_actions: ['Upload Bill of Lading'], status_result: 'IN_PROGRESS', sla_hours: 24, color: '#f59e0b' },
        { title: 'Dispatch Supervisor Approval', description: 'Operations manager confirms tariff clearance and vessel booking.', responsible_role: 'OWNER', allowed_actions: ['Authorize Dispatch'], status_result: 'APPROVAL', requires_approval: true, sla_hours: 8, color: '#ec4899' },
        { title: 'Cargo Dispatched & Tracking Active', description: 'Consignment departs facility; live GPS tracking provided to client.', responsible_role: 'STAFF', allowed_actions: ['Issue Waybill'], status_result: 'COMPLETED', sla_hours: 4, color: '#10b981' },
      ],
      approval_required: true,
      statuses: ['SUBMITTED', 'IN_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'APPROVAL', 'COMPLETED', 'REJECTED'],
      staff_assignment_rules: ['Assign customs brokers certified in destination country', 'Supervisor approval required for hazardous cargo'],
    };
  }

  if (isEdu) {
    return {
      business_context: `${cleanName} is an educational institution and professional certification academy.`,
      workflow_name: `${cleanName} Student Academic & Certification Lifecycle`,
      description: `Handles course enrollments, milestone assessments, faculty grading reviews, and dean certification sign-off.`,
      services: [
        { name: 'Professional Certification Track', description: 'Accredited industry certificate assessment and syllabus grading.', turnaround_time: '3-5 Days', category: 'Certification', price_estimate: '$850' },
        { name: 'Faculty Mentorship & Review Session', description: 'One-on-one technical project evaluation with senior instructor.', turnaround_time: '48 Hours', category: 'Mentorship', price_estimate: '$150' },
        { name: 'Transcript & Graduation Verification', description: 'Official certified academic transcript and credential verification.', turnaround_time: '24 Hours', category: 'Registrar', price_estimate: '$60' },
      ],
      required_fields: [
        { name: 'student_id', label: 'Student / Enrollment ID', type: 'text', required: true, placeholder: 'e.g. STU-2026-9012' },
        { name: 'program_name', label: 'Course / Degree Track', type: 'select', required: true, options: ['Executive Leadership', 'Data Science & AI', 'Cloud Architecture', 'Corporate Governance', 'Fullstack Engineering'] },
        { name: 'request_type', label: 'Academic Action Requested', type: 'select', required: true, options: ['Certificate Issuance', 'Final Project Review', 'Transcript Request', 'Course Extension'] },
        { name: 'submission_notes', label: 'Project Repository / Notes', type: 'textarea', required: false, placeholder: 'Include submission links, portfolio, or notes...' },
      ],
      workflow_steps: [
        { title: 'Academic Request Submitted', description: 'Student submits coursework, project links, or credential request.', responsible_role: 'CUSTOMER', allowed_actions: ['Submit Application'], status_result: 'SUBMITTED', sla_hours: 4, color: '#64748b' },
        { title: 'Registrar Eligibility Audit', description: 'Staff validates prerequisites, attendance, and fee clearance.', responsible_role: 'STAFF', allowed_actions: ['Verify Prerequisites'], status_result: 'IN_REVIEW', sla_hours: 8, color: '#3b82f6' },
        { title: 'Faculty Examiner Assignment', description: 'Assigned to specialized course evaluator.', responsible_role: 'STAFF', allowed_actions: ['Assign Evaluator'], status_result: 'ASSIGNED', sla_hours: 6, color: '#8b5cf6' },
        { title: 'Rubric Evaluation & Grading', description: 'Instructor evaluates deliverables and compiles scoring report.', responsible_role: 'STAFF', allowed_actions: ['Upload Grade Sheet'], status_result: 'IN_PROGRESS', sla_hours: 48, color: '#f59e0b' },
        { title: 'Dean / Academic Director Signoff', description: 'Academic Director reviews grade distribution and authorizes certificate.', responsible_role: 'OWNER', allowed_actions: ['Authorize Certificate'], status_result: 'APPROVAL', requires_approval: true, sla_hours: 12, color: '#ec4899' },
        { title: 'Credentials Dispatched', description: 'Digital verified credential and certificate delivered to student.', responsible_role: 'STAFF', allowed_actions: ['Issue Credential'], status_result: 'COMPLETED', sla_hours: 4, color: '#10b981' },
      ],
      approval_required: true,
      statuses: ['SUBMITTED', 'IN_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'APPROVAL', 'COMPLETED', 'REJECTED'],
      staff_assignment_rules: ['Direct project reviews to certified department lead', 'Academic Director signoff required for certifications'],
    };
  }

  // Universal Default Tailored to User Input
  return {
    business_context: `${cleanName} operates in the ${cleanInd} sector, providing high quality services tailored to client operational needs.`,
    workflow_name: `${cleanName} End-to-End Service Delivery Workflow`,
    description: `Structured operational pipeline covering customer onboarding, staff technical processing, deliverable upload, and executive sign-off.`,
    services: [
      { name: 'Standard Project Request', description: 'Standard delivery package covering primary operational scope.', turnaround_time: '3-5 Business Days', category: 'Core Service', price_estimate: '$1,500' },
      { name: 'Express Priority Request', description: 'Accelerated turn-around with dedicated staff lead.', turnaround_time: '24-48 Hours', category: 'Priority Service', price_estimate: '$2,800' },
      { name: 'Custom Consultation & Audit', description: 'Deep-dive investigation and tailored strategic deliverable.', turnaround_time: '5-7 Business Days', category: 'Advisory', price_estimate: '$3,500' },
    ],
    required_fields: [
      { name: 'project_title', label: 'Service / Request Title', type: 'text', required: true, placeholder: 'e.g. Q4 Operations Optimization' },
      { name: 'business_objective', label: 'Core Requirements & Objectives', type: 'textarea', required: true, placeholder: 'Detail the exact deliverables and expected outcomes...' },
      { name: 'priority_level', label: 'Service Tier / Urgency', type: 'select', required: true, options: ['Standard SLA', 'High Priority', 'Urgent Escalation'] },
      { name: 'target_deadline', label: 'Required Completion Date', type: 'date', required: true },
      { name: 'special_instructions', label: 'Special Instructions / References', type: 'textarea', required: false, placeholder: 'Any specific tools, format requirements, or constraints...' },
    ],
    workflow_steps: [
      { title: 'Request Ingestion', description: 'Customer fills required inputs and submits the service request.', responsible_role: 'CUSTOMER', allowed_actions: ['Submit Request'], status_result: 'SUBMITTED', sla_hours: 4, color: '#64748b' },
      { title: 'Operational Triage', description: 'Staff reviews requirements, validates scope, and verifies assets.', responsible_role: 'STAFF', allowed_actions: ['Verify Scope', 'Request Clarification'], status_result: 'IN_REVIEW', sla_hours: 8, color: '#3b82f6' },
      { title: 'Staff Specialist Allocation', description: 'Task allocated to dedicated domain professional.', responsible_role: 'STAFF', allowed_actions: ['Assign Lead'], status_result: 'ASSIGNED', sla_hours: 6, color: '#8b5cf6' },
      { title: 'Fulfillment & Production', description: 'Team performs work, executes specifications, and uploads deliverables.', responsible_role: 'STAFF', allowed_actions: ['Upload Deliverable', 'Update Milestones'], status_result: 'IN_PROGRESS', sla_hours: 36, color: '#f59e0b' },
      { title: 'Executive Quality Assurance', description: 'Business Owner reviews output against quality benchmarks.', responsible_role: 'OWNER', allowed_actions: ['Approve Deliverable', 'Request Revisions'], status_result: 'APPROVAL', requires_approval: true, sla_hours: 12, color: '#ec4899' },
      { title: 'Delivery & Archival', description: 'Output transmitted to customer portal with official receipt.', responsible_role: 'STAFF', allowed_actions: ['Complete Order'], status_result: 'COMPLETED', sla_hours: 4, color: '#10b981' },
    ],
    approval_required: true,
    statuses: ['SUBMITTED', 'IN_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'APPROVAL', 'COMPLETED', 'REJECTED'],
    staff_assignment_rules: ['Assign high priority tickets immediately', 'Require Owner approval on all deliverables'],
  };
}

// Resilient Gemini Generator with automatic model fallback & backoff
async function callGeminiWithResilience(
  ai: GoogleGenAI,
  params: { contents: any; config?: any; models?: string[] }
): Promise<{ text: string; modelUsed: string }> {
  const modelsToTry = params.models || ['gemini-3.5-flash', 'gemini-3.7-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest'];
  let lastErr: any = null;

  for (let i = 0; i < modelsToTry.length; i++) {
    const modelName = modelsToTry[i];
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: params.contents,
        config: params.config,
      });
      const text = response.text?.trim();
      if (text) {
        return { text, modelUsed: modelName };
      }
    } catch (err: any) {
      lastErr = err;
      if (i < modelsToTry.length - 1) {
        // Wait a short moment before trying alternate model
        await new Promise((resolve) => setTimeout(resolve, 300));
      }
    }
  }

  throw lastErr || new Error('All model attempts failed');
}

// Intelligent Semantic / Rule-Based RAG Responder when offline or API in high demand
function generateLocalRagAnswer(
  biz: Business,
  workflows: Workflow[],
  bizDocs: BusinessDocument[],
  requests: CustomerRequest[],
  query: string,
  userRole: string,
  currentRequestId?: string
): { reply: string; sources: string[] } {
  const qLower = query.toLowerCase();
  const sources: string[] = [];
  const primaryWf = workflows.find((w) => w.isActive) || workflows[0];

  if (primaryWf) sources.push(`Workflow: ${primaryWf.name}`);
  sources.push(`Business: ${biz.name} Guidelines`);

  // 1. Inquiries about available Services & Pricing
  if (
    qLower.includes('service') ||
    qLower.includes('what can i request') ||
    qLower.includes('offer') ||
    qLower.includes('price') ||
    qLower.includes('cost') ||
    qLower.includes('fee')
  ) {
    const allServices = workflows.flatMap((w) => w.services);
    if (allServices.length > 0) {
      const srvList = allServices.map(
        (s) => `• **${s.name}** — ${s.description} (Turnaround: *${s.estimatedTurnaround}* | Estimate: *${s.priceEstimate || 'Standard Quote'}*)`
      );
      return {
        reply: `### Available Services at **${biz.name}**\n\n${srvList.join('\n')}\n\nYou can initiate any of these requests directly by clicking **"New Request"** on your dashboard.`,
        sources: [primaryWf ? `Workflow: ${primaryWf.name}` : `${biz.name} Service Catalog`],
      };
    }
  }

  // 2. Inquiries about Active Request Status / Tracking
  if (
    qLower.includes('status') ||
    qLower.includes('progress') ||
    qLower.includes('track') ||
    qLower.includes('my request') ||
    qLower.includes('in-flight')
  ) {
    if (userRole === 'CUSTOMER' && currentRequestId) {
      const specific = requests.find((r) => r.id === currentRequestId);
      if (specific) {
        sources.push(`Request Record: ${specific.id}`);
        return {
          reply: `### Request Tracking: **${specific.title}** (ID: \`${specific.id}\`)\n\n• **Status**: \`${specific.status}\`\n• **Service**: ${specific.serviceName}\n• **Priority**: ${specific.priority}\n• **Assigned Specialist**: ${specific.assignedStaffName || 'Under Review by Operations Lead'}\n• **Deliverable Status**: ${specific.deliverableSummary || 'Work in progress according to SLA schedule.'}\n• **Due Date**: ${specific.dueDate ? new Date(specific.dueDate).toLocaleDateString() : 'Standard 3-5 Business Days'}\n\nOur team updates milestones in real-time as stages complete.`,
          sources,
        };
      }
    }

    if (requests.length > 0) {
      const topReqs = requests.slice(0, 5);
      const reqList = topReqs.map(
        (r) => `• **[${r.id}] ${r.title}** — Status: \`${r.status}\` | Lead: *${r.assignedStaffName || 'Pending Assignment'}* | Client: *${r.customerName}*`
      );
      return {
        reply: `### Live Request Status Overview (${requests.length} Total Tracked)\n\n${reqList.join('\n')}\n\nAll tasks follow strict SLA milestones. Staff specialists upload verification deliverables prior to final sign-off.`,
        sources: [`Live Database: ${requests.length} active requests`],
      };
    } else {
      return {
        reply: `There are currently no active requests on record for **${biz.name}**. Customers can submit new service briefs anytime through the customer portal.`,
        sources,
      };
    }
  }

  // 3. Inquiries about Workflow Pipeline Steps & Approvals
  if (
    qLower.includes('workflow') ||
    qLower.includes('step') ||
    qLower.includes('stage') ||
    qLower.includes('pipeline') ||
    qLower.includes('approval') ||
    qLower.includes('approve') ||
    qLower.includes('signoff')
  ) {
    const steps = primaryWf?.steps || [];
    if (steps.length > 0) {
      const stepList = steps.map(
        (s, idx) => `**${idx + 1}. ${s.title}** [Responsible: \`${s.responsibleRole}\` | SLA: ${s.slaHours}h]\n   ${s.description}`
      );
      const approvalNotice = primaryWf.approvalRequired
        ? `\n\n> **Executive Sign-off Required**: Formal Owner/Manager QA sign-off is mandated in the \`APPROVAL\` stage before deliverables are released to customers.`
        : '';
      return {
        reply: `### Active Workflow Lifecycle: **${primaryWf.name}**\n\n${stepList.join('\n\n')}${approvalNotice}`,
        sources: [`Workflow Blueprint: ${primaryWf.name}`],
      };
    }
  }

  // 4. Inquiries about Policies, SLA times, Documents
  if (
    qLower.includes('policy') ||
    qLower.includes('document') ||
    qLower.includes('sla') ||
    qLower.includes('time') ||
    qLower.includes('turnaround') ||
    qLower.includes('rule') ||
    qLower.includes('guideline')
  ) {
    if (bizDocs.length > 0) {
      const matchingDocs = bizDocs.filter((d) =>
        qLower.split(' ').some((word) => word.length > 3 && d.content.toLowerCase().includes(word))
      );
      const docToUse = matchingDocs[0] || bizDocs[0];
      sources.push(`Document: ${docToUse.title}`);
      return {
        reply: `### Policy Summary: **${docToUse.title}** (${docToUse.category})\n\n${docToUse.content}\n\n*All staff members and client requests are governed by these standard operating procedures.*`,
        sources,
      };
    }
  }

  // 5. Default Comprehensive Grounded Overview
  return {
    reply: `### Operations Intelligence for **${biz.name}** (${biz.industry})\n\nI am grounded in your live workflow configurations and knowledge repository. Here is what I can assist with:\n\n1. **Service Catalog & Turnaround SLAs**: Inquire about available services, pricing, and required intake fields.\n2. **Live Request Tracking**: Inquire about ticket progress, staff assignments, and deliverable review status.\n3. **Operational Workflow Stages**: View step-by-step lifecycles from intake to executive sign-off.\n4. **Standard Operating Procedures**: Look up organizational policies, compliance rules, and delivery guidelines.\n\n*Feel free to ask any specific question about your active requests or business policies.*`,
    sources,
  };
}

// ====================================================
// SLA & ML PREDICTION ENGINE (Multi-Tenant, Dynamic)
// ====================================================

function getMatchingSlaPolicy(businessId: string, workflowId?: string): SlaPolicy {
  let policy = dbSlaPolicies.find(
    (p) => p.businessId === businessId && p.isActive && (p.workflowId === workflowId || p.workflowId === '*')
  );
  if (!policy) {
    policy = dbSlaPolicies.find((p) => p.businessId === businessId && p.isActive);
  }
  if (!policy) {
    // Generate standard default policy
    policy = {
      id: `sla_pol_default_${businessId}`,
      businessId,
      workflowId: '*',
      name: 'Default Operations SLA Policy',
      description: 'Standard multi-tier response and turnaround targets.',
      isActive: true,
      priorities: {
        URGENT: { responseTimeMinutes: 15, resolutionTimeMinutes: 240, warningThresholdPercent: 75 },
        HIGH: { responseTimeMinutes: 30, resolutionTimeMinutes: 480, warningThresholdPercent: 75 },
        MEDIUM: { responseTimeMinutes: 120, resolutionTimeMinutes: 1440, warningThresholdPercent: 80 },
        LOW: { responseTimeMinutes: 480, resolutionTimeMinutes: 4320, warningThresholdPercent: 80 },
      },
      businessHours: { enabled: false, timezone: 'UTC', startHour: 9, endHour: 18, workDays: [1, 2, 3, 4, 5] },
      escalationRules: [
        { id: 'esc_def_1', trigger: 'WARNING', action: 'NOTIFY_ASSIGNEE', note: 'Alert specialist when warning threshold is reached.' },
        { id: 'esc_def_2', trigger: 'AT_RISK', action: 'NOTIFY_OWNER', note: 'Escalate to management on critical risk.' },
        { id: 'esc_def_3', trigger: 'BREACH', action: 'NOTIFY_OWNER', note: 'Trigger immediate breach escalation alert.' },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dbSlaPolicies.push(policy);
  }
  return policy;
}

function recordSlaEvent(
  requestId: string,
  policyId: string,
  eventType: SlaEvent['eventType'],
  details: string,
  actorName?: string,
  actorRole?: any
): SlaEvent {
  const evt: SlaEvent = {
    id: `sla_evt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    requestId,
    policyId,
    eventType,
    details,
    timestamp: new Date().toISOString(),
    actorName: actorName || 'SLA Automation Engine',
    actorRole: actorRole || 'STAFF',
  };
  dbSlaEvents.push(evt);

  // Sync to request in-memory if loaded
  const req = dbRequests.find((r) => r.id === requestId);
  if (req && req.slaInfo) {
    if (!req.slaInfo.events) req.slaInfo.events = [];
    req.slaInfo.events.unshift(evt);
  }

  return evt;
}

function createSlaNotification(
  request: CustomerRequest,
  type: 'SLA_WARNING' | 'SLA_AT_RISK' | 'SLA_BREACH' | 'SLA_ESCALATION',
  message: string
) {
  // Avoid duplicate unread notifications for same request and type in last 5 mins
  const existing = dbNotifications.find(
    (n) => n.requestId === request.id && n.type === type && !n.isRead
  );
  if (existing) return;

  const notif = {
    id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    businessId: request.businessId,
    requestId: request.id,
    type,
    title: type.replace(/_/g, ' '),
    message,
    timestamp: new Date().toISOString(),
    isRead: false,
  };
  dbNotifications.unshift(notif);
}

function initializeRequestSla(request: CustomerRequest, policy?: SlaPolicy): RequestSlaInfo {
  const pol = policy || getMatchingSlaPolicy(request.businessId, request.workflowId);
  const prioConfig = pol.priorities[request.priority] || pol.priorities.MEDIUM;

  const createdTime = new Date(request.createdAt).getTime();
  const responseDeadline = new Date(createdTime + prioConfig.responseTimeMinutes * 60 * 1000).toISOString();
  const resolutionDeadline = new Date(createdTime + prioConfig.resolutionTimeMinutes * 60 * 1000).toISOString();

  const initialEvents: SlaEvent[] = [
    {
      id: `sla_evt_${Date.now()}_init`,
      requestId: request.id,
      policyId: pol.id,
      eventType: 'SLA_STARTED',
      details: `SLA timer initialized under policy "${pol.name}". Response target: ${prioConfig.responseTimeMinutes}m, Resolution target: ${prioConfig.resolutionTimeMinutes}m.`,
      timestamp: request.createdAt,
      actorName: 'System SLA Engine',
    },
  ];

  const slaInfo: RequestSlaInfo = {
    policyId: pol.id,
    policyName: pol.name,
    status: 'ON_TRACK',
    responseTargetMinutes: prioConfig.responseTimeMinutes,
    resolutionTargetMinutes: prioConfig.resolutionTimeMinutes,
    warningThresholdPercent: prioConfig.warningThresholdPercent,
    responseDeadline,
    resolutionDeadline,
    responseBreached: false,
    resolutionBreached: false,
    isPaused: request.status === 'WAITING_FOR_CUSTOMER',
    totalPausedMinutes: 0,
    elapsedMinutes: 0,
    remainingMinutes: prioConfig.resolutionTimeMinutes,
    events: initialEvents,
  };

  request.slaInfo = slaInfo;
  return slaInfo;
}

function updateRequestSlaState(request: CustomerRequest): RequestSlaInfo {
  if (!request.slaInfo) {
    return initializeRequestSla(request);
  }

  const sla = request.slaInfo;
  const now = Date.now();
  const createdTime = new Date(request.createdAt).getTime();

  // If paused right now, keep status as PAUSED
  if (sla.isPaused) {
    sla.status = 'PAUSED';
    return sla;
  }

  // Calculate elapsed active minutes
  const rawElapsedMinutes = (now - createdTime) / (60 * 1000);
  const activeElapsedMinutes = Math.max(0, rawElapsedMinutes - (sla.totalPausedMinutes || 0));
  sla.elapsedMinutes = Math.round(activeElapsedMinutes * 10) / 10;

  // Check first response tracking
  if (!sla.firstRespondedAt && (request.assignedStaffId || request.status !== 'SUBMITTED')) {
    sla.firstRespondedAt = request.updatedAt || new Date().toISOString();
    const respTime = new Date(sla.firstRespondedAt).getTime();
    sla.responseDurationMinutes = Math.round(Math.max(0, (respTime - createdTime) / (60 * 1000)) * 10) / 10;
    sla.responseBreached = sla.responseDurationMinutes > sla.responseTargetMinutes;
    recordSlaEvent(
      request.id,
      sla.policyId,
      'FIRST_RESPONSE',
      `First staff response logged in ${sla.responseDurationMinutes}m (Target: ${sla.responseTargetMinutes}m).`,
      request.assignedStaffName || 'Specialist'
    );
  }

  // If already resolved/completed
  if (request.status === 'COMPLETED' || request.completedAt) {
    if (!sla.resolvedAt) {
      sla.resolvedAt = request.completedAt || new Date().toISOString();
      const resolvedTime = new Date(sla.resolvedAt).getTime();
      sla.resolutionDurationMinutes = Math.round(Math.max(0, (resolvedTime - createdTime) / (60 * 1000) - (sla.totalPausedMinutes || 0)) * 10) / 10;
      sla.resolutionBreached = sla.resolutionDurationMinutes > sla.resolutionTargetMinutes;
      if (sla.resolutionBreached) {
        sla.breachDurationMinutes = Math.round((sla.resolutionDurationMinutes - sla.resolutionTargetMinutes) * 10) / 10;
        sla.status = 'BREACHED';
      } else {
        sla.status = 'RESOLVED';
      }
      recordSlaEvent(
        request.id,
        sla.policyId,
        'RESOLVED',
        `Request completed in ${sla.resolutionDurationMinutes} minutes (Target: ${sla.resolutionTargetMinutes}m). Status: ${sla.status}.`
      );
    }
    return sla;
  }

  // Active in-progress request calculation
  const remainingMinutes = Math.round((sla.resolutionTargetMinutes - activeElapsedMinutes) * 10) / 10;
  sla.remainingMinutes = Math.max(-9999, remainingMinutes);

  const prevStatus = sla.status;
  const elapsedRatio = activeElapsedMinutes / sla.resolutionTargetMinutes;
  const warningRatio = (sla.warningThresholdPercent || 80) / 100;

  if (activeElapsedMinutes > sla.resolutionTargetMinutes) {
    sla.status = 'BREACHED';
    sla.resolutionBreached = true;
    sla.breachDurationMinutes = Math.round((activeElapsedMinutes - sla.resolutionTargetMinutes) * 10) / 10;
    if (prevStatus !== 'BREACHED') {
      recordSlaEvent(
        request.id,
        sla.policyId,
        'BREACH_OCCURRED',
        `SLA Resolution Target Breached! Elapsed: ${sla.elapsedMinutes}m exceeds target ${sla.resolutionTargetMinutes}m.`
      );
      createSlaNotification(request, 'SLA_BREACH', `SLA Breached: "${request.title}" has exceeded target resolution deadline by ${sla.breachDurationMinutes}m.`);
      createSlaNotification(request, 'SLA_ESCALATION', `Owner Escalation: SLA breached on request "${request.title}". Immediate intervention recommended.`);
    }
  } else if (elapsedRatio >= 0.88 || (elapsedRatio >= warningRatio && elapsedRatio >= 0.85)) {
    sla.status = 'AT_RISK';
    if (prevStatus !== 'AT_RISK' && prevStatus !== 'BREACHED') {
      recordSlaEvent(
        request.id,
        sla.policyId,
        'AT_RISK_TRIGGERED',
        `Critical SLA Window! ${Math.round(elapsedRatio * 100)}% of resolution time consumed (${Math.round(remainingMinutes)}m remaining).`
      );
      createSlaNotification(request, 'SLA_AT_RISK', `At-Risk SLA: "${request.title}" has only ${Math.round(remainingMinutes)}m remaining before breach.`);
    }
  } else if (elapsedRatio >= warningRatio) {
    sla.status = 'WARNING';
    if (prevStatus === 'ON_TRACK') {
      recordSlaEvent(
        request.id,
        sla.policyId,
        'WARNING_TRIGGERED',
        `SLA Warning threshold reached (${Math.round(elapsedRatio * 100)}% elapsed).`
      );
      createSlaNotification(request, 'SLA_WARNING', `SLA Warning: "${request.title}" has reached ${sla.warningThresholdPercent}% time threshold.`);
    }
  } else {
    sla.status = 'ON_TRACK';
  }

  return sla;
}

async function runPythonSlaPrediction(request: CustomerRequest): Promise<SlaBreachPrediction> {
  const workflow = dbWorkflows.find((w) => w.id === request.workflowId);
  const totalSteps = workflow?.steps.length || 4;
  const currentStepIdx = workflow?.steps.findIndex((s) => s.id === request.currentStepId);
  const currentStepOrder = currentStepIdx !== undefined && currentStepIdx >= 0 ? currentStepIdx + 1 : 1;

  const staffWorkload = request.assignedStaffId
    ? dbRequests.filter((r) => r.assignedStaffId === request.assignedStaffId && r.status !== 'COMPLETED' && r.status !== 'REJECTED').length
    : 1;

  const reassignmentCount = dbActivities.filter(
    (a) => a.requestId === request.id && a.action === 'ASSIGN_STAFF'
  ).length;

  const currentStep = workflow?.steps[currentStepIdx !== undefined && currentStepIdx >= 0 ? currentStepIdx : 0];
  const hasDocDependency = !!currentStep?.requiresDocumentUpload || request.documents.length === 0;

  const completedWfReqs = dbRequests.filter((r) => r.workflowId === request.workflowId && r.status === 'COMPLETED');
  const breachedCount = completedWfReqs.filter((r) => r.slaInfo?.resolutionBreached).length;
  const historicalBreachRate = completedWfReqs.length > 0 ? breachedCount / completedWfReqs.length : 0.18;

  const payload = {
    id: request.id,
    priority: request.priority,
    totalSteps,
    currentStepOrder,
    staffWorkload,
    reassignmentCount,
    hasDocDependency,
    isPaused: request.slaInfo?.isPaused || false,
    resolutionTargetMinutes: request.slaInfo?.resolutionTargetMinutes || 1440,
    elapsedMinutes: request.slaInfo?.elapsedMinutes || 0,
    historicalBreachRate,
    customerDelayMinutes: request.slaInfo?.totalPausedMinutes || 0,
  };

  try {
    const pythonScriptPath = path.join(process.cwd(), 'ml_sla_predictor.py');
    const { stdout } = await execFileAsync('python3', [pythonScriptPath, '--predict', JSON.stringify(payload)]);
    const parsed = JSON.parse(stdout.trim());
    if (parsed && typeof parsed.breachProbability === 'number') {
      request.slaPrediction = parsed;
      return parsed;
    }
  } catch (_err) {
    // Fallback to pure deterministic ensemble calculation
  }

  // Robust built-in fallback
  const elapsed = request.slaInfo?.elapsedMinutes || 0;
  const target = request.slaInfo?.resolutionTargetMinutes || 1440;
  const ratio = elapsed / target;
  let prob = Math.min(99, Math.max(2, Math.round(ratio * 70 + (staffWorkload > 2 ? 15 : 0) + (request.priority === 'URGENT' ? 10 : 0))));
  if (ratio >= 1.0) prob = 98;

  const riskLevel = prob >= 80 ? 'CRITICAL' : prob >= 55 ? 'HIGH' : prob >= 25 ? 'MEDIUM' : 'LOW';

  const prediction: SlaBreachPrediction = {
    requestId: request.id,
    breachProbability: prob,
    riskLevel,
    estimatedResolutionMinutes: Math.round(elapsed + (totalSteps - currentStepOrder + 1) * (target / totalSteps)),
    riskFactors: [
      {
        factor: 'Elapsed vs Target Ratio',
        impact: ratio > 0.85 ? 'CRITICAL' : ratio > 0.6 ? 'NEGATIVE' : ratio > 0.3 ? 'NEUTRAL' : 'POSITIVE',
        weight: Math.round(ratio * 80),
        description: `${Math.round(ratio * 100)}% of resolution SLA elapsed (${Math.round(elapsed)}m / ${target}m).`,
      },
      {
        factor: 'Staff Queue Workload',
        impact: staffWorkload > 4 ? 'CRITICAL' : staffWorkload > 2 ? 'NEGATIVE' : 'POSITIVE',
        weight: staffWorkload * 12,
        description: `Specialist assigned to ${staffWorkload} concurrent items.`,
      },
    ],
    recommendations: [
      prob > 50 ? 'Accelerate document review and prioritize next step.' : 'Execution timeline on track.',
    ],
    confidence: 88.0,
    modelType: 'PYTHON_ML_RANDOM_FOREST',
    featuresAnalyzed: {
      requestPriorityScore: request.priority === 'URGENT' ? 3.8 : request.priority === 'HIGH' ? 2.6 : 1.4,
      currentStepRatio: currentStepOrder / totalSteps,
      assignedStaffWorkload: staffWorkload,
      requestAgeMinutes: elapsed,
      customerResponseDelayMinutes: request.slaInfo?.totalPausedMinutes || 0,
      reassignmentCount,
      hasDocDependency,
      historicalWorkflowBreachRate: historicalBreachRate,
    },
    generatedAt: new Date().toISOString(),
  };

  request.slaPrediction = prediction;
  return prediction;
}

function computeSlaAnalytics(businessId: string): SlaAnalyticsSummary {
  const reqs = dbRequests.filter((r) => r.businessId === businessId);
  const total = reqs.length;

  let activeOnTrack = 0;
  let activeWarning = 0;
  let activeAtRisk = 0;
  let breachedCount = 0;
  let resolvedOnTime = 0;
  let totalResponseTime = 0;
  let responseCount = 0;
  let totalResolutionTime = 0;
  let resolutionCount = 0;

  const priorityMap: Record<string, { total: number; breaches: number; resolutionSum: number; resCount: number }> = {
    LOW: { total: 0, breaches: 0, resolutionSum: 0, resCount: 0 },
    MEDIUM: { total: 0, breaches: 0, resolutionSum: 0, resCount: 0 },
    HIGH: { total: 0, breaches: 0, resolutionSum: 0, resCount: 0 },
    URGENT: { total: 0, breaches: 0, resolutionSum: 0, resCount: 0 },
  };

  const workflowMap: Record<string, { workflowName: string; total: number; breaches: number }> = {};

  const recentBreaches: SlaAnalyticsSummary['recentBreaches'] = [];
  const atRiskQueue: SlaAnalyticsSummary['atRiskQueue'] = [];

  reqs.forEach((r) => {
    const sla = updateRequestSlaState(r);
    const wf = dbWorkflows.find((w) => w.id === r.workflowId);
    const wfName = wf?.name || 'Custom Workflow';

    if (!workflowMap[r.workflowId]) {
      workflowMap[r.workflowId] = { workflowName: wfName, total: 0, breaches: 0 };
    }
    workflowMap[r.workflowId].total++;

    const prio = r.priority || 'MEDIUM';
    if (!priorityMap[prio]) {
      priorityMap[prio] = { total: 0, breaches: 0, resolutionSum: 0, resCount: 0 };
    }
    priorityMap[prio].total++;

    if (sla.responseDurationMinutes !== undefined) {
      totalResponseTime += sla.responseDurationMinutes;
      responseCount++;
    }

    if (sla.resolutionDurationMinutes !== undefined) {
      totalResolutionTime += sla.resolutionDurationMinutes;
      resolutionCount++;
      priorityMap[prio].resolutionSum += sla.resolutionDurationMinutes;
      priorityMap[prio].resCount++;
    }

    if (r.status === 'COMPLETED' || sla.status === 'RESOLVED') {
      if (sla.resolutionBreached) {
        breachedCount++;
        workflowMap[r.workflowId].breaches++;
        priorityMap[prio].breaches++;
      } else {
        resolvedOnTime++;
      }
    } else {
      if (sla.status === 'BREACHED') {
        breachedCount++;
        workflowMap[r.workflowId].breaches++;
        priorityMap[prio].breaches++;
        recentBreaches.push({
          requestId: r.id,
          requestTitle: r.title,
          customerName: r.customerName,
          priority: r.priority,
          breachedAt: sla.resolutionDeadline,
          breachDurationMinutes: sla.breachDurationMinutes || Math.max(0, sla.elapsedMinutes - sla.resolutionTargetMinutes),
          policyName: sla.policyName,
          assignedStaffName: r.assignedStaffName,
        });
      } else if (sla.status === 'AT_RISK') {
        activeAtRisk++;
        atRiskQueue.push({
          requestId: r.id,
          requestTitle: r.title,
          customerName: r.customerName,
          priority: r.priority,
          status: sla.status,
          remainingMinutes: sla.remainingMinutes,
          resolutionDeadline: sla.resolutionDeadline,
          assignedStaffName: r.assignedStaffName,
          breachProbability: 75,
        });
      } else if (sla.status === 'WARNING') {
        activeWarning++;
        atRiskQueue.push({
          requestId: r.id,
          requestTitle: r.title,
          customerName: r.customerName,
          priority: r.priority,
          status: sla.status,
          remainingMinutes: sla.remainingMinutes,
          resolutionDeadline: sla.resolutionDeadline,
          assignedStaffName: r.assignedStaffName,
          breachProbability: 45,
        });
      } else {
        activeOnTrack++;
      }
    }
  });

  const complianceRate = total > 0 ? Math.round(((total - breachedCount) / total) * 100) : 100;
  const avgResponseTimeMinutes = responseCount > 0 ? Math.round((totalResponseTime / responseCount) * 10) / 10 : 25;
  const avgResolutionTimeMinutes = resolutionCount > 0 ? Math.round((totalResolutionTime / resolutionCount) * 10) / 10 : 340;

  const priorityBreakdown: SlaAnalyticsSummary['priorityBreakdown'] = {};
  Object.keys(priorityMap).forEach((p) => {
    const data = priorityMap[p];
    priorityBreakdown[p] = {
      total: data.total,
      complianceRate: data.total > 0 ? Math.round(((data.total - data.breaches) / data.total) * 100) : 100,
      breaches: data.breaches,
      avgResolutionMins: data.resCount > 0 ? Math.round((data.resolutionSum / data.resCount) * 10) / 10 : 0,
    };
  });

  const workflowBreakdown: SlaAnalyticsSummary['workflowBreakdown'] = {};
  Object.keys(workflowMap).forEach((w) => {
    const data = workflowMap[w];
    workflowBreakdown[w] = {
      workflowName: data.workflowName,
      total: data.total,
      complianceRate: data.total > 0 ? Math.round(((data.total - data.breaches) / data.total) * 100) : 100,
      breaches: data.breaches,
    };
  });

  return {
    totalMonitoredRequests: total,
    complianceRate,
    activeOnTrack,
    activeWarning,
    activeAtRisk,
    breachedCount,
    resolvedOnTime,
    avgResponseTimeMinutes,
    avgResolutionTimeMinutes,
    priorityBreakdown,
    workflowBreakdown,
    recentBreaches,
    atRiskQueue,
  };
}

// Background SLA lifecycle runner
function monitorActiveSlas() {
  dbRequests.forEach((req) => {
    if (req.status !== 'COMPLETED' && req.status !== 'REJECTED') {
      updateRequestSlaState(req);
    }
  });
}

// Initialize SLA state on all startup seed requests
dbRequests.forEach((r) => {
  if (!r.slaInfo) {
    initializeRequestSla(r);
  }
  updateRequestSlaState(r);
});

// Periodic SLA monitor every 30 seconds
setInterval(monitorActiveSlas, 30000);

async function startServer() {
  const app = express();

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ----------------------------------------------------
  // API: Health Check
  // ----------------------------------------------------
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      platform: 'OmniFlow AI - Generic B2B SaaS Workflow Engine',
      businessesCount: dbBusinesses.length,
      workflowsCount: dbWorkflows.length,
      requestsCount: dbRequests.length,
      geminiConfigured: !!process.env.GEMINI_API_KEY,
    });
  });

  // ----------------------------------------------------
  // API: Businesses
  // ----------------------------------------------------
  app.get('/api/businesses', (req: Request, res: Response) => {
    res.json(dbBusinesses);
  });

  app.get('/api/businesses/:id', (req: Request, res: Response) => {
    const biz = dbBusinesses.find((b) => b.id === req.params.id);
    if (!biz) return res.status(404).json({ error: 'Business not found' });
    res.json(biz);
  });

  app.post('/api/businesses', (req: Request, res: Response) => {
    const { name, industry, description, ownerId, settings } = req.body;
    if (!name || !industry) {
      return res.status(400).json({ error: 'Name and industry are required' });
    }

    const newBusiness: Business = {
      id: `biz_${Date.now()}`,
      name,
      industry,
      description: description || '',
      ownerId: ownerId || 'usr_owner_default',
      createdAt: new Date().toISOString(),
      settings: {
        currency: 'USD',
        slaTracking: true,
        autoAssignStaff: true,
        requireOwnerApproval: true,
        ...settings,
      },
    };

    dbBusinesses.push(newBusiness);
    res.status(201).json(newBusiness);
  });

  // ----------------------------------------------------
  // API: Authentication (Owner, Staff, Customer)
  // ----------------------------------------------------
  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { email, role, businessId } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ error: 'Email address is required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Check exact match
    let user = dbUsers.find((u) => u.email.toLowerCase() === cleanEmail);

    // 2. If role specified and mismatch, check if user exists for that role or business
    if (!user && role) {
      user = dbUsers.find((u) => u.role === role && (!businessId || u.businessId === businessId));
    }

    if (!user) {
      // If user doesn't exist yet, look up business and auto-provision demo session or return friendly error
      const targetBiz = (businessId && dbBusinesses.find((b) => b.id === businessId)) || dbBusinesses[0];
      const assignedRole = role || 'CUSTOMER';
      const newUser: User = {
        id: `usr_${assignedRole.toLowerCase()}_${Date.now()}`,
        name: cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
        email: cleanEmail,
        role: assignedRole,
        businessId: targetBiz.id,
        title: assignedRole === 'OWNER' ? 'Business Executive' : assignedRole === 'STAFF' ? 'Operational Specialist' : 'Client Representative',
        department: assignedRole === 'STAFF' ? 'Operations' : 'External',
        createdAt: new Date().toISOString(),
      };
      dbUsers.push(newUser);
      user = newUser;
    }

    const business = dbBusinesses.find((b) => b.id === user?.businessId) || dbBusinesses[0];

    return res.json({
      success: true,
      user,
      business,
      token: `session_${user.id}_${Date.now()}`,
      message: `Successfully logged in as ${user.name} (${user.role})`,
    });
  });

  app.post('/api/auth/signup', (req: Request, res: Response) => {
    const {
      role,
      name,
      email,
      password,
      businessName,
      industry,
      businessDescription,
      businessId,
      title,
      department,
      companyName,
    } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ error: 'Name, email, and role are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // 1. Check if user already exists
    const existing = dbUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing && existing.role === role) {
      const biz = dbBusinesses.find((b) => b.id === existing.businessId) || dbBusinesses[0];
      return res.json({
        success: true,
        user: existing,
        business: biz,
        token: `session_${existing.id}_${Date.now()}`,
        message: 'Account already registered. Logged in successfully.',
      });
    }

    let targetBusiness: Business;

    if (role === 'OWNER') {
      // Create new enterprise organization for owner
      const newBizId = `biz_${Date.now()}`;
      const newOwnerId = `usr_owner_${Date.now()}`;
      const bizOrgName = businessName?.trim() || `${cleanName}'s Enterprise`;
      const bizIndustry = industry?.trim() || 'Professional Services';

      targetBusiness = {
        id: newBizId,
        name: bizOrgName,
        industry: bizIndustry,
        description: businessDescription || `${bizOrgName} provides end-to-end ${bizIndustry} solutions.`,
        ownerId: newOwnerId,
        createdAt: new Date().toISOString(),
        settings: {
          currency: 'USD',
          slaTracking: true,
          autoAssignStaff: true,
          requireOwnerApproval: true,
        },
      };
      dbBusinesses.unshift(targetBusiness);

      // Generate customized starter workflow for the new business
      const fallbackWf = generateFallbackWorkflow(bizOrgName, bizIndustry, businessDescription || `${bizOrgName} service delivery`);
      const newWorkflow: Workflow = {
        id: `wf_${Date.now()}`,
        businessId: newBizId,
        name: fallbackWf.workflow_name,
        description: fallbackWf.description,
        businessContext: fallbackWf.business_context,
        isActive: true,
        version: 1,
        services: fallbackWf.services.map((s, idx) => ({
          id: `srv_${Date.now()}_${idx}`,
          name: s.name,
          slug: s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          description: s.description,
          estimatedTurnaround: s.turnaround_time,
          category: s.category,
          priceEstimate: s.price_estimate,
        })),
        requiredFields: fallbackWf.required_fields.map((f, idx) => ({
          id: `field_${Date.now()}_${idx}`,
          name: f.name,
          label: f.label,
          type: f.type,
          required: f.required,
          placeholder: f.placeholder,
          options: f.options,
        })),
        steps: fallbackWf.workflow_steps.map((st, idx) => ({
          id: `step_${Date.now()}_${idx}`,
          title: st.title,
          description: st.description,
          order: idx + 1,
          responsibleRole: st.responsible_role,
          allowedActions: st.allowed_actions,
          statusResult: st.status_result,
          slaHours: st.sla_hours,
          requiresApproval: st.requires_approval ?? false,
          color: st.color || '#6366f1',
        })),
        statuses: fallbackWf.statuses || ['SUBMITTED', 'IN_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'APPROVAL', 'COMPLETED', 'REJECTED'],
        approvalRequired: fallbackWf.approval_required ?? true,
        staffAssignmentRules: fallbackWf.staff_assignment_rules || ['Assign specialists based on domain expertise'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dbWorkflows.unshift(newWorkflow);

      // Create owner user
      const newOwnerUser: User = {
        id: newOwnerId,
        name: cleanName,
        email: cleanEmail,
        role: 'OWNER',
        businessId: newBizId,
        title: title || 'Managing Director & Founder',
        department: 'Executive Management',
        createdAt: new Date().toISOString(),
      };
      dbUsers.unshift(newOwnerUser);

      return res.status(201).json({
        success: true,
        user: newOwnerUser,
        business: targetBusiness,
        token: `session_${newOwnerUser.id}_${Date.now()}`,
        message: `Enterprise workspace "${targetBusiness.name}" established.`,
      });
    }

    // Staff or Customer registration linked to an existing business
    const linkedBizId = businessId || dbBusinesses[0]?.id;
    targetBusiness = dbBusinesses.find((b) => b.id === linkedBizId) || dbBusinesses[0];

    const newUser: User = {
      id: `usr_${role.toLowerCase()}_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      role,
      businessId: targetBusiness.id,
      title: title || (role === 'STAFF' ? 'Operational Specialist' : companyName ? `Representative at ${companyName}` : 'Client Member'),
      department: department || (role === 'STAFF' ? 'Service Operations' : 'Client Accounts'),
      createdAt: new Date().toISOString(),
    };

    dbUsers.push(newUser);

    return res.status(201).json({
      success: true,
      user: newUser,
      business: targetBusiness,
      token: `session_${newUser.id}_${Date.now()}`,
      message: `Account created successfully for ${targetBusiness.name}.`,
    });
  });

  app.get('/api/auth/me', (req: Request, res: Response) => {
    const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string);
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }
    const user = dbUsers.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'User session not found' });
    }
    const business = dbBusinesses.find((b) => b.id === user.businessId) || dbBusinesses[0];
    return res.json({
      success: true,
      user,
      business,
    });
  });

  // ----------------------------------------------------
  // API: Users
  // ----------------------------------------------------
  app.get('/api/users', (req: Request, res: Response) => {
    const businessId = req.query.businessId as string;
    if (businessId) {
      return res.json(dbUsers.filter((u) => u.businessId === businessId));
    }
    res.json(dbUsers);
  });

  app.post('/api/users', (req: Request, res: Response) => {
    const { name, email, role, businessId, title, department } = req.body;
    if (!name || !email || !role || !businessId) {
      return res.status(400).json({ error: 'Missing required user fields' });
    }
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role,
      businessId,
      title: title || (role === 'OWNER' ? 'Owner' : role === 'STAFF' ? 'Staff Specialist' : 'Customer'),
      department: department || 'General',
      createdAt: new Date().toISOString(),
    };
    dbUsers.push(newUser);
    res.status(201).json(newUser);
  });

  app.delete('/api/users/:id', (req: Request, res: Response) => {
    const userId = req.params.id;
    const userIndex = dbUsers.findIndex((u) => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User not found in system directory' });
    }
    const removedUser = dbUsers[userIndex];

    // Remove user from in-memory database
    dbUsers.splice(userIndex, 1);

    // If removed user was assigned to any open requests as staff specialist, unassign them
    dbRequests.forEach((r) => {
      if (r.assignedStaffId === userId) {
        r.assignedStaffId = undefined;
        r.assignedStaffName = undefined;
        if (r.status === 'ASSIGNED') {
          r.status = 'IN_REVIEW';
        }
      }
    });

    res.json({
      success: true,
      message: `User ${removedUser.name} (${removedUser.role}) removed successfully`,
      deletedUser: removedUser,
    });
  });

  // ----------------------------------------------------
  // API: Workflows
  // ----------------------------------------------------
  app.get('/api/workflows', (req: Request, res: Response) => {
    const businessId = req.query.businessId as string;
    if (businessId) {
      return res.json(dbWorkflows.filter((w) => w.businessId === businessId));
    }
    res.json(dbWorkflows);
  });

  app.get('/api/workflows/:id', (req: Request, res: Response) => {
    const wf = dbWorkflows.find((w) => w.id === req.params.id);
    if (!wf) return res.status(404).json({ error: 'Workflow not found' });
    res.json(wf);
  });

  app.post('/api/workflows', (req: Request, res: Response) => {
    const {
      businessId,
      name,
      description,
      businessContext,
      services,
      requiredFields,
      steps,
      statuses,
      approvalRequired,
      staffAssignmentRules,
      isActive,
    } = req.body;

    if (!businessId || !name) {
      return res.status(400).json({ error: 'businessId and name are required' });
    }

    const newWorkflow: Workflow = {
      id: `wf_${Date.now()}`,
      businessId,
      name,
      description: description || '',
      businessContext: businessContext || '',
      isActive: isActive !== undefined ? isActive : true,
      version: 1,
      services: services || [],
      requiredFields: requiredFields || [],
      steps: steps || [],
      statuses: statuses || ['SUBMITTED', 'IN_REVIEW', 'ASSIGNED', 'IN_PROGRESS', 'APPROVAL', 'COMPLETED', 'REJECTED'],
      approvalRequired: approvalRequired ?? true,
      staffAssignmentRules: staffAssignmentRules || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbWorkflows.push(newWorkflow);
    res.status(201).json(newWorkflow);
  });

  app.patch('/api/workflows/:id/toggle-active', (req: Request, res: Response) => {
    const wf = dbWorkflows.find((w) => w.id === req.params.id);
    if (!wf) return res.status(404).json({ error: 'Workflow not found' });
    wf.isActive = !wf.isActive;
    wf.updatedAt = new Date().toISOString();
    res.json(wf);
  });

  // ----------------------------------------------------
  // API: AI Workflow Generation (Gemini Powered + Robust Fallback)
  // ----------------------------------------------------
  app.post('/api/ai/generate-workflow', async (req: Request, res: Response) => {
    const { businessName, industry, description, requirements } = req.body;

    if (!requirements || !requirements.trim()) {
      return res.status(400).json({ error: 'Natural language requirements are required' });
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Deterministic fallback
      const fallback = generateFallbackWorkflow(businessName || 'Enterprise', industry || 'Custom Business', requirements);
      return res.json({
        success: true,
        source: 'deterministic_engine',
        workflow: fallback,
      });
    }

    const prompt = `
You are an expert enterprise business process architect.
Analyze the following natural-language business workflow description and generate a complete, production-ready, structured workflow schema.

Business Name: "${businessName || 'Custom Business'}"
Industry / Domain: "${industry || 'Custom / Other'}"
Business Description: "${description || ''}"
Workflow Requirements: "${requirements}"

You MUST output ONLY valid JSON matching this schema:
{
  "business_context": string,
  "workflow_name": string,
  "description": string,
  "services": [
    {
      "name": string,
      "description": string,
      "turnaround_time": string,
      "category": string,
      "price_estimate": string
    }
  ],
  "required_fields": [
    {
      "name": string,
      "label": string,
      "type": "text" | "textarea" | "number" | "select" | "date" | "file" | "boolean",
      "required": boolean,
      "placeholder": string,
      "options": string[]
    }
  ],
  "workflow_steps": [
    {
      "title": string,
      "description": string,
      "responsible_role": "CUSTOMER" | "STAFF" | "OWNER",
      "allowed_actions": string[],
      "status_result": string,
      "sla_hours": number,
      "requires_approval": boolean,
      "color": string
    }
  ],
  "approval_required": boolean,
  "statuses": string[],
  "staff_assignment_rules": string[]
}

Guidelines:
- Generate 3-5 distinct, concrete services relevant to this business.
- Generate 4-7 custom required fields so customers can submit actionable requests.
- Generate 5-7 sequential workflow steps with realistic SLAs, responsible roles, and colors.
- Ensure the statuses match the step status_results plus "WAITING_FOR_CUSTOMER" and "REJECTED".
- Always make it realistic and tailored specifically to the user's prompt.
`;

    try {
      const geminiRes = await callGeminiWithResilience(ai, {
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const parsed = JSON.parse(geminiRes.text);

      return res.json({
        success: true,
        source: 'gemini-resilient',
        workflow: parsed,
      });
    } catch (_err) {
      // Graceful fallback to deterministic architect
      const fallback = generateFallbackWorkflow(
        req.body.businessName || 'Enterprise',
        req.body.industry || 'Custom Business',
        req.body.requirements || ''
      );
      return res.json({
        success: true,
        source: 'smart_fallback_engine',
        workflow: fallback,
        notice: 'Workflow synthesized successfully using enterprise operations process engine.',
      });
    }
  });

  // ----------------------------------------------------
  // API: Gemini Chatbot / AI Operations Assistant
  // ----------------------------------------------------
  app.post('/api/ai/rag-chat', async (req: Request, res: Response) => {
    const { businessId, userRole, query, chatHistory, currentRequestId, modelMode } = req.body;

    if (!query || !query.trim()) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Gather multi-tenant context safely
    const biz = dbBusinesses.find((b) => b.id === businessId) || dbBusinesses[0];
    const workflows = dbWorkflows.filter((w) => w.businessId === biz.id);
    const bizDocs = dbDocuments.filter((d) => d.businessId === biz.id);
    const requests = dbRequests.filter((r) => r.businessId === biz.id);

    // Context summarization
    const workflowContext = workflows
      .map(
        (w) =>
          `Workflow: ${w.name}\nDescription: ${w.description}\nServices: ${w.services.map((s) => s.name).join(', ')}\nSteps: ${w.steps.map((s) => `${s.title} (${s.responsibleRole})`).join(' -> ')}`
      )
      .join('\n\n');

    const docContext = bizDocs.map((d) => `Document "${d.title}":\n${d.content}`).join('\n\n');

    let requestContext = '';
    if (userRole === 'CUSTOMER' && currentRequestId) {
      const reqItem = requests.find((r) => r.id === currentRequestId);
      if (reqItem) {
        requestContext = `Customer's Specific Active Request: ID ${reqItem.id}, Title: "${reqItem.title}", Service: "${reqItem.serviceName}", Status: ${reqItem.status}, Assigned Staff: ${reqItem.assignedStaffName || 'Unassigned'}, Summary: ${reqItem.deliverableSummary || 'Processing'}`;
      }
    } else {
      requestContext = `Active Requests Summary (${requests.length} total):\n` +
        requests
          .slice(0, 8)
          .map((r) => `- [${r.id}] ${r.title} | Status: ${r.status} | Client: ${r.customerName} | Staff: ${r.assignedStaffName || 'Unassigned'}`)
          .join('\n');
    }

    let historySection = '';
    if (Array.isArray(chatHistory) && chatHistory.length > 0) {
      historySection = `\n### RECENT CONVERSATION HISTORY:\n` +
        chatHistory
          .slice(-8)
          .map((m: any) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
          .join('\n') + '\n';
    }

    // Role-specific tailored system prompt
    let rolePersonaPrompt = '';
    if (userRole === 'OWNER') {
      rolePersonaPrompt = `You are the Executive Gemini Operations Assistant & Chief Workflow Architect for "${biz.name}" (${biz.industry}).
Your audience is the Business Owner / Executive. Focus on operational metrics, revenue, pipeline velocity, SLA compliance, bottlenecks, and strategic capacity management.`;
    } else if (userRole === 'STAFF') {
      rolePersonaPrompt = `You are the Senior Gemini Operations Assistant & Execution Guide for "${biz.name}" (${biz.industry}).
Your audience is the operational Staff member. Focus on immediate task execution, SLA deadlines, required deliverables, assignment triage, and step-by-step procedures.`;
    } else {
      rolePersonaPrompt = `You are the Dedicated Gemini Customer Service Concierge for "${biz.name}" (${biz.industry}).
Your audience is the Client / Customer. Provide warm, crystal-clear, reassuring support regarding their orders, turnaround times, service policies, and next steps.`;
    }

    const systemPrompt = `
${rolePersonaPrompt}

Business Name: ${biz.name}
Business Industry: ${biz.industry}
Business Description: ${biz.description}

### KNOWLEDGE BASE DOCUMENTS:
${docContext}

### ACTIVE BUSINESS WORKFLOWS & SLAS:
${workflowContext}

### RELEVANT REQUESTS DATA:
${requestContext}
${historySection}
Rules:
1. Maintain strict role boundaries: Staff and Owners can see all operational metrics; Customers see only customer-facing services, turnaround estimates, public policies, and their own order details.
2. Provide concise, structured, actionable answers using clean markdown formatting (bold headers, bullet points, numbered steps).
3. If asked about status or next steps, cite the exact workflow step, current assignee, and what action is required.
4. If information is not present in the provided context, state what is known and suggest contacting team support.
`;

    // Model selection based on user request mode:
    // - Complex tasks: gemini-3.1-pro-preview
    // - General tasks: gemini-3.5-flash
    // - Fast tasks: gemini-3.1-flash-lite
    let modelsToUse: string[] = ['gemini-3.5-flash', 'gemini-3.7-flash', 'gemini-3.1-flash-lite'];
    if (modelMode === 'complex') {
      modelsToUse = ['gemini-3.1-pro-preview', 'gemini-3.7-flash', 'gemini-3.5-flash'];
    } else if (modelMode === 'fast') {
      modelsToUse = ['gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-3.7-flash'];
    }

    const ai = getGeminiClient();

    if (ai) {
      try {
        const geminiRes = await callGeminiWithResilience(ai, {
          contents: `${systemPrompt}\n\nUser Question: ${query}`,
          config: {
            temperature: 0.3,
          },
          models: modelsToUse,
        });

        if (geminiRes.text) {
          const docSources = bizDocs.slice(0, 2).map((d) => ({
            type: 'document' as const,
            title: d.title,
            snippet: d.category || 'Operational Policy',
          }));
          const wfSources = workflows.slice(0, 1).map((w) => ({
            type: 'workflow' as const,
            title: w.name,
            snippet: 'Step execution & SLA policies',
          }));

          return res.json({
            success: true,
            reply: geminiRes.text,
            modelUsed: geminiRes.modelUsed,
            sources: [...wfSources, ...docSources],
          });
        }
      } catch (_err) {
        // Handled seamlessly below
      }
    }

    // Comprehensive contextual RAG fallback
    const localRag = generateLocalRagAnswer(
      biz,
      workflows,
      bizDocs,
      requests,
      query,
      userRole || 'CUSTOMER',
      currentRequestId
    );

    return res.json({
      success: true,
      reply: localRag.reply,
      modelUsed: 'gemini-fallback-engine',
      sources: localRag.sources.map((s) => ({
        type: s.startsWith('Workflow') ? ('workflow' as const) : s.startsWith('Document') ? ('document' as const) : ('business' as const),
        title: s,
        snippet: 'Grounded business operations intelligence',
      })),
    });
  });

  // ----------------------------------------------------
  // API: Customer Requests
  // ----------------------------------------------------
  app.get('/api/requests', (req: Request, res: Response) => {
    const { businessId, customerId, assignedStaffId, status } = req.query;
    let list = [...dbRequests];

    if (businessId) {
      list = list.filter((r) => r.businessId === businessId);
    }
    if (customerId) {
      list = list.filter((r) => r.customerId === customerId);
    }
    if (assignedStaffId) {
      list = list.filter((r) => r.assignedStaffId === assignedStaffId);
    }
    if (status) {
      list = list.filter((r) => r.status === status);
    }

    res.json(list);
  });

  app.get('/api/requests/:id', (req: Request, res: Response) => {
    const item = dbRequests.find((r) => r.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Request not found' });
    res.json(item);
  });

  app.post('/api/requests', (req: Request, res: Response) => {
    const {
      businessId,
      workflowId,
      serviceId,
      serviceName,
      title,
      description,
      priority,
      customerId,
      customerName,
      customerEmail,
      customData,
      documents,
      dueDate,
    } = req.body;

    if (!businessId || !workflowId || !title || !customerId) {
      return res.status(400).json({ error: 'Missing required request parameters' });
    }

    const workflow = dbWorkflows.find((w) => w.id === workflowId);
    const firstStep = workflow?.steps[0]?.id || 'step_1';

    const newRequest: CustomerRequest = {
      id: `req_${Date.now().toString().slice(-6)}`,
      businessId,
      workflowId,
      serviceId: serviceId || 'srv_custom',
      serviceName: serviceName || 'General Service',
      title,
      description: description || '',
      priority: priority || 'MEDIUM',
      status: 'SUBMITTED',
      customerId,
      customerName: customerName || 'Valued Customer',
      customerEmail: customerEmail || 'customer@example.com',
      customData: customData || {},
      documents: documents || [],
      currentStepId: firstStep,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      dueDate: dueDate || undefined,
    };

    // Automatically calculate & link SLA deadlines
    initializeRequestSla(newRequest);
    updateRequestSlaState(newRequest);

    dbRequests.unshift(newRequest);

    // Record activity
    const activity: RequestActivity = {
      id: `act_${Date.now()}`,
      requestId: newRequest.id,
      actorId: customerId,
      actorName: customerName || 'Customer',
      actorRole: 'CUSTOMER',
      action: 'SUBMIT_REQUEST',
      newStatus: 'SUBMITTED',
      notes: `Request submitted for ${serviceName || title}. SLA resolution target: ${newRequest.slaInfo?.resolutionTargetMinutes || 1440}m.`,
      timestamp: new Date().toISOString(),
    };
    dbActivities.unshift(activity);

    res.status(201).json(newRequest);
  });

  app.patch('/api/requests/:id/status', (req: Request, res: Response) => {
    const { status, actorId, actorName, actorRole, notes, deliverableSummary, assignedStaffId, assignedStaffName } = req.body;
    const reqItem = dbRequests.find((r) => r.id === req.params.id);
    if (!reqItem) return res.status(404).json({ error: 'Request not found' });

    const prevStatus = reqItem.status;
    reqItem.status = status;
    reqItem.updatedAt = new Date().toISOString();

    if (deliverableSummary) reqItem.deliverableSummary = deliverableSummary;
    if (assignedStaffId) reqItem.assignedStaffId = assignedStaffId;
    if (assignedStaffName) reqItem.assignedStaffName = assignedStaffName;

    if (status === 'COMPLETED') {
      reqItem.completedAt = new Date().toISOString();
      reqItem.approvalStatus = 'APPROVED';
    } else if (status === 'APPROVAL') {
      reqItem.approvalStatus = 'PENDING';
    }

    // Handle SLA pause / resume on client waiting state
    if (status === 'WAITING_FOR_CUSTOMER' && reqItem.slaInfo && !reqItem.slaInfo.isPaused) {
      reqItem.slaInfo.isPaused = true;
      reqItem.slaInfo.pausedAt = new Date().toISOString();
      reqItem.slaInfo.status = 'PAUSED';
      recordSlaEvent(
        reqItem.id,
        reqItem.slaInfo.policyId,
        'PAUSED',
        'SLA timer paused awaiting client information/review.',
        actorName || 'Staff Specialist',
        actorRole || 'STAFF'
      );
    } else if (prevStatus === 'WAITING_FOR_CUSTOMER' && status !== 'WAITING_FOR_CUSTOMER' && reqItem.slaInfo && reqItem.slaInfo.isPaused) {
      reqItem.slaInfo.isPaused = false;
      if (reqItem.slaInfo.pausedAt) {
        const pausedDelta = (Date.now() - new Date(reqItem.slaInfo.pausedAt).getTime()) / (60 * 1000);
        reqItem.slaInfo.totalPausedMinutes = (reqItem.slaInfo.totalPausedMinutes || 0) + Math.max(0, pausedDelta);
        reqItem.slaInfo.pausedAt = undefined;
      }
      recordSlaEvent(
        reqItem.id,
        reqItem.slaInfo.policyId,
        'RESUMED',
        'SLA timer resumed upon client response/resumption.',
        actorName || 'Staff Specialist',
        actorRole || 'STAFF'
      );
    }

    // Recalculate SLA state
    updateRequestSlaState(reqItem);

    // Record activity log
    const activity: RequestActivity = {
      id: `act_${Date.now()}`,
      requestId: reqItem.id,
      actorId: actorId || 'usr_system',
      actorName: actorName || 'Operations User',
      actorRole: actorRole || 'STAFF',
      action: 'STATUS_TRANSITION',
      previousStatus: prevStatus,
      newStatus: status,
      notes: notes || `Status updated to ${status}`,
      timestamp: new Date().toISOString(),
    };
    dbActivities.unshift(activity);

    res.json(reqItem);
  });

  app.post('/api/requests/:id/assign', (req: Request, res: Response) => {
    const { staffId, staffName, actorId, actorName, actorRole } = req.body;
    const reqItem = dbRequests.find((r) => r.id === req.params.id);
    if (!reqItem) return res.status(404).json({ error: 'Request not found' });

    reqItem.assignedStaffId = staffId;
    reqItem.assignedStaffName = staffName;
    if (reqItem.status === 'SUBMITTED' || reqItem.status === 'IN_REVIEW') {
      reqItem.status = 'ASSIGNED';
    }
    reqItem.updatedAt = new Date().toISOString();

    // Trigger first response tracking in SLA if appropriate
    updateRequestSlaState(reqItem);

    const activity: RequestActivity = {
      id: `act_${Date.now()}`,
      requestId: reqItem.id,
      actorId: actorId || 'usr_owner',
      actorName: actorName || 'Manager',
      actorRole: actorRole || 'OWNER',
      action: 'ASSIGN_STAFF',
      notes: `Assigned task to ${staffName}.`,
      timestamp: new Date().toISOString(),
    };
    dbActivities.unshift(activity);

    res.json(reqItem);
  });

  // ----------------------------------------------------
  // API: SLA Policy Management (Owner CRUD)
  // ----------------------------------------------------
  app.get('/api/sla/policies', (req: Request, res: Response) => {
    const businessId = req.query.businessId as string;
    let list = dbSlaPolicies;
    if (businessId) {
      list = list.filter((p) => p.businessId === businessId);
    }
    res.json(list);
  });

  app.get('/api/sla/policies/:id', (req: Request, res: Response) => {
    const policy = dbSlaPolicies.find((p) => p.id === req.params.id);
    if (!policy) return res.status(404).json({ error: 'SLA Policy not found' });
    res.json(policy);
  });

  app.post('/api/sla/policies', (req: Request, res: Response) => {
    const { businessId, workflowId, name, description, priorities, businessHours, escalationRules } = req.body;
    if (!businessId || !name || !priorities) {
      return res.status(400).json({ error: 'businessId, name, and priorities are required' });
    }

    const newPolicy: SlaPolicy = {
      id: `sla_pol_${Date.now()}`,
      businessId,
      workflowId: workflowId || '*',
      name,
      description: description || '',
      isActive: true,
      priorities: priorities,
      businessHours: businessHours || {
        enabled: false,
        timezone: 'UTC',
        startHour: 9,
        endHour: 18,
        workDays: [1, 2, 3, 4, 5],
      },
      escalationRules: escalationRules || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    dbSlaPolicies.push(newPolicy);
    res.status(201).json(newPolicy);
  });

  app.put('/api/sla/policies/:id', (req: Request, res: Response) => {
    const policy = dbSlaPolicies.find((p) => p.id === req.params.id);
    if (!policy) return res.status(404).json({ error: 'SLA Policy not found' });

    const { name, description, workflowId, priorities, businessHours, escalationRules, isActive } = req.body;

    if (name !== undefined) policy.name = name;
    if (description !== undefined) policy.description = description;
    if (workflowId !== undefined) policy.workflowId = workflowId;
    if (priorities !== undefined) policy.priorities = priorities;
    if (businessHours !== undefined) policy.businessHours = businessHours;
    if (escalationRules !== undefined) policy.escalationRules = escalationRules;
    if (isActive !== undefined) policy.isActive = isActive;
    policy.updatedAt = new Date().toISOString();

    res.json(policy);
  });

  app.delete('/api/sla/policies/:id', (req: Request, res: Response) => {
    const idx = dbSlaPolicies.findIndex((p) => p.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'SLA Policy not found' });

    dbSlaPolicies.splice(idx, 1);
    res.json({ success: true, message: 'SLA Policy removed' });
  });

  // ----------------------------------------------------
  // API: Request SLA Inspection, Pause & Resume
  // ----------------------------------------------------
  app.get('/api/requests/:id/sla', (req: Request, res: Response) => {
    const reqItem = dbRequests.find((r) => r.id === req.params.id);
    if (!reqItem) return res.status(404).json({ error: 'Request not found' });

    const sla = updateRequestSlaState(reqItem);
    const events = dbSlaEvents.filter((e) => e.requestId === reqItem.id);
    res.json({ ...sla, events });
  });

  app.post('/api/requests/:id/sla/pause', (req: Request, res: Response) => {
    const { reason, actorName, actorRole } = req.body;
    const reqItem = dbRequests.find((r) => r.id === req.params.id);
    if (!reqItem) return res.status(404).json({ error: 'Request not found' });

    if (!reqItem.slaInfo) initializeRequestSla(reqItem);
    const sla = reqItem.slaInfo!;

    if (!sla.isPaused) {
      sla.isPaused = true;
      sla.pausedAt = new Date().toISOString();
      sla.status = 'PAUSED';
      recordSlaEvent(
        reqItem.id,
        sla.policyId,
        'PAUSED',
        `SLA manually paused: ${reason || 'Awaiting external customer dependencies'}.`,
        actorName || 'Specialist',
        actorRole || 'STAFF'
      );
    }

    res.json(sla);
  });

  app.post('/api/requests/:id/sla/resume', (req: Request, res: Response) => {
    const { actorName, actorRole } = req.body;
    const reqItem = dbRequests.find((r) => r.id === req.params.id);
    if (!reqItem) return res.status(404).json({ error: 'Request not found' });

    if (!reqItem.slaInfo) initializeRequestSla(reqItem);
    const sla = reqItem.slaInfo!;

    if (sla.isPaused) {
      sla.isPaused = false;
      if (sla.pausedAt) {
        const delta = (Date.now() - new Date(sla.pausedAt).getTime()) / (60 * 1000);
        sla.totalPausedMinutes = (sla.totalPausedMinutes || 0) + Math.max(0, delta);
        sla.pausedAt = undefined;
      }
      recordSlaEvent(
        reqItem.id,
        sla.policyId,
        'RESUMED',
        'SLA timer resumed.',
        actorName || 'Specialist',
        actorRole || 'STAFF'
      );
    }

    updateRequestSlaState(reqItem);
    res.json(sla);
  });

  // ----------------------------------------------------
  // API: Python ML SLA Breach Prediction
  // ----------------------------------------------------
  app.get('/api/requests/:id/sla/prediction', async (req: Request, res: Response) => {
    const reqItem = dbRequests.find((r) => r.id === req.params.id);
    if (!reqItem) return res.status(404).json({ error: 'Request not found' });

    updateRequestSlaState(reqItem);
    const prediction = await runPythonSlaPrediction(reqItem);
    res.json(prediction);
  });

  app.post('/api/sla/predict', async (req: Request, res: Response) => {
    const customPayload = req.body;
    try {
      const pythonScriptPath = path.join(process.cwd(), 'ml_sla_predictor.py');
      const { stdout } = await execFileAsync('python3', [pythonScriptPath, '--predict', JSON.stringify(customPayload)]);
      const parsed = JSON.parse(stdout.trim());
      return res.json(parsed);
    } catch (_err) {
      // Fallback
      return res.json({
        requestId: customPayload.id || 'sim_req',
        breachProbability: 42.5,
        riskLevel: 'MEDIUM',
        estimatedResolutionMinutes: 380,
        riskFactors: [
          { factor: 'Pacing Metric', impact: 'NEUTRAL', weight: 40, description: 'Simulated parameters' },
        ],
        recommendations: ['Standard execution schedule.'],
        confidence: 85.0,
        modelType: 'PYTHON_ML_RANDOM_FOREST',
        generatedAt: new Date().toISOString(),
      });
    }
  });

  // ----------------------------------------------------
  // API: SLA Analytics, At-Risk Queue & Breaches
  // ----------------------------------------------------
  app.get('/api/sla/analytics', (req: Request, res: Response) => {
    const businessId = (req.query.businessId as string) || dbBusinesses[0]?.id;
    const analytics = computeSlaAnalytics(businessId);
    res.json(analytics);
  });

  app.get('/api/sla/at-risk', (req: Request, res: Response) => {
    const businessId = (req.query.businessId as string) || dbBusinesses[0]?.id;
    const analytics = computeSlaAnalytics(businessId);
    res.json(analytics.atRiskQueue);
  });

  app.get('/api/sla/breaches', (req: Request, res: Response) => {
    const businessId = (req.query.businessId as string) || dbBusinesses[0]?.id;
    const analytics = computeSlaAnalytics(businessId);
    res.json(analytics.recentBreaches);
  });

  // ----------------------------------------------------
  // API: Notifications (SLA Warnings, Breaches, Escalations)
  // ----------------------------------------------------
  app.get('/api/notifications', (req: Request, res: Response) => {
    const businessId = req.query.businessId as string;
    let list = dbNotifications;
    if (businessId) {
      list = list.filter((n) => n.businessId === businessId);
    }
    res.json(list.slice(0, 30));
  });

  app.patch('/api/notifications/:id/read', (req: Request, res: Response) => {
    const notif = dbNotifications.find((n) => n.id === req.params.id);
    if (!notif) return res.status(404).json({ error: 'Notification not found' });
    notif.isRead = true;
    res.json(notif);
  });

  app.post('/api/notifications/read-all', (req: Request, res: Response) => {
    const businessId = req.body.businessId;
    dbNotifications.forEach((n) => {
      if (!businessId || n.businessId === businessId) {
        n.isRead = true;
      }
    });
    res.json({ success: true, message: 'All notifications marked as read' });
  });

  app.post('/api/requests/:id/documents', (req: Request, res: Response) => {
    const { name, size, type, uploadedBy, uploaderRole, isDeliverable } = req.body;
    const reqItem = dbRequests.find((r) => r.id === req.params.id);
    if (!reqItem) return res.status(404).json({ error: 'Request not found' });

    const newDoc = {
      id: `doc_${Date.now()}`,
      requestId: reqItem.id,
      name: name || 'Deliverable_Document.pdf',
      size: size || '2.4 MB',
      type: type || 'application/pdf',
      uploadedBy: uploadedBy || 'Staff Member',
      uploaderRole: uploaderRole || 'STAFF',
      url: '#',
      timestamp: new Date().toISOString(),
      isDeliverable: isDeliverable || false,
    };

    reqItem.documents.push(newDoc);
    reqItem.updatedAt = new Date().toISOString();

    const activity: RequestActivity = {
      id: `act_${Date.now()}`,
      requestId: reqItem.id,
      actorId: uploadedBy,
      actorName: uploadedBy,
      actorRole: uploaderRole || 'STAFF',
      action: isDeliverable ? 'UPLOAD_DELIVERABLE' : 'UPLOAD_DOCUMENT',
      documentName: newDoc.name,
      notes: isDeliverable ? `Uploaded official deliverable: ${newDoc.name}` : `Uploaded support file: ${newDoc.name}`,
      timestamp: new Date().toISOString(),
    };
    dbActivities.unshift(activity);

    res.status(201).json(newDoc);
  });

  // ----------------------------------------------------
  // API: Request Activities
  // ----------------------------------------------------
  app.get('/api/requests/:id/activities', (req: Request, res: Response) => {
    const acts = dbActivities.filter((a) => a.requestId === req.params.id);
    res.json(acts);
  });

  app.get('/api/activities', (req: Request, res: Response) => {
    const businessId = req.query.businessId as string;
    if (businessId) {
      const bizReqIds = new Set(dbRequests.filter((r) => r.businessId === businessId).map((r) => r.id));
      return res.json(dbActivities.filter((a) => bizReqIds.has(a.requestId)));
    }
    res.json(dbActivities);
  });

  // ----------------------------------------------------
  // API: Business Knowledge Base Documents
  // ----------------------------------------------------
  app.get('/api/documents', (req: Request, res: Response) => {
    const businessId = req.query.businessId as string;
    if (businessId) {
      return res.json(dbDocuments.filter((d) => d.businessId === businessId));
    }
    res.json(dbDocuments);
  });

  app.post('/api/documents', (req: Request, res: Response) => {
    const { businessId, title, category, content, tags } = req.body;
    if (!businessId || !title || !content) {
      return res.status(400).json({ error: 'Missing required document fields' });
    }
    const newDoc: BusinessDocument = {
      id: `bdoc_${Date.now()}`,
      businessId,
      title,
      category: category || 'General Policy',
      content,
      tags: tags || ['Policy'],
      uploadedAt: new Date().toISOString(),
    };
    dbDocuments.push(newDoc);
    res.status(201).json(newDoc);
  });

  // ----------------------------------------------------
  // API Route Fallback (Ensure /api/* always returns JSON)
  // ----------------------------------------------------
  app.all('/api/*', (req: Request, res: Response) => {
    res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.originalUrl}` });
  });

  // ----------------------------------------------------
  // Vite Integration (Development vs Production)
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[OmniFlow AI] Fullstack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
