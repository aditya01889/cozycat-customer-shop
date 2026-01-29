import Razorpay from 'razorpay';
import { NextRequest } from 'next/server';

export interface CreateOrderRequest {
  amount: number;
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
  payment_capture?: boolean;
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
    console.log('🔧 RazorpayServer constructor called');
    
    const { getPaymentConfig } = require('@/lib/env-validation');
    const paymentConfig = getPaymentConfig();
    
    console.log('🔧 Payment config in RazorpayServer:', {
      hasKeyId: !!paymentConfig.razorpayKeyId,
      hasKeySecret: !!paymentConfig.razorpayKeySecret,
      keyIdLength: paymentConfig.razorpayKeyId ? paymentConfig.razorpayKeyId.length : 0,
      keySecretLength: paymentConfig.razorpayKeySecret ? paymentConfig.razorpayKeySecret.length : 0
    });
    
    if (!paymentConfig.razorpayKeyId || !paymentConfig.razorpayKeySecret) {
      console.error('❌ Razorpay credentials not configured. Please check your environment variables and add NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET');
      throw new Error('Razorpay credentials not configured. Please check your environment variables and add NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET');
    }

    console.log('✅ Creating Razorpay instance...');
    this.razorpay = new Razorpay({
      key_id: paymentConfig.razorpayKeyId,
      key_secret: paymentConfig.razorpayKeySecret,
    });
    console.log('✅ Razorpay instance created successfully');
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
        payment_capture: options.payment_capture ?? true,
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
      const { getPaymentConfig } = require('@/lib/env-validation');
      const paymentConfig = getPaymentConfig();
      
      const generatedSignature = crypto
        .createHmac('sha256', paymentConfig.razorpayKeySecret)
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
    const { getPaymentConfig } = require('@/lib/env-validation');
    const paymentConfig = getPaymentConfig();
    return paymentConfig.razorpayKeyId;
  }
}
