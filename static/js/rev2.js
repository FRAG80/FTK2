

window.onload = function() {
    var audioContext = window.audioContext;
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
    // source.connect(convolver);
    // convolver.connect(audioContext.destination);
    source.connect(audioContext.destination);
}