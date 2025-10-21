'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { X, RotateCw, RotateCcw, ZoomIn, ZoomOut, Check } from 'lucide-react';

export interface ImageEditorProps {
  imageUrl: string;
  onSave: (editedImageBlob: Blob, editedImageUrl: string) => void;
  onCancel: () => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function ImageEditor({ imageUrl, onSave, onCancel }: ImageEditorProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);
  const [filter, setFilter] = useState('none');
  const [saving, setSaving] = useState(false);

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: CropArea) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: CropArea,
    rotation: number,
    filter: string
  ): Promise<{ blob: Blob; url: string }> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    const maxSize = Math.max(image.width, image.height);
    const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

    canvas.width = safeArea;
    canvas.height = safeArea;

    ctx.translate(safeArea / 2, safeArea / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-safeArea / 2, -safeArea / 2);

    ctx.drawImage(
      image,
      safeArea / 2 - image.width * 0.5,
      safeArea / 2 - image.height * 0.5
    );

    const data = ctx.getImageData(0, 0, safeArea, safeArea);

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.putImageData(
      data,
      Math.round(0 - safeArea / 2 + image.width * 0.5 - pixelCrop.x),
      Math.round(0 - safeArea / 2 + image.height * 0.5 - pixelCrop.y)
    );

    // Apply filter
    if (filter !== 'none') {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      switch (filter) {
        case 'grayscale':
          for (let i = 0; i < data.length; i += 4) {
            const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
            data[i] = avg;
            data[i + 1] = avg;
            data[i + 2] = avg;
          }
          break;
        case 'sepia':
          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
            data[i + 1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
            data[i + 2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
          }
          break;
        case 'invert':
          for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];
            data[i + 1] = 255 - data[i + 1];
            data[i + 2] = 255 - data[i + 2];
          }
          break;
        case 'brightness':
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, data[i] + 50);
            data[i + 1] = Math.min(255, data[i + 1] + 50);
            data[i + 2] = Math.min(255, data[i + 2] + 50);
          }
          break;
        case 'contrast':
          const factor = 1.5;
          for (let i = 0; i < data.length; i += 4) {
            data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
            data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
            data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
          }
          break;
      }

      ctx.putImageData(imageData, 0, 0);
    }

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        const url = URL.createObjectURL(blob);
        resolve({ blob, url });
      }, 'image/jpeg', 0.95);
    });
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    setSaving(true);
    try {
      const { blob, url } = await getCroppedImg(
        imageUrl,
        croppedAreaPixels,
        rotation,
        filter
      );
      onSave(blob, url);
    } catch (error) {
      console.error('Error saving image:', error);
      alert('保存圖片失敗，請重試');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-black/80 p-4 flex items-center justify-between">
        <h2 className="text-white text-lg font-semibold">編輯圖片</h2>
        <button
          onClick={onCancel}
          className="text-white hover:text-gray-300 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Cropper */}
      <div className="absolute top-16 left-0 right-0 bottom-48 md:bottom-40">
        <Cropper
          image={imageUrl}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={undefined}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onRotationChange={setRotation}
          onCropComplete={onCropComplete}
        />
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-white p-4 space-y-4">
        {/* Zoom */}
        <div className="flex items-center gap-3">
          <ZoomOut className="w-5 h-5 text-gray-600" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1"
          />
          <ZoomIn className="w-5 h-5 text-gray-600" />
        </div>

        {/* Rotation */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 w-16">旋轉:</span>
          <button
            onClick={() => setRotation((r) => r - 90)}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-sm">-90°</span>
          </button>
          <button
            onClick={() => setRotation((r) => r + 90)}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-1"
          >
            <RotateCw className="w-4 h-4" />
            <span className="text-sm">+90°</span>
          </button>
          <button
            onClick={() => setRotation(0)}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm"
          >
            重置
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 w-16">濾鏡:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="none">無濾鏡</option>
            <option value="grayscale">灰階</option>
            <option value="sepia">棕褐色</option>
            <option value="invert">反轉</option>
            <option value="brightness">增加亮度</option>
            <option value="contrast">增加對比度</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>保存中...</span>
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                <span>保存</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

