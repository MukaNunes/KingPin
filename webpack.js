/* eslint-disable id-length */
/* eslint-disable import/no-extraneous-dependencies */
const path = require("node:path");

const CopyPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ZipPlugin = require("zip-webpack-plugin");

module.exports = {
    performance: {
        hints: false,
        maxEntrypointSize: 512_000,
        maxAssetSize: 512_000,
    },
    mode: "production",
    entry: "./source/Script.ts",
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
            {
                test: /\.css$/,
                use: [
                    "style-loader",
                    "css-loader",
                ],
            },
        ],
    },
    resolve: {
        extensionAlias: { ".js": [ ".ts", ".js" ] },
        extensions: [ ".ts", ".tsx", ".js", "jsx" ],
    },
    output: {
        filename: "Script.js",
        path: path.resolve(__dirname, "dist"),
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: "./source/html/index.html",
        }),
        new CopyPlugin({
            patterns: [
                { from: "./source/images", to: "./images/" },
            ],
        }),
        new CopyPlugin({
            patterns: [
                { from: "./source/manifest.json", to: "./" },
            ],
        }),
        new ZipPlugin({
            path: "../",
            filename: "KingPinChromeExtension.zip",
        }),
    ],
};
