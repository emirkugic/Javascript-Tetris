const gameBoard = document.querySelector(".game-board");
const boardWidth = 10;
const boardHeight = 20;
let score = 0;

let board = Array.from({ length: boardHeight }, () =>
	Array(boardWidth).fill(0)
);

const tetrominoes = [
	{
		shape: [[1, 1, 1, 1]],
		color: "cyan",
	},
	{
		shape: [
			[1, 1],
			[1, 1],
		],
		color: "yellow",
	},
	{
		shape: [
			[1, 0, 0],
			[1, 1, 1],
		],
		color: "blue",
	},
	{
		shape: [
			[0, 1, 1],
			[1, 1, 0],
		],
		color: "red",
	},
	{
		shape: [
			[1, 1, 0],
			[0, 1, 1],
		],
		color: "green",
	},
	{
		shape: [
			[0, 1, 0],
			[1, 1, 1],
		],
		color: "purple",
	},
	{
		shape: [
			[0, 1],
			[1, 1],
			[0, 1],
		],
		color: "orange",
	},
];

let currentTetromino = null;
let currentPosition = { x: 4, y: 0 };
let nextTetromino = tetrominoes[Math.floor(Math.random() * tetrominoes.length)];

function spawnTetromino() {
	currentTetromino = nextTetromino;
	nextTetromino = tetrominoes[Math.floor(Math.random() * tetrominoes.length)];
	currentPosition = { x: 4, y: 0 };

	if (!canMoveTo(currentPosition.x, currentPosition.y)) {
		displayGameOver();
		return;
	}

	drawBoard();
	drawNextTetromino();
}

function drawNextTetromino() {
	const nextTetrominoDiv = document.querySelector(".next-tetromino");
	nextTetrominoDiv.innerHTML = "";

	const shapeWidth = nextTetromino.shape[0].length;

	// Set the grid columns based on the shape's dimensions
	nextTetrominoDiv.style.gridTemplateColumns = `repeat(${shapeWidth}, 36px)`; // Adjusted to 36px to account for border

	for (let y = 0; y < nextTetromino.shape.length; y++) {
		for (let x = 0; x < nextTetromino.shape[y].length; x++) {
			const div = document.createElement("div");
			div.classList.add("cell");
			div.style.backgroundColor = nextTetromino.shape[y][x]
				? nextTetromino.color
				: "";
			nextTetrominoDiv.appendChild(div);
		}
	}
}

function canMoveTo(newX, newY) {
	for (let y = 0; y < currentTetromino.shape.length; y++) {
		for (let x = 0; x < currentTetromino.shape[y].length; x++) {
			if (currentTetromino.shape[y][x]) {
				let boardX = newX + x;
				let boardY = newY + y;

				if (
					boardX < 0 ||
					boardX >= boardWidth ||
					boardY >= boardHeight ||
					board[boardY][boardX] !== 0
				) {
					return false;
				}
			}
		}
	}
	return true;
}

function drawBoard() {
	gameBoard.innerHTML = "";
	for (let y = 0; y < boardHeight; y++) {
		for (let x = 0; x < boardWidth; x++) {
			const div = document.createElement("div");
			div.classList.add("cell");
			let color = board[y][x];
			if (
				y >= currentPosition.y &&
				y < currentPosition.y + currentTetromino.shape.length &&
				x >= currentPosition.x &&
				x < currentPosition.x + currentTetromino.shape[0].length &&
				currentTetromino.shape[y - currentPosition.y][x - currentPosition.x]
			) {
				color = currentTetromino.color;
				div.style.borderRight = "none";
				div.style.borderBottom = "none";
			}
			div.style.backgroundColor = color;
			gameBoard.appendChild(div);
		}
	}
}

function fixTetromino() {
	for (let y = 0; y < currentTetromino.shape.length; y++) {
		for (let x = 0; x < currentTetromino.shape[y].length; x++) {
			if (currentTetromino.shape[y][x]) {
				board[currentPosition.y + y][currentPosition.x + x] =
					currentTetromino.color;
			}
		}
	}
}

function moveTetromino(direction) {
	let newX = currentPosition.x;
	let newY = currentPosition.y;

	if (direction === "down") {
		newY += 1; // This is the line that was missing!
	} else if (direction === "left") {
		newX -= 1;
	} else if (direction === "right") {
		newX += 1;
	}

	if (canMoveTo(newX, newY)) {
		currentPosition.x = newX;
		currentPosition.y = newY;
		drawBoard();
	} else {
		if (direction === "down") {
			fixTetromino();
			clearLines();
			spawnTetromino();
		}
	}
}

function rotateTetromino() {
	const rotatedTetromino = currentTetromino.shape[0].map((_, index) =>
		currentTetromino.shape.map((row) => row[index])
	);
	rotatedTetromino.forEach((row) => row.reverse());

	const originalShape = currentTetromino.shape;
	currentTetromino.shape = rotatedTetromino;

	if (!canMoveTo(currentPosition.x, currentPosition.y)) {
		currentTetromino.shape = originalShape; // Revert rotation if not valid
	} else {
		drawBoard();
	}
}

function checkGameOver() {
	for (let x = 0; x < boardWidth; x++) {
		if (board[0][x] !== 0) {
			return true;
		}
	}
	return false;
}

function displayGameOver() {
	let gameOverDiv = document.querySelector(".game-over");

	if (!gameOverDiv) {
		gameOverDiv = document.createElement("div");
		gameOverDiv.classList.add("game-over");
		gameOverDiv.innerHTML = `
            <h1>Game Over</h1>
            <button onclick="restartGame()">Restart</button>
        `;

		gameBoard.appendChild(gameOverDiv);
	} else {
		gameOverDiv.style.display = "block";
	}
}

function restartGame() {
	const gameOverDiv = document.querySelector(".game-over");
	if (gameOverDiv) {
		gameOverDiv.style.display = "none"; // Hide the game over div
	}

	board = Array.from({ length: boardHeight }, () => Array(boardWidth).fill(0));
	score = 0;
	document.querySelector(".score").innerText = "Score: " + score;

	spawnTetromino();
}

function clearLines() {
	let linesCleared = 0;

	for (let y = boardHeight - 1; y >= 0; y--) {
		if (board[y].every((value) => value !== 0)) {
			// Remove line and add new one at the top
			board.splice(y, 1);
			board.unshift(Array(boardWidth).fill(0));
			y++; // Check the same line index again as we removed a line
			linesCleared++;
		}
	}

	switch (linesCleared) {
		case 1:
			score += 40;
			break;
		case 2:
			score += 100;
			break;
		case 3:
			score += 300;
			break;
		case 4:
			score += 1200;
			break;
	}

	// Update score on the screen
	document.querySelector(".score").innerText = "Score: " + score;
}

document.addEventListener("keydown", function (event) {
	if (event.keyCode === 37) {
		moveTetromino("left");
	} else if (event.keyCode === 39) {
		moveTetromino("right");
	}

	if (event.keyCode === 38) {
		// Up arrow
		rotateTetromino();
	}

	if (event.keyCode === 40) {
		// Down arrow
		moveTetromino("down");
	}
});

spawnTetromino();

setInterval(() => {
	moveTetromino("down");
}, 1000);
