const webpack = require('webpack');
const path = require('path');

const APP_DIR = path.resolve(__dirname, 'resources/js');
const DIST_DIR = path.resolve(__dirname, 'public/assets/dist/js');

module.exports = {
  entry: ['babel-polyfill', APP_DIR + '/app.js'],
  output: {
      path: DIST_DIR,
      filename: 'app.js',
    },
  module: {
    loaders: [
      { test: /\.js$/, include: APP_DIR, loader: 'babel-loader' },
    ],
  },
  resolve: {
    extensions: ['.js', '.json'],
  },
};
