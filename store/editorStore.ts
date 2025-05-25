import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

// 編輯器元素類型
export interface EditorElement {
  id: string;
  type: 'text' | 'image' | 'question' | 'answer' | 'card' | 'quiz-item' | 'h5p';
  content: string;
  position: { x: number; y: number };
  size?: { width: number; height: number };
  properties?: Record<string, any>;
}

// 活動類型
export interface Activity {
  id: string;
  title: string;
  description: string;
  type: 'matching' | 'flashcards' | 'quiz';
  elements: EditorElement[];
  templateId?: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// 編輯器狀態
interface EditorState {
  // 當前編輯的活動
  currentActivity: Activity | null;
  // 選中的元素ID
  selectedElementId: string | null;
  // 歷史記錄 (用於撤銷/重做)
  history: Activity[];
  historyIndex: number;
  // 是否有未保存的更改
  isDirty: boolean;
  // 預覽模式
  previewMode: boolean;
  // 上次保存時間
  lastSaveTime: Date | null;
  // 是否正在自動保存
  isAutoSaving: boolean;
  // 版本控制
  isVersionSaving: boolean;
  versionDescription: string;
  
  // 活動操作
  createActivity: (type: Activity['type'], templateId?: string) => void;
  updateActivity: (data: Partial<Activity>) => void;
  saveActivity: () => Promise<boolean>;
  publishActivity: () => Promise<boolean>;
  loadActivity: (id: string) => Promise<boolean>;
  saveVersion: (description?: string) => Promise<boolean>;
  viewVersionHistory: () => void;
  
  // 元素操作
  addElement: (element: Omit<EditorElement, 'id'>) => void;
  updateElement: (id: string, data: Partial<EditorElement>) => void;
  removeElement: (id: string) => void;
  selectElement: (id: string | null) => void;
  moveElement: (id: string, position: { x: number; y: number }) => void;
  resizeElement: (id: string, size: { width: number; height: number }) => void;
  
  // 歷史記錄操作
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;
  
  // 預覽操作
  togglePreviewMode: () => void;
  
  // 將編輯器數據轉換為遊戲數據
  generateGameData: () => any;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  // 初始狀態
  currentActivity: null,
  selectedElementId: null,
  history: [],
  historyIndex: -1,
  isDirty: false,
  previewMode: false,
  lastSaveTime: null,
  isAutoSaving: false,
  isVersionSaving: false,
  versionDescription: '',
  
  // 活動操作
  createActivity: (type, templateId) => {
    const newActivity: Activity = {
      id: uuidv4(),
      title: '未命名活動',
      description: '',
      type,
      elements: [],
      templateId,
      published: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    set({
      currentActivity: newActivity,
      selectedElementId: null,
      history: [newActivity],
      historyIndex: 0,
      isDirty: true
    });
  },
  
  updateActivity: (data) => {
    const { currentActivity } = get();
    if (!currentActivity) return;
    
    const updatedActivity = {
      ...currentActivity,
      ...data,
      updatedAt: new Date()
    };
    
    set({
      currentActivity: updatedActivity,
      isDirty: true
    });
    
    get().saveToHistory();
    
    // 觸發自動保存
    const autoSave = async () => {
      const { isDirty, isAutoSaving } = get();
      if (isDirty && !isAutoSaving) {
        set({ isAutoSaving: true });
        await get().saveActivity();
      }
    };
    
    // 延遲2秒後自動保存
    setTimeout(autoSave, 2000);
  },
  
  // 保存活動
  saveActivity: async () => {
    const { currentActivity, isDirty } = get();
    
    if (!currentActivity || !isDirty) {
      return false;
    }
    
    try {
      set({ isAutoSaving: true });
      
      const response = await fetch(`/api/activities/${currentActivity.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(currentActivity),
      });
      
      if (!response.ok) {
        throw new Error('保存失敗');
      }
      
      const savedActivity = await response.json();
      
      set({
        currentActivity: savedActivity,
        isDirty: false,
        lastSaveTime: new Date(),
      });
      
      return true;
    } catch (error) {
      console.error('保存活動失敗:', error);
      return false;
    } finally {
      set({ isAutoSaving: false });
    }
  },
  
  // 保存活動版本
  saveVersion: async (description?: string) => {
    const { currentActivity } = get();
    
    if (!currentActivity) {
      return false;
    }
    
    try {
      set({ isVersionSaving: true });
      
      // 先保存當前活動
      await get().saveActivity();
      
      // 創建新版本
      const response = await fetch(`/api/activities/${currentActivity.id}/versions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: description || `版本 ${new Date().toLocaleString()}`,
        }),
      });
      
      if (!response.ok) {
        throw new Error('創建版本失敗');
      }
      
      set({ versionDescription: '' });
      return true;
    } catch (error) {
      console.error('保存版本失敗:', error);
      return false;
    } finally {
      set({ isVersionSaving: false });
    }
  },
  
  // 查看版本歷史
  viewVersionHistory: () => {
    const { currentActivity } = get();
    
    if (currentActivity) {
      window.location.href = `/compare?activityId=${currentActivity.id}`;
    }
  },
  
  publishActivity: async () => {
    const { currentActivity, saveActivity } = get();
    if (!currentActivity) return false;
    
    try {
      // 先保存活動
      const saved = await saveActivity();
      if (!saved) return false;
      
      // 調用發布API
      const response = await fetch(`/api/activities/${currentActivity.id}?action=publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) throw new Error('發布失敗');
      
      const publishedActivity = await response.json();
      
      // 更新發布狀態
      set({
        currentActivity: publishedActivity,
        isDirty: false
      })
      
      // 這裡將來需要實現API調用發布活動
      // const response = await fetch(`/api/activities/${currentActivity.id}/publish`, {
      //   method: 'POST'
      // });
      // if (!response.ok) throw new Error('發布失敗');
      
      return true;
    } catch (error) {
      console.error('發布活動失敗:', error);
      return false;
    }
  },
  
  loadActivity: async (id: string) => {
    try {
      const response = await fetch(`/api/activities/${id}`);
      
      if (!response.ok) throw new Error('加載活動失敗');
      
      const activity = await response.json();
      
      set({
        currentActivity: activity,
        selectedElementId: null,
        history: [activity],
        historyIndex: 0,
        isDirty: false,
        previewMode: false
      });
      
      return true;
    } catch (error) {
      console.error('加載活動失敗:', error);
      return false;
    }
  },
  
  // 元素操作
  addElement: (elementData) => {
    const { currentActivity } = get();
    if (!currentActivity) return;
    
    const newElement: EditorElement = {
      id: uuidv4(),
      ...elementData
    };
    
    set(state => ({
      currentActivity: state.currentActivity ? {
        ...state.currentActivity,
        elements: [...state.currentActivity.elements, newElement],
        updatedAt: new Date()
      } : null,
      selectedElementId: newElement.id,
      isDirty: true
    }));
    
    get().saveToHistory();
  },
  
  updateElement: (id, data) => {
    const { currentActivity } = get();
    if (!currentActivity) return;
    
    set(state => ({
      currentActivity: state.currentActivity ? {
        ...state.currentActivity,
        elements: state.currentActivity.elements.map(el =>
          el.id === id ? { ...el, ...data } : el
        ),
        updatedAt: new Date()
      } : null,
      isDirty: true
    }));
    
    get().saveToHistory();
  },
  
  removeElement: (id) => {
    const { currentActivity, selectedElementId } = get();
    if (!currentActivity) return;
    
    set(state => ({
      currentActivity: state.currentActivity ? {
        ...state.currentActivity,
        elements: state.currentActivity.elements.filter(el => el.id !== id),
        updatedAt: new Date()
      } : null,
      selectedElementId: selectedElementId === id ? null : selectedElementId,
      isDirty: true
    }));
    
    get().saveToHistory();
  },
  
  selectElement: (id) => {
    set({ selectedElementId: id });
  },
  
  moveElement: (id, position) => {
    const { updateElement } = get();
    updateElement(id, { position });
  },
  
  resizeElement: (id, size) => {
    const { updateElement } = get();
    updateElement(id, { size });
  },
  
  // 歷史記錄操作
  saveToHistory: () => {
    const { currentActivity, history, historyIndex } = get();
    if (!currentActivity) return;
    
    // 刪除當前索引之後的歷史記錄
    const newHistory = history.slice(0, historyIndex + 1);
    
    // 添加新的歷史記錄
    newHistory.push({ ...currentActivity });
    
    // 如果歷史記錄超過50條，刪除最舊的記錄
    if (newHistory.length > 50) {
      newHistory.shift();
    }
    
    set({
      history: newHistory,
      historyIndex: newHistory.length - 1
    });
  },
  
  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex <= 0) return;
    
    const newIndex = historyIndex - 1;
    set({
      currentActivity: { ...history[newIndex] },
      historyIndex: newIndex,
      isDirty: true
    });
  },
  
  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex >= history.length - 1) return;
    
    const newIndex = historyIndex + 1;
    set({
      currentActivity: { ...history[newIndex] },
      historyIndex: newIndex,
      isDirty: true
    });
  },
  
  // 預覽操作
  togglePreviewMode: () => {
    set(state => ({ previewMode: !state.previewMode }));
  },
  
  // 將編輯器數據轉換為遊戲數據
  generateGameData: () => {
    const { currentActivity } = get();
    if (!currentActivity) return null;
    
    // 處理H5P元素
    // 修改類型定義以包含h5p類型
    const h5pElements = currentActivity.elements.filter(el => el.type === 'h5p').map(el => ({
      id: el.id,
      contentId: el.properties?.contentId,
      title: el.content,
      contentType: el.properties?.contentType,
      position: el.position,
      size: el.size
    }));
    
    switch (currentActivity.type) {
      case 'matching': {
        const questions = currentActivity.elements
          .filter(el => el.type === 'question')
          .map(el => ({
            id: el.id,
            content: el.content
          }));
        
        const answers = currentActivity.elements
          .filter(el => el.type === 'answer')
          .map(el => ({
            id: el.id,
            content: el.content
          }));
        
        return {
          title: currentActivity.title,
          description: currentActivity.description,
          questions,
          answers
        };
      }
      
      case 'flashcards': {
        const cards = currentActivity.elements
          .filter(el => el.type === 'card')
          .map(el => ({
            id: el.id,
            front: el.content,
            back: el.properties?.back || '',
            tags: el.properties?.tags || []
          }));
        
        return {
          title: currentActivity.title,
          description: currentActivity.description,
          cards
        };
      }
      
      case 'quiz': {
        const questions = currentActivity.elements
          .filter(el => el.type === 'quiz-item')
          .map(el => ({
            id: el.id,
            question: el.content,
            options: el.properties?.options || [],
            correctAnswer: el.properties?.correctAnswer || 0,
            explanation: el.properties?.explanation || ''
          }));
        
        return {
          title: currentActivity.title,
          description: currentActivity.description,
          questions
        };
      }
      
      default:
        return null;
    }
  }
}));