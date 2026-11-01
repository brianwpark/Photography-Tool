import React, { useState, useMemo } from 'react';
import { calculateHyperlapseSuite } from '../services/astroCalc.js';
import { Video, HardDrive, Battery, Clock, Orbit, ChevronRight } from 'lucide-react';

export default function TimelapseView({ onSelectView }) {
  const [targetVideoSeconds, setTargetVideoSeconds] = useState(15);
  const [fps, setFps] = useState(24);
  const [intervalSeconds, setIntervalSeconds] = useState(5);
  const [targetRotationAngle, setTargetRotationAngle] = useState(45);
  const [rawSizeMB, setRawSizeMB] = useState(35);

  const suite = useMemo(() => {
    return calculateHyperlapseSuite({
      targetVideoSeconds,
      fps,
      intervalSeconds,
      targetRotationAngleDeg: targetRotationAngle,
      rawFileSizeMB: rawSizeMB
    });
  }, [targetVideoSeconds, fps, intervalSeconds, targetRotationAngle, rawSizeMB]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-brand-cyan/15 text-brand-cyan">
              <Video size={20} />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Hyperlapse & Time Lapse Suite
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Frame counts, intervalometer timing, celestial star rotation & storage sizing
          </p>
        </div>

        <button
          onClick={() => onSelectView('star-trails')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 border border-white/10 self-start sm:self-auto"
        >
          <Orbit size={14} className="text-brand-amber" />
          <span>Star Trails Arc</span>
          <ChevronRight size={13} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Input Parameters Column */}
        <div className="lg:col-span-6 space-y-5">
          {/* Video Duration & Frame Rate */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Target Clip Length
                </span>
                <span className="text-base font-mono font-bold text-brand-cyan">
                  {targetVideoSeconds} seconds
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="5"
                value={targetVideoSeconds}
                onChange={e => setTargetVideoSeconds(Number(e.target.value))}
                className="w-full accent-brand-cyan cursor-pointer"
              />
              <div className="flex gap-2 mt-2">
                {[10, 15, 20, 30, 45, 60].map(s => (
                  <button
                    key={s}
                    onClick={() => setTargetVideoSeconds(s)}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                      targetVideoSeconds === s
                        ? 'bg-brand-cyan text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {s}s
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Rate */}
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-2">
                Playback Frame Rate (FPS)
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[24, 25, 30, 60].map(val => (
                  <button
                    key={val}
                    onClick={() => setFps(val)}
                    className={`py-2 rounded-xl text-center font-mono text-xs border transition-all ${
                      fps === val
                        ? 'bg-brand-cyan text-slate-950 font-bold border-brand-cyan'
                        : 'bg-slate-900/60 border-white/5 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {val} fps
                  </button>
                ))}
              </div>
            </div>

            {/* Shooting Interval */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Interval Between Photos
                </span>
                <span className="text-base font-mono font-bold text-brand-amber">
                  {intervalSeconds} seconds
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="60"
                step="1"
                value={intervalSeconds}
                onChange={e => setIntervalSeconds(Number(e.target.value))}
                className="w-full accent-brand-amber cursor-pointer"
              />
              <div className="flex gap-2 mt-2">
                {[2, 5, 10, 15, 25, 30].map(i => (
                  <button
                    key={i}
                    onClick={() => setIntervalSeconds(i)}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                      intervalSeconds === i
                        ? 'bg-brand-amber text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {i}s
                  </button>
                ))}
              </div>
            </div>

            {/* Desired Star Rotation Angle */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Desired Celestial Star Rotation Angle
                </span>
                <span className="text-base font-mono font-bold text-purple-400">
                  {targetRotationAngle}°
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="180"
                step="15"
                value={targetRotationAngle}
                onChange={e => setTargetRotationAngle(Number(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Results & Field Requirements Column */}
        <div className="lg:col-span-6 space-y-5">
          {/* Main Key Figures */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card rounded-2xl p-5 text-center">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                Total Photos Needed
              </span>
              <div className="text-3xl sm:text-4xl font-mono font-bold text-brand-cyan">
                {suite.totalFrames}
              </div>
              <p className="text-[11px] font-mono text-slate-500 mt-1">
                {suite.targetVideoSeconds}s video @ {suite.fps} fps
              </p>
            </div>

            <div className="glass-card rounded-2xl p-5 text-center">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                Total Shooting Session
              </span>
              <div className="text-3xl sm:text-4xl font-mono font-bold text-brand-amber">
                {suite.totalShootingHours >= 1 ? `${suite.totalShootingHours}h` : `${suite.totalShootingMinutes}m`}
              </div>
              <p className="text-[11px] font-mono text-slate-500 mt-1">
                {suite.totalShootingSeconds} total seconds
              </p>
            </div>
          </div>

          {/* Celestial Star Rotation Analysis Card */}
          <div className="glass-card rounded-2xl p-5 border-purple-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Orbit size={18} className="text-purple-400" />
                <h3 className="text-sm font-bold text-white">Earth & Celestial Star Rotation</h3>
              </div>
              <span className="text-xs font-mono text-purple-400 font-bold bg-purple-500/15 px-2 py-0.5 rounded border border-purple-500/30">
                ~15.04° / hour
              </span>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-white/5 space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Actual Star Rotation During Shoot:</span>
                <span className="text-white font-bold">{suite.resultingStarRotationDeg}°</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">To achieve exactly {suite.targetRotationAngleDeg}° rotation:</span>
                <span className="text-brand-amber font-bold">Use {suite.requiredIntervalSeconds}s interval</span>
              </div>
            </div>
          </div>

          {/* Hardware & Gear Requirements */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Field Gear & Storage Forecast
            </h3>

            <div className="grid grid-cols-2 gap-3 font-mono text-xs">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/15 text-brand-cyan">
                  <HardDrive size={18} />
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Storage Needed</span>
                  <span className="text-sm font-bold text-white">{suite.totalStorageGB} GB</span>
                </div>
              </div>

              <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/15 text-brand-amber">
                  <Battery size={18} />
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Estimated Batteries</span>
                  <span className="text-sm font-bold text-white">~{suite.batteriesEstimated} Battery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
