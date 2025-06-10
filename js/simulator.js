class Simulator {
  constructor(renderer) {
    this.renderer = renderer;
    this.running = false;
    this.track = null; // Track will be set when running
    this.keys = {};
    this.animationId = null; // For future use if needed

    this.cars = [new Car(100, 100, 50, 30, 0)]; // Example car instance
    this.pilotCar = this.cars[0]; // The car we control
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

    const { position, angle } = this.getStartPosition();
    this.pilotCar.position = position;
    this.pilotCar.angle = angle;
    this.pilotCar.speed = 0; // Reset speed to 0
    this.gameLoop();
  }
  getStartPosition() {
    const i0 = this.track.innerEdge[0];
    const o0 = this.track.outerEdge[0];
    const i1 = this.track.innerEdge[1];
    const o1 = this.track.outerEdge[1];

    const pos = {
      x: (i0.x + o0.x) / 2,
      y: (i0.y + o0.y) / 2,
    };

    const dx = (i1.x + o1.x) / 2 - pos.x;
    const dy = (i1.y + o1.y) / 2 - pos.y;
    const angle = Math.atan2(dy, dx);

    return { position: pos, angle };
  }

  gameLoop = () => {
    if (!this.running || !this.track) return;
    // console.trace("Game loop running");

    this.renderer.clear();
    this.renderer.drawTrack(this.track);
    this.update(this.track);
    // this.renderer.drawCar(this.car);
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
    this.pilotCar.reset(); // Reset car state
  }
  setupCarProps() {
    document.getElementById("carWidth").value = this.pilotCar.width;
    document.getElementById("widthVal").textContent = this.pilotCar.width;
    document.getElementById("carHeight").value = this.pilotCar.height;
    document.getElementById("heightVal").textContent = this.pilotCar.height;
    document.getElementById("carColor").value = this.pilotCar.color;
    document.getElementById("colorVal").textContent = this.pilotCar.color;

    document.getElementById("carWidth").addEventListener("input", (e) => {
      this.pilotCar.width = parseFloat(e.target.value);
      document.getElementById("widthVal").textContent = this.pilotCar.width;
    });
    document.getElementById("carHeight").addEventListener("input", (e) => {
      this.pilotCar.height = parseFloat(e.target.value);
      document.getElementById("heightVal").textContent = this.pilotCar.height;
    });
    document.getElementById("carColor").addEventListener("input", (e) => {
      this.pilotCar.color = e.target.value;
      document.getElementById("colorVal").textContent = this.pilotCar.color;
    });
  }

  parsePilotCarControls() {
    this.pilotCar.controls = {
      up: this.keys["ArrowUp"] || this.keys["w"],
      down: this.keys["ArrowDown"] || this.keys["s"] || this.keys[" "],
      left: this.keys["ArrowLeft"] || this.keys["a"],
      right: this.keys["ArrowRight"] || this.keys["d"],
    };
  }
  setControls(keys) {
    this.keys = keys;
    this.parsePilotCarControls();
  }

  update(track) {
    this.parsePilotCarControls();
    for (const car of this.cars) {
      car.update(track);
      this.renderer.drawCar(car);
    }
    document.getElementById("speed").textContent =
      this.pilotCar.speed.toFixed(2);
    document.getElementById("angle").textContent = (
      (this.pilotCar.angle * (180 / Math.PI)) %
      360
    ).toFixed(1);
  }
}
