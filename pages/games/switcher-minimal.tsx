import React from 'react';
import Head from 'next/head';
import GameSwitcherMinimal from '../../components/games/GameSwitcherMinimal';

const SwitcherMinimalPage: React.FC = () => {
  return (
    <>
      <Head>
        <title>Shimozurdo 雲朵遊戲 - EduCreate</title>
        <meta name="description" content="飛機穿越雲朵的動態反應遊戲，基於記憶科學的英語詞彙學習" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{ margin: 0, padding: 0, height: '100vh', overflow: 'hidden' }}>
        <GameSwitcherMinimal defaultGame="shimozurdo-game" />
      </div>

      <style jsx global>{`
        html, body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
      `}</style>
    </>
  );
};

export default SwitcherMinimalPage;
