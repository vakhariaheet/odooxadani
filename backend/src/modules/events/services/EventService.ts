import { v4 as uuidv4 } from 'uuid';
import { dynamodb } from '../../../shared/clients/dynamodb';
import {
  Event,
  CreateEventRequest,
  UpdateEventRequest,
  EventListQuery,
  EventListResponse,
  EventDynamoDBItem,
  EventOrganizerDynamoDBItem,
  DEFAULT_CURRENCY,
  MAX_EVENTS_PER_PAGE,
  DEFAULT_EVENTS_PER_PAGE,
  EventSearchQuery,
} from '../types';

export class EventService {
  /**
   * Create a new event
   */
  async createEvent(data: CreateEventRequest, organizerId: string): Promise<Event> {
    const eventId = uuidv4();
    const now = new Date().toISOString();

    // Validate dates
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (startDate >= endDate) {
      throw new Error('End date must be after start date');
    }

    if (startDate < new Date()) {
      throw new Error('Start date cannot be in the past');
    }

    const event: Event = {
      eventId,
      title: data.title.trim(),
      description: data.description.trim(),
      category: data.category,
      startDate: data.startDate,
      endDate: data.endDate,
      location: {
        address: data.location.address.trim(),
        city: data.location.city.trim(),
        coordinates: data.location.coordinates,
      },
      maxAttendees: data.maxAttendees,
      currentAttendees: 0,
      price: data.price,
      currency: data.currency || DEFAULT_CURRENCY,
      status: 'draft',
      organizerId,
      createdAt: now,
      updatedAt: now,
    };

    // Create main event record
    const eventItem: EventDynamoDBItem = {
      ...event,
      PK: `EVENT#${eventId}`,
      SK: 'METADATA',
      GSI1PK: `CATEGORY#${data.category}`,
      GSI1SK: data.startDate,
      GSI2PK: `USER#${organizerId}`,
      GSI2SK: `EVENT#${eventId}`,
    };

    // Create organizer relationship record
    const organizerItem: EventOrganizerDynamoDBItem = {
      PK: `EVENT#${eventId}`,
      SK: `ORGANIZER#${organizerId}`,
      GSI1PK: `USER#${organizerId}`,
      GSI1SK: `EVENT#${eventId}`,
      eventId,
      organizerId,
      createdAt: now,
    };

    // Use transaction to ensure both records are created
    await dynamodb.transactWrite([
      {
        type: 'Put',
        params: {
          Item: eventItem,
          ConditionExpression: 'attribute_not_exists(PK)',
        },
      },
      {
        type: 'Put',
        params: {
          Item: organizerItem,
        },
      },
    ]);

    return event;
  }

  /**
   * Get event by ID
   */
  async getEvent(eventId: string, userId?: string): Promise<Event | null> {
    const result = await dynamodb.get<EventDynamoDBItem>({
      PK: `EVENT#${eventId}`,
      SK: 'METADATA',
    });

    if (!result) {
      return null;
    }

    // Check if event is accessible (published or user owns it)
    if (result.status !== 'published' && result.organizerId !== userId) {
      return null;
    }

    return this.mapDynamoItemToEvent(result);
  }

  /**
   * Update event (only by owner)
   */
  async updateEvent(eventId: string, updates: UpdateEventRequest, userId: string): Promise<Event> {
    // First check if event exists and user owns it
    const existing = await dynamodb.get<EventDynamoDBItem>({
      PK: `EVENT#${eventId}`,
      SK: 'METADATA',
    });

    if (!existing) {
      throw new Error('Event not found');
    }

    if (existing.organizerId !== userId) {
      throw new Error('Not authorized to update this event');
    }

    // Validate date updates if provided
    if (updates.startDate || updates.endDate) {
      const startDate = new Date(updates.startDate || existing.startDate);
      const endDate = new Date(updates.endDate || existing.endDate);

      if (startDate >= endDate) {
        throw new Error('End date must be after start date');
      }
    }

    // Prepare update data
    const updateData: Partial<EventDynamoDBItem> = {};

    if (updates.title !== undefined) updateData.title = updates.title.trim();
    if (updates.description !== undefined) updateData.description = updates.description.trim();
    if (updates.category !== undefined) {
      updateData.category = updates.category;
      updateData.GSI1PK = `CATEGORY#${updates.category}`;
    }
    if (updates.startDate !== undefined) {
      updateData.startDate = updates.startDate;
      updateData.GSI1SK = updates.startDate;
    }
    if (updates.endDate !== undefined) updateData.endDate = updates.endDate;
    if (updates.location !== undefined) {
      updateData.location = {
        address: updates.location.address.trim(),
        city: updates.location.city.trim(),
        coordinates: updates.location.coordinates,
      };
    }
    if (updates.maxAttendees !== undefined) updateData.maxAttendees = updates.maxAttendees;
    if (updates.price !== undefined) updateData.price = updates.price;
    if (updates.currency !== undefined) updateData.currency = updates.currency;
    if (updates.status !== undefined) updateData.status = updates.status;

    const updatedItem = await dynamodb.update<EventDynamoDBItem>(
      { PK: `EVENT#${eventId}`, SK: 'METADATA' },
      updateData
    );

    return this.mapDynamoItemToEvent(updatedItem);
  }

  /**
   * Delete event (only by owner)
   */
  async deleteEvent(eventId: string, userId: string): Promise<void> {
    // First check if event exists and user owns it
    const existing = await dynamodb.get<EventDynamoDBItem>({
      PK: `EVENT#${eventId}`,
      SK: 'METADATA',
    });

    if (!existing) {
      throw new Error('Event not found');
    }

    if (existing.organizerId !== userId) {
      throw new Error('Not authorized to delete this event');
    }

    // Delete both event and organizer records
    await dynamodb.transactWrite([
      {
        type: 'Delete',
        params: {
          Key: { PK: `EVENT#${eventId}`, SK: 'METADATA' },
        },
      },
      {
        type: 'Delete',
        params: {
          Key: { PK: `EVENT#${eventId}`, SK: `ORGANIZER#${userId}` },
        },
      },
    ]);
  }

  /**
   * List events with filtering and pagination
   */
  async listEvents(query: EventListQuery, userId?: string): Promise<EventListResponse> {
    const limit = Math.min(query.limit || DEFAULT_EVENTS_PER_PAGE, MAX_EVENTS_PER_PAGE);
    const offset = query.offset || 0;

    let events: Event[] = [];

    // If filtering by organizer (user's own events)
    if (query.organizerId && userId && query.organizerId === userId) {
      events = await this.getUserEvents(userId, query);
    }
    // If filtering by category
    else if (query.category) {
      events = await this.getEventsByCategory(query.category, query);
    }
    // Default: get all published events
    else {
      events = await this.getAllPublishedEvents(query);
    }

    // Apply additional filters
    events = this.applyFilters(events, query, userId);

    // Apply pagination
    const totalCount = events.length;
    const paginatedEvents = events.slice(offset, offset + limit);
    const hasMore = offset + limit < totalCount;

    return {
      events: paginatedEvents,
      totalCount,
      hasMore,
    };
  }

  /**
   * Get events by user (organizer)
   */
  private async getUserEvents(userId: string, _query: EventListQuery): Promise<Event[]> {
    const result = await dynamodb.query<EventOrganizerDynamoDBItem>(
      'GSI1PK = :userId',
      { ':userId': `USER#${userId}` },
      { indexName: 'GSI1' }
    );

    // Get full event details for each event
    const eventIds = result.items.map((item) => item.eventId);
    const events: Event[] = [];

    for (const eventId of eventIds) {
      const eventItem = await dynamodb.get<EventDynamoDBItem>({
        PK: `EVENT#${eventId}`,
        SK: 'METADATA',
      });

      if (eventItem) {
        events.push(this.mapDynamoItemToEvent(eventItem));
      }
    }

    return events;
  }

  /**
   * Get events by category
   */
  private async getEventsByCategory(category: string, _query: EventListQuery): Promise<Event[]> {
    let keyCondition = 'GSI1PK = :category';
    const values: Record<string, any> = { ':category': `CATEGORY#${category}` };

    // Add date range filtering if provided
    if (_query.startDate) {
      keyCondition += ' AND GSI1SK >= :startDate';
      values[':startDate'] = _query.startDate;
    }

    const result = await dynamodb.query<EventDynamoDBItem>(keyCondition, values, {
      indexName: 'GSI1',
      scanIndexForward: true,
    });

    return result.items
      .filter((item) => item.status === 'published')
      .map((item) => this.mapDynamoItemToEvent(item));
  }

  /**
   * Get all published events
   */
  private async getAllPublishedEvents(_query: EventListQuery): Promise<Event[]> {
    // Use scan for now - in production, consider using a GSI for published events
    const result = await dynamodb.scan<EventDynamoDBItem>({
      filterExpression: 'SK = :sk AND #status = :status',
      expressionAttributeNames: { '#status': 'status' },
      expressionAttributeValues: {
        ':sk': 'METADATA',
        ':status': 'published',
      },
    });

    return result.items.map((item) => this.mapDynamoItemToEvent(item));
  }

  /**
   * Apply additional filters to events
   */
  private applyFilters(events: Event[], query: EventListQuery, userId?: string): Event[] {
    let filtered = events;

    // Filter by city
    if (query.city) {
      const cityLower = query.city.toLowerCase();
      filtered = filtered.filter((event) => event.location.city.toLowerCase().includes(cityLower));
    }

    // Filter by date range
    if (query.startDate) {
      filtered = filtered.filter(
        (event) => new Date(event.startDate) >= new Date(query.startDate!)
      );
    }

    if (query.endDate) {
      filtered = filtered.filter((event) => new Date(event.endDate) <= new Date(query.endDate!));
    }

    // Filter by status (only if user is viewing their own events)
    if (query.status && query.organizerId === userId) {
      filtered = filtered.filter((event) => event.status === query.status);
    }

    // Sort by start date (ascending)
    filtered.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    return filtered;
  }

  /**
   * Map DynamoDB item to Event
   */
  private mapDynamoItemToEvent(item: EventDynamoDBItem): Event {
    return {
      eventId: item.eventId,
      title: item.title,
      description: item.description,
      category: item.category,
      startDate: item.startDate,
      endDate: item.endDate,
      location: item.location,
      maxAttendees: item.maxAttendees,
      currentAttendees: item.currentAttendees,
      price: item.price,
      currency: item.currency,
      status: item.status,
      organizerId: item.organizerId,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  // =============================================================================
  // M05: ENHANCED DISCOVERY METHODS
  // =============================================================================

  /**
   * Advanced search with multiple filters
   */
  async searchEvents(query: EventSearchQuery): Promise<EventListResponse> {
    const limit = Math.min(query.limit || DEFAULT_EVENTS_PER_PAGE, MAX_EVENTS_PER_PAGE);
    const offset = query.offset || 0;

    // Get all published events first
    let events = await this.getAllPublishedEvents({});

    // Apply search query (full-text search simulation)
    if (query.query) {
      const searchTerm = query.query.toLowerCase();
      events = events.filter((event) => {
        const searchableText =
          `${event.title} ${event.description} ${event.location.city} ${event.location.address}`.toLowerCase();
        return searchableText.includes(searchTerm);
      });
    }

    // Apply category filter
    if (query.category) {
      events = events.filter((event) => event.category === query.category);
    }

    // Apply city filter
    if (query.city) {
      const cityLower = query.city.toLowerCase();
      events = events.filter((event) => event.location.city.toLowerCase().includes(cityLower));
    }

    // Apply price range filter
    if (query.priceRange) {
      events = events.filter((event) => {
        if (query.priceRange!.min !== undefined && event.price < query.priceRange!.min)
          return false;
        if (query.priceRange!.max !== undefined && event.price > query.priceRange!.max)
          return false;
        return true;
      });
    }

    // Apply date range filter
    if (query.dateRange) {
      events = events.filter((event) => {
        const eventStart = new Date(event.startDate);
        if (query.dateRange!.startDate && eventStart < new Date(query.dateRange!.startDate))
          return false;
        if (query.dateRange!.endDate && eventStart > new Date(query.dateRange!.endDate))
          return false;
        return true;
      });
    }

    // Apply location-based filtering (simple distance calculation)
    if (query.location) {
      const { lat, lng, radius = 50 } = query.location;
      events = events.filter((event) => {
        if (!event.location.coordinates) return false;
        const distance = this.calculateDistance(
          lat,
          lng,
          event.location.coordinates[0],
          event.location.coordinates[1]
        );
        return distance <= radius;
      });
    }

    // Apply sorting
    events = this.sortEvents(events, query.sortBy || 'date', query.sortOrder || 'asc');

    // Apply pagination
    const totalCount = events.length;
    const paginatedEvents = events.slice(offset, offset + limit);
    const hasMore = offset + limit < totalCount;

    return {
      events: paginatedEvents,
      totalCount,
      hasMore,
    };
  }

  /**
   * Get events by category with enhanced sorting
   */
  async getEventsByCategoryEnhanced(category: string, limit: number = 20): Promise<Event[]> {
    const events = await this.getEventsByCategory(category, {});

    // Sort by popularity (using currentAttendees as proxy for now)
    events.sort((a, b) => b.currentAttendees - a.currentAttendees);

    return events.slice(0, limit);
  }

  /**
   * Get recommended events for a user
   */
  async getRecommendedEvents(userId: string): Promise<Event[]> {
    // Simple recommendation algorithm:
    // 1. Get user's past events to understand preferences
    // 2. Find events in similar categories
    // 3. Find popular events in user's location (if available)

    const userEvents = await this.getUserEvents(userId, {});
    const allEvents = await this.getAllPublishedEvents({});

    // Get user's preferred categories
    const userCategories = [...new Set(userEvents.map((event) => event.category))];

    // Filter events by user's preferred categories
    let recommendedEvents = allEvents.filter(
      (event) => userCategories.includes(event.category) && event.organizerId !== userId // Don't recommend user's own events
    );

    // If no category preferences, get popular events
    if (recommendedEvents.length === 0) {
      recommendedEvents = allEvents
        .filter((event) => event.organizerId !== userId)
        .sort((a, b) => b.currentAttendees - a.currentAttendees);
    }

    // Sort by popularity and return top 10
    recommendedEvents.sort((a, b) => b.currentAttendees - a.currentAttendees);
    return recommendedEvents.slice(0, 10);
  }

  /**
   * Get popular/trending events
   */
  async getPopularEvents(timeframe: 'week' | 'month' = 'week'): Promise<Event[]> {
    const now = new Date();
    const cutoffDate = new Date();

    if (timeframe === 'week') {
      cutoffDate.setDate(now.getDate() - 7);
    } else {
      cutoffDate.setMonth(now.getMonth() - 1);
    }

    const events = await this.getAllPublishedEvents({});

    // Filter events created within timeframe and sort by popularity
    const popularEvents = events
      .filter((event) => new Date(event.createdAt) >= cutoffDate)
      .sort((a, b) => {
        // Calculate popularity score based on attendees and recency
        const aScore = a.currentAttendees + new Date(a.createdAt).getTime() / 1000000;
        const bScore = b.currentAttendees + new Date(b.createdAt).getTime() / 1000000;
        return bScore - aScore;
      });

    return popularEvents.slice(0, 20);
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Sort events by different criteria
   */
  private sortEvents(events: Event[], sortBy: string, sortOrder: 'asc' | 'desc'): Event[] {
    const sorted = [...events];

    switch (sortBy) {
      case 'date':
        sorted.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
        break;
      case 'price':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'popularity':
        sorted.sort((a, b) => b.currentAttendees - a.currentAttendees);
        break;
      case 'relevance':
      default:
        // For relevance, keep current order (search results are already sorted by relevance)
        break;
    }

    return sortOrder === 'desc' ? sorted.reverse() : sorted;
  }
}
