import React from 'react';
import { PackageOpen, Plus } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-slate-900/60 border border-dashed border-slate-800 rounded-2xl">
      <div className="p-4 mb-4 rounded-full bg-slate-800/80 text-emerald-400 border border-slate-700/50">
        {icon || <PackageOpen className="w-8 h-8" />}
      </div>
      <h3 className="text-lg font-semibold text-slate-100 mb-1">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction} icon={<Plus className="w-4 h-4" />}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
