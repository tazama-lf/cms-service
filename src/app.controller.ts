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
    if (config.forwardRequest) {
      const toSend = {
        "ProcessID": "a8868aed-e1a8-4ca8-88e5-da8d4b5df94d",
        "MicroFlowName": "ReceiveAlert",
        "JobID": "ba430713-879f-49fe-bcad-aee65b4a88b1",
        "BaseUrl": "https://JNB-IDP.sybrin.co.za:443/Sybrin.Core.API/api",
        "Token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IjZlYTc4MWQ1LTc2OTMtNDM1Mi1iOWUxLWE2Mzc0NWQyZjQ3OSIsIlVzZXJOYW1lIjoiYWRtaW4iLCJyb2xlIjoiQWRtaW5pc3RyYXRvciIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL3VyaSI6IjEwLjI0Mi4yLjk2IiwiU2Vzc2lvbklEIjoiYTllMmViYTQtNDhhZC00MWQ3LWI2YmYtMWY5MzdkYjJiODI4IiwiQ29tcHV0ZXJJRCI6IkpGT0wtTkItMDQuc3licmluLmNvLnphIiwiTWluaW11bUxpZmVzcGFuIjoiNzUwMCIsIk1vZHVsZSI6IjkiLCJJc0FkbWluIjoiMSIsIklzTWljcm9TZXJ2aWNlIjoiMCIsIk9yZ0lEIjoiIiwiU0NvZGUiOiIiLCJTZWNNb2RJRCI6IjBhMzRjOWM4LTViMmEtNGRmZS1iZTExLTFkNTY5YjRlYTQ2YiIsIkxpbWl0U2Vzc2lvbiI6IkZhbHNlIiwiU2VydmVyRXhwIjoiNjM4MDAwNjA4MTYxODA3OTY2IiwiQWxsb3dNdWx0aXBsZVNlc3Npb25zIjoiRmFsc2UiLCJVc2VyUmVnaXN0cmF0aW9uUmVxdWlyZWQiOiJGYWxzZSIsIklzTXVsdGlCcmFuY2giOiIwIiwiRXhwaXJlcyI6IjYzODAwMDYwODE2MTgwNzkxMCIsIkVudmlyb25tZW50SUQiOiI1N2U4ODUwNS0zZmNhLTQ5MDgtODZiMi03NWE1NWRjNzJlMDAiLCJQbGF0Zm9ybSI6IlNFUyIsIlVzZXJEaXNwbGF5TmFtZSI6InN5c3RlbSIsIm5iZiI6MTY2NDQ0OTAxNiwiZXhwIjoxNjY0NDY0MDE2LCJpYXQiOjE2NjQ0NDkwMTYsImlzcyI6IlN5YnJpbiIsImF1ZCI6IkJlYXJlciJ9.hxjMv1DlB0NeNvmhX0wmiE1Ph3HFHTQEIfLXdjg9LqcK91DyoUvUB8mnWBoCzza1Y_T8Eq0Rj1ymmkDsj-hlLSoqCkQOhIOrfs7V8WlWXQ8q8z1lEB3go2x_DTy2Bz1uJb-DN67988CuM8a9ySVXO8QiXaYRYCmDufAv5Nryu5H0kxAJBpea1duYZPjoioKIoAJlE9_-8CSpLv3jIGHebWM4zBGHcSQ8Hla4yHr9HHN5591N7OE01nyDs6QAZpghNuvAWoRSR5OicNk7P4SwiEBx0ndKcRjCIb89kV4awZNdMe8rIDR0XG29vQc1BGXSm5fxeZClQLg_RVc7cU4bxg",
        "Data": [{
          "properties": request          
        }]
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
