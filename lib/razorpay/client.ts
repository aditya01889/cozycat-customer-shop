declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  notes: Record<string, string>;
  theme: {
    color: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal: {
    ondismiss: () => void;
  };
}

export interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export class RazorpayClient {
  private static instance: RazorpayClient;
  private isLoaded = false;

  private constructor() {}

  static getInstance(): RazorpayClient {
    if (!RazorpayClient.instance) {
      RazorpayClient.instance = new RazorpayClient();
    }
    return RazorpayClient.instance;
  }

  async loadScript(): Promise<void> {
    if (this.isLoaded || typeof window !== 'undefined' && window.Razorpay) {
      this.isLoaded = true;
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      
      script.onload = () => {
        this.isLoaded = true;
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Razorpay SDK'));
      };
      
      document.body.appendChild(script);
    });
  }

  openPayment(options: RazorpayOptions): void {
    if (!this.isLoaded || !window.Razorpay) {
      throw new Error('Razorpay SDK not loaded');
    }

    const rzp = new window.Razorpay(options);
    rzp.open();
  }

  isSdkLoaded(): boolean {
    return this.isLoaded && typeof window !== 'undefined' && !!window.Razorpay;
  }
}
