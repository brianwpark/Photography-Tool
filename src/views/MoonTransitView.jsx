import React, { useState, useMemo, useEffect } from 'react';
import RealisticMoon from '../components/RealisticMoon.jsx';
import {
  predictUpcomingTransits,
  calculateTransitGeometry,
  TRANSIT_OBJECT_TYPES,
  AIRCRAFT_FAMILIES
} from '../services/transitChaser.js';
import { formatTime, formatDate, getMonthlyMoonCalendar, SUPERMOONS_LIST } from '../services/ephemeris.js';
import { soundFx } from '../services/sound.js';
import {
  Moon,
  Sun,
  Radio,
  Plane,
  Rocket,
  Camera,
  MapPin,
  Clock,
  Compass,
  AlertCircle,
  Eye,
  Sliders,
  Calendar,
  Sparkles,
  Volume2,
  ShieldAlert,
  Layers,
  ChevronRight,
  Check,
  Star,
  Activity,
  Flame
} from 'lucide-react';

export default function MoonTransitView({
  ephemData,
  transits: initialTransits,
  onOpenAR,
  userLocation
}) {
  // Navigation Sub-tabs: 'transits', 'planner', 'calendar', 'safety'
  const [subTab, setSubTab] = useState('transits');

  // TransitChaser Operation Modes: 'easy' vs 'manual'
  const [operationMode, setOperationMode] = useState('easy'); // 'easy' or 'manual'

  // Target Celestial Body: 'all', 'moon', 'sun'
  const [targetBody, setTargetBody] = useState('all');

  // Plane Watch / Fleet Filter: 'all', 'boeing', 'airbus', 'fun', 'iss', 'rocket'
  const [planeWatchFilter, setPlaneWatchFilter] = useState('all');

  // Manual Mode Granular Parameters
  const [searchRadiusKm, setSearchRadiusKm] = useState(40); // 10 to 100 km
  const [warningWindowMinutes, setWarningWindowMinutes] = useState(15); // 3 to 30 min
  const [detectionMarginDeg, setDetectionMarginDeg] = useState(1.5); // 0.1 to 4.0 deg
  const [boosted3D, setBoosted3D] = useState(true); // 3D geometry engine
  const [takeoffCorrection, setTakeoffCorrection] = useState(false); // Runway climb correction

  // Centerline Offset Simulation Slider
  const [centerlineOffset, setCenterlineOffset] = useState(0);

  // Sound Test Feedback
  const [isPlayingAudioTest, setIsPlayingAudioTest] = useState(false);

  // Recompute transits based on TransitChaser engine parameters
  const calculatedTransits = useMemo(() => {
    return predictUpcomingTransits({
      userLat: userLocation?.lat || 33.749,
      userLng: userLocation?.lng || -84.388,
      daysAhead: 14,
      targetBody,
      searchRadiusKm: operationMode === 'easy' ? 35 : searchRadiusKm,
      warningWindowMinutes: operationMode === 'easy' ? 15 : warningWindowMinutes,
      detectionMarginDeg: operationMode === 'easy' ? 1.5 : detectionMarginDeg,
      boosted3D,
      takeoffCorrection
    });
  }, [userLocation?.lat, userLocation?.lng, targetBody, operationMode, searchRadiusKm, warningWindowMinutes, detectionMarginDeg, boosted3D, takeoffCorrection]);

  // Selected transit for deep inspection
  const [selectedTransit, setSelectedTransit] = useState(null);

  useEffect(() => {
    if (calculatedTransits && calculatedTransits.length > 0) {
      if (!selectedTransit || !calculatedTransits.find(t => t.id === selectedTransit.id)) {
        setSelectedTransit(calculatedTransits[0]);
      }
    }
  }, [calculatedTransits]);

  // Filtered by plane watch family
  const filteredTransits = useMemo(() => {
    return calculatedTransits.filter(t => {
      if (planeWatchFilter === 'all') return true;
      if (planeWatchFilter === 'boeing') return t.family === 'boeing';
      if (planeWatchFilter === 'airbus') return t.family === 'airbus';
      if (planeWatchFilter === 'fun') return t.isFunLivery;
      if (planeWatchFilter === 'iss') return t.type === TRANSIT_OBJECT_TYPES.ISS || t.type === TRANSIT_OBJECT_TYPES.TIANGONG;
      if (planeWatchFilter === 'rocket') return t.type === TRANSIT_OBJECT_TYPES.ROCKET;
      return true;
    });
  }, [calculatedTransits, planeWatchFilter]);

  // Monthly moon calendar
  const monthlyDays = useMemo(() => {
    const now = new Date();
    return getMonthlyMoonCalendar(now.getFullYear(), now.getMonth(), userLocation?.lat || 33.749, userLocation?.lng || -84.388);
  }, [userLocation?.lat, userLocation?.lng]);

  // Geometry calculation for the selected transit
  const geometry = useMemo(() => {
    return calculateTransitGeometry({
      moonAngularDiameterArcmin: ephemData?.moon?.angularDiameterArcmin || 31.0,
      centerlineOffsetKm: centerlineOffset,
      corridorWidthKm: selectedTransit ? selectedTransit.corridorWidthKm : 12.0,
      baseCenterlineDurationSec: selectedTransit ? selectedTransit.chordDurationSec : 0.85
    });
  }, [centerlineOffset, selectedTransit, ephemData]);

  // Audio test trigger
  const handleTestAudio = () => {
    setIsPlayingAudioTest(true);
    soundFx.playRadarPing();
    setTimeout(() => {
      soundFx.playTransitAlarm();
      setIsPlayingAudioTest(false);
    }, 400);
  };

  const nextTransit = calculatedTransits.length > 0 ? calculatedTransits[0] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-brand-cyan/15 text-brand-cyan">
              <Radio size={20} />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              TransitChaser & Celestial Alignment Suite
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Predictive scouting, live aircraft silhouettes, 3D airspace geometry & orbital space station transits
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Audio Test Button (Transit Chaser feature) */}
          <button
            type="button"
            onClick={handleTestAudio}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-mono transition-all active:scale-95 ${
              isPlayingAudioTest
                ? 'bg-brand-amber text-slate-950 font-bold border-brand-amber'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-white/10'
            }`}
            title="Test transit radar alert sound"
          >
            <Volume2 size={14} className={isPlayingAudioTest ? 'animate-bounce' : 'text-brand-amber'} />
            <span className="hidden xs:inline">Test Sound</span>
          </button>

          {/* AR Launch */}
          <button
            type="button"
            onClick={onOpenAR}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-cyan hover:bg-brand-cyanHover text-slate-950 font-bold text-xs transition-all shadow-[0_0_15px_rgba(18,214,199,0.25)] active:scale-95"
          >
            <Camera size={14} />
            <span>Launch AR Transit Lock</span>
          </button>
        </div>
      </div>

      {/* Primary Sub Tabs */}
      <div className="flex flex-wrap bg-slate-900 p-1 rounded-xl border border-white/10 text-xs font-mono w-fit gap-1">
        <button
          type="button"
          onClick={() => setSubTab('transits')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            subTab === 'transits'
              ? 'bg-brand-cyan text-slate-950 font-bold shadow-[0_0_12px_rgba(18,214,199,0.3)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Activity size={13} />
          <span>Live Transit Tracker</span>
        </button>
        <button
          type="button"
          onClick={() => setSubTab('planner')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            subTab === 'planner'
              ? 'bg-brand-cyan text-slate-950 font-bold shadow-[0_0_12px_rgba(18,214,199,0.3)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Compass size={13} />
          <span>Corridor & Spatial Planner</span>
        </button>
        <button
          type="button"
          onClick={() => setSubTab('calendar')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            subTab === 'calendar'
              ? 'bg-brand-cyan text-slate-950 font-bold shadow-[0_0_12px_rgba(18,214,199,0.3)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar size={13} />
          <span>Moon Calendar & Supermoons</span>
        </button>
        <button
          type="button"
          onClick={() => setSubTab('safety')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
            subTab === 'safety'
              ? 'bg-brand-amber text-slate-950 font-bold shadow-[0_0_12px_rgba(252,163,17,0.3)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert size={13} />
          <span>Equipment & Solar Safety</span>
        </button>
      </div>

      {/* =========================================================================
          TAB 1: LIVE TRANSIT TRACKER (TRANSITCHASER ENGINE)
         ========================================================================= */}
      {subTab === 'transits' && (
        <div className="space-y-6">
          {/* Top Impending Transit Live Alert Card */}
          {nextTransit && (
            <div className="glass-card rounded-2xl p-5 border-brand-amber/40 bg-gradient-to-r from-brand-amber/10 via-slate-900/60 to-slate-900/40 relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-xl bg-brand-amber/20 border border-brand-amber/40 flex items-center justify-center text-brand-amber flex-shrink-0 animate-pulse">
                    {nextTransit.type === TRANSIT_OBJECT_TYPES.AIRCRAFT ? <Plane size={24} /> : <Radio size={24} />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-brand-amber font-bold px-2 py-0.5 rounded bg-brand-amber/20 border border-brand-amber/30">
                        IMPENDING TRANSIT CHASER PASS
                      </span>
                      {nextTransit.isFunLivery && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/40 flex items-center gap-1">
                          <Star size={10} />
                          <span>Special Livery</span>
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold text-white mt-1">
                      {nextTransit.name} &rarr; Crossing {nextTransit.celestialBody}
                    </h2>
                    <p className="text-xs font-mono text-slate-300 mt-0.5">
                      {formatDate(nextTransit.date)} at <strong className="text-brand-amber">{formatTime(nextTransit.date)}</strong> • {nextTransit.quality}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 bg-slate-950/70 p-3 rounded-xl border border-white/10 font-mono text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Centerline:</span>
                    <span className="text-brand-cyan font-bold text-sm">{nextTransit.centerlineDistKm} km</span>
                  </div>
                  <div className="h-6 w-[1px] bg-white/10" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">Duration:</span>
                    <span className="text-brand-amber font-bold text-sm">{nextTransit.chordDurationSec}s</span>
                  </div>
                  <div className="h-6 w-[1px] bg-white/10" />
                  <div>
                    <span className="text-slate-400 block text-[10px]">Corridor Width:</span>
                    <span className="text-slate-200 font-bold text-sm">{nextTransit.corridorWidthKm} km</span>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenAR}
                    className="ml-auto px-3 py-1.5 rounded-lg bg-brand-cyan hover:bg-brand-cyanHover text-slate-950 font-bold text-xs flex items-center gap-1 transition-all"
                  >
                    <Eye size={13} />
                    <span>View in AR</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TransitChaser Engine Settings Bar: Mode, Target & Parameters */}
          <div className="glass-card rounded-2xl p-4 space-y-3">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              {/* Operation Mode: Easy Mode vs Manual Mode */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Chaser Mode:
                </span>
                <div className="flex bg-slate-900 p-0.5 rounded-lg border border-white/10 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setOperationMode('easy')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      operationMode === 'easy'
                        ? 'bg-brand-cyan text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Easy Mode (1-Tap)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOperationMode('manual')}
                    className={`px-3 py-1 rounded-md transition-all ${
                      operationMode === 'manual'
                        ? 'bg-brand-amber text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Manual Mode (Granular)
                  </button>
                </div>
              </div>

              {/* Target Body: Both / Moon / Sun */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  Target:
                </span>
                <div className="flex bg-slate-900 p-0.5 rounded-lg border border-white/10 text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setTargetBody('all')}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      targetBody === 'all'
                        ? 'bg-slate-700 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sun & Moon
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetBody('moon')}
                    className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                      targetBody === 'moon'
                        ? 'bg-brand-cyan text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Moon size={11} />
                    <span>Moon</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTargetBody('sun')}
                    className={`px-2.5 py-1 rounded-md transition-all flex items-center gap-1 ${
                      targetBody === 'sun'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sun size={11} />
                    <span>Sun</span>
                  </button>
                </div>
              </div>

              {/* Plane Watch Filter Pills */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs font-mono">
                <span className="text-xs text-slate-400 font-semibold uppercase">Fleet:</span>
                {[
                  { id: 'all', label: 'All Fleet' },
                  { id: 'boeing', label: 'Boeing' },
                  { id: 'airbus', label: 'Airbus' },
                  { id: 'fun', label: '⭐ Fun Planes' },
                  { id: 'iss', label: 'ISS / Stations' },
                  { id: 'rocket', label: 'Rockets' }
                ].map(item => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPlaneWatchFilter(item.id)}
                    className={`px-2 py-0.5 rounded transition-all ${
                      planeWatchFilter === item.id
                        ? 'bg-brand-cyan/20 text-brand-cyan font-bold border border-brand-cyan/40'
                        : 'bg-slate-900/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Mode Expanded Parameter Sliders */}
            {operationMode === 'manual' && (
              <div className="pt-3 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono animate-fadeIn">
                {/* Search Radius */}
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Search Radius:</span>
                    <span className="text-brand-cyan font-bold">{searchRadiusKm} km</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={searchRadiusKm}
                    onChange={e => setSearchRadiusKm(Number(e.target.value))}
                    className="w-full accent-brand-cyan cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>10 km</span>
                    <span>100 km</span>
                  </div>
                </div>

                {/* Warning Timer Window */}
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Prediction Window:</span>
                    <span className="text-brand-amber font-bold">{warningWindowMinutes} min</span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="30"
                    step="1"
                    value={warningWindowMinutes}
                    onChange={e => setWarningWindowMinutes(Number(e.target.value))}
                    className="w-full accent-brand-amber cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>3 min</span>
                    <span>30 min</span>
                  </div>
                </div>

                {/* Angular Detection Margin */}
                <div>
                  <div className="flex justify-between text-slate-400 mb-1">
                    <span>Detection Margin:</span>
                    <span className="text-purple-400 font-bold">{detectionMarginDeg}°</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="4.0"
                    step="0.1"
                    value={detectionMarginDeg}
                    onChange={e => setDetectionMarginDeg(Number(e.target.value))}
                    className="w-full accent-purple-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>0.1° (Strict)</span>
                    <span>4.0° (Wide)</span>
                  </div>
                </div>

                {/* Toggles: 3D Boosted Geometry & Takeoff Correction */}
                <div className="md:col-span-3 flex flex-wrap gap-4 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={boosted3D}
                      onChange={e => setBoosted3D(e.target.checked)}
                      className="accent-brand-cyan rounded"
                    />
                    <span>Boosted Mode (3D Airspace Vectors: altitude, climb/descent & true velocity)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={takeoffCorrection}
                      onChange={e => setTakeoffCorrection(e.target.checked)}
                      className="accent-brand-amber rounded"
                    />
                    <span>Takeoff Correction (Dynamic climb-out compensation for runway departures)</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Main Content Grid: Live Predicted Transits vs Selected Transit Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column: Predicted Transit List */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Showing {filteredTransits.length} predicted opportunities</span>
                <span>Sorted chronologically</span>
              </div>

              <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
                {filteredTransits.map(t => {
                  const isSelected = selectedTransit && selectedTransit.id === t.id;
                  const Icon = t.type === TRANSIT_OBJECT_TYPES.AIRCRAFT ? Plane : (t.type === TRANSIT_OBJECT_TYPES.ROCKET ? Rocket : Radio);

                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        setSelectedTransit(t);
                        setCenterlineOffset(0);
                      }}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-slate-800/95 border-brand-cyan/60 shadow-[0_0_15px_rgba(18,214,199,0.18)]'
                          : 'bg-slate-900/60 border-white/5 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                          t.type === TRANSIT_OBJECT_TYPES.ROCKET
                            ? 'bg-red-500/15 text-red-400'
                            : t.type === TRANSIT_OBJECT_TYPES.AIRCRAFT
                              ? 'bg-amber-500/15 text-brand-amber'
                              : 'bg-cyan-500/15 text-brand-cyan'
                        }`}>
                          <Icon size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-white text-sm">{t.name}</span>
                            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                              t.celestialBody === 'Sun' ? 'bg-amber-500/20 text-amber-300' : 'bg-brand-cyan/20 text-brand-cyan'
                            }`}>
                              {t.celestialBody}
                            </span>
                            {t.isFunLivery && (
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40">
                                ⭐ Fun Livery
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-mono text-slate-400 mt-0.5">
                            {formatDate(t.date)} at {formatTime(t.date)} • {t.callsign}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 self-end sm:self-center font-mono text-xs">
                        <div className="text-right">
                          <span className="text-slate-400 block text-[10px]">Centerline:</span>
                          <span className="font-bold text-brand-cyan">{t.centerlineDistKm} km</span>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 block text-[10px]">Duration:</span>
                          <span className="font-bold text-brand-amber">{t.chordDurationSec}s</span>
                        </div>
                        <ChevronRight size={15} className={isSelected ? 'text-brand-cyan' : 'text-slate-600'} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Column: Deep 3D Airspace Telemetry & Transit Simulator */}
            <div className="lg:col-span-5 space-y-4">
              {selectedTransit ? (
                <div className="glass-card rounded-2xl p-5 space-y-4 border-brand-cyan/30">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-brand-cyan font-bold">
                        3D AIRSPACE GEOMETRY BREAKDOWN
                      </span>
                      <h3 className="text-lg font-bold text-white mt-0.5">
                        {selectedTransit.name}
                      </h3>
                      {selectedTransit.funLiveryDetails && (
                        <p className="text-xs font-mono text-purple-300 flex items-center gap-1 mt-0.5">
                          <Star size={12} className="text-purple-400" />
                          <span>{selectedTransit.funLiveryDetails}</span>
                        </p>
                      )}
                    </div>
                    <span className="text-xs font-mono px-2 py-1 rounded bg-slate-800 text-slate-300 border border-white/10">
                      {selectedTransit.quality}
                    </span>
                  </div>

                  {/* High Precision Ingress / Centerline / Egress Timing (TransitChaser feature) */}
                  <div className="bg-slate-900/90 p-3.5 rounded-xl border border-white/5 font-mono text-xs space-y-2">
                    <span className="text-[10px] uppercase text-slate-400 font-bold block mb-1">
                      Precise Timing Breakdown
                    </span>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Ingress (First Contact):</span>
                      <span className="text-slate-200 font-bold">{formatTime(selectedTransit.ingressTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Peak Centerline Point:</span>
                      <span className="text-brand-amber font-bold">{formatTime(selectedTransit.centerlineTime)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Egress (Final Contact):</span>
                      <span className="text-slate-200 font-bold">{formatTime(selectedTransit.egressTime)}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-white/5">
                      <span className="text-slate-400">Total Chord Duration:</span>
                      <span className="text-brand-cyan font-bold">{selectedTransit.chordDurationSec} seconds</span>
                    </div>
                  </div>

                  {/* 3D Flight Dynamics & Telemetry Grid */}
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="bg-slate-900/70 p-2.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-slate-400 block">Flight Level:</span>
                      <span className="font-bold text-white">FL{Math.round(selectedTransit.flightLevelFt / 100)} ({selectedTransit.flightLevelFt.toLocaleString()} ft)</span>
                    </div>
                    <div className="bg-slate-900/70 p-2.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-slate-400 block">Ground Speed:</span>
                      <span className="font-bold text-brand-amber">{selectedTransit.groundSpeedKnots} knots ({Math.round(selectedTransit.groundSpeedKnots * 1.852)} km/h)</span>
                    </div>
                    <div className="bg-slate-900/70 p-2.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-slate-400 block">Slant Range to Observer:</span>
                      <span className="font-bold text-brand-cyan">{selectedTransit.rangeKm} km</span>
                    </div>
                    <div className="bg-slate-900/70 p-2.5 rounded-xl border border-white/5">
                      <span className="text-[10px] text-slate-400 block">Apparent Angular Size:</span>
                      <span className="font-bold text-purple-400">{selectedTransit.angularSizeArcsec}" arcsec</span>
                    </div>
                  </div>

                  {/* Contrail Risk & Recommended Camera Shutter */}
                  <div className="bg-slate-900/70 p-3 rounded-xl border border-white/5 font-mono text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Contrail Visibility:</span>
                      <span className="text-slate-200 font-bold">{selectedTransit.contrailRisk}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Recommended Shutter:</span>
                      <span className="text-emerald-400 font-bold">{selectedTransit.recommendedShutterSpeed}</span>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSubTab('planner')}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs transition-all flex items-center justify-center gap-1.5 border border-white/10"
                    >
                      <Compass size={14} className="text-brand-cyan" />
                      <span>Scout Observation Spots</span>
                    </button>
                    <button
                      type="button"
                      onClick={onOpenAR}
                      className="py-2.5 px-3 rounded-xl bg-brand-cyan hover:bg-brand-cyanHover text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1 shadow-[0_0_15px_rgba(18,214,199,0.25)]"
                      title="Lock in AR Viewfinder"
                    >
                      <Camera size={14} />
                      <span>AR</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="glass-card rounded-2xl p-8 text-center text-slate-400 font-mono text-xs">
                  Select a transit opportunity to inspect detailed 3D airspace geometry.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: TRANSIT CORRIDOR & SPATIAL PLANNER (DISTANCE BANDS)
         ========================================================================= */}
      {subTab === 'planner' && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-brand-cyan font-bold">
                  TRANSIT CORRIDOR SPATIAL ANALYSIS
                </span>
                <h2 className="text-lg font-bold text-white mt-0.5">
                  Distance Bands & Observation Spot Optimizer
                </h2>
              </div>
              <span className="text-xs font-mono text-brand-amber font-semibold">
                {geometry.statusText}
              </span>
            </div>

            <p className="text-xs text-slate-400 font-mono">
              Transit Chaser evaluates 1km, 2km, 5km, and 10km offset bands from the central ground track to find optimal camera positions.
            </p>

            {/* Interactive Centerline Offset Slider */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-white/5 space-y-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Current Position Offset from Centerline:</span>
                <span className="text-brand-cyan font-bold text-sm">{centerlineOffset > 0 ? `+${centerlineOffset}` : centerlineOffset} km</span>
              </div>
              <input
                type="range"
                min="-15"
                max="15"
                step="0.5"
                value={centerlineOffset}
                onChange={e => setCenterlineOffset(Number(e.target.value))}
                className="w-full accent-brand-cyan cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>-15 km (North Boundary)</span>
                <span className="text-brand-amber font-bold">0 km (Exact Centerline)</span>
                <span>+15 km (South Boundary)</span>
              </div>
            </div>

            {/* 3D Celestial Disc Transit Simulator */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
              {/* Visual Transit Simulation */}
              <div className="relative w-full h-56 bg-slate-950 rounded-2xl overflow-hidden border border-white/10 flex items-center justify-center p-4">
                {/* Celestial Disc (Sun or Moon) */}
                <div className={`relative w-40 h-40 rounded-full border-2 flex items-center justify-center shadow-2xl ${
                  selectedTransit?.celestialBody === 'Sun'
                    ? 'border-amber-400 bg-gradient-to-tr from-amber-500 to-yellow-300 shadow-[0_0_40px_rgba(245,158,11,0.5)]'
                    : 'border-slate-400 bg-gradient-to-tr from-slate-600 via-slate-800 to-slate-900 shadow-[0_0_30px_rgba(18,214,199,0.25)]'
                }`}>
                  {/* Transit Path Line */}
                  {geometry.isVisible ? (
                    <div
                      className="absolute w-full h-[3px] bg-white transition-all duration-300 shadow-[0_0_10px_#ffffff]"
                      style={{
                        top: `${50 + (centerlineOffset / 15) * 45}%`
                      }}
                    >
                      {/* Transiting Silhouette Icon */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center text-slate-950">
                        {selectedTransit?.type === TRANSIT_OBJECT_TYPES.AIRCRAFT ? (
                          <Plane size={24} className="fill-slate-950 transform rotate-90" />
                        ) : (
                          <Radio size={20} className="fill-slate-950" />
                        )}
                      </div>
                    </div>
                  ) : (
                    <span className="text-xs font-mono text-slate-400 bg-black/60 px-2 py-1 rounded">
                      Outside Disc
                    </span>
                  )}
                </div>

                <div className="absolute top-3 left-4 text-[11px] font-mono text-slate-400">
                  Target: <strong className="text-white">{selectedTransit?.celestialBody || 'Moon'}</strong> • {selectedTransit?.name}
                </div>
                <div className="absolute bottom-3 left-4 text-[11px] font-mono text-brand-amber font-bold">
                  Duration: {geometry.actualDurationSec}s ({((geometry.chordFactor || 0) * 100).toFixed(0)}% Chord)
                </div>
              </div>

              {/* Spatial Recommended Distance Bands Table */}
              <div className="space-y-2">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                  Scouted Observation Distance Bands
                </span>
                <div className="space-y-1.5 font-mono text-xs">
                  {geometry.bands.map(b => (
                    <div
                      key={b.band}
                      onClick={() => setCenterlineOffset(b.distKm)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                        Math.abs(centerlineOffset - b.distKm) < 0.3
                          ? 'bg-brand-cyan/20 border-brand-cyan text-brand-cyan'
                          : 'bg-slate-900/60 border-white/5 hover:bg-slate-800/60 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className={Math.abs(centerlineOffset - b.distKm) < 0.3 ? 'text-brand-cyan' : 'text-slate-500'} />
                        <span className="font-bold">{b.band}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-400">{b.durationSec}s</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {b.framingScore}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: MOON CALENDAR & SUPERMOONS
         ========================================================================= */}
      {subTab === 'calendar' && (
        <div className="space-y-6">
          {/* Upcoming SuperMoons Banner */}
          <div className="glass-card rounded-2xl p-5 border-brand-amber/30 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-brand-amber" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                PhotoPills SuperMoon Calendar (Perigee Full Moons)
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              When the Full Moon occurs near lunar perigee (&lt; 360,000 km from Earth), appearing up to 14% larger and 30% brighter.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              {SUPERMOONS_LIST.map(sm => (
                <div key={sm.date} className="bg-slate-900/80 p-3 rounded-xl border border-white/5 font-mono text-xs">
                  <span className="text-brand-amber font-bold block">{sm.name}</span>
                  <span className="text-white text-sm font-bold block mt-0.5">{sm.date}</span>
                  <span className="text-[11px] text-slate-400 mt-1 block">Distance: {sm.distanceKm.toLocaleString()} km</span>
                  <span className="text-[11px] text-brand-cyan block">Angular Size: {sm.angularDiameter}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 30-Day Monthly Moon Phase Calendar Grid */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white tracking-tight">
                Monthly Lunar Phase Calendar
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(new Date())}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
              {monthlyDays.map((d, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border flex flex-col items-center justify-between text-center transition-all ${
                    d.isFull
                      ? 'bg-brand-amber/15 border-brand-amber/40 shadow-[0_0_12px_rgba(252,163,17,0.2)]'
                      : d.isNew
                      ? 'bg-cyan-500/10 border-cyan-500/30'
                      : 'bg-slate-900/60 border-white/5 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="text-xs font-mono text-slate-400 font-semibold">{d.day}</span>
                  <div className="w-10 h-10 my-2 rounded-full border border-white/20 bg-slate-800 flex items-center justify-center relative overflow-hidden">
                    <div
                      className="absolute inset-0 bg-brand-cyan/70"
                      style={{
                        clipPath: d.phase < 0.5
                          ? `polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%, ${50 - d.fraction * 0.5}% 50%)`
                          : `polygon(50% 0%, 0% 0%, 0% 100%, 50% 100%, ${50 + (100 - d.fraction) * 0.5}% 50%)`
                      }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-white font-bold">{d.fraction}%</span>
                  <span className="text-[9px] font-mono text-slate-400 truncate max-w-full mt-0.5">{d.phaseName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: EQUIPMENT SETUP & SOLAR/LUNAR SAFETY GUIDE
         ========================================================================= */}
      {subTab === 'safety' && (
        <div className="space-y-5">
          {/* CRITICAL SOLAR SAFETY WARNING */}
          <div className="glass-card rounded-2xl p-5 border-amber-500/50 bg-amber-500/10 space-y-3">
            <div className="flex items-center gap-2.5 text-amber-400">
              <ShieldAlert size={24} className="flex-shrink-0 animate-bounce" />
              <h2 className="text-base font-bold uppercase tracking-tight">
                Crucial Safety Warning: Solar Transits Require Certified Solar Filters
              </h2>
            </div>
            <p className="text-xs text-amber-200/90 leading-relaxed font-mono">
              <strong>NEVER look at the Sun directly through an optical viewfinder or camera lens without a certified Solar ND 5.0 (16.6-stop) optical filter mounted on the front element.</strong> Failure to use certified solar filtration will cause instantaneous, permanent blindness and destroy your camera shutter and sensor.
            </p>
          </div>

          {/* Transit Photography Equipment Setup Guide */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono text-xs">
            <div className="glass-card rounded-2xl p-5 space-y-3">
              <span className="text-brand-cyan font-bold uppercase tracking-wider block">
                Camera & Lens Recommended Setup
              </span>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-brand-cyan flex-shrink-0 mt-0.5" />
                  <span><strong>Focal Length:</strong> 400mm to 1200mm. With 600mm+, a Boeing 787 or ISS silhouette fills a significant portion of the solar/lunar disc.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-brand-cyan flex-shrink-0 mt-0.5" />
                  <span><strong>Shutter Speed:</strong> 1/2000s to 1/4000s. Commercial aircraft travel at ~850 km/h; high shutter speed is required to eliminate motion blur.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-brand-cyan flex-shrink-0 mt-0.5" />
                  <span><strong>Drive Mode:</strong> High-speed continuous burst mode (10 to 30 fps) to guarantee capturing multiple frames during a 0.8s chord pass.</span>
                </li>
              </ul>
            </div>

            <div className="glass-card rounded-2xl p-5 space-y-3">
              <span className="text-brand-amber font-bold uppercase tracking-wider block">
                Transit Chaser Field Methodology
              </span>
              <ul className="space-y-2 text-slate-300">
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-brand-amber flex-shrink-0 mt-0.5" />
                  <span><strong>Clock Synchronization:</strong> Ensure camera clock is synced to GPS or atomic time. Transits can occur within fractions of a second of predicted time.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-brand-amber flex-shrink-0 mt-0.5" />
                  <span><strong>Atmospheric Refraction:</strong> When Sun/Moon elevation is below 15°, atmospheric turbulence and heat shimmer can degrade silhouette clarity.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={14} className="text-brand-amber flex-shrink-0 mt-0.5" />
                  <span><strong>Ground Track Scouting:</strong> Set up your tripod within 1-2 km of the predicted central axis line for maximum chord crossing time.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
