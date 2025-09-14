const fs = require('fs');
const path = require('path');

// 文件路徑
const mainJsPath = path.join(__dirname, 'shimozurdo-test', 'mobile-game-base-phaser3', 'main.js');

// Portrait 配置
const portraitConfig = {
    comment: '// Aspect Ratio 16:9 - Portrait (Original)',
    maxWidth: 1920,
    maxHeight: 1080,
    minWidth: 270,
    minHeight: 480,
    width: 540,
    height: 960,
    orientation: 'portrait'
};

// Landscape 配置
const landscapeConfig = {
    comment: '// Aspect Ratio 16:9 - Landscape (Modified for testing)',
    maxWidth: 1920,
    maxHeight: 1080,
    minWidth: 480,
    minHeight: 270,
    width: 960,
    height: 540,
    orientation: 'landscape'
};

function generateMainJs(config) {
    return `import Handler from './scenes/handler.js'
import Preload from './scenes/preload.js'
import Title from './scenes/title.js'
import Hub from './scenes/hub.js'

${config.comment}
const MAX_SIZE_WIDTH_SCREEN = ${config.maxWidth}
const MAX_SIZE_HEIGHT_SCREEN = ${config.maxHeight}
const MIN_SIZE_WIDTH_SCREEN = ${config.minWidth}
const MIN_SIZE_HEIGHT_SCREEN = ${config.minHeight}
const SIZE_WIDTH_SCREEN = ${config.width}
const SIZE_HEIGHT_SCREEN = ${config.height}

const config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.RESIZE,
        parent: 'game',
        width: SIZE_WIDTH_SCREEN,
        height: SIZE_HEIGHT_SCREEN,
        min: {
            width: MIN_SIZE_WIDTH_SCREEN,
            height: MIN_SIZE_HEIGHT_SCREEN
        },
        max: {
            width: MAX_SIZE_WIDTH_SCREEN,
            height: MAX_SIZE_HEIGHT_SCREEN
        }
    },
    dom: {
        createContainer: true
    },
    scene: [
        Handler,
        Preload,
        Title,
        Hub
    ]
}

const game = new Phaser.Game(config)

game.screenBaseSize = {
    maxWidth: MAX_SIZE_WIDTH_SCREEN,
    maxHeight: MAX_SIZE_HEIGHT_SCREEN,
    minWidth: MIN_SIZE_WIDTH_SCREEN,
    minHeight: MIN_SIZE_HEIGHT_SCREEN,
    width: SIZE_WIDTH_SCREEN,
    height: SIZE_HEIGHT_SCREEN
}

game.orientation = "${config.orientation}"
game.debugMode = false
`;
}

function switchToPortrait() {
    const content = generateMainJs(portraitConfig);
    fs.writeFileSync(mainJsPath, content, 'utf8');
    console.log('✅ 已切換到 Portrait 模式 (540×960)');
    console.log('📱 適合移動設備的垂直佈局');
}

function switchToLandscape() {
    const content = generateMainJs(landscapeConfig);
    fs.writeFileSync(mainJsPath, content, 'utf8');
    console.log('✅ 已切換到 Landscape 模式 (960×540)');
    console.log('🖥️ 適合桌面設備的水平佈局');
}

function getCurrentMode() {
    try {
        const content = fs.readFileSync(mainJsPath, 'utf8');
        if (content.includes('SIZE_WIDTH_SCREEN = 540')) {
            return 'portrait';
        } else if (content.includes('SIZE_WIDTH_SCREEN = 960')) {
            return 'landscape';
        } else {
            return 'unknown';
        }
    } catch (error) {
        console.error('❌ 無法讀取配置文件:', error.message);
        return 'error';
    }
}

// 命令行參數處理
const args = process.argv.slice(2);
const command = args[0];

switch (command) {
    case 'portrait':
        switchToPortrait();
        break;
    case 'landscape':
        switchToLandscape();
        break;
    case 'status':
        const currentMode = getCurrentMode();
        console.log(`📊 當前模式: ${currentMode.toUpperCase()}`);
        if (currentMode === 'portrait') {
            console.log('📱 Portrait: 540×960 (9:16) - Mobile-First');
        } else if (currentMode === 'landscape') {
            console.log('🖥️ Landscape: 960×540 (16:9) - Desktop-Adapted');
        }
        break;
    case 'toggle':
        const mode = getCurrentMode();
        if (mode === 'portrait') {
            switchToLandscape();
        } else if (mode === 'landscape') {
            switchToPortrait();
        } else {
            console.log('❌ 無法確定當前模式，預設切換到 Portrait');
            switchToPortrait();
        }
        break;
    default:
        console.log(`
🔄 shimozurdo 方向切換工具

使用方法:
  node switch-orientation.js portrait    # 切換到 Portrait 模式 (540×960)
  node switch-orientation.js landscape   # 切換到 Landscape 模式 (960×540)
  node switch-orientation.js toggle      # 自動切換模式
  node switch-orientation.js status      # 查看當前模式

模式說明:
  📱 Portrait:  540×960 (9:16) - 移動設備優先，垂直佈局
  🖥️ Landscape: 960×540 (16:9) - 桌面設備友好，水平佈局

注意: 切換後需要重新載入 http://localhost:8080 查看效果
        `);
        break;
}
