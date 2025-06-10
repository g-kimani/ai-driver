class Car {
  constructor(x, y, width, height, angle) {
    this.x = x; // Initial x position
    this.y = y; // Initial y position
    this.angle = angle; // Angle in radians

    this.settings = {
      acceleration: 0.2, // Acceleration rate
      brakeDeceleration: 0.3, // Deceleration rate when braking
      maxSpeed: 5, // Maximum speed
      turnSpeed: 0.05, // Turning speed in radians
      friction: 0.95, // Friction to slow down the car
      width: width, // Width of the car
      height: height, // Height of the car
      color: "#0091FF", // Color of the car
    };

    this.speed = 0; // Speed of the car
    this.velX = 0;
    this.velY = 0;
    this.trail = []; // Trail of previous positions
    this.trailLength = 15; // Maximum length of the trail
    this.isDrifting = false; // Whether the car is currently drifting
    this.brakeStopTimer = 0;
    this.isStopping = false;
    this.controls = {
      up: false,
      down: false,
      left: false,
      right: false,
    };

    this.setStartValues = () => {
      this.x = x;
      this.y = y;
      this.angle = angle;
      this.speed = 0; // Reset speed to 0
      this.color = "#0091FF"; // Reset color to original
    };
  }

  reset() {
    this.setStartValues();
  }

  update(track) {
    // Update angle based on left/right controls
    if (this.controls.left) this.angle -= this.settings.turnSpeed;
    if (this.controls.right) this.angle += this.settings.turnSpeed;

    // Calculate forward vector
    const forwardX = Math.cos(this.angle);
    const forwardY = Math.sin(this.angle);

    // Apply acceleration/braking along forward vector
    if (this.controls.up) {
      this.velX += forwardX * this.settings.acceleration;
      this.velY += forwardY * this.settings.acceleration;
    } else if (this.controls.down) {
      // braking / reverse
      this.velX -= forwardX * this.settings.brakeDeceleration;
      this.velY -= forwardY * this.settings.brakeDeceleration;
    } else {
      // natural slowdown if no gas/brake
      this.velX *= this.settings.friction;
      this.velY *= this.settings.friction;
    }

    // Calculate lateral velocity (perpendicular to forward vector)
    const lateralX = -forwardY;
    const lateralY = forwardX;

    // Project velocity onto lateral direction
    const lateralVel = this.velX * lateralX + this.velY * lateralY;

    // Determine if drifting (e.g. turning + speed + braking)
    const isDrifting =
      this.controls.up &&
      (this.controls.left || this.controls.right) &&
      this.controls.down;

    if (isDrifting) {
      this.isDrifting = true;
      // Apply lateral force to simulate drifting
      this.trail.push({
        x: this.x,
        y: this.y,
        angle: this.angle,
      });
      // Limit trail length
      if (this.trail.length > this.trailLength) {
        this.trail.shift(); // Remove oldest position
      }
    } else {
      this.isDrifting = false;
      // Clear trail if not drifting
      this.trail = [];
    }

    // Apply friction to lateral velocity: less friction if drifting (loose grip)
    const lateralFriction = isDrifting ? 0.9 : 0.5;

    // Reduce lateral velocity by friction
    const newLateralVel = lateralVel * lateralFriction;

    // Remove old lateral velocity from total velocity
    this.velX -= lateralX * (lateralVel - newLateralVel);
    this.velY -= lateralY * (lateralVel - newLateralVel);

    // Limit max speed
    const speed = Math.sqrt(this.velX * this.velX + this.velY * this.velY);
    if (speed > this.settings.maxSpeed) {
      this.velX = (this.velX / speed) * this.settings.maxSpeed;
      this.velY = (this.velY / speed) * this.settings.maxSpeed;
    }

    // Update position by velocity
    this.x += this.velX;
    this.y += this.velY;

    if (!this.isOnTrack(track)) {
      this.settings.color = "#FF0000"; // Change color to red if off track
    } else {
      this.settings.color = "#0091FF"; // Reset color to original if on track
    }

    // Update speed property for display
    this.speed = speed;
  }

  getCorners() {
    const hw = this.settings.width / 2;
    const hh = this.settings.height / 2;
    const dx = Math.cos(this.angle);
    const dy = Math.sin(this.angle);

    return [
      { x: this.x + dx * hw - dy * hh, y: this.y + dy * hw + dx * hh }, // front right
      { x: this.x - dx * hw - dy * hh, y: this.y - dy * hw + dx * hh }, // front left
      { x: this.x - dx * hw + dy * hh, y: this.y - dy * hw - dx * hh }, // back left
      { x: this.x + dx * hw + dy * hh, y: this.y + dy * hw - dx * hh }, // back right
    ];
  }
  isOnTrack(track) {
    const corners = this.getCorners();
    for (const corner of corners) {
      const inInner = pointInPolygon(corner, track.innerEdge);
      const inOuter = pointInPolygon(corner, track.outerEdge);
      if (!inOuter || inInner) {
        return false; // At least one corner is off the track
      }
    }
    return true; // All corners are on the track
  }
  draw(ctx) {
    // Draw trail first (so car is on top)
    for (let i = 0; i < this.trail.length; i++) {
      const t = this.trail[i];
      const alpha = i / this.trail.length; // Fade out older positions
      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.rotate(t.angle);
      ctx.fillStyle = `rgba(255, 0, 0, ${alpha * 0.3})`; // red trail with fading alpha
      ctx.fillRect(
        -this.settings.width / 2,
        -this.settings.height / 2,
        this.settings.width,
        this.settings.height
      );
      ctx.restore();
    }

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.fillStyle = this.settings.color;
    ctx.fillRect(
      -this.settings.width / 2,
      -this.settings.height / 2,
      this.settings.width,
      this.settings.height
    );
    ctx.restore();

    // --- DEBUG OVERLAY ---
    const speedVecScale = 20;
    const driftColor = "rgba(255, 0, 0, 0.6)";
    const forwardColor = "rgba(0, 255, 0, 0.6)";
    const ctx2 = ctx;

    const cos = Math.cos(this.angle);
    const sin = Math.sin(this.angle);

    const forwardX = cos;
    const forwardY = sin;

    const dot = this.vx * forwardX + this.vy * forwardY;
    const lateralX = this.vx - dot * forwardX;
    const lateralY = this.vy - dot * forwardY;

    // Draw full velocity vector
    ctx2.beginPath();
    ctx2.moveTo(this.x, this.y);
    ctx2.strokeStyle = "blue";
    ctx2.lineTo(
      this.x + this.vx * speedVecScale,
      this.y + this.vy * speedVecScale
    );
    ctx2.stroke();

    // Draw forward vector
    ctx2.beginPath();
    ctx2.moveTo(this.x, this.y);
    ctx2.strokeStyle = forwardColor;
    ctx2.lineTo(
      this.x + forwardX * dot * speedVecScale,
      this.y + forwardY * dot * speedVecScale
    );
    ctx2.stroke();

    // Draw drift/lateral vector
    ctx2.beginPath();
    ctx2.moveTo(this.x, this.y);
    ctx2.strokeStyle = driftColor;
    ctx2.lineTo(
      this.x + lateralX * speedVecScale,
      this.y + lateralY * speedVecScale
    );
    ctx2.stroke();
  }
  setControls(up, down, left, right) {
    this.controls.up = up;
    this.controls.down = down;
    this.controls.left = left;
    this.controls.right = right;
  }

  getPosition() {
    return { x: this.x, y: this.y, angle: this.angle, speed: this.speed };
  }

  setPosition(x, y, angle, speed) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = speed;
  }
}

function pointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x,
      yi = polygon[i].y;
    const xj = polygon[j].x,
      yj = polygon[j].y;

    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi + 1e-9) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
