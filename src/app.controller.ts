import axios from 'axios';
import { Context } from 'koa';
import { config } from './config';
import { sendReportResult } from './services/nuxeo';
import { LoggerService } from './utils';

export const monitorQuote = async (ctx: Context): Promise<Context> => {
  try {
    const request = ctx.request.body ?? JSON.parse('');
    if (request.typologyResult)
      LoggerService.log(
        `CMS received Interdiction from Typology ${request?.typologyResult?.id ?? 0}@${request?.typologyResult?.cfg ?? 0} - Score: ${
          request?.typologyResult?.result ?? 0
        }, Threshold: ${request?.typologyResult?.threshold ?? 0}.`,
      );
    else {
      LoggerService.log('CMS received request from TADP.');

      try {
        LoggerService.log('Start - Execute Nuxeo report request');
        await sendReportResult(request);
      } catch (err) {
        const failMsg = 'Failed to send report';
        LoggerService.error(failMsg, err, 'executeController');
      } finally {
        LoggerService.log('END - Execute Nuxeo report request');
      }
    }

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
