import logger from 'koa-pino-logger';
import Koa from 'koa';
import KoaWebsocket from 'koa-websocket';

// middlewares为中间件文件夹
import { errorCatch } from './middlewares/error-catch'; // 捕获报错
import { configProvider } from './middlewares/config'; // 提供文件存储位置
import { defineRoutes, defineWebSocketRoutes } from './controllers'; // 管理路由

interface ContextConfig {
  fileStorageRoot: string; // 默认文件存储根目录
}
export const bootstrap = (
  context: {
    port: number; // 端口号
  },
  config: ContextConfig, // 默认文件存储根目录
) => {
  /**
   * 初始化服务器端口和应用
   * @param context - 上下文对象，包含服务器配置等信息
   */
  const port = Number(context.port) || 3000; // 尝试从上下文获取端口号，如果不存在则默认使用3000端口
  const app = KoaWebsocket(new Koa()); // 创建一个新的Koa应用
  // 使用错误捕获中间件
  app.use(errorCatch());
  // 日志记录中间件
  app.use(logger());

  // 使用中间件为每个请求增加文件存储根目录
  app.use(configProvider<ContextConfig>(config));
  // 定义非webSocket应用的路由
  defineRoutes(app);
  // 定义webSocket应用的路由
  defineWebSocketRoutes(app);

  // 返回一个新的Promise，用于启动应用并监听指定端口。
  return new Promise((resolve, reject) => {
    try {
      // 尝试启动应用并监听指定端口
      app.listen(port, () => {
        // 成功监听端口后，解决Promise
        resolve({ port });
      });
    } catch (e) {
      // 启动失败时，拒绝Promise
      reject(e);
    }
  });
};
