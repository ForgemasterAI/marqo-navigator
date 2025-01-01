import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';


export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '')
    // add new object named define and add the env variable to it
    
    return {
        publicDir: './public',
        plugins: [react()],
        server: {
            cors: false,
            origin: '*'
        },
        define: {
            __APP_ENV__: JSON.stringify(env.APP_ENV),
          },
        //  // Proxy setup for direct development without need of running the nagivator backend
        //   proxy: {
        //     // Target is your backend API
        //     '/proxy': {
        //         target: 'http://localhost:8882',
        //         changeOrigin: true,
        //         rewrite: (path) => path.replace(/^\/api/, ''),

        //         configure: (proxy, options) => {
        //             proxy.on('error', (err, _req, _res) => {
        //                 console.log('error', err);
        //             });
        //             proxy.on('proxyReq', (proxyReq, req, _res) => {
        //                 console.log('Request sent to target:', req.method, req.url);
        //             });
        //             proxy.on('proxyRes', (proxyRes, req, _res) => {
        //                 console.log('Response received from target:', proxyRes.statusCode, req.url);
        //             });
        //         },
        //     },
        // },
    }
})





