import { useState } from 'react';
import Head from 'next/head';

export default function SentryExamplePage() {
  const [error, setError] = useState<string>('');

  const triggerError = () => {
    try {
      // This will trigger a Sentry error
      (window as any).myUndefinedFunction();
    } catch (err) {
      setError('Error triggered! Check your Sentry dashboard.');
      console.error('Sentry test error:', err);
    }
  };

  const triggerAsyncError = async () => {
    try {
      // This will trigger an async error
      await new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('Async test error for Sentry'));
        }, 1000);
      });
    } catch (err) {
      setError('Async error triggered! Check your Sentry dashboard.');
      console.error('Sentry async test error:', err);
    }
  };

  return (
    <>
      <Head>
        <title>Sentry Test Page - EduCreate</title>
        <meta name="description" content="Test page for Sentry error monitoring" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              🔍 Sentry Test Page
            </h1>
            
            <div className="space-y-4">
              <button
                onClick={triggerError}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
              >
                Trigger Test Error
              </button>
              
              <button
                onClick={triggerAsyncError}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
              >
                Trigger Async Error
              </button>
              
              {error && (
                <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  <p className="text-sm">{error}</p>
                </div>
              )}
              
              <div className="mt-8 text-sm text-gray-600">
                <p>
                  Click the buttons above to test Sentry error monitoring.
                  Errors will be captured and sent to your Sentry dashboard.
                </p>
              </div>
              
              <div className="mt-4">
                <a
                  href="/"
                  className="text-blue-600 hover:text-blue-800 underline"
                >
                  ← Back to Home
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
