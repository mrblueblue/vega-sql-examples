var webpack = require("webpack");
var path = require("path");

module.exports = {
  entry: {
    app: [
      "script-loader!d3/build/d3.min.js",
      "script-loader!vega/build/vega.min.js"
    ],
    "overview-detail": path.resolve(__dirname, "src/overview-detail/index.js")
  },
  devtool: "source-map",
  output: {
    path: path.resolve(__dirname, "assets"),
    publicPath: "/assets/",
    filename: "[name].bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, "src"),
          path.resolve(__dirname, "node_modules/mapd-data-layer")
        ],
        loader: "babel-loader"
      }
    ]
  }
};
