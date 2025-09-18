import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlayIcon, PauseIcon, ArrowPathIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/outline';
interface GodotGameProps {
  gameUrl: string;
  title?: string;
  width?: number;
  height?: number;
  onGameLoad?: () => void;
  onGameError?: (error: string) => void;
}

export default function GodotGameEmbed({
  gameUrl,
  title = "EduCreate 遊戲",
  width = 1200,
  height = 800,
  onGameLoad,
  onGameError
}: GodotGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameLoaded, setGameLoaded] = useState(false);
  const [gameError, setGameError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  useEffect(() => {
    loadGodotGame();
  }, [gameUrl]);
  
  const loadGodotGame = async () => {
    try {
      console.log('🎮 載入 Godot 遊戲:', gameUrl);
      
      // 檢查 Godot 遊戲文件是否存在
      const response = await fetch(gameUrl);
      if (!response.ok) {
        throw new Error(`遊戲文件載入失敗: ${response.status}`);
      }
      
      // 創建 iframe 來載入 Godot 遊戲
      const iframe = document.createElement('iframe');
      iframe.src = gameUrl;
      iframe.width = width.toString();
      iframe.height = height.toString();
      iframe.style.border = 'none';
      iframe.style.borderRadius = '8px';
      
      // 清除舊內容並添加新的 iframe
      const container = canvasRef.current?.parentElement;
      if (container) {
        container.innerHTML = '';
        container.appendChild(iframe);
      }
      
      iframe.onload = () => {
        console.log('✅ Godot 遊戲載入成功');
        setGameLoaded(true);
        setIsPlaying(true);
        onGameLoad?.();
      };
      
      iframe.onerror = (error) => {
        console.error('❌ Godot 遊戲載入失敗:', error);
        const errorMsg = '遊戲載入失敗，請檢查遊戲文件';
        setGameError(errorMsg);
        onGameError?.(errorMsg);
      };
      
    } catch (error) {
      console.error('❌ Godot 遊戲初始化失敗:', error);
      const errorMsg = error instanceof Error ? error.message : '未知錯誤';
      setGameError(errorMsg);
      onGameError?.(errorMsg);
    }
  };
  
  const handleRestart = () => {
    console.log('🔄 重新啟動遊戲');
    setGameLoaded(false);
    setGameError(null);
    setIsPlaying(false);
    loadGodotGame();
  };
  
  const toggleMute = () => {
    setIsMuted(!isMuted);
    // 這裡可以添加實際的音效控制邏輯
    console.log(isMuted ? '🔊 取消靜音' : '🔇 靜音');
  };
  
  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <PlayIcon className="w-5 h-5" />
            {title}
          </CardTitle>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMute}
              className="flex items-center gap-1"
            >
              {isMuted ? <SpeakerXMarkIcon className="w-4 h-4" /> : <SpeakerWaveIcon className="w-4 h-4" />}
              {isMuted ? '取消靜音' : '靜音'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRestart}
              className="flex items-center gap-1"
            >
              <ArrowPathIcon className="w-4 h-4" />
              重新開始
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="relative">
          {gameError ? (
            <div className="flex flex-col items-center justify-center h-96 bg-gray-100 rounded-lg">
              <div className="text-red-500 text-lg font-semibold mb-2">
                ❌ 遊戲載入失敗
              </div>
              <div className="text-gray-600 mb-4">{gameError}</div>
              <Button onClick={handleRestart} className="flex items-center gap-2">
                <ArrowPathIcon className="w-4 h-4" />
                重試
              </Button>
            </div>
          ) : !gameLoaded ? (
            <div className="flex flex-col items-center justify-center h-96 bg-blue-50 rounded-lg">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
              <div className="text-blue-600 font-semibold">載入遊戲中...</div>
              <div className="text-gray-500 text-sm mt-2">請稍候，正在初始化 Godot 引擎</div>
            </div>
          ) : (
            <div 
              ref={canvasRef}
              className="w-full flex justify-center"
              style={{ minHeight: height }}
            >
              {/* Godot 遊戲將在這裡載入 */}
            </div>
          )}
          
          {gameLoaded && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">🎯 遊戲說明</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 使用滑鼠點擊答案按鈕</li>
                <li>• 找到正確的英文單字對應中文意思</li>
                <li>• 答對可以獲得分數，答錯會顯示正確答案</li>
                <li>• 按空白鍵可以重新開始遊戲</li>
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// 導出遊戲統計介面
export interface GameStats {
  score: number;
  questionsAnswered: number;
  correctAnswers: number;
  wrongAnswers: number;
  accuracy: number;
  timeSpent: number;
}

// 導出遊戲事件介面
export interface GameEvent {
  type: 'answer_selected' | 'game_started' | 'game_ended' | 'question_changed';
  data: any;
  timestamp: number;
}
