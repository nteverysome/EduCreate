'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
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
import EditActivityTagsModal from '@/components/activities/EditActivityTagsModal';
import AssignmentModal, { AssignmentConfig } from '@/components/activities/AssignmentModal';
import AssignmentSetModal from '@/components/activities/AssignmentSetModal';
import SRSLearningPanel from '@/components/games/SRSLearningPanel';
import SRSReviewDetails from '@/components/games/SRSReviewDetails';
import GameOptionsPanel from '@/components/game-options';
import VisualStyleSelector from '@/components/visual-style-selector';
import MatchUpOptionsPanel, { MatchUpOptions, DEFAULT_MATCH_UP_OPTIONS } from '@/components/game-options/MatchUpOptionsPanel';
import SpeakingCardsOptionsPanel, { SpeakingCardsOptions, DEFAULT_SPEAKING_CARDS_OPTIONS } from '@/components/game-options/SpeakingCardsOptionsPanel';
import { GameOptions, DEFAULT_GAME_OPTIONS } from '@/types/game-options';
import { BookOpenIcon, LinkIcon, QrCodeIcon, TrashIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';
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
  const router = useRouter();
  const { data: session } = useSession();
  const [currentGameId, setCurrentGameId] = useState<string>(() => {
    // 從 URL 參數讀取遊戲 ID，如果沒有則使用默認值
    return searchParams?.get('game') || 'shimozurdo-game';
  });
  const [currentGeptLevel, setCurrentGeptLevel] = useState<string>('elementary');
  const [showMobileGeptMenu, setShowMobileGeptMenu] = useState<boolean>(false);

  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [customVocabulary, setCustomVocabulary] = useState<any[]>([]);
  const [activityId, setActivityId] = useState<string | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [isShared, setIsShared] = useState<boolean>(false);
  const [assignmentId, setAssignmentId] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [isCopying, setIsCopying] = useState<boolean>(false);
  const [gameOptions, setGameOptions] = useState<GameOptions>(DEFAULT_GAME_OPTIONS);
  const [matchUpOptions, setMatchUpOptions] = useState<MatchUpOptions>(DEFAULT_MATCH_UP_OPTIONS);
  const [speakingCardsOptions, setSpeakingCardsOptions] = useState<SpeakingCardsOptions>(DEFAULT_SPEAKING_CARDS_OPTIONS);
  const [isSavingOptions, setIsSavingOptions] = useState<boolean>(false);
  const [gameKey, setGameKey] = useState<number>(0); // 用於強制重新渲染 GameSwitcher

  // SRS 學習模式狀態
  const [showSRSPanel, setShowSRSPanel] = useState<boolean>(true);
  const [srsMode, setSrsMode] = useState<boolean>(false);
  const [srsWordIds, setSrsWordIds] = useState<string[]>([]);



  // 新增模態框狀態
  const [showRenameModal, setShowRenameModal] = useState<boolean>(false);
  const [showEmbedModal, setShowEmbedModal] = useState<boolean>(false);
  const [showPublishModal, setShowPublishModal] = useState<boolean>(false);
  const [showEditTagsModal, setShowEditTagsModal] = useState<boolean>(false);
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
    originalAuthor?: {
      id: string;
      name: string;
    };
    copiedFromActivityId?: string;
    tags?: string[];
    category?: string;
    geptLevel?: string;
    description?: string;
  } | null>(null);

  // 排行榜狀態（課業分配模式）
  const [leaderboard, setLeaderboard] = useState<Array<{
    rank: number;
    studentName: string;
    score: number;
    timeSpent: number;
    correctAnswers: number;
    totalQuestions: number;
  }>>([]);
  const [showLeaderboard, setShowLeaderboard] = useState<boolean>(false);

  // 活動排行榜狀態（一般模式）
  const [activityLeaderboard, setActivityLeaderboard] = useState<Array<{
    id: string;
    playerName: string;
    score: number;
    correctCount: number;
    totalCount: number;
    accuracy: number;
    timeSpent: number;
    createdAt: string;
  }>>([]);

  // 活動結果狀態
  const [activityResults, setActivityResults] = useState<Array<{
    id: string;
    title: string;
    activityName: string;
    participantCount: number;
    createdAt: string;
    deadline?: string;
    status: 'active' | 'completed' | 'expired';
    assignmentId: string;
    activityId: string;
  }>>([]);

  // 作業區操作狀態
  const [copySuccessMap, setCopySuccessMap] = useState<Record<string, boolean>>({});
  const [selectedResultForQR, setSelectedResultForQR] = useState<{
    id: string;
    title: string;
    activityId: string;
    assignmentId: string;
  } | null>(null);
  const [selectedResultForDelete, setSelectedResultForDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

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

  // 處理開始 SRS 學習
  const handleStartSRSLearning = useCallback(() => {
    console.log('🧠 開始 SRS 學習模式');

    // 轉換 GEPT 等級格式
    let geptLevelParam = currentGeptLevel.toUpperCase();
    if (geptLevelParam === 'ADVANCED') {
      geptLevelParam = 'HIGH_INTERMEDIATE';
    }

    // 設置 SRS 模式
    setSrsMode(true);

    // 導航到遊戲頁面並帶上 SRS 參數
    const gameUrl = `/games/switcher?game=shimozurdo-game&useSRS=true&geptLevel=${geptLevelParam}`;
    router.push(gameUrl);

    // 隱藏 SRS 面板以顯示遊戲
    setShowSRSPanel(false);
  }, [currentGeptLevel, router]);



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

  const handleEditTags = useCallback(() => {
    setShowEditTagsModal(true);
  }, []);

  const handleEditTagsSuccess = useCallback(() => {
    // 重新載入活動信息以獲取更新後的標籤
    if (activityId) {
      loadActivityInfo(activityId);
    }
  }, [activityId]);

  // 複製活動到我的活動列表
  const handleCopyActivity = useCallback(async () => {
    if (!activityId || !activityInfo || !session?.user?.email) {
      alert('請先登入才能複製活動');
      return;
    }

    if (isCopying) return;

    try {
      setIsCopying(true);
      console.log('🔄 開始複製活動:', activityId);

      // 調用複製 API
      const response = await fetch('/api/activities/copy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceActivityId: activityId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ 活動複製成功:', data);
        alert('活動已成功複製到您的活動列表！');

        // 跳轉到新複製的活動編輯頁面
        router.push(`/create/${activityInfo.templateType}?edit=${data.newActivityId}`);
      } else {
        const error = await response.json();
        console.error('❌ 複製失敗:', error);
        alert('複製失敗：' + (error.error || '未知錯誤'));
      }
    } catch (error) {
      console.error('❌ 複製時出錯:', error);
      alert('複製時發生錯誤，請稍後再試');
    } finally {
      setIsCopying(false);
    }
  }, [activityId, activityInfo, session, isCopying, router]);

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
          communityDescription?: string;
          tags?: string[];
          communityTags?: string[];
          communityCategory?: string;
          geptLevel?: string;
          templateType?: string;
          gameOptions?: GameOptions;
          matchUpOptions?: MatchUpOptions;  // 🔥 添加 Match-up 選項類型
          user?: {
            id: string;
            name: string;
            image?: string;
          };
          originalAuthorId?: string;
          originalAuthorName?: string;
          copiedFromActivityId?: string;
        };
        setActivityInfo({
          title: data.title || '未命名活動',
          participantCount: data.participantCount || 0,
          createdAt: data.createdAt || new Date().toISOString(),
          deadline: data.deadline,
          description: data.communityDescription || data.description,
          tags: data.communityTags || data.tags || [],
          geptLevel: data.geptLevel,
          templateType: data.templateType,
          author: data.user ? {
            id: data.user.id,
            name: data.user.name,
            avatar: data.user.image,
          } : undefined,
          originalAuthor: data.originalAuthorId && data.originalAuthorName ? {
            id: data.originalAuthorId,
            name: data.originalAuthorName,
          } : undefined,
          copiedFromActivityId: data.copiedFromActivityId,
          category: data.communityCategory || undefined,
        });

        // 載入遊戲選項
        if (data.gameOptions) {
          // 合併數據庫選項和默認選項，確保所有字段都有值
          const mergedOptions = {
            ...DEFAULT_GAME_OPTIONS,
            ...data.gameOptions,
            // 確保 visualStyle 有值
            visualStyle: data.gameOptions.visualStyle || DEFAULT_GAME_OPTIONS.visualStyle
          };
          setGameOptions(mergedOptions);
          console.log('✅ 遊戲選項已載入:', mergedOptions);
        } else {
          setGameOptions(DEFAULT_GAME_OPTIONS);
          console.log('ℹ️ 使用默認遊戲選項');
        }

        // 🔥 載入 Match-up 遊戲選項
        if (data.matchUpOptions) {
          // 合併數據庫選項和默認選項，確保所有字段都有值
          const mergedMatchUpOptions = {
            ...DEFAULT_MATCH_UP_OPTIONS,
            ...data.matchUpOptions,
          };
          setMatchUpOptions(mergedMatchUpOptions);
          console.log('✅ Match-up 選項已載入:', mergedMatchUpOptions);
        } else {
          setMatchUpOptions(DEFAULT_MATCH_UP_OPTIONS);
          console.log('ℹ️ 使用默認 Match-up 選項');
        }

        // 判斷是否是所有者
        console.log('🔍 檢查所有者身份:', {
          hasSession: !!session,
          sessionUserEmail: session?.user?.email,
          activityUserId: data.user?.id,
        });

        if (session?.user?.email && data.user?.id) {
          // 需要通過 API 獲取當前用戶的 ID 來比較
          const currentUserResponse = await fetch('/api/user/profile');
          console.log('🔍 用戶資料 API 響應:', currentUserResponse.ok);

          if (currentUserResponse.ok) {
            const currentUser = await currentUserResponse.json();
            const isOwnerResult = currentUser.id === data.user.id;
            console.log('🔍 所有者檢查結果:', {
              currentUserId: currentUser.id,
              activityUserId: data.user.id,
              isOwner: isOwnerResult,
            });
            setIsOwner(isOwnerResult);
          } else {
            console.log('❌ 無法獲取用戶資料');
          }
        } else {
          console.log('❌ 缺少 session 或活動所有者信息');
        }

        // 增加瀏覽次數（異步執行，不阻塞頁面載入）
        fetch(`/api/activities/${activityId}/view`, {
          method: 'POST',
        }).catch(error => {
          console.error('❌ 增加瀏覽次數失敗:', error);
        });

        console.log('✅ 活動信息已載入:', data);
      }
    } catch (error) {
      console.error('❌ 載入活動信息時出錯:', error);
    }
  }, [session]);

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

  // 載入活動排行榜（一般模式）
  const loadActivityLeaderboard = useCallback(async (activityId: string) => {
    try {
      const response = await fetch(`/api/leaderboard?activityId=${activityId}&limit=10`);
      if (response.ok) {
        const data = await response.json() as {
          success?: boolean;
          data?: Array<{
            id: string;
            playerName: string;
            score: number;
            correctCount: number;
            totalCount: number;
            accuracy: number;
            timeSpent: number;
            createdAt: string;
          }>;
        };
        if (data.success && data.data) {
          setActivityLeaderboard(data.data);
          console.log('✅ 活動排行榜數據已載入:', {
            totalEntries: data.data.length,
            topScore: data.data[0]?.score || 0
          });
        }
      }
    } catch (error) {
      console.error('❌ 載入活動排行榜時出錯:', error);
    }
  }, []);

  // 載入活動結果（作業）
  const loadActivityResults = useCallback(async (activityId: string) => {
    try {
      const response = await fetch(`/api/activities/${activityId}/results`);
      if (response.ok) {
        const data = await response.json() as Array<{
          id: string;
          title: string;
          activityName: string;
          participantCount: number;
          createdAt: string;
          deadline?: string;
          status: 'active' | 'completed' | 'expired';
          assignmentId: string;
          activityId: string;
        }>;
        setActivityResults(data);
        console.log('✅ 活動結果已載入:', { count: data.length });
      }
    } catch (error) {
      console.error('❌ 載入活動結果時出錯:', error);
    }
  }, []);

  // 作業區操作處理函數
  const handleCopyStudentLink = useCallback(async (result: { id: string; activityId: string; assignmentId: string }) => {
    const studentLink = `${window.location.origin}/play/${result.activityId}/${result.assignmentId}`;
    try {
      await navigator.clipboard.writeText(studentLink);
      setCopySuccessMap(prev => ({ ...prev, [result.id]: true }));
      setTimeout(() => {
        setCopySuccessMap(prev => ({ ...prev, [result.id]: false }));
      }, 2000);
      console.log('✅ 學生分享連結已複製:', studentLink);
    } catch (error) {
      console.error('❌ 複製失敗:', error);
    }
  }, []);

  const handleShowResultQRCode = useCallback((result: { id: string; title: string; activityId: string; assignmentId: string }) => {
    setSelectedResultForQR(result);
  }, []);

  const handleDeleteResult = useCallback((result: { id: string; title: string }) => {
    setSelectedResultForDelete(result);
  }, []);

  const confirmDeleteResult = useCallback(async () => {
    if (!selectedResultForDelete) return;

    try {
      const response = await fetch(`/api/results/${selectedResultForDelete.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log('✅ 結果已刪除:', selectedResultForDelete.id);
        // 重新載入活動結果
        if (activityId) {
          loadActivityResults(activityId);
        }
        setSelectedResultForDelete(null);
      } else {
        const error = await response.json();
        console.error('❌ 刪除失敗:', error);
        alert('刪除失敗：' + (error.error || '未知錯誤'));
      }
    } catch (error) {
      console.error('❌ 刪除時出錯:', error);
      alert('刪除時出錯，請稍後再試');
    }
  }, [selectedResultForDelete, activityId, loadActivityResults]);

  // 處理 URL 參數和載入自定義詞彙
  useEffect(() => {
    const gameParam = searchParams?.get('game');
    const activityIdParam = searchParams?.get('activityId');
    const shareTokenParam = searchParams?.get('shareToken');
    const isSharedParam = searchParams?.get('isShared');
    const assignmentIdParam = searchParams?.get('assignmentId');
    const studentNameParam = searchParams?.get('studentName');
    const anonymousParam = searchParams?.get('anonymous');
    const useSRSParam = searchParams?.get('useSRS');
    const geptLevelParam = searchParams?.get('geptLevel');
    const wordIdsParam = searchParams?.get('wordIds');

    if (gameParam) {
      setCurrentGameId(gameParam);
    }

    // 檢查是否為 SRS 模式
    if (useSRSParam === 'true') {
      console.log('🧠 檢測到 SRS 模式');
      setSrsMode(true);
      setShowSRSPanel(false);

      // 設置 GEPT 等級
      if (geptLevelParam) {
        const levelLower = geptLevelParam.toLowerCase();
        if (levelLower === 'elementary' || levelLower === 'intermediate') {
          setCurrentGeptLevel(levelLower);
        } else if (levelLower === 'high_intermediate') {
          setCurrentGeptLevel('advanced');
        }
      }

      // 如果有指定單字 IDs,存儲到 localStorage 和狀態
      if (wordIdsParam) {
        const wordIds = wordIdsParam.split(',');
        console.log('🎯 接收到指定單字 IDs:', wordIds.length, '個');
        setSrsWordIds(wordIds);
        if (typeof window !== 'undefined') {
          localStorage.setItem('srs_selected_words', JSON.stringify(wordIds));
        }
      }
    }

    // 🔥 [v57.3] 驗證 activityId 不是字符串 "undefined" 或 "null"
    const isValidActivityId =
      activityIdParam &&
      activityIdParam !== 'undefined' &&
      activityIdParam !== 'null' &&
      activityIdParam.trim() !== '';

    if (isValidActivityId) {
      setActivityId(activityIdParam);

      // 載入活動信息
      loadActivityInfo(activityIdParam);

      // 載入活動結果（作業）- 只在非學生模式下載入
      if (!assignmentIdParam) {
        loadActivityResults(activityIdParam);
      }

      // 載入活動排行榜 - 只在非學生模式下載入
      if (!assignmentIdParam) {
        loadActivityLeaderboard(activityIdParam);
      }

      // 優先檢查是否為學生遊戲模式（有 assignmentId）
      if (assignmentIdParam) {
        const isAnon = anonymousParam === 'true';
        console.log('🎓 學生遊戲模式:', { activityIdParam, assignmentIdParam, studentName: studentNameParam, anonymous: isAnon });
        setAssignmentId(assignmentIdParam);
        setIsAnonymous(isAnon);
        if (studentNameParam) {
          setStudentName(studentNameParam);
        }
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
    } else if (activityIdParam === 'undefined' || activityIdParam === 'null') {
      // 🔥 [v57.3] 如果 activityId 是 "undefined" 或 "null"，清空狀態
      console.warn('⚠️ [v57.3] 檢測到無效的 activityId:', activityIdParam);
      setActivityId(null);
      setCustomVocabulary([]);
    }
  }, [searchParams]);  // 🔥 [v102.5] 移除 loadActivityInfo 從依賴項

  // 當 session 載入完成後，重新檢查 isOwner
  // 🔥 [v102.5] 修復：移除 loadActivityInfo 從依賴項
  // 原因：loadActivityInfo 是一個函數，每次 render 時都會被重新創建
  // 導致這個 useEffect 不斷被觸發，造成 customVocabulary 被重新加載
  // 這會導致 vocabUpdateTrigger 改變，iframe 重新加載，遊戲重新初始化
  useEffect(() => {
    if (session && activityId) {
      console.log('🔄 Session 已載入，重新檢查所有者身份');
      loadActivityInfo(activityId);
    }
  }, [session, activityId]);

  // 🔥 [v102.2] 移除在 customVocabulary 改變時改變 gameKey 的邏輯
  // 原因：改變 gameKey 會導致 GameSwitcher 組件被卸載和重新掛載
  // 這會導致 iframe 被銷毀和重建，遊戲被重新初始化，顯示「載入詞彙中…」
  // 改為：讓 iframe 的 src 自動更新（通過 getGameUrlWithVocabulary 函數）
  // 這樣 iframe 會自動重新加載，但不會銷毀 Phaser 遊戲實例
  // useEffect(() => {
  //   if (customVocabulary.length > 0) {
  //     console.log('🔄 [v60.0] 詞彙已更新，強制重新渲染遊戲:', customVocabulary.length, '個詞彙');
  //     setGameKey(prev => prev + 1);
  //   }
  // }, [customVocabulary]);

  // 載入自定義詞彙的函數（需要身份驗證）
  const loadCustomVocabulary = async (activityId: string) => {
    try {
      console.log('🔄 載入活動詞彙:', activityId);
      const response = await fetch(`/api/activities/${activityId}/vocabulary`);

      if (response.ok) {
        const data = await response.json() as { vocabularyItems?: any[] };
        console.log('✅ 成功載入自定義詞彙:', data.vocabularyItems);
        setCustomVocabulary(data.vocabularyItems || []);

        // 🔥 [v77.0] 根據詞彙數量自動調整 itemsPerPage
        if (data.vocabularyItems && data.vocabularyItems.length === 20) {
          console.log('🎯 [v77.0] 檢測到 20 個詞彙，自動設置 itemsPerPage=20');
          setMatchUpOptions(prev => ({
            ...prev,
            itemsPerPage: 20
          }));
        }
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

        // 🔥 [v77.0] 根據詞彙數量自動調整 itemsPerPage
        if (data.activity?.vocabularyItems && data.activity.vocabularyItems.length === 20) {
          console.log('🎯 [v77.0] 檢測到 20 個詞彙，自動設置 itemsPerPage=20');
          setMatchUpOptions(prev => ({
            ...prev,
            itemsPerPage: 20
          }));
        }
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

        // 🔥 [v77.0] 根據詞彙數量自動調整 itemsPerPage
        if (data.activity?.vocabularyItems && data.activity.vocabularyItems.length === 20) {
          console.log('🎯 [v77.0] 檢測到 20 個詞彙，自動設置 itemsPerPage=20');
          setMatchUpOptions(prev => ({
            ...prev,
            itemsPerPage: 20
          }));
        }
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

              <Link
                href="/learn/dashboard"
                className="px-2 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                style={{ minHeight: '44px' }}
                title="學習數據"
              >
                📈
              </Link>

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
              <Link
                href="/learn/dashboard"
                className="px-2 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                style={{ minHeight: '44px' }}
                title="學習數據"
              >
                <span className="hidden lg:inline">學習數據</span>
                <span className="lg:hidden">📈</span>
              </Link>

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
            key={gameKey}
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
            studentName={studentName}
            isAnonymous={isAnonymous}
            gameOptions={gameOptions}
            visualStyle={gameOptions.visualStyle}
            matchUpOptions={matchUpOptions}
            speakingCardsOptions={speakingCardsOptions}
          />
        </div>



        {/* SRS 學習面板 - 放在遊戲容器下面，只在沒有活動ID且顯示面板時顯示 */}
        {!activityId && !assignmentId && !isShared && showSRSPanel && (
          <div className="mb-4">
            <SRSLearningPanel
              geptLevel={
                currentGeptLevel === 'elementary' ? 'ELEMENTARY' :
                currentGeptLevel === 'intermediate' ? 'INTERMEDIATE' :
                'HIGH_INTERMEDIATE'
              }
              onStartLearning={handleStartSRSLearning}
            />
          </div>
        )}

        {/* SRS 複習詳情 - 只在 SRS 模式且有單字 IDs 時顯示 */}
        {srsMode && srsWordIds.length > 0 && (
          <div className="mb-4">
            <SRSReviewDetails
              wordIds={srsWordIds}
              geptLevel={
                currentGeptLevel === 'elementary' ? 'ELEMENTARY' :
                currentGeptLevel === 'intermediate' ? 'INTERMEDIATE' :
                'HIGH_INTERMEDIATE'
              }
            />
          </div>
        )}

        {/* 作業信息區域 - 只在有 activityId 且不是學生模式時顯示 */}
        {activityId && !assignmentId && !isShared && activityResults.length > 0 && (
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
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {activityResults.map((result) => (
                    <tr key={result.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm">
                        <Link
                          href={`/my-results/${result.id}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                        >
                          {result.title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{result.participantCount}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(result.createdAt).toLocaleDateString('zh-TW', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {result.deadline
                          ? new Date(result.deadline).toLocaleDateString('zh-TW', {
                              day: 'numeric',
                              month: 'long'
                            })
                          : '無截止日期'
                        }
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          {/* 複製學生分享連結按鈕 */}
                          <button
                            onClick={() => handleCopyStudentLink(result)}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                            title="複製學生分享連結"
                          >
                            {copySuccessMap[result.id] ? (
                              <>
                                <span className="text-green-600">✓</span>
                                <span className="text-green-600">已複製</span>
                              </>
                            ) : (
                              <>
                                <LinkIcon className="w-3 h-3" />
                                <span>連結</span>
                              </>
                            )}
                          </button>

                          {/* QR Code 按鈕 */}
                          <button
                            onClick={() => handleShowResultQRCode(result)}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                            title="顯示 QR Code"
                          >
                            <QrCodeIcon className="w-3 h-3" />
                            <span>QR</span>
                          </button>

                          {/* 刪除按鈕 */}
                          <button
                            onClick={() => handleDeleteResult(result)}
                            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-red-600 bg-white border border-red-300 rounded hover:bg-red-50 transition-colors"
                            title="刪除作業"
                          >
                            <TrashIcon className="w-3 h-3" />
                            <span>刪除</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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

        {/* 增強版活動信息框 - 只在有 activityId 且不是學生模式時顯示 */}
        {activityId && !assignmentId && !isShared && activityInfo && (
          <EnhancedActivityInfoBox
            activityId={activityId}
            activityTitle={activityInfo.title}
            templateType={activityInfo.templateType}
            author={activityInfo.author}
            originalAuthor={activityInfo.originalAuthor}
            copiedFromActivityId={activityInfo.copiedFromActivityId}
            tags={activityInfo.tags}
            category={activityInfo.category}
            geptLevel={activityInfo.geptLevel}
            description={activityInfo.description}
            createdAt={activityInfo.createdAt}
            isOwner={isOwner}
            onPrint={handlePrint}
            onEmbed={handleEmbed}
            onRename={handleRename}
            onAssignment={handleAssignment}
            onCopy={handleCopyActivity}
            isCopying={isCopying}
            onEditTags={handleEditTags}
          />
        )}

        {/* 統計和歷史 - 響應式網格佈局 */}
        <div className="stats-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8">
          {/* 視覺風格和遊戲選項面板 - 只在有活動ID時顯示 */}
          {activityId && (
            <div className="stats-card md:col-span-2 lg:col-span-3">
              {/* 視覺風格選擇器 */}
              <VisualStyleSelector
                selectedStyle={gameOptions.visualStyle}
                onChange={async (styleId) => {
                  // 更新本地狀態
                  const newOptions = { ...gameOptions, visualStyle: styleId };
                  setGameOptions(newOptions);

                  // 自動保存到資料庫
                  try {
                    console.log('🎨 自動保存視覺風格:', styleId);
                    const response = await fetch(`/api/activities/${activityId}`, {
                      method: 'PUT',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        gameOptions: newOptions,
                      }),
                    });

                    if (response.ok) {
                      console.log('✅ 視覺風格已自動保存');
                      // 自動應用選項（重新載入遊戲）
                      setGameKey(prev => prev + 1);
                    } else {
                      console.error('❌ 自動保存失敗');
                    }
                  } catch (error) {
                    console.error('❌ 自動保存時出錯:', error);
                  }
                }}
              />

              {/* Shimozurdo 遊戲專屬選項面板 - 只在 Shimozurdo 遊戲時顯示 */}
              {currentGameId === 'shimozurdo-game' && (
                <GameOptionsPanel
                  options={gameOptions}
                  onChange={setGameOptions}
                />
              )}

              {/* Match-up 遊戲專屬選項面板 - 只在 Match-up 遊戲時顯示 */}
              {currentGameId === 'match-up-game' && (
                <MatchUpOptionsPanel
                  options={matchUpOptions}
                  onChange={setMatchUpOptions}
                  totalVocabulary={customVocabulary.length}
                />
              )}

              {/* Speaking Cards 遊戲專屬選項面板 - 只在 Speaking Cards 遊戲時顯示 */}
              {currentGameId === 'speaking-cards' && (
                <SpeakingCardsOptionsPanel
                  options={speakingCardsOptions}
                  onChange={setSpeakingCardsOptions}
                  totalVocabulary={customVocabulary.length}
                />
              )}
              {/* 應用選項按鈕 */}
              <div className="mt-4 flex justify-end gap-2">
                <button
                  onClick={async () => {
                    // 保存選項
                    if (isSavingOptions) return; // 防止重複點擊

                    setIsSavingOptions(true);
                    try {
                      console.log('🔍 開始保存遊戲選項:', gameOptions);
                      console.log('🔍 開始保存 Match-up 選項:', matchUpOptions);

                      const response = await fetch(`/api/activities/${activityId}`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          gameOptions,
                          matchUpOptions,
                        }),
                      });

                      if (response.ok) {
                        const data = await response.json();
                        console.log('✅ 選項保存成功:', data);

                        // 🔥 v44.0：驗證返回的數據格式
                        if (!data.success) {
                          console.warn('⚠️ 警告：API 返回的 success 標誌為 false');
                        }

                        if (currentGameId === 'match-up-game') {
                          if (!data.matchUpOptions && !data.activity?.matchUpOptions) {
                            console.warn('⚠️ 警告：API 返回的數據中缺少 matchUpOptions');
                          } else {
                            console.log('✅ [MatchUpOptions] 驗證成功:', data.matchUpOptions || data.activity?.matchUpOptions);
                          }
                        }

                        // 顯示成功消息（根據遊戲類型顯示不同的選項）
                        let successMessage = '✅ 選項已成功保存！\n\n已保存的設置：\n';

                        // 視覺風格（所有遊戲共用）
                        successMessage += `🎨 視覺風格: ${gameOptions.visualStyle}\n`;

                        // 如果是 Shimozurdo 遊戲，顯示 Shimozurdo 選項
                        if (currentGameId === 'shimozurdo-game') {
                          successMessage += `⏱️ 計時器: ${gameOptions.timer.type === 'none' ? '無' : gameOptions.timer.type === 'countUp' ? '正計時' : '倒計時'}\n` +
                            `❤️ 生命值: ${gameOptions.lives} 條命\n` +
                            `⚡ 速度: ${gameOptions.speed}\n` +
                            `🎲 隨機順序: ${gameOptions.random ? '開啟' : '關閉'}\n` +
                            `📝 顯示答案: ${gameOptions.showAnswers ? '開啟' : '關閉'}`;
                        }

                        // 如果是 Match-up 遊戲，顯示 Match-up 選項
                        if (currentGameId === 'match-up-game') {
                          successMessage += `⏱️ 計時器: ${matchUpOptions.timer.type === 'none' ? '無' : matchUpOptions.timer.type === 'countUp' ? '正計時' : `倒計時 ${matchUpOptions.timer.minutes}:${matchUpOptions.timer.seconds}`}\n` +
                            `📐 佈局: ${matchUpOptions.layout === 'separated' ? '分離（左右）' : '混合'}\n` +
                            `🎲 隨機: ${matchUpOptions.random === 'different' ? '每次不同' : '總是相同'}\n` +
                            `📝 顯示答案: ${matchUpOptions.showAnswers ? '開啟' : '關閉'}\n` +
                            `📄 每頁匹配數: ${matchUpOptions.itemsPerPage}\n` +
                            `⏭️ 自動繼續: ${matchUpOptions.autoProceed ? '開啟' : '關閉'}`;
                        }

                        alert(successMessage);
                      } else {
                        const errorData = await response.json() as { error?: string };
                        console.error('❌ 保存失敗:', errorData);
                        console.error('❌ 響應狀態:', response.status);
                        console.error('❌ 響應文本:', await response.text());

                        // 顯示詳細錯誤信息
                        const errorMessage = errorData.error || '未知錯誤';
                        alert(`❌ 保存失敗\n\n錯誤原因: ${errorMessage}\n\n請稍後再試或聯繫技術支持。`);
                      }
                    } catch (error) {
                      console.error('❌ 保存選項時出錯:', error);

                      // 顯示網絡錯誤信息
                      alert('❌ 保存失敗\n\n可能的原因：\n• 網絡連接中斷\n• 伺服器暫時無法訪問\n\n請檢查網絡連接後重試。');
                    } finally {
                      setIsSavingOptions(false);
                    }
                  }}
                  disabled={isSavingOptions}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isSavingOptions
                      ? 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
                      : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {isSavingOptions ? '💾 保存中...' : '💾 保存選項'}
                </button>
                <button
                  onClick={() => {
                    // 🔄 重新載入遊戲以應用選項
                    // 通過更新 key 來強制重新渲染 GameSwitcher 組件
                    // 這會重新創建 iframe 並應用新的 gameOptions
                    setGameKey(prev => prev + 1);
                    console.log('🔄 應用選項：重新載入遊戲');
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  🔄 應用選項
                </button>
              </div>
            </div>
          )}

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

          {/* 活動排行榜 - 只在有活動ID且不是學生模式時顯示 */}
          {activityId && !assignmentId && (
            <div className="stats-card bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 md:col-span-2 lg:col-span-1">
              <h3 className="font-semibold text-gray-900 mb-3 md:mb-4">🏆 排行榜</h3>
              {activityLeaderboard.length > 0 ? (
                <div className="space-y-2">
                  {activityLeaderboard.slice(0, 10).map((entry, index) => (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        index < 3 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <div className="text-lg font-bold">
                          {index === 0 && '🥇'}
                          {index === 1 && '🥈'}
                          {index === 2 && '🥉'}
                          {index > 2 && `#${index + 1}`}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {entry.playerName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {entry.correctCount}/{entry.totalCount} 題 • {entry.accuracy.toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-2">
                        <div className="font-bold text-blue-600">
                          {entry.score} 分
                        </div>
                        <div className="text-xs text-gray-500">
                          {Math.floor(entry.timeSpent / 60)}:{(entry.timeSpent % 60).toString().padStart(2, '0')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🎯</div>
                  <p>還沒有成績記錄</p>
                  <p className="text-sm">開始遊戲來創建第一個記錄吧！</p>
                </div>
              )}
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

      {/* 結果 QR Code 模態框 */}
      {selectedResultForQR && (
        <QRCodeModal
          isOpen={true}
          onClose={() => setSelectedResultForQR(null)}
          result={{
            id: selectedResultForQR.id,
            title: selectedResultForQR.title,
            activityName: selectedResultForQR.title,
            participantCount: 0,
            createdAt: new Date().toISOString(),
            status: 'active' as const,
            assignmentId: selectedResultForQR.assignmentId,
            activityId: selectedResultForQR.activityId
          }}
        />
      )}

      {/* 刪除結果確認對話框 */}
      {selectedResultForDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">確認刪除作業</h3>
            <p className="text-gray-600 mb-2">
              確定要刪除以下作業嗎？
            </p>
            <p className="text-gray-900 font-medium mb-4">
              「{selectedResultForDelete.title}」
            </p>
            <p className="text-sm text-red-600 mb-6">
              ⚠️ 此操作將刪除所有相關的學生成績記錄，且無法復原。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelectedResultForDelete(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
              >
                取消
              </button>
              <button
                onClick={confirmDeleteResult}
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

      {/* 編輯標籤模態框 */}
      {showEditTagsModal && activityId && activityInfo && (
        <EditActivityTagsModal
          activity={{
            id: activityId,
            title: activityInfo.title,
            communityCategory: activityInfo.category,
            communityTags: activityInfo.tags,
            communityDescription: activityInfo.description,
          }}
          onClose={() => setShowEditTagsModal(false)}
          onSuccess={handleEditTagsSuccess}
        />
      )}

    </div>
  );
};

export default GameSwitcherPage;
