import React, { useState, useMemo } from 'react';
import {
  calculateFoV,
  compareAllSensors,
  matchFocalLength
} from '../services/fovCalc.js';
import { SENSOR_PRESETS } from '../services/opticalCalc.js';
import { Maximize2, Layers, RefreshCw } from 'lucide-react';

export default function FovView() {
  const [focalLength, setFocalLength] = useState(50);
  const [activeSensorId, setActiveSensorId] = useState('full-frame');

  // Focal Length Matcher state
  const [matchSourceSensor, setMatchSourceSensor] = useState('full-frame');
  const [matchTargetSensor, setMatchTargetSensor] = useState('apsc-sony');
  const [matchFocal, setMatchFocal] = useState(50);

  const fovData = useMemo(() => {
    return calculateFoV(focalLength, activeSensorId);
  }, [focalLength, activeSensorId]);

  const allComparisons = useMemo(() => {
    return compareAllSensors(focalLength);
  }, [focalLength]);

  const matchResult = useMemo(() => {
    return matchFocalLength(matchFocal, matchSourceSensor, matchTargetSensor);
  }, [matchFocal, matchSourceSensor, matchTargetSensor]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-brand-cyan/15 text-brand-cyan">
            <Maximize2 size={20} />
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Field of View & Crop Factor Converter
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Compare framing across Medium Format, Full Frame, APS-C, and Micro Four Thirds
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Controls Column */}
        <div className="lg:col-span-6 space-y-5">
          {/* Focal Length Slider */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Physical Lens Focal Length
              </span>
              <span className="text-lg font-mono font-bold text-brand-cyan">
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
            <div className="flex flex-wrap gap-2">
              {[14, 24, 35, 50, 85, 105, 135, 200].map(f => (
                <button
                  key={f}
                  onClick={() => setFocalLength(f)}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                    focalLength === f
                      ? 'bg-brand-cyan text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  {f}mm
                </button>
              ))}
            </div>
          </div>

          {/* Sensor Comparison Grid */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block">
              Multi-Format Sensor Comparison ({focalLength}mm Lens)
            </span>

            <div className="space-y-2">
              {allComparisons.map(item => {
                const isSelected = activeSensorId === item.sensor.id;
                return (
                  <div
                    key={item.sensor.id}
                    onClick={() => setActiveSensorId(item.sensor.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between font-mono text-xs ${
                      isSelected
                        ? 'bg-brand-cyan/15 border-brand-cyan/50 text-white shadow-[0_0_12px_rgba(18,214,199,0.15)]'
                        : 'bg-slate-900/60 border-white/5 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <span className="font-bold">{item.sensor.name.split('(')[0]}</span>
                      <span className="text-[10px] text-slate-500 block">
                        Crop: {item.sensor.crop}x • {item.sensor.width}×{item.sensor.height}mm
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-brand-cyan text-sm block">
                        {item.equivalent35mmFocalLength}mm equiv.
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {item.hFovDeg}° H × {item.vFovDeg}° V
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Visual Frame Overlay & Matcher Column */}
        <div className="lg:col-span-6 space-y-5">
          {/* Nested Visual Framing Preview */}
          <div className="glass-card rounded-2xl p-5">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-4">
              Visual Framing & Crop Bounding Boxes
            </h3>

            {/* Viewport Frame Box */}
            <div className="relative w-full h-64 bg-slate-900 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center p-4">
              {/* Landscape / Scene Background Silhouette */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,#12d6c7_0%,transparent_70%)] pointer-events-none" />

              {/* Medium Format Frame (0.79x) */}
              <div 
                className="absolute border-2 border-emerald-400/80 rounded flex flex-col justify-between p-1 text-[9px] font-mono text-emerald-400 pointer-events-none"
                style={{ width: '96%', height: '88%' }}
              >
                <span>Medium Format (0.79x)</span>
              </div>

              {/* Full Frame (1.0x) */}
              <div 
                className="absolute border-2 border-brand-cyan rounded flex flex-col justify-between p-1 text-[9px] font-mono text-brand-cyan pointer-events-none shadow-[0_0_10px_rgba(18,214,199,0.2)]"
                style={{ width: '80%', height: '70%' }}
              >
                <span>Full Frame (1.0x Base)</span>
              </div>

              {/* APS-C Frame (1.5x) */}
              <div 
                className="absolute border-2 border-brand-amber rounded flex flex-col justify-between p-1 text-[9px] font-mono text-brand-amber pointer-events-none shadow-[0_0_10px_rgba(252,163,17,0.2)]"
                style={{ width: '56%', height: '48%' }}
              >
                <span>APS-C (1.5x)</span>
              </div>

              {/* Micro Four Thirds (2.0x) */}
              <div 
                className="absolute border-2 border-purple-400 rounded flex flex-col justify-between p-1 text-[9px] font-mono text-purple-400 pointer-events-none shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                style={{ width: '42%', height: '36%' }}
              >
                <span>MFT (2.0x)</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-between items-center text-[10px] font-mono text-slate-400 mt-3 px-1 gap-2">
              <span className="text-emerald-400">■ Medium Format</span>
              <span className="text-brand-cyan">■ Full Frame</span>
              <span className="text-brand-amber">■ APS-C</span>
              <span className="text-purple-400">■ Micro 4/3</span>
            </div>
          </div>

          {/* Focal Length Match Tool (PhotoPills Chapter 23) */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <RefreshCw size={16} className="text-brand-cyan" />
              <h3 className="text-sm font-bold text-white">Focal Length Match Tool</h3>
            </div>
            <p className="text-xs text-slate-400">
              Calculate the required lens focal length on Camera B to reproduce the exact framing of Camera A.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Source Camera (A):</label>
                <select
                  value={matchSourceSensor}
                  onChange={e => setMatchSourceSensor(e.target.value)}
                  className="w-full bg-slate-900 text-white p-2 rounded-lg border border-white/10"
                >
                  {SENSOR_PRESETS.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <div className="mt-2">
                  <span className="text-slate-400 block text-[10px]">Focal Length:</span>
                  <input
                    type="number"
                    value={matchFocal}
                    onChange={e => setMatchFocal(Number(e.target.value))}
                    className="w-full bg-slate-900 text-brand-cyan p-2 rounded-lg border border-white/10 mt-0.5 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target Camera (B):</label>
                <select
                  value={matchTargetSensor}
                  onChange={e => setMatchTargetSensor(e.target.value)}
                  className="w-full bg-slate-900 text-white p-2 rounded-lg border border-white/10"
                >
                  {SENSOR_PRESETS.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <div className="mt-2 bg-slate-900/90 p-2.5 rounded-lg border border-white/10">
                  <span className="text-slate-400 block text-[10px]">Required Lens on (B):</span>
                  <span className="text-lg font-bold text-brand-amber">
                    {matchResult.matchedFocalLength} mm
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
