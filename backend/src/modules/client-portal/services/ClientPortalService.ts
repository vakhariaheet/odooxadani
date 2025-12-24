import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import {
  ClientDashboard,
  ClientActivity,
  ClientProfile,
  ClientProposal,
  ClientContract,
  ClientInvoice,
  DashboardStats,
  UpdateClientProfileRequest,
  ClientListQuery,
  ClientPreferences,
} from '../types';

export class ClientPortalService {
  private docClient: DynamoDBDocumentClient;
  private tableName: string;

  constructor() {
    const client = new DynamoDBClient({ region: process.env['AWS_REGION'] || 'ap-south-1' });
    this.docClient = DynamoDBDocumentClient.from(client);
    this.tableName = process.env['MAIN_TABLE_NAME'] || 'main-table';
  }

  /**
   * Get comprehensive dashboard data for a client
   */
  async getClientDashboard(clientId: string): Promise<ClientDashboard> {
    // Get dashboard stats and recent activity in parallel
    const [stats, recentActivity] = await Promise.all([
      this.getDashboardStats(clientId),
      this.getRecentActivity(clientId, 10),
    ]);

    return {
      totalProposals: stats.proposals.total,
      pendingProposals: stats.proposals.pending,
      acceptedProposals: stats.proposals.accepted,
      rejectedProposals: stats.proposals.rejected,
      activeContracts: stats.contracts.active,
      completedContracts: stats.contracts.completed,
      outstandingInvoices: stats.invoices.outstanding,
      paidInvoices: stats.invoices.paid,
      totalSpent: stats.financial.totalSpent,
      lastActivity: recentActivity.length > 0 ? recentActivity[0]?.timestamp || new Date().toISOString() : new Date().toISOString(),
      recentActivity,
    };
  }

  /**
   * Get dashboard statistics by aggregating data from proposals, contracts, and invoices
   */
  private async getDashboardStats(clientId: string): Promise<DashboardStats> {
    // Query all proposals for this client
    const proposalsQuery = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'gsi1',
      KeyConditionExpression: 'gsi1pk = :gsi1pk',
      FilterExpression: 'begins_with(sk, :proposalPrefix)',
      ExpressionAttributeValues: {
        ':gsi1pk': `CLIENT#${clientId}`,
        ':proposalPrefix': 'PROPOSAL#',
      },
    });

    // Query all contracts for this client
    const contractsQuery = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'gsi1',
      KeyConditionExpression: 'gsi1pk = :gsi1pk',
      FilterExpression: 'begins_with(sk, :contractPrefix)',
      ExpressionAttributeValues: {
        ':gsi1pk': `CLIENT#${clientId}`,
        ':contractPrefix': 'CONTRACT#',
      },
    });

    // Query all invoices for this client
    const invoicesQuery = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'gsi1',
      KeyConditionExpression: 'gsi1pk = :gsi1pk',
      FilterExpression: 'begins_with(sk, :invoicePrefix)',
      ExpressionAttributeValues: {
        ':gsi1pk': `CLIENT#${clientId}`,
        ':invoicePrefix': 'INVOICE#',
      },
    });

    // Execute all queries in parallel
    const [proposalsResult, contractsResult, invoicesResult] = await Promise.all([
      this.docClient.send(proposalsQuery),
      this.docClient.send(contractsQuery),
      this.docClient.send(invoicesQuery),
    ]);

    // Aggregate proposal stats
    const proposals = proposalsResult.Items || [];
    const proposalStats = {
      total: proposals.length,
      pending: proposals.filter(p => p['status'] === 'sent' || p['status'] === 'viewed').length,
      accepted: proposals.filter(p => p['status'] === 'accepted').length,
      rejected: proposals.filter(p => p['status'] === 'rejected').length,
    };

    // Aggregate contract stats
    const contracts = contractsResult.Items || [];
    const contractStats = {
      total: contracts.length,
      active: contracts.filter(c => c['status'] === 'signed' && !c['completedAt']).length,
      completed: contracts.filter(c => c['status'] === 'completed').length,
    };

    // Aggregate invoice stats
    const invoices = invoicesResult.Items || [];
    const now = new Date();
    const invoiceStats = {
      total: invoices.length,
      outstanding: invoices.filter(i => i['status'] === 'sent' || i['status'] === 'viewed').length,
      paid: invoices.filter(i => i['status'] === 'paid').length,
      overdue: invoices.filter(i => 
        (i['status'] === 'sent' || i['status'] === 'viewed') && 
        new Date(i['dueDate']) < now
      ).length,
    };

    // Calculate financial stats
    const totalSpent = invoices
      .filter(i => i['status'] === 'paid')
      .reduce((sum, i) => sum + (i['amount'] || 0), 0);

    const pendingPayments = invoices
      .filter(i => i['status'] === 'sent' || i['status'] === 'viewed')
      .reduce((sum, i) => sum + (i['amount'] || 0), 0);

    const averageProjectValue = contracts.length > 0 
      ? contracts.reduce((sum, c) => sum + (c['amount'] || 0), 0) / contracts.length 
      : 0;

    return {
      proposals: proposalStats,
      contracts: contractStats,
      invoices: invoiceStats,
      financial: {
        totalSpent,
        pendingPayments,
        averageProjectValue,
      },
    };
  }

  /**
   * Get recent activity timeline for a client
   */
  async getRecentActivity(clientId: string, limit: number = 20): Promise<ClientActivity[]> {
    const query = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: 'pk = :pk AND begins_with(sk, :skPrefix)',
      ExpressionAttributeValues: {
        ':pk': `CLIENT#${clientId}`,
        ':skPrefix': 'ACTIVITY#',
      },
      ScanIndexForward: false, // Sort by timestamp descending
      Limit: limit,
    });

    const result = await this.docClient.send(query);
    return (result.Items || []).map(item => ({
      id: item['id'],
      type: item['type'],
      title: item['title'],
      description: item['description'],
      relatedId: item['relatedId'],
      timestamp: item['timestamp'],
      isRead: item['isRead'] || false,
      metadata: item['metadata'],
    }));
  }

  /**
   * Get client proposals with pagination and filtering
   */
  async getClientProposals(clientId: string, query: ClientListQuery = {}): Promise<{ proposals: ClientProposal[]; totalCount: number }> {
    const { limit = 20, offset = 0, status, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const queryCommand = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'gsi1',
      KeyConditionExpression: 'gsi1pk = :gsi1pk',
      FilterExpression: status 
        ? 'begins_with(sk, :proposalPrefix) AND #status = :status'
        : 'begins_with(sk, :proposalPrefix)',
      ExpressionAttributeNames: status ? { '#status': 'status' } : undefined,
      ExpressionAttributeValues: {
        ':gsi1pk': `CLIENT#${clientId}`,
        ':proposalPrefix': 'PROPOSAL#',
        ...(status && { ':status': status }),
      },
      ScanIndexForward: sortOrder === 'asc',
    });

    const result = await this.docClient.send(queryCommand);
    const items = result.Items || [];

    // Sort by specified field if not createdAt (which is handled by sort key)
    if (sortBy !== 'createdAt') {
      items.sort((a, b) => {
        const aVal = a[sortBy] || 0;
        const bVal = b[sortBy] || 0;
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }

    // Apply pagination
    const paginatedItems = items.slice(offset, offset + limit);

    const proposals: ClientProposal[] = paginatedItems.map(item => ({
      id: item['id'],
      title: item['title'],
      description: item['description'],
      amount: item['amount'],
      currency: item['currency'] || 'USD',
      status: item['status'],
      freelancerName: item['freelancerName'],
      freelancerEmail: item['freelancerEmail'],
      createdAt: item['createdAt'],
      updatedAt: item['updatedAt'],
      viewedAt: item['viewedAt'],
      respondedAt: item['respondedAt'],
      expiresAt: item['expiresAt'],
    }));

    return {
      proposals,
      totalCount: items.length,
    };
  }

  /**
   * Get client contracts with pagination and filtering
   */
  async getClientContracts(clientId: string, query: ClientListQuery = {}): Promise<{ contracts: ClientContract[]; totalCount: number }> {
    const { limit = 20, offset = 0, status, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const queryCommand = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'gsi1',
      KeyConditionExpression: 'gsi1pk = :gsi1pk',
      FilterExpression: status 
        ? 'begins_with(sk, :contractPrefix) AND #status = :status'
        : 'begins_with(sk, :contractPrefix)',
      ExpressionAttributeNames: status ? { '#status': 'status' } : undefined,
      ExpressionAttributeValues: {
        ':gsi1pk': `CLIENT#${clientId}`,
        ':contractPrefix': 'CONTRACT#',
        ...(status && { ':status': status }),
      },
      ScanIndexForward: sortOrder === 'asc',
    });

    const result = await this.docClient.send(queryCommand);
    const items = result.Items || [];

    // Sort and paginate
    if (sortBy !== 'createdAt') {
      items.sort((a, b) => {
        const aVal = a[sortBy] || 0;
        const bVal = b[sortBy] || 0;
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }

    const paginatedItems = items.slice(offset, offset + limit);

    const contracts: ClientContract[] = paginatedItems.map(item => ({
      id: item['id'],
      title: item['title'],
      description: item['description'],
      amount: item['amount'],
      currency: item['currency'] || 'USD',
      status: item['status'],
      freelancerName: item['freelancerName'],
      freelancerEmail: item['freelancerEmail'],
      startDate: item['startDate'],
      endDate: item['endDate'],
      createdAt: item['createdAt'],
      updatedAt: item['updatedAt'],
      signedAt: item['signedAt'],
      completedAt: item['completedAt'],
    }));

    return {
      contracts,
      totalCount: items.length,
    };
  }

  /**
   * Get client invoices with pagination and filtering
   */
  async getClientInvoices(clientId: string, query: ClientListQuery = {}): Promise<{ invoices: ClientInvoice[]; totalCount: number }> {
    const { limit = 20, offset = 0, status, sortBy = 'createdAt', sortOrder = 'desc' } = query;

    const queryCommand = new QueryCommand({
      TableName: this.tableName,
      IndexName: 'gsi1',
      KeyConditionExpression: 'gsi1pk = :gsi1pk',
      FilterExpression: status 
        ? 'begins_with(sk, :invoicePrefix) AND #status = :status'
        : 'begins_with(sk, :invoicePrefix)',
      ExpressionAttributeNames: status ? { '#status': 'status' } : undefined,
      ExpressionAttributeValues: {
        ':gsi1pk': `CLIENT#${clientId}`,
        ':invoicePrefix': 'INVOICE#',
        ...(status && { ':status': status }),
      },
      ScanIndexForward: sortOrder === 'asc',
    });

    const result = await this.docClient.send(queryCommand);
    const items = result.Items || [];

    // Sort and paginate
    if (sortBy !== 'createdAt') {
      items.sort((a, b) => {
        const aVal = a[sortBy] || 0;
        const bVal = b[sortBy] || 0;
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      });
    }

    const paginatedItems = items.slice(offset, offset + limit);

    const invoices: ClientInvoice[] = paginatedItems.map(item => ({
      id: item['id'],
      invoiceNumber: item['invoiceNumber'],
      title: item['title'],
      description: item['description'],
      amount: item['amount'],
      currency: item['currency'] || 'USD',
      status: item['status'],
      freelancerName: item['freelancerName'],
      freelancerEmail: item['freelancerEmail'],
      dueDate: item['dueDate'],
      createdAt: item['createdAt'],
      updatedAt: item['updatedAt'],
      paidAt: item['paidAt'],
      contractId: item['contractId'],
    }));

    return {
      invoices,
      totalCount: items.length,
    };
  }

  /**
   * Get client profile
   */
  async getClientProfile(clientId: string): Promise<ClientProfile | null> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: {
        pk: `CLIENT#${clientId}`,
        sk: 'PROFILE',
      },
    });

    const result = await this.docClient.send(command);
    
    if (!result.Item) {
      return null;
    }

    return {
      id: result.Item['id'],
      companyName: result.Item['companyName'],
      contactName: result.Item['contactName'],
      email: result.Item['email'],
      phone: result.Item['phone'],
      address: result.Item['address'],
      preferences: result.Item['preferences'] || this.getDefaultPreferences(),
      createdAt: result.Item['createdAt'],
      updatedAt: result.Item['updatedAt'],
    };
  }

  /**
   * Update client profile
   */
  async updateClientProfile(clientId: string, updates: UpdateClientProfileRequest): Promise<ClientProfile> {
    const now = new Date().toISOString();

    // Get existing profile or create new one
    const existingProfile = await this.getClientProfile(clientId);
    
    const updatedProfile = {
      ...existingProfile,
      ...updates,
      id: clientId,
      updatedAt: now,
      ...(existingProfile ? {} : { createdAt: now }),
    };

    const command = new PutCommand({
      TableName: this.tableName,
      Item: {
        pk: `CLIENT#${clientId}`,
        sk: 'PROFILE',
        gsi1pk: 'PROFILE#CLIENT',
        gsi1sk: now,
        ...updatedProfile,
      },
    });

    await this.docClient.send(command);
    return updatedProfile as ClientProfile;
  }

  /**
   * Add activity to client timeline
   */
  async addClientActivity(clientId: string, activity: Omit<ClientActivity, 'id' | 'timestamp' | 'isRead'>): Promise<void> {
    const now = new Date().toISOString();
    const activityId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const command = new PutCommand({
      TableName: this.tableName,
      Item: {
        pk: `CLIENT#${clientId}`,
        sk: `ACTIVITY#${now}`,
        gsi1pk: 'ACTIVITY#CLIENT',
        gsi1sk: now,
        id: activityId,
        timestamp: now,
        isRead: false,
        ...activity,
      },
    });

    await this.docClient.send(command);
  }

  /**
   * Get default client preferences
   */
  private getDefaultPreferences(): ClientPreferences {
    return {
      emailNotifications: {
        proposalReceived: true,
        contractSigned: true,
        invoiceReceived: true,
        paymentReminders: true,
      },
      dashboardSettings: {
        defaultView: 'overview',
        itemsPerPage: 20,
      },
    };
  }
}