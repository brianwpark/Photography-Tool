import React, { useState, useMemo } from 'react';
import { SENSOR_PRESETS, APERTURE_STOPS, calculateDoF } from '../services/opticalCalc.js';
import { calculateFoV } from '../services/fovCalc.js';
import { RefreshCw, Camera, Layers, CheckCircle, Info } from 'lucide-react';

export default function FocalLengthMatchView() {
  // Camera 1 (Base / Source)
  const [sourceSensorId, setSourceSensorId] = useState('full-frame');
  const [sourceFocalMm, setSourceFocalMm] = useState(50);
  const [sourceAperture, setSourceAperture] = useState(2.8);
  const [subjectDistanceMeters, setSubjectDistanceMeters] = useState(3.0);
  const [sourceIso, setSourceIso] = useState(400);

  // Camera 2 (Target Camera to Match)
  const [targetSensorId, setTargetSensorId] = useState('apsc-sony');

  const sourceSensor = SENSOR_PRESETS.find(s => s.id === sourceSensorId) || SENSOR_PRESETS[0];
  const targetSensor = SENSOR_PRESETS.find(s => s.id === targetSensorId) || SENSOR_PRESETS[1];

  // Mathematical Equivalence
  // Ratio = Crop1 / Crop2
  const cropRatio = sourceSensor.crop / targetSensor.crop;

  // Matching Focal Length: f2 = f1 * (crop1 / crop2)
  const matchedFocalLengthMm = Number((sourceFocalMm * cropRatio).toFixed(1));

  // Matching Aperture: N2 = N1 * (crop1 / crop2)
  const matchedAperture = Number((sourceAperture * cropRatio).toFixed(2));

  // Closest standard 1/3-stop click on target camera lens
  const closestThirdStop = useMemo(() => {
    return APERTURE_STOPS.reduce((prev, curr) => {
      return Math.abs(curr - matchedAperture) < Math.abs(prev - matchedAperture) ? curr : prev;
    });
  }, [matchedAperture]);

  // Matching ISO for identical shutter speed: ISO2 = ISO1 * (crop1 / crop2)^2

  const matchedIso = Math.round(sourceIso * Math.pow(cropRatio, 2));

  // Camera 1 Optical Telemetry
  const sourceDoF = useMemo(() => {
    return calculateDoF({
      focalLengthMm: sourceFocalMm,
      aperture: sourceAperture,
      distanceMeters: subjectDistanceMeters,
      sensorId: sourceSensorId
    });
  }, [sourceFocalMm, sourceAperture, subjectDistanceMeters, sourceSensorId]);

  const sourceFoV = useMemo(() => {
    return calculateFoV(sourceFocalMm, sourceSensorId, subjectDistanceMeters);
  }, [sourceFocalMm, sourceSensorId, subjectDistanceMeters]);

  // Camera 2 Matched Optical Telemetry
  const targetDoF = useMemo(() => {
    return calculateDoF({
      focalLengthMm: matchedFocalLengthMm,
      aperture: matchedAperture,
      distanceMeters: subjectDistanceMeters,
      sensorId: targetSensorId
    });
  }, [matchedFocalLengthMm, matchedAperture, subjectDistanceMeters, targetSensorId]);

  const targetFoV = useMemo(() => {
    return calculateFoV(matchedFocalLengthMm, targetSensorId, subjectDistanceMeters);
  }, [matchedFocalLengthMm, targetSensorId, subjectDistanceMeters]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="p-2 rounded-lg bg-brand-cyan/15 text-brand-cyan">
            <RefreshCw size={20} />
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Focal Length & Aperture Match
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Calculate the exact focal length, aperture, and ISO needed on a second camera to match Field of View & Depth of Field
        </p>
      </div>

      {/* Main Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Camera 1: Source (6 Cols) */}
        <div className="lg:col-span-6 glass-card rounded-2xl p-5 space-y-4 border-brand-cyan/20">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Camera size={18} className="text-brand-cyan" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Camera 1 (Original Shot)</h2>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-brand-cyan/15 text-brand-cyan font-bold">
              {sourceSensor.crop}x Crop
            </span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Sensor Format</label>
              <select
                value={sourceSensorId}
                onChange={e => setSourceSensorId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              >
                {SENSOR_PRESETS.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-400">Lens Focal Length:</span>
                <span className="text-brand-cyan font-bold">{sourceFocalMm} mm</span>
              </div>
              <input
                type="range"
                min="10"
                max="300"
                value={sourceFocalMm}
                onChange={e => setSourceFocalMm(Number(e.target.value))}
                className="w-full accent-brand-cyan cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-slate-400">Lens Aperture (1/3 Stop Steps):</span>
                <span className="text-brand-amber font-bold">f/{sourceAperture}</span>
              </div>
              <select
                value={sourceAperture}
                onChange={e => setSourceAperture(Number(e.target.value))}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              >
                {APERTURE_STOPS.map(a => (
                  <option key={a} value={a}>
                    f/{a}
                  </option>
                ))}
              </select>
            </div>


            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-slate-400 block mb-1">Subject Distance (m)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max="50"
                  value={subjectDistanceMeters}
                  onChange={e => setSubjectDistanceMeters(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1">ISO Sensitivity</label>
                <input
                  type="number"
                  step="100"
                  min="50"
                  max="102400"
                  value={sourceIso}
                  onChange={e => setSourceIso(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Results Summary for Camera 1 */}
          <div className="p-4 rounded-xl bg-slate-950 border border-white/5 space-y-2 text-xs font-mono">
            <span className="text-slate-400 block font-semibold text-[11px]">OPTICAL SPECIFICATIONS:</span>
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div>Horiz AoV: <span className="text-white font-bold">{sourceFoV.horizontalAngleDeg}°</span></div>
              <div>Diag AoV: <span className="text-white font-bold">{sourceFoV.diagonalAngleDeg}°</span></div>
              <div>Hyperfocal: <span className="text-brand-cyan font-bold">{sourceDoF.hyperfocalMeters}m</span></div>
              <div>Total DoF: <span className="text-brand-amber font-bold">{sourceDoF.totalDofMeters}m</span></div>
            </div>
          </div>
        </div>

        {/* Camera 2: Target Match (6 Cols) */}
        <div className="lg:col-span-6 glass-card rounded-2xl p-5 space-y-4 border-brand-amber/20">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Camera size={18} className="text-brand-amber" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Camera 2 (Matched Settings)</h2>
            </div>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-brand-amber/15 text-brand-amber font-bold">
              {targetSensor.crop}x Crop
            </span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Target Camera Sensor Format</label>
              <select
                value={targetSensorId}
                onChange={e => setTargetSensorId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono"
              >
                {SENSOR_PRESETS.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Matched Calculations Output Cards */}
            <div className="space-y-3 pt-2">
              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-brand-cyan/30 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">Matched Focal Length (Same FoV)</span>
                  <span className="text-xs text-slate-500 font-sans">f₂ = f₁ × ({sourceSensor.crop} / {targetSensor.crop})</span>
                </div>
                <span className="text-2xl font-bold text-brand-cyan">{matchedFocalLengthMm} mm</span>
              </div>

              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-brand-amber/30 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">Matched Aperture (Same DoF)</span>
                  <span className="text-xs text-slate-500 font-sans">1/3-Stop Click: <strong className="text-brand-amber">f/{closestThirdStop}</strong></span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-brand-amber">f/{matchedAperture}</span>
                  <span className="text-[10px] text-slate-400 block font-mono">Dial: f/{closestThirdStop}</span>
                </div>
              </div>


              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-400 block">Matched ISO (Same Shutter Speed)</span>
                  <span className="text-xs text-slate-500 font-sans">Compensates for equivalent f-stop</span>
                </div>
                <span className="text-xl font-bold text-slate-200">ISO {matchedIso}</span>
              </div>
            </div>
          </div>

          {/* Verification of Equivalence */}
          <div className="p-4 rounded-xl bg-slate-950 border border-brand-cyan/20 space-y-2 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-brand-cyan font-bold text-[11px]">
              <CheckCircle size={14} />
              <span>EQUIVALENCE VERIFICATION:</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div>Horiz AoV: <span className="text-white font-bold">{targetFoV.horizontalAngleDeg}°</span></div>
              <div>Diag AoV: <span className="text-white font-bold">{targetFoV.diagonalAngleDeg}°</span></div>
              <div>Hyperfocal: <span className="text-brand-cyan font-bold">{targetDoF.hyperfocalMeters}m</span></div>
              <div>Total DoF: <span className="text-brand-amber font-bold">{targetDoF.totalDofMeters}m</span></div>
            </div>
            <p className="text-[10px] text-slate-400 font-sans mt-1">
              Field of View and Depth of Field boundaries match identically within optical tolerances.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
