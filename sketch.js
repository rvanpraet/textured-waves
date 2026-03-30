// Constants
const GRAIN_BASE_SCALE = 0.002;
const GRAIN_SWAY_SCALE = 0.0005;

// Render state
let textures = {};
let particleTexture;
let palette;
let isRendering = false;
let renderFrame = 0;
let rowPos = 0;
let y, startX, startY, endX, endY;
let step, gap, stepAmount, gapAmount, stepCounter;
let grainWeight, increment;
let prevColor, currentColor, nextColor;
let gradientProb;

function preload() {
  textures = {
    particle1: loadImage('/assets/particle1.png'),
    particle2: loadImage('/assets/particle2.png'),
    particle3: loadImage('/assets/particle3.png'),
  };
}

function setup() {
  const preset = PRINT_PRESETS[params.printPreset];
  const canvas = createCanvas(preset.w, preset.h, WEBGL);
  canvas.parent('canvas-container');
  buildUI();
  regenerate();
}

function draw() {
  if (!isRendering) return;

  // Grain size oscillates slightly per frame
  grainWeight = width * GRAIN_BASE_SCALE + cos(renderFrame * 2) * width * GRAIN_SWAY_SCALE;
  increment = grainWeight * 0.5 + sin(renderFrame * 2) * grainWeight * 0.25;

  // Gradient probability based on position within current band
  gradientProb = map(stepCounter, step, 0, -0.5, 0.5);

  // Draw one horizontal scan line
  drawLine({
    x1: startX,
    y1: y,
    x2: endX + map(y, startY, endY, 0, width * params.waveSlant),
    y2: y,
    color: currentColor,
    alphaRnd: [params.alphaMin, params.alphaMax],
    weightRnd: grainWeight,
    probability: params.probability,
    useNoise: true,
    noiseX: params.noiseX,
    noiseY: params.noiseY,
  });

  // Advance scan position
  y += increment;
  stepCounter -= increment;

  // Band boundary: shift colors and adjust step/gap
  if (stepCounter <= 1) {
    prevColor = currentColor;
    currentColor = nextColor;
    nextColor = sampleArray(palette.colors);

    step += random(-ceil(stepAmount) * params.bandIrregularity, ceil(stepAmount) * params.bandIrregularity);
    gap += random(-ceil(gapAmount) * (params.bandIrregularity * 0.5), ceil(gapAmount) * (params.bandIrregularity * 0.4));

    stepCounter = abs(step);
    y += abs(gap);
    rowPos++;
  }

  renderFrame++;

  // Update progress
  const progress = map(y, startY, endY, 0, 100);
  updateProgress(progress);

  // Done
  if (y > endY) {
    isRendering = false;
    noLoop();
    updateProgress(100);
  }
}

function regenerate() {
  // Seed for reproducibility
  randomSeed(params.seed);
  noiseSeed(params.seed);

  // Palette and texture
  palette = PALETTES[params.palette];
  particleTexture = textures[params.particleTexture];

  // Resize canvas if preset changed
  const preset = PRINT_PRESETS[params.printPreset];
  if (width !== preset.w || height !== preset.h) {
    resizeCanvas(preset.w, preset.h);
  }

  // Canvas setup
  blendMode(ADD);
  background(palette.bg);

  // Drawing region (WEBGL origin is center)
  startX = -width * 0.5;
  endX = 0;
  startY = height * params.regionStartY;
  endY = height * params.regionEndY;
  y = startY;

  // Band dimensions
  stepAmount = height * params.stepAmount;
  gapAmount = height * params.gapAmount;
  step = ceil(stepAmount);
  gap = ceil(gapAmount);
  stepCounter = abs(step);

  // Initial colors
  prevColor = sampleArray(palette.colors);
  currentColor = sampleArray(palette.colors);
  nextColor = sampleArray(palette.colors);

  // Reset render state
  rowPos = 0;
  renderFrame = 0;
  isRendering = true;

  updateProgress(0);
  loop();
}

function exportImage() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const preset = PRINT_PRESETS[params.printPreset];
  const paletteName = params.palette;
  const filename = `dunes_s${params.seed}_${paletteName}_${preset.w}x${preset.h}_${timestamp}`;
  saveCanvas(filename, 'png');
}
