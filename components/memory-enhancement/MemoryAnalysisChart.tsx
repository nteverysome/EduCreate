/**
 * 記憶分析圖表組件
 * 可視化 25 個 WordWall 模板的記憶科學數據
 */

import React, { useState, useEffect } from 'react';
import { MemoryConfigurationManager } from '../../lib/memory-enhancement/MemoryConfigurationManager';
import { MemoryEnhancementEngine } from '../../lib/memory-enhancement/MemoryEnhancementEngine';

interface MemoryAnalysisChartProps {
  chartType?: 'memory-distribution' | 'cognitive-load' | 'difficulty-analysis' | 'enhancement-features';
}

const MemoryAnalysisChart = ({ chartType = 'memory-distribution' }: MemoryAnalysisChartProps) => {
  const [manager] = useState(() => new MemoryConfigurationManager());
  const [engine] = useState(() => new MemoryEnhancementEngine());
  const [chartData, setChartData] = useState<any>(null);

  useEffect(() => {
    generateChartData();
  }, [chartType]);

  const generateChartData = () => {
    switch (chartType) {
      case 'memory-distribution':
        setChartData(generateMemoryDistributionData());
        break;
      case 'cognitive-load':
        setChartData(generateCognitiveLoadData());
        break;
      case 'difficulty-analysis':
        setChartData(generateDifficultyAnalysisData());
        break;
      case 'enhancement-features':
        setChartData(generateEnhancementFeaturesData());
        break;
    }
  };

  const generateMemoryDistributionData = () => {
    const memoryTypes = engine.getAllMemoryTypes();
    const templates = manager.getAllTemplateMappings();
    
    const distribution = memoryTypes.map(type => {
      const count = templates.filter(template => 
        template.primaryMemoryType === type.id || 
        template.secondaryMemoryTypes.includes(type.id)
      ).length;
      
      return {
        name: type.name,
        count,
        percentage: Math.round((count / templates.length) * 100)
      };
    }).sort((a, b) => b.count - a.count);

    return {
      title: '記憶類型分布',
      data: distribution,
      total: templates.length
    };
  };

  const generateCognitiveLoadData = () => {
    const templates = manager.getAllTemplateMappings();
    const loadCounts = { low: 0, medium: 0, high: 0 };
    
    templates.forEach(template => {
      const memoryType = engine.getMemoryType(template.primaryMemoryType);
      if (memoryType) {
        loadCounts[memoryType.cognitiveLoad]++;
      }
    });

    return {
      title: '認知負荷分析',
      data: [
        { name: '低負荷', count: loadCounts.low, color: 'bg-green-500' },
        { name: '中負荷', count: loadCounts.medium, color: 'bg-yellow-500' },
        { name: '高負荷', count: loadCounts.high, color: 'bg-red-500' }
      ],
      total: templates.length
    };
  };

  const generateDifficultyAnalysisData = () => {
    const templates = manager.getAllTemplateMappings();
    const difficultyCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    templates.forEach(template => {
      const level = template.optimalConfiguration.difficultyLevel;
      if (level >= 1 && level <= 5) {
        difficultyCounts[level as keyof typeof difficultyCounts]++;
      }
    });

    return {
      title: '難度級別分析',
      data: [
        { name: '初級 (1)', count: difficultyCounts[1], color: 'bg-green-400' },
        { name: '中級 (2)', count: difficultyCounts[2], color: 'bg-blue-400' },
        { name: '高級 (3)', count: difficultyCounts[3], color: 'bg-yellow-400' },
        { name: '專家 (4)', count: difficultyCounts[4], color: 'bg-orange-400' },
        { name: '大師 (5)', count: difficultyCounts[5], color: 'bg-red-400' }
      ],
      total: templates.length
    };
  };

  const generateEnhancementFeaturesData = () => {
    const templates = manager.getAllTemplateMappings();
    const featureCounts: { [key: string]: number } = {};
    
    templates.forEach(template => {
      template.enhancementFeatures.forEach(feature => {
        featureCounts[feature] = (featureCounts[feature] || 0) + 1;
      });
    });

    const sortedFeatures = Object.entries(featureCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // 取前10個最常見的特性

    return {
      title: '增強特性分析',
      data: sortedFeatures,
      total: templates.length
    };
  };

  const renderBarChart = (data: any) => {
    if (!data || !data.data) return null;

    const maxCount = Math.max(...data.data.map((item: any) => item.count));

    return (
      <div className="space-y-3">
        {data.data.map((item: any, index: number) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-24 text-sm text-gray-600 text-right">
              {item.name}
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
              <div
                className={`h-6 rounded-full ${item.color || 'bg-blue-500'} transition-all duration-500`}
                style={{ width: `${(item.count / maxCount) * 100}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                {item.count}
              </div>
            </div>
            <div className="w-12 text-sm text-gray-500 text-right">
              {Math.round((item.count / data.total) * 100)}%
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPieChart = (data: any) => {
    if (!data || !data.data) return null;

    const total = data.total;
    let currentAngle = 0;

    return (
      <div className="flex items-center justify-center">
        <div className="relative">
          <svg width="200" height="200" className="transform -rotate-90">
            {data.data.map((item: any, index: number) => {
              const percentage = item.count / total;
              const angle = percentage * 360;
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              
              currentAngle += angle;

              const startX = 100 + 80 * Math.cos((startAngle * Math.PI) / 180);
              const startY = 100 + 80 * Math.sin((startAngle * Math.PI) / 180);
              const endX = 100 + 80 * Math.cos((endAngle * Math.PI) / 180);
              const endY = 100 + 80 * Math.sin((endAngle * Math.PI) / 180);

              const largeArcFlag = angle > 180 ? 1 : 0;

              const pathData = [
                `M 100 100`,
                `L ${startX} ${startY}`,
                `A 80 80 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                'Z'
              ].join(' ');

              const colors = [
                '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
                '#06B6D4', '#F97316', '#84CC16', '#EC4899', '#6B7280'
              ];

              return (
                <path
                  key={index}
                  d={pathData}
                  fill={colors[index % colors.length]}
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{total}</div>
              <div className="text-sm text-gray-600">總計</div>
            </div>
          </div>
        </div>
        
        <div className="ml-8 space-y-2">
          {data.data.map((item: any, index: number) => {
            const colors = [
              'bg-blue-500', 'bg-red-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500',
              'bg-cyan-500', 'bg-orange-500', 'bg-lime-500', 'bg-pink-500', 'bg-gray-500'
            ];
            
            return (
              <div key={index} className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`} />
                <span className="text-sm text-gray-700">{item.name}</span>
                <span className="text-sm text-gray-500">({item.count})</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!chartData) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{chartData.title}</h3>
        <p className="text-gray-600">基於 {chartData.total} 個模板的分析結果</p>
      </div>

      <div className="mb-6">
        {chartType === 'memory-distribution' || chartType === 'enhancement-features' 
          ? renderBarChart(chartData)
          : renderPieChart(chartData)
        }
      </div>

      {/* 關鍵洞察 */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold text-gray-900 mb-2">關鍵洞察</h4>
        <div className="text-sm text-gray-600 space-y-1">
          {chartType === 'memory-distribution' && (
            <>
              <p>• 最常見的記憶類型：{chartData.data[0]?.name} ({chartData.data[0]?.count} 個模板)</p>
              <p>• 記憶類型覆蓋率：{chartData.data.filter((item: any) => item.count > 0).length} / {chartData.data.length} 種類型</p>
            </>
          )}
          {chartType === 'cognitive-load' && (
            <>
              <p>• 認知負荷分布相對均衡，適合不同學習階段</p>
              <p>• 高負荷模板 ({chartData.data[2]?.count}) 適合進階學習者</p>
            </>
          )}
          {chartType === 'difficulty-analysis' && (
            <>
              <p>• 難度分布涵蓋所有級別，支持漸進式學習</p>
              <p>• 中級模板最多，適合大多數學習者</p>
            </>
          )}
          {chartType === 'enhancement-features' && (
            <>
              <p>• 最常用的增強特性：{chartData.data[0]?.name}</p>
              <p>• 特性多樣化程度高，支持多元化學習體驗</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
export default MemoryAnalysisChart;
