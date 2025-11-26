// ============================================
// 響應式設計配置
// ============================================
// 注意：RESPONSIVE_BREAKPOINTS, DESIGN_TOKENS, GameResponsiveLayout 等
// 已在 index.html 中作為全局腳本加載，無需 import

// 🔥 分離模式配置系統（Phase 4 重構）
// 注意：這些配置類已在 index.html 中作為全局腳本加載
// - SeparatedModeConfig
// - DeviceDetector
// - CalculationConstants
// - SeparatedLayoutCalculator
// - SeparatedLayoutRenderer

// 🔥 v78.0 版本標記 - 添加所有缺失的方法（包括 calculateLeftCardPosition 和 calculateRightCardPosition）
const GAME_VERSION = 'v78.0-complete-method-patch';

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
        this.rightEmptyBoxes = [];  // 🔥 [v35.0] 單獨存儲右側空白框
        this.matchedPairs = new Set();
        this.isDragging = false;
        this.dragStartCard = null;
        this.sceneStopped = false;  // 🔥 場景停止狀態標記

        // 🔥 [v129.0] 保存所有頁面的配對結果（用於返回前面頁面時顯示勾勾和叉叉）
        this.allPagesMatchedPairs = {};  // 格式：{ pageIndex: Set(pairIds) }

        // 🔥 [v156.0] 保存所有頁面的卡片位置（用於返回前面頁面時恢復卡片位置）
        this.allPagesCardPositions = {};  // 格式：{ pageIndex: { pairId: { x, y } } }

        // 🔥 分頁功能
        this.itemsPerPage = 7;  // 默認每頁 7 個詞彙（可配置）
        this.currentPage = 0;   // 當前頁碼（從 0 開始）
        this.totalPages = 1;    // 總頁數
        this.enablePagination = false;  // 是否啟用分頁

        // 🔥 [v126.0] 分頁選擇器組件（保持在屏幕上）
        this.pageSelectorComponents = null;  // 分頁選擇器的所有組件

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

        // 🔥 [v77.0] 減少到 10 個詞彙，與 API 加載的 itemsPerPage: 10 保持一致
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
            },
            {
                id: 7,
                question: 'Ocean',
                answer: '海洋',
                english: 'Ocean',
                chinese: '海洋',
                imageUrl: imageB,
                chineseImageUrl: null,
                audioUrl: audioA
            },
            {
                id: 8,
                question: 'Forest',
                answer: '森林',
                english: 'Forest',
                chinese: '森林',
                imageUrl: null,
                chineseImageUrl: null,
                audioUrl: audioB
            },
            {
                id: 9,
                question: 'Desert',
                answer: '沙漠',
                english: 'Desert',
                chinese: '沙漠',
                imageUrl: imageA,
                chineseImageUrl: null,
                audioUrl: null
            },
            {
                id: 10,
                question: 'River',
                answer: '河流',
                english: 'River',
                chinese: '河流',
                imageUrl: imageB,
                chineseImageUrl: null,
                audioUrl: audioA
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
            let activityId = urlParams.get('activityId');
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

            // 🔥 [v77.1] 如果沒有 activityId，使用默認的 activityId（API 詞彙數據）
            if (!activityId) {
                activityId = 'cmhjff7340001jf04htar2e5k';  // 🔥 [v77.1] 默認 activityId
                console.log('🔥 [v77.1] 未提供 activityId，使用默認值:', activityId);
            }

            console.log('🔍 Match-up 遊戲 - URL 參數:', {
                activityId,
                customVocabulary,
                fullURL: window.location.href
            });

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

        // 🔥 [v1.0] 修復移動設備黑屏：檢測設備類型並調整初始尺寸
        const isMobile = window.innerWidth < 768;
        const isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;
        const isLandscape = window.innerWidth > window.innerHeight;
        const dpr = window.devicePixelRatio || 1;

        console.log('📱 [v1.0] 設備檢測:', {
            isMobile,
            isTablet,
            isLandscape,
            dpr,
            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight
        });

        // 🔍 [v70.0] 記錄 create 開始時的尺寸信息
        const createStartWidth = this.scale.width;
        const createStartHeight = this.scale.height;
        console.log('🔍 [v70.0] ========== create 開始時的尺寸 ==========', {
            scaleWidth: createStartWidth,
            scaleHeight: createStartHeight,
            gameConfigWidth: this.game.config.width,
            gameConfigHeight: this.game.config.height,
            containerWidth: this.scale.gameSize.width,
            containerHeight: this.scale.gameSize.height,
            baseWidth: this.game.screenBaseSize.width,
            baseHeight: this.game.screenBaseSize.height,
            timestamp: new Date().toISOString()
        });

        console.log('🎮 GameScene: 場景尺寸', {
            width: this.scale.width,
            height: this.scale.height,
            gameWidth: this.game.config.width,
            gameHeight: this.game.config.height
        });

        // 清空數組（防止重新開始時重複）
        this.leftCards = [];
        this.rightCards = [];
        this.rightEmptyBoxes = [];  // 🔥 [v35.0] 清空右側空白框
        this.matchedPairs = new Set();
        this.isDragging = false;
        this.dragStartCard = null;
        this.submitButton = null;  // 🔥 提交答案按鈕
        this.gameCompleteModal = null;  // 🔥 遊戲完成模態框
        this.pageCompleteModal = null;  // 🔥 [v94.0] 頁面完成模態框
        this.gameCompleteModalShown = false;  // 🔥 [v65.0] 防止重複顯示遊戲完成模態框

        // 顯示載入提示
        const width = this.scale.width;
        const height = this.scale.height;
        console.log('🎮 GameScene: 創建背景和載入文字', { width, height });

        // 🎨 [v1.0] 使用中世紀背景圖片或白色背景作為備用
        if (this.textures.exists('game-background')) {
            const background = this.add.image(width / 2, height / 2, 'game-background');
            background.setDepth(-1);
            background.setName('background-image');  // 🎨 [v1.0] 設置名稱以便後續查找
            // 調整背景圖片大小以覆蓋整個遊戲區域
            const scaleX = width / background.width;
            const scaleY = height / background.height;
            const scale = Math.max(scaleX, scaleY);
            background.setScale(scale);

            // 🔥 [v119.0] FIT 模式下無需註冊到 ResizeManager
            // Phaser 會自動處理背景的縮放和位置
            console.log('✅ GameScene: 背景已創建（FIT 模式自動處理）');

            console.log('🎨 GameScene: 中世紀背景圖片已加載');
        } else {
            // 備用：使用白色背景
            const whiteBg = this.add.rectangle(width / 2, height / 2, width, height, 0xffffff);
            whiteBg.setDepth(-1);
            whiteBg.setName('background-image');  // 🎨 [v1.0] 設置名稱以便後續查找

            // 🔥 [v119.0] FIT 模式下無需註冊到 ResizeManager
            // Phaser 會自動處理背景的縮放和位置
            console.log('✅ GameScene: 白色背景已創建（FIT 模式自動處理）');

            console.log('⚠️ GameScene: 背景圖片未找到，使用白色背景');
        }

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

        // 🔍 [v70.0] 詞彙載入完成後的調適訊息 - 比較尺寸變化
        const afterLoadWidth = this.scale.width;
        const afterLoadHeight = this.scale.height;
        console.log('🔍 [v70.0] ========== 詞彙載入完成後的尺寸 ==========', {
            success: success,
            pairsCount: this.pairs ? this.pairs.length : 0,
            scaleWidth: afterLoadWidth,
            scaleHeight: afterLoadHeight,
            containerWidth: this.scale.gameSize.width,
            containerHeight: this.scale.gameSize.height,
            baseWidth: this.game.screenBaseSize.width,
            baseHeight: this.game.screenBaseSize.height,
            widthChanged: afterLoadWidth !== createStartWidth,
            heightChanged: afterLoadHeight !== createStartHeight,
            widthDifference: afterLoadWidth - createStartWidth,
            heightDifference: afterLoadHeight - createStartHeight,
            timestamp: new Date().toISOString()
        });

        // 🔍 [v67.0] 詞彙載入完成後的調適訊息
        console.log('🔍 [v67.0] 詞彙載入完成 - 調適訊息', {
            success: success,
            pairsCount: this.pairs ? this.pairs.length : 0,
            timestamp: new Date().toISOString(),
            containerSize: { width: width, height: height }
        });

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

        // 🔥 [v119.0] FIT 模式下無需初始化 ResponsiveManager
        // Phaser 會自動處理所有響應式邏輯
        console.log('✅ GameScene: FIT 模式已啟用，無需 ResponsiveManager');

        // 🔥 v54.0: 改進的 resize 事件 - 保存已配對狀態和洗牌順序，重新創建卡片但保持詞彙數據和卡片順序
        // 監聽螢幕尺寸變化 - 重新創建卡片但保持已配對狀態和卡片順序
        this.resizeTimeout = null;
        this.shuffledPairsCache = null;  // 🔥 v54.0: 緩存洗牌後的順序
        this.savedPageAnswers = null;    // 🔥 [v105.0] 新增：保存當前頁面的答案
        this.allPagesShuffledCache = {};  // 🔥 [v169.0] 新增：保存每一頁的洗牌順序，用於返回上一頁時保持空白框順序一致
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

                // 🔥 [v105.0] 新增：保存當前頁面的答案
                this.savedPageAnswers = [...this.currentPageAnswers];
                console.log('🔥 [v105.0] 已保存當前頁面答案:', this.savedPageAnswers.length, '個');

                // 🔥 v54.0: 注意：不清除 shuffledPairsCache，這樣 resize 時會使用相同的洗牌順序
                console.log('🔥 [v54.0] 使用緩存的洗牌順序（如果存在）');

                // 執行重新佈局
                this.updateLayout();

                // 🔥 v54.0: 恢復已配對的卡片狀態
                this.matchedPairs = savedMatchedPairs;
                console.log('🔥 [v54.0] 已恢復已配對卡片狀態');

                // 🔥 [v105.0] 新增：恢復當前頁面的答案
                this.currentPageAnswers = this.savedPageAnswers;
                console.log('🔥 [v105.0] 已恢復當前頁面答案:', this.currentPageAnswers.length, '個');

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

        // 🔥 [v121.0] 初始化性能監控
        this.initializePerformanceMonitoring();

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
        // 🔥 [v65.0] 防止時間到後繼續減少
        if (this.remainingTime <= 0) {
            return; // 時間已到，不再更新
        }

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
    // 🔥 [v138.0] 改進：時間到了時調用統一的 game complete 模態框
    onTimeUp() {
        console.log('⏱️ 時間到！');

        // 停止計時器
        if (this.timerEvent) {
            this.timerEvent.remove();
        }

        // 🔥 [v138.0] 設置遊戲狀態為已完成
        this.gameEndTime = Date.now();
        this.totalGameTime = (this.gameEndTime - this.gameStartTime) / 1000; // 秒
        this.gameState = 'completed';

        console.log('🎮 [v138.0] 時間到！遊戲結束。總時間:', this.totalGameTime, '秒');

        // 🔥 [v138.0] 調用統一的 game complete 模態框
        this.showGameCompleteModal();
    }

    updateLayout() {
        console.log('🎮 GameScene: updateLayout 開始');

        // 🔥 [v114.0] 使用實際的容器尺寸而不是 this.scale.width/height
        // 在 Scale.NONE 模式下，this.scale.width/height 是只讀的，無法修改
        // 所以我們使用 Handler 設置的 containerWidth/containerHeight
        const layoutWidth = this.containerWidth || this.scale.width;
        const layoutHeight = this.containerHeight || this.scale.height;

        console.log('🎮 GameScene: 當前場景尺寸', {
            scaleWidth: this.scale.width,
            scaleHeight: this.scale.height,
            containerWidth: this.containerWidth,
            containerHeight: this.containerHeight,
            layoutWidth,
            layoutHeight
        });

        // 🔥 [v113.0] 詳細調試：記錄 matchedPairs 的狀態
        console.log('🔥 [v113.0] updateLayout 開始時的 matchedPairs:', {
            size: this.matchedPairs.size,
            pairs: Array.from(this.matchedPairs)
        });

        // 🔥 [v74.0] 添加詳細的調適訊息
        console.log('🔍 [v74.0] ========== updateLayout 開始 ==========', {
            timestamp: new Date().toISOString(),
            width: layoutWidth,
            height: layoutHeight,
            itemCount: this.currentPagePairs ? this.currentPagePairs.length : 'unknown',
            currentPage: this.currentPage + 1,
            totalPages: this.totalPages
        });

        try {
            // 🔥 [v202.0] 移除特定的延遲調用，而不是所有事件
            // 這樣可以避免影響計時器和其他時間相關功能
            if (this.summaryDelayedCall) {
                this.summaryDelayedCall.remove();
                this.summaryDelayedCall = null;
                console.log('🔥 [v202.0] 已移除 summaryDelayedCall');
            }
            if (this.autoProceedDelayedCall) {
                this.autoProceedDelayedCall.remove();
                this.autoProceedDelayedCall = null;
                console.log('🔥 [v202.0] 已移除 autoProceedDelayedCall');
            }

            // 🔥 [v127.0] 保存分頁選擇器組件，以便在清除元素後重新創建
            const savedPageSelectorComponents = this.pageSelectorComponents;
            console.log('🔥 [v127.0] 已保存分頁選擇器組件:', {
                hasSavedComponents: !!savedPageSelectorComponents,
                currentPage: this.currentPage + 1,
                totalPages: this.totalPages
            });

            // 清除所有現有元素
            console.log('🎮 GameScene: 清除所有現有元素');
            console.log('🔥 [v230.1] updateLayout 清除前 - 子元素數:', this.children.list.length);

            // 🎨 [v1.0] 保存背景圖片引用，避免被銷毀
            const backgroundImage = this.children.getByName('background-image');
            console.log('🎨 [v1.0] 背景圖片引用:', !!backgroundImage);

            // 🔥 [v217.2] 在銷毀前明確清除卡片數組（防止引用殘留）
            console.log('🔥 [v217.2] 銷毀前的卡片狀態:', {
                leftCardsCount: this.leftCards.length,
                rightCardsCount: this.rightCards.length,
                rightEmptyBoxesCount: this.rightEmptyBoxes.length
            });

            // 🔥 [v230.4] 檢查卡片數組中是否有被銷毀的卡片
            console.log('🔥 [v230.4] 檢查卡片數組中的卡片狀態:');
            let destroyedLeftCards = 0, destroyedRightCards = 0, destroyedEmptyBoxes = 0;
            this.leftCards.forEach(card => {
                if (card && card.isDestroyed) destroyedLeftCards++;
            });
            this.rightCards.forEach(card => {
                if (card && card.isDestroyed) destroyedRightCards++;
            });
            this.rightEmptyBoxes.forEach(box => {
                if (box && box.isDestroyed) destroyedEmptyBoxes++;
            });
            console.log('🔥 [v230.4] 已銷毀的卡片 - 左:', destroyedLeftCards, '右:', destroyedRightCards, '空白框:', destroyedEmptyBoxes);

            // 🔥 [v1.5] 先清除空白框中的所有子元素（嵌套的卡片）
            if (this.rightEmptyBoxes && this.rightEmptyBoxes.length > 0) {
                this.rightEmptyBoxes.forEach(box => {
                    if (box && !box.isDestroyed && box.list && box.list.length > 0) {
                        console.log('🔥 [v1.5] 清除空白框中的子元素:', {
                            boxPairId: box.getData('pairId'),
                            childrenCount: box.list.length
                        });
                        // 清除容器中的所有子元素
                        box.removeAll(true);
                    }
                });
            }

            // 明確銷毀每個卡片
            if (this.leftCards && this.leftCards.length > 0) {
                this.leftCards.forEach(card => {
                    if (card && !card.isDestroyed) {
                        card.destroy();
                    }
                });
            }

            if (this.rightCards && this.rightCards.length > 0) {
                this.rightCards.forEach(card => {
                    if (card && !card.isDestroyed) {
                        card.destroy();
                    }
                });
            }

            if (this.rightEmptyBoxes && this.rightEmptyBoxes.length > 0) {
                this.rightEmptyBoxes.forEach(box => {
                    if (box && !box.isDestroyed) {
                        box.destroy();
                    }
                });
            }

            // 然後銷毀所有其他元素（除了背景圖片）
            console.log('🔥 [v230.3] removeAll 前 - this.children.list.length:', this.children.list.length);

            this.children.removeAll(true);

            console.log('🔥 [v230.3] removeAll 後 - 子元素數:', this.children.list.length);

            // 🎨 [v1.0] 重新添加背景圖片（如果存在）
            if (backgroundImage && !backgroundImage.isDestroyed) {
                this.add.existing(backgroundImage);
                backgroundImage.setDepth(-1);
                console.log('🎨 [v1.0] 背景圖片已重新添加');
            }

            // 🔥 [v162.0] 清除卡片數組和空白框引用（因為元素已被銷毀）
            this.leftCards = [];
            this.rightCards = [];
            this.rightEmptyBoxes = [];  // 🔥 [v162.0] 清空空白框引用
            console.log('🔥 [v162.0] 已清除卡片數組和空白框引用');
            console.log('🔥 [v230.1] updateLayout 清除後 - 子元素數:', this.children.list.length);
            console.log('🔥 [v217.2] 銷毀後的卡片狀態:', {
                leftCardsCount: this.leftCards.length,
                rightCardsCount: this.rightCards.length,
                rightEmptyBoxesCount: this.rightEmptyBoxes.length
            });

            // 🔥 [v127.0] 清除分頁選擇器組件引用（因為元素已被銷毀）
            this.pageSelectorComponents = null;
            console.log('🔥 [v127.0] 已清除分頁選擇器組件引用');

            // 🔥 [v97.0] 清除提交按鈕引用，確保下一頁會重新創建按鈕
            this.submitButton = null;
            console.log('🎮 GameScene: 已清除提交按鈕引用');

            // 🎨 [v1.0] 獲取當前螢幕尺寸（用於後續計算）
            const width = this.scale.width;
            const height = this.scale.height;

            console.log('🎮 GameScene: 背景已在 create 方法中添加，跳過重複添加');
            // 🎨 [v1.0] 背景圖片已在 create 方法中添加，不需要在這裡重複添加
            // 移除白色背景以避免覆蓋背景圖片

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

            // 🔥 [v180.0] 恢復當前頁的 frameIndexToPairIdMap
            if (this.allPagesFrameIndexToPairIdMap && this.allPagesFrameIndexToPairIdMap[this.currentPage]) {
                this.frameIndexToPairIdMap = { ...this.allPagesFrameIndexToPairIdMap[this.currentPage] };
                console.log('🔥 [v180.0] 已恢復當前頁的 frameIndexToPairIdMap:', {
                    currentPage: this.currentPage,
                    mapping: this.frameIndexToPairIdMap
                });
            }

            // 🔥 [v132.0] 恢復當前頁的配對結果和答案（如果有的話）
            console.log('🔥 [v132.0] ========== updateLayout 恢復邏輯開始 ==========');
            console.log('🔥 [v132.0] 當前頁面:', {
                currentPage: this.currentPage,
                totalPages: this.totalPages,
                allPagesMatchedPairsKeys: Object.keys(this.allPagesMatchedPairs || {})
            });

            if (this.allPagesMatchedPairs && this.allPagesMatchedPairs[this.currentPage]) {
                console.log('🔥 [v132.0] ✅ 找到保存的配對結果！');
                console.log('🔥 [v132.0] 恢復當前頁的配對結果和答案:', {
                    currentPage: this.currentPage,
                    savedPairsSize: this.allPagesMatchedPairs[this.currentPage].size,
                    savedPairs: Array.from(this.allPagesMatchedPairs[this.currentPage])
                });
                this.matchedPairs = new Set(this.allPagesMatchedPairs[this.currentPage]);

                // 🔥 [v130.0] 也恢復當前頁的答案
                const pageAnswersKey = `page_${this.currentPage}_answers`;
                console.log('🔥 [v132.0] 查找答案鍵:', pageAnswersKey);
                console.log('🔥 [v132.0] 所有可用的答案鍵:', Object.keys(this).filter(k => k.startsWith('page_')));

                if (this[pageAnswersKey]) {
                    this.currentPageAnswers = [...this[pageAnswersKey]];
                    console.log('🔥 [v132.0] ✅ 已恢復 currentPageAnswers:', {
                        currentPageAnswersLength: this.currentPageAnswers.length,
                        firstAnswer: this.currentPageAnswers[0],
                        allAnswers: this.currentPageAnswers
                    });
                } else {
                    console.log('🔥 [v132.0] ❌ 當前頁沒有保存的答案');
                    this.currentPageAnswers = [];
                }

                console.log('🔥 [v132.0] 已恢復 matchedPairs:', {
                    matchedPairsSize: this.matchedPairs.size,
                    matchedPairsContent: Array.from(this.matchedPairs)
                });

                // 🔥 [v131.0] 恢復視覺效果（勾勾和叉叉）
                console.log('🔥 [v132.0] 準備調用 restoreMatchedPairsVisuals()');
                console.log('🔥 [v132.0] 調用前的狀態:', {
                    layout: this.layout,
                    leftCardsCount: this.leftCards ? this.leftCards.length : 0,
                    rightCardsCount: this.rightCards ? this.rightCards.length : 0,
                    matchedPairsSize: this.matchedPairs.size,
                    currentPageAnswersLength: this.currentPageAnswers.length
                });
                this.restoreMatchedPairsVisuals();
                console.log('🔥 [v132.0] ✅ restoreMatchedPairsVisuals() 調用完成');
            } else {
                console.log('🔥 [v132.0] ❌ 當前頁沒有保存的配對結果，matchedPairs 保持為空');
                console.log('🔥 [v132.0] allPagesMatchedPairs 狀態:', {
                    exists: !!this.allPagesMatchedPairs,
                    keys: this.allPagesMatchedPairs ? Object.keys(this.allPagesMatchedPairs) : []
                });
            }
            console.log('🔥 [v132.0] ========== updateLayout 恢復邏輯結束 ==========');

            // 🔥 [v137.0] 如果正在顯示所有答案，則在新卡片上恢復移動效果
            if (this.isShowingAllAnswers) {
                console.log('🔥 [v137.0] ========== 恢復卡片移動效果開始 ==========');
                console.log('🔥 [v137.0] 當前頁面:', {
                    currentPage: this.currentPage,
                    totalPages: this.totalPages,
                    leftCardsCount: this.leftCards ? this.leftCards.length : 0,
                    rightCardsCount: this.rightCards ? this.rightCards.length : 0,
                    rightEmptyBoxesCount: this.rightEmptyBoxes ? this.rightEmptyBoxes.length : 0,
                    layout: this.layout
                });

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
                                console.log('🔥 [v137.0] 混合模式 - 移動卡片:', { pairId, fromX: card.x, toX: rightCard.x });
                            }
                        } else {
                            // 🔥 [v223.0] 分離佈局：根據 pairId 找到對應的空白框（不是框外答案卡片）
                            const emptyBox = this.rightEmptyBoxes ? this.rightEmptyBoxes.find(box => box.getData('pairId') === pairId) : null;
                            if (emptyBox) {
                                // 🔥 [v223.0] 修復：添加卡片到空白框容器中（像 v222.0 一樣）
                                console.log('🔥 [v223.0] 準備將卡片添加到空白框容器:', {
                                    pairId: pairId,
                                    cardHasParentContainer: !!card.parentContainer,
                                    cardParentContainerType: card.parentContainer ? card.parentContainer.constructor.name : 'none'
                                });

                                // 🔥 [v223.0] 如果卡片已經有父容器，先移除
                                if (card.parentContainer) {
                                    console.log('🔥 [v223.0] 卡片已有父容器，準備移除:', {
                                        pairId: pairId,
                                        parentContainerType: card.parentContainer.constructor.name
                                    });
                                    card.parentContainer.remove(card);
                                }

                                // 🔥 [v223.0] 將卡片添加到空白框容器中
                                emptyBox.add(card);

                                // 🔥 [v223.0] 設置卡片的本地座標為 (0, 0)，使其顯示在容器中心
                                card.setPosition(0, 0);

                                console.log('🔥 [v223.0] 卡片已添加到空白框容器:', {
                                    pairId: pairId,
                                    cardLocalX: card.x,
                                    cardLocalY: card.y,
                                    cardWorldX: card.getWorldTransformMatrix().tx,
                                    cardWorldY: card.getWorldTransformMatrix().ty,
                                    emptyBoxWorldX: emptyBox.getWorldTransformMatrix().tx,
                                    emptyBoxWorldY: emptyBox.getWorldTransformMatrix().ty
                                });
                            } else {
                                console.warn('⚠️ [v223.0] 分離模式 - 未找到空白框:', { pairId });
                            }
                        }
                    });
                }
                console.log('🔥 [v137.0] ========== 恢復卡片移動效果結束 ==========');
            }

            // 🔥 [v127.0] 重新創建分頁選擇器（如果有多頁）
            if (this.enablePagination && this.totalPages > 1) {
                console.log('🔥 [v127.0] 重新創建分頁選擇器');
                const selectorWidth = 80;
                const selectorHeight = 50;
                const buttonY = 20;
                const selectorX = width / 2;
                this.createPageSelector(selectorX, buttonY, selectorWidth, selectorHeight);
            }

            // 🔥 [v156.0] 恢復卡片位置（如果有保存的位置）
            this.restoreCardPositions(this.currentPage);

            // 🔥 [v217.2] 恢復 "Show all answers" 狀態（增強版本）
            if (this.allPagesShowAllAnswersState && this.allPagesShowAllAnswersState[this.currentPage]) {
                console.log('🔥 [v217.2] 檢測到第 ' + (this.currentPage + 1) + ' 頁有保存的 showAllAnswers 狀態，準備恢復');
                console.log('🔥 [v217.2] 恢復前的卡片信息:', {
                    currentPage: this.currentPage,
                    leftCardsCount: this.leftCards.length,
                    leftCardsPairIds: this.leftCards.map(c => c.getData('pairId')),
                    rightEmptyBoxesCount: this.rightEmptyBoxes ? this.rightEmptyBoxes.length : 0,
                    rightEmptyBoxesPairIds: this.rightEmptyBoxes ? this.rightEmptyBoxes.map(b => b.getData('pairId')) : []
                });

                // 🔥 [v217.2] 增加延遲時間到 300ms，確保卡片完全創建和渲染
                this.time.delayedCall(300, () => {
                    console.log('🔥 [v217.2] 延遲 300ms 後，準備恢復 showAllAnswers 狀態');
                    console.log('🔥 [v217.2] 恢復時的卡片信息:', {
                        currentPage: this.currentPage,
                        leftCardsCount: this.leftCards.length,
                        leftCardsPairIds: this.leftCards.map(c => c.getData('pairId')),
                        rightEmptyBoxesCount: this.rightEmptyBoxes ? this.rightEmptyBoxes.length : 0,
                        rightEmptyBoxesPairIds: this.rightEmptyBoxes ? this.rightEmptyBoxes.map(b => b.getData('pairId')) : []
                    });
                    this.showAllCorrectAnswers();
                });
            }

            // 🔥 移除重新開始按鈕：用戶要求拿掉
            console.log('🎮 GameScene: updateLayout 完成');
            console.log('🔍 [v74.0] ========== updateLayout 結束（成功）==========', {
                timestamp: new Date().toISOString(),
                leftCardsCount: this.leftCards ? this.leftCards.length : 0,
                rightCardsCount: this.rightCards ? this.rightCards.length : 0,
                rightEmptyBoxesCount: this.rightEmptyBoxes ? this.rightEmptyBoxes.length : 0
            });
        } catch (error) {
            console.error('❌ GameScene: updateLayout 失敗', error);
            console.error('❌ 錯誤堆棧:', error.stack);

            // 🔥 [v74.0] 詳細的錯誤診斷訊息
            console.error('🔍 [v74.0] ========== 詳細錯誤診斷 ==========', {
                errorMessage: error.message,
                errorName: error.name,
                errorType: typeof error,
                timestamp: new Date().toISOString(),
                currentPage: this.currentPage + 1,
                totalPages: this.totalPages,
                itemCount: this.currentPagePairs ? this.currentPagePairs.length : 'unknown',
                layout: this.layout,
                width: this.scale.width,
                height: this.scale.height
            });

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

            console.log('🔍 [v74.0] ========== updateLayout 結束（失敗）==========');
        }
    }

    handleResize(gameSize) {
        console.log('🎮 GameScene: handleResize 觸發', gameSize);
        // 螢幕尺寸改變時重新佈局
        this.updateLayout();
    }

    // 🔥 v53.0: 恢復已配對卡片的視覺效果
    // 🔥 [v104.0] 修復：重新調整勾勾和叉叉的位置（當卡片大小改變時）
    // 🔥 [v132.0] 添加詳細調試信息
    // 🔥 [v175.0] 修復：清除舊的標記，確保頁面返回時正確顯示答案
    restoreMatchedPairsVisuals() {
        try {
            console.log('🔥 [v175.0] ========== restoreMatchedPairsVisuals 開始 ==========');

            // 🔥 [v175.0] 新增：清除所有舊的標記（checkMark 和 xMark）
            console.log('🔥 [v175.0] 清除舊的標記開始');
            if (this.leftCards && this.leftCards.length > 0) {
                this.leftCards.forEach(card => {
                    if (card.checkMark) {
                        console.log(`🔥 [v175.0] 清除左卡片 ${card.getData('pairId')} 的勾勾`);
                        card.checkMark.destroy();
                        card.checkMark = null;
                    }
                    if (card.xMark) {
                        console.log(`🔥 [v175.0] 清除左卡片 ${card.getData('pairId')} 的叉叉`);
                        card.xMark.destroy();
                        card.xMark = null;
                    }
                });
            }

            if (this.rightCards && this.rightCards.length > 0) {
                this.rightCards.forEach(card => {
                    if (card.checkMark) {
                        console.log(`🔥 [v175.0] 清除右卡片 ${card.getData('pairId')} 的勾勾`);
                        card.checkMark.destroy();
                        card.checkMark = null;
                    }
                    if (card.xMark) {
                        console.log(`🔥 [v175.0] 清除右卡片 ${card.getData('pairId')} 的叉叉`);
                        card.xMark.destroy();
                        card.xMark = null;
                    }
                });
            }

            // 🔥 [v177.0] 新增：清除空白框上的標記
            if (this.rightEmptyBoxes && this.rightEmptyBoxes.length > 0) {
                this.rightEmptyBoxes.forEach(emptyBox => {
                    if (emptyBox.checkMark) {
                        console.log(`🔥 [v177.0] 清除空白框 ${emptyBox.getData('pairId')} 的勾勾`);
                        emptyBox.checkMark.destroy();
                        emptyBox.checkMark = null;
                    }
                    if (emptyBox.xMark) {
                        console.log(`🔥 [v177.0] 清除空白框 ${emptyBox.getData('pairId')} 的叉叉`);
                        emptyBox.xMark.destroy();
                        emptyBox.xMark = null;
                    }
                });
            }
            console.log('🔥 [v177.0] 清除舊的標記完成（包括空白框）');

            console.log('🔥 [v132.0] ========== restoreMatchedPairsVisuals 開始 ==========');
            console.log('🔥 [v132.0] 輸入參數檢查:', {
                hasMatchedPairs: !!this.matchedPairs,
                matchedPairsSize: this.matchedPairs ? this.matchedPairs.size : 0,
                hasLeftCards: !!this.leftCards,
                leftCardsCount: this.leftCards ? this.leftCards.length : 0,
                hasRightCards: !!this.rightCards,
                rightCardsCount: this.rightCards ? this.rightCards.length : 0,
                layout: this.layout,
                currentPageAnswersLength: this.currentPageAnswers ? this.currentPageAnswers.length : 0
            });

            // 🔥 [v106.0] 修復：即使 matchedPairs 為空，也要重新創建勾勾和叉叉
            // 先恢復已配對卡片的視覺效果（如果有的話）
            if (this.matchedPairs && this.matchedPairs.size > 0) {
                console.log('🔥 [v132.0] ✅ matchedPairs 不為空，開始恢復視覺效果');
                // 遍歷所有已配對的卡片 ID
                for (const pairId of this.matchedPairs) {
                    console.log(`🔥 [v132.0] 處理 pairId: ${pairId}`);
                    // 查找對應的卡片
                    const leftCard = this.leftCards?.find(card => card.getData('pairId') === pairId);
                    const rightCard = this.rightCards?.find(card => card.getData('pairId') === pairId);

                    console.log(`🔥 [v132.0] 卡片查找結果 (pairId: ${pairId}):`, {
                        hasLeftCard: !!leftCard,
                        hasRightCard: !!rightCard
                    });

                    if (leftCard && rightCard) {
                        // 應用已配對的視覺效果
                        leftCard.setAlpha(0.5);
                        rightCard.setAlpha(0.5);

                        // 禁用已配對卡片的互動
                        leftCard.setInteractive(false);
                        rightCard.setInteractive(false);

                        console.log(`✅ [v132.0] 已恢復卡片 ${pairId} 的視覺效果`);
                    }
                }
            } else {
                console.log('🔥 [v132.0] ❌ matchedPairs 為空或不存在，檢查是否可以使用 currentPageAnswers 恢復');

                // 🔥 [v134.0] 新增：如果 matchedPairs 為空但 currentPageAnswers 不為空，使用 currentPageAnswers 恢復視覺效果
                if (this.currentPageAnswers && this.currentPageAnswers.length > 0) {
                    console.log('🔥 [v134.0] ✅ 使用 currentPageAnswers 恢復視覺效果');
                    console.log('🔥 [v134.0] currentPageAnswers 詳情:', {
                        length: this.currentPageAnswers.length,
                        answers: this.currentPageAnswers.map(a => ({
                            pairId: a.pairId || a.leftPairId,
                            isCorrect: a.isCorrect,
                            leftText: a.leftText,
                            rightText: a.rightText
                        }))
                    });

                    // 遍歷 currentPageAnswers，根據 isCorrect 屬性顯示勾勾或叉叉
                    this.currentPageAnswers.forEach((answer, index) => {
                        const pairId = answer.pairId || answer.leftPairId;
                        console.log(`🔥 [v134.0] 處理答案 ${index + 1}/${this.currentPageAnswers.length}:`, {
                            pairId,
                            isCorrect: answer.isCorrect,
                            leftText: answer.leftText,
                            rightText: answer.rightText
                        });

                        if (this.layout === 'mixed') {
                            // 混合模式：找到對應的英文卡片
                            const leftCard = this.leftCards?.find(card => card.getData('pairId') === pairId);
                            console.log(`🔥 [v134.0] 混合模式 - 查找卡片 pairId: ${pairId}:`, {
                                found: !!leftCard,
                                cardX: leftCard ? leftCard.x : null,
                                cardY: leftCard ? leftCard.y : null
                            });

                            if (leftCard) {
                                if (answer.isCorrect) {
                                    console.log(`✅ [v134.0] 卡片 ${pairId} 顯示勾勾`);
                                    this.showCorrectAnswer(leftCard, answer.rightText || answer.correctAnswer);
                                } else {
                                    console.log(`❌ [v134.0] 卡片 ${pairId} 顯示叉叉`);
                                    this.showIncorrectAnswer(leftCard, answer.rightText || answer.correctAnswer);
                                }
                            }
                        } else {
                            // 🔥 [v181.0] 修復：分離模式應該在左卡片上顯示視覺指示器
                            // 找到對應的左卡片（根據 currentFrameIndex）
                            const leftCard = this.leftCards?.find(card => card.getData('pairId') === pairId);
                            console.log(`🔥 [v181.0] 分離模式 - 查找左卡片 pairId: ${pairId}:`, {
                                found: !!leftCard,
                                cardX: leftCard ? leftCard.x : null,
                                cardY: leftCard ? leftCard.y : null
                            });

                            if (leftCard) {
                                if (answer.isCorrect) {
                                    console.log(`✅ [v181.0] 左卡片 ${pairId} 顯示勾勾`);
                                    this.showCorrectAnswer(leftCard, answer.rightText || answer.correctAnswer);
                                } else {
                                    console.log(`❌ [v181.0] 左卡片 ${pairId} 顯示叉叉`);
                                    this.showIncorrectAnswer(leftCard, answer.rightText || answer.correctAnswer);
                                }
                            }
                        }
                    });
                    console.log('🔥 [v134.0] ✅ 使用 currentPageAnswers 恢復視覺效果完成');
                }
            }

            // 🔥 [v114.0] 修復：只在有已配對卡片時才恢復標記
            // 這樣可以確保：
            // 1. 進入新頁面時，沒有標記（因為 matchedPairs 被清空了）
            // 2. 窗口大小改變時，已配對的標記會被恢復
            console.log('🔥 [v132.0] 檢查是否需要恢復標記');

            if (this.matchedPairs && this.matchedPairs.size > 0) {
                console.log('🔥 [v132.0] ✅ 根據 matchedPairs 重新創建標記');

                // 獲取當前頁的詞彙數據
                const startIndex = this.currentPage * this.itemsPerPage;
                const endIndex = Math.min(startIndex + this.itemsPerPage, this.pairs.length);
                const currentPagePairs = this.pairs.slice(startIndex, endIndex);

                console.log('🔥 [v132.0] 當前頁面信息:', {
                    currentPage: this.currentPage,
                    startIndex,
                    endIndex,
                    currentPagePairsLength: currentPagePairs.length,
                    matchedPairsSize: this.matchedPairs.size,
                    layout: this.layout
                });

                // 在混合模式中，根據當前卡片位置來創建標記
                if (this.layout === 'mixed') {
                    console.log('🔥 [v132.0] 進入混合模式標記創建邏輯');
                    currentPagePairs.forEach((pair, pairIndex) => {
                        // 在混合模式中，每個詞彙對應一個框位置（pairIndex）
                        const frameIndex = pairIndex;

                        console.log(`🔥 [v132.0] 處理詞彙對 ${pairIndex + 1}/${currentPagePairs.length}:`, {
                            pairId: pair.id,
                            chinese: pair.chinese,
                            frameIndex
                        });

                        // 找到當前在這個框位置的英文卡片
                        const currentCardInFrame = this.leftCards?.find(card => {
                            const cardFrameIndex = card.getData('currentFrameIndex');
                            console.log(`🔥 [v132.0] 檢查卡片 - pairId: ${card.getData('pairId')}, currentFrameIndex: ${cardFrameIndex}, 目標frameIndex: ${frameIndex}`);
                            return cardFrameIndex === frameIndex;
                        });

                        console.log(`🔥 [v132.0] 框位置 ${frameIndex} 的卡片查找結果:`, {
                            found: !!currentCardInFrame,
                            pairId: currentCardInFrame ? currentCardInFrame.getData('pairId') : null
                        });

                        if (currentCardInFrame) {
                            const currentCardPairId = currentCardInFrame.getData('pairId');
                            const isCorrect = pair.id === currentCardPairId;

                            console.log(`🔥 [v132.0] 混合模式 - 詞彙對 ${pairIndex + 1}/${currentPagePairs.length}:`, {
                                pairId: pair.id,
                                chinese: pair.chinese,
                                expectedEnglish: pair.english,
                                currentCardPairId: currentCardPairId,
                                isCorrect
                            });

                            // 根據配對結果創建勾勾或叉叉
                            if (isCorrect) {
                                console.log(`✅ [v132.0] 卡片 ${currentCardPairId} 顯示勾勾`);
                                this.showCorrectAnswer(currentCardInFrame, pair.english);
                            } else {
                                console.log(`❌ [v132.0] 卡片 ${currentCardPairId} 顯示叉叉`);
                                this.showIncorrectAnswer(currentCardInFrame, pair.english);
                            }
                        } else {
                            console.log(`⚠️ [v132.0] 框位置 ${frameIndex} 沒有卡片`);
                        }
                    });
                } else {
                    // 分離模式：根據 matchedPairs 來創建標記
                    console.log('🔥 [v114.0] 分離模式：根據 matchedPairs 創建標記');

                    currentPagePairs.forEach((pair, pairIndex) => {
                        // 在分離模式中，找到對應的右卡片
                        const rightCard = this.rightCards?.find(card => card.getData('pairId') === pair.id);

                        if (rightCard) {
                            // 檢查這個詞彙是否已配對
                            const isMatched = this.matchedPairs.has(pair.id);

                            if (isMatched) {
                                // 找到配對的左卡片
                                const leftCard = this.leftCards?.find(card => card.getData('matchedWith') === rightCard);
                                const isCorrect = leftCard && leftCard.getData('pairId') === pair.id;

                                console.log(`🔥 [v114.0] 分離模式 - 詞彙對 ${pairIndex + 1}/${currentPagePairs.length}:`, {
                                    pairId: pair.id,
                                    isMatched,
                                    isCorrect
                                });

                                if (isCorrect) {
                                    console.log(`✅ [v114.0] 卡片 ${pair.id} 顯示勾勾`);
                                    this.showCorrectAnswer(rightCard, pair.english);
                                } else {
                                    console.log(`❌ [v114.0] 卡片 ${pair.id} 顯示叉叉`);
                                    this.showIncorrectAnswer(rightCard, pair.english);
                                }
                            }
                        }
                    });
                }
            } else {
                console.log('ℹ️ [v114.0] matchedPairs 為空，不需要恢復標記');
            }

            console.log('✅ [v53.0] 已配對卡片視覺效果恢復完成');
        } catch (error) {
            console.error('❌ [v53.0] 恢復已配對卡片視覺效果失敗:', error);
        }
    }

    createCards() {
        console.log('🎮 GameScene: createCards 開始');
        console.log('🎮 GameScene: pairs 數據', this.pairs);

        // 🔥 [v116.0] 清空 leftCards 和 rightCards 數組，防止卡片累積
        console.log('🔥 [v116.0] 清空卡片數組前:', {
            leftCardsCount: this.leftCards ? this.leftCards.length : 0,
            rightCardsCount: this.rightCards ? this.rightCards.length : 0
        });
        this.leftCards = [];
        this.rightCards = [];
        this.rightEmptyBoxes = [];  // 🔥 [v35.0] 清空右側空白框
        console.log('🔥 [v116.0] 已清空卡片數組');

        // 🔥 [v115.0] 詳細調適訊息：追蹤頁面狀態
        console.log('🔥 [v115.0] ========== 創建卡片開始 ==========');
        console.log('🔥 [v115.0] 當前頁面狀態:', {
            currentPage: this.currentPage,
            totalPages: this.totalPages,
            pageDisplayName: `第 ${this.currentPage + 1} 頁 / 共 ${this.totalPages} 頁`,
            matchedPairsSize: this.matchedPairs ? this.matchedPairs.size : 0,
            matchedPairsContent: this.matchedPairs ? Array.from(this.matchedPairs) : [],
            layout: this.layout
        });

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

        // 🔥 [v115.0] 詳細調適訊息：列出當前頁的所有詞彙
        console.log('🔥 [v115.0] 當前頁詞彙列表:');
        currentPagePairs.forEach((pair, index) => {
            console.log(`  [${index + 1}] ID: ${pair.id}, 英文: ${pair.question || pair.english}, 中文: ${pair.answer || pair.chinese}`);
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

        // 🔥 [v120.0] 響應式卡片尺寸計算 - 基於實際容器尺寸
        const cardSizeConfig = this.calculateResponsiveCardSize(width, height, currentPagePairs.length);
        const cardWidth = cardSizeConfig.cardWidth;
        const cardHeight = cardSizeConfig.cardHeight;
        const cardFontSize = cardSizeConfig.cardFontSize;

        console.log('🎮 GameScene: 卡片尺寸', {
            cardWidth: cardWidth.toFixed(1),
            cardHeight: cardHeight.toFixed(1),
            cardFontSize: cardFontSize.toFixed(1)
        });

        // 🔥 [v10.0] 改進的響應式位置計算 - 三等分佈局 + 計時器間距
        // 容器佈局：左33% | 中33% | 右33%
        // 🔥 [v11.0] 改進：自動計算頂部和底部邊距（與混合模式一致）

        // 先計算響應式間距（需要在計算卡片總高度之前）
        const leftSpacing = cardHeight + Math.max(5, height * 0.01);   // 卡片高度 + 5px 或 1% 高度
        const rightSpacing = cardHeight + Math.max(15, height * 0.03); // 卡片高度 + 15px 或 3% 高度

        console.log('🎮 GameScene: 卡片間距', { leftSpacing, rightSpacing });

        // 🔥 [v19.0] 計算可用高度和邊距 - 考慮計時器實際高度 - 左右單元往下移動 50px
        const timerHeight = 50;            // 計時器實際高度（文字 28px + 邊距）
        const timerGap = 20;               // 計時器下方間距（20px）
        const additionalTopMargin = 90;    // 額外上方邊距（左右單元往下移動 50px，共 90px）
        const topButtonArea = timerHeight + timerGap + additionalTopMargin;  // 頂部區域 = 計時器 + 間距 + 額外邊距 = 160px
        const bottomButtonArea = 60;       // 底部按鈕區域
        const availableHeight = height - topButtonArea - bottomButtonArea;

        // 計算卡片總高度（用於邊距計算）
        const totalCardHeight = SeparatedMarginConfig.calculateTotalCardHeight(currentPagePairs.length, cardHeight, leftSpacing);

        // 🔥 [v12.0] 計算頂部偏移（自動居中，考慮計時器高度）
        const topOffset = SeparatedMarginConfig.calculateTopOffsetForSeparated(availableHeight, totalCardHeight, timerHeight);

        // 🔥 [v23.0] 計算實際起始位置 - leftX 改為 width * 0.4
        const leftX = width * 0.4;         // 左容器中心（調整為 0.4）
        const rightX = width * 0.75;       // 右容器中心（保持 0.75）
        const leftStartY = topButtonArea + topOffset;   // 計時器 + 間距 + 頂部偏移
        const rightStartY = topButtonArea + topOffset;  // 右側也是相同位置（對齐！）
        const bottomOffset = topOffset;    // 底部邊距對稱

        // 🔥 [v23.0] 詳細日誌 - leftX 改為 width * 0.4
        console.log('🎮 GameScene: 卡片位置（v23.0 leftX: 0.4, rightX: 0.75）', {
            timerHeight: timerHeight.toFixed(0),
            timerGap: timerGap.toFixed(0),
            topButtonArea: topButtonArea.toFixed(0),
            bottomButtonArea: bottomButtonArea.toFixed(0),
            availableHeight: availableHeight.toFixed(0),
            totalCardHeight: totalCardHeight.toFixed(0),
            topOffset: topOffset.toFixed(0),
            leftStartY: leftStartY.toFixed(0),
            rightStartY: rightStartY.toFixed(0),
            bottomOffset: bottomOffset.toFixed(0),
            containerLayout: 'leftX: 0.4, rightX: 0.75',   // 🔥 [v23.0] leftX 改為 width * 0.4
            timerGapVerification: `計時器 (0-${timerHeight}) + 間距 (${timerHeight}-${topButtonArea}) = 卡片開始 (${topButtonArea}+${topOffset.toFixed(0)}=${leftStartY.toFixed(0)})`,
            symmetry: topOffset === bottomOffset ? '✅ 頂部和底部邊距對稱' : '❌ 邊距不對稱'
        });

        // 🔥 根據佈局模式創建卡片
        if (this.layout === 'mixed') {
            // 混合佈局模式
            this.createMixedLayout(currentPagePairs, width, height, cardWidth, cardHeight);
        } else {
            // 分離佈局模式（默認）
            // 🔥 [v14.0] 保存位置信息到實例變量，供 createLeftRightSingleColumn 使用
            this.currentLeftX = leftX;
            this.currentRightX = rightX;
            this.currentLeftStartY = leftStartY;
            this.currentRightStartY = rightStartY;

            this.createSeparatedLayout(currentPagePairs, leftX, rightX, leftStartY, rightStartY,
                                      cardWidth, cardHeight, leftSpacing, rightSpacing);
        }

        console.log('🎮 GameScene: createCards 完成', {
            leftCardsCount: this.leftCards.length,
            rightCardsCount: this.rightCards.length
        });
    }

    // 🔥 創建分離佈局（根據 Wordwall 策略）
    // 🔥 [Phase 4] 簡化入口邏輯，統一調用方式
    // 🔥 [v53.0] 修復 7 個匹配數布局：改為上下分離單行布局
    createSeparatedLayout(currentPagePairs, leftX, rightX, leftStartY, rightStartY,
                          cardWidth, cardHeight, leftSpacing, rightSpacing) {
        const width = this.scale.width;
        const height = this.scale.height;
        const itemCount = currentPagePairs.length;

        // 🔥 [v133.0] 手機設備檢測
        const isMobileDevice = width < 600;
        const isPortraitMode = height > width;  // 縱向模式

        console.log(`🎮 [Phase 4] 創建分離佈局 - 匹配數: ${itemCount}`, {
            isMobileDevice: isMobileDevice,
            isPortraitMode: isPortraitMode,
            screenSize: `${width.toFixed(0)}×${height.toFixed(0)}`
        });

        // 🔥 根據 Wordwall 策略判斷佈局
        // 🔥 [v77.0] 刪除左右分離多行佈局（itemCount <= 20），統一使用上下分離佈局
        if (itemCount <= 5) {
            console.log('📐 使用左右分離佈局（3-5個匹配數，單列）');
            this.createLeftRightSingleColumn(currentPagePairs, width, height);
        } else if (itemCount === 7) {
            // 🔥 [v53.2] 7 個匹配數使用上下分離單行布局（7列 × 1行）
            console.log('📐 使用上下分離佈局（7個匹配數，單行）');
            this.createTopBottomSingleRow(currentPagePairs, width, height);
        } else if (itemCount === 10) {
            // 🔥 [v76.0] 10 個匹配數使用上下分離單行布局（10列 × 1行，參考批數 7）
            console.log('📐 使用上下分離佈局（10個匹配數，單行）');
            this.createTopBottomSingleRowTen(currentPagePairs, width, height);
        } else if (itemCount === 20) {
            // 🔥 [v77.0] 20 個匹配數使用上下分離單行佈局（2行 × 10列，參考批數 10）
            console.log('📐 使用上下分離佈局（20個匹配數，2行 × 10列）');
            this.createTopBottomSingleRowTwenty(currentPagePairs, width, height);
        } else {
            // 🔥 [v77.0] 6,8-9,11-19,21+ 個匹配數都使用上下分離多行布局
            console.log('📐 使用上下分離佈局（6,8-9,11-19,21+個匹配數，多行多列）');
            this.createTopBottomMultiRows(currentPagePairs, width, height);
        }
    }

    // 🔥 創建左右分離佈局 - 單列（3-5個匹配數）
    // 🔥 [Phase 4 重構] 使用統一的配置系統
    // 🔥 [v25.0] 集成 SeparatedResponsiveConfig 進行完整的響應式計算
    createLeftRightSingleColumn(currentPagePairs, width, height) {
        console.log('📐 創建左右分離佈局 - 自適應佈局（3-20個匹配數）');

        const itemCount = currentPagePairs.length;

        // 🔥 [v81.5] 存儲當前頁面的 itemCount，用於調整聲音按鈕大小
        this.currentPageItemCount = itemCount;

        // 🔥 [v25.0] 使用 SeparatedResponsiveConfig 進行響應式計算
        let responsiveConfig = null;
        let responsiveLayout = null;
        let responsivePositions = null;

        if (typeof SeparatedResponsiveConfig !== 'undefined') {
            try {
                responsiveConfig = new SeparatedResponsiveConfig(width, height, itemCount);
                responsiveLayout = responsiveConfig.calculateLayout();
                responsivePositions = responsiveConfig.calculateContainerPositions();

                console.log('✅ [v25.0] SeparatedResponsiveConfig 已加載', {
                    breakpoint: responsiveLayout.breakpoint,
                    cols: responsiveLayout.cols,
                    cardSize: responsiveLayout.cardSize,
                    fontSize: responsiveLayout.fontSize
                });
            } catch (error) {
                console.warn('⚠️ [v25.0] SeparatedResponsiveConfig 計算失敗:', error);
                responsiveConfig = null;
            }
        } else {
            console.warn('⚠️ [v25.0] SeparatedResponsiveConfig 未加載，使用備用方案');
        }

        // 🔥 [Phase 4] 使用 DeviceDetector 進行統一的設備檢測
        // 備用方案：如果 DeviceDetector 不可用，使用內聯邏輯
        let deviceType, deviceInfo;

        if (typeof DeviceDetector !== 'undefined' && DeviceDetector.getDeviceType) {
            deviceType = DeviceDetector.getDeviceType(width, height);
            deviceInfo = DeviceDetector.getDeviceInfo(width, height);
        } else {
            // 備用設備檢測邏輯
            const isPortrait = height >= width;
            if (width <= 600) {
                deviceType = isPortrait ? 'mobile-portrait' : 'mobile-landscape';
            } else if (width <= 1024) {
                deviceType = isPortrait ? 'tablet-portrait' : 'tablet-landscape';
            } else {
                deviceType = 'desktop';
            }
            deviceInfo = { deviceType, width, height, isPortrait };
        }

        console.log(`📐 容器尺寸: ${width} × ${height}`, deviceInfo);

        // 🔥 [Phase 4] 使用 SeparatedLayoutCalculator 進行統一的計算
        // 備用方案：如果 SeparatedLayoutCalculator 不可用，使用內聯邏輯
        let calculator;
        console.log('🔍 [v74.0] 檢查 SeparatedLayoutCalculator 可用性:', {
            isDefined: typeof SeparatedLayoutCalculator !== 'undefined',
            type: typeof SeparatedLayoutCalculator,
            value: SeparatedLayoutCalculator
        });

        if (typeof SeparatedLayoutCalculator !== 'undefined') {
            console.log('✅ [v74.0] 使用 SeparatedLayoutCalculator 類');
            calculator = new SeparatedLayoutCalculator(width, height, itemCount, 'left-right');

            // 🔥 [v76.0] 檢查並修復缺失的方法
            console.log('🔍 [v76.0] 檢查 SeparatedLayoutCalculator 方法:', {
                hasCalculateLeftLayout: typeof calculator.calculateLeftLayout === 'function',
                hasCalculateRightLayout: typeof calculator.calculateRightLayout === 'function'
            });

            // 如果缺少方法，動態添加它們
            if (typeof calculator.calculateLeftLayout !== 'function') {
                console.warn('⚠️ [v76.0] calculateLeftLayout 方法缺失，動態添加');
                calculator.calculateLeftLayout = function(itemCount) {
                    if (itemCount <= 5) {
                        return { columns: 1, rows: itemCount, layout: 'single-column' };
                    } else if (itemCount === 7) {
                        return { columns: 2, rows: Math.ceil(itemCount / 2), layout: 'multi-rows' };
                    } else if (itemCount === 10) {
                        return { columns: 10, rows: 1, layout: 'single-row' };
                    } else if (itemCount === 20) {
                        return { columns: 10, rows: 2, layout: 'multi-rows' };
                    } else {
                        return { columns: 1, rows: itemCount, layout: 'single-column' };
                    }
                };
            }

            if (typeof calculator.calculateRightLayout !== 'function') {
                console.warn('⚠️ [v76.0] calculateRightLayout 方法缺失，動態添加');
                calculator.calculateRightLayout = function(itemCount) {
                    return { columns: 1, rows: itemCount, layout: 'single-column' };
                };
            }

            console.log('✅ [v76.0] SeparatedLayoutCalculator 方法檢查完成');
        } else {
            // 備用計算器邏輯
            console.log('⚠️ [v74.0] SeparatedLayoutCalculator 不可用，使用備用計算器');
            calculator = {
                calculateCardSize: () => {
                    const cardWidth = Math.min(width * 0.35, 250);
                    const cardHeight = cardWidth * 0.3;
                    return { width: cardWidth, height: cardHeight };
                },
                calculatePositions: () => {
                    // 🔥 [v7.0] 改進的位置計算 - 充分利用水平空間
                    // 容器佈局：左25% | 中50% | 右25%
                    return {
                        leftX: width * 0.125,      // 左容器中心
                        rightX: width * 0.875,     // 右容器中心
                        leftStartY: height * 0.15,
                        rightStartY: height * 0.15 // 對齐！
                    };
                },
                calculateSpacing: () => {
                    return { horizontal: 15, vertical: 10 };
                },
                calculateColumnCount: () => 1,
                calculateRowCount: () => itemCount,
                getLayoutVariant: () => 'single-column',
                // 🔥 [v73.0] 添加缺失的佈局計算方法
                calculateLeftLayout: (count) => {
                    console.log('🔍 [v74.0] calculateLeftLayout 被調用:', { count });
                    return {
                        columns: 1,
                        rows: count,
                        layout: 'single-column'
                    };
                },
                calculateRightLayout: (count) => {
                    console.log('🔍 [v74.0] calculateRightLayout 被調用:', { count });
                    return {
                        columns: 1,
                        rows: count,
                        layout: 'single-column'
                    };
                }
            };
            console.log('✅ [v74.0] 備用計算器已創建，包含所有必要方法:', {
                hasMethods: {
                    calculateCardSize: typeof calculator.calculateCardSize === 'function',
                    calculatePositions: typeof calculator.calculatePositions === 'function',
                    calculateSpacing: typeof calculator.calculateSpacing === 'function',
                    calculateColumnCount: typeof calculator.calculateColumnCount === 'function',
                    calculateRowCount: typeof calculator.calculateRowCount === 'function',
                    getLayoutVariant: typeof calculator.getLayoutVariant === 'function',
                    calculateLeftLayout: typeof calculator.calculateLeftLayout === 'function',
                    calculateRightLayout: typeof calculator.calculateRightLayout === 'function'
                }
            });
        }

        // 🔥 [v31.0] 計算可用高度（用於卡片高度計算）
        const timerHeight = 50;            // 計時器實際高度
        const timerGap = 20;               // 計時器下方間距
        const additionalTopMargin = 90;    // 額外上方邊距
        const topButtonArea = timerHeight + timerGap + additionalTopMargin;  // 160px
        const bottomButtonArea = 60;       // 底部按鈕區域
        const availableHeightForCards = height - topButtonArea - bottomButtonArea;  // 454px

        // 🔥 [v31.0] 計算卡片間距（基於項目數量）
        const cardSpacingBetweenCards = Math.max(10, availableHeightForCards * 0.05);  // 最少 10px

        // 🔥 [v31.0] 計算最大卡片高度（確保所有卡片都能顯示）
        const maxCardHeightForAllItems = (availableHeightForCards - cardSpacingBetweenCards * (itemCount - 1)) / itemCount;

        // 🔥 [v28.0] 使用 SeparatedResponsiveConfig 計算卡片大小
        let cardWidth, cardHeight, fontSize;

        if (responsiveLayout) {
            // 使用響應式配置計算的卡片大小
            cardWidth = responsiveLayout.cardSize.width;
            // 🔥 [v31.0] 限制卡片高度，確保所有卡片都能顯示
            cardHeight = Math.min(responsiveLayout.cardSize.height, maxCardHeightForAllItems);
            fontSize = responsiveLayout.fontSize;

            // 🔥 [v133.0] 手機響應式修復 - 根據設備類型動態調整邊距
            // 檢測是否是手機設備（屏幕寬度 < 600px）
            const isMobileDevice = width < 600;

            // 🔥 [v133.0] 動態邊距計算
            // 手機：使用較小的邊距（5% 或最少 5px）
            // 桌面：使用固定的 80px 邊距
            const sideMarginForCalculation = isMobileDevice ?
                Math.max(5, width * 0.05) :  // 手機：5% 寬度或最少 5px
                80;                           // 桌面：固定 80px

            console.log('🔥 [v133.0] 手機響應式檢測:', {
                isMobileDevice: isMobileDevice,
                screenWidth: width.toFixed(0),
                sideMargin: sideMarginForCalculation.toFixed(0)
            });

            // 🔥 [v132.0] 根據容器大小動態調整卡片尺寸（包括垂直高度）
            // 計算容器寬度和可用寬度
            const containerWidth = width * 0.3333;  // 每個容器的寬度（33%）
            const usableContainerWidthForCalculation = containerWidth - sideMarginForCalculation * 2;

            // 計算垂直利用率
            const verticalUtilization = (cardHeight * itemCount + cardSpacingBetweenCards * (itemCount - 1)) / availableHeightForCards;

            // 計算動態縮放因子：根據卡片是否超出容器
            let dynamicScaleFactor = 1.0;
            let horizontalScaleFactor = 1.0;
            let verticalScaleFactor = 1.0;

            // 1️⃣ 計算水平縮放因子
            if (cardWidth > usableContainerWidthForCalculation) {
                // 卡片超出容器，計算縮放因子使其適應容器
                horizontalScaleFactor = usableContainerWidthForCalculation / cardWidth;
                console.log('🔥 [v132.0] 卡片超出容器寬度，計算水平縮放因子:', {
                    cardWidth: cardWidth.toFixed(0),
                    usableContainerWidth: usableContainerWidthForCalculation.toFixed(0),
                    horizontalScaleFactor: horizontalScaleFactor.toFixed(3)
                });
            } else {
                // 卡片在容器內，根據容器利用率調整
                const containerUtilization = cardWidth / usableContainerWidthForCalculation;

                if (containerUtilization > 0.85) {
                    horizontalScaleFactor = 1.0;
                } else if (containerUtilization > 0.70) {
                    horizontalScaleFactor = 0.95;
                } else {
                    horizontalScaleFactor = 0.85;
                }
            }

            // 2️⃣ 計算垂直縮放因子（根據垂直高度利用率）
            if (verticalUtilization > 0.95) {
                // 垂直空間利用率 > 95%，卡片太高，需要縮小
                verticalScaleFactor = 0.9;
            } else if (verticalUtilization > 0.85) {
                // 垂直空間利用率 85-95%，保持當前高度
                verticalScaleFactor = 1.0;
            } else if (verticalUtilization > 0.70) {
                // 垂直空間利用率 70-85%，適度增加高度
                verticalScaleFactor = 1.1;
            } else if (verticalUtilization > 0.50) {
                // 垂直空間利用率 50-70%，進一步增加高度
                verticalScaleFactor = 1.2;
            } else {
                // 垂直空間利用率 < 50%，大幅增加高度
                verticalScaleFactor = 1.3;
            }

            console.log('🔥 [v132.0] 垂直高度分析:', {
                cardHeight: cardHeight.toFixed(0),
                itemCount: itemCount,
                cardSpacingBetweenCards: cardSpacingBetweenCards.toFixed(0),
                availableHeightForCards: availableHeightForCards.toFixed(0),
                verticalUtilization: (verticalUtilization * 100).toFixed(1) + '%',
                verticalScaleFactor: verticalScaleFactor.toFixed(3)
            });

            // 3️⃣ 應用縮放因子（分別應用水平和垂直）
            cardWidth = cardWidth * horizontalScaleFactor;
            cardHeight = cardHeight * verticalScaleFactor;
            fontSize = Math.round(fontSize * Math.max(horizontalScaleFactor, verticalScaleFactor));

            console.log('✅ [v132.0] 使用響應式卡片大小（根據容器寬度和高度動態調整）:', {
                cardWidth: cardWidth.toFixed(0),
                cardHeight: cardHeight.toFixed(0),
                fontSize: fontSize,
                maxCardHeightForAllItems: maxCardHeightForAllItems.toFixed(0),
                itemCount: itemCount,
                horizontalScaleFactor: horizontalScaleFactor.toFixed(3) + 'x',
                verticalScaleFactor: verticalScaleFactor.toFixed(3) + 'x'
            });
        } else {
            // 備用方案：使用 SeparatedLayoutCalculator
            const optimalSize = calculator.calculateOptimalCardSize(itemCount);
            cardWidth = optimalSize.width;
            // 🔥 [v31.0] 限制卡片高度
            cardHeight = Math.min(optimalSize.height, maxCardHeightForAllItems);
            fontSize = Math.max(Math.floor(cardHeight * 0.22), 12);

            // 🔥 [v126.0] 動態計算放大因子
            const containerWidth = width * 0.3333;
            let sideMargin = 80;
            let usableContainerWidth = containerWidth - sideMargin * 2;

            if (cardWidth > usableContainerWidth) {
                const excessWidth = cardWidth - usableContainerWidth;
                sideMargin = Math.max(20, sideMargin - Math.ceil(excessWidth / 2));
                usableContainerWidth = containerWidth - sideMargin * 2;
            }

            let scaleFactor = 1.0;
            if (cardWidth > usableContainerWidth) {
                scaleFactor = usableContainerWidth / cardWidth;
            } else {
                scaleFactor = 1.1;
            }

            cardWidth = cardWidth * scaleFactor;
            cardHeight = cardHeight * scaleFactor;
            fontSize = Math.round(fontSize * scaleFactor);

            console.log('⚠️ 使用備用卡片大小計算（SeparatedResponsiveConfig 不可用）- v126.0 動態放大因子');
        }

        // 🎨 [v226.0] 計算內容大小 - 真正的響應式設計，按鈕根據設備類型動態調整
        // 🔥 [v226.0] 改進：根據設備類型和 cardHeight 動態計算按鈕大小

        // 1️⃣ 根據設備類型和卡片數量獲取動態百分比
        const buttonPercentages = {
            'mobile-portrait': { 3: 0.08, 5: 0.08, 7: 0.10, 10: 0.12, 20: 0.14 },
            'mobile-landscape': { 3: 0.10, 5: 0.10, 7: 0.12, 10: 0.14, 20: 0.16 },
            'tablet-portrait': { 3: 0.10, 5: 0.10, 7: 0.12, 10: 0.14, 20: 0.16 },
            'tablet-landscape': { 3: 0.12, 5: 0.12, 7: 0.14, 10: 0.16, 20: 0.18 },
            'desktop': { 3: 0.14, 5: 0.14, 7: 0.16, 10: 0.18, 20: 0.18 }
        };

        const buttonPercentage = buttonPercentages[deviceType]?.[itemCount] || 0.10;

        // 2️⃣ 計算動態最大值（按鈕區域的 90%）
        const buttonAreaHeight = cardHeight * 0.2;
        const dynamicMaxSize = buttonAreaHeight * 0.9;

        // 3️⃣ 計算最小值
        const buttonMinSize = itemCount === 3 ? 5 : itemCount === 5 ? 5 :
                              itemCount === 7 ? 4 : itemCount === 10 ? 4 : 3;

        // 4️⃣ 計算按鈕大小
        const calculatedButtonSize = Math.floor(cardHeight * buttonPercentage);
        const finalButtonSize = Math.min(Math.max(calculatedButtonSize, buttonMinSize), dynamicMaxSize);

        let contentSizes = {
            audioButton: {
                // 🔥 [v226.0] 真正的響應式設計：根據設備類型動態調整
                size: finalButtonSize,
                minSize: buttonMinSize,
                maxSize: Math.floor(dynamicMaxSize)
            },
            image: {
                width: Math.max(Math.floor(cardWidth * 0.35), 30),
                height: Math.max(Math.floor(cardHeight * 0.5), 25),
                minWidth: 30,
                maxWidth: 100,
                minHeight: 25,
                maxHeight: 80
            },
            text: {
                fontSize: fontSize,
                minFontSize: 12,
                maxFontSize: 28,
                lineHeight: Math.max(Math.floor(cardHeight * 0.28), 14)
            },
            spacing: {
                padding: Math.max(Math.floor(cardHeight * 0.1), 5),
                gap: Math.max(Math.floor(cardHeight * 0.08), 4)
            }
        };

        console.log(`📊 動態卡片大小計算:`, {
            itemCount,
            cardSize: { width: cardWidth.toFixed(0), height: cardHeight.toFixed(0) },
            fontSize: fontSize
        });

        console.log(`📐 卡片尺寸: ${cardWidth.toFixed(0)} × ${cardHeight.toFixed(0)} (itemCount=${itemCount})`);

        // 🎨 [v1.0] 內容大小詳細日誌
        console.log(`🎨 內容大小配置:`, {
            audioButtonSize: contentSizes.audioButton.size,
            imageSize: { width: contentSizes.image.width, height: contentSizes.image.height },
            fontSize: contentSizes.text.fontSize,
            lineHeight: contentSizes.text.lineHeight,
            padding: contentSizes.spacing.padding,
            gap: contentSizes.spacing.gap
        });

        // 🎨 [v1.0] 保存 contentSizes 到實例變量，供其他方法使用
        this.currentContentSizes = contentSizes;

        // 🔥 [v28.0] 分離模式使用特殊的三等分佈局，計算容器距離
        // 分離模式佈局：左33% | 中33% | 右33%
        let leftX, rightX, leftStartY, rightStartY;

        // 🔥 [v30.0] 計算三等分佈局的容器距離
        // 🔥 [v32.0] 邊距配置：根據卡片大小動態調整
        let sideMargin = 80;  // 初始左右邊距（80px）

        const containerWidth = width * 0.3333;  // 每個容器的寬度（33%）
        let usableContainerWidth = containerWidth - sideMargin * 2;  // 可用容器寬度

        // 🔥 [v32.0] 如果卡片超出容器，動態減少邊距
        if (cardWidth > usableContainerWidth) {
            const excessWidth = cardWidth - usableContainerWidth;
            sideMargin = Math.max(20, sideMargin - Math.ceil(excessWidth / 2));  // 最少保留 20px 邊距
            usableContainerWidth = containerWidth - sideMargin * 2;
            console.log('🔥 [v32.0] 卡片超出容器，動態減少邊距:', {
                originalMargin: 80,
                newMargin: sideMargin,
                excessWidth: excessWidth.toFixed(0)
            });
        }

        const middleGap = width * 0.3334;  // 中間空白區寬度（33%）

        // 🔥 [v28.0] 分離模式使用固定的三等分佈局比例
        leftX = width * 0.4;         // 左容器中心（33% 位置）
        // 🔥 [v33.0] 右容器向左移動，給圖片完整顯示空間
        rightX = width * 0.65;       // 右容器中心向左移動（從 75% 改為 65%）

        // 🔥 [v72.0] 回到原本的位置（0.15）
        let leftStartYRatio = 0.15;  // 🔥 [v72.0] 回到原本的 0.15

        // 使用保存的位置或默認值
        leftStartY = this.currentLeftStartY || (height * leftStartYRatio);
        rightStartY = this.currentRightStartY || (height * 0.15); // 使用保存的位置或默認值

        // 🔥 [v32.0] 調適訊息：分析卡片是否超出容器
        const cardExceedsContainer = cardWidth > usableContainerWidth;
        const excessPixels = cardWidth - usableContainerWidth;
        const containerUtilization = (cardWidth / usableContainerWidth * 100).toFixed(1);

        console.log('🔥🔥🔥 [v32.0] 分離模式三等分佈局已啟用（卡片放大 10%）🔥🔥🔥');
        console.log('✅ [v32.0] 容器距離計算:', {
            screenWidth: width.toFixed(0),
            containerWidth: containerWidth.toFixed(0),
            sideMargin: sideMargin,
            usableContainerWidth: usableContainerWidth.toFixed(0),
            middleGap: middleGap.toFixed(0),
            leftX: leftX.toFixed(0),
            rightX: rightX.toFixed(0),
            layoutType: '三等分佈局（左33% | 中33% | 右33%）',
            scaleFactor: '1.1x (10% 放大)'
        });

        // 🔥 [v32.0] 調適訊息：卡片大小分析
        console.log('🔍 [v32.0] 卡片大小分析（放大 10%）:', {
            cardWidth: cardWidth.toFixed(0),
            usableContainerWidth: usableContainerWidth.toFixed(0),
            cardExceedsContainer: cardExceedsContainer ? '❌ 超出容器' : '✅ 在容器內',
            excessPixels: cardExceedsContainer ? excessPixels.toFixed(0) : '0',
            containerUtilization: containerUtilization + '%',
            recommendation: cardExceedsContainer ? '⚠️ 卡片太大，需要調整' : '✅ 卡片大小合適'
        });

        console.log(`📍 位置: 左X=${leftX.toFixed(0)}, 右X=${rightX.toFixed(0)}, 左Y=${leftStartY.toFixed(0)}, 右Y=${rightStartY.toFixed(0)}`);

        // 🔥 [v78.0] 在調用前檢查並修復所有缺失的方法
        console.log('🔍 [v78.0] 調用前檢查 calculator 所有方法:', {
            calculatorType: calculator.constructor.name,
            hasCalculateLeftLayout: typeof calculator.calculateLeftLayout === 'function',
            hasCalculateRightLayout: typeof calculator.calculateRightLayout === 'function',
            hasCalculateLeftCardPosition: typeof calculator.calculateLeftCardPosition === 'function',
            hasCalculateRightCardPosition: typeof calculator.calculateRightCardPosition === 'function',
            itemCount: itemCount
        });

        // 🔥 [v78.0] 如果方法缺失，動態添加它們
        if (typeof calculator.calculateLeftLayout !== 'function') {
            console.warn('⚠️ [v78.0] calculateLeftLayout 方法缺失，動態添加');
            calculator.calculateLeftLayout = function(itemCount) {
                if (itemCount <= 5) {
                    return { columns: 1, rows: itemCount, layout: 'single-column' };
                } else if (itemCount === 7) {
                    return { columns: 2, rows: Math.ceil(itemCount / 2), layout: 'multi-rows' };
                } else if (itemCount === 10) {
                    return { columns: 10, rows: 1, layout: 'single-row' };
                } else if (itemCount === 20) {
                    return { columns: 10, rows: 2, layout: 'multi-rows' };
                } else {
                    return { columns: 1, rows: itemCount, layout: 'single-column' };
                }
            };
        }

        if (typeof calculator.calculateRightLayout !== 'function') {
            console.warn('⚠️ [v78.0] calculateRightLayout 方法缺失，動態添加');
            calculator.calculateRightLayout = function(itemCount) {
                return { columns: 1, rows: itemCount, layout: 'single-column' };
            };
        }

        if (typeof calculator.calculateLeftCardPosition !== 'function') {
            console.warn('⚠️ [v78.0] calculateLeftCardPosition 方法缺失，動態添加');
            calculator.calculateLeftCardPosition = function(index, columns, cardWidth, cardHeight, startX, startY) {
                const dynamicSpacing = this.dynamicSpacing || 10;
                const row = Math.floor(index / columns);
                const col = index % columns;
                return {
                    x: startX + col * (cardWidth + dynamicSpacing),
                    y: startY + row * (cardHeight + dynamicSpacing)
                };
            };
        }

        if (typeof calculator.calculateRightCardPosition !== 'function') {
            console.warn('⚠️ [v78.0] calculateRightCardPosition 方法缺失，動態添加');
            calculator.calculateRightCardPosition = function(index, cardHeight, startX, startY) {
                const spacing = this.calculateSpacing ? this.calculateSpacing() : { vertical: 10 };
                return {
                    x: startX,
                    y: startY + index * (cardHeight + spacing.vertical)
                };
            };
        }

        console.log('✅ [v78.0] 所有方法檢查完成，準備調用');

        // 🔥 [Screenshot_279] 使用新的佈局計算方法
        console.log('🔍 [v74.0] 準備調用 calculateLeftLayout 和 calculateRightLayout:', {
            calculatorType: calculator.constructor.name,
            hasCalculateLeftLayout: typeof calculator.calculateLeftLayout === 'function',
            hasCalculateRightLayout: typeof calculator.calculateRightLayout === 'function',
            itemCount: itemCount
        });

        let leftLayout, rightLayout;
        try {
            leftLayout = calculator.calculateLeftLayout(itemCount);
            console.log('✅ [v74.0] calculateLeftLayout 成功:', leftLayout);
        } catch (error) {
            console.error('❌ [v74.0] calculateLeftLayout 失敗:', error);
            throw error;
        }

        try {
            rightLayout = calculator.calculateRightLayout(itemCount);
            console.log('✅ [v74.0] calculateRightLayout 成功:', rightLayout);
        } catch (error) {
            console.error('❌ [v74.0] calculateRightLayout 失敗:', error);
            throw error;
        }

        console.log(`📐 左側佈局: ${leftLayout.columns} 列 × ${leftLayout.rows} 行 (${leftLayout.layout})`);
        console.log(`📐 右側佈局: ${rightLayout.columns} 列 × ${rightLayout.rows} 行 (${rightLayout.layout})`);

        // 🔥 根據隨機模式排列答案
        let shuffledAnswers;
        console.log('🔍 [v52.0 DEBUG] 洗牌前:', {
            randomMode: this.random,
            originalOrder: currentPagePairs.map(p => p.id),
            arrayLength: currentPagePairs.length
        });

        // 🔥 [v169.0] 檢查是否有保存的洗牌順序（用於返回上一頁時保持空白框順序一致）
        if (this.allPagesShuffledCache && this.allPagesShuffledCache[this.currentPage]) {
            shuffledAnswers = this.allPagesShuffledCache[this.currentPage];
            console.log('🎲 [v169.0] 使用保存的洗牌順序（返回上一頁）:', shuffledAnswers.map(p => p.id));
        } else if (this.random === 'same') {
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

        // 🔥 [Screenshot_279] 創建左側外框（使用新的佈局信息）
        // 🔥 [v3.0] 使用動態間距計算外框高度
        const dynamicSpacing = calculator.dynamicSpacing || 10;
        const leftContainerHeight = leftLayout.rows * cardHeight + (leftLayout.rows - 1) * dynamicSpacing;
        this.createLeftContainerBox(leftX, leftStartY, cardWidth, cardHeight, leftContainerHeight);

        // 🔥 [Screenshot_279] 創建左側題目卡片（使用新的位置計算）
        currentPagePairs.forEach((pair, index) => {
            const pos = calculator.calculateLeftCardPosition(index, leftLayout.columns, cardWidth, cardHeight, leftX, leftStartY);
            const animationDelay = index * 100;  // 🔥 每個卡片延遲 100ms
            const card = this.createLeftCard(pos.x, pos.y, cardWidth, cardHeight, pair.question, pair.id, animationDelay, pair.imageUrl, pair.audioUrl);
            this.leftCards.push(card);
        });

        // 🔥 [v180.0] 新增：創建 frameIndex 到 pairId 的映射
        if (!this.frameIndexToPairIdMap) this.frameIndexToPairIdMap = {};
        if (!this.allPagesFrameIndexToPairIdMap) this.allPagesFrameIndexToPairIdMap = {};

        // 🔥 [v33.0] 創建右側空白框 + 框外答案卡片（Wordwall 風格）
        shuffledAnswers.forEach((pair, index) => {
            const pos = calculator.calculateRightCardPosition(index, cardHeight, rightX, rightStartY);

            // 🔥 [v33.0] 創建右側空白框（用於拖放）
            const emptyBox = this.createEmptyRightBox(pos.x, pos.y, cardWidth, cardHeight, pair.id);
            this.rightCards.push(emptyBox);

            // 🔥 [v35.0] 單獨存儲空白框用於拖放檢查
            if (!this.rightEmptyBoxes) this.rightEmptyBoxes = [];
            this.rightEmptyBoxes.push(emptyBox);

            // 🔥 [v176.0] 新增：設置 frameIndex（應用混合模式的簡潔設計）
            emptyBox.setData('frameIndex', index);

            // 🔥 [v180.0] 新增：建立 frameIndex 到 pairId 的映射
            this.frameIndexToPairIdMap[index] = pair.id;

            console.log('🔥 [v176.0] 已設置空白框的 frameIndex:', {
                pairId: pair.id,
                frameIndex: index,
                boxesCount: this.rightEmptyBoxes.length
            });

            // 🔥 [v33.0] 創建框外答案卡片（圖片 + 水平文字）
            // 🔥 [v65.0] 批數 3-5 使用水平排列（圖片在左，文字在右）
            const answerCard = this.createOutsideAnswerCard(pos.x, pos.y, cardWidth, cardHeight, pair.answer, pair.id, pair.chineseImageUrl, 'horizontal');
            this.rightCards.push(answerCard);
        });

        // 🔥 [v180.0] 新增：保存當前頁的 frameIndex 到 pairId 映射
        this.allPagesFrameIndexToPairIdMap[this.currentPage] = { ...this.frameIndexToPairIdMap };
        console.log('🔥 [v180.0] 已保存當前頁的 frameIndex 到 pairId 映射:', {
            currentPage: this.currentPage,
            mapping: this.frameIndexToPairIdMap
        });

        // 🔥 [v25.0] 集成總結
        if (responsiveConfig) {
            console.log('✅ [v25.0] SeparatedResponsiveConfig 集成完成', {
                breakpoint: responsiveLayout.breakpoint,
                cardSize: `${cardWidth.toFixed(0)}×${cardHeight.toFixed(0)}px`,
                fontSize: `${fontSize}px`,
                containerPositions: {
                    leftX: leftX.toFixed(0),
                    rightX: rightX.toFixed(0)
                }
            });
        }

        console.log('✅ 左右分離佈局創建完成 (自適應佈局)');
    }

    // 🔥 創建上下分離佈局 - 2 行（6-10個匹配數）
    // 🔥 [v70.0] 改為類似批數 7 的單行布局方式（2 行 × 5 列）
    createTopBottomTwoRows(currentPagePairs, width, height) {
        console.log('📐 創建上下分離佈局 - 2行（6-10個匹配數，類似批數7的方式）');

        const itemCount = currentPagePairs.length;

        // 🔥 [v70.0] 固定 2 行，計算列數
        const rows = 2;
        const columns = Math.ceil(itemCount / rows);

        console.log(`📊 匹配數: ${itemCount}, 使用 ${rows} 行 × ${columns} 列佈局`);

        // 🔥 [v76.0] 計算可用空間（類似批數 7）
        const timerHeight = 50;
        const timerGap = 20;
        const additionalTopMargin = 50;
        const topButtonArea = timerHeight + timerGap + additionalTopMargin;  // 120px
        const bottomButtonArea = 80;  // 提交按鈕區域
        const answerCardsHeight = 150;  // 🔥 [v72.0] 增加答案卡片區域高度（從 80px 改為 150px，為圖片和文字留出足夠空間）
        const verticalSpacingBetweenRows = 30;  // 上下容器之間的垂直間距
        const answerCardsBottomSpacing = 50;  // 🔥 [v76.0] 增加到 50px（從 25px），為答案卡片留出更多空間，避免被切割

        const availableHeight = height - topButtonArea - bottomButtonArea - answerCardsHeight;
        // 🔥 [v76.0] 修正：有 4 行卡片（上方 2 行 + 下方 2 行），加上下方 2 行之間的間距 + 答案卡片區下方的間距
        const cardHeight = (availableHeight - verticalSpacingBetweenRows - answerCardsBottomSpacing) / (rows * 2);  // 平均分配給 4 行（上方 2 行 + 下方 2 行）

        // 🔥 [v70.0] 計算卡片寬度（類似批數 7）
        const horizontalMargin = 0;  // 完全填滿容器
        const availableWidth = width - horizontalMargin * 2;

        const fixedHorizontalSpacing = 18;  // 固定間距
        const totalSpacingWidth = (columns - 1) * fixedHorizontalSpacing;
        const cardWidth = (availableWidth - totalSpacingWidth) / columns;

        console.log(`📐 卡片尺寸: ${cardWidth.toFixed(0)} × ${cardHeight.toFixed(0)}`);
        console.log(`📐 容器計算:`, {
            availableHeight: availableHeight.toFixed(0),
            availableWidth: availableWidth.toFixed(0),
            cardHeight: cardHeight.toFixed(0),
            cardWidth: cardWidth.toFixed(0),
            horizontalSpacing: fixedHorizontalSpacing
        });

        // 🔥 [v75.0] 計算上下區域的起始位置
        const topAreaStartX = horizontalMargin + cardWidth / 2;
        const topAreaStartY = topButtonArea + cardHeight / 2;

        // 🔥 [v75.0] 下方區域起始位置：上方區域結束 + 2 行卡片高度 + 垂直間距 + 答案卡片區下方間距
        const bottomAreaStartX = topAreaStartX;
        const bottomAreaStartY = topAreaStartY + cardHeight * rows + verticalSpacingBetweenRows + answerCardsBottomSpacing;  // 上方 2 行的高度 + 垂直間距 + 答案卡片區下方間距

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

        // 🔥 [v70.0] 創建上方英文卡片（2 行多列，類似批數 7）
        currentPagePairs.forEach((pair, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);
            const x = topAreaStartX + col * (cardWidth + fixedHorizontalSpacing);
            const y = topAreaStartY + row * cardHeight;

            const animationDelay = index * 100;
            const card = this.createLeftCard(x, y, cardWidth, cardHeight, pair.question, pair.id, animationDelay, pair.imageUrl, pair.audioUrl);
            this.leftCards.push(card);
        });

        console.log(`✅ 上方英文卡片已創建: ${this.leftCards.length} 張`);

        // 🔥 [v70.0] 創建下方空白框 + 框外答案卡片（2 行多列，類似批數 7）
        shuffledAnswers.forEach((pair, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);
            const x = bottomAreaStartX + col * (cardWidth + fixedHorizontalSpacing);
            const y = bottomAreaStartY + row * cardHeight;

            // 創建空白框
            const emptyBox = this.createEmptyRightBox(x, y, cardWidth, cardHeight, pair.id);
            this.rightCards.push(emptyBox);

            // 單獨存儲空白框用於拖放檢查
            if (!this.rightEmptyBoxes) this.rightEmptyBoxes = [];
            this.rightEmptyBoxes.push(emptyBox);

            // 創建框外答案卡片
            // 🔥 [v70.0] 批數 10 使用垂直排列（圖片在上，文字在下）
            const answerCard = this.createOutsideAnswerCard(x, y, cardWidth, cardHeight, pair.answer, pair.id, pair.chineseImageUrl, 'vertical');
            this.rightCards.push(answerCard);
        });

        console.log(`✅ 下方答案卡片已創建: ${shuffledAnswers.length} 對`);
        console.log('✅ 上下分離佈局（2行）創建完成');
    }

    // 🔥 創建左右分離佈局 - 多行 2 列（6-20個匹配數）
    // 🔥 [Phase 4] 使用統一的配置系統
    createLeftRightMultiRows(currentPagePairs, width, height) {
        console.log('📐 創建左右分離佈局 - 多行2列（6-20個匹配數）');

        const itemCount = currentPagePairs.length;

        // 🔥 [Phase 4] 使用 DeviceDetector 進行統一的設備檢測
        // 備用方案：如果 DeviceDetector 不可用，使用內聯邏輯
        let deviceType, deviceInfo;

        if (typeof DeviceDetector !== 'undefined' && DeviceDetector.getDeviceType) {
            deviceType = DeviceDetector.getDeviceType(width, height);
            deviceInfo = DeviceDetector.getDeviceInfo(width, height);
        } else {
            // 備用設備檢測邏輯
            const isPortrait = height >= width;
            if (width <= 600) {
                deviceType = isPortrait ? 'mobile-portrait' : 'mobile-landscape';
            } else if (width <= 1024) {
                deviceType = isPortrait ? 'tablet-portrait' : 'tablet-landscape';
            } else {
                deviceType = 'desktop';
            }
            deviceInfo = { deviceType, width, height, isPortrait };
        }

        console.log(`📐 設備類型: ${deviceType}`, deviceInfo);

        // 🔥 檢測是否有圖片
        const hasImages = currentPagePairs.some(pair =>
            pair.imageUrl || pair.chineseImageUrl || pair.imageId || pair.chineseImageId
        );
        console.log(`🔍 圖片檢測: hasImages=${hasImages}, 模式=${hasImages ? '🟦 正方形' : '🟨 長方形'}`);

        // 🔥 [Phase 4] 使用 SeparatedLayoutCalculator 進行統一的計算
        const calculator = new SeparatedLayoutCalculator(width, height, itemCount, 'left-right');

        // 計算卡片尺寸
        const cardSize = calculator.calculateCardSize();
        const cardWidth = cardSize.width;
        const cardHeight = cardSize.height;

        // 計算位置
        const positions = calculator.calculatePositions();
        const leftX = positions.leftX;
        const rightX = positions.rightX;
        const leftStartY = positions.leftStartY;
        const rightStartY = positions.rightStartY;

        // 計算間距
        const spacing = calculator.calculateSpacing();
        const { leftSpacing, rightSpacing } = calculator.calculateSingleColumnSpacing(cardHeight);

        // 計算列數和行數
        const columns = calculator.calculateColumns(hasImages);
        const rows = calculator.calculateRows(columns);

        console.log(`📊 匹配數: ${itemCount}, 使用 ${rows} 行 × ${columns} 列佈局`);
        console.log(`📐 卡片尺寸: ${cardWidth.toFixed(0)} × ${cardHeight.toFixed(0)}`);
        console.log(`📍 區域位置: 左=${leftX.toFixed(0)}, 右=${rightX.toFixed(0)}, 上=${leftStartY.toFixed(0)}`);

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
            leftX,
            leftStartY,
            cardWidth,
            cardHeight,
            spacing.horizontal,
            spacing.vertical,
            columns,
            rows
        );

        // 🔥 創建左側英文卡片（多行多列，按照順序出現動畫）
        currentPagePairs.forEach((pair, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);
            const x = leftX + col * (cardWidth + spacing.horizontal) + cardWidth / 2;
            const y = leftStartY + row * (cardHeight + spacing.vertical) + cardHeight / 2;

            const animationDelay = index * 100;
            const card = this.createLeftCard(x, y, cardWidth, cardHeight, pair.question, pair.id, animationDelay, pair.imageUrl, pair.audioUrl);
            this.leftCards.push(card);
        });

        // 🔥 創建右側空白框 + 框外答案卡片（Wordwall 風格）
        shuffledAnswers.forEach((pair, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);
            const x = rightX + col * (cardWidth + spacing.horizontal) + cardWidth / 2;
            const y = rightStartY + row * (cardHeight + spacing.vertical) + cardHeight / 2;

            // 🔥 [v33.0] 創建右側空白框（用於拖放）
            const emptyBox = this.createEmptyRightBox(x, y, cardWidth, cardHeight, pair.id);
            this.rightCards.push(emptyBox);

            // 🔥 [v35.0] 單獨存儲空白框用於拖放檢查
            if (!this.rightEmptyBoxes) this.rightEmptyBoxes = [];
            this.rightEmptyBoxes.push(emptyBox);
            console.log('🔥 [v35.0] 已添加空白框到 rightEmptyBoxes:', {
                pairId: pair.id,
                boxesCount: this.rightEmptyBoxes.length
            });

            // 🔥 [v33.0] 創建框外答案卡片（圖片 + 水平文字）
            // 🔥 [v65.0] 批數 6, 8-20 使用水平排列（圖片在左，文字在右）
            const answerCard = this.createOutsideAnswerCard(x, y, cardWidth, cardHeight, pair.answer, pair.id, pair.chineseImageUrl, 'horizontal');
            this.rightCards.push(answerCard);
        });

        console.log('✅ 左右分離佈局（多行多列）創建完成');
    }

    // 🔥 [v53.2] 創建上下分離佈局 - 單行（7個匹配數）
    // 專門處理 7 個匹配數的單行布局：上方 7 列 × 1 行，下方 7 列 × 1 行
    // 🎨 [v53.3] 參考 Wordwall Screenshot_36 的精緻比例
    createTopBottomSingleRow(currentPagePairs, width, height) {
        console.log('📐 創建上下分離佈局 - 單行（7個匹配數，7列 × 1行）');

        const itemCount = currentPagePairs.length;

        // 🔥 計算可用空間
        const timerHeight = 50;
        const timerGap = 20;
        const additionalTopMargin = 50;  // 🔥 [v59.0] 減少上方邊距（從 90px 改為 50px）
        const topButtonArea = timerHeight + timerGap + additionalTopMargin;  // 120px
        const bottomButtonArea = 80;  // 🔥 [v62.0] 恢復為 80px（保留提交按鈕區域）
        const answerCardsHeight = 140;  // 🔥 [v64.0] 減少為 140px（給卡片更多空間，文字更大）
        const availableHeight = height - topButtonArea - bottomButtonArea - answerCardsHeight;

        // 🎨 [v53.3] 參考 Wordwall 的精緻比例
        // 🔥 [v68.0] 7 組上下容器完全填滿整個容器寬度（考慮中心錨點）
        // 左右邊距：0px（完全填滿容器）
        const horizontalMargin = 0;  // 🔥 [v68.0] 保持 0px，完全填滿容器
        const availableWidth = width - horizontalMargin * 2;

        // 🔥 [v68.0] 優化卡片寬度計算 - 考慮 Phaser 中心錨點
        // 公式（考慮中心錨點）：cardWidth/2 + 6*(cardWidth + spacing) + cardWidth/2 = availableWidth
        // 簡化：7*cardWidth + 6*spacing = availableWidth
        // 使用合理的間距（18px），讓卡片寬度自動計算
        const fixedHorizontalSpacing = 18;  // 🔥 [v68.0] 調整間距到 18px（精確填滿）
        const totalSpacingWidth = (itemCount - 1) * fixedHorizontalSpacing;
        const baseCardWidth = (availableWidth - totalSpacingWidth) / itemCount;
        const idealHorizontalSpacing = fixedHorizontalSpacing;

        // 理想卡片高度：寬度的 1.2 倍（略高於正方形）
        const idealCardHeight = baseCardWidth * 1.2;

        // 🔥 [v59.0] 完全移除垂直間距：卡片高度的 0%（完全貼在一起）
        const verticalSpacingRatio = 0;  // 從 0.01 改為 0 - 完全移除間距
        const idealVerticalSpacing = idealCardHeight * verticalSpacingRatio;

        // 🔥 檢查理想尺寸是否適應可用高度
        const requiredHeight = idealCardHeight * 2 + idealVerticalSpacing;

        let cardWidth, cardHeight, verticalSpacing, horizontalSpacing;

        if (requiredHeight <= availableHeight) {
            // ✅ 理想尺寸適應,使用理想比例
            cardWidth = baseCardWidth;
            cardHeight = idealCardHeight;
            verticalSpacing = idealVerticalSpacing;
            horizontalSpacing = idealHorizontalSpacing;
        } else {
            // ⚠️ 理想尺寸太大,需要縮小以適應高度
            // 🔥 [v59.0] 保持 1.2 的寬高比和 0% 的垂直間距比例（完全貼在一起）
            // 方程: 2 * cardHeight + 0 * cardHeight = availableHeight
            // 解: cardHeight = availableHeight / 2
            cardHeight = availableHeight / 2;  // 🔥 [v59.0] 改為 / 2（移除垂直間距）
            cardWidth = cardHeight / 1.2;
            verticalSpacing = cardHeight * verticalSpacingRatio;

            // 🔥 [v65.0] 縮放時也使用固定間距，確保卡片平均分佈
            horizontalSpacing = fixedHorizontalSpacing;
        }

        // 🔥 [v65.0] 驗證卡片是否完全填滿容器寬度
        const totalCardWidth = itemCount * cardWidth + (itemCount - 1) * horizontalSpacing;
        const widthUtilization = (totalCardWidth / availableWidth * 100).toFixed(1);

        console.log(`📊 [v65.0] Wordwall 風格單行布局計算 - 卡片平均分佈到容器內:`, {
            itemCount,
            cardWidth: cardWidth.toFixed(0),
            cardHeight: cardHeight.toFixed(0),
            cardAspectRatio: (cardHeight / cardWidth).toFixed(2),
            horizontalSpacing: horizontalSpacing.toFixed(1),
            verticalSpacing: verticalSpacing.toFixed(1),
            horizontalMargin: horizontalMargin.toFixed(0),
            availableWidth: availableWidth.toFixed(0),
            totalCardWidth: totalCardWidth.toFixed(0),
            widthUtilization: `${widthUtilization}%`,
            availableHeight: availableHeight.toFixed(0),
            requiredHeight: requiredHeight.toFixed(0),
            scaled: requiredHeight > availableHeight ? '⚠️ 已縮放' : '✅ 理想尺寸',
            '🔥 [v65.0] 優化參數': {
                fixedHorizontalSpacing: `${fixedHorizontalSpacing}px (固定間距)`,
                totalSpacingWidth: `${totalSpacingWidth.toFixed(0)}px (總間距寬度)`,
                formula: `cardWidth = (${availableWidth.toFixed(0)} - ${totalSpacingWidth.toFixed(0)}) / ${itemCount} = ${cardWidth.toFixed(0)}px`,
                bottomButtonArea: `${bottomButtonArea}px (保留提交按鈕區域)`,
                answerCardsHeight: `${answerCardsHeight}px (圖片+文字)`,
                imageSizeRatio: '0.5 (保持)',
                fontSizeRatio: '0.35 (文字更大)',
                fontSizeRange: '14-26px'
            }
        });

        // 🔥 [v58.0] 計算上方和下方區域的起始位置
        // 🔴 修復 bug：移除多餘的 cardHeight / 2，使得 verticalSpacing = 0 時容器完全貼在一起
        const topY = topButtonArea + cardHeight / 2;
        const bottomY = topY + cardHeight + verticalSpacing;  // 🔥 [v58.0] 移除 + cardHeight / 2
        const startX = horizontalMargin + cardWidth / 2;

        console.log(`📍 [v58.0] 區域位置（已修復）:`, {
            topY: topY.toFixed(0),
            bottomY: bottomY.toFixed(0),
            startX: startX.toFixed(0),
            spacing: verticalSpacing.toFixed(2),
            formula: `bottomY = topY + cardHeight + verticalSpacing = ${topY.toFixed(0)} + ${cardHeight.toFixed(0)} + ${verticalSpacing.toFixed(2)}`
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
            shuffledAnswers = [...currentPagePairs];
            for (let i = shuffledAnswers.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledAnswers[i], shuffledAnswers[j]] = [shuffledAnswers[j], shuffledAnswers[i]];
            }
            console.log('🎲 使用隨機排列模式（Fisher-Yates 算法）');
        }

        // 🔥 創建上方英文卡片（單行，7 列）
        currentPagePairs.forEach((pair, index) => {
            const x = startX + index * (cardWidth + horizontalSpacing);
            const y = topY;
            const animationDelay = index * 100;
            const card = this.createLeftCard(x, y, cardWidth, cardHeight, pair.question, pair.id, animationDelay, pair.imageUrl, pair.audioUrl);
            this.leftCards.push(card);
        });

        console.log(`✅ 上方英文卡片已創建: ${this.leftCards.length} 張`);

        // 🔥 創建下方空白框 + 框外答案卡片（單行，7 列）
        shuffledAnswers.forEach((pair, index) => {
            const x = startX + index * (cardWidth + horizontalSpacing);
            const y = bottomY;

            // 創建空白框
            const emptyBox = this.createEmptyRightBox(x, y, cardWidth, cardHeight, pair.id);
            this.rightCards.push(emptyBox);

            // 單獨存儲空白框用於拖放檢查
            if (!this.rightEmptyBoxes) this.rightEmptyBoxes = [];
            this.rightEmptyBoxes.push(emptyBox);

            // 創建框外答案卡片
            // 🔥 [v65.0] 批數 7 使用垂直排列（圖片在上，文字在下）
            const answerCard = this.createOutsideAnswerCard(x, y, cardWidth, cardHeight, pair.answer, pair.id, pair.chineseImageUrl, 'vertical');
            this.rightCards.push(answerCard);
        });

        console.log(`✅ 下方答案卡片已創建: ${shuffledAnswers.length} 對`);
        console.log('✅ 上下分離佈局（單行）創建完成');
    }

    // 🔥 [v76.0] 創建上下分離佈局 - 單行（10個匹配數）
    // 專門處理 10 個匹配數的單行布局：上方 10 列 × 1 行，下方 10 列 × 1 行
    // 參考批數 7 的單行佈局實現方式
    createTopBottomSingleRowTen(currentPagePairs, width, height) {
        console.log('📐 創建上下分離佈局 - 單行（10個匹配數，10列 × 1行）');

        const itemCount = currentPagePairs.length;

        // 🔥 計算可用空間（與批數 7 相同）
        const timerHeight = 50;
        const timerGap = 20;
        const additionalTopMargin = 50;
        const topButtonArea = timerHeight + timerGap + additionalTopMargin;  // 120px
        const bottomButtonArea = 80;
        const answerCardsHeight = 140;
        const availableHeight = height - topButtonArea - bottomButtonArea - answerCardsHeight;

        // 🔥 [v80.1] 計算卡片寬度（方案 B：118px × 118px，1:1 比例）
        const horizontalMargin = 100;  // 水平邊距 100px
        const availableWidth = width - horizontalMargin * 2;

        const fixedHorizontalSpacing = 18;
        const totalSpacingWidth = (itemCount - 1) * fixedHorizontalSpacing;
        const baseCardWidth = (availableWidth - totalSpacingWidth) / itemCount;
        const idealHorizontalSpacing = fixedHorizontalSpacing;

        // 🔥 [v80.1] 理想卡片高度：寬度的 1.0 倍（1:1 比例，方案 B）
        const idealCardHeight = baseCardWidth * 1.0;

        // 垂直間距：0（完全貼在一起）
        const verticalSpacingRatio = 0;
        const idealVerticalSpacing = idealCardHeight * verticalSpacingRatio;

        // 檢查理想尺寸是否適應可用高度
        const requiredHeight = idealCardHeight * 2 + idealVerticalSpacing;

        let cardWidth, cardHeight, verticalSpacing, horizontalSpacing;

        if (requiredHeight <= availableHeight) {
            // ✅ 理想尺寸適應，使用理想比例
            cardWidth = baseCardWidth;
            cardHeight = idealCardHeight;
            verticalSpacing = idealVerticalSpacing;
            horizontalSpacing = idealHorizontalSpacing;
        } else {
            // ⚠️ 理想尺寸太大，需要縮小以適應高度
            cardHeight = availableHeight / 2;
            cardWidth = cardHeight / 1.2;
            verticalSpacing = cardHeight * verticalSpacingRatio;
            horizontalSpacing = fixedHorizontalSpacing;
        }

        // 驗證卡片是否完全填滿容器寬度
        const totalCardWidth = itemCount * cardWidth + (itemCount - 1) * horizontalSpacing;
        const widthUtilization = (totalCardWidth / availableWidth * 100).toFixed(1);

        console.log(`📊 [v76.0] Wordwall 風格單行布局計算 - 10個匹配數:`, {
            itemCount,
            cardWidth: cardWidth.toFixed(0),
            cardHeight: cardHeight.toFixed(0),
            cardAspectRatio: (cardHeight / cardWidth).toFixed(2),
            horizontalSpacing: horizontalSpacing.toFixed(1),
            verticalSpacing: verticalSpacing.toFixed(1),
            horizontalMargin: horizontalMargin.toFixed(0),
            availableWidth: availableWidth.toFixed(0),
            totalCardWidth: totalCardWidth.toFixed(0),
            widthUtilization: `${widthUtilization}%`,
            availableHeight: availableHeight.toFixed(0),
            requiredHeight: requiredHeight.toFixed(0),
            scaled: requiredHeight > availableHeight ? '⚠️ 已縮放' : '✅ 理想尺寸'
        });

        // 🔥 [v81.0] 計算上方和下方區域的起始位置 - 增加英文卡片和空白框之間的距離
        const topY = topButtonArea + cardHeight / 2;
        const separationSpacing = cardHeight * 0.8;  // 🔥 [v81.0] 英文卡片和空白框之間的距離 = 卡片高度的 80%
        const bottomY = topY + cardHeight + verticalSpacing + separationSpacing;
        const startX = horizontalMargin + cardWidth / 2;

        console.log(`📍 [v81.0] 區域位置:`, {
            topY: topY.toFixed(0),
            bottomY: bottomY.toFixed(0),
            startX: startX.toFixed(0),
            spacing: verticalSpacing.toFixed(2),
            separationSpacing: separationSpacing.toFixed(2)
        });

        // 根據隨機模式排列答案
        let shuffledAnswers;
        if (this.random === 'same') {
            const urlParams = new URLSearchParams(window.location.search);
            const activityId = urlParams.get('activityId') || 'default-seed';
            const seed = activityId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const rng = new Phaser.Math.RandomDataGenerator([seed.toString()]);
            shuffledAnswers = rng.shuffle([...currentPagePairs]);
            console.log('🎲 使用固定隨機模式，種子:', seed);
        } else {
            shuffledAnswers = [...currentPagePairs];
            for (let i = shuffledAnswers.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledAnswers[i], shuffledAnswers[j]] = [shuffledAnswers[j], shuffledAnswers[i]];
            }
            console.log('🎲 使用隨機排列模式（Fisher-Yates 算法）');
        }

        // 創建上方英文卡片（單行，10 列）
        currentPagePairs.forEach((pair, index) => {
            const x = startX + index * (cardWidth + horizontalSpacing);
            const y = topY;
            const animationDelay = index * 100;
            const card = this.createLeftCard(x, y, cardWidth, cardHeight, pair.question, pair.id, animationDelay, pair.imageUrl, pair.audioUrl);
            this.leftCards.push(card);
        });

        console.log(`✅ 上方英文卡片已創建: ${this.leftCards.length} 張`);

        // 創建下方空白框 + 框外答案卡片（單行，10 列）
        shuffledAnswers.forEach((pair, index) => {
            const x = startX + index * (cardWidth + horizontalSpacing);
            const y = bottomY;

            // 創建空白框
            const emptyBox = this.createEmptyRightBox(x, y, cardWidth, cardHeight, pair.id);
            this.rightCards.push(emptyBox);

            // 單獨存儲空白框用於拖放檢查
            if (!this.rightEmptyBoxes) this.rightEmptyBoxes = [];
            this.rightEmptyBoxes.push(emptyBox);

            // 創建框外答案卡片
            // 🔥 [v76.0] 批數 10 使用垂直排列（圖片在上，文字在下）
            const answerCard = this.createOutsideAnswerCard(x, y, cardWidth, cardHeight, pair.answer, pair.id, pair.chineseImageUrl, 'vertical');
            this.rightCards.push(answerCard);
        });

        console.log(`✅ 下方答案卡片已創建: ${shuffledAnswers.length} 對`);
        console.log('✅ 上下分離佈局（單行）創建完成');
    }

    // 🔥 [v77.0] 創建上下分離佈局 - 單行（20個匹配數）
    // 專門處理 20 個匹配數的單行布局：上方 10 列 × 2 行，下方 10 列 × 2 行
    // 參考批數 10 的單行佈局實現方式
    createTopBottomSingleRowTwenty(currentPagePairs, width, height) {
        console.log('📐 創建上下分離佈局 - 單行（20個匹配數，10列 × 2行）');

        const itemCount = currentPagePairs.length;

        // 🔥 [v90.0] 檢測屏幕方向
        const isLandscape = width > height;  // 橫屏：寬度 > 高度
        const isPortrait = width <= height;  // 直屏：寬度 <= 高度

        // 🔥 [v83.0] 使用業界標準響應式斷點系統（來自 responsive-config.js）
        // 使用預定義的斷點函數
        const breakpoint = typeof getBreakpoint === 'function'
            ? getBreakpoint(width)
            : (width < 768 ? 'mobile' : width < 1024 ? 'tablet' : width < 1280 ? 'desktop' : 'wide');

        // 🔥 [v90.0] 根據斷點和屏幕方向定義響應式比例和動態列數
        const responsiveRatios = {
            mobile: {
                // 直屏配置
                portrait: {
                    topButtonArea: 0.10,      // 10% 視窗高度
                    bottomButtonArea: 0.08,   // 8% 視窗高度
                    answerCardsHeight: 0.40,  // 40% 視窗高度
                    horizontalMargin: 0.05,   // 5% 視窗寬度
                    itemsPerRow: 5            // 直屏：5 列
                },
                // 橫屏配置
                landscape: {
                    topButtonArea: 0.10,      // 10% 視窗高度
                    bottomButtonArea: 0.08,   // 8% 視窗高度
                    answerCardsHeight: 0.40,  // 40% 視窗高度
                    horizontalMargin: 0.05,   // 5% 視窗寬度
                    itemsPerRow: 8            // 橫屏：8 列
                }
            },
            tablet: {
                // 直屏配置
                portrait: {
                    topButtonArea: 0.11,      // 11% 視窗高度
                    bottomButtonArea: 0.075,  // 7.5% 視窗高度
                    answerCardsHeight: 0.38,  // 38% 視窗高度
                    horizontalMargin: 0.15,   // 15% 視窗寬度
                    itemsPerRow: 8            // 直屏：8 列
                },
                // 橫屏配置
                landscape: {
                    topButtonArea: 0.11,      // 11% 視窗高度
                    bottomButtonArea: 0.075,  // 7.5% 視窗高度
                    answerCardsHeight: 0.38,  // 38% 視窗高度
                    horizontalMargin: 0.15,   // 15% 視窗寬度
                    itemsPerRow: 10           // 橫屏：10 列
                }
            },
            desktop: {
                // 直屏配置
                portrait: {
                    topButtonArea: 0.111,     // 11.1% 視窗高度
                    bottomButtonArea: 0.074,  // 7.4% 視窗高度
                    answerCardsHeight: 0.38,  // 38% 視窗高度
                    horizontalMargin: 0.138,  // 13.8% 視窗寬度
                    itemsPerRow: 10           // 直屏：10 列
                },
                // 橫屏配置
                landscape: {
                    topButtonArea: 0.111,     // 11.1% 視窗高度
                    bottomButtonArea: 0.074,  // 7.4% 視窗高度
                    answerCardsHeight: 0.38,  // 38% 視窗高度
                    horizontalMargin: 0.138,  // 13.8% 視窗寬度
                    itemsPerRow: 10           // 橫屏：10 列
                }
            },
            wide: {
                // 直屏配置
                portrait: {
                    topButtonArea: 0.111,     // 11.1% 視窗高度
                    bottomButtonArea: 0.074,  // 7.4% 視窗高度
                    answerCardsHeight: 0.38,  // 38% 視窗高度
                    horizontalMargin: 0.15,   // 15% 視窗寬度
                    itemsPerRow: 10           // 直屏：10 列
                },
                // 橫屏配置
                landscape: {
                    topButtonArea: 0.111,     // 11.1% 視窗高度
                    bottomButtonArea: 0.074,  // 7.4% 視窗高度
                    answerCardsHeight: 0.38,  // 38% 視窗高度
                    horizontalMargin: 0.15,   // 15% 視窗寬度
                    itemsPerRow: 10           // 橫屏：10 列
                }
            }
        };

        // 🔥 [v91.0] 檢測特定解析度（768×1024）並做特別計算
        const isSpecialTablet = (width === 768 || (width > 760 && width < 780)) &&
                                (height === 1024 || (height > 1020 && height < 1030));

        // 🔥 [v90.0] 根據屏幕方向選擇配置
        let orientationKey = isLandscape ? 'landscape' : 'portrait';
        let ratios = responsiveRatios[breakpoint][orientationKey];

        // 🔥 [v91.0] 為特定解析度（768×1024）做特別調整
        if (isSpecialTablet && isPortrait) {
            // 對於 768×1024 直屏，減少列數以避免超出容器
            ratios = {
                ...ratios,
                itemsPerRow: 6  // 從 8 列改為 6 列
            };
        }

        const topButtonArea = height * ratios.topButtonArea;
        const bottomButtonArea = height * ratios.bottomButtonArea;
        const answerCardsHeight = height * ratios.answerCardsHeight;
        const availableHeight = height - topButtonArea - bottomButtonArea - answerCardsHeight;

        const horizontalMargin = width * ratios.horizontalMargin;
        const availableWidth = width - horizontalMargin * 2;

        // 🔥 [v84.0] 動態列數系統 - 根據斷點自動調整
        const itemsPerRow = ratios.itemsPerRow;
        const fixedHorizontalSpacing = 18;
        const totalSpacingWidth = (itemsPerRow - 1) * fixedHorizontalSpacing;
        const baseCardWidth = (availableWidth - totalSpacingWidth) / itemsPerRow;
        const idealHorizontalSpacing = fixedHorizontalSpacing;

        // 🔥 [v81.0] 理想卡片高度：寬度的 1.0 倍（1:1 比例，方案 C：110px × 110px）
        const idealCardHeight = baseCardWidth * 1.0;

        // 🔥 [v81.3] 垂直間距：100% 卡片高度（空白框之間有更大間距）
        const verticalSpacingRatio = 1.0;  // 🔥 [v81.3] 從 0.5 (50%) 增加到 1.0 (100%)
        const idealVerticalSpacing = idealCardHeight * verticalSpacingRatio;

        // 檢查理想尺寸是否適應可用高度（2 行卡片）
        const requiredHeight = idealCardHeight * 2 + idealVerticalSpacing;

        let cardWidth, cardHeight, verticalSpacing, horizontalSpacing;

        if (requiredHeight <= availableHeight) {
            // ✅ 理想尺寸適應，使用理想比例
            cardWidth = baseCardWidth;
            cardHeight = idealCardHeight;
            verticalSpacing = idealVerticalSpacing;
            horizontalSpacing = idealHorizontalSpacing;
        } else {
            // ⚠️ 理想尺寸太大，需要縮小以適應高度
            cardHeight = availableHeight / 2;
            cardWidth = cardHeight / 1.2;
            verticalSpacing = cardHeight * verticalSpacingRatio;
            horizontalSpacing = fixedHorizontalSpacing;
        }

        // 驗證卡片是否完全填滿容器寬度
        const totalCardWidth = itemsPerRow * cardWidth + (itemsPerRow - 1) * horizontalSpacing;
        const widthUtilization = (totalCardWidth / availableWidth * 100).toFixed(1);

        // 🔥 [v84.0] 計算行數
        const totalRows = Math.ceil(itemCount / itemsPerRow);

        // 🔥 [v72.0] 記錄卡片寬度計算信息
        console.log('📐 [v72.0] createTopBottomSeparated 卡片寬度計算:', {
            sceneWidth: width,
            sceneHeight: height,
            availableWidth: availableWidth.toFixed(2),
            availableHeight: availableHeight.toFixed(2),
            itemsPerRow: itemsPerRow,
            baseCardWidth: baseCardWidth.toFixed(2),
            cardWidth: cardWidth.toFixed(2),
            cardHeight: cardHeight.toFixed(2),
            horizontalSpacing: horizontalSpacing.toFixed(2),
            verticalSpacing: verticalSpacing.toFixed(2),
            requiredHeight: requiredHeight.toFixed(2),
            totalCardWidth: totalCardWidth.toFixed(2),
            widthUtilization: widthUtilization + '%',
            timestamp: new Date().toISOString()
        });

        console.log(`📊 [v91.0] 動態列數響應式佈局 - 20個匹配數:`, {
            screenSize: `${width}×${height}`,
            orientation: `${isLandscape ? '📱 橫屏' : '📱 直屏'}`,
            breakpoint: `${breakpoint} 📱`,
            specialTablet: isSpecialTablet ? '✅ 768×1024 特別計算' : '❌ 標準計算',
            itemsPerRow: `${itemsPerRow} 列 🔥`,
            totalRows: `${totalRows} 行 🔥`,
            layout: `${itemsPerRow}×${totalRows} 🔥`,
            itemCount,
            cardWidth: cardWidth.toFixed(0),
            cardHeight: cardHeight.toFixed(0),
            cardAspectRatio: (cardHeight / cardWidth).toFixed(2),
            horizontalSpacing: horizontalSpacing.toFixed(1),
            verticalSpacing: verticalSpacing.toFixed(1),
            horizontalMargin: horizontalMargin.toFixed(0),
            horizontalMarginRatio: `${(ratios.horizontalMargin * 100).toFixed(1)}%`,
            availableWidth: availableWidth.toFixed(0),
            totalCardWidth: totalCardWidth.toFixed(0),
            widthUtilization: `${widthUtilization}%`,
            availableHeight: availableHeight.toFixed(0),
            requiredHeight: requiredHeight.toFixed(0),
            scaled: requiredHeight > availableHeight ? '⚠️ 已縮放' : '✅ 理想尺寸'
        });

        // 🔥 [v86.0] 計算上方和下方區域的起始位置 - 確保容器不重疊
        const topY = topButtonArea + cardHeight / 2;  // 英文卡片第一行的中心 Y

        // 🔥 [v86.0] 正確計算英文卡片容器的底部邊界
        // 最後一行的中心 Y = topY + (totalRows - 1) × cardHeight
        // 最後一行的下邊界 = 最後一行中心 + cardHeight / 2
        // = topY + (totalRows - 1) × cardHeight + cardHeight / 2
        // = topY + totalRows × cardHeight - cardHeight / 2
        const englishCardsBottom = topY + totalRows * cardHeight - cardHeight / 2;

        // 🔥 [v86.0] 計算空白框容器的起始位置 - 確保不與英文卡片重疊
        const separationSpacing = cardHeight * 0.3;  // 英文卡片和空白框之間的距離
        const bottomY = englishCardsBottom + separationSpacing + cardHeight / 2;  // 空白框第一行的中心 Y
        const startX = horizontalMargin + cardWidth / 2;

        console.log(`📍 [v86.0] 容器邊界計算:`, {
            topY: topY.toFixed(0),
            totalRows: totalRows,
            cardHeight: cardHeight.toFixed(1),
            englishCardsBottom: englishCardsBottom.toFixed(0),
            separationSpacing: separationSpacing.toFixed(0),
            bottomY: bottomY.toFixed(0),
            startX: startX.toFixed(0),
            spacing: verticalSpacing.toFixed(2)
        });

        // 根據隨機模式排列答案
        let shuffledAnswers;
        if (this.random === 'same') {
            const urlParams = new URLSearchParams(window.location.search);
            const activityId = urlParams.get('activityId') || 'default-seed';
            const seed = activityId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const rng = new Phaser.Math.RandomDataGenerator([seed.toString()]);
            shuffledAnswers = rng.shuffle([...currentPagePairs]);
            console.log('🎲 使用固定隨機模式，種子:', seed);
        } else {
            shuffledAnswers = [...currentPagePairs];
            for (let i = shuffledAnswers.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledAnswers[i], shuffledAnswers[j]] = [shuffledAnswers[j], shuffledAnswers[i]];
            }
            console.log('🎲 使用隨機排列模式（Fisher-Yates 算法）');
        }

        // 🔥 [v84.0] 創建上方英文卡片（動態行列數）- 第一行和第二行之間沒有間距
        currentPagePairs.forEach((pair, index) => {
            const col = index % itemsPerRow;
            const row = Math.floor(index / itemsPerRow);
            const x = startX + col * (cardWidth + horizontalSpacing);
            const y = topY + row * cardHeight;  // 🔥 [v81.4] 英文卡片之間沒有間距（只有 cardHeight，沒有 verticalSpacing）
            const animationDelay = index * 100;
            const card = this.createLeftCard(x, y, cardWidth, cardHeight, pair.question, pair.id, animationDelay, pair.imageUrl, pair.audioUrl);
            this.leftCards.push(card);
        });

        console.log(`✅ 上方英文卡片已創建: ${this.leftCards.length} 張`);

        // 🔥 [v84.0] 創建下方空白框 + 框外答案卡片（動態行列數）
        shuffledAnswers.forEach((pair, index) => {
            const col = index % itemsPerRow;
            const row = Math.floor(index / itemsPerRow);
            const x = startX + col * (cardWidth + horizontalSpacing);
            const y = bottomY + row * (cardHeight + verticalSpacing);

            // 創建空白框
            const emptyBox = this.createEmptyRightBox(x, y, cardWidth, cardHeight, pair.id);
            this.rightCards.push(emptyBox);

            // 單獨存儲空白框用於拖放檢查
            if (!this.rightEmptyBoxes) this.rightEmptyBoxes = [];
            this.rightEmptyBoxes.push(emptyBox);

            // 創建框外答案卡片
            // 🔥 [v77.0] 批數 20 使用垂直排列（圖片在上，文字在下）
            const answerCard = this.createOutsideAnswerCard(x, y, cardWidth, cardHeight, pair.answer, pair.id, pair.chineseImageUrl, 'vertical');
            this.rightCards.push(answerCard);
        });

        console.log(`✅ 下方答案卡片已創建: ${shuffledAnswers.length} 對`);
        console.log(`✅ [v84.0] 上下分離佈局（${totalRows}行 × ${itemsPerRow}列）創建完成 🔥`);
    }

    // 🔥 [v77.0] 創建垂直堆疊單元佈局 - 20個匹配數
    // 每個單元包含：英文圖片 + 文字 + 空白框 + 答案圖片 + 文字
    createVerticalUnitLayout(currentPagePairs, width, height) {
        console.log('📐 創建垂直堆疊單元佈局 - 20個匹配數（垂直單元）');

        const itemCount = currentPagePairs.length;

        // 🔥 計算可用空間
        const timerHeight = 50;
        const timerGap = 20;
        const additionalTopMargin = 50;
        const topButtonArea = timerHeight + timerGap + additionalTopMargin;  // 120px
        const bottomButtonArea = 80;  // 提交按鈕區域
        const availableHeight = height - topButtonArea - bottomButtonArea;
        const availableWidth = width;

        // 🔥 [v123.0] 動態計算列數（根據屏幕寬度和匹配數）
        // 使用 UnifiedColumnCalculator 根據屏幕寬度、高度、項目數動態計算最優列數
        const minCardWidth = 80;  // 最小卡片寬度
        const minCardHeight = 40;

        // 🔥 計算單元尺寸
        // 🔥 [v80.0] 取消上下邊界，讓卡片高度變大
        const horizontalMargin = 5;
        const verticalMargin = 0;  // 🔥 [v80.0] 取消上下邊界
        const horizontalSpacing = 8;
        const verticalSpacing = 8;

        // 計算基於寬度的最大列數
        const maxColsByWidth = Math.floor((availableWidth - horizontalMargin * 2 + horizontalSpacing) / (minCardWidth + horizontalSpacing));

        // 計算基於高度的最大行數
        const maxRowsByHeight = Math.floor((availableHeight + verticalSpacing) / (minCardHeight + verticalSpacing));

        // 動態計算最優列數
        let columns = Math.min(maxColsByWidth, Math.ceil(itemCount / maxRowsByHeight));
        columns = Math.max(1, Math.min(columns, itemCount));  // 確保列數在 1 到 itemCount 之間

        const rows = Math.ceil(itemCount / columns);

        const usableWidth = availableWidth - horizontalMargin * 2;
        const usableHeight = availableHeight - verticalMargin * 2;

        const unitWidth = (usableWidth - (columns - 1) * horizontalSpacing) / columns;
        const unitHeight = (usableHeight - (rows - 1) * verticalSpacing) / rows;

        console.log(`📊 匹配數: ${itemCount}, 使用 ${rows} 行 × ${columns} 列佈局`);
        console.log(`📐 單元尺寸: ${unitWidth.toFixed(0)} × ${unitHeight.toFixed(0)}`);

        // 🔥 計算單元內部的各部分高度
        const imageHeight = unitHeight * 0.35;  // 圖片佔 35%
        const textHeight = unitHeight * 0.15;   // 文字佔 15%
        const emptyBoxHeight = unitHeight * 0.25;  // 空白框佔 25%
        const answerHeight = unitHeight * 0.25;  // 答案佔 25%

        console.log(`📐 單元內部尺寸: 圖片=${imageHeight.toFixed(0)}, 文字=${textHeight.toFixed(0)}, 空白框=${emptyBoxHeight.toFixed(0)}, 答案=${answerHeight.toFixed(0)}`);

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
            shuffledAnswers = [...currentPagePairs];
            for (let i = shuffledAnswers.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledAnswers[i], shuffledAnswers[j]] = [shuffledAnswers[j], shuffledAnswers[i]];
            }
            console.log('🎲 使用隨機排列模式（Fisher-Yates 算法）');
        }

        // 🔥 創建所有單元
        currentPagePairs.forEach((pair, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);

            // 計算單元的起始位置
            const unitX = horizontalMargin + col * (unitWidth + horizontalSpacing) + unitWidth / 2;
            const unitY = topButtonArea + verticalMargin + row * (unitHeight + verticalSpacing) + unitHeight / 2;

            // 計算各部分的 Y 位置（相對於單元中心）
            const imageY = unitY - unitHeight / 2 + imageHeight / 2;
            const textY = imageY + imageHeight / 2 + textHeight / 2;
            const emptyBoxY = textY + textHeight / 2 + emptyBoxHeight / 2;
            const answerY = emptyBoxY + emptyBoxHeight / 2 + answerHeight / 2;

            // 🔥 創建英文卡片（圖片 + 文字）
            const animationDelay = index * 100;
            const card = this.createLeftCard(unitX, textY, unitWidth, textHeight, pair.question, pair.id, animationDelay, pair.imageUrl, pair.audioUrl);
            this.leftCards.push(card);

            // 🔥 創建空白框
            const emptyBox = this.createEmptyRightBox(unitX, emptyBoxY, unitWidth, emptyBoxHeight, pair.id);
            this.rightCards.push(emptyBox);

            if (!this.rightEmptyBoxes) this.rightEmptyBoxes = [];
            this.rightEmptyBoxes.push(emptyBox);

            // 🔥 創建答案卡片（圖片 + 文字）
            const answerCard = this.createOutsideAnswerCard(unitX, answerY, unitWidth, answerHeight, pair.answer, pair.id, pair.chineseImageUrl, 'vertical');
            this.rightCards.push(answerCard);
        });

        console.log(`✅ 垂直堆疊單元佈局創建完成: ${itemCount} 個單元`);
    }

    // 🔥 創建上下分離佈局 - 多行多列（6,8-9,11+個匹配數）
    // 🔥 [v77.3] 真正的上下分離佈局（上方英文卡片，下方答案卡片）
    createTopBottomMultiRows(currentPagePairs, width, height) {
        console.log('📐 創建上下分離佈局 - 多行多列（6,8-9,11+個匹配數）');

        const itemCount = currentPagePairs.length;

        // 🔥 [v77.3] 計算可用空間（類似批數 10）
        const timerHeight = 50;
        const timerGap = 20;
        const additionalTopMargin = 50;
        const topButtonArea = timerHeight + timerGap + additionalTopMargin;  // 120px
        const bottomButtonArea = 80;  // 提交按鈕區域
        const answerCardsHeight = 150;  // 答案卡片區域高度
        const verticalSpacingBetweenRows = 80;  // 🔥 [v77.4] 增加上下容器之間的垂直間距（從 30px 改為 80px）
        const answerCardsBottomSpacing = 80;  // 🔥 [v77.4] 增加答案卡片區下方間距（從 50px 改為 80px）

        const availableHeight = height - topButtonArea - bottomButtonArea - answerCardsHeight;

        // 🔥 [v123.0] 動態計算列數（根據屏幕寬度和匹配數）
        // 不再使用固定的 2-3 列限制，而是根據屏幕寬度動態計算
        const minCardWidth = 100;  // 最小卡片寬度
        const horizontalMargin = 0;
        const fixedHorizontalSpacing = 18;

        // 計算基於寬度的最大列數
        const maxColsByWidth = Math.floor((width - horizontalMargin * 2 + fixedHorizontalSpacing) / (minCardWidth + fixedHorizontalSpacing));

        // 計算基於高度的最大行數
        const minCardHeight = 50;
        const maxRowsByHeight = Math.floor((availableHeight + verticalSpacingBetweenRows) / (minCardHeight + verticalSpacingBetweenRows));

        // 動態計算最優列數
        let columns = Math.min(maxColsByWidth, Math.ceil(itemCount / maxRowsByHeight));
        columns = Math.max(1, Math.min(columns, itemCount));  // 確保列數在 1 到 itemCount 之間

        const rows = Math.ceil(itemCount / columns);

        // 🔥 [v77.3] 計算卡片尺寸
        const availableWidth = width - horizontalMargin * 2;
        const totalSpacingWidth = (columns - 1) * fixedHorizontalSpacing;
        const cardWidth = (availableWidth - totalSpacingWidth) / columns;
        const cardHeight = (availableHeight - verticalSpacingBetweenRows - answerCardsBottomSpacing) / (rows * 2);

        console.log(`📊 匹配數: ${itemCount}, 使用 ${rows} 行 × ${columns} 列佈局`);
        console.log(`📐 卡片尺寸: ${cardWidth.toFixed(0)} × ${cardHeight.toFixed(0)}`);

        // 🔥 [v77.3] 計算上下區域的起始位置
        const topAreaStartX = horizontalMargin + cardWidth / 2;
        const topAreaStartY = topButtonArea + cardHeight / 2;
        const bottomAreaStartX = topAreaStartX;
        const bottomAreaStartY = topAreaStartY + cardHeight * rows + verticalSpacingBetweenRows + answerCardsBottomSpacing;

        console.log(`📍 區域位置: 上=${topAreaStartY.toFixed(0)}, 下=${bottomAreaStartY.toFixed(0)}`);

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
            shuffledAnswers = [...currentPagePairs];
            for (let i = shuffledAnswers.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledAnswers[i], shuffledAnswers[j]] = [shuffledAnswers[j], shuffledAnswers[i]];
            }
            console.log('🎲 使用隨機排列模式（Fisher-Yates 算法）');
        }

        // 🔥 [v77.3] 創建上方英文卡片（多行多列）
        currentPagePairs.forEach((pair, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);
            const x = topAreaStartX + col * (cardWidth + fixedHorizontalSpacing);
            const y = topAreaStartY + row * cardHeight;

            const animationDelay = index * 100;
            const card = this.createLeftCard(x, y, cardWidth, cardHeight, pair.question, pair.id, animationDelay, pair.imageUrl, pair.audioUrl);
            this.leftCards.push(card);
        });

        // 🔥 [v77.3] 創建下方空白框 + 答案卡片（多行多列）
        shuffledAnswers.forEach((pair, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);
            const x = bottomAreaStartX + col * (cardWidth + fixedHorizontalSpacing);
            const y = bottomAreaStartY + row * cardHeight;

            const emptyBox = this.createEmptyRightBox(x, y, cardWidth, cardHeight, pair.id);
            this.rightCards.push(emptyBox);

            if (!this.rightEmptyBoxes) this.rightEmptyBoxes = [];
            this.rightEmptyBoxes.push(emptyBox);

            const answerCard = this.createOutsideAnswerCard(x, y, cardWidth, cardHeight, pair.answer, pair.id, pair.chineseImageUrl, 'vertical');
            this.rightCards.push(answerCard);
        });

        console.log('✅ 上下分離佈局（多行多列）創建完成');
    }

    // 🔥 [v77.2] 備用方案：上下分離佈局 - 多行多列（當 SeparatedLayoutCalculator 不可用時）
    createTopBottomMultiRowsFallback(currentPagePairs, width, height) {
        console.log('📐 [v77.2] 使用備用方案：上下分離佈局 - 多行多列');

        const itemCount = currentPagePairs.length;

        // 簡化的卡片尺寸計算
        const cardWidth = Math.max(100, Math.min(200, width / 5));
        const cardHeight = Math.max(80, Math.min(150, height / 6));

        // 簡化的位置計算
        const horizontalMargin = (width - cardWidth * 5) / 6;
        const topAreaStartY = 120;
        const bottomAreaStartY = topAreaStartY + cardHeight * 2 + 30;

        // 計算列數
        const columns = Math.max(3, Math.floor((width - horizontalMargin * 2) / (cardWidth + 10)));
        const rows = Math.ceil(itemCount / columns);

        console.log(`📊 [v77.2] 備用方案 - 匹配數: ${itemCount}, 使用 ${rows} 行 × ${columns} 列佈局`);
        console.log(`📐 [v77.2] 卡片尺寸: ${cardWidth.toFixed(0)} × ${cardHeight.toFixed(0)}`);

        // 創建上方英文卡片
        currentPagePairs.forEach((pair, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);
            const x = horizontalMargin + col * (cardWidth + 10) + cardWidth / 2;
            const y = topAreaStartY + row * (cardHeight + 10) + cardHeight / 2;

            const card = this.createLeftCard(x, y, cardWidth, cardHeight, pair.question, pair.id, 0, pair.imageUrl, pair.audioUrl);
            this.leftCards.push(card);
        });

        // 創建下方空白框 + 答案卡片
        const shuffledAnswers = [...currentPagePairs].sort(() => Math.random() - 0.5);
        shuffledAnswers.forEach((pair, index) => {
            const col = index % columns;
            const row = Math.floor(index / columns);
            const x = horizontalMargin + col * (cardWidth + 10) + cardWidth / 2;
            const y = bottomAreaStartY + row * (cardHeight + 10) + cardHeight / 2;

            const emptyBox = this.createEmptyRightBox(x, y, cardWidth, cardHeight, pair.id);
            this.rightCards.push(emptyBox);

            if (!this.rightEmptyBoxes) this.rightEmptyBoxes = [];
            this.rightEmptyBoxes.push(emptyBox);

            const answerCard = this.createOutsideAnswerCard(x, y, cardWidth, cardHeight, pair.answer, pair.id, pair.chineseImageUrl, 'vertical');
            this.rightCards.push(answerCard);
        });

        console.log('✅ [v77.2] 備用方案 - 上下分離佈局（多行多列）創建完成');
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

    createLeftContainerBox(x, y, cardWidth, cardHeight, containerHeight) {
        // 🔥 [v8.0] 使用統一邊距配置系統 - 修正外框位置計算
        const margins = typeof SeparatedMarginConfig !== 'undefined'
            ? SeparatedMarginConfig.CONFIG.FRAME
            : { PADDING: 10, TOP_PADDING: 15 };

        const padding = margins.PADDING;
        const topPadding = margins.TOP_PADDING;

        const boxWidth = cardWidth + padding * 2;
        const boxHeight = containerHeight + padding * 2 + topPadding;

        // 🔥 [v8.0] 修正外框中心位置計算
        // x 已經是卡片的中心位置，外框中心應該就是 x，不需要額外偏移
        const boxCenterX = x;  // ✅ 修正：移除 + padding 偏移

        // 🔥 [v8.0] 修正 Y 軸位置計算
        // y = 第一張卡片的中心Y
        // containerHeight = 所有卡片的總高度（包括間距）
        // 正確公式：boxCenterY = y + (containerHeight - cardHeight) / 2 - topPadding / 2
        // 這樣外框會正確地包含所有卡片，並在頂部留出 topPadding 空間
        const boxCenterY = y + (containerHeight - cardHeight) / 2 - topPadding / 2;

        // 創建外框
        const containerBox = this.add.rectangle(boxCenterX, boxCenterY, boxWidth, boxHeight);
        containerBox.setStrokeStyle(2, 0x333333);  // 黑色邊框
        containerBox.setFillStyle(0xffffff, 0);    // 透明填充
        containerBox.setDepth(0);  // 在卡片下層

        // 🔥 [v8.0] 驗證卡片是否在框內
        this.verifyCardInFrame(x, y, cardWidth, cardHeight, containerHeight, boxCenterX, boxCenterY, boxWidth, boxHeight);
    }

    // 🔥 [v8.0] 驗證卡片是否在外框內
    verifyCardInFrame(cardCenterX, cardCenterY, cardWidth, cardHeight, containerHeight, boxCenterX, boxCenterY, boxWidth, boxHeight) {
        // 計算第一張卡片的邊界
        const firstCardTop = cardCenterY - cardHeight / 2;
        const firstCardBottom = cardCenterY + cardHeight / 2;

        // 計算最後一張卡片的邊界
        const lastCardCenterY = cardCenterY + containerHeight - cardHeight;
        const lastCardTop = lastCardCenterY - cardHeight / 2;
        const lastCardBottom = lastCardCenterY + cardHeight / 2;

        // 計算卡片區域的邊界
        const cardLeft = cardCenterX - cardWidth / 2;
        const cardRight = cardCenterX + cardWidth / 2;
        const cardTop = firstCardTop;
        const cardBottom = lastCardBottom;

        // 計算外框邊界
        const boxLeft = boxCenterX - boxWidth / 2;
        const boxRight = boxCenterX + boxWidth / 2;
        const boxTop = boxCenterY - boxHeight / 2;
        const boxBottom = boxCenterY + boxHeight / 2;

        // 驗證卡片是否在框內
        const isInside = cardLeft >= boxLeft && cardRight <= boxRight &&
                        cardTop >= boxTop && cardBottom <= boxBottom;

        // 計算邊距
        const topMargin = cardTop - boxTop;
        const bottomMargin = boxBottom - cardBottom;
        const leftMargin = cardLeft - boxLeft;
        const rightMargin = boxRight - cardRight;

        // 輸出驗證結果
        console.log('🔍 [v8.0] 卡片與外框驗證:', {
            isInside: isInside ? '✅ 在框內' : '❌ 超出框外',
            cardBoundary: { left: cardLeft.toFixed(1), right: cardRight.toFixed(1), top: cardTop.toFixed(1), bottom: cardBottom.toFixed(1) },
            boxBoundary: { left: boxLeft.toFixed(1), right: boxRight.toFixed(1), top: boxTop.toFixed(1), bottom: boxBottom.toFixed(1) },
            margins: { top: topMargin.toFixed(1), bottom: bottomMargin.toFixed(1), left: leftMargin.toFixed(1), right: rightMargin.toFixed(1) }
        });

        return isInside;
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

        // 🔥 [v140.0] 優先級系統 - 根據內容優先級決定佈局
        // 優先級 1：有文字 → 一定顯示文字
        // 優先級 2：沒有文字但有圖片 → 顯示圖片
        // 優先級 3：沒有文字和圖片但有語音 → 顯示語音

        console.log(`📊 [v140.0] 優先級系統 [${pairId}]:`, {
            優先級1_有文字: hasText,
            優先級2_有圖片: hasImage,
            優先級3_有語音: hasAudio
        });

        // 🔥 優先級 1：有文字 → 一定顯示文字
        if (hasText) {
            console.log(`✅ [v140.0] 優先級 1 - 顯示文字 [${pairId}]`);

            if (hasImage && hasAudio) {
                // 文字 + 圖片 + 語音
                console.log(`  └─ 佈局 A：文字 + 圖片 + 語音`);
                this.createCardLayoutA(container, background, width, height, text, imageUrl, safeAudioUrl, pairId);
            } else if (hasImage && !hasAudio) {
                // 文字 + 圖片（無語音）
                console.log(`  └─ 佈局 D：文字 + 圖片`);
                this.createCardLayoutD(container, background, width, height, text, imageUrl, pairId);
            } else if (!hasImage && hasAudio) {
                // 文字 + 語音（無圖片）
                console.log(`  └─ 佈局 E：文字 + 語音`);
                this.createCardLayoutE(container, background, width, height, text, safeAudioUrl, pairId);
            } else {
                // 只有文字
                console.log(`  └─ 佈局 C：只有文字`);
                this.createCardLayoutC(container, background, width, height, text);
            }
        }
        // 🔥 優先級 2：沒有文字但有圖片 → 顯示圖片
        else if (hasImage) {
            console.log(`✅ [v140.0] 優先級 2 - 顯示圖片 [${pairId}]`);

            if (hasAudio) {
                // 圖片 + 語音（無文字）
                console.log(`  └─ 佈局 A：圖片 + 語音`);
                this.createCardLayoutA(container, background, width, height, '', imageUrl, safeAudioUrl, pairId);
            } else {
                // 只有圖片
                console.log(`  └─ 佈局 F：只有圖片`);
                this.createCardLayoutF(container, background, width, height, imageUrl, pairId);
            }
        }
        // 🔥 優先級 3：沒有文字和圖片但有語音 → 顯示語音
        else if (hasAudio) {
            console.log(`✅ [v140.0] 優先級 3 - 顯示語音 [${pairId}]`);
            console.log(`  └─ 佈局 B：只有語音`);
            this.createCardLayoutB(container, background, width, height, safeAudioUrl, pairId);
        }
        // 🔥 都沒有：只顯示背景
        else {
            console.log(`⚠️ [v140.0] 沒有任何內容 [${pairId}] - 只顯示背景`);
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

        // 🔥 [v34.0] 設置互動（整個容器可拖曳）
        // 正確的方式：先 setInteractive，再 setDraggable
        container.setInteractive({ useHandCursor: true });
        this.input.setDraggable(container);

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

            // 🔥 [v34.0] 卡片"飄浮"起來的視覺效果
            // 移除 scale 放大以避免座標偏差
            container.setDepth(100);   // 提升到最上層（深度值100）
            background.setAlpha(0.9);  // 半透明（90%不透明度）
        });

        // 拖曳中 - 卡片跟隨鼠標
        container.on('drag', (pointer, dragX, dragY) => {
            if (!this.isDragging) {
                // 📝 調試訊息：拖曳狀態異常
                console.log('⚠️ 拖曳狀態異常：isDragging = false');
                return;
            }

            // 🔥 [v35.0] 使用 pointer 座標直接設置卡片位置
            // 這是 Phaser 的標準做法，pointer.x 和 pointer.y 已經是正確的全局座標
            container.x = pointer.x;
            container.y = pointer.y;

            console.log('🖱️ 拖拉中:', {
                pairId: container.getData('pairId'),
                pointerX: pointer.x.toFixed(0),
                pointerY: pointer.y.toFixed(0),
                currentX: container.x.toFixed(0),
                currentY: container.y.toFixed(0)
            });
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
                    // 🔥 [v35.0] 分離模式：先檢查是否拖到右容器的空白框
                    const droppedInBox = this.checkDropInRightBox(pointer, container);

                    if (!droppedInBox) {
                        // 沒有放到右容器，檢查是否拖曳到其他左側卡片（交換位置）
                        const swapped = this.checkSwap(pointer, container);

                        if (!swapped) {
                            // 沒有交換，返回原位
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

        // 1️⃣ 語音按鈕區域（上方 20% - 改進響應式設計）
        // 🔥 [v215.0] 改進：減少按鈕區域高度，給圖片和文字更多空間
        const buttonAreaHeight = height * 0.2;
        // 🔥 [v220.0] 改進：按鈕放在卡片內部，不要超出邊界
        // 按鈕位置 = 卡片頂部 + 按鈕區域高度的一半
        const buttonAreaY = -height / 2 + buttonAreaHeight / 2;

        // 🔥 [v228.0] 改進：調整按鈕大小百分比，使按鈕更清晰可見
        // 根據卡片數量調整百分比，確保按鈕大小合理
        const buttonSize = this.currentPageItemCount === 20
            ? buttonAreaHeight * 0.35  // 20 個卡片：35%（增大）
            : this.currentPageItemCount === 10
            ? buttonAreaHeight * 0.40  // 10 個卡片：40%（增大）
            : this.currentPageItemCount === 7
            ? buttonAreaHeight * 0.45  // 7 個卡片：45%（增大）
            : buttonAreaHeight * 0.50;  // 3-5 個卡片：50%（增大）

        // 🔥 [v228.0] 確保按鈕不超出卡片邊界
        // 按鈕最大值 = 按鈕區域高度的 90%（留 10% 邊距）
        const maxButtonSize = buttonAreaHeight * 0.9;
        const constrainedButtonSize = Math.min(buttonSize, maxButtonSize);

        console.log('🔊 準備調用 createAudioButton:', {
            audioUrl: audioUrl ? '有' : '無',
            buttonAreaY,
            buttonSize: constrainedButtonSize,
            maxButtonSize
        });

        this.createAudioButton(container, audioUrl, 0, buttonAreaY, constrainedButtonSize, pairId);

        console.log('✅ createAudioButton 調用完成');

        // 2️⃣ 圖片區域（中間 50% - 改進響應式設計）
        // 🔥 [v215.0] 改進：增加圖片區域高度，因為按鈕區域從 30% 改為 20%
        const imageAreaHeight = height * 0.5;
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

        // 🔥 [v215.0] 改進：語音按鈕置中，但大小更合理
        // 使用卡片寬度和高度中的較小值來計算按鈕大小
        const buttonSize = Math.max(40, Math.min(60, Math.min(width, height) * 0.5));
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

        // 🎨 [v1.0] 使用 contentSizes 計算圖片大小
        // 從 this.currentContentSizes 獲取預計算的內容大小
        const contentSizes = this.currentContentSizes;

        // 圖片區域：佔據卡片上方 50%
        const imageHeight = height * 0.5;
        const imageY = -height / 2 + imageHeight / 2;

        // 🔥 文字區域：佔據卡片下方 50%，但需要留出底部間距
        const textAreaHeight = height * 0.5;
        const bottomPadding = contentSizes ? contentSizes.spacing.padding : Math.max(8, height * 0.08);
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
            formula: `textY = ${height / 2} - ${bottomPadding} - ${textHeight / 2} = ${textY}`,
            contentSizesUsed: !!contentSizes
        });

        // 計算正方形圖片的尺寸（1:1 比例）
        // 🎨 [v1.0] 使用 contentSizes 中的圖片大小
        const squareSize = contentSizes
            ? Math.min(contentSizes.image.width, contentSizes.image.height, imageHeight - 4)
            : Math.min(width - 4, imageHeight - 4);

        // 創建圖片
        // ✅ v44.0：添加錯誤處理
        // 🔥 [v68.0] 修復：使用 english-${pairId} 作為 imageKey，避免與中文圖片衝突
        this.loadAndDisplayImage(container, imageUrl, 0, imageY, squareSize, `english-${pairId}`).catch(error => {
            console.error('❌ 圖片載入失敗 (佈局 D):', error);
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

        // 🔥 [v215.0] 改進：語音按鈕在上方，大小更合理
        const buttonSize = Math.max(24, Math.min(40, width * 0.2));
        const buttonY = -height / 2 + buttonSize / 2 + 8;
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

        // 🔥 [v215.0] 改進：創建語音按鈕（下方），大小更合理
        const buttonSize = Math.max(24, Math.min(40, width * 0.18));
        const buttonY = height / 2 - buttonSize / 2 - 5;
        this.createAudioButton(container, audioUrl, 0, buttonY, buttonSize, pairId);
    }

    // 🔥 輔助函數 - 載入並顯示圖片
    // ✅ v44.0：修復圖片載入失敗 - 使用 Fetch API 直接載入圖片
    // 🔥 [v72.0] 添加詳細調適訊息追蹤圖片寬度變化
    loadAndDisplayImage(container, imageUrl, x, y, size, pairId) {
        const imageKey = `card-image-${pairId}`;

        // 🔥 [v72.0] 記錄圖片寬度信息
        console.log('🖼️ [v72.0] loadAndDisplayImage 被調用:', {
            pairId,
            imageKey,
            size: size.toFixed(2),
            x: x.toFixed(2),
            y: y.toFixed(2),
            containerWidth: container.width,
            containerHeight: container.height,
            sceneWidth: this.scale.width,
            sceneHeight: this.scale.height,
            timestamp: new Date().toISOString()
        });

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

                            // 🔥 [v72.0] 記錄圖片創建完成
                            console.log(`✅ [v72.0] 圖片載入完成: ${imageKey}`, {
                                displaySize: size.toFixed(2),
                                actualWidth: cardImage.width.toFixed(2),
                                actualHeight: cardImage.height.toFixed(2),
                                displayWidth: cardImage.displayWidth.toFixed(2),
                                displayHeight: cardImage.displayHeight.toFixed(2),
                                position: { x: cardImage.x.toFixed(2), y: cardImage.y.toFixed(2) }
                            });
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

            // 🔥 [v72.0] 記錄圖片創建完成（已緩存）
            console.log(`✅ [v72.0] 圖片載入完成（已緩存）: ${imageKey}`, {
                displaySize: size.toFixed(2),
                actualWidth: cardImage.width.toFixed(2),
                actualHeight: cardImage.height.toFixed(2),
                displayWidth: cardImage.displayWidth.toFixed(2),
                displayHeight: cardImage.displayHeight.toFixed(2),
                position: { x: cardImage.x.toFixed(2), y: cardImage.y.toFixed(2) }
            });
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

        // 🎨 [v1.0] 使用 contentSizes 中的字體大小
        const contentSizes = this.currentContentSizes;
        let fontSize = contentSizes
            ? contentSizes.text.fontSize
            : Math.max(14, Math.min(48, height * 0.6));

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
            contentSizesUsed: !!contentSizes,
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
        // 🔥 [v227.0] 修正：直接使用傳入的 size 參數，確保按鈕響應卡片尺寸
        // ✅ 這樣按鈕會像圖片和文字一樣響應卡片尺寸的變化
        const buttonSize = size;

        console.log('🔊 創建語音按鈕:', {
            x, y,
            size,
            buttonSize,
            audioUrl: audioUrl ? '有' : '無',
            pairId,
            responsive: '✅ 使用傳入的 size 參數，完全響應式'
        });

        // 🔥 創建按鈕背景（相對於 buttonContainer 的座標為 0, 0）
        const buttonBg = this.add.rectangle(0, 0, buttonSize, buttonSize, 0x4CAF50);
        buttonBg.setStrokeStyle(2, 0x2E7D32);
        buttonBg.setOrigin(0.5);

        // 🔥 創建喇叭圖標（相對於 buttonContainer 的座標為 0, 0）
        const speakerIcon = this.add.text(0, 0, '🔊', {
            fontSize: `${buttonSize * 0.6}px`,
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
        // 🔥 [v24.0] 改進右側卡片 - 中文卡片不顯示語音按鈕
        console.log('🎨 [v24.0] createRightCard 被調用:', {
            pairId,
            hasText: !!text && text.trim() !== '',
            hasImage: !!imageUrl && imageUrl.trim() !== '',
            textPosition,
            note: '右側卡片（中文）不顯示語音按鈕'
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

        // 🔥 [v62.0] 檢查內容組合
        const hasImage = imageUrl && imageUrl.trim() !== '';
        const hasText = text && text.trim() !== '' && text.trim() !== '<br>';

        console.log('🔍 [v24.0] 右側卡片內容檢查:', {
            pairId,
            hasImage,
            hasText,
            hasAudio: false,
            combination: `${hasImage ? 'I' : '-'}${hasText ? 'T' : '-'}-`
        });

        // 🔥 [v24.0] 根據內容組合決定佈局 - 不包含語音選項
        if (hasImage && hasText) {
            // 情況 D：圖片 + 文字
            this.createRightCardLayoutD(container, background, width, height, text, imageUrl, pairId);
        } else if (hasImage && !hasText) {
            // 情況 F：只有圖片
            this.createRightCardLayoutF(container, background, width, height, imageUrl, pairId);
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
        background.setInteractive({ useHandCursor: true }, Phaser.Geom.Rectangle.Contains);

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

        // 1️⃣ 語音按鈕區域（上方 20% - 改進響應式設計）
        // 🔥 [v215.0] 改進：減少按鈕區域高度，給圖片和文字更多空間
        const buttonAreaHeight = height * 0.2;
        const buttonAreaY = -height / 2 + buttonAreaHeight / 2;
        // 🔥 [v215.0] 改進：按鈕大小計算更合理
        const buttonSize = Math.max(14, Math.min(28, buttonAreaHeight * 0.45));

        this.createAudioButton(container, audioUrl, 0, buttonAreaY, buttonSize, pairId);

        // 2️⃣ 圖片區域（中間 50% - 改進響應式設計）
        // 🔥 [v215.0] 改進：增加圖片區域高度，因為按鈕區域從 30% 改為 20%
        const imageAreaHeight = height * 0.5;
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

        // 🔥 [v215.0] 改進：語音按鈕在下方，大小更合理
        const buttonSize = Math.max(24, Math.min(40, width * 0.2));
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

        // 🔥 [v215.0] 改進：創建語音按鈕（下方），大小更合理
        const buttonSize = Math.max(24, Math.min(40, width * 0.18));
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

    // 🔥 [v35.0] 檢查是否拖到右容器的空白框（分離模式）
    checkDropInRightBox(pointer, draggedCard) {
        console.log('🔍 [v35.0] 檢查是否拖到右容器空白框:', {
            draggedCardId: draggedCard.getData('pairId'),
            draggedCardPosition: { x: draggedCard.x, y: draggedCard.y },
            pointerPosition: { x: pointer.x, y: pointer.y },
            emptyBoxesCount: (this.rightEmptyBoxes || []).length
        });

        // 遍歷所有右側空白框
        for (let i = 0; i < (this.rightEmptyBoxes || []).length; i++) {
            const emptyBox = this.rightEmptyBoxes[i];
            const bounds = emptyBox.getBounds();

            console.log(`🔍 [v174.0] 檢查空白框 ${i}:`, {
                boxPairId: emptyBox.getData('pairId'),
                boxPosition: { x: emptyBox.x, y: emptyBox.y },
                boxBounds: { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height },
                pointerInBounds: bounds.contains(pointer.x, pointer.y),
                cardInBounds: bounds.contains(draggedCard.x, draggedCard.y)
            });

            // 🔥 [v174.0] 修復：同時檢查指針位置和卡片位置
            // 如果指針在框內，或者卡片中心在框內，都認為是拖到了框
            const pointerInBox = bounds.contains(pointer.x, pointer.y);
            const cardInBox = bounds.contains(draggedCard.x, draggedCard.y);

            if (pointerInBox || cardInBox) {
                console.log('✅ [v35.0] 卡片拖到空白框:', {
                    pairId: draggedCard.getData('pairId'),
                    boxPairId: emptyBox.getData('pairId'),
                    boxBounds: { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height },
                    matchReason: pointerInBox ? '指針在框內' : '卡片在框內'
                });

                // 檢查是否匹配
                if (draggedCard.getData('pairId') === emptyBox.getData('pairId')) {
                    // ✅ 匹配成功
                    console.log('🎉 [v35.0] 配對成功！');
                    this.checkMatch(draggedCard, emptyBox);
                } else {
                    // ⚠️ 不匹配，但卡片仍然停留在框裡
                    console.log('⚠️ [v35.0] 不匹配，但卡片停留在框裡');

                    // 🔥 [v187.0] 新增：設置 currentFrameIndex（關鍵修復！）
                    draggedCard.setData('currentFrameIndex', i);
                    console.log('🔥 [v187.0] 已設置 currentFrameIndex:', {
                        pairId: draggedCard.getData('pairId'),
                        currentFrameIndex: i,
                        emptyBoxPairId: emptyBox.getData('pairId')
                    });

                    // 將卡片移動到框的中心位置
                    const boxCenterX = bounds.x + bounds.width / 2;
                    const boxCenterY = bounds.y + bounds.height / 2;

                    this.tweens.add({
                        targets: draggedCard,
                        x: boxCenterX,
                        y: boxCenterY,
                        duration: 200,
                        ease: 'Back.easeOut',
                        onComplete: () => {
                            draggedCard.setDepth(5);
                            const background = draggedCard.list[0];
                            if (background) background.setAlpha(1);

                            // 🔥 [v157.0] 保存卡片位置（即使不匹配也要保存）
                            console.log('🔥 [v157.0] 保存卡片位置（不匹配但停留在框內）:', {
                                pairId: draggedCard.getData('pairId'),
                                x: draggedCard.x.toFixed(0),
                                y: draggedCard.y.toFixed(0)
                            });
                            this.saveCardPositionForCurrentPage(draggedCard);
                        }
                    });
                }

                return true;  // 卡片已停留在框裡
            }
        }

        console.log('❌ [v35.0] 卡片沒有拖到任何空白框');
        return false;
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

        // 🔥 [v35.0] 分離模式：檢查指針是否在任何右側空白框上
        let targetBox = null;

        // 使用 rightEmptyBoxes 而不是 rightCards
        for (const box of this.rightEmptyBoxes || []) {
            const bounds = box.getBounds();
            console.log('🔍 [v35.0] 檢查空白框:', {
                boxPairId: box.getData('pairId'),
                bounds: { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height },
                pointerX: pointer.x,
                pointerY: pointer.y,
                contains: bounds.contains(pointer.x, pointer.y)
            });

            if (bounds.contains(pointer.x, pointer.y)) {
                targetBox = box;
                console.log('✅ [v35.0] 找到目標空白框:', box.getData('pairId'));
                break;
            }
        }

        if (targetBox) {
            console.log('🎯 [v35.0] 執行配對檢查:', {
                leftCard: draggedCard.getData('pairId'),
                rightBox: targetBox.getData('pairId')
            });
            this.checkMatch(draggedCard, targetBox);
            return true;
        }

        console.log('❌ [v35.0] 沒有找到目標空白框');
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

        // 🔥 [v164.0] 深度調試：記錄所有進入 checkMatch 的卡片
        console.log('🔥 [v164.0] checkMatch 被調用:', {
            leftCardPairId: leftCard.getData('pairId'),
            rightCardPairId: rightCard.getData('pairId'),
            rightCardIsEmptyBox: rightCard.getData('isEmptyBox'),
            layout: this.layout
        });

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

        // 🔥 [v164.0] 深度調試：檢查 rightCard 的狀態
        console.log('🔥 [v164.0] onMatchSuccess 開始 - 檢查 rightCard 狀態:', {
            pairId: pairId,
            layout: this.layout,
            rightCardPairId: rightCard.getData('pairId'),
            rightCardIsEmptyBox: rightCard.getData('isEmptyBox'),
            rightCardType: rightCard.constructor.name,
            rightCardX: rightCard.x,
            rightCardY: rightCard.y
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

                // 🔥 [v144.0] 修復：將卡片添加到空白框容器中，以便提交答案時能找到
                // 這樣 checkAllMatches 函數才能通過 emptyBox.list 找到卡片
                if (this.layout === 'separated' && rightCard.getData('isEmptyBox')) {
                    console.log('🔥 [v144.0] 將卡片添加到空白框容器前:', {
                        cardPairId: leftCard.getData('pairId'),
                        boxPairId: rightCard.getData('pairId'),
                        cardWorldPos: { x: leftCard.x, y: leftCard.y },
                        boxWorldPos: { x: rightCard.x, y: rightCard.y },
                        boxChildrenBefore: rightCard.list.length
                    });

                    // 🔥 [v145.0] 修復：在添加到容器前，計算卡片相對於容器的座標
                    // 因為添加到容器後，卡片的座標會變成相對於容器的座標
                    const cardRelativeX = leftCard.x - rightCard.x;
                    const cardRelativeY = leftCard.y - rightCard.y;

                    // 將卡片添加到空白框容器中
                    rightCard.add(leftCard);

                    // 設置卡片相對於容器的座標
                    leftCard.setPosition(cardRelativeX, cardRelativeY);

                    // 🔥 [v160.0] 添加到容器後，卡片的座標已經變成相對座標
                    // 獲取卡片在容器內的實際相對座標
                    const actualRelativeX = leftCard.x;
                    const actualRelativeY = leftCard.y;

                    console.log('🔥 [v145.0] 卡片已添加到空白框容器:', {
                        cardPairId: leftCard.getData('pairId'),
                        boxPairId: rightCard.getData('pairId'),
                        cardRelativePos: { x: cardRelativeX, y: cardRelativeY },
                        boxChildrenAfter: rightCard.list.length
                    });

                    // 🔥 [v171.0] 修復：保存空白框的索引位置而不是 pairId
                    // 原因：pairId 在頁面返回時可能對應不同的位置，但索引位置始終一致
                    const pairIdForSave = leftCard.getData('pairId');

                    // 🔥 [v171.0] 找到空白框在 rightEmptyBoxes 中的索引
                    const emptyBoxIndex = this.rightEmptyBoxes.findIndex(box => box === rightCard);

                    // 🔥 [v176.0] 新增：設置 currentFrameIndex（應用混合模式的簡潔設計）
                    leftCard.setData('currentFrameIndex', emptyBoxIndex);
                    console.log('🔥 [v176.0] 已設置卡片的 currentFrameIndex:', {
                        pairId: pairIdForSave,
                        currentFrameIndex: emptyBoxIndex
                    });

                    // 🔥 [v186.0] 調適訊息：驗證 currentFrameIndex 是否正確設置
                    console.log('🔥 [v186.0] onMatchSuccess 完成 - 卡片狀態驗證:', {
                        pairId: pairIdForSave,
                        currentFrameIndex: leftCard.getData('currentFrameIndex'),
                        isMatched: leftCard.getData('isMatched'),
                        matchedWith: leftCard.getData('matchedWith') ? '已設置' : '未設置',
                        cardX: leftCard.x.toFixed(0),
                        cardY: leftCard.y.toFixed(0)
                    });

                    console.log('🔥 [v171.0] 保存卡片位置前的檢查:', {
                        pairId: pairIdForSave,
                        emptyBoxIndex: emptyBoxIndex,
                        emptyBoxPairId: rightCard.getData('pairId'),
                        pairIdType: typeof pairIdForSave,
                        pairIdIsUndefined: pairIdForSave === undefined,
                        pairIdIsNull: pairIdForSave === null,
                        actualRelativeX: actualRelativeX,
                        actualRelativeY: actualRelativeY
                    });

                    console.log('🔥 [v171.0] 保存卡片位置（配對成功）:', {
                        pairId: pairIdForSave,
                        emptyBoxIndex: emptyBoxIndex,
                        emptyBoxPairId: rightCard.getData('pairId'),
                        actualRelativeX: actualRelativeX,
                        actualRelativeY: actualRelativeY
                    });

                    // 保存卡片位置信息
                    if (!this.allPagesCardPositions[this.currentPage]) {
                        this.allPagesCardPositions[this.currentPage] = {};
                    }

                    // 🔥 [v171.0] 檢查 pairId 和 emptyBoxIndex 是否有效
                    if (pairIdForSave === undefined || pairIdForSave === null) {
                        console.error('❌ [v171.0] 錯誤：pairId 為 undefined 或 null！', {
                            leftCard: leftCard,
                            leftCardData: leftCard.getData('pairId'),
                            rightCard: rightCard,
                            rightCardData: rightCard.getData('pairId')
                        });
                    } else if (emptyBoxIndex === -1) {
                        console.error('❌ [v171.0] 錯誤：未找到空白框在 rightEmptyBoxes 中的索引！', {
                            pairId: pairIdForSave,
                            rightCard: rightCard,
                            rightEmptyBoxesCount: this.rightEmptyBoxes.length
                        });
                    } else {
                        // 🔥 [v176.0] 改進：只保存 currentFrameIndex（應用混合模式的簡潔設計）
                        this.allPagesCardPositions[this.currentPage][pairIdForSave] = {
                            isMatched: true,
                            currentFrameIndex: emptyBoxIndex  // ✅ [v176.0] 簡化：只保存框的索引
                        };
                        console.log('✅ [v176.0] 卡片位置已保存（簡化版）:', {
                            pairId: pairIdForSave,
                            currentFrameIndex: emptyBoxIndex,
                            currentPage: this.currentPage
                        });
                    }
                }

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

    // 🔥 [v120.0] 計算響應式 UI 尺寸
    calculateResponsiveUISize() {
        const width = this.scale.width;
        const height = this.scale.height;

        // 🔥 [v120.0] 基於屏幕尺寸的響應式計算
        const minDimension = Math.min(width, height);

        // 🔥 [v120.0] 計算縮放因子（相對於基準尺寸 960×540）
        const baseSize = 960;
        const scaleFactor = minDimension / baseSize;

        // 🔥 [v120.0] 按鈕尺寸（確保最小觸摸目標 44×44px）
        const buttonWidth = Math.max(44, Math.min(150, width * 0.15 * scaleFactor));
        const buttonHeight = Math.max(44, Math.min(60, height * 0.08 * scaleFactor));
        const buttonFontSize = Math.max(12, Math.min(20, width * 0.02 * scaleFactor));

        // 🔥 [v120.0] 分頁選擇器尺寸
        const selectorWidth = Math.max(60, Math.min(100, width * 0.1 * scaleFactor));
        const selectorHeight = Math.max(30, Math.min(50, height * 0.06 * scaleFactor));
        const selectorFontSize = Math.max(12, Math.min(18, width * 0.018 * scaleFactor));
        const selectorButtonSize = Math.max(24, Math.min(40, Math.min(width, height) * 0.04 * scaleFactor));

        // 🔥 [v120.0] 文字尺寸
        const textFontSize = Math.max(12, Math.min(18, width * 0.016 * scaleFactor));

        console.log('🔥 [v120.0] 響應式 UI 尺寸計算:', {
            scaleFactor: scaleFactor.toFixed(2),
            buttonWidth: buttonWidth.toFixed(1),
            buttonHeight: buttonHeight.toFixed(1),
            buttonFontSize: buttonFontSize.toFixed(1),
            selectorWidth: selectorWidth.toFixed(1),
            selectorHeight: selectorHeight.toFixed(1),
            selectorFontSize: selectorFontSize.toFixed(1),
            selectorButtonSize: selectorButtonSize.toFixed(1)
        });

        return {
            buttonWidth,
            buttonHeight,
            buttonFontSize,
            selectorWidth,
            selectorHeight,
            selectorFontSize,
            selectorButtonSize,
            textFontSize
        };
    }

    // 🔥 [v120.0] 計算響應式卡片尺寸
    calculateResponsiveCardSize(width, height, pairCount) {
        // 🔥 [v120.0] 基於屏幕尺寸的響應式計算
        const minDimension = Math.min(width, height);
        const baseSize = 960;
        const scaleFactor = minDimension / baseSize;

        // 🔥 [v120.0] 檢測設備類型
        const isDesktopXGA = width === 1024 && height === 768;
        const isRealTablet = width >= 768 && width <= 1024 && height >= 600 && !isDesktopXGA;
        const isMobile = width < 768;

        // 🔥 [v120.0] 根據設備類型計算卡片尺寸
        let cardWidth, cardHeight, cardFontSize;

        if (isMobile) {
            // 手機：更小的卡片
            cardWidth = Math.max(100, Math.min(200, width * 0.25 * scaleFactor));
            cardHeight = Math.max(40, Math.min(70, height * 0.08 * scaleFactor));
            cardFontSize = Math.max(10, Math.min(14, width * 0.012 * scaleFactor));
        } else if (isRealTablet) {
            // 平板：中等卡片
            cardWidth = Math.max(140, Math.min(250, width * 0.2 * scaleFactor));
            cardHeight = Math.max(50, Math.min(90, height * 0.1 * scaleFactor));
            cardFontSize = Math.max(12, Math.min(16, width * 0.014 * scaleFactor));
        } else {
            // 桌面：較大的卡片
            cardWidth = Math.max(150, Math.min(300, width * 0.2 * scaleFactor));
            cardHeight = Math.max(50, Math.min(100, height * 0.1 * scaleFactor));
            cardFontSize = Math.max(12, Math.min(18, width * 0.016 * scaleFactor));
        }

        console.log('🔥 [v120.0] 響應式卡片尺寸計算:', {
            deviceType: isMobile ? 'Mobile' : isRealTablet ? 'Tablet' : 'Desktop',
            scaleFactor: scaleFactor.toFixed(2),
            cardWidth: cardWidth.toFixed(1),
            cardHeight: cardHeight.toFixed(1),
            cardFontSize: cardFontSize.toFixed(1),
            pairCount: pairCount
        });

        return {
            cardWidth,
            cardHeight,
            cardFontSize
        };
    }

    // 🔥 [v121.0] 初始化性能監控
    initializePerformanceMonitoring() {
        // 🔥 [v121.0] 記錄遊戲開始時間
        this.gameStartTime = performance.now();

        // 🔥 [v121.0] 創建性能監控文字
        this.performanceStats = this.add.text(10, 10, '', {
            font: '14px Arial',
            fill: '#00ff00',
            backgroundColor: '#000000',
            padding: { x: 5, y: 5 }
        });
        this.performanceStats.setDepth(10000);
        this.performanceStats.setScrollFactor(0);

        // 🔥 [v121.0] 設置性能監控更新事件
        this.time.addEvent({
            delay: 1000,
            callback: () => this.updatePerformanceStats(),
            loop: true
        });

        console.log('🔥 [v121.0] 性能監控已初始化');
    }

    // 🔥 [v121.0] 更新性能統計
    updatePerformanceStats() {
        if (!this.performanceStats) return;

        // 🔥 [v121.0] 計算 FPS
        const fps = Math.round(this.game.loop.actualFps);

        // 🔥 [v121.0] 計算內存使用
        let memoryUsage = 'N/A';
        if (performance.memory) {
            memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1048576) + 'MB';
        }

        // 🔥 [v121.0] 計算加載時間
        const currentTime = performance.now();
        const loadTime = ((currentTime - this.gameStartTime) / 1000).toFixed(1);

        // 🔥 [v121.0] 計算卡片數量
        const cardCount = this.leftCards.length + this.rightCards.length;

        // 🔥 [v121.0] 更新文字
        const fpsStatus = fps >= 60 ? '✅' : fps >= 30 ? '⚠️' : '❌';
        const memoryStatus = memoryUsage !== 'N/A' && parseInt(memoryUsage) < 100 ? '✅' : '⚠️';

        this.performanceStats.setText(
            `${fpsStatus} FPS: ${fps}\n` +
            `${memoryStatus} Memory: ${memoryUsage}\n` +
            `⏱️ Load: ${loadTime}s\n` +
            `🎴 Cards: ${cardCount}`
        );

        // 🔥 [v121.0] 記錄性能數據
        if (fps < 60 || (memoryUsage !== 'N/A' && parseInt(memoryUsage) > 100)) {
            console.warn('⚠️ [v121.0] 性能警告:', {
                fps: fps,
                memory: memoryUsage,
                loadTime: loadTime,
                cardCount: cardCount
            });
        }
    }

    // 🔥 顯示「提交答案」按鈕
    showSubmitButton() {
        const width = this.scale.width;
        const height = this.scale.height;

        console.log('🔍 顯示提交答案按鈕', { width, height });

        // 🔥 [v120.0] 使用響應式 UI 尺寸
        const uiSize = this.calculateResponsiveUISize();
        const buttonWidth = uiSize.buttonWidth;
        const buttonHeight = uiSize.buttonHeight;
        const fontSize = uiSize.buttonFontSize;

        // 🔥 按鈕位置（最底下中央，留出更多空間）
        const buttonX = width / 2;
        const buttonY = height - buttonHeight / 2 - 5;  // 距離底部 5px

        console.log('🔍 按鈕位置', { buttonX, buttonY, buttonWidth, buttonHeight });

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

        // 🔥 [v115.0] 詳細調適訊息：追蹤提交答案時的狀態
        console.log('🔥 [v115.0] ========== 提交答案開始 ==========');
        console.log('🔥 [v115.0] 提交答案時的頁面狀態:', {
            currentPage: this.currentPage,
            pageDisplayName: `第 ${this.currentPage + 1} 頁`,
            totalPages: this.totalPages,
            layout: this.layout
        });

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
            // 分離模式：使用改進的邏輯（v176.0）
            console.log('🔍 [v176.0] 分離模式：使用 currentFrameIndex 檢查答案', {
                rightEmptyBoxesLength: this.rightEmptyBoxes ? this.rightEmptyBoxes.length : 0,
                leftCardsLength: this.leftCards ? this.leftCards.length : 0,
                currentPagePairsLength: currentPagePairs.length
            });

            // 🔥 [v180.0] 改進：使用 frameIndexToPairIdMap 驗證答案
            // 遍歷所有 frameIndex（空白框位置）
            for (let frameIndex = 0; frameIndex < this.rightEmptyBoxes.length; frameIndex++) {
                // 🔥 [v180.0] 從映射中獲取期望的 pairId
                const expectedPairId = this.frameIndexToPairIdMap[frameIndex];

                // 找到當前在這個框位置的卡片
                const currentCardInFrame = this.leftCards.find(card =>
                    card.getData('currentFrameIndex') === frameIndex
                );

                console.log(`🔍 [v180.0] 框位置 ${frameIndex + 1}/${this.rightEmptyBoxes.length}:`, {
                    expectedPairId: expectedPairId,
                    frameIndex: frameIndex,
                    hasCardInFrame: !!currentCardInFrame,
                    cardPairId: currentCardInFrame ? currentCardInFrame.getData('pairId') : null
                });

                if (currentCardInFrame) {
                    const currentCardPairId = currentCardInFrame.getData('pairId');
                    const isCorrect = expectedPairId === currentCardPairId;
                    const userAnswerPair = this.pairs.find(p => p.id === currentCardPairId);
                    const expectedPair = this.pairs.find(p => p.id === expectedPairId);

                    console.log(`🔍 [v180.0] 答案驗證 - 框位置 ${frameIndex + 1}:`, {
                        expectedPairId: expectedPairId,
                        selectedPairId: currentCardPairId,
                        isCorrect,
                        expectedChinese: expectedPair ? expectedPair.chinese : 'N/A',
                        expectedEnglish: expectedPair ? expectedPair.english : 'N/A',
                        userAnswerEnglish: userAnswerPair ? userAnswerPair.english : null
                    });

                    this.currentPageAnswers.push({
                        page: this.currentPage,
                        leftText: expectedPair ? expectedPair.chinese : 'N/A',
                        rightText: userAnswerPair ? userAnswerPair.english : '(未知)',
                        correctAnswer: expectedPair ? expectedPair.english : 'N/A',
                        correctChinese: expectedPair ? expectedPair.chinese : 'N/A',
                        isCorrect: isCorrect,
                        leftPairId: expectedPairId,
                        rightPairId: currentCardPairId
                    });

                    if (isCorrect) {
                        correctCount++;
                        console.log('✅ [v180.0] 配對正確:', expectedPair ? expectedPair.chinese : 'N/A', '-', userAnswerPair ? userAnswerPair.english : 'N/A');

                        // 🔥 [v190.0] 修復：在分離模式中，視覺指示器應該顯示在空白框上，而不是左卡片上
                        if (this.layout === 'separated') {
                            // 在空白框上顯示勾勾
                            const emptyBox = this.rightEmptyBoxes[frameIndex];
                            if (emptyBox) {
                                this.showCorrectAnswer(emptyBox, expectedPair ? expectedPair.english : 'N/A');
                            }
                        } else {
                            // 混合模式：在左卡片上顯示勾勾
                            this.showCorrectAnswer(currentCardInFrame, expectedPair ? expectedPair.english : 'N/A');
                        }
                    } else {
                        incorrectCount++;
                        console.log('❌ [v180.0] 配對錯誤:', expectedPair ? expectedPair.chinese : 'N/A', '-', userAnswerPair ? userAnswerPair.english : 'N/A');

                        // 🔥 [v190.0] 修復：在分離模式中，視覺指示器應該顯示在空白框上，而不是左卡片上
                        if (this.layout === 'separated') {
                            // 在空白框上顯示叉叉
                            const emptyBox = this.rightEmptyBoxes[frameIndex];
                            if (emptyBox) {
                                this.showIncorrectAnswer(emptyBox, expectedPair ? expectedPair.english : 'N/A');
                            }
                        } else {
                            // 混合模式：在左卡片上顯示叉叉
                            this.showIncorrectAnswer(currentCardInFrame, expectedPair ? expectedPair.english : 'N/A');
                        }
                    }
                } else {
                    // 沒有卡片在這個框位置
                    unmatchedCount++;
                    const expectedPair = this.pairs.find(p => p.id === expectedPairId);
                    console.log('⚠️ [v180.0] 未配對:', expectedPair ? expectedPair.chinese : 'N/A');

                    // 在空白框上顯示叉叉
                    const emptyBox = this.rightEmptyBoxes[frameIndex];
                    if (emptyBox) {
                        this.showIncorrectAnswer(emptyBox, expectedPair ? expectedPair.english : 'N/A');
                    }

                    this.currentPageAnswers.push({
                        page: this.currentPage,
                        leftText: expectedPair ? expectedPair.chinese : 'N/A',
                        rightText: null,
                        correctAnswer: expectedPair ? expectedPair.english : 'N/A',
                        correctChinese: expectedPair ? expectedPair.chinese : 'N/A',
                        isCorrect: false,
                        leftPairId: expectedPairId,
                        rightPairId: null
                    });
                }
            }

            console.log('✅ [v176.0] 分離模式答案驗證完成');

            // 🔥 [v178.0] 修復：移除重複的舊邏輯循環
            // 原有的第二個循環（v35.0 和 v147.0）已被新的 v176.0 邏輯取代
            // 該舊邏輯會導致勾勾和叉叉被顯示兩次
            console.log('🔥 [v178.0] 分離模式答案驗證已完成，跳過舊邏輯循環');
        }

        // 🔥 [v182.0] 保存當前頁的卡片位置（包括未拖動的卡片）
        console.log('🔥 [v182.0] ========== 保存卡片位置開始 ==========');
        if (!this.allPagesCardPositions[this.currentPage]) {
            this.allPagesCardPositions[this.currentPage] = {};
        }

        // 保存所有左側卡片的位置
        this.leftCards.forEach(card => {
            const pairId = card.getData('pairId');
            const currentFrameIndex = card.getData('currentFrameIndex');

            // 只保存有 currentFrameIndex 的卡片（已拖動到空白框的卡片）
            if (currentFrameIndex !== undefined && currentFrameIndex !== null) {
                this.allPagesCardPositions[this.currentPage][pairId] = {
                    isMatched: card.getData('isMatched'),
                    currentFrameIndex: currentFrameIndex
                };
                console.log('✅ [v182.0] 已保存卡片位置:', {
                    pairId: pairId,
                    currentFrameIndex: currentFrameIndex,
                    isMatched: card.getData('isMatched')
                });
            }
        });
        console.log('🔥 [v182.0] ========== 保存卡片位置結束 ==========');

        // 🔥 [v132.0] 保存當前頁的配對結果和答案（用於返回前面頁面時顯示勾勾和叉叉）
        console.log('🔥 [v132.0] ========== checkAllMatches 保存配對結果開始 ==========');
        console.log('🔥 [v132.0] 保存前的狀態:', {
            currentPage: this.currentPage,
            matchedPairsSize: this.matchedPairs.size,
            currentPageAnswersLength: this.currentPageAnswers.length
        });

        // 保存配對結果
        this.allPagesMatchedPairs[this.currentPage] = new Set(this.matchedPairs);

        // 保存當前頁的答案
        const pageAnswersKey = `page_${this.currentPage}_answers`;
        this[pageAnswersKey] = [...this.currentPageAnswers];

        console.log('🔥 [v132.0] 已保存配對結果:', {
            pageIndex: this.currentPage,
            savedPairsSize: this.allPagesMatchedPairs[this.currentPage].size,
            savedAnswersLength: this.currentPageAnswers.length,
            pageAnswersKey: pageAnswersKey
        });
        console.log('🔥 [v132.0] ========== checkAllMatches 保存配對結果結束 ==========');

        // 🔥 [v185.0] 新增：在提交答案時保存卡片位置（關鍵修復！）
        console.log('🔥 [v185.0] ========== checkAllMatches 保存卡片位置開始 ==========');
        console.log('🔥 [v186.0] 調適訊息 - 保存前的狀態:', {
            currentPage: this.currentPage,
            leftCardsCount: this.leftCards.length,
            allPagesCardPositionsKeys: Object.keys(this.allPagesCardPositions)
        });

        if (!this.allPagesCardPositions[this.currentPage]) {
            this.allPagesCardPositions[this.currentPage] = {};
            console.log('🔥 [v186.0] 已初始化 allPagesCardPositions[' + this.currentPage + ']');
        }

        // 保存所有左側卡片的位置
        let savedCardsCount = 0;
        this.leftCards.forEach(card => {
            const pairId = card.getData('pairId');
            const currentFrameIndex = card.getData('currentFrameIndex');
            const isMatched = card.getData('isMatched');

            console.log('🔥 [v186.0] 檢查卡片:', {
                pairId: pairId,
                currentFrameIndex: currentFrameIndex,
                isMatched: isMatched,
                shouldSave: currentFrameIndex !== undefined && currentFrameIndex !== null
            });

            // 只保存有 currentFrameIndex 的卡片（已拖動到空白框的卡片）
            if (currentFrameIndex !== undefined && currentFrameIndex !== null) {
                this.allPagesCardPositions[this.currentPage][pairId] = {
                    isMatched: isMatched,
                    currentFrameIndex: currentFrameIndex
                };
                savedCardsCount++;
                console.log('✅ [v185.0] 已保存卡片位置:', {
                    pairId: pairId,
                    currentFrameIndex: currentFrameIndex,
                    isMatched: isMatched
                });
            }
        });

        console.log('🔥 [v186.0] 調適訊息 - 保存完成:', {
            currentPage: this.currentPage,
            savedCardsCount: savedCardsCount,
            totalLeftCards: this.leftCards.length,
            allPagesCardPositions: this.allPagesCardPositions[this.currentPage]
        });
        console.log('🔥 [v185.0] ========== checkAllMatches 保存卡片位置結束 ==========');

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
        // 🔥 [v142.0] 修復：在混合佈局中使用 showCorrectAnswerOnCard 函數
        if (this.layout === 'mixed') {
            // 混合佈局：使用統一的 showCorrectAnswerOnCard 函數
            console.log('🔍 [v142.0] showCorrectAnswer 混合佈局 - 調用 showCorrectAnswerOnCard');
            this.showCorrectAnswerOnCard(rightCard);
        } else {
            // 分離模式：使用原有的邏輯
            const background = rightCard.getData('background');

            // 🔥 [v35.0] 修復：檢查是否為空白框（isEmptyBox）
            const isEmptyBox = rightCard.getData('isEmptyBox');

            // 🔥 [v174.0] 調試：記錄卡片類型
            console.log('🔥 [v174.0] showCorrectAnswer 分離模式:', {
                pairId: rightCard.getData('pairId'),
                isEmptyBox: isEmptyBox,
                hasBackground: !!background,
                cardType: rightCard.constructor.name
            });

            if (isEmptyBox) {
                // 空白框模式：直接在框上顯示勾勾
                console.log('🔍 [v35.0] showCorrectAnswer 空白框模式 - 顯示勾勾');
                this.showCorrectAnswerOnCard(rightCard);
                return;
            }

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
            // 🔥 [v177.0] 修復：清除舊的標記，然後添加新的標記
            if (rightCard.checkMark) {
                console.log('🔄 [v177.0] 清除舊的勾勾標記:', rightCard.getData('pairId'));
                rightCard.checkMark.destroy();
                rightCard.checkMark = null;
            }
            if (rightCard.xMark) {
                console.log('🔄 [v177.0] 清除舊的叉叉標記:', rightCard.getData('pairId'));
                rightCard.xMark.destroy();
                rightCard.xMark = null;
            }

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

            // 🔥 [v177.0] 新增：保存標記引用，以便後續清除
            rightCard.checkMark = checkMark;
            console.log('✅ [v177.0] 勾勾已添加到卡片（分離模式非空白框）:', {
                pairId: rightCard.getData('pairId'),
                markX: rightCard.x + background.width / 2 - 32,
                markY: rightCard.y - background.height / 2 + 32
            });
        }
    }

    // 🔥 顯示錯誤答案（灰色內框 + X）[v96.0]
    showIncorrectAnswer(rightCard, correctAnswer) {
        // 🔥 [v152.0] 修復：完全鏡像 showCorrectAnswer 的邏輯
        console.log('🔍 [v152.0] showIncorrectAnswer 開始:', {
            layout: this.layout,
            isEmptyBox: rightCard.getData('isEmptyBox'),
            pairId: rightCard.getData('pairId'),
            correctAnswer: correctAnswer
        });

        // 🔥 [v152.0] 統一邏輯：完全鏡像 showCorrectAnswer
        if (this.layout === 'mixed') {
            // 混合佈局：使用 showIncorrectAnswerOnCard 函數
            console.log('🔍 [v152.0] showIncorrectAnswer 混合佈局 - 調用 showIncorrectAnswerOnCard');
            this.showIncorrectAnswerOnCard(rightCard);
        } else {
            // 分離模式：使用與勾勾相同的邏輯
            const background = rightCard.getData('background');

            // 🔥 [v152.0] 檢查是否為空白框（isEmptyBox）
            const isEmptyBox = rightCard.getData('isEmptyBox');

            // 🔥 [v174.0] 調試：記錄卡片類型
            console.log('🔥 [v174.0] showIncorrectAnswer 分離模式:', {
                pairId: rightCard.getData('pairId'),
                isEmptyBox: isEmptyBox,
                hasBackground: !!background,
                cardType: rightCard.constructor.name
            });

            if (isEmptyBox) {
                // 空白框模式：直接在框上顯示叉叉（使用 showIncorrectAnswerOnCard）
                console.log('🔍 [v152.0] showIncorrectAnswer 空白框模式 - 調用 showIncorrectAnswerOnCard');
                this.showIncorrectAnswerOnCard(rightCard);
                return;
            }

            // 🔥 [v152.0] 檢查 background 是否存在
            if (!background) {
                console.warn('⚠️ [v152.0] showIncorrectAnswer: background 不存在，跳過視覺效果');
                return;
            }

            // 分離模式（非空白框）：在右卡片上顯示叉叉（使用與勾勾相同的邏輯）
            // 🔥 [v177.0] 修復：清除舊的標記，然後添加新的標記
            if (rightCard.checkMark) {
                console.log('🔄 [v177.0] 清除舊的勾勾標記:', rightCard.getData('pairId'));
                rightCard.checkMark.destroy();
                rightCard.checkMark = null;
            }
            if (rightCard.xMark) {
                console.log('🔄 [v177.0] 清除舊的叉叉標記:', rightCard.getData('pairId'));
                rightCard.xMark.destroy();
                rightCard.xMark = null;
            }

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

            // 🔥 [v177.0] 新增：保存標記引用，以便後續清除
            rightCard.xMark = xMark;
            console.log('✅ [v177.0] 叉叉已添加到卡片（分離模式非空白框）:', {
                pairId: rightCard.getData('pairId'),
                markX: rightCard.x + background.width / 2 - 32,
                markY: rightCard.y - background.height / 2 + 32,
                markDepth: 15
            });
        }

        console.log('🔍 [v152.0] showIncorrectAnswer 完成');
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

        // 🔥 [v125.0] 所有頁面都顯示分頁選擇器，讓用戶可以返回前面頁面查看答案
        // 這樣可以讓用戶看到勾勾和叉叉，並且可以返回前面的頁面
        console.log('🔥 [v125.0] ========== showMatchSummary 頁面轉換邏輯開始 ==========');
        console.log('🔥 [v125.0] 當前狀態:', {
            currentPage: this.currentPage,
            totalPages: this.totalPages,
            isLastPage: isLastPage,
            autoProceed: this.autoProceed,
            enablePagination: this.enablePagination
        });

        // 🔥 [v125.0] 無論是否為最後一頁，都顯示分頁選擇器
        console.log('🔥 [v125.0] ✅ 顯示分頁選擇器（所有頁面都顯示，讓用戶可以返回查看答案）');

        // 🔥 [v202.0] 清除舊的延遲調用（如果存在）
        if (this.summaryDelayedCall) {
            this.summaryDelayedCall.remove();
            this.summaryDelayedCall = null;
            console.log('🔥 [v202.0] 已清除舊的 summaryDelayedCall');
        }

        // 🔥 [v202.0] 創建新的延遲調用並保存引用
        this.summaryDelayedCall = this.time.delayedCall(2000, () => {
            console.log('🔥 [v125.0] ⏰ 2 秒延遲完成，準備顯示分頁選擇器');
            console.log('🔥 [v125.0] 調用 showPaginationButtons()，當前頁面: ' + (this.currentPage + 1) + '/' + this.totalPages);
            this.showPaginationButtons();
            this.summaryDelayedCall = null;  // 🔥 [v202.0] 清除引用

            // 如果不是最後一頁且 autoProceed=true，在顯示分頁選擇器後自動進入下一頁
            if (!isLastPage && this.autoProceed) {
                console.log('🔥 [v125.0] ✅ autoProceed=true 且不是最後一頁：將在 3 秒後自動進入下一頁');

                // 🔥 [v202.0] 清除舊的自動進入延遲調用（如果存在）
                if (this.autoProceedDelayedCall) {
                    this.autoProceedDelayedCall.remove();
                    this.autoProceedDelayedCall = null;
                }

                // 🔥 [v202.0] 創建新的延遲調用並保存引用
                this.autoProceedDelayedCall = this.time.delayedCall(3000, () => {
                    console.log('🔥 [v125.0] ⏰ 3 秒延遲完成，準備進入下一頁');
                    console.log('🔥 [v125.0] 調用 goToNextPage()，頁面轉換: ' + this.currentPage + ' → ' + (this.currentPage + 1));
                    this.goToNextPage();
                    this.autoProceedDelayedCall = null;  // 🔥 [v202.0] 清除引用
                });
            } else if (isLastPage) {
                console.log('🔥 [v125.0] ✅ 最後一頁：用戶可以返回前面頁面查看答案，或查看最終統計');
            } else {
                console.log('🔥 [v125.0] ✅ autoProceed=false：用戶可以手動控制分頁');
            }
        });
        console.log('🔥 [v125.0] ========== showMatchSummary 頁面轉換邏輯結束 ==========');

        // 🔥 [v125.0] 如果是最後一頁，顯示最終統計；否則直接返回
        if (!isLastPage) {
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
        this.rightEmptyBoxes = [];  // 🔥 [v35.0] 清空右側空白框
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
                // 顯示「上一頁」和「下一頁」按鈕
                console.log('📄 當前頁完成，顯示分頁導航按鈕');
                this.showPaginationButtons();
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
            ).setOrigin(0.5).setDepth(2001);

            showAnswersButton.setInteractive({ useHandCursor: true });

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
        ).setOrigin(0.5);

        closeButton.setInteractive({ useHandCursor: true });

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

    // 🔥 進入下一頁
    goToNextPage() {
        if (this.currentPage < this.totalPages - 1) {
            // 🔥 [v115.0] 詳細調適訊息：追蹤頁面轉換
            console.log('🔥 [v115.0] ========== 進入下一頁開始 ==========');
            console.log('🔥 [v115.0] 頁面轉換前:', {
                currentPage: this.currentPage,
                pageDisplayName: `第 ${this.currentPage + 1} 頁`,
                matchedPairsSize: this.matchedPairs.size,
                matchedPairsContent: Array.from(this.matchedPairs)
            });

            // 🔥 [v130.0] 在增加 currentPage 之前保存當前頁的配對結果和答案
            const previousPage = this.currentPage;
            console.log('🔥 [v130.0] 保存第 ' + (previousPage + 1) + ' 頁的配對結果和答案前:', {
                previousPage: previousPage,
                matchedPairsSize: this.matchedPairs.size,
                currentPageAnswersLength: this.currentPageAnswers.length
            });

            // 保存配對結果
            this.allPagesMatchedPairs[previousPage] = new Set(this.matchedPairs);

            // 🔥 [v130.0] 也保存當前頁的答案
            if (!this.allPagesAnswers) {
                this.allPagesAnswers = [];
            }
            // 保存當前頁的答案（用於返回時恢復）
            const pageAnswersKey = `page_${previousPage}_answers`;
            if (!this[pageAnswersKey]) {
                this[pageAnswersKey] = [...this.currentPageAnswers];
            }

            console.log('🔥 [v130.0] 已保存第 ' + (previousPage + 1) + ' 頁的配對結果和答案:', {
                pageIndex: previousPage,
                savedPairsSize: this.allPagesMatchedPairs[previousPage].size,
                savedAnswersLength: this.currentPageAnswers.length
            });

            // 🔥 [v183.0] 在進入下一頁前保存卡片位置（包括未拖動的卡片）
            console.log('🔥 [v183.0] ========== 進入下一頁前保存卡片位置開始 ==========');
            console.log('🔥 [v186.0] 調適訊息 - goToNextPage 保存前:', {
                previousPage: previousPage,
                currentPage: this.currentPage,
                leftCardsCount: this.leftCards.length,
                allPagesCardPositionsKeys: Object.keys(this.allPagesCardPositions)
            });

            if (!this.allPagesCardPositions[previousPage]) {
                this.allPagesCardPositions[previousPage] = {};
                console.log('🔥 [v186.0] 已初始化 allPagesCardPositions[' + previousPage + ']');
            }

            // 保存所有左側卡片的位置
            let savedCardsCount = 0;
            this.leftCards.forEach(card => {
                const pairId = card.getData('pairId');
                const currentFrameIndex = card.getData('currentFrameIndex');
                const isMatched = card.getData('isMatched');

                // 只保存有 currentFrameIndex 的卡片（已拖動到空白框的卡片）
                if (currentFrameIndex !== undefined && currentFrameIndex !== null) {
                    this.allPagesCardPositions[previousPage][pairId] = {
                        isMatched: isMatched,
                        currentFrameIndex: currentFrameIndex
                    };
                    savedCardsCount++;
                    console.log('✅ [v183.0] 已保存卡片位置:', {
                        pairId: pairId,
                        currentFrameIndex: currentFrameIndex,
                        isMatched: isMatched
                    });
                }
            });

            console.log('🔥 [v186.0] 調適訊息 - goToNextPage 保存完成:', {
                previousPage: previousPage,
                savedCardsCount: savedCardsCount,
                totalLeftCards: this.leftCards.length,
                allPagesCardPositions: this.allPagesCardPositions[previousPage]
            });
            console.log('🔥 [v183.0] ========== 進入下一頁前保存卡片位置結束 ==========');

            this.currentPage++;
            console.log('📄 進入下一頁:', this.currentPage + 1);

            // 🔥 [v115.0] 詳細調適訊息：頁面轉換後
            console.log('🔥 [v115.0] 頁面轉換後:', {
                currentPage: this.currentPage,
                pageDisplayName: `第 ${this.currentPage + 1} 頁`,
                totalPages: this.totalPages
            });

            // 🔥 [v169.0] 不清除洗牌順序緩存，而是保存每一頁的洗牌順序
            // 這樣返回上一頁時，空白框的順序會保持一致
            if (!this.allPagesShuffledCache) {
                this.allPagesShuffledCache = {};
            }
            this.allPagesShuffledCache[this.currentPage] = this.shuffledPairsCache;
            console.log('🔥 [v169.0] 已保存第 ' + (this.currentPage + 1) + ' 頁的洗牌順序到緩存');

            // 清空 matchedPairs（準備進入新頁面）
            this.matchedPairs.clear();
            console.log('🔥 [v130.0] 已清空 matchedPairs（準備進入新頁面）');

            // 重新佈局（會重新創建卡片）
            this.updateLayout();
        }
    }

    // 🔥 [v117.0] 進入上一頁
    goToPreviousPage() {
        if (this.currentPage > 0) {
            // 🔥 詳細調適訊息：追蹤頁面轉換
            console.log('🔥 [v117.0] ========== 進入上一頁開始 ==========');
            console.log('🔥 [v117.0] 頁面轉換前:', {
                currentPage: this.currentPage,
                pageDisplayName: `第 ${this.currentPage + 1} 頁`,
                matchedPairsSize: this.matchedPairs.size,
                matchedPairsContent: Array.from(this.matchedPairs)
            });

            // 🔥 [v130.0] 在減少 currentPage 之前保存當前頁的配對結果和答案
            const previousPage = this.currentPage;
            console.log('🔥 [v130.0] 保存第 ' + (previousPage + 1) + ' 頁的配對結果和答案前:', {
                previousPage: previousPage,
                matchedPairsSize: this.matchedPairs.size,
                currentPageAnswersLength: this.currentPageAnswers.length
            });

            // 保存配對結果
            this.allPagesMatchedPairs[previousPage] = new Set(this.matchedPairs);

            // 🔥 [v130.0] 也保存當前頁的答案
            if (!this.allPagesAnswers) {
                this.allPagesAnswers = [];
            }
            // 保存當前頁的答案（用於返回時恢復）
            const pageAnswersKey = `page_${previousPage}_answers`;
            if (!this[pageAnswersKey]) {
                this[pageAnswersKey] = [...this.currentPageAnswers];
            }

            console.log('🔥 [v130.0] 已保存第 ' + (previousPage + 1) + ' 頁的配對結果和答案:', {
                pageIndex: previousPage,
                savedPairsSize: this.allPagesMatchedPairs[previousPage].size,
                savedAnswersLength: this.currentPageAnswers.length
            });

            // 🔥 [v183.0] 在進入上一頁前保存卡片位置（包括未拖動的卡片）
            console.log('🔥 [v183.0] ========== 進入上一頁前保存卡片位置開始 ==========');
            console.log('🔥 [v186.0] 調適訊息 - goToPreviousPage 保存前:', {
                previousPage: previousPage,
                currentPage: this.currentPage,
                leftCardsCount: this.leftCards.length,
                allPagesCardPositionsKeys: Object.keys(this.allPagesCardPositions)
            });

            if (!this.allPagesCardPositions[previousPage]) {
                this.allPagesCardPositions[previousPage] = {};
                console.log('🔥 [v186.0] 已初始化 allPagesCardPositions[' + previousPage + ']');
            }

            // 保存所有左側卡片的位置
            let savedCardsCount = 0;
            this.leftCards.forEach(card => {
                const pairId = card.getData('pairId');
                const currentFrameIndex = card.getData('currentFrameIndex');
                const isMatched = card.getData('isMatched');

                // 只保存有 currentFrameIndex 的卡片（已拖動到空白框的卡片）
                if (currentFrameIndex !== undefined && currentFrameIndex !== null) {
                    this.allPagesCardPositions[previousPage][pairId] = {
                        isMatched: isMatched,
                        currentFrameIndex: currentFrameIndex
                    };
                    savedCardsCount++;
                    console.log('✅ [v183.0] 已保存卡片位置:', {
                        pairId: pairId,
                        currentFrameIndex: currentFrameIndex,
                        isMatched: isMatched
                    });
                }
            });

            console.log('🔥 [v186.0] 調適訊息 - goToPreviousPage 保存完成:', {
                previousPage: previousPage,
                savedCardsCount: savedCardsCount,
                totalLeftCards: this.leftCards.length,
                allPagesCardPositions: this.allPagesCardPositions[previousPage]
            });
            console.log('🔥 [v183.0] ========== 進入上一頁前保存卡片位置結束 ==========');

            this.currentPage--;
            console.log('📄 進入上一頁:', this.currentPage + 1);

            // 🔥 詳細調適訊息：頁面轉換後
            console.log('🔥 [v117.0] 頁面轉換後:', {
                currentPage: this.currentPage,
                pageDisplayName: `第 ${this.currentPage + 1} 頁`,
                totalPages: this.totalPages
            });

            // 🔥 [v169.0] 不清除洗牌順序緩存，而是保存每一頁的洗牌順序
            // 這樣返回上一頁時，空白框的順序會保持一致
            if (!this.allPagesShuffledCache) {
                this.allPagesShuffledCache = {};
            }
            this.allPagesShuffledCache[this.currentPage] = this.shuffledPairsCache;
            console.log('🔥 [v169.0] 已保存第 ' + (this.currentPage + 1) + ' 頁的洗牌順序到緩存');

            // 清空 matchedPairs（準備進入上一頁）
            this.matchedPairs.clear();
            console.log('🔥 [v130.0] 已清空 matchedPairs（準備進入上一頁）');

            // 重新佈局（會重新創建卡片）
            this.updateLayout();
        }
    }

    // 🔥 [v117.0] 顯示分頁導航按鈕（上一頁和下一頁）
    showPaginationButtons() {
        // 🔥 [v124.0] 簡化分頁設計 - 只保留分頁選擇器，移除左右按鈕
        console.log('🔥 [v124.0] ========== showPaginationButtons 開始 ==========');
        console.log('🔥 [v124.0] 當前頁面狀態:', {
            currentPage: this.currentPage,
            pageDisplayName: `第 ${this.currentPage + 1} 頁`,
            totalPages: this.totalPages,
            enablePagination: this.enablePagination
        });

        // 🔥 [v124.0] 如果只有 1 頁，完全隱藏分頁 UI
        if (this.totalPages <= 1) {
            console.log('🔥 [v124.0] ℹ️ 只有 1 頁，隱藏分頁 UI');
            return;
        }

        const width = this.scale.width;
        const height = this.scale.height;

        // 🔥 [v124.0] 分頁選擇器位置（頂部中央）
        const buttonY = 20;
        const selectorWidth = 80;
        const selectorHeight = 50;
        const selectorX = width / 2;

        console.log('🔥 [v124.0] 分頁選擇器位置:', {
            screenWidth: width,
            screenHeight: height,
            selectorX: selectorX,
            buttonY: buttonY,
            selectorWidth: selectorWidth,
            selectorHeight: selectorHeight
        });

        // 🔥 [v124.0] 只創建分頁選擇器，移除左右按鈕
        console.log('🔥 [v124.0] ✅ 創建分頁選擇器（簡化設計）');
        this.createPageSelector(selectorX, buttonY, selectorWidth, selectorHeight);

        console.log('📄 [v124.0] 分頁選擇器已顯示', {
            currentPage: this.currentPage + 1,
            totalPages: this.totalPages
        });
        console.log('🔥 [v124.0] ========== showPaginationButtons 結束 ==========');
    }

    // 🔥 [v117.0] 創建單個分頁按鈕
    createPaginationButton(x, y, width, height, text, callback, color) {
        // 🔥 [v119.0] 詳細的調適訊息 - 按鈕創建開始
        console.log('🔥 [v119.0] ========== createPaginationButton 開始 ==========');
        console.log('🔥 [v119.0] 按鈕參數:', {
            x: x,
            y: y,
            width: width,
            height: height,
            text: text,
            color: '0x' + color.toString(16).toUpperCase(),
            callbackName: callback.name || 'anonymous'
        });

        // 創建按鈕背景
        const buttonBg = this.add.rectangle(x, y, width, height, color);
        buttonBg.setStrokeStyle(2, 0x1976D2);
        buttonBg.setInteractive({ useHandCursor: true });
        buttonBg.setDepth(3000);
        buttonBg.setScrollFactor(0);
        console.log('🔥 [v119.0] ✅ 按鈕背景已創建');

        // 創建按鈕文字
        const buttonText = this.add.text(x, y, text, {
            fontSize: '16px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        buttonText.setOrigin(0.5);
        buttonText.setDepth(3001);
        buttonText.setScrollFactor(0);
        console.log('🔥 [v119.0] ✅ 按鈕文字已創建');

        // 點擊事件
        buttonBg.on('pointerdown', () => {
            console.log('🔥 [v119.0] 🖱️ 按鈕被點擊:', { text: text, currentPage: this.currentPage });
            // 移除按鈕
            buttonBg.destroy();
            buttonText.destroy();
            console.log('🔥 [v119.0] ✅ 按鈕已銷毀');

            // 執行回調
            console.log('🔥 [v119.0] 📞 執行回調函數:', callback.name || 'anonymous');
            callback();
        });

        // 懸停效果
        buttonBg.on('pointerover', () => {
            console.log('🔥 [v119.0] 🎯 滑鼠進入按鈕:', { text: text });
            buttonBg.setFillStyle(color);
            buttonBg.setAlpha(0.8);
            buttonText.setScale(1.1);
        });

        buttonBg.on('pointerout', () => {
            console.log('🔥 [v119.0] 🎯 滑鼠離開按鈕:', { text: text });
            buttonBg.setFillStyle(color);
            buttonBg.setAlpha(1);
            buttonText.setScale(1);
        });

        console.log('📄 [v117.0] 分頁按鈕已創建:', { x, y, text, color });
        console.log('🔥 [v119.0] ========== createPaginationButton 結束 ==========');
    }

    // 🔥 [v123.0] 創建分頁選擇器（頁碼選擇）- 優化視覺設計
    createPageSelector(x, y, width, height) {
        console.log('🔥 [v198.0] ========== createPageSelector 開始 ==========');

        // 🔥 [v198.0] 修復：先銷毀舊的分頁選擇器（如果存在）
        if (this.pageSelectorComponents) {
            console.log('🔥 [v198.0] 銷毀舊的分頁選擇器');
            const { bg, text, decreaseBtn, decreaseText, increaseBtn, increaseText } = this.pageSelectorComponents;
            if (bg) bg.destroy();
            if (text) text.destroy();
            if (decreaseBtn) decreaseBtn.destroy();
            if (decreaseText) decreaseText.destroy();
            if (increaseBtn) increaseBtn.destroy();
            if (increaseText) increaseText.destroy();
            this.pageSelectorComponents = null;
        }

        // 🔥 [v120.0] 使用響應式 UI 尺寸
        const uiSize = this.calculateResponsiveUISize();
        const selectorFontSize = uiSize.selectorFontSize;
        const selectorButtonSize = uiSize.selectorButtonSize;

        console.log('🔥 [v198.0] 分頁選擇器參數:', {
            x: x,
            y: y,
            width: width,
            height: height,
            currentPage: this.currentPage + 1,
            totalPages: this.totalPages,
            selectorFontSize: selectorFontSize.toFixed(1),
            selectorButtonSize: selectorButtonSize.toFixed(1)
        });

        // 🔥 [v123.0] 檢查按鈕是否可用
        const canGoPrevious = this.currentPage > 0;
        const canGoNext = this.currentPage < this.totalPages - 1;

        // 🔥 [v124.0] 提示用戶可以使用分頁選擇器查看前面的答案
        console.log('🔥 [v124.0] 💡 分頁選擇器提示:', {
            currentPage: this.currentPage + 1,
            totalPages: this.totalPages,
            canGoPrevious: canGoPrevious,
            canGoNext: canGoNext,
            message: canGoPrevious ? '✅ 可以點擊 [−] 返回前面的頁面查看答案' : '❌ 已在第一頁，無法返回'
        });

        // 🔥 [v123.0] 創建選擇器背景 - 使用漸變色
        const selectorBg = this.add.rectangle(x, y + height / 2, width, height, 0xffffff);
        selectorBg.setStrokeStyle(2, 0x2196F3);  // 藍色邊框
        selectorBg.setDepth(3000);
        selectorBg.setScrollFactor(0);
        console.log('🔥 [v123.0] ✅ 選擇器背景已創建');

        // 🔥 [v120.0] 創建選擇器文字（顯示當前頁碼）- 使用響應式字體大小
        const selectorText = this.add.text(x, y + height / 2, `${this.currentPage + 1}/${this.totalPages}`, {
            fontSize: `${selectorFontSize}px`,
            color: '#2196F3',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        selectorText.setOrigin(0.5);
        selectorText.setDepth(3001);
        selectorText.setScrollFactor(0);
        console.log('🔥 [v120.0] ✅ 選擇器文字已創建（響應式字體）');

        // 🔥 [v120.0] 創建左側減少按鈕 - 使用響應式尺寸
        const decreaseBtn = this.add.rectangle(x - width / 2 + selectorButtonSize / 2 + 5, y + height / 2, selectorButtonSize, selectorButtonSize,
            canGoPrevious ? 0x2196F3 : 0xcccccc);
        // 🔥 [v197.0] 修復：始終啟用按鈕，不調用 disableInteractive()
        decreaseBtn.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, selectorButtonSize, selectorButtonSize),
            Phaser.Geom.Rectangle.Contains,
            { useHandCursor: true }
        );
        decreaseBtn.setDepth(3000);
        decreaseBtn.setScrollFactor(0);
        console.log('🔥 [v120.0] ✅ 減少按鈕已創建（響應式尺寸）');

        const decreaseText = this.add.text(x - width / 2 + selectorButtonSize / 2 + 5, y + height / 2, '−', {
            fontSize: `${selectorFontSize * 0.8}px`,
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        decreaseText.setOrigin(0.5);
        decreaseText.setDepth(3001);
        decreaseText.setScrollFactor(0);

        // 🔥 [v120.0] 創建右側增加按鈕 - 使用響應式尺寸
        const increaseBtn = this.add.rectangle(x + width / 2 - selectorButtonSize / 2 - 5, y + height / 2, selectorButtonSize, selectorButtonSize,
            canGoNext ? 0x4caf50 : 0xcccccc);
        // 🔥 [v197.0] 修復：始終啟用按鈕，不調用 disableInteractive()
        increaseBtn.setInteractive(
            new Phaser.Geom.Rectangle(0, 0, selectorButtonSize, selectorButtonSize),
            Phaser.Geom.Rectangle.Contains,
            { useHandCursor: true }
        );
        increaseBtn.setDepth(3000);
        increaseBtn.setScrollFactor(0);
        console.log('🔥 [v120.0] ✅ 增加按鈕已創建（響應式尺寸）');

        const increaseText = this.add.text(x + width / 2 - selectorButtonSize / 2 - 5, y + height / 2, '+', {
            fontSize: `${selectorFontSize * 0.8}px`,
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        increaseText.setOrigin(0.5);
        increaseText.setDepth(3001);
        increaseText.setScrollFactor(0);

        // 🔥 [v199.0] 減少按鈕點擊事件 - 移除 updatePageSelectorText() 調用
        decreaseBtn.on('pointerdown', () => {
            console.log('🔥 [v199.0] 🖱️ 減少按鈕被點擊');
            // 🔥 [v196.0] 動態檢查當前頁面狀態，而不是使用閉包變數
            if (this.currentPage > 0) {
                // 添加按鈕按下動畫
                this.tweens.add({
                    targets: decreaseBtn,
                    scaleX: 0.9,
                    scaleY: 0.9,
                    duration: 100,
                    yoyo: true
                });

                this.goToPreviousPage();
                // 🔥 [v199.0] 移除 updatePageSelectorText() 調用
                // 因為 updateLayout() 已經重新創建了分頁選擇器，不需要再更新
            }
        });

        // 🔥 [v199.0] 增加按鈕點擊事件 - 移除 updatePageSelectorText() 調用
        increaseBtn.on('pointerdown', () => {
            console.log('🔥 [v199.0] 🖱️ 增加按鈕被點擊');
            // 🔥 [v196.0] 動態檢查當前頁面狀態，而不是使用閉包變數
            if (this.currentPage < this.totalPages - 1) {
                // 添加按鈕按下動畫
                this.tweens.add({
                    targets: increaseBtn,
                    scaleX: 0.9,
                    scaleY: 0.9,
                    duration: 100,
                    yoyo: true
                });

                this.goToNextPage();
                // 🔥 [v199.0] 移除 updatePageSelectorText() 調用
                // 因為 updateLayout() 已經重新創建了分頁選擇器，不需要再更新
            }
        });

        // 🔥 [v123.0] 減少按鈕懸停效果 - 改進
        decreaseBtn.on('pointerover', () => {
            if (canGoPrevious) {
                console.log('🔥 [v123.0] 🎯 滑鼠進入減少按鈕');
                this.tweens.add({
                    targets: decreaseBtn,
                    scaleX: 1.1,
                    scaleY: 1.1,
                    duration: 150
                });
                decreaseBtn.setFillStyle(0x1976D2);  // 更深的藍色
            }
        });

        decreaseBtn.on('pointerout', () => {
            if (canGoPrevious) {
                console.log('🔥 [v123.0] 🎯 滑鼠離開減少按鈕');
                this.tweens.add({
                    targets: decreaseBtn,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 150
                });
                decreaseBtn.setFillStyle(0x2196F3);  // 恢復原色
            }
        });

        // 🔥 [v123.0] 增加按鈕懸停效果 - 改進
        increaseBtn.on('pointerover', () => {
            if (canGoNext) {
                console.log('🔥 [v123.0] 🎯 滑鼠進入增加按鈕');
                this.tweens.add({
                    targets: increaseBtn,
                    scaleX: 1.1,
                    scaleY: 1.1,
                    duration: 150
                });
                increaseBtn.setFillStyle(0x388E3C);  // 更深的綠色
            }
        });

        increaseBtn.on('pointerout', () => {
            if (canGoNext) {
                console.log('🔥 [v123.0] 🎯 滑鼠離開增加按鈕');
                this.tweens.add({
                    targets: increaseBtn,
                    scaleX: 1,
                    scaleY: 1,
                    duration: 150
                });
                increaseBtn.setFillStyle(0x4caf50);  // 恢復原色
            }
        });

        // 🔥 [v126.0] 存儲分頁選擇器組件，以便後續更新
        this.pageSelectorComponents = {
            bg: selectorBg,
            text: selectorText,
            decreaseBtn: decreaseBtn,
            decreaseText: decreaseText,
            increaseBtn: increaseBtn,
            increaseText: increaseText
        };
        console.log('🔥 [v126.0] ✅ 分頁選擇器組件已存儲');

        // 🔥 [v123.0] 添加淡入動畫
        selectorBg.setAlpha(0);
        selectorText.setAlpha(0);
        decreaseBtn.setAlpha(0);
        decreaseText.setAlpha(0);
        increaseBtn.setAlpha(0);
        increaseText.setAlpha(0);

        this.tweens.add({
            targets: [selectorBg, selectorText, decreaseBtn, decreaseText, increaseBtn, increaseText],
            alpha: 1,
            duration: 300,
            ease: 'Quad.easeOut'
        });

        console.log('📄 [v126.0] 分頁選擇器已創建並保持在屏幕上:', {
            x, y,
            currentPage: this.currentPage + 1,
            totalPages: this.totalPages,
            canGoPrevious,
            canGoNext
        });
        console.log('🔥 [v126.0] ========== createPageSelector 結束 ==========');
    }

    // 🔥 [v123.0] 銷毀分頁選擇器的輔助方法
    destroyPageSelector(bg, text, decreaseBtn, decreaseText, increaseBtn, increaseText) {
        // 添加淡出動畫
        this.tweens.add({
            targets: [bg, text, decreaseBtn, decreaseText, increaseBtn, increaseText],
            alpha: 0,
            duration: 200,
            ease: 'Quad.easeIn',
            onComplete: () => {
                bg.destroy();
                text.destroy();
                decreaseBtn.destroy();
                decreaseText.destroy();
                increaseBtn.destroy();
                increaseText.destroy();
            }
        });
    }

    // 🔥 [v197.0] 更新分頁選擇器文字（保持選擇器在屏幕上）
    // 🔥 [v197.0] 修復：只更新顏色，不調用 disableInteractive() 或 setInteractive()
    updatePageSelectorText() {
        if (!this.pageSelectorComponents) {
            console.log('🔥 [v126.0] ⚠️ 分頁選擇器組件不存在，無法更新');
            return;
        }

        const { text, decreaseBtn, increaseBtn } = this.pageSelectorComponents;

        // 更新頁碼文字
        text.setText(`${this.currentPage + 1}/${this.totalPages}`);
        console.log('🔥 [v197.0] ✅ 分頁選擇器文字已更新:', {
            currentPage: this.currentPage + 1,
            totalPages: this.totalPages
        });

        // 更新按鈕的可用狀態
        const canGoPrevious = this.currentPage > 0;
        const canGoNext = this.currentPage < this.totalPages - 1;

        // 🔥 [v197.0] 修復：只更新顏色，不調用 disableInteractive()
        // 按鈕始終保持啟用，在事件監聽器中動態檢查是否可以導航
        decreaseBtn.setFillStyle(canGoPrevious ? 0x2196F3 : 0xcccccc);
        increaseBtn.setFillStyle(canGoNext ? 0x4caf50 : 0xcccccc);

        console.log('🔥 [v197.0] ✅ 分頁選擇器按鈕顏色已更新:', {
            canGoPrevious,
            canGoNext
        });
    }

    // 🔥 顯示「下一頁」按鈕（保留以向後兼容）
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
        // 🔥 [v65.0] 防止重複調用
        if (this.gameCompleteModalShown) {
            console.log('⚠️ [v65.0] 模態框已經顯示，跳過重複調用');
            return;
        }
        this.gameCompleteModalShown = true;
        console.log('🎮 [v65.0] 首次顯示遊戲結束模態框');

        // 🔥 [v65.0] 停止計時器（額外保護）
        if (this.timerEvent) {
            this.timerEvent.remove();
            this.timerEvent = null;
            console.log('⏱️ [v65.0] 計時器已停止');
        }

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
            // 🔥 [v1.2] 先銷毀模態框，再重新開始遊戲
            overlay.destroy();
            modal.destroy();
            this.gameCompleteModal = null;
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
        console.log('🔥 [v230.6] restartGame 被調用了');

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

        // 🔥 [v1.1] 清理所有延遲調用
        if (this.summaryDelayedCall) {
            this.summaryDelayedCall.remove();
            this.summaryDelayedCall = null;
            console.log('🔥 [v1.1] 已移除 summaryDelayedCall');
        }
        if (this.autoProceedDelayedCall) {
            this.autoProceedDelayedCall.remove();
            this.autoProceedDelayedCall = null;
            console.log('🔥 [v1.1] 已移除 autoProceedDelayedCall');
        }

        // 🔥 [v1.1] 停止計時器
        if (this.timerEvent) {
            this.timerEvent.remove();
            this.timerEvent = null;
            console.log('🔥 [v1.1] 已停止計時器');
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

        // 🔥 [v129.0] 清空所有頁面的配對結果
        this.allPagesMatchedPairs = {};
        console.log('🔥 [v129.0] 已清空所有頁面的配對結果');

        // 🔥 v54.0: 清除洗牌順序緩存（遊戲重新開始）
        this.shuffledPairsCache = null;
        console.log('🔥 [v54.0] 已清除洗牌順序緩存（遊戲重新開始）');

        // 🔥 [v1.3] 重置 "Show all answers" 狀態
        this.isShowingAllAnswers = false;
        this.allPagesShowAllAnswersState = {};
        console.log('🔥 [v1.3] 已重置 Show all answers 狀態');

        // 🔥 [v230.2] 改變策略：只重置遊戲狀態，讓 updateLayout() 自己清除卡片
        // 原因：updateLayout() 中的清除邏輯依賴於 this.leftCards 等數組
        console.log('🔥 [v230.2] ========== 開始重新初始化遊戲 ==========');

        // 調適訊息：記錄重新開始前的狀態
        const beforeState = {
            leftCardsCount: this.leftCards ? this.leftCards.length : 0,
            rightCardsCount: this.rightCards ? this.rightCards.length : 0,
            rightEmptyBoxesCount: this.rightEmptyBoxes ? this.rightEmptyBoxes.length : 0,
            matchedPairsSize: this.matchedPairs ? this.matchedPairs.size : 0,
            childrenCount: this.children.list.length
        };
        console.log('🔥 [v230.2] 重新開始前的狀態 - 左卡片:', beforeState.leftCardsCount, '右卡片:', beforeState.rightCardsCount, '空白框:', beforeState.rightEmptyBoxesCount, '配對:', beforeState.matchedPairsSize, '子元素:', beforeState.childrenCount);

        // 重新初始化遊戲狀態（不清除卡片數組，讓 updateLayout 自己清除）
        console.log('🔥 [v230.2] 重新初始化遊戲狀態');
        this.gameState = 'playing';
        this.gameStartTime = null;
        this.gameEndTime = null;
        this.totalGameTime = 0;
        this.allPagesAnswers = [];
        this.currentPageAnswers = [];
        this.currentPage = 0;
        this.matchedPairs.clear();
        this.allPagesMatchedPairs = {};
        this.shuffledPairsCache = null;
        this.isShowingAllAnswers = false;
        this.allPagesShowAllAnswersState = {};
        this.isDragging = false;
        this.dragStartCard = null;
        this.submitButton = null;
        this.gameCompleteModal = null;
        this.pageCompleteModal = null;

        // 🔥 [v230.14] 關鍵修復：清除所有頁面的答案緩存
        // 這樣 updateLayout() 就不會恢復舊的 X 標記
        for (let i = 0; i < this.totalPages; i++) {
            const pageAnswersKey = `page_${i}_answers`;
            this[pageAnswersKey] = [];
        }
        console.log('🔥 [v230.14] 已清除所有頁面的答案緩存');

        // 🔥 [v230.15] 關鍵修復：清除所有頁面的卡片位置緩存
        // 這樣 restoreCardPositions() 就不會恢復卡片位置並重新填充 matchedPairs
        this.allPagesCardPositions = {};
        console.log('🔥 [v230.15] 已清除所有頁面的卡片位置緩存');

        console.log('🔥 [v230.2] 已重新初始化遊戲狀態');

        // 🔥 [v230.13] 最終解決方案：不依賴卡片數組，直接清除所有標記
        // 原因：showAnswersOnCards() 後，卡片可能已經被 updateLayout() 清除
        console.log('🔥 [v230.13] 開始清除所有標記（最終解決方案）');

        // 策略：直接調用 updateLayout() 來清除所有元素並重新創建
        // updateLayout() 會清除所有卡片、標記和其他元素
        // 這樣可以確保所有殘留的 X 標記都被清除
        console.log('🔥 [v230.13] 不需要手動清除標記，updateLayout() 會清除所有元素');

        // 🔥 [v230.5] 在調用 updateLayout 之前檢查卡片數組
        console.log('🔥 [v230.5] 調用 updateLayout 前的卡片數組狀態 - 左:', this.leftCards.length, '右:', this.rightCards.length, '空白框:', this.rightEmptyBoxes.length);

        // 重新調用 updateLayout 來清除舊卡片並創建新卡片
        console.log('🔥 [v230.2] 調用 updateLayout 清除舊卡片並創建新卡片');
        this.updateLayout();

        // 調適訊息：updateLayout 完成後的狀態
        const finalState = {
            leftCardsCount: this.leftCards ? this.leftCards.length : 0,
            rightCardsCount: this.rightCards ? this.rightCards.length : 0,
            rightEmptyBoxesCount: this.rightEmptyBoxes ? this.rightEmptyBoxes.length : 0,
            matchedPairsSize: this.matchedPairs ? this.matchedPairs.size : 0,
            childrenCount: this.children.list.length
        };
        console.log('🔥 [v230.2] updateLayout 完成後的狀態 - 左卡片:', finalState.leftCardsCount, '右卡片:', finalState.rightCardsCount, '空白框:', finalState.rightEmptyBoxesCount, '配對:', finalState.matchedPairsSize, '子元素:', finalState.childrenCount);

        console.log('🔥 [v230.2] ========== 重新初始化遊戲完成 ==========');
    }

    // 🔥 顯示 My Answers 頁面
    // 🔥 v88.0: 顯示所有卡片上的勾勾和叉叉，以及正確的配對物件
    showAnswersOnCards() {
        console.log('🎮 [v88.0] 顯示所有卡片上的勾勾和叉叉，以及正確的配對物件');

        // 🔥 [v202.0] 移除特定的延遲調用，而不是所有事件
        if (this.summaryDelayedCall) {
            this.summaryDelayedCall.remove();
            this.summaryDelayedCall = null;
            console.log('🔥 [v202.0] 已移除 summaryDelayedCall');
        }
        if (this.autoProceedDelayedCall) {
            this.autoProceedDelayedCall.remove();
            this.autoProceedDelayedCall = null;
            console.log('🔥 [v202.0] 已移除 autoProceedDelayedCall');
        }

        // 遍歷所有答案，在對應的卡片上顯示勾勾或叉叉，以及正確的配對物件
        if (this.allPagesAnswers && this.allPagesAnswers.length > 0) {
            this.allPagesAnswers.forEach((answer) => {
                // 根據 leftPairId 找到對應的左卡片（英文卡片）
                // 🔥 [v141.0] 修復：使用 getData('pairId') 而不是 card.pairId
                const leftCard = this.leftCards.find(card => card.getData('pairId') === answer.leftPairId);

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
    // 🔥 [v137.0] 改進：添加狀態標誌，在每一頁都能保存正確移動的卡片
    showAllCorrectAnswers() {
        console.log('🎮 [v137.0] 顯示所有卡片的正確名稱 - 英文卡片移動到匹配的中文位置');

        // 🔥 [v203.1] 調適訊息：記錄初始狀態
        console.log('🔥 [v203.1] ========== showAllCorrectAnswers 開始 ==========');
        console.log('🔥 [v203.1] 初始狀態:', {
            layout: this.layout,
            leftCardsCount: this.leftCards ? this.leftCards.length : 0,
            rightCardsCount: this.rightCards ? this.rightCards.length : 0,
            rightEmptyBoxesCount: this.rightEmptyBoxes ? this.rightEmptyBoxes.length : 0,
            currentPage: this.currentPage,
            totalPages: this.totalPages
        });

        // 🔥 [v202.0] 移除特定的延遲調用，而不是所有事件
        if (this.summaryDelayedCall) {
            this.summaryDelayedCall.remove();
            this.summaryDelayedCall = null;
            console.log('🔥 [v202.0] 已移除 summaryDelayedCall');
        }
        if (this.autoProceedDelayedCall) {
            this.autoProceedDelayedCall.remove();
            this.autoProceedDelayedCall = null;
            console.log('🔥 [v202.0] 已移除 autoProceedDelayedCall');
        }

        // 🔥 [v214.1] 設置標誌，表示正在顯示所有答案
        this.isShowingAllAnswers = true;

        // 🔥 [v217.0] 保存當前頁的 "Show all answers" 狀態
        // 🔥 [v221.0] 改進：為所有頁面設置 Show All Answers 狀態，而不是只設置當前頁面
        if (!this.allPagesShowAllAnswersState) {
            this.allPagesShowAllAnswersState = {};
        }

        // 為所有頁面設置 Show All Answers 狀態
        for (let i = 0; i < this.totalPages; i++) {
            this.allPagesShowAllAnswersState[i] = true;
        }

        console.log('🔥 [v221.0] 已為所有 ' + this.totalPages + ' 頁設置 showAllAnswers 狀態:', this.allPagesShowAllAnswersState);

        console.log('🔥 [v214.1] ========== showAllCorrectAnswers 開始 ==========');
        console.log('🔥 [v214.1] 已設置 isShowingAllAnswers = true', {
            layout: this.layout,
            currentPage: this.currentPage,
            totalPages: this.totalPages
        });

        // 🔥 [v219.0] 確保所有卡片都可見
        console.log('🔥 [v219.0] 確保所有卡片可見 - 開始');

        // 確保左卡片可見
        if (this.leftCards && this.leftCards.length > 0) {
            this.leftCards.forEach(card => {
                card.setVisible(true);
                card.setAlpha(1);
            });
            console.log('🔥 [v219.0] 已確保所有左卡片可見:', {
                leftCardsCount: this.leftCards.length
            });
        }

        // 確保右側空白框可見
        if (this.rightEmptyBoxes && this.rightEmptyBoxes.length > 0) {
            this.rightEmptyBoxes.forEach(box => {
                box.setVisible(true);
                box.setAlpha(1);
            });
            console.log('🔥 [v219.0] 已確保所有空白框可見:', {
                rightEmptyBoxesCount: this.rightEmptyBoxes.length
            });
        }

        // 確保框外答案卡片可見
        if (this.rightCards && this.rightCards.length > 0) {
            this.rightCards.forEach(card => {
                card.setVisible(true);
                card.setAlpha(1);
            });
            console.log('🔥 [v219.0] 已確保所有框外答案卡片可見:', {
                rightCardsCount: this.rightCards.length
            });
        }

        console.log('🔥 [v219.0] 確保所有卡片可見 - 完成');

        // 遍歷所有左卡片（英文卡片），將其移動到對應的中文位置
        if (this.leftCards && this.leftCards.length > 0) {
            console.log('🔥 [v214.1] 開始遍歷左卡片:', {
                leftCardsCount: this.leftCards.length,
                layout: this.layout,
                rightEmptyBoxesCount: this.rightEmptyBoxes ? this.rightEmptyBoxes.length : 0,
                rightCardsCount: this.rightCards ? this.rightCards.length : 0
            });

            let movedCount = 0;
            let notFoundCount = 0;

            this.leftCards.forEach((card, cardIndex) => {
                // 根據 pairId 找到對應的配對
                const pairId = card.getData('pairId');
                const cardText = card.getData('text') || 'unknown';

                // 🔥 [v215.0] 獲取卡片的世界坐標和容器信息
                const cardWorldX = card.getWorldTransformMatrix().tx;
                const cardWorldY = card.getWorldTransformMatrix().ty;
                const cardParentContainer = card.parentContainer;
                const cardDepth = card.depth;

                console.log(`🔥 [v214.1] 處理卡片 ${cardIndex + 1}/${this.leftCards.length}:`, {
                    pairId: pairId,
                    text: cardText,
                    currentX: card.x,
                    currentY: card.y,
                    worldX: cardWorldX,
                    worldY: cardWorldY,
                    hasParentContainer: !!cardParentContainer,
                    parentContainerType: cardParentContainer ? cardParentContainer.constructor.name : 'none',
                    depth: cardDepth,
                    cardExists: !!card,
                    cardHasData: !!card.getData
                });

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
                        movedCount++;
                        console.log('🎮 [v137.0] 移動卡片:', { pairId, fromX: card.x, toX: rightCard.x });
                    }
                } else {
                    // 🔥 [v214.1] 分離佈局：採用混合模式的方法 - 只移動位置，不涉及容器操作
                    console.log(`🔍 [v214.1] 分離模式 - 搜尋空白框:`, {
                        pairId: pairId,
                        rightEmptyBoxesExists: !!this.rightEmptyBoxes,
                        rightEmptyBoxesLength: this.rightEmptyBoxes ? this.rightEmptyBoxes.length : 0
                    });

                    const emptyBox = this.rightEmptyBoxes ? this.rightEmptyBoxes.find(box => {
                        const boxPairId = box.getData('pairId');
                        console.log(`  └─ 檢查空白框: boxPairId=${boxPairId}, targetPairId=${pairId}, match=${boxPairId === pairId}`);
                        return boxPairId === pairId;
                    }) : null;

                    if (emptyBox) {
                        // 🔥 [v215.0] 獲取空白框的詳細信息
                        const emptyBoxWorldX = emptyBox.getWorldTransformMatrix().tx;
                        const emptyBoxWorldY = emptyBox.getWorldTransformMatrix().ty;
                        const emptyBoxParentContainer = emptyBox.parentContainer;
                        const emptyBoxDepth = emptyBox.depth;

                        console.log('✅ [v214.1] 找到空白框:', {
                            pairId: pairId,
                            emptyBoxX: emptyBox.x,
                            emptyBoxY: emptyBox.y,
                            emptyBoxWorldX: emptyBoxWorldX,
                            emptyBoxWorldY: emptyBoxWorldY,
                            cardCurrentX: card.x,
                            cardCurrentY: card.y,
                            cardWorldX: cardWorldX,
                            cardWorldY: cardWorldY,
                            emptyBoxHasParentContainer: !!emptyBoxParentContainer,
                            emptyBoxParentContainerType: emptyBoxParentContainer ? emptyBoxParentContainer.constructor.name : 'none',
                            emptyBoxDepth: emptyBoxDepth,
                            cardDepth: cardDepth,
                            emptyBoxExists: !!emptyBox,
                            emptyBoxHasPosition: emptyBox.x !== undefined && emptyBox.y !== undefined
                        });

                        // 🔥 [v222.0] 修復：將卡片添加到空白框容器中，而不是只移動位置
                        // 這樣可以確保座標系統一致
                        console.log('🎮 [v222.0] 準備將卡片添加到空白框容器:', {
                            pairId: pairId,
                            cardHasParentContainer: !!card.parentContainer,
                            cardParentContainerType: card.parentContainer ? card.parentContainer.constructor.name : 'none',
                            emptyBoxHasParentContainer: !!emptyBox.parentContainer
                        });

                        // 🔥 [v219.0] 確保卡片可見
                        card.setVisible(true);
                        card.setAlpha(1);
                        console.log('🔥 [v219.0] 確保卡片可見:', {
                            pairId: pairId,
                            visible: card.visible,
                            alpha: card.alpha
                        });

                        // 🔥 [v222.0] 如果卡片已經有父容器，先移除
                        if (card.parentContainer) {
                            console.log('🔥 [v222.0] 卡片已有父容器，準備移除:', {
                                pairId: pairId,
                                parentContainerType: card.parentContainer.constructor.name
                            });
                            card.parentContainer.remove(card);
                        }

                        // 🔥 [v222.0] 計算卡片相對於空白框的座標
                        const cardRelativeX = card.x - emptyBox.x;
                        const cardRelativeY = card.y - emptyBox.y;

                        // 🔥 [v222.0] 將卡片添加到空白框容器中
                        emptyBox.add(card);

                        // 🔥 [v222.0] 設置卡片的本地座標為 (0, 0)，使其顯示在容器中心
                        card.setPosition(0, 0);

                        console.log('🔥 [v222.0] 卡片已添加到空白框容器:', {
                            pairId: pairId,
                            cardLocalX: card.x,
                            cardLocalY: card.y,
                            cardWorldX: card.getWorldTransformMatrix().tx,
                            cardWorldY: card.getWorldTransformMatrix().ty,
                            emptyBoxWorldX: emptyBoxWorldX,
                            emptyBoxWorldY: emptyBoxWorldY,
                            relativeX: cardRelativeX,
                            relativeY: cardRelativeY
                        });

                        movedCount++;
                        console.log('🎮 [v222.0] 卡片已成功添加到空白框容器:', {
                            pairId,
                            fromX: cardWorldX,
                            toX: emptyBoxWorldX,
                            cardNowInContainer: !!card.parentContainer
                        });
                    } else {
                        notFoundCount++;
                        console.error('❌ [v214.1] 未找到對應的空白框:', {
                            pairId,
                            cardText,
                            rightEmptyBoxesExists: !!this.rightEmptyBoxes,
                            rightEmptyBoxesCount: this.rightEmptyBoxes ? this.rightEmptyBoxes.length : 0,
                            allEmptyBoxPairIds: this.rightEmptyBoxes ? this.rightEmptyBoxes.map(box => box.getData('pairId')) : []
                        });
                    }
                }
            });

            console.log('✅ [v214.1] 卡片移動完成:', {
                totalCards: this.leftCards.length,
                movedCount: movedCount,
                notFoundCount: notFoundCount,
                successRate: `${((movedCount / this.leftCards.length) * 100).toFixed(2)}%`
            });
        } else {
            console.warn('⚠️ [v214.1] 沒有左卡片或左卡片數組為空:', {
                leftCards: this.leftCards,
                leftCardsLength: this.leftCards ? this.leftCards.length : 0
            });
        }

        console.log('🔥 [v214.1] ========== showAllCorrectAnswers 結束 ==========');
    }





    // 🔥 v88.0: 在卡片上顯示勾勾
    showCorrectAnswerOnCard(card) {
        console.log('🔍 [v153.0] showCorrectAnswerOnCard 開始:', {
            pairId: card.getData('pairId'),
            isEmptyBox: card.getData('isEmptyBox'),
            hasBackground: !!card.getData('background'),
            cardX: card.x,
            cardY: card.y,
            cardType: card.constructor.name,
            cardParent: card.parentContainer ? card.parentContainer.constructor.name : 'none'
        });

        // 🔥 [v139.0] 改進：使用 getData 獲取背景，而非 list[0]
        const background = card.getData('background');
        console.log('🔍 [v153.0] 背景檢查:', {
            background: !!background,
            backgroundWidth: background ? background.width : 'N/A',
            backgroundHeight: background ? background.height : 'N/A',
            backgroundDepth: background ? background.depth : 'N/A'
        });

        // 🔥 [v177.0] 修復：清除舊的標記（包括勾勾和叉叉）
        if (card.checkMark) {
            console.log('🔄 [v177.0] 移除舊的勾勾標記');
            card.checkMark.destroy();
            card.checkMark = null;
        }
        if (card.xMark) {
            console.log('🔄 [v177.0] 移除舊的叉叉標記');
            card.xMark.destroy();
            card.xMark = null;
        }

        // 創建勾勾標記
        const checkMark = this.add.text(0, 0, '✓', {
            fontSize: '80px',
            color: '#4caf50',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        checkMark.setOrigin(0.5);
        checkMark.setDepth(2000);  // 🔥 [v154.0] 提升深度到 2000，確保勾勾顯示在最上方

        // 🔥 [v179.0] 修復：計算正確的世界座標（考慮卡片是否在容器中）
        if (background) {
            // 🔥 [v179.0] 改進：使用 getWorldTransformMatrix 獲取世界座標
            // 這樣即使卡片在容器中，也能正確計算世界座標
            const worldTransform = card.getWorldTransformMatrix();
            const worldX = worldTransform.tx + background.width / 2 - 32;
            const worldY = worldTransform.ty - background.height / 2 + 32;
            checkMark.setPosition(worldX, worldY);

            console.log('✅ [v179.0] 勾勾已添加到場景（使用世界座標）:', {
                pairId: card.getData('pairId'),
                worldX: worldX.toFixed(0),
                worldY: worldY.toFixed(0),
                markDepth: checkMark.depth,
                cardLocalPos: { x: card.x, y: card.y },
                cardWorldPos: { x: worldTransform.tx.toFixed(0), y: worldTransform.ty.toFixed(0) },
                backgroundSize: { width: background.width, height: background.height },
                isInContainer: !!card.parentContainer
            });
        } else {
            // 🔥 [v179.0] 後備邏輯：背景不存在時，使用世界座標
            const worldTransform = card.getWorldTransformMatrix();
            console.warn('⚠️ [v179.0] 背景不存在，使用世界座標顯示勾勾');
            checkMark.setPosition(worldTransform.tx, worldTransform.ty);

            console.log('✅ [v179.0] 勾勾已添加到場景（使用世界座標）:', {
                pairId: card.getData('pairId'),
                worldX: worldTransform.tx.toFixed(0),
                worldY: worldTransform.ty.toFixed(0),
                markDepth: checkMark.depth,
                isInContainer: !!card.parentContainer
            });
        }

        // 🔥 [v155.0] 改進：直接添加到場景中，而不是容器中
        // 這樣勾勾就不會受到容器座標系統的影響
        // 🔥 [v174.0] 修復：確保勾勾被添加到場景中
        this.add.existing(checkMark);  // 添加到場景中
        card.checkMark = checkMark;
    }

    // 🔥 v88.0: 在卡片上顯示叉叉
    showIncorrectAnswerOnCard(card) {
        console.log('🔍 [v153.0] showIncorrectAnswerOnCard 開始:', {
            pairId: card.getData('pairId'),
            isEmptyBox: card.getData('isEmptyBox'),
            hasBackground: !!card.getData('background'),
            cardX: card.x,
            cardY: card.y,
            cardType: card.constructor.name,
            cardParent: card.parentContainer ? card.parentContainer.constructor.name : 'none'
        });

        // 🔥 [v139.0] 改進：使用 getData 獲取背景，而非 list[0]
        const background = card.getData('background');
        console.log('🔍 [v153.0] 背景檢查:', {
            background: !!background,
            backgroundWidth: background ? background.width : 'N/A',
            backgroundHeight: background ? background.height : 'N/A',
            backgroundDepth: background ? background.depth : 'N/A'
        });

        // 🔥 [v177.0] 修復：清除舊的標記（包括勾勾和叉叉）
        if (card.checkMark) {
            console.log('🔄 [v177.0] 移除舊的勾勾標記');
            card.checkMark.destroy();
            card.checkMark = null;
        }
        if (card.xMark) {
            console.log('🔄 [v177.0] 移除舊的叉叉標記');
            card.xMark.destroy();
            card.xMark = null;
        }

        // 創建叉叉標記
        const xMark = this.add.text(0, 0, '✗', {
            fontSize: '80px',
            color: '#f44336',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        xMark.setOrigin(0.5);
        xMark.setDepth(2000);  // 🔥 [v154.0] 提升深度到 2000，確保叉叉顯示在最上方

        // 🔥 [v179.0] 修復：計算正確的世界座標（考慮卡片是否在容器中）
        if (background) {
            // 🔥 [v179.0] 改進：使用 getWorldTransformMatrix 獲取世界座標
            // 這樣即使卡片在容器中，也能正確計算世界座標
            const worldTransform = card.getWorldTransformMatrix();
            const worldX = worldTransform.tx + background.width / 2 - 32;
            const worldY = worldTransform.ty - background.height / 2 + 32;
            xMark.setPosition(worldX, worldY);

            console.log('✅ [v179.0] 叉叉已添加到場景（使用世界座標）:', {
                pairId: card.getData('pairId'),
                worldX: worldX.toFixed(0),
                worldY: worldY.toFixed(0),
                markDepth: xMark.depth,
                cardLocalPos: { x: card.x, y: card.y },
                cardWorldPos: { x: worldTransform.tx.toFixed(0), y: worldTransform.ty.toFixed(0) },
                backgroundSize: { width: background.width, height: background.height },
                isInContainer: !!card.parentContainer
            });
        } else {
            // 🔥 [v179.0] 後備邏輯：背景不存在時，使用世界座標
            const worldTransform = card.getWorldTransformMatrix();
            console.warn('⚠️ [v179.0] 背景不存在，使用世界座標顯示叉叉');
            xMark.setPosition(worldTransform.tx, worldTransform.ty);

            console.log('✅ [v179.0] 叉叉已添加到場景（使用世界座標）:', {
                pairId: card.getData('pairId'),
                worldX: worldTransform.tx.toFixed(0),
                worldY: worldTransform.ty.toFixed(0),
                markDepth: xMark.depth,
                isInContainer: !!card.parentContainer
            });
        }

        // 🔥 [v155.0] 改進：直接添加到場景中，而不是容器中
        // 這樣叉叉就不會受到容器座標系統的影響
        // 🔥 [v174.0] 修復：確保叉叉被添加到場景中
        this.add.existing(xMark);  // 添加到場景中
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

        // 🔥 [v139.0] 改進：使用 getData 獲取背景，而非 list[0]
        const background = card.getData('background');
        if (background) {
            // 相對於卡片容器的位置
            const textX = 0;
            const textY = background.height / 2 + 30;
            pairingText.setPosition(textX, textY);
            // 🔥 [v139.0] 改進：將文字添加到卡片容器中
            card.add(pairingText);
        }

        card.correctPairingText = pairingText;
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

    // 🔥 [v33.0] 創建右側空白框（用於拖放）
    createEmptyRightBox(x, y, width, height, pairId) {
        const container = this.add.container(x, y);
        container.setDepth(5);
        container.setData('pairId', pairId);
        container.setData('isEmptyBox', true);

        // 🔥 [v35.0] 移除藍色背景，只保留邊框，這樣勾勾和叉叉才能顯示
        // 創建空白框背景（透明，只有邊框）
        const background = this.add.rectangle(0, 0, width, height, 0x000000, 0);
        background.setStrokeStyle(3, 0x4d94ff);
        background.setDepth(1);

        container.add([background]);

        // 🔥 [v35.0] 存儲 background 數據，以便提交答案時使用
        container.setData('background', background);

        console.log('✅ [v33.0] 空白框已創建:', {
            pairId,
            x: x.toFixed(0),
            y: y.toFixed(0),
            width: width.toFixed(0),
            height: height.toFixed(0),
            hasBackground: !!background,
            backgroundTransparent: true
        });

        return container;
    }

    // 🔥 [v65.0] 創建框外答案卡片（支持水平和垂直排列）
    // layoutType: 'horizontal' (批數3-5) 或 'vertical' (批數7, 21+)
    createOutsideAnswerCard(boxX, boxY, boxWidth, boxHeight, text, pairId, imageUrl, layoutType = 'vertical') {
        // 🔥 [v65.0] 根據布局類型選擇排列方式
        if (layoutType === 'horizontal') {
            return this.createHorizontalAnswerCard(boxX, boxY, boxWidth, boxHeight, text, pairId, imageUrl);
        } else {
            return this.createVerticalAnswerCard(boxX, boxY, boxWidth, boxHeight, text, pairId, imageUrl);
        }
    }

    // 🔥 [v65.0] 創建水平排列的答案卡片（圖片在左，文字在右）- 用於批數 3-5
    // 🔥 [v66.0] 優化文字大小和位置
    createHorizontalAnswerCard(boxX, boxY, boxWidth, boxHeight, text, pairId, imageUrl) {
        // 🔥 [v65.0] 計算框外卡片的位置（在框的右側）
        const boxRightEdge = boxX + boxWidth / 2;  // 框的右邊界
        const horizontalPadding = 8;  // 框與卡片之間的水平間距

        // 圖片大小：卡片高度的 60%
        const imageSize = boxHeight * 0.6;
        const imagePadding = horizontalPadding;  // 圖片與框的間距

        // 圖片位置：框右邊界 + 間距（圖片中心）
        const imageX = boxRightEdge + imagePadding + imageSize / 2;
        const imageY = boxY;  // 垂直居中於框

        // 文字寬度：卡片寬度的 50%
        const textWidth = boxWidth * 0.5;
        const textPadding = 4;  // 文字與圖片的間距

        // 文字位置：圖片右側 + 間距
        const textX = imageX + imageSize / 2 + textPadding;
        const textY = boxY;  // 垂直居中於框

        // 🔥 [v65.0] 創建容器（位置在圖片中心）
        // 🔥 [v67.0] 降低深度到 2，確保不會蓋住左側卡片（深度 5）
        const container = this.add.container(imageX, imageY);
        container.setDepth(2);  // 🔥 [v67.0] 從 4 改為 2，在左側卡片下方
        container.setData('pairId', pairId);
        container.setData('isAnswerCard', true);

        // 🔥 [v65.0] 加載並顯示圖片（相對於容器，位置為 0,0）
        if (imageUrl && imageUrl.trim() !== '') {
            this.loadAndDisplayImage(container, imageUrl, 0, 0, imageSize, `answer-${pairId}`).catch(error => {
                console.error('❌ 答案圖片載入失敗:', error);
            });
        }

        // 🔥 [v66.0] 創建文字（水平排列，在圖片右側）- 增大文字大小
        if (text && text.trim() !== '' && text.trim() !== '<br>') {
            // 🔥 [v66.0] 文字大小從 boxHeight * 0.3 改為 boxHeight * 0.5（更大的文字）
            const fontSize = Math.max(16, Math.min(28, boxHeight * 0.5));
            // 🔥 [v122.0] 調整 wordWrap 寬度，確保中文文字完全適應框的寬度（從 textWidth 改為 textWidth * 0.9）
            const textObj = this.add.text(textX, textY, text, {
                font: `bold ${fontSize}px Arial`,
                fill: '#000000',
                align: 'left',
                wordWrap: { width: textWidth * 0.9 }  // 🔥 [v122.0] 減少 10% 以確保文字不會超出框
            });
            textObj.setOrigin(0, 0.5);  // 左對齐，垂直居中
            textObj.setDepth(3);  // 🔥 [v67.0] 從 5 改為 3，在左側卡片下方
        }

        console.log('✅ [v65.0] 水平排列答案卡片已創建（圖片在左，文字在右）:', {
            pairId,
            text,
            boxX: boxX.toFixed(0),
            boxY: boxY.toFixed(0),
            boxRightEdge: boxRightEdge.toFixed(0),
            imageX: imageX.toFixed(0),
            imageY: imageY.toFixed(0),
            imageSize: imageSize.toFixed(0),
            textX: textX.toFixed(0),
            textY: textY.toFixed(0),
            layoutType: 'horizontal'
        });

        return container;
    }

    // 🔥 [v65.0] 創建垂直排列的答案卡片（圖片在上，文字在下）- 用於批數 7, 21+
    createVerticalAnswerCard(boxX, boxY, boxWidth, boxHeight, text, pairId, imageUrl) {
        // 🔥 [v63.0] 計算框外卡片的位置（在框的下方）
        // 圖片大小從 0.9 改為 0.5（減小圖片比例）
        const imageSize = boxHeight * 0.5;
        const imagePadding = 5;   // 🔥 [v63.0] 減少圖片與框的間距（從 10 改為 5）
        const textPadding = 4;    // 🔥 [v63.0] 減少文字與圖片的間距（從 8 改為 4）

        // 🔥 [v60.0] 計算容器的邊界
        // boxY 是容器中心，所以容器下邊界 = boxY + boxHeight/2
        const boxBottomEdge = boxY + boxHeight / 2;

        // 圖片位置：容器下邊界 + 間距（圖片中心）
        const imageX = boxX;  // 水平居中於框
        const imageY = boxBottomEdge + imagePadding + imageSize / 2;

        // 文字位置：圖片下方 + 間距
        const textX = boxX;  // 水平居中於框
        const textY = imageY + imageSize / 2 + textPadding;

        // 🔥 [v60.0] 創建容器（位置在圖片中心）
        const container = this.add.container(imageX, imageY);
        container.setDepth(4);
        container.setData('pairId', pairId);
        container.setData('isAnswerCard', true);

        // 🔥 [v60.0] 加載並顯示圖片（相對於容器，位置為 0,0）
        if (imageUrl && imageUrl.trim() !== '') {
            this.loadAndDisplayImage(container, imageUrl, 0, 0, imageSize, `answer-${pairId}`).catch(error => {
                console.error('❌ 答案圖片載入失敗:', error);
            });
        }

        // 🔥 [v64.0] 創建文字（垂直排列，在圖片下方）- 增大文字大小
        if (text && text.trim() !== '' && text.trim() !== '<br>') {
            // 🔥 [v64.0] 文字大小從 boxHeight * 0.25 改為 boxHeight * 0.35（更大的文字）
            const fontSize = Math.max(14, Math.min(26, boxHeight * 0.35));
            // 🔥 [v122.0] 調整 wordWrap 寬度，確保中文文字完全適應框的寬度（從 1.0 改為 0.85）
            const textObj = this.add.text(textX, textY, text, {
                font: `bold ${fontSize}px Arial`,
                fill: '#000000',
                align: 'center',
                wordWrap: { width: boxWidth * 0.85 }  // 🔥 [v122.0] 減少 15% 以確保文字不會超出框
            });
            textObj.setOrigin(0.5, 0);  // 水平居中，頂部對齐
            textObj.setDepth(5);
        }

        console.log('✅ [v65.0] 垂直排列答案卡片已創建（圖片在上，文字在下）:', {
            pairId,
            text,
            boxX: boxX.toFixed(0),
            boxY: boxY.toFixed(0),
            boxBottomEdge: boxBottomEdge.toFixed(0),
            imageX: imageX.toFixed(0),
            imageY: imageY.toFixed(0),
            imageSize: imageSize.toFixed(0),
            textX: textX.toFixed(0),
            textY: textY.toFixed(0),
            imagePadding: imagePadding,
            layoutType: 'vertical'
        });

        return container;
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

    // 🔥 [v156.0] 保存當前頁的卡片位置
    saveCardPositions(pageIndex) {
        console.log('🔥 [v156.0] ========== 保存卡片位置開始 ==========');
        console.log('🔥 [v156.0] 頁面索引:', pageIndex);

        // 初始化該頁的位置存儲
        if (!this.allPagesCardPositions[pageIndex]) {
            this.allPagesCardPositions[pageIndex] = {};
        }

        // 保存所有左側卡片的位置
        this.leftCards.forEach(card => {
            const pairId = card.getData('pairId');
            this.allPagesCardPositions[pageIndex][pairId] = {
                x: card.x,
                y: card.y,
                isMatched: card.getData('isMatched')
            };
        });

        console.log('🔥 [v156.0] 已保存第 ' + (pageIndex + 1) + ' 頁的卡片位置:', {
            pageIndex: pageIndex,
            savedCardsCount: Object.keys(this.allPagesCardPositions[pageIndex]).length,
            positions: this.allPagesCardPositions[pageIndex]
        });
        console.log('🔥 [v156.0] ========== 保存卡片位置完成 ==========');
    }

    // 🔥 [v157.0] 保存當前頁面的單個卡片位置（在拖放時調用）
    // 🔥 [v189.0] 修復：統一使用 currentFrameIndex 而不是 x, y 座標
    saveCardPositionForCurrentPage(card) {
        const pageIndex = this.currentPage;
        const pairId = card.getData('pairId');
        const currentFrameIndex = card.getData('currentFrameIndex');
        const isMatched = card.getData('isMatched');

        // 初始化該頁的位置存儲
        if (!this.allPagesCardPositions[pageIndex]) {
            this.allPagesCardPositions[pageIndex] = {};
        }

        // 🔥 [v189.0] 修復：保存 currentFrameIndex 而不是 x, y 座標
        // 這樣可以與 checkAllMatches() 和 goToNextPage() 的保存格式一致
        if (currentFrameIndex !== undefined && currentFrameIndex !== null) {
            this.allPagesCardPositions[pageIndex][pairId] = {
                isMatched: isMatched,
                currentFrameIndex: currentFrameIndex
            };

            console.log('🔥 [v189.0] 已保存卡片位置（當前頁，使用 currentFrameIndex）:', {
                pageIndex: pageIndex,
                pairId: pairId,
                currentFrameIndex: currentFrameIndex,
                isMatched: isMatched
            });
        } else {
            console.log('⚠️ [v189.0] 卡片沒有 currentFrameIndex，跳過保存:', {
                pageIndex: pageIndex,
                pairId: pairId,
                currentFrameIndex: currentFrameIndex
            });
        }
    }

    // 🔥 [v156.0] 恢復指定頁的卡片位置
    restoreCardPositions(pageIndex) {
        console.log('🔥 [v156.0] ========== 恢復卡片位置開始 ==========');
        console.log('🔥 [v156.0] 頁面索引:', pageIndex);

        // 🔥 [v186.0] 調適訊息：檢查所有保存的卡片位置
        console.log('🔥 [v186.0] 調適訊息 - 恢復前的全局狀態:', {
            currentPage: this.currentPage,
            pageIndex: pageIndex,
            allPagesCardPositionsKeys: Object.keys(this.allPagesCardPositions),
            allPagesCardPositionsContent: this.allPagesCardPositions
        });

        // 🔥 [v188.0] 新增：詳細檢查 allPagesCardPositions 的結構
        console.log('🔥 [v188.0] 詳細檢查 allPagesCardPositions 結構:', {
            pageIndex: pageIndex,
            pageIndexType: typeof pageIndex,
            allPagesCardPositionsType: typeof this.allPagesCardPositions,
            allPagesCardPositionsIsArray: Array.isArray(this.allPagesCardPositions),
            allPagesCardPositionsKeys: Object.keys(this.allPagesCardPositions),
            allPagesCardPositionsEntries: Object.entries(this.allPagesCardPositions).map(([key, value]) => ({
                key: key,
                keyType: typeof key,
                valueKeys: Object.keys(value || {})
            })),
            directAccess: {
                'allPagesCardPositions[0]': this.allPagesCardPositions[0],
                'allPagesCardPositions[1]': this.allPagesCardPositions[1],
                'allPagesCardPositions["0"]': this.allPagesCardPositions['0'],
                'allPagesCardPositions["1"]': this.allPagesCardPositions['1']
            }
        });

        // 檢查是否有保存的位置
        if (!this.allPagesCardPositions[pageIndex]) {
            console.log('🔥 [v156.0] ❌ 沒有保存的卡片位置');
            console.log('🔥 [v186.0] 調適訊息 - 沒有保存的位置詳情:', {
                pageIndex: pageIndex,
                allPagesCardPositionsKeys: Object.keys(this.allPagesCardPositions),
                hasPageData: this.allPagesCardPositions.hasOwnProperty(pageIndex)
            });
            return;
        }

        const savedPositions = this.allPagesCardPositions[pageIndex];
        let restoredCount = 0;

        console.log('🔥 [v186.0] 調適訊息 - 恢復前的狀態:', {
            pageIndex: pageIndex,
            savedPositionsCount: Object.keys(savedPositions).length,
            savedPositions: savedPositions,
            leftCardsCount: this.leftCards.length
        });

        // 🔥 [v165.0] 深度調試：記錄所有可用的空白框
        console.log('🔥 [v165.0] 恢復前的空白框狀態:', {
            rightEmptyBoxesCount: this.rightEmptyBoxes ? this.rightEmptyBoxes.length : 0,
            rightEmptyBoxesList: this.rightEmptyBoxes ? this.rightEmptyBoxes.map((box, idx) => ({
                index: idx,
                pairId: box.getData('pairId'),
                x: box.x,
                y: box.y,
                isDestroyed: box.isDestroyed ? true : false
            })) : [],
            savedPositionsKeys: Object.keys(savedPositions)
        });

        // 恢復所有卡片的位置
        this.leftCards.forEach(card => {
            const pairId = card.getData('pairId');
            if (savedPositions[pairId]) {
                const savedPos = savedPositions[pairId];

                // 🔥 [v192.0] 修復：移除 isMatched 限制，只要有 currentFrameIndex 就恢復
                // 這樣無論卡片是否正確配對，都會被恢復到對應的空白框中
                if (savedPos.currentFrameIndex !== undefined) {
                    // 卡片被拖到空白框中，需要添加到容器中
                    console.log('🔥 [v192.0] 恢復卡片到空白框（無論是否正確配對）:', {
                        pairId: pairId,
                        currentFrameIndex: savedPos.currentFrameIndex,
                        isMatched: savedPos.isMatched
                    });

                    // 🔥 [v192.0] 直接使用 currentFrameIndex 作為空白框的索引
                    const frameIndex = savedPos.currentFrameIndex;
                    const emptyBox = this.rightEmptyBoxes && frameIndex < this.rightEmptyBoxes.length
                        ? this.rightEmptyBoxes[frameIndex]
                        : null;

                    console.log('🔥 [v192.0] 查找空白框:', {
                        frameIndex: frameIndex,
                        rightEmptyBoxesCount: this.rightEmptyBoxes ? this.rightEmptyBoxes.length : 0,
                        emptyBoxFound: !!emptyBox,
                        emptyBoxPairId: emptyBox ? emptyBox.getData('pairId') : null
                    });

                    if (emptyBox) {
                        // 🔥 [v193.0] 修復：在添加到容器前，記錄卡片的世界座標
                        const cardWorldX = card.x;
                        const cardWorldY = card.y;

                        // 🔥 [v192.0] 添加到容器
                        emptyBox.add(card);

                        // 🔥 [v193.0] 修復：設置卡片的本地座標為 (0, 0)
                        // 這樣卡片就會顯示在容器的中心，而不是右下角
                        card.setPosition(0, 0);

                        card.setData('currentFrameIndex', frameIndex);
                        card.setData('isMatched', savedPos.isMatched || false);
                        card.setData('matchedWith', emptyBox);

                        // 只有正確配對的卡片才添加到 matchedPairs
                        if (savedPos.isMatched) {
                            this.matchedPairs.add(pairId);
                        }

                        console.log('✅ [v193.0] 卡片已恢復到容器:', {
                            pairId: pairId,
                            frameIndex: frameIndex,
                            isMatched: savedPos.isMatched,
                            emptyBoxPairId: emptyBox.getData('pairId'),
                            cardWorldPos: { x: cardWorldX, y: cardWorldY },
                            cardLocalPos: { x: card.x, y: card.y }
                        });

                        // 🔥 [v192.0] 新增：恢復視覺指示器
                        if (savedPos.isMatched) {
                            // 正確配對：顯示勾勾
                            console.log('✅ [v193.0] 恢復勾勾視覺指示器');
                            this.showCorrectAnswerOnCard(emptyBox);
                        } else {
                            // 錯誤配對：顯示叉叉
                            console.log('❌ [v193.0] 恢復叉叉視覺指示器');
                            this.showIncorrectAnswerOnCard(emptyBox);
                        }
                    } else {
                        console.error('❌ [v193.0] 未找到空白框:', {
                            pairId: pairId,
                            frameIndex: frameIndex,
                            rightEmptyBoxesCount: this.rightEmptyBoxes ? this.rightEmptyBoxes.length : 0
                        });
                    }
                } else if (savedPos.isMatched && savedPos.emptyBoxIndex !== undefined) {
                    // 🔥 [v171.0] 舊的邏輯（保留以備後用）
                    // 卡片被配對，需要添加到容器中
                    console.log('🔥 [v171.0] 恢復配對卡片（在容器內）:', {
                        pairId: pairId,
                        emptyBoxIndex: savedPos.emptyBoxIndex,
                        relativeX: savedPos.relativeX,
                        relativeY: savedPos.relativeY
                    });

                    // 🔥 [v171.0] 通過索引位置找到對應的空白框
                    const emptyBox = this.rightEmptyBoxes && savedPos.emptyBoxIndex < this.rightEmptyBoxes.length
                        ? this.rightEmptyBoxes[savedPos.emptyBoxIndex]
                        : null;

                    // 🔥 [v171.0] 深度調試：記錄查找過程
                    console.log('🔥 [v171.0] 查找空白框詳細信息:', {
                        lookingForEmptyBoxIndex: savedPos.emptyBoxIndex,
                        rightEmptyBoxesCount: this.rightEmptyBoxes ? this.rightEmptyBoxes.length : 0,
                        emptyBoxFound: !!emptyBox,
                        searchDetails: this.rightEmptyBoxes ? this.rightEmptyBoxes.map((box, idx) => ({
                            index: idx,
                            boxPairId: box.getData('pairId'),
                            isTarget: idx === savedPos.emptyBoxIndex,
                            isDestroyed: box.isDestroyed ? true : false,
                            x: box.x,
                            y: box.y
                        })) : []
                    });

                    if (emptyBox) {
                        // 🔥 [v171.0] 修復：使用正確索引位置的空白框座標
                        // 這樣即使空白框的順序改變了，卡片也會被放入正確的空白框

                        // 1️⃣ 先將卡片設置到空白框的世界座標 + 相對座標
                        const worldX = emptyBox.x + savedPos.relativeX;
                        const worldY = emptyBox.y + savedPos.relativeY;
                        card.setPosition(worldX, worldY);

                        console.log('🔥 [v171.0] 卡片重置到空白框的世界座標:', {
                            pairId: pairId,
                            emptyBoxIndex: savedPos.emptyBoxIndex,
                            emptyBoxPairId: emptyBox.getData('pairId'),
                            worldX: worldX,
                            worldY: worldY,
                            emptyBoxX: emptyBox.x,
                            emptyBoxY: emptyBox.y
                        });

                        // 2️⃣ 然後將卡片添加到容器
                        emptyBox.add(card);

                        // 3️⃣ 最後設置相對座標（確保卡片在容器內的正確位置）
                        card.setPosition(savedPos.relativeX, savedPos.relativeY);
                        card.setData('isMatched', true);
                        card.setData('matchedWith', emptyBox);
                        this.matchedPairs.add(pairId);

                        console.log('🔥 [v171.0] 卡片已恢復到容器:', {
                            pairId: pairId,
                            emptyBoxIndex: savedPos.emptyBoxIndex,
                            emptyBoxPairId: emptyBox.getData('pairId'),
                            emptyBoxX: emptyBox.x,
                            emptyBoxY: emptyBox.y,
                            relativeX: card.x,
                            relativeY: card.y,
                            worldX: emptyBox.x + card.x,
                            worldY: emptyBox.y + card.y
                        });
                    } else {
                        // 🔥 [v171.0] 未找到空白框 - 索引超出範圍或空白框不存在
                        console.error('❌ [v171.0] 未找到空白框！卡片將保留在場景中（可能在左上角）:', {
                            pairId: pairId,
                            lookingForEmptyBoxIndex: savedPos.emptyBoxIndex,
                            savedPos: savedPos,
                            cardCurrentPosition: {
                                x: card.x,
                                y: card.y
                            },
                            rightEmptyBoxesCount: this.rightEmptyBoxes ? this.rightEmptyBoxes.length : 0,
                            rightEmptyBoxesPairIds: this.rightEmptyBoxes ? this.rightEmptyBoxes.map((box, idx) => `[${idx}]=${box.getData('pairId')}`) : []
                        });
                    }
                } else {
                    // 卡片未被配對，恢復到世界座標
                    // 🔥 [v159.0] 確保座標是數字而不是字符串
                    card.x = typeof savedPos.x === 'string' ? parseFloat(savedPos.x) : savedPos.x;
                    card.y = typeof savedPos.y === 'string' ? parseFloat(savedPos.y) : savedPos.y;
                }

                restoredCount++;

                // 🔥 [v167.0] 安全的座標轉換 - 處理已配對卡片沒有 x/y 的情況
                let displayX, displayY;
                if (savedPos.isMatched) {
                    // 已配對卡片使用容器座標
                    displayX = typeof savedPos.containerX === 'string' ? savedPos.containerX : (savedPos.containerX ? savedPos.containerX.toFixed(0) : 'N/A');
                    displayY = typeof savedPos.containerY === 'string' ? savedPos.containerY : (savedPos.containerY ? savedPos.containerY.toFixed(0) : 'N/A');
                } else {
                    // 未配對卡片使用世界座標
                    displayX = typeof savedPos.x === 'string' ? savedPos.x : (savedPos.x ? savedPos.x.toFixed(0) : 'N/A');
                    displayY = typeof savedPos.y === 'string' ? savedPos.y : (savedPos.y ? savedPos.y.toFixed(0) : 'N/A');
                }

                console.log('🔥 [v156.0] 已恢復卡片位置:', {
                    pairId: pairId,
                    x: displayX,
                    y: displayY,
                    isMatched: savedPos.isMatched
                });
            }
        });

        console.log('🔥 [v156.0] 已恢復第 ' + (pageIndex + 1) + ' 頁的卡片位置:', {
            pageIndex: pageIndex,
            restoredCardsCount: restoredCount,
            totalSavedPositions: Object.keys(savedPositions).length
        });
        console.log('🔥 [v156.0] ========== 恢復卡片位置完成 ==========');
    }
}

