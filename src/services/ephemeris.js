import SunCalc from 'suncalc';

export const MOON_PHASE_NAMES = [
  'New Moon',
  'Waxing Crescent',
  'First Quarter',
  'Waxing Gibbous',
  'Full Moon',
  'Waning Gibbous',
  'Last Quarter',
  'Waning Crescent'
];

export function getMoonPhaseName(phase) {
  // phase goes from 0.0 to 1.0
  if (phase <= 0.02 || phase >= 0.98) return 'New Moon';
  if (phase < 0.23) return 'Waxing Crescent';
  if (phase <= 0.27) return 'First Quarter';
  if (phase < 0.48) return 'Waxing Gibbous';
  if (phase <= 0.52) return 'Full Moon';
  if (phase < 0.73) return 'Waning Gibbous';
  if (phase <= 0.77) return 'Last Quarter';
  return 'Waning Crescent';
}

export function radToDeg(rad) {
  return (rad * 180) / Math.PI;
}

export function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

export function formatTime(date) {
  if (!date || isNaN(new Date(date).getTime())) return '--:--';
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(new Date(date));
}

export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }).format(new Date(date));
}

export function getSunAndMoonData(date = new Date(), lat = 33.749, lng = -84.388) {
  // Sun calculation
  const sunPos = SunCalc.getPosition(date, lat, lng);
  const sunTimes = SunCalc.getTimes(date, lat, lng);
  
  // Moon calculation
  const moonPos = SunCalc.getMoonPosition(date, lat, lng);
  const moonIllum = SunCalc.getMoonIllumination(date);
  const moonTimes = SunCalc.getMoonTimes(date, lat, lng);

  // Convert Azimuth (SunCalc returns azimuth in radians measured from South to West)
  // Standard navigational compass azimuth: 0° North, 90° East, 180° South, 270° West
  const sunAzimuthCompass = (radToDeg(sunPos.azimuth) + 180) % 360;
  const sunAltitudeDeg = radToDeg(sunPos.altitude);

  const moonAzimuthCompass = (radToDeg(moonPos.azimuth) + 180) % 360;
  const moonAltitudeDeg = radToDeg(moonPos.altitude);

  // Lunar distance in km and angular diameter
  const moonDistanceKm = Math.round(moonPos.distance);
  // Average distance ~384,400 km. Perigee ~356,500 km (Supermoon). Apogee ~406,700 km (Micromoon)
  const isSupermoon = moonDistanceKm < 360000 && moonIllum.fraction > 0.9;
  const moonAngularDiameterArcmin = (1873.7 / (moonDistanceKm / 1000)).toFixed(1);

  // Shadow Length factor: length = height / tan(altitude)
  let shadowFactor = null;
  if (sunAltitudeDeg > 0) {
    shadowFactor = 1 / Math.tan(degToRad(sunAltitudeDeg));
  }

  // Galactic Center visibility (Milky Way)
  // Galactic Center RA ~ 17h 45.6m, Dec ~ -29° 00'
  // Approximation for current observer location
  const isNight = sunAltitudeDeg < -18; // Astronomical twilight
  const milkyWayAltitude = Math.sin(degToRad(lat)) * Math.sin(degToRad(-29)) +
    Math.cos(degToRad(lat)) * Math.cos(degToRad(-29)) * Math.cos(degToRad((date.getUTCHours() + date.getUTCMinutes() / 60) * 15 - 80));
  const milkyWayAltDeg = radToDeg(Math.asin(Math.max(-1, Math.min(1, milkyWayAltitude))));
  const galacticCenterVisible = isNight && milkyWayAltDeg > 0 && moonIllum.fraction < 0.45;

  return {
    date,
    lat,
    lng,
    sun: {
      altitudeDeg: Number(sunAltitudeDeg.toFixed(2)),
      azimuthCompass: Number(sunAzimuthCompass.toFixed(2)),
      times: {
        sunrise: sunTimes.sunrise,
        sunset: sunTimes.sunset,
        goldenHour: sunTimes.goldenHour,
        goldenHourEnd: sunTimes.goldenHourEnd,
        blueHourDawnStart: sunTimes.dawn,
        blueHourDuskEnd: sunTimes.dusk,
        solarNoon: sunTimes.solarNoon,
        nadir: sunTimes.nadir,
        nauticalDawn: sunTimes.nauticalDawn,
        nauticalDusk: sunTimes.nauticalDusk,
        astronomicalDawn: sunTimes.nightEnd,
        astronomicalDusk: sunTimes.night
      },
      shadowFactor: shadowFactor ? Number(shadowFactor.toFixed(2)) : null
    },
    moon: {
      altitudeDeg: Number(moonAltitudeDeg.toFixed(2)),
      azimuthCompass: Number(moonAzimuthCompass.toFixed(2)),
      distanceKm: moonDistanceKm,
      angularDiameterArcmin: Number(moonAngularDiameterArcmin),
      isSupermoon,
      illumination: {
        fraction: Number(moonIllum.fraction.toFixed(3)),
        percentage: Math.round(moonIllum.fraction * 100),
        phase: Number(moonIllum.phase.toFixed(3)),
        angle: Number(radToDeg(moonIllum.angle).toFixed(1)),
        phaseName: getMoonPhaseName(moonIllum.phase)
      },
      times: {
        rise: moonTimes.rise,
        set: moonTimes.set,
        alwaysUp: moonTimes.alwaysUp,
        alwaysDown: moonTimes.alwaysDown
      }
    },
    milkyWay: {
      altitudeDeg: Number(milkyWayAltDeg.toFixed(1)),
      visible: galacticCenterVisible,
      qualityScore: galacticCenterVisible ? (moonIllum.fraction < 0.15 ? 'Optimal' : 'Acceptable') : 'Poor / Hidden'
    }
  };
}
