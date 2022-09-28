import axios from 'axios';
import { Context } from 'koa';
import { config } from './config';
import { LoggerService } from './utils';

export const monitorQuote = async (ctx: Context): Promise<Context> => {
  try {
    const request = ctx.request.body ?? JSON.parse('');
    if (request.typologyResult)
      LoggerService.log(`CMS received Interdiction from Typology ${request?.typologyResult?.id ?? 0}@${request?.typologyResult?.cfg ?? 0} - Score: ${request?.typologyResult?.result ?? 0}, Threshold: ${request?.typologyResult?.threshold ?? 0}.`);
    else
      LoggerService.log('CMS received request from TADP.');

    ctx.status = 200;
    ctx.body = {
      message: 'Transaction is valid',
      data: request,
    };
    if (config.forwardRequest) {
      const toSend = {
        "ProcessID": "a8868aed-e1a8-4ca8-88e5-da8d4b5df94d",
        "MicroFlowName": "ReceiveAlert",
        "Data": [request]
      }
      await executePost(config.forwardURL, toSend);
    }

  } catch (error) {
    LoggerService.log(error as string);

    ctx.status = 500;
    ctx.body = {
      error: error,
    };
  }
  return ctx;
};


// Submit the score to the CADP
const executePost = async (endpoint: string, request: any) => {
  try {
    const cmsRes = await axios.post(endpoint, request);
    if (cmsRes.status !== 200) {
      LoggerService.error(`CMS Response unsuccessful with StatusCode: ${cmsRes.status}, request:\r\n${request}`);
    }
  } catch (error) {
    LoggerService.error(`Error while sending request to CMS at ${endpoint ?? ""} with message: ${error}`);
    LoggerService.trace(`CADP Error Request:\r\n${request}`);
  }
};