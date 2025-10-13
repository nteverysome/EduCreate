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

interface QuestionStatistic {
  questionNumber: number;
  questionText: string;
  correctCount: number;
  incorrectCount: number;
  totalAttempts: number;
  correctPercentage: number;
}

interface QuestionAccuracyChartProps {
  questionStatistics: QuestionStatistic[];
  title?: string;
}

export const QuestionAccuracyChart: React.FC<QuestionAccuracyChartProps> = ({ 
  questionStatistics, 
  title = "問題正確率分析" 
}) => {
  if (!questionStatistics || questionStatistics.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8 text-gray-500">
          暫無問題統計數據
        </div>
      </div>
    );
  }

  const data = {
    labels: questionStatistics.map(q => `問題 ${q.questionNumber}`),
    datasets: [
      {
        label: '正確',
        data: questionStatistics.map(q => q.correctCount),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1,
      },
      {
        label: '錯誤',
        data: questionStatistics.map(q => q.incorrectCount),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
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
            const questionIndex = context.dataIndex;
            const question = questionStatistics[questionIndex];
            const value = context.parsed.y;
            const percentage = question.totalAttempts > 0 
              ? ((value / question.totalAttempts) * 100).toFixed(1) 
              : '0';
            return `${context.dataset.label}: ${value} 人 (${percentage}%)`;
          },
          afterLabel: function(context: any) {
            const questionIndex = context.dataIndex;
            const question = questionStatistics[questionIndex];
            return `問題內容: ${question.questionText}`;
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
          text: '問題',
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
      
      {/* 問題詳細信息 */}
      <div className="mt-4 text-sm text-gray-600">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {questionStatistics.map((question, index) => (
            <div key={question.questionNumber} className="flex justify-between">
              <span>問題 {question.questionNumber}:</span>
              <span className="font-medium">
                {question.correctPercentage}% 正確率
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuestionAccuracyChart;
