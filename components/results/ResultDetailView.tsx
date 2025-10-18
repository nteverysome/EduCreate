'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeftIcon,
  ShareIcon,
  PlayIcon,
  EllipsisVerticalIcon,
  UserIcon,
  ClockIcon,
  CalendarIcon,
  LinkIcon,
  PencilIcon,
  TrashIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import ScoreDistributionChart from './ScoreDistributionChart';
import QuestionAccuracyChart from './QuestionAccuracyChart';
import RenameResultModal from './RenameResultModal';
import SetDeadlineModal from './SetDeadlineModal';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { useRouter } from 'next/navigation';

interface GameParticipant {
  id: string;
  studentName: string;
  score: number;
  timeSpent: number;
  correctAnswers: number;
  totalQuestions: number;
  completedAt: string;
  gameData?: any;
}

interface StatisticsSummary {
  totalStudents: number;
  averageScore: number;
  highestScore: {
    score: number;
    studentName: string;
  };
  fastestTime: {
    timeSpent: number;
    studentName: string;
  };
}

interface QuestionStatistic {
  questionNumber: number;
  questionText: string;
  correctCount: number;
  incorrectCount: number;
  totalAttempts: number;
  correctPercentage: number;
}

interface AssignmentResult {
  id: string;
  title: string;
  activityName: string;
  activityId: string;
  assignmentId: string;
  participantCount: number;
  createdAt: string;
  deadline?: string;
  status: 'active' | 'completed' | 'expired';
  gameType: string;
  shareLink?: string;
  shareToken?: string; // 可共用結果連結的 token
  participants: GameParticipant[];
  statistics?: StatisticsSummary;
  questionStatistics?: QuestionStatistic[];
  isSharedView?: boolean; // 標記是否為共用視圖
}

interface ResultDetailViewProps {
  result: AssignmentResult;
}

export const ResultDetailView: React.FC<ResultDetailViewProps> = ({ result }) => {
  const router = useRouter();
  const [participantSort, setParticipantSort] = useState<'submitted' | 'name' | 'correct_time'>('submitted');
  const [questionSort, setQuestionSort] = useState<'number' | 'correct' | 'incorrect'>('number');
  const [showFilter, setShowFilter] = useState<'all' | 'best' | 'first'>('all');
  const [expandedParticipant, setExpandedParticipant] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // 下拉菜單狀態
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 模態框狀態
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showSetDeadlineModal, setShowSetDeadlineModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // 點擊外部關閉下拉菜單
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // 修正學生分享連結的域名
  const getCorrectedShareLink = () => {
    if (!result.shareLink) return '';

    try {
      const urlObj = new URL(result.shareLink);
      const path = urlObj.pathname; // 例如：/play/activityId/assignmentId
      const correctedUrl = `${window.location.origin}${path}`;
      return correctedUrl;
    } catch (error) {
      // 如果 URL 解析失敗，返回原始連結
      return result.shareLink;
    }
  };

  const correctedShareLink = getCorrectedShareLink();

  // 格式化時間顯示
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 格式化時間長度
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 格式化時間（秒）- 用於統計顯示
  const formatTime = (seconds: number) => {
    return formatDuration(seconds);
  };

  // 打開可共用結果連結
  const openShareableResultLink = () => {
    if (!result.shareToken) return;

    const shareableUrl = `${window.location.origin}/shared/results/${result.shareToken}`;
    window.open(shareableUrl, '_blank');
  };

  // 複製學生分享連結（遊戲連結）
  const copyStudentShareLink = async () => {
    if (!correctedShareLink) return;

    try {
      await navigator.clipboard.writeText(correctedShareLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('複製失敗:', err);
      const textArea = document.createElement('textarea');
      textArea.value = correctedShareLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  // 打開遊戲連結
  const openGameLink = () => {
    if (correctedShareLink) {
      window.open(correctedShareLink, '_blank');
    }
  };

  // 處理重新命名
  const handleRename = async (resultId: string, newTitle: string) => {
    try {
      const response = await fetch(`/api/results/${resultId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newTitle }),
      });

      if (!response.ok) {
        throw new Error('重命名失敗');
      }

      // 重新載入頁面以更新標題
      window.location.reload();
    } catch (error) {
      console.error('重命名結果失敗:', error);
      throw error;
    }
  };

  // 處理設置截止日期
  const handleSetDeadline = async (assignmentId: string, deadline: string | null) => {
    try {
      const response = await fetch(`/api/assignments/${assignmentId}/deadline`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deadline }),
      });

      if (!response.ok) {
        throw new Error('設置截止日期失敗');
      }

      // 重新載入頁面以更新截止日期
      window.location.reload();
    } catch (error) {
      console.error('設置截止日期失敗:', error);
      throw error;
    }
  };

  // 處理刪除結果
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/results/${result.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('刪除失敗');
      }

      // 刪除成功後跳轉到結果列表頁面
      router.push('/my-results');
    } catch (error) {
      console.error('刪除結果失敗:', error);
      alert('刪除失敗，請稍後重試');
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // 獲取學生的詳細答案數據
  const getStudentAnswers = (participant: GameParticipant) => {
    // 檢查新數據格式（包含詳細問題數據）
    if (participant.gameData && participant.gameData.finalResult && participant.gameData.finalResult.questions) {
      return participant.gameData.finalResult.questions;
    }

    // 處理舊數據格式 - 創建基本問題數據用於展示
    if (participant.gameData && participant.gameData.finalResult) {
      const finalResult = participant.gameData.finalResult;
      const totalQuestions = finalResult.totalQuestions || 0;
      const correctAnswers = finalResult.correctAnswers || 0;

      if (totalQuestions > 0) {
        const basicQuestions = [];
        for (let i = 1; i <= totalQuestions; i++) {
          basicQuestions.push({
            questionNumber: i,
            questionText: `問題 ${i}`,
            correctAnswer: '資料不完整',
            studentAnswer: i <= correctAnswers ? '正確' : '錯誤',
            isCorrect: i <= correctAnswers,
            timestamp: Date.now(),
            isLegacyData: true // 標記為舊數據
          });
        }
        return basicQuestions;
      }
    }

    return [];
  };

  // 獲取特定問題的所有學生回答
  const getQuestionAnswers = (questionText: string) => {
    const answers: Array<{
      studentName: string;
      studentAnswer: string;
      isCorrect: boolean;
      correctAnswer: string;
    }> = [];

    result.participants.forEach(participant => {
      const studentAnswers = getStudentAnswers(participant);
      studentAnswers.forEach((answer: any) => {
        if (answer.questionText === questionText) {
          answers.push({
            studentName: participant.studentName,
            studentAnswer: answer.studentAnswer,
            isCorrect: answer.isCorrect,
            correctAnswer: answer.correctAnswer
          });
        }
      });
    });

    return answers;
  };

  // 切換學生詳細信息展開狀態
  const toggleParticipantExpansion = (participantId: string) => {
    setExpandedParticipant(expandedParticipant === participantId ? null : participantId);
  };

  // 篩選參與者
  const filteredParticipants = (() => {
    switch (showFilter) {
      case 'best':
        // 顯示最高分的參與者（可能有多個相同最高分）
        if (result.participants.length === 0) return [];
        const maxScore = Math.max(...result.participants.map(p => (p as any).calculatedScore || p.score));
        return result.participants.filter(p => ((p as any).calculatedScore || p.score) === maxScore);

      case 'first':
        // 顯示最早提交的參與者
        if (result.participants.length === 0) return [];
        const earliestTime = Math.min(...result.participants.map(p => new Date(p.completedAt).getTime()));
        return result.participants.filter(p => new Date(p.completedAt).getTime() === earliestTime);

      case 'all':
      default:
        // 顯示所有參與者
        return result.participants;
    }
  })();

  // 排序篩選後的參與者
  const sortedParticipants = [...filteredParticipants].sort((a, b) => {
    switch (participantSort) {
      case 'name':
        return a.studentName.localeCompare(b.studentName);
      case 'correct_time':
        const aScore = (a.correctAnswers / a.totalQuestions) * 100 - (a.timeSpent / 60);
        const bScore = (b.correctAnswers / b.totalQuestions) * 100 - (b.timeSpent / 60);
        return bScore - aScore;
      case 'submitted':
      default:
        return new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime();
    }
  });

  // 🎯 使用 API 返回的統計數據，而不是重新計算
  // 這確保與後端的 Wordwall 邏輯保持一致
  const filteredStatistics = (() => {
    const defaultStats = {
      totalStudents: 0,
      averageScore: 0,
      highestScore: { score: 0, studentName: '' },
      fastestTime: { timeSpent: 0, studentName: '' }
    };

    if (filteredParticipants.length === 0) {
      return defaultStats;
    }

    // 如果是顯示所有參與者，直接使用 API 統計數據
    if (showFilter === 'all') {
      return result.statistics || defaultStats;
    }

    // 對於篩選後的數據，需要重新計算（但這裡暫時使用 API 數據）
    // TODO: 未來可以為篩選後的數據實現專門的計算邏輯
    return result.statistics || defaultStats;
  })();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* 頁面標題和導航 - 響應式 */}
      <div className="mb-6 sm:mb-8">
        {/* 返回連結 - 移動端獨立一行 */}
        <div className="mb-3 sm:mb-0">
          <a
            href="/my-results"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm sm:text-base"
          >
            <ArrowLeftIcon className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
            我的結果
          </a>
        </div>

        {/* 標題和操作按鈕 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 break-words">{result.title}</h1>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {!result.isSharedView && (
              <button
                onClick={openShareableResultLink}
                className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <LinkIcon className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
                <span className="hidden sm:inline">可共用結果連結</span>
                <span className="sm:hidden">分享</span>
              </button>
            )}

            <a
              href={`/games/switcher?game=${result.gameType}&activityId=${result.activityId}`}
              className="inline-flex items-center px-3 sm:px-4 py-2 border border-gray-300 rounded-md shadow-sm text-xs sm:text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlayIcon className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">打開活動</span>
              <span className="sm:hidden">活動</span>
            </a>

            {!result.isSharedView && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <EllipsisVerticalIcon className="w-5 h-5 text-gray-400" />
                </button>

                {/* 下拉菜單 */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    {/* 重新命名 */}
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        setShowRenameModal(true);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <PencilIcon className="w-4 h-4 text-gray-400" />
                      <span>重新命名</span>
                    </button>

                    {/* 設置截止日期 */}
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        setShowSetDeadlineModal(true);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      <span>設置截止日期</span>
                    </button>

                    {/* 分享連結 */}
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        copyStudentShareLink();
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <ShareIcon className="w-4 h-4 text-gray-400" />
                      <span>複製分享連結</span>
                    </button>

                    {/* 查看統計 */}
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        // 滾動到統計區域
                        document.getElementById('statistics-section')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                    >
                      <ChartBarIcon className="w-4 h-4 text-gray-400" />
                      <span>查看統計</span>
                    </button>

                    <hr className="my-1" />

                    {/* 刪除結果 */}
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        setShowDeleteModal(true);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                    >
                      <TrashIcon className="w-4 h-4 text-red-500" />
                      <span>刪除結果</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <hr className="mb-6 sm:mb-8" />

      {/* 課業信息 - 響應式 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div>
            <div className="text-xs sm:text-sm text-gray-500 mb-1">課業</div>
            <div className="font-medium text-sm sm:text-base break-words">{result.activityName}</div>
          </div>

          <div>
            <div className="text-xs sm:text-sm text-gray-500 mb-1">遊戲類型</div>
            <div className="font-medium text-sm sm:text-base">{result.gameType}</div>
          </div>

          <div className="flex items-start sm:items-center">
            <ClockIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-1 mt-0.5 sm:mt-0 flex-shrink-0" />
            <div>
              <div className="text-xs sm:text-sm text-gray-500">創建時間</div>
              <div className="font-medium text-sm sm:text-base">{formatDateTime(result.createdAt)}</div>
            </div>
          </div>

          <div className="flex items-start sm:items-center">
            <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mr-1 mt-0.5 sm:mt-0 flex-shrink-0" />
            <div>
              <div className="text-xs sm:text-sm text-gray-500">截止日期</div>
              {result.deadline ? (
                <div className="font-medium text-sm sm:text-base">{formatDateTime(result.deadline)}</div>
              ) : (
                <button
                  onClick={() => setShowSetDeadlineModal(true)}
                  className="font-medium text-sm sm:text-base text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                >
                  無截止日期（點擊設置）
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 參與者數量和篩選 - 響應式 */}
        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-0">
          <div className="flex items-center">
            <UserIcon className="w-4 h-4 text-gray-400 mr-1" />
            <span className="font-medium mr-4 text-sm sm:text-base">{result.participantCount}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <label className="flex items-center text-sm sm:text-base">
              <input
                type="radio"
                name="filter"
                value="all"
                checked={showFilter === 'all'}
                onChange={(e) => setShowFilter(e.target.value as 'all')}
                className="mr-2"
              />
              所有
            </label>
            <label className="flex items-center text-sm sm:text-base">
              <input
                type="radio"
                name="filter"
                value="best"
                checked={showFilter === 'best'}
                onChange={(e) => setShowFilter(e.target.value as 'best')}
                className="mr-2"
              />
              最好
            </label>
            <label className="flex items-center text-sm sm:text-base">
              <input
                type="radio"
                name="filter"
                value="first"
                checked={showFilter === 'first'}
                onChange={(e) => setShowFilter(e.target.value as 'first')}
                className="mr-2"
              />
              第一
            </label>
          </div>
        </div>

        {/* 學生分享連結 - 響應式 */}
        <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-md">
          <div className="text-xs sm:text-sm text-gray-600 mb-2">學生分享連結：</div>
          <div className="flex flex-col sm:flex-row gap-2">
            <code className="text-xs sm:text-sm bg-white px-2 sm:px-3 py-2 rounded border flex-1 break-all">
              {correctedShareLink}
            </code>
            <div className="flex gap-2">
              <button
                onClick={openGameLink}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center px-3 py-2 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                title="直接開始遊戲"
              >
                <svg className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
                </svg>
                <span className="hidden sm:inline">Play</span>
              </button>
              <button
                onClick={copyStudentShareLink}
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                  copySuccess
                    ? 'text-green-700 bg-green-50 border-green-300'
                    : 'text-gray-700 bg-white hover:bg-gray-50'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                title="複製連結"
              >
                {copySuccess ? (
                  <>
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="hidden sm:inline">已複製</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="hidden sm:inline">複製</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 總結 - 響應式 */}
      <h2 id="statistics-section" className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">總結</h2>

      {/* 統計數據總結區域 - 響應式網格 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
        {/* 學生的數量 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
          <div className="text-xs sm:text-sm text-gray-500 mb-1">學生的數量</div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">{filteredStatistics.totalStudents}</div>
        </div>

        {/* 平均得分 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
          <div className="text-xs sm:text-sm text-gray-500 mb-1">平均得分</div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">
            {filteredStatistics.averageScore.toFixed(1)}
            <span className="text-xs sm:text-sm text-gray-500 ml-1">/ 100</span>
          </div>
        </div>

        {/* 最高分 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
          <div className="text-xs sm:text-sm text-gray-500 mb-1">最高分</div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">
            {filteredStatistics.highestScore.score}
            <span className="text-xs sm:text-sm text-gray-500 ml-1">/ 100</span>
          </div>
          <div className="text-xs sm:text-sm text-gray-600 mt-1 truncate">{filteredStatistics.highestScore.studentName}</div>
        </div>

        {/* 最快的 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 sm:p-4 lg:p-6">
          <div className="text-xs sm:text-sm text-gray-500 mb-1">最快的</div>
          <div className="text-xl sm:text-2xl font-bold text-gray-900">
            {formatTime(filteredStatistics.fastestTime.timeSpent)}
          </div>
          <div className="text-xs sm:text-sm text-gray-600 mt-1 truncate">{filteredStatistics.fastestTime.studentName}</div>
        </div>
      </div>

      {/* 圖表分析區域 - 響應式 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* 分數分佈圖表 */}
        <ScoreDistributionChart
          participants={filteredParticipants}
          title="分數分佈"
        />

        {/* 問題正確率圖表 */}
        <QuestionAccuracyChart
          questionStatistics={result.questionStatistics || []}
          title="問題正確率分析"
        />
      </div>

      {/* 按學生顯示的結果 - 響應式 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
        {/* 排序選項 - 響應式 */}
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-xs sm:text-sm text-gray-500">排序</span>
            <div className="flex flex-wrap gap-3 sm:gap-4">
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  name="participantSort"
                  value="submitted"
                  checked={participantSort === 'submitted'}
                  onChange={(e) => setParticipantSort(e.target.value as 'submitted')}
                  className="mr-2"
                />
                提交
              </label>
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  name="participantSort"
                  value="name"
                  checked={participantSort === 'name'}
                  onChange={(e) => setParticipantSort(e.target.value as 'name')}
                  className="mr-2"
                />
                名字
              </label>
              <label className="flex items-center text-sm">
                <input
                  type="radio"
                  name="participantSort"
                  value="correct_time"
                  checked={participantSort === 'correct_time'}
                  onChange={(e) => setParticipantSort(e.target.value as 'correct_time')}
                  className="mr-2"
                />
                正確 + 時間
              </label>
            </div>
          </div>
        </div>

        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">按學生顯示的結果</h3>

        {/* 學生結果表格 - 響應式 */}
        <div className="overflow-x-auto -mx-4 sm:mx-0">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  學生姓名
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  分數
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  正確答案
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  用時
                </th>
                <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  完成時間
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedParticipants.map((participant) => {
                const studentAnswers = getStudentAnswers(participant);
                const isExpanded = expandedParticipant === participant.id;

                return (
                  <React.Fragment key={participant.id}>
                    <tr
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleParticipantExpansion(participant.id)}
                    >
                      <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <span className="mr-1 sm:mr-2 text-xs">{isExpanded ? '▼' : '▶'}</span>
                          <span className="truncate">{participant.studentName}</span>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                        {(participant as any).calculatedScore || participant.score}%
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden sm:table-cell">
                        {participant.correctAnswers}/{participant.totalQuestions}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden md:table-cell">
                        {formatDuration(participant.timeSpent)}
                      </td>
                      <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden lg:table-cell">
                        {formatDateTime(participant.completedAt)}
                      </td>
                    </tr>

                    {/* 展開的詳細答案行 */}
                    {isExpanded && studentAnswers.length > 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 bg-gray-50">
                          <div className="space-y-2">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">詳細答案：</h4>
                            {/* 舊數據提示 */}
                            {studentAnswers.length > 0 && studentAnswers[0].isLegacyData && (
                              <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                                <p className="text-sm text-yellow-800">
                                  ℹ️ 此結果使用舊數據格式，僅顯示基本統計信息。新的遊戲會話將顯示完整的問題內容和學生答案。
                                </p>
                              </div>
                            )}
                            <div className="overflow-x-auto">
                              <table className="min-w-full">
                                <thead>
                                  <tr className="border-b border-gray-200">
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">問題</th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">正確答案</th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">學生答案</th>
                                    <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">結果</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {studentAnswers.map((answer: any, index: number) => (
                                    <tr key={index} className="border-b border-gray-100">
                                      <td className="py-2 text-sm text-gray-900">{answer.questionText || `問題 ${answer.questionNumber || index + 1}`}</td>
                                      <td className="py-2 text-sm text-gray-900">{answer.correctAnswer || '未知'}</td>
                                      <td className="py-2 text-sm text-gray-900">{answer.studentAnswer || '未答'}</td>
                                      <td className="py-2 text-sm">
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                          answer.isCorrect
                                            ? 'text-green-800 bg-green-100'
                                            : 'text-red-800 bg-red-100'
                                        }`}>
                                          {answer.isCorrect ? '✓ 正確' : '✗ 錯誤'}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 按問題顯示的結果 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">按問題顯示的結果</h3>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">排序方式：</span>
            <label className="flex items-center">
              <input
                type="radio"
                name="questionSort"
                value="number"
                checked={questionSort === 'number'}
                onChange={(e) => setQuestionSort(e.target.value as 'number')}
                className="mr-2"
              />
              <span className="text-sm">序號</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="questionSort"
                value="correct"
                checked={questionSort === 'correct'}
                onChange={(e) => setQuestionSort(e.target.value as 'correct')}
                className="mr-2"
              />
              <span className="text-sm">正確數</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="questionSort"
                value="incorrect"
                checked={questionSort === 'incorrect'}
                onChange={(e) => setQuestionSort(e.target.value as 'incorrect')}
                className="mr-2"
              />
              <span className="text-sm">錯誤數</span>
            </label>
          </div>
        </div>

        {result.questionStatistics && result.questionStatistics.length > 0 ? (
          <>
            {/* 問題統計總結 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-600 font-medium">總問題數</div>
                <div className="text-2xl font-bold text-blue-900">
                  {result.questionStatistics.length}
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-600 font-medium">平均正確率</div>
                <div className="text-2xl font-bold text-green-900">
                  {Math.round(result.questionStatistics.reduce((sum, q) => sum + q.correctPercentage, 0) / result.questionStatistics.length)}%
                </div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4">
                <div className="text-sm text-yellow-600 font-medium">最難問題</div>
                <div className="text-2xl font-bold text-yellow-900">
                  問題 {result.questionStatistics.reduce((min, q) => q.correctPercentage < min.correctPercentage ? q : min).questionNumber}
                </div>
                <div className="text-xs text-yellow-600">
                  {result.questionStatistics.reduce((min, q) => q.correctPercentage < min.correctPercentage ? q : min).correctPercentage}% 正確率
                </div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-sm text-purple-600 font-medium">最簡單問題</div>
                <div className="text-2xl font-bold text-purple-900">
                  問題 {result.questionStatistics.reduce((max, q) => q.correctPercentage > max.correctPercentage ? q : max).questionNumber}
                </div>
                <div className="text-xs text-purple-600">
                  {result.questionStatistics.reduce((max, q) => q.correctPercentage > max.correctPercentage ? q : max).correctPercentage}% 正確率
                </div>
              </div>
            </div>
          </>
        ) : null}

        {result.questionStatistics && result.questionStatistics.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => setQuestionSort('number')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>序號</span>
                      {questionSort === 'number' && (
                        <span className="text-blue-500">↑</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    問題內容
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => setQuestionSort('correct')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>正確</span>
                      {questionSort === 'correct' && (
                        <span className="text-blue-500">↓</span>
                      )}
                    </div>
                  </th>
                  <th
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => setQuestionSort('incorrect')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>錯誤</span>
                      {questionSort === 'incorrect' && (
                        <span className="text-blue-500">↓</span>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    正確率
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    難度分析
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {result.questionStatistics
                  .sort((a, b) => {
                    switch (questionSort) {
                      case 'correct':
                        return b.correctCount - a.correctCount;
                      case 'incorrect':
                        return b.incorrectCount - a.incorrectCount;
                      default:
                        return a.questionNumber - b.questionNumber;
                    }
                  })
                  .map((question) => {
                    // 計算難度等級
                    const getDifficultyLevel = (percentage: number) => {
                      if (percentage >= 90) return { text: '簡單', color: 'text-green-600 bg-green-100' };
                      if (percentage >= 70) return { text: '中等', color: 'text-yellow-600 bg-yellow-100' };
                      if (percentage >= 50) return { text: '困難', color: 'text-orange-600 bg-orange-100' };
                      return { text: '很困難', color: 'text-red-600 bg-red-100' };
                    };

                    const difficulty = getDifficultyLevel(question.correctPercentage);
                    const questionAnswers = getQuestionAnswers(question.questionText);
                    const isExpanded = expandedQuestion === question.questionNumber;

                    return (
                      <React.Fragment key={question.questionNumber}>
                        <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => setExpandedQuestion(isExpanded ? null : question.questionNumber)}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-900 mr-2">
                                {question.questionNumber}
                              </span>
                              <span className="text-gray-400">
                                {isExpanded ? '▼' : '▶'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900 max-w-xs truncate" title={question.questionText}>
                              {question.questionText}
                            </div>
                          </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-green-600">
                              {question.correctCount}
                            </span>
                            <span className="text-xs text-gray-500 ml-1">人</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-red-600">
                              {question.incorrectCount}
                            </span>
                            <span className="text-xs text-gray-500 ml-1">人</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${question.correctPercentage}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {question.correctPercentage}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${difficulty.color}`}>
                            {difficulty.text}
                          </span>
                        </td>
                      </tr>

                      {/* 展開的學生回答詳情 */}
                      {isExpanded && questionAnswers.length > 0 && (
                        <tr>
                          <td colSpan={6} className="px-6 py-4 bg-gray-50">
                            <div className="space-y-4">
                              <h4 className="font-semibold text-gray-900">學生回答詳情：</h4>
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-100">
                                  <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">學生</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">回答</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">標注</th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {questionAnswers.map((answer, index) => (
                                    <tr key={index}>
                                      <td className="px-4 py-2 text-sm text-gray-900">{answer.studentName}</td>
                                      <td className="px-4 py-2 text-sm text-gray-900">{answer.studentAnswer}</td>
                                      <td className="px-4 py-2 text-sm">
                                        <span className={`inline-flex items-center ${answer.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                          {answer.isCorrect ? '✓ 正確' : '✗ 錯誤'}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                        </tr>
                      )}
                      </React.Fragment>
                    );
                  })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            暫無問題統計數據
          </div>
        )}
      </div>

      {/* 重新命名模態框 */}
      <RenameResultModal
        isOpen={showRenameModal}
        result={result}
        onClose={() => setShowRenameModal(false)}
        onRename={handleRename}
      />

      {/* 設置截止日期模態框 */}
      <SetDeadlineModal
        isOpen={showSetDeadlineModal}
        result={result}
        onClose={() => setShowSetDeadlineModal(false)}
        onDeadlineSet={handleSetDeadline}
      />

      {/* 刪除確認模態框 */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        title="刪除結果"
        message={`確定要刪除「${result.title}」嗎？此操作無法撤銷，將永久刪除此結果及其所有相關數據。`}
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteModal(false)}
        confirmText="刪除"
        cancelText="取消"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ResultDetailView;
