const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const assetsOnline = 'https://raw.githubusercontent.com/riiamri23/gamelist/3fa07387e471f823aa4bb7fc49525e0ece2f35bb/released/snake/';

const headX = 10;
const headY = 10;
const parts = [];

const appleX = 5;
const appleY = 5;
const tileCountX = 20;
const tileCountY = 15;
const tileSize = Math.floor(Math.min(canvas.width / tileCountX, canvas.height / tileCountY));
const tileSizeX = tileSize;
const tileSizeY = tileSize;
const offsetX = Math.floor((canvas.width - tileSize * tileCountX) / 2);
const offsetY = Math.floor((canvas.height - tileSize * tileCountY) / 2);
let velocityX = 1; // Change this line to start moving right
let velocityY = 0;

const speed = 7;

// Remove sound effects
// const gulpSound = new Audio(`${assetsOnline}assets/gulp.mp3`);
// const gameOverSound = new Audio(`${assetsOnline}assets/game-over.mp3`);

// Remove the predefined obstacles
// const obstacles = [
//     { X: 8, Y: 8 },
//     { X: 12, Y: 5 },
//     { X: 15, Y: 10 },
//     // Add more obstacles as needed
// ];

const obstacles = [];

// Add a new obstacle generation function with connectivity checks
function generateObstacles() {
    const obstacleCount = Math.floor((tileCountX * tileCountY) * 0.075); // Reduced to 7.5% obstacles for better playability
    const allCells = [];

    // Calculate the cells immediately ahead of the snake's starting position
    const initialFrontX1 = (headX + velocityX + tileCountX) % tileCountX;
    const initialFrontY1 = (headY + velocityY + tileCountY) % tileCountY;

    const initialFrontX2 = (initialFrontX1 + velocityX + tileCountX) % tileCountX;
    const initialFrontY2 = (initialFrontY1 + velocityY + tileCountY) % tileCountY;

    // Populate all cells excluding the snake's starting position and the next two cells ahead
    for (let x = 0; x < tileCountX; x++) {
        for (let y = 0; y < tileCountY; y++) {
            if (
                !(x === headX && y === headY) &&
                !(x === initialFrontX1 && y === initialFrontY1) &&
                !(x === initialFrontX2 && y === initialFrontY2)
            ) {
                allCells.push({ X: x, Y: y });
            }
        }
    }

    // Shuffle the cells randomly
    shuffleArray(allCells);

    let placedObstacles = 0;

    for (let i = 0; i < allCells.length && placedObstacles < obstacleCount; i++) {
        const cell = allCells[i];

        // Temporarily place an obstacle
        obstacles.push({ X: cell.X, Y: cell.Y });

        // Check connectivity
        if (isFullyConnected()) {
            placedObstacles++;
        } else {
            // Revert if it disconnects the grid
            obstacles.pop();
        }
    }
}

// Helper function to shuffle an array using Fisher-Yates algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Helper function to perform BFS and check connectivity
function isFullyConnected() {
    const visited = Array(tileCountX).fill(null).map(() => Array(tileCountY).fill(false));
    const queue = [];
    let reachableCells = 0;

    // Find a starting point that's not an obstacle
    let startFound = false;
    for (let x = 0; x < tileCountX && !startFound; x++) {
        for (let y = 0; y < tileCountY && !startFound; y++) {
            if (!isObstacle(x, y)) {
                queue.push({ x, y });
                visited[x][y] = true;
                startFound = true;
            }
        }
    }

    if (!startFound) return false; // No walkable cells

    // BFS to count reachable walkable cells
    while (queue.length > 0) {
        const current = queue.shift();
        reachableCells++;

        const directions = [
            { x: current.x + 1, y: current.y },
            { x: current.x - 1, y: current.y },
            { x: current.x, y: current.y + 1 },
            { x: current.x, y: current.y - 1 },
        ];

        directions.forEach(dir => {
            if (
                dir.x >= 0 &&
                dir.x < tileCountX &&
                dir.y >= 0 &&
                dir.y < tileCountY &&
                !visited[dir.x][dir.y] &&
                !isObstacle(dir.x, dir.y)
            ) {
                visited[dir.x][dir.y] = true;
                queue.push(dir);
            }
        });
    }

    // Total walkable cells should equal total cells minus obstacles
    return reachableCells === (tileCountX * tileCountY - obstacles.length);
}

// Helper function to check if a cell is an obstacle
function isObstacle(x, y) {
    return obstacles.some(obstacle => obstacle.X === x && obstacle.Y === y);
}

// Call the obstacle generation during initialization
generateObstacles();

class SnakeParts {
    constructor(X, Y) {
        this.X = X;
        this.Y = Y;
    }
}

class Snake {
    constructor(headX, headY, tileCountX, tileCountY, tileSize, color, parts) {
        this.headX = headX;
        this.headY = headY;
        this.tileCountX = tileCountX;
        this.tileCountY = tileCountY;
        this.tileSize = tileSize;
        this.color = color;
        this.parts = parts;
        this.tailLength = 0;
    }

    draw = function () {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.fillRect(offsetX + this.headX * tileSize, offsetY + this.headY * tileSize, tileSize, tileSize);
        this.drawTail();
        ctx.closePath();
    }

    addTail = function () {
        this.tailLength++;
    }

    drawTail = function () {
        for (let i = 0; i < this.parts.length; i++) {
            const snakePart = this.parts[i];
            ctx.fillStyle = "grey";
            ctx.fillRect(offsetX + snakePart.X * tileSize, offsetY + snakePart.Y * tileSize, tileSize, tileSize);
        }
        this.parts.push(new SnakeParts(this.headX, this.headY));

        while (this.parts.length > this.tailLength)
            this.parts.shift();
    }

    changePosition = function (velocityX, velocityY) {
        this.headX += velocityX;
        this.headY += velocityY;

        // Wrap around the canvas edges
        if (this.headX < 0) {
            this.headX = tileCountX - 1;
        } else if (this.headX >= tileCountX) {
            this.headX = 0;
        }

        if (this.headY < 0) {
            this.headY = tileCountY - 1;
        } else if (this.headY >= tileCountY) {
            this.headY = 0;
        }
    }
}

class Apple {
    constructor(appleX, appleY, tileCountX, tileCountY, tileSize) {
        this.appleX = appleX;
        this.appleY = appleY;
        this.tileCountX = tileCountX;
        this.tileCountY = tileCountY;
        this.tileSize = tileSize;
    }

    draw = function () {
        ctx.beginPath();
        ctx.fillStyle = "red";
        ctx.fillRect(offsetX + this.appleX * tileSize, offsetY + this.appleY * tileSize, tileSize, tileSize);
        ctx.closePath();
    }

    randomAppear = function (isCollision) {
        if (isCollision) {
            let newX, newY;
            do {
                newX = Math.floor(Math.random() * this.tileCountX);
                newY = Math.floor(Math.random() * this.tileCountY);
            } while (isObstacle(newX, newY) || this.isSnakePosition(newX, newY)); // Ensure position is valid
            this.appleX = newX;
            this.appleY = newY;
        }
        this.draw();
    }

    // Optional: Helper function to check if the apple spawns on the snake
    isSnakePosition = function(x, y) {
        return snake.parts.some(part => part.X === x && part.Y === y) || (snake.headX === x && snake.headY === y);
    }
}

class Score {
    constructor(totalScore) {
        this.totalScore = totalScore;
    }

    draw = function () {
        ctx.fillStyle = "white";
        ctx.font = "15px Verdana"; // Updated font size
        ctx.fillText("Score " + this.totalScore, 10, 20);
    }

    drawHighestScore = function () {
        ctx.fillStyle = "white";
        ctx.font = "15px Verdana"; // Updated font size
        ctx.textAlign = "right"; // Set text alignment to right
        const highestScore = localStorage.getItem("highestScore") !== null ? localStorage.getItem("highestScore") : 0;
        ctx.fillText("Highest Score " + highestScore, canvas.width - offsetX - 10, 25); // Adjusted position
        ctx.textAlign = "left"; // Reset to default alignment
    }

    incScore = function () {
        this.totalScore++;
    }

    setHighestScore = function () {
        const highestScore = localStorage.getItem("highestScore") !== null ? localStorage.getItem("highestScore") : 0;
        if (this.totalScore > highestScore) localStorage.setItem("highestScore", this.totalScore);
    }
}

let snake = new Snake(headX, headY, tileCountX, tileCountY, tileSize, "white", parts);

// Initialize apple correctly
let apple = new Apple(Math.floor(Math.random() * tileCountX), Math.floor(Math.random() * tileCountY), tileCountX, tileCountY, tileSize);
apple.randomAppear(true); // Ensure apple does not spawn on obstacles or snake

let score = new Score(0);

let gameLoopId = null; // Add a variable to store the game loop timeout ID

function checkGameOver(snake) {
    let isOver = false;

    // Check collision with tail
    for (let i = 0; i < snake.parts.length; i++) {
        if (snake.headX === snake.parts[i].X && snake.headY === snake.parts[i].Y) {
            isOver = true;
            break;
        }
    }

    // Check collision with obstacles
    if (!isOver) { // Only check if not already game over
        for (let i = 0; i < obstacles.length; i++) {
            if (snake.headX === obstacles[i].X && snake.headY === obstacles[i].Y) {
                isOver = true;
                break;
            }
        }
    }

    if (isOver) {
        // Create label on screen
        ctx.beginPath();
        ctx.fillStyle = "white";
        ctx.font = "50px Verdana";
        ctx.fillText("Game Over", canvas.width / 6.5, canvas.height / 2);
        ctx.font = "25px Verdana";
        ctx.fillText("Press Enter to play again", canvas.width / 6.5, canvas.height / 1.8);
        ctx.closePath();

        // Stop the game loop
        clearTimeout(gameLoopId);
    }

    return isOver;
}

function checkOnCollision(snake, apple) {
    if (snake.headX === apple.appleX && snake.headY === apple.appleY) {
        return true;
    }
    return false;
}

function drawGrid() {
    ctx.strokeStyle = '#444';
    for (let i = 0; i < tileCountX; i++) {
        for (let j = 0; j < tileCountY; j++) {
            ctx.strokeRect(offsetX + i * tileSize, offsetY + j * tileSize, tileSize, tileSize);
        }
    }
}

function drawObstacles() {
    ctx.fillStyle = "brown";
    obstacles.forEach(obstacle => {
        ctx.fillRect(offsetX + obstacle.X * tileSize, offsetY + obstacle.Y * tileSize, tileSize, tileSize);
    });
}

function clearScreen() {
    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.closePath();
    drawGrid(); // Draw the grid after clearing the screen
    drawObstacles(); // Draw obstacles on the grid
}

document.body.addEventListener('keydown', keyDown);

function keyDown(event) {
    if (event.keyCode === 38 || event.keyCode === 87) { // up
        if (velocityY === 1) return;
        velocityX = 0;
        velocityY = -1;
    }
    if (event.keyCode === 40 || event.keyCode === 83) { // down
        if (velocityY === -1) return;
        velocityX = 0;
        velocityY = 1;
    }
    if (event.keyCode === 37 || event.keyCode === 65) { // left
        if (velocityX === 1) return;
        velocityX = -1;
        velocityY = 0;
    }
    if (event.keyCode === 39 || event.keyCode === 68) { // right
        if (velocityX === -1) return;
        velocityX = 1;
        velocityY = 0;
    }
    if (event.keyCode === 13) { // Enter key
        velocityX = 1; // Ensure the snake starts moving right
        velocityY = 0;
        snake = new Snake(headX, headY, tileCountX, tileCountY, tileSize, "white", []);
        apple = new Apple(Math.floor(Math.random() * tileCountX), Math.floor(Math.random() * tileCountY), tileCountX, tileCountY, tileSize);
        score = new Score(0);
        obstacles.length = 0; // Clear existing obstacles
        generateObstacles(); // Regenerate obstacles for the new game

        // Clear any existing game loop
        if (gameLoopId) {
            clearTimeout(gameLoopId);
        }

        drawGame();
    }
}

function drawGame() {
    clearScreen(); // Ensure the screen is cleared first
    snake.changePosition(velocityX, velocityY);

    // check game over
    let isOver = checkGameOver(snake);
    if (isOver) {
        score.setHighestScore();
        score.drawHighestScore();
        return;
    }

    snake.draw();
    score.draw();
    score.drawHighestScore();

    let isCollision = checkOnCollision(snake, apple);
    apple.randomAppear(isCollision);
    if (isCollision) {
        snake.addTail();
        score.incScore();
    }

    // Store the timeout ID
    gameLoopId = setTimeout(drawGame, 1000 / speed);
}

drawGame();