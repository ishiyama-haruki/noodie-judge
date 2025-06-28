import { defineConfig, loadEnv } from 'vite'
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // .env ファイルを読み込む
    const env = loadEnv(mode, process.cwd(), '')
  
    return {
        plugins: [
            laravel({
                input: 'resources/js/app.jsx',
                refresh: true,
            }),
            react(),
            tailwindcss(), 
            nodePolyfills()
        ],
        define: {
            global: 'globalThis',
        },
        server: {
            proxy: {
            '/api': {
                target: env.VITE_NSFW_API_URL,
                changeOrigin: true,
                rewrite: path => path.replace(/^\/api/, '')
            }
            }
        }
    }
});
