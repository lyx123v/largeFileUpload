import { Command } from 'commander';

import { readVersion } from './utils';
import { doAnalysis } from './actions';

const COMMAND_NAME = 'devil-module-graph';

export const main = async () => {
  const program = new Command();
  const version = await readVersion();

  // 首行提示
  program
    .name(COMMAND_NAME)
    .usage('<command> [options]')
    .version(`${COMMAND_NAME}@${version}`);

  program
    .command('ana <pnpm-lock-filename>')
    .description('分析模块依赖关系，目前仅支持 pnpm lock file')
    .action(async (filename: string) => {
      await doAnalysis(filename);
    });
  program.parse(process.argv);
};
