class Simulator {
  /**
   * @param {RenderEngine} renderer
   */
  constructor(renderer) {
    this.renderer = renderer;

    /**@type {Track|null} track data */
    this.track = null;

    this.keys = {};
    this.animationId = null;
    this.running = false;

    this.cars = [new Car(100, 100, 50, 30, 0)]; // Example car instance
    this.pilotCar = this.cars[0]; // The car we control
    // this.ui = new SimulatorUI(this);
    this.addEventListeners();
    this.gameLoop();
  }

  addEventListeners() {
    this.renderer.events.subscribe("keydown", (e) => (this.keys[e.key] = true));
    this.renderer.events.subscribe("keyup", (e) => (this.keys[e.key] = false));
  }

  setTrack(track) {
    this.track = track;
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
    this.pilotCar.setPosition(position.x, position.y);
    this.pilotCar.angle = angle;
    this.pilotCar.speed = 0; // Reset speed to 0
    this.gameLoop();
  }
  getStartPosition() {
    return { position: { x: 0, y: 0 }, angle: 0 };
  }

  gameLoop = () => {
    if (!this.running) return;
    this.renderer.clear();
    if (this.track) {
      this.renderer.drawTrack(this.track);
    }
    this.parsePilotCarControls();
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
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.animationId = null;
    this.pilotCar.reset(); // Reset car state
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
    // this.ui.update();
  }
}
