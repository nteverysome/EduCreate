/**
 * EduCreate 基礎設施整合到 Canyon Runner
 * 保持原版遊戲玩法，添加現代化檔案管理和自動保存功能
 */

// EduCreate 遊戲整合主類
CanyonRunner.EduCreateIntegration = function(gameState) {
    this.gameState = gameState;
    this.initialized = false;
    
    // Week 1: 基礎設施組件
    this.fileManager = null;
    this.autoSaveManager = null;
    this.contentManager = null;
    this.syncManager = null;
    
    // Week 2: 檔案管理和縮圖組件
    this.thumbnailManager = null;
    this.fileBrowser = null;
    this.shareManager = null;
    
    // UI 組件
    this.eduCreateButton = null;
    this.fileManagerButton = null;
    this.eduCreatePanel = null;
    
    this.initialize();
};

CanyonRunner.EduCreateIntegration.prototype = {
    
    initialize: function() {
        if (this.initialized) return;
        
        console.log('🔧 Initializing EduCreate Integration...');
        
        // 初始化 Week 1 基礎設施
        this.initializeWeek1Systems();
        
        // 初始化 Week 2 檔案管理系統
        this.initializeWeek2Systems();
        
        // 設置遊戲 UI
        this.setupGameUI();
        
        // 設置事件監聽
        this.setupEventListeners();
        
        this.initialized = true;
        console.log('✅ EduCreate Integration initialized successfully!');
    },
    
    // Week 1: 基礎設施初始化
    initializeWeek1Systems: function() {
        console.log('📁 Initializing Week 1 Systems...');
        
        // 檔案管理系統
        this.fileManager = new CanyonRunner.EduCreateFileManager({
            gameContext: 'canyon-runner',
            autoSave: true,
            gameState: this.gameState
        });
        
        // 自動保存管理器
        this.autoSaveManager = new CanyonRunner.AutoSaveManager({
            interval: 30000,  // 30秒自動保存
            gameState: this.gameState,
            fileManager: this.fileManager
        });
        
        // 內容管理器
        this.contentManager = new CanyonRunner.ContentManager({
            gameState: this.gameState,
            fileManager: this.fileManager
        });
        
        // 同步管理器
        this.syncManager = new CanyonRunner.SyncManager({
            gameState: this.gameState,
            fileManager: this.fileManager
        });
    },
    
    // Week 2: 檔案管理和縮圖系統初始化
    initializeWeek2Systems: function() {
        console.log('🖼️ Initializing Week 2 Systems...');
        
        // 縮圖管理器
        this.thumbnailManager = new CanyonRunner.ThumbnailManager({
            gameState: this.gameState,
            quality: 0.8,
            autoCapture: true
        });
        
        // 檔案瀏覽器
        this.fileBrowser = new CanyonRunner.FileBrowser({
            gameMode: true,
            showThumbnails: true,
            fileManager: this.fileManager
        });
        
        // 分享管理器
        this.shareManager = new CanyonRunner.ShareManager({
            gameState: this.gameState,
            thumbnailManager: this.thumbnailManager
        });
    },
    
    // 設置遊戲內 UI
    setupGameUI: function() {
        console.log('🎮 Setting up Game UI...');
        
        // EduCreate 主按鈕（右上角）
        this.eduCreateButton = this.gameState.game.add.button(
            this.gameState.game.world.centerX + 280, 
            this.gameState.game.world.centerY - 280, 
            'sprites', 
            this.openEduCreatePanel, 
            this, 
            'pause-button',  // 暫時使用現有圖標
            'pause-button', 
            'pause-button'
        );
        this.eduCreateButton.fixedToCamera = true;
        this.eduCreateButton.tint = 0x00ff00;  // 綠色標識
        
        // 檔案管理按鈕
        this.fileManagerButton = this.gameState.game.add.button(
            this.gameState.game.world.centerX + 240, 
            this.gameState.game.world.centerY - 240, 
            'sprites', 
            this.openFileManager, 
            this, 
            'sound-icon',  // 暫時使用現有圖標
            'sound-icon', 
            'sound-icon'
        );
        this.fileManagerButton.fixedToCamera = true;
        this.fileManagerButton.tint = 0x0099ff;  // 藍色標識
        
        // 添加提示文字
        this.addUILabels();
    },
    
    addUILabels: function() {
        var labelStyle = { 
            font: "12px Arial", 
            fill: "#ffffff", 
            stroke: "#000000", 
            strokeThickness: 2 
        };
        
        // EduCreate 按鈕標籤
        this.eduCreateLabel = this.gameState.game.add.text(
            this.gameState.game.world.centerX + 260, 
            this.gameState.game.world.centerY - 250, 
            "EduCreate", 
            labelStyle
        );
        this.eduCreateLabel.fixedToCamera = true;
        
        // 檔案管理按鈕標籤
        this.fileLabel = this.gameState.game.add.text(
            this.gameState.game.world.centerX + 225, 
            this.gameState.game.world.centerY - 210, 
            "Files", 
            labelStyle
        );
        this.fileLabel.fixedToCamera = true;
    },
    
    // 設置事件監聽
    setupEventListeners: function() {
        console.log('📡 Setting up Event Listeners...');
        
        // 監聽分數變化
        this.gameState.originalScoreUpdate = this.gameState.scoreUpdate || function() {};
        this.gameState.scoreUpdate = function() {
            this.originalScoreUpdate();
            this.eduCreateIntegration.onScoreUpdate();
        }.bind(this.gameState);
        
        // 監聽遊戲結束
        this.gameState.originalGameOver = this.gameState.handleGameOver || function() {};
        this.gameState.handleGameOver = function() {
            this.eduCreateIntegration.onGameOver();
            this.originalGameOver();
        }.bind(this.gameState);
    },
    
    // 打開 EduCreate 面板
    openEduCreatePanel: function() {
        console.log('🎛️ Opening EduCreate Panel...');
        
        // 暫停遊戲
        this.gameState.game.paused = true;
        
        // 創建面板（簡化版本）
        this.showEduCreateMenu();
    },
    
    showEduCreateMenu: function() {
        // 創建半透明背景
        this.menuBackground = this.gameState.game.add.graphics(0, 0);
        this.menuBackground.beginFill(0x000000, 0.7);
        this.menuBackground.drawRect(0, 0, this.gameState.game.width, this.gameState.game.height);
        this.menuBackground.fixedToCamera = true;
        
        // 創建選單
        var menuStyle = { 
            font: "24px Arial", 
            fill: "#ffffff", 
            stroke: "#000000", 
            strokeThickness: 3,
            align: "center"
        };
        
        this.menuTitle = this.gameState.game.add.text(
            this.gameState.game.world.centerX, 
            this.gameState.game.world.centerY - 100, 
            "EduCreate Integration", 
            menuStyle
        );
        this.menuTitle.anchor.setTo(0.5, 0.5);
        this.menuTitle.fixedToCamera = true;
        
        // 功能按鈕
        this.createMenuButtons();
        
        // 關閉按鈕
        this.closeButton = this.gameState.game.add.button(
            this.gameState.game.world.centerX, 
            this.gameState.game.world.centerY + 150, 
            'sprites', 
            this.closeEduCreatePanel, 
            this, 
            'pause-button',
            'pause-button', 
            'pause-button'
        );
        this.closeButton.anchor.setTo(0.5, 0.5);
        this.closeButton.fixedToCamera = true;
        
        var closeStyle = { font: "18px Arial", fill: "#ffffff" };
        this.closeLabel = this.gameState.game.add.text(
            this.gameState.game.world.centerX, 
            this.gameState.game.world.centerY + 180, 
            "Close", 
            closeStyle
        );
        this.closeLabel.anchor.setTo(0.5, 0.5);
        this.closeLabel.fixedToCamera = true;
    },
    
    createMenuButtons: function() {
        var buttonStyle = { 
            font: "16px Arial", 
            fill: "#ffffff", 
            stroke: "#000000", 
            strokeThickness: 2 
        };
        
        // 保存遊戲按鈕
        this.saveButton = this.gameState.game.add.text(
            this.gameState.game.world.centerX, 
            this.gameState.game.world.centerY - 50, 
            "💾 Save Game Progress", 
            buttonStyle
        );
        this.saveButton.anchor.setTo(0.5, 0.5);
        this.saveButton.fixedToCamera = true;
        this.saveButton.inputEnabled = true;
        this.saveButton.events.onInputUp.add(this.saveGameProgress, this);
        
        // 截圖按鈕
        this.screenshotButton = this.gameState.game.add.text(
            this.gameState.game.world.centerX, 
            this.gameState.game.world.centerY - 10, 
            "📸 Take Screenshot", 
            buttonStyle
        );
        this.screenshotButton.anchor.setTo(0.5, 0.5);
        this.screenshotButton.fixedToCamera = true;
        this.screenshotButton.inputEnabled = true;
        this.screenshotButton.events.onInputUp.add(this.takeScreenshot, this);
        
        // 分享按鈕
        this.shareButton = this.gameState.game.add.text(
            this.gameState.game.world.centerX, 
            this.gameState.game.world.centerY + 30, 
            "🔗 Share Game", 
            buttonStyle
        );
        this.shareButton.anchor.setTo(0.5, 0.5);
        this.shareButton.fixedToCamera = true;
        this.shareButton.inputEnabled = true;
        this.shareButton.events.onInputUp.add(this.shareGame, this);
        
        // 檔案瀏覽按鈕
        this.browseButton = this.gameState.game.add.text(
            this.gameState.game.world.centerX, 
            this.gameState.game.world.centerY + 70, 
            "📁 Browse Files", 
            buttonStyle
        );
        this.browseButton.anchor.setTo(0.5, 0.5);
        this.browseButton.fixedToCamera = true;
        this.browseButton.inputEnabled = true;
        this.browseButton.events.onInputUp.add(this.openFileManager, this);
    },
    
    // 關閉 EduCreate 面板
    closeEduCreatePanel: function() {
        console.log('❌ Closing EduCreate Panel...');
        
        // 移除所有 UI 元素
        if (this.menuBackground) this.menuBackground.destroy();
        if (this.menuTitle) this.menuTitle.destroy();
        if (this.saveButton) this.saveButton.destroy();
        if (this.screenshotButton) this.screenshotButton.destroy();
        if (this.shareButton) this.shareButton.destroy();
        if (this.browseButton) this.browseButton.destroy();
        if (this.closeButton) this.closeButton.destroy();
        if (this.closeLabel) this.closeLabel.destroy();
        
        // 恢復遊戲
        this.gameState.game.paused = false;
    },
    
    // 打開檔案管理器
    openFileManager: function() {
        console.log('📁 Opening File Manager...');
        this.closeEduCreatePanel();
        // 這裡會整合完整的檔案瀏覽器
        this.showSimpleFileList();
    },
    
    showSimpleFileList: function() {
        // 簡化版檔案列表
        alert('📁 File Manager\n\n' + 
              '• Game Sessions: ' + (this.fileManager.getGameSessions().length) + '\n' +
              '• Screenshots: ' + (this.fileManager.getScreenshots().length) + '\n' +
              '• Shared Items: ' + (this.fileManager.getSharedItems().length) + '\n\n' +
              'Full file browser coming soon!');
    },
    
    // 事件處理函數
    onScoreUpdate: function() {
        // 分數更新時的處理
        this.autoSaveManager.triggerSave();
        
        // 每10分自動截圖
        if (this.gameState.score % 10 === 0) {
            this.thumbnailManager.autoCapture();
        }
    },
    
    onGameOver: function() {
        console.log('🎮 Game Over - Saving final state...');
        
        // 遊戲結束時保存最終狀態
        this.saveGameProgress();
        this.takeScreenshot();
        
        // 顯示分享選項
        setTimeout(function() {
            if (confirm('🎮 Game Over!\n\nWould you like to share your score?')) {
                this.shareGame();
            }
        }.bind(this), 1000);
    },
    
    // 核心功能實現
    saveGameProgress: function() {
        console.log('💾 Saving game progress...');
        
        var gameData = {
            id: 'canyon-runner-session-' + Date.now(),
            type: 'canyon-runner-game',
            score: this.gameState.score,
            survivalTime: this.gameState.survivalTimer ? this.gameState.survivalTimer.seconds : 0,
            health: this.gameState.health,
            level: 'Level1',
            timestamp: new Date(),
            playerStats: this.gameState.playerStats
        };
        
        this.fileManager.saveGameSession(gameData);
        
        // 顯示保存成功提示
        this.showNotification('💾 Game saved successfully!');
    },
    
    takeScreenshot: function() {
        console.log('📸 Taking screenshot...');
        
        this.thumbnailManager.captureGameScreen();
        this.showNotification('📸 Screenshot saved!');
    },
    
    shareGame: function() {
        console.log('🔗 Sharing game...');
        
        var shareData = {
            type: 'canyon-runner-session',
            title: 'Canyon Runner - Score: ' + this.gameState.score,
            description: 'Check out my Canyon Runner score!',
            score: this.gameState.score,
            survivalTime: this.gameState.survivalTimer ? this.gameState.survivalTimer.seconds : 0
        };
        
        this.shareManager.createShareLink(shareData);
        this.showNotification('🔗 Share link created!');
    },
    
    showNotification: function(message) {
        // 簡單的通知顯示
        var notification = this.gameState.game.add.text(
            this.gameState.game.world.centerX, 
            50, 
            message, 
            { font: "16px Arial", fill: "#00ff00", stroke: "#000000", strokeThickness: 2 }
        );
        notification.anchor.setTo(0.5, 0.5);
        notification.fixedToCamera = true;
        
        // 3秒後消失
        this.gameState.game.time.events.add(3000, function() {
            notification.destroy();
        }, this);
    }
};
