class TrackEditor {
  /**
   * @param {TrackManager} manager
   * @param {RenderEngine} renderer
   */
  constructor(manager, renderer) {
    this.renderer = renderer;
    this.manager = manager;

    /** @type {Track} - Track Data */
    this.track = this.createBaseTrack();

    this.selectedPoint = null;
    this.addingSegment = false;
    /** @type {TrackSegment|null} */
    this.tempSegment = null;
    this.isDragging = false;

    this.controlRadius = 20;
    this.events = new EventHandler();

    this.ui = new DesignerUI(this);
    this.eventListeners();
  }

  /**
   * Setup event listeners
   */
  eventListeners() {
    this.renderer.events.subscribe("mousemove", (event) => {
      if (this.manager.editing) {
        this.handleMouseMove(event);
        this.events.trigger("mousemove", event);
      }
    });

    this.renderer.events.subscribe("click", (event) => {
      if (this.manager.editing) {
        this.handleClick(event);
      }
    });

    this.renderer.events.subscribe("contextmenu", (event) => {
      if (this.manager.editing) {
        this.handleRightClick(event);
      }
    });

    this.renderer.events.subscribe("keydown", (event) => {
      if (this.manager.editing) {
        this.handleKeyDown(event);
      }
    });
    this.renderer.events.subscribe("keyup", (event) => {
      if (this.manager.editing) {
        this.handleKeyUp(event);
      }
    });

    this.renderer.events.subscribe("mousedown", (event) => {
      if (this.manager.editing) {
        this.handleMouseDown(event);
      }
    });
    this.renderer.events.subscribe("mouseup", (event) => {
      if (this.manager.editing) {
        this.handleMouseUp(event);
      }
    });
  }

  /**
   * Creates a base track object
   * @returns {Track} new track object
   */
  createBaseTrack() {
    return {
      name: "",
      id: "",
      createdAt: new Date(),
      points: [],
      segments: [],
      baseWidth: 70,
      baseColor: "#222222",
      collisionMap: [],
      drawOptions: {
        dotOutline: true,
        fillTrack: true,
        strokeTrack: true,
        drawControls: true,
        drawCollisionMap: false,
      },
    };
  }

  /**
   * Builds a collision map of the given track segments
   * @param {Array<TrackSegment>} segments each segment of track
   * @param {number} width width of collision map
   * @param {number} height height of collision map
   * @param {number} cellSize size of cells to be tested
   * @returns {Array<Array<number>>} collision map
   */
  buildCollisionMap(segments, width, height, cellSize = 4) {
    const cols = Math.ceil(width + 100 / cellSize);
    const rows = Math.ceil(height + 100 / cellSize);
    const collisionMap = Array.from({ length: rows }, () =>
      Array(cols).fill(0)
    );

    for (let seg of segments) {
      // Build polygon from edges
      const polygon = [...seg.edges.l, ...seg.edges.r.slice().reverse()];
      // For each cell in the bounding box of the polygon
      const minX = Math.floor(Math.min(...polygon.map((p) => p.x)) / cellSize);
      const maxX = Math.ceil(Math.max(...polygon.map((p) => p.x)) / cellSize);
      const minY = Math.floor(Math.min(...polygon.map((p) => p.y)) / cellSize);
      const maxY = Math.ceil(Math.max(...polygon.map((p) => p.y)) / cellSize);

      for (let y = minY; y <= maxY; y++) {
        for (let x = minX; x <= maxX; x++) {
          const px = x * cellSize + cellSize / 2;
          const py = y * cellSize + cellSize / 2;
          if (this.pointInPolygon({ x: px, y: py }, polygon)) {
            collisionMap[y][x] = 1; // Mark as occupied
          }
        }
      }
    }
    this.track.collisionMap = collisionMap; // Store the collision map in the track designer
    return collisionMap;
  }

  /**
   *  Ray-casting point-in-polygon test
   */
  pointInPolygon(point, vs) {
    let inside = false;
    for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
      const xi = vs[i].x,
        yi = vs[i].y;
      const xj = vs[j].x,
        yj = vs[j].y;
      const intersect =
        yi > point.y !== yj > point.y &&
        point.x < ((xj - xi) * (point.y - yi)) / (yj - yi + 0.00001) + xi;
      if (intersect) inside = !inside;
    }
    return inside;
  }

  /**
   * Saves the current track to local storage
   */
  save() {
    if (this.track.points.length === 0 || this.track.segments.length === 0) {
      alert("Cannot save a track with no segments");
      return;
    }
    if (this.track.id === "") {
      this.track.id = crypto.randomUUID();
    }
    if (this.track.name === "") {
      this.track.name = prompt("Enter track name: ") ?? "N/A Name";
    }
    this.manager.saveTrack(this.track);
    this.cancel();
  }

  /**
   * Cancels the editing of the track
   */
  cancel() {
    this.reset();
    this.manager.cancelEditing();
  }

  /**
   * Handles click events on the canvas
   */
  handleClick(event) {
    console.log("🚀 ~ TrackDesigner ~ handleClick ~ event:", event);
    const { x, y } = event.eventPos;
    const existingPoint = this.getPointAt({ x, y });
    if (event.ctrlKey || event.metaKey) {
      this.handleAddingSegment({ x, y });
      this.addingSegment = true;
    } else {
      if (existingPoint) {
        this.setSelectedPoint(existingPoint);
      } else {
        this.setSelectedPoint(null);
      }
    }
    this.drawTrack();
    // const collisionMap = this.buildCollisionMap(
    //   this.track.segments,
    //   this.renderer.canvas.width,
    //   this.renderer.canvas.height
    // );
    // this.track.collisionMap = collisionMap;
  }

  /**
   * Handles setting start and end of a new segment.
   *
   * Takes in a position newPos and creates a point (if point already existed at position references that)
   * If setting start of segment, sets tempSegment start to point and returns
   * When setting end creates a mid point control between start and end and adds segment to track
   * resets tempSegment to null after
   *
   * ? Start and end points cannot be equal
   */
  handleAddingSegment(newPos) {
    console.log("🚀 ~ TrackDesigner ~ handleAddingSegment ~ newPos:", newPos);
    let connectingPoint = { ...newPos, control: false };
    const existingPoint = this.getPointAt(newPos);
    if (existingPoint) {
      connectingPoint = existingPoint; // Use existing point if it exists
    } else {
      this.addPointToTrack(connectingPoint); // Add new point to track
    }

    if (!this.tempSegment?.start) {
      this.tempSegment = {
        start: connectingPoint,
        control: null,
        end: null,
        edges: { l: [], r: [] },
      };
      return;
    }
    if (this.pointsEqual(this.tempSegment.start, connectingPoint)) {
      console.warn("Cannot connect segment to itself");
      return;
    }
    // If we already have a start point, set the end point
    this.tempSegment.end = connectingPoint;

    const controlPoint = {
      ...this.getMidpoint(this.tempSegment.start, this.tempSegment.end),
      control: true,
    };
    this.tempSegment.control = controlPoint;
    // Ensure control point is added to track points
    this.addPointToTrack(controlPoint);
    this.track.segments.push(this.tempSegment);
    this.events.trigger("segmentAdded");
    this.setSelectedPoint(this.tempSegment.end); // Deselect any point

    this.tempSegment = null; // Reset adding segment

    this.track.collisionMap = this.buildCollisionMap(
      this.track.segments,
      this.renderer.canvas.width,
      this.renderer.canvas.height
    );
  }

  /**
   * Adds point to track
   * Cannot add 2 points with the same location
   * @param {Point} point
   */
  addPointToTrack(point) {
    if (!this.getPointAt(point, false)) {
      this.track.points.push(point);
      this.events.trigger("pointAdded", point);
    } else {
      console.warn("Point already exists at", point);
    }
  }

  /**
   * Handles right click on the canvas
   */
  handleRightClick(event) {
    const { x, y } = event.eventPos;
    console.log("Canvas right-clicked", x, y);
  }

  /**
   * handles drawing potential segment and point to be added
   * also handles moving position of selected point if dragging it
   */
  handleMouseMove(event) {
    const { x, y } = event.eventPos;
    if (this.addingSegment) {
      this.drawTrack();
      this.renderer.drawPoint(event.eventPos, this.controlRadius);
      if (this.tempSegment?.start) {
        this.drawPotentialSegment(x, y);
      }
      return;
    }
    if (this.isDragging && this.selectedPoint) {
      this.selectedPoint.x = x;
      this.selectedPoint.y = y;

      this.drawTrack();
      this.events.trigger("pointMoved", this.selectedPoint);
    }
  }

  /**
   * Draws the potential temp segment
   */
  drawPotentialSegment(x, y) {
    if (!this.tempSegment) return;
    if (this.tempSegment) {
      // Update the end point of the segment being added
      this.tempSegment.end = { x, y };
      this.tempSegment.control = {
        ...this.getMidpoint(this.tempSegment.start, this.tempSegment.end),
        control: true,
      };
    }

    this.drawTrack();
    this.buildSegmentEdges(this.tempSegment);
    // draw the segment being added
    this.renderer.drawSegment(this.tempSegment, this.track);
    this.renderer.drawPoint(this.tempSegment.start, this.controlRadius);
    this.renderer.drawPoint(this.tempSegment.end, this.controlRadius);
    this.renderer.drawPoint(this.tempSegment.control, this.controlRadius);
  }

  /**
   * Selects the point if there is a point at event pos and sets dragging true
   */
  handleMouseDown(event) {
    const { x, y } = event.eventPos;
    const existingPoint = this.getPointAt({ x, y });
    if (existingPoint) {
      this.setSelectedPoint(existingPoint);
    }
    this.isDragging = true;
  }

  /**
   * Sets dragging false
   */
  handleMouseUp(event) {
    this.isDragging = false;
    this.track.collisionMap = this.buildCollisionMap(
      this.track.segments,
      this.renderer.canvas.width,
      this.renderer.canvas.height
    );
  }

  /**
   * Handles keydown event
   */
  handleKeyDown(event) {
    if (event.key === "Control" || event.key === "Meta") {
      this.addingSegment = true;
      if (!this.tempSegment && this.selectedPoint) {
        this.tempSegment = {
          start: this.selectedPoint,
          control: null,
          end: null,
          edges: { l: [], r: [] },
        };
      }
    }
  }

  /**
   * Handles key up event
   */
  handleKeyUp(event) {
    if (event.key === "Control" || event.key === "Meta") {
      this.addingSegment = false;
      this.tempSegment = null; // Reset segment to add
      this.drawTrack();
    }
  }

  /**
   * Sets the selected point
   * @param {Point|null} point
   */
  setSelectedPoint(point) {
    this.selectedPoint = point;
    this.events.trigger("pointSelected", point);
  }

  /**
   * Turns the selected point into an anchor point.
   * Only works on controls turning one semgent into two
   *
   * eg. A - C - A  =>  A - C - A - C - A
   */
  makeSelectedAnchor() {
    if (!this.selectedPoint) {
      console.warn("No point selected to make anchor");
      return;
    }
    if (!this.selectedPoint.control) {
      console.warn("Selected point is already an anchor");
      return;
    }
    const segments = this.findPointSegments(this.selectedPoint);
    if (segments.length === 0) {
      console.warn("No segments found for selected point");
      return;
    }
    if (segments.length > 1) {
      console.warn(
        "Selected point is part of multiple segments, cannot convert to anchor"
      );
      return;
    }
    // Convert control point to anchor point
    this.selectedPoint.control = false;

    this.deleteSegment(segments[0]); // Remove the segment associated with this point

    // build two segments from the point to its neighbors
    const seg1control = this.createControlPoint(
      this.getMidpoint(segments[0].start, this.selectedPoint)
    );
    const segment1 = {
      start: segments[0].start,
      control: seg1control,
      end: this.selectedPoint,
      color: segments[0].color,
      width: segments[0].width,
      edges: { l: [], r: [] },
    };

    const seg2control = this.createControlPoint(
      this.getMidpoint(segments[0].end, this.selectedPoint)
    );
    const segment2 = {
      start: this.selectedPoint,
      control: seg2control,
      end: segments[0].end,
      color: segments[0].color,
      width: segments[0].width,
      edges: { l: [], r: [] },
    };

    this.buildSegmentEdges(segment1);
    this.buildSegmentEdges(segment2);
    this.addPointToTrack(seg1control);
    this.addPointToTrack(seg2control);
    this.addPointToTrack(this.selectedPoint);

    this.track.segments.push(segment1, segment2);
    this.drawTrack();
    this.events.trigger("pointUpdated", this.selectedPoint);
  }

  /**
   * Turns selected point into a control point.
   * Only works on anchors turning two segments into one.
   *
   * eg. A - C - A - C - A  =>  A - C - A
   */
  makeSelectedControl() {
    if (!this.selectedPoint) {
      console.warn("No point selected to make control");
      return;
    }
    if (this.selectedPoint.control) {
      console.warn("Selected point is already a control point");
      return;
    }
    const segments = this.findPointSegments(this.selectedPoint);
    if (segments.length === 0) {
      console.warn("No segments found for selected point");
      return;
    }
    if (segments.length < 2) {
      console.warn(
        "Selected point is not part of enough segments to convert to control"
      );
      return;
    }
    // Convert anchor point to control point
    this.selectedPoint.control = true;

    // Remove the segments associated with this point
    for (let segment of segments) {
      this.deleteSegment(segment);
    }

    let start = segments[0].start;
    if (this.pointsEqual(start, this.selectedPoint)) {
      start = segments[0].end;
    }
    let end = segments[1].end;
    if (this.pointsEqual(end, this.selectedPoint)) {
      end = segments[1].start;
    }

    // Create a new segment with the selected point as control
    const newSegment = {
      start: start,
      control: this.selectedPoint,
      end: end,
      color: segments[0].color,
      width: segments[0].width,
      edges: { l: [], r: [] },
    };
    this.addPointToTrack(this.selectedPoint);
    this.buildSegmentEdges(newSegment);
    this.track.segments.push(newSegment);
    this.drawTrack();
    this.events.trigger("pointUpdated", this.selectedPoint);
  }

  /**
   * Finds all segments this point belongs to.
   *
   * @param {Point} point
   */
  findPointSegments(point) {
    const segments = [];
    for (let segment of this.track.segments) {
      if (
        this.pointsEqual(segment.start, point) ||
        this.pointsEqual(segment.end, point) ||
        this.pointsEqual(segment.control, point)
      ) {
        segments.push(segment);
      }
    }
    return segments;
  }

  /**
   * Creates a control point with the given position
   *
   * @returns {Point}
   */
  createControlPoint(p = { x: 0, y: 0 }) {
    return {
      x: p.x,
      y: p.y,
      control: true,
    };
  }

  /**
   * Deletes the given segment from the track
   * Logs a warning if no segment found
   */
  deleteSegment(segment) {
    const index = this.track.segments.indexOf(segment);
    if (index !== -1) {
      this.track.segments.splice(index, 1);
      this.cleanTrackPoints();
      this.drawTrack();
      this.events.trigger("segmentDeleted", segment);
    } else {
      console.warn("Segment not found in track");
    }
  }

  /**
   * Deletes the given track point and any segements the point belongs to
   */
  deletePoint(point) {
    const index = this.track.points.indexOf(point);
    if (index === -1) {
      console.warn("Point not found in track");
      return;
    }

    // delete the point from track
    this.track.points.splice(index, 1);

    // delete the segment(s) the point belongs to
    const segments = this.findPointSegments(point);
    for (let segment of segments) {
      this.deleteSegment(segment);
    }
    this.events.trigger("pointDeleted", point);
    this.drawTrack();
  }

  /**
   * Deletes the currently selected point
   */
  deleteSelected() {
    if (!this.selectedPoint) return;
    this.deletePoint(this.selectedPoint);
    this.setSelectedPoint(null);
  }

  /**
   * Transform the selected point into opposite type
   *
   * eg. Control -> Anchor | Anchor -> Control
   */
  transformSelected() {
    if (!this.selectedPoint) return;
    if (this.selectedPoint.control) {
      this.makeSelectedAnchor();
    } else {
      this.makeSelectedControl();
    }
    this.track.collisionMap = this.buildCollisionMap(
      this.track.segments,
      this.renderer.canvas.width,
      this.renderer.canvas.height
    );
    this.drawTrack();
  }

  /**
   * Clears all track points that do not belong to a segment
   */
  cleanTrackPoints() {
    const points = this.track.points.slice();
    for (let point of points) {
      if (this.findPointSegments(point).length === 0) {
        this.track.points.splice(this.track.points.indexOf(point), 1);
      }
    }
  }

  /**
   * Returns the track point at the given position
   * allowTolerance will check within the bounds of controlRadius
   */
  getPointAt(p = { x: 0, y: 0 }, allowTolerance = true) {
    for (let point of this.track.points) {
      if (this.pointsEqual(point, p)) {
        return point;
      }
      if (!allowTolerance) continue; // Skip tolerance check if not allowed
      if (Math.hypot(point.x - p.x, point.y - p.y) < this.controlRadius) {
        return point;
      }
    }
  }

  /**
   * Returns midpoint between two given points
   */
  getMidpoint(p1, p2) {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
  }

  /**
   * Builds and draws the track
   */
  drawTrack() {
    this.buildTrack();
    this.renderer.drawTrack(this.track);
    if (this.track.drawOptions.drawControls) {
      for (let point of this.track.points) {
        this.renderer.drawPoint(point, this.controlRadius);
      }
    }
  }

  /**
   * Builds segment edges and joins at corners
   */
  buildTrack() {
    // Draw each quadratic Bézier segment
    for (let i = 0; i < this.track.segments.length; i++) {
      const segment = this.track.segments[i];
      this.buildSegmentEdges(segment);
    }
    this.smoothSegmentJoins();
  }

  /**
   * Builds left and right edges of bezier segment
   */
  buildSegmentEdges(segment) {
    const samples = 50;

    segment.edges = {
      l: [],
      r: [],
    };
    const { start: P0, control: P1, end: P2 } = segment;
    this.getBezierPoints(P0, P1, P2, samples, (point, t) => {
      // point is the current point on the curve
      // t is the normalized distance along the curve (0 to 1)
      const dx = 2 * (1 - t) * (P1.x - P0.x) + 2 * t * (P2.x - P1.x);
      const dy = 2 * (1 - t) * (P1.y - P0.y) + 2 * t * (P2.y - P1.y);
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      segment.edges.r.push({
        x: point.x + nx * ((segment.width ?? this.track.baseWidth) / 2),
        y: point.y + ny * ((segment.width ?? this.track.baseWidth) / 2),
      });
      segment.edges.l.push({
        x: point.x - nx * ((segment.width ?? this.track.baseWidth) / 2),
        y: point.y - ny * ((segment.width ?? this.track.baseWidth) / 2),
      });
    });
  }
  /**
   * Smooths the joins between connected segments by averaging their edge points at shared anchors.
   * Call this after buildTrack().
   */
  smoothSegmentJoins() {
    const segments = this.track.segments;
    for (let i = 0; i < segments.length - 1; i++) {
      const segA = segments[i];
      const segB = segments[i + 1];
      // If segA.end and segB.start are the same object (shared anchor)
      if (segA.end === segB.start) {
        // Left edge
        const aL = segA.edges.l[segA.edges.l.length - 1];
        const bL = segB.edges.l[0];
        const avgL = { x: (aL.x + bL.x) / 2, y: (aL.y + bL.y) / 2 };
        segA.edges.l[segA.edges.l.length - 1] = avgL;
        segB.edges.l[0] = avgL;
        // Right edge
        const aR = segA.edges.r[segA.edges.r.length - 1];
        const bR = segB.edges.r[0];
        const avgR = { x: (aR.x + bR.x) / 2, y: (aR.y + bR.y) / 2 };
        segA.edges.r[segA.edges.r.length - 1] = avgR;
        segB.edges.r[0] = avgR;
      }
    }
    // If your track is closed, also smooth the join between last and first
    if (
      segments.length > 1 &&
      segments[segments.length - 1].end === segments[0].start
    ) {
      const segA = segments[segments.length - 1];
      const segB = segments[0];
      const aL = segA.edges.l[segA.edges.l.length - 1];
      const bL = segB.edges.l[0];
      const avgL = { x: (aL.x + bL.x) / 2, y: (aL.y + bL.y) / 2 };
      segA.edges.l[segA.edges.l.length - 1] = avgL;
      segB.edges.l[0] = avgL;
      const aR = segA.edges.r[segA.edges.r.length - 1];
      const bR = segB.edges.r[0];
      const avgR = { x: (aR.x + bR.x) / 2, y: (aR.y + bR.y) / 2 };
      segA.edges.r[segA.edges.r.length - 1] = avgR;
      segB.edges.r[0] = avgR;
    }
  }

  /**
   * Follows bezier curve sampling points and providing them in callback and returned array
   */
  getBezierPoints(P0, P1, P2, samples = 40, callback) {
    const points = [];
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      // Quadratic Bézier formula
      const x =
        (1 - t) * (1 - t) * P0.x + 2 * (1 - t) * t * P1.x + t * t * P2.x;
      const y =
        (1 - t) * (1 - t) * P0.y + 2 * (1 - t) * t * P1.y + t * t * P2.y;
      points.push({ x, y });
      if (callback) {
        callback({ x, y }, i / samples);
      }
    }
    return points;
  }

  /**
   * Returns true if both points are at the same position
   */
  pointsEqual(p1, p2) {
    if (!p1 || !p2) return false;
    return p1.x === p2.x && p1.y === p2.y;
  }

  /**
   * Sets track base color, does not affect segment color
   */
  setTrackColor(color) {
    this.track.baseColor = color;
    this.drawTrack();
  }

  /**
   * Sets the track base width, does not affect individual segment width
   */
  setTrackWidth(width) {
    this.track.baseWidth = width;
    this.track.collisionMap = this.buildCollisionMap(
      this.track.segments,
      this.renderer.canvas.width,
      this.renderer.canvas.height
    );
    this.drawTrack();
  }

  /**
   * Resets all values for the track designer to default
   */
  reset() {
    this.track = this.createBaseTrack();

    this.selectedPoint = null;
    this.addingSegment = false;
    this.tempSegment = null;
    this.isDragging = false;
    this.drawTrack();
  }
}
