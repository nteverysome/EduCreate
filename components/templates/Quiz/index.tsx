import { useState } from 'react';
import { useRouter } from 'next/router';
import QuizGame from '../../games/QuizGame';
import TemplateConfig from '../TemplateConfig';

interface QuizTemplateProps {
  mode?: 'preview' | 'edit' | 'play';
  data?: any;
  onSave?: (data: any) => void;
}

const QuizTemplate = ({ mode = 'preview', data, onSave }: QuizTemplateProps) => {
  const router = useRouter();
  const [templateData, setTemplateData] = useState(data || {
    questions: [],
    title: '測驗問答',
    description: '回答問題測試你的知識',
    shuffleQuestions: true,
    shuffleOptions: true,
    showExplanation: true,
    timeLimit: 0
  });

  // 處理配置完成
  const handleConfigComplete = (configData: any) => {
    const newData = {
      ...templateData,
      ...configData,
      questions: configData.questions.map((q: any, index: number) => ({
        id: `quiz-${index}`,
        question: q.question,
        options: [
          q.correctOption,
          q.option1,
          q.option2,
          q.option3
        ].filter(Boolean),
        correctAnswer: 0, // 正確答案始終是第一個選項，但會在遊戲中被洗牌
        explanation: q.explanation || ''
      }))
    };
    
    setTemplateData(newData);
    
    if (onSave) {
      onSave(newData);
    }
  };

  // 處理遊戲完成
  const handleGameComplete = (score: number, total: number) => {
    console.log(`測驗完成！得分: ${score}/${total}`);
  };

  // 根據模式渲染不同內容
  if (mode === 'edit') {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">配置測驗問答</h2>
        <TemplateConfig 
          templateId="quiz-game" 
          templateType="quiz" 
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
      
      {templateData.questions.length > 0 ? (
        <QuizGame 
          questions={templateData.questions}
          shuffleQuestions={templateData.shuffleQuestions}
          shuffleOptions={templateData.shuffleOptions}
          showExplanation={templateData.showExplanation}
          onComplete={handleGameComplete}
        />
      ) : (
        <div className="p-8 bg-gray-100 rounded-lg text-center">
          <p className="text-gray-500">請先配置測驗問題</p>
        </div>
      )}
    </div>
  );
}

export default QuizTemplate;