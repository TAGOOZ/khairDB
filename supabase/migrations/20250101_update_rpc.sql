-- Update create_distribution_transaction to include p_status
CREATE OR REPLACE FUNCTION create_distribution_transaction(
  p_description TEXT,
  p_date DATE,
  p_aid_type TEXT,
  p_quantity NUMERIC,
  p_value NUMERIC,
  p_recipients JSONB,
  p_status TEXT DEFAULT 'completed'
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_distribution_id UUID;
  v_recipient JSONB;
  v_total_recipients INTEGER;
BEGIN
  -- Create distribution record
  INSERT INTO distributions (
    date,
    aid_type,
    description,
    quantity,
    value,
    status
  ) VALUES (
    p_date,
    p_aid_type,
    p_description,
    p_quantity,
    p_value,
    p_status
  )
  RETURNING id INTO v_distribution_id;

  -- Process recipients
  FOR v_recipient IN SELECT * FROM jsonb_array_elements(p_recipients)
  LOOP
    INSERT INTO distribution_recipients (
      distribution_id,
      individual_id,
      child_id,
      quantity_received,
      value_received,
      notes
    ) VALUES (
      v_distribution_id,
      (v_recipient->>'individual_id')::UUID,
      (v_recipient->>'child_id')::UUID,
      (v_recipient->>'quantity_received')::NUMERIC,
      (v_recipient->>'value_received')::NUMERIC,
      v_recipient->>'notes'
    );
  END LOOP;

  RETURN jsonb_build_object(
    'id', v_distribution_id,
    'status', 'success'
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Transaction failed: %', SQLERRM;
END;
$$;
