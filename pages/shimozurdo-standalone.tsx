import React from 'react';
import Head from 'next/head';

const ShimozurdoStandalone: React.FC = () => {
  return (
    <>
      <Head>
        <title>Shimozurdo 雲朵遊戲 - EduCreate</title>
        <meta name="description" content="飛機穿越雲朵的動態反應遊戲，基於記憶科學的英語詞彙學習" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div style={{ 
        width: '100vw', 
        height: '100vh', 
        margin: 0, 
        padding: 0,
        overflow: 'hidden',
        backgroundColor: '#000'
      }}>
        <iframe
          src="/games/shimozurdo-game/"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            margin: 0,
            padding: 0
          }}
          title="Shimozurdo 雲朵遊戲"
          allowFullScreen
        />
      </div>

      <style jsx global>{`
        html, body {
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
      `}</style>
    </>
  );
};

export default ShimozurdoStandalone;
