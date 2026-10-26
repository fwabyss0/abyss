/**
 * Interactive ASCII Portrait Engine
 * Real-time brightness sampling, smooth transitions, pointer displacement, and touch/keyboard accessibility.
 * Exclusively uses browser HTML5 Canvas without external dependencies.
 */

export class AsciiPortrait {
  constructor(options = {}) {
    this.container = typeof options.container === 'string'
      ? document.querySelector(options.container)
      : options.container;

    if (!this.container) {
      console.warn('AsciiPortrait: container element not found.');
      return;
    }

    this.imageSrc = options.imageSrc || 'assets/alish-900.webp';
    this.fallbackSrc = options.fallbackSrc || 'assets/alish-cutout.png';
    this.altText = options.altText || 'Alish Shrestha (Abyss) — Interactive Portrait';

    // Character ramp ordered from low density to high density
    // Characters: space, ., :, -, =, +, *, %, #, @
    this.charRamp = [' ', '.', ':', '-', '=', '+', '*', '%', '#', '@'];
    
    // Core state
    this.progress = 0.0;
    this.targetProgress = 0.0;
    this.isHovered = false;
    this.isToggled = false;
    this.animating = false;
    this.rafId = null;
    
    // Pointer tracking
    this.pointerX = -9999;
    this.pointerY = -9999;
    this.targetPointerX = -9999;
    this.targetPointerY = -9999;
    this.pointerRadius = 110;
    
    // Offscreen data cache
    this.cachedGrid = null;
    this.gridCols = 0;
    this.gridRows = 0;
    this.cellWidth = 0;
    this.cellHeight = 0;
    this.fontSize = 9;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Reduced motion preference
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    this.init();
  }

  init() {
    this.setupDOM();
    this.setupEvents();
    this.loadImage();
  }

  setupDOM() {
    this.container.classList.add('ascii-portrait-wrap');
    this.container.setAttribute('tabindex', '0');
    this.container.setAttribute('role', 'button');
    this.container.setAttribute('aria-label', `${this.altText}. Tap or hover to view ASCII matrix effect.`);

    // Inner frame with glass styling
    this.frame = document.createElement('div');
    this.frame.className = 'ascii-frame';

    // Photographic image layer (crisp base)
    this.imgEl = document.createElement('img');
    this.imgEl.className = 'ascii-source-img';
    this.imgEl.alt = this.altText;
    this.imgEl.decoding = 'async';
    this.imgEl.loading = 'eager';

    // Interactive Canvas layer
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'ascii-canvas';
    this.canvas.setAttribute('aria-hidden', 'true');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: false });

    // HUD Badge for mode indicator
    this.hudBadge = document.createElement('div');
    this.hudBadge.className = 'ascii-hud-badge';
    this.hudBadge.innerHTML = `
      <span class="hud-dot" aria-hidden="true"></span>
      <span class="hud-label">ASCII · HOVER</span>
    `;

    // Assembly
    this.frame.appendChild(this.imgEl);
    this.frame.appendChild(this.canvas);
    this.frame.appendChild(this.hudBadge);
    this.container.innerHTML = '';
    this.container.appendChild(this.frame);
  }

  loadImage() {
    this.image = new Image();
    this.image.crossOrigin = 'anonymous';
    this.image.src = this.imageSrc;

    this.image.onload = () => {
      this.imgEl.src = this.image.src;
      this.handleResize();
    };

    this.image.onerror = () => {
      console.warn(`AsciiPortrait: Failed to load ${this.imageSrc}, trying fallback...`);
      if (this.image.src !== this.fallbackSrc) {
        this.image.src = this.fallbackSrc;
        this.imgEl.src = this.fallbackSrc;
      }
    };
  }

  setupEvents() {
    // Pointer Events
    this.container.addEventListener('pointerenter', (e) => {
      if (e.pointerType === 'mouse') {
        this.isHovered = true;
        this.targetProgress = 1.0;
        this.updatePointer(e);
        this.updateBadge(true);
        this.startLoop();
      }
    });

    this.container.addEventListener('pointermove', (e) => {
      if (e.pointerType === 'mouse') {
        this.updatePointer(e);
        if (!this.animating) {
          this.startLoop();
        }
      }
    });

    this.container.addEventListener('pointerleave', (e) => {
      if (e.pointerType === 'mouse') {
        this.isHovered = false;
        if (!this.isToggled) {
          this.targetProgress = 0.0;
          this.updateBadge(false);
        }
        this.targetPointerX = -9999;
        this.targetPointerY = -9999;
        this.startLoop();
      }
    });

    // Touch & Click / Tap Toggle
    this.container.addEventListener('click', (e) => {
      // Toggle state on click / tap
      this.isToggled = !this.isToggled;
      this.targetProgress = this.isToggled ? 1.0 : (this.isHovered ? 1.0 : 0.0);
      this.updatePointer(e);
      this.updateBadge(this.targetProgress > 0.5);
      this.startLoop();
    });

    // Keyboard support (Space / Enter to toggle)
    this.container.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.isToggled = !this.isToggled;
        this.targetProgress = this.isToggled ? 1.0 : 0.0;
        this.updateBadge(this.isToggled);
        this.startLoop();
      }
    });

    // Responsive Resize with debounce
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        this.dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.handleResize();
      }, 150);
    });

    // Watch reduced-motion changes
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (e) => {
      this.prefersReducedMotion = e.matches;
    });
  }

  updatePointer(e) {
    const rect = this.frame.getBoundingClientRect();
    this.targetPointerX = e.clientX - rect.left;
    this.targetPointerY = e.clientY - rect.top;
    if (this.pointerX === -9999) {
      this.pointerX = this.targetPointerX;
      this.pointerY = this.targetPointerY;
    }
  }

  updateBadge(isActive) {
    if (!this.hudBadge) return;
    const label = this.hudBadge.querySelector('.hud-label');
    if (isActive) {
      this.hudBadge.classList.add('is-active');
      if (label) label.textContent = 'ASCII · ACTIVE';
    } else {
      this.hudBadge.classList.remove('is-active');
      if (label) label.textContent = 'ASCII · HOVER';
    }
  }

  handleResize() {
    if (!this.image || !this.image.complete || this.image.naturalWidth === 0) return;

    const rect = this.frame.getBoundingClientRect();
    const width = Math.max(rect.width, 240);
    const height = Math.max(rect.height, 240);

    // Set canvas dimensions with DPR
    this.canvas.width = Math.round(width * this.dpr);
    this.canvas.height = Math.round(height * this.dpr);
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    // Dynamic font size based on screen size
    if (width < 340) {
      this.fontSize = 7;
    } else if (width < 450) {
      this.fontSize = 8.5;
    } else {
      this.fontSize = 9.5;
    }

    // Monospace cell aspect ratio
    this.cellHeight = this.fontSize;
    this.cellWidth = this.fontSize * 0.58;

    this.gridCols = Math.floor(width / this.cellWidth);
    this.gridRows = Math.floor(height / this.cellHeight);

    if (this.gridCols <= 0 || this.gridRows <= 0) return;

    // Pre-sample image to grid data cache
    this.sampleImageToGrid(width, height);
    
    // Render static frame
    this.renderFrame();
  }

  sampleImageToGrid(displayW, displayH) {
    const offscreen = document.createElement('canvas');
    offscreen.width = this.gridCols;
    offscreen.height = this.gridRows;
    const offCtx = offscreen.getContext('2d', { willReadFrequently: true });

    // Calculate aspect fill crop
    const imgAspect = this.image.naturalWidth / this.image.naturalHeight;
    const targetAspect = displayW / displayH;

    let sWidth = this.image.naturalWidth;
    let sHeight = this.image.naturalHeight;
    let sx = 0;
    let sy = 0;

    if (imgAspect > targetAspect) {
      // Source is wider than display: crop sides
      sWidth = this.image.naturalHeight * targetAspect;
      sx = (this.image.naturalWidth - sWidth) / 2;
    } else {
      // Source is taller than display: crop top/bottom
      sHeight = this.image.naturalWidth / targetAspect;
      sy = (this.image.naturalHeight - sHeight) / 2;
    }

    offCtx.drawImage(
      this.image,
      sx, sy, sWidth, sHeight,
      0, 0, this.gridCols, this.gridRows
    );

    const imgData = offCtx.getImageData(0, 0, this.gridCols, this.gridRows).data;
    const grid = new Array(this.gridCols * this.gridRows);
    const rampLen = this.charRamp.length;

    for (let r = 0; r < this.gridRows; r++) {
      for (let c = 0; c < this.gridCols; c++) {
        const i = (r * this.gridCols + c) * 4;
        const red = imgData[i];
        const green = imgData[i + 1];
        const blue = imgData[i + 2];
        const alpha = imgData[i + 3] / 255;

        // Perceptual luminance calculation (ITU-R BT.709)
        const rawLum = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
        const normLum = (rawLum / 255) * alpha;

        // Enhance facial contrast: power curve to deepen shadows and emphasize highlights
        const contrastLum = Math.pow(normLum, 1.25);
        const rampIndex = Math.min(rampLen - 1, Math.floor(contrastLum * rampLen));
        const char = this.charRamp[rampIndex];

        grid[r * this.gridCols + c] = {
          char,
          rampIndex,
          lum: normLum,
          contrastLum,
          red,
          green,
          blue,
          alpha
        };
      }
    }

    this.cachedGrid = grid;
  }

  startLoop() {
    if (!this.animating) {
      this.animating = true;
      this.loop();
    }
  }

  loop() {
    if (!this.animating) return;

    // Smoothly interpolate transition progress
    const ease = this.prefersReducedMotion ? 0.35 : 0.14;
    this.progress += (this.targetProgress - this.progress) * ease;

    // Smoothly interpolate pointer position
    if (this.targetPointerX !== -9999) {
      this.pointerX += (this.targetPointerX - this.pointerX) * 0.2;
      this.pointerY += (this.targetPointerY - this.pointerY) * 0.2;
    }

    this.renderFrame();

    // Check if transition has settled
    const diff = Math.abs(this.targetProgress - this.progress);
    if (diff < 0.002) {
      this.progress = this.targetProgress;
      this.renderFrame();

      // If idle and fully at rest, stop RAF to save CPU
      if (this.progress === 0.0 || (this.progress === 1.0 && Math.abs(this.pointerX - this.targetPointerX) < 0.5)) {
        this.animating = false;
        return;
      }
    }

    this.rafId = requestAnimationFrame(() => this.loop());
  }

  renderFrame() {
    if (!this.ctx || !this.cachedGrid) return;

    const width = this.canvas.width / this.dpr;
    const height = this.canvas.height / this.dpr;

    this.ctx.save();
    this.ctx.scale(this.dpr, this.dpr);

    // Clear canvas
    this.ctx.clearRect(0, 0, width, height);

    // If progress is 0, canvas is completely transparent, showing clean photo below
    if (this.progress <= 0.001) {
      this.imgEl.style.opacity = '1';
      this.ctx.restore();
      return;
    }

    // Photo fades out as ASCII layer fades in
    const photoOpacity = Math.max(0, 1 - (this.progress * 1.1));
    this.imgEl.style.opacity = photoOpacity.toFixed(3);

    // Frosted glass dark backdrop over photo
    this.ctx.fillStyle = `rgba(8, 8, 12, ${(this.progress * 0.94).toFixed(3)})`;
    this.ctx.fillRect(0, 0, width, height);

    // Font configuration
    this.ctx.font = `${this.fontSize}px 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace`;
    this.ctx.textBaseline = 'top';

    const pX = this.pointerX;
    const pY = this.pointerY;
    const rampLen = this.charRamp.length;

    // Draw brightness-mapped ASCII grid
    for (let r = 0; r < this.gridRows; r++) {
      const baseY = r * this.cellHeight;

      for (let c = 0; c < this.gridCols; c++) {
        const cell = this.cachedGrid[r * this.gridCols + c];
        if (!cell || cell.char === ' ' || cell.lum < 0.04) continue;

        const baseX = c * this.cellWidth;
        let drawX = baseX;
        let drawY = baseY;
        let charToDraw = cell.char;

        // Pointer-responsive distortion / displacement
        if (!this.prefersReducedMotion && pX !== -9999) {
          const dx = (baseX + this.cellWidth * 0.5) - pX;
          const dy = (baseY + this.cellHeight * 0.5) - pY;
          const dist = Math.hypot(dx, dy);

          if (dist < this.pointerRadius && dist > 0) {
            const factor = 1 - (dist / this.pointerRadius);
            const displacement = Math.sin(factor * Math.PI) * 4.8 * factor;
            drawX += (dx / dist) * displacement;
            drawY += (dy / dist) * displacement;

            // Character perturb near pointer center for interactive matrix sensation
            if (dist < 45 && cell.rampIndex > 1) {
              const shift = Math.floor(factor * 2.5);
              const shiftedIndex = Math.min(rampLen - 1, cell.rampIndex + shift);
              charToDraw = this.charRamp[shiftedIndex];
            }
          }
        }

        // Color grading: Luminescent cool white / silver with preserved tonal values
        // Brighter pixels render with higher opacity and crisp white highlights
        const alpha = Math.min(1, (cell.contrastLum * 0.88 + 0.12) * this.progress);
        const silverTone = Math.min(255, Math.round(185 + cell.contrastLum * 70));

        this.ctx.fillStyle = `rgba(${silverTone}, ${silverTone + 5}, ${silverTone + 15}, ${alpha.toFixed(3)})`;
        this.ctx.fillText(charToDraw, drawX, drawY);
      }
    }

    this.ctx.restore();
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}
