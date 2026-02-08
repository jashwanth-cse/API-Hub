import supabase from '../db/supabaseClient.js';

/**
 * Accessibility Service - Handles site and configuration resolution
 * 
 * Database Schema:
 * - accessibility.sites (id: UUID PK, site_id: TEXT UNIQUE, user_id: UUID FK)
 * - accessibility.site_configs (id: UUID PK, site_id: TEXT FK -> sites.site_id)
 * 
 * Important: site_configs.site_id references sites.site_id (TEXT), NOT sites.id (UUID)
 */
class AccessibilityService {
    /**
     * Fetch or create accessibility configuration for a site
     * 
     * @param {string} siteId - The site identifier (string, referenced across tables)
     * @param {string} userId - The user UUID from authentication
     * @returns {Promise<Object>} Result object with success status and data
     */
    async getConfigBySiteId(siteId, userId) {
        try {
            // Validate inputs
            if (!siteId || typeof siteId !== 'string') {
                throw new Error('Invalid siteId: must be a non-empty string');
            }

            if (!userId) {
                throw new Error('Invalid userId: user authentication required');
            }

            // STEP 1: Resolve Site (get or create) - returns UUID
            const siteUuid = await this._resolveSite(siteId, userId);

            // STEP 2: Resolve Site Config (get or create) - uses UUID
            const config = await this._resolveSiteConfig(siteUuid, siteId);

            // STEP 3: Return normalized response
            return {
                success: true,
                data: {
                    site_id: siteId,
                    config: this._normalizeConfig(config),
                },
            };
        } catch (error) {
            console.error('Error in getConfigBySiteId:', error);
            return {
                success: false,
                error: error.message || 'Failed to fetch site configuration',
            };
        }
    }

    /**
     * Resolve site: fetch existing or create new
     * 
     * @private
     * @param {string} siteId - Site identifier (string)
     * @param {string} userId - User UUID
     * @returns {Promise<string>} Site UUID (primary key)
     */
    async _resolveSite(siteId, userId) {
        try {
            // Query accessibility.sites for existing site
            const { data: existingSite, error: fetchError } = await supabase
                .from('sites')
                .select('id, site_id')
                .eq('site_id', siteId)
                .eq('user_id', userId)
                .maybeSingle(); // Use maybeSingle to avoid error on no rows

            if (fetchError) {
                console.error('Database error fetching site:', fetchError);
                throw new Error(`Failed to query site: ${fetchError.message}`);
            }

            // If site exists, return its UUID
            if (existingSite) {
                return existingSite.id;
            }

            // Site doesn't exist - create it
            const { data: newSite, error: createError } = await supabase
                .from('sites')
                .insert([
                    {
                        site_id: siteId,
                        user_id: userId,
                    },
                ])
                .select('id, site_id')
                .single();

            if (createError) {
                console.error('Database error creating site:', createError);
                throw new Error(`Failed to create site: ${createError.message}`);
            }

            if (!newSite || !newSite.id) {
                throw new Error('Site creation returned no UUID');
            }

            return newSite.id;
        } catch (error) {
            console.error('Error in _resolveSite:', error);
            throw error;
        }
    }

    /**
   * Resolve site config: fetch existing or create default
   * 
   * IMPORTANT: site_configs.site_id is UUID (FK to sites.id), not TEXT
   * 
   * @private
   * @param {string} siteUuid - Site UUID (FK to sites.id)
   * @param {string} siteIdString - Site identifier string (for logging)
   * @returns {Promise<Object>} Site configuration
   */
    async _resolveSiteConfig(siteUuid, siteIdString) {
        try {
            // Query accessibility.site_configs for existing config
            const { data: existingConfig, error: fetchError } = await supabase
                .from('site_configs')
                .select('*')
                .eq('site_id', siteUuid) // FK to sites.id (UUID)
                .maybeSingle();

            if (fetchError) {
                console.error('Database error fetching config:', fetchError);
                throw new Error(`Failed to query config: ${fetchError.message}`);
            }

            // If config exists, return it
            if (existingConfig) {
                return existingConfig;
            }

            // Config doesn't exist - create default
            const defaultConfig = {
                site_id: siteUuid, // UUID FK to sites.id
                cursor_mode_enabled: false,
                cursor_speed: 10,
                scroll_speed: 10,
                accessibility_profile: 'standard',
                enter_hold_ms: 1000,
                exit_hold_ms: 800,
                click_cooldown_ms: 300,
            };

            const { data: newConfig, error: createError } = await supabase
                .from('site_configs')
                .insert([defaultConfig])
                .select('*')
                .single();

            if (createError) {
                console.error('Database error creating config:', createError);
                throw new Error(`Failed to create config: ${createError.message}`);
            }

            if (!newConfig) {
                throw new Error('Config creation returned no data');
            }

            return newConfig;
        } catch (error) {
            console.error('Error in _resolveSiteConfig:', error);
            throw error;
        }
    }

    /**
     * Normalize config object to ensure all required fields are present
     * 
     * @private
     * @param {Object} config - Raw config from database
     * @returns {Object} Normalized config with all required fields
     */
    _normalizeConfig(config) {
        if (!config) {
            throw new Error('Cannot normalize null or undefined config');
        }

        return {
            cursor_mode_enabled: config.cursor_mode_enabled ?? false,
            cursor_speed: config.cursor_speed ?? 10,
            scroll_speed: config.scroll_speed ?? 10,
            accessibility_profile: config.accessibility_profile ?? 'standard',
            enter_hold_ms: config.enter_hold_ms ?? 1000,
            exit_hold_ms: config.exit_hold_ms ?? 800,
            click_cooldown_ms: config.click_cooldown_ms ?? 300,
        };
    }

    /**
     * Update accessibility configuration for a site
     * 
     * @param {string} siteId - Site identifier (string)
     * @param {string} userId - User UUID
     * @param {Object} updates - Configuration updates
     * @returns {Promise<Object>} Result object
     */
    async updateConfig(siteId, userId, updates) {
        try {
            // Validate inputs
            if (!siteId || typeof siteId !== 'string') {
                throw new Error('Invalid siteId: must be a non-empty string');
            }

            if (!userId) {
                throw new Error('Invalid userId: user authentication required');
            }

            if (!updates || typeof updates !== 'object') {
                throw new Error('Invalid updates: must be an object');
            }

            // STEP 1: Verify site exists and belongs to user, get UUID
            const { data: site, error: siteError } = await supabase
                .from('sites')
                .select('id, site_id')
                .eq('site_id', siteId)
                .eq('user_id', userId)
                .single();

            if (siteError) {
                console.error('Database error verifying site:', siteError);
                throw new Error(
                    siteError.code === 'PGRST116'
                        ? 'Site not found or access denied'
                        : `Failed to verify site: ${siteError.message}`
                );
            }

            // STEP 2: Whitelist allowed fields
            const allowedFields = [
                'cursor_mode_enabled',
                'cursor_speed',
                'scroll_speed',
                'accessibility_profile',
                'enter_hold_ms',
                'exit_hold_ms',
                'click_cooldown_ms',
            ];

            const sanitizedUpdates = {};
            for (const key of allowedFields) {
                if (updates[key] !== undefined) {
                    sanitizedUpdates[key] = updates[key];
                }
            }

            // Only proceed if there are valid updates
            if (Object.keys(sanitizedUpdates).length === 0) {
                throw new Error('No valid fields to update');
            }

            // Add updated_at timestamp
            sanitizedUpdates.updated_at = new Date().toISOString();

            // STEP 3: Update config
            const { data: updatedConfig, error: updateError } = await supabase
                .from('site_configs')
                .update(sanitizedUpdates)
                .eq('site_id', site.id) // FK to sites.id (UUID)
                .select('*')
                .single();

            if (updateError) {
                console.error('Database error updating config:', updateError);
                throw new Error(`Failed to update config: ${updateError.message}`);
            }

            if (!updatedConfig) {
                throw new Error('Config update returned no data');
            }

            // STEP 4: Return normalized response
            return {
                success: true,
                data: {
                    site_id: siteId,
                    config: this._normalizeConfig(updatedConfig),
                },
            };
        } catch (error) {
            console.error('Error in updateConfig:', error);
            return {
                success: false,
                error: error.message || 'Failed to update site configuration',
            };
        }
    }
}

export default new AccessibilityService();
