// API 路由配置和文檔

export const API_ROUTES = {
  // 認證相關
  AUTH: {
    LOGIN: '/api/auth/signin',
    LOGOUT: '/api/auth/signout',
    REGISTER: '/api/auth/register',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    SESSION: '/api/auth/session',
  },

  // 用戶相關
  USER: {
    PROFILE: '/api/user/profile',
    STATS: '/api/user/stats',
    SUBSCRIPTION_STATUS: '/api/user/subscription-status',
  },

  // 詞彙相關
  VOCABULARY: {
    SETS: '/api/vocabulary/sets',
    SET_BY_ID: (id: string) => `/api/vocabulary/sets/${id}`,
    PROGRESS: '/api/vocabulary/progress',
    ANALYTICS: '/api/vocabulary/analytics',
  },

  // 活動相關
  ACTIVITIES: {
    LIST: '/api/activities',
    BY_ID: (id: string) => `/api/activities/${id}`,
    VERSIONS: (id: string) => `/api/activities/${id}/versions`,
  },

  // 文件夾相關
  FOLDERS: {
    LIST: '/api/folders',
    BY_ID: (id: string) => `/api/folders/${id}`,
    EXPORT: '/api/folders/export',
    IMPORT: '/api/folders/import',
  },

  // 遊戲相關
  GAMES: {
    STATS: '/api/games/stats',
  },

  // AI 相關
  AI: {
    GENERATE_CONTENT: '/api/ai/generate-content',
    GENERATE_IMAGES: '/api/ai/generate-images',
    INTELLIGENT_ASSISTANCE: '/api/ai/intelligent-assistance',
  },

  // 系統相關
  SYSTEM: {
    HEALTH: '/api/health',
    DB_STATUS: '/api/db-status',
  },
};

// API 方法配置
export const API_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const;

// API 響應狀態碼
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

// API 錯誤碼
export const ERROR_CODES = {
  // 認證錯誤
  AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INVALID_TOKEN: 'INVALID_TOKEN',

  // 授權錯誤
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_ACCESS_DENIED: 'RESOURCE_ACCESS_DENIED',

  // 驗證錯誤
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELDS: 'MISSING_REQUIRED_FIELDS',
  INVALID_INPUT_FORMAT: 'INVALID_INPUT_FORMAT',

  // 資源錯誤
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS: 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',

  // 限制錯誤
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  SUBSCRIPTION_REQUIRED: 'SUBSCRIPTION_REQUIRED',

  // 系統錯誤
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
} as const;

// 標準 API 響應格式
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

// 分頁參數
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 詞彙 API 類型定義
export interface VocabularySetCreateRequest {
  title: string;
  description?: string;
  geptLevel?: 'KIDS' | 'ELEMENTARY' | 'INTERMEDIATE' | 'HIGH_INTERMEDIATE';
  isPublic?: boolean;
  items: VocabularyItemInput[];
}

export interface VocabularyItemInput {
  english: string;
  chinese: string;
  phonetic?: string;
  partOfSpeech?: string;
  difficultyLevel?: number;
  exampleSentence?: string;
  notes?: string;
  imageUrl?: string;
  audioUrl?: string;
}

export interface LearningProgressInput {
  vocabularySetId: string;
  vocabularyItemId?: string;
  gameType: string;
  isCorrect: boolean;
  score?: number;
  studyTime?: number;
  masteryLevel?: number;
}

// API 客戶端輔助函數
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || '請求失敗');
    }

    return data;
  }

  // 詞彙 API 方法
  async getVocabularySets(): Promise<ApiResponse<any[]>> {
    return this.request(API_ROUTES.VOCABULARY.SETS);
  }

  async createVocabularySet(data: VocabularySetCreateRequest): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.VOCABULARY.SETS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getVocabularySet(id: string): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.VOCABULARY.SET_BY_ID(id));
  }

  async updateVocabularySet(id: string, data: Partial<VocabularySetCreateRequest>): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.VOCABULARY.SET_BY_ID(id), {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteVocabularySet(id: string): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.VOCABULARY.SET_BY_ID(id), {
      method: 'DELETE',
    });
  }

  async recordLearningProgress(data: LearningProgressInput): Promise<ApiResponse<any>> {
    return this.request(API_ROUTES.VOCABULARY.PROGRESS, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getLearningProgress(params?: { vocabularySetId?: string; gameType?: string }): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams();
    if (params?.vocabularySetId) searchParams.set('vocabularySetId', params.vocabularySetId);
    if (params?.gameType) searchParams.set('gameType', params.gameType);
    
    const endpoint = `${API_ROUTES.VOCABULARY.PROGRESS}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request(endpoint);
  }

  async getVocabularyAnalytics(params?: { timeRange?: string; vocabularySetId?: string }): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams();
    if (params?.timeRange) searchParams.set('timeRange', params.timeRange);
    if (params?.vocabularySetId) searchParams.set('vocabularySetId', params.vocabularySetId);
    
    const endpoint = `${API_ROUTES.VOCABULARY.ANALYTICS}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    return this.request(endpoint);
  }
}

// 默認 API 客戶端實例
export const apiClient = new ApiClient();
