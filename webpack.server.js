var path = require('path');
var nodeExternals = require('webpack-node-externals');
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: './server.js',
    mode: 'development', // development  production
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle_server.js'
    },
    target: 'node',
    module: {
        rules: [{
            test: /.js/,
            use: 'babel-loader'
        }]
    },
    externals: [nodeExternals()],

    plugins: [
        new CopyWebpackPlugin({
            patterns: [{ 
                    from: './src/index.html', 
                    to: 'public',
                    noErrorOnMissing: true
                }]
        })],
}