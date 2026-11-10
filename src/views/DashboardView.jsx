import React from 'react';
import RealisticMoon from '../components/RealisticMoon.jsx';
import TaglineReveal from '../components/TaglineReveal.jsx';
import {
  Focus,
  Timer,
  Sparkles,
  Maximize2,
  ChevronRight,
  Camera,
  Compass,
  Clock,
  Radio,
  Flame
} from 'lucide-react';

export default function DashboardView({
  ephemData,
  transits,
  onSelectView,
  onOpenAR
}) {
  const nextTransit = transits && transits.length > 0 ? transits[0] : null;

  return (
    <div className="space-y-6">
      {/* Hero Grid: Moon Simulation & Next Transit Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Realistic Moon & Orbit Card */}
        <div className="lg:col-span-7 glass-card rounded-2xl p-5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between z-10">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-brand-cyan font-semibold">
                LUNAR EPHEMERIS
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {ephemData.moon.illumination.phaseName}
              </h2>
            </div>
            <button
              onClick={() => onSelectView('celestial', 'moon')}
              className="text-xs font-mono text-slate-400 hover:text-brand-cyan flex items-center gap-1 transition-colors"
            >
              <span>TransitChaser</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* 3D Realistic Moon Component */}
          <div className="my-2">
            <RealisticMoon
              phasePercentage={ephemData.moon.illumination.percentage}
              phaseName={ephemData.moon.illumination.phaseName}
              satelliteLabel={nextTransit ? nextTransit.name.split(' ')[0] : 'ISS'}
            />
          </div>

          {/* Metrics Bar */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/5 font-mono text-center z-10">
            <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase block">Altitude</span>
              <span className="text-sm font-bold text-white">{ephemData.moon.altitudeDeg}°</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase block">Azimuth</span>
              <span className="text-sm font-bold text-brand-cyan">{ephemData.moon.azimuthCompass}°</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg border border-white/5">
              <span className="text-[10px] text-slate-400 uppercase block">Distance</span>
              <span className="text-sm font-bold text-brand-amber">{ephemData.moon.distanceKm.toLocaleString()} km</span>
            </div>
          </div>
        </div>

        {/* TransitChaser Quick Target Alert Card */}
        <div className="lg:col-span-5 glass-card rounded-2xl p-5 flex flex-col justify-between border-brand-amber/30 relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-amber animate-ping" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-brand-amber font-semibold">
                TRANSITCHASER PASS
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-amber/15 text-brand-amber border border-brand-amber/30 font-semibold">
              HIGH PRIORITY
            </span>
          </div>

          {nextTransit ? (
            <div className="my-4 space-y-3">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  {nextTransit.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Crossing {nextTransit.celestialBody} • {nextTransit.quality}
                </p>
              </div>

              <div className="space-y-2 bg-slate-900/80 p-3.5 rounded-xl border border-white/5 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Centerline Distance:</span>
                  <span className="text-brand-cyan font-bold">{nextTransit.centerlineDistKm} km</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Transit Duration:</span>
                  <span className="text-brand-amber font-bold">{nextTransit.chordDurationSec} seconds</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Illumination:</span>
                  <span className="text-slate-200">{nextTransit.illuminationState}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="my-6 text-center text-slate-400 text-sm font-mono">
              Calculating next orbital pass...
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectView('celestial', 'moon')}
              className="flex-1 py-2.5 px-4 rounded-xl bg-brand-amber hover:bg-brand-amberHover text-slate-950 font-semibold text-xs transition-all shadow-[0_0_15px_rgba(252,163,17,0.25)] flex items-center justify-center gap-1.5"
            >
              <Radio size={14} />
              <span>Open TransitChaser</span>
            </button>
            <button
              onClick={onOpenAR}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-white/10 transition-all"
              title="Align with AR Camera"
            >
              <Camera size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Photography Core Tools Fast Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* DoF Card */}
        <div 
          onClick={() => onSelectView('dof', 'calc')}
          className="glass-card glass-card-interactive rounded-2xl p-5 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-cyan/15 flex items-center justify-center text-brand-cyan">
                <Focus size={18} />
              </div>
              <h3 className="font-bold text-white text-base">Depth of Field</h3>
            </div>
            <ChevronRight size={16} className="text-slate-500" />
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Calculate near/far sharpness limits, circle of confusion, and hyperfocal distance.
          </p>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 font-mono text-xs flex justify-between items-center">
            <span className="text-slate-400">Hyperfocal (50mm, f/2.8):</span>
            <span className="text-brand-cyan font-bold">29.8 m</span>
          </div>
        </div>

        {/* ND Timer Card */}
        <div 
          onClick={() => onSelectView('exposure', 'nd-timer')}
          className="glass-card glass-card-interactive rounded-2xl p-5 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-amber/15 flex items-center justify-center text-brand-amber">
                <Timer size={18} />
              </div>
              <h3 className="font-bold text-white text-base">ND Filter Timer</h3>
            </div>
            <ChevronRight size={16} className="text-slate-500" />
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Compute equivalent long exposures for 3, 6, 10-stop or stacked ND filters with live circular timer.
          </p>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 font-mono text-xs flex justify-between items-center">
            <span className="text-slate-400">10-Stop Reciprocity (1/8s):</span>
            <span className="text-brand-amber font-bold">02m 08s</span>
          </div>
        </div>

        {/* Spot Stars / Astrophotography Card */}
        <div 
          onClick={() => onSelectView('astrophotography', 'spot-stars')}
          className="glass-card glass-card-interactive rounded-2xl p-5 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400">
                <Sparkles size={18} />
              </div>
              <h3 className="font-bold text-white text-base">Spot Stars (500/NPF)</h3>
            </div>
            <ChevronRight size={16} className="text-slate-500" />
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Eliminate star trailing with exact pixel pitch and aperture calculations for pinpoint night skies.
          </p>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-white/5 font-mono text-xs flex justify-between items-center">
            <span className="text-slate-400">NPF Rule (14mm f/2.8):</span>
            <span className="text-purple-400 font-bold">14.3s</span>
          </div>
        </div>
      </div>

      {/* Field of View & Crop Factor Banner */}
      <div 
        onClick={() => onSelectView('fov', 'fov')}
        className="glass-card glass-card-interactive rounded-2xl p-5 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center text-brand-cyan flex-shrink-0">
            <Maximize2 size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Field of View & Sensor Crop Factor Converter</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Compare 35mm equivalents across Full Frame, APS-C (1.5x/1.6x), Micro 4/3 (2.0x), and Medium Format (0.79x).
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-center">
          <span className="text-xs font-mono text-brand-cyan font-semibold">View Visual Framing</span>
          <ChevronRight size={16} className="text-brand-cyan" />
        </div>
      </div>

      {/* PhotoPills Advanced Field Planning & Equivalence Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Planner Card */}
        <div
          onClick={() => onSelectView('celestial', 'planner')}
          className="glass-card glass-card-interactive rounded-2xl p-4 cursor-pointer flex flex-col justify-between border-brand-cyan/20"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Compass size={18} className="text-brand-cyan" />
              <h4 className="font-bold text-white text-sm">Planner</h4>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-cyan/15 text-brand-cyan font-bold">PILL</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">
            Plan Sun, Moon, Milky Way & desired Sun/Moon size behind monuments.
          </p>
          <span className="text-[11px] font-mono text-brand-cyan flex items-center gap-1">
            <span>Launch Planner</span> &rarr;
          </span>
        </div>

        {/* Focal Length Match */}
        <div
          onClick={() => onSelectView('fov', 'focal-match')}
          className="glass-card glass-card-interactive rounded-2xl p-4 cursor-pointer flex flex-col justify-between border-brand-amber/20"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Focus size={18} className="text-brand-amber" />
              <h4 className="font-bold text-white text-sm">Focal Match</h4>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-amber/15 text-brand-amber font-bold">PILL</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">
            Match equivalent focal length, aperture & ISO across 2 camera sensors.
          </p>
          <span className="text-[11px] font-mono text-brand-amber flex items-center gap-1">
            <span>Match Sensors</span> &rarr;
          </span>
        </div>

        {/* Equivalent Exposure */}
        <div
          onClick={() => onSelectView('exposure', 'exposure')}
          className="glass-card glass-card-interactive rounded-2xl p-4 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Timer size={18} className="text-purple-400" />
              <h4 className="font-bold text-white text-sm">Exposure</h4>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 font-bold">PILL</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">
            Test shot high-ISO reciprocity conversion to final clean bulb shot.
          </p>
          <span className="text-[11px] font-mono text-purple-400 flex items-center gap-1">
            <span>Calculate Reciprocity</span> &rarr;
          </span>
        </div>

        {/* Field Timer */}
        <div
          onClick={() => onSelectView('exposure', 'timer')}
          className="glass-card glass-card-interactive rounded-2xl p-4 cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-emerald-400" />
              <h4 className="font-bold text-white text-sm">Field Timer</h4>
            </div>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 font-bold">AUDIO</span>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">
            Bulb countdown, timelapse intervalometer beeps & star trails timer.
          </p>
          <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
            <span>Start Timer</span> &rarr;
          </span>
        </div>
      </div>


      {/* Mandatory Landing Page Design Tagline Reveal Section */}
      <TaglineReveal />
    </div>
  );
}
