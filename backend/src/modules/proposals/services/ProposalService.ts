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
  ProposalAnalytics,
  ViewEvent,
  ProposalComment,
  ProposalVersion,
  EngagementMetrics,
  TrackViewRequest,
  AddCommentRequest,
  ProposalAnalyticsDynamoItem,
  ViewEventDynamoItem,
  ProposalCommentDynamoItem,
  ProposalVersionDynamoItem,
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

  // =============================================================================
  // ENHANCED FEATURES (M05) - ANALYTICS & ENGAGEMENT
  // =============================================================================

  /**
   * Get proposal analytics data
   */
  async getProposalAnalytics(
    proposalId: string,
    userId: string,
    userRole: string
  ): Promise<ProposalAnalytics> {
    // Verify access to proposal first
    await this.getProposal(proposalId, userId, userRole);

    const analyticsKey = {
      PK: `PROPOSAL#${proposalId}`,
      SK: 'ANALYTICS',
    };

    try {
      const analyticsItem = await dynamodb.get<ProposalAnalyticsDynamoItem>(analyticsKey);

      if (!analyticsItem) {
        // Initialize analytics if not exists
        return await this.initializeAnalytics(proposalId);
      }

      // Get view timeline
      const viewTimeline = await this.getViewTimeline(proposalId);

      return {
        proposalId,
        totalViews: analyticsItem.totalViews,
        uniqueViews: analyticsItem.uniqueViews,
        timeSpentViewing: analyticsItem.timeSpentViewing,
        lastViewedAt: analyticsItem.lastViewedAt,
        viewsBySection: analyticsItem.viewsBySection,
        engagementScore: analyticsItem.engagementScore,
        responseTime: analyticsItem.responseTime,
        viewTimeline,
      };
    } catch (error) {
      logger.error('Failed to get proposal analytics', error, { proposalId, userId });
      throw new Error('Failed to get proposal analytics');
    }
  }

  /**
   * Track a view event for analytics
   */
  async trackProposalView(
    proposalId: string,
    userId: string,
    userRole: string,
    data: TrackViewRequest
  ): Promise<void> {
    // Verify access to proposal first
    const proposal = await this.getProposal(proposalId, userId, userRole);

    const timestamp = new Date().toISOString();
    const viewEventId = `${timestamp}-${userId}`;

    const viewEvent: ViewEventDynamoItem = {
      PK: `PROPOSAL#${proposalId}`,
      SK: `VIEW#${viewEventId}`,
      GSI1PK: `CLIENT#${userId}`,
      GSI1SK: `VIEW#${timestamp}`,
      proposalId,
      timestamp,
      clientId: userRole === 'client' ? userId : undefined,
      clientEmail: proposal.clientEmail,
      section: data.section,
      timeSpent: data.timeSpent,
      userAgent: data.userAgent,
    };

    try {
      // Store view event
      await dynamodb.put(viewEvent as unknown as Record<string, unknown>);

      // Update analytics
      await this.updateAnalyticsFromView(proposalId, userId, data);

      logger.info('View tracked', {
        proposalId,
        userId,
        section: data.section,
        timeSpent: data.timeSpent,
      });
    } catch (error) {
      logger.error('Failed to track view', error, { proposalId, userId });
      // Don't throw - view tracking failure shouldn't break the main flow
    }
  }

  /**
   * Add a comment to a proposal
   */
  async addProposalComment(
    proposalId: string,
    userId: string,
    userRole: string,
    userName: string,
    data: AddCommentRequest
  ): Promise<ProposalComment> {
    // Verify access to proposal first
    await this.getProposal(proposalId, userId, userRole);

    const commentId = uuidv4();
    const now = new Date().toISOString();

    const comment: ProposalCommentDynamoItem = {
      PK: `PROPOSAL#${proposalId}`,
      SK: `COMMENT#${commentId}`,
      GSI1PK: `COMMENT#${userId}`,
      GSI1SK: now,
      id: commentId,
      proposalId,
      userId,
      userRole: userRole as 'freelancer' | 'client',
      userName,
      content: data.content.trim(),
      createdAt: now,
      isInternal: data.isInternal || false,
    };

    try {
      await dynamodb.put(comment as unknown as Record<string, unknown>);

      // Send notification to other party
      await this.sendCommentNotification(proposalId, comment, userRole);

      logger.info('Comment added', { proposalId, userId, commentId });

      return {
        id: commentId,
        proposalId,
        userId,
        userRole: userRole as 'freelancer' | 'client',
        userName,
        content: data.content.trim(),
        createdAt: now,
        isInternal: data.isInternal || false,
      };
    } catch (error) {
      logger.error('Failed to add comment', error, { proposalId, userId });
      throw new Error('Failed to add comment');
    }
  }

  /**
   * Get comments for a proposal
   */
  async getProposalComments(
    proposalId: string,
    userId: string,
    userRole: string
  ): Promise<ProposalComment[]> {
    // Verify access to proposal first
    await this.getProposal(proposalId, userId, userRole);

    try {
      const result = await dynamodb.query<ProposalCommentDynamoItem>(
        'PK = :pk AND begins_with(SK, :sk)',
        {
          ':pk': `PROPOSAL#${proposalId}`,
          ':sk': 'COMMENT#',
        },
        {
          scanIndexForward: true, // Oldest first
        }
      );

      return result.items
        .filter((item) => {
          // Filter out internal comments if user is client
          if (userRole === 'client' && item.isInternal) {
            return false;
          }
          return true;
        })
        .map((item) => ({
          id: item.id,
          proposalId: item.proposalId,
          userId: item.userId,
          userRole: item.userRole,
          userName: item.userName,
          content: item.content,
          createdAt: item.createdAt,
          isInternal: item.isInternal,
        }));
    } catch (error) {
      logger.error('Failed to get comments', error, { proposalId, userId });
      throw new Error('Failed to get comments');
    }
  }

  /**
   * Duplicate a proposal
   */
  async duplicateProposal(proposalId: string, userId: string, userRole: string): Promise<Proposal> {
    // Get original proposal
    const original = await this.getProposal(proposalId, userId, userRole);

    // Only freelancer can duplicate their own proposals
    if (userRole !== 'freelancer' || original.freelancerId !== userId) {
      throw new Error('Access denied: can only duplicate your own proposals');
    }

    // Create new proposal based on original
    const duplicateData: CreateProposalRequest = {
      title: `${original.title} (Copy)`,
      description: original.description,
      clientEmail: original.clientEmail,
      amount: original.amount,
      currency: original.currency,
      deliverables: [...original.deliverables],
      timeline: original.timeline,
      terms: original.terms,
    };

    try {
      const newProposal = await this.createProposal(userId, duplicateData);

      // Create version entry for the duplicate
      await this.createProposalVersion(
        newProposal.id,
        userId,
        ['Duplicated from proposal ' + proposalId],
        newProposal
      );

      logger.info('Proposal duplicated', { originalId: proposalId, newId: newProposal.id, userId });
      return newProposal;
    } catch (error) {
      logger.error('Failed to duplicate proposal', error, { proposalId, userId });
      throw new Error('Failed to duplicate proposal');
    }
  }

  /**
   * Get proposal version history
   */
  async getProposalVersions(
    proposalId: string,
    userId: string,
    userRole: string
  ): Promise<ProposalVersion[]> {
    // Verify access to proposal first
    await this.getProposal(proposalId, userId, userRole);

    try {
      const result = await dynamodb.query<ProposalVersionDynamoItem>(
        'PK = :pk AND begins_with(SK, :sk)',
        {
          ':pk': `PROPOSAL#${proposalId}`,
          ':sk': 'VERSION#',
        },
        {
          scanIndexForward: false, // Newest first
        }
      );

      return result.items.map((item) => ({
        versionNumber: item.versionNumber,
        proposalId: item.proposalId,
        changes: item.changes,
        createdBy: item.createdBy,
        createdAt: item.createdAt,
        previousVersion: item.previousVersion,
        snapshot: JSON.parse(item.snapshot),
      }));
    } catch (error) {
      logger.error('Failed to get proposal versions', error, { proposalId, userId });
      throw new Error('Failed to get proposal versions');
    }
  }

  // =============================================================================
  // PRIVATE HELPER METHODS FOR ENHANCED FEATURES
  // =============================================================================

  private async initializeAnalytics(proposalId: string): Promise<ProposalAnalytics> {
    const now = new Date().toISOString();
    const analytics: ProposalAnalyticsDynamoItem = {
      PK: `PROPOSAL#${proposalId}`,
      SK: 'ANALYTICS',
      GSI1PK: 'ANALYTICS#PROPOSAL',
      GSI1SK: now,
      proposalId,
      totalViews: 0,
      uniqueViews: 0,
      timeSpentViewing: 0,
      viewsBySection: {},
      engagementScore: 0,
      createdAt: now,
      updatedAt: now,
    };

    await dynamodb.put(analytics as unknown as Record<string, unknown>);

    return {
      proposalId,
      totalViews: 0,
      uniqueViews: 0,
      timeSpentViewing: 0,
      viewsBySection: {},
      engagementScore: 0,
      viewTimeline: [],
    };
  }

  private async updateAnalyticsFromView(
    proposalId: string,
    userId: string,
    viewData: TrackViewRequest
  ): Promise<void> {
    const analyticsKey = {
      PK: `PROPOSAL#${proposalId}`,
      SK: 'ANALYTICS',
    };

    try {
      const existing = await dynamodb.get<ProposalAnalyticsDynamoItem>(analyticsKey);
      if (!existing) return;

      const updates: Partial<ProposalAnalyticsDynamoItem> = {
        totalViews: existing.totalViews + 1,
        timeSpentViewing: existing.timeSpentViewing + viewData.timeSpent,
        lastViewedAt: new Date().toISOString(),
      };

      // Update section views
      if (viewData.section) {
        const viewsBySection = { ...existing.viewsBySection };
        viewsBySection[viewData.section] = (viewsBySection[viewData.section] || 0) + 1;
        updates.viewsBySection = viewsBySection;
      }

      // Calculate engagement score (simplified)
      const engagementScore = Math.min(
        100,
        Math.round(
          updates.totalViews * 2 + (updates.timeSpentViewing / 60) * 5 // 5 points per minute
        )
      );
      updates.engagementScore = engagementScore;

      await dynamodb.update(analyticsKey, updates);
    } catch (error) {
      logger.error('Failed to update analytics', error, { proposalId, userId });
    }
  }

  private async getViewTimeline(proposalId: string): Promise<ViewEvent[]> {
    try {
      const result = await dynamodb.query<ViewEventDynamoItem>(
        'PK = :pk AND begins_with(SK, :sk)',
        {
          ':pk': `PROPOSAL#${proposalId}`,
          ':sk': 'VIEW#',
        },
        {
          scanIndexForward: false, // Newest first
          limit: 50, // Limit to recent views
        }
      );

      return result.items.map((item) => ({
        timestamp: item.timestamp,
        clientId: item.clientId,
        clientEmail: item.clientEmail,
        section: item.section,
        timeSpent: item.timeSpent,
        userAgent: item.userAgent,
      }));
    } catch (error) {
      logger.error('Failed to get view timeline', error, { proposalId });
      return [];
    }
  }

  private async createProposalVersion(
    proposalId: string,
    userId: string,
    changes: string[],
    snapshot: Partial<Proposal>
  ): Promise<void> {
    try {
      // Get current version number
      const existingVersions = await dynamodb.query<ProposalVersionDynamoItem>(
        'PK = :pk AND begins_with(SK, :sk)',
        {
          ':pk': `PROPOSAL#${proposalId}`,
          ':sk': 'VERSION#',
        },
        {
          scanIndexForward: false,
          limit: 1,
        }
      );

      const versionNumber =
        existingVersions.items.length > 0 ? existingVersions.items[0].versionNumber + 1 : 1;

      const now = new Date().toISOString();
      const version: ProposalVersionDynamoItem = {
        PK: `PROPOSAL#${proposalId}`,
        SK: `VERSION#${versionNumber.toString().padStart(3, '0')}`,
        GSI1PK: 'VERSION#PROPOSAL',
        GSI1SK: now,
        versionNumber,
        proposalId,
        changes,
        createdBy: userId,
        createdAt: now,
        previousVersion: versionNumber > 1 ? versionNumber - 1 : undefined,
        snapshot: JSON.stringify(snapshot),
      };

      await dynamodb.put(version as unknown as Record<string, unknown>);
    } catch (error) {
      logger.error('Failed to create version', error, { proposalId, userId });
    }
  }

  private async sendCommentNotification(
    proposalId: string,
    comment: ProposalCommentDynamoItem,
    senderRole: string
  ): Promise<void> {
    try {
      // Get proposal to find recipient
      const proposal = await dynamodb.get<ProposalDynamoItem>({
        PK: `PROPOSAL#${proposalId}`,
        SK: 'METADATA',
      });

      if (!proposal) return;

      // Don't send notifications for internal comments
      if (comment.isInternal) return;

      const subject = `New comment on proposal: ${proposal.title}`;
      const html = `
        <h2>New Comment</h2>
        <p><strong>From:</strong> ${comment.userName} (${comment.userRole})</p>
        <p><strong>Proposal:</strong> ${proposal.title}</p>
        <p><strong>Comment:</strong></p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
          ${comment.content}
        </div>
        <p><a href="${process.env['CLIENT_URL']}/proposals/${proposalId}">View Proposal</a></p>
      `;

      // Send to the other party
      const recipientEmail =
        senderRole === 'freelancer' ? proposal.clientEmail : 'freelancer@example.com'; // Would need freelancer email

      if (recipientEmail && recipientEmail !== 'freelancer@example.com') {
        await ses.sendHtml(recipientEmail, subject, html);
        logger.info('Comment notification sent', { proposalId, commentId: comment.id });
      }
    } catch (error) {
      logger.error('Failed to send comment notification', error, {
        proposalId,
        commentId: comment.id,
      });
    }
  }
}
