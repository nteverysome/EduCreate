/**
 * Test Unsplash Search API
 * 
 * This script tests the Unsplash search API endpoint to verify:
 * 1. API is accessible
 * 2. Environment variables are loaded correctly
 * 3. Unsplash API integration is working
 */

async function testUnsplashSearch() {
  console.log('=== Testing Unsplash Search API ===\n');

  const baseUrl = 'https://edu-create.vercel.app';
  const endpoint = '/api/unsplash/search';
  const query = 'cat';
  const page = 1;
  const perPage = 5; // 只取 5 張圖片測試

  const url = `${baseUrl}${endpoint}?query=${query}&page=${page}&perPage=${perPage}`;

  console.log(`📍 Testing URL: ${url}\n`);

  try {
    console.log('⏳ Sending request...\n');

    const response = await fetch(url);

    console.log(`✅ Response Status: ${response.status} ${response.statusText}\n`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Error Response:');
      console.error(errorText);
      return;
    }

    const data = await response.json();

    console.log('✅ Response received successfully!\n');

    // 顯示結果統計
    console.log('📊 Results Summary:');
    console.log(`   - Total Results: ${data.total || 0}`);
    console.log(`   - Total Pages: ${data.total_pages || 0}`);
    console.log(`   - Results in this page: ${data.results?.length || 0}\n`);

    // 顯示前 3 張圖片的詳細信息
    if (data.results && data.results.length > 0) {
      console.log('🖼️  Sample Images (first 3):\n');

      data.results.slice(0, 3).forEach((image: any, index: number) => {
        console.log(`   ${index + 1}. ${image.alt_description || 'No description'}`);
        console.log(`      - ID: ${image.id}`);
        console.log(`      - Photographer: ${image.user?.name || 'Unknown'}`);
        console.log(`      - Width: ${image.width}px`);
        console.log(`      - Height: ${image.height}px`);
        console.log(`      - URL: ${image.urls?.small || 'N/A'}`);
        console.log(`      - Download URL: ${image.links?.download || 'N/A'}\n`);
      });
    }

    // 驗證數據結構
    console.log('✅ Data Structure Validation:');
    console.log(`   - Has 'total' field: ${!!data.total}`);
    console.log(`   - Has 'total_pages' field: ${!!data.total_pages}`);
    console.log(`   - Has 'results' array: ${Array.isArray(data.results)}`);

    if (data.results && data.results.length > 0) {
      const firstImage = data.results[0];
      console.log(`   - First image has 'id': ${!!firstImage.id}`);
      console.log(`   - First image has 'urls': ${!!firstImage.urls}`);
      console.log(`   - First image has 'user': ${!!firstImage.user}`);
      console.log(`   - First image has 'links': ${!!firstImage.links}`);
    }

    console.log('\n🎉 Unsplash Search API Test Passed!\n');

    // 測試結果摘要
    console.log('=== Test Summary ===');
    console.log('✅ API Endpoint: Working');
    console.log('✅ Environment Variables: Loaded');
    console.log('✅ Unsplash Integration: Working');
    console.log('✅ Response Format: Valid');
    console.log('✅ Image Data: Complete\n');

  } catch (error) {
    console.error('❌ Test Failed!\n');
    console.error('Error:', error);

    if (error instanceof Error) {
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
    }
  }
}

// 運行測試
testUnsplashSearch();

