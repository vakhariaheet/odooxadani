// =============================================================================
// CLIENT PORTAL TYPES - Client Dashboard & Portal Module
// =============================================================================

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
  lastActivity: string; // ISO timestamp
  recentActivity: ClientActivity[];
}

export interface ClientActivity {
  id: string;
  type: 'proposal_received' | 'proposal_updated' | 'contract_signed' | 'contract_completed' | 'invoice_received' | 'payment_made';
  title: string;
  description: string;
  relatedId: string; // proposal/contract/invoice ID
  timestamp: string; // ISO timestamp
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
// API Request/Response Types
// -----------------------------------------------------------------------------

/** GET /api/client/dashboard */
export interface ClientDashboardResponse {
  success: boolean;
  data: ClientDashboard;
}

/** GET /api/client/proposals */
export interface ClientProposalsResponse {
  success: boolean;
  data: {
    proposals: ClientProposal[];
    totalCount: number;
  };
}

/** GET /api/client/contracts */
export interface ClientContractsResponse {
  success: boolean;
  data: {
    contracts: ClientContract[];
    totalCount: number;
  };
}

/** GET /api/client/invoices */
export interface ClientInvoicesResponse {
  success: boolean;
  data: {
    invoices: ClientInvoice[];
    totalCount: number;
  };
}

/** PUT /api/client/profile */
export interface UpdateClientProfileRequest {
  companyName?: string;
  contactName?: string;
  phone?: string;
  address?: Address;
  preferences?: Partial<ClientPreferences>;
}

// -----------------------------------------------------------------------------
// Client View Types (simplified views for client portal)
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
// Query Parameters
// -----------------------------------------------------------------------------
export interface ClientListQuery {
  limit?: number;
  offset?: number;
  status?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'amount';
  sortOrder?: 'asc' | 'desc';
}

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

// -----------------------------------------------------------------------------
// Activity Timeline Types
// -----------------------------------------------------------------------------
export interface ActivityTimeline {
  activities: ClientActivity[];
  hasMore: boolean;
  nextCursor?: string;
}