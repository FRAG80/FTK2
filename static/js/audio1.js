window.onload = function() {
    var audioContext = new (window.AudioContext || window.webkitAudioContext)();
    var audioElement = document.querySelector('.audio');
    var source = audioContext.createMediaElementSource(audioElement);
    var convolver = audioContext.createConvolver();

    // Load impulse response
    fetch(audioFileUrl)
        .then(response => response.arrayBuffer())
        .then(undecodedAudio => audioContext.decodeAudioData(undecodedAudio))
        .then(audioBuffer => {
            convolver.buffer = audioBuffer;
        })
        .catch(console.error);

    // Connect audio nodes
    source.connect(convolver);
    convolver.connect(audioContext.destination);

    // Player controls
    var playButton = document.querySelector('.play');
    var pauseButton = document.querySelector('.pause');
    var stopButton = document.querySelector('.stop');
    var seekBar = document.querySelector('.seek');

    playButton.addEventListener('click', function() {
        audioContext.resume().then(() => {
            audioElement.play();
        });
    });

    pauseButton.addEventListener('click', function() {
        audioElement.pause();
    });

    stopButton.addEventListener('click', function() {
        audioElement.pause();
        audioElement.currentTime = 0;
    });

    audioElement.addEventListener('timeupdate', function() {
        var position = audioElement.currentTime / audioElement.duration;
        seekBar.value = position * 100;
    });

    seekBar.addEventListener('input', function() {
        var seekTime = audioElement.duration * (seekBar.value / 100);
        audioElement.currentTime = seekTime;
    });
}