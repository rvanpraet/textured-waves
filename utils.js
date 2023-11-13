let minX = 0
let maxX = 0
/**
 * Draws a circle based on a certain divisions and will draw lines between the division points
 */
function drawCircle (x, y, r, config) {
    const {
        divisions = 100,
        angle = 0,
        color = '#fff',
        filled = true,
        stroked = false,
        strokeWeight = 1,
        alphaRnd = [0, 1],
        weightRnd = 5,
        probability = 0.5
    } = config

    let theta = TWO_PI / divisions
    const points = []

    push()
    // translate(x, y)
    // rotate(PI/2 * noise(x * 0.005))
    // rotate(angle)

    // Store points on the circle
    for (let i=0; i<divisions; i++) {
        const xCir = cos((theta) * i) * r
        const yCir = sin((theta) * i) * r

        if (!minX || xCir < minX) minX = xCir
        if (!maxX || xCir > maxX) maxX = xCir

        points.push({ x: xCir, y: yCir })
    }

    // Every point on the circle should draw a line inwards over a `strokeWeight` length
    if (stroked) {
        const c = createVector(x, y)

        for (let i=1; i < points.length; i++) {
            const p1 = points[i]

            // Create vectors at the point and center of the circle
            const v = createVector(p1.x, p1.y)
            const a = atan2(v.y - c.y, v.x - c.x) + PI;

            // Calculate the new position based on the angle and distance
            let dx = cos(a) * strokeWeight;
            let dy = sin(a) * strokeWeight;

            // Update the position
            v.add(createVector(dx, dy));

            const p2 = { x: v.x, y: v.y }

            // Get creative with the configuration of drawLine function
            drawLine({
                x1: p1.x,
                y1: p1.y,
                x2: p2.x,
                y2: p2.y,
                color,
                alphaRnd,
                weightRnd,
                probability,
                debug: true
            })
        }
    }

    if (filled) {
        for (let i=1; i <= points.length / 2; i++) {
            const p1 = points[i]
            const p2 = points[points.length - i - 1]

            // Get creative with the configuration of drawLine function
            drawLine({
                x1: p1.x,
                y1: p1.y,
                x2: p2.x,
                y2: p2.y,
                color,
                alphaRnd,
                weightRnd,
                probability,
                debug: true
            })
        }
    }
    pop()
}

/**
 * Draw line per point, so you can distort individual points
 *
 */
function drawLine(props) {
    let {
        x1, x2, y1, y2,
        color,
        alphaRnd,
        weightRnd,
        probability,
        shouldContrast = false,
        debug = false,
        useNoise = true,
        noiseX = 0.003,
        noiseY = 0.0045,
        xOffset = 0,
        yOffset = 100
    } = props;
    let count = 0

    x1 = floor(x1);
    y1 = floor(y1);
    x2 = floor(x2);
    y2 = floor(y2);

    const drawFn = (x, y) => {
        // // Uncomment if you want to weigh the probability of drawing a point at x, y
        const d = abs(dist(x, y, 0, 0))
        const maxD = abs(dist(-width * 0.5, -height * 0.5, 0, 0))
        const weightedProb = probability * (1 - d / maxD) // Linear weighted probability
        // const weightedProb = prob * Math.exp(-a * d / maxD) // Exponential weighted probability
        // const weightedProb = prob * Math.log(1.2 + d) / Math.log(1.1 + maxD); // Logarithmic weighted probability
        const sinedWeighted = probability * abs(sin(count * 20))
        // probability = sinedWeighted

        if (chance(probability)) {
            // Chance of drawing a circle at a spot in the line
            // TODO: BUGGY, CIRCLES GET DRAWN IN CENTER INSTEAD OF AT X,Y
            if (shouldContrast && chance(0.000005)) {
                const rThresh = width * 0.15
                const maxR = width * 0.35
                const r = random(maxR)
                let prob = 0.35

                if (r > rThresh) {
                    prob = map( r, rThresh, maxR, 0.3, 0.05 )
                }

                drawCircle(x, y, r, {
                    divisions: 1000,
                    color: palette.contrast,
                    filled: chance(0.5),
                    stroked: true,
                    strokeWeight: r * random(0.05, 0.5),
                    alphaRnd: [0.01, 0.5],
                    weightRnd: grainWeight * 0.33,
                    probability: prob,
                    noiseX: noiseX * 3,
                    noiseY: noiseY * 3,
                    yOffset: 50
                })
            }
            // if (debug) {
            //     console.log('debug ::: ', x, y)
            // }

            const noiseVal =  noise(x * noiseX, y * noiseY)
            const phaseYOffset = true ? (height * 0.5 - abs(y)) : y // Change true or fale for inverted y

            const phase = map(y + height * 0.5, 0, height, 0, 360)
                // + map(noiseVal * phaseYOffset, 0, height * 0.5, 0, 360)

            // const yOff = useNoise ? sin(count * 0.0025 + noiseVal * PI) * yOffset : 0 // With sine
            // const yOff = useNoise ? sin(count * 0.0025 + noiseVal * (height * 0.5 - abs(y)) * radians(phase)) * yOffset : 0 // With sine
            const yOff = useNoise ? sin(count * 0.0025 + radians(phase)) * yOffset : 0 // With sine
            // const yOff = useNoise ? map(noiseVal, 0, 1, -1, 1) * yOffset : 0 // Without sine


            push();
            noStroke()
            fill(colorAlpha(color, random(alphaRnd)));
            circle(x, y + yOff, random(1, weightRnd))
            pop();
        }

        count++
    };

    // Line is not vertical
    if (floor(x1) !== floor(x2)) {
        let y = y1; // Y-Coord starting point
        let yInc = (y2 - y1) / abs(x2 - x1);

        // Left to right
        if (x2 > x1) {
            for (let x = x1; x <= x2; x++) {
                drawFn(x, y);
                y += yInc;
            }
        }
        // Right to left
        else {
            for (let x = x1; x >= x2; x--) {
                drawFn(x, y);
                y += yInc;
            }
        }
    }

    // Line is vertical
    else {
        const x = x1; // x will stay the same

        // Top to bottom
        if (y2 > y1) {
            for (let y = y1; y <= y2; y++) {
                drawFn(x, y);
            }
        }
        // Bottom to top
        else {
            for (let y = y1; y >= y2; y--) {
                drawFn(x, y);
            }
        }
    }
}

/**
 * To draw a stroked line, calculate the angle between starting and ending point.
 * The stroke should be square to this angle
 */
function drawLineStroked({ weight, ...props }) {
    const { x1, x2, y1, y2 } = props;

    // Calculate the slope of the original line
    const slope = (y2 - y1) / (x2 - x1);

    // Calculate the perpendicular slope
    const perpendicularSlope = slope === Infinity ? 0 : -1 / slope;

    // Loop over every parallel line from -weight/2 to weight/2
    for (let d = -floor(weight * 0.5); d <= floor(weight * 0.5); d++) {
        // Calculate unit vector components
        let unitX = d / Math.sqrt(1 + perpendicularSlope ** 2);
        let unitY = perpendicularSlope * unitX;

        // Calculate the starting point (x3, y3)
        let x3 = x1 + unitX;
        let y3 = y1 + unitY;

        // Calculate the ending point (x4, y4)
        let x4 = x2 + unitX;
        let y4 = y2 + unitY;

        drawLine({ ...props, x1: x3, y1: y3, x2: x4, y2: y4 });
    }
}


/**
 * Simple helper function to providing a probability which returns true or false using random
 * @param {*} probability - Value between 0 and 1
 * @returns
 */
function chance(probability = 1) {
    return random() <= probability
}

/**
 * Turns a P5 color value (hex, decimal) into an RGBA color value
 * @param {t} P5.Color - P5 color value
 * @param {*} alpha - Alpha value between 0 and 1
 * @returns RGBA color string
 */
function colorAlpha(aColor, alpha) {
    var c = color(aColor);
    return color('rgba(' +  [red(c), green(c), blue(c), alpha].join(',') + ')');
}

/**
 * Samples a given array using random index
 * @param {*} array - The array to sample
 * @returns
 */
function sampleArray (array = []) {
    const randIdx = ceil(random(0.0001, array.length)) - 1
    return array[randIdx]
}

/**
 * Samples an array using 2D perlin noise, expects
 * @param {*} x
 * @param {*} y
 * @param {*} length
 * @returns
 */
function sampleArrayNoise (x = null, y = null, array = []) {
    if (x === null && y === null) console.error('Provide at least one dimension for sampling with noise')

    let noiseVal

    if (x !== null && y !== null) {
        noiseVal = noise(x, y)
    }
    else if (x !== null) {
        noiseVal = noise(x)
    }
    else if (y !== null) {
        noiseVal = noise(y)
    }

    const noiseIdx = ceil(noiseVal * array.length) - 1
    return array[noiseIdx]
}