import http from 'http';
import httpProxy from 'http-proxy';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
// Read target host and port from environment variables
const MARQO_API_URL = process.env.MARQO_API_URL;

if (!MARQO_API_URL) {
    console.error('MARQO_API_URL environment variable must be set');
    process.exit(1);
}

// Get __dirname equivalent in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create an express app
const app = express();

app.use(cors());

// Serve static files from the dist folder
app.use(express.static(path.join(__dirname, '../../dist')));

// Create a proxy server
const proxy = httpProxy.createProxyServer({});

// Proxy API requests
app.use((req, res) => {
    const target = `${MARQO_API_URL}`;
    console.info(`Proxying request to ${target} for ${req.url}`);
    proxy.web(req, res, { target }, (err) => {
        console.error('Proxy error:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Something went wrong.');
    });
});

// Create an HTTP server that listens on port 9882
const server = http.createServer(app);

server.listen(9882, () => {
    console.log('Proxy server listening on port 9882');
});