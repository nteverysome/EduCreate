// WordWall Game Template Types
export interface GameTemplate {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  category: 'core' | 'advanced' | 'beta';
  interactionType: 'click' | 'drag' | 'type' | 'swipe' | 'keyboard' | 'mixed';
  difficulty: 'easy' | 'medium' | 'hard';
  isBeta?: boolean;
  isDiscontinued?: boolean;
  tags?: string[];
  estimatedTime?: number; // in minutes
  maxPlayers?: number;
  minAge?: number;
}

// Game Content Types
export interface GameContent {
  id: string;
  templateId: string;
  title: string;
  description?: string;
  questions: Question[];
  settings: GameSettings;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  isPublic: boolean;
}

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  answers: Answer[];
  correctAnswers: string[];
  explanation?: string;
  imageUrl?: string;
  audioUrl?: string;
  timeLimit?: number;
  points?: number;
}

export type QuestionType = 
  | 'multiple_choice'
  | 'true_false'
  | 'fill_blank'
  | 'matching'
  | 'ordering'
  | 'drag_drop'
  | 'text_input'
  | 'image_selection';

export interface Answer {
  id: string;
  text: string;
  imageUrl?: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface GameSettings {
  timeLimit?: number;
  showTimer: boolean;
  shuffleQuestions: boolean;
  shuffleAnswers: boolean;
  allowRetry: boolean;
  showCorrectAnswers: boolean;
  showExplanations: boolean;
  backgroundMusic?: string;
  theme: GameTheme;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface GameTheme {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  fontFamily: string;
  backgroundImage?: string;
  soundEffects: boolean;
}

// Game Session Types
export interface GameSession {
  id: string;
  gameContentId: string;
  playerId: string;
  startTime: Date;
  endTime?: Date;
  score: number;
  maxScore: number;
  answers: PlayerAnswer[];
  timeSpent: number;
  completed: boolean;
}

export interface PlayerAnswer {
  questionId: string;
  selectedAnswers: string[];
  isCorrect: boolean;
  timeSpent: number;
  timestamp: Date;
}

// Player and Statistics Types
export interface Player {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  statistics: PlayerStatistics;
}

export interface PlayerStatistics {
  totalGamesPlayed: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  totalTimeSpent: number;
  favoriteTemplates: string[];
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  unlockedAt: Date;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Template Categories for Organization
export const TEMPLATE_CATEGORIES = {
  QUIZ: 'quiz',
  MATCHING: 'matching',
  WORD_GAMES: 'word_games',
  MEMORY: 'memory',
  ACTION: 'action',
  PUZZLE: 'puzzle',
  CREATIVE: 'creative'
} as const;

export type TemplateCategory = typeof TEMPLATE_CATEGORIES[keyof typeof TEMPLATE_CATEGORIES];
