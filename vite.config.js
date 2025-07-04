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
        ],
        define: {
            global: 'globalThis',
        },
    }
});
