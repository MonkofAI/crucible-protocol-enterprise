const bcrypt = require('bcryptjs');
const { createPool } = require('@vercel/postgres');

const checkApiKeySecure = async (req, res, next) => {
    // This now correctly points to your prefixed Vercel variable.
    const sql = createPool({ connectionString: process.env.monk_POSTGRES_URL }).sql;
    
    const apiKey = req.get('X-API-Key');
    if (!apiKey) {
        return res.status(401).json({ error: 'Unauthorized: Missing API Key' });
    }

    try {
        const { rows: clients } = await sql`SELECT * FROM clients WHERE is_active = true;`;
        let authorizedClient = null;

        for (const client of clients) {
            if (client.api_key_hash) {
                const match = await bcrypt.compare(apiKey, client.api_key_hash);
                if (match) {
                    authorizedClient = client;
                    break;
                }
            }
        }

        if (!authorizedClient) {
            return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
        }
        
        req.clientConfig = authorizedClient; 
        next();

    } catch (error) {
        console.error('API Key Check Error:', error);
        res.status(500).json({ error: 'Internal server error during authentication.' });
    }
};

module.exports = checkApiKeySecure;