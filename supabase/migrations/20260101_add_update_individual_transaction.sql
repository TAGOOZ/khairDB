-- Migration: Add update_individual_transaction function
-- Date: 2026-01-01
-- Description: Adds RPC function to handle updating individuals atomically.

CREATE OR REPLACE FUNCTION update_individual_transaction(
  p_individual_id uuid,
  p_data jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_family_id uuid;
  v_individual_record jsonb;
  v_child jsonb;
  v_assistance jsonb;
  v_existing_children uuid[];
  v_new_child_ids text[];
BEGIN
  -- Get existing family_id or create new family if needed
  IF (p_data->>'new_family_name') IS NOT NULL AND (p_data->>'new_family_name') != '' THEN
    INSERT INTO families (name, district, phone, address, status)
    VALUES (
      p_data->>'new_family_name',
      p_data->>'district',
      p_data->>'phone',
      p_data->>'address',
      'green'
    )
    RETURNING id INTO v_family_id;
  ELSE
    v_family_id := (p_data->>'family_id')::uuid;
  END IF;

  -- Update individual
  UPDATE individuals
  SET
    first_name = p_data->>'first_name',
    last_name = p_data->>'last_name',
    id_number = p_data->>'id_number',
    date_of_birth = (p_data->>'date_of_birth')::date,
    gender = p_data->>'gender',
    marital_status = p_data->>'marital_status',
    phone = p_data->>'phone',
    address = p_data->>'address',
    district = p_data->>'district',
    description = p_data->>'description',
    job = p_data->>'job',
    employment_status = p_data->>'employment_status',
    salary = (p_data->>'salary')::numeric,
    list_status = p_data->>'list_status',
    family_id = v_family_id,
    additional_members = p_data->'additional_members',
    updated_at = NOW()
  WHERE id = p_individual_id;

  -- Update family_members if family changed
  IF v_family_id IS NOT NULL THEN
    -- Remove from old family_members if any
    DELETE FROM family_members WHERE individual_id = p_individual_id;
    
    -- Add to new family
    INSERT INTO family_members (family_id, individual_id, role)
    VALUES (v_family_id, p_individual_id, 'parent')
    ON CONFLICT (family_id, individual_id) DO NOTHING;
  END IF;

  -- Handle children updates
  -- Get list of existing children for this parent
  SELECT array_agg(id) INTO v_existing_children
  FROM children
  WHERE parent_id = p_individual_id;

  -- Collect new child IDs from the data
  SELECT array_agg(value->>'id')
  INTO v_new_child_ids
  FROM jsonb_array_elements(COALESCE(p_data->'children', '[]'::jsonb));

  -- Delete children that are no longer in the list
  IF v_existing_children IS NOT NULL THEN
    DELETE FROM children
    WHERE parent_id = p_individual_id
      AND id != ALL(
        SELECT (value->>'id')::uuid
        FROM jsonb_array_elements(COALESCE(p_data->'children', '[]'::jsonb))
        WHERE value->>'id' IS NOT NULL AND value->>'id' != ''
      );
  END IF;

  -- Upsert children
  IF p_data->'children' IS NOT NULL THEN
    FOR v_child IN SELECT * FROM jsonb_array_elements(p_data->'children')
    LOOP
      IF (v_child->>'id') IS NOT NULL AND (v_child->>'id') != '' THEN
        -- Update existing child
        UPDATE children
        SET
          first_name = v_child->>'first_name',
          last_name = v_child->>'last_name',
          date_of_birth = (v_child->>'date_of_birth')::date,
          gender = v_child->>'gender',
          school_stage = v_child->>'school_stage',
          description = v_child->>'description',
          family_id = v_family_id
        WHERE id = (v_child->>'id')::uuid;
      ELSE
        -- Insert new child
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
          p_individual_id,
          v_family_id
        );
      END IF;
    END LOOP;
  END IF;

  -- Handle assistance_details updates
  -- Delete existing assistance details for this individual
  DELETE FROM assistance_details WHERE individual_id = p_individual_id;

  -- Insert new assistance details
  IF p_data->'assistance_details' IS NOT NULL THEN
    FOR v_assistance IN SELECT * FROM jsonb_array_elements(p_data->'assistance_details')
    LOOP
      INSERT INTO assistance_details (
        individual_id, assistance_type, details
      )
      VALUES (
        p_individual_id,
        v_assistance->>'assistance_type',
        v_assistance->'details'
      );
    END LOOP;
  END IF;

  -- Return updated individual
  SELECT to_jsonb(i.*) INTO v_individual_record
  FROM individuals i
  WHERE i.id = p_individual_id;

  RETURN v_individual_record;
END;
$$;
