/**
 * Vercel Blob Storage 清理腳本
 * 
 * 用途：列出並刪除舊的上傳文件，釋放存儲空間
 * 
 * 運行方式：
 * npx tsx scripts/cleanup-blob-storage.ts
 */

import { config } from 'dotenv';
import { list, del } from '@vercel/blob';

// 加載 .env.local 文件
config({ path: '.env.local' });

interface BlobFile {
  pathname: string;
  size: number;
  uploadedAt: Date;
  url: string;
}

async function cleanupBlobStorage() {
  console.log('🧹 開始清理 Vercel Blob Storage...\n');

  try {
    // 檢查環境變量
    console.log('📋 步驟 1: 檢查環境變量');
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error('❌ BLOB_READ_WRITE_TOKEN 環境變量未設置');
    }
    console.log('✅ BLOB_READ_WRITE_TOKEN 已設置\n');

    // 列出所有文件
    console.log('📂 步驟 2: 列出所有 Blob 文件');
    const { blobs } = await list();
    console.log(`✅ 找到 ${blobs.length} 個文件\n`);

    if (blobs.length === 0) {
      console.log('✅ 存儲中沒有文件，無需清理');
      return;
    }

    // 分析文件
    console.log('📊 步驟 3: 分析文件');
    const files: BlobFile[] = blobs.map(blob => ({
      pathname: blob.pathname,
      size: blob.size,
      uploadedAt: new Date(blob.uploadedAt),
      url: blob.url,
    }));

    // 按上傳時間排序
    files.sort((a, b) => a.uploadedAt.getTime() - b.uploadedAt.getTime());

    // 計算統計信息
    const totalSize = files.reduce((sum, f) => sum + f.size, 0);
    const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
    console.log(`📊 總文件數: ${files.length}`);
    console.log(`📊 總大小: ${totalSizeMB} MB\n`);

    // 顯示文件列表
    console.log('📋 文件列表（按上傳時間排序）：');
    console.log('─'.repeat(100));
    files.forEach((file, index) => {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      const date = file.uploadedAt.toLocaleString('zh-CN');
      console.log(`${index + 1}. ${file.pathname}`);
      console.log(`   大小: ${sizeMB} MB | 上傳時間: ${date}`);
    });
    console.log('─'.repeat(100));
    console.log();

    // 識別可以刪除的文件
    console.log('🔍 步驟 4: 識別可以刪除的文件');
    
    // 刪除策略：
    // 1. 刪除 test-uploads 目錄中的所有文件（測試上傳）
    // 2. 刪除 30 天前的舊文件
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const filesToDelete = files.filter(file => {
      // 刪除測試上傳
      if (file.pathname.startsWith('test-uploads/')) {
        return true;
      }
      // 刪除 30 天前的舊文件
      if (file.uploadedAt < thirtyDaysAgo) {
        return true;
      }
      return false;
    });

    console.log(`✅ 找到 ${filesToDelete.length} 個可以刪除的文件\n`);

    if (filesToDelete.length === 0) {
      console.log('✅ 沒有需要刪除的文件');
      return;
    }

    // 顯示要刪除的文件
    console.log('🗑️  要刪除的文件：');
    console.log('─'.repeat(100));
    let deleteSize = 0;
    filesToDelete.forEach((file, index) => {
      const sizeMB = (file.size / 1024 / 1024).toFixed(2);
      const date = file.uploadedAt.toLocaleString('zh-CN');
      console.log(`${index + 1}. ${file.pathname}`);
      console.log(`   大小: ${sizeMB} MB | 上傳時間: ${date}`);
      deleteSize += file.size;
    });
    console.log('─'.repeat(100));
    const deleteSizeMB = (deleteSize / 1024 / 1024).toFixed(2);
    console.log(`\n📊 將釋放: ${deleteSizeMB} MB\n`);

    // 刪除文件
    console.log('🗑️  步驟 5: 刪除文件');
    let successCount = 0;
    let errorCount = 0;

    for (const file of filesToDelete) {
      try {
        await del(file.url);
        successCount++;
        console.log(`✅ 已刪除: ${file.pathname}`);
      } catch (error) {
        errorCount++;
        console.error(`❌ 刪除失敗: ${file.pathname}`, error);
      }
    }

    console.log(`\n✅ 清理完成！`);
    console.log(`📊 成功刪除: ${successCount} 個文件`);
    console.log(`❌ 刪除失敗: ${errorCount} 個文件`);
    console.log(`📊 釋放空間: ${deleteSizeMB} MB\n`);

  } catch (error) {
    console.error('❌ 清理失敗:', error);
    process.exit(1);
  }
}

cleanupBlobStorage();

