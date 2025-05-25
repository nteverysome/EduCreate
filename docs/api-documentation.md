# EduCreate API 文檔

## 目錄

1. [介紹](#介紹)
2. [認證](#認證)
3. [用戶API](#用戶api)
4. [活動API](#活動api)
5. [模板API](#模板api)
6. [訂閱API](#訂閱api)
7. [H5P API](#h5p-api)
8. [搜索API](#搜索api)
9. [錯誤處理](#錯誤處理)
10. [限流政策](#限流政策)

## 介紹

EduCreate API 是一個 RESTful API，允許開發者與 EduCreate 平台進行交互。本文檔提供了所有可用 API 端點的詳細信息，包括請求參數、響應格式和示例。

### 基本信息

- **基礎 URL**: `https://api.educreate.com/v1`
- **響應格式**: 所有 API 響應均為 JSON 格式
- **版本控制**: API 版本包含在 URL 中 (例如 `/v1/`)

## 認證

EduCreate API 使用 Bearer Token 認證。要訪問受保護的端點，您需要在請求頭中包含有效的訪問令牌。

### 獲取訪問令牌

```http
POST /auth/token
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
```

#### 響應

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600
}
```

### 使用訪問令牌

在所有需要認證的請求中，添加以下請求頭：

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 用戶API

### 獲取當前用戶信息

```http
GET /user
Authorization: Bearer {access_token}
```

#### 響應

```json
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "teacher",
  "subscription": {
    "plan": "teacher",
    "status": "active",
    "expires_at": "2023-12-31T23:59:59Z"
  },
  "created_at": "2023-01-15T10:30:00Z",
  "updated_at": "2023-06-20T15:45:00Z"
}
```

### 更新用戶信息

```http
PATCH /user
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "name": "Jane Doe",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

#### 響應

```json
{
  "id": "user_123",
  "email": "user@example.com",
  "name": "Jane Doe",
  "avatar_url": "https://example.com/avatar.jpg",
  "updated_at": "2023-07-01T09:15:00Z"
}
```

### 獲取用戶活動列表

```http
GET /user/activities
Authorization: Bearer {access_token}
```

#### 查詢參數

| 參數 | 類型 | 描述 |
|------|------|------|
| page | 整數 | 頁碼，默認為 1 |
| limit | 整數 | 每頁項目數，默認為 20 |
| status | 字符串 | 活動狀態過濾 (draft, published, archived) |

#### 響應

```json
{
  "items": [
    {
      "id": "activity_456",
      "title": "英語詞彙配對遊戲",
      "template": "matching",
      "status": "published",
      "created_at": "2023-05-10T14:20:00Z",
      "updated_at": "2023-06-15T11:30:00Z"
    },
    {
      "id": "activity_789",
      "title": "科學測驗",
      "template": "quiz",
      "status": "draft",
      "created_at": "2023-06-20T09:45:00Z",
      "updated_at": "2023-06-20T09:45:00Z"
    }
  ],
  "pagination": {
    "total": 15,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

## 活動API

### 創建新活動

```http
POST /activities
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "新的英語測驗",
  "description": "測試學生的英語詞彙掌握程度",
  "template_id": "template_123",
  "content": {
    "questions": [
      {
        "text": "What is the capital of France?",
        "options": ["Paris", "London", "Berlin", "Madrid"],
        "correct_answer": 0
      }
    ]
  }
}
```

#### 響應

```json
{
  "id": "activity_101",
  "title": "新的英語測驗",
  "description": "測試學生的英語詞彙掌握程度",
  "template_id": "template_123",
  "status": "draft",
  "content": {
    "questions": [
      {
        "text": "What is the capital of France?",
        "options": ["Paris", "London", "Berlin", "Madrid"],
        "correct_answer": 0
      }
    ]
  },
  "created_at": "2023-07-05T10:00:00Z",
  "updated_at": "2023-07-05T10:00:00Z"
}
```

### 獲取活動詳情

```http
GET /activities/{activity_id}
Authorization: Bearer {access_token}
```

#### 響應

```json
{
  "id": "activity_101",
  "title": "新的英語測驗",
  "description": "測試學生的英語詞彙掌握程度",
  "template_id": "template_123",
  "status": "published",
  "content": {
    "questions": [
      {
        "text": "What is the capital of France?",
        "options": ["Paris", "London", "Berlin", "Madrid"],
        "correct_answer": 0
      }
    ]
  },
  "versions": [
    {
      "id": "version_1",
      "created_at": "2023-07-05T10:00:00Z"
    },
    {
      "id": "version_2",
      "created_at": "2023-07-06T15:30:00Z"
    }
  ],
  "created_at": "2023-07-05T10:00:00Z",
  "updated_at": "2023-07-06T15:30:00Z",
  "published_at": "2023-07-06T16:00:00Z"
}
```

### 更新活動

```http
PUT /activities/{activity_id}
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "title": "更新的英語測驗",
  "description": "更新的描述",
  "content": {
    "questions": [
      {
        "text": "What is the capital of France?",
        "options": ["Paris", "London", "Berlin", "Madrid"],
        "correct_answer": 0
      },
      {
        "text": "What is the capital of Japan?",
        "options": ["Beijing", "Tokyo", "Seoul", "Bangkok"],
        "correct_answer": 1
      }
    ]
  }
}
```

#### 響應

```json
{
  "id": "activity_101",
  "title": "更新的英語測驗",
  "description": "更新的描述",
  "template_id": "template_123",
  "status": "draft",
  "content": {
    "questions": [
      {
        "text": "What is the capital of France?",
        "options": ["Paris", "London", "Berlin", "Madrid"],
        "correct_answer": 0
      },
      {
        "text": "What is the capital of Japan?",
        "options": ["Beijing", "Tokyo", "Seoul", "Bangkok"],
        "correct_answer": 1
      }
    ]
  },
  "updated_at": "2023-07-07T09:20:00Z"
}
```

### 發布活動

```http
POST /activities/{activity_id}/publish
Authorization: Bearer {access_token}
```

#### 響應

```json
{
  "id": "activity_101",
  "status": "published",
  "published_at": "2023-07-07T10:15:00Z",
  "updated_at": "2023-07-07T10:15:00Z"
}
```

### 獲取活動版本

```http
GET /activities/{activity_id}/versions/{version_id}
Authorization: Bearer {access_token}
```

#### 響應

```json
{
  "id": "version_2",
  "activity_id": "activity_101",
  "content": {
    "questions": [
      {
        "text": "What is the capital of France?",
        "options": ["Paris", "London", "Berlin", "Madrid"],
        "correct_answer": 0
      }
    ]
  },
  "created_at": "2023-07-06T15:30:00Z",
  "created_by": "user_123"
}
```

## 模板API

### 獲取模板列表

```http
GET /templates
Authorization: Bearer {access_token}
```

#### 查詢參數

| 參數 | 類型 | 描述 |
|------|------|------|
| category | 字符串 | 按類別過濾 |
| page | 整數 | 頁碼，默認為 1 |
| limit | 整數 | 每頁項目數，默認為 20 |

#### 響應

```json
{
  "items": [
    {
      "id": "template_123",
      "name": "測驗問答",
      "description": "創建多選題測驗",
      "category": "quiz",
      "thumbnail_url": "https://example.com/thumbnails/quiz.jpg",
      "created_at": "2023-01-10T08:30:00Z"
    },
    {
      "id": "template_456",
      "name": "詞語配對",
      "description": "創建詞語配對遊戲",
      "category": "matching",
      "thumbnail_url": "https://example.com/thumbnails/matching.jpg",
      "created_at": "2023-01-15T14:45:00Z"
    }
  ],
  "pagination": {
    "total": 8,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

### 獲取模板詳情

```http
GET /templates/{template_id}
Authorization: Bearer {access_token}
```

#### 響應

```json
{
  "id": "template_123",
  "name": "測驗問答",
  "description": "創建多選題測驗",
  "category": "quiz",
  "schema": {
    "questions": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "text": { "type": "string" },
          "options": { "type": "array", "items": { "type": "string" } },
          "correct_answer": { "type": "integer" }
        }
      }
    }
  },
  "thumbnail_url": "https://example.com/thumbnails/quiz.jpg",
  "preview_url": "https://example.com/previews/quiz.html",
  "created_at": "2023-01-10T08:30:00Z",
  "updated_at": "2023-03-05T11:20:00Z"
}
```

## 訂閱API

### 獲取訂閱計劃列表

```http
GET /subscriptions/plans
```

#### 響應

```json
{
  "items": [
    {
      "id": "plan_free",
      "name": "免費計劃",
      "description": "基本功能，有使用限制",
      "price": 0,
      "currency": "USD",
      "interval": "month",
      "features": [
        "最多創建 5 個活動",
        "基本模板訪問",
        "無高級分析"
      ]
    },
    {
      "id": "plan_teacher",
      "name": "教師計劃",
      "description": "適合個人教師使用",
      "price": 9.99,
      "currency": "USD",
      "interval": "month",
      "features": [
        "無限活動創建",
        "所有模板訪問",
        "基本分析",
        "優先支持"
      ]
    }
  ]
}
```

### 獲取當前訂閱

```http
GET /subscriptions/current
Authorization: Bearer {access_token}
```

#### 響應

```json
{
  "subscription_id": "sub_123456",
  "plan_id": "plan_teacher",
  "status": "active",
  "current_period_start": "2023-06-01T00:00:00Z",
  "current_period_end": "2023-07-01T00:00:00Z",
  "cancel_at_period_end": false,
  "payment_method": {
    "type": "card",
    "last4": "4242",
    "exp_month": 12,
    "exp_year": 2025
  }
}
```

### 更新訂閱

```http
PATCH /subscriptions/current
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "plan_id": "plan_school"
}
```

#### 響應

```json
{
  "subscription_id": "sub_123456",
  "plan_id": "plan_school",
  "status": "active",
  "current_period_start": "2023-06-01T00:00:00Z",
  "current_period_end": "2023-07-01T00:00:00Z",
  "cancel_at_period_end": false,
  "updated_at": "2023-06-15T10:30:00Z"
}
```

### 取消訂閱

```http
POST /subscriptions/current/cancel
Authorization: Bearer {access_token}
Content-Type: application/json

{
  "cancel_at_period_end": true
}
```

#### 響應

```json
{
  "subscription_id": "sub_123456",
  "plan_id": "plan_teacher",
  "status": "active",
  "current_period_start": "2023-06-01T00:00:00Z",
  "current_period_end": "2023-07-01T00:00:00Z",
  "cancel_at_period_end": true,
  "updated_at": "2023-06-15T11:45:00Z"
}
```

## H5P API

### 上傳H5P內容

```http
POST /h5p/content
Authorization: Bearer {access_token}
Content-Type: multipart/form-data

# 表單數據
file: [H5P文件]
title: "H5P互動視頻"
```

#### 響應

```json
{
  "id": "h5p_123",
  "title": "H5P互動視頻",
  "content_type": "Interactive Video",
  "size": 1500000,
  "created_at": "2023-06-20T14:30:00Z",
  "updated_at": "2023-06-20T14:30:00Z"
}
```

### 獲取H5P內容列表

```http
GET /h5p/content
Authorization: Bearer {access_token}
```

#### 查詢參數

| 參數 | 類型 | 描述 |
|------|------|------|
| page | 整數 | 頁碼，默認為 1 |
| limit | 整數 | 每頁項目數，默認為 20 |
| content_type | 字符串 | 按內容類型過濾 |

#### 響應

```json
{
  "items": [
    {
      "id": "h5p_123",
      "title": "H5P互動視頻",
      "content_type": "Interactive Video",
      "size": 1500000,
      "created_at": "2023-06-20T14:30:00Z"
    },
    {
      "id": "h5p_456",
      "title": "H5P測驗集",
      "content_type": "Question Set",
      "size": 500000,
      "created_at": "2023-06-25T09:15:00Z"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

### 獲取H5P內容詳情

```http
GET /h5p/content/{content_id}
Authorization: Bearer {access_token}
```

#### 響應

```json
{
  "id": "h5p_123",
  "title": "H5P互動視頻",
  "content_type": "Interactive Video",
  "size": 1500000,
  "metadata": {
    "mainLibrary": "H5P.InteractiveVideo",
    "embedTypes": ["iframe"],
    "license": "MIT"
  },
  "embed_code": "<iframe src=\"https://example.com/h5p/embed/h5p_123\" width=\"800\" height=\"600\" frameborder=\"0\" allowfullscreen=\"allowfullscreen\"></iframe>",
  "download_url": "https://example.com/h5p/download/h5p_123",
  "created_at": "2023-06-20T14:30:00Z",
  "updated_at": "2023-06-20T14:30:00Z"
}
```

### 刪除H5P內容

```http
DELETE /h5p/content/{content_id}
Authorization: Bearer {access_token}
```

#### 響應

```json
{
  "success": true,
  "message": "H5P內容已成功刪除"
}
```

## 搜索API

### 搜索活動

```http
GET /search/activities
Authorization: Bearer {access_token}
```

#### 查詢參數

| 參數 | 類型 | 描述 |
|------|------|------|
| q | 字符串 | 搜索查詢 |
| template | 字符串 | 按模板類型過濾 |
| status | 字符串 | 按狀態過濾 (draft, published, archived) |
| page | 整數 | 頁碼，默認為 1 |
| limit | 整數 | 每頁項目數，默認為 20 |

#### 響應

```json
{
  "items": [
    {
      "id": "activity_101",
      "title": "英語測驗",
      "description": "測試學生的英語詞彙掌握程度",
      "template": "quiz",
      "status": "published",
      "created_at": "2023-07-05T10:00:00Z",
      "updated_at": "2023-07-07T10:15:00Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

### 搜索模板

```http
GET /search/templates
Authorization: Bearer {access_token}
```

#### 查詢參數

| 參數 | 類型 | 描述 |
|------|------|------|
| q | 字符串 | 搜索查詢 |
| category | 字符串 | 按類別過濾 |
| page | 整數 | 頁碼，默認為 1 |
| limit | 整數 | 每頁項目數，默認為 20 |

#### 響應

```json
{
  "items": [
    {
      "id": "template_123",
      "name": "測驗問答",
      "description": "創建多選題測驗",
      "category": "quiz",
      "thumbnail_url": "https://example.com/thumbnails/quiz.jpg",
      "created_at": "2023-01-10T08:30:00Z"
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

## 錯誤處理

API 錯誤響應遵循以下格式：

```json
{
  "error": {
    "code": "invalid_request",
    "message": "請求參數無效",
    "details": [
      {
        "field": "email",
        "message": "必須是有效的電子郵件地址"
      }
    ]
  }
}
```

### 常見錯誤代碼

| 錯誤代碼 | HTTP 狀態碼 | 描述 |
|---------|------------|------|
| authentication_required | 401 | 需要認證 |
| invalid_token | 401 | 訪問令牌無效或已過期 |
| permission_denied | 403 | 沒有足夠的權限 |
| resource_not_found | 404 | 請求的資源不存在 |
| invalid_request | 400 | 請求參數無效 |
| rate_limit_exceeded | 429 | 超過 API 請求限制 |
| internal_error | 500 | 服務器內部錯誤 |

## 限流政策

EduCreate API 實施了請求限制以確保服務的穩定性。限制基於 IP 地址和 API 令牌。

| 計劃 | 限制 |
|------|------|
| 免費 | 60 請求/分鐘 |
| 教師 | 120 請求/分鐘 |
| 學校 | 300 請求/分鐘 |
| 企業 | 600 請求/分鐘 |

當您超過限制時，API 將返回 `429 Too Many Requests` 狀態碼，並在響應頭中包含以下信息：

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1625140800
```

其中 `X-RateLimit-Reset` 是 Unix 時間戳，表示限制將重置的時間。