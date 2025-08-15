// scripts/core/TestVideoProcessor.js
const fs = require('fs');
const path = require('path');
const LocalMemoryManager = require('./LocalMemoryManager');
const MCPIntegrationManager = require('./MCPIntegrationManager');
const CompressionManager = require('./CompressionManager');

class TestVideoProcessor {
  constructor() {
    this.memoryManager = new LocalMemoryManager();
    this.mcpManager = new MCPIntegrationManager();
    this.compressionManager = new CompressionManager();
    
    this.ensureDirectories();
  }

  // 確保必要的目錄存在
  ensureDirectories() {
    const directories = [
      'EduCreate-Test-Videos/current/success/games',
      'EduCreate-Test-Videos/current/success/content',
      'EduCreate-Test-Videos/current/success/file-space',
      'EduCreate-Test-Videos/current/success/system',
      'EduCreate-Test-Videos/current/failure/games',
      'EduCreate-Test-Videos/current/failure/content',
      'EduCreate-Test-Videos/current/failure/file-space',
      'EduCreate-Test-Videos/current/failure/system',
      'EduCreate-Test-Videos/compressed/current',
      'EduCreate-Test-Videos/metadata',
      'EduCreate-Test-Videos/reports/daily'
    ];

    directories.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // 處理單個測試影片
  async processVideo(videoPath, testResults = null) {
    try {
      console.log(`🎬 開始處理測試影片: ${path.basename(videoPath)}`);
      
      // 1. 生成基本元數據
      const metadata = await this.generateMetadata(videoPath, testResults);
      console.log(`   模組: ${metadata.module}, 功能: ${metadata.feature}, 結果: ${metadata.result}`);
      
      // 2. 移動影片到適當的目錄
      const organizedPath = await this.organizeVideo(videoPath, metadata);
      metadata.path = organizedPath;
      
      // 3. 壓縮影片
      const compressedPath = await this.compressVideo(organizedPath, metadata);
      metadata.compressedPath = compressedPath;
      
      // 4. 儲存到本地記憶系統
      const memoryId = await this.memoryManager.storeVideoMemory(metadata);
      console.log(`   記憶ID: ${memoryId}`);
      
      // 5. 整合 Langfuse MCP
      const langfuseTraceId = await this.mcpManager.integrateWithLangfuse(metadata);
      console.log(`   Langfuse追蹤: ${langfuseTraceId}`);
      
      // 6. 整合 sequential-thinking
      const sequentialThinkingId = await this.mcpManager.integrateWithSequentialThinking(metadata);
      console.log(`   邏輯推理: ${sequentialThinkingId}`);
      
      // 7. 如果測試失敗，可選擇收集反饋
      let feedbackId = null;
      if (metadata.result === 'failure') {
        feedbackId = await this.mcpManager.integrateWithFeedbackCollector(metadata);
        if (feedbackId) {
          console.log(`   反饋收集: ${feedbackId}`);
        }
      }
      
      // 8. 更新 MCP 整合信息
      await this.memoryManager.updateMCPIntegration(memoryId, {
        langfuseTraceId,
        sequentialThinkingId,
        feedbackCollectionId: feedbackId
      });
      
      // 9. 分析測試模式
      await this.memoryManager.analyzeTestPatterns(metadata);
      
      // 10. 記錄失敗分析（如果適用）
      if (metadata.result === 'failure') {
        await this.memoryManager.recordFailureAnalysis(metadata);
      }
      
      // 11. 更新測試目錄
      await this.updateTestCatalog(metadata);
      
      // 12. 生成處理報告
      const processingReport = {
        videoId: metadata.videoId,
        originalPath: videoPath,
        organizedPath,
        compressedPath,
        memoryId,
        langfuseTraceId,
        sequentialThinkingId,
        feedbackCollectionId: feedbackId,
        processingTime: Date.now() - metadata.processingStartTime,
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ 測試影片處理完成: ${metadata.videoId}`);
      console.log(`   處理耗時: ${(processingReport.processingTime / 1000).toFixed(1)} 秒`);
      
      return processingReport;
      
    } catch (error) {
      console.error(`❌ 處理測試影片失敗: ${path.basename(videoPath)}`, error);
      throw error;
    }
  }

  // 批量處理測試影片
  async processVideosInDirectory(inputDir, testResultsDir = null, overrides = null) {
    if (!fs.existsSync(inputDir)) {
      throw new Error(`輸入目錄不存在: ${inputDir}`);
    }

    // 遞迴收集所有 .webm 影片
    function walk(dir) {
      const out = [];
      const entries = fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }) : [];
      for (const e of entries) {
        const fp = path.join(dir, e.name);
        if (e.isDirectory()) out.push(...walk(fp));
        else if (e.isFile() && fp.toLowerCase().endsWith('.webm')) out.push(fp);
      }
      return out;
    }
    const videoFiles = walk(inputDir);

    if (videoFiles.length === 0) {
      console.log('📁 沒有找到需要處理的影片文件');
      return [];
    }

    // 構建 results.json 映射（video 路徑 → 狀態）
    let resultsIndex = {};
    try {
      const aggregatedPath = path.join(testResultsDir || inputDir, 'results.json');
      if (fs.existsSync(aggregatedPath)) {
        const aggregated = JSON.parse(fs.readFileSync(aggregatedPath, 'utf8'));
        const map = {};
        const rootDir = path.resolve(testResultsDir || inputDir);
        const collect = (suite) => {
          if (!suite) return;
          if (Array.isArray(suite.suites)) suite.suites.forEach(collect);
          if (Array.isArray(suite.tests)) {
            suite.tests.forEach(t => {
              const status = t.outcome || t.status || (t.ok ? 'passed' : 'failed');
              const projectName = t.projectName || t.project || 'chromium';
              const title = t.title || (Array.isArray(t.titlePath) ? t.titlePath.join(' / ') : 'test');
              const resultsArr = Array.isArray(t.results) ? t.results : [];
              const atts = resultsArr.flatMap(r => Array.isArray(r.attachments) ? r.attachments : []);
              let traceAbs = null;
              let durationMs = 0;
              resultsArr.forEach(r => { durationMs = Math.max(durationMs, r.duration || 0); });
              atts.forEach(att => {
                const p = att?.path;
                if (!p) return;
                const abs = path.isAbsolute(p) ? p : path.join(rootDir, p);
                if (/trace\.zip$/i.test(p)) traceAbs = path.normalize(abs);
              });
              atts.forEach(att => {
                const p = att?.path;
                if (!p) return;
                if (/video\.webm$/i.test(p)) {
                  const abs = path.isAbsolute(p) ? p : path.join(rootDir, p);
                  map[path.normalize(abs)] = { status, projectName, title, traceAbs, duration: durationMs };
                }
              });
            });
          }
        };
        if (Array.isArray(aggregated.suites)) aggregated.suites.forEach(collect);
        resultsIndex = map;
      }
    } catch (e) {
      console.warn('⚠️ 無法解析 results.json，將使用預設分類（success）');
    }

    console.log(`📁 開始批量處理: ${videoFiles.length} 個影片文件`);

    const results = [];
    const startTime = Date.now();

    for (const [index, videoPath] of videoFiles.entries()) {
      console.log(`\n[${index + 1}/${videoFiles.length}] 處理影片: ${path.basename(videoPath)}`);

      try {
        // 從 results.json 查詢狀態與測試上下文
        let testResults = null;
        const abs = path.normalize(path.resolve(videoPath));
        const info = resultsIndex[abs];
        if (info) {
          testResults = info; // { status, title, projectName, attachments: { trace?: string } }
        } else if (testResultsDir) {
          // 向後相容：嘗試同名 json（簡化）
          const testResultPath = path.join(testResultsDir, path.basename(videoPath).replace('.webm', '.json'));
          if (fs.existsSync(testResultPath)) {
            const jr = JSON.parse(fs.readFileSync(testResultPath, 'utf8'));
            testResults = { status: jr.status };
          }
        }

        // 傳遞 overrides 到 metadata 生成
        this._overrides = overrides;
        const result = await this.processVideo(videoPath, testResults);
        results.push(result);

      } catch (error) {
        console.error(`跳過文件 ${path.basename(videoPath)}: ${error.message}`);
        results.push({
          videoPath,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      }
    }

    const totalTime = (Date.now() - startTime) / 1000;
    const successCount = results.filter(r => !r.error).length;
    const errorCount = results.length - successCount;

    console.log(`\n📊 批量處理完成:`);
    console.log(`   總文件數: ${videoFiles.length}`);
    console.log(`   成功處理: ${successCount}`);
    console.log(`   處理失敗: ${errorCount}`);
    console.log(`   總耗時: ${totalTime.toFixed(1)} 秒`);
    console.log(`   平均耗時: ${(totalTime / videoFiles.length).toFixed(1)} 秒/文件`);

    // 生成批量處理報告
    await this.generateBatchReport(results, inputDir);

    return results;
  }

  // 生成影片元數據
  async generateMetadata(videoPath, testResults = null) {
    const fileName = path.basename(videoPath);
    const fileStats = fs.statSync(videoPath);
    const now = new Date();
    const ymd = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
    const hms = `${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`;

    // 嘗試從文件名解析信息
    const parsedInfo = this.parseVideoFileName(fileName);

    // 套用 overrides（環境變數或流程層傳入）
    const overrides = this._overrides || {};
    if (overrides.module) parsedInfo.module = overrides.module;
    if (overrides.feature) parsedInfo.feature = overrides.feature;
    if (overrides.version) parsedInfo.version = overrides.version;

    // 由 testResults 強化上下文：標題、專案（瀏覽器）、追蹤檔案
    if (testResults) {
      parsedInfo.testStages = testResults.testStages || [];
      parsedInfo.duration = testResults.duration || testResults.durationMs || parsedInfo.duration || 0;
      parsedInfo.relatedScreenshots = testResults.screenshots || [];
      parsedInfo.browser = testResults.projectName || parsedInfo.browser || 'chromium';
      parsedInfo.title = testResults.title || parsedInfo.title || parsedInfo.feature || 'test';
      parsedInfo.trace = testResults.traceAbs || parsedInfo.trace || null;
      // 由 results.json 決定結果（更權威）
      if (typeof testResults.status === 'string') {
        parsedInfo.result = testResults.status === 'passed' ? 'success' : 'failure';
      }
    }

    // fallback 規則：若未映射（或值為 unknown 等非標準）
    let unmapped = false;
    if (!['success','failure'].includes((parsedInfo.result||'').toLowerCase())) { parsedInfo.result = 'success'; unmapped = true; }
    if (!parsedInfo.module) parsedInfo.module = 'games';
    if (!parsedInfo.feature) parsedInfo.feature = 'AirplaneLRIV';

    const metadata = {
      videoId: fileName.replace('.webm', ''),
      originalFileName: fileName,
      module: parsedInfo.module,
      feature: parsedInfo.feature,
      testName: parsedInfo.title || `${parsedInfo.feature} 測試`,
      result: parsedInfo.result,
      version: parsedInfo.version || 'v1.0.1',
      sequence: parsedInfo.sequence,
      testDate: new Date().toISOString(),
      originalSize: fileStats.size,
      duration: parsedInfo.duration,
      testStages: parsedInfo.testStages,
      relatedScreenshots: parsedInfo.relatedScreenshots,
      processingStartTime: Date.now(),
      browser: parsedInfo.browser,
      trace: parsedInfo.trace,
      unmapped,
      yyyymmdd: ymd,
      hhmmss: hms,
      metadata: {
        isMemoryScienceTest: parsedInfo.module === 'games',
        isGEPTTest: this.isGEPTRelated(parsedInfo.feature),
        isAccessibilityTest: this.isAccessibilityRelated(parsedInfo.feature),
        priority: this.determinePriority(parsedInfo.module, parsedInfo.result)
      }
    };

    return metadata;
  }

  // 解析影片文件名
  parseVideoFileName(fileName) {
    // 標準格式: YYYYMMDD_模組_功能_結果_版本_序號.webm
    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
    const parts = nameWithoutExt.split('_');
    
    if (parts.length >= 4) {
      return {
        date: parts[0],
        module: parts[1],
        feature: parts[2],
        result: parts[3],
        version: parts[4] || 'v1.0.0',
        sequence: parts[5] || '001',
        testStages: this.generateDefaultTestStages(parts[1], parts[2], parts[3]),
        duration: 60, // 默認60秒
        relatedScreenshots: []
      };
    }
    
    // 如果無法解析，嘗試從文件名推斷
    return this.inferFromFileName(fileName);
  }

  // 從文件名推斷信息
  inferFromFileName(fileName) {
    let module = 'system';
    let feature = 'unknown';
    let result = 'unknown';
    
    // 推斷模組
    if (fileName.includes('match') || fileName.includes('game')) {
      module = 'games';
      feature = fileName.includes('match') ? 'match-game' : 'unknown-game';
    } else if (fileName.includes('content') || fileName.includes('ai')) {
      module = 'content';
      feature = fileName.includes('ai') ? 'ai-content-generation' : 'unknown-content';
    } else if (fileName.includes('file') || fileName.includes('space')) {
      module = 'file-space';
      feature = 'file-manager';
    }
    
    // 推斷結果
    if (fileName.includes('success') || fileName.includes('pass')) {
      result = 'success';
    } else if (fileName.includes('fail') || fileName.includes('error')) {
      result = 'failure';
    }
    
    return {
      date: new Date().toISOString().slice(0, 10).replace(/-/g, ''),
      module,
      feature,
      result,
      version: 'v1.0.0',
      sequence: '001',
      testStages: this.generateDefaultTestStages(module, feature, result),
      duration: 60,
      relatedScreenshots: []
    };
  }

  // 生成默認測試階段（增強版錯誤信息）
  generateDefaultTestStages(module, feature, result) {
    const timestamp = new Date().toISOString();

    // 生成詳細的錯誤信息
    const generateStageDetails = (stageName, stageResult) => {
      const baseStage = {
        stage: 0, // 將在下面設置
        name: stageName,
        result: stageResult,
        timestamp,
        memory: stageResult === 'pass'
          ? `${stageName}階段成功完成，功能正常工作`
          : `${stageName}階段失敗，需要進一步調查和修復`
      };

      // 如果失敗，添加詳細的錯誤分析
      if (stageResult === 'fail') {
        baseStage.errorDetails = {
          errorType: 'functional_failure',
          possibleCauses: this.generatePossibleCauses(stageName, module, feature),
          suggestedFixes: this.generateSuggestedFixes(stageName, module, feature),
          debugSteps: this.generateDebugSteps(stageName, module, feature),
          relatedComponents: this.getRelatedComponents(stageName, module, feature),
          memoryScience: this.getMemoryScienceImpact(stageName, module),
          geptImpact: this.getGEPTImpact(stageName, module),
          priority: this.getFailurePriority(stageName, module)
        };
      }

      return baseStage;
    };

    const baseStages = [
      generateStageDetails('主頁導航', 'pass'),
      generateStageDetails('功能入口', 'pass'),
      generateStageDetails('基本功能測試', result === 'success' ? 'pass' : 'fail')
    ];

    // 設置階段編號
    baseStages.forEach((stage, index) => {
      stage.stage = index + 1;
    });

    // 根據模組添加特定階段
    if (module === 'games') {
      const gameStages = [
        generateStageDetails('遊戲配置', 'pass'),
        generateStageDetails('遊戲玩法', result === 'success' ? 'pass' : 'fail'),
        generateStageDetails('記憶科學驗證', result === 'success' ? 'pass' : 'fail')
      ];

      gameStages.forEach((stage, index) => {
        stage.stage = baseStages.length + index + 1;
      });

      baseStages.push(...gameStages);
    } else if (module === 'content') {
      const contentStages = [
        generateStageDetails('GEPT分級測試', 'pass'),
        generateStageDetails('AI內容生成', result === 'success' ? 'pass' : 'fail')
      ];

      contentStages.forEach((stage, index) => {
        stage.stage = baseStages.length + index + 1;
      });

      baseStages.push(...contentStages);
    } else if (module === 'system') {
      const systemStages = [
        generateStageDetails('系統整合測試', result === 'success' ? 'pass' : 'fail'),
        generateStageDetails('性能驗證', result === 'success' ? 'pass' : 'fail')
      ];

      systemStages.forEach((stage, index) => {
        stage.stage = baseStages.length + index + 1;
      });

      baseStages.push(...systemStages);
    }

    return baseStages;
  }

  // 生成可能的錯誤原因
  generatePossibleCauses(stageName, module, feature) {
    const commonCauses = {
      '主頁導航': ['頁面載入超時', '導航元素未找到', '路由配置錯誤'],
      '功能入口': ['按鈕或連結失效', '權限驗證失敗', '功能未正確註冊'],
      '基本功能測試': ['核心邏輯錯誤', 'API 端點失效', '數據驗證失敗'],
      '遊戲配置': ['遊戲參數錯誤', '模板載入失敗', '配置文件損壞'],
      '遊戲玩法': ['互動邏輯錯誤', '事件處理失敗', '狀態管理問題'],
      '記憶科學驗證': ['間隔重複算法錯誤', '主動回憶機制失效', '認知負荷計算錯誤'],
      'GEPT分級測試': ['詞彙分級錯誤', '難度評估失敗', '分級數據缺失'],
      'AI內容生成': ['AI API 失效', '內容生成邏輯錯誤', '模板處理失敗'],
      '系統整合測試': ['組件間通信失敗', '數據同步錯誤', '依賴項缺失'],
      '性能驗證': ['響應時間超標', '記憶體洩漏', '資源使用過高']
    };

    return commonCauses[stageName] || ['未知錯誤原因', '需要進一步分析'];
  }

  // 生成修復建議
  generateSuggestedFixes(stageName, module, feature) {
    const commonFixes = {
      '主頁導航': [
        '檢查路由配置文件',
        '驗證頁面組件是否正確載入',
        '檢查導航元素的 data-testid 屬性'
      ],
      '功能入口': [
        '驗證功能按鈕的事件處理',
        '檢查權限和身份驗證',
        '確認功能在主頁正確註冊'
      ],
      '基本功能測試': [
        '檢查 API 端點的可用性',
        '驗證數據格式和驗證邏輯',
        '測試核心業務邏輯'
      ],
      '遊戲玩法': [
        '檢查遊戲狀態管理',
        '驗證用戶互動事件',
        '測試遊戲邏輯流程'
      ],
      '記憶科學驗證': [
        '檢查間隔重複算法實現',
        '驗證主動回憶機制',
        '測試認知負荷計算'
      ]
    };

    return commonFixes[stageName] || ['進行詳細的錯誤分析和調試'];
  }

  // 生成調試步驟
  generateDebugSteps(stageName, module, feature) {
    return [
      `1. 檢查 ${stageName} 相關的組件和邏輯`,
      `2. 查看瀏覽器控制台的錯誤信息`,
      `3. 驗證 ${module} 模組的依賴項`,
      `4. 測試 ${feature} 功能的單元測試`,
      `5. 檢查相關的 API 端點和數據流`,
      `6. 驗證無障礙設計和 WCAG 合規性`,
      `7. 測試記憶科學原理的實現`
    ];
  }

  // 獲取相關組件
  getRelatedComponents(stageName, module, feature) {
    const componentMap = {
      'games': ['GameEngine', 'MemoryScience', 'GEPTGrading', 'UserInterface'],
      'content': ['ContentManager', 'AIGenerator', 'GEPTClassifier', 'TemplateEngine'],
      'system': ['NavigationSystem', 'AuthManager', 'DataSync', 'PerformanceMonitor'],
      'file-space': ['FileManager', 'FolderSystem', 'SearchEngine', 'BatchOperations']
    };

    return componentMap[module] || ['UnknownComponent'];
  }

  // 獲取記憶科學影響
  getMemoryScienceImpact(stageName, module) {
    if (stageName.includes('記憶科學') || module === 'games') {
      return {
        impact: 'high',
        affectedPrinciples: ['間隔重複', '主動回憶', '認知負荷管理'],
        learningEffectiveness: 'significantly_reduced'
      };
    }
    return {
      impact: 'low',
      affectedPrinciples: [],
      learningEffectiveness: 'minimal_impact'
    };
  }

  // 獲取 GEPT 影響
  getGEPTImpact(stageName, module) {
    if (stageName.includes('GEPT') || module === 'content') {
      return {
        impact: 'high',
        affectedLevels: ['elementary', 'intermediate', 'high-intermediate'],
        gradingAccuracy: 'compromised'
      };
    }
    return {
      impact: 'low',
      affectedLevels: [],
      gradingAccuracy: 'unaffected'
    };
  }

  // 獲取失敗優先級
  getFailurePriority(stageName, module) {
    const highPriorityStages = ['記憶科學驗證', 'GEPT分級測試', '基本功能測試'];
    const highPriorityModules = ['games', 'content'];

    if (highPriorityStages.includes(stageName) || highPriorityModules.includes(module)) {
      return 'critical';
    }

    if (stageName.includes('功能') || stageName.includes('玩法')) {
      return 'high';
    }

    return 'medium';
  }

  // 組織影片到適當目錄
  async organizeVideo(videoPath, metadata) {
    const targetDir = path.join(
      'EduCreate-Test-Videos/current',
      metadata.result,
      metadata.module,
      metadata.feature
    );
    
    // 確保目標目錄存在
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    // 生成標準化文件名（新命名規則）：
    // current/{success|failure}/<module>/<feature>/{<testName>}__{<browser>}__{YYYYMMDD-HHmmss}.webm
    const safe = (s) => String(s || '').replace(/[^a-zA-Z0-9\-_一-龥]/g, '_').slice(0, 80);
    const baseName = `${safe(metadata.testName)}__${safe(metadata.browser)}__${metadata.yyyymmdd}-${metadata.hhmmss}.webm`;
    let targetPath = path.join(targetDir, baseName);
    let seq = 2;
    while (fs.existsSync(targetPath)) {
      targetPath = path.join(targetDir, `${safe(metadata.testName)}__${safe(metadata.browser)}__${metadata.yyyymmdd}-${metadata.hhmmss}_${String(seq++).padStart(2,'0')}.webm`);
    }

    // 移動文件
    if (videoPath !== targetPath) {
      fs.copyFileSync(videoPath, targetPath);
      console.log(`   📁 影片已組織到: ${path.relative('EduCreate-Test-Videos', targetPath)}`);
    }

    // 若存在 trace，複製到相同目錄，使用相同基名 .zip
    if (metadata.trace && fs.existsSync(metadata.trace)) {
      const traceTarget = path.join(targetDir, path.basename(targetPath, '.webm') + '.zip');
      try {
        fs.copyFileSync(metadata.trace, traceTarget);
        console.log(`   🗜️ Trace 已複製: ${path.relative('EduCreate-Test-Videos', traceTarget)}`);
      } catch (e) {
        console.warn(`   ⚠️ 複製 trace 失敗: ${e.message}`);
      }
    }

    return targetPath;
  }

  // 生成標準化文件名
  generateStandardFileName(metadata) {
    const date = metadata.testDate.slice(0, 10).replace(/-/g, '');
    return `${date}_${metadata.module}_${metadata.feature}_${metadata.result}_${metadata.version}_${metadata.sequence}.webm`;
  }

  // 壓縮影片
  async compressVideo(videoPath, metadata) {
    const compressedDir = path.join(
      'EduCreate-Test-Videos/compressed/current',
      metadata.result,
      metadata.module,
      metadata.feature
    );
    
    const compressedFileName = path.basename(videoPath);
    const compressedPath = path.join(compressedDir, compressedFileName);
    
    // 使用智能壓縮
    const compressionResult = await this.compressionManager.smartCompress(videoPath, compressedPath, metadata);
    
    // 更新元數據
    metadata.compressedSize = compressionResult.compressedSize;
    metadata.compressionRatio = compressionResult.compressionRatio;
    metadata.compressionQuality = compressionResult.quality;
    
    return compressedPath;
  }

  // 更新測試目錄
  async updateTestCatalog(metadata) {
    const catalogPath = 'EduCreate-Test-Videos/metadata/test-catalog.json';
    
    let catalog = { tests: [], lastUpdated: null, stats: {} };
    if (fs.existsSync(catalogPath)) {
      catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
    }
    
    // 添加或更新測試記錄
    const existingIndex = catalog.tests.findIndex(t => t.videoId === metadata.videoId);
    const testRecord = {
      videoId: metadata.videoId,
      path: metadata.path,
      compressedPath: metadata.compressedPath,
      module: metadata.module,
      feature: metadata.feature,
      result: metadata.result,
      version: metadata.version,
      testDate: metadata.testDate,
      originalSize: metadata.originalSize,
      compressedSize: metadata.compressedSize,
      compressionRatio: metadata.compressionRatio,
      priority: metadata.metadata.priority
    };
    
    if (existingIndex >= 0) {
      catalog.tests[existingIndex] = testRecord;
    } else {
      catalog.tests.push(testRecord);
    }
    
    // 更新統計
    catalog.lastUpdated = new Date().toISOString();
    catalog.stats = this.calculateCatalogStats(catalog.tests);
    
    // 保存目錄
    fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2));
  }

  // 計算目錄統計
  calculateCatalogStats(tests) {
    const totalTests = tests.length;
    const successTests = tests.filter(t => t.result === 'success').length;
    const failureTests = totalTests - successTests;
    
    const moduleStats = {};
    tests.forEach(test => {
      if (!moduleStats[test.module]) {
        moduleStats[test.module] = { total: 0, success: 0, failure: 0 };
      }
      moduleStats[test.module].total++;
      if (test.result === 'success') {
        moduleStats[test.module].success++;
      } else {
        moduleStats[test.module].failure++;
      }
    });
    
    const totalOriginalSize = tests.reduce((sum, t) => sum + (t.originalSize || 0), 0);
    const totalCompressedSize = tests.reduce((sum, t) => sum + (t.compressedSize || 0), 0);
    
    return {
      totalTests,
      successTests,
      failureTests,
      successRate: totalTests > 0 ? ((successTests / totalTests) * 100).toFixed(1) : 0,
      moduleStats,
      totalOriginalSizeMB: (totalOriginalSize / (1024 * 1024)).toFixed(2),
      totalCompressedSizeMB: (totalCompressedSize / (1024 * 1024)).toFixed(2),
      totalSpaceSavedMB: ((totalOriginalSize - totalCompressedSize) / (1024 * 1024)).toFixed(2)
    };
  }

  // 生成批量處理報告
  async generateBatchReport(results, inputDir) {
    const reportPath = `EduCreate-Test-Videos/reports/daily/batch-report-${new Date().toISOString().slice(0, 10)}.json`;
    
    const report = {
      inputDirectory: inputDir,
      processedAt: new Date().toISOString(),
      totalFiles: results.length,
      successfulProcessing: results.filter(r => !r.error).length,
      failedProcessing: results.filter(r => r.error).length,
      results: results,
      summary: {
        averageProcessingTime: this.calculateAverageProcessingTime(results),
        totalSpaceSaved: this.calculateTotalSpaceSaved(results),
        moduleBreakdown: this.calculateModuleBreakdown(results)
      }
    };
    
    // 確保報告目錄存在
    const reportDir = path.dirname(reportPath);
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📊 批量處理報告已生成: ${reportPath}`);
  }

  // 輔助方法
  isGEPTRelated(featureName) {
    return featureName.toLowerCase().includes('gept') || 
           featureName.includes('分級') || 
           featureName.includes('詞彙');
  }

  isAccessibilityRelated(featureName) {
    return featureName.includes('accessibility') || 
           featureName.includes('無障礙') || 
           featureName.includes('a11y');
  }

  determinePriority(module, result) {
    if (result === 'failure') return 'high';
    if (module === 'games') return 'high';
    if (module === 'content') return 'medium';
    return 'low';
  }

  calculateAverageProcessingTime(results) {
    const validResults = results.filter(r => !r.error && r.processingTime);
    if (validResults.length === 0) return 0;
    
    const totalTime = validResults.reduce((sum, r) => sum + r.processingTime, 0);
    return (totalTime / validResults.length / 1000).toFixed(1); // 轉換為秒
  }

  calculateTotalSpaceSaved(results) {
    // 這裡需要從壓縮結果中計算，暫時返回0
    return 0;
  }

  calculateModuleBreakdown(results) {
    const breakdown = {};
    results.forEach(result => {
      if (!result.error) {
        // 從結果中提取模組信息，暫時使用占位符
        const module = 'unknown';
        if (!breakdown[module]) {
          breakdown[module] = 0;
        }
        breakdown[module]++;
      }
    });
    return breakdown;
  }
}

module.exports = TestVideoProcessor;
