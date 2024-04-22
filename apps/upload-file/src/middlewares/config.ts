import { type DefaultContext, type Context, type Middleware } from 'koa';

export const configProvider = <T>(config: T): Middleware => {
  return async (ctx: DefaultContext, next: () => Promise<void>) => {
    // 为每个请求设置一个可以随时读取文件存储根目录的位置
    ctx.readConfig = (): T => config;
    await next();
  };
};
