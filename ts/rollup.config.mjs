/**
 * Rollup bundling config.
 * Should run from package root, so paths accordingly.
 * @type {import('rollup').RollupOptions}
 */
const config = {
    input: 'ts/build/build_client/client/client.js',
    output: {
        format: 'umd',
        file: 'static/mudslinger.js',
        name: 'Mudslinger',
        sourcemap: 'inline',
    },
};

export default config;
