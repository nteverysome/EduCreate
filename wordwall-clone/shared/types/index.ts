// 共享 TypeScript 類型定義

// ===== 用戶相關類型 =====
export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string;
  subscriptionType: SubscriptionType;
  emailVerified: boolean;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'student' | 'teacher' | 'admin';
export type SubscriptionType = 'free' | 'premium' | 'school';

export interface CreateUserRequest {
  email: string;
  username: string;
  password: string;
  displayName: string;
  role?: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

// ===== 模板相關類型 =====
export interface Template {
  id: string;
  name: string;
  type: TemplateType;
  description: string;
  iconUrl?: string;
  config: Record<string, any>;
  defaultSettings: Record<string, any>;
  isActive: boolean;
  isPremium: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type TemplateType = 
  | 'quiz' 
  | 'match_up' 
  | 'spin_wheel' 
  | 'group_sort' 
  | 'flash_cards' 
  | 'anagram' 
  | 'find_match' 
  | 'open_box';

export interface TemplateCategory {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  sortOrder: number;
  createdAt: string;
}

// ===== 活動相關類型 =====
export interface Activity {
  id: string;
  userId: string;
  templateId: string;
  title: string;
  description?: string;
  content: Record<string, any>;
  settings: ActivitySettings;
  visualStyle: string;
  isPublic: boolean;
  isFeatured: boolean;
  viewCount: number;
  playCount: number;
  likeCount: number;
  copyCount: number;
  tags: string[];
  language: string;
  difficultyLevel: number;
  estimatedDuration?: number;
  createdAt: string;
  updatedAt: string;
  user?: User;
  template?: Template;
}

export interface ActivitySettings {
  timeLimit?: number;
  maxAttempts?: number;
  showResults?: boolean;
  showCorrectAnswers?: boolean;
  allowReview?: boolean;
  randomizeQuestions?: boolean;
  randomizeOptions?: boolean;
  enableSound?: boolean;
  enableAnimation?: boolean;
}

export interface CreateActivityRequest {
  templateId: string;
  title: string;
  description?: string;
  content: Record<string, any>;
  settings?: Partial<ActivitySettings>;
  isPublic?: boolean;
  tags?: string[];
  difficultyLevel?: number;
}

export interface UpdateActivityRequest extends Partial<CreateActivityRequest> {
  id: string;
}

// ===== 遊戲相關類型 =====
export interface GameSession {
  id: string;
  activityId: string;
  playerName: string;
  playerEmail?: string;
  playerId?: string;
  sessionType: SessionType;
  startedAt: string;
  completedAt?: string;
  isCompleted: boolean;
  ipAddress?: string;
  userAgent?: string;
}

export type SessionType = 'single' | 'multiplayer' | 'assignment';

export interface GameResult {
  id: string;
  sessionId: string;
  activityId: string;
  playerName: string;
  playerEmail?: string;
  score: number;
  maxScore: number;
  percentage: number;
  timeTaken?: number;
  answers: Record<string, any>;
  metadata: Record<string, any>;
  completedAt: string;
}

export interface GameState {
  sessionId: string;
  activityId: string;
  status: GameStatus;
  currentQuestion?: number;
  totalQuestions: number;
  score: number;
  maxScore: number;
  timeRemaining?: number;
  timeElapsed: number;
  answers: Record<string, any>;
  players?: Player[];
}

export type GameStatus = 'waiting' | 'playing' | 'paused' | 'finished';

export interface Player {
  id: string;
  name: string;
  score: number;
  isReady: boolean;
  isConnected: boolean;
  joinedAt: string;
}

// ===== 作業相關類型 =====
export interface Assignment {
  id: string;
  activityId: string;
  teacherId: string;
  title: string;
  description?: string;
  instructions?: string;
  accessCode: string;
  password?: string;
  maxAttempts: number;
  timeLimit?: number;
  showResults: boolean;
  showCorrectAnswers: boolean;
  allowReview: boolean;
  startDate?: string;
  dueDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  activity?: Activity;
  teacher?: User;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentName: string;
  studentEmail?: string;
  studentId?: string;
  attemptNumber: number;
  score: number;
  maxScore: number;
  timeTaken?: number;
  answers: Record<string, any>;
  submittedAt: string;
  assignment?: Assignment;
  student?: User;
}

export interface CreateAssignmentRequest {
  activityId: string;
  title: string;
  description?: string;
  instructions?: string;
  password?: string;
  maxAttempts?: number;
  timeLimit?: number;
  showResults?: boolean;
  showCorrectAnswers?: boolean;
  allowReview?: boolean;
  startDate?: string;
  dueDate?: string;
}

// ===== API 響應類型 =====
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface ListResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ===== WebSocket 事件類型 =====
export interface ClientToServerEvents {
  'game:join': (data: { gameId: string; playerName: string }) => void;
  'game:start': (data: { gameId: string }) => void;
  'game:answer': (data: { gameId: string; questionId: string; answer: any }) => void;
  'game:ready': (data: { gameId: string }) => void;
  'game:leave': (data: { gameId: string }) => void;
}

export interface ServerToClientEvents {
  'game:started': (data: { gameState: GameState }) => void;
  'game:updated': (data: { gameState: GameState }) => void;
  'game:finished': (data: { results: GameResult[] }) => void;
  'game:error': (data: { message: string }) => void;
  'player:joined': (data: { player: Player }) => void;
  'player:left': (data: { playerId: string }) => void;
  'player:ready': (data: { playerId: string }) => void;
}

// ===== 錯誤類型 =====
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// ===== 統計類型 =====
export interface ActivityStats {
  totalPlays: number;
  averageScore: number;
  maxScore: number;
  averageTime: number;
  completionRate: number;
  popularTimes: string[];
  playerDistribution: Record<string, number>;
}

export interface UserStats {
  totalActivities: number;
  totalPlays: number;
  averageScore: number;
  favoriteTemplates: string[];
  recentActivity: Activity[];
}
