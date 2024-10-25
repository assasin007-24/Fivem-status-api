// server.js
const express = require('express');
const cors = require('cors');
const { FiveM } = require('fivem-server-api'); // Import fivem-server-api

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// API endpoint to get FiveM server status
app.get('/api/status', async (req, res) => {
    const { ip, port = 30120 } = req.query;

    if (!ip) {
        return res.status(400).json({ error: 'IP address is required.' });
    }

    try {
        // Use the FiveM package to check the server status
        const server = new FiveM(ip, port);
        const status = await server.getStatus();

        res.json({
            online: status.online,
            players: {
                connected: status.players,
                max: status.maxPlayers,
            },
        });
    } catch (error) {
        console.error('Error fetching server status:', error);
        res.status(500).json({ error: 'Failed to fetch server status.' });
    }
});

// Export the Express app for Vercel
module.exports = app;
