/**
 * Client Portal Types for Frontend
 * Matches the backend client-portal module types
 */

// -----------------------------------------------------------------------------
// Client Dashboard Types
// -----------------------------------------------------------------------------
export interface ClientDashboard {
  totalProposals: number;
  pendingProposals: number;
  acceptedProposals: number;
  rejectedProposals: number;
  activeContracts: number;
  completedContracts: number;
  outstandingInvoices: number;
  paidInvoices: number;
  totalSpent: number;
  lastActivity: string;
  recentActivity: ClientActivity[];
}

export interface ClientActivity {
  id: string;
  type: 'proposal_received' | 'proposal_updated' | 'contract_signed' | 'contract_completed' | 'invoice_received' | 'payment_made';
  title: string;
  description: string;
  relatedId: string;
  timestamp: string;
  isRead: boolean;
  metadata?: {
    amount?: number;
    status?: string;
    freelancerName?: string;
  };
}

// -----------------------------------------------------------------------------
// Client Profile Types
// -----------------------------------------------------------------------------
export interface ClientProfile {
  id: string;
  companyName?: string;
  contactName: string;
  email: string;
  phone?: string;
  address?: Address;
  preferences: ClientPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface ClientPreferences {
  emailNotifications: {
    proposalReceived: boolean;
    contractSigned: boolean;
    invoiceReceived: boolean;
    paymentReminders: boolean;
  };
  dashboardSettings: {
    defaultView: 'overview' | 'proposals' | 'contracts' | 'invoices';
    itemsPerPage: number;
  };
}

// -----------------------------------------------------------------------------
// Client View Types
// -----------------------------------------------------------------------------
export interface ClientProposal {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected';
  freelancerName: string;
  freelancerEmail: string;
  createdAt: string;
  updatedAt: string;
  viewedAt?: string;
  respondedAt?: string;
  expiresAt?: string;
}

export interface ClientContract {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'signed' | 'completed' | 'cancelled';
  freelancerName: string;
  freelancerEmail: string;
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
  signedAt?: string;
  completedAt?: string;
}

export interface ClientInvoice {
  id: string;
  invoiceNumber: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue' | 'cancelled';
  freelancerName: string;
  freelancerEmail: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  contractId?: string;
}

// -----------------------------------------------------------------------------
// API Response Types
// -----------------------------------------------------------------------------
export interface ClientDashboardResponse {
  success: boolean;
  data: ClientDashboard;
}

export interface ClientProposalsResponse {
  success: boolean;
  data: {
    proposals: ClientProposal[];
    totalCount: number;
  };
}

export interface ClientContractsResponse {
  success: boolean;
  data: {
    contracts: ClientContract[];
    totalCount: number;
  };
}

export interface ClientInvoicesResponse {
  success: boolean;
  data: {
    invoices: ClientInvoice[];
    totalCount: number;
  };
}

export interface ClientProfileResponse {
  success: boolean;
  data: ClientProfile;
}

// -----------------------------------------------------------------------------
// Request Types
// -----------------------------------------------------------------------------
export interface UpdateClientProfileRequest {
  companyName?: string;
  contactName?: string;
  phone?: string;
  address?: Address;
  preferences?: Partial<ClientPreferences>;
}

export interface ClientListQuery {
  limit?: number;
  offset?: number;
  status?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

// -----------------------------------------------------------------------------
// Status Badge Types
// -----------------------------------------------------------------------------
export type ProposalStatus = ClientProposal['status'];
export type ContractStatus = ClientContract['status'];
export type InvoiceStatus = ClientInvoice['status'];

// -----------------------------------------------------------------------------
// Dashboard Stats Types
// -----------------------------------------------------------------------------
export interface DashboardStats {
  proposals: {
    total: number;
    pending: number;
    accepted: number;
    rejected: number;
  };
  contracts: {
    total: number;
    active: number;
    completed: number;
  };
  invoices: {
    total: number;
    outstanding: number;
    paid: number;
    overdue: number;
  };
  financial: {
    totalSpent: number;
    pendingPayments: number;
    averageProjectValue: number;
  };
}