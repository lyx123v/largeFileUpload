// find file or piece of file

import { type Context } from 'koa';
import { FilePieceService } from '@big-file/file-storage';

import { HttpError } from '../utils/http-error';
import { isValidString, isPositiveInter, isUndefined } from '../utils';
import type {
  FindFileControllerParams,
  FindFileControllerParamsResponse,
  FindFileControllerResponse,
} from '../types';

/**
 * 检查文件查找操作的参数是否有效。
 * @param params 包含要查找的文件的hash和可选的索引的参数对象。
 * @returns 如果参数有效，返回true，否则抛出HTTP错误。
 */
const checkParams = (params: FindFileControllerParams) => {
  const { index, hash } = params;
  // 验证hash是否为非空字符串
  if (!isValidString(hash)) {
    throw new HttpError(400, `hash should be no empty string`);
  }
  // 如果index被提供，验证它是否为正整数
  if (!isUndefined(index) && !isPositiveInter(index)) {
    throw new HttpError(400, `index should be positive inter`);
  }
  return true;
};

/**
 * 执行文件搜索操作。
 * @param params 包含要查找的文件的hash和索引的参数对象。
 * @param storageRoot 文件存储的根目录路径。
 * @returns 返回文件索引是否存在的情况。
 */
const doSearch = async (
  params: FindFileControllerParams,
  storageRoot: string,
) => {
  const { hash, index } = params;
  // 创建文件片段服务实例，并使用提供的hash和存储根目录进行初始化
  const pieceService = new FilePieceService({ hash: hash!, storageRoot });
  const res = await pieceService.isExist(index); // 检查指定索引的文件片段是否存在
  return res;
};

/**
 * 执行切片搜索操作。
 * @param params 包含要查找的文件hash中全部已上传的切片。
 * @param storageRoot 文件存储的根目录路径。
 * @returns 返回文件切片的列表数组。
 */
const searchChunk = async (
  params: FindFileControllerParams,
  storageRoot: string,
) => {
  const { hash } = params;
  // 创建文件片段服务实例，并使用提供的hash和存储根目录进行初始化
  const pieceService = new FilePieceService({ hash: hash!, storageRoot });
  const res = await pieceService.ls(); // 检查指定索引的文件片段是否存在
  return res;
};

/**
 * 处理查找文件的控制器逻辑。
 * @param ctx 包含请求和响应信息的上下文对象。
 * @returns 返回一个表示文件是否存在的响应对象。
 */
export const findFileController = async (ctx: Context) => {
  // 从请求的查询参数中解析hash和index
  const { index, hash } = ctx.request.query;
  const params = {
    index: typeof index === 'string' ? +index : index, // 将index转换为数字类型，如果它是一个字符串
    hash,
  } as FindFileControllerParams;
  // 检查解析后的参数是否有效
  checkParams(params);
  // 从上下文中读取文件存储的根目录配置
  const { fileStorageRoot } = ctx.readConfig();
  // 执行文件搜索操作
  const isExist = await doSearch(params, fileStorageRoot);
  // 构建并返回响应对象
  ctx.body = {
    code: 0,
    data: { exists: isExist },
  } satisfies FindFileControllerResponse;
};

/**
 * 查询文件中已上传的分片
 * @param ctx 包含请求和响应信息的上下文对象。
 * @returns 返回一个表示文件是否存在的响应对象。
 */
export const findChunkController = async (ctx: Context) => {
  const { hash } = ctx.request.query;
  const params = {
    hash,
  } as FindFileControllerParams;
  // 检查解析后的参数是否有效
  checkParams(params);
  // 从上下文中读取文件存储的根目录配置
  const { fileStorageRoot } = ctx.readConfig();
  // 执行文件搜索操作
  const hashList = await searchChunk(params, fileStorageRoot);
  // 构建并返回响应对象
  ctx.body = {
    code: 0,
    data: { hashList },
  } satisfies FindFileControllerParamsResponse;
};
