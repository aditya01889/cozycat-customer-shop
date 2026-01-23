-- Create ingredient_updates table for tracking stock and price changes
CREATE TABLE ingredient_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
  
  -- Stock tracking
  previous_stock DECIMAL(10,2) NOT NULL,
  new_stock DECIMAL(10,2) NOT NULL,
  stock_change_amount DECIMAL(10,2) GENERATED ALWAYS AS (new_stock - previous_stock) STORED,
  
  -- Cost tracking
  previous_cost DECIMAL(10,2) NOT NULL,
  new_cost DECIMAL(10,2) NOT NULL,
  cost_change_amount DECIMAL(10,2) GENERATED ALWAYS AS (new_cost - previous_cost) STORED,
  cost_change_percent DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN previous_cost = 0 THEN 0
      ELSE ROUND(((new_cost - previous_cost) / previous_cost) * 100, 2)
    END
  ) STORED,
  
  -- Supplier tracking
  previous_supplier UUID REFERENCES vendors(id),
  new_supplier UUID REFERENCES vendors(id),
  
  -- Update metadata
  update_type TEXT NOT NULL CHECK (update_type IN ('purchase', 'usage', 'adjustment', 'waste')),
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate entries for same timestamp
  UNIQUE(ingredient_id, created_at)
);

-- Create index for performance
CREATE INDEX idx_ingredient_updates_ingredient_id ON ingredient_updates(ingredient_id);
CREATE INDEX idx_ingredient_updates_created_at ON ingredient_updates(created_at);
CREATE INDEX idx_ingredient_updates_update_type ON ingredient_updates(update_type);

-- Row Level Security
ALTER TABLE ingredient_updates ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view updates for ingredients they have access to
CREATE POLICY "Users can view ingredient updates" ON ingredient_updates
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ingredients 
      WHERE ingredients.id = ingredient_updates.ingredient_id
    )
  );

-- Policy: Users can insert updates
CREATE POLICY "Users can insert ingredient updates" ON ingredient_updates
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Policy: Users can update their own updates
CREATE POLICY "Users can update ingredient updates" ON ingredient_updates
  FOR UPDATE USING (auth.uid() = created_by);

-- Policy: Users can delete their own updates
CREATE POLICY "Users can delete ingredient updates" ON ingredient_updates
  FOR DELETE USING (auth.uid() = created_by);
