/**
 * MINECRAFT PORTFOLIO ORCHESTRATOR
 * Alish Shrestha (Abyss) — Interactive Portfolio
 * Single central configuration architecture connecting all 9 screens,
 * 45 SVG pixel icons, hotbar navigation, XP progression, F3 debug overlay,
 * mining minigame, written book, crafting table, villager trades, and sound FX.
 */

import { PORTFOLIO_CONFIG } from './config.js';
import { ICONS } from './icons.js';
import { AsciiPortrait } from './ascii-portrait.js';
import { Particles3D } from './particles-3d.js';
import { SkinCompanion } from './skin-companion.js';
const skinFrontUrl = 'assets/skin-front.png';
const skinBackUrl = 'assets/skin-back.png';
const minecraftLoaderUrl = 'assets/minecraft loader.mp4';

// --- State Variables ---
let currentScreenIndex = 0;
let currentBookPage = 0;
let currentRecipeIndex = 0;
let currentTradeIndex = 0;
let currentOreIndex = 0;
let oreCurrentHits = 0;
let isF3Visible = false;
let isMiningOpen = false;
let userXp = 0;
let visitedScreens = new Set();
let unlockedAdvancements = new Set();

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  initLoader();
  initProgression();
  initSoundFX();
  initParticles3D();
  initAsciiPortrait();
  renderHotbar();
  renderHUD();
  renderHero();
  renderWrittenBook();
  renderFocusAreas();
  renderSkills();
  renderProjects();
  initProjectModal();
  renderCraftingTable();
  renderAdvancements();
  renderVillagerTrades();
  initBookQuillContact();
  renderSocialLinks();
  initNavigation();
  initHotbarKeyboard();
  initF3Debug();
  initMiningMinigame();
  initScrollEffects();
  initFooterYear();
  initSkinCompanion();
  initSkinAvatarSwitcher();
}

function initSkinCompanion() {
  try {
    window.skinCompanion = new SkinCompanion({
      frontSrc: skinFrontUrl,
      backSrc: skinBackUrl,
      name: PORTFOLIO_CONFIG.player.alias || 'Abyss'
    });
  } catch (err) {
    console.warn('SkinCompanion failed:', err);
  }
}

function initSkinAvatarSwitcher() {
  const btnShowSkin = document.getElementById('btn-show-skin');
  const btnShowAscii = document.getElementById('btn-show-ascii');
  const skinContainer = document.getElementById('skin-model-container');
  const asciiContainer = document.getElementById('ascii-portrait-container');
  const btnFlipSkin = document.getElementById('btn-flip-skin');
  const skinImg = document.getElementById('profile-skin-img');

  let isBackView = false;

  if (skinImg) {
    skinImg.src = skinFrontUrl;
  }

  if (btnShowSkin && btnShowAscii && skinContainer && asciiContainer) {
    btnShowSkin.addEventListener('click', () => {
      btnShowSkin.classList.add('active');
      btnShowSkin.setAttribute('aria-selected', 'true');
      btnShowAscii.classList.remove('active');
      btnShowAscii.setAttribute('aria-selected', 'false');

      skinContainer.style.display = 'block';
      asciiContainer.style.display = 'none';
      playClickSound(600, 0.03);
    });

    btnShowAscii.addEventListener('click', () => {
      btnShowAscii.classList.add('active');
      btnShowAscii.setAttribute('aria-selected', 'true');
      btnShowSkin.classList.remove('active');
      btnShowSkin.setAttribute('aria-selected', 'false');

      skinContainer.style.display = 'none';
      asciiContainer.style.display = 'block';
      playClickSound(480, 0.03);
    });
  }

  if (btnFlipSkin && skinImg) {
    btnFlipSkin.addEventListener('click', () => {
      isBackView = !isBackView;
      skinImg.src = isBackView ? skinBackUrl : skinFrontUrl;
      btnFlipSkin.innerHTML = isBackView ? '<span>🔄 Front View</span>' : '<span>🔄 Back View</span>';
      playClickSound(700, 0.04);

      // Smooth flip micro-animation
      skinImg.style.transform = 'scale(0.92) rotateY(180deg)';
      setTimeout(() => {
        skinImg.style.transform = 'none';
      }, 160);
    });
  }
}

/**
 * --------------------------------------------------------------------------
 * 1. Progression & XP System (Stored locally if available)
 * --------------------------------------------------------------------------
 */
function initProgression() {
  try {
    const savedXp = localStorage.getItem('abyss_mc_xp');
    userXp = savedXp ? parseInt(savedXp, 10) : 120; // Starting baseline XP
    const savedVisited = localStorage.getItem('abyss_mc_visited');
    if (savedVisited) {
      visitedScreens = new Set(JSON.parse(savedVisited));
    }
  } catch (e) {
    userXp = 120;
  }
}

function saveProgression() {
  try {
    localStorage.setItem('abyss_mc_xp', String(userXp));
    localStorage.setItem('abyss_mc_visited', JSON.stringify([...visitedScreens]));
  } catch (e) {}
}

function addXp(amount, reason = '') {
  userXp += amount;
  saveProgression();
  updateHUDXp();
  playLevelUpSound();
  if (reason) {
    showToast(`+${amount} XP: ${reason}`);
  }
}

function getLevel() {
  return Math.floor(Math.sqrt(userXp / 20)) + 1;
}

function updateHUDXp() {
  const levelBadge = document.getElementById('hud-level-badge');
  const xpFill = document.getElementById('hud-xp-fill');
  const currentLvl = getLevel();

  if (levelBadge) levelBadge.textContent = `Lv. ${currentLvl}`;

  // Calculate percentage within current level
  const currentLevelBaseXp = Math.pow(currentLvl - 1, 2) * 20;
  const nextLevelXp = Math.pow(currentLvl, 2) * 20;
  const progressInLevel = Math.max(0, Math.min(1, (userXp - currentLevelBaseXp) / Math.max(1, (nextLevelXp - currentLevelBaseXp))));

  if (xpFill) {
    xpFill.style.width = `${(progressInLevel * 100).toFixed(1)}%`;
  }
}

/**
 * --------------------------------------------------------------------------
 * 2. Web Audio Procedural Sound Synthesizer (8-Bit Minecraft SFX)
 * --------------------------------------------------------------------------
 */
let audioCtx = null;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) audioCtx = new AudioContextClass();
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playClickSound(freq = 550, duration = 0.04) {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

function playMineHitSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {}
}

function playLevelUpSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.07);

      gain.gain.setValueAtTime(0.05, now + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.16);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.07);
      osc.stop(now + idx * 0.07 + 0.18);
    });
  } catch (e) {}
}

function initSoundFX() {
  document.addEventListener('click', (e) => {
    const clickable = e.target.closest('.mc-btn, .mc-hotbar-slot, .mc-inv-item, .mc-achievement, .mc-recipe-tab, .mc-trade-item-btn, .mc-book-nav-btn, .mc-btn-hud');
    if (clickable) playClickSound();
  });
}

/**
 * --------------------------------------------------------------------------
 * 3. 9-Slot Hotbar Navigation
 * --------------------------------------------------------------------------
 */
function renderHotbar() {
  const container = document.getElementById('nav-links');
  if (!container) return;

  container.innerHTML = PORTFOLIO_CONFIG.screens.map((s, idx) => `
    <li>
      <a href="#${s.id}" class="mc-hotbar-slot ${idx === 0 ? 'active' : ''}" data-slot="${s.slot}" data-screen-id="${s.id}" aria-label="Slot ${s.slot}: ${s.label}">
        <span class="slot-key">${s.slot}</span>
        <div class="slot-icon">${ICONS[s.hotbarIcon] || ''}</div>
        <span class="slot-label">${s.label}</span>
        <div class="mc-slot-tooltip" role="tooltip">${s.tooltip}</div>
      </a>
    </li>
  `).join('');
}

/**
 * --------------------------------------------------------------------------
 * 4. Persistent Player Game HUD
 * --------------------------------------------------------------------------
 */
function renderHUD() {
  const heartsContainer = document.getElementById('hud-hearts');
  const hungerContainer = document.getElementById('hud-hunger');

  if (heartsContainer) {
    heartsContainer.innerHTML = Array(PORTFOLIO_CONFIG.gameMechanics.heartsTotal)
      .fill(ICONS.heartFull)
      .join('');
  }

  if (hungerContainer) {
    hungerContainer.innerHTML = Array(PORTFOLIO_CONFIG.gameMechanics.hungerTotal)
      .fill(ICONS.drumstickFull)
      .join('');
  }

  updateHUDXp();
}

/**
 * --------------------------------------------------------------------------
 * 5. Screen 1: Hero / Spawn World
 * --------------------------------------------------------------------------
 */
function renderHero() {
  const heroLinks = document.getElementById('hero-social-links');
  if (!heroLinks) return;

  heroLinks.innerHTML = PORTFOLIO_CONFIG.socials.slice(0, 3).map(s => `
    <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="mc-hero-social-link" aria-label="${s.name}">
      <span>${ICONS[s.iconKey] || ''}</span>
      <span>${s.name}</span>
    </a>
  `).join('');
}

/**
 * --------------------------------------------------------------------------
 * 6. Screen 2: About / Written Book & Focus Areas
 * --------------------------------------------------------------------------
 */
function renderWrittenBook() {
  const pageBody = document.getElementById('book-page-body');
  const indicator = document.getElementById('book-page-indicator');
  const prevBtn = document.getElementById('book-prev-btn');
  const nextBtn = document.getElementById('book-next-btn');

  if (!pageBody || !indicator) return;

  const pages = PORTFOLIO_CONFIG.writtenBook.pages;
  const page = pages[currentBookPage] || pages[0];

  pageBody.innerHTML = `
    <h3 class="mc-book-chapter-title">${page.title}</h3>
    <p class="mc-book-paragraph">${page.content}</p>
  `;

  indicator.textContent = `Page ${currentBookPage + 1} of ${pages.length}`;
  if (prevBtn) prevBtn.disabled = currentBookPage === 0;
  if (nextBtn) nextBtn.disabled = currentBookPage === pages.length - 1;

  if (prevBtn && !prevBtn._listenerAttached) {
    prevBtn._listenerAttached = true;
    prevBtn.addEventListener('click', () => {
      if (currentBookPage > 0) {
        currentBookPage--;
        renderWrittenBook();
      }
    });
  }

  if (nextBtn && !nextBtn._listenerAttached) {
    nextBtn._listenerAttached = true;
    nextBtn.addEventListener('click', () => {
      if (currentBookPage < pages.length - 1) {
        currentBookPage++;
        renderWrittenBook();
      }
    });
  }
}

function renderFocusAreas() {
  const container = document.getElementById('focus-areas-list');
  if (!container) return;

  container.innerHTML = `
    <div class="mc-focus-list">
      ${PORTFOLIO_CONFIG.focusAreas.map(f => `
        <div class="mc-focus-entry">
          <span class="mc-focus-icon">${f.icon}</span>
          <div class="mc-focus-body">
            <h4 class="mc-focus-title">${f.title}</h4>
            <p class="mc-focus-desc">${f.description}</p>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * --------------------------------------------------------------------------
 * 7. Screen 3: Skills / Enchantment Table
 * --------------------------------------------------------------------------
 */
function renderSkills() {
  const container = document.getElementById('skills-grid');
  const filterNav = document.getElementById('skills-filter-nav');
  if (!container || !filterNav) return;

  const categories = PORTFOLIO_CONFIG.skillCategories;
  const totalCount = categories.reduce((sum, c) => sum + c.skills.length, 0);

  // Render Filter Buttons
  filterNav.innerHTML = `
    <button type="button" class="mc-btn mc-btn-enchant active" data-filter="all" role="tab" aria-selected="true">
      <span>All Enchantments</span>
      <span class="mc-enchant-count">${totalCount}</span>
    </button>
    ${categories.map(c => `
      <button type="button" class="mc-btn mc-btn-enchant" data-filter="${c.id}" role="tab" aria-selected="false">
        <span>${c.shortName}</span>
        <span class="mc-enchant-count">${c.skills.length}</span>
      </button>
    `).join('')}
  `;

  // Render Enchantment Cards
  container.innerHTML = categories.map((cat, idx) => `
    <article 
      class="mc-enchant-card reveal-on-scroll" 
      data-category="${cat.id}"
      data-index="${idx}"
      style="--cat-accent: ${cat.accent};"
    >
      <div class="mc-panel">
        <div class="mc-panel-header">
          <span class="mc-panel-title">Tome 0${idx + 1} — ${cat.shortName}</span>
          <span class="mc-panel-x">✨</span>
        </div>
        <div class="mc-panel-body" style="display: flex; flex-direction: column; height: 100%;">
          <div class="mc-enchant-card-header">
            <div class="mc-enchant-card-meta">
              <span class="mc-enchant-card-num">// 0${idx + 1}</span>
              <span class="mc-enchant-card-tag">${cat.tag}</span>
            </div>
            <h3 class="mc-enchant-card-title">${cat.name}</h3>
            <p class="mc-enchant-card-desc">${cat.description}</p>
          </div>

          <div class="mc-enchant-items" role="list">
            ${cat.skills.map(s => `
              <div class="mc-enchant-item" role="listitem" tabindex="0">
                <div class="mc-enchant-badge-icon" aria-hidden="true">${s.badge}</div>
                <div class="mc-enchant-info">
                  <span class="mc-enchant-name">${s.name}</span>
                  <span class="mc-enchant-highlight">${s.highlight}</span>
                </div>
                <span class="mc-enchant-level" title="${s.levelName}">Level ${s.level}</span>
                <div class="mc-tooltip" role="tooltip">${s.name} ${s.level} · ${s.levelName}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </article>
  `).join('');

  // Filters interaction
  filterNav.querySelectorAll('.mc-btn-enchant').forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      filterNav.querySelectorAll('.mc-btn-enchant').forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      container.querySelectorAll('.mc-enchant-card').forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.classList.remove('is-filtered-out');
          card.classList.add('is-filtered-in');
        } else {
          card.classList.add('is-filtered-out');
          card.classList.remove('is-filtered-in');
        }
      });
    });
  });
}

/**
 * --------------------------------------------------------------------------
 * 8. Screen 4: Projects / Double-Chest Inventory
 * --------------------------------------------------------------------------
 */
function renderProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  grid.innerHTML = PORTFOLIO_CONFIG.projects.map((p, idx) => `
    <article 
      class="mc-inv-item reveal-on-scroll" 
      data-project-id="${p.id}" 
      data-index="${idx}"
      style="--item-accent: ${p.accent};"
      tabindex="0"
      role="button"
      aria-label="Inspect ${p.title}"
    >
      <div class="mc-inv-item-header">
        <span class="mc-inv-item-icon" aria-hidden="true">${ICONS[p.iconKey] || ''}</span>
        <span class="mc-inv-item-rarity mc-rarity-${p.rarity}">${p.rarityLabel}</span>
      </div>

      <h3 class="mc-inv-item-title">${p.title}</h3>
      <p class="mc-inv-item-desc">${p.description}</p>

      <div class="mc-inv-item-stack" aria-label="Crafting components">
        ${p.stack.map(tech => `<span class="mc-tech-tag">${tech}</span>`).join('')}
      </div>

      <div class="mc-inv-item-links">
        ${p.liveUrl ? `
          <a href="${p.liveUrl}" target="_blank" rel="noopener noreferrer" class="mc-inv-link" onclick="event.stopPropagation();" aria-label="Visit live app for ${p.title}">
            <span>Launch</span>
            <span aria-hidden="true">↗</span>
          </a>
        ` : `
          <span class="mc-inv-badge" title="Operational internal tool">Internal Tool</span>
        `}

        ${p.githubUrl ? `
          <a href="${p.githubUrl}" target="_blank" rel="noopener noreferrer" class="mc-inv-link" onclick="event.stopPropagation();" aria-label="View source code on GitHub for ${p.title}">
            <span>Source</span>
            <span aria-hidden="true">⚙</span>
          </a>
        ` : ''}
      </div>
    </article>
  `).join('');
}

function initProjectModal() {
  const overlay = document.getElementById('project-detail-overlay');
  const panelTitle = document.getElementById('detail-panel-title');
  const panelBody = document.getElementById('detail-panel-body');
  const closeBtn = document.getElementById('detail-close-btn');
  const grid = document.getElementById('projects-grid');

  if (!overlay || !panelTitle || !panelBody || !grid) return;

  function openProject(projectId) {
    const project = PORTFOLIO_CONFIG.projects.find(p => p.id === projectId);
    if (!project) return;

    panelTitle.innerHTML = `<span style="margin-right: 0.5rem;">${ICONS[project.iconKey] || ''}</span> ${project.title}`;
    panelBody.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.75rem;">
          <span class="mc-inv-item-rarity mc-rarity-${project.rarity}">${project.rarityLabel} · ${project.year}</span>
          <span style="font-family: var(--font-pixel); font-size: 0.45rem; color: var(--mc-gold);">${project.tag}</span>
        </div>

        <p style="font-size: 0.95rem; color: var(--text-primary); line-height: 1.7;">
          ${project.description}
        </p>

        <div style="padding: 0.75rem; background: rgba(0,0,0,0.3); border-left: 3px solid ${project.accent}; font-style: italic; font-size: 0.85rem; color: var(--text-secondary);">
          "${project.lore}"
        </div>

        <div>
          <h4 style="font-family: var(--font-pixel); font-size: 0.5rem; color: var(--mc-diamond); margin-bottom: 0.6rem;">
            Crafting Materials (Tech Stack)
          </h4>
          <div style="display: flex; flex-wrap: wrap; gap: 0.4rem;">
            ${project.stack.map(tech => `<span class="mc-tech-tag" style="font-size: 0.45rem; padding: 0.3rem 0.6rem;">${tech}</span>`).join('')}
          </div>
        </div>

        <div style="display: flex; gap: 0.75rem; margin-top: 0.5rem; flex-wrap: wrap;">
          ${project.liveUrl ? `
            <a href="${project.liveUrl}" target="_blank" rel="noopener noreferrer" class="mc-btn mc-btn-emerald">
              <span>Launch Live Experience ↗</span>
            </a>
          ` : `
            <span class="mc-btn mc-btn-stone" style="opacity: 0.8; cursor: default;">
              <span>Operational Internal Tool</span>
            </span>
          `}

          ${project.githubUrl ? `
            <a href="${project.githubUrl}" target="_blank" rel="noopener noreferrer" class="mc-btn mc-btn-stone">
              <span>View Repository ⚙</span>
            </a>
          ` : ''}
        </div>
      </div>
    `;

    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    playLevelUpSound();
    triggerAdvancement('Taking Inventory', 'Examined crafted project specifications in chest vault');
  }

  function closeModal() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  grid.addEventListener('click', (e) => {
    const item = e.target.closest('.mc-inv-item');
    if (item && !e.target.closest('a')) {
      const pid = item.getAttribute('data-project-id');
      openProject(pid);
    }
  });

  grid.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const item = e.target.closest('.mc-inv-item');
      if (item && !e.target.closest('a')) {
        e.preventDefault();
        openProject(item.getAttribute('data-project-id'));
      }
    }
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeModal(); });
}

/**
 * --------------------------------------------------------------------------
 * 9. Screen 5: Experience / 3x3 Crafting Table
 * --------------------------------------------------------------------------
 */
function renderCraftingTable() {
  const tabsContainer = document.getElementById('recipe-tabs');
  const benchContainer = document.getElementById('crafting-bench-container');
  if (!tabsContainer || !benchContainer) return;

  const recipes = PORTFOLIO_CONFIG.craftingRecipes;

  // Render Tabs
  tabsContainer.innerHTML = recipes.map((r, idx) => `
    <button type="button" class="mc-recipe-tab ${idx === currentRecipeIndex ? 'active' : ''}" data-recipe-idx="${idx}">
      <span>Recipe ${idx + 1}: ${r.result.title}</span>
    </button>
  `).join('');

  tabsContainer.querySelectorAll('.mc-recipe-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      currentRecipeIndex = parseInt(btn.getAttribute('data-recipe-idx'), 10);
      renderCraftingTable();
    });
  });

  const activeRecipe = recipes[currentRecipeIndex] || recipes[0];

  // Render Active 3x3 Bench and Output Card
  benchContainer.innerHTML = `
    <!-- 3x3 Input Grid -->
    <div class="mc-crafting-grid-3x3" role="grid" aria-label="3 by 3 Crafting Inputs">
      ${activeRecipe.grid.map((slot, sIdx) => `
        <div class="mc-craft-slot" title="${slot.item}" role="gridcell" aria-label="Ingredient: ${slot.item}">
          <div style="width: 22px; height: 22px;">${ICONS[slot.iconKey] || ''}</div>
          <span class="slot-label-tiny">${slot.item}</span>
        </div>
      `).join('')}
    </div>

    <!-- Animated Crafting Arrow -->
    <div class="mc-craft-arrow" aria-hidden="true">&rarr;</div>

    <!-- Output Result Slot -->
    <div class="mc-craft-result-card">
      <div class="mc-craft-result-header">
        <div class="mc-craft-result-icon">
          ${ICONS[activeRecipe.result.iconKey] || ''}
        </div>
        <div>
          <h3 class="mc-craft-result-title">${activeRecipe.result.title}</h3>
          <div class="mc-craft-result-sub">${activeRecipe.result.subtitle}</div>
        </div>
      </div>
      <div style="font-family: var(--font-pixel); font-size: 0.4rem; color: var(--mc-gold); margin-bottom: 0.6rem;">
        📅 ${activeRecipe.result.period} · 📍 ${activeRecipe.result.location}
      </div>
      <p class="mc-craft-result-desc">${activeRecipe.result.description}</p>
    </div>
  `;
}

/**
 * --------------------------------------------------------------------------
 * 10. Screen 6: Achievements / Advancements Menu
 * --------------------------------------------------------------------------
 */
function renderAdvancements() {
  const grid = document.getElementById('achievements-grid');
  if (!grid) return;

  grid.innerHTML = PORTFOLIO_CONFIG.advancements.map((a, idx) => `
    <article class="mc-achievement reveal-on-scroll" data-index="${idx}">
      <div class="mc-achievement-icon" aria-hidden="true">
        <span>${ICONS[a.iconKey] || ''}</span>
      </div>
      <div class="mc-achievement-body">
        <div class="mc-achievement-cat">${a.category} · +${a.xpReward} XP</div>
        <h3 class="mc-achievement-title">${a.title}</h3>
        <p class="mc-achievement-desc">${a.desc}</p>
        <div class="mc-achievement-status mc-status-unlocked">
          <span>✓</span>
          <span>Unlocked</span>
        </div>
      </div>
    </article>
  `).join('');
}

/**
 * --------------------------------------------------------------------------
 * 11. Screen 7: Services / Villager Trading GUI
 * --------------------------------------------------------------------------
 */
function renderVillagerTrades() {
  const listContainer = document.getElementById('villager-trades-list');
  const workbenchContainer = document.getElementById('villager-trade-workbench');
  if (!listContainer || !workbenchContainer) return;

  const services = PORTFOLIO_CONFIG.services;

  // Render Trades List
  listContainer.innerHTML = services.map((s, idx) => `
    <button type="button" class="mc-trade-item-btn ${idx === currentTradeIndex ? 'active' : ''}" data-trade-idx="${idx}">
      <div>
        <div style="font-family: var(--font-pixel); font-size: 0.52rem; color: #ffffff; margin-bottom: 0.25rem;">
          ${s.title}
        </div>
        <div style="font-size: 0.78rem; color: var(--text-muted);">${s.villagerRole}</div>
      </div>
      <div class="mc-trade-cost-badge">
        <span>${ICONS.villagerEmerald}</span>
        <span>${s.costEmeralds} Emeralds</span>
      </div>
    </button>
  `).join('');

  listContainer.querySelectorAll('.mc-trade-item-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      currentTradeIndex = parseInt(btn.getAttribute('data-trade-idx'), 10);
      renderVillagerTrades();
    });
  });

  const activeTrade = services[currentTradeIndex] || services[0];

  // Render Exchange Workbench
  workbenchContainer.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.5rem;">
      <h3 style="font-family: var(--font-pixel); font-size: 0.58rem; color: var(--mc-gold);">
        Trade Exchange: ${activeTrade.title}
      </h3>
      <span style="font-size: 0.8rem; color: var(--mc-emerald);">Villager: ${activeTrade.villagerRole}</span>
    </div>

    <!-- Visual Exchange Slot Row -->
    <div class="mc-trade-exchange-row">
      <div class="mc-trade-slot-box">
        <div class="slot-icon-large">${ICONS.villagerEmerald}</div>
        <span class="slot-name">${activeTrade.costEmeralds} Emeralds</span>
      </div>

      <span style="font-family: var(--font-pixel); font-size: 0.7rem; color: var(--text-muted);">+</span>

      <div class="mc-trade-slot-box">
        <div class="slot-icon-large">${ICONS[activeTrade.costItemKey] || ''}</div>
        <span class="slot-name">${activeTrade.costItem}</span>
      </div>

      <div class="mc-craft-arrow" style="font-size: 1.6rem; color: var(--mc-emerald);">&rarr;</div>

      <div class="mc-trade-slot-box">
        <div class="slot-icon-large" style="border-color: var(--mc-emerald); box-shadow: 0 0 12px rgba(46, 204, 113, 0.4);">
          ${ICONS[activeTrade.offeringKey] || ''}
        </div>
        <span class="slot-name" style="color: var(--mc-emerald); font-weight: bold;">${activeTrade.offering}</span>
      </div>
    </div>

    <p style="font-size: 0.9rem; color: var(--text-primary); line-height: 1.65;">
      ${activeTrade.description}
    </p>

    <div>
      <h4 style="font-family: var(--font-pixel); font-size: 0.45rem; color: var(--mc-diamond); margin-bottom: 0.5rem;">
        Expected Deliverables
      </h4>
      <ul class="mc-trade-deliverables">
        ${activeTrade.deliverables.map(d => `<li>${d}</li>`).join('')}
      </ul>
    </div>

    <button type="button" class="mc-btn mc-btn-emerald" id="trade-inquire-action-btn" style="margin-top: 0.5rem;">
      <span>Confirm Trade Request &rarr; Book &amp; Quill</span>
    </button>
  `;

  const tradeActionBtn = document.getElementById('trade-inquire-action-btn');
  if (tradeActionBtn) {
    tradeActionBtn.addEventListener('click', () => {
      const contactSection = document.getElementById('contact');
      const messageField = document.getElementById('quill-message');
      if (messageField) {
        messageField.value = `Hello Abyss,\n\nI would like to trade for the "${activeTrade.title}" service (${activeTrade.offering}).\n\nProject Overview:\n`;
      }
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
        showToast('Trade loaded into Book & Quill!');
      }
    });
  }
}

/**
 * --------------------------------------------------------------------------
 * 12. Screen 8: Contact / Book & Quill Form
 * --------------------------------------------------------------------------
 */
function initBookQuillContact() {
  const form = document.getElementById('quill-contact-form');
  const copyBtn = document.getElementById('copy-email-btn');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('quill-sender-name')?.value.trim();
      const email = document.getElementById('quill-sender-email')?.value.trim();
      const message = document.getElementById('quill-message')?.value.trim();

      if (!name || !email || !message) {
        showToast('Please fill out all fields in the book!');
        return;
      }

      // Encode and launch default mailto
      const subject = encodeURIComponent(`Transmission from ${name} via Book & Quill`);
      const body = encodeURIComponent(`From: ${name} (${email})\n\n${message}`);
      window.location.href = `mailto:${PORTFOLIO_CONFIG.player.email}?subject=${subject}&body=${body}`;

      showToast('Opening mail client to transmit parchment...');
      triggerAdvancement('Free the End', 'Initiated direct communication transmission');
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(PORTFOLIO_CONFIG.player.email);
        showToast('✉ Copied email to clipboard!');
      } catch (err) {
        showToast('✉ Copied email to clipboard!');
      }
    });
  }
}

/**
 * --------------------------------------------------------------------------
 * 13. Social Links
 * --------------------------------------------------------------------------
 */
function renderSocialLinks() {
  const profileLinks = document.getElementById('profile-social-links');
  const contactLinks = document.getElementById('contact-social-links');
  const footerLinks = document.getElementById('footer-social-links');

  const pillHtml = PORTFOLIO_CONFIG.socials.map(s => `
    <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="mc-social-pill" aria-label="${s.name} (${s.handle})">
      <span>${ICONS[s.iconKey] || ''}</span>
      <span>${s.name}</span>
    </a>
  `).join('');

  if (profileLinks) profileLinks.innerHTML = pillHtml;
  if (contactLinks) contactLinks.innerHTML = pillHtml;
  if (footerLinks) footerLinks.innerHTML = pillHtml;
}

/**
 * --------------------------------------------------------------------------
 * 14. Hotbar Keyboard Navigation (1–9 Keys & Left/Right Arrows)
 * --------------------------------------------------------------------------
 */
function initHotbarKeyboard() {
  const slotMap = {
    '1': '#hero',
    '2': '#about',
    '3': '#skills',
    '4': '#projects',
    '5': '#experience',
    '6': '#achievements',
    '7': '#services',
    '8': '#contact',
    '9': '#outro'
  };

  window.addEventListener('keydown', (e) => {
    // Never intercept shortcuts while the user is typing in form elements
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
    if (document.getElementById('project-detail-overlay')?.classList.contains('is-open')) return;
    if (isMiningOpen) return;

    // Number keys 1 through 9
    if (slotMap[e.key]) {
      const targetSec = document.querySelector(slotMap[e.key]);
      if (targetSec) {
        e.preventDefault();
        playClickSound(750, 0.05);
        targetSec.scrollIntoView({ behavior: 'smooth' });
      }
    }

    // Left and Right arrow keys cycle through screens
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      cycleScreen(1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      cycleScreen(-1);
    }
  });

  // Cycle screens with boundary wrapping
  function cycleScreen(direction) {
    const screens = PORTFOLIO_CONFIG.screens;
    currentScreenIndex = (currentScreenIndex + direction + screens.length) % screens.length;
    const target = document.querySelector(`#${screens[currentScreenIndex].id}`);
    if (target) {
      playClickSound(680, 0.04);
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }
}

/**
 * --------------------------------------------------------------------------
 * 15. Navigation Sync & Screen Observer
 * --------------------------------------------------------------------------
 */
function initNavigation() {
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const navLinksContainer = document.getElementById('nav-links');
  const slots = document.querySelectorAll('.mc-hotbar-slot');
  const sections = document.querySelectorAll('section[id]');

  if (menuToggle && navLinksContainer) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!isExpanded));
      navLinksContainer.classList.toggle('nav-open', !isExpanded);
    });

    slots.forEach(slot => {
      slot.addEventListener('click', () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        navLinksContainer.classList.remove('nav-open');
      });
    });
  }

  // Active section indicator & XP reward for first-time screen exploration
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        slots.forEach(slot => {
          const href = slot.getAttribute('href');
          if (href === `#${id}`) {
            slot.classList.add('active');
          } else {
            slot.classList.remove('active');
          }
        });

        // Award XP for first discovery of each screen
        if (!visitedScreens.has(id)) {
          visitedScreens.add(id);
          saveProgression();
          addXp(PORTFOLIO_CONFIG.gameMechanics.baseScreenXp, `Discovered ${id.toUpperCase()}`);
        }

        // Companion reacts to current section
        if (window.skinCompanion && typeof window.skinCompanion.onSectionEnter === 'function') {
          window.skinCompanion.onSectionEnter(id);
        }
      }
    });
  }, {
    rootMargin: '-25% 0px -55% 0px',
    threshold: 0
  });

  sections.forEach(sec => sectionObserver.observe(sec));
}

/**
 * --------------------------------------------------------------------------
 * 16. F3 Debug Screen Overlay
 * --------------------------------------------------------------------------
 */
function initF3Debug() {
  const f3Overlay = document.getElementById('f3-debug-overlay');
  const leftCol = document.getElementById('f3-debug-left');
  const rightCol = document.getElementById('f3-debug-right');
  const f3ToggleBtn = document.getElementById('f3-toggle-btn');

  function toggleF3() {
    isF3Visible = !isF3Visible;
    if (f3Overlay) {
      f3Overlay.classList.toggle('is-visible', isF3Visible);
      f3Overlay.setAttribute('aria-hidden', String(!isF3Visible));
    }
    playClickSound(900, 0.04);
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'F3') {
      e.preventDefault();
      toggleF3();
    }
  });

  if (f3ToggleBtn) {
    f3ToggleBtn.addEventListener('click', toggleF3);
  }

  // Update F3 live stats
  setInterval(() => {
    if (!isF3Visible) return;
    const d = PORTFOLIO_CONFIG.debugConfig;
    const scrollPct = Math.round((window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight)) * 100);

    if (leftCol) {
      leftCol.innerHTML = `
        <span class="mc-debug-line">${d.engine} (${d.fpsTarget})</span>
        <span class="mc-debug-line">Viewport: ${window.innerWidth} x ${window.innerHeight} (DPR ${window.devicePixelRatio})</span>
        <span class="mc-debug-line">Player: ${PORTFOLIO_CONFIG.player.name} (${PORTFOLIO_CONFIG.player.alias})</span>
        <span class="mc-debug-line">Coords: ${PORTFOLIO_CONFIG.player.coordinates}</span>
        <span class="mc-debug-line">Biome: ${d.biome}</span>
        <span class="mc-debug-line">Difficulty: ${d.difficulty}</span>
        <span class="mc-debug-line">Scroll Progress: ${scrollPct}%</span>
      `;
    }

    if (rightCol) {
      rightCol.innerHTML = `
        <span class="mc-debug-line">Renderer: ${d.renderer}</span>
        <span class="mc-debug-line">Memory Allocation: 24.8MB / 64.0MB</span>
        <span class="mc-debug-line">Total Player XP: ${userXp} (Level ${getLevel()})</span>
        <span class="mc-debug-line">Discovered Screens: ${visitedScreens.size} / 9</span>
        <span class="mc-debug-line">Toggle Key: [F3] to close overlay</span>
      `;
    }
  }, 400);
}

/**
 * --------------------------------------------------------------------------
 * 17. Ore-Mining Minigame (Press 'M' or click HUD button)
 * --------------------------------------------------------------------------
 */
function initMiningMinigame() {
  const modal = document.getElementById('mining-modal');
  const toggleBtn = document.getElementById('mining-toggle-btn');
  const closeBtn = document.getElementById('mining-close-btn');
  const exitBtn = document.getElementById('mining-exit-btn');
  const switchBtn = document.getElementById('mining-switch-btn');
  const canvasArea = document.getElementById('mining-canvas-area');
  const oreGraphic = document.getElementById('mining-ore-graphic');
  const oreNameEl = document.getElementById('mining-ore-name');
  const progressBar = document.getElementById('mining-progress-bar');
  const statusText = document.getElementById('mining-status-text');

  const ores = PORTFOLIO_CONFIG.miningMinigame.ores;

  function openMining() {
    isMiningOpen = true;
    oreCurrentHits = 0;
    if (modal) modal.classList.add('is-open');
    updateOreDisplay();
    playClickSound(800, 0.05);
  }

  function closeMining() {
    isMiningOpen = false;
    if (modal) modal.classList.remove('is-open');
  }

  function updateOreDisplay() {
    const ore = ores[currentOreIndex];
    if (oreNameEl) oreNameEl.textContent = `${ore.name} (Requires ${ore.hitsRequired} strikes)`;
    if (oreGraphic) oreGraphic.innerHTML = ICONS[ore.iconKey] || '';
    if (progressBar) progressBar.style.width = `${(oreCurrentHits / ore.hitsRequired) * 100}%`;
    if (statusText) statusText.textContent = `Strikes: ${oreCurrentHits} / ${ore.hitsRequired}`;
  }

  function strikeOre() {
    const ore = ores[currentOreIndex];
    oreCurrentHits++;
    playMineHitSound();

    if (oreGraphic) {
      oreGraphic.classList.add('is-cracking');
      setTimeout(() => oreGraphic.classList.remove('is-cracking'), 80);
    }

    if (oreCurrentHits >= ore.hitsRequired) {
      // Ore broken!
      addXp(ore.xp);
      if (statusText) {
        statusText.innerHTML = `🎉 Broken! Dropped <strong>${ore.drop}</strong> (+${ore.xp} XP)`;
      }
      playLevelUpSound();
      triggerAdvancement('Master Crafter', `Mined ${ore.name} and collected raw resource`);
      oreCurrentHits = 0;
      setTimeout(() => {
        currentOreIndex = (currentOreIndex + 1) % ores.length;
        updateOreDisplay();
      }, 900);
    } else {
      updateOreDisplay();
    }
  }

  window.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;
    if (e.key === 'm' || e.key === 'M') {
      if (isMiningOpen) closeMining();
      else openMining();
    } else if (isMiningOpen && (e.key === ' ' || e.key === 'Enter')) {
      e.preventDefault();
      strikeOre();
    } else if (isMiningOpen && e.key === 'Escape') {
      closeMining();
    }
  });

  if (toggleBtn) toggleBtn.addEventListener('click', openMining);
  if (closeBtn) closeBtn.addEventListener('click', closeMining);
  if (exitBtn) exitBtn.addEventListener('click', closeMining);

  if (switchBtn) {
    switchBtn.addEventListener('click', () => {
      currentOreIndex = (currentOreIndex + 1) % ores.length;
      oreCurrentHits = 0;
      updateOreDisplay();
    });
  }

  if (canvasArea) {
    canvasArea.addEventListener('click', strikeOre);
  }
}

/**
 * --------------------------------------------------------------------------
 * 18. Advancement Toast Notifications
 * --------------------------------------------------------------------------
 */
function triggerAdvancement(title, desc) {
  if (unlockedAdvancements.has(title)) return;
  unlockedAdvancements.add(title);

  const toast = document.getElementById('advancement-toast');
  const icon = document.getElementById('adv-toast-icon');
  const descEl = document.getElementById('adv-toast-desc');

  if (!toast) return;

  if (icon) icon.innerHTML = ICONS.advancementTrophy;
  if (descEl) descEl.textContent = title;

  toast.classList.add('is-showing');
  playLevelUpSound();

  setTimeout(() => {
    toast.classList.remove('is-showing');
  }, 4500);
}

/**
 * General Toast Message
 */
function showToast(msg) {
  const toast = document.getElementById('clipboard-toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('toast-visible');
  setTimeout(() => {
    toast.classList.remove('toast-visible');
  }, 2800);
}

/**
 * --------------------------------------------------------------------------
 * 19. Utilities & Initializers
 * --------------------------------------------------------------------------
 */
function initParticles3D() {
  try {
    new Particles3D('particles-3d-canvas');
  } catch (err) {}
}

function initAsciiPortrait() {
  const container = document.getElementById('ascii-portrait-container');
  if (!container) return;

  new AsciiPortrait({
    container: container,
    imageSrc: PORTFOLIO_CONFIG.player.portraitImage,
    fallbackSrc: PORTFOLIO_CONFIG.player.portraitFallback,
    altText: `${PORTFOLIO_CONFIG.player.name} (${PORTFOLIO_CONFIG.player.alias}) — Interactive Portrait`
  });
}

function initScrollEffects() {
  const reveals = document.querySelectorAll('.reveal-on-scroll');
  if (!reveals.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    reveals.forEach(el => el.classList.add('revealed'));
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        obs.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px -40px 0px', threshold: 0.1 });

  reveals.forEach(el => observer.observe(el));

  const navWrap = document.getElementById('main-nav');
  if (navWrap) {
    const handleScroll = () => {
      navWrap.classList.toggle('nav-scrolled', window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }
}

function initFooterYear() {
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
}

function initLoader() {
  const loaderEl = document.getElementById('loader-screen');
  const videoEl = document.getElementById('loader-video');
  const progressBar = document.getElementById('loader-progress-bar');
  const progressWrap = document.getElementById('loader-progress-wrap');
  const statusEl = document.getElementById('loader-status-text');
  const percentEl = document.getElementById('loader-percent-text');
  const timerEl = document.getElementById('loader-timer');
  const skipBtn = document.getElementById('loader-skip-btn');

  if (!loaderEl) return;

  // Set video source from bundled URL if needed
  if (videoEl) {
    if (minecraftLoaderUrl && (!videoEl.currentSrc || videoEl.currentSrc === '')) {
      videoEl.src = minecraftLoaderUrl;
    }
    videoEl.muted = true;
    videoEl.playsInline = true;
    const playPromise = videoEl.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        const handleUserGesture = () => {
          videoEl.play().catch(() => {});
          window.removeEventListener('pointerdown', handleUserGesture);
          window.removeEventListener('keydown', handleUserGesture);
        };
        window.addEventListener('pointerdown', handleUserGesture, { once: true });
        window.addEventListener('keydown', handleUserGesture, { once: true });
      });
    }
  }

  const splashes = [
    "AI & Web Developer Edition!",
    "Also try Python & TensorFlow!",
    "Crafted with ⛏️ and care!",
    "Press 1 to 9 for Hotbar!",
    "Press M to mine ores!",
    "Press F3 for debug coordinates!",
    "100% Pure Vanilla Code!",
    "Building voxel dimensions!"
  ];
  const splashEl = document.getElementById('loader-splash-text');
  if (splashEl) {
    splashEl.textContent = splashes[Math.floor(Math.random() * splashes.length)];
  }

  let isDismissed = false;
  let rafId = null;

  // Play subtle sequential stone clicks matching letter slam drops
  const letters = document.querySelectorAll('.mc-mc-letter');
  letters.forEach((letter, idx) => {
    setTimeout(() => {
      if (!isDismissed) playClickSound(260 + idx * 35, 0.035);
    }, idx * 75);
  });

  const urlParams = new URLSearchParams(window.location.search);
  const isPreviewRequested = urlParams.has('preview') || urlParams.has('loader');

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches && !isPreviewRequested) {
    dismissLoader(true);
    return;
  }

  const stages = [
    { at: 0.0, status: 'Connecting to realm...', sub: 'Locating Abyss server...' },
    { at: 0.20, status: 'Loading chunks...', sub: 'Preparing pixel textures...' },
    { at: 0.45, status: 'Building terrain...', sub: 'Generating 9 interactive dimensions...' },
    { at: 0.72, status: 'Loading player data...', sub: 'Syncing inventory, recipes & trades...' },
    { at: 0.90, status: 'Spawning player...', sub: 'Finalizing environment...' },
    { at: 1.0, status: 'Ready!', sub: 'Welcome to the Realm!' }
  ];

  let isWindowLoaded = document.readyState === 'complete';
  if (!isWindowLoaded) {
    window.addEventListener('load', () => {
      isWindowLoaded = true;
    }, { once: true });
    // Safety fallback: Never keep the user waiting more than 3.5 seconds even if slow network resources delay window.load
    setTimeout(() => {
      isWindowLoaded = true;
    }, 3500);
  }

  const MIN_DURATION_MS = 2400; // Allows the character walk animation to loop smoothly
  const startTime = performance.now();
  let completedTime = null;

  function tick() {
    if (isDismissed) return;

    const now = performance.now();
    const elapsed = now - startTime;

    // Smooth organic progression curve synchronized with page readiness
    let naturalProgress = Math.min(1, elapsed / MIN_DURATION_MS);
    let progress = Math.min(naturalProgress, isWindowLoaded ? 1 : 0.88);

    if (naturalProgress >= 1 && isWindowLoaded) {
      progress = 1;
    }

    const pct = Math.round(progress * 100);

    if (progressBar) progressBar.style.width = `${pct}%`;
    if (progressWrap) progressWrap.setAttribute('aria-valuenow', pct);
    if (percentEl) percentEl.textContent = `${pct}%`;

    let currentStage = stages[0];
    for (const stage of stages) {
      if (progress >= stage.at) currentStage = stage;
    }

    if (statusEl) statusEl.textContent = currentStage.status;
    if (timerEl) timerEl.textContent = currentStage.sub;

    if (progress >= 1) {
      if (!completedTime) completedTime = now;
      // Brief pause at 100% for satisfying feedback before fade-out
      if (now - completedTime >= 220) {
        dismissLoader();
        return;
      }
    }

    rafId = requestAnimationFrame(tick);
  }

  function dismissLoader(immediate = false) {
    if (isDismissed) return;
    isDismissed = true;

    if (rafId) cancelAnimationFrame(rafId);
    document.body.classList.remove('is-loading');

    if (videoEl) {
      try {
        videoEl.pause();
      } catch (err) {
        // Ignored
      }
    }

    if (immediate) {
      loaderEl.style.display = 'none';
      return;
    }

    loaderEl.classList.add('loader-hidden');
    setTimeout(() => {
      loaderEl.style.display = 'none';
    }, 650);
  }

  if (skipBtn) {
    skipBtn.addEventListener('click', () => dismissLoader());
  }

  const handleKeydown = (e) => {
    if (e.key === 'Escape' && !isDismissed) {
      dismissLoader();
      window.removeEventListener('keydown', handleKeydown);
    }
  };
  window.addEventListener('keydown', handleKeydown);

  rafId = requestAnimationFrame(tick);
}
