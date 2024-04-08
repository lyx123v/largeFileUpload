require('ts-node').register({
  transpileOnly: true,
  cwd: __dirname,
  options: {},
});

const { preset } = require('./index.ts');
module.exports = preset;
