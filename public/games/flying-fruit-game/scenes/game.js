/**
 * Game Scene - Flying Fruit 主遊戲場景
 *
 * 遊戲機制（基於 Wordwall Flying Fruit）：
 * - 中央顯示大圖片和英文單字
 * - 帶有音頻播放按鈕
 * - 橢圓形水果從各方向飛入，帶有小圖片+中文答案
 * - 玩家點擊正確答案的水果
 * - 錯誤會扣生命值
 * - 豐富的叢林主題裝飾
 */
export default class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });

        // 遊戲狀態
        this.gameState = 'waiting'; // 'waiting' | 'playing' | 'paused' | 'ended'
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.correctCount = 0;
        this.lives = 3;
        this.timer = 0;

        // 遊戲物件
        this.fruits = [];
        this.questionText = null;
        this.questionImage = null;
        this.livesDisplay = [];
        this.timerText = null;
        this.progressText = null;
        this.audioButton = null;

        // 水果生成控制
        this.spawnLoopTimers = [];  // 追蹤所有的生成計時器

        // 詞彙數據
        this.vocabulary = [];
        this.currentQuestion = null;

        // 裝飾動畫物件
        this.decorations = [];

        // 水果圖片映射（英文 -> 圖片URL或emoji）
        this.fruitImages = {
            'apple': '🍎',
            'banana': '🍌',
            'orange': '🍊',
            'grape': '🍇',
            'strawberry': '🍓',
            'watermelon': '🍉',
            'peach': '🍑',
            'cherry': '🍒',
            'lemon': '🍋',
            'mango': '🥭',
            'pineapple': '🍍',
            'kiwi': '🥝',
            'coconut': '🥥',
            'pear': '🍐',
            'blueberry': '🫐'
        };

        // 視覺風格
        this.fruitEmojis = ['🍎', '🍊', '🍋', '🍇', '🍓', '🍑', '🍒', '🥝', '🍌', '🍉'];
        // 橢圓形水果背景顏色（類似 Wordwall 的刺果外觀）
        this.fruitBgColors = [
            { fill: 0xDAA520, stroke: 0x8B6914 },  // 金黃色
            { fill: 0xCD853F, stroke: 0x8B5A2B },  // 棕色
            { fill: 0xF4A460, stroke: 0xD2691E },  // 沙棕色
            { fill: 0xDEB887, stroke: 0xA0522D },  // 米色
        ];
    }

    init() {
        // 從 registry 獲取遊戲選項
        const options = this.registry.get('gameOptions') || window.FLYING_FRUIT_OPTIONS;
        this.lives = options.lives || 3;
        this.speed = options.speed || 2;
        this.visualStyle = options.visualStyle || 'jungle';

        // 重置遊戲狀態
        this.gameState = 'waiting';
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.correctCount = 0;
        this.timer = 0;
        this.fruits = [];
        this.flyingFruits = [];  // 拋物線飛行的水果
        this.spawnLoopTimers = [];  // 追蹤所有的生成計時器
    }

    async create() {
        console.log('🎮 GameScene: 創建遊戲場景');

        // 創建背景
        console.log('🎨 創建背景...');
        this.createBackground();
        console.log('✅ 背景創建完成');

        // 創建 UI
        console.log('🎨 創建 UI...');
        this.createUI();
        console.log('✅ UI 創建完成');

        // 載入詞彙（異步操作）
        console.log('📚 開始載入詞彙...');
        await this.loadVocabulary();
        console.log('✅ 詞彙載入完成');

        // 創建開始按鈕
        console.log('🔘 創建開始按鈕...');
        this.createStartButton();
        console.log('✅ 開始按鈕創建完成');

        // 設置輸入事件
        console.log('⌨️ 設置輸入事件...');
        this.setupInput();
        console.log('✅ GameScene 創建完成！');
    }

    createBackground() {
        const { width, height } = this.cameras.main;
        
        // 漸層背景
        const graphics = this.add.graphics();
        
        // 根據視覺風格選擇顏色
        const styleColors = {
            jungle: { top: 0x2d5a27, bottom: 0x1a3a15 },
            clouds: { top: 0x87ceeb, bottom: 0x4a90d9 },
            space: { top: 0x0f0f23, bottom: 0x1a1a3e },
            underwater: { top: 0x006994, bottom: 0x003d5c },
            celebration: { top: 0xff6b6b, bottom: 0xffa502 }
        };
        
        const colors = styleColors[this.visualStyle] || styleColors.jungle;
        
        // 繪製漸層
        for (let y = 0; y < height; y++) {
            const ratio = y / height;
            const r = Phaser.Math.Interpolation.Linear([((colors.top >> 16) & 0xff), ((colors.bottom >> 16) & 0xff)], ratio);
            const g = Phaser.Math.Interpolation.Linear([((colors.top >> 8) & 0xff), ((colors.bottom >> 8) & 0xff)], ratio);
            const b = Phaser.Math.Interpolation.Linear([(colors.top & 0xff), (colors.bottom & 0xff)], ratio);
            graphics.fillStyle(Phaser.Display.Color.GetColor(r, g, b));
            graphics.fillRect(0, y, width, 1);
        }
        
        // 添加裝飾元素
        this.createDecorations();
    }

    createDecorations() {
        const { width, height } = this.cameras.main;

        if (this.visualStyle === 'jungle') {
            // 叢林主題裝飾 - 類似 Wordwall

            // 大嘴鳥（右上角）
            const toucan = this.add.text(width - 60, 30, '🦜', {
                fontSize: '50px'
            }).setOrigin(0.5);
            this.decorations.push(toucan);

            // 大嘴鳥輕微擺動
            this.tweens.add({
                targets: toucan,
                angle: 10,
                duration: 2000,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // 蝴蝶（左下角）
            const butterfly = this.add.text(50, height - 80, '🦋', {
                fontSize: '45px'
            }).setOrigin(0.5);
            this.decorations.push(butterfly);

            // 蝴蝶飛舞動畫
            this.tweens.add({
                targets: butterfly,
                y: butterfly.y - 30,
                x: butterfly.x + 20,
                duration: 1500,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut'
            });

            // 青蛙（右下角）
            const frog = this.add.text(width - 60, height - 50, '🐸', {
                fontSize: '40px'
            }).setOrigin(0.5);
            this.decorations.push(frog);

            // 青蛙跳躍動畫
            this.tweens.add({
                targets: frog,
                y: frog.y - 15,
                duration: 800,
                yoyo: true,
                repeat: -1,
                ease: 'Quad.easeOut'
            });

            // 太陽/月亮（右上）
            const sun = this.add.text(width - 120, 50, '🌙', {
                fontSize: '35px'
            }).setOrigin(0.5).setAlpha(0.8);
            this.decorations.push(sun);

            // 竹子/樹葉裝飾（邊緣）
            this.createJunglePlants();
        } else {
            // 其他主題的裝飾
            for (let i = 0; i < 5; i++) {
                const x = Phaser.Math.Between(50, width - 50);
                const y = Phaser.Math.Between(100, height - 100);
                const decoration = this.add.text(x, y, '☁️', {
                    fontSize: `${Phaser.Math.Between(30, 60)}px`
                }).setAlpha(0.3);

                this.tweens.add({
                    targets: decoration,
                    x: decoration.x + Phaser.Math.Between(-50, 50),
                    duration: Phaser.Math.Between(5000, 10000),
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
                this.decorations.push(decoration);
            }
        }
    }

    createJunglePlants() {
        const { width, height } = this.cameras.main;

        // 左側竹子/樹葉
        const leftPlants = ['🌿', '🌴', '🎋'];
        for (let i = 0; i < 3; i++) {
            const plant = this.add.text(
                10 + i * 15,
                height - 150 + i * 40,
                leftPlants[i % leftPlants.length],
                { fontSize: '40px' }
            ).setAlpha(0.7);
            this.decorations.push(plant);
        }

        // 右側樹葉
        const rightPlants = ['🌿', '🍃', '🌱'];
        for (let i = 0; i < 3; i++) {
            const plant = this.add.text(
                width - 30 - i * 15,
                150 + i * 50,
                rightPlants[i % rightPlants.length],
                { fontSize: '35px' }
            ).setAlpha(0.7);
            this.decorations.push(plant);
        }
    }

    createUI() {
        const { width, height } = this.cameras.main;

        // 計時器顯示（左上角）- 類似 Wordwall
        this.timerText = this.add.text(20, 20, '0:00', {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        // 音頻播放按鈕（問題上方中央）
        this.createAudioButton();

        // 問題文字（英文單字）- 頂部中央
        // 初始為空，遊戲開始時會更新
        this.questionText = this.add.text(width / 2, 70, '', {
            fontSize: '42px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 中央大圖片顯示區域
        this.createCenterImageArea();

        // 右上角狀態區域 - 生命值、正確數、分數
        this.createStatusArea();

        // 底部進度指示器
        this.progressText = this.add.text(width / 2, height - 30, '1 of 10', {
            fontSize: '20px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff'
        }).setOrigin(0.5);

        // 底部控制按鈕（音量、全螢幕）
        this.createBottomControls();
    }

    createAudioButton() {
        const { width } = this.cameras.main;

        // 音頻按鈕容器
        this.audioButton = this.add.container(width / 2, 30);

        // 按鈕背景
        const audioBg = this.add.circle(0, 0, 18, 0x666666, 0.8);
        audioBg.setStrokeStyle(2, 0x888888);
        audioBg.setInteractive({ useHandCursor: true });

        // 喇叭圖標
        const audioIcon = this.add.text(0, 0, '🔊', {
            fontSize: '18px'
        }).setOrigin(0.5);

        this.audioButton.add([audioBg, audioIcon]);

        // 點擊播放發音
        audioBg.on('pointerdown', () => this.playCurrentWordAudio());
        audioBg.on('pointerover', () => audioBg.setFillStyle(0x888888));
        audioBg.on('pointerout', () => audioBg.setFillStyle(0x666666));

        // 初始隱藏音頻按鈕，遊戲開始時顯示
        this.audioButton.setVisible(false);
    }

    createCenterImageArea() {
        const { width, height } = this.cameras.main;
        const centerY = height / 2;

        // 白色圖片框背景
        this.imageBg = this.add.rectangle(width / 2, centerY, 150, 150, 0xffffff);
        this.imageBg.setStrokeStyle(3, 0xcccccc);
        this.imageBg.setDepth(1); // 白框背景在下層
        // 初始隱藏，遊戲開始時顯示
        this.imageBg.setVisible(false);

        // 大圖片/emoji（會根據當前問題更新）
        // 使用 80px 字體，然後縮放 1.8 倍使其填滿 150x150 白框
        this.questionImage = this.add.text(width / 2, centerY, '🍎', {
            fontSize: '80px'
        }).setOrigin(0.5);
        this.questionImage.setScale(1.8); // 縮放 1.8 倍
        this.questionImage.setDepth(2); // 圖片在白框上層
        // 初始隱藏，遊戲開始時顯示
        this.questionImage.setVisible(false);
    }

    createStatusArea() {
        const { width } = this.cameras.main;

        // 狀態容器（右上角）
        this.statusContainer = this.add.container(width - 20, 20);

        // 生命值顯示
        this.livesContainer = this.add.container(0, 0);
        this.updateLivesDisplay();
        this.statusContainer.add(this.livesContainer);

        // 正確數顯示
        this.correctText = this.add.text(-100, 0, '✓ 0', {
            fontSize: '22px',
            fontFamily: 'Arial, sans-serif',
            color: '#00ff00',
            fontStyle: 'bold'
        }).setOrigin(1, 0.5);
        this.statusContainer.add(this.correctText);
    }

    updateLivesDisplay() {
        this.livesContainer.removeAll(true);
        // 從右往左排列心形
        for (let i = 0; i < this.lives; i++) {
            const heart = this.add.text(-i * 28 - 10, 0, '❤️', { fontSize: '24px' }).setOrigin(1, 0.5);
            this.livesContainer.add(heart);
        }
    }

    createBottomControls() {
        const { width, height } = this.cameras.main;

        // 音量按鈕
        const volumeBtn = this.add.text(width - 70, height - 30, '🔈', {
            fontSize: '24px'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        volumeBtn.on('pointerdown', () => {
            // 切換靜音（未來實現）
            console.log('Toggle sound');
        });

        // 全螢幕按鈕
        const fullscreenBtn = this.add.text(width - 30, height - 30, '⛶', {
            fontSize: '24px'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        fullscreenBtn.on('pointerdown', () => {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        });
    }

    playCurrentWordAudio() {
        if (!this.currentQuestion) return;

        // 使用 Web Speech API 播放發音
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(this.currentQuestion.english);
            utterance.lang = 'en-US';
            utterance.rate = 0.8;
            speechSynthesis.speak(utterance);

            // 按鈕動畫反饋
            this.tweens.add({
                targets: this.audioButton,
                scale: 1.2,
                duration: 100,
                yoyo: true
            });
        }
    }

    async loadVocabulary() {
        try {
            // 首先嘗試從 API 加載活動數據
            const urlParams = new URLSearchParams(window.location.search);
            const activityId = urlParams.get('activityId');

            if (activityId) {
                console.log('🔄 嘗試從 API 加載活動數據:', activityId);
                const response = await fetch(`/api/activities/${activityId}`);

                if (response.ok) {
                    const activity = await response.json();
                    console.log('✅ 活動數據載入成功:', activity);

                    // 檢查是否有 questions 數據（Flying Fruit 格式）
                    let questionsData = [];

                    if (activity.content && activity.content.questions && Array.isArray(activity.content.questions)) {
                        questionsData = activity.content.questions;
                        console.log('📝 從 content.questions 載入問題:', questionsData.length, '個');
                    }

                    // 如果有 questions 數據，轉換為詞彙格式
                    if (questionsData.length > 0) {
                        this.vocabulary = questionsData.map((q, index) => ({
                            english: q.question || '',
                            chinese: q.answers.find(a => a.isCorrect)?.text || '',
                            questionImageUrl: q.questionImageUrl || null,
                            questionAudioUrl: q.questionAudioUrl || null,
                            answers: q.answers || []
                        }));
                        console.log('✅ 從活動數據轉換詞彙:', this.vocabulary.length, '個');

                        // 打亂順序
                        const options = this.registry.get('gameOptions');
                        if (options.shuffle) {
                            Phaser.Utils.Array.Shuffle(this.vocabulary);
                        }
                        return;
                    }
                } else {
                    console.warn('⚠️ API 請求失敗，狀態碼:', response.status);
                }
            }

            // 如果沒有 activityId 或 API 加載失敗，嘗試從 GEPTManager 載入
            if (this.registry.get('geptManagerReady') && window.GEPTManager) {
                const options = this.registry.get('gameOptions');
                const level = options.geptLevel || 'all';
                const count = options.wordCount || 10;

                try {
                    this.vocabulary = window.GEPTManager.getRandomWords(level, count);
                    console.log('📚 從 GEPTManager 載入詞彙:', this.vocabulary.length);
                } catch (e) {
                    console.warn('⚠️ GEPTManager 載入失敗，使用內建詞彙');
                    this.useBuiltInVocabulary();
                }
            } else {
                this.useBuiltInVocabulary();
            }

            // 打亂順序
            const options = this.registry.get('gameOptions');
            if (options.shuffle) {
                Phaser.Utils.Array.Shuffle(this.vocabulary);
            }
        } catch (error) {
            console.error('❌ 加載詞彙時出錯:', error);
            this.useBuiltInVocabulary();
        }
    }

    useBuiltInVocabulary() {
        // 內建詞彙（英文 -> 中文）
        this.vocabulary = [
            { english: 'apple', chinese: '蘋果' },
            { english: 'banana', chinese: '香蕉' },
            { english: 'orange', chinese: '橘子' },
            { english: 'grape', chinese: '葡萄' },
            { english: 'strawberry', chinese: '草莓' },
            { english: 'watermelon', chinese: '西瓜' },
            { english: 'peach', chinese: '桃子' },
            { english: 'cherry', chinese: '櫻桃' },
            { english: 'lemon', chinese: '檸檬' },
            { english: 'mango', chinese: '芒果' }
        ];
        console.log('📚 使用內建詞彙:', this.vocabulary.length);
    }

    createStartButton() {
        const { width, height } = this.cameras.main;

        // 開始按鈕背景
        this.startButton = this.add.container(width / 2, height / 2);

        const buttonBg = this.add.rectangle(0, 0, 200, 80, 0x4CAF50);
        buttonBg.setStrokeStyle(4, 0x2E7D32);
        buttonBg.setInteractive({ useHandCursor: true });

        const buttonText = this.add.text(0, 0, '▶ 開始遊戲', {
            fontSize: '28px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        this.startButton.add([buttonBg, buttonText]);

        // 按鈕動畫
        this.tweens.add({
            targets: this.startButton,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // 點擊事件
        buttonBg.on('pointerdown', () => this.startGame());
        buttonBg.on('pointerover', () => buttonBg.setFillStyle(0x66BB6A));
        buttonBg.on('pointerout', () => buttonBg.setFillStyle(0x4CAF50));
    }

    setupInput() {
        // 點擊事件由各個水果的 hitArea 處理，不需要全局點擊檢測
    }

    startGame() {
        console.log('🎮 遊戲開始！');

        // 隱藏開始按鈕
        this.startButton.setVisible(false);

        // 顯示問題相關的 UI 元素
        this.audioButton.setVisible(true);
        this.imageBg.setVisible(true);
        this.questionImage.setVisible(true);

        // 設置遊戲狀態
        this.gameState = 'playing';
        this.registry.set('gameStartTime', Date.now());

        // 開始計時器
        this.startTimer();

        // 顯示第一個問題
        this.showNextQuestion();
    }

    startTimer() {
        const options = this.registry.get('gameOptions');

        if (options.timer.type === 'none') return;

        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                if (options.timer.type === 'countUp') {
                    this.timer++;
                } else {
                    this.timer--;
                    if (this.timer <= 0) {
                        this.endGame('timeout');
                    }
                }
                this.updateTimerDisplay();
            },
            loop: true
        });

        // 初始化計時器
        if (options.timer.type === 'countDown') {
            this.timer = options.timer.minutes * 60 + options.timer.seconds;
        }
        this.updateTimerDisplay();
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timer / 60);
        const seconds = this.timer % 60;
        // 類似 Wordwall 格式：1:38
        this.timerText.setText(`${minutes}:${String(seconds).padStart(2, '0')}`);
    }

    showNextQuestion() {
        if (this.currentQuestionIndex >= this.vocabulary.length) {
            this.endGame('complete');
            return;
        }

        // 清除現有水果
        this.clearFruits();

        // 獲取當前問題
        this.currentQuestion = this.vocabulary[this.currentQuestionIndex];

        // 更新問題文字（英文單字）
        this.questionText.setText(this.currentQuestion.english);

        // 更新中央大圖片
        this.updateCenterImage();

        // 更新進度指示器
        this.progressText.setText(`${this.currentQuestionIndex + 1} of ${this.vocabulary.length}`);

        // 生成答案選項（1個正確 + 3個錯誤）
        this.generateAnswerOptions();

        // 延遲後開始生成水果
        this.time.delayedCall(500, () => {
            this.spawnFruits();
        });

        // 自動播放發音
        this.time.delayedCall(300, () => {
            this.playCurrentWordAudio();
        });
    }

    updateCenterImage() {
        // 🔥 優先使用 API 返回的問題圖片 URL
        if (this.currentQuestion.questionImageUrl) {
            console.log('📸 使用 API 問題圖片:', this.currentQuestion.questionImageUrl);

            const { width, height } = this.cameras.main;
            const centerY = height / 2;

            // 需要從文字轉換為圖片
            if (this.questionImage) {
                this.questionImage.destroy();
            }

            // 創建新的圖片物件
            this.questionImage = this.add.image(width / 2, centerY, '');
            this.questionImage.setOrigin(0.5);
            this.questionImage.setDepth(2); // 圖片在白框上層

            // 異步加載圖片
            const imageKey = 'questionImg_' + Date.now(); // 使用唯一 key 避免緩存問題
            this.load.image(imageKey, this.currentQuestion.questionImageUrl);
            this.load.once('complete', () => {
                if (this.questionImage) {
                    this.questionImage.setTexture(imageKey);
                    // 🔥 關鍵：在紋理加載後設置 displaySize 為 150x150
                    this.questionImage.setDisplaySize(150, 150);
                    console.log('✅ 問題圖片加載成功，大小設置為 150x150');

                    // 圖片出現動畫（使用 alpha 而不是 scale，避免覆蓋 displaySize）
                    this.questionImage.setAlpha(0);
                    this.tweens.add({
                        targets: this.questionImage,
                        alpha: 1,
                        duration: 300,
                        ease: 'Power2'
                    });
                }
            });
            this.load.start();
        } else {
            // 回退到 emoji 顯示
            const word = this.currentQuestion.english.toLowerCase();
            const emoji = this.fruitImages[word] || '❓';

            const { width, height } = this.cameras.main;
            const centerY = height / 2;

            // 如果是圖片物件，轉換回文字物件
            if (this.questionImage && this.questionImage.type === 'Image') {
                this.questionImage.destroy();
                // 使用 80px 字體，然後縮放 1.8 倍使其填滿 150x150 白框
                this.questionImage = this.add.text(width / 2, centerY, emoji, {
                    fontSize: '80px'
                }).setOrigin(0.5);
                this.questionImage.setScale(1.8); // 縮放 1.8 倍
                this.questionImage.setDepth(2); // 圖片在白框上層
            } else {
                this.questionImage.setText(emoji);
                this.questionImage.setScale(1.8); // 確保縮放保持一致
            }

            // 圖片出現動畫（使用 alpha 避免干擾 scale）
            this.questionImage.setAlpha(0);
            this.tweens.add({
                targets: this.questionImage,
                alpha: 1,
                duration: 300,
                ease: 'Power2'
            });
        }
    }

    generateAnswerOptions() {
        // 檢查當前問題是否有預定義的答案（來自 API）
        if (this.currentQuestion.answers && Array.isArray(this.currentQuestion.answers) && this.currentQuestion.answers.length > 0) {
            // 使用 API 中的答案
            console.log('📝 使用 API 答案:', this.currentQuestion.answers.length, '個');
            this.answerOptions = this.currentQuestion.answers.map(answer => ({
                text: answer.text || '',
                imageUrl: answer.imageUrl || null,
                isCorrect: answer.isCorrect,
                english: this.currentQuestion.english
            }));

            // 打亂所有選項
            Phaser.Utils.Array.Shuffle(this.answerOptions);
        } else {
            // 使用默認生成邏輯（向後兼容）
            // 正確答案 - 包含英文用於查找圖片
            this.answerOptions = [{
                text: this.currentQuestion.chinese,
                english: this.currentQuestion.english,
                isCorrect: true
            }];

            // 生成錯誤答案 - 生成 3 個錯誤答案
            const wrongAnswers = this.vocabulary
                .filter(v => v.chinese !== this.currentQuestion.chinese)
                .map(v => ({
                    text: v.chinese,
                    english: v.english,
                    isCorrect: false
                }));

            Phaser.Utils.Array.Shuffle(wrongAnswers);
            this.answerOptions.push(...wrongAnswers.slice(0, 3));  // 取 3 個錯誤答案

            // 打亂所有選項
            Phaser.Utils.Array.Shuffle(this.answerOptions);
        }
    }

    spawnFruits() {
        const { width, height } = this.cameras.main;

        // 🎯 順序拋出水果 - 最多同時 2 個水果在空中，4 個都拋完後繼續循環拋出
        // 水果飛行時間約 3-3.5 秒，所以間隔設為 3.5 秒確保最多 2 個同時在空中
        const spawnDelay = 3500;  // 每個水果之間的延遲（毫秒）- 3.5 秒

        // 停止舊的水果生成循環
        this.spawnLoopTimers.forEach(timer => {
            if (timer) {
                this.time.removeEvent(timer);
            }
        });
        this.spawnLoopTimers = [];

        // 從底部不同位置拋出水果（類似拋水果的效果）
        const spawnXPositions = [
            width * 0.15,  // 左側
            width * 0.35,  // 左中
            width * 0.65,  // 右中
            width * 0.85   // 右側
        ];

        // 初始化循環拋出索引
        let fruitCycleIndex = 0;

        // 持續循環拋出水果
        const spawnLoop = () => {
            const option = this.answerOptions[fruitCycleIndex % this.answerOptions.length];
            const index = fruitCycleIndex;
            const spawnX = spawnXPositions[index % spawnXPositions.length];

            const timer = this.time.delayedCall(spawnDelay, () => {
                if (this.gameState !== 'playing') return;
                this.createFruit(option, index, spawnX);
                fruitCycleIndex++;
                spawnLoop();  // 遞迴調用，持續拋出
            });
            this.spawnLoopTimers.push(timer);
        };

        // 立即拋出第一個水果
        const firstOption = this.answerOptions[0];
        const firstSpawnX = spawnXPositions[0];
        this.createFruit(firstOption, 0, firstSpawnX);
        fruitCycleIndex = 1;
        spawnLoop();
    }

    createFruit(option, index, spawnX) {
        const { width, height } = this.cameras.main;

        // 從底部開始（螢幕下方）
        const startY = height + 50;

        // 創建水果容器
        const fruitContainer = this.add.container(spawnX, startY);

        // 橢圓形水果背景（類似 Wordwall 的刺果外觀）
        const bgColor = this.fruitBgColors[index % this.fruitBgColors.length];

        // 使用 Graphics 繪製橢圓形
        const fruitBg = this.add.graphics();
        fruitBg.fillStyle(bgColor.fill, 1);
        fruitBg.lineStyle(3, bgColor.stroke, 1);
        fruitBg.fillEllipse(0, 0, 100, 60);
        fruitBg.strokeEllipse(0, 0, 100, 60);

        // 添加一些小點模擬刺果紋理
        fruitBg.fillStyle(bgColor.stroke, 0.5);
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const px = Math.cos(angle) * 35;
            const py = Math.sin(angle) * 20;
            fruitBg.fillCircle(px, py, 3);
        }

        // 小圖片（代表答案的水果或圖片）
        let smallImage;
        const imageKey = `answer_img_${index}_${Date.now()}`;

        if (option.imageUrl) {
            // 使用 API 中的圖片 - 先顯示 emoji，然後異步加載圖片
            const word = option.english ? option.english.toLowerCase() : '';
            const fallbackEmoji = this.fruitImages[word] || this.fruitEmojis[index % this.fruitEmojis.length];

            // 先創建一個佔位的 emoji
            smallImage = this.add.text(-25, -5, fallbackEmoji, {
                fontSize: '28px'
            }).setOrigin(0.5);

            // 異步加載圖片
            this.load.image(imageKey, option.imageUrl);
            this.load.once('complete', () => {
                if (fruitContainer && fruitContainer.active) {
                    // 移除 emoji，添加圖片
                    const imgSprite = this.add.image(-25, -5, imageKey);
                    imgSprite.setDisplaySize(40, 40);
                    imgSprite.setOrigin(0.5);

                    // 替換容器中的 emoji
                    const emojiIndex = fruitContainer.list.indexOf(smallImage);
                    if (emojiIndex !== -1) {
                        fruitContainer.remove(smallImage, true);
                        fruitContainer.addAt(imgSprite, emojiIndex);
                    }
                }
            });
            this.load.start();
        } else {
            // 使用 emoji 作為備選
            const word = option.english ? option.english.toLowerCase() : '';
            const fruitEmoji = this.fruitImages[word] || this.fruitEmojis[index % this.fruitEmojis.length];
            smallImage = this.add.text(-25, -5, fruitEmoji, {
                fontSize: '28px'
            }).setOrigin(0.5);
        }

        // 答案文字（中文）
        const displayText = option.text || '';
        const answerText = this.add.text(15, -5, displayText, {
            fontSize: '18px',
            fontFamily: 'Arial, sans-serif',
            color: '#000000',
            fontStyle: 'bold'
        }).setOrigin(0, 0.5);

        // 存儲引用以便後續檢查
        fruitContainer.text = answerText;
        fruitContainer.imageUrl = option.imageUrl;
        fruitContainer.sprite = smallImage;

        fruitContainer.add([fruitBg, smallImage, answerText]);

        // 存儲數據
        fruitContainer.setData('option', option);
        fruitContainer.setData('isCorrect', option.isCorrect);
        fruitContainer.setData('startX', spawnX);

        // 創建一個可點擊的透明區域（因為 Graphics 需要特殊處理）
        const hitArea = this.add.rectangle(0, 0, 100, 60, 0xffffff, 0);
        hitArea.setInteractive({ useHandCursor: true });
        hitArea.on('pointerdown', () => this.onFruitClick(fruitContainer));
        hitArea.on('pointerover', () => {
            fruitContainer.setScale(1.1);
        });
        hitArea.on('pointerout', () => {
            fruitContainer.setScale(1);
        });
        fruitContainer.add(hitArea);

        // 添加到水果列表
        this.fruits.push(fruitContainer);
        this.flyingFruits.push(fruitContainer);

        // 🎯 拋物線動畫（地心引力效果）
        this.animateFruitParabola(fruitContainer, spawnX, index);
    }

    /**
     * 拋物線動畫 - 模擬地心引力效果（參考 Gorilla Game 物理引擎）
     * 使用真實的物理模擬：逐幀更新速度和位置
     * 公式：velocity.y -= gravity * deltaTime
     *       position += velocity * deltaTime
     */
    animateFruitParabola(fruitContainer, startX, index) {
        const { width, height } = this.cameras.main;

        // 🎮 物理參數 - 超級緩慢拋出和下降
        // 讓用戶有充足時間看清楚水果上的文字
        // 水果只拋到遊戲容器的 2/3 高度（約 360px）
        const baseUpVelocity = -35 - (this.speed * 3);   // 初始向上速度 - 大幅降低以限制高度
        const gravity = 1.5 + (this.speed * 0.2);        // 重力加速度 - 稍微增加以快速下降
        const windSpeed = Phaser.Math.Between(-0.2, 0.2); // 風力影響 - 幾乎沒有

        // 隨機水平速度（讓水果有角度拋出）
        const horizontalVelocity = Phaser.Math.Between(-3, 3);  // 超級緩慢的水平移動

        // 旋轉方向
        const rotationDirection = index % 2 === 0 ? 1 : -1;

        // 存儲物理狀態到 fruitContainer
        fruitContainer.setData('isFlying', true);
        fruitContainer.setData('velocityX', horizontalVelocity);
        fruitContainer.setData('velocityY', baseUpVelocity);
        fruitContainer.setData('gravity', gravity);
        fruitContainer.setData('windSpeed', windSpeed);
        fruitContainer.setData('rotationDir', rotationDirection);
        fruitContainer.setData('startY', height + 50);
    }

    /**
     * 🎮 物理引擎更新（參考 Gorilla Game 的 moveBomb 函數）
     * 在 update() 中調用，逐幀更新所有飛行中的水果
     */
    updateFruitPhysics(deltaTime) {
        if (this.gameState !== 'playing') return;

        const { height } = this.cameras.main;
        const multiplier = deltaTime / 200;  // 參考 Gorilla Game 的時間倍率

        // 遍歷所有飛行中的水果
        for (let i = this.flyingFruits.length - 1; i >= 0; i--) {
            const fruit = this.flyingFruits[i];

            if (!fruit || !fruit.active || !fruit.getData('isFlying')) {
                continue;
            }

            // 獲取當前速度
            let velocityX = fruit.getData('velocityX') || 0;
            let velocityY = fruit.getData('velocityY') || 0;
            const gravity = fruit.getData('gravity') || 15;
            const windSpeed = fruit.getData('windSpeed') || 0;
            const rotationDir = fruit.getData('rotationDir') || 1;

            // 🌬️ 風力影響水平軌跡（像 Gorilla Game）
            velocityX += windSpeed * multiplier;

            // 🌍 重力影響垂直軌跡
            // Gorilla Game: velocity.y -= 20 * multiplier
            velocityY += gravity * multiplier;

            // 📍 計算新位置
            fruit.x += velocityX * multiplier;
            fruit.y += velocityY * multiplier;

            // 🔄 旋轉效果 - 移除以保持文字清晰可讀
            // fruit.angle += rotationDir * 5 * multiplier;

            // 💾 更新速度數據
            fruit.setData('velocityX', velocityX);
            fruit.setData('velocityY', velocityY);

            // ⬇️ 檢查是否落出螢幕底部
            if (fruit.y > height + 100) {
                // 正確答案落下 = 移除水果（不扣血）
                this.removeFruit(fruit);
            }

            // ⬆️ 檢查是否飛出螢幕頂部太高（限制最高點）
            if (fruit.y < -200) {
                // 限制最高點，讓水果開始下落
                fruit.setData('velocityY', Math.abs(velocityY));
            }
        }
    }

    /**
     * update 方法 - 物理引擎主循環
     * 每幀調用，更新所有水果的物理狀態
     */
    update(time, delta) {
        // 🎮 調用物理引擎更新（參考 Gorilla Game 的 animate 函數）
        this.updateFruitPhysics(delta);
    }

    onFruitClick(fruitContainer) {
        if (this.gameState !== 'playing') return;

        // 防止同一個水果被點擊多次
        if (fruitContainer.getData('clicked')) return;
        fruitContainer.setData('clicked', true);

        const isCorrect = fruitContainer.getData('isCorrect');

        if (isCorrect) {
            this.onCorrectAnswer(fruitContainer);
        } else {
            this.onWrongAnswer(fruitContainer);
        }
    }

    onCorrectAnswer(fruitContainer) {
        console.log('✅ 正確！');

        // 增加分數和正確數
        this.score += 100;
        this.correctCount++;
        this.correctText.setText(`✓ ${this.correctCount}`);
        this.registry.set('correctAnswers', (this.registry.get('correctAnswers') || 0) + 1);

        // 🛑 停止所有水果的物理模擬
        this.fruits.forEach(fruit => {
            if (fruit && fruit.active) {
                fruit.setData('isFlying', false);
            }
        });
        this.flyingFruits.forEach(fruit => {
            if (fruit && fruit.active) {
                fruit.setData('isFlying', false);
            }
        });

        // 正確答案動畫 - 飛向中央圖片
        const { width, height } = this.cameras.main;
        this.tweens.add({
            targets: fruitContainer,
            x: width / 2,
            y: height / 2,
            scaleX: 1.3,
            scaleY: 1.3,
            duration: 400,
            ease: 'Back.easeIn',
            onComplete: () => {
                // 閃光效果
                this.tweens.add({
                    targets: fruitContainer,
                    alpha: 0,
                    duration: 200,
                    onComplete: () => {
                        this.removeFruit(fruitContainer);
                    }
                });
            }
        });

        // 顯示正確提示
        this.showFeedback('✅ 正確！', 0x4CAF50);

        // 記錄結果
        this.recordResult(true);

        // 清除其他水果並進入下一題
        this.time.delayedCall(600, () => {
            this.clearFruits();
            this.currentQuestionIndex++;
            this.time.delayedCall(300, () => {
                this.showNextQuestion();
            });
        });
    }

    onWrongAnswer(fruitContainer) {
        console.log('❌ 錯誤！');

        this.registry.set('wrongAnswers', this.registry.get('wrongAnswers') + 1);

        // 錯誤答案動畫（抖動）
        this.tweens.add({
            targets: fruitContainer,
            x: fruitContainer.x + 10,
            duration: 50,
            yoyo: true,
            repeat: 5
        });

        // 顯示錯誤提示
        this.showFeedback('❌ 錯誤！', 0xf44336);

        // 播放音效
        // this.sound.play('wrong');

        // 點擊錯誤水果扣血
        this.takeDamage();

        // 記錄結果
        this.recordResult(false);

        // 延遲後移除錯誤的水果
        this.time.delayedCall(300, () => {
            this.removeFruit(fruitContainer);
        });
    }

    takeDamage() {
        this.lives--;
        this.updateLivesDisplay();

        // 螢幕閃紅
        this.cameras.main.flash(200, 255, 0, 0);

        if (this.lives <= 0) {
            this.endGame('noLives');
        }
    }

    showFeedback(text, color) {
        const { width, height } = this.cameras.main;

        const feedback = this.add.text(width / 2, height / 2, text, {
            fontSize: '48px',
            fontFamily: 'Arial, sans-serif',
            color: '#ffffff',
            fontStyle: 'bold',
            backgroundColor: `#${color.toString(16).padStart(6, '0')}`,
            padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setDepth(100);

        this.tweens.add({
            targets: feedback,
            y: height / 2 - 50,
            alpha: 0,
            duration: 800,
            ease: 'Power2',
            onComplete: () => feedback.destroy()
        });
    }

    recordResult(isCorrect) {
        const results = this.registry.get('results') || [];
        results.push({
            question: this.currentQuestion.english,
            answer: this.currentQuestion.chinese,
            isCorrect: isCorrect,
            timestamp: Date.now()
        });
        this.registry.set('results', results);
    }

    clearFruits() {
        // 停止所有水果生成循環
        this.spawnLoopTimers.forEach(timer => {
            if (timer) {
                this.time.removeEvent(timer);
            }
        });
        this.spawnLoopTimers = [];

        // 清除所有水果
        this.fruits.forEach(fruit => {
            if (fruit && fruit.active) {
                fruit.setData('isFlying', false);
                fruit.destroy();
            }
        });
        this.fruits = [];

        // 清除飛行水果列表
        if (this.flyingFruits) {
            this.flyingFruits = [];
        }
    }

    removeFruit(fruitContainer) {
        // 標記為非飛行狀態
        fruitContainer.setData('isFlying', false);

        // 從水果列表中移除
        const index = this.fruits.indexOf(fruitContainer);
        if (index > -1) {
            this.fruits.splice(index, 1);
        }

        // 從飛行水果列表中移除
        if (this.flyingFruits) {
            const flyingIndex = this.flyingFruits.indexOf(fruitContainer);
            if (flyingIndex > -1) {
                this.flyingFruits.splice(flyingIndex, 1);
            }
        }

        if (fruitContainer && fruitContainer.active) {
            fruitContainer.destroy();
        }
    }



    endGame(reason) {
        console.log('🏁 遊戲結束:', reason);

        this.gameState = 'ended';
        this.registry.set('gameEndTime', Date.now());

        // 停止計時器
        if (this.timerEvent) {
            this.timerEvent.destroy();
        }

        // 清除水果
        this.clearFruits();

        // 計算最終結果
        const finalResults = {
            score: this.score,
            correctAnswers: this.registry.get('correctAnswers') || this.correctCount,
            wrongAnswers: this.registry.get('wrongAnswers') || 0,
            totalQuestions: this.vocabulary.length,
            timeSpent: this.timer,
            endReason: reason,
            results: this.registry.get('results')
        };

        this.registry.set('finalResults', finalResults);

        // 🔥 顯示遊戲結束模態框（類似 Match-up 風格）
        this.time.delayedCall(500, () => {
            this.showGameCompleteModal();
        });
    }

    // 🔥 顯示遊戲結束模態框（Match-up 風格）
    showGameCompleteModal() {
        // 防止重複調用
        if (this.gameCompleteModalShown) {
            console.log('⚠️ 模態框已經顯示，跳過重複調用');
            return;
        }
        this.gameCompleteModalShown = true;

        const width = this.scale.width;
        const height = this.scale.height;

        // 計算分數
        const totalCorrect = this.correctCount;
        const totalQuestions = this.vocabulary.length;

        console.log('🎮 顯示遊戲結束模態框', {
            totalCorrect,
            totalQuestions,
            timeSpent: this.timer
        });

        // 創建半透明背景（遮罩）
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        overlay.setDepth(5000);

        // 創建模態框容器
        const modalWidth = Math.min(500, width * 0.85);
        const modalHeight = Math.min(380, height * 0.7);
        const modal = this.add.container(width / 2, height / 2);
        modal.setDepth(5001);

        // 模態框背景
        const modalBg = this.add.rectangle(0, 0, modalWidth, modalHeight, 0x2c2c2c);
        modalBg.setStrokeStyle(4, 0x000000);
        modal.add(modalBg);

        // 標題：GAME COMPLETE
        const title = this.add.text(0, -modalHeight / 2 + 30, 'GAME COMPLETE', {
            fontSize: '32px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        modal.add(title);

        // Score 標籤
        const scoreLabel = this.add.text(0, -modalHeight / 2 + 65, 'Score', {
            fontSize: '18px',
            color: '#4a9eff',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        modal.add(scoreLabel);

        // 分數顯示
        const scoreText = this.add.text(0, -modalHeight / 2 + 95, `${totalCorrect}/${totalQuestions}`, {
            fontSize: '36px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        modal.add(scoreText);

        // 排名提示
        const rankText = this.add.text(0, -modalHeight / 2 + 130, "YOU'RE 1ST ON THE LEADERBOARD", {
            fontSize: '14px',
            color: '#aaaaaa',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        modal.add(rankText);

        // 按鈕配置
        const buttonSpacing = 45;
        const firstButtonY = -modalHeight / 2 + 175;

        // Leaderboard 按鈕
        this.createModalButton(modal, 0, firstButtonY, 'Leaderboard', () => {
            console.log('🎮 點擊 Leaderboard 按鈕');
            this.showEnterNamePage();
        });

        // Show answers 按鈕
        this.createModalButton(modal, 0, firstButtonY + buttonSpacing, 'Show answers', () => {
            console.log('🎮 點擊 Show answers 按鈕');
            overlay.destroy();
            modal.destroy();
            this.gameCompleteModal = null;
            this.showAnswersReview();
        });

        // Show all answers 按鈕
        this.createModalButton(modal, 0, firstButtonY + buttonSpacing * 2, 'Show all answers', () => {
            console.log('🎮 點擊 Show all answers 按鈕');
            overlay.destroy();
            modal.destroy();
            this.gameCompleteModal = null;
            this.showAllCorrectAnswers();
        });

        // Start again 按鈕
        this.createModalButton(modal, 0, firstButtonY + buttonSpacing * 3, 'Start again', () => {
            console.log('🎮 點擊 Start again 按鈕');
            overlay.destroy();
            modal.destroy();
            this.gameCompleteModal = null;
            this.restartGame();
        });

        // 保存模態框引用
        this.gameCompleteModal = { overlay, modal };
    }

    // 🔥 創建模態框按鈕
    createModalButton(container, x, y, text, callback) {
        const buttonWidth = 280;
        const buttonHeight = 40;

        // 按鈕背景
        const buttonBg = this.add.rectangle(x, y, buttonWidth, buttonHeight, 0x3c3c3c);
        buttonBg.setStrokeStyle(2, 0x000000);
        buttonBg.setInteractive({ useHandCursor: true });
        container.add(buttonBg);

        // 按鈕文字
        const buttonText = this.add.text(x, y, text, {
            fontSize: '20px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        container.add(buttonText);

        // 點擊事件
        buttonBg.on('pointerdown', callback);

        // 懸停效果
        buttonBg.on('pointerover', () => buttonBg.setFillStyle(0x4c4c4c));
        buttonBg.on('pointerout', () => buttonBg.setFillStyle(0x3c3c3c));

        return { buttonBg, buttonText };
    }

    // 🔥 重新開始遊戲
    restartGame() {
        console.log('🔄 重新開始遊戲');
        this.gameCompleteModalShown = false;
        this.scene.restart();
    }

    // 🔥 顯示答案回顧（顯示對錯）
    showAnswersReview() {
        console.log('📋 顯示答案回顧');
        // TODO: 實現答案回顧功能
        alert('答案回顧功能開發中...');
    }

    // 🔥 顯示所有正確答案
    showAllCorrectAnswers() {
        console.log('📋 顯示所有正確答案');
        // TODO: 實現顯示所有正確答案功能
        alert('顯示所有正確答案功能開發中...');
    }

    // 🔥 顯示輸入名稱頁面（排行榜）
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
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        overlay.setDepth(7000);

        // 創建輸入名稱頁面容器
        const pageWidth = Math.min(600, width * 0.9);
        const pageHeight = Math.min(500, height * 0.8);
        const page = this.add.container(width / 2, height / 2);
        page.setDepth(7001);

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
        }).setOrigin(0.5);
        page.add(title);

        // 副標題：You're 1st on the leaderboard
        const subtitle = this.add.text(0, -pageHeight / 2 + 80, "You're 1st on the leaderboard", {
            fontSize: '16px',
            color: '#cccccc',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
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
        }).setOrigin(0.5);
        page.add(inputText);

        // 創建虛擬鍵盤
        const keyboardY = -pageHeight / 2 + 180;
        this.createVirtualKeyboard(page, 0, keyboardY, inputText);

        // 底部按鈕區域（Skip 和 Enter 按鈕）
        // 虛擬鍵盤有 4 行（3 行字母/數字 + 1 行底部按鈕）
        // 每行高度 = 40 + 4 = 44px
        // 總高度 = 44 * 4 = 176px
        // 加上鍵盤起始位置的偏移
        const buttonY = pageHeight / 2 - 30;

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
        // 初始化鍵盤狀態
        if (!this.keyboardState) {
            this.keyboardState = { isNumeric: false };
        }

        // 字母鍵盤
        const letterKeys = [
            ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
            ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
            ['↑', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', '←']
        ];

        // 數字鍵盤
        const numberKeys = [
            ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
            ['-', '/', ':', ';', '(', ')', '$', '&', '@', '"'],
            ['↑', '.', ',', '?', '!', "'", '←']
        ];

        const keyWidth = 35;
        const keyHeight = 40;
        const keySpacing = 4;

        // 保存鍵盤容器引用
        if (!this.keyboardContainer) {
            this.keyboardContainer = this.add.container(0, 0);
            container.add(this.keyboardContainer);
        } else {
            this.keyboardContainer.removeAll(true);
        }

        // 根據狀態選擇鍵盤
        const keysToDisplay = this.keyboardState.isNumeric ? numberKeys : letterKeys;

        // 創建鍵盤按鈕
        keysToDisplay.forEach((row, rowIndex) => {
            const rowWidth = row.length * (keyWidth + keySpacing) - keySpacing;
            const startX = x - rowWidth / 2 + keyWidth / 2;
            const keyY = y + rowIndex * (keyHeight + keySpacing);

            row.forEach((key, colIndex) => {
                const keyX = startX + colIndex * (keyWidth + keySpacing);
                this.createKeyButton(this.keyboardContainer, keyX, keyY, key, keyWidth, keyHeight, inputText);
            });
        });

        // 底部按鈕行（空格和模式切換）
        const bottomY = y + keysToDisplay.length * (keyHeight + keySpacing);

        // 模式切換按鈕（左側）
        const modeButtonText = this.keyboardState.isNumeric ? 'ABC' : '123';
        this.createKeyButton(this.keyboardContainer, x - 110, bottomY, modeButtonText, 70, keyHeight, inputText, true);

        // 空格鍵（中間）
        this.createKeyButton(this.keyboardContainer, x, bottomY, 'Space', 160, keyHeight, inputText);

        // 完成按鈕（右側）
        this.createKeyButton(this.keyboardContainer, x + 110, bottomY, '✓', 70, keyHeight, inputText, true);
    }

    // 🔥 創建鍵盤按鈕
    createKeyButton(container, x, y, key, width, height, inputText, isSpecialButton = false) {
        // 按鈕背景
        const buttonColor = isSpecialButton ? 0x3c3c3c : 0x4c4c4c;
        const buttonBg = this.add.rectangle(x, y, width, height, buttonColor);
        buttonBg.setStrokeStyle(2, 0x000000);
        buttonBg.setInteractive({ useHandCursor: true });
        container.add(buttonBg);

        // 按鈕文字
        const buttonText = this.add.text(x, y, key, {
            fontSize: isSpecialButton ? '16px' : '18px',
            color: '#ffffff',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        container.add(buttonText);

        // 點擊事件
        buttonBg.on('pointerdown', () => {
            if (isSpecialButton) {
                if (key === 'ABC' || key === '123') {
                    this.toggleKeyboardMode(inputText);
                } else if (key === '✓') {
                    this.submitPlayerName();
                }
            } else {
                this.handleKeyPress(key, inputText);
            }
        });

        // 懸停效果
        buttonBg.on('pointerover', () => {
            buttonBg.setFillStyle(isSpecialButton ? 0x4c4c4c : 0x5c5c5c);
        });
        buttonBg.on('pointerout', () => {
            buttonBg.setFillStyle(isSpecialButton ? 0x3c3c3c : 0x4c4c4c);
        });
    }

    // 🔥 切換鍵盤模式（字母 ↔ 數字）
    toggleKeyboardMode(inputText) {
        this.keyboardState.isNumeric = !this.keyboardState.isNumeric;
        console.log('🎮 切換鍵盤模式:', this.keyboardState.isNumeric ? '數字' : '字母');

        // 重新創建虛擬鍵盤
        const width = this.scale.width;
        const height = this.scale.height;
        const pageHeight = Math.min(500, height * 0.8);
        const keyboardY = -pageHeight / 2 + 220;

        this.createVirtualKeyboard(this.enterNamePage.page, 0, keyboardY, inputText);
    }

    // 🔥 處理按鍵輸入
    handleKeyPress(key, inputText) {
        if (key === '←') {
            // 退格鍵
            this.playerName = this.playerName.slice(0, -1);
        } else if (key === '↑') {
            // 大小寫切換（暫時不實現）
            console.log('🎮 切換大小寫');
        } else if (key === 'Space') {
            // 空格鍵
            if (this.playerName.length < 20) {
                this.playerName += ' ';
            }
        } else {
            // 普通字符（字母、數字、符號）
            if (this.playerName.length < 20) {
                this.playerName += key;
            }
        }
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
        const totalCorrect = this.correctCount;
        const totalQuestions = this.vocabulary.length;

        // 獲取 activityId
        const urlParams = new URLSearchParams(window.location.search);
        const activityId = urlParams.get('activityId');

        // 準備排行榜數據
        const leaderboardData = {
            activityId: activityId,
            playerName: this.playerName.trim(),
            score: totalCorrect,
            correctCount: totalCorrect,
            totalCount: totalQuestions,
            accuracy: totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0,
            timeSpent: this.timer,
            gameData: {
                results: this.registry.get('results'),
                timestamp: new Date().toISOString()
            }
        };

        console.log('🎮 排行榜數據:', leaderboardData);

        try {
            const response = await fetch('/api/leaderboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(leaderboardData)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ 排行榜數據已保存:', result);
                this.hideEnterNamePage();
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
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        overlay.setDepth(8000);

        // 創建排行榜頁面容器
        const pageWidth = Math.min(600, width * 0.9);
        const pageHeight = Math.min(700, height * 0.9);
        const page = this.add.container(width / 2, height / 2);
        page.setDepth(8001);

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
        }).setOrigin(0.5);
        page.add(title);

        // 載入排行榜數據
        try {
            const response = await fetch(`/api/leaderboard?activityId=${activityId}&limit=10`);
            if (response.ok) {
                const result = await response.json();
                const leaderboardData = result.data || [];
                console.log('✅ 排行榜數據:', leaderboardData);

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
                    }).setOrigin(0, 0.5);
                    page.add(rankText);

                    // 玩家名稱
                    const nameText = this.add.text(-pageWidth / 2 + 100, y, entry.playerName, {
                        fontSize: '20px',
                        color: isCurrentPlayer ? '#ffeb3b' : '#ffffff',
                        fontFamily: 'Arial'
                    }).setOrigin(0, 0.5);
                    page.add(nameText);

                    // 分數
                    const scoreText = this.add.text(pageWidth / 2 - 150, y, `${entry.score}/${entry.totalCount}`, {
                        fontSize: '20px',
                        color: isCurrentPlayer ? '#ffeb3b' : '#ffffff',
                        fontFamily: 'Arial'
                    }).setOrigin(1, 0.5);
                    page.add(scoreText);

                    // 時間
                    const timeText = this.add.text(pageWidth / 2 - 50, y, this.formatGameTime(entry.timeSpent), {
                        fontSize: '20px',
                        color: isCurrentPlayer ? '#ffeb3b' : '#ffffff',
                        fontFamily: 'Arial'
                    }).setOrigin(1, 0.5);
                    page.add(timeText);
                });

                if (leaderboardData.length === 0) {
                    const noDataText = this.add.text(0, 0, '暫無排行榜數據', {
                        fontSize: '20px',
                        color: '#aaaaaa',
                        fontFamily: 'Arial'
                    }).setOrigin(0.5);
                    page.add(noDataText);
                }
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
}

