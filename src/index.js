import Granular from './Granular';

import p5 from 'p5';
import 'p5/lib/addons/p5.sound';


import Waveform from './Waveform';
import Grains from './Grains';
import DragAndDrop from './DragAndDrop';
import AutoPlay from './AutoPlay';

import { Pane } from 'tweakpane';

const pane = new Pane();
pane.title = 'Granular Synthesizer';
pane.expanded = true;

let att = 0.1;
let dec = 0.1;
let dens = 0.1;
let spr = 0.1;
let pit = 0.1;

//grnaular js params
const PARAMS = {
  attack: 0.1,
  decay: 0.1,
  density: 0.7,
  spread: 0.5,
  pitch: 1
};

pane.addSeparator();
const grain = pane.addFolder({
  title: 'Granular Parameters',
  expanded: true
});
pane.addSeparator();
const envelope = grain.addFolder({
  title: 'Envelope',
  expanded: true
});
const attInput = envelope.addInput(PARAMS, 'attack', { min: 0.0, max: 1.0, step: 0.1 });
const decInput = envelope.addInput(PARAMS, 'decay', { min: 0.0, max: 1.0, step: 0.1 });
grain.addSeparator();
const granularparams = grain.addFolder({
  title: 'Granulation Parameters',
  expanded: true
});
const densityInput = granularparams.addInput(PARAMS, 'density', { min: 0.1, max: 1.0, step: 0.1 });
const spreadInput = granularparams.addInput(PARAMS, 'spread', { min: 0.1, max: 1, step: 0.1 });
//const pitchInput = granularparams.addInput(PARAMS, 'pitch', { min: 0.1, max: 1, step: 0.1 });




async function getData(url) {
  return new Promise((resolve) => {
    const request = new XMLHttpRequest();

    request.open('GET', url, true);

    request.responseType = 'arraybuffer';

    request.onload = function () {
      const audioData = request.response;

      resolve(audioData);
    }

    request.send();
  });
}



const PRESETS = [
  {
    name: 1,
    url: './example1.mp3'
  },
  {
    name: 2,
    url: './example2.mp3'
  },
  {
    name: 3,
    url: './example3.mp3'
  },
  {
    name: 4,
    url: './example4.mp3'
  },
  {
    name: 5,
    url: './example.wav'
  }
];

const pillPlay = document.getElementById('pill-play'),
  pillLoading = document.getElementById('pill-loading'),
  pillTitle = document.getElementById('pill-title'),
  canvases = document.getElementById('canvases'),
  presets = document.getElementById('presets');

let autoPlay,
  dragAndDrop,
  granular;

const AUDIO_BUFFER_CACHE = {};

function stopPropagation(event) {
  event.stopPropagation();
}

async function loadUserData(data) {
  autoPlay.stop();

  pillPlay.textContent = 'Play';

  pillLoading.classList.remove('hidden');
  pillPlay.classList.add('inactive');
  presets.classList.add('inactive');

  const buttons = Array.from(document.querySelectorAll('#presets .preset'));

  buttons.forEach(b => b.classList.add('pill-inverted'));

  await granular.setBuffer(data);

  pillLoading.classList.add('hidden');
  pillPlay.classList.remove('inactive');
  presets.classList.remove('inactive');
}

async function loadPreset({ name, url }) {
  if (process.ENV === 'development') {
    console.log(`load preset ${name}`);
  }

  autoPlay.stop();

  pillPlay.textContent = 'Play';

  pillLoading.classList.remove('hidden');
  pillPlay.classList.add('inactive');
  presets.classList.add('inactive');

  let data;

  if (AUDIO_BUFFER_CACHE[name]) {

    // AudioBuffer
    data = AUDIO_BUFFER_CACHE[name];
  } else {

    // ArrayBuffer
    data = await getData(url);
  }

  const audioBuffer = await granular.setBuffer(data);

  AUDIO_BUFFER_CACHE[name] = audioBuffer;

  pillLoading.classList.add('hidden');
  pillPlay.classList.remove('inactive');
  presets.classList.remove('inactive');
}

function createPresets(data, text) {
  PRESETS.forEach((preset) => {
    const { name } = preset;

    const button = document.createElement('div');

    button.classList.add('preset', 'pill', 'pill-inverted', 'pill-button');

    button.textContent = name;

    button.addEventListener('click', () => {
      const buttons = Array.from(document.querySelectorAll('#presets .preset'));

      buttons.forEach((b) => {
        if (button === b) {
          b.classList.remove('pill-inverted');
        } else {
          b.classList.add('pill-inverted');
        }
      });


      loadPreset(preset);
    });

    presets.appendChild(button);
  });
}

async function init() {
  const audioContext = p5.prototype.getAudioContext();

  granular = new Granular({
    audioContext,
    envelope: {
      attack: 0,
      decay: 0.5
    },
    density: 0.8,
    spread: 0.1,
    pitch: 1
  });

  attInput.on('change', function (ev) {
    att = parseFloat(ev.value.toFixed(1));
    console.log(att);
    granular.set({
      envelope: { attack: att }
    });

  });
  decInput.on('change', function (ev) {
    dec = parseFloat(ev.value.toFixed(1));
    console.log(dec);
    granular.set({
      envelope: { decay: dec }
    });
  });
  densityInput.on('change', function (ev) {
    dens = parseFloat(ev.value.toFixed(1));
    console.log(dens);
    granular.set({
      density: dens
    });
  });
  spreadInput.on('change', function (ev) {
    spr = parseFloat(ev.value.toFixed(1));
    console.log(spr);
    granular.set({
      spread: spr
    });
  });
  /*
  pitchInput.on('change', function (ev) {
    pit = parseFloat(ev.value.toFixed(1));
    console.log(spr);
    granular.set({
      pitch: pit
    });
  });
*/

  /*
  const delay = new p5.Delay();

  delay.process(granular, 0.5, 0.5, 3000); // source, delayTime, feedback, filter frequency

  const reverb = new p5.Reverb();

  // due to a bug setting parameters will throw error
  // https://github.com/processing/p5.js/issues/3090
  reverb.process(delay); // source, reverbTime, decayRate in %, reverse

  reverb.amp(3);

  const compressor = new p5.Compressor();

  compressor.process(reverb, 0.005, 6, 10, -24, 0.05); // [attack], [knee], [ratio], [threshold], [release]
*/
  const waveform = new Waveform();

  new Grains(granular);

  dragAndDrop = new DragAndDrop(canvases);

  dragAndDrop.on('fileRead', async ({ data }) => {
    loadUserData(data);
  });

  granular.on('bufferSet', ({ buffer }) => {
    waveform.draw(buffer);
  });

  autoPlay = new AutoPlay(granular);

  pillPlay.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (autoPlay.isRunning()) {
      autoPlay.stop();

      pillPlay.textContent = 'Play';
    } else {
      autoPlay.start();

      pillPlay.textContent = 'Stop';
    }
  });

  window.addEventListener('keydown', (key) => {

    // space
    if (event.keyCode === 32) {
      if (autoPlay.isRunning()) {
        autoPlay.stop();

        pillPlay.textContent = 'Play';
      } else {
        autoPlay.start();

        pillPlay.textContent = 'Stop';
      }
    }
  });

  createPresets();

  const buttons = Array.from(document.querySelectorAll('#presets .preset'));

  buttons.concat([pillPlay, pillTitle]).forEach(element => {
    [
      'click',
      'mousedown',
      'touchstart'
    ].forEach(event => {
      element.addEventListener(event, stopPropagation);
    });
  });

  buttons[0].classList.remove('pill-inverted');

  await loadPreset(PRESETS[0]);

  pillPlay.classList.add('animated', 'pulse');
}

init();