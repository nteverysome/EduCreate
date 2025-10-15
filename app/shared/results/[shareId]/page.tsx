'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  UserIcon,
  ClockIcon,
  ChartBarIcon,
  CalendarIcon,
  EyeIcon
} from '@heroicons/react/24/outline';

interface SharedResultData {
  id: string;
  title: string;
  activityName: string;
  participantCount: number;
  createdAt: string;
  deadline?: string;
  status: 'active' | 'completed' | 'expired';
  isPublic: boolean;
  // 结果统计数据
  totalQuestions?: number;
  averageScore?: number;
  completionRate?: number;
  participants?: Array<{
    id: string;
    name: string;
    score: number;
    completedAt: string;
  }>;
}

export default function SharedResultPage() {
  const params = useParams();
  const shareId = params.shareId as string;
  
  const [resultData, setResultData] = useState<SharedResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSharedResult = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/shared/results/${shareId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('分享的結果不存在或已被刪除');
          } else if (response.status === 403) {
            setError('此結果未公開分享');
          } else {
            setError('載入結果時發生錯誤');
          }
          return;
        }

        const data = await response.json();
        setResultData(data);
      } catch (error) {
        console.error('獲取分享結果失敗:', error);
        setError('網路連接錯誤，請稍後再試');
      } finally {
        setLoading(false);
      }
    };

    if (shareId) {
      fetchSharedResult();
    }
  }, [shareId]);

  // 格式化時間顯示
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-TW', { 
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 格式化狀態顯示
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'active':
        return { text: '進行中', color: 'bg-green-100 text-green-800' };
      case 'completed':
        return { text: '已完成', color: 'bg-blue-100 text-blue-800' };
      case 'expired':
        return { text: '已過期', color: 'bg-gray-100 text-gray-800' };
      default:
        return { text: '未知', color: 'bg-gray-100 text-gray-800' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入結果中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <EyeIcon className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">無法載入結果</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <a
            href="https://edu-create.vercel.app"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            前往 EduCreate 首頁
          </a>
        </div>
      </div>
    );
  }

  if (!resultData) {
    return null;
  }

  const statusDisplay = getStatusDisplay(resultData.status);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {resultData.title}
              </h1>
              <p className="text-gray-600">{resultData.activityName}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <EyeIcon className="w-4 h-4 mr-1" />
                <span>公開分享的結果</span>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusDisplay.color}`}>
                {statusDisplay.text}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 基本信息卡片 */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">結果概覽</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <UserIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">參與人數</p>
                <p className="text-lg font-semibold text-gray-900">{resultData.participantCount}</p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <CalendarIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">創建時間</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDateTime(resultData.createdAt)}
                </p>
              </div>
            </div>

            {resultData.deadline && (
              <div className="flex items-center">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                  <ClockIcon className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">截止時間</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDateTime(resultData.deadline)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 统计数据卡片 */}
        {(resultData.totalQuestions || resultData.averageScore || resultData.completionRate) && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">統計數據</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {resultData.totalQuestions && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {resultData.totalQuestions}
                  </div>
                  <div className="text-sm text-gray-500">總題數</div>
                </div>
              )}
              
              {resultData.averageScore && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {resultData.averageScore.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">平均分數</div>
                </div>
              )}
              
              {resultData.completionRate && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {resultData.completionRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-500">完成率</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 参与者列表 */}
        {resultData.participants && resultData.participants.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">參與者結果</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      參與者
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      分數
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      完成時間
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {resultData.participants.map((participant, index) => (
                    <tr key={participant.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {participant.name || `參與者 ${index + 1}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{participant.score}%</div>
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
        )}

        {/* 页脚 */}
        <div className="text-center mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-2">
            此結果由 EduCreate 平台生成
          </p>
          <a
            href="https://edu-create.vercel.app"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            探索 EduCreate 平台
          </a>
        </div>
      </div>
    </div>
  );
}
