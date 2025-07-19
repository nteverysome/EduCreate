'use client';

import React from 'react';
import MatchGame from '@/components/games/MatchGame';

export default function MatchGamePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-8">
      <div className="container mx-auto px-4">
        <MatchGame />
      </div>
    </div>
  );
}
