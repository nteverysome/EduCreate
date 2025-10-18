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

# 複製 package.json 和 package-lock.json
COPY package*.json ./

# 安裝依賴
RUN npm ci --only=production

# 複製應用代碼
COPY . .

# 暴露端口
EXPOSE 3000

# 啟動服務
CMD ["node", "index.js"]

