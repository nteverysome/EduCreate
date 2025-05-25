import { useEffect, useRef } from 'react';
import Script from 'next/script';

/**
 * H5PEmbed Component
 * 
 * 此組件允許在應用程序中嵌入H5P內容。
 * 它加載H5P JavaScript庫並在頁面中渲染內容。
 * 
 * @param {Object} props
 * @param {string} props.contentId - 要嵌入的H5P內容ID
 * @param {string} props.contentPath - H5P內容的路徑
 * @param {string} props.title - 內容標題
 * @param {number} props.height - 內容高度
 * @param {string} props.width - 內容寬度
 */
const H5PEmbed = ({ 
  contentId, 
  contentPath = '/h5p/content', 
  title = 'H5P Content', 
  height = 400, 
  width = '100%' 
}) => {
  const containerRef = useRef(null);
  const h5pInstanceRef = useRef(null);
  const h5pBasePath = process.env.NEXT_PUBLIC_H5P_BASE_PATH || '';


  useEffect(() => {
    // 確保H5P庫已加載
    if (typeof window !== 'undefined' && window.H5P && containerRef.current) {
      // 清除之前的實例
      if (h5pInstanceRef.current) {
        h5pInstanceRef.current.remove();
      }

      // 初始化H5P內容
      try {
        const h5pPath = `${contentPath}/${contentId}`;
        
        // 使用H5P Standalone庫加載內容，添加基礎路徑
        h5pInstanceRef.current = new window.H5P.Standalone(
          containerRef.current,
          {
            h5pJsonPath: `${h5pBasePath}${h5pPath}/h5p.json`,
            librariesPath: `${h5pBasePath}/h5p/libraries`,
            contentPath: `${h5pBasePath}${h5pPath}`,
            frameCss: `${h5pBasePath}/h5p/styles/h5p.css`,
            frameJs: `${h5pBasePath}/h5p/js/h5p-standalone-frame.js`
          }
        );
      } catch (error) {
        console.error('H5P內容加載失敗:', error);
      }
    }

    // 組件卸載時清理
    return () => {
      if (h5pInstanceRef.current) {
        h5pInstanceRef.current.remove();
      }
    };
  }, [contentId, contentPath, h5pBasePath]);

  return (
    <>
      <Script src={`${h5pBasePath}/h5p/js/h5p-standalone.js`} strategy="afterInteractive" />
      <div className="h5p-container">
        <div 
          ref={containerRef} 
          className="h5p-content" 
          style={{ height, width }}
          title={title}
          data-content-id={contentId}
        />
      </div>
    </>
  );
};

export default H5PEmbed;