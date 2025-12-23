import { v4 as uuidv4 } from 'uuid';
import { DynamoDB } from '../../../shared/clients/dynamodb';
import { ses } from '../../../shared/clients/ses';
import { createLogger } from '../../../shared/logger';
import {
  Proposal,
  ProposalStatus,
  CreateProposalRequest,
  UpdateProposalRequest,
  ListProposalsQuery,
  ListProposalsResponse,
  ProposalDynamoItem,
} from '../types';

const logger = createLogger('ProposalService');
const dynamodb = new DynamoDB();

export class ProposalService {
  /**
   * Create a new proposal
   */
  async createProposal(freelancerId: string, data: CreateProposalRequest): Promise<Proposal> {
    const proposalId = uuidv4();
    const now = new Date().toISOString();

    // Validate required fields
    this.validateProposalData(data);

    const proposal: ProposalDynamoItem = {
      // Core fields
      id: proposalId,
      title: data.title.trim(),
      description: data.description.trim(),
      freelancerId,
      clientId: '', // Will be populated when client signs up
      clientEmail: data.clientEmail.toLowerCase().trim(),
      status: ProposalStatus.DRAFT,
      amount: data.amount,
      currency: data.currency || 'USD',
      deliverables: data.deliverables.map((d) => d.trim()).filter(Boolean),
      timeline: data.timeline.trim(),
      terms: data.terms.trim(),
      createdAt: now,
      updatedAt: now,

      // DynamoDB keys
      PK: `PROPOSAL#${proposalId}`,
      SK: 'METADATA',
      GSI1PK: `FREELANCER#${freelancerId}`,
      GSI1SK: `PROPOSAL#${now}`,
      // GSI2 will be set when clientId is available
    };

    try {
      await dynamodb.put(proposal as unknown as Record<string, unknown>);
      logger.info('Proposal created', { proposalId, freelancerId });

      // Return clean proposal object
      return this.cleanProposalItem(proposal);
    } catch (error) {
      logger.error('Failed to create proposal', error, { freelancerId, data });
      throw new Error('Failed to create proposal');
    }
  }

  /**
   * Get proposal by ID with access control
   */
  async getProposal(proposalId: string, userId: string, userRole: string): Promise<Proposal> {
    const key = {
      PK: `PROPOSAL#${proposalId}`,
      SK: 'METADATA',
    };

    try {
      const item = await dynamodb.get<ProposalDynamoItem>(key);

      if (!item) {
        throw new Error('Proposal not found');
      }

      // Access control: freelancer can see own proposals, clients can see proposals sent to them
      if (userRole === 'admin') {
        // Admin can see all
      } else if (userRole === 'freelancer' && item.freelancerId !== userId) {
        throw new Error('Access denied: not your proposal');
      } else if (userRole === 'client' && item.clientId !== userId && item.clientEmail !== '') {
        // For clients, check if they're the intended recipient
        // This is a simplified check - in production, you'd want more robust client identification
        throw new Error('Access denied: proposal not sent to you');
      }

      // Update viewedAt timestamp if client is viewing for the first time
      if (userRole === 'client' && !item.viewedAt && item.status === ProposalStatus.SENT) {
        await this.markAsViewed(proposalId);
        item.viewedAt = new Date().toISOString();
        item.status = ProposalStatus.VIEWED;
        item.updatedAt = new Date().toISOString();
      }

      return this.cleanProposalItem(item);
    } catch (error) {
      logger.error('Failed to get proposal', error, { proposalId, userId });
      throw error;
    }
  }

  /**
   * List proposals with filtering and pagination
   */
  async listProposals(
    userId: string,
    userRole: string,
    query: ListProposalsQuery
  ): Promise<ListProposalsResponse> {
    const limit = Math.min(query.limit || 20, 100);
    const offset = query.offset || 0;

    try {
      let proposals: Proposal[] = [];

      if (userRole === 'admin') {
        // Admin can see all proposals
        proposals = await this.getAllProposals(query, limit, offset);
      } else if (userRole === 'freelancer') {
        // Freelancer can see own proposals
        proposals = await this.getFreelancerProposals(userId, query, limit, offset);
      } else if (userRole === 'client') {
        // Client can see proposals sent to them
        proposals = await this.getClientProposals(userId, query, limit, offset);
      }

      // Apply additional filtering
      if (query.status) {
        proposals = proposals.filter((p) => p.status === query.status);
      }

      if (query.clientEmail) {
        proposals = proposals.filter((p) =>
          p.clientEmail.toLowerCase().includes(query.clientEmail!.toLowerCase())
        );
      }

      // Apply sorting
      const sortBy = query.sortBy || 'createdAt';
      const sortOrder = query.sortOrder || 'desc';
      proposals.sort((a, b) => {
        let aVal: any = a[sortBy];
        let bVal: any = b[sortBy];

        if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        }

        if (sortOrder === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });

      // Apply pagination to filtered results
      const startIndex = offset;
      const endIndex = offset + limit;
      const paginatedProposals = proposals.slice(startIndex, endIndex);

      return {
        proposals: paginatedProposals,
        totalCount: proposals.length,
        hasMore: endIndex < proposals.length,
      };
    } catch (error) {
      logger.error('Failed to list proposals', error, { userId, query });
      throw new Error('Failed to list proposals');
    }
  }

  /**
   * Update proposal with access control
   */
  async updateProposal(
    proposalId: string,
    userId: string,
    userRole: string,
    data: UpdateProposalRequest
  ): Promise<Proposal> {
    const key = {
      PK: `PROPOSAL#${proposalId}`,
      SK: 'METADATA',
    };

    try {
      // Get existing proposal
      const existing = await dynamodb.get<ProposalDynamoItem>(key);
      if (!existing) {
        throw new Error('Proposal not found');
      }

      // Access control
      if (userRole === 'freelancer' && existing.freelancerId !== userId) {
        throw new Error('Access denied: not your proposal');
      } else if (userRole === 'client') {
        // Clients can only update status
        if (Object.keys(data).some((key) => key !== 'status')) {
          throw new Error('Access denied: clients can only update status');
        }
        if (data.status && !['accepted', 'rejected'].includes(data.status)) {
          throw new Error('Clients can only accept or reject proposals');
        }
      }

      // Prepare updates
      const updates: Partial<ProposalDynamoItem> = {};
      const now = new Date().toISOString();

      // Handle status changes
      if (data.status && data.status !== existing.status) {
        updates.status = data.status;

        if (data.status === ProposalStatus.SENT) {
          // Send email notification to client when proposal is sent
          await this.sendProposalNotification(existing);
        } else if (
          data.status === ProposalStatus.ACCEPTED ||
          data.status === ProposalStatus.REJECTED
        ) {
          updates.respondedAt = now;

          // Send notification to freelancer
          await this.sendStatusChangeNotification(existing, existing.status, data.status, now);
        }
      }

      // Handle other updates (freelancer only)
      if (userRole === 'freelancer' || userRole === 'admin') {
        if (data.title) updates.title = data.title.trim();
        if (data.description) updates.description = data.description.trim();
        if (data.clientEmail) updates.clientEmail = data.clientEmail.toLowerCase().trim();
        if (data.amount !== undefined) updates.amount = data.amount;
        if (data.currency) updates.currency = data.currency;
        if (data.deliverables) {
          updates.deliverables = data.deliverables.map((d) => d.trim()).filter(Boolean);
        }
        if (data.timeline) updates.timeline = data.timeline.trim();
        if (data.terms) updates.terms = data.terms.trim();
      }

      // Validate updates
      if (Object.keys(updates).length === 0) {
        return this.cleanProposalItem(existing);
      }

      // Update in database
      const updated = await dynamodb.update(key, updates);
      logger.info('Proposal updated', { proposalId, userId, updates: Object.keys(updates) });

      return this.cleanProposalItem(updated);
    } catch (error) {
      logger.error('Failed to update proposal', error, { proposalId, userId, data });
      throw error;
    }
  }

  /**
   * Delete proposal (freelancer only)
   */
  async deleteProposal(proposalId: string, userId: string, userRole: string): Promise<void> {
    const key = {
      PK: `PROPOSAL#${proposalId}`,
      SK: 'METADATA',
    };

    try {
      // Get existing proposal
      const existing = await dynamodb.get<ProposalDynamoItem>(key);
      if (!existing) {
        throw new Error('Proposal not found');
      }

      // Access control
      if (userRole === 'freelancer' && existing.freelancerId !== userId) {
        throw new Error('Access denied: not your proposal');
      } else if (userRole === 'client') {
        throw new Error('Access denied: clients cannot delete proposals');
      }

      // Prevent deletion of accepted proposals
      if (existing.status === ProposalStatus.ACCEPTED) {
        throw new Error('Cannot delete accepted proposals');
      }

      await dynamodb.delete(key);
      logger.info('Proposal deleted', { proposalId, userId });
    } catch (error) {
      logger.error('Failed to delete proposal', error, { proposalId, userId });
      throw error;
    }
  }

  /**
   * Send proposal to client (change status from draft to sent)
   */
  async sendProposal(proposalId: string, freelancerId: string): Promise<Proposal> {
    const key = {
      PK: `PROPOSAL#${proposalId}`,
      SK: 'METADATA',
    };

    try {
      const existing = await dynamodb.get<ProposalDynamoItem>(key);
      if (!existing) {
        throw new Error('Proposal not found');
      }

      if (existing.freelancerId !== freelancerId) {
        throw new Error('Access denied: not your proposal');
      }

      if (existing.status !== ProposalStatus.DRAFT) {
        throw new Error('Can only send draft proposals');
      }

      const updates = {
        status: ProposalStatus.SENT,
      };

      const updated = await dynamodb.update(key, updates);

      // Send email notification to client
      await this.sendProposalNotification(updated as ProposalDynamoItem);

      logger.info('Proposal sent', { proposalId, freelancerId });
      return this.cleanProposalItem(updated as ProposalDynamoItem);
    } catch (error) {
      logger.error('Failed to send proposal', error, { proposalId, freelancerId });
      throw error;
    }
  }

  // =============================================================================
  // PRIVATE HELPER METHODS
  // =============================================================================

  private validateProposalData(data: CreateProposalRequest): void {
    if (!data.title?.trim()) {
      throw new Error('Title is required');
    }
    if (!data.description?.trim()) {
      throw new Error('Description is required');
    }
    if (!data.clientEmail?.trim()) {
      throw new Error('Client email is required');
    }
    if (!this.isValidEmail(data.clientEmail)) {
      throw new Error('Invalid client email format');
    }
    if (data.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }
    if (!data.deliverables?.length) {
      throw new Error('At least one deliverable is required');
    }
    if (!data.timeline?.trim()) {
      throw new Error('Timeline is required');
    }
    if (!data.terms?.trim()) {
      throw new Error('Terms are required');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private cleanProposalItem(item: ProposalDynamoItem): Proposal {
    const { PK, SK, GSI1PK, GSI1SK, GSI2PK, GSI2SK, ...proposal } = item;
    return proposal;
  }

  private async markAsViewed(proposalId: string): Promise<void> {
    const key = {
      PK: `PROPOSAL#${proposalId}`,
      SK: 'METADATA',
    };

    await dynamodb.update(key, {
      status: ProposalStatus.VIEWED,
      viewedAt: new Date().toISOString(),
    });
  }

  private async getFreelancerProposals(
    freelancerId: string,
    _query: ListProposalsQuery,
    limit: number,
    offset: number
  ): Promise<Proposal[]> {
    const result = await dynamodb.query<ProposalDynamoItem>(
      'GSI1PK = :freelancerId',
      { ':freelancerId': `FREELANCER#${freelancerId}` },
      {
        indexName: 'GSI1',
        scanIndexForward: false, // Newest first
        limit: limit + offset, // Get more to handle offset
      }
    );

    return result.items.slice(offset, offset + limit).map(this.cleanProposalItem);
  }

  private async getClientProposals(
    clientId: string,
    _query: ListProposalsQuery,
    limit: number,
    offset: number
  ): Promise<Proposal[]> {
    // This is a simplified implementation
    // In production, you'd want a proper GSI for client queries
    const result = await dynamodb.query<ProposalDynamoItem>(
      'GSI2PK = :clientId',
      { ':clientId': `CLIENT#${clientId}` },
      {
        indexName: 'GSI2',
        scanIndexForward: false,
        limit: limit + offset,
      }
    );

    return result.items.slice(offset, offset + limit).map(this.cleanProposalItem);
  }

  private async getAllProposals(
    _query: ListProposalsQuery,
    limit: number,
    offset: number
  ): Promise<Proposal[]> {
    // For admin, scan all proposals (not ideal for large datasets)
    const result = await dynamodb.scan<ProposalDynamoItem>({
      filterExpression: 'SK = :sk',
      expressionAttributeValues: { ':sk': 'METADATA' },
      limit: limit + offset,
    });

    return result.items.slice(offset, offset + limit).map(this.cleanProposalItem);
  }

  private async sendProposalNotification(proposal: ProposalDynamoItem): Promise<void> {
    try {
      const subject = `New Proposal: ${proposal.title}`;
      const html = `
        <h2>You've received a new proposal</h2>
        <p><strong>Title:</strong> ${proposal.title}</p>
        <p><strong>Amount:</strong> ${proposal.currency} ${proposal.amount}</p>
        <p><strong>Timeline:</strong> ${proposal.timeline}</p>
        <p><strong>Description:</strong></p>
        <div>${proposal.description}</div>
        <p><a href="${process.env['CLIENT_URL']}/proposals/${proposal.id}">View Proposal</a></p>
      `;

      await ses.sendHtml(proposal.clientEmail, subject, html);
      logger.info('Proposal notification sent', {
        proposalId: proposal.id,
        clientEmail: proposal.clientEmail,
      });
    } catch (error) {
      logger.error('Failed to send proposal notification', error, { proposalId: proposal.id });
      // Don't throw - notification failure shouldn't break the main flow
      // The proposal status will still be updated successfully
    }
  }

  private async sendStatusChangeNotification(
    proposal: ProposalDynamoItem,
    oldStatus: ProposalStatus,
    newStatus: ProposalStatus,
    _respondedAt: string
  ): Promise<void> {
    try {
      // For now, we'll just log the notification
      // In production, you'd want to get the freelancer's email and send notification
      logger.info('Status change notification prepared', {
        proposalId: proposal.id,
        oldStatus,
        newStatus,
      });
    } catch (error) {
      logger.error('Failed to send status change notification', error, { proposalId: proposal.id });
    }
  }
}
