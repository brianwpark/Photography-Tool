import React from 'react';
import { Camera, MapPin, Navigation, Sparkles } from 'lucide-react';

export default function Header({
  activeView,
  onSelectView,
  location,
  onDetectLocation,
  isDetectingLocation,
  onOpenAR
}) {
  return (
    <header className="sticky top-0 z-40 bg-[#080d16]/85 backdrop-blur-xl border-b border-white/10 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <div 
          onClick={() => onSelectView('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-cyan to-brand-amber p-[1.5px] shadow-[0_0_15px_rgba(18,214,199,0.3)] group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#080d16] rounded-[10px] flex items-center justify-center">
              <Sparkles size={18} className="text-brand-cyan" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-white">AstroPro</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-brand-cyan/15 text-brand-cyan font-semibold border border-brand-cyan/30">
                FIELD
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono hidden sm:block">Photography & Ephemeris Suite</p>
          </div>
        </div>

        {/* Right Action Badges */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* GPS Coordinates & Detector */}
          <button
            type="button"
            onClick={onDetectLocation}
            disabled={isDetectingLocation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-xs font-mono text-slate-300 hover:text-white transition-all active:scale-95"
            title="Click to detect GPS location"
          >
            <MapPin size={14} className={isDetectingLocation ? 'text-brand-amber animate-spin' : 'text-brand-cyan'} />
            <span className="hidden sm:inline">{location.city || `${location.lat.toFixed(2)}°, ${location.lng.toFixed(2)}°`}</span>
            <span className="sm:hidden">{location.lat.toFixed(1)}°, {location.lng.toFixed(1)}°</span>
          </button>

          {/* Quick AR Viewfinder Button */}
          <button
            type="button"
            onClick={onOpenAR}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-cyan hover:bg-brand-cyanHover text-slate-950 font-semibold text-xs transition-all shadow-[0_0_15px_rgba(18,214,199,0.25)] active:scale-95"
          >
            <Camera size={14} />
            <span className="hidden sm:inline">AR Camera</span>
            <span className="sm:hidden">AR</span>
          </button>
        </div>
      </div>
    </header>
  );
}
