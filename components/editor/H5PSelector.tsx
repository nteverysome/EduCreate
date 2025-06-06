import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useEditorStore } from '../../store/editorStore';

interface H5PContent {
  id: string;
  title: string;
  description?: string;
  contentType: string;
  status: 'DRAFT' | 'PUBLISHED';
  updatedAt: string;
}

interface H5PSelectorProps {
  onSelect: (h5pContent: H5PContent) => void;
  onCancel: () => void;
}

export default function H5PSelector({ onSelect, onCancel }: H5PSelectorProps) {
  const [contents, setContents] = useState<H5PContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // 獲取H5P內容列表
  useEffect(() => {
    const fetchContents = async () => {
      try {
        const response = await fetch('/api/h5p?status=PUBLISHED');
        if (!response.ok) {
          throw new Error('獲取H5P內容列表失敗');
        }
        const data = await response.json();
        setContents(data);
      } catch (err) {
        setError('獲取H5P內容列表失敗');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContents();
  }, []);

  // 過濾內容
  const filteredContents = contents.filter(content => 
    content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (content.description && content.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    content.contentType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">選擇H5P內容</h2>
          <button
            onClick={onCancel}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="搜索H5P內容..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-600">載入中...</p>
            </div>
          ) : filteredContents.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">
                {searchTerm ? '沒有符合搜索條件的H5P內容' : '尚未上傳任何H5P內容'}
              </p>
              {!searchTerm && (
                <Link
                  href="/h5p"
                  className="mt-2 inline-block text-blue-600 hover:underline"
                >
                  前往上傳H5P內容
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredContents.map((content) => (
                <div
                  key={content.id}
                  className="border rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
                  onClick={() => onSelect(content)}
                >
                  <h3 className="font-medium text-lg mb-1">{content.title}</h3>
                  {content.description && (
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{content.description}</p>
                  )}
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{content.contentType}</span>
                    <span>更新於: {new Date(content.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}