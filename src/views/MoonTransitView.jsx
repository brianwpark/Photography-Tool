import React, { useState } from 'react';
import RealisticMoon from '../components/RealisticMoon.jsx';
import {
  predictUpcomingTransits,
  calculateTransitGeometry,
  TRANSIT_OBJECT_TYPES
} from '../services/transitChaser.js';
import { formatTime, formatDate } from '../services/ephemeris.js';
import {
  Moon,
  Radio,
  Plane,
  Rocket,
  Camera,
  MapPin,
  Clock,
  Compass,
  AlertCircle,
  Eye,
  Sliders
} from 'lucide-react';

export default function MoonTransitView({
  ephemData,
  transits,
  onOpenAR,
  userLocation
}) {
  const [filterType, setFilterType] = useState('all');
  const [selectedTransit, setSelectedTransit] = useState(transits && transits.length > 0 ? transits[0] : null);
  const [centerlineOffset, setCenterlineOffset] = useState(0);

  const filteredTransits = transits.filter(t => {
    if (filterType === 'all') return true;
    if (filterType === 'iss') return t.type === TRANSIT_OBJECT_TYPES.ISS || t.type === TRANSIT_OBJECT_TYPES.TIANGONG;
    if (filterType === 'plane') return t.type === TRANSIT_OBJECT_TYPES.AIRCRAFT;
    if (filterType === 'rocket') return t.type === TRANSIT_OBJECT_TYPES.ROCKET;
    return true;
  });

  const geometry = calculateTransitGeometry({
    moonAngularDiameterArcmin: ephemData.moon.angularDiameterArcmin,
    centerlineOffsetKm: centerlineOffset,
    corridorWidthKm: selectedTransit ? selectedTransit.corridorWidthKm : 12.0,
    baseCenterlineDurationSec: selectedTransit ? selectedTransit.chordDurationSec : 0.85
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-brand-cyan/15 text-brand-cyan">
              <Moon size={20} />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Moon Alignment & TransitChaser Suite
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Lunar ephemeris, orbital passes (ISS/Tiangong), aircraft silhouettes & rocket launch transit paths
          </p>
        </div>

        <button
          onClick={onOpenAR}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-cyan hover:bg-brand-cyanHover text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(18,214,199,0.25)] self-start sm:self-auto active:scale-95"
        >
          <Camera size={15} />
          <span>Launch AR Moon Lock</span>
        </button>
      </div>

      {/* Top Split: Detailed Lunar Ephemeris vs Centerline Geometry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Real-time Lunar Ephemeris Card */}
        <div className="lg:col-span-6 glass-card rounded-2xl p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-brand-cyan font-semibold">
                CURRENT LUNAR TELEMETRY
              </span>
              <h2 className="text-lg font-bold text-white">
                {ephemData.moon.illumination.phaseName}
              </h2>
            </div>
            {ephemData.moon.isSupermoon && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-amber/20 text-brand-amber border border-brand-amber/40 font-bold">
                SUPERMOON
              </span>
            )}
          </div>

          <RealisticMoon
            phasePercentage={ephemData.moon.illumination.percentage}
            phaseName={ephemData.moon.illumination.phaseName}
            satelliteLabel={selectedTransit ? selectedTransit.name.split(' ')[0] : 'ISS'}
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-white/5 font-mono text-center text-xs">
            <div className="bg-slate-900/60 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Altitude</span>
              <span className="text-sm font-bold text-white">{ephemData.moon.altitudeDeg}°</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Azimuth</span>
              <span className="text-sm font-bold text-brand-cyan">{ephemData.moon.azimuthCompass}°</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Distance</span>
              <span className="text-sm font-bold text-slate-200">{ephemData.moon.distanceKm.toLocaleString()} km</span>
            </div>
            <div className="bg-slate-900/60 p-2 rounded-lg">
              <span className="text-[10px] text-slate-400 block">Angular Size</span>
              <span className="text-sm font-bold text-brand-amber">{ephemData.moon.angularDiameterArcmin}'</span>
            </div>
          </div>

          <div className="mt-3 flex justify-between items-center text-xs font-mono text-slate-400 px-1">
            <span>Moonrise: <strong className="text-white">{formatTime(ephemData.moon.times.rise)}</strong></span>
            <span>Moonset: <strong className="text-white">{formatTime(ephemData.moon.times.set)}</strong></span>
          </div>
        </div>

        {/* TransitChaser Chord & Centerline Geometry Simulator */}
        <div className="lg:col-span-6 glass-card rounded-2xl p-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Radio size={18} className="text-brand-amber" />
              <h3 className="text-sm font-bold text-white">Transit Ground Corridor & Chord Simulator</h3>
            </div>
            <span className="text-xs font-mono text-slate-400">
              {geometry.statusText}
            </span>
          </div>

          {/* Interactive Centerline Offset Slider */}
          <div>
            <div className="flex justify-between items-center text-xs font-mono mb-2">
              <span className="text-slate-400">Your Offset from Central Ground Track:</span>
              <span className="text-brand-cyan font-bold">{centerlineOffset} km</span>
            </div>
            <input
              type="range"
              min="-15"
              max="15"
              step="0.5"
              value={centerlineOffset}
              onChange={e => setCenterlineOffset(Number(e.target.value))}
              className="w-full accent-brand-cyan cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>-15km (North Edge)</span>
              <span className="text-brand-amber font-semibold">0km (Exact Centerline)</span>
              <span>+15km (South Edge)</span>
            </div>
          </div>

          {/* Chord Geometry Visual Diagram */}
          <div className="relative w-full h-32 bg-slate-900 rounded-xl overflow-hidden border border-white/10 flex items-center justify-center p-2">
            {/* Lunar Disk Circle */}
            <div className="relative w-24 h-24 rounded-full border-2 border-slate-600 bg-slate-800 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              {/* Transit Chord Line */}
              {geometry.isVisible ? (
                <div 
                  className="absolute w-full h-[2.5px] bg-brand-amber transition-all duration-300 shadow-[0_0_8px_#fca311]"
                  style={{
                    top: `${50 + (centerlineOffset / 15) * 45}%`
                  }}
                >
                  {/* Moving Transiting Object Marker */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-brand-amber rounded-full animate-ping" />
                </div>
              ) : (
                <span className="text-[10px] font-mono text-slate-500">Misses Disk</span>
              )}
            </div>

            <div className="absolute top-2 left-3 text-[10px] font-mono text-slate-400">
              Corridor Width: {selectedTransit ? selectedTransit.corridorWidthKm : 12}km
            </div>
          </div>

          {/* Geometry Readouts */}
          <div className="bg-slate-900/80 p-3.5 rounded-xl border border-white/5 grid grid-cols-2 gap-2 font-mono text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Actual Transit Duration:</span>
              <span className="text-base font-bold text-brand-amber">{geometry.actualDurationSec} seconds</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Chord Scale Ratio:</span>
              <span className="text-base font-bold text-brand-cyan">{(geometry.chordFactor * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transit Schedule List (ISS, Tiangong, Aircraft & Rockets) */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Upcoming Lunar Transit Predictions (TransitChaser Feed)
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Target opportunities crossing your local line of sight to the Moon
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5 font-mono text-xs">
            {[
              { id: 'all', label: 'All Transits' },
              { id: 'iss', label: 'Satellites (ISS/CSS)' },
              { id: 'plane', label: 'Commercial Jets' },
              { id: 'rocket', label: 'Rocket Launches' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id)}
                className={`px-3 py-1.5 rounded-lg transition-all border ${
                  filterType === f.id
                    ? 'bg-brand-cyan text-slate-950 font-bold border-brand-cyan'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border-white/5'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Schedule Table / Cards */}
        <div className="space-y-2.5">
          {filteredTransits.map(t => {
            const isSelected = selectedTransit && selectedTransit.id === t.id;
            const Icon = t.type === TRANSIT_OBJECT_TYPES.AIRCRAFT ? Plane : (t.type === TRANSIT_OBJECT_TYPES.ROCKET ? Rocket : Radio);

            return (
              <div
                key={t.id}
                onClick={() => {
                  setSelectedTransit(t);
                  setCenterlineOffset(0);
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-slate-800/90 border-brand-cyan/50 shadow-[0_0_15px_rgba(18,214,199,0.15)]'
                    : 'bg-slate-900/60 border-white/5 hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                    t.type === TRANSIT_OBJECT_TYPES.ROCKET
                      ? 'bg-red-500/15 text-red-400'
                      : t.type === TRANSIT_OBJECT_TYPES.AIRCRAFT
                        ? 'bg-amber-500/15 text-brand-amber'
                        : 'bg-cyan-500/15 text-brand-cyan'
                  }`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{t.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/10">
                        {t.quality}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-slate-400 mt-0.5">
                      {formatDate(t.date)} at {formatTime(t.date)} • {t.illuminationState}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end md:self-center font-mono text-xs">
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Centerline Dist:</span>
                    <span className="font-bold text-brand-cyan">{t.centerlineDistKm} km</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 block text-[10px]">Transit Duration:</span>
                    <span className="font-bold text-brand-amber">{t.chordDurationSec}s</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenAR();
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-brand-cyan hover:text-slate-950 text-slate-300 transition-all border border-white/10"
                    title="Track in AR Viewfinder"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
