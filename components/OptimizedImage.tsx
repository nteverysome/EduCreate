import Image, { ImageProps } from 'next/image';
import { useState, useEffect } from 'react';
type OptimizedImageProps = Omit<ImageProps, 'onLoadingComplete'> & {
  fallbackSrc?: string;
  lowQualitySrc?: string;
  onLoad?: () => void;
};
/**
 * 優化的圖片組件，提供以下功能：
 * - 自動使用WebP/AVIF格式（由Next.js處理）
 * - 漸進式加載
 * - 加載失敗時顯示備用圖片
 * - 支持懶加載
 */
export default function OptimizedImage({
  src,
  alt,
  fallbackSrc = '/images/placeholder.svg',
  lowQualitySrc,
  onLoad,
  ...props
}: OptimizedImageProps) {
  const [imgSrc, setImgSrc] = useState(lowQualitySrc || src);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    // 當src變更時重置狀態
    setImgSrc(lowQualitySrc || src);
    setIsLoaded(false);
    setError(false);
  }, [src, lowQualitySrc]);
  const handleLoad = () => {
    // 如果使用了低質量預覽，在加載完成後切換到高質量圖片
    if (lowQualitySrc && !isLoaded) {
      setImgSrc(src);
    }
    setIsLoaded(true);
    onLoad?.();
  };
  const handleError = () => {
    setError(true);
    setImgSrc(fallbackSrc);
  };
  return (
    <div className={`relative overflow-hidden ${props.className || ''}`} style={props.style}>
      <Image
        {...props}
        src={error ? fallbackSrc : imgSrc}
        alt={alt}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoadingComplete={handleLoad}
        onError={handleError}
        loading="lazy"
        quality={props.quality || 85}
      />
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
    </div>
  );
}
