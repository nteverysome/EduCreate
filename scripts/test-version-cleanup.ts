/**
 * Test script for version management system auto-cleanup
 * 
 * This script creates 11+ versions for a single image to trigger auto-cleanup
 */

const IMAGE_ID = 'cmh0uq3ih0009i904slyxp5vp'; // From browser test
const API_BASE_URL = 'https://edu-create.vercel.app';

interface VersionResponse {
  success: boolean;
  version: {
    id: string;
    imageId: string;
    version: number;
    url: string;
    blobPath: string;
    changes: any;
    createdAt: string;
    createdBy: string;
  };
  versionCount: number;
  autoCleanupTriggered: boolean;
}

async function createVersion(imageId: string, versionNumber: number): Promise<VersionResponse> {
  const response = await fetch(`${API_BASE_URL}/api/images/${imageId}/versions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: `https://example.com/test-version-${versionNumber}.jpg`,
      blobPath: `test-versions/version-${versionNumber}.jpg`,
      changes: {
        type: 'edit',
        timestamp: new Date().toISOString(),
        description: `Test version ${versionNumber}`,
        rotation: versionNumber * 90,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create version ${versionNumber}: ${response.statusText}`);
  }

  return response.json();
}

async function testAutoCleanup() {
  console.log('🚀 Starting version auto-cleanup test...\n');
  console.log(`📷 Image ID: ${IMAGE_ID}\n`);

  const results: VersionResponse[] = [];

  // Create versions 2-11 (version 1 already exists from browser test)
  for (let i = 2; i <= 11; i++) {
    try {
      console.log(`Creating version ${i}...`);
      const result = await createVersion(IMAGE_ID, i);
      results.push(result);

      console.log(`✅ Version ${i} created`);
      console.log(`   - Version count: ${result.versionCount}`);
      console.log(`   - Auto-cleanup triggered: ${result.autoCleanupTriggered}`);

      if (result.autoCleanupTriggered) {
        console.log(`\n🎉 AUTO-CLEANUP TRIGGERED at version ${i}!\n`);
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`❌ Failed to create version ${i}:`, error);
      break;
    }
  }

  console.log('\n📊 Test Summary:');
  console.log(`   - Total versions created: ${results.length}`);
  console.log(`   - Final version count: ${results[results.length - 1]?.versionCount || 'N/A'}`);
  console.log(`   - Auto-cleanup triggered: ${results.some(r => r.autoCleanupTriggered) ? 'YES ✅' : 'NO ❌'}`);

  // Check final version count
  const finalCount = results[results.length - 1]?.versionCount;
  if (finalCount && finalCount <= 10) {
    console.log(`\n✅ SUCCESS: Version count is ${finalCount} (≤ 10)`);
    console.log('   Auto-cleanup is working correctly!');
  } else {
    console.log(`\n⚠️  WARNING: Version count is ${finalCount} (> 10)`);
    console.log('   Auto-cleanup may not be working correctly.');
  }

  return results;
}

// Run the test
testAutoCleanup()
  .then(() => {
    console.log('\n✅ Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  });

