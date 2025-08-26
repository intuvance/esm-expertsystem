/* eslint-disable @typescript-eslint/no-require-imports */
const config = require('openmrs/default-webpack-config');
config.overrides.resolve = {
  extensions: ['.tsx', '.ts', '.jsx', '.js', '.scss'],
};
module.exports = config;