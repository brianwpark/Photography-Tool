import React, { useState, useMemo } from 'react';
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
  const [distanceToSubjectKm, setDistanceToSubjectKm] = useState(2.4);
  const [azimuthToSubjectDeg, setAzimuthToSubjectDeg] = useState(128); // SE bearing
  const [subjectName, setSubjectName] = useState('Lighthouse / Peak');

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

  // Elevation Angle to Subject: tan(theta) = delta_h / distance
  const lineOfSightElevationDeg = useMemo(() => {
    const deltaH = subjectElevationMeters - observerElevationMeters;
    const distMeters = distanceToSubjectKm * 1000;
    const rad = Math.atan2(deltaH, distMeters);
    return Number(((rad * 180) / Math.PI).toFixed(2));
  }, [subjectElevationMeters, observerElevationMeters, distanceToSubjectKm]);

  // Sun/Moon Alignment Delta: difference between celestial body and target pin
  const moonAzDelta = Math.abs(ephem.moon.azimuthCompass - azimuthToSubjectDeg).toFixed(1);
  const moonAltDelta = Math.abs(ephem.moon.altitudeDeg - lineOfSightElevationDeg).toFixed(1);
  const isMoonAligned = Number(moonAzDelta) < 1.5 && Number(moonAltDelta) < 1.5;

  const sunAzDelta = Math.abs(ephem.sun.azimuthCompass - azimuthToSubjectDeg).toFixed(1);
  const sunAltDelta = Math.abs(ephem.sun.altitudeDeg - lineOfSightElevationDeg).toFixed(1);
  const isSunAligned = Number(sunAzDelta) < 1.5 && Number(sunAltDelta) < 1.5;

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

              {/* Graphical Top-Down Radar / Map Canvas Simulation */}
              <div className="relative w-full h-64 bg-slate-950 rounded-xl border border-white/5 overflow-hidden flex items-center justify-center">
                {/* Polar Azimuth Rings */}
                <div className="absolute w-56 h-56 border border-slate-800 rounded-full" />
                <div className="absolute w-40 h-40 border border-slate-800 rounded-full" />
                <div className="absolute w-24 h-24 border border-slate-800 rounded-full" />
                
                {/* Crosshairs */}
                <div className="absolute w-full h-[1px] bg-white/5" />
                <div className="absolute h-full w-[1px] bg-white/5" />
                <span className="absolute top-2 text-[10px] font-mono text-slate-500 font-bold">N (000°)</span>
                <span className="absolute right-2 text-[10px] font-mono text-slate-500 font-bold">E (090°)</span>
                <span className="absolute bottom-2 text-[10px] font-mono text-slate-500 font-bold">S (180°)</span>
                <span className="absolute left-2 text-[10px] font-mono text-slate-500 font-bold">W (270°)</span>

                {/* Red Pin: Observer Camera Center */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-5 h-5 rounded-full bg-red-500 border-2 border-white flex items-center justify-center shadow-[0_0_12px_#ef4444]">
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  </div>
                  <span className="text-[9px] font-mono font-bold text-red-400 mt-0.5 bg-black/80 px-1 rounded">
                    Red Pin (Camera)
                  </span>
                </div>

                {/* Black Pin: Subject Vector Line */}
                <div
                  className="absolute origin-center transition-all duration-300 pointer-events-none"
                  style={{
                    width: '2px',
                    height: '110px',
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -100%) rotate(${azimuthToSubjectDeg}deg)`,
                    transformOrigin: 'bottom center'
                  }}
                >
                  <div className="w-full h-full bg-gradient-to-t from-red-500/80 via-white/70 to-slate-200" />
                  {/* Black Pin Icon at Tip */}
                  <div className="absolute -top-3 -left-2.5 w-6 h-6 rounded-full bg-slate-900 border-2 border-brand-cyan flex items-center justify-center shadow-[0_0_10px_#12d6c7]">
                    <div className="w-2 h-2 rounded-full bg-brand-cyan" />
                  </div>
                </div>

                {/* Sun Azimuth Vector Line (Yellow) */}
                <div
                  className="absolute origin-center transition-all duration-200 pointer-events-none"
                  style={{
                    width: '2px',
                    height: '120px',
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -100%) rotate(${ephem.sun.azimuthCompass}deg)`,
                    transformOrigin: 'bottom center'
                  }}
                >
                  <div className="w-full h-full border-l-2 border-dashed border-brand-amber/80" />
                  <div className="absolute -top-3 -left-2 text-[10px] font-mono text-brand-amber bg-black/80 px-1 rounded flex items-center gap-0.5">
                    <Sun size={10} />
                    <span>{ephem.sun.altitudeDeg}°</span>
                  </div>
                </div>

                {/* Moon Azimuth Vector Line (Cyan) */}
                <div
                  className="absolute origin-center transition-all duration-200 pointer-events-none"
                  style={{
                    width: '2px',
                    height: '120px',
                    top: '50%',
                    left: '50%',
                    transform: `translate(-50%, -100%) rotate(${ephem.moon.azimuthCompass}deg)`,
                    transformOrigin: 'bottom center'
                  }}
                >
                  <div className="w-full h-full border-l-2 border-dashed border-brand-cyan/80" />
                  <div className="absolute -top-3 -left-2 text-[10px] font-mono text-brand-cyan bg-black/80 px-1 rounded flex items-center gap-0.5">
                    <Moon size={10} />
                    <span>{ephem.moon.altitudeDeg}°</span>
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
              {/* Target Bearing & Elevation Geometry */}
              <div className="glass-card rounded-2xl p-5 space-y-4">
                <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold block">
                  Subject Alignment Coordinates
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

                  <div>
                    <div className="flex justify-between items-center font-mono mb-1">
                      <span className="text-slate-400">Azimuth Bearing:</span>
                      <span className="text-brand-cyan font-bold">{azimuthToSubjectDeg}°</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="359"
                      value={azimuthToSubjectDeg}
                      onChange={e => setAzimuthToSubjectDeg(Number(e.target.value))}
                      className="w-full accent-brand-cyan cursor-pointer"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center font-mono mb-1">
                      <span className="text-slate-400">Shooting Distance:</span>
                      <span className="text-white font-bold">{distanceToSubjectKm} km</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="20"
                      step="0.1"
                      value={distanceToSubjectKm}
                      onChange={e => setDistanceToSubjectKm(Number(e.target.value))}
                      className="w-full accent-brand-cyan cursor-pointer"
                    />
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between font-mono">
                    <span className="text-slate-400">Line-of-Sight Angle:</span>
                    <span className="text-brand-amber font-bold">{lineOfSightElevationDeg}°</span>
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
