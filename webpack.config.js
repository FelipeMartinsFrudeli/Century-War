var path = require('path');
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
    entry: './src/index.js',
    mode: 'development', // development  production

    output: {
        path: path.resolve(__dirname, 'dist/public'),
        filename: 'bundle_client.js'
    },

    module: {
        rules: [{
            test: /.js/,
            use: ['babel-loader']
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