'use client';

import { useState, useEffect } from 'react';

// Speaking Cards 視覺風格定義
export interface SpeakingCardsVisualStyle {
  id: string;
  name: string;
  displayName: string;
  description: string;
  preview: {
    emoji: string;
    bgColor: string;
    cardColor: string;
  };
}

export const SPEAKING_CARDS_STYLES: SpeakingCardsVisualStyle[] = [
  { id: 'default', name: 'default', displayName: '🎴 預設', description: '預設風格', preview: { emoji: '🎴', bgColor: '#f3f4f6', cardColor: '#3b82f6' } },
  { id: 'clouds', name: 'clouds', displayName: '☁️ 雲朵', description: '輕鬆愉快的雲朵主題，適合所有年齡層', preview: { emoji: '☁️', bgColor: '#e0f2fe', cardColor: '#38bdf8' } },
  { id: 'videogame', name: 'videogame', displayName: '🎮 電子遊戲', description: '復古像素風格，適合遊戲愛好者', preview: { emoji: '🎮', bgColor: '#1e1b4b', cardColor: '#a78bfa' } },
  { id: 'magiclibrary', name: 'magiclibrary', displayName: '📚 魔法圖書館', description: '神秘的魔法圖書館主題，充滿魔法氛圍', preview: { emoji: '📚', bgColor: '#422006', cardColor: '#fbbf24' } },
  { id: 'underwater', name: 'underwater', displayName: '🐠 水下', description: '神秘的海底世界主題', preview: { emoji: '🐠', bgColor: '#0c4a6e', cardColor: '#22d3ee' } },
  { id: 'pets', name: 'pets', displayName: '🐶 寵物', description: '可愛的寵物主題，適合動物愛好者', preview: { emoji: '🐶', bgColor: '#fef3c7', cardColor: '#f59e0b' } },
  { id: 'space', name: 'space', displayName: '🚀 太空', description: '神秘的外太空主題', preview: { emoji: '🚀', bgColor: '#0f172a', cardColor: '#a855f7' } },
  { id: 'dinosaur', name: 'dinosaur', displayName: '🦕 恐龍', description: '史前恐龍主題，適合恐龍愛好者', preview: { emoji: '🦕', bgColor: '#365314', cardColor: '#84cc16' } },
];

interface SpeakingCardsStyleSelectorProps {
  selectedStyle: string;
  onChange: (styleId: string) => void;
}

export default function SpeakingCardsStyleSelector({ selectedStyle, onChange }: SpeakingCardsStyleSelectorProps) {
  const [uploadedStyles, setUploadedStyles] = useState<Record<string, { background?: string; card_back?: string; card_front?: string }>>({});

  // 獲取已上傳的樣式資源
  useEffect(() => {
    const fetchStyleResources = async () => {
      const resources: Record<string, { background?: string; card_back?: string; card_front?: string }> = {};
      
      for (const style of SPEAKING_CARDS_STYLES) {
        if (style.id === 'default') continue;
        
        try {
          const response = await fetch(`/api/visual-styles/upload?styleId=${style.id}&game=speaking-cards`);
          if (response.ok) {
            const data = await response.json();
            if (data.resources) {
              resources[style.id] = {
                background: data.resources.background?.exists ? data.resources.background.url : undefined,
                card_back: data.resources.card_back?.exists ? data.resources.card_back.url : undefined,
                card_front: data.resources.card_front?.exists ? data.resources.card_front.url : undefined,
              };
            }
          }
        } catch (error) {
          console.error(`Failed to fetch style ${style.id}:`, error);
        }
      }
      
      setUploadedStyles(resources);
    };

    fetchStyleResources();
  }, []);

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
        🎨 視覺風格
      </h3>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {SPEAKING_CARDS_STYLES.map((style) => {
          const hasResources = uploadedStyles[style.id]?.background || 
                              uploadedStyles[style.id]?.card_back || 
                              uploadedStyles[style.id]?.card_front;
          
          return (
            <button
              key={style.id}
              onClick={() => onChange(style.id)}
              className={`relative p-2 rounded-lg border-2 transition-all hover:shadow-md ${
                selectedStyle === style.id
                  ? 'border-purple-500 bg-purple-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              title={style.description}
            >
              {/* 預覽區域 */}
              <div
                className="w-full aspect-square rounded-lg mb-1 flex items-center justify-center text-2xl"
                style={{
                  backgroundColor: style.preview.bgColor,
                  backgroundImage: uploadedStyles[style.id]?.background ? `url(${uploadedStyles[style.id].background})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                {style.preview.emoji}
              </div>

              {/* 風格名稱 */}
              <div className="text-xs font-medium text-gray-900 text-center truncate">
                {style.name}
              </div>

              {/* 已上傳標記 */}
              {hasResources && style.id !== 'default' && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">
                  ✓
                </div>
              )}

              {/* 選中標記 */}
              {selectedStyle === style.id && (
                <div className="absolute inset-0 border-2 border-purple-500 rounded-lg pointer-events-none">
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white px-1 py-0.5 rounded text-xs">
                    ✓
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 管理連結 */}
      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-gray-500">
          選擇的風格: <span className="font-medium text-purple-600">{SPEAKING_CARDS_STYLES.find(s => s.id === selectedStyle)?.displayName}</span>
        </p>
        <a
          href="/admin/speaking-cards/visual-styles"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-purple-600 hover:text-purple-800 hover:underline"
        >
          ⚙️ 管理視覺風格資源
        </a>
      </div>
    </div>
  );
}

