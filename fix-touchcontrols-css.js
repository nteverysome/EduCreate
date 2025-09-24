const fs = require('fs');

console.log('🎨 修復 TouchControls CSS 媒體查詢和可見性...');

const htmlFile = 'public/games/starshake-game/dist/index.html';

try {
    let content = fs.readFileSync(htmlFile, 'utf8');
    
    console.log('🔍 分析 CSS 媒體查詢問題...');
    
    // 改進的 TouchControls CSS
    const improvedCSS = `
        /* TouchControls 樣式 - 改進版 */
        #touch-controls {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 1000;
            display: none; /* 默認隱藏 */
        }
        
        /* 顯示條件 - 更寬泛的媒體查詢 */
        @media (max-width: 1024px), (max-height: 768px), (pointer: coarse) {
            #touch-controls {
                display: block !important;
            }
        }
        
        /* 強制在觸摸設備上顯示 */
        @media (hover: none) and (pointer: coarse) {
            #touch-controls {
                display: block !important;
            }
        }
        
        /* iPad 特殊處理 */
        @media (min-width: 768px) and (max-width: 1024px) {
            #touch-controls {
                display: block !important;
            }
        }
        
        /* 大螢幕手機處理 */
        @media (min-width: 414px) and (max-width: 768px) {
            #touch-controls {
                display: block !important;
            }
        }
        
        /* 虛擬搖桿樣式 */
        #touch-joystick {
            position: absolute;
            bottom: 80px;
            left: 80px;
            width: 120px;
            height: 120px;
            background: rgba(255, 255, 255, 0.3);
            border: 3px solid rgba(255, 255, 255, 0.6);
            border-radius: 50%;
            pointer-events: auto;
            touch-action: none;
            user-select: none;
            -webkit-user-select: none;
            -webkit-touch-callout: none;
        }
        
        #joystick-knob {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.8);
            border: 2px solid rgba(255, 255, 255, 1);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            transition: background-color 0.1s ease;
            pointer-events: none;
        }
        
        /* 射擊按鈕樣式 */
        #touch-shoot {
            position: absolute;
            bottom: 120px;
            right: 80px;
            width: 80px;
            height: 80px;
            background: #ff4757;
            border: 3px solid #ffffff;
            border-radius: 50%;
            color: white;
            font-size: 24px;
            font-weight: bold;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: auto;
            touch-action: none;
            user-select: none;
            -webkit-user-select: none;
            -webkit-touch-callout: none;
            transition: all 0.1s ease;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        
        #touch-shoot:active {
            transform: scale(0.9);
            background: #ff6b6b;
        }
        
        /* 全螢幕按鈕樣式 */
        #fullscreen-btn {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: rgba(255, 255, 255, 0.8);
            border: 2px solid rgba(255, 255, 255, 1);
            border-radius: 8px;
            color: #333;
            font-size: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: auto;
            touch-action: none;
            user-select: none;
            -webkit-user-select: none;
            -webkit-touch-callout: none;
            transition: all 0.1s ease;
            cursor: pointer;
        }
        
        #fullscreen-btn:hover {
            background: rgba(255, 255, 255, 1);
            transform: scale(1.05);
        }
        
        #fullscreen-btn:active {
            transform: scale(0.95);
        }
        
        /* 響應式調整 */
        @media (max-width: 480px) {
            #touch-joystick {
                bottom: 60px;
                left: 60px;
                width: 100px;
                height: 100px;
            }
            
            #joystick-knob {
                width: 35px;
                height: 35px;
            }
            
            #touch-shoot {
                bottom: 100px;
                right: 60px;
                width: 70px;
                height: 70px;
                font-size: 20px;
            }
        }
        
        @media (max-height: 600px) {
            #touch-joystick {
                bottom: 40px;
                left: 40px;
            }
            
            #touch-shoot {
                bottom: 60px;
                right: 40px;
            }
        }
        
        /* 橫向模式調整 */
        @media (orientation: landscape) and (max-height: 500px) {
            #touch-joystick {
                bottom: 30px;
                left: 30px;
                width: 90px;
                height: 90px;
            }
            
            #joystick-knob {
                width: 30px;
                height: 30px;
            }
            
            #touch-shoot {
                bottom: 40px;
                right: 30px;
                width: 60px;
                height: 60px;
                font-size: 18px;
            }
            
            #fullscreen-btn {
                top: 10px;
                right: 10px;
                width: 40px;
                height: 40px;
                font-size: 16px;
            }
        }
        
        /* 調試模式樣式 */
        .touch-debug #touch-controls {
            display: block !important;
            background: rgba(255, 0, 0, 0.1);
        }
        
        .touch-debug #touch-joystick {
            background: rgba(0, 255, 0, 0.3);
        }
        
        .touch-debug #touch-shoot {
            background: rgba(0, 0, 255, 0.7);
        }`;
    
    // 查找並替換現有的 TouchControls CSS
    const cssRegex = /\/\* TouchControls 樣式[\s\S]*?(?=<\/style>)/;
    const styleMatch = content.match(/<style>([\s\S]*?)<\/style>/);
    
    if (styleMatch) {
        const existingCSS = styleMatch[1];
        const newCSS = existingCSS.replace(cssRegex, improvedCSS.trim());
        content = content.replace(styleMatch[0], `<style>${newCSS}</style>`);
    } else {
        // 如果沒有找到 style 標籤，在 head 中添加
        const headEndIndex = content.indexOf('</head>');
        if (headEndIndex !== -1) {
            content = content.slice(0, headEndIndex) + 
                     `<style>${improvedCSS}</style>\n` + 
                     content.slice(headEndIndex);
        }
    }
    
    // 添加調試功能到初始化代碼
    const debugScript = `
        // 調試功能
        window.toggleTouchDebug = function() {
            document.body.classList.toggle('touch-debug');
            console.log('🐛 TouchControls 調試模式:', document.body.classList.contains('touch-debug') ? '開啟' : '關閉');
        };
        
        // 強制顯示 TouchControls（用於測試）
        window.forceTouchControls = function(show = true) {
            const controls = document.getElementById('touch-controls');
            if (controls) {
                controls.style.display = show ? 'block' : 'none';
                console.log('🎮 TouchControls 強制顯示:', show);
            }
        };
        
        // 檢查媒體查詢
        window.checkMediaQueries = function() {
            const queries = [
                '(max-width: 1024px)',
                '(max-height: 768px)',
                '(pointer: coarse)',
                '(hover: none) and (pointer: coarse)',
                '(min-width: 768px) and (max-width: 1024px)',
                '(min-width: 414px) and (max-width: 768px)'
            ];
            
            console.log('📱 媒體查詢檢查:');
            queries.forEach(query => {
                const matches = window.matchMedia(query).matches;
                console.log(\`  \${query}: \${matches ? '✅' : '❌'}\`);
            });
            
            const controls = document.getElementById('touch-controls');
            const isVisible = controls && window.getComputedStyle(controls).display !== 'none';
            console.log(\`🎮 TouchControls 可見: \${isVisible ? '✅' : '❌'}\`);
        };`;
    
    // 在初始化代碼後添加調試功能
    content = content.replace(
        /console\.log\('💡 使用 testTouchControls\(\) 進行測試'\);/,
        `console.log('💡 使用 testTouchControls() 進行測試');
        
        ${debugScript.trim()}`
    );
    
    // 寫入修復後的文件
    fs.writeFileSync(htmlFile, content, 'utf8');
    
    console.log('✅ TouchControls CSS 和可見性已修復');
    console.log('🎨 修復內容:');
    console.log('  - 改進了媒體查詢條件');
    console.log('  - 添加了多種設備支援');
    console.log('  - 改進了響應式設計');
    console.log('  - 添加了調試功能');
    console.log('  - 優化了視覺效果');
    console.log('  - 添加了強制顯示選項');
    
} catch (error) {
    console.error('❌ 修復過程中發生錯誤:', error.message);
}

console.log('🎉 TouchControls CSS 修復完成！');
