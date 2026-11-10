import React, { useState, useMemo } from 'react';
import { SENSOR_PRESETS } from '../services/opticalCalc.js';
import { calculateFocalLengthFromDistance } from '../services/fovCalc.js';
import {
  Ruler,
  Focus,
  Maximize2,
  ChevronRight,
  Check,
  Camera,
  Cpu,
  Layers,
  Sparkles,
  Info
} from 'lucide-react';

export default function SubjectDistanceView({ onSelectView }) {
  // Mode switcher: 'find_focal_length' (Optimal, Min, Max from Distance & MP) vs 'find_distance' (Distance from Focal Length)
  const [activeMode, setActiveMode] = useState('find_focal_length');

  // Common shared inputs
  const [objectDimensionMeters, setObjectDimensionMeters] = useState(1.8); // 1.8m human adult
  const [sensorId, setSensorId] = useState('full-frame');
  const [frameCoveragePercent, setFrameCoveragePercent] = useState(75); // 75% vertical frame coverage

  // Mode 1: Find Focal Length Inputs
  const [subjectDistanceMeters, setSubjectDistanceMeters] = useState(5.0); // 5.0m distance
  const [sensorMegapixels, setSensorMegapixels] = useState(24); // 24 MP default

  // Mode 2: Find Distance Input
  const [lensFocalLengthMm, setLensFocalLengthMm] = useState(50); // 50mm

  const sensor = SENSOR_PRESETS.find(s => s.id === sensorId) || SENSOR_PRESETS[0];

  // --- MODE 1: Calculate Optimal, Minimal & Maximum Focal Length ---
  const focalLengthResult = useMemo(() => {
    return calculateFocalLengthFromDistance({
      distanceMeters: subjectDistanceMeters,
      subjectHeightMeters: objectDimensionMeters,
      frameCoveragePercent,
      sensorId,
      sensorMegapixels
    });
  }, [subjectDistanceMeters, objectDimensionMeters, frameCoveragePercent, sensorId, sensorMegapixels]);

  // --- MODE 2: Calculate Required Distance from Focal Length ---
  const requiredDistanceMeters = useMemo(() => {
    const sensorVerticalPortionMm = sensor.height * (frameCoveragePercent / 100);
    const objectDimensionMm = objectDimensionMeters * 1000;
    const distanceMm = lensFocalLengthMm * (1 + (objectDimensionMm / sensorVerticalPortionMm));
    return Number((distanceMm / 1000).toFixed(2));
  }, [objectDimensionMeters, lensFocalLengthMm, sensor, frameCoveragePercent]);

  // Navigate to DoF Calculator and transfer parameters
  const handleApplyToDof = (targetDistance, targetFocalLength) => {
    if (onSelectView) {
      onSelectView('dof', 'calc', {
        distance: targetDistance,
        focalLength: targetFocalLength,
        sensorId
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-brand-cyan/15 text-brand-cyan">
              <Ruler size={22} />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Subject Distance & Focal Length Suite
              </h1>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Solve for optimal focal lengths, coverage margins, and required shooting distances
              </p>
            </div>
          </div>
        </div>

        {/* Mode Selector Toggle */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-white/10 text-xs font-mono self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveMode('find_focal_length')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeMode === 'find_focal_length'
                ? 'bg-brand-cyan text-slate-950 font-bold shadow-[0_0_12px_rgba(18,214,199,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera size={13} />
            <span>Find Focal Length (Optimal/Min/Max)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('find_distance')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeMode === 'find_distance'
                ? 'bg-brand-cyan text-slate-950 font-bold shadow-[0_0_12px_rgba(18,214,199,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Ruler size={13} />
            <span>Find Shooting Distance</span>
          </button>
        </div>
      </div>

      {/* --- MODE 1: CALCULATE OPTIMAL, MINIMAL & MAXIMUM FOCAL LENGTH --- */}
      {activeMode === 'find_focal_length' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Inputs Column (6 cols) */}
          <div className="lg:col-span-6 glass-card rounded-2xl p-5 space-y-5">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <Camera size={16} className="text-brand-cyan" />
              <h2 className="text-xs font-mono uppercase tracking-wider text-white font-bold">
                Camera, Subject & Coverage Inputs
              </h2>
            </div>

            {/* 1. Subject Distance */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="subject-distance-num" className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
                  <span>1. Subject Distance:</span>
                </label>
                <span className="text-xs font-mono text-slate-400">
                  ≈ {(subjectDistanceMeters * 3.28084).toFixed(1)} ft
                </span>
              </div>

              {/* Number Input Box with Unit Badge */}
              <div className="relative flex items-center mb-2">
                <input
                  id="subject-distance-num"
                  type="number"
                  min="0.1"
                  max="10000"
                  step="0.1"
                  value={subjectDistanceMeters === 0 ? '' : subjectDistanceMeters}
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    setSubjectDistanceMeters(isNaN(val) ? 0 : Math.max(0.1, val));
                  }}
                  className="w-full bg-slate-900 text-brand-cyan font-mono text-lg font-bold px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-brand-cyan focus:ring-1 focus:ring-brand-cyan transition-all"
                  placeholder="Enter distance in meters..."
                />
                <span className="absolute right-3.5 text-xs font-mono font-bold text-slate-400 pointer-events-none uppercase">
                  meters
                </span>
              </div>

              {/* Range Slider for fast adjustment */}
              <input
                type="range"
                min="0.5"
                max={Math.max(50, Math.ceil(subjectDistanceMeters * 1.2))}
                step="0.5"
                value={subjectDistanceMeters}
                onChange={e => setSubjectDistanceMeters(Number(e.target.value))}
                className="w-full accent-brand-cyan cursor-pointer"
              />

              {/* Presets */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  { label: 'Close (2m)', val: 2.0 },
                  { label: 'Studio (5m)', val: 5.0 },
                  { label: 'Event (10m)', val: 10.0 },
                  { label: 'Sports (25m)', val: 25.0 },
                  { label: 'Wildlife (50m)', val: 50.0 },
                  { label: 'Distant (100m)', val: 100.0 }
                ].map(item => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setSubjectDistanceMeters(item.val)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                      subjectDistanceMeters === item.val
                        ? 'bg-brand-cyan text-slate-950 font-bold'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Subject Height */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="subject-height-num" className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  2. Real Subject Height:
                </label>
                <span className="text-xs font-mono text-slate-400">
                  ≈ {(objectDimensionMeters * 100).toFixed(0)} cm
                </span>
              </div>

              {/* Number Input Box with Unit Badge */}
              <div className="relative flex items-center mb-2">
                <input
                  id="subject-height-num"
                  type="number"
                  min="0.05"
                  max="1000"
                  step="0.05"
                  value={objectDimensionMeters === 0 ? '' : objectDimensionMeters}
                  onChange={e => {
                    const val = parseFloat(e.target.value);
                    setObjectDimensionMeters(isNaN(val) ? 0 : Math.max(0.05, val));
                  }}
                  className="w-full bg-slate-900 text-brand-amber font-mono text-lg font-bold px-3.5 py-2.5 rounded-xl border border-white/10 focus:outline-none focus:border-brand-amber focus:ring-1 focus:ring-brand-amber transition-all"
                  placeholder="Enter height in meters..."
                />
                <span className="absolute right-3.5 text-xs font-mono font-bold text-slate-400 pointer-events-none uppercase">
                  meters
                </span>
              </div>

              <input
                type="range"
                min="0.2"
                max="25"
                step="0.1"
                value={objectDimensionMeters}
                onChange={e => setObjectDimensionMeters(Number(e.target.value))}
                className="w-full accent-brand-amber cursor-pointer"
              />
              {/* Presets */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  { label: 'Head (0.25m)', val: 0.25 },
                  { label: 'Half-Body (0.9m)', val: 0.9 },
                  { label: 'Adult (1.8m)', val: 1.8 },
                  { label: 'Vehicle (1.5m)', val: 1.5 },
                  { label: 'Tree (6m)', val: 6.0 },
                  { label: 'Building (15m)', val: 15.0 }
                ].map(item => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setObjectDimensionMeters(item.val)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                      objectDimensionMeters === item.val
                        ? 'bg-brand-amber text-slate-950 font-bold'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Vertical Frame Coverage */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  3. Vertical Frame Coverage:
                </span>
                <span className="text-base font-mono font-bold text-purple-400">
                  {frameCoveragePercent}% of Frame Height
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="95"
                step="5"
                value={frameCoveragePercent}
                onChange={e => setFrameCoveragePercent(Number(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer"
              />
              {/* Presets */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  { label: 'Environmental (35%)', val: 35 },
                  { label: 'Medium (50%)', val: 50 },
                  { label: 'Full Portrait (75%)', val: 75 },
                  { label: 'Tight Frame (90%)', val: 90 }
                ].map(item => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setFrameCoveragePercent(item.val)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all ${
                      frameCoveragePercent === item.val
                        ? 'bg-purple-500 text-white font-bold'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Camera Sensor Type */}
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-1.5">
                4. Camera Sensor Type:
              </span>
              <select
                value={sensorId}
                onChange={e => setSensorId(e.target.value)}
                className="w-full bg-slate-900 text-brand-cyan p-2.5 rounded-xl border border-white/10 font-mono text-xs font-semibold focus:outline-none focus:border-brand-cyan"
              >
                {SENSOR_PRESETS.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.width}x{s.height}mm ({s.crop}x crop)
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Camera Sensor Megapixels (MP) */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1">
                  <Cpu size={14} className="text-emerald-400" />
                  <span>5. Sensor Resolution (Megapixels):</span>
                </span>
                <span className="text-base font-mono font-bold text-emerald-400">
                  {sensorMegapixels} MP
                </span>
              </div>
              <input
                type="range"
                min="12"
                max="100"
                step="1"
                value={sensorMegapixels}
                onChange={e => setSensorMegapixels(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              {/* Presets */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[12, 24, 33, 45, 50, 61, 100].map(mp => (
                  <button
                    key={mp}
                    type="button"
                    onClick={() => setSensorMegapixels(mp)}
                    className={`px-2.5 py-0.5 rounded text-[11px] font-mono transition-all ${
                      sensorMegapixels === mp
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/5'
                    }`}
                  >
                    {mp} MP
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results & 3-Lens Focal Range Column (6 cols) */}
          <div className="lg:col-span-6 space-y-5 flex flex-col justify-between">
            {/* 3 Hero Metric Cards: Optimal, Min, Max */}
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block border-b border-white/10 pb-2">
                Calculated Focal Length Range
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono">
                {/* 1. Minimal Focal Length */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-sky-500/30 text-center space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-sky-400 block font-semibold">
                    Minimal Focal Length
                  </span>
                  <div className="text-2xl font-bold text-sky-300">
                    {focalLengthResult.minFocalLengthMm} mm
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    {focalLengthResult.coveragePercents.min}% coverage (Context)
                  </span>
                </div>

                {/* 2. Optimal Focal Length */}
                <div className="p-3.5 rounded-xl bg-brand-cyan/15 border-2 border-brand-cyan text-center space-y-1 shadow-[0_0_20px_rgba(18,214,199,0.2)]">
                  <span className="text-[10px] uppercase tracking-wider text-brand-cyan block font-bold">
                    Optimal Focal Length
                  </span>
                  <div className="text-3xl font-extrabold text-brand-cyan">
                    {focalLengthResult.optimalFocalLengthMm} mm
                  </div>
                  <span className="text-[10px] text-slate-200 block font-semibold">
                    {focalLengthResult.coveragePercents.optimal}% coverage (Target)
                  </span>
                </div>

                {/* 3. Maximum Focal Length */}
                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-purple-500/30 text-center space-y-1">
                  <span className="text-[10px] uppercase tracking-wider text-purple-400 block font-semibold">
                    Maximum Focal Length
                  </span>
                  <div className="text-2xl font-bold text-purple-300">
                    {focalLengthResult.maxFocalLengthMm} mm
                  </div>
                  <span className="text-[10px] text-slate-400 block">
                    {focalLengthResult.coveragePercents.max}% coverage (Tightest)
                  </span>
                </div>
              </div>

              {/* Nearest Standard Lens Recommendation */}
              <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-between font-mono text-xs">
                <span className="text-slate-300">Nearest Commercial Prime:</span>
                <span className="text-brand-amber font-bold text-sm bg-brand-amber/15 px-2.5 py-0.5 rounded border border-brand-amber/30">
                  {focalLengthResult.nearestPrimeMm} mm Lens
                </span>
              </div>

              {/* Apply Optimal Lens to DoF Calculator */}
              <button
                type="button"
                onClick={() => handleApplyToDof(subjectDistanceMeters, focalLengthResult.optimalFocalLengthMm)}
                className="w-full py-2.5 px-4 rounded-xl bg-brand-cyan hover:bg-brand-cyanHover text-slate-950 font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(18,214,199,0.3)] active:scale-95"
              >
                <Focus size={15} />
                <span>Apply {focalLengthResult.optimalFocalLengthMm}mm & {subjectDistanceMeters}m to DoF Calculator</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Sensor Resolving Power & Megapixel Breakdown */}
            <div className="glass-card rounded-2xl p-5 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <span className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Cpu size={14} className="text-emerald-400" />
                  <span>Sensor Pixel Matrix & Subject Detail</span>
                </span>
                <span className="text-emerald-400 text-[11px] font-semibold">
                  {focalLengthResult.sensorResolution.pixelPitchUm} µm pitch
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-400 text-[11px]">
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 space-y-0.5">
                  <span className="text-slate-500 block">Sensor Pixel Grid:</span>
                  <span className="text-white font-bold">
                    {focalLengthResult.sensorResolution.width} × {focalLengthResult.sensorResolution.height} px
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/5 space-y-0.5">
                  <span className="text-slate-500 block">Subject Height in Pixels:</span>
                  <span className="text-brand-cyan font-bold">
                    {focalLengthResult.subjectPixels.optimal.toLocaleString()} pixels
                  </span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-300 leading-relaxed flex items-start gap-1.5">
                <Info size={14} className="flex-shrink-0 mt-0.5" />
                <span>
                  At {focalLengthResult.optimalFocalLengthMm}mm, the subject occupies {focalLengthResult.subjectPixels.optimal.toLocaleString()} vertical pixels ({frameCoveragePercent}% of frame), providing ultra-crisp commercial print and 4K definition.
                </span>
              </div>
            </div>

            {/* Multi-Lens Framing Viewfinder Simulation */}
            <div className="glass-card rounded-2xl p-5 flex flex-col items-center justify-center relative">
              <div className="flex items-center justify-between w-full mb-3 text-xs font-mono">
                <span className="uppercase tracking-wider text-slate-400 font-semibold">
                  Viewfinder Framing Comparison
                </span>
                <div className="flex items-center gap-2 text-[10px]">
                  <span className="flex items-center gap-1 text-sky-400">
                    <span className="w-2 h-0.5 bg-sky-400 inline-block" /> Min
                  </span>
                  <span className="flex items-center gap-1 text-brand-cyan">
                    <span className="w-2 h-0.5 bg-brand-cyan inline-block" /> Optimal
                  </span>
                  <span className="flex items-center gap-1 text-purple-400">
                    <span className="w-2 h-0.5 bg-purple-400 inline-block" /> Max
                  </span>
                </div>
              </div>

              <div className="relative w-full max-w-sm h-48 bg-slate-950 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center p-2">
                {/* Rule of thirds grid lines */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 border border-white/5 pointer-events-none" />

                {/* Minimal Framing Box (Loose) */}
                <div
                  className="absolute border border-dashed border-sky-400/60 bg-sky-500/5 rounded transition-all duration-300"
                  style={{
                    height: `${focalLengthResult.coveragePercents.min}%`,
                    width: `${Math.min(85, focalLengthResult.coveragePercents.min * 0.45)}%`
                  }}
                />

                {/* Maximum Framing Box (Tight) */}
                <div
                  className="absolute border border-dashed border-purple-400/60 bg-purple-500/5 rounded transition-all duration-300"
                  style={{
                    height: `${focalLengthResult.coveragePercents.max}%`,
                    width: `${Math.min(90, focalLengthResult.coveragePercents.max * 0.45)}%`
                  }}
                />

                {/* Optimal Framing Box (Target) */}
                <div
                  className="absolute border-2 border-brand-cyan bg-brand-cyan/20 rounded flex items-center justify-center transition-all duration-300 shadow-[0_0_12px_rgba(18,214,199,0.3)]"
                  style={{
                    height: `${frameCoveragePercent}%`,
                    width: `${Math.min(80, frameCoveragePercent * 0.45)}%`
                  }}
                >
                  <span className="text-[10px] font-mono text-brand-cyan font-bold text-center px-1">
                    Optimal ({focalLengthResult.optimalFocalLengthMm}mm)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- MODE 2: CLASSIC SHOOTING DISTANCE FROM FOCAL LENGTH --- */}
      {activeMode === 'find_distance' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Controls Column */}
          <div className="lg:col-span-6 glass-card rounded-2xl p-5 space-y-5">
            {/* Object Size */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Real Subject Height / Dimension
                </span>
                <span className="text-base font-mono font-bold text-brand-cyan">
                  {objectDimensionMeters} meters
                </span>
              </div>
              <input
                type="range"
                min="0.2"
                max="25"
                step="0.1"
                value={objectDimensionMeters}
                onChange={e => setObjectDimensionMeters(Number(e.target.value))}
                className="w-full accent-brand-cyan cursor-pointer"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {[
                  { label: 'Human (1.8m)', val: 1.8 },
                  { label: 'Vehicle (1.5m)', val: 1.5 },
                  { label: 'Tree (6m)', val: 6 },
                  { label: 'Building (15m)', val: 15 }
                ].map(item => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setObjectDimensionMeters(item.val)}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                      objectDimensionMeters === item.val
                        ? 'bg-brand-cyan text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Lens Focal Length */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Lens Focal Length
                </span>
                <span className="text-base font-mono font-bold text-brand-amber">
                  {lensFocalLengthMm} mm
                </span>
              </div>
              <input
                type="range"
                min="14"
                max="300"
                step="1"
                value={lensFocalLengthMm}
                onChange={e => setLensFocalLengthMm(Number(e.target.value))}
                className="w-full accent-brand-amber cursor-pointer"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {[24, 35, 50, 85, 135, 200].map(f => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setLensFocalLengthMm(f)}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                      lensFocalLengthMm === f
                        ? 'bg-brand-amber text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {f} mm
                  </button>
                ))}
              </div>
            </div>

            {/* Frame Coverage */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Vertical Frame Coverage
                </span>
                <span className="text-base font-mono font-bold text-purple-400">
                  {frameCoveragePercent}% of Frame Height
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={frameCoveragePercent}
                onChange={e => setFrameCoveragePercent(Number(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer"
              />
            </div>

            {/* Sensor */}
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-2">
                Camera Sensor
              </span>
              <select
                value={sensorId}
                onChange={e => setSensorId(e.target.value)}
                className="w-full bg-slate-900 text-brand-cyan p-2.5 rounded-xl border border-white/10 font-mono text-xs font-semibold"
              >
                {SENSOR_PRESETS.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Results & Framing Simulation Column */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-5">
            {/* Resulting Distance */}
            <div className="glass-card rounded-2xl p-6 text-center">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                Required Shooting Distance
              </span>
              <div className="text-4xl sm:text-5xl font-mono font-bold text-brand-cyan my-2">
                {requiredDistanceMeters} meters
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Stand {requiredDistanceMeters}m away to frame a {objectDimensionMeters}m subject across {frameCoveragePercent}% of your frame with a {lensFocalLengthMm}mm lens.
              </p>

              {/* Direct Action Button in Result Card */}
              <button
                type="button"
                onClick={() => handleApplyToDof(requiredDistanceMeters, lensFocalLengthMm)}
                className="mt-4 w-full py-2.5 px-4 rounded-xl bg-brand-cyan hover:bg-brand-cyanHover text-slate-950 font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(18,214,199,0.3)] active:scale-95"
              >
                <Focus size={15} />
                <span>Apply {requiredDistanceMeters}m & {lensFocalLengthMm}mm to DoF Calculator</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Framing Visual Silhouette */}
            <div className="glass-card rounded-2xl p-5 flex flex-col items-center justify-center relative">
              <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3 self-start">
                Simulated Viewfinder Composition
              </h3>

              <div className="relative w-64 h-44 bg-slate-900 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center p-2">
                {/* Rule of thirds lines */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 border border-white/5 pointer-events-none" />

                {/* Subject Box Proportion */}
                <div
                  className="border-2 border-dashed border-brand-cyan bg-brand-cyan/15 rounded flex items-center justify-center transition-all duration-300 relative"
                  style={{
                    height: `${frameCoveragePercent}%`,
                    width: `${Math.min(80, (frameCoveragePercent * 0.45))}%`
                  }}
                >
                  <span className="text-[10px] font-mono text-brand-cyan font-bold text-center px-1">
                    Subject ({frameCoveragePercent}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
