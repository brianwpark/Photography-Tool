import React from 'react';

export default function RealisticMoon({
  phasePercentage = 93,
  phaseName = 'Waning Gibbous',
  showOrbit = true,
  satelliteLabel = 'ISS'
}) {
  // Phase angle calculation (0 to 180 deg)
  const isWaxing = phasePercentage >= 50;

  return (
    <div className="relative flex items-center justify-center w-full h-44 overflow-hidden select-none">
      {/* Orbital Ellipse */}
      {showOrbit && (
        <div className="absolute w-[240px] h-[115px] border border-brand-amber/40 rounded-[50%] -rotate-[22deg] pointer-events-none">
          {/* Animated Orbiting Satellite Node */}
          <div className="absolute -top-1.5 right-6 w-3 h-3 bg-brand-amber rounded-full orbit-pulse flex items-center justify-center">
            <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-mono font-semibold tracking-wider text-brand-amber bg-black/70 px-1.5 py-0.5 rounded border border-brand-amber/30 whitespace-nowrap">
              {satelliteLabel}
            </span>
          </div>
        </div>
      )}

      {/* Lunar Disc */}
      <div className="relative w-28 h-28 rounded-full shadow-[0_0_35px_rgba(255,255,255,0.18)] overflow-hidden bg-slate-900 border border-slate-700/60">
        {/* Moon Base Surface with Crater Blends */}
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle at 40% 40%, #e2e8f0 0%, #cbd5e1 45%, #94a3b8 80%, #475569 100%)',
          }}
        />

        {/* Procedural Crater Textures */}
        <div className="absolute inset-0 opacity-40 mix-blend-multiply pointer-events-none">
          <div className="absolute top-4 left-6 w-5 h-5 rounded-full bg-slate-600/60 blur-[0.5px]" />
          <div className="absolute top-10 left-12 w-8 h-7 rounded-full bg-slate-600/50 blur-[0.8px]" />
          <div className="absolute bottom-5 left-5 w-7 h-7 rounded-full bg-slate-700/60 blur-[0.5px]" />
          <div className="absolute bottom-8 right-7 w-6 h-6 rounded-full bg-slate-600/40 blur-[0.5px]" />
          <div className="absolute top-5 right-5 w-4 h-4 rounded-full bg-slate-500/50" />
        </div>

        {/* Phase Terminator Shadow */}
        <div 
          className="absolute inset-0 rounded-full pointer-events-none transition-all duration-700"
          style={{
            background: isWaxing 
              ? `linear-gradient(to right, transparent ${phasePercentage}%, rgba(8, 13, 22, 0.92) ${phasePercentage + 8}%)`
              : `linear-gradient(to left, transparent ${phasePercentage}%, rgba(8, 13, 22, 0.92) ${phasePercentage + 8}%)`
          }}
        />

        {/* Atmospheric Lunar Limb Glow */}
        <div className="absolute inset-0 rounded-full border border-white/20 pointer-events-none shadow-[inset_0_0_12px_rgba(255,255,255,0.4)]" />
      </div>

      {/* Phase Label Pill */}
      <div className="absolute bottom-1 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-mono font-medium text-slate-300">
        {phaseName} • <span className="text-brand-cyan">{phasePercentage}% Illum</span>
      </div>
    </div>
  );
}
