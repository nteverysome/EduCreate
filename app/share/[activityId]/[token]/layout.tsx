/**
 * Layout for shared activity pages
 * Provides Open Graph meta tags for social sharing
 */

import { Metadata } from 'next';
import { generateFullOGImageUrl } from '@/lib/og/generateOGImageUrl';

interface Props {
  params: {
    activityId: string;
    token: string;
  };
}

/**
 * Generate metadata for shared activity page
 * This enables proper social sharing with dynamic preview images
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { activityId, token } = params;

  // 基礎 URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://edu-create.vercel.app';
  const pageUrl = `${baseUrl}/share/${activityId}/${token}`;

  // 生成 OG Image URL（使用默認參數）
  const ogImageUrl = generateFullOGImageUrl({
    activityId,
    title: '分享的遊戲活動',
    gameType: 'vocabulary',
  });

  return {
    title: '分享的遊戲活動 - EduCreate',
    description: '來玩這個有趣的教育遊戲！',
    openGraph: {
      title: '分享的遊戲活動 - EduCreate',
      description: '來玩這個有趣的教育遊戲！',
      url: pageUrl,
      siteName: 'EduCreate',
      images: [
        {
          url: ogImageUrl,
          width: 400,
          height: 300,
          alt: '遊戲預覽',
        },
      ],
      locale: 'zh_TW',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: '分享的遊戲活動 - EduCreate',
      description: '來玩這個有趣的教育遊戲！',
      images: [ogImageUrl],
    },
  };
}

export default function ShareLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

