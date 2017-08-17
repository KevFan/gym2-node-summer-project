const winston = require('winston');

/**
 * Logger object, with json formatting set to true
 */
const logger = new (winston.Logger)({
  transports: [new (winston.transports.Console)({ json: true })],
});

logger.level = 'debug';

if (process.env.LEVEL) {
  logger.level = process.env.LEVEL;
}

module.exports = logger;
