import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
    publicDir: './public',
    plugins: [react()],
    server: {
        cors: false,
        origin: '*',
        proxy: {
            // Target is your backend API
            '/api': {
                target: 'http://localhost:9882',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, ''),

                configure: (proxy, options) => {
                    proxy.on('error', (err, _req, _res) => {
                        console.log('error', err);
                    });
                    proxy.on('proxyReq', (proxyReq, req, _res) => {
                        console.log('Request sent to target:', req.method, req.url);
                    });
                    proxy.on('proxyRes', (proxyRes, req, _res) => {
                        console.log('Response received from target:', proxyRes.statusCode, req.url);
                    });
                },
            },
        },
    },
});
