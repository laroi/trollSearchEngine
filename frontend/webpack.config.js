const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
    entry: './src/app.js',
    output: {
        filename: 'bundle.js',
        // eslint-disable-next-line no-undef
        path: path.resolve(__dirname, 'dist'),
    },
plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery",
      Popper: ['popper.js', 'default']
    })
  ],
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                ]
            },
             {  test: /\.hbs$/,
        loader: 'handlebars-loader' },
            {
                test: /\.(gif|png|jpe?g|svg)$/i,
                use: [
                    'file-loader',
                    {
                        loader: 'image-webpack-loader',
                        options: {
                            // disable: true, // webpack@2.x and newer
                        }
                    }
                ]
            },
            {
                test: /\.(woff|woff2|eot|ttf|otf)$/,
                use: [
                    'file-loader',
                ],
            },
        ]
    }
};
