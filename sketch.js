let player;
let mic;

let playbackControlPanel;

let volumeSlider;

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
    createCanvas(500, 500);
    background(180);

    // Create an AudioIn object to record audio from the microphone
    mic = new p5.AudioIn();

    // Create the upper panel of buttons
    playbackControlPanel = new PlaybackControlPanel(player, mic);
    playbackControlPanel.setup();

    // Create the volume slider
    volumeSlider = createSlider(0, 2, 1, 0.01);
    volumeSlider.position(380, 200);
    volumeSlider.style('transform', 'rotate(270deg)');
}

function draw() {
    playbackControlPanel.draw();

    // Master volume
    text('master\nvolume', volumeSlider.x + 40, volumeSlider.y - 100);
    fill(255,0,0,0);
    rect(volumeSlider.x+10, volumeSlider.y-140, 90, 250);
}
