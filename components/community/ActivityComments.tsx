'use client';

/**
 * 活動評論組件
 * 
 * 顯示和管理活動的評論：
 * - 評論列表
 * - 評論表單
 * - 回覆功能
 * - 分頁載入
 */

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { User, Send, Loader2, Trash2, MessageCircle } from 'lucide-react';

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  replies?: Comment[];
}

interface ActivityCommentsProps {
  activityId: string;
  initialCommentCount?: number;
}

export default function ActivityComments({ 
  activityId,
  initialCommentCount = 0,
}: ActivityCommentsProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalComments, setTotalComments] = useState(initialCommentCount);

  // 載入評論
  useEffect(() => {
    loadComments();
  }, [activityId, page]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/community/activities/${activityId}/comments?page=${page}&limit=20`
      );

      if (!response.ok) {
        throw new Error('載入評論失敗');
      }

      const data = await response.json();
      
      if (page === 1) {
        setComments(data.comments);
      } else {
        setComments(prev => [...prev, ...data.comments]);
      }

      setTotalComments(data.pagination.total);
      setHasMore(page < data.pagination.totalPages);
    } catch (error) {
      console.error('載入評論失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  // 提交評論
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      alert('請先登入');
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        `/api/community/activities/${activityId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: newComment.trim(),
          }),
        }
      );

      if (!response.ok) {
        throw new Error('發送評論失敗');
      }

      const data = await response.json();
      
      // 添加新評論到列表頂部
      setComments(prev => [data.comment, ...prev]);
      setTotalComments(prev => prev + 1);
      setNewComment('');
    } catch (error) {
      console.error('發送評論失敗:', error);
      alert('發送評論失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  // 提交回覆
  const handleSubmitReply = async (parentId: string) => {
    if (!session) {
      alert('請先登入');
      return;
    }

    if (!replyContent.trim()) {
      return;
    }

    try {
      setSubmitting(true);

      const response = await fetch(
        `/api/community/activities/${activityId}/comments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            content: replyContent.trim(),
            parentId,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('發送回覆失敗');
      }

      const data = await response.json();
      
      // 添加回覆到對應的評論
      setComments(prev =>
        prev.map(comment =>
          comment.id === parentId
            ? {
                ...comment,
                replies: [...(comment.replies || []), data.comment],
              }
            : comment
        )
      );

      setReplyContent('');
      setReplyingTo(null);
    } catch (error) {
      console.error('發送回覆失敗:', error);
      alert('發送回覆失敗，請稍後再試');
    } finally {
      setSubmitting(false);
    }
  };

  // 刪除評論
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('確定要刪除這條評論嗎？')) {
      return;
    }

    try {
      const response = await fetch(
        `/api/community/activities/${activityId}/comments/${commentId}`,
        {
          method: 'DELETE',
        }
      );

      if (!response.ok) {
        throw new Error('刪除評論失敗');
      }

      // 從列表中移除評論
      setComments(prev => prev.filter(c => c.id !== commentId));
      setTotalComments(prev => prev - 1);
    } catch (error) {
      console.error('刪除評論失敗:', error);
      alert('刪除評論失敗，請稍後再試');
    }
  };

  // 載入更多
  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <MessageCircle size={24} />
        評論 ({totalComments})
      </h3>

      {/* 評論表單 */}
      {session ? (
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="flex gap-3">
            {session.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || ''}
                width={40}
                height={40}
                className="rounded-full"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <User size={20} className="text-gray-500" />
              </div>
            )}
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="寫下你的評論..."
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={submitting}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>發送中...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>發送評論</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600">請先登入以發表評論</p>
        </div>
      )}

      {/* 評論列表 */}
      {loading && page === 1 ? (
        <div className="flex justify-center py-8">
          <Loader2 className="animate-spin text-blue-500" size={32} />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
          <p>還沒有評論，成為第一個評論的人吧！</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              activityId={activityId}
              currentUserId={session?.user?.email}
              onDelete={handleDeleteComment}
              onReply={(commentId) => setReplyingTo(commentId)}
              replyingTo={replyingTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              onSubmitReply={handleSubmitReply}
              submitting={submitting}
            />
          ))}
        </div>
      )}

      {/* 載入更多按鈕 */}
      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '載入中...' : '載入更多評論'}
          </button>
        </div>
      )}
    </div>
  );
}

// 評論項目組件
interface CommentItemProps {
  comment: Comment;
  activityId: string;
  currentUserId?: string;
  onDelete: (commentId: string) => void;
  onReply: (commentId: string) => void;
  replyingTo: string | null;
  replyContent: string;
  setReplyContent: (content: string) => void;
  onSubmitReply: (parentId: string) => void;
  submitting: boolean;
}

function CommentItem({
  comment,
  currentUserId,
  onDelete,
  onReply,
  replyingTo,
  replyContent,
  setReplyContent,
  onSubmitReply,
  submitting,
}: CommentItemProps) {
  const isOwner = currentUserId === comment.user.email;

  return (
    <div className="flex gap-3">
      {comment.user.image ? (
        <Image
          src={comment.user.image}
          alt={comment.user.name}
          width={40}
          height={40}
          className="rounded-full flex-shrink-0"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
          <User size={20} className="text-gray-500" />
        </div>
      )}

      <div className="flex-1">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-900">{comment.user.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {new Date(comment.createdAt).toLocaleString('zh-TW')}
              </span>
              {isOwner && (
                <button
                  onClick={() => onDelete(comment.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  title="刪除評論"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
          <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
        </div>

        {/* 回覆按鈕 */}
        <button
          onClick={() => onReply(comment.id)}
          className="text-sm text-blue-600 hover:text-blue-700 mt-2"
        >
          回覆
        </button>

        {/* 回覆表單 */}
        {replyingTo === comment.id && (
          <div className="mt-3 ml-4">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="寫下你的回覆..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
              disabled={submitting}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => {
                  onReply(null as any);
                  setReplyContent('');
                }}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                disabled={submitting}
              >
                取消
              </button>
              <button
                onClick={() => onSubmitReply(comment.id)}
                disabled={submitting || !replyContent.trim()}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? '發送中...' : '發送回覆'}
              </button>
            </div>
          </div>
        )}

        {/* 回覆列表 */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 ml-4 space-y-3 border-l-2 border-gray-200 pl-4">
            {comment.replies.map((reply) => (
              <div key={reply.id} className="flex gap-2">
                {reply.user.image ? (
                  <Image
                    src={reply.user.image}
                    alt={reply.user.name}
                    width={32}
                    height={32}
                    className="rounded-full flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                    <User size={16} className="text-gray-500" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-900">{reply.user.name}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(reply.createdAt).toLocaleString('zh-TW')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{reply.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

