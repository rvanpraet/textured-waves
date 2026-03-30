// Print size presets (cm to pixels at 300dpi)
const PRINT_PRESETS = {
  preview:     { label: 'Preview (800x800)',  w: 800,  h: 800 },
  '10x10':     { label: '10x10cm @300dpi',    w: 1181, h: 1181 },
  '20x20':     { label: '20x20cm @300dpi',    w: 2362, h: 2362 },
  '20x30':     { label: '20x30cm @300dpi',    w: 2362, h: 3543 },
  '30x30':     { label: '30x30cm @300dpi',    w: 3543, h: 3543 },
  '30x40':     { label: '30x40cm @300dpi',    w: 3543, h: 4724 },
  '40x50':     { label: '40x50cm @300dpi',    w: 4724, h: 5906 },
  '4k_square': { label: '4000x4000',          w: 4000, h: 4000 },
};

// Default parameter values
const DEFAULTS = Object.freeze({
  seed: 3484,
  palette: 'palette4bis',
  printPreset: 'preview',
  stepAmount: 0.02,
  gapAmount: 0.005,
  noiseOffsetStrength: 1.2,
  noiseX: 0.016,
  noiseY: 0.0015,
  probability: 0.95,
  regionStartY: -0.25,
  regionEndY: 0.25,
  particleSizeMin: 0.25,
  particleSizeMax: 1.25,
  alphaMin: 0.2,
  alphaMax: 0.7,
  waveSlant: 0.33,
  noiseDecayBands: 30,
  densityCurve: 1.25,
  bandIrregularity: 0.2,
  particleTexture: 'particle3',
});

// Current parameters (mutable copy of defaults)
let params = { ...DEFAULTS };

function resetParams() {
  Object.assign(params, DEFAULTS);
}
