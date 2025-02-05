-- Distributions table
    CREATE TABLE IF NOT EXISTS distributions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        date DATE NOT NULL,
        aid_type TEXT NOT NULL CHECK (aid_type IN (
            'food', 'clothing', 'financial', 'medical',
            'education', 'shelter', 'other'
        )),
        description TEXT NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity >= 0),
        value DECIMAL(10,2) NOT NULL CHECK (value >= 0),
        status TEXT NOT NULL CHECK (status IN ('in_progress', 'completed', 'cancelled')) DEFAULT 'in_progress',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Distribution recipients junction table
    CREATE TABLE IF NOT EXISTS distribution_recipients (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        distribution_id UUID NOT NULL REFERENCES distributions(id) ON DELETE CASCADE,
        individual_id UUID NOT NULL REFERENCES individuals(id) ON DELETE CASCADE,
        quantity_received INTEGER NOT NULL CHECK (quantity_received >= 0),
        value_received DECIMAL(10,2) NOT NULL CHECK (value_received >= 0),
        notes TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Create triggers for timestamp updates
    CREATE TRIGGER update_distributions_updated_at
        BEFORE UPDATE ON distributions
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    
    CREATE TRIGGER update_distribution_recipients_updated_at
        BEFORE UPDATE ON distribution_recipients
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    
    -- Enable RLS on distributions table
    ALTER TABLE distributions ENABLE ROW LEVEL SECURITY;
    
    -- Enable RLS on distribution_recipients table
    ALTER TABLE distribution_recipients ENABLE ROW LEVEL SECURITY;
    
    -- Distributions table policies
    CREATE POLICY "Users can view all distributions"
      ON distributions FOR SELECT
      TO authenticated
      USING (true);
    
    CREATE POLICY "Only admins can manage distributions"
      ON distributions FOR ALL
      TO authenticated
      USING (is_admin());
    
    -- Distribution recipients table policies
    CREATE POLICY "Users can view all distribution recipients"
      ON distribution_recipients FOR SELECT
      TO authenticated
      USING (true);
    
    CREATE POLICY "Only admins can manage distribution recipients"
      ON distribution_recipients FOR ALL
      TO authenticated
      USING (is_admin());
    
    -- Add comment
    COMMENT ON TABLE distributions IS 'Aid distribution records';
    COMMENT ON TABLE distribution_recipients IS 'Junction table for distribution recipients';
