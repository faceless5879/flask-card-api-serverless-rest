import { resolve } from 'path';
import { readFileSync } from 'fs';
import { yamlParse } from 'yaml-cfn';
import { Configuration } from 'webpack';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

/* eslint-disable */
const { compilerOptions } = require('./tsconfig.json');
/* eslint-enable */

/** Webpack Config Variables */
const conf = {
  prodMode: process.env.NODE_ENV === 'production',
  templatePath: '../../template.yaml',
};

/**
 * Parsing template.yaml file for function dir locations
 */

/** Interface for AWS SAM Function */
interface ISamFunction {
  Type: string;
  Properties: {
    AssumeRolePolicyDocument?: JSON;
    AutoPublishAlias?: string;
    AutoPublishCodeSha256?: string;
    CodeUri?: string;
    Description?: string;
    Environment?: {
      Variables: {
        [key: string]: string;
      };
    };
    Events?: EventSource;
    FunctionName?: string;
    Handler: string;
    Layers?: { [Ref: string]: string }[];
    Runtime: string;
    Timeout?: number;
    Tracing?: string;
    VersionDescription?: string;
  };
}

const resources = yamlParse(readFileSync(conf.templatePath, 'utf-8'));

const entries = Object.values(resources.Resources)

  .filter((resource: ISamFunction) => resource.Type === 'AWS::Serverless::Function')

  .filter((resource: ISamFunction) => resource.Properties.Runtime && resource.Properties.Runtime.startsWith('nodejs'))

  .map((resource: ISamFunction) => ({
    filename: resource.Properties.Handler.split('.')[0],
    entryPath: resource.Properties.CodeUri.split('/').splice(3).join('/'),
  }))

  .reduce(
    (resources, resource) =>
      Object.assign(resources, {
        [`${resource.filename}`]: `./src/${resource.entryPath}${resource.filename}.ts`,
      }),
    {},
  );

/**
 * Webpack Config
 */

const webpackConfig: Configuration = {
  entry: entries,
  target: 'node',
  mode: conf.prodMode ? 'production' : 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    plugins: [new TsconfigPathsPlugin()],
    // alias: tsPaths,
  },
  output: {
    path: resolve(__dirname, 'dist'),
    filename: '[name].js',
    libraryTarget: 'commonjs2',
  },
  devtool: 'source-map',
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: resolve(__dirname, 'package.json'),
          to: resolve(__dirname, 'dist'),
        },
      ],
    }),
  ],
  externals: {
    express: 'express',
  },
};

export default webpackConfig;
