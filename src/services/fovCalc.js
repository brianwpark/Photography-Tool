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
