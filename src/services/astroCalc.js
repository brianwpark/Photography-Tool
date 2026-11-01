// Astrophotography Computational Engine: 500 Rule, NPF Rule, Hyperlapse & Star Trails

export const ASTRO_CAMERAS = [
  { id: 'sony-a7rv', name: 'Sony A7R V (61 MP)', crop: 1.0, pitch: 3.76 },
  { id: 'sony-a7iv', name: 'Sony A7 IV (33 MP)', crop: 1.0, pitch: 5.12 },
  { id: 'sony-a7siii', name: 'Sony A7S III (12 MP)', crop: 1.0, pitch: 8.40 },
  { id: 'canon-r5', name: 'Canon EOS R5 / R5 II (45 MP)', crop: 1.0, pitch: 4.39 },
  { id: 'canon-r6ii', name: 'Canon EOS R6 II (24 MP)', crop: 1.0, pitch: 6.00 },
  { id: 'nikon-z8-z9', name: 'Nikon Z8 / Z9 (45.7 MP)', crop: 1.0, pitch: 4.35 },
  { id: 'nikon-z6iii', name: 'Nikon Z6 III (24.5 MP)', crop: 1.0, pitch: 5.94 },
  { id: 'fuji-xt5', name: 'Fujifilm X-T5 / X-H2 (40 MP APS-C)', crop: 1.5, pitch: 3.04 },
  { id: 'fuji-xt4', name: 'Fujifilm X-T4 (26 MP APS-C)', crop: 1.5, pitch: 3.76 },
  { id: 'om-1', name: 'OM System OM-1 (20 MP MFT)', crop: 2.0, pitch: 3.30 },
  { id: 'generic-ff-24', name: 'Generic Full Frame 24 MP', crop: 1.0, pitch: 5.94 },
  { id: 'generic-apsc-24', name: 'Generic APS-C 24 MP', crop: 1.5, pitch: 3.92 }
];

export function calculateSpotStars({
  focalLengthMm = 14,
  aperture = 2.8,
  cameraId = 'sony-a7iv',
  customPitch = null,
  customCrop = null,
  declinationDeg = 0
}) {
  const camera = ASTRO_CAMERAS.find(c => c.id === cameraId) || ASTRO_CAMERAS[1];
  const crop = customCrop || camera.crop;
  const pitch = customPitch || camera.pitch;
  const f = focalLengthMm;
  const N = aperture;

  // 1. Classic 500 Rule
  // t_500 = 500 / (f * crop)
  const rule500Seconds = 500 / (f * crop);

  // 2. Accurate NPF Rule
  // t_npf = (35 * N + 30 * pitch) / (f * cos(declination))
  const cosDec = Math.max(0.1, Math.cos((declinationDeg * Math.PI) / 180));
  const npfSeconds = (35 * N + 30 * pitch) / (f * cosDec);

  // 3. Recommended practical shutter speed (snapped to standard camera increment or rounded)
  const recommendedNPF = Number(npfSeconds.toFixed(1));
  const recommended500 = Number(rule500Seconds.toFixed(1));

  return {
    camera,
    focalLengthMm: f,
    aperture: N,
    pixelPitchMicrons: pitch,
    cropFactor: crop,
    declinationDeg,
    rule500Seconds: recommended500,
    npfSeconds: recommendedNPF,
    differencePercent: Math.round(((rule500Seconds - npfSeconds) / rule500Seconds) * 100),
    warning: recommended500 > recommendedNPF * 1.5
      ? 'The 500 Rule will show noticeable trailing on high-resolution modern sensors. Use the NPF Rule for pinpoint stars.'
      : 'Good balance for wide-field astrophotography.'
  };
}

export function calculateHyperlapseSuite({
  targetVideoSeconds = 15,
  fps = 24,
  intervalSeconds = 5,
  targetRotationAngleDeg = 45,
  rawFileSizeMB = 35
}) {
  // Total frames needed
  const totalFrames = targetVideoSeconds * fps;

  // Total shooting session time in seconds
  const totalShootingSeconds = totalFrames * intervalSeconds;
  const totalShootingMinutes = Number((totalShootingSeconds / 60).toFixed(1));
  const totalShootingHours = Number((totalShootingSeconds / 3600).toFixed(2));

  // Celestial Star Rotation Angle (Earth turns ~15.04 degrees/hour or 0.25 deg/min)
  const earthRotationRateDegPerHour = 15.041;
  const resultingStarRotationDeg = Number((totalShootingHours * earthRotationRateDegPerHour).toFixed(1));

  // Required interval if user specifically wants a designated star rotation angle
  const requiredShootingHoursForTargetAngle = targetRotationAngleDeg / earthRotationRateDegPerHour;
  const requiredIntervalSeconds = Math.max(1, Math.round((requiredShootingHoursForTargetAngle * 3600) / totalFrames));

  // Memory card storage requirements
  const totalStorageMB = totalFrames * rawFileSizeMB;
  const totalStorageGB = Number((totalStorageMB / 1024).toFixed(2));

  // Estimated battery capacity (assuming standard mirrorless ~400-500 shots per battery)
  const batteriesEstimated = Math.max(1, Math.ceil(totalFrames / 450));

  return {
    targetVideoSeconds,
    fps,
    intervalSeconds,
    totalFrames,
    totalShootingSeconds,
    totalShootingMinutes,
    totalShootingHours,
    resultingStarRotationDeg,
    targetRotationAngleDeg,
    requiredIntervalSeconds,
    totalStorageGB,
    batteriesEstimated
  };
}

export function calculateStarTrails({
  desiredArcDeg = 45,
  subExposureSeconds = 25,
  gapSeconds = 1
}) {
  // Earth rotates ~15 deg/hr
  const totalHoursNeeded = desiredArcDeg / 15.041;
  const totalSecondsNeeded = totalHoursNeeded * 3600;

  const cycleTime = subExposureSeconds + gapSeconds;
  const totalShots = Math.ceil(totalSecondsNeeded / cycleTime);

  const totalMinutes = Math.round(totalSecondsNeeded / 60);

  return {
    desiredArcDeg,
    subExposureSeconds,
    gapSeconds,
    totalHoursNeeded: Number(totalHoursNeeded.toFixed(2)),
    totalMinutes,
    totalShots,
    formattedDuration: `${Math.floor(totalHoursNeeded)}h ${Math.round((totalHoursNeeded % 1) * 60)}m`
  };
}
