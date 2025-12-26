import { v4 as uuidv4 } from 'uuid';
import { dynamodb } from '../../../shared/clients/dynamodb';
import { gemini } from '../../../shared/clients/gemini';
import { createLogger } from '../../../shared/logger';
import {
  IdeaEntity,
  IdeaResponse,
  CreateIdeaRequest,
  UpdateIdeaRequest,
  ListIdeasQuery,
  ListIdeasResponse,
  EnhanceIdeaRequest,
  EnhanceIdeaResponse,
  VALIDATION_RULES,
  COMPLEXITY_LEVELS,
  TIME_COMMITMENTS,
  IDEA_STATUSES,
} from '../types';

const logger = createLogger('IdeaService');

export class IdeaService {
  /**
   * Create a new idea
   */
  async createIdea(userId: string, data: CreateIdeaRequest): Promise<IdeaResponse> {
    // Validate input
    this.validateCreateRequest(data);

    const id = uuidv4();
    const now = new Date().toISOString();

    const entity: IdeaEntity = {
      PK: `IDEA#${id}`,
      SK: 'DETAILS',
      GSI1PK: `USER#${userId}`,
      GSI1SK: `IDEA#${id}`,
      GSI2PK: `STATUS#${data.status || 'published'}`,
      GSI2SK: `CREATED#${now}`,

      id,
      title: data.title.trim(),
      description: data.description.trim(),
      problemStatement: data.problemStatement.trim(),
      proposedSolution: data.proposedSolution.trim(),
      techStack: data.techStack.map((tech) => tech.trim()),
      teamSizeNeeded: data.teamSizeNeeded,
      complexityLevel: data.complexityLevel,
      timeCommitment: data.timeCommitment,
      creatorId: userId,
      createdAt: now,
      updatedAt: now,
      status: data.status || 'published',
      tags: data.tags?.map((tag) => tag.trim()) || [],

      entityType: 'IDEA',
    };

    await dynamodb.put(entity as unknown as Record<string, unknown>);

    logger.info('Idea created', { ideaId: id, userId });

    return this.entityToResponse(entity);
  }

  /**
   * Get idea by ID
   */
  async getIdea(id: string): Promise<IdeaResponse | null> {
    const entity = await dynamodb.get<IdeaEntity>({
      PK: `IDEA#${id}`,
      SK: 'DETAILS',
    });

    if (!entity) {
      return null;
    }

    return this.entityToResponse(entity);
  }

  /**
   * Update an existing idea
   */
  async updateIdea(id: string, userId: string, data: UpdateIdeaRequest): Promise<IdeaResponse> {
    // Get existing idea
    const existing = await dynamodb.get<IdeaEntity>({
      PK: `IDEA#${id}`,
      SK: 'DETAILS',
    });

    if (!existing) {
      throw new Error('Idea not found');
    }

    if (existing.creatorId !== userId) {
      throw new Error('Not authorized to update this idea');
    }

    // Validate update data
    this.validateUpdateRequest(data);

    const now = new Date().toISOString();
    const updates: Partial<IdeaEntity> = {
      updatedAt: now,
    };

    // Update fields if provided
    if (data.title !== undefined) {
      updates.title = data.title.trim();
    }
    if (data.description !== undefined) {
      updates.description = data.description.trim();
    }
    if (data.problemStatement !== undefined) {
      updates.problemStatement = data.problemStatement.trim();
    }
    if (data.proposedSolution !== undefined) {
      updates.proposedSolution = data.proposedSolution.trim();
    }
    if (data.techStack !== undefined) {
      updates.techStack = data.techStack.map((tech) => tech.trim());
    }
    if (data.teamSizeNeeded !== undefined) {
      updates.teamSizeNeeded = data.teamSizeNeeded;
    }
    if (data.complexityLevel !== undefined) {
      updates.complexityLevel = data.complexityLevel;
    }
    if (data.timeCommitment !== undefined) {
      updates.timeCommitment = data.timeCommitment;
    }
    if (data.status !== undefined) {
      updates.status = data.status;
      updates.GSI2PK = `STATUS#${data.status}`;
    }
    if (data.tags !== undefined) {
      updates.tags = data.tags.map((tag) => tag.trim());
    }

    const updated = await dynamodb.update({ PK: `IDEA#${id}`, SK: 'DETAILS' }, updates);

    logger.info('Idea updated', { ideaId: id, userId });

    return this.entityToResponse(updated as IdeaEntity);
  }

  /**
   * Delete an idea
   */
  async deleteIdea(id: string, userId: string): Promise<void> {
    // Get existing idea to check ownership
    const existing = await dynamodb.get<IdeaEntity>({
      PK: `IDEA#${id}`,
      SK: 'DETAILS',
    });

    if (!existing) {
      throw new Error('Idea not found');
    }

    if (existing.creatorId !== userId) {
      throw new Error('Not authorized to delete this idea');
    }

    await dynamodb.delete({
      PK: `IDEA#${id}`,
      SK: 'DETAILS',
    });

    logger.info('Idea deleted', { ideaId: id, userId });
  }

  /**
   * List ideas with filtering and pagination
   */
  async listIdeas(query: ListIdeasQuery): Promise<ListIdeasResponse> {
    const limit = Math.min(query.limit || 20, 100);
    const offset = query.offset || 0;

    let ideas: IdeaEntity[] = [];

    if (query.creatorId) {
      // Query by creator using GSI1
      const result = await dynamodb.query(
        'GSI1PK = :pk',
        { ':pk': `USER#${query.creatorId}` },
        {
          indexName: 'GSI1',
          limit: limit + offset,
        }
      );
      ideas = result.items as IdeaEntity[];
    } else if (query.status) {
      // Query by status using GSI2
      const result = await dynamodb.query(
        'GSI2PK = :pk',
        { ':pk': `STATUS#${query.status}` },
        {
          indexName: 'GSI2',
          limit: limit + offset,
          scanIndexForward: query.sortOrder !== 'asc',
        }
      );
      ideas = result.items as IdeaEntity[];
    } else {
      const result = await dynamodb.scan({
        filterExpression: 'entityType = :type',
        expressionAttributeValues: { ':type': 'IDEA' },
        limit: limit + offset,
      });
      ideas = result.items as IdeaEntity[];
    }

    // Apply additional filters
    let filteredIdeas = ideas;

    if (query.search) {
      const searchLower = query.search.toLowerCase();
      filteredIdeas = filteredIdeas.filter(
        (idea) =>
          idea.title.toLowerCase().includes(searchLower) ||
          idea.description.toLowerCase().includes(searchLower) ||
          idea.techStack.some((tech) => tech.toLowerCase().includes(searchLower))
      );
    }

    if (query.techStack && query.techStack.length > 0) {
      filteredIdeas = filteredIdeas.filter((idea) =>
        query.techStack!.some((tech) =>
          idea.techStack.some((ideaTech) => ideaTech.toLowerCase().includes(tech.toLowerCase()))
        )
      );
    }

    if (query.complexityLevel) {
      filteredIdeas = filteredIdeas.filter(
        (idea) => idea.complexityLevel === query.complexityLevel
      );
    }

    if (query.timeCommitment) {
      filteredIdeas = filteredIdeas.filter((idea) => idea.timeCommitment === query.timeCommitment);
    }

    // Sort results
    if (query.sortBy) {
      filteredIdeas.sort((a, b) => {
        let aValue: string | number;
        let bValue: string | number;

        switch (query.sortBy) {
          case 'title':
            aValue = a.title.toLowerCase();
            bValue = b.title.toLowerCase();
            break;
          case 'updatedAt':
            aValue = a.updatedAt;
            bValue = b.updatedAt;
            break;
          default:
            aValue = a.createdAt;
            bValue = b.createdAt;
        }

        if (query.sortOrder === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    }

    // Apply pagination
    const paginatedIdeas = filteredIdeas.slice(offset, offset + limit);
    const hasMore = filteredIdeas.length > offset + limit;

    logger.debug('Ideas listed', {
      total: filteredIdeas.length,
      returned: paginatedIdeas.length,
      hasMore,
    });

    return {
      ideas: paginatedIdeas.map((idea) => this.entityToResponse(idea)),
      totalCount: filteredIdeas.length,
      hasMore,
    };
  }

  /**
   * Enhance idea description using AI
   */
  async enhanceIdea(params: EnhanceIdeaRequest): Promise<EnhanceIdeaResponse> {
    try {
      // Input validation
      if (!params.description?.trim()) {
        throw new Error('Description is required');
      }
      if (params.description.length < 50) {
        throw new Error('Description must be at least 50 characters');
      }
      if (params.description.length > 2000) {
        throw new Error('Description too long (max 2000 characters)');
      }

      // Use Gemini AI to enhance the idea
      const prompt = `You are a hackathon mentor helping participants improve their project ideas.

Enhance this idea description to be more compelling and complete:
"${params.description}"

${params.problemStatement ? `Problem context: ${params.problemStatement}` : ''}
${params.complexityLevel ? `Target complexity: ${params.complexityLevel}` : ''}
${params.techPreferences?.length ? `Preferred technologies: ${params.techPreferences.join(', ')}` : ''}

Please provide:
1. An enhanced, clearer description (keep the core idea but improve clarity and appeal)
2. Suggest 3-5 relevant technologies for the tech stack
3. Recommend 2-4 team roles needed (e.g., Frontend Developer, Backend Developer, UI/UX Designer, Data Scientist)
4. Brief improvement suggestions

Return as JSON with this structure:
{
  "enhancedDescription": "improved description here",
  "suggestedTechStack": ["React", "Node.js", "PostgreSQL"],
  "recommendedTeamRoles": ["Frontend Developer", "Backend Developer"],
  "improvementSuggestions": ["Add user personas", "Define success metrics"]
}`;

      const response = await gemini.generateJSON<{
        enhancedDescription: string;
        suggestedTechStack: string[];
        recommendedTeamRoles: string[];
        improvementSuggestions: string[];
      }>(prompt, {
        config: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      });

      logger.info('Idea enhanced successfully', {
        originalLength: params.description.length,
        enhancedLength: response.enhancedDescription.length,
      });

      return {
        enhancedDescription: response.enhancedDescription,
        suggestedTechStack: response.suggestedTechStack || [],
        recommendedTeamRoles: response.recommendedTeamRoles || [],
        improvementSuggestions: response.improvementSuggestions || [],
        confidence: 0.85,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Idea enhancement failed', error);

      // Fallback to basic enhancement
      return {
        enhancedDescription: this.basicEnhancement(params.description),
        suggestedTechStack: this.suggestBasicTechStack(params.techPreferences),
        recommendedTeamRoles: ['Frontend Developer', 'Backend Developer'],
        improvementSuggestions: ['Add more technical details', 'Define target users'],
        confidence: 0.6,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Convert entity to response format
   */
  private entityToResponse(entity: IdeaEntity): IdeaResponse {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      problemStatement: entity.problemStatement,
      proposedSolution: entity.proposedSolution,
      techStack: entity.techStack,
      teamSizeNeeded: entity.teamSizeNeeded,
      complexityLevel: entity.complexityLevel,
      timeCommitment: entity.timeCommitment,
      creatorId: entity.creatorId,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      status: entity.status,
      tags: entity.tags,
    };
  }

  /**
   * Validate create request
   */
  private validateCreateRequest(data: CreateIdeaRequest): void {
    if (!data.title?.trim()) {
      throw new Error('Title is required');
    }
    if (
      data.title.length < VALIDATION_RULES.title.minLength ||
      data.title.length > VALIDATION_RULES.title.maxLength
    ) {
      throw new Error(
        `Title must be between ${VALIDATION_RULES.title.minLength} and ${VALIDATION_RULES.title.maxLength} characters`
      );
    }

    if (!data.description?.trim()) {
      throw new Error('Description is required');
    }
    if (
      data.description.length < VALIDATION_RULES.description.minLength ||
      data.description.length > VALIDATION_RULES.description.maxLength
    ) {
      throw new Error(
        `Description must be between ${VALIDATION_RULES.description.minLength} and ${VALIDATION_RULES.description.maxLength} characters`
      );
    }

    if (!data.problemStatement?.trim()) {
      throw new Error('Problem statement is required');
    }
    if (
      data.problemStatement.length < VALIDATION_RULES.problemStatement.minLength ||
      data.problemStatement.length > VALIDATION_RULES.problemStatement.maxLength
    ) {
      throw new Error(
        `Problem statement must be between ${VALIDATION_RULES.problemStatement.minLength} and ${VALIDATION_RULES.problemStatement.maxLength} characters`
      );
    }

    if (!data.proposedSolution?.trim()) {
      throw new Error('Proposed solution is required');
    }
    if (
      data.proposedSolution.length < VALIDATION_RULES.proposedSolution.minLength ||
      data.proposedSolution.length > VALIDATION_RULES.proposedSolution.maxLength
    ) {
      throw new Error(
        `Proposed solution must be between ${VALIDATION_RULES.proposedSolution.minLength} and ${VALIDATION_RULES.proposedSolution.maxLength} characters`
      );
    }

    if (
      !data.techStack ||
      data.techStack.length < VALIDATION_RULES.techStack.minItems ||
      data.techStack.length > VALIDATION_RULES.techStack.maxItems
    ) {
      throw new Error(
        `Tech stack must have between ${VALIDATION_RULES.techStack.minItems} and ${VALIDATION_RULES.techStack.maxItems} items`
      );
    }

    if (
      data.teamSizeNeeded < VALIDATION_RULES.teamSizeNeeded.min ||
      data.teamSizeNeeded > VALIDATION_RULES.teamSizeNeeded.max
    ) {
      throw new Error(
        `Team size must be between ${VALIDATION_RULES.teamSizeNeeded.min} and ${VALIDATION_RULES.teamSizeNeeded.max}`
      );
    }

    if (!COMPLEXITY_LEVELS.includes(data.complexityLevel)) {
      throw new Error(`Complexity level must be one of: ${COMPLEXITY_LEVELS.join(', ')}`);
    }

    if (!TIME_COMMITMENTS.includes(data.timeCommitment)) {
      throw new Error(`Time commitment must be one of: ${TIME_COMMITMENTS.join(', ')}`);
    }

    if (data.status && !IDEA_STATUSES.includes(data.status)) {
      throw new Error(`Status must be one of: ${IDEA_STATUSES.join(', ')}`);
    }

    if (data.tags && data.tags.length > VALIDATION_RULES.tags.maxItems) {
      throw new Error(`Maximum ${VALIDATION_RULES.tags.maxItems} tags allowed`);
    }

    if (data.tags && data.tags.some((tag) => tag.length > VALIDATION_RULES.tags.maxLength)) {
      throw new Error(`Tag length cannot exceed ${VALIDATION_RULES.tags.maxLength} characters`);
    }
  }

  /**
   * Validate update request
   */
  private validateUpdateRequest(data: UpdateIdeaRequest): void {
    if (data.title !== undefined) {
      if (!data.title?.trim()) {
        throw new Error('Title cannot be empty');
      }
      if (
        data.title.length < VALIDATION_RULES.title.minLength ||
        data.title.length > VALIDATION_RULES.title.maxLength
      ) {
        throw new Error(
          `Title must be between ${VALIDATION_RULES.title.minLength} and ${VALIDATION_RULES.title.maxLength} characters`
        );
      }
    }

    if (data.description !== undefined) {
      if (!data.description?.trim()) {
        throw new Error('Description cannot be empty');
      }
      if (
        data.description.length < VALIDATION_RULES.description.minLength ||
        data.description.length > VALIDATION_RULES.description.maxLength
      ) {
        throw new Error(
          `Description must be between ${VALIDATION_RULES.description.minLength} and ${VALIDATION_RULES.description.maxLength} characters`
        );
      }
    }

    if (data.problemStatement !== undefined) {
      if (!data.problemStatement?.trim()) {
        throw new Error('Problem statement cannot be empty');
      }
      if (
        data.problemStatement.length < VALIDATION_RULES.problemStatement.minLength ||
        data.problemStatement.length > VALIDATION_RULES.problemStatement.maxLength
      ) {
        throw new Error(
          `Problem statement must be between ${VALIDATION_RULES.problemStatement.minLength} and ${VALIDATION_RULES.problemStatement.maxLength} characters`
        );
      }
    }

    if (data.proposedSolution !== undefined) {
      if (!data.proposedSolution?.trim()) {
        throw new Error('Proposed solution cannot be empty');
      }
      if (
        data.proposedSolution.length < VALIDATION_RULES.proposedSolution.minLength ||
        data.proposedSolution.length > VALIDATION_RULES.proposedSolution.maxLength
      ) {
        throw new Error(
          `Proposed solution must be between ${VALIDATION_RULES.proposedSolution.minLength} and ${VALIDATION_RULES.proposedSolution.maxLength} characters`
        );
      }
    }

    if (data.techStack !== undefined) {
      if (
        !data.techStack ||
        data.techStack.length < VALIDATION_RULES.techStack.minItems ||
        data.techStack.length > VALIDATION_RULES.techStack.maxItems
      ) {
        throw new Error(
          `Tech stack must have between ${VALIDATION_RULES.techStack.minItems} and ${VALIDATION_RULES.techStack.maxItems} items`
        );
      }
    }

    if (data.teamSizeNeeded !== undefined) {
      if (
        data.teamSizeNeeded < VALIDATION_RULES.teamSizeNeeded.min ||
        data.teamSizeNeeded > VALIDATION_RULES.teamSizeNeeded.max
      ) {
        throw new Error(
          `Team size must be between ${VALIDATION_RULES.teamSizeNeeded.min} and ${VALIDATION_RULES.teamSizeNeeded.max}`
        );
      }
    }

    if (data.complexityLevel !== undefined && !COMPLEXITY_LEVELS.includes(data.complexityLevel)) {
      throw new Error(`Complexity level must be one of: ${COMPLEXITY_LEVELS.join(', ')}`);
    }

    if (data.timeCommitment !== undefined && !TIME_COMMITMENTS.includes(data.timeCommitment)) {
      throw new Error(`Time commitment must be one of: ${TIME_COMMITMENTS.join(', ')}`);
    }

    if (data.status !== undefined && !IDEA_STATUSES.includes(data.status)) {
      throw new Error(`Status must be one of: ${IDEA_STATUSES.join(', ')}`);
    }

    if (data.tags !== undefined) {
      if (data.tags.length > VALIDATION_RULES.tags.maxItems) {
        throw new Error(`Maximum ${VALIDATION_RULES.tags.maxItems} tags allowed`);
      }
      if (data.tags.some((tag) => tag.length > VALIDATION_RULES.tags.maxLength)) {
        throw new Error(`Tag length cannot exceed ${VALIDATION_RULES.tags.maxLength} characters`);
      }
    }
  }

  /**
   * Basic text enhancement fallback
   */
  private basicEnhancement(description: string): string {
    let enhanced = description.trim();

    // Capitalize first letter
    enhanced = enhanced.charAt(0).toUpperCase() + enhanced.slice(1);

    // Add period if missing
    if (!enhanced.match(/[.!?]$/)) {
      enhanced += '.';
    }

    // Basic structure improvements
    if (!enhanced.includes('problem') && !enhanced.includes('solution')) {
      enhanced = `Problem: ${enhanced}\n\nSolution: This project aims to address the above challenge through innovative technology.`;
    }

    return enhanced;
  }

  /**
   * Suggest basic tech stack fallback
   */
  private suggestBasicTechStack(preferences?: string[]): string[] {
    const commonStacks: string[][] = [
      ['React', 'Node.js', 'MongoDB'],
      ['Vue.js', 'Express', 'PostgreSQL'],
      ['React Native', 'Firebase', 'TypeScript'],
      ['Python', 'Flask', 'SQLite'],
      ['Next.js', 'Prisma', 'Supabase'],
    ];

    if (preferences && preferences.length > 0) {
      return preferences.slice(0, 5);
    }

    const randomIndex = Math.floor(Math.random() * commonStacks.length);
    return commonStacks[randomIndex] || ['React', 'Node.js', 'MongoDB'];
  }
}

export const ideaService = new IdeaService();
