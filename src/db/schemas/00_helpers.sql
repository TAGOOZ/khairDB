-- Helper function to check if user is admin
    CREATE OR REPLACE FUNCTION is_admin()
    RETURNS BOOLEAN
    LANGUAGE sql
    SECURITY DEFINER
    STABLE
    AS $$
      SELECT EXISTS (
        SELECT 1 FROM users
        WHERE id = auth.uid()
        AND role = 'admin'
      );
    $$;
    
    -- Create trigger function for updating timestamps
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
    $$ language 'plpgsql';
    
    -- Add comment
    COMMENT ON FUNCTION is_admin IS 'Helper function to check if the current user has admin role';
