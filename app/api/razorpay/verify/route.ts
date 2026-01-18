import { NextRequest, NextResponse } from 'next/server';
import { RazorpayServer } from '@/lib/razorpay/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    console.log('Starting payment verification...');
    const body = await request.json();
    const { orderId, paymentId, signature, orderNumber } = body;
    
    console.log('Verification request:', { orderId, paymentId, signature: signature?.substring(0, 20) + '...', orderNumber });

    // Validate required fields
    if (!orderId || !paymentId || !signature) {
      console.error('Missing required fields:', { hasOrderId: !!orderId, hasPaymentId: !!paymentId, hasSignature: !!signature });
      return NextResponse.json(
        { error: 'Missing required payment details' },
        { status: 400 }
      );
    }

    // Verify payment signature
    console.log('Verifying payment signature...');
    const razorpayServer = RazorpayServer.getInstance();
    const isValid = await razorpayServer.verifyPayment(orderId, paymentId, signature);
    
    console.log('Signature verification result:', isValid);

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Fetch payment details to confirm status
    console.log('Fetching payment details...');
    const payment = await razorpayServer.fetchPayment(paymentId);
    console.log('Payment details:', { id: payment.id, status: payment.status, amount: payment.amount });
    
    if (payment.status !== 'captured') {
      return NextResponse.json(
        { error: 'Payment not successful' },
        { status: 400 }
      );
    }

    // Update order in database
    if (orderNumber) {
      console.log('Updating order in database...');
      const supabase = await createClient();
      const { data, error: updateError } = await supabase
        .from('orders')
        .update({
          payment_status: 'paid',
          payment_method: 'online',
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('order_number', orderNumber)
        .select();

      if (updateError) {
        console.error('Database update error:', updateError);
        return NextResponse.json(
          { error: 'Failed to update order status' },
          { status: 500 }
        );
      }
      
      console.log('Order updated successfully:', data);
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
