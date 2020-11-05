const assert = require('assert');
// const sinon = require('sinon');

const logger = require('../index');

process.env.NODE_ENV = 'Development';
process.env.LOG_LEVEL = 'trace';

describe('A logger', () => {
  it('call some logs to see format and colors', () => {
    const log = logger.makeLogger('123456', process.env.LOG_LEVEL);
    log.fatal('log fatal level');
    log.error('log error level');
    log.warn('log warn level');
    log.success('log success level');
    log.info('log info level');
    log.profile('log profile level');
    log.debug('log debug level');
    log.trace('log trace level');
  });
});
