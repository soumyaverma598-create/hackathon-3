'use client';

import { ChangeEvent, memo } from 'react';
import { FileText, Upload } from 'lucide-react';

interface ChecklistItemWithUploadProps {
  id: string;
  label: string;
  checked: boolean;
  onToggle: (id: string) => void;
  uploadedFileName?: string;
  onFileSelect: (id: string, file: File | null) => void;
  description?: string;
  index?: number;
  checkedClassName?: string;
  uncheckedClassName?: string;
}

const baseClassName =
  'flex items-start gap-3 p-3 rounded-lg border transition-all select-none';

const ChecklistItemWithUpload = memo(function ChecklistItemWithUpload({
  id,
  label,
  checked,
  onToggle,
  uploadedFileName,
  onFileSelect,
  description,
  index,
  checkedClassName = 'bg-cyan-50 border-[#164e63]/40',
  uncheckedClassName = 'bg-gray-50 border-gray-200 hover:border-[#164e63]/30',
}: ChecklistItemWithUploadProps) {
  const inputId = `upload-${id}`;

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    onFileSelect(id, event.target.files?.[0] ?? null);
  };

  return (
    <div className={`${baseClassName} ${checked ? checkedClassName : uncheckedClassName}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(id)}
        className="mt-0.5 w-4 h-4 accent-[#164e63] shrink-0 cursor-pointer"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-800 leading-relaxed">
          {typeof index === 'number' ? `${index + 1}. ` : ''}
          {label}
        </p>
        {description && (
          <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{description}</p>
        )}
        {uploadedFileName && (
          <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-white/80 px-2 py-1 text-xs text-[#164e63] border border-cyan-100">
            <FileText size={12} />
            <span className="truncate max-w-52">{uploadedFileName}</span>
          </div>
        )}
      </div>
      <div className="shrink-0">
        <label
          htmlFor={inputId}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#164e63]/20 bg-white px-3 py-2 text-xs font-semibold text-[#164e63] cursor-pointer hover:bg-cyan-50 transition-colors"
        >
          <Upload size={13} />
          {uploadedFileName ? 'Change File' : 'Upload File'}
        </label>
        <input
          id={inputId}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
});

export default ChecklistItemWithUpload;