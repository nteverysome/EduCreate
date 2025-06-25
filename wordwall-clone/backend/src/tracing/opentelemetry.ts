// 簡化的 OpenTelemetry 配置，避免依賴問題
console.log('OpenTelemetry tracing initialized (simplified mode)');

// 導出一個簡化的追蹤服務
export const openTelemetryService = {
  traceOperation: async <T>(name: string, operation: () => Promise<T>): Promise<T> => {
    console.log(`[TRACE] Starting operation: ${name}`);
    const start = Date.now();
    try {
      const result = await operation();
      console.log(`[TRACE] Completed operation: ${name} (${Date.now() - start}ms)`);
      return result;
    } catch (error) {
      console.error(`[TRACE] Failed operation: ${name} (${Date.now() - start}ms)`, error);
      throw error;
    }
  },

  traceHttpRequest: (method: string, path: string, statusCode: number, duration: number) => {
    console.log(`[HTTP] ${method} ${path} - ${statusCode} (${duration}ms)`);
  },

  recordError: (error: Error, context: Record<string, any>) => {
    console.error(`[ERROR]`, error.message, context);
  }
};

export default openTelemetryService;

/**
 * OpenTelemetry 配置和工具類
 * 
 * 功能：
 * - 自動儀表化
 * - 分佈式追蹤
 * - 性能指標收集
 * - 錯誤監控
 */
export class OpenTelemetryService {
  private sdk: NodeSDK;
  private tracer: any;
  private meter: any;
  private counters: Map<string, any> = new Map();
  private histograms: Map<string, any> = new Map();

  constructor() {
    this.initializeSDK();
    this.tracer = trace.getTracer('wordwall-clone', '1.0.0');
    this.meter = metrics.getMeter('wordwall-clone', '1.0.0');
    this.setupMetrics();
  }

  /**
   * 初始化 OpenTelemetry SDK
   */
  private initializeSDK(): void {
    const resource = new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: 'wordwall-clone',
      [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
      [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || 'development',
    });

    const traceExporter = new OTLPTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || 'http://localhost:4318/v1/traces',
    });

    const metricExporter = new OTLPMetricExporter({
      url: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT || 'http://localhost:4318/v1/metrics',
    });

    this.sdk = new NodeSDK({
      resource,
      traceExporter,
      metricReader: new PeriodicExportingMetricReader({
        exporter: metricExporter,
        exportIntervalMillis: 10000, // 10 seconds
      }),
      instrumentations: [
        getNodeAutoInstrumentations({
          '@opentelemetry/instrumentation-fs': {
            enabled: false, // 避免過多的文件系統追蹤
          },
        }),
      ],
    });

    this.sdk.start();
    console.log('OpenTelemetry SDK initialized successfully');
  }

  /**
   * 設置自定義指標
   */
  private setupMetrics(): void {
    // 計數器
    this.counters.set('game_sessions_total', 
      this.meter.createCounter('game_sessions_total', {
        description: 'Total number of game sessions started',
      })
    );

    this.counters.set('api_requests_total', 
      this.meter.createCounter('api_requests_total', {
        description: 'Total number of API requests',
      })
    );

    this.counters.set('user_registrations_total', 
      this.meter.createCounter('user_registrations_total', {
        description: 'Total number of user registrations',
      })
    );

    this.counters.set('activities_created_total', 
      this.meter.createCounter('activities_created_total', {
        description: 'Total number of activities created',
      })
    );

    // 直方圖
    this.histograms.set('game_session_duration', 
      this.meter.createHistogram('game_session_duration_seconds', {
        description: 'Duration of game sessions in seconds',
        boundaries: [1, 5, 10, 30, 60, 120, 300, 600, 1200], // 1s to 20min
      })
    );

    this.histograms.set('api_request_duration', 
      this.meter.createHistogram('api_request_duration_milliseconds', {
        description: 'Duration of API requests in milliseconds',
        boundaries: [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000], // 1ms to 5s
      })
    );

    this.histograms.set('game_scores', 
      this.meter.createHistogram('game_scores', {
        description: 'Distribution of game scores',
        boundaries: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100], // 0% to 100%
      })
    );
  }

  /**
   * 創建追蹤 span
   */
  async traceOperation<T>(
    name: string,
    operation: () => Promise<T>,
    attributes?: Record<string, string | number | boolean>
  ): Promise<T> {
    return this.tracer.startActiveSpan(name, { kind: SpanKind.INTERNAL }, async (span: any) => {
      try {
        if (attributes) {
          span.setAttributes(attributes);
        }

        const result = await operation();
        span.setStatus({ code: SpanStatusCode.OK });
        return result;
      } catch (error) {
        span.setStatus({
          code: SpanStatusCode.ERROR,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
        span.recordException(error as Error);
        throw error;
      } finally {
        span.end();
      }
    });
  }

  /**
   * 追蹤 HTTP 請求
   */
  traceHttpRequest(
    method: string,
    path: string,
    statusCode: number,
    duration: number,
    userId?: string
  ): void {
    const attributes: Record<string, string | number> = {
      'http.method': method,
      'http.route': path,
      'http.status_code': statusCode,
      'http.response_time_ms': duration,
    };

    if (userId) {
      attributes['user.id'] = userId;
    }

    // 記錄 API 請求計數
    this.counters.get('api_requests_total')?.add(1, {
      method,
      route: path,
      status_code: statusCode.toString(),
    });

    // 記錄請求持續時間
    this.histograms.get('api_request_duration')?.record(duration, {
      method,
      route: path,
    });
  }

  /**
   * 追蹤遊戲會話
   */
  traceGameSession(
    sessionId: string,
    activityId: string,
    templateType: string,
    playerId: string,
    duration: number,
    score: number,
    completed: boolean
  ): void {
    const attributes = {
      'game.session_id': sessionId,
      'game.activity_id': activityId,
      'game.template_type': templateType,
      'game.player_id': playerId,
      'game.duration_seconds': duration,
      'game.score': score,
      'game.completed': completed,
    };

    // 創建遊戲會話 span
    this.tracer.startSpan('game_session', { kind: SpanKind.INTERNAL }, (span: any) => {
      span.setAttributes(attributes);
      span.setStatus({ code: SpanStatusCode.OK });
      span.end();
    });

    // 記錄指標
    this.counters.get('game_sessions_total')?.add(1, {
      template_type: templateType,
      completed: completed.toString(),
    });

    this.histograms.get('game_session_duration')?.record(duration, {
      template_type: templateType,
    });

    this.histograms.get('game_scores')?.record(score, {
      template_type: templateType,
    });
  }

  /**
   * 追蹤用戶註冊
   */
  traceUserRegistration(userId: string, role: string, method: string): void {
    const attributes = {
      'user.id': userId,
      'user.role': role,
      'user.registration_method': method,
    };

    this.tracer.startSpan('user_registration', { kind: SpanKind.INTERNAL }, (span: any) => {
      span.setAttributes(attributes);
      span.setStatus({ code: SpanStatusCode.OK });
      span.end();
    });

    this.counters.get('user_registrations_total')?.add(1, {
      role,
      method,
    });
  }

  /**
   * 追蹤活動創建
   */
  traceActivityCreation(
    activityId: string,
    templateType: string,
    creatorId: string,
    isPublic: boolean
  ): void {
    const attributes = {
      'activity.id': activityId,
      'activity.template_type': templateType,
      'activity.creator_id': creatorId,
      'activity.is_public': isPublic,
    };

    this.tracer.startSpan('activity_creation', { kind: SpanKind.INTERNAL }, (span: any) => {
      span.setAttributes(attributes);
      span.setStatus({ code: SpanStatusCode.OK });
      span.end();
    });

    this.counters.get('activities_created_total')?.add(1, {
      template_type: templateType,
      is_public: isPublic.toString(),
    });
  }

  /**
   * 追蹤數據庫操作
   */
  async traceDatabase<T>(
    operation: string,
    table: string,
    query: () => Promise<T>,
    additionalAttributes?: Record<string, string | number | boolean>
  ): Promise<T> {
    const attributes = {
      'db.operation': operation,
      'db.table': table,
      'db.system': 'postgresql',
      ...additionalAttributes,
    };

    return this.traceOperation(`db.${operation}`, query, attributes);
  }

  /**
   * 追蹤外部 API 調用
   */
  async traceExternalAPI<T>(
    service: string,
    endpoint: string,
    method: string,
    operation: () => Promise<T>
  ): Promise<T> {
    const attributes = {
      'external.service': service,
      'external.endpoint': endpoint,
      'http.method': method,
    };

    return this.traceOperation(`external.${service}`, operation, attributes);
  }

  /**
   * 記錄自定義事件
   */
  recordEvent(
    name: string,
    attributes: Record<string, string | number | boolean>
  ): void {
    this.tracer.startSpan(name, { kind: SpanKind.INTERNAL }, (span: any) => {
      span.setAttributes(attributes);
      span.addEvent(name, attributes);
      span.setStatus({ code: SpanStatusCode.OK });
      span.end();
    });
  }

  /**
   * 記錄錯誤
   */
  recordError(
    error: Error,
    context: Record<string, string | number | boolean>
  ): void {
    this.tracer.startSpan('error', { kind: SpanKind.INTERNAL }, (span: any) => {
      span.setAttributes(context);
      span.recordException(error);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message,
      });
      span.end();
    });
  }

  /**
   * 獲取當前 span
   */
  getCurrentSpan(): any {
    return trace.getActiveSpan();
  }

  /**
   * 添加屬性到當前 span
   */
  addAttributes(attributes: Record<string, string | number | boolean>): void {
    const span = this.getCurrentSpan();
    if (span) {
      span.setAttributes(attributes);
    }
  }

  /**
   * 關閉 SDK
   */
  async shutdown(): Promise<void> {
    await this.sdk.shutdown();
    console.log('OpenTelemetry SDK shut down successfully');
  }
}

// 創建全局實例
export const openTelemetryService = new OpenTelemetryService();

// 中間件函數
export const telemetryMiddleware = (req: any, res: any, next: any) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    openTelemetryService.traceHttpRequest(
      req.method,
      req.route?.path || req.path,
      res.statusCode,
      duration,
      req.user?.id
    );
  });

  next();
};

export default openTelemetryService;
