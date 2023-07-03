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
var reverbFilter;
var masterVolumeFilter;

// ffts
var fftIn;
var fftOut;

// recorder to record the processed sound and save it as a file
var recorder;

// sound file to save the processed sound
var outFile;

// recording flag
var recording = false;

// reverb filter reverse flag
var reverbReverse = false;

// player looping flag
var playerLooping = false;

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

  // analyze spectrum of the original sound
  fftIn = new p5.FFT();
  fftIn.setInput(player);

  lowpassFilter = new p5.LowPass();
  lowpassFilter.disconnect();
  lowpassFilter.process(player);

  waveshaperDistortion = new p5.Distortion();
  waveshaperDistortion.disconnect();
  waveshaperDistortion.process(lowpassFilter);

  dynamicCompressor = new p5.Compressor();
  dynamicCompressor.disconnect();
  dynamicCompressor.process(waveshaperDistortion);

  reverbFilter = new p5.Reverb();
  reverbFilter.disconnect();
  reverbFilter.process(dynamicCompressor);

  masterVolumeFilter = new p5.Gain();
  masterVolumeFilter.disconnect();
  masterVolumeFilter.setInput(reverbFilter);
  masterVolumeFilter.connect();

  // analyze spectrum after processing
  fftOut = new p5.FFT();
  fftOut.setInput(masterVolumeFilter);

  // configure recording
  recorder = new p5.SoundRecorder();
  recorder.setInput(masterVolumeFilter);

  // sound file to save the processed sound
  outFile = new p5.SoundFile();
  outFile.disconnect();

  updateFiltersSettings();
}

// This function is called when the user changes any of the sliders
// controls the filters settings
function updateFiltersSettings() {
  console.log("update filters settings")
  // configure low-pass filter
  lowpassFilter.set(lp_cutOffSlider.value(), lp_resonanceSlider.value());
  lowpassFilter.drywet(lp_dryWetSlider.value());
  lowpassFilter.amp(lp_outputSlider.value());

  // configure waveshaper distortion
  waveshaperDistortion.set(wd_amountSlider.value(), wd_oversampleRadio.value());
  waveshaperDistortion.drywet(wd_dryWetSlider.value());
  waveshaperDistortion.amp(wd_outputSlider.value());

  // configure dynamic compressor
  const attack = dc_attackSlider.value();
  const knee = dc_kneeSlider.value();
  const ratio = dc_ratioSlider.value();
  const threshold = dc_thresholdSlider.value();
  const release = dc_releaseSlider.value();

  dynamicCompressor.set(attack, knee, ratio, threshold, release);
  dynamicCompressor.drywet(dc_dryWetSlider.value());
  dynamicCompressor.amp(dc_outputSlider.value());

  // configure reberb filter
  const duration = rv_durationSlider.value();
  const decay = rv_decaySlider.value();

  reverbFilter.set(duration, decay, reverbReverse);
  reverbFilter.drywet(rv_dryWetSlider.value());
  reverbFilter.amp(rv_outputSlider.value());

  // configure master volume
  masterVolumeFilter.amp(mv_volumeSlider.value());
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
  loopButton.mousePressed(() => {
    playerLooping = !playerLooping;
    player.setLoop(playerLooping);
  });

  recordButton = createButton('record');
  recordButton.position(402, 20);
  recordButton.mousePressed(() => {
    if (getAudioContext().state !== 'running') {
      getAudioContext().resume();
    }

    if (!player.isPlaying())
      return;

    recording = !recording;
    if (recording) {
      recorder.record(outFile, 0, () => {
        save(outFile, 'processed.wav');
      });
    } else {
      recorder.stop();
    }
  });
  
  // Important: you may have to change the slider parameters (min, max, value and step)
  
  // low-pass filter
  textSize(14);
  text('low-pass filter', 10,80);
  textSize(10);

  lp_cutOffSlider = createSlider(minHz, maxHz, maxHz/2, 10);
  lp_cutOffSlider.position(10,110);
  lp_cutOffSlider.changed(updateFiltersSettings);
  text('cutoff frequency', 10,105);

  lp_resonanceSlider = createSlider(minResonance, maxResonance, 0, 10);
  lp_resonanceSlider.position(10,155);
  lp_resonanceSlider.changed(updateFiltersSettings);
  text('resonance', 10,150);

  // dry/wet and output level from 0 to 1.0
  // 1.0 means 100% wet
  lp_dryWetSlider = createSlider(0, 1.0, 1.0, 0.01);
  lp_dryWetSlider.position(10,200);
  lp_dryWetSlider.changed(updateFiltersSettings);
  text('dry/wet', 10,195);

  // output level from 0 to 1.0, 1.0 means 100% volume
  lp_outputSlider = createSlider(0, 1.0, 1.0, 0.01);
  lp_outputSlider.position(10,245);
  lp_outputSlider.changed(updateFiltersSettings);
  text('output level', 10,240);
  
  // dynamic compressor
  textSize(14);
  text('dynamic compressor', 210,80);
  textSize(10);

  // Attack is the amount of time (in seconds) to reduce the gain by 10dB
  // default = .003, range 0 - 1
  dc_attackSlider = createSlider(0, 1, 0.003, 0.001);
  dc_attackSlider.position(210,110);
  dc_attackSlider.changed(updateFiltersSettings);
  text('attack', 210,105);

  // A decibel value representing the range above the threshold
  // where the curve smoothly transitions to the "ratio" portion.
  // default = 30, range 0 - 40
  dc_kneeSlider = createSlider(0, 40, 30, 0.1);
  dc_kneeSlider.position(210, 155);
  dc_kneeSlider.changed(updateFiltersSettings);
  text('knee', 210, 150);

  // The amount of time (in seconds) to increase the gain by 10dB
  // default = .25, range 0 - 1
  dc_releaseSlider = createSlider(0, 1, 0.25, 0.01);
  dc_releaseSlider.position(210, 200);
  dc_releaseSlider.changed(updateFiltersSettings);
  text('release', 210, 195);

  // The amount of dB change in input for a 1 dB change in output
  // default = 12, range 1 - 20
  dc_ratioSlider = createSlider(1, 20, 12, 0.1);
  dc_ratioSlider.position(210, 245);
  dc_ratioSlider.changed(updateFiltersSettings);
  text('ratio', 210, 240);

  // The decibel value above which the compression will start taking effect
  // default = -24, range -100 - 0
  dc_thresholdSlider = createSlider(-100, 0, -24, 0.1);
  dc_thresholdSlider.position(360,110);
  dc_thresholdSlider.changed(updateFiltersSettings);
  text('threshold', 360,105);

  dc_dryWetSlider = createSlider(0, 1, 1, 0.01);
  dc_dryWetSlider.position(360, 155);
  dc_dryWetSlider.changed(updateFiltersSettings);
  text('dry/wet', 360, 150);

  dc_outputSlider = createSlider(0, 1, 1, 0.01);
  dc_outputSlider.position(360, 200);
  dc_outputSlider.changed(updateFiltersSettings);
  text('output level', 360, 195);
  
  // master volume
  textSize(14);
  text('master volume', 560,80);
  textSize(10);
  mv_volumeSlider = createSlider(0, 1, 0.5, 0.01);
  mv_volumeSlider.position(560,110);
  mv_volumeSlider.changed(updateFiltersSettings);
  text('level', 560,105)

  // reverb
  textSize(14);
  text('reverb', 10,305);
  textSize(10);

  // Duration of the reverb, in seconds
  // Min: 0, Max: 10. Defaults to 3
  rv_durationSlider = createSlider(0, 10, 3, 0.01);
  rv_durationSlider.position(10, 335);
  rv_durationSlider.changed(updateFiltersSettings);
  text('duration', 10, 330);

  // Percentage of decay with each echo.
  // Min: 0, Max: 100. Defaults to 2.
  rv_decaySlider = createSlider(0, 100, 2, 0.01);
  rv_decaySlider.position(10, 380);
  rv_decaySlider.changed(updateFiltersSettings);
  text('decay', 10, 375);

  rv_dryWetSlider = createSlider(0, 1, 0, 0.01);
  rv_dryWetSlider.position(10, 425);
  rv_dryWetSlider.changed(updateFiltersSettings);
  text('dry/wet', 10, 420);

  rv_outputSlider = createSlider(0, 1, 1, 0.01);
  rv_outputSlider.position(10, 470);
  rv_outputSlider.changed(updateFiltersSettings);
  text('output level', 10, 465);

  rv_reverseButton = createButton('reverb reverse');
  rv_reverseButton.position(10, 510);
  rv_reverseButton.mousePressed(() => {
    reverbReverse = !reverbReverse;
    updateFiltersSettings();
  });

  
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

// Display the spectrum
function displaySpectrum(spectrum, x, y) {
  push()

  translate(x, y)
  scale(0.25, 0.2)
  noStroke()
  fill(100)
  rect(0, 0, width, height)
  fill(240, 0, 0)

  for (let i = 0; i < spectrum.length; i++) {
      const x = map(i, 0, spectrum.length, 0, width)
      const h = -height + map(spectrum[i], 0, 255, height, 0)
      rect(x, height, width / spectrum.length, h)
  }

  pop()
}

// Display the spectrum of the original sound and the processed sound
function updateSpectrograms() {
  displaySpectrum(fftIn.analyze(), 560, 210);
  displaySpectrum(fftOut.analyze(), 560, 355);
}

// This function is called once per frame by p5.js
function draw() {
  // make loop button green if the sound is looping
  loopButton.style('background-color', playerLooping ? 'green' : '');
  rv_reverseButton.style('background-color', reverbReverse ? 'green' : '');
  recordButton.style('background-color', recording ? 'green' : '');

  // display the spectrograms
  updateSpectrograms();
}
