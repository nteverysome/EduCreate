/**
 * EduCreate 認證錯誤修復腳本
 * 用於自動檢測和修復401未授權錯誤和404圖標錯誤
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// 配置
const config = {
  // 路徑配置
  paths: {
    icons: path.join(process.cwd(), 'public', 'icons'),
    manifest: path.join(process.cwd(), 'public', 'manifest.json'),
    envFile: path.join(process.cwd(), '.env'),
    testTokenApi: path.join(process.cwd(), 'pages', 'api', 'auth', 'test-token.ts'),
    searchApi: path.join(process.cwd(), 'pages', 'api', 'search', 'index.ts'),
    advancedSearchApi: path.join(process.cwd(), 'pages', 'api', 'search', 'advanced.ts'),
    appFile: path.join(process.cwd(), 'pages', '_app.tsx'),
    withTestAuthFile: path.join(process.cwd(), 'middleware', 'withTestAuth.ts')
  },
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
  ]
};

/**
 * 主函數 - 執行所有修復步驟
 */
async function main() {
  console.log('開始執行 EduCreate 認證錯誤修復腳本...');
  
  try {
    // 1. 檢查並創建缺失的圖標文件
    await fixIconErrors();
    
    // 2. 檢查並更新manifest.json
    await updateManifest();
    
    // 3. 檢查並修復認證中間件
    await fixAuthMiddleware();
    
    // 4. 檢查並修復API認證
    await fixApiAuth();
    
    // 5. 檢查並運行Prisma遷移和種子
    await runPrismaMigrations();
    
    console.log('\n修復腳本執行完成！');
    console.log('\n為確保修復生效，請執行以下操作：');
    console.log('1. 清除瀏覽器緩存和localStorage');
    console.log('2. 重啟開發服務器：npm run dev');
    console.log('3. 訪問 http://localhost:3000 並檢查控制台是否還有錯誤');
  } catch (error) {
    console.error('修復腳本執行失敗：', error);
  }
}

/**
 * 修復圖標404錯誤
 */
async function fixIconErrors() {
  console.log('\n檢查並修復圖標404錯誤...');
  
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
 * 修復認證中間件
 */
async function fixAuthMiddleware() {
  console.log('\n檢查並修復認證中間件...');
  
  // 檢查withTestAuth中間件是否存在
  if (!fs.existsSync(config.paths.withTestAuthFile)) {
    console.log('創建withTestAuth中間件...');
    
    const withTestAuthContent = `import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import jwt from 'jsonwebtoken';

/**
 * 測試認證中間件
 * 用於開發環境中繞過正常的認證流程，允許使用測試令牌進行API訪問
 */
export const withTestAuth = async (
  req: NextApiRequest,
  res: NextApiResponse,
  next: () => void
) => {
  try {
    // 首先嘗試獲取正常的會話
    const session = await getSession({ req });
    
    if (session) {
      // 如果存在有效會話，繼續處理請求
      return next();
    }
    
    // 在開發環境中，檢查測試令牌
    if (process.env.NODE_ENV === 'development') {
      const authHeader = req.headers.authorization;
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        const secret = process.env.NEXTAUTH_SECRET || 'development-secret-key';
        
        try {
          // 驗證令牌
          const decoded = jwt.verify(token, secret);
          
          // 將解碼的用戶信息添加到請求對象中
          (req as any).testUser = decoded;
          
          return next();
        } catch (error) {
          console.error('測試令牌驗證失敗:', error);
        }
      }
    }
    
    // 如果沒有有效的會話或測試令牌，返回401未授權
    return res.status(401).json({ error: '未授權訪問' });
  } catch (error) {
    console.error('認證中間件錯誤:', error);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
};
`;
    
    // 確保目錄存在
    const middlewareDir = path.dirname(config.paths.withTestAuthFile);
    if (!fs.existsSync(middlewareDir)) {
      fs.mkdirSync(middlewareDir, { recursive: true });
    }
    
    fs.writeFileSync(config.paths.withTestAuthFile, withTestAuthContent);
    console.log('創建withTestAuth中間件完成');
  } else {
    console.log('withTestAuth中間件已存在，無需創建');
  }
  
  // 檢查測試令牌API是否存在
  if (!fs.existsSync(config.paths.testTokenApi)) {
    console.log('創建測試令牌API...');
    
    const testTokenApiContent = `import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

/**
 * 測試令牌API
 * 僅在開發環境中可用，用於生成測試用戶的認證令牌
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 僅在開發環境中可用
  if (process.env.NODE_ENV !== 'development') {
    return res.status(404).json({ error: '在生產環境中不可用' });
  }
  
  try {
    // 獲取測試用戶
    const email = req.query.email as string || 'admin@example.com';
    
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(404).json({ 
        error: '測試用戶不存在，請先運行 npx prisma db seed 創建測試用戶' 
      });
    }
    
    // 生成JWT令牌
    const secret = process.env.NEXTAUTH_SECRET || 'development-secret-key';
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        name: user.name,
        role: user.role
      }, 
      secret, 
      { expiresIn: '1d' }
    );
    
    return res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('生成測試令牌失敗:', error);
    return res.status(500).json({ error: '伺服器錯誤' });
  }
}
`;
    
    // 確保目錄存在
    const apiDir = path.dirname(config.paths.testTokenApi);
    if (!fs.existsSync(apiDir)) {
      fs.mkdirSync(apiDir, { recursive: true });
    }
    
    fs.writeFileSync(config.paths.testTokenApi, testTokenApiContent);
    console.log('創建測試令牌API完成');
  } else {
    console.log('測試令牌API已存在，無需創建');
  }
}

/**
 * 修復API認證
 */
async function fixApiAuth() {
  console.log('\n檢查並修復API認證...');
  
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
  
  // 檢查_app.tsx文件，添加測試令牌獲取邏輯
  if (fs.existsSync(config.paths.appFile)) {
    let appContent = fs.readFileSync(config.paths.appFile, 'utf8');
    
    if (!appContent.includes('eduCreateTestToken')) {
      // 添加測試令牌獲取邏輯
      appContent = appContent.replace(
        /useEffect\(\s*\(\)\s*=>\s*{[\s\S]*?},[\s\S]*?\);/,
        match => `useEffect(() => {\n    // 在開發環境中獲取測試令牌\n    const fetchTestToken = async () => {\n      if (process.env.NODE_ENV === 'development') {\n        try {\n          const response = await fetch('/api/auth/test-token');\n          if (response.ok) {\n            const data = await response.json();\n            localStorage.setItem('eduCreateTestToken', data.token);\n            console.log('已獲取測試令牌');\n          }\n        } catch (error) {\n          console.error('獲取測試令牌失敗:', error);\n        }\n      }\n    };\n\n    fetchTestToken();\n    \n    ${match}`
      );
      
      fs.writeFileSync(config.paths.appFile, appContent);
      console.log('更新_app.tsx添加測試令牌獲取邏輯完成');
    } else {
      console.log('_app.tsx已包含測試令牌獲取邏輯，無需更新');
    }
  } else {
    console.log(`_app.tsx文件不存在：${config.paths.appFile}`);
  }
}

/**
 * 運行Prisma遷移和種子
 */
async function runPrismaMigrations() {
  console.log('\n檢查並運行Prisma遷移和種子...');
  
  try {
    // 檢查是否安裝了ts-node
    try {
      execSync('npx ts-node -v', { stdio: 'ignore' });
    } catch (error) {
      console.log('安裝ts-node...');
      execSync('npm install -D ts-node', { stdio: 'inherit' });
    }
    
    // 運行Prisma遷移
    console.log('運行Prisma遷移...');
    execSync('npx prisma migrate dev --name add-test-users', { stdio: 'inherit' });
    
    // 運行Prisma種子
    console.log('運行Prisma種子...');
    execSync('npx prisma db seed', { stdio: 'inherit' });
    
    console.log('Prisma遷移和種子運行完成');
  } catch (error) {
    console.error('運行Prisma遷移和種子失敗:', error);
    console.log('請手動運行以下命令:');
    console.log('1. npm install -D ts-node');
    console.log('2. npx prisma migrate dev --name add-test-users');
    console.log('3. npx prisma db seed');
  }
}

// 執行主函數
main().catch(console.error);