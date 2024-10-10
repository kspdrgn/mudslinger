/* Should run from package root, so paths accordingly */
export default {
    entry: 'ts/build/build_client/src/client/client.js',
    format: 'umd',
    dest: 'static/mudslinger.js',
    moduleName: 'Mudslinger',
    sourceMap: 'inline'
};
