import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Compass, Grid, Crosshair, AlertCircle } from 'lucide-react';

export default function ArViewfinderModal({
  isOpen,
  onClose,
  moonData = { altitudeDeg: 42, azimuthCompass: 185 },
  sunData = { altitudeDeg: -15, azimuthCompass: 260 }
}) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [showGrid, setShowGrid] = useState(true);
  const [orientation, setOrientation] = useState({ alpha: 180, beta: 30, gamma: 0 });

  // Camera stream activation
  useEffect(() => {
    if (!isOpen) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      return;
    }

    let activeStream = null;

    const startCamera = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: 'environment' },
              width: { ideal: 1920 },
              height: { ideal: 1080 }
            },
            audio: false
          });
          activeStream = mediaStream;
          setStream(mediaStream);
          setHasCamera(true);
          setCameraError(null);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
        } else {
          setCameraError('Camera API not available in this environment. Showing simulated sensor HUD.');
        }
      } catch (err) {
        console.warn('Camera access:', err);
        setCameraError('Camera access unavailable. Rendering high-precision AR simulation HUD.');
        setHasCamera(false);
      }
    };

    startCamera();

    // Device orientation for AR alignment
    const handleOrientation = (e) => {
      if (e.alpha !== null) {
        setOrientation({
          alpha: Math.round(e.alpha || 0),
          beta: Math.round(e.beta || 0),
          gamma: Math.round(e.gamma || 0)
        });
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, true);

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(t => t.stop());
      }
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black overflow-hidden select-none">
      {/* Background Camera Video Stream or Night Sky Simulation */}
      {hasCamera && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 bg-[#080d16] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(18,214,199,0.15),rgba(255,255,255,0))] flex items-center justify-center">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(#12d6c7_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>
      )}

      {/* AR Viewfinder HUD Elements */}
      <div className="absolute inset-0 pointer-events-none p-4 sm:p-6 flex flex-col justify-between">
        {/* Top Status Bar */}
        <div className="flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white font-semibold">AR HUD ACTIVE</span>
            <span className="text-slate-400">|</span>
            <span className="text-brand-cyan">AZ {orientation.alpha}°</span>
            <span className="text-slate-400">|</span>
            <span className="text-brand-amber">ALT {orientation.beta}°</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowGrid(!showGrid)}
              className="p-2 rounded-full bg-black/60 backdrop-blur-md text-slate-300 hover:text-white border border-white/10 transition-all pointer-events-auto"
              title="Toggle Grid"
            >
              <Grid size={18} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-black/70 backdrop-blur-md text-white hover:bg-slate-800 border border-white/20 transition-all pointer-events-auto"
              title="Exit AR Viewfinder"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Center Reticle & Crosshairs */}
        <div className="relative flex-1 flex items-center justify-center">
          {/* Rule of Thirds Grid */}
          {showGrid && (
            <div className="absolute inset-8 sm:inset-16 grid grid-cols-3 grid-rows-3 border border-white/10 pointer-events-none">
              <div className="border-r border-b border-white/10" />
              <div className="border-r border-b border-white/10" />
              <div className="border-b border-white/10" />
              <div className="border-r border-b border-white/10" />
              <div className="border-r border-b border-white/10" />
              <div className="border-b border-white/10" />
              <div className="border-r border-white/10" />
              <div className="border-r border-white/10" />
              <div />
            </div>
          )}

          {/* Optical Crosshairs */}
          <div className="relative w-40 h-40 flex items-center justify-center">
            <div className="absolute w-full h-[1px] bg-brand-cyan/40" />
            <div className="absolute h-full w-[1px] bg-brand-cyan/40" />
            <div className="w-16 h-16 border border-brand-cyan/60 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-brand-cyan rounded-full animate-ping" />
            </div>
          </div>

          {/* Lunar Target Vector Overlay */}
          <div className="absolute top-1/4 right-1/4 flex flex-col items-center">
            <div className="w-12 h-12 border-2 border-brand-amber rounded-lg animate-pulse flex items-center justify-center shadow-[0_0_15px_rgba(252,163,17,0.5)]">
              <div className="w-3 h-3 bg-brand-amber rounded-full" />
            </div>
            <div className="mt-1 bg-black/80 px-2 py-0.5 rounded border border-brand-amber/40 text-[10px] font-mono text-brand-amber font-semibold whitespace-nowrap">
              TARGET LOCK: MOON ({moonData.altitudeDeg}° ALT)
            </div>
          </div>

          {/* Spirit Level (Roll Indicator) */}
          <div 
            className="absolute w-36 h-[2px] bg-white/70 transition-transform duration-100"
            style={{ transform: `rotate(${orientation.gamma}deg)` }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-brand-cyan shadow-[0_0_8px_#12d6c7]" />
          </div>
        </div>

        {/* Bottom Telemetry Bar */}
        <div className="bg-black/70 backdrop-blur-md rounded-xl p-3 border border-white/10 flex flex-wrap items-center justify-between text-xs font-mono text-slate-300">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-slate-500">PITCH: </span>
              <span className="text-white font-bold">{orientation.beta}°</span>
            </div>
            <div>
              <span className="text-slate-500">ROLL: </span>
              <span className="text-white font-bold">{orientation.gamma}°</span>
            </div>
            <div>
              <span className="text-slate-500">HEADING: </span>
              <span className="text-brand-cyan font-bold">{orientation.alpha}° N</span>
            </div>
          </div>

          {cameraError && (
            <div className="flex items-center gap-1.5 text-amber-400 text-[11px] mt-1 sm:mt-0">
              <AlertCircle size={13} />
              <span>{cameraError}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
