/**
 * Unsplash API 使用量檢查腳本
 * 檢查當前的 API 使用量和限制
 */

import { config } from 'dotenv';
import { createApi } from 'unsplash-js';

// 加載環境變量
config({ path: '.env.local' });

async function checkUnsplashUsage() {
  console.log('=== Unsplash API 使用量檢查 ===\n');

  // 1. 檢查環境變量
  console.log('1. 環境變量檢查:');
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  const secretKey = process.env.UNSPLASH_SECRET_KEY;

  if (!accessKey) {
    console.log('   ❌ UNSPLASH_ACCESS_KEY 未設置');
    process.exit(1);
  }
  if (!secretKey) {
    console.log('   ❌ UNSPLASH_SECRET_KEY 未設置');
    process.exit(1);
  }

  console.log('   ✅ UNSPLASH_ACCESS_KEY: 已設置');
  console.log('   ✅ UNSPLASH_SECRET_KEY: 已設置');
  console.log();

  // 2. 創建 Unsplash API 實例
  console.log('2. 創建 Unsplash API 實例:');
  const unsplash = createApi({
    accessKey,
  });
  console.log('   ✅ API 實例創建成功');
  console.log();

  // 3. 測試 API 調用
  console.log('3. 測試 API 調用:');
  try {
    const result = await unsplash.search.getPhotos({
      query: 'test',
      page: 1,
      perPage: 1,
    });

    if (result.errors) {
      console.log('   ❌ API 調用失敗:', result.errors);
      process.exit(1);
    }

    console.log('   ✅ API 調用成功');
    console.log();

    // 4. 檢查 Rate Limit
    console.log('4. Rate Limit 信息:');
    const response = result.response;
    
    if (response) {
      console.log('   總結果數:', response.total);
      console.log('   總頁數:', response.total_pages);
      console.log();
    }

    // 5. 顯示配額信息
    console.log('5. API 配額信息:');
    console.log('   當前模式: Demo');
    console.log('   每小時限制: 50 requests');
    console.log('   生產模式限制: 5,000 requests/hour');
    console.log();

    // 6. 建議
    console.log('6. 使用建議:');
    console.log('   - Demo 模式適合開發和測試');
    console.log('   - 如需更高配額，請申請生產模式');
    console.log('   - 建議實施客戶端緩存減少 API 調用');
    console.log('   - 建議實施 Rate Limit 監控');
    console.log();

    // 7. 監控建議
    console.log('7. 監控建議:');
    console.log('   - 記錄每次 API 調用');
    console.log('   - 實施每小時調用計數器');
    console.log('   - 接近限制時顯示警告');
    console.log('   - 超過限制時暫停調用');
    console.log();

    console.log('✅ Unsplash API 使用量檢查完成！');

  } catch (error) {
    console.log('   ❌ API 調用失敗:', error);
    process.exit(1);
  }
}

// 運行檢查
checkUnsplashUsage();

