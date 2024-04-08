import { PathLike, RmDirOptions } from 'fs';
import { isValidString } from '../utils';

// 这里留一个钩子，方便后续将存储能力迁移到云上
export abstract class BasicStorage {
  abstract rmdir(path: PathLike, options?: RmDirOptions): Promise<void>;
  // abstract:抽象类
  // 他规范了继承他的子类必须拥有抽象属性与抽象方法

  // 判断文件是否存在，存在返回(异步) true，否则返回(异步)  false
  abstract isFileExists(filename: string): Promise<boolean>;
  // 是否表示一个存在的目录，存在返回(异步) true，否则返回(异步)  false
  abstract isDirExists(dir: string): Promise<boolean>;

  // 列出文件夹下所有文件
  abstract ls(dir: string): Promise<string[]>;

  // 读
  abstract readFile(filename: string): Promise<Buffer>;

  // 写
  abstract writeFile(filename: string, content: Buffer): Promise<void>;
  // 删文件
  abstract unlink(path: PathLike): Promise<boolean>;
  // 删除目录
  // 确保指定的目录存在。如果目录不存在，则会使用mkdir方法递归创建该目录。
  abstract ensureDir(dir: string): Promise<void>;

  /**
   * 将多个文件内容合并，并保存为一个新文件。
   * @param files 要合并的文件路径数组。
   * @param saveAs 合并后文件的保存路径。
   * @throws 如果任何输入文件路径或保存路径无效，或任何输入文件不存在，将抛出错误。
   */
  async combind(files: string[], saveAs: string) {
    // 检查文件路径和保存路径的有效性
    if (files?.some(r => !isValidString(r)) || !isValidString(saveAs)) {
      throw new Error(`Invalid file paths`);
    }

    // 异步读取所有文件内容
    const contents = await Promise.all(
      files.map(async r => {
        // 检查文件是否存在
        if ((await this.isFileExists(r)) !== true) {
          throw new Error(`file ${r} not exists`);
        }
        // 读取文件内容
        return this.readFile(r);
      }),
    );
    // 合并所有文件内容
    const combindedContent = Buffer.concat(contents);
    // 将合并后的内容写入指定文件
    await this.writeFile(saveAs, combindedContent);
  }
}
