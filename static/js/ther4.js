/*Freely adapted from:
https://mdn.github.io/webaudio-examples/violent-theremin/
 */

// create web audio api context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// create Oscillator and Gain node
const oscillator = audioCtx.createOscillator();
const gainNode = audioCtx.createGain();

oscillator.type = 'sine';//'square';
// oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // value in hertz

// connect oscillator to gain node to speakers
oscillator.connect(gainNode);
gainNode.connect(audioCtx.destination);

// create initial theremin frequency and volume values
const WIDTH = window.innerWidth;
const HEIGHT = window.innerHeight;

const maxFreq = 6000;
const maxVol = 0.05;
// const initialVol = 0.001;
const initialVol = 0.01;

// set options for the oscillator
// oscillator.detune.value = 100; // value in cents
// oscillator.start(0);

// oscillator.onended = function() {
//     console.log('Your tone has now stopped playing!');
// };

gainNode.gain.value = initialVol;
gainNode.gain.minValue = initialVol;
gainNode.gain.maxValue = initialVol;

//buttons logic:
document.querySelectorAll('button').forEach(occurence => {
    let id = occurence.getAttribute('id'); //id= btn1, (start), btn2 (stop)
    occurence.addEventListener('click', function() {
        let message;
        if (id == 'btn1'){
            message = 'Sound ON';
            oscillator.start();
        }
        if (id == 'btn2'){
            message = 'Sound OFF';
            oscillator.stop();
            window.location.reload();//this to refresh the page; there must be a better way to 'reset' the buttons
        }
        document.getElementById('debug').innerHTML = message;
    });
});

//cursor math:
let CurX;
let CurY;
document.onmousemove = updatePage;

function updatePage(e) {
    KeyFlag = false;

    CurX = e.pageX;
    CurY = e.pageY;

    oscillator.frequency.value = (CurX/WIDTH) * maxFreq;
    gainNode.gain.value = (CurY/HEIGHT) * maxVol;
}