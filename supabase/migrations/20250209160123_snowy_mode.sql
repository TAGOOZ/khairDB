-- Drop existing functions first
DROP FUNCTION IF EXISTS create_individual_with_children(JSONB, JSONB);
DROP FUNCTION IF EXISTS update_individual_with_children(UUID, JSONB, JSONB);

-- Function to add child with family
CREATE OR REPLACE FUNCTION add_child_with_family(
  p_parent_id UUID,
  p_child_data JSONB
) RETURNS UUID
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
    
    -- Add parent to family_members
    INSERT INTO family_members (family_id, individual_id, role)
    VALUES (v_family_id, p_parent_id, 'parent');
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
    family_id,
    created_by
  )
  VALUES (
    p_child_data->>'first_name',
    p_child_data->>'last_name',
    (p_child_data->>'date_of_birth')::DATE,
    p_child_data->>'gender',
    p_child_data->>'school_stage',
    p_child_data->>'description',
    p_parent_id,
    v_family_id,
    auth.uid()
  )
  RETURNING id INTO v_child_id;
  
  -- Add child to family_members
  INSERT INTO family_members (family_id, individual_id, role)
  VALUES (v_family_id, v_child_id, 'child');
  
  RETURN v_child_id;
END;
$$;

-- Function to check child age
CREATE OR REPLACE FUNCTION check_child_age()
RETURNS TRIGGER AS $$
BEGIN
  IF (EXTRACT(YEAR FROM age(NEW.date_of_birth)) >= 18) THEN
    RAISE EXCEPTION 'Child must be under 18 years old';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create individual with children
CREATE OR REPLACE FUNCTION create_individual_with_children(
  p_individual_data JSONB,
  p_children_data JSONB DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_individual_id UUID;
  v_family_id UUID;
  child_record JSONB;
  v_child_id UUID;
BEGIN
  -- Create new family if needed
  IF p_children_data IS NOT NULL AND jsonb_array_length(p_children_data) > 0 THEN
    INSERT INTO families (
      name, 
      status,
      district,
      phone,
      address
    ) VALUES (
      p_individual_data->>'last_name' || ' Family',
      'green',
      p_individual_data->>'district',
      p_individual_data->>'phone',
      p_individual_data->>'address'
    )
    RETURNING id INTO v_family_id;
  END IF;

  -- Insert individual
  INSERT INTO individuals (
    first_name, last_name, id_number, date_of_birth, gender,
    marital_status, phone, address, district, employment_status,
    salary, list_status, created_by, family_id
  ) VALUES (
    p_individual_data->>'first_name',
    p_individual_data->>'last_name',
    p_individual_data->>'id_number',
    (p_individual_data->>'date_of_birth')::DATE,
    p_individual_data->>'gender',
    p_individual_data->>'marital_status',
    p_individual_data->>'phone',
    p_individual_data->>'address',
    p_individual_data->>'district',
    p_individual_data->>'employment_status',
    (p_individual_data->>'salary')::NUMERIC,
    p_individual_data->>'list_status',
    auth.uid(),
    v_family_id
  )
  RETURNING id INTO v_individual_id;

  -- Add parent to family_members if family was created
  IF v_family_id IS NOT NULL THEN
    INSERT INTO family_members (family_id, individual_id, role)
    VALUES (v_family_id, v_individual_id, 'parent');
  END IF;

  -- Insert children if provided
  IF p_children_data IS NOT NULL AND jsonb_array_length(p_children_data) > 0 THEN
    FOR child_record IN SELECT * FROM jsonb_array_elements(p_children_data)
    LOOP
      INSERT INTO children (
        first_name,
        last_name,
        date_of_birth,
        gender,
        school_stage,
        description,
        parent_id,
        family_id,
        created_by
      ) VALUES (
        child_record->>'first_name',
        child_record->>'last_name',
        (child_record->>'date_of_birth')::DATE,
        child_record->>'gender',
        child_record->>'school_stage',
        child_record->>'description',
        v_individual_id,
        v_family_id,
        auth.uid()
      )
      RETURNING id INTO v_child_id;

      -- Add child to family_members
      INSERT INTO family_members (family_id, individual_id, role)
      VALUES (v_family_id, v_child_id, 'child');
    END LOOP;
  END IF;

  RETURN v_individual_id;
END;
$$;

-- Function to update individual with children
CREATE OR REPLACE FUNCTION update_individual_with_children(
  p_individual_id UUID,
  p_individual_data JSONB,
  p_children_data JSONB DEFAULT '[]'::JSONB
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_individual_id UUID;
  v_family_id UUID;
  v_child_record JSONB;
  v_child_id UUID;
BEGIN
  -- Create new family if needed
  IF jsonb_array_length(p_children_data) > 0 AND 
     NOT EXISTS (SELECT 1 FROM individuals WHERE id = p_individual_id AND family_id IS NOT NULL) THEN
    INSERT INTO families (
      name, 
      status,
      district,
      phone,
      address
    ) VALUES (
      p_individual_data->>'last_name' || ' Family',
      'green',
      p_individual_data->>'district',
      p_individual_data->>'phone',
      p_individual_data->>'address'
    )
    RETURNING id INTO v_family_id;
  END IF;

  -- Update individual
  UPDATE individuals
  SET
    first_name = p_individual_data->>'first_name',
    last_name = p_individual_data->>'last_name',
    id_number = p_individual_data->>'id_number',
    date_of_birth = (p_individual_data->>'date_of_birth')::DATE,
    gender = p_individual_data->>'gender',
    marital_status = p_individual_data->>'marital_status',
    phone = p_individual_data->>'phone',
    address = p_individual_data->>'address',
    family_id = COALESCE(v_family_id, family_id),
    district = p_individual_data->>'district',
    description = p_individual_data->>'description',
    job = p_individual_data->>'job',
    employment_status = p_individual_data->>'employment_status',
    salary = (p_individual_data->>'salary')::DECIMAL,
    list_status = COALESCE(p_individual_data->>'list_status', 'whitelist'),
    additional_members = COALESCE(p_individual_data->'additional_members', '[]'::JSONB)
  WHERE id = p_individual_id
  RETURNING id, family_id INTO v_individual_id, v_family_id;

  -- Add parent to family_members if new family was created
  IF v_family_id IS NOT NULL AND 
     NOT EXISTS (SELECT 1 FROM family_members WHERE family_id = v_family_id AND individual_id = v_individual_id) THEN
    INSERT INTO family_members (family_id, individual_id, role)
    VALUES (v_family_id, v_individual_id, 'parent');
  END IF;

  -- Delete existing children
  DELETE FROM children WHERE parent_id = p_individual_id;

  -- Insert new children if any
  IF jsonb_array_length(p_children_data) > 0 THEN
    FOR v_child_record IN SELECT * FROM jsonb_array_elements(p_children_data)
    LOOP
      INSERT INTO children (
        parent_id,
        first_name,
        last_name,
        date_of_birth,
        gender,
        school_stage,
        description,
        family_id,
        created_by
      )
      VALUES (
        v_individual_id,
        v_child_record->>'first_name',
        v_child_record->>'last_name',
        (v_child_record->>'date_of_birth')::DATE,
        v_child_record->>'gender',
        v_child_record->>'school_stage',
        v_child_record->>'description',
        v_family_id,
        auth.uid()
      )
      RETURNING id INTO v_child_id;

      -- Add child to family_members
      INSERT INTO family_members (family_id, individual_id, role)
      VALUES (v_family_id, v_child_id, 'child');
    END LOOP;
  END IF;

  RETURN v_individual_id;
END;
$$;
