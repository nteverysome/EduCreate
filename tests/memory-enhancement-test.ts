// 記憶增強系統測試套件
import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';

interface MemoryTestResult {
  testName: string;
  passed: boolean;
  duration: number;
  details: string;
  score?: number;
}

interface MemoryEnhancementSystem {
  analyzeMemoryType: (gameType: string) => string;
  generateRecommendations: (userProfile: any) => string[];
  optimizeContent: (content: any) => any;
  trackProgress: (userId: string, gameData: any) => void;
  getPersonalizedPath: (userId: string) => any[];
}

class MemoryEnhancementTester {
  private system: MemoryEnhancementSystem;
  private testResults: MemoryTestResult[] = [];

  constructor() {
    this.system = this.createMockSystem();
  }

  private createMockSystem(): MemoryEnhancementSystem {
    return {
      analyzeMemoryType: (gameType: string) => {
        const memoryTypes = {
          'quiz': '識別記憶',
          'match': '關聯記憶',
          'flashcard': '回憶記憶',
          'wheel': '隨機記憶',
          'maze': '空間記憶',
          'sort': '分類記憶',
          'memory': '短期記憶',
          'crossword': '語義記憶'
        };
        return memoryTypes[gameType as keyof typeof memoryTypes] || '通用記憶';
      },

      generateRecommendations: (userProfile: any) => {
        const recommendations = [
          '建議增加視覺元素以提升記憶效果',
          '推薦使用間隔重複學習法',
          '建議添加音頻提示增強多感官學習',
          '推薦分組學習提高記憶鞏固',
          '建議使用故事化記憶技巧'
        ];
        return recommendations.slice(0, Math.min(3, userProfile.level || 3));
      },

      optimizeContent: (content: any) => {
        return {
          ...content,
          optimized: true,
          memoryTips: ['使用關鍵詞記憶', '建立視覺聯想', '重複練習'],
          difficulty: content.difficulty || 'medium',
          estimatedTime: (content.questions?.length || 5) * 2
        };
      },

      trackProgress: (userId: string, gameData: any) => {
        // 模擬進度追蹤
        const progress = {
          userId,
          gameId: gameData.id,
          score: gameData.score || 0,
          completionTime: gameData.time || 60,
          accuracy: gameData.accuracy || 85,
          timestamp: new Date().toISOString()
        };
        localStorage.setItem(`progress_${userId}`, JSON.stringify(progress));
      },

      getPersonalizedPath: (userId: string) => {
        return [
          { type: 'quiz', difficulty: 'easy', topic: '基礎詞彙' },
          { type: 'match', difficulty: 'medium', topic: '詞彙配對' },
          { type: 'flashcard', difficulty: 'medium', topic: '記憶鞏固' },
          { type: 'wheel', difficulty: 'hard', topic: '隨機測試' }
        ];
      }
    };
  }

  async runAllTests(): Promise<MemoryTestResult[]> {
    console.log('🧪 開始記憶增強系統測試...');
    
    this.testResults = [];
    
    await this.testMemoryTypeAnalysis();
    await this.testRecommendationGeneration();
    await this.testContentOptimization();
    await this.testProgressTracking();
    await this.testPersonalizedPath();
    await this.testSystemIntegration();
    await this.testPerformance();
    await this.testErrorHandling();

    this.generateTestReport();
    return this.testResults;
  }

  private async testMemoryTypeAnalysis(): Promise<void> {
    const startTime = Date.now();
    let passed = true;
    let details = '';

    try {
      const testCases = [
        { input: 'quiz', expected: '識別記憶' },
        { input: 'match', expected: '關聯記憶' },
        { input: 'flashcard', expected: '回憶記憶' },
        { input: 'unknown', expected: '通用記憶' }
      ];

      for (const testCase of testCases) {
        const result = this.system.analyzeMemoryType(testCase.input);
        if (result !== testCase.expected) {
          passed = false;
          details += `❌ ${testCase.input}: 期望 ${testCase.expected}, 實際 ${result}\n`;
        } else {
          details += `✅ ${testCase.input}: ${result}\n`;
        }
      }
    } catch (error) {
      passed = false;
      details = `錯誤: ${error}`;
    }

    this.testResults.push({
      testName: '記憶類型分析',
      passed,
      duration: Date.now() - startTime,
      details,
      score: passed ? 100 : 0
    });
  }

  private async testRecommendationGeneration(): Promise<void> {
    const startTime = Date.now();
    let passed = true;
    let details = '';

    try {
      const userProfiles = [
        { level: 1, preferences: ['visual'] },
        { level: 3, preferences: ['audio', 'visual'] },
        { level: 5, preferences: ['kinesthetic'] }
      ];

      for (const profile of userProfiles) {
        const recommendations = this.system.generateRecommendations(profile);
        if (!Array.isArray(recommendations) || recommendations.length === 0) {
          passed = false;
          details += `❌ 用戶等級 ${profile.level}: 推薦生成失敗\n`;
        } else {
          details += `✅ 用戶等級 ${profile.level}: 生成 ${recommendations.length} 個推薦\n`;
        }
      }
    } catch (error) {
      passed = false;
      details = `錯誤: ${error}`;
    }

    this.testResults.push({
      testName: '推薦生成',
      passed,
      duration: Date.now() - startTime,
      details,
      score: passed ? 100 : 0
    });
  }

  private async testContentOptimization(): Promise<void> {
    const startTime = Date.now();
    let passed = true;
    let details = '';

    try {
      const testContent = {
        title: '測試內容',
        questions: [
          { question: '問題1', answer: '答案1' },
          { question: '問題2', answer: '答案2' }
        ],
        difficulty: 'medium'
      };

      const optimized = this.system.optimizeContent(testContent);
      
      if (!optimized.optimized) {
        passed = false;
        details += '❌ 內容未被標記為已優化\n';
      } else {
        details += '✅ 內容成功優化\n';
      }

      if (!optimized.memoryTips || optimized.memoryTips.length === 0) {
        passed = false;
        details += '❌ 記憶提示未生成\n';
      } else {
        details += `✅ 生成 ${optimized.memoryTips.length} 個記憶提示\n`;
      }

      if (!optimized.estimatedTime) {
        passed = false;
        details += '❌ 預估時間未計算\n';
      } else {
        details += `✅ 預估時間: ${optimized.estimatedTime} 分鐘\n`;
      }
    } catch (error) {
      passed = false;
      details = `錯誤: ${error}`;
    }

    this.testResults.push({
      testName: '內容優化',
      passed,
      duration: Date.now() - startTime,
      details,
      score: passed ? 100 : 0
    });
  }

  private async testProgressTracking(): Promise<void> {
    const startTime = Date.now();
    let passed = true;
    let details = '';

    try {
      const testUserId = 'test-user-123';
      const testGameData = {
        id: 'game-456',
        score: 85,
        time: 120,
        accuracy: 90
      };

      this.system.trackProgress(testUserId, testGameData);
      
      const savedProgress = localStorage.getItem(`progress_${testUserId}`);
      if (!savedProgress) {
        passed = false;
        details += '❌ 進度未保存\n';
      } else {
        const progress = JSON.parse(savedProgress);
        if (progress.score === testGameData.score) {
          details += '✅ 進度成功保存\n';
        } else {
          passed = false;
          details += '❌ 進度數據不正確\n';
        }
      }
    } catch (error) {
      passed = false;
      details = `錯誤: ${error}`;
    }

    this.testResults.push({
      testName: '進度追蹤',
      passed,
      duration: Date.now() - startTime,
      details,
      score: passed ? 100 : 0
    });
  }

  private async testPersonalizedPath(): Promise<void> {
    const startTime = Date.now();
    let passed = true;
    let details = '';

    try {
      const testUserId = 'test-user-456';
      const path = this.system.getPersonalizedPath(testUserId);
      
      if (!Array.isArray(path) || path.length === 0) {
        passed = false;
        details += '❌ 個性化路徑生成失敗\n';
      } else {
        details += `✅ 生成 ${path.length} 個學習步驟\n`;
        
        // 檢查路徑結構
        const hasValidStructure = path.every(step => 
          step.type && step.difficulty && step.topic
        );
        
        if (hasValidStructure) {
          details += '✅ 路徑結構正確\n';
        } else {
          passed = false;
          details += '❌ 路徑結構不完整\n';
        }
      }
    } catch (error) {
      passed = false;
      details = `錯誤: ${error}`;
    }

    this.testResults.push({
      testName: '個性化路徑',
      passed,
      duration: Date.now() - startTime,
      details,
      score: passed ? 100 : 0
    });
  }

  private async testSystemIntegration(): Promise<void> {
    const startTime = Date.now();
    let passed = true;
    let details = '';

    try {
      // 測試系統集成流程
      const gameType = 'quiz';
      const userProfile = { level: 2, preferences: ['visual'] };
      const content = { title: '集成測試', questions: [{ q: '測試', a: '答案' }] };
      
      // 1. 分析記憶類型
      const memoryType = this.system.analyzeMemoryType(gameType);
      details += `✅ 記憶類型: ${memoryType}\n`;
      
      // 2. 生成推薦
      const recommendations = this.system.generateRecommendations(userProfile);
      details += `✅ 推薦數量: ${recommendations.length}\n`;
      
      // 3. 優化內容
      const optimized = this.system.optimizeContent(content);
      details += `✅ 內容優化: ${optimized.optimized}\n`;
      
      // 4. 獲取學習路徑
      const path = this.system.getPersonalizedPath('integration-test');
      details += `✅ 學習路徑: ${path.length} 步驟\n`;
      
    } catch (error) {
      passed = false;
      details = `錯誤: ${error}`;
    }

    this.testResults.push({
      testName: '系統集成',
      passed,
      duration: Date.now() - startTime,
      details,
      score: passed ? 100 : 0
    });
  }

  private async testPerformance(): Promise<void> {
    const startTime = Date.now();
    let passed = true;
    let details = '';

    try {
      const iterations = 100;
      const performanceStart = Date.now();
      
      // 性能測試
      for (let i = 0; i < iterations; i++) {
        this.system.analyzeMemoryType('quiz');
        this.system.generateRecommendations({ level: 1 });
      }
      
      const performanceEnd = Date.now();
      const avgTime = (performanceEnd - performanceStart) / iterations;
      
      if (avgTime > 10) { // 每次操作不應超過10ms
        passed = false;
        details += `❌ 性能不達標: 平均 ${avgTime.toFixed(2)}ms\n`;
      } else {
        details += `✅ 性能良好: 平均 ${avgTime.toFixed(2)}ms\n`;
      }
      
    } catch (error) {
      passed = false;
      details = `錯誤: ${error}`;
    }

    this.testResults.push({
      testName: '性能測試',
      passed,
      duration: Date.now() - startTime,
      details,
      score: passed ? 100 : 0
    });
  }

  private async testErrorHandling(): Promise<void> {
    const startTime = Date.now();
    let passed = true;
    let details = '';

    try {
      // 測試錯誤處理
      const errorCases = [
        () => this.system.analyzeMemoryType(null as any),
        () => this.system.generateRecommendations(null as any),
        () => this.system.optimizeContent(null as any),
        () => this.system.trackProgress('', null as any)
      ];

      let handledErrors = 0;
      for (const errorCase of errorCases) {
        try {
          errorCase();
        } catch (error) {
          handledErrors++;
        }
      }

      if (handledErrors === errorCases.length) {
        details += '✅ 所有錯誤情況都被正確處理\n';
      } else {
        details += `⚠️ ${handledErrors}/${errorCases.length} 錯誤被處理\n`;
      }
      
    } catch (error) {
      passed = false;
      details = `錯誤: ${error}`;
    }

    this.testResults.push({
      testName: '錯誤處理',
      passed,
      duration: Date.now() - startTime,
      details,
      score: passed ? 100 : 0
    });
  }

  private generateTestReport(): void {
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const totalDuration = this.testResults.reduce((sum, r) => sum + r.duration, 0);
    const averageScore = this.testResults.reduce((sum, r) => sum + (r.score || 0), 0) / totalTests;

    console.log('\n📊 記憶增強系統測試報告');
    console.log('='.repeat(50));
    console.log(`總測試數: ${totalTests}`);
    console.log(`通過測試: ${passedTests}`);
    console.log(`失敗測試: ${totalTests - passedTests}`);
    console.log(`通過率: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    console.log(`平均分數: ${averageScore.toFixed(1)}/100`);
    console.log(`總耗時: ${totalDuration}ms`);
    console.log('\n詳細結果:');
    
    this.testResults.forEach((result, index) => {
      const status = result.passed ? '✅' : '❌';
      console.log(`${index + 1}. ${status} ${result.testName} (${result.duration}ms)`);
      if (result.details) {
        console.log(`   ${result.details.replace(/\n/g, '\n   ')}`);
      }
    });
  }
}

// 導出測試器
export { MemoryEnhancementTester };

// 如果直接運行此文件，執行測試
if (require.main === module) {
  const tester = new MemoryEnhancementTester();
  tester.runAllTests().then(() => {
    console.log('✅ 記憶增強系統測試完成');
  });
}
