const winston = require('winston');

module.exports = function () {
  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    defaultMeta: { service: 'user-service' },
    transports: [
      new winston.transports.File({ filename: 'error.log', level: 'error' }),
      new winston.transports.File({ filename: 'combined.log' }),
    ],
  });

  process.on('uncaughtException', (ex) => {
    console.log('uncaught exeception happend');
    console.log(ex);
    logger.error(ex.message, ex);
  });

  process.on('unhandledRejection', (ex) => {
    console.log('unhandled Rejection  happend');
    logger.error(ex.message, ex);
  });
};
