import { createLogger, transports, format } from 'winston';

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.colorize(),
    format.timestamp({
      format: 'HH-MM:ss YYYY-MM-DD'
    }),
    format.printf(msg => {
      return `${msg.timestamp} ${msg.level}: ${msg.message}`;
    }),
  ),
  transports: [new transports.Console()]
});

export default class Logger {
  static error(...args: any[]) {
    // @ts-ignore
    logger.error(...args);
  }

  static warn(...args: any[]) {
    // @ts-ignore
    logger.warn(...args);
  }

  static info(...args: any[]) {
    // @ts-ignore
    logger.info(...args);
  }

  static http(...args: any[]) {
    // @ts-ignore
    logger.http(...args);
  }

  static verbose(...args: any[]) {
    // @ts-ignore
    logger.verbose(...args);
  }

  static debug(...args: any[]) {
    // @ts-ignore
    logger.debug(...args);
  }

  static silly(...args: any[]) {
    // @ts-ignore
    logger.silly(...args);
  }
}
