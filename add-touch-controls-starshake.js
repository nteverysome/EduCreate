const fs = require('fs');
const path = require('path');

console.log('🎮 為 Starshake 遊戲添加觸擊控制功能...');

// 目標文件路徑
const starshakeJsFile = 'public/games/starshake-game/dist/assets/index-DEhXC0VF.js';
const starshakeHtmlFile = 'public/games/starshake-game/dist/index.html';

// 檢查文件是否存在
if (!fs.existsSync(starshakeJsFile)) {
    console.error('❌ 找不到 Starshake 遊戲 JS 文件:', starshakeJsFile);
    process.exit(1);
}

if (!fs.existsSync(starshakeHtmlFile)) {
    console.error('❌ 找不到 Starshake 遊戲 HTML 文件:', starshakeHtmlFile);
    process.exit(1);
}

// 讀取文件內容
let jsContent = fs.readFileSync(starshakeJsFile, 'utf8');
let htmlContent = fs.readFileSync(starshakeHtmlFile, 'utf8');

console.log('📝 原始 JS 文件大小:', jsContent.length, '字符');
console.log('📝 原始 HTML 文件大小:', htmlContent.length, '字符');

// 備份原始文件
const jsBackupFile = starshakeJsFile + '.backup';
const htmlBackupFile = starshakeHtmlFile + '.backup';

if (!fs.existsSync(jsBackupFile)) {
    fs.writeFileSync(jsBackupFile, jsContent);
    console.log('💾 已創建 JS 備份文件:', jsBackupFile);
}

if (!fs.existsSync(htmlBackupFile)) {
    fs.writeFileSync(htmlBackupFile, htmlContent);
    console.log('💾 已創建 HTML 備份文件:', htmlBackupFile);
}

// 修改 HTML 文件，添加觸摸控制樣式和元素
const touchControlsHtml = `
    <!-- 觸摸控制樣式 -->
    <style>
        /* 觸摸控制面板 */
        #touch-controls {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 200px;
            background: rgba(0, 0, 0, 0.3);
            display: none;
            z-index: 1000;
            pointer-events: none;
        }
        
        /* 移動控制區域 */
        .touch-joystick {
            position: absolute;
            bottom: 20px;
            left: 20px;
            width: 120px;
            height: 120px;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            pointer-events: all;
        }
        
        .touch-joystick-knob {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.6);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            transition: all 0.1s ease;
        }
        
        /* 射擊按鈕 */
        .touch-shoot-btn {
            position: absolute;
            bottom: 20px;
            right: 20px;
            width: 80px;
            height: 80px;
            background: rgba(255, 0, 0, 0.6);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
            pointer-events: all;
            user-select: none;
        }
        
        .touch-shoot-btn:active {
            background: rgba(255, 0, 0, 0.8);
            transform: scale(0.95);
        }
        
        /* 移動設備檢測 */
        @media (max-width: 768px), (pointer: coarse) {
            #touch-controls {
                display: block;
            }
        }
        
        /* 全螢幕按鈕 */
        .fullscreen-btn {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 20px;
            pointer-events: all;
            cursor: pointer;
        }
    </style>
</head>

<body>
    <div id="app">
        <div id="game-container"></div>
        
        <!-- 觸摸控制面板 -->
        <div id="touch-controls">
            <!-- 移動搖桿 -->
            <div class="touch-joystick" id="touch-joystick">
                <div class="touch-joystick-knob" id="joystick-knob"></div>
            </div>
            
            <!-- 射擊按鈕 -->
            <div class="touch-shoot-btn" id="touch-shoot">
                🚀
            </div>
            
            <!-- 全螢幕按鈕 -->
            <div class="fullscreen-btn" id="fullscreen-btn">
                ⛶
            </div>
        </div>
    </div>
    
    <!-- 觸摸控制 JavaScript -->
    <script>
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
                
                this.init();
            }
            
            init() {
                // 搖桿控制
                this.joystick.addEventListener('touchstart', this.onJoystickStart.bind(this));
                this.joystick.addEventListener('touchmove', this.onJoystickMove.bind(this));
                this.joystick.addEventListener('touchend', this.onJoystickEnd.bind(this));
                
                // 射擊按鈕
                this.shootBtn.addEventListener('touchstart', this.onShootStart.bind(this));
                this.shootBtn.addEventListener('touchend', this.onShootEnd.bind(this));
                
                // 全螢幕按鈕
                this.fullscreenBtn.addEventListener('click', this.toggleFullscreen.bind(this));
                
                // 防止默認觸摸行為
                document.addEventListener('touchmove', (e) => {
                    if (e.target.closest('#touch-controls')) {
                        e.preventDefault();
                    }
                }, { passive: false });
            }
            
            onJoystickStart(e) {
                e.preventDefault();
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
                const deltaX = touch.clientX - this.joystickCenter.x;
                const deltaY = touch.clientY - this.joystickCenter.y;
                
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
            }
            
            onJoystickEnd(e) {
                e.preventDefault();
                this.joystickActive = false;
                this.knob.style.transform = 'translate(-50%, -50%)';
                this.currentDirection = { x: 0, y: 0 };
            }
            
            onShootStart(e) {
                e.preventDefault();
                this.shooting = true;
            }
            
            onShootEnd(e) {
                e.preventDefault();
                this.shooting = false;
            }
            
            toggleFullscreen() {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
            }
            
            // 獲取當前輸入狀態
            getInputState() {
                return {
                    direction: this.currentDirection,
                    shooting: this.shooting
                };
            }
        }
        
        // 初始化觸摸控制
        window.touchControls = new TouchControls();
        
        console.log('🎮 觸摸控制系統已初始化');
    </script>
</body>`;

// 替換 HTML 內容 - 更精確的替換
htmlContent = htmlContent.replace(
    /<\/head>\s*<body>[\s\S]*?<\/body>/,
    touchControlsHtml
);

// 如果上面的替換失敗，嘗試另一種方法
if (!htmlContent.includes('touch-controls')) {
    // 在 </head> 前添加樣式
    const touchStyles = `
    <!-- 觸摸控制樣式 -->
    <style>
        /* 觸摸控制面板 */
        #touch-controls {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            height: 200px;
            background: rgba(0, 0, 0, 0.3);
            display: none;
            z-index: 1000;
            pointer-events: none;
        }

        /* 移動控制區域 */
        .touch-joystick {
            position: absolute;
            bottom: 20px;
            left: 20px;
            width: 120px;
            height: 120px;
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            pointer-events: all;
        }

        .touch-joystick-knob {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 40px;
            height: 40px;
            background: rgba(255, 255, 255, 0.6);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            transition: all 0.1s ease;
        }

        /* 射擊按鈕 */
        .touch-shoot-btn {
            position: absolute;
            bottom: 20px;
            right: 20px;
            width: 80px;
            height: 80px;
            background: rgba(255, 0, 0, 0.6);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 24px;
            font-weight: bold;
            pointer-events: all;
            user-select: none;
        }

        .touch-shoot-btn:active {
            background: rgba(255, 0, 0, 0.8);
            transform: scale(0.95);
        }

        /* 移動設備檢測 */
        @media (max-width: 768px), (pointer: coarse) {
            #touch-controls {
                display: block;
            }
        }

        /* 全螢幕按鈕 */
        .fullscreen-btn {
            position: absolute;
            top: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid rgba(255, 255, 255, 0.3);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 20px;
            pointer-events: all;
            cursor: pointer;
        }
    </style>
`;

    htmlContent = htmlContent.replace('</head>', touchStyles + '</head>');

    // 在 </body> 前添加觸摸控制元素
    const touchElements = `
        <!-- 觸摸控制面板 -->
        <div id="touch-controls">
            <!-- 移動搖桿 -->
            <div class="touch-joystick" id="touch-joystick">
                <div class="touch-joystick-knob" id="joystick-knob"></div>
            </div>

            <!-- 射擊按鈕 -->
            <div class="touch-shoot-btn" id="touch-shoot">
                🚀
            </div>

            <!-- 全螢幕按鈕 -->
            <div class="fullscreen-btn" id="fullscreen-btn">
                ⛶
            </div>
        </div>
    </div>

    <!-- 觸摸控制 JavaScript -->
    <script>
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

                this.init();
            }

            init() {
                // 搖桿控制
                this.joystick.addEventListener('touchstart', this.onJoystickStart.bind(this));
                this.joystick.addEventListener('touchmove', this.onJoystickMove.bind(this));
                this.joystick.addEventListener('touchend', this.onJoystickEnd.bind(this));

                // 射擊按鈕
                this.shootBtn.addEventListener('touchstart', this.onShootStart.bind(this));
                this.shootBtn.addEventListener('touchend', this.onShootEnd.bind(this));

                // 全螢幕按鈕
                this.fullscreenBtn.addEventListener('click', this.toggleFullscreen.bind(this));

                // 防止默認觸摸行為
                document.addEventListener('touchmove', (e) => {
                    if (e.target.closest('#touch-controls')) {
                        e.preventDefault();
                    }
                }, { passive: false });
            }

            onJoystickStart(e) {
                e.preventDefault();
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
                const deltaX = touch.clientX - this.joystickCenter.x;
                const deltaY = touch.clientY - this.joystickCenter.y;

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
            }

            onJoystickEnd(e) {
                e.preventDefault();
                this.joystickActive = false;
                this.knob.style.transform = 'translate(-50%, -50%)';
                this.currentDirection = { x: 0, y: 0 };
            }

            onShootStart(e) {
                e.preventDefault();
                this.shooting = true;
            }

            onShootEnd(e) {
                e.preventDefault();
                this.shooting = false;
            }

            toggleFullscreen() {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen();
                } else {
                    document.exitFullscreen();
                }
            }

            // 獲取當前輸入狀態
            getInputState() {
                return {
                    direction: this.currentDirection,
                    shooting: this.shooting
                };
            }
        }

        // 初始化觸摸控制
        window.touchControls = new TouchControls();

        console.log('🎮 觸摸控制系統已初始化');
    </script>
`;

    htmlContent = htmlContent.replace('</div>\n</body>', touchElements + '\n</body>');
}

console.log('✅ HTML 文件已修改，添加觸摸控制界面');

// 修改 JavaScript 文件，注入觸摸控制邏輯
// 由於是壓縮文件，我們需要在適當的位置注入代碼

// 查找玩家更新函數並添加觸摸控制
const touchControlsJs = `
// 觸摸控制整合
if(window.touchControls){
    const touchState = window.touchControls.getInputState();
    
    // 移動控制
    if(Math.abs(touchState.direction.x) > 0.1) {
        if(touchState.direction.x < 0) {
            this.x -= 5;
            this.anims.play(this.name + "left", true);
            this.shadow.setScale(0.5, 1);
        } else {
            this.x += 5;
            this.anims.play(this.name + "right", true);
            this.shadow.setScale(0.5, 1);
        }
    }
    
    if(Math.abs(touchState.direction.y) > 0.1) {
        if(touchState.direction.y < 0) {
            this.y -= 5;
        } else {
            this.y += 5;
        }
    }
    
    // 射擊控制
    if(touchState.shooting && !this.lastTouchShoot) {
        this.shoot();
    }
    this.lastTouchShoot = touchState.shooting;
}
`;

// 在玩家更新邏輯中注入觸摸控制
// 查找 cursor.left.isDown 的模式並在其前面添加觸摸控制
jsContent = jsContent.replace(
    /(if\s*\(this\.cursor\.left\.isDown\))/,
    touchControlsJs + '$1'
);

console.log('✅ JavaScript 文件已修改，添加觸摸控制邏輯');

// 寫入修改後的文件
fs.writeFileSync(starshakeJsFile, jsContent);
fs.writeFileSync(starshakeHtmlFile, htmlContent);

console.log('🎉 Starshake 遊戲觸擊功能添加完成！');
console.log('📁 修改的文件:');
console.log('  -', starshakeJsFile);
console.log('  -', starshakeHtmlFile);
console.log('📝 修改後 JS 文件大小:', jsContent.length, '字符');
console.log('📝 修改後 HTML 文件大小:', htmlContent.length, '字符');

console.log('\n🎮 新增功能:');
console.log('  ✅ 虛擬搖桿控制 (移動)');
console.log('  ✅ 觸摸射擊按鈕');
console.log('  ✅ 全螢幕支援');
console.log('  ✅ 響應式設計 (自動檢測移動設備)');
console.log('  ✅ 防止頁面滾動干擾');
