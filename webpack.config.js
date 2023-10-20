const fs = require('fs');
var path = require('path');
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: './src/index.ts',
    mode: 'development',
    devtool: 'inline-source-map',

    output: {
        path: path.resolve(__dirname, 'dist/public'),
        filename: 'bundle_client.js'
    },

    module: {
        rules: [{
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            }]
    },

    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { 
                    from: './src/assets', 
                    to: 'assets',
                    noErrorOnMissing: true
                },
                { 
                    from: './src/css', 
                    to: 'css',
                    noErrorOnMissing: true
                }
            ]
        })
    ],
}