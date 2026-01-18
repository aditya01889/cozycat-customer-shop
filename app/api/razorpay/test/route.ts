import { NextResponse } from 'next/server';
import { RazorpayServer } from '@/lib/razorpay/server';

export async function GET() {
  try {
    console.log('Testing Razorpay connection...');
    console.log('Key ID:', process.env.RAZORPAY_KEY_ID);
    console.log('Has Key Secret:', !!process.env.RAZORPAY_KEY_SECRET);
    
    const razorpayServer = RazorpayServer.getInstance();
    
    // Try to fetch account details to test the connection
    const account = await (razorpayServer as any).razorpay.accounts.fetch();
    
    return NextResponse.json({
      success: true,
      message: 'Razorpay connection successful',
      account: {
        id: account.id,
        name: account.name,
        email: account.email,
      }
    });
  } catch (error) {
    console.error('Razorpay test failed:', error);
    return NextResponse.json(
      { 
        error: 'Razorpay connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
