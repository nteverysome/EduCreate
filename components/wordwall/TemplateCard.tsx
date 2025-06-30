import React from 'react';
import Image from 'next/image';
import { GameTemplate } from '../../types/wordwall';

interface TemplateCardProps {
  template: GameTemplate;
  onClick: (template: GameTemplate) => void;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, onClick }) => {
  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer group"
      onClick={() => onClick(template)}
    >
      {/* Template Image */}
      <div className="relative w-full h-48 overflow-hidden rounded-t-lg">
        <Image
          src={template.imageUrl || '/templates/default-template.png'}
          alt={template.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {template.isBeta && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
            Beta
          </div>
        )}
        {template.isDiscontinued && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            Discontinued
          </div>
        )}
      </div>

      {/* Template Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
          {template.name}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-3">
          {template.description}
        </p>
        
        {/* Template Metadata */}
        <div className="mt-3 flex items-center justify-between">
          <span className={`text-xs px-2 py-1 rounded-full ${
            template.category === 'core' 
              ? 'bg-green-100 text-green-800'
              : template.category === 'advanced'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            {template.category}
          </span>
          
          <span className="text-xs text-gray-500 capitalize">
            {template.interactionType}
          </span>
        </div>
      </div>
    </div>
  );
};
