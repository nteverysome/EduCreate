'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

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

interface ScoreDistributionChartProps {
  participants: GameParticipant[];
  title?: string;
}

export const ScoreDistributionChart: React.FC<ScoreDistributionChartProps> = ({ 
  participants, 
  title = "分數分佈" 
}) => {
  // 創建分數區間
  const scoreRanges = [
    { label: '0-20', min: 0, max: 20 },
    { label: '21-40', min: 21, max: 40 },
    { label: '41-60', min: 41, max: 60 },
    { label: '61-80', min: 61, max: 80 },
    { label: '81-100', min: 81, max: 100 }
  ];

  // 計算每個分數區間的人數
  const distributionData = scoreRanges.map(range => {
    return participants.filter(p => p.score >= range.min && p.score <= range.max).length;
  });

  const data = {
    labels: scoreRanges.map(range => range.label),
    datasets: [
      {
        label: '學生人數',
        data: distributionData,
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',   // 紅色 (0-20)
          'rgba(245, 158, 11, 0.8)',  // 橙色 (21-40)
          'rgba(234, 179, 8, 0.8)',   // 黃色 (41-60)
          'rgba(34, 197, 94, 0.8)',   // 綠色 (61-80)
          'rgba(59, 130, 246, 0.8)',  // 藍色 (81-100)
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(234, 179, 8, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: title,
        font: {
          size: 16,
          weight: 'bold' as const
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y;
            const total = participants.length;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            return `${context.dataset.label}: ${value} 人 (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 11
          }
        },
        title: {
          display: true,
          text: '學生人數',
          font: {
            size: 12
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: 11
          }
        },
        title: {
          display: true,
          text: '分數區間',
          font: {
            size: 12
          }
        }
      }
    },
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="h-64">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default ScoreDistributionChart;
