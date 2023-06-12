let soundFile;

// Control buttons
let playButton;
let pauseButton;
let stopButton;

let volumeSlider;

// This function is called before setup() and is used to load external files
function preload() {
  // p5.js Sound library reference:
  // https://p5js.org/reference/#/libraries/p5.sound

  // Define which audio formats are present in the assets folder
  // As not all browsers support the same audio formats, p5.js will try to load
  // the first format that is supported by the browser
  soundFormats('mp3', 'wav');
  soundFile = loadSound('assets/sample');

  // A sound will play only if it's not already playing
  soundFile.playMode('untilDone');
}

function setup() {
  createCanvas(400, 400);
  background(180);

  pauseButton = createButton('pause');
  pauseButton.position(20, 20);
  pauseButton.mousePressed(pauseSound);

  playButton = createButton('play');
  playButton.position(80, 20);
  playButton.mousePressed(playSound);

  stopButton = createButton('stop');
  stopButton.position(130, 20);
  stopButton.mousePressed(stopSound);

  volumeSlider = createSlider(0, 2, 1, 0.01);
  volumeSlider.position(280, 150);
  volumeSlider.style('transform', 'rotate(270deg)');
}

function draw() {
  text('master\nvolume', 320, 60);
  soundFile.setVolume(volumeSlider.value());
}

function playSound() {
  soundFile.play();
}

function pauseSound() {
  soundFile.pause();
}

function stopSound() {
  soundFile.stop();
}
