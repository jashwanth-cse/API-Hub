-- API Keys Table Schema
-- This table stores API keys for authentication

CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL,
  name TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_used_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Optional: Add foreign key constraint if you have a users table
  -- CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Create index for faster API key lookups
CREATE INDEX IF NOT EXISTS idx_api_keys_api_key ON public.api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON public.api_keys(is_active);

-- Enable Row Level Security (optional, adjust based on your needs)
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow service role to manage all keys
CREATE POLICY "Service role can manage all api keys" ON public.api_keys
  FOR ALL USING (true);

-- Optional: Policy to allow users to view their own keys
-- CREATE POLICY "Users can view their own api keys" ON public.api_keys
--   FOR SELECT USING (auth.uid() = user_id);

-- Example: Insert a test API key
-- Replace 'your-test-user-uuid' with an actual user ID
INSERT INTO public.api_keys (api_key, user_id, name, is_active)
VALUES 
  ('6b5ef619bc4212854b7b506839fe960cbdca45ba602d9ac1bce511f37e5eaf86', 'your-test-user-uuid', 'Development Key', true)
ON CONFLICT (api_key) DO NOTHING;

COMMENT ON TABLE public.api_keys IS 'Stores API keys for third-party authentication';
COMMENT ON COLUMN public.api_keys.api_key IS 'The actual API key (should be securely generated)';
COMMENT ON COLUMN public.api_keys.user_id IS 'The user this API key belongs to';
COMMENT ON COLUMN public.api_keys.is_active IS 'Whether the API key is currently active';
COMMENT ON COLUMN public.api_keys.last_used_at IS 'Last time this API key was used for authentication';
