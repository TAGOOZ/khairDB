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