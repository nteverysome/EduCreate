/**
 * 自動翻譯 GEPT 詞彙並更新資料庫
 * 
 * 使用 Google Cloud Translation API 翻譯英文單字為中文
 * 並將翻譯結果存儲到資料庫
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Google Cloud Translation API 配置
// 注意: 需要設置 GOOGLE_CLOUD_API_KEY 環境變數
const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_CLOUD_API_KEY || process.env.GOOGLE_API_KEY;
const TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2';

/**
 * 使用 Google Translate API 翻譯文本
 */
async function translateText(text, targetLang = 'zh-TW') {
  if (!GOOGLE_TRANSLATE_API_KEY) {
    console.log('⚠️  未設置 GOOGLE_CLOUD_API_KEY,使用本地字典');
    return null;
  }

  try {
    const url = `${TRANSLATE_API_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        target: targetLang,
        format: 'text'
      })
    });

    if (!response.ok) {
      throw new Error(`API 錯誤: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.translations[0].translatedText;
  } catch (error) {
    console.error(`❌ 翻譯失敗 "${text}":`, error.message);
    return null;
  }
}

/**
 * 批量翻譯 (每次最多 128 個單字)
 */
async function batchTranslate(texts, targetLang = 'zh-TW') {
  if (!GOOGLE_TRANSLATE_API_KEY) {
    return texts.map(() => null);
  }

  try {
    const url = `${TRANSLATE_API_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: texts,
        target: targetLang,
        format: 'text'
      })
    });

    if (!response.ok) {
      throw new Error(`API 錯誤: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.translations.map(t => t.translatedText);
  } catch (error) {
    console.error(`❌ 批量翻譯失敗:`, error.message);
    return texts.map(() => null);
  }
}

/**
 * 本地中英字典 (常用 200 個單字)
 */
const localDictionary = {
  // 基礎詞彙
  'apple': '蘋果', 'banana': '香蕉', 'cat': '貓', 'dog': '狗', 'elephant': '大象',
  'fish': '魚', 'girl': '女孩', 'house': '房子', 'ice': '冰', 'juice': '果汁',
  'kite': '風箏', 'lion': '獅子', 'monkey': '猴子', 'nose': '鼻子', 'orange': '橙子',
  'pen': '筆', 'queen': '女王', 'rabbit': '兔子', 'sun': '太陽', 'tree': '樹',
  'umbrella': '雨傘', 'van': '貨車', 'water': '水', 'box': '盒子', 'yellow': '黃色',
  'zoo': '動物園', 'book': '書', 'chair': '椅子', 'desk': '書桌', 'egg': '蛋',
  
  // 常用動詞
  'eat': '吃', 'drink': '喝', 'run': '跑', 'walk': '走', 'jump': '跳',
  'read': '讀', 'write': '寫', 'play': '玩', 'sleep': '睡', 'work': '工作',
  'study': '學習', 'teach': '教', 'learn': '學', 'speak': '說', 'listen': '聽',
  'watch': '看', 'see': '看見', 'look': '看', 'hear': '聽見', 'feel': '感覺',
  
  // 常用形容詞
  'big': '大的', 'small': '小的', 'good': '好的', 'bad': '壞的', 'happy': '快樂的',
  'sad': '悲傷的', 'hot': '熱的', 'cold': '冷的', 'new': '新的', 'old': '舊的',
  'young': '年輕的', 'beautiful': '美麗的', 'ugly': '醜陋的', 'fast': '快的', 'slow': '慢的',
  
  // 數字
  'one': '一', 'two': '二', 'three': '三', 'four': '四', 'five': '五',
  'six': '六', 'seven': '七', 'eight': '八', 'nine': '九', 'ten': '十',
  
  // 顏色
  'red': '紅色', 'blue': '藍色', 'green': '綠色', 'white': '白色', 'black': '黑色',
  
  // 家庭
  'father': '父親', 'mother': '母親', 'brother': '兄弟', 'sister': '姐妹', 'family': '家庭',
  
  // 學校
  'school': '學校', 'teacher': '老師', 'student': '學生', 'class': '班級', 'lesson': '課程',
  
  // 時間
  'day': '天', 'night': '夜晚', 'morning': '早上', 'afternoon': '下午', 'evening': '晚上',
  'today': '今天', 'tomorrow': '明天', 'yesterday': '昨天', 'week': '週', 'month': '月',
  'year': '年', 'time': '時間', 'hour': '小時', 'minute': '分鐘', 'second': '秒',
  
  // 地點
  'home': '家', 'city': '城市', 'country': '國家', 'park': '公園', 'street': '街道',
  'shop': '商店', 'market': '市場', 'hospital': '醫院', 'library': '圖書館', 'station': '車站',
  
  // 食物
  'food': '食物', 'rice': '米飯', 'bread': '麵包', 'meat': '肉', 'vegetable': '蔬菜',
  'fruit': '水果', 'milk': '牛奶', 'tea': '茶', 'coffee': '咖啡', 'cake': '蛋糕',
  
  // 身體部位
  'head': '頭', 'eye': '眼睛', 'ear': '耳朵', 'mouth': '嘴巴', 'hand': '手',
  'foot': '腳', 'leg': '腿', 'arm': '手臂', 'body': '身體', 'face': '臉',
  
  // 天氣
  'weather': '天氣', 'rain': '雨', 'snow': '雪', 'wind': '風', 'cloud': '雲',
  'sunny': '晴朗的', 'cloudy': '多雲的', 'rainy': '下雨的', 'windy': '有風的',
  
  // 交通
  'car': '汽車', 'bus': '公車', 'train': '火車', 'plane': '飛機', 'bike': '自行車',
  'boat': '船', 'taxi': '計程車', 'subway': '地鐵',
  
  // 其他常用詞
  'yes': '是', 'no': '不', 'please': '請', 'thank': '謝謝', 'sorry': '對不起',
  'hello': '你好', 'goodbye': '再見', 'name': '名字', 'age': '年齡', 'friend': '朋友',
  'love': '愛', 'like': '喜歡', 'want': '想要', 'need': '需要', 'have': '有',
  'make': '製作', 'take': '拿', 'give': '給', 'get': '得到', 'go': '去',
  'come': '來', 'know': '知道', 'think': '想', 'say': '說', 'tell': '告訴',
  
  // 新增的單字
  'difficulty': '困難', 'station': '車站', 'seat': '座位', 'hike': '徒步旅行',
  'east': '東方', 'fear': '恐懼', 'expect': '期待'
};

/**
 * 獲取翻譯 (優先使用本地字典,然後使用 API)
 */
async function getTranslation(word) {
  // 1. 檢查本地字典
  const localTranslation = localDictionary[word.toLowerCase()];
  if (localTranslation) {
    return localTranslation;
  }

  // 2. 使用 Google Translate API
  if (GOOGLE_TRANSLATE_API_KEY) {
    const apiTranslation = await translateText(word);
    if (apiTranslation) {
      return apiTranslation;
    }
  }

  // 3. 返回 null (未找到翻譯)
  return null;
}

/**
 * 主函數
 */
async function main() {
  console.log('=== GEPT 詞彙翻譯工具 ===\n');

  // 檢查 API Key
  if (GOOGLE_TRANSLATE_API_KEY) {
    console.log('✅ 已設置 Google Translate API Key');
  } else {
    console.log('⚠️  未設置 Google Translate API Key,只使用本地字典');
    console.log('   提示: 設置環境變數 GOOGLE_CLOUD_API_KEY 以啟用 API 翻譯\n');
  }

  // 1. 從 TTSCache 獲取所有英文單字
  console.log('📚 從資料庫獲取英文單字...');
  const words = await prisma.tTSCache.findMany({
    where: {
      language: 'en-US'
    },
    select: {
      id: true,
      text: true,
      geptLevel: true
    }
  });

  console.log(`   找到 ${words.length} 個英文單字\n`);

  // 2. 創建翻譯結果文件
  const outputPath = path.join(__dirname, '../data/translations/gept-translations.json');
  const outputDir = path.dirname(outputPath);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 3. 翻譯單字
  console.log('🔄 開始翻譯...\n');
  const translations = {};
  let translatedCount = 0;
  let localCount = 0;
  let apiCount = 0;
  let failedCount = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const progress = ((i + 1) / words.length * 100).toFixed(2);
    
    // 獲取翻譯
    const translation = await getTranslation(word.text);
    
    if (translation) {
      translations[word.text] = translation;
      translatedCount++;
      
      // 判斷翻譯來源
      if (localDictionary[word.text.toLowerCase()]) {
        localCount++;
        console.log(`[${progress}%] ✅ ${word.text} → ${translation} (本地)`);
      } else {
        apiCount++;
        console.log(`[${progress}%] ✅ ${word.text} → ${translation} (API)`);
      }
    } else {
      failedCount++;
      console.log(`[${progress}%] ❌ ${word.text} (未找到翻譯)`);
    }

    // 每 10 個單字暫停一下,避免 API 限流
    if ((i + 1) % 10 === 0 && GOOGLE_TRANSLATE_API_KEY) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  // 4. 保存翻譯結果
  console.log('\n💾 保存翻譯結果...');
  fs.writeFileSync(outputPath, JSON.stringify(translations, null, 2), 'utf-8');
  console.log(`   已保存到: ${outputPath}\n`);

  // 5. 統計
  console.log('=== 翻譯統計 ===');
  console.log(`總單字數: ${words.length}`);
  console.log(`成功翻譯: ${translatedCount} (${(translatedCount / words.length * 100).toFixed(2)}%)`);
  console.log(`  - 本地字典: ${localCount}`);
  console.log(`  - API 翻譯: ${apiCount}`);
  console.log(`翻譯失敗: ${failedCount}`);

  await prisma.$disconnect();
}

main().catch(console.error);

