/**
 * Image Text Overlay Utility
 * 
 * This utility provides functions to overlay text on images using HTML Canvas API.
 * It supports various text styles including font size, color, background, and positioning.
 */

export interface TextOverlayOptions {
  text: string;
  position: { x: number; y: number }; // percentage (0-100)
  fontSize: 'small' | 'medium' | 'large';
  textColor: 'white' | 'black';
  showBackground: boolean;
}

/**
 * Convert font size to actual pixel value
 */
function getFontSizePixels(fontSize: 'small' | 'medium' | 'large', canvasWidth: number): number {
  const baseSize = canvasWidth / 20; // Responsive to image width
  switch (fontSize) {
    case 'small':
      return baseSize * 0.8;
    case 'medium':
      return baseSize * 1.2;
    case 'large':
      return baseSize * 1.8;
  }
}

/**
 * Load image from URL and return as HTMLImageElement
 */
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Enable CORS
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Wrap text to fit within max width
 */
function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  
  if (currentLine) {
    lines.push(currentLine);
  }
  
  return lines;
}

/**
 * Overlay text on image and return as Blob
 */
export async function overlayTextOnImage(
  imageUrl: string,
  options: TextOverlayOptions
): Promise<Blob> {
  // Load the image
  const img = await loadImage(imageUrl);
  
  // Create canvas with same dimensions as image
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  // Draw the image
  ctx.drawImage(img, 0, 0);
  
  // Calculate text position (convert percentage to pixels)
  const x = (options.position.x / 100) * canvas.width;
  const y = (options.position.y / 100) * canvas.height;
  
  // Set font
  const fontSize = getFontSizePixels(options.fontSize, canvas.width);
  ctx.font = `bold ${fontSize}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Wrap text
  const maxWidth = canvas.width * 0.8; // 80% of canvas width
  const lines = wrapText(ctx, options.text, maxWidth);
  const lineHeight = fontSize * 1.2;
  
  // Calculate total text block height
  const totalHeight = lines.length * lineHeight;
  const startY = y - (totalHeight / 2) + (lineHeight / 2);
  
  // Draw each line
  lines.forEach((line, index) => {
    const lineY = startY + (index * lineHeight);
    
    // Draw background if enabled
    if (options.showBackground) {
      const metrics = ctx.measureText(line);
      const padding = fontSize * 0.4;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(
        x - (metrics.width / 2) - padding,
        lineY - (fontSize / 2) - padding,
        metrics.width + (padding * 2),
        fontSize + (padding * 2)
      );
    }
    
    // Draw text
    ctx.fillStyle = options.textColor === 'white' ? '#FFFFFF' : '#000000';
    ctx.fillText(line, x, lineY);
  });
  
  // Convert canvas to Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('Failed to convert canvas to blob'));
      }
    }, 'image/png');
  });
}

/**
 * Generate a preview URL from Blob (for immediate display)
 */
export function createPreviewUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * Revoke preview URL to free memory
 */
export function revokePreviewUrl(url: string): void {
  URL.revokeObjectURL(url);
}

