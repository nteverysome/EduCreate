import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 主題分類和關鍵字映射
const THEME_KEYWORDS = {
  'daily_life': ['daily', 'life', 'everyday', 'routine', 'habit', 'usual', 'normal', 'common', 'regular'],
  'school': ['school', 'student', 'teacher', 'class', 'lesson', 'study', 'learn', 'education', 'homework', 'exam', 'test', 'grade', 'university', 'college', 'campus', 'library', 'textbook', 'notebook', 'pencil', 'pen', 'eraser', 'ruler', 'desk', 'chair', 'blackboard', 'chalk'],
  'work': ['work', 'job', 'office', 'business', 'company', 'employee', 'employer', 'manager', 'boss', 'colleague', 'meeting', 'project', 'task', 'deadline', 'salary', 'career', 'professional', 'interview', 'resume'],
  'health': ['health', 'doctor', 'hospital', 'medicine', 'sick', 'ill', 'disease', 'pain', 'hurt', 'injury', 'nurse', 'patient', 'clinic', 'treatment', 'cure', 'healthy', 'fitness', 'exercise', 'diet', 'nutrition'],
  'food': ['food', 'eat', 'drink', 'meal', 'breakfast', 'lunch', 'dinner', 'restaurant', 'cook', 'kitchen', 'recipe', 'ingredient', 'taste', 'delicious', 'hungry', 'thirsty', 'menu', 'order', 'dish', 'fruit', 'vegetable', 'meat', 'fish', 'rice', 'bread', 'milk', 'water', 'tea', 'coffee'],
  'travel': ['travel', 'trip', 'journey', 'tour', 'vacation', 'holiday', 'tourist', 'visit', 'sightseeing', 'destination', 'passport', 'visa', 'luggage', 'baggage', 'hotel', 'motel', 'reservation', 'booking'],
  'sports': ['sport', 'game', 'play', 'team', 'player', 'coach', 'match', 'competition', 'win', 'lose', 'score', 'goal', 'ball', 'run', 'jump', 'swim', 'basketball', 'football', 'soccer', 'tennis', 'baseball', 'volleyball'],
  'technology': ['computer', 'internet', 'website', 'email', 'phone', 'mobile', 'app', 'software', 'hardware', 'digital', 'online', 'technology', 'tech', 'device', 'screen', 'keyboard', 'mouse', 'printer', 'network', 'wifi', 'data', 'file', 'download', 'upload'],
  'nature': ['nature', 'natural', 'environment', 'earth', 'planet', 'sky', 'sun', 'moon', 'star', 'cloud', 'rain', 'snow', 'wind', 'weather', 'season', 'spring', 'summer', 'autumn', 'fall', 'winter', 'tree', 'flower', 'plant', 'grass', 'forest', 'mountain', 'river', 'lake', 'ocean', 'sea', 'beach', 'island'],
  'animals': ['animal', 'pet', 'dog', 'cat', 'bird', 'fish', 'horse', 'cow', 'pig', 'chicken', 'duck', 'rabbit', 'mouse', 'rat', 'lion', 'tiger', 'bear', 'elephant', 'monkey', 'snake', 'insect', 'butterfly', 'bee'],
  'family': ['family', 'parent', 'father', 'mother', 'dad', 'mom', 'son', 'daughter', 'brother', 'sister', 'grandfather', 'grandmother', 'grandpa', 'grandma', 'uncle', 'aunt', 'cousin', 'nephew', 'niece', 'husband', 'wife', 'child', 'baby', 'kid'],
  'home': ['home', 'house', 'apartment', 'room', 'bedroom', 'bathroom', 'kitchen', 'living', 'door', 'window', 'wall', 'floor', 'ceiling', 'roof', 'furniture', 'bed', 'table', 'chair', 'sofa', 'desk', 'lamp', 'light'],
  'shopping': ['shop', 'shopping', 'store', 'market', 'supermarket', 'mall', 'buy', 'sell', 'purchase', 'price', 'cost', 'expensive', 'cheap', 'discount', 'sale', 'pay', 'money', 'cash', 'card', 'credit', 'customer', 'clerk'],
  'transportation': ['transport', 'transportation', 'car', 'bus', 'train', 'subway', 'taxi', 'bike', 'bicycle', 'motorcycle', 'airplane', 'plane', 'ship', 'boat', 'drive', 'ride', 'traffic', 'road', 'street', 'highway', 'station', 'airport', 'port'],
  'entertainment': ['entertainment', 'fun', 'enjoy', 'movie', 'film', 'cinema', 'theater', 'music', 'song', 'sing', 'dance', 'concert', 'show', 'performance', 'actor', 'actress', 'artist', 'hobby', 'interest', 'game', 'toy'],
  'communication': ['communicate', 'communication', 'talk', 'speak', 'say', 'tell', 'ask', 'answer', 'question', 'conversation', 'discuss', 'chat', 'call', 'phone', 'message', 'text', 'email', 'letter', 'write', 'read', 'listen', 'hear'],
  'emotion': ['feel', 'feeling', 'emotion', 'happy', 'sad', 'angry', 'excited', 'nervous', 'worried', 'afraid', 'scared', 'surprised', 'confused', 'tired', 'bored', 'interested', 'love', 'hate', 'like', 'dislike', 'enjoy', 'prefer'],
  'time': ['time', 'hour', 'minute', 'second', 'day', 'week', 'month', 'year', 'today', 'yesterday', 'tomorrow', 'morning', 'afternoon', 'evening', 'night', 'early', 'late', 'now', 'then', 'past', 'present', 'future', 'clock', 'watch', 'calendar'],
  'weather': ['weather', 'sunny', 'cloudy', 'rainy', 'snowy', 'windy', 'hot', 'cold', 'warm', 'cool', 'temperature', 'climate', 'forecast'],
  'clothing': ['clothes', 'clothing', 'wear', 'dress', 'shirt', 'pants', 'skirt', 'jacket', 'coat', 'sweater', 'shoes', 'socks', 'hat', 'cap', 'gloves', 'scarf', 'tie', 'belt', 'fashion', 'style'],
  'colors': ['color', 'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white', 'gray', 'grey'],
  'numbers': ['number', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'first', 'second', 'third', 'count', 'calculate', 'math', 'mathematics'],
  'body': ['body', 'head', 'face', 'eye', 'ear', 'nose', 'mouth', 'tooth', 'teeth', 'tongue', 'neck', 'shoulder', 'arm', 'hand', 'finger', 'leg', 'foot', 'feet', 'toe', 'back', 'chest', 'stomach', 'heart', 'brain'],
  'action': ['do', 'make', 'go', 'come', 'take', 'give', 'get', 'put', 'use', 'find', 'know', 'think', 'see', 'look', 'watch', 'hear', 'listen', 'speak', 'talk', 'say', 'tell', 'read', 'write', 'work', 'play', 'run', 'walk', 'sit', 'stand', 'sleep', 'wake', 'eat', 'drink'],
  'description': ['good', 'bad', 'big', 'small', 'large', 'little', 'long', 'short', 'tall', 'high', 'low', 'wide', 'narrow', 'thick', 'thin', 'heavy', 'light', 'strong', 'weak', 'hard', 'soft', 'fast', 'slow', 'new', 'old', 'young', 'beautiful', 'ugly', 'clean', 'dirty', 'easy', 'difficult', 'hard', 'simple', 'complex'],
  'location': ['place', 'location', 'position', 'here', 'there', 'where', 'near', 'far', 'close', 'distance', 'direction', 'north', 'south', 'east', 'west', 'left', 'right', 'front', 'back', 'top', 'bottom', 'inside', 'outside', 'above', 'below', 'between', 'among'],
  'quantity': ['many', 'much', 'few', 'little', 'some', 'any', 'all', 'every', 'each', 'most', 'more', 'less', 'enough', 'too', 'very', 'quite', 'rather', 'almost', 'nearly', 'about', 'around'],
  'social': ['people', 'person', 'man', 'woman', 'boy', 'girl', 'friend', 'neighbor', 'stranger', 'society', 'social', 'community', 'public', 'private', 'group', 'team', 'member', 'leader', 'follower'],
  'money': ['money', 'dollar', 'cent', 'pound', 'euro', 'yuan', 'currency', 'bank', 'account', 'save', 'spend', 'earn', 'income', 'expense', 'budget', 'rich', 'poor', 'wealth', 'poverty'],
  'law': ['law', 'legal', 'illegal', 'rule', 'regulation', 'right', 'wrong', 'justice', 'court', 'judge', 'lawyer', 'police', 'crime', 'criminal', 'prison', 'jail', 'guilty', 'innocent']
};

// 識別主題
function identifyTheme(english, chinese) {
  const lowerEnglish = english.toLowerCase();
  const lowerChinese = chinese.toLowerCase();
  
  // 計算每個主題的匹配分數
  const scores = {};
  
  for (const [theme, keywords] of Object.entries(THEME_KEYWORDS)) {
    let score = 0;
    
    for (const keyword of keywords) {
      // 完全匹配得 10 分
      if (lowerEnglish === keyword) {
        score += 10;
      }
      // 包含關鍵字得 5 分
      else if (lowerEnglish.includes(keyword)) {
        score += 5;
      }
      // 單字開頭匹配得 3 分
      else if (lowerEnglish.startsWith(keyword)) {
        score += 3;
      }
    }
    
    if (score > 0) {
      scores[theme] = score;
    }
  }
  
  // 返回得分最高的主題
  if (Object.keys(scores).length > 0) {
    const sortedThemes = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    return sortedThemes[0][0];
  }
  
  return null;
}

async function fillThemeData() {
  try {
    console.log('🚀 開始填充主題數據...\n');

    const allWords = await prisma.vocabularyItem.findMany({
      select: {
        id: true,
        english: true,
        chinese: true,
        theme: true
      }
    });

    console.log(`✅ 找到 ${allWords.length} 個單字\n`);

    let updatedCount = 0;
    const themeStats = {};

    for (const word of allWords) {
      const theme = identifyTheme(word.english, word.chinese);

      // 只更新有變化的單字
      if (theme !== word.theme) {
        await prisma.vocabularyItem.update({
          where: { id: word.id },
          data: { theme }
        });

        updatedCount++;
        
        if (theme) {
          themeStats[theme] = (themeStats[theme] || 0) + 1;
        }

        if (updatedCount % 100 === 0) {
          console.log(`  ✅ 已處理 ${updatedCount} 個單字...`);
        }
      }
    }

    console.log(`\n🎉 完成！`);
    console.log(`✅ 成功更新: ${updatedCount} 個單字`);
    console.log(`\n📊 主題分布:`);
    
    const sortedThemes = Object.entries(themeStats).sort((a, b) => b[1] - a[1]);
    sortedThemes.forEach(([theme, count]) => {
      console.log(`  ${theme}: ${count} 個`);
    });

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fillThemeData();

