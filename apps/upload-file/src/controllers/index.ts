import { koaBody } from 'koa-body'; // 解析提交中间件
import Koa from 'koa';
import Router from '@koa/router';

//          检测文件   切片文件上传   合并文件
import {
  API_FIND_FILE,
  API_CHUNK,
  API_MERGE_FILE,
  API_FIND_DELETE,
} from '../const';
// 上传切片执行方法
import { saveChunkController } from './save-file';
// 查询文件执行方法
import { findFileController } from './find';
// 合并文件执行方法
import { deleteFileController, mergeChunksController } from './merge';

export const defineRoutes = (app: Koa) => {
  const router = new Router();

  // ping一下，测试通不通
  router.get('/api/ping', async ctx => {
    ctx.body = 'pong';
  });

  // 查询文件
  router.get(API_FIND_FILE, findFileController);
  // 上传切片
  // multipart: true 表示允许接收multipart/form-data类型的请求体，
  router.post(API_CHUNK, koaBody({ multipart: true }), saveChunkController);
  // 合并文件
  router.post(API_MERGE_FILE, koaBody(), mergeChunksController);
  // 删除文件
  router.delete(API_FIND_DELETE, deleteFileController);

  // 1.将路由定义中间件挂载到应用程序上，它会处理所有的HTTP请求方法。
  // 2.将路由中间件和允许的方法中间件挂载到应用程序上，以实现HTTP请求的处理和方法允许的控制。
  // 2白话文翻译：如果项目中存在get请求，而我们使用post请求，则会提示我们请求方法
  // 2还有一个好处就是请求不存在的接口，本来也该返回404，加了后返回405
  app.use(router.routes()).use(router.allowedMethods());
};
