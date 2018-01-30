'use strict';
const webpack = require('webpack');
const path = require('path');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ClosureCompilerPlugin = require('webpack-closure-compiler');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const OfflinePlugin = require('offline-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

var CDNfolder_filename = 'cdn/';
var CDNfolder_path = '';
var CDNfolder_noCDN = '';
var publicPath = "./";
var outputPathBase = path.resolve(__dirname, "dist");
if(process.env.NODE_ENV === "production"){
  CDNfolder_filename = '';
  CDNfolder_path = 'cdn'; // no "/"
  CDNfolder_noCDN = '../';
  publicPath = 'https://s.seethediff.cn/projects/bitvacation/';
}

// Default + Local Dev Config
var config = {
  context: path.resolve(__dirname, "src"), // `__dirname` is root of project and `src` is source
  entry: {
    'app': './app.js',
  },
  output: {
    path: path.resolve(outputPathBase, CDNfolder_path), // `dist` is the destination
    filename: CDNfolder_filename+'[name]-[chunkhash].js',
    chunkFilename: CDNfolder_filename+'[name]-[chunkhash].js',
    publicPath: publicPath,
  },
  plugins: [
    /* prevent that webpack loads momentjs-support for all languages. Only DE and EN.
     * see http://stackoverflow.com/questions/25384360/how-to-prevent-moment-js-from-loading-locales-with-webpack
     */
    new webpack.ContextReplacementPlugin(/moment[\\\/]locale$/, /^\.\/(zh-cn)$/),
    new ExtractTextPlugin(CDNfolder_filename+"[name]-[chunkhash].css"),
    new HtmlWebpackPlugin({
      filename: CDNfolder_noCDN+'index.html',
      page_id: "2018w-zgc",
      page_name: "2018 年寒假（中关村）",
      template: 'main.tmpl',
      chunks: ['app'],
      minify: {collapseWhitespace:true, removeComments:true, removeEmptyAttributes:true, removeRedundantAttributes:true, removeScriptTypeAttributes:true, removeStyleLinkTypeAttributes: true, collapseWhitespace: true, minifyJS: true}
    }),
    new HtmlWebpackPlugin({
      filename: CDNfolder_noCDN+'2018w-lx.html',
      page_id: "2018w-lx",
      page_name: "2018 年寒假（良乡）",
      template: 'main.tmpl',
      chunks: ['app'],
      minify: {collapseWhitespace:true, removeComments:true, removeEmptyAttributes:true, removeRedundantAttributes:true, removeScriptTypeAttributes:true, removeStyleLinkTypeAttributes: true, collapseWhitespace: true, minifyJS: true}
    })
  ],
  module: {
    rules: [{
        test: /node_modules[\\\/]vis[\\\/].*\.js$/, // vis.js files
        loader: 'babel-loader',
        query: {
          cacheDirectory: true,
          presets: [ "babel-preset-env" ].map(require.resolve),
          plugins: [
            "transform-es3-property-literals", // see https://github.com/almende/vis/pull/2452
            "transform-es3-member-expression-literals", // see https://github.com/almende/vis/pull/2566
            "transform-runtime" // see https://github.com/almende/vis/pull/2566
          ]
        }
      }, {
        test: /\.js$/, //Check for all js files
        loader: 'babel-loader',
        query: {
          presets: [ "babel-preset-env" ].map(require.resolve)
        }
      }, {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "css-loader"
        })
      },{
        test: /\.html|ejs$/,
        loader: 'html-loader'
      },
      {
         test: /\.(png|svg|jpg|gif)$/,
         use: [
          {
             loader: 'file-loader',
             options:{
              name: CDNfolder_filename+'[name].[ext]'
             }
          }
        ]
      },
      {
         test: /webapp\.json$/,
         use: [
          {
            loader: 'file-loader',
            options:{
              name: '[name].[ext]',
              publicPath: function(url){
                if(CDNfolder_noCDN){
                  url = url.replace(CDNfolder_noCDN, '');
                }
                return './'+url;
              },
              // useRelativePath: false,
              outputPath: CDNfolder_noCDN
            }
          }
        ]
      }
    ],
  },
  // To run development server
  devServer: {
    // contentBase: __dirname + '/src',
    publicPath: "/",
    // host: '0.0.0.0'
  },
  devtool: false// "eval-source-map" // Default development sourcemap
};

// Check if build is running in production mode, then change a lot
if (process.env.NODE_ENV === "production") {
  config.devtool = false;

  config.plugins.unshift(new CleanWebpackPlugin(['dist']));

  // Can do more here
  // JSUglify plugin
  config.plugins.push(
    true?
    new UglifyJSPlugin({
      test: /\.js($|\?)/i,
      uglifyOptions: {
        output: {
          comments: false,
          beautify: false
        },
        // sourceMap:{url:'inline'},
        compress:{
          drop_console: true
        },
        mangle: true,
        warnings: false
      }
    })
    :
    new ClosureCompilerPlugin({compiler: {
      compilation_level: 'ADVANCED',
      warning_level: 'DEFAULT',
      externs: [__dirname+"/src/closure-extern.js"],
      //use_types_for_optimization: false,
      third_party: true
      }})
  );
  /*
  config.plugins.push(
     new webpack.DefinePlugin({
       'process.env.NODE_ENV': JSON.stringify('production')
     }));
  */
  // Offline plugin
  // Bundle styles seperatly using plugins etc
  config.plugins.push(
    new OptimizeCssAssetsPlugin()
  );
  config.plugins.push(
    new OfflinePlugin({
      caches: {
        main: [':rest:'],
        // additional: [':externals:']
      },
      responseStrategy: 'cache-first',
      publicPath: './',
      externals: ['https://jsorgcn-lfs.b0.upaiyun.com/js/analytics.js'],
      ServiceWorker: {events:true, publicPath:'./sw.js', output:CDNfolder_noCDN+'sw.js', minify:true,cacheName:"BITvacation"},
      AppCache: false,
      rewrites: function(asset) {
        asset = asset.replace(/index.htm(l?)$/, '');
        if(asset.startsWith(CDNfolder_noCDN)){
          asset = asset.replace(CDNfolder_noCDN, '');
          if (asset == ''){
            return './';
          }
          return asset;
        }
        if (asset.startsWith('http')) {
          return asset;
        }
        else {
          return config.output.publicPath + asset;
        }
        return asset;
      }
    })
  );
  // config.plugins.push(new CopyWebpackPlugin(['./sw-webapp.json']));
}

module.exports = config;