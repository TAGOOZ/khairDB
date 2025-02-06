/*
  # Enhanced Family Members Schema

  1. Changes
    - Add additional_members JSONB column to individuals table
    - Add children table with proper relationships
    - Add family_roles table for better role management
    - Add appropriate indexes and constraints
    - Add RLS policies for security

  2. New Tables
    - family_roles: Defines valid family roles
    - children: Stores child records with proper relationships
    
  3. Security
    - RLS policies for all new tables
    - Secure defaults and constraints
*/

-- Create family_roles enum type for better data integrity
CREATE TYPE family_role AS ENUM (
  'parent',
  'child',
  'spouse',
  'sibling',
  'grandparent',
  'other'
);

-- Add additional_members to individuals
ALTER TABLE individuals ADD COLUMN IF NOT EXISTS additional_members JSONB DEFAULT '[]'::jsonb;
COMMENT ON COLUMN individuals.additional_members IS 'Stores non-child family members like spouse, siblings etc. in JSON format';

-- Create index for JSONB querying
CREATE INDEX IF NOT EXISTS idx_individuals_additional_members ON individuals USING gin(additional_members);

-- Create children table
CREATE TABLE IF NOT EXISTS children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL CHECK (length(first_name) >= 1),
  last_name TEXT NOT NULL CHECK (length(last_name) >= 1),
  date_of_birth DATE NOT NULL CHECK (date_of_birth <= CURRENT_DATE),
  gender TEXT NOT NULL CHECK (gender IN ('boy', 'girl')),
  school_stage TEXT CHECK (school_stage IN ('kindergarten', 'primary', 'preparatory', 'secondary')),
  description TEXT,
  parent_id UUID NOT NULL REFERENCES individuals(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add age check trigger for children
CREATE OR REPLACE FUNCTION check_child_age()
RETURNS TRIGGER AS $$
BEGIN
  IF (EXTRACT(YEAR FROM age(NEW.date_of_birth)) >= 18) THEN
    RAISE EXCEPTION 'Child must be under 18 years old';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_child_age
  BEFORE INSERT OR UPDATE ON children
  FOR EACH ROW
  EXECUTE FUNCTION check_child_age();

-- Add updated_at trigger for children
CREATE TRIGGER update_children_updated_at
  BEFORE UPDATE ON children
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_children_parent ON children(parent_id);
CREATE INDEX IF NOT EXISTS idx_children_family ON children(family_id);
CREATE INDEX IF NOT EXISTS idx_children_names ON children(first_name, last_name);

-- Enable RLS
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

-- RLS Policies for children table
CREATE POLICY "Users can view children they created"
  ON children FOR SELECT
  TO authenticated
  USING (
    parent_id IN (
      SELECT id FROM individuals 
      WHERE created_by = auth.uid()
    )
    OR 
    EXISTS (
      SELECT 1 FROM families f
      WHERE f.id = family_id
      AND f.created_by = auth.uid()
    )
  );

CREATE POLICY "Users can insert children they create"
  ON children FOR INSERT
  TO authenticated
  WITH CHECK (
    parent_id IN (
      SELECT id FROM individuals 
      WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update children they created"
  ON children FOR UPDATE
  TO authenticated
  USING (
    parent_id IN (
      SELECT id FROM individuals 
      WHERE created_by = auth.uid()
    )
  )
  WITH CHECK (
    parent_id IN (
      SELECT id FROM individuals 
      WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can delete children they created"
  ON children FOR DELETE
  TO authenticated
  USING (
    parent_id IN (
      SELECT id FROM individuals 
      WHERE created_by = auth.uid()
    )
  );

-- Create function to add child with family creation if needed
CREATE OR REPLACE FUNCTION add_child_with_family(
  p_child_data JSONB,
  p_parent_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_family_id UUID;
  v_child_id UUID;
BEGIN
  -- Get existing family or create new one
  SELECT family_id INTO v_family_id
  FROM individuals
  WHERE id = p_parent_id;
  
  IF v_family_id IS NULL THEN
    INSERT INTO families (name, status)
    VALUES (
      (SELECT last_name FROM individuals WHERE id = p_parent_id) || ' Family',
      'green'
    )
    RETURNING id INTO v_family_id;
    
    -- Update parent's family_id
    UPDATE individuals
    SET family_id = v_family_id
    WHERE id = p_parent_id;
  END IF;
  
  -- Insert child
  INSERT INTO children (
    first_name,
    last_name,
    date_of_birth,
    gender,
    school_stage,
    description,
    parent_id,
    family_id
  )
  VALUES (
    p_child_data->>'first_name',
    p_child_data->>'last_name',
    (p_child_data->>'date_of_birth')::DATE,
    p_child_data->>'gender',
    p_child_data->>'school_stage',
    p_child_data->>'description',
    p_parent_id,
    v_family_id
  )
  RETURNING id INTO v_child_id;
  
  RETURN v_child_id;
END;
$$;

-- Create function to add additional family member
CREATE OR REPLACE FUNCTION add_additional_member(
  p_individual_id UUID,
  p_member_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_members JSONB;
BEGIN
  -- Get current additional_members
  SELECT COALESCE(additional_members, '[]'::jsonb)
  INTO v_current_members
  FROM individuals
  WHERE id = p_individual_id;
  
  -- Add new member to array
  UPDATE individuals
  SET additional_members = v_current_members || p_member_data
  WHERE id = p_individual_id
  RETURNING additional_members INTO v_current_members;
  
  RETURN v_current_members;
END;
$$;

-- Add comments
COMMENT ON TABLE children IS 'Stores children records with relationships to parents and families';
COMMENT ON FUNCTION add_child_with_family IS 'Adds a child record and creates/updates family relationships';
COMMENT ON FUNCTION add_additional_member IS 'Adds a non-child family member to the individual''s additional_members JSON array';