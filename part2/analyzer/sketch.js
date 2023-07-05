// Part 2 — analyzer: Analyze a sound file and display its features
// This is my own code

var sound;
var startAnalysisButton;
var features;
const featuresToAnalyze = ["energy", 
"perceptualSharpness", "perceptualSpread", "rms", "spectralCentroid",
"spectralFlatness", "spectralKurtosis", "spectralRolloff", "spectralSkewness",
"spectralSlope", "spectralSpread", "zcr"];
const fileName = 'assets/Ex2_sound1.wav';

function preload() {
  sound = loadSound(fileName);
}

function setup() {
  createCanvas(1240, 1500);
  background(255);

  features = [];

  analyzer = Meyda.createMeydaAnalyzer({
    "audioContext": getAudioContext(),
    "source": sound,
    "bufferSize": 512, // 44100/512 = 86Hz resolution
    "featureExtractors": featuresToAnalyze,
    "callback": f => {
      features.push(f);
    }
  });

  startAnalysisButton = createButton('Analyze');
  startAnalysisButton.position(10, 10);
  startAnalysisButton.mousePressed(startAnalysis);
}

function startAnalysis() {
  sound.play();
  analyzer.start();
  startAnalysisButton.remove();
}

function normalize(array) {
  array = array.map(v => (v === undefined || isNaN(v)) ? 0 : v);
  array = array.map(v => v === Infinity ? 1 : v);

  const min = Math.min(...array);
  const max = Math.max(...array);
  const range = max - min;

  return(array.map((v) => (v - min) / range));
}

function draw() {
  if (features.length == 0 ) {
    return;
  }

  if (!sound.isPlaying()) {
    analyzer.stop();
  }

  background(255);
  fill(0);

  text('File: ' + fileName, 10, 20);

  featuresToAnalyze.forEach(function(name, i) {
    const frames = normalize(features.map(f => f[name]));

    const y = i * 120 + 50;
    text(name + ' normalized std: ' + math.std(frames), 10, y);

    push();
    translate(10, y+10);
    scale(1, 0.05);
    noStroke();
    fill(100);
    rect(0, 0, width, height);
    fill(240, 0, 0);

    for (let i = 0; i < frames.length; i++) {
      const x = map(i, 0, frames.length, 0, width);
      const h = map(frames[i], 0, 1, 0, height);
      rect(x, height, width / frames.length, -h);
    }

    pop();
  });
}
