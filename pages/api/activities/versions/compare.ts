import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getSession({ req });
  
  // 檢查用戶是否已登入
  if (!session || !session.user) {
    return res.status(401).json({ error: '未授權' });
  }
  
  // 只允許GET請求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: '方法不允許' });
  }
  
  try {
    const { versionA, versionB } = req.query;
    
    if (!versionA || !versionB || typeof versionA !== 'string' || typeof versionB !== 'string') {
      return res.status(400).json({ error: '缺少必要的版本ID參數' });
    }
    
    // 獲取兩個版本的詳情
    const [versionAData, versionBData] = await Promise.all([
      prisma.activityVersion.findUnique({
        where: { id: versionA },
        include: {
          activity: {
            select: {
              id: true,
              userId: true,
              title: true
            }
          },
          user: {
            select: {
              name: true
            }
          }
        }
      }),
      prisma.activityVersion.findUnique({
        where: { id: versionB },
        include: {
          activity: {
            select: {
              id: true,
              userId: true,
              title: true
            }
          },
          user: {
            select: {
              name: true
            }
          }
        }
      })
    ]);
    
    // 檢查版本是否存在
    if (!versionAData || !versionBData) {
      return res.status(404).json({ error: '一個或多個版本不存在' });
    }
    
    // 檢查兩個版本是否屬於同一個活動
    if (versionAData.activityId !== versionBData.activityId) {
      return res.status(400).json({ error: '無法比較不同活動的版本' });
    }
    
    // 檢查用戶是否有權限訪問這些版本
    if (versionAData.activity.userId !== session.user.id) {
      return res.status(403).json({ error: '無權訪問這些版本' });
    }
    
    // 比較兩個版本的差異
    const differences = compareVersions(versionAData, versionBData);
    
    return res.status(200).json({
      versionA: versionAData,
      versionB: versionBData,
      differences
    });
  } catch (error) {
    console.error('比較版本失敗:', error);
    return res.status(500).json({ error: '比較版本失敗' });
  }
}

// 比較兩個版本的差異
function compareVersions(versionA: any, versionB: any) {
  const differences = [];
  
  // 比較基本信息
  if (versionA.versionNumber !== versionB.versionNumber) {
    differences.push({
      field: 'versionNumber',
      valueA: versionA.versionNumber,
      valueB: versionB.versionNumber
    });
  }
  
  // 比較內容差異
  const contentA = versionA.content;
  const contentB = versionB.content;
  
  // 遞歸比較對象
  function compareObjects(objA: any, objB: any, path = '') {
    const allKeys = new Set([...Object.keys(objA || {}), ...Object.keys(objB || {})]);
    
    allKeys.forEach(key => {
      const valueA = objA?.[key];
      const valueB = objB?.[key];
      const currentPath = path ? `${path}.${key}` : key;
      
      // 如果值類型不同或值不同
      if (typeof valueA !== typeof valueB) {
        differences.push({
          field: currentPath,
          typeA: typeof valueA,
          typeB: typeof valueB,
          valueA,
          valueB
        });
      } else if (typeof valueA === 'object' && valueA !== null && valueB !== null) {
        // 遞歸比較對象
        compareObjects(valueA, valueB, currentPath);
      } else if (JSON.stringify(valueA) !== JSON.stringify(valueB)) {
        differences.push({
          field: currentPath,
          valueA,
          valueB
        });
      }
    });
  }
  
  compareObjects(contentA, contentB, 'content');
  
  return differences;
}