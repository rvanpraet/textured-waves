const BASE_NOISE_OFFSET = 50;
const SOLID_CORE_RATIO = 0.35;

/**
 * Draws a circle based on divisions and draws lines between division points
 */
function drawCircle(x, y, r, config) {
  const {
    divisions = 100,
    angle = 0,
    color = "#fff",
    filled = true,
    stroked = false,
    strokeWeight = 1,
    alphaRnd = [0, 1],
    weightRnd = 5,
    probability = 0.5,
  } = config;

  let theta = TWO_PI / divisions;
  const points = [];

  push();

  for (let i = 0; i < divisions; i++) {
    const xCir = cos(theta * i) * r;
    const yCir = sin(theta * i) * r;
    points.push({ x: xCir, y: yCir });
  }

  if (stroked) {
    const c = createVector(x, y);

    for (let i = 1; i < points.length; i++) {
      const p1 = points[i];
      const v = createVector(p1.x, p1.y);
      const a = atan2(v.y - c.y, v.x - c.x) + PI;

      let dx = cos(a) * strokeWeight;
      let dy = sin(a) * strokeWeight;
      v.add(createVector(dx, dy));

      const p2 = { x: v.x, y: v.y };

      drawLine({
        x1: p1.x, y1: p1.y,
        x2: p2.x, y2: p2.y,
        color, alphaRnd, weightRnd, probability,
      });
    }
  }

  if (filled) {
    for (let i = 1; i <= points.length / 2; i++) {
      const p1 = points[i];
      const p2 = points[points.length - i - 1];

      drawLine({
        x1: p1.x, y1: p1.y,
        x2: p2.x, y2: p2.y,
        color, alphaRnd, weightRnd, probability,
      });
    }
  }
  pop();
}

/**
 * Draw line point-by-point with noise displacement and particle textures
 */
function drawLine(props) {
  let {
    x1, x2, y1, y2,
    color,
    alphaRnd,
    weightRnd,
    probability,
    useNoise = true,
    noiseX = 0.003,
    noiseY = 0.0045,
    xOffset = 0,
    yOffset = 100,
  } = props;

  let rowStepCount = 0;

  x1 = floor(x1);
  y1 = floor(y1);
  x2 = floor(x2);
  y2 = floor(y2);

  const probPower = params.densityCurve;

  const drawFn = (x, y) => {
    const rowPosNoiseMult = map(rowPos, 0, params.noiseDecayBands, 1, 0);
    const noiseXMap = map(x, -width * 0.5, width * 0.5, -1, 1);
    const noiseVal = noise(x * noiseX * rowPosNoiseMult, y * noiseY * (1 - noiseXMap) * rowPosNoiseMult);

    const probXMap = easeInOutQuart(map(x, -width * 0.5, width * 0.5, -1, 1) + sin(renderFrame * 2) * width * 0.000005);
    const invertedProbXMap = 1 - abs(probXMap);


    const probabilityFinal = probability * pow(invertedProbXMap, probPower) + 0.00001;

    if (chance(probabilityFinal)) {
      const phaseYOffset = height * 0.5 - abs(y);
      const phase = map(y + height * 0.5, 0, height, 0, 360) + map(noiseVal * phaseYOffset, 0, height * 0.5, 0, 360);
      const actualPhase = map(phase, 0, 720, 0, 360);

      yOffset = BASE_NOISE_OFFSET * params.noiseOffsetStrength;
      xOffset = BASE_NOISE_OFFSET * params.noiseOffsetStrength;

      let xOff = useNoise ? map(noiseVal, 0, 1, -1, 1) * xOffset : 0;
      let yOff = useNoise ? map(noiseVal, 0, 1, -1, 1) * yOffset : 0;

      const posX = x + xOff;
      const posY = y + yOff;

      let fillColor = currentColor;

      const isGradient = chance(abs(gradientProb));
      const gradientMap = map(abs(gradientProb), 0, 0.5, 0, 1);

      if (isGradient) {
        fillColor = gradientProb < 0 ? prevColor : nextColor;
        fillColor = lerpColor(colorRGB(currentColor), colorRGB(fillColor), gradientMap);
      }

      const alphaGradientMult = isGradient ? 0.5 : 1;
      const alpha = random(alphaRnd[0], alphaRnd[1]) * alphaGradientMult;
      const size = random(weightRnd * params.particleSizeMin, weightRnd * params.particleSizeMax);

      push();
      noStroke();
      fill(colorAlpha(fillColor, alpha));
      
      if (params.particleTexture === 'circle') {
        circle(posX, posY, size);
      } else {
        circle(posX, posY, size * SOLID_CORE_RATIO);

        imageMode(CENTER);
        tint(colorAlpha(fillColor, alpha));
        image(particleTexture, posX, posY, size, size);
      }
      pop();
    }

    rowStepCount++;
  };

  if (floor(x1) !== floor(x2)) {
    let y = y1;
    let yInc = (y2 - y1) / abs(x2 - x1);

    if (x2 > x1) {
      for (let x = x1; x <= x2; x++) {
        drawFn(x, y);
        y += yInc;
      }
    } else {
      for (let x = x1; x >= x2; x--) {
        drawFn(x, y);
        y += yInc;
      }
    }
  } else {
    const x = x1;
    if (y2 > y1) {
      for (let y = y1; y <= y2; y++) {
        drawFn(x, y);
      }
    } else {
      for (let y = y1; y >= y2; y--) {
        drawFn(x, y);
      }
    }
  }
}

/**
 * Draw a stroked line by offsetting parallel lines perpendicular to the main axis
 */
function drawLineStroked({ weight, ...props }) {
  const { x1, x2, y1, y2 } = props;

  const slope = (y2 - y1) / (x2 - x1);
  const perpendicularSlope = slope === Infinity ? 0 : -1 / slope;

  for (let d = -floor(weight * 0.5); d <= floor(weight * 0.5); d++) {
    let unitX = d / Math.sqrt(1 + perpendicularSlope ** 2);
    let unitY = perpendicularSlope * unitX;

    let x3 = x1 + unitX;
    let y3 = y1 + unitY;
    let x4 = x2 + unitX;
    let y4 = y2 + unitY;

    drawLine({ ...props, x1: x3, y1: y3, x2: x4, y2: y4 });
  }
}

/**
 * Returns true with the given probability (0-1)
 */
function chance(probability = 1) {
  return random() <= probability;
}

/**
 * Convert a p5 color to RGBA with alpha
 */
function colorAlpha(aColor, alpha) {
  var c = color(aColor);
  c.setAlpha(alpha * 255);
  return c;
}

/**
 * Convert a p5 color to RGB
 */
function colorRGB(aColor) {
  var c = color(aColor);
  c.setAlpha(255);
  return c;
}

/**
 * Sample a random element from an array
 */
function sampleArray(array = []) {
  const randIdx = ceil(random(0.0001, array.length)) - 1;
  return array[randIdx];
}

/**
 * Sample an array element using 2D Perlin noise
 */
function sampleArrayNoise(x = null, y = null, array = []) {
  if (x === null && y === null) {
    console.error("Provide at least one dimension for sampling with noise");
    return;
  }

  let noiseVal;
  if (x !== null && y !== null) {
    noiseVal = noise(x, y);
  } else if (x !== null) {
    noiseVal = noise(x);
  } else {
    noiseVal = noise(y);
  }

  const noiseIdx = ceil(noiseVal * array.length) - 1;
  return array[noiseIdx];
}
