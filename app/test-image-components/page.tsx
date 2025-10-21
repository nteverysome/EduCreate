'use client';

/**
 * 圖片組件測試頁面
 * 
 * 測試以下組件：
 * 1. ImagePicker - 圖片選擇器
 * 2. ImageEditor - 圖片編輯器
 * 3. ImageGallery - 圖片管理
 * 4. ContentItemWithImage - 內容編輯器
 * 5. VersionHistory - 版本歷史
 */

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ImagePicker, { UserImage } from '@/components/image-picker';
import ImageEditor from '@/components/image-editor';
import ImageGallery from '@/components/image-gallery';
import ContentItemWithImage from '@/components/content-item-with-image';
import VersionHistory from '@/components/version-history';

export default function TestImageComponentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Component visibility states
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [showContentEditor, setShowContentEditor] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);

  // Selected images
  const [selectedImages, setSelectedImages] = useState<UserImage[]>([]);
  const [imageToEdit, setImageToEdit] = useState<UserImage | null>(null);

  // Test results
  const [testResults, setTestResults] = useState<{
    component: string;
    status: 'pass' | 'fail' | 'pending';
    message: string;
  }[]>([
    { component: 'ImagePicker', status: 'pending', message: '等待測試' },
    { component: 'ImageEditor', status: 'pending', message: '等待測試' },
    { component: 'ImageGallery', status: 'pending', message: '等待測試' },
    { component: 'ContentItemWithImage', status: 'pending', message: '等待測試' },
    { component: 'VersionHistory', status: 'pending', message: '等待測試' },
  ]);

  // Check authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-4">需要登入</h1>
          <p className="text-gray-600 text-center mb-6">
            請先登入以測試圖片組件
          </p>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            前往登入
          </button>
        </div>
      </div>
    );
  }

  // Update test result
  const updateTestResult = (component: string, status: 'pass' | 'fail', message: string) => {
    setTestResults((prev) =>
      prev.map((result) =>
        result.component === component
          ? { ...result, status, message }
          : result
      )
    );
  };

  // Handle ImagePicker selection
  const handleImagePickerSelect = (images: UserImage[]) => {
    setSelectedImages(images);
    updateTestResult('ImagePicker', 'pass', `成功選擇 ${images.length} 張圖片`);
    setShowImagePicker(false);
  };

  // Handle ImageEditor save
  const handleImageEditorSave = (editedImageBlob: Blob, editedImageUrl: string) => {
    console.log('Image edited:', { blob: editedImageBlob, url: editedImageUrl });
    updateTestResult('ImageEditor', 'pass', '成功編輯並保存圖片');
    setShowImageEditor(false);
    setImageToEdit(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            圖片組件測試頁面
          </h1>
          <p className="text-gray-600">
            測試所有圖片相關組件的功能和整合
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-gray-500">登入用戶：</span>
            <span className="text-sm font-medium text-gray-900">
              {session?.user?.name || session?.user?.email}
            </span>
          </div>
        </div>

        {/* Test Results Summary */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">測試結果</h2>
          <div className="space-y-2">
            {testResults.map((result) => (
              <div
                key={result.component}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      result.status === 'pass'
                        ? 'bg-green-500'
                        : result.status === 'fail'
                        ? 'bg-red-500'
                        : 'bg-gray-300'
                    }`}
                  />
                  <span className="font-medium text-gray-900">
                    {result.component}
                  </span>
                </div>
                <span className="text-sm text-gray-600">{result.message}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Test Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Test 1: ImagePicker */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              1. ImagePicker 組件
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              測試圖片選擇器的搜索、上傳和圖片庫功能
            </p>
            <button
              onClick={() => setShowImagePicker(true)}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              打開 ImagePicker
            </button>
            {selectedImages.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">
                  已選擇 {selectedImages.length} 張圖片
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {selectedImages.slice(0, 3).map((img) => (
                    <img
                      key={img.id}
                      src={img.url}
                      alt={img.alt || img.fileName}
                      className="w-full h-20 object-cover rounded"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Test 2: ImageEditor */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              2. ImageEditor 組件
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              測試圖片編輯器的裁剪、調整和保存功能
            </p>
            <button
              onClick={() => {
                if (selectedImages.length > 0) {
                  setImageToEdit(selectedImages[0]);
                  setShowImageEditor(true);
                } else {
                  alert('請先使用 ImagePicker 選擇一張圖片');
                }
              }}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              打開 ImageEditor
            </button>
          </div>

          {/* Test 3: ImageGallery */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              3. ImageGallery 組件
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              測試圖片管理的列表、篩選和刪除功能
            </p>
            <button
              onClick={() => setShowImageGallery(true)}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors"
            >
              打開 ImageGallery
            </button>
          </div>

          {/* Test 4: ContentItemWithImage */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              4. ContentItemWithImage 組件
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              測試內容編輯器的圖片整合功能
            </p>
            <button
              onClick={() => setShowContentEditor(true)}
              className="w-full bg-orange-600 text-white py-2 px-4 rounded-lg hover:bg-orange-700 transition-colors"
            >
              打開 ContentItemWithImage
            </button>
          </div>

          {/* Test 5: VersionHistory */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              5. VersionHistory 組件
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              測試版本歷史的查看和恢復功能
            </p>
            <button
              onClick={() => {
                if (selectedImages.length > 0) {
                  setShowVersionHistory(true);
                } else {
                  alert('請先使用 ImagePicker 選擇一張圖片');
                }
              }}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
            >
              打開 VersionHistory
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showImagePicker && (
        <ImagePicker
          onSelect={handleImagePickerSelect}
          onClose={() => setShowImagePicker(false)}
          multiple={true}
          maxSelection={10}
        />
      )}

      {showImageEditor && imageToEdit && (
        <ImageEditor
          imageUrl={imageToEdit.url}
          onSave={handleImageEditorSave}
          onClose={() => {
            setShowImageEditor(false);
            setImageToEdit(null);
          }}
        />
      )}

      {showImageGallery && (
        <ImageGallery
          selectable={true}
          multiple={true}
          onClose={() => setShowImageGallery(false)}
          onSelect={(images) => {
            const imageArray = Array.isArray(images) ? images : [images];
            setSelectedImages(imageArray);
            updateTestResult('ImageGallery', 'pass', `從圖片庫選擇 ${imageArray.length} 張圖片`);
            setShowImageGallery(false);
          }}
        />
      )}

      {showContentEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">ContentItemWithImage 測試</h2>
              <button
                onClick={() => {
                  updateTestResult('ContentItemWithImage', 'pass', '成功測試內容編輯器');
                  setShowContentEditor(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <ContentItemWithImage
                index={0}
                item={{ question: '測試問題', answer: '測試答案' }}
                onChange={(index, field, value) => {
                  console.log('Content changed:', { index, field, value });
                }}
                onRemove={() => {}}
              />
            </div>
          </div>
        </div>
      )}

      {showVersionHistory && selectedImages.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">VersionHistory 測試</h2>
              <button
                onClick={() => {
                  updateTestResult('VersionHistory', 'pass', '成功查看版本歷史');
                  setShowVersionHistory(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto">
              <VersionHistory
                imageId={selectedImages[0].id}
                onRestore={(version) => {
                  console.log('Restore version:', version);
                  updateTestResult('VersionHistory', 'pass', '成功恢復版本');
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

