import { test, expect } from '@playwright/test';

test.describe('资料夹 API 修复测试', () => {
  test('删除资料夹后不应显示错误类型的资料夹', async ({ page }) => {
    // 导航到 my-results 页面
    await page.goto('https://edu-create.vercel.app/my-results');
    
    // 等待页面加载
    await page.waitForTimeout(3000);
    
    // 检查是否有登录按钮，如果有则点击演示登录
    const loginButton = page.locator('text=登入');
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await page.waitForTimeout(2000);
      
      // 查找演示登录选项
      const demoLogin = page.locator('text=演示登入');
      if (await demoLogin.isVisible()) {
        await demoLogin.click();
        await page.waitForTimeout(3000);
      }
    }
    
    // 等待页面完全加载
    await page.waitForTimeout(5000);
    
    // 记录初始状态
    console.log('📊 记录删除前的资料夹状态');
    const initialFolders = await page.locator('[data-testid="folder-card"], .folder-card').count();
    console.log(`初始资料夹数量: ${initialFolders}`);
    
    // 创建一个测试资料夹
    const createButton = page.locator('text=新增資料夾').first();
    if (await createButton.isVisible()) {
      await createButton.click();
      await page.waitForTimeout(1000);
      
      // 填写资料夹名称
      const nameInput = page.locator('input[placeholder*="資料夾名稱"], input[placeholder*="资料夹名称"]');
      await nameInput.fill('API修复测试资料夹');
      
      // 点击确认创建
      const confirmButton = page.locator('text=創建, text=确认, text=Create').first();
      await confirmButton.click();
      await page.waitForTimeout(3000);
    }
    
    // 查找刚创建的资料夹并删除
    const testFolder = page.locator('text=API修复测试资料夹').first();
    if (await testFolder.isVisible()) {
      // 右键点击或点击更多选项
      await testFolder.click({ button: 'right' });
      await page.waitForTimeout(1000);
      
      // 查找删除选项
      const deleteOption = page.locator('text=刪除, text=删除, text=Delete').first();
      if (await deleteOption.isVisible()) {
        await deleteOption.click();
        await page.waitForTimeout(1000);
        
        // 确认删除
        const confirmDelete = page.locator('text=確認, text=确认, text=Confirm').first();
        if (await confirmDelete.isVisible()) {
          await confirmDelete.click();
          await page.waitForTimeout(5000);
        }
      }
    }
    
    // 检查删除后的状态
    console.log('🔍 检查删除后的资料夹状态');
    
    // 等待页面更新
    await page.waitForTimeout(3000);
    
    // 检查是否有错误类型的资料夹显示
    const activityFolders = page.locator('text=活动资料夹, text=新活动资料夹, text=活动专用资料夹');
    const activityFolderCount = await activityFolders.count();
    
    console.log(`❌ 错误的活动类型资料夹数量: ${activityFolderCount}`);
    
    // 断言：不应该有活动类型的资料夹出现在 results 页面
    expect(activityFolderCount).toBe(0);
    
    // 检查页面是否正常显示结果类型的资料夹
    const resultsFolders = page.locator('[data-testid="folder-card"], .folder-card');
    const resultsFolderCount = await resultsFolders.count();
    
    console.log(`✅ 正确的结果类型资料夹数量: ${resultsFolderCount}`);
    
    // 截图记录最终状态
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/20251015_资料夹API修复_删除测试_success_v1_001.png`,
      fullPage: true 
    });
    
    console.log('✅ 测试完成：删除资料夹后没有显示错误类型的资料夹');
  });
  
  test('验证统一 API 管理器的网络请求', async ({ page }) => {
    // 监听网络请求
    const apiRequests: string[] = [];
    
    page.on('request', request => {
      const url = request.url();
      if (url.includes('/api/folders')) {
        apiRequests.push(url);
        console.log(`🔍 API 请求: ${url}`);
      }
    });
    
    // 导航到页面
    await page.goto('https://edu-create.vercel.app/my-results');
    await page.waitForTimeout(5000);
    
    // 检查所有 API 请求都包含 type 参数
    const invalidRequests = apiRequests.filter(url => 
      url.includes('/api/folders') && 
      !url.includes('type=') && 
      !url.includes('/api/folders/') // 排除特定资料夹的请求
    );
    
    console.log('📊 所有 API 请求:', apiRequests);
    console.log('❌ 无效请求（缺少 type 参数）:', invalidRequests);
    
    // 断言：不应该有缺少 type 参数的请求
    expect(invalidRequests.length).toBe(0);
    
    console.log('✅ 所有 API 请求都使用了正确的 type 参数');
  });
});
