/**
 * 響應式測試框架 - 邊界情況測試、動態尺寸測試、自動化測試
 * 版本：v1.0
 */

class ResponsiveTestSuite {
    /**
     * 邊界分辨率定義
     */
    static BOUNDARY_RESOLUTIONS = [
        // 手機
        { width: 320, height: 568, name: 'iPhone SE', category: 'mobile' },
        { width: 375, height: 667, name: 'iPhone 8', category: 'mobile' },
        { width: 390, height: 844, name: 'iPhone 14', category: 'mobile' },
        { width: 414, height: 896, name: 'iPhone 11', category: 'mobile' },
        
        // 平板
        { width: 768, height: 1024, name: 'iPad 豎屏', category: 'tablet' },
        { width: 1024, height: 600, name: '小平板', category: 'tablet' },
        { width: 1024, height: 768, name: 'XGA 橫屏（關鍵）', category: 'desktop', isKeyBoundary: true },
        
        // 桌面
        { width: 1280, height: 720, name: 'HD 橫屏', category: 'desktop' },
        { width: 1366, height: 768, name: '常見桌面', category: 'desktop' },
        { width: 1920, height: 1080, name: 'Full HD', category: 'desktop' },
        
        // 邊界情況
        { width: 320, height: 270, name: '最小尺寸', category: 'boundary' },
        { width: 1920, height: 1080, name: '最大尺寸', category: 'boundary' }
    ];
    
    /**
     * 運行所有測試
     */
    static runAllTests() {
        console.log('🧪 開始邊界情況測試套件');
        console.log('═'.repeat(60));
        
        const results = [];
        const startTime = Date.now();
        
        this.BOUNDARY_RESOLUTIONS.forEach((res, index) => {
            const result = this.testResolution(res);
            results.push(result);
            
            const status = result.passed ? '✅' : '❌';
            const keyMarker = res.isKeyBoundary ? ' 🔑' : '';
            console.log(`${status} [${index + 1}/${this.BOUNDARY_RESOLUTIONS.length}] ${res.name} (${res.width}×${res.height})${keyMarker}`);
        });
        
        const endTime = Date.now();
        const passed = results.filter(r => r.passed).length;
        const total = results.length;
        const duration = endTime - startTime;
        
        console.log('═'.repeat(60));
        console.log(`📊 測試結果: ${passed}/${total} 通過 (${duration}ms)`);
        
        if (passed === total) {
            console.log('🎉 所有測試通過！');
        } else {
            console.log(`⚠️ ${total - passed} 個測試失敗`);
        }
        
        return {
            results,
            passed,
            total,
            duration,
            passRate: ((passed / total) * 100).toFixed(1) + '%'
        };
    }
    
    /**
     * 測試單個分辨率
     */
    static testResolution(res) {
        try {
            // 驗證尺寸
            ResponsiveValidator.validateDimensions(res.width, res.height);
            
            // 檢測設備
            const device = DeviceDetector.detect(res.width, res.height);
            
            // 獲取佈局配置
            const layout = DeviceDetector.getLayoutConfig(device);
            
            // 驗證卡片尺寸
            const cardWidth = res.width * layout.cardWidthPercent;
            ResponsiveValidator.validateCardDimensions(cardWidth, 0, res.width);
            
            // 驗證卡片位置
            ResponsiveValidator.validateCardPosition(
                res.width * 0.25,
                res.height * 0.25,
                cardWidth,
                res.height * layout.cardHeightPercent,
                res.width,
                res.height
            );
            
            return {
                resolution: res,
                device: device.type,
                layout: layout.layout,
                passed: true,
                error: null
            };
            
        } catch (error) {
            return {
                resolution: res,
                error: error.message,
                passed: false
            };
        }
    }
    
    /**
     * 測試動態尺寸變化
     */
    static testDynamicResize() {
        console.log('\n🔄 開始動態尺寸變化測試');
        console.log('═'.repeat(60));
        
        const transitions = [
            { from: { w: 375, h: 667 }, to: { w: 768, h: 1024 }, name: 'iPhone → iPad' },
            { from: { w: 768, h: 1024 }, to: { w: 1024, h: 768 }, name: 'iPad → XGA' },
            { from: { w: 1024, h: 768 }, to: { w: 1280, h: 720 }, name: 'XGA → HD' },
            { from: { w: 1280, h: 720 }, to: { w: 375, h: 667 }, name: 'HD → iPhone' },
            { from: { w: 320, h: 568 }, to: { w: 1920, h: 1080 }, name: 'SE → Full HD' }
        ];
        
        const results = [];
        
        transitions.forEach((trans, index) => {
            try {
                // 測試初始尺寸
                const fromRes = { width: trans.from.w, height: trans.from.h };
                const toRes = { width: trans.to.w, height: trans.to.h };
                
                const fromResult = this.testResolution(fromRes);
                const toResult = this.testResolution(toRes);
                
                const passed = fromResult.passed && toResult.passed;
                results.push({
                    transition: trans.name,
                    from: fromResult,
                    to: toResult,
                    passed
                });
                
                const status = passed ? '✅' : '❌';
                console.log(`${status} [${index + 1}/${transitions.length}] ${trans.name}`);
                
            } catch (error) {
                results.push({
                    transition: trans.name,
                    error: error.message,
                    passed: false
                });
                console.log(`❌ [${index + 1}/${transitions.length}] ${trans.name} - ${error.message}`);
            }
        });
        
        const passed = results.filter(r => r.passed).length;
        console.log('═'.repeat(60));
        console.log(`📊 動態尺寸測試: ${passed}/${transitions.length} 通過`);
        
        return results;
    }
    
    /**
     * 測試邊界檢查
     */
    static testBoundaryChecks() {
        console.log('\n🛡️ 開始邊界檢查測試');
        console.log('═'.repeat(60));
        
        const testCases = [
            { width: 100, height: 100, shouldFail: true, name: '尺寸過小' },
            { width: 2000, height: 1200, shouldFail: true, name: '尺寸過大' },
            { width: 320, height: 270, shouldFail: false, name: '最小有效尺寸' },
            { width: 1920, height: 1080, shouldFail: false, name: '最大有效尺寸' },
            { width: 1024, height: 768, shouldFail: false, name: 'XGA 邊界' }
        ];
        
        const results = [];
        
        testCases.forEach((testCase, index) => {
            try {
                ResponsiveValidator.validateDimensions(testCase.width, testCase.height);
                
                const passed = !testCase.shouldFail;
                results.push({
                    testCase: testCase.name,
                    passed,
                    error: null
                });
                
                const status = passed ? '✅' : '❌';
                console.log(`${status} [${index + 1}/${testCases.length}] ${testCase.name}`);
                
            } catch (error) {
                const passed = testCase.shouldFail;
                results.push({
                    testCase: testCase.name,
                    passed,
                    error: error.message
                });
                
                const status = passed ? '✅' : '❌';
                console.log(`${status} [${index + 1}/${testCases.length}] ${testCase.name}`);
            }
        });
        
        const passed = results.filter(r => r.passed).length;
        console.log('═'.repeat(60));
        console.log(`📊 邊界檢查測試: ${passed}/${testCases.length} 通過`);
        
        return results;
    }
    
    /**
     * 運行完整測試套件
     */
    static runFullTestSuite() {
        console.log('\n\n');
        console.log('╔' + '═'.repeat(58) + '╗');
        console.log('║' + ' '.repeat(15) + '🧪 完整測試套件 v1.0' + ' '.repeat(22) + '║');
        console.log('╚' + '═'.repeat(58) + '╝');
        
        const results = {
            boundaryResolutions: this.runAllTests(),
            dynamicResize: this.testDynamicResize(),
            boundaryChecks: this.testBoundaryChecks()
        };
        
        console.log('\n\n');
        console.log('╔' + '═'.repeat(58) + '╗');
        console.log('║' + ' '.repeat(20) + '📊 最終結果' + ' '.repeat(27) + '║');
        console.log('╠' + '═'.repeat(58) + '╣');
        console.log(`║ 邊界分辨率測試: ${results.boundaryResolutions.passed}/${results.boundaryResolutions.total} 通過 (${results.boundaryResolutions.passRate})` + ' '.repeat(Math.max(0, 20 - results.boundaryResolutions.passRate.length)) + '║');
        console.log(`║ 動態尺寸測試: ${results.dynamicResize.filter(r => r.passed).length}/${results.dynamicResize.length} 通過` + ' '.repeat(30) + '║');
        console.log(`║ 邊界檢查測試: ${results.boundaryChecks.filter(r => r.passed).length}/${results.boundaryChecks.length} 通過` + ' '.repeat(30) + '║');
        console.log('╚' + '═'.repeat(58) + '╝');
        
        return results;
    }
}

// 暴露到全局
window.ResponsiveTestSuite = ResponsiveTestSuite;

