let rows;
let cols;
let palette;
let rowPos = 0;
let step;
let gap;
let grainWeight;
let prevColor;
let currentColor;
let nextColor;
let gradientProb;
let particleTexture;
let gapAmount;
let stepAmount;
let stepCounter;
let increment = 5;
let y;
let startY;
let endY;
let startX;
let endX;
let noiseOffsetStrength = 1.2;

const TOTAL_FRAMES = 10;

// Load the image.
function preload() {
  particleTexture = loadImage("/assets/particle3.png");
}

function setup() {
  noiseSeed(3484);
  palette = palette4bis; // Pick palette

  // frameRate(24)
  // Setup canvas // 3840 x 2160 for hi-res
  // createCanvas(720, 720, WEBGL);
  // createCanvas(3000, 4000, WEBGL);
  createCanvas(4000, 4000, WEBGL);

  blendMode(ADD);
  background(palette.bg);
  //   background(0xffffff);

  // Start and end
  startX = -width * 0.5;
  endX = 0;
  startY = -height * 0.25;
  endY = height * 0.25;
  y = startY;

  // Step and gap setup
  stepAmount = height * 0.02;
  gapAmount = height * 0.005;
  step = ceil(stepAmount); // Step influences how thick the rows are, as well as the gap between the rows
  gap = ceil(gapAmount);
  stepCounter = abs(step);

  // Color setup
  prevColor = sampleArray(palette.colors);
  currentColor = sampleArray(palette.colors);
  nextColor = sampleArray(palette.colors);
}

function draw() {
  // Grain weight based on canvas size
  grainWeight = width * 0.002 + cos(frameCount * 2) * width * 0.0005;

  increment = grainWeight * 0.5 + sin(frameCount * 2) * grainWeight * 0.25;

  // Calculate if y is near the edge of a previous row, and generate probability for color interchanges
  gradientProb = map(stepCounter, step, 0, -0.5, 0.5);

  drawLine({
    x1: startX,
    y1: y,
    x2: endX + map(y, startY, endY, 0, width * 0.33),
    y2: y,
    color: currentColor,
    alphaRnd: [0.2, 0.7],
    weightRnd: grainWeight,
    probability: 0.95,
    shouldContrast: false,
    useNoise: true,
    noiseX: 0.016,
    noiseY: 0.0015,
  });

  // Adjust remaining step counter
  y += increment;
  stepCounter -= increment;

  if (stepCounter <= 1) {
    // Shift colors
    prevColor = currentColor;
    currentColor = nextColor;
    nextColor = sampleArray(palette.colors);

    // Change step and gap value
    step += random(-ceil(stepAmount) * 0.2, ceil(stepAmount) * 0.2);
    gap += random(-ceil(gapAmount) * 0.1, ceil(gapAmount) * 0.08);

    // Reset step counter
    // Move y value forward, creating a gap
    stepCounter = abs(step);
    y += abs(gap);

    // Keep track of the amount of step row positions
    rowPos++;
  }

  if (y > endY) {
    console.log("done");
    noLoop();
    save("dunes.tiff");
  }
}

function drawWaves() {
  prevColor = sampleArray(palette.colors);
  currentColor = sampleArray(palette.colors);
  nextColor = sampleArray(palette.colors);

  let stepCounter = abs(step);
  let probability = 0.8;
  let increment = 5;

  for (let y = -height * 0.6; y <= height * 0.6; y += increment) {
    let EDGE_OFFSET = random() * width * 0.275;

    drawLine({
      x1: floor(-width * 0.6),
      //   y1: y + sin(rowPos) * width * 0.03,
      y1: y,
      x2: floor(width * 0.6),
      y2: y,
      //   y2: y + cos(rowPos) * width * 0.03,
      color: currentColor,
      alphaRnd: [0.2, 0.7],
      weightRnd: grainWeight,
      probability: 0.85,
      shouldContrast: false,
      useNoise: true,
      //   yOffset: 500,
      // yOffset: map( random(), 0, 1, 40, 120 ),
      noiseX: 0.016,
      noiseY: 0.0015,
    });

    // Calculate if y is near the edge of a previous row, and generate probability for color interchanges
    stepCounter -= increment;
    gradientProb = map(stepCounter, step, 0, -0.3, 0.3);

    if (stepCounter <= 1) {
      // Shift colors
      prevColor = currentColor;
      currentColor = nextColor;
      nextColor = sampleArray(palette.colors); // Change random color

      // Increase or decrease step, reset step counter and shift y value forward, creating a gap
      const skipStep = random(-ceil(stepAmount) * 2, ceil(stepAmount) * 4);
      step += skipStep;
      stepCounter = abs(step);
      y += abs(skipStep);

      rowPos++;
    }
  }
}

function drawSquare() {
  const props = {
    weight: 50,
    color: palette.contrast,
    alphaRnd: [0.15, 0.5],
    weightRnd: grainWeight,
    probability: 0.25,
    shouldContrast: false,
    yOffset: 75,
  };

  // for(let i = 0; i < 4; i++) {
  //     drawLineStroked({
  //         x1: random(-1, 1) * floor(width * 0.415),
  //         y1: random(-1, 1) * floor(height * 0.4),
  //         x2: random(-1, 1) * floor(width * 0.415),
  //         y2: random(-1, 1) * floor(width * 0.4),
  //         ...props
  //     })
  // }

  // Corner
  // drawLineStroked({
  //     ...props,
  //     yOffset: 30,
  //     x1: 0 + floor(width * 0.1) * random(-1, 1),
  //     y1: height * 0.4 + height * 0.075 * random(-1, 1),
  //     x2: width * 0.4 + floor(width * 0.1) * random(-1, 1),
  //     y2: height * 0.12 + height * 0.075 * random(-1, 1),
  // })

  // Parallel lines
  const start_x = floor(-width * 0.415) + random(-1, 1) * floor(width * 0.05);
  drawLineStroked({
    x1: start_x,
    y1: -height * 0.4 - random(height * 0.075),
    x2: start_x,
    y2: -height * 0.02 - random(height * 0.075),
    ...props,
  });
  drawLineStroked({
    x1: start_x + width * 0.05,
    y1: -height * 0.36 - random(height * 0.075),
    x2: start_x + width * 0.05,
    y2: height * 0.07 - random(height * 0.075),
    ...props,
  });
}
