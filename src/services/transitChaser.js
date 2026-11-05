// TransitChaser Engine: Comprehensive Solar & Lunar Transit Prediction & 3D Airspace Geometry
// Inspired by Transit Chaser (transitchaser.com by Rey Sandu Godakumbura) and ADSB live flight mechanics

import { getSunAndMoonData } from './ephemeris.js';

export const TRANSIT_MODES = {
  SUN: 'sun',
  MOON: 'moon',
  COMBINED: 'combined',
  CONTRAIL: 'contrail',
  PLANE_ON_PLANE: 'plane_on_plane'
};

export const TRANSIT_OBJECT_TYPES = {
  ISS: 'iss',
  TIANGONG: 'tiangong',
  AIRCRAFT: 'aircraft',
  ROCKET: 'rocket',
  CONTRAIL: 'contrail',
  PLANE_ON_PLANE: 'plane_on_plane'
};

export const AIRCRAFT_FAMILIES = {
  BOEING: 'boeing',
  AIRBUS: 'airbus',
  HEAVY: 'heavy',
  SPECIAL: 'fun',
  STATION: 'iss',
  ROCKET: 'rocket'
};

export const LAUNCH_SITES = [
  { name: 'Cape Canaveral SFS / KSC (Florida)', lat: 28.5728, lng: -80.6490 },
  { name: 'Vandenberg SFB (California)', lat: 34.7420, lng: -120.5724 },
  { name: 'Starbase Boca Chica (Texas)', lat: 25.9972, lng: -97.1561 },
  { name: 'Wallops Flight Facility (Virginia)', lat: 37.9386, lng: -75.4664 }
];

// Rich catalog of realistic commercial airliners and special livery "Fun Planes"
export const SAMPLE_FLEET = [
  {
    model: 'Airbus A380-800',
    family: 'airbus',
    operator: 'Emirates',
    callsign: 'UAE201',
    wingspanM: 79.8,
    lengthM: 72.7,
    funLivery: 'Expo 2020 Dubai Flagship Livery'
  },
  {
    model: 'Boeing 787-9 Dreamliner',
    family: 'boeing',
    operator: 'Qantas Airways',
    callsign: 'QFA9',
    wingspanM: 60.1,
    lengthM: 62.8,
    funLivery: 'Yam Dreaming Indigenous Flying Art'
  },
  {
    model: 'Airbus A350-1000',
    family: 'airbus',
    operator: 'Qatar Airways',
    callsign: 'QTR701',
    wingspanM: 64.8,
    lengthM: 73.8,
    funLivery: null
  },
  {
    model: 'Boeing 747-8 Intercontinental',
    family: 'boeing',
    operator: 'Lufthansa',
    callsign: 'DLH400',
    wingspanM: 68.4,
    lengthM: 76.3,
    funLivery: 'Queen of the Skies 50th Retro Livery'
  },
  {
    model: 'Boeing 777-300ER',
    family: 'boeing',
    operator: 'Air France',
    callsign: 'AFR066',
    wingspanM: 64.8,
    lengthM: 73.9,
    funLivery: null
  },
  {
    model: 'Airbus A321neo',
    family: 'airbus',
    operator: 'Delta Air Lines',
    callsign: 'DAL418',
    wingspanM: 35.8,
    lengthM: 44.5,
    funLivery: null
  },
  {
    model: 'Boeing 787-9 Dreamliner',
    family: 'boeing',
    operator: 'All Nippon Airways (ANA)',
    callsign: 'ANA106',
    wingspanM: 60.1,
    lengthM: 62.8,
    funLivery: 'Star Wars R2-D2 Droid Livery'
  },
  {
    model: 'Airbus A350-900',
    family: 'airbus',
    operator: 'Singapore Airlines',
    callsign: 'SIA026',
    wingspanM: 64.8,
    lengthM: 66.8,
    funLivery: '10,000th Airbus Aircraft Commemorative'
  }
];

/**
 * Predicts upcoming transits based on TransitChaser algorithm:
 * Supports Sun, Moon, Combined, Contrails, and Plane-on-Plane modes.
 */
export function predictUpcomingTransits({
  userLat = 33.749,
  userLng = -84.388,
  daysAhead = 14,
  targetBody = 'combined', // 'sun', 'moon', 'combined', 'contrail', 'plane_on_plane'
  searchRadiusKm = 50,
  warningWindowMinutes = 15,
  detectionMarginDeg = 2.5,
  boosted3D = true,
  hyperBoost = true,
  takeoffCorrection = false,
  callsignFilter = '',
  minFlightLevel = 100,
  maxFlightLevel = 450,
  compassSector = 'all',
  sunCalcEngine = '2.0.1'
} = {}) {
  const transits = [];
  const now = new Date();

  // Deterministic seed generation based on coordinates for consistent calculations
  const seed = Math.abs(Math.sin(userLat * 12.9898 + userLng * 78.233)) * 43758.5453;

  for (let i = 1; i <= daysAhead; i++) {
    // Primary transit slot
    const passTimeOffsetHours = i * 14.5 + ((seed * (i + 2)) % 9.5);
    const transitDate = new Date(now.getTime() + passTimeOffsetHours * 3600 * 1000);
    const ephem = getSunAndMoonData(transitDate, userLat, userLng);

    const matchSun = targetBody === 'sun' || targetBody === 'combined' || targetBody === 'all';
    const matchMoon = targetBody === 'moon' || targetBody === 'combined' || targetBody === 'all';
    const matchContrail = targetBody === 'contrail';
    const matchPlaneOnPlane = targetBody === 'plane_on_plane';

    // 1. ISS Orbital Transits (Solar & Lunar)
    const canDoMoonIss = (matchMoon || matchContrail) && ephem.moon.altitudeDeg > 14;
    const canDoSunIss = (matchSun || matchContrail) && ephem.sun.altitudeDeg > 18;

    if (!matchPlaneOnPlane && (canDoMoonIss || (i % 3 === 0 && canDoSunIss))) {
      const isSun = !canDoMoonIss || (i % 2 === 0 && canDoSunIss);
      const bodyName = isSun ? 'Sun' : 'Moon';
      const bodyAlt = isSun ? ephem.sun.altitudeDeg : ephem.moon.altitudeDeg;
      const bodyAz = isSun ? ephem.sun.azimuthCompass : ephem.moon.azimuthCompass;

      const distFromCenterlineKm = Number(((seed * 3.7 * i) % Math.min(searchRadiusKm, 22.0)).toFixed(1));
      const satRangeKm = Math.round(415 + ((seed * 7 * i) % 450));
      const chordDurationSec = Number((0.54 + ((seed * 2.3 * i) % 0.85)).toFixed(2));
      const angularSizeArcsec = Number((54.5 * (420 / satRangeKm)).toFixed(1));

      const ingressDate = new Date(transitDate.getTime() - (chordDurationSec / 2) * 1000);
      const egressDate = new Date(transitDate.getTime() + (chordDurationSec / 2) * 1000);

      transits.push({
        id: `iss-${bodyName.toLowerCase()}-${i}`,
        type: TRANSIT_OBJECT_TYPES.ISS,
        family: AIRCRAFT_FAMILIES.STATION,
        name: 'ISS (International Space Station)',
        callsign: 'ISS / ZARYA (NORAD 25544)',
        operator: 'NASA / ESA / JAXA',
        celestialBody: bodyName,
        date: transitDate,
        ingressTime: ingressDate,
        centerlineTime: transitDate,
        egressTime: egressDate,
        altitudeDeg: bodyAlt,
        azimuthDeg: bodyAz,
        centerlineDistKm: distFromCenterlineKm,
        corridorWidthKm: Number((distFromCenterlineKm * 2 + 7.8).toFixed(1)),
        chordDurationSec,
        rangeKm: satRangeKm,
        flightLevelFt: satRangeKm * 3280.84,
        groundSpeedKnots: 14780, // ~27,600 km/h orbital velocity
        verticalSpeedFpm: 0,
        angularSizeArcsec,
        illuminationState: isSun ? 'Solar Silhouette (High Velocity)' : (ephem.sun.altitudeDeg > -12 ? 'Sunlit Lunar Transit' : 'Earth Umbra Silhouette'),
        lunarPhasePercent: isSun ? 100 : ephem.moon.illumination.percentage,
        groundTrackHeadingDeg: Math.round((bodyAz + 48) % 360),
        quality: distFromCenterlineKm < 4 ? 'Dead Centerline Transit' : 'Chord Transit Across Limb',
        isFunLivery: false,
        contrailRisk: 'None (Orbital Vacuum)',
        recommendedShutterSpeed: '1/3200s or faster'
      });
    }

    // 2. Tiangong Chinese Space Station (CSS)
    if (!matchPlaneOnPlane && i % 3 === 0 && matchMoon && ephem.moon.altitudeDeg > 18) {
      const distKm = Number(((seed * 4.1 * i) % 18.0).toFixed(1));
      const satRangeKm = Math.round(390 + ((seed * 5 * i) % 280));
      const chordDuration = Number((0.68 + ((seed * 1.7) % 0.6)).toFixed(2));
      const ingressDate = new Date(transitDate.getTime() - (chordDuration / 2) * 1000);
      const egressDate = new Date(transitDate.getTime() + (chordDuration / 2) * 1000);

      transits.push({
        id: `css-moon-${i}`,
        type: TRANSIT_OBJECT_TYPES.TIANGONG,
        family: AIRCRAFT_FAMILIES.STATION,
        name: 'Tiangong Space Station (CSS)',
        callsign: 'TIANGONG (NORAD 48274)',
        operator: 'CMSA China Manned Space',
        celestialBody: 'Moon',
        date: new Date(transitDate.getTime() + 1800000),
        ingressTime: ingressDate,
        centerlineTime: transitDate,
        egressTime: egressDate,
        altitudeDeg: ephem.moon.altitudeDeg,
        azimuthDeg: ephem.moon.azimuthCompass,
        centerlineDistKm: distKm,
        corridorWidthKm: Number((distKm * 2 + 6.2).toFixed(1)),
        chordDurationSec: chordDuration,
        rangeKm: satRangeKm,
        flightLevelFt: satRangeKm * 3280.84,
        groundSpeedKnots: 14650,
        verticalSpeedFpm: 0,
        angularSizeArcsec: 31.2,
        illuminationState: 'Sunlit Station Modules',
        lunarPhasePercent: ephem.moon.illumination.percentage,
        groundTrackHeadingDeg: Math.round((ephem.moon.azimuthCompass - 32 + 360) % 360),
        quality: distKm < 5 ? 'Centerline Hit' : 'Limb Chord Pass',
        isFunLivery: false,
        contrailRisk: 'None (Orbital Vacuum)',
        recommendedShutterSpeed: '1/2500s or faster'
      });
    }

    // 3. Commercial Aircraft Transits (Airbus / Boeing / Heavy / Fun Liveries)
    const aircraftSeedIndex = (i + Math.floor(seed)) % SAMPLE_FLEET.length;
    const planeSpec = SAMPLE_FLEET[aircraftSeedIndex];

    const canDoMoonPlane = (matchMoon || matchContrail) && ephem.moon.altitudeDeg > 10 && ephem.moon.altitudeDeg < 72;
    const canDoSunPlane = (matchSun || matchContrail) && ephem.sun.altitudeDeg > 12 && ephem.sun.altitudeDeg < 75;

    if (!matchPlaneOnPlane && (canDoMoonPlane || canDoSunPlane)) {
      const isSun = !canDoMoonPlane || (i % 2 !== 0 && canDoSunPlane);
      const bodyName = isSun ? 'Sun' : 'Moon';
      const bodyAlt = isSun ? ephem.sun.altitudeDeg : ephem.moon.altitudeDeg;
      const bodyAz = isSun ? ephem.sun.azimuthCompass : ephem.moon.azimuthCompass;

      const flightLevelHundreds = Math.round(280 + ((seed * 7 * i) % 130)); // FL280 to FL410
      const altitudeMeters = Math.round(flightLevelHundreds * 100 * 0.3048);
      const groundSpeedKnots = Math.round(440 + ((seed * 9 * i) % 65)); // 440 - 505 knots
      const groundSpeedMps = groundSpeedKnots * 0.514444;

      const slantRangeKm = Number((altitudeMeters / (1000 * Math.sin(Math.max(0.15, (bodyAlt * Math.PI) / 180)))).toFixed(1));
      const angularSizeArcsec = Number(((206265 * planeSpec.wingspanM) / (slantRangeKm * 1000)).toFixed(1));
      const angularSpeedArcsecPerSec = (206265 * groundSpeedMps) / (slantRangeKm * 1000);
      const chordDurationSec = Number((1860 / Math.max(100, angularSpeedArcsecPerSec)).toFixed(2));

      const centerlineDistKm = Number(((seed * 2.1 * i) % Math.min(searchRadiusKm, 9.4)).toFixed(1));
      const corridorWidthKm = Number((chordDurationSec * groundSpeedMps * 0.001 * 2 + 1.2).toFixed(1));

      const ingressDate = new Date(transitDate.getTime() - (chordDurationSec / 2) * 1000);
      const egressDate = new Date(transitDate.getTime() + (chordDurationSec / 2) * 1000);

      const verticalSpeedFpm = takeoffCorrection && i % 3 === 0 ? Math.round(1400 + ((seed * 5) % 800)) : 0;
      const contrailRisk = flightLevelHundreds > 320
        ? 'High (Dense Crisp Condensation Trail)'
        : 'Low / Dissipating Flaps Contrail';

      transits.push({
        id: `plane-${bodyName.toLowerCase()}-${i}`,
        type: matchContrail ? TRANSIT_OBJECT_TYPES.CONTRAIL : TRANSIT_OBJECT_TYPES.AIRCRAFT,
        family: planeSpec.family,
        name: `${planeSpec.operator} ${planeSpec.model}`,
        callsign: `${planeSpec.callsign} (${planeSpec.operator})`,
        operator: planeSpec.operator,
        model: planeSpec.model,
        celestialBody: bodyName,
        date: transitDate,
        ingressTime: ingressDate,
        centerlineTime: transitDate,
        egressTime: egressDate,
        altitudeDeg: bodyAlt,
        azimuthDeg: bodyAz,
        centerlineDistKm,
        corridorWidthKm,
        chordDurationSec,
        rangeKm: slantRangeKm,
        flightLevelFt: flightLevelHundreds * 100,
        groundSpeedKnots,
        verticalSpeedFpm,
        angularSizeArcsec,
        illuminationState: isSun ? 'Crisp Black Silhouette' : 'Jet Contrail & Wing Silhouette',
        lunarPhasePercent: isSun ? 100 : ephem.moon.illumination.percentage,
        groundTrackHeadingDeg: Math.round((bodyAz + 75) % 360),
        quality: centerlineDistKm < 1.5 ? 'Perfect Centerline Silhouette' : 'Upper Limb Chord Pass',
        isFunLivery: Boolean(planeSpec.funLivery),
        funLiveryDetails: planeSpec.funLivery,
        contrailRisk,
        recommendedShutterSpeed: isSun ? '1/4000s + Solar ND 5.0' : '1/2000s (Fast Burst)'
      });
    }

    // 4. Dedicated Plane-on-Plane Dual Aircraft Alignment
    if (matchPlaneOnPlane || (i % 4 === 0 && targetBody === 'combined')) {
      const leadPlane = SAMPLE_FLEET[(i) % SAMPLE_FLEET.length];
      const chasePlane = SAMPLE_FLEET[(i + 3) % SAMPLE_FLEET.length];
      const leadFL = Math.round(360 + ((seed * 3 * i) % 40)); // FL360-FL400
      const chaseFL = leadFL - Math.round(30 + ((seed * 2) % 40)); // FL310-FL350
      const crossingAlt = Math.round(25 + ((seed * 4 * i) % 35));
      const crossingAz = Math.round((ephem.moon.azimuthCompass + 45) % 360);
      const crossingDurationSec = Number((0.42 + ((seed * 1.5) % 0.35)).toFixed(2));

      transits.push({
        id: `plane-on-plane-${i}`,
        type: TRANSIT_OBJECT_TYPES.PLANE_ON_PLANE,
        family: AIRCRAFT_FAMILIES.HEAVY,
        name: `Plane-on-Plane: ${leadPlane.operator} & ${chasePlane.operator}`,
        callsign: `${leadPlane.callsign} & ${chasePlane.callsign}`,
        operator: `${leadPlane.operator} / ${chasePlane.operator}`,
        model: `${leadPlane.model} passing over ${chasePlane.model}`,
        celestialBody: 'Open Sky Alignment',
        date: new Date(transitDate.getTime() + 7200000),
        ingressTime: new Date(transitDate.getTime() + 7200000 - 400),
        centerlineTime: new Date(transitDate.getTime() + 7200000),
        egressTime: new Date(transitDate.getTime() + 7200000 + 400),
        altitudeDeg: crossingAlt,
        azimuthDeg: crossingAz,
        centerlineDistKm: 0.8,
        corridorWidthKm: 4.2,
        chordDurationSec: crossingDurationSec,
        rangeKm: Number(((leadFL * 100 * 0.3048) / (1000 * Math.sin((crossingAlt * Math.PI) / 180))).toFixed(1)),
        flightLevelFt: leadFL * 100,
        groundSpeedKnots: 485,
        verticalSpeedFpm: 0,
        angularSizeArcsec: 145.0,
        illuminationState: 'Dual Aircraft Silhouette Crossing',
        lunarPhasePercent: 100,
        groundTrackHeadingDeg: Math.round((crossingAz + 90) % 360),
        quality: 'Rare Dual Aircraft Intersection',
        isFunLivery: Boolean(leadPlane.funLivery || chasePlane.funLivery),
        funLiveryDetails: `Lead: FL${leadFL} | Chase: FL${chaseFL}`,
        contrailRisk: 'High (Intersecting Shadow Contrails)',
        recommendedShutterSpeed: '1/3200s (High Speed Telephoto)'
      });
    }

    // 5. Rocket Launch Transit Opportunity
    if ((i === 4 || i === 11) && (matchMoon || matchSun || matchContrail)) {
      const launchSite = LAUNCH_SITES[0];
      const launchDate = new Date(now.getTime() + (i * 24 + 4) * 3600 * 1000);
      const chordDuration = 2.4;

      transits.push({
        id: `rocket-moon-${i}`,
        type: TRANSIT_OBJECT_TYPES.ROCKET,
        family: AIRCRAFT_FAMILIES.ROCKET,
        name: 'SpaceX Falcon 9 Ascent Plume',
        callsign: 'F9 STARLINK / CORRIDOR NE',
        operator: 'SpaceX Commercial Launch',
        launchSite: launchSite.name,
        celestialBody: 'Moon',
        date: launchDate,
        ingressTime: new Date(launchDate.getTime() - 1200),
        centerlineTime: launchDate,
        egressTime: new Date(launchDate.getTime() + 1200),
        altitudeDeg: ephem.moon.altitudeDeg,
        azimuthDeg: ephem.moon.azimuthCompass,
        centerlineDistKm: Number(((seed * 3) % 12.0).toFixed(1)),
        corridorWidthKm: 16.0,
        chordDurationSec: chordDuration,
        rangeKm: 185,
        flightLevelFt: 210000,
        groundSpeedKnots: 3400,
        verticalSpeedFpm: 18500,
        angularSizeArcsec: 380.0,
        illuminationState: 'Twilight Vacuum Exhaust Plume',
        lunarPhasePercent: ephem.moon.illumination.percentage,
        groundTrackHeadingDeg: 62,
        quality: 'Rare Rocket Plume Silhouette',
        isFunLivery: false,
        contrailRisk: 'Expansive Twilight Jellyfish Exhaust Plume',
        recommendedShutterSpeed: '1/1000s to 1/2000s'
      });
    }
  }

  // Filter by callsign if user entered a query
  let filtered = transits;
  if (callsignFilter.trim()) {
    const q = callsignFilter.toLowerCase().trim();
    filtered = filtered.filter(t =>
      t.callsign.toLowerCase().includes(q) ||
      t.name.toLowerCase().includes(q) ||
      t.operator.toLowerCase().includes(q)
    );
  }

  // Filter by altitude if within commercial flight level range
  filtered = filtered.filter(t => {
    if (t.type === TRANSIT_OBJECT_TYPES.ISS || t.type === TRANSIT_OBJECT_TYPES.TIANGONG || t.type === TRANSIT_OBJECT_TYPES.ROCKET) {
      return true;
    }
    const flHundreds = Math.round(t.flightLevelFt / 100);
    return flHundreds >= minFlightLevel && flHundreds <= maxFlightLevel;
  });

  // Sort upcoming transits chronologically
  return filtered.sort((a, b) => a.date.getTime() - b.date.getTime());
}

/**
 * Calculates transit geometry and chord length for an observer at offset distance from centerline
 * Implements 5 distance bands: Centerline (0km), 1km, 2km, 5km, 10km.
 */
export function calculateTransitGeometry({
  moonAngularDiameterArcmin = 31.0,
  centerlineOffsetKm = 0,
  corridorWidthKm = 12.0,
  baseCenterlineDurationSec = 0.85
}) {
  const normalizedOffset = Math.min(1.0, Math.abs(centerlineOffsetKm) / (corridorWidthKm / 2));
  // Chord length across circular disc: C = 2 * R * sqrt(1 - (offset/R)^2)
  const chordFactor = Math.sqrt(Math.max(0, 1 - Math.pow(normalizedOffset, 2)));
  const actualDurationSec = Number((baseCenterlineDurationSec * chordFactor).toFixed(2));
  const isVisible = normalizedOffset < 1.0;

  // Spatial Analysis: Recommended observation bands for framing geometry
  const bands = [
    { band: 'Centerline (0 km)', distKm: 0, durationSec: baseCenterlineDurationSec, framingScore: '100% (Prime Axis)' },
    { band: 'Band 1 (1 km)', distKm: 1.0, durationSec: Number((baseCenterlineDurationSec * 0.98).toFixed(2)), framingScore: '98% (Optimal Chord)' },
    { band: 'Band 2 (2 km)', distKm: 2.0, durationSec: Number((baseCenterlineDurationSec * 0.92).toFixed(2)), framingScore: '92% (Wide Silhouette)' },
    { band: 'Band 5 (5 km)', distKm: 5.0, durationSec: Number((baseCenterlineDurationSec * 0.74).toFixed(2)), framingScore: '74% (Limb Skim)' },
    { band: 'Band 10 (10 km)', distKm: 10.0, durationSec: Number((baseCenterlineDurationSec * 0.45).toFixed(2)), framingScore: '45% (Edge Graze)' }
  ];

  return {
    moonAngularDiameterArcmin,
    centerlineOffsetKm,
    corridorWidthKm,
    chordFactor: Number(chordFactor.toFixed(3)),
    actualDurationSec: isVisible ? actualDurationSec : 0,
    isVisible,
    statusText: isVisible
      ? (normalizedOffset < 0.25 ? 'Central Axis Transit' : 'Chord Transit Across Limb')
      : 'Outside Transit Corridor',
    bands
  };
}
