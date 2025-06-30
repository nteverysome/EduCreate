import React, { useState, useEffect, useRef } from 'react';

export interface WheelSegment {
  id: string;
  text: string;
  color: string;
  points?: number;
  action?: 'question' | 'bonus' | 'penalty' | 'normal';
}

interface SpinWheelGameProps {
  segments: WheelSegment[];
  onComplete?: (results: any) => void;
  maxSpins?: number;
  title?: string;
}

export default function SpinWheelGame({
  segments,
  onComplete,
  maxSpins = 10,
  title = "轉盤選擇"
}: SpinWheelGameProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedSegment, setSelectedSegment] = useState<WheelSegment | null>(null);
  const [score, setScore] = useState(0);
  const [spinsLeft, setSpinsLeft] = useState(maxSpins);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [spinHistory, setSpinHistory] = useState<WheelSegment[]>([]);
  const [showResult, setShowResult] = useState(false);

  // Refs
  const wheelRef = useRef<HTMLDivElement>(null);

  // 計算每個扇形的角度
  const segmentAngle = segments.length > 0 ? 360 / segments.length : 60;

  const spin = () => {
    if (isSpinning) return;

    setIsSpinning(true);
    setResult(null);

    // 隨機選擇結果
    const randomIndex = Math.floor(Math.random() * items.length);
    const selectedItem = items[randomIndex];

    // 計算旋轉角度 - 使用已定義的 segmentAngle
    const targetAngle = 360 - (randomIndex * segmentAngle + segmentAngle / 2);
    const spins = 5; // 轉5圈
    const finalRotation = rotation + spins * 360 + targetAngle;

    setRotation(finalRotation);

    // 動畫結束後顯示結果
    setTimeout(() => {
      setIsSpinning(false);
      setResult(selectedItem);
    }, 3000);
  };

  const reset = () => {
    setResult(null);
    setRotation(0);
  };

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      
      <div className="relative inline-block mb-6">
        {/* 指針 */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
          <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-600"></div>
        </div>
        
        {/* 轉盤 */}
        <div
          ref={wheelRef}
          className="relative w-80 h-80 rounded-full border-4 border-gray-800 overflow-hidden"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: isSpinning ? 'transform 3s cubic-bezier(0.23, 1, 0.32, 1)' : 'none'
          }}
        >
          <svg width="100%" height="100%" viewBox="0 0 200 200">
            {items.map((item, index) => {
              const startAngle = index * segmentAngle;
              const endAngle = (index + 1) * segmentAngle;
              const color = colors[index % colors.length];
              
              // 計算路徑
              const startAngleRad = (startAngle * Math.PI) / 180;
              const endAngleRad = (endAngle * Math.PI) / 180;
              
              const x1 = 100 + 90 * Math.cos(startAngleRad);
              const y1 = 100 + 90 * Math.sin(startAngleRad);
              const x2 = 100 + 90 * Math.cos(endAngleRad);
              const y2 = 100 + 90 * Math.sin(endAngleRad);
              
              const largeArcFlag = segmentAngle > 180 ? 1 : 0;
              
              const pathData = [
                `M 100 100`,
                `L ${x1} ${y1}`,
                `A 90 90 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                'Z'
              ].join(' ');

              // 計算文字位置
              const textAngle = startAngle + segmentAngle / 2;
              const textAngleRad = (textAngle * Math.PI) / 180;
              const textX = 100 + 60 * Math.cos(textAngleRad);
              const textY = 100 + 60 * Math.sin(textAngleRad);

              return (
                <g key={index}>
                  <path
                    d={pathData}
                    fill={color}
                    stroke="#fff"
                    strokeWidth="2"
                  />
                  <text
                    x={textX}
                    y={textY}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="white"
                    fontSize="10"
                    fontWeight="bold"
                    transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                  >
                    {item.length > 8 ? item.substring(0, 8) + '...' : item}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* 結果顯示 */}
      {result && (
        <div className="mb-6 p-4 bg-yellow-100 border-2 border-yellow-400 rounded-lg">
          <h3 className="text-xl font-bold text-yellow-800">🎉 結果：{result}</h3>
        </div>
      )}

      {/* 控制按鈕 */}
      <div className="space-x-4">
        <button
          onClick={spin}
          disabled={isSpinning}
          className={`px-8 py-3 rounded-lg text-white font-bold text-lg transition-colors ${
            isSpinning 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600'
          }`}
        >
          {isSpinning ? '轉動中...' : '開始轉動'}
        </button>
        
        {result && (
          <button
            onClick={reset}
            className="px-6 py-3 rounded-lg bg-gray-500 text-white font-bold hover:bg-gray-600 transition-colors"
          >
            重置
          </button>
        )}
      </div>

      {/* 項目列表 */}
      <div className="mt-8">
        <h4 className="text-lg font-bold mb-3">轉盤項目：</h4>
        <div className="flex flex-wrap justify-center gap-2">
          {items.map((item, index) => (
            <span
              key={index}
              className="px-3 py-1 rounded-full text-sm font-medium text-white"
              style={{ backgroundColor: colors[index % colors.length] }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}