import * as Sentry from '@sentry/nextjs';
import logger from './logger';

// 只在生產環境中初始化Sentry
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.5, // 採樣率，可根據流量調整
    environment: process.env.NODE_ENV,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
    ],
    // 性能監控設置
    performance: {
      tracingOrigins: ['localhost', /^\//],
    },
  });

  logger.info('Sentry 監控已初始化');
} else {
  logger.debug('Sentry 監控未初始化（非生產環境或缺少DSN）');
}

// 導出用於手動捕獲錯誤的函數
export const captureException = (error: Error, context?: Record<string, any>) => {
  logger.error(`錯誤: ${error.message}`, { error, ...context });
  
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context,
    });
  }
};

// 導出用於手動捕獲消息的函數
export const captureMessage = (message: string, level?: Sentry.SeverityLevel, context?: Record<string, any>) => {
  const logMethod = level === 'error' ? logger.error : 
                   level === 'warning' ? logger.warn : 
                   level === 'info' ? logger.info : logger.debug;
  
  logMethod(message, context);
  
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.captureMessage(message, {
      level,
      extra: context,
    });
  }
};

// 導出用於設置用戶上下文的函數
export const setUser = (user: { id: string; email?: string; username?: string }) => {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.setUser(user);
  }
};

// 導出用於清除用戶上下文的函數
export const clearUser = () => {
  if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
    Sentry.setUser(null);
  }
};