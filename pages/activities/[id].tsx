import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { ArrowLeftIcon, ShareIcon, HeartIcon, EyeIcon, UserGroupIcon, ClockIcon, TagIcon, ArrowDownTrayIcon, PlayIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';

interface Activity {
  id: string;
  title: string;
  description?: string;
  templateType: string;
  createdAt: string;
  updatedAt?: string;
  published: boolean;
  views?: number;
  interactions?: number;
  tags?: string[];
  author?: {
    name: string;
    avatar?: string;
  };
  thumbnail?: string;
  content?: any;
  relatedActivities?: Activity[];
}

export default function ActivityDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { data: session } = useSession();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeTab, setActiveTab] = useState('preview'); // preview, details, comments
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [learningProgress, setLearningProgress] = useState<number>(0);
  const [lastStudied, setLastStudied] = useState<string | null>(null);
  const [studyStreak, setStudyStreak] = useState<number>(0);

  // 獲取活動數據
  useEffect(() => {
    if (!id) return;

    // 在實際應用中，這裡會從API獲取數據
    const mockActivity: Activity = {
      id: id as string,
      title: '英語詞彙學習',
      description: '基礎英語詞彙學習卡片，適合初學者使用。包含常用詞彙和例句，幫助快速掌握基礎詞彙。這個活動包括100個最常用的英語單詞，每個單詞都配有發音、例句和中文翻譯。學生可以通過卡片翻轉來測試自己的記憶力，也可以通過聽發音來提高聽力能力。',
      templateType: 'FLASHCARDS',
      createdAt: '2023-10-15T10:30:00Z',
      updatedAt: '2023-10-16T08:45:00Z',
      published: true,
      views: 1250,
      interactions: 450,
      tags: ['英語', '詞彙', '初級'],
      author: {
        name: '王老師',
        avatar: 'https://randomuser.me/api/portraits/women/17.jpg'
      },
      thumbnail: '/templates/vocab-flashcards.jpg',
      content: {
        cards: [
          { front: 'Hello', back: '你好', example: 'Hello, how are you?' },
          { front: 'Goodbye', back: '再見', example: 'Goodbye, see you tomorrow.' },
          { front: 'Thank you', back: '謝謝', example: 'Thank you for your help.' },
          { front: 'Sorry', back: '對不起', example: 'I\'m sorry for being late.' },
          { front: 'Friend', back: '朋友', example: 'She is my best friend.' }
        ]
      },
      relatedActivities: [
        {
          id: '2',
          title: '數學概念配對',
          description: '數學術語與定義配對練習',
          templateType: 'MATCHING',
          createdAt: '2023-10-10T14:20:00Z',
          published: true,
          views: 985,
          thumbnail: '/templates/math-matching.jpg'
        },
        {
          id: '6',
          title: '語法結構練習',
          description: '英語語法結構練習，包含句型變換、時態練習等多種題型',
          templateType: 'QUIZ',
          createdAt: '2023-09-20T11:25:00Z',
          published: true,
          views: 820,
          thumbnail: '/templates/grammar-practice.jpg'
        },
        {
          id: '7',
          title: '化學元素週期表',
          description: '互動式化學元素週期表學習工具',
          templateType: 'FLASHCARDS',
          createdAt: '2023-09-15T09:40:00Z',
          published: true,
          views: 930,
          thumbnail: '/templates/chemistry-elements.jpg'
        }
      ]
    };

    // 模擬API請求延遲
    setTimeout(() => {
      setActivity(mockActivity);
      setIsLoading(false);
    }, 500);
  }, [id]);

  // 獲取模板類型的顯示名稱和顏色
  const getTemplateInfo = (type: string) => {
    switch (type) {
      case 'FLASHCARDS':
        return { name: '單字卡片', color: 'bg-blue-100 text-blue-800' };
      case 'MATCHING':
        return { name: '配對遊戲', color: 'bg-purple-100 text-purple-800' };
      case 'QUIZ':
        return { name: '測驗問答', color: 'bg-pink-100 text-pink-800' };
      default:
        return { name: '其他', color: 'bg-gray-100 text-gray-800' };
    }
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // 切換收藏狀態
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // 在實際應用中，這裡會調用API來更新收藏狀態
  };

  // 分享活動
  const [showShareModal, setShowShareModal] = useState(false);
  
  const shareActivity = () => {
    setShowShareModal(true);
  };
  
  // 關閉分享模態框
  const closeShareModal = () => {
    setShowShareModal(false);
  };
  
  // 複製鏈接到剪貼板
  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('鏈接已複製到剪貼板');
  };
  
  // 分享到社交媒體
  const shareToSocial = (platform: string) => {
    let shareLink = '';
    const encodedUrl = encodeURIComponent(window.location.href);
    const encodedTitle = encodeURIComponent(`來看看我在 EduCreate 發現的「${activity?.title}」活動！`);
    
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'wechat':
        // 在實際應用中，這裡可以生成二維碼
        alert('微信分享功能開發中');
        return;
      default:
        return;
    }
    
    window.open(shareLink, '_blank', 'width=600,height=400');
  };
  
  // 分享模態框
  const renderShareModal = () => {
    if (!showShareModal) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">分享活動</h2>
            <button 
              onClick={closeShareModal}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">分享鏈接</label>
            <div className="flex">
              <input
                type="text"
                value={window.location.href}
                readOnly
                className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                onClick={copyLinkToClipboard}
                className="px-4 py-2 rounded-r-md bg-indigo-600 text-white"
              >
                複製
              </button>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">分享到社交媒體</label>
            <div className="flex space-x-4">
              <button 
                onClick={() => shareToSocial('facebook')}
                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                aria-label="分享到 Facebook"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                </svg>
              </button>
              <button 
                onClick={() => shareToSocial('twitter')}
                className="p-2 bg-blue-400 text-white rounded-full hover:bg-blue-500"
                aria-label="分享到 Twitter"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                </svg>
              </button>
              <button 
                onClick={() => shareToSocial('linkedin')}
                className="p-2 bg-blue-700 text-white rounded-full hover:bg-blue-800"
                aria-label="分享到 LinkedIn"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </button>
              <button 
                onClick={() => shareToSocial('wechat')}
                className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600"
                aria-label="分享到微信"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.691 2C4.768 2 1.25 4.96 1.25 8.516c0 1.944 1.036 3.688 2.771 4.888l-.691 2.088 2.424-.808c.837.234 1.727.38 2.639.38.233 0 .465-.012.696-.028-.146-.466-.227-.96-.227-1.47 0-3.205 3.052-5.836 6.862-5.836.184 0 .37.012.552.028C15.832 4.764 12.438 2 8.691 2zm-1.75 3.12c-.483 0-.875-.392-.875-.87s.392-.87.875-.87.875.392.875.87-.392.87-.875.87zm4.375 0c-.483 0-.875-.392-.875-.87s.392-.87.875-.87.875.392.875.87-.392.87-.875.87zm4.532 5.308c0-2.749-2.758-4.994-6.153-4.994s-6.153 2.245-6.153 4.994c0 2.745 2.758 4.994 6.153 4.994.718 0 1.407-.103 2.045-.286l1.866.622-.513-1.551c1.424-.903 2.755-2.294 2.755-3.779zm-8.13-1.075c-.329 0-.598-.27-.598-.6s.269-.6.598-.6.598.27.598.6-.269.6-.598.6zm3.958 0c-.329 0-.598-.27-.598-.6s.269-.6.598-.6.598.27.598.6-.269.6-.598.6z" />
                </svg>
              </button>
            </div>
          </div>
          
          <div className="mt-6">
            <button 
              onClick={closeShareModal}
              className="w-full py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              關閉
            </button>
          </div>
        </div>
      </div>
    );
  };

  // 渲染單字卡片預覽
  const FlashcardsPreview = () => {
    const [activeCardIndex, setActiveCardIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isLearningMode, setIsLearningMode] = useState(false);
    const [learnedCards, setLearnedCards] = useState<Set<number>>(new Set());

    if (!activity?.content?.cards || activity.content.cards.length === 0) {
      return <div className="text-center text-gray-500">沒有可用的卡片內容</div>;
    }

    const handleCardFlip = () => {
      setIsFlipped(!isFlipped);
    };

    const handleNextCard = () => {
      if (activeCardIndex < activity.content.cards.length - 1) {
        setActiveCardIndex(activeCardIndex + 1);
        setIsFlipped(false);
      } else {
        // 完成學習
        setIsLearningMode(false);
        alert('恭喜您完成了所有卡片的學習！');
      }
    };

    const handlePrevCard = () => {
      if (activeCardIndex > 0) {
        setActiveCardIndex(activeCardIndex - 1);
        setIsFlipped(false);
      }
    };

    const handleMarkAsLearned = () => {
      const newLearnedCards = new Set(learnedCards);
      newLearnedCards.add(activeCardIndex);
      setLearnedCards(newLearnedCards);
      handleNextCard();
    };

    const startLearningMode = () => {
      setIsLearningMode(true);
      setActiveCardIndex(0);
      setIsFlipped(false);
    };

    // 學習模式
    if (isLearningMode) {
      const currentCard = activity.content.cards[activeCardIndex];
      const progress = Math.round((activeCardIndex / activity.content.cards.length) * 100);
      
      return (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={() => setIsLearningMode(false)}
              className="text-gray-600 hover:text-gray-900 flex items-center"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-1" />
              返回預覽
            </button>
            <div className="text-sm text-gray-600">
              {activeCardIndex + 1} / {activity.content.cards.length}
            </div>
          </div>
          
          {/* 進度條 */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div 
              className="bg-primary h-2.5 rounded-full transition-all duration-300" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          {/* 卡片 */}
          <motion.div 
            className="bg-white rounded-lg shadow-lg overflow-hidden cursor-pointer max-w-md mx-auto"
            onClick={handleCardFlip}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.5 }}
            style={{ perspective: 1000 }}
          >
            <div className="relative" style={{ transformStyle: 'preserve-3d', minHeight: '200px' }}>
              <div 
                className={`absolute w-full h-full backface-hidden p-8 ${isFlipped ? 'opacity-0' : 'opacity-100'}`}
                style={{ backfaceVisibility: 'hidden', transition: 'opacity 0.5s' }}
              >
                <h3 className="text-2xl font-bold text-center mb-4">{currentCard.front}</h3>
                <p className="text-gray-500 text-center text-sm">點擊卡片查看答案</p>
              </div>
              <div 
                className={`absolute w-full h-full backface-hidden p-8 bg-gray-50 ${isFlipped ? 'opacity-100' : 'opacity-0'}`}
                style={{ backfaceVisibility: 'hidden', transition: 'opacity 0.5s' }}
              >
                <h3 className="text-2xl font-bold text-center mb-4">{currentCard.back}</h3>
                {currentCard.example && (
                  <p className="text-gray-600 text-center mt-4 italic">例句: {currentCard.example}</p>
                )}
              </div>
            </div>
          </motion.div>
          
          {/* 控制按鈕 */}
          <div className="flex justify-center space-x-4 mt-8">
            <button 
              onClick={handlePrevCard}
              disabled={activeCardIndex === 0}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              上一張
            </button>
            <button 
              onClick={handleMarkAsLearned}
              className="btn-primary"
            >
              已學會
            </button>
            <button 
              onClick={handleNextCard}
              disabled={activeCardIndex === activity.content.cards.length - 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              下一張
            </button>
          </div>
        </div>
      );
    }

    // 預覽模式
    return (
      <div className="space-y-6">
        <div className="flex justify-center mb-4">
          <button 
            onClick={startLearningMode}
            className="btn-primary flex items-center"
          >
            <PlayIcon className="h-5 w-5 mr-2" />
            開始學習
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activity.content.cards.map((card: any, index: number) => (
            <motion.div 
              key={index} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            >
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-xl font-bold text-center">{card.front}</h3>
              </div>
              <div className="p-4 bg-gray-50">
                <p className="text-gray-800 text-center">{card.back}</p>
                {card.example && (
                  <p className="text-gray-500 text-sm mt-2 italic">例句: {card.example}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  // 渲染活動詳情
  const renderActivityDetails = () => {
    if (!activity) return null;

    // 評分系統
    const renderRatingStars = () => {
      return (
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="focus:outline-none"
              onClick={() => {
                setUserRating(star);
                // 在實際應用中，這裡會發送API請求保存評分
                alert(`感謝您的評分：${star}星！`);
              }}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(null)}
            >
              <svg
                className={`w-6 h-6 ${((hoverRating ?? 0) || (userRating ?? 0)) >= star ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
          <span className="text-sm text-gray-600 ml-2">
            {userRating ? `您的評分：${userRating}星` : '點擊評分'}
          </span>
        </div>
      );
    };

    // 學習進度
    const renderLearningProgress = () => {
      // 在實際應用中，這些數據會從API獲取
      const lastStudiedDate = lastStudied || '尚未開始學習';
      const formattedDate = lastStudied ? formatDate(lastStudied) : '尚未開始學習';
      
      return (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="text-lg font-semibold mb-4">學習進度</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">完成進度</h4>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                    style={{ width: `${learningProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{learningProgress}% 完成</p>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">最近學習</h4>
              <p>{formattedDate}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">學習連續天數</h4>
              <div className="flex items-center">
                <span className="text-primary font-bold text-lg">{studyStreak}</span>
                <span className="ml-1 text-gray-600">天</span>
                {studyStreak >= 3 && (
                  <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">🔥 連續學習中</span>
                )}
              </div>
            </div>
            <div className="pt-2">
              <button 
                onClick={() => {
                  // 模擬開始學習
                  const today = new Date().toISOString();
                  setLastStudied(today);
                  setLearningProgress(Math.min(learningProgress + 20, 100));
                  setStudyStreak(studyStreak + 1);
                }}
                className="btn-primary text-sm"
              >
                繼續學習
              </button>
            </div>
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">活動詳情</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">活動名稱</h4>
              <p>{activity.title}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">描述</h4>
              <p>{activity.description}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">模板類型</h4>
              <p>{getTemplateInfo(activity.templateType).name}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">標籤</h4>
              <div className="flex flex-wrap gap-1 mt-1">
                {activity.tags?.map(tag => (
                  <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">創建日期</h4>
              <p>{formatDate(activity.createdAt)}</p>
            </div>
            {activity.updatedAt && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">最後更新</h4>
                <p>{formatDate(activity.updatedAt)}</p>
              </div>
            )}
            <div>
              <h4 className="text-sm font-medium text-gray-500">瀏覽次數</h4>
              <p>{activity.views}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">互動次數</h4>
              <p>{activity.interactions}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500">用戶評分</h4>
              {renderRatingStars()}
            </div>
          </div>
        </div>

        {session && renderLearningProgress()}

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">作者信息</h3>
          <div className="flex items-center">
            {activity.author?.avatar && (
              <Image 
                src={activity.author.avatar} 
                alt={activity.author.name} 
                width={48}
                height={48}
                className="w-12 h-12 rounded-full mr-4"
              />
            )}
            <div>
              <p className="font-medium">{activity.author?.name}</p>
              <p className="text-sm text-gray-500">教育工作者</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 渲染評論區
  const CommentsSection = () => {
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState([
      {
        id: '1',
        user: {
          name: '林老師',
          avatar: 'https://randomuser.me/api/portraits/women/32.jpg'
        },
        date: '2023年10月20日',
        content: '這個活動非常適合我的初級英語課程，學生們很喜歡這種互動式學習方式。',
        likes: 12,
        isLiked: false
      },
      {
        id: '2',
        user: {
          name: '張教授',
          avatar: 'https://randomuser.me/api/portraits/men/45.jpg'
        },
        date: '2023年10月18日',
        content: '單詞選擇很實用，但希望能增加更多的例句和發音功能。',
        likes: 8,
        isLiked: false
      },
      {
        id: '3',
        user: {
          name: '陳老師',
          avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
        },
        date: '2023年10月15日',
        content: '我已經在我的課堂上使用了這個活動，效果很好。學生們的詞彙記憶明顯提高了。',
        likes: 15,
        isLiked: true
      }
    ]);

    // 處理評論提交
    const handleSubmitComment = () => {
      if (!commentText.trim()) {
        alert('請輸入評論內容');
        return;
      }

      // 創建新評論
      const newComment = {
        id: Date.now().toString(),
        user: {
          name: session?.user?.name || '匿名用戶',
          avatar: session?.user?.image || 'https://randomuser.me/api/portraits/lego/1.jpg'
        },
        date: new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' }),
        content: commentText,
        likes: 0,
        isLiked: false
      };

      // 添加到評論列表
      setComments([newComment, ...comments]);
      setCommentText('');

      // 顯示成功消息
      alert('評論發布成功！');
    };

    // 處理評論點讚
    const handleLikeComment = (commentId: string) => {
      setComments(comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
            isLiked: !comment.isLiked
          };
        }
        return comment;
      }));
    };

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">評論 ({comments.length})</h3>
            <div className="text-sm text-gray-500">
              按 <button className="text-primary hover:underline">最新</button> | <button className="hover:underline">最熱</button>
            </div>
          </div>
          
          <div className="space-y-6">
            {comments.map((comment) => (
              <motion.div 
                key={comment.id} 
                className="border-b border-gray-100 pb-4 last:border-0"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-start mb-2">
                  <Image 
                    src={comment.user.avatar} 
                    alt={comment.user.name} 
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="font-medium">{comment.user.name}</p>
                      <p className="text-sm text-gray-500">{comment.date}</p>
                    </div>
                    <p className="mt-1">{comment.content}</p>
                    <div className="mt-2 flex items-center">
                      <button 
                        onClick={() => handleLikeComment(comment.id)}
                        className={`flex items-center text-sm ${comment.isLiked ? 'text-primary' : 'text-gray-500'} hover:text-primary transition-colors`}
                      >
                        <svg className="h-4 w-4 mr-1" fill={comment.isLiked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                        </svg>
                        <span>{comment.likes}</span>
                      </button>
                      <button className="ml-4 text-sm text-gray-500 hover:text-primary transition-colors flex items-center">
                        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                        回覆
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {session ? (
          <motion.div 
            className="bg-white rounded-lg shadow-md p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <h3 className="text-lg font-semibold mb-4">添加評論</h3>
            <div className="flex items-start mb-4">
              <Image 
                src={session.user?.image || 'https://randomuser.me/api/portraits/lego/1.jpg'} 
                alt={session.user?.name || '用戶'} 
                width={40}
                height={40}
                className="w-10 h-10 rounded-full mr-3"
              />
              <div className="flex-1">
                <p className="font-medium">{session.user?.name || '匿名用戶'}</p>
                <textarea 
                  className="w-full border border-gray-300 rounded-lg p-3 mt-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  rows={4}
                  placeholder="分享您對這個活動的看法..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                className="btn-primary"
                onClick={handleSubmitComment}
              >
                發布評論
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="bg-white rounded-lg shadow-md p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <p className="text-gray-600 mb-3">登入後即可發表評論</p>
            <Link href="/api/auth/signin" className="btn-primary">
              登入
            </Link>
          </motion.div>
        )}
      </div>
    );
  };

  // 渲染相關活動
  const renderRelatedActivities = () => {
    if (!activity?.relatedActivities || activity.relatedActivities.length === 0) {
      return null;
    }

    return (
      <motion.div 
        className="mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-6">相關活動</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {activity.relatedActivities.map((relatedActivity, index) => {
            const templateInfo = getTemplateInfo(relatedActivity.templateType);
            return (
              <motion.div 
                key={relatedActivity.id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Link href={`/activities/${relatedActivity.id}`} className="block">
                  <div className="relative h-40 overflow-hidden">
                    <motion.img 
                      src={relatedActivity.thumbnail || '/templates/placeholder.svg'} 
                      alt={relatedActivity.title} 
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    />
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${templateInfo.color}`}>
                        {templateInfo.name}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2 text-gray-900 line-clamp-1">{relatedActivity.title}</h3>
                    {relatedActivity.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{relatedActivity.description}</p>
                    )}
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <div className="flex items-center">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        <span>{formatDate(relatedActivity.createdAt)}</span>
                      </div>
                      <div className="flex items-center">
                        <EyeIcon className="h-4 w-4 mr-1" />
                        <span>{relatedActivity.views || 0}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex justify-center items-center">
        <motion.div 
          className="flex flex-col items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-600">載入中，請稍候...</p>
        </motion.div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col justify-center items-center p-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">活動未找到</h1>
        <p className="text-gray-600 mb-6">抱歉，您請求的活動不存在或已被刪除。</p>
        <Link href="/activities" className="btn-primary">
          返回活動列表
        </Link>
      </div>
    );
  }

  const templateInfo = getTemplateInfo(activity.templateType);

  // 下載功能
  const handleDownload = () => {
    if (!activity) return;
    
    // 創建要下載的內容
    const content = {
      title: activity.title,
      description: activity.description,
      templateType: activity.templateType,
      content: activity.content,
      createdAt: activity.createdAt,
      author: activity.author?.name
    };
    
    // 將內容轉換為JSON字符串
    const jsonContent = JSON.stringify(content, null, 2);
    
    // 創建Blob對象
    const blob = new Blob([jsonContent], { type: 'application/json' });
    
    // 創建下載鏈接
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activity.title.replace(/\s+/g, '_')}.json`;
    
    // 觸發下載
    document.body.appendChild(a);
    a.click();
    
    // 清理
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      <Head>
        <title>{activity.title} - EduCreate</title>
        <meta name="description" content={activity.description} />
      </Head>
      
      {/* 分享模態框 */}
      {renderShareModal()}

      <motion.div 
        className="container mx-auto px-4 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* 返回按鈕 */}
        <div className="mb-6">
          <Link href="/activities" className="inline-flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeftIcon className="h-5 w-5 mr-1" />
            返回活動列表
          </Link>
        </div>

        {/* 活動標題和操作 */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <div className="flex items-center mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${templateInfo.color} mr-2`}>
                {templateInfo.name}
              </span>
              <span className="text-gray-500 text-sm flex items-center">
                <EyeIcon className="h-4 w-4 mr-1" />
                {activity.views} 次瀏覽
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{activity.title}</h1>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button 
              onClick={toggleFavorite}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {isFavorite ? (
                <>
                  <HeartIconSolid className="h-5 w-5 mr-1 text-red-500" />
                  <span>已收藏</span>
                </>
              ) : (
                <>
                  <HeartIcon className="h-5 w-5 mr-1 text-gray-500" />
                  <span>收藏</span>
                </>
              )}
            </button>
            <button 
              onClick={shareActivity}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ShareIcon className="h-5 w-5 mr-1 text-gray-500" />
              <span>分享</span>
            </button>
            <button 
              onClick={() => handleDownload()}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-1 text-gray-500" />
              <span>下載</span>
            </button>
          </div>
        </div>

        {/* 作者信息 */}
        <div className="flex items-center mb-6">
          {activity.author?.avatar && (
            <Image 
              src={activity.author.avatar} 
              alt={activity.author.name} 
              width={40}
              height={40}
              className="w-10 h-10 rounded-full mr-3"
            />
          )}
          <div>
            <p className="font-medium">{activity.author?.name}</p>
            <p className="text-sm text-gray-500">發布於 {formatDate(activity.createdAt)}</p>
          </div>
        </div>

        {/* 活動描述 */}
        {activity.description && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <p className="text-gray-700">{activity.description}</p>
            <div className="flex flex-wrap gap-1 mt-4">
              {activity.tags?.map(tag => (
                <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* 標籤頁 */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('preview')}
                className={`py-4 px-6 font-medium text-sm border-b-2 ${activeTab === 'preview' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                預覽
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`py-4 px-6 font-medium text-sm border-b-2 ${activeTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                詳情
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`py-4 px-6 font-medium text-sm border-b-2 ${activeTab === 'comments' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                評論 (3)
              </button>
            </nav>
          </div>
        </div>

        {/* 標籤頁內容 */}
        <div className="mb-8">
          {activeTab === 'preview' && <FlashcardsPreview />}
          {activeTab === 'details' && renderActivityDetails()}
          {activeTab === 'comments' && <CommentsSection />}
        </div>

        {/* 相關活動 */}
        {renderRelatedActivities()}
      </motion.div>
    </div>
  );
}