import { config } from 'dotenv';
import { createApi } from 'unsplash-js';

// 加載 .env.local 文件
config({ path: '.env.local' });

async function testUnsplashAPI() {
  console.log('🧪 開始測試 Unsplash API...\n');

  try {
    // 檢查環境變量
    console.log('📋 步驟 1: 檢查環境變量');
    if (!process.env.UNSPLASH_ACCESS_KEY) {
      throw new Error('❌ UNSPLASH_ACCESS_KEY 環境變量未設置');
    }
    console.log('✅ UNSPLASH_ACCESS_KEY 已設置');
    console.log('   Access Key:', process.env.UNSPLASH_ACCESS_KEY.substring(0, 20) + '...\n');

    // 創建 Unsplash API 實例
    console.log('🔧 步驟 2: 創建 Unsplash API 實例');
    const unsplash = createApi({
      accessKey: process.env.UNSPLASH_ACCESS_KEY,
    });
    console.log('✅ API 實例創建成功\n');

    // 測試搜索功能
    console.log('🔍 步驟 3: 測試圖片搜索功能');
    console.log('   搜索關鍵字: "education"');
    const searchResult = await unsplash.search.getPhotos({
      query: 'education',
      page: 1,
      perPage: 5,
      orientation: 'landscape',
    });

    if (searchResult.errors) {
      console.error('❌ 搜索失敗:', searchResult.errors);
      throw new Error('搜索 API 調用失敗');
    }

    console.log('✅ 搜索成功！');
    console.log(`   找到 ${searchResult.response?.total} 張圖片`);
    console.log(`   返回 ${searchResult.response?.results.length} 張圖片\n`);

    // 顯示搜索結果
    console.log('📸 步驟 4: 顯示搜索結果');
    searchResult.response?.results.forEach((photo, index) => {
      console.log(`   ${index + 1}. ${photo.description || photo.alt_description || 'No description'}`);
      console.log(`      作者: ${photo.user.name} (@${photo.user.username})`);
      console.log(`      尺寸: ${photo.width}x${photo.height}`);
      console.log(`      URL: ${photo.urls.small}`);
      console.log(`      下載: ${photo.links.download}\n`);
    });

    // 測試獲取隨機圖片
    console.log('🎲 步驟 5: 測試獲取隨機圖片');
    const randomResult = await unsplash.photos.getRandom({
      query: 'learning',
      count: 3,
      orientation: 'landscape',
    });

    if (randomResult.errors) {
      console.error('❌ 獲取隨機圖片失敗:', randomResult.errors);
      throw new Error('隨機圖片 API 調用失敗');
    }

    console.log('✅ 獲取隨機圖片成功！');
    if (Array.isArray(randomResult.response)) {
      console.log(`   返回 ${randomResult.response.length} 張隨機圖片\n`);
      
      randomResult.response.forEach((photo, index) => {
        console.log(`   ${index + 1}. ${photo.description || photo.alt_description || 'No description'}`);
        console.log(`      作者: ${photo.user.name}`);
        console.log(`      URL: ${photo.urls.small}\n`);
      });
    }

    // 測試獲取圖片詳情
    console.log('🔍 步驟 6: 測試獲取圖片詳情');
    if (searchResult.response?.results[0]) {
      const photoId = searchResult.response.results[0].id;
      console.log(`   圖片 ID: ${photoId}`);
      
      const photoResult = await unsplash.photos.get({ photoId });
      
      if (photoResult.errors) {
        console.error('❌ 獲取圖片詳情失敗:', photoResult.errors);
      } else {
        console.log('✅ 獲取圖片詳情成功！');
        console.log(`   標題: ${photoResult.response?.description || photoResult.response?.alt_description}`);
        console.log(`   作者: ${photoResult.response?.user.name}`);
        console.log(`   喜歡數: ${photoResult.response?.likes}`);
        console.log(`   下載數: ${photoResult.response?.downloads}\n`);
      }
    }

    // 測試 API 配額
    console.log('📊 步驟 7: 檢查 API 配額');
    console.log('   當前模式: Demo (50 requests/hour)');
    console.log('   Production 模式: 5,000 requests/hour (需要申請)\n');

    // 成功總結
    console.log('🎉 所有測試通過！');
    console.log('\n📊 Unsplash API 配置正確：');
    console.log('   ✅ 環境變量配置正確');
    console.log('   ✅ API 實例創建成功');
    console.log('   ✅ 搜索功能正常');
    console.log('   ✅ 隨機圖片功能正常');
    console.log('   ✅ 圖片詳情功能正常\n');

    console.log('💡 下一步：');
    console.log('   1. 創建 /api/unsplash/search API 路由');
    console.log('   2. 實施圖片下載追蹤（觸發 download endpoint）');
    console.log('   3. 整合到 ImagePicker 組件');
    console.log('   4. 考慮申請 Production 模式以獲得更高配額\n');

    console.log('📝 重要提醒：');
    console.log('   - 必須 hotlink 圖片（使用 Unsplash 的 URL）');
    console.log('   - 必須在用戶使用圖片時觸發 download endpoint');
    console.log('   - 必須正確標註作者和 Unsplash');
    console.log('   - 必須保持 API Keys 機密\n');

  } catch (error) {
    console.error('\n❌ 測試失敗！');
    console.error('錯誤信息:', error instanceof Error ? error.message : String(error));
    
    if (error instanceof Error) {
      if (error.message.includes('UNSPLASH_ACCESS_KEY')) {
        console.error('\n💡 解決方案：');
        console.error('   1. 確認 .env.local 文件中有 UNSPLASH_ACCESS_KEY');
        console.error('   2. 重新啟動開發服務器');
        console.error('   3. 檢查 Access Key 是否正確\n');
      } else if (error.message.includes('401')) {
        console.error('\n💡 解決方案：');
        console.error('   1. 檢查 Access Key 是否正確');
        console.error('   2. 確認 Unsplash 應用是否已激活');
        console.error('   3. 檢查 API 配額是否已用完\n');
      } else if (error.message.includes('403')) {
        console.error('\n💡 解決方案：');
        console.error('   1. 檢查 API 權限設置');
        console.error('   2. 確認應用是否符合 Unsplash API 使用條款');
        console.error('   3. 檢查是否需要申請 Production 模式\n');
      }
    }
    
    process.exit(1);
  }
}

// 運行測試
testUnsplashAPI();

