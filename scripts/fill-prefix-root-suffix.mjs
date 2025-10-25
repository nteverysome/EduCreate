import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// 常見字首列表
const PREFIXES = {
  'un': '不、非',
  're': '再、重新',
  'pre': '前、預先',
  'dis': '不、相反',
  'mis': '錯誤',
  'in': '不、非',
  'im': '不、非',
  'il': '不、非',
  'ir': '不、非',
  'over': '過度',
  'under': '不足',
  'sub': '下、次',
  'super': '超、上',
  'inter': '之間',
  'trans': '跨越',
  'ex': '向外',
  'de': '向下、去除',
  'anti': '反對',
  'auto': '自動',
  'co': '共同',
  'counter': '反對',
  'en': '使',
  'fore': '前',
  'mid': '中',
  'non': '非',
  'out': '超過',
  'post': '後',
  'semi': '半',
  'tele': '遠',
  'tri': '三',
  'uni': '一',
  'bi': '二',
  'multi': '多'
};

// 常見字根列表
const ROOTS = {
  'port': '攜帶',
  'dict': '說',
  'vis': '看',
  'aud': '聽',
  'mov': '移動',
  'mem': '記憶',
  'scrib': '寫',
  'graph': '寫',
  'phon': '聲音',
  'photo': '光',
  'bio': '生命',
  'geo': '地球',
  'log': '說、學',
  'path': '感覺',
  'psych': '心理',
  'therm': '熱',
  'chron': '時間',
  'meter': '測量',
  'scope': '看',
  'tele': '遠',
  'micro': '小',
  'macro': '大',
  'hydro': '水',
  'aero': '空氣',
  'astro': '星',
  'auto': '自己',
  'biblio': '書',
  'cred': '相信',
  'cycl': '圓',
  'dem': '人民',
  'derm': '皮膚',
  'duc': '引導',
  'fac': '做',
  'fer': '攜帶',
  'flex': '彎曲',
  'form': '形狀',
  'fract': '破',
  'gen': '產生',
  'ject': '投擲',
  'junct': '連接',
  'lect': '選擇',
  'loc': '地方',
  'man': '手',
  'mit': '發送',
  'mob': '移動',
  'mort': '死',
  'nat': '出生',
  'ped': '腳',
  'pel': '推',
  'pend': '懸掛',
  'phil': '愛',
  'phob': '恐懼',
  'plic': '折疊',
  'pon': '放置',
  'pop': '人民',
  'pos': '放置',
  'press': '壓',
  'prim': '第一',
  'rupt': '破',
  'scop': '看',
  'sect': '切',
  'sent': '感覺',
  'sequ': '跟隨',
  'serv': '保持',
  'sign': '標記',
  'sist': '站立',
  'spec': '看',
  'spir': '呼吸',
  'sta': '站立',
  'struct': '建造',
  'tact': '觸摸',
  'tain': '保持',
  'tend': '伸展',
  'terr': '土地',
  'tract': '拉',
  'vac': '空',
  'ven': '來',
  'vert': '轉',
  'vid': '看',
  'voc': '聲音',
  'volv': '滾'
};

// 常見字尾列表
const SUFFIXES = {
  'er': '人、物',
  'or': '人、物',
  'ist': '人',
  'ian': '人',
  'tion': '動作、狀態',
  'sion': '動作、狀態',
  'ment': '動作、結果',
  'ness': '狀態、性質',
  'ity': '狀態、性質',
  'ty': '狀態、性質',
  'ance': '狀態、性質',
  'ence': '狀態、性質',
  'ful': '充滿',
  'less': '沒有',
  'ous': '充滿',
  'ious': '充滿',
  'eous': '充滿',
  'able': '能夠',
  'ible': '能夠',
  'al': '有關',
  'ial': '有關',
  'ic': '有關',
  'ical': '有關',
  'ive': '有...性質',
  'ative': '有...性質',
  'ly': '方式',
  'y': '充滿、狀態',
  'ish': '像、有點',
  'ize': '使成為',
  'ise': '使成為',
  'fy': '使成為',
  'en': '使成為',
  'ate': '使成為',
  'age': '狀態、集合',
  'dom': '狀態、領域',
  'hood': '狀態、時期',
  'ship': '狀態、關係',
  'ward': '向',
  'wise': '方式'
};

// 識別字首
function identifyPrefix(word) {
  const lowerWord = word.toLowerCase();
  
  // 按長度從長到短排序，優先匹配長字首
  const sortedPrefixes = Object.keys(PREFIXES).sort((a, b) => b.length - a.length);
  
  for (const prefix of sortedPrefixes) {
    if (lowerWord.startsWith(prefix) && lowerWord.length > prefix.length + 2) {
      return prefix;
    }
  }
  
  return null;
}

// 識別字根
function identifyRoot(word) {
  const lowerWord = word.toLowerCase();
  
  // 按長度從長到短排序，優先匹配長字根
  const sortedRoots = Object.keys(ROOTS).sort((a, b) => b.length - a.length);
  
  for (const root of sortedRoots) {
    if (lowerWord.includes(root) && lowerWord.length > root.length + 1) {
      return root;
    }
  }
  
  return null;
}

// 識別字尾
function identifySuffix(word) {
  const lowerWord = word.toLowerCase();
  
  // 按長度從長到短排序，優先匹配長字尾
  const sortedSuffixes = Object.keys(SUFFIXES).sort((a, b) => b.length - a.length);
  
  for (const suffix of sortedSuffixes) {
    if (lowerWord.endsWith(suffix) && lowerWord.length > suffix.length + 2) {
      return suffix;
    }
  }
  
  return null;
}

async function fillPrefixRootSuffix() {
  try {
    console.log('🚀 開始填充字首、字根、字尾數據...\n');

    const allWords = await prisma.vocabularyItem.findMany({
      select: {
        id: true,
        english: true,
        prefix: true,
        root: true,
        suffix: true
      }
    });

    console.log(`✅ 找到 ${allWords.length} 個單字\n`);

    let updatedCount = 0;
    let prefixCount = 0;
    let rootCount = 0;
    let suffixCount = 0;

    for (const word of allWords) {
      const prefix = identifyPrefix(word.english);
      const root = identifyRoot(word.english);
      const suffix = identifySuffix(word.english);

      // 只更新有變化的單字
      if (prefix !== word.prefix || root !== word.root || suffix !== word.suffix) {
        await prisma.vocabularyItem.update({
          where: { id: word.id },
          data: {
            prefix,
            root,
            suffix
          }
        });

        updatedCount++;
        if (prefix) prefixCount++;
        if (root) rootCount++;
        if (suffix) suffixCount++;

        if (updatedCount % 100 === 0) {
          console.log(`  ✅ 已處理 ${updatedCount} 個單字...`);
        }
      }
    }

    console.log(`\n🎉 完成！`);
    console.log(`✅ 成功更新: ${updatedCount} 個單字`);
    console.log(`📊 統計:`);
    console.log(`  - 有字首: ${prefixCount} 個`);
    console.log(`  - 有字根: ${rootCount} 個`);
    console.log(`  - 有字尾: ${suffixCount} 個`);

  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fillPrefixRootSuffix();

