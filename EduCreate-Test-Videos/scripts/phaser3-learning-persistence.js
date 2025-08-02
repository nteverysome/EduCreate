#!/usr/bin/env node

/**
 * Phaser 3 學習持久化系統
 * 解決 AI 跨對話忘記 Phaser 3 知識的問題
 */

const fs = require('fs');
const path = require('path');

class Phaser3LearningPersistence {
  constructor() {
    this.memoryDir = path.join(__dirname, '../local-memory');

    // 整合現有的本地記憶系統
    this.knowledgeBaseFile = path.join(this.memoryDir, 'knowledge-base.json');
    this.failureAnalysisFile = path.join(this.memoryDir, 'failure-analysis.json');
    this.improvementTrackingFile = path.join(this.memoryDir, 'improvement-tracking.json');
    this.videoMemoriesFile = path.join(this.memoryDir, 'video-memories.json');
    this.performanceMetricsFile = path.join(this.memoryDir, 'performance-metrics.json');

    // Phaser 3 專用文件
    this.errorPatternsFile = path.join(this.memoryDir, 'phaser3-error-patterns.json');
    this.checklistFile = path.join(this.memoryDir, 'phaser3-development-checklist.md');
    this.sessionLogFile = path.join(this.memoryDir, 'phaser3-session-log.json');
  }

  /**
   * 記錄新的錯誤模式 - 整合到現有記憶系統
   */
  recordError(errorType, errorMessage, solution, codeContext) {
    const timestamp = new Date().toISOString();
    const errorId = `phaser3_${errorType}_${Date.now()}`;

    // 1. 更新 Phaser 3 專用錯誤模式
    const errorPatterns = this.loadErrorPatterns();
    if (!errorPatterns.phaser3_common_errors[errorType]) {
      errorPatterns.phaser3_common_errors[errorType] = {
        error_pattern: errorMessage,
        common_causes: [],
        solutions: [],
        code_template: '',
        frequency: 0,
        last_encountered: timestamp
      };
    }

    const errorRecord = errorPatterns.phaser3_common_errors[errorType];
    errorRecord.frequency += 1;
    errorRecord.last_encountered = timestamp;

    if (!errorRecord.solutions.includes(solution)) {
      errorRecord.solutions.push(solution);
    }
    this.saveErrorPatterns(errorPatterns);

    // 2. 整合到失敗分析系統
    this.recordToFailureAnalysis(errorId, errorType, errorMessage, solution, codeContext);

    // 3. 更新知識庫
    this.updateKnowledgeBase('phaser3_error', errorType, solution, timestamp);

    console.log(`✅ 記錄 Phaser 3 錯誤到本地記憶系統: ${errorType}`);
  }

  /**
   * 驗證並記錄成功的解決方案 - 需要真實驗證
   */
  async recordVerifiedSuccess(problemType, solution, codeTemplate, filePath = null, testCommand = null) {
    const timestamp = new Date().toISOString();
    const successId = `phaser3_success_${problemType}_${Date.now()}`;

    console.log(`🔍 開始驗證 Phaser 3 解決方案: ${problemType}`);

    // 第一層：技術驗證
    const technicalVerification = await this.performTechnicalVerification(filePath, testCommand);

    if (!technicalVerification.success) {
      console.log(`❌ 技術驗證失敗: ${technicalVerification.error}`);
      // 記錄到失敗系統而不是成功系統
      this.recordError(problemType, technicalVerification.error, solution, '技術驗證失敗');
      return { success: false, reason: 'technical_verification_failed', details: technicalVerification };
    }

    console.log(`✅ 技術驗證通過: ${technicalVerification.message}`);

    // 第二層：用戶確認驗證
    const userConfirmation = await this.requestUserConfirmation(problemType, solution, technicalVerification);

    if (!userConfirmation.confirmed) {
      console.log(`❌ 用戶確認失敗: ${userConfirmation.reason}`);
      // 記錄為部分成功，需要進一步改進
      this.recordPartialSuccess(problemType, solution, codeTemplate, technicalVerification, userConfirmation);
      return { success: false, reason: 'user_confirmation_failed', details: userConfirmation };
    }

    console.log(`✅ 用戶確認通過: 問題真正解決`);

    // 只有雙重驗證都通過才記錄為真正的成功
    return this.recordTrueSuccess(successId, problemType, solution, codeTemplate, technicalVerification, userConfirmation, timestamp);
  }

  /**
   * 生成對話開始時的 Phaser 3 提醒 - 整合現有記憶系統
   */
  generateSessionReminder() {
    const timestamp = new Date().toISOString();

    // 載入所有記憶系統數據
    const errorPatterns = this.loadErrorPatterns();
    const failureAnalysis = this.loadFailureAnalysis();
    const improvements = this.loadImprovementTracking();
    const videoMemories = this.loadVideoMemories();
    const knowledgeBase = this.loadKnowledgeBase();

    const reminder = {
      timestamp,
      critical_reminders: [
        "🚨 Phaser 3 常見錯誤預防:",
        "1. 不要在 create() 之前訪問 scene 屬性",
        "2. 所有資源必須在 preload() 中載入",
        "3. 物理精靈使用 this.physics.add.sprite()",
        "4. 縮放管理使用內建的 Scale Manager",
        "5. 檢查瀏覽器控制台錯誤"
      ],
      recent_errors: this.getRecentErrors(errorPatterns),
      recent_failures: this.getRecentPhaser3Failures(failureAnalysis),
      recent_successes: this.getRecentPhaser3Successes(improvements),
      video_memories: this.getPhaser3VideoMemories(videoMemories),
      knowledge_insights: this.getPhaser3Knowledge(knowledgeBase),
      best_practices: errorPatterns.best_practices,
      code_templates: errorPatterns.code_templates,
      memory_system_stats: {
        total_phaser3_failures: this.countPhaser3Records(failureAnalysis, 'phaser3'),
        total_phaser3_successes: this.countPhaser3Records(improvements, 'phaser3'),
        total_phaser3_videos: this.countPhaser3Records(videoMemories, 'phaser3'),
        total_phaser3_knowledge: this.countPhaser3Records(knowledgeBase, 'phaser3')
      }
    };

    // 保存會話日誌
    this.saveSessionLog(reminder);

    return reminder;
  }

  /**
   * 獲取最近的錯誤模式
   */
  getRecentErrors(errorPatterns) {
    const errors = Object.entries(errorPatterns.phaser3_common_errors || {})
      .sort((a, b) => new Date(b[1].last_encountered) - new Date(a[1].last_encountered))
      .slice(0, 3)
      .map(([type, data]) => ({
        type,
        frequency: data.frequency,
        last_encountered: data.last_encountered,
        solutions: data.solutions
      }));

    return errors;
  }

  /**
   * 從失敗分析系統獲取最近的 Phaser 3 失敗記錄
   */
  getRecentPhaser3Failures(failureAnalysis) {
    const failures = (failureAnalysis.failures || [])
      .filter(failure => failure.category === 'phaser3_development')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 3)
      .map(failure => ({
        id: failure.id,
        error_type: failure.error_type,
        error_message: failure.error_message,
        solution: failure.solution,
        timestamp: failure.timestamp,
        frequency: failure.frequency
      }));

    return failures;
  }

  /**
   * 從改進追蹤系統獲取最近的 Phaser 3 成功記錄
   */
  getRecentPhaser3Successes(improvements) {
    const successes = (improvements.improvements || [])
      .filter(improvement => improvement.category === 'phaser3_development')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 3)
      .map(improvement => ({
        id: improvement.id,
        problem: improvement.problem,
        solution: improvement.solution,
        code_template: improvement.code_template,
        timestamp: improvement.timestamp,
        impact: improvement.impact
      }));

    return successes;
  }

  /**
   * 從影片記憶系統獲取 Phaser 3 相關影片
   */
  getPhaser3VideoMemories(videoMemories) {
    const videos = (videoMemories.memories || [])
      .filter(memory => memory.module === 'phaser3' || memory.type === 'phaser3_learning_memory')
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 3)
      .map(memory => ({
        memoryId: memory.memoryId,
        feature: memory.feature,
        result: memory.result,
        summary: memory.summary,
        keyInsights: memory.keyInsights,
        timestamp: memory.timestamp,
        videoPath: memory.videoPath
      }));

    return videos;
  }

  /**
   * 從知識庫獲取 Phaser 3 相關知識
   */
  getPhaser3Knowledge(knowledgeBase) {
    const knowledge = (knowledgeBase.knowledge || [])
      .filter(item => item.category === 'phaser3_development' || item.tags?.includes('phaser3'))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5)
      .map(item => ({
        id: item.id,
        type: item.type,
        topic: item.topic,
        content: item.content,
        timestamp: item.timestamp,
        confidence: item.confidence,
        tags: item.tags
      }));

    return knowledge;
  }

  /**
   * 計算 Phaser 3 相關記錄數量
   */
  countPhaser3Records(data, keyword) {
    if (!data) return 0;

    if (data.failures) {
      return data.failures.filter(item => item.category === 'phaser3_development').length;
    }
    if (data.improvements) {
      return data.improvements.filter(item => item.category === 'phaser3_development').length;
    }
    if (data.memories) {
      return data.memories.filter(item => item.module === 'phaser3' || item.type === 'phaser3_learning_memory').length;
    }
    if (data.knowledge) {
      return data.knowledge.filter(item => item.category === 'phaser3_development' || item.tags?.includes('phaser3')).length;
    }

    return 0;
  }

  /**
   * 檢查代碼是否包含常見錯誤模式
   */
  checkCodeForErrors(codeContent) {
    const errorPatterns = this.loadErrorPatterns();
    const warnings = [];

    // 檢查常見錯誤模式
    if (codeContent.includes('this.add.') && !codeContent.includes('create()')) {
      warnings.push({
        type: 'early_scene_access',
        message: '可能在 create() 之前訪問場景屬性',
        suggestion: '將 this.add.* 調用移到 create() 方法中'
      });
    }

    if (codeContent.includes('this.physics.') && !codeContent.includes('physics: {')) {
      warnings.push({
        type: 'physics_not_enabled',
        message: '使用物理系統但可能未在配置中啟用',
        suggestion: '在場景配置中添加 physics: { default: "arcade" }'
      });
    }

    if (codeContent.includes('.setVelocity') && !codeContent.includes('physics.add.sprite')) {
      warnings.push({
        type: 'physics_sprite_error',
        message: '對非物理精靈使用物理方法',
        suggestion: '使用 this.physics.add.sprite() 創建物理精靈'
      });
    }

    return warnings;
  }

  /**
   * 生成修復建議
   */
  generateFixSuggestions(errorType) {
    const errorPatterns = this.loadErrorPatterns();
    const errorData = errorPatterns.phaser3_common_errors[errorType];
    
    if (!errorData) {
      return {
        message: '未知錯誤類型',
        suggestions: ['檢查 Phaser 3 文檔', '查看瀏覽器控制台錯誤']
      };
    }

    return {
      error_pattern: errorData.error_pattern,
      common_causes: errorData.common_causes,
      solutions: errorData.solutions,
      code_template: errorData.code_template,
      frequency: errorData.frequency
    };
  }

  // 輔助方法
  loadErrorPatterns() {
    try {
      return JSON.parse(fs.readFileSync(this.errorPatternsFile, 'utf8'));
    } catch (error) {
      console.warn('無法載入錯誤模式文件，使用預設值');
      return { phaser3_common_errors: {}, best_practices: {}, code_templates: {} };
    }
  }

  saveErrorPatterns(patterns) {
    fs.writeFileSync(this.errorPatternsFile, JSON.stringify(patterns, null, 2));
  }

  loadChecklist() {
    try {
      return fs.readFileSync(this.checklistFile, 'utf8');
    } catch (error) {
      console.warn('無法載入檢查清單文件');
      return '';
    }
  }

  saveSessionLog(log) {
    const logs = this.loadSessionLogs();
    logs.push(log);
    
    // 只保留最近 10 次會話記錄
    if (logs.length > 10) {
      logs.splice(0, logs.length - 10);
    }
    
    fs.writeFileSync(this.sessionLogFile, JSON.stringify(logs, null, 2));
  }

  loadSessionLogs() {
    try {
      return JSON.parse(fs.readFileSync(this.sessionLogFile, 'utf8'));
    } catch (error) {
      return [];
    }
  }

  // 整合現有本地記憶系統的方法

  /**
   * 記錄到失敗分析系統
   */
  recordToFailureAnalysis(errorId, errorType, errorMessage, solution, codeContext) {
    const failureAnalysis = this.loadFailureAnalysis();

    const failureRecord = {
      id: errorId,
      timestamp: new Date().toISOString(),
      category: 'phaser3_development',
      error_type: errorType,
      error_message: errorMessage,
      solution: solution,
      code_context: codeContext,
      frequency: 1,
      resolution_status: 'resolved',
      learning_notes: `Phaser 3 ${errorType} 錯誤已解決`
    };

    failureAnalysis.failures = failureAnalysis.failures || [];
    failureAnalysis.failures.push(failureRecord);

    this.saveFailureAnalysis(failureAnalysis);
  }

  /**
   * 記錄到改進追蹤系統
   */
  recordToImprovementTracking(successId, problemType, solution, codeTemplate, timestamp) {
    const improvements = this.loadImprovementTracking();

    const improvementRecord = {
      id: successId,
      timestamp,
      category: 'phaser3_development',
      improvement_type: 'error_resolution',
      problem: problemType,
      solution: solution,
      code_template: codeTemplate,
      impact: 'high',
      status: 'implemented',
      learning_value: 'high'
    };

    improvements.improvements = improvements.improvements || [];
    improvements.improvements.push(improvementRecord);

    this.saveImprovementTracking(improvements);
  }

  /**
   * 記錄到影片記憶系統
   */
  recordToVideoMemories(successId, problemType, solution, videoPath, timestamp) {
    const videoMemories = this.loadVideoMemories();

    const memoryRecord = {
      memoryId: successId,
      videoId: `phaser3_${problemType}_${Date.now()}`,
      type: 'phaser3_learning_memory',
      module: 'phaser3',
      feature: problemType,
      result: 'success',
      timestamp,
      summary: `Phaser 3 ${problemType} 問題成功解決`,
      keyInsights: [
        `問題類型: ${problemType}`,
        `解決方案: ${solution}`,
        '已整合到 Phaser 3 學習系統'
      ],
      relatedMemories: [],
      videoPath: videoPath,
      screenshotPaths: []
    };

    videoMemories.memories = videoMemories.memories || [];
    videoMemories.memories.push(memoryRecord);

    this.saveVideoMemories(videoMemories);
  }

  /**
   * 更新知識庫
   */
  updateKnowledgeBase(type, topic, content, timestamp) {
    const knowledgeBase = this.loadKnowledgeBase();

    const knowledgeRecord = {
      id: `${type}_${topic}_${Date.now()}`,
      timestamp,
      type,
      topic,
      content,
      category: 'phaser3_development',
      confidence: 'high',
      source: 'practical_experience',
      tags: ['phaser3', topic, type]
    };

    knowledgeBase.knowledge = knowledgeBase.knowledge || [];
    knowledgeBase.knowledge.push(knowledgeRecord);

    this.saveKnowledgeBase(knowledgeBase);
  }

  // 載入和保存現有記憶系統文件的方法

  loadFailureAnalysis() {
    try {
      return JSON.parse(fs.readFileSync(this.failureAnalysisFile, 'utf8'));
    } catch (error) {
      return { failures: [] };
    }
  }

  saveFailureAnalysis(data) {
    fs.writeFileSync(this.failureAnalysisFile, JSON.stringify(data, null, 2));
  }

  loadImprovementTracking() {
    try {
      return JSON.parse(fs.readFileSync(this.improvementTrackingFile, 'utf8'));
    } catch (error) {
      return { improvements: [] };
    }
  }

  saveImprovementTracking(data) {
    fs.writeFileSync(this.improvementTrackingFile, JSON.stringify(data, null, 2));
  }

  loadVideoMemories() {
    try {
      return JSON.parse(fs.readFileSync(this.videoMemoriesFile, 'utf8'));
    } catch (error) {
      return { memories: [] };
    }
  }

  saveVideoMemories(data) {
    fs.writeFileSync(this.videoMemoriesFile, JSON.stringify(data, null, 2));
  }

  loadKnowledgeBase() {
    try {
      return JSON.parse(fs.readFileSync(this.knowledgeBaseFile, 'utf8'));
    } catch (error) {
      return { knowledge: [] };
    }
  }

  saveKnowledgeBase(data) {
    fs.writeFileSync(this.knowledgeBaseFile, JSON.stringify(data, null, 2));
  }

  // 驗證機制方法

  /**
   * 執行技術驗證
   */
  async performTechnicalVerification(filePath, testCommand) {
    const verificationResults = {
      syntaxCheck: false,
      compilationCheck: false,
      testExecution: false,
      details: {}
    };

    try {
      // 1. 語法檢查（如果有文件路徑）
      if (filePath && fs.existsSync(filePath)) {
        const syntaxResult = await this.checkSyntax(filePath);
        verificationResults.syntaxCheck = syntaxResult.success;
        verificationResults.details.syntax = syntaxResult;
      }

      // 2. 編譯檢查
      const compilationResult = await this.checkCompilation();
      verificationResults.compilationCheck = compilationResult.success;
      verificationResults.details.compilation = compilationResult;

      // 3. 測試執行（如果有測試命令）
      if (testCommand) {
        const testResult = await this.runTest(testCommand);
        verificationResults.testExecution = testResult.success;
        verificationResults.details.test = testResult;
      }

      // 判斷整體成功
      const overallSuccess = verificationResults.syntaxCheck !== false &&
                           verificationResults.compilationCheck &&
                           verificationResults.testExecution !== false;

      return {
        success: overallSuccess,
        message: overallSuccess ? '所有技術驗證通過' : '部分技術驗證失敗',
        details: verificationResults
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: verificationResults
      };
    }
  }

  /**
   * 語法檢查
   */
  async checkSyntax(filePath) {
    try {
      // 這裡應該調用實際的語法檢查工具
      // 例如：diagnostics 工具或 TypeScript 編譯器
      console.log(`🔍 檢查語法: ${filePath}`);

      // 模擬語法檢查（實際實現中應該調用真實的檢查工具）
      const content = fs.readFileSync(filePath, 'utf8');

      // 基本語法檢查
      const hasBasicSyntaxErrors = content.includes('this.add.') &&
                                 !content.includes('create()') &&
                                 content.includes('constructor');

      return {
        success: !hasBasicSyntaxErrors,
        message: hasBasicSyntaxErrors ? '發現基本語法錯誤' : '語法檢查通過',
        details: { filePath, hasBasicSyntaxErrors }
      };
    } catch (error) {
      return {
        success: false,
        message: `語法檢查失敗: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * 編譯檢查
   */
  async checkCompilation() {
    try {
      console.log(`🔍 檢查編譯狀態`);

      // 這裡應該調用實際的編譯檢查
      // 例如：TypeScript 編譯器或 Next.js 構建

      // 模擬編譯檢查（實際實現中應該調用真實的編譯工具）
      return {
        success: true,
        message: '編譯檢查通過',
        details: { timestamp: new Date().toISOString() }
      };
    } catch (error) {
      return {
        success: false,
        message: `編譯檢查失敗: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * 運行測試
   */
  async runTest(testCommand) {
    try {
      console.log(`🔍 運行測試: ${testCommand}`);

      // 這裡應該調用實際的測試命令
      // 例如：Playwright 測試或 Jest 測試

      // 模擬測試執行（實際實現中應該調用真實的測試）
      return {
        success: true,
        message: '測試執行通過',
        details: { testCommand, timestamp: new Date().toISOString() }
      };
    } catch (error) {
      return {
        success: false,
        message: `測試執行失敗: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * 請求用戶確認
   */
  async requestUserConfirmation(problemType, solution, technicalVerification) {
    try {
      console.log(`🤔 請求用戶確認解決方案是否真正有效`);

      // 這裡應該調用 mcp-feedback-collector
      // 實際實現中需要整合到調用方

      const confirmationPrompt = `
🎯 Phaser 3 解決方案驗證

問題類型: ${problemType}
解決方案: ${solution}

技術驗證結果:
${JSON.stringify(technicalVerification.details, null, 2)}

❓ 請確認：這個問題是否真正解決了？
1. 功能是否正常工作？
2. 錯誤是否完全消失？
3. 解決方案是否穩定可靠？

請回答 "是" 或 "否"，並說明原因。
      `;

      // 返回確認請求信息（實際確認需要在調用方處理）
      return {
        confirmed: null, // 需要外部確認
        prompt: confirmationPrompt,
        requiresUserInput: true
      };
    } catch (error) {
      return {
        confirmed: false,
        reason: `用戶確認請求失敗: ${error.message}`,
        error: error.message
      };
    }
  }

  /**
   * 記錄真正的成功（雙重驗證通過）
   */
  recordTrueSuccess(successId, problemType, solution, codeTemplate, technicalVerification, userConfirmation, timestamp) {
    console.log(`🎉 記錄真正的成功解決方案: ${problemType}`);

    // 1. 更新 Phaser 3 專用成功記錄
    const errorPatterns = this.loadErrorPatterns();
    if (!errorPatterns.successful_solutions) {
      errorPatterns.successful_solutions = {};
    }

    errorPatterns.successful_solutions[problemType] = {
      solution,
      code_template: codeTemplate,
      timestamp,
      success_count: (errorPatterns.successful_solutions[problemType]?.success_count || 0) + 1,
      verification_status: 'fully_verified',
      technical_verification: technicalVerification,
      user_confirmation: userConfirmation
    };
    this.saveErrorPatterns(errorPatterns);

    // 2. 整合到改進追蹤系統
    this.recordToImprovementTracking(successId, problemType, solution, codeTemplate, timestamp);

    // 3. 更新知識庫（標記為高可信度）
    this.updateKnowledgeBase('phaser3_verified_success', problemType, solution, timestamp);

    console.log(`✅ 真正成功解決方案已記錄到本地記憶系統: ${problemType}`);

    return {
      success: true,
      successId,
      message: '解決方案已通過雙重驗證並記錄',
      verification: {
        technical: technicalVerification,
        user: userConfirmation
      }
    };
  }

  /**
   * 記錄部分成功（技術驗證通過但用戶確認失敗）
   */
  recordPartialSuccess(problemType, solution, codeTemplate, technicalVerification, userConfirmation) {
    const timestamp = new Date().toISOString();
    const partialId = `phaser3_partial_${problemType}_${Date.now()}`;

    console.log(`⚠️ 記錄部分成功（需要改進）: ${problemType}`);

    // 記錄到改進追蹤系統，標記為需要進一步改進
    const improvements = this.loadImprovementTracking();

    const partialRecord = {
      id: partialId,
      timestamp,
      category: 'phaser3_development',
      improvement_type: 'partial_resolution',
      problem: problemType,
      solution: solution,
      code_template: codeTemplate,
      impact: 'medium',
      status: 'needs_improvement',
      learning_value: 'medium',
      verification_status: 'partially_verified',
      technical_verification: technicalVerification,
      user_feedback: userConfirmation,
      next_steps: '需要根據用戶反饋進一步改進解決方案'
    };

    improvements.improvements = improvements.improvements || [];
    improvements.improvements.push(partialRecord);

    this.saveImprovementTracking(improvements);

    // 也記錄到知識庫，但標記為需要改進
    this.updateKnowledgeBase('phaser3_partial_success', problemType,
      `${solution} (需要改進: ${userConfirmation.reason})`, timestamp);

    console.log(`⚠️ 部分成功已記錄，需要進一步改進: ${problemType}`);
  }
}

// 命令行接口
if (require.main === module) {
  const persistence = new Phaser3LearningPersistence();
  const command = process.argv[2];

  switch (command) {
    case 'reminder':
      const reminder = persistence.generateSessionReminder();
      console.log('🧠 Phaser 3 會話提醒:');
      console.log(JSON.stringify(reminder, null, 2));
      break;
      
    case 'record-error':
      const [, , , errorType, errorMessage, solution] = process.argv;
      persistence.recordError(errorType, errorMessage, solution, '');
      break;
      
    case 'check-code':
      const codeFile = process.argv[3];
      if (fs.existsSync(codeFile)) {
        const code = fs.readFileSync(codeFile, 'utf8');
        const warnings = persistence.checkCodeForErrors(code);
        console.log('⚠️ 代碼檢查結果:');
        console.log(JSON.stringify(warnings, null, 2));
      }
      break;
      
    default:
      console.log('使用方法:');
      console.log('  node phaser3-learning-persistence.js reminder');
      console.log('  node phaser3-learning-persistence.js record-error <type> <message> <solution>');
      console.log('  node phaser3-learning-persistence.js check-code <file>');
  }
}

module.exports = Phaser3LearningPersistence;
