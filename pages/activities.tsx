import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Activities() {
  const router = useRouter();

  // 重定向到專門的搜索頁面
  useEffect(() => {
    router.replace('/search');
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Head>
        <title>活動瀏覽 - EduCreate</title>
        <meta name="description" content="瀏覽所有教學活動" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p className="text-gray-600">正在重定向到搜索頁面...</p>
      </div>
    </div>
  );
}
