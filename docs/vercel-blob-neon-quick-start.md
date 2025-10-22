# Vercel Blob + Neon 快速開始指南

**版本**：1.0  
**預估時間**：3-5 天  
**預估成本**：$44.75/月

---

## 🎯 目標

將 EduCreate 的所有圖片存儲統一到 Vercel Blob Storage，同時保持使用 Neon PostgreSQL。

---

## ✅ 5 天實施檢查清單

### 第 1 天上午：準備與評估

```bash
□ 統計本地頭像文件
  cd public/uploads/avatars
  ls -lh | wc -l  # 文件數量
  du -sh .        # 總大小

□ 檢查 Vercel Blob 配置
  echo $BLOB_READ_WRITE_TOKEN

□ 確認 Vercel Pro 訂閱
  訪問 https://vercel.com/dashboard/billing

□ 設置成本警報
  Vercel Dashboard → Settings → Billing → Alerts

□ 備份本地頭像
  cp -r public/uploads/avatars ~/backup/avatars-$(date +%Y%m%d)
```

### 第 1 天下午 + 第 2 天：頭像遷移

```bash
□ 創建遷移腳本
  創建 scripts/migrate-avatars-to-blob.ts

□ 安裝依賴
  npm install @vercel/blob

□ 測試遷移腳本（測試環境）
  npx tsx scripts/migrate-avatars-to-blob.ts

□ 執行生產遷移
  NODE_ENV=production npx tsx scripts/migrate-avatars-to-blob.ts

□ 驗證遷移結果
  - 檢查 Vercel Blob 控制台
  - 測試頭像顯示
  - 驗證數據庫 URL 更新
```

### 第 3 天：API 實現

```bash
□ 更新頭像上傳 API
  編輯 app/api/user/upload-avatar/route.ts
  - 移除本地文件系統代碼
  - 使用 @vercel/blob 的 put() 方法
  - 添加錯誤處理

□ 實現媒體上傳 API
  編輯 app/api/media/upload/route.ts
  - 實現真實上傳功能
  - 添加文件驗證
  - 添加錯誤處理

□ 測試 API
  - 使用 Postman 或 curl 測試
  - 測試各種文件類型
  - 測試錯誤情況
```

### 第 4 天：前端更新與測試

```bash
□ 更新前端組件
  - 確保使用 CDN URL
  - 添加加載狀態
  - 添加錯誤處理

□ 全面測試
  - 用戶註冊（默認頭像）
  - 頭像上傳和更新
  - 活動截圖生成
  - 媒體上傳功能

□ 性能測試
  - 測試圖片加載速度
  - 驗證 CDN 緩存
  - 檢查響應時間
```

### 第 5 天：清理與部署

```bash
□ 清理舊代碼
  - 移除本地文件系統代碼
  - 刪除 public/uploads/avatars
  - 更新 .gitignore

□ 更新文檔
  - 更新 API 文檔
  - 更新架構圖

□ 部署到生產
  git add .
  git commit -m "feat: migrate to Vercel Blob Storage"
  git push origin main
  vercel --prod

□ 最終驗證
  - 測試所有圖片功能
  - 檢查成本使用
  - 監控錯誤日誌
```

---

## 🔧 關鍵代碼片段

### 1. 頭像遷移腳本

```typescript
// scripts/migrate-avatars-to-blob.ts
import { put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

async function migrateAvatars() {
  const avatarDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
  const files = fs.readdirSync(avatarDir);

  for (const file of files) {
    const filePath = path.join(avatarDir, file);
    const fileBuffer = fs.readFileSync(filePath);
    
    // 上傳到 Vercel Blob
    const blob = await put(`avatars/${file}`, fileBuffer, {
      access: 'public',
    });

    // 更新數據庫
    const userId = file.split('-')[0];
    await prisma.user.update({
      where: { id: userId },
      data: { image: blob.url },
    });

    console.log(`✅ Migrated: ${file}`);
  }
}

migrateAvatars();
```

### 2. 更新頭像上傳 API

```typescript
// app/api/user/upload-avatar/route.ts
import { put, del } from '@vercel/blob';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('avatar') as File;

  // 驗證文件
  if (!file || file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Invalid file' }, { status: 400 });
  }

  // 上傳到 Vercel Blob
  const fileName = `${session.user.id}-${Date.now()}.${file.type.split('/')[1]}`;
  const blob = await put(`avatars/${fileName}`, file, {
    access: 'public',
  });

  // 更新數據庫
  await prisma.user.update({
    where: { id: session.user.id },
    data: { image: blob.url },
  });

  return NextResponse.json({ success: true, url: blob.url });
}
```

### 3. 實現媒體上傳 API

```typescript
// app/api/media/upload/route.ts
import { put } from '@vercel/blob';
import { getServerSession } from 'next-auth';

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File;
  const folder = formData.get('folder') as string || 'media';

  // 驗證文件
  const maxSize = file.type.startsWith('video/') ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
  if (!file || file.size > maxSize) {
    return NextResponse.json({ error: 'Invalid file' }, { status: 400 });
  }

  // 上傳到 Vercel Blob
  const fileName = `${session.user.id}-${Date.now()}.${file.type.split('/')[1]}`;
  const blob = await put(`${folder}/${fileName}`, file, {
    access: 'public',
  });

  return NextResponse.json({
    success: true,
    url: blob.url,
    size: file.size,
    type: file.type,
  });
}
```

---

## 💰 成本速查

### 實施後成本

```
Neon PostgreSQL Launch: $19/月
Vercel Pro 計劃: $20/月（包含 5GB + 100GB）
Vercel Blob 額外: $5.745/月
─────────────────────────────
總計: $44.745/月
```

### 成本明細（10,000 用戶場景）

```
存儲：20GB
- 免費額度：5GB（Pro 計劃）
- 付費部分：15GB × $0.023 = $0.345/月

帶寬：200GB
- 免費額度：100GB（Pro 計劃）
- 付費部分：100GB × $0.05 = $5/月

操作：1M 次
- 成本：1M × $0.40 / 1M = $0.40/月

Vercel Blob 總計：$20 + $5.745 = $25.745/月
```

---

## ⚠️ 常見問題

### Q1: 遷移會影響現有用戶嗎？

**A**: 不會。遷移過程中：
- 數據庫不變（繼續使用 Neon）
- 活動截圖已在 Vercel Blob（無需遷移）
- 頭像遷移是批量更新 URL，用戶無感知

### Q2: 如果遷移失敗怎麼辦？

**A**: 我們有完整的回滾計劃：
1. 恢復數據庫中的頭像 URL
2. 回滾代碼到上一版本
3. 本地頭像文件已備份，可以恢復

### Q3: 成本會超支嗎？

**A**: 不太可能：
- 已設置成本警報
- 免費額度足夠初期使用
- 可以隨時監控使用量

### Q4: 需要停機嗎？

**A**: 不需要：
- 頭像遷移是後台批量操作
- API 更新是無縫部署
- 用戶體驗不受影響

### Q5: 為什麼不遷移數據庫？

**A**: 保留 Neon 的優勢：
- ✅ Database Branching 功能
- ✅ 降低遷移風險
- ✅ 減少工作量（3-5 天 vs 7-11 天）

---

## 📊 驗收標準

### 功能驗收

- ✅ 所有用戶頭像正常顯示
- ✅ 頭像上傳功能正常
- ✅ 活動截圖生成正常
- ✅ 媒體上傳功能正常
- ✅ 所有圖片通過 CDN 加載

### 性能驗收

- ✅ 圖片加載時間 < 500ms
- ✅ CDN 緩存命中率 > 80%
- ✅ API 響應時間 < 200ms

### 成本驗收

- ✅ 月成本 < $50
- ✅ 成本警報設置完成

---

## 🔗 相關文檔

- [完整實施計畫](./vercel-blob-neon-implementation-plan.md)
- [成本分析](./educreate-image-storage-analysis.md)
- [Vercel Blob 文檔](https://vercel.com/docs/storage/vercel-blob)

---

## 📞 需要幫助？

如果遇到問題：
1. 查看完整實施計畫
2. 檢查 Vercel 文檔
3. 查看錯誤日誌
4. 聯繫團隊支持

---

**準備好開始了嗎？** 🚀

**第一步**：統計本地頭像文件數量和大小

```bash
cd public/uploads/avatars
ls -lh | wc -l
du -sh .
```

**祝實施順利！** 🎉

