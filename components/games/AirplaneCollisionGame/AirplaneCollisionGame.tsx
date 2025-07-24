/**
 * AirplaneCollisionGame - 飛機碰撞學習遊戲主組件
 * 
 * 任務: Task 1.1.5 - 代碼實現和驗證
 * 目標: 實現完整的 AirplaneCollisionGame 組件，基於 MemoryGameTemplate 接口
 * 狀態: 開發階段 (1/5)
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as Phaser from 'phaser';
import { ModifiedGameScene } from './ModifiedGameScene';
import { GEPTLevel, GEPTWord } from '../../../lib/gept/GEPTManager';
import { MemoryMetrics } from '../../../lib/memory-enhancement/MemoryEnhancementEngine';

// MemoryGameTemplate 接口實現
export interface MemoryGameTemplate {
  id: string;
  name: string;
  displayName: string;
  description: string;
  category: string;
  memoryPrinciple: {
    primary: string;
    secondary: string[];
  };
  geptSupport: {
    elementary: boolean;
    intermediate: boolean;
    highIntermediate: boolean;
  };
  contentTypes: {
    text: boolean;
    image: boolean;
    audio: boolean;
    video: boolean;
  };
}

// 遊戲配置接口
export interface GameConfig {
  geptLevel: GEPTLevel;
  customWords?: GEPTWord[];
  enableSound: boolean;
  enableHapticFeedback: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  gameMode: 'practice' | 'test' | 'challenge';
}

// 遊戲結果接口
export interface GameResults {
  score: number;
  accuracy: number;
  totalWords: number;
  correctWords: number;
  incorrectWords: number;
  averageResponseTime: number;
  memoryMetrics: MemoryMetrics;
  playTime: number;
  wordsLearned: string[];
}

// 學習進度接口
export interface LearningProgress {
  currentLevel: GEPTLevel;
  wordsCompleted: number;
  totalWords: number;
  accuracy: number;
  streakCount: number;
  lastPlayedAt: number;
}

// 組件 Props
export interface AirplaneCollisionGameProps {
  config?: Partial<GameConfig>;
  onGameStart?: () => void;
  onGameEnd?: (results: GameResults) => void;
  onScoreUpdate?: (score: number) => void;
  onWordLearned?: (word: string, isCorrect: boolean) => void;
  onProgressUpdate?: (progress: LearningProgress) => void;
  className?: string;
  'data-testid'?: string;
}

// 遊戲狀態
interface GameState {
  isLoading: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  gameResults: GameResults | null;
  currentScore: number;
  currentHealth: number;
  currentWord: string;
  error: string | null;
}

/**
 * AirplaneCollisionGame 主組件
 * 實現 MemoryGameTemplate 接口，提供完整的飛機碰撞學習遊戲功能
 */
export class AirplaneCollisionGame extends React.Component<
  AirplaneCollisionGameProps,
  GameState
> implements MemoryGameTemplate {
  
  // MemoryGameTemplate 實現
  public readonly id = 'airplane-collision';
  public readonly name = 'AirplaneCollision';
  public readonly displayName = '飛機碰撞學習遊戲';
  public readonly description = '基於動態反應記憶的英語詞彙學習遊戲，玩家控制飛機碰撞正確的英文單字雲朵';
  public readonly category = 'action-memory';

  public readonly memoryPrinciple = {
    primary: 'active-recall',
    secondary: ['visual-memory', 'pattern-recognition', 'spaced-repetition']
  };

  public readonly geptSupport = {
    elementary: true,
    intermediate: true,
    highIntermediate: true
  };

  public readonly contentTypes = {
    text: true,
    image: false,
    audio: true,
    video: false
  };

  // 私有屬性
  private gameRef = React.createRef<HTMLDivElement>();
  private phaserGame: Phaser.Game | null = null;
  private gameScene: ModifiedGameScene | null = null;
  private startTime: number = 0;

  // 預設配置
  private defaultConfig: GameConfig = {
    geptLevel: 'elementary',
    enableSound: true,
    enableHapticFeedback: true,
    difficulty: 'medium',
    gameMode: 'practice'
  };

  constructor(props: AirplaneCollisionGameProps) {
    super(props);
    
    this.state = {
      isLoading: true,
      isPlaying: false,
      isPaused: false,
      gameResults: null,
      currentScore: 0,
      currentHealth: 100,
      currentWord: '',
      error: null
    };
  }

  componentDidMount() {
    this.initializeGame();
  }

  componentWillUnmount() {
    this.destroyGame();
  }

  /**
   * 初始化 Phaser 遊戲
   */
  private initializeGame = async (): Promise<void> => {
    try {
      if (!this.gameRef.current) {
        throw new Error('遊戲容器未找到');
      }

      // 合併配置
      const config = { ...this.defaultConfig, ...this.props.config };

      // 動態載入 Phaser（修復 SSR 問題）
      const Phaser = await import('phaser');

      // 創建 Phaser 遊戲配置 - 使用原本的 ModifiedGameScene
      const phaserConfig: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        width: 800,
        height: 600,
        parent: this.gameRef.current,
        backgroundColor: '#000033', // 原本的深藍色背景
        physics: {
          default: 'arcade',
          arcade: {
            gravity: { y: 0 },
            debug: false
          }
        },
        scene: ModifiedGameScene, // 使用原本的完整場景
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH
        },
        audio: {
          disableWebAudio: false
        }
      };

      // 創建遊戲實例
      this.phaserGame = new Phaser.Game(phaserConfig);

      // 獲取遊戲場景引用 - 恢復原本的事件系統
      this.phaserGame.events.once('ready', () => {
        this.gameScene = this.phaserGame?.scene.getScene('ModifiedGameScene') as ModifiedGameScene;
        this.setupGameEventListeners();
        this.setState({ isLoading: false });
        console.log('🎮 AirplaneCollisionGame 初始化完成 - 使用原本 ModifiedGameScene');
      });

    } catch (error) {
      console.error('❌ 遊戲初始化失敗:', error);
      this.setState({
        error: error instanceof Error ? error.message : '遊戲初始化失敗',
        isLoading: false
      });
    }
  };

  /**
   * 設置遊戲事件監聽器
   */
  private setupGameEventListeners = (): void => {
    if (!this.gameScene) return;

    // 監聽遊戲開始事件
    this.gameScene.events.on('gameStart', this.handleGameStart);
    
    // 監聽分數更新事件
    this.gameScene.events.on('scoreUpdate', this.handleScoreUpdate);
    
    // 監聽詞彙學習事件
    this.gameScene.events.on('wordLearned', this.handleWordLearned);
    
    // 監聽遊戲結束事件
    this.gameScene.events.on('gameEnd', this.handleGameEnd);
    
    // 監聽進度更新事件
    this.gameScene.events.on('progressUpdate', this.handleProgressUpdate);

    console.log('🔗 遊戲事件監聽器設置完成');
  };

  /**
   * 處理遊戲開始
   */
  private handleGameStart = (): void => {
    this.startTime = Date.now();
    this.setState({ 
      isPlaying: true, 
      isPaused: false,
      currentScore: 0,
      currentHealth: 100,
      gameResults: null 
    });
    
    this.props.onGameStart?.();
    console.log('🚀 遊戲開始');
  };

  /**
   * 處理分數更新
   */
  private handleScoreUpdate = (score: number): void => {
    this.setState({ currentScore: score });
    this.props.onScoreUpdate?.(score);
  };

  /**
   * 處理詞彙學習
   */
  private handleWordLearned = (word: string, isCorrect: boolean): void => {
    this.setState({ currentWord: word });
    this.props.onWordLearned?.(word, isCorrect);
    console.log(`📚 詞彙學習: ${word} - ${isCorrect ? '正確' : '錯誤'}`);
  };

  /**
   * 處理遊戲結束
   */
  private handleGameEnd = (results: GameResults): void => {
    const playTime = Date.now() - this.startTime;
    const finalResults = { ...results, playTime };
    
    this.setState({ 
      isPlaying: false,
      gameResults: finalResults 
    });
    
    this.props.onGameEnd?.(finalResults);
    console.log('🏁 遊戲結束:', finalResults);
  };

  /**
   * 處理進度更新
   */
  private handleProgressUpdate = (progress: LearningProgress): void => {
    this.props.onProgressUpdate?.(progress);
  };

  /**
   * 開始遊戲 - 恢復原本的事件系統
   */
  public startGame = (): void => {
    if (this.gameScene && !this.state.isPlaying) {
      // 觸發 ModifiedGameScene 的開始遊戲事件
      this.gameScene.events.emit('startGame');
      console.log('🚀 遊戲開始 - 觸發 ModifiedGameScene 事件');
    }
  };

  /**
   * 暫停遊戲
   */
  public pauseGame = (): void => {
    if (this.gameScene && this.state.isPlaying) {
      this.gameScene.scene.pause();
      this.setState({ isPaused: true });
    }
  };

  /**
   * 恢復遊戲
   */
  public resumeGame = (): void => {
    if (this.gameScene && this.state.isPaused) {
      this.gameScene.scene.resume();
      this.setState({ isPaused: false });
    }
  };

  /**
   * 重新開始遊戲
   */
  public restartGame = (): void => {
    if (this.gameScene) {
      this.gameScene.scene.restart();
    }
  };

  // 移除簡化的 Phaser 場景方法，使用原本的 ModifiedGameScene

  /**
   * 銷毀遊戲
   */
  private destroyGame = (): void => {
    if (this.phaserGame) {
      this.phaserGame.destroy(true);
      this.phaserGame = null;
      this.gameScene = null;
    }
    console.log('🧹 AirplaneCollisionGame 已銷毀');
  };

  /**
   * 渲染組件
   */
  render(): React.ReactNode {
    const { className = '', 'data-testid': testId = 'airplane-collision-game' } = this.props;
    const { isLoading, error, isPlaying, isPaused, currentScore, currentHealth } = this.state;

    return (
      <div className={`airplane-collision-game ${className}`} data-testid={testId}>
        {/* 遊戲容器 */}
        <div 
          ref={this.gameRef} 
          className="game-container"
          style={{ width: '800px', height: '600px', margin: '0 auto' }}
        />
        
        {/* 載入狀態 */}
        {isLoading && (
          <div className="loading-overlay" data-testid="loading-overlay">
            <div className="loading-spinner">載入中...</div>
          </div>
        )}
        
        {/* 錯誤狀態 */}
        {error && (
          <div className="error-overlay" data-testid="error-overlay">
            <div className="error-message">錯誤: {error}</div>
            <button onClick={this.initializeGame}>重試</button>
          </div>
        )}
        
        {/* 遊戲控制面板 */}
        {!isLoading && !error && (
          <div className="game-controls" data-testid="game-controls">
            <div className="game-stats">
              <span>分數: {currentScore}</span>
              <span>生命值: {currentHealth}</span>
            </div>
            
            <div className="control-buttons">
              {!isPlaying && (
                <button onClick={this.startGame} data-testid="start-button">
                  開始遊戲
                </button>
              )}
              
              {isPlaying && !isPaused && (
                <button onClick={this.pauseGame} data-testid="pause-button">
                  暫停
                </button>
              )}
              
              {isPaused && (
                <button onClick={this.resumeGame} data-testid="resume-button">
                  繼續
                </button>
              )}
              
              <button onClick={this.restartGame} data-testid="restart-button">
                重新開始
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default AirplaneCollisionGame;
