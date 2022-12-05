export interface IConfig {
  functionName: string;
  nodeEnv: string;
  restPort: number;
  logstashUrl: string;
  apmLogging: boolean;
  apmSecretToken: string;
  apmURL: string;
  forwardRequest: string;
  forwardURL: string;
  sybrinBaseURL:string;
  sybrinUsername:string;
  sybrinPassword:string;
  sybrinEnvironmentID:string;
  nuxeoAuth: string;
  nuxeoHost: string;
  nuxeoFolderPath: string;
  nuxeoFolderId: string;
}
