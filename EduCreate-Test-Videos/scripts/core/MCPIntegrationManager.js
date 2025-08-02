// scripts/core/MCPIntegrationManager.js
const fs = require('fs');
const path = require('path');

class MCPIntegrationManager {
  constructor() {
    this.langfuseTracesDir = 'EduCreate-Test-Videos/mcp-integration/langfuse-traces';
    this.sequentialThinkingDir = 'EduCreate-Test-Videos/mcp-integration/sequential-thinking';
    this.feedbackCollectionDir = 'EduCreate-Test-Videos/mcp-integration/feedback-collection';
    
    this.ensureDirectories();
  }

  // 確保目錄存在
  ensureDirectories() {
    [this.langfuseTracesDir, this.sequentialThinkingDir, this.feedbackCollectionDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // 整合 Langfuse MCP - 記錄測試 trace 和決策
  async integrateWithLangfuse(videoMetadata) {
    try {
      const traceId = `trace_${videoMetadata.videoId}`;
      
      // 創建主要 trace
      const trace = {
        id: traceId,
        name: `${videoMetadata.feature} 測試追蹤`,
        metadata: {
          module: videoMetadata.module,
          feature: videoMetadata.feature,
          version: videoMetadata.version,
          result: videoMetadata.result,
          videoPath: videoMetadata.path
        },
        startTime: new Date(videoMetadata.testDate).toISOString(),
        endTime: new Date(new Date(videoMetadata.testDate).getTime() + (videoMetadata.duration * 1000)).toISOString(),
        spans: [],
        observations: [],
        scores: this.calculateTestScores(videoMetadata),
        tags: this.generateTags(videoMetadata)
      };

      // 為每個測試階段創建 span
      for (const [index, stage] of videoMetadata.testStages.entries()) {
        const span = {
          id: `span_${traceId}_${stage.stage}`,
          traceId: traceId,
          name: `階段 ${stage.stage}: ${stage.name}`,
          startTime: new Date(stage.timestamp).toISOString(),
          endTime: new Date(new Date(stage.timestamp).getTime() + 5000).toISOString(), // 估計5秒持續時間
          metadata: {
            stageNumber: stage.stage,
            stageName: stage.name,
            result: stage.result,
            isMemoryScience: this.isMemoryScienceStage(stage.name),
            isGEPTRelated: this.isGEPTRelated(stage.name)
          },
          level: stage.result === 'pass' ? 'DEFAULT' : 'ERROR',
          statusMessage: stage.result === 'pass' ? '階段成功完成' : '階段執行失敗'
        };

        // 如果階段失敗，添加錯誤信息
        if (stage.result === 'fail') {
          span.error = {
            message: `階段 ${stage.stage} 失敗`,
            stack: stage.error || '未提供詳細錯誤信息',
            metadata: {
              stageName: stage.name,
              failureType: this.categorizeStageFailure(stage),
              suggestedFix: this.suggestStageFix(stage)
            }
          };
        }

        trace.spans.push(span);
      }

      // 添加 Agent 決策記錄
      trace.observations = this.generateAgentDecisions(videoMetadata);

      // 保存 trace 到本地文件
      const monthDir = path.join(this.langfuseTracesDir, new Date().toISOString().slice(0, 7));
      if (!fs.existsSync(monthDir)) {
        fs.mkdirSync(monthDir, { recursive: true });
      }

      const tracePath = path.join(monthDir, `${traceId}.json`);
      fs.writeFileSync(tracePath, JSON.stringify(trace, null, 2));

      console.log(`✅ Langfuse 追蹤已記錄: ${traceId}`);
      return traceId;

    } catch (error) {
      console.error('❌ Langfuse 整合失敗:', error);
      throw error;
    }
  }

  // 整合 sequential-thinking - 記錄測試流程步驟
  async integrateWithSequentialThinking(videoMetadata) {
    try {
      const sequenceId = `st_${videoMetadata.videoId}`;
      
      const thoughts = [];
      let thoughtNumber = 1;

      // 初始思考：測試準備
      thoughts.push({
        thought: `開始 ${videoMetadata.feature} 測試\n\n測試目標：驗證 ${videoMetadata.feature} 功能的完整性和用戶體驗\n模組：${videoMetadata.module}\n版本：${videoMetadata.version}\n\n基於記憶科學原理，這個測試將驗證：\n- 主動回憶機制的實現\n- 間隔重複算法的效果\n- 認知負荷的適當管理`,
        thoughtNumber: thoughtNumber++,
        totalThoughts: videoMetadata.testStages.length + 2, // +2 for preparation and conclusion
        nextThoughtNeeded: true,
        isRevision: false,
        metadata: {
          stage: 'preparation',
          module: videoMetadata.module,
          feature: videoMetadata.feature
        }
      });

      // 為每個測試階段創建思考步驟
      for (const stage of videoMetadata.testStages) {
        const stageThought = {
          thought: this.generateStageThought(stage, videoMetadata),
          thoughtNumber: thoughtNumber++,
          totalThoughts: videoMetadata.testStages.length + 2,
          nextThoughtNeeded: thoughtNumber <= videoMetadata.testStages.length + 1,
          isRevision: false,
          metadata: {
            stage: 'execution',
            stageNumber: stage.stage,
            stageName: stage.name,
            result: stage.result,
            timestamp: stage.timestamp
          }
        };

        // 如果階段失敗，添加修正思考
        if (stage.result === 'fail') {
          stageThought.isRevision = true;
          stageThought.thought += `\n\n🔄 修正思考：\n${this.generateRevisionThought(stage)}`;
        }

        thoughts.push(stageThought);
      }

      // 結論思考：測試總結
      thoughts.push({
        thought: this.generateConclusionThought(videoMetadata),
        thoughtNumber: thoughtNumber,
        totalThoughts: videoMetadata.testStages.length + 2,
        nextThoughtNeeded: false,
        isRevision: false,
        metadata: {
          stage: 'conclusion',
          result: videoMetadata.result,
          successRate: this.calculateSuccessRate(videoMetadata)
        }
      });

      // 創建完整的 sequential thinking 記錄
      const sequentialRecord = {
        sequenceId,
        videoId: videoMetadata.videoId,
        module: videoMetadata.module,
        feature: videoMetadata.feature,
        testName: `${videoMetadata.feature} 測試流程思考`,
        thoughts,
        summary: {
          totalThoughts: thoughts.length,
          revisionCount: thoughts.filter(t => t.isRevision).length,
          testResult: videoMetadata.result,
          keyInsights: this.extractThinkingInsights(thoughts, videoMetadata)
        },
        createdAt: new Date().toISOString(),
        metadata: {
          isMemoryScienceTest: videoMetadata.module === 'games',
          isGEPTTest: this.isGEPTRelated(videoMetadata.feature),
          testComplexity: this.assessTestComplexity(videoMetadata)
        }
      };

      // 保存到本地文件
      const moduleDir = path.join(this.sequentialThinkingDir, videoMetadata.module);
      if (!fs.existsSync(moduleDir)) {
        fs.mkdirSync(moduleDir, { recursive: true });
      }

      const sequencePath = path.join(moduleDir, `${sequenceId}.json`);
      fs.writeFileSync(sequencePath, JSON.stringify(sequentialRecord, null, 2));

      console.log(`✅ Sequential Thinking 記錄已保存: ${sequenceId}`);
      return sequenceId;

    } catch (error) {
      console.error('❌ Sequential Thinking 整合失敗:', error);
      throw error;
    }
  }

  // 可選：整合 mcp-feedback-collector - 收集失敗測試反饋
  async integrateWithFeedbackCollector(videoMetadata) {
    if (videoMetadata.result !== 'failure') {
      return null; // 只對失敗測試收集反饋
    }

    try {
      const feedbackId = `feedback_${videoMetadata.videoId}`;
      
      const failedStages = videoMetadata.testStages.filter(s => s.result === 'fail');
      
      const feedbackRequest = {
        feedbackId,
        videoId: videoMetadata.videoId,
        module: videoMetadata.module,
        feature: videoMetadata.feature,
        testName: `${videoMetadata.feature} 測試反饋收集`,
        failureContext: {
          totalStages: videoMetadata.testStages.length,
          failedStages: failedStages.length,
          failedStageNames: failedStages.map(s => s.name),
          testDuration: videoMetadata.duration,
          videoPath: videoMetadata.path
        },
        workSummary: this.generateWorkSummary(videoMetadata, failedStages),
        questions: this.generateFeedbackQuestions(failedStages),
        createdAt: new Date().toISOString(),
        status: 'pending'
      };

      // 保存反饋請求
      const monthDir = path.join(this.feedbackCollectionDir, 'failure-feedback', new Date().toISOString().slice(0, 7));
      if (!fs.existsSync(monthDir)) {
        fs.mkdirSync(monthDir, { recursive: true });
      }

      const feedbackPath = path.join(monthDir, `${feedbackId}.json`);
      fs.writeFileSync(feedbackPath, JSON.stringify(feedbackRequest, null, 2));

      console.log(`✅ 反饋收集請求已創建: ${feedbackId}`);
      return feedbackId;

    } catch (error) {
      console.error('❌ Feedback Collector 整合失敗:', error);
      throw error;
    }
  }

  // 輔助方法
  calculateTestScores(videoMetadata) {
    const passedStages = videoMetadata.testStages.filter(s => s.result === 'pass').length;
    const totalStages = videoMetadata.testStages.length;
    const successRate = totalStages > 0 ? (passedStages / totalStages) : 0;

    return [
      {
        name: 'test_success_rate',
        value: successRate,
        comment: `測試成功率: ${(successRate * 100).toFixed(1)}%`
      },
      {
        name: 'memory_science_compliance',
        value: this.assessMemoryScienceCompliance(videoMetadata),
        comment: '記憶科學原理符合度'
      },
      {
        name: 'user_experience_quality',
        value: this.assessUserExperience(videoMetadata),
        comment: '用戶體驗質量評分'
      }
    ];
  }

  generateTags(videoMetadata) {
    const tags = [videoMetadata.module, videoMetadata.feature, videoMetadata.result];
    
    if (videoMetadata.module === 'games') {
      tags.push('memory-science', 'educational-game');
    }
    
    if (this.isGEPTRelated(videoMetadata.feature)) {
      tags.push('gept-grading', 'language-learning');
    }
    
    return tags;
  }

  isMemoryScienceStage(stageName) {
    const memoryScienceKeywords = ['記憶', '重複', '回憶', '認知', '學習'];
    return memoryScienceKeywords.some(keyword => stageName.includes(keyword));
  }

  isGEPTRelated(featureName) {
    return featureName.toLowerCase().includes('gept') || 
           featureName.includes('分級') || 
           featureName.includes('詞彙');
  }

  categorizeStageFailure(stage) {
    if (stage.name.includes('UI') || stage.name.includes('界面')) return 'ui_failure';
    if (stage.name.includes('功能') || stage.name.includes('邏輯')) return 'logic_failure';
    if (stage.name.includes('性能')) return 'performance_failure';
    return 'unknown_failure';
  }

  suggestStageFix(stage) {
    const failureType = this.categorizeStageFailure(stage);
    
    switch (failureType) {
      case 'ui_failure':
        return '檢查UI元素的可見性和交互邏輯';
      case 'logic_failure':
        return '驗證業務邏輯實現和數據流';
      case 'performance_failure':
        return '優化性能瓶頸和資源使用';
      default:
        return '進行詳細的錯誤分析和調試';
    }
  }

  generateAgentDecisions(videoMetadata) {
    const decisions = [];
    
    // 測試策略決策
    decisions.push({
      type: 'strategy_decision',
      timestamp: new Date(videoMetadata.testDate).toISOString(),
      decision: `選擇 ${videoMetadata.module} 模組的 ${videoMetadata.feature} 功能進行測試`,
      reasoning: '基於開發優先級和功能重要性',
      outcome: videoMetadata.result
    });

    // 失敗處理決策
    const failedStages = videoMetadata.testStages.filter(s => s.result === 'fail');
    if (failedStages.length > 0) {
      decisions.push({
        type: 'failure_handling_decision',
        timestamp: new Date().toISOString(),
        decision: `識別到 ${failedStages.length} 個失敗階段，決定進行詳細分析`,
        reasoning: '失敗階段需要深入分析以改進系統',
        outcome: 'analysis_initiated'
      });
    }

    return decisions;
  }

  generateStageThought(stage, videoMetadata) {
    const baseThought = `階段 ${stage.stage}: ${stage.name}\n\n`;
    
    let thought = baseThought;
    
    if (stage.result === 'pass') {
      thought += `✅ 測試結果: 通過\n\n`;
      thought += `在這個階段，我成功驗證了：\n`;
      thought += `- ${stage.name}功能正常運作\n`;
      thought += `- 用戶界面響應正確\n`;
      thought += `- 功能邏輯符合預期\n\n`;
      
      if (videoMetadata.module === 'games') {
        thought += `記憶科學角度分析：\n`;
        thought += `- 主動回憶機制運作正常\n`;
        thought += `- 認知負荷適中，有利於學習\n`;
      }
    } else {
      thought += `❌ 測試結果: 失敗\n\n`;
      thought += `失敗原因分析：\n`;
      thought += `- ${stage.error || '未知錯誤'}\n`;
      thought += `- 需要進一步調查和修復\n\n`;
      thought += `影響評估：\n`;
      thought += `- 功能可用性受影響\n`;
      thought += `- 用戶體驗需要改進\n`;
    }
    
    return thought;
  }

  generateRevisionThought(stage) {
    return `經過分析，${stage.name}階段的失敗可能是由於：\n` +
           `1. ${this.suggestStageFix(stage)}\n` +
           `2. 測試環境或數據的問題\n` +
           `3. 功能實現中的邊界情況\n\n` +
           `建議的修復策略：\n` +
           `- 詳細檢查相關代碼邏輯\n` +
           `- 驗證測試數據和環境配置\n` +
           `- 考慮添加更多的錯誤處理機制`;
  }

  generateConclusionThought(videoMetadata) {
    const passedStages = videoMetadata.testStages.filter(s => s.result === 'pass').length;
    const totalStages = videoMetadata.testStages.length;
    const successRate = ((passedStages / totalStages) * 100).toFixed(1);
    
    let conclusion = `🎯 ${videoMetadata.feature} 測試總結\n\n`;
    conclusion += `測試結果：${videoMetadata.result === 'success' ? '成功 ✅' : '失敗 ❌'}\n`;
    conclusion += `完成度：${passedStages}/${totalStages} 階段 (${successRate}%)\n\n`;
    
    if (videoMetadata.result === 'success') {
      conclusion += `🎉 測試成功完成！\n\n`;
      conclusion += `主要成就：\n`;
      conclusion += `- 所有核心功能正常運作\n`;
      conclusion += `- 用戶體驗符合預期\n`;
      conclusion += `- 記憶科學原理得到有效實現\n\n`;
    } else {
      conclusion += `⚠️ 測試發現問題，需要改進\n\n`;
      conclusion += `主要問題：\n`;
      const failedStages = videoMetadata.testStages.filter(s => s.result === 'fail');
      failedStages.forEach(stage => {
        conclusion += `- ${stage.name}：${stage.error || '需要進一步分析'}\n`;
      });
      conclusion += `\n`;
    }
    
    conclusion += `下一步行動：\n`;
    if (videoMetadata.result === 'success') {
      conclusion += `- 繼續開發下一個功能模組\n`;
      conclusion += `- 考慮性能優化和用戶體驗提升\n`;
    } else {
      conclusion += `- 修復識別出的問題\n`;
      conclusion += `- 重新執行測試驗證修復效果\n`;
      conclusion += `- 考慮改進測試策略和覆蓋範圍\n`;
    }
    
    return conclusion;
  }

  extractThinkingInsights(thoughts, videoMetadata) {
    const insights = [];
    
    // 從思考過程中提取洞察
    const revisionThoughts = thoughts.filter(t => t.isRevision);
    if (revisionThoughts.length > 0) {
      insights.push(`測試過程中進行了 ${revisionThoughts.length} 次修正思考`);
    }
    
    if (videoMetadata.module === 'games') {
      insights.push('記憶科學遊戲邏輯得到驗證');
    }
    
    if (videoMetadata.result === 'success') {
      insights.push('測試流程思考邏輯清晰，結果符合預期');
    } else {
      insights.push('測試失敗提供了寶貴的改進方向');
    }
    
    return insights;
  }

  assessTestComplexity(videoMetadata) {
    const stageCount = videoMetadata.testStages.length;
    const failureCount = videoMetadata.testStages.filter(s => s.result === 'fail').length;
    
    if (stageCount > 10 || failureCount > 3) return 'high';
    if (stageCount > 5 || failureCount > 1) return 'medium';
    return 'low';
  }

  generateWorkSummary(videoMetadata, failedStages) {
    return `測試 "${videoMetadata.feature}" 失敗\n` +
           `模組: ${videoMetadata.module}\n` +
           `版本: ${videoMetadata.version}\n` +
           `測試日期: ${new Date(videoMetadata.testDate).toLocaleString()}\n\n` +
           `失敗階段:\n` +
           failedStages.map(s => `- 階段 ${s.stage}: ${s.name}`).join('\n') + '\n\n' +
           `請提供失敗原因和改進建議：`;
  }

  generateFeedbackQuestions(failedStages) {
    return [
      '這些失敗是否符合預期？',
      '主要的失敗原因是什麼？',
      '建議的修復優先級是什麼？',
      '是否需要調整測試策略？',
      '對未來測試有什麼建議？'
    ];
  }

  assessMemoryScienceCompliance(videoMetadata) {
    if (videoMetadata.module !== 'games') return 0.5;
    
    const passedStages = videoMetadata.testStages.filter(s => s.result === 'pass').length;
    const totalStages = videoMetadata.testStages.length;
    
    return passedStages / totalStages;
  }

  assessUserExperience(videoMetadata) {
    const uiStages = videoMetadata.testStages.filter(s => 
      s.name.includes('界面') || s.name.includes('導航') || s.name.includes('交互')
    );
    
    if (uiStages.length === 0) return 0.7; // 默認分數
    
    const passedUIStages = uiStages.filter(s => s.result === 'pass').length;
    return passedUIStages / uiStages.length;
  }

  calculateSuccessRate(videoMetadata) {
    const passedStages = videoMetadata.testStages.filter(s => s.result === 'pass').length;
    const totalStages = videoMetadata.testStages.length;
    return ((passedStages / totalStages) * 100).toFixed(1);
  }
}

module.exports = MCPIntegrationManager;
