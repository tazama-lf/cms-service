// SPDX-License-Identifier: Apache-2.0

import path from 'path';
import { config as dotenv } from 'dotenv';
import { type IConfig } from './interfaces';

// Load .env file into process.env if it exists. This is convenient for running locally.
dotenv({
  path: path.resolve(__dirname, '../.env'),
});

const config: IConfig = {
  functionName: process.env.FUNCTION_NAME!,
  nodeEnv: process.env.NODE_ENV!,
  restPort: parseInt(process.env.REST_PORT!, 10) || 3000,
  logstashUrl: process.env.LOGSTASH_URL!,
  apmLogging: (process.env.APM_LOGGING === 'true'),
  apmSecretToken: process.env.APM_SECRET_TOKEN!,
  apmURL: process.env.APM_URL!,
  forwardRequest: (process.env.FORWARD_REQUEST === 'true'),
  forwardURL: process.env.FORWARD_URL!,
  sybrinBaseURL: process.env.SYBRIN_BASE_URL!,
  sybrinUsername: process.env.SYBRIN_USERNAME!,
  sybrinPassword: process.env.SYBRIN_PASSWORD!,
  sybrinEnvironmentID: process.env.SYBRIN_ENVIRONMENT_ID!,
  nuxeoReport: (process.env.NUXEO_REPORT === 'true'),
  nuxeoAuth: process.env.NUXEO_AUTH!,
  nuxeoHost: process.env.NUXEO_HOST!,
  nuxeoFolderPath: process.env.NUXEO_FOLDER_PATH!,
  nuxeoFolderId: process.env.NUXEO_FOLDER_ID!,
};

export { config };
