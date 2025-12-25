/**
 * Idea Service - Business Logic Layer
 *
 * Handles all business logic for idea management including:
 * - CRUD operations for ideas
 * - Voting system
 * - AI-powered enhancements
 * - Search and filtering
 */

import { dynamodb } from '../../../shared/clients/dynamodb';
import { gemini } from '../../../shared/clients/gemini';
import { createLogger } from '../../../shared/logger';
import {
  Idea,
  IdeaVote,
  CreateIdeaRequest,
  UpdateIdeaRequest,
  ListIdeasQuery,
  ListIdeasResponse,
  AIEnhancementResult,
  SimilarIdea,
  generateIdeaId,
} from '../types';

const logger = createLogger('IdeaService');

export class IdeaService {
  /**
   * List ideas with filtering and pagination
   */
  async listIdeas(query: ListIdeasQuery): Promise<ListIdeasResponse> {
    const {
      limit = 20,
      offset = 0,
      category,
      difficulty,
      skills,
      status = 'published',
      authorId,
      sortBy = 'created',
      sortOrder = 'desc',
      search,
    } = query;

    try {
      logger.debug('Listing ideas with query', query);

      // For now, let's use a scan operation to get all ideas and then filter
      // This is less efficient but will work even if GSI1 doesn't have data yet
      const scanParams: any = {
        FilterExpression: 'begins_with(PK, :pkPrefix) AND SK = :sk',
        ExpressionAttributeValues: {
          ':pkPrefix': 'IDEA#',
          ':sk': 'METADATA',
        },
        ExpressionAttributeNames: {
          '#status': 'status',
        },
      };

      // Add additional filters
      const additionalFilters: string[] = [];

      if (status) {
        additionalFilters.push('#status = :status');
        scanParams.ExpressionAttributeValues[':status'] = status;
      }

      if (category) {
        additionalFilters.push('category = :category');
        scanParams.ExpressionAttributeValues[':category'] = category;
      }

      if (difficulty) {
        additionalFilters.push('difficulty = :difficulty');
        scanParams.ExpressionAttributeValues[':difficulty'] = difficulty;
      }

      if (authorId) {
        additionalFilters.push('authorId = :authorId');
        scanParams.ExpressionAttributeValues[':authorId'] = authorId;
      }

      if (skills && skills.length > 0) {
        const skillConditions = skills.map((_, index) => `contains(skills, :skill${index})`);
        additionalFilters.push(`(${skillConditions.join(' OR ')})`);
        skills.forEach((skill, index) => {
          scanParams.ExpressionAttributeValues[`:skill${index}`] = skill;
        });
      }

      if (search) {
        additionalFilters.push('(contains(title, :search) OR contains(description, :search))');
        scanParams.ExpressionAttributeValues[':search'] = search;
      }

      // Combine all filters
      if (additionalFilters.length > 0) {
        scanParams.FilterExpression += ' AND ' + additionalFilters.join(' AND ');
      }

      logger.debug('DynamoDB scan params', scanParams);

      // Use scan instead of query for now
      const result = await dynamodb.scan({
        filterExpression: scanParams.FilterExpression,
        expressionAttributeNames: scanParams.ExpressionAttributeNames,
        expressionAttributeValues: scanParams.ExpressionAttributeValues,
      });

      logger.debug('DynamoDB scan result', { itemCount: result.items.length });

      // Apply sorting
      let ideas = result.items as Idea[];
      ideas.sort((a, b) => {
        let aValue: any, bValue: any;
        switch (sortBy) {
          case 'votes':
            aValue = a.votes || 0;
            bValue = b.votes || 0;
            break;
          case 'feasibility':
            aValue = a.feasibilityScore || 0;
            bValue = b.feasibilityScore || 0;
            break;
          case 'updated':
            aValue = new Date(a.updatedAt).getTime();
            bValue = new Date(b.updatedAt).getTime();
            break;
          default:
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
        }

        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      });

      // Apply pagination
      const totalCount = ideas.length;
      const paginatedIdeas = ideas.slice(offset, offset + limit);

      logger.debug('Returning ideas', {
        totalFound: totalCount,
        returned: paginatedIdeas.length,
        offset,
        limit,
      });

      return {
        ideas: paginatedIdeas,
        totalCount,
      };
    } catch (error) {
      logger.error('Failed to list ideas', error);
      throw error;
    }
  }

  /**
   * Get single idea by ID
   */
  async getIdea(id: string): Promise<Idea> {
    try {
      const result = await dynamodb.get({
        PK: `IDEA#${id}`,
        SK: 'METADATA',
      });

      if (!result) {
        throw new Error('Idea not found');
      }

      logger.debug('Retrieved idea', { ideaId: id });
      return result as Idea;
    } catch (error) {
      logger.error('Failed to get idea', error, { ideaId: id });
      throw error;
    }
  }

  /**
   * Create new idea with AI enhancement
   */
  async createIdea(data: CreateIdeaRequest, authorId: string, authorName: string): Promise<Idea> {
    try {
      const ideaId = generateIdeaId();
      const now = new Date().toISOString();

      // AI Enhancement
      const aiEnhancement = await this.enhanceIdea(data);

      const idea: Idea = {
        id: ideaId,
        title: data.title,
        description: aiEnhancement.enhancedDescription,
        skills: data.skills,
        category: data.category,
        difficulty: data.difficulty,
        teamSize: data.teamSize,
        authorId,
        authorName,
        votes: 0,
        status: data.status || 'published',
        tags: aiEnhancement.generatedTags,
        feasibilityScore: aiEnhancement.feasibilityScore,
        createdAt: now,
        updatedAt: now,
      };

      // Store in DynamoDB
      await dynamodb.put({
        PK: `IDEA#${ideaId}`,
        SK: 'METADATA',
        GSI1PK: 'IDEAS',
        GSI1SK: `CREATED#${now}`,
        ...idea,
      });

      logger.info('Created idea', { ideaId, authorId });
      return idea;
    } catch (error) {
      logger.error('Failed to create idea', error);
      throw error;
    }
  }

  /**
   * Update existing idea
   */
  async updateIdea(id: string, data: UpdateIdeaRequest, userId: string): Promise<Idea> {
    try {
      // Get existing idea
      const existingIdea = await this.getIdea(id);

      // Check ownership
      if (existingIdea.authorId !== userId) {
        throw new Error('Not authorized to update this idea');
      }

      const now = new Date().toISOString();
      let aiEnhancement: AIEnhancementResult | null = null;

      // Re-enhance if description changed
      if (data.description && data.description !== existingIdea.description) {
        aiEnhancement = await this.enhanceIdea({
          title: data.title || existingIdea.title,
          description: data.description,
          skills: data.skills || existingIdea.skills,
          category: data.category || existingIdea.category,
          difficulty: data.difficulty || existingIdea.difficulty,
          teamSize: data.teamSize || existingIdea.teamSize,
        });
      }

      const updatedIdea: Idea = {
        ...existingIdea,
        ...(data.title && { title: data.title }),
        ...(data.description && {
          description: aiEnhancement?.enhancedDescription || data.description,
        }),
        ...(data.skills && { skills: data.skills }),
        ...(data.category && { category: data.category }),
        ...(data.difficulty && { difficulty: data.difficulty }),
        ...(data.teamSize && { teamSize: data.teamSize }),
        ...(data.status && { status: data.status }),
        ...(aiEnhancement && {
          tags: aiEnhancement.generatedTags,
          feasibilityScore: aiEnhancement.feasibilityScore,
        }),
        updatedAt: now,
      };

      // Update in DynamoDB
      await dynamodb.update({ PK: `IDEA#${id}`, SK: 'METADATA' }, updatedIdea);

      logger.info('Updated idea', { ideaId: id, userId });
      return updatedIdea;
    } catch (error) {
      logger.error('Failed to update idea', error, { ideaId: id });
      throw error;
    }
  }

  /**
   * Delete idea
   */
  async deleteIdea(id: string, userId: string): Promise<void> {
    try {
      // Get existing idea to check ownership
      const existingIdea = await this.getIdea(id);

      // Check ownership
      if (existingIdea.authorId !== userId) {
        throw new Error('Not authorized to delete this idea');
      }

      // Delete idea metadata
      await dynamodb.delete({
        PK: `IDEA#${id}`,
        SK: 'METADATA',
      });

      // Delete all votes for this idea
      const votes = await dynamodb.query('PK = :pk AND begins_with(SK, :skPrefix)', {
        ':pk': `IDEA#${id}`,
        ':skPrefix': 'VOTE#',
      });

      if (votes.items.length > 0) {
        for (const vote of votes.items) {
          await dynamodb.delete({
            PK: (vote as any).PK,
            SK: (vote as any).SK,
          });
        }
      }

      logger.info('Deleted idea', { ideaId: id, userId });
    } catch (error) {
      logger.error('Failed to delete idea', error, { ideaId: id });
      throw error;
    }
  }

  /**
   * Vote on an idea
   */
  async voteIdea(ideaId: string, userId: string, vote: number): Promise<void> {
    try {
      // Validate vote value
      if (vote !== 1 && vote !== -1) {
        throw new Error('Vote must be 1 (upvote) or -1 (downvote)');
      }

      // Check if user already voted
      const existingVote = await dynamodb.get({
        PK: `IDEA#${ideaId}`,
        SK: `VOTE#${userId}`,
      });

      const now = new Date().toISOString();
      let voteChange = vote;

      if (existingVote) {
        const oldVote = (existingVote as IdeaVote).vote;
        voteChange = vote - oldVote;

        // Update existing vote
        await dynamodb.update(
          { PK: `IDEA#${ideaId}`, SK: `VOTE#${userId}` },
          { vote, votedAt: now }
        );
      } else {
        // Create new vote
        const newVote: IdeaVote = {
          ideaId,
          userId,
          vote,
          votedAt: now,
        };

        await dynamodb.put({
          PK: `IDEA#${ideaId}`,
          SK: `VOTE#${userId}`,
          GSI1PK: `USER#${userId}`,
          GSI1SK: `VOTED#${now}`,
          ...newVote,
        });
      }

      // Update idea vote count
      const idea = await this.getIdea(ideaId);
      const newVoteCount = Math.max(0, idea.votes + voteChange);

      await dynamodb.update(
        { PK: `IDEA#${ideaId}`, SK: 'METADATA' },
        { votes: newVoteCount, updatedAt: now }
      );

      logger.info('Voted on idea', { ideaId, userId, vote, voteChange });
    } catch (error) {
      logger.error('Failed to vote on idea', error, { ideaId, userId });
      throw error;
    }
  }

  /**
   * AI-powered idea enhancement
   */
  private async enhanceIdea(data: CreateIdeaRequest): Promise<AIEnhancementResult> {
    try {
      // Enhance description
      const enhancedDescription = await this.enhanceIdeaDescription(data.description);

      // Generate tags
      const generatedTags = await this.generateIdeaTags(data.title, enhancedDescription);

      // Assess feasibility
      const feasibilityScore = await this.validateIdeaFeasibility(data);

      return {
        enhancedDescription,
        generatedTags,
        feasibilityScore,
      };
    } catch (error) {
      logger.warn('AI enhancement failed, using original data', error);
      return {
        enhancedDescription: data.description,
        generatedTags: data.skills.slice(0, 5), // Use skills as fallback tags
        feasibilityScore: 5, // Default middle score
      };
    }
  }

  /**
   * AI-powered idea description enhancement
   */
  async enhanceIdeaDescription(description: string): Promise<string> {
    try {
      const prompt = `Enhance this hackathon idea description to be more compelling, clear, and actionable while keeping the core concept intact. Make it engaging for potential team members and judges:

Original Description: "${description}"

Requirements:
- Keep the same core idea and technical approach
- Make it more compelling and clear
- Add specific technical details where appropriate
- Ensure it's suitable for a 24-48 hour hackathon
- Keep it concise (2-3 paragraphs max)
- Make it exciting and inspiring

Enhanced Description:`;

      const response = await gemini.generate(prompt, {
        config: {
          temperature: 0.7,
          maxOutputTokens: 300,
        },
      });

      return response.text.trim() || description;
    } catch (error) {
      logger.warn('Failed to enhance idea description', error);
      return description;
    }
  }

  /**
   * AI-powered tag generation
   */
  async generateIdeaTags(title: string, description: string): Promise<string[]> {
    try {
      const prompt = `Generate 5-8 relevant skill/technology tags for this hackathon idea. Focus on specific technologies, frameworks, and skills needed:

Title: ${title}
Description: ${description}

Return only the tags as a comma-separated list (e.g., "React, Node.js, MongoDB, Machine Learning, API Development").

Tags:`;

      const response = await gemini.generate(prompt, {
        config: {
          temperature: 0.3,
          maxOutputTokens: 100,
        },
      });

      const tags = response.text
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
        .slice(0, 8);

      return tags.length > 0 ? tags : ['Web Development', 'API', 'Frontend'];
    } catch (error) {
      logger.warn('Failed to generate idea tags', error);
      return ['Web Development', 'API', 'Frontend'];
    }
  }

  /**
   * AI-powered feasibility assessment
   */
  async validateIdeaFeasibility(idea: CreateIdeaRequest): Promise<number> {
    try {
      const prompt = `Rate the technical feasibility of this hackathon idea on a scale of 1-10, considering:
- Complexity vs. time constraints (24-48 hours)
- Available technologies and tools
- Team size: ${idea.teamSize} people
- Difficulty level: ${idea.difficulty}
- Required skills: ${idea.skills.join(', ')}

Idea:
Title: ${idea.title}
Description: ${idea.description}
Category: ${idea.category}

Consider:
- Can this be built in a hackathon timeframe?
- Are the required technologies accessible?
- Is the scope appropriate for the team size?
- How complex are the technical challenges?

Return only a single number from 1-10 (1 = very difficult/unlikely, 10 = very feasible).

Feasibility Score:`;

      const response = await gemini.generate(prompt, {
        config: {
          temperature: 0.2,
          maxOutputTokens: 10,
        },
      });

      const score = parseInt(response.text.trim());
      return isNaN(score) ? 5 : Math.max(1, Math.min(10, score));
    } catch (error) {
      logger.warn('Failed to assess idea feasibility', error);
      return 5;
    }
  }

  /**
   * Find similar ideas using AI
   */
  async suggestSimilarIdeas(ideaId: string): Promise<SimilarIdea[]> {
    try {
      const idea = await this.getIdea(ideaId);

      // Get all published ideas
      const allIdeas = await this.listIdeas({
        status: 'published',
        limit: 100,
      });

      // Use AI to find similar ideas
      const prompt = `Given this hackathon idea, identify the 3 most similar ideas from the list below based on technology, concept, and approach:

Target Idea:
Title: ${idea.title}
Description: ${idea.description}
Skills: ${idea.skills.join(', ')}
Category: ${idea.category}

Available Ideas:
${allIdeas.ideas
  .filter((i) => i.id !== ideaId)
  .map(
    (i, index) =>
      `${index + 1}. ID: ${i.id}, Title: ${i.title}, Skills: ${i.skills.join(', ')}, Category: ${i.category}`
  )
  .join('\n')}

Return only the top 3 most similar ideas in this exact JSON format:
[
  {"id": "idea_id", "similarity": 0.85},
  {"id": "idea_id", "similarity": 0.72},
  {"id": "idea_id", "similarity": 0.68}
]

Similarity should be a decimal between 0 and 1.`;

      const response = await gemini.generateJSON<SimilarIdea[]>(prompt);

      return Array.isArray(response) ? response.slice(0, 3) : [];
    } catch (error) {
      logger.warn('Failed to suggest similar ideas', error);
      return [];
    }
  }
}
