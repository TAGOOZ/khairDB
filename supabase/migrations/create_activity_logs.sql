-- Activity Logs Table for monitoring user activity ("who did what")
-- Run this migration in Supabase SQL Editor

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_email TEXT,
  user_name TEXT,
  action TEXT NOT NULL,  -- 'create', 'update', 'delete', 'approve', 'reject', 'login', 'logout'
  entity_type TEXT NOT NULL,  -- 'individual', 'family', 'distribution', 'request', 'user'
  entity_id UUID,
  entity_name TEXT,  -- Human-readable name of affected entity
  details JSONB,  -- Additional context (old values, new values, etc.)
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity_type ON public.activity_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Admins can read all logs
CREATE POLICY "Admins can read all logs" ON public.activity_logs
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Users can only see their own actions
CREATE POLICY "Users can see their own logs" ON public.activity_logs
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- Anyone authenticated can insert logs (their own actions)
CREATE POLICY "Users can insert their own logs" ON public.activity_logs
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Grant permissions
GRANT SELECT, INSERT ON public.activity_logs TO authenticated;
