/**
 * 遊戲選項類型定義
 * 參考 Wordwall 的 Options 功能實現
 */

export interface GameOptions {
  timer: {
    type: 'none' | 'countUp' | 'countDown';
    minutes?: number;
    seconds?: number;
  };
  lives: number;  // 1-5
  speed: number;  // 1-5
  random: boolean;  // 是否隨機順序
  showAnswers: boolean;  // 遊戲結束後顯示答案
}

export const DEFAULT_GAME_OPTIONS: GameOptions = {
  timer: {
    type: 'countUp',
    minutes: 5,
    seconds: 0
  },
  lives: 5,
  speed: 3,
  random: true,
  showAnswers: true
};

