import { NextRequest, NextResponse } from 'next/server';
import { RazorpayServer, CreateOrderRequest } from '@/lib/razorpay/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Creating Razorpay order...');
    
    // Check if Razorpay is configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay not configured:', {
        hasKeyId: !!process.env.RAZORPAY_KEY_ID,
        hasKeySecret: !!process.env.RAZORPAY_KEY_SECRET
      });
      return NextResponse.json(
        { error: 'Razorpay not configured. Please add API keys to .env.local' },
        { status: 500 }
      );
    }

    console.log('Razorpay keys found, proceeding...');
    const body: CreateOrderRequest = await request.json();
    console.log('Order request body:', body);

    // Validate required fields
    if (!body.amount || body.amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    console.log('Initializing Razorpay server...');
    const razorpayServer = RazorpayServer.getInstance();
    console.log('Creating order...');
    const order = await razorpayServer.createOrder(body);
    console.log('Order created successfully:', order);

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
      console.error('Error details:', error.message);
      if (error.message.includes('not configured')) {
        errorMessage = error.message;
      } else if (error.message.includes('Authentication')) {
        errorMessage = 'Invalid Razorpay API keys. Please check your credentials.';
      } else if (error.message.includes('Authorization')) {
        errorMessage = 'Invalid Razorpay API keys or insufficient permissions.';
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
