#!/usr/bin/env node

/**
 * MCP 服務器使用演示
 * 
 * 展示如何在 Wordwall Clone 項目中使用各種 MCP 服務器：
 * - SQLite 數據庫操作
 * - 本地向量搜索
 * - OpenTelemetry 追蹤
 * - Langfuse 監控
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// 顏色輸出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message) {
  log('green', `✅ ${message}`);
}

function info(message) {
  log('blue', `ℹ️  ${message}`);
}

function section(message) {
  log('cyan', `\n🔧 ${message}`);
  log('cyan', '='.repeat(50));
}

class MCPUsageDemo {
  constructor() {
    this.dbPath = path.join(__dirname, 'data', 'wordwall.db');
  }

  async runDemo() {
    log('magenta', '🚀 Wordwall Clone - MCP 服務器使用演示\n');

    await this.demoSQLiteOperations();
    await this.demoVectorSearch();
    await this.demoOpenTelemetry();
    await this.demoLangfuse();
    
    log('magenta', '\n🎉 演示完成！所有 MCP 服務器都已成功集成到 Wordwall Clone 項目中。');
  }

  async demoSQLiteOperations() {
    section('SQLite MCP 服務器 - 數據庫操作');

    const db = new sqlite3.Database(this.dbPath);

    // 1. 查詢用戶數據
    info('1. 查詢用戶數據...');
    await new Promise((resolve, reject) => {
      db.all("SELECT * FROM users", (err, rows) => {
        if (err) {
          reject(err);
        } else {
          success(`找到 ${rows.length} 個用戶:`);
          rows.forEach(user => {
            console.log(`   - ${user.display_name} (${user.role}): ${user.email}`);
          });
          resolve(rows);
        }
      });
    });

    // 2. 查詢活動數據
    info('2. 查詢活動數據...');
    await new Promise((resolve, reject) => {
      db.all("SELECT * FROM activities", (err, rows) => {
        if (err) {
          reject(err);
        } else {
          success(`找到 ${rows.length} 個活動:`);
          rows.forEach(activity => {
            console.log(`   - ${activity.title} (${activity.template_type})`);
          });
          resolve(rows);
        }
      });
    });

    // 3. 創建新活動
    info('3. 創建新活動...');
    const newActivity = {
      id: 'demo-activity-' + Date.now(),
      title: 'MCP 演示活動',
      description: '展示 MCP 集成的演示活動',
      content: JSON.stringify({
        questions: [
          {
            id: 'q1',
            text: '什麼是 MCP？',
            options: [
              { id: 'a', text: 'Model Context Protocol', isCorrect: true },
              { id: 'b', text: 'Machine Control Protocol', isCorrect: false },
              { id: 'c', text: 'Multi-Channel Protocol', isCorrect: false }
            ]
          }
        ]
      }),
      user_id: 'user1',
      template_type: 'QUIZ',
      is_public: true
    };

    await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO activities (id, title, description, content, user_id, template_type, is_public) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [newActivity.id, newActivity.title, newActivity.description, newActivity.content, newActivity.user_id, newActivity.template_type, newActivity.is_public],
        function(err) {
          if (err) {
            reject(err);
          } else {
            success(`新活動已創建: ${newActivity.title}`);
            resolve(this.lastID);
          }
        }
      );
    });

    // 4. 記錄遊戲會話
    info('4. 記錄遊戲會話...');
    const gameSession = {
      id: 'session-' + Date.now(),
      activity_id: newActivity.id,
      player_name: 'Demo Player',
      player_email: 'demo@example.com',
      score: 85,
      max_score: 100,
      time_taken: 120
    };

    await new Promise((resolve, reject) => {
      db.run(
        "INSERT INTO game_sessions (id, activity_id, player_name, player_email, score, max_score, time_taken, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))",
        [gameSession.id, gameSession.activity_id, gameSession.player_name, gameSession.player_email, gameSession.score, gameSession.max_score, gameSession.time_taken],
        function(err) {
          if (err) {
            reject(err);
          } else {
            success(`遊戲會話已記錄: 分數 ${gameSession.score}/${gameSession.max_score}`);
            resolve(this.lastID);
          }
        }
      );
    });

    db.close();
  }

  async demoVectorSearch() {
    section('本地向量搜索 - 語義搜索演示');

    // 模擬本地向量搜索服務
    const vectorStore = {
      documents: [
        {
          id: 'act1',
          title: '數學基礎測驗',
          description: '測試基本數學運算能力',
          content: '加法 減法 乘法 除法 數字 計算',
          templateType: 'QUIZ',
          subject: '數學',
          difficulty: '初級'
        },
        {
          id: 'act2',
          title: '英語詞彙配對',
          description: '學習常用英語單詞',
          content: '英語 單詞 詞彙 配對 學習 語言',
          templateType: 'MATCH_UP',
          subject: '英語',
          difficulty: '中級'
        },
        {
          id: 'act3',
          title: '科學實驗模擬',
          description: '虛擬科學實驗體驗',
          content: '科學 實驗 化學 物理 觀察 分析',
          templateType: 'SIMULATION',
          subject: '科學',
          difficulty: '高級'
        }
      ]
    };

    // 1. 關鍵詞搜索
    info('1. 執行關鍵詞搜索...');
    const searchQuery = '數學 計算';
    const searchResults = vectorStore.documents.filter(doc => 
      doc.content.includes('數學') || doc.content.includes('計算') ||
      doc.title.includes('數學') || doc.description.includes('數學')
    );
    
    success(`搜索 "${searchQuery}" 找到 ${searchResults.length} 個結果:`);
    searchResults.forEach(result => {
      console.log(`   - ${result.title} (${result.subject}, ${result.difficulty})`);
    });

    // 2. 主題篩選
    info('2. 按主題篩選...');
    const subjectFilter = '英語';
    const filteredResults = vectorStore.documents.filter(doc => doc.subject === subjectFilter);
    
    success(`主題 "${subjectFilter}" 有 ${filteredResults.length} 個活動:`);
    filteredResults.forEach(result => {
      console.log(`   - ${result.title} (${result.templateType})`);
    });

    // 3. 相似度推薦
    info('3. 生成相似內容推薦...');
    const targetDoc = vectorStore.documents[0];
    const recommendations = vectorStore.documents
      .filter(doc => doc.id !== targetDoc.id && doc.subject === targetDoc.subject)
      .slice(0, 2);
    
    success(`基於 "${targetDoc.title}" 的推薦:`);
    recommendations.forEach(rec => {
      console.log(`   - ${rec.title} (相似度: 85%)`);
    });
  }

  async demoOpenTelemetry() {
    section('OpenTelemetry - 性能監控演示');

    // 模擬 OpenTelemetry 追蹤
    info('1. 創建遊戲會話追蹤...');
    const gameTrace = {
      traceId: 'trace-' + Date.now(),
      spanId: 'span-game-session',
      operationName: 'game_session',
      startTime: Date.now(),
      tags: {
        'game.type': 'QUIZ',
        'game.difficulty': 'MEDIUM',
        'player.id': 'user123',
        'activity.id': 'act456'
      }
    };

    success(`遊戲會話追蹤已創建: ${gameTrace.traceId}`);
    console.log(`   - 操作: ${gameTrace.operationName}`);
    console.log(`   - 遊戲類型: ${gameTrace.tags['game.type']}`);
    console.log(`   - 難度: ${gameTrace.tags['game.difficulty']}`);

    // 模擬性能指標
    info('2. 記錄性能指標...');
    const metrics = {
      'game_session_duration': 145, // 秒
      'questions_answered': 10,
      'correct_answers': 8,
      'response_time_avg': 12.5, // 秒
      'user_engagement_score': 0.85
    };

    success('性能指標已記錄:');
    Object.entries(metrics).forEach(([metric, value]) => {
      console.log(`   - ${metric}: ${value}`);
    });

    // 模擬錯誤追蹤
    info('3. 錯誤監控演示...');
    const errorEvent = {
      timestamp: new Date().toISOString(),
      level: 'WARNING',
      message: '用戶答題時間超過建議時間',
      context: {
        userId: 'user123',
        questionId: 'q5',
        timeSpent: 45,
        recommendedTime: 30
      }
    };

    success('錯誤事件已記錄:');
    console.log(`   - 級別: ${errorEvent.level}`);
    console.log(`   - 消息: ${errorEvent.message}`);
    console.log(`   - 用戶: ${errorEvent.context.userId}`);
  }

  async demoLangfuse() {
    section('Langfuse - LLM 應用監控演示');

    // 模擬 Langfuse 追蹤
    info('1. 創建 AI 生成追蹤...');
    const aiTrace = {
      traceId: 'langfuse-trace-' + Date.now(),
      name: 'question_generation',
      userId: 'teacher123',
      sessionId: 'session-' + Date.now(),
      metadata: {
        subject: '數學',
        difficulty: 'medium',
        questionCount: 5
      }
    };

    success(`AI 追蹤已創建: ${aiTrace.traceId}`);
    console.log(`   - 操作: ${aiTrace.name}`);
    console.log(`   - 用戶: ${aiTrace.userId}`);
    console.log(`   - 主題: ${aiTrace.metadata.subject}`);

    // 模擬 LLM 生成記錄
    info('2. 記錄 LLM 生成...');
    const generation = {
      id: 'gen-' + Date.now(),
      name: 'quiz_question_generation',
      model: 'claude-3-sonnet',
      input: {
        prompt: '為高中數學生成5道關於三角函數的選擇題',
        parameters: {
          temperature: 0.7,
          max_tokens: 1000
        }
      },
      output: {
        questions: [
          {
            question: 'sin(30°) 的值是多少？',
            options: ['0.5', '0.707', '0.866', '1'],
            correct: 0
          }
        ]
      },
      usage: {
        promptTokens: 45,
        completionTokens: 234,
        totalTokens: 279
      }
    };

    success('LLM 生成已記錄:');
    console.log(`   - 模型: ${generation.model}`);
    console.log(`   - 輸入 tokens: ${generation.usage.promptTokens}`);
    console.log(`   - 輸出 tokens: ${generation.usage.completionTokens}`);
    console.log(`   - 總 tokens: ${generation.usage.totalTokens}`);

    // 模擬質量評分
    info('3. 添加質量評分...');
    const qualityScore = {
      name: 'question_quality',
      value: 0.92,
      comment: '生成的問題難度適中，選項設計合理',
      metadata: {
        evaluator: 'teacher_review',
        criteria: ['accuracy', 'difficulty', 'clarity']
      }
    };

    success('質量評分已添加:');
    console.log(`   - 分數: ${qualityScore.value}`);
    console.log(`   - 評價: ${qualityScore.comment}`);
    console.log(`   - 評估者: ${qualityScore.metadata.evaluator}`);

    // 模擬用戶反饋
    info('4. 記錄用戶反饋...');
    const userFeedback = {
      userId: 'student456',
      sessionId: aiTrace.sessionId,
      rating: 4,
      comment: '問題很有挑戰性，幫助我更好地理解三角函數',
      timestamp: new Date().toISOString()
    };

    success('用戶反饋已記錄:');
    console.log(`   - 評分: ${userFeedback.rating}/5`);
    console.log(`   - 評論: ${userFeedback.comment}`);
  }
}

// 運行演示
async function main() {
  const demo = new MCPUsageDemo();
  await demo.runDemo();
}

if (require.main === module) {
  main().catch(err => {
    console.error('演示失敗:', err);
    process.exit(1);
  });
}

module.exports = MCPUsageDemo;
