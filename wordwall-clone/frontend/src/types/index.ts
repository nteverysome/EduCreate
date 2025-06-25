// 重新導出共享類型
export * from '@/shared/types';

// 前端特定類型定義

// ===== UI 組件類型 =====
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
}

export interface InputProps {
  label?: string;
  placeholder?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  error?: string;
  success?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

export interface ToastProps {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// ===== 遊戲相關類型 =====
export interface GameConfig {
  timeLimit?: number;
  maxAttempts?: number;
  showHints?: boolean;
  enableSound?: boolean;
  enableAnimation?: boolean;
  randomOrder?: boolean;
  autoAdvance?: boolean;
}

export interface QuizQuestion {
  id: string;
  text: string;
  image?: string;
  audio?: string;
  options: QuizOption[];
  explanation?: string;
  timeLimit?: number;
  points?: number;
}

export interface QuizOption {
  id: string;
  text: string;
  image?: string;
  isCorrect: boolean;
}

export interface MatchPair {
  id: string;
  left: MatchItem;
  right: MatchItem;
  matched?: boolean;
}

export interface MatchItem {
  id: string;
  type: 'text' | 'image' | 'audio';
  content: string;
  position?: { x: number; y: number };
}

export interface WheelSegment {
  id: string;
  text: string;
  color: string;
  weight: number;
  image?: string;
}

export interface GroupSortGroup {
  id: string;
  name: string;
  color: string;
  acceptedItems: string[];
  maxItems?: number;
}

export interface SortableItem {
  id: string;
  text: string;
  image?: string;
  groupId?: string;
  position?: { x: number; y: number };
}

export interface FlashCard {
  id: string;
  front: CardSide;
  back: CardSide;
  mastered?: boolean;
  attempts?: number;
}

export interface CardSide {
  type: 'text' | 'image' | 'audio' | 'mixed';
  content: string;
  image?: string;
  audio?: string;
}

// ===== 遊戲狀態類型 =====
export interface GameProgress {
  currentStep: number;
  totalSteps: number;
  score: number;
  maxScore: number;
  timeElapsed: number;
  timeRemaining?: number;
  completed: boolean;
  answers: Record<string, any>;
}

export interface PlayerAnswer {
  questionId: string;
  answer: any;
  isCorrect: boolean;
  timeSpent: number;
  attempts: number;
  timestamp: string;
}

export interface GameStats {
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  skippedQuestions: number;
  averageTime: number;
  fastestAnswer: number;
  slowestAnswer: number;
  accuracy: number;
}

// ===== 表單類型 =====
export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  role: UserRole;
  agreeToTerms: boolean;
}

export interface ActivityFormData {
  title: string;
  description?: string;
  templateId: string;
  content: Record<string, any>;
  settings: ActivitySettings;
  isPublic: boolean;
  tags: string[];
  difficultyLevel: number;
  estimatedDuration?: number;
}

export interface AssignmentFormData {
  title: string;
  description?: string;
  instructions?: string;
  password?: string;
  maxAttempts: number;
  timeLimit?: number;
  showResults: boolean;
  showCorrectAnswers: boolean;
  allowReview: boolean;
  startDate?: string;
  dueDate?: string;
}

// ===== 路由類型 =====
export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  exact?: boolean;
  protected?: boolean;
  roles?: UserRole[];
  title?: string;
  description?: string;
}

export interface NavigationItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
  badge?: string | number;
  children?: NavigationItem[];
  roles?: UserRole[];
}

// ===== 狀態管理類型 =====
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface UIState {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  modalStack: string[];
  toasts: ToastProps[];
  loading: Record<string, boolean>;
}

export interface GameState {
  currentActivity: Activity | null;
  gameSession: GameSession | null;
  gameProgress: GameProgress | null;
  isPlaying: boolean;
  isPaused: boolean;
  players: Player[];
  results: GameResult[];
}

// ===== API 類型 =====
export interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  params?: Record<string, any>;
  data?: any;
  timeout?: number;
  retries?: number;
}

export interface PaginatedResponse<T> extends ApiResponse<ListResponse<T>> {
  data: ListResponse<T>;
}

export interface SearchParams extends PaginationParams {
  query?: string;
  filters?: Record<string, any>;
  tags?: string[];
  category?: string;
  difficulty?: number;
  language?: string;
}

// ===== 事件類型 =====
export interface GameEvent {
  type: string;
  payload: any;
  timestamp: string;
  playerId?: string;
}

export interface AnalyticsEvent {
  name: string;
  properties: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp: string;
}

// ===== 文件上傳類型 =====
export interface FileUpload {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  url?: string;
  error?: string;
}

export interface MediaAsset {
  id: string;
  type: 'image' | 'audio' | 'video';
  url: string;
  thumbnailUrl?: string;
  filename: string;
  size: number;
  mimeType: string;
  alt?: string;
  duration?: number; // 音頻/視頻長度（秒）
  dimensions?: { width: number; height: number };
}

// ===== 主題類型 =====
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    mono: string;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
}

// ===== 工具類型 =====
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type ArrayElement<T> = T extends (infer U)[] ? U : never;

export type ValueOf<T> = T[keyof T];

export type NonEmptyArray<T> = [T, ...T[]];

// ===== React 相關類型 =====
export type ComponentWithChildren<P = {}> = React.FC<P & { children: React.ReactNode }>;

export type ComponentProps<T> = T extends React.ComponentType<infer P> ? P : never;

export type RefType<T> = T extends React.RefObject<infer U> ? U : never;
