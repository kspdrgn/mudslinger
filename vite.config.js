// https://vite.dev/config/#configuring-vite
import { defineConfig } from 'vite';

export default defineConfig({
    root: 'static',
    base: '/',
    publicDir: true,
    plugins: [],
    server: {
        port: 8008,
    },
});
