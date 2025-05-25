import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import VersionCompare from '../../components/editor/VersionCompare';
import { toast } from 'react-hot-toast';

// 模擬版本數據
const mockVersionA = {
  id: 'v1',
  versionNumber: 1,
  createdAt: '2023-10-01T10:00:00Z',
  createdBy: 'user1',
  createdByUser: {
    name: '張三'
  },
  description: '初始版本',
  content: {
    title: '數學練習',
    description: '基礎數學練習題',
    elements: [
      { id: 'e1', type: 'question', content: '1+1=?' },
      { id: 'e2', type: 'question', content: '2+2=?' }
    ],
    settings: {
      timeLimit: 10,
      showFeedback: true
    },
    metadata: {
      subject: '數學',
      grade: '一年級'
    }
  }
};

const mockVersionB = {
  id: 'v2',
  versionNumber: 2,
  createdAt: '2023-10-05T14:30:00Z',
  createdBy: 'user2',
  createdByUser: {
    name: '李四'
  },
  description: '更新了題目和設置',
  content: {
    title: '數學能力測驗',
    description: '小學一年級數學能力測驗',
    elements: [
      { id: 'e1', type: 'question', content: '1+1=?' },
      { id: 'e2', type: 'question', content: '2+2=?' },
      { id: 'e3', type: 'question', content: '3+3=?' }
    ],
    settings: {
      timeLimit: 15,
      showFeedback: true,
      allowRetry: true
    },
    metadata: {
      subject: '數學',
      grade: '一年級',
      difficulty: '簡單'
    }
  }
};

// 計算差異
const calculateDifferences = (versionA: any, versionB: any) => {
  const differences: any[] = [];
  
  // 遞歸比較對象
  const compareObjects = (objA: any, objB: any, path = '') => {
    const allKeys = new Set([...Object.keys(objA), ...Object.keys(objB)]);
    
    allKeys.forEach(key => {
      const valueA = objA[key];
      const valueB = objB[key];
      const currentPath = path ? `${path}.${key}` : key;
      
      // 如果兩個值都是對象，則遞歸比較
      if (
        valueA && typeof valueA === 'object' && !Array.isArray(valueA) &&
        valueB && typeof valueB === 'object' && !Array.isArray(valueB)
      ) {
        compareObjects(valueA, valueB, currentPath);
      } 
      // 如果兩個值都是數組，則比較數組內容
      else if (Array.isArray(valueA) && Array.isArray(valueB)) {
        if (JSON.stringify(valueA) !== JSON.stringify(valueB)) {
          differences.push({
            field: currentPath,
            valueA,
            valueB
          });
        }
      }
      // 否則直接比較值
      else if (JSON.stringify(valueA) !== JSON.stringify(valueB)) {
        differences.push({
          field: currentPath,
          valueA,
          valueB
        });
      }
    });
  };
  
  compareObjects(versionA.content, versionB.content, 'content');
  return differences;
};

export default function VersionCompareExample() {
  const router = useRouter();
  const [differences, setDifferences] = useState<any[]>([]);
  
  // 計算差異
  useEffect(() => {
    const diffs = calculateDifferences(mockVersionA, mockVersionB);
    setDifferences(diffs);
  }, []);
  
  // 模擬版本恢復功能
  const handleRestore = async (versionId: string) => {
    // 模擬API調用
    return new Promise<boolean>((resolve) => {
      setTimeout(() => {
        toast.success(`已恢復到版本ID: ${versionId}`);
        resolve(true);
      }, 1500);
    });
  };
  
  return (
    <div>
      <Head>
        <title>版本比較示例 | EduCreate</title>
      </Head>
      
      <VersionCompare 
        versionA={mockVersionA}
        versionB={mockVersionB}
        differences={differences}
        onClose={() => router.push('/dashboard')}
        onRestore={handleRestore}
      />
    </div>
  );
}