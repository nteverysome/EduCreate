import { useState, useEffect } from 'react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';

interface MatchingItem {
  id: string;
  content: string;
  matched?: boolean;
  type: 'question' | 'answer';
  matchId: string;
}

interface MatchingGameProps {
  items: {
    questions: { id: string; content: string }[];
    answers: { id: string; content: string }[];
  };
  onComplete?: (score: number, totalPairs: number) => void;
}

// 可拖動的卡片組件
function DraggableCard({ item, isActive }: { item: MatchingItem; isActive: boolean }) {
  const { attributes, listeners, setNodeRef, transform } = useSortable({ id: item.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: 'transform 0.2s',
    backgroundColor: item.matched ? '#c6f6d5' : isActive ? '#e9d8fd' : 'white',
    borderColor: item.matched ? '#68d391' : isActive ? '#9f7aea' : '#e2e8f0',
  };

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className="p-4 border rounded-lg shadow-sm mb-3 cursor-move"
      style={style}
    >
      {item.content}
    </div>
  );
}

// 配對遊戲組件
export default function MatchingGame({ items, onComplete }: MatchingGameProps) {
  const [questions, setQuestions] = useState<MatchingItem[]>([]);
  const [answers, setAnswers] = useState<MatchingItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [gameComplete, setGameComplete] = useState(false);

  // 初始化遊戲
  useEffect(() => {
    if (items) {
      // 創建問題項目
      const questionItems = items.questions.map((q) => ({
        id: `q-${q.id}`,
        content: q.content,
        matched: false,
        type: 'question' as const,
        matchId: q.id,
      }));

      // 創建答案項目
      const answerItems = items.answers.map((a) => ({
        id: `a-${a.id}`,
        content: a.content,
        matched: false,
        type: 'answer' as const,
        matchId: a.id,
      }));

      // 隨機排序
      setQuestions(questionItems.sort(() => Math.random() - 0.5));
      setAnswers(answerItems.sort(() => Math.random() - 0.5));
    }
  }, [items]);

  // 處理拖動開始
  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  // 處理拖動結束
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeItem = [...questions, ...answers].find(item => item.id === active.id);
    const overItem = [...questions, ...answers].find(item => item.id === over.id);

    if (!activeItem || !overItem) return;

    // 檢查是否為問題和答案的配對
    if (activeItem.type !== overItem.type) {
      // 檢查配對是否正確
      if (activeItem.matchId === overItem.matchId) {
        // 更新問題狀態
        setQuestions(prev => 
          prev.map(q => 
            q.id === (activeItem.type === 'question' ? activeItem.id : overItem.id)
              ? { ...q, matched: true }
              : q
          )
        );

        // 更新答案狀態
        setAnswers(prev => 
          prev.map(a => 
            a.id === (activeItem.type === 'answer' ? activeItem.id : overItem.id)
              ? { ...a, matched: true }
              : a
          )
        );

        // 增加分數
        setScore(prev => prev + 1);
      }
    }
  };

  // 檢查遊戲是否完成
  useEffect(() => {
    if (questions.length > 0 && answers.length > 0) {
      const allMatched = questions.every(q => q.matched) && answers.every(a => a.matched);
      if (allMatched && !gameComplete) {
        setGameComplete(true);
        onComplete?.(score, questions.length);
      }
    }
  }, [questions, answers, score, gameComplete, onComplete]);

  // 點擊問題卡片
  const handleQuestionClick = (id: string) => {
    if (selectedQuestion === id) {
      setSelectedQuestion(null);
    } else {
      setSelectedQuestion(id);
    }
  };

  // 點擊答案卡片
  const handleAnswerClick = (id: string) => {
    if (selectedQuestion) {
      const question = questions.find(q => q.id === selectedQuestion);
      const answer = answers.find(a => a.id === id);

      if (question && answer && !question.matched && !answer.matched) {
        // 檢查配對是否正確
        if (question.matchId === answer.matchId) {
          // 更新問題狀態
          setQuestions(prev => 
            prev.map(q => 
              q.id === selectedQuestion
                ? { ...q, matched: true }
                : q
            )
          );

          // 更新答案狀態
          setAnswers(prev => 
            prev.map(a => 
              a.id === id
                ? { ...a, matched: true }
                : a
            )
          );

          // 增加分數
          setScore(prev => prev + 1);
        }

        // 重置選中的問題
        setSelectedQuestion(null);
      }
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-bold">配對遊戲</h2>
        <div className="text-indigo-600 font-medium">
          得分: {score} / {questions.length}
        </div>
      </div>

      <DndContext
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-3">問題</h3>
            <div>
              {questions.map((question) => (
                <div 
                  key={question.id} 
                  onClick={() => !question.matched && handleQuestionClick(question.id)}
                  className={`${selectedQuestion === question.id ? 'ring-2 ring-indigo-500' : ''}`}
                >
                  <DraggableCard 
                    item={question} 
                    isActive={activeId === question.id || selectedQuestion === question.id} 
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-medium mb-3">答案</h3>
            <div>
              {answers.map((answer) => (
                <div 
                  key={answer.id} 
                  onClick={() => !answer.matched && handleAnswerClick(answer.id)}
                >
                  <DraggableCard 
                    item={answer} 
                    isActive={activeId === answer.id} 
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </DndContext>

      {gameComplete && (
        <div className="mt-6 p-4 bg-green-100 text-green-800 rounded-lg text-center">
          <p className="text-lg font-medium">恭喜！您已完成所有配對</p>
          <p>最終得分: {score} / {questions.length}</p>
        </div>
      )}
    </div>
  );
}