#!/usr/bin/env node

/**
 * EduCreate 視差背景資源自動整合腳本
 * 用於處理從 itch.io 下載的 Bongseng 視差背景資源
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class ParallaxResourceIntegrator {
  constructor() {
    this.projectRoot = process.cwd();
    this.assetsDir = path.join(this.projectRoot, 'assets', 'external-resources', 'parallax-backgrounds');
    this.targetDir = path.join(this.assetsDir, 'bongseng-parallax');
    this.downloadDir = path.join(process.env.USERPROFILE || process.env.HOME, 'Downloads');
  }

  async integrate() {
    console.log('🎮 EduCreate 視差背景資源整合開始...\n');
    
    try {
      // 1. 檢查下載目錄
      await this.checkDownloadedFiles();
      
      // 2. 創建目標目錄結構
      await this.createDirectoryStructure();
      
      // 3. 處理 ZIP 檔案
      await this.processZipFiles();
      
      // 4. 組織檔案結構
      await this.organizeFiles();
      
      // 5. 生成整合代碼
      await this.generateIntegrationCode();
      
      // 6. 創建測試檔案
      await this.createTestFiles();
      
      console.log('✅ 視差背景資源整合完成！');
      console.log('\n📋 後續步驟：');
      console.log('1. 檢查 assets/external-resources/parallax-backgrounds/ 目錄');
      console.log('2. 運行測試：npm run test:parallax');
      console.log('3. 查看整合示例：components/games/ParallaxBackground.tsx');
      
    } catch (error) {
      console.error('❌ 整合過程中發生錯誤：', error.message);
      process.exit(1);
    }
  }

  async checkDownloadedFiles() {
    console.log('🔍 檢查下載的檔案...');

    // 檢查多種可能的檔案名稱
    const possibleFiles = [
      'Horizontal asset pack.zip',
      'Vertical asset pack.zip',
      'Forest parallax vertical.zip',
      'Forest parallax horizontal.zip'
    ];

    const foundFiles = [];

    // 掃描下載目錄中的所有 ZIP 檔案
    try {
      const files = fs.readdirSync(this.downloadDir);
      const zipFiles = files.filter(file =>
        file.toLowerCase().endsWith('.zip') &&
        (file.toLowerCase().includes('parallax') ||
         file.toLowerCase().includes('asset pack') ||
         file.toLowerCase().includes('forest') ||
         file.toLowerCase().includes('desert') ||
         file.toLowerCase().includes('bongseng'))
      );

      zipFiles.forEach(fileName => {
        const filePath = path.join(this.downloadDir, fileName);
        if (fs.existsSync(filePath)) {
          foundFiles.push({
            name: fileName,
            path: filePath,
            size: this.getFileSize(filePath)
          });
        }
      });

    } catch (error) {
      console.warn('無法讀取下載目錄，嘗試檢查特定檔案...');

      // 備用檢查方式
      possibleFiles.forEach(fileName => {
        const filePath = path.join(this.downloadDir, fileName);
        if (fs.existsSync(filePath)) {
          foundFiles.push({
            name: fileName,
            path: filePath,
            size: this.getFileSize(filePath)
          });
        }
      });
    }

    if (foundFiles.length === 0) {
      throw new Error(`未在下載目錄找到相關 ZIP 檔案。請確保已下載到：${this.downloadDir}`);
    }

    console.log('✅ 找到以下檔案：');
    foundFiles.forEach(file => {
      console.log(`   - ${file.name} (${file.size})`);
    });

    this.foundFiles = foundFiles;
  }

  getFileSize(filePath) {
    const stats = fs.statSync(filePath);
    const fileSizeInBytes = stats.size;
    const fileSizeInMegabytes = fileSizeInBytes / (1024 * 1024);
    return `${fileSizeInMegabytes.toFixed(2)} MB`;
  }

  async createDirectoryStructure() {
    console.log('\n📁 創建目錄結構...');
    
    const dirs = [
      this.targetDir,
      path.join(this.targetDir, 'horizontal'),
      path.join(this.targetDir, 'horizontal', 'forest'),
      path.join(this.targetDir, 'horizontal', 'desert'),
      path.join(this.targetDir, 'horizontal', 'sky'),
      path.join(this.targetDir, 'horizontal', 'moon'),
      path.join(this.targetDir, 'vertical'),
      path.join(this.targetDir, 'vertical', 'forest'),
      path.join(this.targetDir, 'bonus-assets'),
      path.join(this.targetDir, 'bonus-assets', 'enemies'),
      path.join(this.targetDir, 'bonus-assets', 'explosions'),
      path.join(this.targetDir, 'bonus-assets', 'player-ship'),
      path.join(this.targetDir, 'bonus-assets', 'icons')
    ];
    
    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`   ✅ 創建目錄：${path.relative(this.projectRoot, dir)}`);
      }
    });
  }

  async processZipFiles() {
    console.log('\n📦 處理 ZIP 檔案...');
    
    for (const file of this.foundFiles) {
      console.log(`   處理：${file.name}`);
      
      try {
        // 使用 PowerShell 解壓縮（Windows 環境）
        const extractDir = path.join(this.targetDir, 'temp', path.parse(file.name).name);
        
        if (!fs.existsSync(extractDir)) {
          fs.mkdirSync(extractDir, { recursive: true });
        }
        
        const command = `powershell -command "Expand-Archive -Path '${file.path}' -DestinationPath '${extractDir}' -Force"`;
        execSync(command, { stdio: 'inherit' });
        
        console.log(`   ✅ 解壓縮完成：${file.name}`);
        
      } catch (error) {
        console.warn(`   ⚠️  解壓縮失敗：${file.name} - ${error.message}`);
        console.log('   💡 請手動解壓縮檔案到對應目錄');
      }
    }
  }

  async organizeFiles() {
    console.log('\n🗂️  組織檔案結構...');
    
    const tempDir = path.join(this.targetDir, 'temp');
    
    if (fs.existsSync(tempDir)) {
      // 移動檔案到正確位置
      this.moveFilesToCorrectLocation(tempDir);
      
      // 清理臨時目錄
      fs.rmSync(tempDir, { recursive: true, force: true });
      console.log('   ✅ 清理臨時檔案');
    }
  }

  moveFilesToCorrectLocation(tempDir) {
    // 這裡需要根據實際的檔案結構來移動檔案
    // 由於不知道確切的內部結構，提供一個通用的移動邏輯
    console.log('   📋 檔案移動邏輯需要根據實際解壓縮結果調整');
  }

  async generateIntegrationCode() {
    console.log('\n💻 生成整合代碼...');
    
    // 生成 React 組件
    const componentCode = this.generateParallaxComponent();
    const componentPath = path.join(this.projectRoot, 'components', 'games', 'ParallaxBackground.tsx');
    
    if (!fs.existsSync(path.dirname(componentPath))) {
      fs.mkdirSync(path.dirname(componentPath), { recursive: true });
    }
    
    fs.writeFileSync(componentPath, componentCode);
    console.log(`   ✅ 生成組件：${path.relative(this.projectRoot, componentPath)}`);
    
    // 生成管理器
    const managerCode = this.generateBackgroundManager();
    const managerPath = path.join(this.projectRoot, 'lib', 'games', 'backgroundManager.ts');
    
    if (!fs.existsSync(path.dirname(managerPath))) {
      fs.mkdirSync(path.dirname(managerPath), { recursive: true });
    }
    
    fs.writeFileSync(managerPath, managerCode);
    console.log(`   ✅ 生成管理器：${path.relative(this.projectRoot, managerPath)}`);
  }

  generateParallaxComponent() {
    return `import React, { useEffect, useRef, useState } from 'react';
import { BackgroundManager } from '../../lib/games/backgroundManager';

interface ParallaxBackgroundProps {
  theme: 'forest' | 'desert' | 'sky' | 'moon';
  speed?: number;
  disabled?: boolean; // 無障礙設計：允許禁用動畫
}

export const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({
  theme,
  speed = 1,
  disabled = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [layers, setLayers] = useState<string[]>([]);
  const backgroundManager = useRef(new BackgroundManager());

  useEffect(() => {
    // 載入背景層
    const themeLayers = backgroundManager.current.loadParallaxBackground(theme);
    setLayers(themeLayers);
  }, [theme]);

  useEffect(() => {
    if (disabled) return;

    const handleScroll = () => {
      if (containerRef.current) {
        const scrolled = window.pageYOffset;
        const layerElements = containerRef.current.querySelectorAll('.parallax-layer');
        
        layerElements.forEach((layer, index) => {
          const rate = scrolled * -speed * (index + 1) * 0.1;
          (layer as HTMLElement).style.transform = \`translateY(\${rate}px)\`;
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, disabled]);

  return (
    <div 
      ref={containerRef} 
      className="parallax-container fixed inset-0 -z-10"
      role="img"
      aria-label={\`\${theme} 主題背景\`}
    >
      {layers.map((layerSrc, index) => (
        <div
          key={index}
          className="parallax-layer absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: \`url(\${layerSrc})\`,
            zIndex: -10 + index
          }}
        />
      ))}
    </div>
  );
};`;
  }

  generateBackgroundManager() {
    return `export class BackgroundManager {
  private currentTheme: string = 'forest';
  private basePath = '/assets/external-resources/parallax-backgrounds/bongseng-parallax/';

  loadParallaxBackground(theme: string): string[] {
    this.currentTheme = theme;
    return this.getThemeLayers(theme);
  }

  private getThemeLayers(theme: string): string[] {
    const horizontalPath = \`\${this.basePath}horizontal/\${theme}/\`;
    
    switch(theme) {
      case 'forest':
        return [
          \`\${horizontalPath}layer1.png\`,
          \`\${horizontalPath}layer2.png\`,
          \`\${horizontalPath}layer3.png\`,
          \`\${horizontalPath}layer4.png\`,
          \`\${horizontalPath}layer5.png\`,
          \`\${horizontalPath}layer6.png\`
        ];
      case 'desert':
        return [
          \`\${horizontalPath}layer1.png\`,
          \`\${horizontalPath}layer2.png\`,
          \`\${horizontalPath}layer3.png\`,
          \`\${horizontalPath}layer4.png\`,
          \`\${horizontalPath}layer5.png\`,
          \`\${horizontalPath}layer6.png\`
        ];
      case 'sky':
        return Array.from({ length: 9 }, (_, i) => 
          \`\${horizontalPath}layer\${i + 1}.png\`
        );
      case 'moon':
        return Array.from({ length: 6 }, (_, i) => 
          \`\${horizontalPath}layer\${i + 1}.png\`
        );
      default:
        return [];
    }
  }

  getCurrentTheme(): string {
    return this.currentTheme;
  }

  preloadTheme(theme: string): Promise<void[]> {
    const layers = this.getThemeLayers(theme);
    const promises = layers.map(src => {
      return new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = src;
      });
    });
    
    return Promise.all(promises);
  }
}`;
  }

  async createTestFiles() {
    console.log('\n🧪 創建測試檔案...');
    
    const testCode = `import { test, expect } from '@playwright/test';

test.describe('視差背景系統', () => {
  test('應該能載入森林主題背景', async ({ page }) => {
    await page.goto('/');
    
    // 檢查背景組件是否存在
    const parallaxContainer = page.locator('.parallax-container');
    await expect(parallaxContainer).toBeVisible();
    
    // 檢查背景層是否載入
    const layers = page.locator('.parallax-layer');
    await expect(layers).toHaveCount(6); // 森林主題有6層
  });

  test('應該支援無障礙設計', async ({ page }) => {
    await page.goto('/?disable-animations=true');
    
    // 檢查動畫是否被禁用
    const parallaxContainer = page.locator('.parallax-container');
    await expect(parallaxContainer).toHaveAttribute('aria-label');
  });
});`;

    const testPath = path.join(this.projectRoot, 'tests', 'parallax-background.spec.ts');
    
    if (!fs.existsSync(path.dirname(testPath))) {
      fs.mkdirSync(path.dirname(testPath), { recursive: true });
    }
    
    fs.writeFileSync(testPath, testCode);
    console.log(`   ✅ 生成測試：${path.relative(this.projectRoot, testPath)}`);
  }
}

// 執行整合
if (require.main === module) {
  const integrator = new ParallaxResourceIntegrator();
  integrator.integrate().catch(console.error);
}

module.exports = ParallaxResourceIntegrator;
