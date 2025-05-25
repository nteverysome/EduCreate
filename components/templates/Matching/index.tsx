import { useState } from 'react';
import { useRouter } from 'next/router';
import MatchingGame from '../../games/MatchingGame';
import TemplateConfig from '../TemplateConfig';

interface MatchingTemplateProps {
  mode?: 'preview' | 'edit' | 'play';
  data?: any;
  onSave?: (data: any) => void;
}

export default function MatchingTemplate({ mode = 'preview', data, onSave }: MatchingTemplateProps) {
  const router = useRouter();
  const [templateData, setTemplateData] = useState(data || {
    questions: [],
    answers: [],
    title: '配對遊戲',
    description: '將問題與正確答案配對',
    timeLimit: 0,
    shuffleItems: true
  });

  // 處理配置完成
  const handleConfigComplete = (configData: any) => {
    const newData = {
      ...templateData,
      ...configData,
      questions: configData.pairs.map((pair: any, index: number) => ({
        id: `q-${index}`,
        content: pair.question
      })),
      answers: configData.pairs.map((pair: any, index: number) => ({
        id: `a-${index}`,
        content: pair.answer
      }))
    };
    
    setTemplateData(newData);
    
    if (onSave) {
      onSave(newData);
    }
  };

  // 處理遊戲完成
  const handleGameComplete = (score: number, totalPairs: number) => {
    console.log(`遊戲完成！得分: ${score}/${totalPairs}`);
  };

  // 根據模式渲染不同內容
  if (mode === 'edit') {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">配置配對遊戲</h2>
        <TemplateConfig 
          templateId="matching-game" 
          templateType="matching" 
          onConfigComplete={handleConfigComplete} 
        />
      </div>
    );
  }

  // 預覽或遊玩模式
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-2">{templateData.title}</h2>
      <p className="text-gray-600 mb-4">{templateData.description}</p>
      
      {templateData.questions.length > 0 && templateData.answers.length > 0 ? (
        <MatchingGame 
          items={{
            questions: templateData.questions,
            answers: templateData.answers
          }}
          onComplete={handleGameComplete}
        />
      ) : (
        <div className="p-8 bg-gray-100 rounded-lg text-center">
          <p className="text-gray-500">請先配置配對項目</p>
        </div>
      )}
    </div>
  );
}