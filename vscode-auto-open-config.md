# VS Code 自動開啟外部網站設置指南

## 🔧 設置方法

### 方法 1: 通過 VS Code 設置界面

1. **打開設置**
   - 按 `Ctrl + ,` (Windows/Linux) 或 `Cmd + ,` (Mac)
   - 或者點擊 `File` > `Preferences` > `Settings`

2. **搜索設置**
   - 在搜索框中輸入: `security.workspace.trust.untrustedFiles`
   - 或搜索: `trusted domains`

3. **配置信任域名**
   - 找到 `Security: Workspace Trust Untrusted Files` 設置
   - 將其設置為 `open` 或 `newWindow`

### 方法 2: 通過 settings.json 文件

1. **打開 settings.json**
   - 按 `Ctrl + Shift + P` 打開命令面板
   - 輸入 `Preferences: Open Settings (JSON)`
   - 選擇該選項

2. **添加配置**
   ```json
   {
     "security.workspace.trust.untrustedFiles": "open",
     "workbench.trustedDomains.promptInTrustedWorkspace": false,
     "workbench.externalUriOpeners": {
       "https://edu-create.vercel.app": "default"
     }
   }
   ```

### 方法 3: 添加信任域名

1. **手動添加信任域名**
   - 在設置中搜索 `trusted domains`
   - 找到 `Workbench › Trusted Domains`
   - 點擊 `Edit in settings.json`

2. **添加 EduCreate 域名**
   ```json
   {
     "workbench.trustedDomains": [
       "https://edu-create.vercel.app",
       "https://*.vercel.app",
       "http://localhost:3000"
     ]
   }
   ```

## 🎯 針對 EduCreate 的具體設置

### 完整的 settings.json 配置

```json
{
  // 自動打開外部鏈接
  "security.workspace.trust.untrustedFiles": "open",
  
  // 不在信任工作區中提示
  "workbench.trustedDomains.promptInTrustedWorkspace": false,
  
  // 信任的域名列表
  "workbench.trustedDomains": [
    "https://edu-create.vercel.app",
    "https://*.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001"
  ],
  
  // 外部 URI 開啟器設置
  "workbench.externalUriOpeners": {
    "https://edu-create.vercel.app": "default",
    "https://*.vercel.app": "default"
  },
  
  // 禁用安全警告
  "security.workspace.trust.banner": "never",
  "security.workspace.trust.startupPrompt": "never"
}
```

## 🚀 快速設置步驟

### 一鍵設置方法

1. **按 `Ctrl + Shift + P`** 打開命令面板

2. **輸入並選擇**: `Preferences: Open Settings (JSON)`

3. **複製貼上以下配置**:
   ```json
   {
     "workbench.trustedDomains": [
       "https://edu-create.vercel.app"
     ],
     "security.workspace.trust.untrustedFiles": "open"
   }
   ```

4. **保存文件** (`Ctrl + S`)

5. **重啟 VS Code** (可選，但建議)

## 🔒 安全考慮

### 推薦的安全設置

```json
{
  // 只信任特定域名
  "workbench.trustedDomains": [
    "https://edu-create.vercel.app",
    "http://localhost:3000"
  ],
  
  // 保持其他安全設置
  "security.workspace.trust.enabled": true,
  "security.workspace.trust.untrustedFiles": "prompt"
}
```

## 🛠️ 故障排除

### 如果設置不生效

1. **檢查設置優先級**
   - 用戶設置 vs 工作區設置
   - 確保在正確的設置文件中

2. **重啟 VS Code**
   - 某些設置需要重啟才能生效

3. **清除緩存**
   - 按 `Ctrl + Shift + P`
   - 輸入 `Developer: Reload Window`

4. **檢查設置語法**
   - 確保 JSON 格式正確
   - 沒有多餘的逗號或括號

## 📝 其他相關設置

### 瀏覽器相關設置

```json
{
  // 設置默認瀏覽器
  "workbench.externalBrowser": "default",
  
  // 在新窗口中打開
  "workbench.externalUriOpeners": {
    "*": "default"
  }
}
```

### 開發環境設置

```json
{
  // 本地開發服務器
  "workbench.trustedDomains": [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "https://edu-create.vercel.app"
  ]
}
```

## ✅ 驗證設置

### 測試步驟

1. **重啟 VS Code**
2. **嘗試打開外部鏈接**
3. **確認不再出現提示對話框**
4. **鏈接直接在瀏覽器中打開**

### 成功標誌

- ✅ 不再出現 "Do you want Code to open the external website?" 對話框
- ✅ 鏈接自動在默認瀏覽器中打開
- ✅ 開發效率提升

---

**注意**: 這些設置會影響 VS Code 的安全行為，請確保只信任您確認安全的域名。
