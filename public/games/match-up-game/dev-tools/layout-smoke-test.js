(function () {
    if (typeof window === 'undefined') {
        return;
    }

    if (window.matchUpDevTools) {
        return;
    }

    function restartGame(layoutMode = 'mixed') {
        const game = window.matchUpGame;
        if (!game || !game.scene) {
            console.warn('⚠️ matchUpDevTools: 遊戲尚未初始化，請稍後再試');
            return;
        }

        const scene = game.scene.keys?.GameScene;
        if (!scene) {
            console.warn('⚠️ matchUpDevTools: 找不到 GameScene，請確認遊戲已載入');
            return;
        }

        console.log('🧪 matchUpDevTools: 重新啟動遊戲進行佈局測試', layoutMode);
        scene.scene.restart({ devLayoutTest: layoutMode });
    }

    window.matchUpDevTools = {
        runLayoutSmokeTest(layoutMode = 'mixed') {
            restartGame(layoutMode);
        },
        cycleLayouts(delay = 4000) {
            restartGame('mixed');
            setTimeout(() => restartGame('separated'), delay);
        },
        help() {
            console.info([
                'matchUpDevTools.runLayoutSmokeTest("mixed" | "separated")  // 立即切換至對應佈局測試資料',
                'matchUpDevTools.cycleLayouts(毫秒)                         // 預設 4 秒後自動切換佈局',
                'matchUpDevTools.runLayoutSmokeTest("all")                  // 同 mixed，用於語意化呼叫'
            ].join('\n'));
        }
    };

    console.info('🧪 matchUpDevTools 已就緒。執行 matchUpDevTools.help() 取得操作說明。');
})();

