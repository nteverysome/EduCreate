/**
 * ImagePicker Component
 * 
 * 完整的圖片選擇器組件，參考 Wordwall 的實現
 * 
 * 功能：
 * 1. 圖片搜索（整合 Unsplash API）
 * 2. 尺寸篩選（All/Small/Medium/Large）
 * 3. 圖片上傳
 * 4. 個人圖庫管理
 * 5. 響應式設計
 * 
 * @author EduCreate Development Team
 * @version 1.0
 * @date 2025-10-21
 */

import { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Search, Upload, X, Image as ImageIcon } from 'lucide-react';

// ==================== Types ====================

interface Image {
  id: string;
  url: string;
  thumbnail: string;
  width: number;
  height: number;
  description?: string;
  photographer?: string;
  photographerUrl?: string;
}

interface ImagePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string, imageData: Image) => void;
  defaultTab?: 'search' | 'uploaded';
}

type SizeFilter = 'all' | 'small' | 'medium' | 'large';

// ==================== Component ====================

export function ImagePicker({
  isOpen,
  onClose,
  onSelect,
  defaultTab = 'search'
}: ImagePickerProps) {
  // ===== State =====
  const [activeTab, setActiveTab] = useState<'search' | 'uploaded'>(defaultTab);
  const [searchQuery, setSearchQuery] = useState('');
  const [sizeFilter, setSizeFilter] = useState<SizeFilter>('medium');
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { toast } = useToast();

  // ===== Search Images =====
  const searchImages = useCallback(async (query: string, size: SizeFilter, pageNum: number = 1) => {
    if (!query.trim()) {
      toast({
        title: '請輸入搜索關鍵字',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/images/search?q=${encodeURIComponent(query)}&size=${size}&page=${pageNum}`
      );

      if (!response.ok) {
        throw new Error('搜索失敗');
      }

      const data = await response.json();

      if (pageNum === 1) {
        setImages(data.images);
      } else {
        setImages(prev => [...prev, ...data.images]);
      }

      setHasMore(data.images.length > 0);
      setPage(pageNum);
    } catch (error) {
      console.error('Search failed:', error);
      toast({
        title: '搜索失敗',
        description: '請稍後再試',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // ===== Load User Images =====
  const loadUserImages = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/images/user');

      if (!response.ok) {
        throw new Error('載入失敗');
      }

      const data = await response.json();
      setImages(data.images);
    } catch (error) {
      console.error('Load user images failed:', error);
      toast({
        title: '載入失敗',
        description: '無法載入您的圖片',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // ===== Handle Search =====
  const handleSearch = () => {
    searchImages(searchQuery, sizeFilter, 1);
  };

  // ===== Handle Upload =====
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 驗證文件類型
    if (!file.type.startsWith('image/')) {
      toast({
        title: '無效的文件類型',
        description: '請選擇圖片文件',
        variant: 'destructive'
      });
      return;
    }

    // 驗證文件大小（最大 5MB）
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: '文件太大',
        description: '圖片大小不能超過 5MB',
        variant: 'destructive'
      });
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/images/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('上傳失敗');
      }

      const data = await response.json();

      toast({
        title: '上傳成功',
        description: '圖片已添加到您的圖庫'
      });

      // 選擇剛上傳的圖片
      onSelect(data.image.image_url, data.image);
      onClose();
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: '上傳失敗',
        description: '請稍後再試',
        variant: 'destructive'
      });
    } finally {
      setUploading(false);
      // 重置 input
      event.target.value = '';
    }
  };

  // ===== Handle Image Select =====
  const handleImageSelect = (image: Image) => {
    onSelect(image.url, image);
    onClose();
  };

  // ===== Handle Delete Image =====
  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('確定要刪除這張圖片嗎？')) return;

    try {
      const response = await fetch(`/api/images/${imageId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('刪除失敗');
      }

      toast({
        title: '刪除成功'
      });

      // 重新載入用戶圖片
      loadUserImages();
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: '刪除失敗',
        description: '請稍後再試',
        variant: 'destructive'
      });
    }
  };

  // ===== Load More Images =====
  const loadMore = () => {
    if (activeTab === 'search' && hasMore && !loading) {
      searchImages(searchQuery, sizeFilter, page + 1);
    }
  };

  // ===== Effects =====
  useEffect(() => {
    if (isOpen && activeTab === 'uploaded') {
      loadUserImages();
    }
  }, [isOpen, activeTab, loadUserImages]);

  useEffect(() => {
    if (isOpen && activeTab === 'search' && searchQuery) {
      searchImages(searchQuery, sizeFilter, 1);
    }
  }, [sizeFilter]); // 當尺寸篩選改變時重新搜索

  // ===== Render =====
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle>選擇圖片</DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1">
          <div className="px-6 pt-4">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="search">搜索圖片</TabsTrigger>
              <TabsTrigger value="uploaded">我的圖片</TabsTrigger>
            </TabsList>
          </div>

          {/* Search Tab */}
          <TabsContent value="search" className="mt-0">
            {/* Search Controls */}
            <div className="flex items-center gap-3 px-6 py-4 border-b bg-gray-50">
              <Input
                type="text"
                placeholder="搜索圖片..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />

              <Select value={sizeFilter} onValueChange={(v) => setSizeFilter(v as SizeFilter)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有尺寸</SelectItem>
                  <SelectItem value="small">小尺寸</SelectItem>
                  <SelectItem value="medium">中等尺寸</SelectItem>
                  <SelectItem value="large">大尺寸</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleSearch} disabled={loading || !searchQuery.trim()}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>

              <label className="cursor-pointer">
                <Button variant="outline" disabled={uploading} asChild>
                  <span>
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                    上傳
                  </span>
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            {/* Image Grid */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-240px)]">
              {loading && images.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : images.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <ImageIcon className="w-16 h-16 mb-4" />
                  <p>輸入關鍵字搜索圖片</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((image) => (
                      <div
                        key={image.id}
                        className="group relative cursor-pointer rounded-lg overflow-hidden border hover:border-primary transition"
                        onClick={() => handleImageSelect(image)}
                      >
                        <img
                          src={image.thumbnail}
                          alt={image.description || ''}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent text-white text-xs">
                          <div>{image.width} × {image.height}</div>
                          {image.photographer && (
                            <div className="truncate opacity-75">by {image.photographer}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Load More */}
                  {hasMore && (
                    <div className="flex justify-center mt-6">
                      <Button onClick={loadMore} disabled={loading} variant="outline">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        載入更多
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          {/* Uploaded Tab */}
          <TabsContent value="uploaded" className="mt-0">
            {/* Upload Button */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
              <p className="text-sm text-gray-600">您上傳的圖片</p>
              <label className="cursor-pointer">
                <Button variant="outline" disabled={uploading} asChild>
                  <span>
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                    上傳新圖片
                  </span>
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>

            {/* Image Grid */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-240px)]">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : images.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <ImageIcon className="w-16 h-16 mb-4" />
                  <p>還沒有上傳任何圖片</p>
                  <p className="text-sm mt-2">點擊上方的「上傳新圖片」按鈕開始</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className="group relative rounded-lg overflow-hidden border hover:border-primary transition"
                    >
                      <img
                        src={image.thumbnail}
                        alt={image.description || ''}
                        className="w-full h-48 object-cover cursor-pointer"
                        onClick={() => handleImageSelect(image)}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition" />
                      
                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteImage(image.id);
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent text-white text-xs">
                        <div>{image.width} × {image.height}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// ==================== Usage Example ====================

/*
import { ImagePicker } from '@/components/ImagePicker';

function MyComponent() {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImageSelect = (imageUrl: string, imageData: Image) => {
    setSelectedImage(imageUrl);
    console.log('Selected image:', imageData);
  };

  return (
    <div>
      <button onClick={() => setIsPickerOpen(true)}>
        選擇圖片
      </button>

      {selectedImage && (
        <img src={selectedImage} alt="Selected" />
      )}

      <ImagePicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handleImageSelect}
      />
    </div>
  );
}
*/

