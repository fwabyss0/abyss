/**
 * ============================================================================
 * VENOM SYMBIOTE FLUID THEME ENGINE (BLACK VENOM & ANTI-VENOM)
 * Alish Shrestha (Abyss) — Portfolio
 * 
 * Features:
 * - Fluid simulation flowing from the top-right corner across the viewport.
 * - Black Venom: Viscous obsidian black symbiote fluid with organic tendrils,
 *   wavy perimeter, wet specular gloss, and metaball droplets when turning dark.
 * - White Venom (Anti-Venom): Stark porcelain-white fluid with organic tendrils,
 *   cast shadows, and pearlescent highlights when turning light.
 * - Seamless DOM theme transition synchronized at 100% full-screen coverage.
 * - Keyboard shortcuts (Ctrl+Shift+D or 'T'), localStorage persistence, and
 *   accessibility support (prefers-reduced-motion, aria-live status).
 * ============================================================================
 */

const THEME_STORAGE_KEY = 'abyss_theme_preference';
let activeTheme = 'light';
let isTransitioning = false;
let venomCanvas = null;
let venomCtx = null;

/**
 * Initialize theme engine: detect saved or system preference, bind buttons & keyboard
 */
export function initVenomTheme() {
  venomCanvas = document.getElementById('venom-transition-canvas');
  if (venomCanvas) {
    venomCtx = venomCanvas.getContext('2d', { alpha: true });
  }

  // Detect saved preference or system preference
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initialTheme = saved ? saved : (systemPrefersDark ? 'dark' : 'light');

  // Apply initial theme without animation
  applyThemeDOM(initialTheme);

  // Bind all theme toggle buttons across the page
  bindToggleButtons();

  // Keyboard shortcut: 'T' (when not inside an input/textarea) or 'Ctrl+Shift+D'
  window.addEventListener('keydown', (e) => {
    const isTyping = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
    if (!isTyping && (e.key === 't' || e.key === 'T')) {
      e.preventDefault();
      toggleThemeWithVenom();
    } else if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'd' || e.key === 'D')) {
      e.preventDefault();
      toggleThemeWithVenom();
    }
  });

  // Listen for system color scheme changes if user hasn't explicitly overridden
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      const userSaved = localStorage.getItem(THEME_STORAGE_KEY);
      if (!userSaved) {
        setTheme(e.matches ? 'dark' : 'light', true);
      }
    });
  }
}

/**
 * Bind click handlers to all theme switcher elements
 */
function bindToggleButtons() {
  const toggleButtons = document.querySelectorAll('.theme-toggle-btn, [data-action="toggle-theme"]');
  toggleButtons.forEach(btn => {
    btn.removeEventListener('click', handleToggleClick);
    btn.addEventListener('click', handleToggleClick);
  });
}

function handleToggleClick(e) {
  e.preventDefault();
  toggleThemeWithVenom(e.currentTarget);
}

/**
 * Toggle between light and dark theme with Venom fluid animation
 */
export function toggleThemeWithVenom(triggerEl = null) {
  const targetTheme = activeTheme === 'dark' ? 'light' : 'dark';
  setTheme(targetTheme, true, triggerEl);
}

/**
 * Set theme explicitly, with or without Venom transition
 */
export function setTheme(theme, animate = true, triggerEl = null) {
  if (theme === activeTheme && !isTransitioning) return;
  if (isTransitioning) return; // Prevent concurrent animations

  const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!animate || prefersReducedMotion || !venomCanvas || !venomCtx) {
    applyThemeDOM(theme);
    showThemeToast(theme);
    return;
  }

  runVenomTransition(theme, triggerEl);
}

export function getCurrentTheme() {
  return activeTheme;
}

/**
 * Apply theme classes, attributes, meta tags, and button states in DOM
 */
function applyThemeDOM(theme) {
  activeTheme = theme;
  document.documentElement.setAttribute('data-theme', theme);
  
  if (theme === 'dark') {
    document.documentElement.classList.add('dark-theme');
    document.body?.classList.add('dark-theme');
  } else {
    document.documentElement.classList.remove('dark-theme');
    document.body?.classList.remove('dark-theme');
  }

  // Update theme-color meta tag
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', theme === 'dark' ? '#0A0A0C' : '#EFEFEF');
  }

  // Persist preference
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (err) {
    // Ignore storage quota / incognito errors
  }

  // Update all toggle buttons on page
  updateToggleButtonsUI(theme);

  // Dispatch custom event for 3D canvas or other listeners
  window.dispatchEvent(new CustomEvent('abyss:themechange', { detail: { theme } }));
}

/**
 * Update UI for all toggle buttons across page
 */
function updateToggleButtonsUI(theme) {
  const toggleButtons = document.querySelectorAll('.theme-toggle-btn, [data-action="toggle-theme"]');
  const isDark = theme === 'dark';

  toggleButtons.forEach(btn => {
    btn.setAttribute('aria-label', isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme');
    btn.setAttribute('title', isDark ? 'Switch to Light Theme [T]' : 'Switch to Dark Theme [T]');
    btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');

    const iconWrap = btn.querySelector('.theme-icon-wrap');
    if (iconWrap) {
      iconWrap.innerHTML = isDark ? getSunIconSVG() : getMoonIconSVG();
    }

    const labelText = btn.querySelector('.theme-toggle-text');
    if (labelText) {
      labelText.textContent = isDark ? 'Light' : 'Dark';
    }
  });
}

function getMoonIconSVG() {
  return `<svg class="theme-icon moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>`;
}

function getSunIconSVG() {
  return `<svg class="theme-icon sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>`;
}

function showThemeToast(theme) {
  const toast = document.getElementById('toast-notice');
  if (!toast) return;
  const isDark = theme === 'dark';
  toast.innerHTML = isDark
    ? `<span>🌙 Dark Theme Activated [T]</span>`
    : `<span>☀️ Light Theme Restored [T]</span>`;
  toast.classList.add('visible');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(() => {
    toast.classList.remove('visible');
  }, 2400);
}

/**
 * ============================================================================
 * HIGH-PERFORMANCE VENOM SYMBIOTE CANVAS SIMULATION
 * ============================================================================
 */
function runVenomTransition(targetTheme, triggerEl) {
  isTransitioning = true;
  const isDarkTransition = targetTheme === 'dark';

  // Make canvas visible and resize
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = window.innerWidth;
  const height = window.innerHeight;

  venomCanvas.width = Math.floor(width * dpr);
  venomCanvas.height = Math.floor(height * dpr);
  venomCanvas.style.display = 'block';
  venomCanvas.style.opacity = '1';

  // Origin is always from the top-right corner
  let originX = width + 15;
  let originY = -15;

  if (triggerEl) {
    const rect = triggerEl.getBoundingClientRect();
    // Anchor slightly biased toward top-right
    originX = rect.left + rect.width / 2;
    originY = rect.top + rect.height / 2;
  }

  // Maximum diagonal distance from origin to farthest corner (bottom-left)
  const maxDist = Math.hypot(originX, height - originY) * 1.35;

  // Generate randomized symbiote tendrils
  const tendrilCount = 12;
  const tendrils = [];
  for (let i = 0; i < tendrilCount; i++) {
    // Distribute angles in the forward fan toward bottom-left:
    // pointing from top-right down-left: angles between 95 deg and 175 deg (in radians: ~1.65 to 3.05)
    const baseAngle = 1.65 + (i / (tendrilCount - 1)) * 1.4 + (Math.random() - 0.5) * 0.12;
    tendrils.push({
      angle: baseAngle,
      lengthMult: 1.15 + Math.random() * 0.45,
      width: 28 + Math.random() * 32,
      tipRadius: 10 + Math.random() * 12,
      wavyFreq: 2.5 + Math.random() * 3,
      wavyAmp: 30 + Math.random() * 35,
      phase: Math.random() * Math.PI * 2,
      branchAngle: (Math.random() > 0.5 ? 1 : -1) * (0.35 + Math.random() * 0.4),
      branchLen: 0.35 + Math.random() * 0.3,
      branchWidth: 10 + Math.random() * 10
    });
  }

  // Pre-generate floating symbiote droplets flying ahead
  const dropletCount = 28;
  const droplets = [];
  for (let i = 0; i < dropletCount; i++) {
    const angle = 1.6 + Math.random() * 1.5;
    const speedMult = 0.85 + Math.random() * 0.55;
    droplets.push({
      angle,
      distMult: speedMult,
      radius: 6 + Math.random() * 22,
      wobbleSpeed: 4 + Math.random() * 5,
      wobbleAmp: 15 + Math.random() * 20,
      phase: Math.random() * Math.PI * 2
    });
  }

  const duration = 2200; // ms (smooth, dramatic, cinematic fluid transition)
  const startTime = performance.now();
  let themeApplied = false;

  function frame(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1.0);

    // Easing curves
    // Expansion phase: 0 -> 0.65 of total duration
    const coverageProgress = Math.min(progress / 0.65, 1.0);
    // Dissolution / Reveal phase: 0.65 -> 1.0 of duration
    const fadeProgress = progress > 0.65 ? (progress - 0.65) / 0.35 : 0;

    // Radius swells aggressively to engulf the screen
    // Ease-in quintic / exponential for sudden predator surge
    const currentRadius = maxDist * Math.pow(coverageProgress, 1.35);

    // Theme swap at exact 65% when fluid completely engulfs the screen
    if (progress >= 0.65 && !themeApplied) {
      applyThemeDOM(targetTheme);
      themeApplied = true;
    }

    // Render symbiote fluid on canvas
    venomCtx.save();
    venomCtx.scale(dpr, dpr);
    venomCtx.clearRect(0, 0, width, height);

    // Fade opacity during dissolution phase
    if (fadeProgress > 0) {
      venomCtx.globalAlpha = Math.max(0, 1.0 - Math.pow(fadeProgress, 1.4));
    }

    renderVenomFluid({
      ctx: venomCtx,
      width,
      height,
      originX,
      originY,
      radius: currentRadius,
      progress,
      coverageProgress,
      fadeProgress,
      tendrils,
      droplets,
      isDark: isDarkTransition
    });

    venomCtx.restore();

    if (progress < 1.0) {
      requestAnimationFrame(frame);
    } else {
      // Completed
      venomCanvas.style.display = 'none';
      venomCtx.clearRect(0, 0, venomCanvas.width, venomCanvas.height);
      isTransitioning = false;
      showThemeToast(targetTheme);
    }
  }

  requestAnimationFrame(frame);
}

/**
 * Render single frame of organic venom fluid simulation
 */
function renderVenomFluid(params) {
  const {
    ctx,
    width,
    height,
    originX,
    originY,
    radius,
    progress,
    coverageProgress,
    tendrils,
    droplets,
    isDark
  } = params;

  // Primary colors
  // Black Venom: Obsidian deep black with slick cyan/violet wet highlights
  // White Venom: Stark alabaster white with deep drop shadow & pearlescent sheen
  const fluidColor = isDark ? '#070709' : '#FFFFFF';
  const rimHighlightColor = isDark
    ? 'rgba(56, 189, 248, 0.45)'
    : 'rgba(56, 189, 248, 0.35)';
  const specularColor = isDark
    ? 'rgba(255, 255, 255, 0.55)'
    : 'rgba(255, 255, 255, 0.9)';

  // Cast shadow underneath White Venom (Anti-Venom) so it looks 3D and tangible
  if (!isDark) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetX = -8;
    ctx.shadowOffsetY = 8;
  } else {
    // Ambient symbiote dark aura
    ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    ctx.shadowBlur = 30;
    ctx.shadowOffsetX = -4;
    ctx.shadowOffsetY = 4;
  }

  // 1. DRAW TENDRILS (Lashing tentacles extending out from fluid front)
  tendrils.forEach(t => {
    drawVenomTendril(ctx, originX, originY, radius, progress, t, fluidColor, isDark);
  });

  // 2. DRAW FREE METABALL DROPLETS SURGING AHEAD
  droplets.forEach(d => {
    drawVenomDroplet(ctx, originX, originY, radius, progress, d, fluidColor);
  });

  // Reset shadow for main fluid body
  ctx.shadowColor = 'transparent';

  // 3. DRAW MAIN VISCOUS FLUID BODY (Organic wave surging from top-right)
  ctx.beginPath();

  // Anchor to top-right corner and beyond screen edges
  ctx.moveTo(originX + 200, originY - 200);
  ctx.lineTo(originX + 200, originY + radius + 300);

  // Sample perimeter from theta = PI/2 (straight down) to theta = PI (straight left)
  const steps = 90;
  const startAngle = Math.PI * 0.48; // slightly past straight down
  const endAngle = Math.PI * 1.05;   // slightly past straight left
  const angleStep = (endAngle - startAngle) / steps;

  const perimeterPoints = [];

  for (let i = 0; i <= steps; i++) {
    const theta = startAngle + i * angleStep;

    // Harmonic noise modulation for gooey fluid wave
    const wave1 = Math.sin(theta * 5.0 + progress * 8.0) * 0.08;
    const wave2 = Math.cos(theta * 9.0 - progress * 11.0) * 0.04;
    const wave3 = Math.sin(theta * 16.0 + progress * 14.0) * 0.025;
    
    // Bulges where tendrils emerge
    let tendrilBulge = 0;
    tendrils.forEach(t => {
      const diff = Math.abs(theta - t.angle);
      if (diff < 0.22) {
        tendrilBulge += Math.exp(-Math.pow(diff / 0.09, 2)) * 0.22;
      }
    });

    const totalMod = 1.0 + wave1 + wave2 + wave3 + tendrilBulge;
    const r = radius * totalMod;

    const px = originX + r * Math.cos(theta);
    const py = originY + r * Math.sin(theta);

    perimeterPoints.push({ x: px, y: py, theta, r });
  }

  // Draw smooth curve through points
  for (let i = 0; i < perimeterPoints.length; i++) {
    const pt = perimeterPoints[i];
    if (i === 0) {
      ctx.lineTo(pt.x, pt.y);
    } else {
      const prev = perimeterPoints[i - 1];
      const midX = (prev.x + pt.x) / 2;
      const midY = (prev.y + pt.y) / 2;
      ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
    }
  }

  // Close back around top edge
  ctx.lineTo(originX - radius - 300, originY - 200);
  ctx.closePath();

  // Fill main fluid body
  ctx.fillStyle = fluidColor;
  ctx.fill();

  // 4. WET SPECULAR GLOSS & SHINY LIQUID RIM
  // Draw sleek glistening highlight along the perimeter
  if (coverageProgress < 0.95) {
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < perimeterPoints.length; i++) {
      const pt = perimeterPoints[i];
      if (i === 0) {
        ctx.moveTo(pt.x, pt.y);
      } else {
        const prev = perimeterPoints[i - 1];
        const midX = (prev.x + pt.x) / 2;
        const midY = (prev.y + pt.y) / 2;
        ctx.quadraticCurveTo(prev.x, prev.y, midX, midY);
      }
    }

    ctx.strokeStyle = rimHighlightColor;
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.shadowColor = rimHighlightColor;
    ctx.shadowBlur = 12;
    ctx.stroke();

    // Sharp white specular line
    ctx.strokeStyle = specularColor;
    ctx.lineWidth = 1.8;
    ctx.shadowBlur = 6;
    ctx.stroke();
    ctx.restore();
  }

  // 5. INTERNAL GLOSS REFLECTIONS (Slimy wet liquid gleams inside the mass)
  if (coverageProgress > 0.15 && coverageProgress < 0.85) {
    drawInternalGleams(ctx, originX, originY, radius, progress, isDark);
  }
}

/**
 * Draw a single dynamic symbiote tendril (tentacle) with undulating spine,
 * tapering thickness, and a teardrop bulb tip
 */
function drawVenomTendril(ctx, ox, oy, waveRadius, progress, t, color, isDark) {
  const currentWaveR = waveRadius;
  // Tendril reaches out well ahead of the main wave
  const reach = currentWaveR * t.lengthMult;
  if (reach < 30) return;

  const baseAngle = t.angle;
  // Undulate angle dynamically
  const waveAngle = baseAngle + Math.sin(progress * 10 + t.phase) * 0.05;

  // Base point on wave
  const bx = ox + currentWaveR * 0.85 * Math.cos(baseAngle);
  const by = oy + currentWaveR * 0.85 * Math.sin(baseAngle);

  // Tip point
  const tx = ox + reach * Math.cos(waveAngle);
  const ty = oy + reach * Math.sin(waveAngle);

  // Normal vector for serpentine bending
  const dx = tx - bx;
  const dy = ty - by;
  const dist = Math.hypot(dx, dy);
  if (dist < 10) return;

  const nx = -dy / dist;
  const ny = dx / dist;

  // Bezier control points with wavy displacement
  const cp1Dist = dist * 0.38;
  const cp2Dist = dist * 0.72;
  const lateral1 = Math.sin(progress * t.wavyFreq * 4 + t.phase) * t.wavyAmp;
  const lateral2 = -Math.cos(progress * t.wavyFreq * 5 + t.phase) * (t.wavyAmp * 0.8);

  const cp1x = bx + (dx / dist) * cp1Dist + nx * lateral1;
  const cp1y = by + (dy / dist) * cp1Dist + ny * lateral1;

  const cp2x = bx + (dx / dist) * cp2Dist + nx * lateral2;
  const cp2y = by + (dy / dist) * cp2Dist + ny * lateral2;

  // Draw tapered tendril ribbon
  const baseW = t.width;
  const tipW = t.tipRadius;

  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();

  // Left edge from base to tip
  ctx.moveTo(bx + nx * (baseW / 2), by + ny * (baseW / 2));
  ctx.bezierCurveTo(
    cp1x + nx * (baseW * 0.6), cp1y + ny * (baseW * 0.6),
    cp2x + nx * (tipW * 1.1), cp2y + ny * (tipW * 1.1),
    tx + nx * (tipW / 2), ty + ny * (tipW / 2)
  );

  // Bulbous rounded tip
  ctx.arc(tx, ty, tipW, Math.atan2(ny, nx), Math.atan2(-ny, -nx), false);

  // Right edge back to base
  ctx.bezierCurveTo(
    cp2x - nx * (tipW * 1.1), cp2y - ny * (tipW * 1.1),
    cp1x - nx * (baseW * 0.6), cp1y - ny * (baseW * 0.6),
    bx - nx * (baseW / 2), by - ny * (baseW / 2)
  );

  ctx.closePath();
  ctx.fill();

  // Glossy rim on tendril spine
  ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.45)' : 'rgba(56, 189, 248, 0.4)';
  ctx.lineWidth = Math.max(1, tipW * 0.35);
  ctx.beginPath();
  ctx.moveTo(bx, by);
  ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, tx, ty);
  ctx.stroke();

  // Branching hook tendril
  if (t.branchLen > 0 && dist > 100) {
    const brX = cp2x;
    const brY = cp2y;
    const brLen = dist * t.branchLen * 0.45;
    const brAngle = waveAngle + t.branchAngle;
    const brTipX = brX + brLen * Math.cos(brAngle);
    const brTipY = brY + brLen * Math.sin(brAngle);

    ctx.beginPath();
    ctx.moveTo(brX, brY);
    ctx.quadraticCurveTo(
      brX + brLen * 0.5 * Math.cos(brAngle + 0.3),
      brY + brLen * 0.5 * Math.sin(brAngle + 0.3),
      brTipX, brTipY
    );
    ctx.lineWidth = t.branchWidth;
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draw flying droplet / globule with stretching surface tension ligament
 */
function drawVenomDroplet(ctx, ox, oy, waveRadius, progress, d, color) {
  const currentR = waveRadius * (1.1 + d.distMult * 0.45);
  if (currentR < 40) return;

  const wobble = Math.sin(progress * d.wobbleSpeed * 6 + d.phase) * d.wobbleAmp;
  const angle = d.angle + (wobble / currentR);

  const x = ox + currentR * Math.cos(angle);
  const y = oy + currentR * Math.sin(angle);

  ctx.save();
  ctx.fillStyle = color;

  // Droplet bulb
  ctx.beginPath();
  ctx.arc(x, y, d.radius, 0, Math.PI * 2);
  ctx.fill();

  // Stretchy filament connecting droplet back towards wave center
  if (currentR - waveRadius < 180 && d.radius > 9) {
    const backX = ox + waveRadius * 0.98 * Math.cos(angle);
    const backY = oy + waveRadius * 0.98 * Math.sin(angle);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(backX, backY);
    ctx.lineWidth = Math.max(1, d.radius * 0.28);
    ctx.strokeStyle = color;
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draw internal organic specular gleams reflecting off wet symbiote skin
 */
function drawInternalGleams(ctx, ox, oy, radius, progress, isDark) {
  ctx.save();
  const gleamR = radius * 0.65;
  const gleamAngle = Math.PI * 0.75 + Math.sin(progress * 6) * 0.1;
  const gx = ox + gleamR * Math.cos(gleamAngle);
  const gy = oy + gleamR * Math.sin(gleamAngle);

  const gleamGrad = ctx.createRadialGradient(gx, gy, 10, gx, gy, radius * 0.4);
  if (isDark) {
    gleamGrad.addColorStop(0, 'rgba(56, 189, 248, 0.16)');
    gleamGrad.addColorStop(0.5, 'rgba(139, 92, 246, 0.08)');
    gleamGrad.addColorStop(1, 'transparent');
  } else {
    gleamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    gleamGrad.addColorStop(0.6, 'rgba(240, 244, 255, 0.15)');
    gleamGrad.addColorStop(1, 'transparent');
  }

  ctx.fillStyle = gleamGrad;
  ctx.beginPath();
  ctx.arc(gx, gy, radius * 0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

