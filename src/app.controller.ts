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
        "Token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1bmlxdWVfbmFtZSI6IjZlYTc4MWQ1LTc2OTMtNDM1Mi1iOWUxLWE2Mzc0NWQyZjQ3OSIsIlVzZXJOYW1lIjoiYWRtaW4iLCJyb2xlIjoiQWRtaW5pc3RyYXRvciIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL3VyaSI6IjEwLjI0Mi4yLjEwOSIsIlNlc3Npb25JRCI6Ijk3YmM2ZDg5LTRmZjItNDkxOS05MWIzLTRkYzcxODdlMTlhYyIsIkNvbXB1dGVySUQiOiJKRk9MLU5CLTA0LnN5YnJpbi5jby56YSIsIk1pbmltdW1MaWZlc3BhbiI6Ijc1MDAiLCJNb2R1bGUiOiI5IiwiSXNBZG1pbiI6IjEiLCJJc01pY3JvU2VydmljZSI6IjAiLCJPcmdJRCI6IiIsIlNDb2RlIjoiIiwiU2VjTW9kSUQiOiIwYTM0YzljOC01YjJhLTRkZmUtYmUxMS0xZDU2OWI0ZWE0NmIiLCJMaW1pdFNlc3Npb24iOiJGYWxzZSIsIlNlcnZlckV4cCI6IjYzNzk5OTkzODUwNTczOTI0NyIsIkFsbG93TXVsdGlwbGVTZXNzaW9ucyI6IkZhbHNlIiwiVXNlclJlZ2lzdHJhdGlvblJlcXVpcmVkIjoiRmFsc2UiLCJJc011bHRpQnJhbmNoIjoiMCIsIkV4cGlyZXMiOiI2Mzc5OTk5Mzg1MDU3MzkxNzAiLCJFbnZpcm9ubWVudElEIjoiNTdlODg1MDUtM2ZjYS00OTA4LTg2YjItNzVhNTVkYzcyZTAwIiwiUGxhdGZvcm0iOiJTRVMiLCJVc2VyRGlzcGxheU5hbWUiOiJzeXN0ZW0iLCJuYmYiOjE2NjQzODIwNTAsImV4cCI6MTY2NDM5NzA1MCwiaWF0IjoxNjY0MzgyMDUwLCJpc3MiOiJTeWJyaW4iLCJhdWQiOiJCZWFyZXIifQ.UFkmTvaGuVMb9QFgxux4ZcFp4NPuWBYmMIWKVF7ySLNuGY7oaA_QYhRuN4TbkxU8NSq_fWfQB5fYAex6R4zwZn1YGJvtWWGRPvISDnMlELgv8SXbQpvWMp2B0W1TqW7lcymt7qP-xD9OSwjmCXMHPokh-VtVY3TM8S8naIFsFh32ZEWzaQimaqPfv_lF5wkRJXmO3T5n4secnZkHeuElGyPJMuYBey4b6CtbrkWswp9p97Rs0iyo07UsO-axVL7mWtDCYbNUGbWjvf9KncSkqoX5oYosSaCMVPMAxPDn-VjZ8twFKXaYhecStQt6zm_-y2zAfFjuPCl6c1Wn_MC1HA",
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
