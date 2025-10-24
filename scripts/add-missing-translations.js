#!/usr/bin/env node
/**
 * 添加缺失的翻譯
 * 主要是縮寫、英式拼寫、口語和複合詞
 */

const fs = require('fs');
const path = require('path');

console.log('=== 添加缺失翻譯 ===\n');

// 載入現有翻譯
const translationsPath = path.join(__dirname, '../data/translations/gept-all-translations.json');
const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf-8'));

console.log(`📚 現有翻譯: ${Object.keys(translations).length} 個單字`);

// 補充翻譯字典
const supplementaryTranslations = {
  // 時間縮寫
  'a.m': '上午',
  'p.m': '下午',
  
  // 月份縮寫
  'jan': '一月',
  'feb': '二月',
  'mar': '三月',
  'apr': '四月',
  'may': '五月',
  'jun': '六月',
  'jul': '七月',
  'aug': '八月',
  'sep': '九月',
  'oct': '十月',
  'nov': '十一月',
  'dec': '十二月',
  
  // 星期縮寫
  'mon': '星期一',
  'tue': '星期二',
  'wed': '星期三',
  'thu': '星期四',
  'fri': '星期五',
  'sat': '星期六',
  'sun': '星期日',
  
  // 單位縮寫
  'cm': '公分',
  'km': '公里',
  'kg': '公斤',
  'g': '公克',
  'gm': '公克',
  'm': '公尺',
  'min': '分鐘',
  
  // 詞性縮寫
  'adj': '形容詞',
  'adv': '副詞',
  'aux': '助動詞',
  'conj': '連接詞',
  'determiner': '限定詞',
  'inf': '不定詞',
  'interj': '感嘆詞',
  
  // 冠詞
  'an': '一個',
  
  // 英式拼寫 (對應美式)
  'aeroplane': '飛機',
  'colour': '顏色',
  'colourful': '多彩的',
  'centre': '中心',
  'cheque': '支票',
  'favour': '恩惠',
  'favourite': '最喜歡的',
  'grey': '灰色',
  'humour': '幽默',
  'metre': '公尺',
  'kilometre': '公里',
  'centimetre': '公分',
  'litre': '公升',
  'gramme': '公克',
  'neighbour': '鄰居',
  'organisation': '組織',
  'organise': '組織',
  'emphasise': '強調',
  'marvellous': '極好的',
  
  // 口語/俚語
  'bike': '腳踏車',
  'bye': '再見',
  'cos': '因為',
  'cuz': '因為',
  'daddy': '爸爸',
  'grandma': '奶奶',
  'grandpa': '爺爺',
  'hippo': '河馬',
  'kitty': '小貓',
  'ma': '媽媽',
  'mom': '媽媽',
  'momma': '媽媽',
  'mommy': '媽咪',
  'nope': '不',
  'o.k': '好的',
  'ok': '好的',
  'auntie': '阿姨',
  'aunty': '阿姨',
  
  // 複合詞
  'baby-sit': '照顧嬰兒',
  'baby-sitter': '保姆',
  'bar-b-q': '烤肉',
  'bbq': '烤肉',
  'businessman': '商人',
  'businesswoman': '女商人',
  'cell-phone': '手機',
  'mailman': '郵差',
  'motorbike': '摩托車',
  'chairman': '主席',
  'chairwoman': '女主席',
  
  // 其他變體
  'anyplace': '任何地方',
  'apoligise': '道歉',
  'burger': '漢堡',
  'donut': '甜甜圈',
  'fries': '薯條',
  'icebox': '冰箱',
  'bookshop': '書店',
  'british': '英國的',
  'catsup': '番茄醬',
  'conditioner': '護髮素',
  'curd': '凝乳',
  'datum': '數據',
  'forwards': '向前',
  'backwards': '向後',
  'cab': '計程車',
  
  // 稱謂
  'mr': '先生',
  'mrs': '太太',
  'ms': '女士',
  
  // 其他
  'ad': '廣告',
  'mrt': '捷運',
  'kong': '香港',
  'ladies': '女士們',
  'men': '男士們',
  'mathematics': '數學',
  'o': '哦',

  // 第二批補充 (剩餘的 179 個)
  'mamma': '媽媽',
  'p': '頁',
  'papa': '爸爸',
  'ping-pong': '乒乓球',
  'pm': '下午',
  'postman': '郵差',
  'practise': '練習',
  'prep': '介系詞',
  'programme': '節目',
  'pron': '代名詞',
  'pyjamas': '睡衣',
  'qhl': '全民英檢',
  'railway': '鐵路',
  'realise': '實現',
  'roc': '中華民國',
  'roller-blade': '直排輪',
  'roller-skate': '溜冰鞋',
  'rollerblade': '直排輪',
  's': '的',
  'salesman': '銷售員',
  'saleswoman': '女銷售員',
  'sept': '九月',
  'sitter': '保姆',
  'skilful': '熟練的',
  'states': '州',
  'taxicab': '計程車',
  'tee-shirt': 'T恤',
  'tenth': '第十',
  'theatre': '劇院',
  'thur': '星期四',
  'thurs': '星期四',
  'towards': '朝向',
  'tues': '星期二',
  'tummy': '肚子',
  'united': '聯合的',
  'valentine': '情人節',
  'vol': '卷',
  'weds': '星期三',
  'women': '女人們',
  'xmas': '聖誕節',
  'advertize': '廣告',
  'advisor': '顧問',
  'afterwards': '之後',
  'analyse': '分析',
  'axe': '斧頭',
  'bacterium': '細菌',
  'behaviour': '行為',
  'blond': '金髮的',
  'catalogue': '目錄',
  'cetera': '等等',
  'christ': '基督',
  'corp': '公司',
  'defence': '防禦',
  'dependant': '依賴的',
  'dialogue': '對話',
  'disc': '光碟',
  'dorm': '宿舍',
  'enquire': '詢問',
  'enquiry': '詢問',
  'enrol': '註冊',
  'et': '和',
  'etc': '等等',
  'flavour': '味道',
  'fulfil': '實現',
  'groom': '新郎',
  'gull': '海鷗',
  'honour': '榮譽',
  'judgement': '判斷',
  'lab': '實驗室',
  'labour': '勞動',
  'ladybird': '瓢蟲',
  'licence': '執照',
  'litchi': '荔枝',
  'mainly': '主要地',
  'mike': '麥克風',
  'offence': '冒犯',
  'oz': '盎司',
  'rumour': '謠言',
  'soya': '大豆',
  'spaceship': '太空船',
  'spirits': '精神',
  'sportsman': '運動員',
  'sportswoman': '女運動員',
  'traveller': '旅行者',
  'travelling': '旅行',
  'tyre': '輪胎',
  'vapour': '蒸氣',
  'vigour': '活力',
  'whomever': '無論誰',
  'yoghurt': '優格',
  'aesthetical': '美學的',
  'ageing': '老化',
  'analytic': '分析的',
  'appal': '使驚駭',
  'arabia': '阿拉伯',
  'archeology': '考古學',
  'armour': '盔甲',
  'artefact': '人工製品',
  'authorise': '授權',
  'botanic': '植物的',
  'broach': '提出',
  'buildup': '累積',
  'c': '攝氏',
  'carer': '照顧者',
  'carryout': '外帶',
  'centigrade': '攝氏',
  'characterise': '描述特徵',
  'chequebook': '支票簿',
  'chili': '辣椒',
  'clean-up': '清理',
  'cosy': '舒適的',
  'councillor': '議員',
  'counsellor': '顧問',
  'crosswalk': '人行道',
  'despatch': '派遣',
  'distil': '蒸餾',
  'endeavour': '努力',
  'esthetic': '美學的',
  'esthetical': '美學的',
  'esthetics': '美學',
  'fibre': '纖維',
  'fireman': '消防員',
  'geographic': '地理的',
  'glamour': '魅力',
  'guerilla': '游擊隊',
  'hard-line': '強硬的',
  'homogenous': '同質的',
  'instalment': '分期付款',
  'inwards': '向內',
  'jeopardise': '危害',
  'limo': '豪華轎車',
  'manoeuvre': '操縱',
  'millimetre': '毫米',
  'mm': '毫米',
  'mobilise': '動員',
  'mould': '模具',
  'neighbouring': '鄰近的',
  'odour': '氣味',
  'onetime': '一次性的',
  'optimal': '最佳的',
  'orientate': '定向',
  'paralyse': '使癱瘓',
  'parlour': '客廳',
  'plough': '犁',
  'providing': '提供',
  'psychical': '心理的',
  'quartette': '四重奏',
  'quotient': '商數',
  'realisation': '實現',
  'reorganise': '重組',
  'rhino': '犀牛',
  'rigour': '嚴格',
  'room-mate': '室友',
  'rotatory': '旋轉的',
  'sceptic': '懷疑論者',
  'sceptical': '懷疑的',
  'sculpt': '雕刻',
  'skeptic': '懷疑論者',
  'sledge': '雪橇',
  'socialise': '社交',
  'specialise': '專門從事',
  'speciality': '專長',
  'splendour': '壯麗',
  'spokesman': '發言人',
  'spokeswoman': '女發言人',
  'stewardess': '空姐',
  'streetcar': '電車',
  'sulphur': '硫磺',
  'symbolical': '象徵的',
  'takeout': '外帶',
  'tb': '結核病',
  'thirds': '三分之一',
  'tram': '電車',
  'tramcar': '電車',
  'transitory': '短暫的',
  'tumour': '腫瘤',
  'vet': '獸醫',
  'vs': '對',
  'whisky': '威士忌'
};

// 合併翻譯
let addedCount = 0;
Object.keys(supplementaryTranslations).forEach(key => {
  if (!translations[key]) {
    translations[key] = supplementaryTranslations[key];
    addedCount++;
  }
});

console.log(`✅ 添加了 ${addedCount} 個新翻譯`);

// 保存更新後的翻譯
fs.writeFileSync(translationsPath, JSON.stringify(translations, null, 2));
console.log(`💾 已保存到: ${translationsPath}`);

console.log(`\n📊 最終統計:`);
console.log(`  - 總翻譯數: ${Object.keys(translations).length} 個單字`);

// 重新檢查覆蓋率
const elementaryPath = path.join(__dirname, '../data/word-lists/gept-elementary-unique.txt');
const intermediatePath = path.join(__dirname, '../data/word-lists/gept-intermediate-unique.txt');
const highIntermediatePath = path.join(__dirname, '../data/word-lists/gept-high-intermediate-unique.txt');

const elementary = fs.readFileSync(elementaryPath, 'utf-8')
  .split('\n')
  .map(w => w.trim())
  .filter(w => w);

const intermediate = fs.readFileSync(intermediatePath, 'utf-8')
  .split('\n')
  .map(w => w.trim())
  .filter(w => w);

const highIntermediate = fs.readFileSync(highIntermediatePath, 'utf-8')
  .split('\n')
  .map(w => w.trim())
  .filter(w => w);

const allWords = [...new Set([...elementary, ...intermediate, ...highIntermediate])];

const missing = allWords.filter(word => !translations[word.toLowerCase()]);
const found = allWords.filter(word => translations[word.toLowerCase()]);

console.log(`  - 已翻譯: ${found.length}/${allWords.length} (${(found.length / allWords.length * 100).toFixed(2)}%)`);
console.log(`  - 缺失: ${missing.length} 個單字`);

if (missing.length > 0) {
  console.log(`\n❌ 仍然缺失的單字:`);
  missing.forEach(word => {
    console.log(`  - ${word}`);
  });
}

console.log('\n=== 完成 ===');

