import path, { resolve } from 'path';

import { logger } from '@devil-arch/logger';

import { isValidString, isPositiveInter } from './utils';
import { fsStorage } from './storages/fs';
import { type BasicStorage } from './storages/basic';
import { log } from 'console';

const COMBIND_FILE_NAME = 'combind'; // 定义合并后文件的名称

/**
 * 文件片段服务类，用于处理文件片段的存储和合并
 */
export class FilePieceService {
  public hash: string; // 文件的哈希值
  private _storage: BasicStorage; // 文件操作方法
  private _storageRoot: string; // 存储根目录

  constructor(options: {
    hash: string; // 包含文件哈希值
    storage?: BasicStorage; // 文件操作方法
    storageRoot: string; // 存储根目录
  }) {
    const { hash, storage, storageRoot } = options;
    // 如果存储根目录或文件哈希值为空字符串，抛出错误
    if (!isValidString(storageRoot)) {
      throw new Error(`Invalid storageRoot, it should not empty string.`);
    }
    if (!isValidString(hash)) {
      throw new Error(`Invalid file hash, it should not empty string.`);
    }
    this.hash = hash; // 设置文件哈希值
    this._storage = storage || fsStorage; // 文件操作方法
    this._storageRoot = storageRoot; // 设置存储根目录
  }

  // 获取哈希值对应的目录路径
  get hashDir() {
    const { _storageRoot, hash } = this;
    return path.resolve(_storageRoot, hash);
  }

  /**
   * 确保哈希值对应的目录存在
   * @returns 返回目录创建或确认已存在的结果
   */
  private ensureHashDir() {
    const { hashDir } = this;
    return this._storage.ensureDir(hashDir);
  }

  /**
   * 将文件片段写入存储
   * @param content 文件片段的内容
   * @param index 文件片段的索引
   * @throws 如果存储过程中发生错误，抛出异常
   */
  async writePiece(content: Buffer, index: number) {
    const { _storage } = this;
    const pieceFilename = path.resolve(this.hashDir, `${index}`);
    await this.ensureHashDir(); // 确保目录存在
    await _storage.writeFile(pieceFilename, content); // 将文件片段写入存储
  }

  /**
   * 检查文件是否有内容
   * @returns 存储目录是否存在
   */
  async hasContent() {
    const { _storage } = this;
    return _storage.isDirExists(this.hashDir);
  }

  /**
   * 检查指定片段或合并后文件是否存在
   * @param chunkIndex 可选参数，指定要检查的片段索引
   * @returns 指定片段或合并后文件是否存在
   */
  isExist(chunkIndex?: number) {
    const findByChunk = typeof chunkIndex === 'number' && chunkIndex >= 0;
    const { _storage } = this;
    return _storage.isFileExists(
      path.resolve(
        this.hashDir,
        findByChunk ? chunkIndex + '' : COMBIND_FILE_NAME,
      ),
    );
  }

  /**
   * 检查指定片段下所有的文件
   * @returns 返回文件数组
   */
  async ls() {
    const fn2idx = (filename: string) => path.basename(filename);
    // 获取哈希值对应的目录下的所有文件
    const pieces = await this._storage.ls(this.hashDir);
    return pieces.map(fn2idx);
  }
  /**
   * 合并所有片段为一个文件
   * @returns 合并后的文件信息，包含片段数量和文件哈希值
   * @throws 如果找不到任何片段或合并过程中发生错误，抛出异常
   */
  async merge(name?: string) {
    console.log(`Start merge ${this.hash}`);
    // 从存储中列出指定哈希目录下的所有文件
    const pieces = await this._storage.ls(this.hashDir);
    // 定义一个函数，用于从文件名中提取序号（假定文件名以数字结尾）
    const fn2idx = (filename: string) => +path.basename(filename);

    // 筛选出序号为正整数的文件片段，并按序号排序
    const sortedPieces = pieces
      .filter(r => isPositiveInter(fn2idx(r)))
      .sort((r1, r2) => fn2idx(r1) - fn2idx(r2));

    // 如果没有找到任何文件片段，抛出错误
    if (sortedPieces.length <= 0) {
      throw new Error(`Can not found any pieces of ${this.hash} `);
    }
    // 组合排序后的文件片段到一个指定的文件中
    const filename = path.resolve(this.hashDir, name || COMBIND_FILE_NAME);
    await this._storage.combind(sortedPieces, filename);
    // 删除 chunks
    for (let i = 0; i < sortedPieces.length; i++) {
      this._storage.unlink(path.resolve(sortedPieces[i]));
    }
    // 返回文件数量和哈希值
    return { count: pieces.length, hash: this.hash };
  }

  /**
   * 删除指定哈希值的所有文件
   * @returns 删除结果
   */
  async delete(name?: string) {
    const { _storage } = this;
    // 删除合并后的文件与文件夹
    try {
      if (name) {
        await _storage.unlink(path.resolve(this.hashDir, name)); // 删除默认文件名
      } else {
        await _storage.unlink(path.resolve(this.hashDir, COMBIND_FILE_NAME)); // 删除默认文件名
      }
      await _storage.rmdir(path.resolve(this.hashDir)); // 删除哈希目录
    } catch (error) {
      console.log(`Delete ${this.hash} error: ${error}`);
    }
    return true;
  }
}
