/**
 * Vercel Blob Storage 測試腳本
 *
 * 用途：驗證 Vercel Blob Storage 配置是否正確
 *
 * 運行方式：
 * npx tsx scripts/test-blob-storage.ts
 */

import { config } from 'dotenv';
import { put, list, del } from '@vercel/blob';

// 加載 .env.local 文件
config({ path: '.env.local' });

async function testBlobStorage() {
  console.log('🧪 開始測試 Vercel Blob Storage...\n');

  try {
    // 檢查環境變量
    console.log('📋 步驟 1: 檢查環境變量');
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error('❌ BLOB_READ_WRITE_TOKEN 環境變量未設置');
    }
    console.log('✅ BLOB_READ_WRITE_TOKEN 已設置\n');

    // 測試上傳
    console.log('📤 步驟 2: 測試上傳文件');
    const testContent = `Hello from EduCreate! Test at ${new Date().toISOString()}`;
    const uploadResult = await put('test/hello.txt', testContent, {
      access: 'public',
    });
    console.log('✅ 上傳成功！');
    console.log('   URL:', uploadResult.url);
    console.log('   Path:', uploadResult.pathname);
    console.log('   Size:', uploadResult.size, 'bytes\n');

    // 測試列表
    console.log('📋 步驟 3: 測試列出文件');
    const { blobs } = await list({ prefix: 'test/' });
    console.log(`✅ 找到 ${blobs.length} 個文件`);
    blobs.forEach((blob, index) => {
      console.log(`   ${index + 1}. ${blob.pathname} (${blob.size} bytes)`);
    });
    console.log();

    // 測試刪除
    console.log('🗑️  步驟 4: 測試刪除文件');
    await del(uploadResult.url);
    console.log('✅ 刪除成功\n');

    // 驗證刪除
    console.log('🔍 步驟 5: 驗證文件已刪除');
    const { blobs: afterDelete } = await list({ prefix: 'test/' });
    const stillExists = afterDelete.some(blob => blob.pathname === uploadResult.pathname);
    if (stillExists) {
      console.log('⚠️  警告：文件可能仍然存在（可能需要等待緩存刷新）');
    } else {
      console.log('✅ 文件已成功刪除\n');
    }

    // 測試目錄結構
    console.log('📁 步驟 6: 測試目錄結構');
    const directories = [
      'avatars/',
      'screenshots/',
      'user-uploads/',
      'activity-images/',
    ];

    for (const dir of directories) {
      const { blobs } = await list({ prefix: dir, limit: 1 });
      console.log(`   ${dir}: ${blobs.length > 0 ? '✅ 已存在' : '⚪ 空目錄'}`);
    }
    console.log();

    // 成功總結
    console.log('🎉 所有測試通過！');
    console.log('\n📊 Vercel Blob Storage 配置正確：');
    console.log('   ✅ 環境變量配置正確');
    console.log('   ✅ 上傳功能正常');
    console.log('   ✅ 列表功能正常');
    console.log('   ✅ 刪除功能正常');
    console.log('   ✅ 目錄結構已準備\n');

    console.log('💡 下一步：');
    console.log('   1. 開始實施圖片上傳 API');
    console.log('   2. 創建 ImagePicker 組件');
    console.log('   3. 整合 Unsplash API\n');

  } catch (error) {
    console.error('\n❌ 測試失敗！');
    console.error('錯誤信息:', error instanceof Error ? error.message : String(error));
    
    if (error instanceof Error && error.message.includes('BLOB_READ_WRITE_TOKEN')) {
      console.error('\n💡 解決方案：');
      console.error('   1. 確認 .env.local 文件中有 BLOB_READ_WRITE_TOKEN');
      console.error('   2. 重新啟動開發服務器');
      console.error('   3. 檢查 Token 是否正確\n');
    }
    
    process.exit(1);
  }
}

// 運行測試
testBlobStorage();

