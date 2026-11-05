import React, { useState, useMemo } from 'react';
import { SENSOR_PRESETS } from '../services/opticalCalc.js';
import { Ruler, Focus, Maximize2, ChevronRight, Check } from 'lucide-react';

export default function SubjectDistanceView({ onSelectView }) {
  const [objectDimensionMeters, setObjectDimensionMeters] = useState(1.8); // 1.8m height
  const [focalLength, setFocalLength] = useState(50);
  const [sensorId, setSensorId] = useState('full-frame');
  const [frameCoveragePercent, setFrameCoveragePercent] = useState(50); // occupies 50% of vertical frame

  const sensor = SENSOR_PRESETS.find(s => s.id === sensorId) || SENSOR_PRESETS[0];

  // Optical subject distance formula:
  // Magnification m = (Sensor Height * (Coverage% / 100)) / Object Real Dimension
  // Distance s = f * (1 + 1/m) = f * (1 + Object / SensorPart)
  const distance = useMemo(() => {
    const sensorVerticalPortionMm = sensor.height * (frameCoveragePercent / 100);
    const objectDimensionMm = objectDimensionMeters * 1000;
    const distanceMm = focalLength * (1 + (objectDimensionMm / sensorVerticalPortionMm));
    return Number((distanceMm / 1000).toFixed(2));
  }, [objectDimensionMeters, focalLength, sensor, frameCoveragePercent]);

  // Navigate to DoF Calculator and transfer the calculated distance, focal length, and sensor
  const handleApplyToDof = () => {
    if (onSelectView) {
      onSelectView('dof', 'calc', {
        distance,
        focalLength,
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
              <Ruler size={20} />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Subject Distance Triangulation
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Determine shooting distance based on focal length and subject frame coverage
          </p>
        </div>

        {/* Apply to DoF Calculator Header Button */}
        <button
          type="button"
          onClick={handleApplyToDof}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-cyan/15 hover:bg-brand-cyan/25 text-xs font-mono text-brand-cyan font-bold border border-brand-cyan/40 self-start sm:self-auto transition-all shadow-[0_0_12px_rgba(18,214,199,0.2)] active:scale-95"
          title="Transfer distance and focal length directly to DoF Calculator"
        >
          <Focus size={15} />
          <span>Apply to DoF Calculator</span>
          <ChevronRight size={14} />
        </button>
      </div>

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

          {/* Focal Length */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Lens Focal Length
              </span>
              <span className="text-base font-mono font-bold text-brand-amber">
                {focalLength} mm
              </span>
            </div>
            <input
              type="range"
              min="14"
              max="300"
              step="1"
              value={focalLength}
              onChange={e => setFocalLength(Number(e.target.value))}
              className="w-full accent-brand-amber cursor-pointer"
            />
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
              {distance} meters
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Stand {distance}m away to frame a {objectDimensionMeters}m subject across {frameCoveragePercent}% of your frame with a {focalLength}mm lens.
            </p>

            {/* Direct Action Button in Result Card */}
            <button
              type="button"
              onClick={handleApplyToDof}
              className="mt-4 w-full py-2.5 px-4 rounded-xl bg-brand-cyan hover:bg-brand-cyanHover text-slate-950 font-bold text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-[0_0_15px_rgba(18,214,199,0.3)] active:scale-95"
            >
              <Focus size={15} />
              <span>Apply {distance}m & {focalLength}mm to DoF Calculator</span>
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
    </div>
  );
}
