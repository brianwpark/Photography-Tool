import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Camera,
  Compass,
  Grid,
  Crosshair,
  AlertCircle,
  Sparkles,
  Orbit,
  Moon,
  Sun,
  ShieldAlert,
  ExternalLink,
  RefreshCw
} from 'lucide-react';

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
  const [isSecure, setIsSecure] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [arMode, setArMode] = useState('night'); // 'night' or 'day'
  const [showStarTrails, setShowStarTrails] = useState(true);
  const [orientation, setOrientation] = useState({ alpha: 180, beta: 30, gamma: 0 });
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);

  // Cross-browser getUserMedia helper with fallbacks
  const getCameraStream = useCallback(async () => {
    // Check secure context
    const secure = typeof window !== 'undefined' ? (window.isSecureContext ?? window.location.protocol === 'https:') : true;
    setIsSecure(secure);

    // If insecure context, modern mobile browsers completely remove navigator.mediaDevices
    if (!secure && window.location.protocol === 'http:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      throw new Error('INSECURE_CONTEXT');
    }

    // Try modern navigator.mediaDevices.getUserMedia
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        // Preferred: rear environment camera
        return await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });
      } catch (err1) {
        // Fallback: any available video camera
        console.warn('Environment camera request failed, falling back to basic video:', err1);
        return await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }
    }

    // Legacy browser fallback
    const legacyGetUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia;

    if (legacyGetUserMedia) {
      return new Promise((resolve, reject) => {
        legacyGetUserMedia.call(
          navigator,
          { video: { facingMode: 'environment' } },
          resolve,
          reject
        );
      });
    }

    throw new Error('CAMERA_API_UNAVAILABLE');
  }, []);

  // Request camera and attach to video element
  const startCamera = useCallback(async () => {
    setIsRequestingPermission(true);
    setCameraError(null);

    try {
      // iOS 13+ Device Orientation permission
      if (
        typeof DeviceOrientationEvent !== 'undefined' &&
        typeof DeviceOrientationEvent.requestPermission === 'function'
      ) {
        try {
          const perm = await DeviceOrientationEvent.requestPermission();
          console.log('Device orientation permission:', perm);
        } catch (orientErr) {
          console.warn('Orientation permission prompt:', orientErr);
        }
      }

      const mediaStream = await getCameraStream();
      setStream(mediaStream);
      setHasCamera(true);
      setCameraError(null);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(e => console.warn('Video play caught:', e));
        };
      }
    } catch (err) {
      console.warn('Camera initialization error:', err);
      setHasCamera(false);

      if (err.message === 'INSECURE_CONTEXT') {
        setCameraError('INSECURE_CONTEXT');
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied in browser settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No physical camera device detected on this unit.');
      } else {
        setCameraError('Camera unavailable in current browser mode. Using simulated HUD.');
      }
    } finally {
      setIsRequestingPermission(false);
    }
  }, [getCameraStream]);

  // Launch camera and orientation sensors when opened
  useEffect(() => {
    if (!isOpen) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      return;
    }

    startCamera();

    // Device orientation for AR alignment
    const handleOrientation = (e) => {
      if (e.alpha !== null && e.alpha !== undefined) {
        setOrientation({
          alpha: Math.round(e.alpha || 0),
          beta: Math.round(e.beta || 0),
          gamma: Math.round(e.gamma || 0)
        });
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, true);

    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isOpen, startCamera]);

  if (!isOpen) return null;

  // Handle switching to HTTPS
  const handleSwitchToHttps = () => {
    if (typeof window !== 'undefined') {
      const secureUrl = `https://${window.location.hostname}:3000${window.location.pathname}${window.location.search}`;
      window.location.href = secureUrl;
    }
  };

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
        <div className="flex items-center justify-between pointer-events-auto flex-wrap gap-2">
          <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${hasCamera ? 'bg-emerald-400 animate-pulse' : 'bg-brand-amber animate-pulse'}`} />
            <span className="text-white font-semibold">
              {hasCamera ? 'AR LIVE CAMERA' : 'AR SENSOR SIMULATION'}
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-brand-cyan">AZ {orientation.alpha}°</span>
            <span className="text-slate-400">|</span>
            <span className="text-brand-amber">ALT {orientation.beta}°</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Toggle: Night AR vs Solar AR */}
            <div className="flex bg-black/70 backdrop-blur-md rounded-full p-0.5 border border-white/10 text-xs font-mono">
              <button
                type="button"
                onClick={() => setArMode('night')}
                className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
                  arMode === 'night'
                    ? 'bg-brand-cyan text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sparkles size={12} />
                <span>Night AR</span>
              </button>
              <button
                type="button"
                onClick={() => setArMode('day')}
                className={`px-3 py-1 rounded-full transition-all flex items-center gap-1 ${
                  arMode === 'day'
                    ? 'bg-brand-amber text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sun size={12} />
                <span>Sun/Moon</span>
              </button>
            </div>

            {arMode === 'night' && (
              <button
                type="button"
                onClick={() => setShowStarTrails(!showStarTrails)}
                className={`p-2 rounded-full border transition-all pointer-events-auto ${
                  showStarTrails
                    ? 'bg-brand-amber/20 text-brand-amber border-brand-amber/40'
                    : 'bg-black/70 text-slate-400 border-white/10'
                }`}
                title="Toggle Star Trails Arc Pattern"
              >
                <Orbit size={18} />
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowGrid(!showGrid)}
              className="p-2 rounded-full bg-black/70 backdrop-blur-md text-slate-300 hover:text-white border border-white/10 transition-all pointer-events-auto"
              title="Toggle Grid"
            >
              <Grid size={18} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-black/80 backdrop-blur-md text-white hover:bg-slate-800 border border-white/20 transition-all pointer-events-auto"
              title="Exit AR Viewfinder"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Center Reticle, Guidance & Prompts */}
        <div className="relative flex-1 flex items-center justify-center overflow-hidden">
          {/* Insecure Context Banner (HTTP on Mobile) */}
          {cameraError === 'INSECURE_CONTEXT' && (
            <div className="pointer-events-auto z-20 max-w-md mx-4 bg-slate-900/95 border border-brand-amber/50 rounded-2xl p-5 shadow-2xl backdrop-blur-xl text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-brand-amber/15 text-brand-amber flex items-center justify-center">
                <ShieldAlert size={28} />
              </div>
              <div>
                <h3 className="text-white font-bold text-base">HTTPS Required for Camera</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Mobile browsers (iOS Safari & Chrome) block camera hardware when accessed via unencrypted <code className="text-brand-amber">http://</code> on local networks.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  onClick={handleSwitchToHttps}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-brand-cyan hover:bg-brand-cyanHover text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(18,214,199,0.3)]"
                >
                  <ExternalLink size={14} />
                  <span>Switch to HTTPS (Secure)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCameraError(null)}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-all font-mono"
                >
                  Continue with Simulation
                </button>
              </div>
              <p className="text-[10px] text-slate-400 font-mono">
                Note: Tap "Advanced" &rarr; "Proceed" if your phone asks about the self-signed certificate.
              </p>
            </div>
          )}

          {/* Retry / Enable Camera Overlay if camera is not active and no insecure context */}
          {!hasCamera && !cameraError && (
            <div className="pointer-events-auto z-10 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={startCamera}
                disabled={isRequestingPermission}
                className="py-2.5 px-4 rounded-xl bg-brand-cyan hover:bg-brand-cyanHover text-slate-950 font-semibold text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(18,214,199,0.3)] transition-all active:scale-95"
              >
                {isRequestingPermission ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Camera size={14} />
                )}
                <span>{isRequestingPermission ? 'Connecting...' : 'Tap to Enable Camera Stream'}</span>
              </button>
            </div>
          )}

          {/* Rule of Thirds Grid */}
          {showGrid && (
            <div className="absolute inset-8 sm:inset-16 grid grid-cols-3 grid-rows-3 border border-white/10 pointer-events-none">
              <div className="border-r border-b border-white/10" />
              <div className="border-r border-b border-white/10" />
              <div className="border-b border-white/10" />
              <div className="border-r border-b border-white/10" />
              <div className="border-r border-b border-white/10" />
              <div className="border-b border-white/10" />
              <div className="border-r border-b border-white/10" />
              <div className="border-r border-b border-white/10" />
              <div />
            </div>
          )}

          {/* Night AR: Concentric Star Trails Pattern (Centered on Polaris / Celestial Pole) */}
          {arMode === 'night' && showStarTrails && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
              <div className="w-[180px] h-[180px] border border-dashed border-cyan-400 rounded-full" />
              <div className="absolute w-[280px] h-[280px] border border-dashed border-cyan-400 rounded-full" />
              <div className="absolute w-[400px] h-[400px] border border-dashed border-cyan-400 rounded-full" />
              <div className="absolute w-[560px] h-[560px] border border-dashed border-cyan-400 rounded-full" />
              {/* Polaris Indicator */}
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/80 px-2 py-0.5 rounded border border-cyan-400/50 text-[10px] font-mono text-cyan-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>POLARIS (North Celestial Pole)</span>
              </div>
            </div>
          )}

          {/* Night AR: Milky Way Arch Overlay */}
          {arMode === 'night' && (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center">
              <div className="w-full h-24 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent blur-xl transform -rotate-25" />
              <div className="absolute right-1/4 top-1/4 flex flex-col items-center">
                <div className="w-10 h-10 border border-brand-cyan/70 rounded-full flex items-center justify-center animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-brand-cyan" />
                </div>
                <span className="mt-1 bg-black/80 px-2 py-0.5 rounded border border-brand-cyan/40 text-[9px] font-mono text-brand-cyan font-bold">
                  GALACTIC CENTER (MILKY WAY CORE)
                </span>
              </div>
            </div>
          )}

          {/* Optical Crosshairs */}
          <div className="relative w-40 h-40 flex items-center justify-center pointer-events-none">
            <div className="absolute w-full h-[1px] bg-brand-cyan/40" />
            <div className="absolute h-full w-[1px] bg-brand-cyan/40" />
            <div className="w-16 h-16 border border-brand-cyan/60 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-brand-cyan rounded-full animate-ping" />
            </div>
          </div>

          {/* Lunar Target Vector Overlay */}
          <div className="absolute top-1/4 right-1/4 flex flex-col items-center pointer-events-none">
            <div className="w-12 h-12 border-2 border-brand-amber rounded-lg animate-pulse flex items-center justify-center shadow-[0_0_15px_rgba(252,163,17,0.5)]">
              <div className="w-3 h-3 bg-brand-amber rounded-full" />
            </div>
            <div className="mt-1 bg-black/80 px-2 py-0.5 rounded border border-brand-amber/40 text-[10px] font-mono text-brand-amber font-semibold whitespace-nowrap">
              TARGET LOCK: MOON ({moonData.altitudeDeg}° ALT)
            </div>
          </div>

          {/* Spirit Level (Roll Indicator) */}
          <div 
            className="absolute w-36 h-[2px] bg-white/70 transition-transform duration-100 pointer-events-none"
            style={{ transform: `rotate(${orientation.gamma}deg)` }}
          >
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-brand-cyan shadow-[0_0_8px_#12d6c7]" />
          </div>
        </div>

        {/* Bottom Telemetry Bar */}
        <div className="bg-black/75 backdrop-blur-md rounded-xl p-3 border border-white/10 flex flex-wrap items-center justify-between text-xs font-mono text-slate-300 pointer-events-auto gap-2">
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

          {cameraError && cameraError !== 'INSECURE_CONTEXT' && (
            <div className="flex items-center gap-1.5 text-amber-400 text-[11px]">
              <AlertCircle size={13} />
              <span>{cameraError}</span>
            </div>
          )}

          {!hasCamera && (
            <button
              type="button"
              onClick={startCamera}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] text-brand-cyan flex items-center gap-1 border border-white/10"
            >
              <RefreshCw size={11} />
              <span>Retry Camera</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
