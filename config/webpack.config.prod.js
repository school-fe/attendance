const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ManifestPlugin = require('webpack-manifest-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const glob = require('glob');
const autoprefixer = require('autoprefixer');

const paths = require('./paths');

const titles = require(paths.titleJson);

const getClientEnvironment = require('./env');

// Webpack uses `publicPath` to determine where the app is being served from.
// It requires a trailing slash, or the file assets will get an incorrect path.
const publicPath = paths.servedPath;
// Some apps do not use client-side routing with pushState.
// For these, "homepage" can be set to "." to enable relative asset paths.
const shouldUseRelativeAssetPaths = publicPath === './';
// Source maps are resource heavy and can cause out of memory issue for large source files.
const shouldUseSourceMap = process.env.GENERATE_SOURCEMAP !== 'false';
// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_URL%/xyz looks better than %PUBLIC_URL%xyz.
const publicUrl = publicPath.slice(0, -1);
// Get environment variables to inject into our app.
const env = getClientEnvironment(publicUrl);

// Assert this just to be safe.
// Development builds of React are slow and not intended for production.
if (env.stringified['process.env'].NODE_ENV !== '"production"') {
  throw new Error('Production builds must have NODE_ENV=production.');
}

// Note: defined here because it will be used more than once.
const cssFilename = 'web/static/css/[name].[contenthash:8].css';

// ExtractTextPlugin expects the build output to be flat.
// (See https://github.com/webpack-contrib/extract-text-webpack-plugin/issues/27)
// However, our output is structured with css, js and media folders.
// To have this structure working with relative paths, we have to use custom options.
const extractTextPluginOptions = shouldUseRelativeAssetPaths
  ? // Making sure that the publicPath goes back to to build folder.
    { publicPath: Array(cssFilename.split('/').length).join('../') }
  : {};

const getEntry = function(globPath) {
  const entries = {
    vendor: [require.resolve('./polyfills'), paths.appIndexJs],
  };
  glob.sync(globPath).forEach(entry => {
    const pathname = entry
      .split('/')
      .splice(3)
      .join('/')
      .split('.')[0];
    entries[pathname] = [entry];
  });
  return entries;
};

const entries = getEntry('./src/entries/**/*.{tsx,ts,jsx,js}');

const chunks = Object.keys(entries);

const htmlPlugins = [];
chunks.forEach(pathname => {
  if (pathname === 'vendor') {
    return;
  }
  const templateHtml = paths[pathname] ? paths[pathname] : paths.appHtml;
  const conf = {
    title: titles[pathname] || '',
    filename: `web/page/${pathname}.html`,
    template: templateHtml,
    inject: true,
    minify: {
      removeComments: true,
      collapseWhitespace: false,
      removeRedundantAttributes: true,
      useShortDoctype: true,
      removeEmptyAttributes: true,
      removeStyleLinkTypeAttributes: true,
      keepClosingSlash: true,
      minifyJS: true,
      minifyCSS: true,
      minifyURLs: true,
    },
  };
  if (pathname in entries) {
    conf.chunks = ['vendor', 'common', pathname];
    conf.hash = false;
  }
  htmlPlugins.push(new HtmlWebpackPlugin(conf));
});

module.exports = {
  bail: true,
  devtool: shouldUseSourceMap ? 'source-map' : false,
  entry: entries,
  output: {
    path: paths.appBuild,
    filename: 'web/static/js/[name].[chunkhash:8].js',
    chunkFilename: 'web/static/js/[name].[chunkhash:8].chunk.js',
    publicPath,
    devtoolModuleFilenameTemplate: info =>
      path
        .relative(paths.appSrc, info.absoluteResourcePath)
        .replace(/\\/g, '/'),
  },
  resolve: {
    modules: ['node_modules', paths.appNodeModules].concat(
      process.env.NODE_PATH.split(path.delimiter).filter(Boolean),
    ),
    extensions: ['.js', '.json', '.jsx', '.vue', '.ts', '.tsx'],
    alias: {
      'react-native': 'react-native-web',
    },
    plugins: [new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson])],
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: [/[/\\\\]node_modules[/\\\\]/],
        use: 'babel-loader',
      },
      {
        test: /\.(ttf|eot|svg|woff|woff2)(\?.+)?$/,
        loader: 'url-loader',
        options: {
          limit: 8192,
        },
      },
      {
        test: /\.(png|jpg|gif)$/,
        loader: 'url-loader',
      },
      {
        test: /\.(css|less)$/,
        use: [
          {
            loader: 'style-loader',
          },
          {
            loader: 'css-loader',
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: [
                autoprefixer({
                  browsers: ['Android >= 4.3', 'iOS >= 8'],
                }),
              ],
            },
          },
          {
            loader: 'less-loader',
            options: {
              javascriptEnabled: true,
            },
          },
        ],
      },
      {
        test: /\.ts?$|\.tsx?$/,
        use: [
          {
            loader: 'babel-loader',
          },
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                jsx: 'react',
                noImplicitAny: false,
                removeComments: false,
                target: 'es5',
                emitDecoratorMetadata: true,
                experimentalDecorators: true,
              },
            },
          },
        ],
      },
      {
        test: /\.(scss|sass)$/,
        loader: 'style-loader!css-loader!sass-loader',
      },
      {
        test: /\.json$/,
        loader: 'json-loader',
      },
    ],
  },
  plugins: [
    ...htmlPlugins,
    new InterpolateHtmlPlugin(env.raw),
    new webpack.DefinePlugin(env.stringified),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        comparisons: false,
      },
      output: {
        comments: false,
        ascii_only: true,
      },
      sourceMap: shouldUseSourceMap,
    }),
    new ExtractTextPlugin({
      filename: cssFilename,
    }),
    new ManifestPlugin({
      fileName: 'asset-manifest.json',
    }),
    new SWPrecacheWebpackPlugin({
      dontCacheBustUrlsMatching: /\.\w{8}\./,
      filename: 'service-worker.js',
      logger(message) {
        if (message.indexOf('Total precache size is') === 0) {
          return;
        }
        if (message.indexOf('Skipping static resource') === 0) {
          return;
        }
        console.log(message);
      },
      minify: true,
      navigateFallback: `${publicUrl}/index.html`,
      navigateFallbackWhitelist: [/^(?!\/__).*/],
      staticFileGlobsIgnorePatterns: [/\.map$/, /asset-manifest\.json$/],
    }),
    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
  ],
  // Some libraries import Node modules but don't use them in the browser.
  // Tell Webpack to provide empty mocks for them so importing them works.
  node: {
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty',
  },
};
