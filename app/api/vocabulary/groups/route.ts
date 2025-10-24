import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// 字首分組定義
const PREFIX_GROUPS = [
  { id: 'prefix-1', name: 'un- 字首組 (1)', description: '表示"不"的否定字首', prefix: 'un-', limit: 50 },
  { id: 'prefix-2', name: 'un- 字首組 (2)', description: '表示"不"的否定字首', prefix: 'un-', skip: 50, limit: 50 },
  { id: 'prefix-3', name: 'in-/im-/il-/ir- 字首組', description: '表示"不"的否定字首', prefix: ['in-', 'im-', 'il-', 'ir-'], limit: 50 },
  { id: 'prefix-4', name: 'dis-/non- 字首組', description: '表示"不"或"非"的否定字首', prefix: ['dis-', 'non-'], limit: 50 },
  { id: 'prefix-5', name: 're- 字首組 (1)', description: '表示"再"或"重新"', prefix: 're-', limit: 50 },
  { id: 'prefix-6', name: 're- 字首組 (2)', description: '表示"再"或"重新"', prefix: 're-', skip: 50, limit: 50 },
  { id: 'prefix-7', name: 'pre-/post- 字首組', description: '表示"前"或"後"', prefix: ['pre-', 'post-'], limit: 50 },
  { id: 'prefix-8', name: 'ex- 字首組', description: '表示"外"或"前"', prefix: 'ex-', limit: 50 },
  { id: 'prefix-9', name: 'in- 字首組 (進入)', description: '表示"進入"或"在內"', prefix: 'in-', limit: 50 },
  { id: 'prefix-10', name: 'out- 字首組', description: '表示"外出"或"超過"', prefix: 'out-', limit: 50 },
  { id: 'prefix-11', name: 'up-/down- 字首組', description: '表示"向上"或"向下"', prefix: ['up-', 'down-'], limit: 50 },
  { id: 'prefix-12', name: 'over- 字首組', description: '表示"超過"或"過度"', prefix: 'over-', limit: 50 },
  { id: 'prefix-13', name: 'under- 字首組', description: '表示"不足"或"在下"', prefix: 'under-', limit: 50 },
  { id: 'prefix-14', name: 'super-/sub- 字首組', description: '表示"超級"或"下"', prefix: ['super-', 'sub-'], limit: 50 },
  { id: 'prefix-15', name: 'mini-/micro- 字首組', description: '表示"小"或"微"', prefix: ['mini-', 'micro-'], limit: 50 },
];

// 主題分組定義
const THEME_GROUPS = [
  { id: 'theme-1', name: '日常生活 (1)', description: '家居用品、日常活動', theme: 'daily_life', limit: 50 },
  { id: 'theme-2', name: '日常生活 (2)', description: '家居用品、日常活動', theme: 'daily_life', skip: 50, limit: 50 },
  { id: 'theme-3', name: '學校教育 (1)', description: '學科、學習用品、校園生活', theme: 'school', limit: 50 },
  { id: 'theme-4', name: '學校教育 (2)', description: '學科、學習用品、校園生活', theme: 'school', skip: 50, limit: 50 },
  { id: 'theme-5', name: '工作職業 (1)', description: '職業名稱、工作場所', theme: 'work', limit: 50 },
  { id: 'theme-6', name: '工作職業 (2)', description: '職業名稱、工作場所', theme: 'work', skip: 50, limit: 50 },
  { id: 'theme-7', name: '食物飲料 (1)', description: '食物種類、飲料', theme: 'food', limit: 50 },
  { id: 'theme-8', name: '食物飲料 (2)', description: '食物種類、飲料', theme: 'food', skip: 50, limit: 50 },
  { id: 'theme-9', name: '交通旅遊 (1)', description: '交通工具、旅遊景點', theme: 'travel', limit: 50 },
  { id: 'theme-10', name: '交通旅遊 (2)', description: '交通工具、旅遊景點', theme: 'travel', skip: 50, limit: 50 },
];

// 頻率分組定義（簡化版，實際需要根據詞頻數據）
const FREQUENCY_GROUPS = Array.from({ length: 48 }, (_, i) => ({
  id: `frequency-${i + 1}`,
  name: `頻率組 ${i + 1}`,
  description: i < 10 ? '超高頻單字' : i < 20 ? '高頻單字' : i < 30 ? '中頻單字' : '低頻單字',
  frequency: i < 10 ? 5 : i < 20 ? 4 : i < 30 ? 3 : 2,
  skip: i * 50,
  limit: 50
}));

// 詞性分組定義
const PART_OF_SPEECH_GROUPS = [
  { id: 'pos-noun', name: '名詞組', description: '人物、地點、物品、抽象概念', partOfSpeech: 'NOUN', limit: 50 },
  { id: 'pos-verb', name: '動詞組', description: '動作、狀態、感官、思考', partOfSpeech: 'VERB', limit: 50 },
  { id: 'pos-adjective', name: '形容詞組', description: '描述性、情感、顏色', partOfSpeech: 'ADJECTIVE', limit: 50 },
  { id: 'pos-adverb', name: '副詞組', description: '方式、時間、頻率', partOfSpeech: 'ADVERB', limit: 50 },
  { id: 'pos-preposition', name: '介詞組', description: '位置、時間、方向', partOfSpeech: 'PREPOSITION', limit: 50 },
  { id: 'pos-conjunction', name: '連接詞組', description: '並列、從屬連接詞', partOfSpeech: 'CONJUNCTION', limit: 50 },
];

// 音節分組定義
const SYLLABLE_GROUPS = [
  { id: 'syllable-1', name: '單音節組', description: '最簡單的單字', syllableCount: 1, limit: 50 },
  { id: 'syllable-2', name: '雙音節組', description: '簡單的單字', syllableCount: 2, limit: 50 },
  { id: 'syllable-3', name: '三音節組', description: '中等難度的單字', syllableCount: 3, limit: 50 },
  { id: 'syllable-4', name: '多音節組', description: '較難的單字', syllableCount: 4, limit: 50 },
];

// 情境分組定義
const CONTEXT_GROUPS = [
  { id: 'context-restaurant', name: '餐廳情境', description: '點餐、用餐相關單字', context: 'restaurant', limit: 50 },
  { id: 'context-hospital', name: '醫院情境', description: '看病、醫療相關單字', context: 'hospital', limit: 50 },
  { id: 'context-airport', name: '機場情境', description: '旅行、飛行相關單字', context: 'airport', limit: 50 },
  { id: 'context-shopping', name: '購物情境', description: '買賣、商店相關單字', context: 'shopping', limit: 50 },
  { id: 'context-school', name: '學校情境', description: '學習、教育相關單字', context: 'school', limit: 50 },
  { id: 'context-office', name: '辦公室情境', description: '工作、職場相關單字', context: 'office', limit: 50 },
  { id: 'context-home', name: '家居情境', description: '家庭、日常生活相關單字', context: 'home', limit: 50 },
  { id: 'context-travel', name: '旅遊情境', description: '旅行、觀光相關單字', context: 'travel', limit: 50 },
];

// 情感分組定義
const EMOTIONAL_GROUPS = [
  { id: 'emotion-positive', name: '正面情感組', description: '快樂、愛、成功相關單字', emotionalTone: 'positive', limit: 50 },
  { id: 'emotion-negative', name: '負面情感組', description: '悲傷、憤怒、失敗相關單字', emotionalTone: 'negative', limit: 50 },
  { id: 'emotion-neutral', name: '中性情感組', description: '客觀、中性的單字', emotionalTone: 'neutral', limit: 50 },
];

// 動作分組定義
const ACTION_GROUPS = [
  { id: 'action-movement', name: '移動動作組', description: '走、跑、跳等移動動作', actionType: 'movement', limit: 50 },
  { id: 'action-hand', name: '手部動作組', description: '寫、畫、拿等手部動作', actionType: 'hand', limit: 50 },
  { id: 'action-thinking', name: '思考動作組', description: '想、知道、理解等思考動作', actionType: 'thinking', limit: 50 },
  { id: 'action-sensory', name: '感官動作組', description: '看、聽、聞等感官動作', actionType: 'sensory', limit: 50 },
];

// 視覺聯想分組定義
const VISUAL_GROUPS = [
  { id: 'visual-color', name: '顏色組', description: '各種顏色相關單字', visualFeature: 'color', limit: 50 },
  { id: 'visual-shape', name: '形狀組', description: '圓形、方形等形狀相關單字', visualFeature: 'shape', limit: 50 },
  { id: 'visual-size', name: '大小組', description: '大、小等大小相關單字', visualFeature: 'size', limit: 50 },
  { id: 'visual-material', name: '材質組', description: '木頭、金屬等材質相關單字', visualFeature: 'material', limit: 50 },
];

// 時間分組定義
const TEMPORAL_GROUPS = [
  { id: 'temporal-time-point', name: '時間點組', description: '早上、中午、晚上等時間點', temporalCategory: 'time_point', limit: 50 },
  { id: 'temporal-season', name: '季節組', description: '春夏秋冬等季節', temporalCategory: 'season', limit: 50 },
  { id: 'temporal-month', name: '月份組', description: '一月到十二月', temporalCategory: 'month', limit: 50 },
  { id: 'temporal-duration', name: '時間長度組', description: '秒、分、時、天等時間長度', temporalCategory: 'duration', limit: 50 },
];

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '未登入' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const path = searchParams.get('path') || 'mixed';
    const geptLevel = searchParams.get('geptLevel') || 'ELEMENTARY';

    console.log(`📚 獲取分組數據: path=${path}, geptLevel=${geptLevel}`);

    // 根據路徑選擇分組定義
    let groupDefinitions: any[] = [];

    if (path === 'prefix') {
      groupDefinitions = PREFIX_GROUPS;
    } else if (path === 'root') {
      // 字根分組（暫時使用主題分組代替，後續可以添加專門的字根分組）
      groupDefinitions = THEME_GROUPS;
    } else if (path === 'suffix') {
      // 字尾分組（暫時使用主題分組代替，後續可以添加專門的字尾分組）
      groupDefinitions = THEME_GROUPS;
    } else if (path === 'theme') {
      groupDefinitions = THEME_GROUPS;
    } else if (path === 'frequency') {
      groupDefinitions = FREQUENCY_GROUPS;
    } else if (path === 'mixed') {
      // 混合模式：前 22 組是字首，後 26 組是主題
      groupDefinitions = [...PREFIX_GROUPS, ...THEME_GROUPS];
    } else if (path === 'partOfSpeech') {
      groupDefinitions = PART_OF_SPEECH_GROUPS;
    } else if (path === 'syllable') {
      groupDefinitions = SYLLABLE_GROUPS;
    } else if (path === 'context') {
      groupDefinitions = CONTEXT_GROUPS;
    } else if (path === 'emotional') {
      groupDefinitions = EMOTIONAL_GROUPS;
    } else if (path === 'action') {
      groupDefinitions = ACTION_GROUPS;
    } else if (path === 'visual') {
      groupDefinitions = VISUAL_GROUPS;
    } else if (path === 'temporal') {
      groupDefinitions = TEMPORAL_GROUPS;
    } else {
      // 默認使用主題分組
      groupDefinitions = THEME_GROUPS;
    }

    // 獲取用戶的學習進度
    const userProgress = await prisma.userWordProgress.findMany({
      where: {
        userId: session.user.id,
        word: {
          geptLevel: geptLevel as any
        }
      },
      include: {
        word: true
      }
    });

    // 構建分組數據
    const groups = await Promise.all(
      groupDefinitions.map(async (groupDef, index) => {
        // 構建查詢條件
        let whereClause: any = {
          geptLevel: geptLevel as any
        };

        // 根據分組類型添加條件
        if (groupDef.prefix) {
          if (Array.isArray(groupDef.prefix)) {
            whereClause.OR = groupDef.prefix.map((p: string) => ({
              english: { startsWith: p, mode: 'insensitive' }
            }));
          } else {
            whereClause.english = { startsWith: groupDef.prefix, mode: 'insensitive' };
          }
        } else if (groupDef.theme) {
          whereClause.theme = groupDef.theme;
        } else if (groupDef.frequency) {
          whereClause.frequency = groupDef.frequency;
        } else if (groupDef.partOfSpeech) {
          whereClause.partOfSpeech = groupDef.partOfSpeech;
        } else if (groupDef.syllableCount) {
          whereClause.syllableCount = groupDef.syllableCount;
        } else if (groupDef.context) {
          whereClause.context = groupDef.context;
        } else if (groupDef.emotionalTone) {
          whereClause.emotionalTone = groupDef.emotionalTone;
        } else if (groupDef.actionType) {
          whereClause.actionType = groupDef.actionType;
        } else if (groupDef.visualFeature) {
          whereClause.visualFeature = groupDef.visualFeature;
        } else if (groupDef.temporalCategory) {
          whereClause.temporalCategory = groupDef.temporalCategory;
        }

        // 獲取該組的單字
        const words = await prisma.vocabularyItem.findMany({
          where: whereClause,
          skip: groupDef.skip || 0,
          take: groupDef.limit || 50,
          select: { id: true }
        });

        const wordIds = words.map(w => w.id);

        // 計算該組的學習進度
        const groupProgress = userProgress.filter(p => wordIds.includes(p.wordId));
        const learnedCount = groupProgress.length;
        const masteredCount = groupProgress.filter(p => p.memoryStrength >= 80).length;
        const completionRate = wordIds.length > 0 
          ? Math.round((masteredCount / wordIds.length) * 100) 
          : 0;

        // 解鎖邏輯：第一組自動解鎖，其他組需要前一組完成 80%
        let isUnlocked = index === 0;
        if (index > 0) {
          const prevGroupDef = groupDefinitions[index - 1];
          let prevWhereClause: any = {
            geptLevel: geptLevel as any
          };

          if (prevGroupDef.prefix) {
            if (Array.isArray(prevGroupDef.prefix)) {
              prevWhereClause.OR = prevGroupDef.prefix.map((p: string) => ({
                english: { startsWith: p, mode: 'insensitive' }
              }));
            } else {
              prevWhereClause.english = { startsWith: prevGroupDef.prefix, mode: 'insensitive' };
            }
          } else if (prevGroupDef.theme) {
            prevWhereClause.theme = prevGroupDef.theme;
          } else if (prevGroupDef.frequency) {
            prevWhereClause.frequency = prevGroupDef.frequency;
          } else if (prevGroupDef.partOfSpeech) {
            prevWhereClause.partOfSpeech = prevGroupDef.partOfSpeech;
          } else if (prevGroupDef.syllableCount) {
            prevWhereClause.syllableCount = prevGroupDef.syllableCount;
          } else if (prevGroupDef.context) {
            prevWhereClause.context = prevGroupDef.context;
          } else if (prevGroupDef.emotionalTone) {
            prevWhereClause.emotionalTone = prevGroupDef.emotionalTone;
          } else if (prevGroupDef.actionType) {
            prevWhereClause.actionType = prevGroupDef.actionType;
          } else if (prevGroupDef.visualFeature) {
            prevWhereClause.visualFeature = prevGroupDef.visualFeature;
          } else if (prevGroupDef.temporalCategory) {
            prevWhereClause.temporalCategory = prevGroupDef.temporalCategory;
          }

          const prevWords = await prisma.vocabularyItem.findMany({
            where: prevWhereClause,
            skip: prevGroupDef.skip || 0,
            take: prevGroupDef.limit || 50,
            select: { id: true }
          });

          const prevWordIds = prevWords.map(w => w.id);
          const prevGroupProgress = userProgress.filter(p => prevWordIds.includes(p.wordId));
          const prevMasteredCount = prevGroupProgress.filter(p => p.memoryStrength >= 80).length;
          const prevCompletionRate = prevWordIds.length > 0 
            ? Math.round((prevMasteredCount / prevWordIds.length) * 100) 
            : 0;

          isUnlocked = prevCompletionRate >= 80;
        }

        return {
          id: groupDef.id,
          name: groupDef.name,
          description: groupDef.description,
          wordCount: wordIds.length,
          learnedCount,
          masteredCount,
          completionRate,
          isUnlocked
        };
      })
    );

    console.log(`✅ 成功獲取 ${groups.length} 個分組`);

    return NextResponse.json({
      success: true,
      groups
    });

  } catch (error) {
    console.error('❌ 獲取分組數據失敗:', error);
    return NextResponse.json(
      {
        error: '獲取分組數據失敗',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}

