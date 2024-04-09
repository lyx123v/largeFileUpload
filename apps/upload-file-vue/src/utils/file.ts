import { CHUNK_SIZE, MAX_REQUESTS } from '../const';

import { findFile, uploadChunk, mergeFile } from '../api/upload';
import { type CancelTokenSource } from 'axios';

export interface FilePieceArray {
  pieces: FilePiece[]; // 文件分块信息数组
  fileName: string; // 文件名
  percentage: number;
  fileData: File | null;
  hash: string; // 文件hash值
  onTick?: (progress: number) => void; // 上传进度回调函数
  cancelToken?: CancelTokenSource; // 取消上传的取消令牌
  // 上传状态
  status:
    | 'resolving' // 解析中
    | 'success' // 成功
    | 'waiting' // 等待
    | 'stop' // 暂停
    | 'uploading' // 上传中
    | 'done' // 完成
    | 'error'; // 错误
}

export interface FilePiece {
  chunk: Blob; // 当前分片的内容
  size: number; // 当前分片的大小
}

/**
 * 将文件拆分为多个固定大小的块。
 * @param file 需要拆分的文件对象。
 * @param chunkSize 每个块的大小，默认为CHUNK_SIZE。
 * @returns 返回一个包含多个文件块对象的数组，每个对象包含文件块和其大小。
 */
export const splitFile = (file: File, chunkSize = CHUNK_SIZE) => {
  const fileChunkList: FilePiece[] = []; // 用于存储拆分后文件块的列表
  let cur = 0; // 当前处理位置
  while (cur < file.size) {
    // 遍历文件直到处理完所有内容
    const piece = file.slice(cur, cur + chunkSize); // 获取当前块
    fileChunkList.push({
      // 将当前块信息添加到列表中
      chunk: piece,
      size: piece.size,
    });
    cur += chunkSize; // 更新当前处理位置
  }
  return fileChunkList; // 返回拆分后的文件块列表
};

/**
 * 分块上传文件。
 * @param pieces 文件分块信息数组。
 * @param hash 文件的hash值，用于标识文件。
 * @param onTick 上传进度回调函数。
 * @param cancelToken 用于取消上传的取消令牌。
 */
export const uploadChunks = async (params: {
  pieces: FilePiece[]; // 文件分块信息数组
  hash: string; // 文件hash值
  onTick?: (progress: number) => void; // 上传进度回调函数
  cancelToken: CancelTokenSource; // 取消上传的取消令牌
}) => {
  const { pieces: originChunks, hash, onTick, cancelToken } = params;
  const paralleSize = MAX_REQUESTS; // 最大并发上传请求数量
  const total = originChunks.length; // 总分块数

  // 递归执行上传逻辑，处理未上传成功的分块。
  const doUpload = async (pieces: FilePiece[]) => {
    // 剩余切片长度等于0
    if (pieces.length === 0) {
      // 所有分块上传完成，合并文件。
      mergeFile({ hash });
      console.log('上传完成');
      onTick?.(100); // 进度100
    }
    const pool: Promise<any>[] = []; // 并发上传任务池
    let finish = 0; // 已完成上传的分块数
    const failList: FilePiece[] = []; // 上传失败的分块列表
    // 循环遍历分块列表。
    for (let i = 0; i < pieces.length; i++) {
      const piece = pieces[i]; // 当前分块
      const params = { hash, chunk: piece.chunk, index: i };
      // 自执行函数: 查找分块是否已存在，不存在则上传。
      const task = (async () => {
        const { exists } = await findFile({ hash, index: i });
        if (!exists) {
          return await uploadChunk({ ...params, cancelToken });
        }
      })();
      // 处理任务结果。
      task
        .then(res => {
          // console.log(res);
          finish++;
          // 通过对比内存地址找到当前任务在池中的位置
          const j = pool.findIndex(t => t === task);
          // 去除当前任务，避免重复执行。
          pool.splice(j);
          // 更新上传进度。
          onTick?.((finish / total) * 100);
        })
        .catch(err => {
          // console.log(err);
          failList.push(piece); // 将失败的分块加入重试列表
        })
        .finally(() => {
          if (finish === pieces.length) {
            // 如果所有分块都已处理完毕，递归上传失败的分块。
            doUpload(failList);
          }
        });
      // 增加任务到并发池。
      pool.push(task);
      // 当并发池达到最大容量时，等待一个任务完成再添加新任务。
      if (pool.length === paralleSize) {
        // Promise.race
        // 有任意一个返回成功后，就算完成，
        // 但是进程不会立即停止
        await Promise.race(pool);
      }
    }
  };
  // 开始触发第一次上传。
  await doUpload(originChunks);
};
