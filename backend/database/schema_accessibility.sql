-- Database Schema for Accessibility API Hub
-- Run this in Supabase SQL Editor

-- 1. Sites table (stores registered sites)
CREATE TABLE IF NOT EXISTS public.sites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sites_site_id ON public.sites(site_id);
CREATE INDEX IF NOT EXISTS idx_sites_user_id ON public.sites(user_id);

-- 2. Site Configs table (stores accessibility configuration per site)
CREATE TABLE IF NOT EXISTS public.site_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  site_id TEXT UNIQUE NOT NULL REFERENCES public.sites(site_id) ON DELETE CASCADE,
  cursor_mode_enabled BOOLEAN DEFAULT false,
  cursor_speed INTEGER DEFAULT 10,
  scroll_speed INTEGER DEFAULT 10,
  accessibility_profile TEXT DEFAULT 'standard',
  enter_hold_ms INTEGER DEFAULT 1000,
  exit_hold_ms INTEGER DEFAULT 800,
  click_cooldown_ms INTEGER DEFAULT 300,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_configs_site_id ON public.site_configs(site_id);

-- 3. Enable Row Level Security
ALTER TABLE public.sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_configs ENABLE ROW LEVEL SECURITY;

-- 4. Policies for sites table
CREATE POLICY "Service role can manage all sites" ON public.sites
  FOR ALL USING (true);

CREATE POLICY "Users can manage their own sites" ON public.sites
  FOR ALL USING (auth.uid() = user_id);

-- 5. Policies for site_configs table
CREATE POLICY "Service role can manage all configs" ON public.site_configs
  FOR ALL USING (true);

CREATE POLICY "Users can manage configs for their sites" ON public.site_configs
  FOR ALL USING (
    site_id IN (
      SELECT site_id FROM public.sites WHERE user_id = auth.uid()
    )
  );

-- 6. Add comments
COMMENT ON TABLE public.sites IS 'Registered websites using the accessibility API';
COMMENT ON TABLE public.site_configs IS 'Accessibility configuration for each site';

-- 7. Insert test data (optional - update user_id to match your test user)
INSERT INTO public.sites (site_id, user_id, name)
VALUES 
  ('demo-site', 'd74df522-1750-4b94-954f-5898f6b0a72d', 'Demo Website'),
  ('second-site', 'd74df522-1750-4b94-954f-5898f6b0a72d', 'Second Website')
ON CONFLICT (site_id) DO NOTHING;

INSERT INTO public.site_configs (site_id, cursor_mode_enabled, cursor_speed, scroll_speed, accessibility_profile)
VALUES 
  ('demo-site', true, 12, 15, 'standard'),
  ('second-site', false, 10, 10, 'high_contrast')
ON CONFLICT (site_id) DO NOTHING;
