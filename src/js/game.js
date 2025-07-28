class GameAdmin {
  constructor() {
    this.currentTrack = null;
    this.renderer = new RenderEngine(this);
    this.trackManager = new TrackManager(this, this.renderer);
    this.simulator = new Simulator(this.renderer);
    /** @type {Track|null} - The track render engine will draw*/
    this.currentTrack = null;
    this.startSim();
    // this.designing = false;

    this.hudTabController = new TabController(
      document.getElementById("hud-tabs"),
      2
    );
  }

  /**
   *
   * @param {Track} track
   */
  setTrack(track) {
    this.currentTrack = track;
    this.trackManager.setTrack(track);
    this.simulator.setTrack(track);
  }

  playTrack(track) {
    this.trackManager.cancelEditing();
    this.setTrack(track);
    this.hudTabController.setActiveTab(1);
    this.simulator.start(track);
  }

  stopSim() {
    this.simulator.stop();
  }

  startSim() {
    this.simulator.start();
  }
}

const simulatorTabController = new TabController(
  document.getElementById("simulator-tabs"),
  2
);

const trackInfoTabController = new TabController(
  document.getElementById("info-tabs"),
  2
);

const game = new GameAdmin();
