/**
 * Living 3D Particle Constellation Engine
 * High-performance 3D perspective projection, orbital drift, filament connections, and cursor parallax.
 * Pure HTML5 Canvas without heavy external libraries.
 */

export class Particles3D {
  constructor(canvasId = 'particles-3d-canvas') {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.count = 95;
    this.fov = 380;
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    // 3D rotation & parallax state
    this.rotX = 0;
    this.rotY = 0;
    this.targetRotX = 0;
    this.targetRotY = 0;
    this.mouseX = this.width / 2;
    this.mouseY = this.height / 2;

    this.animating = false;
    this.rafId = null;
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.init();
  }

  init() {
    this.handleResize();
    this.createParticles();
    this.setupEvents();
    this.start();
  }

  setupEvents() {
    window.addEventListener('resize', () => {
      this.handleResize();
    });

    window.addEventListener('pointermove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;

      const normX = (e.clientX / this.width) - 0.5;
      const normY = (e.clientY / this.height) - 0.5;

      this.targetRotY = normX * 0.45;
      this.targetRotX = -normY * 0.45;
    }, { passive: true });

    // Pause when page is not visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stop();
      } else {
        this.start();
      }
    });

    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.prefersReducedMotion = e.matches;
    });
  }

  handleResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    this.canvas.width = Math.round(this.width * this.dpr);
    this.canvas.height = Math.round(this.height * this.dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    // Scale particle count dynamically based on screen width
    if (this.width < 768) {
      this.count = 45;
    } else if (this.width < 1200) {
      this.count = 75;
    } else {
      this.count = 105;
    }

    if (this.particles.length !== this.count) {
      this.createParticles();
    }
  }

  createParticles() {
    this.particles = [];
    const spreadX = this.width * 0.95;
    const spreadY = this.height * 0.95;
    const spreadZ = 600;

    const colors = [
      { r: 240, g: 245, b: 255 }, // Starlight White
      { r: 56,  g: 189, b: 248 }, // Cyan glow
      { r: 168, g: 85,  b: 247 }, // Soft violet
      { r: 140, g: 170, b: 255 }  // Luminescent Ice Blue
    ];

    for (let i = 0; i < this.count; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)];
      this.particles.push({
        x: (Math.random() - 0.5) * spreadX,
        y: (Math.random() - 0.5) * spreadY,
        z: (Math.random() - 0.5) * spreadZ,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        vz: (Math.random() - 0.5) * 0.25,
        radius: Math.random() * 1.8 + 1.1,
        color: color,
        alpha: Math.random() * 0.45 + 0.35,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }
  }

  start() {
    if (!this.animating) {
      this.animating = true;
      this.loop();
    }
  }

  stop() {
    this.animating = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }

  loop() {
    if (!this.animating) return;

    this.update();
    this.render();

    this.rafId = requestAnimationFrame(() => this.loop());
  }

  update() {
    // Smooth interpolation for rotational tilt
    this.rotX += (this.targetRotX - this.rotX) * 0.05;
    this.rotY += (this.targetRotY - this.rotY) * 0.05;

    const spreadX = this.width * 0.95;
    const spreadY = this.height * 0.95;
    const spreadZ = 600;

    const speedMultiplier = this.prefersReducedMotion ? 0.2 : 1;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      p.x += p.vx * speedMultiplier;
      p.y += p.vy * speedMultiplier;
      p.z += p.vz * speedMultiplier;

      // Wrap around bounds in 3D
      if (p.x < -spreadX / 2) p.x = spreadX / 2;
      if (p.x > spreadX / 2) p.x = -spreadX / 2;
      if (p.y < -spreadY / 2) p.y = spreadY / 2;
      if (p.y > spreadY / 2) p.y = -spreadY / 2;
      if (p.z < -spreadZ / 2) p.z = spreadZ / 2;
      if (p.z > spreadZ / 2) p.z = -spreadZ / 2;
    }
  }

  render() {
    if (!this.ctx) return;

    this.ctx.save();
    this.ctx.scale(this.dpr, this.dpr);
    this.ctx.clearRect(0, 0, this.width, this.height);

    const cx = this.width / 2;
    const cy = this.height / 2;
    const time = performance.now() * 0.0015;

    const cosY = Math.cos(this.rotY);
    const sinY = Math.sin(this.rotY);
    const cosX = Math.cos(this.rotX);
    const sinX = Math.sin(this.rotX);

    // Project particles to 2D
    const projected = [];

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      // 3D rotation around Y and X
      const x1 = p.x * cosY + p.z * sinY;
      const z1 = -p.x * sinY + p.z * cosY;

      const y2 = p.y * cosX - z1 * sinX;
      const z2 = p.y * sinX + z1 * cosX;

      // Perspective projection
      const depth = this.fov + z2;
      if (depth <= 20) continue; // Behind camera

      const scale = this.fov / depth;
      const projX = cx + x1 * scale;
      const projY = cy + y2 * scale;
      const projRadius = Math.max(0.6, p.radius * scale);

      // Depth-based opacity fading
      const depthAlpha = Math.min(1, Math.max(0.12, (scale * 0.85)));
      const pulse = Math.sin(time + p.pulseOffset) * 0.15 + 0.85;
      const finalAlpha = Math.min(1, p.alpha * depthAlpha * pulse);

      projected.push({
        projX,
        projY,
        scale,
        projRadius,
        finalAlpha,
        color: p.color,
        z: z2
      });
    }

    // Sort by depth (painter's algorithm)
    projected.sort((a, b) => b.z - a.z);

    // Draw connecting filaments between close neighbor particles in 3D
    const maxFilamentDist = 110;
    this.ctx.lineWidth = 0.8;

    for (let i = 0; i < projected.length; i++) {
      const p1 = projected[i];

      for (let j = i + 1; j < projected.length; j++) {
        const p2 = projected[j];
        const dx = p1.projX - p2.projX;
        const dy = p1.projY - p2.projY;
        const dist = Math.hypot(dx, dy);

        if (dist < maxFilamentDist) {
          const filamentAlpha = (1 - dist / maxFilamentDist) * 0.18 * Math.min(p1.finalAlpha, p2.finalAlpha);
          this.ctx.strokeStyle = `rgba(140, 180, 255, ${filamentAlpha.toFixed(3)})`;
          this.ctx.beginPath();
          this.ctx.moveTo(p1.projX, p1.projY);
          this.ctx.lineTo(p2.projX, p2.projY);
          this.ctx.stroke();
        }
      }
    }

    // Draw glowing particles
    for (let i = 0; i < projected.length; i++) {
      const p = projected[i];

      // Particle outer glow
      const glow = this.ctx.createRadialGradient(
        p.projX, p.projY, 0,
        p.projX, p.projY, p.projRadius * 3.5
      );
      glow.addColorStop(0, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${(p.finalAlpha * 0.9).toFixed(3)})`);
      glow.addColorStop(0.5, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${(p.finalAlpha * 0.25).toFixed(3)})`);
      glow.addColorStop(1, `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0)`);

      this.ctx.fillStyle = glow;
      this.ctx.beginPath();
      this.ctx.arc(p.projX, p.projY, p.projRadius * 3.5, 0, Math.PI * 2);
      this.ctx.fill();

      // Sharp central particle core
      this.ctx.fillStyle = `rgba(255, 255, 255, ${(p.finalAlpha * 0.95).toFixed(3)})`;
      this.ctx.beginPath();
      this.ctx.arc(p.projX, p.projY, p.projRadius * 0.8, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }
}
