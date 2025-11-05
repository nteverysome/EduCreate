#!/usr/bin/env node

/**
 * 检查后端 API 连接状态
 */

const http = require('http');

const tests = [
  {
    name: '活动 API',
    url: 'http://localhost:3000/api/activities',
    method: 'GET'
  },
  {
    name: '视觉风格资源 API',
    url: 'http://localhost:3000/api/visual-styles/resources?styleId=clouds',
    method: 'GET'
  },
  {
    name: '用户 API',
    url: 'http://localhost:3000/api/user/profile',
    method: 'GET'
  }
];

async function testAPI(test) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    
    const req = http.get(test.url, (res) => {
      const duration = Date.now() - startTime;
      let data = '';
      
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          name: test.name,
          status: res.statusCode,
          duration,
          success: res.statusCode >= 200 && res.statusCode < 300,
          error: null,
          data: data.substring(0, 200)
        });
      });
    });
    
    req.on('error', (error) => {
      const duration = Date.now() - startTime;
      resolve({
        name: test.name,
        status: null,
        duration,
        success: false,
        error: error.message,
        data: null
      });
    });
    
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({
        name: test.name,
        status: null,
        duration: 5000,
        success: false,
        error: '请求超时',
        data: null
      });
    });
  });
}

async function main() {
  console.log('🔍 检查后端 API 连接状态...\n');
  
  for (const test of tests) {
    const result = await testAPI(test);
    
    if (result.success) {
      console.log(`✅ ${result.name}`);
      console.log(`   状态码: ${result.status}`);
      console.log(`   响应时间: ${result.duration}ms`);
    } else {
      console.log(`❌ ${result.name}`);
      console.log(`   错误: ${result.error || `状态码 ${result.status}`}`);
      console.log(`   响应时间: ${result.duration}ms`);
    }
    console.log();
  }
}

main().catch(console.error);

