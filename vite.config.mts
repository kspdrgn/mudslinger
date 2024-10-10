// https://vite.dev/config/#configuring-vite
import { defineConfig } from 'vite';

export default defineConfig({
    root: '.',
    appType: 'spa',
    base: '/',
    publicDir: 'public',
    plugins: [],
    server: {
        port: 8008,
    },
    build: {
        sourcemap: true,
    },
});
