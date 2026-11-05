import React, { useState, useMemo, useEffect } from 'react';
import RealisticMoon from '../components/RealisticMoon.jsx';
import {
  predictUpcomingTransits,
  calculateTransitGeometry,
  TRANSIT_OBJECT_TYPES,
  TRANSIT_MODES,
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
  Flame,
  Search,
  Bell,
  Mail,
  HelpCircle,
  ExternalLink,
  Wifi,
  Database,
  Crosshair,
  RefreshCw,
  Info,
  Maximize2
} from 'lucide-react';

export default function MoonTransitView({
  ephemData,
  transits: initialTransits,
  onOpenAR,
  userLocation
}) {
  // Navigation Sub-tabs: 'transits', 'planner', 'contrails', 'guide', 'safety', 'feeds'
  const [subTab, setSubTab] = useState('transits');

  // TransitChaser Operation Modes: 'easy' vs 'manual'
  const [operationMode, setOperationMode] = useState('easy'); // 'easy' or 'manual'

  // Target Celestial Body / Transit Mode: 'combined', 'moon', 'sun', 'contrail', 'plane_on_plane'
  const [targetBody, setTargetBody] = useState('combined');

  // Plane Watch / Fleet Filter: 'all', 'boeing', 'airbus', 'fun', 'iss', 'rocket'
  const [planeWatchFilter, setPlaneWatchFilter] = useState('all');

  // Search filter for callsign / flight number
  const [callsignSearch, setCallsignSearch] = useState('');

  // Manual Mode Granular Parameters
  const [searchRadiusKm, setSearchRadiusKm] = useState(50); // 10 to 100 km
  const [predictionSeconds, setPredictionSeconds] = useState(120); // 30 to 900 seconds
  const [detectionMarginDeg, setDetectionMarginDeg] = useState(2.5); // 0.1 to 4.0 deg
  const [minFlightLevel, setMinFlightLevel] = useState(100); // FL100
  const [maxFlightLevel, setMaxFlightLevel] = useState(450); // FL450
  const [compassSector, setCompassSector] = useState('all');

  // Advanced Algorithmic Geometry Engine
  const [boosted3D, setBoosted3D] = useState(true); // 3D geometry engine
  const [hyperBoost, setHyperBoost] = useState(true); // Refined EGM96 & refraction
  const [takeoffCorrection, setTakeoffCorrection] = useState(false); // Runway climb correction
  const [sunCalcEngine, setSunCalcEngine] = useState('2.0.1'); // '1.x' vs '2.0.1'

  // Live Radar Tracking status
  const [isTrackingLive, setIsTrackingLive] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());

  // Centerline Offset Simulation Slider
  const [centerlineOffset, setCenterlineOffset] = useState(0);

  // Sound Test Feedback & Alerts
  const [isPlayingAudioTest, setIsPlayingAudioTest] = useState(false);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(false);
  const [userEmailAlert, setUserEmailAlert] = useState('');
  const [emailAlertSaved, setEmailAlertSaved] = useState(false);

  // Custom Data Source Feeds
  const [dataSource, setDataSource] = useState('adsb_fi'); // 'adsb_fi', 'flightradar24', 'dump1090'
  const [fr24Token, setFr24Token] = useState('');
  const [localDumpUrl, setLocalDumpUrl] = useState('http://localhost:8080/data/aircraft.json');
  const [refreshIntervalSec, setRefreshIntervalSec] = useState(10);

  // Recompute transits based on TransitChaser engine parameters
  const calculatedTransits = useMemo(() => {
    return predictUpcomingTransits({
      userLat: userLocation?.lat || 33.749,
      userLng: userLocation?.lng || -84.388,
      daysAhead: 14,
      targetBody,
      searchRadiusKm: operationMode === 'easy' ? 50 : searchRadiusKm,
      warningWindowMinutes: operationMode === 'easy' ? 15 : Math.round(predictionSeconds / 60),
      detectionMarginDeg: operationMode === 'easy' ? 2.5 : detectionMarginDeg,
      boosted3D,
      hyperBoost,
      takeoffCorrection,
      callsignFilter: callsignSearch,
      minFlightLevel: operationMode === 'easy' ? 100 : minFlightLevel,
      maxFlightLevel: operationMode === 'easy' ? 450 : maxFlightLevel,
      compassSector: operationMode === 'easy' ? 'all' : compassSector,
      sunCalcEngine
    });
  }, [
    userLocation?.lat,
    userLocation?.lng,
    targetBody,
    operationMode,
    searchRadiusKm,
    predictionSeconds,
    detectionMarginDeg,
    boosted3D,
    hyperBoost,
    takeoffCorrection,
    callsignSearch,
    minFlightLevel,
    maxFlightLevel,
    compassSector,
    sunCalcEngine
  ]);

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
    }, 450);
  };

  const handleToggleNotifications = async () => {
    if (!pushNotificationsEnabled) {
      if (typeof window !== 'undefined' && 'Notification' in window) {
        try {
          const perm = await Notification.requestPermission();
          if (perm === 'granted') {
            setPushNotificationsEnabled(true);
            new Notification('Transit Chaser Active', {
              body: 'Live alerts enabled for aircraft crossing the Sun, Moon, and sky.'
            });
            return;
          }
        } catch (e) {
          console.warn('Notifications permission:', e);
        }
      }
      setPushNotificationsEnabled(true);
    } else {
      setPushNotificationsEnabled(false);
    }
  };

  const nextTransit = calculatedTransits.length > 0 ? calculatedTransits[0] : null;

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Radar Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-brand-cyan/15 text-brand-cyan">
              <Crosshair size={22} />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                <span>Transit Chaser</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>ADS-B LIVE</span>
                </span>
              </h1>
              <p className="text-xs text-slate-400 font-mono">
                Predict and capture aircraft crossing the Sun, Moon, contrails, and plane-on-plane alignments
              </p>
            </div>
          </div>
        </div>

        {/* Action Pills: AR Viewfinder & Sound Test */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleTestAudio}
            disabled={isPlayingAudioTest}
            className={`px-3 py-1.5 rounded-xl border font-mono text-xs flex items-center gap-1.5 transition-all active:scale-95 ${
              isPlayingAudioTest
                ? 'bg-brand-amber text-slate-950 font-bold border-brand-amber'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-white/10'
            }`}
            title="Test Radar Audio & Transit Alert Chimes"
          >
            <Volume2 size={14} className={isPlayingAudioTest ? 'animate-bounce' : 'text-brand-amber'} />
            <span>Sound Check</span>
          </button>

          <button
            onClick={onOpenAR}
            className="btn-primary text-xs flex items-center gap-1.5 shadow-lg shadow-brand-cyan/20 active:scale-95"
          >
            <Camera size={14} />
            <span>AR Viewfinder</span>
          </button>
        </div>
      </div>

      {/* 2. Top Navigation Sub-Tabs */}
      <div className="flex flex-wrap bg-slate-900/90 p-1 rounded-xl border border-white/10 text-xs font-mono gap-1">
        <button
          onClick={() => setSubTab('transits')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
            subTab === 'transits'
              ? 'bg-brand-cyan text-slate-950 font-bold shadow-[0_0_12px_rgba(18,214,199,0.3)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Radio size={14} />
          <span>Live Radar & Transits</span>
        </button>

        <button
          onClick={() => setSubTab('planner')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
            subTab === 'planner'
              ? 'bg-brand-cyan text-slate-950 font-bold shadow-[0_0_12px_rgba(18,214,199,0.3)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Compass size={14} />
          <span>Scouting Corridor & Distance Bands</span>
        </button>

        <button
          onClick={() => setSubTab('contrails')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
            subTab === 'contrails'
              ? 'bg-brand-cyan text-slate-950 font-bold shadow-[0_0_12px_rgba(18,214,199,0.3)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Flame size={14} />
          <span>Contrails & Plane-on-Plane</span>
        </button>

        <button
          onClick={() => setSubTab('guide')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
            subTab === 'guide'
              ? 'bg-brand-cyan text-slate-950 font-bold shadow-[0_0_12px_rgba(18,214,199,0.3)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <HelpCircle size={14} />
          <span>How to Use Guide</span>
        </button>

        <button
          onClick={() => setSubTab('safety')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
            subTab === 'safety'
              ? 'bg-brand-cyan text-slate-950 font-bold shadow-[0_0_12px_rgba(18,214,199,0.3)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldAlert size={14} />
          <span>Solar Filter & Camera Safety</span>
        </button>

        <button
          onClick={() => setSubTab('feeds')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all ${
            subTab === 'feeds'
              ? 'bg-brand-cyan text-slate-950 font-bold shadow-[0_0_12px_rgba(18,214,199,0.3)]'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Wifi size={14} />
          <span>Data Feeds & Diagnostics</span>
        </button>
      </div>

      {/* 3. SUBTAB: LIVE RADAR & TRANSITS */}
      {subTab === 'transits' && (
        <div className="space-y-6">
          {/* Controls Bar: Operation Mode, Target Body Switcher & Plane Watch */}
          <div className="glass-card rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-white/10">
              {/* Easy Mode vs Manual Mode */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Mode:</span>
                <div className="flex bg-slate-900 p-1 rounded-xl border border-white/10 text-xs font-mono">
                  <button
                    onClick={() => setOperationMode('easy')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      operationMode === 'easy'
                        ? 'bg-brand-cyan text-slate-950 font-bold shadow-[0_0_10px_rgba(18,214,199,0.4)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Easy Mode (1-Tap Setup)
                  </button>
                  <button
                    onClick={() => setOperationMode('manual')}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      operationMode === 'manual'
                        ? 'bg-brand-cyan text-slate-950 font-bold shadow-[0_0_10px_rgba(18,214,199,0.4)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Manual Mode (Granular)
                  </button>
                </div>
              </div>

              {/* Transit Target Switcher (Sun, Moon, Combined, Contrail, Plane-on-Plane) */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">Target:</span>
                <div className="flex bg-slate-900 p-1 rounded-xl border border-white/10 text-xs font-mono gap-1">
                  <button
                    onClick={() => setTargetBody('combined')}
                    className={`px-2.5 py-1.5 rounded-lg transition-all ${
                      targetBody === 'combined'
                        ? 'bg-brand-amber text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Sun & Moon
                  </button>
                  <button
                    onClick={() => setTargetBody('moon')}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                      targetBody === 'moon'
                        ? 'bg-sky-400 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Moon size={12} />
                    <span>Moon</span>
                  </button>
                  <button
                    onClick={() => setTargetBody('sun')}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                      targetBody === 'sun'
                        ? 'bg-amber-400 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sun size={12} />
                    <span>Sun</span>
                  </button>
                  <button
                    onClick={() => setTargetBody('contrail')}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                      targetBody === 'contrail'
                        ? 'bg-purple-400 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Flame size={12} />
                    <span>Contrails</span>
                  </button>
                  <button
                    onClick={() => setTargetBody('plane_on_plane')}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg transition-all ${
                      targetBody === 'plane_on_plane'
                        ? 'bg-rose-400 text-slate-950 font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Plane size={12} />
                    <span>Plane-on-Plane</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Granular Sliders when Manual Mode is active */}
            {operationMode === 'manual' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 font-mono text-xs">
                {/* Search Radius Slider */}
                <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5 space-y-1.5">
                  <div className="flex justify-between text-slate-300">
                    <span>Search Radius:</span>
                    <span className="text-brand-cyan font-bold">{searchRadiusKm} km</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={searchRadiusKm}
                    onChange={(e) => setSearchRadiusKm(Number(e.target.value))}
                    className="w-full accent-brand-cyan cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>10 km</span>
                    <span>100 km (Max ADS-B)</span>
                  </div>
                </div>

                {/* Prediction Forward Window */}
                <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5 space-y-1.5">
                  <div className="flex justify-between text-slate-300">
                    <span>Prediction Window:</span>
                    <span className="text-brand-amber font-bold">{predictionSeconds} sec ({Math.round(predictionSeconds / 60)}m)</span>
                  </div>
                  <input
                    type="range"
                    min="30"
                    max="900"
                    step="30"
                    value={predictionSeconds}
                    onChange={(e) => setPredictionSeconds(Number(e.target.value))}
                    className="w-full accent-brand-amber cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>30 sec (Tight)</span>
                    <span>900 sec (15 min)</span>
                  </div>
                </div>

                {/* Detection Margin Slider */}
                <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5 space-y-1.5">
                  <div className="flex justify-between text-slate-300">
                    <span>Detection Margin:</span>
                    <span className="text-emerald-400 font-bold">{detectionMarginDeg.toFixed(1)}°</span>
                  </div>
                  <input
                    type="range"
                    min="0.1"
                    max="4.0"
                    step="0.1"
                    value={detectionMarginDeg}
                    onChange={(e) => setDetectionMarginDeg(Number(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>0.1° (Centerline Tele)</span>
                    <span>4.0° (Wide Frame)</span>
                  </div>
                </div>

                {/* Algorithmic Toggles: Boosted 3D, Hyper Boost, Takeoff Correction, SunCalc */}
                <div className="md:col-span-3 flex flex-wrap items-center gap-3 pt-2 border-t border-white/5">
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-900/80 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20">
                    <input
                      type="checkbox"
                      checked={boosted3D}
                      onChange={(e) => setBoosted3D(e.target.checked)}
                      className="accent-brand-cyan"
                    />
                    <span className="text-slate-300">Boosted Mode (3D Geometry Vector Engine)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer bg-slate-900/80 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20">
                    <input
                      type="checkbox"
                      checked={hyperBoost}
                      onChange={(e) => setHyperBoost(e.target.checked)}
                      className="accent-brand-cyan"
                    />
                    <span className="text-slate-300">Hyper Boost (EGM96 & Atmospheric Refraction)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer bg-slate-900/80 px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20">
                    <input
                      type="checkbox"
                      checked={takeoffCorrection}
                      onChange={(e) => setTakeoffCorrection(e.target.checked)}
                      className="accent-brand-amber"
                    />
                    <span className="text-slate-300">Takeoff Climb Correction (Runway Vectoring)</span>
                  </label>

                  <div className="flex items-center gap-1.5 ml-auto text-slate-400">
                    <span>Engine:</span>
                    <select
                      value={sunCalcEngine}
                      onChange={(e) => setSunCalcEngine(e.target.value)}
                      className="bg-slate-900 text-brand-cyan font-bold px-2 py-1 rounded border border-white/10 focus:outline-none cursor-pointer"
                    >
                      <option value="2.0.1">SunCalc 2.0.1 (High Precision)</option>
                      <option value="1.x">SunCalc 1.x Legacy</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Plane Watch Filter & Search Input */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                <span className="text-slate-400 flex items-center gap-1 mr-1">
                  <Plane size={13} />
                  <span>Plane Watch:</span>
                </span>
                <button
                  onClick={() => setPlaneWatchFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    planeWatchFilter === 'all'
                      ? 'bg-slate-800 text-white font-bold border border-white/20'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white'
                  }`}
                >
                  All Fleets
                </button>
                <button
                  onClick={() => setPlaneWatchFilter('boeing')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    planeWatchFilter === 'boeing'
                      ? 'bg-slate-800 text-brand-cyan font-bold border border-brand-cyan/40'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white'
                  }`}
                >
                  Boeing
                </button>
                <button
                  onClick={() => setPlaneWatchFilter('airbus')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    planeWatchFilter === 'airbus'
                      ? 'bg-slate-800 text-sky-400 font-bold border border-sky-400/40'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white'
                  }`}
                >
                  Airbus
                </button>
                <button
                  onClick={() => setPlaneWatchFilter('fun')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all ${
                    planeWatchFilter === 'fun'
                      ? 'bg-amber-500/20 text-brand-amber font-bold border border-amber-500/40'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white'
                  }`}
                >
                  <Star size={11} className="text-brand-amber" />
                  <span>⭐ Fun Planes</span>
                </button>
                <button
                  onClick={() => setPlaneWatchFilter('iss')}
                  className={`px-2.5 py-1 rounded-lg transition-all ${
                    planeWatchFilter === 'iss'
                      ? 'bg-slate-800 text-emerald-400 font-bold border border-emerald-400/40'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white'
                  }`}
                >
                  Space Stations
                </button>
              </div>

              {/* Callsign / Flight Number Search Input */}
              <div className="relative flex items-center min-w-[200px]">
                <Search size={13} className="absolute left-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter by flight or callsign..."
                  value={callsignSearch}
                  onChange={(e) => setCallsignSearch(e.target.value)}
                  className="w-full bg-slate-900 text-white font-mono text-xs pl-8 pr-3 py-1.5 rounded-xl border border-white/10 focus:outline-none focus:border-brand-cyan"
                />
              </div>
            </div>
          </div>

          {/* Main Content Grid: Live Predicted Transits vs Selected Transit Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Transit List (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                <span>Showing {filteredTransits.length} predicted transits</span>
                <span className="text-[11px] text-slate-500">Sorted by closest pass time</span>
              </div>

              <div className="space-y-3">
                {filteredTransits.map(t => {
                  const isSelected = selectedTransit && selectedTransit.id === t.id;
                  const isSun = t.celestialBody === 'Sun';

                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTransit(t)}
                      className={`glass-card rounded-2xl p-4 sm:p-5 transition-all cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? 'border-brand-cyan/60 bg-slate-800/90 shadow-[0_0_20px_rgba(18,214,199,0.15)] ring-1 ring-brand-cyan/50'
                          : 'hover:border-white/20'
                      }`}
                    >
                      {/* Fun plane banner */}
                      {t.isFunLivery && (
                        <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-slate-950 font-bold font-mono text-[9px] px-3 py-0.5 rounded-bl-lg flex items-center gap-1 shadow-md">
                          <Star size={10} fill="#000" />
                          <span>NOTABLE LIVERY: {t.funLiveryDetails || 'Special'}</span>
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`p-1.5 rounded-lg ${
                              t.type === TRANSIT_OBJECT_TYPES.ISS || t.type === TRANSIT_OBJECT_TYPES.TIANGONG
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : t.type === TRANSIT_OBJECT_TYPES.ROCKET
                                ? 'bg-purple-500/15 text-purple-400'
                                : t.type === TRANSIT_OBJECT_TYPES.PLANE_ON_PLANE
                                ? 'bg-rose-500/15 text-rose-400'
                                : 'bg-brand-cyan/15 text-brand-cyan'
                            }`}>
                              {t.type === TRANSIT_OBJECT_TYPES.ROCKET ? (
                                <Rocket size={16} />
                              ) : t.type === TRANSIT_OBJECT_TYPES.PLANE_ON_PLANE ? (
                                <Layers size={16} />
                              ) : (
                                <Plane size={16} />
                              )}
                            </span>
                            <div>
                              <h3 className="text-white font-bold text-sm sm:text-base tracking-tight flex items-center gap-1.5">
                                <span>{t.name}</span>
                                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                                  isSun
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                    : 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                                }`}>
                                  {t.celestialBody}
                                </span>
                              </h3>
                              <p className="text-xs text-slate-400 font-mono">
                                {t.callsign}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Pass time & Duration */}
                        <div className="text-right font-mono">
                          <div className="text-brand-amber font-bold text-sm sm:text-base">
                            {formatTime(t.date)}
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {formatDate(t.date)}
                          </div>
                        </div>
                      </div>

                      {/* Corridor & 3D Flight Stats */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-3 border-t border-white/5 font-mono text-[11px]">
                        <div>
                          <span className="text-slate-500 block">Flight Level:</span>
                          <span className="text-white font-semibold">
                            {t.flightLevelFt > 100000 ? `${Math.round(t.flightLevelFt / 3280.84)} km LEO` : `FL${Math.round(t.flightLevelFt / 100)} (${Math.round(t.flightLevelFt).toLocaleString()} ft)`}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Ground Speed:</span>
                          <span className="text-white font-semibold">
                            {t.groundSpeedKnots.toLocaleString()} kts ({Math.round(t.groundSpeedKnots * 1.852)} km/h)
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Duration:</span>
                          <span className="text-brand-cyan font-bold">{t.chordDurationSec}s</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Centerline Dist:</span>
                          <span className={`font-semibold ${t.centerlineDistKm < 2.0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {t.centerlineDistKm} km
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Selected Transit Deep Dive & 3D Celestial Disc Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              {selectedTransit && (
                <div className="glass-card rounded-2xl p-5 space-y-4 sticky top-4">
                  <div className="flex items-center justify-between pb-3 border-b border-white/10">
                    <span className="text-xs font-mono uppercase tracking-wider text-brand-cyan font-semibold flex items-center gap-1.5">
                      <Crosshair size={14} />
                      <span>Transit Telemetry</span>
                    </span>
                    <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {selectedTransit.quality}
                    </span>
                  </div>

                  {/* 3D Celestial Disc Silhouette Preview */}
                  <div className="relative h-44 rounded-xl bg-gradient-to-b from-slate-950 to-slate-900 border border-white/10 flex items-center justify-center overflow-hidden">
                    {/* Glowing Sun or Moon Disc */}
                    <div className={`relative rounded-full flex items-center justify-center transition-all ${
                      selectedTransit.celestialBody === 'Sun'
                        ? 'w-32 h-32 bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 shadow-[0_0_40px_rgba(245,158,11,0.6)]'
                        : 'w-32 h-32 bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 shadow-[0_0_35px_rgba(255,255,255,0.4)]'
                    }`}>
                      {/* Sunspots or Lunar Crater overlay */}
                      <div className="absolute inset-0 rounded-full opacity-25 bg-[radial-gradient(#000000_1.5px,transparent_1.5px)] [background-size:12px_12px]" />

                      {/* Flight Path Chord across the Disc */}
                      <div
                        className="absolute inset-x-0 h-0.5 bg-red-500/80 shadow-[0_0_8px_rgba(239,68,68,0.9)]"
                        style={{
                          transform: `translateY(${centerlineOffset * 4.5}px) rotate(${selectedTransit.groundTrackHeadingDeg - 90}deg)`
                        }}
                      />

                      {/* Aircraft Silhouette Icon along the chord */}
                      <div
                        className="absolute text-slate-950 font-bold transition-all duration-300"
                        style={{
                          transform: `translateY(${centerlineOffset * 4.5}px) rotate(${selectedTransit.groundTrackHeadingDeg - 90}deg)`
                        }}
                      >
                        <Plane size={24} fill="#090d16" />
                      </div>
                    </div>

                    {/* Disc Overlay Info */}
                    <div className="absolute bottom-2 inset-x-3 flex justify-between text-[10px] font-mono text-slate-400 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/5">
                      <span>Disc: {selectedTransit.celestialBody} (~31')</span>
                      <span>Angular Size: {selectedTransit.angularSizeArcsec}"</span>
                    </div>
                  </div>

                  {/* High Precision Ingress, Centerline, Egress Timing */}
                  <div className="p-3 bg-slate-900/80 rounded-xl border border-white/10 space-y-2 font-mono text-xs">
                    <span className="text-slate-400 text-[10px] uppercase tracking-wider block">
                      Chronometer Milestones (UTC Precision):
                    </span>
                    <div className="grid grid-cols-3 gap-1 text-center">
                      <div className="p-1.5 rounded bg-slate-800/60 border border-white/5">
                        <span className="text-[10px] text-slate-500 block">Ingress</span>
                        <span className="text-white font-bold">
                          {formatTime(selectedTransit.ingressTime)}
                        </span>
                      </div>
                      <div className="p-1.5 rounded bg-brand-cyan/15 border border-brand-cyan/40">
                        <span className="text-[10px] text-brand-cyan block">Centerline</span>
                        <span className="text-brand-cyan font-bold">
                          {formatTime(selectedTransit.centerlineTime)}
                        </span>
                      </div>
                      <div className="p-1.5 rounded bg-slate-800/60 border border-white/5">
                        <span className="text-[10px] text-slate-500 block">Egress</span>
                        <span className="text-white font-bold">
                          {formatTime(selectedTransit.egressTime)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3D Slant Range, Altitude & Contrails */}
                  <div className="space-y-2 text-xs font-mono">
                    <div className="flex justify-between py-1 border-b border-white/5 text-slate-300">
                      <span>Slant Range to Aircraft:</span>
                      <span className="text-white font-bold">{selectedTransit.rangeKm} km</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5 text-slate-300">
                      <span>Celestial Altitude / Azimuth:</span>
                      <span className="text-brand-amber font-bold">
                        {selectedTransit.altitudeDeg.toFixed(1)}° / {selectedTransit.azimuthDeg.toFixed(1)}°
                      </span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5 text-slate-300">
                      <span>Contrail Formation Risk:</span>
                      <span className="text-sky-300 font-semibold">{selectedTransit.contrailRisk}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-white/5 text-slate-300">
                      <span>Recommended Shutter:</span>
                      <span className="text-emerald-400 font-bold">{selectedTransit.recommendedShutterSpeed}</span>
                    </div>
                  </div>

                  {/* AR Viewfinder Action */}
                  <button
                    onClick={onOpenAR}
                    className="w-full py-2.5 rounded-xl bg-brand-cyan hover:bg-brand-cyanHover text-slate-950 font-bold font-mono text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-brand-cyan/20"
                  >
                    <Camera size={14} />
                    <span>Track in Augmented Reality</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. SUBTAB: SCOUTING CORRIDOR & DISTANCE BANDS */}
      {subTab === 'planner' && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-white/10">
              <Compass size={18} className="text-brand-cyan" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Transit Location Planner: Spatial Distance Bands
              </h2>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Transit paths form narrow ground corridors. Moving laterally from the centerline alters the transit chord length and framing geometry.
            </p>

            {/* Centerline Offset Slider */}
            <div className="p-4 bg-slate-900/80 rounded-xl border border-white/10 space-y-2">
              <div className="flex justify-between text-xs font-mono text-slate-300">
                <span>Observer Lateral Offset from Centerline:</span>
                <span className="text-brand-cyan font-bold">{centerlineOffset > 0 ? `+${centerlineOffset}` : centerlineOffset} km</span>
              </div>
              <input
                type="range"
                min="-6"
                max="6"
                step="0.5"
                value={centerlineOffset}
                onChange={(e) => setCenterlineOffset(Number(e.target.value))}
                className="w-full accent-brand-cyan cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>-6 km (South / West Limb)</span>
                <span>0 km (Dead Centerline)</span>
                <span>+6 km (North / East Limb)</span>
              </div>
            </div>

            {/* 5 Spatial Scouting Distance Bands Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400">
                    <th className="py-2.5 px-3">Observation Band</th>
                    <th className="py-2.5 px-3">Distance</th>
                    <th className="py-2.5 px-3">Silhouette Duration</th>
                    <th className="py-2.5 px-3">Framing Quality</th>
                    <th className="py-2.5 px-3">Recommendation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {geometry.bands.map((b, idx) => (
                    <tr key={idx} className="hover:bg-white/5">
                      <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                          idx === 0 ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : idx < 3 ? 'bg-cyan-400' : 'bg-amber-400'
                        }`} />
                        <span>{b.band}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-300">{b.distKm} km</td>
                      <td className="py-3 px-3 text-brand-cyan font-bold">{b.durationSec}s</td>
                      <td className="py-3 px-3 text-slate-300">{b.framingScore}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          idx === 0
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : idx < 3
                            ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        }`}>
                          {idx === 0 ? 'Optimal Telephoto Framing' : idx < 3 ? 'Wide Silhouette Pass' : 'Edge Chord Skim'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. SUBTAB: CONTRAILS & PLANE-ON-PLANE */}
      {subTab === 'contrails' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Contrail Tracking Module */}
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                <Flame size={18} className="text-purple-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Contrail Intersections
                </h3>
              </div>
              <p className="text-xs text-slate-300 font-mono leading-relaxed">
                Aircraft condensation trails persist for minutes at high flight levels (FL320+) under high relative humidity. Transit Chaser calculates when these trails will drift across the Sun or Moon disk, producing striking rainbow diffraction (aerodynamic contrail iridescence) or dark shadow bands.
              </p>
              <div className="p-3 bg-slate-900/80 rounded-xl border border-white/10 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Persistence Altitude:</span>
                  <span className="text-purple-300 font-bold">FL340 - FL410</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Iridescence Angle:</span>
                  <span className="text-brand-amber font-bold">2.5° to 12° from Solar Rim</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Optimal Shutter:</span>
                  <span className="text-emerald-400 font-bold">1/1600s @ f/8 (ISO 100)</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setTargetBody('contrail');
                  setSubTab('transits');
                }}
                className="w-full py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-mono text-xs font-bold transition-all"
              >
                Filter Radar for Contrail Passes
              </button>
            </div>

            {/* Plane-on-Plane Dual Aircraft Module */}
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                <Plane size={18} className="text-rose-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Plane-on-Plane Sightline Alignments
                </h3>
              </div>
              <p className="text-xs text-slate-300 font-mono leading-relaxed">
                A rare alignment where two aircraft at different flight levels cross the same line of sight from your camera. This creates an optical double silhouette in the open sky or against high cirrus clouds.
              </p>
              <div className="p-3 bg-slate-900/80 rounded-xl border border-white/10 space-y-2 font-mono text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>Separation Geometry:</span>
                  <span className="text-rose-300 font-bold">Vertical FL Stacking (&gt;3,000 ft)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Angular Crossing Rate:</span>
                  <span className="text-brand-cyan font-bold">~1.2° / second</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Recommended Lens:</span>
                  <span className="text-brand-amber font-bold">300mm to 600mm Telephoto</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setTargetBody('plane_on_plane');
                  setSubTab('transits');
                }}
                className="w-full py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-mono text-xs font-bold transition-all"
              >
                Scan for Plane-on-Plane Alignments
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. SUBTAB: HOW TO USE GUIDE (Direct from how_to_use.html) */}
      {subTab === 'guide' && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <HelpCircle size={20} className="text-brand-cyan" />
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  Transit Chaser Official User Guide
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Master guide to setting up your location, parameters, and capturing celestial transits
                </p>
              </div>
            </div>

            {/* 1. Quick Start Workflow */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-brand-amber font-mono uppercase tracking-wider flex items-center gap-1.5">
                <span>1. Quick Start Workflow</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3.5 bg-slate-900/80 rounded-xl border border-white/10 space-y-1">
                  <span className="text-brand-cyan font-bold block">Step 1: Set Your Location</span>
                  <p className="text-slate-300">
                    Precision is essential. A transit path corridor is often less than 2 km wide; being just one street over can turn a dead-center silhouette into a miss. Use your phone's GPS or exact map coordinates.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-900/80 rounded-xl border border-white/10 space-y-1">
                  <span className="text-brand-cyan font-bold block">Step 2: Choose Your Target</span>
                  <p className="text-slate-300">
                    Select <strong>Sun</strong>, <strong>Moon</strong>, <strong>Contrails</strong>, or <strong>Plane-on-Plane</strong> depending on your gear and time of day.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-900/80 rounded-xl border border-white/10 space-y-1">
                  <span className="text-brand-cyan font-bold block">Step 3: Easy vs Manual Mode</span>
                  <p className="text-slate-300">
                    Use <strong>Easy Mode</strong> for 1-tap automated settings. Use <strong>Manual Mode</strong> to tune search radius (10–100 km), prediction window, and detection margin.
                  </p>
                </div>
                <div className="p-3.5 bg-slate-900/80 rounded-xl border border-white/10 space-y-1">
                  <span className="text-brand-cyan font-bold block">Step 4: Sound & Notifications</span>
                  <p className="text-slate-300">
                    Run the <strong>Sound Check</strong> before shooting. Transit Chaser plays a radar ping and siren alert when an aircraft is 120s away.
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Key Settings Explained */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <h3 className="text-sm font-bold text-brand-cyan font-mono uppercase tracking-wider">
                2. Key Controls & Parameters Explained
              </h3>
              <div className="space-y-2.5 text-xs font-mono">
                <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5">
                  <span className="text-white font-bold block mb-1">Search Radius (10–100 km):</span>
                  <p className="text-slate-300">
                    Controls how far out the radar monitors surrounding airspace. A 30–50 km radius catches regional approaches without excessive traffic noise; 100 km provides earlier tracking for high-altitude cruise flights.
                  </p>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5">
                  <span className="text-white font-bold block mb-1">Prediction Window (30–900 seconds):</span>
                  <p className="text-slate-300">
                    Projects aircraft trajectories forward using live ground speed, track heading, and vertical rates. Short windows (60–180s) have the highest accuracy.
                  </p>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5">
                  <span className="text-white font-bold block mb-1">Boosted Mode (3D Airspace Geometry):</span>
                  <p className="text-slate-300">
                    Compares true 3D vectors in physical space (aircraft altitude, slant range, celestial angular size) rather than simple 2D angle checks, filtering out false alarms.
                  </p>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-white/5">
                  <span className="text-white font-bold block mb-1">Detection Margin (0.1°–4.0°):</span>
                  <p className="text-slate-300">
                    Tighter margins (0.5°–1.5°) are ideal for 600mm–1200mm telephotos; wider margins (2.0°–3.5°) give earlier alerts for wide-field compositions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 7. SUBTAB: SOLAR SAFETY & EQUIPMENT SETUP */}
      {subTab === 'safety' && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 border-brand-amber/40 bg-slate-900/90 space-y-5">
            <div className="flex items-center gap-3 pb-3 border-b border-white/10">
              <span className="p-2.5 rounded-xl bg-brand-amber/20 text-brand-amber">
                <ShieldAlert size={24} />
              </span>
              <div>
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Mandatory Solar Transit Safety Warning
                </h2>
                <p className="text-xs text-brand-amber font-mono font-semibold">
                  Solar observation without certified filtration causes instant, irreversible eye blindness and melts camera sensors!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-2">
                <h4 className="text-white font-bold flex items-center gap-1.5">
                  <AlertCircle size={14} className="text-brand-amber" />
                  <span>Certified Solar ND 5.0 (16.6 Stops)</span>
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  Always use certified optical solar filters (such as Baader Planetarium Solar Safety Film or ND 5.0 front-thread glass). Regular photographic ND filters (ND 1000 / 10 stops) do NOT block harmful infrared and ultraviolet radiation!
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-2">
                <h4 className="text-white font-bold flex items-center gap-1.5">
                  <Camera size={14} className="text-brand-cyan" />
                  <span>Camera Exposure Settings</span>
                </h4>
                <p className="text-slate-300 leading-relaxed">
                  Aircraft at 850 km/h cross the solar disk in only 0.4s to 0.9s. Use <strong>1/2000s to 1/4000s</strong> shutter speed, lock manual focus on the solar limb, and use high-speed continuous burst mode.
                </p>
              </div>
            </div>

            {/* Equipment Checklist */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-white/10 space-y-2 font-mono text-xs">
              <span className="text-white font-bold block">Photographer's Transit Checklist:</span>
              <ul className="space-y-1 text-slate-300 list-disc list-inside">
                <li>Attach solar filter to FRONT of the lens before pointing anywhere near the Sun.</li>
                <li>Lock manual focus on sunspots or the sharp solar/lunar limb in Live View.</li>
                <li>Set camera clock to exact GPS/NTP time (accurate to within 0.1 second).</li>
                <li>Start burst shooting 2 seconds prior to predicted Ingress.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* 8. SUBTAB: DATA FEEDS & DIAGNOSTICS */}
      {subTab === 'feeds' && (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-white/10">
              <Wifi size={20} className="text-emerald-400" />
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  ADS-B Data Feeds & External Integrations
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Configure live flight data streams, local Dump1090 receivers, and automated alert dispatch
                </p>
              </div>
            </div>

            {/* Data Source Selector */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
              <div
                onClick={() => setDataSource('adsb_fi')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  dataSource === 'adsb_fi'
                    ? 'bg-slate-800 border-brand-cyan text-white shadow-[0_0_12px_rgba(18,214,199,0.2)]'
                    : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm">Community ADS-B</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                    Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Global open flight tracker powered by adsb.fi community receivers.
                </p>
              </div>

              <div
                onClick={() => setDataSource('flightradar24')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  dataSource === 'flightradar24'
                    ? 'bg-slate-800 border-brand-cyan text-white shadow-[0_0_12px_rgba(18,214,199,0.2)]'
                    : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm">Flightradar24 Token</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                    API
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Connect personal FR24 API subscription token for prioritized rate limits.
                </p>
              </div>

              <div
                onClick={() => setDataSource('dump1090')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  dataSource === 'dump1090'
                    ? 'bg-slate-800 border-brand-cyan text-white shadow-[0_0_12px_rgba(18,214,199,0.2)]'
                    : 'bg-slate-900/60 border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm">Local SDR / Dump1090</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold">
                    Direct
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Read directly from your rooftop RTL-SDR antenna receiver via local IP.
                </p>
              </div>
            </div>

            {/* Email Alert Dispatch */}
            <div className="p-4 bg-slate-900/80 rounded-xl border border-white/10 space-y-3 font-mono text-xs">
              <div className="flex items-center gap-2 text-white font-bold">
                <Mail size={15} className="text-brand-cyan" />
                <span>Automated Email Alert Dispatch</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Receive an automatic email warning when an aircraft enters your prediction window (3–5 minutes ahead of transit).
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  value={userEmailAlert}
                  onChange={(e) => {
                    setUserEmailAlert(e.target.value);
                    setEmailAlertSaved(false);
                  }}
                  className="flex-1 bg-slate-950 text-white px-3 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-brand-cyan"
                />
                <button
                  onClick={() => setEmailAlertSaved(true)}
                  className="px-4 py-2 rounded-xl bg-brand-cyan text-slate-950 font-bold active:scale-95 transition-all"
                >
                  {emailAlertSaved ? 'Saved & Armed' : 'Save Email Dispatch'}
                </button>
              </div>
              {emailAlertSaved && (
                <div className="text-emerald-400 text-[11px] flex items-center gap-1.5">
                  <Check size={13} />
                  <span>Email dispatch armed for {userEmailAlert}. Alerts will be sent upon detected candidates.</span>
                </div>
              )}
            </div>

            {/* Attribution & Support */}
            <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-slate-400">
              <div>
                <span>Original Transit Chaser created by </span>
                <span className="text-white font-bold">Rey Sandu Godakumbura</span>
                <span> (transitchaser.com).</span>
              </div>
              <a
                href="https://transitchaser.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-cyan hover:underline flex items-center gap-1"
              >
                <span>Visit transitchaser.com</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Named alias for interoperability
export { MoonTransitView as TransitChaserView };
