// ============================================
// 響應式設計配置
// ============================================
// 注意：RESPONSIVE_BREAKPOINTS, DESIGN_TOKENS, GameResponsiveLayout 等
// 已在 index.html 中作為全局腳本加載，無需 import

// 🔥 v45.1 版本標記 - 強制 Vercel 重新部署
const GAME_VERSION = 'v45.1-ipad-fix';

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

        // 🔥 遊戲結束狀態管理
        this.gameState = 'playing';  // 遊戲狀態：playing, completed
        this.gameStartTime = null;   // 遊戲開始時間
        this.gameEndTime = null;     // 遊戲結束時間
        this.totalGameTime = 0;      // 總遊戲時間（秒）
        this.allPagesAnswers = [];   // 所有頁面的用戶答案記錄
        this.currentPageAnswers = []; // 當前頁面的用戶答案記錄

        // Audio diagnostics and dev helpers
        this.audioDiagnostics = null;
        this.devLayoutDefault = null;
        this.restartData = {};
    }

    init(data = {}) {
        this.restartData = data || {};

        if (this.restartData.devLayoutTest) {
            console.log('🧪 GameScene: 接收到開發測試參數', this.restartData.devLayoutTest);
        } else {
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
        window.matchUpAudioDiagnostics = this.audioDiagnostics;

        console.log('🧪 GameScene: 已載入開發測試詞彙資料', {
            defaultLayout: this.devLayoutDefault,
            totalPairs: this.pairs.length,
            audioDiagnostics: this.audioDiagnostics
        });

        return true;
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
        });

        console.log('🎧 音訊診斷結果', diagnostics);

        if (diagnostics.missing || diagnostics.invalid) {
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

    // 從 API 載入詞彙數據
    async loadVocabularyFromAPI() {
        // 📝 調試訊息：記錄函數開始
        console.log('🔄 開始載入詞彙數據');
        console.log('🔍 [DEBUG] loadVocabularyFromAPI 函數已調用');

        try {
            // 從 URL 參數獲取 activityId
            const urlParams = new URLSearchParams(window.location.search);
            const activityId = urlParams.get('activityId');
            const customVocabulary = urlParams.get('customVocabulary');
            const devLayoutTest = (this.restartData && this.restartData.devLayoutTest) || urlParams.get('devLayoutTest');

            console.log('🔍 [DEBUG] URL 參數:', {
                activityId,
                customVocabulary,
                devLayoutTest,
                fullURL: window.location.href
            });

            if (devLayoutTest) {
                console.warn('🧪 GameScene: 啟用開發測試資料集，跳過 API 載入', { devLayoutTest });
                return this.loadDevLayoutTestData(devLayoutTest, urlParams);
            }

            console.log('🔍 Match-up 遊戲 - URL 參數:', {
                activityId,
                customVocabulary,
                fullURL: window.location.href
            });

            // 🔥 修復：必須提供 activityId，不使用默認數據
            if (!activityId) {
                const error = new Error('❌ 缺少 activityId 參數，無法載入詞彙數據');
                console.error('❌ 參數驗證失敗:', error.message);
                throw error;
            }

            // 🔥 修復：如果沒有 customVocabulary 參數，默認為 true（允許公開訪問）
            if (customVocabulary !== 'true' && customVocabulary !== null) {
                const error = new Error('❌ customVocabulary 參數無效');
                console.error('❌ 參數驗證失敗:', error.message);
                throw error;
            }

            console.log('✅ 參數驗證通過，允許載入詞彙數據');
            console.log('🔍 [DEBUG] 準備發送 API 請求');

            // 從 API 載入詞彙數據
            const apiUrl = `/api/activities/${activityId}`;
            console.log(`🔄 發送 API 請求: ${apiUrl}`);
            console.log('🔍 [DEBUG] 開始 fetch 調用');

            const response = await fetch(apiUrl);

            console.log('🔍 [DEBUG] fetch 完成');
            console.log('📡 API 響應狀態:', {
                status: response.status,
                statusText: response.statusText,
                ok: response.ok,
                headers: {
                    contentType: response.headers.get('content-type')
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                const error = new Error(`API 請求失敗: ${response.status} ${response.statusText}`);
                console.error('❌ API 請求失敗:', {
                    status: response.status,
                    statusText: response.statusText,
                    url: apiUrl,
                    errorBody: errorText
                });
                throw error;
            }

            const activity = await response.json();
            console.log('🔍 [DEBUG] JSON 解析完成');
            console.log('✅ 活動數據載入成功:', {
                id: activity.id,
                title: activity.title,
                hasVocabularyItems: !!activity.vocabularyItems,
                vocabularyItemsCount: activity.vocabularyItems?.length || 0,
                hasElements: !!activity.elements,
                elementsCount: activity.elements?.length || 0,
                hasContent: !!activity.content
            });

            // 提取詞彙數據（支持多種數據源）
            console.log('🔍 檢查詞彙數據來源...');
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
            } else {
                console.error('❌ 無法找到詞彙數據:', {
                    hasVocabularyItems: !!activity.vocabularyItems,
                    hasElements: !!activity.elements,
                    hasContent: !!activity.content
                });
            }

            // 轉換為遊戲所需的格式
            if (vocabularyData.length > 0) {
                console.log('🔄 開始轉換詞彙數據格式...');

                // 🔥 v9.0 詳細調試：檢查原始數據結構
                const firstItem = vocabularyData[0] || {};
                const hasImageUrl = !!firstItem.imageUrl;
                const hasChineseImageUrl = !!firstItem.chineseImageUrl;
                console.log(`🔍 [v9.0] 原始詞彙數據結構檢查 - 總項目: ${vocabularyData.length}, hasImageUrl: ${hasImageUrl}, hasChineseImageUrl: ${hasChineseImageUrl}, imageUrl: ${firstItem.imageUrl || 'null'}, chineseImageUrl: ${firstItem.chineseImageUrl || 'null'}`);

                this.pairs = vocabularyData.map((item, index) => ({
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

                console.log('✅ 詞彙數據轉換完成:', {
                    totalPairs: this.pairs.length,
                    firstPair: this.pairs[0],
                    hasImages: this.pairs.some(p => p.imageUrl || p.chineseImageUrl || p.imageId || p.chineseImageId),
                    hasAudio: this.pairs.some(p => p.audioUrl)
                });

                // 🔥 調試日誌 - 詳細檢查每個詞彙項目的english字段
                console.log('🔍 詳細詞彙數據檢查:');
                this.pairs.forEach((pair, index) => {
                    console.log(`詞彙 ${index + 1}:`, {
                        id: pair.id,
                        english: pair.english,
                        englishType: typeof pair.english,
                        englishLength: pair.english ? pair.english.length : 'null/undefined',
                        chinese: pair.chinese,
                        chineseType: typeof pair.chinese,
                        hasImage: !!pair.imageUrl,
                        hasAudio: !!pair.audioUrl
                    });
                });

                return true;
            } else {
                // 🔥 修復：不使用默認數據，拋出錯誤
                const error = new Error('❌ 活動中沒有詞彙數據，請先添加詞彙');
                console.error('❌ 詞彙數據為空:', {
                    activityId: activity.id,
                    activityTitle: activity.title
                });
                throw error;
            }
        } catch (error) {
            console.error('❌ 載入詞彙數據失敗:', {
                message: error.message,
                stack: error.stack,
                url: window.location.href
            });
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
        this.gameCompleteModal = null;  // 🔥 遊戲完成模態框
        this.pageCompleteModal = null;  // 🔥 [v94.0] 頁面完成模態框

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

        // 🔥 v1.0 新增：初始化響應式管理器
        this.responsiveManager = new ResponsiveManager(this, {
            debounceMs: 300,
            throttleMs: 100,
            enableLogging: true
        });
        ResponsiveLogger.log('info', 'GameScene', '響應式管理器初始化完成', {
            debounceMs: 300,
            throttleMs: 100
        });

        // 🔥 v54.0: 改進的 resize 事件 - 保存已配對狀態和洗牌順序，重新創建卡片但保持詞彙數據和卡片順序
        // 監聽螢幕尺寸變化 - 重新創建卡片但保持已配對狀態和卡片順序
        this.resizeTimeout = null;
        this.shuffledPairsCache = null;  // 🔥 v54.0: 緩存洗牌後的順序
        this.scale.on('resize', (gameSize) => {
            // 🔥 v54.0: 使用防抖延遲，保存已配對狀態和洗牌順序後重新創建卡片
            console.log('🔥 [v54.0] resize 事件觸發:', { width: gameSize.width, height: gameSize.height });

            // 清除之前的超時
            if (this.resizeTimeout) {
                clearTimeout(this.resizeTimeout);
            }

            // 設置新的超時，300ms 後才執行重新佈局
            this.resizeTimeout = setTimeout(() => {
                console.log('🔥 [v54.0] 防抖延遲後執行 updateLayout（保存已配對狀態和洗牌順序）');

                // 🔥 v54.0: 保存已配對的卡片信息
                const savedMatchedPairs = new Set(this.matchedPairs);
                console.log('🔥 [v54.0] 已保存已配對卡片:', Array.from(savedMatchedPairs));

                // 🔥 v54.0: 注意：不清除 shuffledPairsCache，這樣 resize 時會使用相同的洗牌順序
                console.log('🔥 [v54.0] 使用緩存的洗牌順序（如果存在）');

                // 執行重新佈局
                this.updateLayout();

                // 🔥 v54.0: 恢復已配對的卡片狀態
                this.matchedPairs = savedMatchedPairs;
                console.log('🔥 [v54.0] 已恢復已配對卡片狀態');

                // 🔥 v54.0: 重新應用已配對卡片的視覺效果
                this.restoreMatchedPairsVisuals();
            }, 300);
        }, this);
        console.log('✅ 已綁定 resize 事件監聽器（v54.0 防抖延遲 300ms，保存已配對狀態和洗牌順序）');

        // 監聽全螢幕變化
        document.addEventListener('fullscreenchange', this.handleFullscreenChange.bind(this));
        console.log('✅ 已綁定 fullscreenchange 事件監聽器');

        // 監聽設備方向變化
        window.addEventListener('orientationchange', this.handleOrientationChange.bind(this));
        console.log('✅ 已綁定 orientationchange 事件監聽器');

        console.log('🎮 GameScene: create 方法完成');
    }

    // 🔥 v6.0 計算每頁能容納的最大卡片數
    calculateMaxCardsPerPage(width, height, layout = 'mixed') {
        // 🔥 檢測設備類型和模式
        const isMobileDevice = width < 768;
        const isLandscapeMobile = width > height && height < 500;
        const isTinyHeight = height < 400;
        const isCompactMode = isMobileDevice || isLandscapeMobile || isTinyHeight;

        // 根據佈局模式決定列數
        let cols;
        if (layout === 'mixed') {
            cols = isCompactMode ? 5 : 3;  // 混合模式：緊湊 5 列，正常 3 列
        } else {
            // 分離模式：根據寬度動態決定
            const sideMargin = 20;
            const availableWidth = width - sideMargin * 2;
            cols = Math.max(1, Math.floor(availableWidth / 150));  // 假設最小卡片寬度 150px
        }

        // 計算可用高度
        const topButtonArea = isCompactMode ? 50 : 60;
        const bottomButtonArea = isCompactMode ? 50 : 60;
        const availableHeight = height - topButtonArea - bottomButtonArea;

        // 計算卡片尺寸和行數
        const verticalSpacing = Math.max(5, Math.min(20, availableHeight * 0.02));
        const cardHeight = 67;  // 混合模式卡片高度
        const chineseTextHeight = 30;  // 🔥 [v79.0] 中文文字高度增加 50%（20 → 30）
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

        // 確保每頁至少有 1 個卡片
        const itemsPerPage = Math.max(1, maxCardsPerPage);

        // 計算總頁數
        const totalPages = Math.ceil(totalPairs / itemsPerPage);

        // 決定是否啟用分頁
        const enablePagination = totalPages > 1;

        console.log('📄 分頁計算結果:', {
            totalPairs,
            maxCardsPerPage,
            itemsPerPage,
            totalPages,
            enablePagination
        });

        return {
            itemsPerPage,
            totalPages,
            enablePagination,
            maxCardsPerPage
        };
    }

    // 🔥 初始化分頁設置（v6.0 更新：使用動態計算）
    initializePagination() {
        const totalPairs = this.pairs.length;
        console.log('📄 初始化分頁設置 - 總詞彙數:', totalPairs);

        // 從 URL 參數讀取設置
        const urlParams = new URLSearchParams(window.location.search);
        const itemsPerPageParam = urlParams.get('itemsPerPage');
        const autoProceedParam = urlParams.get('autoProceed');

        // 讀取每頁顯示數量
        if (itemsPerPageParam) {
            // 🔥 如果 URL 指定了 itemsPerPage，直接使用
            this.itemsPerPage = parseInt(itemsPerPageParam, 10);
            console.log('📄 從 URL 讀取 itemsPerPage:', this.itemsPerPage);
        } else {
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

            this.itemsPerPage = paginationResult.itemsPerPage;
            console.log('📄 根據佈局計算 itemsPerPage:', this.itemsPerPage);
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

        // 🔥 v10.1 詳細調試：檢查 URL 參數
        console.log('🔍 [v10.1] URL 參數詳細檢查:', {
            fullUrl: window.location.href,
            search: window.location.search,
            allParams: Array.from(urlParams.entries()),
            layoutParam: urlParams.get('layout'),
            randomParam: urlParams.get('random'),
            showAnswersParam: urlParams.get('showAnswers'),
            audioEnabledParam: urlParams.get('audioEnabled'),
            audioVolumeParam: urlParams.get('audioVolume')
        });

        // 讀取佈局選項
        const layoutParam = urlParams.get('layout');
        this.layout = layoutParam || this.devLayoutDefault || 'separated';
        console.log('🎮 佈局模式:', this.layout, {
            source: layoutParam ? 'url' : this.devLayoutDefault ? 'dev-default' : 'fallback',
            layoutParam,
            devLayoutDefault: this.devLayoutDefault
        });

        // 讀取隨機選項
        this.random = urlParams.get('random') || 'different';
        console.log('🎲 隨機模式:', this.random);

        // 讀取顯示答案選項
        this.showAnswers = urlParams.get('showAnswers') === 'true';
        console.log('📝 顯示答案:', this.showAnswers);

        // ✅ v44.0：讀取聲音選項
        this.audioEnabled = urlParams.get('audioEnabled') === 'true';
        this.audioVolume = parseInt(urlParams.get('audioVolume') || '70', 10);
        this.audioAutoPlay = urlParams.get('audioAutoPlay') === 'true';

        console.log('🔊 [v44.0] 聲音選項:', {
            enabled: this.audioEnabled,
            volume: this.audioVolume,
            autoPlay: this.audioAutoPlay
        });
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

        // 🔥 計時器放在中間頂部（水平對齐，與分頁指示器並排）
        this.timerText = this.add.text(width / 2 - 80, 20, initialText, {
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
        const startIndex = this.currentPage * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.pairs.length);
        const totalCount = endIndex - startIndex;
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

        try {
            // 清除所有現有元素
            console.log('🎮 GameScene: 清除所有現有元素');
            this.children.removeAll(true);

            // 🔥 [v97.0] 清除提交按鈕引用，確保下一頁會重新創建按鈕
            this.submitButton = null;
            console.log('🎮 GameScene: 已清除提交按鈕引用');

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

            // 🔥 記錄遊戲開始時間
            if (!this.gameStartTime) {
                this.gameStartTime = Date.now();
                console.log('🎮 GameScene: 遊戲開始時間已記錄');
            }

            // 🔥 創建計時器 UI
            this.createTimerUI();

            // 🔥 顯示「提交答案」按鈕（遊戲開始時就顯示）
            this.showSubmitButton();

            // 🔥 移除重新開始按鈕：用戶要求拿掉
            console.log('🎮 GameScene: updateLayout 完成');
        } catch (error) {
            console.error('❌ GameScene: updateLayout 失敗', error);
            console.error('❌ 錯誤堆棧:', error.stack);

            // 顯示錯誤信息
            const width = this.scale.width;
            const height = this.scale.height;

            this.add.text(width / 2, height / 2 - 50, '❌ 佈局更新失敗', {
                fontSize: '28px',
                color: '#ff0000',
                fontFamily: 'Arial',
                fontStyle: 'bold'
            }).setOrigin(0.5);

            this.add.text(width / 2, height / 2 + 20, error.message, {
                fontSize: '16px',
                color: '#666666',
                fontFamily: 'Arial',
                align: 'center',
                wordWrap: { width: width - 100 }
            }).setOrigin(0.5);
        }
    }

    handleResize(gameSize) {
        console.log('🎮 GameScene: handleResize 觸發', gameSize);
        // 螢幕尺寸改變時重新佈局
        this.updateLayout();
    }

    // 🔥 v53.0: 恢復已配對卡片的視覺效果
    // 🔥 [v104.0] 修復：重新調整勾勾和叉叉的位置（當卡片大小改變時）
    restoreMatchedPairsVisuals() {
        try {
            console.log('🔥 [v53.0] 恢復已配對卡片視覺效果');

            if (!this.matchedPairs || this.matchedPairs.size === 0) {
                console.log('ℹ️ [v53.0] 沒有已配對的卡片需要恢復');
                return;
            }

            // 遍歷所有已配對的卡片 ID
            for (const pairId of this.matchedPairs) {
                // 查找對應的卡片
                const leftCard = this.leftCards?.find(card => card.getData('pairId') === pairId);
                const rightCard = this.rightCards?.find(card => card.getData('pairId') === pairId);

                if (leftCard && rightCard) {
                    // 應用已配對的視覺效果
                    leftCard.setAlpha(0.5);
                    rightCard.setAlpha(0.5);

                    // 禁用已配對卡片的互動
                    leftCard.setInteractive(false);
                    rightCard.setInteractive(false);

                    console.log(`✅ [v53.0] 已恢復卡片 ${pairId} 的視覺效果`);
                }
            }

            // 🔥 [v104.0] 新增：根據 currentPageAnswers 重新調整勾勾和叉叉的位置
            if (this.currentPageAnswers && this.currentPageAnswers.length > 0) {
                console.log('🔥 [v104.0] 重新調整勾勾和叉叉的位置');

                this.currentPageAnswers.forEach((answer) => {
                    // 查找對應的卡片
                    let targetCard = null;

                    if (this.layout === 'mixed') {
                        // 混合佈局：英文卡片在 leftCards 中
                        targetCard = this.leftCards?.find(card => card.getData('pairId') === answer.rightPairId);
                    } else {
                        // 分離佈局：英文卡片在 rightCards 中
                        targetCard = this.rightCards?.find(card => card.getData('pairId') === answer.rightPairId);
                    }

                    if (targetCard) {
                        // 根據配對結果重新調整勾勾或叉叉
                        if (answer.isCorrect) {
                            this.showCorrectAnswer(targetCard, answer.correctAnswer);
                        } else {
                            this.showIncorrectAnswer(targetCard, answer.correctAnswer);
                        }
                        console.log(`✅ [v104.0] 已重新調整卡片 ${answer.rightPairId} 的勾勾/叉叉位置`);
                    }
                });
            }

            console.log('✅ [v53.0] 已配對卡片視覺效果恢復完成');
        } catch (error) {
            console.error('❌ [v53.0] 恢復已配對卡片視覺效果失敗:', error);
        }
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

        // 🔍 [DEBUG-v61.0] 詳細的尺寸檢查
        console.log('🔍 [DEBUG-v61.0] 尺寸來源檢查:');
        console.log('  this.scale.width:', this.scale.width);
        console.log('  this.scale.height:', this.scale.height);
        console.log('  this.scale.gameSize.width:', this.scale.gameSize.width);
        console.log('  this.scale.gameSize.height:', this.scale.gameSize.height);
        console.log('  window.innerWidth:', window.innerWidth);
        console.log('  window.innerHeight:', window.innerHeight);
        console.log('  this.game.screenBaseSize:', this.game.screenBaseSize);

        console.log('🎮 GameScene: 計算卡片尺寸和位置', { width, height });

        // 🔥 v46.0：邊界檢查
        if (width < 320 || height < 270) {
            console.error('❌ 螢幕尺寸過小:', { width, height });
            throw new Error(`螢幕尺寸過小: ${width}×${height}，最小要求 320×270`);
        }

        // ✅ v46.0：改進的設備檢測邏輯
        // 修復 1024×768 白屏問題：排除桌面 XGA 分辨率
        const isDesktopXGA = width === 1024 && height === 768;  // 特殊情況：舊 XGA 標準
        const isRealTablet = width >= 768 && width <= 1024 && height >= 600 && !isDesktopXGA;
        const isIPad = isRealTablet;

        console.log('🔍 [v46.0] 設備檢測:', {
            width,
            height,
            isDesktopXGA,
            isRealTablet,
            isIPad
        });

        // 響應式卡片尺寸（根據螢幕寬度調整）
        let cardWidth, cardHeight;
        if (isIPad) {
            // iPad：根據容器大小動態調整
            // 分離佈局：左右各一列，所以卡片寬度 = 可用寬度 / 2 - 邊距
            const maxCardWidth = (width - 60) * 0.4;  // 限制最大寬度為 40%
            cardWidth = Math.max(140, Math.min(maxCardWidth, (width - 60) / 2 - 20));
            cardHeight = Math.max(60, height * 0.12);  // 高度為螢幕高度的 12%
            console.log('📱 [v46.0] iPad 動態卡片尺寸:', {
                availableWidth: width - 60,
                maxCardWidth: maxCardWidth.toFixed(1),
                calculatedCardWidth: cardWidth.toFixed(1),
                calculatedCardHeight: cardHeight.toFixed(1)
            });
        } else {
            // 其他設備：使用固定比例
            cardWidth = Math.max(150, Math.min(250, width * 0.2));
            cardHeight = Math.max(50, Math.min(80, height * 0.1));
        }

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
        console.log('🔍 [v52.0 DEBUG] 洗牌前:', {
            randomMode: this.random,
            originalOrder: currentPagePairs.map(p => p.id),
            arrayLength: currentPagePairs.length
        });

        if (this.random === 'same') {
            const urlParams = new URLSearchParams(window.location.search);
            const activityId = urlParams.get('activityId') || 'default-seed';
            const seed = activityId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const rng = new Phaser.Math.RandomDataGenerator([seed.toString()]);
            shuffledAnswers = rng.shuffle([...currentPagePairs]);
            console.log('🎲 使用固定隨機模式，種子:', seed, '洗牌後:', shuffledAnswers.map(p => p.id));
        } else {
            // 🔥 v52.0：使用 Fisher-Yates 算法實現真正的隨機排列
            shuffledAnswers = [...currentPagePairs];
            for (let i = shuffledAnswers.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledAnswers[i], shuffledAnswers[j]] = [shuffledAnswers[j], shuffledAnswers[i]];
            }
            console.log('🎲 使用隨機排列模式（Fisher-Yates 算法）', '洗牌後:', shuffledAnswers.map(p => p.id));
        }

        // 創建左側外框
        this.createLeftContainerBox(leftX, leftStartY, cardWidth, cardHeight, leftSpacing, itemCount);

        // 🔥 創建左側題目卡片（按照順序出現動畫）
        currentPagePairs.forEach((pair, index) => {
            const y = leftStartY + index * leftSpacing;
            const animationDelay = index * 100;  // 🔥 每個卡片延遲 100ms
            const card = this.createLeftCard(leftX, y, cardWidth, cardHeight, pair.question, pair.id, animationDelay, pair.imageUrl, pair.audioUrl);
            this.leftCards.push(card);
        });

        // 創建右側答案卡片（文字在框右邊）
        shuffledAnswers.forEach((pair, index) => {
            const y = rightStartY + index * rightSpacing;
            // 🔥 [v62.0] 傳遞 imageUrl 和 audioUrl
            const card = this.createRightCard(rightX, y, cardWidth, cardHeight, pair.answer, pair.id, pair.chineseImageUrl, pair.audioUrl, 'right');  // 🔥 文字在框右邊
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
            cardWidth = Math.max(80, Math.min(120, width * (0.85 / columns)));  // ✅ 提高最小寬度從 70px 到 80px
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
            // 🔥 v52.0：使用 Fisher-Yates 算法實現真正的隨機排列
            shuffledAnswers = [...currentPagePairs];
            for (let i = shuffledAnswers.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledAnswers[i], shuffledAnswers[j]] = [shuffledAnswers[j], shuffledAnswers[i]];
            }
            console.log('🎲 使用隨機排列模式（Fisher-Yates 算法）');
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
            const card = this.createLeftCard(x, y, cardWidth, cardHeight, pair.question, pair.id, animationDelay, pair.imageUrl, pair.audioUrl);
            this.leftCards.push(card);
        });

        // 🔥 創建下方中文卡片（2 行多列）
        shuffledAnswers.forEach((pair, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);
            const x = bottomAreaStartX + col * (cardWidth + horizontalSpacing) + cardWidth / 2;
            const y = bottomAreaStartY + row * (cardHeight + bottomVerticalSpacing) + cardHeight / 2;  // 🔥 中文卡片使用 bottomVerticalSpacing

            // 🔥 [v62.0] 傳遞 imageUrl 和 audioUrl
            const card = this.createRightCard(x, y, cardWidth, cardHeight, pair.answer, pair.id, pair.chineseImageUrl, pair.audioUrl);
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

        // 🔥 v10.0 檢測是否有圖片（只要有任何一個圖片就進入正方形模式）
        const hasImages = currentPagePairs.some(pair =>
            pair.imageUrl || pair.chineseImageUrl || pair.imageId || pair.chineseImageId
        );
        console.log(`🔍 [v10.0] 分離佈局圖片檢測: hasImages=${hasImages}, mode=${hasImages ? '🟦 正方形模式' : '🟨 長方形模式'}`);

        // 🔥 v48.0 使用統一列數計算系統（替代硬編碼的列數規則）
        const minCardWidth = hasImages ? 60 : 80;  // 有圖片時卡片更小
        const columns = UnifiedColumnCalculator.calculateOptimalColumns(
            width,
            itemCount,
            minCardWidth,
            10,  // spacing
            30   // horizontalMargin
        );
        const rows = Math.ceil(itemCount / columns);

        console.log(`📊 [v48.0] 匹配數: ${itemCount}, 使用 ${rows} 行 × ${columns} 列佈局 (動態計算)`);

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

        // 🔥 v10.0 根據列數調整卡片尺寸
        // 5 列模式（有圖片）：卡片更小
        // 2 列模式（無圖片）：卡片更大
        if (columns === 5) {
            // 🔥 v10.0 正方形模式（5 列）：卡片更小
            if (isSmallContainer) {
                cardWidth = Math.max(50, Math.min(80, width * 0.08));
                cardHeight = Math.max(50, Math.min(80, width * 0.08));  // 正方形
            } else if (isMediumContainer) {
                cardWidth = Math.max(60, Math.min(100, width * 0.10));
                cardHeight = Math.max(60, Math.min(100, width * 0.10));  // 正方形
            } else {
                cardWidth = Math.max(80, Math.min(140, width * 0.12));
                cardHeight = Math.max(80, Math.min(140, width * 0.12));  // 正方形
            }
        } else {
            // 🔥 v10.0 長方形模式（2 列）：卡片更大
            if (isSmallCardSize) {
                cardWidth = Math.max(70, Math.min(110, width * 0.11));  // 🔥 6-10 個和 16-20 個：更小的寬度
                cardHeight = Math.max(18, Math.min(maxCardHeight, 38));  // 🔥 6-10 個和 16-20 個：更小的高度
            } else {
                cardWidth = Math.max(80, Math.min(130, width * 0.13));
                cardHeight = Math.max(20, Math.min(maxCardHeight, 45));
            }
        }

        console.log(`📐 卡片尺寸 [v10.0]: ${cardWidth.toFixed(0)} × ${cardHeight.toFixed(0)}, 模式: ${columns === 5 ? '🟦 正方形 (5列)' : '🟨 長方形 (2列)'}`);
        console.log(`📏 可用高度: ${availableHeight.toFixed(0)}, 最大卡片高度: ${maxCardHeight.toFixed(0)}`);

        // 🔥 英文卡片和中文卡片的垂直間距（文字在框右邊，不需要額外間距）
        const leftVerticalSpacing = verticalSpacing;
        const rightVerticalSpacing = verticalSpacing;  // 🔥 與左側相同

        // 🔥 計算左側區域（英文）的起始位置
        const leftAreaStartX = width * 0.08;
        const leftAreaStartY = height * 0.1;

        // 🔥 v44.2：修復右側卡片被切到邊緣的問題
        // 計算左側區域的寬度，然後右側區域從中間開始
        const leftAreaWidth = cardWidth * columns + horizontalSpacing * (columns - 1);
        const rightAreaStartX = leftAreaStartX + leftAreaWidth / 2 + width * 0.02;  // 加 2% 的間距
        const rightAreaStartY = height * 0.1;

        console.log(`📍 區域位置 [v44.2]:`, {
            leftAreaStartX: leftAreaStartX.toFixed(0),
            leftAreaStartY: leftAreaStartY.toFixed(0),
            leftAreaWidth: leftAreaWidth.toFixed(0),
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
            // 🔥 v52.0：使用 Fisher-Yates 算法實現真正的隨機排列
            shuffledAnswers = [...currentPagePairs];
            for (let i = shuffledAnswers.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledAnswers[i], shuffledAnswers[j]] = [shuffledAnswers[j], shuffledAnswers[i]];
            }
            console.log('🎲 使用隨機排列模式（Fisher-Yates 算法）');
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
            const card = this.createLeftCard(x, y, cardWidth, cardHeight, pair.question, pair.id, animationDelay, pair.imageUrl, pair.audioUrl);
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
            // 🔥 [v62.0] 傳遞 imageUrl 和 audioUrl
            const card = this.createRightCard(x, y, cardWidth, cardHeight, pair.answer, pair.id, pair.chineseImageUrl, pair.audioUrl, textPosition);
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

        // 🔥 v48.0 使用統一列數計算系統（替代硬編碼的列數規則）
        const columns = UnifiedColumnCalculator.calculateOptimalColumns(
            width,
            itemCount,
            50,   // minCardWidth
            5,    // spacing
            30    // horizontalMargin
        );
        const rows = Math.ceil(itemCount / columns);

        console.log(`📊 [v48.0] 匹配數: ${itemCount}, 使用 ${rows} 行 × ${columns} 列佈局 (動態計算)`);

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
            // 🔥 v52.0：使用 Fisher-Yates 算法實現真正的隨機排列
            shuffledAnswers = [...currentPagePairs];
            for (let i = shuffledAnswers.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledAnswers[i], shuffledAnswers[j]] = [shuffledAnswers[j], shuffledAnswers[i]];
            }
            console.log('🎲 使用隨機排列模式（Fisher-Yates 算法）');
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
            const card = this.createLeftCard(x, y, cardWidth, cardHeight, pair.question, pair.id, animationDelay, pair.imageUrl, pair.audioUrl);
            this.leftCards.push(card);
        });

        // 🔥 創建下方中文卡片（多行多列）
        shuffledAnswers.forEach((pair, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);
            const x = bottomAreaStartX + col * (cardWidth + horizontalSpacing) + cardWidth / 2;
            const y = bottomAreaStartY + row * (cardHeight + bottomVerticalSpacing) + cardHeight / 2;  // 🔥 中文卡片使用 bottomVerticalSpacing

            // 🔥 [v62.0] 傳遞 imageUrl 和 audioUrl
            const card = this.createRightCard(x, y, cardWidth, cardHeight, pair.answer, pair.id, pair.chineseImageUrl, pair.audioUrl);
            this.rightCards.push(card);
        });

        console.log('✅ 上下分離佈局（多行多列）創建完成');
    }

    // 🔥 創建混合網格佈局（11個以上匹配數）
    createMixedGridLayout(currentPagePairs, width, height) {
        console.log('📐 創建混合網格佈局（11個以上匹配數）');

        const itemCount = currentPagePairs.length;
        const totalCards = itemCount * 2;  // 英文 + 中文

        // 🔥 檢測容器高度和寬度（v7.0 修復：根據寬度判定，不只看高度）
        const isMobilePortrait = width < 500;  // 手機直向
        const isSmallContainer = height < 500;  // 極小高度
        const isMediumContainer = height >= 500 && height < 800;

        console.log(`📐 容器尺寸: ${width} × ${height}`, {
            isMobilePortrait,
            isSmallContainer,
            isMediumContainer,
            isLargeContainer: height >= 800,
            totalCards
        });

        // 🔥 v48.0 使用統一列數計算系統（替代硬編碼的列數規則）
        const columns = UnifiedColumnCalculator.calculateOptimalColumnsWithAspectRatio(
            width,
            height,
            totalCards,
            {
                minCardWidth: 60,
                spacing: 10,
                horizontalMargin: 30,
                minCardHeight: 50,
                verticalMargin: 30
            }
        );

        console.log(`📊 [v48.0] 總卡片數: ${totalCards}, 容器: ${width}×${height}px, 使用 ${columns} 列佈局 (動態計算)`);

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
            // 🔥 v52.0：使用 Fisher-Yates 算法實現真正的隨機排列
            shuffledCards = [...allCards];
            for (let i = shuffledCards.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
            }
            console.log('🎲 混合網格使用隨機排列模式（Fisher-Yates 算法）');
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
                const card = this.createLeftCard(x, y, dynamicCardWidth, dynamicCardHeight, cardData.text, cardData.pairId, animationDelay, cardData.pair.imageUrl, cardData.pair.audioUrl);
                this.leftCards.push(card);
            } else {
                // 🔥 [v62.0] 傳遞 imageUrl 和 audioUrl
                const card = this.createRightCard(x, y, dynamicCardWidth, dynamicCardHeight, cardData.text, cardData.pairId, cardData.pair.chineseImageUrl, cardData.pair.audioUrl);
                this.rightCards.push(card);
            }
        });

        console.log('✅ 混合網格佈局創建完成');
    }

    // 🔥 創建混合佈局（英文卡片和中文框混合排列）
    createMixedLayout(currentPagePairs, width, height, cardWidth, cardHeight) {
        console.log('🎮 創建混合佈局（英文卡片在中文框內，可交換位置）');

        // ✅ v45.1：修復 - 在方法開始處定義 iPad 分類函數
        // 🔥 第一步：iPad 容器大小分類函數
        // ✅ v42.2：根據寬度和高度的組合分類，而不是只看寬度
        // 這樣 768×1024 和 1024×768 會被分類為同一個設備


        const itemCount = currentPagePairs.length;

        // 📝 響應式檢測：判斷是否需要使用緊湊模式
        // 🔥 修復：手機直向應該也使用緊湊模式
        // isMobileDevice：手機設備（寬度 < 768px）
        // isLandscapeMobile：手機橫向模式（寬度 > 高度 且 高度 < 500px）
        // isTinyHeight：極小高度（高度 < 400px）
        // 🔥 v13.0：分離手機直向和橫向的佈局邏輯
        // isCompactMode：緊湊模式（手機直向 或 手機橫向 或 極小高度）
        const isMobileDevice = width < 768;  // 手機設備（寬度 < 768px）
        const isPortraitMode = height > width;  // 直向模式（高 > 寬）
        const isLandscapeMode = width > height;  // 橫向模式（寬 > 高）
        const isLandscapeMobile = isLandscapeMode && height < 500;  // 手機橫向
        const isTinyHeight = height < 400;  // 極小高度

        // ✅ v46.0：改進的設備檢測邏輯 - 排除桌面 XGA 分辨率
        const isDesktopXGA = width === 1024 && height === 768;  // 特殊情況：舊 XGA 標準
        const isRealTablet = width >= 768 && width <= 1024 && height >= 600 && !isDesktopXGA;
        const isTablet = isRealTablet;
        const isIPad = isRealTablet;  // iPad 別名

        // ✅ v48.0：添加平板直向模式檢測
        // 平板直向：寬度 768-1024px，高度 > 寬度（直向模式）
        const isTabletPortrait = isTablet && isPortraitMode;  // 平板直向模式
        const isTabletLandscape = isTablet && isLandscapeMode;  // 平板橫向模式

        // 🔥 v13.0：分離的緊湊模式檢測
        const isCompactMode = isMobileDevice || isLandscapeMobile || isTinyHeight;
        const isPortraitCompactMode = isMobileDevice && isPortraitMode;  // 手機直向緊湊模式
        const isLandscapeCompactMode = isLandscapeMobile || isTinyHeight;  // 手機橫向緊湊模式



        console.log('📱 響應式檢測 [v38.0]:', {
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

        // 🔥 根據匹配數和模式決定列數和框的尺寸
        let cols, frameWidth, totalUnitHeight, cardHeightInFrame, chineseFontSize, chineseTextHeight, verticalSpacing;
        // 📝 totalUnitHeight = 單元總高度（包含英文卡片高度 + 中文文字高度）

        // 📝 中文文字高度會根據模式動態調整
        // 緊湊模式：16px字體 → ~16px高度
        // 正常模式：18px字體 → ~18px高度

        // 🔥 預先聲明 chineseFontSizes 變量（用於存儲所有中文文字的實際字體大小）
        let chineseFontSizes;

        if (isCompactMode) {
            // 📝 緊湊模式（手機橫向或極小高度）
            // 目標：減少垂直空間佔用，增加列數
            console.log('📱 使用緊湊模式佈局');

            // 🔥 v10.0 檢測是否有圖片（只要有任何一個圖片就進入正方形模式）
            const hasImages = currentPagePairs.some(pair =>
                pair.imageUrl || pair.chineseImageUrl || pair.imageId || pair.chineseImageId
            );
            console.log(`🔍 [v10.0] 緊湊模式圖片檢測: hasImages=${hasImages}, mode=${hasImages ? '🟦 正方形模式' : '🟨 長方形模式'}`);

            // 🔥 v47.0：根據容器寬度動態計算列數
            // 不再使用固定的列數，而是根據容器寬度和卡片寬度計算最優列數
            const calculateOptimalCols = (containerWidth, itemCount, minCardWidth = 60, spacing = 10) => {
                // 計算最大可能的列數
                const maxPossibleCols = Math.floor((containerWidth - 20) / (minCardWidth + spacing));

                // 根據 itemCount 和 maxPossibleCols 計算最優列數
                if (itemCount <= 3) {
                    return Math.min(itemCount, 2);
                } else if (itemCount <= 5) {
                    return Math.min(itemCount, 3);
                } else if (itemCount <= 10) {
                    return Math.min(itemCount, Math.max(3, Math.min(4, maxPossibleCols)));
                } else if (itemCount <= 15) {
                    return Math.min(itemCount, Math.max(4, Math.min(5, maxPossibleCols)));
                } else {
                    return Math.min(itemCount, Math.max(5, Math.min(7, maxPossibleCols)));
                }
            };

            // 🔥 v18.0：動態列數計算
            // 根據每頁匹配數和容器寬度動態調整列數和卡片尺寸
            if (isLandscapeCompactMode) {
                // 橫向模式：根據容器寬度動態計算列數
                cols = calculateOptimalCols(width, itemCount, 40, 8);  // 手機橫向：更小的卡片
                console.log(`🔥 [v47.0] 手機橫向模式 - 根據容器寬度計算列數: width=${width}, itemCount=${itemCount}, cols=${cols}`);
            } else {
                // 直向模式：根據容器寬度動態計算列數
                cols = calculateOptimalCols(width, itemCount, 50, 10);  // 手機直向：標準卡片
                console.log(`🔥 [v47.0] 手機直向模式 - 根據容器寬度計算列數: width=${width}, itemCount=${itemCount}, cols=${cols}`);
            }
            cols = Math.min(cols, itemCount);  // 確保列數不超過項目數

            console.log(`🔥 [v47.0] 動態列數計算完成: itemCount=${itemCount}, cols=${cols}, isLandscapeCompactMode=${isLandscapeCompactMode}`);

            // 🔥 v20.0：添加詳細的設備尺寸和寬高比調試信息
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
                screenCategory: aspectRatio > 1.5 ? '寬螢幕' : aspectRatio > 1.2 ? '標準螢幕' : '直向螢幕'
            });

            // 計算行數
            const rows = Math.ceil(itemCount / cols);

            // 📝 計算可用垂直空間
            const topBottomMargin = 30;  // 上下邊距
            const minVerticalSpacing = 2;  // 最小垂直間距
            const availableHeight = height - topBottomMargin;  // 可用高度

            // 📝 計算每行的高度（初步估算）
            // 公式：(可用高度 - 間距總和) / 行數
            const rowHeight = (availableHeight - minVerticalSpacing * (rows + 1)) / rows;

            // 📝 根據列數動態計算最大卡片高度
            // 🔥 v19.0：根據列數自動調整卡片尺寸
            // 5 列：65px，4 列：75px，3 列：85px，2 列：95px
            let maxCardHeight;
            let chineseTextHeightBase;
            let verticalSpacingBase;

            if (isPortraitCompactMode) {
                // 🔥 v19.0：手機直向 - 根據列數動態調整
                if (cols === 5) {
                    // 5 列：緊湊排列（Wordwall 風格）
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
                }
                console.log('📱 [v19.0] 手機直向模式 - 根據列數調整卡片尺寸:', { cols, maxCardHeight, chineseTextHeightBase, verticalSpacingBase });
            } else if (isLandscapeCompactMode) {
                // 🔥 v19.0：手機橫向 - 根據列數動態調整（更緊湊）
                // ✅ v37.0：添加 7 列的設定
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
                }
                console.log('📱 [v37.0] 手機橫向模式 - 根據列數調整卡片尺寸:', { cols, maxCardHeight, chineseTextHeightBase, verticalSpacingBase });
            } else {
                // 其他模式（不應該執行到這裡）
                maxCardHeight = hasImages ? 65 : 50;
                chineseTextHeightBase = 18;
                verticalSpacingBase = 3;
            }

            // 🔥 計算框寬度
            // v10.0：如果有圖片，框寬度 = 卡片高度（正方形）；否則框寬度 > 卡片高度（長方形）
            // 🔥 v23.0：根據列數動態調整邊距，確保 5 列卡片在 iPhone 14 (390px) 上完整顯示
            // iPhone 14 直向 (390px) 應該有 330px 可用寬度，所以邊距應該是 30px × 2 = 60px
            let horizontalMargin;
            // ✅ v37.0：為 7 列添加邊距設定
            if (cols === 7) {
                // 7 列：最小邊距（10px）- 橫向模式充分利用寬度
                horizontalMargin = 10;
            } else if (cols === 6) {
                // 6 列：較小邊距（15px）
                horizontalMargin = 15;
            } else if (cols === 5) {
                // 5 列：邊距 = 30px（確保 390px 寬度下有 330px 可用寬度）
                horizontalMargin = 30;
            } else if (cols === 4) {
                // 4 列：中等邊距（20px）
                horizontalMargin = 20;
            } else {
                // 3 列或更少：較大邊距（25px）
                horizontalMargin = 25;
            }

            const maxFrameWidth = hasImages
                ? (itemCount <= 5 ? 280 : itemCount <= 10 ? 230 : itemCount <= 20 ? 180 : 250)  // 正方形模式
                : (itemCount <= 5 ? 280 : itemCount <= 10 ? 230 : itemCount <= 20 ? 180 : 250);  // 長方形模式
            frameWidth = hasImages
                ? Math.min(maxCardHeight, (width - 2 * horizontalMargin) / cols)  // 正方形：frameWidth = cardHeight
                : Math.min(maxFrameWidth, (width - 2 * horizontalMargin) / cols);  // 長方形：frameWidth 可以更寬

            // 🔥 智能預先計算所有中文文字的實際字體大小
            console.log('🔍 開始預先計算中文字體大小...');
            const tempCardHeight = Math.min(maxCardHeight, Math.max(20, Math.floor(rowHeight * 0.6)));  // 臨時卡片高度
            chineseFontSizes = currentPagePairs.map(pair => {
                // ✅ v27.2：計算初始字體大小（改為 × 0.4）
                let fontSize = Math.max(24, Math.min(48, tempCardHeight * 0.4));

                // ✅ v27.0：根據文字長度調整字體大小（1-2字相同，3-4字縮小）
                const textLength = pair.answer ? pair.answer.length : 0;
                if (textLength <= 2) {
                    fontSize = fontSize * 1.0;  // 1-2 個字：100%（保持原大小）
                } else if (textLength <= 4) {
                    fontSize = fontSize * 0.8;  // 3-4 個字：縮小 20%
                } else if (textLength <= 6) {
                    fontSize = fontSize * 0.7;  // 5-6 個字：縮小 30%
                } else {
                    fontSize = fontSize * 0.6;  // 7+ 個字：縮小 40%
                }
                fontSize = Math.max(18, fontSize);  // 最小字體大小 18px

                // 創建臨時文字對象來測量寬度
                const tempText = this.add.text(0, 0, pair.answer, {
                    fontSize: `${fontSize}px`,
                    fontFamily: 'Arial',
                    fontStyle: 'bold'
                });

                // 如果文字寬度超過框寬度的 85%，進一步縮小字體
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
            const avgChineseFontSize = (chineseFontSizes.reduce((a, b) => a + b, 0) / chineseFontSizes.length).toFixed(1);

            console.log('📊 中文字體大小範圍:', {
                min: minChineseFontSize,
                max: maxChineseFontSize,
                average: avgChineseFontSize,
                allSizes: chineseFontSizes
            });

            // 🔥 v19.0：根據列數動態調整中文文字高度和間距
            let dynamicVerticalSpacing;

            // 使用之前計算的基礎值
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

            chineseFontSize = `${Math.min(maxChineseFontSize, maxFontSizeLimit)}px`;

            console.log('📱 [v19.0] 根據列數調整中文文字:', {
                cols,
                chineseTextHeight,
                chineseFontSize,
                dynamicVerticalSpacing,
                maxFontSizeLimit
            });

            console.log('📐 動態垂直間距:', {
                chineseTextHeight,
                dynamicVerticalSpacing,
                formula: `max(5, ${maxChineseFontSize} * 0.2) = ${dynamicVerticalSpacing}`
            });

            // 🔥 v23.0：添加邊距調試信息
            console.log('🔥 [v23.0] 邊距計算:', {
                cols,
                width,
                horizontalMargin,
                availableWidth: width - 2 * horizontalMargin,
                frameWidth,
                totalFrameWidth: frameWidth * cols,
                formula: `horizontalMargin = ${cols === 5 ? 30 : cols === 4 ? 20 : 25}px (固定值)`
            });

            // ✅ v26.0：先計算 dynamicVerticalSpacing，以便在 cardHeightInFrame 計算中使用
            // 垂直間距 = 可用高度 × 0.03（範圍 10-40px）
            dynamicVerticalSpacing = Math.max(10, Math.min(40, availableHeight * 0.03));

            // 重新計算卡片高度（考慮實際的中文文字高度）
            // 🔥 v10.0：如果有圖片，cardHeightInFrame = frameWidth（正方形）；否則根據可用空間計算
            if (hasImages) {
                // 正方形模式：卡片高度 = 框寬度
                cardHeightInFrame = frameWidth;
                console.log(`🔥 [v10.0] 正方形模式：cardHeightInFrame = frameWidth = ${frameWidth}`);
            } else {
                // 長方形模式：根據可用空間計算
                cardHeightInFrame = Math.min(maxCardHeight, Math.max(20, Math.floor(rowHeight - chineseTextHeight - dynamicVerticalSpacing)));
                console.log(`🔥 [v10.0] 長方形模式：cardHeightInFrame = ${cardHeightInFrame}`);
            }

            // ✅ v25.0：在 cardHeightInFrame 計算完成後，使用動態計算而不是固定值
            // ✅ v29.0：方案 B - 增加預留給中文字的高度（從 × 0.4 改為 × 0.5）
            // 中文文字高度 = 卡片高度 × 0.5（確保中文字有足夠空間）
            chineseTextHeight = cardHeightInFrame * 0.5;

            // ✅ v26.0：方案 A - 在英文卡片和中文字之間加入 verticalSpacing
            // 📝 單元總高度 = 英文卡片高度 + verticalSpacing + 中文文字高度 + verticalSpacing
            // ✅ v27.3：保持原始結構，上下都有 verticalSpacing
            // ✅ v35.0：取消上面的 verticalSpacing（只保留下面的）
            totalUnitHeight = cardHeightInFrame + chineseTextHeight + dynamicVerticalSpacing;

            // 🔥 v15.0：將 dynamicVerticalSpacing 賦值給 verticalSpacing，以便後續使用
            verticalSpacing = dynamicVerticalSpacing;
            console.log('🔥 [v15.0] 緊湊模式 verticalSpacing 已設置:', { dynamicVerticalSpacing, verticalSpacing, isPortraitCompactMode });

            console.log('🔥 緊湊模式智能動態尺寸 [v10.0]:', {
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
                mode: hasImages ? '🟦 正方形模式' : '🟨 長方形模式'
            });
        } else {
            // 🔥 桌面動態響應式佈局（含按鈕空間）
            console.log('🖥️ 使用桌面動態響應式佈局（含按鈕空間）');

            // 🔥 第零步：檢測是否有圖片
            const hasImages = currentPagePairs.some(pair =>
                pair.imageUrl || pair.chineseImageUrl || pair.imageId || pair.chineseImageId
            );

            // 🔥 v8.0 詳細調試：檢查每個卡片的圖片字段
            console.log('🔍 詳細圖片檢測:', {
                totalPairs: currentPagePairs.length,
                hasImages,
                mode: hasImages ? '🟦 正方形模式' : '🟨 長方形模式',
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
            // ✅ v42.0：iPad 容器大小分類系統 - 根據容器大小動態調整所有參數
            // ============================================================================

            // 🔥 第三步：定義按鈕區域和邊距
            // ✅ v48.0：針對平板直向模式優化邊距計算
            let topButtonAreaHeight, bottomButtonAreaHeight, sideMargin;

            if (isTabletPortrait) {
                // 平板直向模式：優化邊距
                // 平板直向通常寬度 768-1024px，應該有更合理的邊距
                topButtonAreaHeight = Math.max(60, Math.min(100, height * 0.06));     // 頂部按鈕區域（60-100px）
                bottomButtonAreaHeight = Math.max(60, Math.min(100, height * 0.08));  // 底部按鈕區域（60-100px）
                sideMargin = Math.max(40, Math.min(100, width * 0.05));               // 左右邊距（40-100px）

                console.log('📐 [v48.0] 平板直向布局 - 邊距計算:', {
                    width: width,
                    height: height,
                    mode: '平板直向',
                    margins: {
                        top: topButtonAreaHeight,
                        bottom: bottomButtonAreaHeight,
                        side: sideMargin
                    }
                });
            } else {
                // 其他設備：使用業界標準斷點計算邊距
                topButtonAreaHeight = Math.max(50, Math.min(80, height * 0.08));     // 頂部按鈕區域（50-80px）
                bottomButtonAreaHeight = Math.max(50, Math.min(80, height * 0.10));  // 底部按鈕區域（50-80px）
                sideMargin = Math.max(30, Math.min(80, width * 0.03));               // 左右邊距（30-80px）

                console.log('📐 [v47.0] 統一布局 - 邊距計算:', {
                    width: width,
                    height: height,
                    margins: {
                        top: topButtonAreaHeight,
                        bottom: bottomButtonAreaHeight,
                        side: sideMargin
                    }
                });
            }

            // 🔥 第四步：計算可用空間（扣除按鈕區域）
            const availableWidth = width - sideMargin * 2;
            const availableHeight = height - topButtonAreaHeight - bottomButtonAreaHeight;

            // 🔥 第五步：計算螢幕寬高比和間距
            const aspectRatio = width / height;

            // 🔥 第六步：計算水平和垂直間距
            // ✅ v48.0：針對平板直向模式優化間距計算
            let horizontalSpacing, verticalSpacing;

            if (isTabletPortrait) {
                // 平板直向模式：優化間距
                // 平板直向通常寬度 768-1024px，應該有更合理的間距
                horizontalSpacing = Math.max(20, Math.min(40, width * 0.025));  // 20-40px
                verticalSpacing = Math.max(50, Math.min(100, height * 0.05));   // 50-100px

                console.log('📐 [v48.0] 平板直向布局 - 間距計算:', {
                    width,
                    height,
                    mode: '平板直向',
                    horizontalSpacing: horizontalSpacing.toFixed(1),
                    verticalSpacing: verticalSpacing.toFixed(1)
                });
            } else {
                // 其他設備：根據寬高比動態調整水平間距
                let horizontalSpacingBase;
                if (aspectRatio > 2.0) {
                    horizontalSpacingBase = width * 0.02;  // 超寬螢幕：2%
                } else if (aspectRatio > 1.5) {
                    horizontalSpacingBase = width * 0.015; // 寬螢幕：1.5%
                } else {
                    horizontalSpacingBase = width * 0.01;  // 標準/直向：1%
                }
                horizontalSpacing = Math.max(15, Math.min(30, horizontalSpacingBase));  // 15-30px

                // 垂直間距 = 螢幕高度的 4%，範圍：40-80px
                verticalSpacing = Math.max(40, Math.min(80, height * 0.04));

                console.log('📐 [v47.0] 統一布局 - 間距計算:', {
                    width,
                    height,
                    aspectRatio: aspectRatio.toFixed(2),
                    horizontalSpacing: horizontalSpacing.toFixed(1),
                    verticalSpacing: verticalSpacing.toFixed(1)
                });
            }

            if (hasImages) {
                // 🟦 正方形模式（有圖片）
                console.log('🟦 使用正方形卡片模式');

                // 🔥 第七步：計算垂直間距（基於螢幕高度）
                // ✅ v42.0：iPad 已在上面設置，非 iPad 設備在此計算
                // 🔥 [v82.0] 修復：確保 iPad 在正方形模式下也設置 verticalSpacing
                if (!isIPad) {
                    // 非 iPad 設備：保留原有邏輯
                    // 使用固定的垂直間距，避免估算不準確導致間距太小
                    // 垂直間距 = 螢幕高度的 4%，範圍：40-80px
                    verticalSpacing = Math.max(40, Math.min(80, height * 0.04));
                } else if (verticalSpacing === undefined) {
                    // 🔥 [v82.0] iPad 在正方形模式下也需要設置 verticalSpacing
                    // 如果 iPad 沒有設置 verticalSpacing，使用預設值
                    verticalSpacing = Math.max(40, Math.min(80, height * 0.04));
                }

                // 🔥 第六步：定義最小正方形卡片大小
                // ✅ v49.0：改進平板直向模式的最小卡片尺寸計算
                // 🔥 v56.0：針對大屏幕平板（1024×1366）優化列數計算

                // 🔍 [DEBUG-v60.0] 詳細的設備檢測日誌
                console.log('🔍 [DEBUG-v60.0] 詳細設備檢測 (在 minSquareSize 計算前):');
                console.log('  width:', width);
                console.log('  height:', height);
                console.log('  isIPad:', isIPad);
                console.log('  isTablet:', isTablet);
                console.log('  isRealTablet:', isRealTablet);
                console.log('  isPortraitMode:', isPortraitMode);
                console.log('  isLandscapeMode:', isLandscapeMode);
                console.log('  isTabletPortrait:', isTabletPortrait);
                console.log('  isTabletLandscape:', isTabletLandscape);
                console.log('  isMobileDevice:', isMobileDevice);
                console.log('  isDesktopXGA:', isDesktopXGA);

                let minSquareSize;
                if (isIPad) {
                    if (isTabletPortrait) {
                        // 平板直向模式：根據寬度動態調整最小卡片尺寸
                        // 對於 1024×1366（iPad Pro 12.9"）：應該允許 6-7 列
                        // 對於 820×1180（iPad Air）：應該允許 6-7 列
                        // 🔥 v56.0：改進計算邏輯，根據寬度動態調整

                        if (width >= 1000) {
                            // 大屏幕平板（1024×1366）：允許更多列，最小尺寸更小
                            minSquareSize = Math.max(100, (availableWidth - 8 * horizontalSpacing) / 7);
                            console.log('📱 [v56.0] 大屏幕平板直向動態卡片尺寸 (1024+):', {
                                width: width.toFixed(1),
                                availableWidth: availableWidth.toFixed(1),
                                horizontalSpacing: horizontalSpacing.toFixed(1),
                                calculatedMinSize: minSquareSize.toFixed(1),
                                minSizeThreshold: 100,
                                targetCols: 7,
                                mode: '大屏幕平板直向'
                            });
                        } else {
                            // 標準平板直向（768-1023）：保持原有邏輯
                            minSquareSize = Math.max(120, (availableWidth - 6 * horizontalSpacing) / 6);
                            console.log('📱 [v49.0] 標準平板直向動態卡片尺寸 (768-1023):', {
                                width: width.toFixed(1),
                                availableWidth: availableWidth.toFixed(1),
                                horizontalSpacing: horizontalSpacing.toFixed(1),
                                calculatedMinSize: minSquareSize.toFixed(1),
                                minSizeThreshold: 120,
                                targetCols: 6,
                                mode: '標準平板直向'
                            });
                        }
                    } else {
                        // iPad 橫向或其他模式：保持原有邏輯
                        // 5 列 + 6 個間距 = 5 * minSquareSize + 6 * horizontalSpacing = availableWidth
                        // ✅ v43.0：最小尺寸從 120px 增加至 140px，使卡片更大更易點擊
                        minSquareSize = Math.max(140, (availableWidth - 6 * horizontalSpacing) / 5);
                        console.log('📱 [v43.0] iPad 動態卡片尺寸:', {
                            availableWidth: availableWidth.toFixed(1),
                            horizontalSpacing: horizontalSpacing.toFixed(1),
                            calculatedMinSize: minSquareSize.toFixed(1),
                            minSizeThreshold: 140
                        });
                    }
                } else {
                    // 其他設備：使用固定最小尺寸
                    minSquareSize = 150;  // 最小正方形尺寸150×150
                }

                // 🔥 第七步：計算最大可能的列數
                // 使用最小卡片尺寸來計算最大可能列數
                const maxPossibleCols = Math.floor((availableWidth + horizontalSpacing) / (minSquareSize + horizontalSpacing));

                // 🔥 第八步：智能計算最佳列數（優先使用最大可能列數）
                // 策略：盡可能多的列數，充分利用水平空間
                let optimalCols;
                let estimatedSquareSize;  // ✅ v48.0：移到外部作用域，避免作用域問題
                let calculatedCols;       // ✅ v48.0：移到外部作用域，避免作用域問題
                let maxColsLimit;         // ✅ v48.0：移到外部作用域，避免作用域問題

                // ✅ v50.0：改進平板直向模式列數計算 - 使用簡單的寬度比例
                // 🔍 [DEBUG-v59.0] 添加調試日誌來追踪代碼執行路徑
                console.log('🔍 [DEBUG-v59.0] 即將檢查 isTabletPortrait 條件');
                console.log('🔍 [DEBUG-v59.0] isTabletPortrait:', isTabletPortrait);
                console.log('🔍 [DEBUG-v59.0] width:', width);
                console.log('🔍 [DEBUG-v59.0] height:', height);
                console.log('🔍 [DEBUG-v59.0] isTablet:', isTablet);
                console.log('🔍 [DEBUG-v59.0] isPortraitMode:', isPortraitMode);
                console.log('🔍 [DEBUG-v59.0] isIPad:', isIPad);

                if (isTabletPortrait) {
                    console.log('🔍 [DEBUG-v59.0] ✅ 進入 isTabletPortrait 分支');
                    // 平板直向模式：根據實際寬度動態計算最佳列數
                    // 使用簡單的寬度比例方法，避免循環依賴

                    // 第一步：根據寬度估算列數
                    // 🔥 v58.0：改進目標卡片寬度計算，根據屏幕寬度動態調整
                    // 對於 1024px 寬度，應該顯示 6-7 列
                    // 對於 768px 寬度，應該顯示 5-6 列
                    // 使用公式：cols = floor((availableWidth - spacing) / (targetCardWidth + spacing))
                    // 其中 targetCardWidth 根據寬度動態計算

                    let targetCardWidth;
                    if (width >= 1000) {
                        // 大屏幕平板：基於 6.5 列計算目標寬度
                        targetCardWidth = availableWidth / 6.5;
                    } else if (width >= 900) {
                        // 中等屏幕平板：基於 6 列計算目標寬度
                        targetCardWidth = availableWidth / 6;
                    } else {
                        // 標準平板：基於 5 列計算目標寬度
                        targetCardWidth = availableWidth / 5;
                    }

                    optimalCols = Math.max(3, Math.floor((availableWidth - horizontalSpacing) / (targetCardWidth + horizontalSpacing)));
                    optimalCols = Math.min(optimalCols, itemCount);  // 不超過項目數

                    // 第二步：估算卡片尺寸
                    const estimatedRows = Math.ceil(itemCount / optimalCols);
                    const estimatedAvailableHeightPerRow = (availableHeight - verticalSpacing * (estimatedRows + 1)) / estimatedRows;
                    estimatedSquareSize = (estimatedAvailableHeightPerRow - verticalSpacing) / 1.4;

                    // 第三步：計算實際列數
                    calculatedCols = Math.floor((availableWidth - horizontalSpacing) / (estimatedSquareSize + horizontalSpacing));

                    // 🔥 v57.0：根據寬度動態調整最大列數限制
                    // 對於大屏幕平板（1024+）：允許 7-8 列
                    // 對於標準平板（768-1023）：允許 6 列
                    if (width >= 1000) {
                        maxColsLimit = 8;  // 大屏幕平板：最多 8 列
                    } else if (width >= 900) {
                        maxColsLimit = 7;  // 中等屏幕平板：最多 7 列
                    } else {
                        maxColsLimit = 6;  // 標準平板：最多 6 列
                    }

                    optimalCols = Math.min(calculatedCols, maxColsLimit, itemCount);

                    console.log(`🔥 [v57.0] 平板直向列數計算（動態最大列數）:`, {
                        width: width.toFixed(1),
                        height: height.toFixed(1),
                        availableWidth: availableWidth.toFixed(1),
                        targetCardWidth: targetCardWidth.toFixed(1),
                        estimatedSquareSize: estimatedSquareSize.toFixed(1),
                        calculatedCols: calculatedCols,
                        maxColsLimit: maxColsLimit,
                        optimalCols: optimalCols,
                        itemCount: itemCount,
                        screenSize: width >= 1000 ? '大屏幕' : width >= 900 ? '中等' : '標準'
                    });
                } else {
                    console.log('🔍 [DEBUG-v59.0] ❌ 進入 else 分支 (isTabletPortrait 是 false)');
                    // 其他設備：使用原有邏輯
                    // 🔥 v47.0：使用統一的列數計算，移除 iPad 特殊設置
                    // 🔥 v52.0: 修復列數計算 - 基於實際卡片尺寸而不是 minCardWidth

                    // 🔥 第一步：估算正方形卡片尺寸
                    // 假設最多 10 列（保守估計）
                    const estimatedCols = Math.min(10, itemCount);
                    const estimatedRows = Math.ceil(itemCount / estimatedCols);

                    // 估算每行的可用高度
                    const estimatedAvailableHeightPerRow = (availableHeight - verticalSpacing * (estimatedRows + 1)) / estimatedRows;

                    // 估算正方形卡片尺寸（包含中文文字）
                    // totalUnitHeight = squareSize + chineseTextHeight = squareSize * 1.4
                    // squareSize = totalUnitHeight / 1.4
                    estimatedSquareSize = (estimatedAvailableHeightPerRow - verticalSpacing) / 1.4;

                    // 🔥 第二步：根據實際卡片尺寸計算列數
                    // 公式：cols = floor((availableWidth - spacing * (cols + 1)) / squareSize)
                    // 簡化為：cols = floor((availableWidth - spacing) / (squareSize + spacing))
                    calculatedCols = Math.floor((availableWidth - horizontalSpacing) / (estimatedSquareSize + horizontalSpacing));

                    // 限制最大列數（避免卡片過小）
                    maxColsLimit = 10;
                    optimalCols = Math.min(calculatedCols, maxColsLimit, itemCount);
                }

                console.log(`🔥 [v47.0] 統一列數計算（基於實際卡片尺寸）:`, {
                    width: width.toFixed(1),
                    height: height.toFixed(1),
                    aspectRatio: aspectRatio.toFixed(2),
                    availableWidth: availableWidth.toFixed(1),
                    estimatedSquareSize: estimatedSquareSize.toFixed(1),
                    horizontalSpacing: horizontalSpacing,
                    calculatedCols: calculatedCols,
                    maxColsLimit: maxColsLimit,
                    optimalCols: optimalCols,
                    itemCount: itemCount
                });

                // 確保列數在合理範圍內
                optimalCols = Math.max(1, Math.min(optimalCols, itemCount));

                // 🔥 第九步：計算行數
                const optimalRows = Math.ceil(itemCount / optimalCols);

                // 🔥 第十步：計算正方形卡片尺寸（迭代計算，確保不超出邊界）
                // 方法1：基於高度
                // totalUnitHeight = squareSize + chineseTextHeight
                // totalUnitHeight = squareSize + squareSize * 0.4 = squareSize * 1.4
                // 所以 squareSize = (totalUnitHeight - verticalSpacing) / 1.4
                let availableHeightPerRow = (availableHeight - verticalSpacing * (optimalRows + 1)) / optimalRows;
                let squareSizeByHeight = (availableHeightPerRow - verticalSpacing) / 1.4;  // ✅ 修正：考慮 verticalSpacing

                // 方法2：基於寬度
                const squareSizeByWidth = (availableWidth - horizontalSpacing * (optimalCols + 1)) / optimalCols;

                // 取較小值，確保卡片不會超出邊界
                let squareSize = Math.min(squareSizeByHeight, squareSizeByWidth);

                console.log(`🔥 [v49.0] 正方形卡片尺寸檢查:`, {
                    squareSizeByHeight: squareSizeByHeight.toFixed(1),
                    squareSizeByWidth: squareSizeByWidth.toFixed(1),
                    squareSize: squareSize.toFixed(1),
                    minSquareSize: minSquareSize.toFixed(1),
                    optimalCols: optimalCols,
                    itemCount: itemCount,
                    isTabletPortrait: isTabletPortrait
                });

                // 🔥 檢查是否需要增加列數（如果卡片太小）
                if (squareSize < minSquareSize && optimalCols < itemCount) {
                    // 嘗試增加列數，減少行數
                    const newCols = Math.min(optimalCols + 1, itemCount);
                    const newRows = Math.ceil(itemCount / newCols);

                    // 重新計算卡片尺寸
                    const newSquareSizeByWidth = (availableWidth - horizontalSpacing * (newCols + 1)) / newCols;
                    const newAvailableHeightPerRow = (availableHeight - verticalSpacing * (newRows + 1)) / newRows;
                    const newSquareSizeByHeight = (newAvailableHeightPerRow - verticalSpacing) / 1.4;  // ✅ 修正：考慮 verticalSpacing
                    const newSquareSize = Math.min(newSquareSizeByHeight, newSquareSizeByWidth);

                    // 如果新的卡片尺寸更大，使用新的佈局
                    if (newSquareSize > squareSize) {
                        cols = newCols;
                        squareSize = newSquareSize;
                        availableHeightPerRow = newAvailableHeightPerRow;

                        console.log('🔄 增加列數以避免卡片過小:', {
                            oldCols: optimalCols,
                            newCols: newCols,
                            oldSquareSize: squareSize.toFixed(1),
                            newSquareSize: newSquareSize.toFixed(1)
                        });
                    } else {
                        // 無法通過增加列數改善，智能縮小卡片
                        cols = optimalCols;
                        const rows = Math.ceil(itemCount / cols);

                        // 計算實際需要的卡片尺寸以適應可用高度
                        const actualAvailableHeightPerRow = (availableHeight - verticalSpacing * (rows + 1)) / rows;
                        const actualSquareSize = actualAvailableHeightPerRow / 1.4;

                        // 使用實際計算的尺寸，即使小於最小尺寸
                        squareSize = actualSquareSize;

                        console.log('📉 智能縮小卡片以適應可用高度:', {
                            cols,
                            rows,
                            minSquareSize,
                            actualSquareSize: actualSquareSize.toFixed(1),
                            reason: '無法增加列數，縮小卡片以避免超出邊界'
                        });
                    }
                } else if (squareSize < minSquareSize) {
                    // 卡片小於最小尺寸，但已經是最大列數
                    cols = optimalCols;
                    const rows = Math.ceil(itemCount / cols);

                    // 檢查使用最小尺寸是否會超出邊界
                    const totalHeightWithMinSize = rows * (minSquareSize * 1.4) + verticalSpacing * (rows + 1);

                    if (totalHeightWithMinSize > availableHeight) {
                        // 會超出邊界，智能縮小卡片
                        const actualAvailableHeightPerRow = (availableHeight - verticalSpacing * (rows + 1)) / rows;
                        squareSize = actualAvailableHeightPerRow / 1.4;

                        console.log('📉 智能縮小卡片以適應可用高度:', {
                            cols,
                            rows,
                            minSquareSize,
                            actualSquareSize: squareSize.toFixed(1),
                            totalHeightWithMinSize: totalHeightWithMinSize.toFixed(1),
                            availableHeight: availableHeight.toFixed(1),
                            reason: '使用最小尺寸會超出邊界'
                        });
                    } else {
                        // 不會超出邊界，使用最小尺寸
                        squareSize = minSquareSize;
                    }
                } else {
                    cols = optimalCols;
                }

                // 🔥 第十一步：設置卡片尺寸（正方形）
                frameWidth = squareSize;
                cardHeightInFrame = squareSize;
                chineseTextHeight = squareSize * 0.6;  // 🔥 [v79.0] 中文文字高度增加 50%（0.4 → 0.6）
                totalUnitHeight = cardHeightInFrame + chineseTextHeight + verticalSpacing;  // = squareSize * 1.6 + verticalSpacing

                // cols 已在上面的邏輯中設置
                const rows = Math.ceil(itemCount / cols);

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
                    cardRatio: '1:1 (正方形)',
                    screenType: aspectRatio > 2.0 ? '超寬螢幕' : aspectRatio > 1.5 ? '寬螢幕' : aspectRatio > 1.2 ? '標準螢幕' : '直向螢幕'
                });
            } else {
                // 🟨 長方形模式（無圖片）
                console.log('🟨 使用長方形卡片模式');

                // 🔥 第七步：計算垂直間距（基於螢幕高度）
                // ✅ v42.0：iPad 已在上面設置，非 iPad 設備在此計算
                // 🔥 [v82.0] 修復：確保非 iPad 設備也設置 verticalSpacing
                if (!isIPad) {
                    // 非 iPad 設備：保留原有邏輯
                    // 使用固定的垂直間距，避免估算不準確導致間距太小
                    // 垂直間距 = 螢幕高度的 4%，範圍：40-80px
                    verticalSpacing = Math.max(40, Math.min(80, height * 0.04));
                } else if (verticalSpacing === undefined) {
                    // 🔥 [v82.0] iPad 在長方形模式下也需要設置 verticalSpacing
                    // 如果 iPad 沒有設置 verticalSpacing，使用預設值
                    verticalSpacing = Math.max(40, Math.min(80, height * 0.04));
                }

                // 🔥 第六步：定義最小卡片大小
                // ✅ v39.0：iPad 動態調整最小卡片尺寸
                let minCardWidth, minCardHeight;
                if (isIPad) {
                    // iPad：根據容器大小動態計算最小卡片尺寸
                    // 5 列 + 6 個間距 = 5 * minCardWidth + 6 * horizontalSpacing = availableWidth
                    minCardWidth = Math.max(140, (availableWidth - 6 * horizontalSpacing) / 5);
                    minCardHeight = Math.max(70, minCardWidth * 0.5);  // 高度為寬度的 50%
                    console.log('📱 [v39.0] iPad 長方形卡片動態尺寸:', {
                        availableWidth: availableWidth.toFixed(1),
                        calculatedMinWidth: minCardWidth.toFixed(1),
                        calculatedMinHeight: minCardHeight.toFixed(1)
                    });
                } else {
                    // 其他設備：使用固定最小尺寸
                    minCardWidth = 200;
                    minCardHeight = 100;
                }

                // 🔥 第七步：計算最大可能的列數和行數
                const maxPossibleCols = Math.floor((availableWidth + horizontalSpacing) / (minCardWidth + horizontalSpacing));
                const maxPossibleRows = Math.floor((availableHeight + verticalSpacing) / (minCardHeight + verticalSpacing));

                // 🔥 v48.0 使用統一列數計算系統（替代硬編碼的列數規則）
                let optimalCols = UnifiedColumnCalculator.calculateOptimalColumnsWithAspectRatio(
                    width,
                    height,
                    itemCount,
                    {
                        minCardWidth: 80,
                        spacing: horizontalSpacing,
                        horizontalMargin: sideMargin,
                        minCardHeight: 60,
                        verticalMargin: topButtonAreaHeight + bottomButtonAreaHeight
                    }
                );

                // 確保列數在合理範圍內
                optimalCols = Math.max(1, Math.min(optimalCols, maxPossibleCols, itemCount));

                // 🔥 第九步：計算行數
                let optimalRows = Math.ceil(itemCount / optimalCols);

                // 🔥 如果行數超過最大可能行數，增加列數
                while (optimalRows > maxPossibleRows && optimalCols < itemCount) {
                    optimalCols++;
                    optimalRows = Math.ceil(itemCount / optimalCols);
                }

                cols = optimalCols;
                const rows = optimalRows;

                // 🔥 第十步：計算卡片大小（充分利用可用空間）
                frameWidth = (availableWidth - horizontalSpacing * (cols + 1)) / cols;

                // 🔥 計算單元總高度（包含中文文字）
                const availableHeightPerRow = (availableHeight - verticalSpacing * (rows + 1)) / rows;

                // 🔥 [v79.0] 卡片高度和中文文字高度計算（與正方形模式保持一致）
                // 使用正確公式：(availableHeightPerRow - verticalSpacing) / 1.4
                cardHeightInFrame = (availableHeightPerRow - verticalSpacing) / 1.4;  // ✅ 修正
                // 🔥 [v80.0] 優化：中文卡片高度固定為 30px（符合 v80.0 設計規格）
                // 原本：chineseTextHeight = cardHeightInFrame * 0.70
                // 新規則：chineseTextHeight = 30px（固定值，確保一致性）
                chineseTextHeight = 30;  // 🔥 [v80.0] 固定高度 30px

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
                    screenType: aspectRatio > 2.0 ? '超寬螢幕' : aspectRatio > 1.5 ? '寬螢幕' : aspectRatio > 1.2 ? '標準螢幕' : '直向螢幕'
                });
            }
        }

        console.log('📐 混合佈局參數:', { itemCount, cols, frameWidth, totalUnitHeight, cardHeightInFrame, chineseFontSize, isCompactMode });

        // 🔥 計算間距和行數
        const rows = Math.ceil(itemCount / cols);

        // 🔥 v51.0：使用與列數計算相同的邊距系統
        // 確保混合佈局使用的邊距與列數計算一致
        // 這樣可以避免卡片被裁切
        let horizontalMargin;
        if (isCompactMode) {
            // 緊湊模式：使用較小的邊距
            horizontalMargin = Math.max(15, Math.min(30, width * 0.02));
        } else {
            // 桌面模式：使用與列數計算相同的邊距
            horizontalMargin = Math.max(30, Math.min(80, width * 0.03));
        }

        // 🔥 v51.0：使用與列數計算相同的 availableWidth
        // 這樣可以確保 frameWidth 計算正確
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
            note: `iPhone 14 (390px) 應該有 330px 可用寬度`
        });

        let horizontalSpacing;
        if (cols === 5) {
            // 5 列：最小間距（1-3px），確保在 330px 可用寬度上完整顯示
            horizontalSpacing = Math.max(1, Math.min(3, availableSpace / (cols + 1)));
        } else {
            // 其他列數：使用計算方式
            horizontalSpacing = Math.max(5, availableSpace / (cols + 1));
        }

        // 🔥 v13.0：緊湊模式的 verticalSpacing 已在前面設置，不需要重新計算
        // 桌面模式的 verticalSpacing 已在上面的 if/else 分支中定義
        // 注意：緊湊模式下，verticalSpacing 已經在第 1949 行或 1956 行設置為 dynamicVerticalSpacing
        // 不要在這裡覆蓋它！

        // 🔥 計算頂部偏移，確保佈局垂直居中或從頂部開始（手機版減少10px）
        // 📝 totalUnitHeight 已經包含 chineseTextHeight 和 verticalSpacing，所以不需要重複加
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

        // 🔥 v23.0：添加水平間距調試信息
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
        if (!isCompactMode) {
            console.log('🔍 桌面模式：智能計算中文字體大小...');

            // ✅ v47.0：使用統一的寬度檢測，移除 iPad 特殊設置
            let baseFontSize = Math.max(18, Math.min(72, cardHeightInFrame * 0.6));

            chineseFontSizes = currentPagePairs.map(pair => {
                // 🔥 計算初始字體大小
                // ✅ v42.0：iPad 使用固定值，其他設備基於卡片高度計算
                let fontSize = baseFontSize;

                // 創建臨時文字對象來測量寬度
                const tempText = this.add.text(0, 0, pair.answer, {
                    fontSize: `${fontSize}px`,
                    fontFamily: 'Arial',
                    fontStyle: 'bold'
                });

                // 如果文字寬度超過框寬度的 85%，縮小字體
                const maxTextWidth = (frameWidth - 10) * 0.85;
                while (tempText.width > maxTextWidth && fontSize > 18) {
                    fontSize -= 2;
                    tempText.setFontSize(fontSize);
                }

                // 銷毀臨時文字對象
                tempText.destroy();

                return fontSize;
            });

            // 使用最大字體大小
            const maxChineseFontSize = Math.max(...chineseFontSizes);
            const minChineseFontSize = Math.min(...chineseFontSizes);
            const avgChineseFontSize = (chineseFontSizes.reduce((a, b) => a + b, 0) / chineseFontSizes.length).toFixed(1);

            console.log('📊 桌面模式中文字體大小範圍:', {
                min: minChineseFontSize,
                max: maxChineseFontSize,
                average: avgChineseFontSize,
                allSizes: chineseFontSizes
            });

            chineseFontSizesArray = chineseFontSizes;
        } else {
            // 緊湊模式使用之前計算的字體大小
            chineseFontSizesArray = chineseFontSizes;
        }

        // 🔥 第二步：創建中文文字（固定位置，作為"框"的參考）
        const chineseFrames = [];
        currentPagePairs.forEach((pair, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);

            // 🔥 v52.0：修復容器位置計算
            // 在 Phaser 中，容器的位置是基於其中心點
            // 所以 frameX 應該是容器中心的 X 坐標
            // 公式：邊距 + 間距 + col * (frameWidth + 間距) + frameWidth / 2
            // 這樣第一個容器的中心在：57.6 + 5 + 0 * (191.43 + 5) + 191.43/2 = 158.31
            // 第二個容器的中心在：57.6 + 5 + 1 * (191.43 + 5) + 191.43/2 = 158.31 + 196.43 = 354.74
            // 最後一個容器（col=9）的中心在：57.6 + 5 + 9 * (191.43 + 5) + 191.43/2 = 1926.18
            // 但這超出了 availableWidth（1804.8），所以會被裁切
            //
            // 根本問題：frameX 計算時沒有考慮到容器的邊界
            // 正確的計算應該是：
            // frameX = horizontalMargin + frameWidth / 2 + col * (frameWidth + horizontalSpacing)
            // 這樣第一個容器的中心在：57.6 + 191.43/2 + 0 = 153.21
            // 第二個容器的中心在：57.6 + 191.43/2 + 1 * (191.43 + 5) = 153.21 + 196.43 = 349.64
            // 最後一個容器（col=9）的中心在：57.6 + 191.43/2 + 9 * (191.43 + 5) = 153.21 + 1767.87 = 1921.08
            // 這仍然超出邊界！
            //
            // 真正的問題是：列數計算有誤，導致卡片太多
            // 讓我們重新檢查列數計算...
            // 根據日誌：cols: 10, frameWidth: 191.42857142857144, availableWidth: 1804.8
            // 10 個卡片的總寬度 = 10 * 191.43 + 9 * 5 = 1914.3 + 45 = 1959.3
            // 但 availableWidth 只有 1804.8，所以會超出邊界！
            //
            // 問題根源：列數計算公式仍然有誤
            // 應該使用：cols = floor((availableWidth - spacing) / (frameWidth + spacing))
            // 而不是：cols = floor((availableWidth - spacing) / (minCardWidth + spacing))
            // 因為 frameWidth 已經是計算好的卡片寬度，不是 minCardWidth
            const frameX = horizontalMargin + frameWidth / 2 + col * (frameWidth + horizontalSpacing);
            // 📝 使用 totalUnitHeight 計算垂直位置（已包含 chineseTextHeight 和 verticalSpacing）
            const frameY = topOffset + row * totalUnitHeight + totalUnitHeight / 2;

            // 🔥 創建中文文字容器（包含白色框）
            const frameContainer = this.add.container(frameX, frameY);

            // 🔥 白色背景框（與英文卡片同大小）
            const background = this.add.rectangle(0, 0, frameWidth - 10, cardHeightInFrame, 0xffffff);
            background.setStrokeStyle(2, 0x333333);
            frameContainer.add(background);

            // 🔥 [v76.0] 改進中文框佈局 - 中文框內顯示空白，下方添加圖片+文字區域
            const hasChineseImage = pair.chineseImageUrl && pair.chineseImageUrl.trim() !== '';
            const hasChineseText = pair.answer && pair.answer.trim() !== '' && pair.answer.trim() !== '<br>';

            console.log(`🔍 [v76.0] 混合佈局中文框 [${i}] 內容檢查:`, {
                hasImage: hasChineseImage,
                hasText: hasChineseText,
                text: pair.answer
            });

            // 🔥 [v76.0] 中文框內保持空白（不顯示任何內容）
            console.log(`⚪ [v76.0] 混合佈局中文框 [${i}] 顯示空白`);

            // 🔥 [v76.0] 在框下方創建圖片+文字區域
            if (hasChineseImage || hasChineseText) {
                console.log(`📦 [v76.0] 在框下方創建圖片+文字區域 [${i}]`);

                // 下方區域的位置：在框下方
                // frameY 是框的中心，框的高度是 cardHeightInFrame
                // 所以框的底部在 frameY + cardHeightInFrame / 2
                // 下方區域的中心應該在 frameY + cardHeightInFrame / 2 + chineseTextHeight / 2
                const labelAreaY = frameY + cardHeightInFrame / 2 + chineseTextHeight / 2;

                // 創建下方區域容器
                const labelContainer = this.add.container(frameX, labelAreaY);

                // 🔥 [v77.0] 移除灰框邊框 - 只保留白色背景，不顯示邊框
                const labelBackground = this.add.rectangle(0, 0, frameWidth - 10, chineseTextHeight, 0xffffff);
                labelBackground.setStrokeStyle(1, 0xcccccc);  // 🔥 [v78.0] 加回灰色邊框
                labelContainer.add(labelBackground);

                if (hasChineseImage && hasChineseText) {
                    // 🔥 [v81.0] 業界標準卡片設計 - 圖片 70%，文字 30%（垂直排列，不疊）
                    console.log(`🖼️📝 [v81.0] 下方區域 [${i}] 卡片設計模式（圖片70% + 文字30%）`);

                    // 圖片佔據上方 70%（清晰可見）
                    const imageAreaHeight = chineseTextHeight * 0.70;
                    const imageAreaY = -chineseTextHeight / 2 + imageAreaHeight / 2;
                    const squareSize = Math.min(frameWidth - 10 - 4, imageAreaHeight - 4);

                    this.loadAndDisplayImage(labelContainer, pair.chineseImageUrl, 0, imageAreaY, squareSize, `chinese-${pair.id}`).catch(error => {
                        console.error(`❌ [v81.0] 下方區域圖片載入失敗 [${i}]:`, error);
                    });

                    // 文字佔據下方 30%（在圖片下方，不疊）
                    const chineseActualFontSize = chineseFontSizesArray[i];
                    const textAreaHeight = chineseTextHeight * 0.30;
                    const bottomPadding = Math.max(2, chineseTextHeight * 0.02);
                    const textHeight = textAreaHeight - bottomPadding;
                    const textAreaY = chineseTextHeight / 2 - bottomPadding - textHeight / 2;

                    // 🔥 [v80.0] 字體大小 0.5 倍 - 移除 12px 最小值限制，防止文字超出灰框
                    const chineseText = this.add.text(0, textAreaY, pair.answer, {
                        fontSize: `${Math.max(6, chineseActualFontSize * 0.5)}px`,
                        color: '#000000',
                        fontFamily: 'Arial',
                        fontStyle: 'bold',
                        align: 'center',
                        wordWrap: { width: frameWidth - 10 }
                    });
                    chineseText.setOrigin(0.5, 0.5);
                    labelContainer.add(chineseText);
                } else if (hasChineseImage && !hasChineseText) {
                    // 🔥 [v76.0] 情況 2：只有圖片
                    console.log(`🖼️ [v76.0] 下方區域 [${i}] 只有圖片模式`);

                    // 圖片置中顯示
                    const squareSize = Math.min(frameWidth - 10 - 4, chineseTextHeight - 4);
                    this.loadAndDisplayImage(labelContainer, pair.chineseImageUrl, 0, 0, squareSize, `chinese-${pair.id}`).catch(error => {
                        console.error(`❌ [v76.0] 下方區域圖片載入失敗 [${i}]:`, error);
                    });
                } else if (!hasChineseImage && hasChineseText) {
                    // 🔥 [v76.0] 情況 3：只有文字
                    console.log(`📝 [v76.0] 下方區域 [${i}] 只有文字模式`);

                    const chineseActualFontSize = chineseFontSizesArray[i];

                    // 🔥 [v80.0] 文字置中顯示 - 字體大小 0.5 倍，移除最小值限制
                    const chineseText = this.add.text(0, 0, pair.answer, {
                        fontSize: `${Math.max(6, chineseActualFontSize * 0.5)}px`,
                        color: '#000000',
                        fontFamily: 'Arial',
                        fontStyle: 'bold',
                        align: 'center',
                        wordWrap: { width: frameWidth - 10 }
                    });
                    chineseText.setOrigin(0.5, 0.5);
                    labelContainer.add(chineseText);
                }

                labelContainer.setDepth(0);
            }

            // 保存框的數據
            frameContainer.setData('pairId', pair.id);  // 正確的配對 ID
            frameContainer.setData('text', pair.answer);  // 中文文字
            frameContainer.setData('frameIndex', i);  // 框的索引
            frameContainer.setData('currentCardPairId', null);  // 當前框內的英文卡片的 pairId
            frameContainer.setDepth(0);

            chineseFrames.push(frameContainer);
            this.rightCards.push(frameContainer);
        });

        // 🔥 第二步：創建英文卡片（初始隨機放在框內）
        // 根據隨機模式決定英文卡片的初始位置
        let shuffledPairs;

        // 🔥 v54.0: 檢查是否有緩存的洗牌順序（用於 resize 時保持卡片順序）
        console.log('🔍 [v54.0] 緩存檢查:', {
            hasCache: !!this.shuffledPairsCache,
            cacheLength: this.shuffledPairsCache?.length,
            currentPageLength: currentPagePairs.length,
            cacheIds: this.shuffledPairsCache?.map(p => p.id).join(',')
        });

        if (this.shuffledPairsCache && this.shuffledPairsCache.length === currentPagePairs.length) {
            // 使用緩存的洗牌順序
            shuffledPairs = this.shuffledPairsCache;
            console.log('🎲 [v54.0] 混合佈局使用緩存的洗牌順序（resize 時保持卡片順序）');
        } else if (this.random === 'same') {
            // 固定隨機模式
            const urlParams = new URLSearchParams(window.location.search);
            const activityId = urlParams.get('activityId') || 'default-seed';
            const seed = activityId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

            const rng = new Phaser.Math.RandomDataGenerator([seed.toString()]);
            shuffledPairs = rng.shuffle([...currentPagePairs]);
            console.log('🎲 混合佈局使用固定隨機模式，種子:', seed);

            // 🔥 v54.0: 保存洗牌順序到緩存
            this.shuffledPairsCache = shuffledPairs;
            console.log('🎲 [v54.0] 已保存洗牌順序到緩存');
        } else {
            // 🔥 v52.0：使用 Fisher-Yates 算法實現真正的隨機排列
            shuffledPairs = [...currentPagePairs];
            for (let i = shuffledPairs.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledPairs[i], shuffledPairs[j]] = [shuffledPairs[j], shuffledPairs[i]];
            }
            console.log('🎲 混合佈局使用隨機排列模式（Fisher-Yates 算法）');

            // 🔥 v54.0: 保存洗牌順序到緩存
            this.shuffledPairsCache = shuffledPairs;
            console.log('🎲 [v54.0] 已保存洗牌順序到緩存');
        }

        // 創建英文卡片並放在中文文字上方
        shuffledPairs.forEach((pair, i) => {
            const frame = chineseFrames[i];
            const frameX = frame.x;
            const frameY = frame.y;

            // 🔥 英文卡片位置（在中文文字上方）
            const cardY = frameY;  // 與中文文字容器同一位置（英文卡片會在上方）

            const animationDelay = i * 100;  // 每個卡片延遲 100ms

            // 🔥 檢查英文內容是否為空 - 如果為空，跳過創建英文卡片
            if (!pair.question || pair.question.trim() === '') {
                console.log(`⏭️ 跳過空白英文卡片 [${i}]: 英文內容為空`);
                // 更新框的數據，但不創建卡片
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
        });

        console.log('✅ 混合佈局創建完成:', {
            chineseFrames: chineseFrames.length,
            leftCards: this.leftCards.length,
            rightCards: this.rightCards.length
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

    createLeftCard(x, y, width, height, text, pairId, animationDelay = 0, imageUrl = null, audioUrl = null) {
        // 創建卡片容器
        // 🔥 v17.0：修復容器位置計算
        // 在 Phaser 3 中，容器不支持 setOrigin，所以需要調整容器內部元素的位置
        // 容器的位置是基於其子元素的位置，所以我們需要將所有子元素相對於容器中心定位
        const container = this.add.container(x, y);
        container.setSize(width, height);
        container.setDepth(5);

        // 🔥 設置初始透明度為 0（隱藏）
        container.setAlpha(0);

        // 創建卡片背景（白色）
        const background = this.add.rectangle(0, 0, width, height, 0xffffff);
        background.setStrokeStyle(2, 0x333333);

        // 🔥 聲明變量（在分支外部）
        let cardText;
        let audioButton;

        // 🔥 檢查內容組合
        const pairData = this.pairs.find(pair => pair.id === pairId);
        const hasImage = imageUrl && imageUrl.trim() !== '';
        const hasText = text && text.trim() !== '' && text.trim() !== '<br>';
        const audioStatus = pairData ? pairData.audioStatus : (audioUrl ? 'available' : 'missing');
        const hasAudio = audioStatus === 'available';
        const safeAudioUrl = hasAudio ? audioUrl : null;

        // 🔥 調試日誌 - 查看實際數據內容
        console.log('🔍 createLeftCard 調試信息:', {
            pairId,
            text: text,
            textType: typeof text,
            textLength: text ? text.length : 'null/undefined',
            hasText: hasText,
            hasImage: hasImage,
            audioStatus: audioStatus,
            imageUrl: imageUrl,
            audioUrl: safeAudioUrl,
            invalidAudioUrl: pairData ? pairData.invalidAudioUrl : null
        });

        // 🔥 根據內容組合決定佈局
        // 情況 A：圖片 + 文字 + 語音（1,1,1）
        // 情況 B：只有語音（0,0,1）
        // 情況 C：只有文字（0,1,0）
        // 情況 D：圖片 + 文字（1,1,0）
        // 情況 E：語音 + 文字（0,1,1）

        if (hasImage && hasText && hasAudio) {
            // 情況 A：圖片 + 文字 + 語音按鈕
            this.createCardLayoutA(container, background, width, height, text, imageUrl, safeAudioUrl, pairId);
        } else if (!hasImage && !hasText && hasAudio) {
            // 情況 B：只有語音按鈕
            this.createCardLayoutB(container, background, width, height, safeAudioUrl, pairId);
        } else if (!hasImage && hasText && !hasAudio) {
            // 情況 C：只有文字（已實現）
            this.createCardLayoutC(container, background, width, height, text);
        } else if (hasImage && hasText && !hasAudio) {
            // 情況 D：圖片 + 文字（已實現）
            this.createCardLayoutD(container, background, width, height, text, imageUrl, pairId);
        } else if (!hasImage && hasText && hasAudio) {
            // 情況 E：語音 + 文字
            this.createCardLayoutE(container, background, width, height, text, safeAudioUrl, pairId);
        } else if (hasImage && !hasText && !hasAudio) {
            // 只有圖片（無文字、無語音）- 1:1 比例顯示
            this.createCardLayoutF(container, background, width, height, imageUrl, pairId);
        } else if (hasImage && !hasText && hasAudio) {
            // 圖片 + 語音（無文字）
            this.createCardLayoutA(container, background, width, height, '', imageUrl, safeAudioUrl, pairId);
        } else {
            // 其他情況：只顯示背景
            container.add([background]);
        }

        // 🔥 已移除 "No audio" 標示（用戶要求）- 禁用音頻狀態徽章顯示
        // if (audioStatus && audioStatus !== 'available') {
        //     this.addAudioStatusBadge(container, width, height, audioStatus);
        // }

        // 📝 淡入動畫配置（按照順序出現）
        this.tweens.add({
            targets: container,
            alpha: 1,           // 從 0 淡入到 1（完全不透明）
            duration: 300,      // 動畫持續 300ms（0.3秒）
            delay: animationDelay,  // 延遲時間（用於順序出現效果）
            ease: 'Power2'      // 緩動函數（平滑加速）
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
            originalY: y,
            hasAudio: hasAudio,
            audioStatus: audioStatus,
            invalidAudioUrl: pairData ? pairData.invalidAudioUrl : null,
            isPlaying: false,
            clickStartTime: 0
        });

        // 🔥 點擊卡片播放音頻（短按時）
        container.on('pointerdown', (pointer) => {
            // 記錄點擊開始時間
            container.setData('clickStartTime', Date.now());
            console.log('🖱️ 卡片被點擊:', { pairId, hasAudio });
        });

        // 🔥 點擊結束時檢查是否是短按（播放音頻）
        container.on('pointerup', (pointer) => {
            const clickDuration = Date.now() - container.getData('clickStartTime');
            const isDragging = this.isDragging;

            // 如果點擊時間短於 200ms 且沒有拖曳，則播放音頻
            if (clickDuration < 200 && !isDragging && hasAudio && safeAudioUrl) {
                console.log('🔊 短按卡片，播放音頻:', { pairId, clickDuration });
                this.playAudio(safeAudioUrl, container, background);
            }
        });

        // 拖曳開始
        container.on('dragstart', (pointer) => {
            // 📝 調試訊息：記錄拖曳開始
            console.log('🖱️ 開始拖曳卡片:', {
                pairId: container.getData('pairId'),
                side: container.getData('side'),
                position: { x: container.x, y: container.y },
                isMatched: container.getData('isMatched')
            });

            // 允許已配對的卡片也可以拖動
            this.isDragging = true;
            this.dragStartCard = container;

            // 📝 卡片"飄浮"起來的視覺效果
            container.setDepth(100);   // 提升到最上層（深度值100）
            container.setScale(1.1);   // 稍微放大（110%）
            background.setAlpha(0.9);  // 半透明（90%不透明度）
        });

        // 拖曳中 - 卡片跟隨鼠標
        container.on('drag', (pointer, dragX, dragY) => {
            if (!this.isDragging) {
                // 📝 調試訊息：拖曳狀態異常
                console.log('⚠️ 拖曳狀態異常：isDragging = false');
                return;
            }

            // 移動整個卡片
            container.x = pointer.x;
            container.y = pointer.y;
        });

        // 拖曳結束
        container.on('dragend', (pointer) => {
            // 📝 調試訊息：記錄拖曳結束
            console.log('🖱️ 結束拖曳:', {
                pairId: container.getData('pairId'),
                finalPosition: { x: pointer.x, y: pointer.y },
                layout: this.layout
            });

            this.isDragging = false;

            // 🔥 混合模式：只檢查拖放到中文框
            if (this.layout === 'mixed') {
                console.log('🔄 混合模式：檢查拖放到中文框');
                const dropped = this.checkDrop(pointer, container);
                console.log('📊 拖放結果:', dropped ? '成功' : '失敗');
                // checkDrop 會處理所有邏輯（交換或返回原位）
            } else {
                console.log('🔄 分離模式：檢查拖放邏輯');
                // 分離模式：檢查是否拖回左側區域（取消配對）
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
            }

            this.dragStartCard = null;
        });

        // 啟用拖曳
        this.input.setDraggable(container);

        return container;
    }

    // 🔥 佈局函數 - 情況 A：語音按鈕（上 30%）+ 圖片（中 40%）+ 文字（下 30%）
    createCardLayoutA(container, background, width, height, text, imageUrl, audioUrl, pairId) {
        console.log('🎨 佈局 A: 語音按鈕 + 圖片 + 文字', {
            width,
            height,
            pairId,
            hasText: !!text,
            hasAudioUrl: !!audioUrl,
            audioUrl: audioUrl ? audioUrl.substring(0, 50) + '...' : 'null'
        });

        // 🔥 首先添加背景（最底層）
        container.add([background]);

        // 1️⃣ 語音按鈕區域（上方 30%）
        const buttonAreaHeight = height * 0.3;
        const buttonAreaY = -height / 2 + buttonAreaHeight / 2;
        const buttonSize = Math.max(20, Math.min(40, buttonAreaHeight * 0.6));  // 🔥 減小按鈕大小，確保在框內

        console.log('🔊 準備調用 createAudioButton:', {
            audioUrl: audioUrl ? '有' : '無',
            buttonAreaY,
            buttonSize
        });

        this.createAudioButton(container, audioUrl, 0, buttonAreaY, buttonSize, pairId);

        console.log('✅ createAudioButton 調用完成');

        // 2️⃣ 圖片區域（中間 40%）
        const imageAreaHeight = height * 0.4;
        const imageAreaY = -height / 2 + buttonAreaHeight + imageAreaHeight / 2;
        const squareSize = Math.min(width - 4, imageAreaHeight - 4);
        // ✅ v44.0：添加錯誤處理
        // 🔥 [v68.0] 修復：使用 english-${pairId} 作為 imageKey，避免與中文圖片衝突
        this.loadAndDisplayImage(container, imageUrl, 0, imageAreaY, squareSize, `english-${pairId}`).catch(error => {
            console.error('❌ 圖片載入失敗 (佈局 A):', error);
        });

        // 3️⃣ 文字區域（下方 30%，需要留出底部間距）
        const textAreaHeight = height * 0.3;
        const bottomPadding = Math.max(6, height * 0.06);  // 底部間距：6px 或高度的 6%
        const textHeight = textAreaHeight - bottomPadding;
        // 🔥 文字位置：卡片下邊界 - 底部間距 - 文字高度/2
        const textAreaY = height / 2 - bottomPadding - textHeight / 2;

        // 🔥 只有有效文字才創建
        if (text && text.trim() !== '' && text.trim() !== '<br>') {
            console.log('📝 創建文字（佈局 A）:', {
                text,
                textAreaY,
                textHeight,
                bottomPadding,
                cardHeight: height,
                formula: `textAreaY = ${height / 2} - ${bottomPadding} - ${textHeight / 2} = ${textAreaY}`
            });
            this.createTextElement(container, text, 0, textAreaY, width, textHeight);
        } else {
            console.log('⏭️ 跳過空白文字');
        }
    }

    // 🔥 佈局函數 - 情況 B：只有語音按鈕
    createCardLayoutB(container, background, width, height, audioUrl, pairId) {
        // 🔥 首先添加背景（最底層）
        container.add([background]);

        // 語音按鈕置中並放大
        const buttonSize = Math.max(50, Math.min(80, width * 0.6));
        this.createAudioButton(container, audioUrl, 0, 0, buttonSize, pairId);
    }

    // 🔥 佈局函數 - 情況 C：只有文字
    createCardLayoutC(container, background, width, height, text) {
        // 🔥 首先添加背景（最底層）
        container.add([background]);

        // 文字置中
        this.createTextElement(container, text, 0, 0, width, height);
    }

    // 🔥 佈局函數 - 情況 D：圖片 + 文字（各佔 50%，文字有底部間距）
    createCardLayoutD(container, background, width, height, text, imageUrl, pairId) {
        console.log('🎨 佈局 D: 圖片 + 文字 (各 50%，智能間距)', {
            width,
            height,
            pairId,
            hasText: !!text,
            imageUrl: imageUrl ? imageUrl.substring(0, 50) + '...' : 'null'
        });

        // 🔥 首先添加背景（最底層）
        container.add([background]);

        // 圖片區域：佔據卡片上方 50%
        const imageHeight = height * 0.5;
        const imageY = -height / 2 + imageHeight / 2;

        // 🔥 文字區域：佔據卡片下方 50%，但需要留出底部間距
        const textAreaHeight = height * 0.5;
        const bottomPadding = Math.max(8, height * 0.08);  // 底部間距：8px 或高度的 8%
        const textHeight = textAreaHeight - bottomPadding;
        // 🔥 文字位置：卡片下邊界 - 底部間距 - 文字高度/2
        const textY = height / 2 - bottomPadding - textHeight / 2;

        console.log('📐 佈局 D 尺寸計算:', {
            imageHeight,
            textAreaHeight,
            bottomPadding,
            textHeight,
            textY,
            cardHeight: height,
            formula: `textY = ${height / 2} - ${bottomPadding} - ${textHeight / 2} = ${textY}`
        });

        // 計算正方形圖片的尺寸（1:1 比例）
        const squareSize = Math.min(width - 4, imageHeight - 4);

        // 創建圖片
        // ✅ v44.0：添加錯誤處理
        // 🔥 [v68.0] 修復：使用 english-${pairId} 作為 imageKey，避免與中文圖片衝突
        this.loadAndDisplayImage(container, imageUrl, 0, imageY, squareSize, `english-${pairId}`).catch(error => {
            console.error('❌ 圖片載入失敗 (佈局 B):', error);
        });

        // 創建文字（如果有）
        if (text && text.trim() !== '' && text.trim() !== '<br>') {
            this.createTextElement(container, text, 0, textY, width, textHeight);
        }
    }

    // 🔥 佈局函數 - 情況 E：語音 + 文字（文字有底部間距）
    createCardLayoutE(container, background, width, height, text, audioUrl, pairId) {
        // 🔥 首先添加背景（最底層）
        container.add([background]);

        // 語音按鈕在上方
        const buttonSize = Math.max(30, Math.min(50, width * 0.25));
        const buttonY = -height / 2 + buttonSize / 2 + 10;
        this.createAudioButton(container, audioUrl, 0, buttonY, buttonSize, pairId);

        // 🔥 文字在下方，需要留出底部間距
        const textAreaHeight = height * 0.4;
        const bottomPadding = Math.max(6, height * 0.06);  // 底部間距：6px 或高度的 6%
        const textHeight = textAreaHeight - bottomPadding;
        // 🔥 文字位置：卡片下邊界 - 底部間距 - 文字高度/2
        const textY = height / 2 - bottomPadding - textHeight / 2;

        console.log('📝 創建文字（佈局 E）:', {
            text,
            textY,
            textHeight,
            bottomPadding,
            cardHeight: height,
            formula: `textY = ${height / 2} - ${bottomPadding} - ${textHeight / 2} = ${textY}`
        });

        this.createTextElement(container, text, 0, textY, width, textHeight);
    }

    // 🔥 佈局函數 - 情況 F：只有圖片（1:1 比例）
    createCardLayoutF(container, background, width, height, imageUrl, pairId) {
        console.log('🎨 佈局 F: 只有圖片 (1:1 比例)', {
            width,
            height,
            pairId,
            imageUrl: imageUrl ? imageUrl.substring(0, 50) + '...' : 'null'
        });

        // 🔥 首先添加背景（最底層）
        container.add([background]);

        // 計算正方形圖片的尺寸（取寬度和高度的最小值，保持 1:1）
        const squareSize = Math.min(width - 4, height - 4);

        // 圖片置中顯示
        // ✅ v44.0：添加錯誤處理
        // 🔥 [v68.0] 修復：使用 english-${pairId} 作為 imageKey，避免與中文圖片衝突
        this.loadAndDisplayImage(container, imageUrl, 0, 0, squareSize, `english-${pairId}`).catch(error => {
            console.error('❌ 圖片載入失敗 (佈局 F):', error);
        });
    }

    // 🔥 佈局函數 - 圖片 + 語音（無文字）
    createCardLayoutImageAudio(container, background, width, height, imageUrl, audioUrl, pairId) {
        // 🔥 首先添加背景（最底層）
        container.add([background]);

        // 圖片佔據大部分區域
        const imageHeight = height * 0.8;
        const imageY = -height / 2 + imageHeight / 2;

        // 計算正方形圖片的尺寸
        const squareSize = Math.min(width - 4, imageHeight - 4);

        // 創建圖片
        // ✅ v44.0：添加錯誤處理
        // 🔥 [v68.0] 修復：使用 english-${pairId} 作為 imageKey，避免與中文圖片衝突
        this.loadAndDisplayImage(container, imageUrl, 0, imageY, squareSize, `english-${pairId}`).catch(error => {
            console.error('❌ 圖片載入失敗 (佈局 ImageAudio):', error);
        });

        // 創建語音按鈕（下方）
        const buttonSize = Math.max(30, Math.min(50, width * 0.2));
        const buttonY = height / 2 - buttonSize / 2 - 5;
        this.createAudioButton(container, audioUrl, 0, buttonY, buttonSize, pairId);
    }

    // 🔥 輔助函數 - 載入並顯示圖片
    // ✅ v44.0：修復圖片載入失敗 - 使用 Fetch API 直接載入圖片
    loadAndDisplayImage(container, imageUrl, x, y, size, pairId) {
        const imageKey = `card-image-${pairId}`;

        if (!this.textures.exists(imageKey)) {
            // ✅ v44.0：使用 Fetch API 直接載入圖片，避免 Phaser 加載器問題
            return new Promise((resolve, reject) => {
                fetch(imageUrl)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        return response.blob();
                    })
                    .then(blob => {
                        // 將 Blob 轉換為 Object URL
                        const objectUrl = URL.createObjectURL(blob);

                        // 使用 Phaser 的紋理管理器直接添加圖片
                        const image = new Image();
                        image.onload = () => {
                            // 將圖片添加到 Phaser 的紋理管理器
                            this.textures.addImage(imageKey, image);

                            // 🔥 [v67.0] 修復：先創建圖片，再添加到容器
                            // 這樣圖片會使用容器的坐標系，而不是場景坐標系
                            const cardImage = this.add.image(0, 0, imageKey);
                            cardImage.setDisplaySize(size, size);
                            cardImage.setOrigin(0.5);

                            // 🔥 [v67.0] 設置圖片在容器中的位置
                            cardImage.setPosition(x, y);

                            // 🔥 [v67.0] 添加到容器
                            container.add(cardImage);

                            console.log(`✅ 圖片載入完成: ${imageKey}`);
                            resolve();
                        };

                        image.onerror = () => {
                            console.warn(`⚠️ 圖片載入失敗: ${imageKey}`, imageUrl);
                            reject(new Error(`Failed to load image: ${imageKey}`));
                        };

                        image.src = objectUrl;
                    })
                    .catch(error => {
                        console.warn(`⚠️ 圖片載入失敗: ${imageKey}`, imageUrl, error);
                        reject(error);
                    });
            });
        } else {
            // 如果已經載入過，直接使用
            const cardImage = this.add.image(x, y, imageKey);
            cardImage.setDisplaySize(size, size);
            cardImage.setOrigin(0.5);
            container.add(cardImage);
            return Promise.resolve();
        }
    }

    // 🔥 輔助函數 - 創建文字元素（智能計算寬度和高度）
    createTextElement(container, text, x, y, width, height) {
        // 🔥 調試日誌 - 確認函數被調用
        console.log('📝 createTextElement 被調用:', {
            text: text,
            textType: typeof text,
            textLength: text ? text.length : 'null/undefined',
            x, y, width, height,
            containerExists: !!container
        });

        // 🔥 初始字體大小（基於高度的 60%）
        let fontSize = Math.max(14, Math.min(48, height * 0.6));

        // 創建臨時文字測量寬度和高度
        const tempText = this.add.text(0, 0, text, {
            fontSize: `${fontSize}px`,
            fontFamily: 'Arial'
        });

        // 🔥 計算最大寬度（留 15% 邊距）
        const maxTextWidth = width * 0.85;

        // 🔥 計算最大高度（留 10% 邊距）
        const maxTextHeight = height * 0.9;

        // 🔥 同時檢查寬度和高度，如果超過則縮小字體
        while ((tempText.width > maxTextWidth || tempText.height > maxTextHeight) && fontSize > 12) {
            fontSize -= 2;
            tempText.setFontSize(fontSize);
        }

        // 🔥 記錄最終的文字尺寸
        const finalTextWidth = tempText.width;
        const finalTextHeight = tempText.height;

        tempText.destroy();

        // 創建最終文字
        const cardText = this.add.text(x, y, text, {
            fontSize: `${fontSize}px`,
            color: '#333333',
            fontFamily: 'Arial',
            fontStyle: 'normal'
        });
        cardText.setOrigin(0.5);
        container.add(cardText);

        // 🔥 調試日誌 - 確認文字對象創建和尺寸
        console.log('✅ 文字對象已創建（智能計算）:', {
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
    generateMissingAudioUrlsInBackground() {
        // ✅ v44.0：檢查聲音是否啟用
        if (!this.audioEnabled) {
            console.log('🔇 [後台] 聲音已禁用，跳過音頻生成');
            return;
        }

        console.log('🎵 [後台] 開始檢查並生成缺失的音頻...');

        const missingAudioPairs = this.pairs.filter(pair => !pair.audioUrl);

        if (missingAudioPairs.length === 0) {
            console.log('✅ [後台] 所有詞彙都有音頻，無需生成');
            return;
        }

        console.log(`⏳ [後台] 發現 ${missingAudioPairs.length} 個缺失音頻的詞彙，在後台生成...`);

        // 🔥 使用 Promise 在後台執行，不等待結果
        this.generateMissingAudioUrlsAsync(missingAudioPairs).catch(error => {
            console.error('❌ [後台] 生成缺失音頻時出錯:', error);
        });
    }

    // 🔥 輔助函數 - 異步生成缺失的音頻
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
                        pair.audioUrl = data.audioUrl;
                        console.log(`✅ [後台] 生成音頻: ${pair.english}`);
                    } else {
                        console.warn(`⚠️ [後台] 生成音頻失敗: ${pair.english} (${response.status})`);
                    }
                } catch (error) {
                    console.error(`❌ [後台] 生成音頻異常: ${pair.english}`, error);
                }

                // 避免 API 限制，每個請求之間等待 200ms
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            console.log('✅ [後台] 音頻生成完成');
        } catch (error) {
            console.error('❌ [後台] 生成缺失音頻時出錯:', error);
        }
    }

    // 🔥 輔助函數 - 創建語音按鈕
    createAudioButton(container, audioUrl, x, y, size, pairId) {
        console.log('🔊 創建語音按鈕:', { x, y, size, audioUrl: audioUrl ? '有' : '無', pairId });

        // 🔥 創建按鈕背景（相對於 buttonContainer 的座標為 0, 0）
        const buttonBg = this.add.rectangle(0, 0, size, size, 0x4CAF50);
        buttonBg.setStrokeStyle(2, 0x2E7D32);
        buttonBg.setOrigin(0.5);

        // 🔥 創建喇叭圖標（相對於 buttonContainer 的座標為 0, 0）
        const speakerIcon = this.add.text(0, 0, '🔊', {
            fontSize: `${size * 0.6}px`,
            fontFamily: 'Arial'
        });
        speakerIcon.setOrigin(0.5);

        // 🔥 創建按鈕容器（使用相對於父容器的座標 x, y）
        const buttonContainer = this.add.container(0, 0, [buttonBg, speakerIcon]);
        buttonContainer.setSize(size, size);
        buttonContainer.setInteractive({ useHandCursor: true });

        // 🔥 設置按鈕容器的位置（相對於父容器）
        buttonContainer.setPosition(x, y);

        // 儲存音頻 URL
        buttonContainer.setData('audioUrl', audioUrl);
        buttonContainer.setData('isPlaying', false);
        buttonContainer.setData('pairId', pairId);

        // 點擊事件
        buttonContainer.on('pointerdown', (pointer, localX, localY, event) => {
            console.log('🖱️ 語音按鈕被點擊:', { pairId, audioUrl });
            // 🔥 阻止事件冒泡，避免觸發卡片拖曳
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
        container.add(buttonContainer);

        console.log('✅ 語音按鈕已添加到容器:', {
            buttonPosition: { x: buttonContainer.x, y: buttonContainer.y },
            containerPosition: { x: container.x, y: container.y }
        });

        return buttonContainer;
    }

    // 🔥 輔助函數 - 播放音頻（使用 HTML5 Audio API）
    playAudio(audioUrl, buttonContainer, buttonBg) {
        if (!audioUrl || audioUrl.trim() === '') {
            console.warn('⚠️ 音頻 URL 為空');
            return;
        }

        // ✅ v44.0：檢查聲音是否啟用
        if (!this.audioEnabled) {
            console.log('🔇 聲音已禁用，無法播放音頻');
            return;
        }

        // 防止重複點擊
        if (buttonContainer.getData('isPlaying')) {
            console.log('🔊 音頻正在播放中，忽略重複點擊');
            return;
        }

        console.log('🔊 準備播放音頻:', { audioUrl, volume: this.audioVolume });

        try {
            // 更新按鈕狀態為載入中
            buttonContainer.setData('isPlaying', true);
            buttonBg.setFillStyle(0xFFC107);  // 黃色表示載入中

            // 使用 HTML5 Audio API 直接播放
            const audio = new Audio(audioUrl);
            // ✅ v44.0：使用遊戲設置的音量
            audio.volume = Math.max(0, Math.min(1, this.audioVolume / 100));

            // 音頻可以播放時
            audio.addEventListener('canplay', () => {
                console.log('✅ 音頻已準備好，開始播放:', audioUrl);
                buttonBg.setFillStyle(0xFF9800);  // 橙色表示播放中
                audio.play().catch(error => {
                    console.error('❌ 音頻播放失敗:', error);
                    buttonContainer.setData('isPlaying', false);
                    buttonBg.setFillStyle(0xF44336);  // 紅色表示錯誤
                });
            });

            // 音頻播放完成
            audio.addEventListener('ended', () => {
                console.log('✅ 音頻播放完成:', audioUrl);
                buttonContainer.setData('isPlaying', false);
                buttonBg.setFillStyle(0x4CAF50);
            });

            // 音頻載入失敗
            audio.addEventListener('error', (error) => {
                console.error('❌ 音頻載入失敗:', error);
                buttonContainer.setData('isPlaying', false);
                buttonBg.setFillStyle(0xF44336);  // 紅色表示錯誤
            });

            // 開始載入音頻
            audio.load();

        } catch (error) {
            console.error('❌ 播放音頻時發生異常:', error);
            buttonContainer.setData('isPlaying', false);
            buttonBg.setFillStyle(0xF44336);  // 紅色表示錯誤
        }
    }

    createRightCard(x, y, width, height, text, pairId, imageUrl = null, audioUrl = null, textPosition = 'bottom') {
        // 🔥 [v65.0] 改進右側卡片 - 參考英文卡片實現
        console.log('🎨 [v65.0] createRightCard 被調用:', {
            pairId,
            hasText: !!text && text.trim() !== '',
            hasImage: !!imageUrl && imageUrl.trim() !== '',
            hasAudio: !!audioUrl && audioUrl.trim() !== '',
            textPosition
        });

        // 創建卡片容器
        const container = this.add.container(x, y);
        container.setDepth(5);

        // 🔥 [v65.0] 設置初始透明度為 0（隱藏），用於淡入動畫
        container.setAlpha(0);

        // 🔥 創建白色框（內框）
        const background = this.add.rectangle(0, 0, width, height, 0xffffff);
        background.setStrokeStyle(2, 0x333333);
        background.setDepth(1);

        // 🔥 [v65.0] 查找 pairData 以獲取音頻狀態（參考英文卡片）
        const pairData = this.pairs.find(pair => pair.id === pairId);
        const audioStatus = pairData ? pairData.audioStatus : (audioUrl ? 'available' : 'missing');
        const hasAudio = audioStatus === 'available';
        const safeAudioUrl = hasAudio ? audioUrl : null;

        // 🔥 [v62.0] 檢查內容組合
        const hasImage = imageUrl && imageUrl.trim() !== '';
        const hasText = text && text.trim() !== '' && text.trim() !== '<br>';

        console.log('🔍 [v65.0] 右側卡片內容檢查:', {
            pairId,
            hasImage,
            hasText,
            hasAudio,
            audioStatus,
            combination: `${hasImage ? 'I' : '-'}${hasText ? 'T' : '-'}${hasAudio ? 'A' : '-'}`
        });

        // 🔥 [v62.0] 根據內容組合決定佈局
        if (hasImage && hasText && hasAudio) {
            // 情況 A：圖片 + 文字 + 語音
            this.createRightCardLayoutA(container, background, width, height, text, imageUrl, safeAudioUrl, pairId);
        } else if (hasImage && hasText && !hasAudio) {
            // 情況 D：圖片 + 文字
            this.createRightCardLayoutD(container, background, width, height, text, imageUrl, pairId);
        } else if (hasImage && !hasText && hasAudio) {
            // 圖片 + 語音（無文字）
            this.createRightCardLayoutImageAudio(container, background, width, height, imageUrl, safeAudioUrl, pairId);
        } else if (hasImage && !hasText && !hasAudio) {
            // 情況 F：只有圖片
            this.createRightCardLayoutF(container, background, width, height, imageUrl, pairId);
        } else if (!hasImage && hasText && hasAudio) {
            // 情況 E：文字 + 語音
            this.createRightCardLayoutE(container, background, width, height, text, safeAudioUrl, pairId);
        } else if (!hasImage && !hasText && hasAudio) {
            // 情況 B：只有語音
            this.createRightCardLayoutB(container, background, width, height, safeAudioUrl, pairId);
        } else {
            // 情況 C：只有文字（現有邏輯）
            this.createRightCardLayoutC(container, background, width, height, text, textPosition);
        }

        // 🔥 [v65.0] 添加淡入動畫（參考英文卡片）
        this.tweens.add({
            targets: container,
            alpha: 1,           // 從 0 淡入到 1（完全不透明）
            duration: 300,      // 動畫持續 300ms（0.3秒）
            ease: 'Power2'      // 緩動函數（平滑加速）
        });

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
            isMatched: false
        });

        return container;
    }

    // 🔥 [v62.0] 右側卡片佈局函數 - 情況 C：只有文字
    createRightCardLayoutC(container, background, width, height, text, textPosition = 'bottom') {
        console.log('🎨 [v62.0] 右側卡片佈局 C: 只有文字', {
            width,
            height,
            text,
            textPosition
        });

        // 🔥 首先添加背景（最底層）
        container.add([background]);

        // 🔥 創建文字標籤（動態字體大小，根據文字長度和內框寬度調整）
        const textLength = text.length;
        let baseFontSize = Math.max(24, Math.min(48, height * 0.6));

        // 🔥 根據文字長度調整字體大小
        let fontSize;
        if (textLength <= 4) {
            fontSize = baseFontSize * 0.8;  // 1-4 個字：縮小 20%
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
        container.add(cardText);
    }

    // 🔥 [v62.0] 右側卡片佈局函數 - 情況 A：圖片 + 文字 + 語音
    createRightCardLayoutA(container, background, width, height, text, imageUrl, audioUrl, pairId) {
        console.log('🎨 [v62.0] 右側卡片佈局 A: 圖片 + 文字 + 語音', {
            width,
            height,
            pairId,
            hasText: !!text,
            hasAudioUrl: !!audioUrl
        });

        // 🔥 首先添加背景（最底層）
        container.add([background]);

        // 1️⃣ 語音按鈕區域（上方 30%）
        const buttonAreaHeight = height * 0.3;
        const buttonAreaY = -height / 2 + buttonAreaHeight / 2;
        const buttonSize = Math.max(20, Math.min(40, buttonAreaHeight * 0.6));

        this.createAudioButton(container, audioUrl, 0, buttonAreaY, buttonSize, pairId);

        // 2️⃣ 圖片區域（中間 40%）
        const imageAreaHeight = height * 0.4;
        const imageAreaY = -height / 2 + buttonAreaHeight + imageAreaHeight / 2;
        const squareSize = Math.min(width - 4, imageAreaHeight - 4);

        // 🔥 [v68.0] 修復：使用 chinese-${pairId} 作為 imageKey，避免與英文圖片衝突
        this.loadAndDisplayImage(container, imageUrl, 0, imageAreaY, squareSize, `chinese-${pairId}`).catch(error => {
            console.error('❌ 圖片載入失敗 (右側佈局 A):', error);
        });

        // 3️⃣ 文字區域（下方 30%）
        if (text && text.trim() !== '' && text.trim() !== '<br>') {
            const textAreaHeight = height * 0.3;
            const bottomPadding = Math.max(6, height * 0.06);
            const textHeight = textAreaHeight - bottomPadding;
            const textAreaY = height / 2 - bottomPadding - textHeight / 2;

            this.createTextElement(container, text, 0, textAreaY, width, textHeight);
        }
    }

    // 🔥 [v62.0] 右側卡片佈局函數 - 情況 B：只有語音
    createRightCardLayoutB(container, background, width, height, audioUrl, pairId) {
        console.log('🎨 [v62.0] 右側卡片佈局 B: 只有語音', {
            width,
            height,
            pairId,
            audioUrl: audioUrl ? '有' : '無'
        });

        // 🔥 首先添加背景（最底層）
        container.add([background]);

        // 語音按鈕置中
        const buttonSize = Math.max(40, Math.min(80, Math.min(width, height) * 0.6));
        this.createAudioButton(container, audioUrl, 0, 0, buttonSize, pairId);
    }

    // 🔥 [v62.0] 右側卡片佈局函數 - 情況 D：圖片 + 文字
    createRightCardLayoutD(container, background, width, height, text, imageUrl, pairId) {
        console.log('🎨 [v62.0] 右側卡片佈局 D: 圖片 + 文字', {
            width,
            height,
            pairId,
            hasText: !!text
        });

        // 🔥 首先添加背景（最底層）
        container.add([background]);

        // 圖片佔據上方 60%
        const imageAreaHeight = height * 0.6;
        const imageAreaY = -height / 2 + imageAreaHeight / 2;
        const squareSize = Math.min(width - 4, imageAreaHeight - 4);

        // 🔥 [v68.0] 修復：使用 chinese-${pairId} 作為 imageKey，避免與英文圖片衝突
        this.loadAndDisplayImage(container, imageUrl, 0, imageAreaY, squareSize, `chinese-${pairId}`).catch(error => {
            console.error('❌ 圖片載入失敗 (右側佈局 D):', error);
        });

        // 文字佔據下方 40%
        if (text && text.trim() !== '' && text.trim() !== '<br>') {
            const textAreaHeight = height * 0.4;
            const bottomPadding = Math.max(6, height * 0.06);
            const textHeight = textAreaHeight - bottomPadding;
            const textAreaY = height / 2 - bottomPadding - textHeight / 2;

            this.createTextElement(container, text, 0, textAreaY, width, textHeight);
        }
    }

    // 🔥 [v62.0] 右側卡片佈局函數 - 情況 E：文字 + 語音
    createRightCardLayoutE(container, background, width, height, text, audioUrl, pairId) {
        console.log('🎨 [v62.0] 右側卡片佈局 E: 文字 + 語音', {
            width,
            height,
            pairId,
            text
        });

        // 🔥 首先添加背景（最底層）
        container.add([background]);

        // 文字在上方 70%
        if (text && text.trim() !== '' && text.trim() !== '<br>') {
            const textAreaHeight = height * 0.7;
            const textHeight = textAreaHeight - 10;
            const textAreaY = -height / 2 + textAreaHeight / 2;

            this.createTextElement(container, text, 0, textAreaY, width, textHeight);
        }

        // 語音按鈕在下方 30%
        const buttonSize = Math.max(30, Math.min(50, width * 0.25));
        const buttonY = height / 2 - buttonSize / 2 - 5;
        this.createAudioButton(container, audioUrl, 0, buttonY, buttonSize, pairId);
    }

    // 🔥 [v62.0] 右側卡片佈局函數 - 情況 F：只有圖片
    createRightCardLayoutF(container, background, width, height, imageUrl, pairId) {
        console.log('🎨 [v62.0] 右側卡片佈局 F: 只有圖片 (1:1 比例)', {
            width,
            height,
            pairId,
            imageUrl: imageUrl ? imageUrl.substring(0, 50) + '...' : 'null'
        });

        // 🔥 首先添加背景（最底層）
        container.add([background]);

        // 計算正方形圖片的尺寸（取寬度和高度的最小值，保持 1:1）
        const squareSize = Math.min(width - 4, height - 4);

        // 圖片置中顯示
        // 🔥 [v68.0] 修復：使用 chinese-${pairId} 作為 imageKey，避免與英文圖片衝突
        this.loadAndDisplayImage(container, imageUrl, 0, 0, squareSize, `chinese-${pairId}`).catch(error => {
            console.error('❌ 圖片載入失敗 (右側佈局 F):', error);
        });
    }

    // 🔥 [v62.0] 右側卡片佈局函數 - 圖片 + 語音（無文字）
    createRightCardLayoutImageAudio(container, background, width, height, imageUrl, audioUrl, pairId) {
        console.log('🎨 [v62.0] 右側卡片佈局 ImageAudio: 圖片 + 語音', {
            width,
            height,
            pairId
        });

        // 🔥 首先添加背景（最底層）
        container.add([background]);

        // 圖片佔據大部分區域
        const imageHeight = height * 0.8;
        const imageY = -height / 2 + imageHeight / 2;

        // 計算正方形圖片的尺寸
        const squareSize = Math.min(width - 4, imageHeight - 4);

        // 創建圖片
        // 🔥 [v68.0] 修復：使用 chinese-${pairId} 作為 imageKey，避免與英文圖片衝突
        this.loadAndDisplayImage(container, imageUrl, 0, imageY, squareSize, `chinese-${pairId}`).catch(error => {
            console.error('❌ 圖片載入失敗 (右側佈局 ImageAudio):', error);
        });

        // 創建語音按鈕（下方）
        const buttonSize = Math.max(30, Math.min(50, width * 0.2));
        const buttonY = height / 2 - buttonSize / 2 - 5;
        this.createAudioButton(container, audioUrl, 0, buttonY, buttonSize, pairId);
    }

    checkSwap(pointer, draggedCard) {
        // 📝 調試訊息：記錄交換檢查開始
        console.log('🔄 檢查卡片交換:', {
            draggedCardId: draggedCard?.getData('pairId'),
            pointerPosition: { x: pointer.x, y: pointer.y }
        });

        if (!draggedCard) {
            console.log('⚠️ 沒有拖曳的卡片');
            return false;
        }

        // 檢查指針是否在其他左側卡片上
        let targetCard = null;

        for (const card of this.leftCards) {
            // 跳過自己和已配對的卡片
            if (card === draggedCard || card.getData('isMatched')) continue;

            const bounds = card.getBounds();
            if (bounds.contains(pointer.x, pointer.y)) {
                targetCard = card;
                console.log('✅ 找到目標卡片:', card.getData('pairId'));
                break;
            }
        }

        if (targetCard) {
            console.log('🔄 執行卡片交換:', {
                card1: draggedCard.getData('pairId'),
                card2: targetCard.getData('pairId')
            });
            // 交換兩張卡片的位置
            this.swapCards(draggedCard, targetCard);
            return true;
        }

        console.log('❌ 沒有找到目標卡片');
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
        // 📝 調試訊息：記錄拖放檢查開始
        console.log('🎯 檢查拖放:', {
            draggedCardId: draggedCard?.getData('pairId'),
            layout: this.layout,
            pointerPosition: { x: pointer.x, y: pointer.y }
        });

        if (!draggedCard) {
            console.log('⚠️ 沒有拖曳的卡片');
            return false;
        }

        // 🔥 混合模式：檢查是否拖曳到另一個中文框
        if (this.layout === 'mixed') {
            console.log('🔄 使用混合模式拖放邏輯');
            return this.checkMixedModeDrop(pointer, draggedCard);
        }

        // 分離模式：檢查指針是否在任何右側卡片上
        let targetCard = null;

        for (const card of this.rightCards) {
            if (card.getData('isMatched')) continue;  // 跳過已配對的卡片

            const bounds = card.getBounds();
            if (bounds.contains(pointer.x, pointer.y)) {
                targetCard = card;
                console.log('✅ 找到目標卡片:', card.getData('pairId'));
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
        }

        console.log('❌ 沒有找到目標卡片');
        return false;
    }

    // 🔥 混合模式：檢查拖放到其他英文卡片（交換位置）
    checkMixedModeDrop(pointer, draggedCard) {
        // 📝 調試訊息：記錄混合模式拖放檢查開始
        console.log('🔄 混合模式拖放檢查:', {
            draggedCardId: draggedCard.getData('pairId'),
            pointerPosition: { x: pointer.x, y: pointer.y }
        });

        // 找到拖曳到的目標英文卡片
        let targetCard = null;

        for (const card of this.leftCards) {
            if (card === draggedCard) continue;  // 跳過自己

            const bounds = card.getBounds();
            // 📝 擴大檢測範圍，包括卡片下方的中文文字區域
            // 原因：中文文字在卡片下方，用戶可能拖放到中文文字上
            // 擴大範圍：高度 + 50px（中文文字區域的高度）
            const expandedBounds = new Phaser.Geom.Rectangle(
                bounds.x,
                bounds.y,
                bounds.width,
                bounds.height + 50  // 擴大50px，包括中文文字區域
            );

            if (expandedBounds.contains(pointer.x, pointer.y)) {
                targetCard = card;
                console.log('✅ 找到目標卡片（擴展範圍）:', {
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

        // 獲取兩個卡片的框索引
        const targetFrameIndex = targetCard.getData('currentFrameIndex');
        const currentFrameIndex = draggedCard.getData('currentFrameIndex');

        // 交換兩個英文卡片的位置
        this.swapMixedModeCards(draggedCard, targetCard, currentFrameIndex, targetFrameIndex);
        return true;
    }

    // 🔥 混合模式：交換兩個英文卡片的位置
    swapMixedModeCards(card1, card2, frame1Index, frame2Index) {
        console.log('🔄 混合模式：交換卡片', { frame1Index, frame2Index });

        // 獲取兩個框
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

        // 更新卡片的原始位置
        card1.setData('originalX', card2OriginalX);
        card1.setData('originalY', card2OriginalY);
        card2.setData('originalX', card1OriginalX);
        card2.setData('originalY', card1OriginalY);

        // 更新框的數據
        frame1.setData('currentCardPairId', card2.getData('pairId'));
        frame2.setData('currentCardPairId', card1.getData('pairId'));

        // 🔥 [v62.0] 在交換後檢查配對是否正確
        // 檢查 card1 是否與 frame2 配對正確
        const card1PairId = card1.getData('pairId');
        const frame2PairId = frame2.getData('pairId');
        if (card1PairId === frame2PairId) {
            console.log('✅ [v62.0] 混合模式配對正確（card1）:', { card1PairId, frame2PairId });
            this.onMatchSuccess(card1, frame2);
        }

        // 檢查 card2 是否與 frame1 配對正確
        const card2PairId = card2.getData('pairId');
        const frame1PairId = frame1.getData('pairId');
        if (card2PairId === frame1PairId) {
            console.log('✅ [v62.0] 混合模式配對正確（card2）:', { card2PairId, frame1PairId });
            this.onMatchSuccess(card2, frame1);
        }

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
        // 不立即檢查對錯，等待用戶點擊「提交答案」按鈕
        this.onMatchSuccess(leftCard, rightCard);
    }

    onMatchSuccess(leftCard, rightCard) {
        // 標記為已配對
        leftCard.setData('isMatched', true);
        leftCard.setData('matchedWith', rightCard);  // 記錄配對的右側卡片
        rightCard.setData('isMatched', true);
        rightCard.setData('matchedWith', leftCard);  // 記錄配對的左側卡片

        // 🔥 [v59.0] 修復：將配對的卡片添加到 matchedPairs 集合中
        const pairId = leftCard.getData('pairId');
        this.matchedPairs.add(pairId);
        console.log('🔥 [v59.0] 已添加配對到 matchedPairs:', {
            pairId,
            matchedPairsSize: this.matchedPairs.size
        });

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

            // 分離模式：顯示右側空白框（如果之前被隱藏）
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
        // 📝 調試訊息：記錄配對狀態檢查
        const matchedCount = this.leftCards.filter(card => card.getData('isMatched')).length;
        const totalCount = this.leftCards.length;
        const allMatched = matchedCount === totalCount;

        console.log('🔍 檢查配對狀態:', {
            matchedCount,
            totalCount,
            allMatched,
            hasSubmitButton: !!this.submitButton,
            matchedPairsSize: this.matchedPairs.size
        });

        if (allMatched && !this.submitButton) {
            console.log('✅ 所有卡片都已配對，顯示提交答案按鈕');
            this.showSubmitButton();
        } else if (!allMatched) {
            console.log('⏳ 還有卡片未配對:', totalCount - matchedCount);
        } else if (this.submitButton) {
            console.log('ℹ️ 提交按鈕已存在');
        }
    }

    // 🔥 顯示「提交答案」按鈕
    showSubmitButton() {
        const width = this.scale.width;
        const height = this.scale.height;

        console.log('🔍 顯示提交答案按鈕', { width, height });

        // 🔥 智能判斷容器大小
        const isSmallContainer = height < 600;
        const isMediumContainer = height >= 600 && height < 800;
        const isLargeContainer = height >= 800;

        // 🔥 按鈕尺寸（根據容器大小調整）
        let buttonWidth, buttonHeight, fontSize;

        if (isSmallContainer) {
            // 小容器：更小的按鈕
            buttonWidth = Math.max(80, Math.min(120, width * 0.12));
            buttonHeight = Math.max(30, Math.min(40, height * 0.06));
            fontSize = Math.max(14, Math.min(18, width * 0.015));
        } else if (isMediumContainer) {
            // 中等容器：中等按鈕
            buttonWidth = Math.max(100, Math.min(150, width * 0.15));
            buttonHeight = Math.max(35, Math.min(50, height * 0.07));
            fontSize = Math.max(16, Math.min(22, width * 0.02));
        } else {
            // 大容器：稍大的按鈕
            buttonWidth = Math.max(120, Math.min(180, width * 0.12));
            buttonHeight = Math.max(40, Math.min(55, height * 0.06));
            fontSize = Math.max(18, Math.min(24, width * 0.02));
        }

        // 🔥 按鈕位置（最底下中央，留出更多空間）
        const buttonX = width / 2;
        const buttonY = height - buttonHeight / 2 - 5;  // 距離底部 5px

        console.log('🔍 按鈕位置', { buttonX, buttonY, buttonWidth, buttonHeight, isSmallContainer, isMediumContainer, isLargeContainer });

        // 創建按鈕背景
        const buttonBg = this.add.rectangle(buttonX, buttonY, buttonWidth, buttonHeight, 0x4caf50);
        buttonBg.setStrokeStyle(2, 0x388e3c);
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
        let unmatchedCount = 0;

        // 🔥 [v100.0] 修復：獲取當前頁的詞彙數據
        // 注意：currentPage 是 0-based（0, 1, 2...），所以直接乘以 itemsPerPage
        const startIndex = this.currentPage * this.itemsPerPage;
        const endIndex = Math.min(startIndex + this.itemsPerPage, this.pairs.length);
        const currentPagePairs = this.pairs.slice(startIndex, endIndex);

        // 🔥 清空當前頁面的答案記錄
        this.currentPageAnswers = [];

        // 🔥 [v60.0] 修復：使用 this.matchedPairs 集合來檢查配對
        // 而不是依賴 leftCard.getData('matchedWith')
        // 因為在混合佈局中，leftCards 可能不包含所有的詞彙對應的卡片

        console.log('🔍 [v60.0] 開始檢查所有配對:', {
            currentPage: this.currentPage,
            startIndex,
            endIndex,
            currentPagePairsCount: currentPagePairs.length,
            matchedPairsSize: this.matchedPairs.size,
            matchedPairsArray: Array.from(this.matchedPairs),
            totalPairs: this.pairs.length
        });

        // 🔥 [v61.0] 添加詳細的 leftCards 檢查日誌
        console.log('🔍 [v61.0] leftCards 詳細檢查:', {
            leftCardsCount: this.leftCards.length,
            leftCardsData: this.leftCards.map((card, index) => ({
                index,
                pairId: card.getData('pairId'),
                isMatched: card.getData('isMatched'),
                matchedWith: card.getData('matchedWith') ? card.getData('matchedWith').getData('pairId') : null
            }))
        });

        // 🔥 [v66.0] 在混合模式中，檢查所有卡片的當前位置
        // 不依賴 chineseFrames 數組，直接通過 currentFrameIndex 檢查卡片位置
        if (this.layout === 'mixed') {
            console.log('🔍 [v66.0] 混合模式：檢查所有右卡片的當前位置', {
                rightCardsLength: this.rightCards ? this.rightCards.length : 0,
                currentPagePairsLength: currentPagePairs.length
            });

            currentPagePairs.forEach((pair, pairIndex) => {
                // 在混合模式中，每個詞彙對應一個框位置（pairIndex）
                const frameIndex = pairIndex;

                // 🔥 [v80.0] 修復：在混合模式中，英文卡片在 leftCards 中，不在 rightCards 中
                // 找到當前在這個框位置的英文卡片
                const currentCardInFrame = this.leftCards.find(card =>
                    card.getData('currentFrameIndex') === frameIndex
                );

                if (currentCardInFrame) {
                    const currentCardPairId = currentCardInFrame.getData('pairId');
                    const isCorrect = pair.id === currentCardPairId;

                    // 獲取用戶選擇的英文單字
                    const userAnswerPair = this.pairs.find(p => p.id === currentCardPairId);

                    console.log(`🔍 [v66.0] 混合模式 - 詞彙對 ${pairIndex + 1}/${currentPagePairs.length}:`, {
                        pairId: pair.id,
                        chinese: pair.chinese,
                        expectedEnglish: pair.english,
                        currentCardPairId: currentCardPairId,
                        userAnswerEnglish: userAnswerPair ? userAnswerPair.english : null,
                        isCorrect
                    });

                    // 記錄用戶答案
                    this.currentPageAnswers.push({
                        page: this.currentPage,
                        leftText: pair.chinese,
                        rightText: userAnswerPair ? userAnswerPair.english : '(未知)',
                        correctAnswer: pair.english,
                        correctChinese: pair.chinese,
                        isCorrect: isCorrect,
                        leftPairId: pair.id,
                        rightPairId: currentCardPairId
                    });

                    if (isCorrect) {
                        correctCount++;
                        console.log('✅ [v66.0] 配對正確:', pair.chinese, '-', userAnswerPair.english);
                        this.showCorrectAnswer(currentCardInFrame, pair.english);
                    } else {
                        incorrectCount++;
                        console.log('❌ [v66.0] 配對錯誤:', pair.chinese, '-', userAnswerPair.english);
                        this.showIncorrectAnswer(currentCardInFrame, pair.english);
                    }
                } else {
                    // 沒有卡片在這個框位置
                    unmatchedCount++;
                    console.log('⚠️ [v66.0] 未配對:', pair.chinese);

                    this.currentPageAnswers.push({
                        page: this.currentPage,
                        leftText: pair.chinese,
                        rightText: null,
                        correctAnswer: pair.english,
                        correctChinese: pair.chinese,
                        isCorrect: false,
                        leftPairId: pair.id,
                        rightPairId: null
                    });
                }
            });
        } else {
            // 分離模式：使用原有的邏輯
            console.log('🔍 [v64.0] 分離模式：使用 matchedPairs 集合檢查');

            currentPagePairs.forEach((pair, pairIndex) => {
                const isMatched = this.matchedPairs.has(pair.id);

                console.log(`🔍 [v64.0] 詞彙對 ${pairIndex + 1}/${currentPagePairs.length}:`, {
                    pairId: pair.id,
                    chinese: pair.chinese,
                    english: pair.english,
                    isMatched: isMatched
                });

                if (isMatched) {
                    const leftCard = this.leftCards.find(card => card.getData('pairId') === pair.id);
                    const rightCard = leftCard ? leftCard.getData('matchedWith') : null;

                    if (rightCard) {
                        const rightPairId = rightCard.getData('pairId');
                        const isCorrect = pair.id === rightPairId;
                        const userAnswerPair = this.pairs.find(p => p.id === rightPairId);

                        console.log(`🔍 [v64.0] 答案驗證 - 詞彙對 ${pairIndex + 1}:`, {
                            expectedPairId: pair.id,
                            selectedPairId: rightPairId,
                            isCorrect,
                            expectedChinese: pair.chinese,
                            expectedEnglish: pair.english,
                            userAnswerEnglish: userAnswerPair ? userAnswerPair.english : null
                        });

                        this.currentPageAnswers.push({
                            page: this.currentPage,
                            leftText: pair.chinese,
                            rightText: userAnswerPair ? userAnswerPair.english : '(未知)',
                            correctAnswer: pair.english,
                            correctChinese: pair.chinese,
                            isCorrect: isCorrect,
                            leftPairId: pair.id,
                            rightPairId: rightPairId
                        });

                        if (isCorrect) {
                            correctCount++;
                            console.log('✅ 配對正確:', pair.chinese, '-', userAnswerPair.english);
                            this.showCorrectAnswer(rightCard, pair.english);
                        } else {
                            incorrectCount++;
                            console.log('❌ 配對錯誤:', pair.chinese, '-', userAnswerPair.english);
                            this.showIncorrectAnswer(rightCard, pair.english);
                        }
                    } else {
                        console.warn('⚠️ [v64.0] 配對已記錄但找不到右卡片:', pair.id);
                        unmatchedCount++;
                        this.currentPageAnswers.push({
                            page: this.currentPage,
                            leftText: pair.chinese,
                            rightText: null,
                            correctAnswer: pair.english,
                            correctChinese: pair.chinese,
                            isCorrect: false,
                            leftPairId: pair.id,
                            rightPairId: null
                        });
                    }
                } else {
                    unmatchedCount++;
                    console.log('⚠️ 未配對:', pair.chinese);

                    this.currentPageAnswers.push({
                        page: this.currentPage,
                        leftText: pair.chinese,
                        rightText: null,
                        correctAnswer: pair.english,
                        correctChinese: pair.chinese,
                        isCorrect: false,
                        leftPairId: pair.id,
                        rightPairId: null
                    });
                }
            });
        }

        // 🔥 將當前頁面的答案添加到所有答案記錄中
        this.allPagesAnswers.push(...this.currentPageAnswers);

        // 🔥 [v56.0] 詳細調試：記錄最終分數
        console.log('📝 當前頁面答案記錄:', this.currentPageAnswers);
        console.log('📝 所有頁面答案記錄:', this.allPagesAnswers);
        console.log('📊 [v56.0] 當前頁面分數:', {
            correctCount,
            incorrectCount,
            unmatchedCount,
            totalCount: correctCount + incorrectCount + unmatchedCount
        });

        // 🔥 檢查是否所有頁面都已完成
        const isLastPage = this.currentPage === this.totalPages - 1;
        if (isLastPage) {
            // 遊戲結束
            this.gameEndTime = Date.now();
            this.totalGameTime = (this.gameEndTime - this.gameStartTime) / 1000; // 秒
            this.gameState = 'completed';

            console.log('🎮 遊戲結束！總時間:', this.totalGameTime, '秒');

            // 顯示遊戲結束模態框
            this.showGameCompleteModal();
        } else {
            // 顯示當前頁面的總結
            this.showMatchSummary(correctCount, incorrectCount, unmatchedCount);
        }
    }

    // 🔥 顯示正確答案（白色內框 + 勾勾）[v96.0]
    showCorrectAnswer(rightCard, correctAnswer) {
        // 🔥 [v98.0] 在混合佈局中，不需要檢查 background，直接添加勾勾
        if (this.layout === 'mixed') {
            // 混合佈局：rightCard 是英文卡片，直接在其上添加勾勾
            console.log('🔍 [v102.0] showCorrectAnswer 混合佈局調試:', {
                hasRightCard: !!rightCard,
                hasList: rightCard && !!rightCard.list,
                listLength: rightCard && rightCard.list ? rightCard.list.length : 0,
                listTypes: rightCard && rightCard.list ? rightCard.list.map(c => c.type) : [],
                pairId: rightCard ? rightCard.getData('pairId') : null,
                rightCardWidth: rightCard ? rightCard.width : null,
                rightCardHeight: rightCard ? rightCard.height : null,
                rightCardX: rightCard ? rightCard.x : null,
                rightCardY: rightCard ? rightCard.y : null
            });

            if (rightCard && rightCard.list) {
                // 🔥 [v102.0] 修復：參考 showCorrectAnswerOnCard() 的方法
                // 勾勾應該直接添加到場景中，而不是容器中
                // 位置相對於全局坐標

                const background = rightCard.list[0]; // 卡片背景

                console.log('🔍 [v102.0] 背景對象詳細信息:', {
                    hasBackground: !!background,
                    backgroundType: background ? background.type : null,
                    backgroundWidth: background ? background.width : null,
                    backgroundHeight: background ? background.height : null
                });

                if (background) {
                    // 🔥 [v102.0] 使用全局坐標計算勾勾位置（參考 showCorrectAnswerOnCard）
                    const markX = rightCard.x + background.width / 2 - 32;
                    const markY = rightCard.y - background.height / 2 + 32;

                    console.log('🔍 [v102.0] 勾勾位置計算:', {
                        rightCardX: rightCard.x,
                        rightCardY: rightCard.y,
                        backgroundWidth: background.width,
                        backgroundHeight: background.height,
                        markX,
                        markY
                    });

                    // 🔥 [v102.0] 先創建在 (0, 0)，然後設置位置（與 showCorrectAnswerOnCard 一致）
                    // 🔥 [v103.0] 移除舊的標記（如果存在）
                    if (rightCard.checkMark) {
                        rightCard.checkMark.destroy();
                    }

                    const checkMark = this.add.text(0, 0, '✓', {
                        fontSize: '64px',
                        color: '#4caf50',
                        fontFamily: 'Arial',
                        fontStyle: 'bold'
                    });
                    checkMark.setOrigin(0.5, 0.5);
                    checkMark.setDepth(100);
                    checkMark.setPosition(markX, markY);

                    // 🔥 [v103.0] 保存引用以便後續清除
                    rightCard.checkMark = checkMark;

                    console.log('✅ [v102.0] 混合佈局：在英文卡片上添加勾勾', {
                        checkMarkX: checkMark.x,
                        checkMarkY: checkMark.y,
                        checkMarkVisible: checkMark.visible,
                        checkMarkDepth: checkMark.depth
                    });
                } else {
                    console.warn('⚠️ [v102.0] 混合佈局：找不到背景對象');
                }
            } else {
                console.warn('⚠️ [v102.0] 混合佈局：rightCard 或 rightCard.list 不存在');
            }
        } else {
            // 分離模式：使用原有的邏輯
            const background = rightCard.getData('background');

            // 🔥 [v58.0] 修復：檢查 background 是否存在
            if (!background) {
                console.warn('⚠️ [v58.0] showCorrectAnswer: background 不存在，跳過視覺效果');
                return;
            }

            const textObj = rightCard.getData('text');  // 🔥 修正：使用 'text' 而非 'textObj'

            // 內框呈白色
            background.setFillStyle(0xffffff);
            background.setStrokeStyle(2, 0x000000);

            // 更新文字為正確答案
            if (textObj) {
                textObj.setText(correctAnswer);
            }

            // 分離模式：在右卡片上顯示勾勾
            const checkMark = this.add.text(
                rightCard.x + background.width / 2 - 32,
                rightCard.y - background.height / 2 + 32,
                '✓',
                {
                    fontSize: '64px',
                    color: '#4caf50',
                    fontFamily: 'Arial',
                    fontStyle: 'bold'
                }
            );
            checkMark.setOrigin(0.5).setDepth(15);
            rightCard.add(checkMark);
        }
    }

    // 🔥 顯示錯誤答案（灰色內框 + X）[v96.0]
    showIncorrectAnswer(rightCard, correctAnswer) {
        // 🔥 [v98.0] 在混合佈局中，不需要檢查 background，直接添加叉叉
        if (this.layout === 'mixed') {
            // 混合佈局：rightCard 是英文卡片，直接在其上添加叉叉
            console.log('🔍 [v102.0] showIncorrectAnswer 混合佈局調試:', {
                hasRightCard: !!rightCard,
                hasList: rightCard && !!rightCard.list,
                listLength: rightCard && rightCard.list ? rightCard.list.length : 0,
                listTypes: rightCard && rightCard.list ? rightCard.list.map(c => c.type) : [],
                pairId: rightCard ? rightCard.getData('pairId') : null,
                rightCardWidth: rightCard ? rightCard.width : null,
                rightCardHeight: rightCard ? rightCard.height : null,
                rightCardX: rightCard ? rightCard.x : null,
                rightCardY: rightCard ? rightCard.y : null
            });

            if (rightCard && rightCard.list) {
                // 🔥 [v102.0] 修復：參考 showIncorrectAnswerOnCard() 的方法
                // 叉叉應該直接添加到場景中，而不是容器中
                // 位置相對於全局坐標

                const background = rightCard.list[0]; // 卡片背景

                console.log('🔍 [v102.0] 背景對象詳細信息:', {
                    hasBackground: !!background,
                    backgroundType: background ? background.type : null,
                    backgroundWidth: background ? background.width : null,
                    backgroundHeight: background ? background.height : null
                });

                if (background) {
                    // 🔥 [v102.0] 使用全局坐標計算叉叉位置（參考 showIncorrectAnswerOnCard）
                    const markX = rightCard.x + background.width / 2 - 32;
                    const markY = rightCard.y - background.height / 2 + 32;

                    console.log('🔍 [v102.0] 叉叉位置計算:', {
                        rightCardX: rightCard.x,
                        rightCardY: rightCard.y,
                        backgroundWidth: background.width,
                        backgroundHeight: background.height,
                        markX,
                        markY
                    });

                    // 🔥 [v102.0] 先創建在 (0, 0)，然後設置位置（與 showIncorrectAnswerOnCard 一致）
                    // 🔥 [v103.0] 移除舊的標記（如果存在）
                    if (rightCard.xMark) {
                        rightCard.xMark.destroy();
                    }

                    const xMark = this.add.text(0, 0, '✗', {
                        fontSize: '64px',
                        color: '#f44336',
                        fontFamily: 'Arial',
                        fontStyle: 'bold'
                    });
                    xMark.setOrigin(0.5, 0.5);
                    xMark.setDepth(100);
                    xMark.setPosition(markX, markY);

                    // 🔥 [v103.0] 保存引用以便後續清除
                    rightCard.xMark = xMark;

                    console.log('❌ [v102.0] 混合佈局：在英文卡片上添加叉叉', {
                        xMarkX: xMark.x,
                        xMarkY: xMark.y,
                        xMarkVisible: xMark.visible,
                        xMarkDepth: xMark.depth
                    });
                } else {
                    console.warn('⚠️ [v102.0] 混合佈局：找不到背景對象');
                }
            } else {
                console.warn('⚠️ [v102.0] 混合佈局：rightCard 或 rightCard.list 不存在');
            }
        } else {
            // 分離模式：使用原有的邏輯
            const background = rightCard.getData('background');

            // 🔥 [v58.0] 修復：檢查 background 是否存在
            if (!background) {
                console.warn('⚠️ [v58.0] showIncorrectAnswer: background 不存在，跳過視覺效果');
                return;
            }

            const textObj = rightCard.getData('text');  // 🔥 修正：使用 'text' 而非 'textObj'

            // 內框呈灰色
            background.setFillStyle(0xcccccc);
            background.setStrokeStyle(2, 0x000000);

            // 更新文字為正確答案
            if (textObj) {
                textObj.setText(correctAnswer);
            }

            // 分離模式：在右卡片上顯示叉叉
            const xMark = this.add.text(
                rightCard.x + background.width / 2 - 32,
                rightCard.y - background.height / 2 + 32,
                '✗',
                {
                    fontSize: '64px',
                    color: '#f44336',
                    fontFamily: 'Arial',
                    fontStyle: 'bold'
                }
            );
            xMark.setOrigin(0.5).setDepth(15);
            rightCard.add(xMark);
        }
    }

    // 🔥 顯示配對總結 [v95.0] - 非最後一頁自動進入下一頁，只有最後一頁才顯示統計
    showMatchSummary(correctCount, incorrectCount, unmatchedCount = 0) {
        const width = this.scale.width;
        const height = this.scale.height;

        // 移除提交按鈕
        if (this.submitButton) {
            this.submitButton.bg.destroy();
            this.submitButton.text.destroy();
            this.submitButton = null;
        }

        // 計算當前頁的統計
        const totalCount = this.leftCards.length;
        const pageNumber = this.currentPage + 1;
        const totalPages = this.totalPages;
        const isLastPage = this.currentPage === this.totalPages - 1;

        console.log('📄 [v95.0] 顯示當前頁完成模態框', {
            pageNumber,
            totalPages,
            isLastPage,
            correctCount,
            incorrectCount,
            unmatchedCount,
            totalCount
        });

        // 🔥 [v96.0] 如果不是最後一頁，延遲 2 秒後自動進入下一頁
        // 這樣可以讓用戶看到勾勾和叉叉
        if (!isLastPage) {
            console.log('📄 [v96.0] 非最後一頁：延遲 2 秒後自動進入下一頁');
            this.time.delayedCall(2000, () => {
                console.log('📄 [v96.0] 2 秒延遲後，進入下一頁');
                this.goToNextPage();
            });
            return;
        }

        // 創建半透明背景（遮罩）
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

        // 創建模態框容器
        const modalWidth = Math.min(500, width * 0.8);
        const modalHeight = Math.min(420, height * 0.7);
        const modal = this.add.container(width / 2, height / 2);
        modal.setDepth(5001);
        modal.setScrollFactor(0);

        // 模態框背景
        const modalBg = this.add.rectangle(0, 0, modalWidth, modalHeight, 0x2c2c2c);
        modalBg.setStrokeStyle(4, 0x000000);
        modal.add(modalBg);

        // 標題：GAME COMPLETE（最後一頁）
        const title = this.add.text(0, -modalHeight / 2 + 20, 'GAME COMPLETE', {
            fontSize: '36px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        modal.add(title);

        // 頁碼標籤
        const pageLabel = this.add.text(-80, -modalHeight / 2 + 55, 'Page', {
            fontSize: '18px',
            color: '#4a9eff',
            fontFamily: 'Arial'
        });
        pageLabel.setOrigin(0.5);
        modal.add(pageLabel);

        // 頁碼值
        const pageValue = this.add.text(-80, -modalHeight / 2 + 80, `${pageNumber}/${totalPages}`, {
            fontSize: '28px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        pageValue.setOrigin(0.5);
        modal.add(pageValue);

        // 分數標籤
        const scoreLabel = this.add.text(80, -modalHeight / 2 + 55, 'Score', {
            fontSize: '18px',
            color: '#4a9eff',
            fontFamily: 'Arial'
        });
        scoreLabel.setOrigin(0.5);
        modal.add(scoreLabel);

        // 分數值
        const scoreValue = this.add.text(80, -modalHeight / 2 + 80, `${correctCount}/${totalCount}`, {
            fontSize: '28px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        scoreValue.setOrigin(0.5);
        modal.add(scoreValue);

        // 頁面完成提示
        const completeText = this.add.text(0, -modalHeight / 2 + 115, 'PAGE COMPLETE!', {
            fontSize: '14px',
            color: '#4caf50',
            fontFamily: 'Arial'
        });
        completeText.setOrigin(0.5);
        modal.add(completeText);

        // 按鈕間距
        const buttonSpacing = 42;
        const firstButtonY = -modalHeight / 2 + 155;

        // Show answers 按鈕
        this.createModalButton(modal, 0, firstButtonY, 'Show answers', () => {
            console.log('🎮 點擊 Show answers 按鈕');
            overlay.destroy();
            modal.destroy();
            this.pageCompleteModal = null;
            this.showAnswersOnCards();
        });

        // Show all answers 按鈕
        this.createModalButton(modal, 0, firstButtonY + buttonSpacing, 'Show all answers', () => {
            console.log('🎮 點擊 Show all answers 按鈕');
            overlay.destroy();
            modal.destroy();
            this.pageCompleteModal = null;
            this.showAllCorrectAnswers();
        });

        // Start again 按鈕（最後一頁）
        this.createModalButton(modal, 0, firstButtonY + buttonSpacing * 2, 'Start again', () => {
            console.log('🎮 點擊 Start again 按鈕');
            overlay.destroy();
            modal.destroy();
            this.pageCompleteModal = null;
            this.restartGame();
        });

        // Leaderboard 按鈕（最後一頁）
        this.createModalButton(modal, 0, firstButtonY + buttonSpacing * 3, 'Leaderboard', () => {
            console.log('🎮 點擊 Leaderboard 按鈕');
            this.showEnterNamePage();
        });

        // 保存模態框引用
        this.pageCompleteModal = { overlay, modal };
    }

    // 🔥 [v94.0] showRetryButton() 已移除 - 使用統一的模態框樣式

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
        this.add.text(width / 2, 50, '📝 我的答案 vs 正確答案', {
            fontSize: '32px',
            color: '#000000',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 創建滾動區域
        const startY = 100;
        const lineHeight = 50;
        const maxVisibleLines = Math.floor((height - 150) / lineHeight);

        console.log('🔍 [v63.0] showAnswersScreen 調試:', {
            currentPageAnswersLength: this.currentPageAnswers.length,
            allPagesAnswersLength: this.allPagesAnswers.length,
            pairsLength: this.pairs.length
        });

        // 🔥 [v63.0] 顯示用戶的答案和正確答案的對比
        this.currentPageAnswers.forEach((answer, index) => {
            const y = startY + index * lineHeight;

            // 只顯示可見範圍內的答案
            if (index < maxVisibleLines) {
                // 用戶的答案
                const userAnswerText = answer.rightText || '(未配對)';
                const correctAnswerText = answer.correctAnswer || '(無)';
                const isCorrect = answer.isCorrect;

                // 顯示用戶的答案
                const userAnswerColor = isCorrect ? '#4CAF50' : '#f44336';  // 綠色正確，紅色錯誤
                const statusIcon = isCorrect ? '✓' : '✗';

                this.add.text(
                    width / 2,
                    y,
                    `${statusIcon} 我的: ${userAnswerText} → 正確: ${correctAnswerText}`,
                    {
                        fontSize: '16px',
                        color: userAnswerColor,
                        fontFamily: 'Arial',
                        fontStyle: 'bold'
                    }
                ).setOrigin(0.5);

                console.log(`🔍 [v63.0] 答案 ${index + 1}:`, {
                    userAnswer: userAnswerText,
                    correctAnswer: correctAnswerText,
                    isCorrect,
                    statusIcon
                });
            }
        });

        // 如果沒有用戶答案，顯示所有正確答案
        if (this.currentPageAnswers.length === 0) {
            console.log('⚠️ [v63.0] 沒有用戶答案，顯示所有正確答案');
            this.pairs.forEach((pair, index) => {
                const y = startY + index * lineHeight;

                // 只顯示可見範圍內的答案
                if (index < maxVisibleLines) {
                    this.add.text(
                        width / 2,
                        y,
                        `${pair.question} = ${pair.answer}`,
                        {
                            fontSize: '16px',
                            color: '#333333',
                            fontFamily: 'Arial'
                        }
                    ).setOrigin(0.5);
                }
            });
        }

        // 如果答案太多，顯示提示
        const totalAnswers = this.currentPageAnswers.length > 0 ? this.currentPageAnswers.length : this.pairs.length;
        if (totalAnswers > maxVisibleLines) {
            this.add.text(
                width / 2,
                height - 50,
                `（顯示前 ${maxVisibleLines} 個答案，共 ${totalAnswers} 個）`,
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

        // 🔥 分頁指示器放在中間頂部（水平對齐，與計時器並排）
        this.pageIndicatorText = this.add.text(width / 2 + 80, 20, pageText, {
            fontSize: `${fontSize}px`,
            color: '#666666',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            backgroundColor: '#f5f5f5',
            padding: { x: 15, y: 8 }
        });
        this.pageIndicatorText.setOrigin(0, 0);  // 左上角對齐
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

            // 🔥 v54.0: 清除洗牌順序緩存（因為頁面改變了）
            this.shuffledPairsCache = null;
            console.log('🔥 [v54.0] 已清除洗牌順序緩存（頁面改變）');

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

    // 🔥 顯示遊戲結束模態框 [v93.0] - 優化排版，合理運用空間
    showGameCompleteModal() {
        const width = this.scale.width;
        const height = this.scale.height;

        // 🔥 [v56.0] 改進分數計算邏輯
        // 計算總分數：只計算有效的答案（已配對的答案）
        const totalCorrect = this.allPagesAnswers.filter(answer => answer.isCorrect && answer.rightPairId !== null).length;
        const totalAnswered = this.allPagesAnswers.filter(answer => answer.rightPairId !== null).length;
        const totalQuestions = this.pairs.length;

        // 格式化時間
        const timeText = this.formatGameTime(this.totalGameTime);

        // 🔥 [v56.0] 詳細調試：記錄分數計算過程
        console.log('🎮 [v56.0] 顯示遊戲結束模態框', {
            totalCorrect,
            totalAnswered,
            totalQuestions,
            totalGameTime: this.totalGameTime,
            timeText,
            allPagesAnswersCount: this.allPagesAnswers.length,
            allPagesAnswers: this.allPagesAnswers.map((a, i) => ({
                index: i,
                leftText: a.leftText,
                rightText: a.rightText,
                correctAnswer: a.correctAnswer,
                isCorrect: a.isCorrect,
                leftPairId: a.leftPairId,
                rightPairId: a.rightPairId
            }))
        });

        // 創建半透明背景（遮罩）
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

        // 創建模態框容器
        const modalWidth = Math.min(500, width * 0.8);
        // 🔥 v91.0: 優化排版，合理運用空間 - 減少模態框高度，緊湊排列內容
        const modalHeight = Math.min(420, height * 0.7);
        const modal = this.add.container(width / 2, height / 2);
        modal.setDepth(5001);
        modal.setScrollFactor(0);

        // 模態框背景
        const modalBg = this.add.rectangle(0, 0, modalWidth, modalHeight, 0x2c2c2c);
        modalBg.setStrokeStyle(4, 0x000000);
        modal.add(modalBg);

        // 標題：GAME COMPLETE
        const title = this.add.text(0, -modalHeight / 2 + 20, 'GAME COMPLETE', {
            fontSize: '36px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        title.setOrigin(0.5);
        modal.add(title);

        // 分數標籤
        const scoreLabel = this.add.text(-80, -modalHeight / 2 + 55, 'Score', {
            fontSize: '18px',
            color: '#4a9eff',
            fontFamily: 'Arial'
        });
        scoreLabel.setOrigin(0.5);
        modal.add(scoreLabel);

        // 分數值
        const scoreValue = this.add.text(-80, -modalHeight / 2 + 80, `${totalCorrect}/${totalQuestions}`, {
            fontSize: '28px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        scoreValue.setOrigin(0.5);
        modal.add(scoreValue);

        // 時間標籤（如果有計時器）
        if (this.timerType !== 'none') {
            const timeLabel = this.add.text(80, -modalHeight / 2 + 55, 'Time', {
                fontSize: '18px',
                color: '#4a9eff',
                fontFamily: 'Arial'
            });
            timeLabel.setOrigin(0.5);
            modal.add(timeLabel);

            // 時間值
            const timeValue = this.add.text(80, -modalHeight / 2 + 80, timeText, {
                fontSize: '28px',
                color: '#ffffff',
                fontFamily: 'Arial',
                fontStyle: 'bold'
            });
            timeValue.setOrigin(0.5);
            modal.add(timeValue);
        }

        // 🔥 排名提示（動態顯示，位置調整到按鈕上方）
        const rankText = this.add.text(0, 0, 'Loading ranking...', {
            fontSize: '14px',
            color: '#ffffff',
            fontFamily: 'Arial'
        });
        rankText.setOrigin(0.5);
        modal.add(rankText);

        // 🔥 異步獲取排名並更新文字
        this.fetchUserRanking(totalCorrect, totalQuestions, this.totalGameTime).then(ranking => {
            if (ranking && ranking.rank) {
                const rankSuffix = this.getRankSuffix(ranking.rank);
                rankText.setText(`YOU'RE ${ranking.rank}${rankSuffix} ON THE LEADERBOARD`);
            } else {
                rankText.setText('');  // 如果無法獲取排名，隱藏文字
            }
        });

        // 🔥 v93.0: 優化按鈕排版 - 減少上半部分和按鈕之間的空白到約 40px
        const buttonSpacing = 42;

        // 🔥 v93.0: 排名提示位置緊接著分數下方
        rankText.y = -modalHeight / 2 + 115;

        // 🔥 v93.0: 計算按鈕起始位置
        // 排名提示在 -modalHeight / 2 + 115
        // 中間空白約 40px
        // 第一個按鈕（Leaderboard）應該在 -modalHeight / 2 + 115 + 40 = -modalHeight / 2 + 155
        const firstButtonY = -modalHeight / 2 + 155;

        // Leaderboard 按鈕
        this.createModalButton(modal, 0, firstButtonY, 'Leaderboard', () => {
            console.log('🎮 點擊 Leaderboard 按鈕');
            this.showEnterNamePage();
        });

        // Show answers 按鈕
        this.createModalButton(modal, 0, firstButtonY + buttonSpacing, 'Show answers', () => {
            console.log('🎮 點擊 Show answers 按鈕');
            // 🔥 v88.0: 隱藏模態框，回到遊戲場景並顯示所有卡片的勾勾和叉叉
            overlay.destroy();
            modal.destroy();
            this.gameCompleteModal = null;
            this.showAnswersOnCards();
        });

        // 🔥 [v93.0] Show all answers 按鈕
        this.createModalButton(modal, 0, firstButtonY + buttonSpacing * 2, 'Show all answers', () => {
            console.log('🎮 點擊 Show all answers 按鈕');
            // 隱藏模態框，回到遊戲場景並顯示所有卡片的正確名稱
            overlay.destroy();
            modal.destroy();
            this.gameCompleteModal = null;
            this.showAllCorrectAnswers();
        });

        // Start again 按鈕
        this.createModalButton(modal, 0, firstButtonY + buttonSpacing * 3, 'Start again', () => {
            console.log('🎮 點擊 Start again 按鈕');
            this.restartGame();
        });

        // 保存模態框引用（用於後續關閉）
        this.gameCompleteModal = { overlay, modal };
    }

    // 🔥 創建模態框按鈕
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

            if (!activityId) {
                console.log('⚠️ 無法獲取 activityId，無法查詢排名');
                return null;
            }

            // 計算分數和準確率
            const score = Math.round((correctCount / totalCount) * 100);
            const accuracy = Math.round((correctCount / totalCount) * 100);

            // 獲取排行榜數據
            const response = await fetch(`/api/leaderboard?activityId=${activityId}&limit=100`);
            if (!response.ok) {
                console.log('⚠️ 無法獲取排行榜數據');
                return null;
            }

            const data = await response.json();
            const leaderboard = data.leaderboard || [];

            // 計算當前用戶的排名
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
            }

            console.log('🏆 用戶排名:', rank);
            return { rank, score, accuracy, timeSpent };
        } catch (error) {
            console.error('❌ 獲取排名失敗:', error);
            return null;
        }
    }

    // 🔥 獲取排名後綴（1st, 2nd, 3rd, 4th, ...）
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

    // 🔥 格式化遊戲時間
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
    restartGame() {
        console.log('🎮 重新開始遊戲');

        // 關閉遊戲完成模態框
        if (this.gameCompleteModal) {
            this.gameCompleteModal.overlay.destroy();
            this.gameCompleteModal.modal.destroy();
            this.gameCompleteModal = null;
        }

        // 🔥 [v94.0] 關閉頁面完成模態框
        if (this.pageCompleteModal) {
            this.pageCompleteModal.overlay.destroy();
            this.pageCompleteModal.modal.destroy();
            this.pageCompleteModal = null;
        }

        // 重置遊戲狀態
        this.gameState = 'playing';
        this.gameStartTime = null;
        this.gameEndTime = null;
        this.totalGameTime = 0;
        this.allPagesAnswers = [];
        this.currentPageAnswers = [];
        this.currentPage = 0;
        this.matchedPairs.clear();

        // 🔥 v54.0: 清除洗牌順序緩存（遊戲重新開始）
        this.shuffledPairsCache = null;
        console.log('🔥 [v54.0] 已清除洗牌順序緩存（遊戲重新開始）');

        // 重新載入遊戲
        this.scene.restart();
    }

    // 🔥 顯示 My Answers 頁面
    // 🔥 v88.0: 顯示所有卡片上的勾勾和叉叉，以及正確的配對物件
    showAnswersOnCards() {
        console.log('🎮 [v88.0] 顯示所有卡片上的勾勾和叉叉，以及正確的配對物件');

        // 遍歷所有答案，在對應的卡片上顯示勾勾或叉叉，以及正確的配對物件
        if (this.allPagesAnswers && this.allPagesAnswers.length > 0) {
            this.allPagesAnswers.forEach((answer) => {
                // 根據 leftPairId 找到對應的左卡片（英文卡片）
                const leftCard = this.leftCards.find(card => card.pairId === answer.leftPairId);

                if (leftCard) {
                    // 在英文卡片上顯示勾勾或叉叉
                    if (answer.isCorrect) {
                        this.showCorrectAnswerOnCard(leftCard);
                    } else {
                        this.showIncorrectAnswerOnCard(leftCard);
                    }

                    // 🔥 v88.0: 在英文卡片下方顯示正確的配對物件（中文）
                    this.showCorrectPairingOnCard(leftCard, answer.correctAnswer);
                }
            });
        }
    }

    // 🔥 v89.0: 顯示所有卡片的正確名稱 - 英文卡片移動到匹配的中文位置
    showAllCorrectAnswers() {
        console.log('🎮 [v89.0] 顯示所有卡片的正確名稱 - 英文卡片移動到匹配的中文位置');

        // 遍歷所有左卡片（英文卡片），將其移動到對應的中文位置
        if (this.leftCards && this.leftCards.length > 0) {
            this.leftCards.forEach((card) => {
                // 根據 pairId 找到對應的配對
                const pairId = card.getData('pairId');

                // 根據佈局模式，找到對應的中文卡片位置
                if (this.layout === 'mixed') {
                    // 混合佈局：找到對應的中文框
                    const rightCard = this.rightCards.find(rc => rc.getData('pairId') === pairId);
                    if (rightCard) {
                        // 移動英文卡片到中文框的位置
                        this.tweens.add({
                            targets: card,
                            x: rightCard.x,
                            y: rightCard.y,
                            duration: 500,
                            ease: 'Power2.inOut'
                        });
                        console.log('🎮 [v89.0] 移動卡片:', { pairId, fromX: card.x, toX: rightCard.x });
                    }
                } else {
                    // 分離佈局：根據 pairId 找到對應的右側卡片
                    const rightCard = this.rightCards.find(rc => rc.getData('pairId') === pairId);
                    if (rightCard) {
                        // 移動英文卡片到右側卡片的位置
                        this.tweens.add({
                            targets: card,
                            x: rightCard.x,
                            y: rightCard.y,
                            duration: 500,
                            ease: 'Power2.inOut'
                        });
                        console.log('🎮 [v89.0] 移動卡片:', { pairId, fromX: card.x, toX: rightCard.x });
                    }
                }
            });
        }
    }

    showMyAnswersPage() {
        console.log('🎮 顯示 My Answers 頁面');

        // 隱藏遊戲結束模態框
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
        const allAnswers = this.allPagesAnswers;
        console.log('📝 所有答案:', allAnswers);

        // 顯示答案（最多顯示 maxAnswersPerPage 個）
        const answersToShow = allAnswers.slice(0, maxAnswersPerPage);
        const cardWidth = 300;  // 🔥 與 createAnswerCard 中的 cardWidth 一致
        const cardX = -pageWidth / 2 + cardWidth / 2 + 30;  // 🔥 左邊距 30px
        answersToShow.forEach((answer, index) => {
            const y = answerStartY + index * answerSpacing;
            this.createAnswerCard(page, cardX, y, answer, 'myAnswer');
        });

        // 底部按鈕區域
        const buttonY = pageHeight / 2 - 60;

        // Correct Answers 按鈕
        this.createAnswerPageButton(page, -150, buttonY, 'Correct Answers', () => {
            console.log('🎮 點擊 Correct Answers 按鈕');
            this.hideMyAnswersPage();
            this.showCorrectAnswersPage();
        });

        // Back 按鈕
        this.createAnswerPageButton(page, 150, buttonY, 'Back', () => {
            console.log('🎮 點擊 Back 按鈕');
            this.hideMyAnswersPage();
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

        // 顯示遊戲結束模態框
        if (this.gameCompleteModal) {
            this.gameCompleteModal.overlay.setVisible(true);
            this.gameCompleteModal.modal.setVisible(true);
        }
    }

    // 🔥 顯示 Correct Answers 頁面
    showCorrectAnswersPage() {
        console.log('🎮 顯示 Correct Answers 頁面');

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

        // 顯示答案（最多顯示 maxAnswersPerPage 個）
        const answersToShow = allAnswers.slice(0, maxAnswersPerPage);
        const cardWidth = 300;  // 🔥 與 createAnswerCard 中的 cardWidth 一致
        const cardX = -pageWidth / 2 + cardWidth / 2 + 30;  // 🔥 左邊距 30px
        answersToShow.forEach((answer, index) => {
            const y = answerStartY + index * answerSpacing;
            this.createAnswerCard(page, cardX, y, answer, 'correctAnswer');
        });

        // 底部按鈕區域
        const buttonY = pageHeight / 2 - 60;

        // My Answers 按鈕
        this.createAnswerPageButton(page, -150, buttonY, 'My Answers', () => {
            console.log('🎮 點擊 My Answers 按鈕');
            this.hideCorrectAnswersPage();
            this.showMyAnswersPage();
        });

        // Back 按鈕
        this.createAnswerPageButton(page, 150, buttonY, 'Back', () => {
            console.log('🎮 點擊 Back 按鈕');
            this.hideCorrectAnswersPage();
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

        // 顯示遊戲結束模態框
        if (this.gameCompleteModal) {
            this.gameCompleteModal.overlay.setVisible(true);
            this.gameCompleteModal.modal.setVisible(true);
        }
    }

    // 🔥 v88.0: 在卡片上顯示勾勾
    showCorrectAnswerOnCard(card) {
        // 移除舊的標記（如果存在）
        if (card.checkMark) {
            card.checkMark.destroy();
        }

        // 創建勾勾標記
        const checkMark = this.add.text(0, 0, '✓', {
            fontSize: '64px',
            color: '#4caf50',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        checkMark.setOrigin(0.5);
        checkMark.setDepth(100);

        // 定位到卡片右上角
        const background = card.list[0]; // 卡片背景
        if (background) {
            const markX = card.x + background.width / 2 - 32;
            const markY = card.y - background.height / 2 + 32;
            checkMark.setPosition(markX, markY);
        }

        card.checkMark = checkMark;
    }

    // 🔥 v88.0: 在卡片上顯示叉叉
    showIncorrectAnswerOnCard(card) {
        // 移除舊的標記（如果存在）
        if (card.xMark) {
            card.xMark.destroy();
        }

        // 創建叉叉標記
        const xMark = this.add.text(0, 0, '✗', {
            fontSize: '64px',
            color: '#f44336',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        xMark.setOrigin(0.5);
        xMark.setDepth(100);

        // 定位到卡片右上角
        const background = card.list[0]; // 卡片背景
        if (background) {
            const markX = card.x + background.width / 2 - 32;
            const markY = card.y - background.height / 2 + 32;
            xMark.setPosition(markX, markY);
        }

        card.xMark = xMark;
    }

    // 🔥 v88.0: 在卡片下方顯示正確的配對物件（中文）
    showCorrectPairingOnCard(card, correctAnswer) {
        // 移除舊的配對文字（如果存在）
        if (card.correctPairingText) {
            card.correctPairingText.destroy();
        }

        // 創建正確配對的文字
        const pairingText = this.add.text(0, 0, correctAnswer, {
            fontSize: '20px',
            color: '#000000',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            wordWrap: { width: 100 },
            align: 'center'
        });
        pairingText.setOrigin(0.5);
        pairingText.setDepth(99);

        // 定位到卡片下方
        const background = card.list[0]; // 卡片背景
        if (background) {
            const textX = card.x;
            const textY = card.y + background.height / 2 + 30;
            pairingText.setPosition(textX, textY);
        }

        card.correctPairingText = pairingText;
    }

    // 🔥 創建答案卡片
    createAnswerCard(container, x, y, answer, type) {
        const cardWidth = 300;  // 🔥 減小卡片寬度以適應容器
        const cardHeight = 60;
        const chineseX = x + cardWidth / 2 + 20;  // 🔥 中文在卡片右邊 20px

        // 根據類型決定顯示內容
        let displayText, bgColor, markColor, markText;

        if (type === 'myAnswer') {
            // My Answers 頁面：顯示用戶的答案
            displayText = answer.rightText || '(未配對)';
            if (answer.isCorrect) {
                bgColor = this.getCardColor(answer.leftPairId); // 彩色背景
                markColor = '#4caf50';
                markText = '✓';
            } else {
                bgColor = 0xcccccc; // 灰色背景
                markColor = '#f44336';
                markText = '✗';
            }
        } else {
            // Correct Answers 頁面：顯示正確答案
            displayText = answer.correctAnswer;
            bgColor = this.getCardColor(answer.leftPairId); // 彩色背景
            markColor = '#4caf50';
            markText = '✓';
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

        // 創建標記（勾勾或 X）
        const mark = this.add.text(x + cardWidth / 2 - 20, y - cardHeight / 2 + 10, markText, {
            fontSize: '48px',
            color: markColor,
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        mark.setOrigin(0.5);
        container.add(mark);

        // 創建中文文字（顯示用戶選擇的中文）
        const chineseText = this.add.text(chineseX, y, answer.leftText, {
            fontSize: '28px',
            color: '#000000',
            fontFamily: 'Arial',
            fontStyle: 'normal'
        });
        chineseText.setOrigin(0, 0.5);
        container.add(chineseText);
    }

    // 🔥 獲取卡片顏色（根據 pairId）
    getCardColor(pairId) {
        const colors = [
            0x4a9eff, // 藍色
            0xff4a4a, // 紅色
            0xffa500, // 橙色
            0x4caf50, // 綠色
            0x9c27b0, // 紫色
            0xffeb3b, // 黃色
            0x00bcd4, // 青色
            0xff9800  // 深橙色
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
    showEnterNamePage() {
        console.log('🎮 顯示輸入名稱頁面');

        // 隱藏遊戲結束模態框
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

        // 輸入框
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

        // 底部按鈕區域
        const buttonY = pageHeight / 2 - 60;

        // Skip 按鈕
        this.createModalButton(page, -120, buttonY, 'Skip', () => {
            console.log('🎮 點擊 Skip 按鈕');
            this.hideEnterNamePage();
        });

        // Enter 按鈕
        this.createModalButton(page, 120, buttonY, 'Enter', () => {
            console.log('🎮 點擊 Enter 按鈕，名稱:', this.playerName);
            this.submitPlayerName();
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

        // 顯示遊戲結束模態框
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
            ['↑', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '←']
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

        // 空格鍵
        const spaceY = y + 3 * (keyHeight + keySpacing);
        this.createKeyButton(container, x, spaceY, 'Space', 200, keyHeight, inputText);

        // 123 按鈕（切換到數字鍵盤）
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
        if (key === '←') {
            // 刪除最後一個字符
            this.playerName = this.playerName.slice(0, -1);
        } else if (key === '↑') {
            // 切換大小寫（暫時不實現）
            console.log('🎮 切換大小寫');
        } else if (key === 'Space') {
            // 添加空格
            this.playerName += ' ';
        } else if (key === '123') {
            // 切換到數字鍵盤（暫時不實現）
            console.log('🎮 切換到數字鍵盤');
        } else {
            // 添加字符
            if (this.playerName.length < 20) {
                this.playerName += key;
            }
        }

        // 更新輸入文字
        inputText.setText(this.playerName);
        console.log('🎮 當前名稱:', this.playerName);
    }

    // 🔥 提交玩家名稱
    async submitPlayerName() {
        if (!this.playerName || this.playerName.trim() === '') {
            console.log('🎮 名稱為空，跳過提交');
            this.hideEnterNamePage();
            return;
        }

        console.log('🎮 提交玩家名稱:', this.playerName);

        // 計算總分數
        const totalCorrect = this.allPagesAnswers.filter(answer => answer.isCorrect).length;
        const totalQuestions = this.pairs.length;

        // 獲取 activityId
        const urlParams = new URLSearchParams(window.location.search);
        const activityId = urlParams.get('activityId');

        // 準備排行榜數據（匹配 API 格式）
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
        };

        console.log('🎮 排行榜數據:', leaderboardData);

        try {
            // 發送到 API
            const response = await fetch('/api/leaderboard', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(leaderboardData)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ 排行榜數據已保存:', result);

                // 隱藏輸入名稱頁面
                this.hideEnterNamePage();

                // 顯示排行榜
                this.showLeaderboard();
            } else {
                console.error('❌ 保存排行榜數據失敗:', response.status);
                this.hideEnterNamePage();
            }
        } catch (error) {
            console.error('❌ 保存排行榜數據錯誤:', error);
            this.hideEnterNamePage();
        }
    }

    // 🔥 顯示排行榜
    async showLeaderboard() {
        console.log('🎮 顯示排行榜');

        const width = this.scale.width;
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

        // 創建排行榜頁面容器
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

        // 載入排行榜數據
        try {
            const response = await fetch(`/api/leaderboard?activityId=${activityId}&limit=10`);
            if (response.ok) {
                const result = await response.json();
                const leaderboardData = result.data || [];
                console.log('✅ 排行榜數據:', leaderboardData);

                // 顯示排行榜列表
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
                console.error('❌ 獲取排行榜數據失敗:', response.status);
            }
        } catch (error) {
            console.error('❌ 獲取排行榜數據錯誤:', error);
        }

        // 底部按鈕
        const buttonY = pageHeight / 2 - 60;
        this.createModalButton(page, 0, buttonY, 'Back', () => {
            console.log('🎮 點擊 Back 按鈕');
            this.hideLeaderboard();
        });

        // 保存頁面引用
        this.leaderboardPage = { overlay, page };
    }

    // 🔥 隱藏排行榜
    hideLeaderboard() {
        if (this.leaderboardPage) {
            this.leaderboardPage.overlay.destroy();
            this.leaderboardPage.page.destroy();
            this.leaderboardPage = null;
        }

        // 顯示遊戲結束模態框
        if (this.gameCompleteModal) {
            this.gameCompleteModal.overlay.setVisible(true);
            this.gameCompleteModal.modal.setVisible(true);
        }
    }

    // 🔥 P1-4: 修正事件監聽器管理 - shutdown 方法
    shutdown() {
        console.log('🎮 GameScene: shutdown 方法開始 - 清理事件監聽器');

        // 移除 resize 事件監聽器
        if (this.scale) {
            this.scale.off('resize', this.handleResize, this);
            console.log('✅ 已移除 resize 事件監聽器');
        }

        // 移除 fullscreen 事件監聽器（如果存在）
        if (document) {
            document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
            console.log('✅ 已移除 fullscreenchange 事件監聽器');
        }

        // 移除 orientation 事件監聽器（如果存在）
        if (window) {
            window.removeEventListener('orientationchange', this.handleOrientationChange);
            console.log('✅ 已移除 orientationchange 事件監聽器');
        }

        // 停止計時器
        if (this.timerEvent) {
            this.timerEvent.remove();
            this.timerEvent = null;
            console.log('✅ 已停止計時器');
        }

        // 清理遊戲狀態
        this.sceneStopped = true;
        console.log('🎮 GameScene: shutdown 方法完成 - 所有事件監聽器已清理');
    }

    // 🔥 P1-4: 全螢幕變化事件處理
    handleFullscreenChange() {
        console.log('🎮 全螢幕狀態變化:', document.fullscreenElement ? '進入全螢幕' : '退出全螢幕');
        // 重新計算佈局
        this.updateLayout();
    }

    // 🔥 P1-4: 設備方向變化事件處理
    handleOrientationChange() {
        const isPortrait = window.matchMedia('(orientation: portrait)').matches;
        console.log('🎮 設備方向變化:', isPortrait ? '直向' : '橫向');
        // 重新計算佈局
        this.updateLayout();
    }
}

