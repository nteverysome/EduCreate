// AI 圖片生成器
interface ImageGenerationRequest {
  prompt: string;
  style?: 'realistic' | 'cartoon' | 'illustration' | 'educational';
  size?: '256x256' | '512x512' | '1024x1024';
  count?: number;
  subject?: string;
  ageGroup?: string;
}

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  style: string;
  size: string;
  createdAt: string;
}

interface ImageGenerationResult {
  success: boolean;
  images: GeneratedImage[];
  message?: string;
}

export class AIImageGenerator {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || 'demo-key';
    this.baseUrl = 'https://api.openai.com/v1/images/generations';
  }

  async generateImages(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    // 演示模式：生成模擬圖片
    if (this.apiKey === 'demo-key') {
      return this.generateDemoImages(request);
    }

    try {
      // 真實 DALL-E API 調用
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: this.enhancePrompt(request),
          n: request.count || 1,
          size: request.size || '512x512',
          response_format: 'url'
        }),
      });

      if (!response.ok) {
        throw new Error(`DALL-E API 錯誤: ${response.status}`);
      }

      const data = await response.json();
      
      const images: GeneratedImage[] = data.data.map((item: any, index: number) => ({
        id: `img-${Date.now()}-${index}`,
        url: item.url,
        prompt: request.prompt,
        style: request.style || 'realistic',
        size: request.size || '512x512',
        createdAt: new Date().toISOString()
      }));

      return {
        success: true,
        images
      };

    } catch (error) {
      console.error('圖片生成失敗:', error);
      // 降級到演示模式
      return this.generateDemoImages(request);
    }
  }

  private enhancePrompt(request: ImageGenerationRequest): string {
    let enhancedPrompt = request.prompt;

    // 根據風格增強提示詞
    switch (request.style) {
      case 'cartoon':
        enhancedPrompt += ', cartoon style, colorful, friendly, child-friendly';
        break;
      case 'illustration':
        enhancedPrompt += ', digital illustration, clean lines, educational style';
        break;
      case 'educational':
        enhancedPrompt += ', educational diagram, clear and simple, informative';
        break;
      default:
        enhancedPrompt += ', high quality, detailed';
    }

    // 根據年齡組調整
    if (request.ageGroup) {
      if (request.ageGroup.includes('兒童') || request.ageGroup.includes('小學')) {
        enhancedPrompt += ', suitable for children, safe content, bright colors';
      }
    }

    return enhancedPrompt;
  }

  private generateDemoImages(request: ImageGenerationRequest): ImageGenerationResult {
    const count = request.count || 1;
    const images: GeneratedImage[] = [];

    // 根據提示詞生成不同的演示圖片
    for (let i = 0; i < count; i++) {
      const demoImage = this.getDemoImageByPrompt(request.prompt, request.style || 'realistic', i);
      images.push({
        id: `demo-img-${Date.now()}-${i}`,
        url: demoImage.url,
        prompt: request.prompt,
        style: request.style || 'realistic',
        size: request.size || '512x512',
        createdAt: new Date().toISOString()
      });
    }

    return {
      success: true,
      images,
      message: '演示模式：使用預設圖片'
    };
  }

  private getDemoImageByPrompt(prompt: string, style: string, index: number) {
    const promptLower = prompt.toLowerCase();
    
    // 根據提示詞返回相應的演示圖片
    if (promptLower.includes('貓') || promptLower.includes('cat')) {
      return {
        url: this.generatePlaceholderImage('🐱', '可愛的貓咪', style),
        description: '貓咪圖片'
      };
    } else if (promptLower.includes('狗') || promptLower.includes('dog')) {
      return {
        url: this.generatePlaceholderImage('🐶', '友善的狗狗', style),
        description: '狗狗圖片'
      };
    } else if (promptLower.includes('數學') || promptLower.includes('math')) {
      return {
        url: this.generatePlaceholderImage('📊', '數學圖表', style),
        description: '數學相關圖片'
      };
    } else if (promptLower.includes('科學') || promptLower.includes('science')) {
      return {
        url: this.generatePlaceholderImage('🔬', '科學實驗', style),
        description: '科學相關圖片'
      };
    } else if (promptLower.includes('歷史') || promptLower.includes('history')) {
      return {
        url: this.generatePlaceholderImage('🏛️', '歷史建築', style),
        description: '歷史相關圖片'
      };
    } else {
      return {
        url: this.generatePlaceholderImage('🎨', prompt, style),
        description: '通用圖片'
      };
    }
  }

  private generatePlaceholderImage(emoji: string, text: string, style: string): string {
    // 生成 SVG 佔位圖片
    const colors = {
      realistic: { bg: '#f0f9ff', text: '#1e40af' },
      cartoon: { bg: '#fef3c7', text: '#d97706' },
      illustration: { bg: '#f0fdf4', text: '#16a34a' },
      educational: { bg: '#fdf4ff', text: '#a21caf' }
    };

    const color = colors[style as keyof typeof colors] || colors.realistic;
    
    const svg = `
      <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="${color.bg}"/>
        <text x="50%" y="40%" font-family="Arial" font-size="80" text-anchor="middle" fill="${color.text}">
          ${emoji}
        </text>
        <text x="50%" y="60%" font-family="Arial" font-size="24" text-anchor="middle" fill="${color.text}">
          ${text}
        </text>
        <text x="50%" y="75%" font-family="Arial" font-size="16" text-anchor="middle" fill="${color.text}" opacity="0.7">
          ${style} 風格
        </text>
      </svg>
    `;

    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
  }

  // 獲取預設的教育圖片集合
  getEducationalImageSet(subject: string): GeneratedImage[] {
    const imageSet: { [key: string]: GeneratedImage[] } = {
      animals: [
        {
          id: 'edu-animal-1',
          url: this.generatePlaceholderImage('🐱', '貓', 'educational'),
          prompt: '貓的教育圖片',
          style: 'educational',
          size: '512x512',
          createdAt: new Date().toISOString()
        },
        {
          id: 'edu-animal-2',
          url: this.generatePlaceholderImage('🐶', '狗', 'educational'),
          prompt: '狗的教育圖片',
          style: 'educational',
          size: '512x512',
          createdAt: new Date().toISOString()
        },
        {
          id: 'edu-animal-3',
          url: this.generatePlaceholderImage('🐘', '大象', 'educational'),
          prompt: '大象的教育圖片',
          style: 'educational',
          size: '512x512',
          createdAt: new Date().toISOString()
        }
      ],
      math: [
        {
          id: 'edu-math-1',
          url: this.generatePlaceholderImage('➕', '加法', 'educational'),
          prompt: '加法運算圖片',
          style: 'educational',
          size: '512x512',
          createdAt: new Date().toISOString()
        },
        {
          id: 'edu-math-2',
          url: this.generatePlaceholderImage('📊', '圖表', 'educational'),
          prompt: '數學圖表',
          style: 'educational',
          size: '512x512',
          createdAt: new Date().toISOString()
        }
      ],
      science: [
        {
          id: 'edu-science-1',
          url: this.generatePlaceholderImage('🔬', '顯微鏡', 'educational'),
          prompt: '科學實驗器材',
          style: 'educational',
          size: '512x512',
          createdAt: new Date().toISOString()
        },
        {
          id: 'edu-science-2',
          url: this.generatePlaceholderImage('🌍', '地球', 'educational'),
          prompt: '地球科學',
          style: 'educational',
          size: '512x512',
          createdAt: new Date().toISOString()
        }
      ]
    };

    return imageSet[subject] || [];
  }

  // 圖片優化建議
  getImageOptimizationSuggestions(prompt: string): string[] {
    const suggestions = [
      '使用具體的描述詞，如"紅色的蘋果"而不是"蘋果"',
      '指定風格，如"卡通風格"、"寫實風格"或"插畫風格"',
      '添加背景描述，如"白色背景"或"教室環境"',
      '指定適合的年齡群體，如"適合兒童"或"教育用途"',
      '使用正面的描述，避免否定詞'
    ];

    // 根據提示詞給出特定建議
    const specificSuggestions = [];
    
    if (!prompt.includes('風格')) {
      specificSuggestions.push('建議添加風格描述，如"卡通風格"或"教育插畫風格"');
    }
    
    if (!prompt.includes('背景')) {
      specificSuggestions.push('建議指定背景，如"簡潔白色背景"');
    }
    
    if (prompt.length < 10) {
      specificSuggestions.push('建議使用更詳細的描述來獲得更好的結果');
    }

    return [...specificSuggestions, ...suggestions.slice(0, 3)];
  }
}

// 導出單例實例
export const aiImageGenerator = new AIImageGenerator();
