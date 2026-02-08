import { supabasePublic } from '../db/supabaseClient.js';

/**
 * API Key Authentication Middleware
 * Validates API keys against the public.api_keys table in Supabase
 * 
 * Expected table schema:
 * - id: UUID (primary key)
 * - api_key: TEXT (unique, indexed)
 * - user_id: UUID (foreign key to users table)
 * - is_active: BOOLEAN
 * - created_at: TIMESTAMP
 * - last_used_at: TIMESTAMP
 * - name: TEXT (optional, for identifying the key)
 */
const apiKeyAuth = async (req, res, next) => {
    try {
        // Extract API key from request header
        const apiKey = req.headers['x-api-key'];

        // Check if API key is provided
        if (!apiKey) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                message: 'API key is missing. Please provide a valid API key in the x-api-key header.',
            });
        }

        // Query the api_keys table to validate the key
        const { data, error } = await supabasePublic
            .from('api_keys')
            .select('id, user_id, is_active')
            .eq('api_key', apiKey)
            .single();

        // Handle database errors
        if (error) {
            // If no rows found, the API key is invalid
            if (error.code === 'PGRST116') {
                return res.status(403).json({
                    success: false,
                    error: 'Invalid API key',
                    message: 'The provided API key is not valid.',
                });
            }

            // Other database errors
            console.error('Database error during API key validation:', error);
            return res.status(500).json({
                success: false,
                error: 'Authentication error',
                message: 'An error occurred while validating your API key.',
            });
        }

        // Check if the API key is active
        if (!data.is_active) {
            return res.status(403).json({
                success: false,
                error: 'API key disabled',
                message: 'This API key has been disabled. Please contact support or use a different key.',
            });
        }

        // Update last_used_at timestamp (fire and forget, don't wait)
        supabasePublic
            .from('api_keys')
            .update({ last_used_at: new Date().toISOString() })
            .eq('id', data.id)
            .then(() => { })
            .catch((err) => console.error('Error updating last_used_at:', err));

        // Attach user_id and api_key info to request object for downstream use
        req.user = {
            userId: data.user_id,
            apiKeyId: data.id,
        };

        // Authentication successful, proceed to next middleware/route
        next();
    } catch (error) {
        console.error('Unexpected error in API key authentication:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: 'An unexpected error occurred during authentication.',
        });
    }
};

export default apiKeyAuth;
