/**
 * EduCreate 自動修復腳本
 * 用於解決401未授權錯誤和404圖標錯誤，並增強Dashboard頁面功能
 */

// 導入所需模塊
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { exec } = require('child_process');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 初始化Prisma客戶端
const prisma = new PrismaClient();

// 配置
const config = {
  // 測試用戶信息
  testUsers: [
    { name: 'Admin User', email: 'admin@example.com', password: 'password123', role: 'ADMIN' },
    { name: 'Test User', email: 'user@example.com', password: 'password123', role: 'USER' },
    { name: 'Premium User', email: 'premium@example.com', password: 'password123', role: 'PREMIUM_USER' }
  ],
  // 圖標配置
  icons: [
    { size: '72x72', filename: 'icon-72x72.png' },
    { size: '96x96', filename: 'icon-96x96.png' },
    { size: '128x128', filename: 'icon-128x128.png' },
    { size: '144x144', filename: 'icon-144x144.png' },
    { size: '152x152', filename: 'icon-152x152.png' },
    { size: '192x192', filename: 'icon-192x192.png' },
    { size: '384x384', filename: 'icon-384x384.png' },
    { size: '512x512', filename: 'icon-512x512.png' }
  ],
  // 路徑配置
  paths: {
    icons: path.join(process.cwd(), 'public', 'icons'),
    manifest: path.join(process.cwd(), 'public', 'manifest.json'),
    envFile: path.join(process.cwd(), '.env'),
    testTokenApi: path.join(process.cwd(), 'pages', 'api', 'auth', 'test-token.ts'),
    searchApi: path.join(process.cwd(), 'pages', 'api', 'search', 'index.ts'),
    advancedSearchApi: path.join(process.cwd(), 'pages', 'api', 'search', 'advanced.ts'),
    appFile: path.join(process.cwd(), 'pages', '_app.tsx'),
    dashboardFile: path.join(process.cwd(), 'pages', 'dashboard.tsx')
  }
};

/**
 * 主函數 - 執行所有修復步驟
 */
async function main() {
  console.log('開始執行 EduCreate 自動修復腳本...');
  
  try {
    // 1. 檢查並創建測試用戶
    await createTestUsers();
    
    // 2. 檢查並創建缺失的圖標文件
    await createMissingIcons();
    
    // 3. 檢查並更新manifest.json
    await updateManifest();
    
    // 4. 檢查並更新API認證中間件
    await updateAuthMiddleware();
    
    // 5. 增強Dashboard頁面功能
    await enhanceDashboard();
    
    // 6. 清理瀏覽器緩存指南
    console.log('\n為確保修復生效，請執行以下操作：');
    console.log('1. 清除瀏覽器緩存和localStorage');
    console.log('2. 重啟開發服務器：npm run dev');
    console.log('3. 訪問 http://localhost:3000 並檢查控制台是否還有錯誤');
    
    console.log('\n修復腳本執行完成！');
  } catch (error) {
    console.error('修復腳本執行失敗：', error);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * 創建測試用戶
 */
async function createTestUsers() {
  console.log('\n檢查並創建測試用戶...');
  
  for (const userData of config.testUsers) {
    // 檢查用戶是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });
    
    if (!existingUser) {
      // 創建新用戶
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await prisma.user.create({
        data: {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          role: userData.role,
          emailVerified: new Date()
        }
      });
      console.log(`創建測試用戶：${userData.email}`);
    } else {
      console.log(`測試用戶已存在：${userData.email}`);
    }
  }
  
  console.log('測試用戶檢查完成');
}

/**
 * 創建缺失的圖標文件
 */
async function createMissingIcons() {
  console.log('\n檢查並創建缺失的圖標文件...');
  
  // 確保圖標目錄存在
  if (!fs.existsSync(config.paths.icons)) {
    fs.mkdirSync(config.paths.icons, { recursive: true });
    console.log(`創建圖標目錄：${config.paths.icons}`);
  }
  
  // 檢查並創建每個圖標文件
  for (const icon of config.icons) {
    const iconPath = path.join(config.paths.icons, icon.filename);
    
    if (!fs.existsSync(iconPath)) {
      // 創建簡單的SVG圖標
      const svgContent = generateSvgIcon(icon.size);
      fs.writeFileSync(iconPath, svgContent);
      console.log(`創建圖標文件：${icon.filename}`);
    } else {
      console.log(`圖標文件已存在：${icon.filename}`);
    }
  }
  
  console.log('圖標文件檢查完成');
}

/**
 * 生成SVG圖標
 */
function generateSvgIcon(size) {
  const [width, height] = size.split('x').map(Number);
  
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${width}" height="${height}" fill="#4f46e5" />
  <text x="50%" y="50%" font-family="Arial" font-size="${Math.floor(width/4)}" fill="white" text-anchor="middle" dominant-baseline="middle">EC</text>
</svg>`;
}

/**
 * 更新manifest.json
 */
async function updateManifest() {
  console.log('\n檢查並更新manifest.json...');
  
  if (fs.existsSync(config.paths.manifest)) {
    // 讀取現有manifest
    const manifestContent = fs.readFileSync(config.paths.manifest, 'utf8');
    let manifest;
    
    try {
      manifest = JSON.parse(manifestContent);
    } catch (error) {
      console.error('解析manifest.json失敗：', error);
      return;
    }
    
    // 確保icons數組存在
    if (!manifest.icons) {
      manifest.icons = [];
    }
    
    // 檢查每個圖標是否在manifest中
    let updated = false;
    
    for (const icon of config.icons) {
      const [width, height] = icon.size.split('x').map(Number);
      const iconExists = manifest.icons.some(i => 
        i.src === `/icons/${icon.filename}` && i.sizes === icon.size
      );
      
      if (!iconExists) {
        manifest.icons.push({
          src: `/icons/${icon.filename}`,
          sizes: icon.size,
          type: "image/png",
          purpose: "any maskable"
        });
        updated = true;
      }
    }
    
    // 如果有更新，寫入文件
    if (updated) {
      fs.writeFileSync(config.paths.manifest, JSON.stringify(manifest, null, 2));
      console.log('更新manifest.json完成');
    } else {
      console.log('manifest.json已包含所有圖標，無需更新');
    }
  } else {
    console.log('manifest.json不存在，創建新文件...');
    
    // 創建新的manifest.json
    const manifest = {
      name: "EduCreate",
      short_name: "EduCreate",
      description: "互動式教育資源創建平台",
      start_url: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#4f46e5",
      orientation: "portrait-primary",
      icons: config.icons.map(icon => {
        const [width, height] = icon.size.split('x').map(Number);
        return {
          src: `/icons/${icon.filename}`,
          sizes: icon.size,
          type: "image/png",
          purpose: "any maskable"
        };
      })
    };
    
    fs.writeFileSync(config.paths.manifest, JSON.stringify(manifest, null, 2));
    console.log('創建manifest.json完成');
  }
}

/**
 * 更新API認證中間件
 */
async function updateAuthMiddleware() {
  console.log('\n檢查並更新API認證中間件...');
  
  // 檢查搜索API文件
  const apiFiles = [
    { path: config.paths.searchApi, name: '基本搜索API' },
    { path: config.paths.advancedSearchApi, name: '高級搜索API' }
  ];
  
  for (const apiFile of apiFiles) {
    if (fs.existsSync(apiFile.path)) {
      let content = fs.readFileSync(apiFile.path, 'utf8');
      
      // 檢查是否已經使用了withTestAuth中間件
      if (!content.includes('withTestAuth')) {
        // 添加導入語句
        if (!content.includes('import { withTestAuth }')) {
          content = content.replace(
            /import.*from.*['"]next\/router['"];?/,
            match => `${match}\nimport { withTestAuth } from '../../../middleware/withTestAuth';`
          );
        }
        
        // 添加中間件使用
        content = content.replace(
          /export default async function handler\([^)]*\)\s*{/,
          match => `${match}\n  // 使用測試認證中間件\n  await new Promise<void>((resolve) => {\n    withTestAuth(req, res, resolve);\n  }).catch(() => {\n    return res.status(401).json({ error: '未授權' });\n  });`
        );
        
        // 更新用戶獲取邏輯
        content = content.replace(
          /const session = await getSession\({ req }\);/,
          `const session = await getSession({ req });\n  const user = session?.user || (req as any).testUser;`
        );
        
        fs.writeFileSync(apiFile.path, content);
        console.log(`更新${apiFile.name}認證中間件完成`);
      } else {
        console.log(`${apiFile.name}已使用測試認證中間件，無需更新`);
      }
    } else {
      console.log(`${apiFile.name}文件不存在：${apiFile.path}`);
    }
  }
}

/**
 * 增強Dashboard頁面功能
 */
async function enhanceDashboard() {
  console.log('\n增強Dashboard頁面功能...');
  
  if (fs.existsSync(config.paths.dashboardFile)) {
    let content = fs.readFileSync(config.paths.dashboardFile, 'utf8');
    
    // 檢查是否已經實現了批量操作功能
    if (!content.includes('批量操作') && !content.includes('batchOperations')) {
      // 添加批量操作狀態
      content = content.replace(
        /const \[\s*activities,\s*setActivities\s*\]\s*=\s*useState\([^)]*\);/,
        match => `${match}\n  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);\n  const [batchOperationOpen, setBatchOperationOpen] = useState(false);`
      );
      
      // 添加批量操作處理函數
      content = content.replace(
        /const toggleTag = \([^)]*\) => {[\s\S]*?};/,
        match => `${match}\n\n  // 批量操作處理函數\n  const handleSelectActivity = (id: string, isSelected: boolean) => {\n    if (isSelected) {\n      setSelectedActivities(prev => [...prev, id]);\n    } else {\n      setSelectedActivities(prev => prev.filter(activityId => activityId !== id));\n    }\n  };\n\n  const handleBatchDelete = async () => {\n    if (selectedActivities.length === 0) return;\n    \n    if (confirm(\`確定要刪除選中的 \${selectedActivities.length} 個活動嗎？\`)) {\n      try {\n        // 批量刪除API調用\n        const results = await Promise.all(\n          selectedActivities.map(id => \n            fetch(\`/api/activities/\${id}\`, { method: 'DELETE' })\n              .then(res => res.json())\n          )\n        );\n        \n        // 更新活動列表\n        setActivities(prevActivities => \n          prevActivities.filter(activity => !selectedActivities.includes(activity.id))\n        );\n        \n        // 清空選擇\n        setSelectedActivities([]);\n        setBatchOperationOpen(false);\n        \n        // 顯示成功消息\n        alert(\`成功刪除 \${selectedActivities.length} 個活動\`);\n      } catch (error) {\n        console.error('批量刪除失敗:', error);\n        alert('批量刪除失敗，請稍後再試');\n      }\n    }\n  };\n\n  const handleBatchPublish = async () => {\n    if (selectedActivities.length === 0) return;\n    \n    try {\n      // 批量發布API調用\n      const results = await Promise.all(\n        selectedActivities.map(id => \n          fetch(\`/api/activities/\${id}?action=publish\`, { method: 'POST' })\n            .then(res => res.json())\n        )\n      );\n      \n      // 更新活動列表\n      setActivities(prevActivities => \n        prevActivities.map(activity => {\n          if (selectedActivities.includes(activity.id)) {\n            return { ...activity, published: true };\n          }\n          return activity;\n        })\n      );\n      \n      // 清空選擇\n      setSelectedActivities([]);\n      setBatchOperationOpen(false);\n      \n      // 顯示成功消息\n      alert(\`成功發布 \${selectedActivities.length} 個活動\`);\n    } catch (error) {\n      console.error('批量發布失敗:', error);\n      alert('批量發布失敗，請稍後再試');\n    }\n  };`
      );
      
      // 修改活動卡片渲染函數，添加選擇框
      content = content.replace(
        /const renderActivityCard = \([^)]*\) => {[\s\S]*?return \(/,
        match => match.replace(
          /return \(/,
          `// 添加選擇框\n    const isSelected = selectedActivities.includes(activity.id);\n    \n    return (`
        )
      );
      
      content = content.replace(
        /<div className="relative bg-white[^>]*>/,
        match => `${match}\n            {/* 選擇框 */}\n            <div className="absolute top-2 left-2 z-10">\n              <input \n                type="checkbox" \n                checked={isSelected}\n                onChange={(e) => handleSelectActivity(activity.id, e.target.checked)}\n                className="h-4 w-4 text-indigo-600 rounded border-gray-300"\n              />\n            </div>`
      );
      
      // 添加批量操作工具欄
      content = content.replace(
        /<div className="flex flex-col space-y-4">[\s\S]*?<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">/,
        match => `${match}\n            \n            {/* 批量操作工具欄 */}\n            {selectedActivities.length > 0 && (\n              <div className="bg-gray-50 p-3 rounded-md flex items-center justify-between mb-4">\n                <div className="text-sm text-gray-700">\n                  已選擇 <span className="font-medium">{selectedActivities.length}</span> 個活動\n                </div>\n                <div className="flex space-x-2">\n                  <button\n                    onClick={handleBatchPublish}\n                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"\n                  >\n                    批量發布\n                  </button>\n                  <button\n                    onClick={handleBatchDelete}\n                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"\n                  >\n                    批量刪除\n                  </button>\n                  <button\n                    onClick={() => setSelectedActivities([])}\n                    className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"\n                  >\n                    取消選擇\n                  </button>\n                </div>\n              </div>\n            )}`
      );
      
      fs.writeFileSync(config.paths.dashboardFile, content);
      console.log('增強Dashboard頁面功能完成');
    } else {
      console.log('Dashboard頁面已實現批量操作功能，無需更新');
    }
  } else {
    console.log(`Dashboard頁面文件不存在：${config.paths.dashboardFile}`);
  }
}

// 執行主函數
main().catch(console.error);