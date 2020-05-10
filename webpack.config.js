const path = require("path");
const glob = require("glob");
const fs = require("fs");

//https://github.com/jantimon/html-webpack-plugin
const HtmlWebpackPlugin = require("html-webpack-plugin");

// https://github.com/webpack-contrib/mini-css-extract-plugin
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

// https://github.com/webpack-contrib/copy-webpack-plugin
const CopyWebpackPlugin = require('copy-webpack-plugin');

// https://github.com/DanielRuf/html-minifier-terser
const minify = require('html-minifier-terser').minify;

const mode = process.env.NODE_ENV;

let views = "";

const view_files = glob.sync(path.join(__dirname, '/src/views/*.html'));

view_files.forEach(file => {

    const id = `zombi_view_${path.basename(file, path.extname(file))}`;

    const view_html_code = fs.readFileSync(file, 'utf8').toString();

    views += `<div id="${id}" class="zombi_view">${view_html_code}</div>`;

});

if (mode === "production") {

    views = minify(views, {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        useShortDoctype: true,
        minifyCSS: true,
        minifyJS: true
    });

}

module.exports = {
    mode,
    entry: {
        index: './src/index.js',
        login: './src/login.js'
    },
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "[name].bundle.js"
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    { loader: MiniCssExtractPlugin.loader },
                    { loader: "css-loader", options: { importLoaders: 1 } },
                    { loader: "postcss-loader" }
                ]
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'css/fonts/'
                        }
                    }
                ]
            },
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [
                            "@babel/preset-env"
                        ]
                    }
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            chunks: ['index'],
            filename: "index.html",
            template: "./src/index.html",
            views
        }),
        new HtmlWebpackPlugin({
            chunks: ['login'],
            filename: "login.html",
            template: "./src/login.html"
        }),
        new MiniCssExtractPlugin({
            filename: "[name].bundle.css"
        }),
        new CopyWebpackPlugin([
            { from: './src/img', to: 'img' }
        ])
    ],
    devServer: {
        watchContentBase: true,
        contentBase: path.resolve(__dirname, "dist"),
        open: true,
    },
}