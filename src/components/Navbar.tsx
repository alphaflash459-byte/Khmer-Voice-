import React, { useState } from 'react';
import { Radio, Globe, HelpCircle, X, Sparkles, AudioWaveform, Cpu } from 'lucide-react';

interface NavbarProps {
  lang: 'km' | 'en';
  onToggleLang: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ lang, onToggleLang }) => {
  const [showTips, setShowTips] = useState(false);

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-pink-600 to-amber-500 p-0.5 shadow-lg shadow-indigo-600/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <AudioWaveform className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base md:text-lg tracking-tight bg-gradient-to-r from-white via-indigo-100 to-pink-200 bg-clip-text text-transparent">
                {lang === 'km' ? 'សម្លេងមនុស្សពិត AI' : 'Khmer Voice AI'}
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-semibold hidden sm:inline-block">
                Gemini 3.8 Neural Voice
              </span>
            </div>
            <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">
              {lang === 'km'
                ? 'កម្មវិធីបម្លែងអត្ថបទទៅជាសម្លេងមនុស្សពិតកម្រិត Studio 24kHz'
                : 'Studio-Grade Realistic Human Voice & Dialogue Synthesis'}
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Tips / Help */}
          <button
            type="button"
            onClick={() => setShowTips(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 hover:text-white transition-all cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">
              {lang === 'km' ? 'របៀបប្រើ & គន្លឹះ' : 'Tips & Guide'}
            </span>
          </button>

          {/* Language Switcher */}
          <button
            type="button"
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-pink-400" />
            <span>{lang === 'km' ? 'ខ្មែរ / EN' : 'EN / ខ្មែរ'}</span>
          </button>
        </div>
      </div>

      {/* Guide & Tips Modal */}
      {showTips && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowTips(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                {lang === 'km' ? 'គន្លឹះដើម្បីបានសម្លេងដូចមនុស្សពិត ១០០%' : 'Tips for 100% Lifelike Voice'}
              </h3>
            </div>

            <div className="space-y-3 text-xs md:text-sm text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <h4 className="font-semibold text-indigo-300 mb-1">
                  {lang === 'km' ? '១. ប្រើប្រាស់សញ្ញាកាយវិការធម្មជាតិ' : '1. Use Natural Vocal Bursts'}
                </h4>
                <p className="text-slate-400 text-xs">
                  {lang === 'km'
                    ? 'ចុចប៊ូតុង <breath> ដើម្បីបញ្ចូលដង្ហើមធម្មជាតិ ឬ <laugh> ដើម្បីសើច និង |mhm| |yeah| ក្នុងការឆ្លើយឆ្លង។'
                    : 'Insert <breath> for natural pauses, <laugh> for chuckles, or |yeah| / |mhm| for conversational reactions.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <h4 className="font-semibold text-pink-300 mb-1">
                  {lang === 'km' ? '២. ជ្រើសរើសអារម្មណ៍សម្លេងសមស្រប' : '2. Pick the Right Emotion'}
                </h4>
                <p className="text-slate-400 text-xs">
                  {lang === 'km'
                    ? 'ជ្រើសរើសទម្រង់ដូចជា "សន្ទនាធម្មជាតិ", "អ្នកអានព័ត៌មាន", "និទានរឿង", ឬសរសេរកំណត់អារម្មណ៍ផ្ទាល់ខ្លួន។'
                    : 'Select Natural Conversation, News Anchor, Storyteller, or customize your own prompt.'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800">
                <h4 className="font-semibold text-emerald-300 mb-1">
                  {lang === 'km' ? '៣. របៀបសន្ទនា ២ នាក់ (Dialogue Mode)' : '3. Dual-Speaker Dialogue Mode'}
                </h4>
                <p className="text-slate-400 text-xs">
                  {lang === 'km'
                    ? 'បើកផ្ទាំង "ការសន្ទនា ២ នាក់" ដើម្បីបង្កើតសំឡេងពិភាក្សា ឬ Podcast ដែលតួអង្គ ២ នាក់ឆ្លើយឆ្លងគ្នា។'
                    : 'Switch to Dialogue Mode for dual-speaker podcasts and scripts with backchanneling.'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowTips(false)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white transition-colors cursor-pointer"
            >
              {lang === 'km' ? 'យល់ព្រម និងចាប់ផ្តើម' : 'Got it, let’s start'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
