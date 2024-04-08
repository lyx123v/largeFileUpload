import fs from 'fs/promises';

import { type Context } from 'koa';
import { FilePieceService } from '@big-file/file-storage';

import type {
  SaveChunkControllerParams,
  SaveChunkControllerReponse,
} from '../types';

/**
 * 校验上传分片的参数是否合法
 * @param params 上传分片的参数，包括hash、chunk和index
 * @returns 若参数不合法，返回错误信息字符串；若参数合法，返回true。
 */
const checkParam = (params: SaveChunkControllerParams) => {
  if (!params) {
    // 没有参数
    return 'Empty params';
  }
  const { hash, chunk, index } = params;
  if (typeof hash !== 'string' || hash.length <= 0) {
    // hash值不合法
    return `Empty hash value: ${hash}`;
  }
  if (chunk?.length <= 0) {
    // chunk值不合法
    return `Empty chunk value`;
  }
  if (index < 0) {
    // 序号不合法
    return `Invalid file name `;
  }
  // 校验通过
  return true;
};

/**
 * 将上传的文件分片写入存储
 * @param params 上传分片的参数，包括hash、index和chunk
 * @param storageRoot 文件存储的根目录
 */
const saveChunk = async (
  params: SaveChunkControllerParams,
  storageRoot: string,
) => {
  const { hash, index, chunk } = params;
  const pieceService = new FilePieceService({ hash, storageRoot });
  await pieceService.writePiece(chunk, index);
};

/**
 * 处理保存文件分片的请求
 * @param ctx Koa的上下文对象，包含请求和响应的信息
 */
export const saveChunkController = async (ctx: Context) => {
  const { index, hash } = ctx.request.body;
  // 读取上传的分片文件
  // @ts-ignore
  const chunkFile = ctx.request.files?.chunk.filepath || undefined;
  if (!chunkFile || Array.isArray(chunkFile)) {
    throw new Error(`Invalid chunk file params`);
  }
  // 读取文件内容
  const chunk = await fs.readFile(chunkFile);
  const params = {
    index, // 序号
    hash, // 哈希
    chunk, // 切片
  };
  // 校验参数合法性
  const checkStatus = checkParam(params);
  if (checkStatus !== true) {
    ctx.status = 400;
    ctx.body = { code: 400, message: checkStatus };
    return;
  }
  // 从上下文中读取文件存储的根目录，并保存分片
  const { fileStorageRoot } = ctx.readConfig();
  await saveChunk(params, fileStorageRoot);
  // 返回成功响应
  ctx.body = { code: 0, data: { index, hash } } as SaveChunkControllerReponse;
};
