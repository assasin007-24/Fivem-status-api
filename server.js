// server.js
const express = require('express');
const net = require('net');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;
// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Function to check FiveM server status
const checkServerStatus = (ip, port) => {
    return new Promise((resolve, reject) => {
        const socket = new net.Socket();
        socket.setTimeout(3000); // 3 seconds timeout

        socket.connect(port, ip, () => {
            socket.write('GET /info HTTP/1.1\r\nHost: ' + ip + ':' + port + '\r\nConnection: close\r\n\r\n');
        });

        socket.on('data', (data) => {
            socket.destroy(); // Close the connection
            const response = data.toString();
            const playersRegex = /"players":\s*([0-9]+)/; 
            const maxPlayersRegex = /"maxPlayers":\s*([0-9]+)/;

            const connectedPlayers = playersRegex.exec(response) ? playersRegex.exec(response)[1] : 0;
            const maxPlayers = maxPlayersRegex.exec(response) ? maxPlayersRegex.exec(response)[1] : 0;

            resolve({
                online: true,
                players: {
                    connected: connectedPlayers,
                    max: maxPlayers,
                },
            });
        });

        socket.on('error', (error) => {
            socket.destroy();
            reject({ online: false });
        });

        socket.on('timeout', () => {
            socket.destroy();
            reject({ online: false });
        });
    });
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
        console.error('Error fetching server status:', error);
        res.status(500).json({ error: 'Failed to fetch server status.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
