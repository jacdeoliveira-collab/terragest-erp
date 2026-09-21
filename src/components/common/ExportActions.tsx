import React from 'react';
import { FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from './Button';

interface ExportActionsProps {
  onExportPDF: () => void;
  onExportExcel: () => void;
  disabled?: boolean;
}

export const ExportActions: React.FC<ExportActionsProps> = ({
  onExportPDF,
  onExportExcel,
  disabled = false
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={onExportPDF}
        disabled={disabled}
        icon={<FileText className="w-4 h-4 text-rose-400" />}
      >
        Exportar PDF
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={onExportExcel}
        disabled={disabled}
        icon={<FileSpreadsheet className="w-4 h-4 text-emerald-400" />}
      >
        Exportar Excel
      </Button>
    </div>
  );
};
