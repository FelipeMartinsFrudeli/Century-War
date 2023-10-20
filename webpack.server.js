var path = require('path');
var nodeExternals = require('webpack-node-externals');

module.exports = {
    entry: './server.ts',
    mode: 'development',
    target: 'node',
    // devtool: 'inline-source-map',
    // devtool: 'source-map',

    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },

    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle_server.js'
    },

    module: {
        rules: [
            // {
            //     test: /.js/,
            //     use: 'babel-loader'
            // },
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ]
    },

    externals: [nodeExternals()]
}