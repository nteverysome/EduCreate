import React, { useState, useEffect, useMemo } from 'react';

// 數據類型定義
interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string;
    borderWidth?: number;
  }>;
}

interface AnalyticsData {
  gamePerformance: ChartData;
  learningProgress: ChartData;
  memoryRetention: ChartData;
  difficultyDistribution: ChartData;
  timeSpent: ChartData;
  userEngagement: ChartData;
}

// 圖表組件接口
interface ChartProps {
  data: ChartData;
  type: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'scatter';
  title: string;
  height?: number;
  interactive?: boolean;
  showLegend?: boolean;
  showTooltips?: boolean;
}

// 簡化的圖表組件（不依賴外部庫）
const SimpleChart: React.FC<ChartProps> = ({ 
  data, 
  type, 
  title, 
  height = 300, 
  interactive = true,
  showLegend = true,
  showTooltips = true 
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [selectedDataset, setSelectedDataset] = useState<number>(0);

  const colors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
  ];

  const renderBarChart = () => {
    const maxValue = Math.max(...data.datasets[selectedDataset].data);
    const barWidth = 40;
    const spacing = 60;
    const chartWidth = data.labels.length * spacing;

    return (
      <svg width={chartWidth} height={height} className="overflow-visible">
        {/* Y軸刻度 */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
          <g key={index}>
            <line
              x1={0}
              y1={height - ratio * (height - 40)}
              x2={chartWidth}
              y2={height - ratio * (height - 40)}
              stroke="#E5E7EB"
              strokeWidth={1}
            />
            <text
              x={-10}
              y={height - ratio * (height - 40) + 5}
              fontSize="12"
              fill="#6B7280"
              textAnchor="end"
            >
              {Math.round(maxValue * ratio)}
            </text>
          </g>
        ))}

        {/* 柱狀圖 */}
        {data.datasets[selectedDataset].data.map((value, index) => {
          const barHeight = (value / maxValue) * (height - 40);
          const x = index * spacing + spacing / 2 - barWidth / 2;
          const y = height - barHeight - 20;
          const isHovered = hoveredIndex === index;

          return (
            <g key={index}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={isHovered ? colors[1] : colors[0]}
                className="transition-colors duration-200 cursor-pointer"
                onMouseEnter={() => interactive && setHoveredIndex(index)}
                onMouseLeave={() => interactive && setHoveredIndex(null)}
              />
              {/* 數值標籤 */}
              <text
                x={x + barWidth / 2}
                y={y - 5}
                fontSize="12"
                fill="#374151"
                textAnchor="middle"
                className={isHovered ? 'font-bold' : ''}
              >
                {value}
              </text>
              {/* X軸標籤 */}
              <text
                x={x + barWidth / 2}
                y={height - 5}
                fontSize="12"
                fill="#6B7280"
                textAnchor="middle"
              >
                {data.labels[index]}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  const renderLineChart = () => {
    const maxValue = Math.max(...data.datasets[selectedDataset].data);
    const pointSpacing = 80;
    const chartWidth = (data.labels.length - 1) * pointSpacing + 40;

    const points = data.datasets[selectedDataset].data.map((value, index) => ({
      x: index * pointSpacing + 20,
      y: height - (value / maxValue) * (height - 40) - 20
    }));

    const pathData = points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ');

    return (
      <svg width={chartWidth} height={height} className="overflow-visible">
        {/* 網格線 */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
          <line
            key={index}
            x1={20}
            y1={height - ratio * (height - 40) - 20}
            x2={chartWidth - 20}
            y2={height - ratio * (height - 40) - 20}
            stroke="#E5E7EB"
            strokeWidth={1}
          />
        ))}

        {/* 線條 */}
        <path
          d={pathData}
          fill="none"
          stroke={colors[0]}
          strokeWidth={3}
          className="drop-shadow-sm"
        />

        {/* 數據點 */}
        {points.map((point, index) => {
          const isHovered = hoveredIndex === index;
          return (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r={isHovered ? 8 : 6}
                fill={colors[0]}
                className="transition-all duration-200 cursor-pointer drop-shadow-sm"
                onMouseEnter={() => interactive && setHoveredIndex(index)}
                onMouseLeave={() => interactive && setHoveredIndex(null)}
              />
              {/* 懸停時顯示數值 */}
              {isHovered && (
                <g>
                  <rect
                    x={point.x - 20}
                    y={point.y - 30}
                    width={40}
                    height={20}
                    fill="#1F2937"
                    rx={4}
                  />
                  <text
                    x={point.x}
                    y={point.y - 15}
                    fontSize="12"
                    fill="white"
                    textAnchor="middle"
                  >
                    {data.datasets[selectedDataset].data[index]}
                  </text>
                </g>
              )}
              {/* X軸標籤 */}
              <text
                x={point.x}
                y={height - 5}
                fontSize="12"
                fill="#6B7280"
                textAnchor="middle"
              >
                {data.labels[index]}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  const renderPieChart = () => {
    const total = data.datasets[selectedDataset].data.reduce((sum, value) => sum + value, 0);
    const radius = Math.min(height, 300) / 2 - 40;
    const centerX = 150;
    const centerY = height / 2;

    let currentAngle = -Math.PI / 2; // 從頂部開始

    return (
      <svg width={300} height={height} className="overflow-visible">
        {data.datasets[selectedDataset].data.map((value, index) => {
          const percentage = value / total;
          const angle = percentage * 2 * Math.PI;
          const endAngle = currentAngle + angle;
          
          const x1 = centerX + radius * Math.cos(currentAngle);
          const y1 = centerY + radius * Math.sin(currentAngle);
          const x2 = centerX + radius * Math.cos(endAngle);
          const y2 = centerY + radius * Math.sin(endAngle);
          
          const largeArcFlag = angle > Math.PI ? 1 : 0;
          
          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ');

          const isHovered = hoveredIndex === index;
          const color = colors[index % colors.length];

          // 標籤位置
          const labelAngle = currentAngle + angle / 2;
          const labelRadius = radius + 30;
          const labelX = centerX + labelRadius * Math.cos(labelAngle);
          const labelY = centerY + labelRadius * Math.sin(labelAngle);

          currentAngle = endAngle;

          return (
            <g key={index}>
              <path
                d={pathData}
                fill={color}
                stroke="white"
                strokeWidth={2}
                className={`transition-all duration-200 cursor-pointer ${isHovered ? 'opacity-80 scale-105' : ''}`}
                onMouseEnter={() => interactive && setHoveredIndex(index)}
                onMouseLeave={() => interactive && setHoveredIndex(null)}
                style={{ transformOrigin: `${centerX}px ${centerY}px` }}
              />
              {/* 標籤 */}
              <text
                x={labelX}
                y={labelY}
                fontSize="12"
                fill="#374151"
                textAnchor="middle"
                className={isHovered ? 'font-bold' : ''}
              >
                {data.labels[index]}
              </text>
              <text
                x={labelX}
                y={labelY + 15}
                fontSize="11"
                fill="#6B7280"
                textAnchor="middle"
              >
                {(percentage * 100).toFixed(1)}%
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return renderBarChart();
      case 'line':
        return renderLineChart();
      case 'pie':
      case 'doughnut':
        return renderPieChart();
      default:
        return renderBarChart();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {data.datasets.length > 1 && (
          <select
            value={selectedDataset}
            onChange={(e) => setSelectedDataset(parseInt(e.target.value))}
            className="text-sm border border-gray-300 rounded px-2 py-1"
          >
            {data.datasets.map((dataset, index) => (
              <option key={index} value={index}>
                {dataset.label}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex justify-center mb-4">
        {renderChart()}
      </div>

      {showLegend && data.datasets.length > 1 && (
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {data.datasets.map((dataset, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="text-sm text-gray-700">{dataset.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 主要數據可視化組件
export default function DataVisualization() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter'>('week');
  const [selectedMetric, setSelectedMetric] = useState<'performance' | 'engagement' | 'retention'>('performance');

  // 模擬數據生成
  const generateMockData = (): AnalyticsData => {
    const labels = timeRange === 'week' 
      ? ['週一', '週二', '週三', '週四', '週五', '週六', '週日']
      : timeRange === 'month'
      ? ['第1週', '第2週', '第3週', '第4週']
      : ['Q1', 'Q2', 'Q3', 'Q4'];

    return {
      gamePerformance: {
        labels,
        datasets: [
          {
            label: '平均分數',
            data: labels.map(() => Math.floor(Math.random() * 40) + 60),
            backgroundColor: '#3B82F6',
            borderColor: '#1D4ED8'
          },
          {
            label: '完成率',
            data: labels.map(() => Math.floor(Math.random() * 30) + 70),
            backgroundColor: '#10B981',
            borderColor: '#047857'
          }
        ]
      },
      learningProgress: {
        labels: ['基礎', '進階', '高級', '專家'],
        datasets: [
          {
            label: '學習者分布',
            data: [45, 30, 20, 5],
            backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']
          }
        ]
      },
      memoryRetention: {
        labels,
        datasets: [
          {
            label: '記憶保持率',
            data: labels.map(() => Math.floor(Math.random() * 20) + 75),
            backgroundColor: '#8B5CF6',
            borderColor: '#7C3AED'
          }
        ]
      },
      difficultyDistribution: {
        labels: ['簡單', '中等', '困難'],
        datasets: [
          {
            label: '難度偏好',
            data: [40, 45, 15],
            backgroundColor: ['#10B981', '#F59E0B', '#EF4444']
          }
        ]
      },
      timeSpent: {
        labels,
        datasets: [
          {
            label: '平均學習時間(分鐘)',
            data: labels.map(() => Math.floor(Math.random() * 30) + 15),
            backgroundColor: '#06B6D4',
            borderColor: '#0891B2'
          }
        ]
      },
      userEngagement: {
        labels: ['遊戲次數', '分享次數', '評論數', '收藏數'],
        datasets: [
          {
            label: '用戶參與度',
            data: [120, 45, 78, 92],
            backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6']
          }
        ]
      }
    };
  };

  const analyticsData = useMemo(() => generateMockData(), [timeRange]);

  const metrics = [
    { id: 'performance', name: '學習表現', icon: '📊' },
    { id: 'engagement', name: '用戶參與', icon: '👥' },
    { id: 'retention', name: '記憶保持', icon: '🧠' }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">📈 數據分析儀表板</h1>
        
        {/* 控制面板 */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">時間範圍:</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="week">本週</option>
              <option value="month">本月</option>
              <option value="quarter">本季</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">關鍵指標:</label>
            <div className="flex space-x-2">
              {metrics.map((metric) => (
                <button
                  key={metric.id}
                  onClick={() => setSelectedMetric(metric.id as any)}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    selectedMetric === metric.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {metric.icon} {metric.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 關鍵指標卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100">總學習次數</p>
                <p className="text-3xl font-bold">1,234</p>
              </div>
              <div className="text-4xl opacity-80">🎮</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100">平均分數</p>
                <p className="text-3xl font-bold">87.5</p>
              </div>
              <div className="text-4xl opacity-80">🏆</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100">記憶保持率</p>
                <p className="text-3xl font-bold">92%</p>
              </div>
              <div className="text-4xl opacity-80">🧠</div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100">活躍用戶</p>
                <p className="text-3xl font-bold">567</p>
              </div>
              <div className="text-4xl opacity-80">👥</div>
            </div>
          </div>
        </div>
      </div>

      {/* 圖表網格 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SimpleChart
          data={analyticsData.gamePerformance}
          type="line"
          title="🎯 學習表現趨勢"
          interactive={true}
        />

        <SimpleChart
          data={analyticsData.learningProgress}
          type="pie"
          title="📚 學習進度分布"
          interactive={true}
        />

        <SimpleChart
          data={analyticsData.memoryRetention}
          type="bar"
          title="🧠 記憶保持率"
          interactive={true}
        />

        <SimpleChart
          data={analyticsData.userEngagement}
          type="bar"
          title="👥 用戶參與度"
          interactive={true}
        />

        <SimpleChart
          data={analyticsData.difficultyDistribution}
          type="doughnut"
          title="⚖️ 難度偏好分析"
          interactive={true}
        />

        <SimpleChart
          data={analyticsData.timeSpent}
          type="line"
          title="⏱️ 學習時間分析"
          interactive={true}
        />
      </div>

      {/* 詳細分析報告 */}
      <div className="mt-12 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">📋 詳細分析報告</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">🎯 學習效果分析</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 平均學習完成率達到 87.5%，超過行業標準</li>
              <li>• 記憶保持率在一週後仍維持 92%</li>
              <li>• 困難題目的正確率提升了 15%</li>
              <li>• 學習時間平均減少 20%，效率顯著提升</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">📈 改進建議</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• 增加更多視覺化元素以提升記憶效果</li>
              <li>• 優化困難題目的提示機制</li>
              <li>• 添加更多互動元素增加參與度</li>
              <li>• 實施個性化學習路徑推薦</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
