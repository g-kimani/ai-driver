class SimulatorUI {
  constructor(simulator) {
    this.simulator = simulator;
    this.carInputs = {
      acceleration: document.getElementById("carAcceleration"),
      brakeForce: document.getElementById("carBrakeForce"),
      maxSpeed: document.getElementById("carMaxSpeed"),
      turnSpeed: document.getElementById("carTurnSpeed"),
      friction: document.getElementById("carFriction"),
      width: document.getElementById("carWidth"),
      height: document.getElementById("carHeight"),
      color: document.getElementById("carColor"),
    };
    this.carDisplay = {
      speed: document.getElementById("speed"),
      angle: document.getElementById("angle"),
      position: document.getElementById("position"),
      drifting: document.getElementById("drifting"),
      width: document.getElementById("widthVal"),
      height: document.getElementById("heightVal"),
      color: document.getElementById("colorVal"),
      acceleration: document.getElementById("accelerationVal"),
      maxSpeed: document.getElementById("maxSpeedVal"),
      turnSpeed: document.getElementById("turnSpeedVal"),
      brakeForce: document.getElementById("brakeForceVal"),
      friction: document.getElementById("frictionVal"),
    };

    this.init();
  }

  init() {
    // this.setupEventListeners();
    this.updateCarValues();
    this.addCarControls();
  }

  update() {
    this.updateCarValues();
    this.updateCarStats();
  }

  setupEventListeners() {}
  updateCarStats() {
    this.carDisplay.speed.textContent =
      this.simulator.pilotCar.speed.toFixed(2);
    this.carDisplay.angle.textContent = (
      (this.simulator.pilotCar.angle * (180 / Math.PI)) %
      360
    ).toFixed(1);
    this.carDisplay.position.textContent = `(${this.simulator.pilotCar.x.toFixed(
      1
    )}, ${this.simulator.pilotCar.y.toFixed(1)})`;
    this.carDisplay.drifting.textContent = this.simulator.pilotCar.isDrifting
      ? "Yes"
      : "No";
  }

  updateCarValues() {
    this.carDisplay.width.textContent = this.simulator.pilotCar.width;
    this.carDisplay.height.textContent = this.simulator.pilotCar.height;
    this.carDisplay.color.textContent = this.simulator.pilotCar.color;
    this.carDisplay.acceleration.textContent =
      this.simulator.pilotCar.settings.acceleration.toFixed(2);
    this.carDisplay.maxSpeed.textContent =
      this.simulator.pilotCar.settings.maxSpeed.toFixed(2);
    this.carDisplay.turnSpeed.textContent =
      this.simulator.pilotCar.settings.turnSpeed.toFixed(2);
    this.carDisplay.brakeForce.textContent =
      this.simulator.pilotCar.settings.brakeDeceleration.toFixed(2);
    this.carDisplay.friction.textContent =
      this.simulator.pilotCar.settings.friction.toFixed(2);
  }
  addCarControls() {
    console.log(
      "🚀 ~ SimulatorUI ~ addCarControls ~ this.carInputs:",
      this.carInputs
    );

    for (let key of Object.keys(this.carInputs)) {
      console.log("Adding control for:", key);
      console.log(
        "🚀 ~ SimulatorUI ~ addCarControls ~ this.carInputs[key]:",
        this.carInputs[key]
      );
      if (this.carInputs[key].type === "range") {
        this.carInputs[key].addEventListener("input", (e) => {
          const value = parseFloat(e.target.value);
          this.simulator.pilotCar.settings[key] = value;
          this.carDisplay[key.replace("car", "").toLowerCase()].textContent =
            value.toFixed(2);
        });
      }
    }
  }
}
