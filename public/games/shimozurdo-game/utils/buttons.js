// 按鈕互動工具函數集合 - 提供遊戲中按鈕的滑鼠互動效果

/**
 * 滑鼠懸停效果函數 - 當滑鼠移到按鈕上時改變顏色
 * @param {Phaser.GameObjects} gameObjet - 要添加懸停效果的遊戲物件
 * @param {number} hex - 懸停時的色調值，預設為淡灰色 0xEFF0F1
 */
function pointerOver(gameObjet, hex = 0xEFF0F1) {
    // 監聽滑鼠移入事件，當滑鼠移到物件上時觸發
    gameObjet.on('pointerover', function () {
        // 設定物件的色調為指定的懸停顏色
        this.setTint(hex);
    });
    // 同時設定滑鼠移出效果，確保懸停狀態能正確清除
    pointerOut(gameObjet);
}

/**
 * 滑鼠移出效果函數 - 當滑鼠離開按鈕時恢復原色
 * @param {Phaser.GameObjects} gameObjet - 要添加移出效果的遊戲物件
 */
function pointerOut(gameObjet) {
    // 監聽滑鼠移出事件，當滑鼠離開物件時觸發
    gameObjet.on('pointerout', function () {
        // 清除物件的色調，恢復原始顏色
        this.clearTint();
    });
}

/**
 * 滑鼠點擊效果函數 - 當按鈕被點擊時執行回調函數
 * @param {Function} res - 點擊時要執行的回調函數，預設為空函數
 * @param {Phaser.GameObjects} gameObjet - 要添加點擊效果的遊戲物件
 */
function pointerUp(res = () => { }, gameObjet) {
    // 監聽滑鼠釋放事件，當滑鼠在物件上釋放時觸發
    gameObjet.on('pointerup', () => {
        // 執行傳入的回調函數，實現點擊功能
        res();
    });
}

// 導出所有按鈕互動函數，供其他模組使用
export {
    pointerOver,  // 滑鼠懸停效果
    pointerOut,   // 滑鼠移出效果
    pointerUp     // 滑鼠點擊效果
}