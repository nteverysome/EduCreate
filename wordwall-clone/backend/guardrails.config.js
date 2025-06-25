// Guardrails.ai 配置文件
// 用於確保 AI 生成的代碼質量和格式正確性

const { Guard } = require('guardrails-ai');

// 創建代碼質量守護規則
const codeQualityGuard = new Guard({
  name: 'code-quality-guard',
  description: 'Ensures generated code meets quality standards',
  validators: [
    {
      name: 'typescript-syntax',
      description: 'Validates TypeScript syntax',
      type: 'format',
      on_fail: 'reask',
      validator: (value) => {
        // 檢查 TypeScript 語法
        try {
          // 簡單的語法檢查
          if (value.includes('function') || value.includes('const') || value.includes('interface')) {
            return { valid: true };
          }
          return { valid: false, error: 'Invalid TypeScript syntax' };
        } catch (error) {
          return { valid: false, error: error.message };
        }
      }
    },
    {
      name: 'json-format',
      description: 'Validates JSON format',
      type: 'format',
      on_fail: 'fix',
      validator: (value) => {
        try {
          JSON.parse(value);
          return { valid: true };
        } catch (error) {
          return { valid: false, error: 'Invalid JSON format' };
        }
      }
    },
    {
      name: 'no-hardcoded-secrets',
      description: 'Prevents hardcoded secrets in code',
      type: 'security',
      on_fail: 'exception',
      validator: (value) => {
        const secretPatterns = [
          /password\s*=\s*["'][^"']+["']/i,
          /api_key\s*=\s*["'][^"']+["']/i,
          /secret\s*=\s*["'][^"']+["']/i,
          /token\s*=\s*["'][^"']+["']/i
        ];
        
        for (const pattern of secretPatterns) {
          if (pattern.test(value)) {
            return { 
              valid: false, 
              error: 'Hardcoded secrets detected. Use environment variables instead.' 
            };
          }
        }
        return { valid: true };
      }
    }
  ]
});

// 創建 API 響應格式守護規則
const apiResponseGuard = new Guard({
  name: 'api-response-guard',
  description: 'Ensures API responses follow standard format',
  validators: [
    {
      name: 'api-response-structure',
      description: 'Validates API response structure',
      type: 'format',
      on_fail: 'reask',
      validator: (value) => {
        try {
          const response = JSON.parse(value);
          
          // 檢查必需的字段
          if (!response.hasOwnProperty('success')) {
            return { valid: false, error: 'Missing "success" field' };
          }
          
          if (!response.hasOwnProperty('data') && !response.hasOwnProperty('error')) {
            return { valid: false, error: 'Missing "data" or "error" field' };
          }
          
          return { valid: true };
        } catch (error) {
          return { valid: false, error: 'Invalid JSON format' };
        }
      }
    }
  ]
});

// 創建數據庫模型守護規則
const databaseModelGuard = new Guard({
  name: 'database-model-guard',
  description: 'Ensures database models follow Prisma conventions',
  validators: [
    {
      name: 'prisma-model-format',
      description: 'Validates Prisma model format',
      type: 'format',
      on_fail: 'reask',
      validator: (value) => {
        // 檢查 Prisma 模型格式
        if (!value.includes('model ')) {
          return { valid: false, error: 'Not a valid Prisma model' };
        }
        
        // 檢查是否有 id 字段
        if (!value.includes('@id')) {
          return { valid: false, error: 'Model must have an @id field' };
        }
        
        // 檢查是否有 @@map 指令
        if (!value.includes('@@map(')) {
          return { valid: false, error: 'Model should have @@map directive for table name' };
        }
        
        return { valid: true };
      }
    }
  ]
});

// 創建環境變量守護規則
const envConfigGuard = new Guard({
  name: 'env-config-guard',
  description: 'Ensures environment configuration is secure',
  validators: [
    {
      name: 'env-var-format',
      description: 'Validates environment variable format',
      type: 'format',
      on_fail: 'fix',
      validator: (value) => {
        // 檢查環境變量格式
        const lines = value.split('\n');
        for (const line of lines) {
          if (line.trim() && !line.startsWith('#')) {
            if (!line.includes('=')) {
              return { valid: false, error: 'Invalid environment variable format' };
            }
            
            // 檢查是否有實際的密碼值
            if (line.includes('password123') || line.includes('secret123')) {
              return { 
                valid: false, 
                error: 'Use placeholder values in example files' 
              };
            }
          }
        }
        return { valid: true };
      }
    }
  ]
});

// 導出所有守護規則
module.exports = {
  codeQualityGuard,
  apiResponseGuard,
  databaseModelGuard,
  envConfigGuard,
  
  // 便捷方法
  validateCode: (code) => codeQualityGuard.validate(code),
  validateApiResponse: (response) => apiResponseGuard.validate(response),
  validateDatabaseModel: (model) => databaseModelGuard.validate(model),
  validateEnvConfig: (config) => envConfigGuard.validate(config),
  
  // 批量驗證
  validateAll: (data) => {
    const results = {};
    
    if (data.code) {
      results.code = codeQualityGuard.validate(data.code);
    }
    
    if (data.apiResponse) {
      results.apiResponse = apiResponseGuard.validate(data.apiResponse);
    }
    
    if (data.databaseModel) {
      results.databaseModel = databaseModelGuard.validate(data.databaseModel);
    }
    
    if (data.envConfig) {
      results.envConfig = envConfigGuard.validate(data.envConfig);
    }
    
    return results;
  }
};
