import React, { useState, useMemo } from 'react';
import {
  calculateDoF,
  SENSOR_PRESETS,
  APERTURE_STOPS,
  COMMON_FOCAL_LENGTHS
} from '../services/opticalCalc.js';
import RotaryDial from '../components/RotaryDial.jsx';
import { Focus, Table, Info, ChevronRight } from 'lucide-react';

export default function DofView({ onSelectView }) {
  const [sensorId, setSensorId] = useState('full-frame');
  const [focalLength, setFocalLength] = useState(50);
  const [apertureIndex, setApertureIndex] = useState(9); // f/2.8 in 1/3-stop series
  const [distance, setDistance] = useState(3.0);


  const aperture = APERTURE_STOPS[apertureIndex] || 2.8;

  const result = useMemo(() => {
    return calculateDoF({
      focalLengthMm: focalLength,
      aperture,
      distanceMeters: distance,
      sensorId
    });
  }, [focalLength, aperture, distance, sensorId]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-brand-cyan/15 text-brand-cyan">
              <Focus size={20} />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Depth of Field & Hyperfocal Calculator
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Optical sharpness limits, circle of confusion, and hyperfocal threshold
          </p>
        </div>

        <button
          onClick={() => onSelectView('dof-table')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-mono text-slate-300 hover:text-white border border-white/10 transition-all self-start sm:self-auto active:scale-95"
        >
          <Table size={15} className="text-brand-cyan" />
          <span>Open DoF Matrix Table</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Main Grid: Controls vs Visual Depth Scale */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Controls Column */}
        <div className="lg:col-span-6 space-y-5">
          {/* Sensor Format Card */}
          <div className="glass-card rounded-2xl p-5">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 block font-semibold">
              Camera Sensor Size
            </label>
            <div className="grid grid-cols-2 gap-2">
              {SENSOR_PRESETS.slice(0, 6).map(s => (
                <button
                  key={s.id}
                  onClick={() => setSensorId(s.id)}
                  className={`p-2.5 rounded-xl text-left border transition-all text-xs ${
                    sensorId === s.id
                      ? 'bg-brand-cyan/15 border-brand-cyan/40 text-brand-cyan font-bold shadow-[0_0_12px_rgba(18,214,199,0.15)]'
                      : 'bg-slate-900/60 border-white/5 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="font-semibold">{s.name.split('(')[0]}</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Crop: {s.crop}x • CoC: {s.coc}mm
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Focal Length & Distance Card */}
          <div className="glass-card rounded-2xl p-5 space-y-5">
            {/* Focal Length */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Focal Length
                </span>
                <span className="text-base font-mono font-bold text-brand-cyan">
                  {focalLength} mm
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="300"
                step="1"
                value={focalLength}
                onChange={e => setFocalLength(Number(e.target.value))}
                className="w-full accent-brand-cyan cursor-pointer"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[14, 24, 35, 50, 85, 135, 200].map(f => (
                  <button
                    key={f}
                    onClick={() => setFocalLength(f)}
                    className={`px-2 py-1 rounded text-[11px] font-mono transition-all ${
                      focalLength === f
                        ? 'bg-brand-cyan text-slate-950 font-bold'
                        : 'bg-slate-800/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    {f}mm
                  </button>
                ))}
              </div>
            </div>

            {/* Subject Distance */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Subject Distance
                </span>
                <span className="text-base font-mono font-bold text-brand-amber">
                  {distance.toFixed(1)} m
                </span>
              </div>
              <input
                type="range"
                min="0.3"
                max="30"
                step="0.1"
                value={distance}
                onChange={e => setDistance(Number(e.target.value))}
                className="w-full accent-brand-amber cursor-pointer"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[1, 2, 3, 5, 10, 15, 25].map(d => (
                  <button
                    key={d}
                    onClick={() => setDistance(d)}
                    className={`px-2 py-1 rounded text-[11px] font-mono transition-all ${
                      Math.abs(distance - d) < 0.1
                        ? 'bg-brand-amber text-slate-950 font-bold'
                        : 'bg-slate-800/80 text-slate-400 hover:text-white'
                    }`}
                  >
                    {d}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Aperture Rotary Dial in 1/3-Stop Increments */}
          <div className="glass-card rounded-2xl p-5 flex flex-col items-center">
            <RotaryDial
              options={APERTURE_STOPS.map(s => `f/${s}`)}
              selectedIndex={apertureIndex}
              onChange={setApertureIndex}
              label="Tactile Lens Aperture Stop (1/3 Stop Steps)"
            />

            {/* Quick-Jump to Major Base Stops */}
            <div className="flex flex-wrap justify-center gap-1.5 mt-3 pt-3 border-t border-white/5 w-full">
              {[1.4, 1.8, 2.0, 2.8, 4.0, 5.6, 8.0, 11, 16, 22].map(baseStop => {
                const idx = APERTURE_STOPS.indexOf(baseStop);
                const isSelected = apertureIndex === idx;
                return (
                  <button
                    key={baseStop}
                    type="button"
                    onClick={() => setApertureIndex(idx)}
                    className={`px-2 py-1 rounded text-[11px] font-mono transition-all ${
                      isSelected
                        ? 'bg-brand-cyan text-slate-950 font-bold'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    f/{baseStop}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Results & Visual Scale Column */}
        <div className="lg:col-span-6 space-y-5">
          {/* Key Output Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="glass-card rounded-2xl p-4 text-center">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                Hyperfocal Distance
              </span>
              <span className="text-2xl sm:text-3xl font-mono font-bold text-brand-cyan">
                {result.hyperfocalMeters} m
              </span>
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                Sharp from {(result.hyperfocalMeters / 2).toFixed(1)}m to Infinity
              </p>
            </div>

            <div className="glass-card rounded-2xl p-4 text-center">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block mb-1">
                Total Depth of Field
              </span>
              <span className="text-2xl sm:text-3xl font-mono font-bold text-brand-amber">
                {result.isInfinite ? 'Infinity' : `${result.totalDofMeters} m`}
              </span>
              <p className="text-[10px] text-slate-500 font-mono mt-1">
                {result.inFrontPercent}% in front • {result.behindPercent}% behind
              </p>
            </div>
          </div>

          {/* Sharp Limits Breakdown */}
          <div className="glass-card rounded-2xl p-5 space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-slate-400">Near Sharp Limit:</span>
              <span className="text-white font-bold text-sm">{result.nearLimitMeters} m</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-slate-400">Subject Distance:</span>
              <span className="text-brand-amber font-bold text-sm">{result.distanceMeters.toFixed(2)} m</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-slate-400">Far Sharp Limit:</span>
              <span className="text-white font-bold text-sm">
                {result.isInfinite ? 'Infinity (∞)' : `${result.farLimitMeters} m`}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-400">Circle of Confusion (CoC):</span>
              <span className="text-slate-300 font-semibold">{result.cocMm} mm</span>
            </div>
          </div>

          {/* Graphical Optical Focus Visualizer */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-4">
              Optical Sharpness Zone Visualizer
            </h3>

            {/* Depth Distribution Bar */}
            <div className="relative h-14 bg-slate-900 rounded-xl overflow-hidden border border-white/10 p-1 flex items-center">
              {/* Near unsharp blur */}
              <div 
                className="h-full bg-slate-800/80 rounded-l flex items-center justify-center text-[10px] font-mono text-slate-500"
                style={{ width: '25%' }}
              >
                Soft
              </div>

              {/* Acceptable Sharpness Range */}
              <div 
                className="h-full bg-gradient-to-r from-brand-cyan/20 via-brand-cyan/40 to-brand-cyan/20 border-x-2 border-brand-cyan rounded flex items-center justify-center text-xs font-mono text-brand-cyan font-bold shadow-[0_0_15px_rgba(18,214,199,0.3)] relative"
                style={{ width: '50%' }}
              >
                {/* Subject Position Pin */}
                <div className="absolute top-0 bottom-0 w-1 bg-brand-amber left-1/2 -translate-x-1/2 flex flex-col items-center justify-between py-0.5">
                  <div className="w-2 h-2 rounded-full bg-brand-amber shadow-[0_0_8px_#fca311]" />
                  <div className="w-2 h-2 rounded-full bg-brand-amber" />
                </div>
                <span>SHARP DEPTH</span>
              </div>

              {/* Far unsharp or infinity */}
              <div 
                className="h-full bg-slate-800/80 rounded-r flex items-center justify-center text-[10px] font-mono text-slate-500"
                style={{ width: '25%' }}
              >
                {result.isInfinite ? 'Sharp to ∞' : 'Soft'}
              </div>
            </div>

            {/* Scale Labels */}
            <div className="flex justify-between items-center text-[11px] font-mono text-slate-400 mt-2 px-1">
              <span>Camera (0m)</span>
              <span className="text-brand-cyan font-bold">Near: {result.nearLimitMeters}m</span>
              <span className="text-brand-amber font-bold">Subject: {result.distanceMeters}m</span>
              <span>Far: {result.isInfinite ? '∞' : `${result.farLimitMeters}m`}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
