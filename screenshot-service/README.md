# Screenshot Service for EduCreate

A dedicated screenshot service using Express and Puppeteer, designed to run on Railway.app.

## 🚀 Features

- **Single Screenshot**: Capture screenshots of individual URLs
- **Batch Screenshot**: Capture multiple screenshots in one request (up to 10)
- **Health Check**: Monitor service status
- **Detailed Logging**: Track performance metrics
- **Error Handling**: Robust error handling and recovery

## 📋 API Endpoints

### 1. Health Check
```
GET /health
```

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-01-18T10:00:00.000Z",
  "service": "screenshot-service",
  "version": "1.0.0"
}
```

### 2. Single Screenshot
```
POST /screenshot
```

**Request Body**:
```json
{
  "url": "https://edu-create.vercel.app/play/activity-id",
  "width": 400,
  "height": 300,
  "waitTime": 2000
}
```

**Parameters**:
- `url` (required): The URL to screenshot
- `width` (optional): Screenshot width in pixels (default: 400)
- `height` (optional): Screenshot height in pixels (default: 300)
- `waitTime` (optional): Wait time after page load in milliseconds (default: 2000)

**Response**:
- Content-Type: `image/png`
- Headers:
  - `X-Screenshot-Time`: Total time in milliseconds
  - `X-Screenshot-Size`: Screenshot size in bytes
- Body: PNG image binary data

**Error Response**:
```json
{
  "error": "截圖失敗",
  "message": "Error details",
  "timestamp": "2025-01-18T10:00:00.000Z"
}
```

### 3. Batch Screenshot
```
POST /screenshot/batch
```

**Request Body**:
```json
{
  "urls": [
    "https://edu-create.vercel.app/play/activity-1",
    "https://edu-create.vercel.app/play/activity-2"
  ],
  "width": 400,
  "height": 300,
  "waitTime": 2000
}
```

**Parameters**:
- `urls` (required): Array of URLs to screenshot (max 10)
- `width` (optional): Screenshot width in pixels (default: 400)
- `height` (optional): Screenshot height in pixels (default: 300)
- `waitTime` (optional): Wait time after page load in milliseconds (default: 2000)

**Response**:
```json
{
  "success": true,
  "total": 2,
  "succeeded": 2,
  "failed": 0,
  "results": [
    {
      "url": "https://edu-create.vercel.app/play/activity-1",
      "success": true,
      "size": 28900,
      "data": "base64-encoded-image-data"
    },
    {
      "url": "https://edu-create.vercel.app/play/activity-2",
      "success": true,
      "size": 29100,
      "data": "base64-encoded-image-data"
    }
  ]
}
```

## 🛠️ Local Development

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn

### Installation
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

### Run Production Server
```bash
npm start
```

### Test the Service
```bash
# Health check
curl http://localhost:3000/health

# Single screenshot
curl -X POST http://localhost:3000/screenshot \
  -H "Content-Type: application/json" \
  -d '{"url": "https://edu-create.vercel.app/play/activity-id"}' \
  --output screenshot.png

# Batch screenshot
curl -X POST http://localhost:3000/screenshot/batch \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://edu-create.vercel.app/play/activity-1",
      "https://edu-create.vercel.app/play/activity-2"
    ]
  }'
```

## 🚂 Deploy to Railway

### Method 1: Deploy from GitHub

1. Push code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit: Railway screenshot service"
git remote add origin https://github.com/your-username/screenshot-service.git
git push -u origin main
```

2. Go to [Railway.app](https://railway.app)
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Select your `screenshot-service` repository
6. Railway will automatically detect and deploy

### Method 2: Deploy with Railway CLI

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login to Railway:
```bash
railway login
```

3. Initialize project:
```bash
railway init
```

4. Deploy:
```bash
railway up
```

### Get Service URL

After deployment, Railway will provide a URL like:
```
https://your-service.railway.app
```

Save this URL for configuring EduCreate.

## 📊 Performance Metrics

Typical performance (on Railway):
- Browser launch: ~500-1000ms
- Page load: ~1000-2000ms
- Screenshot: ~200-500ms
- **Total time**: ~2-4 seconds per screenshot

## 🔧 Configuration

### Environment Variables

- `PORT`: Server port (default: 3000, Railway sets this automatically)
- `NODE_ENV`: Environment (development/production)

### Puppeteer Configuration

The service uses the following Puppeteer arguments for optimal performance on Railway:
- `--no-sandbox`
- `--disable-setuid-sandbox`
- `--disable-dev-shm-usage`
- `--disable-accelerated-2d-canvas`
- `--disable-gpu`
- `--disable-web-security`
- `--disable-features=IsolateOrigins,site-per-process`

## 🐛 Troubleshooting

### Issue: Browser fails to launch
**Solution**: Ensure Railway has enough memory (at least 512MB)

### Issue: Screenshots are blank
**Solution**: Increase `waitTime` parameter to allow more time for page rendering

### Issue: Timeout errors
**Solution**: Check if the target URL is accessible and responds quickly

## 📝 License

MIT

## 👥 Author

EduCreate Team

## 🔗 Related Projects

- [EduCreate](https://github.com/nteverysome/EduCreate) - Main application
- [Vercel Blob Storage](https://vercel.com/docs/storage/vercel-blob) - Image storage solution

