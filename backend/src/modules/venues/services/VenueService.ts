import { dynamodb } from '../../../shared/clients/dynamodb';
import {
  Venue,
  CreateVenueRequest,
  UpdateVenueRequest,
  VenueListResponse,
  VenueSearchQuery,
  AvailabilitySlot,
  AvailabilityQuery,
  VenueRecord,
  AvailabilityRecord,
  generateVenueId,
  createVenueKeys,
  createAvailabilityKeys,
  createOwnerKeys,
  validateVenueData,
  TimeSlot,
  COMMON_AMENITIES
} from '../types';

export class VenueService {
  /**
   * Create a new venue
   */
  async createVenue(data: CreateVenueRequest, userId: string): Promise<Venue> {
    // Validate input data
    const validationErrors = validateVenueData(data);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    const venueId = generateVenueId();
    const now = new Date().toISOString();

    // Create venue record
    const venueRecord: VenueRecord = {
      ...createVenueKeys(venueId),
      GSI1PK: `LOCATION#${data.location.city.toLowerCase()}`,
      GSI1SK: `${data.capacity.max.toString().padStart(6, '0')}#${venueId}`,
      GSI2PK: `USER#${userId}`,
      GSI2SK: `VENUE#${venueId}`,
      
      venueId,
      name: data.name.trim(),
      description: data.description.trim(),
      category: data.category,
      location: data.location,
      capacity: data.capacity,
      amenities: data.amenities || [],
      pricing: data.pricing,
      images: data.images || [],
      ownerId: userId,
      status: 'active',
      createdAt: now,
      updatedAt: now
    };

    // Create owner relationship record
    const ownerRecord = {
      ...createOwnerKeys(venueId, userId),
      venueId,
      ownerId: userId,
      createdAt: now,
      updatedAt: now
    };

    // Initialize default availability (next 30 days)
    const availabilityRecords: AvailabilityRecord[] = [];
    const startDate = new Date();
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0]!;

      // Default time slots (9 AM to 9 PM, 1-hour slots)
      const timeSlots: TimeSlot[] = [];
      for (let hour = 9; hour < 21; hour++) {
        timeSlots.push({
          startTime: `${hour.toString().padStart(2, '0')}:00`,
          endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
          available: true
        });
      }

      availabilityRecords.push({
        PK: `VENUE#${venueId}`,
        SK: `AVAILABILITY#${dateStr}`,
        GSI1PK: `AVAILABLE#${dateStr}`,
        GSI1SK: `VENUE#${venueId}`,
        venueId,
        date: dateStr,
        timeSlots,
        createdAt: now,
        updatedAt: now
      });
    }

    // Batch write all records
    const writeOperations: Array<{ put: Record<string, unknown> }> = [
      { put: venueRecord as unknown as Record<string, unknown> },
      { put: ownerRecord as unknown as Record<string, unknown> },
      ...availabilityRecords.map(record => ({ put: record as unknown as Record<string, unknown> }))
    ];

    // Split into batches of 25 (DynamoDB limit)
    for (let i = 0; i < writeOperations.length; i += 25) {
      const batch = writeOperations.slice(i, i + 25);
      await dynamodb.batchWrite(batch);
    }

    return this.mapRecordToVenue(venueRecord);
  }

  /**
   * Get venue by ID
   */
  async getVenue(venueId: string): Promise<Venue | null> {
    const key = createVenueKeys(venueId);
    const record = await dynamodb.get<VenueRecord>(key);
    
    if (!record) {
      return null;
    }

    return this.mapRecordToVenue(record);
  }

  /**
   * Update venue (owner only)
   */
  async updateVenue(venueId: string, data: UpdateVenueRequest, userId: string): Promise<Venue> {
    // Validate input data
    const validationErrors = validateVenueData(data);
    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`);
    }

    // Check if venue exists and user owns it
    const venue = await this.getVenue(venueId);
    if (!venue) {
      throw new Error('Venue not found');
    }

    if (venue.ownerId !== userId) {
      throw new Error('You can only update your own venues');
    }

    const key = createVenueKeys(venueId);
    const updates: Partial<VenueRecord> = {};

    // Only update provided fields
    if (data.name !== undefined) updates.name = data.name.trim();
    if (data.description !== undefined) updates.description = data.description.trim();
    if (data.category !== undefined) updates.category = data.category;
    if (data.location !== undefined) updates.location = data.location;
    if (data.capacity !== undefined) updates.capacity = data.capacity;
    if (data.amenities !== undefined) updates.amenities = data.amenities;
    if (data.pricing !== undefined) updates.pricing = data.pricing;
    if (data.images !== undefined) updates.images = data.images;
    if (data.status !== undefined) updates.status = data.status;

    // Update GSI keys if location or capacity changed
    if (data.location || data.capacity) {
      const newLocation = data.location || venue.location;
      const newCapacity = data.capacity || venue.capacity;
      updates.GSI1PK = `LOCATION#${newLocation.city.toLowerCase()}`;
      updates.GSI1SK = `${newCapacity.max.toString().padStart(6, '0')}#${venueId}`;
    }

    const updatedRecord = await dynamodb.update<VenueRecord>(key, updates);
    return this.mapRecordToVenue(updatedRecord);
  }

  /**
   * Delete venue (owner only)
   */
  async deleteVenue(venueId: string, userId: string): Promise<void> {
    // Check if venue exists and user owns it
    const venue = await this.getVenue(venueId);
    if (!venue) {
      throw new Error('Venue not found');
    }

    if (venue.ownerId !== userId) {
      throw new Error('You can only delete your own venues');
    }

    // Get all related records to delete
    const venueRecords = await dynamodb.queryAll<any>(
      'PK = :pk',
      { ':pk': `VENUE#${venueId}` }
    );

    // Delete all records in batches
    const deleteOperations = venueRecords.map(record => ({
      delete: { PK: record.PK, SK: record.SK }
    }));

    for (let i = 0; i < deleteOperations.length; i += 25) {
      const batch = deleteOperations.slice(i, i + 25);
      await dynamodb.batchWrite(batch);
    }
  }

  /**
   * List venues with search and filtering
   */
  async listVenues(query: VenueSearchQuery): Promise<VenueListResponse> {
    const {
      limit = 20,
      offset = 0,
      city,
      category,
      minCapacity,
      maxCapacity,
      amenities,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = query;

    let venues: Venue[] = [];

    // For now, use scan for all queries to avoid GSI issues
    // TODO: Optimize with proper GSI queries once GSI structure is confirmed
    let filterExpression = 'SK = :sk AND #status = :status';
    const expressionAttributeNames: Record<string, string> = { '#status': 'status' };
    const expressionAttributeValues: Record<string, any> = {
      ':sk': 'METADATA',
      ':status': 'active'
    };

    // Add city filter if specified
    if (city) {
      filterExpression += ' AND contains(#location, :city)';
      expressionAttributeNames['#location'] = 'location';
      expressionAttributeValues[':city'] = city.toLowerCase();
    }

    const result = await dynamodb.scan<VenueRecord>({
      filterExpression,
      expressionAttributeNames,
      expressionAttributeValues,
      limit: limit + offset + 100
    });
    
    venues = result.items.map(record => this.mapRecordToVenue(record));

    // Apply filters
    let filteredVenues = venues.filter(venue => {
      if (city && !venue.location.city.toLowerCase().includes(city.toLowerCase())) return false;
      if (category && venue.category !== category) return false;
      if (minCapacity && venue.capacity.max < minCapacity) return false;
      if (maxCapacity && venue.capacity.min > maxCapacity) return false;
      if (minPrice && venue.pricing.basePrice < minPrice) return false;
      if (maxPrice && venue.pricing.basePrice > maxPrice) return false;
      if (amenities && amenities.length > 0) {
        const hasAllAmenities = amenities.every(amenity => 
          venue.amenities.includes(amenity)
        );
        if (!hasAllAmenities) return false;
      }
      return true;
    });

    // Sort venues
    filteredVenues.sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'price':
          aValue = a.pricing.basePrice;
          bValue = b.pricing.basePrice;
          break;
        case 'capacity':
          aValue = a.capacity.max;
          bValue = b.capacity.max;
          break;
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        default:
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    // Apply pagination
    const totalCount = filteredVenues.length;
    const paginatedVenues = filteredVenues.slice(offset, offset + limit);

    // Generate filters for frontend
    const filters = this.generateFilters(venues);

    return {
      venues: paginatedVenues,
      totalCount,
      filters
    };
  }

  /**
   * Get venue availability for date range
   */
  async getAvailability(venueId: string, query: AvailabilityQuery): Promise<AvailabilitySlot[]> {
    const { startDate, endDate } = query;

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      throw new Error('Start date must be before end date');
    }

    const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 90) {
      throw new Error('Date range cannot exceed 90 days');
    }

    // Query availability records
    const availabilitySlots: AvailabilitySlot[] = [];
    const currentDate = new Date(start);

    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split('T')[0]!;
      const key = createAvailabilityKeys(venueId, dateStr);
      
      const record = await dynamodb.get<AvailabilityRecord>(key);
      
      if (record) {
        availabilitySlots.push({
          date: record.date,
          timeSlots: record.timeSlots
        });
      } else {
        // Create default availability if not exists
        const defaultSlots: TimeSlot[] = [];
        for (let hour = 9; hour < 21; hour++) {
          defaultSlots.push({
            startTime: `${hour.toString().padStart(2, '0')}:00`,
            endTime: `${(hour + 1).toString().padStart(2, '0')}:00`,
            available: true
          });
        }
        
        availabilitySlots.push({
          date: dateStr,
          timeSlots: defaultSlots
        });
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return availabilitySlots;
  }

  /**
   * Get venues owned by user
   */
  async getMyVenues(userId: string): Promise<Venue[]> {
    const result = await dynamodb.query<any>(
      'GSI2PK = :gsi2pk',
      { ':gsi2pk': `USER#${userId}` },
      { indexName: 'GSI2' }
    );

    const venueIds = result.items
      .filter(item => item.SK.startsWith('VENUE#'))
      .map(item => item.venueId);

    const venues: Venue[] = [];
    for (const venueId of venueIds) {
      const venue = await this.getVenue(venueId);
      if (venue) {
        venues.push(venue);
      }
    }

    return venues;
  }

  /**
   * Map database record to venue object
   */
  private mapRecordToVenue(record: VenueRecord): Venue {
    return {
      venueId: record.venueId,
      name: record.name,
      description: record.description,
      category: record.category,
      location: record.location,
      capacity: record.capacity,
      amenities: record.amenities,
      pricing: record.pricing,
      images: record.images,
      ownerId: record.ownerId,
      status: record.status,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    };
  }

  /**
   * Generate filter options for frontend
   */
  private generateFilters(venues: Venue[]) {
    const categories = [...new Set(venues.map(v => v.category))];
    const cities = [...new Set(venues.map(v => v.location.city))];
    const amenities = [...new Set(venues.flatMap(v => v.amenities))];
    
    const prices = venues.map(v => v.pricing.basePrice);
    const capacities = venues.flatMap(v => [v.capacity.min, v.capacity.max]);

    return {
      categories,
      cities,
      amenities: amenities.filter(a => COMMON_AMENITIES.includes(a as any)),
      priceRange: {
        min: Math.min(...prices, 0),
        max: Math.max(...prices, 1000)
      },
      capacityRange: {
        min: Math.min(...capacities, 1),
        max: Math.max(...capacities, 1000)
      }
    };
  }
}