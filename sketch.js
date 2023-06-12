let soundFile;
let playButton;

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
  createCanvas(400, 200);
  background(180);

  playButton = createButton('play');
  playButton.position(20, 20);
  playButton.mousePressed(playSound);
}

function draw() {
  // put drawing code here
}

function playSound() {
  soundFile.play();
}
