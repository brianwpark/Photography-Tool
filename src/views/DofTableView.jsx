import React, { useState, useMemo } from 'react';
import { generateDofMatrix, SENSOR_PRESETS } from '../services/opticalCalc.js';
import { Table, Focus, ChevronLeft } from 'lucide-react';

export default function DofTableView({ onSelectView }) {
  const [sensorId, setSensorId] = useState('full-frame');
  const [distance, setDistance] = useState(3.0);
  const [metricMode, setMetricMode] = useState('hyperfocal'); // 'hyperfocal' or 'total'

  const { apertures, focalLengths, matrix } = useMemo(() => {
    return generateDofMatrix(sensorId, distance);
  }, [sensorId, distance]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-brand-cyan/15 text-brand-cyan">
              <Table size={20} />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Hyperfocal & DoF Reference Matrix
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Tabular field matrix across focal lengths and aperture stops
          </p>
        </div>

        <button
          onClick={() => onSelectView('dof')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-mono text-slate-300 hover:text-white border border-white/10 transition-all self-start sm:self-auto active:scale-95"
        >
          <ChevronLeft size={15} />
          <span>Back to DoF Calculator</span>
        </button>
      </div>

      {/* Configuration Strip */}
      <div className="glass-card rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        {/* Sensor selector */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Sensor:</span>
          <select
            value={sensorId}
            onChange={e => setSensorId(e.target.value)}
            className="bg-slate-900 text-brand-cyan font-semibold px-3 py-1.5 rounded-lg border border-white/10 focus:outline-none"
          >
            {SENSOR_PRESETS.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Display Mode */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Display Metric:</span>
          <div className="flex bg-slate-900 rounded-lg p-0.5 border border-white/10">
            <button
              onClick={() => setMetricMode('hyperfocal')}
              className={`px-3 py-1 rounded-md transition-all ${
                metricMode === 'hyperfocal'
                  ? 'bg-brand-cyan text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Hyperfocal (m)
            </button>
            <button
              onClick={() => setMetricMode('total')}
              className={`px-3 py-1 rounded-md transition-all ${
                metricMode === 'total'
                  ? 'bg-brand-amber text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Total DoF @ {distance}m
            </button>
          </div>
        </div>
      </div>

      {/* Table Container with Horizontal Scroll */}
      <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 border-b border-white/10 text-slate-400">
                <th className="p-3.5 pl-5 font-semibold sticky left-0 bg-slate-900/95 z-10">
                  Focal Length
                </th>
                {apertures.map(N => (
                  <th key={N} className="p-3.5 text-center text-brand-cyan font-bold">
                    f/{N}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {matrix.map((row) => (
                <tr key={row.focalLength} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 pl-5 font-bold text-white sticky left-0 bg-[#0c121e] z-10 border-r border-white/5">
                    {row.focalLength} mm
                  </td>
                  {apertures.map(N => {
                    const data = row.stops[N];
                    const val = metricMode === 'hyperfocal' ? data.hyperfocal : data.total;
                    return (
                      <td key={N} className="p-3.5 text-center">
                        <span className={`px-2 py-1 rounded ${
                          metricMode === 'hyperfocal'
                            ? 'text-slate-200'
                            : val === 'Infinity' ? 'text-brand-amber font-bold' : 'text-slate-300'
                        }`}>
                          {val === 'Infinity' ? '∞' : `${val}m`}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
