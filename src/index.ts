// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-console */
import { LoggerService } from './utils';
import { config } from './config';
import apm from 'elastic-apm-node';
import { monitorQuote } from './app.controller';
import { IStartupService, StartupFactory } from '@frmscoe/frms-coe-startup-lib';

if (config.apmLogging) {
  apm.start({
    serviceName: config.functionName,
    secretToken: config.apmSecretToken,
    serverUrl: config.apmURL,
    usePathAsTransactionName: true,
    active: config.apmLogging,
    transactionIgnoreUrls: ['/health'],
    disableInstrumentations: ['log4js'],
  });
}
export let server: IStartupService;

export const runServer = async (): Promise<void> => {
  server = new StartupFactory();
  if (config.nodeEnv !== 'test') {
    let isConnected = false;
    for (let retryCount = 0; retryCount < 10; retryCount++) {
      console.log('Connecting to nats server...');
      if (!(await server.init(monitorQuote))) {
        await new Promise((resolve) => setTimeout(resolve, 5000));
      } else {
        console.log('Connected to nats');
        isConnected = true;
        break;
      }
    }

    if (!isConnected) {
      throw new Error('Unable to connect to nats after 10 retries');
    }
  }
};

process.on('uncaughtException', (err) => {
  LoggerService.error(`process on uncaughtException error: ${err}`);
});

process.on('unhandledRejection', (err) => {
  LoggerService.error(`process on unhandledRejection error: ${err}`);
});

(async () => {
  try {
    await runServer();
  } catch (err) {
    LoggerService.error('Error while starting services', err);
    process.exit(1);
  }
})();
