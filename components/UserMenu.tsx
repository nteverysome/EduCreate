import { Fragment } from 'react';
import Image from 'next/image';
import { Menu, Transition } from '@headlessui/react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePermission } from '../hooks/usePermission';

export default function UserMenu() {
  const { data: session } = useSession();
  const { isAdmin } = usePermission();

  if (!session) {
    return (
      <div className="flex space-x-4">
        <Link href="/login" className="text-gray-700 hover:text-gray-900">
          登入
        </Link>
        <Link href="/register" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          註冊
        </Link>
      </div>
    );
  }

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="flex items-center space-x-2">
          <span className="hidden md:block">{session.user.name}</span>
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name || '用戶頭像'}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-gray-600">
                {session.user.name?.charAt(0) || session.user.email?.charAt(0) || 'U'}
              </span>
            </div>
          )}
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-1 py-1">
            <Menu.Item>
              {({ active }) => (
                <Link href="/profile"
                  className={`${
                    active ? 'bg-blue-500 text-white' : 'text-gray-900'
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                >
                  個人資料
                </Link>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <Link href="/dashboard"
                  className={`${
                    active ? 'bg-blue-500 text-white' : 'text-gray-900'
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                >
                  儀表板
                </Link>
              )}
            </Menu.Item>
          </div>

          {isAdmin && (
            <div className="px-1 py-1">
              <Menu.Item>
                {({ active }) => (
                  <Link href="/admin/users"
                    className={`${
                      active ? 'bg-blue-500 text-white' : 'text-gray-900'
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                  >
                    用戶管理
                  </Link>
                )}
              </Menu.Item>
            </div>
          )}

          <div className="px-1 py-1">
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className={`${
                    active ? 'bg-red-500 text-white' : 'text-gray-900'
                  } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                >
                  登出
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}