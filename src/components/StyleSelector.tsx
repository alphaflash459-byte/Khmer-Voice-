import React, { useState } from 'react';
import { STYLE_PRESETS } from '../constants/presets';
import {
  MessageSquareHeart,
  Radio,
  BookOpen,
  Sparkles,
  GraduationCap,
  Clapperboard,
  Headphones,
  Sliders,
  Check,
} from 'lucide-react';

interface StyleSelectorProps {
  selectedPresetId: string;
  customStylePrompt: string;
  onSelectPreset: (presetId: string, prompt: string) => void;
  onChangeCustomPrompt: (prompt: string) => void;
  lang?: 'km' | 'en';
}

const ICON_MAP: Record<string, React.ReactNode> = {
  MessageSquareHeart: <MessageSquareHeart className="w-4 h-4" />,
  Radio: <Radio className="w-4 h-4" />,
  BookOpen: <BookOpen className="w-4 h-4" />,
  Sparkles: <Sparkles className="w-4 h-4" />,
  GraduationCap: <GraduationCap className="w-4 h-4" />,
  Clapperboard: <Clapperboard className="w-4 h-4" />,
  Headphones: <Headphones className="w-4 h-4" />,
};

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  selectedPresetId,
  customStylePrompt,
  onSelectPreset,
  onChangeCustomPrompt,
  lang = 'km',
}) => {
  const [showCustomInput, setShowCustomInput] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-pink-400" />
          <span>{lang === 'km' ? 'អារម្មណ៍ និងទម្រង់សម្លេង (Voice Emotion & Style)' : 'Voice Style & Emotion'}</span>
        </label>

        <button
          type="button"
          onClick={() => setShowCustomInput(!showCustomInput)}
          className={`text-xs flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
            showCustomInput
              ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-3 h-3" />
          <span>{lang === 'km' ? 'កំណត់អារម្មណ៍ផ្ទាល់ខ្លួន' : 'Custom Emotion'}</span>
        </button>
      </div>

      {/* Preset Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {STYLE_PRESETS.map((p) => {
          const isSelected = selectedPresetId === p.id && !showCustomInput;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setShowCustomInput(false);
                onSelectPreset(p.id, p.prompt);
              }}
              className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-950/60 border-indigo-500/80 text-white shadow-md shadow-indigo-500/10'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1">
                <span className={isSelected ? 'text-indigo-400' : 'text-slate-400'}>
                  {ICON_MAP[p.icon] || <Sparkles className="w-4 h-4" />}
                </span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-indigo-400 stroke-[3]" />
                )}
              </div>
              <div>
                <p className="text-xs font-bold leading-snug">
                  {lang === 'km' ? p.labelKm : p.labelEn}
                </p>
                <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                  {p.descriptionKm}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Style Input Box */}
      {showCustomInput && (
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-indigo-500/40 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-indigo-300">
              {lang === 'km'
                ? 'ពិពណ៌នាអំពីទម្រង់សម្លេង និងអារម្មណ៍ដែលអ្នកចង់បាន (Style Prompt):'
                : 'Describe custom voice style & emotion:'}
            </span>
            <span className="text-[10px] text-slate-400">
              {lang === 'km' ? 'ឧ. សម្លេងរីករាយ ស្រស់ស្រាយ និយាយមួយៗ' : 'e.g. Enthusiastic, soothing, confident'}
            </span>
          </div>
          <input
            type="text"
            value={customStylePrompt}
            onChange={(e) => onChangeCustomPrompt(e.target.value)}
            placeholder={
              lang === 'km'
                ? 'ឧ. សម្លេងរំភើប រីករាយ និយាយលឿនល្មម និងច្បាស់ៗ...'
                : 'e.g., Joyful and excited storyteller with natural laughter and warm pauses...'
            }
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      )}
    </div>
  );
};
