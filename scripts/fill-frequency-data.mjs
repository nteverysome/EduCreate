import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 高頻詞列表（最常用的 500 個英文單字）
const HIGH_FREQUENCY_WORDS = [
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i',
  'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
  'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she',
  'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what',
  'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me',
  'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take',
  'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other',
  'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think', 'also',
  'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way',
  'even', 'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us',
  'is', 'was', 'are', 'been', 'has', 'had', 'were', 'said', 'did', 'having',
  'may', 'should', 'am', 'being', 'does', 'did', 'doing', 'would', 'could', 'ought',
  'man', 'woman', 'child', 'boy', 'girl', 'person', 'people', 'family', 'friend', 'home',
  'house', 'room', 'door', 'window', 'table', 'chair', 'bed', 'book', 'pen', 'paper',
  'water', 'food', 'eat', 'drink', 'cook', 'read', 'write', 'speak', 'listen', 'watch',
  'see', 'hear', 'feel', 'think', 'know', 'understand', 'learn', 'teach', 'study', 'work',
  'play', 'run', 'walk', 'sit', 'stand', 'sleep', 'wake', 'open', 'close', 'start',
  'stop', 'begin', 'end', 'come', 'go', 'arrive', 'leave', 'enter', 'exit', 'return',
  'big', 'small', 'large', 'little', 'long', 'short', 'tall', 'high', 'low', 'wide',
  'narrow', 'thick', 'thin', 'heavy', 'light', 'strong', 'weak', 'hard', 'soft', 'fast',
  'slow', 'quick', 'early', 'late', 'old', 'new', 'young', 'good', 'bad', 'right',
  'wrong', 'true', 'false', 'yes', 'no', 'please', 'thank', 'sorry', 'hello', 'goodbye',
  'morning', 'afternoon', 'evening', 'night', 'today', 'yesterday', 'tomorrow', 'week', 'month', 'year',
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'january', 'february', 'march',
  'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december', 'spring',
  'summer', 'autumn', 'fall', 'winter', 'hot', 'cold', 'warm', 'cool', 'sunny', 'cloudy',
  'rainy', 'snowy', 'windy', 'weather', 'sun', 'moon', 'star', 'sky', 'cloud', 'rain',
  'snow', 'wind', 'tree', 'flower', 'grass', 'plant', 'animal', 'bird', 'fish', 'dog',
  'cat', 'horse', 'cow', 'pig', 'chicken', 'red', 'blue', 'green', 'yellow', 'orange',
  'purple', 'pink', 'brown', 'black', 'white', 'gray', 'color', 'one', 'two', 'three',
  'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'hundred', 'thousand', 'million',
  'first', 'second', 'third', 'last', 'next', 'before', 'after', 'now', 'then', 'here',
  'there', 'where', 'when', 'why', 'how', 'what', 'which', 'who', 'whose', 'whom',
  'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'its', 'our',
  'their', 'mine', 'yours', 'hers', 'ours', 'theirs', 'myself', 'yourself', 'himself', 'herself',
  'itself', 'ourselves', 'yourselves', 'themselves', 'each', 'every', 'all', 'both', 'either', 'neither',
  'some', 'any', 'many', 'much', 'few', 'little', 'more', 'most', 'less', 'least',
  'several', 'enough', 'too', 'very', 'quite', 'rather', 'almost', 'nearly', 'about', 'around',
  'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'above', 'below',
  'between', 'among', 'through', 'across', 'along', 'around', 'at', 'by', 'for', 'from',
  'to', 'with', 'without', 'into', 'onto', 'upon', 'during', 'before', 'after', 'since',
  'until', 'till', 'while', 'as', 'because', 'if', 'unless', 'although', 'though', 'whether',
  'and', 'or', 'but', 'so', 'yet', 'nor', 'for', 'both', 'either', 'neither'
];

// 計算頻率分數（1-5，5 最常用）
function calculateFrequency(english, geptLevel, syllableCount) {
  const lowerEnglish = english.toLowerCase();
  
  // 檢查是否在高頻詞列表中
  if (HIGH_FREQUENCY_WORDS.includes(lowerEnglish)) {
    return 5; // 最高頻率
  }
  
  // 基於 GEPT 等級的基礎分數
  let baseScore = 3; // 默認中等頻率
  
  if (geptLevel === 'ELEMENTARY') {
    baseScore = 4; // 初級詞彙通常較常用
  } else if (geptLevel === 'INTERMEDIATE') {
    baseScore = 3; // 中級詞彙中等頻率
  } else if (geptLevel === 'HIGH_INTERMEDIATE') {
    baseScore = 2; // 中高級詞彙較少用
  }
  
  // 基於音節數調整（音節越少通常越常用）
  if (syllableCount === 1) {
    baseScore = Math.min(5, baseScore + 1);
  } else if (syllableCount >= 4) {
    baseScore = Math.max(1, baseScore - 1);
  }
  
  // 基於單字長度調整（越短通常越常用）
  const length = english.length;
  if (length <= 3) {
    baseScore = Math.min(5, baseScore + 1);
  } else if (length >= 10) {
    baseScore = Math.max(1, baseScore - 1);
  }
  
  return baseScore;
}

async function fillFrequencyData() {
  try {
    console.log('🚀 開始填充頻率數據...\n');

    const allWords = await prisma.vocabularyItem.findMany({
      select: {
        id: true,
        english: true,
        geptLevel: true,
        syllableCount: true,
        frequency: true
      }
    });

    console.log(`✅ 找到 ${allWords.length} 個單字\n`);

    let updatedCount = 0;
    const frequencyStats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    for (const word of allWords) {
      const frequency = calculateFrequency(
        word.english,
        word.geptLevel,
        word.syllableCount
      );

      // 只更新有變化的單字
      if (frequency !== word.frequency) {
        await prisma.vocabularyItem.update({
          where: { id: word.id },
          data: { frequency }
        });

        updatedCount++;
        frequencyStats[frequency]++;

        if (updatedCount % 100 === 0) {
          console.log(`  ✅ 已處理 ${updatedCount} 個單字...`);
        }
      }
    }

    console.log(`\n🎉 完成！`);
    console.log(`✅ 成功更新: ${updatedCount} 個單字`);
    console.log(`\n📊 頻率分布:`);
    console.log(`  ⭐⭐⭐⭐⭐ (5 - 最常用): ${frequencyStats[5]} 個`);
    console.log(`  ⭐⭐⭐⭐ (4 - 常用): ${frequencyStats[4]} 個`);
    console.log(`  ⭐⭐⭐ (3 - 中等): ${frequencyStats[3]} 個`);
    console.log(`  ⭐⭐ (2 - 較少用): ${frequencyStats[2]} 個`);
    console.log(`  ⭐ (1 - 罕用): ${frequencyStats[1]} 個`);

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fillFrequencyData();

