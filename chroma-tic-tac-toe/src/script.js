const colors = {
	red: 0xff,
	green: 0xff00,
	black: 0,
	yellow: 0xffff,
	blue: 0xff0000
}

const numpadGrid = [
	[7, 8, 9],
	[4, 5, 6],
	[1, 2, 3]
];

const startX = 18;
const startY = 2;

let endgameElement;
let chromaSDK;
let keyGrid = createKeyGrid();
let ready = false;
let started = false;

let ai = 'O';
let human = 'X';
let currentPlayer = human;

let board = Array(3).fill(0).map(() => Array(3).fill(''));

function pageLoad() {
	chromaSDK = new ChromaSDK();
	chromaSDK.init();
	endgameElement = document.querySelector('#endgame');

	document.addEventListener('keydown', e => {
		if (e.code == 'Space') startResetGame();
		if (e.code.startsWith('Numpad') && ready) {
			if (!started) started = true;
			const key = parseInt(e.code.substring(6));
			for (let i = 0; i < numpadGrid.length; i++) {
				const row = numpadGrid[i];
				if (row.includes(key)) {
					const j = row.indexOf(key);
					if (board[i][j] == '') {
						board[i][j] = human;
						currentPlayer = ai;
						updateLEDs();
						if (checkWinner() != human) {
							if (!gridFull()) {
								bestMove();
								updateLEDs();
								if (checkWinner() == ai) setTimeout(lose, 400);
							} else {
								updateLEDs();
								setTimeout(tie, 400);
							}
						} else setTimeout(win, 400);
					}
				}
			}
		}
	});
}

function tie() {
	ready = false;
	chromaSDK.createKeyboardEffect('CHROMA_STATIC', colors.yellow);
	endgameElement.style.color = 'orange';
	endgameElement.textContent = 'It\'s tie!';
}

function win() {
	ready = false;
	chromaSDK.createKeyboardEffect('CHROMA_STATIC', colors.green);
	endgameElement.style.color = 'green';
	endgameElement.textContent = 'You won! great job!';
}

function lose() {
	ready = false;
	chromaSDK.createKeyboardEffect('CHROMA_STATIC', colors.red);
	endgameElement.style.color = 'red';
	endgameElement.textContent = 'You lost... try again!';
}

function startResetGame() {
	currentPlayer = human;
	board = Array(3).fill(0).map(() => Array(3).fill(''));
	keyGrid = createKeyGrid();
	endgameElement.textContent = '';
	ready = true;
	started = false;
	chromaSDK.createKeyboardEffect('CHROMA_CUSTOM', keyGrid);
}

function gridFull() {
	for (let i = 0; i < 3; i++)
		for (let j = 0; j < 3; j++)
			if (board[i][j] == '') return false
	return true;
}

function updateLEDs() {
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			const value = board[i][j];
			keyGrid[startY + i][startX + j] = value == human ? colors.green : value == ai ? colors.red : colors.black;
		}
	}

	chromaSDK.createKeyboardEffect('CHROMA_CUSTOM', keyGrid);
}

function equals3(a, b, c) {
	return a == b && b == c && a != '';
}

function checkWinner() {
	let winner = null;

	// horizontal
	for (let i = 0; i < 3; i++) {
		if (equals3(board[i][0], board[i][1], board[i][2])) {
			winner = board[i][0];
		}
	}

	// Vertical
	for (let i = 0; i < 3; i++) {
		if (equals3(board[0][i], board[1][i], board[2][i])) {
			winner = board[0][i];
		}
	}

	// Diagonal
	if (equals3(board[0][0], board[1][1], board[2][2])) {
		winner = board[0][0];
	}
	if (equals3(board[2][0], board[1][1], board[0][2])) {
		winner = board[2][0];
	}

	let openSpots = 0;
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			if (board[i][j] == '') {
				openSpots++;
			}
		}
	}

	if (winner == null && openSpots == 0) {
		return 'tie';
	} else {
		return winner;
	}
}

function createKeyGrid() {
	const arr = Array(6).fill(0).map(() => Array(22).fill(colors.blue));
	for (let i = 0; i < 3; i++) {
		for (let j = 0; j < 3; j++) {
			arr[startY + i][startX + j] = colors.black;
		}
	}

	return arr;
}

function pageUnload() {
	chromaSDK.uninit();
}