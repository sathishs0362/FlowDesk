type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levelWeight: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const currentLevel = ((import.meta.env.VITE_LOG_LEVEL ?? 'info') as LogLevel) || 'info';

const shouldLog = (level: LogLevel): boolean => levelWeight[level] >= levelWeight[currentLevel];

export const logger = {
  debug: (...args: unknown[]) => {
    if (shouldLog('debug')) {
      console.debug('[FlowDesk]', ...args);
    }
  },
  info: (...args: unknown[]) => {
    if (shouldLog('info')) {
      console.info('[FlowDesk]', ...args);
    }
  },
  warn: (...args: unknown[]) => {
    if (shouldLog('warn')) {
      console.warn('[FlowDesk]', ...args);
    }
  },
  error: (...args: unknown[]) => {
    if (shouldLog('error')) {
      console.error('[FlowDesk]', ...args);
    }
  },
};
