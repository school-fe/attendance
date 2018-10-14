const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin');
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin');
// const eslintFormatter = require('react-dev-utils/eslintFormatter');
const autoprefixer = require('autoprefixer');
const postcssToVwAndRem = require('byted-postcss-px-to-viewport-and-rem');

const glob = require('glob');
const getClientEnvironment = require('./env');
const paths = require('./paths');

const titles = require(paths.titleJson);

// Webpack uses `publicPath` to determine where the app is being served from.
// In development, we always serve from the root. This makes config easier.
const publicPath = '/';
// `publicUrl` is just like `publicPath`, but we will provide it to our app
// as %PUBLIC_URL% in `index.html` and `process.env.PUBLIC_URL` in JavaScript.
// Omit trailing slash as %PUBLIC_PATH%/xyz looks better than %PUBLIC_PATH%xyz.
const publicUrl = '';
// Get environment variables to inject into our app.
const env = getClientEnvironment(publicUrl);

const getEntry = function (globPath) {
  const entries = {
    vendor: [
      require.resolve('./polyfills'),
      require.resolve('react-dev-utils/webpackHotDevClient'),
      paths.appIndexJs,
    ],
  };
  glob.sync(globPath).forEach((entry) => {
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
chunks.forEach((pathname) => {
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
      removeComments: false,
      collapseWhitespace: false,
    },
  };
  if (pathname in entries) {
    conf.chunks = ['vendor', 'common', pathname];
    conf.hash = false;
  }
  htmlPlugins.push(new HtmlWebpackPlugin(conf));
});

module.exports = {
  devtool: 'cheap-module-source-map',
  entry: entries,
  output: {
    path: paths.appBuild,
    pathinfo: true,
    filename: 'web/static/js/[name].bundle.js',
    chunkFilename: 'web/static/js/[name].chunk.js',
    publicPath,
    devtoolModuleFilenameTemplate: info =>
      path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
  },
  resolve: {
    modules: ['node_modules', paths.appNodeModules].concat(
      process.env.NODE_PATH.split(path.delimiter).filter(Boolean),
    ),
    extensions: ['.js', '.json', '.jsx', '.vue', '.ts', '.tsx'],
    alias: {
      vue$: 'vue/dist/vue.esm.js',
    },
    plugins: [new ModuleScopePlugin(paths.appSrc, [paths.appPackageJson])],
  },
  module: {
    strictExportPresence: true,
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
                postcssToVwAndRem({
                  enableConvert: false,
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
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(),
    new WatchMissingNodeModulesPlugin(paths.appNodeModules),
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
  // Turn off performance hints during development because we don't do any
  // splitting or minification in interest of speed. These warnings become
  // cumbersome.
  performance: {
    hints: false,
  },
};
