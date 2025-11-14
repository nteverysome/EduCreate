/**
 * 上傳 Match-up 遊戲視覺風格資源到 Vercel Blob Storage
 * 
 * 用途：為 Match-up 遊戲上傳視覺風格配置
 * 
 * 運行方式：
 * npx tsx scripts/upload-match-up-visual-styles.ts
 */

import { config } from 'dotenv';
import { put } from '@vercel/blob';

// 加載 .env.local 文件
config({ path: '.env.local' });

// Match-up 遊戲的視覺風格配置
const MATCH_UP_VISUAL_STYLES = {
  clouds: {
    name: '雲朵',
    colors: {
      primary: '#4FC3F7',
      secondary: '#FFFFFF',
      text: '#000000',
      background: '#87CEEB',
      cardBackground: '#E3F2FD',
      cardBorder: '#4FC3F7'
    },
    fonts: {
      primary: 'Roboto',
      secondary: 'Roboto'
    }
  },
  videogame: {
    name: '電子遊戲',
    colors: {
      primary: '#00FF00',
      secondary: '#FF00FF',
      text: '#000000',
      background: '#000000',
      cardBackground: '#003300',
      cardBorder: '#00FF00'
    },
    fonts: {
      primary: '"Press Start 2P"',
      secondary: 'monospace'
    }
  },
  magiclibrary: {
    name: '魔法圖書館',
    colors: {
      primary: '#9C27B0',
      secondary: '#FFD700',
      text: '#FFFFFF',
      background: '#4A148C',
      cardBackground: '#7B1FA2',
      cardBorder: '#FFD700'
    },
    fonts: {
      primary: 'Georgia',
      secondary: 'serif'
    }
  },
  underwater: {
    name: '水下',
    colors: {
      primary: '#00BCD4',
      secondary: '#FF9800',
      text: '#FFFFFF',
      background: '#006064',
      cardBackground: '#00838F',
      cardBorder: '#FF9800'
    },
    fonts: {
      primary: 'Roboto',
      secondary: 'Roboto'
    }
  },
  pets: {
    name: '寵物',
    colors: {
      primary: '#FF6F00',
      secondary: '#FFAB91',
      text: '#FFFFFF',
      background: '#FFE4B5',
      cardBackground: '#FFB74D',
      cardBorder: '#FF6F00'
    },
    fonts: {
      primary: 'Roboto',
      secondary: 'Roboto'
    }
  },
  space: {
    name: '太空',
    colors: {
      primary: '#00E5FF',
      secondary: '#9C27B0',
      text: '#000000',
      background: '#0D1B2A',
      cardBackground: '#1A237E',
      cardBorder: '#00E5FF'
    },
    fonts: {
      primary: 'Roboto',
      secondary: 'Roboto'
    }
  },
  dinosaur: {
    name: '恐龍',
    colors: {
      primary: '#4CAF50',
      secondary: '#A1887F',
      text: '#FFFFFF',
      background: '#8D6E63',
      cardBackground: '#558B2F',
      cardBorder: '#A1887F'
    },
    fonts: {
      primary: 'Roboto',
      secondary: 'Roboto'
    }
  }
};

async function uploadMatchUpVisualStyles() {
  console.log('🎨 開始上傳 Match-up 遊戲視覺風格資源到 Vercel Blob Storage...\n');

  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error('BLOB_READ_WRITE_TOKEN 環境變量未設置');
    }
    console.log('✅ BLOB_READ_WRITE_TOKEN 已設置\n');

    let successCount = 0;
    let errorCount = 0;

    for (const [styleId, styleConfig] of Object.entries(MATCH_UP_VISUAL_STYLES)) {
      try {
        console.log(`📤 上傳 ${styleConfig.name} (${styleId}) 資源...`);

        // 上傳顏色配置
        const colorConfig = JSON.stringify(styleConfig.colors, null, 2);
        const colorBlob = await put(
          `visual-styles/${styleId}/colors.json`,
          colorConfig,
          {
            access: 'public',
            contentType: 'application/json',
            allowOverwrite: true,
          }
        );
        console.log(`  ✅ 顏色配置: ${colorBlob.url}`);

        // 上傳字體配置
        const fontConfig = JSON.stringify(styleConfig.fonts, null, 2);
        const fontBlob = await put(
          `visual-styles/${styleId}/fonts.json`,
          fontConfig,
          {
            access: 'public',
            contentType: 'application/json',
            allowOverwrite: true,
          }
        );
        console.log(`  ✅ 字體配置: ${fontBlob.url}`);

        // 上傳完整配置
        const fullConfig = JSON.stringify(styleConfig, null, 2);
        const configBlob = await put(
          `visual-styles/${styleId}/config.json`,
          fullConfig,
          {
            access: 'public',
            contentType: 'application/json',
            allowOverwrite: true,
          }
        );
        console.log(`  ✅ 完整配置: ${configBlob.url}\n`);

        successCount++;
      } catch (error) {
        errorCount++;
        console.error(`  ❌ 上傳失敗: ${error instanceof Error ? error.message : '未知錯誤'}\n`);
      }
    }

    console.log(`\n📊 上傳完成！`);
    console.log(`✅ 成功: ${successCount} 個視覺風格`);
    console.log(`❌ 失敗: ${errorCount} 個視覺風格`);

    if (errorCount === 0) {
      console.log('\n🎉 所有 Match-up 遊戲視覺風格資源已成功上傳到 Vercel Blob Storage！');
    }
  } catch (error) {
    console.error('❌ 上傳過程出錯:', error);
    process.exit(1);
  }
}

uploadMatchUpVisualStyles();

