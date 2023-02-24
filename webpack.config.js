const path = require("path");

const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserJSPlugin = require("terser-webpack-plugin");
const apply = require("postcss-class-apply/dist");
const tailwindcss = require("tailwindcss");

module.exports = (env) => ({
  mode: env.mode || "production",
  stats: "minimal",
  infrastructureLogging: { level: "error" },
  entry: [
    path.resolve(`./themes/${env.theme}/assets/js/main.js`),
    path.resolve(`./themes/${env.theme}/assets/css/main.scss`)
  ],
  output: {
    filename: "[name].js",
    path: path.resolve(`./themes/${env.theme}/assets`, "dist"),
  },
  externals: {
    // require("jquery") is external and available
    // on the global var jQuery
    jquery: "jQuery",
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "[name].css",
    })
  ],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: { importLoaders: 1 },
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [
                  ["tailwindcss"],
                  ["autoprefixer"],
                ],
              },
            },
          },
        ],
      },
      {
        test: /\.s(a|c)ss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: "css-loader",
            options: { importLoaders: 1 },
          },
          {
            loader: "postcss-loader",
            options: {
              postcssOptions: {
                plugins: [
                  [apply],
                  ["autoprefixer"],
                ],
              },
            },
          },
          {
            loader: "resolve-url-loader"
          },
          {
            loader: "sass-loader",
            options: {
              sourceMap: true,
            },
          },
        ],
      },
      {
        test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
        type: "asset/resource"
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg)$/,
        type: "asset/resource"
      },
    ],
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserJSPlugin({
        terserOptions: {
          output: {
            comments: false
          }
        }
      }),
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            "default",
            {
              discardComments: { removeAll: true },
            },
          ],
        },
      }),
    ],
  }
});
