// --- Core Dependencies ---
const express = require('express');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

// --- Security & Middleware ---
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const checkApiKeySecure = require('../middleware/checkApiKey');

const app = express();
app.set('trust proxy', 1); // Add this line to trust Vercel's proxy

// --- Core Middleware Setup ---
// ... (rest of the file is the same)
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json({ limit: '10mb' }));

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
});
app.use('/api/', apiLimiter);

// ===== API ENDPOINTS =====
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.post('/api/crucible/qualify', checkApiKeySecure, async (req, res) => {
    const traceId = `CRUCIBLE-${uuidv4()}`;
    console.log(`[${traceId}] Received Crucible qualification request.`);
    try {
        const clientConfig = req.clientConfig; 
        const { payload } = req.body;
        if (!payload) {
            return res.status(400).json({ error: 'Missing lead payload' });
        }
        console.log(`[${traceId}] Qualifying lead for client: ${clientConfig.client_name}`);
        const mockResult = { message: "CrucibleEngine will run here.", lead: payload };
        res.status(200).json({ success: true, trace_id: traceId, qualification: mockResult });
    } catch (error) {
        console.error(`[${traceId}] CRUCIBLE_ERROR:`, error.message);
        res.status(500).json({ success: false, trace_id: traceId, error: 'Crucible engine internal failure.' });
    }
});

// --- Vercel Export ---
module.exports = app;