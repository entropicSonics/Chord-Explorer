let circleSize;
let pulseInterval;
let lastPulseTime;

function setup() {
    createCanvas(400, 400);
    circleSize = 50;
    pulseInterval = 60000 / (120 * 4); // 1/16th note at 120 bpm
    lastPulseTime = millis();
}

function draw() {
    background(220);
    
    // Check if it's time to pulse
    if (millis() - lastPulseTime >= pulseInterval) {
        pulseCircle();
        lastPulseTime = millis();
    }
    
    // Draw the circle
    fill(255, 0, 0);
    circle(width / 2, height / 2, circleSize);
}

function pulseCircle() {
    // Increase the circle size
    circleSize += 10;
    
    // Reset the circle size if it exceeds a certain limit
    if (circleSize > 100) {
        circleSize = 50;
    }
}

