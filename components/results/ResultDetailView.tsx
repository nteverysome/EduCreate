'use client';

import React, { useState } from 'react';
import {
  ArrowLeftIcon,
  ShareIcon,
  PlayIcon,
  EllipsisVerticalIcon,
  UserIcon,
  ClockIcon,
  CalendarIcon,
  LinkIcon
} from '@heroicons/react/24/outline';
import ScoreDistributionChart from './ScoreDistributionChart';
import QuestionAccuracyChart from './QuestionAccuracyChart';

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
  shareLink: string;
  participants: GameParticipant[];
  statistics?: StatisticsSummary;
  questionStatistics?: QuestionStatistic[];
}

interface ResultDetailViewProps {
  result: AssignmentResult;
}

export const ResultDetailView: React.FC<ResultDetailViewProps> = ({ result }) => {
  const [participantSort, setParticipantSort] = useState<'submitted' | 'name' | 'correct_time'>('submitted');
  const [questionSort, setQuestionSort] = useState<'number' | 'correct' | 'incorrect'>('number');
  const [showFilter, setShowFilter] = useState<'all' | 'best' | 'first'>('all');
  const [expandedParticipant, setExpandedParticipant] = useState<string | null>(null);
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

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

  // 複製分享連結
  const copyShareLink = () => {
    navigator.clipboard.writeText(result.shareLink);
    // TODO: 顯示複製成功提示
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
        const maxScore = Math.max(...result.participants.map(p => p.score));
        return result.participants.filter(p => p.score === maxScore);

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

  // 計算篩選後的統計數據
  const filteredStatistics = (() => {
    if (filteredParticipants.length === 0) {
      return {
        totalStudents: 0,
        averageScore: 0,
        highestScore: { score: 0, studentName: '' },
        fastestTime: { timeSpent: 0, studentName: '' }
      };
    }

    // 計算平均分
    const totalScore = filteredParticipants.reduce((sum, p) => sum + p.score, 0);
    const averageScore = Math.round((totalScore / filteredParticipants.length) * 100) / 100;

    // 找出最高分
    const highestScoreParticipant = filteredParticipants.reduce((max, p) =>
      p.score > max.score ? p : max
    );

    // 找出最快時間（排除0或無效時間）
    const validTimeParticipants = filteredParticipants.filter(p => p.timeSpent > 0);
    const fastestTimeParticipant = validTimeParticipants.length > 0
      ? validTimeParticipants.reduce((min, p) =>
          p.timeSpent < min.timeSpent ? p : min
        )
      : filteredParticipants[0];

    return {
      totalStudents: filteredParticipants.length,
      averageScore,
      highestScore: {
        score: highestScoreParticipant.score,
        studentName: highestScoreParticipant.studentName
      },
      fastestTime: {
        timeSpent: fastestTimeParticipant.timeSpent,
        studentName: fastestTimeParticipant.studentName
      }
    };
  })();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* 頁面標題和導航 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <a
              href="/my-results"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 mr-4"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-1" />
              我的結果
            </a>
            <span className="text-gray-400 mr-4">•</span>
            <h1 className="text-2xl font-bold text-gray-900">{result.title}</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={copyShareLink}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <LinkIcon className="w-4 h-4 mr-2" />
              可共用結果連結
            </button>
            
            <a
              href={`/games/switcher?game=${result.gameType}&activityId=${result.activityId}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlayIcon className="w-4 h-4 mr-2" />
              打開活動
            </a>
            
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <EllipsisVerticalIcon className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      <hr className="mb-8" />

      {/* 課業信息 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="text-sm text-gray-500 mb-1">課業</div>
            <div className="font-medium">{result.activityName}</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500 mb-1">遊戲類型</div>
            <div className="font-medium">{result.gameType}</div>
          </div>
          
          <div className="flex items-center">
            <ClockIcon className="w-4 h-4 text-gray-400 mr-1" />
            <div>
              <div className="text-sm text-gray-500">創建時間</div>
              <div className="font-medium">{formatDateTime(result.createdAt)}</div>
            </div>
          </div>
          
          <div className="flex items-center">
            <CalendarIcon className="w-4 h-4 text-gray-400 mr-1" />
            <div>
              <div className="text-sm text-gray-500">截止日期</div>
              <div className="font-medium">{result.deadline ? formatDateTime(result.deadline) : '無截止日期'}</div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 flex items-center">
          <UserIcon className="w-4 h-4 text-gray-400 mr-1" />
          <span className="font-medium mr-4">{result.participantCount}</span>
          
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
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
            <label className="flex items-center">
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
            <label className="flex items-center">
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
        
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <div className="text-sm text-gray-600 mb-1">學生分享連結：</div>
          <div className="flex items-center">
            <code className="text-sm bg-white px-2 py-1 rounded border flex-1 mr-2">
              {result.shareLink}
            </code>
            <button
              onClick={copyShareLink}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              ⧉
            </button>
          </div>
        </div>
      </div>

      {/* 總結 */}
      <h2 className="text-xl font-bold text-gray-900 mb-6">總結</h2>

      {/* 統計數據總結區域 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* 學生的數量 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-1">學生的數量</div>
          <div className="text-2xl font-bold text-gray-900">{filteredStatistics.totalStudents}</div>
        </div>

        {/* 平均得分 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-1">平均得分</div>
          <div className="text-2xl font-bold text-gray-900">
            {filteredStatistics.averageScore.toFixed(1)}
            <span className="text-sm text-gray-500 ml-1">/ 100</span>
          </div>
        </div>

        {/* 最高分 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-1">最高分</div>
          <div className="text-2xl font-bold text-gray-900">
            {filteredStatistics.highestScore.score}
            <span className="text-sm text-gray-500 ml-1">/ 100</span>
          </div>
          <div className="text-sm text-gray-600 mt-1">{filteredStatistics.highestScore.studentName}</div>
        </div>

        {/* 最快的 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-sm text-gray-500 mb-1">最快的</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatTime(filteredStatistics.fastestTime.timeSpent)}
          </div>
          <div className="text-sm text-gray-600 mt-1">{filteredStatistics.fastestTime.studentName}</div>
        </div>
      </div>

      {/* 圖表分析區域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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

      {/* 按學生顯示的結果 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">排序</span>
            <label className="flex items-center">
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
            <label className="flex items-center">
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
            <label className="flex items-center">
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
        
        <h3 className="text-lg font-medium text-gray-900 mb-4">按學生顯示的結果</h3>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  學生姓名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  分數
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  正確答案
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  用時
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <span className="mr-2">{isExpanded ? '▼' : '▶'}</span>
                          {participant.studentName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {participant.score}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {participant.correctAnswers}/{participant.totalQuestions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDuration(participant.timeSpent)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
    </div>
  );
};

export default ResultDetailView;
