import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

interface TemplateConfigProps {
  templateId: string;
  templateType: string;
  onConfigComplete: (configData: any) => void;
}

interface ConfigField {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'checkbox';
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: any;
  required?: boolean;
}

interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  fields: ConfigField[];
  defaultData: any;
}

const TemplateConfig = ({ templateId, templateType, onConfigComplete }: TemplateConfigProps) => {
  const router = useRouter();
  const [config, setConfig] = useState<TemplateConfig | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // 模擬從API獲取模板配置
  useEffect(() => {
    // 在實際應用中，這裡會從API獲取模板配置
    const getTemplateConfig = () => {
      setIsLoading(true);
      
      // 模擬API延遲
      setTimeout(() => {
        // 根據模板ID和類型獲取配置
        const templateConfig = getConfigByTemplateId(templateId, templateType);
        setConfig(templateConfig);
        
        // 設置默認值
        if (templateConfig) {
          setFormData(templateConfig.defaultData || {});
        }
        
        setIsLoading(false);
      }, 500);
    };
    
    getTemplateConfig();
  }, [templateId, templateType]);

  // 處理表單輸入變化
  const handleInputChange = (fieldId: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [fieldId]: value
    }));
    
    // 清除錯誤
    if (errors[fieldId]) {
      setErrors((prev: {[key: string]: string}) => {
        const newErrors = { ...prev };
        delete newErrors[fieldId];
        return newErrors;
      });
    }
  };

  // 驗證表單
  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    let isValid = true;
    
    if (!config) return false;
    
    config.fields.forEach(field => {
      if (field.required && (!formData[field.id] || formData[field.id].trim() === '')) {
        newErrors[field.id] = `${field.label}是必填項`;
        isValid = false;
      }
    });
    
    setErrors(newErrors);
    return isValid;
  };

  // 處理表單提交
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // 處理表單數據
      const processedData = processFormData(formData, templateType);
      onConfigComplete(processedData);
    }
  };

  // 處理表單數據
  const processFormData = (data: any, type: string) => {
    switch (type) {
      case 'matching':
        // 處理配對遊戲數據
        return processMatchingData(data);
      case 'flashcards':
        // 處理單字卡片數據
        return processFlashcardData(data);
      case 'quiz':
        // 處理測驗問答數據
        return processQuizData(data);
      default:
        return data;
    }
  };

  // 處理配對遊戲數據
  const processMatchingData = (data: any) => {
    // 解析項目對
    const pairs = data.pairs.split('\n')
      .filter((line: string) => line.trim() !== '')
      .map((line: string, index: number) => {
        const [question, answer] = line.split('|').map(item => item.trim());
        return {
          id: (index + 1).toString(),
          question: { id: (index + 1).toString(), content: question },
          answer: { id: (index + 1).toString(), content: answer }
        };
      });

    return {
      title: data.title,
      description: data.description,
      instructions: data.instructions,
      pairs: pairs,
      questions: pairs.map((p: any) => p.question),
      answers: pairs.map((p: any) => p.answer)
    };
  };

  // 處理單字卡片數據
  const processFlashcardData = (data: any) => {
    // 解析卡片
    const cards = data.cards.split('\n')
      .filter((line: string) => line.trim() !== '')
      .map((line: string, index: number) => {
        const [front, back, tags = ''] = line.split('|').map(item => item.trim());
        return {
          id: (index + 1).toString(),
          front,
          back,
          tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : []
        };
      });

    return {
      title: data.title,
      description: data.description,
      instructions: data.instructions,
      cards: cards
    };
  };

  // 處理測驗問答數據
  const processQuizData = (data: any) => {
    // 解析問題
    const questions = [];
    const lines = data.questions.split('\n').filter((line: string) => line.trim() !== '');
    
    for (let i = 0; i < lines.length;) {
      if (lines[i].startsWith('Q:')) {
        const question = lines[i].substring(2).trim();
        const options = [];
        let correctAnswer = 0;
        let explanation = '';
        
        i++;
        
        // 解析選項
        while (i < lines.length && lines[i].startsWith('O:')) {
          options.push(lines[i].substring(2).trim());
          i++;
        }
        
        // 解析正確答案
        if (i < lines.length && lines[i].startsWith('A:')) {
          correctAnswer = parseInt(lines[i].substring(2).trim()) - 1;
          i++;
        }
        
        // 解析解釋
        if (i < lines.length && lines[i].startsWith('E:')) {
          explanation = lines[i].substring(2).trim();
          i++;
        }
        
        questions.push({
          id: questions.length + 1,
          question,
          options,
          correctAnswer,
          explanation
        });
      } else {
        i++;
      }
    }

    return {
      title: data.title,
      description: data.description,
      instructions: data.instructions,
      questions: questions
    };
  };

  // 根據模板ID和類型獲取配置
  const getConfigByTemplateId = (id: string, type: string): TemplateConfig => {
    // 這裡應該從API獲取，現在使用模擬數據
    switch (type) {
      case 'matching':
        return {
          id,
          name: '配對遊戲模板',
          description: '創建配對練習，幫助學生建立概念聯繫',
          fields: [
            {
              id: 'title',
              label: '活動標題',
              type: 'text',
              placeholder: '例如：英語詞彙配對',
              required: true
            },
            {
              id: 'description',
              label: '活動描述',
              type: 'textarea',
              placeholder: '簡短描述這個活動的目的和內容',
              required: false
            },
            {
              id: 'instructions',
              label: '活動說明',
              type: 'textarea',
              placeholder: '給學生的活動指導說明',
              required: false
            },
            {
              id: 'pairs',
              label: '配對項目',
              type: 'textarea',
              placeholder: '每行輸入一對項目，使用 | 分隔左右兩側\n例如：\n蘋果 | Apple\n香蕉 | Banana',
              required: true
            }
          ],
          defaultData: {
            title: '',
            description: '',
            instructions: '將左側的項目與右側對應的項目配對。',
            pairs: '蘋果 | Apple\n香蕉 | Banana\n橙子 | Orange\n草莓 | Strawberry'
          }
        };
      
      case 'flashcards':
        return {
          id,
          name: '單字卡片模板',
          description: '製作互動式詞彙學習卡片',
          fields: [
            {
              id: 'title',
              label: '活動標題',
              type: 'text',
              placeholder: '例如：英語詞彙學習卡',
              required: true
            },
            {
              id: 'description',
              label: '活動描述',
              type: 'textarea',
              placeholder: '簡短描述這個活動的目的和內容',
              required: false
            },
            {
              id: 'instructions',
              label: '活動說明',
              type: 'textarea',
              placeholder: '給學生的活動指導說明',
              required: false
            },
            {
              id: 'cards',
              label: '卡片內容',
              type: 'textarea',
              placeholder: '每行輸入一張卡片，使用 | 分隔正面和背面，可選添加標籤\n例如：\n蘋果 | Apple | 水果\n香蕉 | Banana | 水果',
              required: true
            }
          ],
          defaultData: {
            title: '',
            description: '',
            instructions: '點擊卡片查看答案。記住後點擊「已記住」按鈕。',
            cards: '蘋果 | Apple | 水果\n香蕉 | Banana | 水果\n橙子 | Orange | 水果\n草莓 | Strawberry | 水果'
          }
        };
      
      case 'quiz':
        return {
          id,
          name: '測驗問答模板',
          description: '設計趣味測驗，檢驗學習成果',
          fields: [
            {
              id: 'title',
              label: '活動標題',
              type: 'text',
              placeholder: '例如：英語詞彙測驗',
              required: true
            },
            {
              id: 'description',
              label: '活動描述',
              type: 'textarea',
              placeholder: '簡短描述這個活動的目的和內容',
              required: false
            },
            {
              id: 'instructions',
              label: '活動說明',
              type: 'textarea',
              placeholder: '給學生的活動指導說明',
              required: false
            },
            {
              id: 'questions',
              label: '問題和選項',
              type: 'textarea',
              placeholder: '使用以下格式輸入問題和選項：\nQ: 問題文本\nO: 選項1\nO: 選項2\nO: 選項3\nO: 選項4\nA: 正確選項編號(1-4)\nE: 解釋(可選)\n\n例如：\nQ: 蘋果的英文是什麼？\nO: Apple\nO: Banana\nO: Orange\nO: Strawberry\nA: 1\nE: 蘋果的英文是Apple。',
              required: true
            }
          ],
          defaultData: {
            title: '',
            description: '',
            instructions: '選擇每個問題的正確答案。完成後查看您的得分。',
            questions: 'Q: 蘋果的英文是什麼？\nO: Apple\nO: Banana\nO: Orange\nO: Strawberry\nA: 1\nE: 蘋果的英文是Apple。\n\nQ: 香蕉的英文是什麼？\nO: Apple\nO: Banana\nO: Orange\nO: Strawberry\nA: 2\nE: 香蕉的英文是Banana。\n\nQ: 橙子的英文是什麼？\nO: Apple\nO: Banana\nO: Orange\nO: Strawberry\nA: 3\nE: 橙子的英文是Orange。'
          }
        };
      
      default:
        return {
          id: 'default',
          name: '默認模板',
          description: '基本模板配置',
          fields: [
            {
              id: 'title',
              label: '活動標題',
              type: 'text',
              placeholder: '輸入活動標題',
              required: true
            },
            {
              id: 'description',
              label: '活動描述',
              type: 'textarea',
              placeholder: '簡短描述這個活動的目的和內容',
              required: false
            }
          ],
          defaultData: {
            title: '',
            description: ''
          }
        };
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!config) {
    return (
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
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">找不到模板配置</h3>
        <p className="mt-1 text-gray-500">請選擇其他模板或聯繫管理員</p>
        <button
          onClick={() => router.push('/templates')}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          返回模板庫
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">{config.name}</h2>
      <p className="text-gray-600 mb-6">{config.description}</p>
      
      <form onSubmit={handleSubmit}>
        {config.fields.map(field => (
          <div key={field.id} className="mb-6">
            <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}{field.required && <span className="text-red-500">*</span>}
            </label>
            
            {field.type === 'text' && (
              <input
                type="text"
                id={field.id}
                value={formData[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className={`w-full px-3 py-2 border ${errors[field.id] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
              />
            )}
            
            {field.type === 'textarea' && (
              <textarea
                id={field.id}
                value={formData[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                rows={field.id === 'pairs' || field.id === 'cards' || field.id === 'questions' ? 10 : 4}
                className={`w-full px-3 py-2 border ${errors[field.id] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
              />
            )}
            
            {field.type === 'select' && (
              <select
                id={field.id}
                value={formData[field.id] || ''}
                onChange={(e) => handleInputChange(field.id, e.target.value)}
                className={`w-full px-3 py-2 border ${errors[field.id] ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
              >
                <option value="">請選擇</option>
                {field.options?.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
            
            {field.type === 'checkbox' && (
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={field.id}
                  checked={formData[field.id] || false}
                  onChange={(e) => handleInputChange(field.id, e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor={field.id} className="ml-2 block text-sm text-gray-900">
                  {field.placeholder}
                </label>
              </div>
            )}
            
            {errors[field.id] && (
              <p className="mt-1 text-sm text-red-600">{errors[field.id]}</p>
            )}
          </div>
        ))}
        
        <div className="flex justify-end space-x-4 mt-8">
          <button
            type="button"
            onClick={() => router.push('/templates')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            取消
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            下一步
          </button>
        </div>
      </form>
    </div>
  );
}

export default TemplateConfig;