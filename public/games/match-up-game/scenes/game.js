// Game 場景 - 主遊戲邏輯
class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
        
        // 配對數據
        this.pairs = [
            { id: 1, question: 'book', answer: '書' },
            { id: 2, question: 'cat', answer: '貓' },
            { id: 3, question: 'dog', answer: '狗' }
        ];
        
        // 遊戲狀態
        this.selectedLeft = null;
        this.selectedRight = null;
        this.matchedPairs = new Set();
        this.cards = [];
    }

    create() {
        // 添加標題
        this.add.text(480, 40, 'Match-up Game', {
            fontSize: '36px',
            color: '#333333',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // 添加說明
        this.add.text(480, 90, '點擊左右兩側的卡片進行配對', {
            fontSize: '20px',
            color: '#666666',
            fontFamily: 'Arial'
        }).setOrigin(0.5);

        // 創建卡片
        this.createCards();

        // 添加重新開始按鈕
        this.createRestartButton();
    }

    createCards() {
        const cardWidth = 200;
        const cardHeight = 80;
        const leftX = 200;
        const rightX = 760;
        const startY = 180;
        const spacing = 100;

        // 隨機排列答案
        const shuffledAnswers = Phaser.Utils.Array.Shuffle([...this.pairs]);

        // 創建左側題目卡片
        this.pairs.forEach((pair, index) => {
            const y = startY + index * spacing;
            const card = this.createCard(leftX, y, cardWidth, cardHeight, pair.question, pair.id, 'left');
            this.cards.push(card);
        });

        // 創建右側答案卡片
        shuffledAnswers.forEach((pair, index) => {
            const y = startY + index * spacing;
            const card = this.createCard(rightX, y, cardWidth, cardHeight, pair.answer, pair.id, 'right');
            this.cards.push(card);
        });
    }

    createCard(x, y, width, height, text, pairId, side) {
        // 創建卡片容器
        const container = this.add.container(x, y);

        // 創建卡片背景（白色，帶陰影效果）
        const background = this.add.rectangle(0, 0, width, height, 0xffffff);
        background.setStrokeStyle(2, 0xcccccc);

        // 創建卡片文字
        const cardText = this.add.text(0, 0, text, {
            fontSize: '24px',
            color: '#333333',
            fontFamily: 'Arial',
            fontStyle: 'bold'
        });
        cardText.setOrigin(0.5);

        // 添加到容器
        container.add([background, cardText]);

        // 設置互動
        background.setInteractive({ useHandCursor: true });
        background.on('pointerdown', () => this.onCardClick(container, pairId, side));

        // 懸停效果
        background.on('pointerover', () => {
            if (!container.getData('isMatched')) {
                background.setStrokeStyle(3, 0xfe7606); // 橙色邊框
            }
        });
        background.on('pointerout', () => {
            if (!container.getData('isMatched') && container !== this.selectedLeft && container !== this.selectedRight) {
                background.setStrokeStyle(2, 0xcccccc);
            }
        });

        // 儲存卡片數據
        container.setData({
            pairId: pairId,
            side: side,
            background: background,
            text: cardText,
            isMatched: false
        });

        return container;
    }

    onCardClick(card, pairId, side) {
        // 如果已經配對，不處理
        if (card.getData('isMatched')) {
            return;
        }

        // 如果是左側卡片
        if (side === 'left') {
            // 取消之前的選擇
            if (this.selectedLeft) {
                this.selectedLeft.getData('background').setFillStyle(0xffffff);
                this.selectedLeft.getData('background').setStrokeStyle(2, 0xcccccc);
            }

            // 選擇當前卡片
            this.selectedLeft = card;
            card.getData('background').setFillStyle(0xfff3e0); // 淺橙色高亮
            card.getData('background').setStrokeStyle(3, 0xfe7606); // 橙色邊框
        }
        // 如果是右側卡片
        else {
            // 取消之前的選擇
            if (this.selectedRight) {
                this.selectedRight.getData('background').setFillStyle(0xffffff);
                this.selectedRight.getData('background').setStrokeStyle(2, 0xcccccc);
            }

            // 選擇當前卡片
            this.selectedRight = card;
            card.getData('background').setFillStyle(0xfff3e0); // 淺橙色高亮
            card.getData('background').setStrokeStyle(3, 0xfe7606); // 橙色邊框
        }

        // 檢查是否可以配對
        this.checkMatch();
    }

    checkMatch() {
        // 如果左右都有選擇
        if (this.selectedLeft && this.selectedRight) {
            const leftId = this.selectedLeft.getData('pairId');
            const rightId = this.selectedRight.getData('pairId');

            // 檢查是否配對成功
            if (leftId === rightId) {
                // 配對成功
                this.onMatchSuccess();
            } else {
                // 配對失敗
                this.onMatchFail();
            }
        }
    }

    onMatchSuccess() {
        // 標記為已配對
        this.selectedLeft.setData('isMatched', true);
        this.selectedRight.setData('isMatched', true);
        this.matchedPairs.add(this.selectedLeft.getData('pairId'));

        // 變成淺綠色（Classic 主題）
        this.selectedLeft.getData('background').setFillStyle(0xe8f5e9);
        this.selectedRight.getData('background').setFillStyle(0xe8f5e9);
        this.selectedLeft.getData('background').setStrokeStyle(2, 0x4caf50);
        this.selectedRight.getData('background').setStrokeStyle(2, 0x4caf50);

        // 縮放動畫
        this.tweens.add({
            targets: [this.selectedLeft, this.selectedRight],
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 200,
            yoyo: true,
            ease: 'Power2'
        });

        // 清除選擇
        this.selectedLeft = null;
        this.selectedRight = null;

        // 檢查是否全部配對完成
        if (this.matchedPairs.size === this.pairs.length) {
            this.onGameComplete();
        }
    }

    onMatchFail() {
        // 變成淺紅色（Classic 主題）
        this.selectedLeft.getData('background').setFillStyle(0xffebee);
        this.selectedRight.getData('background').setFillStyle(0xffebee);
        this.selectedLeft.getData('background').setStrokeStyle(2, 0xf44336);
        this.selectedRight.getData('background').setStrokeStyle(2, 0xf44336);

        // 搖晃動畫
        this.tweens.add({
            targets: [this.selectedLeft, this.selectedRight],
            x: '+=10',
            duration: 50,
            yoyo: true,
            repeat: 3,
            ease: 'Power2',
            onComplete: () => {
                // 恢復白色
                if (this.selectedLeft) {
                    this.selectedLeft.getData('background').setFillStyle(0xffffff);
                    this.selectedLeft.getData('background').setStrokeStyle(2, 0xcccccc);
                }
                if (this.selectedRight) {
                    this.selectedRight.getData('background').setFillStyle(0xffffff);
                    this.selectedRight.getData('background').setStrokeStyle(2, 0xcccccc);
                }

                // 清除選擇
                this.selectedLeft = null;
                this.selectedRight = null;
            }
        });
    }

    onGameComplete() {
        // 顯示完成訊息（Classic 主題）
        const completeText = this.add.text(480, 270, '🎉 完成！', {
            fontSize: '48px',
            color: '#4caf50',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            backgroundColor: '#e8f5e9',
            padding: { x: 30, y: 15 }
        });
        completeText.setOrigin(0.5);

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
    }

    createRestartButton() {
        // 創建重新開始按鈕（Classic 主題）
        const button = this.add.text(480, 500, '🔄 重新開始', {
            fontSize: '24px',
            color: '#fe7606',
            fontFamily: 'Arial',
            backgroundColor: '#fff3e0',
            padding: { x: 25, y: 12 }
        });
        button.setOrigin(0.5);
        button.setInteractive({ useHandCursor: true });

        // 懸停效果
        button.on('pointerover', () => {
            button.setScale(1.05);
            button.setStyle({ backgroundColor: '#ffe0b2' });
        });
        button.on('pointerout', () => {
            button.setScale(1);
            button.setStyle({ backgroundColor: '#fff3e0' });
        });

        // 點擊重新開始
        button.on('pointerdown', () => {
            this.scene.restart();
        });
    }
}

