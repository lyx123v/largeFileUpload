import { type Context, type Middleware } from 'koa';

import { HttpError } from '../utils/http-error';
import { ENV } from '../const';

/**
 * 创建一个错误捕获的中间件。
 * 该中间件用于捕获应用中未处理的异常，并统一处理错误响应。
 *
 * @returns 返回一个中间件函数。
 */
export const errorCatch = (): Middleware => {
  return async (ctx: Context, next: () => Promise<void>) => {
    try {
      await next(); // 执行后续中间件
    } catch (e) {
      const err = e as Error;
      const message = `Unhandle error: ${err.message || e}`; // 构造错误信息
      ctx.log.error(message); // 记录错误日志
      const code = e instanceof HttpError ? e.code : 500; // 根据错误类型设置响应状态码，无则默认500
      ctx.status = code; // 设置响应状态码
      // 设置响应体，生产环境只返回错误信息，开发环境返回错误信息和错误堆栈
      ctx.body = {
        code,
        message:
          ENV === 'production'
            ? message
            : `Unhandle Error: ${message}\n${err.stack}`,
      };
    }
  };
};
