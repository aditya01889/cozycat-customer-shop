-- Add last_ordered field to vendors table
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS last_ordered timestamp with time zone;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_vendors_last_ordered ON vendors(last_ordered);

-- Add comment
COMMENT ON COLUMN vendors.last_ordered IS 'Date of the last purchase order sent to this vendor';
