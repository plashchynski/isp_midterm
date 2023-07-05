var sound;

// Settings
const bufferSize = 512; // 44100/512 = 86Hz resolution
var maxAmplitude = 256; // 256 = 0dB

// Reported features
var features;

function preload() {
  sound = loadSound("assets/Kalte_Ohren_(_Remix_).mp3");
}

function setup() {
  createCanvas(1000, 600);
  background(255);

  analyzer = Meyda.createMeydaAnalyzer({
    audioContext: getAudioContext(),
    source: sound,
    bufferSize: bufferSize, // 44100/512 = 86Hz resolution
    featureExtractors: ["amplitudeSpectrum", "energy", "spectralCentroid", "loudness", "spectralSpread", "spectralKurtosis"],
    callback:  processAudioFeatures
  });

  playStopButton = createButton('play');
  playStopButton.position(10, 10);
  playStopButton.mousePressed(playStop);
}

function playStop() {
  if (sound.isPlaying()) {
    sound.stop();
    analyzer.stop();
    playStopButton.html('play');
  } else {
    sound.play();
    analyzer.start();
    playStopButton.html('stop');
  }
}

function draw() {
  // Stop the analyzer when the sound has finished playing
  if (!sound.isPlaying()) {
    analyzer.stop();
  }

  background(255);

  drawVisualisation();
}

// Meyda callback function
function processAudioFeatures(f) {
  features = f;
}

// Draw the visualisation
function drawVisualisation() {
  if (features === undefined)
    return; // No features yet

  features.amplitudeSpectrum.forEach(function (value, index) {
    var x = map(index, 0, features.amplitudeSpectrum.length, 0, width);
    var h = map(value, 0, maxAmplitude, 0, height);
    stroke(0);
    line(x, height, x, height-h);
  });

  const numberOfRects = features.loudness.specific.length;
  const rectWidth = width/(numberOfRects+1);
  const centroidRect = Math.ceil(numberOfRects*(features.spectralCentroid/bufferSize/2));

  features.loudness.specific.forEach(function (level, index) {
    push();

    translate(rectWidth + index * rectWidth, height/2);

    rectMode(CENTER);
    fill(map(level, 0, 2, 0, 255));
    stroke(0);

    // console.log(features.spectralKurtosis);

    if (centroidRect === index) {
      const weight = map(features.spectralKurtosis, -50, 200, 1, 30);
      strokeWeight(weight);
    }

    const w = map(features.energy, 0, 100, 0, rectWidth);
    const h = map(level, 0, 1.0, 0, rectWidth);
    rect(0, 0, w, h);
    pop();
  });
}
