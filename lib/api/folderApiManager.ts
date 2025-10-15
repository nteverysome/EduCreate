/**
 * 资料夹 API 调用统一管理器
 * 解决前端 API 调用不一致的问题，确保所有调用都使用正确的 type 参数
 */

export type FolderType = 'activities' | 'results';

export interface FolderData {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  activityCount?: number;
  resultCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateFolderRequest {
  name: string;
  color?: string;
  description?: string;
  icon?: string;
}

/**
 * 统一的资料夹 API 调用管理器
 * 确保所有 API 调用都使用正确的 type 参数
 */
export class FolderApiManager {
  private static instance: FolderApiManager;
  
  public static getInstance(): FolderApiManager {
    if (!FolderApiManager.instance) {
      FolderApiManager.instance = new FolderApiManager();
    }
    return FolderApiManager.instance;
  }

  /**
   * 获取指定类型的资料夹列表
   */
  async getFolders(type: FolderType): Promise<FolderData[]> {
    console.log(`🔍 [FolderApiManager] 获取 ${type} 类型的资料夹`);
    
    try {
      const response = await fetch(`/api/folders?type=${type}`);
      
      if (!response.ok) {
        throw new Error(`获取资料夹失败: ${response.status}`);
      }
      
      const folders = await response.json();
      console.log(`✅ [FolderApiManager] 成功获取 ${folders.length} 个 ${type} 资料夹`);
      
      return folders;
    } catch (error) {
      console.error(`❌ [FolderApiManager] 获取 ${type} 资料夹失败:`, error);
      throw error;
    }
  }

  /**
   * 创建新资料夹
   */
  async createFolder(type: FolderType, data: CreateFolderRequest): Promise<FolderData> {
    console.log(`🔍 [FolderApiManager] 创建 ${type} 类型的资料夹:`, data.name);
    
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          type: type
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '创建资料夹失败');
      }

      const newFolder = await response.json();
      console.log(`✅ [FolderApiManager] 成功创建 ${type} 资料夹:`, newFolder.name);
      
      return newFolder;
    } catch (error) {
      console.error(`❌ [FolderApiManager] 创建 ${type} 资料夹失败:`, error);
      throw error;
    }
  }

  /**
   * 删除资料夹
   */
  async deleteFolder(folderId: string): Promise<void> {
    console.log(`🔍 [FolderApiManager] 删除资料夹:`, folderId);
    
    try {
      const response = await fetch(`/api/folders?id=${folderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '删除资料夹失败');
      }

      console.log(`✅ [FolderApiManager] 成功删除资料夹:`, folderId);
    } catch (error) {
      console.error(`❌ [FolderApiManager] 删除资料夹失败:`, error);
      throw error;
    }
  }

  /**
   * 更新资料夹
   */
  async updateFolder(folderId: string, data: Partial<CreateFolderRequest>): Promise<FolderData> {
    console.log(`🔍 [FolderApiManager] 更新资料夹:`, folderId);
    
    try {
      const response = await fetch(`/api/folders/${folderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '更新资料夹失败');
      }

      const updatedFolder = await response.json();
      console.log(`✅ [FolderApiManager] 成功更新资料夹:`, updatedFolder.name);
      
      return updatedFolder;
    } catch (error) {
      console.error(`❌ [FolderApiManager] 更新资料夹失败:`, error);
      throw error;
    }
  }
}

/**
 * 便捷的导出函数
 */
export const folderApi = FolderApiManager.getInstance();

/**
 * React Hook 用于资料夹管理
 */
export function useFolderApi(type: FolderType) {
  const api = FolderApiManager.getInstance();
  
  return {
    getFolders: () => api.getFolders(type),
    createFolder: (data: CreateFolderRequest) => api.createFolder(type, data),
    deleteFolder: (folderId: string) => api.deleteFolder(folderId),
    updateFolder: (folderId: string, data: Partial<CreateFolderRequest>) => 
      api.updateFolder(folderId, data),
  };
}
