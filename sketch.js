let rows
let cols
let palette
let rowPos = 0
let step
const TOTAL_FRAMES = 10

function setup() {
    palette = palette6 // Pick palette
    // frameRate(24)
    // Setup canvas // 3840 x 2160 for hi-res
    // createCanvas(720, 1280, WEBGL);
    createCanvas(3000, 3000, WEBGL);

    blendMode(ADD)
    step = floor(width * 0.04) // Step influences how thick the rows are, as well as the gap between the rows

    background(palette.bg)
    drawWaves()
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
    let color = sampleArray(palette.colors)
    for (let y = -height * 0.6; y <= height * 0.6; y++) {
        drawLine({
            x1: floor(-width * 0.45),
            y1: y,
            x2: floor(width * 0.45),
            y2: y,
            color,
            alphaRnd: [0.1, 0.3],
            weightRnd: noise(y * 0.0035) * width * 0.004,
            probability: 0.2,
            shouldContrast: true
        })


        // When a step is finished, offset the y position with the newly calculated step
        if (floor(y % step) === 0) {
            color = sampleArray(palette.colors) // Change random color
            step += chance(0.45) ? floor(width * 0.005) : -floor(width * 0.005)
            rowPos++
            y += step * 0.25
        }
    }
}