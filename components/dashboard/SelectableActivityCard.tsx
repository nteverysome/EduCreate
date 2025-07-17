import React from 'react';
import Link from 'next/link';
import { CalendarIcon, UserIcon, TagIcon, EyeIcon, PencilIcon, TrashIcon, CheckIcon } from '@heroicons/react/24/outline';
// 自定義日期格式化函數，替代date-fns
const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  const diffDay = Math.round(diffHour / 24);
  const diffMonth = Math.round(diffDay / 30);
  const diffYear = Math.round(diffDay / 365);
  if (diffSec < 60) {
    return '剛剛';
  } else if (diffMin < 60) {
    return `${diffMin} 分鐘前`;
  } else if (diffHour < 24) {
    return `${diffHour} 小時前`;
  } else if (diffDay < 30) {
    return `${diffDay} 天前`;
  } else if (diffMonth < 12) {
    return `${diffMonth} 個月前`;
  } else {
    return `${diffYear} 年前`;
  }
};
interface Activity {
  id: string;
  title: string;
  description?: string;
  type: string;
  templateType: string;
  createdAt: string;
  updatedAt?: string;
  published: boolean;
  views?: number;
  interactions?: number;
  tags?: string[];
  user?: {
    name: string;
  };
}
interface SelectableActivityCardProps {
  activity: Activity;
  isSelected: boolean;
  onSelect: (id: string, isSelected: boolean) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onPublish: (id: string) => void;
}
const SelectableActivityCard: React.FC<SelectableActivityCardProps> = ({
  activity,
  isSelected,
  onSelect,
  onEdit,
  onDelete,
  onPublish
}) => {
  const {
    id,
    title,
    description,
    type,
    createdAt,
    published,
    views,
    tags,
    user
  } = activity;
  // 獲取模板類型的顯示名稱和顏色
  const getTemplateInfo = (type: string) => {
    switch (type) {
      case 'FLASHCARDS':
        return { name: '單字卡片', color: 'bg-blue-100 text-blue-800' };
      case 'MATCHING':
        return { name: '配對遊戲', color: 'bg-purple-100 text-purple-800' };
      case 'QUIZ':
        return { name: '測驗問答', color: 'bg-pink-100 text-pink-800' };
      default:
        return { name: '其他', color: 'bg-gray-100 text-gray-800' };
    }
  };
  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return formatRelativeTime(date);
  };
  const templateInfo = getTemplateInfo(type);
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-200 ${isSelected ? 'ring-2 ring-primary' : 'hover:shadow-lg'}`}>
      <div className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            <div 
              className="mr-3 h-5 w-5 rounded border border-gray-300 flex items-center justify-center cursor-pointer"
              onClick={() => onSelect(id, !isSelected)}
            >
              {isSelected && (
                <CheckIcon className="h-4 w-4 text-primary" />
              )}
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${templateInfo.color}`}>
              {templateInfo.name}
            </span>
          </div>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {published ? '已發布' : '草稿'}
          </span>
        </div>
        <h3 className="text-lg font-semibold mb-2 line-clamp-1">{title}</h3>
        {description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{description}</p>
        )}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.map(tag => (
              <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                <TagIcon className="h-3 w-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center text-gray-500 text-xs mb-4">
          {user && (
            <span className="flex items-center mr-3">
              <UserIcon className="h-3 w-3 mr-1" />
              {user.name}
            </span>
          )}
          <span className="flex items-center">
            <CalendarIcon className="h-3 w-3 mr-1" />
            {formatDate(createdAt)}
          </span>
          {views !== undefined && (
            <span className="flex items-center ml-3">
              <EyeIcon className="h-3 w-3 mr-1" />
              {views} 次瀏覽
            </span>
          )}
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
          <div>
            <button 
              onClick={() => onEdit(id)}
              className="text-gray-600 hover:text-primary mr-2 transition-colors"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button 
              onClick={() => onDelete(id)}
              className="text-gray-600 hover:text-red-600 transition-colors"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
          {!published && (
            <button
              onClick={() => onPublish(id)}
              className="px-3 py-1 bg-primary text-white text-xs rounded-full hover:bg-primary-dark transition-colors"
            >
              發布
            </button>
          )}
          {published && (
            <Link href={`/preview/${id}`} className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 transition-colors">
              查看
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
export default SelectableActivityCard;
