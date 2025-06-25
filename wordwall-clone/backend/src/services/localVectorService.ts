import fs from 'fs';
import path from 'path';
import { trackError } from '../utils/langfuse';

interface VectorDocument {
  id: string;
  title: string;
  description: string;
  content: string;
  templateType: string;
  subject: string;
  difficulty: string;
  tags: string[];
  createdBy: string;
  createdAt: string;
  vector?: number[];
}

interface SearchResult {
  id: string;
  title: string;
  description: string;
  templateType: string;
  subject: string;
  score: number;
  distance: number;
}

/**
 * 本地向量搜索服務
 * 
 * 功能：
 * - 基於關鍵詞的語義搜索
 * - 文本相似度計算
 * - 本地存儲（不需要外部服務）
 * - 智能推薦算法
 */
export class LocalVectorService {
  private documents: Map<string, VectorDocument> = new Map();
  private dataPath: string;
  private stopWords: Set<string>;

  constructor() {
    this.dataPath = path.join(process.cwd(), 'data', 'vector-store.json');
    this.stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
      'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those',
      '的', '是', '在', '有', '和', '與', '或', '但', '也', '都', '很', '更', '最', '可以', '能夠'
    ]);
    
    this.loadDocuments();
  }

  /**
   * 載入文檔
   */
  private loadDocuments(): void {
    try {
      if (fs.existsSync(this.dataPath)) {
        const data = fs.readFileSync(this.dataPath, 'utf8');
        const docs = JSON.parse(data);
        
        docs.forEach((doc: VectorDocument) => {
          this.documents.set(doc.id, doc);
        });
        
        console.log(`Loaded ${this.documents.size} documents from local vector store`);
      } else {
        console.log('No existing vector store found, starting fresh');
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
    }
  }

  /**
   * 保存文檔
   */
  private saveDocuments(): void {
    try {
      const docs = Array.from(this.documents.values());
      const dir = path.dirname(this.dataPath);
      
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(this.dataPath, JSON.stringify(docs, null, 2));
    } catch (error) {
      console.error('Failed to save documents:', error);
    }
  }

  /**
   * 文本預處理
   */
  private preprocessText(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s\u4e00-\u9fff]/g, ' ') // 保留中文字符
      .split(/\s+/)
      .filter(word => word.length > 1 && !this.stopWords.has(word));
  }

  /**
   * 計算 TF-IDF 向量
   */
  private calculateTFIDF(text: string): Map<string, number> {
    const words = this.preprocessText(text);
    const wordCount = new Map<string, number>();
    
    // 計算詞頻 (TF)
    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });

    // 計算文檔頻率 (DF)
    const docFreq = new Map<string, number>();
    this.documents.forEach(doc => {
      const docWords = new Set(this.preprocessText(doc.content + ' ' + doc.title + ' ' + doc.description));
      docWords.forEach(word => {
        docFreq.set(word, (docFreq.get(word) || 0) + 1);
      });
    });

    // 計算 TF-IDF
    const tfidf = new Map<string, number>();
    const totalDocs = this.documents.size || 1;
    
    wordCount.forEach((tf, word) => {
      const df = docFreq.get(word) || 1;
      const idf = Math.log(totalDocs / df);
      tfidf.set(word, (tf / words.length) * idf);
    });

    return tfidf;
  }

  /**
   * 計算餘弦相似度
   */
  private cosineSimilarity(vec1: Map<string, number>, vec2: Map<string, number>): number {
    const keys1 = new Set(vec1.keys());
    const keys2 = new Set(vec2.keys());
    const commonKeys = new Set([...keys1].filter(k => keys2.has(k)));

    if (commonKeys.size === 0) return 0;

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    commonKeys.forEach(key => {
      const val1 = vec1.get(key) || 0;
      const val2 = vec2.get(key) || 0;
      dotProduct += val1 * val2;
    });

    vec1.forEach(val => norm1 += val * val);
    vec2.forEach(val => norm2 += val * val);

    norm1 = Math.sqrt(norm1);
    norm2 = Math.sqrt(norm2);

    return norm1 && norm2 ? dotProduct / (norm1 * norm2) : 0;
  }

  /**
   * 添加文檔
   */
  async addDocument(doc: Omit<VectorDocument, 'vector'>): Promise<boolean> {
    try {
      const document: VectorDocument = {
        ...doc,
        vector: [], // 暫時不使用數值向量
      };

      this.documents.set(doc.id, document);
      this.saveDocuments();

      console.log(`Document ${doc.id} added to local vector store`);
      return true;
    } catch (error) {
      console.error('Failed to add document:', error);
      await trackError(error as Error, {
        action: 'local_vector_add_document',
        documentId: doc.id,
      });
      return false;
    }
  }

  /**
   * 搜索文檔
   */
  async searchDocuments(
    query: string,
    limit: number = 10,
    filters?: {
      templateType?: string;
      subject?: string;
      difficulty?: string;
      createdBy?: string;
    }
  ): Promise<SearchResult[]> {
    try {
      const queryVector = this.calculateTFIDF(query);
      const results: SearchResult[] = [];

      this.documents.forEach((doc) => {
        // 應用過濾器
        if (filters) {
          if (filters.templateType && doc.templateType !== filters.templateType) return;
          if (filters.subject && doc.subject !== filters.subject) return;
          if (filters.difficulty && doc.difficulty !== filters.difficulty) return;
          if (filters.createdBy && doc.createdBy !== filters.createdBy) return;
        }

        // 計算相似度
        const docText = `${doc.title} ${doc.description} ${doc.content}`;
        const docVector = this.calculateTFIDF(docText);
        const similarity = this.cosineSimilarity(queryVector, docVector);

        if (similarity > 0) {
          results.push({
            id: doc.id,
            title: doc.title,
            description: doc.description,
            templateType: doc.templateType,
            subject: doc.subject,
            score: similarity,
            distance: 1 - similarity,
          });
        }
      });

      // 按相似度排序並限制結果數量
      results.sort((a, b) => b.score - a.score);
      return results.slice(0, limit);
    } catch (error) {
      console.error('Failed to search documents:', error);
      await trackError(error as Error, {
        action: 'local_vector_search',
        query,
        filters,
      });
      return [];
    }
  }

  /**
   * 獲取相似文檔
   */
  async getSimilarDocuments(documentId: string, limit: number = 5): Promise<SearchResult[]> {
    try {
      const targetDoc = this.documents.get(documentId);
      if (!targetDoc) return [];

      const targetText = `${targetDoc.title} ${targetDoc.description} ${targetDoc.content}`;
      const targetVector = this.calculateTFIDF(targetText);
      const results: SearchResult[] = [];

      this.documents.forEach((doc) => {
        if (doc.id === documentId) return; // 排除自己

        const docText = `${doc.title} ${doc.description} ${doc.content}`;
        const docVector = this.calculateTFIDF(docText);
        const similarity = this.cosineSimilarity(targetVector, docVector);

        if (similarity > 0) {
          results.push({
            id: doc.id,
            title: doc.title,
            description: doc.description,
            templateType: doc.templateType,
            subject: doc.subject,
            score: similarity,
            distance: 1 - similarity,
          });
        }
      });

      results.sort((a, b) => b.score - a.score);
      return results.slice(0, limit);
    } catch (error) {
      console.error('Failed to get similar documents:', error);
      await trackError(error as Error, {
        action: 'local_vector_get_similar',
        documentId,
      });
      return [];
    }
  }

  /**
   * 獲取推薦
   */
  async getRecommendations(
    userId: string,
    userPreferences: {
      subjects?: string[];
      templateTypes?: string[];
      difficulty?: string;
    },
    limit: number = 10
  ): Promise<SearchResult[]> {
    try {
      // 構建推薦查詢
      const queryTerms = [];
      
      if (userPreferences.subjects?.length) {
        queryTerms.push(...userPreferences.subjects);
      }
      
      if (userPreferences.templateTypes?.length) {
        queryTerms.push(...userPreferences.templateTypes);
      }

      if (userPreferences.difficulty) {
        queryTerms.push(userPreferences.difficulty);
      }

      if (queryTerms.length === 0) {
        queryTerms.push('educational', 'learning', 'interactive');
      }

      const query = queryTerms.join(' ');
      
      // 搜索並排除用戶自己創建的內容
      const results = await this.searchDocuments(query, limit * 2);
      
      return results
        .filter(result => {
          const doc = this.documents.get(result.id);
          return doc && doc.createdBy !== userId;
        })
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      await trackError(error as Error, {
        action: 'local_vector_get_recommendations',
        userId,
        userPreferences,
      });
      return [];
    }
  }

  /**
   * 更新文檔
   */
  async updateDocument(documentId: string, updates: Partial<VectorDocument>): Promise<boolean> {
    try {
      const existingDoc = this.documents.get(documentId);
      if (!existingDoc) return false;

      const updatedDoc = { ...existingDoc, ...updates };
      this.documents.set(documentId, updatedDoc);
      this.saveDocuments();

      console.log(`Document ${documentId} updated in local vector store`);
      return true;
    } catch (error) {
      console.error('Failed to update document:', error);
      await trackError(error as Error, {
        action: 'local_vector_update_document',
        documentId,
      });
      return false;
    }
  }

  /**
   * 刪除文檔
   */
  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      const deleted = this.documents.delete(documentId);
      if (deleted) {
        this.saveDocuments();
        console.log(`Document ${documentId} deleted from local vector store`);
      }
      return deleted;
    } catch (error) {
      console.error('Failed to delete document:', error);
      await trackError(error as Error, {
        action: 'local_vector_delete_document',
        documentId,
      });
      return false;
    }
  }

  /**
   * 獲取統計信息
   */
  async getStats(): Promise<{
    totalDocuments: number;
    byTemplateType: Record<string, number>;
    bySubject: Record<string, number>;
  }> {
    try {
      const byTemplateType: Record<string, number> = {};
      const bySubject: Record<string, number> = {};

      this.documents.forEach(doc => {
        byTemplateType[doc.templateType] = (byTemplateType[doc.templateType] || 0) + 1;
        bySubject[doc.subject] = (bySubject[doc.subject] || 0) + 1;
      });

      return {
        totalDocuments: this.documents.size,
        byTemplateType,
        bySubject,
      };
    } catch (error) {
      console.error('Failed to get stats:', error);
      await trackError(error as Error, {
        action: 'local_vector_get_stats',
      });
      return {
        totalDocuments: 0,
        byTemplateType: {},
        bySubject: {},
      };
    }
  }
}

export default LocalVectorService;
