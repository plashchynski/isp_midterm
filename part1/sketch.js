// Part 1
// BEGIN: I wrote this code personally without assistance. Any fragments taken from external sources will be explicitly marked.
// The code based on the provided template from the course

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

// microphone input
var mic;
var micEnabled = false;

// filters
var passFilter;
var waveshaperDistortion;
var dynamicCompressor;
var reverbFilter;
var masterVolumeFilter;
var delayFilter;

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
var microphoneButton;

// pass filter
var p_cutOffSlider;
var p_resonanceSlider;
var p_dryWetSlider;
var p_outputSlider;
var p_resonanceText;

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

// delay
var dl_time;
var dl_feedback;
var dl_type;
var dl_frequency;
var dl_dryWetSlider;
var dl_outputSlider;


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

  // microphone input
  mic = new p5.AudioIn();

  gui_configuration();

  player.disconnect();

  // analyze spectrum of the original sound
  fftIn = new p5.FFT();
  fftIn.setInput(player);

  passFilter = new p5.LowPass();
  passFilter.disconnect();
  passFilter.process(player);

  waveshaperDistortion = new p5.Distortion();
  waveshaperDistortion.disconnect();
  waveshaperDistortion.process(passFilter);

  delayFilter = new p5.Delay();
  delayFilter.disconnect();
  delayFilter.process(waveshaperDistortion);

  dynamicCompressor = new p5.Compressor();
  dynamicCompressor.disconnect();
  dynamicCompressor.process(delayFilter);

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
  passFilter.set(p_cutOffSlider.value(), p_resonanceSlider.value());
  passFilter.drywet(p_dryWetSlider.value());
  passFilter.amp(p_outputSlider.value());

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

  // configure delay filter
  delayFilter.delayTime(dl_time.value());
  delayFilter.feedback(dl_feedback.value());
  delayFilter.setType(dl_type.value());
  delayFilter.filter(dl_frequency.value());
  delayFilter.drywet(dl_dryWetSlider.value());
  delayFilter.amp(dl_outputSlider.value());

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

    // one source must be connected to the recorder
    if (!player.isPlaying() && !micEnabled)
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

  microphoneButton = createButton('microphone');
  microphoneButton.position(465, 20);
  microphoneButton.mousePressed(() => {
    if (getAudioContext().state !== 'running') {
      getAudioContext().resume();
    }

    if (micEnabled) {
      mic.stop();
      mic.disconnect();

      passFilter.process(player);
      fftIn.setInput(player);

      micEnabled = false;
    } else {
      mic.start();

      passFilter.process(mic);
      fftIn.setInput(mic);

      micEnabled = true;
    }
  });

  // Important: you may have to change the slider parameters (min, max, value and step)

  // pass filter controls
  textSize(14);
  const filterSelect = createSelect();
  filterSelect.position(10, 65);
  filterSelect.option('Low-pass filter');
  filterSelect.option('High-pass filter');
  filterSelect.option('Band-pass filter');
  filterSelect.changed(() => {
    const filterType = filterSelect.value();
    if (filterType === 'Low-pass filter') {
      passFilter.setType('lowpass');
    } else if (filterType === 'High-pass filter') {
      passFilter.setType('highpass');
    } else if (filterType === 'Band-pass filter') {
      passFilter.setType('bandpass');
      p_resonanceText.html('bandwidth');
    }
  });

  textSize(10);

  p_cutOffSlider = createSlider(minHz, maxHz, maxHz/2, 10);
  p_cutOffSlider.position(10,110);
  p_cutOffSlider.changed(updateFiltersSettings);
  text('cutoff frequency', 10,105);

  p_resonanceSlider = createSlider(minResonance, maxResonance, 0, 10);
  p_resonanceSlider.position(10,155);
  p_resonanceSlider.changed(updateFiltersSettings);
  p_resonanceText = text('resonance', 10,150);

  // dry/wet and output level from 0 to 1.0
  // 1.0 means 100% wet
  p_dryWetSlider = createSlider(0, 1.0, 1.0, 0.01);
  p_dryWetSlider.position(10,200);
  p_dryWetSlider.changed(updateFiltersSettings);
  text('dry/wet', 10,195);

  // output level from 0 to 1.0, 1.0 means 100% volume
  p_outputSlider = createSlider(0, 1.0, 1.0, 0.01);
  p_outputSlider.position(10,245);
  p_outputSlider.changed(updateFiltersSettings);
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
  wd_amountSlider.changed(updateFiltersSettings);
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

  wd_oversampleRadio.position(210, 380);
  wd_oversampleRadio.changed(updateFiltersSettings);
  text('oversample', 210,375);

  wd_dryWetSlider = createSlider(0, 1, 0, 0.01);
  wd_dryWetSlider.position(210, 425);
  wd_dryWetSlider.changed(updateFiltersSettings);
  text('dry/wet', 210, 420);

  wd_outputSlider = createSlider(0, 1, 1, 0.01);
  wd_outputSlider.position(210, 470);
  wd_outputSlider.changed(updateFiltersSettings);
  text('output level', 210, 465);

  // Delay
  textSize(14);
  text('delay', 360, 305);
  textSize(10);

  // Delay Time (in seconds) of the echoed signal
  // Min: 0, Max: 1. Defaults to 0.5
  dl_time = createSlider(0, 1, 0.5, 0.01);
  dl_time.position(360, 335);
  dl_time.changed(updateFiltersSettings);
  text('time', 360, 330);

  // feedback is the amount of the output signal that is fed back into the delay line.
  // Min: 0, Max: 1. Defaults to 0.5
  dl_feedback = createSlider(0, 1, 0.5, 0.01);
  dl_feedback.position(360, 380);
  dl_feedback.changed(updateFiltersSettings);
  text('feedback', 360, 375);

  // type of delay
  dl_type = createRadio();
  dl_type.option('default');
  dl_type.option('ping pong');
  dl_type.selected('default');
  dl_type.style('width', '200px');
  dl_type.position(360, 425);
  dl_type.changed(updateFiltersSettings);
  text('type', 360, 420);

  // frequency
  dl_frequency = createSlider(minHz, maxHz, maxHz/2, 10);
  dl_frequency.position(360, 470);
  dl_frequency.changed(updateFiltersSettings);
  text('frequency', 360, 465);

  // dry/wet
  dl_dryWetSlider = createSlider(0, 1, 0, 0.01);
  dl_dryWetSlider.position(360, 515);
  dl_dryWetSlider.changed(updateFiltersSettings);
  text('dry/wet', 360, 510);

  // output level
  dl_outputSlider = createSlider(0, 1, 1, 0.01);
  dl_outputSlider.position(360, 560);
  dl_outputSlider.changed(updateFiltersSettings);
  text('output level', 360, 555);


  // spectrums
  textSize(14);
  text('spectrum in', 560,200);
  text('spectrum out', 560,345);
}

// Display the spectrum
function displaySpectrum(spectrum, x, y) {
  push();

  // draw a background rectangle to clear the background
  translate(x, y);
  scale(0.25, 0.2);
  noStroke();
  fill(100);
  rect(0, 0, width, height);
  fill(240, 0, 0);

  // draw the spectrum
  spectrum.forEach((value, i) => {
    const x = map(i, 0, spectrum.length, 0, width);
    const h = map(value, 0, 255, 0, height);

    // draw a rectangle for each frequency bin
    rect(x, height, width / spectrum.length, -h);
  });

  pop();
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
  microphoneButton.style('background-color', micEnabled ? 'green' : '');

  // display the spectrograms
  updateSpectrograms();
}

// END of my code
