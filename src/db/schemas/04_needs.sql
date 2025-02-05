-- Needs table for tracking individual needs
    CREATE TABLE IF NOT EXISTS needs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        individual_id UUID NOT NULL REFERENCES individuals(id) ON DELETE CASCADE,
        category TEXT NOT NULL CHECK (category IN (
            'medical', 'financial', 'food', 'shelter', 'clothing',
            'education', 'employment', 'transportation', 'other'
        )),
        priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
        status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed')) DEFAULT 'pending',
        description TEXT NOT NULL CHECK (length(description) >= 1),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Indexes for common queries
    CREATE INDEX IF NOT EXISTS idx_needs_individual ON needs (individual_id);
    CREATE INDEX IF NOT EXISTS idx_needs_category ON needs (category);
    CREATE INDEX IF NOT EXISTS idx_needs_status ON needs (status);
    CREATE INDEX IF NOT EXISTS idx_needs_priority ON needs (priority);
    
    -- Trigger for updated_at
    CREATE TRIGGER update_needs_updated_at
        BEFORE UPDATE ON needs
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    
    -- Enable RLS on needs table
    ALTER TABLE needs ENABLE ROW LEVEL SECURITY;
    
    -- Needs table policies
    CREATE POLICY "Users can view all needs"
      ON needs FOR SELECT
      TO authenticated
      USING (true);
    
    CREATE POLICY "Users can create needs for their individuals"
      ON needs FOR INSERT
      TO authenticated
      WITH CHECK (
        is_admin() OR
        EXISTS (
          SELECT 1 FROM individuals
          WHERE id = individual_id
          AND created_by = auth.uid()
        )
      );
    
    CREATE POLICY "Users can update needs for their individuals"
      ON needs FOR UPDATE
      TO authenticated
      USING (
        is_admin() OR
        EXISTS (
          SELECT 1 FROM individuals
          WHERE id = individual_id
          AND created_by = auth.uid()
        )
      );
    
    CREATE POLICY "Only admins can delete needs"
      ON needs FOR DELETE
      TO authenticated
      USING (is_admin());
    
    -- Add comment
    COMMENT ON TABLE needs IS 'Needs and requirements tracked for individuals';
