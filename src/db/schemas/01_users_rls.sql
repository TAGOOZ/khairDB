-- RLS policies for the users table
    
    -- Users can view their own profile
    DROP POLICY IF EXISTS "Users can view their own profile" ON users;
    CREATE POLICY "Users can view their own profile"
      ON users
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
    
    -- Users can update their own profile
    DROP POLICY IF EXISTS "Users can update their own profile" ON users;
    CREATE POLICY "Users can update their own profile"
      ON users
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (
        role = 'user' -- Prevent users from escalating their role
      );
