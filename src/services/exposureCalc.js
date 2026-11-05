// Exposure Reciprocity & Neutral Density (ND) Filter Computational Engine

export const BASE_SHUTTERS = [
  { label: '1/8000s', value: 1 / 8000 },
  { label: '1/4000s', value: 1 / 4000 },
  { label: '1/2000s', value: 1 / 2000 },
  { label: '1/1000s', value: 1 / 1000 },
  { label: '1/500s', value: 1 / 500 },
  { label: '1/250s', value: 1 / 250 },
  { label: '1/125s', value: 1 / 125 },
  { label: '1/60s', value: 1 / 60 },
  { label: '1/30s', value: 1 / 30 },
  { label: '1/15s', value: 1 / 15 },
  { label: '1/8s', value: 1 / 8 },
  { label: '1/4s', value: 1 / 4 },
  { label: '1/2s', value: 0.5 },
  { label: '1s', value: 1.0 },
  { label: '2s', value: 2.0 },
  { label: '4s', value: 4.0 },
  { label: '8s', value: 8.0 },
  { label: '15s', value: 15.0 },
  { label: '30s', value: 30.0 }
];

export const ND_PRESETS = [
  { id: 'none', label: 'Clear (0 Stops)', stops: 0, factor: 1 },
  { id: 'nd8', label: 'ND8 (3 Stops)', stops: 3, factor: 8 },
  { id: 'nd16', label: 'ND16 (4 Stops)', stops: 4, factor: 16 },
  { id: 'nd32', label: 'ND32 (5 Stops)', stops: 5, factor: 32 },
  { id: 'nd64', label: 'ND64 (6 Stops)', stops: 6, factor: 64 },
  { id: 'nd256', label: 'ND256 (8 Stops)', stops: 8, factor: 256 },
  { id: 'nd500', label: 'ND500 (9 Stops)', stops: 9, factor: 512 },
  { id: 'nd1000', label: 'ND1000 (10 Stops)', stops: 10, factor: 1024 },
  { id: 'nd32000', label: 'ND32K (15 Stops)', stops: 15, factor: 32768 },
  { id: 'nd1m', label: 'ND1M Solar (20 Stops)', stops: 20, factor: 1048576 }
];

export function calculateNDExposure(baseSeconds, totalStops) {
  // Reciprocity Law: T_nd = T_base * 2^stops
  const multiplier = Math.pow(2, totalStops);
  const targetSeconds = baseSeconds * multiplier;

  return {
    baseSeconds,
    totalStops,
    multiplier,
    targetSeconds,
    formatted: formatDuration(targetSeconds),
    isBulb: targetSeconds > 30
  };
}

export function formatDuration(totalSeconds) {
  if (totalSeconds < 1) {
    if (totalSeconds >= 0.5) return '1/2s';
    const denominator = Math.round(1 / totalSeconds);
    return `1/${denominator}s`;
  }

  const s = Math.round(totalSeconds);
  if (s < 60) return `${s}s`;

  const hours = Math.floor(s / 3600);
  const minutes = Math.floor((s % 3600) / 60);
  const remainingSeconds = s % 60;

  const pad = n => String(n).padStart(2, '0');

  if (hours > 0) {
    return `${pad(hours)}h ${pad(minutes)}m ${pad(remainingSeconds)}s`;
  }
  return `${pad(minutes)}m ${pad(remainingSeconds)}s`;
}

export function calculateEV(aperture, shutterSeconds, iso = 100) {
  // EV = log2(N^2 / t) - log2(ISO / 100)
  const ev100 = Math.log2((aperture * aperture) / shutterSeconds);
  const isoOffset = Math.log2(iso / 100);
  return Number((ev100 - isoOffset).toFixed(1));
}

export function calculateEquivalentExposure({
  testShutterSeconds = 1 / 125,
  testAperture = 2.8,
  testIso = 6400,
  testNdStops = 0,
  targetAperture = 8.0,
  targetIso = 100,
  targetNdStops = 10
}) {
  const apertureRatio = (targetAperture * targetAperture) / (testAperture * testAperture);
  const isoRatio = testIso / targetIso;
  const ndMultiplier = Math.pow(2, targetNdStops - testNdStops);
  const targetSeconds = testShutterSeconds * apertureRatio * isoRatio * ndMultiplier;

  return {
    testShutterSeconds,
    testAperture,
    testIso,
    testNdStops,
    targetAperture,
    targetIso,
    targetNdStops,
    targetSeconds,
    formatted: formatDuration(targetSeconds),
    isBulb: targetSeconds > 30,
    evOffset: Number(Math.log2(apertureRatio * (1 / isoRatio) * ndMultiplier).toFixed(1))
  };
}

