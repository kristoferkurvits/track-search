import AppConfig from "./appConfig";

const winston = require('winston');

const config = AppConfig.getInstance();

const logFormat = winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
  });

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'combined.info' }),
    new winston.transports.File({ filename: 'error.info', level: 'error' }),
  ],
});

if (!config.isProduction()) {
    logger.add(new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        logFormat
      )
    }));
  }

export default logger;