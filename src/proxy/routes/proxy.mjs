import httpProxy from 'http-proxy';

const MARQO_API_URL = process.env.MARQO_API_URL;
const proxy = httpProxy.createProxyServer({});

export const proxyMiddleware = (req, res) => {
    if(!MARQO_API_URL) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.writeHead(500);
        res.end('<h1>🤯 Uh oh!</h1><p>It seems MARQO_API_URL is not set. Please check if MARQO_API_URL is set correctly.</p>');
        return;
    }

    console.info(`Proxying request to ${MARQO_API_URL} for ${req.url}`);
    proxy.web(req, res, { target: MARQO_API_URL }, (err) => {
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
};