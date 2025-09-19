// CDN 配置 - 將大型依賴移到 CDN 以減少部署大小

export const CDN_LIBRARIES = {
  // Phaser 遊戲引擎 (140.14 MB → CDN)
  phaser: {
    url: 'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js',
    global: 'Phaser',
    version: '3.90.0'
  },

  // PIXI.js 2D 渲染引擎 (12.28 MB → CDN)
  pixijs: {
    url: 'https://cdn.jsdelivr.net/npm/pixi.js@7.3.2/dist/pixi.min.js',
    global: 'PIXI',
    version: '7.3.2'
  },

  // Lucide React 圖標庫 (17.93 MB → CDN)
  lucide: {
    url: 'https://cdn.jsdelivr.net/npm/lucide@0.263.1/dist/umd/lucide.js',
    global: 'lucide',
    version: '0.263.1'
  },

  // Date-fns 日期處理庫 (21.55 MB → CDN)
  dateFns: {
    url: 'https://cdn.jsdelivr.net/npm/date-fns@4.1.0/index.min.js',
    global: 'dateFns',
    version: '4.1.0'
  }
};

// 動態載入 CDN 庫的工具函數
export const loadCDNLibrary = (libraryName: keyof typeof CDN_LIBRARIES): Promise<any> => {
  return new Promise((resolve, reject) => {
    const lib = CDN_LIBRARIES[libraryName];
    
    // 檢查是否已經載入
    if (typeof window !== 'undefined' && (window as any)[lib.global]) {
      resolve((window as any)[lib.global]);
      return;
    }

    // 創建 script 標籤
    const script = document.createElement('script');
    script.src = lib.url;
    script.async = true;
    
    script.onload = () => {
      if ((window as any)[lib.global]) {
        resolve((window as any)[lib.global]);
      } else {
        reject(new Error(`Failed to load ${libraryName}: ${lib.global} not found`));
      }
    };
    
    script.onerror = () => {
      reject(new Error(`Failed to load ${libraryName} from ${lib.url}`));
    };

    document.head.appendChild(script);
  });
};

// 批量載入多個 CDN 庫
export const loadMultipleCDNLibraries = async (libraries: (keyof typeof CDN_LIBRARIES)[]): Promise<Record<string, any>> => {
  const results: Record<string, any> = {};
  
  for (const libName of libraries) {
    try {
      results[libName] = await loadCDNLibrary(libName);
      console.log(`✅ CDN library loaded: ${libName}`);
    } catch (error) {
      console.error(`❌ Failed to load CDN library: ${libName}`, error);
      throw error;
    }
  }
  
  return results;
};

// React Hook for CDN libraries
export const useCDNLibrary = (libraryName: keyof typeof CDN_LIBRARIES) => {
  const [library, setLibrary] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    loadCDNLibrary(libraryName)
      .then((lib) => {
        setLibrary(lib);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [libraryName]);

  return { library, loading, error };
};
