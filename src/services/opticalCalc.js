// Optical Depth of Field & Hyperfocal Computational Engine

export const SENSOR_PRESETS = [
  { id: 'full-frame', name: 'Full Frame (36x24 mm)', crop: 1.0, coc: 0.029, width: 36, height: 24 },
  { id: 'apsc-sony', name: 'APS-C Sony / Nikon / Fuji (1.5x)', crop: 1.5, coc: 0.019, width: 23.5, height: 15.6 },
  { id: 'apsc-canon', name: 'APS-C Canon (1.6x)', crop: 1.6, coc: 0.018, width: 22.2, height: 14.8 },
  { id: 'mft', name: 'Micro Four Thirds (2.0x)', crop: 2.0, coc: 0.015, width: 17.3, height: 13.0 },
  { id: 'medium-format', name: 'Medium Format 44x33 mm (0.79x)', crop: 0.79, coc: 0.037, width: 44, height: 33 },
  { id: 'one-inch', name: '1-inch Sensor (2.7x)', crop: 2.7, coc: 0.011, width: 13.2, height: 8.8 },
  { id: 'smartphone', name: 'Smartphone 1/1.3" (3.8x)', crop: 3.8, coc: 0.008, width: 9.6, height: 7.2 }
];

// Complete photographic 1/3-stop aperture scale (f/1.0 through f/45)
export const APERTURE_STOPS = [
  1.0, 1.1, 1.2,
  1.4, 1.6, 1.8,
  2.0, 2.2, 2.5,
  2.8, 3.2, 3.5,
  4.0, 4.5, 5.0,
  5.6, 6.3, 7.1,
  8.0, 9.0, 10,
  11, 13, 14,
  16, 18, 20,
  22, 25, 29,
  32, 36, 40,
  45
];

export const FULL_APERTURE_STOPS = [
  1.0, 1.4, 2.0, 2.8, 4.0, 5.6, 8.0, 11, 16, 22, 32
];

export const COMMON_FOCAL_LENGTHS = [
  12, 14, 16, 20, 24, 28, 35, 50, 70, 85, 105, 135, 200, 300, 400, 600
];


export function calculateDoF({
  focalLengthMm = 50,
  aperture = 2.8,
  distanceMeters = 3.0,
  sensorId = 'full-frame',
  customCoC = null
}) {
  const sensor = SENSOR_PRESETS.find(s => s.id === sensorId) || SENSOR_PRESETS[0];
  const coc = customCoC || sensor.coc;
  
  const f = focalLengthMm;
  const N = aperture;
  const s = distanceMeters * 1000; // convert to mm
  const c = coc;

  // Hyperfocal Distance H (mm)
  // Formula: H = (f^2 / (N * c)) + f
  const H_mm = (f * f) / (N * c) + f;
  const hyperfocalMeters = H_mm / 1000;

  // Near Sharp Limit Dn (mm)
  // Dn = (s * (H - f)) / (H + s - 2f)
  let near_mm = (s * (H_mm - f)) / (H_mm + s - (2 * f));
  if (near_mm < 0) near_mm = 0;
  const nearLimitMeters = near_mm / 1000;

  // Far Sharp Limit Df (mm)
  // Df = (s * (H - f)) / (H - s) if H > s, else Infinity
  let farLimitMeters = Infinity;
  let isInfinite = false;

  if (s >= (H_mm - f)) {
    isInfinite = true;
    farLimitMeters = Infinity;
  } else {
    const far_mm = (s * (H_mm - f)) / (H_mm - s);
    farLimitMeters = far_mm / 1000;
  }

  // Total Depth of Field
  const totalDofMeters = isInfinite ? Infinity : farLimitMeters - nearLimitMeters;

  // In Front & Behind Subject Percentages
  let inFrontPercent = 50;
  let behindPercent = 50;
  if (!isInfinite && totalDofMeters > 0) {
    const frontDist = distanceMeters - nearLimitMeters;
    const behindDist = farLimitMeters - distanceMeters;
    inFrontPercent = Math.max(0, Math.min(100, Math.round((frontDist / totalDofMeters) * 100)));
    behindPercent = 100 - inFrontPercent;
  } else if (isInfinite) {
    inFrontPercent = 33;
    behindPercent = 67;
  }

  return {
    sensor,
    focalLengthMm: f,
    aperture: N,
    distanceMeters,
    cocMm: c,
    hyperfocalMeters: Number(hyperfocalMeters.toFixed(2)),
    nearLimitMeters: Number(nearLimitMeters.toFixed(2)),
    farLimitMeters: isInfinite ? 'Infinity' : Number(farLimitMeters.toFixed(2)),
    totalDofMeters: isInfinite ? 'Infinity' : Number(totalDofMeters.toFixed(2)),
    isInfinite,
    inFrontPercent,
    behindPercent
  };
}

// Generate complete Hyperfocal & DoF matrix across apertures and focal lengths
export function generateDofMatrix(sensorId = 'full-frame', distanceMeters = 3.0, useThirdStops = true) {
  const apertures = useThirdStops ? APERTURE_STOPS.filter(a => a <= 22) : FULL_APERTURE_STOPS;
  const focalLengths = [14, 24, 35, 50, 85, 135, 200];

  const matrix = focalLengths.map(f => {
    const row = { focalLength: f, stops: {} };
    apertures.forEach(N => {
      const calc = calculateDoF({
        focalLengthMm: f,
        aperture: N,
        distanceMeters,
        sensorId
      });
      row.stops[N] = {
        hyperfocal: calc.hyperfocalMeters,
        near: calc.nearLimitMeters,
        far: calc.farLimitMeters,
        total: calc.totalDofMeters
      };
    });
    return row;
  });

  return { apertures, focalLengths, matrix };
}

// Generate pure Hyperfocal Distance matrix across focal lengths and apertures
export function generateHyperfocalMatrix(sensorId = 'full-frame', useThirdStops = true) {
  const apertures = useThirdStops ? APERTURE_STOPS.filter(a => a <= 22) : FULL_APERTURE_STOPS;
  const focalLengths = [12, 14, 16, 20, 24, 28, 35, 50, 70, 85, 105, 135, 200, 300];

  const matrix = focalLengths.map(f => {
    const row = { focalLength: f, stops: {} };
    apertures.forEach(N => {
      const calc = calculateDoF({
        focalLengthMm: f,
        aperture: N,
        distanceMeters: 10.0,
        sensorId
      });
      row.stops[N] = calc.hyperfocalMeters;
    });
    return row;
  });

  return { apertures, focalLengths, matrix };
}


