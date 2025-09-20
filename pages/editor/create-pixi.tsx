import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import Script from 'next/script';
import { PlusIcon, TrashIcon, DocumentArrowDownIcon as SaveIcon, EyeIcon, PencilIcon } from '@heroicons/react/24/outline';
import PixiGame from '../../components/PixiGame';
import ProtectedRoute from '../../components/ProtectedRoute';
import { PERMISSIONS } from '../../lib/permissions';
import { toast } from 'react-hot-toast';

interface GameItem {
  id: string;
  text: string;
  x?: number;
  y?: number;
  color?: number;
}

export default function CreatePixiGame() {
  const router = useRouter();
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const status = sessionResult?.status;
  const { id } = router.query; // 如果是編輯現有遊戲
  
  const [gameTitle, setGameTitle] = useState('');
  const [gameDescription, setGameDescription] = useState('');
  const [gameItems, setGameItems] = useState<GameItem[]>([]);
  const [newItemText, setNewItemText] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  // 檢查用戶是否已登入
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=' + encodeURIComponent(router.asPath));
    }
  }, [status, router]);

  // 如果是編輯模式，加載現有遊戲數據
  useEffect(() => {
    if (id && typeof id === 'string') {
      // 這裡應該從 API 加載遊戲數據
      const loadGameData = async () => {
        try {
          // 模擬 API 調用
          // const response = await fetch(`/api/pixi-games/${id}`);
          // const data = await response.json();
          
          // 模擬數據
          const mockData = {
            title: '示例 PixiJS 遊戲',
            description: '這是一個使用 PixiJS 創建的互動式遊戲',
            items: [
              { id: '1', text: '拖動我！', color: 0x3498db },
              { id: '2', text: '放到這裡', color: 0xe74c3c },
              { id: '3', text: '配對元素', color: 0x2ecc71 }
            ]
          };
          
          setGameTitle(mockData.title);
          setGameDescription(mockData.description);
          setGameItems(mockData.items);
        } catch (error) {
          console.error('加載遊戲數據失敗:', error);
          toast.error('加載遊戲數據失敗');
        }
      };
      
      loadGameData();
    }
  }, [id]);

  // 添加新遊戲項目
  const addGameItem = () => {
    if (!newItemText.trim()) {
      toast.error('請輸入項目文本');
      return;
    }
    
    const newItem: GameItem = {
      id: Date.now().toString(),
      text: newItemText,
      color: Math.floor(Math.random() * 0xFFFFFF) // 隨機顏色
    };
    
    setGameItems([...gameItems, newItem]);
    setNewItemText('');
    toast.success('已添加新項目');
  };

  // 刪除遊戲項目
  const deleteGameItem = (id: string) => {
    setGameItems(gameItems.filter(item => item.id !== id));
    if (selectedItemId === id) {
      setSelectedItemId(null);
    }
    toast.success('已刪除項目');
  };

  // 選擇項目進行編輯
  const selectItem = (id: string) => {
    setSelectedItemId(id);
    const item = gameItems.find(item => item.id === id);
    if (item) {
      setNewItemText(item.text);
    }
  };

  // 更新選中的項目
  const updateSelectedItem = () => {
    if (!selectedItemId || !newItemText.trim()) return;
    
    setGameItems(gameItems.map(item => 
      item.id === selectedItemId 
        ? { ...item, text: newItemText }
        : item
    ));
    
    setNewItemText('');
    setSelectedItemId(null);
    toast.success('已更新項目');
  };

  // 保存遊戲
  const saveGame = async () => {
    if (!gameTitle.trim()) {
      toast.error('請輸入遊戲標題');
      return;
    }
    
    setIsSaving(true);
    
    try {
      // 構建遊戲數據
      const gameData = {
        title: gameTitle,
        description: gameDescription,
        type: 'pixi',
        items: gameItems,
        // 其他元數據
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // 這裡應該調用 API 保存遊戲數據
      // const response = await fetch('/api/pixi-games', {
      //   method: id ? 'PUT' : 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(gameData)
      // });
      
      // 模擬 API 調用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success(`遊戲已${id ? '更新' : '創建'}`);
      
      // 導航到遊戲列表或預覽頁面
      router.push('/dashboard');
    } catch (error) {
      console.error('保存遊戲失敗:', error);
      toast.error('保存遊戲失敗');
    } finally {
      setIsSaving(false);
    }
  };

  // 處理遊戲完成事件
  const handleGameComplete = (score: number, total: number) => {
    console.log(`遊戲完成！得分: ${score}/${total}`);
    toast.success(`遊戲完成！得分: ${score}/${total}`);
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute permission={PERMISSIONS.CREATE_ACTIVITY}>
      <Head>
        <title>{id ? '編輯 PixiJS 遊戲' : '創建 PixiJS 遊戲'} | EduCreate</title>
        <meta name="description" content="使用 PixiJS 創建互動式教學遊戲" />
      </Head>

      <Script
        src="https://cdn.jsdelivr.net/npm/pixi.js@7.3.2/dist/pixi.min.js"
        strategy="beforeInteractive"
      />

      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">{id ? '編輯 PixiJS 遊戲' : '創建 PixiJS 遊戲'}</h1>
          
          <div className="flex space-x-4">
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <EyeIcon className="w-5 h-5 mr-2" />
              {isPreviewMode ? '返回編輯' : '預覽遊戲'}
            </button>
            
            <button
              onClick={saveGame}
              disabled={isSaving}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              <SaveIcon className="w-5 h-5 mr-2" />
              {isSaving ? '保存中...' : '保存遊戲'}
            </button>
          </div>
        </div>

        {isPreviewMode ? (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">{gameTitle || '未命名遊戲'}</h2>
            <p className="text-gray-600 mb-6">{gameDescription || '無描述'}</p>
            
            <div className="flex justify-center">
              <PixiGame
                gameData={{ items: gameItems }}
                onComplete={handleGameComplete}
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h2 className="text-xl font-bold mb-4">遊戲設置</h2>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2" htmlFor="gameTitle">
                    遊戲標題 <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="gameTitle"
                    type="text"
                    value={gameTitle}
                    onChange={(e) => setGameTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="輸入遊戲標題"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2" htmlFor="gameDescription">
                    遊戲描述
                  </label>
                  <textarea
                    id="gameDescription"
                    value={gameDescription}
                    onChange={(e) => setGameDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="輸入遊戲描述"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">遊戲預覽</h2>
                <div className="flex justify-center">
                  <PixiGame
                    gameData={{ items: gameItems }}
                    onComplete={handleGameComplete}
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 h-fit">
              <h2 className="text-xl font-bold mb-4">遊戲項目</h2>
              
              <div className="mb-6">
                <div className="flex">
                  <input
                    type="text"
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    className="flex-grow px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="輸入項目文本"
                  />
                  {selectedItemId ? (
                    <button
                      onClick={updateSelectedItem}
                      className="px-4 py-2 bg-green-600 text-white rounded-r-lg hover:bg-green-700 transition-colors"
                    >
                      <PencilIcon className="w-5 h-5" />
                    </button>
                  ) : (
                    <button
                      onClick={addGameItem}
                      className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 transition-colors"
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
                {selectedItemId && (
                  <button
                    onClick={() => {
                      setSelectedItemId(null);
                      setNewItemText('');
                    }}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    取消編輯
                  </button>
                )}
              </div>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {gameItems.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">尚未添加任何項目</p>
                ) : (
                  gameItems.map((item) => (
                    <div 
                      key={item.id}
                      className={`flex items-center justify-between p-3 border rounded-lg ${selectedItemId === item.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
                    >
                      <div 
                        className="flex items-center flex-grow cursor-pointer"
                        onClick={() => selectItem(item.id)}
                      >
                        <div 
                          className="w-4 h-4 rounded-full mr-3"
                          style={{ backgroundColor: `#${item.color?.toString(16).padStart(6, '0')}` }}
                        />
                        <span>{item.text}</span>
                      </div>
                      <button
                        onClick={() => deleteGameItem(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}