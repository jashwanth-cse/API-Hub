import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/env.js';
import apiKeyAuth from './middleware/apiKeyAuth.js';
import accessibilityRoutes from './routes/accessibility.js';

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors(config.cors));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API Hub Backend is running',
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
    });
});

// API routes with authentication
app.use('/api/accessibility', apiKeyAuth, accessibilityRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Not Found',
        message: 'The requested endpoint does not exist',
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(err.status || 500).json({
        success: false,
        error: err.message || 'Internal Server Error',
        ...(config.nodeEnv === 'development' && { stack: err.stack }),
    });
});

// Start server
const PORT = config.port;
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║      API Hub Backend Server            ║
╠════════════════════════════════════════╣
║  Status: Running                       ║
║  Port: ${PORT}                       ║
║  Environment: ${config.nodeEnv.padEnd(18)}║
║  URL: http://localhost:${PORT}        ║
╚════════════════════════════════════════╝
  `);
});

export default app;
