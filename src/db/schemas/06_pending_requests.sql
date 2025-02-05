-- Pending requests table
    CREATE TABLE IF NOT EXISTS pending_requests (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        type TEXT NOT NULL CHECK (type IN ('individual', 'family', 'need')),
        data JSONB NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        submitted_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        submitted_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        reviewed_by UUID REFERENCES auth.users(id),
        reviewed_at TIMESTAMPTZ,
        admin_comment TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        version INTEGER NOT NULL DEFAULT 1,
        original_request_id UUID REFERENCES pending_requests(id),
        previous_version_id UUID REFERENCES pending_requests(id)
    );
    
    -- Create trigger for updated_at
    CREATE TRIGGER update_pending_requests_updated_at
        BEFORE UPDATE ON pending_requests
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    
    -- Enable RLS on pending_requests table
    ALTER TABLE pending_requests ENABLE ROW LEVEL SECURITY;
    
    -- Pending requests table policies
    CREATE POLICY "Users can view their own requests"
      ON pending_requests FOR SELECT
      TO authenticated
      USING (
        submitted_by = auth.uid() OR
        is_admin()
      );
    
    CREATE POLICY "Users can create pending requests"
      ON pending_requests FOR INSERT
      TO authenticated
      WITH CHECK (
        submitted_by = auth.uid()
        AND status = 'pending'
        AND reviewed_by IS NULL
        AND reviewed_at IS NULL
      );
    
    CREATE POLICY "Users can update their pending requests"
      ON pending_requests FOR UPDATE
      TO authenticated
      USING (
        (submitted_by = auth.uid() AND status = 'pending') OR
        is_admin()
      );
    
    CREATE POLICY "Users can delete their pending requests"
      ON pending_requests FOR DELETE
      TO authenticated
      USING (
        submitted_by = auth.uid() AND
        status = 'pending'
      );
    
    -- Admins can update any request (for approvals/rejections)
    CREATE POLICY "Admins can update any request"
      ON pending_requests FOR UPDATE
      TO authenticated
      USING (is_admin());
    
    -- Add comment
    COMMENT ON TABLE pending_requests IS 'Pending requests requiring admin approval';
