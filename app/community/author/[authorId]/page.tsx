'use client';

/**
 * 作者個人頁面
 * 
 * 顯示作者的個人信息和已發布的活動：
 * - 作者頭像、名稱、地區
 * - 個人簡介
 * - 社交媒體連結
 * - 統計數據（總活動數、總瀏覽、總喜歡、總收藏、總遊戲次數）
 * - 粉絲/關注功能
 * - 已發布的活動列表（網格布局）
 * - 排序功能（最新、熱門、瀏覽、遊戲次數）
 * - 分頁功能
 */

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import {
  User,
  MapPin,
  Calendar,
  Eye,
  Heart,
  Bookmark,
  Play,
  Users,
  ArrowLeft,
  Loader2,
  UserPlus,
  UserMinus,
  Globe,
  Twitter,
  Facebook,
  Linkedin,
  Folder,
  ChevronRight
} from 'lucide-react';
import CommunityActivityCard from '@/components/community/CommunityActivityCard';
import { FormattedCommunityActivity } from '@/lib/community/utils';

interface AuthorProfile {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  country: string | null;
  bio: string | null;
  socialLinks: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    website?: string;
  } | null;
  createdAt: string;
}

interface AuthorStats {
  totalActivities: number;
  totalViews: number;
  totalLikes: number;
  totalBookmarks: number;
  totalPlays: number;
  followersCount: number;
  followingCount: number;
}

interface FolderData {
  id: string;
  name: string;
  color: string | null;
  activityCount: number;
}

interface Breadcrumb {
  id: string;
  name: string;
}

interface CurrentFolder {
  id: string;
  name: string;
  color: string | null;
  parentId: string | null;
}

export default function AuthorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const authorId = params.authorId as string;

  const [author, setAuthor] = useState<AuthorProfile | null>(null);
  const [stats, setStats] = useState<AuthorStats | null>(null);
  const [activities, setActivities] = useState<FormattedCommunityActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'latest' | 'popular' | 'views' | 'plays'>('latest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // 資料夾相關狀態
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folders, setFolders] = useState<FolderData[]>([]);
  const [currentFolder, setCurrentFolder] = useState<CurrentFolder | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([]);

  // 從 URL 讀取 folderId
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const folderIdFromUrl = params.get('folderId');
    setCurrentFolderId(folderIdFromUrl);
  }, []);

  // 載入作者信息和活動
  useEffect(() => {
    loadAuthorData();
  }, [authorId, sortBy, page, currentFolderId]);

  // 檢查是否為作者本人
  useEffect(() => {
    if (session?.user && author) {
      setIsOwner(session.user.email === author.email);
    }
  }, [session, author]);

  const loadAuthorData = async () => {
    try {
      setLoading(true);
      setError(null);

      // 構建 URL 參數
      const params = new URLSearchParams({
        sortBy,
        page: page.toString(),
        limit: '12',
      });

      if (currentFolderId) {
        params.append('folderId', currentFolderId);
      }

      // 載入作者活動和統計數據
      const response = await fetch(
        `/api/community/authors/${authorId}/activities?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error('載入作者信息失敗');
      }

      const data = await response.json();

      setAuthor(data.author);
      setStats(data.stats);
      setActivities(data.activities);
      setFolders(data.folders || []);
      setCurrentFolder(data.currentFolder);
      setBreadcrumbs(data.breadcrumbs || []);
      setTotalPages(data.pagination.totalPages);

      // 如果已登入，檢查是否已關注
      if (session?.user) {
        checkFollowStatus();
      }
    } catch (err) {
      console.error('載入作者信息失敗:', err);
      setError(err instanceof Error ? err.message : '載入失敗');
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const response = await fetch(`/api/community/authors/${authorId}/follow-status`);
      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.isFollowing);
      }
    } catch (err) {
      console.error('檢查關注狀態失敗:', err);
    }
  };

  const handleFollow = async () => {
    if (!session?.user) {
      router.push('/login');
      return;
    }

    try {
      setIsFollowLoading(true);

      const response = await fetch(`/api/community/authors/${authorId}/follow`, {
        method: isFollowing ? 'DELETE' : 'POST',
      });

      if (!response.ok) {
        throw new Error('操作失敗');
      }

      setIsFollowing(!isFollowing);
      
      // 更新粉絲數量
      if (stats) {
        setStats({
          ...stats,
          followersCount: isFollowing ? stats.followersCount - 1 : stats.followersCount + 1,
        });
      }
    } catch (err) {
      console.error('關注操作失敗:', err);
      alert('操作失敗，請稍後再試');
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleSortChange = (newSortBy: typeof sortBy) => {
    setSortBy(newSortBy);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFolderClick = (folderId: string | null) => {
    setCurrentFolderId(folderId);
    setPage(1);

    // 更新 URL 查詢參數
    const params = new URLSearchParams(window.location.search);
    if (folderId) {
      params.set('folderId', folderId);
    } else {
      params.delete('folderId');
    }

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', newUrl);
  };

  const handleBackToParent = () => {
    if (currentFolder?.parentId) {
      handleFolderClick(currentFolder.parentId);
    } else {
      handleFolderClick(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  if (error || !author) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 font-medium">{error || '作者不存在'}</p>
            <Link
              href="/community"
              className="mt-4 inline-flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <ArrowLeft size={20} />
              返回社區
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* 返回按鈕 */}
        <Link
          href="/community"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          返回社區
        </Link>

        {/* 作者信息卡片 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* 頭像 */}
            <div className="flex-shrink-0">
              {author.image ? (
                <Image
                  src={author.image}
                  alt={author.name || '作者'}
                  width={120}
                  height={120}
                  className="rounded-full"
                />
              ) : (
                <div className="w-30 h-30 bg-gray-200 rounded-full flex items-center justify-center">
                  <User size={60} className="text-gray-400" />
                </div>
              )}
            </div>

            {/* 作者信息 */}
            <div className="flex-grow">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {author.name || '匿名用戶'}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-gray-600">
                    {author.country && (
                      <div className="flex items-center gap-1">
                        <MapPin size={16} />
                        <span>{author.country}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar size={16} />
                      <span>加入於 {new Date(author.createdAt).toLocaleDateString('zh-TW')}</span>
                    </div>
                  </div>
                </div>

                {/* 關注按鈕 */}
                {!isOwner && session?.user && (
                  <button
                    onClick={handleFollow}
                    disabled={isFollowLoading}
                    className={`flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                      isFollowing
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-blue-500 text-white hover:bg-blue-600'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isFollowLoading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : isFollowing ? (
                      <>
                        <UserMinus size={20} />
                        取消關注
                      </>
                    ) : (
                      <>
                        <UserPlus size={20} />
                        關注
                      </>
                    )}
                  </button>
                )}

                {/* 編輯按鈕（作者本人） */}
                {isOwner && (
                  <Link
                    href="/account/personal-details"
                    className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    編輯個人資料
                  </Link>
                )}
              </div>

              {/* 個人簡介 */}
              {author.bio && (
                <p className="text-gray-700 mb-4">{author.bio}</p>
              )}

              {/* 社交媒體連結 */}
              {author.socialLinks && Object.keys(author.socialLinks).length > 0 && (
                <div className="flex gap-3 mb-4">
                  {author.socialLinks.website && (
                    <a
                      href={author.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-blue-500 transition-colors"
                    >
                      <Globe size={24} />
                    </a>
                  )}
                  {author.socialLinks.twitter && (
                    <a
                      href={author.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-blue-400 transition-colors"
                    >
                      <Twitter size={24} />
                    </a>
                  )}
                  {author.socialLinks.facebook && (
                    <a
                      href={author.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Facebook size={24} />
                    </a>
                  )}
                  {author.socialLinks.linkedin && (
                    <a
                      href={author.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-blue-700 transition-colors"
                    >
                      <Linkedin size={24} />
                    </a>
                  )}
                </div>
              )}

              {/* 統計數據 */}
              {stats && (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalActivities}</div>
                    <div className="text-sm text-gray-600">活動</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.followersCount}</div>
                    <div className="text-sm text-gray-600">粉絲</div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.followingCount}</div>
                    <div className="text-sm text-gray-600">關注</div>
                  </div>
                  <div className="bg-indigo-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-indigo-600">{stats.totalViews.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">瀏覽</div>
                  </div>
                  <div className="bg-pink-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-pink-600">{stats.totalLikes.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">喜歡</div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-yellow-600">{stats.totalBookmarks.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">收藏</div>
                  </div>
                  <div className="bg-orange-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.totalPlays.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">遊戲</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 活動列表 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* 麵包屑導航 */}
          {breadcrumbs.length > 0 && (
            <div className="flex items-center gap-2 mb-6 text-sm">
              <button
                onClick={() => handleFolderClick(null)}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                {author.name || '作者'}
              </button>
              {breadcrumbs.map((crumb) => (
                <div key={crumb.id} className="flex items-center gap-2">
                  <ChevronRight size={16} className="text-gray-400" />
                  <button
                    onClick={() => handleFolderClick(crumb.id)}
                    className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    {crumb.name}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 排序選項 */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {currentFolder ? currentFolder.name : '已發布的活動'}
            </h2>
            <div className="flex gap-2">
              {(['latest', 'popular', 'views', 'plays'] as const).map((sort) => (
                <button
                  key={sort}
                  onClick={() => handleSortChange(sort)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    sortBy === sort
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {sort === 'latest' && '最新'}
                  {sort === 'popular' && '熱門'}
                  {sort === 'views' && '瀏覽'}
                  {sort === 'plays' && '遊戲'}
                </button>
              ))}
            </div>
          </div>

          {/* 活動網格 */}
          {folders.length === 0 && activities.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📭</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {currentFolder ? '此資料夾是空的' : '還沒有發布活動'}
              </h3>
              <p className="text-gray-600">
                {isOwner
                  ? currentFolder
                    ? '此資料夾中沒有已發布的活動'
                    : '開始創建並發布您的第一個活動吧！'
                  : currentFolder
                    ? '此資料夾中沒有已發布的活動'
                    : '這位作者還沒有發布任何活動'
                }
              </p>
            </div>
          ) : (
            <>
              {/* 資料夾區域 */}
              {(folders.length > 0 || currentFolderId) && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">資料夾</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {/* 返回上一層卡片 */}
                    {currentFolderId && (
                      <div
                        onClick={handleBackToParent}
                        className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-all duration-200 border-2 border-dashed border-gray-300 hover:border-gray-400 flex flex-col items-center justify-center aspect-square"
                      >
                        <ArrowLeft size={32} className="text-gray-400 mb-2" />
                        <span className="text-xs text-gray-600 font-medium text-center">返回上一層</span>
                      </div>
                    )}

                    {/* 資料夾卡片 */}
                    {folders.map((folder) => (
                      <div
                        key={folder.id}
                        onClick={() => handleFolderClick(folder.id)}
                        className="bg-white rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-md transition-all duration-200 border-2 border-transparent hover:border-purple-300 flex flex-col items-center justify-center aspect-square"
                      >
                        <Folder
                          size={40}
                          style={{ color: folder.color || '#8B5CF6' }}
                          className="mb-2"
                        />
                        <h3 className="font-semibold text-sm text-gray-900 truncate w-full text-center">
                          {folder.name}
                        </h3>
                        <p className="text-xs text-gray-600 mt-1">
                          {folder.activityCount} {folder.activityCount === 1 ? 'activity' : 'activities'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 活動區域 */}
              {activities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">活動</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {activities.map((activity) => (
                      <CommunityActivityCard key={activity.id} activity={activity} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* 分頁 */}
          {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page === 1}
                    className="px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    上一頁
                  </button>

                  <div className="flex gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-lg transition-colors ${
                            page === pageNum
                              ? 'bg-blue-500 text-white'
                              : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    下一頁
                  </button>
                </div>
              )}
        </div>
      </div>
    </div>
  );
}

