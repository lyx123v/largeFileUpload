const { excludeIgnoredFiles } = require('./utils');
const micromatch = require('micromatch');
const path = require('path');
const fs = require('fs');

module.exports = {
  '**/*.{ts,tsx,js,jsx,mjs,vue}': async files => {
    const match = micromatch.not(files, [
      '**/common/_templates/!(_*)/**/(.)?*',
    ]);
    const filesToLint = await excludeIgnoredFiles(match);
    return [
      `eslint --fix --cache ${filesToLint} --no-error-on-unmatched-pattern`,
    ];
  },
};
