const { exec } = require('child_process');
const fs = require('fs');

console.log('🌐 創建公開隧道以便手機測試...');

// 檢查 ngrok 是否安裝
exec('ngrok version', (error, stdout, stderr) => {
    if (error) {
        console.log('❌ ngrok 未安裝，請先安裝 ngrok:');
        console.log('1. 訪問 https://ngrok.com/download');
        console.log('2. 下載並安裝 ngrok');
        console.log('3. 註冊帳號並獲取 authtoken');
        console.log('4. 運行: ngrok config add-authtoken YOUR_TOKEN');
        console.log('5. 然後重新運行此腳本');
        return;
    }

    console.log('✅ ngrok 已安裝:', stdout.trim());
    console.log('🚀 啟動 ngrok 隧道...');

    // 啟動 ngrok
    const ngrokProcess = exec('ngrok http 3000', (error, stdout, stderr) => {
        if (error) {
            console.log('❌ ngrok 啟動失敗:', error.message);
            return;
        }
    });

    // 等待 ngrok 啟動
    setTimeout(() => {
        // 獲取 ngrok 狀態
        exec('curl -s http://localhost:4040/api/tunnels', (error, stdout, stderr) => {
            if (error) {
                console.log('⚠️ 無法獲取 ngrok 狀態，請手動檢查:');
                console.log('訪問 http://localhost:4040 查看 ngrok 狀態');
                return;
            }

            try {
                const data = JSON.parse(stdout);
                const tunnel = data.tunnels.find(t => t.config.addr === 'http://localhost:3000');
                
                if (tunnel) {
                    const publicUrl = tunnel.public_url;
                    console.log('🎉 公開隧道已創建！');
                    console.log('📱 手機測試地址:', publicUrl + '/mobile-postmessage-test.html');
                    console.log('🔗 ngrok 管理界面:', 'http://localhost:4040');
                    
                    // 保存地址到文件
                    fs.writeFileSync('public-tunnel-url.txt', publicUrl + '/mobile-postmessage-test.html');
                    console.log('💾 地址已保存到 public-tunnel-url.txt');
                    
                    console.log('\n📋 測試步驟:');
                    console.log('1. 在手機瀏覽器中打開上面的地址');
                    console.log('2. 等待遊戲載入完成');
                    console.log('3. 點擊遊戲內的 ⛶ 按鈕');
                    console.log('4. 觀察是否還有無限循環問題');
                    console.log('5. 按 Ctrl+C 停止隧道');
                } else {
                    console.log('❌ 未找到隧道，請檢查 ngrok 狀態');
                }
            } catch (e) {
                console.log('❌ 解析 ngrok 狀態失敗:', e.message);
            }
        });
    }, 3000);

    // 處理退出
    process.on('SIGINT', () => {
        console.log('\n🛑 停止 ngrok 隧道...');
        ngrokProcess.kill();
        process.exit();
    });
});
