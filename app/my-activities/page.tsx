/**
 * MyActivities 主頁面 - Wordwall 風格界面
 * 完全模仿 Wordwall 的活動管理界面
 */
'use client';

import React from 'react';
import UnifiedNavigation from '@/components/navigation/UnifiedNavigation';
import WordwallStyleMyActivities from '@/components/activities/WordwallStyleMyActivities';

export default function MyActivitiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <UnifiedNavigation />
      <WordwallStyleMyActivities userId="demo-user" />
    </div>
  );
}


