import { createClient } from '@supabase/supabase-js';
import config from '../config/env.js';

/**
 * Supabase client for accessibility schema
 * Used for sites and site_configs tables
 */
const supabase = createClient(
    config.supabase.url,
    config.supabase.serviceRoleKey || config.supabase.anonKey,
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
        db: {
            schema: 'accessibility', // Use accessibility schema
        },
    }
);

/**
 * Supabase client for public schema
 * Used for api_keys, users, and other public tables
 */
export const supabasePublic = createClient(
    config.supabase.url,
    config.supabase.serviceRoleKey || config.supabase.anonKey,
    {
        auth: {
            persistSession: false,
            autoRefreshToken: false,
        },
        db: {
            schema: 'public', // Use public schema
        },
    }
);

export default supabase;
