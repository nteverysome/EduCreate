import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

/**
 * POST /api/user/upload-avatar
 * 上傳用戶頭像
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 驗證用戶身份
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '未授權' },
        { status: 401 }
      );
    }

    // 2. 解析表單數據
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: '未提供文件' },
        { status: 400 }
      );
    }

    // 3. 驗證文件類型
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: '只能上傳圖片文件' },
        { status: 400 }
      );
    }

    // 4. 驗證文件大小（最大 5MB）
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: '文件大小不能超過 5MB' },
        { status: 400 }
      );
    }

    // 5. 生成唯一文件名
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `avatar-${session.user.email.replace(/[^a-zA-Z0-9]/g, '_')}-${timestamp}.${fileExtension}`;

    // 6. 確保上傳目錄存在
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars');
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // 7. 保存文件
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // 8. 返回文件 URL
    const fileUrl = `/uploads/avatars/${fileName}`;
    
    return NextResponse.json({
      url: fileUrl,
      fileName,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('上傳頭像失敗:', error);
    return NextResponse.json(
      { error: '上傳頭像失敗' },
      { status: 500 }
    );
  }
}

