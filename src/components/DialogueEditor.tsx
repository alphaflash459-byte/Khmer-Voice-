import React from 'react';
import { VOICES } from '../constants/presets';
import { VoiceId, DialogueLine } from '../types/tts';
import { Users, Mic, Loader2, Sparkles, MessageSquare } from 'lucide-react';

interface DialogueEditorProps {
  dialogueLines: DialogueLine[];
  onChangeLine: (index: number, field: keyof DialogueLine, value: string) => void;
  onGenerateDialogue: () => void;
  isGenerating: boolean;
  lang?: 'km' | 'en';
}

export const DialogueEditor: React.FC<DialogueEditorProps> = ({
  dialogueLines,
  onChangeLine,
  onGenerateDialogue,
  isGenerating,
  lang = 'km',
}) => {
  const speaker1 = dialogueLines[0];
  const speaker2 = dialogueLines[1];

  const insertCue = (index: number, cue: string) => {
    const current = dialogueLines[index]?.text || '';
    onChangeLine(index, 'text', current ? `${current} ${cue}` : cue);
  };

  return (
    <div className="space-y-4">
      <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3">
        <Users className="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
        <div className="text-xs text-indigo-200 leading-relaxed">
          <p className="font-semibold text-white">
            {lang === 'km'
              ? 'របៀបសន្ទនា ២ នាក់ (Dual-Speaker Podcast & Dialogue Engine)'
              : 'Dual-Speaker Dialogue & Screenplay Engine'}
          </p>
          <p className="text-slate-300 mt-0.5">
            {lang === 'km'
              ? 'បច្ចេកវិទ្យា Gemini 3.8 Flash TTS អនុញ្ញាតឱ្យតួអង្គ ២ នាក់ឆ្លើយឆ្លងគ្នាប្រកបដោយភាពរស់រវើក គាំទ្រសំឡេងឆ្លើយទទួល |yeah|, |mhm| និងកាយវិការដកដង្ហើមធម្មជាតិ។'
              : 'Powered by Gemini 3.8 Flash TTS for lifelike podcast dialogue, backchanneling (|yeah|, |mhm|), and conversational flow.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Speaker 1 Card */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                {lang === 'km' ? 'តួអង្គទី ១ (Speaker 1)' : 'Speaker 1'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                {lang === 'km' ? 'ឈ្មោះតួអង្គ' : 'Name'}
              </label>
              <input
                type="text"
                value={speaker1.speakerName}
                onChange={(e) => onChangeLine(0, 'speakerName', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                {lang === 'km' ? 'សម្លេងតួអង្គ' : 'Voice'}
              </label>
              <select
                value={speaker1.voice}
                onChange={(e) => onChangeLine(0, 'voice', e.target.value as VoiceId)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {VOICES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.id} ({lang === 'km' ? v.genderKm : v.gender})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">
              {lang === 'km' ? 'ចរិត ឬអារម្មណ៍សម្លេង' : 'Voice Emotion & Style'}
            </label>
            <input
              type="text"
              value={speaker1.style}
              onChange={(e) => onChangeLine(0, 'style', e.target.value)}
              placeholder="Enthusiastic, clear, friendly..."
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] text-slate-400">
                {lang === 'km' ? 'ខ្លឹមសារនិយាយ' : 'Dialogue Line'}
              </label>
              <div className="flex gap-1">
                {['<breath>', '<laugh>', '|yeah|'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => insertCue(0, c)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 hover:bg-slate-700 font-mono"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows={4}
              value={speaker1.text}
              onChange={(e) => onChangeLine(0, 'text', e.target.value)}
              placeholder="សូមសរសេរពាក្យដែលតួអង្គទី ១ ត្រូវនិយាយ..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
            />
          </div>
        </div>

        {/* Speaker 2 Card */}
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-cyan-500"></span>
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                {lang === 'km' ? 'តួអង្គទី ២ (Speaker 2)' : 'Speaker 2'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                {lang === 'km' ? 'ឈ្មោះតួអង្គ' : 'Name'}
              </label>
              <input
                type="text"
                value={speaker2.speakerName}
                onChange={(e) => onChangeLine(1, 'speakerName', e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                {lang === 'km' ? 'សម្លេងតួអង្គ' : 'Voice'}
              </label>
              <select
                value={speaker2.voice}
                onChange={(e) => onChangeLine(1, 'voice', e.target.value as VoiceId)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                {VOICES.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.id} ({lang === 'km' ? v.genderKm : v.gender})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">
              {lang === 'km' ? 'ចរិត ឬអារម្មណ៍សម្លេង' : 'Voice Emotion & Style'}
            </label>
            <input
              type="text"
              value={speaker2.style}
              onChange={(e) => onChangeLine(1, 'style', e.target.value)}
              placeholder="Curious, thoughtful, warm..."
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] text-slate-400">
                {lang === 'km' ? 'ខ្លឹមសារនិយាយ' : 'Dialogue Line'}
              </label>
              <div className="flex gap-1">
                {['<breath>', '<laugh>', '|mhm|'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => insertCue(1, c)}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 hover:bg-slate-700 font-mono"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows={4}
              value={speaker2.text}
              onChange={(e) => onChangeLine(1, 'text', e.target.value)}
              placeholder="សូមសរសេរពាក្យដែលតួអង្គទី ២ ត្រូវឆ្លើយតប..."
              className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Generate Dialogue Button */}
      <button
        type="button"
        disabled={isGenerating || !speaker1.text.trim() || !speaker2.text.trim()}
        onClick={onGenerateDialogue}
        className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm md:text-base flex items-center justify-center gap-3 shadow-xl transition-all cursor-pointer ${
          isGenerating || !speaker1.text.trim() || !speaker2.text.trim()
            ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
            : 'bg-gradient-to-r from-pink-600 via-indigo-600 to-cyan-600 hover:opacity-95 text-white shadow-indigo-600/30 active:scale-[0.99]'
        }`}
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>
              {lang === 'km'
                ? 'កំពុងបង្កើតការសន្ទនា ២ នាក់ (Gemini 3.8 Flash TTS)...'
                : 'Generating Dual-Speaker Audio...'}
            </span>
          </>
        ) : (
          <>
            <MessageSquare className="w-5 h-5" />
            <span>
              {lang === 'km'
                ? `បង្កើតសម្លេងសន្ទនា ២ នាក់ (${speaker1.speakerName} & ${speaker2.speakerName})`
                : `Generate Dual-Speaker Conversation (${speaker1.speakerName} & ${speaker2.speakerName})`}
            </span>
          </>
        )}
      </button>
    </div>
  );
};
