/**
 * 自动化问题分析器
 * 集成高效问题解决策略到 Playwright 工作流中
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class ProblemAnalyzer {
  constructor() {
    this.problemsDir = path.join(__dirname, '../../../EduCreate-Test-Videos/local-memory');
    this.reportsDir = path.join(__dirname, '../../../EduCreate-Test-Videos/reports');
    this.ensureDirectories();
  }

  async ensureDirectories() {
    try {
      await fs.mkdir(this.problemsDir, { recursive: true });
      await fs.mkdir(this.reportsDir, { recursive: true });
    } catch (error) {
      console.error('创建目录失败:', error);
    }
  }

  /**
   * 分析检测到的问题
   */
  async analyzeProblem(problemType, context) {
    console.log(`🔍 [ANALYZER] 开始分析问题类型: ${problemType}`);
    console.log(`🔍 [ANALYZER] 上下文:`, context);
    
    const analysis = {
      id: this.generateProblemId(),
      timestamp: new Date().toISOString(),
      problemType,
      context,
      rootCause: null,
      suggestedSolution: null,
      priority: this.calculatePriority(problemType),
      analysisTime: Date.now()
    };

    try {
      switch (problemType) {
        case 'API_CALL_INCONSISTENCY':
          analysis.rootCause = await this.analyzeApiInconsistency(context);
          analysis.suggestedSolution = 'UNIFIED_API_MANAGER';
          break;
          
        case 'WRONG_FOLDER_TYPE_DISPLAY':
          analysis.rootCause = await this.analyzeFolderTypeIssue(context);
          analysis.suggestedSolution = 'TYPE_PARAMETER_ENFORCEMENT';
          break;
          
        case 'PERFORMANCE_ISSUE':
          analysis.rootCause = await this.analyzePerformanceIssue(context);
          analysis.suggestedSolution = 'PERFORMANCE_OPTIMIZATION';
          break;

        case 'UI_STATE_INCONSISTENCY':
          analysis.rootCause = await this.analyzeUIStateIssue(context);
          analysis.suggestedSolution = 'STATE_MANAGEMENT_FIX';
          break;

        default:
          analysis.rootCause = await this.analyzeGenericIssue(context);
          analysis.suggestedSolution = 'GENERIC_INVESTIGATION';
      }

      analysis.analysisTime = Date.now() - analysis.analysisTime;
      
      // 保存分析结果
      await this.saveAnalysis(analysis);
      
      console.log(`✅ [ANALYZER] 分析完成，耗时: ${analysis.analysisTime}ms`);
      return analysis;
      
    } catch (error) {
      console.error(`❌ [ANALYZER] 分析失败:`, error);
      analysis.error = error.message;
      await this.saveAnalysis(analysis);
      return analysis;
    }
  }

  /**
   * 分析 API 调用不一致问题
   */
  async analyzeApiInconsistency(context) {
    console.log('🔍 [ANALYZER] 分析 API 调用不一致问题...');
    
    try {
      // 搜索所有相关的 API 调用
      const searchResults = execSync(
        'grep -r "/api/folders" --include="*.tsx" --include="*.ts" . || echo "No matches found"', 
        { encoding: 'utf8', cwd: process.cwd() }
      );
      
      const affectedFiles = this.extractAffectedFiles(searchResults);
      const inconsistentCalls = this.findInconsistentCalls(searchResults);
      
      return {
        type: 'FRONTEND_API_INCONSISTENCY',
        evidence: searchResults,
        affectedFiles,
        inconsistentCalls,
        recommendation: 'CREATE_UNIFIED_API_MANAGER',
        severity: inconsistentCalls.length > 3 ? 'HIGH' : 'MEDIUM'
      };
    } catch (error) {
      return {
        type: 'ANALYSIS_ERROR',
        error: error.message,
        recommendation: 'MANUAL_INVESTIGATION'
      };
    }
  }

  /**
   * 分析资料夹类型显示问题
   */
  async analyzeFolderTypeIssue(context) {
    console.log('🔍 [ANALYZER] 分析资料夹类型显示问题...');
    
    return {
      type: 'FOLDER_TYPE_DISPLAY_ERROR',
      expectedType: context.expectedType,
      actualWrongCount: context.wrongCount,
      possibleCauses: [
        'API调用缺少type参数',
        '前端状态管理错误',
        '数据过滤逻辑缺失'
      ],
      recommendation: 'ENFORCE_TYPE_PARAMETERS',
      severity: 'HIGH'
    };
  }

  /**
   * 分析性能问题
   */
  async analyzePerformanceIssue(context) {
    console.log('🔍 [ANALYZER] 分析性能问题...');
    
    const metrics = context.metrics;
    const loadTime = metrics.loadEventEnd - metrics.loadEventStart;
    
    return {
      type: 'PERFORMANCE_DEGRADATION',
      loadTime,
      threshold: 5000,
      possibleCauses: [
        '资源加载过慢',
        'API响应时间长',
        '前端渲染阻塞',
        '内存泄漏'
      ],
      recommendation: loadTime > 10000 ? 'CRITICAL_OPTIMIZATION' : 'PERFORMANCE_TUNING',
      severity: loadTime > 10000 ? 'CRITICAL' : 'HIGH'
    };
  }

  /**
   * 分析UI状态不一致问题
   */
  async analyzeUIStateIssue(context) {
    console.log('🔍 [ANALYZER] 分析UI状态不一致问题...');
    
    return {
      type: 'UI_STATE_INCONSISTENCY',
      context,
      possibleCauses: [
        'React状态更新异步问题',
        '组件生命周期管理错误',
        '全局状态同步问题'
      ],
      recommendation: 'STATE_MANAGEMENT_REVIEW',
      severity: 'MEDIUM'
    };
  }

  /**
   * 通用问题分析
   */
  async analyzeGenericIssue(context) {
    console.log('🔍 [ANALYZER] 执行通用问题分析...');
    
    return {
      type: 'GENERIC_ISSUE',
      context,
      recommendation: 'DETAILED_INVESTIGATION_REQUIRED',
      severity: 'MEDIUM'
    };
  }

  /**
   * 提取受影响的文件
   */
  extractAffectedFiles(searchResults) {
    const lines = searchResults.split('\n').filter(line => line.trim());
    const files = new Set();
    
    lines.forEach(line => {
      const match = line.match(/^([^:]+):/);
      if (match) {
        files.add(match[1]);
      }
    });
    
    return Array.from(files);
  }

  /**
   * 查找不一致的API调用
   */
  findInconsistentCalls(searchResults) {
    const lines = searchResults.split('\n').filter(line => line.trim());
    const inconsistent = [];
    
    lines.forEach(line => {
      if (line.includes('/api/folders') && 
          !line.includes('type=') && 
          !line.includes('/api/folders/')) {
        inconsistent.push(line.trim());
      }
    });
    
    return inconsistent;
  }

  /**
   * 计算问题优先级
   */
  calculatePriority(problemType) {
    const priorityMap = {
      'API_CALL_INCONSISTENCY': 'HIGH',
      'WRONG_FOLDER_TYPE_DISPLAY': 'HIGH',
      'PERFORMANCE_ISSUE': 'MEDIUM',
      'UI_STATE_INCONSISTENCY': 'MEDIUM'
    };
    
    return priorityMap[problemType] || 'LOW';
  }

  /**
   * 生成问题ID
   */
  generateProblemId() {
    return `PROB_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 保存分析结果
   */
  async saveAnalysis(analysis) {
    try {
      const filename = `problem-analysis-${analysis.id}.json`;
      const filepath = path.join(this.problemsDir, filename);
      
      await fs.writeFile(filepath, JSON.stringify(analysis, null, 2));
      console.log(`💾 [ANALYZER] 分析结果已保存: ${filename}`);
      
      // 同时更新汇总文件
      await this.updateSummary(analysis);
      
    } catch (error) {
      console.error('❌ [ANALYZER] 保存分析结果失败:', error);
    }
  }

  /**
   * 更新问题汇总
   */
  async updateSummary(analysis) {
    try {
      const summaryPath = path.join(this.problemsDir, 'problem-summary.json');
      let summary = { problems: [], lastUpdated: null };
      
      try {
        const existing = await fs.readFile(summaryPath, 'utf8');
        summary = JSON.parse(existing);
      } catch (error) {
        // 文件不存在，使用默认值
      }
      
      summary.problems.push({
        id: analysis.id,
        type: analysis.problemType,
        timestamp: analysis.timestamp,
        priority: analysis.priority,
        status: 'ANALYZED'
      });
      
      summary.lastUpdated = new Date().toISOString();
      
      await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));
      
    } catch (error) {
      console.error('❌ [ANALYZER] 更新汇总失败:', error);
    }
  }

  /**
   * 获取历史问题分析
   */
  async getHistoricalAnalysis(problemType) {
    try {
      const summaryPath = path.join(this.problemsDir, 'problem-summary.json');
      const summary = JSON.parse(await fs.readFile(summaryPath, 'utf8'));
      
      return summary.problems.filter(p => p.type === problemType);
    } catch (error) {
      return [];
    }
  }
}

/**
 * 触发问题解决工作流
 */
async function triggerProblemSolvingWorkflow(problemType, context) {
  console.log(`🚨 [WORKFLOW] 触发问题解决工作流: ${problemType}`);

  const analyzer = new ProblemAnalyzer();
  const analysis = await analyzer.analyzeProblem(problemType, context);

  // 生成解决方案建议
  const solutionRecommendation = await generateSolutionRecommendation(analysis);

  // 记录到测试报告
  await recordProblemForReport(analysis, solutionRecommendation);

  return { analysis, solutionRecommendation };
}

/**
 * 生成解决方案建议
 */
async function generateSolutionRecommendation(analysis) {
  const recommendations = {
    'UNIFIED_API_MANAGER': {
      title: '创建统一API管理器',
      description: '创建 FolderApiManager 类统一管理所有资料夹API调用',
      files: ['lib/api/folderApiManager.ts'],
      priority: 'HIGH',
      estimatedTime: '30分钟'
    },
    'TYPE_PARAMETER_ENFORCEMENT': {
      title: 'API类型参数强制验证',
      description: '在API端点强制要求type参数',
      files: ['app/api/folders/route.ts'],
      priority: 'HIGH',
      estimatedTime: '15分钟'
    },
    'PERFORMANCE_OPTIMIZATION': {
      title: '性能优化',
      description: '优化页面加载性能和资源使用',
      files: ['多个文件'],
      priority: 'MEDIUM',
      estimatedTime: '60分钟'
    }
  };

  return recommendations[analysis.suggestedSolution] || {
    title: '需要详细调查',
    description: '问题需要进一步分析',
    priority: 'MEDIUM',
    estimatedTime: '未知'
  };
}

/**
 * 记录问题到报告系统
 */
async function recordProblemForReport(analysis, solution) {
  const reportData = {
    timestamp: new Date().toISOString(),
    problemId: analysis.id,
    type: analysis.problemType,
    severity: analysis.priority,
    rootCause: analysis.rootCause,
    solution: solution,
    status: 'DETECTED'
  };

  // 这里可以集成到现有的报告系统
  console.log('📝 [REPORT] 问题已记录到报告系统:', reportData);
}

module.exports = {
  ProblemAnalyzer,
  triggerProblemSolvingWorkflow,
  generateSolutionRecommendation,
  recordProblemForReport
};

// 如果直接运行此脚本
if (require.main === module) {
  const analyzer = new ProblemAnalyzer();

  // 示例：分析一个API不一致问题
  analyzer.analyzeProblem('API_CALL_INCONSISTENCY', {
    url: '/api/folders',
    timestamp: new Date(),
    source: 'playwright-test'
  }).then(result => {
    console.log('🎯 分析结果:', result);
  }).catch(error => {
    console.error('❌ 分析失败:', error);
  });
}
