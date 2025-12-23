import { v4 as uuidv4 } from 'uuid';
import { dynamodb } from '../../../shared/clients/dynamodb';
import { ses } from '../../../shared/clients/ses';
import {
  Contract,
  ContractStatus,
  CreateContractRequest,
  UpdateContractRequest,
  Signature,
  SignatureType,
  ListContractsQuery,
  ListContractsResponse,
} from '../types';

/**
 * Contract Service - Business logic for contract management
 */
export class ContractService {
  /**
   * Create a new contract
   */
  async createContract(freelancerId: string, request: CreateContractRequest): Promise<Contract> {
    const contractId = uuidv4();
    const now = new Date().toISOString();

    const contract: Contract = {
      id: contractId,
      proposalId: request.proposalId,
      title: request.title,
      content: request.content,
      freelancerId,
      clientId: request.clientId,
      clientEmail: request.clientEmail,
      status: ContractStatus.DRAFT,
      amount: request.amount,
      currency: request.currency,
      deliverables: request.deliverables,
      timeline: request.timeline,
      terms: request.terms,
      signatures: [],
      createdAt: now,
      updatedAt: now,
      // DynamoDB keys
      PK: `CONTRACT#${contractId}`,
      SK: 'METADATA',
      GSI1PK: `FREELANCER#${freelancerId}`,
      GSI1SK: `CONTRACT#${now}`,
    };

    await dynamodb.put(contract);
    return contract;
  }

  /**
   * Get contract by ID
   */
  async getContract(contractId: string): Promise<Contract | null> {
    const contract = await dynamodb.get<Contract>({
      PK: `CONTRACT#${contractId}`,
      SK: 'METADATA',
    });

    return contract;
  }

  /**
   * List contracts for a user (freelancer or client)
   */
  async listContracts(
    userId: string,
    userRole: string,
    query: ListContractsQuery = {}
  ): Promise<ListContractsResponse> {
    const { status, limit = 50, offset = 0 } = query;

    if (userRole === 'freelancer') {
      // Get contracts created by freelancer
      return this.getContractsByFreelancer(userId, query);
    } else if (userRole === 'client') {
      // Get contracts sent to client
      return this.getContractsByClient(userId, query);
    } else {
      // Admin - scan all contracts (not optimal, but for admin use)
      const result = await dynamodb.scan<Contract>({
        filterExpression: 'SK = :sk',
        expressionAttributeValues: { ':sk': 'METADATA' },
        limit: limit + offset,
      });

      const contracts = result.items.slice(offset, offset + limit);
      return {
        contracts: status ? contracts.filter((c) => c.status === status) : contracts,
        totalCount: result.count,
      };
    }
  }

  /**
   * Get contracts created by freelancer
   */
  private async getContractsByFreelancer(
    freelancerId: string,
    query: ListContractsQuery = {}
  ): Promise<ListContractsResponse> {
    const { status, limit = 50, offset = 0 } = query;

    let filterExpression: string | undefined;
    const expressionAttributeValues: Record<string, unknown> = {
      ':freelancerPK': `FREELANCER#${freelancerId}`,
    };

    if (status) {
      filterExpression = '#status = :status';
      expressionAttributeValues[':status'] = status;
    }

    const result = await dynamodb.query<Contract>(
      'GSI1PK = :freelancerPK',
      expressionAttributeValues,
      {
        indexName: 'GSI1',
        filterExpression,
        expressionAttributeNames: status ? { '#status': 'status' } : undefined,
        limit: limit + offset,
        scanIndexForward: false, // Latest first
      }
    );

    const contracts = result.items.slice(offset, offset + limit);
    return {
      contracts,
      totalCount: result.count,
    };
  }

  /**
   * Get contracts sent to client
   */
  private async getContractsByClient(
    clientId: string,
    query: ListContractsQuery = {}
  ): Promise<ListContractsResponse> {
    const { status, limit = 50, offset = 0 } = query;

    // For clients, we need to scan and filter by clientId since we don't have a GSI for clients
    // In a production system, you might want to add a GSI2 for client queries
    let filterExpression = 'SK = :sk AND clientId = :clientId';
    const expressionAttributeValues: Record<string, unknown> = {
      ':sk': 'METADATA',
      ':clientId': clientId,
    };

    if (status) {
      filterExpression += ' AND #status = :status';
      expressionAttributeValues[':status'] = status;
    }

    const result = await dynamodb.scan<Contract>({
      filterExpression,
      expressionAttributeNames: status ? { '#status': 'status' } : undefined,
      expressionAttributeValues,
      limit: limit + offset,
    });

    const contracts = result.items.slice(offset, offset + limit);
    return {
      contracts,
      totalCount: result.count,
    };
  }

  /**
   * Update contract
   */
  async updateContract(contractId: string, updates: UpdateContractRequest): Promise<Contract> {
    const contract = await dynamodb.update<Contract>(
      {
        PK: `CONTRACT#${contractId}`,
        SK: 'METADATA',
      },
      updates as Partial<Contract>
    );

    return contract;
  }

  /**
   * Send contract to client (change status to sent)
   */
  async sendContract(contractId: string): Promise<Contract> {
    const now = new Date().toISOString();

    const contract = await dynamodb.update<Contract>(
      {
        PK: `CONTRACT#${contractId}`,
        SK: 'METADATA',
      },
      {
        status: ContractStatus.SENT,
        sentAt: now,
      }
    );

    // Send email notification to client
    try {
      await this.sendContractNotificationEmail(contract);
    } catch (error) {
      console.error('Failed to send contract notification email:', error);
      // Don't fail the contract sending if email fails
    }

    return contract;
  }

  /**
   * Send email notification to client when contract is sent
   */
  private async sendContractNotificationEmail(contract: Contract): Promise<void> {
    const subject = `New Contract: ${contract.title}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">You have received a new contract</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #495057;">${contract.title}</h3>
          <p><strong>Amount:</strong> ${this.formatCurrency(contract.amount, contract.currency)}</p>
          <p><strong>Timeline:</strong> ${contract.timeline}</p>
          <p><strong>Deliverables:</strong></p>
          <ul>
            ${contract.deliverables.map((item) => `<li>${item}</li>`).join('')}
          </ul>
        </div>

        <div style="background-color: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Next Steps:</strong></p>
          <p style="margin: 5px 0 0 0;">Please review the contract details and provide your digital signature if you agree to the terms.</p>
        </div>

        <div style="margin: 30px 0;">
          <a href="${this.getContractUrl(contract.id)}" 
             style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Review & Sign Contract
          </a>
        </div>

        <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
        
        <div style="color: #6c757d; font-size: 14px;">
          <p><strong>Contract Details:</strong></p>
          <p>Contract ID: ${contract.id}</p>
          <p>Sent: ${new Date(contract.sentAt || contract.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    `;

    const text = `
You have received a new contract: ${contract.title}

Amount: ${this.formatCurrency(contract.amount, contract.currency)}
Timeline: ${contract.timeline}

Deliverables:
${contract.deliverables.map((item) => `- ${item}`).join('\n')}

Please review the contract and provide your digital signature if you agree to the terms.

Contract Link: ${this.getContractUrl(contract.id)}

Contract ID: ${contract.id}
Sent: ${new Date(contract.sentAt || contract.createdAt).toLocaleDateString()}
    `;

    await ses.sendMultipart(contract.clientEmail, subject, text, html);
  }

  /**
   * Send email notification when contract is signed
   */
  private async sendContractSignedEmail(contract: Contract, signature: Signature): Promise<void> {
    // Note: In a real application, you'd get the freelancer's email from the user database
    // For now, we'll just log the notification since we don't have freelancer email in contract
    console.log('Contract signed notification:', {
      contractId: contract.id,
      contractTitle: contract.title,
      freelancerId: contract.freelancerId,
      signerName: signature.signerName,
      signedAt: signature.signedAt,
      amount: this.formatCurrency(contract.amount, contract.currency),
    });

    // TODO: Implement freelancer notification when we have user email lookup
    // This would require querying the users table/service to get freelancer email
  }

  /**
   * Helper method to format currency
   */
  private formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  /**
   * Helper method to get contract URL
   */
  private getContractUrl(contractId: string): string {
    const baseUrl = process.env['FRONTEND_URL'] || 'https://your-app.com';
    return `${baseUrl}/contracts/${contractId}`;
  }

  /**
   * Sign contract
   */
  async signContract(
    contractId: string,
    signerId: string,
    signerEmail: string,
    signerName: string,
    ipAddress: string,
    userAgent: string
  ): Promise<{ signature: Signature; contract: Contract }> {
    const now = new Date().toISOString();

    // Get current contract
    const contract = await this.getContract(contractId);
    if (!contract) {
      throw new Error('Contract not found');
    }

    if (contract.status !== ContractStatus.SENT) {
      throw new Error('Contract must be in sent status to be signed');
    }

    // Check if user already signed
    const existingSignature = contract.signatures.find((s) => s.signerId === signerId);
    if (existingSignature) {
      throw new Error('You have already signed this contract');
    }

    // Create signature
    const signature: Signature = {
      signerId,
      signerName,
      signerEmail,
      signedAt: now,
      ipAddress,
      userAgent,
      signatureType: SignatureType.TYPED,
    };

    // Update contract with signature
    const updatedSignatures = [...contract.signatures, signature];
    const isFullySigned = this.isContractFullySigned(contract, updatedSignatures);

    const updatedContract = await dynamodb.update<Contract>(
      {
        PK: `CONTRACT#${contractId}`,
        SK: 'METADATA',
      },
      {
        signatures: updatedSignatures,
        status: isFullySigned ? ContractStatus.SIGNED : ContractStatus.SENT,
        signedAt: isFullySigned ? now : contract.signedAt,
      }
    );

    // Send email notifications
    if (isFullySigned) {
      try {
        await this.sendContractSignedEmail(updatedContract, signature);
      } catch (error) {
        console.error('Failed to send contract signed notification:', error);
        // Don't fail the signing process if email fails
      }
    }

    return { signature, contract: updatedContract };
  }

  /**
   * Check if contract is fully signed by all required parties
   */
  private isContractFullySigned(contract: Contract, signatures: Signature[]): boolean {
    // For now, we only require client signature
    // In the future, we might require both freelancer and client signatures
    const clientSigned = signatures.some((s) => s.signerId === contract.clientId);
    return clientSigned;
  }

  /**
   * Delete contract (soft delete by changing status)
   */
  async deleteContract(contractId: string): Promise<void> {
    await dynamodb.update(
      {
        PK: `CONTRACT#${contractId}`,
        SK: 'METADATA',
      },
      {
        status: ContractStatus.CANCELLED,
      }
    );
  }

  /**
   * Check if user can access contract
   */
  canAccessContract(contract: Contract, userId: string, userRole: string): boolean {
    if (userRole === 'admin') {
      return true;
    }

    return contract.freelancerId === userId || contract.clientId === userId;
  }

  /**
   * Check if user can update contract
   */
  canUpdateContract(contract: Contract, userId: string, userRole: string): boolean {
    if (userRole === 'admin') {
      return true;
    }

    // Only freelancer can update contract, and only if not signed
    return contract.freelancerId === userId && contract.status !== ContractStatus.SIGNED;
  }

  /**
   * Check if user can sign contract
   */
  canSignContract(contract: Contract, userId: string): boolean {
    // Only client can sign, and contract must be sent
    return contract.clientId === userId && contract.status === ContractStatus.SENT;
  }
}
