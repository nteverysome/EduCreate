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
    } else if (path === 'theme') {
      groupDefinitions = THEME_GROUPS;
    } else if (path === 'frequency') {
      groupDefinitions = FREQUENCY_GROUPS;
    } else if (path === 'mixed') {
      // 混合模式：前 22 組是字首，後 26 組是主題
      groupDefinitions = [...PREFIX_GROUPS, ...THEME_GROUPS];
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

