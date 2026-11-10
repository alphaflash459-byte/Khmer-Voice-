import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, Download, Volume2, VolumeX, Sparkles, FastForward } from 'lucide-react';

interface AudioPlayerVisualizerProps {
  audioBase64: string | null;
  mimeType?: string;
  title?: string;
  voiceName?: string;
  modelUsed?: string;
  onEnded?: () => void;
  lang?: 'km' | 'en';
}

export const AudioPlayerVisualizer: React.FC<AudioPlayerVisualizerProps> = ({
  audioBase64,
  mimeType = 'audio/wav',
  title = 'សម្លេងដែលបានបង្កើត (Generated Speech)',
  voiceName = 'Kore',
  modelUsed = 'Gemini 3.8 Neural Audio',
  onEnded,
  lang = 'km',
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Initialize or update audio URL from base64
  useEffect(() => {
    if (!audioBase64) {
      setAudioUrl(null);
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      return;
    }

    try {
      const cleanBase64 = audioBase64.replace(/^data:audio\/\w+;base64,/, '');
      const byteCharacters = atob(cleanBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      const url = URL.createObjectURL(blob);

      setAudioUrl(url);
      setIsPlaying(false);
      setCurrentTime(0);

      return () => {
        URL.revokeObjectURL(url);
      };
    } catch (e) {
      console.error('Failed to parse audio base64', e);
    }
  }, [audioBase64, mimeType]);

  // Connect Audio Context to Analyser for real-time visualizer
  const setupAudioContext = useCallback(() => {
    if (!audioRef.current || audioContextRef.current) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.8;

      const source = ctx.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;
    } catch (e) {
      console.warn('AudioContext visualization setup note:', e);
    }
  }, []);

  // Canvas visualizer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const analyser = analyserRef.current;
      const hasRealAudio = isPlaying && analyser;

      if (hasRealAudio) {
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        // Draw frequency bars & glow
        const barWidth = (width / bufferLength) * 2;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const value = dataArray[i];
          const percent = value / 255;
          const barHeight = Math.max(4, percent * (height * 0.85));

          const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
          gradient.addColorStop(0, '#6366f1'); // Indigo
          gradient.addColorStop(0.5, '#ec4899'); // Pink
          gradient.addColorStop(1, '#38bdf8'); // Sky blue

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(x, height / 2 - barHeight / 2, barWidth - 2, barHeight, 3);
          ctx.fill();

          x += barWidth;
        }
      } else {
        // Aesthetic idle / paused waves
        const barCount = 48;
        const barWidth = width / barCount;
        phase += 0.04;

        for (let i = 0; i < barCount; i++) {
          const centerDist = Math.abs(i - barCount / 2) / (barCount / 2);
          const baseHeight = (1 - centerDist) * (height * 0.4);
          const wave = Math.sin(phase + i * 0.25) * 6;
          const h = Math.max(3, baseHeight + wave);

          const gradient = ctx.createLinearGradient(0, height, 0, 0);
          gradient.addColorStop(0, 'rgba(99, 102, 241, 0.2)');
          gradient.addColorStop(1, 'rgba(168, 85, 247, 0.4)');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.roundRect(i * barWidth + 1, height / 2 - h / 2, barWidth - 3, h, 2);
          ctx.fill();
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    setupAudioContext();
    if (audioContextRef.current && audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.error('Play failed:', e);
      });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      if (!isPlaying) {
        togglePlay();
      }
    }
  };

  const handleSpeedChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const nextMute = !isMuted;
      setIsMuted(nextMute);
      audioRef.current.muted = nextMute;
    }
  };

  const downloadAudio = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    const dateStr = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    a.download = `KhmerVoiceAI_${voiceName}_${dateStr}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!audioUrl) {
    return (
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[220px]">
        <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-3 text-indigo-400">
          <Sparkles className="w-7 h-7" />
        </div>
        <h3 className="text-base font-semibold text-slate-200">
          {lang === 'km' ? 'មិនទាន់មានសម្លេងនៅឡើយទេ' : 'No Audio Generated Yet'}
        </h3>
        <p className="text-xs text-slate-400 max-w-md mt-1">
          {lang === 'km'
            ? 'សូមជ្រើសរើសសម្លេងតួអង្គ បញ្ចូលអត្ថបទខាងលើ រួចចុច "បង្កើតសម្លេងមនុស្សពិត" ដើម្បីស្តាប់សម្លេងភ្លាមៗ'
            : 'Select a voice, enter or pick text above, then click "Generate Human Voice" to listen.'}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-slate-950 border border-indigo-500/30 rounded-2xl p-5 md:p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        loop={isLooping}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => {
          setIsPlaying(false);
          if (onEnded) onEnded();
        }}
      />

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <h3 className="text-sm md:text-base font-bold text-white tracking-wide truncate max-w-xs md:max-w-md">
              {title}
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
            <span>{lang === 'km' ? `តួអង្គ: ${voiceName}` : `Speaker: ${voiceName}`}</span>
            <span>•</span>
            <span className="text-indigo-400 font-medium">{modelUsed}</span>
            <span>•</span>
            <span className="text-slate-400">24kHz WAV Master</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={downloadAudio}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 cursor-pointer"
            title={lang === 'km' ? 'ទាញយកឯកសារសម្លេង (Download WAV)' : 'Download Audio File'}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{lang === 'km' ? 'ទាញយក WAV' : 'Download'}</span>
          </button>
        </div>
      </div>

      {/* Visualizer Canvas */}
      <div className="relative w-full h-24 md:h-28 bg-slate-950/70 rounded-xl overflow-hidden border border-slate-800/80 mb-4 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={640}
          height={110}
          className="w-full h-full object-cover"
        />
        {isPlaying && (
          <div className="absolute top-2 right-3 px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-[10px] font-mono text-rose-300 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
            {lang === 'km' ? 'កំពុងបន្លឺសម្លេង' : 'PLAYING'}
          </div>
        )}
      </div>

      {/* Timeline Scrubbing */}
      <div className="space-y-1 mb-4">
        <div className="relative flex items-center group">
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.05"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
          />
        </div>
        <div className="flex justify-between text-[11px] font-mono text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Control Buttons Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Playback rate presets */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          {[0.75, 1.0, 1.25, 1.5].map((rate) => (
            <button
              key={rate}
              onClick={() => handleSpeedChange(rate)}
              className={`px-2 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer ${
                playbackRate === rate
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {rate}x
            </button>
          ))}
        </div>

        {/* Center Primary Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRestart}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
            title={lang === 'km' ? 'ចាប់ផ្តើមឡើងវិញ' : 'Restart'}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-pink-500 hover:opacity-95 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-indigo-500/40 transition-all cursor-pointer"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = Math.min(duration, currentTime + 5);
              }
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 active:scale-95 transition-all cursor-pointer"
            title={lang === 'km' ? 'ទៅមុខ ៥ វិនាទី' : 'Forward 5s'}
          >
            <FastForward className="w-4 h-4" />
          </button>
        </div>

        {/* Volume & Loop */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              isLooping
                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'km' ? 'វិលជុំ' : 'Loop'}
          </button>

          <div className="flex items-center gap-1.5 bg-slate-950/80 px-2 py-1 rounded-xl border border-slate-800">
            <button
              onClick={toggleMute}
              className="text-slate-400 hover:text-white cursor-pointer"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-14 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
