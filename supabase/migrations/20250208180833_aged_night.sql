/*
  # Fix Users Table RLS Policies

  1. Changes
    - Enable RLS on users table
    - Add policy for authenticated users to view user profiles
    - Add policy for users to update their own profile
    - Add policy for admins to manage all users

  2. Security
    - Users can only view profiles
    - Users can only update their own profile
    - Admins have full access
*/

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view profiles" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage users" ON users;

-- Create new policies
CREATE POLICY "Users can view profiles"
  ON users
  FOR SELECT
  TO authenticated
  USING (true);  -- Allow all authenticated users to view profiles

CREATE POLICY "Users can update own profile"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    role = 'user'  -- Prevent users from escalating their role
  );

CREATE POLICY "Admins can manage users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );
