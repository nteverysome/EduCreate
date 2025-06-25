import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserGroupIcon, 
  PlayIcon, 
  PauseIcon,
  ChatBubbleLeftIcon,
  CogIcon,
  ExitIcon,
  CheckCircleIcon,
  ClockIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { Button, Input } from '@/components/ui';
import { socketService, GameRoom as GameRoomType, Player, ChatMessage } from '@/services/socketService';
import { useAuth } from '@/store/authStore';

interface GameRoomProps {
  room: GameRoomType;
  onLeaveRoom: () => void;
  onGameStart?: () => void;
}

/**
 * 多人遊戲房間組件
 * 
 * 功能：
 * - 顯示房間信息和玩家列表
 * - 聊天功能
 * - 遊戲控制（開始、暫停等）
 * - 實時狀態更新
 */
export const GameRoom: React.FC<GameRoomProps> = ({
  room,
  onLeaveRoom,
  onGameStart,
}) => {
  const { user } = useAuth();
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const currentPlayer = room.players.find(p => p.id === user?.id);
  const isHost = currentPlayer?.isHost || false;
  const allPlayersReady = room.players.every(p => p.isReady);
  const canStartGame = isHost && room.players.length > 1 && allPlayersReady;

  // 設置 Socket 事件監聽
  useEffect(() => {
    socketService.setCallbacks({
      onPlayerJoined: (data) => {
        // 房間狀態會通過 props 更新
      },
      onPlayerLeft: (data) => {
        // 房間狀態會通過 props 更新
      },
      onPlayerReadyChanged: (data) => {
        // 房間狀態會通過 props 更新
      },
      onChatMessage: (data) => {
        setChatMessages(prev => [...prev, data]);
      },
      onGameStarting: (data) => {
        onGameStart?.();
      },
    });
  }, [onGameStart]);

  // 自動滾動聊天到底部
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleReadyToggle = () => {
    const newReadyState = !isReady;
    setIsReady(newReadyState);
    socketService.setPlayerReady(newReadyState);
  };

  const handleStartGame = () => {
    if (canStartGame) {
      socketService.startGame();
    }
  };

  const handleSendMessage = () => {
    if (chatInput.trim()) {
      socketService.sendChatMessage(chatInput);
      setChatInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getPlayerStatusIcon = (player: Player) => {
    if (player.isReady) {
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
    }
    return <ClockIcon className="h-5 w-5 text-gray-400" />;
  };

  const getGameStatusText = () => {
    switch (room.gameState.status) {
      case 'waiting':
        return '等待玩家準備';
      case 'starting':
        return '遊戲即將開始...';
      case 'playing':
        return '遊戲進行中';
      case 'paused':
        return '遊戲已暫停';
      case 'finished':
        return '遊戲已結束';
      default:
        return '未知狀態';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 房間標題 */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                遊戲房間 #{room.id}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <UserGroupIcon className="h-4 w-4 mr-1" />
                  {room.players.length} / {room.settings.maxPlayers} 玩家
                </span>
                <span className="flex items-center">
                  <TrophyIcon className="h-4 w-4 mr-1" />
                  {getGameStatusText()}
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowChat(!showChat)}
                className="relative"
              >
                <ChatBubbleLeftIcon className="h-4 w-4 mr-2" />
                聊天
                {chatMessages.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                )}
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={onLeaveRoom}
              >
                <ExitIcon className="h-4 w-4 mr-2" />
                離開房間
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 玩家列表 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                玩家列表
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <AnimatePresence>
                  {room.players.map((player) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        player.isReady 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold ${
                            player.isHost ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}>
                            {player.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {player.name}
                              {player.isHost && (
                                <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                  主持人
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              分數: {player.score}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {getPlayerStatusIcon(player)}
                          <span className="text-sm text-gray-600">
                            {player.isReady ? '已準備' : '未準備'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* 遊戲控制 */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {!isHost && (
                      <Button
                        variant={isReady ? "success" : "primary"}
                        onClick={handleReadyToggle}
                        disabled={room.gameState.status !== 'waiting'}
                      >
                        {isReady ? (
                          <>
                            <CheckCircleIcon className="h-4 w-4 mr-2" />
                            已準備
                          </>
                        ) : (
                          '準備'
                        )}
                      </Button>
                    )}
                  </div>

                  {isHost && (
                    <div className="flex items-center space-x-3">
                      {room.gameState.status === 'playing' && (
                        <Button
                          variant="warning"
                          onClick={() => socketService.pauseGame()}
                        >
                          <PauseIcon className="h-4 w-4 mr-2" />
                          暫停
                        </Button>
                      )}
                      
                      {room.gameState.status === 'waiting' && (
                        <Button
                          variant="primary"
                          onClick={handleStartGame}
                          disabled={!canStartGame}
                        >
                          <PlayIcon className="h-4 w-4 mr-2" />
                          開始遊戲
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {isHost && !canStartGame && room.gameState.status === 'waiting' && (
                  <div className="mt-3 text-sm text-gray-600">
                    {room.players.length < 2 
                      ? '至少需要 2 名玩家才能開始遊戲'
                      : '等待所有玩家準備完成'
                    }
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 聊天區域 */}
          <div className="lg:col-span-1">
            <AnimatePresence>
              {showChat && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-xl shadow-sm p-6"
                >
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    聊天室
                  </h2>
                  
                  {/* 聊天消息 */}
                  <div className="h-64 overflow-y-auto mb-4 space-y-2">
                    {chatMessages.map((message, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium text-gray-900">
                          {message.playerName}:
                        </span>
                        <span className="ml-2 text-gray-700">
                          {message.message}
                        </span>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>

                  {/* 聊天輸入 */}
                  <div className="flex space-x-2">
                    <Input
                      value={chatInput}
                      onChange={setChatInput}
                      onKeyPress={handleKeyPress}
                      placeholder="輸入消息..."
                      className="flex-1"
                    />
                    <Button
                      size="sm"
                      onClick={handleSendMessage}
                      disabled={!chatInput.trim()}
                    >
                      發送
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameRoom;
