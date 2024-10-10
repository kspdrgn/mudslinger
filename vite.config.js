// https://vite.dev/config/#configuring-vite
import { defineConfig } from 'vite';

export default defineConfig({
    root: 'static',
    base: '/',
    publicDir: false,
    plugins: [],
    server: {
        port: 8008,
    },
});
