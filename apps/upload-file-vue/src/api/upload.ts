import axios, { type CancelTokenSource } from 'axios';
import type {
  DeleteFileControllerParams,
  FindFileControllerParams,
  FindFileControllerResponse,
  MergeChunksControllerParams,
  MergeChunksControllerResponse,
  SaveChunkControllerParams,
  SaveChunkControllerReponse,
} from '@demo/upload-file/types';
import {
  API_FIND_FILE,
  API_CHUNK,
  API_MERGE_FILE,
  API_FIND_DELETE,
} from '@demo/upload-file/const';

const instance = axios.create({
  // 正式项目中，需要根据环境变量赋予实际地址
  baseURL: '/',
});

/**
 * 查找文件。
 * @param params 包含查找文件所需参数的对象。
 * @returns 返回文件查找结果。
 */
export const findFile = async (params: FindFileControllerParams) => {
  const res = await instance.get<FindFileControllerResponse>(API_FIND_FILE, {
    params,
  });
  return res.data.data;
};
/**
 * 删除文件。
 * @param params 包含查找文件所需参数的对象。
 * @returns 返回文件查找结果。
 */
export const deleteFile = async (params: DeleteFileControllerParams) => {
  const res = await instance.delete<FindFileControllerResponse>(
    API_FIND_DELETE,
    {
      params,
    },
  );
  return res.data.data;
};

/**
 * 上传文件块。
 * @param params 包含上传文件块所需参数的对象，可选参数 cancelToken 用于取消请求。
 * @returns 返回文件块上传结果。
 */
export const uploadChunk = async (
  params: SaveChunkControllerParams & { cancelToken?: CancelTokenSource },
) => {
  const { chunk, hash, index, cancelToken } = params;
  const formData = new FormData();
  // 准备上传的文件块数据
  formData.append('hash', hash);
  formData.append('chunk', chunk);
  formData.append('index', index + '');

  const res = await instance.post<SaveChunkControllerReponse>(
    API_CHUNK,
    formData,
    {
      cancelToken: cancelToken?.token,
    },
  );
  return res.data.data;
};

/**
 * 合并文件块。
 * @param params 包含合并文件块所需参数的对象。
 * @returns 返回合并文件块的结果。
 */
export const mergeFile = async (params: MergeChunksControllerParams) => {
  const res = await instance.post<MergeChunksControllerResponse>(
    API_MERGE_FILE,
    params,
  );
  return res.data.data;
};
