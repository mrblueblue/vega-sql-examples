var webpack = require("webpack");
var path = require("path");

module.exports = {
  entry: {
    app: [
      "script-loader!d3/build/d3.min.js",
      "script-loader!vega/build/vega.min.js",
      path.resolve(__dirname, "src/index.js")
    ]
  },
  devtool: "source-map",
  output: {
    path: path.resolve(__dirname, "assets"),
    publicPath: "/assets/",
    filename: "bundle.js"
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        include: [
          path.resolve(__dirname, "src/index.js")
        ],
        loader: "babel-loader"
      }
    ]
  }
};
