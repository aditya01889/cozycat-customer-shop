import { NextRequest, NextResponse } from 'next/server';
import { RazorpayServer, CreateOrderRequest } from '@/lib/razorpay/server';

export async function POST(request: NextRequest) {
  try {
    // Check if Razorpay is configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { error: 'Razorpay not configured. Please add API keys to .env.local' },
        { status: 500 }
      );
    }

    const body: CreateOrderRequest = await request.json();

    // Validate required fields
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    const razorpayServer = RazorpayServer.getInstance();
    const order = await razorpayServer.createOrder(body);

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
        notes: order.notes,
      },
    });
  } catch (error) {
    console.error('Create order error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to create payment order';
    if (error instanceof Error) {
      if (error.message.includes('not configured')) {
        errorMessage = error.message;
      } else if (error.message.includes('Authentication')) {
        errorMessage = 'Invalid Razorpay API keys. Please check your credentials.';
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
