import React, { useState, useMemo } from 'react';
import {
  BASE_SHUTTERS,
  ND_PRESETS,
  calculateEquivalentExposure,
  calculateEV
} from '../services/exposureCalc.js';
import { SENSOR_PRESETS, APERTURE_STOPS } from '../services/opticalCalc.js';

import { Sliders, Sun, Moon, ArrowRight, Play, CheckCircle } from 'lucide-react';

export default function ExposureView({ onSelectView, onStartTimerWithDuration }) {
  // Test Shot Settings
  const [testShutterIdx, setTestShutterIdx] = useState(18); // 30s
  const [testAperture, setTestAperture] = useState(2.8);
  const [testIso, setTestIso] = useState(6400);
  const [testNdStops, setTestNdStops] = useState(0);

  // Final Shot Target Settings
  const [targetAperture, setTargetAperture] = useState(8.0);
  const [targetIso, setTargetIso] = useState(100);
  const [targetNdStops, setTargetNdStops] = useState(10); // 10-stop ND

  const testShutter = BASE_SHUTTERS[testShutterIdx] || BASE_SHUTTERS[18];

  const equivalent = useMemo(() => {
    return calculateEquivalentExposure({
      testShutterSeconds: testShutter.value,
      testAperture,
      testIso,
      testNdStops,
      targetAperture,
      targetIso,
      targetNdStops
    });
  }, [testShutter.value, testAperture, testIso, testNdStops, targetAperture, targetIso, targetNdStops]);

  const testEV = useMemo(() => {
    return calculateEV(testAperture, testShutter.value, testIso);
  }, [testAperture, testShutter.value, testIso]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-brand-amber/15 text-brand-amber">
            <Sliders size={20} />
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Equivalent Exposure Calculator
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Calculate equivalent exposure times for long exposures, shooting in low light, at night, or when stacking ND filters
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Test Shot Column (6 Cols) */}
        <div className="lg:col-span-6 glass-card rounded-2xl p-5 space-y-4 border-white/10">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Test Shot (Fast Preview)</h2>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-300 font-bold">
              EV {testEV}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Take a quick, high-ISO test shot to check composition and focus without waiting for a long exposure.
          </p>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-400">Test Shutter Speed:</span>
                <span className="text-brand-cyan font-bold">{testShutter.label}</span>
              </div>
              <select
                value={testShutterIdx}
                onChange={e => setTestShutterIdx(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              >
                {BASE_SHUTTERS.map((s, idx) => (
                  <option key={s.label} value={idx}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-400">Test Aperture (1/3 Stop Steps):</span>
                <span className="text-brand-cyan font-bold">f/{testAperture}</span>
              </div>
              <select
                value={testAperture}
                onChange={e => setTestAperture(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              >
                {APERTURE_STOPS.map(a => (
                  <option key={a} value={a}>
                    f/{a}
                  </option>
                ))}
              </select>
            </div>


            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Test ISO</label>
                <select
                  value={testIso}
                  onChange={e => setTestIso(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                >
                  {[400, 800, 1600, 3200, 6400, 12800, 25600].map(iso => (
                    <option key={iso} value={iso}>
                      ISO {iso}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Test ND Filter</label>
                <select
                  value={testNdStops}
                  onChange={e => setTestNdStops(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                >
                  <option value={0}>None (0 Stops)</option>
                  <option value={3}>ND8 (3 Stops)</option>
                  <option value={6}>ND64 (6 Stops)</option>
                  <option value={10}>ND1000 (10 Stops)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Final Target Shot Column (6 Cols) */}
        <div className="lg:col-span-6 glass-card rounded-2xl p-5 space-y-4 border-brand-amber/20">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-brand-amber" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Final Shot (Clean Exposure)</h2>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-brand-amber/15 text-brand-amber font-bold">
              Target
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Set your desired low-noise ISO, optimal aperture, and ND filter for creamy water or smooth clouds.
          </p>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-400">Final Target Aperture (1/3 Stop Steps):</span>
                <span className="text-brand-amber font-bold">f/{targetAperture}</span>
              </div>
              <select
                value={targetAperture}
                onChange={e => setTargetAperture(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              >
                {APERTURE_STOPS.map(a => (
                  <option key={a} value={a}>
                    f/{a}
                  </option>
                ))}
              </select>
            </div>


            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Final Target ISO</label>
                <select
                  value={targetIso}
                  onChange={e => setTargetIso(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                >
                  {[50, 100, 200, 400, 800, 1600].map(iso => (
                    <option key={iso} value={iso}>
                      ISO {iso}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Target ND Filter</label>
                <select
                  value={targetNdStops}
                  onChange={e => setTargetNdStops(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                >
                  <option value={0}>None (0 Stops)</option>
                  <option value={3}>ND8 (3 Stops)</option>
                  <option value={6}>ND64 (6 Stops)</option>
                  <option value={10}>ND1000 (10 Stops)</option>
                  <option value={15}>ND32K (15 Stops)</option>
                  <option value={16}>Stacked 6+10 (16 Stops)</option>
                </select>
              </div>
            </div>

            {/* Calculated Equivalent Exposure Output */}
            <div className="bg-slate-900/90 p-4 rounded-xl border border-brand-amber/30 space-y-2 mt-2">
              <span className="text-[11px] text-slate-400 block font-sans">Calculated Equivalent Exposure Time:</span>
              <div className="text-3xl font-black text-brand-amber font-mono tracking-tight">
                {equivalent.formatted}
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5">
                <span>Exact: {Math.round(equivalent.targetSeconds)}s</span>
                <span className="text-brand-cyan font-bold">
                  {equivalent.isBulb ? 'BULB SHUTTER REQUIRED' : 'Standard Shutter'}
                </span>
              </div>
            </div>

            <button
              onClick={() => onSelectView('timer')}
              className="w-full py-2.5 rounded-xl bg-brand-amber hover:bg-brand-amberHover text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(252,163,17,0.3)]"
            >
              <Play size={14} className="fill-current" />
              <span>Launch in Field Countdown Timer &rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
