/*Freely adapted from:
https://mdn.github.io/webaudio-examples/violent-theremin/
 */

// create web audio api context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// create Oscillator and Gain node
// const oscillator = audioCtx.createOscillator();
// oscillator.type = 'sine';//'square';
// oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // value in hertz
const gainNode = audioCtx.createGain();

// Create second oscillator
// const oscillator2 = audioCtx.createOscillator();
// oscillator2.type = 'sine';

// connect oscillator(s) to gain node to speakers
// oscillator.connect(gainNode);
// oscillator2.connect(gainNode);
// gainNode.connect(audioCtx.destination);

// create initial theremin frequency and volume values
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const maxFreq = 6000;
const maxVol = 0.05;
// const initialVol = 0.001;
const initialVol = 0.01;

gainNode.gain.value = initialVol;
gainNode.gain.minValue = initialVol;
gainNode.gain.maxValue = initialVol;


let isOscillator1Playing = false;
let isOscillator2Playing = false;

let oscillator1 = null;
let oscillator2 = null;

function createOscillator() {
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.connect(gainNode);
    return osc;
}

document.getElementById('osc1Button').addEventListener('click', function() {
    if (oscillator1) {
        oscillator1.stop();
        oscillator1 = null;
        this.style.backgroundColor = ""; // Reset button color
        console.log('Oscillator 1 stopped');
    } else {
        oscillator1 = createOscillator();
        oscillator1.type = 'sine';
        oscillator1.connect(gainNode);
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
        oscillator2.type = 'sine';
        oscillator2.connect(gainNode);
        oscillator2.start();
        this.style.backgroundColor = "green"; // Change button color to green
        console.log('Oscillator 2 started');
    }
});

// Connect Gain to Output
gainNode.connect(audioCtx.destination);

// Add buttons to increase and decrease detune amount
document.getElementById('increaseDetune').addEventListener('click', function() {
    oscillator2.detune.value += 1;
    document.getElementById('detuneAmount').textContent = `Detune: ${oscillator2.detune.value} cents`;
});
document.getElementById('decreaseDetune').addEventListener('click', function() {
    oscillator2.detune.value -= 1;
    document.getElementById('detuneAmount').textContent = `Detune: ${oscillator2.detune.value} cents`;
});

//cursor math:
let CurX;
let CurY;
document.onmousemove = updatePage;

function updatePage(e) {
    KeyFlag = false;

    CurX = e.pageX;
    CurY = e.pageY;

    oscillator1.frequency.value = (CurX/WIDTH) * maxFreq;
    oscillator2.frequency.value = (CurX/WIDTH) * maxFreq;
    gainNode.gain.value = (CurY/HEIGHT) * maxVol;
}