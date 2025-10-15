import { test, expect } from '@playwright/test';

// 导入问题分析器
const { triggerProblemSolvingWorkflow } = require('../EduCreate-Test-Videos/scripts/automation/problem-analyzer.js');

test.describe('🚀 高效问题解决工作流集成测试', () => {
  
  test('自动检测并分析API调用不一致问题', async ({ page }) => {
    const detectedProblems: any[] = [];
    const apiCalls: string[] = [];
    
    console.log('🔍 [TEST] 开始监控API调用...');
    
    // 🔍 第一阶段：自动化问题检测
    page.on('request', request => {
      const url = request.url();
      apiCalls.push(url);
      
      // 检测API调用不一致问题
      if (url.includes('/api/folders') && 
          !url.includes('type=') && 
          !url.includes('/api/folders/') &&
          !url.includes('universal-content')) {
        console.error('🚨 [PROBLEM DETECTED] API调用缺少type参数:', url);
        detectedProblems.push({
          type: 'API_CALL_INCONSISTENCY',
          url,
          timestamp: new Date(),
          source: 'playwright-monitoring'
        });
      }
    });

    // 监控控制台错误
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('🚨 [CONSOLE ERROR]:', msg.text());
        detectedProblems.push({
          type: 'CONSOLE_ERROR',
          message: msg.text(),
          timestamp: new Date(),
          source: 'browser-console'
        });
      }
    });

    // 执行测试操作
    await page.goto('https://edu-create.vercel.app/my-results');
    await page.waitForTimeout(3000);
    
    // 检查是否需要登录
    await handleLoginIfNeeded(page);
    
    // 执行可能触发问题的操作
    await performFolderOperations(page);
    
    // 🔧 第二阶段：问题分析和解决方案生成
    if (detectedProblems.length > 0) {
      console.log(`🚨 [TEST] 检测到 ${detectedProblems.length} 个问题，启动分析流程...`);
      
      for (const problem of detectedProblems) {
        console.log(`🔍 [TEST] 分析问题: ${problem.type}`);
        
        const { analysis, solutionRecommendation } = await triggerProblemSolvingWorkflow(
          problem.type, 
          problem
        );
        
        console.log('📊 [TEST] 分析结果:', {
          problemId: analysis.id,
          rootCause: analysis.rootCause?.type,
          solution: solutionRecommendation.title,
          priority: solutionRecommendation.priority,
          estimatedTime: solutionRecommendation.estimatedTime
        });
        
        // 验证分析结果的质量
        expect(analysis.rootCause).toBeDefined();
        expect(analysis.suggestedSolution).toBeDefined();
        expect(solutionRecommendation.title).toBeDefined();
      }
    } else {
      console.log('✅ [TEST] 未检测到问题，系统运行正常');
    }
    
    // 🎯 第三阶段：验证系统状态
    await verifySystemHealth(page);
    
    // 生成测试报告
    await generateTestReport(detectedProblems, apiCalls);
  });

  test('检测资料夹类型显示错误问题', async ({ page }) => {
    console.log('🔍 [TEST] 检测资料夹类型显示问题...');
    
    await page.goto('https://edu-create.vercel.app/my-results');
    await page.waitForTimeout(3000);
    
    await handleLoginIfNeeded(page);
    
    // 检查是否显示了错误类型的资料夹
    const wrongTypeFolders = await page.locator('text=活动资料夹, text=新活动资料夹, text=活动专用资料夹').count();
    
    if (wrongTypeFolders > 0) {
      console.error('🚨 [PROBLEM DETECTED] 显示了错误类型的资料夹');
      
      const { analysis, solutionRecommendation } = await triggerProblemSolvingWorkflow(
        'WRONG_FOLDER_TYPE_DISPLAY',
        {
          expectedType: 'results',
          wrongCount: wrongTypeFolders,
          timestamp: new Date(),
          source: 'ui-validation'
        }
      );
      
      console.log('📊 [TEST] 资料夹类型问题分析:', {
        problemId: analysis.id,
        wrongCount: wrongTypeFolders,
        solution: solutionRecommendation.title
      });
      
      // 断言：这个问题应该被正确分析
      expect(analysis.rootCause.type).toBe('FOLDER_TYPE_DISPLAY_ERROR');
      expect(solutionRecommendation.priority).toBe('HIGH');
    } else {
      console.log('✅ [TEST] 资料夹类型显示正确');
    }
  });

  test('性能监控和问题检测', async ({ page }) => {
    console.log('🔍 [TEST] 监控页面性能...');
    
    const startTime = Date.now();
    
    await page.goto('https://edu-create.vercel.app/my-results');
    
    // 等待页面完全加载
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    console.log(`⏱️ [TEST] 页面加载时间: ${loadTime}ms`);
    
    // 检查性能指标
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        loadEventEnd: navigation.loadEventEnd,
        loadEventStart: navigation.loadEventStart,
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        totalLoadTime: navigation.loadEventEnd - navigation.navigationStart
      };
    });
    
    console.log('📊 [TEST] 性能指标:', metrics);
    
    // 如果加载时间过长，触发性能问题分析
    if (metrics.totalLoadTime > 5000) {
      console.error('🚨 [PROBLEM DETECTED] 页面加载时间过长');
      
      const { analysis, solutionRecommendation } = await triggerProblemSolvingWorkflow(
        'PERFORMANCE_ISSUE',
        {
          metrics,
          loadTime: metrics.totalLoadTime,
          timestamp: new Date(),
          source: 'performance-monitoring'
        }
      );
      
      console.log('📊 [TEST] 性能问题分析:', {
        problemId: analysis.id,
        loadTime: metrics.totalLoadTime,
        solution: solutionRecommendation.title
      });
      
      expect(analysis.rootCause.type).toBe('PERFORMANCE_DEGRADATION');
    } else {
      console.log('✅ [TEST] 页面性能正常');
    }
  });
});

// 辅助函数
async function handleLoginIfNeeded(page: any) {
  try {
    const loginButton = page.locator('[data-testid="login-button"]').first();
    if (await loginButton.isVisible({ timeout: 3000 })) {
      await loginButton.click();
      await page.waitForTimeout(2000);
      
      const demoLogin = page.locator('text=演示登入').first();
      if (await demoLogin.isVisible({ timeout: 3000 })) {
        await demoLogin.click();
        await page.waitForTimeout(3000);
      }
    }
  } catch (error) {
    console.log('ℹ️ [TEST] 无需登录或登录失败，继续测试');
  }
}

async function performFolderOperations(page: any) {
  try {
    console.log('🔄 [TEST] 执行资料夹操作...');
    
    // 尝试创建资料夹
    const createButton = page.locator('text=新增資料夾, text=新增资料夹').first();
    if (await createButton.isVisible({ timeout: 3000 })) {
      await createButton.click();
      await page.waitForTimeout(1000);
      
      const nameInput = page.locator('input[placeholder*="資料夾名稱"], input[placeholder*="资料夹名称"]');
      if (await nameInput.isVisible({ timeout: 2000 })) {
        await nameInput.fill('工作流测试资料夹');
        
        const confirmButton = page.locator('text=創建, text=确认, text=Create').first();
        if (await confirmButton.isVisible({ timeout: 2000 })) {
          await confirmButton.click();
          await page.waitForTimeout(3000);
        }
      }
    }
    
    // 尝试删除刚创建的资料夹
    const testFolder = page.locator('text=工作流测试资料夹').first();
    if (await testFolder.isVisible({ timeout: 3000 })) {
      await testFolder.click({ button: 'right' });
      await page.waitForTimeout(1000);
      
      const deleteOption = page.locator('text=刪除, text=删除, text=Delete').first();
      if (await deleteOption.isVisible({ timeout: 2000 })) {
        await deleteOption.click();
        await page.waitForTimeout(1000);
        
        const confirmDelete = page.locator('text=確認, text=确认, text=Confirm').first();
        if (await confirmDelete.isVisible({ timeout: 2000 })) {
          await confirmDelete.click();
          await page.waitForTimeout(5000);
        }
      }
    }
  } catch (error) {
    console.log('ℹ️ [TEST] 资料夹操作完成或跳过');
  }
}

async function verifySystemHealth(page: any) {
  console.log('🔍 [TEST] 验证系统健康状态...');
  
  // 检查页面是否正常渲染
  const pageTitle = await page.title();
  expect(pageTitle).toBeTruthy();
  
  // 检查是否有JavaScript错误
  const errors = await page.evaluate(() => {
    return (window as any).jsErrors || [];
  });
  
  if (errors.length > 0) {
    console.warn('⚠️ [TEST] 检测到JavaScript错误:', errors);
  }
  
  console.log('✅ [TEST] 系统健康检查完成');
}

async function generateTestReport(problems: any[], apiCalls: string[]) {
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalProblems: problems.length,
      totalApiCalls: apiCalls.length,
      testStatus: problems.length === 0 ? 'PASSED' : 'ISSUES_DETECTED'
    },
    problems: problems.map(p => ({
      type: p.type,
      timestamp: p.timestamp,
      source: p.source
    })),
    apiCalls: apiCalls.filter(url => url.includes('/api/')).slice(0, 10) // 只保留前10个API调用
  };
  
  console.log('📊 [TEST REPORT]', JSON.stringify(report, null, 2));
}
