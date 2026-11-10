import React from 'react';
import { VOICES } from '../constants/presets';
import { VoiceId } from '../types/tts';
import { User, Check, Volume2 } from 'lucide-react';

interface VoiceSelectorProps {
  selectedVoice: VoiceId;
  onSelectVoice: (id: VoiceId) => void;
  onAuditionVoice?: (voice: (typeof VOICES)[0]) => void;
  lang?: 'km' | 'en';
}

export const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  selectedVoice,
  onSelectVoice,
  onAuditionVoice,
  lang = 'km',
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-400" />
          <span>{lang === 'km' ? 'ជ្រើសរើសតួអង្គសម្លេងមនុស្សពិត' : 'Select Human Voice Persona'}</span>
        </label>
        <span className="text-xs text-slate-400">
          {VOICES.length} {lang === 'km' ? 'សម្លេងស្តង់ដារ' : 'Studio Voices'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {VOICES.map((v) => {
          const isSelected = selectedVoice === v.id;
          return (
            <div
              key={v.id}
              onClick={() => onSelectVoice(v.id)}
              className={`group relative p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500/50'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm border ${v.avatarBg}`}
                  >
                    {v.id.charAt(0)}
                  </div>

                  {isSelected ? (
                    <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-sm">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  ) : (
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                      {lang === 'km' ? v.genderKm : v.gender}
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-100 group-hover:text-white transition-colors">
                  {lang === 'km' ? v.nameKm : v.nameEn}
                </h4>

                <p className="text-[11px] font-medium text-indigo-400 mt-1 line-clamp-1">
                  {lang === 'km' ? v.toneKm : v.toneEn}
                </p>

                <p className="text-[11px] text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                  {lang === 'km' ? v.descriptionKm : v.descriptionEn}
                </p>
              </div>

              {onAuditionVoice && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAuditionVoice(v);
                  }}
                  className="mt-3 flex items-center justify-center gap-1.5 w-full py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-indigo-600/30 hover:text-indigo-300 text-[11px] text-slate-300 transition-colors border border-slate-700/60 cursor-pointer"
                  title={lang === 'km' ? 'សាកល្បងស្តាប់គំរូសម្លេង' : 'Listen voice sample'}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{lang === 'km' ? 'សាកល្បងសម្លេង' : 'Sample Voice'}</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
