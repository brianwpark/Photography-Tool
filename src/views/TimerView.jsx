import React, { useState, useEffect } from 'react';
import CircularTimer from '../components/CircularTimer.jsx';
import { soundFx } from '../services/sound.js';
import { Timer, Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, Orbit, Video } from 'lucide-react';

export default function TimerView() {
  const [activeMode, setActiveMode] = useState('bulb'); // 'bulb', 'timelapse', 'star-trails'

  // Bulb Mode state
  const [bulbSeconds, setBulbSeconds] = useState(128); // 2m 08s
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Timelapse Mode state
  const [tlIntervalSec, setTlIntervalSec] = useState(5);
  const [tlTotalPhotos, setTlTotalPhotos] = useState(240);
  const [tlCurrentPhoto, setTlCurrentPhoto] = useState(0);
  const [tlRemainingInterval, setTlRemainingInterval] = useState(5);
  const [isTlRunning, setIsTlRunning] = useState(false);

  // Star Trails Mode state
  const [stSubExposureSec, setStSubExposureSec] = useState(30);
  const [stTotalSubExposures, setStTotalSubExposures] = useState(60);
  const [stCompletedExposures, setStCompletedExposures] = useState(0);
  const [stRemainingSec, setStRemainingSec] = useState(30);
  const [isStRunning, setIsStRunning] = useState(false);

  // Handle sound toggle
  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundFx.toggle(next);
  };

  // Timelapse Intervalometer Engine
  useEffect(() => {
    if (!isTlRunning) return;

    const interval = setInterval(() => {
      setTlRemainingInterval(prev => {
        if (prev <= 1) {
          // Trigger shot!
          soundFx.playTick();
          setTlCurrentPhoto(curr => {
            const next = curr + 1;
            if (next >= tlTotalPhotos) {
              setIsTlRunning(false);
              soundFx.playFinish();
              return tlTotalPhotos;
            }
            return next;
          });
          return tlIntervalSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isTlRunning, tlIntervalSec, tlTotalPhotos]);

  // Star Trails Engine
  useEffect(() => {
    if (!isStRunning) return;

    const interval = setInterval(() => {
      setStRemainingSec(prev => {
        if (prev <= 1) {
          soundFx.playWarning();
          setStCompletedExposures(curr => {
            const next = curr + 1;
            if (next >= stTotalSubExposures) {
              setIsStRunning(false);
              soundFx.playFinish();
              return stTotalSubExposures;
            }
            return next;
          });
          return stSubExposureSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isStRunning, stSubExposureSec, stTotalSubExposures]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-brand-amber/15 text-brand-amber">
              <Timer size={20} />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Multi-Mode Field Timer
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            High-contrast countdown timer with audio chimes for long exposures, time lapses, and Star Trails
          </p>
        </div>

        {/* Audio Toggle & Mode Switcher */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition-all ${
              soundEnabled
                ? 'bg-brand-cyan/15 text-brand-cyan border-brand-cyan/30'
                : 'bg-slate-900 text-slate-500 border-white/5'
            }`}
            title="Toggle Audio Beeps"
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          <div className="flex bg-slate-900 p-1 rounded-xl border border-white/5 text-xs font-mono">
            <button
              onClick={() => setActiveMode('bulb')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeMode === 'bulb'
                  ? 'bg-brand-amber text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Bulb Exposure
            </button>
            <button
              onClick={() => setActiveMode('timelapse')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeMode === 'timelapse'
                  ? 'bg-brand-amber text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Time Lapse
            </button>
            <button
              onClick={() => setActiveMode('star-trails')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeMode === 'star-trails'
                  ? 'bg-brand-amber text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Star Trails
            </button>
          </div>
        </div>
      </div>

      {/* ================= MODE 1: BULB EXPOSURE TIMER ================= */}
      {activeMode === 'bulb' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Circular Countdown Timer (6 Cols) */}
          <div className="lg:col-span-6 glass-card rounded-2xl p-6 flex flex-col items-center justify-center">
            <CircularTimer
              durationSeconds={bulbSeconds}
              autoStart={false}
              label="Bulb Long Exposure"
              onComplete={() => soundFx.playFinish()}
            />
          </div>

          {/* Quick Presets & Custom Duration (6 Cols) */}
          <div className="lg:col-span-6 glass-card rounded-2xl p-5 space-y-4">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block">
              Exposure Duration Presets
            </span>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {[
                { label: '30s', sec: 30 },
                { label: '45s', sec: 45 },
                { label: '1m 00s', sec: 60 },
                { label: '2m 00s', sec: 120 },
                { label: '2m 08s', sec: 128 },
                { label: '3m 00s', sec: 180 },
                { label: '4m 00s', sec: 240 },
                { label: '5m 00s', sec: 300 },
                { label: '8m 00s', sec: 480 },
                { label: '10m 00s', sec: 600 },
                { label: '15m 00s', sec: 900 },
                { label: '30m 00s', sec: 1800 }
              ].map(p => (
                <button
                  key={p.sec}
                  onClick={() => setBulbSeconds(p.sec)}
                  className={`py-2 px-1 rounded-xl text-center font-mono text-xs border transition-all ${
                    bulbSeconds === p.sec
                      ? 'bg-brand-amber text-slate-950 font-bold border-brand-amber shadow-[0_0_12px_rgba(252,163,17,0.3)]'
                      : 'bg-slate-900/60 text-slate-300 border-white/5 hover:bg-slate-800'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Custom Time Stepper */}
            <div className="pt-3 border-t border-white/5 space-y-2">
              <span className="text-xs font-mono text-slate-400 block">Custom Seconds:</span>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="1"
                  max="14400"
                  value={bulbSeconds}
                  onChange={e => setBulbSeconds(Math.max(1, Number(e.target.value)))}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-sm"
                />
                <button
                  onClick={() => setBulbSeconds(s => s + 30)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-mono rounded-xl border border-white/10"
                >
                  +30s
                </button>
                <button
                  onClick={() => setBulbSeconds(s => s + 60)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-mono rounded-xl border border-white/10"
                >
                  +1m
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODE 2: TIME LAPSE INTERVALOMETER ================= */}
      {activeMode === 'timelapse' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-6 glass-card rounded-2xl p-6 flex flex-col items-center justify-between space-y-5">
            <span className="text-xs font-mono uppercase tracking-wider text-brand-cyan font-semibold">
              TIME LAPSE INTERVALOMETER
            </span>

            {/* Interval Ticking Gauge */}
            <div className="text-center font-mono my-4">
              <div className="text-6xl font-black text-brand-cyan tracking-tight">
                {tlRemainingInterval}s
              </div>
              <span className="text-xs text-slate-400 block mt-1">Next Frame Shutter Trigger</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full space-y-2">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Frames Captured:</span>
                <span className="text-white font-bold">{tlCurrentPhoto} / {tlTotalPhotos}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-cyan to-teal-400 transition-all duration-300"
                  style={{ width: `${(tlCurrentPhoto / tlTotalPhotos) * 100}%` }}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setIsTlRunning(!isTlRunning)}
                className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  isTlRunning
                    ? 'bg-red-500 hover:bg-red-400 text-white'
                    : 'bg-brand-cyan hover:bg-brand-cyanHover text-slate-950 shadow-[0_0_15px_rgba(18,214,199,0.3)]'
                }`}
              >
                {isTlRunning ? <Pause size={16} /> : <Play size={16} />}
                <span>{isTlRunning ? 'Pause Intervalometer' : 'Start Intervalometer'}</span>
              </button>
              <button
                onClick={() => {
                  setIsTlRunning(false);
                  setTlCurrentPhoto(0);
                  setTlRemainingInterval(tlIntervalSec);
                }}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-white/10"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* Settings */}
          <div className="lg:col-span-6 glass-card rounded-2xl p-5 space-y-4 font-mono text-xs">
            <span className="uppercase tracking-wider text-slate-400 font-semibold block">
              Intervalometer Configuration
            </span>

            <div>
              <div className="flex justify-between mb-1 text-slate-300">
                <span>Shooting Interval:</span>
                <span className="text-brand-cyan font-bold">{tlIntervalSec} seconds</span>
              </div>
              <input
                type="range"
                min="1"
                max="60"
                value={tlIntervalSec}
                onChange={e => {
                  const val = Number(e.target.value);
                  setTlIntervalSec(val);
                  setTlRemainingInterval(val);
                }}
                className="w-full accent-brand-cyan cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-slate-300">
                <span>Total Photos to Shoot:</span>
                <span className="text-brand-amber font-bold">{tlTotalPhotos} shots</span>
              </div>
              <input
                type="range"
                min="20"
                max="1000"
                step="10"
                value={tlTotalPhotos}
                onChange={e => setTlTotalPhotos(Number(e.target.value))}
                className="w-full accent-brand-amber cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-white/5 space-y-1 text-slate-300 pt-3">
              <div>Total Shooting Time: <span className="text-brand-amber font-bold">{Math.round((tlTotalPhotos * tlIntervalSec) / 60)} minutes</span></div>
              <div>Resulting Video (24 FPS): <span className="text-brand-cyan font-bold">{(tlTotalPhotos / 24).toFixed(1)} seconds</span></div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODE 3: STAR TRAILS TIMER ================= */}
      {activeMode === 'star-trails' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-6 glass-card rounded-2xl p-6 flex flex-col items-center justify-between space-y-5">
            <span className="text-xs font-mono uppercase tracking-wider text-brand-amber font-semibold">
              STAR TRAILS SUB-EXPOSURE TIMER
            </span>

            <div className="text-center font-mono my-4">
              <div className="text-6xl font-black text-brand-amber tracking-tight">
                {stRemainingSec}s
              </div>
              <span className="text-xs text-slate-400 block mt-1">Current Sub-Exposure Ending</span>
            </div>

            <div className="w-full space-y-2">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Sub-Exposures Stacked:</span>
                <span className="text-white font-bold">{stCompletedExposures} / {stTotalSubExposures}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-brand-amber to-yellow-400 transition-all duration-300"
                  style={{ width: `${(stCompletedExposures / stTotalSubExposures) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setIsStRunning(!isStRunning)}
                className={`flex-1 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  isStRunning
                    ? 'bg-red-500 hover:bg-red-400 text-white'
                    : 'bg-brand-amber hover:bg-brand-amberHover text-slate-950 shadow-[0_0_15px_rgba(252,163,17,0.3)]'
                }`}
              >
                {isStRunning ? <Pause size={16} /> : <Play size={16} />}
                <span>{isStRunning ? 'Pause Stack' : 'Start Star Trails Stack'}</span>
              </button>
              <button
                onClick={() => {
                  setIsStRunning(false);
                  setStCompletedExposures(0);
                  setStRemainingSec(stSubExposureSec);
                }}
                className="px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-white/10"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* Settings */}
          <div className="lg:col-span-6 glass-card rounded-2xl p-5 space-y-4 font-mono text-xs">
            <span className="uppercase tracking-wider text-slate-400 font-semibold block">
              Star Trails Parameters
            </span>

            <div>
              <div className="flex justify-between mb-1 text-slate-300">
                <span>Sub-Exposure Shutter:</span>
                <span className="text-brand-amber font-bold">{stSubExposureSec} seconds</span>
              </div>
              <input
                type="range"
                min="10"
                max="60"
                step="5"
                value={stSubExposureSec}
                onChange={e => {
                  const val = Number(e.target.value);
                  setStSubExposureSec(val);
                  setStRemainingSec(val);
                }}
                className="w-full accent-brand-amber cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1 text-slate-300">
                <span>Number of Shots:</span>
                <span className="text-white font-bold">{stTotalSubExposures} shots</span>
              </div>
              <input
                type="range"
                min="10"
                max="300"
                step="5"
                value={stTotalSubExposures}
                onChange={e => setStTotalSubExposures(Number(e.target.value))}
                className="w-full accent-brand-amber cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-white/5 space-y-1 text-slate-300 pt-3">
              <div>Total Session: <span className="text-brand-amber font-bold">{Math.round((stTotalSubExposures * (stSubExposureSec + 1)) / 60)} minutes</span></div>
              <div>Sky Rotation Arc: <span className="text-brand-cyan font-bold">{((((stTotalSubExposures * (stSubExposureSec + 1)) / 3600) * 15.04)).toFixed(1)}° Arc</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
