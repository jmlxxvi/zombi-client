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

let views = "";

const view_files = glob.sync(path.join(__dirname, '/src/views/*.html'));

view_files.forEach(file => {

    const id = path.basename(file, path.extname(file));

    const view_html_code = fs.readFileSync(file, 'utf8').toString();

    views += `<div id="${id}">${view_html_code}</div>`;

});

const header = fs.readFileSync(path.join(__dirname, '/src/html/header.html'), 'utf8').toString();
const footer = fs.readFileSync(path.join(__dirname, '/src/html/footer.html'), 'utf8').toString();

if(process.env.NODE_ENV === "production") {

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
    entry: "./src/index.js",
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js"
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
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./src/index.html",
            views,
            header,
            footer
        }),
        new MiniCssExtractPlugin({
            filename: "bundle.css"
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