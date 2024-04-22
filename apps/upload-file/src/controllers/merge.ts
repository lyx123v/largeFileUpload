// find file or piece of file

import { type Context } from 'koa';
import { FilePieceService } from '@big-file/file-storage';

import { HttpError } from '../utils/http-error';
import { isValidString } from '../utils';
import {
  type DeleteFileControllerParams,
  type MergeChunksControllerParams,
  type MergeChunksControllerResponse,
} from '../types';

/**
 * 检查合并碎片的参数是否有效
 * @param params 合并碎片控制器的参数，包含hash
 * @throws 当hash不是有效字符串时，抛出HttpError
 * @returns 返回true，表示参数通过验证
 */
const checkParams = (params: MergeChunksControllerParams) => {
  const { hash } = params;
  if (!isValidString(hash)) {
    throw new HttpError(400, `hash should be no empty string`);
  }
  return true;
};

/**
 * 执行合并碎片的操作
 * @param params 合并碎片控制器的参数，包含hash
 * @param storageRoot 存储根目录
 * @throws 当对应hash的文件不存在时，抛出HttpError
 * @returns 返回合并结果
 */
const doMerge = async (
  params: MergeChunksControllerParams,
  storageRoot: string,
) => {
  const { hash, name } = params;
  const pieceService = new FilePieceService({ hash: hash!, storageRoot });
  if (!(await pieceService.hasContent())) {
    throw new HttpError(500, `Hash file not exists`);
  }
  const res = await pieceService.merge(name);
  return res;
};

/**
 * 执行删除文件的操作
 * @param params 合并碎片控制器的参数，包含hash
 * @param storageRoot 存储根目录
 * @returns 返回合并结果
 */
const delFile = async (
  params: DeleteFileControllerParams,
  storageRoot: string,
) => {
  const { hash, name } = params;
  const pieceService = new FilePieceService({ hash: hash!, storageRoot });
  const res = await pieceService.delete(name);
  return res;
};

/**
 * 处理合并碎片的控制器请求
 * @param ctx 上下文对象，包含请求和配置信息
 * @returns 返回合并结果的响应体
 */
export const mergeChunksController = async (ctx: Context) => {
  const { hash, name } = ctx.request.body;
  const params = {
    hash,
    name,
  } as MergeChunksControllerParams;
  // 验证参数
  checkParams(params);
  // 从上下文中读取配置
  const { fileStorageRoot } = ctx.readConfig();
  // 执行合并操作
  const res = await doMerge(params, fileStorageRoot);
  // 构建并返回响应体
  ctx.body = { code: 0, data: res } as MergeChunksControllerResponse;
};

/**
 * 删除文件
 * @param ctx 上下文对象，包含请求和配置信息
 * @returns 返回true/false
 */
export const deleteFileController = async (ctx: Context) => {
  const { hash, name } = ctx.request.query;
  const params = {
    hash,
    name,
  } as DeleteFileControllerParams;
  const { fileStorageRoot } = ctx.readConfig();
  const res = await delFile(params, fileStorageRoot);
  ctx.body = { code: 0, data: res };
};
