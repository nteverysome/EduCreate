# 圖片功能整合指南

## 📋 概述

本指南介紹如何將圖片管理功能整合到 EduCreate 的現有系統中。

---

## 🎯 整合目標

1. 在活動編輯器中添加圖片選擇功能
2. 創建圖片管理頁面
3. 在導航菜單中添加圖片管理入口
4. 在活動卡片中顯示圖片

---

## 📦 整合步驟

### 步驟 1: 在活動編輯器中使用 ContentItemWithImage

**文件**: `app/create/page.tsx` 或 `app/edit/[id]/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import ContentItemWithImage, { ContentItem } from '@/components/content-item-with-image';

export default function ActivityEditor() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([
    {
      id: '1',
      text: '',
      position: 0,
    },
  ]);

  const handleItemChange = (index: number, value: ContentItem) => {
    const newItems = [...contentItems];
    newItems[index] = value;
    setContentItems(newItems);
  };

  const handleItemRemove = (index: number) => {
    const newItems = contentItems.filter((_, i) => i !== index);
    // 更新 position
    newItems.forEach((item, i) => {
      item.position = i;
    });
    setContentItems(newItems);
  };

  const handleAddItem = () => {
    setContentItems([
      ...contentItems,
      {
        id: Date.now().toString(),
        text: '',
        position: contentItems.length,
      },
    ]);
  };

  const handleSave = async () => {
    // 保存活動和內容項目
    const response = await fetch('/api/activities', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: '...',
        contentItems,
      }),
    });

    if (response.ok) {
      alert('保存成功！');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">創建活動</h1>

      {/* 活動基本信息 */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">活動標題</label>
        <input
          type="text"
          className="w-full px-4 py-2 border rounded-lg"
          placeholder="輸入活動標題..."
        />
      </div>

      {/* 內容項目列表 */}
      <div className="space-y-4 mb-6">
        <h2 className="text-lg font-semibold">活動內容</h2>
        {contentItems.map((item, index) => (
          <ContentItemWithImage
            key={item.id}
            value={item}
            onChange={(value) => handleItemChange(index, value)}
            onRemove={() => handleItemRemove(index)}
            autoSave={false}
          />
        ))}
      </div>

      {/* 添加內容項目按鈕 */}
      <button
        onClick={handleAddItem}
        className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors text-gray-600"
      >
        + 添加內容項目
      </button>

      {/* 保存按鈕 */}
      <div className="mt-6 flex gap-3">
        <button
          onClick={handleSave}
          className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          保存活動
        </button>
        <button
          onClick={() => window.history.back()}
          className="px-6 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
        >
          取消
        </button>
      </div>
    </div>
  );
}
```

---

### 步驟 2: 創建圖片管理頁面

**文件**: `app/images/page.tsx`

```typescript
'use client';

import ImageGallery from '@/components/image-gallery';
import { UserImage } from '@/components/image-picker';

export default function ImagesPage() {
  const handleImageSelect = (image: UserImage) => {
    console.log('Selected image:', image);
    // 可以在這裡處理圖片選擇邏輯
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-2xl font-bold">圖片管理</h1>
        <p className="text-gray-600 mt-1">管理您的所有圖片</p>
      </div>

      {/* Gallery */}
      <div className="flex-1 overflow-hidden">
        <ImageGallery
          onSelect={handleImageSelect}
          selectable={false}
          multiple={false}
        />
      </div>
    </div>
  );
}
```

---

### 步驟 3: 在導航菜單中添加圖片管理入口

**文件**: `components/layout/Sidebar.tsx` 或 `components/layout/Navigation.tsx`

```typescript
import Link from 'next/link';
import { Image, Home, Plus, Users, Settings } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r h-screen">
      <nav className="p-4 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Home className="w-5 h-5" />
          <span>首頁</span>
        </Link>

        <Link
          href="/create"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>創建活動</span>
        </Link>

        {/* 圖片管理入口 */}
        <Link
          href="/images"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Image className="w-5 h-5" />
          <span>圖片管理</span>
        </Link>

        <Link
          href="/community"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Users className="w-5 h-5" />
          <span>社區</span>
        </Link>

        <Link
          href="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span>設置</span>
        </Link>
      </nav>
    </aside>
  );
}
```

---

### 步驟 4: 在活動卡片中顯示圖片

**文件**: `components/activities/ActivityCard.tsx`

```typescript
import Image from 'next/image';
import { Activity } from '@prisma/client';

interface ActivityCardProps {
  activity: Activity & {
    images?: {
      image: {
        url: string;
        alt: string | null;
      };
    }[];
  };
}

export default function ActivityCard({ activity }: ActivityCardProps) {
  const firstImage = activity.images?.[0]?.image;

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
      {/* 圖片 */}
      {firstImage && (
        <div className="relative h-48 bg-gray-100">
          <Image
            src={firstImage.url}
            alt={firstImage.alt || activity.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* 內容 */}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{activity.title}</h3>
        <p className="text-gray-600 text-sm line-clamp-2">
          {activity.description}
        </p>

        {/* 統計信息 */}
        <div className="flex items-center gap-4 mt-4 text-sm text-gray-500">
          <span>👁️ {activity.views || 0} 次瀏覽</span>
          <span>❤️ {activity.likes || 0} 個讚</span>
        </div>
      </div>
    </div>
  );
}
```

---

### 步驟 5: 在活動詳情頁面中顯示圖片

**文件**: `app/activities/[id]/page.tsx`

```typescript
import { prisma } from '@/lib/prisma';
import Image from 'next/image';

export default async function ActivityDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const activity = await prisma.activity.findUnique({
    where: { id: params.id },
    include: {
      images: {
        include: {
          image: true,
        },
        orderBy: {
          position: 'asc',
        },
      },
    },
  });

  if (!activity) {
    return <div>活動不存在</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">{activity.title}</h1>

      {/* 圖片網格 */}
      {activity.images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          {activity.images.map((activityImage) => (
            <div
              key={activityImage.id}
              className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden"
            >
              <Image
                src={activityImage.image.url}
                alt={activityImage.image.alt || activity.title}
                fill
                className="object-cover"
              />
              {activityImage.context && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 text-sm">
                  {activityImage.context}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* 活動內容 */}
      <div className="prose max-w-none">
        <p>{activity.description}</p>
      </div>
    </div>
  );
}
```

---

## 🔧 API 整合

### 保存活動時關聯圖片

**文件**: `app/api/activities/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: '未授權' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    return NextResponse.json({ error: '用戶不存在' }, { status: 404 });
  }

  const body = await request.json();
  const { title, description, contentItems } = body;

  // 創建活動
  const activity = await prisma.activity.create({
    data: {
      title,
      description,
      userId: user.id,
    },
  });

  // 關聯圖片
  if (contentItems && contentItems.length > 0) {
    const imageData = contentItems
      .filter((item: any) => item.imageId)
      .map((item: any, index: number) => ({
        activityId: activity.id,
        imageId: item.imageId,
        position: index,
        context: item.text,
      }));

    if (imageData.length > 0) {
      await prisma.activityImage.createMany({
        data: imageData,
      });

      // 更新圖片使用次數
      const imageIds = imageData.map((d) => d.imageId);
      await prisma.userImage.updateMany({
        where: {
          id: { in: imageIds },
        },
        data: {
          usageCount: { increment: 1 },
          lastUsedAt: new Date(),
        },
      });
    }
  }

  return NextResponse.json({
    success: true,
    activity,
  });
}
```

---

## 📝 最佳實踐

### 1. 錯誤處理

```typescript
try {
  // 操作邏輯
} catch (error) {
  console.error('Error:', error);
  alert('操作失敗，請重試');
}
```

### 2. 加載狀態

```typescript
const [loading, setLoading] = useState(false);

const handleSave = async () => {
  setLoading(true);
  try {
    // 保存邏輯
  } finally {
    setLoading(false);
  }
};
```

### 3. 數據驗證

```typescript
const validateActivity = (data: any) => {
  if (!data.title) {
    alert('請輸入活動標題');
    return false;
  }
  return true;
};
```

---

## 🚀 部署檢查清單

- [ ] 環境變數已配置
- [ ] 數據庫已遷移
- [ ] 依賴已安裝
- [ ] 組件已測試
- [ ] API 已測試
- [ ] 圖片上傳功能正常
- [ ] Unsplash 搜索功能正常
- [ ] 圖片編輯功能正常
- [ ] 版本控制功能正常

---

**文檔版本**: 1.0  
**最後更新**: 2025-10-21  
**維護者**: EduCreate Team

