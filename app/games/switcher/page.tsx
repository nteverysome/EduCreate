'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import GameSwitcher from '@/components/games/GameSwitcher';
import ShimozurdoGameContainer from '@/components/games/ShimozurdoGameContainer';
import UnifiedNavigation from '@/components/navigation/UnifiedNavigation';
import QRCodeModal from '@/components/results/QRCodeModal';
import ActivityToolbar from '@/components/games/ActivityToolbar';
import EnhancedActivityInfoBox from '@/components/games/EnhancedActivityInfoBox';
import RenameActivityModal from '@/components/games/RenameActivityModal';
import EmbedCodeModal from '@/components/games/EmbedCodeModal';
import PublishToCommunityModal from '@/components/activities/PublishToCommunityModal';
import AssignmentModal, { AssignmentConfig } from '@/components/activities/AssignmentModal';
import AssignmentSetModal from '@/components/activities/AssignmentSetModal';
import { BookOpenIcon, LinkIcon, QrCodeIcon, TrashIcon } from '@heroicons/react/24/outline';
import '@/styles/responsive-game-switcher.css';

// 遊戲統計類型
interface GameStats {
  totalGamesPlayed: number;
  totalTimeSpent: number;
  averageScore: number;
  favoriteGame: string;
  geptProgress: {
    elementary: number;
    intermediate: number;
    advanced: number;
  };
}

// 遊戲狀態類型
interface GameState {
  score: number;
  progress: number;
  level: string;
}

const GameSwitcherPage: React.FC = () => {
  const searchParams = useSearchParams();
  const [currentGameId, setCurrentGameId] = useState<string>('shimozurdo-game');
  const [showStats, setShowStats] = useState<boolean>(false);
  const [currentGeptLevel, setCurrentGeptLevel] = useState<string>('elementary');
  const [showMobileGeptMenu, setShowMobileGeptMenu] = useState<boolean>(false);

  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [customVocabulary, setCustomVocabulary] = useState<any[]>([]);
  const [activityId, setActivityId] = useState<string | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [isShared, setIsShared] = useState<boolean>(false);
  const [assignmentId, setAssignmentId] = useState<string | null>(null);

  // 快速操作按鈕狀態
  const [showCopySuccess, setShowCopySuccess] = useState<boolean>(false);
  const [showQRCodeModal, setShowQRCodeModal] = useState<boolean>(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);

  // 新增模態框狀態
  const [showRenameModal, setShowRenameModal] = useState<boolean>(false);
  const [showEmbedModal, setShowEmbedModal] = useState<boolean>(false);
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState<boolean>(false);
  const [showAssignmentSetModal, setShowAssignmentSetModal] = useState<boolean>(false);
  const [assignmentShareUrl, setAssignmentShareUrl] = useState<string>('');
  const [assignmentTitle, setAssignmentTitle] = useState<string>('');

  // 活動信息狀態
  const [activityInfo, setActivityInfo] = useState<{
    title: string;
    participantCount: number;
    createdAt: string;
    deadline?: string;
    templateType?: string;
    author?: {
      id: string;
      name: string;
      avatar?: string;
    };
    tags?: string[];
    category?: string;
    geptLevel?: string;
    description?: string;
  } | null>(null);

  // 排行榜狀態
  const [leaderboard, setLeaderboard] = useState<Array<{
    rank: number;
    studentName: string;
    score: number;
    timeSpent: number;
    correctAnswers: number;
    totalQuestions: number;
  }>>([]);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);
  
  // 遊戲統計狀態
  const [gameStats, setGameStats] = useState<GameStats>({
    totalGamesPlayed: 0,
    totalTimeSpent: 0,
    averageScore: 0,
    favoriteGame: 'airplane-vite',
    geptProgress: {
      elementary: 0,
      intermediate: 0,
      advanced: 0
    }
  });
  
  const [gameHistory, setGameHistory] = useState<Array<{
    gameId: string;
    timestamp: number;
    state: GameState;
  }>>([]);

  // 處理遊戲切換
  const handleGameChange = useCallback((gameId: string) => {
    console.log('🎮 遊戲切換:', gameId);
    setCurrentGameId(gameId);
    
    // 記錄遊戲切換歷史
    setGameHistory(prev => [...prev, {
      gameId,
      timestamp: Date.now(),
      state: { score: 0, progress: 0, level: 'elementary' }
    }]);
  }, []);

  // 處理遊戲狀態更新
  const handleGameStateUpdate = useCallback((gameId: string, state: GameState) => {
    console.log('📊 遊戲狀態更新:', gameId, state);

    // 更新統計數據
    setGameStats(prev => ({
      ...prev,
      totalGamesPlayed: prev.totalGamesPlayed + 1,
      totalTimeSpent: prev.totalTimeSpent + 30000, // 假設每次遊戲30秒
      averageScore: (prev.averageScore + state.score) / 2,
      geptProgress: {
        ...prev.geptProgress,
        [state.level as keyof typeof prev.geptProgress]: Math.max(
          prev.geptProgress[state.level as keyof typeof prev.geptProgress],
          state.progress
        )
      }
    }));

    // 更新遊戲歷史
    setGameHistory(prev => {
      const updated = [...prev];
      const lastEntry = updated[updated.length - 1];
      if (lastEntry && lastEntry.gameId === gameId) {
        lastEntry.state = state;
      }
      return updated;
    });
  }, []);

  // 快速操作按鈕處理函數
  const handleCopyLink = useCallback(async () => {
    if (!activityId || !assignmentId) return;

    // 複製學生遊戲連結
    const studentLink = `${window.location.origin}/play/${activityId}/${assignmentId}`;
    try {
      await navigator.clipboard.writeText(studentLink);
      setShowCopySuccess(true);
      setTimeout(() => setShowCopySuccess(false), 2000);
      console.log('✅ 學生遊戲連結已複製:', studentLink);
    } catch (error) {
      console.error('❌ 複製失敗:', error);
    }
  }, [activityId, assignmentId]);

  const handleShowQRCode = useCallback(() => {
    if (!activityId) return;
    setShowQRCodeModal(true);
  }, [activityId]);

  const handleDelete = useCallback(() => {
    if (!activityId) return;
    setShowDeleteConfirm(true);
  }, [activityId]);

  const handleConfirmDelete = useCallback(async () => {
    if (!activityId) return;

    try {
      const response = await fetch(`/api/activities/${activityId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('✅ 活動已刪除');
        // 重定向到我的活動頁面
        window.location.href = '/my-activities';
      } else {
        console.error('❌ 刪除失敗');
      }
    } catch (error) {
      console.error('❌ 刪除時出錯:', error);
    } finally {
      setShowDeleteConfirm(false);
    }
  }, [activityId]);

  // 工具欄處理函數
  const handleRename = useCallback(() => {
    setShowRenameModal(true);
  }, []);

  const handleRenameSuccess = useCallback((newTitle: string) => {
    if (activityInfo) {
      setActivityInfo({ ...activityInfo, title: newTitle });
    }
  }, [activityInfo]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleEmbed = useCallback(() => {
    setShowEmbedModal(true);
  }, []);

  const handleAssignment = useCallback(() => {
    setShowAssignmentModal(true);
  }, []);

  const handleStartAssignment = useCallback(async (assignmentConfig: AssignmentConfig) => {
    if (!activityId || !activityInfo) return;

    try {
      console.log('🚀 開始課業分配:', {
        activity: activityInfo.title,
        config: assignmentConfig
      });

      // 準備課業分配數據
      const assignmentData = {
        activityId: activityId,
        title: assignmentConfig.resultTitle,
        registrationType: assignmentConfig.registrationType === 'name' ? 'NAME' :
                         assignmentConfig.registrationType === 'anonymous' ? 'ANONYMOUS' : 'GOOGLE',
        deadline: assignmentConfig.hasDeadline ?
                 new Date(`${assignmentConfig.deadlineDate} ${assignmentConfig.deadlineTime}`).toISOString() : null,
        gameEndSettings: {
          showAnswers: assignmentConfig.showAnswers,
          showLeaderboard: assignmentConfig.showLeaderboard,
          allowRestart: assignmentConfig.allowRestart
        }
      };

      // 調用後端 API 創建課業分配
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(assignmentData)
      });

      if (!response.ok) {
        throw new Error('創建課業分配失敗');
      }

      const result = await response.json() as { assignment: { id: string } };
      console.log('✅ 課業分配創建成功:', result);

      // 生成分享連結
      const shareUrl = `${window.location.origin}/play/${activityId}/${result.assignment.id}`;

      // 設置課業集模態對話框的數據
      setAssignmentShareUrl(shareUrl);
      setAssignmentTitle(assignmentConfig.resultTitle);

      // 關閉課業分配模態對話框
      setShowAssignmentModal(false);

      // 顯示課業集模態對話框
      setShowAssignmentSetModal(true);

    } catch (error) {
      console.error('課業分配設置失敗:', error);
      alert('課業分配設置失敗，請稍後再試');
    }
  }, [activityId, activityInfo]);



  // 載入活動信息
  const loadActivityInfo = useCallback(async (activityId: string) => {
    try {
      const response = await fetch(`/api/activities/${activityId}`);
      if (response.ok) {
        const data = await response.json() as {
          title?: string;
          participantCount?: number;
          createdAt?: string;
          deadline?: string;
          description?: string;
          tags?: string[];
          geptLevel?: string;
          templateType?: string;
          user?: {
            id: string;
            name: string;
            image?: string;
          };
        };
        setActivityInfo({
          title: data.title || '未命名活動',
          participantCount: data.participantCount || 0,
          createdAt: data.createdAt || new Date().toISOString(),
          deadline: data.deadline,
          description: data.description,
          tags: data.tags || [],
          geptLevel: data.geptLevel,
          templateType: data.templateType,
          author: data.user ? {
            id: data.user.id,
            name: data.user.name,
            avatar: data.user.image,
          } : undefined,
          category: '教育', // 可以從 API 獲取
        });
        console.log('✅ 活動信息已載入:', data);
      }
    } catch (error) {
      console.error('❌ 載入活動信息時出錯:', error);
    }
  }, []);

  // 載入排行榜數據
  const loadLeaderboard = useCallback(async (assignmentId: string) => {
    try {
      const response = await fetch(`/api/leaderboard/${assignmentId}`);
      if (response.ok) {
        const data = await response.json() as {
          success?: boolean;
          leaderboard?: Array<{
            rank: number;
            studentName: string;
            score: number;
            timeSpent: number;
            correctAnswers: number;
            totalQuestions: number;
          }>;
          totalParticipants?: number;
        };
        if (data.success && data.leaderboard) {
          setLeaderboard(data.leaderboard);
          setShowLeaderboard(true);
          console.log('✅ 排行榜數據已載入:', {
            totalParticipants: data.totalParticipants,
            topScore: data.leaderboard[0]?.score || 0
          });
        }
      }
    } catch (error) {
      console.error('❌ 載入排行榜時出錯:', error);
    }
  }, []);

  // 處理 URL 參數和載入自定義詞彙
  useEffect(() => {
    const gameParam = searchParams?.get('game');
    const activityIdParam = searchParams?.get('activityId');
    const shareTokenParam = searchParams?.get('shareToken');
    const isSharedParam = searchParams?.get('isShared');
    const assignmentIdParam = searchParams?.get('assignmentId');

    if (gameParam) {
      setCurrentGameId(gameParam);
    }

    if (activityIdParam) {
      setActivityId(activityIdParam);

      // 載入活動信息
      loadActivityInfo(activityIdParam);

      // 優先檢查是否為學生遊戲模式（有 assignmentId）
      if (assignmentIdParam) {
        console.log('🎓 學生遊戲模式:', { activityIdParam, assignmentIdParam });
        setAssignmentId(assignmentIdParam);
        loadStudentVocabulary(activityIdParam, assignmentIdParam);
        // 載入排行榜數據
        loadLeaderboard(assignmentIdParam);
      }
      // 其次檢查是否為社區分享模式
      else if (isSharedParam === 'true' && shareTokenParam) {
        setIsShared(true);
        setShareToken(shareTokenParam);
        setAssignmentId(null);
        loadSharedVocabulary(activityIdParam, shareTokenParam);
      }
      // 最後是正常模式（需要登入）
      else {
        setIsShared(false);
        setShareToken(null);
        setAssignmentId(null);
        loadCustomVocabulary(activityIdParam);
      }
    }
  }, [searchParams, loadActivityInfo]);

  // 載入自定義詞彙的函數（需要身份驗證）
  const loadCustomVocabulary = async (activityId: string) => {
    try {
      console.log('🔄 載入活動詞彙:', activityId);
      const response = await fetch(`/api/activities/${activityId}/vocabulary`);

      if (response.ok) {
        const data = await response.json() as { vocabularyItems?: any[] };
        console.log('✅ 成功載入自定義詞彙:', data.vocabularyItems);
        setCustomVocabulary(data.vocabularyItems || []);
      } else {
        console.error('❌ 載入詞彙失敗:', response.status);
        setCustomVocabulary([]);
      }
    } catch (error) {
      console.error('❌ 載入詞彙時出錯:', error);
      setCustomVocabulary([]);
    }
  };

  // 載入分享遊戲的詞彙（不需要身份驗證）
  const loadSharedVocabulary = async (activityId: string, shareToken: string) => {
    try {
      console.log('🔄 載入分享遊戲詞彙:', activityId);
      const response = await fetch(`/api/share/${activityId}/${shareToken}`);

      if (response.ok) {
        const data = await response.json() as { activity?: { vocabularyItems?: any[] } };
        console.log('✅ 成功載入分享遊戲詞彙:', data.activity?.vocabularyItems);
        setCustomVocabulary(data.activity?.vocabularyItems || []);
      } else {
        console.error('❌ 載入分享遊戲詞彙失敗:', response.status);
        setCustomVocabulary([]);
      }
    } catch (error) {
      console.error('❌ 載入分享遊戲詞彙時出錯:', error);
      setCustomVocabulary([]);
    }
  };

  // 載入學生遊戲的詞彙（不需要身份驗證）
  const loadStudentVocabulary = async (activityId: string, assignmentId: string) => {
    try {
      console.log('🎓 載入學生遊戲詞彙:', { activityId, assignmentId });
      const response = await fetch(`/api/play/${activityId}/${assignmentId}`);

      if (response.ok) {
        const data = await response.json() as { activity?: { vocabularyItems?: any[] } };
        console.log('✅ 成功載入學生遊戲詞彙:', data.activity?.vocabularyItems);
        setCustomVocabulary(data.activity?.vocabularyItems || []);
      } else {
        console.error('❌ 載入學生遊戲詞彙失敗:', response.status);
        setCustomVocabulary([]);
      }
    } catch (error) {
      console.error('❌ 載入學生遊戲詞彙時出錯:', error);
      setCustomVocabulary([]);
    }
  };

  // 檢測螢幕尺寸
  useEffect(() => {

    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // 監聽來自 iframe 的全螢幕請求
    const handleFullscreenMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'REQUEST_FULLSCREEN' && event.data.source === 'shimozurdo-game') {
        console.log('📨 收到來自遊戲的全螢幕請求');

        // 嘗試對整個文檔進行全螢幕
        const requestFullscreen = () => {
          const element = document.documentElement;

          // 發送全螢幕結果給 iframe
          const sendFullscreenResult = (success: boolean, message: string) => {
            const iframe = document.querySelector('iframe[title="Shimozurdo 雲朵遊戲"]') as HTMLIFrameElement;
            if (iframe && iframe.contentWindow) {
              iframe.contentWindow.postMessage({
                type: success ? 'FULLSCREEN_SUCCESS' : 'FULLSCREEN_FAILED',
                source: 'parent-page',
                message: message
              }, '*');
              console.log(`📤 發送全螢幕結果給遊戲: ${success ? '成功' : '失敗'} - ${message}`);
            }
          };

          if (element.requestFullscreen) {
            element.requestFullscreen().then(() => {
              console.log('✅ 父頁面全螢幕成功 (requestFullscreen)');
              applyParentFullscreenStyles();
              sendFullscreenResult(true, '父頁面全螢幕成功');
            }).catch(err => {
              console.warn('⚠️ 父頁面全螢幕失敗:', err);
              // iOS/Safari 或權限被拒：套用父頁面近全螢幕樣式作為退路
              applyParentFullscreenStyles();
              sendFullscreenResult(false, '父頁面全螢幕失敗: ' + err.message);
            });
          } else if ((element as any).webkitRequestFullscreen) {
            try {
              (element as any).webkitRequestFullscreen();
              console.log('✅ 父頁面全螢幕成功 (webkit)');
              applyParentFullscreenStyles();
              sendFullscreenResult(true, '父頁面全螢幕成功 (webkit)');
            } catch (err: any) {
              console.warn('⚠️ 父頁面全螢幕失敗 (webkit):', err);
              applyParentFullscreenStyles();
              sendFullscreenResult(false, '父頁面全螢幕失敗 (webkit): ' + err.message);
            }
          } else if ((element as any).mozRequestFullScreen) {
            try {
              (element as any).mozRequestFullScreen();
              console.log('✅ 父頁面全螢幕成功 (moz)');
              applyParentFullscreenStyles();
              sendFullscreenResult(true, '父頁面全螢幕成功 (moz)');
            } catch (err: any) {
              console.warn('⚠️ 父頁面全螢幕失敗 (moz):', err);
              applyParentFullscreenStyles();
              sendFullscreenResult(false, '父頁面全螢幕失敗 (moz): ' + err.message);
            }
          } else if ((element as any).msRequestFullscreen) {
            try {
              (element as any).msRequestFullscreen();
              console.log('✅ 父頁面全螢幕成功 (ms)');
              applyParentFullscreenStyles();
              sendFullscreenResult(true, '父頁面全螢幕成功 (ms)');
            } catch (err: any) {
              console.warn('⚠️ 父頁面全螢幕失敗 (ms):', err);
              applyParentFullscreenStyles();
              sendFullscreenResult(false, '父頁面全螢幕失敗 (ms): ' + err.message);
            }
          } else {
            console.warn('⚠️ 父頁面不支援全螢幕 API');
            // 退路：仍然套用父頁面近全螢幕樣式
            applyParentFullscreenStyles();
            sendFullscreenResult(false, '父頁面不支援全螢幕 API');
          }
        };

        requestFullscreen();
      }
    };

    // 應用父頁面全螢幕樣式
    const applyParentFullscreenStyles = () => {
      try {
        console.log('🎨 應用父頁面全螢幕樣式');

        // 添加全螢幕樣式類
        document.body.classList.add('parent-fullscreen-game');

        // 創建或更新全螢幕樣式
        let fullscreenStyle = document.getElementById('parent-fullscreen-style');
        if (!fullscreenStyle) {
          fullscreenStyle = document.createElement('style');
          fullscreenStyle.id = 'parent-fullscreen-style';
          document.head.appendChild(fullscreenStyle);
        }

        fullscreenStyle.textContent = `
          /* 父頁面全螢幕樣式 */
          body.parent-fullscreen-game {
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            background: black !important;
          }

          /* 僅固定並鋪滿遊戲容器，不隱藏其他元素，避免誤傷主層 */
          /* 確保遊戲容器填滿整個螢幕 */
          body.parent-fullscreen-game [data-testid="game-container"] {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100dvh !important;
            z-index: 999999 !important;
            background: black !important;
          }

          /* 確保 iframe 容器填滿整個螢幕 */
          body.parent-fullscreen-game .game-iframe-container {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100dvh !important;
            z-index: 999999 !important;
          }

          /* 確保 iframe 填滿整個螢幕 */
          body.parent-fullscreen-game .game-iframe-container iframe {
            width: 100% !important;
            height: 100% !important;
            border: none !important;
          }
        `;

        console.log('✅ 父頁面全螢幕樣式已應用');
      } catch (error) {
        console.warn('⚠️ 應用父頁面全螢幕樣式失敗:', error);
      }
    };



    // 初始檢查螢幕尺寸
    checkScreenSize();

    // 監聽滾動事件、尺寸變化和全螢幕消息
    // 監聽全螢幕狀態變化
    const handleFullscreenChange = () => {
      const isFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      if (!isFullscreen) {
        // 退出全螢幕時清理樣式
        console.log('🚪 退出全螢幕，清理父頁面樣式');
        document.body.classList.remove('parent-fullscreen-game');
        const fullscreenStyle = document.getElementById('parent-fullscreen-style');
        if (fullscreenStyle) {
          fullscreenStyle.remove();
        }
      }
    };


    window.addEventListener('resize', checkScreenSize);
    window.addEventListener('message', handleFullscreenMessage);

    // 監聽全螢幕狀態變化
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    (document as any).addEventListener('MSFullscreenChange', handleFullscreenChange);



    return () => {

      window.removeEventListener('resize', checkScreenSize);
      window.removeEventListener('message', handleFullscreenMessage);

      // 清理全螢幕監聽器
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      (document as any).removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // 格式化時間
  const formatTime = (milliseconds: number): string => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // 獲取遊戲名稱
  const getGameName = (gameId: string): string => {
    const gameNames: Record<string, string> = {
      'shimozurdo-game': 'Shimozurdo 雲朵遊戲',
      'shimozurdo-responsive': 'shimozurdo 響應式遊戲',
      'airplane-vite': '飛機遊戲 (Vite版)',
      'airplane-main': '飛機碰撞遊戲',
      'airplane-iframe': '飛機遊戲 (iframe)',
      'matching-pairs': '配對遊戲',
      'quiz-game': '問答遊戲',
      'sequence-game': '序列遊戲',
      'flashcard-game': '閃卡遊戲'
    };
    return gameNames[gameId] || gameId;
  };

  return (
    <div
      className="bg-gray-50"
      style={{
        minHeight: isMobile ? `${window.innerHeight}px` : '100vh',
        height: isMobile ? `${window.innerHeight}px` : 'auto'
      }}
    >
      {/* 統一導航系統 */}
      <UnifiedNavigation variant="header" />
      {/* 手機版 GEPT 選擇器彈出選單 */}
      {showMobileGeptMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden" onClick={() => setShowMobileGeptMenu(false)}>
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-lg p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">選擇 GEPT 等級</h3>
              <button
                onClick={() => setShowMobileGeptMenu(false)}
                className="p-2 text-gray-400 hover:text-gray-600"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                ✕
              </button>
            </div>

            {/* 手機版 GEPT 選擇器 - 保持測試兼容性 */}
            <div className="gept-selector" data-testid="gept-selector">
              <div className="flex items-center space-x-2 mb-4">
                <BookOpenIcon className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">GEPT 等級：</span>
              </div>

              <div className="gept-buttons space-y-3">
                {['elementary', 'intermediate', 'advanced'].map((level) => (
                  <button
                    key={level}
                    onClick={() => {
                      setCurrentGeptLevel(level);
                      setShowMobileGeptMenu(false);
                    }}
                    className={`w-full px-4 py-3 rounded-lg text-sm font-medium transition-colors border ${
                      currentGeptLevel === level
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-300'
                    }`}
                    style={{ minHeight: '44px' }}
                  >
                    {level === 'elementary' ? '初級 (Elementary)' : level === 'intermediate' ? '中級 (Intermediate)' : '高級 (Advanced)'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 緊湊合併標頭 - 手機優化佈局 */}
      <div className="unified-game-header bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1 md:py-2">
          {/* 手機模式：極簡單行佈局 */}
          <div className="md:hidden flex items-center justify-between gap-2 min-h-12">
            {/* 左側：緊湊標題 */}
            <div className="flex-shrink-0">
              <h1 className="text-sm font-bold text-gray-900">記憶科學遊戲</h1>
            </div>

            {/* 右側：控制按鈕組 */}
            <div className="flex items-center gap-1 flex-shrink-0">
              {/* 手機版更多選項按鈕 */}
              <button
                onClick={() => setShowMobileGeptMenu(true)}
                className="px-2 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                style={{ minHeight: '44px', minWidth: '44px' }}
                title="更多選項"
              >
                ⚙️
              </button>

              <button
                onClick={() => setShowStats(!showStats)}
                className="px-2 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                style={{ minHeight: '44px' }}
              >
                📊
              </button>

              <Link
                href="/my-activities"
                className="px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg shadow-lg shadow-blue-500/50 hover:from-blue-600 hover:to-cyan-600 hover:shadow-xl hover:shadow-blue-500/60 transform hover:scale-105 transition-all duration-200 flex items-center justify-center animate-pulse"
                style={{ minHeight: '44px', minWidth: '44px' }}
                title="我的活動"
              >
                <span className="text-lg drop-shadow-lg">📋</span>
              </Link>
            </div>
          </div>

          {/* 桌面模式：完整佈局 */}
          <div className="hidden md:flex items-center justify-between gap-4 min-h-16">
            {/* 左側：標題 + GEPT 選擇器 */}
            <div className="flex items-center gap-4 flex-1 min-w-0 overflow-hidden">
              {/* 標題區域 - 可點擊回首頁 */}
              <div className="flex-shrink-0">
                <Link href="/" className="block hover:opacity-80 transition-opacity cursor-pointer">
                  <h1 className="text-base lg:text-lg font-bold text-gray-900">記憶科學遊戲中心</h1>
                  <p className="text-xs text-gray-600">25 種記憶科學遊戲</p>
                </Link>
              </div>

              {/* 桌面版 GEPT 選擇器 */}
              <div className="gept-selector flex items-center gap-2 flex-1 max-w-xs" data-testid="gept-selector">
                <BookOpenIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <span className="text-xs font-medium text-gray-700 flex-shrink-0">GEPT:</span>
                <div className="gept-buttons flex gap-1 flex-1">
                  {['elementary', 'intermediate', 'advanced'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setCurrentGeptLevel(level)}
                      className={`px-2 py-2 rounded text-xs font-medium transition-colors flex-1 ${
                        currentGeptLevel === level
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300'
                      }`}
                      style={{ minHeight: '44px', minWidth: '44px' }}
                    >
                      {level === 'elementary' ? '初級' : level === 'intermediate' ? '中級' : '高級'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 右側：遊戲狀態 + 控制按鈕 */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* 當前遊戲狀態 */}
              <div className="flex items-center space-x-1">
                <span className="text-sm font-medium text-blue-900">🎮 {getGameName(currentGameId)}</span>
                <span className="px-1 py-0.5 text-xs bg-green-100 text-green-800 rounded">✅</span>
              </div>

              {/* 控制按鈕組 */}
              <button
                onClick={() => setShowStats(!showStats)}
                className="px-2 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                style={{ minHeight: '44px' }}
              >
                <span className="hidden lg:inline">{showStats ? '隱藏統計' : '顯示統計'}</span>
                <span className="lg:hidden">📊</span>
              </button>

              <Link
                href="/my-activities"
                className="px-2 py-2 text-xs font-medium text-white bg-gradient-to-r from-blue-500 to-cyan-500 rounded shadow-lg shadow-blue-500/50 hover:from-blue-600 hover:to-cyan-600 hover:shadow-xl hover:shadow-blue-500/60 transform hover:scale-105 transition-all duration-200 animate-pulse"
                style={{ minHeight: '44px' }}
              >
                <span className="hidden lg:inline drop-shadow-lg">📋 我的活動</span>
                <span className="lg:hidden drop-shadow-lg">📋</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 主要內容 - 手機優化佈局 */}
      <div className="max-w-none mx-auto px-4 sm:px-6 lg:px-8 py-1 sm:py-2">

        {/* 遊戲切換器 - 主要區域，手機模式減少間距 */}
        <div className="mb-1 sm:mb-2" data-testid="game-container">
          <GameSwitcher
            defaultGame={currentGameId}
            geptLevel={currentGeptLevel as 'elementary' | 'intermediate' | 'advanced'}
            onGameChange={handleGameChange}
            onGameStateUpdate={handleGameStateUpdate}
            className="w-full"
            hideGeptSelector={true}
            currentGeptLevel={currentGeptLevel}
            customVocabulary={customVocabulary}
            activityId={activityId}
            shareToken={shareToken}
            isShared={isShared}
            assignmentId={assignmentId}
          />
        </div>

        {/* 增強版活動信息框 - 只在有 activityId 且不是學生模式時顯示 */}
        {activityId && !assignmentId && !isShared && activityInfo && (
          <EnhancedActivityInfoBox
            activityId={activityId}
            activityTitle={activityInfo.title}
            templateType={activityInfo.templateType}
            author={activityInfo.author}
            tags={activityInfo.tags}
            category={activityInfo.category}
            geptLevel={activityInfo.geptLevel}
            description={activityInfo.description}
            createdAt={activityInfo.createdAt}
            onPrint={handlePrint}
            onEmbed={handleEmbed}
            onRename={handleRename}
            onAssignment={handleAssignment}
          />
        )}

        {/* 作業信息區域 - 只在有 activityId 時顯示 */}
        {activityId && activityInfo && (
          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">作業</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">標題</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">反應</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">創建</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最後期限</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-4 py-3 text-sm text-gray-900">{activityInfo.title}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{activityInfo.participantCount}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(activityInfo.createdAt).toLocaleDateString('zh-TW', {
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {activityInfo.deadline
                        ? new Date(activityInfo.deadline).toLocaleDateString('zh-TW', {
                            day: 'numeric',
                            month: 'long'
                          })
                        : '無截止日期'
                      }
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 快速操作按鈕 */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex flex-wrap gap-2">
              {/* 複製連結按鈕 */}
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                {showCopySuccess ? (
                  <>
                    <span className="text-green-600">✓</span>
                    <span className="text-green-600">已複製</span>
                  </>
                ) : (
                  <>
                    <LinkIcon className="w-4 h-4" />
                    <span>複製連結</span>
                  </>
                )}
              </button>

              {/* QR Code 按鈕 */}
              <button
                onClick={handleShowQRCode}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                <QrCodeIcon className="w-4 h-4" />
                <span>QR 代碼</span>
              </button>

              {/* 刪除按鈕 */}
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded hover:bg-red-50 transition-colors"
              >
                <TrashIcon className="w-4 h-4" />
                <span>刪除</span>
              </button>
            </div>
          </div>
        )}

        {/* 排行榜區域 - 只在學生遊戲模式顯示 */}
        {showLeaderboard && assignmentId && (
          <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">排行榜</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">排名</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">名字</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">得分</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">時間</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leaderboard.slice(0, 5).map((participant) => (
                    <tr key={`${participant.rank}-${participant.studentName}`} className={participant.rank <= 3 ? 'bg-yellow-50' : ''}>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {participant.rank === 1 && '🥇 '}
                        {participant.rank === 2 && '🥈 '}
                        {participant.rank === 3 && '🥉 '}
                        第{participant.rank}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{participant.studentName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{participant.score}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {Math.floor(participant.timeSpent / 60)}:{(participant.timeSpent % 60).toString().padStart(2, '0')}
                      </td>
                    </tr>
                  ))}
                  {leaderboard.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                        還沒有學生完成遊戲
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {leaderboard.length > 5 && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 text-center">
                <button
                  onClick={() => {/* TODO: 顯示完整排行榜 */}}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  顯示更多 ({leaderboard.length - 5} 位學生)
                </button>
              </div>
            )}
          </div>
        )}

        {/* 統計和歷史 - 響應式網格佈局 */}
        <div className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {/* 學習統計 */}
          <div className="stats-card bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <h3 className="font-semibold text-gray-900 mb-3 md:mb-4">學習統計</h3>
            <div className="space-y-3 md:space-y-4">
              <div>
                <div className="text-sm text-gray-500">總遊戲次數</div>
                <div className="text-xl md:text-2xl font-bold text-blue-600">{gameStats.totalGamesPlayed}</div>
              </div>
              <div>
                <div className="text-sm text-gray-500">總學習時間</div>
                <div className="text-base md:text-lg font-semibold text-gray-900">
                  {formatTime(gameStats.totalTimeSpent)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500">平均分數</div>
                <div className="text-base md:text-lg font-semibold text-gray-900">
                  {Math.round(gameStats.averageScore)}
                </div>
              </div>
            </div>
          </div>

          {/* GEPT 進度 */}
          <div className="stats-card bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
            <h3 className="font-semibold text-gray-900 mb-3 md:mb-4">GEPT 學習進度</h3>
            <div className="space-y-3">
              {Object.entries(gameStats.geptProgress).map(([level, progress]) => (
                <div key={level}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">
                      {level === 'elementary' ? '初級' : level === 'intermediate' ? '中級' : '高級'}
                    </span>
                    <span className="text-gray-900 font-medium">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        level === 'elementary' ? 'bg-green-500' :
                        level === 'intermediate' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 遊戲歷史 */}
          {gameHistory.length > 0 && (
            <div className="stats-card bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 md:col-span-2 lg:col-span-1">
              <h3 className="font-semibold text-gray-900 mb-3 md:mb-4">最近遊戲</h3>
              <div className="space-y-3">
                {gameHistory.slice(-5).reverse().map((entry, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {getGameName(entry.gameId)}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <div className="font-semibold text-blue-600">
                        {entry.state.score}分
                      </div>
                      <div className="text-gray-500 text-xs">
                        {entry.state.progress}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 頁腳信息 */}
      <div className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>EduCreate 記憶科學遊戲平台 - 讓學習變得更科學、更有趣、更有效</p>
            <p className="mt-1">支援 25 種記憶科學遊戲類型，基於主動回憶和間隔重複原理</p>
          </div>
        </div>
      </div>

      {/* QR Code 模態框 */}
      {showQRCodeModal && activityId && (
        <QRCodeModal
          isOpen={showQRCodeModal}
          onClose={() => setShowQRCodeModal(false)}
          result={{
            id: activityId,
            title: `${getGameName(currentGameId)} 遊戲`,
            activityName: getGameName(currentGameId),
            participantCount: 0,
            createdAt: new Date().toISOString(),
            status: 'active' as const,
            assignmentId: assignmentId || activityId,
            activityId: activityId
          }}
        />
      )}

      {/* 刪除確認對話框 */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">確認刪除</h3>
            <p className="text-gray-600 mb-6">
              確定要刪除這個活動嗎？此操作無法復原。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700"
              >
                確認刪除
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 重新命名模態框 */}
      {showRenameModal && activityId && activityInfo && (
        <RenameActivityModal
          isOpen={showRenameModal}
          onClose={() => setShowRenameModal(false)}
          activityId={activityId}
          currentTitle={activityInfo.title}
          onSuccess={handleRenameSuccess}
        />
      )}

      {/* 嵌入代碼模態框 */}
      {showEmbedModal && activityId && activityInfo && (
        <EmbedCodeModal
          isOpen={showEmbedModal}
          onClose={() => setShowEmbedModal(false)}
          activityId={activityId}
          activityTitle={activityInfo.title}
        />
      )}

      {/* 發布到社區模態框 */}
      {showPublishModal && activityId && activityInfo && (
        <PublishToCommunityModal
          activity={{
            id: activityId,
            title: activityInfo.title,
            description: '',
            isPublicShared: false,
            shareToken: shareToken || undefined,
          }}
          onClose={() => setShowPublishModal(false)}
          onSuccess={() => {
            setShowPublishModal(false);
            // 可以在這裡添加成功後的處理
          }}
        />
      )}

      {/* 課業分配模態框 */}
      {showAssignmentModal && activityId && activityInfo && (
        <AssignmentModal
          activity={{
            id: activityId,
            title: activityInfo.title,
            type: 'vocabulary',
            gameType: currentGameId,
          }}
          isOpen={showAssignmentModal}
          onClose={() => setShowAssignmentModal(false)}
          onStartAssignment={handleStartAssignment}
        />
      )}

      {/* 課業集模態框 */}
      {showAssignmentSetModal && (
        <AssignmentSetModal
          isOpen={showAssignmentSetModal}
          onClose={() => setShowAssignmentSetModal(false)}
          shareUrl={assignmentShareUrl}
          assignmentTitle={assignmentTitle}
          onGoToResults={() => {
            setShowAssignmentSetModal(false);
            window.location.href = '/my-results';
          }}
        />
      )}

    </div>
  );
};

export default GameSwitcherPage;
