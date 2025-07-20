'use client';

import React from 'react';
import { ParallaxBackgroundDemo } from '@/components/games/ParallaxBackgroundDemo';
import UnifiedNavigation from '@/components/navigation/UnifiedNavigation';

export default function ParallaxBackgroundDemoPage() {
  return (
    <div className="min-h-screen">
      {/* 統一導航系統 */}
      <UnifiedNavigation variant="header" />
      
      {/* 視差背景演示 */}
      <ParallaxBackgroundDemo />
    </div>
  );
}
