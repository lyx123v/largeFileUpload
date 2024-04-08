import path from 'path';
import fs from 'fs/promises';

export const readVersion = async (): Promise<string> => {
  const pkg = await fs.readFile(
    path.resolve(__dirname, '../package.json'),
    'utf-8',
  );
  return JSON.parse(pkg).version as string;
};
