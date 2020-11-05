const winston = require('winston');
const moment = require('moment');

const { createLogger, format, transports } = winston;
const {
  colorize,
  combine,
  label,
  printf,
  timestamp,
} = format;

const isLabel = (info) => (info.label ? `[_${info.label}_]` : '');
const defaultFormat = printf((info) => (
  `${moment(info.timestamp).format('MMM D, HH:mm:ss:SSS')} - ${isLabel(info)} [_${info.level}_] : ${info.message}`
));

const myCustomLevels = {
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    success: 3,
    info: 4,
    profile: 5,
    debug: 6,
    trace: 7,
  },
  colors: {
    fatal: 'magenta',
    error: 'red',
    warn: 'yellow',
    success: 'green',
    info: 'blue',
    profile: 'cyan',
    debug: 'gray',
    trace: 'grey',
  },
};

winston.addColors(myCustomLevels.colors);

const combineProd = (tag) => combine(
  timestamp(),
  label({ label: tag }),
  defaultFormat,
);

const combineDev = (tag) => combine(
  timestamp(),
  colorize(),
  label({ label: tag }),
  defaultFormat,
);

const getCombine = (tag) => (
  process.env.NODE_ENV === 'Production' ? combineProd(tag) : combineDev(tag)
);

const getLogger = (tag, level) => createLogger({
  format: getCombine(tag),
  transports: [
    new transports.Console({ level }),
  ],
  levels: myCustomLevels.levels,
  silent: process.env.NODE_ENV === 'Test',
});

const makeLogger = (tag, level) => {
  const logger = getLogger(tag, level);

  function makeLogFunction(name) {
    return (data) => (
      logger[name](JSON.stringify(data))
    );
  }

  return {
    fatal: makeLogFunction('fatal'),
    error: makeLogFunction('error'),
    warn: makeLogFunction('warn'),
    success: makeLogFunction('success'),
    info: makeLogFunction('info'),
    profile: makeLogFunction('profile'),
    debug: makeLogFunction('debug'),
    trace: makeLogFunction('trace'),
  };
};

const loggerMiddleware = (req, res, next) => {
  const transactionId = req.get('transaction_id') || req.body.transactionId || Math.round(Math.random() * (70000 - 1000));
  const logger = makeLogger(String(transactionId).trim(), process.env.LOG_LEVEL);
  req.logger = logger;
  return next();
};

module.exports = {
  loggerMiddleware,
  makeLogger,
  logger: getLogger(),
};
