-- Migration to cleanup legacy dangerous functions
-- These functions contain "delete-then-reinsert" logic which is unsafe.
-- They have been replaced by RPC transactions.

DROP FUNCTION IF EXISTS public.create_individual_with_children(JSONB, JSONB);
DROP FUNCTION IF EXISTS public.update_individual_with_children(UUID, JSONB, JSONB);
DROP FUNCTION IF EXISTS public.add_child_with_family(UUID, JSONB);

-- We keep utility functions like check_child_age as they are still useful
