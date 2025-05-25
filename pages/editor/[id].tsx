import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { useEffect } from 'react';
import ActivityEditor from '../../components/editor/ActivityEditor';
import ProtectedRoute from '../../components/ProtectedRoute';
import { PERMISSIONS } from '../../lib/permissions';

export default function EditActivityPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { id } = router.query;

  // 檢查用戶是否已登入
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=' + encodeURIComponent(router.asPath));
    }
  }, [status, router]);

  // 檢查ID是否存在
  useEffect(() => {
    if (status === 'authenticated' && !id) {
      router.push('/dashboard');
    }
  }, [id, status, router]);

  if (status === 'loading' || !id) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute permission={PERMISSIONS.EDIT_ACTIVITY}>
      <Head>
        <title>編輯活動 | EduCreate</title>
        <meta name="description" content="使用EduCreate的拖放式編輯器編輯互動式教學活動" />
      </Head>

      <ActivityEditor activityId={id as string} />
    </ProtectedRoute>
  );
}