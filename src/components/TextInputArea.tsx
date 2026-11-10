import React, { useRef } from 'react';
import { VOCAL_BURSTS, SAMPLE_TEXTS } from '../constants/presets';
import { VoiceId, SampleText } from '../types/tts';
import {
  FileText,
  Trash2,
  ClipboardPaste,
  Sparkles,
  Loader2,
  Clock,
  Mic,
} from 'lucide-react';

interface TextInputAreaProps {
  text: string;
  onChangeText: (text: string) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  onApplySample: (sample: SampleText) => void;
  lang?: 'km' | 'en';
  selectedVoice: VoiceId;
}

export const TextInputArea: React.FC<TextInputAreaProps> = ({
  text,
  onChangeText,
  onGenerate,
  isGenerating,
  onApplySample,
  lang = 'km',
  selectedVoice,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Insert tag at current cursor position
  const insertTag = (tag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChangeText(text + ' ' + tag);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const nextText = `${before}${before.endsWith(' ') || before.length === 0 ? '' : ' '}${tag} ${after}`;

    onChangeText(nextText);

    setTimeout(() => {
      textarea.focus();
      const nextPos = start + tag.length + (before.endsWith(' ') ? 1 : 2);
      textarea.setSelectionRange(nextPos, nextPos);
    }, 10);
  };

  const handlePaste = async () => {
    try {
      const clip = await navigator.clipboard.readText();
      if (clip) {
        onChangeText(text ? `${text}\n${clip}` : clip);
      }
    } catch {
      // ignore
    }
  };

  const charCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  // Estimate ~3.5 words per sec or ~15 chars per sec for Khmer/multilingual speech
  const estSeconds = Math.max(1, Math.round(charCount / 18));

  return (
    <div className="space-y-3">
      {/* Top action row: Title + Samples dropdown + Action buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-400" />
          <span>{lang === 'km' ? 'បញ្ចូលអត្ថបទដែលត្រូវបម្លែងជាសម្លេង' : 'Input Text to Synthesize'}</span>
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick sample script dropdown */}
          <div className="relative inline-block">
            <select
              defaultValue=""
              onChange={(e) => {
                const sample = SAMPLE_TEXTS.find((s) => s.id === e.target.value);
                if (sample) {
                  onApplySample(sample);
                  e.target.value = '';
                }
              }}
              className="bg-slate-900 border border-slate-700 hover:border-slate-600 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="" disabled>
                {lang === 'km' ? '✨ ជ្រើសរើសគំរូអត្ថបទខ្មែរស្រាប់ៗ' : '✨ Load Sample Script'}
              </option>
              {SAMPLE_TEXTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.categoryKm} - {s.titleKm}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handlePaste}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Paste text from clipboard"
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            <span>{lang === 'km' ? 'បិទភ្ជាប់' : 'Paste'}</span>
          </button>

          {text && (
            <button
              type="button"
              onClick={() => onChangeText('')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-rose-900/60 text-xs text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
              title="Clear text"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{lang === 'km' ? 'លុប' : 'Clear'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Vocal burst human cues bar */}
      <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{lang === 'km' ? 'កាយវិការសម្លេងមនុស្សពិត:' : 'Human Vocal Bursts:'}</span>
        </span>
        {VOCAL_BURSTS.map((burst) => (
          <button
            key={burst.tag}
            type="button"
            onClick={() => insertTag(burst.tag)}
            className="px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-indigo-600/30 hover:border-indigo-500/50 border border-slate-700/60 text-[11px] font-medium text-slate-300 hover:text-indigo-200 transition-all cursor-pointer flex items-center gap-1"
            title={burst.desc}
          >
            <span className="font-mono text-indigo-400">{burst.tag}</span>
            <span>({lang === 'km' ? burst.labelKm : burst.labelEn})</span>
          </button>
        ))}
      </div>

      {/* Main Text Area */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder={
            lang === 'km'
              ? 'សូមសរសេរ ឬបិទភ្ជាប់អត្ថបទជាភាសាខ្មែរ ឬភាសាដទៃទៀតនៅទីនេះ...\n\nឧទាហរណ៍៖ "សួស្តីបងប្អូនទាំងអស់គ្នា! <breath> ថ្ងៃនេះខ្ញុំមានដំណឹងពិសេសមួយចង់ចែករំលែក..."'
              : 'Type or paste text here...\n\nExample: "Hello everyone! <breath> Today we are excited to introduce our new voice technology..."'
          }
          rows={6}
          className="w-full p-4 rounded-2xl bg-slate-900/90 border border-slate-800 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/40 text-slate-100 placeholder-slate-500 text-sm md:text-base leading-relaxed resize-y focus:outline-none transition-all"
        />

        {/* Counter and ETA overlay */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 px-1">
          <div className="flex items-center gap-3">
            <span>
              {charCount} {lang === 'km' ? 'តួអក្សរ' : 'chars'}
            </span>
            <span>•</span>
            <span>
              {wordCount} {lang === 'km' ? 'ពាក្យ' : 'words'}
            </span>
            {charCount > 0 && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 text-indigo-400">
                  <Clock className="w-3 h-3" />
                  ~{estSeconds} {lang === 'km' ? 'វិនាទី' : 'sec'}
                </span>
              </>
            )}
          </div>

          <span className="text-[11px] text-slate-500">
            {lang === 'km' ? 'គាំទ្រភាសាខ្មែរ អង់គ្លេស និងភាសាអន្តរជាតិ' : 'Supports Khmer, English & Multilingual'}
          </span>
        </div>
      </div>

      {/* Big Generate Button */}
      <button
        type="button"
        disabled={isGenerating || !text.trim()}
        onClick={onGenerate}
        className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm md:text-base flex items-center justify-center gap-3 shadow-xl transition-all cursor-pointer ${
          isGenerating || !text.trim()
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
            : 'bg-gradient-to-r from-indigo-600 via-indigo-500 to-pink-600 hover:opacity-95 text-white shadow-indigo-600/30 active:scale-[0.99]'
        }`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>
              {lang === 'km'
                ? 'កំពុងបង្កើតសម្លេងមនុស្សពិត 24kHz Studio... សូមរង់ចាំមួយភ្លែត'
                : 'Generating Realistic 24kHz Human Voice... Please wait'}
            </span>
          </>
        ) : (
          <>
            <Mic className="w-5 h-5" />
            <span>
              {lang === 'km'
                ? `បង្កើតសម្លេងមនុស្សពិត (ជាមួយតួអង្គ ${selectedVoice})`
                : `Generate Realistic Speech (with ${selectedVoice})`}
            </span>
          </>
        )}
      </button>
    </div>
  );
};
