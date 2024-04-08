import request from 'supertest';
import logger from 'koa-pino-logger';
import Koa from 'koa';

import { HttpError } from '../../src/utils/http-error';
import { errorCatch } from '../../src/middlewares/error-catch';

describe('errorCatch middleware', () => {
  let app: Koa;

  beforeEach(() => {
    app = new Koa();
  });

  it('should catch and handle errors correctly', async () => {
    const errorMessage = 'Test error';

    app.use(logger());
    app.use(errorCatch());
    app.use(() => {
      throw new Error(errorMessage);
    });

    const response = await request(app.callback()).get('/');

    expect(response.status).toBe(500);
    console.log(response.error);
    expect(response.body.message).toContain(
      `Unhandle error: ${errorMessage}\nError: ${errorMessage}`,
    );
  });

  it('should handle HttpError correctly', async () => {
    const errorMessage = 'Test HttpError';
    const errorCode = 400;

    app.use(logger());
    app.use(errorCatch());
    app.use(() => {
      throw new HttpError(errorCode, errorMessage);
    });

    const response = await request(app.callback()).get('/');

    expect(response.status).toBe(errorCode);
    expect(response.body.message).toContain(`Unhandle error: ${errorMessage}`);
  });
});
