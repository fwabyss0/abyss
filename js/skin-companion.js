/**
 * Interactive Walking Minecraft Skin Companion
 * Features autonomous wandering, click-to-walk, drag & drop, walking cycle bob,
 * direction flipping (scaleX), speech bubble dialogues, and jump physics.
 */

export class SkinCompanion {
  constructor(options = {}) {
    this.frontSrc = options.frontSrc || 'assets/skin-front.png';
    this.backSrc = options.backSrc || 'assets/skin-back.png';
    this.name = options.name || 'Abyss';

    this.x = Math.max(50, Math.min(window.innerWidth - 120, window.innerWidth * 0.15));
    this.floorY = window.innerHeight - 90; // Default floor line above HUD
    this.y = this.floorY;
    this.targetX = this.x;
    this.facing = 1; // 1 = right, -1 = left
    this.speed = 1.6; // Walking speed
    this.state = 'idle'; // 'idle', 'walking', 'jumping', 'dragging'
    this.stepCycle = 0;
    this.idleTimer = 0;
    this.nextIdleDuration = 120; // ~2 seconds

    this.quotes = [
      "Oink! Welcome to my realm!",
      "I'm Abyss — AI Student & Web Dev!",
      "Check out my projects in the Chest (4)!",
      "Press 1 to 9 to teleport anywhere!",
      "Press 'M' to mine ores with me!",
      "Level 21 Master Crafter!",
      "Click anywhere to guide me there!",
      "Crown on, let's build something!"
    ];
    this.currentQuoteIdx = 0;
    this.bubbleTimeout = null;

    this.isDragging = false;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;

    this.initDOM();
    this.initEvents();
    this.startLoop();
  }

  initDOM() {
    this.el = document.createElement('div');
    this.el.className = 'mc-walking-char';
    this.el.setAttribute('tabindex', '0');
    this.el.setAttribute('role', 'button');
    this.el.setAttribute('aria-label', `${this.name} Minecraft Skin Character. Click to jump or drag around.`);

    this.el.innerHTML = `
      <div class="mc-char-nameplate">
        <span class="char-crown">👑</span>
        <span class="char-name">${this.name}</span>
      </div>
      <div class="mc-char-bubble" aria-live="polite"></div>
      <div class="mc-char-body">
        <img class="mc-char-img" src="${this.frontSrc}" alt="${this.name} Skin" draggable="false" />
      </div>
      <div class="mc-char-shadow"></div>
    `;

    document.body.appendChild(this.el);
    this.bubbleEl = this.el.querySelector('.mc-char-bubble');
    this.imgEl = this.el.querySelector('.mc-char-img');
    this.bodyEl = this.el.querySelector('.mc-char-body');

    this.updatePosition();
  }

  initEvents() {
    // Click or tap to jump and speak
    this.el.addEventListener('click', (e) => {
      e.stopPropagation();
      this.jump();
      this.speak();
    });

    // Double-click or right-click to flip between front and back view
    this.el.addEventListener('dblclick', (e) => {
      e.stopPropagation();
      this.toggleSkinView();
    });

    this.el.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggleSkinView();
    });

    // Dragging physics (Mouse & Touch)
    const onStart = (clientX, clientY) => {
      this.isDragging = true;
      this.state = 'dragging';
      this.dragOffsetX = clientX - this.x;
      this.dragOffsetY = clientY - this.y;
      this.el.classList.add('is-dragging');
    };

    const onMove = (clientX, clientY) => {
      if (this.isDragging) {
        this.x = Math.max(10, Math.min(window.innerWidth - 70, clientX - this.dragOffsetX));
        this.y = Math.max(40, Math.min(window.innerHeight - 80, clientY - this.dragOffsetY));
        this.updatePosition();
      }
    };

    const onEnd = () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.el.classList.remove('is-dragging');
        this.state = 'idle';
      }
    };

    this.el.addEventListener('mousedown', (e) => {
      if (e.button !== 0) return;
      onStart(e.clientX, e.clientY);
    });

    this.el.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length === 1) {
        onStart(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('mousemove', (e) => {
      onMove(e.clientX, e.clientY);
    });

    window.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches && e.touches.length === 1) {
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('mouseup', onEnd);
    window.addEventListener('touchend', onEnd);

    // Click anywhere on terrain/page to walk there!
    window.addEventListener('click', (e) => {
      // Don't intercept clicks on buttons, hotbar, links, inputs, or modals
      if (e.target.closest('.mc-hotbar, .mc-btn, a, button, input, textarea, .mc-mining-modal, .mc-project-detail-overlay, .mc-walking-char')) {
        return;
      }
      this.walkTo(e.clientX - 25);
    });

    // Responsive window resize
    window.addEventListener('resize', () => {
      this.floorY = window.innerHeight - 90;
      if (!this.isDragging) {
        this.y = this.floorY;
      }
      this.x = Math.min(this.x, window.innerWidth - 80);
      this.updatePosition();
    });
  }

  toggleSkinView() {
    this.isBack = !this.isBack;
    this.imgEl.src = this.isBack ? this.backSrc : this.frontSrc;
    this.speak(this.isBack ? "Check out my Creeper back hoodie! 💥" : "Back to the front! 👑");
    this.jump();
  }

  onSectionEnter(sectionId) {
    const sectionQuotes = {
      hero: "Welcome to my spawn world! 🌲",
      about: "That's me! Crowned pig master! 👑",
      skills: "Level 30 Enchantment Library! ✨",
      projects: "Open the double chests! 💎",
      experience: "My career milestones & quest log! 📜",
      achievements: "Challenge Complete! 🏆",
      services: "Emerald trades open for business! 💰",
      contact: "Write me a message in the Quill! 🪶",
      outro: "Thanks for visiting my realm! 🌟"
    };

    if (sectionQuotes[sectionId]) {
      const target = window.innerWidth * (0.2 + Math.random() * 0.6);
      this.walkTo(target);
      setTimeout(() => {
        this.speak(sectionQuotes[sectionId]);
        this.jump();
      }, 400);
    }
  }

  walkTo(targetX) {
    this.targetX = Math.max(20, Math.min(window.innerWidth - 80, targetX));
    this.state = 'walking';
    this.facing = this.targetX > this.x ? 1 : -1;
  }

  jump() {
    if (this.state === 'jumping' || this.isDragging) return;
    this.state = 'jumping';
    this.bodyEl.classList.add('is-jumping');
    setTimeout(() => {
      this.bodyEl.classList.remove('is-jumping');
      this.state = 'idle';
    }, 420);
  }

  speak(text = null) {
    if (!this.bubbleEl) return;
    const msg = text || this.quotes[this.currentQuoteIdx % this.quotes.length];
    this.currentQuoteIdx++;

    this.bubbleEl.textContent = msg;
    this.bubbleEl.classList.add('is-visible');

    if (this.bubbleTimeout) clearTimeout(this.bubbleTimeout);
    this.bubbleTimeout = setTimeout(() => {
      this.bubbleEl.classList.remove('is-visible');
    }, 3200);
  }

  updatePosition() {
    this.el.style.transform = `translate3d(${this.x}px, ${this.y}px, 0)`;
    this.bodyEl.style.transform = `scaleX(${this.facing})`;
  }

  startLoop() {
    const loop = () => {
      this.tick();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  tick() {
    if (this.isDragging) return;

    // Gravity return to floor if dropped in air
    if (this.y < this.floorY) {
      this.y += Math.min(8, (this.floorY - this.y) * 0.15 + 1);
      if (this.y >= this.floorY) {
        this.y = this.floorY;
      }
      this.updatePosition();
    }

    if (this.state === 'walking') {
      const dist = this.targetX - this.x;
      if (Math.abs(dist) > this.speed) {
        this.facing = dist > 0 ? 1 : -1;
        this.x += this.facing * this.speed;

        // Walking cycle bob & leg stride
        this.stepCycle += 0.22;
        const bob = Math.sin(this.stepCycle) * 3;
        const tilt = Math.cos(this.stepCycle) * 4;
        this.imgEl.style.transform = `translateY(${Math.abs(bob)}px) rotate(${tilt}deg)`;
      } else {
        // Reached destination
        this.x = this.targetX;
        this.state = 'idle';
        this.imgEl.style.transform = 'none';
        this.idleTimer = 0;
        this.nextIdleDuration = 100 + Math.floor(Math.random() * 150);
      }
      this.updatePosition();
    } else if (this.state === 'idle') {
      this.idleTimer++;
      // Autonomous wander logic ("move it here and here")
      if (this.idleTimer >= this.nextIdleDuration) {
        this.idleTimer = 0;
        // Pick random spot between 8% and 88% of screen width
        const minX = window.innerWidth * 0.08;
        const maxX = window.innerWidth * 0.88;
        const randomTarget = minX + Math.random() * (maxX - minX);
        this.walkTo(randomTarget);
      }
    }
  }
}
