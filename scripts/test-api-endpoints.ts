/**
 * API 端點測試腳本
 * 測試新創建的圖片 API 端點
 */

import { config } from 'dotenv';

// 加載 .env.local 文件
config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';

async function testAPIs() {
  console.log('🧪 開始測試 API 端點...\n');
  console.log('⚠️  注意：這些測試需要開發服務器運行並且用戶已登錄\n');

  try {
    // 測試 1: Unsplash 搜索 API
    console.log('📋 測試 1: Unsplash 搜索 API');
    console.log('   端點: GET /api/unsplash/search');
    console.log('   說明: 需要用戶登錄，請在瀏覽器中測試');
    console.log('   URL: http://localhost:3000/api/unsplash/search?query=education&page=1&perPage=5\n');

    // 測試 2: 圖片列表 API
    console.log('📋 測試 2: 圖片列表 API');
    console.log('   端點: GET /api/images/list');
    console.log('   說明: 需要用戶登錄，請在瀏覽器中測試');
    console.log('   URL: http://localhost:3000/api/images/list?page=1&perPage=10\n');

    // 測試 3: 圖片上傳 API
    console.log('📋 測試 3: 圖片上傳 API');
    console.log('   端點: POST /api/images/upload');
    console.log('   說明: 需要用戶登錄和文件上傳，請使用 Postman 或 curl 測試');
    console.log('   示例 curl 命令:');
    console.log('   curl -X POST "http://localhost:3000/api/images/upload" \\');
    console.log('     -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \\');
    console.log('     -F "file=@/path/to/image.jpg" \\');
    console.log('     -F "alt=Test image" \\');
    console.log('     -F \'tags=["test", "demo"]\'\n');

    // 測試 4: Unsplash 下載 API
    console.log('📋 測試 4: Unsplash 下載 API');
    console.log('   端點: POST /api/unsplash/download');
    console.log('   說明: 需要用戶登錄，請使用 Postman 或 curl 測試');
    console.log('   示例 curl 命令:');
    console.log('   curl -X POST "http://localhost:3000/api/unsplash/download" \\');
    console.log('     -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \\');
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -d \'{"photoId": "lUaaKCUANVI", "downloadLocation": "https://api.unsplash.com/photos/lUaaKCUANVI/download?ixid=...", "alt": "Books", "tags": ["education"]}\'\n');

    // 環境檢查
    console.log('🔍 環境變量檢查:');
    console.log(`   ✅ BLOB_READ_WRITE_TOKEN: ${process.env.BLOB_READ_WRITE_TOKEN ? '已設置' : '❌ 未設置'}`);
    console.log(`   ✅ UNSPLASH_ACCESS_KEY: ${process.env.UNSPLASH_ACCESS_KEY ? '已設置' : '❌ 未設置'}`);
    console.log(`   ✅ UNSPLASH_SECRET_KEY: ${process.env.UNSPLASH_SECRET_KEY ? '已設置' : '❌ 未設置'}`);
    console.log(`   ✅ DATABASE_URL: ${process.env.DATABASE_URL ? '已設置' : '❌ 未設置'}\n');

    // 測試服務器連接
    console.log('🌐 測試服務器連接:');
    try {
      const response = await fetch(BASE_URL + '/api/auth/session');
      if (response.ok) {
        console.log('   OK: 開發服務器正在運行');
        const session = await response.json();
        if (session.user) {
          const userInfo = session.user.email || session.user.name || 'Unknown';
          console.log('   OK: 用戶已登錄: ' + userInfo);
        } else {
          console.log('   WARNING: 用戶未登錄，請先登錄');
        }
      } else {
        console.log('   ERROR: 開發服務器未響應');
      }
    } catch (error) {
      console.log('   ERROR: 無法連接到開發服務器');
      console.log('   TIP: 請確保運行 npm run dev');
    }
    console.log();

    // 測試建議
    console.log('💡 測試建議:');
    console.log('   1. 確保開發服務器正在運行（npm run dev）');
    console.log('   2. 在瀏覽器中登錄到應用');
    console.log('   3. 使用瀏覽器開發者工具獲取 session token');
    console.log('   4. 使用 Postman 或 curl 測試 API');
    console.log('   5. 查看詳細測試指南: scripts/test-image-apis.md\n');

    // 快速測試鏈接
    console.log('🔗 快速測試鏈接（需要登錄）:');
    console.log('   Unsplash 搜索: http://localhost:3000/api/unsplash/search?query=education&page=1&perPage=5');
    console.log('   圖片列表: http://localhost:3000/api/images/list?page=1&perPage=10\n');

    console.log('✅ 測試腳本完成！');
    console.log('📖 查看完整測試指南: scripts/test-image-apis.md\n');

  } catch (error) {
    console.error('\n❌ 測試失敗！');
    console.error('錯誤信息:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// 運行測試
testAPIs();

