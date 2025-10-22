/**
 * Comprehensive Image API Test Suite
 * 
 * Tests all image management API endpoints:
 * 1. Image Upload API
 * 2. Image List API
 * 3. Image Stats API
 * 4. Image Delete API
 * 5. Batch Operations
 */

import fs from 'fs';
import path from 'path';

const BASE_URL = 'https://edu-create.vercel.app';

// Test results storage
const testResults: any[] = [];

// Helper function to log test results
function logTest(name: string, status: 'PASS' | 'FAIL' | 'SKIP', details: any) {
  const result = {
    name,
    status,
    details,
    timestamp: new Date().toISOString()
  };
  testResults.push(result);
  
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
  console.log(`${icon} ${name}`);
  if (details.error) {
    console.log(`   Error: ${details.error}`);
  }
  if (details.message) {
    console.log(`   ${details.message}`);
  }
  console.log('');
}

// Test 1: Image List API (without auth)
async function testImageListNoAuth() {
  console.log('=== Test 1: Image List API (No Auth) ===\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/images/list?page=1&perPage=10`);
    const data = await response.json();
    
    logTest('Image List API (No Auth)', 
      response.status === 401 ? 'PASS' : 'FAIL',
      {
        status: response.status,
        expected: 401,
        message: response.status === 401 
          ? 'Correctly requires authentication' 
          : 'Should require authentication',
        response: data
      }
    );
  } catch (error) {
    logTest('Image List API (No Auth)', 'FAIL', {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// Test 2: Image Stats API (without auth)
async function testImageStatsNoAuth() {
  console.log('=== Test 2: Image Stats API (No Auth) ===\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/images/stats`);
    const data = await response.json();
    
    logTest('Image Stats API (No Auth)', 
      response.status === 401 ? 'PASS' : 'FAIL',
      {
        status: response.status,
        expected: 401,
        message: response.status === 401 
          ? 'Correctly requires authentication' 
          : 'Should require authentication',
        response: data
      }
    );
  } catch (error) {
    logTest('Image Stats API (No Auth)', 'FAIL', {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// Test 3: Image Upload API (without auth)
async function testImageUploadNoAuth() {
  console.log('=== Test 3: Image Upload API (No Auth) ===\n');

  try {
    const formData = new FormData();
    // Create a simple test blob
    const blob = new Blob(['test'], { type: 'image/png' });
    formData.append('file', blob, 'test.png');

    const response = await fetch(`${BASE_URL}/api/images/upload`, {
      method: 'POST',
      body: formData
    });

    let data;
    const text = await response.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = { rawResponse: text };
    }

    logTest('Image Upload API (No Auth)',
      response.status === 401 ? 'PASS' : 'FAIL',
      {
        status: response.status,
        expected: 401,
        message: response.status === 401
          ? 'Correctly requires authentication'
          : 'Should require authentication',
        response: data
      }
    );
  } catch (error) {
    logTest('Image Upload API (No Auth)', 'FAIL', {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// Test 4: Image Delete API (without auth)
async function testImageDeleteNoAuth() {
  console.log('=== Test 4: Image Delete API (No Auth) ===\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/images/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imageId: 'test-id' })
    });
    const data = await response.json();
    
    logTest('Image Delete API (No Auth)', 
      response.status === 401 ? 'PASS' : 'FAIL',
      {
        status: response.status,
        expected: 401,
        message: response.status === 401 
          ? 'Correctly requires authentication' 
          : 'Should require authentication',
        response: data
      }
    );
  } catch (error) {
    logTest('Image Delete API (No Auth)', 'FAIL', {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// Test 5: Batch Upload API (without auth)
async function testBatchUploadNoAuth() {
  console.log('=== Test 5: Batch Upload API (No Auth) ===\n');

  try {
    const formData = new FormData();
    const blob = new Blob(['test'], { type: 'image/png' });
    formData.append('files', blob, 'test1.png');
    formData.append('files', blob, 'test2.png');

    const response = await fetch(`${BASE_URL}/api/images/batch-upload`, {
      method: 'POST',
      body: formData
    });

    let data;
    const text = await response.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = { rawResponse: text };
    }

    logTest('Batch Upload API (No Auth)',
      response.status === 401 ? 'PASS' : 'FAIL',
      {
        status: response.status,
        expected: 401,
        message: response.status === 401
          ? 'Correctly requires authentication'
          : 'Should require authentication',
        response: data
      }
    );
  } catch (error) {
    logTest('Batch Upload API (No Auth)', 'FAIL', {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// Test 6: Batch Delete API (without auth)
async function testBatchDeleteNoAuth() {
  console.log('=== Test 6: Batch Delete API (No Auth) ===\n');

  try {
    const response = await fetch(`${BASE_URL}/api/images/batch-delete`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ imageIds: ['test-id-1', 'test-id-2'] })
    });
    const data = await response.json();

    logTest('Batch Delete API (No Auth)',
      response.status === 401 ? 'PASS' : 'FAIL',
      {
        status: response.status,
        expected: 401,
        message: response.status === 401
          ? 'Correctly requires authentication'
          : 'Should require authentication',
        response: data
      }
    );
  } catch (error) {
    logTest('Batch Delete API (No Auth)', 'FAIL', {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// Test 7: Image Update API (without auth)
async function testImageUpdateNoAuth() {
  console.log('=== Test 7: Image Update API (No Auth) ===\n');
  
  try {
    const response = await fetch(`${BASE_URL}/api/images/update`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        imageId: 'test-id',
        alt: 'Test alt text'
      })
    });
    const data = await response.json();
    
    logTest('Image Update API (No Auth)', 
      response.status === 401 ? 'PASS' : 'FAIL',
      {
        status: response.status,
        expected: 401,
        message: response.status === 401 
          ? 'Correctly requires authentication' 
          : 'Should require authentication',
        response: data
      }
    );
  } catch (error) {
    logTest('Image Update API (No Auth)', 'FAIL', {
      error: error instanceof Error ? error.message : String(error)
    });
  }
}

// Main test runner
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   Comprehensive Image API Test Suite                  ║');
  console.log('║   Testing all endpoints without authentication        ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  await testImageListNoAuth();
  await testImageStatsNoAuth();
  await testImageUploadNoAuth();
  await testImageDeleteNoAuth();
  await testBatchUploadNoAuth();
  await testBatchDeleteNoAuth();
  await testImageUpdateNoAuth();
  
  // Print summary
  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║   Test Summary                                         ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');
  
  const passed = testResults.filter(r => r.status === 'PASS').length;
  const failed = testResults.filter(r => r.status === 'FAIL').length;
  const skipped = testResults.filter(r => r.status === 'SKIP').length;
  const total = testResults.length;
  
  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`\nSuccess Rate: ${((passed / total) * 100).toFixed(1)}%\n`);
  
  // Save results to file
  const resultsPath = path.join(process.cwd(), 'docs', 'api-test-results-detailed.json');
  fs.writeFileSync(resultsPath, JSON.stringify(testResults, null, 2));
  console.log(`📝 Detailed results saved to: ${resultsPath}\n`);
  
  // Print conclusion
  if (failed === 0) {
    console.log('🎉 All tests passed! All APIs correctly require authentication.\n');
  } else {
    console.log('⚠️  Some tests failed. Please review the results above.\n');
  }
}

// Run tests
runAllTests().catch(console.error);

