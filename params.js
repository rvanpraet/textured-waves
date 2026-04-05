const PRINT_PRESETS = {
  preview: { w: 1000, h: 1000 },
  '20x20': { w: 2362, h: 2362 },
  a4:      { w: 2480, h: 3508 },
  '30x30': { w: 3543, h: 3543 },
  a3:      { w: 3508, h: 4960 },
  '40x50': { w: 4724, h: 5906 },
};

const DEFAULTS = Object.freeze({
  seed: 42,
  palette: 'delverStrata',
  printPreset: 'preview',
  layerCount: 10,
  noiseScaleX: 0.0015,
  noiseScaleY: 0.0011,
  noiseOctaves: 2,
  thresholdMin: 0.15,
  thresholdMax: 0.55,
  grainAmount: 0.12,
  rowsPerFrame: 8,
  circleSize: 4,
  circleProb: 0.197,
  circleAlphaMin: 17,
  circleAlphaMax: 35,
  blendMode: 'BLEND',
  useCollision: false,
  collisionGap: 2.0,
});

const STORAGE_KEY = 'genart_params_v1';

function getInitialParams() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return { ...DEFAULTS, ...JSON.parse(stored) };
    } catch (e) {
      console.error('Failed to parse stored params', e);
    }
  }
  return { ...DEFAULTS };
}

let params = getInitialParams();

function resetParams() {
  const seed = params.seed;
  params = { ...DEFAULTS, seed };
  localStorage.removeItem(STORAGE_KEY);
}

function saveCurrentAsDefault() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(params));
  alert('Configuration saved as default for next refresh!');
}
