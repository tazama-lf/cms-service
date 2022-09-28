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
}
