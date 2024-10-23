let rows
let cols
let palette
let rowPos = 0
let step
let grainWeight
let prevColor
let currentColor
let nextColor
let gradientProb

const TOTAL_FRAMES = 10

function setup() {
    palette = palette1 // Pick palette
    // frameRate(24)
    // Setup canvas // 3840 x 2160 for hi-res
    createCanvas(720, 720, WEBGL);
    // createCanvas(3000, 4000, WEBGL);
    // createCanvas(2560, 2560, WEBGL);

    blendMode(ADD)
    background(palette.bg)

    step = floor(height * 0.25) // Step influences how thick the rows are, as well as the gap between the rows
    grainWeight = width * 0.0025

    drawWaves()

    // blendMode(OVERLAY)

    // drawSquare()

    // save('dunes.tiff')

    noLoop()
}

function draw() {


    if (frameCount % 1 === 0) {
        console.log('Progress :::: ', floor(frameCount / TOTAL_FRAMES * 100), '%');
    }

    if (frameCount === TOTAL_FRAMES) {
        noLoop()
        // save('airplane_flow.tiff')
    }
}

function drawWaves () {
    prevColor = sampleArray(palette.colors)
    currentColor = sampleArray(palette.colors)
    nextColor = sampleArray(palette.colors)

    let stepCounter = abs(step)
    let probability = 1
    

    for (let y = -height * 0.6; y <= height * 0.6; y++) {

        if (abs(y) > height * 0.4) {
            probability = map (abs(y), height * 0.6, height * 0.4, 0, 0.6)
        }

        let EDGE_OFFSET = random() * width * 0.275

        drawLine({
            x1: floor(-width * 0.415),
            // y1: y + sin(rowPos) * width * 0.03,
            y1: y,
            x2: floor(width * 0.415),
            y2: y,
            // y2: y + cos(rowPos) * width * 0.03,
            color: currentColor,
            alphaRnd: [0.4, 0.95],
            weightRnd: noise(y * 0.0035) * grainWeight,
            probability: probability,
            shouldContrast: false,
            useNoise: true,
            yOffset: map ( noise(step * 0.015, y * 0.006), 0, 1, 60, 100 ),
            // yOffset: map( random(), 0, 1, 40, 120 ),
            // noiseX: 0.003 + random(0.001, 0.004),
            // noiseY: 0.0045 + random(0.001, 0.003)
        })

        // Calculate if y is near the edge of a previous row, and generate probability for color interchanges
        stepCounter--
        gradientProb = map( stepCounter, step, 0, -0.75, 0.75)

        if (stepCounter === 0) {
            // Shift colors
            prevColor = currentColor
            currentColor = nextColor
            nextColor = sampleArray(palette.colors) // Change random color

            // Increase or decrease step, reset step counter and shift y value forward, creating a gap
            step += chance(0.38) ? floor(width * 0.065) : -floor(width * 0.065)
            stepCounter = abs(step)
            y += floor(step * 0.1)

            rowPos++
        }
    }
}

function drawSquare() {

    const props = {
        weight: 50,
        color: palette.contrast,
        alphaRnd: [0.05, 0.2],
        weightRnd: grainWeight,
        probability: 0.25,
        shouldContrast: false,
        yOffset: 75,
    }

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
    const start_x = floor(-width * 0.415) + random(-1, 1) * floor(width * 0.05)
    drawLineStroked({
        x1: start_x,
        y1: - height * 0.4 - random(height * 0.075),
        x2: start_x,
        y2: -height * 0.02 - random(height * 0.075),
        ...props
    })
    drawLineStroked({
        x1: start_x + width * 0.05,
        y1: - height * 0.36 - random(height * 0.075),
        x2: start_x + width * 0.05,
        y2: height * 0.07 - random(height * 0.075),
        ...props
    })
}