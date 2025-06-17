const canvas = document.getElementById("gameCanvas");
const ctx    = canvas.getContext("2d");
const W      = canvas.width, H = canvas.height;

// Sprites loaded in index.html
const { "probe.png": probeImg, "asteroid.png": astImg } = window.assets;

// Generate a static starfield
const stars = Array.from({ length: 150 }, () => ({
  x: Math.random() * W,
  y: Math.random() * H,
  r: Math.random() * 1.5 + 0.5
}))

// Game state
let obstacles = [], frame = 0, score = 0, gameOver = false;
const keys = {};

// Player (probe)
const player = {
  x: 50,
  y: H/2 - 20,   // start mid-screen
  w: 40,
  h: 40,
  speed: 8
};

// Input listeners
document.addEventListener("keydown", e => {
  if (e.code === "ArrowUp")   keys.Up = true;
  if (e.code === "ArrowDown") keys.Down = true;
});
document.addEventListener("keyup", e => {
  if (e.code === "ArrowUp")   keys.Up = false;
  if (e.code === "ArrowDown") keys.Down = false;
});

// Asteroid spawn parameters
const SPAWN_PROB = 0.04;        // ~4% chance per frame
const MIN_SIZE   = 20, MAX_SIZE = 50;
const MIN_SPEED  = 3,  MAX_SPEED = 7;

function loop() {
  if (gameOver) return;
  requestAnimationFrame(loop);

  // — Clear & draw space background —
  ctx.fillStyle = "#1a0226";
  ctx.fillRect(0, 0, W, H);
  // draw stars
  ctx.fillStyle = "#ffffff";
  stars.forEach(s => {
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // — Move probe up/down —
  if (keys.Up   && player.y > 0)              player.y -= player.speed;
  if (keys.Down && player.y < H - player.h)   player.y += player.speed;

  // — Draw probe sprite —
  ctx.drawImage(probeImg, player.x, player.y, player.w, player.h);

  // — Randomly spawn asteroids —
  if (Math.random() < SPAWN_PROB) {
    const size  = MIN_SIZE + Math.random() * (MAX_SIZE - MIN_SIZE);
    const speed = MIN_SPEED + Math.random() * (MAX_SPEED - MIN_SPEED);
    obstacles.push({
      x: W + size,
      y: Math.random() * (H - size),
      w: size,
      h: size,
      speed
    });
  }

  // — Update & draw asteroids —
  obstacles.forEach((ob, i) => {
    ob.x -= ob.speed;
    ctx.drawImage(astImg, ob.x, ob.y, ob.w, ob.h);

    // Collision detection
    if (
      ob.x <  player.x + player.w &&
      ob.x + ob.w > player.x &&
      ob.y <  player.y + player.h &&
      ob.y + ob.h > player.y
    ) {
      gameOver = true;
      document.getElementById("status").textContent =
        `Game Over! Final Score: ${score}`;
    }
  });

  // Remove off-screen asteroids
  obstacles = obstacles.filter(ob => ob.x + ob.w > 0);

  // — Update & display score —
  score++;
  document.getElementById("score").textContent = `Score: ${score}`;

  frame++;
}

// Start the loop once the probe sprite has loaded
probeImg.onload = () => loop();
