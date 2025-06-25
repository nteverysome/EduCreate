# 🎯 Wordwall Clone - 技术规格文档

## 📊 系统架构概览

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Database      │
│   React + TS    │◄──►│  Node.js + API  │◄──►│  PostgreSQL     │
│   Tailwind CSS  │    │  Express + WS   │    │  Prisma ORM     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Game Engine   │    │   File Storage  │    │   Redis Cache   │
│   Canvas/WebGL  │    │   Cloudinary    │    │   Session Store │
│   Audio System  │    │   AWS S3        │    │   Rate Limiting │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎮 核心游戏模板规格

### 1. Quiz (多选题游戏)
```typescript
interface QuizTemplate {
  questions: Question[];
  settings: {
    timeLimit?: number;
    randomOrder: boolean;
    showCorrectAnswer: boolean;
    allowRetry: boolean;
  };
}

interface Question {
  id: string;
  text: string;
  image?: string;
  audio?: string;
  options: Option[];
  correctAnswer: string;
  explanation?: string;
}
```

### 2. Match Up (拖拽匹配)
```typescript
interface MatchUpTemplate {
  pairs: MatchPair[];
  settings: {
    layout: 'grid' | 'list';
    dragMode: 'free' | 'snap';
    showHints: boolean;
  };
}

interface MatchPair {
  id: string;
  left: ContentItem;
  right: ContentItem;
}
```

### 3. Spin the Wheel (转盘游戏)
```typescript
interface SpinWheelTemplate {
  segments: WheelSegment[];
  settings: {
    spinDuration: number;
    colors: string[];
    showPointer: boolean;
    allowMultipleSpin: boolean;
  };
}

interface WheelSegment {
  id: string;
  text: string;
  color: string;
  weight: number; // 概率权重
}
```

### 4. Group Sort (分组排序)
```typescript
interface GroupSortTemplate {
  groups: Group[];
  items: SortableItem[];
  settings: {
    maxItemsPerGroup?: number;
    allowEmptyGroups: boolean;
    showGroupLabels: boolean;
  };
}

interface Group {
  id: string;
  name: string;
  color: string;
  acceptedItems: string[]; // item IDs
}
```

## 🗄️ 数据库设计

### 核心表结构
```sql
-- 用户表
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  avatar_url TEXT,
  subscription_type VARCHAR(50) DEFAULT 'free',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 模板表
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL, -- 'quiz', 'match', 'wheel', etc.
  description TEXT,
  config JSONB NOT NULL, -- 模板配置
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 活动表
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES templates(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  content JSONB NOT NULL, -- 游戏内容数据
  settings JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  play_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 游戏结果表
CREATE TABLE game_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  player_name VARCHAR(100),
  player_email VARCHAR(255),
  score INTEGER NOT NULL,
  max_score INTEGER NOT NULL,
  time_taken INTEGER, -- 秒
  answers JSONB, -- 详细答案记录
  completed_at TIMESTAMP DEFAULT NOW()
);

-- 作业表
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id UUID REFERENCES activities(id) ON DELETE CASCADE,
  teacher_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  instructions TEXT,
  due_date TIMESTAMP,
  access_code VARCHAR(20) UNIQUE,
  max_attempts INTEGER DEFAULT 1,
  show_results BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🎨 前端组件架构

### 核心组件层次
```
App
├── Router
│   ├── PublicRoutes
│   │   ├── HomePage
│   │   ├── LoginPage
│   │   └── RegisterPage
│   └── PrivateRoutes
│       ├── DashboardPage
│       ├── CreateActivityPage
│       ├── EditActivityPage
│       └── PlayActivityPage
├── GameEngine
│   ├── QuizGame
│   ├── MatchUpGame
│   ├── SpinWheelGame
│   └── GroupSortGame
├── UI Components
│   ├── Layout
│   ├── Forms
│   ├── Modals
│   └── GameControls
└── Providers
    ├── AuthProvider
    ├── ThemeProvider
    └── GameProvider
```

### 状态管理
```typescript
// 使用 Zustand 进行状态管理
interface AppState {
  // 用户状态
  user: User | null;
  isAuthenticated: boolean;
  
  // 游戏状态
  currentActivity: Activity | null;
  gameState: GameState;
  gameResults: GameResult[];
  
  // UI 状态
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
  loading: boolean;
}
```

## 🔧 后端 API 设计

### RESTful API 端点
```typescript
// 认证相关
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
PUT    /api/auth/profile

// 活动管理
GET    /api/activities          // 获取活动列表
POST   /api/activities          // 创建新活动
GET    /api/activities/:id      // 获取特定活动
PUT    /api/activities/:id      // 更新活动
DELETE /api/activities/:id      // 删除活动
POST   /api/activities/:id/copy // 复制活动

// 模板管理
GET    /api/templates           // 获取模板列表
GET    /api/templates/:id       // 获取特定模板

// 游戏相关
POST   /api/games/:id/start     // 开始游戏
POST   /api/games/:id/submit    // 提交答案
GET    /api/games/:id/results   // 获取结果

// 作业管理
POST   /api/assignments         // 创建作业
GET    /api/assignments/:code   // 通过访问码获取作业
POST   /api/assignments/:id/submit // 提交作业结果
```

### WebSocket 事件
```typescript
// 实时游戏事件
interface GameEvents {
  'game:start': { activityId: string };
  'game:answer': { questionId: string; answer: any };
  'game:complete': { score: number; time: number };
  'game:update': { state: GameState };
}
```

## 🚀 部署架构

### 生产环境部署
```yaml
# docker-compose.yml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://backend:5000
  
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/wordwall
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=wordwall
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### CI/CD 流程
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Build application
        run: npm run build
      - name: Deploy to Vercel
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

## 📈 性能优化策略

### 前端优化
- **代码分割**: React.lazy() + Suspense
- **图片优化**: WebP 格式 + 懒加载
- **缓存策略**: Service Worker + Cache API
- **Bundle 优化**: Tree shaking + 压缩

### 后端优化
- **数据库优化**: 索引 + 查询优化
- **缓存层**: Redis 缓存热点数据
- **CDN**: 静态资源分发
- **负载均衡**: 多实例部署

这个技术规格为 Wordwall 克隆项目提供了完整的技术蓝图！
