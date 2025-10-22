/**
 * 簡單的 API 測試腳本
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

const BASE_URL = 'http://localhost:3000';

async function testAPIs() {
  console.log('API 端點測試\n');

  // 環境檢查
  console.log('環境變量檢查:');
  console.log('  BLOB_READ_WRITE_TOKEN:', process.env.BLOB_READ_WRITE_TOKEN ? 'OK' : 'MISSING');
  console.log('  UNSPLASH_ACCESS_KEY:', process.env.UNSPLASH_ACCESS_KEY ? 'OK' : 'MISSING');
  console.log('  UNSPLASH_SECRET_KEY:', process.env.UNSPLASH_SECRET_KEY ? 'OK' : 'MISSING');
  console.log('  DATABASE_URL:', process.env.DATABASE_URL ? 'OK' : 'MISSING');
  console.log();

  // 測試服務器連接
  console.log('測試服務器連接:');
  try {
    const response = await fetch(BASE_URL + '/api/auth/session');
    if (response.ok) {
      console.log('  開發服務器: 運行中');
      const session = await response.json();
      if (session.user) {
        console.log('  用戶狀態: 已登錄');
        console.log('  用戶信息:', session.user.email || session.user.name);
      } else {
        console.log('  用戶狀態: 未登錄');
      }
    } else {
      console.log('  開發服務器: 未響應');
    }
  } catch (error) {
    console.log('  開發服務器: 無法連接');
    console.log('  請確保運行: npm run dev');
  }
  console.log();

  // API 端點列表
  console.log('API 端點列表:');
  console.log('  1. GET  /api/unsplash/search - Unsplash 搜索');
  console.log('  2. GET  /api/images/list - 圖片列表');
  console.log('  3. POST /api/images/upload - 圖片上傳');
  console.log('  4. POST /api/unsplash/download - Unsplash 下載');
  console.log();

  // 測試鏈接
  console.log('測試鏈接（需要登錄）:');
  console.log('  ' + BASE_URL + '/api/unsplash/search?query=education&page=1&perPage=5');
  console.log('  ' + BASE_URL + '/api/images/list?page=1&perPage=10');
  console.log();

  console.log('完整測試指南: scripts/test-image-apis.md');
}

testAPIs();

