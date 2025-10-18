/**
 * 將圖片 URL 轉換為 base64 編碼
 * 用於 @vercel/og (Satori) 載入外部圖片
 */

export async function imageUrlToBase64(imageUrl: string): Promise<string> {
  try {
    // 從 URL 載入圖片
    const response = await fetch(imageUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    // 轉換為 ArrayBuffer
    const arrayBuffer = await response.arrayBuffer();
    
    // 轉換為 base64
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    
    // 獲取 MIME 類型
    const contentType = response.headers.get('content-type') || 'image/png';
    
    // 返回 data URL
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
}

/**
 * 從本地文件系統載入圖片並轉換為 base64
 * 用於 Edge Runtime 環境
 */
export async function localImageToBase64(imagePath: string): Promise<string> {
  try {
    // 在 Edge Runtime 中，我們需要使用完整的 URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://edu-create.vercel.app';
    const imageUrl = `${baseUrl}${imagePath}`;
    
    return await imageUrlToBase64(imageUrl);
  } catch (error) {
    console.error('Error loading local image:', error);
    throw error;
  }
}

