class GameAdmin {
  constructor() {
    this.currentTrack = null;
    this.renderer = new RenderEngine();
    this.simulator = new Simulator(this.renderer);
    this.trackManager = new TrackManager(this, this.renderer);
  }

  runTrack(track) {
    this.stopSimulator();
    this.currentTrack = track;
    this.renderer.drawTrack(track);

    this.simulator.start(track);
  }

  stopSimulator() {
    this.simulator.stop();
  }
}
const gameAdmin = new GameAdmin();

document.querySelectorAll(".tabs button").forEach((button) => {
  button.addEventListener("click", (e) => {
    e.target.classList.add("active");
    document.querySelectorAll(".tabs button").forEach((btn) => {
      if (btn !== e.target) btn.classList.remove("active");
    });
    document.querySelectorAll(".tab-content").forEach((content) => {
      content.classList.remove("active");
    });
    document.querySelector(`#${e.target.id}-content`).classList.add("active");
  });
});
