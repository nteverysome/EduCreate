const fs = require('fs');

console.log('🔧 修復 TouchControls 觸摸事件處理...');

const htmlFile = 'public/games/starshake-game/dist/index.html';

try {
    let content = fs.readFileSync(htmlFile, 'utf8');
    
    console.log('🔍 分析 TouchControls 問題...');
    
    // 修復 TouchControls 類 - 添加更好的事件處理和調試
    const improvedTouchControlsClass = `
        // 觸摸控制系統
        class TouchControls {
            constructor() {
                this.joystick = document.getElementById('touch-joystick');
                this.knob = document.getElementById('joystick-knob');
                this.shootBtn = document.getElementById('touch-shoot');
                this.fullscreenBtn = document.getElementById('fullscreen-btn');
                
                this.joystickActive = false;
                this.joystickCenter = { x: 0, y: 0 };
                this.currentDirection = { x: 0, y: 0 };
                this.shooting = false;
                
                // 調試標誌
                this.debug = true;
                
                this.init();
            }
            
            init() {
                if (this.debug) console.log('🎮 TouchControls 初始化開始...');
                
                // 檢查元素是否存在
                if (!this.joystick || !this.knob || !this.shootBtn) {
                    console.error('❌ TouchControls 元素未找到:', {
                        joystick: !!this.joystick,
                        knob: !!this.knob,
                        shootBtn: !!this.shootBtn
                    });
                    return;
                }
                
                // 搖桿控制 - 添加多種事件類型
                this.joystick.addEventListener('touchstart', this.onJoystickStart.bind(this), { passive: false });
                this.joystick.addEventListener('touchmove', this.onJoystickMove.bind(this), { passive: false });
                this.joystick.addEventListener('touchend', this.onJoystickEnd.bind(this), { passive: false });
                this.joystick.addEventListener('touchcancel', this.onJoystickEnd.bind(this), { passive: false });
                
                // 添加鼠標事件作為備用（用於桌面測試）
                this.joystick.addEventListener('mousedown', this.onJoystickStartMouse.bind(this));
                this.joystick.addEventListener('mousemove', this.onJoystickMoveMouse.bind(this));
                this.joystick.addEventListener('mouseup', this.onJoystickEndMouse.bind(this));
                this.joystick.addEventListener('mouseleave', this.onJoystickEndMouse.bind(this));
                
                // 射擊按鈕
                this.shootBtn.addEventListener('touchstart', this.onShootStart.bind(this), { passive: false });
                this.shootBtn.addEventListener('touchend', this.onShootEnd.bind(this), { passive: false });
                this.shootBtn.addEventListener('touchcancel', this.onShootEnd.bind(this), { passive: false });
                
                // 鼠標事件作為備用
                this.shootBtn.addEventListener('mousedown', this.onShootStart.bind(this));
                this.shootBtn.addEventListener('mouseup', this.onShootEnd.bind(this));
                
                // 全螢幕按鈕
                if (this.fullscreenBtn) {
                    this.fullscreenBtn.addEventListener('click', this.toggleFullscreen.bind(this));
                    this.fullscreenBtn.addEventListener('touchend', this.toggleFullscreen.bind(this));
                }
                
                // 防止默認觸摸行為
                document.addEventListener('touchmove', (e) => {
                    if (e.target.closest('#touch-controls')) {
                        e.preventDefault();
                    }
                }, { passive: false });
                
                // 防止上下文菜單
                document.addEventListener('contextmenu', (e) => {
                    if (e.target.closest('#touch-controls')) {
                        e.preventDefault();
                    }
                });
                
                if (this.debug) console.log('✅ TouchControls 事件監聽器已設置');
            }
            
            onJoystickStart(e) {
                e.preventDefault();
                if (this.debug) console.log('🕹️ 搖桿觸摸開始');
                this.joystickActive = true;
                const rect = this.joystick.getBoundingClientRect();
                this.joystickCenter = {
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                };
                if (this.debug) console.log('📍 搖桿中心:', this.joystickCenter);
            }
            
            onJoystickStartMouse(e) {
                e.preventDefault();
                if (this.debug) console.log('🖱️ 搖桿鼠標開始');
                this.joystickActive = true;
                const rect = this.joystick.getBoundingClientRect();
                this.joystickCenter = {
                    x: rect.left + rect.width / 2,
                    y: rect.top + rect.height / 2
                };
            }
            
            onJoystickMove(e) {
                if (!this.joystickActive) return;
                e.preventDefault();
                
                const touch = e.touches[0];
                if (!touch) return;
                
                this.updateJoystickPosition(touch.clientX, touch.clientY);
            }
            
            onJoystickMoveMouse(e) {
                if (!this.joystickActive) return;
                e.preventDefault();
                
                this.updateJoystickPosition(e.clientX, e.clientY);
            }
            
            updateJoystickPosition(clientX, clientY) {
                const deltaX = clientX - this.joystickCenter.x;
                const deltaY = clientY - this.joystickCenter.y;
                
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                const maxDistance = 40;
                
                if (distance <= maxDistance) {
                    this.knob.style.transform = \`translate(\${deltaX - 20}px, \${deltaY - 20}px)\`;
                    this.currentDirection = {
                        x: deltaX / maxDistance,
                        y: deltaY / maxDistance
                    };
                } else {
                    const angle = Math.atan2(deltaY, deltaX);
                    const limitedX = Math.cos(angle) * maxDistance;
                    const limitedY = Math.sin(angle) * maxDistance;
                    
                    this.knob.style.transform = \`translate(\${limitedX - 20}px, \${limitedY - 20}px)\`;
                    this.currentDirection = {
                        x: Math.cos(angle),
                        y: Math.sin(angle)
                    };
                }
                
                if (this.debug && Math.abs(this.currentDirection.x) > 0.1 || Math.abs(this.currentDirection.y) > 0.1) {
                    console.log('🎯 搖桿方向:', this.currentDirection);
                }
            }
            
            onJoystickEnd(e) {
                e.preventDefault();
                if (this.debug) console.log('🕹️ 搖桿觸摸結束');
                this.joystickActive = false;
                this.knob.style.transform = 'translate(-50%, -50%)';
                this.currentDirection = { x: 0, y: 0 };
            }
            
            onJoystickEndMouse(e) {
                e.preventDefault();
                if (this.debug) console.log('🖱️ 搖桿鼠標結束');
                this.joystickActive = false;
                this.knob.style.transform = 'translate(-50%, -50%)';
                this.currentDirection = { x: 0, y: 0 };
            }
            
            onShootStart(e) {
                e.preventDefault();
                if (this.debug) console.log('🚀 射擊開始');
                this.shooting = true;
                // 添加視覺反饋
                this.shootBtn.style.transform = 'scale(0.9)';
                this.shootBtn.style.backgroundColor = '#ff6b6b';
            }
            
            onShootEnd(e) {
                e.preventDefault();
                if (this.debug) console.log('🚀 射擊結束');
                this.shooting = false;
                // 恢復視覺反饋
                this.shootBtn.style.transform = 'scale(1)';
                this.shootBtn.style.backgroundColor = '#ff4757';
            }
            
            toggleFullscreen() {
                if (this.debug) console.log('🖥️ 切換全螢幕');
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(err => {
                        console.log('全螢幕請求失敗:', err);
                    });
                } else {
                    document.exitFullscreen().catch(err => {
                        console.log('退出全螢幕失敗:', err);
                    });
                }
            }
            
            // 獲取當前輸入狀態
            getInputState() {
                const state = {
                    direction: { ...this.currentDirection },
                    shooting: this.shooting
                };
                
                // 只在狀態變化時記錄
                if (this.debug && (Math.abs(state.direction.x) > 0.1 || Math.abs(state.direction.y) > 0.1 || state.shooting)) {
                    console.log('📊 當前狀態:', state);
                }
                
                return state;
            }
            
            // 測試方法
            testControls() {
                console.log('🧪 TouchControls 測試:');
                console.log('  - 搖桿元素:', !!this.joystick);
                console.log('  - 搖桿旋鈕:', !!this.knob);
                console.log('  - 射擊按鈕:', !!this.shootBtn);
                console.log('  - 全螢幕按鈕:', !!this.fullscreenBtn);
                console.log('  - 當前狀態:', this.getInputState());
                return true;
            }
        }`;
    
    // 替換 TouchControls 類
    const touchControlsRegex = /class TouchControls \{[\s\S]*?\n        \}/;
    content = content.replace(touchControlsRegex, improvedTouchControlsClass.trim());
    
    // 改進初始化代碼
    const improvedInit = `
        // 初始化觸摸控制
        window.touchControls = new TouchControls();
        
        // 添加測試方法到 window
        window.testTouchControls = () => window.touchControls.testControls();
        
        console.log('🎮 觸摸控制系統已初始化');
        console.log('💡 使用 testTouchControls() 進行測試');`;
    
    content = content.replace(
        /\/\/ 初始化觸摸控制[\s\S]*?console\.log\('🎮 觸摸控制系統已初始化'\);/,
        improvedInit.trim()
    );
    
    // 寫入修復後的文件
    fs.writeFileSync(htmlFile, content, 'utf8');
    
    console.log('✅ TouchControls 觸摸事件處理已修復');
    console.log('🔧 修復內容:');
    console.log('  - 添加了鼠標事件作為備用');
    console.log('  - 改進了事件監聽器設置');
    console.log('  - 添加了詳細的調試日誌');
    console.log('  - 添加了視覺反饋');
    console.log('  - 添加了測試方法');
    console.log('  - 改進了錯誤處理');
    
} catch (error) {
    console.error('❌ 修復過程中發生錯誤:', error.message);
}

console.log('🎉 TouchControls 事件修復完成！');
