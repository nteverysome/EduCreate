import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { useEffect } from 'react';
import ImprovedActivityEditor from '../../components/editor/ImprovedActivityEditor';
import ProtectedRoute from '../../components/ProtectedRoute';
import { PERMISSIONS } from '../../lib/permissions';

export default function ImprovedEditorPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { id, template, type } = router.query;

  // 檢查用戶是否已登入
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=' + encodeURIComponent(router.asPath));
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <ProtectedRoute permission={PERMISSIONS.CREATE_ACTIVITY}>
      <Head>
        <title>{id ? '編輯活動' : '創建新活動'} | EduCreate</title>
        <meta name="description" content="使用EduCreate的拖放式編輯器創建互動式教學活動" />
      </Head>

      <ImprovedActivityEditor
        activityId={id as string}
        templateId={template as string}
        templateType={type as 'matching' | 'flashcards' | 'quiz'}
      />
    </ProtectedRoute>
  );
}