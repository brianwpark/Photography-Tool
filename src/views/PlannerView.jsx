import React, { useState, useMemo, useRef } from 'react';
import {
  MapPin,
  Calendar,
  Clock,
  Compass,
  Sun,
  Moon,
  Sparkles,
  Layers,
  Sliders,
  ChevronRight,
  Info,
  Globe,
  Maximize2
} from 'lucide-react';
import {
  getSunAndMoonData,
  calculateSunMoonSizeTool,
  UPCOMING_ECLIPSES,
  formatTime,
  formatDate
} from '../services/ephemeris.js';

export default function PlannerView({ onSelectView, userLocation = { lat: 33.749, lng: -84.388 } }) {
  const [activeTab, setActiveTab] = useState('map-planner'); // 'map-planner', 'sun-moon-size', 'eclipses'
  
  // Scrubber date & time
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [selectedHour, setSelectedHour] = useState(19); // 7:00 PM evening default
  const [selectedMinute, setSelectedMinute] = useState(30);

  // Red Pin (Camera Observer) & Black Pin (Monument / Subject)
  const [observerElevationMeters, setObserverElevationMeters] = useState(300);
  const [subjectElevationMeters, setSubjectElevationMeters] = useState(380);
  const [subjectHeightMeters, setSubjectHeightMeters] = useState(40);
  const [subjectLatitude, setSubjectLatitude] = useState(() => {
    const latitude = userLocation.lat * (Math.PI / 180);
    const longitude = userLocation.lng * (Math.PI / 180);
    const bearing = 128 * (Math.PI / 180);
    const angularDistance = 2.4 / 6371;
    return Number(
      (Math.asin(
        Math.sin(latitude) * Math.cos(angularDistance)
        + Math.cos(latitude) * Math.sin(angularDistance) * Math.cos(bearing)
      ) * (180 / Math.PI)).toFixed(6)
    );
  });
  const [subjectLongitude, setSubjectLongitude] = useState(() => {
    const latitude = userLocation.lat * (Math.PI / 180);
    const longitude = userLocation.lng * (Math.PI / 180);
    const bearing = 128 * (Math.PI / 180);
    const angularDistance = 2.4 / 6371;
    const targetLatitude = Math.asin(
      Math.sin(latitude) * Math.cos(angularDistance)
      + Math.cos(latitude) * Math.sin(angularDistance) * Math.cos(bearing)
    );
    return Number(
      ((longitude + Math.atan2(
        Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(latitude),
        Math.cos(angularDistance) - Math.sin(latitude) * Math.sin(targetLatitude)
      )) * (180 / Math.PI)).toFixed(6)
    );
  });
  const [subjectName, setSubjectName] = useState('Lighthouse / Peak');
  const [viewRotation, setViewRotation] = useState({ tilt: 58, bearing: 0 });
  const [isOrbiting, setIsOrbiting] = useState(false);
  const orbitDragRef = useRef(null);

  // Sun/Moon Desired Size Tool state
  const [desiredSubjectDiameterMeters, setDesiredSubjectDiameterMeters] = useState(12);
  const [plannedFocalLengthMm, setPlannedFocalLengthMm] = useState(600);

  // Computed Date
  const activeDateTime = useMemo(() => {
    const d = new Date(selectedDateStr);
    d.setHours(selectedHour, selectedMinute, 0, 0);
    return d;
  }, [selectedDateStr, selectedHour, selectedMinute]);

  // Ephemeris at scrubbed time
  const ephem = useMemo(() => {
    return getSunAndMoonData(activeDateTime, userLocation.lat, userLocation.lng);
  }, [activeDateTime, userLocation.lat, userLocation.lng]);

  // Derive the subject's geodetic distance and initial bearing from its coordinates.
  const subjectGeometry = useMemo(() => {
    const observerLat = userLocation.lat * (Math.PI / 180);
    const observerLng = userLocation.lng * (Math.PI / 180);
    const targetLat = subjectLatitude * (Math.PI / 180);
    const targetLng = subjectLongitude * (Math.PI / 180);
    const deltaLat = targetLat - observerLat;
    const deltaLng = targetLng - observerLng;
    const haversine = Math.sin(deltaLat / 2) ** 2
      + Math.cos(observerLat) * Math.cos(targetLat) * Math.sin(deltaLng / 2) ** 2;
    const distanceKm = 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
    const bearing = Math.atan2(
      Math.sin(deltaLng) * Math.cos(targetLat),
      Math.cos(observerLat) * Math.sin(targetLat)
      - Math.sin(observerLat) * Math.cos(targetLat) * Math.cos(deltaLng)
    );

    return {
      distanceKm: Math.max(0.001, distanceKm),
      bearingDeg: (bearing * (180 / Math.PI) + 360) % 360
    };
  }, [userLocation.lat, userLocation.lng, subjectLatitude, subjectLongitude]);

  const distanceToSubjectKm = Number(subjectGeometry.distanceKm.toFixed(3));
  const azimuthToSubjectDeg = Number(subjectGeometry.bearingDeg.toFixed(1));

  // Elevation angles to the subject base and top: tan(theta) = delta_h / distance
  const subjectBaseElevationDeg = useMemo(() => {
    const deltaH = subjectElevationMeters - observerElevationMeters;
    const distMeters = distanceToSubjectKm * 1000;
    const rad = Math.atan2(deltaH, distMeters);
    return Number(((rad * 180) / Math.PI).toFixed(2));
  }, [subjectElevationMeters, observerElevationMeters, distanceToSubjectKm]);

  const lineOfSightElevationDeg = useMemo(() => {
    const subjectTopElevationMeters = subjectElevationMeters + subjectHeightMeters;
    const deltaH = subjectTopElevationMeters - observerElevationMeters;
    const distMeters = distanceToSubjectKm * 1000;
    const rad = Math.atan2(deltaH, distMeters);
    return Number(((rad * 180) / Math.PI).toFixed(2));
  }, [subjectElevationMeters, subjectHeightMeters, observerElevationMeters, distanceToSubjectKm]);

  const objectAngularHeightDeg = Number((lineOfSightElevationDeg - subjectBaseElevationDeg).toFixed(2));

  // Alignment is the shortest azimuth delta plus overlap with the object's vertical silhouette.
  const azimuthDelta = (bodyAzimuth) => Math.abs(((bodyAzimuth - azimuthToSubjectDeg + 540) % 360) - 180);
  const altitudeDeltaToObject = (bodyAltitude) => {
    if (bodyAltitude < subjectBaseElevationDeg) return subjectBaseElevationDeg - bodyAltitude;
    if (bodyAltitude > lineOfSightElevationDeg) return bodyAltitude - lineOfSightElevationDeg;
    return 0;
  };

  const moonAzDelta = azimuthDelta(ephem.moon.azimuthCompass).toFixed(1);
  const moonAltDelta = altitudeDeltaToObject(ephem.moon.altitudeDeg).toFixed(1);
  const isMoonAligned = Number(moonAzDelta) < 1.5 && Number(moonAltDelta) < 0.3;

  const sunAzDelta = azimuthDelta(ephem.sun.azimuthCompass).toFixed(1);
  const sunAltDelta = altitudeDeltaToObject(ephem.sun.altitudeDeg).toFixed(1);
  const isSunAligned = Number(sunAzDelta) < 1.5 && Number(sunAltDelta) < 0.3;

  // Sun/Moon Size Calculation
  const sizeCalc = useMemo(() => {
    return calculateSunMoonSizeTool({
      desiredDiameterMeters: desiredSubjectDiameterMeters,
      focalLengthMm: plannedFocalLengthMm,
      distanceToSubjectMeters: distanceToSubjectKm * 1000
    });
  }, [desiredSubjectDiameterMeters, plannedFocalLengthMm, distanceToSubjectKm]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-brand-cyan/15 text-brand-cyan">
              <Compass size={20} />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              PhotoPills Field Planner
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Plan photos involving Sun, Moon, Milky Way, Star Trails & desired Sun/Moon size behind subjects
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex bg-slate-900 p-1 rounded-xl border border-white/5 text-xs font-mono">
          <button
            onClick={() => setActiveTab('map-planner')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'map-planner'
                ? 'bg-brand-cyan text-slate-950 font-bold shadow-[0_0_12px_rgba(18,214,199,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Pin & Alignment Map
          </button>
          <button
            onClick={() => setActiveTab('sun-moon-size')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'sun-moon-size'
                ? 'bg-brand-cyan text-slate-950 font-bold shadow-[0_0_12px_rgba(18,214,199,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sun/Moon Size Tool
          </button>
          <button
            onClick={() => setActiveTab('eclipses')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'eclipses'
                ? 'bg-brand-cyan text-slate-950 font-bold shadow-[0_0_12px_rgba(18,214,199,0.3)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Eclipses
          </button>
        </div>
      </div>

      {/* ================= TAB 1: PIN & ALIGNMENT MAP ================= */}
      {activeTab === 'map-planner' && (
        <div className="space-y-5">
          {/* Alignment Alert Banner */}
          {(isMoonAligned || isSunAligned) && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-amber/20 to-brand-cyan/20 border border-brand-amber/40 flex items-center justify-between text-xs animate-pulse">
              <div className="flex items-center gap-3">
                <Sparkles size={20} className="text-brand-amber" />
                <div>
                  <span className="font-bold text-white block">
                    PERFECT CELESTIAL ALIGNMENT DETECTED!
                  </span>
                  <span className="text-slate-300">
                    {isMoonAligned
                      ? `The Moon is directly behind "${subjectName}" at ${formatTime(activeDateTime)}!`
                      : `The Sun is directly behind "${subjectName}" at ${formatTime(activeDateTime)}!`}
                  </span>
                </div>
              </div>
              <span className="font-mono font-bold text-brand-cyan px-2 py-1 rounded bg-black/50">
                LOCKED
              </span>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Map Simulator Visual Box (Left 7 Cols) */}
            <div className="lg:col-span-7 glass-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-brand-cyan" />
                  <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    Observer & Subject Geodetic Geometry
                  </span>
                </div>
                <span className="text-xs font-mono text-brand-cyan">
                  Distance: {distanceToSubjectKm} km ({Math.round(distanceToSubjectKm * 1000)}m)
                </span>
              </div>

              {/* Interactive 3D Sun/Moon alignment scene */}
              <div
                className={`relative w-full h-[420px] sm:h-[460px] bg-slate-950 rounded-xl border border-white/5 overflow-hidden flex items-center justify-center [perspective:900px] touch-none select-none ${isOrbiting ? 'cursor-grabbing' : 'cursor-grab'}`}
                onPointerDown={(event) => {
                  if (event.target.closest('[data-scene-control]')) return;
                  event.currentTarget.setPointerCapture(event.pointerId);
                  orbitDragRef.current = {
                    pointerId: event.pointerId,
                    x: event.clientX,
                    y: event.clientY,
                    tilt: viewRotation.tilt,
                    bearing: viewRotation.bearing
                  };
                  setIsOrbiting(true);
                }}
                onPointerMove={(event) => {
                  const drag = orbitDragRef.current;
                  if (!drag || drag.pointerId !== event.pointerId) return;
                  const nextTilt = Math.min(78, Math.max(24, drag.tilt - (event.clientY - drag.y) * 0.22));
                  const nextBearing = drag.bearing + (event.clientX - drag.x) * 0.35;
                  setViewRotation({ tilt: nextTilt, bearing: nextBearing });
                }}
                onPointerUp={(event) => {
                  if (orbitDragRef.current?.pointerId === event.pointerId) {
                    orbitDragRef.current = null;
                    setIsOrbiting(false);
                    event.currentTarget.releasePointerCapture(event.pointerId);
                  }
                }}
                onPointerCancel={() => {
                  orbitDragRef.current = null;
                  setIsOrbiting(false);
                }}
              >
                <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(ellipse_at_top,rgba(18,214,199,0.12),transparent_68%)]" />
                <div className="absolute left-1/2 top-[49%] h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-brand-cyan/30 to-transparent shadow-[0_0_16px_rgba(18,214,199,0.35)]" />

                <div data-scene-control className="absolute left-3 top-3 z-50 w-[calc(100%-6rem)] max-w-[290px] rounded-lg border border-white/10 bg-slate-950/90 p-2 backdrop-blur-md">
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">Height inputs</span>
                    <span className="text-[9px] font-mono text-brand-cyan">Target: object silhouette</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    <label className="text-[8px] font-mono uppercase text-slate-500">
                      Camera MSL
                      <input
                        type="number"
                        value={observerElevationMeters}
                        onChange={(event) => setObserverElevationMeters(Number(event.target.value))}
                        className="mt-1 w-full rounded border border-white/10 bg-slate-900 px-1.5 py-1 text-[10px] text-white outline-none focus:border-red-400"
                      />
                    </label>
                    <label className="text-[8px] font-mono uppercase text-slate-500">
                      Ground MSL
                      <input
                        type="number"
                        value={subjectElevationMeters}
                        onChange={(event) => setSubjectElevationMeters(Number(event.target.value))}
                        className="mt-1 w-full rounded border border-white/10 bg-slate-900 px-1.5 py-1 text-[10px] text-white outline-none focus:border-brand-cyan"
                      />
                    </label>
                    <label className="text-[8px] font-mono uppercase text-slate-500">
                      Object height
                      <input
                        type="number"
                        min="0"
                        max="1000"
                        value={subjectHeightMeters}
                        onChange={(event) => setSubjectHeightMeters(Math.max(0, Number(event.target.value)))}
                        className="mt-1 w-full rounded border border-white/10 bg-slate-900 px-1.5 py-1 text-[10px] text-white outline-none focus:border-brand-amber"
                      />
                    </label>
                  </div>
                  <div className="mt-1.5 text-[8px] font-mono text-slate-500">All heights in meters • top elevation {subjectElevationMeters + subjectHeightMeters}m</div>
                </div>

                <div data-scene-control className="absolute right-3 top-3 z-50 flex flex-col items-end gap-1.5">
                  <span className="rounded-md border border-white/10 bg-slate-950/85 px-2 py-1 text-[9px] font-mono text-slate-400 backdrop-blur-md">
                    Drag / touch to orbit
                  </span>
                  <button
                    type="button"
                    onClick={() => setViewRotation({ tilt: 58, bearing: 0 })}
                    className="rounded-md border border-white/10 bg-slate-900/90 px-2 py-1 text-[9px] font-mono text-slate-300 hover:border-brand-cyan/40 hover:text-white"
                  >
                    Reset view
                  </button>
                </div>

                <div
                  className="absolute left-1/2 top-[54%] w-[360px] h-[360px] max-w-[92vw] [transform-style:preserve-3d] transition-transform duration-75"
                  style={{ transform: `translate(-50%, -50%) rotateX(${viewRotation.tilt}deg) rotateZ(${viewRotation.bearing}deg)` }}
                >
                  {/* Elevated ground plane */}
                  <div className="absolute inset-0 rounded-full border border-slate-700/70 bg-slate-900/75 shadow-[0_28px_55px_rgba(0,0,0,0.75),inset_0_0_55px_rgba(18,214,199,0.05)] [transform:translateZ(-3px)]" />
                  <div className="absolute inset-0 rounded-full opacity-35 [background-image:linear-gradient(rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.16)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(circle,black_40%,transparent_76%)]" />

                  {/* Polar Azimuth Rings */}
                  <div className="absolute inset-5 border border-slate-600/80 rounded-full shadow-[0_0_18px_rgba(18,214,199,0.06)] [transform:translateZ(2px)]" />
                  <div className="absolute inset-[70px] border border-slate-700 rounded-full [transform:translateZ(3px)]" />
                  <div className="absolute inset-[118px] border border-slate-700 rounded-full [transform:translateZ(4px)]" />

                  {/* Crosshairs */}
                  <div className="absolute left-5 right-5 top-1/2 h-px bg-white/10 [transform:translateZ(5px)]" />
                  <div className="absolute bottom-5 top-5 left-1/2 w-px bg-white/10 [transform:translateZ(5px)]" />
                  <span className="absolute left-1/2 top-7 -translate-x-1/2 text-[10px] font-mono text-slate-300 font-bold [transform:translateZ(8px)]">N (000°)</span>
                  <span className="absolute right-7 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-300 font-bold [transform:translateZ(8px)]">E (090°)</span>
                  <span className="absolute bottom-7 left-1/2 -translate-x-1/2 text-[10px] font-mono text-slate-300 font-bold [transform:translateZ(8px)]">S (180°)</span>
                  <span className="absolute left-7 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-300 font-bold [transform:translateZ(8px)]">W (270°)</span>

                  {/* Red Pin: Observer Camera Center */}
                  <div
                    className="absolute left-1/2 top-1/2 z-20 flex flex-col items-center [transform-style:preserve-3d]"
                    style={{ transform: `translate(-50%, -50%) translateZ(34px) rotateZ(${-viewRotation.bearing}deg) rotateX(${-viewRotation.tilt}deg)` }}
                  >
                    <div className="absolute top-4 h-8 w-8 rounded-full bg-red-500/20 blur-md" />
                    <div className="relative w-6 h-6 rounded-full bg-gradient-to-br from-red-300 via-red-500 to-red-800 border-2 border-white flex items-center justify-center shadow-[0_0_18px_#ef4444]">
                      <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_6px_white]" />
                    </div>
                    <div className="h-5 w-px bg-gradient-to-b from-red-400 to-transparent" />
                    <span className="whitespace-nowrap text-[9px] font-mono font-bold text-red-300 bg-black/85 px-1.5 py-0.5 rounded border border-red-500/20">
                      Red Pin (Camera)
                    </span>
                  </div>

                  {/* Subject ground track and height-scaled 3D object */}
                  <div
                    className="absolute origin-center transition-all duration-300 pointer-events-none [transform-style:preserve-3d]"
                    style={{
                      width: '2px',
                      height: '110px',
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%, -100%) translateZ(5px) rotate(${azimuthToSubjectDeg}deg)`,
                      transformOrigin: 'bottom center'
                    }}
                  >
                    <div className="w-full h-full border-l border-dashed border-slate-500/70" />
                    <div
                      className="absolute left-1/2 top-0 w-7 origin-bottom border border-brand-cyan/70 bg-slate-800 shadow-[0_0_16px_rgba(18,214,199,0.45)] [transform-style:preserve-3d]"
                      style={{
                        height: `${Math.min(112, Math.max(24, 24 + subjectHeightMeters * 0.75))}px`,
                        transform: 'translate(-50%, -100%) rotateX(-90deg)'
                      }}
                    >
                      <div className="absolute inset-1 opacity-60 [background-image:repeating-linear-gradient(0deg,transparent_0px,transparent_7px,rgba(18,214,199,0.35)_8px),repeating-linear-gradient(90deg,transparent_0px,transparent_6px,rgba(18,214,199,0.28)_7px)]" />
                      <div className="absolute -right-2 top-1 bottom-0 w-2 origin-left border border-l-0 border-brand-cyan/30 bg-slate-950 [transform:skewY(-35deg)]" />
                      <div className="absolute -top-1 left-0 h-1 w-full bg-brand-cyan shadow-[0_0_10px_#12d6c7]" />
                    </div>
                  </div>

                  {/* Camera line of sight to the object's top */}
                  <div
                    className="absolute origin-center transition-all duration-300 pointer-events-none"
                    style={{
                      width: '2px',
                      height: '110px',
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%, -100%) translateZ(12px) rotateZ(${azimuthToSubjectDeg}deg) rotateX(${-lineOfSightElevationDeg}deg)`,
                      transformOrigin: 'bottom center'
                    }}
                  >
                    <div className="h-full w-full bg-gradient-to-t from-red-500 via-white to-brand-cyan shadow-[0_0_7px_rgba(255,255,255,0.5)]" />
                  </div>

                  {/* Sun altitude and azimuth vector */}
                  <div
                    className="absolute origin-center transition-all duration-200 pointer-events-none"
                    style={{
                      width: '2px',
                      height: '120px',
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%, -100%) translateZ(7px) rotateZ(${ephem.sun.azimuthCompass}deg) rotateX(${-Math.max(-45, Math.min(85, ephem.sun.altitudeDeg))}deg)`,
                      transformOrigin: 'bottom center'
                    }}
                  >
                    <div className="w-full h-full border-l-2 border-dashed border-brand-amber/90 drop-shadow-[0_0_5px_rgba(252,163,17,0.7)]" />
                    <div className="absolute -top-3 -left-2 text-[10px] font-mono text-brand-amber bg-black/90 px-1 rounded flex items-center gap-0.5 border border-brand-amber/20">
                      <Sun size={10} />
                      <span>{ephem.sun.altitudeDeg}°</span>
                    </div>
                  </div>

                  {/* Moon altitude and azimuth vector */}
                  <div
                    className="absolute origin-center transition-all duration-200 pointer-events-none"
                    style={{
                      width: '2px',
                      height: '120px',
                      top: '50%',
                      left: '50%',
                      transform: `translate(-50%, -100%) translateZ(7px) rotateZ(${ephem.moon.azimuthCompass}deg) rotateX(${-Math.max(-45, Math.min(85, ephem.moon.altitudeDeg))}deg)`,
                      transformOrigin: 'bottom center'
                    }}
                  >
                    <div className="w-full h-full border-l-2 border-dashed border-brand-cyan/90 drop-shadow-[0_0_5px_rgba(18,214,199,0.7)]" />
                    <div className="absolute -top-3 -left-2 text-[10px] font-mono text-brand-cyan bg-black/90 px-1 rounded flex items-center gap-0.5 border border-brand-cyan/20">
                      <Moon size={10} />
                      <span>{ephem.moon.altitudeDeg}°</span>
                    </div>
                  </div>
                </div>

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent" />
                <div data-scene-control className="absolute inset-x-3 bottom-3 z-50 grid grid-cols-3 gap-1.5 rounded-lg border border-white/10 bg-slate-950/90 p-2 font-mono backdrop-blur-md">
                  <div>
                    <span className="block text-[8px] uppercase text-slate-500">Object span</span>
                    <span className="text-[10px] font-bold text-white">{subjectBaseElevationDeg}° → {lineOfSightElevationDeg}°</span>
                    <span className="ml-1 text-[8px] text-slate-500">({objectAngularHeightDeg}°)</span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase text-brand-amber">Sun altitude</span>
                    <span className="text-[10px] font-bold text-brand-amber">{ephem.sun.altitudeDeg}°</span>
                    <span className={`ml-1 text-[8px] ${Number(sunAltDelta) < 0.3 ? 'text-emerald-400' : 'text-slate-500'}`}>Δalt {sunAltDelta}° / Δaz {sunAzDelta}°</span>
                  </div>
                  <div>
                    <span className="block text-[8px] uppercase text-brand-cyan">Moon altitude</span>
                    <span className="text-[10px] font-bold text-brand-cyan">{ephem.moon.altitudeDeg}°</span>
                    <span className={`ml-1 text-[8px] ${Number(moonAltDelta) < 0.3 ? 'text-emerald-400' : 'text-slate-500'}`}>Δalt {moonAltDelta}° / Δaz {moonAzDelta}°</span>
                  </div>
                </div>
              </div>

              {/* Pin Coordinates & Elevation Info */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono pt-2 border-t border-white/5">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-red-500/20">
                  <div className="flex items-center gap-1.5 text-red-400 font-bold mb-1">
                    <MapPin size={13} />
                    <span>RED PIN (Observer)</span>
                  </div>
                  <div className="text-slate-300">Lat: {userLocation.lat.toFixed(3)}° N</div>
                  <div className="text-slate-300">Elev: {observerElevationMeters}m MSL</div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-xl border border-brand-cyan/20">
                  <div className="flex items-center gap-1.5 text-brand-cyan font-bold mb-1">
                    <MapPin size={13} />
                    <span>BLACK PIN (Subject)</span>
                  </div>
                  <div className="text-slate-300 truncate">{subjectName}</div>
                  <div className="text-slate-300">Elev: {subjectElevationMeters}m MSL</div>
                </div>
              </div>
            </div>

            {/* Controls & Time Scrubber Column (Right 5 Cols) */}
            <div className="lg:col-span-5 space-y-5">
              {/* Target Coordinates & Elevation Geometry */}
              <div className="glass-card rounded-2xl p-5 space-y-4">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                  Subject Coordinates & Elevation
                </span>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Target Subject Name</label>
                    <input
                      type="text"
                      value={subjectName}
                      onChange={e => setSubjectName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-slate-400">
                      Latitude
                      <input
                        type="number"
                        min="-90"
                        max="90"
                        step="0.000001"
                        value={subjectLatitude}
                        onChange={e => setSubjectLatitude(Math.min(90, Math.max(-90, Number(e.target.value))))}
                        className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono focus:border-brand-cyan outline-none"
                      />
                    </label>
                    <label className="text-slate-400">
                      Longitude
                      <input
                        type="number"
                        min="-180"
                        max="180"
                        step="0.000001"
                        value={subjectLongitude}
                        onChange={e => setSubjectLongitude(Math.min(180, Math.max(-180, Number(e.target.value))))}
                        className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono focus:border-brand-cyan outline-none"
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <label className="text-slate-400">
                      Ground elevation (m)
                      <input
                        type="number"
                        value={subjectElevationMeters}
                        onChange={e => setSubjectElevationMeters(Number(e.target.value))}
                        className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono focus:border-brand-cyan outline-none"
                      />
                    </label>
                    <label className="text-slate-400">
                      Object height (m)
                      <input
                        type="number"
                        min="0"
                        max="1000"
                        value={subjectHeightMeters}
                        onChange={e => setSubjectHeightMeters(Math.max(0, Number(e.target.value)))}
                        className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono focus:border-brand-amber outline-none"
                      />
                    </label>
                  </div>

                  <div className="rounded-lg border border-white/5 bg-slate-900/70 p-2.5 font-mono">
                    <div className="mb-2 text-[10px] text-slate-500">
                      Observer: {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <span className="block text-[9px] uppercase text-slate-500">Distance</span>
                        <span className="font-bold text-white">{distanceToSubjectKm} km</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase text-slate-500">Bearing</span>
                        <span className="font-bold text-brand-cyan">{azimuthToSubjectDeg}°</span>
                      </div>
                      <div>
                        <span className="block text-[9px] uppercase text-slate-500">Top angle</span>
                        <span className="font-bold text-brand-amber">{lineOfSightElevationDeg}°</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Scrubber Slider */}
              <div className="glass-card rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-brand-amber" />
                    <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                      Time Scrubber Slider
                    </span>
                  </div>
                  <span className="text-sm font-mono font-bold text-brand-amber">
                    {formatTime(activeDateTime)}
                  </span>
                </div>

                <input
                  type="date"
                  value={selectedDateStr}
                  onChange={e => setSelectedDateStr(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs mb-2"
                />

                <div>
                  <div className="flex justify-between text-[11px] font-mono text-slate-400 mb-1">
                    <span>00:00</span>
                    <span>12:00</span>
                    <span>23:59</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1439"
                    step="5"
                    value={selectedHour * 60 + selectedMinute}
                    onChange={e => {
                      const totalMin = Number(e.target.value);
                      setSelectedHour(Math.floor(totalMin / 60));
                      setSelectedMinute(totalMin % 60);
                    }}
                    className="w-full accent-brand-amber cursor-pointer"
                  />
                </div>

                {/* Sun & Moon Telemetry at Scrubbed Time */}
                <div className="grid grid-cols-2 gap-2 font-mono text-xs pt-2 border-t border-white/5">
                  <div className="bg-slate-900 p-2.5 rounded-lg border border-brand-amber/20">
                    <div className="flex items-center gap-1 text-brand-amber font-bold mb-1">
                      <Sun size={13} />
                      <span>SUN</span>
                    </div>
                    <div className="text-slate-300">Alt: {ephem.sun.altitudeDeg}°</div>
                    <div className="text-slate-300">Az: {ephem.sun.azimuthCompass}°</div>
                  </div>

                  <div className="bg-slate-900 p-2.5 rounded-lg border border-brand-cyan/20">
                    <div className="flex items-center gap-1 text-brand-cyan font-bold mb-1">
                      <Moon size={13} />
                      <span>MOON ({ephem.moon.illumination.percentage}%)</span>
                    </div>
                    <div className="text-slate-300">Alt: {ephem.moon.altitudeDeg}°</div>
                    <div className="text-slate-300">Az: {ephem.moon.azimuthCompass}°</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: SUN/MOON SIZE TOOL ================= */}
      {activeTab === 'sun-moon-size' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Controls Column */}
          <div className="lg:col-span-6 space-y-5">
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2">
                <Maximize2 size={18} className="text-brand-cyan" />
                <h3 className="text-sm font-bold text-white">Desired Sun / Moon Apparent Size</h3>
              </div>
              <p className="text-xs text-slate-400">
                PhotoPills Sun/Moon size tool: calculate the exact shooting distance required so that the Sun or Moon matches your subject's physical height/width (or a desired meter diameter).
              </p>

              <div>
                <div className="flex justify-between items-center font-mono text-xs mb-1">
                  <span className="text-slate-400">Desired Size Behind Subject:</span>
                  <span className="text-brand-cyan font-bold">{desiredSubjectDiameterMeters} meters</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="100"
                  step="1"
                  value={desiredSubjectDiameterMeters}
                  onChange={e => setDesiredSubjectDiameterMeters(Number(e.target.value))}
                  className="w-full accent-brand-cyan cursor-pointer"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {[5, 10, 15, 25, 50, 100].map(m => (
                    <button
                      key={m}
                      onClick={() => setDesiredSubjectDiameterMeters(m)}
                      className={`px-2.5 py-1 rounded text-xs font-mono transition-all ${
                        desiredSubjectDiameterMeters === m
                          ? 'bg-brand-cyan text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center font-mono text-xs mb-1">
                  <span className="text-slate-400">Planned Lens Focal Length:</span>
                  <span className="text-brand-amber font-bold">{plannedFocalLengthMm} mm</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1200"
                  step="10"
                  value={plannedFocalLengthMm}
                  onChange={e => setPlannedFocalLengthMm(Number(e.target.value))}
                  className="w-full accent-brand-amber cursor-pointer"
                />
              </div>
            </div>

            {/* Formula Explanation Card */}
            <div className="glass-card rounded-2xl p-5 space-y-2 text-xs text-slate-300 font-mono">
              <span className="text-brand-cyan font-bold block">PHOTOPILLS OPTICAL RULE:</span>
              <p>
                Angular diameter of Sun & Moon &theta; &approx; 0.533&deg; (0.00931 rad).
              </p>
              <div className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-1">
                <div>Distance Needed d = Size / 0.00931 &approx; 107.5 &times; Size</div>
                <div>Size on Sensor = Focal Length / 107.5 mm</div>
              </div>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-6 space-y-5">
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <span className="text-xs font-mono uppercase tracking-wider text-brand-cyan font-semibold block">
                COMPUTED SHOOTING PARAMETERS
              </span>

              <div className="grid grid-cols-2 gap-3 text-center font-mono">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-brand-cyan/20">
                  <span className="text-xs text-slate-400 block mb-1">Required Shooting Distance</span>
                  <span className="text-2xl font-bold text-brand-cyan">
                    {sizeCalc.requiredDistanceMeters} m
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    {(sizeCalc.requiredDistanceMeters / 1000).toFixed(2)} km away
                  </span>
                </div>

                <div className="bg-slate-900/80 p-4 rounded-xl border border-brand-amber/20">
                  <span className="text-xs text-slate-400 block mb-1">Disc Diameter on Sensor</span>
                  <span className="text-2xl font-bold text-brand-amber">
                    {sizeCalc.sizeOnSensorMm} mm
                  </span>
                  <span className="text-[10px] text-slate-500 block mt-1">
                    {sizeCalc.sensorCoveragePercent}% of 35mm Frame Height
                  </span>
                </div>
              </div>

              {/* Sensor Crop Visual Preview */}
              <div className="p-4 rounded-xl bg-slate-950 border border-white/5 flex flex-col items-center justify-center">
                <span className="text-[11px] font-mono text-slate-400 mb-2">
                  Full Frame 36x24mm Sensor Coverage ({plannedFocalLengthMm}mm Lens)
                </span>
                <div className="w-64 h-40 bg-slate-900 border-2 border-slate-700 rounded-lg relative flex items-center justify-center overflow-hidden">
                  <div
                    className="rounded-full bg-gradient-to-tr from-amber-200 to-amber-100 shadow-[0_0_15px_rgba(252,163,17,0.8)] border border-amber-300"
                    style={{
                      width: `${Math.min(150, (sizeCalc.sizeOnSensorMm / 24) * 160)}px`,
                      height: `${Math.min(150, (sizeCalc.sizeOnSensorMm / 24) * 160)}px`
                    }}
                  />
                  <span className="absolute bottom-1 right-2 text-[9px] font-mono text-slate-500">
                    36x24mm Sensor
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: ECLIPSES CALENDAR ================= */}
      {activeTab === 'eclipses' && (
        <div className="glass-card rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-brand-amber" />
            <h3 className="text-sm font-bold text-white">Upcoming Solar & Lunar Eclipses</h3>
          </div>
          <p className="text-xs text-slate-400">
            Key astronomical eclipses for photography expeditions with magnitude and duration details.
          </p>

          <div className="space-y-3">
            {UPCOMING_ECLIPSES.map((e, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-900/80 border border-white/5 hover:border-brand-amber/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{e.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-amber/20 text-brand-amber border border-brand-amber/40 font-bold">
                      {e.type}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 block mt-1 font-mono">
                    Date: {e.date} · Max Duration: {e.duration} · Magnitude: {e.magnitude}
                  </span>
                  <span className="text-xs text-slate-400 block mt-0.5">
                    Visibility: {e.visibility}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setSelectedDateStr(e.date);
                    setActiveTab('map-planner');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono text-brand-cyan border border-brand-cyan/30 self-start sm:self-auto flex items-center gap-1"
                >
                  <span>Plan on Map</span>
                  <ChevronRight size={13} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
