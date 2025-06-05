import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { PrismaClient } from '@prisma/client';
import { GetServerSideProps } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../lib/auth';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
}

interface UsersPageProps {
  users: User[];
}

export default function UsersPage({ users: initialUsers }: UsersPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 如果用戶未登入或不是管理員，重定向到首頁
  useEffect(() => {
    if (status === 'unauthenticated' || (session?.user?.role !== 'ADMIN')) {
      router.push('/');
    }
  }, [status, session, router]);

  // 處理角色更改
  const handleRoleChange = async () => {
    if (!selectedUser || !selectedRole) return;

    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/admin/users/role', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUser,
          role: selectedRole,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '更新角色失敗');
      }

      const data = await response.json();
      
      // 更新本地用戶列表
      setUsers(users.map(user => 
        user.id === selectedUser ? { ...user, role: selectedRole } : user
      ));

      setMessage(`已成功將用戶角色更新為 ${selectedRole}`);
      setIsModalOpen(false);
    } catch (err: any) {
      // 確保錯誤訊息是字串格式
      let errorMessage = '載入用戶數據時發生錯誤';
      
      if (typeof err === 'string') {
        errorMessage = err;
      } else if (err && typeof err === 'object') {
        if (err.message && typeof err.message === 'string') {
          errorMessage = err.message;
        } else if (err.error && typeof err.error === 'string') {
          errorMessage = err.error;
        } else {
          errorMessage = '載入用戶數據失敗，請稍後再試';
        }
      }
      
      setError(errorMessage);
    }
  };

  // 打開角色更改模態框
  const openRoleModal = (userId: string, currentRole: string) => {
    setSelectedUser(userId);
    setSelectedRole(currentRole);
    setIsModalOpen(true);
  };

  // 顯示加載中狀態
  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">加載中...</div>;
  }

  // 角色顯示名稱映射
  const roleDisplayNames: { [key: string]: string } = {
    USER: '基本用戶',
    PREMIUM_USER: '高級用戶',
    TEACHER: '教師',
    ADMIN: '管理員',
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8">用戶管理</h1>

      {message && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {message}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                用戶名
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                電子郵件
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                角色
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                註冊日期
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'PREMIUM_USER' ? 'bg-green-100 text-green-800' :
                    user.role === 'TEACHER' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {roleDisplayNames[user.role] || user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => openRoleModal(user.id, user.role)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    更改角色
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 角色更改模態框 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">更改用戶角色</h2>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="role">
                選擇角色
              </label>
              <select
                id="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="USER">基本用戶</option>
                <option value="PREMIUM_USER">高級用戶</option>
                <option value="TEACHER">教師</option>
                <option value="ADMIN">管理員</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition"
              >
                取消
              </button>
              <button
                onClick={handleRoleChange}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
              >
                確認
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  // 檢查用戶是否為管理員
  if (!session || session.user.role !== 'ADMIN') {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const prisma = new PrismaClient();
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  await prisma.$disconnect();

  return {
    props: {
      users: JSON.parse(JSON.stringify(users)),
    },
  };
};