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
  createCanvas(800, 800);
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

  const results = {};
  featuresToAnalyze.map(name => {
    results[name] = math.std(normalize(features.map(f => f[name])))
  });

  background(255);
  fill(0);

  text('File: ' + fileName, 10, 20);

  Object.keys(results).forEach(function(name, i) {
    const y = i * 20 + 50;
    text(name + ' normalized std: ' + results[name], 10, y);
  });
}
