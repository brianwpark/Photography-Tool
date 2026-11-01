import React, { useState, useMemo } from 'react';
import {
  BASE_SHUTTERS,
  ND_PRESETS,
  calculateNDExposure
} from '../services/exposureCalc.js';
import CircularTimer from '../components/CircularTimer.jsx';
import { Timer, Layers, Plus, Check } from 'lucide-react';

export default function NdTimerView() {
  const [baseShutterIndex, setBaseShutterIndex] = useState(6); // 1/125s
  const [selectedFilters, setSelectedFilters] = useState(['nd1000']); // default 10-stop

  const baseShutter = BASE_SHUTTERS[baseShutterIndex] || BASE_SHUTTERS[6];

  // Calculate total stacked stops
  const totalStops = useMemo(() => {
    return selectedFilters.reduce((sum, filterId) => {
      const preset = ND_PRESETS.find(p => p.id === filterId);
      return sum + (preset ? preset.stops : 0);
    }, 0);
  }, [selectedFilters]);

  // Reciprocity calculation
  const exposure = useMemo(() => {
    return calculateNDExposure(baseShutter.value, totalStops);
  }, [baseShutter.value, totalStops]);

  const toggleFilter = (filterId) => {
    if (filterId === 'none') {
      setSelectedFilters([]);
      return;
    }
    if (selectedFilters.includes(filterId)) {
      setSelectedFilters(selectedFilters.filter(id => id !== filterId));
    } else {
      setSelectedFilters([...selectedFilters, filterId]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-brand-amber/15 text-brand-amber">
            <Timer size={20} />
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Exposure & ND Filter Timer
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Reciprocity law conversion, multi-filter stacking & bulb countdown timer
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Controls Column */}
        <div className="lg:col-span-6 space-y-5">
          {/* Base Shutter Speed Card */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Base Daylight Shutter Speed
              </span>
              <span className="text-base font-mono font-bold text-brand-cyan">
                {baseShutter.label}
              </span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {BASE_SHUTTERS.map((shutter, idx) => (
                <button
                  key={shutter.label}
                  onClick={() => setBaseShutterIndex(idx)}
                  className={`py-2 px-1 rounded-xl text-center font-mono text-xs transition-all border ${
                    baseShutterIndex === idx
                      ? 'bg-brand-cyan text-slate-950 font-bold border-brand-cyan shadow-[0_0_12px_rgba(18,214,199,0.3)]'
                      : 'bg-slate-900/60 text-slate-300 border-white/5 hover:bg-slate-800'
                  }`}
                >
                  {shutter.label}
                </button>
              ))}
            </div>
          </div>

          {/* ND Filter Stacking Selector */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-brand-amber" />
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Stack Neutral Density Filters
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-brand-amber bg-brand-amber/15 px-2 py-0.5 rounded border border-brand-amber/30">
                Total: {totalStops} Stops ({Math.pow(2, totalStops).toLocaleString()}x)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {ND_PRESETS.filter(p => p.id !== 'none').map(preset => {
                const isSelected = selectedFilters.includes(preset.id);
                return (
                  <button
                    key={preset.id}
                    onClick={() => toggleFilter(preset.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-brand-amber/20 border-brand-amber/60 text-brand-amber shadow-[0_0_12px_rgba(252,163,17,0.2)]'
                        : 'bg-slate-900/60 border-white/5 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{preset.label.split('(')[0]}</span>
                      {isSelected && <Check size={14} className="text-brand-amber" />}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                      +{preset.stops} Stops ({preset.factor}x)
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedFilters.length > 0 && (
              <button
                onClick={() => setSelectedFilters([])}
                className="mt-3 text-xs font-mono text-slate-400 hover:text-white underline block"
              >
                Clear all filters
              </button>
            )}
          </div>

          {/* Quick Reciprocity Formula Summary */}
          <div className="glass-card rounded-2xl p-4 font-mono text-xs space-y-2 text-slate-400">
            <div className="flex justify-between">
              <span>Reciprocity Formula:</span>
              <span className="text-slate-200">T_nd = T_base × 2^stops</span>
            </div>
            <div className="flex justify-between">
              <span>Multiplier Factor:</span>
              <span className="text-brand-amber font-bold">{exposure.multiplier.toLocaleString()}x</span>
            </div>
            <div className="flex justify-between">
              <span>Exact Computed Seconds:</span>
              <span className="text-brand-cyan font-bold">{exposure.targetSeconds.toFixed(2)}s</span>
            </div>
          </div>
        </div>

        {/* Circular Countdown Timer Column */}
        <div className="lg:col-span-6 flex flex-col justify-between glass-card rounded-2xl p-6 text-center">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-2">
              Required Exposure Duration
            </span>
            <div className="text-4xl sm:text-5xl font-mono font-bold text-brand-amber mb-2">
              {exposure.formatted}
            </div>
            <p className="text-xs text-slate-400 font-mono">
              {exposure.isBulb
                ? 'Bulb Mode Required: Use the countdown timer below with audio shutter cues.'
                : 'Standard In-Camera Shutter Speed Available'}
            </p>
          </div>

          {/* Interactive Circular Timer Component */}
          <div className="my-8">
            <CircularTimer
              totalSeconds={Math.max(1, Math.round(exposure.targetSeconds))}
              label={`${totalStops}-Stop ND Exposure`}
            />
          </div>

          {/* Quick Duration Testing Pills */}
          <div className="pt-4 border-t border-white/5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block mb-2">
              Quick Timer Presets
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              {[30, 60, 120, 240, 480].map(sec => (
                <button
                  key={sec}
                  onClick={() => {
                    // Set base shutter so that result hits this duration approximately
                    const requiredBase = sec / Math.pow(2, totalStops);
                    const closest = BASE_SHUTTERS.reduce((prev, curr) => 
                      Math.abs(curr.value - requiredBase) < Math.abs(prev.value - requiredBase) ? curr : prev
                    );
                    setBaseShutterIndex(BASE_SHUTTERS.indexOf(closest));
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white font-mono text-xs border border-white/5 transition-all"
                >
                  {sec >= 60 ? `${sec / 60}m` : `${sec}s`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
