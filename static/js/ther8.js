
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
    // osc.connect(gainNode);
    return osc;
}

// listen for clicks
document.getElementById('osc1Button').addEventListener('click', function() {
    if (oscillator1 && !oscillator2) {
        oscillator1.stop();
        oscillator1 = null;
        this.style.backgroundColor = ""; // Reset button color
        console.log('Oscillator 1 stopped');
    } else {
        if (oscillator1) {
            oscillator1.stop();
            oscillator1 = null;
        }
        if (oscillator2) {
            oscillator2.stop();
            oscillator2 = null;
            document.getElementById('osc2syncButton').style.backgroundColor = ""; // Reset button color
        }
        oscillator1 = createOscillator();
        oscillator1.start(audioCtx.currentTime);
        this.style.backgroundColor = "green"; // Change button color to green
        console.log('Oscillator 1 started');
    }
});

document.getElementById('osc2syncButton').addEventListener('click', function() {
    if (oscillator1 && oscillator2) {
        oscillator1.stop();
        oscillator2.stop();
        oscillator1 = null;
        oscillator2 = null;
        this.style.backgroundColor = ""; // Reset button color
        document.getElementById('osc1Button').style.backgroundColor = ""; // Reset button color
        console.log('Oscillators stopped');
    } else {
        if (oscillator1) {
            oscillator1.stop();
            oscillator1 = null;
            document.getElementById('osc1Button').style.backgroundColor = ""; // Reset button color
        }
        oscillator1 = createOscillator();
        oscillator2 = createOscillator();
        oscillator1.start(audioCtx.currentTime);
        oscillator2.start(audioCtx.currentTime);
        this.style.backgroundColor = "green"; // Change button color to green
        console.log('Oscillators started');
    }
});

// Add buttons to increase and decrease detune amount
document.getElementById('increaseDetune').addEventListener('click', function() {
    oscillator2.detune.value += 1;
    document.getElementById('detuneAmount').textContent = `${oscillator2.detune.value} cents`;
});
document.getElementById('decreaseDetune').addEventListener('click', function() {
    oscillator2.detune.value -= 1;
    document.getElementById('detuneAmount').textContent = `${oscillator2.detune.value} cents`;
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

//

// Create an analyser node
const analyser = audioCtx.createAnalyser();

// Connect the gain node to the analyser
gainNode.connect(analyser);

// Set up the analyser
analyser.fftSize = 2048; //256;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

// Get a reference to the canvas and its context
const canvas = document.getElementById('canvas');
const canvasContext = canvas.getContext('2d');

// Function to draw the spectrum
function draw() {
  requestAnimationFrame(draw);

  // Get the frequency data
  analyser.getByteFrequencyData(dataArray);

  // Clear the canvas
  canvasContext.fillStyle = 'black';
  canvasContext.fillRect(0, 0, canvas.width, canvas.height);

  // Draw the spectrum
  const maxFreq = 4000;
  const maxIndex = Math.round(maxFreq / (audioCtx.sampleRate / 2) * bufferLength); // Calculate the index corresponding to maxFreq
  const barWidth = (canvas.width / maxIndex); // Adjust the bar width
  let barHeight;
  let x = 0;

  for(let i = 0; i < maxIndex; i++) {
    barHeight = dataArray[i];

    canvasContext.fillStyle = 'blue';
    canvasContext.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);

    // Draw the frequency scale
    if(i % 10 === 0) {
        canvasContext.fillStyle = 'white';
        canvasContext.fillText((i / maxIndex * maxFreq).toFixed(0), x, canvas.height - 2); // + ' Hz'
    }

    x += barWidth + 1;
  }
}

// Call the draw function
draw();