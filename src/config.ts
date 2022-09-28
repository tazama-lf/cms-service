/* eslint-disable @typescript-eslint/no-non-null-assertion */
import path from 'path';
import { config as dotenv } from 'dotenv';
import { IConfig } from './interfaces';

// Load .env file into process.env if it exists. This is convenient for running locally.
dotenv({
  path: path.resolve(__dirname, '../.env'),
});

const config: IConfig = {
  functionName: <string>process.env.FUNCTION_NAME,
  nodeEnv: <string>process.env.NODE_ENV,
  restPort: parseInt(process.env.REST_PORT!, 10) || 3000,
  logstashUrl: <string>process.env.LOGSTASH_URL,
  apmLogging: <boolean>(process.env.APM_LOGGING === 'true'),
  apmSecretToken: <string>process.env.APM_SECRET_TOKEN,
  apmURL: <string>process.env.APM_URL,
  forwardRequest:<string> process.env.FORWARD_REQUEST,
  forwardURL:<string> process.env.FORWARD_URL,
};

export { config };
