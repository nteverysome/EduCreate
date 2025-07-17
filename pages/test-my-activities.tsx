/**
 * test-my-activities.tsx - MyActivities 組件測試頁面
 * 用於 Day 1 回歸測試的專門測試頁面
 */

import React from 'react';
import { MyActivities } from '@/components/user/MyActivities';

export default function TestMyActivitiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            MyActivities 組件測試頁面
          </h1>
          <p className="text-gray-600">
            這是用於 Day 1 檔案空間系統回歸測試的專門頁面
          </p>
        </div>
        
        <MyActivities 
          userId="test-user-123"
          initialView="grid"
          showWelcome={true}
        />
      </div>
    </div>
  );
}
