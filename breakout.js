const canvas = document.getElementById("breakoutCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 480;
canvas.height = 320;

let paddleHeight = 10;
let paddleWidth = 75;
let paddleX = (canvas.width - paddleWidth) / 2;

let rightPressed = false;
let leftPressed = false;

const ballRadius = 10;
let balls = [{ x: canvas.width / 2, y: canvas.height - 30, dx: 1.5, dy: -1.5 }]; // Slower ball speed

const brickRowCount = 5;
const brickColumnCount = 7;
const brickWidth = 60;
const brickHeight = 20;
const brickPadding = 10;
const brickOffsetTop = 30;
const brickOffsetLeft = 35;

let score = 0;
let level = 1;
let totalBlueBricks;
let powerUps = [];
let powerUpFrequency = 0.1; // 10% chance of spawning a power-up when a brick is hit

const bricks = [];

function initializeBricks() {
    totalBlueBricks = 0; // Reset blue brick count
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            let type = Math.random() < 0.5 ? "blue" : "grey";
            bricks[c][r] = { x: 0, y: 0, type: type, hits: type === "blue" ? 1 : 3, status: 1 };
            if (type === "blue") totalBlueBricks++; // Count blue bricks
        }
    }
}

initializeBricks();

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

function keyDownHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

function collisionDetection() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                for (let ball of balls) {
                    if (ball.x > b.x && ball.x < b.x + brickWidth && ball.y > b.y && ball.y < b.y + brickHeight) {
                        ball.dy = -ball.dy;
                        b.hits--;
                        if (b.hits <= 0) {
                            b.status = 0;
                            if (b.type === "blue") {
                                totalBlueBricks--; // Decrease blue brick count when destroyed
                            }
                            score++;
                            if (totalBlueBricks === 0) {
                                // Level complete if all blue bricks are destroyed
                                levelUp();
                            }
                        }

                        // Spawn power-up block occasionally when a brick is destroyed
                        if (Math.random() < powerUpFrequency) {
                            spawnPowerUp(b.x, b.y);
                        }
                    }
                }
            }
        }
    }
}

function spawnPowerUp(x, y) {
    powerUps.push({ x: x, y: y, width: 20, height: 20, speed: 1 });
}

function drawPowerUps() {
    for (let i = 0; i < powerUps.length; i++) {
        const pu = powerUps[i];
        ctx.beginPath();
        ctx.rect(pu.x, pu.y, pu.width, pu.height);
        ctx.fillStyle = "#ff0"; // Yellow color for power-ups
        ctx.fill();
        ctx.closePath();
    }
}

function movePowerUps() {
    for (let i = 0; i < powerUps.length; i++) {
        const pu = powerUps[i];
        pu.y += pu.speed;

        // Check if the power-up hits the paddle
        if (pu.y + pu.height >= canvas.height - paddleHeight && pu.x > paddleX && pu.x < paddleX + paddleWidth) {
            // Power-up collected, duplicate the balls in mid-air
            duplicateBallsInAir();
            powerUps.splice(i, 1); // Remove the collected power-up
        }

        // Remove power-ups that fall off screen
        if (pu.y > canvas.height) {
            powerUps.splice(i, 1);
        }
    }
}

function duplicateBallsInAir() {
    let newBalls = [];
    for (let ball of balls) {
        // For each ball, create a new ball at the same position, with the same velocity
        newBalls.push({ x: ball.x, y: ball.y, dx: ball.dx, dy: ball.dy });
    }
    balls = balls.concat(newBalls); // Double the number of balls
}

function drawBall(ball) {
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#00f"; // Blue color for balls
    ctx.fill();
    ctx.closePath();
}

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight);
    ctx.fillStyle = "#00f";
    ctx.fill();
    ctx.closePath();
}

function drawBricks() {
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            const b = bricks[c][r];
            if (b.status === 1) {
                const brickX = c * (brickWidth + brickPadding) + brickOffsetLeft;
                const brickY = r * (brickHeight + brickPadding) + brickOffsetTop;
                b.x = brickX;
                b.y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = b.type === "blue" ? "#0095DD" : "#666"; // Blue and grey bricks
                ctx.fill();
                ctx.closePath();
            }
        }
    }
}

function drawScore() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText("Score: " + score, 8, 20);
}

function drawLevel() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "#fff";
    ctx.fillText("Level: " + level, canvas.width / 2 - 30, 20);
}

function moveBalls() {
    balls.forEach(ball => {
        if (ball.x + ball.dx > canvas.width - ballRadius || ball.x + ball.dx < ballRadius) {
            ball.dx = -ball.dx;
        }
        if (ball.y + ball.dy < ballRadius) {
            ball.dy = -ball.dy;
        } else if (ball.y + ball.dy > canvas.height - ballRadius) {
            if (ball.x > paddleX && ball.x < paddleX + paddleWidth) {
                ball.dy = -ball.dy;
            } else {
                balls = balls.filter(b => b !== ball); // Remove the ball if it falls off the bottom
                if (balls.length === 0) {
                    // If no balls remain, reset the ball and continue the game
                    resetBall();
                }
            }
        }

        ball.x += ball.dx;
        ball.y += ball.dy;
    });
}

function resetBall() {
    balls = [{ x: canvas.width / 2, y: canvas.height - 30, dx: 1.5, dy: -1.5 }]; // Reset ball speed
    paddleX = (canvas.width - paddleWidth) / 2;
}

function levelUp() {
    if (level < 5) {
        level++;
        initializeBricks(); // Reset the bricks for the new level
        resetBall();
        // Display "YOU WIN!" and "LEVEL X" messages
        displayWinMessage();
    } else {
        alert("YOU WIN THE GAME!");
        window.close(); // Close the game after level 5
    }
}

function displayWinMessage() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "24px Arial";
    ctx.fillStyle = "#fff";
    ctx.textAlign = "center";
    ctx.fillText("YOU WIN!", canvas.width / 2, canvas.height / 2);

    setTimeout(() => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillText("LEVEL " + level, canvas.width / 2, canvas.height / 2);
        setTimeout(() => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            draw();
        }, 2000); // Display "LEVEL X" for 2 seconds
    }, 2000); // Display "YOU WIN!" for 2 seconds
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBricks();
    drawScore();
    drawLevel();
    drawPaddle();
    balls.forEach(drawBall);
    drawPowerUps();
    moveBalls();
    movePowerUps();
    collisionDetection();

    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 5; // Slower paddle movement speed
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 5; // Slower paddle movement speed
    }

    requestAnimationFrame(draw);
}

draw();
