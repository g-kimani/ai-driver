class RenderEngine {
  /**
   *
   * @param {GameAdmin} admin
   */
  constructor(admin) {
    this.admin = admin;
    const canvas = document.getElementById("game");
    if (!canvas) {
      throw new Error("could not find game canvas");
    }
    /**@type {HTMLCanvasElement} */
    // @ts-ignore
    this.canvas = canvas;

    const ctx = this.canvas.getContext("2d");
    if (!ctx) {
      throw new Error("could not get canvas 2d context");
    }
    /**@type {CanvasRenderingContext2D} */
    this.ctx = ctx;

    this.events = new EventHandler();
    this.resizeCanvas();
    this.eventListeners();
  }

  eventListeners() {
    window.addEventListener("resize", () => this.resizeCanvas());

    this.canvas.addEventListener("click", (event) => {
      this.events.trigger("click", this.createMousEvent(event));
    });

    this.canvas.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      this.events.trigger("contextmenu", this.createMousEvent(event));
    });

    this.canvas.addEventListener("mousemove", (event) => {
      this.events.trigger("mousemove", this.createMousEvent(event));
    });
    this.canvas.addEventListener("mousedown", (event) => {
      this.events.trigger("mousedown", this.createMousEvent(event));
    });
    this.canvas.addEventListener("mouseup", (event) => {
      this.events.trigger("mouseup", this.createMousEvent(event));
    });
    document.addEventListener("keydown", (event) => {
      this.events.trigger("keydown", event);
    });
    document.addEventListener("keyup", (event) => {
      this.events.trigger("keyup", event);
    });
  }
  createMousEvent(event) {
    return {
      eventPos: this.eventPos(event),
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
    };
  }

  eventPos(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return { x, y };
  }

  drawTrack(track) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (track.drawOptions.drawCollisionMap) {
      this.drawCollisionMap(track);
      return;
    }
    for (let i = 0; i < track.segments.length; i++) {
      this.drawSegment(track.segments[i], track);
    }
  }
  drawCollisionMap(track) {
    if (!track.collisionMap || track.collisionMap.length === 0) return;
    const cellSize = 4;
    this.ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
    for (let y = 0; y < track.collisionMap.length; y++) {
      for (let x = 0; x < track.collisionMap[y].length; x++) {
        if (track.collisionMap[y][x] === 1) {
          this.ctx.beginPath();
          this.ctx.arc(x * cellSize, y * cellSize, cellSize, 0, Math.PI * 2);
          this.ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
          this.ctx.fill();
        }
      }
    }
  }
  drawSegment(segment, track) {
    this.ctx.beginPath();

    // move to start of left edge
    this.ctx.moveTo(segment.edges.l[0].x, segment.edges.l[0].y);
    // Draw left edge
    for (let pt of segment.edges.l) {
      this.ctx.lineTo(pt.x, pt.y);
    }
    // Draw right edge
    for (let j = segment.edges.r.length - 1; j >= 0; j--) {
      const pt = segment.edges.r[j];
      this.ctx.lineTo(pt.x, pt.y);
    }

    if (track.drawOptions.fillTrack) {
      this.ctx.fillStyle = segment.color ?? track.baseColor;
      // console.log(
      //   "🚀 ~ RenderEngine ~ drawSegment ~ segment.color:",
      //   segment.color
      // );
      this.ctx.fill();
    }
    if (track.drawOptions.strokeTrack) {
      this.ctx.strokeStyle = "#222";
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }

    if (track.drawOptions.dotOutline) {
      for (let pt of segment.edges.l) this.drawPoint(pt, 2, "#ff0000");
      for (let i = segment.edges.r.length - 1; i >= 0; i--)
        this.drawPoint(segment.edges.r[i], 2, "#ff0000");
    }

    this.ctx.closePath();
  }
  drawPoint(p, radius = 20, color = "#ff0000") {
    this.ctx.beginPath();
    this.ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = color === null ? (p.control ? "blue" : "red") : color;
    this.ctx.fill();
    this.ctx.closePath();
  }

  drawCar(car) {
    car.draw(this.ctx);
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  resizeCanvas() {
    if (!this.canvas?.parentElement) {
      this.canvas.width = 500;
      this.canvas.height = 500;
      return;
    }
    const style = getComputedStyle(this.canvas.parentElement);
    const paddingTop = parseFloat(style.paddingTop);
    const paddingBottom = parseFloat(style.paddingBottom);
    const paddingLeft = parseFloat(style.paddingLeft);
    const paddingRight = parseFloat(style.paddingRight);
    this.canvas.width =
      this.canvas?.parentElement?.clientWidth - paddingLeft - paddingRight;

    this.canvas.height =
      this.canvas?.parentElement?.clientHeight - paddingTop - paddingBottom;
  }
}
