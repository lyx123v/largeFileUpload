import { Command } from 'commander';

import { readVersion } from './utils';
import { doAnalysis } from './action';

const COMMAND_NAME = 'pdf-ana';

export const main = async () => {
  const program = new Command();
  const version = await readVersion();

  // 首行提示
  program
    .name(COMMAND_NAME)
    .usage('<command> [options]')
    .version(`${COMMAND_NAME}@${version}`);

  program
    .command('ana <pdf-filename>')
    .description('分析总结 pdf 文档内容')
    .action(async (filename: string) => {
      doAnalysis(filename);
    });
  program.parse(process.argv);
};
