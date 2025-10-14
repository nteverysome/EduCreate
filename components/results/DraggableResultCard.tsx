'use client';

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import WordwallStyleResultCard from './WordwallStyleResultCard';

interface AssignmentResult {
  id: string;
  title: string;
  activityName: string;
  studentCount: number;
  completedCount: number;
  createdAt: string;
  deadline?: string;
  folderId?: string;
  assignmentId: string;
  activityId: string;
}

interface DraggableResultCardProps {
  result: AssignmentResult;
  onClick: (result: AssignmentResult) => void;
  onMenuClick?: (result: AssignmentResult, event: React.MouseEvent) => void;
}

export const DraggableResultCard: React.FC<DraggableResultCardProps> = ({
  result,
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
  } = useSortable({ id: `result-${result.id}` });

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
      <WordwallStyleResultCard
        result={result}
        onClick={onClick}
        onMenuClick={onMenuClick}
      />
    </div>
  );
};

export default DraggableResultCard;
