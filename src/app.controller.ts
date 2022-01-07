import { Context } from 'koa';
import { LoggerService } from './utils';

export const monitorQuote = async (ctx: Context): Promise<Context> => {
  try {
    const request = ctx.request.body ?? JSON.parse('');

    LoggerService.log('CMS received request from TADP.');
    ctx.status = 200;
    ctx.body = {
      message: 'Transaction is valid',
      data: request,
    };
  } catch (error) {
    LoggerService.log(error as string);

    ctx.status = 500;
    ctx.body = {
      error: error,
    };
  }
  return ctx;
};
