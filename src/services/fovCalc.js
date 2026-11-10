// Field of View (FoV) & Crop Factor Computational Engine

import { SENSOR_PRESETS } from './opticalCalc.js';

export function calculateFoV(focalLengthMm = 50, sensorId = 'full-frame') {
  const sensor = SENSOR_PRESETS.find(s => s.id === sensorId) || SENSOR_PRESETS[0];
  const f = focalLengthMm;
  const w = sensor.width;
  const h = sensor.height;
  const d = Math.sqrt(w * w + h * h);

  // HFoV, VFoV, DFoV in degrees
  const hFovDeg = 2 * Math.atan(w / (2 * f)) * (180 / Math.PI);
  const vFovDeg = 2 * Math.atan(h / (2 * f)) * (180 / Math.PI);
  const dFovDeg = 2 * Math.atan(d / (2 * f)) * (180 / Math.PI);

  // 35mm equivalent focal length
  const equivalent35mmFocalLength = Math.round(f * sensor.crop);

  return {
    sensor,
    focalLengthMm: f,
    hFovDeg: Number(hFovDeg.toFixed(1)),
    vFovDeg: Number(vFovDeg.toFixed(1)),
    dFovDeg: Number(dFovDeg.toFixed(1)),
    equivalent35mmFocalLength
  };
}

export function compareAllSensors(focalLengthMm = 50) {
  return SENSOR_PRESETS.map(sensor => {
    const calc = calculateFoV(focalLengthMm, sensor.id);
    return {
      sensor,
      ...calc,
      // Scale percentage relative to Full Frame for visual bounding box overlay
      relativeScale: Number((1 / sensor.crop).toFixed(3))
    };
  });
}

export function matchFocalLength(focalLengthMm, sourceSensorId, targetSensorId) {
  const src = SENSOR_PRESETS.find(s => s.id === sourceSensorId) || SENSOR_PRESETS[0];
  const tgt = SENSOR_PRESETS.find(s => s.id === targetSensorId) || SENSOR_PRESETS[1];

  // f_target = f_source * (crop_source / crop_target)
  const matchedFocalLength = Number((focalLengthMm * (src.crop / tgt.crop)).toFixed(1));

  return {
    sourceSensor: src,
    targetSensor: tgt,
    sourceFocalLength: focalLengthMm,
    matchedFocalLength
  };
}

/**
 * Calculates Optimal, Minimal, and Maximum Focal Length based on:
 * - Subject Distance (meters)
 * - Subject Height (meters)
 * - Vertical Frame Coverage (%)
 * - Camera Sensor Type (sensor dimensions)
 * - Camera Sensor Megapixels (resolution & pixel density)
 */
export function calculateFocalLengthFromDistance({
  distanceMeters = 5.0,
  subjectHeightMeters = 1.8,
  frameCoveragePercent = 75,
  sensorId = 'full-frame',
  sensorMegapixels = 24
} = {}) {
  const sensor = SENSOR_PRESETS.find(s => s.id === sensorId) || SENSOR_PRESETS[0];
  const dMm = Math.max(10, distanceMeters * 1000);
  const hSubjMm = Math.max(10, subjectHeightMeters * 1000);
  const targetCoverageFrac = Math.min(1.0, Math.max(0.05, frameCoveragePercent / 100));

  // Compute pixel matrix from sensor dimensions and total megapixels
  const aspectRatio = sensor.width / sensor.height;
  const totalPixels = Math.max(1, sensorMegapixels) * 1000000;
  const vPixels = Math.round(Math.sqrt(totalPixels / aspectRatio));
  const hPixels = Math.round(vPixels * aspectRatio);
  const pixelPitchUm = Number(((sensor.height * 1000) / vPixels).toFixed(2));

  // 1. OPTIMAL FOCAL LENGTH:
  // Exact target vertical frame coverage
  const hImageOptimal = sensor.height * targetCoverageFrac;
  const fOptimal = (dMm * hImageOptimal) / (hSubjMm + hImageOptimal);

  // 2. MAXIMUM FOCAL LENGTH:
  // Tightest framing before subject clips top/bottom edges of the sensor.
  // Standard safe maximum coverage is 95% (allowing 2.5% safe margin on top & bottom)
  // or bounded proportionally if target coverage is already very high
  const maxCoverageFrac = Math.min(0.96, Math.max(0.90, targetCoverageFrac * 1.15));
  const hImageMax = sensor.height * maxCoverageFrac;
  const fMax = (dMm * hImageMax) / (hSubjMm + hImageMax);

  // 3. MINIMAL FOCAL LENGTH:
  // Widest framing allowing loose/environmental context without losing subject resolution.
  // Compositionally: ~70% of target coverage.
  // Resolution check: A high-MP sensor (45MP-61MP+) can resolve subjects at smaller coverage
  // and allows deep digital cropping in post, whereas lower MP requires higher coverage to maintain crispness.
  const minPixelsTarget = Math.min(1600, Math.round(vPixels * 0.35));
  const minCoverageFromMp = Math.max(0.18, minPixelsTarget / vPixels);
  const minCoverageFrac = Math.max(0.15, Math.min(targetCoverageFrac * 0.70, minCoverageFromMp));
  const hImageMin = sensor.height * minCoverageFrac;
  const fMin = (dMm * hImageMin) / (hSubjMm + hImageMin);

  // Subject pixel resolution
  const optimalSubjectPixels = Math.round(vPixels * targetCoverageFrac);
  const minSubjectPixels = Math.round(vPixels * minCoverageFrac);
  const maxSubjectPixels = Math.round(vPixels * maxCoverageFrac);

  // Standard commercial prime and zoom lens focal lengths
  const standardLenses = [14, 16, 20, 24, 28, 35, 40, 50, 70, 85, 105, 135, 150, 200, 300, 400, 500, 600, 800];
  const nearestPrime = standardLenses.reduce((prev, curr) =>
    Math.abs(curr - fOptimal) < Math.abs(prev - fOptimal) ? curr : prev
  );

  return {
    optimalFocalLengthMm: Number(fOptimal.toFixed(1)),
    minFocalLengthMm: Number(fMin.toFixed(1)),
    maxFocalLengthMm: Number(fMax.toFixed(1)),
    nearestPrimeMm: nearestPrime,
    sensor,
    sensorMegapixels,
    sensorResolution: {
      width: hPixels,
      height: vPixels,
      pixelPitchUm
    },
    coveragePercents: {
      optimal: Math.round(targetCoverageFrac * 100),
      min: Math.round(minCoverageFrac * 100),
      max: Math.round(maxCoverageFrac * 100)
    },
    subjectPixels: {
      optimal: optimalSubjectPixels,
      min: minSubjectPixels,
      max: maxSubjectPixels
    }
  };
}
