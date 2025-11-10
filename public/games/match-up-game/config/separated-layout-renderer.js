/**
 * 分離模式佈局渲染器
 *
 * 統一的佈局渲染邏輯
 * 支持所有佈局變體和設備類型
 */

// 防止重複聲明
if (typeof SeparatedLayoutRenderer === 'undefined') {
    class SeparatedLayoutRenderer {
        /**
         * 構造函數
         *
         * @param {Phaser.Scene} scene - Phaser 場景
         * @param {SeparatedLayoutCalculator} calculator - 佈局計算器
         */
        constructor(scene, calculator) {
            this.scene = scene;
            this.calculator = calculator;
            this.cards = [];
        }

        /**
         * 渲染單列佈局（左右分離）
         *
         * @param {Array} pairs - 卡片對數據
         * @param {object} options - 選項
         * @returns {Array} 創建的卡片數組
         */
        renderSingleColumn(pairs, options = {}) {
            const {
                leftX = 0,
                rightX = 0,
                leftStartY = 0,
                rightStartY = 0,
                cardWidth = 100,
                cardHeight = 50,
                leftSpacing = 10,
                rightSpacing = 10,
                hasImages = false
            } = options;

            this.cards = [];

            // 計算左右側卡片
            const leftCards = [];
            const rightCards = [];

            pairs.forEach((pair, index) => {
                if (index % 2 === 0) {
                    leftCards.push(pair);
                } else {
                    rightCards.push(pair);
                }
            });

            // 渲染左側卡片
            leftCards.forEach((card, index) => {
                const y = leftStartY + index * (cardHeight + leftSpacing);
                this._createCard(card, leftX, y, cardWidth, cardHeight, hasImages);
            });

            // 渲染右側卡片
            rightCards.forEach((card, index) => {
                const y = rightStartY + index * (cardHeight + rightSpacing);
                this._createCard(card, rightX, y, cardWidth, cardHeight, hasImages);
            });

            return this.cards;
        }

        /**
         * 渲染多行佈局
         *
         * @param {Array} pairs - 卡片對數據
         * @param {object} options - 選項
         * @returns {Array} 創建的卡片數組
         */
        renderMultiRows(pairs, options = {}) {
            const {
                startX = 0,
                startY = 0,
                cardWidth = 100,
                cardHeight = 50,
                horizontalSpacing = 10,
                verticalSpacing = 10,
                columns = 2,
                hasImages = false
            } = options;

            this.cards = [];

            pairs.forEach((card, index) => {
                const col = index % columns;
                const row = Math.floor(index / columns);

                const x = startX + col * (cardWidth + horizontalSpacing);
                const y = startY + row * (cardHeight + verticalSpacing);

                this._createCard(card, x, y, cardWidth, cardHeight, hasImages);
            });

            return this.cards;
        }

        /**
         * 渲染上下分離佈局
         *
         * @param {Array} pairs - 卡片對數據
         * @param {object} options - 選項
         * @returns {Array} 創建的卡片數組
         */
        renderTopBottom(pairs, options = {}) {
            const {
                topStartX = 0,
                topStartY = 0,
                bottomStartX = 0,
                bottomStartY = 0,
                cardWidth = 100,
                cardHeight = 50,
                horizontalSpacing = 10,
                verticalSpacing = 10,
                topColumns = 3,
                bottomColumns = 3,
                hasImages = false
            } = options;

            this.cards = [];

            const topCount = Math.ceil(pairs.length / 2);
            const topPairs = pairs.slice(0, topCount);
            const bottomPairs = pairs.slice(topCount);

            // 渲染上方卡片
            topPairs.forEach((card, index) => {
                const col = index % topColumns;
                const row = Math.floor(index / topColumns);

                const x = topStartX + col * (cardWidth + horizontalSpacing);
                const y = topStartY + row * (cardHeight + verticalSpacing);

                this._createCard(card, x, y, cardWidth, cardHeight, hasImages);
            });

            // 渲染下方卡片
            bottomPairs.forEach((card, index) => {
                const col = index % bottomColumns;
                const row = Math.floor(index / bottomColumns);

                const x = bottomStartX + col * (cardWidth + horizontalSpacing);
                const y = bottomStartY + row * (cardHeight + verticalSpacing);

                this._createCard(card, x, y, cardWidth, cardHeight, hasImages);
            });

            return this.cards;
        }

        /**
         * 創建單個卡片
         *
         * @private
         * @param {object} cardData - 卡片數據
         * @param {number} x - X 位置
         * @param {number} y - Y 位置
         * @param {number} width - 寬度
         * @param {number} height - 高度
         * @param {boolean} hasImages - 是否有圖片
         */
        _createCard(cardData, x, y, width, height, hasImages) {
            // 創建卡片背景
            const card = this.scene.add.rectangle(x, y, width, height, 0xffffff);
            card.setStrokeStyle(2, 0x000000);
            card.setOrigin(0.5);

            // 添加卡片數據
            card.cardData = cardData;
            card.isFlipped = false;

            // 添加圖片（如果有）
            if (hasImages && cardData.image) {
                this._addCardImage(card, cardData.image, width, height);
            }

            // 添加文字
            if (cardData.text) {
                const fontSize = this.calculator.calculateFontSize(height, cardData.text);
                this._addCardText(card, cardData.text, fontSize);
            }

            this.cards.push(card);
        }

        /**
         * 添加卡片圖片
         *
         * @private
         * @param {Phaser.GameObjects.Rectangle} card - 卡片對象
         * @param {string} imageKey - 圖片鍵
         * @param {number} width - 卡片寬度
         * @param {number} height - 卡片高度
         */
        _addCardImage(card, imageKey, width, height) {
            try {
                const image = this.scene.add.image(card.x, card.y, imageKey);
                image.setDisplaySize(width * 0.8, height * 0.8);
                image.setOrigin(0.5);
                card.image = image;
            } catch (error) {
                console.warn(`Failed to add image ${imageKey}:`, error);
            }
        }

        /**
         * 添加卡片文字
         *
         * @private
         * @param {Phaser.GameObjects.Rectangle} card - 卡片對象
         * @param {string} text - 文字內容
         * @param {number} fontSize - 字體大小
         */
        _addCardText(card, text, fontSize) {
            const textObj = this.scene.add.text(card.x, card.y, text, {
                fontSize: `${fontSize}px`,
                fill: '#000000',
                align: 'center',
                wordWrap: { width: card.width * 0.9 }
            });
            textObj.setOrigin(0.5);
            card.text = textObj;
        }

        /**
         * 清除所有卡片
         */
        clear() {
            this.cards.forEach(card => {
                if (card.image) card.image.destroy();
                if (card.text) card.text.destroy();
                card.destroy();
            });
            this.cards = [];
        }

        /**
         * 獲取所有卡片
         *
         * @returns {Array} 卡片數組
         */
        getCards() {
            return this.cards;
        }

        /**
         * 獲取卡片數量
         *
         * @returns {number} 卡片數量
         */
        getCardCount() {
            return this.cards.length;
        }
    }

    // 導出到全局作用域
    if (typeof window !== 'undefined') {
        window.SeparatedLayoutRenderer = SeparatedLayoutRenderer;
    }

    // 導出到 Node.js
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = SeparatedLayoutRenderer;
    }
}

