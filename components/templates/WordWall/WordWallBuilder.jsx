import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PlusCircleIcon, XCircleIcon, PencilIcon } from '@heroicons/react/24/outline';

/**
 * Word Item Component
 * Represents a single word in the word wall
 */
const WordItem = ({ id, word, definition, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  
  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="bg-white p-4 rounded-lg shadow-md border border-gray-200 flex justify-between items-center group"
    >
      <div className="flex-1 cursor-move" {...attributes} {...listeners}>
        <h3 className="font-medium text-gray-900">{word}</h3>
        <p className="text-sm text-gray-500">{definition}</p>
      </div>
      <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button 
          onClick={() => onEdit(id)} 
          className="text-blue-500 hover:text-blue-700"
          aria-label="Edit word"
        >
          <PencilIcon className="h-5 w-5" />
        </button>
        <button 
          onClick={() => onDelete(id)} 
          className="text-red-500 hover:text-red-700"
          aria-label="Delete word"
        >
          <XCircleIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

/**
 * Word Form Component
 * Form for adding or editing words
 */
const WordForm = ({ word = '', definition = '', onSubmit, onCancel, isEditing = false }) => {
  const [wordValue, setWordValue] = useState(word);
  const [definitionValue, setDefinitionValue] = useState(definition);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (wordValue.trim() && definitionValue.trim()) {
      onSubmit({
        word: wordValue.trim(),
        definition: definitionValue.trim()
      });
      setWordValue('');
      setDefinitionValue('');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-4">
      <div className="mb-4">
        <label htmlFor="word" className="block text-sm font-medium text-gray-700 mb-1">
          Word
        </label>
        <input
          type="text"
          id="word"
          value={wordValue}
          onChange={(e) => setWordValue(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="definition" className="block text-sm font-medium text-gray-700 mb-1">
          Definition
        </label>
        <textarea
          id="definition"
          value={definitionValue}
          onChange={(e) => setDefinitionValue(e.target.value)}
          rows="3"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        ></textarea>
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {isEditing ? 'Update' : 'Add'} Word
        </button>
      </div>
    </form>
  );
};

/**
 * Word Wall Settings Component
 * Configuration options for the word wall
 */
const WordWallSettings = ({ settings, onSettingsChange }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    onSettingsChange({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 mb-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Word Wall Settings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={settings.title}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-1">
            Theme
          </label>
          <select
            id="theme"
            name="theme"
            value={settings.theme}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="default">Default</option>
            <option value="colorful">Colorful</option>
            <option value="minimal">Minimal</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="columns" className="block text-sm font-medium text-gray-700 mb-1">
            Columns
          </label>
          <select
            id="columns"
            name="columns"
            value={settings.columns}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1">1 Column</option>
            <option value="2">2 Columns</option>
            <option value="3">3 Columns</option>
            <option value="4">4 Columns</option>
          </select>
        </div>
        
        <div className="flex items-center">
          <input
            type="checkbox"
            id="showDefinitions"
            name="showDefinitions"
            checked={settings.showDefinitions}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="showDefinitions" className="ml-2 block text-sm text-gray-700">
            Show definitions by default
          </label>
        </div>
      </div>
    </div>
  );
};

/**
 * Word Wall Preview Component
 * Displays a preview of the word wall
 */
const WordWallPreview = ({ words, settings }) => {
  const columns = parseInt(settings.columns) || 1;
  const themeClasses = {
    default: 'bg-white border-gray-200 text-gray-900',
    colorful: 'bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 text-indigo-900',
    minimal: 'bg-gray-50 border-gray-100 text-gray-800',
    dark: 'bg-gray-800 border-gray-700 text-white'
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Preview</h2>
      
      {settings.title && (
        <h3 className="text-xl font-bold mb-4 text-center">{settings.title}</h3>
      )}
      
      <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-4`}>
        {words.map((word) => (
          <div 
            key={word.id} 
            className={`p-3 rounded-md shadow-sm border ${themeClasses[settings.theme] || themeClasses.default}`}
          >
            <h4 className="font-medium">{word.word}</h4>
            {settings.showDefinitions && (
              <p className="text-sm mt-1">{word.definition}</p>
            )}
          </div>
        ))}
      </div>
      
      {words.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Add words to see the preview</p>
        </div>
      )}
    </div>
  );
};

/**
 * Main WordWallBuilder Component
 * Manages the entire word wall building experience
 */
const WordWallBuilder = ({ initialWords = [], initialSettings = {}, onSave }) => {
  const [words, setWords] = useState(initialWords);
  const [settings, setSettings] = useState({
    title: 'My Word Wall',
    theme: 'default',
    columns: '3',
    showDefinitions: true,
    ...initialSettings
  });
  const [showForm, setShowForm] = useState(false);
  const [editingWord, setEditingWord] = useState(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      setWords((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id);
        const newIndex = items.findIndex(item => item.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
  
  const handleAddWord = (wordData) => {
    const newWord = {
      id: `word-${Date.now()}`,
      ...wordData
    };
    
    setWords([...words, newWord]);
    setShowForm(false);
  };
  
  const handleEditWord = (id) => {
    const wordToEdit = words.find(word => word.id === id);
    if (wordToEdit) {
      setEditingWord(wordToEdit);
      setShowForm(true);
    }
  };
  
  const handleUpdateWord = (wordData) => {
    setWords(words.map(word => 
      word.id === editingWord.id ? { ...word, ...wordData } : word
    ));
    setEditingWord(null);
    setShowForm(false);
  };
  
  const handleDeleteWord = (id) => {
    setWords(words.filter(word => word.id !== id));
  };
  
  const handleSave = () => {
    if (onSave) {
      onSave({ words, settings });
    }
  };
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Word Wall Builder</h1>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          Save Word Wall
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <WordWallSettings 
            settings={settings} 
            onSettingsChange={setSettings} 
          />
          
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Words</h2>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <PlusCircleIcon className="h-5 w-5 mr-1" />
                Add Word
              </button>
            )}
          </div>
          
          {showForm && (
            <WordForm 
              word={editingWord?.word || ''}
              definition={editingWord?.definition || ''}
              onSubmit={editingWord ? handleUpdateWord : handleAddWord}
              onCancel={() => {
                setShowForm(false);
                setEditingWord(null);
              }}
              isEditing={!!editingWord}
            />
          )}
          
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={words.map(word => word.id)}>
              <div className="space-y-3">
                {words.map(word => (
                  <WordItem 
                    key={word.id}
                    id={word.id}
                    word={word.word}
                    definition={word.definition}
                    onEdit={handleEditWord}
                    onDelete={handleDeleteWord}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
          
          {words.length === 0 && !showForm && (
            <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">No words added yet. Click "Add Word" to get started.</p>
            </div>
          )}
        </div>
        
        <div>
          <WordWallPreview words={words} settings={settings} />
        </div>
      </div>
    </div>
  );
};

export default WordWallBuilder;