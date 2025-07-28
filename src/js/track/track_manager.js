class TrackManager {
  constructor(admin, renderer) {
    this.admin = admin;
    this.renderer = renderer;
    this.editor = new TrackEditor(this, this.renderer);
    this.editing = false;

    /** @type {SaveData} */
    this.saveData = this.getSaveData();

    this.trackListDisplay = document.getElementById("mainTrackList");
    if (!this.trackListDisplay) {
      throw new Error("Could not find the track list display");
    }
    this.addEventListeners();
    this.init();
  }

  init() {
    document.getElementById("editorHome")?.classList.remove("hidden");
    document.getElementById("editorHub")?.classList.add("hidden");
    this.updateTrackDisplay();
  }

  addEventListeners() {
    document.getElementById("newTrack")?.addEventListener("click", () => {
      this.editor.reset();
      this.startEditing();
    });
    // const mouseXel = document.getElementById("mouseX");
    // const mouseYel = document.getElementById("mouseY");
    // if (!mouseXel || !mouseYel) {
    //   throw new Error("no mouse position display found");
    // }

    // this.renderer.events.subscribe("mousemove", (event) => {
    //   if (!this.editing) return;
    //   mouseXel.textContent = event.eventPos.x;
    //   mouseYel.textContent = event.eventPos.y;
    // });
  }

  startEditing() {
    this.admin.stopSim();
    this.editing = true;
    document.getElementById("editorHome")?.classList.add("hidden");
    document.getElementById("editorHub")?.classList.remove("hidden");
  }

  cancelEditing() {
    this.editing = false;
    document.getElementById("editorHome")?.classList.remove("hidden");
    document.getElementById("editorHub")?.classList.add("hidden");
  }

  /**
   * Returns the saved track data. creates if no save data present
   */
  getSaveData() {
    const raw = localStorage.getItem("saveData");
    if (!raw) {
      console.warn("Creating Initial Save");
      /** @type {SaveData} */
      const saveData = {
        tracks: new Map(),
        favourites: [],
      };
      return saveData;
    }
    try {
      const saveData = JSON.parse(raw);
      saveData.tracks = new Map(saveData.tracks);
      return saveData;
    } catch (e) {
      console.warn("Issue parsing track", e);
    }
  }

  /**
   * Updates the local storage save data
   */
  updateSaveData() {
    // convert map to array before stringify
    localStorage.setItem(
      "saveData",
      JSON.stringify({ ...this.saveData, tracks: [...this.saveData.tracks] })
    );
  }

  /**
   * Updates the list of saved tracks
   */
  updateTrackDisplay() {
    this.trackListDisplay.innerHTML = "";
    if (this.saveData.tracks.size === 0) {
      const elm = document.createElement("div");
      elm.classList.add(
        "flex",
        "flex-col",
        "grow",
        "max-h-max",
        "px-4",
        "py-2",
        "w-full",
        "bg-amber-200"
      );
      elm.textContent = "NO SAVED";
      this.trackListDisplay?.appendChild(elm);
    }

    this.saveData.tracks.forEach((track) => {
      const elm = document.createElement("div");
      elm.classList.add(
        "flex",
        "flex-col",
        "grow",
        "max-h-max",
        "px-4",
        "py-2",
        "w-full",
        "bg-amber-200"
      );
      elm.innerHTML = `
      <h3>${track.name}</h3>
      <div class="flex justify-between w-full">
          <div class="w-full h-full bg-amber-700"></div>
          <div class="flex flex-col">
              <button id="fav" title="Favourite track" class="toggle-btn"
                  data-active="${
                    this.saveData.favourites.some((tr) => tr === track.id)
                      ? "true"
                      : "false"
                  }">
                  Favourite
              </button>
              <button id="def" title="Make track default on load" class="toggle-btn"
                  data-active="${
                    this.saveData.defaultTrack === track.id ? "true" : "false"
                  }">
                  Make default
              </button>
          </div>
          <div class="flex justify-around">
              <button id="play" title="Play track in sim" class="play-btn simple-btn">Play</button>
              <button id="edit" title="edit track in sim" class="edit-btn simple-btn">edit</button>
          </div>
      </div>
      `;

      const playBtn = elm.querySelector(".play-btn");
      playBtn?.addEventListener("click", () => {
        this.admin.playTrack(track);
      });
      const editBtn = elm.querySelector(".edit-btn");
      editBtn?.addEventListener("click", () => {
        this.setTrack(track);
        this.startEditing();
      });

      this.trackListDisplay?.appendChild(elm);
    });
  }

  /**
   * Saves the track to local storage
   * @param {Track} track - track to be saved
   */
  saveTrack(track) {
    this.saveData.tracks.set(track.id, track);
    this.updateSaveData();
    this.admin.setTrack(track);
    this.updateTrackDisplay();
  }

  /**
   *
   * @param {Track} track
   */
  setTrack(track) {
    this.editor.track = track;
  }
  // saveTrackCreation(track) {
  //   // if (!this.creatingTrack) return;
  //   const name = prompt("Track Name: ");
  //   const ej = {
  //     ...track,
  //     name: name || "Unnamed Track",
  //     id: crypto.randomUUID(),
  //     createdAt: new Date(),
  //   };
  //   this.saveData.tracks.push(ej);
  //   this.saveTrackData(this.saveData);
  //   this.displayTracks();
  //   this.designer.reset();
  // }

  // /**
  //  *
  //  * @param {SaveData} data track save data
  //  */
  // saveTrackData(data) {
  //   localStorage.setItem("localSave", JSON.stringify(data));
  // }

  // loadTrack(track) {
  //   this.admin.runTrack(track);
  // }

  // createTrackElement(track) {
  //   const trackElement = document.createElement("div");
  //   trackElement.className = "track";
  //   trackElement.innerHTML = `
  //     <h3>${track.name || "Unnamed Track"}</h3>
  //     <p>ID: ${track.id}</p>
  //     <p>Default: ${track.default ? "Yes" : "No"}</p>
  //     <p>Created At: ${new Date(track.createdAt).toLocaleString()}</p>
  //     <button class="delete-track">Delete</button>
  //     <button class="load-track">Play</button>
  //     <button class="make-default">Make Default</button>
  //   `;
  //   // trackElement
  //   //   .querySelector(".delete-track")
  //   //   .addEventListener("click", () => {
  //   //     this.deleteTrack(track.id);
  //   //   });

  //   trackElement.querySelector(".load-track")?.addEventListener("click", () => {
  //     this.admin.runTrack(track);
  //   });
  //   // trackElement
  //   //   .querySelector(".make-default")
  //   //   .addEventListener("click", () => {
  //   //     this.tracks.forEach((t) => (t.default = false)); // Reset all to not default
  //   //     track.default = true; // Set the clicked track as default
  //   //     this.saveToLocal();
  //   //     this.displayTracks();
  //   //   });
  //   return trackElement;
  // }

  // displayTracks() {
  //   if (!this.saveData.tracks || this.saveData.tracks.length === 0) {
  //     // @ts-ignore
  //     document.getElementById("track-list").innerHTML =
  //       "<p>No tracks found.</p>";
  //     return;
  //   }
  //   const trackList = document.getElementById("track-list");
  //   // @ts-ignore
  //   trackList.innerHTML = "";
  //   const sortedTracks = this.saveData.tracks.sort((a, b) => {
  //     // @ts-ignore
  //     return new Date(b.createdAt) - new Date(a.createdAt);
  //   });
  //   sortedTracks.forEach((track) => {
  //     const trackElement = this.createTrackElement(track);
  //     // @ts-ignore
  //     trackList.appendChild(trackElement);
  //   });
  // }

  // deleteTrack(id) {
  //   this.saveData.tracks = this.saveData.tracks.filter(
  //     (track) => track.id !== id
  //   );
  //   this.displayTracks();
  // }
}
