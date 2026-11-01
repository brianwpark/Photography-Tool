import React, { useState, useMemo } from 'react';
import { calculateStarTrails } from '../services/astroCalc.js';
import { Orbit, Clock, Layers, Sparkles } from 'lucide-react';

export default function StarTrailsView() {
  const [desiredArc, setDesiredArc] = useState(45);
  const [subExposure, setSubExposure] = useState(25);
  const [gap, setGap] = useState(1);

  const result = useMemo(() => {
    return calculateStarTrails({
      desiredArcDeg: desiredArc,
      subExposureSeconds: subExposure,
      gapSeconds: gap
    });
  }, [desiredArc, subExposure, gap]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-brand-amber/15 text-brand-amber">
            <Orbit size={20} />
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Star Trails Arc Calculator
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Determine total exposure time and frame stacking counts for desired celestial trail arcs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Controls Column */}
        <div className="lg:col-span-6 space-y-5">
          <div className="glass-card rounded-2xl p-5 space-y-5">
            {/* Desired Arc */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Desired Star Trail Arc Length
                </span>
                <span className="text-base font-mono font-bold text-brand-amber">
                  {desiredArc}°
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="180"
                step="5"
                value={desiredArc}
                onChange={e => setDesiredArc(Number(e.target.value))}
                className="w-full accent-brand-amber cursor-pointer"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {[15, 30, 45, 60, 90, 180].map(arc => (
                  <button
                    key={arc}
                    onClick={() => setDesiredArc(arc)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono transition-all ${
                      desiredArc === arc
                        ? 'bg-brand-amber text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {arc}°
                  </button>
                ))}
              </div>
            </div>

            {/* Individual Sub-exposure */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Sub-exposure Duration (Per Frame)
                </span>
                <span className="text-base font-mono font-bold text-brand-cyan">
                  {subExposure} seconds
                </span>
              </div>
              <input
                type="range"
                min="5"
                max="60"
                step="1"
                value={subExposure}
                onChange={e => setSubExposure(Number(e.target.value))}
                className="w-full accent-brand-cyan cursor-pointer"
              />
            </div>

            {/* Intervalometer Gap */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Intervalometer Shutter Gap
                </span>
                <span className="text-sm font-mono text-slate-300">
                  {gap} second
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Keep gap to 1s or continuous drive mode to prevent gaps in stacked trails.
              </p>
            </div>
          </div>
        </div>

        {/* Results & Visual Arc Preview Column */}
        <div className="lg:col-span-6 space-y-5">
          {/* Main Key Metric Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-card rounded-2xl p-5 text-center">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                Total Session Time
              </span>
              <div className="text-3xl sm:text-4xl font-mono font-bold text-brand-amber">
                {result.formattedDuration}
              </div>
              <p className="text-[11px] font-mono text-slate-500 mt-1">
                {result.totalMinutes} minutes total
              </p>
            </div>

            <div className="glass-card rounded-2xl p-5 text-center">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block mb-1">
                Total Frames to Stack
              </span>
              <div className="text-3xl sm:text-4xl font-mono font-bold text-brand-cyan">
                {result.totalShots}
              </div>
              <p className="text-[11px] font-mono text-slate-500 mt-1">
                {subExposure}s exposures
              </p>
            </div>
          </div>

          {/* Visual Arc Simulation */}
          <div className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden">
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-4 self-start">
              Celestial Arc Geometry (Circumpolar View)
            </h3>

            <div className="relative w-48 h-48 flex items-center justify-center">
              {/* Polaris Center Star */}
              <div className="w-3 h-3 bg-white rounded-full shadow-[0_0_12px_#ffffff] z-10" />
              <span className="absolute -top-1 font-mono text-[10px] text-slate-400">Polaris / North Celestial Pole</span>

              {/* Orbital Arc Trails */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 200 200">
                {[40, 65, 85].map((r, i) => {
                  const dash = (desiredArc / 360) * (2 * Math.PI * r);
                  const gapLength = (2 * Math.PI * r) - dash;
                  return (
                    <circle
                      key={r}
                      cx="100"
                      cy="100"
                      r={r}
                      fill="none"
                      stroke={i % 2 === 0 ? '#12d6c7' : '#fca311'}
                      strokeWidth="2.5"
                      strokeDasharray={`${dash} ${gapLength}`}
                      strokeLinecap="round"
                      className="opacity-80 transition-all duration-500"
                    />
                  );
                })}
              </svg>
            </div>

            <p className="text-xs font-mono text-slate-400 mt-4 text-center">
              Simulated rotation: <span className="text-brand-amber font-bold">{desiredArc}°</span> around celestial pole.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
