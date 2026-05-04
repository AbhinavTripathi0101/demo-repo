const canvas = document.querySelector("#game");
const ctx = canvas.getContext("2d");
const scoreEl = document.querySelector("#score");
const bestEl = document.querySelector("#best");
const startButton = document.querySelector("#startButton");

const groundY = 335;
const gravity = 0.82;
const jumpForce = -15;

let runner;
let obstacles;
let particles;
let score;
let best;
let speed;
let spawnTimer;
let running;
let gameOver;
let animationId;

function resetGame() {
  runner = {
    x: 92,
    y: groundY - 44,
    width: 36,
    height: 44,
    velocityY: 0,
    grounded: true
  };
  obstacles = [];
  particles = [];
  score = 0;
  speed = 6;
  spawnTimer = 70;
  running = true;
  gameOver = false;
  scoreEl.textContent = "0";
  startButton.textContent = "Restart";
}

function loadBest() {
  best = Number(localStorage.getItem("minimal-run-best") || 0);
  bestEl.textContent = best;
}

function saveBest() {
  if (score > best) {
    best = score;
    localStorage.setItem("minimal-run-best", best);
    bestEl.textContent = best;
  }
}

function jump() {
  if (!running) {
    resetGame();
    return;
  }

  if (runner.grounded) {
    runner.velocityY = jumpForce;
    runner.grounded = false;
    for (let i = 0; i < 6; i += 1) {
      particles.push({
        x: runner.x + 8,
        y: groundY,
        size: 3 + Math.random() * 3,
        vx: -1 - Math.random() * 3,
        life: 24
      });
    }
  }
}

function spawnObstacle() {
  const height = 28 + Math.random() * 44;
  obstacles.push({
    x: canvas.width + 20,
    y: groundY - height,
    width: 22 + Math.random() * 18,
    height
  });
}

function intersects(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function update() {
  if (!running) return;

  score += 1;
  speed = 6 + score / 650;
  scoreEl.textContent = Math.floor(score / 5);

  runner.velocityY += gravity;
  runner.y += runner.velocityY;

  if (runner.y + runner.height >= groundY) {
    runner.y = groundY - runner.height;
    runner.velocityY = 0;
    runner.grounded = true;
  }

  spawnTimer -= 1;
  if (spawnTimer <= 0) {
    spawnObstacle();
    spawnTimer = 62 + Math.random() * 70 - speed * 2;
  }

  obstacles.forEach((obstacle) => {
    obstacle.x -= speed;
  });
  obstacles = obstacles.filter((obstacle) => obstacle.x + obstacle.width > -20);

  particles.forEach((particle) => {
    particle.x += particle.vx;
    particle.life -= 1;
  });
  particles = particles.filter((particle) => particle.life > 0);

  if (obstacles.some((obstacle) => intersects(runner, obstacle))) {
    running = false;
    gameOver = true;
    saveBest();
    startButton.textContent = "Play Again";
  }
}

function drawBackground() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fffdfa";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#d7d0c4";
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 90) {
    const shifted = (x - (score * 0.6) % 90);
    ctx.beginPath();
    ctx.moveTo(shifted, groundY + 32);
    ctx.lineTo(shifted + 34, groundY + 32);
    ctx.stroke();
  }

  ctx.strokeStyle = "#283d3b";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(34, groundY + 1);
  ctx.lineTo(canvas.width - 34, groundY + 1);
  ctx.stroke();
}

function drawRunner() {
  ctx.fillStyle = "#197278";
  ctx.beginPath();
  ctx.roundRect(runner.x, runner.y, runner.width, runner.height, 7);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(runner.x + 23, runner.y + 11, 5, 5);
}

function drawObstacles() {
  ctx.fillStyle = "#c44536";
  obstacles.forEach((obstacle) => {
    ctx.beginPath();
    ctx.roundRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height, 5);
    ctx.fill();
  });
}

function drawParticles() {
  ctx.fillStyle = "#8da9a4";
  particles.forEach((particle) => {
    ctx.globalAlpha = particle.life / 24;
    ctx.fillRect(particle.x, particle.y, particle.size, 2);
  });
  ctx.globalAlpha = 1;
}

function drawMessage() {
  if (running) return;

  ctx.fillStyle = "rgba(255, 253, 250, 0.84)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#1e2930";
  ctx.textAlign = "center";
  ctx.font = "700 30px Inter, system-ui, sans-serif";
  ctx.fillText(gameOver ? "Nice run" : "Minimal Run", canvas.width / 2, 178);
  ctx.font = "16px Inter, system-ui, sans-serif";
  ctx.fillStyle = "#69747b";
  ctx.fillText(gameOver ? "Press Space or tap to restart" : "Press Start or Space", canvas.width / 2, 210);
  ctx.textAlign = "left";
}

function render() {
  drawBackground();
  drawParticles();
  drawRunner();
  drawObstacles();
  drawMessage();
}

function loop() {
  update();
  render();
  animationId = requestAnimationFrame(loop);
}

startButton.addEventListener("click", () => {
  resetGame();
});

window.addEventListener("keydown", (event) => {
  if (event.code === "Space" || event.code === "ArrowUp") {
    event.preventDefault();
    jump();
  }
});

canvas.addEventListener("pointerdown", jump);

loadBest();
resetGame();
running = false;
startButton.textContent = "Start";
render();
cancelAnimationFrame(animationId);
loop();
