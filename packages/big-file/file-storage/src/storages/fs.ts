import path from 'path';
import {
  stat,
  readFile,
  writeFile,
  mkdir,
  readdir,
  unlink,
  rmdir,
} from 'fs/promises';

import { BasicStorage } from './basic';
import { PathLike, RmDirOptions } from 'fs';

class FilesystemStorage extends BasicStorage {
  // 判断文件是否存在，存在返回(异步) true，否则返回(异步)  false
  async isFileExists(filename: string) {
    try {
      const fStat = await stat(filename);
      return fStat.isFile();
    } catch (e) {
      return false;
    }
  }

  // 是否表示一个存在的目录，存在返回(异步) true，否则返回(异步)  false
  async isDirExists(filename: string) {
    try {
      const fStat = await stat(filename);
      return fStat.isDirectory();
    } catch (e) {
      return false;
    }
  }

  // 列出文件夹下所有文件
  async ls(dir: string) {
    if (await this.isDirExists(dir)) {
      const res = await readdir(dir);
      return res.map(r => path.resolve(dir, r));
    }
    throw new Error(`Dir ${dir} not exists`);
  }

  // 读
  readFile(filename: string) {
    return readFile(filename);
  }

  // 写
  async writeFile(filename: string, content: Buffer) {
    await writeFile(filename, content);
  }

  // 确保指定的目录存在。如果目录不存在，则会使用mkdir方法递归创建该目录。
  // { recursive: true }表示以递归方式创建目录，即如果目录的上级目录不存在
  async ensureDir(dir: string) {
    await mkdir(dir, { recursive: true });
  }

  // 删除指定文件名称的文件
  async unlink(path: PathLike) {
    await unlink(path);
    return true;
  }

  // 删除目录
  async rmdir(path: PathLike, options?: RmDirOptions) {
    return await rmdir(path, options);
  }
}

export const fsStorage = new FilesystemStorage();
