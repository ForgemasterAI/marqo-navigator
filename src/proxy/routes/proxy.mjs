import httpProxy from 'http-proxy';

// CRITICAL FIX: The default URL should not include "/proxy" since that creates circular references
// Change from "http://localhost:9882/proxy" to a proper Marqo API endpoint
const MARQO_API_URL = process.env?.MARQO_API_URL ?? 'http://localhost:18882';

// Create proxy with error handling
const proxy = httpProxy.createProxyServer({
  // Add a longer timeout - increase to 2 minutes
  proxyTimeout: 120000,
  // Don't buffer the proxy response
  buffer: false,
  // Keep socket alive
  keepAlive: true,
  // Increase socket timeout
  timeout: 120000
});

// Listen for proxy errors
proxy.on('error', (err, req, res) => {
  console.error(`Global proxy error handler: ${err.message}`, err.stack);
  if (!res.headersSent) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    if (err.code === 'ECONNREFUSED') {
      res.writeHead(502);
      res.end('<h1>🤯 Connection Refused</h1><p>Cannot connect to Marqo API. Please check if Marqo is running and accessible.</p>');
    } else if (err.code === 'ETIMEDOUT') {
      res.writeHead(504);
      res.end('<h1>⏱️ Timeout Error</h1><p>The request to Marqo API timed out. The service might be overloaded.</p>');
    } else {
      res.writeHead(500);
      res.end(`<h1>Proxy Error</h1><p>Error type: ${err.code || 'Unknown'}</p><p>${err.message}</p>`);
    }
  }
});

// Add debug events with enhanced logging
proxy.on('proxyReq', (proxyReq, req, res) => {
  console.debug(`[PROXY] Created proxy request: ${req.method} ${req.url} -> ${proxyReq.path}`);
  
  // Add custom timeout handler on the proxyReq object
  proxyReq.on('socket', (socket) => {
    socket.on('timeout', () => {
      console.error('[PROXY] Socket timeout occurred');
    });
    
    // Log socket connection events
    socket.on('connect', () => {
      console.debug('[PROXY] Socket connected');
    });
    
    socket.on('close', (hadError) => {
      console.debug(`[PROXY] Socket closed${hadError ? ' with error' : ''}`);
    });
  });
  
  // Handle streaming of request body for large requests
  if (req.body && Object.keys(req.body).length > 0) {
    const bodyData = JSON.stringify(req.body);
    // Set the correct content length
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
    // Write the body to the proxyReq
    proxyReq.write(bodyData);
  }
});

proxy.on('proxyRes', (proxyRes, req, res) => {
  console.debug(`[PROXY] Received response: ${proxyRes.statusCode} for ${req.method} ${req.url}`);
  
  // Debug response headers
  const headers = proxyRes.headers;
  console.debug('[PROXY] Response headers:', JSON.stringify(headers));
  
  // Stream the response data for debugging
  let responseBody = '';
  proxyRes.on('data', (chunk) => {
    // Only collect for reasonable sized responses to avoid memory issues
    if (responseBody.length < 10000) {
      responseBody += chunk;
    }
  });
  
  proxyRes.on('end', () => {
    console.debug('[PROXY] Response completed. Length:', responseBody.length);
    if (responseBody.length < 10000) {
      try {
        // Try to parse if it's JSON
        const jsonResponse = JSON.parse(responseBody);
        console.debug('[PROXY] Response body (JSON):', JSON.stringify(jsonResponse).substring(0, 1000) + (jsonResponse.length > 1000 ? '...' : ''));
      } catch (e) {
        // Otherwise show first part of response
        console.debug('[PROXY] Response body (first 500 chars):', responseBody.substring(0, 500) + (responseBody.length > 500 ? '...' : ''));
      }
    }
  });
});

// Add function to safely stringify request bodies
const safeStringify = (obj) => {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (err) {
    return '[Cannot stringify body: ' + err.message + ']';
  }
};

// Export the middleware function with proper Express middleware signature
export const proxyMiddleware = (req, res, next) => {
  if(!MARQO_API_URL) {
    console.error('MARQO_API_URL is not set');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.writeHead(500);
    res.end('<h1>🤯 Configuration Error</h1><p>MARQO_API_URL is not set. Please check your environment configuration.</p>');
    return;
  }

  // Log detailed request info
  console.info(`[PROXY] Proxying ${req.method} ${req.url} to ${MARQO_API_URL}`);
  console.info(`[PROXY] Request headers: ${JSON.stringify(req.headers)}`);
  
  // Log request body if present
  if (req.body && Object.keys(req.body).length > 0) {
    console.info(`[PROXY] Request body: ${safeStringify(req.body)}`);
  }
  
  // Track request time
  const startTime = Date.now();
  
  // Define any custom options
  const options = { 
    target: MARQO_API_URL,
    changeOrigin: true,
    // Don't rewrite URLs
    xfwd: true,
    // Add timeout handling - extend to 2 minutes to match proxy settings
    timeout: 120000,
    // Don't follow redirects automatically
    followRedirects: false,
    // Don't parse the body - important for some API endpoints
    selfHandleResponse: false,
    // Enable WebSockets if needed
    ws: true
  };

  // Enhanced logging for binary content
  if (req.is('multipart/form-data') || req.is('application/octet-stream')) {
    console.debug(`[PROXY] Request contains binary data (${req.headers['content-type']})`);
  }

  console.debug(`[PROXY] Full request URL will be: ${MARQO_API_URL}${req.url}`);

  try {
    // Add request timeout handler
    req.setTimeout(120000);
    
    // Forward the request with enhanced error tracking
    proxy.web(req, res, options, (err) => {
      const duration = Date.now() - startTime;
      console.error(`[PROXY] Error after ${duration}ms:`, err.message);
      
      if (err.code === 'ECONNRESET') {
        console.error('[PROXY] Connection reset by peer. This might be due to client disconnect.');
      }
      
      // Error already handled by the global handler
      // Just make sure we don't call next() in case of error
    });
  } catch (error) {
    console.error('[PROXY] Unexpected error in proxy middleware:', error);
    if (!res.headersSent) {
      res.status(500).send('Internal Server Error in proxy middleware');
    }
  }
  
  // We don't call next() because the proxy will handle sending the response
  // If we called next(), Express would continue processing middleware which could cause issues
};