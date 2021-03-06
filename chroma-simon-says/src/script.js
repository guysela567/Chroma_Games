const colors = {
  '#ff0000': { key: '6', color: 'red', i: 3, j: 20, hexColor: 0x0000ff },
  '#ffff00': { key: '2', color: 'blue', i: 4, j: 19, hexColor: 0xff0000 },
  '#0000ff': { key: '4', color: 'yellow', i: 3, j: 18, hexColor: 0x00ffff },
  '#00ff00': { key: '8', color: 'green', i: 2, j: 19, hexColor: 0x00ff00 },
}

const keys = {
  '6': { i: 3, j: 20, hexColor: 0x0000ff },
  '2': { i: 4, j: 19, hexColor: 0xff0000 },
  '4': { i: 3, j: 18, hexColor: 0x00ffff },
  '8': { i: 2, j: 19, hexColor: 0x00ff00 },
}

let sequence = [];

let chromaSDK;

let started = false;
let state = 'show';
let listenIndex = 0;

let endgameElement;
let everStarted = false;
let score = 0;

function pageLoad() {
  chromaSDK = new ChromaSDK();
  chromaSDK.init();
  endgameElement = document.querySelector('#endgame');

  document.addEventListener('keydown', e => {
    if (e.code.startsWith('Numpad') && state == 'listen') {
      const key = e.code.substring(6);
      if (key == sequence[listenIndex].key) {
        if (listenIndex == sequence.length - 1) {
          continueSequence();
          score++;
          endgameElement.textContent = `Score: ${score}`;
        } else {
          listenIndex++;
        }
        updateLEDs(keys[key])
      } else if (Object.keys(keys).includes(key)) {
        if (!everStarted)
          endgameElement.textContent = `You lost with the score of ${score}, try again!`;
        else everStarted = true;
        reset();
        chromaSDK.createKeyboardEffect('CHROMA_STATIC', 0xff);
      }
    }
    if (e.key == ' ') startGame();
  });

}
function startGame() {
  reset();
  endgameElement.textContent = `Score: ${score}`;
  started = true;
  chromaSDK.createKeyboardEffect('CHROMA_STATIC', 0x00ffff);
  setTimeout(() => chromaSDK.createKeyboardEffect('CHROMA_STATIC', 0), 500);
  continueSequence();
}

function reset() {
  score = 0;
  started = false;
  console.clear();
  sequence = [];
  state = 'show';
}

function pageUnload() {
  chromaSDK.uninit();
}

async function continueSequence() {
  sequence.push(colors[Object.keys(colors)[[Math.floor(Math.random() * 4)]]]);
  state = 'show';
  await sleep(1000);
  for (let s of sequence) {
    console.log('%c' + s.key, `color: ${s.color}; font-weight: bold;`);
    updateLEDs(s);
    await sleep(500);
  }
  state = 'listen';
  listenIndex = 0;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function updateLEDs(s) {
  const keyGrid = Array(6).fill(0).map(() => Array(22).fill(0));
  keyGrid[s.i][s.j] = s.hexColor;
  chromaSDK.createKeyboardEffect('CHROMA_CUSTOM', keyGrid);
  setTimeout(() => { if (started) chromaSDK.createKeyboardEffect('CHROMA_STATIC', 0) }, 300);
}
