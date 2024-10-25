// server.js
const express = require('express');
const cors = require('cors');
const axios = require('axios'); // Import Axios

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors({
    origin: '*', // Allow all origins, or specify specific origins (e.g., 'http://localhost:8080')
    methods: ['GET', 'POST', 'OPTIONS'], // Allow specific methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
}));

app.use(express.json());

// Function to check FiveM server status using Axios
const checkServerStatus = async (ip, port) => {
    try {
        const response = await axios.get(`http://${ip}:${port}/info`); // Make sure the endpoint is correct
        const { players, maxPlayers } = response.data; // Adjust this based on the actual response structure

        return {
            online: true,
            players: {
                connected: players || 0,
                max: maxPlayers || 0,
            },
        };
    } catch (error) {
        console.error('Error fetching server status:', error.message);
        return { online: false };
    }
};

// API endpoint to get FiveM server status
app.get('/api/status', async (req, res) => {
    const { ip, port = 30120 } = req.query;

    if (!ip) {
        return res.status(400).json({ error: 'IP address is required.' });
    }

    try {
        const status = await checkServerStatus(ip, port);
        res.json(status);
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: 'Failed to fetch server status.' });
    }
});

// Export the Express app for Vercel
module.exports = app;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}
