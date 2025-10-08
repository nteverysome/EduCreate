'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { Toaster } from 'react-hot-toast';
import VocabularyManager from '@/components/vocabulary/VocabularyManager';
import UnifiedNavigation from '@/components/navigation/UnifiedNavigation';

export default function VocabularyPage() {
  return (
    <SessionProvider>
      <div className="min-h-screen bg-gray-50">
        <UnifiedNavigation variant="header" />
        
        <main>
          <VocabularyManager />
        </main>
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#4ade80',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </SessionProvider>
  );
}
