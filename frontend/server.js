const { PeerServer } = require('peer');
const express = require('express');
const path = require('path');

const app = express();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
const localIP = '35.200.252.185'; 
// Create a PeerJS server
const peerServer = PeerServer({
    port: 9000,
    host: localIP,
    path: '/myapp',
    proxied: false,
    debug: true,
    allow_discovery: true,
});

// Start Express server
const expressServer = app.listen(5000, () => {
    console.log('Express server listening on port 5000');
});

peerServer.on('connection', (client) => {
    console.log('Client connected:', client.id);
});

peerServer.on('disconnect', (client) => {
    console.log('Client disconnected:', client.id);
});

console.log('PeerJS server listening on port 9000');