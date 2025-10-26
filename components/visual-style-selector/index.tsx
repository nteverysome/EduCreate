/**
 * 視覺風格選擇器組件
 * 參考 Wordwall 的 Visual Styles 功能實現
 */

'use client';

import { VisualStyle, VISUAL_STYLES } from '@/types/visual-style';

interface VisualStyleSelectorProps {
  selectedStyle: string;
  onChange: (styleId: string) => void;
}

export default function VisualStyleSelector({ selectedStyle, onChange }: VisualStyleSelectorProps) {
  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4 sm:p-6 mb-4">
      <h3 className="text-lg font-semibold mb-4">視覺風格</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {VISUAL_STYLES.map((style) => (
          <div
            key={style.id}
            onClick={() => onChange(style.id)}
            className={`cursor-pointer border-2 rounded-lg p-3 sm:p-4 transition-all hover:shadow-md ${
              selectedStyle === style.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* 預覽區域 */}
            <div
              className="w-full h-24 sm:h-32 rounded-lg mb-3 flex items-center justify-center text-4xl sm:text-5xl"
              style={{
                backgroundColor: style.backgroundColor,
                backgroundImage: style.backgroundImage ? `url(${style.backgroundImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                color: style.primaryColor
              }}
            >
              {style.displayName.split(' ')[0]}
            </div>
            
            {/* 風格信息 */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                {style.displayName}
              </h4>
              <p className="text-xs sm:text-sm text-gray-500 mb-2">
                {style.description}
              </p>
              
              {/* 顏色預覽 */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <div
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-gray-300"
                    style={{ backgroundColor: style.primaryColor }}
                    title="主要顏色"
                  />
                  <div
                    className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-gray-300"
                    style={{ backgroundColor: style.secondaryColor }}
                    title="次要顏色"
                  />
                </div>
                <span className="text-xs text-gray-400 ml-auto">
                  {style.fontFamily.split(',')[0]}
                </span>
              </div>
            </div>
            
            {/* 選中標記 */}
            {selectedStyle === style.id && (
              <div className="mt-3 flex items-center justify-center">
                <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                  ✓ 已選擇
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* 說明文字 */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>提示：</strong>視覺風格會改變遊戲的外觀、字體和顏色。選擇適合您學生年齡層的風格以獲得最佳學習體驗。
        </p>
      </div>
    </div>
  );
}

