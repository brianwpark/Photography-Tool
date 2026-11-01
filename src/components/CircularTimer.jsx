import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { soundFx } from '../services/sound.js';
import confetti from 'canvas-confetti';

export default function CircularTimer({
  totalSeconds = 128,
  label = 'Bulb Exposure',
  onFinish
}) {
  const [remaining, setRemaining] = useState(totalSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const timerRef = useRef(null);

  // Sync remaining when totalSeconds changes and timer is idle
  useEffect(() => {
    if (!isRunning) {
      setRemaining(totalSeconds);
    }
  }, [totalSeconds, isRunning]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            if (soundEnabled) soundFx.playFinish();
            confetti({
              particleCount: 50,
              spread: 60,
              origin: { y: 0.7 }
            });
            if (onFinish) onFinish();
            return 0;
          }
          if (prev <= 4 && prev > 1 && soundEnabled) {
            soundFx.playWarning();
          } else if (soundEnabled && prev % 5 === 0) {
            soundFx.playTick();
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, soundEnabled, onFinish]);

  const toggleRun = () => {
    soundFx.init();
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setRemaining(totalSeconds);
  };

  // SVG circular perimeter: 2 * Math.PI * 45 = 282.74
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = totalSeconds > 0 ? remaining / totalSeconds : 0;
  const strokeDashoffset = circumference * (1 - progressRatio);

  const formatDisplay = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-44 h-44 flex items-center justify-center">
        {/* Ambient Ring Glow */}
        <div className={`absolute inset-4 rounded-full transition-all duration-500 ${isRunning ? 'bg-brand-amber/10 blur-xl' : 'opacity-0'}`} />

        <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
          {/* Background Track */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="6"
          />
          {/* Animated Countdown Circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="transparent"
            stroke={remaining === 0 ? '#12d6c7' : '#fca311'}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-linear"
          />
        </svg>

        {/* Center Readout */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-mono font-bold tracking-tight text-white">
            {formatDisplay(remaining)}
          </span>
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mt-1">
            {isRunning ? 'Exposing...' : label}
          </span>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-3 mt-4">
        <button
          type="button"
          onClick={() => {
            const next = !soundEnabled;
            setSoundEnabled(next);
            soundFx.toggle(next);
          }}
          className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-white/5 transition-all active:scale-95"
          title={soundEnabled ? 'Mute sound alerts' : 'Enable sound alerts'}
        >
          {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        <button
          type="button"
          onClick={toggleRun}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold text-sm transition-all shadow-lg active:scale-95 ${
            isRunning
              ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
              : 'bg-brand-cyan hover:bg-brand-cyanHover text-slate-950 shadow-brand-cyan/20'
          }`}
        >
          {isRunning ? <Pause size={16} /> : <Play size={16} />}
          <span>{isRunning ? 'Pause' : 'Start Exposure'}</span>
        </button>

        <button
          type="button"
          onClick={resetTimer}
          className="p-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-white/5 transition-all active:scale-95"
          title="Reset timer"
        >
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
}
