import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlayIcon, 
  PauseIcon, 
  ArrowPathIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui';

interface SpinWheelSegment {
  id: string;
  text: string;
  color: string;
  weight: number;
  isCorrect?: boolean;
  points?: number;
}

interface SpinWheelContent {
  segments: SpinWheelSegment[];
  mode: 'random' | 'quiz' | 'decision';
  spinDuration: number;
  showPointer: boolean;
  allowMultipleSpin: boolean;
  enableSound: boolean;
  question?: string;
}

interface SpinWheelProps {
  content: SpinWheelContent;
  onAnswer: (answer: {
    segmentId: string;
    spinAngle: number;
    spinDuration: number;
    timestamp: number;
  }) => void;
  onComplete?: () => void;
  disabled?: boolean;
  showResult?: boolean;
  result?: {
    selectedSegment: SpinWheelSegment;
    isCorrect: boolean;
    score: number;
    feedback: string;
  };
}

/**
 * Spin the Wheel 遊戲組件
 * 
 * 功能：
 * - 可自定義的轉盤
 * - 平滑的旋轉動畫
 * - 音效支持
 * - 多種遊戲模式
 * - 響應式設計
 */
export const SpinWheel: React.FC<SpinWheelProps> = ({
  content,
  onAnswer,
  onComplete,
  disabled = false,
  showResult = false,
  result,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [currentAngle, setCurrentAngle] = useState(0);
  const [selectedSegment, setSelectedSegment] = useState<SpinWheelSegment | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(content.enableSound);
  const [spinCount, setSpinCount] = useState(0);
  
  const wheelRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // 計算每個段落的角度
  const segmentAngle = 360 / content.segments.length;

  // 生成轉盤 SVG 路徑
  const generateSegmentPath = (index: number): string => {
    const startAngle = index * segmentAngle;
    const endAngle = (index + 1) * segmentAngle;
    const radius = 150;
    const centerX = 160;
    const centerY = 160;

    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;

    const x1 = centerX + radius * Math.cos(startAngleRad);
    const y1 = centerY + radius * Math.sin(startAngleRad);
    const x2 = centerX + radius * Math.cos(endAngleRad);
    const y2 = centerY + radius * Math.sin(endAngleRad);

    const largeArcFlag = segmentAngle > 180 ? 1 : 0;

    return `M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  // 計算文字位置
  const getTextPosition = (index: number) => {
    const angle = (index * segmentAngle + segmentAngle / 2) * (Math.PI / 180);
    const radius = 100;
    const centerX = 160;
    const centerY = 160;

    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  // 執行轉盤旋轉
  const spinWheel = async () => {
    if (isSpinning || disabled) return;

    setIsSpinning(true);
    const startTime = Date.now();

    // 播放音效
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {
        // 忽略音頻播放錯誤
      });
    }

    // 生成隨機角度
    const minSpins = 3;
    const maxSpins = 6;
    const spins = minSpins + Math.random() * (maxSpins - minSpins);
    const finalAngle = spins * 360 + Math.random() * 360;
    
    // 計算最終選中的段落
    const normalizedAngle = (360 - (finalAngle % 360)) % 360;
    const segmentIndex = Math.floor(normalizedAngle / segmentAngle);
    const selected = content.segments[segmentIndex];

    setCurrentAngle(finalAngle);
    setSelectedSegment(selected);

    // 等待動畫完成
    setTimeout(() => {
      setIsSpinning(false);
      setSpinCount(prev => prev + 1);

      // 提交答案
      onAnswer({
        segmentId: selected.id,
        spinAngle: finalAngle,
        spinDuration: content.spinDuration,
        timestamp: Date.now(),
      });

      // 檢查是否完成
      if (!content.allowMultipleSpin || (content.mode === 'quiz' && selected.isCorrect !== undefined)) {
        setTimeout(() => {
          onComplete?.();
        }, 1000);
      }
    }, content.spinDuration);
  };

  // 重置轉盤
  const resetWheel = () => {
    setCurrentAngle(0);
    setSelectedSegment(null);
    setSpinCount(0);
  };

  return (
    <div className="flex flex-col items-center space-y-6 p-6">
      {/* 問題顯示 */}
      {content.question && (
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {content.question}
          </h2>
          <p className="text-gray-600">
            點擊轉盤開始旋轉
          </p>
        </div>
      )}

      {/* 轉盤容器 */}
      <div className="relative">
        {/* 轉盤 */}
        <motion.div
          ref={wheelRef}
          className="relative"
          animate={{ rotate: currentAngle }}
          transition={{
            duration: isSpinning ? content.spinDuration / 1000 : 0,
            ease: isSpinning ? [0.25, 0.46, 0.45, 0.94] : 'linear',
          }}
        >
          <svg width="320" height="320" className="drop-shadow-lg">
            {/* 轉盤段落 */}
            {content.segments.map((segment, index) => (
              <g key={segment.id}>
                {/* 段落背景 */}
                <path
                  d={generateSegmentPath(index)}
                  fill={segment.color}
                  stroke="#ffffff"
                  strokeWidth="2"
                  className="transition-opacity hover:opacity-90"
                />
                
                {/* 段落文字 */}
                <text
                  x={getTextPosition(index).x}
                  y={getTextPosition(index).y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-white font-semibold text-sm pointer-events-none"
                  transform={`rotate(${index * segmentAngle + segmentAngle / 2}, ${getTextPosition(index).x}, ${getTextPosition(index).y})`}
                >
                  {segment.text.length > 10 ? segment.text.substring(0, 10) + '...' : segment.text}
                </text>
              </g>
            ))}
            
            {/* 中心圓 */}
            <circle
              cx="160"
              cy="160"
              r="20"
              fill="#374151"
              stroke="#ffffff"
              strokeWidth="3"
            />
          </svg>
        </motion.div>

        {/* 指針 */}
        {content.showPointer && (
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
            <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-500 drop-shadow-md" />
          </div>
        )}

        {/* 旋轉按鈕 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Button
            onClick={spinWheel}
            disabled={isSpinning || disabled}
            className="w-16 h-16 rounded-full bg-gray-800 hover:bg-gray-700 text-white shadow-lg"
            size="sm"
          >
            {isSpinning ? (
              <ArrowPathIcon className="h-6 w-6 animate-spin" />
            ) : (
              <PlayIcon className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* 控制按鈕 */}
      <div className="flex items-center space-x-4">
        {/* 音效控制 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSoundEnabled(!soundEnabled)}
        >
          {soundEnabled ? (
            <SpeakerWaveIcon className="h-5 w-5" />
          ) : (
            <SpeakerXMarkIcon className="h-5 w-5" />
          )}
        </Button>

        {/* 重置按鈕 */}
        {content.allowMultipleSpin && (
          <Button
            variant="secondary"
            size="sm"
            onClick={resetWheel}
            disabled={isSpinning}
          >
            重置
          </Button>
        )}

        {/* 轉動次數 */}
        {content.allowMultipleSpin && (
          <span className="text-sm text-gray-600">
            轉動次數: {spinCount}
          </span>
        )}
      </div>

      {/* 結果顯示 */}
      <AnimatePresence>
        {showResult && result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full text-center"
          >
            <div className="flex items-center justify-center mb-4">
              {result.isCorrect ? (
                <TrophyIcon className="h-12 w-12 text-yellow-500" />
              ) : (
                <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
              )}
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {result.feedback}
            </h3>
            
            <div className="text-3xl font-bold text-primary-600 mb-2">
              {result.score} 分
            </div>
            
            <div className="text-sm text-gray-600">
              選中: {result.selectedSegment.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 當前選中段落顯示 */}
      {selectedSegment && !showResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-lg shadow-md p-4 text-center"
        >
          <div className="text-lg font-semibold text-gray-900">
            選中: {selectedSegment.text}
          </div>
          {selectedSegment.points && (
            <div className="text-sm text-gray-600">
              {selectedSegment.points} 分
            </div>
          )}
        </motion.div>
      )}

      {/* 音頻元素 */}
      <audio
        ref={audioRef}
        preload="auto"
        className="hidden"
      >
        <source src="/sounds/wheel-spin.mp3" type="audio/mpeg" />
        <source src="/sounds/wheel-spin.ogg" type="audio/ogg" />
      </audio>
    </div>
  );
};

export default SpinWheel;
