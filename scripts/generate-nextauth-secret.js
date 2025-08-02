#!/usr/bin/env node

/**
 * 生成 NextAuth 密鑰
 */

const crypto = require('crypto');

console.log('🔐 生成 NextAuth 密鑰...\n');

// 生成 32 字節的隨機密鑰並轉換為 base64
const secret = crypto.randomBytes(32).toString('base64');

console.log('✅ 新的 NEXTAUTH_SECRET:');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(secret);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

console.log('\n📋 使用方法:');
console.log('1. 複製上面的密鑰');
console.log('2. 進入 Vercel Dashboard → Settings → Environment Variables');
console.log('3. 添加新變數:');
console.log('   Name: NEXTAUTH_SECRET');
console.log('   Value: (貼上上面的密鑰)');
console.log('   Environment: Production, Preview, Development (全選)');
console.log('4. 保存並重新部署專案');

console.log('\n🔍 密鑰資訊:');
console.log(`   長度: ${secret.length} 字符`);
console.log(`   字節數: 32 bytes`);
console.log(`   編碼: Base64`);
console.log(`   安全性: 高 (256-bit 隨機)`);

console.log('\n⚠️  重要提醒:');
console.log('   - 請妥善保管此密鑰');
console.log('   - 不要在公開場所分享');
console.log('   - 每個專案使用不同的密鑰');
console.log('   - 如果洩露，請立即重新生成');