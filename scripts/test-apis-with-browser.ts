/**
 * Browser-based API Testing with Authentication
 * 
 * Tests all image management APIs with authenticated user session
 */

import { chromium } from 'playwright';

const BASE_URL = 'https://edu-create.vercel.app';

async function runBrowserTests() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   Browser-based API Testing (Authenticated)           ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to the website
    console.log('📍 Navigating to website...');
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Check if already logged in
    const isLoggedIn = await page.locator('text=南志宗').isVisible().catch(() => false);
    
    if (isLoggedIn) {
      console.log('✅ Already logged in as 南志宗\n');
    } else {
      console.log('⚠️  Not logged in. Please log in manually.\n');
      console.log('Waiting for login...');
      await page.waitForSelector('text=南志宗', { timeout: 60000 });
      console.log('✅ Logged in successfully\n');
    }

    // Test 1: Unsplash Search API
    console.log('=== Test 1: Unsplash Search API ===');
    const unsplashResult = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/unsplash/search?query=nature&page=1&perPage=3');
        const data = await response.json();
        return {
          status: response.status,
          success: data.success,
          photoCount: data.photos?.length || 0,
          total: data.total
        };
      } catch (error: any) {
        return { error: error.message };
      }
    });
    
    if (unsplashResult.status === 200) {
      console.log('✅ PASS - Unsplash Search API');
      console.log(`   Status: ${unsplashResult.status}`);
      console.log(`   Photos returned: ${unsplashResult.photoCount}`);
      console.log(`   Total available: ${unsplashResult.total}\n`);
    } else {
      console.log('❌ FAIL - Unsplash Search API');
      console.log(`   ${JSON.stringify(unsplashResult, null, 2)}\n`);
    }

    // Test 2: Image List API
    console.log('=== Test 2: Image List API ===');
    const listResult = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/images/list?page=1&perPage=10');
        const data = await response.json();
        return {
          status: response.status,
          success: data.success,
          imageCount: data.images?.length || 0,
          total: data.total
        };
      } catch (error: any) {
        return { error: error.message };
      }
    });
    
    if (listResult.status === 200) {
      console.log('✅ PASS - Image List API');
      console.log(`   Status: ${listResult.status}`);
      console.log(`   Images returned: ${listResult.imageCount}`);
      console.log(`   Total images: ${listResult.total}\n`);
    } else {
      console.log('❌ FAIL - Image List API');
      console.log(`   ${JSON.stringify(listResult, null, 2)}\n`);
    }

    // Test 3: Image Stats API
    console.log('=== Test 3: Image Stats API ===');
    const statsResult = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/images/stats');
        const data = await response.json();
        return {
          status: response.status,
          success: data.success,
          stats: data.stats
        };
      } catch (error: any) {
        return { error: error.message };
      }
    });
    
    if (statsResult.status === 200) {
      console.log('✅ PASS - Image Stats API');
      console.log(`   Status: ${statsResult.status}`);
      console.log(`   Total images: ${statsResult.stats?.totalImages || 0}`);
      console.log(`   Total size: ${statsResult.stats?.totalSize || 0} bytes`);
      console.log(`   Upload count: ${statsResult.stats?.uploadCount || 0}`);
      console.log(`   Unsplash count: ${statsResult.stats?.unsplashCount || 0}\n`);
    } else {
      console.log('❌ FAIL - Image Stats API');
      console.log(`   ${JSON.stringify(statsResult, null, 2)}\n`);
    }

    // Test 4: Image Upload API (with a small test image)
    console.log('=== Test 4: Image Upload API ===');
    const uploadResult = await page.evaluate(async () => {
      try {
        // Create a small 1x1 PNG image
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = 'red';
          ctx.fillRect(0, 0, 1, 1);
        }
        
        // Convert to blob
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), 'image/png');
        });
        
        // Create FormData
        const formData = new FormData();
        formData.append('file', blob, 'test.png');
        formData.append('alt', 'Test image from automated test');
        formData.append('tags', JSON.stringify(['test', 'automated']));
        
        const response = await fetch('/api/images/upload', {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        return {
          status: response.status,
          success: data.success,
          imageId: data.image?.id,
          url: data.image?.url
        };
      } catch (error: any) {
        return { error: error.message };
      }
    });
    
    if (uploadResult.status === 200 || uploadResult.status === 201) {
      console.log('✅ PASS - Image Upload API');
      console.log(`   Status: ${uploadResult.status}`);
      console.log(`   Image ID: ${uploadResult.imageId}`);
      console.log(`   URL: ${uploadResult.url?.substring(0, 50)}...\n`);
      
      // If upload succeeded, test delete
      if (uploadResult.imageId) {
        console.log('=== Test 5: Image Delete API ===');
        const deleteResult = await page.evaluate(async (imageId) => {
          try {
            const response = await fetch('/api/images/delete', {
              method: 'DELETE',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ imageId })
            });
            
            const data = await response.json();
            return {
              status: response.status,
              success: data.success
            };
          } catch (error: any) {
            return { error: error.message };
          }
        }, uploadResult.imageId);
        
        if (deleteResult.status === 200) {
          console.log('✅ PASS - Image Delete API');
          console.log(`   Status: ${deleteResult.status}`);
          console.log(`   Successfully deleted test image\n`);
        } else {
          console.log('❌ FAIL - Image Delete API');
          console.log(`   ${JSON.stringify(deleteResult, null, 2)}\n`);
        }
      }
    } else {
      console.log('❌ FAIL - Image Upload API');
      console.log(`   ${JSON.stringify(uploadResult, null, 2)}\n`);
    }

    // Print summary
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║   Test Summary                                         ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');
    console.log('All authenticated API tests completed!');
    console.log('Check the results above for details.\n');

  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    console.log('Press Enter to close browser...');
    await new Promise(resolve => {
      process.stdin.once('data', resolve);
    });
    await browser.close();
  }
}

runBrowserTests().catch(console.error);

