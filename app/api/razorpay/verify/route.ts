import { NextRequest, NextResponse } from 'next/server';
import { RazorpayServer } from '@/lib/razorpay/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, paymentId, signature, orderNumber } = body;

    // Validate required fields
    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: 'Missing required payment details' },
        { status: 400 }
      );
    }

    // Verify payment signature
    const razorpayServer = RazorpayServer.getInstance();
    const isValid = await razorpayServer.verifyPayment(orderId, paymentId, signature);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Fetch payment details to confirm status
    const payment = await razorpayServer.fetchPayment(paymentId);
    
    if (payment.status !== 'captured') {
      return NextResponse.json(
        { error: 'Payment not successful' },
        { status: 400 }
      );
    }

    // Update order in database
    if (orderNumber) {
      const supabase = await createClient();
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          payment_id: paymentId,
          payment_method: 'online',
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('order_number', orderNumber);

      if (updateError) {
        console.error('Database update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update order status' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      payment: {
        id: paymentId,
        amount: payment.amount,
        status: payment.status,
        method: payment.method,
      }
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}
