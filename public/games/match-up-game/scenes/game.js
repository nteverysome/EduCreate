// ============================================
// 遊戲場景 - 主遊戲邏輯（卡片拖動配對�?
// ============================================
// 注意：響應式配置和佈局類通過全局變量訪問
// - RESPONSIVE_BREAKPOINTS, DESIGN_TOKENS 等來�?responsive-config.js
// - GameResponsiveLayout 類來�?responsive-layout.js
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });

        // 配對數據（將�?API 載入�?
        this.pairs = [];
        this.isLoadingVocabulary = false;
        this.vocabularyLoadError = null;

        // 遊戲狀�?
        this.leftCards = [];
        this.rightCards = [];
        this.matchedPairs = new Set();
        this.isDragging = false;
        this.dragStartCard = null;
        this.sceneStopped = false;  // 🔥 場景停止狀態標�?

        // 🔥 分頁功能
        this.itemsPerPage = 7;  // 默認每頁 7 個詞彙（可配置）
        this.currentPage = 0;   // 當前頁碼（從 0 開始�?
        this.totalPages = 1;    // 總頁�?
        this.enablePagination = false;  // 是否啟用分頁
        this.pageIndicatorText = null;  // 分頁指示器文字對�?

        // 🔥 計時器功�?
        this.timerType = 'none';  // 計時器類型：none, countUp, countDown
        this.timerMinutes = 5;    // 倒數計時分鐘�?
        this.timerSeconds = 0;    // 倒數計時秒數
        this.startTime = null;    // 正向計時開始時間
        this.remainingTime = 0;   // 倒數計時剩餘時間（秒�?
        this.timerText = null;    // 計時器文字對�?
        this.timerEvent = null;   // 計時器事�?

        // 🔥 遊戲選項
        this.layout = 'separated';  // 佈局模式：separated, mixed
        this.random = 'different';  // 隨機模式：different, same
        this.showAnswers = false;   // 遊戲結束時顯示答�?

        // 🔥 遊戲結束狀態管�?
        this.gameState = 'playing';  // 遊戲狀態：playing, completed
        this.gameStartTime = null;   // 遊戲開始時間
        this.gameEndTime = null;     // 遊戲結束時間
        this.totalGameTime = 0;      // 總遊戲時間（秒）
        this.allPagesAnswers = [];   // 所有頁面的用戶答案記錄
        this.currentPageAnswers = []; // 當前頁面的用戶答案記�?

        // Audio diagnostics and dev helpers
        this.audioDiagnostics = null;
        this.devLayoutDefault = null;
        this.restartData = {};
    }

    init(data = {}) {
        this.restartData = data || {};

        if (this.restartData.devLayoutTest) {        } else {
            this.devLayoutDefault = null;
        }
    }

    loadDevLayoutTestData(mode, urlParams) {
        const normalizedMode = (mode || '').toLowerCase();
        const layoutParam = urlParams ? urlParams.get('layout') : null;
        const defaultLayout = normalizedMode === 'separated' ? 'separated' : normalizedMode === 'mixed' ? 'mixed' : 'mixed';

        this.devLayoutDefault = layoutParam || defaultLayout;
        this.vocabularyLoadError = null;

        this.pairs = this.getDevLayoutSamplePairs();
        this.audioDiagnostics = this.buildAudioDiagnostics(this.pairs);
        window.matchUpAudioDiagnostics = this.audioDiagnostics;        return true;
    }

    getDevLayoutSamplePairs() {
        const imageA = '/icons/icon-128x128.png';
        const imageB = '/icons/icon-144x144.png';
        const audioA = '/games/runner-game/public/assets/sounds/coin.mp3';
        const audioB = '/games/pushpull-game/dist/assets/sounds/win.mp3';

        return [
            {
                id: 1,
                question: 'Apple',
                answer: '蘋果',
                english: 'Apple',
                chinese: '蘋果',
                imageUrl: imageA,
                chineseImageUrl: null,
                audioUrl: audioA
            },
            {
                id: 2,
                question: '',
                answer: '語音提示',
                english: '',
                chinese: '語音提示',
                imageUrl: null,
                chineseImageUrl: null,
                audioUrl: audioB
            },
            {
                id: 3,
                question: 'Sunshine',
                answer: '陽光',
                english: 'Sunshine',
                chinese: '陽光',
                imageUrl: null,
                chineseImageUrl: null,
                audioUrl: null
            },
            {
                id: 4,
                question: 'Mountain',
                answer: '山脈',
                english: 'Mountain',
                chinese: '山脈',
                imageUrl: imageB,
                chineseImageUrl: null,
                audioUrl: null
            },
            {
                id: 5,
                question: 'Harmony',
                answer: '和諧',
                english: 'Harmony',
                chinese: '和諧',
                imageUrl: null,
                chineseImageUrl: null,
                audioUrl: audioA
            },
            {
                id: 6,
                question: 'Placeholder',
                answer: '缺少語音',
                english: 'Placeholder',
                chinese: '缺少語音',
                imageUrl: imageA,
                chineseImageUrl: null,
                audioUrl: ''
            }
        ];
    }

    buildAudioDiagnostics(pairs) {
        const diagnostics = {
            total: pairs.length,
            available: 0,
            missing: 0,
            invalid: 0,
            missingItems: [],
            invalidItems: []
        };

        pairs.forEach((pair) => {
            const raw = typeof pair.audioUrl === 'string' ? pair.audioUrl.trim() : '';
            const hasValue = !!raw;
            const isValidFormat = hasValue ? /^(https?:\/\/|\/)/.test(raw) : false;

            if (hasValue && isValidFormat) {
                diagnostics.available += 1;
                pair.audioUrl = raw;
                pair.audioStatus = 'available';
                pair.invalidAudioUrl = null;
            } else if (hasValue && !isValidFormat) {
                diagnostics.invalid += 1;
                diagnostics.invalidItems.push({ id: pair.id, english: pair.english || pair.question, audioUrl: raw });
                pair.audioUrl = null;
                pair.audioStatus = 'invalid';
                pair.invalidAudioUrl = raw;
            } else {
                diagnostics.missing += 1;
                diagnostics.missingItems.push({ id: pair.id, english: pair.english || pair.question });
                pair.audioUrl = null;
                pair.audioStatus = 'missing';
                pair.invalidAudioUrl = null;
            }
        });        if (diagnostics.missing || diagnostics.invalid) {
            console.warn('⚠️ 發現缺少或無效的 audioUrl，請檢查 CMS/後端輸出');
        }

        return diagnostics;
    }

    addAudioStatusBadge(container, width, height, audioStatus) {
        const badgeWidth = Math.min(width * 0.6, 100);
        const badgeHeight = Math.min(height * 0.18, 26);
        const badgeX = width / 2 - badgeWidth / 2 - 8;
        const badgeY = -height / 2 + badgeHeight / 2 + 8;
        const strokeColor = audioStatus === 'invalid' ? 0xf9a825 : 0xb0bec5;
        const icon = audioStatus === 'invalid' ? '⚠️' : '🔇';
        const label = audioStatus === 'invalid' ? 'Audio URL invalid' : 'No audio';

        const badgeBg = this.add.rectangle(badgeX, badgeY, badgeWidth, badgeHeight, 0xf5f5f5, 0.92);
        badgeBg.setOrigin(0.5);
        badgeBg.setStrokeStyle(1.5, strokeColor);

        const badgeText = this.add.text(badgeX, badgeY, `${icon} ${label}`, {
            fontSize: `${Math.max(10, badgeHeight * 0.55)}px`,
            color: '#546E7A',
            fontFamily: 'Arial'
        });
        badgeText.setOrigin(0.5);

        container.add([badgeBg, badgeText]);
    }

    // �?API 載入詞彙數據
    async loadVocabularyFromAPI() {
        try {
            // �?URL 參數獲取 activityId
            const urlParams = new URLSearchParams(window.location.search);
            const activityId = urlParams.get('activityId');
            const customVocabulary = urlParams.get('customVocabulary');
            const devLayoutTest = (this.restartData && this.restartData.devLayoutTest) || urlParams.get('devLayoutTest');

            if (devLayoutTest) {
                return this.loadDevLayoutTestData(devLayoutTest, urlParams);
            }

            // 🔥 修復：必須提�?activityId，不使用默認數據
            if (!activityId) {
                const error = new Error('�?缺少 activityId 參數，無法載入詞彙數�?);
                console.error('�?參數驗證失敗:', error.message);
                throw error;
            }

            // 🔥 修復：如果沒�?customVocabulary 參數，默認為 true（允許公開訪問）
            if (customVocabulary !== 'true' && customVocabulary !== null) {
                const error = new Error('�?customVocabulary 參數無效');
                console.error('�?參數驗證失敗:', error.message);
                throw error;
            }

            // �?API 載入詞彙數據
            const apiUrl = `/api/activities/${activityId}`;
            const response = await fetch(apiUrl);

            if (!response.ok) {
                const errorText = await response.text();
                const error = new Error(`API 請求失敗: ${response.status} ${response.statusText}`);
                console.error('�?API 請求失敗:', {
                    status: response.status,
                    statusText: response.statusText,
                    url: apiUrl,
                    errorBody: errorText
                });
                throw error;
            }

            const activity = await response.json();            // 提取詞彙數據（支持多種數據源�?
            let vocabularyData = [];

            if (activity.vocabularyItems && Array.isArray(activity.vocabularyItems) && activity.vocabularyItems.length > 0) {
                // 新架構：從關聯表中獲取詞彙數�?
                vocabularyData = activity.vocabularyItems;            } else if (activity.elements && Array.isArray(activity.elements) && activity.elements.length > 0) {
                // 中間架構：從 elements 字段載入詞彙數據
                vocabularyData = activity.elements;            } else if (activity.content && activity.content.vocabularyItems && Array.isArray(activity.content.vocabularyItems)) {
                // 舊架構：�?content 中獲取詞彙數�?
                vocabularyData = activity.content.vocabularyItems;            } else {
                console.error('�?無法找到詞彙數據:', {
                    hasVocabularyItems: !!activity.vocabularyItems,
                    hasElements: !!activity.elements,
                    hasContent: !!activity.content
                });
            }

            // 轉換為遊戲所需的格�?
            if (vocabularyData.length > 0) {                // 🔥 v9.0 詳細調試：檢查原始數據結�?
                const firstItem = vocabularyData[0] || {};
                const hasImageUrl = !!firstItem.imageUrl;
                const hasChineseImageUrl = !!firstItem.chineseImageUrl;                this.pairs = vocabularyData.map((item, index) => ({
                    id: index + 1,
                    question: item.english || item.word || '',
                    answer: item.chinese || item.translation || '',
                    english: item.english || item.word || '',  // 🔥 添加 english 欄位
                    chinese: item.chinese || item.translation || '',  // 🔥 添加 chinese 欄位
                    imageUrl: item.imageUrl || null,  // 🔥 添加英文圖片 URL
                    chineseImageUrl: item.chineseImageUrl || null,  // 🔥 添加中文圖片 URL
                    audioUrl: item.audioUrl || null  // 🔥 添加音頻 URL
                }));

                // 🔥 後台異步生成缺失的音頻（不阻塞遊戲加載）
                this.generateMissingAudioUrlsInBackground();

                this.audioDiagnostics = this.buildAudioDiagnostics(this.pairs);
                window.matchUpAudioDiagnostics = this.audioDiagnostics;

                console.log('�?詞彙數據轉換完成:', {
                    totalPairs: this.pairs.length,
                    firstPair: this.pairs[0],
                    hasImages: this.pairs.some(p => p.imageUrl || p.chineseImageUrl || p.imageId || p.chineseImageId),
                    hasAudio: this.pairs.some(p => p.audioUrl)
                });

                // 🔥 調試日誌 - 詳細檢查每個詞彙項目的english字段                this.pairs.forEach((pair, index) => {                });

                return true;
            } else {
                // 🔥 修復：不使用默認數據，拋出錯�?
                const error = new Error('�?活動中沒有詞彙數據，請先添加詞彙');
                console.error('�?詞彙數據為空:', {
                    activityId: activity.id,
                    activityTitle: activity.title
                });
                throw error;
            }
        } catch (error) {
            console.error('�?載入詞彙數據失敗:', {
                message: error.message,
                stack: error.stack,
                url: window.location.href
            });
            this.vocabularyLoadError = error.message;
            // 🔥 修復：不使用默認數據，直接拋出錯�?
            throw error;
        }
    }

    async create() {        // 清空數組（防止重新開始時重複�?
        this.leftCards = [];
        this.rightCards = [];
        this.matchedPairs = new Set();
        this.isDragging = false;
        this.dragStartCard = null;
        this.submitButton = null;  // 🔥 提交答案按鈕

        // 顯示載入提示
        const width = this.scale.width;
        const height = this.scale.height;        this.add.rectangle(width / 2, height / 2, width, height, 0xffffff).setDepth(-1);
        const loadingText = this.add.text(width / 2, height / 2, '載入詞彙�?..', {
            fontSize: '24px',
            color: '#333333',
            fontFamily: 'Arial'
        }).setOrigin(0.5);        // 🔥 修復：使�?try-catch 處理錯誤
        this.isLoadingVocabulary = true;
        let success = false;

        try {
            success = await this.loadVocabularyFromAPI();        } catch (error) {
            console.error('�?GameScene: 詞彙數據載入失敗', error);
            this.vocabularyLoadError = error.message;
            success = false;
        }

        this.isLoadingVocabulary = false;

        // 移除載入提示
        loadingText.destroy();        // 🔥 修復：如果載入失敗，顯示錯誤信息並停止遊�?
        if (!success || this.vocabularyLoadError) {
            console.warn('⚠️ GameScene: 顯示錯誤信息', this.vocabularyLoadError);

            // 顯示錯誤標題
            this.add.text(width / 2, height / 2 - 80, '�?載入詞彙失敗', {
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

            this.add.text(width / 2, height / 2 + 70, '1. URL 包含正確�?activityId 參數', {
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
        this.handlerScene = this.scene.get('handler');        // 🔥 調用 Handler �?updateResize 方法設定響應�?
        if (this.handlerScene && this.handlerScene.updateResize) {            this.handlerScene.updateResize(this);
        } else {
            console.warn('⚠️ GameScene: handlerScene 未初始化�?updateResize 方法不存�?);
        }

        // 🔥 初始化分頁設�?
        this.initializePagination();

        // 🔥 初始化遊戲選�?
        this.initializeGameOptions();

        // 🔥 初始化計時器
        this.initializeTimer();

        // 獲取當前螢幕尺寸        this.updateLayout();        // 🔥 P1-4: 綁定事件監聽器（使用 bind 確保 this 上下文正確）
        // 監聽螢幕尺寸變化
        this.scale.on('resize', this.handleResize, this);        // 監聽全螢幕變�?
        document.addEventListener('fullscreenchange', this.handleFullscreenChange.bind(this));        // 監聽設備方向變化
        window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));    }

    // 🔥 v6.0 計算每頁能容納的最大卡片數
    calculateMaxCardsPerPage(width, height, layout = 'mixed') {
        // 🔥 檢測設備類型和模�?
        const isMobileDevice = width < 768;
        const isLandscapeMobile = width > height && height < 500;
        const isTinyHeight = height < 400;
        const isCompactMode = isMobileDevice || isLandscapeMobile || isTinyHeight;

        // 根據佈局模式決定列數
        let cols;
        if (layout === 'mixed') {
            cols = isCompactMode ? 5 : 3;  // 混合模式：緊�?5 列，正常 3 �?
        } else {
            // 分離模式：根據寬度動態決�?
            const sideMargin = 20;
            const availableWidth = width - sideMargin * 2;
            cols = Math.max(1, Math.floor(availableWidth / 150));  // 假設最小卡片寬�?150px
        }

        // 計算可用高度
        const topButtonArea = isCompactMode ? 50 : 60;
        const bottomButtonArea = isCompactMode ? 50 : 60;
        const availableHeight = height - topButtonArea - bottomButtonArea;

        // 計算卡片尺寸和行�?
        const verticalSpacing = Math.max(5, Math.min(20, availableHeight * 0.02));
        const cardHeight = 67;  // 混合模式卡片高度
        const chineseTextHeight = 20;  // 中文文字高度
        const totalUnitHeight = cardHeight + chineseTextHeight + verticalSpacing;

        const maxRows = Math.max(1, Math.floor((availableHeight - verticalSpacing) / totalUnitHeight));
        const maxCardsPerPage = cols * maxRows;

        console.log('📊 每頁最大卡片數計算:', {
            layout,
            isCompactMode,
            cols,
            maxRows,
            maxCardsPerPage,
            availableHeight: availableHeight.toFixed(0),
            totalUnitHeight: totalUnitHeight.toFixed(0)
        });

        return maxCardsPerPage;
    }

    // 🔥 v6.0 根據最大卡片數計算分頁
    calculatePaginationWithLayout(totalPairs, width, height, layout = 'mixed') {
        // 計算每頁能容納的最大卡片數
        const maxCardsPerPage = this.calculateMaxCardsPerPage(width, height, layout);

        // 確保每頁至少�?1 個卡�?
        const itemsPerPage = Math.max(1, maxCardsPerPage);

        // 計算總頁�?
        const totalPages = Math.ceil(totalPairs / itemsPerPage);

        // 決定是否啟用分頁
        const enablePagination = totalPages > 1;        return {
            itemsPerPage,
            totalPages,
            enablePagination,
            maxCardsPerPage
        };
    }

    // 🔥 初始化分頁設置（v6.0 更新：使用動態計算）
    initializePagination() {
        const totalPairs = this.pairs.length;        // �?URL 參數讀取設�?
        const urlParams = new URLSearchParams(window.location.search);
        const itemsPerPageParam = urlParams.get('itemsPerPage');
        const autoProceedParam = urlParams.get('autoProceed');

        // 讀取每頁顯示數�?
        if (itemsPerPageParam) {
            // 🔥 如果 URL 指定�?itemsPerPage，直接使�?
            this.itemsPerPage = parseInt(itemsPerPageParam, 10);        } else {
            // 🔥 v6.0 新邏輯：根據佈局計算每頁最大卡片數
            const width = this.scale.width;
            const height = this.scale.height;
            const layout = this.layout || 'mixed';

            const paginationResult = this.calculatePaginationWithLayout(
                totalPairs,
                width,
                height,
                layout
            );

            this.itemsPerPage = paginationResult.itemsPerPage;        }

        // 讀取自動繼續設�?
        if (autoProceedParam !== null) {
            this.autoProceed = autoProceedParam === 'true';        } else {
            this.autoProceed = true;  // 默認開啟        }

        // 計算總頁�?
        this.totalPages = Math.ceil(totalPairs / this.itemsPerPage);

        // 決定是否啟用分頁
        this.enablePagination = this.totalPages > 1;

        // 重置當前頁碼
        this.currentPage = 0;    }

    // 🔥 初始化遊戲選�?
    initializeGameOptions() {
        const urlParams = new URLSearchParams(window.location.search);

        // 🔥 v10.1 詳細調試：檢�?URL 參數
        console.log('🔍 [v10.1] URL 參數詳細檢查:', {
            fullUrl: window.location.href,
            search: window.location.search,
            allParams: Array.from(urlParams.entries()),
            layoutParam: urlParams.get('layout'),
            randomParam: urlParams.get('random'),
            showAnswersParam: urlParams.get('showAnswers')
        });

        // 讀取佈局選項
        const layoutParam = urlParams.get('layout');
        this.layout = layoutParam || this.devLayoutDefault || 'separated';        // 讀取隨機選�?
        this.random = urlParams.get('random') || 'different';        // 讀取顯示答案選�?
        this.showAnswers = urlParams.get('showAnswers') === 'true';    }

    // 🔥 初始化計時器
    initializeTimer() {
        const urlParams = new URLSearchParams(window.location.search);

        // 讀取計時器類型
        this.timerType = urlParams.get('timerType') || 'none';        if (this.timerType === 'countDown') {
            // 讀取倒數計時時間
            this.timerMinutes = parseInt(urlParams.get('timerMinutes') || '5', 10);
            this.timerSeconds = parseInt(urlParams.get('timerSeconds') || '0', 10);
            this.remainingTime = this.timerMinutes * 60 + this.timerSeconds;        } else if (this.timerType === 'countUp') {
            // 記錄開始時間
            this.startTime = Date.now();        }
    }

    // 🔥 創建計時�?UI
    createTimerUI() {
        const width = this.scale.width;

        if (this.timerType === 'none') {
            return;  // 不顯示計時器
        }

        // 創建計時器文�?
        const timerColor = this.timerType === 'countDown' ? '#ff0000' : '#000000';
        const initialText = this.timerType === 'countDown'
            ? this.formatTime(this.remainingTime)
            : '00:00';

        // 🔥 計時器置中顯�?
        this.timerText = this.add.text(width / 2, 20, initialText, {
            fontSize: '28px',
            color: timerColor,
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5, 0).setDepth(1000);

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
        }    }

    // 🔥 更新倒數計時�?
    updateCountDownTimer() {
        this.remainingTime--;

        if (this.remainingTime <= 0) {
            // 時間�?
            this.onTimeUp();
        } else {
            // 更新顯示
            if (this.timerText) {
                this.timerText.setText(this.formatTime(this.remainingTime));

                // 最�?10 秒變紅色並閃�?
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

    // 🔥 更新正向計時�?
    updateCountUpTimer() {
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        if (this.timerText) {
            this.timerText.setText(this.formatTime(elapsed));
        }
    }

    // 🔥 格式化時間（�?-> MM:SS�?
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    // 🔥 時間到達處理
    onTimeUp() {        // 停止計時�?
        if (this.timerEvent) {
            this.timerEvent.remove();
        }

        // 顯示時間到訊�?
        this.showTimeUpMessage();
    }

    // 🔥 顯示時間到訊�?
    showTimeUpMessage() {
        const width = this.scale.width;
        const height = this.scale.height;

        // 創建半透明背景
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7)
            .setDepth(2000);

        // 顯示時間到訊�?
        const messageText = this.add.text(width / 2, height / 2 - 50, '�?時間到！', {
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
            `已完�?${completedCount} / ${totalCount} 個配對`,
            {
                fontSize: '24px',
                color: '#ffffff',
                fontFamily: 'Arial'
            }
        ).setOrigin(0.5).setDepth(2001);

        // 如果開啟顯示答案，顯示答案按�?
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

    updateLayout() {        // 清除所有現有元�?
        this.children.removeAll(true);

        // 獲取當前螢幕尺寸
        const width = this.scale.width;
        const height = this.scale.height;        // 添加白色背景
        this.add.rectangle(width / 2, height / 2, width, height, 0xffffff).setDepth(-1);

        // 🔥 移除標題：用戶要求拿掉遊戲內�?"Match up" 標題        // 創建卡片
        this.createCards();        // 🔥 記錄遊戲開始時間
        if (!this.gameStartTime) {
            this.gameStartTime = Date.now();        }

        // 🔥 創建計時�?UI
        this.createTimerUI();

        // 🔥 顯示「提交答案」按鈕（遊戲開始時就顯示�?
        this.showSubmitButton();

        // 🔥 移除重新開始按鈕：用戶要求拿�?
    }

    handleResize(gameSize) {        // 螢幕尺寸改變時重新佈局
        this.updateLayout();
    }

    createCards() {        // 🔥 獲取當前頁的詞彙數據
        const startIndex = this.currentPage * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.pairs.length);
        const currentPagePairs = this.pairs.slice(startIndex, endIndex);        // 獲取當前螢幕尺寸
        const width = this.scale.width;
        const height = this.scale.height;        // �?v40.0：iPad 動態卡片尺寸調整
        // 檢測 iPad（寬�?768-1280px，包�?iPad Air、iPad Pro�?
        const isTablet = width >= 768 && width <= 1280;
        const isIPad = isTablet;        // 響應式卡片尺寸（根據螢幕寬度調整�?
        let cardWidth, cardHeight;
        if (isIPad) {
            // iPad：根據容器大小動態調�?
            // 分離佈局：左右各一列，所以卡片寬�?= 可用寬度 / 2 - 邊距
            cardWidth = Math.max(140, (width - 60) / 2 - 20);  // 60px 邊距�?0px 間距
            cardHeight = Math.max(60, height * 0.12);  // 高度為螢幕高度的 12%
            console.log('📱 [v40.0] iPad 動態卡片尺寸:', {
                availableWidth: width - 60,
                calculatedCardWidth: cardWidth.toFixed(1),
                calculatedCardHeight: cardHeight.toFixed(1)
            });
        } else {
            // 其他設備：使用固定比�?
            cardWidth = Math.max(150, Math.min(250, width * 0.2));
            cardHeight = Math.max(50, Math.min(80, height * 0.1));
        }        // 響應式位置（使用百分比）
        const leftX = width * 0.25;        // 左側卡片�?25% 位置
        const rightX = width * 0.65;       // 右側卡片�?65% 位置
        const leftStartY = height * 0.25;  // 左側起始位置�?25% 高度
        const rightStartY = height * 0.22; // 右側起始位置�?22% 高度        // 響應式間�?
        const leftSpacing = cardHeight + Math.max(5, height * 0.01);   // 卡片高度 + 5px �?1% 高度
        const rightSpacing = cardHeight + Math.max(15, height * 0.03); // 卡片高度 + 15px �?3% 高度        // 🔥 根據佈局模式創建卡片
        if (this.layout === 'mixed') {
            // 混合佈局模式
            this.createMixedLayout(currentPagePairs, width, height, cardWidth, cardHeight);
        } else {
            // 分離佈局模式（默認）
            this.createSeparatedLayout(currentPagePairs, leftX, rightX, leftStartY, rightStartY,
                                      cardWidth, cardHeight, leftSpacing, rightSpacing);
        }

        // 🔥 創建分頁指示�?
        if (this.enablePagination) {
            this.createPageIndicator();
        }    }

    // 🔥 創建分離佈局（根�?Wordwall 策略�?
    createSeparatedLayout(currentPagePairs, leftX, rightX, leftStartY, rightStartY,
                          cardWidth, cardHeight, leftSpacing, rightSpacing) {
        const width = this.scale.width;
        const height = this.scale.height;
        const itemCount = currentPagePairs.length;

        // 🔥 根據 Wordwall 策略判斷佈局
        if (itemCount <= 5) {
            // 3-5 個：左右分離，單�?
            this.createLeftRightSingleColumn(currentPagePairs, width, height);
        } else {
            // 6-20 個：左右分離，多�?2 �?
            this.createLeftRightMultiRows(currentPagePairs, width, height);
        }
    }

    // 🔥 創建左右分離佈局 - 單列�?-5個匹配數�?
    createLeftRightSingleColumn(currentPagePairs, width, height) {        const itemCount = currentPagePairs.length;

        // 🔥 檢測容器高度和手機橫向模�?
        const isSmallContainer = height < 600;
        const isMediumContainer = height >= 600 && height < 800;
        const isLandscapeMobile = width > height && height < 450;  // 🔥 手機橫向模式        // 🔥 根據容器大小動態調整卡片尺寸
        let cardWidth, cardHeight;

        if (isLandscapeMobile) {
            // 🔥 手機橫向模式：使用超緊湊佈局
            cardWidth = Math.max(100, Math.min(150, width * 0.15));
            cardHeight = Math.max(28, Math.min(40, height * 0.08));        } else if (isSmallContainer) {
            // 小容器：更小的卡�?
            cardWidth = Math.max(120, Math.min(200, width * 0.18));
            cardHeight = Math.max(40, Math.min(65, height * 0.09));
        } else if (isMediumContainer) {
            // 中等容器：適中的卡片
            cardWidth = Math.max(140, Math.min(220, width * 0.19));
            cardHeight = Math.max(45, Math.min(72, height * 0.095));
        } else {
            // 大容器：較大的卡�?
            cardWidth = Math.max(150, Math.min(250, width * 0.2));
            cardHeight = Math.max(50, Math.min(80, height * 0.1));
        }

        console.log(`📐 卡片尺寸: ${cardWidth.toFixed(0)} × ${cardHeight.toFixed(0)}`);

        // 🔥 根據容器大小動態調整位置
        // 🔥 英文區域往右移�?20%，英文區和中文區都往下移�?10%
        let leftX, rightX, leftStartY, rightStartY;

        if (isLandscapeMobile) {
            // 🔥 手機橫向模式：更緊湊的位�?
            leftX = width * 0.38;
            rightX = width * 0.70;
            leftStartY = height * 0.15;
            rightStartY = height * 0.12;
        } else if (isSmallContainer) {
            // 小容器：更緊湊的佈局
            leftX = width * 0.42;  // 🔥 �?0.22 改為 0.42�?20%�?
            rightX = width * 0.68;
            leftStartY = height * 0.25;   // 🔥 �?0.15 改為 0.25�?10%�?
            rightStartY = height * 0.22;  // 🔥 �?0.12 改為 0.22�?10%�?
        } else if (isMediumContainer) {
            // 中等容器：平衡的佈局
            leftX = width * 0.44;  // 🔥 �?0.24 改為 0.44�?20%�?
            rightX = width * 0.66;
            leftStartY = height * 0.3;    // 🔥 �?0.2 改為 0.3�?10%�?
            rightStartY = height * 0.27;  // 🔥 �?0.17 改為 0.27�?10%�?
        } else {
            // 大容器：舒適的佈局
            leftX = width * 0.45;  // 🔥 �?0.25 改為 0.45�?20%�?
            rightX = width * 0.65;
            leftStartY = height * 0.35;   // 🔥 �?0.25 改為 0.35�?10%�?
            rightStartY = height * 0.32;  // 🔥 �?0.22 改為 0.32�?10%�?
        }

        // 🔥 根據容器大小動態調整間距
        // 英文卡片：加 cardHeight
        // 中文卡片�?-5個匹配數）：只加 cardHeight（不�?textHeight + oneCharSpacing�?
        let leftSpacing, rightSpacing;

        if (isLandscapeMobile) {
            // 🔥 手機橫向模式：計算最大可用高度，確保所有卡片都能顯�?
            const availableHeight = height * 0.75;  // 使用 75% 的高�?
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
            shuffledAnswers = rng.shuffle([...currentPagePairs]);        } else {
            shuffledAnswers = Phaser.Utils.Array.Shuffle([...currentPagePairs]);        }

        // 創建左側外框
        this.createLeftContainerBox(leftX, leftStartY, cardWidth, cardHeight, leftSpacing, itemCount);

        // 🔥 創建左側題目卡片（按照順序出現動畫）
        currentPagePairs.forEach((pair, index) => {
            const y = leftStartY + index * leftSpacing;
            const animationDelay = index * 100;  // 🔥 每個卡片延�?100ms
            const card = this.createLeftCard(leftX, y, cardWidth, cardHeight, pair.question, pair.id, animationDelay, pair.imageUrl, pair.audioUrl);
            this.leftCards.push(card);
        });

        // 創建右側答案卡片（文字在框右邊）
        shuffledAnswers.forEach((pair, index) => {
            const y = rightStartY + index * rightSpacing;
            const card = this.createRightCard(rightX, y, cardWidth, cardHeight, pair.answer, pair.id, 'right');  // 🔥 文字在框右邊
            this.rightCards.push(card);
        });    }

    // 🔥 創建上下分離佈局 - 2 行（6-10個匹配數�?
    createTopBottomTwoRows(currentPagePairs, width, height) {        const itemCount = currentPagePairs.length;

        // 🔥 檢測容器高度
        const isSmallContainer = height < 600;
        const isMediumContainer = height >= 600 && height < 800;        // 🔥 計算列數（固�?2 行）
        const rows = 2;
        const columns = Math.ceil(itemCount / rows);        // 🔥 根據容器大小和列數調整卡片尺�?
        let cardWidth, cardHeight;
        if (isSmallContainer) {
            cardWidth = Math.max(80, Math.min(120, width * (0.85 / columns)));  // �?提高最小寬度從 70px �?80px
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

        // 🔥 英文卡片的垂直間距（不加文字高度�?
        const topVerticalSpacing = Math.max(5, height * 0.02);

        // 🔥 中文卡片的垂直間距（只加文字高度，不加額外間距）
        const bottomVerticalSpacing = textHeight;

        // 🔥 計算上方區域（英文）的起始位置
        const topAreaStartX = (width - (columns * cardWidth + (columns - 1) * horizontalSpacing)) / 2;
        const topAreaStartY = height * 0.12;

        // 🔥 計算下方區域（中文）的起始位置
        const bottomAreaStartX = topAreaStartX;
        const bottomAreaStartY = height * 0.55;

        console.log(`📍 區域位�?`, {
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
            shuffledAnswers = rng.shuffle([...currentPagePairs]);        } else {
            shuffledAnswers = Phaser.Utils.Array.Shuffle([...currentPagePairs]);        }

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

        // 🔥 創建上方英文卡片�? 行多列，按照順序出現動畫�?
        currentPagePairs.forEach((pair, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);
            const x = topAreaStartX + col * (cardWidth + horizontalSpacing) + cardWidth / 2;
            const y = topAreaStartY + row * (cardHeight + topVerticalSpacing) + cardHeight / 2;  // 🔥 英文卡片使用 topVerticalSpacing

            const animationDelay = index * 100;  // 🔥 每個卡片延�?100ms
            const card = this.createLeftCard(x, y, cardWidth, cardHeight, pair.question, pair.id, animationDelay, pair.imageUrl, pair.audioUrl);
            this.leftCards.push(card);
        });

        // 🔥 創建下方中文卡片�? 行多列）
        shuffledAnswers.forEach((pair, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);
            const x = bottomAreaStartX + col * (cardWidth + horizontalSpacing) + cardWidth / 2;
            const y = bottomAreaStartY + row * (cardHeight + bottomVerticalSpacing) + cardHeight / 2;  // 🔥 中文卡片使用 bottomVerticalSpacing

            const card = this.createRightCard(x, y, cardWidth, cardHeight, pair.answer, pair.id);
            this.rightCards.push(card);
        });    }

    // 🔥 創建左右分離佈局 - 多行 2 列（6-20個匹配數�?
    createLeftRightMultiRows(currentPagePairs, width, height) {        const itemCount = currentPagePairs.length;

        // 🔥 檢測容器高度
        const isSmallContainer = height < 600;
        const isMediumContainer = height >= 600 && height < 800;        // 🔥 v10.0 檢測是否有圖片（只要有任何一個圖片就進入正方形模式）
        const hasImages = currentPagePairs.some(pair =>
            pair.imageUrl || pair.chineseImageUrl || pair.imageId || pair.chineseImageId
        );        // 🔥 v10.0 根據圖片檢測決定列數
        // 有圖片時：使�?5 列（正方形模式）
        // 無圖片時：使�?2 列（長方形模式）
        const columns = hasImages ? 5 : 2;
        const rows = Math.ceil(itemCount / columns);        // 🔥 計算間距（先計算，用於後續卡片高度計算）
        const horizontalSpacing = Math.max(5, width * 0.01);
        const verticalSpacing = Math.max(3, height * 0.008);

        // 🔥 動態計算最大卡片高度，確保所有卡片都能放入容�?
        const availableHeight = height * 0.8;  // 使用 80% 的容器高�?
        const totalVerticalSpacing = (rows - 1) * verticalSpacing;
        const maxCardHeight = (availableHeight - totalVerticalSpacing) / rows;

        // 🔥 根據容器大小和匹配數調整卡片尺寸
        let cardWidth, cardHeight;

        // 🔥 6-10 個和 16-20 個匹配數使用更小的卡片尺�?
        const isSmallCardSize = itemCount <= 10 || itemCount >= 16;

        // 🔥 v10.0 根據列數調整卡片尺寸
        // 5 列模式（有圖片）：卡片更�?
        // 2 列模式（無圖片）：卡片更�?
        if (columns === 5) {
            // 🔥 v10.0 正方形模式（5 列）：卡片更�?
            if (isSmallContainer) {
                cardWidth = Math.max(50, Math.min(80, width * 0.08));
                cardHeight = Math.max(50, Math.min(80, width * 0.08));  // 正方�?
            } else if (isMediumContainer) {
                cardWidth = Math.max(60, Math.min(100, width * 0.10));
                cardHeight = Math.max(60, Math.min(100, width * 0.10));  // 正方�?
            } else {
                cardWidth = Math.max(80, Math.min(140, width * 0.12));
                cardHeight = Math.max(80, Math.min(140, width * 0.12));  // 正方�?
            }
        } else {
            // 🔥 v10.0 長方形模式（2 列）：卡片更�?
            if (isSmallCardSize) {
                cardWidth = Math.max(70, Math.min(110, width * 0.11));  // 🔥 6-10 個和 16-20 個：更小的寬�?
                cardHeight = Math.max(18, Math.min(maxCardHeight, 38));  // 🔥 6-10 個和 16-20 個：更小的高�?
            } else {
                cardWidth = Math.max(80, Math.min(130, width * 0.13));
                cardHeight = Math.max(20, Math.min(maxCardHeight, 45));
            }
        }

        console.log(`📐 卡片尺寸 [v10.0]: ${cardWidth.toFixed(0)} × ${cardHeight.toFixed(0)}, 模式: ${columns === 5 ? '🟦 正方�?(5�?' : '🟨 長方�?(2�?'}`);
        console.log(`📏 可用高度: ${availableHeight.toFixed(0)}, 最大卡片高�? ${maxCardHeight.toFixed(0)}`);

        // 🔥 英文卡片和中文卡片的垂直間距（文字在框右邊，不需要額外間距）
        const leftVerticalSpacing = verticalSpacing;
        const rightVerticalSpacing = verticalSpacing;  // 🔥 與左側相�?

        // 🔥 計算左側區域（英文）的起始位置
        const leftAreaStartX = width * 0.08;
        const leftAreaStartY = height * 0.1;

        // 🔥 計算右側區域（中文）的起始位置
        const rightAreaStartX = width * 0.52;
        const rightAreaStartY = height * 0.1;

        console.log(`📍 區域位�?`, {
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
            shuffledAnswers = rng.shuffle([...currentPagePairs]);        } else {
            shuffledAnswers = Phaser.Utils.Array.Shuffle([...currentPagePairs]);        }

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

        // 🔥 創建左側英文卡片（多�?2 列，按照順序出現動畫�?
        currentPagePairs.forEach((pair, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);
            const x = leftAreaStartX + col * (cardWidth + horizontalSpacing) + cardWidth / 2;
            const y = leftAreaStartY + row * (cardHeight + leftVerticalSpacing) + cardHeight / 2;  // 🔥 英文卡片使用 leftVerticalSpacing

            const animationDelay = index * 100;  // 🔥 每個卡片延�?100ms
            const card = this.createLeftCard(x, y, cardWidth, cardHeight, pair.question, pair.id, animationDelay, pair.imageUrl, pair.audioUrl);
            this.leftCards.push(card);
        });

        // 🔥 創建右側中文卡片（多�?2 列）
        shuffledAnswers.forEach((pair, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);
            const x = rightAreaStartX + col * (cardWidth + horizontalSpacing) + cardWidth / 2;
            const y = rightAreaStartY + row * (cardHeight + rightVerticalSpacing) + cardHeight / 2;  // 🔥 中文卡片使用 rightVerticalSpacing

            // 🔥 根據列號決定文字位置：第一列（col=0）文字在左邊，第二列（col=1）文字在右邊
            const textPosition = col === 0 ? 'left' : 'right';
            const card = this.createRightCard(x, y, cardWidth, cardHeight, pair.answer, pair.id, textPosition);
            this.rightCards.push(card);
        });    }

    // 🔥 創建上下分離佈局 - 多行多列�?1-30個匹配數�?
    createTopBottomMultiRows(currentPagePairs, width, height) {        const itemCount = currentPagePairs.length;

        // 🔥 檢測容器高度
        const isSmallContainer = height < 600;
        const isMediumContainer = height >= 600 && height < 800;        // 🔥 根據匹配數計算行列數
        let rows, columns;
        if (itemCount <= 24) {
            // 21-24 個：3 �?× 8 �?
            rows = 3;
            columns = 8;
        } else {
            // 25-30 個：3 �?× 10 �?
            rows = 3;
            columns = 10;
        }        // 🔥 根據容器大小和列數調整卡片尺�?
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

        // 🔥 計算文字高度和一個字的間距（用於下方中文卡片�?
        const textHeight = Math.max(24, Math.min(48, cardHeight * 0.6));
        const oneCharSpacing = textHeight;

        // 🔥 英文卡片的垂直間距（不加文字高度�?
        const topVerticalSpacing = Math.max(3, height * 0.01);

        // 🔥 中文卡片的垂直間距（加文字高�?+ 一個字的間距）
        const bottomVerticalSpacing = textHeight + oneCharSpacing + Math.max(3, height * 0.01);

        // 🔥 計算上方區域（英文）的起始位置
        const topAreaStartX = (width - (columns * cardWidth + (columns - 1) * horizontalSpacing)) / 2;
        const topAreaStartY = height * 0.08;

        // 🔥 計算上方區域的總高�?
        const topAreaHeight = rows * cardHeight + (rows - 1) * topVerticalSpacing;

        // 🔥 計算下方區域的總高度（包含文字�?
        const bottomAreaHeight = rows * cardHeight + (rows - 1) * bottomVerticalSpacing;

        // 🔥 計算下方區域（中文）的起始位置，確保所有內容都能顯�?
        const bottomAreaStartX = topAreaStartX;
        const availableBottomSpace = height - topAreaStartY - topAreaHeight - 10;  // 10px 為上下區域間�?
        const bottomAreaStartY = Math.max(
            topAreaStartY + topAreaHeight + 10,  // 至少在上方區域下�?10px
            height - bottomAreaHeight - 10  // 確保下方區域完全顯�?
        );

        console.log(`📍 區域位�?`, {
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
            shuffledAnswers = rng.shuffle([...currentPagePairs]);        } else {
            shuffledAnswers = Phaser.Utils.Array.Shuffle([...currentPagePairs]);        }

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

        // 🔥 創建上方英文卡片（多行多列，按照順序出現動畫�?
        currentPagePairs.forEach((pair, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);
            const x = topAreaStartX + col * (cardWidth + horizontalSpacing) + cardWidth / 2;
            const y = topAreaStartY + row * (cardHeight + topVerticalSpacing) + cardHeight / 2;  // 🔥 英文卡片使用 topVerticalSpacing

            const animationDelay = index * 100;  // 🔥 每個卡片延�?100ms
            const card = this.createLeftCard(x, y, cardWidth, cardHeight, pair.question, pair.id, animationDelay, pair.imageUrl, pair.audioUrl);
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
        });    }

    // 🔥 創建混合網格佈局�?1個以上匹配數�?
    createMixedGridLayout(currentPagePairs, width, height) {        const itemCount = currentPagePairs.length;
        const totalCards = itemCount * 2;  // 英文 + 中文

        // 🔥 檢測容器高度和寬度（v7.0 修復：根據寬度判定，不只看高度）
        const isMobilePortrait = width < 500;  // 手機直向
        const isSmallContainer = height < 500;  // 極小高度
        const isMediumContainer = height >= 500 && height < 800;        // 🔥 根據容器高度和總卡片數計算列數（v7.0 修復：手機直向優先使�?5 列）
        let columns = 1;

        if (isMobilePortrait) {
            // 🔥 v7.0 新增：手機直向（寬度 < 500px�? 優先使用 5 �?
            if (totalCards > 40) {
                columns = 5;  // 41-60 張卡片：5 �?
            } else if (totalCards > 30) {
                columns = 5;  // 31-40 張卡片：5 列（改為 5 列）
            } else if (totalCards > 20) {
                columns = 5;  // 21-30 張卡片：5 列（改為 5 列）
            } else {
                columns = 5;  // 20 張以下卡片：5 列（改為 5 列）
            }
        } else if (isSmallContainer) {
            // 小容器（高度 < 500px）：更早切換到多�?
            if (totalCards > 40) {
                columns = 5;  // 41-60 張卡片：5 �?
            } else if (totalCards > 30) {
                columns = 4;  // 31-40 張卡片：4 �?
            } else {
                columns = 3;  // 22-30 張卡片：3 �?
            }
        } else if (isMediumContainer) {
            // 中等容器（高�?500-800px）：適中的切換點
            if (totalCards > 48) {
                columns = 6;  // 49-60 張卡片：6 �?
            } else if (totalCards > 36) {
                columns = 5;  // 37-48 張卡片：5 �?
            } else if (totalCards > 24) {
                columns = 4;  // 25-36 張卡片：4 �?
            } else {
                columns = 3;  // 22-24 張卡片：3 �?
            }
        } else {
            // 大容器（高度 >= 800px）：較晚切換到多�?
            if (totalCards > 48) {
                columns = 6;  // 49-60 張卡片：6 �?
            } else if (totalCards > 36) {
                columns = 5;  // 37-48 張卡片：5 �?
            } else {
                columns = 4;  // 22-36 張卡片：4 �?
            }
        }        // 🔥 根據列數和容器大小調整卡片寬�?
        let dynamicCardWidth;
        if (isSmallContainer) {
            // 小容器：更小的卡�?
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
            // 大容器：較大的卡�?
            dynamicCardWidth = {
                4: Math.max(80, Math.min(120, width * 0.1)),     // 10% 寬度
                5: Math.max(70, Math.min(100, width * 0.085)),   // 8.5% 寬度
                6: Math.max(60, Math.min(90, width * 0.075))     // 7.5% 寬度
            }[columns];
        }

        // 🔥 根據列數和容器大小調整卡片高�?
        let dynamicCardHeight;
        if (isSmallContainer) {
            // 小容器：更小的卡片高�?
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
            // 大容器：較大的卡片高�?
            dynamicCardHeight = {
                4: Math.max(35, Math.min(50, height * 0.07)),    // 7% 高度
                5: Math.max(33, Math.min(48, height * 0.065)),   // 6.5% 高度
                6: Math.max(30, Math.min(45, height * 0.06))     // 6% 高度
            }[columns];
        }

        console.log(`📐 卡片尺寸: ${dynamicCardWidth.toFixed(0)} × ${dynamicCardHeight.toFixed(0)}`);

        // 🔥 創建所有卡片數據（英文 + 中文�?
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

        // 🔥 根據隨機模式排列所有卡�?
        let shuffledCards;
        if (this.random === 'same') {
            // 固定隨機模式：使用活�?ID 作為種子
            const urlParams = new URLSearchParams(window.location.search);
            const activityId = urlParams.get('activityId') || 'default-seed';
            const seed = activityId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

            // 使用固定種子創建隨機數生成器
            const rng = new Phaser.Math.RandomDataGenerator([seed.toString()]);
            shuffledCards = rng.shuffle(allCards);        } else {
            // 每次不同模式：隨機排�?
            shuffledCards = Phaser.Utils.Array.Shuffle(allCards);        }

        // 🔥 計算行數
        const rows = Math.ceil(totalCards / columns);        // 🔥 根據容器高度動態調整可用空間和起始位�?
        let availableHeightPercent, startYPercent;

        if (isSmallContainer) {
            // 小容器：使用更多空間，更緊湊的佈局
            availableHeightPercent = 0.85;  // 使用 85% 的高�?
            startYPercent = 0.05;  // �?5% 高度開始
        } else if (isMediumContainer) {
            // 中等容器：平衡的佈局
            availableHeightPercent = 0.80;  // 使用 80% 的高�?
            startYPercent = 0.08;  // �?8% 高度開始
        } else {
            // 大容器：舒適的佈局
            availableHeightPercent = 0.75;  // 使用 75% 的高�?
            startYPercent = 0.12;  // �?12% 高度開始
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
        const horizontalSpacing = Math.max(5, dynamicCardWidth * 0.08);  // 卡片寬度�?8%，最�?5px

        // 🔥 計算網格起始位置
        const gridStartX = width * 0.05;  // �?5% 位置開始
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

            const animationDelay = index * 100;  // 🔥 每個卡片延�?100ms

            if (cardData.type === 'question') {
                const card = this.createLeftCard(x, y, dynamicCardWidth, dynamicCardHeight, cardData.text, cardData.pairId, animationDelay, cardData.pair.imageUrl, cardData.pair.audioUrl);
                this.leftCards.push(card);
            } else {
                const card = this.createRightCard(x, y, dynamicCardWidth, dynamicCardHeight, cardData.text, cardData.pairId);
                this.rightCards.push(card);
            }
        });    }

    // 🔥 創建混合佈局（英文卡片和中文框混合排列）
    createMixedLayout(currentPagePairs, width, height, cardWidth, cardHeight) {        const itemCount = currentPagePairs.length;

        // ============================================
        // 🔥 Phase 3：使�?GameResponsiveLayout 統一管理佈局
        // ============================================

        // 1️⃣ 檢測圖片
        const hasImages = currentPagePairs.some(pair =>
            pair.imageUrl || pair.chineseImageUrl || pair.imageId || pair.chineseImageId
        );        // 2️⃣ 創建佈局引擎
        const isTablet = width >= 768 && width <= 1280;
        const layout = new GameResponsiveLayout(width, height, {
            isIPad: isTablet,
            hasImages: hasImages,
            itemCount: itemCount
        });

        // 3️⃣ 獲取完整配置
        const config = layout.getLayoutConfig();        // ============================================
        // 從配置中提取所有需要的�?
        // ============================================

        // 設備檢測信息
        const isMobileDevice = width < 768;
        const isPortraitMode = height > width;
        const isLandscapeMode = width > height;
        const isLandscapeMobile = isLandscapeMode && height < 500;
        const isTinyHeight = height < 400;
        const isIPad = isTablet;
        const iPadSize = config.iPadSize;  // �?config 中獲�?iPad 大小分類
        const isCompactMode = isMobileDevice || isLandscapeMobile || isTinyHeight;
        const isPortraitCompactMode = isMobileDevice && isPortraitMode;
        const isLandscapeCompactMode = isLandscapeMobile || isTinyHeight;

        console.log('📱 響應式檢�?[v38.0 + Phase 3]:', {
            width,
            height,
            isPortraitMode,
            isLandscapeMode,
            isPortraitCompactMode,
            isLandscapeCompactMode,
            isCompactMode,
            isIPad,
            aspectRatio: (width / height).toFixed(2)
        });

        // 🔥 根據匹配數和模式決定列數和框的尺�?
        let cols, frameWidth, totalUnitHeight, cardHeightInFrame, chineseFontSize, chineseTextHeight, verticalSpacing;
        // 📝 totalUnitHeight = 單元總高度（包含英文卡片高度 + 中文文字高度�?

        // 📝 中文文字高度會根據模式動態調�?
        // 緊湊模式�?6px字體 �?~16px高度
        // 正常模式�?8px字體 �?~18px高度

        // 🔥 預先聲明 chineseFontSizes 變量（用於存儲所有中文文字的實際字體大小�?
        let chineseFontSizes;

        if (isCompactMode) {
            // 📝 緊湊模式（手機橫向或極小高度�?
            // 目標：減少垂直空間佔用，增加列數            // 🔥 v10.0 檢測是否有圖片（只要有任何一個圖片就進入正方形模式）
            const hasImages = currentPagePairs.some(pair =>
                pair.imageUrl || pair.chineseImageUrl || pair.imageId || pair.chineseImageId
            );            // 🔥 v18.0：動態列數計�?
            // 根據每頁匹配數動態調整列數和卡片尺寸
            // 20 �?�?5 列，10 �?�?4 列，5 �?�?3 �?
            // �?v37.0：橫向模式固�?7 列（3 行）
            if (isLandscapeCompactMode) {
                // 橫向模式：固�?7 列（充分利用寬度�?
                cols = 7;  // 橫向模式：固�?7 �?
            } else {
                // 直向模式：保持原有邏�?
                if (itemCount >= 16) {
                    cols = 5;  // 16-20 個：5 �?
                } else if (itemCount >= 9) {
                    cols = 4;  // 9-15 個：4 �?
                } else if (itemCount >= 4) {
                    cols = 3;  // 4-8 個：3 �?
                } else {
                    cols = Math.min(itemCount, 2);  // 1-3 個：2 列或更少
                }
            }
            cols = Math.min(cols, itemCount);  // 確保列數不超過項目數            // 🔥 v20.0：添加詳細的設備尺寸和寬高比調試信息
            const aspectRatio = width / height;
            console.log(`📱 [v20.0] 設備尺寸和寬高比詳細信息:`, {
                width,
                height,
                aspectRatio: aspectRatio.toFixed(3),
                isPortraitMode,
                isLandscapeMode,
                isPortraitCompactMode,
                isLandscapeCompactMode,
                deviceType: width < 768 ? '手機' : width < 1024 ? '平板' : '桌面',
                screenCategory: aspectRatio > 1.5 ? '寬螢�? : aspectRatio > 1.2 ? '標準螢幕' : '直向螢幕'
            });

            // 計算行數
            const rows = Math.ceil(itemCount / cols);

            // 📝 計算可用垂直空間
            const topBottomMargin = 30;  // 上下邊距
            const minVerticalSpacing = 2;  // 最小垂直間�?
            const availableHeight = height - topBottomMargin;  // 可用高度

            // 📝 計算每行的高度（初步估算�?
            // 公式�?可用高度 - 間距總和) / 行數
            const rowHeight = (availableHeight - minVerticalSpacing * (rows + 1)) / rows;

            // 📝 根據列數動態計算最大卡片高�?
            // 🔥 v19.0：根據列數自動調整卡片尺�?
            // 5 列：65px�? 列：75px�? 列：85px�? 列：95px
            let maxCardHeight;
            let chineseTextHeightBase;
            let verticalSpacingBase;

            if (isPortraitCompactMode) {
                // 🔥 v19.0：手機直�?- 根據列數動態調整
                if (cols === 5) {
                    // 5 列：緊湊排列（Wordwall 風格�?
                    maxCardHeight = hasImages ? 65 : 50;
                    chineseTextHeightBase = 18;
                    verticalSpacingBase = 3;
                } else if (cols === 4) {
                    // 4 列：中等排列
                    maxCardHeight = hasImages ? 75 : 60;
                    chineseTextHeightBase = 20;
                    verticalSpacingBase = 3;
                } else if (cols === 3) {
                    // 3 列：寬鬆排列
                    maxCardHeight = hasImages ? 85 : 70;
                    chineseTextHeightBase = 22;
                    verticalSpacingBase = 4;
                } else {
                    // 2 列或更少：最寬鬆排列
                    maxCardHeight = hasImages ? 95 : 80;
                    chineseTextHeightBase = 24;
                    verticalSpacingBase = 5;
                }            } else if (isLandscapeCompactMode) {
                // 🔥 v19.0：手機橫�?- 根據列數動態調整（更緊湊�?
                // �?v37.0：添�?7 列的設定
                if (cols === 7) {
                    maxCardHeight = hasImages ? 40 : 30;
                    chineseTextHeightBase = 10;
                    verticalSpacingBase = 1;
                } else if (cols === 6) {
                    maxCardHeight = hasImages ? 45 : 35;
                    chineseTextHeightBase = 11;
                    verticalSpacingBase = 2;
                } else if (cols === 5) {
                    maxCardHeight = hasImages ? 50 : 40;
                    chineseTextHeightBase = 12;
                    verticalSpacingBase = 2;
                } else if (cols === 4) {
                    maxCardHeight = hasImages ? 60 : 50;
                    chineseTextHeightBase = 14;
                    verticalSpacingBase = 2;
                } else if (cols === 3) {
                    maxCardHeight = hasImages ? 70 : 60;
                    chineseTextHeightBase = 16;
                    verticalSpacingBase = 3;
                } else {
                    maxCardHeight = hasImages ? 80 : 70;
                    chineseTextHeightBase = 18;
                    verticalSpacingBase = 3;
                }            } else {
                // 其他模式（不應該執行到這裡�?
                maxCardHeight = hasImages ? 65 : 50;
                chineseTextHeightBase = 18;
                verticalSpacingBase = 3;
            }

            // 🔥 計算框寬�?
            // v10.0：如果有圖片，框寬度 = 卡片高度（正方形）；否則框寬�?> 卡片高度（長方形�?
            // 🔥 v23.0：根據列數動態調整邊距，確保 5 列卡片在 iPhone 14 (390px) 上完整顯�?
            // iPhone 14 直向 (390px) 應該�?330px 可用寬度，所以邊距應該是 30px × 2 = 60px
            let horizontalMargin;
            // �?v37.0：為 7 列添加邊距設�?
            if (cols === 7) {
                // 7 列：最小邊距（10px�? 橫向模式充分利用寬度
                horizontalMargin = 10;
            } else if (cols === 6) {
                // 6 列：較小邊距�?5px�?
                horizontalMargin = 15;
            } else if (cols === 5) {
                // 5 列：邊距 = 30px（確�?390px 寬度下有 330px 可用寬度�?
                horizontalMargin = 30;
            } else if (cols === 4) {
                // 4 列：中等邊距�?0px�?
                horizontalMargin = 20;
            } else {
                // 3 列或更少：較大邊距（25px�?
                horizontalMargin = 25;
            }

            const maxFrameWidth = hasImages
                ? (itemCount <= 5 ? 280 : itemCount <= 10 ? 230 : itemCount <= 20 ? 180 : 250)  // 正方形模�?
                : (itemCount <= 5 ? 280 : itemCount <= 10 ? 230 : itemCount <= 20 ? 180 : 250);  // 長方形模�?
            frameWidth = hasImages
                ? Math.min(maxCardHeight, (width - 2 * horizontalMargin) / cols)  // 正方形：frameWidth = cardHeight
                : Math.min(maxFrameWidth, (width - 2 * horizontalMargin) / cols);  // 長方形：frameWidth 可以更寬

            // 🔥 智能預先計算所有中文文字的實際字體大小            const tempCardHeight = Math.min(maxCardHeight, Math.max(20, Math.floor(rowHeight * 0.6)));  // 臨時卡片高度
            chineseFontSizes = currentPagePairs.map(pair => {
                // �?v27.2：計算初始字體大小（改為 × 0.4�?
                let fontSize = Math.max(24, Math.min(48, tempCardHeight * 0.4));

                // �?v27.0：根據文字長度調整字體大小（1-2字相同，3-4字縮小）
                const textLength = pair.answer ? pair.answer.length : 0;
                if (textLength <= 2) {
                    fontSize = fontSize * 1.0;  // 1-2 個字�?00%（保持原大小�?
                } else if (textLength <= 4) {
                    fontSize = fontSize * 0.8;  // 3-4 個字：縮�?20%
                } else if (textLength <= 6) {
                    fontSize = fontSize * 0.7;  // 5-6 個字：縮�?30%
                } else {
                    fontSize = fontSize * 0.6;  // 7+ 個字：縮�?40%
                }
                fontSize = Math.max(18, fontSize);  // 最小字體大�?18px

                // 創建臨時文字對象來測量寬�?
                const tempText = this.add.text(0, 0, pair.answer, {
                    fontSize: `${fontSize}px`,
                    fontFamily: 'Arial',
                    fontStyle: 'bold'
                });

                // 如果文字寬度超過框寬度的 85%，進一步縮小字�?
                const maxTextWidth = (frameWidth - 10) * 0.85;
                while (tempText.width > maxTextWidth && fontSize > 14) {
                    fontSize -= 1;
                    tempText.setFontSize(fontSize);
                }

                // 銷毀臨時文字對象
                tempText.destroy();

                return fontSize;
            });

            // 找出最大的字體大小
            const maxChineseFontSize = Math.max(...chineseFontSizes);
            const minChineseFontSize = Math.min(...chineseFontSizes);
            const avgChineseFontSize = (chineseFontSizes.reduce((a, b) => a + b, 0) / chineseFontSizes.length).toFixed(1);            // 🔥 v19.0：根據列數動態調整中文文字高度和間距
            let dynamicVerticalSpacing;

            // 使用之前計算的基礎�?
            chineseTextHeight = chineseTextHeightBase;
            dynamicVerticalSpacing = verticalSpacingBase;

            // 根據列數調整字體大小限制
            let maxFontSizeLimit;
            if (cols === 5) {
                maxFontSizeLimit = isPortraitCompactMode ? 15 : 12;
            } else if (cols === 4) {
                maxFontSizeLimit = isPortraitCompactMode ? 17 : 14;
            } else if (cols === 3) {
                maxFontSizeLimit = isPortraitCompactMode ? 19 : 16;
            } else {
                maxFontSizeLimit = isPortraitCompactMode ? 21 : 18;
            }

            chineseFontSize = `${Math.min(maxChineseFontSize, maxFontSizeLimit)}px`;            console.log('📐 動態垂直間距:', {
                chineseTextHeight,
                dynamicVerticalSpacing,
                formula: `max(5, ${maxChineseFontSize} * 0.2) = ${dynamicVerticalSpacing}`
            });

            // 🔥 v23.0：添加邊距調試信�?
            // �?v26.0：先計算 dynamicVerticalSpacing，以便在 cardHeightInFrame 計算中使�?
            // 垂直間距 = 可用高度 × 0.03（範�?10-40px�?
            dynamicVerticalSpacing = Math.max(10, Math.min(40, availableHeight * 0.03));

            // 重新計算卡片高度（考慮實際的中文文字高度）
            // 🔥 v10.0：如果有圖片，cardHeightInFrame = frameWidth（正方形）；否則根據可用空間計算
            if (hasImages) {
                // 正方形模式：卡片高度 = 框寬�?
                cardHeightInFrame = frameWidth;            } else {
                // 長方形模式：根據可用空間計算
                cardHeightInFrame = Math.min(maxCardHeight, Math.max(20, Math.floor(rowHeight - chineseTextHeight - dynamicVerticalSpacing)));            }

            // �?v25.0：在 cardHeightInFrame 計算完成後，使用動態計算而不是固定�?
            // �?v29.0：方�?B - 增加預留給中文字的高度（�?× 0.4 改為 × 0.5�?
            // 中文文字高度 = 卡片高度 × 0.5（確保中文字有足夠空間）
            chineseTextHeight = cardHeightInFrame * 0.5;

            // �?v26.0：方�?A - 在英文卡片和中文字之間加�?verticalSpacing
            // 📝 單元總高�?= 英文卡片高度 + verticalSpacing + 中文文字高度 + verticalSpacing
            // �?v27.3：保持原始結構，上下都有 verticalSpacing
            // �?v35.0：取消上面的 verticalSpacing（只保留下面的）
            totalUnitHeight = cardHeightInFrame + chineseTextHeight + dynamicVerticalSpacing;

            // 🔥 v15.0：將 dynamicVerticalSpacing 賦值給 verticalSpacing，以便後續使�?
            verticalSpacing = dynamicVerticalSpacing;            console.log('🔥 緊湊模式智能動態尺寸 [v10.0]:', {
                rows,
                availableHeight,
                rowHeight,
                maxCardHeight,
                cardHeightInFrame,
                maxFrameWidth,
                frameWidth,
                chineseTextHeight,
                dynamicVerticalSpacing,
                totalUnitHeight,
                ratio: (frameWidth / cardHeightInFrame).toFixed(1) + ':1',
                mode: hasImages ? '🟦 正方形模�? : '🟨 長方形模�?
            });
        } else {
            // 🔥 桌面動態響應式佈局（含按鈕空間�?
            // 🔥 第零步：檢測是否有圖�?
            const hasImages = currentPagePairs.some(pair =>
                pair.imageUrl || pair.chineseImageUrl || pair.imageId || pair.chineseImageId
            );

            // 🔥 v8.0 詳細調試：檢查每個卡片的圖片字段
            console.log('🔍 詳細圖片檢測:', {
                totalPairs: currentPagePairs.length,
                hasImages,
                mode: hasImages ? '🟦 正方形模�? : '🟨 長方形模�?,
                pairDetails: currentPagePairs.slice(0, 3).map((pair, idx) => ({
                    index: idx,
                    imageUrl: pair.imageUrl,
                    chineseImageUrl: pair.chineseImageUrl,
                    imageId: pair.imageId,
                    chineseImageId: pair.chineseImageId,
                    hasAnyImage: !!(pair.imageUrl || pair.chineseImageUrl || pair.imageId || pair.chineseImageId)
                }))
            });

            // ============================================================================
            // �?v42.0：iPad 容器大小分類系統 - 根據容器大小動態調整所有參�?
            // ============================================================================

            // 🔥 第一步：iPad 容器大小分類函數
            // �?v42.2：根據寬度和高度的組合分類，而不是只看寬�?
            // 這樣 768×1024 �?1024×768 會被分類為同一個設�?
            function classifyIPadSize(w, h) {
                // 獲取寬度和高度的最小值和最大�?
                const minDim = Math.min(w, h);
                const maxDim = Math.max(w, h);

                // 根據最小尺寸分類設�?
                // iPad mini: 768×1024 �?1024×768 �?minDim = 768
                // iPad: 810×1080 �?1080×810 �?minDim = 810
                // iPad Air: 820×1180 �?1180×820 �?minDim = 820
                // iPad Pro 11": 834×1194 �?1194×834 �?minDim = 834
                // iPad Pro 12.9": 1024×1366 �?1366×1024 �?minDim = 1024

                let deviceSize;
                if (minDim <= 768) {
                    deviceSize = 'small';       // iPad mini: 768
                } else if (minDim <= 810) {
                    deviceSize = 'medium';      // iPad: 810
                } else if (minDim <= 820) {
                    deviceSize = 'medium_large'; // iPad Air: 820
                } else if (minDim <= 834) {
                    deviceSize = 'large';       // iPad Pro 11": 834
                } else {
                    deviceSize = 'xlarge';      // iPad Pro 12.9": 1024
                }

                // 根據方向添加後綴
                const aspectRatio = w / h;
                const isPortrait = aspectRatio < 1;
                const orientation = isPortrait ? '_portrait' : '_landscape';

                return deviceSize + orientation;
            }

            // 🔥 第二步：根據 iPad 大小獲取最優參�?
            // �?v42.2：根據設備對角線長度和方向設置參�?
            function getIPadOptimalParams(iPadSize) {
                const params = {
                    // 豎屏模式（高�?> 寬度�?
                    small_portrait: {
                        sideMargin: 15,
                        topButtonArea: 35,
                        bottomButtonArea: 35,
                        horizontalSpacing: 12,
                        verticalSpacing: 30,
                        chineseFontSize: 22
                    },
                    medium_portrait: {
                        sideMargin: 18,
                        topButtonArea: 38,
                        bottomButtonArea: 38,
                        horizontalSpacing: 14,
                        verticalSpacing: 32,
                        chineseFontSize: 26
                    },
                    medium_large_portrait: {
                        sideMargin: 20,
                        topButtonArea: 40,
                        bottomButtonArea: 40,
                        horizontalSpacing: 15,
                        verticalSpacing: 35,
                        chineseFontSize: 28
                    },
                    large_portrait: {
                        sideMargin: 22,
                        topButtonArea: 42,
                        bottomButtonArea: 42,
                        horizontalSpacing: 16,
                        verticalSpacing: 37,
                        chineseFontSize: 30
                    },
                    xlarge_portrait: {
                        sideMargin: 25,
                        topButtonArea: 45,
                        bottomButtonArea: 45,
                        horizontalSpacing: 18,
                        verticalSpacing: 40,
                        chineseFontSize: 34
                    },
                    // 橫屏模式（寬�?> 高度�?
                    small_landscape: {
                        sideMargin: 12,
                        topButtonArea: 30,
                        bottomButtonArea: 30,
                        horizontalSpacing: 10,
                        verticalSpacing: 25,
                        chineseFontSize: 20
                    },
                    medium_landscape: {
                        sideMargin: 15,
                        topButtonArea: 32,
                        bottomButtonArea: 32,
                        horizontalSpacing: 12,
                        verticalSpacing: 28,
                        chineseFontSize: 24
                    },
                    medium_large_landscape: {
                        sideMargin: 17,
                        topButtonArea: 34,
                        bottomButtonArea: 34,
                        horizontalSpacing: 13,
                        verticalSpacing: 30,
                        chineseFontSize: 26
                    },
                    large_landscape: {
                        sideMargin: 19,
                        topButtonArea: 36,
                        bottomButtonArea: 36,
                        horizontalSpacing: 14,
                        verticalSpacing: 32,
                        chineseFontSize: 28
                    },
                    xlarge_landscape: {
                        sideMargin: 20,
                        topButtonArea: 38,
                        bottomButtonArea: 38,
                        horizontalSpacing: 16,
                        verticalSpacing: 35,
                        chineseFontSize: 32
                    }
                };
                return params[iPadSize];
            }

            // 🔥 第三步：定義按鈕區域和邊距
            // �?Phase 3：使�?GameResponsiveLayout 的配�?
            const margins = config.margins;
            const topButtonAreaHeight = margins.top;
            const bottomButtonAreaHeight = margins.bottom;
            const sideMargin = margins.side;            // 🔥 第四步：計算可用空間（扣除按鈕區域）
            // �?Phase 3：使�?GameResponsiveLayout 的配�?
            const availableWidth = config.availableWidth;
            const availableHeight = config.availableHeight;

            // 🔥 第五步：計算螢幕寬高比和間距
            const aspectRatio = width / height;

            // 🔥 第六步：計算水平和垂直間�?
            // �?Phase 3：使�?GameResponsiveLayout 的配�?
            const gaps = config.gaps;
            const horizontalSpacing = gaps.horizontal;
            const verticalSpacing = gaps.vertical;            if (hasImages) {
                // 🟦 正方形模式（有圖片）                // �?Phase 3：使�?GameResponsiveLayout 的配�?
                // 所有複雜的卡片大小計算已在 GameResponsiveLayout 中完�?
                const cardSize = config.cardSize;  // { width, height }
                const cardWidth = config.cardWidth;
                const cardHeight = config.cardHeight;
                const optimalCols = config.cols;
                const optimalRows = config.rows;

                console.log('📐 [Phase 3] 正方形卡片配�?', {
                    cardSize: `${cardWidth.toFixed(1)}×${cardHeight.toFixed(1)}`,
                    cols: optimalCols,
                    rows: optimalRows,
                    totalCards: itemCount
                });

                // �?Phase 3：使�?GameResponsiveLayout 計算的卡片尺�?
                // 所有複雜的迭代計算已在 GameResponsiveLayout 中完�?
                const squareSize = cardWidth;  // 正方形模式：寬度 = 高度
                cols = optimalCols;
                const rows = optimalRows;

                // 🔥 第十一步：設置卡片尺寸（正方形�?
                frameWidth = squareSize;
                cardHeightInFrame = squareSize;
                chineseTextHeight = squareSize * 0.4;  // 中文文字高度為卡片高度的40%
                totalUnitHeight = cardHeightInFrame + chineseTextHeight + verticalSpacing;  // = squareSize * 1.4 + verticalSpacing

                console.log('🟦 正方形卡片佈局:', {
                    resolution: `${width}×${height}`,
                    aspectRatio: aspectRatio.toFixed(2),
                    topButtonArea: topButtonAreaHeight.toFixed(1),
                    bottomButtonArea: bottomButtonAreaHeight.toFixed(1),
                    sideMargin: sideMargin.toFixed(1),
                    availableWidth: availableWidth.toFixed(1),
                    availableHeight: availableHeight.toFixed(1),
                    cardAreaPercentage: ((availableHeight / height) * 100).toFixed(1) + '%',
                    itemCount,
                    cols,
                    rows,
                    squareSize: squareSize.toFixed(1),
                    frameWidth: frameWidth.toFixed(1),
                    cardHeightInFrame: cardHeightInFrame.toFixed(1),
                    chineseTextHeight: chineseTextHeight.toFixed(1),
                    totalUnitHeight: totalUnitHeight.toFixed(1),
                    cardRatio: '1:1 (正方�?',
                    screenType: aspectRatio > 2.0 ? '超寬螢幕' : aspectRatio > 1.5 ? '寬螢�? : aspectRatio > 1.2 ? '標準螢幕' : '直向螢幕'
                });
            } else {
                // 🟨 長方形模式（無圖片）                // �?Phase 3：使�?GameResponsiveLayout 的配�?
                // 所有複雜的卡片大小計算已在 GameResponsiveLayout 中完�?
                const cardSize = config.cardSize;  // { width, height }
                const cardWidth = config.cardWidth;
                const cardHeight = config.cardHeight;
                const optimalCols = config.cols;
                const optimalRows = config.rows;

                console.log('📐 [Phase 3] 長方形卡片配�?', {
                    cardWidth: cardWidth.toFixed(1),
                    cardHeight: cardHeight.toFixed(1),
                    cols: optimalCols,
                    rows: optimalRows,
                    totalCards: itemCount
                });

                // �?Phase 3：使�?GameResponsiveLayout 計算的卡片尺�?
                cols = optimalCols;
                const rows = optimalRows;

                // 🔥 第十步：設置卡片大小（使�?GameResponsiveLayout 計算的值）
                frameWidth = cardSize;
                cardHeightInFrame = cardSize * 0.5;  // 長方形模式：高度為寬度的 50%
                chineseTextHeight = cardHeightInFrame * 0.4;  // 中文文字高度 = 卡片高度�?40%
                totalUnitHeight = cardHeightInFrame + chineseTextHeight + verticalSpacing;

                console.log('🟨 長方形卡片佈局:', {
                    resolution: `${width}×${height}`,
                    aspectRatio: aspectRatio.toFixed(2),
                    topButtonArea: topButtonAreaHeight.toFixed(1),
                    bottomButtonArea: bottomButtonAreaHeight.toFixed(1),
                    sideMargin: sideMargin.toFixed(1),
                    availableWidth: availableWidth.toFixed(1),
                    availableHeight: availableHeight.toFixed(1),
                    cardAreaPercentage: ((availableHeight / height) * 100).toFixed(1) + '%',
                    itemCount,
                    cols,
                    rows,
                    maxPossibleCols,
                    maxPossibleRows,
                    frameWidth: frameWidth.toFixed(1),
                    cardHeightInFrame: cardHeightInFrame.toFixed(1),
                    chineseTextHeight: chineseTextHeight.toFixed(1),
                    totalUnitHeight: totalUnitHeight.toFixed(1),
                    cardRatio: (frameWidth / cardHeightInFrame).toFixed(2) + ':1',
                    screenType: aspectRatio > 2.0 ? '超寬螢幕' : aspectRatio > 1.5 ? '寬螢�? : aspectRatio > 1.2 ? '標準螢幕' : '直向螢幕'
                });
            }
        }        // 🔥 計算間距和行�?
        const rows = Math.ceil(itemCount / cols);

        // 🔥 v23.0：定義水平邊距，確保卡片不被切割
        // 根據列數動態調整邊距
        let horizontalMargin;
        if (cols === 5) {
            // 5 列：邊距 = 30px（確�?390px 寬度下有 330px 可用寬度�?
            horizontalMargin = 30;
        } else if (cols === 4) {
            // 4 列：中等邊距�?0px�?
            horizontalMargin = 20;
        } else {
            // 3 列或更少：較大邊距（25px�?
            horizontalMargin = 25;
        }

        // 🔥 v23.0：優化水平間距計算，確保卡片不被切割
        // 公式�?可用寬度 - 邊距 - 卡片總寬�? / (列數 + 1)
        // 基於實際可用寬度（width - 2 * horizontalMargin）計�?
        const availableWidth = width - 2 * horizontalMargin;
        const totalCardWidth = frameWidth * cols;
        const availableSpace = availableWidth - totalCardWidth;

        console.log('📐 [v23.0] 寬度計算詳情:', {
            screenWidth: width,
            horizontalMargin,
            availableWidth,
            cols,
            frameWidth,
            totalCardWidth,
            availableSpace,
            note: `iPhone 14 (390px) 應該�?330px 可用寬度`
        });

        let horizontalSpacing;
        if (cols === 5) {
            // 5 列：最小間距（1-3px），確保�?330px 可用寬度上完整顯�?
            horizontalSpacing = Math.max(1, Math.min(3, availableSpace / (cols + 1)));
        } else {
            // 其他列數：使用計算方�?
            horizontalSpacing = Math.max(5, availableSpace / (cols + 1));
        }

        // 🔥 v13.0：緊湊模式的 verticalSpacing 已在前面設置，不需要重新計�?
        // 桌面模式�?verticalSpacing 已在上面�?if/else 分支中定�?
        // 注意：緊湊模式下，verticalSpacing 已經在第 1949 行或 1956 行設置為 dynamicVerticalSpacing
        // 不要在這裡覆蓋它！

        // 🔥 計算頂部偏移，確保佈局垂直居中或從頂部開始（手機版減少10px�?
        // 📝 totalUnitHeight 已經包含 chineseTextHeight �?verticalSpacing，所以不需要重複加
        const totalContentHeight = rows * totalUnitHeight;
        const topOffset = isCompactMode ? 30 : Math.max(10, (height - totalContentHeight) / 2);

        console.log('📐 混合佈局間距:', {
            horizontalSpacing,
            verticalSpacing,
            chineseTextHeight,
            rows,
            totalContentHeight,
            topOffset,
            verticalSpacingFormula: isCompactMode ? `${chineseTextHeight} * 0.2 = ${verticalSpacing.toFixed(1)}` : '0'
        });

        // 🔥 v23.0：添加水平間距調試信�?
        console.log('🔥 [v23.0] 水平間距計算:', {
            cols,
            screenWidth: width,
            horizontalMargin,
            availableWidth,
            frameWidth,
            totalCardWidth,
            availableSpace,
            horizontalSpacing,
            totalWidth: totalCardWidth + horizontalSpacing * (cols + 1),
            formula: cols === 5 ? `max(1, min(3, (${availableWidth} - ${totalCardWidth}) / ${cols + 1})) = ${horizontalSpacing}` : `max(5, (${availableWidth} - ${totalCardWidth}) / ${cols + 1}) = ${horizontalSpacing}`
        });

        // 🔥 第一步：預先計算所有中文文字的實際字體大小（如果尚未計算）
        // 📝 緊湊模式已經在上面計算過，桌面模式需要在這裡計算
        let chineseFontSizesArray;
        if (!isCompactMode) {            // �?v42.0：iPad 使用容器分類的固定文字大�?
            let baseFontSize;
            if (isIPad && iPadSize) {
                // iPad 文字大小根據設備大小分類
                const iPadFontSizes = {
                    small_portrait: 22,
                    medium_portrait: 26,
                    medium_large_portrait: 28,
                    large_portrait: 30,
                    xlarge_portrait: 34,
                    small_landscape: 20,
                    medium_landscape: 24,
                    medium_large_landscape: 26,
                    large_landscape: 28,
                    xlarge_landscape: 32
                };
                baseFontSize = iPadFontSizes[iPadSize] || Math.max(18, Math.min(72, cardHeightInFrame * 0.6));            } else {
                baseFontSize = Math.max(18, Math.min(72, cardHeightInFrame * 0.6));
            }

            chineseFontSizes = currentPagePairs.map(pair => {
                // 🔥 計算初始字體大小
                // �?v42.0：iPad 使用固定值，其他設備基於卡片高度計算
                let fontSize = baseFontSize;

                // 創建臨時文字對象來測量寬�?
                const tempText = this.add.text(0, 0, pair.answer, {
                    fontSize: `${fontSize}px`,
                    fontFamily: 'Arial',
                    fontStyle: 'bold'
                });

                // 如果文字寬度超過框寬度的 85%，縮小字�?
                const maxTextWidth = (frameWidth - 10) * 0.85;
                while (tempText.width > maxTextWidth && fontSize > 18) {
                    fontSize -= 2;
                    tempText.setFontSize(fontSize);
                }

                // 銷毀臨時文字對象
                tempText.destroy();

                return fontSize;
            });

            // 使用最大字體大�?
            const maxChineseFontSize = Math.max(...chineseFontSizes);
            const minChineseFontSize = Math.min(...chineseFontSizes);
            const avgChineseFontSize = (chineseFontSizes.reduce((a, b) => a + b, 0) / chineseFontSizes.length).toFixed(1);            chineseFontSizesArray = chineseFontSizes;
        } else {
            // 緊湊模式使用之前計算的字體大�?
            chineseFontSizesArray = chineseFontSizes;
        }

        // 🔥 第二步：創建中文文字（固定位置，作為"�?的參考）
        const chineseFrames = [];
        currentPagePairs.forEach((pair, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);

            // 🔥 v23.0：修復容器位置計算，考慮邊距
            // �?Phaser 中，容器的位置是基於其左上角，不是中�?
            // 所以我們需要調�?frameX 的計算，使其正確定位容器
            // 公式：邊�?+ 間距 + col * (frameWidth + 間距) + frameWidth / 2
            const frameX = horizontalMargin + horizontalSpacing + col * (frameWidth + horizontalSpacing) + frameWidth / 2;
            // 📝 使用 totalUnitHeight 計算垂直位置（已包含 chineseTextHeight �?verticalSpacing�?
            const frameY = topOffset + row * totalUnitHeight + totalUnitHeight / 2;

            // 🔥 創建中文文字容器（包含白色框�?
            const frameContainer = this.add.container(frameX, frameY);

            // 🔥 白色背景框（與英文卡片同大小�?
            const background = this.add.rectangle(0, 0, frameWidth - 10, cardHeightInFrame, 0xffffff);
            background.setStrokeStyle(2, 0x333333);
            frameContainer.add(background);

            // 🔥 中文文字位置計算（第六步�?
            // �?v26.0：方�?A - 在英文卡片和中文字之間加�?verticalSpacing
            // 新結構：英文卡片 + verticalSpacing + 中文�?+ verticalSpacing
            const chineseActualFontSize = chineseFontSizesArray[i];
            const chineseTextHeightActual = chineseActualFontSize + 5;  // 字體大小 + 行高

            // 中文文字位置：英文卡片下�?+ 中文字高�?2
            // �?v35.0：取消上面的 verticalSpacing，中文字直接貼著英文卡片
            const chineseY = cardHeightInFrame / 2 + chineseTextHeightActual / 2;

            console.log(`📝 創建中文文字 [${i}]: "${pair.answer}", 字體大小: ${chineseActualFontSize}px, 位置Y: ${chineseY.toFixed(1)}`);

            // 🔥 創建最終的中文文字
            const chineseText = this.add.text(0, chineseY, pair.answer, {
                fontSize: `${chineseActualFontSize}px`,  // 使用預先計算的字體大�?
                color: '#000000',
                fontFamily: 'Arial',
                fontStyle: 'bold'
            });
            chineseText.setOrigin(0.5, 0.5);  // �?改進：水平和垂直都居中
            frameContainer.add(chineseText);

            // 保存框的數據
            frameContainer.setData('pairId', pair.id);  // 正確的配�?ID
            frameContainer.setData('text', pair.answer);  // 中文文字
            frameContainer.setData('frameIndex', i);  // 框的索引
            frameContainer.setData('currentCardPairId', null);  // 當前框內的英文卡片的 pairId
            frameContainer.setDepth(0);

            chineseFrames.push(frameContainer);
            this.rightCards.push(frameContainer);
        });

        // 🔥 第二步：創建英文卡片（初始隨機放在框內）
        // 根據隨機模式決定英文卡片的初始位�?
        let shuffledPairs;
        if (this.random === 'same') {
            // 固定隨機模式
            const urlParams = new URLSearchParams(window.location.search);
            const activityId = urlParams.get('activityId') || 'default-seed';
            const seed = activityId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

            const rng = new Phaser.Math.RandomDataGenerator([seed.toString()]);
            shuffledPairs = rng.shuffle([...currentPagePairs]);        } else {
            // 每次不同模式
            shuffledPairs = Phaser.Utils.Array.Shuffle([...currentPagePairs]);        }

        // 創建英文卡片並放在中文文字上�?
        shuffledPairs.forEach((pair, i) => {
            const frame = chineseFrames[i];
            const frameX = frame.x;
            const frameY = frame.y;

            // 🔥 英文卡片位置（在中文文字上方�?
            const cardY = frameY;  // 與中文文字容器同一位置（英文卡片會在上方）

            const animationDelay = i * 100;  // 每個卡片延�?100ms

            // 🔥 檢查英文內容是否為空 - 如果為空，跳過創建英文卡�?
            if (!pair.question || pair.question.trim() === '') {                // 更新框的數據，但不創建卡�?
                frame.setData('currentCardPairId', pair.id);
                return;  // 跳過此項
            }

            // 創建英文卡片（使用與中文文字相同的寬度）
            const card = this.createLeftCard(frameX, cardY, frameWidth - 10, cardHeightInFrame, pair.question, pair.id, animationDelay, pair.imageUrl, pair.audioUrl);

            // 保存卡片當前所在的框的索引
            card.setData('currentFrameIndex', i);

            // 更新框的數據
            frame.setData('currentCardPairId', pair.id);

            this.leftCards.push(card);
        });    }

    createLeftContainerBox(x, y, cardWidth, cardHeight, spacing, count) {
        // 計算外框的尺�?
        const padding = 10;  // 外框與卡片之間的間距
        const boxWidth = cardWidth + padding * 2;
        const boxHeight = (cardHeight * count) + (spacing - cardHeight) * (count - 1) + padding * 2;

        // 計算外框的中心位�?
        const boxCenterY = y + (spacing * (count - 1)) / 2;

        // 創建外框
        const containerBox = this.add.rectangle(x, boxCenterY, boxWidth, boxHeight);
        containerBox.setStrokeStyle(2, 0x333333);  // 黑色邊框
        containerBox.setFillStyle(0xffffff, 0);    // 透明填充
        containerBox.setDepth(0);  // 在卡片下�?
    }

    // 🔥 創建多列外框（智能多列佈局�?
    createMultiColumnContainerBox(startX, startY, cardWidth, cardHeight, horizontalSpacing, verticalSpacing, columns, rows) {
        const padding = 10;  // 外框與卡片之間的間距

        // 計算外框的尺�?
        const boxWidth = columns * cardWidth + (columns - 1) * horizontalSpacing + padding * 2;
        const boxHeight = rows * cardHeight + (rows - 1) * verticalSpacing + padding * 2;

        // 計算外框的中心位�?
        const boxCenterX = startX + (columns * cardWidth + (columns - 1) * horizontalSpacing) / 2;
        const boxCenterY = startY + (rows * cardHeight + (rows - 1) * verticalSpacing) / 2;

        // 創建外框
        const containerBox = this.add.rectangle(boxCenterX, boxCenterY, boxWidth, boxHeight);
        containerBox.setStrokeStyle(2, 0x333333);  // 黑色邊框
        containerBox.setFillStyle(0xffffff, 0);    // 透明填充
        containerBox.setDepth(0);  // 在卡片下�?
    }

    createLeftCard(x, y, width, height, text, pairId, animationDelay = 0, imageUrl = null, audioUrl = null) {
        // 創建卡片容器
        // 🔥 v17.0：修復容器位置計�?
        // �?Phaser 3 中，容器不支�?setOrigin，所以需要調整容器內部元素的位置
        // 容器的位置是基於其子元素的位置，所以我們需要將所有子元素相對於容器中心定�?
        const container = this.add.container(x, y);
        container.setSize(width, height);
        container.setDepth(5);

        // 🔥 設置初始透明度為 0（隱藏）
        container.setAlpha(0);

        // 創建卡片背景（白色）
        const background = this.add.rectangle(0, 0, width, height, 0xffffff);
        background.setStrokeStyle(2, 0x333333);

        // 🔥 聲明變量（在分支外部�?
        let cardText;
        let audioButton;

        // 🔥 檢查內容組合
        const pairData = this.pairs.find(pair => pair.id === pairId);
        const hasImage = imageUrl && imageUrl.trim() !== '';
        const hasText = text && text.trim() !== '' && text.trim() !== '<br>';
        const audioStatus = pairData ? pairData.audioStatus : (audioUrl ? 'available' : 'missing');
        const hasAudio = audioStatus === 'available';
        const safeAudioUrl = hasAudio ? audioUrl : null;

        // 🔥 調試日誌 - 查看實際數據內容        // 🔥 根據內容組合決定佈局
        // 情況 A：圖�?+ 文字 + 語音�?,1,1�?
        // 情況 B：只有語音（0,0,1�?
        // 情況 C：只有文字（0,1,0�?
        // 情況 D：圖�?+ 文字�?,1,0�?
        // 情況 E：語�?+ 文字�?,1,1�?

        if (hasImage && hasText && hasAudio) {
            // 情況 A：圖�?+ 文字 + 語音按鈕
            this.createCardLayoutA(container, background, width, height, text, imageUrl, safeAudioUrl, pairId);
        } else if (!hasImage && !hasText && hasAudio) {
            // 情況 B：只有語音按�?
            this.createCardLayoutB(container, background, width, height, safeAudioUrl, pairId);
        } else if (!hasImage && hasText && !hasAudio) {
            // 情況 C：只有文字（已實現）
            this.createCardLayoutC(container, background, width, height, text);
        } else if (hasImage && hasText && !hasAudio) {
            // 情況 D：圖�?+ 文字（已實現�?
            this.createCardLayoutD(container, background, width, height, text, imageUrl, pairId);
        } else if (!hasImage && hasText && hasAudio) {
            // 情況 E：語�?+ 文字
            this.createCardLayoutE(container, background, width, height, text, safeAudioUrl, pairId);
        } else if (hasImage && !hasText && !hasAudio) {
            // 只有圖片（無文字、無語音�? 1:1 比例顯示
            this.createCardLayoutF(container, background, width, height, imageUrl, pairId);
        } else if (hasImage && !hasText && hasAudio) {
            // 圖片 + 語音（無文字�?
            this.createCardLayoutA(container, background, width, height, '', imageUrl, safeAudioUrl, pairId);
        } else {
            // 其他情況：只顯示背景
            container.add([background]);
        }

        // 🔥 已移�?"No audio" 標示（用戶要求）- 禁用音頻狀態徽章顯�?
        // if (audioStatus && audioStatus !== 'available') {
        //     this.addAudioStatusBadge(container, width, height, audioStatus);
        // }

        // 📝 淡入動畫配置（按照順序出現）
        this.tweens.add({
            targets: container,
            alpha: 1,           // �?0 淡入�?1（完全不透明�?
            duration: 300,      // 動畫持續 300ms�?.3秒）
            delay: animationDelay,  // 延遲時間（用於順序出現效果）
            ease: 'Power2'      // 緩動函數（平滑加速）
        });

        // 設置互動（整個容器可拖曳�?
        container.setInteractive({ useHandCursor: true, draggable: true });

        // 儲存原始位置
        container.setData({
            pairId: pairId,
            side: 'left',
            background: background,
            text: cardText,
            isMatched: false,
            originalX: x,
            originalY: y,
            hasAudio: hasAudio,
            audioStatus: audioStatus,
            invalidAudioUrl: pairData ? pairData.invalidAudioUrl : null,
            isPlaying: false,
            clickStartTime: 0
        });

        // 🔥 點擊卡片播放音頻（短按時�?
        container.on('pointerdown', (pointer) => {
            // 記錄點擊開始時間
            container.setData('clickStartTime', Date.now());        });

        // 🔥 點擊結束時檢查是否是短按（播放音頻）
        container.on('pointerup', (pointer) => {
            const clickDuration = Date.now() - container.getData('clickStartTime');
            const isDragging = this.isDragging;

            // 如果點擊時間短於 200ms 且沒有拖曳，則播放音�?
            if (clickDuration < 200 && !isDragging && hasAudio && safeAudioUrl) {                this.playAudio(safeAudioUrl, container, background);
            }
        });

        // 拖曳開始
        container.on('dragstart', (pointer) => {
            // 📝 調試訊息：記錄拖曳開�?
            console.log('🖱�?開始拖曳卡片:', {
                pairId: container.getData('pairId'),
                side: container.getData('side'),
                position: { x: container.x, y: container.y },
                isMatched: container.getData('isMatched')
            });

            // 允許已配對的卡片也可以拖�?
            this.isDragging = true;
            this.dragStartCard = container;

            // 📝 卡片"飄浮"起來的視覺效�?
            container.setDepth(100);   // 提升到最上層（深度�?00�?
            container.setScale(1.1);   // 稍微放大�?10%�?
            background.setAlpha(0.9);  // 半透明�?0%不透明度）
        });

        // 拖曳�?- 卡片跟隨鼠標
        container.on('drag', (pointer, dragX, dragY) => {
            if (!this.isDragging) {
                // 📝 調試訊息：拖曳狀態異�?
                return;
            }

            // 移動整個卡�?
            container.x = pointer.x;
            container.y = pointer.y;
        });

        // 拖曳結束
        container.on('dragend', (pointer) => {
            // 📝 調試訊息：記錄拖曳結�?
            console.log('🖱�?結束拖曳:', {
                pairId: container.getData('pairId'),
                finalPosition: { x: pointer.x, y: pointer.y },
                layout: this.layout
            });

            this.isDragging = false;

            // 🔥 混合模式：只檢查拖放到中文框
            if (this.layout === 'mixed') {                const dropped = this.checkDrop(pointer, container);                // checkDrop 會處理所有邏輯（交換或返回原位）
            } else {                // 分離模式：檢查是否拖回左側區域（取消配對�?
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
                            // 沒有放到正確位置，返回原�?
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
            }

            this.dragStartCard = null;
        });

        // 啟用拖曳
        this.input.setDraggable(container);

        return container;
    }

    // 🔥 佈局函數 - 情況 A：語音按鈕（�?30%�? 圖片（中 40%�? 文字（下 30%�?
    createCardLayoutA(container, background, width, height, text, imageUrl, audioUrl, pairId) {
        console.log('🎨 佈局 A: 語音按鈕 + 圖片 + 文字', {
            width,
            height,
            pairId,
            hasText: !!text,
            hasAudioUrl: !!audioUrl,
            audioUrl: audioUrl ? audioUrl.substring(0, 50) + '...' : 'null'
        });

        // 🔥 首先添加背景（最底層�?
        container.add([background]);

        // 1️⃣ 語音按鈕區域（上方 30%�?
        const buttonAreaHeight = height * 0.3;
        const buttonAreaY = -height / 2 + buttonAreaHeight / 2;
        const buttonSize = Math.max(20, Math.min(40, buttonAreaHeight * 0.6));  // 🔥 減小按鈕大小，確保在框內        this.createAudioButton(container, audioUrl, 0, buttonAreaY, buttonSize, pairId);        // 2️⃣ 圖片區域（中間 40%�?
        const imageAreaHeight = height * 0.4;
        const imageAreaY = -height / 2 + buttonAreaHeight + imageAreaHeight / 2;
        const squareSize = Math.min(width - 4, imageAreaHeight - 4);
        this.loadAndDisplayImage(container, imageUrl, 0, imageAreaY, squareSize, pairId);

        // 3️⃣ 文字區域（下方 30%，需要留出底部間距）
        const textAreaHeight = height * 0.3;
        const bottomPadding = Math.max(6, height * 0.06);  // 底部間距�?px 或高度的 6%
        const textHeight = textAreaHeight - bottomPadding;
        // 🔥 文字位置：卡片下邊界 - 底部間距 - 文字高度/2
        const textAreaY = height / 2 - bottomPadding - textHeight / 2;

        // 🔥 只有有效文字才創�?
        if (text && text.trim() !== '' && text.trim() !== '<br>') {            this.createTextElement(container, text, 0, textAreaY, width, textHeight);
        } else {        }
    }

    // 🔥 佈局函數 - 情況 B：只有語音按�?
    createCardLayoutB(container, background, width, height, audioUrl, pairId) {
        // 🔥 首先添加背景（最底層�?
        container.add([background]);

        // 語音按鈕置中並放�?
        const buttonSize = Math.max(50, Math.min(80, width * 0.6));
        this.createAudioButton(container, audioUrl, 0, 0, buttonSize, pairId);
    }

    // 🔥 佈局函數 - 情況 C：只有文�?
    createCardLayoutC(container, background, width, height, text) {
        // 🔥 首先添加背景（最底層�?
        container.add([background]);

        // 文字置中
        this.createTextElement(container, text, 0, 0, width, height);
    }

    // 🔥 佈局函數 - 情況 D：圖�?+ 文字（各�?50%，文字有底部間距�?
    createCardLayoutD(container, background, width, height, text, imageUrl, pairId) {
        console.log('🎨 佈局 D: 圖片 + 文字 (�?50%，智能間�?', {
            width,
            height,
            pairId,
            hasText: !!text,
            imageUrl: imageUrl ? imageUrl.substring(0, 50) + '...' : 'null'
        });

        // 🔥 首先添加背景（最底層�?
        container.add([background]);

        // 圖片區域：佔據卡片上方 50%
        const imageHeight = height * 0.5;
        const imageY = -height / 2 + imageHeight / 2;

        // 🔥 文字區域：佔據卡片下方 50%，但需要留出底部間�?
        const textAreaHeight = height * 0.5;
        const bottomPadding = Math.max(8, height * 0.08);  // 底部間距�?px 或高度的 8%
        const textHeight = textAreaHeight - bottomPadding;
        // 🔥 文字位置：卡片下邊界 - 底部間距 - 文字高度/2
        const textY = height / 2 - bottomPadding - textHeight / 2;        // 計算正方形圖片的尺寸�?:1 比例�?
        const squareSize = Math.min(width - 4, imageHeight - 4);

        // 創建圖片
        this.loadAndDisplayImage(container, imageUrl, 0, imageY, squareSize, pairId);

        // 創建文字（如果有�?
        if (text && text.trim() !== '' && text.trim() !== '<br>') {
            this.createTextElement(container, text, 0, textY, width, textHeight);
        }
    }

    // 🔥 佈局函數 - 情況 E：語�?+ 文字（文字有底部間距�?
    createCardLayoutE(container, background, width, height, text, audioUrl, pairId) {
        // 🔥 首先添加背景（最底層�?
        container.add([background]);

        // 語音按鈕在上�?
        const buttonSize = Math.max(30, Math.min(50, width * 0.25));
        const buttonY = -height / 2 + buttonSize / 2 + 10;
        this.createAudioButton(container, audioUrl, 0, buttonY, buttonSize, pairId);

        // 🔥 文字在下方，需要留出底部間�?
        const textAreaHeight = height * 0.4;
        const bottomPadding = Math.max(6, height * 0.06);  // 底部間距�?px 或高度的 6%
        const textHeight = textAreaHeight - bottomPadding;
        // 🔥 文字位置：卡片下邊界 - 底部間距 - 文字高度/2
        const textY = height / 2 - bottomPadding - textHeight / 2;        this.createTextElement(container, text, 0, textY, width, textHeight);
    }

    // 🔥 佈局函數 - 情況 F：只有圖片（1:1 比例�?
    createCardLayoutF(container, background, width, height, imageUrl, pairId) {
        console.log('🎨 佈局 F: 只有圖片 (1:1 比例)', {
            width,
            height,
            pairId,
            imageUrl: imageUrl ? imageUrl.substring(0, 50) + '...' : 'null'
        });

        // 🔥 首先添加背景（最底層�?
        container.add([background]);

        // 計算正方形圖片的尺寸（取寬度和高度的最小值，保持 1:1�?
        const squareSize = Math.min(width - 4, height - 4);

        // 圖片置中顯示
        this.loadAndDisplayImage(container, imageUrl, 0, 0, squareSize, pairId);
    }

    // 🔥 佈局函數 - 圖片 + 語音（無文字�?
    createCardLayoutImageAudio(container, background, width, height, imageUrl, audioUrl, pairId) {
        // 🔥 首先添加背景（最底層�?
        container.add([background]);

        // 圖片佔據大部分區�?
        const imageHeight = height * 0.8;
        const imageY = -height / 2 + imageHeight / 2;

        // 計算正方形圖片的尺寸
        const squareSize = Math.min(width - 4, imageHeight - 4);

        // 創建圖片
        this.loadAndDisplayImage(container, imageUrl, 0, imageY, squareSize, pairId);

        // 創建語音按鈕（下方）
        const buttonSize = Math.max(30, Math.min(50, width * 0.2));
        const buttonY = height / 2 - buttonSize / 2 - 5;
        this.createAudioButton(container, audioUrl, 0, buttonY, buttonSize, pairId);
    }

    // 🔥 輔助函數 - 載入並顯示圖�?
    loadAndDisplayImage(container, imageUrl, x, y, size, pairId) {
        const imageKey = `card-image-${pairId}`;

        if (!this.textures.exists(imageKey)) {
            this.load.image(imageKey, imageUrl);

            this.load.once('complete', () => {
                if (this.textures.exists(imageKey)) {
                    const cardImage = this.add.image(x, y, imageKey);
                    cardImage.setDisplaySize(size, size);
                    cardImage.setOrigin(0.5);
                    container.add(cardImage);
                }
            });

            this.load.once('loaderror', (file) => {
                console.warn(`⚠️ 圖片載入失敗: ${file.key}`, imageUrl);
            });

            this.load.start();
        } else {
            const cardImage = this.add.image(x, y, imageKey);
            cardImage.setDisplaySize(size, size);
            cardImage.setOrigin(0.5);
            container.add(cardImage);
        }
    }

    // 🔥 輔助函數 - 創建文字元素（智能計算寬度和高度�?
    createTextElement(container, text, x, y, width, height) {
        // 🔥 調試日誌 - 確認函數被調�?
        // 🔥 初始字體大小（基於高度的 60%�?
        let fontSize = Math.max(14, Math.min(48, height * 0.6));

        // 創建臨時文字測量寬度和高�?
        const tempText = this.add.text(0, 0, text, {
            fontSize: `${fontSize}px`,
            fontFamily: 'Arial'
        });

        // 🔥 計算最大寬度（�?15% 邊距�?
        const maxTextWidth = width * 0.85;

        // 🔥 計算最大高度（�?10% 邊距�?
        const maxTextHeight = height * 0.9;

        // 🔥 同時檢查寬度和高度，如果超過則縮小字�?
        while ((tempText.width > maxTextWidth || tempText.height > maxTextHeight) && fontSize > 12) {
            fontSize -= 2;
            tempText.setFontSize(fontSize);
        }

        // 🔥 記錄最終的文字尺寸
        const finalTextWidth = tempText.width;
        const finalTextHeight = tempText.height;

        tempText.destroy();

        // 創建最終文�?
        const cardText = this.add.text(x, y, text, {
            fontSize: `${fontSize}px`,
            color: '#333333',
            fontFamily: 'Arial',
            fontStyle: 'normal'
        });
        cardText.setOrigin(0.5);
        container.add(cardText);

        // 🔥 調試日誌 - 確認文字對象創建和尺�?
        console.log('�?文字對象已創建（智能計算�?', {
            text: text,
            fontSize: fontSize,
            textWidth: cardText.width,
            textHeight: cardText.height,
            maxTextWidth: maxTextWidth,
            maxTextHeight: maxTextHeight,
            widthRatio: (finalTextWidth / width * 100).toFixed(1) + '%',
            heightRatio: (finalTextHeight / height * 100).toFixed(1) + '%',
            visible: cardText.visible,
            alpha: cardText.alpha,
            x: cardText.x,
            y: cardText.y
        });

        return cardText;
    }

    // 🔥 輔助函數 - 後台異步生成缺失的音頻（不阻塞遊戲加載）
    generateMissingAudioUrlsInBackground() {        const missingAudioPairs = this.pairs.filter(pair => !pair.audioUrl);

        if (missingAudioPairs.length === 0) {            return;
        }        // 🔥 使用 Promise 在後台執行，不等待結�?
        this.generateMissingAudioUrlsAsync(missingAudioPairs).catch(error => {
            console.error('�?[後台] 生成缺失音頻時出�?', error);
        });
    }

    // 🔥 輔助函數 - 異步生成缺失的音�?
    async generateMissingAudioUrlsAsync(missingAudioPairs) {
        try {
            for (const pair of missingAudioPairs) {
                try {
                    // 調用 TTS API 生成音頻
                    const response = await fetch('/api/tts', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            text: pair.english,
                            language: 'en-US',
                            voice: 'en-US-Neural2-F'  // 女聲
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        pair.audioUrl = data.audioUrl;                    } else {
                        console.warn(`⚠️ [後台] 生成音頻失敗: ${pair.english} (${response.status})`);
                    }
                } catch (error) {
                    console.error(`�?[後台] 生成音頻異常: ${pair.english}`, error);
                }

                // 避免 API 限制，每個請求之間等�?200ms
                await new Promise(resolve => setTimeout(resolve, 200));
            }        } catch (error) {
            console.error('�?[後台] 生成缺失音頻時出�?', error);
        }
    }

    // 🔥 輔助函數 - 創建語音按鈕
    createAudioButton(container, audioUrl, x, y, size, pairId) {        // 🔥 創建按鈕背景（相對於 buttonContainer 的座標為 0, 0�?
        const buttonBg = this.add.rectangle(0, 0, size, size, 0x4CAF50);
        buttonBg.setStrokeStyle(2, 0x2E7D32);
        buttonBg.setOrigin(0.5);

        // 🔥 創建喇叭圖標（相對於 buttonContainer 的座標為 0, 0�?
        const speakerIcon = this.add.text(0, 0, '🔊', {
            fontSize: `${size * 0.6}px`,
            fontFamily: 'Arial'
        });
        speakerIcon.setOrigin(0.5);

        // 🔥 創建按鈕容器（使用相對於父容器的座標 x, y�?
        const buttonContainer = this.add.container(0, 0, [buttonBg, speakerIcon]);
        buttonContainer.setSize(size, size);
        buttonContainer.setInteractive({ useHandCursor: true });

        // 🔥 設置按鈕容器的位置（相對於父容器�?
        buttonContainer.setPosition(x, y);

        // 儲存音頻 URL
        buttonContainer.setData('audioUrl', audioUrl);
        buttonContainer.setData('isPlaying', false);
        buttonContainer.setData('pairId', pairId);

        // 點擊事件
        buttonContainer.on('pointerdown', (pointer, localX, localY, event) => {            // 🔥 阻止事件冒泡，避免觸發卡片拖�?
            event.stopPropagation();
            this.playAudio(audioUrl, buttonContainer, buttonBg);
        });

        // Hover 效果
        buttonContainer.on('pointerover', () => {
            buttonBg.setFillStyle(0x45a049);
        });

        buttonContainer.on('pointerout', () => {
            if (!buttonContainer.getData('isPlaying')) {
                buttonBg.setFillStyle(0x4CAF50);
            }
        });

        // 🔥 添加到父容器
        container.add(buttonContainer);        return buttonContainer;
    }

    // 🔥 輔助函數 - 播放音頻（使�?HTML5 Audio API�?
    playAudio(audioUrl, buttonContainer, buttonBg) {
        if (!audioUrl || audioUrl.trim() === '') {
            console.warn('⚠️ 音頻 URL 為空');
            return;
        }

        // 防止重複點擊
        if (buttonContainer.getData('isPlaying')) {            return;
        }        try {
            // 更新按鈕狀態為載入�?
            buttonContainer.setData('isPlaying', true);
            buttonBg.setFillStyle(0xFFC107);  // 黃色表示載入�?

            // 使用 HTML5 Audio API 直接播放
            const audio = new Audio(audioUrl);
            audio.volume = 0.8;

            // 音頻可以播放�?
            audio.addEventListener('canplay', () => {                buttonBg.setFillStyle(0xFF9800);  // 橙色表示播放�?
                audio.play().catch(error => {
                    console.error('�?音頻播放失敗:', error);
                    buttonContainer.setData('isPlaying', false);
                    buttonBg.setFillStyle(0xF44336);  // 紅色表示錯誤
                });
            });

            // 音頻播放完成
            audio.addEventListener('ended', () => {                buttonContainer.setData('isPlaying', false);
                buttonBg.setFillStyle(0x4CAF50);
            });

            // 音頻載入失敗
            audio.addEventListener('error', (error) => {
                console.error('�?音頻載入失敗:', error);
                buttonContainer.setData('isPlaying', false);
                buttonBg.setFillStyle(0xF44336);  // 紅色表示錯誤
            });

            // 開始載入音頻
            audio.load();

        } catch (error) {
            console.error('�?播放音頻時發生異�?', error);
            buttonContainer.setData('isPlaying', false);
            buttonBg.setFillStyle(0xF44336);  // 紅色表示錯誤
        }
    }

    createRightCard(x, y, width, height, text, pairId, textPosition = 'bottom') {
        // 創建卡片容器
        const container = this.add.container(x, y);
        container.setDepth(5);

        // 🔥 創建白色框（內框�?
        const background = this.add.rectangle(0, 0, width, height, 0xffffff);
        background.setStrokeStyle(2, 0x333333);
        background.setDepth(1);

        // 🔥 創建文字標籤（動態字體大小，根據文字長度和內框寬度調整）
        const textLength = text.length;
        let baseFontSize = Math.max(24, Math.min(48, height * 0.6));

        // 🔥 根據文字長度調整字體大小
        let fontSize;
        if (textLength <= 4) {
            fontSize = baseFontSize * 0.8;  // 1-4 個字：縮�?20%
        } else if (textLength <= 6) {
            fontSize = baseFontSize * 0.7;  // 5-6 個字：縮�?30%
        } else {
            fontSize = baseFontSize * 0.6;  // 7+ 個字：縮�?40%
        }

        fontSize = Math.max(18, fontSize);  // 最小字體大�?18px

        // 🔥 創建臨時文字對象來測量寬度（適應內框寬度�?
        const tempText = this.add.text(0, 0, text, {
            fontSize: `${fontSize}px`,
            fontFamily: 'Arial'
        });

        // 🔥 如果文字寬度超過內框寬度�?85%，縮小字�?
        const maxTextWidth = width * 0.85;  // �?15% 的邊�?
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
            originX = 0;      // 左對�?
            originY = 0.5;    // 垂直居中
        } else if (textPosition === 'left') {
            // 文字在框左邊
            textX = -width / 2 - 15;
            textY = 0;
            originX = 1;      // 右對�?
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

        // 添加到容�?
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
        // 📝 調試訊息：記錄交換檢查開�?
        console.log('🔄 檢查卡片交換:', {
            draggedCardId: draggedCard?.getData('pairId'),
            pointerPosition: { x: pointer.x, y: pointer.y }
        });

        if (!draggedCard) {            return false;
        }

        // 檢查指針是否在其他左側卡片上
        let targetCard = null;

        for (const card of this.leftCards) {
            // 跳過自己和已配對的卡�?
            if (card === draggedCard || card.getData('isMatched')) continue;

            const bounds = card.getBounds();
            if (bounds.contains(pointer.x, pointer.y)) {
                targetCard = card;
                console.log('�?找到目標卡片:', card.getData('pairId'));
                break;
            }
        }

        if (targetCard) {
            console.log('🔄 執行卡片交換:', {
                card1: draggedCard.getData('pairId'),
                card2: targetCard.getData('pairId')
            });
            // 交換兩張卡片的位�?
            this.swapCards(draggedCard, targetCard);
            return true;
        }        return false;
    }

    swapCards(card1, card2) {
        // 獲取兩張卡片的原始位�?
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
        // 📝 調試訊息：記錄拖放檢查開�?
        console.log('🎯 檢查拖放:', {
            draggedCardId: draggedCard?.getData('pairId'),
            layout: this.layout,
            pointerPosition: { x: pointer.x, y: pointer.y }
        });

        if (!draggedCard) {            return false;
        }

        // 🔥 混合模式：檢查是否拖曳到另一個中文框
        if (this.layout === 'mixed') {            return this.checkMixedModeDrop(pointer, draggedCard);
        }

        // 分離模式：檢查指針是否在任何右側卡片�?
        let targetCard = null;

        for (const card of this.rightCards) {
            if (card.getData('isMatched')) continue;  // 跳過已配對的卡片

            const bounds = card.getBounds();
            if (bounds.contains(pointer.x, pointer.y)) {
                targetCard = card;
                console.log('�?找到目標卡片:', card.getData('pairId'));
                break;
            }
        }

        if (targetCard) {
            console.log('🎯 執行配對檢查:', {
                leftCard: draggedCard.getData('pairId'),
                rightCard: targetCard.getData('pairId')
            });
            this.checkMatch(draggedCard, targetCard);
            return true;
        }        return false;
    }

    // 🔥 混合模式：檢查拖放到其他英文卡片（交換位置）
    checkMixedModeDrop(pointer, draggedCard) {
        // 📝 調試訊息：記錄混合模式拖放檢查開�?
        console.log('🔄 混合模式拖放檢查:', {
            draggedCardId: draggedCard.getData('pairId'),
            pointerPosition: { x: pointer.x, y: pointer.y }
        });

        // 找到拖曳到的目標英文卡片
        let targetCard = null;

        for (const card of this.leftCards) {
            if (card === draggedCard) continue;  // 跳過自己

            const bounds = card.getBounds();
            // 📝 擴大檢測範圍，包括卡片下方的中文文字區�?
            // 原因：中文文字在卡片下方，用戶可能拖放到中文文字�?
            // 擴大範圍：高�?+ 50px（中文文字區域的高度�?
            const expandedBounds = new Phaser.Geom.Rectangle(
                bounds.x,
                bounds.y,
                bounds.width,
                bounds.height + 50  // 擴大50px，包括中文文字區�?
            );

            if (expandedBounds.contains(pointer.x, pointer.y)) {
                targetCard = card;
                console.log('�?找到目標卡片（擴展範圍）:', {
                    targetCardId: card.getData('pairId'),
                    bounds: { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height }
                });
                break;
            }
        }

        if (!targetCard) {
            // 沒有拖曳到任何卡片，返回原位
            this.tweens.add({
                targets: draggedCard,
                x: draggedCard.getData('originalX'),
                y: draggedCard.getData('originalY'),
                scaleX: 1,
                scaleY: 1,
                duration: 300,
                ease: 'Back.easeOut',
                onComplete: () => {
                    draggedCard.setDepth(5);
                    draggedCard.getData('background').setAlpha(1);
                }
            });
            return false;
        }

        // 獲取兩個卡片的框索�?
        const targetFrameIndex = targetCard.getData('currentFrameIndex');
        const currentFrameIndex = draggedCard.getData('currentFrameIndex');

        // 交換兩個英文卡片的位置
        this.swapMixedModeCards(draggedCard, targetCard, currentFrameIndex, targetFrameIndex);
        return true;
    }

    // 🔥 混合模式：交換兩個英文卡片的位置
    swapMixedModeCards(card1, card2, frame1Index, frame2Index) {        // 獲取兩個框
        const frame1 = this.rightCards[frame1Index];
        const frame2 = this.rightCards[frame2Index];

        // 獲取兩個卡片的原始位置
        const card1OriginalX = card1.getData('originalX');
        const card1OriginalY = card1.getData('originalY');
        const card2OriginalX = card2.getData('originalX');
        const card2OriginalY = card2.getData('originalY');

        // 更新卡片的框索引
        card1.setData('currentFrameIndex', frame2Index);
        card2.setData('currentFrameIndex', frame1Index);

        // 更新卡片的原始位�?
        card1.setData('originalX', card2OriginalX);
        card1.setData('originalY', card2OriginalY);
        card2.setData('originalX', card1OriginalX);
        card2.setData('originalY', card1OriginalY);

        // 更新框的數據
        frame1.setData('currentCardPairId', card2.getData('pairId'));
        frame2.setData('currentCardPairId', card1.getData('pairId'));

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
                card1.getData('background').setAlpha(1);
            }
        });

        this.tweens.add({
            targets: card2,
            x: card1OriginalX,
            y: card1OriginalY,
            scaleX: 1,
            scaleY: 1,
            duration: 300,
            ease: 'Back.easeOut',
            onComplete: () => {
                card2.setDepth(5);
                card2.getData('background').setAlpha(1);
            }
        });
    }

    checkMatch(leftCard, rightCard) {
        // 🔥 新機制：無論對錯，都讓英文卡片進入中文內框
        // 不立即檢查對錯，等待用戶點擊「提交答案」按�?
        this.onMatchSuccess(leftCard, rightCard);
    }

    onMatchSuccess(leftCard, rightCard) {
        // 標記為已配對
        leftCard.setData('isMatched', true);
        leftCard.setData('matchedWith', rightCard);  // 記錄配對的右側卡�?
        rightCard.setData('isMatched', true);
        rightCard.setData('matchedWith', leftCard);  // 記錄配對的左側卡�?

        // 分離模式：左側卡片移動到右側空白框的位置（完全覆蓋）
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

                // 🔥 檢查是否所有卡片都已配對，如果是則顯示「提交答案」按�?
                this.checkAllCardsMatched();
            }
        });
    }

    unmatchCard(leftCard) {
        // 取消配對狀�?
        const rightCard = leftCard.getData('matchedWith');

        if (rightCard) {
            // 移除配對標記
            leftCard.setData('isMatched', false);
            leftCard.setData('matchedWith', null);
            rightCard.setData('isMatched', false);
            rightCard.setData('matchedWith', null);

            // 從已配對集合中移�?
            this.matchedPairs.delete(leftCard.getData('pairId'));

            // 分離模式：顯示右側空白框（如果之前被隱藏�?
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
        });    }

    // 🔥 檢查是否所有卡片都已配�?
    checkAllCardsMatched() {
        // 📝 調試訊息：記錄配對狀態檢�?
        const matchedCount = this.leftCards.filter(card => card.getData('isMatched')).length;
        const totalCount = this.leftCards.length;
        const allMatched = matchedCount === totalCount;        if (allMatched && !this.submitButton) {            this.showSubmitButton();
        } else if (!allMatched) {        } else if (this.submitButton) {        }
    }

    // 🔥 顯示「提交答案」按�?
    showSubmitButton() {
        const width = this.scale.width;
        const height = this.scale.height;        // 🔥 智能判斷容器大小
        const isSmallContainer = height < 600;
        const isMediumContainer = height >= 600 && height < 800;
        const isLargeContainer = height >= 800;

        // 🔥 按鈕尺寸（根據容器大小調整）
        let buttonWidth, buttonHeight, fontSize;

        if (isSmallContainer) {
            // 小容器：更小的按�?
            buttonWidth = Math.max(80, Math.min(120, width * 0.12));
            buttonHeight = Math.max(30, Math.min(40, height * 0.06));
            fontSize = Math.max(14, Math.min(18, width * 0.015));
        } else if (isMediumContainer) {
            // 中等容器：中等按�?
            buttonWidth = Math.max(100, Math.min(150, width * 0.15));
            buttonHeight = Math.max(35, Math.min(50, height * 0.07));
            fontSize = Math.max(16, Math.min(22, width * 0.02));
        } else {
            // 大容器：稍大的按�?
            buttonWidth = Math.max(120, Math.min(180, width * 0.12));
            buttonHeight = Math.max(40, Math.min(55, height * 0.06));
            fontSize = Math.max(18, Math.min(24, width * 0.02));
        }

        // 🔥 按鈕位置（最底下中央，留出更多空間）
        const buttonX = width / 2;
        const buttonY = height - buttonHeight / 2 - 5;  // 距離底部 5px        // 創建按鈕背景
        const buttonBg = this.add.rectangle(buttonX, buttonY, buttonWidth, buttonHeight, 0x4caf50);
        buttonBg.setStrokeStyle(2, 0x388e3c);
        buttonBg.setInteractive({ useHandCursor: true });
        buttonBg.setDepth(3000);  // 🔥 提高深度確保在最上層
        buttonBg.setScrollFactor(0);  // 🔥 固定在螢幕上，不隨相機移�?

        // 創建按鈕文字
        const buttonText = this.add.text(buttonX, buttonY, '提交答案', {
            fontSize: `${fontSize}px`,
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        buttonText.setOrigin(0.5);
        buttonText.setDepth(3001);  // 🔥 提高深度確保在最上層
        buttonText.setScrollFactor(0);  // 🔥 固定在螢幕上，不隨相機移�?
        // 按鈕點擊事件
        buttonBg.on('pointerdown', () => {            this.checkAllMatches();
        });

        // 按鈕懸停效果
        buttonBg.on('pointerover', () => {
            buttonBg.setFillStyle(0x66bb6a);        });

        buttonBg.on('pointerout', () => {
            buttonBg.setFillStyle(0x4caf50);
        });

        // 保存按鈕引用
        this.submitButton = { bg: buttonBg, text: buttonText };
    }

    // 🔥 檢查所有配對結�?
    checkAllMatches() {
        let correctCount = 0;
        let incorrectCount = 0;
        let unmatchedCount = 0;

        // 🔥 獲取當前頁的詞彙數據
        const startIndex = this.currentPage * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.pairs.length);
        const currentPagePairs = this.pairs.slice(startIndex, endIndex);

        // 🔥 清空當前頁面的答案記�?
        this.currentPageAnswers = [];

        // 檢查每個左側卡片的配對
        this.leftCards.forEach(leftCard => {
            const leftPairId = leftCard.getData('pairId');
            const rightCard = leftCard.getData('matchedWith');
            const correctPair = currentPagePairs.find(pair => pair.id === leftPairId);

            if (rightCard) {
                const rightPairId = rightCard.getData('pairId');
                const isCorrect = leftPairId === rightPairId;

                // 🔥 獲取用戶回答的英文（�?pairs 數據中獲取，而不是從卡片對象�?
                const userAnswerPair = currentPagePairs.find(pair => pair.id === rightPairId);

                // 🔥 記錄用戶答案
                this.currentPageAnswers.push({
                    page: this.currentPage,
                    leftText: correctPair.chinese,  // 🔥 使用 pair.chinese 而不�?getData('text')
                    rightText: userAnswerPair ? userAnswerPair.english : '(未知)',  // 🔥 使用 pair.english
                    correctAnswer: correctPair.english,
                    correctChinese: correctPair.chinese,
                    isCorrect: isCorrect,
                    leftPairId: leftPairId,
                    rightPairId: rightPairId
                });

                if (isCorrect) {
                    // 配對正確
                    correctCount++;                    // 🔥 顯示正確的英文單字，內框呈白色，標記勾勾
                    this.showCorrectAnswer(rightCard, correctPair.english);
                } else {
                    // 配對錯誤
                    incorrectCount++;                    // 🔥 顯示正確的英文單字，內框呈灰色，標記 X
                    this.showIncorrectAnswer(rightCard, correctPair.english);
                }
            } else {
                // 未配�?
                unmatchedCount++;                // 🔥 記錄未配對的答案
                this.currentPageAnswers.push({
                    page: this.currentPage,
                    leftText: correctPair.chinese,  // 🔥 使用 pair.chinese
                    rightText: null,
                    correctAnswer: correctPair.english,
                    correctChinese: correctPair.chinese,
                    isCorrect: false,
                    leftPairId: leftPairId,
                    rightPairId: null
                });
            }
        });

        // 🔥 將當前頁面的答案添加到所有答案記錄中
        this.allPagesAnswers.push(...this.currentPageAnswers);        // 🔥 檢查是否所有頁面都已完�?
        const isLastPage = this.currentPage === this.totalPages - 1;
        if (isLastPage) {
            // 遊戲結束
            this.gameEndTime = Date.now();
            this.totalGameTime = (this.gameEndTime - this.gameStartTime) / 1000; // �?
            this.gameState = 'completed';            // 顯示遊戲結束模態�?
            this.showGameCompleteModal();
        } else {
            // 顯示當前頁面的總�?
            this.showMatchSummary(correctCount, incorrectCount, unmatchedCount);
        }
    }

    // 🔥 顯示正確答案（白色內�?+ 勾勾�?
    showCorrectAnswer(rightCard, correctAnswer) {
        const background = rightCard.getData('background');
        const textObj = rightCard.getData('text');  // 🔥 修正：使�?'text' 而非 'textObj'

        // 內框呈白�?
        background.setFillStyle(0xffffff);
        background.setStrokeStyle(2, 0x000000);

        // 更新文字為正確答�?
        if (textObj) {
            textObj.setText(correctAnswer);
        }

        // 添加勾勾標記
        const checkMark = this.add.text(
            rightCard.x + background.width / 2 - 15,
            rightCard.y - background.height / 2 + 5,
            '�?,
            {
                fontSize: '24px',
                color: '#4caf50',
                fontFamily: 'Arial',
                fontStyle: 'bold'
            }
        );
        checkMark.setOrigin(0.5).setDepth(15);
        rightCard.add(checkMark);
    }

    // 🔥 顯示錯誤答案（灰色內�?+ X�?
    showIncorrectAnswer(rightCard, correctAnswer) {
        const background = rightCard.getData('background');
        const textObj = rightCard.getData('text');  // 🔥 修正：使�?'text' 而非 'textObj'

        // 內框呈灰�?
        background.setFillStyle(0xcccccc);
        background.setStrokeStyle(2, 0x000000);

        // 更新文字為正確答�?
        if (textObj) {
            textObj.setText(correctAnswer);
        }

        // 添加 X 標記
        const xMark = this.add.text(
            rightCard.x + background.width / 2 - 15,
            rightCard.y - background.height / 2 + 5,
            '�?,
            {
                fontSize: '24px',
                color: '#f44336',
                fontFamily: 'Arial',
                fontStyle: 'bold'
            }
        );
        xMark.setOrigin(0.5).setDepth(15);
        rightCard.add(xMark);
    }

    // 🔥 顯示配對總結
    showMatchSummary(correctCount, incorrectCount, unmatchedCount = 0) {
        const width = this.scale.width;
        const height = this.scale.height;

        // 移除提交按鈕
        if (this.submitButton) {
            this.submitButton.bg.destroy();
            this.submitButton.text.destroy();
            this.submitButton = null;
        }

        // 總結文字尺寸（響應式�?
        const fontSize = Math.max(24, Math.min(36, width * 0.03));

        // 顯示總結
        const totalCount = this.leftCards.length;
        let summaryMessage = `配對結果\n正確�?{correctCount} / ${totalCount}\n錯誤�?{incorrectCount} / ${totalCount}`;

        if (unmatchedCount > 0) {
            summaryMessage += `\n未配對：${unmatchedCount} / ${totalCount}`;
        }

        const summaryText = this.add.text(
            width / 2,
            height / 2 - 50,
            summaryMessage,
            {
                fontSize: `${fontSize}px`,
                color: correctCount === totalCount && unmatchedCount === 0 ? '#4caf50' : '#ff9800',
                fontFamily: 'Arial',
                fontStyle: 'bold',
                align: 'center',
                backgroundColor: correctCount === totalCount && unmatchedCount === 0 ? '#e8f5e9' : '#fff3e0',
                padding: { x: 25, y: 15 }
            }
        );
        summaryText.setOrigin(0.5).setDepth(2000);

        // 如果全部正確且沒有未配對，顯示完成動�?
        if (correctCount === totalCount && unmatchedCount === 0) {
            this.tweens.add({
                targets: summaryText,
                scaleX: 1.1,
                scaleY: 1.1,
                duration: 500,
                yoyo: true,
                repeat: 2,
                ease: 'Sine.easeInOut',
                onComplete: () => {
                    // 檢查是否有下一�?
                    this.time.delayedCall(1000, () => {
                        this.onGameComplete();
                    });
                }
            });
        } else {
            // 顯示「重試」按�?
            this.time.delayedCall(2000, () => {
                this.showRetryButton();
            });
        }
    }

    // 🔥 顯示「重試」按�?
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

        buttonBg.on('pointerdown', () => {            this.resetCurrentPage();
        });

        buttonBg.on('pointerover', () => {
            buttonBg.setFillStyle(0xffb74d);
        });

        buttonBg.on('pointerout', () => {
            buttonBg.setFillStyle(0xff9800);
        });
    }

    // 🔥 重置當前�?
    resetCurrentPage() {
        // 清除所有卡�?
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

        // 重新創建當前�?
        this.createCards();
    }

    onGameComplete() {
        // 🔥 檢查是否還有下一�?
        if (this.enablePagination && this.currentPage < this.totalPages - 1) {
            // 還有下一�?
            if (this.autoProceed) {
                // 自動進入下一�?
                this.time.delayedCall(500, () => {
                    this.goToNextPage();
                });
            } else {
                // 顯示「下一頁」按�?
                this.showNextPageButton();
            }
        } else {
            // 所有頁面都完成了，顯示最終完成訊�?
            this.showFinalCompletion();
        }
    }

    // 🔥 顯示最終完成訊�?
    showFinalCompletion() {
        // 停止計時�?
        if (this.timerEvent) {
            this.timerEvent.remove();
        }

        // 獲取當前螢幕尺寸
        const width = this.scale.width;
        const height = this.scale.height;

        // 顯示完成訊息（響應式�?
        const fontSize = Math.max(28, Math.min(48, width * 0.035));
        const completeText = this.add.text(width / 2, height / 2 - 50, '🎉 全部完成�?, {
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

        // 🔥 如果開啟顯示答案，顯示答案按�?
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

        // 清除所有現有元�?
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

        // 創建滾動區�?
        const startY = 100;
        const lineHeight = 40;
        const maxVisibleLines = Math.floor((height - 150) / lineHeight);

        // 顯示所有配�?
        this.pairs.forEach((pair, index) => {
            const y = startY + index * lineHeight;

            // 只顯示可見範圍內的答�?
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

        // 如果答案太多，顯示提�?
        if (this.pairs.length > maxVisibleLines) {
            this.add.text(
                width / 2,
                height - 50,
                `（顯示前 ${maxVisibleLines} 個答案，�?${this.pairs.length} 個）`,
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
            '�?關閉',
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

    // 🔥 創建分頁指示�?
    createPageIndicator() {
        const width = this.scale.width;
        const height = this.scale.height;

        // 分頁指示器文字（例如�?/5�?
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
        this.pageIndicatorText.setDepth(100);  // 確保在最上層    }

    // 🔥 更新分頁指示�?
    updatePageIndicator() {
        if (this.pageIndicatorText) {
            const pageText = `${this.currentPage + 1}/${this.totalPages}`;
            this.pageIndicatorText.setText(pageText);        }
    }

    // 🔥 進入下一�?
    goToNextPage() {
        if (this.currentPage < this.totalPages - 1) {
            this.currentPage++;            // 重新佈局（會重新創建卡片�?
            this.updateLayout();
        }
    }

    // 🔥 顯示「下一頁」按�?
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
        const buttonText = this.add.text(buttonX, buttonY, '➡️ 下一�?, {
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

            // 進入下一�?
            this.goToNextPage();
        });

        // 懸停效果
        buttonBg.on('pointerover', () => {
            buttonBg.setFillStyle(0x45a049);
        });

        buttonBg.on('pointerout', () => {
            buttonBg.setFillStyle(0x4caf50);
        });    }

    // 🔥 檢查當前頁是否全部配對完�?
    checkCurrentPageComplete() {
        // 計算當前頁應該有多少個配�?
        const startIndex = this.currentPage * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.pairs.length);
        const currentPagePairsCount = endIndex - startIndex;

        // 計算當前頁已配對的數�?
        let currentPageMatchedCount = 0;
        for (let i = startIndex; i < endIndex; i++) {
            const pairId = this.pairs[i].id;
            if (this.matchedPairs.has(pairId)) {
                currentPageMatchedCount++;
            }
        }        // 如果當前頁全部配對完�?
        if (currentPageMatchedCount === currentPagePairsCount) {
            this.time.delayedCall(800, () => {
                this.onGameComplete();
            });
        }
    }

    // �?移除 createRestartButton() 方法：用戶要求拿掉重新開始按�?

    // 🔥 顯示遊戲結束模態�?
    showGameCompleteModal() {
        const width = this.scale.width;
        const height = this.scale.height;

        // 計算總分�?
        const totalCorrect = this.allPagesAnswers.filter(answer => answer.isCorrect).length;
        const totalQuestions = this.pairs.length;

        // 格式化時�?
        const timeText = this.formatGameTime(this.totalGameTime);        // 創建半透明背景（遮罩）
        const overlay = this.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            0x000000,
            0.7
        );
        overlay.setDepth(5000);
        overlay.setScrollFactor(0);

        // 創建模態框容�?
        const modalWidth = Math.min(500, width * 0.8);
        const modalHeight = Math.min(400, height * 0.7);
        const modal = this.add.container(width / 2, height / 2);
        modal.setDepth(5001);
        modal.setScrollFactor(0);

        // 模態框背�?
        const modalBg = this.add.rectangle(0, 0, modalWidth, modalHeight, 0x2c2c2c);
        modalBg.setStrokeStyle(4, 0x000000);
        modal.add(modalBg);

        // 標題：GAME COMPLETE
        const title = this.add.text(0, -modalHeight / 2 + 40, 'GAME COMPLETE', {
            fontSize: '36px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        modal.add(title);

        // 分數標籤
        const scoreLabel = this.add.text(-80, -modalHeight / 2 + 100, 'Score', {
            fontSize: '20px',
            color: '#4a9eff',
            fontFamily: 'Arial'
        });
        scoreLabel.setOrigin(0.5);
        modal.add(scoreLabel);

        // 分數�?
        const scoreValue = this.add.text(-80, -modalHeight / 2 + 140, `${totalCorrect}/${totalQuestions}`, {
            fontSize: '32px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        scoreValue.setOrigin(0.5);
        modal.add(scoreValue);

        // 時間標籤（如果有計時器）
        if (this.timerType !== 'none') {
            const timeLabel = this.add.text(80, -modalHeight / 2 + 100, 'Time', {
                fontSize: '20px',
                color: '#4a9eff',
                fontFamily: 'Arial'
            });
            timeLabel.setOrigin(0.5);
            modal.add(timeLabel);

            // 時間�?
            const timeValue = this.add.text(80, -modalHeight / 2 + 140, timeText, {
                fontSize: '32px',
                color: '#ffffff',
                fontFamily: 'Arial',
                fontStyle: 'bold'
            });
            timeValue.setOrigin(0.5);
            modal.add(timeValue);
        }

        // 🔥 排名提示（動態顯示，位置調整到按鈕上方）
        const rankText = this.add.text(0, 0, 'Loading ranking...', {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: 'Arial'
        });
        rankText.setOrigin(0.5);
        modal.add(rankText);

        // 🔥 異步獲取排名並更新文�?
        this.fetchUserRanking(totalCorrect, totalQuestions, this.totalGameTime).then(ranking => {
            if (ranking && ranking.rank) {
                const rankSuffix = this.getRankSuffix(ranking.rank);
                rankText.setText(`YOU'RE ${ranking.rank}${rankSuffix} ON THE LEADERBOARD`);
            } else {
                rankText.setText('');  // 如果無法獲取排名，隱藏文�?
            }
        });

        // 按鈕區域（調整位置，為排名提示留出空間�?
        const buttonY = modalHeight / 2 - 100;
        const buttonSpacing = 60;

        // 🔥 調整排名提示位置到第一個按鈕上�?
        rankText.y = buttonY - buttonSpacing - 40;

        // Leaderboard 按鈕
        this.createModalButton(modal, 0, buttonY - buttonSpacing, 'Leaderboard', () => {            this.showEnterNamePage();
        });

        // Show answers 按鈕
        this.createModalButton(modal, 0, buttonY, 'Show answers', () => {            this.showMyAnswersPage();
        });

        // Start again 按鈕
        this.createModalButton(modal, 0, buttonY + buttonSpacing, 'Start again', () => {            this.restartGame();
        });

        // 保存模態框引用（用於後續關閉�?
        this.gameCompleteModal = { overlay, modal };
    }

    // 🔥 創建模態框按�?
    createModalButton(container, x, y, text, callback) {
        const buttonWidth = 300;
        const buttonHeight = 45;

        // 按鈕背景
        const buttonBg = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x3c3c3c);
        buttonBg.setStrokeStyle(2, 0x000000);
        buttonBg.setInteractive({ useHandCursor: true });
        container.add(buttonBg);

        // 按鈕文字
        const buttonText = this.add.text(x, y, text, {
            fontSize: '22px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        buttonText.setOrigin(0.5);
        container.add(buttonText);

        // 點擊事件
        buttonBg.on('pointerdown', callback);

        // 懸停效果
        buttonBg.on('pointerover', () => {
            buttonBg.setFillStyle(0x4c4c4c);
        });

        buttonBg.on('pointerout', () => {
            buttonBg.setFillStyle(0x3c3c3c);
        });

        return { buttonBg, buttonText };
    }

    // 🔥 獲取用戶排名（異步）
    async fetchUserRanking(correctCount, totalCount, timeSpent) {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const activityId = urlParams.get('activityId');

            if (!activityId) {                return null;
            }

            // 計算分數和準確率
            const score = Math.round((correctCount / totalCount) * 100);
            const accuracy = Math.round((correctCount / totalCount) * 100);

            // 獲取排行榜數�?
            const response = await fetch(`/api/leaderboard?activityId=${activityId}&limit=100`);
            if (!response.ok) {                return null;
            }

            const data = await response.json();
            const leaderboard = data.leaderboard || [];

            // 計算當前用戶的排�?
            // 排序規則：分數優先（降序），時間次之（升序）
            const userScore = score;
            const userTime = timeSpent;

            let rank = 1;
            for (const entry of leaderboard) {
                if (entry.score > userScore) {
                    rank++;
                } else if (entry.score === userScore && entry.timeSpent < userTime) {
                    rank++;
                }
            }            return { rank, score, accuracy, timeSpent };
        } catch (error) {
            console.error('�?獲取排名失敗:', error);
            return null;
        }
    }

    // 🔥 獲取排名後綴�?st, 2nd, 3rd, 4th, ...�?
    getRankSuffix(rank) {
        if (rank % 100 >= 11 && rank % 100 <= 13) {
            return 'TH';
        }
        switch (rank % 10) {
            case 1: return 'ST';
            case 2: return 'ND';
            case 3: return 'RD';
            default: return 'TH';
        }
    }

    // 🔥 格式化遊戲時�?
    formatGameTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const decimal = Math.floor((seconds % 1) * 10);

        if (mins > 0) {
            return `${mins}:${secs.toString().padStart(2, '0')}.${decimal}`;
        } else {
            return `${secs}.${decimal}s`;
        }
    }

    // 🔥 重新開始遊戲
    restartGame() {        // 關閉模態�?
        if (this.gameCompleteModal) {
            this.gameCompleteModal.overlay.destroy();
            this.gameCompleteModal.modal.destroy();
            this.gameCompleteModal = null;
        }

        // 重置遊戲狀�?
        this.gameState = 'playing';
        this.gameStartTime = null;
        this.gameEndTime = null;
        this.totalGameTime = 0;
        this.allPagesAnswers = [];
        this.currentPageAnswers = [];
        this.currentPage = 0;
        this.matchedPairs.clear();

        // 重新載入遊戲
        this.scene.restart();
    }

    // 🔥 顯示 My Answers 頁面
    showMyAnswersPage() {        // 隱藏遊戲結束模態�?
        if (this.gameCompleteModal) {
            this.gameCompleteModal.overlay.setVisible(false);
            this.gameCompleteModal.modal.setVisible(false);
        }

        const width = this.scale.width;
        const height = this.scale.height;

        // 創建半透明背景（遮罩）
        const overlay = this.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            0x000000,
            0.7
        );
        overlay.setDepth(6000);
        overlay.setScrollFactor(0);

        // 創建答案頁面容器
        const pageWidth = Math.min(800, width * 0.9);
        const pageHeight = Math.min(600, height * 0.9);
        const page = this.add.container(width / 2, height / 2);
        page.setDepth(6001);
        page.setScrollFactor(0);

        // 頁面背景
        const pageBg = this.add.rectangle(0, 0, pageWidth, pageHeight, 0xffffff);
        pageBg.setStrokeStyle(4, 0x000000);
        page.add(pageBg);

        // 標題：My Answers
        const title = this.add.text(0, -pageHeight / 2 + 40, 'My Answers', {
            fontSize: '32px',
            color: '#000000',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        page.add(title);

        // 顯示答案列表
        const answerStartY = -pageHeight / 2 + 100;
        const answerSpacing = 80;
        const maxAnswersPerPage = Math.floor((pageHeight - 200) / answerSpacing);

        // 獲取所有答案（包含所有頁面）
        const allAnswers = this.allPagesAnswers;        // 顯示答案（最多顯�?maxAnswersPerPage 個）
        const answersToShow = allAnswers.slice(0, maxAnswersPerPage);
        const cardWidth = 300;  // 🔥 �?createAnswerCard 中的 cardWidth 一�?
        const cardX = -pageWidth / 2 + cardWidth / 2 + 30;  // 🔥 左邊�?30px
        answersToShow.forEach((answer, index) => {
            const y = answerStartY + index * answerSpacing;
            this.createAnswerCard(page, cardX, y, answer, 'myAnswer');
        });

        // 底部按鈕區�?
        const buttonY = pageHeight / 2 - 60;

        // Correct Answers 按鈕
        this.createAnswerPageButton(page, -150, buttonY, 'Correct Answers', () => {            this.hideMyAnswersPage();
            this.showCorrectAnswersPage();
        });

        // Back 按鈕
        this.createAnswerPageButton(page, 150, buttonY, 'Back', () => {            this.hideMyAnswersPage();
        });

        // 保存頁面引用
        this.myAnswersPage = { overlay, page };
    }

    // 🔥 隱藏 My Answers 頁面
    hideMyAnswersPage() {
        if (this.myAnswersPage) {
            this.myAnswersPage.overlay.destroy();
            this.myAnswersPage.page.destroy();
            this.myAnswersPage = null;
        }

        // 顯示遊戲結束模態�?
        if (this.gameCompleteModal) {
            this.gameCompleteModal.overlay.setVisible(true);
            this.gameCompleteModal.modal.setVisible(true);
        }
    }

    // 🔥 顯示 Correct Answers 頁面
    showCorrectAnswersPage() {        const width = this.scale.width;
        const height = this.scale.height;

        // 創建半透明背景（遮罩）
        const overlay = this.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            0x000000,
            0.7
        );
        overlay.setDepth(6000);
        overlay.setScrollFactor(0);

        // 創建答案頁面容器
        const pageWidth = Math.min(800, width * 0.9);
        const pageHeight = Math.min(600, height * 0.9);
        const page = this.add.container(width / 2, height / 2);
        page.setDepth(6001);
        page.setScrollFactor(0);

        // 頁面背景
        const pageBg = this.add.rectangle(0, 0, pageWidth, pageHeight, 0xffffff);
        pageBg.setStrokeStyle(4, 0x000000);
        page.add(pageBg);

        // 標題：Correct Answers
        const title = this.add.text(0, -pageHeight / 2 + 40, 'Correct Answers', {
            fontSize: '32px',
            color: '#000000',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        page.add(title);

        // 顯示答案列表
        const answerStartY = -pageHeight / 2 + 100;
        const answerSpacing = 80;
        const maxAnswersPerPage = Math.floor((pageHeight - 200) / answerSpacing);

        // 獲取所有答案（包含所有頁面）
        const allAnswers = this.allPagesAnswers;

        // 顯示答案（最多顯�?maxAnswersPerPage 個）
        const answersToShow = allAnswers.slice(0, maxAnswersPerPage);
        const cardWidth = 300;  // 🔥 �?createAnswerCard 中的 cardWidth 一�?
        const cardX = -pageWidth / 2 + cardWidth / 2 + 30;  // 🔥 左邊�?30px
        answersToShow.forEach((answer, index) => {
            const y = answerStartY + index * answerSpacing;
            this.createAnswerCard(page, cardX, y, answer, 'correctAnswer');
        });

        // 底部按鈕區�?
        const buttonY = pageHeight / 2 - 60;

        // My Answers 按鈕
        this.createAnswerPageButton(page, -150, buttonY, 'My Answers', () => {            this.hideCorrectAnswersPage();
            this.showMyAnswersPage();
        });

        // Back 按鈕
        this.createAnswerPageButton(page, 150, buttonY, 'Back', () => {            this.hideCorrectAnswersPage();
        });

        // 保存頁面引用
        this.correctAnswersPage = { overlay, page };
    }

    // 🔥 隱藏 Correct Answers 頁面
    hideCorrectAnswersPage() {
        if (this.correctAnswersPage) {
            this.correctAnswersPage.overlay.destroy();
            this.correctAnswersPage.page.destroy();
            this.correctAnswersPage = null;
        }

        // 顯示遊戲結束模態�?
        if (this.gameCompleteModal) {
            this.gameCompleteModal.overlay.setVisible(true);
            this.gameCompleteModal.modal.setVisible(true);
        }
    }

    // 🔥 創建答案卡片
    createAnswerCard(container, x, y, answer, type) {
        const cardWidth = 300;  // 🔥 減小卡片寬度以適應容�?
        const cardHeight = 60;
        const chineseX = x + cardWidth / 2 + 20;  // 🔥 中文在卡片右�?20px

        // 根據類型決定顯示內容
        let displayText, bgColor, markColor, markText;

        if (type === 'myAnswer') {
            // My Answers 頁面：顯示用戶的答案
            displayText = answer.rightText || '(未配�?';
            if (answer.isCorrect) {
                bgColor = this.getCardColor(answer.leftPairId); // 彩色背景
                markColor = '#4caf50';
                markText = '�?;
            } else {
                bgColor = 0xcccccc; // 灰色背景
                markColor = '#f44336';
                markText = '�?;
            }
        } else {
            // Correct Answers 頁面：顯示正確答�?
            displayText = answer.correctAnswer;
            bgColor = this.getCardColor(answer.leftPairId); // 彩色背景
            markColor = '#4caf50';
            markText = '�?;
        }

        // 創建卡片背景
        const cardBg = this.add.rectangle(x, y, cardWidth, cardHeight, bgColor);
        cardBg.setStrokeStyle(2, 0x000000);
        container.add(cardBg);

        // 創建卡片文字
        const cardText = this.add.text(x, y, displayText, {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        cardText.setOrigin(0.5);
        container.add(cardText);

        // 創建標記（勾勾或 X�?
        const mark = this.add.text(x + cardWidth / 2 - 20, y - cardHeight / 2 + 10, markText, {
            fontSize: '24px',
            color: markColor,
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        mark.setOrigin(0.5);
        container.add(mark);

        // 創建中文文字（顯示用戶選擇的中文�?
        const chineseText = this.add.text(chineseX, y, answer.leftText, {
            fontSize: '28px',
            color: '#000000',
            fontFamily: 'Arial',
            fontStyle: 'normal'
        });
        chineseText.setOrigin(0, 0.5);
        container.add(chineseText);
    }

    // 🔥 獲取卡片顏色（根�?pairId�?
    getCardColor(pairId) {
        const colors = [
            0x4a9eff, // 藍色
            0xff4a4a, // 紅色
            0xffa500, // 橙色
            0x4caf50, // 綠色
            0x9c27b0, // 紫色
            0xffeb3b, // 黃色
            0x00bcd4, // 青色
            0xff9800  // 深橙�?
        ];
        return colors[(pairId - 1) % colors.length];
    }

    // 🔥 創建答案頁面按鈕
    createAnswerPageButton(container, x, y, text, callback) {
        const buttonWidth = 250;
        const buttonHeight = 45;

        // 按鈕背景
        const buttonBg = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0xffffff);
        buttonBg.setStrokeStyle(2, 0x000000);
        buttonBg.setInteractive({ useHandCursor: true });
        container.add(buttonBg);

        // 按鈕文字
        const buttonText = this.add.text(x, y, text, {
            fontSize: '20px',
            color: '#000000',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        buttonText.setOrigin(0.5);
        container.add(buttonText);

        // 點擊事件
        buttonBg.on('pointerdown', callback);

        // 懸停效果
        buttonBg.on('pointerover', () => {
            buttonBg.setFillStyle(0xf0f0f0);
        });

        buttonBg.on('pointerout', () => {
            buttonBg.setFillStyle(0xffffff);
        });

        return { buttonBg, buttonText };
    }

    // 🔥 顯示輸入名稱頁面
    showEnterNamePage() {        // 隱藏遊戲結束模態�?
        if (this.gameCompleteModal) {
            this.gameCompleteModal.overlay.setVisible(false);
            this.gameCompleteModal.modal.setVisible(false);
        }

        const width = this.scale.width;
        const height = this.scale.height;

        // 創建半透明背景（遮罩）
        const overlay = this.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            0x000000,
            0.7
        );
        overlay.setDepth(7000);
        overlay.setScrollFactor(0);

        // 創建輸入名稱頁面容器
        const pageWidth = Math.min(600, width * 0.9);
        const pageHeight = Math.min(500, height * 0.8);
        const page = this.add.container(width / 2, height / 2);
        page.setDepth(7001);
        page.setScrollFactor(0);

        // 頁面背景
        const pageBg = this.add.rectangle(0, 0, pageWidth, pageHeight, 0x2c2c2c);
        pageBg.setStrokeStyle(4, 0x000000);
        page.add(pageBg);

        // 標題：ENTER YOUR NAME
        const title = this.add.text(0, -pageHeight / 2 + 40, 'ENTER YOUR NAME', {
            fontSize: '24px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        page.add(title);

        // 副標題：You're 1st on the leaderboard
        const subtitle = this.add.text(0, -pageHeight / 2 + 80, "You're 1st on the leaderboard", {
            fontSize: '16px',
            color: '#cccccc',
            fontFamily: 'Arial'
        });
        subtitle.setOrigin(0.5);
        page.add(subtitle);

        // 輸入�?
        const inputWidth = pageWidth * 0.8;
        const inputHeight = 50;
        const inputY = -pageHeight / 2 + 130;

        const inputBg = this.add.rectangle(0, inputY, inputWidth, inputHeight, 0xffffff);
        inputBg.setStrokeStyle(2, 0x000000);
        page.add(inputBg);

        // 輸入文字
        this.playerName = '';
        const inputText = this.add.text(0, inputY, '', {
            fontSize: '24px',
            color: '#000000',
            fontFamily: 'Arial'
        });
        inputText.setOrigin(0.5);
        page.add(inputText);

        // 創建虛擬鍵盤
        const keyboardY = -pageHeight / 2 + 220;
        this.createVirtualKeyboard(page, 0, keyboardY, inputText);

        // 底部按鈕區�?
        const buttonY = pageHeight / 2 - 60;

        // Skip 按鈕
        this.createModalButton(page, -120, buttonY, 'Skip', () => {            this.hideEnterNamePage();
        });

        // Enter 按鈕
        this.createModalButton(page, 120, buttonY, 'Enter', () => {            this.submitPlayerName();
        });

        // 保存頁面引用
        this.enterNamePage = { overlay, page, inputText };
    }

    // 🔥 隱藏輸入名稱頁面
    hideEnterNamePage() {
        if (this.enterNamePage) {
            this.enterNamePage.overlay.destroy();
            this.enterNamePage.page.destroy();
            this.enterNamePage = null;
        }

        // 顯示遊戲結束模態�?
        if (this.gameCompleteModal) {
            this.gameCompleteModal.overlay.setVisible(true);
            this.gameCompleteModal.modal.setVisible(true);
        }
    }

    // 🔥 創建虛擬鍵盤
    createVirtualKeyboard(container, x, y, inputText) {
        const keys = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['�?, 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '�?]
        ];

        const keyWidth = 40;
        const keyHeight = 40;
        const keySpacing = 5;

        keys.forEach((row, rowIndex) => {
            const rowWidth = row.length * (keyWidth + keySpacing) - keySpacing;
            const startX = x - rowWidth / 2 + keyWidth / 2;
            const keyY = y + rowIndex * (keyHeight + keySpacing);

            row.forEach((key, colIndex) => {
                const keyX = startX + colIndex * (keyWidth + keySpacing);
                this.createKeyButton(container, keyX, keyY, key, keyWidth, keyHeight, inputText);
            });
        });

        // 空格�?
        const spaceY = y + 3 * (keyHeight + keySpacing);
        this.createKeyButton(container, x, spaceY, 'Space', 200, keyHeight, inputText);

        // 123 按鈕（切換到數字鍵盤�?
        this.createKeyButton(container, x - 120, spaceY, '123', 80, keyHeight, inputText);
    }

    // 🔥 創建鍵盤按鈕
    createKeyButton(container, x, y, key, width, height, inputText) {
        // 按鈕背景
        const buttonBg = this.add.rectangle(x, y, width, height, 0x4c4c4c);
        buttonBg.setStrokeStyle(2, 0x000000);
        buttonBg.setInteractive({ useHandCursor: true });
        container.add(buttonBg);

        // 按鈕文字
        const buttonText = this.add.text(x, y, key, {
            fontSize: '18px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        buttonText.setOrigin(0.5);
        container.add(buttonText);

        // 點擊事件
        buttonBg.on('pointerdown', () => {
            this.handleKeyPress(key, inputText);
        });

        // 懸停效果
        buttonBg.on('pointerover', () => {
            buttonBg.setFillStyle(0x5c5c5c);
        });

        buttonBg.on('pointerout', () => {
            buttonBg.setFillStyle(0x4c4c4c);
        });
    }

    // 🔥 處理按鍵輸入
    handleKeyPress(key, inputText) {
        if (key === '�?) {
            // 刪除最後一個字�?
            this.playerName = this.playerName.slice(0, -1);
        } else if (key === '�?) {
            // 切換大小寫（暫時不實現）        } else if (key === 'Space') {
            // 添加空格
            this.playerName += ' ';
        } else if (key === '123') {
            // 切換到數字鍵盤（暫時不實現）        } else {
            // 添加字符
            if (this.playerName.length < 20) {
                this.playerName += key;
            }
        }

        // 更新輸入文字
        inputText.setText(this.playerName);    }

    // 🔥 提交玩家名稱
    async submitPlayerName() {
        if (!this.playerName || this.playerName.trim() === '') {            this.hideEnterNamePage();
            return;
        }        // 計算總分�?
        const totalCorrect = this.allPagesAnswers.filter(answer => answer.isCorrect).length;
        const totalQuestions = this.pairs.length;

        // 獲取 activityId
        const urlParams = new URLSearchParams(window.location.search);
        const activityId = urlParams.get('activityId');

        // 準備排行榜數據（匹配 API 格式�?
        const leaderboardData = {
            activityId: activityId,
            playerName: this.playerName.trim(),
            score: totalCorrect,
            correctCount: totalCorrect,
            totalCount: totalQuestions,
            accuracy: (totalCorrect / totalQuestions) * 100,
            timeSpent: this.totalGameTime,
            gameData: {
                allPagesAnswers: this.allPagesAnswers,
                timestamp: new Date().toISOString()
            }
        };        try {
            // 發送到 API
            const response = await fetch('/api/leaderboard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(leaderboardData)
            });

            if (response.ok) {
                const result = await response.json();                // 隱藏輸入名稱頁面
                this.hideEnterNamePage();

                // 顯示排行�?
                this.showLeaderboard();
            } else {
                console.error('�?保存排行榜數據失�?', response.status);
                this.hideEnterNamePage();
            }
        } catch (error) {
            console.error('�?保存排行榜數據錯�?', error);
            this.hideEnterNamePage();
        }
    }

    // 🔥 顯示排行�?
    async showLeaderboard() {        const width = this.scale.width;
        const height = this.scale.height;

        // 獲取 activityId
        const urlParams = new URLSearchParams(window.location.search);
        const activityId = urlParams.get('activityId');

        // 創建半透明背景（遮罩）
        const overlay = this.add.rectangle(
            width / 2,
            height / 2,
            width,
            height,
            0x000000,
            0.7
        );
        overlay.setDepth(8000);
        overlay.setScrollFactor(0);

        // 創建排行榜頁面容�?
        const pageWidth = Math.min(600, width * 0.9);
        const pageHeight = Math.min(700, height * 0.9);
        const page = this.add.container(width / 2, height / 2);
        page.setDepth(8001);
        page.setScrollFactor(0);

        // 頁面背景
        const pageBg = this.add.rectangle(0, 0, pageWidth, pageHeight, 0x2c2c2c);
        pageBg.setStrokeStyle(4, 0x000000);
        page.add(pageBg);

        // 標題：LEADERBOARD
        const title = this.add.text(0, -pageHeight / 2 + 40, 'LEADERBOARD', {
            fontSize: '32px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        page.add(title);

        // 載入排行榜數�?
        try {
            const response = await fetch(`/api/leaderboard?activityId=${activityId}&limit=10`);
            if (response.ok) {
                const result = await response.json();
                const leaderboardData = result.data || [];                // 顯示排行榜列�?
                const startY = -pageHeight / 2 + 100;
                const rowHeight = 50;

                leaderboardData.slice(0, 10).forEach((entry, index) => {
                    const y = startY + index * rowHeight;
                    const rank = index + 1;
                    const isCurrentPlayer = entry.playerName === this.playerName;

                    // 排名
                    const rankText = this.add.text(-pageWidth / 2 + 50, y, `${rank}.`, {
                        fontSize: '20px',
                        color: isCurrentPlayer ? '#ffeb3b' : '#ffffff',
                        fontFamily: 'Arial',
                        fontStyle: 'bold'
                    });
                    rankText.setOrigin(0, 0.5);
                    page.add(rankText);

                    // 玩家名稱
                    const nameText = this.add.text(-pageWidth / 2 + 100, y, entry.playerName, {
                        fontSize: '20px',
                        color: isCurrentPlayer ? '#ffeb3b' : '#ffffff',
                        fontFamily: 'Arial'
                    });
                    nameText.setOrigin(0, 0.5);
                    page.add(nameText);

                    // 分數
                    const scoreText = this.add.text(pageWidth / 2 - 150, y, `${entry.score}/${entry.totalCount}`, {
                        fontSize: '20px',
                        color: isCurrentPlayer ? '#ffeb3b' : '#ffffff',
                        fontFamily: 'Arial'
                    });
                    scoreText.setOrigin(1, 0.5);
                    page.add(scoreText);

                    // 時間
                    const timeText = this.add.text(pageWidth / 2 - 50, y, this.formatGameTime(entry.timeSpent), {
                        fontSize: '20px',
                        color: isCurrentPlayer ? '#ffeb3b' : '#ffffff',
                        fontFamily: 'Arial'
                    });
                    timeText.setOrigin(1, 0.5);
                    page.add(timeText);
                });
            } else {
                console.error('�?獲取排行榜數據失�?', response.status);
            }
        } catch (error) {
            console.error('�?獲取排行榜數據錯�?', error);
        }

        // 底部按鈕
        const buttonY = pageHeight / 2 - 60;
        this.createModalButton(page, 0, buttonY, 'Back', () => {            this.hideLeaderboard();
        });

        // 保存頁面引用
        this.leaderboardPage = { overlay, page };
    }

    // 🔥 隱藏排行�?
    hideLeaderboard() {
        if (this.leaderboardPage) {
            this.leaderboardPage.overlay.destroy();
            this.leaderboardPage.page.destroy();
            this.leaderboardPage = null;
        }

        // 顯示遊戲結束模態�?
        if (this.gameCompleteModal) {
            this.gameCompleteModal.overlay.setVisible(true);
            this.gameCompleteModal.modal.setVisible(true);
        }
    }

    // 🔥 P1-4: 修正事件監聽器管�?- shutdown 方法
    shutdown() {        // 移除 resize 事件監聽�?
        if (this.scale) {
            this.scale.off('resize', this.handleResize, this);        }

        // 移除 fullscreen 事件監聽器（如果存在�?
        if (document) {
            document.removeEventListener('fullscreenchange', this.handleFullscreenChange);        }

        // 移除 orientation 事件監聽器（如果存在�?
        if (window) {
            window.removeEventListener('orientationchange', this.handleOrientationChange);        }

        // 停止計時�?
        if (this.timerEvent) {
            this.timerEvent.remove();
            this.timerEvent = null;        }

        // 清理遊戲狀�?
        this.sceneStopped = true;    }

    // 🔥 P1-4: 全螢幕變化事件處�?
    handleFullscreenChange() {        // 重新計算佈局
        this.updateLayout();
    }

    // 🔥 P1-4: 設備方向變化事件處理
    handleOrientationChange() {
        const isPortrait = window.matchMedia('(orientation: portrait)').matches;        // 重新計算佈局
        this.updateLayout();
    }
}


