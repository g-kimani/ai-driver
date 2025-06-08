class Simulator {
  constructor(renderer) {
    this.renderer = renderer;
    this.running = false;
    this.track = null; // Track will be set when running
    this.car = {
      x: 100,
      y: 100,
      width: 20,
      height: 10,
      angle: 0,
      speed: 0,
      radius: 10,
      color: "#0091FF",
    };
    this.keys = {};
    this.animationId = null; // For future use if needed
    this.addEventListeners();
  }

  addEventListeners() {
    this.setupCarProps();
    document.addEventListener("keydown", (e) => (this.keys[e.key] = true));
    document.addEventListener("keyup", (e) => (this.keys[e.key] = false));
  }

  start(track) {
    console.log("Simulator starting");
    if (this.running) {
      console.warn("Simulator already running!");
      return;
    }
    this.running = true;
    this.track = track;

    this.car.x = track.innerEdge[0].x; // Start at the first point of the inner edge
    this.car.y = track.innerEdge[0].y; // Start at the first point of the inner edge
    this.car.angle = 0; // Reset angle to 0
    this.car.speed = 0; // Reset speed to 0
    this.gameLoop();
  }

  gameLoop = () => {
    if (!this.running || !this.track) return;
    // console.trace("Game loop running");

    this.renderer.clear();
    this.renderer.drawTrack(this.track);
    this.update(this.track);
    this.renderer.drawCar(this.car);
    this.animationId = requestAnimationFrame(this.gameLoop);
  };

  stop() {
    console.log("Simulator stopping");
    if (!this.running) {
      console.warn("Simulator is not running!");
      return;
    }
    this.running = false;
    cancelAnimationFrame(this.animationId);
    this.animationId = null;
    this.car.speed = 0; // Reset speed when stopping
    this.car.color = "#0091FF"; // Reset color when stopping
  }
  setupCarProps() {
    document.getElementById("carWidth").value = this.car.width;
    document.getElementById("widthVal").textContent = this.car.width;
    document.getElementById("carHeight").value = this.car.height;
    document.getElementById("heightVal").textContent = this.car.height;
    document.getElementById("carColor").value = this.car.color;
    document.getElementById("colorVal").textContent = this.car.color;

    document.getElementById("carWidth").addEventListener("input", (e) => {
      this.car.width = parseFloat(e.target.value);
      document.getElementById("widthVal").textContent = this.car.width;
    });
    document.getElementById("carHeight").addEventListener("input", (e) => {
      this.car.height = parseFloat(e.target.value);
      document.getElementById("heightVal").textContent = this.car.height;
    });
    document.getElementById("carColor").addEventListener("input", (e) => {
      this.car.color = e.target.value;
      document.getElementById("colorVal").textContent = this.car.color;
    });
  }

  update(track) {
    if (this.keys.ArrowUp || this.keys.w) this.car.speed += 0.1;
    if (this.keys.ArrowDown || this.keys.s) this.car.speed -= 0.1;
    if (this.keys.ArrowLeft || this.keys.a) this.car.angle -= 0.05;
    if (this.keys.ArrowRight || this.keys.d) this.car.angle += 0.05;

    // check corners of car are within the track
    const corners = this.getCarCorners(this.car);
    let onTrack = true;
    for (const corner of corners) {
      const inInner = pointInPolygon(corner, track.innerEdge);
      const inOuter = pointInPolygon(corner, track.outerEdge);
      if (!inOuter || inInner) {
        onTrack = false;
        break;
      }
    }

    if (!onTrack) {
      this.car.speed *= 0.9;
      this.car.color = "#FF0000"; // Change color to red on collision

      // Optional: visual feedback or reset
    } else {
      this.car.color = "#0091FF"; // Reset color to original when on track
    }

    this.car.speed *= 0.98;
    this.car.x += Math.cos(this.car.angle) * this.car.speed;
    this.car.y += Math.sin(this.car.angle) * this.car.speed;

    document.getElementById("speed").textContent = this.car.speed.toFixed(2);
    document.getElementById("angle").textContent = (
      (this.car.angle * (180 / Math.PI)) %
      360
    ).toFixed(1);
  }

  getCarCorners(car) {
    const cx = car.x;
    const cy = car.y;
    const w = car.width;
    const h = car.height;
    const a = car.angle;

    const dx = Math.cos(a);
    const dy = Math.sin(a);

    const hw = w / 2;
    const hh = h / 2;

    return [
      { x: cx + dx * hw - dy * hh, y: cy + dy * hw + dx * hh }, // front right
      { x: cx - dx * hw - dy * hh, y: cy - dy * hw + dx * hh }, // front left
      { x: cx - dx * hw + dy * hh, y: cy - dy * hw - dx * hh }, // back left
      { x: cx + dx * hw + dy * hh, y: cy + dy * hw - dx * hh }, // back right
    ];
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
