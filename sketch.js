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
    palette = palette6 // Pick palette
    // frameRate(24)
    // Setup canvas // 3840 x 2160 for hi-res
    // createCanvas(720, 720, WEBGL);
    // createCanvas(3000, 4000, WEBGL);
    createCanvas(3000, 3000, WEBGL);

    blendMode(ADD)
    background(palette.bg)

    step = floor(height * 0.2) // Step influences how thick the rows are, as well as the gap between the rows
    grainWeight = width * 0.003

    drawWaves()

    // blendMode(OVERLAY)

    // drawSquare()

    save('dunes.tiff')

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
    let probability = 0.8
    

    for (let y = -height * 0.6; y <= height * 0.6; y++) {

        // if (abs(y) > height * 0.4) {
        //     probability = map (abs(y), height * 0.6, height * 0.4, 0, 0.6)
        // }

        let EDGE_OFFSET = random() * width * 0.275

        drawLine({
            x1: floor(-width * 0.5),
            // y1: y + sin(rowPos) * width * 0.03,
            y1: y,
            x2: floor(width * 0.5),
            y2: y,
            // y2: y + cos(rowPos) * width * 0.03,
            color: currentColor,
            alphaRnd: [0.3, 0.9],
            weightRnd: noise(y * 0.0035) * grainWeight,
            probability: 0.2,
            shouldContrast: false,
            useNoise: true,
            yOffset: map ( noise(step * 0.01, y * 0.004), 0, 1, 0, 140 ),
            // yOffset: map( random(), 0, 1, 40, 120 ),
            // noiseX: 0.003 + random(0.001, 0.004),
            // noiseY: 0.0045 + random(0.001, 0.003)
        })

        // Calculate if y is near the edge of a previous row, and generate probability for color interchanges
        stepCounter--
        gradientProb = map( stepCounter, step, 0, -0.30, 0.30)

        if (stepCounter === 1) {
            // Shift colors
            prevColor = currentColor
            currentColor = nextColor
            nextColor = sampleArray(palette.colors) // Change random color

            // Increase or decrease step, reset step counter and shift y value forward, creating a gap
            step += chance(0.35) ? floor(width * 0.04) : -floor(width * 0.03)
            stepCounter = abs(step)
            y += abs(floor(step * 0.15))

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