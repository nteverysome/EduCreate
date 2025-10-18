# Screenshot Service Dockerfile
# 專為 Puppeteer 截圖服務設計的輕量級 Docker 鏡像

FROM node:18-alpine

# 安裝 Chromium 和相關依賴
# Puppeteer 需要這些系統庫才能運行 Chromium
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# 設置 Puppeteer 使用系統安裝的 Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# 設置工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json（從倉庫根目錄的 screenshot-service 子目錄）
COPY screenshot-service/package*.json ./

# 安裝依賴
RUN npm ci --only=production

# 複製應用代碼（從倉庫根目錄的 screenshot-service 子目錄）
COPY screenshot-service/index.js ./
COPY screenshot-service/test.js ./
COPY screenshot-service/README.md ./

# 調試：查看文件列表和內容
RUN ls -la /app && echo "=== index.js content check ===" && head -n 5 /app/index.js

# 暴露端口
EXPOSE 3000

# 啟動服務
CMD ["node", "index.js"]

