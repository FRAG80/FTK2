
// create web audio api context
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Create a ConvolverNode
const convolver = audioCtx.createConvolver();

// Create a DelayNode
const delay = audioCtx.createDelay();

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
// const gainNode = audioCtx.createGain();
const reverbGain = audioCtx.createGain();
const delayGain = audioCtx.createGain();
const feedbackGain = audioCtx.createGain();
const combinedGain = audioCtx.createGain();

// const initialVol = 0.001;
const initialVol = 0.01;
reverbGain.gain.value = delayGain.gain.value = 1.0;
feedbackGain.gain.value = 0.4;
combinedGain.gain.value = initialVol;

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
//// OSC1 on/off button
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

//// OSC1+OSC2 on/off button
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

//// OSC2 detune up/down buttons
document.getElementById('increaseDetune').addEventListener('click', function() {
    oscillator2.detune.value += 1;
    document.getElementById('detuneAmount').textContent = `${oscillator2.detune.value} cents`;
});
document.getElementById('decreaseDetune').addEventListener('click', function() {
    oscillator2.detune.value -= 1;
    document.getElementById('detuneAmount').textContent = `${oscillator2.detune.value} cents`;
});

//// Delay on/off button
document.getElementById('delayButton').addEventListener('click', function() {
    if (delay.delayTime.value > 0) {
        delay.delayTime.value = 0;
        this.textContent = 'Delay';
        this.style.backgroundColor = ""; // Reset button color
    } else {
        delay.delayTime.value = 0.5; // 500 ms delay
        this.textContent = 'Delay';
        this.style.backgroundColor = "green"; // Change button color to green
    }
});

//Tap Tempo moving average and light effect
let lastTap = Date.now();
let isButtonActive = false;
let tapTimes = [];

document.getElementById('tapTempoButton').addEventListener('mousedown', function() {
    const now = Date.now();
    tapTimes.push(now - lastTap); // Store the time difference between taps
    lastTap = now; // Update the time of the last tap

    if (tapTimes.length >= 3) { // Only update the tempo after at least 3 taps
        const averageDelayTime = tapTimes.reduce((a, b) => a + b) / tapTimes.length; // Calculate the average time difference between taps
        delay.delayTime.value = Math.min(averageDelayTime / 1000, 1); // Convert to seconds and update the delay time

        // Convert the average tap time to BPM
        const averageBPM = 60 / (averageDelayTime / 1000);
        
        // Update the average tap time display
        document.getElementById('averageTapTime').textContent = averageBPM.toFixed(1) + ' BPM';
    }

    if (tapTimes.length > 3) { // Keep a moving average for more than 3 taps
        tapTimes.shift(); // Remove the oldest tap time
    }

    this.classList.add('active'); // Show the light effect
    console.log(this.classList); // Log the class list of the button
    isButtonActive = true;

    // Remove the 'active' class after 0.3 seconds
    setTimeout(() => {
        this.classList.remove('active');
    }, 300);
});

window.addEventListener('mouseup', function() {
    if (isButtonActive) {
        document.getElementById('tapTempoButton').classList.remove('active'); // Hide the light effect
        isButtonActive = false;
    }
});

// Connect the convolver to the delay node and to its own 'dry' gain
convolver.connect(delay);
convolver.connect(reverbGain); // 'dry' gain

// Connect the delay to the feedback loop
delay.connect(feedbackGain);
feedbackGain.connect(delay);

// Connect the delay to the gain node   
delay.connect(delayGain); // 'wet' gain

delayGain.connect(combinedGain);
reverbGain.connect(combinedGain);

// Connect Gain to Output
// gainNode.connect(audioCtx.destination);
// reverbGain.connect(audioCtx.destination);
// delayGain.connect(audioCtx.destination);
combinedGain.connect(audioCtx.destination);


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
    // gainNode.gain.value = ((HEIGHT-CurY)/HEIGHT) * maxVol;
    // reverbGain.gain.value = ((HEIGHT-CurY)/HEIGHT) * maxVol;
    // delayGain.gain.value = ((HEIGHT-CurY)/HEIGHT) * maxVol;
    combinedGain.gain.value = ((HEIGHT-CurY)/HEIGHT) * maxVol + 0.02;
}

//

// Create an analyser node
const analyser = audioCtx.createAnalyser();

// Connect the gain node to the analyser
// gainNode.connect(analyser);
// reverbGain.connect(analyser);
// delayGain.connect(analyser);
combinedGain.connect(analyser)
// Set up the analyser
analyser.fftSize = 2048; //256;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

// Get a reference to the canvas and its context
const canvas = document.getElementById('canvas');
canvas.width = canvas.offsetWidth; //600; // Adjust as needed
canvas.height = canvas.offsetHeight; //300; // Adjust as needed
const canvasContext = canvas.getContext('2d');

// Get a reference to the background-canvas and its context
var backgroundCanvas = document.getElementById('background-canvas');
backgroundCanvas.width = canvas.offsetWidth; //600; // Adjust as needed
backgroundCanvas.height = canvas.offsetHeight; //300; // Adjust as needed
var backgroundContext = backgroundCanvas.getContext('2d');



// Draw the semi-transparent black background on the second canvas
backgroundContext.fillStyle = 'rgba(0,0,0,0.5)';
backgroundContext.fillRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);

// Function to draw the spectrum
function draw() {
  requestAnimationFrame(draw);

  // Get the frequency data
  analyser.getByteFrequencyData(dataArray);

// Clear the canvas, but keep the semi-transparent black background
  canvasContext.clearRect(0, 0, canvas.width, canvas.height );

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