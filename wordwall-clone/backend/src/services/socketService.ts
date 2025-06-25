import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { trackGameExecution, trackError } from '../utils/langfuse';

const prisma = new PrismaClient();

// 遊戲房間接口
interface GameRoom {
  id: string;
  activityId: string;
  hostId: string;
  players: Map<string, Player>;
  gameState: GameState;
  settings: RoomSettings;
  createdAt: Date;
}

interface Player {
  id: string;
  socketId: string;
  name: string;
  email?: string;
  isHost: boolean;
  isReady: boolean;
  score: number;
  answers: Record<string, any>;
  joinedAt: Date;
}

interface GameState {
  status: 'waiting' | 'starting' | 'playing' | 'paused' | 'finished';
  currentQuestion?: number;
  startTime?: Date;
  endTime?: Date;
  timeRemaining?: number;
  results?: any[];
}

interface RoomSettings {
  maxPlayers: number;
  isPrivate: boolean;
  allowSpectators: boolean;
  autoStart: boolean;
  timeLimit?: number;
}

/**
 * WebSocket 服務類
 * 
 * 功能：
 * - 實時多人遊戲
 * - 房間管理
 * - 遊戲狀態同步
 * - 即時結果顯示
 */
export class SocketService {
  private io: SocketIOServer;
  private rooms: Map<string, GameRoom> = new Map();
  private playerRooms: Map<string, string> = new Map(); // socketId -> roomId

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  /**
   * 設置中間件
   */
  private setupMiddleware() {
    // 認證中間件
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        
        if (!token) {
          return next(new Error('Authentication token required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        
        // 獲取用戶信息
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            email: true,
            username: true,
            displayName: true,
            role: true,
          },
        });

        if (!user) {
          return next(new Error('User not found'));
        }

        socket.data.user = user;
        next();
      } catch (error) {
        next(new Error('Invalid authentication token'));
      }
    });
  }

  /**
   * 設置事件處理器
   */
  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      console.log(`User connected: ${socket.data.user.displayName} (${socket.id})`);

      // 創建房間
      socket.on('create_room', async (data) => {
        await this.handleCreateRoom(socket, data);
      });

      // 加入房間
      socket.on('join_room', async (data) => {
        await this.handleJoinRoom(socket, data);
      });

      // 離開房間
      socket.on('leave_room', async () => {
        await this.handleLeaveRoom(socket);
      });

      // 玩家準備
      socket.on('player_ready', async (data) => {
        await this.handlePlayerReady(socket, data);
      });

      // 開始遊戲
      socket.on('start_game', async () => {
        await this.handleStartGame(socket);
      });

      // 提交答案
      socket.on('submit_answer', async (data) => {
        await this.handleSubmitAnswer(socket, data);
      });

      // 暫停/恢復遊戲
      socket.on('pause_game', async () => {
        await this.handlePauseGame(socket);
      });

      socket.on('resume_game', async () => {
        await this.handleResumeGame(socket);
      });

      // 聊天消息
      socket.on('chat_message', async (data) => {
        await this.handleChatMessage(socket, data);
      });

      // 斷線處理
      socket.on('disconnect', async () => {
        await this.handleDisconnect(socket);
      });
    });
  }

  /**
   * 創建遊戲房間
   */
  private async handleCreateRoom(socket: any, data: {
    activityId: string;
    settings: RoomSettings;
  }) {
    try {
      const { activityId, settings } = data;
      const user = socket.data.user;

      // 檢查活動是否存在
      const activity = await prisma.activity.findUnique({
        where: { id: activityId },
        include: { template: true },
      });

      if (!activity) {
        socket.emit('error', { message: 'Activity not found' });
        return;
      }

      // 生成房間 ID
      const roomId = this.generateRoomId();

      // 創建房間
      const room: GameRoom = {
        id: roomId,
        activityId,
        hostId: user.id,
        players: new Map(),
        gameState: {
          status: 'waiting',
        },
        settings: {
          maxPlayers: 10,
          isPrivate: false,
          allowSpectators: true,
          autoStart: false,
          ...settings,
        },
        createdAt: new Date(),
      };

      // 添加主持人為玩家
      const hostPlayer: Player = {
        id: user.id,
        socketId: socket.id,
        name: user.displayName,
        email: user.email,
        isHost: true,
        isReady: false,
        score: 0,
        answers: {},
        joinedAt: new Date(),
      };

      room.players.set(user.id, hostPlayer);
      this.rooms.set(roomId, room);
      this.playerRooms.set(socket.id, roomId);

      // 加入 Socket.IO 房間
      socket.join(roomId);

      // 追蹤房間創建
      await trackGameExecution(
        activity.template.type,
        'create_room',
        { roomId, activityId, hostId: user.id },
        { roomId, playersCount: 1 },
        { duration: 0 }
      );

      socket.emit('room_created', {
        roomId,
        room: this.serializeRoom(room),
      });

      console.log(`Room created: ${roomId} by ${user.displayName}`);
    } catch (error) {
      await trackError(error as Error, {
        action: 'create_room',
        userId: socket.data.user.id,
        data,
      });

      socket.emit('error', { message: 'Failed to create room' });
    }
  }

  /**
   * 加入遊戲房間
   */
  private async handleJoinRoom(socket: any, data: {
    roomId: string;
    playerName?: string;
  }) {
    try {
      const { roomId, playerName } = data;
      const user = socket.data.user;

      const room = this.rooms.get(roomId);
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }

      // 檢查房間是否已滿
      if (room.players.size >= room.settings.maxPlayers) {
        socket.emit('error', { message: 'Room is full' });
        return;
      }

      // 檢查遊戲是否已開始
      if (room.gameState.status === 'playing') {
        if (!room.settings.allowSpectators) {
          socket.emit('error', { message: 'Game already started' });
          return;
        }
      }

      // 添加玩家
      const player: Player = {
        id: user.id,
        socketId: socket.id,
        name: playerName || user.displayName,
        email: user.email,
        isHost: false,
        isReady: false,
        score: 0,
        answers: {},
        joinedAt: new Date(),
      };

      room.players.set(user.id, player);
      this.playerRooms.set(socket.id, roomId);

      // 加入 Socket.IO 房間
      socket.join(roomId);

      // 通知所有玩家
      this.io.to(roomId).emit('player_joined', {
        player: this.serializePlayer(player),
        room: this.serializeRoom(room),
      });

      socket.emit('room_joined', {
        room: this.serializeRoom(room),
      });

      console.log(`Player ${user.displayName} joined room ${roomId}`);
    } catch (error) {
      await trackError(error as Error, {
        action: 'join_room',
        userId: socket.data.user.id,
        data,
      });

      socket.emit('error', { message: 'Failed to join room' });
    }
  }

  /**
   * 離開遊戲房間
   */
  private async handleLeaveRoom(socket: any) {
    try {
      const roomId = this.playerRooms.get(socket.id);
      if (!roomId) return;

      const room = this.rooms.get(roomId);
      if (!room) return;

      const user = socket.data.user;
      const player = room.players.get(user.id);

      if (player) {
        room.players.delete(user.id);
        this.playerRooms.delete(socket.id);
        socket.leave(roomId);

        // 如果是主持人離開，轉移主持權或關閉房間
        if (player.isHost) {
          if (room.players.size > 0) {
            // 轉移主持權給第一個玩家
            const newHost = Array.from(room.players.values())[0];
            newHost.isHost = true;
            room.hostId = newHost.id;

            this.io.to(roomId).emit('host_changed', {
              newHostId: newHost.id,
              room: this.serializeRoom(room),
            });
          } else {
            // 關閉房間
            this.rooms.delete(roomId);
          }
        }

        // 通知其他玩家
        this.io.to(roomId).emit('player_left', {
          playerId: user.id,
          room: this.serializeRoom(room),
        });

        console.log(`Player ${user.displayName} left room ${roomId}`);
      }
    } catch (error) {
      await trackError(error as Error, {
        action: 'leave_room',
        userId: socket.data.user.id,
      });
    }
  }

  /**
   * 玩家準備
   */
  private async handlePlayerReady(socket: any, data: { ready: boolean }) {
    try {
      const roomId = this.playerRooms.get(socket.id);
      if (!roomId) return;

      const room = this.rooms.get(roomId);
      if (!room) return;

      const user = socket.data.user;
      const player = room.players.get(user.id);

      if (player) {
        player.isReady = data.ready;

        // 通知所有玩家
        this.io.to(roomId).emit('player_ready_changed', {
          playerId: user.id,
          ready: data.ready,
          room: this.serializeRoom(room),
        });

        // 檢查是否所有玩家都準備好了
        const allReady = Array.from(room.players.values()).every(p => p.isReady);
        if (allReady && room.settings.autoStart && room.players.size > 1) {
          await this.startGame(room);
        }
      }
    } catch (error) {
      await trackError(error as Error, {
        action: 'player_ready',
        userId: socket.data.user.id,
        data,
      });
    }
  }

  /**
   * 開始遊戲
   */
  private async handleStartGame(socket: any) {
    try {
      const roomId = this.playerRooms.get(socket.id);
      if (!roomId) return;

      const room = this.rooms.get(roomId);
      if (!room) return;

      const user = socket.data.user;
      const player = room.players.get(user.id);

      // 只有主持人可以開始遊戲
      if (!player?.isHost) {
        socket.emit('error', { message: 'Only host can start the game' });
        return;
      }

      await this.startGame(room);
    } catch (error) {
      await trackError(error as Error, {
        action: 'start_game',
        userId: socket.data.user.id,
      });
    }
  }

  /**
   * 開始遊戲邏輯
   */
  private async startGame(room: GameRoom) {
    room.gameState.status = 'starting';
    room.gameState.startTime = new Date();
    room.gameState.currentQuestion = 0;

    // 通知所有玩家遊戲開始
    this.io.to(room.id).emit('game_starting', {
      room: this.serializeRoom(room),
      countdown: 3,
    });

    // 3秒倒計時後開始
    setTimeout(() => {
      room.gameState.status = 'playing';
      this.io.to(room.id).emit('game_started', {
        room: this.serializeRoom(room),
      });

      // 開始第一題
      this.nextQuestion(room);
    }, 3000);
  }

  /**
   * 下一題
   */
  private nextQuestion(room: GameRoom) {
    // 實現下一題邏輯
    this.io.to(room.id).emit('next_question', {
      questionIndex: room.gameState.currentQuestion,
      room: this.serializeRoom(room),
    });
  }

  /**
   * 提交答案
   */
  private async handleSubmitAnswer(socket: any, data: {
    questionId: string;
    answer: any;
    timeSpent: number;
  }) {
    try {
      const roomId = this.playerRooms.get(socket.id);
      if (!roomId) return;

      const room = this.rooms.get(roomId);
      if (!room) return;

      const user = socket.data.user;
      const player = room.players.get(user.id);

      if (player && room.gameState.status === 'playing') {
        // 保存答案
        player.answers[data.questionId] = {
          answer: data.answer,
          timeSpent: data.timeSpent,
          timestamp: new Date(),
        };

        // 通知其他玩家有人提交了答案
        socket.to(roomId).emit('player_answered', {
          playerId: user.id,
          questionId: data.questionId,
        });

        // 檢查是否所有玩家都回答了
        const allAnswered = Array.from(room.players.values()).every(p => 
          p.answers[data.questionId]
        );

        if (allAnswered) {
          // 所有人都回答了，進入下一題或結束遊戲
          this.handleAllPlayersAnswered(room, data.questionId);
        }
      }
    } catch (error) {
      await trackError(error as Error, {
        action: 'submit_answer',
        userId: socket.data.user.id,
        data,
      });
    }
  }

  /**
   * 所有玩家都回答後的處理
   */
  private handleAllPlayersAnswered(room: GameRoom, questionId: string) {
    // 計算結果並顯示
    this.io.to(room.id).emit('question_results', {
      questionId,
      results: this.calculateQuestionResults(room, questionId),
    });

    // 2秒後進入下一題
    setTimeout(() => {
      if (room.gameState.currentQuestion !== undefined) {
        room.gameState.currentQuestion++;
        // 檢查是否還有更多題目
        // 這裡需要根據活動內容判斷
        this.nextQuestion(room);
      }
    }, 2000);
  }

  /**
   * 計算題目結果
   */
  private calculateQuestionResults(room: GameRoom, questionId: string) {
    const results: any[] = [];
    
    room.players.forEach((player) => {
      const answer = player.answers[questionId];
      if (answer) {
        results.push({
          playerId: player.id,
          playerName: player.name,
          answer: answer.answer,
          timeSpent: answer.timeSpent,
          // 這裡需要根據正確答案計算分數
          isCorrect: false, // 暫時設為 false
          score: 0,
        });
      }
    });

    return results;
  }

  /**
   * 暫停遊戲
   */
  private async handlePauseGame(socket: any) {
    // 實現暫停邏輯
  }

  /**
   * 恢復遊戲
   */
  private async handleResumeGame(socket: any) {
    // 實現恢復邏輯
  }

  /**
   * 聊天消息
   */
  private async handleChatMessage(socket: any, data: { message: string }) {
    try {
      const roomId = this.playerRooms.get(socket.id);
      if (!roomId) return;

      const user = socket.data.user;

      this.io.to(roomId).emit('chat_message', {
        playerId: user.id,
        playerName: user.displayName,
        message: data.message,
        timestamp: new Date(),
      });
    } catch (error) {
      await trackError(error as Error, {
        action: 'chat_message',
        userId: socket.data.user.id,
        data,
      });
    }
  }

  /**
   * 斷線處理
   */
  private async handleDisconnect(socket: any) {
    console.log(`User disconnected: ${socket.data.user?.displayName} (${socket.id})`);
    await this.handleLeaveRoom(socket);
  }

  /**
   * 生成房間 ID
   */
  private generateRoomId(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  /**
   * 序列化房間數據
   */
  private serializeRoom(room: GameRoom) {
    return {
      id: room.id,
      activityId: room.activityId,
      hostId: room.hostId,
      players: Array.from(room.players.values()).map(p => this.serializePlayer(p)),
      gameState: room.gameState,
      settings: room.settings,
      createdAt: room.createdAt,
    };
  }

  /**
   * 序列化玩家數據
   */
  private serializePlayer(player: Player) {
    return {
      id: player.id,
      name: player.name,
      isHost: player.isHost,
      isReady: player.isReady,
      score: player.score,
      joinedAt: player.joinedAt,
    };
  }

  /**
   * 獲取房間列表
   */
  public getRooms() {
    return Array.from(this.rooms.values()).map(room => this.serializeRoom(room));
  }

  /**
   * 獲取房間信息
   */
  public getRoom(roomId: string) {
    const room = this.rooms.get(roomId);
    return room ? this.serializeRoom(room) : null;
  }
}

export default SocketService;
