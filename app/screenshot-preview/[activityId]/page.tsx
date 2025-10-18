/**
 * 截圖預覽頁面
 * 專門用於 Railway 截圖服務
 * 
 * 特點：
 * - 不需要身份驗證（公開訪問）
 * - 100% 遊戲內容（全屏 iframe）
 * - 自動載入活動詞彙
 */

import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

interface PageProps {
  params: {
    activityId: string;
  };
}

export default async function ScreenshotPreviewPage({ params }: PageProps) {
  const { activityId } = params;

  // 載入活動數據（無需身份驗證）
  const activity = await prisma.activity.findFirst({
    where: {
      id: activityId,
      deletedAt: null, // 只載入未刪除的活動
    },
    select: {
      id: true,
      title: true,
      type: true,
      templateType: true,
      content: true, // 需要 content.gameTemplateId
    },
  });

  if (!activity) {
    notFound();
  }

  // 根據活動類型確定遊戲 URL
  const getGameUrl = () => {
    // 優先檢查 content.gameTemplateId（最準確）
    const content = activity.content as any;
    if (content && content.gameTemplateId) {
      return `/games/${content.gameTemplateId}/?activityId=${activityId}&customVocabulary=true`;
    }

    // 如果 type 已經是遊戲模板 ID 格式（包含 '-game'）
    if (activity.type && activity.type.includes('-game')) {
      return `/games/${activity.type}/?activityId=${activityId}&customVocabulary=true`;
    }

    // 根據 templateType 或 type 確定遊戲
    const gameType = activity.templateType || activity.type;

    switch (gameType) {
      case 'shimozurdo':
      case '飛機碰撞遊戲':
        return `/games/shimozurdo-game/?activityId=${activityId}&customVocabulary=true`;

      case 'vocabulary':
      case '詞彙遊戲':
        return `/games/vocabulary-game/?activityId=${activityId}&customVocabulary=true`;

      default:
        // 默認使用 shimozurdo 遊戲
        return `/games/shimozurdo-game/?activityId=${activityId}&customVocabulary=true`;
    }
  };

  const gameUrl = getGameUrl();

  return (
    <html lang="zh-TW">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{activity.title} - 截圖預覽</title>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          html, body {
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
          iframe {
            width: 100%;
            height: 100%;
            border: none;
            display: block;
          }
        `}</style>
      </head>
      <body>
        <iframe
          src={gameUrl}
          title={activity.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </body>
    </html>
  );
}

