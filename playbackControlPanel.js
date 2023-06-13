class PlaybackControlPanel {
    constructor(player, mic) {
        this.player = player;
        this.mic = mic;
    }

    setup() {
        let self = this;

        function toggleLoop() {
            console.log(self.player.isLooping());
            self.player.setLoop(!self.player.isLooping());
        }

        this.pauseButton = createButton('pause');
        this.pauseButton.position(20, 20);
        this.pauseButton.mousePressed(() => { this.player.pause(); });
      
        this.playButton = createButton('play');
        this.playButton.position(this.pauseButton.x + this.pauseButton.width + 10, 20);
        this.playButton.mousePressed(() => { this.player.play(); });
      
        this.stopButton = createButton('stop');
        this.stopButton.position(this.playButton.x + this.playButton.width + 10, 20);
        this.stopButton.mousePressed(() => { this.player.stop(); });
      
        this.skipToStartButton = createButton('skip to start');
        this.skipToStartButton.position(this.stopButton.x + this.stopButton.width + 10, 20);
        this.skipToStartButton.mousePressed(() => { this.player.jump(0); });
      
        this.skipToEndButton = createButton('skip to end');
        this.skipToEndButton.position(this.skipToStartButton.x + this.skipToStartButton.width + 10, 20);
        this.skipToEndButton.mousePressed(() => { this.player.jump(this.player.duration()); });
      
        this.loopButton = createButton('loop');
        this.loopButton.position(this.skipToEndButton.x + this.skipToEndButton.width + 10, 20);
        this.loopButton.mousePressed(toggleLoop);
      
        this.recordButton = createButton('record');
        this.recordButton.position(this.loopButton.x + this.loopButton.width + 10, 20);
        this.recordButton.mousePressed(this.startRecording);
    }

    draw() {
        this.loopButton.style('background-color', this.player.isLooping() ? 'green' : '');
    }

    startRecording() {
        if (!this.player.isPlaying()) {
            this.player.stop();
        }
        this.mic.start();
    }
}
