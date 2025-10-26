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
    <div className="bg-white border border-gray-300 rounded-lg p-2 sm:p-4 mb-4">
      <h3 className="text-base font-semibold mb-2">視覺風格</h3>

      <div className="grid grid-cols-7 gap-1">
        {VISUAL_STYLES.map((style) => (
          <div
            key={style.id}
            onClick={() => onChange(style.id)}
            className={`cursor-pointer border rounded p-1 transition-all hover:shadow-sm ${
              selectedStyle === style.id
                ? 'border-blue-500 bg-blue-50 shadow-sm'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            {/* 預覽區域 - 只顯示表情符號 */}
            <div
              className="w-full h-12 rounded flex items-center justify-center text-xl"
              style={{
                backgroundColor: style.backgroundColor,
                color: style.primaryColor
              }}
            >
              {style.displayName.split(' ')[0]}
            </div>

            {/* 風格名稱 - 簡化顯示 */}
            <div className="text-center mt-1">
              <h4 className="font-medium text-gray-900 text-xs truncate">
                {style.name}
              </h4>
            </div>

            {/* 選中標記 - 簡化 */}
            {selectedStyle === style.id && (
              <div className="mt-1 flex items-center justify-center">
                <div className="bg-blue-500 text-white px-1 py-0.5 rounded text-xs">
                  ✓
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

