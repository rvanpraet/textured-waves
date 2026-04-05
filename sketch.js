let palette;
let layerColors = [];
let thresholds = [];
let isRendering = false;
let currentRow = 0;

function setup() {
  const preset = PRINT_PRESETS[params.printPreset];
  pixelDensity(1);
  const canvas = createCanvas(preset.w, preset.h);
  canvas.parent("canvas-container");
  buildUI();
  
  // Initial background draw
  palette = PALETTES[params.palette];
  background(palette.bg);
  
  regenerate();
}

let grid = [];
let gridSize = 20;

function regenerate() {
  randomSeed(params.seed);
  noiseSeed(params.seed);
  noiseDetail(params.noiseOctaves, 0.5);

  palette = PALETTES[params.palette];
  layerColors = interpolateColors(palette.colors, params.layerCount);
  thresholds = buildThresholds(params.layerCount, params.thresholdMin, params.thresholdMax);

  const preset = PRINT_PRESETS[params.printPreset];
  if (width !== preset.w || height !== preset.h) {
    resizeCanvas(preset.w, preset.h);
  }

  // Initialize collision grid
  gridSize = ceil(params.circleSize + params.collisionGap);
  const cols = ceil(width / gridSize);
  const rows = ceil(height / gridSize);
  grid = Array.from({ length: cols * rows }, () => []);

  currentRow = 0;
  isRendering = true;
  updateProgress(0);
  loop();
}

function draw() {
  if (!isRendering) return;

  const batchEnd = min(currentRow + params.rowsPerFrame, height);

  // Base fill via circle based rendering on every pixel
  blendMode(window[params.blendMode] ?? BLEND);
  noStroke();
  for (let py = currentRow; py < batchEnd; py++) {
    for (let px = 0; px < width; px++) {
      if (random() > params.circleProb) continue;

      const size = random(1, params.circleSize);

      if (params.useCollision) {
        const gx = floor(px / gridSize);
        const gy = floor(py / gridSize);
        const gCols = ceil(width / gridSize);
        let collision = false;

        // Check neighbors
        for (let x = -1; x <= 1; x++) {
          for (let y = -1; y <= 1; y++) {
            const idx = gx + x + (gy + y) * gCols;
            if (grid[idx]) {
              for (const p of grid[idx]) {
                const d = dist(px, py, p.x, p.y);
                if (d < (size + p.size) / 2 + params.collisionGap) {
                  collision = true;
                  break;
                }
              }
            }
            if (collision) break;
          }
          if (collision) break;
        }

        if (collision) continue;

        // Store in grid
        grid[gx + gy * gCols].push({ x: px, y: py, size: size });
      }

      const n = noise(px * params.noiseScaleX, py * params.noiseScaleY);
      const layer = getLayer(n, thresholds);

      // Skip drawing on the background layer
      if (layer < 1) continue;

      const col = layerColors[layer];

      const grain = 1 + (random() - 0.5) * params.grainAmount;

      fill(
        constrain(red(col) * grain, 0, 255),
        constrain(green(col) * grain, 0, 255),
        constrain(blue(col) * grain, 0, 255),
        random(params.circleAlphaMin, params.circleAlphaMax),
      );
      circle(px, py, size);
    }
  }

  currentRow = batchEnd;
  updateProgress((currentRow / height) * 100);

  if (currentRow >= height) {
    isRendering = false;
    noLoop();
    updateProgress(100);
  }
}

function exportImage() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
  const preset = PRINT_PRESETS[params.printPreset];
  const filename = `noise_layers_s${params.seed}_${preset.w}x${preset.h}_${timestamp}`;
  saveCanvas(filename, "png");
}

function clearCanvas() {
  isRendering = false;
  noLoop();
  blendMode(BLEND);
  background(palette.bg);
  currentRow = 0;
  updateProgress(0);
}
