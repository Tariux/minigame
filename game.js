// DEVELOPING JUST FOR FUN TIMES
// IF YOU HELP I WILL BE VERY HAPPY :>
// ANY IDEAS FOR IMPROVING THE CODE ARE WELCOME

var GameManagerInstance = null;
class Player {
  constructor(canvas, name = null) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.name = name || `player-${Math.floor(Math.random() * 10000)}`;
    this.displayName = name || '🤖';
    this.radius = 20;
    this.speed = 2;
    this.position = this.getValidPosition();
    this.velocity = { x: 0, y: 0 };
    this.friction = 0.9; // Friction factor for sliding effect
    this.color = this.getRandomColor();
  }

  getRandomColor() {
    return `#${Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0")}`;
  }

  getValidPosition() {
    const padding = 40;
    const maxAttempts = 50;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const position = {
        x: padding + Math.random() * (this.canvas.width - 2 * padding),
        y: padding + Math.random() * (this.canvas.height - 2 * padding),
      };

      if (this.isValidPosition(position)) {
        return position;
      }
      attempts++;
    }
    throw new Error("Could not find valid position");
  }

  isValidPosition(position) {
    const SAFE_DISTANCE = 60;
    for (let player of GameManagerInstance.players) {
      if (player === this) continue;
      const distance = Math.hypot(
        position.x - player.position.x,
        position.y - player.position.y
      );
      if (distance < SAFE_DISTANCE) return false;
    }
    return true;
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.font = "16px Arial";
    this.ctx.fillStyle = "#000";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      this.displayName || this.name,
      this.position.x,
      this.position.y + this.radius + 20
    );
  }

  applyFriction() {
    this.velocity.x *= this.friction;
    this.velocity.y *= this.friction;

    // Prevent jitter by zeroing small velocities
    if (Math.abs(this.velocity.x) < 0.01) this.velocity.x = 0;
    if (Math.abs(this.velocity.y) < 0.01) this.velocity.y = 0;
  }

  updatePosition() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // Keep within canvas bounds
    const padding = this.radius + 10;
    this.position.x = Math.min(
      Math.max(this.position.x, padding),
      this.canvas.width - padding
    );
    this.position.y = Math.min(
      Math.max(this.position.y, padding),
      this.canvas.height - padding
    );
  }

  move(direction) {
    switch (direction) {
      case "up":
        this.velocity.y -= this.speed;
        break;
      case "down":
        this.velocity.y += this.speed;
        break;
      case "left":
        this.velocity.x -= this.speed;
        break;
      case "right":
        this.velocity.x += this.speed;
        break;
    }
  }

  startRandomWalk() {
    const directions = ["up", "down", "left", "right"];
    let currentDirection =
      directions[Math.floor(Math.random() * directions.length)];

    return setInterval(() => {
      if (Math.random() < 0.2) {
        currentDirection =
          directions[Math.floor(Math.random() * directions.length)];
      }
      this.move(currentDirection);
    }, 100);
  }

  enemy(enemy = true) {
    this.enemy = enemy;
  }
}

class GameManager {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.players = new Set();
    this.setupCanvas();
    this.startGameLoop();
  }

  setupCanvas() {
    const setCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = this.canvas.getBoundingClientRect();

      this.canvas.width = rect.width * dpr;
      this.canvas.height = rect.height * dpr;

      this.ctx.scale(dpr, dpr);
      this.canvas.style.width = `${rect.width}px`;
      this.canvas.style.height = `${rect.height}px`;
    };

    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);
  }

  addPlayer(name = null, randomWalk = false , enemy = false) {
    const player = new Player(this.canvas, name);
    this.players.add(player);
    if (enemy) {
      player.enemy();
    }
    if (randomWalk) {
      player.walkInterval = player.startRandomWalk();
    }
    return player;
  }

  removePlayer(player) {
    clearInterval(player.walkInterval);
    this.players.delete(player);
  }

  startGameLoop() {
    const loop = () => {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      for (let player of this.players) {
        player.applyFriction();
        player.updatePosition();
        player.draw();
      }
      requestAnimationFrame(loop);
    };
    loop();
  }
}

// USAGE IS HERE:

document.addEventListener("DOMContentLoaded", () => {
  const gameManager = new GameManager("frame");
  GameManagerInstance = gameManager;

  const enemyPlayer = gameManager.addPlayer("😈" , true , true);
  const mainPlayer = gameManager.addPlayer("🐱");
  for (let i = 0; i < 3; i++) {
    gameManager.addPlayer(null, true);
  }

  const movementKeys = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    w: "up",
    s: "down",
    a: "left",
    d: "right",
  };

  window.addEventListener("keydown", (event) => {
    const direction = movementKeys[event.key];
    if (direction) {
      mainPlayer.move(direction);
    }
  });
});
