import Razorpay from 'razorpay';
import { NextRequest } from 'next/server';

export interface CreateOrderRequest {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface CreateOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string | null;
  offer_id: string | null;
  status: string;
  attempts: number;
  notes: Record<string, string>;
  created_at: number;
}

export class RazorpayServer {
  private static instance: RazorpayServer;
  private razorpay: Razorpay;

  private constructor() {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay credentials not configured. Please check your .env.local file and add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET');
    }

    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }

  static getInstance(): RazorpayServer {
    if (!RazorpayServer.instance) {
      RazorpayServer.instance = new RazorpayServer();
    }
    return RazorpayServer.instance;
  }

  async createOrder(options: CreateOrderRequest): Promise<CreateOrderResponse> {
    try {
      const order = await this.razorpay.orders.create({
        amount: options.amount * 100, // Razorpay expects amount in paise
        currency: options.currency || 'INR',
        receipt: options.receipt,
        notes: options.notes,
        payment_capture: true,
      });

      return order as unknown as CreateOrderResponse;
    } catch (error) {
      console.error('Razorpay order creation error:', error);
      throw new Error('Failed to create Razorpay order');
    }
  }

  async verifyPayment(
    orderId: string,
    paymentId: string,
    signature: string
  ): Promise<boolean> {
    try {
      const crypto = require('crypto');
      
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      return generatedSignature === signature;
    } catch (error) {
      console.error('Payment verification error:', error);
      return false;
    }
  }

  async fetchPayment(paymentId: string): Promise<any> {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      console.error('Payment fetch error:', error);
      throw new Error('Failed to fetch payment details');
    }
  }

  getKeyId(): string {
    return process.env.RAZORPAY_KEY_ID!;
  }
}
