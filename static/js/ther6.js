
// create web audio api context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Create a ConvolverNode
const convolver = audioCtx.createConvolver();

// Load an impulse response
fetch('../static/wav/IRs/capricorn-ir-1-101345.mp3') //rocksta_copy.wav')
    .then(response => response.arrayBuffer())
    .then(data => audioCtx.decodeAudioData(data))
    .then(buffer => {
        convolver.buffer = buffer;
    })
    .catch(err => {
        console.log('Error loading impulse response:', err);
    });

// Create a GainNode
const gainNode = audioCtx.createGain();

// const initialVol = 0.001;
const initialVol = 0.01;
gainNode.gain.value = gainNode.gain.minValue = gainNode.gain.maxValue = initialVol;

// create initial theremin frequency and volume values
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const maxFreq = 4000;
const maxVol = 0.05;

// Osc statuses
let isOscillator1Playing = false;
let isOscillator2Playing = false;
// free the variables at the start
let oscillator1 = null;
let oscillator2 = null;

// this f creates an oscillator on the fly
function createOscillator() {
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.connect(convolver);
    return osc;
}

// listen for clicks
document.getElementById('osc1Button').addEventListener('click', function() {
    if (oscillator1) {
        oscillator1.stop();
        oscillator1 = null;
        this.style.backgroundColor = ""; // Reset button color
        console.log('Oscillator 1 stopped');
    } else {
        oscillator1 = createOscillator();
        oscillator1.start();
        this.style.backgroundColor = "green"; // Change button color to green
        console.log('Oscillator 1 started');
    }
});

document.getElementById('osc2Button').addEventListener('click', function() {
    if (oscillator2) {
        oscillator2.stop();
        oscillator2 = null;
        this.style.backgroundColor = ""; // Reset button color
        console.log('Oscillator 2 stopped');
    } else {
        oscillator2 = createOscillator();
        oscillator2.start();
        this.style.backgroundColor = "green"; // Change button color to green
        console.log('Oscillator 2 started');
    }
});

// Add buttons to increase and decrease detune amount
document.getElementById('increaseDetune').addEventListener('click', function() {
    oscillator2.detune.value += 1;
    document.getElementById('detuneAmount').textContent = `Detune: ${oscillator2.detune.value} cents`;
});
document.getElementById('decreaseDetune').addEventListener('click', function() {
    oscillator2.detune.value -= 1;
    document.getElementById('detuneAmount').textContent = `Detune: ${oscillator2.detune.value} cents`;
});


// Connect the convolver to the dry gain node
convolver.connect(gainNode);
// Connect Gain to Output
gainNode.connect(audioCtx.destination);


//cursor math:
let CurX;
let CurY;
document.onmousemove = updatePage;

function updatePage(e) {
    KeyFlag = false;

    CurX = e.pageX;
    CurY = e.pageY;

    if (oscillator1){
        oscillator1.frequency.value = (CurX/WIDTH) * maxFreq;
    }
    if (oscillator2){
        oscillator2.frequency.value = (CurX/WIDTH) * maxFreq;
    }
    gainNode.gain.value = ((HEIGHT-CurY)/HEIGHT) * maxVol;
}