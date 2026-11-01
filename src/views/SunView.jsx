import React, { useState } from 'react';
import { formatTime } from '../services/ephemeris.js';
import { Sun, Sunset, Sunrise, Clock, Compass, Ruler } from 'lucide-react';

export default function SunView({ ephemData }) {
  const [objectHeightMeters, setObjectHeightMeters] = useState(1.8); // 1.8m human height

  const sun = ephemData.sun;
  const altitude = sun.altitudeDeg;
  
  // Shadow length calculation: L = H / tan(alt)
  let shadowLengthMeters = null;
  if (altitude > 0) {
    const rad = (altitude * Math.PI) / 180;
    shadowLengthMeters = (objectHeightMeters / Math.tan(rad)).toFixed(2);
  }

  const twilightPhases = [
    { label: 'Golden Hour (Morning)', time: formatTime(sun.times.goldenHourEnd), badge: 'Soft Amber Glow' },
    { label: 'Sunrise', time: formatTime(sun.times.sunrise), badge: 'Sun Disc Breaks Horizon' },
    { label: 'Solar Noon', time: formatTime(sun.times.solarNoon), badge: 'Highest Sun Elevation' },
    { label: 'Golden Hour (Evening)', time: formatTime(sun.times.goldenHour), badge: 'Warm Diffused Light' },
    { label: 'Sunset', time: formatTime(sun.times.sunset), badge: 'Sun Drops Below Horizon' },
    { label: 'Blue Hour (Dusk)', time: formatTime(sun.times.blueHourDuskEnd), badge: 'Deep Cobalt Skies' },
    { label: 'Civil Twilight Ends', time: formatTime(sun.times.nauticalDusk), badge: 'Sun at -6°' },
    { label: 'Nautical Twilight Ends', time: formatTime(sun.times.astronomicalDusk), badge: 'Sun at -12°' },
    { label: 'Astronomical Twilight (Full Night)', time: formatTime(sun.times.astronomicalDusk), badge: 'Sun at -18°' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-brand-amber/15 text-brand-amber">
            <Sun size={20} />
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Sun, Golden Hour & Shadow Suite
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Solar ephemeris, golden hour, blue hour, twilight intervals & shadow lengths
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Real-time Solar Telemetry & Shadows */}
        <div className="lg:col-span-6 space-y-5">
          {/* Current Sun Position Card */}
          <div className="glass-card rounded-2xl p-5">
            <span className="text-xs font-mono uppercase tracking-wider text-brand-amber font-semibold block mb-2">
              CURRENT SOLAR ELEVATION & AZIMUTH
            </span>
            <div className="grid grid-cols-2 gap-3 text-center font-mono my-3">
              <div className="bg-slate-900/80 p-4 rounded-xl border border-white/5">
                <span className="text-xs text-slate-400 block mb-1">Solar Altitude</span>
                <span className="text-3xl font-bold text-white">{altitude}°</span>
                <span className="text-[10px] text-slate-500 block mt-1">
                  {altitude > 0 ? 'Above Horizon' : 'Below Horizon (Night)'}
                </span>
              </div>
              <div className="bg-slate-900/80 p-4 rounded-xl border border-white/5">
                <span className="text-xs text-slate-400 block mb-1">Compass Heading</span>
                <span className="text-3xl font-bold text-brand-cyan">{sun.azimuthCompass}°</span>
                <span className="text-[10px] text-slate-500 block mt-1">Navigational Azimuth</span>
              </div>
            </div>
          </div>

          {/* PhotoPills Panel 1: Shadow Length Calculator */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Ruler size={18} className="text-brand-cyan" />
              <h3 className="text-sm font-bold text-white">Shadow Length Calculator</h3>
            </div>
            <p className="text-xs text-slate-400">
              Compute the projected shadow length for any object or monument based on current solar elevation.
            </p>

            <div>
              <div className="flex justify-between items-center text-xs font-mono mb-2">
                <span className="text-slate-400">Object Height:</span>
                <span className="text-brand-cyan font-bold">{objectHeightMeters} meters</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="50"
                step="0.5"
                value={objectHeightMeters}
                onChange={e => setObjectHeightMeters(Number(e.target.value))}
                className="w-full accent-brand-cyan cursor-pointer"
              />
              <div className="flex gap-2 mt-2">
                {[1.8, 3, 10, 25, 50].map(h => (
                  <button
                    key={h}
                    onClick={() => setObjectHeightMeters(h)}
                    className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                      objectHeightMeters === h
                        ? 'bg-brand-cyan text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {h}m
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-xl border border-white/5 font-mono text-center">
              <span className="text-xs text-slate-400 block mb-1">Projected Cast Shadow Length</span>
              <span className="text-3xl font-bold text-brand-amber">
                {shadowLengthMeters ? `${shadowLengthMeters} meters` : 'No Shadow (Sun Below Horizon)'}
              </span>
              {shadowLengthMeters && (
                <span className="text-[11px] text-slate-400 block mt-1">
                  Shadow Factor: {(shadowLengthMeters / objectHeightMeters).toFixed(2)}x object height
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Golden Hour, Blue Hour & Twilights Schedule Column */}
        <div className="lg:col-span-6 glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white">Light Phases & Twilight Schedule</h3>
            <span className="text-xs font-mono text-brand-cyan">Today</span>
          </div>

          <div className="space-y-2">
            {twilightPhases.map((phase, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between font-mono text-xs hover:bg-slate-800/50 transition-colors"
              >
                <div>
                  <span className="font-semibold text-white block">{phase.label}</span>
                  <span className="text-[10px] text-slate-500">{phase.badge}</span>
                </div>
                <span className="text-sm font-bold text-brand-cyan">{phase.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
