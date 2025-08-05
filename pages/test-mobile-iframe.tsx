import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';

const MobileIframeTest = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [currentTest, setCurrentTest] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const tests = [
    {
      name: '基本 iframe 測試',
      url: '/games/airplane',
      sandbox: 'allow-same-origin allow-scripts',
      allow: 'fullscreen',
    },
    {
      name: '完整權限 iframe 測試',
      url: '/games/airplane',
      sandbox: 'allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-pointer-lock allow-orientation-lock',
      allow: 'fullscreen; autoplay; microphone; camera; accelerometer; gyroscope',
    },
    {
      name: 'Vite 版本測試',
      url: typeof window !== 'undefined' && window.location.hostname === 'localhost' 
        ? 'http://localhost:3002/' 
        : '/games/airplane',
      sandbox: 'allow-same-origin allow-scripts allow-forms allow-popups allow-modals allow-pointer-lock allow-orientation-lock',
      allow: 'fullscreen; autoplay; microphone; camera; accelerometer; gyroscope; web-share',
    },
  ];

  const runTest = (testIndex: number) => {
    setCurrentTest(testIndex);
    const test = tests[testIndex];
    
    // 記錄測試開始
    const startTime = Date.now();
    const result = {
      ...test,
      startTime,
      status: 'running',
      errors: [],
      logs: [],
    };
    
    setTestResults(prev => [...prev, result]);
    
    // 設置測試超時
    setTimeout(() => {
      const endTime = Date.now();
      setTestResults(prev => prev.map((r, i) => 
        i === prev.length - 1 
          ? { ...r, endTime, duration: endTime - startTime, status: 'completed' }
          : r
      ));
    }, 10000); // 10秒測試時間
  };

  const handleIframeLoad = () => {
    console.log('🎮 iframe 載入完成');
    setTestResults(prev => prev.map((r, i) => 
      i === prev.length - 1 
        ? { ...r, logs: [...r.logs, 'iframe 載入完成'] }
        : r
    ));
  };

  const handleIframeError = (error: any) => {
    console.error('❌ iframe 錯誤:', error);
    setTestResults(prev => prev.map((r, i) => 
      i === prev.length - 1 
        ? { ...r, errors: [...r.errors, error.toString()] }
        : r
    ));
  };

  // 檢測設備信息
  const getDeviceInfo = () => {
    const userAgent = navigator.userAgent;
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    
    return {
      userAgent,
      isMobile,
      isIOS,
      isAndroid,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
      },
      webGL: (() => {
        try {
          const canvas = document.createElement('canvas');
          const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
          return !!gl;
        } catch (e) {
          return false;
        }
      })(),
    };
  };

  const [deviceInfo, setDeviceInfo] = useState<any>(null);

  useEffect(() => {
    setDeviceInfo(getDeviceInfo());
  }, []);

  return (
    <>
      <Head>
        <title>移動端 iframe 測試 - EduCreate</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </Head>
      
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">📱 移動端 iframe 測試</h1>
          
          {/* 設備信息 */}
          {deviceInfo && (
            <div className="bg-white rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold mb-3">設備信息</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>移動設備：</strong> {deviceInfo.isMobile ? '是' : '否'}
                </div>
                <div>
                  <strong>iOS：</strong> {deviceInfo.isIOS ? '是' : '否'}
                </div>
                <div>
                  <strong>Android：</strong> {deviceInfo.isAndroid ? '是' : '否'}
                </div>
                <div>
                  <strong>WebGL 支援：</strong> {deviceInfo.webGL ? '是' : '否'}
                </div>
                <div>
                  <strong>視窗大小：</strong> {deviceInfo.viewport.width} × {deviceInfo.viewport.height}
                </div>
                <div>
                  <strong>像素比：</strong> {deviceInfo.viewport.devicePixelRatio}
                </div>
              </div>
              <div className="mt-3">
                <strong>User Agent：</strong>
                <div className="text-xs text-gray-600 break-all">{deviceInfo.userAgent}</div>
              </div>
            </div>
          )}
          
          {/* 測試控制 */}
          <div className="bg-white rounded-lg p-4 mb-6">
            <h2 className="text-lg font-semibold mb-3">測試控制</h2>
            <div className="flex flex-wrap gap-2">
              {tests.map((test, index) => (
                <button
                  key={index}
                  onClick={() => runTest(index)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    currentTest === index
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  測試 {index + 1}: {test.name}
                </button>
              ))}
            </div>
          </div>
          
          {/* 當前測試 iframe */}
          {currentTest !== null && (
            <div className="bg-white rounded-lg p-4 mb-6">
              <h2 className="text-lg font-semibold mb-3">當前測試：{tests[currentTest].name}</h2>
              <div className="relative bg-gray-100 rounded-lg" style={{ height: '400px' }}>
                <iframe
                  ref={iframeRef}
                  src={tests[currentTest].url}
                  className="w-full h-full border-0 rounded-lg"
                  title={tests[currentTest].name}
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                  allow={tests[currentTest].allow}
                  sandbox={tests[currentTest].sandbox}
                  style={{
                    touchAction: 'manipulation',
                    WebkitTouchCallout: 'none',
                    WebkitUserSelect: 'none',
                    userSelect: 'none'
                  }}
                />
              </div>
            </div>
          )}
          
          {/* 測試結果 */}
          <div className="bg-white rounded-lg p-4">
            <h2 className="text-lg font-semibold mb-3">測試結果</h2>
            {testResults.length === 0 ? (
              <p className="text-gray-500">尚未進行測試</p>
            ) : (
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{result.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${
                        result.status === 'running' ? 'bg-yellow-100 text-yellow-800' :
                        result.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {result.status}
                      </span>
                    </div>
                    
                    {result.duration && (
                      <p className="text-sm text-gray-600">測試時間：{result.duration}ms</p>
                    )}
                    
                    {result.logs.length > 0 && (
                      <div className="mt-2">
                        <strong className="text-sm">日誌：</strong>
                        <ul className="text-sm text-gray-600 ml-4">
                          {result.logs.map((log: string, i: number) => (
                            <li key={i}>• {log}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {result.errors.length > 0 && (
                      <div className="mt-2">
                        <strong className="text-sm text-red-600">錯誤：</strong>
                        <ul className="text-sm text-red-600 ml-4">
                          {result.errors.map((error: string, i: number) => (
                            <li key={i}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileIframeTest;
