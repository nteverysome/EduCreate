import React from 'react';

interface SortOptionsProps {
  sortBy: 'popular' | 'alphabetical';
  onSortChange: (sortBy: 'popular' | 'alphabetical') => void;
}

export const SortOptions: React.FC<SortOptionsProps> = ({ sortBy, onSortChange }) => {
  return (
    <div className="flex items-center gap-4">
      <span className="text-sm font-medium text-gray-700">Sort by:</span>
      
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => onSortChange('popular')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            sortBy === 'popular'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Most popular
        </button>
        <button
          onClick={() => onSortChange('alphabetical')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            sortBy === 'alphabetical'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Alphabetical
        </button>
      </div>
    </div>
  );
};
