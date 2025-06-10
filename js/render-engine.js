class RenderEngine {
  constructor() {
    this.canvas = document.getElementById("game");
    this.ctx = this.canvas.getContext("2d");
    this.resizeCanvas();
    window.addEventListener("resize", () => this.resizeCanvas());
  }

  resizeCanvas() {
    if (window.innerWidth > 1200) {
      this.canvas.width = window.innerWidth * 0.7;
      this.canvas.height = window.innerHeight;
    } else {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight * 0.6;
    }
  }

  onClick(callback) {
    this.canvas.addEventListener("click", (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      callback({ x, y });
    });
  }

  drawEdge(points, color) {
    if (points.length < 2) return;
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    this.ctx.stroke();

    // Dots
    for (const p of points) {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      this.ctx.fillStyle = color;
      this.ctx.fill();
    }
  }

  fillTrack(inner, outer, fillColor = "#444") {
    if (inner.length < 3 || outer.length < 3) return;

    this.ctx.beginPath();

    this.ctx.beginPath();
    this.ctx.moveTo(inner[0].x, inner[0].y);
    for (let i = 1; i < inner.length; i++) {
      this.ctx.lineTo(inner[i].x, inner[i].y);
    }
    this.ctx.closePath();

    this.ctx.moveTo(outer[0].x, outer[0].y);
    for (let i = 1; i < outer.length; i++) {
      this.ctx.lineTo(outer[i].x, outer[i].y);
    }
    this.ctx.closePath();

    this.ctx.fillStyle = fillColor;
    this.ctx.fill("evenodd"); // 👈 this is key
  }

  drawTrack(track) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (!track || !track.innerEdge || !track.outerEdge) return;

    this.fillTrack(track.innerEdge, track.outerEdge);
    this.drawEdge(track.innerEdge, "#00FF00");
    this.drawEdge(track.outerEdge, "#FF0000");

    // Draw the track name
    this.ctx.font = "24px Arial";
    this.ctx.fillStyle = "#FFFFFF";
    this.ctx.textAlign = "center";
    this.ctx.fillText(
      "Track Name: " + (track.name || "Unnamed"),
      this.canvas.width / 2,
      30
    );
  }

  drawCar(car) {
    car.draw(this.ctx);
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
}
