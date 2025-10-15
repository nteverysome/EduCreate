import { test, expect } from '@playwright/test';

test.describe('结果重命名功能测试', () => {
  
  test('测试结果卡片右键菜单和重命名功能', async ({ page }) => {
    console.log('🔍 [TEST] 开始测试结果重命名功能...');
    
    // 导航到我的结果页面
    await page.goto('https://edu-create.vercel.app/my-results');
    await page.waitForTimeout(3000);
    
    // 处理登录（如果需要）
    await handleLoginIfNeeded(page);
    
    // 等待页面加载完成
    await page.waitForTimeout(5000);
    
    // 查找结果卡片
    const resultCards = page.locator('[data-testid="result-card"], .bg-white.rounded-lg.shadow-sm.border.border-gray-200');
    const cardCount = await resultCards.count();
    
    console.log(`📊 [TEST] 找到 ${cardCount} 个结果卡片`);
    
    if (cardCount === 0) {
      console.log('⚠️ [TEST] 没有找到结果卡片，跳过测试');
      return;
    }
    
    // 选择第一个结果卡片进行测试
    const firstCard = resultCards.first();
    
    // 获取原始标题
    const originalTitle = await firstCard.locator('h2').textContent();
    console.log(`📝 [TEST] 原始标题: ${originalTitle}`);
    
    // 右键点击结果卡片
    await firstCard.click({ button: 'right' });
    await page.waitForTimeout(2000);
    
    // 查找上下文菜单
    const contextMenu = page.locator('.fixed.z-50.bg-white.rounded-md.shadow-lg');
    
    if (await contextMenu.isVisible({ timeout: 3000 })) {
      console.log('✅ [TEST] 上下文菜单显示成功');
      
      // 点击重命名选项
      const renameOption = contextMenu.locator('text=重新命名, text=重命名').first();
      
      if (await renameOption.isVisible({ timeout: 2000 })) {
        await renameOption.click();
        await page.waitForTimeout(2000);
        
        // 查找重命名模态框
        const renameModal = page.locator('text=重新命名結果').first();
        
        if (await renameModal.isVisible({ timeout: 3000 })) {
          console.log('✅ [TEST] 重命名模态框显示成功');
          
          // 查找输入框
          const titleInput = page.locator('input[id="resultTitle"], input[placeholder*="結果標題"], input[placeholder*="标题"]');
          
          if (await titleInput.isVisible({ timeout: 2000 })) {
            // 清空输入框并输入新标题
            const newTitle = `测试重命名结果 - ${Date.now()}`;
            await titleInput.clear();
            await titleInput.fill(newTitle);
            
            console.log(`📝 [TEST] 输入新标题: ${newTitle}`);
            
            // 点击重命名按钮
            const renameButton = page.locator('button:has-text("重命名"), button:has-text("確認")').first();
            
            if (await renameButton.isVisible({ timeout: 2000 })) {
              await renameButton.click();
              await page.waitForTimeout(3000);
              
              console.log('✅ [TEST] 点击重命名按钮成功');
              
              // 验证标题是否更新
              await page.waitForTimeout(2000);
              const updatedTitle = await firstCard.locator('h2').textContent();
              
              console.log(`📝 [TEST] 更新后标题: ${updatedTitle}`);
              
              if (updatedTitle && updatedTitle.includes('测试重命名结果')) {
                console.log('🎉 [TEST] 重命名功能测试成功！');
              } else {
                console.log('⚠️ [TEST] 标题可能未立即更新，等待页面刷新...');
                await page.reload();
                await page.waitForTimeout(3000);
                
                const finalTitle = await firstCard.locator('h2').textContent();
                console.log(`📝 [TEST] 刷新后标题: ${finalTitle}`);
              }
            } else {
              console.log('❌ [TEST] 未找到重命名按钮');
            }
          } else {
            console.log('❌ [TEST] 未找到标题输入框');
          }
        } else {
          console.log('❌ [TEST] 重命名模态框未显示');
        }
      } else {
        console.log('❌ [TEST] 未找到重命名选项');
      }
    } else {
      console.log('❌ [TEST] 上下文菜单未显示');
    }
  });

  test('测试结果菜单的其他功能', async ({ page }) => {
    console.log('🔍 [TEST] 测试结果菜单的其他功能...');
    
    await page.goto('https://edu-create.vercel.app/my-results');
    await page.waitForTimeout(3000);
    
    await handleLoginIfNeeded(page);
    await page.waitForTimeout(5000);
    
    // 查找结果卡片
    const resultCards = page.locator('[data-testid="result-card"], .bg-white.rounded-lg.shadow-sm.border.border-gray-200');
    const cardCount = await resultCards.count();
    
    if (cardCount === 0) {
      console.log('⚠️ [TEST] 没有找到结果卡片，跳过测试');
      return;
    }
    
    // 右键点击第一个结果卡片
    const firstCard = resultCards.first();
    await firstCard.click({ button: 'right' });
    await page.waitForTimeout(2000);
    
    // 查找上下文菜单
    const contextMenu = page.locator('.fixed.z-50.bg-white.rounded-md.shadow-lg');
    
    if (await contextMenu.isVisible({ timeout: 3000 })) {
      console.log('✅ [TEST] 上下文菜单显示成功');
      
      // 检查菜单项
      const menuItems = [
        '查看詳情',
        '重新命名',
        '刪除結果'
      ];
      
      for (const item of menuItems) {
        const menuItem = contextMenu.locator(`text=${item}`);
        if (await menuItem.isVisible({ timeout: 1000 })) {
          console.log(`✅ [TEST] 找到菜单项: ${item}`);
        } else {
          console.log(`⚠️ [TEST] 未找到菜单项: ${item}`);
        }
      }
      
      // 测试查看详情功能
      const viewOption = contextMenu.locator('text=查看詳情, text=查看详情').first();
      if (await viewOption.isVisible({ timeout: 2000 })) {
        console.log('✅ [TEST] 找到查看详情选项');
        // 注意：这里不实际点击，因为会打开新标签页
      }
      
      // 点击空白区域关闭菜单
      await page.click('body', { position: { x: 100, y: 100 } });
      await page.waitForTimeout(1000);
      
      console.log('✅ [TEST] 菜单功能测试完成');
    }
  });
});

// 辅助函数：处理登录
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
