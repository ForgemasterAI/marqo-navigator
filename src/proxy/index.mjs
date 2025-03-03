import http from 'http';
import express from 'express';
import path from 'path';
import cors from 'cors';
import { fileURLToPath } from 'url';

import { proxyMiddleware } from './routes/proxy.mjs';
import { fetchIndexStats, metricsMiddleware } from './routes/metrics.mjs';
import { vespaScanService } from './utils/dns-scan.mjs';

// Read target host and port from environment variables
// CRITICAL FIX: Default URL should be the actual Marqo API endpoint, not pointing to our own proxy
const MARQO_API_URL = process.env?.MARQO_API_URL ?? 'http://localhost:18882';
console.info(`MARQO_API_URL: ${MARQO_API_URL}`);

if (!MARQO_API_URL) {
    console.error('MARQO_API_URL environment variable must be set');
    process.exit(1);
}

// Initialize metrics collection
fetchIndexStats(MARQO_API_URL);
setInterval(() => fetchIndexStats(MARQO_API_URL), 30000);

// Get __dirname equivalent in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create an express app
const app = express();
app.use(cors());
app.use(express.json()); 

app.get('/env.js', (req, res) => {
    // if localhost is used, the proxy will not be used
    if (req.hostname === 'localhost') {
      res.type('.js').send('window.PROXY_ACCESS_URL = undefined;');
      return;
    }
    const script = `window.PROXY_ACCESS_URL = window.location.origin + '/proxy';`;
    res.type('.js').send(script);
  });


// Endpoint to serve Prometheus metrics
app.get('/metrics', metricsMiddleware);

// Proxy API requests
app.use('/proxy', proxyMiddleware);

// vespa dns scan
app.get('/vespa-scan', vespaScanService);

// Serve static files from the dist folder
app.use(express.static(path.join(__dirname, '../../dist')));
app.get('*', (req,res) =>{
    res.sendFile(path.join(__dirname, '../../dist', '/index.html'));
});
// Create an HTTP server that listens on port 9882
const server = http.createServer(app);

server.listen(9882, () => {
    console.info('Proxy server listening on port 9882');
});