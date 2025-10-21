/**
 * ImageGrid 組件
 * 圖片網格顯示
 */

'use client';

import React from 'react';
import { UserImage } from './index';

interface ImageGridProps {
  images: UserImage[];
  onSelect: (image: UserImage) => void;
  isSelected: (imageId: string) => boolean;
}

export default function ImageGrid({
  images,
  onSelect,
  isSelected,
}: ImageGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((image) => (
        <div
          key={image.id}
          className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
            isSelected(image.id)
              ? 'border-blue-500 shadow-lg'
              : 'border-transparent hover:border-gray-300 hover:shadow-md'
          }`}
          onClick={() => onSelect(image)}
        >
          {/* Image */}
          <div className="aspect-square bg-gray-100">
            <img
              src={image.url}
              alt={image.alt || image.fileName}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>

          {/* Overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity" />

          {/* Selected Indicator */}
          {isSelected(image.id) && (
            <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1 shadow-lg">
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}

          {/* Info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <p className="text-white text-sm font-medium truncate">
              {image.alt || image.fileName}
            </p>
            {image.photographer && (
              <p className="text-white text-xs opacity-75 truncate">
                by {image.photographer.name}
              </p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-white text-xs bg-black bg-opacity-50 px-2 py-0.5 rounded">
                {image.width} × {image.height}
              </span>
              {image.source === 'unsplash' && (
                <span className="text-white text-xs bg-blue-500 bg-opacity-75 px-2 py-0.5 rounded">
                  Unsplash
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

