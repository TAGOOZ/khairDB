-- Families table for grouping individuals
    CREATE TABLE IF NOT EXISTS families (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name TEXT NOT NULL CHECK (length(name) >= 1),
        status TEXT NOT NULL CHECK (status IN ('green', 'yellow', 'red')),
        district TEXT,
        phone TEXT CHECK (phone IS NULL OR phone ~* '^\+?[0-9\s-\(\)]{10,}$'),
        address TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Family members junction table with role
    CREATE TABLE IF NOT EXISTS family_members (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
        individual_id UUID NOT NULL REFERENCES individuals(id) ON DELETE CASCADE,
        role TEXT NOT NULL CHECK (role IN ('parent', 'child')),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(family_id, individual_id)
    );
    
    -- Indexes for faster lookups
    CREATE INDEX IF NOT EXISTS idx_families_name ON families (name);
    CREATE INDEX IF NOT EXISTS idx_family_members_lookup ON family_members (family_id, individual_id);
    CREATE INDEX IF NOT EXISTS idx_family_members_role ON family_members (family_id, role);
    
    -- Triggers for updated_at
    CREATE TRIGGER update_families_updated_at
        BEFORE UPDATE ON families
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    
    CREATE TRIGGER update_family_members_updated_at
        BEFORE UPDATE ON family_members
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    
    -- Enable RLS on families table
    ALTER TABLE families ENABLE ROW LEVEL SECURITY;
    
    -- Enable RLS on family_members table
    ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
    
    -- Families table policies
    CREATE POLICY "Users can view all families"
      ON families FOR SELECT
      TO authenticated
      USING (true);
    
    CREATE POLICY "Only admins can manage families"
      ON families FOR ALL
      TO authenticated
      USING (is_admin());
    
    -- Family members table policies
    CREATE POLICY "Users can view all family members"
      ON family_members FOR SELECT
      TO authenticated
      USING (true);
    
    CREATE POLICY "Only admins can manage family members"
      ON family_members FOR ALL
      TO authenticated
      USING (is_admin());
    
    -- Add comment
    COMMENT ON TABLE families IS 'Family units that group individuals together';
    COMMENT ON TABLE family_members IS 'Junction table for family members';
