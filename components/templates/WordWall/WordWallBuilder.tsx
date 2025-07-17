import React, { useState, useEffect } from 'react';
interface Word {
  id: string;
  word: string;
  definition: string;
}
interface WordWallBuilderProps {
  initialWords?: Word[];
  onWordsChange: (words: Word[]) => void;
  readOnly?: boolean;
}
export default function WordWallBuilder({
  initialWords,
  onWordsChange,
  readOnly = false
}: WordWallBuilderProps) {
  const [words, setWords] = useState<Word[]>(initialWords || []);
  const [newWord, setNewWord] = useState('');
  const [newDefinition, setNewDefinition] = useState('');
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  useEffect(() => {
    setWords(initialWords || []);
  }, [initialWords]);
  useEffect(() => {
    if (onWordsChange) {
      onWordsChange(words);
    }
  }, [words, onWordsChange]);
  const addWord = () => {
    if (newWord.trim() && newDefinition.trim()) {
      const newWordObj: Word = {
        id: Date.now().toString(),
        word: newWord.trim(),
        definition: newDefinition.trim()
      };
      setWords([...words, newWordObj]);
      setNewWord('');
      setNewDefinition('');
    }
  };
  const removeWord = (id: string) => {
    setWords(words.filter(word => word.id !== id));
    if (selectedWord === id) {
      setSelectedWord(null);
    }
  };
  const moveWordUp = (index: number) => {
    if (index > 0) {
      const newWords = [...words];
      [newWords[index], newWords[index - 1]] = [newWords[index - 1], newWords[index]];
      setWords(newWords);
    }
  };
  const moveWordDown = (index: number) => {
    if (index < words.length - 1) {
      const newWords = [...words];
      [newWords[index], newWords[index + 1]] = [newWords[index + 1], newWords[index]];
      setWords(newWords);
    }
  };
  const handleWordClick = (wordId: string) => {
    setSelectedWord(selectedWord === wordId ? null : wordId);
  };
  if (readOnly) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {words.map((word) => (
            <div
              key={word.id}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedWord === word.id
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-300 bg-white hover:border-gray-400 hover:shadow-sm'
              }`}
              onClick={() => handleWordClick(word.id)}
            >
              <div className="font-semibold text-lg text-gray-900 mb-2">
                {word.word}
              </div>
              {selectedWord === word.id && (
                <div className="text-sm text-gray-600 border-t pt-2">
                  {word.definition}
                </div>
              )}
            </div>
          ))}
        </div>
        {words.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            尚未添加任何單詞
          </div>
        )}
        {selectedWord && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              💡 點擊單詞卡片查看定義，再次點擊可隱藏定義
            </p>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* 添加新單詞 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-4">添加新單詞</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="word" className="block text-sm font-medium text-gray-700 mb-1">
              單詞
            </label>
            <input
              type="text"
              id="word"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="輸入單詞..."
            />
          </div>
          <div>
            <label htmlFor="definition" className="block text-sm font-medium text-gray-700 mb-1">
              定義
            </label>
            <input
              type="text"
              id="definition"
              value={newDefinition}
              onChange={(e) => setNewDefinition(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="輸入定義..."
              onKeyPress={(e) => e.key === 'Enter' && addWord()}
            />
          </div>
        </div>
        <button
          onClick={addWord}
          disabled={!newWord.trim() || !newDefinition.trim()}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          添加單詞
        </button>
      </div>
      {/* 單詞列表 */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          單詞列表 ({words.length} 個單詞)
        </h3>
        {words.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
            尚未添加任何單詞，請使用上方表單添加單詞
          </div>
        ) : (
          <div className="space-y-2">
            {words.map((word, index) => (
              <div
                key={word.id}
                className="p-4 bg-white border border-gray-300 rounded-lg shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => moveWordUp(index)}
                          disabled={index === 0}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          onClick={() => moveWordDown(index)}
                          disabled={index === words.length - 1}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{word.word}</div>
                        <div className="text-sm text-gray-600">{word.definition}</div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeWord(word.id)}
                    className="ml-4 text-red-500 hover:text-red-700 focus:outline-none"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {words.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            💡 提示：使用上下箭頭按鈕來重新排序單詞，在預覽模式下點擊單詞可以查看定義
          </p>
        </div>
      )}
    </div>
  );
}
