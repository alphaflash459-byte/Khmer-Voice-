import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { VoiceSelector } from './components/VoiceSelector';
import { StyleSelector } from './components/StyleSelector';
import { TextInputArea } from './components/TextInputArea';
import { DialogueEditor } from './components/DialogueEditor';
import { AudioPlayerVisualizer } from './components/AudioPlayerVisualizer';
import { HistoryList } from './components/HistoryList';
import { VOICES, STYLE_PRESETS, SAMPLE_TEXTS } from './constants/presets';
import { VoiceId, SampleText, DialogueLine, AudioRecord } from './types/tts';
import {
  Mic,
  Users,
  Sparkles,
  AlertCircle,
  Volume2,
  CheckCircle2,
  Share2,
} from 'lucide-react';

const STORAGE_KEY = 'khmer_tts_history_v1';

export default function App() {
  const [lang, setLang] = useState<'km' | 'en'>('km');
  const [mode, setMode] = useState<'single' | 'dialogue'>('single');

  // Single Voice State
  const [selectedVoice, setSelectedVoice] = useState<VoiceId>('Kore');
  const [selectedStylePresetId, setSelectedStylePresetId] = useState<string>('natural_conversation');
  const [stylePrompt, setStylePrompt] = useState<string>(
    STYLE_PRESETS[0].prompt
  );
  const [customStylePrompt, setCustomStylePrompt] = useState<string>('');
  const [text, setText] = useState<string>(SAMPLE_TEXTS[1].textKm); // Default to golden bird tale

  // Dialogue Mode State
  const [dialogueLines, setDialogueLines] = useState<DialogueLine[]>([
    {
      id: 'spk1',
      speakerName: 'តារា (Dara)',
      speakerKm: 'តារា',
      voice: 'Puck',
      style: 'Enthusiastic, bright, realistic human voice',
      text: 'សួស្តីសុខា! <breath> តើអ្នកបានឃើញបច្ចេកវិទ្យា Voice AI ថ្មីនេះហើយឬនៅ? សម្លេងដូចមនុស្សពិតណាស់!',
    },
    {
      id: 'spk2',
      speakerName: 'សុខា (Sokha)',
      speakerKm: 'សុខា',
      voice: 'Kore',
      style: 'Warm, pleasant, conversational female voice',
      text: 'ពិតមែនហើយតារា |yeah| សម្លេងពីរោះ និងច្បាស់លាស់ខ្លាំងណាស់ <breath> ដូចមនុស្សនិយាយផ្ទាល់អញ្ចឹង!',
    },
  ]);

  // Generation & Audio Output State
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<{
    audioBase64: string;
    mimeType: string;
    title: string;
    voiceName: string;
    modelUsed: string;
  } | null>(null);

  // History State
  const [history, setHistory] = useState<AudioRecord[]>([]);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to read history from localStorage', e);
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = (record: AudioRecord) => {
    setHistory((prev) => {
      const updated = [record, ...prev.filter((r) => r.id !== record.id)].slice(0, 20);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to persist history', e);
      }
      return updated;
    });
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn(e);
    }
  };

  // Select style preset
  const handleSelectStylePreset = (presetId: string, prompt: string) => {
    setSelectedStylePresetId(presetId);
    setStylePrompt(prompt);
  };

  // Apply quick sample script
  const handleApplySample = (sample: SampleText) => {
    setText(sample.textKm);
    setSelectedVoice(sample.recommendedVoice);
    const preset = STYLE_PRESETS.find((p) => p.id === sample.recommendedStyle);
    if (preset) {
      setSelectedStylePresetId(preset.id);
      setStylePrompt(preset.prompt);
    }
  };

  // Dialogue Line Update
  const handleDialogueLineChange = (index: number, field: keyof DialogueLine, value: string) => {
    setDialogueLines((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Audition voice preview using browser Web Speech API
  const handleAuditionVoice = (voice: (typeof VOICES)[0]) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(voice.sampleAuditionText);
      utterance.rate = 0.95;
      utterance.pitch = voice.gender === 'female' ? 1.15 : 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Generate Single Voice Speech
  const handleGenerateSingle = async () => {
    if (!text.trim()) return;
    setIsGenerating(true);
    setErrorMessage(null);

    const activeStyle = customStylePrompt.trim() ? customStylePrompt.trim() : stylePrompt;

    try {
      const res = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'single',
          text: text.trim(),
          voice: selectedVoice,
          style: activeStyle,
          language: 'km',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'បរាជ័យក្នុងការបង្កើតសម្លេង');
      }

      const voiceProfile = VOICES.find((v) => v.id === selectedVoice);
      const voiceTitle = lang === 'km' ? (voiceProfile?.nameKm || selectedVoice) : selectedVoice;
      const snippet = text.slice(0, 36) + (text.length > 36 ? '...' : '');

      const audioObj = {
        audioBase64: data.audioBase64,
        mimeType: data.mimeType || 'audio/wav',
        title: snippet,
        voiceName: voiceTitle,
        modelUsed: data.modelUsed || 'Gemini 3.8 Flash Lite TTS',
      };

      setCurrentAudio(audioObj);

      // Save to history
      saveToHistory({
        id: 'rec_' + Date.now(),
        title: snippet,
        text: text,
        audioBase64: data.audioBase64,
        mimeType: data.mimeType || 'audio/wav',
        voice: voiceTitle,
        style: activeStyle,
        createdAt: Date.now(),
        mode: 'single',
      });
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message || 'មានបញ្ហាក្នុងការបង្កើតសម្លេង សូមពិនិត្យការតភ្ជាប់ ឬព្យាយាមម្តងទៀត'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate Dialogue Speech
  const handleGenerateDialogue = async () => {
    if (!dialogueLines[0].text.trim() || !dialogueLines[1].text.trim()) return;
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/tts/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'dialogue',
          dialogueParts: dialogueLines,
          language: 'km',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'បរាជ័យក្នុងការបង្កើតការសន្ទនា');
      }

      const title = `${dialogueLines[0].speakerName} & ${dialogueLines[1].speakerName} Dialogue`;
      const audioObj = {
        audioBase64: data.audioBase64,
        mimeType: data.mimeType || 'audio/wav',
        title: title,
        voiceName: `${dialogueLines[0].voice} & ${dialogueLines[1].voice}`,
        modelUsed: data.modelUsed || 'Gemini 3.8 Flash TTS',
      };

      setCurrentAudio(audioObj);

      saveToHistory({
        id: 'rec_' + Date.now(),
        title: title,
        text: `${dialogueLines[0].speakerName}: ${dialogueLines[0].text}\n${dialogueLines[1].speakerName}: ${dialogueLines[1].text}`,
        audioBase64: data.audioBase64,
        mimeType: data.mimeType || 'audio/wav',
        voice: `${dialogueLines[0].voice} + ${dialogueLines[1].voice}`,
        style: 'Dual-Speaker Dialogue',
        createdAt: Date.now(),
        mode: 'dialogue',
      });
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        err.message || 'មានបញ្ហាក្នុងការបង្កើតការសន្ទនា សូមព្យាយាមម្តងទៀត'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar lang={lang} onToggleLang={() => setLang(lang === 'km' ? 'en' : 'km')} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 space-y-6">
        {/* Hero Banner with Studio Taglines */}
        <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-purple-950/80 border border-indigo-500/20 overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-pink-500/10 blur-3xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              <span>{lang === 'km' ? 'បច្ចេកវិទ្យា Gemini 3.8 Neural Audio 24kHz' : 'Gemini 3.8 Neural Audio Master'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
              {lang === 'km'
                ? 'បង្កើតសម្លេងមនុស្សពិត ពីរោះ ធម្មជាតិ ១០០%'
                : 'Ultra-Realistic Human Voice & Dialogue Studio'}
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm md:text-base leading-relaxed">
              {lang === 'km'
                ? 'បម្លែងអត្ថបទភាសាខ្មែរ និងភាសាអន្តរជាតិទៅជាសម្លេងមនុស្សពិត ជាមួយអារម្មណ៍រស់រវើក ការដកដង្ហើមធម្មជាតិ និងសំឡេងឆ្លើយទទួល សម្រាប់ព័ត៌មាន រឿងនិទាន ស្ប៉តពាណិជ្ជកម្ម និង Podcast។'
                : 'Synthesize Khmer & multilingual text into natural human speech with emotive inflection, natural breathing pauses, and dual-speaker screenplays.'}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setMode('single')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                mode === 'single'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Mic className="w-4 h-4" />
              <span>{lang === 'km' ? 'សម្លេងទោល (Single Speaker)' : 'Single Voice'}</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('dialogue')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                mode === 'dialogue'
                  ? 'bg-pink-600 text-white shadow-lg shadow-pink-600/30 ring-1 ring-pink-400'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{lang === 'km' ? 'ការសន្ទនា ២ នាក់ (Dialogue Mode)' : 'Dual-Speaker Dialogue'}</span>
            </button>
          </div>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{lang === 'km' ? 'ការជូនដំណឹង:' : 'Error Notice:'}</p>
              <p className="mt-0.5">{errorMessage}</p>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-400 hover:text-white text-xs font-bold px-2 py-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Main Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Voice and Text Controls (8 cols on lg) */}
          <div className="lg:col-span-8 space-y-6">
            {mode === 'single' ? (
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-5 md:p-6 space-y-6 backdrop-blur-sm">
                {/* Voice Selection */}
                <VoiceSelector
                  selectedVoice={selectedVoice}
                  onSelectVoice={(id) => setSelectedVoice(id)}
                  onAuditionVoice={handleAuditionVoice}
                  lang={lang}
                />

                {/* Voice Style & Emotion Presets */}
                <StyleSelector
                  selectedPresetId={selectedStylePresetId}
                  customStylePrompt={customStylePrompt}
                  onSelectPreset={handleSelectStylePreset}
                  onChangeCustomPrompt={setCustomStylePrompt}
                  lang={lang}
                />

                {/* Text Input Area */}
                <TextInputArea
                  text={text}
                  onChangeText={setText}
                  onGenerate={handleGenerateSingle}
                  isGenerating={isGenerating}
                  onApplySample={handleApplySample}
                  lang={lang}
                  selectedVoice={selectedVoice}
                />
              </div>
            ) : (
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-5 md:p-6 space-y-6 backdrop-blur-sm">
                <DialogueEditor
                  dialogueLines={dialogueLines}
                  onChangeLine={handleDialogueLineChange}
                  onGenerateDialogue={handleGenerateDialogue}
                  isGenerating={isGenerating}
                  lang={lang}
                />
              </div>
            )}
          </div>

          {/* Right Column: Audio Player Visualizer + History (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Audio Player and Frequency Visualizer */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {lang === 'km' ? 'ផ្ទាំងចាក់សម្លេង (Studio Monitor)' : 'Studio Monitor'}
                </span>
                {currentAudio && (
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Master Ready
                  </span>
                )}
              </div>
              <AudioPlayerVisualizer
                audioBase64={currentAudio?.audioBase64 || null}
                mimeType={currentAudio?.mimeType}
                title={currentAudio?.title}
                voiceName={currentAudio?.voiceName}
                modelUsed={currentAudio?.modelUsed}
                lang={lang}
              />
            </div>

            {/* Generation History */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-5 backdrop-blur-sm">
              <HistoryList
                history={history}
                onSelectRecord={(rec) => {
                  setCurrentAudio({
                    audioBase64: rec.audioBase64,
                    mimeType: rec.mimeType,
                    title: rec.title,
                    voiceName: rec.voice,
                    modelUsed: 'Saved Master',
                  });
                }}
                onDeleteRecord={handleDeleteHistoryItem}
                onClearHistory={handleClearHistory}
                lang={lang}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500">
        <p>
          {lang === 'km'
            ? 'កម្មវិធីបម្លែងអត្ថបទទៅជាសម្លេងមនុស្សពិត • បច្ចេកវិទ្យា Gemini 3.8 Neural Speech Engine 24kHz'
            : 'Khmer Voice AI • Powered by Gemini 3.8 Neural Speech Engine 24kHz'}
        </p>
      </footer>
    </div>
  );
}
