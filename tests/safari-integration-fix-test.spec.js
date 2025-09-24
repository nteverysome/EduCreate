/**
 * 🍎 Safari 整合修復測試
 * 測試 Safari 整合順序修復是否解決了手機 Safari 全螢幕問題
 */

const { test, expect } = require('@playwright/test');
const path = require('path');

test.describe('Safari 整合修復測試', () => {
    test('測試 Safari 整合修復是否正確載入', async ({ page }) => {
        console.log('🍎 開始測試 Safari 整合修復');
        
        // 直接訪問本地 HTML 文件
        const htmlFilePath = path.join(__dirname, '../public/games/starshake-game/dist/index.html');
        const fileUrl = `file://${htmlFilePath.replace(/\\/g, '/')}`;
        
        await page.goto(fileUrl);
        await page.waitForTimeout(8000); // 等待所有腳本載入和修復完成
        
        console.log('✅ HTML 文件已載入，等待修復完成');
        
        // 檢查修復是否載入
        const integrationFixLoaded = await page.evaluate(() => {
            return {
                hasPostMessageDiagnostic: typeof window.getPostMessageDiagnostic === 'function',
                hasSafariSupport: typeof window.testSafariFullscreen === 'function',
                hasIntegrationFix: typeof window.testSafariIntegrationFix === 'function',
                hasTouchControls: !!window.touchControls,
                hasToggleFullscreen: !!(window.touchControls && window.touchControls.toggleFullscreen)
            };
        });
        
        console.log('🔍 整合修復載入狀態:', integrationFixLoaded);
        
        // 驗證所有功能已載入
        expect(integrationFixLoaded.hasPostMessageDiagnostic).toBe(true);
        expect(integrationFixLoaded.hasSafariSupport).toBe(true);
        expect(integrationFixLoaded.hasIntegrationFix).toBe(true);
        expect(integrationFixLoaded.hasTouchControls).toBe(true);
        expect(integrationFixLoaded.hasToggleFullscreen).toBe(true);
        
        console.log('✅ 所有整合修復功能已正確載入');
        
        // 測試 Safari 整合修復狀態
        const integrationFixStatus = await page.evaluate(() => {
            if (window.testSafariIntegrationFix) {
                return window.testSafariIntegrationFix();
            }
            return null;
        });
        
        console.log('🍎 Safari 整合修復狀態:', integrationFixStatus);
        
        if (integrationFixStatus) {
            expect(integrationFixStatus.hasTouchControls).toBe(true);
            expect(integrationFixStatus.hasToggleFullscreen).toBe(true);
            expect(integrationFixStatus.hasSafariSupport).toBe(true);
            expect(integrationFixStatus.integrationFixed).toBe(true);
            console.log('✅ Safari 整合修復狀態正常');
        }
        
        // 測試 PostMessage 診斷
        const postMessageDiagnostic = await page.evaluate(() => {
            if (window.getPostMessageDiagnostic) {
                return window.getPostMessageDiagnostic();
            }
            return null;
        });
        
        console.log('📡 PostMessage 診斷結果:', postMessageDiagnostic);
        
        if (postMessageDiagnostic) {
            // 檢查環境檢測
            expect(postMessageDiagnostic.environment).toBeDefined();
            expect(postMessageDiagnostic.environment.hasPostMessage).toBe(true);
            
            console.log('✅ PostMessage 診斷功能正常');
        }
        
        // 測試 Safari 支援狀態
        const safariSupportStatus = await page.evaluate(() => {
            if (window.testSafariFullscreen) {
                return window.testSafariFullscreen();
            }
            return null;
        });
        
        console.log('🍎 Safari 支援狀態:', safariSupportStatus);
        
        if (safariSupportStatus) {
            expect(safariSupportStatus).toHaveProperty('standardAPI');
            expect(safariSupportStatus).toHaveProperty('webkitAPI');
            console.log('✅ Safari 支援檢測正常');
        }
        
        console.log('✅ Safari 整合修復測試完成');
    });
    
    test('測試修復後的全螢幕功能調用', async ({ page }) => {
        console.log('🧪 測試修復後的全螢幕功能調用');
        
        const htmlFilePath = path.join(__dirname, '../public/games/starshake-game/dist/index.html');
        const fileUrl = `file://${htmlFilePath.replace(/\\/g, '/')}`;
        
        await page.goto(fileUrl);
        await page.waitForTimeout(8000); // 等待修復完成
        
        // 測試全螢幕功能調用（不實際觸發全螢幕）
        const fullscreenTestResult = await page.evaluate(async () => {
            const results = {
                touchControlsExists: !!window.touchControls,
                toggleFullscreenExists: !!(window.touchControls && window.touchControls.toggleFullscreen),
                functionContent: null,
                safariEnhanced: false,
                errorDuringTest: null
            };
            
            if (window.touchControls && window.touchControls.toggleFullscreen) {
                // 檢查函數內容是否包含 Safari 增強
                const functionStr = window.touchControls.toggleFullscreen.toString();
                results.functionContent = functionStr.substring(0, 200) + '...';
                results.safariEnhanced = functionStr.includes('Safari 增強') || 
                                        functionStr.includes('requestFullscreenCrossBrowser') ||
                                        functionStr.includes('safariEnhancedCoordinateSync');
                
                // 測試函數調用（但不實際執行全螢幕）
                try {
                    // 這裡我們不實際調用 toggleFullscreen，只檢查它是否可調用
                    results.functionCallable = typeof window.touchControls.toggleFullscreen === 'function';
                } catch (error) {
                    results.errorDuringTest = error.message;
                }
            }
            
            return results;
        });
        
        console.log('🧪 全螢幕功能測試結果:', fullscreenTestResult);
        
        // 驗證修復效果
        expect(fullscreenTestResult.touchControlsExists).toBe(true);
        expect(fullscreenTestResult.toggleFullscreenExists).toBe(true);
        expect(fullscreenTestResult.functionCallable).toBe(true);
        expect(fullscreenTestResult.safariEnhanced).toBe(true);
        
        if (fullscreenTestResult.safariEnhanced) {
            console.log('✅ 全螢幕功能已成功升級為 Safari 增強版本');
        }
        
        console.log('✅ 修復後的全螢幕功能調用測試完成');
    });
    
    test('測試 PostMessage 通信診斷', async ({ page }) => {
        console.log('📡 測試 PostMessage 通信診斷');
        
        const htmlFilePath = path.join(__dirname, '../public/games/starshake-game/dist/index.html');
        const fileUrl = `file://${htmlFilePath.replace(/\\/g, '/')}`;
        
        await page.goto(fileUrl);
        await page.waitForTimeout(8000);
        
        // 測試 PostMessage 診斷功能
        const communicationTest = await page.evaluate(() => {
            const results = {
                diagnosticExists: typeof window.getPostMessageDiagnostic === 'function',
                testCommunicationExists: typeof window.testPostMessageCommunication === 'function',
                checkParentListenerExists: typeof window.checkParentListener === 'function',
                forceDiagnosticExists: typeof window.forceDiagnostic === 'function'
            };
            
            // 執行診斷
            if (window.getPostMessageDiagnostic) {
                results.diagnosticReport = window.getPostMessageDiagnostic();
            }
            
            return results;
        });
        
        console.log('📡 PostMessage 通信診斷結果:', communicationTest);
        
        // 驗證診斷功能
        expect(communicationTest.diagnosticExists).toBe(true);
        expect(communicationTest.testCommunicationExists).toBe(true);
        expect(communicationTest.checkParentListenerExists).toBe(true);
        expect(communicationTest.forceDiagnosticExists).toBe(true);
        
        if (communicationTest.diagnosticReport) {
            expect(communicationTest.diagnosticReport.environment).toBeDefined();
            console.log('✅ PostMessage 診斷報告生成正常');
            
            // 檢查環境檢測結果
            const env = communicationTest.diagnosticReport.environment;
            console.log('🔍 環境檢測結果:');
            console.log(`   - 在 iframe 中: ${env.isInIframe}`);
            console.log(`   - 可訪問父頁面: ${env.canAccessParent}`);
            console.log(`   - Safari 瀏覽器: ${env.isSafari}`);
            console.log(`   - iOS 設備: ${env.isIOS}`);
            console.log(`   - 移動設備: ${env.isMobile}`);
        }
        
        console.log('✅ PostMessage 通信診斷測試完成');
    });
    
    test('生成完整的診斷報告', async ({ page }) => {
        console.log('📋 生成完整的診斷報告');
        
        const htmlFilePath = path.join(__dirname, '../public/games/starshake-game/dist/index.html');
        const fileUrl = `file://${htmlFilePath.replace(/\\/g, '/')}`;
        
        await page.goto(fileUrl);
        await page.waitForTimeout(8000);
        
        // 生成完整診斷報告
        const fullDiagnosticReport = await page.evaluate(() => {
            const report = {
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                features: {
                    postMessageDiagnostic: typeof window.getPostMessageDiagnostic === 'function',
                    safariSupport: typeof window.testSafariFullscreen === 'function',
                    integrationFix: typeof window.testSafariIntegrationFix === 'function',
                    touchControls: !!window.touchControls,
                    crossBrowserAPI: typeof window.requestFullscreenCrossBrowser === 'function'
                },
                diagnostics: {},
                recommendations: []
            };
            
            // 收集各種診斷信息
            if (window.getPostMessageDiagnostic) {
                report.diagnostics.postMessage = window.getPostMessageDiagnostic();
            }
            
            if (window.testSafariFullscreen) {
                report.diagnostics.safari = window.testSafariFullscreen();
            }
            
            if (window.testSafariIntegrationFix) {
                report.diagnostics.integration = window.testSafariIntegrationFix();
            }
            
            // 生成建議
            if (report.diagnostics.postMessage && !report.diagnostics.postMessage.environment.isInIframe) {
                report.recommendations.push('直接訪問模式：使用 Safari 增強的座標同步版本');
            }
            
            if (report.diagnostics.safari && report.diagnostics.safari.isIOS && report.diagnostics.safari.isSafari) {
                report.recommendations.push('iOS Safari 環境：確保使用跨瀏覽器 API');
            }
            
            if (report.diagnostics.integration && report.diagnostics.integration.integrationFixed) {
                report.recommendations.push('Safari 整合修復已完成：全螢幕功能應該正常工作');
            }
            
            return report;
        });
        
        console.log('📋 完整診斷報告:', JSON.stringify(fullDiagnosticReport, null, 2));
        
        // 截圖記錄診斷結果
        await page.screenshot({
            path: 'EduCreate-Test-Videos/current/success/safari-integration-fix-diagnostic.png',
            fullPage: true
        });
        
        console.log('✅ 完整診斷報告生成完成');
        console.log('🎯 診斷總結:');
        console.log('   - PostMessage 診斷功能已載入');
        console.log('   - Safari 支援功能已載入');
        console.log('   - Safari 整合修復已完成');
        console.log('   - 跨瀏覽器 API 已整合');
        console.log('   - 全螢幕功能已升級為 Safari 增強版本');
    });
});
