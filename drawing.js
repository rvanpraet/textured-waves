function sampleArray(arr) {
  return arr[floor(random(arr.length))];
}

/**
 * Interpolate a palette's colors into exactly `count` evenly spaced stops.
 */
function interpolateColors(paletteColors, count) {
  const result = [];
  for (let i = 0; i < count; i++) {
    const t = count > 1 ? i / (count - 1) : 0;
    const idx = t * (paletteColors.length - 1);
    const lo = floor(idx);
    const hi = min(ceil(idx), paletteColors.length - 1);
    result.push(lerpColor(color(paletteColors[lo]), color(paletteColors[hi]), idx - lo));
  }
  return result;
}

/**
 * Build evenly spaced threshold values between lo and hi.
 */
function buildThresholds(count, lo, hi) {
  const t = [];
  for (let i = 0; i < count; i++) {
    t.push(map(i, 0, count - 1, lo, hi));
  }
  return t;
}

/**
 * Return the deepest layer index whose threshold the noise value exceeds.
 * Returns -1 if below all thresholds (background).
 */
function getLayer(noiseVal, thresholds) {
  let layer = -1;
  for (let i = 0; i < thresholds.length; i++) {
    if (noiseVal > thresholds[i]) layer = i;
  }
  return layer;
}
