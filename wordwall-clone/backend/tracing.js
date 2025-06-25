// OpenTelemetry 追蹤配置
// 用於監控 AI Agent 的開發過程和應用性能

const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');

// 創建 Jaeger 導出器
const jaegerExporter = new JaegerExporter({
  endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
  serviceName: 'wordwall-clone-backend',
});

// 創建資源標識
const resource = new Resource({
  [SemanticResourceAttributes.SERVICE_NAME]: 'wordwall-clone-backend',
  [SemanticResourceAttributes.SERVICE_VERSION]: '0.1.0',
  [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
  'ai.agent.enabled': true,
  'ai.agent.mcps': 'filesystem,memory,sequential,prisma,puppeteer',
});

// 創建 SDK 實例
const sdk = new NodeSDK({
  resource,
  traceExporter: jaegerExporter,
  instrumentations: [
    getNodeAutoInstrumentations({
      // 禁用某些不需要的儀器
      '@opentelemetry/instrumentation-fs': {
        enabled: false, // 文件系統操作太多，會產生噪音
      },
      '@opentelemetry/instrumentation-http': {
        enabled: true,
        requestHook: (span, request) => {
          // 添加自定義屬性
          span.setAttributes({
            'http.request.user_agent': request.headers['user-agent'],
            'ai.request.type': request.headers['x-ai-request-type'] || 'unknown',
          });
        },
      },
      '@opentelemetry/instrumentation-express': {
        enabled: true,
      },
      '@opentelemetry/instrumentation-prisma': {
        enabled: true,
      },
    }),
  ],
});

// 初始化 SDK
sdk.start();

// 創建自定義追蹤器
const { trace } = require('@opentelemetry/api');
const tracer = trace.getTracer('wordwall-clone-ai-agent', '1.0.0');

// AI Agent 專用追蹤函數
const aiAgentTracer = {
  // 追蹤代碼生成過程
  traceCodeGeneration: (operation, callback) => {
    return tracer.startActiveSpan(`ai.code_generation.${operation}`, (span) => {
      try {
        span.setAttributes({
          'ai.operation.type': 'code_generation',
          'ai.operation.name': operation,
          'ai.timestamp': new Date().toISOString(),
        });
        
        const result = callback();
        
        if (result && typeof result.then === 'function') {
          // 處理 Promise
          return result
            .then((res) => {
              span.setAttributes({
                'ai.operation.status': 'success',
                'ai.operation.result_size': JSON.stringify(res).length,
              });
              span.end();
              return res;
            })
            .catch((error) => {
              span.setAttributes({
                'ai.operation.status': 'error',
                'ai.operation.error': error.message,
              });
              span.recordException(error);
              span.end();
              throw error;
            });
        } else {
          // 處理同步結果
          span.setAttributes({
            'ai.operation.status': 'success',
            'ai.operation.result_size': JSON.stringify(result).length,
          });
          span.end();
          return result;
        }
      } catch (error) {
        span.setAttributes({
          'ai.operation.status': 'error',
          'ai.operation.error': error.message,
        });
        span.recordException(error);
        span.end();
        throw error;
      }
    });
  },

  // 追蹤 MCP 服務器調用
  traceMCPCall: (mcpServer, operation, callback) => {
    return tracer.startActiveSpan(`mcp.${mcpServer}.${operation}`, (span) => {
      try {
        span.setAttributes({
          'mcp.server': mcpServer,
          'mcp.operation': operation,
          'mcp.timestamp': new Date().toISOString(),
        });
        
        const result = callback();
        
        if (result && typeof result.then === 'function') {
          return result
            .then((res) => {
              span.setAttributes({
                'mcp.status': 'success',
                'mcp.response_size': JSON.stringify(res).length,
              });
              span.end();
              return res;
            })
            .catch((error) => {
              span.setAttributes({
                'mcp.status': 'error',
                'mcp.error': error.message,
              });
              span.recordException(error);
              span.end();
              throw error;
            });
        } else {
          span.setAttributes({
            'mcp.status': 'success',
            'mcp.response_size': JSON.stringify(result).length,
          });
          span.end();
          return result;
        }
      } catch (error) {
        span.setAttributes({
          'mcp.status': 'error',
          'mcp.error': error.message,
        });
        span.recordException(error);
        span.end();
        throw error;
      }
    });
  },

  // 追蹤遊戲邏輯執行
  traceGameLogic: (gameType, operation, callback) => {
    return tracer.startActiveSpan(`game.${gameType}.${operation}`, (span) => {
      try {
        span.setAttributes({
          'game.type': gameType,
          'game.operation': operation,
          'game.timestamp': new Date().toISOString(),
        });
        
        const result = callback();
        
        if (result && typeof result.then === 'function') {
          return result
            .then((res) => {
              span.setAttributes({
                'game.status': 'success',
                'game.duration': Date.now() - span.startTime,
              });
              span.end();
              return res;
            })
            .catch((error) => {
              span.setAttributes({
                'game.status': 'error',
                'game.error': error.message,
              });
              span.recordException(error);
              span.end();
              throw error;
            });
        } else {
          span.setAttributes({
            'game.status': 'success',
            'game.duration': Date.now() - span.startTime,
          });
          span.end();
          return result;
        }
      } catch (error) {
        span.setAttributes({
          'game.status': 'error',
          'game.error': error.message,
        });
        span.recordException(error);
        span.end();
        throw error;
      }
    });
  },

  // 追蹤數據庫操作
  traceDatabase: (operation, model, callback) => {
    return tracer.startActiveSpan(`db.${model}.${operation}`, (span) => {
      try {
        span.setAttributes({
          'db.operation': operation,
          'db.model': model,
          'db.timestamp': new Date().toISOString(),
        });
        
        const result = callback();
        
        if (result && typeof result.then === 'function') {
          return result
            .then((res) => {
              span.setAttributes({
                'db.status': 'success',
                'db.result_count': Array.isArray(res) ? res.length : 1,
              });
              span.end();
              return res;
            })
            .catch((error) => {
              span.setAttributes({
                'db.status': 'error',
                'db.error': error.message,
              });
              span.recordException(error);
              span.end();
              throw error;
            });
        } else {
          span.setAttributes({
            'db.status': 'success',
            'db.result_count': Array.isArray(result) ? result.length : 1,
          });
          span.end();
          return result;
        }
      } catch (error) {
        span.setAttributes({
          'db.status': 'error',
          'db.error': error.message,
        });
        span.recordException(error);
        span.end();
        throw error;
      }
    });
  },
};

// 導出追蹤器
module.exports = {
  sdk,
  tracer,
  aiAgentTracer,
};

// 優雅關閉
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('Tracing terminated'))
    .catch((error) => console.log('Error terminating tracing', error))
    .finally(() => process.exit(0));
});
