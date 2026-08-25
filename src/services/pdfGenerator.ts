import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Business, Workflow, CustomerRequest, RequestActivity, User } from '../types';

export const pdfReports = {
  // 1. Business Summary & Operations Report
  generateBusinessSummary(business: Business, workflows: Workflow[], requests: CustomerRequest[], users: User[]) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const primaryColor = [79, 70, 229]; // Indigo-600

    // Header Background
    doc.setFillColor(30, 41, 59); // Slate-800
    doc.rect(0, 0, 210, 38, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('OMNIFLOW B2B WORKFLOW PLATFORM', 14, 18);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text(`EXECUTIVE BUSINESS OPERATIONS REPORT | ${business.name.toUpperCase()}`, 14, 28);

    // Business Meta
    doc.setTextColor(51, 65, 85);
    doc.setFontSize(10);
    doc.text(`Industry: ${business.industry}`, 14, 46);
    doc.text(`Generated: ${new Date().toLocaleString()} | Tenant ID: ${business.id}`, 14, 52);
    doc.text(`Total Workflows: ${workflows.length} | Registered Users: ${users.length}`, 14, 58);

    // Key Performance Metrics Summary Table
    const totalReqs = requests.length;
    const completed = requests.filter((r) => r.status === 'COMPLETED').length;
    const inProgress = requests.filter((r) => r.status === 'IN_PROGRESS' || r.status === 'ASSIGNED').length;
    const inReview = requests.filter((r) => r.status === 'SUBMITTED' || r.status === 'IN_REVIEW').length;
    const approval = requests.filter((r) => r.status === 'APPROVAL').length;
    const completionRate = totalReqs > 0 ? Math.round((completed / totalReqs) * 100) : 0;

    autoTable(doc, {
      startY: 64,
      head: [['Total Requests', 'Completed', 'In Progress', 'Awaiting Approval', 'In Review', 'Fulfillment Rate']],
      body: [[
        totalReqs.toString(),
        completed.toString(),
        inProgress.toString(),
        approval.toString(),
        inReview.toString(),
        `${completionRate}%`
      ]],
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { halign: 'center', fontSize: 10, cellPadding: 4 },
    });

    // Active Workflows Table
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    const lastY1 = (doc as any).lastAutoTable.finalY + 12;
    doc.text('1. Deployed Business Workflows', 14, lastY1);

    const workflowRows = workflows.map((wf) => [
      wf.name,
      wf.services.map((s) => s.name).join(', '),
      `${wf.steps.length} Steps`,
      wf.approvalRequired ? 'Yes (Owner QA)' : 'No',
      wf.isActive ? 'ACTIVE' : 'INACTIVE',
    ]);

    autoTable(doc, {
      startY: lastY1 + 4,
      head: [['Workflow Name', 'Offered Services', 'Process Pipeline', 'Approval Required', 'Status']],
      body: workflowRows,
      theme: 'striped',
      headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255] },
      styles: { fontSize: 9, cellPadding: 3 },
    });

    // Recent Request Execution Register
    const lastY2 = (doc as any).lastAutoTable.finalY + 12;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text('2. Active Request Lifecycle Register', 14, lastY2);

    const requestRows = requests.slice(0, 10).map((r) => [
      r.id,
      r.title.slice(0, 32) + (r.title.length > 32 ? '...' : ''),
      r.customerName,
      r.assignedStaffName || 'Unassigned',
      r.priority,
      r.status,
      r.createdAt ? r.createdAt.slice(0, 10) : '-',
    ]);

    autoTable(doc, {
      startY: lastY2 + 4,
      head: [['Request ID', 'Title', 'Customer', 'Assigned Specialist', 'Priority', 'Status', 'Submitted']],
      body: requestRows,
      theme: 'striped',
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
      styles: { fontSize: 8, cellPadding: 2.5 },
    });

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `OmniFlow AI Generic B2B SaaS Platform • Confidential Executive Audit • Page ${i} of ${pageCount}`,
        14,
        290
      );
    }

    doc.save(`${business.name.replace(/\s+/g, '_')}_Executive_Summary.pdf`);
  },

  // 2. Dynamic Workflow Architecture Blueprint
  generateWorkflowBlueprint(business: Business, workflow: Workflow) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Header
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 36, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('WORKFLOW ARCHITECTURE BLUEPRINT', 14, 16);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(226, 232, 240);
    doc.text(`${workflow.name.toUpperCase()} • ${business.name}`, 14, 26);

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.text(`Context: ${workflow.businessContext || business.description}`, 14, 44, { maxWidth: 182 });

    // Services
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Service Offerings Catalog', 14, 58);

    const serviceRows = workflow.services.map((s) => [
      s.name,
      s.category || 'General',
      s.estimatedTurnaround || '3-5 Days',
      s.priceEstimate || 'Included',
      s.description,
    ]);

    autoTable(doc, {
      startY: 62,
      head: [['Service Name', 'Category', 'SLA / Turnaround', 'Fee Estimate', 'Scope Description']],
      body: serviceRows,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
      styles: { fontSize: 8, cellPadding: 2.5 },
    });

    // Sequential Process Steps
    const lastY1 = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Sequential Lifecycle Process Steps', 14, lastY1);

    const stepRows = workflow.steps.map((st, idx) => [
      `Step ${idx + 1}: ${st.title}`,
      st.responsibleRole,
      st.statusResult,
      `${st.slaHours || 24} Hours`,
      st.requiresApproval ? 'Yes' : 'No',
      st.description,
    ]);

    autoTable(doc, {
      startY: lastY1 + 4,
      head: [['Step & Title', 'Responsible Role', 'Status Result', 'SLA Target', 'Approval Req.', 'Step Objective']],
      body: stepRows,
      theme: 'striped',
      headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255] },
      styles: { fontSize: 8, cellPadding: 2.5 },
    });

    // Required Customer Input Schema
    const lastY2 = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Dynamic Customer Ingestion Schema', 14, lastY2);

    const fieldRows = workflow.requiredFields.map((f) => [
      f.label,
      f.name,
      f.type.toUpperCase(),
      f.required ? 'Mandatory' : 'Optional',
      f.options ? f.options.join(' | ') : f.placeholder || 'N/A',
    ]);

    autoTable(doc, {
      startY: lastY2 + 4,
      head: [['Field Label', 'Field Identifier', 'Input Type', 'Requirement', 'Options / Placeholder']],
      body: fieldRows,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
      styles: { fontSize: 8, cellPadding: 2.5 },
    });

    doc.save(`${workflow.name.replace(/\s+/g, '_')}_Blueprint.pdf`);
  },

  // 3. Customer Request Dossier & Audit Log
  generateRequestDossier(business: Business, request: CustomerRequest, activities: RequestActivity[]) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Header
    doc.setFillColor(30, 41, 59);
    doc.rect(0, 0, 210, 36, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('OFFICIAL REQUEST AUDIT DOSSIER', 14, 16);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(226, 232, 240);
    doc.text(`REQUEST ID: ${request.id} • ${business.name.toUpperCase()}`, 14, 26);

    // Request Overview
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Request Metadata & Client Profile', 14, 44);

    autoTable(doc, {
      startY: 48,
      body: [
        ['Request Title:', request.title, 'Status:', request.status],
        ['Service Offering:', request.serviceName, 'Priority Tier:', request.priority],
        ['Client Name:', request.customerName, 'Client Email:', request.customerEmail],
        ['Assigned Specialist:', request.assignedStaffName || 'Triage in Progress', 'Due Target Date:', request.dueDate || 'Standard SLA'],
        ['Created Timestamp:', new Date(request.createdAt).toLocaleString(), 'Completed At:', request.completedAt ? new Date(request.completedAt).toLocaleString() : 'Active Processing'],
      ],
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 2 },
    });

    // Custom Data Inputs
    const lastY1 = (doc as any).lastAutoTable.finalY + 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Client Ingestion Field Values', 14, lastY1);

    const customDataRows = Object.entries(request.customData || {}).map(([key, val]) => [
      key.replace(/_/g, ' ').toUpperCase(),
      String(val),
    ]);

    autoTable(doc, {
      startY: lastY1 + 4,
      head: [['Input Specification Field', 'Submitted Customer Value']],
      body: customDataRows.length > 0 ? customDataRows : [['General Description', request.description]],
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
      styles: { fontSize: 9, cellPadding: 3 },
    });

    // Deliverables and Documents
    const lastY2 = (doc as any).lastAutoTable.finalY + 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Attached Deliverables & Verification Documents', 14, lastY2);

    const docRows = (request.documents || []).map((d) => [
      d.name,
      d.size || 'N/A',
      d.uploadedBy,
      d.uploaderRole,
      d.isDeliverable ? 'OFFICIAL DELIVERABLE' : 'Support Asset',
      new Date(d.timestamp).toLocaleString(),
    ]);

    autoTable(doc, {
      startY: lastY2 + 4,
      head: [['File Name', 'Size', 'Uploader', 'Role', 'Document Classification', 'Uploaded At']],
      body: docRows.length > 0 ? docRows : [['No formal document attachments uploaded', '-', '-', '-', '-', '-']],
      theme: 'striped',
      headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255] },
      styles: { fontSize: 8, cellPadding: 2.5 },
    });

    // Activity Timeline Audit Log
    const lastY3 = (doc as any).lastAutoTable.finalY + 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Lifecycle Activity Audit Timeline', 14, lastY3);

    const actRows = (activities || []).map((a) => [
      new Date(a.timestamp).toLocaleString(),
      `${a.actorName} (${a.actorRole})`,
      a.action,
      a.newStatus || a.previousStatus || '-',
      a.notes || '-',
    ]);

    autoTable(doc, {
      startY: lastY3 + 4,
      head: [['Timestamp', 'Actor & Role', 'Action Type', 'Status State', 'Audit Notes / Narrative']],
      body: actRows.length > 0 ? actRows : [['No activity records found', '-', '-', '-', '-']],
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
      styles: { fontSize: 8, cellPadding: 2.5 },
    });

    doc.save(`Request_Dossier_${request.id}.pdf`);
  },

  // 4. SLA & Performance Velocity Report
  generatePerformanceSla(business: Business, requests: CustomerRequest[], users: User[]) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 36, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('SLA VELOCITY & WORKLOAD REPORT', 14, 16);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(226, 232, 240);
    doc.text(`OPERATIONAL DISPATCH AUDIT • ${business.name.toUpperCase()}`, 14, 26);

    const staffUsers = users.filter((u) => u.role === 'STAFF' || u.role === 'OWNER');
    const staffWorkload = staffUsers.map((staff) => {
      const assigned = requests.filter((r) => r.assignedStaffId === staff.id);
      const done = assigned.filter((r) => r.status === 'COMPLETED').length;
      const active = assigned.filter((r) => r.status !== 'COMPLETED' && r.status !== 'REJECTED').length;
      return [
        staff.name,
        staff.title || staff.role,
        staff.department || 'Operations',
        assigned.length.toString(),
        active.toString(),
        done.toString(),
        assigned.length > 0 ? `${Math.round((done / assigned.length) * 100)}%` : 'N/A',
      ];
    });

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Staff Specialist Capacity & Throughput', 14, 46);

    autoTable(doc, {
      startY: 50,
      head: [['Staff Name', 'Title / Role', 'Department', 'Total Tasks', 'Active In-Flight', 'Completed', 'Throughput']],
      body: staffWorkload,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
      styles: { fontSize: 9, cellPadding: 3 },
    });

    const lastY = (doc as any).lastAutoTable.finalY + 12;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Priority SLA Distribution', 14, lastY);

    const urgentCount = requests.filter((r) => r.priority === 'URGENT').length;
    const highCount = requests.filter((r) => r.priority === 'HIGH').length;
    const medCount = requests.filter((r) => r.priority === 'MEDIUM').length;
    const lowCount = requests.filter((r) => r.priority === 'LOW').length;

    autoTable(doc, {
      startY: lastY + 4,
      head: [['Priority Tier', 'Standard SLA Target', 'Active Request Volume', 'Target Fulfillment Rate']],
      body: [
        ['URGENT', '24 Hours', urgentCount.toString(), '98.5%'],
        ['HIGH', '48 Hours', highCount.toString(), '95.0%'],
        ['MEDIUM', '3-5 Business Days', medCount.toString(), '99.0%'],
        ['LOW', '5-7 Business Days', lowCount.toString(), '99.9%'],
      ],
      theme: 'striped',
      headStyles: { fillColor: [51, 65, 85], textColor: [255, 255, 255] },
      styles: { fontSize: 9, cellPadding: 3 },
    });

    doc.save(`${business.name.replace(/\s+/g, '_')}_SLA_Performance.pdf`);
  },
};
