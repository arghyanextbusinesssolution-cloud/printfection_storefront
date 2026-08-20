type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel =
  process.env.NODE_ENV === 'production' ? 'info' : 'debug';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function formatMessage(level: LogLevel, message: string, meta?: unknown): string {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  if (meta !== undefined) {
    return `${base} ${JSON.stringify(meta, null, process.env.NODE_ENV === 'production' ? 0 : 2)}`;
  }
  return base;
}

export const logger = {
  info(message: string, meta?: unknown) {
    if (shouldLog('info')) console.log(formatMessage('info', message, meta));
  },
  warn(message: string, meta?: unknown) {
    if (shouldLog('warn')) console.warn(formatMessage('warn', message, meta));
  },
  error(message: string, meta?: unknown) {
    if (shouldLog('error')) console.error(formatMessage('error', message, meta));
  },
  debug(message: string, meta?: unknown) {
    if (shouldLog('debug')) console.debug(formatMessage('debug', message, meta));
  },
};
