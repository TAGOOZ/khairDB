-- Migration to support both individuals and children as distribution recipients
-- This modifies the distribution_recipients table to support both types

-- First, drop the existing foreign key constraint
ALTER TABLE distribution_recipients DROP CONSTRAINT IF EXISTS distribution_recipients_individual_id_fkey;

-- Make individual_id nullable
ALTER TABLE distribution_recipients ALTER COLUMN individual_id DROP NOT NULL;

-- Add a child_id column
ALTER TABLE distribution_recipients ADD COLUMN IF NOT EXISTS child_id UUID REFERENCES children(id) ON DELETE CASCADE;

-- Add a constraint to ensure either individual_id or child_id is set, but not both
ALTER TABLE distribution_recipients ADD CONSTRAINT distribution_recipients_recipient_check 
CHECK (
  (individual_id IS NOT NULL AND child_id IS NULL) OR 
  (individual_id IS NULL AND child_id IS NOT NULL)
);

-- Add back the foreign key constraint for individual_id (now nullable)
ALTER TABLE distribution_recipients ADD CONSTRAINT distribution_recipients_individual_id_fkey 
FOREIGN KEY (individual_id) REFERENCES individuals(id) ON DELETE CASCADE;

-- Add index for child_id
CREATE INDEX IF NOT EXISTS idx_distribution_recipients_child_id ON distribution_recipients(child_id);

-- Update RLS policies if needed
-- (The existing policies should still work since they're based on authenticated users)

-- Add comments for clarity
COMMENT ON COLUMN distribution_recipients.individual_id IS 'Reference to individuals table (nullable when child_id is used)';
COMMENT ON COLUMN distribution_recipients.child_id IS 'Reference to children table (nullable when individual_id is used)';
COMMENT ON CONSTRAINT distribution_recipients_recipient_check ON distribution_recipients IS 'Ensures exactly one of individual_id or child_id is set';
