const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const hpEl = document.getElementById("hp");
const scoreEl = document.getElementById("score");
const enemiesLeftEl = document.getElementById("enemiesLeft");

const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayText = document.getElementById("overlayText");
const restartBtn = document.getElementById("restartBtn");

const TILE = 30;
const ROWS = canvas.height / TILE;
const COLS = canvas.width / TILE;

const MAP = [
  "##############################",
  "#............##............##",
  "#.####.#####.##.#####.####..#",
  "#.#..#................#..#..#",
  "#.#..#.##########.###.#..#..#",
  "#......#........#.....#.....#",
  "###.##.#.######.#.###.#.###.#",
  "#......#....##..#.....#.....#",
  "#.####.###.##.###.###.###...#",
  "#....#.....##.....#.....#...#",
  "#....#.##########.#.###.#...#",
  "#....#............#...#.....#",
  "#.##################.#.###..#",
  "#...........................#",
  "##############################"
];

const state = {
  running: true,
  score: 0,
  player: null,
  enemies: [],
  bullets: [],
  keys: {}
};

function createPlayer() {
  return {
    x: TILE * 2,
    y: TILE * (ROWS - 3),
    w: 22,
    h: 22,
    speed: 2.2,
    dir: "up",
    hp: 3,
    cooldown: 0
  };
}

function createEnemy(x, y) {
  const dirs = ["up", "down", "left", "right"];
  return {
    x,
    y,
    w: 22,
    h: 22,
    speed: 1.2 + Math.random() * 0.5,
    dir: dirs[(Math.random() * dirs.length) | 0],
    turnCooldown: 40 + ((Math.random() * 70) | 0),
    shootCooldown: 70 + ((Math.random() * 90) | 0),
    hp: 1
  };
}

function restartGame() {
  state.running = true;
  state.score = 0;
  state.player = createPlayer();
  state.enemies = [
    createEnemy(TILE * 24, TILE * 2),
    createEnemy(TILE * 20, TILE * 10),
    createEnemy(TILE * 5, TILE * 6),
    createEnemy(TILE * 14, TILE * 2),
    createEnemy(TILE * 26, TILE * 12)
  ];
  state.bullets = [];
  overlay.classList.add("hidden");
  updateHud();
}

function isWallAt(px, py) {
  const col = (px / TILE) | 0;
  const row = (py / TILE) | 0;
  const line = MAP[row];
  if (!line) return true;
  return line[col] === "#";
}

function rectHitsWall(rect) {
  return (
    isWallAt(rect.x, rect.y) ||
    isWallAt(rect.x + rect.w, rect.y) ||
    isWallAt(rect.x, rect.y + rect.h) ||
    isWallAt(rect.x + rect.w, rect.y + rect.h)
  );
}

function intersects(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function tryMoveTank(tank, dx, dy) {
  const next = { ...tank, x: tank.x + dx, y: tank.y + dy };
  if (!rectHitsWall(next)) {
    tank.x = next.x;
    tank.y = next.y;
    return true;
  }
  return false;
}

function spawnBullet(owner, dir) {
  const speed = 4.5;
  const b = {
    owner,
    dir,
    x: owner.x + owner.w / 2 - 3,
    y: owner.y + owner.h / 2 - 3,
    w: 6,
    h: 6,
    speed
  };
  state.bullets.push(b);
}

function updatePlayer() {
  const p = state.player;
  if (!p || !state.running) return;

  let dx = 0;
  let dy = 0;
  if (state.keys["w"]) {
    dy -= p.speed;
    p.dir = "up";
  }
  if (state.keys["s"]) {
    dy += p.speed;
    p.dir = "down";
  }
  if (state.keys["a"]) {
    dx -= p.speed;
    p.dir = "left";
  }
  if (state.keys["d"]) {
    dx += p.speed;
    p.dir = "right";
  }

  if (dx !== 0) tryMoveTank(p, dx, 0);
  if (dy !== 0) tryMoveTank(p, 0, dy);

  if (p.cooldown > 0) p.cooldown--;
}

function randomTurn(enemy) {
  const dirs = ["up", "down", "left", "right"];
  enemy.dir = dirs[(Math.random() * dirs.length) | 0];
}

function updateEnemies() {
  for (const enemy of state.enemies) {
    enemy.turnCooldown--;
    enemy.shootCooldown--;

    if (enemy.turnCooldown <= 0) {
      randomTurn(enemy);
      enemy.turnCooldown = 40 + ((Math.random() * 60) | 0);
    }

    let dx = 0;
    let dy = 0;
    if (enemy.dir === "up") dy = -enemy.speed;
    if (enemy.dir === "down") dy = enemy.speed;
    if (enemy.dir === "left") dx = -enemy.speed;
    if (enemy.dir === "right") dx = enemy.speed;

    const movedX = dx !== 0 ? tryMoveTank(enemy, dx, 0) : true;
    const movedY = dy !== 0 ? tryMoveTank(enemy, 0, dy) : true;
    if (!movedX || !movedY) randomTurn(enemy);

    if (enemy.shootCooldown <= 0) {
      spawnBullet(enemy, enemy.dir);
      enemy.shootCooldown = 90 + ((Math.random() * 100) | 0);
    }
  }
}

function updateBullets() {
  for (let i = state.bullets.length - 1; i >= 0; i--) {
    const b = state.bullets[i];
    if (b.dir === "up") b.y -= b.speed;
    if (b.dir === "down") b.y += b.speed;
    if (b.dir === "left") b.x -= b.speed;
    if (b.dir === "right") b.x += b.speed;

    if (
      b.x < 0 ||
      b.y < 0 ||
      b.x > canvas.width ||
      b.y > canvas.height ||
      rectHitsWall(b)
    ) {
      state.bullets.splice(i, 1);
      continue;
    }

    if (b.owner === state.player) {
      let hitEnemy = false;
      for (let j = state.enemies.length - 1; j >= 0; j--) {
        const enemy = state.enemies[j];
        if (intersects(b, enemy)) {
          state.enemies.splice(j, 1);
          state.bullets.splice(i, 1);
          state.score++;
          hitEnemy = true;
          break;
        }
      }
      if (hitEnemy) continue;
    } else if (state.player && intersects(b, state.player)) {
      state.bullets.splice(i, 1);
      state.player.hp--;
      if (state.player.hp <= 0) {
        endGame(false);
      }
      continue;
    }
  }
}

function endGame(win) {
  state.running = false;
  overlay.classList.remove("hidden");
  overlayTitle.textContent = win ? "胜利!" : "游戏结束";
  overlayText.textContent = win
    ? `你击毁了全部敌军，得分 ${state.score}`
    : `再接再厉，最终得分 ${state.score}`;
}

function updateHud() {
  hpEl.textContent = state.player ? String(state.player.hp) : "0";
  scoreEl.textContent = String(state.score);
  enemiesLeftEl.textContent = String(state.enemies.length);
}

function drawMap() {
  for (let r = 0; r < MAP.length; r++) {
    for (let c = 0; c < MAP[r].length; c++) {
      const ch = MAP[r][c];
      if (ch === "#") {
        ctx.fillStyle = "#6b7280";
        ctx.fillRect(c * TILE, r * TILE, TILE, TILE);
        ctx.strokeStyle = "#4b5563";
        ctx.strokeRect(c * TILE + 1, r * TILE + 1, TILE - 2, TILE - 2);
      } else {
        ctx.fillStyle = "#475569";
        ctx.fillRect(c * TILE, r * TILE, TILE, TILE);
      }
    }
  }
}

function drawTank(tank, color) {
  ctx.fillStyle = color;
  ctx.fillRect(tank.x, tank.y, tank.w, tank.h);

  ctx.fillStyle = "#0f172a";
  const cx = tank.x + tank.w / 2;
  const cy = tank.y + tank.h / 2;
  const barrel = 12;
  if (tank.dir === "up") ctx.fillRect(cx - 2, tank.y - barrel + 2, 4, barrel);
  if (tank.dir === "down") ctx.fillRect(cx - 2, tank.y + tank.h - 2, 4, barrel);
  if (tank.dir === "left") ctx.fillRect(tank.x - barrel + 2, cy - 2, barrel, 4);
  if (tank.dir === "right") ctx.fillRect(tank.x + tank.w - 2, cy - 2, barrel, 4);
}

function drawBullets() {
  ctx.fillStyle = "#f59e0b";
  for (const b of state.bullets) {
    ctx.fillRect(b.x, b.y, b.w, b.h);
  }
}

function gameLoop() {
  if (state.running) {
    updatePlayer();
    updateEnemies();
    updateBullets();

    if (state.enemies.length === 0) {
      endGame(true);
    }
  }

  drawMap();
  if (state.player) drawTank(state.player, "#22c55e");
  for (const enemy of state.enemies) drawTank(enemy, "#ef4444");
  drawBullets();
  updateHud();

  requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  state.keys[key] = true;

  if (key === "j" && state.running && state.player && state.player.cooldown <= 0) {
    spawnBullet(state.player, state.player.dir);
    state.player.cooldown = 18;
  }

  if (key === "r") {
    restartGame();
  }
});

window.addEventListener("keyup", (e) => {
  state.keys[e.key.toLowerCase()] = false;
});

restartBtn.addEventListener("click", restartGame);

restartGame();
gameLoop();
