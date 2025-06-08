/*
 * Track structure:
 * {
 *   id: uuid
 *   name: string (optional)
 *   innerEdge: [{x: number, y: number}, ...],
 *   outerEdge: [{x: number, y: number}, ...],
 *   createdAt: Date,
 *   default: boolean (represents the track to be loaded when the app starts)
 * }
 */

class TrackManager {
  constructor(admin, renderer) {
    this.admin = admin;
    this.renderer = renderer;
    console.log("🚀 ~ TrackManager ~ constructor ~ renderer:", renderer);

    this.tracks = [];
    this.addEventListeners();
    this.loadTracks();
    this.displayTracks();
    this.creatingTrack = false;
    this.trackEditor = {
      name: "",
      innerEdge: [],
      outerEdge: [],
      currentEdge: "inner",
    };
  }

  addEventListeners() {
    document.getElementById("createTrack").addEventListener("click", () => {
      if (this.creatingTrack) {
        this.saveTrackCreation();
        this.creatingTrack = false;
        document.getElementById("createTrack").textContent = "Create Track";
      } else {
        this.startTrackCreation();
      }
      // const track = {
      //   innerEdge: this.admin.trackEditor.innerEdge,
      //   outerEdge: this.admin.trackEditor.outerEdge,
      //   name: document.getElementById("trackName").value || "Unnamed Track",
      //   id: crypto.randomUUID(),
      //   createdAt: new Date(),
      // };
      // this.tracks.push(track);
      // this.saveToLocal();
      // this.displayTracks();
      // document.getElementById("trackName").value = ""; // Clear input
    });

    document.getElementById("cancelTrack").addEventListener("click", () => {
      this.creatingTrack = false;
      document.getElementById("createTrack").textContent = "Create Track";
      document.getElementById("cancelTrack").classList.add("hidden");
      document.getElementById("trackName").value = ""; // Clear input
      document.getElementById("trackLabel").classList.add("hidden");
      document.getElementById("createTrack").disabled = false;
    });

    document
      .querySelector("#track-controls .toggle-edge")
      .addEventListener("click", () => {
        console.log("Switching edge type");
        this.trackEditor.currentEdge =
          this.trackEditor.currentEdge === "inner" ? "outer" : "inner";
        document.getElementById("edge-type").textContent = `${
          this.trackEditor.currentEdge === "inner" ? "Inner" : "Outer"
        } Edge`;
        document.querySelector(
          "#track-controls .toggle-edge"
        ).textContent = `Switch to ${
          this.trackEditor.currentEdge === "inner" ? "Outer" : "Inner"
        } Edge`;
      });

    document
      .querySelector("#track-controls .close-loop")
      .addEventListener("click", () => {
        if (!this.creatingTrack) return;
        if (this.trackEditor.innerEdge.length > 2) {
          this.trackEditor.innerEdge.push({ ...this.trackEditor.innerEdge[0] });
        }
        if (this.trackEditor.outerEdge.length > 2) {
          this.trackEditor.outerEdge.push({ ...this.trackEditor.outerEdge[0] });
        }
        this.renderer.drawTrack(this.trackEditor);
      });

    document
      .querySelector("#track-controls .reset-track")
      .addEventListener("click", () => {
        if (!this.creatingTrack) return;
        this.trackEditor.innerEdge = [];
        this.trackEditor.outerEdge = [];
        this.renderer.drawTrack(this.trackEditor);
      });
    document.getElementById("trackName").addEventListener("input", () => {
      if (!this.creatingTrack) return;
      const name = document.getElementById("trackName").value.trim();
      if (name) {
        document.getElementById("createTrack").disabled = false;
        this.trackEditor.name = name;
        this.renderer.drawTrack(this.trackEditor);
      } else {
        document.getElementById("createTrack").disabled = true;
      }
    });

    this.renderer.onClick((point) => {
      if (this.creatingTrack) {
        this.addPoint(point);
      }
    });
  }

  startTrackCreation() {
    this.renderer.clear();
    this.admin.stopSimulator(); // Stop any running simulation

    this.creatingTrack = true;
    document.getElementById("createTrack").textContent = "Save Track";
    document.getElementById("createTrack").disabled = true;
    document.getElementById("cancelTrack").classList.remove("hidden");
    document.getElementById("trackLabel").classList.remove("hidden");
    document.getElementById("trackName").value = ""; // Clear input
    document.getElementById("trackName").focus();

    document.getElementById("track-controls").classList.remove("hidden");
  }

  saveTrackCreation() {
    if (!this.creatingTrack) return;
    const track = {
      innerEdge: this.trackEditor.innerEdge,
      outerEdge: this.trackEditor.outerEdge,
      name: this.trackEditor.name || "Unnamed Track",
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    this.tracks.push(track);
    this.saveToLocal();
    this.displayTracks();
    this.trackEditor.innerEdge = [];
    this.trackEditor.outerEdge = [];
    this.trackEditor.name = "";

    this.endTrackCreation();
  }

  endTrackCreation() {
    if (!this.creatingTrack) return;
    this.creatingTrack = false;
    document.getElementById("createTrack").textContent = "Create Track";
    document.getElementById("cancelTrack").classList.add("hidden");
    document.getElementById("track-controls").classList.add("hidden");
    document.getElementById("trackName").value = ""; // Clear input
    document.getElementById("trackLabel").classList.add("hidden");
    this.renderer.drawTrack(null); // Clear the track from the renderer
    // this.saveTrackCreation();
    document.getElementById("createTrack").disabled = false;
  }

  addPoint(point) {
    if (!this.creatingTrack) return;
    if (this.trackEditor.currentEdge === "inner") {
      this.trackEditor.innerEdge.push(point);
    } else {
      this.trackEditor.outerEdge.push(point);
    }
    this.renderer.drawTrack(this.trackEditor);
    // this.saveToLocal();
    // this.displayTracks();
  }

  loadTracks() {
    const raw = localStorage.getItem("savedTracks");
    if (!raw) return;
    try {
      this.tracks = JSON.parse(raw);
    } catch (e) {
      console.warn("Failed to load saved tracks from localStorage.");
    }
    // load the default track if it exists
    const defaultTrack = this.tracks.find((t) => t.default);
    if (defaultTrack) {
      this.admin.runTrack(defaultTrack);
    } else if (this.tracks.length > 0) {
      // If no default track, load the first track as default
      this.tracks[0].default = true;
      this.admin.runTrack(this.tracks[0]);
    }

    this.displayTracks();
  }

  createTrackElement(track) {
    const trackElement = document.createElement("div");
    trackElement.className = "track";
    trackElement.innerHTML = `
      <h3>${track.name || "Unnamed Track"}</h3>
      <p>ID: ${track.id}</p>
      <p>Default: ${track.default ? "Yes" : "No"}</p>
      <p>Created At: ${new Date(track.createdAt).toLocaleString()}</p>
      <button class="delete-track">Delete</button>
      <button class="load-track">Play</button>
      <button class="make-default">Make Default</button>
    `;
    trackElement
      .querySelector(".delete-track")
      .addEventListener("click", () => {
        this.deleteTrack(track.id);
      });

    trackElement.querySelector(".load-track").addEventListener("click", () => {
      this.admin.runTrack(track);
    });
    trackElement
      .querySelector(".make-default")
      .addEventListener("click", () => {
        this.tracks.forEach((t) => (t.default = false)); // Reset all to not default
        track.default = true; // Set the clicked track as default
        this.saveToLocal();
        this.displayTracks();
      });
    return trackElement;
  }

  displayTracks() {
    if (!this.tracks || this.tracks.length === 0) {
      document.getElementById("track-list").innerHTML =
        "<p>No tracks found.</p>";
      return;
    }
    const trackList = document.getElementById("track-list");
    trackList.innerHTML = "";
    this.tracks.forEach((track) => {
      const trackElement = this.createTrackElement(track);
      trackList.appendChild(trackElement);
    });
  }

  saveToLocal() {
    localStorage.setItem("savedTracks", JSON.stringify(this.tracks));
  }

  deleteTrack(id) {
    this.tracks = this.tracks.filter((track) => track.id !== id);
    this.saveToLocal();
    this.displayTracks();
  }
}
