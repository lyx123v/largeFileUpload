export interface Response<T> {
  code: number;
  data: T;
  message?: string;
}

export interface FindFileControllerParams {
  // 文件 hash 值
  hash?: string;
  index?: number;
}

export type FindFileControllerParamsResponse = Response<{
  hashList: string[];
}>;

export interface DeleteFileControllerParams {
  // 文件 hash 值
  hash?: string;
  name?: string;
}
export type FindFileControllerResponse = Response<{ exists: boolean }>;

export interface MergeChunksControllerParams {
  // 文件 hash 值
  hash?: string;
  name?: string;
}

export type MergeChunksControllerResponse = Response<{
  count: number;
  hash: string;
  name: string;
}>;

export interface SaveChunkControllerParams {
  // 文件 hash 值
  hash: string;
  // 分片内容
  chunk: Buffer;
  // 分片索引
  index: number;
}

export type SaveChunkControllerReponse = Response<{
  // 分片索引
  index: number;
  // 文件 hash 值
  hash: string;
}>;
