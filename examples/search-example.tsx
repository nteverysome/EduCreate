import React, { useEffect } from 'react';
import { useSearchStore } from '../store/searchStore';

// 这个示例文件展示了如何使用searchStore来解决TypeScript错误
// 这解决了Untitled文件中的变量未定义错误

const SearchExample: React.FC = () => {
  // 从搜索存储中获取状态和方法
  const { 
    searchQuery, 
    setSearchQuery,
    selectedType,
    setSelectedType,
    selectedTags,
    setSelectedTags,
    addTag,
    removeTag,
    data,
    search 
  } = useSearchStore();
  
  // 组件加载时执行搜索
  useEffect(() => {
    // 这里使用了顶层await，需要确保文件是一个模块
    // 通过在searchStore.ts中添加export {}解决了这个问题
    search();
  }, []);
  
  return (
    <div>
      <h1>搜索示例</h1>
      
      {/* 搜索输入框 */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="搜索活动..."
      />
      
      {/* 类型选择 */}
      <select
        value={selectedType}
        onChange={(e) => setSelectedType(e.target.value as any)}
      >
        <option value="all">全部</option>
        <option value="matching">配对</option>
        <option value="flashcards">抽认卡</option>
        <option value="quiz">测验</option>
      </select>
      
      {/* 标签显示 */}
      <div>
        <p>已选标签:</p>
        {selectedTags.map(tag => (
          <span key={tag}>
            {tag}
            <button onClick={() => removeTag(tag)}>×</button>
          </span>
        ))}
      </div>
      
      {/* 搜索按钮 */}
      <button onClick={() => search()}>搜索</button>
      
      {/* 搜索结果 */}
      <div>
        <h2>搜索结果 ({data.length})</h2>
        {data.map(activity => (
          <div key={activity.id}>
            <h3>{activity.title}</h3>
            <p>{activity.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchExample;