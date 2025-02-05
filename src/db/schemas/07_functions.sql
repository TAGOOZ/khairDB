-- Function to move an individual to the whitelist
    CREATE OR REPLACE FUNCTION move_individual_to_whitelist(
      p_individual_id UUID,
      p_data JSONB
    )
    RETURNS UUID
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
      v_individual_id UUID;
    BEGIN
      -- Update individuals table
      UPDATE individuals
      SET
        first_name = p_data->>'first_name',
        last_name = p_data->>'last_name',
        id_number = p_data->>'id_number',
        date_of_birth = (p_data->>'date_of_birth')::DATE,
        gender = p_data->>'gender',
        marital_status = p_data->>'marital_status',
        phone = p_data->>'phone',
        address = p_data->>'address',
        family_id = (p_data->>'family_id')::UUID,
        district = p_data->>'district',
        description = p_data->>'description',
        job = p_data->>'job',
        employment_status = p_data->>'employment_status',
        salary = (p_data->>'salary')::DECIMAL,
        list_status = 'whitelist'
      WHERE id = p_individual_id
      RETURNING id INTO v_individual_id;
    
      -- Update needs table
      UPDATE needs
      SET individual_id = v_individual_id
      WHERE individual_id = p_individual_id;
    
      RETURN v_individual_id;
    END;
    $$;
    
    -- Function to move an individual to the blacklist
    CREATE OR REPLACE FUNCTION move_individual_to_blacklist(
      p_individual_id UUID,
      p_data JSONB
    )
    RETURNS UUID
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
      v_individual_id UUID;
    BEGIN
      -- Update individuals table
      UPDATE individuals
      SET
        first_name = p_data->>'first_name',
        last_name = p_data->>'last_name',
        id_number = p_data->>'id_number',
        date_of_birth = (p_data->>'date_of_birth')::DATE,
        gender = p_data->>'gender',
        marital_status = p_data->>'marital_status',
        phone = p_data->>'phone',
        address = p_data->>'address',
        family_id = (p_data->>'family_id')::UUID,
        district = p_data->>'district',
        description = p_data->>'description',
        job = p_data->>'job',
        employment_status = p_data->>'employment_status',
        salary = (p_data->>'salary')::DECIMAL,
        list_status = 'blacklist'
      WHERE id = p_individual_id
      RETURNING id INTO v_individual_id;
    
      -- Update needs table
      UPDATE needs
      SET individual_id = v_individual_id
      WHERE individual_id = p_individual_id;
    
      RETURN v_individual_id;
    END;
    $$;
    
    -- Function to move an individual to the waitinglist
    CREATE OR REPLACE FUNCTION move_individual_to_waitinglist(
      p_individual_id UUID,
      p_data JSONB
    )
    RETURNS UUID
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
      v_individual_id UUID;
    BEGIN
      -- Update individuals table
      UPDATE individuals
      SET
        first_name = p_data->>'first_name',
        last_name = p_data->>'last_name',
        id_number = p_data->>'id_number',
        date_of_birth = (p_data->>'date_of_birth')::DATE,
        gender = p_data->>'gender',
        marital_status = p_data->>'marital_status',
        phone = p_data->>'phone',
        address = p_data->>'address',
        family_id = (p_data->>'family_id')::UUID,
        district = p_data->>'district',
        description = p_data->>'description',
        job = p_data->>'job',
        employment_status = p_data->>'employment_status',
        salary = (p_data->>'salary')::DECIMAL,
        list_status = 'waitinglist'
      WHERE id = p_individual_id
      RETURNING id INTO v_individual_id;
    
      -- Update needs table
      UPDATE needs
      SET individual_id = v_individual_id
      WHERE individual_id = p_individual_id;
    
      RETURN v_individual_id;
    END;
    $$;
