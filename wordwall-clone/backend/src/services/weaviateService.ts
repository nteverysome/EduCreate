import weaviate, { WeaviateClient, ApiKey } from 'weaviate-ts-client';
import { trackError } from '../utils/langfuse';

interface ActivityVector {
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
 * Weaviate 向量數據庫服務
 * 
 * 功能：
 * - 語義搜索教育內容
 * - 智能推薦相關活動
 * - 內容分類和標籤
 * - 相似度匹配
 */
export class WeaviateService {
  private client: WeaviateClient;
  private className = 'EducationalActivity';

  constructor() {
    const weaviateUrl = process.env.WEAVIATE_URL || 'http://localhost:8080';
    const apiKey = process.env.WEAVIATE_API_KEY;

    this.client = weaviate.client({
      scheme: weaviateUrl.startsWith('https') ? 'https' : 'http',
      host: weaviateUrl.replace(/^https?:\/\//, ''),
      apiKey: apiKey ? new ApiKey(apiKey) : undefined,
    });

    this.initializeSchema();
  }

  /**
   * 初始化 Weaviate 模式
   */
  private async initializeSchema(): Promise<void> {
    try {
      // 檢查類是否已存在
      const exists = await this.client.schema
        .classGetter()
        .withClassName(this.className)
        .do();

      if (exists) {
        console.log(`Weaviate class ${this.className} already exists`);
        return;
      }

      // 創建類模式
      const classSchema = {
        class: this.className,
        description: 'Educational activities and content for semantic search',
        vectorizer: 'text2vec-openai', // 或使用其他向量化器
        moduleConfig: {
          'text2vec-openai': {
            model: 'ada',
            modelVersion: '002',
            type: 'text',
          },
        },
        properties: [
          {
            name: 'title',
            dataType: ['text'],
            description: 'Title of the educational activity',
            moduleConfig: {
              'text2vec-openai': {
                skip: false,
                vectorizePropertyName: false,
              },
            },
          },
          {
            name: 'description',
            dataType: ['text'],
            description: 'Description of the activity',
            moduleConfig: {
              'text2vec-openai': {
                skip: false,
                vectorizePropertyName: false,
              },
            },
          },
          {
            name: 'content',
            dataType: ['text'],
            description: 'Full content of the activity',
            moduleConfig: {
              'text2vec-openai': {
                skip: false,
                vectorizePropertyName: false,
              },
            },
          },
          {
            name: 'templateType',
            dataType: ['string'],
            description: 'Type of activity template (Quiz, MatchUp, etc.)',
          },
          {
            name: 'subject',
            dataType: ['string'],
            description: 'Subject area (Math, Science, Language, etc.)',
          },
          {
            name: 'difficulty',
            dataType: ['string'],
            description: 'Difficulty level (Beginner, Intermediate, Advanced)',
          },
          {
            name: 'tags',
            dataType: ['string[]'],
            description: 'Tags associated with the activity',
          },
          {
            name: 'createdBy',
            dataType: ['string'],
            description: 'ID of the user who created the activity',
          },
          {
            name: 'createdAt',
            dataType: ['date'],
            description: 'Creation timestamp',
          },
          {
            name: 'activityId',
            dataType: ['string'],
            description: 'Original activity ID from the main database',
          },
        ],
      };

      await this.client.schema.classCreator().withClass(classSchema).do();
      console.log(`Weaviate class ${this.className} created successfully`);
    } catch (error) {
      console.error('Failed to initialize Weaviate schema:', error);
      await trackError(error as Error, {
        action: 'weaviate_schema_init',
        service: 'WeaviateService',
      });
    }
  }

  /**
   * 添加活動到向量數據庫
   */
  async addActivity(activity: ActivityVector): Promise<string | null> {
    try {
      const result = await this.client.data
        .creator()
        .withClassName(this.className)
        .withProperties({
          title: activity.title,
          description: activity.description,
          content: activity.content,
          templateType: activity.templateType,
          subject: activity.subject,
          difficulty: activity.difficulty,
          tags: activity.tags,
          createdBy: activity.createdBy,
          createdAt: activity.createdAt,
          activityId: activity.id,
        })
        .do();

      console.log(`Activity ${activity.id} added to Weaviate with ID: ${result.id}`);
      return result.id;
    } catch (error) {
      console.error('Failed to add activity to Weaviate:', error);
      await trackError(error as Error, {
        action: 'weaviate_add_activity',
        activityId: activity.id,
      });
      return null;
    }
  }

  /**
   * 語義搜索活動
   */
  async searchActivities(
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
      let searchQuery = this.client.graphql
        .get()
        .withClassName(this.className)
        .withFields('title description templateType subject difficulty activityId _additional { certainty distance }')
        .withNearText({ concepts: [query] })
        .withLimit(limit);

      // 添加過濾器
      if (filters) {
        const whereFilter: any = { operator: 'And', operands: [] };

        if (filters.templateType) {
          whereFilter.operands.push({
            path: ['templateType'],
            operator: 'Equal',
            valueString: filters.templateType,
          });
        }

        if (filters.subject) {
          whereFilter.operands.push({
            path: ['subject'],
            operator: 'Equal',
            valueString: filters.subject,
          });
        }

        if (filters.difficulty) {
          whereFilter.operands.push({
            path: ['difficulty'],
            operator: 'Equal',
            valueString: filters.difficulty,
          });
        }

        if (filters.createdBy) {
          whereFilter.operands.push({
            path: ['createdBy'],
            operator: 'Equal',
            valueString: filters.createdBy,
          });
        }

        if (whereFilter.operands.length > 0) {
          searchQuery = searchQuery.withWhere(whereFilter);
        }
      }

      const result = await searchQuery.do();

      return result.data.Get[this.className].map((item: any) => ({
        id: item.activityId,
        title: item.title,
        description: item.description,
        templateType: item.templateType,
        subject: item.subject,
        score: item._additional.certainty,
        distance: item._additional.distance,
      }));
    } catch (error) {
      console.error('Failed to search activities in Weaviate:', error);
      await trackError(error as Error, {
        action: 'weaviate_search_activities',
        query,
        filters,
      });
      return [];
    }
  }

  /**
   * 獲取相似活動
   */
  async getSimilarActivities(
    activityId: string,
    limit: number = 5
  ): Promise<SearchResult[]> {
    try {
      // 首先獲取目標活動的向量
      const targetActivity = await this.client.graphql
        .get()
        .withClassName(this.className)
        .withFields('title description templateType subject')
        .withWhere({
          path: ['activityId'],
          operator: 'Equal',
          valueString: activityId,
        })
        .withLimit(1)
        .do();

      if (!targetActivity.data.Get[this.className]?.length) {
        return [];
      }

      const target = targetActivity.data.Get[this.className][0];

      // 使用標題和描述進行相似性搜索
      const searchText = `${target.title} ${target.description}`;
      
      const result = await this.client.graphql
        .get()
        .withClassName(this.className)
        .withFields('title description templateType subject activityId _additional { certainty distance }')
        .withNearText({ concepts: [searchText] })
        .withWhere({
          path: ['activityId'],
          operator: 'NotEqual',
          valueString: activityId,
        })
        .withLimit(limit)
        .do();

      return result.data.Get[this.className].map((item: any) => ({
        id: item.activityId,
        title: item.title,
        description: item.description,
        templateType: item.templateType,
        subject: item.subject,
        score: item._additional.certainty,
        distance: item._additional.distance,
      }));
    } catch (error) {
      console.error('Failed to get similar activities:', error);
      await trackError(error as Error, {
        action: 'weaviate_get_similar_activities',
        activityId,
      });
      return [];
    }
  }

  /**
   * 獲取推薦活動
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
      const concepts = [];
      
      if (userPreferences.subjects?.length) {
        concepts.push(...userPreferences.subjects);
      }
      
      if (userPreferences.templateTypes?.length) {
        concepts.push(...userPreferences.templateTypes);
      }

      if (userPreferences.difficulty) {
        concepts.push(userPreferences.difficulty);
      }

      if (concepts.length === 0) {
        concepts.push('educational', 'learning', 'interactive');
      }

      let searchQuery = this.client.graphql
        .get()
        .withClassName(this.className)
        .withFields('title description templateType subject difficulty activityId _additional { certainty }')
        .withNearText({ concepts })
        .withLimit(limit);

      // 排除用戶自己創建的活動
      searchQuery = searchQuery.withWhere({
        path: ['createdBy'],
        operator: 'NotEqual',
        valueString: userId,
      });

      const result = await searchQuery.do();

      return result.data.Get[this.className].map((item: any) => ({
        id: item.activityId,
        title: item.title,
        description: item.description,
        templateType: item.templateType,
        subject: item.subject,
        score: item._additional.certainty,
        distance: 0, // 不適用於推薦
      }));
    } catch (error) {
      console.error('Failed to get recommendations:', error);
      await trackError(error as Error, {
        action: 'weaviate_get_recommendations',
        userId,
        userPreferences,
      });
      return [];
    }
  }

  /**
   * 更新活動
   */
  async updateActivity(activityId: string, updates: Partial<ActivityVector>): Promise<boolean> {
    try {
      // 首先找到 Weaviate 中的對象 ID
      const existing = await this.client.graphql
        .get()
        .withClassName(this.className)
        .withFields('_additional { id }')
        .withWhere({
          path: ['activityId'],
          operator: 'Equal',
          valueString: activityId,
        })
        .withLimit(1)
        .do();

      if (!existing.data.Get[this.className]?.length) {
        console.log(`Activity ${activityId} not found in Weaviate`);
        return false;
      }

      const weaviateId = existing.data.Get[this.className][0]._additional.id;

      // 更新對象
      await this.client.data
        .updater()
        .withId(weaviateId)
        .withClassName(this.className)
        .withProperties(updates)
        .do();

      console.log(`Activity ${activityId} updated in Weaviate`);
      return true;
    } catch (error) {
      console.error('Failed to update activity in Weaviate:', error);
      await trackError(error as Error, {
        action: 'weaviate_update_activity',
        activityId,
      });
      return false;
    }
  }

  /**
   * 刪除活動
   */
  async deleteActivity(activityId: string): Promise<boolean> {
    try {
      const result = await this.client.batch
        .objectsBatchDeleter()
        .withClassName(this.className)
        .withWhere({
          path: ['activityId'],
          operator: 'Equal',
          valueString: activityId,
        })
        .do();

      console.log(`Activity ${activityId} deleted from Weaviate`);
      return true;
    } catch (error) {
      console.error('Failed to delete activity from Weaviate:', error);
      await trackError(error as Error, {
        action: 'weaviate_delete_activity',
        activityId,
      });
      return false;
    }
  }

  /**
   * 獲取統計信息
   */
  async getStats(): Promise<{
    totalActivities: number;
    byTemplateType: Record<string, number>;
    bySubject: Record<string, number>;
  }> {
    try {
      // 獲取總數
      const totalResult = await this.client.graphql
        .aggregate()
        .withClassName(this.className)
        .withFields('meta { count }')
        .do();

      const total = totalResult.data.Aggregate[this.className][0].meta.count;

      // 按模板類型分組
      const templateTypeResult = await this.client.graphql
        .aggregate()
        .withClassName(this.className)
        .withFields('templateType { count }')
        .withGroupBy(['templateType'])
        .do();

      const byTemplateType: Record<string, number> = {};
      templateTypeResult.data.Aggregate[this.className].forEach((item: any) => {
        byTemplateType[item.templateType] = item.meta.count;
      });

      // 按主題分組
      const subjectResult = await this.client.graphql
        .aggregate()
        .withClassName(this.className)
        .withFields('subject { count }')
        .withGroupBy(['subject'])
        .do();

      const bySubject: Record<string, number> = {};
      subjectResult.data.Aggregate[this.className].forEach((item: any) => {
        bySubject[item.subject] = item.meta.count;
      });

      return {
        totalActivities: total,
        byTemplateType,
        bySubject,
      };
    } catch (error) {
      console.error('Failed to get Weaviate stats:', error);
      await trackError(error as Error, {
        action: 'weaviate_get_stats',
      });
      return {
        totalActivities: 0,
        byTemplateType: {},
        bySubject: {},
      };
    }
  }
}

export default WeaviateService;
