import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  X,
  Camera,
  Compass,
  Grid,
  Sun,
  Moon,
  Clock,
  Calendar,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ExternalLink,
  RefreshCw,
  Eye,
  Check,
  Target,
  Image as ImageIcon
} from 'lucide-react';
import SunCalc from 'suncalc';
import { radToDeg, degToRad, getDailyCelestialPath, getMoonPhaseName } from '../services/ephemeris.js';

// Cardinal & intercardinal compass markers
const COMPASS_POINTS = [
  { label: 'N', deg: 0, isCardinal: true },
  { label: '15°', deg: 15 },
  { label: '30°', deg: 30 },
  { label: 'NE', deg: 45 },
  { label: '60°', deg: 60 },
  { label: '75°', deg: 75 },
  { label: 'E', deg: 90, isCardinal: true },
  { label: '105°', deg: 105 },
  { label: '120°', deg: 120 },
  { label: 'SE', deg: 135 },
  { label: '150°', deg: 150 },
  { label: '165°', deg: 165 },
  { label: 'S', deg: 180, isCardinal: true },
  { label: '195°', deg: 195 },
  { label: '210°', deg: 210 },
  { label: 'SW', deg: 225 },
  { label: '240°', deg: 240 },
  { label: '247.5°', deg: 247.5, isSpecial: true },
  { label: '255°', deg: 255 },
  { label: 'W', deg: 270, isCardinal: true },
  { label: '285°', deg: 285 },
  { label: '300°', deg: 300 },
  { label: 'NW', deg: 315 },
  { label: '330°', deg: 330 },
  { label: '345°', deg: 345 }
];

// Elevation steps: -20° up to +80° in 10-degree increments
const ELEVATION_STEPS = [-20, -10, 0, 10, 20, 30, 40, 50, 60, 70, 80];

export default function ArViewfinderModal({
  isOpen,
  onClose,
  userLocation = { lat: 33.749, lng: -84.388 },
  initialDate = new Date()
}) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);

  // Stream & Hardware Camera State
  const [stream, setStream] = useState(null);
  const [hasCamera, setHasCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [bgSceneMode, setBgSceneMode] = useState('auto'); // 'auto', 'camera', 'landscape'

  // Dimensions
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Orientation & Compass Calibration
  // beta: 90 is upright vertical portrait looking at horizon
  const [deviceOrientation, setDeviceOrientation] = useState({ alpha: 250, beta: 90, gamma: 0 });
  const [calibrationOffset, setCalibrationOffset] = useState(0); // Manual visual compass calibration offset (-45 to +45 deg)
  const [elevationOffset, setElevationOffset] = useState(0); // Manual pitch offset (-30 to +30 deg)
  const [isCalibrating, setIsCalibrating] = useState(false);

  // Touch / Drag Pan & Tilt state (fluid & responsive)
  const isDraggingRef = useRef(false);
  const lastTouchPosRef = useRef({ x: 0, y: 0 });

  // Date & Time Controls
  const [selectedDate, setSelectedDate] = useState(() => new Date(initialDate));
  const [minuteOfDay, setMinuteOfDay] = useState(() => {
    const d = new Date(initialDate);
    // If opened during night hours (e.g. midnight), default to late afternoon (6:50 PM = 1130 min) like the reference photo so the Sun trajectory is immediately visible!
    const mins = d.getHours() * 60 + d.getMinutes();
    return (mins < 360 || mins > 1260) ? 1130 : mins;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimerRef = useRef(null);

  // Display toggles
  const [displayMode, setDisplayMode] = useState('sun'); // 'sun', 'moon', 'both'
  const [showGrid, setShowGrid] = useState(true);
  const [showTimeControls, setShowTimeControls] = useState(true);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync selectedDate with minuteOfDay
  const currentDateTime = useMemo(() => {
    const d = new Date(selectedDate);
    const hours = Math.floor(minuteOfDay / 60);
    const mins = minuteOfDay % 60;
    d.setHours(hours, mins, 0, 0);
    return d;
  }, [selectedDate, minuteOfDay]);

  // Compute 24h Celestial Path (Sun, Moon, hourly markers)
  const celestialData = useMemo(() => {
    return getDailyCelestialPath(selectedDate, userLocation.lat, userLocation.lng);
  }, [selectedDate, userLocation.lat, userLocation.lng]);

  // Compute current Sun & Moon exact positions for currentDateTime
  const currentSunMoon = useMemo(() => {
    const sunPos = SunCalc.getPosition(currentDateTime, userLocation.lat, userLocation.lng);
    const moonPos = SunCalc.getMoonPosition(currentDateTime, userLocation.lat, userLocation.lng);
    const moonIllum = SunCalc.getMoonIllumination(currentDateTime);

    return {
      sun: {
        altitude: Number(radToDeg(sunPos.altitude).toFixed(2)),
        azimuth: Number(((radToDeg(sunPos.azimuth) + 180) % 360).toFixed(2))
      },
      moon: {
        altitude: Number(radToDeg(moonPos.altitude).toFixed(2)),
        azimuth: Number(((radToDeg(moonPos.azimuth) + 180) % 360).toFixed(2)),
        phase: moonIllum.phase,
        fraction: moonIllum.fraction,
        phaseName: getMoonPhaseName(moonIllum.phase)
      }
    };
  }, [currentDateTime, userLocation.lat, userLocation.lng]);

  // Camera stream activation helper
  const getCameraStream = useCallback(async () => {
    const secure = typeof window !== 'undefined' ? (window.isSecureContext ?? window.location.protocol === 'https:') : true;
    if (!secure && window.location.protocol === 'http:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      throw new Error('INSECURE_CONTEXT');
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        return await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });
      } catch (err) {
        return await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
    }

    const legacy = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    if (legacy) {
      return new Promise((resolve, reject) => {
        legacy.call(navigator, { video: { facingMode: 'environment' } }, resolve, reject);
      });
    }

    throw new Error('CAMERA_API_UNAVAILABLE');
  }, []);

  const startCamera = useCallback(async () => {
    setIsRequestingPermission(true);
    setCameraError(null);

    try {
      if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        try {
          await DeviceOrientationEvent.requestPermission();
        } catch (e) {
          console.warn('Orientation prompt:', e);
        }
      }

      const mediaStream = await getCameraStream();
      setStream(mediaStream);
      setHasCamera(true);
      setCameraError(null);
    } catch (err) {
      setHasCamera(false);
      if (err.message === 'INSECURE_CONTEXT') {
        setCameraError('INSECURE_CONTEXT');
      } else {
        setCameraError(err.message || 'Camera unavailable. Showing visual simulated scene.');
      }
    } finally {
      setIsRequestingPermission(false);
    }
  }, [getCameraStream]);

  // Dedicated effect to attach stream to video element whenever stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(e => console.warn('Video play error:', e));
    }
  }, [stream]);

  // Handle opening / closing and deviceorientation
  useEffect(() => {
    if (!isOpen) {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
        setStream(null);
      }
      setIsPlaying(false);
      return;
    }

    startCamera();

    // iOS and Android cross-platform orientation handler
    const handleOrientation = (e) => {
      // 1. Compass Heading:
      // On iOS: e.webkitCompassHeading is the true native 0-360° compass heading!
      // On Android / W3C: e.alpha increases counter-clockwise, so (360 - e.alpha) is compass heading
      let compassHeading = e.webkitCompassHeading;
      if (compassHeading === undefined || compassHeading === null) {
        if (e.alpha !== null && e.alpha !== undefined) {
          compassHeading = (360 - e.alpha) % 360;
        }
      }

      // If user is currently dragging manually, skip sensor update so it doesn't fight the user's thumb
      if (isDraggingRef.current) return;

      if (compassHeading !== undefined && compassHeading !== null) {
        setDeviceOrientation(prev => ({
          alpha: compassHeading,
          beta: e.beta ?? prev.beta,
          gamma: e.gamma ?? prev.gamma
        }));
      }
    };

    window.addEventListener('deviceorientation', handleOrientation, true);

    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isOpen, startCamera]);

  // Animation player for time movement
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        setMinuteOfDay(prev => (prev + 3) % 1440);
      }, 50);
    } else if (playTimerRef.current) {
      clearInterval(playTimerRef.current);
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying]);

  // Reset to "Now"
  const handleResetToNow = () => {
    const now = new Date();
    setSelectedDate(now);
    setMinuteOfDay(now.getHours() * 60 + now.getMinutes());
    setIsPlaying(false);
  };

  // Center / Target Sun or Moon directly
  const handleTargetCelestial = (type) => {
    if (type === 'sun') {
      setDisplayMode('sun');
      setDeviceOrientation(prev => ({
        ...prev,
        alpha: currentSunMoon.sun.azimuth,
        beta: 90 + currentSunMoon.sun.altitude
      }));
    } else if (type === 'moon') {
      setDisplayMode('moon');
      setDeviceOrientation(prev => ({
        ...prev,
        alpha: currentSunMoon.moon.azimuth,
        beta: 90 + currentSunMoon.moon.altitude
      }));
    }
  };

  // Quick jump to cardinal compass bearing
  const handleJumpToBearing = (deg) => {
    setDeviceOrientation(prev => ({
      ...prev,
      alpha: deg,
      beta: 90
    }));
  };

  // Fluid and responsive touch / mouse panning
  const handleTouchOrMouseDown = (clientX, clientY) => {
    isDraggingRef.current = true;
    lastTouchPosRef.current = { x: clientX, y: clientY };
  };

  const handleTouchOrMouseMove = (clientX, clientY) => {
    if (!isDraggingRef.current) return;
    const dx = clientX - lastTouchPosRef.current.x;
    const dy = clientY - lastTouchPosRef.current.y;
    lastTouchPosRef.current = { x: clientX, y: clientY };

    // Fluid sensitivity: ~0.4° per pixel allows natural 1:1 camera swipe
    setDeviceOrientation(prev => ({
      ...prev,
      alpha: (prev.alpha - dx * 0.42 + 360) % 360,
      beta: Math.max(10, Math.min(170, prev.beta + dy * 0.35))
    }));
  };

  const handleTouchOrMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Switch to HTTPS if insecure
  const handleSwitchToHttps = () => {
    if (typeof window !== 'undefined') {
      window.location.href = `https://${window.location.hostname}:3000${window.location.pathname}${window.location.search}`;
    }
  };

  // Effective Heading & Elevation
  // Phone held in portrait upright: beta is 90 when pointing at horizon.
  // Pitch angle relative to horizon: (beta - 90)
  const currentHeading = (deviceOrientation.alpha + calibrationOffset + 360) % 360;
  const currentPitch = (deviceOrientation.beta - 90) + elevationOffset;
  const currentRoll = deviceOrientation.gamma || 0;

  // AR Camera Projection Math
  // Field of view: ~62° horizontal FoV
  const hFoVDeg = 62;
  const vFoVDeg = useMemo(() => {
    return 2 * Math.atan(Math.tan(degToRad(hFoVDeg / 2)) * (dimensions.height / dimensions.width)) * (180 / Math.PI);
  }, [dimensions.width, dimensions.height]);

  const focalX = (dimensions.width / 2) / Math.tan(degToRad(hFoVDeg / 2));
  const focalY = (dimensions.height / 2) / Math.tan(degToRad(vFoVDeg / 2));

  // Projects spherical celestial coordinates (azimuth, altitude in degrees) into screen coordinates (x, y)
  const projectToScreen = useCallback((azimuthDeg, altitudeDeg) => {
    // Relative azimuth in [-180, 180]
    let dAz = ((azimuthDeg - currentHeading + 540) % 360) - 180;
    // Relative altitude
    let dAlt = altitudeDeg - currentPitch;

    // Check if point is behind the camera (outside 85 deg cone)
    if (Math.abs(dAz) > 85 || Math.abs(dAlt) > 85) {
      return null;
    }

    // Rectilinear perspective projection
    let x = focalX * Math.tan(degToRad(dAz));
    let y = -focalY * Math.tan(degToRad(dAlt));

    // Apply roll rotation around screen center
    const rollRad = degToRad(-currentRoll);
    const cosR = Math.cos(rollRad);
    const sinR = Math.sin(rollRad);

    const rx = x * cosR - y * sinR;
    const ry = x * sinR + y * cosR;

    const screenX = dimensions.width / 2 + rx;
    const screenY = dimensions.height / 2 + ry;

    return {
      x: screenX,
      y: screenY,
      dAz,
      dAlt,
      isVisible: screenX >= -100 && screenX <= dimensions.width + 100 && screenY >= -100 && screenY <= dimensions.height + 100
    };
  }, [currentHeading, currentPitch, currentRoll, focalX, focalY, dimensions.width, dimensions.height]);

  // Generate SVG Path for an Elevation line (0°, 10°, 20°, etc.)
  const getElevationPath = useCallback((elevDeg) => {
    const points = [];
    for (let offset = -50; offset <= 50; offset += 3) {
      const az = (currentHeading + offset + 360) % 360;
      const pt = projectToScreen(az, elevDeg);
      if (pt) {
        points.push(`${pt.x.toFixed(1)},${pt.y.toFixed(1)}`);
      }
    }
    if (points.length < 2) return null;
    return `M ${points.join(' L ')}`;
  }, [currentHeading, projectToScreen]);

  // Generate SVG Path for an Azimuthal line (vertical meridian)
  const getAzimuthPath = useCallback((azDeg) => {
    const points = [];
    for (let alt = -30; alt <= 80; alt += 4) {
      const pt = projectToScreen(azDeg, alt);
      if (pt) {
        points.push(`${pt.x.toFixed(1)},${pt.y.toFixed(1)}`);
      }
    }
    if (points.length < 2) return null;
    return `M ${points.join(' L ')}`;
  }, [projectToScreen]);

  // Project 24-hour Sun Path
  const sunPathSvg = useMemo(() => {
    if (displayMode === 'moon') return null;
    const segments = [];
    let currentSegment = [];

    celestialData.sunPath.forEach(pt => {
      const p = projectToScreen(pt.azimuth, pt.altitude);
      if (p && p.isVisible) {
        currentSegment.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
      } else {
        if (currentSegment.length > 1) {
          segments.push(`M ${currentSegment.join(' L ')}`);
        }
        currentSegment = [];
      }
    });
    if (currentSegment.length > 1) {
      segments.push(`M ${currentSegment.join(' L ')}`);
    }
    return segments.join(' ');
  }, [celestialData.sunPath, projectToScreen, displayMode]);

  // Project 24-hour Moon Path
  const moonPathSvg = useMemo(() => {
    if (displayMode === 'sun') return null;
    const segments = [];
    let currentSegment = [];

    celestialData.moonPath.forEach(pt => {
      const p = projectToScreen(pt.azimuth, pt.altitude);
      if (p && p.isVisible) {
        currentSegment.push(`${p.x.toFixed(1)},${p.y.toFixed(1)}`);
      } else {
        if (currentSegment.length > 1) {
          segments.push(`M ${currentSegment.join(' L ')}`);
        }
        currentSegment = [];
      }
    });
    if (currentSegment.length > 1) {
      segments.push(`M ${currentSegment.join(' L ')}`);
    }
    return segments.join(' ');
  }, [celestialData.moonPath, projectToScreen, displayMode]);

  // Project current Sun and Moon coordinates
  const currentSunScreen = useMemo(() => {
    if (displayMode === 'moon') return null;
    return projectToScreen(currentSunMoon.sun.azimuth, currentSunMoon.sun.altitude);
  }, [currentSunMoon.sun, projectToScreen, displayMode]);

  const currentMoonScreen = useMemo(() => {
    if (displayMode === 'sun') return null;
    return projectToScreen(currentSunMoon.moon.azimuth, currentSunMoon.moon.altitude);
  }, [currentSunMoon.moon, projectToScreen, displayMode]);

  // Formatted date string for top-left header: e.g. "4/17/18, 6:51 PM"
  const formattedHeaderDateTime = useMemo(() => {
    const m = currentDateTime.getMonth() + 1;
    const d = currentDateTime.getDate();
    const y = String(currentDateTime.getFullYear()).slice(-2);
    const timeStr = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(currentDateTime);

    return `${m}/${d}/${y}, ${timeStr}`;
  }, [currentDateTime]);

  // Determine whether to show camera feed or visual landscape simulation
  const isShowingLiveCamera = hasCamera && stream && bgSceneMode !== 'landscape';

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-[#0b1320] overflow-hidden select-none touch-none"
      onMouseDown={(e) => handleTouchOrMouseDown(e.clientX, e.clientY)}
      onMouseMove={(e) => handleTouchOrMouseMove(e.clientX, e.clientY)}
      onMouseUp={handleTouchOrMouseUp}
      onTouchStart={(e) => {
        if (e.touches.length === 1) {
          handleTouchOrMouseDown(e.touches[0].clientX, e.touches[0].clientY);
        }
      }}
      onTouchMove={(e) => {
        if (e.touches.length === 1) {
          handleTouchOrMouseMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      }}
      onTouchEnd={handleTouchOrMouseUp}
    >
      {/* 1. Camera Video Feed (Always mounted so videoRef is never null) */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        webkit-playsinline="true"
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-500 ${
          isShowingLiveCamera ? 'opacity-100 z-0' : 'opacity-0 -z-10'
        }`}
      />

      {/* 2. Visual Simulated Landscape & Sky Backdrop (Active when camera is off or in simulation mode) */}
      {!isShowingLiveCamera && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* Photorealistic Sky Gradient matching reference photo */}
          <div
            className="absolute inset-0 transition-all duration-700"
            style={{
              background: currentSunMoon.sun.altitude > 0
                ? 'linear-gradient(to bottom, #1d4ed8 0%, #38bdf8 45%, #bae6fd 75%, #e0f2fe 100%)'
                : currentSunMoon.sun.altitude > -6
                ? 'linear-gradient(to bottom, #1e1b4b 0%, #4338ca 30%, #c2410c 65%, #ea580c 85%, #f97316 100%)'
                : 'linear-gradient(to bottom, #090d16 0%, #111c30 40%, #1e293b 80%, #334155 100%)'
            }}
          />

          {/* Soft atmospheric clouds layer */}
          <div className="absolute inset-x-0 top-0 h-3/5 opacity-40 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/30 via-transparent to-transparent pointer-events-none" />

          {/* Distant Monument / Landscape Silhouette & Water Reflection (from reference photo) */}
          <div className="absolute bottom-0 inset-x-0 h-2/5 flex flex-col justify-end pointer-events-none">
            {/* Architectural Monument Silhouette */}
            <div className="relative w-full h-32 flex items-end justify-center opacity-85">
              {/* Central Gate/Columns */}
              <div className="w-20 h-24 bg-[#1b2432] rounded-t-sm shadow-2xl relative mx-1">
                <div className="absolute bottom-0 inset-x-3 h-16 bg-[#0f172a] rounded-t-sm" />
              </div>
              <div className="w-16 h-20 bg-[#222e40] rounded-t-sm shadow-xl mx-2" />
              <div className="w-14 h-18 bg-[#1e293b] rounded-t-sm shadow-xl mx-1" />
              {/* Tree line on horizons */}
              <div className="absolute bottom-0 left-0 w-1/3 h-16 bg-gradient-to-r from-[#17202e] to-transparent rounded-t-full opacity-90" />
              <div className="absolute bottom-0 right-0 w-1/3 h-16 bg-gradient-to-l from-[#17202e] to-transparent rounded-t-full opacity-90" />
            </div>

            {/* Reflecting Pool / Water Surface */}
            <div className="w-full h-24 bg-gradient-to-b from-[#16202e] to-[#0a0f18] opacity-95 relative border-t border-white/20">
              <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px)] [background-size:24px_100%]" />
            </div>
          </div>
        </div>
      )}

      {/* 3. Fullscreen SVG Overlay for Celestial Paths, Horizon & Elevation Grid */}
      <svg
        className="absolute inset-0 w-full h-full z-10 pointer-events-none"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
      >
        <defs>
          {/* Sun disc glow filters */}
          <filter id="sun-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <radialGradient id="sun-gradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFBEB" />
            <stop offset="35%" stopColor="#FBBF24" />
            <stop offset="85%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" stopOpacity="0.9" />
          </radialGradient>

          {/* Moon disc gradient */}
          <radialGradient id="moon-gradient" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#E2E8F0" />
            <stop offset="100%" stopColor="#94A3B8" />
          </radialGradient>
        </defs>

        {/* --- GRID SYSTEM: ELEVATION & AZIMUTH --- */}
        {showGrid && (
          <g className="grid-layer">
            {/* Azimuthal (Vertical) Meridian Lines */}
            {COMPASS_POINTS.map((cp, idx) => {
              const path = getAzimuthPath(cp.deg);
              if (!path) return null;
              const isMajor = cp.deg % 45 === 0;
              return (
                <path
                  key={`az-line-${idx}`}
                  d={path}
                  stroke={isMajor ? 'rgba(255, 255, 255, 0.55)' : 'rgba(255, 255, 255, 0.25)'}
                  strokeWidth={isMajor ? '1.5' : '1'}
                  strokeDasharray={isMajor ? undefined : '5 5'}
                  fill="none"
                />
              );
            })}

            {/* Elevation (Horizontal) Arcs (10-degree steps) */}
            {ELEVATION_STEPS.map((elev) => {
              const path = getElevationPath(elev);
              if (!path) return null;
              const isHorizon = elev === 0;

              return (
                <g key={`elev-group-${elev}`}>
                  <path
                    d={path}
                    stroke={isHorizon ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.38)'}
                    strokeWidth={isHorizon ? '2.5' : '1.2'}
                    fill="none"
                  />
                  {/* Elevation Label Pill (e.g., "10.0°") */}
                  {!isHorizon && elev > 0 && (() => {
                    const labelPt = projectToScreen((currentHeading + 10) % 360, elev);
                    if (!labelPt || !labelPt.isVisible) return null;
                    return (
                      <g transform={`translate(${labelPt.x}, ${labelPt.y})`}>
                        <circle r="16" fill="rgba(255, 255, 255, 0.25)" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1" />
                        <text
                          y="4"
                          textAnchor="middle"
                          fill="#FFFFFF"
                          fontSize="11"
                          fontFamily="monospace"
                          fontWeight="600"
                        >
                          {elev.toFixed(1)}°
                        </text>
                      </g>
                    );
                  })()}
                </g>
              );
            })}

            {/* Compass Badges on the Horizon Line (e.g. [W], [247.5°], [SW]) */}
            {COMPASS_POINTS.map((cp, idx) => {
              const pt = projectToScreen(cp.deg, 0);
              if (!pt || !pt.isVisible) return null;

              const isCardinal = cp.isCardinal || cp.label === 'W' || cp.label === 'E' || cp.label === 'N' || cp.label === 'S';
              const isSpecial = cp.isSpecial || cp.label === '247.5°';

              if (!isCardinal && !isSpecial && cp.deg % 45 !== 0) return null;

              return (
                <g key={`compass-badge-${idx}`} transform={`translate(${pt.x}, ${pt.y})`}>
                  {/* Frosted circular badge as in PhotoPills reference photo */}
                  <circle
                    r={isCardinal ? 26 : 22}
                    fill="rgba(255, 255, 255, 0.35)"
                    stroke="rgba(255, 255, 255, 0.75)"
                    strokeWidth="1.5"
                    style={{ backdropFilter: 'blur(4px)' }}
                  />
                  <text
                    y={isCardinal ? 6 : 4}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize={isCardinal ? '18' : '10'}
                    fontWeight={isCardinal ? '800' : '600'}
                    fontFamily="monospace"
                  >
                    {cp.label}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* --- SUN PATH TRAJECTORY ARC --- */}
        {sunPathSvg && (
          <g className="sun-path-layer">
            <path
              d={sunPathSvg}
              stroke="#F59E0B"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="drop-shadow(0 0 6px rgba(245, 158, 11, 0.7))"
            />

            {/* Hourly Markers & Time Labels along Sun Path */}
            {celestialData.hourlyMarkers.map((marker, idx) => {
              const pt = projectToScreen(marker.sun.azimuth, marker.sun.altitude);
              if (!pt || !pt.isVisible) return null;

              return (
                <g key={`sun-hour-${idx}`} transform={`translate(${pt.x}, ${pt.y})`}>
                  {/* Trajectory dot */}
                  <circle r="5.5" fill="#FBBF24" stroke="#78350F" strokeWidth="1.5" />
                  {/* Time label text (e.g. "6:00 PM", "7:00 PM") matching reference photo */}
                  <text
                    x="11"
                    y="-8"
                    fill="#FDE68A"
                    fontSize="13"
                    fontFamily="sans-serif"
                    fontWeight="700"
                    stroke="#451A03"
                    strokeWidth="0.75"
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.85))"
                  >
                    {marker.timeLabel}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* --- MOON PATH TRAJECTORY ARC --- */}
        {moonPathSvg && (
          <g className="moon-path-layer">
            <path
              d={moonPathSvg}
              stroke="#38BDF8"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="drop-shadow(0 0 6px rgba(56, 189, 248, 0.7))"
            />

            {/* Hourly Markers along Moon Path */}
            {celestialData.hourlyMarkers.map((marker, idx) => {
              const pt = projectToScreen(marker.moon.azimuth, marker.moon.altitude);
              if (!pt || !pt.isVisible) return null;

              return (
                <g key={`moon-hour-${idx}`} transform={`translate(${pt.x}, ${pt.y})`}>
                  <circle r="5" fill="#38BDF8" stroke="#0C4A6E" strokeWidth="1.5" />
                  <text
                    x="11"
                    y="-8"
                    fill="#BAE6FD"
                    fontSize="12"
                    fontFamily="sans-serif"
                    fontWeight="700"
                    stroke="#082F49"
                    strokeWidth="0.75"
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.85))"
                  >
                    {marker.timeLabel}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* --- ACTIVE SUN DISC (Selected Date & Time) --- */}
        {currentSunScreen && currentSunScreen.isVisible && (
          <g transform={`translate(${currentSunScreen.x}, ${currentSunScreen.y})`}>
            {/* Outer Corona */}
            <circle r="48" fill="#F59E0B" opacity="0.3" filter="url(#sun-glow)" />
            <circle r="38" fill="#FBBF24" opacity="0.5" />
            {/* Bright Sun Core */}
            <circle r="28" fill="url(#sun-gradient)" stroke="#FFFBEB" strokeWidth="2.5" />
            {/* Center pinpoint */}
            <circle r="2.5" fill="#FFFFFF" />
            {/* Time label badge beside Sun */}
            <text
              x="38"
              y="6"
              fill="#FEF08A"
              fontSize="16"
              fontWeight="800"
              fontFamily="sans-serif"
              filter="drop-shadow(0 2px 6px rgba(0,0,0,0.9))"
            >
              {new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(currentDateTime)}
            </text>
          </g>
        )}

        {/* --- ACTIVE MOON DISC (Selected Date & Time) --- */}
        {currentMoonScreen && currentMoonScreen.isVisible && (
          <g transform={`translate(${currentMoonScreen.x}, ${currentMoonScreen.y})`}>
            <circle r="34" fill="#38BDF8" opacity="0.3" filter="url(#sun-glow)" />
            <circle r="24" fill="url(#moon-gradient)" stroke="#E2E8F0" strokeWidth="1.5" />
            {/* Terminator shadow depending on lunar phase */}
            <path
              d="M 0 -24 A 24 24 0 0 1 0 24 A 18 24 0 0 0 0 -24 Z"
              fill="#0F172A"
              opacity="0.7"
            />
            <text
              x="32"
              y="5"
              fill="#E0F2FE"
              fontSize="14"
              fontWeight="700"
              fontFamily="sans-serif"
              filter="drop-shadow(0 2px 6px rgba(0,0,0,0.9))"
            >
              {currentSunMoon.moon.phaseName}
            </text>
          </g>
        )}
      </svg>

      {/* 4. TOP APP BAR (Styled exactly like PhotoPills Reference Photo) */}
      <div className="relative z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/85 via-black/50 to-transparent pointer-events-auto">
        {/* Left: "Now" button */}
        <button
          type="button"
          onClick={handleResetToNow}
          className="text-cyan-400 hover:text-cyan-300 font-semibold text-base sm:text-lg transition-colors px-2 py-1 rounded-lg active:scale-95"
        >
          Now
        </button>

        {/* Center: "Augmented Reality" Title */}
        <h1 className="text-white font-bold text-base sm:text-lg tracking-tight">
          Augmented Reality
        </h1>

        {/* Right: "Done" button */}
        <button
          type="button"
          onClick={onClose}
          className="text-cyan-400 hover:text-cyan-300 font-semibold text-base sm:text-lg transition-colors px-2 py-1 rounded-lg active:scale-95"
        >
          Done
        </button>
      </div>

      {/* 5. QUICK-NAVIGATION RADAR BAR (Target Sun, Target Moon, N, E, S, W) */}
      <div className="relative z-20 px-4 py-1 pointer-events-auto flex items-center justify-between gap-2 overflow-x-auto text-xs font-mono">
        <div className="text-white font-mono text-sm sm:text-base font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] flex-shrink-0">
          {formattedHeaderDateTime}
        </div>

        {/* Quick Navigation Pills for Easy Movement */}
        <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/15">
          <button
            type="button"
            onClick={() => handleTargetCelestial('sun')}
            className="px-2 py-0.5 rounded-full bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-1 transition-all active:scale-95"
            title="Point camera directly to Sun"
          >
            <Sun size={12} />
            <span>Find Sun</span>
          </button>

          <button
            type="button"
            onClick={() => handleTargetCelestial('moon')}
            className="px-2 py-0.5 rounded-full bg-sky-500/20 hover:bg-sky-500/40 text-sky-300 font-bold border border-sky-500/30 flex items-center gap-1 transition-all active:scale-95"
            title="Point camera directly to Moon"
          >
            <Moon size={12} />
            <span>Find Moon</span>
          </button>

          <div className="h-3 w-[1px] bg-white/20 mx-0.5" />

          {/* Quick Compass Cardinals */}
          <button
            type="button"
            onClick={() => handleJumpToBearing(0)}
            className="px-1.5 py-0.5 rounded hover:bg-white/10 text-slate-300 hover:text-white"
          >
            N
          </button>
          <button
            type="button"
            onClick={() => handleJumpToBearing(90)}
            className="px-1.5 py-0.5 rounded hover:bg-white/10 text-slate-300 hover:text-white"
          >
            E
          </button>
          <button
            type="button"
            onClick={() => handleJumpToBearing(180)}
            className="px-1.5 py-0.5 rounded hover:bg-white/10 text-slate-300 hover:text-white"
          >
            S
          </button>
          <button
            type="button"
            onClick={() => handleJumpToBearing(270)}
            className="px-1.5 py-0.5 rounded hover:bg-white/10 text-slate-300 hover:text-white font-bold text-brand-cyan"
          >
            W
          </button>
        </div>
      </div>

      {/* Insecure Context Banner if accessed via HTTP on phone */}
      {cameraError === 'INSECURE_CONTEXT' && (
        <div className="absolute top-20 inset-x-4 z-30 mx-auto max-w-md bg-slate-900/95 border border-brand-amber/60 rounded-2xl p-4 shadow-2xl backdrop-blur-xl text-center space-y-2.5 pointer-events-auto">
          <div className="w-10 h-10 mx-auto rounded-full bg-brand-amber/15 text-brand-amber flex items-center justify-center">
            <ShieldAlert size={22} />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">Switch to HTTPS for Camera</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Mobile browsers require HTTPS to unlock live camera video.
            </p>
          </div>
          <div className="flex gap-2 justify-center pt-1">
            <button
              type="button"
              onClick={handleSwitchToHttps}
              className="px-3.5 py-2 rounded-xl bg-brand-cyan hover:bg-brand-cyanHover text-slate-950 font-bold text-xs flex items-center gap-1.5"
            >
              <ExternalLink size={13} />
              <span>Switch to HTTPS</span>
            </button>
            <button
              type="button"
              onClick={() => setCameraError(null)}
              className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs"
            >
              Use Simulator
            </button>
          </div>
        </div>
      )}

      {/* Center Spacer: Full swipeable region with touch hint */}
      <div className="flex-1 relative flex items-center justify-center">
        {/* Subtle touch-to-drag guidance indicator on first load */}
        <div className="absolute bottom-4 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-mono text-white/70 border border-white/10 pointer-events-none">
          Swipe anywhere on screen to freely pan & tilt 360°
        </div>
      </div>

      {/* Visual Calibration Drawer (when open) */}
      {isCalibrating && (
        <div className="relative z-30 mx-4 mb-3 bg-black/85 backdrop-blur-xl border border-white/20 rounded-2xl p-4 text-xs font-mono pointer-events-auto max-w-lg self-center w-full">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
            <span className="text-white font-bold flex items-center gap-1.5">
              <Compass size={14} className="text-brand-cyan" />
              <span>Visual Compass Calibration</span>
            </span>
            <button
              type="button"
              onClick={() => setIsCalibrating(false)}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <Check size={16} />
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mb-3">
            Align the compass with landmarks or your phone’s orientation if local magnetic interference occurs.
          </p>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Azimuth Offset:</span>
                <span className="text-brand-cyan font-bold">{calibrationOffset > 0 ? `+${calibrationOffset}` : calibrationOffset}°</span>
              </div>
              <input
                type="range"
                min="-45"
                max="45"
                step="1"
                value={calibrationOffset}
                onChange={(e) => setCalibrationOffset(Number(e.target.value))}
                className="w-full accent-brand-cyan cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Pitch / Elevation Offset:</span>
                <span className="text-brand-amber font-bold">{elevationOffset > 0 ? `+${elevationOffset}` : elevationOffset}°</span>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                step="1"
                value={elevationOffset}
                onChange={(e) => setElevationOffset(Number(e.target.value))}
                className="w-full accent-brand-amber cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* 6. INTERACTIVE TIME & DATE SCRUBBER BAR */}
      {showTimeControls && (
        <div className="relative z-20 bg-gradient-to-t from-black/95 via-black/85 to-black/30 backdrop-blur-md pt-3 pb-4 px-4 sm:px-6 border-t border-white/10 pointer-events-auto space-y-3">
          {/* Top Controls Row: Date Picker, Step Buttons & Play */}
          <div className="flex items-center justify-between gap-2 text-xs font-mono">
            {/* Date Switcher */}
            <div className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-1.5 rounded-xl border border-white/10">
              <Calendar size={13} className="text-brand-cyan" />
              <input
                type="date"
                value={selectedDate.toISOString().split('T')[0]}
                onChange={(e) => {
                  if (e.target.value) {
                    const [y, m, d] = e.target.value.split('-').map(Number);
                    setSelectedDate(new Date(y, m - 1, d));
                  }
                }}
                className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer"
              />
            </div>

            {/* Step Time Buttons & Play/Pause */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              <button
                type="button"
                onClick={() => setMinuteOfDay(prev => (prev - 60 + 1440) % 1440)}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] active:scale-95"
                title="-1 Hour"
              >
                -1h
              </button>
              <button
                type="button"
                onClick={() => setMinuteOfDay(prev => (prev - 10 + 1440) % 1440)}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] active:scale-95"
                title="-10 Minutes"
              >
                -10m
              </button>

              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-2 rounded-xl transition-all shadow-lg active:scale-95 ${
                  isPlaying
                    ? 'bg-amber-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                    : 'bg-brand-cyan text-slate-950 font-bold shadow-[0_0_12px_rgba(18,214,199,0.4)]'
                }`}
                title={isPlaying ? 'Pause Motion' : 'Play Celestial Motion'}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} />}
              </button>

              <button
                type="button"
                onClick={() => setMinuteOfDay(prev => (prev + 10) % 1440)}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] active:scale-95"
                title="+10 Minutes"
              >
                +10m
              </button>
              <button
                type="button"
                onClick={() => setMinuteOfDay(prev => (prev + 60) % 1440)}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-[11px] active:scale-95"
                title="+1 Hour"
              >
                +1h
              </button>
            </div>

            {/* Background Mode Toggle (Live Camera vs Reference Scene) */}
            <button
              type="button"
              onClick={() => setBgSceneMode(prev => prev === 'camera' ? 'landscape' : 'camera')}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-300 text-[11px]"
              title="Toggle Live Camera or Simulated Reference Scene"
            >
              {isShowingLiveCamera ? <Camera size={13} className="text-emerald-400" /> : <ImageIcon size={13} className="text-sky-400" />}
              <span>{isShowingLiveCamera ? 'Camera Feed' : 'Photo Scene'}</span>
            </button>
          </div>

          {/* Time Scrubber Slider (0 to 1440 minutes) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>12:00 AM</span>
              <span className="text-white font-bold bg-slate-800/90 px-2 py-0.5 rounded border border-white/10">
                {new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(currentDateTime)}
              </span>
              <span>11:59 PM</span>
            </div>
            <input
              type="range"
              min="0"
              max="1439"
              value={minuteOfDay}
              onChange={(e) => {
                setMinuteOfDay(Number(e.target.value));
                if (isPlaying) setIsPlaying(false);
              }}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          {/* Bottom Action Bar: Visual Calibration, Grid Toggle, Telemetry */}
          <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] font-mono">
            {/* Visual Calibration Trigger (PhotoPills style) */}
            <button
              type="button"
              onClick={() => setIsCalibrating(!isCalibrating)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
                isCalibrating
                  ? 'bg-brand-cyan/20 border-brand-cyan text-brand-cyan'
                  : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <Compass size={13} />
              <span>Visual calibration</span>
            </button>

            {/* Grid Toggle */}
            <button
              type="button"
              onClick={() => setShowGrid(!showGrid)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border transition-all ${
                showGrid
                  ? 'bg-slate-800 border-white/20 text-white'
                  : 'bg-slate-900/60 border-white/10 text-slate-500'
              }`}
            >
              <Grid size={13} />
              <span>Grid ({showGrid ? 'On' : 'Off'})</span>
            </button>

            {/* Telemetry Indicator */}
            <div className="text-slate-400 hidden xs:block">
              <span>AZ: </span>
              <span className="text-brand-cyan font-bold">{Math.round(currentHeading)}°</span>
              <span className="mx-1.5 text-slate-600">|</span>
              <span>ALT: </span>
              <span className="text-brand-amber font-bold">{Math.round(currentPitch)}°</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
