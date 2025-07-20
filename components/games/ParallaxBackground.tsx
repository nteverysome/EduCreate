import React, { useEffect, useRef, useState } from 'react';
import { BackgroundManager } from '../../lib/games/backgroundManager';

interface ParallaxBackgroundProps {
  theme: 'forest' | 'desert' | 'sky' | 'moon';
  speed?: number;
  disabled?: boolean; // 無障礙設計：允許禁用動畫
}

export const ParallaxBackground: React.FC<ParallaxBackgroundProps> = ({
  theme,
  speed = 1,
  disabled = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [layers, setLayers] = useState<string[]>([]);
  const backgroundManager = useRef(new BackgroundManager());

  useEffect(() => {
    // 載入背景層
    const themeLayers = backgroundManager.current.loadParallaxBackground(theme);
    setLayers(themeLayers);
  }, [theme]);

  useEffect(() => {
    if (disabled) return;

    const handleScroll = () => {
      if (containerRef.current) {
        const scrolled = window.pageYOffset;
        const layerElements = containerRef.current.querySelectorAll('.parallax-layer');
        
        layerElements.forEach((layer, index) => {
          const rate = scrolled * -speed * (index + 1) * 0.1;
          (layer as HTMLElement).style.transform = `translateY(${rate}px)`;
        });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, disabled]);

  return (
    <div 
      ref={containerRef} 
      className="parallax-container fixed inset-0 -z-10"
      role="img"
      aria-label={`${theme} 主題背景`}
    >
      {layers.map((layerSrc, index) => (
        <div
          key={index}
          className="parallax-layer absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${layerSrc})`,
            zIndex: -10 + index
          }}
        />
      ))}
    </div>
  );
};