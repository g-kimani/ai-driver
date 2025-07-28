class DesignerUI {
  /**
   *
   * @param {TrackEditor} editor
   */
  constructor(editor) {
    this.editor = editor;
    this.liveInfo = new LiveInfoPanel(
      document.getElementById("liveInfoPanel"),
      this.editor
    );
    this.trackSettings = new TrackSettingsPanel(
      document.getElementById("trackSettingsPanel"),
      this.editor
    );
    this.trackInfo = new TrackInfoPanel(
      document.getElementById("trackInfoPanel"),
      this.editor
    );

    this.setupMainControls();
  }

  /**
   * setup event listeners for 3 main control buttons
   * reset / save / cancel
   */
  setupMainControls() {
    const resetBtn = document.getElementById("resetTrack");
    if (!resetBtn) {
      throw new Error("Could not find reset track btn");
    }
    resetBtn.addEventListener("click", () => {
      this.editor.reset();
      this.update();
    });

    const saveBtn = document.getElementById("saveTrack");
    if (!saveBtn) {
      throw new Error("Could not find save track btn");
    }
    saveBtn.addEventListener("click", () => {
      this.editor.save();
    });

    const cancelBtn = document.getElementById("cancelTrack");
    if (!cancelBtn) {
      throw new Error("Could not find cancel track btn");
    }
    cancelBtn.addEventListener("click", () => {
      this.editor.cancel();
      this.update();
    });
  }

  update() {
    this.trackInfo.update();
  }
}

class LiveInfoPanel {
  constructor(rootEl, editor) {
    this.root = rootEl;
    this.editor = editor;
    this.selectedIndicator = document.getElementById("selectedIndicator");
    this.selectedType = document.getElementById("selectedType");
    this.selectedX = document.getElementById("selectedX");
    this.selectedY = document.getElementById("selectedY");
    this.deleteSelectedBtn = document.getElementById("deleteSelected");
    this.transformSelectedBtn = document.getElementById("transformSelected");

    if (!this.selectedIndicator) {
      throw new Error("Could not find selected indicator");
    }
    if (!this.selectedType) {
      throw new Error("Could not find selected type display");
    }
    if (!this.selectedX) {
      throw new Error("Could not find selected x pos display");
    }
    if (!this.selectedY) {
      throw new Error("Could not find selected y pos display");
    }
    if (!this.deleteSelectedBtn) {
      throw new Error("Could not find delete selected button");
    }
    if (!this.transformSelectedBtn) {
      throw new Error("Could not find transform selected button");
    }

    this.addEventListeners();
    this.updateSelectedPoint(null);
  }

  addEventListeners() {
    const mxDisplay = document.getElementById("mouseX");
    const myDisplay = document.getElementById("mouseY");
    if (!mxDisplay || !myDisplay) {
      throw new Error("Could not find mouse position display");
    }
    this.editor.events.subscribe("mousemove", (event) => {
      const pos = event.eventPos;

      mxDisplay.textContent = pos.x;
      myDisplay.textContent = pos.y;
    });

    this.editor.events.subscribe("pointSelected", (point) => {
      this.updateSelectedPoint(point);
    });

    this.deleteSelectedBtn?.addEventListener("click", (event) => {
      this.editor.deleteSelected();
    });

    this.transformSelectedBtn?.addEventListener("click", (event) => {
      this.editor.transformSelected();
    });
  }

  /**
   * Updates the display values for selected point
   */
  updateSelectedPoint(point) {
    this.selectedIndicator.classList.remove(
      ..."bg-amber-400 bg-red-400 bg-slate-200".split(" ")
    );
    this.selectedIndicator.classList.add(
      point ? (point.control ? "bg-amber-400" : "bg-red-400") : "bg-slate-200"
    );

    this.selectedType.classList.remove(
      ..."text-amber-400 text-red-400 border-amber-300 border-red-300 text-slate-300 border-slate-300".split(
        " "
      )
    );
    this.selectedType.classList.add(
      ...(point
        ? point.control
          ? "text-amber-300 border-amber-300".split(" ")
          : "text-red-300 border-red-300".split(" ")
        : "text-slate-300 border-slate-300".split(" "))
    );
    this.selectedType.textContent = point
      ? point.control
        ? "Control"
        : "Anchor"
      : "N/A";

    this.selectedX.textContent = point ? point.x : "N/A";
    this.selectedY.textContent = point ? point.y : "N/A";

    // @ts-ignore
    this.deleteSelectedBtn.disabled = point !== null;
    // @ts-ignore
    this.transformSelectedBtn.disabled = point !== null;
    return;
  }
}

class TrackSettingsPanel {
  constructor(rootEl, editor) {
    this.root = rootEl;
    this.editor = editor;
    this.nameInput = document.getElementById("trackName");
    this.colourInput = document.getElementById("trackColor");
    this.trackWidthInput = document.getElementById("trackWidth");
    this.trackWidthDisplay = document.getElementById("widthDisplay");
    this.drawOptionsContainer = document.getElementById("trackDrawOptions");
    if (!this.nameInput) {
      throw new Error("Could not find track name input");
    }
    if (!this.colourInput) {
      throw new Error("Could not find track colour input");
    }
    if (!this.trackWidthInput) {
      throw new Error("Could not find track width input");
    }
    if (!this.trackWidthDisplay) {
      throw new Error("Could not find track width display");
    }
    if (!this.drawOptionsContainer) {
      throw new Error("Could not find track draw options container");
    }

    // @ts-ignore
    this.trackWidthInput.value = this.editor.track.baseWidth;
    this.trackWidthDisplay.textContent = this.editor.track.baseWidth;
    // @ts-ignore
    this.colourInput.value = this.editor.track.baseColor;

    this.setupControls();
    this.setupDrawOptions();
  }

  setupControls() {
    if (!this.nameInput) {
      throw new Error("Could not find track name input");
    }
    this.nameInput.addEventListener("input", (event) => {
      // @ts-ignore
      this.editor.track.name = event.target.value;
    });

    if (!this.colourInput) {
      throw new Error("Could not find track color input");
    }
    this.colourInput.addEventListener("input", (event) => {
      // @ts-ignore
      this.editor.setTrackColor(event.target.value);
    });

    if (!this.trackWidthInput) {
      throw new Error("Could not find track width input");
    }
    this.trackWidthInput.addEventListener("input", (event) => {
      // @ts-ignore
      this.editor.setTrackWidth(event.target.value);
      // @ts-ignore
      this.trackWidthDisplay.textContent = event.target.value;
    });
  }

  setupDrawOptions() {
    if (!this.drawOptionsContainer) {
      throw new Error("Could not find draw options container");
    }
    this.drawOptionsContainer.innerHTML = "";
    console.log(
      "🚀 ~ TrackSettingsPanel ~ setupDrawOptions ~ this.editor.track.drawOptions:",
      this.editor.track.drawOptions
    );
    for (const [toggle, isActive] of Object.entries(
      this.editor.track.drawOptions
    )) {
      const toggleBtn = document.createElement("button");
      toggleBtn.classList.add("toggle-btn");
      if (isActive) {
        toggleBtn.classList.add("active");
      }
      toggleBtn.id = `${toggle}-btn`;
      toggleBtn.title = `Controls ${toggle}`;
      toggleBtn.dataset.toggle = toggle;
      toggleBtn.textContent = toggle;

      toggleBtn.addEventListener("click", () => {
        this.editor.track.drawOptions[toggle] =
          !this.editor.track.drawOptions[toggle];
        if (this.editor.track.drawOptions[toggle]) {
          toggleBtn.classList.add("active");
        } else {
          toggleBtn.classList.remove("active");
        }
        this.editor.drawTrack();
      });

      this.drawOptionsContainer.appendChild(toggleBtn);
    }
  }
}

class TrackInfoPanel {
  /**
   *
   * @param {TrackEditor} editor
   */
  constructor(rootEl, editor) {
    this.root = rootEl;
    this.editor = editor;
    this.pointsNumDisplay = document.getElementById("numOfPoints");
    this.segmentsNumDisplay = document.getElementById("numOfSegments");
    this.trackLengthDisplay = document.getElementById("trackLength");
    this.trackSegmentList = document.getElementById("trackSegmentList");
    this.trackPointsList = document.getElementById("trackPointList");

    if (!this.pointsNumDisplay) {
      throw new Error("Could not find points num display");
    }

    if (!this.segmentsNumDisplay) {
      throw new Error("Could not find segments num display");
    }

    if (!this.trackLengthDisplay) {
      throw new Error("Could not find track length num display");
    }

    if (!this.trackSegmentList) {
      throw new Error("Could not find track segment list display");
    }
    if (!this.trackPointsList) {
      throw new Error("Could not find track Points list display");
    }
    this.update();
    this.editor.events.subscribe("pointAdded", () => {
      this.update();
    });
    this.editor.events.subscribe("segmentAdded", () => {
      this.update();
    });
    this.editor.events.subscribe("pointMoved", () => {
      this.update();
    });
    this.editor.events.subscribe("pointDeleted", () => {
      this.update();
    });
    this.editor.events.subscribe("segmentDeleted", () => {
      this.update();
    });
    this.editor.events.subscribe("mouseUp", () => {
      this.update();
    });
  }

  /**
   * Updates all display elements
   */
  update() {
    this.updateStats();
    this.updateSegments();
    this.updatePoints();
  }

  /**
   * Updates the text displays
   */
  updateStats() {
    this.pointsNumDisplay.textContent = String(this.editor.track.points.length);
    this.segmentsNumDisplay.textContent = String(
      this.editor.track.segments.length
    );
  }
  /**
   * updates segment list
   */
  updateSegments() {
    this.trackSegmentList.innerHTML = "";
    const segments = this.editor.track.segments;
    if (segments.length === 0) {
      this.trackSegmentList.textContent = "NO SEGMENTS";
      return;
    }
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const elm = this.createSegmentElm(segment, i);
      this.trackSegmentList?.appendChild(elm);
    }
  }

  /**
   * Creates the segment element and adds controls
   */
  createSegmentElm(segment, i) {
    const elm = document.createElement("div");
    elm.classList = "bg-slate-300 px-4 py-2 my-2 rounded-2xl";
    elm.innerHTML = `
      <div class="flex items-center justify-between">
          <h4 class="text-lg font-semibold">Segment ${i + 1}</h4>
          <div class="segment-btns flex gap-4">
          </div>
      </div>
      <div class="segment-points flex flex-nowrap gap-1 justify-center">
      </div>
      <div class="flex justify-between items-center my-1">
          <p>Colour</p>
          <input type="color" title="color"
              value="${
                segment.color ?? this.editor.track.baseColor
              }" class="track-color w-1/3 h-8 rounded-full">
                        <button title="reset color" class="reset-color simple-btn rounded-full">
            🔁
          </button>
      </div>
      <div class="flex justify-between items-center">
          <p>Width</p>
          <span class="width-display">${
            segment.width ?? this.editor.track.baseWidth
          }</span>
          <input class="track-width" title="track width" data-segment="${i}-width" type="range" value="80" min="10" max="150"
              step="1" />
          <button title="reset width" class="reset-width simple-btn rounded-full">
            🔁
          </button>
      </div>

      `;
    // add segment buttons
    const btnCont = elm.querySelector(".segment-btns");
    if (!btnCont) {
      throw new Error("Could not find segment btns container");
    }
    btnCont.innerHTML = "";

    // ! UNSURE OF FOCUS FOR SEGMENT
    // const focusBtn = document.createElement("button");
    // focusBtn.classList.add(..."simple-btn rounded-full".split(" "));
    // focusBtn.textContent = "🎯";
    // focusBtn.addEventListener("click", () => {
    //   this.editor;
    // });
    // btnCntr?.appendChild(focusBtn);
    const delteBtn = document.createElement("button");
    delteBtn.classList.add(..."simple-btn rounded-full".split(" "));
    delteBtn.textContent = "🗑️";
    delteBtn.addEventListener("click", () => {
      this.editor.deleteSegment(segment);
    });
    btnCont?.appendChild(delteBtn);

    // add segment points
    const pointsCont = elm.querySelector(".segment-points");
    if (!pointsCont) {
      throw new Error("Could not find segment points container display");
    }
    pointsCont.innerHTML = "";

    const startElm = this.createSegmentPointElm(segment.start, "start");
    const controlElm = this.createSegmentPointElm(segment.control, "control");
    const endElm = this.createSegmentPointElm(segment.end, "end");

    pointsCont?.appendChild(startElm);
    pointsCont?.appendChild(controlElm);
    pointsCont?.appendChild(endElm);

    // handle segment controls
    const widthInput = elm.querySelector(".track-width");
    const widthDisplay = elm.querySelector(".width-display");
    if (!widthInput) {
      throw new Error("Could not find segment width  input");
    }
    if (!widthDisplay) {
      throw new Error("Could not find segment width  display");
    }
    widthInput.addEventListener("input", (event) => {
      // @ts-ignore
      widthDisplay.textContent = event.target.value;
      // @ts-ignore
      segment.width = parseInt(event.target.value);
      this.editor.drawTrack();
    });
    const resetWidthBtn = elm.querySelector(".reset-width");
    resetWidthBtn?.addEventListener("click", (event) => {
      segment.width = undefined;
      // @ts-ignore
      widthInput.value = this.editor.track.baseWidth;
      widthDisplay.textContent = String(this.editor.track.baseWidth);
      this.editor.drawTrack();
    });

    const colorInput = elm.querySelector(".track-color");
    if (!colorInput) {
      throw new Error("Could not find segment color  input");
    }
    colorInput?.addEventListener("input", (event) => {
      // @ts-ignore
      segment.color = event.target.value;
      this.editor.drawTrack();
    });
    const resetColorBtn = elm.querySelector(".reset-color");
    resetColorBtn?.addEventListener("click", (event) => {
      segment.color = undefined;
      // @ts-ignore
      colorInput.value = this.editor.track.baseColor;
      this.editor.drawTrack();
    });

    return elm;
  }

  createSegmentPointElm(point, heading) {
    const cont = document.createElement("div");
    cont.classList = "flex flex-col items-center gap-2";
    cont.innerHTML = `
    <h5 class=" text-sm font-semibold ${
      point.control ? "text-blue-700" : "text-amber-700"
    }">${heading}
        <span class="focus-btn">🎯</span>
    </h5>
    <div
        class="flex flex-nowrap px-2 py-1 gap-2 text-xs font-semibold rounded-lg border-gray-600 border-2 bg-slate-300 text-gray-600 ">
        <div class="flex flex-col">
            <p>X:</p>
            <p>Y:</p>
        </div>
        <div class="h-full p-px bg-slate-700"></div>

        <div class="flex flex-col">
            <p>${point.x}</p>
            <p>${point.y}</p>
        </div>
    </div>
    `;

    // add focus event listner
    const focusBtn = cont.querySelector(".focus-btn");
    if (!focusBtn) {
      throw new Error("Could not find point focus  btn");
    }
    focusBtn.addEventListener("click", () => {
      this.editor.setSelectedPoint(point);
    });
    return cont;
  }

  /**
   * updates point list
   */
  updatePoints() {
    this.trackPointsList.innerHTML = "";
    const points = this.editor.track.points;
    if (points.length === 0) {
      this.trackPointsList.textContent = "no points";
      return;
    }
    for (let i = 0; i < points.length; i++) {
      const point = points[i];
      const elm = document.createElement("div");
      elm.classList = "w-full px-4 py-2 my-2 bg-slate-300 rounded-2xl";
      elm.innerHTML = `
      <div class="flex justify-between items-center">
          <div class="flex flex-nowrap items-center gap-4">
              <h5 class="text-lg font-semibold">Point #${i + 1}</h5>
              <span
                  class="size-6 ${
                    point.control ? "bg-amber-400" : "bg-red-400"
                  } border-slate-400 border-2 rounded-full"></span>
          </div>
          <div class="flex flex-nowrap items-center gap-4">
              <button title="focus point"
                  class="focus-btn simple-btn rounded-full">🎯</button>
              <button title="delete point"
                  class="delete-btn simple-btn rounded-full">🗑️</button>
          </div>
      </div>
      <div class="flex items-center justify-between">
          <p>Position</p>
          <div class="flex flex-nowrap gap-2 ">
              <div class="flex items-center gap-1">
                  <p class="font-semibold">X:</p>
                  <span
                      class="bg-slate-300 text-gray-600 px-2 py-1 font-extrabold rounded-lg w-18">${
                        point.x
                      }</span>
              </div>
              <div class="flex items-center gap-1">
                  <p class="font-semibold">Y:</p>
                  <span
                      class="bg-slate-300 text-gray-600 px-2 py-1 font-extrabold rounded-lg w-18">${
                        point.y
                      }</span>
              </div>
          </div>
      </div>
      <div class="flex items-center justify-between py-2">
          <p>Type</p>
          <div
              class="w-1/3 border-2 text-center ${
                point.control
                  ? "text-amber-300 bg-slate-700 border-amber-300"
                  : "text-red-400 bg-slate-300 border-red-400"
              } ">
              <p>${point.control ? "Control" : "Anchor"}</p>
          </div>
      </div>
      `;

      // handle point btns
      const focusBtn = elm.querySelector(".focus-btn");
      focusBtn?.addEventListener("click", () => {
        this.editor.setSelectedPoint(point);
      });
      const deleteBtn = elm.querySelector(".delete-btn");
      deleteBtn?.addEventListener("click", () => {
        this.editor.deletePoint(point);
      });

      this.trackPointsList?.appendChild(elm);
    }
  }
}

// class DesignerUI {
//   constructor(editor, manager) {
//     this.editor = editor;
//     this.manager = manager;
//     this.liveInfo = new LiveInfoPanel(
//       document.querySelector(".live-info"),
//       this.editor
//     );
//     this.trackInfo = new TrackInfoPanel(
//       document.querySelector(".track-panel"),
//       this.editor
//     );
//     this.trackControls = new TrackControlsPanel(
//       document.querySelector(".track-controls"),
//       this.editor,
//       this.manager
//     );
//     this.setupdrawOptions();
//     // this.updateSegments();
//     this.setupTrackSettings();
//   }
//   setupdrawOptions() {
//     const group = document.querySelector(".toggle-buttons");
//     group.innerHTML = "";

//     for (const [toggle, isActive] of Object.entries(this.editor.drawOptions)) {
//       const toggleBtn = document.createElement("button");
//       toggleBtn.classList.add("toggle-btn");
//       if (isActive) toggleBtn.classList.add("active");
//       toggleBtn.id = `${toggle}-btn`;
//       toggleBtn.title = `Controls ${toggle}`;
//       toggleBtn.dataset.toggle = toggle;
//       toggleBtn.textContent = toggle;

//       toggleBtn.addEventListener("click", () => {
//         this.editor.drawOptions[toggle] = !this.editor.drawOptions[toggle];
//         console.log(this.editor.drawOptions);
//         if (this.editor.drawOptions[toggle]) {
//           toggleBtn.classList.add("active");
//         } else {
//           toggleBtn.classList.remove("active");
//         }
//         this.editor.drawTrack();
//       });

//       group.appendChild(toggleBtn);
//     }
//   }

//   setupTrackSettings() {
//     const widthInp = document.getElementById("trackWidthInput");
//     widthInp.value = this.editor.track.basekWidth;
//     widthInp.addEventListener("input", () => {
//       this.editor.track.basekWidth = widthInp.value;
//       this.editor.drawTrack();
//     });
//     const colorInp = document.getElementById("trackColorInput");
//     colorInp.value = this.editor.track.basekColor;
//     colorInp.addEventListener("input", () => {
//       this.editor.track.basekColor = colorInp.value;
//       this.editor.drawTrack();
//     });
//   }

//   updateSegments() {
//     const segmentList = document.getElementById("segmentsTab");

//     if (segmentList.firstChild == null) {
//       const segments = this.editor.track.segments;
//       for (let i = 0; i < segments.length; i++) {
//         segmentList.appendChild(this.createSegment(segments[i], i));
//       }
//     }
//   }

//   createSegment(segment, num) {
//     const elm = document.createElement("div");
//     elm.className = "track-segment";
//     elm.innerHTML = `
//         <div class="segment-header">
//             Segment: <span class="segment-number">#${num}</span>
//             <label>Sement Colour:
//                         <input type="color" class="segment-color-input" data-segment-num="${num}" />
//                     </label>
//                       <label>Segment Width:
//                         <input type="number" id="segmentWidthInput${num}" />
//                         <span class="warning" id="widthWarning"></span>
//                     </label>
//         </div>
//         <div class="segment-points">
//         ${Object.entries(segment)
//           .map(
//             ([purpose, pos]) => this.createSegmentPoint(pos, purpose).outerHTML
//           )
//           .join("")}
//         </div>
//     `;
//     const segmentWidthInp = elm.querySelector(`#segmentWidthInput${num}`);
//     segmentWidthInp.value = segment.width || this.editor.settings.trackWidth;
//     segmentWidthInp.addEventListener("input", (event) => {
//       this.editor.setSegmentWidth(num, segmentWidthInp.value);
//       this.editor.drawTrack();
//     });
//     const segmentColorInp = elm.querySelector(".segment-color-input");
//     segmentColorInp.value = segment.color || this.editor.settings.trackColor;
//     segmentColorInp.addEventListener("input", (event) => {
//       this.editor.setSegmentColor(num, segmentColorInp.value);
//       this.editor.drawTrack();
//     });
//     return elm;
//   }
//   createSegmentPoint(point, purpose) {
//     const elm = document.createElement("div");
//     elm.className = "segment-point";
//     elm.innerHTML = `
//                 <span class="purpose segment-${purpose}">${purpose}</span>
//                 <div class="point-pos">
//                     <span class="point-x">X: ${point.x}</span>
//                     <span class="point-y">y:  ${point.y}</span>
//                 </div>
//     `;
//     return elm;
//   }
//   updateSelectedPoint() {}

//   update() {
//     // this.updateSegments();
//     this.updateSelectedPoint();
//   }
// }

// class TrackControlsPanel {
//   constructor(rootEl, editor, manager) {
//     this.root = rootEl;
//     this.editor = editor;
//     this.manager = manager;
//     this.editor.subscribe("update", () => {
//       this.update();
//     });
//     this.setupControls();
//   }
//   setupControls() {
//     const clearTrack = document.getElementById("clearTrack");
//     clearTrack?.addEventListener("click", () => {
//       this.editor.resetTrack();
//     });
//     const saveTrack = document.getElementById("saveTrack");
//     saveTrack?.addEventListener("click", () => {
//       this.manager.saveTrackCreation(this.editor.track);
//       document.getElementById("statusText").textContent = "Track saved!";
//     });
//   }
//   update() {
//     // Update controls if needed
//   }
// }

// class LiveInfoPanel {
//   constructor(rootEl, editor) {
//     this.root = rootEl;
//     this.editor = editor;
//     this.editor.subscribe("mousemove", (pos) => {
//       const mxDisplay = document.getElementById("mouseX");
//       const myDisplay = document.getElementById("mouseY");
//       mxDisplay.textContent = pos.x;
//       myDisplay.textContent = pos.y;
//     });
//     this.editor.subscribe("pointSelected", this.updateSelectedPoint);
//     document.getElementById("deleteSelected").addEventListener("click", () => {
//       this.editor.deleteSelected();
//     });
//     document.getElementById("anchorSelected").addEventListener("click", () => {
//       this.editor.makeSelectedAnchor();
//     });
//     document.getElementById("controlSelected").addEventListener("click", () => {
//       this.editor.makeSelectedControl();
//     });
//   }
//   updateSelectedPoint(point) {
//     console.log("🚀 ~ LiveInfoPanel ~ updateSelectedPoint ~ point:", point);
//     const selectedElm = document.getElementById("selectedPoint");
//     if (!point) {
//       selectedElm.querySelector(".selected-type").textContent = "none";
//       document.getElementById("selectedX").textContent = "n/a";
//       document.getElementById("selectedY").textContent = "n/a";
//       return;
//     }
//     selectedElm.querySelector(".selected-type").textContent = point.control
//       ? "control"
//       : "anchor";
//     document.getElementById("selectedX").textContent = point.x;
//     document.getElementById("selectedY").textContent = point.y;
//     if (point.control) {
//       document.getElementById("deleteSelected").disabled = true;
//     } else {
//       document.getElementById("deleteSelected").disabled = false;
//     }
//   }
// }

// class TrackInfoPanel {
//   constructor(rootEl, editor) {
//     this.root = rootEl;
//     this.editor = editor;
//     this.editor.subscribe("update", () => {
//       this.updateTrackStats();
//     });
//   }
//   updateTrackStats() {
//     document.getElementById("pointCount").textContent =
//       this.editor.track.length;
//     document.getElementById("segmentCount").textContent = 2;
//     document.getElementById("trackDistance").textContent = 2;
//   }
//   update() {
//     this.updateTrackStats();
//   }
// }
