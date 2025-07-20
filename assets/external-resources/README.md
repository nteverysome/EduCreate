# EduCreate 外部資源管理系統

## 概述
此目錄用於管理 EduCreate 項目中使用的外部資源，包括視差背景、遊戲素材、音效等。

## 目錄結構
```
assets/external-resources/
├── README.md                    # 本文件
├── parallax-backgrounds/        # 視差背景資源
├── game-assets/                # 遊戲素材
├── audio/                      # 音效資源
├── fonts/                      # 字體資源
├── icons/                      # 圖標資源
└── licenses/                   # 授權文件
```

## 當前待下載資源

### 1. Parallax (Forest, desert, sky, moon) by Bongseng
- **來源**: https://bongseng.itch.io/parallax-forest-desert-sky-moon
- **類型**: 視差背景資源包
- **授權**: 免費使用（商業和非商業項目）
- **檔案大小**: 
  - Horizontal asset pack.zip (1.3 MB)
  - Vertical asset pack.zip (837 kB)
- **內容包含**:
  - 森林視差：6層
  - 沙漠視差：6層  
  - 天空視差：9層
  - 月亮視差：6層
  - 額外遊戲素材（敵人、爆炸動畫、玩家飛船等）

### 下載步驟
1. 訪問 https://bongseng.itch.io/parallax-forest-desert-sky-moon
2. 點擊 "Download Now" 按鈕
3. 選擇 "Name your own price"（可以輸入 $0 免費下載）
4. 如果沒有 itch.io 帳號，需要先註冊
5. 下載兩個檔案：
   - Horizontal asset pack.zip
   - Vertical asset pack.zip
6. 解壓縮到 `assets/external-resources/parallax-backgrounds/bongseng-parallax/`

### EduCreate 整合計劃
這些視差背景可以用於：
1. **記憶科學遊戲背景**: 為不同的學習場景提供沉浸式背景
2. **主題切換系統**: 根據學習內容切換不同環境（森林=自然主題，沙漠=探險主題等）
3. **GEPT 分級場景**: 不同難度級別使用不同背景複雜度
4. **無障礙設計**: 提供低對比度版本供視覺敏感用戶使用

## 授權要求
- ✅ 可以在商業和非商業項目中使用
- ✅ 可以編輯和修改素材
- ❌ 不能轉售或分發原始素材給他人
- ❌ 不能編輯後轉售素材

## 技術整合指南

### 在 Next.js 中使用
```typescript
// components/games/ParallaxBackground.tsx
import { useEffect, useRef } from 'react';

interface ParallaxBackgroundProps {
  theme: 'forest' | 'desert' | 'sky' | 'moon';
  speed?: number;
}

export const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({
  theme,
  speed = 1
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // 實現視差滾動邏輯
    const handleScroll = () => {
      if (containerRef.current) {
        const scrolled = window.pageYOffset;
        const layers = containerRef.current.querySelectorAll('.parallax-layer');
        
        layers.forEach((layer, index) => {
          const rate = scrolled * -speed * (index + 1) * 0.1;
          (layer as HTMLElement).style.transform = `translateY(${rate}px)`;
        });
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed]);
  
  return (
    <div ref={containerRef} className="parallax-container">
      {/* 渲染對應主題的視差層 */}
    </div>
  );
};
```

### 在遊戲中使用
```typescript
// lib/games/backgroundManager.ts
export class BackgroundManager {
  private currentTheme: string = 'forest';
  
  loadParallaxBackground(theme: string) {
    // 載入對應主題的背景層
    const layers = this.getThemeLayers(theme);
    return layers;
  }
  
  private getThemeLayers(theme: string) {
    const basePath = '/assets/external-resources/parallax-backgrounds/bongseng-parallax/';
    
    switch(theme) {
      case 'forest':
        return [
          `${basePath}forest/layer1.png`,
          `${basePath}forest/layer2.png`,
          // ... 更多層
        ];
      case 'desert':
        return [
          `${basePath}desert/layer1.png`,
          `${basePath}desert/layer2.png`,
          // ... 更多層
        ];
      // ... 其他主題
    }
  }
}
```

## 性能優化建議
1. **圖片壓縮**: 使用 WebP 格式減少檔案大小
2. **懶加載**: 只載入當前需要的背景層
3. **快取策略**: 實現背景資源的本地快取
4. **響應式設計**: 為不同螢幕尺寸提供適當的背景版本

## 無障礙設計考量
1. **動畫控制**: 提供關閉視差效果的選項
2. **對比度調整**: 為視覺敏感用戶提供低對比度版本
3. **替代文字**: 為背景圖片提供適當的 alt 文字描述

## 更新日誌
- 2025-07-20: 初始化外部資源管理系統
- 2025-07-20: 添加 Bongseng 視差背景資源計劃

## 相關資源
- [Bongseng 其他資源包](https://bongseng.itch.io/)
- [EduCreate 遊戲設計文檔](../../docs/context-rules.md)
- [視覺設計指南](../../docs/visual-design-guide.md)
