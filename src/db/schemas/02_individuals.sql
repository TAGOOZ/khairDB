-- Individuals table for storing personal information
    CREATE TABLE IF NOT EXISTS individuals (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        first_name TEXT NOT NULL CHECK (length(first_name) >= 1),
        last_name TEXT NOT NULL CHECK (length(last_name) >= 1),
        id_number TEXT NOT NULL UNIQUE CHECK (length(id_number) = 14 AND id_number ~ '^[0-9]+$'),
        date_of_birth DATE NOT NULL CHECK (date_of_birth <= CURRENT_DATE),
        gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
        marital_status TEXT NOT NULL CHECK (marital_status IN ('single', 'married', 'widowed')),
        phone TEXT CHECK (phone IS NULL OR phone ~* '^\+?[0-9\s-\(\)]{10,}$'),
        district TEXT NOT NULL CHECK (district ~ '^[0-9]+$'),
        family_id UUID REFERENCES families(id) ON DELETE SET NULL,
        address TEXT,
        description TEXT,
        job TEXT,
        employment_status TEXT NOT NULL CHECK (employment_status IN ('no_salary', 'has_salary', 'social_support')) DEFAULT 'no_salary',
        salary DECIMAL(10,2),
        list_status TEXT NOT NULL CHECK (list_status IN ('whitelist', 'blacklist', 'waitinglist')) DEFAULT 'whitelist',
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        created_by UUID REFERENCES auth.users(id),
        google_drive_folder_id TEXT,
        google_drive_folder_url TEXT
    );
    
    -- Indexes for faster lookups
    CREATE INDEX IF NOT EXISTS idx_individuals_names ON individuals (first_name, last_name);
    CREATE INDEX IF NOT EXISTS idx_individuals_district ON individuals (district);
    CREATE INDEX IF NOT EXISTS idx_individuals_family ON individuals (family_id);
    CREATE INDEX IF NOT EXISTS idx_individuals_created_by ON individuals (created_by);
    
    -- Trigger for updated_at
    CREATE TRIGGER update_individuals_updated_at
        BEFORE UPDATE ON individuals
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    
    -- Enable RLS on individuals table
    ALTER TABLE individuals ENABLE ROW LEVEL SECURITY;
    
    -- Individuals table policies
    CREATE POLICY "Users can view all individuals"
      ON individuals FOR SELECT
      TO authenticated
      USING (true);
    
    CREATE POLICY "Users can create individuals"
      ON individuals FOR INSERT
      TO authenticated
      WITH CHECK (
        is_admin() OR
        created_by = auth.uid()
      );
    
    CREATE POLICY "Users can update individuals they created"
      ON individuals FOR UPDATE
      TO authenticated
      USING (
        is_admin() OR
        created_by = auth.uid()
      );
    
    CREATE POLICY "Only admins can delete individuals"
      ON individuals FOR DELETE
      TO authenticated
      USING (is_admin());
    
    -- Add comment
    COMMENT ON TABLE individuals IS 'Individual beneficiaries managed by the system';
