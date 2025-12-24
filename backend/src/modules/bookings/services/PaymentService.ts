/**
 * Mock Payment Service for Hackathon Demo
 *
 * Simulates payment processing with realistic delays and responses.
 * In production, this would integrate with Stripe, PayPal, or similar.
 */

import { PaymentResult } from '../types';
import { createLogger } from '../../../shared/logger';

const logger = createLogger('PaymentService');

export class PaymentService {
  /**
   * Process a mock payment (always succeeds after delay)
   */
  async processPayment(
    amount: number,
    currency: string = 'USD',
    paymentMethod?: string
  ): Promise<PaymentResult> {
    logger.info('Processing mock payment', { amount, currency, paymentMethod });

    // Simulate payment processing delay (1-3 seconds)
    const delay = Math.random() * 2000 + 1000;
    await new Promise((resolve) => setTimeout(resolve, delay));

    // For demo purposes, always succeed
    // In real implementation, this could fail based on various conditions
    const paymentId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const result: PaymentResult = {
      success: true,
      paymentId,
      amount,
      currency,
    };

    logger.info('Mock payment processed successfully', result);
    return result;
  }

  /**
   * Refund a mock payment
   */
  async refundPayment(
    paymentId: string,
    amount: number,
    reason?: string
  ): Promise<{ success: boolean; refundId: string }> {
    logger.info('Processing mock refund', { paymentId, amount, reason });

    // Simulate refund processing delay
    const delay = Math.random() * 1000 + 500;
    await new Promise((resolve) => setTimeout(resolve, delay));

    const refundId = `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    logger.info('Mock refund processed successfully', { refundId });
    return {
      success: true,
      refundId,
    };
  }

  /**
   * Get payment status (mock)
   */
  async getPaymentStatus(paymentId: string): Promise<{
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    amount: number;
    currency: string;
  }> {
    logger.info('Getting mock payment status', { paymentId });

    // For mock payments, always return completed
    return {
      status: 'completed',
      amount: 100, // Mock amount
      currency: 'USD',
    };
  }
}
