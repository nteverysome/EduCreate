// Game 場景 - 主遊戲邏輯（卡片拖動配對）
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });

        // 配對數據（將從 API 載入）
        this.pairs = [];
        this.isLoadingVocabulary = false;
        this.vocabularyLoadError = null;

        // 遊戲狀態
        this.leftCards = [];
        this.rightCards = [];
        this.matchedPairs = new Set();
        this.isDragging = false;
        this.dragStartCard = null;
        this.sceneStopped = false;  // 🔥 場景停止狀態標記

        // 🔥 分頁功能
        this.itemsPerPage = 7;  // 默認每頁 7 個詞彙（可配置）
        this.currentPage = 0;   // 當前頁碼（從 0 開始）
        this.totalPages = 1;    // 總頁數
        this.enablePagination = false;  // 是否啟用分頁
        this.pageIndicatorText = null;  // 分頁指示器文字對象

        // 🔥 計時器功能
        this.timerType = 'none';  // 計時器類型：none, countUp, countDown
        this.timerMinutes = 5;    // 倒數計時分鐘數
        this.timerSeconds = 0;    // 倒數計時秒數
        this.startTime = null;    // 正向計時開始時間
        this.remainingTime = 0;   // 倒數計時剩餘時間（秒）
        this.timerText = null;    // 計時器文字對象
        this.timerEvent = null;   // 計時器事件

        // 🔥 遊戲選項
        this.layout = 'separated';  // 佈局模式：separated, mixed
        this.random = 'different';  // 隨機模式：different, same
        this.showAnswers = false;   // 遊戲結束時顯示答案
    }

    // 從 API 載入詞彙數據
    async loadVocabularyFromAPI() {
        try {
            // 從 URL 參數獲取 activityId
            const urlParams = new URLSearchParams(window.location.search);
            const activityId = urlParams.get('activityId');
            const customVocabulary = urlParams.get('customVocabulary');

            console.log('🔍 Match-up 遊戲 - URL 參數:', { activityId, customVocabulary });

            // 🔥 修復：必須提供 activityId，不使用默認數據
            if (!activityId) {
                throw new Error('❌ 缺少 activityId 參數，無法載入詞彙數據');
            }

            if (customVocabulary !== 'true') {
                throw new Error('❌ 缺少 customVocabulary=true 參數，無法載入詞彙數據');
            }

            // 從 API 載入詞彙數據
            console.log(`🔄 從 API 載入詞彙: /api/activities/${activityId}`);
            const response = await fetch(`/api/activities/${activityId}`);

            if (!response.ok) {
                throw new Error(`API 請求失敗: ${response.status} ${response.statusText}`);
            }

            const activity = await response.json();
            console.log('✅ 活動數據載入成功:', activity);

            // 提取詞彙數據（支持多種數據源）
            let vocabularyData = [];

            if (activity.vocabularyItems && Array.isArray(activity.vocabularyItems) && activity.vocabularyItems.length > 0) {
                // 新架構：從關聯表中獲取詞彙數據
                vocabularyData = activity.vocabularyItems;
                console.log('📝 從 vocabularyItems 載入詞彙:', vocabularyData.length, '個');
            } else if (activity.elements && Array.isArray(activity.elements) && activity.elements.length > 0) {
                // 中間架構：從 elements 字段載入詞彙數據
                vocabularyData = activity.elements;
                console.log('📝 從 elements 載入詞彙:', vocabularyData.length, '個');
            } else if (activity.content && activity.content.vocabularyItems && Array.isArray(activity.content.vocabularyItems)) {
                // 舊架構：從 content 中獲取詞彙數據
                vocabularyData = activity.content.vocabularyItems;
                console.log('📝 從 content.vocabularyItems 載入詞彙:', vocabularyData.length, '個');
            }

            // 轉換為遊戲所需的格式
            if (vocabularyData.length > 0) {
                this.pairs = vocabularyData.map((item, index) => ({
                    id: index + 1,
                    question: item.english || item.word || '',
                    answer: item.chinese || item.translation || ''
                }));

                console.log('✅ 詞彙數據轉換完成:', this.pairs);
                return true;
            } else {
                // 🔥 修復：不使用默認數據，拋出錯誤
                throw new Error('❌ 活動中沒有詞彙數據，請先添加詞彙');
            }
        } catch (error) {
            console.error('❌ 載入詞彙數據失敗:', error);
            this.vocabularyLoadError = error.message;
            // 🔥 修復：不使用默認數據，直接拋出錯誤
            throw error;
        }
    }

    async create() {
        console.log('🎮 GameScene: create 方法開始');
        console.log('🎮 GameScene: 場景尺寸', {
            width: this.scale.width,
            height: this.scale.height,
            gameWidth: this.game.config.width,
            gameHeight: this.game.config.height
        });

        // 清空數組（防止重新開始時重複）
        this.leftCards = [];
        this.rightCards = [];
        this.matchedPairs = new Set();
        this.isDragging = false;
        this.dragStartCard = null;
        this.submitButton = null;  // 🔥 提交答案按鈕

        // 顯示載入提示
        const width = this.scale.width;
        const height = this.scale.height;
        console.log('🎮 GameScene: 創建白色背景和載入文字', { width, height });

        this.add.rectangle(width / 2, height / 2, width, height, 0xffffff).setDepth(-1);
        const loadingText = this.add.text(width / 2, height / 2, '載入詞彙中...', {
            fontSize: '24px',
            color: '#333333',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        console.log('🎮 GameScene: 開始載入詞彙數據');

        // 🔥 修復：使用 try-catch 處理錯誤
        this.isLoadingVocabulary = true;
        let success = false;

        try {
            success = await this.loadVocabularyFromAPI();
            console.log('🎮 GameScene: 詞彙數據載入完成', { success, pairsCount: this.pairs.length });
        } catch (error) {
            console.error('❌ GameScene: 詞彙數據載入失敗', error);
            this.vocabularyLoadError = error.message;
            success = false;
        }

        this.isLoadingVocabulary = false;

        // 移除載入提示
        loadingText.destroy();
        console.log('🎮 GameScene: 載入文字已移除');

        // 🔥 修復：如果載入失敗，顯示錯誤信息並停止遊戲
        if (!success || this.vocabularyLoadError) {
            console.warn('⚠️ GameScene: 顯示錯誤信息', this.vocabularyLoadError);

            // 顯示錯誤標題
            this.add.text(width / 2, height / 2 - 80, '❌ 載入詞彙失敗', {
                fontSize: '32px',
                color: '#ff0000',
                fontFamily: 'Arial',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            // 顯示錯誤訊息
            this.add.text(width / 2, height / 2 - 20, this.vocabularyLoadError || '未知錯誤', {
                fontSize: '18px',
                color: '#666666',
                fontFamily: 'Arial',
                align: 'center',
                wordWrap: { width: width - 100 }
            }).setOrigin(0.5);

            // 顯示解決方案
            this.add.text(width / 2, height / 2 + 40, '請確認：', {
                fontSize: '16px',
                color: '#999999',
                fontFamily: 'Arial'
            }).setOrigin(0.5);

            this.add.text(width / 2, height / 2 + 70, '1. URL 包含正確的 activityId 參數', {
                fontSize: '14px',
                color: '#999999',
                fontFamily: 'Arial'
            }).setOrigin(0.5);

            this.add.text(width / 2, height / 2 + 95, '2. URL 包含 customVocabulary=true 參數', {
                fontSize: '14px',
                color: '#999999',
                fontFamily: 'Arial'
            }).setOrigin(0.5);

            this.add.text(width / 2, height / 2 + 120, '3. 活動中已添加詞彙數據', {
                fontSize: '14px',
                color: '#999999',
                fontFamily: 'Arial'
            }).setOrigin(0.5);

            // 停止遊戲，不繼續執行
            return;
        }

        // 🔥 獲取 Handler 場景引用
        this.handlerScene = this.scene.get('handler');
        console.log('🎮 GameScene: Handler 場景引用', this.handlerScene ? '✅ 存在' : '❌ 不存在');

        // 🔥 調用 Handler 的 updateResize 方法設定響應式
        if (this.handlerScene && this.handlerScene.updateResize) {
            console.log('🎮 GameScene: 調用 Handler.updateResize');
            this.handlerScene.updateResize(this);
        } else {
            console.warn('⚠️ GameScene: handlerScene 未初始化或 updateResize 方法不存在');
        }

        // 🔥 初始化分頁設置
        this.initializePagination();

        // 🔥 初始化遊戲選項
        this.initializeGameOptions();

        // 🔥 初始化計時器
        this.initializeTimer();

        // 獲取當前螢幕尺寸
        console.log('🎮 GameScene: 調用 updateLayout');
        this.updateLayout();
        console.log('🎮 GameScene: updateLayout 完成');

        // 監聽螢幕尺寸變化
        this.scale.on('resize', this.handleResize, this);
        console.log('🎮 GameScene: create 方法完成');
    }

    // 🔥 初始化分頁設置
    initializePagination() {
        const totalPairs = this.pairs.length;
        console.log('📄 初始化分頁設置 - 總詞彙數:', totalPairs);

        // 從 URL 參數讀取設置
        const urlParams = new URLSearchParams(window.location.search);
        const itemsPerPageParam = urlParams.get('itemsPerPage');
        const autoProceedParam = urlParams.get('autoProceed');

        // 讀取每頁顯示數量
        if (itemsPerPageParam) {
            this.itemsPerPage = parseInt(itemsPerPageParam, 10);
            console.log('📄 從 URL 讀取 itemsPerPage:', this.itemsPerPage);
        } else {
            // 根據詞彙數量自動決定每頁顯示數量
            if (totalPairs <= 6) {
                this.itemsPerPage = totalPairs;  // 不分頁
            } else if (totalPairs <= 12) {
                this.itemsPerPage = 4;  // 每頁 4 個
            } else if (totalPairs <= 18) {
                this.itemsPerPage = 5;  // 每頁 5 個
            } else if (totalPairs <= 24) {
                this.itemsPerPage = 6;  // 每頁 6 個
            } else {
                this.itemsPerPage = 7;  // 每頁 7 個
            }
            console.log('📄 自動決定 itemsPerPage:', this.itemsPerPage);
        }

        // 讀取自動繼續設置
        if (autoProceedParam !== null) {
            this.autoProceed = autoProceedParam === 'true';
            console.log('📄 從 URL 讀取 autoProceed:', this.autoProceed);
        } else {
            this.autoProceed = true;  // 默認開啟
            console.log('📄 使用默認 autoProceed:', this.autoProceed);
        }

        // 計算總頁數
        this.totalPages = Math.ceil(totalPairs / this.itemsPerPage);

        // 決定是否啟用分頁
        this.enablePagination = this.totalPages > 1;

        // 重置當前頁碼
        this.currentPage = 0;

        console.log('📄 分頁設置完成:', {
            totalPairs,
            itemsPerPage: this.itemsPerPage,
            totalPages: this.totalPages,
            enablePagination: this.enablePagination,
            autoProceed: this.autoProceed
        });
    }

    // 🔥 初始化遊戲選項
    initializeGameOptions() {
        const urlParams = new URLSearchParams(window.location.search);

        // 讀取佈局選項
        this.layout = urlParams.get('layout') || 'separated';
        console.log('🎮 佈局模式:', this.layout);

        // 讀取隨機選項
        this.random = urlParams.get('random') || 'different';
        console.log('🎲 隨機模式:', this.random);

        // 讀取顯示答案選項
        this.showAnswers = urlParams.get('showAnswers') === 'true';
        console.log('📝 顯示答案:', this.showAnswers);
    }

    // 🔥 初始化計時器
    initializeTimer() {
        const urlParams = new URLSearchParams(window.location.search);

        // 讀取計時器類型
        this.timerType = urlParams.get('timerType') || 'none';
        console.log('⏱️ 計時器類型:', this.timerType);

        if (this.timerType === 'countDown') {
            // 讀取倒數計時時間
            this.timerMinutes = parseInt(urlParams.get('timerMinutes') || '5', 10);
            this.timerSeconds = parseInt(urlParams.get('timerSeconds') || '0', 10);
            this.remainingTime = this.timerMinutes * 60 + this.timerSeconds;
            console.log('⏱️ 倒數計時時間:', this.timerMinutes, '分', this.timerSeconds, '秒');
        } else if (this.timerType === 'countUp') {
            // 記錄開始時間
            this.startTime = Date.now();
            console.log('⏱️ 正向計時開始');
        }
    }

    // 🔥 創建計時器 UI
    createTimerUI() {
        const width = this.scale.width;

        if (this.timerType === 'none') {
            return;  // 不顯示計時器
        }

        // 創建計時器文字
        const timerColor = this.timerType === 'countDown' ? '#ff0000' : '#000000';
        const initialText = this.timerType === 'countDown'
            ? this.formatTime(this.remainingTime)
            : '00:00';

        this.timerText = this.add.text(width - 20, 20, initialText, {
            fontSize: '28px',
            color: timerColor,
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(1, 0).setDepth(1000);

        // 如果是倒數計時，啟動計時器事件
        if (this.timerType === 'countDown') {
            this.timerEvent = this.time.addEvent({
                delay: 1000,
                callback: this.updateCountDownTimer,
                callbackScope: this,
                loop: true
            });
        } else if (this.timerType === 'countUp') {
            // 正向計時每秒更新
            this.timerEvent = this.time.addEvent({
                delay: 1000,
                callback: this.updateCountUpTimer,
                callbackScope: this,
                loop: true
            });
        }

        console.log('⏱️ 計時器 UI 已創建');
    }

    // 🔥 更新倒數計時器
    updateCountDownTimer() {
        this.remainingTime--;

        if (this.remainingTime <= 0) {
            // 時間到
            this.onTimeUp();
        } else {
            // 更新顯示
            if (this.timerText) {
                this.timerText.setText(this.formatTime(this.remainingTime));

                // 最後 10 秒變紅色並閃爍
                if (this.remainingTime <= 10) {
                    this.timerText.setColor('#ff0000');
                    this.tweens.add({
                        targets: this.timerText,
                        alpha: 0.3,
                        duration: 500,
                        yoyo: true
                    });
                }
            }
        }
    }

    // 🔥 更新正向計時器
    updateCountUpTimer() {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        if (this.timerText) {
            this.timerText.setText(this.formatTime(elapsed));
        }
    }

    // 🔥 格式化時間（秒 -> MM:SS）
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // 🔥 時間到達處理
    onTimeUp() {
        console.log('⏱️ 時間到！');

        // 停止計時器
        if (this.timerEvent) {
            this.timerEvent.remove();
        }

        // 顯示時間到訊息
        this.showTimeUpMessage();
    }

    // 🔥 顯示時間到訊息
    showTimeUpMessage() {
        const width = this.scale.width;
        const height = this.scale.height;

        // 創建半透明背景
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
            .setDepth(2000);

        // 顯示時間到訊息
        const messageText = this.add.text(width / 2, height / 2 - 50, '⏰ 時間到！', {
            fontSize: '48px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(2001);

        // 顯示完成進度
        const completedCount = this.matchedPairs.size;
        const totalCount = this.getCurrentPagePairs().length;
        const progressText = this.add.text(
            width / 2,
            height / 2 + 20,
            `已完成 ${completedCount} / ${totalCount} 個配對`,
            {
                fontSize: '24px',
                color: '#ffffff',
                fontFamily: 'Arial'
            }
        ).setOrigin(0.5).setDepth(2001);

        // 如果開啟顯示答案，顯示答案按鈕
        if (this.showAnswers) {
            const showAnswersButton = this.add.text(
                width / 2,
                height / 2 + 80,
                '📝 查看答案',
                {
                    fontSize: '24px',
                    color: '#ffffff',
                    fontFamily: 'Arial',
                    backgroundColor: '#4CAF50',
                    padding: { x: 20, y: 10 }
                }
            ).setOrigin(0.5).setDepth(2001).setInteractive({ useHandCursor: true });

            showAnswersButton.on('pointerdown', () => {
                overlay.destroy();
                messageText.destroy();
                progressText.destroy();
                showAnswersButton.destroy();
                this.showAnswersScreen();
            });
        }
    }

    updateLayout() {
        console.log('🎮 GameScene: updateLayout 開始');
        console.log('🎮 GameScene: 當前場景尺寸', {
            width: this.scale.width,
            height: this.scale.height
        });

        // 清除所有現有元素
        console.log('🎮 GameScene: 清除所有現有元素');
        this.children.removeAll(true);

        // 獲取當前螢幕尺寸
        const width = this.scale.width;
        const height = this.scale.height;

        console.log('🎮 GameScene: 添加白色背景', { width, height });
        // 添加白色背景
        this.add.rectangle(width / 2, height / 2, width, height, 0xffffff).setDepth(-1);

        // 🔥 移除標題：用戶要求拿掉遊戲內的 "Match up" 標題

        console.log('🎮 GameScene: 創建卡片');
        // 創建卡片
        this.createCards();
        console.log('🎮 GameScene: 卡片創建完成');

        // 🔥 創建計時器 UI
        this.createTimerUI();

        // 🔥 移除重新開始按鈕：用戶要求拿掉
        console.log('🎮 GameScene: updateLayout 完成');
    }

    handleResize(gameSize) {
        console.log('🎮 GameScene: handleResize 觸發', gameSize);
        // 螢幕尺寸改變時重新佈局
        this.updateLayout();
    }

    createCards() {
        console.log('🎮 GameScene: createCards 開始');
        console.log('🎮 GameScene: pairs 數據', this.pairs);

        // 🔥 獲取當前頁的詞彙數據
        const startIndex = this.currentPage * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.pairs.length);
        const currentPagePairs = this.pairs.slice(startIndex, endIndex);

        console.log('📄 當前頁數據:', {
            currentPage: this.currentPage + 1,
            totalPages: this.totalPages,
            startIndex,
            endIndex,
            currentPagePairs: currentPagePairs.length
        });

        // 獲取當前螢幕尺寸
        const width = this.scale.width;
        const height = this.scale.height;

        console.log('🎮 GameScene: 計算卡片尺寸和位置', { width, height });

        // 響應式卡片尺寸（根據螢幕寬度調整）
        const cardWidth = Math.max(150, Math.min(250, width * 0.2));
        const cardHeight = Math.max(50, Math.min(80, height * 0.1));

        console.log('🎮 GameScene: 卡片尺寸', { cardWidth, cardHeight });

        // 響應式位置（使用百分比）
        const leftX = width * 0.25;        // 左側卡片在 25% 位置
        const rightX = width * 0.65;       // 右側卡片在 65% 位置
        const leftStartY = height * 0.25;  // 左側起始位置在 25% 高度
        const rightStartY = height * 0.22; // 右側起始位置在 22% 高度

        console.log('🎮 GameScene: 卡片位置', { leftX, rightX, leftStartY, rightStartY });

        // 響應式間距
        const leftSpacing = cardHeight + Math.max(5, height * 0.01);   // 卡片高度 + 5px 或 1% 高度
        const rightSpacing = cardHeight + Math.max(15, height * 0.03); // 卡片高度 + 15px 或 3% 高度

        console.log('🎮 GameScene: 卡片間距', { leftSpacing, rightSpacing });

        // 🔥 根據佈局模式創建卡片
        if (this.layout === 'mixed') {
            // 混合佈局模式
            this.createMixedLayout(currentPagePairs, width, height, cardWidth, cardHeight);
        } else {
            // 分離佈局模式（默認）
            this.createSeparatedLayout(currentPagePairs, leftX, rightX, leftStartY, rightStartY,
                                      cardWidth, cardHeight, leftSpacing, rightSpacing);
        }

        // 🔥 創建分頁指示器
        if (this.enablePagination) {
            this.createPageIndicator();
        }

        console.log('🎮 GameScene: createCards 完成', {
            leftCardsCount: this.leftCards.length,
            rightCardsCount: this.rightCards.length
        });
    }

    // 🔥 創建分離佈局（根據 Wordwall 策略）
    createSeparatedLayout(currentPagePairs, leftX, rightX, leftStartY, rightStartY,
                          cardWidth, cardHeight, leftSpacing, rightSpacing) {
        const width = this.scale.width;
        const height = this.scale.height;
        const itemCount = currentPagePairs.length;

        // 🔥 根據 Wordwall 策略判斷佈局
        if (itemCount <= 5) {
            // 3-5 個：左右分離，單列
            console.log('🎮 使用左右分離佈局（3-5個匹配數，單列）');
            this.createLeftRightSingleColumn(currentPagePairs, width, height);
        } else {
            // 6-20 個：左右分離，多行 2 列
            console.log('🎮 使用左右分離佈局（6-20個匹配數，多行2列）');
            this.createLeftRightMultiRows(currentPagePairs, width, height);
        }
    }

    // 🔥 創建左右分離佈局 - 單列（3-5個匹配數）
    createLeftRightSingleColumn(currentPagePairs, width, height) {
        console.log('📐 創建左右分離佈局 - 單列（3-5個匹配數）');

        const itemCount = currentPagePairs.length;

        // 🔥 檢測容器高度和手機橫向模式
        const isSmallContainer = height < 600;
        const isMediumContainer = height >= 600 && height < 800;
        const isLandscapeMobile = width > height && height < 450;  // 🔥 手機橫向模式

        console.log(`📐 容器尺寸: ${width} × ${height}`, {
            isSmallContainer,
            isMediumContainer,
            isLargeContainer: height >= 800,
            isLandscapeMobile  // 🔥 顯示是否為手機橫向模式
        });

        // 🔥 根據容器大小動態調整卡片尺寸
        let cardWidth, cardHeight;

        if (isLandscapeMobile) {
            // 🔥 手機橫向模式：使用超緊湊佈局
            cardWidth = Math.max(100, Math.min(150, width * 0.15));
            cardHeight = Math.max(28, Math.min(40, height * 0.08));
            console.log('📱 手機橫向模式：使用超緊湊佈局');
        } else if (isSmallContainer) {
            // 小容器：更小的卡片
            cardWidth = Math.max(120, Math.min(200, width * 0.18));
            cardHeight = Math.max(40, Math.min(65, height * 0.09));
        } else if (isMediumContainer) {
            // 中等容器：適中的卡片
            cardWidth = Math.max(140, Math.min(220, width * 0.19));
            cardHeight = Math.max(45, Math.min(72, height * 0.095));
        } else {
            // 大容器：較大的卡片
            cardWidth = Math.max(150, Math.min(250, width * 0.2));
            cardHeight = Math.max(50, Math.min(80, height * 0.1));
        }

        console.log(`📐 卡片尺寸: ${cardWidth.toFixed(0)} × ${cardHeight.toFixed(0)}`);

        // 🔥 根據容器大小動態調整位置
        // 🔥 英文區域往右移動 20%，英文區和中文區都往下移動 10%
        let leftX, rightX, leftStartY, rightStartY;

        if (isLandscapeMobile) {
            // 🔥 手機橫向模式：更緊湊的位置
            leftX = width * 0.38;
            rightX = width * 0.70;
            leftStartY = height * 0.15;
            rightStartY = height * 0.12;
        } else if (isSmallContainer) {
            // 小容器：更緊湊的佈局
            leftX = width * 0.42;  // 🔥 從 0.22 改為 0.42（+20%）
            rightX = width * 0.68;
            leftStartY = height * 0.25;   // 🔥 從 0.15 改為 0.25（+10%）
            rightStartY = height * 0.22;  // 🔥 從 0.12 改為 0.22（+10%）
        } else if (isMediumContainer) {
            // 中等容器：平衡的佈局
            leftX = width * 0.44;  // 🔥 從 0.24 改為 0.44（+20%）
            rightX = width * 0.66;
            leftStartY = height * 0.3;    // 🔥 從 0.2 改為 0.3（+10%）
            rightStartY = height * 0.27;  // 🔥 從 0.17 改為 0.27（+10%）
        } else {
            // 大容器：舒適的佈局
            leftX = width * 0.45;  // 🔥 從 0.25 改為 0.45（+20%）
            rightX = width * 0.65;
            leftStartY = height * 0.35;   // 🔥 從 0.25 改為 0.35（+10%）
            rightStartY = height * 0.32;  // 🔥 從 0.22 改為 0.32（+10%）
        }

        // 🔥 根據容器大小動態調整間距
        // 英文卡片：加 cardHeight
        // 中文卡片（3-5個匹配數）：只加 cardHeight（不加 textHeight + oneCharSpacing）
        let leftSpacing, rightSpacing;

        if (isLandscapeMobile) {
            // 🔥 手機橫向模式：計算最大可用高度，確保所有卡片都能顯示
            const availableHeight = height * 0.75;  // 使用 75% 的高度
            const maxSpacing = (availableHeight - cardHeight * itemCount) / (itemCount - 1);

            leftSpacing = Math.max(18, Math.min(maxSpacing, cardHeight + 3));
            rightSpacing = Math.max(18, Math.min(maxSpacing, cardHeight + 5));
            console.log(`📱 手機橫向間距: 左側=${leftSpacing.toFixed(1)}px, 右側=${rightSpacing.toFixed(1)}px, 可用高度=${availableHeight.toFixed(0)}px`);
        } else if (isSmallContainer) {
            leftSpacing = cardHeight + Math.max(3, height * 0.008);
            rightSpacing = cardHeight + Math.max(8, height * 0.02);  // 🔥 3-5個：只加 cardHeight
        } else if (isMediumContainer) {
            leftSpacing = cardHeight + Math.max(4, height * 0.009);
            rightSpacing = cardHeight + Math.max(12, height * 0.025);  // 🔥 3-5個：只加 cardHeight
        } else {
            leftSpacing = cardHeight + Math.max(5, height * 0.01);
            rightSpacing = cardHeight + Math.max(15, height * 0.03);  // 🔥 3-5個：只加 cardHeight
        }

        if (!isLandscapeMobile) {
            console.log(`📏 間距: 左側=${leftSpacing.toFixed(1)}px, 右側=${rightSpacing.toFixed(1)}px`);
        }

        // 🔥 根據隨機模式排列答案
        let shuffledAnswers;
        if (this.random === 'same') {
            const urlParams = new URLSearchParams(window.location.search);
            const activityId = urlParams.get('activityId') || 'default-seed';
            const seed = activityId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const rng = new Phaser.Math.RandomDataGenerator([seed.toString()]);
            shuffledAnswers = rng.shuffle([...currentPagePairs]);
            console.log('🎲 使用固定隨機模式，種子:', seed);
        } else {
            shuffledAnswers = Phaser.Utils.Array.Shuffle([...currentPagePairs]);
            console.log('🎲 使用隨機排列模式');
        }

        // 創建左側外框
        this.createLeftContainerBox(leftX, leftStartY, cardWidth, cardHeight, leftSpacing, itemCount);

        // 🔥 創建左側題目卡片（按照順序出現動畫）
        currentPagePairs.forEach((pair, index) => {
            const y = leftStartY + index * leftSpacing;
            const animationDelay = index * 100;  // 🔥 每個卡片延遲 100ms
            const card = this.createLeftCard(leftX, y, cardWidth, cardHeight, pair.question, pair.id, animationDelay);
            this.leftCards.push(card);
        });

        // 創建右側答案卡片（文字在框右邊）
        shuffledAnswers.forEach((pair, index) => {
            const y = rightStartY + index * rightSpacing;
            const card = this.createRightCard(rightX, y, cardWidth, cardHeight, pair.answer, pair.id, 'right');  // 🔥 文字在框右邊
            this.rightCards.push(card);
        });

        console.log('✅ 左右分離佈局創建完成');
    }

    // 🔥 創建上下分離佈局 - 2 行（6-10個匹配數）
    createTopBottomTwoRows(currentPagePairs, width, height) {
        console.log('📐 創建上下分離佈局 - 2行（6-10個匹配數）');

        const itemCount = currentPagePairs.length;

        // 🔥 檢測容器高度
        const isSmallContainer = height < 600;
        const isMediumContainer = height >= 600 && height < 800;

        console.log(`📐 容器尺寸: ${width} × ${height}`, {
            isSmallContainer,
            isMediumContainer,
            isLargeContainer: height >= 800
        });

        // 🔥 計算列數（固定 2 行）
        const rows = 2;
        const columns = Math.ceil(itemCount / rows);

        console.log(`📊 匹配數: ${itemCount}, 使用 ${rows} 行 × ${columns} 列佈局`);

        // 🔥 根據容器大小和列數調整卡片尺寸
        let cardWidth, cardHeight;
        if (isSmallContainer) {
            cardWidth = Math.max(70, Math.min(120, width * (0.85 / columns)));
            cardHeight = Math.max(35, Math.min(55, height * 0.15));
        } else if (isMediumContainer) {
            cardWidth = Math.max(80, Math.min(140, width * (0.88 / columns)));
            cardHeight = Math.max(40, Math.min(65, height * 0.16));
        } else {
            cardWidth = Math.max(90, Math.min(160, width * (0.9 / columns)));
            cardHeight = Math.max(45, Math.min(75, height * 0.17));
        }

        console.log(`📐 卡片尺寸: ${cardWidth.toFixed(0)} × ${cardHeight.toFixed(0)}`);

        // 🔥 計算間距
        const horizontalSpacing = Math.max(5, width * 0.01);

        // 🔥 計算文字高度（用於下方中文卡片）
        const textHeight = Math.max(24, Math.min(48, cardHeight * 0.6));

        // 🔥 英文卡片的垂直間距（不加文字高度）
        const topVerticalSpacing = Math.max(5, height * 0.02);

        // 🔥 中文卡片的垂直間距（只加文字高度，不加額外間距）
        const bottomVerticalSpacing = textHeight;

        // 🔥 計算上方區域（英文）的起始位置
        const topAreaStartX = (width - (columns * cardWidth + (columns - 1) * horizontalSpacing)) / 2;
        const topAreaStartY = height * 0.12;

        // 🔥 計算下方區域（中文）的起始位置
        const bottomAreaStartX = topAreaStartX;
        const bottomAreaStartY = height * 0.55;

        console.log(`📍 區域位置:`, {
            topAreaStartX: topAreaStartX.toFixed(0),
            topAreaStartY: topAreaStartY.toFixed(0),
            bottomAreaStartX: bottomAreaStartX.toFixed(0),
            bottomAreaStartY: bottomAreaStartY.toFixed(0)
        });

        // 🔥 根據隨機模式排列答案
        let shuffledAnswers;
        if (this.random === 'same') {
            const urlParams = new URLSearchParams(window.location.search);
            const activityId = urlParams.get('activityId') || 'default-seed';
            const seed = activityId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const rng = new Phaser.Math.RandomDataGenerator([seed.toString()]);
            shuffledAnswers = rng.shuffle([...currentPagePairs]);
            console.log('🎲 使用固定隨機模式，種子:', seed);
        } else {
            shuffledAnswers = Phaser.Utils.Array.Shuffle([...currentPagePairs]);
            console.log('🎲 使用隨機排列模式');
        }

        // 🔥 創建上方外框（包圍所有英文卡片）
        this.createMultiColumnContainerBox(
            topAreaStartX,
            topAreaStartY,
            cardWidth,
            cardHeight,
            horizontalSpacing,
            topVerticalSpacing,  // 🔥 英文卡片使用 topVerticalSpacing
            columns,
            rows
        );

        // 🔥 不創建下方外框（中文卡片不需要外框）

        // 🔥 創建上方英文卡片（2 行多列，按照順序出現動畫）
        currentPagePairs.forEach((pair, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);
            const x = topAreaStartX + col * (cardWidth + horizontalSpacing) + cardWidth / 2;
            const y = topAreaStartY + row * (cardHeight + topVerticalSpacing) + cardHeight / 2;  // 🔥 英文卡片使用 topVerticalSpacing

            const animationDelay = index * 100;  // 🔥 每個卡片延遲 100ms
            const card = this.createLeftCard(x, y, cardWidth, cardHeight, pair.question, pair.id, animationDelay);
            this.leftCards.push(card);
        });

        // 🔥 創建下方中文卡片（2 行多列）
        shuffledAnswers.forEach((pair, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);
            const x = bottomAreaStartX + col * (cardWidth + horizontalSpacing) + cardWidth / 2;
            const y = bottomAreaStartY + row * (cardHeight + bottomVerticalSpacing) + cardHeight / 2;  // 🔥 中文卡片使用 bottomVerticalSpacing

            const card = this.createRightCard(x, y, cardWidth, cardHeight, pair.answer, pair.id);
            this.rightCards.push(card);
        });

        console.log('✅ 上下分離佈局（2行）創建完成');
    }

    // 🔥 創建左右分離佈局 - 多行 2 列（6-20個匹配數）
    createLeftRightMultiRows(currentPagePairs, width, height) {
        console.log('📐 創建左右分離佈局 - 多行2列（6-20個匹配數）');

        const itemCount = currentPagePairs.length;

        // 🔥 檢測容器高度
        const isSmallContainer = height < 600;
        const isMediumContainer = height >= 600 && height < 800;

        console.log(`📐 容器尺寸: ${width} × ${height}`, {
            isSmallContainer,
            isMediumContainer,
            isLargeContainer: height >= 800
        });

        // 🔥 計算行數（固定 2 列）
        const columns = 2;
        const rows = Math.ceil(itemCount / columns);

        console.log(`📊 匹配數: ${itemCount}, 使用 ${rows} 行 × ${columns} 列佈局`);

        // 🔥 計算間距（先計算，用於後續卡片高度計算）
        const horizontalSpacing = Math.max(5, width * 0.01);
        const verticalSpacing = Math.max(3, height * 0.008);

        // 🔥 動態計算最大卡片高度，確保所有卡片都能放入容器
        const availableHeight = height * 0.8;  // 使用 80% 的容器高度
        const totalVerticalSpacing = (rows - 1) * verticalSpacing;
        const maxCardHeight = (availableHeight - totalVerticalSpacing) / rows;

        // 🔥 根據容器大小和匹配數調整卡片尺寸
        let cardWidth, cardHeight;

        // 🔥 6-10 個和 16-20 個匹配數使用更小的卡片尺寸
        const isSmallCardSize = itemCount <= 10 || itemCount >= 16;

        if (isSmallContainer) {
            if (isSmallCardSize) {
                cardWidth = Math.max(70, Math.min(110, width * 0.11));  // 🔥 6-10 個和 16-20 個：更小的寬度
                cardHeight = Math.max(18, Math.min(maxCardHeight, 38));  // 🔥 6-10 個和 16-20 個：更小的高度
            } else {
                cardWidth = Math.max(80, Math.min(130, width * 0.13));
                cardHeight = Math.max(20, Math.min(maxCardHeight, 45));
            }
        } else if (isMediumContainer) {
            if (isSmallCardSize) {
                cardWidth = Math.max(80, Math.min(130, width * 0.12));  // 🔥 6-10 個和 16-20 個：更小的寬度
                cardHeight = Math.max(22, Math.min(maxCardHeight, 45));  // 🔥 6-10 個和 16-20 個：更小的高度
            } else {
                cardWidth = Math.max(90, Math.min(150, width * 0.14));
                cardHeight = Math.max(25, Math.min(maxCardHeight, 52));
            }
        } else {
            // 🔥 大容器：使用更大的卡片尺寸
            if (isSmallCardSize) {
                cardWidth = Math.max(130, Math.min(210, width * 0.17));  // 🔥 6-10 個和 16-20 個：更大的寬度
                cardHeight = Math.max(35, Math.min(maxCardHeight, 72));  // 🔥 6-10 個和 16-20 個：更大的高度
            } else {
                cardWidth = Math.max(140, Math.min(230, width * 0.19));  // 🔥 11-15 個：更大的寬度
                cardHeight = Math.max(40, Math.min(maxCardHeight, 80));  // 🔥 11-15 個：更大的高度
            }
        }

        console.log(`📐 卡片尺寸: ${cardWidth.toFixed(0)} × ${cardHeight.toFixed(0)}`);
        console.log(`📏 可用高度: ${availableHeight.toFixed(0)}, 最大卡片高度: ${maxCardHeight.toFixed(0)}`);

        // 🔥 英文卡片和中文卡片的垂直間距（文字在框右邊，不需要額外間距）
        const leftVerticalSpacing = verticalSpacing;
        const rightVerticalSpacing = verticalSpacing;  // 🔥 與左側相同

        // 🔥 計算左側區域（英文）的起始位置
        const leftAreaStartX = width * 0.08;
        const leftAreaStartY = height * 0.1;

        // 🔥 計算右側區域（中文）的起始位置
        const rightAreaStartX = width * 0.52;
        const rightAreaStartY = height * 0.1;

        console.log(`📍 區域位置:`, {
            leftAreaStartX: leftAreaStartX.toFixed(0),
            leftAreaStartY: leftAreaStartY.toFixed(0),
            rightAreaStartX: rightAreaStartX.toFixed(0),
            rightAreaStartY: rightAreaStartY.toFixed(0)
        });

        // 🔥 根據隨機模式排列答案
        let shuffledAnswers;
        if (this.random === 'same') {
            const urlParams = new URLSearchParams(window.location.search);
            const activityId = urlParams.get('activityId') || 'default-seed';
            const seed = activityId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const rng = new Phaser.Math.RandomDataGenerator([seed.toString()]);
            shuffledAnswers = rng.shuffle([...currentPagePairs]);
            console.log('🎲 使用固定隨機模式，種子:', seed);
        } else {
            shuffledAnswers = Phaser.Utils.Array.Shuffle([...currentPagePairs]);
            console.log('🎲 使用隨機排列模式');
        }

        // 🔥 創建左側外框（包圍所有英文卡片）
        this.createMultiColumnContainerBox(
            leftAreaStartX,
            leftAreaStartY,
            cardWidth,
            cardHeight,
            horizontalSpacing,
            leftVerticalSpacing,  // 🔥 英文卡片使用 leftVerticalSpacing
            columns,
            rows
        );

        // 🔥 不創建右側外框（中文卡片不需要外框）

        // 🔥 創建左側英文卡片（多行 2 列，按照順序出現動畫）
        currentPagePairs.forEach((pair, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);
            const x = leftAreaStartX + col * (cardWidth + horizontalSpacing) + cardWidth / 2;
            const y = leftAreaStartY + row * (cardHeight + leftVerticalSpacing) + cardHeight / 2;  // 🔥 英文卡片使用 leftVerticalSpacing

            const animationDelay = index * 100;  // 🔥 每個卡片延遲 100ms
            const card = this.createLeftCard(x, y, cardWidth, cardHeight, pair.question, pair.id, animationDelay);
            this.leftCards.push(card);
        });

        // 🔥 創建右側中文卡片（多行 2 列）
        shuffledAnswers.forEach((pair, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);
            const x = rightAreaStartX + col * (cardWidth + horizontalSpacing) + cardWidth / 2;
            const y = rightAreaStartY + row * (cardHeight + rightVerticalSpacing) + cardHeight / 2;  // 🔥 中文卡片使用 rightVerticalSpacing

            // 🔥 根據列號決定文字位置：第一列（col=0）文字在左邊，第二列（col=1）文字在右邊
            const textPosition = col === 0 ? 'left' : 'right';
            const card = this.createRightCard(x, y, cardWidth, cardHeight, pair.answer, pair.id, textPosition);
            this.rightCards.push(card);
        });

        console.log('✅ 左右分離佈局（多行2列）創建完成');
    }

    // 🔥 創建上下分離佈局 - 多行多列（21-30個匹配數）
    createTopBottomMultiRows(currentPagePairs, width, height) {
        console.log('📐 創建上下分離佈局 - 多行多列（21-30個匹配數）');

        const itemCount = currentPagePairs.length;

        // 🔥 檢測容器高度
        const isSmallContainer = height < 600;
        const isMediumContainer = height >= 600 && height < 800;

        console.log(`📐 容器尺寸: ${width} × ${height}`, {
            isSmallContainer,
            isMediumContainer,
            isLargeContainer: height >= 800
        });

        // 🔥 根據匹配數計算行列數
        let rows, columns;
        if (itemCount <= 24) {
            // 21-24 個：3 行 × 8 列
            rows = 3;
            columns = 8;
        } else {
            // 25-30 個：3 行 × 10 列
            rows = 3;
            columns = 10;
        }

        console.log(`📊 匹配數: ${itemCount}, 使用 ${rows} 行 × ${columns} 列佈局`);

        // 🔥 根據容器大小和列數調整卡片尺寸
        let cardWidth, cardHeight;
        if (isSmallContainer) {
            cardWidth = Math.max(50, Math.min(85, width * (0.85 / columns)));
            cardHeight = Math.max(28, Math.min(42, height * 0.11));
        } else if (isMediumContainer) {
            cardWidth = Math.max(60, Math.min(95, width * (0.88 / columns)));
            cardHeight = Math.max(32, Math.min(48, height * 0.12));
        } else {
            cardWidth = Math.max(70, Math.min(105, width * (0.9 / columns)));
            cardHeight = Math.max(35, Math.min(55, height * 0.13));
        }

        console.log(`📐 卡片尺寸: ${cardWidth.toFixed(0)} × ${cardHeight.toFixed(0)}`);

        // 🔥 計算間距
        const horizontalSpacing = Math.max(3, width * 0.005);

        // 🔥 計算文字高度和一個字的間距（用於下方中文卡片）
        const textHeight = Math.max(24, Math.min(48, cardHeight * 0.6));
        const oneCharSpacing = textHeight;

        // 🔥 英文卡片的垂直間距（不加文字高度）
        const topVerticalSpacing = Math.max(3, height * 0.01);

        // 🔥 中文卡片的垂直間距（加文字高度 + 一個字的間距）
        const bottomVerticalSpacing = textHeight + oneCharSpacing + Math.max(3, height * 0.01);

        // 🔥 計算上方區域（英文）的起始位置
        const topAreaStartX = (width - (columns * cardWidth + (columns - 1) * horizontalSpacing)) / 2;
        const topAreaStartY = height * 0.08;

        // 🔥 計算上方區域的總高度
        const topAreaHeight = rows * cardHeight + (rows - 1) * topVerticalSpacing;

        // 🔥 計算下方區域的總高度（包含文字）
        const bottomAreaHeight = rows * cardHeight + (rows - 1) * bottomVerticalSpacing;

        // 🔥 計算下方區域（中文）的起始位置，確保所有內容都能顯示
        const bottomAreaStartX = topAreaStartX;
        const availableBottomSpace = height - topAreaStartY - topAreaHeight - 10;  // 10px 為上下區域間距
        const bottomAreaStartY = Math.max(
            topAreaStartY + topAreaHeight + 10,  // 至少在上方區域下方 10px
            height - bottomAreaHeight - 10  // 確保下方區域完全顯示
        );

        console.log(`📍 區域位置:`, {
            topAreaStartX: topAreaStartX.toFixed(0),
            topAreaStartY: topAreaStartY.toFixed(0),
            topAreaHeight: topAreaHeight.toFixed(0),
            bottomAreaStartX: bottomAreaStartX.toFixed(0),
            bottomAreaStartY: bottomAreaStartY.toFixed(0),
            bottomAreaHeight: bottomAreaHeight.toFixed(0),
            availableBottomSpace: availableBottomSpace.toFixed(0)
        });

        // 🔥 根據隨機模式排列答案
        let shuffledAnswers;
        if (this.random === 'same') {
            const urlParams = new URLSearchParams(window.location.search);
            const activityId = urlParams.get('activityId') || 'default-seed';
            const seed = activityId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const rng = new Phaser.Math.RandomDataGenerator([seed.toString()]);
            shuffledAnswers = rng.shuffle([...currentPagePairs]);
            console.log('🎲 使用固定隨機模式，種子:', seed);
        } else {
            shuffledAnswers = Phaser.Utils.Array.Shuffle([...currentPagePairs]);
            console.log('🎲 使用隨機排列模式');
        }

        // 🔥 創建上方外框（包圍所有英文卡片）
        this.createMultiColumnContainerBox(
            topAreaStartX,
            topAreaStartY,
            cardWidth,
            cardHeight,
            horizontalSpacing,
            topVerticalSpacing,  // 🔥 英文卡片使用 topVerticalSpacing
            columns,
            rows
        );

        // 🔥 不創建下方外框（中文卡片不需要外框）

        // 🔥 創建上方英文卡片（多行多列，按照順序出現動畫）
        currentPagePairs.forEach((pair, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);
            const x = topAreaStartX + col * (cardWidth + horizontalSpacing) + cardWidth / 2;
            const y = topAreaStartY + row * (cardHeight + topVerticalSpacing) + cardHeight / 2;  // 🔥 英文卡片使用 topVerticalSpacing

            const animationDelay = index * 100;  // 🔥 每個卡片延遲 100ms
            const card = this.createLeftCard(x, y, cardWidth, cardHeight, pair.question, pair.id, animationDelay);
            this.leftCards.push(card);
        });

        // 🔥 創建下方中文卡片（多行多列）
        shuffledAnswers.forEach((pair, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);
            const x = bottomAreaStartX + col * (cardWidth + horizontalSpacing) + cardWidth / 2;
            const y = bottomAreaStartY + row * (cardHeight + bottomVerticalSpacing) + cardHeight / 2;  // 🔥 中文卡片使用 bottomVerticalSpacing

            const card = this.createRightCard(x, y, cardWidth, cardHeight, pair.answer, pair.id);
            this.rightCards.push(card);
        });

        console.log('✅ 上下分離佈局（多行多列）創建完成');
    }

    // 🔥 創建混合網格佈局（11個以上匹配數）
    createMixedGridLayout(currentPagePairs, width, height) {
        console.log('📐 創建混合網格佈局（11個以上匹配數）');

        const itemCount = currentPagePairs.length;
        const totalCards = itemCount * 2;  // 英文 + 中文

        // 🔥 檢測容器高度
        const isSmallContainer = height < 600;
        const isMediumContainer = height >= 600 && height < 800;

        console.log(`📐 容器尺寸: ${width} × ${height}`, {
            isSmallContainer,
            isMediumContainer,
            isLargeContainer: height >= 800,
            totalCards
        });

        // 🔥 根據容器高度和總卡片數計算列數
        let columns = 1;

        if (isSmallContainer) {
            // 小容器（< 600px）：更早切換到多列
            if (totalCards > 40) {
                columns = 5;  // 41-60 張卡片：5 列
            } else if (totalCards > 30) {
                columns = 4;  // 31-40 張卡片：4 列
            } else {
                columns = 3;  // 22-30 張卡片：3 列
            }
        } else if (isMediumContainer) {
            // 中等容器（600-800px）：適中的切換點
            if (totalCards > 48) {
                columns = 6;  // 49-60 張卡片：6 列
            } else if (totalCards > 36) {
                columns = 5;  // 37-48 張卡片：5 列
            } else if (totalCards > 24) {
                columns = 4;  // 25-36 張卡片：4 列
            } else {
                columns = 3;  // 22-24 張卡片：3 列
            }
        } else {
            // 大容器（>= 800px）：較晚切換到多列
            if (totalCards > 48) {
                columns = 6;  // 49-60 張卡片：6 列
            } else if (totalCards > 36) {
                columns = 5;  // 37-48 張卡片：5 列
            } else {
                columns = 4;  // 22-36 張卡片：4 列
            }
        }

        console.log(`📊 總卡片數: ${totalCards}, 容器高度: ${height}px, 使用 ${columns} 列佈局`);

        // 🔥 根據列數和容器大小調整卡片寬度
        let dynamicCardWidth;
        if (isSmallContainer) {
            // 小容器：更小的卡片
            dynamicCardWidth = {
                3: Math.max(80, Math.min(120, width * 0.11)),    // 11% 寬度
                4: Math.max(70, Math.min(100, width * 0.09)),    // 9% 寬度
                5: Math.max(60, Math.min(85, width * 0.075))     // 7.5% 寬度
            }[columns];
        } else if (isMediumContainer) {
            // 中等容器：適中的卡片
            dynamicCardWidth = {
                3: Math.max(90, Math.min(130, width * 0.115)),   // 11.5% 寬度
                4: Math.max(75, Math.min(110, width * 0.095)),   // 9.5% 寬度
                5: Math.max(65, Math.min(95, width * 0.08)),     // 8% 寬度
                6: Math.max(60, Math.min(85, width * 0.07))      // 7% 寬度
            }[columns];
        } else {
            // 大容器：較大的卡片
            dynamicCardWidth = {
                4: Math.max(80, Math.min(120, width * 0.1)),     // 10% 寬度
                5: Math.max(70, Math.min(100, width * 0.085)),   // 8.5% 寬度
                6: Math.max(60, Math.min(90, width * 0.075))     // 7.5% 寬度
            }[columns];
        }

        // 🔥 根據列數和容器大小調整卡片高度
        let dynamicCardHeight;
        if (isSmallContainer) {
            // 小容器：更小的卡片高度
            dynamicCardHeight = {
                3: Math.max(35, Math.min(50, height * 0.07)),    // 7% 高度
                4: Math.max(32, Math.min(45, height * 0.06)),    // 6% 高度
                5: Math.max(30, Math.min(42, height * 0.055))    // 5.5% 高度
            }[columns];
        } else if (isMediumContainer) {
            // 中等容器：適中的卡片高度
            dynamicCardHeight = {
                3: Math.max(38, Math.min(55, height * 0.075)),   // 7.5% 高度
                4: Math.max(34, Math.min(48, height * 0.065)),   // 6.5% 高度
                5: Math.max(32, Math.min(45, height * 0.06)),    // 6% 高度
                6: Math.max(30, Math.min(42, height * 0.055))    // 5.5% 高度
            }[columns];
        } else {
            // 大容器：較大的卡片高度
            dynamicCardHeight = {
                4: Math.max(35, Math.min(50, height * 0.07)),    // 7% 高度
                5: Math.max(33, Math.min(48, height * 0.065)),   // 6.5% 高度
                6: Math.max(30, Math.min(45, height * 0.06))     // 6% 高度
            }[columns];
        }

        console.log(`📐 卡片尺寸: ${dynamicCardWidth.toFixed(0)} × ${dynamicCardHeight.toFixed(0)}`);

        // 🔥 創建所有卡片數據（英文 + 中文）
        const allCards = [];

        // 添加英文卡片
        currentPagePairs.forEach((pair) => {
            allCards.push({
                type: 'question',
                pair: pair,
                text: pair.question,
                pairId: pair.id
            });
        });

        // 添加中文卡片
        currentPagePairs.forEach((pair) => {
            allCards.push({
                type: 'answer',
                pair: pair,
                text: pair.answer,
                pairId: pair.id
            });
        });

        // 🔥 根據隨機模式排列所有卡片
        let shuffledCards;
        if (this.random === 'same') {
            // 固定隨機模式：使用活動 ID 作為種子
            const urlParams = new URLSearchParams(window.location.search);
            const activityId = urlParams.get('activityId') || 'default-seed';
            const seed = activityId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

            // 使用固定種子創建隨機數生成器
            const rng = new Phaser.Math.RandomDataGenerator([seed.toString()]);
            shuffledCards = rng.shuffle(allCards);
            console.log('🎲 混合網格使用固定隨機模式，種子:', seed);
        } else {
            // 每次不同模式：隨機排列
            shuffledCards = Phaser.Utils.Array.Shuffle(allCards);
            console.log('🎲 混合網格使用隨機排列模式');
        }

        // 🔥 計算行數
        const rows = Math.ceil(totalCards / columns);
        console.log(`📊 行數: ${rows}`);

        // 🔥 根據容器高度動態調整可用空間和起始位置
        let availableHeightPercent, startYPercent;

        if (isSmallContainer) {
            // 小容器：使用更多空間，更緊湊的佈局
            availableHeightPercent = 0.85;  // 使用 85% 的高度
            startYPercent = 0.05;  // 從 5% 高度開始
        } else if (isMediumContainer) {
            // 中等容器：平衡的佈局
            availableHeightPercent = 0.80;  // 使用 80% 的高度
            startYPercent = 0.08;  // 從 8% 高度開始
        } else {
            // 大容器：舒適的佈局
            availableHeightPercent = 0.75;  // 使用 75% 的高度
            startYPercent = 0.12;  // 從 12% 高度開始
        }

        const availableHeight = height * availableHeightPercent;
        const startY = height * startYPercent;

        console.log(`📐 佈局參數:`, {
            availableHeight: availableHeight.toFixed(0),
            startY: startY.toFixed(0),
            availableHeightPercent: `${(availableHeightPercent * 100).toFixed(0)}%`,
            startYPercent: `${(startYPercent * 100).toFixed(0)}%`
        });

        // 🔥 計算垂直間距
        const totalCardHeight = rows * dynamicCardHeight;
        const verticalSpacing = Math.max(3, (availableHeight - totalCardHeight) / (rows + 1));

        console.log(`📏 垂直間距: ${verticalSpacing.toFixed(1)}px`);

        // 🔥 計算水平間距
        const horizontalSpacing = Math.max(5, dynamicCardWidth * 0.08);  // 卡片寬度的 8%，最小 5px

        // 🔥 計算網格起始位置
        const gridStartX = width * 0.05;  // 從 5% 位置開始
        const gridStartY = startY;

        console.log(`📍 網格位置:`, {
            gridStartX: gridStartX.toFixed(0),
            gridStartY: gridStartY.toFixed(0),
            horizontalSpacing: horizontalSpacing.toFixed(1)
        });

        // 🔥 創建混合網格卡片（按照順序出現動畫）
        shuffledCards.forEach((cardData, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);
            const x = gridStartX + col * (dynamicCardWidth + horizontalSpacing) + dynamicCardWidth / 2;
            const y = gridStartY + row * (dynamicCardHeight + verticalSpacing) + dynamicCardHeight / 2;

            const animationDelay = index * 100;  // 🔥 每個卡片延遲 100ms

            if (cardData.type === 'question') {
                const card = this.createLeftCard(x, y, dynamicCardWidth, dynamicCardHeight, cardData.text, cardData.pairId, animationDelay);
                this.leftCards.push(card);
            } else {
                const card = this.createRightCard(x, y, dynamicCardWidth, dynamicCardHeight, cardData.text, cardData.pairId);
                this.rightCards.push(card);
            }
        });

        console.log('✅ 混合網格佈局創建完成');
    }

    // 🔥 創建混合佈局（所有卡片混合）
    createMixedLayout(currentPagePairs, width, height, cardWidth, cardHeight) {
        console.log('🎮 創建混合佈局');

        // 創建所有卡片數據
        const allCards = [];

        // 添加英文卡片
        currentPagePairs.forEach((pair) => {
            allCards.push({
                type: 'question',
                pair: pair,
                text: pair.question,
                pairId: pair.id
            });
        });

        // 添加中文卡片
        currentPagePairs.forEach((pair) => {
            allCards.push({
                type: 'answer',
                pair: pair,
                text: pair.answer,
                pairId: pair.id
            });
        });

        // 🔥 根據隨機模式排列卡片
        let shuffledCards;
        if (this.random === 'same') {
            // 固定隨機模式
            const urlParams = new URLSearchParams(window.location.search);
            const activityId = urlParams.get('activityId') || 'default-seed';
            const seed = activityId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

            const rng = new Phaser.Math.RandomDataGenerator([seed.toString()]);
            shuffledCards = rng.shuffle(allCards);
            console.log('🎲 混合佈局使用固定隨機模式，種子:', seed);
        } else {
            // 每次不同模式
            shuffledCards = Phaser.Utils.Array.Shuffle(allCards);
            console.log('🎲 混合佈局使用隨機排列模式');
        }

        // 計算網格佈局
        const cols = 4;  // 每行 4 個卡片
        const rows = Math.ceil(shuffledCards.length / cols);

        // 計算卡片間距
        const horizontalSpacing = (width - cardWidth * cols) / (cols + 1);
        const verticalSpacing = (height - cardHeight * rows) / (rows + 1);

        // 🔥 創建卡片（按照順序出現動畫）
        shuffledCards.forEach((cardData, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            const x = horizontalSpacing + col * (cardWidth + horizontalSpacing) + cardWidth / 2;
            const y = verticalSpacing + row * (cardHeight + verticalSpacing) + cardHeight / 2 + height * 0.1;

            const animationDelay = i * 100;  // 🔥 每個卡片延遲 100ms

            if (cardData.type === 'question') {
                const card = this.createLeftCard(x, y, cardWidth, cardHeight, cardData.text, cardData.pairId, animationDelay);
                this.leftCards.push(card);
            } else {
                const card = this.createRightCard(x, y, cardWidth, cardHeight, cardData.text, cardData.pairId);
                this.rightCards.push(card);
            }
        });
    }

    createLeftContainerBox(x, y, cardWidth, cardHeight, spacing, count) {
        // 計算外框的尺寸
        const padding = 10;  // 外框與卡片之間的間距
        const boxWidth = cardWidth + padding * 2;
        const boxHeight = (cardHeight * count) + (spacing - cardHeight) * (count - 1) + padding * 2;

        // 計算外框的中心位置
        const boxCenterY = y + (spacing * (count - 1)) / 2;

        // 創建外框
        const containerBox = this.add.rectangle(x, boxCenterY, boxWidth, boxHeight);
        containerBox.setStrokeStyle(2, 0x333333);  // 黑色邊框
        containerBox.setFillStyle(0xffffff, 0);    // 透明填充
        containerBox.setDepth(0);  // 在卡片下層
    }

    // 🔥 創建多列外框（智能多列佈局）
    createMultiColumnContainerBox(startX, startY, cardWidth, cardHeight, horizontalSpacing, verticalSpacing, columns, rows) {
        const padding = 10;  // 外框與卡片之間的間距

        // 計算外框的尺寸
        const boxWidth = columns * cardWidth + (columns - 1) * horizontalSpacing + padding * 2;
        const boxHeight = rows * cardHeight + (rows - 1) * verticalSpacing + padding * 2;

        // 計算外框的中心位置
        const boxCenterX = startX + (columns * cardWidth + (columns - 1) * horizontalSpacing) / 2;
        const boxCenterY = startY + (rows * cardHeight + (rows - 1) * verticalSpacing) / 2;

        // 創建外框
        const containerBox = this.add.rectangle(boxCenterX, boxCenterY, boxWidth, boxHeight);
        containerBox.setStrokeStyle(2, 0x333333);  // 黑色邊框
        containerBox.setFillStyle(0xffffff, 0);    // 透明填充
        containerBox.setDepth(0);  // 在卡片下層

        console.log('📦 多列外框已創建:', {
            columns,
            rows,
            boxWidth,
            boxHeight,
            centerX: boxCenterX,
            centerY: boxCenterY
        });
    }

    createLeftCard(x, y, width, height, text, pairId, animationDelay = 0) {
        // 創建卡片容器
        const container = this.add.container(x, y);
        container.setSize(width, height);
        container.setDepth(5);

        // 🔥 設置初始透明度為 0（隱藏）
        container.setAlpha(0);

        // 創建卡片背景（白色）
        const background = this.add.rectangle(0, 0, width, height, 0xffffff);
        background.setStrokeStyle(2, 0x333333);

        // 🔥 創建卡片文字（動態字體大小，適應內框寬度）
        let fontSize = Math.max(24, Math.min(48, height * 0.6));

        // 🔥 創建臨時文字對象來測量寬度
        const tempText = this.add.text(0, 0, text, {
            fontSize: `${fontSize}px`,
            fontFamily: 'Arial'
        });

        // 🔥 如果文字寬度超過卡片寬度的 85%，縮小字體
        const maxTextWidth = width * 0.85;  // 留 15% 的邊距
        while (tempText.width > maxTextWidth && fontSize > 18) {
            fontSize -= 2;
            tempText.setFontSize(fontSize);
        }

        // 銷毀臨時文字對象
        tempText.destroy();

        // 🔥 創建最終的文字對象
        const cardText = this.add.text(0, 0, text, {
            fontSize: `${fontSize}px`,
            color: '#333333',
            fontFamily: 'Arial',
            fontStyle: 'normal'
        });
        cardText.setOrigin(0.5);

        // 添加到容器
        container.add([background, cardText]);

        // 🔥 添加淡入動畫（按照順序出現）
        this.tweens.add({
            targets: container,
            alpha: 1,  // 從 0 淡入到 1
            duration: 300,  // 動畫持續 300ms
            delay: animationDelay,  // 延遲時間
            ease: 'Power2'
        });

        // 設置互動（整個容器可拖曳）
        container.setInteractive({ useHandCursor: true, draggable: true });

        // 儲存原始位置
        container.setData({
            pairId: pairId,
            side: 'left',
            background: background,
            text: cardText,
            isMatched: false,
            originalX: x,
            originalY: y
        });

        // 拖曳開始
        container.on('dragstart', (pointer) => {
            // 允許已配對的卡片也可以拖動
            this.isDragging = true;
            this.dragStartCard = container;

            // 卡片"飄浮"起來
            container.setDepth(100);  // 提升到最上層
            container.setScale(1.1);  // 稍微放大
            background.setAlpha(0.9);  // 半透明
        });

        // 拖曳中 - 卡片跟隨鼠標
        container.on('drag', (pointer, dragX, dragY) => {
            if (!this.isDragging) return;

            // 移動整個卡片
            container.x = pointer.x;
            container.y = pointer.y;
        });

        // 拖曳結束
        container.on('dragend', (pointer) => {
            this.isDragging = false;

            // 檢查是否拖回左側區域（取消配對）- 使用螢幕寬度的 45% 作為分界線
            const isInLeftArea = pointer.x < this.scale.width * 0.45;

            if (isInLeftArea && container.getData('isMatched')) {
                // 取消配對
                this.unmatchCard(container);

                // 返回原位
                this.tweens.add({
                    targets: container,
                    x: container.getData('originalX'),
                    y: container.getData('originalY'),
                    scaleX: 1,
                    scaleY: 1,
                    duration: 300,
                    ease: 'Back.easeOut',
                    onComplete: () => {
                        container.setDepth(5);
                        background.setAlpha(1);
                    }
                });
            } else {
                // 先檢查是否拖曳到其他左側卡片（交換位置）
                const swapped = this.checkSwap(pointer, container);

                if (!swapped) {
                    // 如果沒有交換，檢查是否拖曳到右側卡片
                    const dropped = this.checkDrop(pointer, container);

                    if (!dropped) {
                        // 沒有放到正確位置，返回原位
                        this.tweens.add({
                            targets: container,
                            x: container.getData('originalX'),
                            y: container.getData('originalY'),
                            scaleX: 1,
                            scaleY: 1,
                            duration: 300,
                            ease: 'Back.easeOut',
                            onComplete: () => {
                                container.setDepth(5);
                                background.setAlpha(1);
                            }
                        });
                    }
                }
            }

            this.dragStartCard = null;
        });

        // 啟用拖曳
        this.input.setDraggable(container);

        return container;
    }

    createRightCard(x, y, width, height, text, pairId, textPosition = 'bottom') {
        // 創建卡片容器
        const container = this.add.container(x, y);
        container.setDepth(5);

        // 🔥 創建白色框（內框）
        const background = this.add.rectangle(0, 0, width, height, 0xffffff);
        background.setStrokeStyle(2, 0x333333);
        background.setDepth(1);

        // 🔥 創建文字標籤（動態字體大小，根據文字長度和內框寬度調整）
        const textLength = text.length;
        let baseFontSize = Math.max(24, Math.min(48, height * 0.6));

        // 🔥 根據文字長度調整字體大小
        let fontSize;
        if (textLength <= 2) {
            fontSize = baseFontSize;  // 1-2 個字：正常大小
        } else if (textLength === 3) {
            fontSize = baseFontSize * 0.9;  // 3 個字：縮小 10%
        } else if (textLength === 4) {
            fontSize = baseFontSize * 0.8;  // 4 個字：縮小 20%
        } else if (textLength <= 6) {
            fontSize = baseFontSize * 0.7;  // 5-6 個字：縮小 30%
        } else {
            fontSize = baseFontSize * 0.6;  // 7+ 個字：縮小 40%
        }

        fontSize = Math.max(18, fontSize);  // 最小字體大小 18px

        // 🔥 創建臨時文字對象來測量寬度（適應內框寬度）
        const tempText = this.add.text(0, 0, text, {
            fontSize: `${fontSize}px`,
            fontFamily: 'Arial'
        });

        // 🔥 如果文字寬度超過內框寬度的 85%，縮小字體
        const maxTextWidth = width * 0.85;  // 留 15% 的邊距
        while (tempText.width > maxTextWidth && fontSize > 14) {
            fontSize -= 1;  // 每次縮小 1px
            tempText.setFontSize(fontSize);
        }

        // 銷毀臨時文字對象
        tempText.destroy();

        // 🔥 根據 textPosition 設置文字位置
        let textX, textY, originX, originY;
        if (textPosition === 'right') {
            // 文字在框右邊
            textX = width / 2 + 15;
            textY = 0;
            originX = 0;      // 左對齊
            originY = 0.5;    // 垂直居中
        } else if (textPosition === 'left') {
            // 文字在框左邊
            textX = -width / 2 - 15;
            textY = 0;
            originX = 1;      // 右對齊
            originY = 0.5;    // 垂直居中
        } else {
            // 文字在框下邊（默認）
            textX = 0;
            textY = height / 2 + 10;
            originX = 0.5;    // 水平居中
            originY = 0;      // 頂部對齊
        }

        const cardText = this.add.text(textX, textY, text, {
            fontSize: `${fontSize}px`,
            color: '#333333',
            fontFamily: 'Arial',
            fontStyle: 'normal'
        });
        cardText.setOrigin(originX, originY);
        cardText.setDepth(10);  // 確保文字在最上層

        // 添加到容器
        container.add([background, cardText]);

        // 設置互動（接收拖曳）
        background.setInteractive({ useHandCursor: true });

        // 懸停效果
        background.on('pointerover', () => {
            if (!container.getData('isMatched') && this.isDragging) {
                background.setStrokeStyle(3, 0xfe7606); // 橙色邊框
            }
        });
        background.on('pointerout', () => {
            if (!container.getData('isMatched')) {
                background.setStrokeStyle(2, 0x333333);
            }
        });

        // 儲存卡片數據
        container.setData({
            pairId: pairId,
            side: 'right',
            background: background,
            text: cardText,
            isMatched: false
        });

        return container;
    }

    checkSwap(pointer, draggedCard) {
        if (!draggedCard) return false;

        // 檢查指針是否在其他左側卡片上
        let targetCard = null;

        for (const card of this.leftCards) {
            // 跳過自己和已配對的卡片
            if (card === draggedCard || card.getData('isMatched')) continue;

            const bounds = card.getBounds();
            if (bounds.contains(pointer.x, pointer.y)) {
                targetCard = card;
                break;
            }
        }

        if (targetCard) {
            // 交換兩張卡片的位置
            this.swapCards(draggedCard, targetCard);
            return true;
        }

        return false;
    }

    swapCards(card1, card2) {
        // 獲取兩張卡片的原始位置
        const card1OriginalX = card1.getData('originalX');
        const card1OriginalY = card1.getData('originalY');
        const card2OriginalX = card2.getData('originalX');
        const card2OriginalY = card2.getData('originalY');

        // 交換原始位置數據
        card1.setData('originalX', card2OriginalX);
        card1.setData('originalY', card2OriginalY);
        card2.setData('originalX', card1OriginalX);
        card2.setData('originalY', card1OriginalY);

        // 動畫移動到新位置
        this.tweens.add({
            targets: card1,
            x: card2OriginalX,
            y: card2OriginalY,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.easeOut',
            onComplete: () => {
                card1.setDepth(5);
                const bg1 = card1.getAt(0);
                if (bg1) bg1.setAlpha(1);
            }
        });

        this.tweens.add({
            targets: card2,
            x: card1OriginalX,
            y: card1OriginalY,
            duration: 300,
            ease: 'Back.easeOut'
        });
    }

    checkDrop(pointer, draggedCard) {
        if (!draggedCard) return false;

        // 檢查指針是否在任何右側卡片上
        let targetCard = null;

        for (const card of this.rightCards) {
            if (card.getData('isMatched')) continue;  // 跳過已配對的卡片

            const bounds = card.getBounds();
            if (bounds.contains(pointer.x, pointer.y)) {
                targetCard = card;
                break;
            }
        }

        if (targetCard) {
            this.checkMatch(draggedCard, targetCard);
            return true;
        }

        return false;
    }

    checkMatch(leftCard, rightCard) {
        // 🔥 新機制：無論對錯，都讓英文卡片進入中文內框
        // 不立即檢查對錯，等待用戶點擊「提交答案」按鈕
        this.onMatchSuccess(leftCard, rightCard);
    }

    onMatchSuccess(leftCard, rightCard) {
        // 標記為已配對
        leftCard.setData('isMatched', true);
        leftCard.setData('matchedWith', rightCard);  // 記錄配對的右側卡片
        rightCard.setData('isMatched', true);
        rightCard.setData('matchedWith', leftCard);  // 記錄配對的左側卡片

        // 左側卡片移動到右側空白框的位置（完全覆蓋）
        const targetX = rightCard.x;
        const targetY = rightCard.y;

        this.tweens.add({
            targets: leftCard,
            x: targetX,
            y: targetY,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.easeOut',
            onComplete: () => {
                leftCard.setDepth(10);  // 提升到空白框上方
                leftCard.getData('background').setAlpha(1);

                // 🔥 檢查是否所有卡片都已配對，如果是則顯示「提交答案」按鈕
                this.checkAllCardsMatched();
            }
        });
    }

    unmatchCard(leftCard) {
        // 取消配對狀態
        const rightCard = leftCard.getData('matchedWith');

        if (rightCard) {
            // 移除配對標記
            leftCard.setData('isMatched', false);
            leftCard.setData('matchedWith', null);
            rightCard.setData('isMatched', false);
            rightCard.setData('matchedWith', null);

            // 從已配對集合中移除
            this.matchedPairs.delete(leftCard.getData('pairId'));

            // 顯示右側空白框（如果之前被隱藏）
            rightCard.getData('background').setVisible(true);
        }
    }

    onMatchFail(leftCard, rightCard) {
        // 🔥 不顯示錯誤提示，只讓左側卡片返回原位
        this.tweens.add({
            targets: leftCard,
            x: leftCard.getData('originalX'),
            y: leftCard.getData('originalY'),
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.easeOut',
            onComplete: () => {
                leftCard.setDepth(5);
                leftCard.getData('background').setAlpha(1);
            }
        });

        console.log('❌ 配對失敗（不顯示錯誤提示）');
    }

    // 🔥 檢查是否所有卡片都已配對
    checkAllCardsMatched() {
        const allMatched = this.leftCards.every(card => card.getData('isMatched'));

        if (allMatched && !this.submitButton) {
            console.log('✅ 所有卡片都已配對，顯示提交答案按鈕');
            this.showSubmitButton();
        }
    }

    // 🔥 顯示「提交答案」按鈕
    showSubmitButton() {
        const width = this.scale.width;
        const height = this.scale.height;

        console.log('🔍 顯示提交答案按鈕', { width, height });

        // 按鈕尺寸（響應式）
        const buttonWidth = Math.max(150, Math.min(250, width * 0.2));
        const buttonHeight = Math.max(50, Math.min(70, height * 0.1));
        const fontSize = Math.max(20, Math.min(28, width * 0.025));

        // 🔥 按鈕位置（最底下中央，確保可見）
        const buttonX = width / 2;
        const buttonY = height - buttonHeight - 10;  // 距離底部 10px

        console.log('🔍 按鈕位置', { buttonX, buttonY, buttonWidth, buttonHeight });

        // 創建按鈕背景
        const buttonBg = this.add.rectangle(buttonX, buttonY, buttonWidth, buttonHeight, 0x4caf50);
        buttonBg.setStrokeStyle(3, 0x388e3c);
        buttonBg.setInteractive({ useHandCursor: true });
        buttonBg.setDepth(3000);  // 🔥 提高深度確保在最上層
        buttonBg.setScrollFactor(0);  // 🔥 固定在螢幕上，不隨相機移動

        // 創建按鈕文字
        const buttonText = this.add.text(buttonX, buttonY, '提交答案', {
            fontSize: `${fontSize}px`,
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        buttonText.setOrigin(0.5);
        buttonText.setDepth(3001);  // 🔥 提高深度確保在最上層
        buttonText.setScrollFactor(0);  // 🔥 固定在螢幕上，不隨相機移動

        console.log('✅ 提交答案按鈕已創建');

        // 按鈕點擊事件
        buttonBg.on('pointerdown', () => {
            console.log('🔍 提交答案，開始檢查配對結果');
            this.checkAllMatches();
        });

        // 按鈕懸停效果
        buttonBg.on('pointerover', () => {
            buttonBg.setFillStyle(0x66bb6a);
            console.log('🔍 按鈕懸停');
        });

        buttonBg.on('pointerout', () => {
            buttonBg.setFillStyle(0x4caf50);
        });

        // 保存按鈕引用
        this.submitButton = { bg: buttonBg, text: buttonText };
    }

    // 🔥 檢查所有配對結果
    checkAllMatches() {
        let correctCount = 0;
        let incorrectCount = 0;

        // 檢查每個左側卡片的配對
        this.leftCards.forEach(leftCard => {
            const leftPairId = leftCard.getData('pairId');
            const rightCard = leftCard.getData('matchedWith');

            if (rightCard) {
                const rightPairId = rightCard.getData('pairId');

                if (leftPairId === rightPairId) {
                    // 配對正確
                    correctCount++;
                    console.log('✅ 配對正確:', leftCard.getData('text'), '-', rightCard.getData('text'));
                } else {
                    // 配對錯誤
                    incorrectCount++;
                    console.log('❌ 配對錯誤:', leftCard.getData('text'), '-', rightCard.getData('text'));

                    // 顯示錯誤提示（紅色邊框）
                    leftCard.getData('background').setStrokeStyle(3, 0xf44336);
                    rightCard.getData('background').setStrokeStyle(3, 0xf44336);
                }
            }
        });

        // 顯示總結
        this.showMatchSummary(correctCount, incorrectCount);
    }

    // 🔥 顯示配對總結
    showMatchSummary(correctCount, incorrectCount) {
        const width = this.scale.width;
        const height = this.scale.height;

        // 移除提交按鈕
        if (this.submitButton) {
            this.submitButton.bg.destroy();
            this.submitButton.text.destroy();
            this.submitButton = null;
        }

        // 總結文字尺寸（響應式）
        const fontSize = Math.max(24, Math.min(36, width * 0.03));

        // 顯示總結
        const totalCount = correctCount + incorrectCount;
        const summaryText = this.add.text(
            width / 2,
            height / 2 - 50,
            `配對結果\n正確：${correctCount} / ${totalCount}\n錯誤：${incorrectCount} / ${totalCount}`,
            {
                fontSize: `${fontSize}px`,
                color: correctCount === totalCount ? '#4caf50' : '#ff9800',
                fontFamily: 'Arial',
                fontStyle: 'bold',
                align: 'center',
                backgroundColor: correctCount === totalCount ? '#e8f5e9' : '#fff3e0',
                padding: { x: 25, y: 15 }
            }
        );
        summaryText.setOrigin(0.5).setDepth(2000);

        // 如果全部正確，顯示完成動畫
        if (correctCount === totalCount) {
            this.tweens.add({
                targets: summaryText,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 500,
                yoyo: true,
                repeat: 2,
                ease: 'Sine.easeInOut',
                onComplete: () => {
                    // 檢查是否有下一頁
                    this.time.delayedCall(1000, () => {
                        this.onGameComplete();
                    });
                }
            });
        } else {
            // 顯示「重試」按鈕
            this.time.delayedCall(2000, () => {
                this.showRetryButton();
            });
        }
    }

    // 🔥 顯示「重試」按鈕
    showRetryButton() {
        const width = this.scale.width;
        const height = this.scale.height;

        const buttonWidth = Math.max(120, Math.min(200, width * 0.15));
        const buttonHeight = Math.max(40, Math.min(60, height * 0.08));
        const fontSize = Math.max(16, Math.min(24, width * 0.02));

        const buttonX = width / 2;
        const buttonY = height / 2 + 50;

        const buttonBg = this.add.rectangle(buttonX, buttonY, buttonWidth, buttonHeight, 0xff9800);
        buttonBg.setStrokeStyle(2, 0xf57c00);
        buttonBg.setInteractive({ useHandCursor: true });
        buttonBg.setDepth(2000);

        const buttonText = this.add.text(buttonX, buttonY, '重試', {
            fontSize: `${fontSize}px`,
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        buttonText.setOrigin(0.5);
        buttonText.setDepth(2001);

        buttonBg.on('pointerdown', () => {
            console.log('🔄 重試當前頁');
            this.resetCurrentPage();
        });

        buttonBg.on('pointerover', () => {
            buttonBg.setFillStyle(0xffb74d);
        });

        buttonBg.on('pointerout', () => {
            buttonBg.setFillStyle(0xff9800);
        });
    }

    // 🔥 重置當前頁
    resetCurrentPage() {
        // 清除所有卡片
        this.leftCards.forEach(card => card.destroy());
        this.rightCards.forEach(card => card.destroy());
        this.leftCards = [];
        this.rightCards = [];
        this.matchedPairs.clear();

        // 清除所有文字和按鈕
        this.children.list.forEach(child => {
            if (child.type === 'Text' || child.type === 'Rectangle') {
                child.destroy();
            }
        });

        // 重新創建當前頁
        this.createCards();
    }

    onGameComplete() {
        // 🔥 檢查是否還有下一頁
        if (this.enablePagination && this.currentPage < this.totalPages - 1) {
            // 還有下一頁
            if (this.autoProceed) {
                // 自動進入下一頁
                console.log('📄 當前頁完成，自動進入下一頁');
                this.time.delayedCall(500, () => {
                    this.goToNextPage();
                });
            } else {
                // 顯示「下一頁」按鈕
                console.log('📄 當前頁完成，顯示下一頁按鈕');
                this.showNextPageButton();
            }
        } else {
            // 所有頁面都完成了，顯示最終完成訊息
            console.log('🎉 所有頁面完成！');
            this.showFinalCompletion();
        }
    }

    // 🔥 顯示最終完成訊息
    showFinalCompletion() {
        // 停止計時器
        if (this.timerEvent) {
            this.timerEvent.remove();
        }

        // 獲取當前螢幕尺寸
        const width = this.scale.width;
        const height = this.scale.height;

        // 顯示完成訊息（響應式）
        const fontSize = Math.max(28, Math.min(48, width * 0.035));
        const completeText = this.add.text(width / 2, height / 2 - 50, '🎉 全部完成！', {
            fontSize: `${fontSize}px`,
            color: '#4caf50',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            backgroundColor: '#e8f5e9',
            padding: { x: 25, y: 12 }
        });
        completeText.setOrigin(0.5).setDepth(2000);

        // 縮放動畫
        this.tweens.add({
            targets: completeText,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 🔥 如果開啟顯示答案，顯示答案按鈕
        if (this.showAnswers) {
            const showAnswersButton = this.add.text(
                width / 2,
                height / 2 + 30,
                '📝 查看答案',
                {
                    fontSize: '24px',
                    color: '#ffffff',
                    fontFamily: 'Arial',
                    backgroundColor: '#2196F3',
                    padding: { x: 20, y: 10 }
                }
            ).setOrigin(0.5).setDepth(2001).setInteractive({ useHandCursor: true });

            showAnswersButton.on('pointerdown', () => {
                completeText.destroy();
                showAnswersButton.destroy();
                this.showAnswersScreen();
            });

            // 按鈕懸停效果
            showAnswersButton.on('pointerover', () => {
                showAnswersButton.setBackgroundColor('#1976D2');
            });

            showAnswersButton.on('pointerout', () => {
                showAnswersButton.setBackgroundColor('#2196F3');
            });
        }
    }

    // 🔥 顯示答案畫面
    showAnswersScreen() {
        const width = this.scale.width;
        const height = this.scale.height;

        // 清除所有現有元素
        this.children.removeAll(true);

        // 添加白色背景
        this.add.rectangle(width / 2, height / 2, width, height, 0xffffff).setDepth(-1);

        // 顯示標題
        this.add.text(width / 2, 50, '📝 正確答案', {
            fontSize: '32px',
            color: '#000000',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 創建滾動區域
        const startY = 100;
        const lineHeight = 40;
        const maxVisibleLines = Math.floor((height - 150) / lineHeight);

        // 顯示所有配對
        this.pairs.forEach((pair, index) => {
            const y = startY + index * lineHeight;

            // 只顯示可見範圍內的答案
            if (index < maxVisibleLines) {
                this.add.text(
                    width / 2,
                    y,
                    `${pair.question} = ${pair.answer}`,
                    {
                        fontSize: '20px',
                        color: '#333333',
                        fontFamily: 'Arial'
                    }
                ).setOrigin(0.5);
            }
        });

        // 如果答案太多，顯示提示
        if (this.pairs.length > maxVisibleLines) {
            this.add.text(
                width / 2,
                height - 50,
                `（顯示前 ${maxVisibleLines} 個答案，共 ${this.pairs.length} 個）`,
                {
                    fontSize: '16px',
                    color: '#999999',
                    fontFamily: 'Arial'
                }
            ).setOrigin(0.5);
        }

        // 添加關閉按鈕
        const closeButton = this.add.text(
            width / 2,
            height - 80,
            '✖ 關閉',
            {
                fontSize: '20px',
                color: '#ffffff',
                fontFamily: 'Arial',
                backgroundColor: '#f44336',
                padding: { x: 20, y: 10 }
            }
        ).setOrigin(0.5).setInteractive({ useHandCursor: true });

        closeButton.on('pointerdown', () => {
            // 重新載入遊戲
            this.scene.restart();
        });

        // 按鈕懸停效果
        closeButton.on('pointerover', () => {
            closeButton.setBackgroundColor('#d32f2f');
        });

        closeButton.on('pointerout', () => {
            closeButton.setBackgroundColor('#f44336');
        });
    }

    // 🔥 創建分頁指示器
    createPageIndicator() {
        const width = this.scale.width;
        const height = this.scale.height;

        // 分頁指示器文字（例如：1/5）
        const pageText = `${this.currentPage + 1}/${this.totalPages}`;
        const fontSize = Math.max(18, Math.min(24, width * 0.02));

        this.pageIndicatorText = this.add.text(width / 2, height * 0.05, pageText, {
            fontSize: `${fontSize}px`,
            color: '#666666',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            backgroundColor: '#f5f5f5',
            padding: { x: 15, y: 8 }
        });
        this.pageIndicatorText.setOrigin(0.5);
        this.pageIndicatorText.setDepth(100);  // 確保在最上層

        console.log('📄 分頁指示器已創建:', pageText);
    }

    // 🔥 更新分頁指示器
    updatePageIndicator() {
        if (this.pageIndicatorText) {
            const pageText = `${this.currentPage + 1}/${this.totalPages}`;
            this.pageIndicatorText.setText(pageText);
            console.log('📄 分頁指示器已更新:', pageText);
        }
    }

    // 🔥 進入下一頁
    goToNextPage() {
        if (this.currentPage < this.totalPages - 1) {
            this.currentPage++;
            console.log('📄 進入下一頁:', this.currentPage + 1);

            // 重新佈局（會重新創建卡片）
            this.updateLayout();
        }
    }

    // 🔥 顯示「下一頁」按鈕
    showNextPageButton() {
        const width = this.scale.width;
        const height = this.scale.height;

        // 創建按鈕背景
        const buttonWidth = 200;
        const buttonHeight = 60;
        const buttonX = width / 2;
        const buttonY = height / 2;

        const buttonBg = this.add.rectangle(buttonX, buttonY, buttonWidth, buttonHeight, 0x4caf50);
        buttonBg.setInteractive({ useHandCursor: true });
        buttonBg.setDepth(100);

        // 創建按鈕文字
        const buttonText = this.add.text(buttonX, buttonY, '➡️ 下一頁', {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        buttonText.setOrigin(0.5);
        buttonText.setDepth(101);

        // 點擊事件
        buttonBg.on('pointerdown', () => {
            // 移除按鈕
            buttonBg.destroy();
            buttonText.destroy();

            // 進入下一頁
            this.goToNextPage();
        });

        // 懸停效果
        buttonBg.on('pointerover', () => {
            buttonBg.setFillStyle(0x45a049);
        });

        buttonBg.on('pointerout', () => {
            buttonBg.setFillStyle(0x4caf50);
        });

        console.log('📄 下一頁按鈕已顯示');
    }

    // 🔥 檢查當前頁是否全部配對完成
    checkCurrentPageComplete() {
        // 計算當前頁應該有多少個配對
        const startIndex = this.currentPage * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.pairs.length);
        const currentPagePairsCount = endIndex - startIndex;

        // 計算當前頁已配對的數量
        let currentPageMatchedCount = 0;
        for (let i = startIndex; i < endIndex; i++) {
            const pairId = this.pairs[i].id;
            if (this.matchedPairs.has(pairId)) {
                currentPageMatchedCount++;
            }
        }

        console.log('📄 當前頁配對進度:', {
            currentPage: this.currentPage + 1,
            matched: currentPageMatchedCount,
            total: currentPagePairsCount
        });

        // 如果當前頁全部配對完成
        if (currentPageMatchedCount === currentPagePairsCount) {
            this.time.delayedCall(800, () => {
                this.onGameComplete();
            });
        }
    }

    // � 移除 createRestartButton() 方法：用戶要求拿掉重新開始按鈕
}

