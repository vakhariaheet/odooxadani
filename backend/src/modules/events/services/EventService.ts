/**
 * Event Service - Business Logic Layer
 *
 * Handles all event management operations including AI enhancements
 */

import { v4 as uuidv4 } from 'uuid';
import { dynamodb } from '../../../shared/clients/dynamodb';
import { gemini } from '../../../shared/clients/gemini';
import { ses } from '../../../shared/clients/ses';
import { createLogger } from '../../../shared/logger';
import {
  Event,
  CreateEventRequest,
  UpdateEventRequest,
  ListEventsQuery,
  EventListResponse,
  EventRegistrationRequest,
  EventSettings,
} from '../types';

const logger = createLogger('EventService');

export class EventService {
  // =============================================================================
  // EVENT CRUD OPERATIONS
  // =============================================================================

  /**
   * List events with filtering and pagination
   */
  async listEvents(query: ListEventsQuery): Promise<EventListResponse> {
    try {
      const {
        limit = 20,
        offset = 0,
        status,
        category,
        location,
        organizerId,
        isPublic,
        search,
        sortBy = 'startDate',
        sortOrder = 'asc',
      } = query;

      let queryExpression = 'SK = :sk';
      const expressionValues: Record<string, any> = {
        ':sk': 'METADATA',
      };

      // Add filters
      if (status) {
        queryExpression += ' AND #status = :status';
        expressionValues[':status'] = status;
      }

      if (isPublic !== undefined) {
        queryExpression += ' AND isPublic = :isPublic';
        expressionValues[':isPublic'] = isPublic;
      }

      if (organizerId) {
        // Use GSI1 to query by organizer
        const result = await dynamodb.query(
          'GSI1PK = :gsi1pk',
          { ':gsi1pk': `ORGANIZER#${organizerId}` },
          { indexName: 'GSI1' }
        );

        const events = result.items?.map(this.mapDynamoToEvent) || [];
        return this.filterAndPaginateEvents(events, query);
      }

      // Scan for general queries (can be optimized with GSI2 for status-based queries)
      const result = await dynamodb.scan({
        filterExpression: queryExpression,
        expressionAttributeValues: expressionValues,
        expressionAttributeNames: status ? { '#status': 'status' } : undefined,
      });

      let events = result.items?.map(this.mapDynamoToEvent) || [];

      // Apply additional filters
      if (category) {
        events = events.filter((event: Event) =>
          event.categories.some((cat: string) => cat.toLowerCase().includes(category.toLowerCase()))
        );
      }

      if (location) {
        events = events.filter((event: Event) =>
          event.location.toLowerCase().includes(location.toLowerCase())
        );
      }

      if (search) {
        const searchLower = search.toLowerCase();
        events = events.filter(
          (event: Event) =>
            event.name.toLowerCase().includes(searchLower) ||
            event.description.toLowerCase().includes(searchLower) ||
            event.tags.some((tag: string) => tag.toLowerCase().includes(searchLower))
        );
      }

      // Sort events
      events.sort((a: Event, b: Event) => {
        let aValue: any, bValue: any;

        switch (sortBy) {
          case 'startDate':
            aValue = new Date(a.startDate).getTime();
            bValue = new Date(b.startDate).getTime();
            break;
          case 'createdAt':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          case 'trendScore':
            aValue = a.trendScore;
            bValue = b.trendScore;
            break;
          case 'currentParticipants':
            aValue = a.currentParticipants;
            bValue = b.currentParticipants;
            break;
          default:
            aValue = new Date(a.startDate).getTime();
            bValue = new Date(b.startDate).getTime();
        }

        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      });

      // Paginate
      const total = events.length;
      const paginatedEvents = events.slice(offset, offset + limit);
      const hasMore = offset + limit < total;

      return {
        events: paginatedEvents,
        total,
        hasMore,
      };
    } catch (error) {
      logger.error('Error listing events:', error);
      throw error;
    }
  }

  /**
   * Get single event by ID
   */
  async getEvent(id: string): Promise<Event> {
    try {
      const result = await dynamodb.get({
        PK: `EVENT#${id}`,
        SK: 'METADATA',
      });

      if (!result || typeof result !== 'object' || !('id' in result)) {
        throw new Error('Event not found');
      }

      return this.mapDynamoToEvent(result);
    } catch (error) {
      logger.error('Error getting event:', error);
      throw error;
    }
  }

  /**
   * Create new event without automatic AI enhancements
   */
  async createEvent(
    data: CreateEventRequest,
    organizerId: string,
    organizerName: string
  ): Promise<Event> {
    try {
      const eventId = uuidv4();
      const now = new Date().toISOString();

      const event: Event = {
        id: eventId,
        name: data.name,
        description: data.description,
        organizerId,
        organizerName,
        startDate: data.startDate,
        endDate: data.endDate,
        registrationDeadline: data.registrationDeadline,
        location: data.location,
        maxParticipants: data.maxParticipants,
        currentParticipants: 0,
        categories: data.categories,
        prizes: data.prizes,
        rules: data.rules,
        status: data.isPublic ? 'published' : 'draft',
        isPublic: data.isPublic,
        requiresApproval: data.requiresApproval,
        tags: [], // Empty tags initially
        trendScore: 5, // Default score
        createdAt: now,
        updatedAt: now,
      };

      // Save to DynamoDB
      const dynamoItem = {
        PK: `EVENT#${eventId}`,
        SK: 'METADATA',
        GSI1PK: `ORGANIZER#${organizerId}`,
        GSI1SK: `START_DATE#${data.startDate}`,
        GSI2PK: `STATUS#${event.status}`,
        GSI2SK: `TREND_SCORE#${String(event.trendScore).padStart(2, '0')}`,
        ...event,
      };

      await dynamodb.put(dynamoItem);

      // Create default settings if provided
      if (data.settings) {
        await this.createEventSettings(eventId, data.settings);
      }

      logger.info(`Event created: ${eventId}`);
      return event;
    } catch (error) {
      logger.error('Error creating event:', error);
      throw error;
    }
  }

  /**
   * Update existing event without automatic AI enhancement
   */
  async updateEvent(id: string, data: UpdateEventRequest, organizerId: string): Promise<Event> {
    try {
      // Get existing event
      const existingEvent = await this.getEvent(id);

      // Verify ownership
      if (existingEvent.organizerId !== organizerId) {
        throw new Error('Unauthorized: You can only update your own events');
      }

      const now = new Date().toISOString();
      const updatedEvent: Event = {
        ...existingEvent,
        ...data,
        // Update status based on isPublic if it's being changed
        status:
          data.isPublic !== undefined
            ? data.isPublic
              ? 'published'
              : 'draft'
            : existingEvent.status,
        updatedAt: now,
      };

      // Update in DynamoDB
      const dynamoItem = {
        PK: `EVENT#${id}`,
        SK: 'METADATA',
        GSI1PK: `ORGANIZER#${updatedEvent.organizerId}`,
        GSI1SK: `START_DATE#${updatedEvent.startDate}`,
        GSI2PK: `STATUS#${updatedEvent.status}`,
        GSI2SK: `TREND_SCORE#${String(updatedEvent.trendScore).padStart(2, '0')}`,
        ...updatedEvent,
      };

      await dynamodb.put(dynamoItem);

      logger.info(`Event updated: ${id}`);
      return updatedEvent;
    } catch (error) {
      logger.error('Error updating event:', error);
      throw error;
    }
  }

  /**
   * Delete event (soft delete by changing status)
   */
  async deleteEvent(id: string, organizerId: string): Promise<void> {
    try {
      const event = await this.getEvent(id);

      // Verify ownership
      if (event.organizerId !== organizerId) {
        throw new Error('Unauthorized: You can only delete your own events');
      }

      // Soft delete by updating status
      await this.updateEvent(id, { status: 'cancelled' }, organizerId);

      logger.info(`Event deleted: ${id}`);
    } catch (error) {
      logger.error('Error deleting event:', error);
      throw error;
    }
  }

  // =============================================================================
  // EVENT REGISTRATION
  // =============================================================================

  /**
   * Register user for event
   */
  async registerForEvent(
    eventId: string,
    userId: string,
    userName: string,
    userEmail: string,
    registrationData: EventRegistrationRequest
  ): Promise<void> {
    try {
      const event = await this.getEvent(eventId);

      // Validation checks
      if (event.status !== 'published') {
        throw new Error('Event is not open for registration');
      }

      if (new Date() > new Date(event.registrationDeadline)) {
        throw new Error('Registration deadline has passed');
      }

      if (event.currentParticipants >= event.maxParticipants) {
        throw new Error('Event is full');
      }

      // Check if already registered
      const existingRegistration = await dynamodb.get({
        PK: `EVENT#${eventId}`,
        SK: `PARTICIPANT#${userId}`,
      });

      if (
        existingRegistration &&
        typeof existingRegistration === 'object' &&
        'userId' in existingRegistration
      ) {
        throw new Error('Already registered for this event');
      }

      const now = new Date().toISOString();
      const registrationStatus = event.requiresApproval ? 'registered' : 'approved';

      // Create participant record
      const participantItem = {
        PK: `EVENT#${eventId}`,
        SK: `PARTICIPANT#${userId}`,
        GSI1PK: `USER#${userId}`,
        GSI1SK: `REGISTERED#${now}`,
        eventId,
        userId,
        userName,
        userEmail,
        skills: registrationData.skills,
        registrationStatus,
        registeredAt: now,
        approvedAt: registrationStatus === 'approved' ? now : undefined,
      };

      await dynamodb.put(participantItem);

      // Update participant count if approved
      if (registrationStatus === 'approved') {
        await this.updateParticipantCount(eventId, 1);
      }

      // Send confirmation email
      await ses.sendTemplated({
        from: process.env['SES_DEFAULT_FROM'] || 'noreply@hackmatch.com',
        to: userEmail,
        templateName: 'event-registration-confirmation',
        templateData: {
          eventName: event.name,
          eventDate: new Date(event.startDate).toLocaleDateString(),
          userName,
          registrationStatus,
          requiresApproval: event.requiresApproval,
        },
      });

      logger.info(`User registered for event: ${userId} -> ${eventId}`);
    } catch (error) {
      logger.error('Error registering for event:', error);
      throw error;
    }
  }

  // =============================================================================
  // AI ENHANCEMENT METHODS
  // =============================================================================

  /**
   * Generate AI-enhanced event title
   */
  async generateEventTitle(
    name: string,
    description: string,
    categories: string[]
  ): Promise<string> {
    try {
      const prompt = `Rewrite this hackathon event title to be more engaging and professional.

CURRENT TITLE: ${name}
DESCRIPTION: ${description}
CATEGORIES: ${categories.join(', ')}

Requirements for the new title:
- Must be 4-10 words long
- Should be catchy and memorable
- Must clearly indicate it's a hackathon or tech event
- Should reflect the main theme from description
- Appeal to developers, designers, and entrepreneurs
- Avoid generic words like "Event", "Competition", "Contest"
- Include year (2024/2025) if relevant
- Examples of good titles: "AI Innovation Hackathon 2024", "Blockchain Builders Challenge", "Green Tech Solutions Hack"

Write only the new title, nothing else:`;

      const response = await gemini.generate(prompt, {
        model: 'gemini-2.5-flash',
        config: {
          maxOutputTokens: 100,
          temperature: 0.7,
          topP: 0.9,
        },
        safety: {
          harassment: 'BLOCK_MEDIUM_AND_ABOVE',
          hateSpeech: 'BLOCK_MEDIUM_AND_ABOVE',
          sexuallyExplicit: 'BLOCK_MEDIUM_AND_ABOVE',
          dangerousContent: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      });

      let title = response.text?.trim() || '';

      // Clean up common AI artifacts
      title = title
        .replace(/^["']|["']$/g, '') // Remove quotes
        .replace(/^Title:\s*/i, '')
        .replace(/^New Title:\s*/i, '')
        .replace(/^\*\*.*?\*\*\s*/i, '')
        .replace(/^Here.*?:\s*/i, '')
        .trim();

      // Validate the response - must be multiple words
      const wordCount = title.split(/\s+/).length;
      if (!title || wordCount < 3 || wordCount > 12 || title.length < 10 || title.length > 100) {
        logger.warn(
          `AI generated title invalid (${wordCount} words, ${title.length} chars): "${title}", using original`
        );
        return name;
      }

      return title;
    } catch (error) {
      logger.error('Error generating event title:', error);
      return name; // Fallback to original
    }
  }

  /**
   * MANDATORY: AI-powered event description enhancement
   */
  async generateEventDescription(eventData: CreateEventRequest): Promise<string> {
    try {
      const prompt = `You are an expert hackathon event organizer. Write an enhanced, engaging description for this event.

EVENT DETAILS:
Name: ${eventData.name}
Original Description: ${eventData.description}
Categories: ${eventData.categories.join(', ')}
Location: ${eventData.location}
Duration: ${new Date(eventData.startDate).toLocaleDateString()} to ${new Date(eventData.endDate).toLocaleDateString()}

Write a compelling 200-400 word description that:
- Keeps the core message of the original description
- Appeals to developers, designers, and entrepreneurs
- Highlights specific benefits and learning opportunities
- Mentions networking and collaboration aspects
- Uses an exciting but professional tone
- Ends with a strong call-to-action

Write the enhanced description directly without any labels or formatting:`;

      const response = await gemini.generate(prompt, {
        model: 'gemini-2.5-flash',
        config: {
          maxOutputTokens: 600,
          temperature: 0.8,
          topP: 0.9,
        },
        safety: {
          harassment: 'BLOCK_MEDIUM_AND_ABOVE',
          hateSpeech: 'BLOCK_MEDIUM_AND_ABOVE',
          sexuallyExplicit: 'BLOCK_MEDIUM_AND_ABOVE',
          dangerousContent: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      });

      let enhanced = response.text?.trim() || '';

      // Clean up common AI artifacts
      enhanced = enhanced
        .replace(/^\*\*ENHANCED DESCRIPTION:\*\*\s*/i, '')
        .replace(/^ENHANCED DESCRIPTION:\s*/i, '')
        .replace(/^\*\*.*?\*\*\s*/i, '')
        .replace(/^Here's.*?:\s*/i, '')
        .replace(/^The enhanced.*?:\s*/i, '')
        .trim();

      // Validate the response
      if (!enhanced || enhanced.length < 100) {
        logger.warn('AI generated description too short, using original');
        return eventData.description;
      }

      if (enhanced.length > 2000) {
        logger.warn('AI generated description too long, truncating');
        return enhanced.substring(0, 1997) + '...';
      }

      return enhanced;
    } catch (error) {
      logger.error('Error generating event description:', error);
      return eventData.description; // Fallback to original
    }
  }

  /**
   * MANDATORY: AI-powered category suggestions
   */
  async suggestEventCategories(name: string, description: string): Promise<string[]> {
    try {
      const validCategories = [
        'Web Development',
        'Mobile Apps',
        'AI/ML',
        'Blockchain',
        'IoT',
        'Gaming',
        'FinTech',
        'HealthTech',
        'EdTech',
        'Social Impact',
        'Open Source',
        'DevTools',
        'AR/VR',
        'Cybersecurity',
        'Data Science',
        'Cloud Computing',
        'API Development',
        'UI/UX Design',
      ];

      const prompt = `Analyze this hackathon event and suggest 3-5 most relevant categories.

EVENT NAME: ${name}
DESCRIPTION: ${description}

AVAILABLE CATEGORIES:
${validCategories.map((cat) => `- ${cat}`).join('\n')}

INSTRUCTIONS:
- Choose 3-5 categories that best match the event theme
- Consider the technologies, target audience, and goals mentioned
- Prioritize categories that participants would search for
- Return ONLY the category names, one per line
- Use exact names from the list above
- Do not add explanations or additional text

SUGGESTED CATEGORIES:`;

      const response = await gemini.generate(prompt, {
        model: 'gemini-2.5-flash',
        config: {
          maxOutputTokens: 100,
          temperature: 0.3,
          topP: 0.8,
          stopSequences: ['AVAILABLE CATEGORIES:', 'INSTRUCTIONS:'],
        },
        safety: {
          harassment: 'BLOCK_MEDIUM_AND_ABOVE',
          hateSpeech: 'BLOCK_MEDIUM_AND_ABOVE',
          sexuallyExplicit: 'BLOCK_MEDIUM_AND_ABOVE',
          dangerousContent: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      });

      const categories = response.text
        ?.split('\n')
        .map((cat) => cat.replace(/^[-*•]\s*/, '').trim()) // Remove bullet points
        .filter((cat) => cat.length > 0 && validCategories.includes(cat)) // Only valid categories
        .slice(0, 5); // Limit to 5

      return categories || [];
    } catch (error) {
      logger.error('Error suggesting categories:', error);
      return []; // Return empty array on error
    }
  }

  /**
   * MANDATORY: AI-powered trend analysis
   */
  async analyzeEventTrends(eventData: CreateEventRequest): Promise<number> {
    try {
      const prompt = `Rate the trend relevance of this hackathon event on a scale of 1-10.

EVENT DETAILS:
Name: ${eventData.name}
Description: ${eventData.description}
Categories: ${eventData.categories.join(', ')}
Location: ${eventData.location}

SCORING CRITERIA:
10 = Cutting-edge technology, high market demand, viral potential
8-9 = Very trendy, strong developer interest, emerging tech
6-7 = Moderately trendy, established tech with growth
4-5 = Standard hackathon theme, stable interest
2-3 = Less popular, niche interest
1 = Outdated or very niche technology

FACTORS TO CONSIDER:
- Current tech trends (AI, blockchain, sustainability, etc.)
- Market demand and job opportunities
- Developer community interest
- Innovation potential
- Industry growth

Return ONLY a single number from 1-10 with no explanation:`;

      const response = await gemini.generate(prompt, {
        model: 'gemini-2.5-flash',
        config: {
          maxOutputTokens: 5,
          temperature: 0.2,
          topP: 0.8,
          stopSequences: ['SCORING CRITERIA:', 'FACTORS TO CONSIDER:'],
        },
        safety: {
          harassment: 'BLOCK_MEDIUM_AND_ABOVE',
          hateSpeech: 'BLOCK_MEDIUM_AND_ABOVE',
          sexuallyExplicit: 'BLOCK_MEDIUM_AND_ABOVE',
          dangerousContent: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      });

      const scoreText = response.text?.trim().replace(/[^0-9]/g, '');
      const score = parseInt(scoreText || '5');

      // Validate score is between 1-10
      if (isNaN(score) || score < 1 || score > 10) {
        logger.warn(`Invalid trend score: ${scoreText}, using default 5`);
        return 5;
      }

      return score;
    } catch (error) {
      logger.error('Error analyzing trends:', error);
      return 5; // Default score
    }
  }

  /**
   * Generate AI tags for event
   */
  async generateEventTags(
    name: string,
    description: string,
    categories: string[]
  ): Promise<string[]> {
    try {
      const prompt = `Generate 5-8 relevant search tags for this hackathon event.

EVENT DETAILS:
Name: ${name}
Description: ${description}
Categories: ${categories.join(', ')}

TAG REQUIREMENTS:
- Use lowercase, hyphenated format (e.g., "machine-learning", "web-dev")
- Include technology keywords (programming languages, frameworks, tools)
- Include skill level indicators (beginner-friendly, advanced, intermediate)
- Include event type tags (hackathon, competition, workshop)
- Include domain-specific tags (fintech, healthtech, social-impact)
- Avoid generic words like "event", "coding", "programming"
- Each tag should be 1-3 words maximum
- Tags should help participants find this event

EXAMPLES OF GOOD TAGS:
- react, nodejs, python, javascript
- machine-learning, artificial-intelligence, blockchain
- beginner-friendly, intermediate-level, expert-track
- mobile-development, web-development, full-stack
- fintech, healthtech, edtech, social-impact
- open-source, api-development, cloud-computing

Return ONLY the tags, one per line, no bullets or numbers:`;

      const response = await gemini.generate(prompt, {
        model: 'gemini-2.5-flash',
        config: {
          maxOutputTokens: 200,
          temperature: 0.6,
          topP: 0.9,
          stopSequences: ['TAG REQUIREMENTS:', 'EXAMPLES OF GOOD TAGS:'],
        },
        safety: {
          harassment: 'BLOCK_MEDIUM_AND_ABOVE',
          hateSpeech: 'BLOCK_MEDIUM_AND_ABOVE',
          sexuallyExplicit: 'BLOCK_MEDIUM_AND_ABOVE',
          dangerousContent: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      });

      const tags = response.text
        ?.split('\n')
        .map((tag) =>
          tag
            .replace(/^[-*•]\s*/, '')
            .trim()
            .toLowerCase()
        ) // Remove bullets, lowercase
        .filter((tag) => tag.length > 0 && tag.length < 30) // Valid length
        .filter((tag) => /^[a-z0-9-]+$/.test(tag)) // Only lowercase letters, numbers, hyphens
        .filter(
          (tag) => !['event', 'coding', 'programming', 'hackathon', 'competition'].includes(tag)
        ) // Remove generic tags
        .slice(0, 8); // Limit to 8 tags

      return tags || [];
    } catch (error) {
      logger.error('Error generating tags:', error);
      return [];
    }
  }

  /**
   * Generate AI rules and guidelines for event
   */
  async generateEventRules(
    name: string,
    description: string,
    categories: string[],
    duration: string
  ): Promise<string> {
    try {
      const prompt = `Generate comprehensive rules and guidelines for this hackathon event.

EVENT DETAILS:
Name: ${name}
Description: ${description}
Categories: ${categories.join(', ')}
Duration: ${duration}

Create detailed rules covering:
1. Team Formation (team size limits, registration process)
2. Submission Requirements (what to submit, formats, deadlines)
3. Judging Criteria (innovation, technical implementation, presentation, etc.)
4. Code of Conduct (behavior expectations, inclusivity)
5. Technical Guidelines (allowed technologies, external resources)
6. Timeline and Deadlines (key milestones, submission cutoffs)
7. Prizes and Recognition (eligibility, distribution)
8. Intellectual Property (ownership, open source requirements)

Format as clear, numbered sections with specific, actionable rules. Make it professional but accessible. Include specific examples where helpful.

Write the rules directly without any labels or formatting:`;

      const response = await gemini.generate(prompt, {
        model: 'gemini-2.5-flash',
        config: {
          maxOutputTokens: 1000,
          temperature: 0.6,
          topP: 0.9,
        },
        safety: {
          harassment: 'BLOCK_MEDIUM_AND_ABOVE',
          hateSpeech: 'BLOCK_MEDIUM_AND_ABOVE',
          sexuallyExplicit: 'BLOCK_MEDIUM_AND_ABOVE',
          dangerousContent: 'BLOCK_MEDIUM_AND_ABOVE',
        },
      });

      let rules = response.text?.trim() || '';

      // Clean up common AI artifacts
      rules = rules
        .replace(/^\*\*HACKATHON RULES AND GUIDELINES:\*\*\s*/i, '')
        .replace(/^HACKATHON RULES AND GUIDELINES:\s*/i, '')
        .replace(/^\*\*.*?\*\*\s*/i, '')
        .replace(/^Here are.*?:\s*/i, '')
        .trim();

      // Validate the response
      if (!rules || rules.length < 200) {
        logger.warn('AI generated rules too short, using default');
        return this.getDefaultRules();
      }

      if (rules.length > 5000) {
        logger.warn('AI generated rules too long, truncating');
        return rules.substring(0, 4997) + '...';
      }

      return rules;
    } catch (error) {
      logger.error('Error generating event rules:', error);
      return this.getDefaultRules(); // Fallback to default rules
    }
  }

  /**
   * Get default rules template
   */
  private getDefaultRules(): string {
    return `## Team Formation
- Teams can have 1-4 members
- Team registration closes 24 hours before the event starts
- Solo participants are welcome

## Submission Requirements
- Submit your project via the provided platform before the deadline
- Include source code, documentation, and a demo video (max 3 minutes)
- All submissions must be original work created during the hackathon

## Judging Criteria
- Innovation and Creativity (25%)
- Technical Implementation (25%)
- User Experience and Design (25%)
- Presentation and Demo (25%)

## Code of Conduct
- Treat all participants with respect and inclusivity
- No harassment, discrimination, or inappropriate behavior
- Follow venue rules and organizer instructions

## Technical Guidelines
- Use any programming language, framework, or technology
- Open source libraries and APIs are allowed
- Pre-existing code templates are permitted but must be disclosed

## Timeline
- Registration opens 2 weeks before the event
- Check-in and team formation on event day
- Coding period as specified in event schedule
- Final submissions due 30 minutes before judging

## Prizes and Recognition
- Winners will be announced at the closing ceremony
- Prizes are non-transferable and subject to eligibility verification
- All participants receive certificates of participation`;
  }

  // =============================================================================
  // HELPER METHODS
  // =============================================================================

  /**
   * Map DynamoDB item to Event object
   */
  private mapDynamoToEvent(item: any): Event {
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      organizerId: item.organizerId,
      organizerName: item.organizerName,
      startDate: item.startDate,
      endDate: item.endDate,
      registrationDeadline: item.registrationDeadline,
      location: item.location,
      maxParticipants: item.maxParticipants,
      currentParticipants: item.currentParticipants,
      categories: item.categories || [],
      prizes: item.prizes || [],
      rules: item.rules,
      status: item.status,
      isPublic: item.isPublic,
      requiresApproval: item.requiresApproval,
      tags: item.tags || [],
      trendScore: item.trendScore || 5,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  /**
   * Update participant count
   */
  private async updateParticipantCount(eventId: string, delta: number): Promise<void> {
    try {
      await dynamodb.update(
        { PK: `EVENT#${eventId}`, SK: 'METADATA' },
        {
          currentParticipants: { $add: delta },
          updatedAt: new Date().toISOString(),
        }
      );
    } catch (error) {
      logger.error('Error updating participant count:', error);
      throw error;
    }
  }

  /**
   * Create event settings
   */
  private async createEventSettings(
    eventId: string,
    settings: Partial<EventSettings>
  ): Promise<void> {
    try {
      const defaultSettings: EventSettings = {
        eventId,
        allowTeamFormation: true,
        allowIdeaSubmission: true,
        allowJudgeScoring: true,
        maxTeamSize: 4,
        customFields: [],
        ...settings,
      };

      const settingsItem = {
        PK: `EVENT#${eventId}`,
        SK: 'SETTINGS',
        GSI1PK: `EVENT#${eventId}`,
        GSI1SK: 'SETTINGS',
        ...defaultSettings,
      };

      await dynamodb.put(settingsItem);
    } catch (error) {
      logger.error('Error creating event settings:', error);
      throw error;
    }
  }

  /**
   * Filter and paginate events (helper for complex queries)
   */
  private filterAndPaginateEvents(events: Event[], query: ListEventsQuery): EventListResponse {
    const { limit = 20, offset = 0 } = query;
    const total = events.length;
    const paginatedEvents = events.slice(offset, offset + limit);
    const hasMore = offset + limit < total;

    return {
      events: paginatedEvents,
      total,
      hasMore,
    };
  }
}

// Export singleton instance
export const eventService = new EventService();
