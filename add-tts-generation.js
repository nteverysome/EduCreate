const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'public/games/match-up-game/scenes/game.js');
let content = fs.readFileSync(filePath, 'utf-8');

// 檢查是否已經有 generateMissingAudioUrls
if (content.includes('generateMissingAudioUrls')) {
  console.log('✅ 已經包含 generateMissingAudioUrls，無需修改');
  process.exit(0);
}

// 第一個修改：在詞彙轉換後添加調用
const firstReplace = `                this.audioDiagnostics = this.buildAudioDiagnostics(this.pairs);
                window.matchUpAudioDiagnostics = this.audioDiagnostics;

                console.log('✅ 詞彙數據轉換完成:', {
                    totalPairs: this.pairs.length,
                    firstPair: this.pairs[0],
                    hasImages: this.pairs.some(p => p.imageUrl || p.chineseImageUrl)
                });`;

const firstReplaceNew = `                // 🔥 自動為缺失的音頻生成 TTS
                await this.generateMissingAudioUrls();

                this.audioDiagnostics = this.buildAudioDiagnostics(this.pairs);
                window.matchUpAudioDiagnostics = this.audioDiagnostics;

                console.log('✅ 詞彙數據轉換完成:', {
                    totalPairs: this.pairs.length,
                    firstPair: this.pairs[0],
                    hasImages: this.pairs.some(p => p.imageUrl || p.chineseImageUrl),
                    hasAudio: this.pairs.some(p => p.audioUrl)
                });`;

content = content.replace(firstReplace, firstReplaceNew);

// 第二個修改：添加 generateMissingAudioUrls 函數
const functionToAdd = `    // 🔥 輔助函數 - 為缺失的音頻生成 TTS
    async generateMissingAudioUrls() {
        console.log('🎵 開始檢查並生成缺失的音頻...');
        
        const missingAudioPairs = this.pairs.filter(pair => !pair.audioUrl);
        
        if (missingAudioPairs.length === 0) {
            console.log('✅ 所有詞彙都有音頻，無需生成');
            return;
        }
        
        console.log(\`⏳ 發現 \${missingAudioPairs.length} 個缺失音頻的詞彙，開始生成...\`);
        
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
                        console.log(\`✅ 生成音頻: \${pair.english}\`);
                    } else {
                        console.warn(\`⚠️ 生成音頻失敗: \${pair.english} (\${response.status})\`);
                    }
                } catch (error) {
                    console.error(\`❌ 生成音頻異常: \${pair.english}\`, error);
                }
                
                // 避免 API 限制，每個請求之間等待 200ms
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            
            console.log('✅ 音頻生成完成');
        } catch (error) {
            console.error('❌ 生成缺失音頻時出錯:', error);
        }
    }

`;

// 在 createAudioButton 之前插入函數
const insertPoint = '    // 🔥 輔助函數 - 創建語音按鈕';
content = content.replace(insertPoint, functionToAdd + insertPoint);

// 寫入文件
fs.writeFileSync(filePath, content, 'utf-8');
console.log('✅ 文件已修改並保存');

