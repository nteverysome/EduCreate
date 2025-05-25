import { create } from 'zustand';
import { Activity } from './editorStore';

// 搜索类型
type SearchType = 'all' | 'matching' | 'flashcards' | 'quiz';

// 标签类型
type Tag = string;

// 搜索状态接口
interface SearchState {
  // 搜索查询
  searchQuery: string;
  // 选中的活动类型
  selectedType: SearchType;
  // 选中的标签
  selectedTags: Tag[];
  // 搜索结果数据
  data: Activity[];
  
  // 设置搜索查询
  setSearchQuery: (query: string) => void;
  // 设置选中的类型
  setSelectedType: (type: SearchType) => void;
  // 设置选中的标签
  setSelectedTags: (tags: Tag[]) => void;
  // 添加标签
  addTag: (tag: Tag) => void;
  // 移除标签
  removeTag: (tag: Tag) => void;
  // 执行搜索
  search: () => Promise<void>;
}

// 创建搜索状态存储
export const useSearchStore = create<SearchState>((set, get) => ({
  searchQuery: '',
  selectedType: 'all',
  selectedTags: [],
  data: [],
  
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  setSelectedType: (type) => set({ selectedType: type }),
  
  setSelectedTags: (tags) => set({ selectedTags: tags }),
  
  addTag: (tag) => {
    const { selectedTags } = get();
    if (!selectedTags.includes(tag)) {
      set({ selectedTags: [...selectedTags, tag] });
    }
  },
  
  removeTag: (tag) => {
    const { selectedTags } = get();
    set({ selectedTags: selectedTags.filter(t => t !== tag) });
  },
  
  search: async () => {
    const { searchQuery, selectedType, selectedTags } = get();
    
    try {
      // 构建查询参数
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append('q', searchQuery);
      }
      if (selectedType !== 'all') {
        params.append('type', selectedType);
      }
      if (selectedTags.length > 0) {
        selectedTags.forEach(tag => params.append('tags', tag));
      }
      
      // 发送API请求
      const response = await fetch(`/api/activities/search?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('搜索失败');
      }
      
      const result = await response.json();
      set({ data: result });
    } catch (error) {
      console.error('搜索活动失败:', error);
      set({ data: [] });
    }
  }
}));

// 导出类型
export type { SearchType, Tag };

// 确保文件是一个模块
export {};