import React from 'react';
import { soundFx } from '../services/sound.js';

export default function RotaryDial({
  options = [],
  selectedIndex = 0,
  onChange,
  label = 'Aperture'
}) {
  const count = options.length;
  // Calculate rotation angle: span from -120 deg to +120 deg
  const startAngle = -120;
  const endAngle = 120;
  const currentAngle = count > 1 
    ? startAngle + (selectedIndex / (count - 1)) * (endAngle - startAngle)
    : 0;

  const handleStep = (direction) => {
    soundFx.playTick();
    const nextIndex = Math.max(0, Math.min(count - 1, selectedIndex + direction));
    onChange(nextIndex);
  };

  return (
    <div className="flex flex-col items-center select-none">
      <span className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
        {label}
      </span>

      <div className="flex items-center gap-4">
        {/* Step Down Button */}
        <button
          type="button"
          onClick={() => handleStep(-1)}
          disabled={selectedIndex === 0}
          className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-slate-300 font-mono text-sm border border-white/5 transition-all"
          title="Decrease"
        >
          -
        </button>

        {/* Rotary Tactile Knob */}
        <div 
          onClick={() => handleStep(selectedIndex < count - 1 ? 1 : -selectedIndex)}
          className="dial-knob"
          style={{
            transform: `rotate(${currentAngle}deg)`
          }}
          title="Click to advance stop"
        />

        {/* Step Up Button */}
        <button
          type="button"
          onClick={() => handleStep(1)}
          disabled={selectedIndex === count - 1}
          className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 active:scale-95 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center text-slate-300 font-mono text-sm border border-white/5 transition-all"
          title="Increase"
        >
          +
        </button>
      </div>

      {/* Selected Value Indicator */}
      <div className="mt-2 text-center">
        <span className="text-lg font-mono font-bold text-brand-cyan">
          {options[selectedIndex]}
        </span>
      </div>
    </div>
  );
}
