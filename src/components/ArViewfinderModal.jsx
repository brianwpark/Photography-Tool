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
  Share2,
  Download,
  Layers,
  Image as ImageIcon
} from 'lucide-react';
import SunCalc from 'suncalc';
import { radToDeg, degToRad, getDailyCelestialPath, getMoonPhaseName } from '../services/ephemeris.js';

// Azimuth points for meridians
const AZIMUTH_POINTS = [
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
  { label: '255°', deg: 255 },
  { label: 'W', deg: 270, isCardinal: true },
  { label: '285°', deg: 285 },
  { label: '300°', deg: 300 },
  { label: 'NW', deg: 315 },
  { label: '330°', deg: 330 },
  { label: '345°', deg: 345 }
];

// Elevation parallel steps: -20° to +80° in 10-degree increments
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

  // Screen Dimensions
  const [dimensions, setDimensions] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 390,
    height: typeof window !== 'undefined' ? window.innerHeight : 844
  });

  // Orientation & Compass Calibration
  // beta: 90 is upright portrait facing the horizon
  // alpha: 270 is facing West as in the reference photo
  const [deviceOrientation, setDeviceOrientation] = useState({ alpha: 268, beta: 98, gamma: 0 });
  const [calibrationOffset, setCalibrationOffset] = useState(0); // Manual visual compass azimuth offset (-45° to +45°)
  const [elevationOffset, setElevationOffset] = useState(0); // Manual pitch offset (-30° to +30°)
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);

  // Touch / Drag Pan & Tilt state (fluid 60fps tracking)
  const isDraggingRef = useRef(false);
  const lastTouchPosRef = useRef({ x: 0, y: 0 });

  // Date & Time Controls
  // Match reference photo default time: 6:51 PM (1131 minutes)
  const [selectedDate, setSelectedDate] = useState(() => new Date(initialDate));
  const [minuteOfDay, setMinuteOfDay] = useState(() => {
    const d = new Date(initialDate);
    const mins = d.getHours() * 60 + d.getMinutes();
    return (mins < 360 || mins > 1260) ? 1131 : mins; // 6:51 PM default for dusk golden hour
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimerRef = useRef(null);

  // Display toggles
  const [displayMode, setDisplayMode] = useState('sun'); // 'sun', 'moon', 'both'
  const [showGrid, setShowGrid] = useState(true);
  const [showTimeSlider, setShowTimeSlider] = useState(true);

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

    // iOS and Android orientation handler with low-pass smoothing
    let lastHeading = null;
    const handleOrientation = (e) => {
      let compassHeading = e.webkitCompassHeading;
      if (compassHeading === undefined || compassHeading === null) {
        if (e.alpha !== null && e.alpha !== undefined) {
          compassHeading = (360 - e.alpha) % 360;
        }
      }

      if (isDraggingRef.current) return;

      if (compassHeading !== undefined && compassHeading !== null) {
        // Low pass filter
        if (lastHeading === null) {
          lastHeading = compassHeading;
        } else {
          let diff = (compassHeading - lastHeading + 540) % 360 - 180;
          lastHeading = (lastHeading + diff * 0.25 + 360) % 360;
        }

        setDeviceOrientation(prev => ({
          alpha: lastHeading,
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

    setDeviceOrientation(prev => ({
      ...prev,
      alpha: (prev.alpha - dx * 0.38 + 360) % 360,
      beta: Math.max(10, Math.min(170, prev.beta + dy * 0.32))
    }));
  };

  const handleTouchOrMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Switch to HTTPS if insecure context detected on phone
  const handleSwitchToHttps = () => {
    if (typeof window !== 'undefined') {
      window.location.href = `https://${window.location.hostname}:3000${window.location.pathname}${window.location.search}`;
    }
  };

  // Effective Heading & Elevation
  // Portrait upright phone: beta is 90° when pointing directly at the horizon
  const currentHeading = (deviceOrientation.alpha + calibrationOffset + 360) % 360;
  const currentPitch = (deviceOrientation.beta - 90) + elevationOffset;
  const currentRoll = deviceOrientation.gamma || 0;

  // AR Camera Projection Math (Wide Angle ~62° HFOV)
  const hFoVDeg = 62;
  const vFoVDeg = useMemo(() => {
    return 2 * Math.atan(Math.tan(degToRad(hFoVDeg / 2)) * (dimensions.height / dimensions.width)) * (180 / Math.PI);
  }, [dimensions.width, dimensions.height]);

  const focalX = (dimensions.width / 2) / Math.tan(degToRad(hFoVDeg / 2));
  const focalY = (dimensions.height / 2) / Math.tan(degToRad(vFoVDeg / 2));

  // Mathematically Exact 3D Perspective Spherical Projection
  // Naturally produces curved elevation lines and meridian lines as in PhotoPills
  const projectToScreen = useCallback((azimuthDeg, altitudeDeg) => {
    const azRad = degToRad(azimuthDeg);
    const altRad = degToRad(altitudeDeg);

    // 1. Vector on unit celestial sphere (Z = North, X = East, Y = Zenith)
    const cx = Math.cos(altRad) * Math.sin(azRad);
    const cy = Math.sin(altRad);
    const cz = Math.cos(altRad) * Math.cos(azRad);

    // 2. Yaw rotation (-currentHeading around Y-axis)
    const yawRad = degToRad(currentHeading);
    const cosY = Math.cos(yawRad);
    const sinY = Math.sin(yawRad);
    const x1 = cx * cosY - cz * sinY;
    const y1 = cy;
    const z1 = cx * sinY + cz * cosY;

    // 3. Pitch rotation (-currentPitch around horizontal X-axis)
    const pitchRad = degToRad(currentPitch);
    const cosP = Math.cos(pitchRad);
    const sinP = Math.sin(pitchRad);
    const x2 = x1;
    const y2 = y1 * cosP - z1 * sinP;
    const z2 = y1 * sinP + z1 * cosP;

    // Reject points behind the camera lens
    if (z2 <= 0.05) {
      return null;
    }

    // 4. Roll rotation around optical Z-axis
    const rollRad = degToRad(currentRoll);
    const cosR = Math.cos(rollRad);
    const sinR = Math.sin(rollRad);
    const x3 = x2 * cosR - y2 * sinR;
    const y3 = x2 * sinR + y2 * cosR;

    // 5. Rectilinear screen coordinates
    const screenX = dimensions.width / 2 + focalX * (x3 / z2);
    const screenY = dimensions.height / 2 - focalY * (y3 / z2);

    return {
      x: screenX,
      y: screenY,
      z: z2,
      isVisible: screenX >= -120 && screenX <= dimensions.width + 120 && screenY >= -120 && screenY <= dimensions.height + 120
    };
  }, [currentHeading, currentPitch, currentRoll, focalX, focalY, dimensions.width, dimensions.height]);

  // Generate smooth SVG Path for an Elevation parallel (-20° to +80°)
  const getElevationPath = useCallback((elevDeg) => {
    const points = [];
    // Sample across the camera's front hemisphere in fine 2-degree steps
    for (let offset = -55; offset <= 55; offset += 2) {
      const az = (currentHeading + offset + 360) % 360;
      const pt = projectToScreen(az, elevDeg);
      if (pt && pt.isVisible) {
        points.push(`${pt.x.toFixed(1)},${pt.y.toFixed(1)}`);
      }
    }
    if (points.length < 2) return null;
    return `M ${points.join(' L ')}`;
  }, [currentHeading, projectToScreen]);

  // Generate smooth SVG Path for an Azimuthal meridian line
  const getAzimuthPath = useCallback((azDeg) => {
    const points = [];
    // Sample from below horizon up to zenith
    for (let alt = -25; alt <= 85; alt += 2.5) {
      const pt = projectToScreen(azDeg, alt);
      if (pt && pt.isVisible) {
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

  // Current active Sun and Moon screen projections
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

  const isShowingLiveCamera = hasCamera && stream && bgSceneMode !== 'landscape';

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-black overflow-hidden select-none touch-none font-sans"
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
      {/* 1. Camera Video Feed (Permanently mounted in DOM) */}
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

      {/* 2. Simulated Photorealistic Backdrop (Madrid Temple of Debod at Sunset) */}
      {!isShowingLiveCamera && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden select-none">
          {/* Sky Gradient matching reference photo */}
          <div
            className="absolute inset-0 transition-all duration-700"
            style={{
              background: currentSunMoon.sun.altitude > 0
                ? 'linear-gradient(to bottom, #1d4ed8 0%, #38bdf8 38%, #93c5fd 65%, #dbeafe 90%, #fef3c7 100%)'
                : currentSunMoon.sun.altitude > -6
                ? 'linear-gradient(to bottom, #1e1b4b 0%, #312e81 30%, #b45309 60%, #ea580c 80%, #f97316 100%)'
                : 'linear-gradient(to bottom, #030712 0%, #0f172a 40%, #1e293b 80%, #334155 100%)'
            }}
          />

          {/* Wispy Cloud Layers */}
          <div className="absolute inset-x-0 top-0 h-2/3 opacity-55 pointer-events-none">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 600">
              <path
                d="M 0,140 Q 200,90 400,160 T 800,120 L 800,0 L 0,0 Z"
                fill="url(#cloud-grad)"
                opacity="0.45"
              />
              <path
                d="M 0,220 Q 300,150 600,230 T 800,190 L 800,0 L 0,0 Z"
                fill="url(#cloud-grad)"
                opacity="0.3"
              />
              <defs>
                <linearGradient id="cloud-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* Realistic Architectural Monument (Temple of Debod) & Reflecting Pool */}
          <div className="absolute inset-x-0 bottom-0 h-[48%] flex flex-col justify-end pointer-events-none">
            {/* Monument & Trees Layer */}
            <div className="relative w-full h-36 flex items-end justify-center">
              {/* Distant trees on left and right */}
              <div className="absolute bottom-6 left-0 w-2/5 h-20 bg-[#16212e] rounded-tr-3xl opacity-90 blur-[1px]" />
              <div className="absolute bottom-6 right-0 w-2/5 h-20 bg-[#16212e] rounded-tl-3xl opacity-90 blur-[1px]" />

              {/* Distant Sanctuary Building */}
              <div className="absolute bottom-6 w-32 h-16 bg-[#263547] rounded-t shadow-lg" />

              {/* Middle Gateway Arch */}
              <div className="relative z-10 w-24 h-24 bg-[#1f2937] mx-2 rounded-t shadow-2xl flex items-center justify-center">
                <div className="w-10 h-16 bg-[#111827] mt-8 rounded-t" />
              </div>

              {/* Foreground Pylon Gateway */}
              <div className="relative z-20 w-28 h-28 bg-[#18202d] mx-2 rounded-t shadow-2xl flex items-center justify-center border-t border-slate-600/40">
                <div className="w-12 h-20 bg-[#0d131d] mt-8 rounded-t shadow-inner" />
              </div>
            </div>

            {/* Calm Reflecting Pool with Water Mirroring */}
            <div className="w-full h-32 bg-gradient-to-b from-[#1b2636] via-[#111826] to-[#080d14] relative border-t border-white/20">
              {/* Inverted Reflection of Gate */}
              <div className="absolute top-0 inset-x-0 h-28 flex items-start justify-center opacity-45 transform scale-y-[-1] blur-[1px]">
                <div className="w-28 h-24 bg-[#18202d] mx-2 rounded-t flex items-center justify-center">
                  <div className="w-12 h-16 bg-[#0a0e16] mt-8" />
                </div>
              </div>
              {/* Water surface ripples */}
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_8px] opacity-10" />
            </div>
          </div>
        </div>
      )}

      {/* 3. Fullscreen Optical SVG Overlay for Celestial Paths, Horizon & Elevation Grid */}
      <svg
        className="absolute inset-0 w-full h-full z-10 pointer-events-none"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
      >
        <defs>
          {/* Sun Halo & Glow */}
          <filter id="sun-corona" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <radialGradient id="sun-disc-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="25%" stopColor="#FEF08A" />
            <stop offset="60%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </radialGradient>

          {/* Frosted Bubble Glass Filter */}
          <radialGradient id="bubble-fill" cx="40%" cy="35%" r="70%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="80%" stopColor="#E2E8F0" stopOpacity="0.30" />
            <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.25" />
          </radialGradient>

          {/* Sun Trajectory Gradient */}
          <linearGradient id="sun-path-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FCD34D" />
            <stop offset="70%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
        </defs>

        {/* --- GRID SYSTEM: ELEVATION & AZIMUTH --- */}
        {showGrid && (
          <g className="grid-layer">
            {/* Azimuthal (Vertical) Meridian Lines */}
            {AZIMUTH_POINTS.map((ap, idx) => {
              const path = getAzimuthPath(ap.deg);
              if (!path) return null;
              const isMajor = ap.deg % 45 === 0;
              return (
                <path
                  key={`az-line-${idx}`}
                  d={path}
                  stroke={isMajor ? 'rgba(255, 255, 255, 0.45)' : 'rgba(255, 255, 255, 0.22)'}
                  strokeWidth={isMajor ? '1.5' : '0.9'}
                  strokeDasharray={isMajor ? undefined : '4 4'}
                  fill="none"
                />
              );
            })}

            {/* Elevation (Horizontal) Arcs (10° increments) */}
            {ELEVATION_STEPS.map((elev) => {
              const path = getElevationPath(elev);
              if (!path) return null;
              const isHorizon = elev === 0;

              return (
                <g key={`elev-arc-${elev}`}>
                  <path
                    d={path}
                    stroke={isHorizon ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.35)'}
                    strokeWidth={isHorizon ? '2.2' : '1.1'}
                    fill="none"
                  />

                  {/* 10.0° Elevation Frosted Circular Bubble (as in Reference Photo) */}
                  {!isHorizon && elev === 10 && (() => {
                    const labelPt = projectToScreen((currentHeading + 6) % 360, 10);
                    if (!labelPt || !labelPt.isVisible) return null;
                    return (
                      <g transform={`translate(${labelPt.x}, ${labelPt.y})`}>
                        <circle
                          r="18"
                          fill="url(#bubble-fill)"
                          stroke="rgba(255, 255, 255, 0.65)"
                          strokeWidth="1.2"
                        />
                        <text
                          y="4"
                          textAnchor="middle"
                          fill="#FFFFFF"
                          fontSize="11"
                          fontFamily="sans-serif"
                          fontWeight="700"
                        >
                          10.0°
                        </text>
                      </g>
                    );
                  })()}
                </g>
              );
            })}

            {/* Horizon Compass Frosted Bubbles: "W" and "267.5°" */}
            {(() => {
              // Cardinal West ("W") Bubble
              const wPt = projectToScreen(270, 0);
              // Precise Azimuth Bubble ("267.5°")
              const azPt = projectToScreen(267.5, 0);

              return (
                <g className="compass-bubbles">
                  {/* West "W" Frosted Bubble */}
                  {wPt && wPt.isVisible && (
                    <g transform={`translate(${wPt.x}, ${wPt.y})`}>
                      <circle
                        r="28"
                        fill="rgba(255, 255, 255, 0.40)"
                        stroke="rgba(255, 255, 255, 0.85)"
                        strokeWidth="1.5"
                      />
                      <text
                        y="8"
                        textAnchor="middle"
                        fill="#1E293B"
                        fontSize="24"
                        fontWeight="900"
                        fontFamily="sans-serif"
                      >
                        W
                      </text>
                    </g>
                  )}

                  {/* Azimuth Numeric "267.5°" Frosted Bubble */}
                  {azPt && azPt.isVisible && (
                    <g transform={`translate(${azPt.x - 65}, ${azPt.y})`}>
                      <circle
                        r="18"
                        fill="rgba(255, 255, 255, 0.35)"
                        stroke="rgba(255, 255, 255, 0.7)"
                        strokeWidth="1.2"
                      />
                      <text
                        y="4"
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="10"
                        fontWeight="700"
                        fontFamily="sans-serif"
                      >
                        267.5°
                      </text>
                    </g>
                  )}
                </g>
              );
            })()}
          </g>
        )}

        {/* --- SUN PATH TRAJECTORY --- */}
        {sunPathSvg && (
          <g className="sun-path-layer">
            <path
              d={sunPathSvg}
              stroke="url(#sun-path-grad)"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="drop-shadow(0 0 6px rgba(245, 158, 11, 0.75))"
            />

            {/* Hourly Nodes & Bold Yellow Labels ("6:00 PM", "7:00 PM", "8:00 PM") */}
            {celestialData.hourlyMarkers.map((marker, idx) => {
              const pt = projectToScreen(marker.sun.azimuth, marker.sun.altitude);
              if (!pt || !pt.isVisible) return null;

              return (
                <g key={`sun-marker-${idx}`} transform={`translate(${pt.x}, ${pt.y})`}>
                  {/* Circular node */}
                  <circle
                    r="5"
                    fill="#FDE047"
                    stroke="#854D0E"
                    strokeWidth="1.5"
                  />
                  {/* Bold Gold Time Label */}
                  <text
                    x="12"
                    y="-6"
                    fill="#FEF08A"
                    fontSize="15"
                    fontFamily="sans-serif"
                    fontWeight="800"
                    stroke="#713F12"
                    strokeWidth="0.8"
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.9))"
                  >
                    {marker.timeLabel}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* --- MOON PATH TRAJECTORY --- */}
        {moonPathSvg && (
          <g className="moon-path-layer">
            <path
              d={moonPathSvg}
              stroke="#38BDF8"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="drop-shadow(0 0 6px rgba(56, 189, 248, 0.7))"
            />

            {/* Hourly Nodes along Moon Path */}
            {celestialData.hourlyMarkers.map((marker, idx) => {
              const pt = projectToScreen(marker.moon.azimuth, marker.moon.altitude);
              if (!pt || !pt.isVisible) return null;

              return (
                <g key={`moon-marker-${idx}`} transform={`translate(${pt.x}, ${pt.y})`}>
                  <circle r="4.5" fill="#38BDF8" stroke="#0369A1" strokeWidth="1.5" />
                  <text
                    x="11"
                    y="-6"
                    fill="#BAE6FD"
                    fontSize="13"
                    fontFamily="sans-serif"
                    fontWeight="800"
                    stroke="#0C4A6E"
                    strokeWidth="0.8"
                    filter="drop-shadow(0 2px 4px rgba(0,0,0,0.9))"
                  >
                    {marker.timeLabel}
                  </text>
                </g>
              );
            })}
          </g>
        )}

        {/* --- ACTIVE SUN DISC (Glowing at Current Time Position) --- */}
        {currentSunScreen && currentSunScreen.isVisible && (
          <g transform={`translate(${currentSunScreen.x}, ${currentSunScreen.y})`}>
            {/* Outer Corona Flare */}
            <circle r="52" fill="#F59E0B" opacity="0.25" filter="url(#sun-corona)" />
            <circle r="36" fill="#FBBF24" opacity="0.45" />
            {/* Bright Solar Core */}
            <circle r="26" fill="url(#sun-disc-grad)" stroke="#FFFFFF" strokeWidth="2" />
            {/* Center optical point */}
            <circle r="2" fill="#FFFFFF" />
          </g>
        )}

        {/* --- ACTIVE MOON DISC --- */}
        {currentMoonScreen && currentMoonScreen.isVisible && (
          <g transform={`translate(${currentMoonScreen.x}, ${currentMoonScreen.y})`}>
            <circle r="36" fill="#38BDF8" opacity="0.25" filter="url(#sun-corona)" />
            <circle r="22" fill="#E2E8F0" stroke="#FFFFFF" strokeWidth="1.5" />
            <path
              d="M 0 -22 A 22 22 0 0 1 0 22 A 16 22 0 0 0 0 -22 Z"
              fill="#0F172A"
              opacity="0.75"
            />
          </g>
        )}
      </svg>

      {/* 4. TOP APP BAR (Pixel-Perfect Match to PhotoPills AR Header) */}
      <div className="relative z-30 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/90 via-black/60 to-transparent pointer-events-auto">
        {/* Left: "Now" button in cyan */}
        <button
          type="button"
          onClick={handleResetToNow}
          className="text-[#38BDF8] hover:text-[#0284C7] font-semibold text-lg transition-colors px-2 py-0.5 active:scale-95"
        >
          Now
        </button>

        {/* Center: "Augmented Reality" */}
        <h1 className="text-white font-bold text-lg tracking-tight">
          Augmented Reality
        </h1>

        {/* Right: "Done" button in cyan */}
        <button
          type="button"
          onClick={onClose}
          className="text-[#38BDF8] hover:text-[#0284C7] font-semibold text-lg transition-colors px-2 py-0.5 active:scale-95"
        >
          Done
        </button>
      </div>

      {/* Top-Left Timestamp ("4/17/18, 6:51 PM") */}
      <div className="relative z-20 px-4 pt-0.5 pointer-events-none">
        <div className="text-white/95 font-sans text-base font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
          {formattedHeaderDateTime}
        </div>
      </div>

      {/* Insecure Context Warning if accessed via HTTP on mobile */}
      {cameraError === 'INSECURE_CONTEXT' && (
        <div className="absolute top-20 inset-x-4 z-30 mx-auto max-w-sm bg-slate-900/95 border border-amber-500/60 rounded-2xl p-4 shadow-2xl backdrop-blur-xl text-center space-y-2.5 pointer-events-auto">
          <div className="w-10 h-10 mx-auto rounded-full bg-amber-500/15 text-amber-400 flex items-center justify-center">
            <ShieldAlert size={22} />
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">Switch to HTTPS for Camera</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Mobile browsers require HTTPS to unlock camera video.
            </p>
          </div>
          <div className="flex gap-2 justify-center pt-1">
            <button
              type="button"
              onClick={handleSwitchToHttps}
              className="px-3.5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-1.5"
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

      {/* Center Spacer: Full Touch Drag Panning Area */}
      <div className="flex-1 relative flex items-center justify-center pointer-events-none">
        {/* Subtle quick compass radar overlay at top right */}
        <div className="absolute top-2 right-4 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 pointer-events-auto">
          <button
            type="button"
            onClick={() => handleTargetCelestial('sun')}
            className="px-2 py-0.5 rounded-full bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1 transition-all active:scale-95"
            title="Point to Sun"
          >
            <Sun size={12} />
            <span>Sun</span>
          </button>
          <button
            type="button"
            onClick={() => handleTargetCelestial('moon')}
            className="px-2 py-0.5 rounded-full bg-sky-500/20 hover:bg-sky-500/40 text-sky-300 font-bold text-xs flex items-center gap-1 transition-all active:scale-95"
            title="Point to Moon"
          >
            <Moon size={12} />
            <span>Moon</span>
          </button>
        </div>
      </div>

      {/* Visual Calibration Panel (when active) */}
      {isCalibrating && (
        <div className="relative z-30 mx-4 mb-3 bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl p-4 text-xs font-mono pointer-events-auto max-w-md self-center w-full shadow-2xl">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
            <span className="text-white font-bold flex items-center gap-1.5 text-sm">
              <Compass size={16} className="text-cyan-400" />
              <span>Visual Compass Calibration</span>
            </span>
            <button
              type="button"
              onClick={() => setIsCalibrating(false)}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <Check size={18} />
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Azimuth Offset:</span>
                <span className="text-cyan-400 font-bold">{calibrationOffset > 0 ? `+${calibrationOffset}` : calibrationOffset}°</span>
              </div>
              <input
                type="range"
                min="-45"
                max="45"
                step="1"
                value={calibrationOffset}
                onChange={(e) => setCalibrationOffset(Number(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-slate-300 mb-1">
                <span>Pitch / Elevation Offset:</span>
                <span className="text-amber-400 font-bold">{elevationOffset > 0 ? `+${elevationOffset}` : elevationOffset}°</span>
              </div>
              <input
                type="range"
                min="-30"
                max="30"
                step="1"
                value={elevationOffset}
                onChange={(e) => setElevationOffset(Number(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Sheet Menu (when active) */}
      {showActionSheet && (
        <div className="relative z-30 mx-4 mb-3 bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl p-4 text-xs font-mono pointer-events-auto max-w-md self-center w-full shadow-2xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <span className="text-white font-bold text-sm">AR Tools & Settings</span>
            <button
              type="button"
              onClick={() => setShowActionSheet(false)}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setShowGrid(!showGrid)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-left border border-white/10 text-white font-semibold flex items-center gap-2"
            >
              <Grid size={15} className="text-cyan-400" />
              <span>Grid: {showGrid ? 'ON' : 'OFF'}</span>
            </button>

            <button
              type="button"
              onClick={() => setBgSceneMode(prev => prev === 'camera' ? 'landscape' : 'camera')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-left border border-white/10 text-white font-semibold flex items-center gap-2"
            >
              <ImageIcon size={15} className="text-amber-400" />
              <span>{isShowingLiveCamera ? 'Show Photo' : 'Show Camera'}</span>
            </button>

            <button
              type="button"
              onClick={() => setDisplayMode(prev => prev === 'sun' ? 'moon' : prev === 'moon' ? 'both' : 'sun')}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-left border border-white/10 text-white font-semibold flex items-center gap-2"
            >
              <Layers size={15} className="text-emerald-400" />
              <span>Target: {displayMode.toUpperCase()}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowTimeSlider(!showTimeSlider)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-left border border-white/10 text-white font-semibold flex items-center gap-2"
            >
              <Clock size={15} className="text-sky-400" />
              <span>Time Scrub: {showTimeSlider ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 5. INTERACTIVE TIME SCRUBBER DRAWER */}
      {showTimeSlider && (
        <div className="relative z-20 bg-black/75 backdrop-blur-md px-4 py-2 border-t border-white/10 pointer-events-auto space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            {/* Date Picker */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 px-2 py-1 rounded-lg border border-white/10">
              <Calendar size={13} className="text-cyan-400" />
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

            {/* Time Adjust Steppers & Play Animation */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMinuteOfDay(prev => (prev - 10 + 1440) % 1440)}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono active:scale-95"
              >
                -10m
              </button>
              <button
                type="button"
                onClick={() => setIsPlaying(!isPlaying)}
                className={`p-1.5 rounded-lg active:scale-95 transition-all ${
                  isPlaying ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-cyan-400 text-slate-950 font-bold'
                }`}
              >
                {isPlaying ? <Pause size={13} /> : <Play size={13} />}
              </button>
              <button
                type="button"
                onClick={() => setMinuteOfDay(prev => (prev + 10) % 1440)}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-mono active:scale-95"
              >
                +10m
              </button>
            </div>
          </div>

          {/* Time Scrubber Slider */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono text-slate-400">12 AM</span>
            <input
              type="range"
              min="0"
              max="1439"
              value={minuteOfDay}
              onChange={(e) => {
                setMinuteOfDay(Number(e.target.value));
                if (isPlaying) setIsPlaying(false);
              }}
              className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
            <span className="text-[10px] font-mono text-slate-400">11:59 PM</span>
          </div>
        </div>
      )}

      {/* 6. BOTTOM TOOLBAR (Pixel-Perfect Match to PhotoPills AR Footer) */}
      <div
        className="relative z-30 px-6 py-4 pointer-events-auto flex items-center justify-between border-t border-black/40 shadow-2xl"
        style={{
          backgroundColor: '#111318',
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 0)`,
          backgroundSize: '16px 16px'
        }}
      >
        {/* Left: "Visual calibration" */}
        <button
          type="button"
          onClick={() => setIsCalibrating(!isCalibrating)}
          className={`flex flex-col items-center gap-1 transition-all active:scale-95 ${
            isCalibrating ? 'text-cyan-400' : 'text-slate-300 hover:text-white'
          }`}
        >
          {/* Compass reticle icon matching PhotoPills */}
          <div className="w-7 h-7 flex items-center justify-center">
            <Compass size={22} strokeWidth={1.5} />
          </div>
          <span className="text-[11px] font-sans font-medium tracking-tight">
            Visual calibration
          </span>
        </button>

        {/* Center telemetry readout */}
        <div className="text-[10px] font-mono text-slate-400/80 text-center select-none">
          <div>AZ: <span className="text-cyan-300 font-bold">{Math.round(currentHeading)}°</span></div>
          <div>ALT: <span className="text-amber-300 font-bold">{Math.round(currentPitch)}°</span></div>
        </div>

        {/* Right: "Action" */}
        <button
          type="button"
          onClick={() => setShowActionSheet(!showActionSheet)}
          className={`flex flex-col items-center gap-1 transition-all active:scale-95 ${
            showActionSheet ? 'text-cyan-400' : 'text-slate-300 hover:text-white'
          }`}
        >
          {/* Share/Export Action Icon matching PhotoPills */}
          <div className="w-7 h-7 flex items-center justify-center">
            <Share2 size={20} strokeWidth={1.6} />
          </div>
          <span className="text-[11px] font-sans font-medium tracking-tight">
            Action
          </span>
        </button>
      </div>
    </div>
  );
}
