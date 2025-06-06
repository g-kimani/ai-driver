const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const car = {
  x: 400,
  y: 300,
  width: 20,
  height: 40,
  angle: 0,
  speed: 0,
  maxSpeed: 5,
  acceleration: 0.2,
  friction: 0.05,
  turnSpeed: 3,
};

const keys = {
  ArrowUp: false,
  ArrowDown: false,
  ArrowLeft: false,
  ArrowRight: false,
};

// Event listeners for key input
window.addEventListener("keydown", (e) => {
  keys[e.key] = true;
});
window.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});

// Update car physics
function update() {
  if (keys.ArrowUp) {
    car.speed += car.acceleration;
  }
  if (keys.ArrowDown) {
    car.speed -= car.acceleration;
  }

  // Limit speed
  if (car.speed > car.maxSpeed) car.speed = car.maxSpeed;
  if (car.speed < -car.maxSpeed / 2) car.speed = -car.maxSpeed / 2;

  // Turn car
  if (car.speed !== 0) {
    if (keys.ArrowLeft) car.angle -= car.turnSpeed * (car.speed / car.maxSpeed);
    if (keys.ArrowRight)
      car.angle += car.turnSpeed * (car.speed / car.maxSpeed);
  }

  // Apply friction
  if (car.speed > 0) {
    car.speed -= car.friction;
    if (car.speed < 0) car.speed = 0;
  }
  if (car.speed < 0) {
    car.speed += car.friction;
    if (car.speed > 0) car.speed = 0;
  }

  // Move car
  car.x += Math.sin((car.angle * Math.PI) / 180) * car.speed;
  car.y -= Math.cos((car.angle * Math.PI) / 180) * car.speed;
}

// Draw car and track
function draw() {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw simple track (rectangle)
  ctx.strokeStyle = "white";
  ctx.lineWidth = 5;
  ctx.strokeRect(50, 50, 700, 500);

  // Draw car
  ctx.save();
  ctx.translate(car.x, car.y);
  ctx.rotate((car.angle * Math.PI) / 180);
  ctx.fillStyle = "red";
  ctx.fillRect(-car.width / 2, -car.height / 2, car.width, car.height);
  ctx.restore();
}

// Game loop
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

loop();
