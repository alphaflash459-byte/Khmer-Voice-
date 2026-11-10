import React from 'react';
import { AudioRecord } from '../types/tts';
import { History, Play, Download, Trash2, Clock, Volume2 } from 'lucide-react';

interface HistoryListProps {
  history: AudioRecord[];
  onSelectRecord: (record: AudioRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearHistory: () => void;
  lang?: 'km' | 'en';
}

export const HistoryList: React.FC<HistoryListProps> = ({
  history,
  onSelectRecord,
  onDeleteRecord,
  onClearHistory,
  lang = 'km',
}) => {
  if (history.length === 0) {
    return (
      <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 text-center text-slate-500 text-xs">
        <History className="w-6 h-6 mx-auto mb-2 opacity-40" />
        <p>
          {lang === 'km'
            ? 'មិនទាន់មានប្រវត្តិបង្កើតសម្លេងនៅឡើយទេ'
            : 'No generation history yet'}
        </p>
      </div>
    );
  }

  const downloadItem = (record: AudioRecord) => {
    try {
      const cleanBase64 = record.audioBase64.replace(/^data:audio\/\w+;base64,/, '');
      const byteCharacters = atob(cleanBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: record.mimeType || 'audio/wav' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${record.title.replace(/\s+/g, '_')}.wav`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
    }
  };

  const formatDate = (timestamp: number) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-400" />
          <span>{lang === 'km' ? 'ប្រវត្តិបង្កើតសម្លេង (History)' : 'Generation History'}</span>
          <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-indigo-400">
            {history.length}
          </span>
        </label>

        <button
          type="button"
          onClick={onClearHistory}
          className="text-xs text-slate-400 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{lang === 'km' ? 'សម្អាតទាំងអស់' : 'Clear All'}</span>
        </button>
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
        {history.map((item) => (
          <div
            key={item.id}
            onClick={() => onSelectRecord(item)}
            className="group p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-indigo-500/50 hover:bg-slate-900 transition-all flex items-center justify-between gap-3 cursor-pointer"
          >
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                className="w-9 h-9 rounded-xl bg-indigo-500/10 group-hover:bg-indigo-600 text-indigo-400 group-hover:text-white flex items-center justify-center transition-colors shrink-0"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-200 truncate">
                    {item.title}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                    {item.voice}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 truncate max-w-sm md:max-w-md mt-0.5">
                  {item.text}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5 font-mono">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{formatDate(item.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  downloadItem(item);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Download WAV"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteRecord(item.id);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
