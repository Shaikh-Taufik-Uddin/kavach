import React, { useState, useCallback, useRef } from 'react';
import { UploadCloud, File, X, AlertCircle, Shield, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface DropzoneProps {
  onFilesSelected: (files: File[]) => void;
  isProcessing: boolean;
  processingProgress?: number;
  errorAlert?: string | null;
}

export default function Dropzone({
  onFilesSelected,
  isProcessing,
  processingProgress,
  errorAlert,
}: DropzoneProps) {
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files).filter(f => 
        f.type === 'text/plain' || f.type === 'image/png' || f.type === 'image/jpeg'
      );
      setStagedFiles(prev => [...prev, ...newFiles]);
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setStagedFiles(prev => [...prev, ...newFiles]);
    }
    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (indexToRemove: number) => {
    setStagedFiles(prev => prev.filter((_, i) => i !== indexToRemove));
  };

  const handleSubmit = () => {
    if (stagedFiles.length > 0) {
      onFilesSelected(stagedFiles);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 font-sans">
      {errorAlert && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{errorAlert}</p>
        </div>
      )}

      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={twMerge(
          clsx(
            "relative w-full p-10 flex flex-col items-center justify-center gap-4 cursor-pointer border-2 border-dashed rounded-xl transition-colors overflow-hidden",
            isDragActive ? "border-indigo-500 bg-indigo-50" : "border-slate-300 bg-slate-50 hover:bg-slate-100",
            isProcessing && "pointer-events-none opacity-50"
          )
        )}
      >
        <div className="p-4 rounded-full bg-indigo-500/10 text-indigo-400 mb-2 border border-indigo-500/20">
          <UploadCloud className="w-8 h-8" />
        </div>
        <div className="text-center">
          <p className="text-lg font-medium text-slate-600 tracking-tight mb-1">
            Drag & drop evidence files
          </p>
          <p className="text-sm text-slate-500 font-light">
            Supports .txt (WhatsApp exports), .png, and .jpg (Screenshots)
          </p>
        </div>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".txt, .png, .jpeg, .jpg"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isProcessing}
        />
      </div>

      {stagedFiles.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold tracking-widest text-slate-500 uppercase">Staged Files ({stagedFiles.length})</h3>
          <ul className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {stagedFiles.map((file, idx) => (
              <li key={`${file.name}-${idx}`} className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200 group hover:bg-slate-50 transition-colors shadow-sm">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 rounded bg-indigo-50 text-indigo-600">
                    <File className="w-4 h-4" />
                  </div>
                  <span className="text-sm text-slate-800 font-medium truncate">{file.name}</span>
                  <span className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</span>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                  disabled={isProcessing}
                  className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex flex-col gap-3">
            {isProcessing && processingProgress !== undefined && (
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-indigo-500 h-full transition-all duration-300 ease-out rounded-full" 
                  style={{ width: `${Math.max(0, Math.min(100, processingProgress))}%` }}
                />
              </div>
            )}
            
            <button
              onClick={handleSubmit}
              disabled={isProcessing}
              className="w-full py-4 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold tracking-wide transition-all shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing Evidence...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Encrypt & Process Evidence
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
