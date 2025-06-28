/**
 * Service Worker - PWA 支持
 * 提供離線功能、緩存管理、推送通知等
 */

const CACHE_NAME = 'educreate-v1.0.0';
const STATIC_CACHE = 'educreate-static-v1';
const DYNAMIC_CACHE = 'educreate-dynamic-v1';

// 需要緩存的靜態資源
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html',
  // 添加其他靜態資源
];

// 需要緩存的 API 路由
const CACHE_API_ROUTES = [
  '/api/activities',
  '/api/progress',
  '/api/content'
];

// 安裝事件
self.addEventListener('install', (event) => {
  console.log('Service Worker 安裝中...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('緩存靜態資源');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// 激活事件
self.addEventListener('activate', (event) => {
  console.log('Service Worker 激活中...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('刪除舊緩存:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});

// 獲取事件 - 網絡請求攔截
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 跳過非 GET 請求
  if (request.method !== 'GET') {
    return;
  }

  // 跳過 Chrome 擴展請求
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // 處理 API 請求
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // 處理靜態資源
  if (STATIC_ASSETS.some(asset => url.pathname === asset)) {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // 處理頁面請求
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(handlePageRequest(request));
    return;
  }

  // 處理其他資源
  event.respondWith(handleOtherRequest(request));
});

// 處理 API 請求
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // 嘗試網絡請求
    const networkResponse = await fetch(request);
    
    // 如果是可緩存的 API 路由，緩存響應
    if (CACHE_API_ROUTES.some(route => url.pathname.startsWith(route))) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('API 請求失敗，嘗試從緩存獲取:', url.pathname);
    
    // 網絡失敗，嘗試從緩存獲取
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 返回離線響應
    return new Response(
      JSON.stringify({
        error: '網絡不可用',
        offline: true,
        timestamp: new Date().toISOString()
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// 處理靜態資源請求
async function handleStaticRequest(request) {
  // 緩存優先策略
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(STATIC_CACHE);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.log('靜態資源請求失敗:', request.url);
    return new Response('資源不可用', { status: 404 });
  }
}

// 處理頁面請求
async function handlePageRequest(request) {
  try {
    // 網絡優先策略
    const networkResponse = await fetch(request);
    
    // 緩存成功的頁面響應
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('頁面請求失敗，嘗試從緩存獲取:', request.url);
    
    // 嘗試從緩存獲取
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // 返回離線頁面
    const offlineResponse = await caches.match('/offline.html');
    return offlineResponse || new Response('頁面不可用', { status: 404 });
  }
}

// 處理其他資源請求
async function handleOtherRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    // 緩存成功的響應
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // 嘗試從緩存獲取
    const cachedResponse = await caches.match(request);
    return cachedResponse || new Response('資源不可用', { status: 404 });
  }
}

// 推送通知事件
self.addEventListener('push', (event) => {
  console.log('收到推送通知');
  
  const options = {
    body: '您有新的學習活動',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: '查看詳情',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: '關閉',
        icon: '/icons/xmark.png'
      }
    ]
  };
  
  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.data = { ...options.data, ...data };
  }
  
  event.waitUntil(
    self.registration.showNotification('EduCreate', options)
  );
});

// 通知點擊事件
self.addEventListener('notificationclick', (event) => {
  console.log('通知被點擊:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    // 打開應用
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // 關閉通知
    console.log('通知已關閉');
  } else {
    // 默認行為：打開應用
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// 後台同步事件
self.addEventListener('sync', (event) => {
  console.log('後台同步事件:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// 執行後台同步
async function doBackgroundSync() {
  try {
    console.log('執行後台同步...');
    
    // 獲取離線數據
    const offlineData = await getOfflineData();
    
    // 同步數據到服務器
    for (const item of offlineData) {
      try {
        await syncDataItem(item);
        await markAsSynced(item.id);
      } catch (error) {
        console.error('同步數據項失敗:', item.id, error);
      }
    }
    
    console.log('後台同步完成');
  } catch (error) {
    console.error('後台同步失敗:', error);
  }
}

// 獲取離線數據
async function getOfflineData() {
  // 這裡應該從 IndexedDB 或其他存儲獲取離線數據
  // 簡化實現
  return [];
}

// 同步數據項
async function syncDataItem(item) {
  const response = await fetch('/api/sync', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(item)
  });
  
  if (!response.ok) {
    throw new Error(`同步失敗: ${response.status}`);
  }
  
  return response.json();
}

// 標記為已同步
async function markAsSynced(itemId) {
  // 這裡應該更新 IndexedDB 中的同步狀態
  console.log('標記為已同步:', itemId);
}

// 消息事件 - 與主線程通信
self.addEventListener('message', (event) => {
  console.log('Service Worker 收到消息:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    clearAllCaches().then(() => {
      event.ports[0].postMessage({ success: true });
    });
  }
});

// 清理所有緩存
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  );
  console.log('所有緩存已清理');
}

// 定期清理過期緩存
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(cleanupExpiredCache());
  }
});

// 清理過期緩存
async function cleanupExpiredCache() {
  const cache = await caches.open(DYNAMIC_CACHE);
  const requests = await cache.keys();
  const now = Date.now();
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7天
  
  for (const request of requests) {
    const response = await cache.match(request);
    if (response) {
      const dateHeader = response.headers.get('date');
      if (dateHeader) {
        const responseDate = new Date(dateHeader).getTime();
        if (now - responseDate > maxAge) {
          await cache.delete(request);
          console.log('刪除過期緩存:', request.url);
        }
      }
    }
  }
}

console.log('Service Worker 已載入');
