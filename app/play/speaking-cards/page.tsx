'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import UnifiedNavigation from '@/components/navigation/UnifiedNavigation';
import { useResponsiveLayout } from './useResponsiveLayout';
import { useContainerResponsiveLayout } from './useContainerResponsiveLayout';

interface CardData {
  id: string;
  text?: string;
  imageUrl?: string;
  audioUrl?: string;
}

function SpeakingCardsGame() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  // 使用響應式佈局 Hook
  const responsive = useResponsiveLayout();

  // 使用容器感知的響應式佈局 Hook
  const containerLayout = useContainerResponsiveLayout();

  const [cards, setCards] = useState<CardData[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activityTitle, setActivityTitle] = useState('');
  const [shuffledCards, setShuffledCards] = useState<CardData[]>([]);

  // 載入活動數據
  useEffect(() => {
    const activityId = searchParams.get('activityId');
    if (activityId) {
      loadActivity(activityId);
    }
  }, [searchParams]);

  const loadActivity = async (activityId: string) => {
    try {
      const response = await fetch(`/api/activities/${activityId}`);
      if (response.ok) {
        const activity = await response.json();
        setActivityTitle(activity.title);

        // 轉換詞彙數據為卡片數據
        const cardData = activity.vocabularyItems.map((item: any) => ({
          id: item.id,
          text: item.english || '',
          imageUrl: item.imageUrl,
          audioUrl: item.audioUrl,
        }));

        setCards(cardData);
        setShuffledCards(shuffleArray([...cardData]));
      }
    } catch (error) {
      console.error('載入活動失敗:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 洗牌函數
  const shuffleArray = (array: CardData[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // 翻卡
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    
    // 如果翻開卡片且有語音，播放語音
    if (!isFlipped && shuffledCards[currentCardIndex]?.audioUrl) {
      playAudio(shuffledCards[currentCardIndex].audioUrl!);
    }
  };

  // 播放語音
  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play().catch(error => {
      console.error('播放語音失敗:', error);
    });
  };

  // 下一張卡片
  const handleNext = () => {
    if (currentCardIndex < shuffledCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  // 進行到下一張卡片（不翻回，直接顯示下一張背面）
  const handleAdvanceToNext = () => {
    if (currentCardIndex < shuffledCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  // 上一張卡片 - 直接顯示內容，或翻回背景
  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      const prevIndex = currentCardIndex - 1;
      setCurrentCardIndex(prevIndex);
      // 保持 isFlipped 為 true，直接顯示上一張卡片內容
      // 如果有語音，播放語音
      if (shuffledCards[prevIndex]?.audioUrl) {
        playAudio(shuffledCards[prevIndex].audioUrl!);
      }
    } else {
      // 如果已經是第一張，翻回背景（未翻開狀態）
      setIsFlipped(false);
    }
  };

  // 重新洗牌
  const handleShuffle = () => {
    setShuffledCards(shuffleArray([...cards]));
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  // 撤銷（回到上一張）
  const handleUndo = () => {
    handlePrevious();
  };

  // 翻卡並自動進行到下一張
  const handleCardFlip = () => {
    if (isFlipped) {
      // 如果已翻開，直接進行到下一張
      handleNext();
    } else {
      // 如果未翻開，翻開卡片
      handleFlip();
    }
  };

  // 點擊右邊卡片時的邏輯 - 直接顯示內容，再點進行到下一張
  const handleFlippedCardClick = () => {
    if (isFlipped) {
      // 如果已翻開，進行到下一張並翻開新卡片
      if (currentCardIndex < shuffledCards.length - 1) {
        const nextIndex = currentCardIndex + 1;
        setCurrentCardIndex(nextIndex);
        // 保持 isFlipped 為 true，直接顯示下一張卡片內容
        // 如果有語音，播放語音
        if (shuffledCards[nextIndex]?.audioUrl) {
          playAudio(shuffledCards[nextIndex].audioUrl!);
        }
      }
    } else {
      // 如果未翻開，翻開卡片
      handleFlip();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  const currentCard = shuffledCards[currentCardIndex];

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed flex flex-col"
      style={{
        backgroundImage: 'url(/images/speaking-cards-bg.png)'
      }}
    >
      <div className="flex-1 flex flex-col max-w-7xl mx-auto w-full" style={{
        padding: responsive.margins ? `${responsive.margins.top}px ${responsive.margins.side}px` : '32px 16px'
      }}>
        {/* 標題 */}
        <div className="text-center" style={{
          marginBottom: responsive.fontSize?.title ? `${responsive.fontSize.title / 2}px` : '16px'
        }}>
          <h1 style={{
            fontSize: responsive.fontSize?.title ? `${responsive.fontSize.title}px` : '32px',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '8px'
          }}>
            {activityTitle}
          </h1>
          <p style={{
            fontSize: responsive.fontSize?.subtitle ? `${responsive.fontSize.subtitle}px` : '16px',
            color: '#4b5563'
          }}>
            卡片 {currentCardIndex + 1} / {shuffledCards.length}
          </p>
        </div>

        {/* 遊戲區域 - 添加尺寸限制和 overflow 控制 */}
        <div
          ref={containerLayout.containerRef}
          style={{
            display: 'flex',
            flexDirection: responsive.isMobile ? 'column' : 'row',
            gap: responsive.gaps?.horizontal ? `${responsive.gaps.horizontal}px` : '32px',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: '100%',
            maxHeight: '100vh',
            overflow: 'hidden',
            position: 'relative'
          }}>
          {/* 左側：卡牌堆 - 可點擊回到上一張 */}
          <div
            className={`relative cursor-pointer group transition-opacity ${
              currentCardIndex === shuffledCards.length - 1 ? 'opacity-30 cursor-not-allowed' : ''
            }`}
            onClick={handlePrevious}
            onTouchEnd={handlePrevious}
            title={currentCardIndex === shuffledCards.length - 1 ? '沒有上一張卡片' : '點擊回到上一張'}
            style={{
              // 確保卡片堆疊不超出容器
              maxWidth: `${containerLayout.cardWidth + 16}px`,
              maxHeight: `${containerLayout.cardHeight + 16}px`
            }}
          >
            <div
              className="rounded-xl shadow-2xl border-4 border-white relative overflow-hidden group-hover:shadow-3xl transition-all active:scale-95 transform"
              style={{
                width: `${containerLayout.cardWidth}px`,
                height: `${containerLayout.cardHeight}px`
              }}
            >
              {/* 卡牌背面圖片 */}
              <img
                src="/images/card-back.png"
                alt="Card Back"
                className="w-full h-full object-cover pointer-events-none"
              />
            </div>
            {/* 堆疊效果 */}
            <div
              className="absolute rounded-xl shadow-xl border-4 border-white -z-10 overflow-hidden group-hover:shadow-lg transition-all"
              style={{
                top: '8px',
                left: '8px',
                width: `${containerLayout.cardWidth}px`,
                height: `${containerLayout.cardHeight}px`
              }}
            >
              <img
                src="/images/card-back.png"
                alt="Card Back"
                className="w-full h-full object-cover pointer-events-none"
              />
            </div>
            <div
              className="absolute rounded-xl shadow-lg border-4 border-white -z-20 overflow-hidden group-hover:shadow-md transition-all"
              style={{
                top: '16px',
                left: '16px',
                width: `${containerLayout.cardWidth}px`,
                height: `${containerLayout.cardHeight}px`
              }}
            >
              <img
                src="/images/card-back.png"
                alt="Card Back"
                className="w-full h-full object-cover pointer-events-none"
              />
            </div>
          </div>

          {/* 右側：發牌區域 */}
          <div className="relative">
            {currentCard && isFlipped ? (
              <div
                onClick={handleFlippedCardClick}
                onTouchEnd={handleFlippedCardClick}
                className="rounded-xl shadow-2xl border-4 border-blue-200 flex flex-col items-center justify-center bg-cover bg-center cursor-pointer hover:shadow-xl transition-all active:scale-95 transform"
                style={{
                  width: `${containerLayout.cardWidth}px`,
                  height: `${containerLayout.cardHeight}px`,
                  padding: responsive.gaps?.horizontal ? `${responsive.gaps.horizontal}px` : '24px',
                  backgroundImage: 'url(/images/card-front-bg.png)'
                }}
                title="點擊進行下一張"
              >
                {/* 圖片 */}
                {currentCard.imageUrl && (
                  <img
                    src={currentCard.imageUrl}
                    alt={currentCard.text}
                    className="object-cover rounded-lg pointer-events-none"
                    style={{
                      width: '100%',
                      height: `${containerLayout.cardHeight * 0.4}px`,
                      marginBottom: responsive.gaps?.vertical ? `${responsive.gaps.vertical}px` : '16px'
                    }}
                  />
                )}

                {/* 文字 */}
                {currentCard.text && (
                  <p
                    className="font-bold text-gray-900 text-center pointer-events-none"
                    style={{
                      fontSize: responsive.fontSize?.body ? `${responsive.fontSize.body}px` : '18px'
                    }}
                  >
                    {currentCard.text}
                  </p>
                )}

                {/* 語音圖標 */}
                {currentCard.audioUrl && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playAudio(currentCard.audioUrl!);
                    }}
                    className="bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
                    style={{
                      marginTop: responsive.gaps?.vertical ? `${responsive.gaps.vertical}px` : '16px',
                      padding: responsive.buttonSize?.padding || '12px'
                    }}
                  >
                    <svg className="text-blue-600" fill="currentColor" viewBox="0 0 20 20" style={{
                      width: responsive.fontSize?.body ? `${responsive.fontSize.body}px` : '18px',
                      height: responsive.fontSize?.body ? `${responsive.fontSize.body}px` : '18px'
                    }}>
                      <path d="M10 3.5a.5.5 0 00-.5-.5h-3a.5.5 0 00-.5.5v13a.5.5 0 00.5.5h3a.5.5 0 00.5-.5v-13zM8 5a1 1 0 011-1h2a1 1 0 011 1v10a1 1 0 01-1 1H9a1 1 0 01-1-1V5z"/>
                      <path d="M14.5 8a.5.5 0 01.5.5v3a.5.5 0 01-1 0v-3a.5.5 0 01.5-.5zm2-2a.5.5 0 01.5.5v7a.5.5 0 01-1 0v-7a.5.5 0 01.5-.5z"/>
                    </svg>
                  </button>
                )}
              </div>
            ) : (
              <div
                onClick={handleFlippedCardClick}
                onTouchEnd={handleFlippedCardClick}
                className="rounded-xl shadow-2xl border-4 border-blue-200 cursor-pointer hover:shadow-xl transition-all active:scale-95 transform bg-transparent flex items-center justify-center"
                style={{
                  width: `${containerLayout.cardWidth}px`,
                  height: `${containerLayout.cardHeight}px`
                }}
                title="點擊進行下一張"
              >
                <p
                  className="text-gray-300 font-semibold drop-shadow-lg pointer-events-none"
                  style={{
                    fontSize: responsive.fontSize?.body ? `${responsive.fontSize.body}px` : '16px'
                  }}
                >
                  點擊進行下一張
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 控制按鈕 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: responsive.gaps?.horizontal ? `${responsive.gaps.horizontal}px` : '16px',
          marginTop: responsive.margins?.top ? `${responsive.margins.top}px` : '32px',
          flexDirection: responsive.isMobile ? 'column' : 'row'
        }}>
          <button
            onClick={handleShuffle}
            className="bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            style={{
              padding: responsive.buttonSize?.padding || '12px 24px',
              fontSize: responsive.buttonSize?.fontSize ? `${responsive.buttonSize.fontSize}px` : '16px',
              width: responsive.isMobile ? '100%' : 'auto'
            }}
          >
            🔀 Shuffle
          </button>
          <button
            onClick={handleUndo}
            disabled={currentCardIndex === 0}
            className="bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              padding: responsive.buttonSize?.padding || '12px 24px',
              fontSize: responsive.buttonSize?.fontSize ? `${responsive.buttonSize.fontSize}px` : '16px',
              width: responsive.isMobile ? '100%' : 'auto'
            }}
          >
            ↶ Undo
          </button>
        </div>

        {/* 返回按鈕 */}
        <div className="flex justify-center mt-8">
          <button
            onClick={() => router.push('/my-activities')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            返回我的活動
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SpeakingCardsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    }>
      <SpeakingCardsGame />
    </Suspense>
  );
}

