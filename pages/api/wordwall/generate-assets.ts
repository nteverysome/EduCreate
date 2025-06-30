import { NextApiRequest, NextApiResponse } from 'next';
import { WordWallAssetManager, AssetGenerationRequest } from '@/lib/wordwall/AssetManager';
import { getSession } from 'next-auth/react';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '方法不允許' });
  }

  try {
    // 檢查用戶認證（可選，根據需求決定）
    const session = await getSession({ req });
    
    const { templateName, assetIds, generateAll } = req.body;

    let generationRequests: AssetGenerationRequest[] = [];

    if (generateAll) {
      // 生成所有待處理的資產
      generationRequests = WordWallAssetManager.createBatchGenerationRequests();
    } else if (templateName) {
      // 生成指定模板的資產
      generationRequests = WordWallAssetManager.createBatchGenerationRequests(templateName);
    } else if (assetIds && Array.isArray(assetIds)) {
      // 生成指定的資產
      generationRequests = assetIds
        .map(id => WordWallAssetManager.createGenerationRequest(id))
        .filter(req => req !== null) as AssetGenerationRequest[];
    } else {
      return res.status(400).json({ 
        error: '請提供 templateName、assetIds 或 generateAll 參數' 
      });
    }

    if (generationRequests.length === 0) {
      return res.status(200).json({
        success: true,
        message: '沒有需要生成的資產',
        generated: [],
        stats: WordWallAssetManager.getAssetStats()
      });
    }

    console.log(`🎨 開始生成 ${generationRequests.length} 個資產...`);

    const generatedAssets = [];
    const errors = [];

    // 模擬圖像生成過程（實際應該調用 Image Generation MCP）
    for (const request of generationRequests) {
      try {
        console.log(`🖼️ 生成資產: ${request.name}`);
        
        // TODO: 實際調用 Image Generation MCP
        // const imageUrl = await imageGenerationMCP.generateImage({
        //   prompt: request.prompt,
        //   style: request.style,
        //   size: request.size
        // });

        // 模擬生成結果
        const mockImageUrl = `https://placeholder.com/${request.size}?text=${encodeURIComponent(request.name)}`;
        const assetId = `${request.gameTemplate}_${request.name.replace(/\s+/g, '_').toLowerCase()}`;

        // 標記為已生成
        const success = WordWallAssetManager.markAssetAsGenerated(
          assetId,
          mockImageUrl,
          `/assets/generated/${assetId}.png`
        );

        if (success) {
          generatedAssets.push({
            id: assetId,
            name: request.name,
            url: mockImageUrl,
            type: request.type,
            gameTemplate: request.gameTemplate
          });
          console.log(`✅ 成功生成: ${request.name}`);
        } else {
          errors.push(`無法找到資產ID: ${assetId}`);
        }

      } catch (error) {
        console.error(`❌ 生成資產失敗: ${request.name}`, error);
        errors.push(`生成 ${request.name} 失敗: ${error instanceof Error ? error.message : '未知錯誤'}`);
      }
    }

    // 獲取更新後的統計
    const stats = WordWallAssetManager.getAssetStats();

    res.status(200).json({
      success: true,
      message: `成功生成 ${generatedAssets.length} 個資產`,
      generated: generatedAssets,
      errors: errors.length > 0 ? errors : undefined,
      stats,
      summary: {
        requested: generationRequests.length,
        successful: generatedAssets.length,
        failed: errors.length,
        totalAssets: stats.total,
        completionRate: Math.round((stats.generated / stats.total) * 100)
      }
    });

  } catch (error) {
    console.error('資產生成 API 錯誤:', error);
    res.status(500).json({
      success: false,
      error: '資產生成失敗',
      message: error instanceof Error ? error.message : '未知錯誤'
    });
  }
}

/**
 * 實際的圖像生成函數（待實現）
 */
async function generateImageWithMCP(request: AssetGenerationRequest): Promise<string> {
  // TODO: 實際調用 Image Generation MCP
  // 這裡應該調用真正的圖像生成服務
  
  console.log(`🎨 調用 Image Generation MCP:`);
  console.log(`  提示詞: ${request.prompt}`);
  console.log(`  風格: ${request.style}`);
  console.log(`  尺寸: ${request.size}`);
  
  // 模擬異步生成過程
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // 返回模擬的圖像URL
  return `https://generated-assets.example.com/${request.gameTemplate}/${request.name.replace(/\s+/g, '_').toLowerCase()}.png`;
}

/**
 * 保存生成的圖像到本地存儲
 */
async function saveGeneratedImage(imageUrl: string, localPath: string): Promise<boolean> {
  try {
    // TODO: 實現圖像下載和保存邏輯
    console.log(`💾 保存圖像: ${imageUrl} -> ${localPath}`);
    return true;
  } catch (error) {
    console.error('保存圖像失敗:', error);
    return false;
  }
}
