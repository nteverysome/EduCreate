import { useState } from 'react';
import { useRouter } from 'next/router';
import FlashcardGame from '../../games/FlashcardGame';
import TemplateConfig from '../TemplateConfig';

interface FlashcardTemplateProps {
  mode?: 'preview' | 'edit' | 'play';
  data?: any;
  onSave?: (data: any) => void;
}

export default function FlashcardTemplate({ mode = 'preview', data, onSave }: FlashcardTemplateProps) {
  const router = useRouter();
  const [templateData, setTemplateData] = useState(data || {
    cards: [],
    title: '單字卡片',
    description: '學習和記憶單字卡片',
    showProgress: true,
    allowShuffle: true
  });

  // 處理配置完成
  const handleConfigComplete = (configData: any) => {
    const newData = {
      ...templateData,
      ...configData,
      cards: configData.cards.map((card: any, index: number) => ({
        id: `card-${index}`,
        front: card.front,
        back: card.back,
        tags: card.tags?.split(',').map((tag: string) => tag.trim()).filter(Boolean) || []
      }))
    };
    
    setTemplateData(newData);
    
    if (onSave) {
      onSave(newData);
    }
  };

  // 處理遊戲完成
  const handleGameComplete = () => {
    console.log('卡片學習完成！');
  };

  // 根據模式渲染不同內容
  if (mode === 'edit') {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">配置單字卡片</h2>
        <TemplateConfig 
          templateId="flashcard-game" 
          templateType="flashcards" 
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
      
      {templateData.cards.length > 0 ? (
        <FlashcardGame 
          cards={templateData.cards}
          onComplete={handleGameComplete}
          showProgress={templateData.showProgress}
        />
      ) : (
        <div className="p-8 bg-gray-100 rounded-lg text-center">
          <p className="text-gray-500">請先配置卡片內容</p>
        </div>
      )}
    </div>
  );
}