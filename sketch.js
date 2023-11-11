let rows
let cols
let palette
const TOTAL_FRAMES = 1000

function setup() {
    palette = palette1 // Pick palette
    frameRate(24)
    // Setup canvas // 3840 x 2160 for hi-res
    createCanvas(2560, 2560, WEBGL);
    background(palette.bg)

    drawCircle(0, 0, width * 0.15, 300, {
        angle: 0,
        filled: true,
        stroked: true,
        strokeWeight: width * 0.2
    })

    drawCircle(0, 0, width * 0.35, 600, {
        angle: 0,
        filled: false,
        stroked: true,
        strokeWeight: 100
    })

    drawLine({
        x1: -width * 0.45,
        y1: -height * 0.45,
        x2: width * 0.45,
        y2: -height * 0.45,
        color: '#fff',
        alphaRnd: [0.1, 0.5],
        weightRnd: 15,
        probability: 0.1
    })

    drawLine({
        x1: -width * 0.45,
        y1: height * 0.45,
        x2: width * 0.45,
        y2: height * 0.45,
        color: '#fff',
        alphaRnd: [0.1, 0.5],
        weightRnd: 15,
        probability: 0.1
    })

    drawLine({
        x1: width * 0.45,
        y1: -height * 0.45,
        x2: width * 0.45,
        y2: height * 0.45,
        color: '#fff',
        alphaRnd: [0.1, 0.5],
        weightRnd: 15,
        probability: 0.1
    })

    drawLine({
        x1: -width * 0.45,
        y1: -height * 0.45,
        x2: -width * 0.45,
        y2: height * 0.45,
        color: '#fff',
        alphaRnd: [0.1, 0.5],
        weightRnd: 15,
        probability: 0.1
    })

    noLoop()
}

function draw() {
    if (frameCount % 10 === 0) {
        // console.log('Progress :::: ', floor(frameCount / TOTAL_FRAMES * 100), '%');
    }

    if (frameCount === TOTAL_FRAMES) {
        // noLoop()
        // save('airplane_flow.tiff')
    }
}