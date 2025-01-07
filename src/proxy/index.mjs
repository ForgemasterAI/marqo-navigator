import http from 'http';
import httpProxy from 'http-proxy';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import client from 'prom-client';

const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics();

const numberOfDocumentsGauge = new client.Gauge({
    name: 'index_number_of_documents',
    help: 'Number of documents in the index',
    labelNames: ['indexName'],
});

const numberOfVectorsGauge = new client.Gauge({
    name: 'index_number_of_vectors',
    help: 'Number of vectors in the index',
    labelNames: ['indexName'],
});

const cudaUtilizationGauge = new client.Gauge({
    name: 'cuda_utilization',
    help: 'CUDA device utilization',
    labelNames: ['device', 'device_name'],
})

const cudaMemoryUsedGauge = new client.Gauge({
    name: 'cuda_memory_used',
    help: 'CUDA device memory used',
    labelNames: ['device', 'device_name'],
})

const cudaMemoryTotalGauge = new client.Gauge({
    name: 'cuda_memory_total',
    help: 'CUDA device total memory',
    labelNames: ['device', 'device_name'],
})

async function fetchIndexStats() {
    try {
        const response = await fetch(`${MARQO_API_URL}/indexes`);
        const { results: indexes } = await response.json();

        const indexPromises = indexes.map(async ({ indexName }) => {
            const statsResponse = await fetch(`${MARQO_API_URL}/indexes/${indexName}/stats`);
            const stats = await statsResponse.json();
            numberOfDocumentsGauge.set({ indexName }, stats.numberOfDocuments);
            numberOfVectorsGauge.set({ indexName }, stats.numberOfVectors);
        });

        await Promise.all(indexPromises);

        // Fetch CUDA info
        const cudaResponse = await fetch(`${MARQO_API_URL}/device/cuda`);
        const { cuda_devices = [] } = await cudaResponse.json().catch(() => ({ cuda_devices: [] }));

        const cudaPromises = cuda_devices.map(device => {
            const { device_id, memory_used, total_memory, utilization, device_name } = device;
            cudaMemoryUsedGauge.set({ device: device_id, device_name }, parseFloat(memory_used));
            cudaMemoryTotalGauge.set({ device: device_id, device_name }, parseFloat(total_memory));
            cudaUtilizationGauge.set({ device: device_id, device_name }, parseFloat(utilization));
        });

        await Promise.all(cudaPromises);
    } catch (error) {
        console.error('Error fetching index or CUDA stats:', error);
    }
}



// Read target host and port from environment variables
const MARQO_API_URL = process.env.MARQO_API_URL;
console.info(`MARQO_API_URL: ${MARQO_API_URL}`);
fetchIndexStats();
setInterval(fetchIndexStats, 30000);

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

// Endpoint to serve Prometheus metrics
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', client.register.contentType);
    res.end(await client.register.metrics());
});


// Proxy API requests
app.use('/proxy',(req, res) => {
    const target = `${MARQO_API_URL}`;
    console.info(`Proxying request to ${target} for ${req.url}`);
    proxy.web(req, res, { target }, (err) => {
        console.error('Proxy error:', err);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        if (err.code === 'ECONNREFUSED') {
            res.writeHead(500);
            res.end('<h1>🤯 Uh oh!</h1><p>It seems Marqo AI is not accessible. Please check if Marqo is healthy.</p>');
        } else {
            res.writeHead(500);
            res.end('<h1>Something went wrong. 😞</h1>');
        }
    });
});


// Create an HTTP server that listens on port 9882
const server = http.createServer(app);

server.listen(9882, () => {
    console.info('Proxy server listening on port 9882');
});