/**
 * EduCreate 管理器類集合
 * Week 1 & Week 2 基礎設施支援類
 */

// Week 1: 檔案管理器
CanyonRunner.EduCreateFileManager = function(config) {
    this.gameContext = config.gameContext || 'canyon-runner';
    this.autoSave = config.autoSave || false;
    this.gameState = config.gameState;
    
    this.gameSessions = [];
    this.screenshots = [];
    this.sharedItems = [];
    
    this.initialize();
};

CanyonRunner.EduCreateFileManager.prototype = {
    initialize: function() {
        console.log('📁 FileManager initialized');
        this.loadFromLocalStorage();
    },
    
    saveGameSession: function(gameData) {
        gameData.id = gameData.id || 'session-' + Date.now();
        this.gameSessions.push(gameData);
        this.saveToLocalStorage();
        console.log('💾 Game session saved:', gameData.id);
    },
    
    getGameSessions: function() {
        return this.gameSessions;
    },
    
    getScreenshots: function() {
        return this.screenshots;
    },
    
    getSharedItems: function() {
        return this.sharedItems;
    },
    
    saveToLocalStorage: function() {
        var data = {
            gameSessions: this.gameSessions,
            screenshots: this.screenshots,
            sharedItems: this.sharedItems
        };
        localStorage.setItem('EduCreate_CanyonRunner_Files', JSON.stringify(data));
    },
    
    loadFromLocalStorage: function() {
        var data = localStorage.getItem('EduCreate_CanyonRunner_Files');
        if (data) {
            var parsed = JSON.parse(data);
            this.gameSessions = parsed.gameSessions || [];
            this.screenshots = parsed.screenshots || [];
            this.sharedItems = parsed.sharedItems || [];
        }
    }
};

// Week 1: 自動保存管理器
CanyonRunner.AutoSaveManager = function(config) {
    this.interval = config.interval || 30000;  // 30秒
    this.gameState = config.gameState;
    this.fileManager = config.fileManager;
    this.lastSaveTime = 0;
    this.autoSaveTimer = null;
    
    this.initialize();
};

CanyonRunner.AutoSaveManager.prototype = {
    initialize: function() {
        console.log('⏰ AutoSaveManager initialized');
        this.startAutoSave();
    },
    
    startAutoSave: function() {
        this.autoSaveTimer = setInterval(function() {
            this.triggerSave();
        }.bind(this), this.interval);
    },
    
    triggerSave: function() {
        var now = Date.now();
        if (now - this.lastSaveTime > this.interval) {
            this.performSave();
            this.lastSaveTime = now;
        }
    },
    
    performSave: function() {
        if (!this.gameState || !this.fileManager) return;
        
        var gameData = {
            id: 'autosave-' + Date.now(),
            type: 'auto-save',
            score: this.gameState.score || 0,
            health: this.gameState.health || 3,
            survivalTime: this.gameState.survivalTimer ? this.gameState.survivalTimer.seconds : 0,
            timestamp: new Date(),
            isAutoSave: true
        };
        
        this.fileManager.saveGameSession(gameData);
        console.log('💾 Auto-save completed');
    },
    
    stopAutoSave: function() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
        }
    }
};

// Week 1: 內容管理器
CanyonRunner.ContentManager = function(config) {
    this.gameState = config.gameState;
    this.fileManager = config.fileManager;
    
    this.initialize();
};

CanyonRunner.ContentManager.prototype = {
    initialize: function() {
        console.log('📄 ContentManager initialized');
    },
    
    saveGameReplay: function() {
        // 保存遊戲重播數據
        var replayData = {
            id: 'replay-' + Date.now(),
            type: 'game-replay',
            finalScore: this.gameState.score,
            duration: this.gameState.survivalTimer ? this.gameState.survivalTimer.seconds : 0,
            timestamp: new Date()
        };
        
        this.fileManager.saveGameSession(replayData);
        console.log('🎬 Game replay saved');
    },
    
    loadGameSession: function(sessionId) {
        var sessions = this.fileManager.getGameSessions();
        var session = sessions.find(function(s) { return s.id === sessionId; });
        
        if (session && !session.isAutoSave) {
            // 載入遊戲狀態
            this.gameState.score = session.score || 0;
            this.gameState.health = session.health || 3;
            console.log('📂 Game session loaded:', sessionId);
            return true;
        }
        return false;
    }
};

// Week 1: 同步管理器
CanyonRunner.SyncManager = function(config) {
    this.gameState = config.gameState;
    this.fileManager = config.fileManager;
    
    this.initialize();
};

CanyonRunner.SyncManager.prototype = {
    initialize: function() {
        console.log('🔄 SyncManager initialized');
    },
    
    syncGameData: function() {
        // 模擬雲端同步
        var syncData = {
            gameType: 'canyon-runner',
            playerStats: this.gameState.playerStats,
            achievements: this.getAchievements(),
            lastSync: new Date()
        };
        
        localStorage.setItem('EduCreate_CanyonRunner_Sync', JSON.stringify(syncData));
        console.log('☁️ Game data synced to cloud');
    },
    
    getAchievements: function() {
        return {
            highScore: this.gameState.playerStats ? this.gameState.playerStats.topScore : 0,
            longestSurvival: this.gameState.playerStats ? this.gameState.playerStats.topTime : 0,
            gamesPlayed: this.gameState.playerStats ? this.gameState.playerStats.gamesPlayed || 0 : 0
        };
    }
};

// Week 2: 縮圖管理器
CanyonRunner.ThumbnailManager = function(config) {
    this.gameState = config.gameState;
    this.quality = config.quality || 0.8;
    this.autoCapture = config.autoCapture || false;
    
    this.initialize();
};

CanyonRunner.ThumbnailManager.prototype = {
    initialize: function() {
        console.log('🖼️ ThumbnailManager initialized');
    },
    
    captureGameScreen: function() {
        try {
            var canvas = this.gameState.game.canvas;
            var dataURL = canvas.toDataURL('image/jpeg', this.quality);
            
            var thumbnailData = {
                id: 'screenshot-' + Date.now(),
                type: 'game-screenshot',
                data: dataURL,
                metadata: {
                    gameType: 'canyon-runner',
                    score: this.gameState.score || 0,
                    level: 'Level1',
                    timestamp: new Date()
                }
            };
            
            this.saveThumbnail(thumbnailData);
            console.log('📸 Screenshot captured');
            return thumbnailData;
        } catch (error) {
            console.error('❌ Screenshot capture failed:', error);
            return null;
        }
    },
    
    saveThumbnail: function(thumbnailData) {
        // 保存到檔案管理器
        var screenshots = JSON.parse(localStorage.getItem('EduCreate_CanyonRunner_Screenshots') || '[]');
        screenshots.push(thumbnailData);
        
        // 限制截圖數量（最多保存50張）
        if (screenshots.length > 50) {
            screenshots = screenshots.slice(-50);
        }
        
        localStorage.setItem('EduCreate_CanyonRunner_Screenshots', JSON.stringify(screenshots));
    },
    
    autoCapture: function() {
        if (this.autoCapture) {
            this.captureGameScreen();
        }
    },
    
    getScreenshots: function() {
        return JSON.parse(localStorage.getItem('EduCreate_CanyonRunner_Screenshots') || '[]');
    }
};

// Week 2: 檔案瀏覽器
CanyonRunner.FileBrowser = function(config) {
    this.gameMode = config.gameMode || false;
    this.showThumbnails = config.showThumbnails || false;
    this.fileManager = config.fileManager;
    
    this.initialize();
};

CanyonRunner.FileBrowser.prototype = {
    initialize: function() {
        console.log('📂 FileBrowser initialized');
    },
    
    openFileBrowser: function() {
        // 簡化版檔案瀏覽器
        var sessions = this.fileManager.getGameSessions();
        var screenshots = this.getScreenshots();
        
        var fileList = '📁 File Browser\n\n';
        fileList += '🎮 Game Sessions (' + sessions.length + '):\n';
        
        sessions.slice(-5).forEach(function(session, index) {
            var date = new Date(session.timestamp).toLocaleString();
            fileList += '  • ' + session.id + ' (Score: ' + session.score + ') - ' + date + '\n';
        });
        
        fileList += '\n📸 Screenshots (' + screenshots.length + '):\n';
        screenshots.slice(-3).forEach(function(screenshot, index) {
            var date = new Date(screenshot.metadata.timestamp).toLocaleString();
            fileList += '  • ' + screenshot.id + ' (Score: ' + screenshot.metadata.score + ') - ' + date + '\n';
        });
        
        alert(fileList);
    },
    
    getScreenshots: function() {
        return JSON.parse(localStorage.getItem('EduCreate_CanyonRunner_Screenshots') || '[]');
    }
};

// Week 2: 分享管理器
CanyonRunner.ShareManager = function(config) {
    this.gameState = config.gameState;
    this.thumbnailManager = config.thumbnailManager;
    
    this.initialize();
};

CanyonRunner.ShareManager.prototype = {
    initialize: function() {
        console.log('🔗 ShareManager initialized');
    },
    
    createShareLink: function(shareData) {
        // 生成分享數據
        var shareInfo = {
            id: 'share-' + Date.now(),
            type: shareData.type,
            title: shareData.title,
            description: shareData.description,
            gameData: {
                score: shareData.score,
                survivalTime: shareData.survivalTime,
                gameType: 'canyon-runner'
            },
            timestamp: new Date()
        };
        
        // 保存分享記錄
        var shares = JSON.parse(localStorage.getItem('EduCreate_CanyonRunner_Shares') || '[]');
        shares.push(shareInfo);
        localStorage.setItem('EduCreate_CanyonRunner_Shares', JSON.stringify(shares));
        
        // 生成分享連結（模擬）
        var shareUrl = 'https://educreate.app/share/' + shareInfo.id;
        
        // 顯示分享選項
        var shareText = '🔗 Share Your Game!\n\n';
        shareText += 'Title: ' + shareInfo.title + '\n';
        shareText += 'Score: ' + shareData.score + '\n';
        shareText += 'Survival Time: ' + shareData.survivalTime + 's\n\n';
        shareText += 'Share URL: ' + shareUrl + '\n\n';
        shareText += 'Copy this link to share with friends!';
        
        // 嘗試複製到剪貼板
        if (navigator.clipboard) {
            navigator.clipboard.writeText(shareUrl).then(function() {
                alert(shareText + '\n\n✅ Link copied to clipboard!');
            }).catch(function() {
                alert(shareText);
            });
        } else {
            alert(shareText);
        }
        
        console.log('🔗 Share link created:', shareUrl);
        return shareUrl;
    },
    
    getSharedItems: function() {
        return JSON.parse(localStorage.getItem('EduCreate_CanyonRunner_Shares') || '[]');
    }
};
