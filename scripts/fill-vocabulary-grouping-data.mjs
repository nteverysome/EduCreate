import { PrismaClient } from '@prisma/client';
import { syllable } from 'syllable';
const prisma = new PrismaClient();

// 詞性判斷規則（基於常見詞尾）
function guessPartOfSpeech(english, chinese) {
  const word = english.toLowerCase();
  
  // 動詞詞尾
  if (word.endsWith('ing') || word.endsWith('ed') || word.endsWith('ate') || 
      word.endsWith('ify') || word.endsWith('ize') || word.endsWith('en')) {
    return 'VERB';
  }
  
  // 名詞詞尾
  if (word.endsWith('tion') || word.endsWith('sion') || word.endsWith('ment') || 
      word.endsWith('ness') || word.endsWith('er') || word.endsWith('or') || 
      word.endsWith('ist') || word.endsWith('ism') || word.endsWith('ity') || 
      word.endsWith('ship') || word.endsWith('hood')) {
    return 'NOUN';
  }
  
  // 形容詞詞尾
  if (word.endsWith('ful') || word.endsWith('less') || word.endsWith('ous') || 
      word.endsWith('ive') || word.endsWith('able') || word.endsWith('ible') || 
      word.endsWith('al') || word.endsWith('ic') || word.endsWith('ant') || 
      word.endsWith('ent')) {
    return 'ADJECTIVE';
  }
  
  // 副詞詞尾
  if (word.endsWith('ly')) {
    return 'ADVERB';
  }
  
  // 介詞（常見介詞列表）
  const prepositions = ['in', 'on', 'at', 'to', 'for', 'with', 'from', 'by', 'about', 'under', 'over', 'between', 'through', 'during', 'before', 'after'];
  if (prepositions.includes(word)) {
    return 'PREPOSITION';
  }
  
  // 連接詞（常見連接詞列表）
  const conjunctions = ['and', 'but', 'or', 'so', 'because', 'although', 'if', 'when', 'while', 'since'];
  if (conjunctions.includes(word)) {
    return 'CONJUNCTION';
  }
  
  // 根據中文翻譯判斷
  if (chinese.includes('的') && !chinese.includes('地')) {
    return 'ADJECTIVE';
  }
  if (chinese.includes('地')) {
    return 'ADVERB';
  }
  
  // 默認為名詞
  return 'NOUN';
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
  
  // 根據中文判斷
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
function guessActionType(english, chinese, partOfSpeech) {
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

async function fillVocabularyGroupingData() {
  try {
    console.log('🚀 開始填充詞彙分組數據...\n');

    // 1. 獲取所有單字
    const allWords = await prisma.vocabularyItem.findMany({
      select: {
        id: true,
        english: true,
        chinese: true,
        geptLevel: true,
        partOfSpeech: true
      }
    });

    console.log(`✅ 找到 ${allWords.length} 個單字\n`);

    let updatedCount = 0;
    let errorCount = 0;

    // 2. 逐個處理單字
    for (const word of allWords) {
      try {
        // 提取 GEPT 等級
        let geptLevel = word.geptLevel;
        if (!geptLevel && word.chinese) {
          if (word.chinese.includes('初級')) {
            geptLevel = 'ELEMENTARY';
          } else if (word.chinese.includes('中高級')) {
            geptLevel = 'HIGH_INTERMEDIATE';
          } else if (word.chinese.includes('中級')) {
            geptLevel = 'INTERMEDIATE';
          }
        }

        // 清理 chinese 字段（移除 GEPT 等級標記）
        let cleanChinese = word.chinese;
        if (cleanChinese) {
          cleanChinese = cleanChinese
            .replace(/初級\s*[A-Z]?/g, '')
            .replace(/中高級\s*[A-Z]?/g, '')
            .replace(/中級\s*[A-Z]?/g, '')
            .trim();
        }

        // 計算音節數量
        const syllableCount = syllable(word.english);

        // 判斷詞性
        const partOfSpeech = word.partOfSpeech || guessPartOfSpeech(word.english, cleanChinese);

        // 判斷情感色彩
        const emotionalTone = guessEmotionalTone(word.english, cleanChinese);

        // 判斷動作類型
        const actionType = guessActionType(word.english, cleanChinese, partOfSpeech);

        // 判斷視覺特徵
        const visualFeature = guessVisualFeature(word.english, cleanChinese);

        // 判斷時間類別
        const temporalCategory = guessTemporalCategory(word.english, cleanChinese);

        // 判斷情境
        const context = guessContext(word.english, cleanChinese);

        // 更新數據庫
        await prisma.vocabularyItem.update({
          where: { id: word.id },
          data: {
            geptLevel,
            chinese: cleanChinese,
            syllableCount,
            partOfSpeech,
            emotionalTone,
            actionType,
            visualFeature,
            temporalCategory,
            context
          }
        });

        updatedCount++;
        if (updatedCount % 50 === 0) {
          console.log(`✅ 已處理 ${updatedCount} 個單字...`);
        }

      } catch (error) {
        console.error(`❌ 處理單字 ${word.english} 時出錯:`, error.message);
        errorCount++;
      }
    }

    console.log(`\n🎉 完成！`);
    console.log(`✅ 成功更新: ${updatedCount} 個單字`);
    console.log(`❌ 失敗: ${errorCount} 個單字`);

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fillVocabularyGroupingData();

