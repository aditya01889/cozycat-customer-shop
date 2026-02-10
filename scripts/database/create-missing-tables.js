const { createClient } = require('@supabase/supabase-js');

const stagingSupabase = createClient(
  'https://pjckafjhzwegtyhlatus.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBqY2thZmpoendlZ3R5aGxhdHVzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTYzMDY3OSwiZXhwIjoyMDg1MjA2Njc5fQ.xEMNIrSYO59toaFNaTvxKxf4wFGrckstm8MEP9OxmvM'
);

async function createMissingTables() {
  console.log('🔧 Creating missing tables in staging...');
  
  // Create payments table
  try {
    const { error: paymentsError } = await stagingSupabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.payments (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
          amount DECIMAL(10,2) NOT NULL,
          currency VARCHAR(3) DEFAULT 'INR',
          status VARCHAR(50) DEFAULT 'pending',
          payment_method VARCHAR(50),
          transaction_id VARCHAR(255),
          gateway_response JSONB,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_payments_order_id ON public.payments(order_id);
        CREATE INDEX IF NOT EXISTS idx_payments_user_id ON public.payments(user_id);
        CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
      `
    });
    
    if (paymentsError) {
      console.error('❌ Error creating payments table:', paymentsError);
    } else {
      console.log('✅ Payments table created');
    }
  } catch (e) {
    console.error('❌ Exception creating payments table:', e);
  }
  
  // Create addresses table
  try {
    const { error: addressesError } = await stagingSupabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.addresses (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
          type VARCHAR(20) DEFAULT 'home',
          recipient_name VARCHAR(255) NOT NULL,
          phone VARCHAR(20),
          address_line1 TEXT NOT NULL,
          address_line2 TEXT,
          landmark VARCHAR(255),
          city VARCHAR(100) NOT NULL,
          state VARCHAR(100) NOT NULL,
          postal_code VARCHAR(20) NOT NULL,
          country VARCHAR(100) DEFAULT 'India',
          is_default BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON public.addresses(user_id);
        CREATE INDEX IF NOT EXISTS idx_addresses_is_default ON public.addresses(is_default);
      `
    });
    
    if (addressesError) {
      console.error('❌ Error creating addresses table:', addressesError);
    } else {
      console.log('✅ Addresses table created');
    }
  } catch (e) {
    console.error('❌ Exception creating addresses table:', e);
  }
  
  // Create reviews table
  try {
    const { error: reviewsError } = await stagingSupabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.reviews (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
          rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
          title VARCHAR(255),
          content TEXT,
          is_verified_purchase BOOLEAN DEFAULT false,
          helpful_count INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(product_id, user_id)
        );
        
        CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON public.reviews(product_id);
        CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
        CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating);
        CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON public.reviews(created_at);
      `
    });
    
    if (reviewsError) {
      console.error('❌ Error creating reviews table:', reviewsError);
    } else {
      console.log('✅ Reviews table created');
    }
  } catch (e) {
    console.error('❌ Exception creating reviews table:', e);
  }
  
  // Create settings table
  try {
    const { error: settingsError } = await stagingSupabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS public.settings (
          key VARCHAR(255) PRIMARY KEY,
          value TEXT,
          description TEXT,
          is_public BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Insert default settings
        INSERT INTO public.settings (key, value, description, is_public) VALUES
        ('site_name', 'CozyCat Kitchen', 'Site name', true),
        ('site_description', 'Premium cat food and treats', 'Site description', true),
        ('contact_email', 'support@cozycatkitchen.com', 'Contact email', true),
        ('contact_phone', '+91 98765 43210', 'Contact phone', true),
        ('social_facebook', 'https://facebook.com/cozycatkitchen', 'Facebook URL', true),
        ('social_instagram', 'https://instagram.com/cozycatkitchen', 'Instagram URL', true),
        ('social_twitter', 'https://twitter.com/cozycatkitchen', 'Twitter URL', true),
        ('shipping_cost', '50', 'Default shipping cost', false),
        ('free_shipping_threshold', '500', 'Free shipping threshold', false),
        ('tax_rate', '18', 'Tax rate percentage', false)
        ON CONFLICT (key) DO NOTHING;
      `
    });
    
    if (settingsError) {
      console.error('❌ Error creating settings table:', settingsError);
    } else {
      console.log('✅ Settings table created');
    }
  } catch (e) {
    console.error('❌ Exception creating settings table:', e);
  }
  
  console.log('🎉 Table creation process completed');
}

// Run the table creation
createMissingTables();
