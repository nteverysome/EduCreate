import { useEditorStore } from '../../store/editorStore';
import H5PElementPreview from './H5PElementPreview';
import MatchingGame from '../games/MatchingGame';
import FlashcardGame from '../games/FlashcardGame';
import QuizGame from '../games/QuizGame';
export default function EditorPreview() {
  const [currentActivity, generateGameData] = useEditorStore(state => [
    state.currentActivity,
    state.generateGameData
  ]);
  if (!currentActivity) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">沒有活動數據可預覽</p>
      </div>
    );
  }
  // 生成遊戲數據
  const gameData = generateGameData();
  if (!gameData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-100">
        <p className="text-gray-500">無法生成預覽數據</p>
      </div>
    );
  }
  // 渲染H5P元素
  const renderH5PElements = () => {
    if (!currentActivity.elements || !currentActivity.elements.length) return null;
    const h5pElements = currentActivity.elements.filter(el => el.type === 'h5p');
    if (!h5pElements.length) return null;
    return (
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-4">H5P互動內容</h3>
        {h5pElements.map(element => (
          <div key={element.id} className="mb-6">
            <H5PElementPreview element={element} />
          </div>
        ))}
      </div>
    );
  };
  // 根據活動類型渲染不同的遊戲組件
  const renderGameComponent = () => {
    switch (currentActivity.type) {
      case 'matching':
        return (
          <MatchingGame
            items={{
              questions: gameData.questions,
              answers: gameData.answers
            }}
          />
        );
      case 'flashcards':
        return <FlashcardGame cards={gameData.cards} />;
      case 'quiz':
        return <QuizGame questions={gameData.questions} />;
      default:
        return (
          <div className="text-center py-12">
            <p className="text-gray-500">不支持的活動類型</p>
          </div>
        );
    }
  };
  return (
    <div className="flex-1 bg-gray-100 p-6 overflow-auto">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentActivity.title}</h2>
        {currentActivity.description && (
          <p className="text-gray-600 mb-6">{currentActivity.description}</p>
        )}
        {renderH5PElements()}
        <div className="bg-gray-50 p-6 rounded-lg">
          {renderGameComponent()}
        </div>
      </div>
    </div>
  );
}
