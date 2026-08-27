import React from 'react';
import { MessageSquare, ImageIcon, AlertTriangle, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ParsedLogItem {
  id: string;
  timestamp: number;
  dateTimeISO: string;
  sender: string;
  messageContent: string;
  sourceType: 'WHATSAPP_TXT' | 'SCREENSHOT_OCR';
  confidenceScore?: number;
  flaggedHarassmentTerm?: boolean;
}

interface TimelineViewerProps {
  items: ParsedLogItem[];
  onItemClick?: (item: ParsedLogItem) => void;
}

export default function TimelineViewer({ items, onItemClick }: TimelineViewerProps) {
  // Sort items chronologically
  const sortedItems = [...items].sort((a, b) => a.timestamp - b.timestamp);

  if (!sortedItems.length) {
    return (
      <div className="w-full p-8 text-center rounded-xl bg-white/5 border border-white/10 text-white/50 text-sm">
        No timeline events available.
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto font-sans relative">
      <div className="absolute left-6 top-4 bottom-4 w-px bg-white/10" />
      
      <div className="flex flex-col gap-6">
        {sortedItems.map((item, index) => {
          const isWhatsApp = item.sourceType === 'WHATSAPP_TXT';
          const isFlagged = item.flaggedHarassmentTerm;
          
          return (
            <div 
              key={`${item.id}-${index}`} 
              className={twMerge(
                clsx(
                  "relative flex gap-6 group",
                  onItemClick && "cursor-pointer"
                )
              )}
              onClick={() => onItemClick && onItemClick(item)}
            >
              {/* Timeline dot */}
              <div className="relative z-10 w-12 flex justify-center shrink-0 pt-1">
                <div className={twMerge(
                  clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center border shadow-lg transition-colors",
                    isWhatsApp 
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 group-hover:bg-emerald-500/20" 
                      : "bg-indigo-500/10 border-indigo-500/30 text-indigo-400 group-hover:bg-indigo-500/20"
                  )
                )}>
                  {isWhatsApp ? <MessageSquare className="w-4 h-4" /> : <ImageIcon className="w-4 h-4" />}
                </div>
              </div>
              
              {/* Content Card */}
              <div className={twMerge(
                clsx(
                  "flex-1 p-5 rounded-2xl border bg-black/40 backdrop-blur-md shadow-xl transition-all",
                  isFlagged 
                    ? "border-red-500/30 group-hover:border-red-500/50 group-hover:bg-red-950/20" 
                    : "border-white/10 group-hover:bg-white/5"
                )
              )}>
                
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-white tracking-wide">{item.sender}</span>
                    <span className="text-xs text-white/40 font-mono">
                      {(item.dateTimeISO || item.timestamp) 
                        ? new Date(item.dateTimeISO || item.timestamp).toLocaleString(undefined, {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })
                        : 'Unknown Date'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {item.confidenceScore !== undefined && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-white/50">
                        {Math.round(item.confidenceScore * 100)}% CONF
                      </span>
                    )}
                    <span className={twMerge(
                      clsx(
                        "text-[10px] font-bold tracking-widest px-2 py-0.5 rounded-full uppercase",
                        isWhatsApp ? "bg-emerald-500/20 text-emerald-400" : "bg-indigo-500/20 text-indigo-400"
                      )
                    )}>
                      {isWhatsApp ? 'WhatsApp' : 'OCR Extract'}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-white/80 leading-relaxed font-light whitespace-pre-wrap">
                  {item.messageContent || (item as any).text || (item as any).message || '[No text extracted]'}
                </p>

                {isFlagged && (
                  <div className="mt-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-xs font-semibold uppercase tracking-wide">
                    <ShieldAlert className="w-4 h-4" />
                    Flagged for potential harassment/abuse terms
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
