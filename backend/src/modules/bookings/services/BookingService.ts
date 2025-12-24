/**
 * Booking Service - Business Logic Layer
 *
 * Handles all booking-related operations including:
 * - Booking creation with conflict checking
 * - Availability verification
 * - Payment processing integration
 * - Status management
 * - Email notifications
 */

import { v4 as uuidv4 } from 'uuid';
import { dynamodb } from '../../../shared/clients/dynamodb';
import { ses } from '../../../shared/clients/ses';
import { createLogger } from '../../../shared/logger';
import {
  Booking,
  CreateBookingRequest,
  UpdateBookingRequest,
  BookingListResponse,
  BookingConflictCheck,
  BookingDynamoItem,
  ListBookingsQuery,
  BookingStatus,
  PaymentStatus,
} from '../types';
import { PaymentService } from './PaymentService';

const logger = createLogger('BookingService');

export class BookingService {
  private paymentService: PaymentService;

  constructor() {
    this.paymentService = new PaymentService();
  }

  /**
   * Create a new booking with conflict checking and payment processing
   */
  async createBooking(data: CreateBookingRequest, userId: string): Promise<Booking> {
    logger.info('Creating booking', { userId, bookingType: data.bookingType });

    // 1. Validate booking data
    this.validateBookingData(data);

    // 2. Check for availability conflicts
    const conflictCheck = await this.checkAvailability(
      data.venueId || data.eventId!,
      data.bookingType,
      data.startDate,
      data.endDate,
      data.startTime,
      data.endTime
    );

    if (conflictCheck.hasConflict) {
      throw new Error('Booking slot is not available. Please choose a different time.');
    }

    // 3. Calculate total amount (mock calculation)
    const totalAmount = this.calculateBookingAmount(data);

    // 4. Process payment
    const paymentResult = await this.paymentService.processPayment(totalAmount, 'USD');

    if (!paymentResult.success) {
      throw new Error('Payment processing failed. Please try again.');
    }

    // 5. Create booking record
    const bookingId = uuidv4();
    const now = new Date().toISOString();

    const booking: Booking = {
      bookingId,
      userId,
      venueId: data.venueId,
      eventId: data.eventId,
      bookingType: data.bookingType,
      startDate: data.startDate,
      endDate: data.endDate,
      startTime: data.startTime,
      endTime: data.endTime,
      attendeeCount: data.attendeeCount,
      totalAmount,
      currency: 'USD',
      status: 'pending',
      paymentStatus: 'paid',
      paymentId: paymentResult.paymentId,
      specialRequests: data.specialRequests,
      contactInfo: data.contactInfo,
      createdAt: now,
      updatedAt: now,
    };

    // 6. Save to database
    await this.saveBookingToDatabase(booking);

    // 7. Send confirmation email
    await this.sendBookingConfirmationEmail(booking);

    logger.info('Booking created successfully', { bookingId });
    return booking;
  }

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId: string, userId?: string): Promise<Booking | null> {
    const key = {
      PK: `BOOKING#${bookingId}`,
      SK: 'METADATA',
    };

    const item = await dynamodb.get<BookingDynamoItem>(key);
    if (!item) {
      return null;
    }

    // If userId provided, check ownership
    if (userId && item.userId !== userId) {
      return null;
    }

    return this.mapDynamoItemToBooking(item);
  }

  /**
   * List bookings for a user with filtering
   */
  async listBookings(userId: string, query: ListBookingsQuery = {}): Promise<BookingListResponse> {
    logger.info('Listing bookings for user', { userId, query });

    try {
      const { limit = 20, offset = 0, status, bookingType, startDate, endDate } = query;

      // Query user's bookings using GSI1
      const keyConditionExpression = 'GSI1PK = :userPK';
      const expressionAttributeValues: Record<string, any> = {
        ':userPK': `USER#${userId}`,
      };

      logger.info('DynamoDB query parameters', {
        keyConditionExpression,
        expressionAttributeValues,
        tableName: dynamodb['tableName'] || 'unknown',
      });

      // Add filters
      let filterExpression = '';
      const filterConditions: string[] = [];

      if (status) {
        filterConditions.push('#status = :status');
        expressionAttributeValues[':status'] = status;
      }

      if (bookingType) {
        filterConditions.push('bookingType = :bookingType');
        expressionAttributeValues[':bookingType'] = bookingType;
      }

      if (startDate) {
        filterConditions.push('startDate >= :startDate');
        expressionAttributeValues[':startDate'] = startDate;
      }

      if (endDate) {
        filterConditions.push('endDate <= :endDate');
        expressionAttributeValues[':endDate'] = endDate;
      }

      if (filterConditions.length > 0) {
        filterExpression = filterConditions.join(' AND ');
      }

      const result = await dynamodb.query<BookingDynamoItem>(
        keyConditionExpression,
        expressionAttributeValues,
        {
          indexName: 'GSI1',
          limit: limit + offset, // Get more to handle offset
          filterExpression: filterExpression || undefined,
          expressionAttributeNames: status ? { '#status': 'status' } : undefined,
          scanIndexForward: false, // Most recent first
        }
      );

      // Apply offset and limit
      const paginatedItems = result.items.slice(offset, offset + limit);
      const bookings = paginatedItems.map(this.mapDynamoItemToBooking);

      logger.info('Successfully retrieved bookings', { count: bookings.length });

      return {
        bookings,
        totalCount: result.count,
      };
    } catch (error) {
      logger.error('Error listing bookings', error, { userId, query });
      throw error;
    }
  }

  /**
   * Update booking (only certain fields allowed)
   */
  async updateBooking(
    bookingId: string,
    userId: string,
    updates: UpdateBookingRequest
  ): Promise<Booking> {
    // Get existing booking
    const existing = await this.getBookingById(bookingId, userId);
    if (!existing) {
      throw new Error('Booking not found or access denied');
    }

    // Only allow updates for pending bookings
    if (existing.status !== 'pending') {
      throw new Error('Cannot update booking that is not pending');
    }

    // If updating dates/times, check for conflicts
    if (updates.startDate || updates.endDate || updates.startTime || updates.endTime) {
      const newStartDate = updates.startDate || existing.startDate;
      const newEndDate = updates.endDate || existing.endDate;
      const newStartTime = updates.startTime || existing.startTime;
      const newEndTime = updates.endTime || existing.endTime;

      const conflictCheck = await this.checkAvailability(
        existing.venueId || existing.eventId!,
        existing.bookingType,
        newStartDate,
        newEndDate,
        newStartTime,
        newEndTime,
        bookingId // Exclude current booking from conflict check
      );

      if (conflictCheck.hasConflict) {
        throw new Error('Updated time slot is not available');
      }
    }

    // Update the booking
    const key = {
      PK: `BOOKING#${bookingId}`,
      SK: 'METADATA',
    };

    const updatedBooking = await dynamodb.update<BookingDynamoItem>(key, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    return this.mapDynamoItemToBooking(updatedBooking);
  }

  /**
   * Cancel a booking
   */
  async cancelBooking(bookingId: string, userId: string): Promise<Booking> {
    const booking = await this.getBookingById(bookingId, userId);
    if (!booking) {
      throw new Error('Booking not found or access denied');
    }

    if (booking.status === 'cancelled') {
      throw new Error('Booking is already cancelled');
    }

    if (booking.status === 'completed') {
      throw new Error('Cannot cancel completed booking');
    }

    // Process refund if payment was made
    if (booking.paymentStatus === 'paid' && booking.paymentId) {
      await this.paymentService.refundPayment(
        booking.paymentId,
        booking.totalAmount,
        'Booking cancelled by user'
      );
    }

    // Update booking status
    const key = {
      PK: `BOOKING#${bookingId}`,
      SK: 'METADATA',
    };

    const now = new Date().toISOString();
    const updatedBooking = await dynamodb.update<BookingDynamoItem>(key, {
      status: 'cancelled' as BookingStatus,
      paymentStatus: 'refunded' as PaymentStatus,
      cancelledAt: now,
      updatedAt: now,
    });

    // Send cancellation email
    const mappedBooking = this.mapDynamoItemToBooking(updatedBooking);
    await this.sendBookingCancellationEmail(mappedBooking);

    logger.info('Booking cancelled successfully', { bookingId });
    return mappedBooking;
  }

  /**
   * Confirm booking (venue owner action)
   */
  async confirmBooking(bookingId: string, _venueOwnerId: string): Promise<Booking> {
    const booking = await this.getBookingById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status !== 'pending') {
      throw new Error('Only pending bookings can be confirmed');
    }

    // TODO: Verify venue ownership (would need venue service integration)
    // For now, we'll allow any authenticated user to confirm

    const key = {
      PK: `BOOKING#${bookingId}`,
      SK: 'METADATA',
    };

    const now = new Date().toISOString();
    const updatedBooking = await dynamodb.update<BookingDynamoItem>(key, {
      status: 'confirmed' as BookingStatus,
      confirmedAt: now,
      updatedAt: now,
    });

    const mappedBooking = this.mapDynamoItemToBooking(updatedBooking);
    await this.sendBookingConfirmedEmail(mappedBooking);

    logger.info('Booking confirmed successfully', { bookingId });
    return mappedBooking;
  }

  /**
   * Check availability for a time slot
   */
  async checkAvailability(
    resourceId: string,
    bookingType: 'venue' | 'event',
    startDate: string,
    endDate: string,
    startTime: string,
    endTime: string,
    excludeBookingId?: string
  ): Promise<BookingConflictCheck> {
    // Query existing bookings for the resource
    const gsiPK = bookingType === 'venue' ? `VENUE#${resourceId}` : `EVENT#${resourceId}`;

    const keyConditionExpression = 'GSI1PK = :resourcePK';
    const expressionAttributeValues: Record<string, any> = {
      ':resourcePK': gsiPK,
    };

    // Filter for overlapping dates and non-cancelled bookings
    let filterExpression = '#status <> :cancelled';
    expressionAttributeValues[':cancelled'] = 'cancelled';

    if (excludeBookingId) {
      filterExpression += ' AND bookingId <> :excludeId';
      expressionAttributeValues[':excludeId'] = excludeBookingId;
    }

    const result = await dynamodb.query<BookingDynamoItem>(
      keyConditionExpression,
      expressionAttributeValues,
      {
        indexName: 'GSI1',
        filterExpression,
        expressionAttributeNames: { '#status': 'status' },
      }
    );

    // Check for time conflicts
    const conflictingBookings: Booking[] = [];

    for (const item of result.items) {
      if (
        this.hasTimeConflict(
          startDate,
          endDate,
          startTime,
          endTime,
          item.startDate,
          item.endDate,
          item.startTime,
          item.endTime
        )
      ) {
        conflictingBookings.push(this.mapDynamoItemToBooking(item));
      }
    }

    return {
      hasConflict: conflictingBookings.length > 0,
      conflictingBookings: conflictingBookings.length > 0 ? conflictingBookings : undefined,
    };
  }

  // Private helper methods

  private validateBookingData(data: CreateBookingRequest): void {
    if (!data.bookingType) {
      throw new Error('Booking type is required');
    }

    if (data.bookingType === 'venue' && !data.venueId) {
      throw new Error('Venue ID is required for venue bookings');
    }

    if (data.bookingType === 'event' && !data.eventId) {
      throw new Error('Event ID is required for event bookings');
    }

    if (!data.startDate || !data.endDate) {
      throw new Error('Start date and end date are required');
    }

    if (!data.startTime || !data.endTime) {
      throw new Error('Start time and end time are required');
    }

    if (data.attendeeCount <= 0) {
      throw new Error('Attendee count must be greater than 0');
    }

    if (!data.contactInfo?.name || !data.contactInfo?.email) {
      throw new Error('Contact name and email are required');
    }

    // Validate date/time logic
    const startDateTime = new Date(`${data.startDate}T${data.startTime}`);
    const endDateTime = new Date(`${data.endDate}T${data.endTime}`);

    if (endDateTime <= startDateTime) {
      throw new Error('End date/time must be after start date/time');
    }

    if (startDateTime <= new Date()) {
      throw new Error('Booking cannot be in the past');
    }
  }

  private calculateBookingAmount(data: CreateBookingRequest): number {
    // Mock calculation - in real app, this would be based on venue rates, duration, etc.
    const baseRate = 100; // $100 base rate
    const attendeeRate = 10; // $10 per attendee
    const hours = this.calculateDurationHours(
      data.startDate,
      data.endDate,
      data.startTime,
      data.endTime
    );

    return baseRate + data.attendeeCount * attendeeRate + hours * 25;
  }

  private calculateDurationHours(
    startDate: string,
    endDate: string,
    startTime: string,
    endTime: string
  ): number {
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60));
  }

  private hasTimeConflict(
    start1: string,
    end1: string,
    startTime1: string,
    endTime1: string,
    start2: string,
    end2: string,
    startTime2: string,
    endTime2: string
  ): boolean {
    const datetime1Start = new Date(`${start1}T${startTime1}`);
    const datetime1End = new Date(`${end1}T${endTime1}`);
    const datetime2Start = new Date(`${start2}T${startTime2}`);
    const datetime2End = new Date(`${end2}T${endTime2}`);

    // Check if time ranges overlap
    return datetime1Start < datetime2End && datetime2Start < datetime1End;
  }

  private async saveBookingToDatabase(booking: Booking): Promise<void> {
    // Create multiple records for different access patterns
    const items: BookingDynamoItem[] = [
      // Main booking record
      {
        PK: `BOOKING#${booking.bookingId}`,
        SK: 'METADATA',
        GSI1PK: `USER#${booking.userId}`,
        GSI1SK: booking.createdAt,
        ...booking,
      },
      // Venue/Event index record
      {
        PK: `BOOKING#${booking.bookingId}`,
        SK:
          booking.bookingType === 'venue' ? `VENUE#${booking.venueId}` : `EVENT#${booking.eventId}`,
        GSI1PK:
          booking.bookingType === 'venue' ? `VENUE#${booking.venueId}` : `EVENT#${booking.eventId}`,
        GSI1SK: booking.startDate,
        ...booking,
      },
    ];

    // Save all records
    for (const item of items) {
      await dynamodb.put(item);
    }
  }

  private mapDynamoItemToBooking(item: BookingDynamoItem): Booking {
    return {
      bookingId: item.bookingId,
      userId: item.userId,
      venueId: item.venueId,
      eventId: item.eventId,
      bookingType: item.bookingType,
      startDate: item.startDate,
      endDate: item.endDate,
      startTime: item.startTime,
      endTime: item.endTime,
      attendeeCount: item.attendeeCount,
      totalAmount: item.totalAmount,
      currency: item.currency,
      status: item.status,
      paymentStatus: item.paymentStatus,
      paymentId: item.paymentId,
      specialRequests: item.specialRequests,
      contactInfo: item.contactInfo,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      confirmedAt: item.confirmedAt,
      cancelledAt: item.cancelledAt,
    };
  }

  private async sendBookingConfirmationEmail(booking: Booking): Promise<void> {
    try {
      const subject = `Booking Confirmation - ${booking.bookingId}`;
      const html = `
        <h2>Booking Confirmation</h2>
        <p>Dear ${booking.contactInfo.name},</p>
        <p>Your booking has been created successfully!</p>
        
        <h3>Booking Details:</h3>
        <ul>
          <li><strong>Booking ID:</strong> ${booking.bookingId}</li>
          <li><strong>Type:</strong> ${booking.bookingType}</li>
          <li><strong>Date:</strong> ${booking.startDate} to ${booking.endDate}</li>
          <li><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</li>
          <li><strong>Attendees:</strong> ${booking.attendeeCount}</li>
          <li><strong>Total Amount:</strong> $${booking.totalAmount}</li>
          <li><strong>Status:</strong> ${booking.status}</li>
        </ul>
        
        ${booking.specialRequests ? `<p><strong>Special Requests:</strong> ${booking.specialRequests}</p>` : ''}
        
        <p>Thank you for your booking!</p>
      `;

      await ses.sendHtml(booking.contactInfo.email, subject, html);

      logger.info('Booking confirmation email sent', { bookingId: booking.bookingId });
    } catch (error) {
      logger.error('Failed to send booking confirmation email', error);
      // Don't throw - email failure shouldn't fail the booking
    }
  }

  private async sendBookingCancellationEmail(booking: Booking): Promise<void> {
    try {
      const subject = `Booking Cancelled - ${booking.bookingId}`;
      const html = `
        <h2>Booking Cancellation</h2>
        <p>Dear ${booking.contactInfo.name},</p>
        <p>Your booking has been cancelled.</p>
        
        <h3>Cancelled Booking Details:</h3>
        <ul>
          <li><strong>Booking ID:</strong> ${booking.bookingId}</li>
          <li><strong>Original Date:</strong> ${booking.startDate} to ${booking.endDate}</li>
          <li><strong>Refund Amount:</strong> $${booking.totalAmount}</li>
        </ul>
        
        <p>Your refund will be processed within 3-5 business days.</p>
      `;

      await ses.sendHtml(booking.contactInfo.email, subject, html);
    } catch (error) {
      logger.error('Failed to send cancellation email', error);
    }
  }

  private async sendBookingConfirmedEmail(booking: Booking): Promise<void> {
    try {
      const subject = `Booking Confirmed - ${booking.bookingId}`;
      const html = `
        <h2>Booking Confirmed!</h2>
        <p>Dear ${booking.contactInfo.name},</p>
        <p>Great news! Your booking has been confirmed by the venue.</p>
        
        <h3>Confirmed Booking Details:</h3>
        <ul>
          <li><strong>Booking ID:</strong> ${booking.bookingId}</li>
          <li><strong>Date:</strong> ${booking.startDate} to ${booking.endDate}</li>
          <li><strong>Time:</strong> ${booking.startTime} - ${booking.endTime}</li>
          <li><strong>Attendees:</strong> ${booking.attendeeCount}</li>
        </ul>
        
        <p>We look forward to seeing you!</p>
      `;

      await ses.sendHtml(booking.contactInfo.email, subject, html);
    } catch (error) {
      logger.error('Failed to send confirmation email', error);
    }
  }
}
