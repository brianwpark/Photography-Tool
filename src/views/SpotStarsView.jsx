import React, { useState, useMemo } from 'react';
import {
  calculateSpotStars,
  ASTRO_CAMERAS
} from '../services/astroCalc.js';
import { APERTURE_STOPS } from '../services/opticalCalc.js';
import { Sparkles, AlertTriangle, CheckCircle, Video, Orbit, ChevronRight } from 'lucide-react';


export default function SpotStarsView({ onSelectView }) {
  const [cameraId, setCameraId] = useState('sony-a7iv');
  const [focalLength, setFocalLength] = useState(14);
  const [aperture, setAperture] = useState(2.8);
  const [declination, setDeclination] = useState(0);

  const result = useMemo(() => {
    return calculateSpotStars({
      focalLengthMm: focalLength,
      aperture,
      cameraId,
      declinationDeg: declination
    });
  }, [focalLength, aperture, cameraId, declination]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-purple-500/15 text-purple-400">
              <Sparkles size={20} />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Astrophotography Rule: 500 Rule vs. NPF Rule
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Maximum pinpoint shutter speeds before star trailing occurs
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => onSelectView('timelapse')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 border border-white/10"
          >
            <Video size={14} className="text-brand-cyan" />
            <span>Hyperlapse</span>
            <ChevronRight size={13} />
          </button>
          <button
            onClick={() => onSelectView('star-trails')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 border border-white/10"
          >
            <Orbit size={14} className="text-brand-amber" />
            <span>Star Trails</span>
            <ChevronRight size={13} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Controls Column */}
        <div className="lg:col-span-6 space-y-5">
          {/* Camera Sensor Selection */}
          <div className="glass-card rounded-2xl p-5">
            <label className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2 block">
              Camera Body (Sensor Pixel Pitch Database)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ASTRO_CAMERAS.map(cam => (
                <button
                  key={cam.id}
                  onClick={() => setCameraId(cam.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    cameraId === cam.id
                      ? 'bg-purple-500/20 border-purple-400 text-purple-300 font-bold shadow-[0_0_12px_rgba(168,85,247,0.2)]'
                      : 'bg-slate-900/60 border-white/5 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="text-xs font-semibold">{cam.name}</div>
                  <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                    Pixel Pitch: {cam.pitch} µm • Crop: {cam.crop}x
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Focal Length & Aperture */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
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
                max="85"
                step="1"
                value={focalLength}
                onChange={e => setFocalLength(Number(e.target.value))}
                className="w-full accent-brand-cyan cursor-pointer"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[12, 14, 16, 20, 24, 28, 35, 50].map(f => (
                  <button
                    key={f}
                    onClick={() => setFocalLength(f)}
                    className={`px-2 py-1 rounded text-[11px] font-mono transition-all ${
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

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Lens Aperture (1/3 Stop Steps)
                </span>
                <span className="text-base font-mono font-bold text-brand-amber">
                  f/{aperture}
                </span>
              </div>
              <select
                value={aperture}
                onChange={e => setAperture(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono text-xs mb-2"
              >
                {APERTURE_STOPS.filter(a => a <= 22).map(N => (
                  <option key={N} value={N}>
                    f/{N}
                  </option>
                ))}
              </select>
              <div className="grid grid-cols-5 gap-2">
                {[1.4, 1.8, 2.0, 2.8, 4.0].map(N => (
                  <button
                    key={N}
                    type="button"
                    onClick={() => setAperture(N)}
                    className={`py-1.5 rounded-xl text-center font-mono text-xs border transition-all ${
                      aperture === N
                        ? 'bg-brand-amber text-slate-950 font-bold border-brand-amber'
                        : 'bg-slate-900/60 border-white/5 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    f/{N}
                  </button>
                ))}
              </div>
            </div>


            {/* Declination Angle */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Star Declination (Target Sky Region)
                </span>
                <span className="text-sm font-mono text-slate-200">
                  {declination}° {declination === 0 ? '(Celestial Equator / Strict)' : ''}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: 'Equator (0°)', val: 0 },
                  { label: 'Milky Way (30°)', val: 30 },
                  { label: 'Mid-Sky (50°)', val: 50 },
                  { label: 'Polar (70°)', val: 70 }
                ].map(item => (
                  <button
                    key={item.val}
                    onClick={() => setDeclination(item.val)}
                    className={`py-1.5 px-1 rounded-lg text-center font-mono text-[11px] border transition-all ${
                      declination === item.val
                        ? 'bg-purple-500/20 text-purple-300 border-purple-400 font-bold'
                        : 'bg-slate-900/60 border-white/5 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results & Recommendation Column */}
        <div className="lg:col-span-6 space-y-5">
          {/* Side by Side Comparison Cards */}
          <div className="grid grid-cols-2 gap-4">
            {/* NPF Rule (Recommended) */}
            <div className="glass-card rounded-2xl p-5 border-purple-500/40 relative overflow-hidden">
              <span className="absolute top-2 right-2 text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                RECOMMENDED
              </span>
              <span className="text-xs font-mono uppercase tracking-wider text-purple-400 font-semibold block mb-1">
                Accurate NPF Rule
              </span>
              <div className="text-4xl font-mono font-bold text-white mb-1">
                {result.npfSeconds}s
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-2">
                Guarantees zero star elongation on {result.pixelPitchMicrons}µm pixel sensor.
              </p>
            </div>

            {/* Classic 500 Rule */}
            <div className="glass-card rounded-2xl p-5 border-white/10">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                Classic 500 Rule
              </span>
              <div className="text-4xl font-mono font-bold text-slate-300 mb-1">
                {result.rule500Seconds}s
              </div>
              <p className="text-[11px] font-mono text-slate-400 mt-2">
                Film standard formula. Too generous for modern high-megapixel digital cameras.
              </p>
            </div>
          </div>

          {/* Detailed Diagnosis & Star Trailing Explanation */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              {result.differencePercent > 20 ? (
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 flex-shrink-0">
                  <AlertTriangle size={20} />
                </div>
              ) : (
                <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 flex-shrink-0">
                  <CheckCircle size={20} />
                </div>
              )}
              <div>
                <h4 className="text-sm font-bold text-white">Trailing Assessment</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {result.warning}
                </p>
              </div>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-white/5 space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">NPF vs 500 Discrepancy:</span>
                <span className="text-amber-400 font-bold">{result.differencePercent}% longer on 500 Rule</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Sensor Pixel Pitch:</span>
                <span className="text-slate-200">{result.pixelPitchMicrons} microns</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Mathematical Formula:</span>
                <span className="text-slate-300">(35×N + 30×p) / (f × cos(δ))</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
