import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { PERMISSIONS } from '../../lib/permissions';

interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  templates: Template[];
}

interface Template {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  type: 'matching' | 'flashcards' | 'quiz';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

export default function TemplatesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 模板類別
  const templateCategories: TemplateCategory[] = [
    {
      id: 'language',
      name: '語言學習',
      description: '適合語言教學的模板',
      templates: [
        {
          id: 'vocab-matching',
          name: '詞彙配對',
          description: '單詞與定義配對練習',
          thumbnail: '/templates/vocab-matching.svg',
          type: 'matching',
          difficulty: 'beginner',
          tags: ['語言', '詞彙']
        },
        {
          id: 'language-flashcards',
          name: '語言學習卡片',
          description: '雙語詞彙學習卡片',
          thumbnail: '/templates/language-flashcards.svg',
          type: 'flashcards',
          difficulty: 'beginner',
          tags: ['語言', '詞彙']
        },
        {
          id: 'grammar-quiz',
          name: '語法測驗',
          description: '語法規則測驗問答',
          thumbnail: '/templates/grammar-quiz.svg',
          type: 'quiz',
          difficulty: 'intermediate',
          tags: ['語言', '語法']
        }
      ]
    },
    {
      id: 'math',
      name: '數學',
      description: '適合數學教學的模板',
      templates: [
        {
          id: 'math-concepts',
          name: '數學概念配對',
          description: '數學術語與定義配對',
          thumbnail: '/templates/math-concepts.svg',
          type: 'matching',
          difficulty: 'intermediate',
          tags: ['數學', '概念']
        },
        {
          id: 'math-formulas',
          name: '數學公式卡片',
          description: '數學公式學習卡片',
          thumbnail: '/templates/math-formulas.svg',
          type: 'flashcards',
          difficulty: 'advanced',
          tags: ['數學', '公式']
        },
        {
          id: 'math-problems',
          name: '數學問題測驗',
          description: '數學解題能力測驗',
          thumbnail: '/templates/math-problems.svg',
          type: 'quiz',
          difficulty: 'advanced',
          tags: ['數學', '問題解決']
        }
      ]
    },
    {
      id: 'science',
      name: '科學',
      description: '適合科學教學的模板',
      templates: [
        {
          id: 'science-terms',
          name: '科學術語配對',
          description: '科學術語與定義配對',
          thumbnail: '/templates/science-terms.svg',
          type: 'matching',
          difficulty: 'intermediate',
          tags: ['科學', '術語']
        },
        {
          id: 'science-concepts',
          name: '科學概念卡片',
          description: '科學概念學習卡片',
          thumbnail: '/templates/science-concepts.svg',
          type: 'flashcards',
          difficulty: 'intermediate',
          tags: ['科學', '概念']
        },
        {
          id: 'science-quiz',
          name: '科學知識測驗',
          description: '科學知識測驗問答',
          thumbnail: '/templates/science-quiz.svg',
          type: 'quiz',
          difficulty: 'intermediate',
          tags: ['科學', '知識']
        }
      ]
    }
  ];

  // 獲取所有模板
  const allTemplates = templateCategories.flatMap(category => category.templates);

  // 根據類別和搜索過濾模板
  const filteredTemplates = allTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'all' || 
      templateCategories.find(c => c.id === selectedCategory)?.templates.includes(template);
    
    const matchesSearch = searchQuery === '' || 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  // 處理模板選擇
  const handleSelectTemplate = (templateId: string, templateType: string) => {
    router.push(`/create?template=${templateType}&templateId=${templateId}`);
  };

  return (
    <ProtectedRoute requiredPermission={PERMISSIONS.READ_TEMPLATE}>
      <div className="min-h-screen bg-gray-50">
        <Head>
          <title>模板庫 | EduCreate</title>
          <meta name="description" content="瀏覽和選擇教學活動模板" />
        </Head>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">模板庫</h1>
            <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800">
              返回儀表板
            </Link>
          </div>

          {/* 搜索和過濾 */}
          <div className="flex flex-col md:flex-row justify-between mb-8 space-y-4 md:space-y-0">
            <div className="flex space-x-4">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg ${selectedCategory === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
              >
                全部
              </button>
              {templateCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-lg ${selectedCategory === category.id ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                >
                  {category.name}
                </button>
              ))}
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="搜索模板..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
              <svg
                className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* 模板網格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map(template => (
              <div
                key={template.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <img
                    src={template.thumbnail}
                    alt={template.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `/templates/placeholder.svg`;
                    }}
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{template.name}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      template.type === 'matching' ? 'bg-blue-100 text-blue-800' :
                      template.type === 'flashcards' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {template.type === 'matching' ? '配對' :
                       template.type === 'flashcards' ? '卡片' :
                       '測驗'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{template.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {template.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      template.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                      template.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {template.difficulty === 'beginner' ? '初級' :
                       template.difficulty === 'intermediate' ? '中級' :
                       '高級'}
                    </span>
                  </div>
                  <button
                    onClick={() => handleSelectTemplate(template.id, template.type)}
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
                  >
                    使用此模板
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="mt-2 text-lg font-medium text-gray-900">沒有找到模板</h3>
              <p className="mt-1 text-gray-500">嘗試更改搜索條件或選擇不同的類別</p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}