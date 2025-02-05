-- Users table for authentication and basic user information
    CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY REFERENCES auth.users(id),
        email TEXT NOT NULL UNIQUE CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
        role TEXT NOT NULL CHECK (role IN ('admin', 'user')),
        first_name TEXT NOT NULL CHECK (length(first_name) >= 1),
        last_name TEXT NOT NULL CHECK (length(last_name) >= 1),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Trigger to update updated_at timestamp
    CREATE TRIGGER update_users_updated_at
        BEFORE UPDATE ON users
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    
    -- Enable RLS on users table
    ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    
    -- Users table policies
    CREATE POLICY "Users can view their own profile"
      ON users FOR SELECT
      TO authenticated
      USING (id = auth.uid() OR is_admin());
    
    CREATE POLICY "Users can update their own profile"
      ON users FOR UPDATE
      TO authenticated
      USING (id = auth.uid())
      WITH CHECK (
        role = 'user' -- Prevent users from escalating their role
      );
    
    -- Add comment
    COMMENT ON TABLE users IS 'User accounts with role-based access control';
