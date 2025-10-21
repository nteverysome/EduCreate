/**
 * 圖片上傳 API 端點
 * 處理用戶圖片上傳、壓縮、存儲到 Vercel Blob 和保存元數據
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { put } from '@vercel/blob';
import sharp from 'sharp';
import prisma from '@/lib/prisma';

// 允許的圖片類型
const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

// 最大文件大小（10MB）
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// 最大圖片尺寸
const MAX_WIDTH = 4096;
const MAX_HEIGHT = 4096;

/**
 * POST /api/images/upload
 * 
 * FormData:
 * - file: 圖片文件（必需）
 * - alt: 替代文字（可選）
 * - tags: 標籤（可選，JSON 數組字符串）
 */
export async function POST(request: NextRequest) {
  try {
    // 驗證用戶登錄
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '未授權訪問' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 檢查環境變量
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN 未設置');
      return NextResponse.json(
        { error: 'Blob Storage 配置錯誤' },
        { status: 500 }
      );
    }

    // 獲取表單數據
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const alt = formData.get('alt') as string | null;
    const tagsStr = formData.get('tags') as string | null;

    // 驗證文件
    if (!file) {
      return NextResponse.json(
        { error: '缺少文件' },
        { status: 400 }
      );
    }

    // 驗證文件類型
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `不支持的文件類型: ${file.type}。支持的類型: ${ALLOWED_IMAGE_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // 驗證文件大小
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `文件大小超過限制。最大: ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // 解析標籤
    let tags: string[] = [];
    if (tagsStr) {
      try {
        tags = JSON.parse(tagsStr);
        if (!Array.isArray(tags)) {
          throw new Error('標籤必須是數組');
        }
      } catch (error) {
        return NextResponse.json(
          { error: '標籤格式錯誤' },
          { status: 400 }
        );
      }
    }

    // 讀取文件內容
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 使用 sharp 處理圖片
    let imageBuffer = buffer;
    let metadata = await sharp(buffer).metadata();

    // 驗證圖片尺寸
    if (!metadata.width || !metadata.height) {
      return NextResponse.json(
        { error: '無法讀取圖片尺寸' },
        { status: 400 }
      );
    }

    if (metadata.width > MAX_WIDTH || metadata.height > MAX_HEIGHT) {
      return NextResponse.json(
        { error: `圖片尺寸超過限制。最大: ${MAX_WIDTH}x${MAX_HEIGHT}` },
        { status: 400 }
      );
    }

    // 壓縮圖片（如果是 JPEG 或 PNG）
    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
      imageBuffer = await sharp(buffer)
        .jpeg({ quality: 85, progressive: true })
        .toBuffer();
    } else if (file.type === 'image/png') {
      imageBuffer = await sharp(buffer)
        .png({ compressionLevel: 9 })
        .toBuffer();
    } else if (file.type === 'image/webp') {
      imageBuffer = await sharp(buffer)
        .webp({ quality: 85 })
        .toBuffer();
    }

    // 重新獲取元數據（壓縮後）
    metadata = await sharp(imageBuffer).metadata();

    // 生成唯一文件名
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const extension = file.name.split('.').pop() || 'jpg';
    const fileName = `${timestamp}-${randomStr}.${extension}`;
    const blobPath = `user-uploads/${userId}/${fileName}`;

    // 上傳到 Vercel Blob
    const blob = await put(blobPath, imageBuffer, {
      access: 'public',
      contentType: file.type,
    });

    // 保存到數據庫
    const userImage = await prisma.userImage.create({
      data: {
        userId,
        url: blob.url,
        blobPath: blob.pathname,
        fileName: file.name,
        fileSize: imageBuffer.length,
        mimeType: file.type,
        width: metadata.width || 0,
        height: metadata.height || 0,
        source: 'upload',
        alt: alt || null,
        tags,
      },
    });

    return NextResponse.json({
      success: true,
      image: {
        id: userImage.id,
        url: userImage.url,
        fileName: userImage.fileName,
        fileSize: userImage.fileSize,
        mimeType: userImage.mimeType,
        width: userImage.width,
        height: userImage.height,
        alt: userImage.alt,
        tags: userImage.tags,
        createdAt: userImage.createdAt,
      },
    });

  } catch (error) {
    console.error('圖片上傳錯誤:', error);
    return NextResponse.json(
      { error: '上傳失敗', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * OPTIONS /api/images/upload
 * 處理 CORS 預檢請求
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

