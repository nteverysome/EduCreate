import React, { useState, useMemo } from 'react';
import { TemplateCard } from './TemplateCard';
import { SearchBar } from './SearchBar';
import { SortOptions } from './SortOptions';
import { GameTemplate } from '../../types/wordwall';

interface TemplateGridProps {
  templates: GameTemplate[];
  onTemplateSelect: (template: GameTemplate) => void;
}

export const TemplateGrid: React.FC<TemplateGridProps> = ({ 
  templates, 
  onTemplateSelect 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'alphabetical'>('popular');

  // Filter and sort templates
  const filteredAndSortedTemplates = useMemo(() => {
    let filtered = templates.filter(template => 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (sortBy === 'alphabetical') {
      filtered = filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // Sort by popularity (core templates first, then advanced, then beta)
      filtered = filtered.sort((a, b) => {
        const categoryOrder = { core: 0, advanced: 1, beta: 2 };
        return categoryOrder[a.category] - categoryOrder[b.category];
      });
    }

    return filtered;
  }, [templates, searchQuery, sortBy]);

  // Separate active and discontinued templates
  const activeTemplates = filteredAndSortedTemplates.filter(t => !t.isDiscontinued);
  const discontinuedTemplates = filteredAndSortedTemplates.filter(t => t.isDiscontinued);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Pick a template</h1>
            <p className="text-gray-600">Choose from our collection of interactive learning games</p>
          </div>
          
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search templates..."
          />
        </div>

        <SortOptions 
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
      </div>

      {/* Active Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-12">
        {activeTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            onClick={onTemplateSelect}
          />
        ))}
      </div>

      {/* No Results Message */}
      {activeTemplates.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">No templates found</div>
          <p className="text-gray-500">Try adjusting your search terms</p>
        </div>
      )}

      {/* Discontinued Templates Section */}
      {discontinuedTemplates.length > 0 && (
        <div className="mt-16">
          <h2 className="text-xl font-semibold text-gray-700 mb-6 flex items-center">
            <span className="mr-2">⚠️</span>
            Discontinued Templates
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 opacity-60">
            {discontinuedTemplates.map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onClick={onTemplateSelect}
              />
            ))}
          </div>
        </div>
      )}

      {/* Template Statistics */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Template Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{activeTemplates.length}</div>
            <div className="text-sm text-gray-600">Active Templates</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {activeTemplates.filter(t => t.category === 'core').length}
            </div>
            <div className="text-sm text-gray-600">Core Games</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {activeTemplates.filter(t => t.category === 'advanced').length}
            </div>
            <div className="text-sm text-gray-600">Advanced Games</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-orange-600">
              {activeTemplates.filter(t => t.isBeta).length}
            </div>
            <div className="text-sm text-gray-600">Beta Features</div>
          </div>
        </div>
      </div>
    </div>
  );
};
