import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

// 確定日誌目錄
const logDir = process.env.NODE_ENV === 'production' ? '/app/logs' : path.join(process.cwd(), 'logs');

// 創建日誌格式
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// 創建日誌輪轉文件傳輸
const fileTransport = new winston.transports.DailyRotateFile({
  dirname: logDir,
  filename: 'educreate-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: logFormat
});

// 創建錯誤日誌輪轉文件傳輸
const errorFileTransport = new winston.transports.DailyRotateFile({
  dirname: logDir,
  filename: 'educreate-error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  level: 'error',
  format: logFormat
});

// 創建控制台傳輸（僅在開發環境使用）
const consoleTransport = new winston.transports.Console({
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.simple()
  )
});

// 創建日誌實例
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  defaultMeta: { service: 'educreate' },
  transports: [
    fileTransport,
    errorFileTransport,
    ...(process.env.NODE_ENV !== 'production' ? [consoleTransport] : [])
  ],
  exitOnError: false
});

// 添加Sentry集成（如果在生產環境中）
if (process.env.NODE_ENV === 'production' && process.env.SENTRY_DSN) {
  // 這裡可以添加Sentry集成代碼
  // 需要安裝@sentry/node包
}

export default logger;