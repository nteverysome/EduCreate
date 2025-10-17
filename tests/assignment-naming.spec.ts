import { test, expect } from '@playwright/test';

test.describe('課業分配命名功能測試', () => {
  test.beforeEach(async ({ page }) => {
    // 訪問我的活動頁面
    await page.goto('https://edu-create.vercel.app/my-activities');
    
    // 等待頁面載入
    await page.waitForLoadState('networkidle');
    
    // 檢查是否需要登入
    const loginButton = page.locator('text=登入');
    if (await loginButton.isVisible()) {
      console.log('⚠️ 需要登入，請先登入後再運行測試');
      // 這裡可以添加自動登入邏輯
    }
  });

  test('測試課業分配命名功能', async ({ page }) => {
    console.log('🧪 開始測試課業分配命名功能');

    // 1. 等待活動卡片載入
    await page.waitForSelector('[data-testid="activity-card"], .activity-card, .bg-white.rounded-lg', { timeout: 10000 });
    console.log('✅ 活動卡片已載入');

    // 2. 找到第一個活動卡片
    const activityCards = page.locator('.bg-white.rounded-lg').filter({ hasText: /編輯|播放|分享/ });
    const firstCard = activityCards.first();
    
    // 獲取活動標題
    const activityTitle = await firstCard.locator('h3, .font-semibold').first().textContent();
    console.log('📝 活動標題:', activityTitle);

    // 3. 點擊課業分配按鈕（可能是三點選單中的選項）
    // 先嘗試找到三點選單按鈕
    const moreButton = firstCard.locator('button').filter({ hasText: /⋮|更多|選項/ }).or(
      firstCard.locator('button[aria-label*="選單"], button[aria-label*="更多"]')
    ).or(
      firstCard.locator('button').last()
    );

    if (await moreButton.count() > 0) {
      await moreButton.first().click();
      console.log('✅ 點擊了更多選單');
      await page.waitForTimeout(500);
    }

    // 4. 點擊課業分配選項
    const assignmentButton = page.locator('text=課業分配').or(
      page.locator('button:has-text("課業分配")')
    ).or(
      page.locator('[data-testid="assignment-button"]')
    );

    if (await assignmentButton.count() === 0) {
      console.log('⚠️ 找不到課業分配按鈕，嘗試其他方式...');
      // 截圖以便調試
      await page.screenshot({ path: 'tests/screenshots/no-assignment-button.png' });
      
      // 列出所有可見的按鈕
      const allButtons = await page.locator('button:visible').allTextContents();
      console.log('📋 所有可見按鈕:', allButtons);
    } else {
      await assignmentButton.first().click();
      console.log('✅ 點擊了課業分配按鈕');
      await page.waitForTimeout(1000);

      // 5. 等待課業分配模態框出現
      const modal = page.locator('.fixed.inset-0').filter({ hasText: /課業設置|結果標題/ });
      await expect(modal).toBeVisible({ timeout: 5000 });
      console.log('✅ 課業分配模態框已顯示');

      // 6. 截圖模態框
      await page.screenshot({ path: 'tests/screenshots/assignment-modal-initial.png' });

      // 7. 找到結果標題輸入框
      const titleInput = page.locator('input[type="text"]').filter({ hasText: /的結果/ }).or(
        page.locator('label:has-text("結果標題") + input').or(
          page.locator('input').filter({ hasText: activityTitle || '' })
        )
      ).or(
        modal.locator('input[type="text"]').first()
      );

      // 檢查輸入框是否存在
      const inputCount = await titleInput.count();
      console.log(`📊 找到 ${inputCount} 個可能的標題輸入框`);

      if (inputCount > 0) {
        // 獲取當前值
        const currentValue = await titleInput.first().inputValue();
        console.log('📝 當前標題值:', currentValue);

        // 8. 修改標題
        const newTitle = `測試課業 - ${new Date().toLocaleTimeString('zh-TW')}`;
        await titleInput.first().clear();
        await titleInput.first().fill(newTitle);
        console.log('✅ 已修改標題為:', newTitle);

        // 9. 截圖修改後的狀態
        await page.screenshot({ path: 'tests/screenshots/assignment-modal-modified.png' });

        // 10. 驗證輸入框值已更新
        const updatedValue = await titleInput.first().inputValue();
        expect(updatedValue).toBe(newTitle);
        console.log('✅ 標題輸入框值已正確更新');

        // 11. 找到並點擊開始按鈕
        const startButton = modal.locator('button').filter({ hasText: /開始|確定|創建/ });
        if (await startButton.count() > 0) {
          await startButton.first().click();
          console.log('✅ 點擊了開始按鈕');
          await page.waitForTimeout(2000);

          // 12. 檢查是否顯示成功訊息或課業集模態框
          const successModal = page.locator('.fixed.inset-0').filter({ hasText: /課業集|分享連結|複製/ });
          if (await successModal.isVisible({ timeout: 3000 })) {
            console.log('✅ 課業分配創建成功，顯示了課業集模態框');
            await page.screenshot({ path: 'tests/screenshots/assignment-success.png' });

            // 檢查標題是否正確顯示
            const displayedTitle = await successModal.textContent();
            if (displayedTitle?.includes(newTitle)) {
              console.log('✅ 新標題正確顯示在課業集模態框中');
            } else {
              console.log('⚠️ 新標題未在課業集模態框中顯示');
              console.log('顯示的內容:', displayedTitle);
            }
          } else {
            console.log('⚠️ 未顯示課業集模態框');
            await page.screenshot({ path: 'tests/screenshots/no-success-modal.png' });
          }
        } else {
          console.log('⚠️ 找不到開始按鈕');
          const allModalButtons = await modal.locator('button').allTextContents();
          console.log('📋 模態框中的所有按鈕:', allModalButtons);
        }
      } else {
        console.log('❌ 找不到結果標題輸入框');
        
        // 列出模態框中的所有輸入框
        const allInputs = await modal.locator('input').count();
        console.log(`📊 模態框中共有 ${allInputs} 個輸入框`);
        
        for (let i = 0; i < allInputs; i++) {
          const input = modal.locator('input').nth(i);
          const type = await input.getAttribute('type');
          const value = await input.inputValue();
          const placeholder = await input.getAttribute('placeholder');
          console.log(`  輸入框 ${i + 1}: type=${type}, value="${value}", placeholder="${placeholder}"`);
        }
      }
    }
  });

  test('檢查 AssignmentModal 組件結構', async ({ page }) => {
    console.log('🧪 檢查 AssignmentModal 組件結構');

    // 訪問頁面並打開開發者工具
    await page.goto('https://edu-create.vercel.app/my-activities');
    await page.waitForLoadState('networkidle');

    // 注入腳本來檢查 React 組件
    const componentInfo = await page.evaluate(() => {
      // 查找所有可能的 AssignmentModal 相關元素
      const modals = document.querySelectorAll('[class*="modal"], [class*="Modal"]');
      const inputs = document.querySelectorAll('input[type="text"]');
      
      return {
        modalCount: modals.length,
        inputCount: inputs.length,
        modalClasses: Array.from(modals).map(m => m.className),
        inputInfo: Array.from(inputs).map(i => ({
          type: i.getAttribute('type'),
          value: (i as HTMLInputElement).value,
          placeholder: i.getAttribute('placeholder'),
          className: i.className
        }))
      };
    });

    console.log('📊 組件信息:', JSON.stringify(componentInfo, null, 2));
  });
});

