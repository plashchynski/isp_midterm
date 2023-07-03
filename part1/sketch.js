// the lower and upper limit of the frequency range for filters
// defined by the p5.js API: https://p5js.org/reference/#/p5.Filter/set
const minHz = 10;
const maxHz = 22050;

// the lower and upper limit of the resonance range for filters
// defined by the p5.js API: https://p5js.org/reference/#/p5.Filter/set
const minResonance = 0.001;
const maxResonance = 1000;

// p5.SoundFile instance to control the playback
var player;

// filters
var lowpassFilter;
var waveshaperDistortion;
var dynamicCompressor;

// playback controls
var pauseButton;
var playButton;
var stopButton;
var skipStartButton;
var skipEndButton;
var loopButton;
var recordButton;

// low-pass filter
var lp_cutOffSlider;
var lp_resonanceSlider;
var lp_dryWetSlider;
var lp_outputSlider;

// dynamic compressor
var dc_attackSlider;
var dc_kneeSlider;
var dc_releaseSlider;
var dc_ratioSlider;
var dc_thresholdSlider;
var dc_dryWetSlider;
var dc_outputSlider;

// master volume
var mv_volumeSlider;

// reverb
var rv_durationSlider;
var rv_decaySlider;
var rv_dryWetSlider;
var rv_outputSlider;
var rv_reverseButton;

// waveshaper distortion
var wd_amountSlider;
var wd_oversampleSlider;
var wd_dryWetSlider;
var wd_outputSlider;

// This function is called before setup() and is used to load external files
function preload() {
  // p5.js Sound library reference:
  // https://p5js.org/reference/#/libraries/p5.sound

  // Define which audio formats are present in the assets folder
  // As not all browsers support the same audio formats, p5.js will try to load
  // the first format that is supported by the browser
  soundFormats('mp3', 'wav');
  player = loadSound('assets/sample');

  // A sound will play only if it's not already playing
  player.playMode('untilDone');
}

function setup() {
  createCanvas(800, 600);
  background(180);
  
  gui_configuration();


  player.disconnect();

  lowpassFilter = new p5.LowPass();
  lowpassFilter.disconnect();
  lowpassFilter.process(player);

  waveshaperDistortion = new p5.Distortion();
  waveshaperDistortion.disconnect();
  waveshaperDistortion.process(lowpassFilter);

  dynamicCompressor = new p5.Compressor();
  dynamicCompressor.disconnect();
  dynamicCompressor.process(waveshaperDistortion);

  dynamicCompressor.connect();
}

function draw() {
  // make loop button green if the sound is looping
  loopButton.style('background-color', player.isLooping() ? 'green' : '');

  // configure low-pass filter
  lowpassFilter.set(lp_cutOffSlider.value(), lp_resonanceSlider.value());
  lowpassFilter.drywet(lp_dryWetSlider.value());
  lowpassFilter.amp(lp_outputSlider.value());

  // configure waveshaper distortion
  waveshaperDistortion.set(wd_amountSlider.value(), wd_oversampleRadio.value());
  waveshaperDistortion.drywet(wd_dryWetSlider.value());
  waveshaperDistortion.amp(wd_outputSlider.value());

  // configure dynamic compressor
  attack = dc_attackSlider.value();
  knee = dc_kneeSlider.value();
  ratio = dc_ratioSlider.value();
  threshold = dc_thresholdSlider.value();
  release = dc_releaseSlider.value();

  dynamicCompressor.set(attack, knee, ratio, threshold, release);
  dynamicCompressor.drywet(dc_dryWetSlider.value());
  dynamicCompressor.amp(dc_outputSlider.value());
}

function gui_configuration() {
  // Playback controls
  pauseButton = createButton('pause');
  pauseButton.position(10, 20);
  pauseButton.mousePressed(() => { player.pause(); });

  playButton = createButton('play');
  playButton.position(70, 20);
  playButton.mousePressed(() => { player.play(); });

  stopButton = createButton('stop');
  stopButton.position(120, 20);
  stopButton.mousePressed(() => { player.stop(); });

  skipStartButton = createButton('skip to start');
  skipStartButton.position(170, 20);
  skipStartButton.mousePressed(() => { player.jump(0); });

  skipEndButton = createButton('skip to end');
  skipEndButton.position(263, 20);
  skipEndButton.mousePressed(() => { player.jump(player.duration()); });

  loopButton = createButton('loop');
  loopButton.position(352, 20);
  loopButton.mousePressed(() => { player.setLoop(!player.isLooping()); });

  recordButton = createButton('record');
  recordButton.position(402, 20);  
  
  // Important: you may have to change the slider parameters (min, max, value and step)
  
  // low-pass filter
  textSize(14);
  text('low-pass filter', 10,80);
  textSize(10);

  lp_cutOffSlider = createSlider(minHz, maxHz, maxHz/2, 10);
  lp_cutOffSlider.position(10,110);
  text('cutoff frequency', 10,105);

  lp_resonanceSlider = createSlider(minResonance, maxResonance, 0, 10);
  lp_resonanceSlider.position(10,155);
  text('resonance', 10,150);

  // dry/wet and output level from 0 to 1.0
  // 1.0 means 100% wet
  lp_dryWetSlider = createSlider(0, 1.0, 1.0, 0.01);
  lp_dryWetSlider.position(10,200);
  text('dry/wet', 10,195);

  // output level from 0 to 1.0, 1.0 means 100% volume
  lp_outputSlider = createSlider(0, 1.0, 1.0, 0.01);
  lp_outputSlider.position(10,245);
  text('output level', 10,240);
  
  // dynamic compressor
  textSize(14);
  text('dynamic compressor', 210,80);
  textSize(10);

  // Attack is the amount of time (in seconds) to reduce the gain by 10dB
  // default = .003, range 0 - 1
  dc_attackSlider = createSlider(0, 1, 0.003, 0.001);
  dc_attackSlider.position(210,110);
  text('attack', 210,105);

  // A decibel value representing the range above the threshold
  // where the curve smoothly transitions to the "ratio" portion.
  // default = 30, range 0 - 40
  dc_kneeSlider = createSlider(0, 40, 30, 0.1);
  dc_kneeSlider.position(210, 155);
  text('knee', 210, 150);

  // The amount of time (in seconds) to increase the gain by 10dB
  // default = .25, range 0 - 1
  dc_releaseSlider = createSlider(0, 1, 0.25, 0.01);
  dc_releaseSlider.position(210, 200);
  text('release', 210, 195);

  // The amount of dB change in input for a 1 dB change in output
  // default = 12, range 1 - 20
  dc_ratioSlider = createSlider(1, 20, 12, 0.1);
  dc_ratioSlider.position(210, 245);
  text('ratio', 210, 240);

  // The decibel value above which the compression will start taking effect
  // default = -24, range -100 - 0
  dc_thresholdSlider = createSlider(-100, 0, -24, 0.1);
  dc_thresholdSlider.position(360,110);
  text('threshold', 360,105);

  dc_dryWetSlider = createSlider(0, 1, 1, 0.01);
  dc_dryWetSlider.position(360, 155);
  text('dry/wet', 360, 150);

  dc_outputSlider = createSlider(0, 1, 1, 0.01);
  dc_outputSlider.position(360, 200);
  text('output level', 360, 195);
  
  // master volume
  textSize(14);
  text('master volume', 560,80);
  textSize(10);
  mv_volumeSlider = createSlider(0, 1, 0.5, 0.01);
  mv_volumeSlider.position(560,110);
  text('level', 560,105)

  // reverb
  textSize(14);
  text('reverb', 10,305);
  textSize(10);
  rv_durationSlider = createSlider(0, 1, 0.5, 0.01);
  rv_durationSlider.position(10,335);
  text('duration', 10,330);
  rv_decaySlider = createSlider(0, 1, 0.5, 0.01);
  rv_decaySlider.position(10,380);
  text('decay', 10,375);
  rv_dryWetSlider = createSlider(0, 1, 0.5, 0.01);
  rv_dryWetSlider.position(10,425);
  text('dry/wet', 10,420);
  rv_outputSlider = createSlider(0, 1, 0.5, 0.01);
  rv_outputSlider.position(10,470);
  text('output level', 10,465);
  rv_reverseButton = createButton('reverb reverse');
  rv_reverseButton.position(10, 510);
  
  // waveshaper distortion
  textSize(14);
  text('waveshaper distortion', 210,305);
  textSize(10);

  wd_amountSlider = createSlider(0, 1, 0.5, 0.01);
  wd_amountSlider.position(210, 335);
  text('distortion amount', 210, 330);

  // oversample can be 'none', '2x' or '4x'
  // according to the p5.js API: https://p5js.org/reference/#/p5.Distortion
  push();
  textAlign(CENTER);
  wd_oversampleRadio = createRadio();
  wd_oversampleRadio.option('none');
  wd_oversampleRadio.option('2x');
  wd_oversampleRadio.option('4x');
  wd_oversampleRadio.selected('none');
  wd_oversampleRadio.style('width', '200px');
  pop();

  wd_oversampleRadio.position(210,380);
  text('oversample', 210,375);

  wd_dryWetSlider = createSlider(0, 1, 0, 0.01);
  wd_dryWetSlider.position(210, 425);
  text('dry/wet', 210, 420);

  wd_outputSlider = createSlider(0, 1, 1, 0.01);
  wd_outputSlider.position(210, 470);
  text('output level', 210, 465);
  
  // spectrums
  textSize(14);
  text('spectrum in', 560,200);
  text('spectrum out', 560,345);
}