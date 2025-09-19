import React, { useState } from 'react';

interface GameConfig {
  id: string;
  name: string;
  displayName: string;
  description: string;
  type: 'iframe';
  url: string;
  icon: string;
}

interface GameSwitcherMinimalProps {
  defaultGame?: string;
}

const GAMES_CONFIG: GameConfig[] = [
  {
    id: 'shimozurdo-game',
    name: 'shimozurdo',
    displayName: 'Shimozurdo 雲朵遊戲',
    description: '飛機穿越雲朵的動態反應遊戲，基於記憶科學的英語詞彙學習',
    type: 'iframe',
    url: '/games/shimozurdo-game/',
    icon: '☁️'
  }
];

const GameSwitcherMinimal: React.FC<GameSwitcherMinimalProps> = ({
  defaultGame = 'shimozurdo-game'
}) => {
  const [currentGame, setCurrentGame] = useState(defaultGame);
  
  const selectedGame = GAMES_CONFIG.find(game => game.id === currentGame) || GAMES_CONFIG[0];

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* 簡單的遊戲標題 */}
      <div style={{ 
        padding: '10px', 
        backgroundColor: '#1f2937', 
        color: 'white', 
        textAlign: 'center',
        fontSize: '18px',
        fontWeight: 'bold'
      }}>
        {selectedGame.icon} {selectedGame.displayName}
      </div>

      {/* 遊戲 iframe */}
      <div style={{ flex: 1, position: 'relative' }}>
        <iframe
          key={selectedGame.id}
          src={selectedGame.url}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            backgroundColor: '#000'
          }}
          title={selectedGame.displayName}
          allowFullScreen
        />
      </div>
    </div>
  );
};

export default GameSwitcherMinimal;
