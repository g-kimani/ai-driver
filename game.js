const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

class GameAdmin {
  constructor() {
    this.mode = "play"; // "edit" or "play"
    this.track = {
      innerEdge: [],
      outerEdge: [],
    };
    this.trackEditor = new TrackEditor(this);
    this.simulator = new Simulator();

    this.loadFromLocal();

    /// tabs

    document.querySelectorAll(".tabs button").forEach((button) => {
      button.addEventListener("click", (e) => {
        e.target.classList.add("active");
        document.querySelectorAll(".tabs button").forEach((btn) => {
          if (btn !== e.target) btn.classList.remove("active");
        });
        document.querySelectorAll(".tab-content").forEach((content) => {
          content.classList.remove("active");
        });
        document
          .querySelector(`#${e.target.id}-content`)
          .classList.add("active");
      });
    });

    document.getElementById("createTrack").addEventListener("click", () => {
      this.mode = "edit";
    });
  }

  drawEdge(points, color) {
    if (points.length < 2) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();

    // Dots
    for (const p of points) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    }
  }

  fillTrack(inner, outer, fillColor = "#444") {
    if (inner.length < 3 || outer.length < 3) return;

    ctx.beginPath();

    ctx.beginPath();
    ctx.moveTo(inner[0].x, inner[0].y);
    for (let i = 1; i < inner.length; i++) {
      ctx.lineTo(inner[i].x, inner[i].y);
    }
    ctx.closePath();

    ctx.moveTo(outer[0].x, outer[0].y);
    for (let i = 1; i < outer.length; i++) {
      ctx.lineTo(outer[i].x, outer[i].y);
    }
    ctx.closePath();

    ctx.fillStyle = fillColor;
    ctx.fill("evenodd"); // 👈 this is key
  }

  drawTrack() {
    if (this.mode === "edit") {
      const inner = this.trackEditor.innerEdge;
      const outer = this.trackEditor.outerEdge;
      this.fillTrack(inner, outer);
      this.drawEdge(inner, "#0f0");
      this.drawEdge(outer, "#f00");
    } else if (this.mode === "play") {
      // Draw the track from the simulator's track data
      const inner = this.track.innerEdge;
      const outer = this.track.outerEdge;
      this.fillTrack(inner, outer);
      this.drawEdge(inner, "#0f0");
      this.drawEdge(outer, "#f00");
      this.simulator.drawCar();
    }
    // If in "play" mode and this.track is set, draw from that instead
  }

  gameLoop = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (this.mode === "play") {
      this.simulator.update();
    }
    this.drawTrack();
    requestAnimationFrame(this.gameLoop);
  };

  start() {
    this.gameLoop();
  }

  saveToLocal() {
    const data = {
      inner: this.trackEditor.innerEdge,
      outer: this.trackEditor.outerEdge,
    };
    this.track.innerEdge = [...this.trackEditor.innerEdge];
    this.track.outerEdge = [...this.trackEditor.outerEdge];

    localStorage.setItem("savedTrack", JSON.stringify(data));
  }

  loadFromLocal() {
    const raw = localStorage.getItem("savedTrack");
    if (!raw) return;
    try {
      const data = JSON.parse(raw);
      this.trackEditor.innerEdge = data.inner || [];
      this.trackEditor.outerEdge = data.outer || [];
      this.track.innerEdge = data.inner || [];
      this.track.outerEdge = data.outer || [];
    } catch (e) {
      console.warn("Failed to load saved track from localStorage.");
    }
  }
}

class TrackEditor {
  constructor(admin) {
    this.admin = admin;
    this.innerEdge = [];
    this.outerEdge = [];
    this.currentEdge = "inner";
    this.addEventListeners();
  }

  addEventListeners() {
    canvas.addEventListener("click", (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const point = { x, y };
      this.addPoint(point);
    });

    document
      .querySelector("#track-controls .toggle-edge")
      .addEventListener("click", () => {
        this.switchEdge();
      });

    document
      .querySelector("#track-controls .close-loop")
      .addEventListener("click", () => {
        this.closeLoop();
      });

    document
      .querySelector("#track-controls .reset-track")
      .addEventListener("click", () => {
        this.innerEdge = [];
        this.outerEdge = [];
        this.admin.saveToLocal();
        alert("Track reset!");
      });
  }

  switchEdge() {
    this.currentEdge = this.currentEdge === "inner" ? "outer" : "inner";
    document.querySelector(
      "#track-controls .toggle-edge"
    ).textContent = `Switch to ${
      this.currentEdge === "inner" ? "Outer" : "Inner"
    } Edge`;
  }

  addPoint(point) {
    if (this.currentEdge === "inner") {
      this.innerEdge.push(point);
    } else {
      this.outerEdge.push(point);
    }
    this.admin.saveToLocal();
  }

  closeLoop() {
    if (this.innerEdge.length > 2)
      this.innerEdge.push({ ...this.innerEdge[0] });
    if (this.outerEdge.length > 2)
      this.outerEdge.push({ ...this.outerEdge[0] });
    this.admin.saveToLocal();
  }
}

class Simulator {
  constructor() {
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
    this.addEventListeners();
  }

  addEventListeners() {
    this.setupCarProps();
    document.addEventListener("keydown", (e) => (this.keys[e.key] = true));
    document.addEventListener("keyup", (e) => (this.keys[e.key] = false));
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

  drawCar() {
    ctx.save();
    ctx.translate(this.car.x, this.car.y);
    ctx.rotate(this.car.angle);
    ctx.fillStyle = this.car.color;
    ctx.fillRect(
      -this.car.width / 2,
      -this.car.height / 2,
      this.car.width,
      this.car.height
    );
    ctx.restore();
  }

  update() {
    if (this.keys.ArrowUp || this.keys.w) this.car.speed += 0.1;
    if (this.keys.ArrowDown || this.keys.s) this.car.speed -= 0.1;
    if (this.keys.ArrowLeft || this.keys.a) this.car.angle -= 0.05;
    if (this.keys.ArrowRight || this.keys.d) this.car.angle += 0.05;

    // check corners of car are within the track

    const corners = this.getCarCorners(this.car);
    let onTrack = true;
    for (const corner of corners) {
      const inInner = pointInPolygon(corner, gameAdmin.track.innerEdge);
      const inOuter = pointInPolygon(corner, gameAdmin.track.outerEdge);
      if (!inOuter || inInner) {
        onTrack = false;
        break;
      }
    }

    if (!onTrack) {
      this.car.speed *= 0.9;
      this.car.color = "#FF0000"; // Change color to red on collision
      // Optional: visual feedback or reset
      console.log("🚧 Collision! Off track.");
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

const gameAdmin = new GameAdmin();
gameAdmin.start();

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
