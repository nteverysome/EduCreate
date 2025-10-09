import React from 'react';
import WordwallStyleMyActivities from '@/components/activities/WordwallStyleMyActivities';

export default function WordwallActivitiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <WordwallStyleMyActivities userId="demo-user" />
    </div>
  );
}

export const metadata = {
  title: 'Wordwall 風格活動管理 - EduCreate',
  description: '完全模仿 Wordwall 的活動管理界面，提供資料夾管理、搜索篩選和活動組織功能。',
};
