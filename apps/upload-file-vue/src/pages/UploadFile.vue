<template>
  <div class="upload-container">
    <div class="wrap">
      <input type="file" hidden ref="file" @change="handleFileChange" multiple class="ipt" />
      <el-button type="warning" size="small" @click="() => file.click()">上传文件
      </el-button>
      <el-table :data="fileChunksArray" empty-text="无文件">
        <el-table-column prop="fileName" label="文件名"></el-table-column>
        <el-table-column label="文件大小">
          <template #default="{ row }">
            {{ fileSize(row.fileData) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag v-if="row.status === 'waiting'" type="info">等待上传</el-tag>
            <el-tag v-else-if="row.status === 'resolving'" type="warning">正在计算hash</el-tag>
            <el-tag v-else-if="row.status === 'uploading'" type="primary">上传中</el-tag>
            <el-tag v-else-if="row.status === 'success'" type="success">上传成功</el-tag>
            <el-tag v-else-if="row.status === 'error'" type="danger">上传失败</el-tag>
            <el-tag v-else-if="row.status === 'stop'" type="warning">暂停上传</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="percentage" label="上传进度">
          <template #default="{ row }">
            <el-progress width="50" type="circle" :percentage="parseFloat(row.percentage).toFixed(2)" />
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="{ row }">
            <div class="btn">
              <el-button type="text" size="small" @click="delFile(row)">删除</el-button>
              <el-button v-if="row.status == 'waiting'" type="primary" size="small"
                @click="uploadFile(row)">上传</el-button>
              <el-button v-if="row.status == 'uploading' || row.status == 'stop'" type="warning" size="small"
                @click="handlePause(row)">{{
        row.status == 'uploading' ? '暂停' : row.status == 'stop' ? '继续' : ''
                }}</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';
import { deleteFile, findFile } from '../api/upload';
import { calHash } from '../utils/hash';
import { type FilePieceArray, splitFile, uploadChunks } from '../utils/file';
import prettysize from 'prettysize';

const CancelToken = axios.CancelToken; // 作废方法
// let source = CancelToken.source(); // 作废状态
const fileArray = ref<Array<File> | null>(null); // 文件
const fileChunksArray = ref<FilePieceArray[]>([]); // 文件切片

const file = ref<HTMLInputElement>(); // 文件上传

// 获取文件
function handleFileChange(e: any) {
  fileArray.value = e.target.files; // 获取文件数组
  pretreatmentFile(); // 预处理文件
  setTimeout(() => {
    fileArray.value = null;
  }, 0);
}

// 预处理文件
async function pretreatmentFile() {
  // 文件为空直接弹出
  if (!fileArray.value) return;
  const len = fileArray.value.length;
  // 文件数组为空直接弹出
  if (!len) return;
  // 获取已切片的文件数组
  const source = CancelToken.source();
  for (let i = 0; i < len; i++) {
    const fileData = fileArray.value![i];
    const pieces = splitFile(fileData)
    fileChunksArray.value.push({
      fileData, // 文件分块信息数组
      pieces, // 文件分块信息数组
      fileName: fileArray.value![i].name, // 文件名
      hash: '', // 文件hash
      percentage: 0, // 进度
      status: 'resolving', // 上传状态
      cancelToken: source,
    });
    // 判断文件状态
    const piecesLen = fileChunksArray.value.length - 1;
    calHash({ chunks: pieces }).then(hash => {
      fileChunksArray.value[piecesLen].hash = hash;
      findFile({ hash }).then(({ exists }) => {
        if (exists) {
          fileChunksArray.value[piecesLen].status = 'success';
          fileChunksArray.value[piecesLen].percentage = 100;
        } else {
          fileChunksArray.value[piecesLen].status = 'waiting';
        }
      });
    });
  }
}

// 文件上传
async function uploadFile(row: FilePieceArray) {
  row.status = 'uploading';
  // 上传chuang
  await uploadChunks({
    pieces: row.pieces, // 文件切片数组
    hash: row.hash, // 文件hash
    cancelToken: row.cancelToken, // 取消/暂停 上传
    onTick: percentage => { // 更新进度
      row.percentage = percentage;
    },
  }).then(() => {
    row.status = 'success';
  }).catch((e) => {
    console.log(e);
    // if(e.message === '终止上传！') {
    //   row.status = 'stop';
    // } else {
    //   row.status = 'error';
    // }
  });
}

// 暂停或继续上传
async function handlePause(row: FilePieceArray) {
  row.status = row.status === 'uploading' ? 'stop' : 'uploading'; // 暂停/继续变更状态
  if (row.status === 'uploading') {
    // 继续上传chuang
    await uploadChunks({
      pieces: row.pieces, // 文件切片数组
      hash: row.hash, // 文件hash
      // cancelToken: row.cancelToken, // 取消/暂停 上传
      cancelToken: row.cancelToken,
      onTick: percentage => { // 更新进度
        row.percentage = percentage;
      },
    });
  } else if (row.status === 'stop') {
    // 暂停
    row.cancelToken.cancel('终止上传！');
    row.cancelToken = CancelToken.source();
  }
}

// 删除文件
async function delFile(row: FilePieceArray) {
  const index = fileChunksArray.value.findIndex(item => item.hash === row.hash);
  // 删除文件
  if (fileChunksArray.value[index].status === 'success') {
    await deleteFile({ hash: row.hash })
  }
  fileChunksArray.value.splice(index, 1);
}

// 获取文件大小，格式化
const fileSize = (file: File) => {
  return prettysize(file.size);
};
</script>

<style lang="css">
.upload-container {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  border: 1px #666 solid;
}

.wrap {
  width: 80%;
  height: 80%;
}

.ipt {
  margin-bottom: 10px;
  width: 100%;
}

.btn {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  height: 60px;
}
</style>
