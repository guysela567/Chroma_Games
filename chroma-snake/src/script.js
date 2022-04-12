const cols = 10;
const rows = 3;
const ix = 2;
const iy = 2;
const keyW = 22;
const keyH = 6;
const red = 0xff;
const green = 0xff00
const intervalGap = 400;
const snakeDefaultX = ix + 5;
const snakeDefaultY = iy + 1;
let scoreElt;
let paused = false;

let chromaSDK;
let grid;
let snakeX;
let snakeY;
let foodX;
let foodY;
let dirX = 0;
let dirY = 0;
let tail = [];
let frameInterval;

function pageLoad() {
	scoreElt = document.querySelector('#score');
	chromaSDK = new ChromaSDK();
	chromaSDK.init();

	createSnake();
	createFood();
	frameInterval = setInterval(frame, intervalGap);

	document.addEventListener('keydown', (e) => {
		switch (e.code) {
			case 'ArrowLeft':
				if (dirX != 1) {
					dirX = -1;
					dirY = 0;
				}
				break;
			case 'ArrowUp':
				if (dirY != 1) {
					dirY = -1;
					dirX = 0;
				}
				break;
			case 'ArrowRight':
				if (dirX != -1) {
					dirX = 1;
					dirY = 0;
				}
				break;
			case 'ArrowDown':
				if (dirY != -1) {
					dirY = 1;
					dirX = 0;
				}
				break;
			case 'KeyR':
				reset();
				break;
		}
	});
}

function frame() {
	if (paused) chromaSDK.createKeyboardEffect('CHROMA_STATIC', red);
	else {
		moveSnake();
		if (checkDeath()) gameOver();

		if (snakeX == foodX && snakeY == foodY) eatFood();

		createGrid();
		chromaSDK.createKeyboardEffect('CHROMA_CUSTOM', grid)
	}
}

function checkDeath() {
	// check if snake's head hits his tail
	for (let t of tail)
		if (snakeX == t[0] && snakeY == t[1]) return true;

	// check if snake is offscreen
	return (snakeY < iy || snakeY > iy + rows - 1 || snakeX < ix || snakeX > ix + cols - 1)
}

function gameOver() {
	paused = true;
	scoreElt.textContent = `You died with the score of ${tail.length}! Press R to start over.`;
}

function eatFood() {
	createFood();
	if (tail.length > 0) tail.push(tail[tail.length - 1]);
	else tail.push([snakeX, snakeY]);
	scoreElt.textContent = `Score: ${tail.length}`
}

function moveSnake() {
	// move tail
	if (tail.length > 0) {
		for (let i = tail.length - 1; i > 0; i--) tail[i] = tail[i - 1];
		tail[0] = [snakeX, snakeY]
	}

	// move head
	snakeX += dirX;
	snakeY += dirY;
}

function createGrid() {
	// create black grid
	grid = Array(keyH);
	for (let i = 0; i < grid.length; i++) {
		grid[i] = Array(keyW).fill(0);
	}

	if (snakeX == foodX && snakeY == foodY) createFood();

	grid[foodY][foodX] = red; // add food
	grid[snakeY][snakeX] = green; // add snake

	// add tail
	for (let t of tail) {
		grid[t[1]][t[0]] = green;
	}
}

function pageUnload() {
	chromaSDK.uninit();
}

function createSnake() {
	tail = [];
	snakeX = snakeDefaultX;
	snakeY = snakeDefaultY;
}

function createFood() {
	const options = [];
	for (let i = iy; i < iy + rows; i++) {
		for (let j = ix; j < ix + cols; j++) {
			options.push([i, j])
		}
	}

	// exclude snake's head and tail from options
	remove(options, snakeX, snakeY)
	for (let t of tail) remove(options, t[0], t[1]);

	const chosen = Math.floor(Math.random() * options.length);
	foodX = options[chosen][1];
	foodY = options[chosen][0]
}

function remove(arr, x, y) {
	for (let i = arr.length - 1; i >= 0; i--) {
		if (arr[i][0] == y && arr[i][1] == x) arr.splice(i, 1);
	}
}

function reset() {
	tail = [];
	scoreElt.textContent = `Score: ${tail.length}`
	clearInterval(frameInterval);
	createSnake();
	createFood();
	createGrid();
	dirX = 0;
	dirY = 0;
	paused = false;
	frameInterval = setInterval(frame, intervalGap);
}