'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import WordwallStyleFolderCard from './WordwallStyleFolderCard';

interface ResultFolder {
  id: string;
  name: string;
  resultCount: number;
  createdAt: string;
  color?: string;
}

interface DraggableFolderCardProps {
  folder: ResultFolder;
  onClick: (folder: ResultFolder) => void;
  onMenuClick?: (folder: ResultFolder, event: React.MouseEvent) => void;
}

export const DraggableFolderCard: React.FC<DraggableFolderCardProps> = ({
  folder,
  onClick,
  onMenuClick
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `folder-${folder.id}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`${isDragging ? 'z-50' : ''}`}
    >
      <WordwallStyleFolderCard
        folder={folder}
        onClick={onClick}
        onMenuClick={onMenuClick}
      />
    </div>
  );
};

export default DraggableFolderCard;
