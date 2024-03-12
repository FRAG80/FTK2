
window.onload = function() {
    var audioContext = window.audioContext;
    var audioElement = document.querySelector('.audio');
    var source = audioContext.createMediaElementSource(audioElement);
    var convolver = audioContext.createConvolver();
    var dryGainNode = audioContext.createGain();
    var wetGainNode = audioContext.createGain();
    var reverbOn = false;

    // Load impulse response
    fetch('static/wav/IRs/capricorn-ir-1-101345.wav')
        .then(response => response.arrayBuffer())
        .then(undecodedAudio => audioContext.decodeAudioData(undecodedAudio))
        .then(audioBuffer => {
            convolver.buffer = audioBuffer;
        })
        .catch(console.error);

    // Connect audio nodes
    source.connect(dryGainNode);
    dryGainNode.connect(audioContext.destination);
    source.connect(convolver);
    convolver.connect(wetGainNode);
    wetGainNode.connect(audioContext.destination);

    // Initially, only the dry signal should be heard
    dryGainNode.gain.value = 1;
    wetGainNode.gain.value = 0;

    // Toggle reverb on and off
    document.getElementById('reverbToggle').addEventListener('click', function() {
        if (!reverbOn) {
            // Both dry and wet signals should be heard
            dryGainNode.gain.value = 0.5;
            wetGainNode.gain.value = 0.5;
            reverbOn = true;
        } else {
            // Only the dry signal should be heard
            dryGainNode.gain.value = 1;
            wetGainNode.gain.value = 0;
            reverbOn = false;
        }
    });
}