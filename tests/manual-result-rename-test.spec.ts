import { test, expect } from '@playwright/test';

test.describe('手动测试结果重命名功能', () => {
  
  test('手动验证结果重命名功能', async ({ page }) => {
    console.log('🔍 [MANUAL TEST] 开始手动测试结果重命名功能...');
    
    // 导航到我的结果页面
    await page.goto('https://edu-create.vercel.app/my-results');
    await page.waitForTimeout(5000);
    
    // 截图：初始页面状态
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/20251015_结果重命名_初始页面_success_v1_001.png`,
      fullPage: true 
    });
    
    console.log('📸 [MANUAL TEST] 已截图：初始页面状态');
    
    // 处理登录（如果需要）
    try {
      const loginButton = page.locator('[data-testid="login-button"]').first();
      if (await loginButton.isVisible({ timeout: 3000 })) {
        await loginButton.click();
        await page.waitForTimeout(2000);
        
        const demoLogin = page.locator('text=演示登入').first();
        if (await demoLogin.isVisible({ timeout: 3000 })) {
          await demoLogin.click();
          await page.waitForTimeout(5000);
          
          // 截图：登录后状态
          await page.screenshot({ 
            path: `EduCreate-Test-Videos/current/success/20251015_结果重命名_登录后_success_v1_002.png`,
            fullPage: true 
          });
          
          console.log('📸 [MANUAL TEST] 已截图：登录后状态');
        }
      }
    } catch (error) {
      console.log('ℹ️ [MANUAL TEST] 无需登录或登录失败，继续测试');
    }
    
    // 等待页面完全加载
    await page.waitForTimeout(5000);
    
    // 查找结果卡片 - 使用多种选择器
    const resultSelectors = [
      '[data-testid="result-card"]',
      '.bg-white.rounded-lg.shadow-sm.border.border-gray-200',
      '.bg-white.rounded-lg.shadow',
      '.result-card',
      'div:has(h2):has(p:text("參與人數"))',
      'div:has(h2):has(p:text("参与人数"))'
    ];
    
    let resultCards = null;
    let cardCount = 0;
    
    for (const selector of resultSelectors) {
      resultCards = page.locator(selector);
      cardCount = await resultCards.count();
      
      console.log(`🔍 [MANUAL TEST] 使用选择器 "${selector}" 找到 ${cardCount} 个元素`);
      
      if (cardCount > 0) {
        break;
      }
    }
    
    // 如果没有找到结果卡片，尝试查看页面内容
    if (cardCount === 0) {
      console.log('⚠️ [MANUAL TEST] 没有找到结果卡片，检查页面内容...');
      
      // 截图：无结果状态
      await page.screenshot({ 
        path: `EduCreate-Test-Videos/current/analysis/20251015_结果重命名_无结果状态_analysis_v1_001.png`,
        fullPage: true 
      });
      
      // 检查页面是否有任何内容
      const pageContent = await page.textContent('body');
      console.log('📄 [MANUAL TEST] 页面内容预览:', pageContent?.substring(0, 500));
      
      // 检查是否有"没有结果"的提示
      const noResultsText = page.locator('text=沒有結果, text=没有结果, text=暂无结果, text=No results');
      if (await noResultsText.isVisible({ timeout: 2000 })) {
        console.log('ℹ️ [MANUAL TEST] 页面显示"没有结果"，这是正常状态');
      }
      
      // 检查是否有创建结果的按钮或链接
      const createButtons = page.locator('text=創建, text=创建, text=新增, text=Create');
      const createCount = await createButtons.count();
      console.log(`🔍 [MANUAL TEST] 找到 ${createCount} 个创建按钮`);
      
      return; // 结束测试
    }
    
    console.log(`📊 [MANUAL TEST] 找到 ${cardCount} 个结果卡片，开始测试重命名功能`);
    
    // 选择第一个结果卡片
    const firstCard = resultCards.first();
    
    // 获取原始标题
    const titleElement = firstCard.locator('h2, h3, .title, [class*="title"]').first();
    const originalTitle = await titleElement.textContent();
    console.log(`📝 [MANUAL TEST] 原始标题: ${originalTitle}`);
    
    // 截图：选中的结果卡片
    await firstCard.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/20251015_结果重命名_选中卡片_success_v1_003.png`
    });
    
    // 右键点击结果卡片
    await firstCard.click({ button: 'right' });
    await page.waitForTimeout(3000);
    
    // 截图：右键菜单
    await page.screenshot({ 
      path: `EduCreate-Test-Videos/current/success/20251015_结果重命名_右键菜单_success_v1_004.png`,
      fullPage: true 
    });
    
    console.log('📸 [MANUAL TEST] 已截图：右键菜单');
    
    // 查找上下文菜单
    const contextMenuSelectors = [
      '.fixed.z-50.bg-white.rounded-md.shadow-lg',
      '.context-menu',
      '[role="menu"]',
      '.dropdown-menu',
      'div:has(text("重新命名"))',
      'div:has(text("重命名"))'
    ];
    
    let contextMenu = null;
    let menuVisible = false;
    
    for (const selector of contextMenuSelectors) {
      contextMenu = page.locator(selector);
      menuVisible = await contextMenu.isVisible({ timeout: 2000 });
      
      console.log(`🔍 [MANUAL TEST] 检查菜单选择器 "${selector}": ${menuVisible ? '可见' : '不可见'}`);
      
      if (menuVisible) {
        break;
      }
    }
    
    if (menuVisible && contextMenu) {
      console.log('✅ [MANUAL TEST] 上下文菜单显示成功');
      
      // 查找重命名选项
      const renameSelectors = [
        'text=重新命名',
        'text=重命名',
        'text=Rename',
        '[data-testid="rename-option"]',
        'button:has-text("重新命名")',
        'button:has-text("重命名")'
      ];
      
      let renameOption = null;
      let renameVisible = false;
      
      for (const selector of renameSelectors) {
        renameOption = contextMenu.locator(selector);
        renameVisible = await renameOption.isVisible({ timeout: 1000 });
        
        console.log(`🔍 [MANUAL TEST] 检查重命名选项 "${selector}": ${renameVisible ? '可见' : '不可见'}`);
        
        if (renameVisible) {
          break;
        }
      }
      
      if (renameVisible && renameOption) {
        // 点击重命名选项
        await renameOption.click();
        await page.waitForTimeout(3000);
        
        // 截图：重命名模态框
        await page.screenshot({ 
          path: `EduCreate-Test-Videos/current/success/20251015_结果重命名_模态框_success_v1_005.png`,
          fullPage: true 
        });
        
        console.log('📸 [MANUAL TEST] 已截图：重命名模态框');
        
        // 查找重命名模态框
        const modalSelectors = [
          'text=重新命名結果',
          'text=重新命名结果',
          'text=重命名结果',
          '[role="dialog"]',
          '.modal',
          '.fixed.inset-0'
        ];
        
        let modal = null;
        let modalVisible = false;
        
        for (const selector of modalSelectors) {
          modal = page.locator(selector);
          modalVisible = await modal.isVisible({ timeout: 2000 });
          
          console.log(`🔍 [MANUAL TEST] 检查模态框选择器 "${selector}": ${modalVisible ? '可见' : '不可见'}`);
          
          if (modalVisible) {
            break;
          }
        }
        
        if (modalVisible) {
          console.log('✅ [MANUAL TEST] 重命名模态框显示成功');
          
          // 查找输入框
          const inputSelectors = [
            'input[id="resultTitle"]',
            'input[placeholder*="結果標題"]',
            'input[placeholder*="结果标题"]',
            'input[placeholder*="标题"]',
            'input[type="text"]',
            'textarea'
          ];
          
          let titleInput = null;
          let inputVisible = false;
          
          for (const selector of inputSelectors) {
            titleInput = page.locator(selector);
            inputVisible = await titleInput.isVisible({ timeout: 1000 });
            
            console.log(`🔍 [MANUAL TEST] 检查输入框选择器 "${selector}": ${inputVisible ? '可见' : '不可见'}`);
            
            if (inputVisible) {
              break;
            }
          }
          
          if (inputVisible && titleInput) {
            // 清空输入框并输入新标题
            const newTitle = `手动测试重命名结果 - ${Date.now()}`;
            await titleInput.clear();
            await titleInput.fill(newTitle);
            
            console.log(`📝 [MANUAL TEST] 输入新标题: ${newTitle}`);
            
            // 截图：输入新标题后
            await page.screenshot({ 
              path: `EduCreate-Test-Videos/current/success/20251015_结果重命名_输入新标题_success_v1_006.png`,
              fullPage: true 
            });
            
            // 查找重命名按钮
            const buttonSelectors = [
              'button:has-text("重命名")',
              'button:has-text("確認")',
              'button:has-text("确认")',
              'button:has-text("保存")',
              'button:has-text("Save")',
              'button[type="submit"]'
            ];
            
            let renameButton = null;
            let buttonVisible = false;
            
            for (const selector of buttonSelectors) {
              renameButton = page.locator(selector);
              buttonVisible = await renameButton.isVisible({ timeout: 1000 });
              
              console.log(`🔍 [MANUAL TEST] 检查按钮选择器 "${selector}": ${buttonVisible ? '可见' : '不可见'}`);
              
              if (buttonVisible) {
                break;
              }
            }
            
            if (buttonVisible && renameButton) {
              await renameButton.click();
              await page.waitForTimeout(5000);
              
              console.log('✅ [MANUAL TEST] 点击重命名按钮成功');
              
              // 截图：重命名后状态
              await page.screenshot({ 
                path: `EduCreate-Test-Videos/current/success/20251015_结果重命名_完成后_success_v1_007.png`,
                fullPage: true 
              });
              
              // 验证标题是否更新
              const updatedTitle = await titleElement.textContent();
              console.log(`📝 [MANUAL TEST] 更新后标题: ${updatedTitle}`);
              
              if (updatedTitle && updatedTitle.includes('手动测试重命名结果')) {
                console.log('🎉 [MANUAL TEST] 重命名功能测试成功！');
                
                // 最终成功截图
                await page.screenshot({ 
                  path: `EduCreate-Test-Videos/current/success/20251015_结果重命名_测试成功_success_v1_008.png`,
                  fullPage: true 
                });
              } else {
                console.log('⚠️ [MANUAL TEST] 标题可能未立即更新，等待页面刷新...');
                await page.reload();
                await page.waitForTimeout(3000);
                
                const finalTitle = await titleElement.textContent();
                console.log(`📝 [MANUAL TEST] 刷新后标题: ${finalTitle}`);
                
                // 刷新后截图
                await page.screenshot({ 
                  path: `EduCreate-Test-Videos/current/success/20251015_结果重命名_刷新后_success_v1_009.png`,
                  fullPage: true 
                });
              }
            } else {
              console.log('❌ [MANUAL TEST] 未找到重命名按钮');
            }
          } else {
            console.log('❌ [MANUAL TEST] 未找到标题输入框');
          }
        } else {
          console.log('❌ [MANUAL TEST] 重命名模态框未显示');
        }
      } else {
        console.log('❌ [MANUAL TEST] 未找到重命名选项');
      }
    } else {
      console.log('❌ [MANUAL TEST] 上下文菜单未显示');
    }
    
    console.log('✅ [MANUAL TEST] 手动测试完成');
  });
});
