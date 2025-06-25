import { io, Socket } from 'socket.io-client';
import { getAccessToken } from '@/store/authStore';
import { toast } from 'react-hot-toast';

// 事件類型定義
export interface GameRoom {
  id: string;
  activityId: string;
  hostId: string;
  players: Player[];
  gameState: GameState;
  settings: RoomSettings;
  createdAt: string;
}

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isReady: boolean;
  score: number;
  joinedAt: string;
}

export interface GameState {
  status: 'waiting' | 'starting' | 'playing' | 'paused' | 'finished';
  currentQuestion?: number;
  startTime?: string;
  endTime?: string;
  timeRemaining?: number;
  results?: any[];
}

export interface RoomSettings {
  maxPlayers: number;
  isPrivate: boolean;
  allowSpectators: boolean;
  autoStart: boolean;
  timeLimit?: number;
}

export interface ChatMessage {
  playerId: string;
  playerName: string;
  message: string;
  timestamp: string;
}

// 事件回調類型
export interface SocketEventCallbacks {
  onRoomCreated?: (data: { roomId: string; room: GameRoom }) => void;
  onRoomJoined?: (data: { room: GameRoom }) => void;
  onPlayerJoined?: (data: { player: Player; room: GameRoom }) => void;
  onPlayerLeft?: (data: { playerId: string; room: GameRoom }) => void;
  onPlayerReadyChanged?: (data: { playerId: string; ready: boolean; room: GameRoom }) => void;
  onHostChanged?: (data: { newHostId: string; room: GameRoom }) => void;
  onGameStarting?: (data: { room: GameRoom; countdown: number }) => void;
  onGameStarted?: (data: { room: GameRoom }) => void;
  onNextQuestion?: (data: { questionIndex: number; room: GameRoom }) => void;
  onPlayerAnswered?: (data: { playerId: string; questionId: string }) => void;
  onQuestionResults?: (data: { questionId: string; results: any[] }) => void;
  onGameFinished?: (data: { room: GameRoom; finalResults: any[] }) => void;
  onChatMessage?: (data: ChatMessage) => void;
  onError?: (data: { message: string }) => void;
  onDisconnect?: () => void;
  onReconnect?: () => void;
}

/**
 * WebSocket 客戶端服務
 * 
 * 功能：
 * - 實時多人遊戲連接
 * - 房間管理
 * - 遊戲狀態同步
 * - 聊天功能
 */
export class SocketClientService {
  private socket: Socket | null = null;
  private callbacks: SocketEventCallbacks = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isConnecting = false;

  /**
   * 連接到 WebSocket 服務器
   */
  async connect(): Promise<void> {
    if (this.socket?.connected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      const token = getAccessToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const serverUrl = import.meta.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:5000';

      this.socket = io(serverUrl, {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
        timeout: 10000,
        retries: 3,
      });

      await this.setupEventHandlers();
      
      return new Promise((resolve, reject) => {
        this.socket!.on('connect', () => {
          console.log('Connected to game server');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          resolve();
        });

        this.socket!.on('connect_error', (error) => {
          console.error('Connection error:', error);
          this.isConnecting = false;
          reject(error);
        });
      });
    } catch (error) {
      this.isConnecting = false;
      throw error;
    }
  }

  /**
   * 斷開連接
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.callbacks = {};
  }

  /**
   * 設置事件回調
   */
  setCallbacks(callbacks: SocketEventCallbacks): void {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  /**
   * 設置事件處理器
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // 連接事件
    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.callbacks.onDisconnect?.();
      
      // 自動重連
      if (reason === 'io server disconnect') {
        // 服務器主動斷開，不重連
        return;
      }
      
      this.handleReconnect();
    });

    this.socket.on('reconnect', () => {
      console.log('Socket reconnected');
      this.reconnectAttempts = 0;
      this.callbacks.onReconnect?.();
    });

    // 房間事件
    this.socket.on('room_created', (data) => {
      this.callbacks.onRoomCreated?.(data);
    });

    this.socket.on('room_joined', (data) => {
      this.callbacks.onRoomJoined?.(data);
    });

    this.socket.on('player_joined', (data) => {
      this.callbacks.onPlayerJoined?.(data);
      toast.success(`${data.player.name} 加入了遊戲`);
    });

    this.socket.on('player_left', (data) => {
      this.callbacks.onPlayerLeft?.(data);
      toast.info(`玩家離開了遊戲`);
    });

    this.socket.on('player_ready_changed', (data) => {
      this.callbacks.onPlayerReadyChanged?.(data);
    });

    this.socket.on('host_changed', (data) => {
      this.callbacks.onHostChanged?.(data);
      toast.info('主持人已更換');
    });

    // 遊戲事件
    this.socket.on('game_starting', (data) => {
      this.callbacks.onGameStarting?.(data);
      toast.success('遊戲即將開始！');
    });

    this.socket.on('game_started', (data) => {
      this.callbacks.onGameStarted?.(data);
      toast.success('遊戲開始！');
    });

    this.socket.on('next_question', (data) => {
      this.callbacks.onNextQuestion?.(data);
    });

    this.socket.on('player_answered', (data) => {
      this.callbacks.onPlayerAnswered?.(data);
    });

    this.socket.on('question_results', (data) => {
      this.callbacks.onQuestionResults?.(data);
    });

    this.socket.on('game_finished', (data) => {
      this.callbacks.onGameFinished?.(data);
      toast.success('遊戲結束！');
    });

    // 聊天事件
    this.socket.on('chat_message', (data) => {
      this.callbacks.onChatMessage?.(data);
    });

    // 錯誤事件
    this.socket.on('error', (data) => {
      console.error('Socket error:', data);
      this.callbacks.onError?.(data);
      toast.error(data.message || '發生錯誤');
    });
  }

  /**
   * 處理重連
   */
  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      toast.error('連接失敗，請刷新頁面重試');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 10000);

    setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect().catch(() => {
        this.handleReconnect();
      });
    }, delay);
  }

  /**
   * 創建房間
   */
  createRoom(activityId: string, settings: Partial<RoomSettings> = {}): void {
    if (!this.socket?.connected) {
      throw new Error('Not connected to server');
    }

    this.socket.emit('create_room', {
      activityId,
      settings: {
        maxPlayers: 10,
        isPrivate: false,
        allowSpectators: true,
        autoStart: false,
        ...settings,
      },
    });
  }

  /**
   * 加入房間
   */
  joinRoom(roomId: string, playerName?: string): void {
    if (!this.socket?.connected) {
      throw new Error('Not connected to server');
    }

    this.socket.emit('join_room', {
      roomId,
      playerName,
    });
  }

  /**
   * 離開房間
   */
  leaveRoom(): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('leave_room');
  }

  /**
   * 設置玩家準備狀態
   */
  setPlayerReady(ready: boolean): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('player_ready', { ready });
  }

  /**
   * 開始遊戲
   */
  startGame(): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('start_game');
  }

  /**
   * 提交答案
   */
  submitAnswer(questionId: string, answer: any, timeSpent: number): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('submit_answer', {
      questionId,
      answer,
      timeSpent,
    });
  }

  /**
   * 暫停遊戲
   */
  pauseGame(): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('pause_game');
  }

  /**
   * 恢復遊戲
   */
  resumeGame(): void {
    if (!this.socket?.connected) {
      return;
    }

    this.socket.emit('resume_game');
  }

  /**
   * 發送聊天消息
   */
  sendChatMessage(message: string): void {
    if (!this.socket?.connected) {
      return;
    }

    if (message.trim()) {
      this.socket.emit('chat_message', { message: message.trim() });
    }
  }

  /**
   * 檢查連接狀態
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * 獲取 Socket ID
   */
  getSocketId(): string | undefined {
    return this.socket?.id;
  }
}

// 創建全局實例
export const socketService = new SocketClientService();

// 便捷函數
export const connectToGameServer = () => socketService.connect();
export const disconnectFromGameServer = () => socketService.disconnect();
export const createGameRoom = (activityId: string, settings?: Partial<RoomSettings>) => 
  socketService.createRoom(activityId, settings);
export const joinGameRoom = (roomId: string, playerName?: string) => 
  socketService.joinRoom(roomId, playerName);
export const leaveGameRoom = () => socketService.leaveRoom();

export default socketService;
