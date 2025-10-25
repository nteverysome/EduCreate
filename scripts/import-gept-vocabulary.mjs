import { PrismaClient } from '@prisma/client';
import { syllable } from 'syllable';
import fs from 'fs';

const prisma = new PrismaClient();

// 解析 GEPT 翻譯數據
function parseGEPTTranslation(value) {
  // 範例格式: "art. 一(個) 後接母音開頭之字時為  an 初級"
  // 範例格式: "noun 能力"
  // 範例格式: "adj. 能夠的"
  // 範例格式: "prep./adv. 大約、關於"
  
  const parts = value.split(/\s+/);
  let partOfSpeech = null;
  let chinese = '';
  let geptLevel = null;
  
  // 提取詞性
  const posMap = {
    'noun': 'NOUN',
    'n.': 'NOUN',
    'verb': 'VERB',
    'v.': 'VERB',
    'adj.': 'ADJECTIVE',
    'adjective': 'ADJECTIVE',
    'adv.': 'ADVERB',
    'adverb': 'ADVERB',
    'prep.': 'PREPOSITION',
    'preposition': 'PREPOSITION',
    'conj.': 'CONJUNCTION',
    'conjunction': 'CONJUNCTION',
    'pron.': 'PRONOUN',
    'pronoun': 'PRONOUN',
    'art.': 'ARTICLE',
    'article': 'ARTICLE',
    'interj.': 'INTERJECTION',
    'interjection': 'INTERJECTION'
  };
  
  // 檢查第一個詞是否是詞性
  const firstWord = parts[0].toLowerCase();
  if (posMap[firstWord]) {
    partOfSpeech = posMap[firstWord];
    parts.shift(); // 移除詞性
  } else if (firstWord.includes('/')) {
    // 處理 "prep./adv." 這種情況，取第一個
    const firstPos = firstWord.split('/')[0];
    if (posMap[firstPos]) {
      partOfSpeech = posMap[firstPos];
      parts.shift();
    }
  }
  
  // 提取中文翻譯和 GEPT 等級
  const remainingText = parts.join(' ');
  
  // 檢查是否包含 GEPT 等級
  if (remainingText.includes('初級')) {
    geptLevel = 'ELEMENTARY';
    chinese = remainingText.replace(/初級.*$/, '').trim();
  } else if (remainingText.includes('中高級')) {
    geptLevel = 'HIGH_INTERMEDIATE';
    chinese = remainingText.replace(/中高級.*$/, '').trim();
  } else if (remainingText.includes('中級')) {
    geptLevel = 'INTERMEDIATE';
    chinese = remainingText.replace(/中級.*$/, '').trim();
  } else {
    chinese = remainingText.trim();
  }
  
  return { partOfSpeech, chinese, geptLevel };
}

// 情感色彩判斷
function guessEmotionalTone(english, chinese) {
  const positiveWords = ['happy', 'joy', 'love', 'good', 'great', 'wonderful', 'excellent', 'beautiful', 'nice', 'kind', 'friend', 'smile', 'laugh', 'success', 'win', 'hope', 'peace', 'safe', 'healthy', 'clean', 'bright', 'warm', 'sweet'];
  const negativeWords = ['sad', 'angry', 'hate', 'bad', 'terrible', 'awful', 'ugly', 'mean', 'enemy', 'cry', 'fear', 'fail', 'lose', 'war', 'danger', 'sick', 'dirty', 'dark', 'cold', 'bitter', 'pain', 'hurt'];
  
  const word = english.toLowerCase();
  
  if (positiveWords.some(pw => word.includes(pw))) {
    return 'positive';
  }
  if (negativeWords.some(nw => word.includes(nw))) {
    return 'negative';
  }
  
  const positiveChinese = ['快樂', '高興', '喜歡', '愛', '好', '美', '棒', '優秀', '成功', '勝利', '希望', '和平', '安全', '健康', '乾淨', '明亮', '溫暖', '甜'];
  const negativeChinese = ['悲傷', '生氣', '討厭', '恨', '壞', '醜', '失敗', '戰爭', '危險', '生病', '髒', '黑暗', '寒冷', '苦', '痛'];
  
  if (positiveChinese.some(pc => chinese.includes(pc))) {
    return 'positive';
  }
  if (negativeChinese.some(nc => chinese.includes(nc))) {
    return 'negative';
  }
  
  return 'neutral';
}

// 動作類型判斷
function guessActionType(english, partOfSpeech) {
  if (partOfSpeech !== 'VERB') {
    return null;
  }
  
  const movementWords = ['walk', 'run', 'jump', 'fly', 'swim', 'climb', 'move', 'go', 'come', 'travel', 'ride', 'drive', 'dance', 'skip', 'hop'];
  const handWords = ['write', 'draw', 'hold', 'catch', 'throw', 'push', 'pull', 'grab', 'touch', 'pick', 'carry', 'lift', 'drop'];
  const thinkingWords = ['think', 'know', 'understand', 'remember', 'forget', 'believe', 'imagine', 'decide', 'choose', 'learn', 'study'];
  const sensoryWords = ['see', 'hear', 'smell', 'taste', 'touch', 'feel', 'look', 'listen', 'watch'];
  
  const word = english.toLowerCase();
  
  if (movementWords.some(mw => word.includes(mw))) {
    return 'movement';
  }
  if (handWords.some(hw => word.includes(hw))) {
    return 'hand';
  }
  if (thinkingWords.some(tw => word.includes(tw))) {
    return 'thinking';
  }
  if (sensoryWords.some(sw => word.includes(sw))) {
    return 'sensory';
  }
  
  return null;
}

// 視覺特徵判斷
function guessVisualFeature(english, chinese) {
  const colorWords = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'orange', 'purple', 'pink', 'brown', 'gray', 'grey'];
  const shapeWords = ['circle', 'square', 'triangle', 'rectangle', 'round', 'oval', 'star'];
  const sizeWords = ['big', 'small', 'large', 'tiny', 'huge', 'little', 'giant', 'mini'];
  const materialWords = ['wood', 'metal', 'plastic', 'glass', 'paper', 'stone', 'rock', 'iron', 'steel', 'gold', 'silver'];
  
  const word = english.toLowerCase();
  
  if (colorWords.some(cw => word.includes(cw)) || chinese.includes('色')) {
    return 'color';
  }
  if (shapeWords.some(sw => word.includes(sw)) || chinese.includes('形')) {
    return 'shape';
  }
  if (sizeWords.some(sw => word.includes(sw)) || chinese.includes('大') || chinese.includes('小')) {
    return 'size';
  }
  if (materialWords.some(mw => word.includes(mw))) {
    return 'material';
  }
  
  return null;
}

// 時間類別判斷
function guessTemporalCategory(english, chinese) {
  const timePointWords = ['morning', 'noon', 'afternoon', 'evening', 'night', 'today', 'yesterday', 'tomorrow', 'now', 'then'];
  const seasonWords = ['spring', 'summer', 'autumn', 'fall', 'winter'];
  const monthWords = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
  const durationWords = ['second', 'minute', 'hour', 'day', 'week', 'month', 'year', 'time', 'moment', 'period'];
  
  const word = english.toLowerCase();
  
  if (timePointWords.some(tw => word.includes(tw))) {
    return 'time_point';
  }
  if (seasonWords.some(sw => word.includes(sw))) {
    return 'season';
  }
  if (monthWords.some(mw => word.includes(mw))) {
    return 'month';
  }
  if (durationWords.some(dw => word.includes(dw))) {
    return 'duration';
  }
  
  return null;
}

// 情境判斷
function guessContext(english, chinese) {
  const restaurantWords = ['menu', 'order', 'waiter', 'bill', 'tip', 'food', 'eat', 'drink', 'restaurant', 'cafe', 'delicious', 'tasty'];
  const hospitalWords = ['doctor', 'nurse', 'patient', 'medicine', 'sick', 'pain', 'fever', 'cough', 'hospital', 'clinic', 'health'];
  const airportWords = ['flight', 'ticket', 'passport', 'luggage', 'airport', 'plane', 'boarding', 'departure', 'arrival'];
  const shoppingWords = ['shop', 'store', 'mall', 'market', 'buy', 'sell', 'price', 'discount', 'money', 'pay'];
  const schoolWords = ['teacher', 'student', 'classroom', 'homework', 'study', 'learn', 'test', 'exam', 'school', 'book'];
  const officeWords = ['office', 'manager', 'meeting', 'project', 'work', 'task', 'deadline', 'report', 'computer', 'email'];
  const homeWords = ['home', 'family', 'room', 'furniture', 'cook', 'clean', 'sleep', 'bed', 'kitchen', 'bathroom'];
  const travelWords = ['travel', 'tour', 'hotel', 'sightseeing', 'visit', 'explore', 'trip', 'vacation', 'tourist'];
  
  const word = english.toLowerCase();
  
  if (restaurantWords.some(rw => word.includes(rw))) {
    return 'restaurant';
  }
  if (hospitalWords.some(hw => word.includes(hw))) {
    return 'hospital';
  }
  if (airportWords.some(aw => word.includes(aw))) {
    return 'airport';
  }
  if (shoppingWords.some(sw => word.includes(sw))) {
    return 'shopping';
  }
  if (schoolWords.some(sw => word.includes(sw))) {
    return 'school';
  }
  if (officeWords.some(ow => word.includes(ow))) {
    return 'office';
  }
  if (homeWords.some(hw => word.includes(hw))) {
    return 'home';
  }
  if (travelWords.some(tw => word.includes(tw))) {
    return 'travel';
  }
  
  return null;
}

async function importGEPTVocabulary() {
  try {
    console.log('🚀 開始導入 GEPT 詞彙...\n');

    // 讀取翻譯文件
    const elementaryData = JSON.parse(fs.readFileSync('data/translations/gept-elementary-translations.json', 'utf8'));
    const intermediateData = JSON.parse(fs.readFileSync('data/translations/gept-intermediate-translations.json', 'utf8'));
    const highIntermediateData = JSON.parse(fs.readFileSync('data/translations/gept-high_intermediate-translations.json', 'utf8'));

    console.log(`✅ 讀取到 ${Object.keys(elementaryData).length} 個初級單字`);
    console.log(`✅ 讀取到 ${Object.keys(intermediateData).length} 個中級單字`);
    console.log(`✅ 讀取到 ${Object.keys(highIntermediateData).length} 個中高級單字\n`);

    let importedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // 處理函數
    async function processWords(data, defaultLevel, levelName) {
      console.log(`\n📚 處理${levelName}單字...`);
      let levelImported = 0;
      let levelSkipped = 0;
      let levelError = 0;

      for (const [english, value] of Object.entries(data)) {
        if (english === 'lttc' || !english || !value) {
          levelSkipped++;
          skippedCount++;
          continue;
        }

        try {
          const { partOfSpeech, chinese, geptLevel } = parseGEPTTranslation(value);

          if (!chinese) {
            levelSkipped++;
            skippedCount++;
            continue;
          }

          // 檢查是否已存在
          const existing = await prisma.vocabularyItem.findFirst({
            where: { english: english.toLowerCase() }
          });

          if (existing) {
            // 更新現有單字
            await prisma.vocabularyItem.update({
              where: { id: existing.id },
              data: {
                chinese,
                partOfSpeech: partOfSpeech || existing.partOfSpeech,
                geptLevel: geptLevel || defaultLevel,
                syllableCount: syllable(english),
                emotionalTone: guessEmotionalTone(english, chinese),
                actionType: guessActionType(english, partOfSpeech),
                visualFeature: guessVisualFeature(english, chinese),
                temporalCategory: guessTemporalCategory(english, chinese),
                context: guessContext(english, chinese)
              }
            });
          } else {
            // 創建新單字
            await prisma.vocabularyItem.create({
              data: {
                english: english.toLowerCase(),
                chinese,
                partOfSpeech,
                geptLevel: geptLevel || defaultLevel,
                syllableCount: syllable(english),
                emotionalTone: guessEmotionalTone(english, chinese),
                actionType: guessActionType(english, partOfSpeech),
                visualFeature: guessVisualFeature(english, chinese),
                temporalCategory: guessTemporalCategory(english, chinese),
                context: guessContext(english, chinese)
              }
            });
          }

          levelImported++;
          importedCount++;
          if (importedCount % 100 === 0) {
            console.log(`  ✅ 已處理 ${importedCount} 個單字...`);
          }

        } catch (error) {
          console.error(`  ❌ 處理單字 ${english} 時出錯:`, error.message);
          levelError++;
          errorCount++;
        }
      }

      console.log(`  ✅ ${levelName}: 導入 ${levelImported} 個，跳過 ${levelSkipped} 個，失敗 ${levelError} 個`);
    }

    // 處理所有等級
    await processWords(elementaryData, 'ELEMENTARY', '初級');
    await processWords(intermediateData, 'INTERMEDIATE', '中級');
    await processWords(highIntermediateData, 'HIGH_INTERMEDIATE', '中高級');

    console.log(`\n🎉 完成！`);
    console.log(`✅ 成功導入/更新: ${importedCount} 個單字`);
    console.log(`⏭️  跳過: ${skippedCount} 個單字`);
    console.log(`❌ 失敗: ${errorCount} 個單字`);

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importGEPTVocabulary();

