import express from 'express';
import accessibilityService from '../services/accessibilityService.js';

const router = express.Router();

/**
 * @route   GET /api/accessibility/config
 * @desc    Get accessibility configuration for a site (auto-creates if needed)
 * @access  Protected (requires API key)
 * @query   siteId - The site identifier
 */
router.get('/config', async (req, res) => {
    try {
        const { siteId } = req.query;
        const userId = req.user.userId; // From apiKeyAuth middleware

        if (!siteId) {
            return res.status(400).json({
                success: false,
                error: 'Missing parameter',
                message: 'siteId query parameter is required',
            });
        }

        const result = await accessibilityService.getConfigBySiteId(siteId, userId);

        if (!result.success) {
            return res.status(500).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('Error in GET /api/accessibility/config:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message,
        });
    }
});

/**
 * @route   PUT /api/accessibility/sites/:siteId/config
 * @desc    Update accessibility configuration for a site
 * @access  Protected (requires API key)
 * @param   siteId - The site identifier
 */
router.put('/sites/:siteId/config', async (req, res) => {
    try {
        const { siteId } = req.params;
        const userId = req.user.userId;
        const updates = req.body;

        if (!siteId) {
            return res.status(400).json({
                success: false,
                error: 'Missing parameter',
                message: 'siteId is required',
            });
        }

        if (!updates || Object.keys(updates).length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Missing body',
                message: 'Update payload is required',
            });
        }

        const result = await accessibilityService.updateConfig(siteId, userId, updates);

        if (!result.success) {
            return res.status(400).json(result);
        }

        res.json(result);
    } catch (error) {
        console.error('Error in PUT /api/accessibility/sites/:siteId/config:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error',
            message: error.message,
        });
    }
});

export default router;
