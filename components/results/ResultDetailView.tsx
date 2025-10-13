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

  // 排序參與者
  const sortedParticipants = [...result.participants].sort((a, b) => {
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
              href={`/resource/${result.activityId}/${result.activityName}`}
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
      {result.statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* 學生的數量 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-500 mb-1">學生的數量</div>
            <div className="text-2xl font-bold text-gray-900">{result.statistics.totalStudents}</div>
          </div>

          {/* 平均得分 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-500 mb-1">平均得分</div>
            <div className="text-2xl font-bold text-gray-900">
              {result.statistics.averageScore.toFixed(1)}
              <span className="text-sm text-gray-500 ml-1">/ 100</span>
            </div>
          </div>

          {/* 最高分 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-500 mb-1">最高分</div>
            <div className="text-2xl font-bold text-gray-900">
              {result.statistics.highestScore.score}
              <span className="text-sm text-gray-500 ml-1">/ 100</span>
            </div>
            <div className="text-sm text-gray-600 mt-1">{result.statistics.highestScore.studentName}</div>
          </div>

          {/* 最快的 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="text-sm text-gray-500 mb-1">最快的</div>
            <div className="text-2xl font-bold text-gray-900">
              {formatTime(result.statistics.fastestTime.timeSpent)}
            </div>
            <div className="text-sm text-gray-600 mt-1">{result.statistics.fastestTime.studentName}</div>
          </div>
        </div>
      )}

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
              {sortedParticipants.map((participant) => (
                <tr key={participant.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {participant.studentName}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 按問題顯示的結果 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-4 mb-4">
          <span className="text-sm text-gray-500">排序</span>
          <label className="flex items-center">
            <input
              type="radio"
              name="questionSort"
              value="number"
              checked={questionSort === 'number'}
              onChange={(e) => setQuestionSort(e.target.value as 'number')}
              className="mr-2"
            />
            序號
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
            正確
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
            錯誤
          </label>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-4">按問題顯示的結果</h3>

        {result.questionStatistics && result.questionStatistics.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-900"></th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">問題</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">正確</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-900">錯誤</th>
                </tr>
              </thead>
              <tbody>
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
                  .map((question) => (
                    <tr key={question.questionNumber} className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer">
                      <td className="py-3 px-4">
                        <span className="text-sm font-medium text-gray-900">{question.questionNumber}</span>
                        <span className="ml-2 text-xs text-gray-500">
                          {question.correctPercentage}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{question.questionText}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{question.correctCount}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{question.incorrectCount}</td>
                    </tr>
                  ))}
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
