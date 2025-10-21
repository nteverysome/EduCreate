/**
 * 本地測試圖片組件腳本
 * 
 * 測試以下組件：
 * 1. ImagePicker - 圖片選擇器
 * 2. ImageEditor - 圖片編輯器
 * 3. ImageGallery - 圖片管理
 * 4. ContentItemWithImage - 內容編輯器
 * 5. VersionHistory - 版本歷史
 */

import fs from 'fs';
import path from 'path';

interface TestResult {
  component: string;
  status: 'pass' | 'fail' | 'skip';
  message: string;
  details?: any;
}

const results: TestResult[] = [];

// Helper function to check if file exists
function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

// Helper function to read file content
function readFile(filePath: string): string {
  return fs.readFileSync(filePath, 'utf-8');
}

// Helper function to check if component has required exports
function checkComponentExports(filePath: string, requiredExports: string[]): boolean {
  const content = readFile(filePath);
  return requiredExports.every(exp => content.includes(exp));
}

// Test 1: ImagePicker Component
function testImagePicker(): TestResult {
  console.log('\n=== Test 1: ImagePicker Component ===');
  
  const componentPath = path.join(process.cwd(), 'components/image-picker/index.tsx');
  
  if (!fileExists(componentPath)) {
    return {
      component: 'ImagePicker',
      status: 'fail',
      message: '組件文件不存在',
    };
  }
  
  const content = readFile(componentPath);
  
  // Check required features
  const requiredFeatures = [
    'SearchTab',
    'UploadTab',
    'LibraryTab',
    'UserImage',
    'ImagePickerProps',
    'onSelect',
    'onClose',
  ];
  
  const missingFeatures = requiredFeatures.filter(feature => !content.includes(feature));
  
  if (missingFeatures.length > 0) {
    return {
      component: 'ImagePicker',
      status: 'fail',
      message: `缺少必要功能: ${missingFeatures.join(', ')}`,
    };
  }
  
  // Check sub-components
  const subComponents = [
    'components/image-picker/SearchTab.tsx',
    'components/image-picker/UploadTab.tsx',
    'components/image-picker/LibraryTab.tsx',
  ];
  
  const missingSubComponents = subComponents.filter(comp => !fileExists(path.join(process.cwd(), comp)));
  
  if (missingSubComponents.length > 0) {
    return {
      component: 'ImagePicker',
      status: 'fail',
      message: `缺少子組件: ${missingSubComponents.join(', ')}`,
    };
  }
  
  return {
    component: 'ImagePicker',
    status: 'pass',
    message: '組件結構完整，包含所有必要功能',
    details: {
      features: requiredFeatures.length,
      subComponents: subComponents.length,
    },
  };
}

// Test 2: ImageEditor Component
function testImageEditor(): TestResult {
  console.log('\n=== Test 2: ImageEditor Component ===');
  
  const componentPath = path.join(process.cwd(), 'components/image-editor/index.tsx');
  
  if (!fileExists(componentPath)) {
    return {
      component: 'ImageEditor',
      status: 'fail',
      message: '組件文件不存在',
    };
  }
  
  const content = readFile(componentPath);
  
  // Check required features
  const requiredFeatures = [
    'ImageEditorProps',
    'onSave',
    'onClose',
    'image',
    'Cropper',
    'crop',
  ];
  
  const missingFeatures = requiredFeatures.filter(feature => !content.includes(feature));
  
  if (missingFeatures.length > 0) {
    return {
      component: 'ImageEditor',
      status: 'fail',
      message: `缺少必要功能: ${missingFeatures.join(', ')}`,
    };
  }
  
  return {
    component: 'ImageEditor',
    status: 'pass',
    message: '組件結構完整，包含裁剪和編輯功能',
    details: {
      features: requiredFeatures.length,
    },
  };
}

// Test 3: ImageGallery Component
function testImageGallery(): TestResult {
  console.log('\n=== Test 3: ImageGallery Component ===');
  
  const componentPath = path.join(process.cwd(), 'components/image-gallery/index.tsx');
  
  if (!fileExists(componentPath)) {
    return {
      component: 'ImageGallery',
      status: 'fail',
      message: '組件文件不存在',
    };
  }
  
  const content = readFile(componentPath);
  
  // Check required features
  const requiredFeatures = [
    'ImageGalleryProps',
    'onClose',
    'onSelect',
    'fetch',
    '/api/images/list',
  ];
  
  const missingFeatures = requiredFeatures.filter(feature => !content.includes(feature));
  
  if (missingFeatures.length > 0) {
    return {
      component: 'ImageGallery',
      status: 'fail',
      message: `缺少必要功能: ${missingFeatures.join(', ')}`,
    };
  }
  
  return {
    component: 'ImageGallery',
    status: 'pass',
    message: '組件結構完整，包含圖片管理功能',
    details: {
      features: requiredFeatures.length,
    },
  };
}

// Test 4: ContentItemWithImage Component
function testContentItemWithImage(): TestResult {
  console.log('\n=== Test 4: ContentItemWithImage Component ===');
  
  const componentPath = path.join(process.cwd(), 'components/content-item-with-image/index.tsx');
  
  if (!fileExists(componentPath)) {
    return {
      component: 'ContentItemWithImage',
      status: 'fail',
      message: '組件文件不存在',
    };
  }
  
  const content = readFile(componentPath);
  
  // Check required features
  const requiredFeatures = [
    'ContentItemWithImageProps',
    'onChange',
    'onRemove',
    'item',
    'ImagePicker',
  ];
  
  const missingFeatures = requiredFeatures.filter(feature => !content.includes(feature));
  
  if (missingFeatures.length > 0) {
    return {
      component: 'ContentItemWithImage',
      status: 'fail',
      message: `缺少必要功能: ${missingFeatures.join(', ')}`,
    };
  }
  
  return {
    component: 'ContentItemWithImage',
    status: 'pass',
    message: '組件結構完整，包含圖片整合功能',
    details: {
      features: requiredFeatures.length,
    },
  };
}

// Test 5: VersionHistory Component
function testVersionHistory(): TestResult {
  console.log('\n=== Test 5: VersionHistory Component ===');
  
  const componentPath = path.join(process.cwd(), 'components/version-history/index.tsx');
  
  if (!fileExists(componentPath)) {
    return {
      component: 'VersionHistory',
      status: 'fail',
      message: '組件文件不存在',
    };
  }
  
  const content = readFile(componentPath);
  
  // Check required features
  const requiredFeatures = [
    'VersionHistoryProps',
    'imageId',
    'onRestore',
    'fetch',
    '/api/images',
  ];
  
  const missingFeatures = requiredFeatures.filter(feature => !content.includes(feature));
  
  if (missingFeatures.length > 0) {
    return {
      component: 'VersionHistory',
      status: 'fail',
      message: `缺少必要功能: ${missingFeatures.join(', ')}`,
    };
  }
  
  return {
    component: 'VersionHistory',
    status: 'pass',
    message: '組件結構完整，包含版本管理功能',
    details: {
      features: requiredFeatures.length,
    },
  };
}

// Run all tests
async function runTests() {
  console.log('='.repeat(60));
  console.log('圖片組件本地測試');
  console.log('='.repeat(60));
  
  results.push(testImagePicker());
  results.push(testImageEditor());
  results.push(testImageGallery());
  results.push(testContentItemWithImage());
  results.push(testVersionHistory());
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('測試總結');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.status === 'pass').length;
  const failed = results.filter(r => r.status === 'fail').length;
  const skipped = results.filter(r => r.status === 'skip').length;
  const total = results.length;
  
  console.log(`\n總測試數: ${total}`);
  console.log(`✅ 通過: ${passed}`);
  console.log(`❌ 失敗: ${failed}`);
  console.log(`⏭️  跳過: ${skipped}`);
  console.log(`成功率: ${((passed / total) * 100).toFixed(1)}%`);
  
  console.log('\n詳細結果:');
  results.forEach((result, index) => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⏭️';
    console.log(`\n${index + 1}. ${icon} ${result.component}`);
    console.log(`   狀態: ${result.status.toUpperCase()}`);
    console.log(`   訊息: ${result.message}`);
    if (result.details) {
      console.log(`   詳情: ${JSON.stringify(result.details)}`);
    }
  });
  
  // Save results to file
  const reportPath = path.join(process.cwd(), 'docs/image-components-test-results.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    summary: {
      total,
      passed,
      failed,
      skipped,
      successRate: `${((passed / total) * 100).toFixed(1)}%`,
    },
    results,
  }, null, 2));
  
  console.log(`\n測試結果已保存到: ${reportPath}`);
  
  return results;
}

// Run tests
runTests().catch(console.error);

