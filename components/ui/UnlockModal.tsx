import React, { useState, useEffect } from 'react';
import { X, KeyRound, AlertTriangle, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

interface UnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDecryptSubmit: (key: string) => void;
  isDecrypting: boolean;
  errorMessage?: string | null;
}

export default function UnlockModal({ isOpen, onClose, onDecryptSubmit, isDecrypting, errorMessage }: UnlockModalProps) {
  const [decryptionKey, setDecryptionKey] = useState('');

  // Reset input when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setDecryptionKey('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (decryptionKey.length > 0) {
      onDecryptSubmit(decryptionKey);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 font-sans">
      <div 
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in duration-200"
        role="dialog"
        aria-modal="true"
      >
        <button 
          onClick={onClose}
          disabled={isDecrypting}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="px-8 pt-8 pb-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 shadow-inner">
            <KeyRound className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Decrypt Case Vault</h2>
          <p className="text-sm text-slate-500 font-medium">
            Enter the 16-character alphanumeric decryption key provided by the reporter to unlock this evidence.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-8 pb-8 flex flex-col gap-5">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-medium rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <div className="flex justify-between items-center mb-1.5 px-1">
              <label className="text-xs font-bold tracking-widest text-slate-600 uppercase">Decryption Key</label>
              <span className={twMerge(
                clsx(
                  "text-xs font-mono font-medium",
                  decryptionKey.length === 16 ? "text-emerald-500" : "text-slate-400"
                )
              )}>
                {decryptionKey.length} / 16
              </span>
            </div>
            
            <input 
              type="text"
              value={decryptionKey}
              onChange={(e) => {
                const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 16);
                setDecryptionKey(val);
              }}
              disabled={isDecrypting}
              className="w-full text-center font-mono text-lg tracking-widest p-4 border border-slate-300 rounded-xl bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all uppercase placeholder:text-slate-300 disabled:opacity-50"
              placeholder="XXXX-XXXX-XXXX-XXXX"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isDecrypting || decryptionKey.length === 0}
            className="w-full py-4 rounded-xl font-bold tracking-wide text-white transition-all flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
          >
            {isDecrypting ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Decrypting...
              </>
            ) : (
              <>
                <ShieldCheck className="w-5 h-5" />
                Unlock Case
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
