-- Migration: Add transaction support functions
-- Date: 2025-02-09
-- Description: Adds RPC functions to handle complex mutational operations atomically.

-- 1. Family Transactions

CREATE OR REPLACE FUNCTION create_family_transaction(
  p_name text,
  p_status text,
  p_district text,
  p_phone text,
  p_address text,
  p_members jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_family_id uuid;
  v_family_record jsonb;
  v_member jsonb;
BEGIN
  -- Create family
  INSERT INTO families (name, status, district, phone, address)
  VALUES (p_name, p_status, p_district, p_phone, p_address)
  RETURNING id INTO v_family_id;

  -- Insert members
  FOR v_member IN SELECT * FROM jsonb_array_elements(p_members)
  LOOP
    INSERT INTO family_members (family_id, individual_id, role)
    VALUES (v_family_id, (v_member->>'id')::uuid, v_member->>'role');
  END LOOP;

  -- Return the created family (simplified return, caller can fetch full details if needed, but we try to match what select returns)
  -- BUT to match the TS service expectation of returning the full object immediately, we can do a select here.
  SELECT jsonb_build_object(
    'id', f.id,
    'name', f.name,
    'status', f.status,
    'district', f.district,
    'phone', f.phone,
    'address', f.address,
    'created_at', f.created_at,
    'updated_at', f.updated_at
  ) INTO v_family_record
  FROM families f
  WHERE f.id = v_family_id;

  RETURN v_family_record;
END;
$$;

CREATE OR REPLACE FUNCTION update_family_transaction(
  p_id uuid,
  p_name text,
  p_status text,
  p_district text,
  p_phone text,
  p_address text,
  p_members jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_family_record jsonb;
  v_member jsonb;
BEGIN
  -- Update family
  UPDATE families
  SET
    name = p_name,
    status = p_status,
    district = p_district,
    phone = p_phone,
    address = p_address,
    updated_at = NOW()
  WHERE id = p_id;

  -- Delete existing members
  DELETE FROM family_members WHERE family_id = p_id;

  -- Insert new members
  FOR v_member IN SELECT * FROM jsonb_array_elements(p_members)
  LOOP
    INSERT INTO family_members (family_id, individual_id, role)
    VALUES (p_id, (v_member->>'id')::uuid, v_member->>'role');
  END LOOP;

  SELECT jsonb_build_object(
    'id', f.id,
    'name', f.name,
    'status', f.status,
    'district', f.district,
    'phone', f.phone,
    'address', f.address,
    'created_at', f.created_at,
    'updated_at', f.updated_at
  ) INTO v_family_record
  FROM families f
  WHERE f.id = p_id;

  RETURN v_family_record;
END;
$$;

CREATE OR REPLACE FUNCTION delete_family_transaction(p_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Unlink individuals (set family_id to null)
  UPDATE individuals SET family_id = NULL WHERE family_id = p_id;

  -- Delete children
  DELETE FROM children WHERE family_id = p_id;

  -- Delete family members
  DELETE FROM family_members WHERE family_id = p_id;

  -- Delete family
  DELETE FROM families WHERE id = p_id;
END;
$$;


-- 2. Distribution Transactions

CREATE OR REPLACE FUNCTION create_distribution_transaction(
  p_description text,
  p_date timestamptz,
  p_aid_type text,
  p_quantity numeric,
  p_value numeric,
  p_recipients jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_distribution_id uuid;
  v_distribution_record jsonb;
  v_recipient jsonb;
BEGIN
  -- Create distribution
  INSERT INTO distributions (description, date, aid_type, quantity, value, status, created_at)
  VALUES (p_description, p_date, p_aid_type, p_quantity, p_value, 'in_progress', NOW())
  RETURNING id INTO v_distribution_id;

  -- Insert recipients
  FOR v_recipient IN SELECT * FROM jsonb_array_elements(p_recipients)
  LOOP
    INSERT INTO distribution_recipients (
      distribution_id,
      individual_id,
      child_id,
      quantity_received,
      value_received,
      notes
    )
    VALUES (
      v_distribution_id,
      (v_recipient->>'individual_id')::uuid,
      (v_recipient->>'child_id')::uuid,
      (v_recipient->>'quantity_received')::numeric,
      (v_recipient->>'value_received')::numeric,
      v_recipient->>'notes'
    );
  END LOOP;

  SELECT to_jsonb(d.*) INTO v_distribution_record
  FROM distributions d
  WHERE d.id = v_distribution_id;

  RETURN v_distribution_record;
END;
$$;

CREATE OR REPLACE FUNCTION update_distribution_transaction(
  p_id uuid,
  p_date timestamptz,
  p_aid_type text,
  p_description text,
  p_quantity numeric,
  p_value numeric,
  p_recipients jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_distribution_record jsonb;
  v_recipient jsonb;
BEGIN
  -- Update distribution
  UPDATE distributions
  SET
    date = p_date,
    aid_type = p_aid_type,
    description = p_description,
    quantity = p_quantity,
    value = p_value
  WHERE id = p_id;

  -- Delete existing recipients
  DELETE FROM distribution_recipients WHERE distribution_id = p_id;

  -- Insert new recipients
  FOR v_recipient IN SELECT * FROM jsonb_array_elements(p_recipients)
  LOOP
    INSERT INTO distribution_recipients (
      distribution_id,
      individual_id,
      child_id,
      quantity_received,
      value_received,
      notes
    )
    VALUES (
      p_id,
      (v_recipient->>'individual_id')::uuid,
      (v_recipient->>'child_id')::uuid,
      (v_recipient->>'quantity_received')::numeric,
      (v_recipient->>'value_received')::numeric,
      v_recipient->>'notes'
    );
  END LOOP;

  SELECT to_jsonb(d.*) INTO v_distribution_record
  FROM distributions d
  WHERE d.id = p_id;

  RETURN v_distribution_record;
END;
$$;

-- 3. Individual Transaction (Complex Creation)

CREATE OR REPLACE FUNCTION create_individual_transaction(
  p_individual_data jsonb,
  p_family_id uuid,
  p_new_family_name text,
  p_district text,    -- Needed for family creation if needed
  p_phone text,       -- Needed for family creation if needed
  p_address text,     -- Needed for family creation if needed
  p_children jsonb,
  p_assistance_details jsonb,
  p_created_by uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_family_id uuid := p_family_id;
  v_individual_id uuid;
  v_individual_record jsonb;
  v_child jsonb;
  v_assistance jsonb;
BEGIN
  -- Create family if needed
  IF v_family_id IS NULL AND p_new_family_name IS NOT NULL THEN
    INSERT INTO families (name, district, phone, address, status)
    VALUES (p_new_family_name, p_district, p_phone, p_address, 'green')
    RETURNING id INTO v_family_id;
  END IF;

  -- Create individual
  INSERT INTO individuals (
    first_name, last_name, id_number, date_of_birth, gender, marital_status,
    phone, address, district, description, job, employment_status, salary,
    list_status, family_id, additional_members, created_by
  )
  VALUES (
    p_individual_data->>'first_name',
    p_individual_data->>'last_name',
    p_individual_data->>'id_number',
    (p_individual_data->>'date_of_birth')::date,
    p_individual_data->>'gender',
    p_individual_data->>'marital_status',
    p_individual_data->>'phone',
    p_individual_data->>'address',
    p_individual_data->>'district',
    p_individual_data->>'description',
    p_individual_data->>'job',
    p_individual_data->>'employment_status',
    (p_individual_data->>'salary')::numeric,
    p_individual_data->>'list_status',
    v_family_id,
    p_individual_data->'additional_members',
    p_created_by
  )
  RETURNING id INTO v_individual_id;

  -- Add to family_members if family exists
  IF v_family_id IS NOT NULL THEN
    INSERT INTO family_members (family_id, individual_id, role)
    VALUES (v_family_id, v_individual_id, 'parent');
  END IF;

  -- Create children
  IF p_children IS NOT NULL THEN
    FOR v_child IN SELECT * FROM jsonb_array_elements(p_children)
    LOOP
      INSERT INTO children (
        first_name, last_name, date_of_birth, gender, school_stage, description,
        parent_id, family_id
      )
      VALUES (
        v_child->>'first_name',
        v_child->>'last_name',
        (v_child->>'date_of_birth')::date,
        v_child->>'gender',
        v_child->>'school_stage',
        v_child->>'description',
        v_individual_id,
        v_family_id
      );
    END LOOP;
  END IF;

  -- Create assistance details
  IF p_assistance_details IS NOT NULL THEN
    FOR v_assistance IN SELECT * FROM jsonb_array_elements(p_assistance_details)
    LOOP
      INSERT INTO assistance_details (
        individual_id, assistance_type, details
      )
      VALUES (
        v_individual_id,
        v_assistance->>'assistance_type',
        v_assistance->'details'
      );
    END LOOP;
  END IF;

  SELECT to_jsonb(i.*) INTO v_individual_record
  FROM individuals i
  WHERE i.id = v_individual_id;

  RETURN v_individual_record;
END;
$$;
