


/* ============================================================
   UI — hotbar, section panels, HUD, toasts, damage/flash.
   All DOM, all driven from data.js. Panels are real <section>
   elements so they are readable and linkable without the world.
   ============================================================ */

import { SECTIONS, PROFILE } from './data.js';
import { pixelCanvas } from './font.js';

/* ---------------- section panel content ---------------- */

function panelHTML(s) {
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  if (s.kind === 'hub') {
    return `
      <p class="kicker">WELCOME TO</p>
      <h1 class="title">${esc(PROFILE.name)}</h1>
      <p class="subtitle">${esc(PROFILE.role)}</p>
      <p class="body">${esc(PROFILE.tagline)}</p>
      <div class="links">
        ${PROFILE.links.map(l => `<a class="link" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer" data-net="${esc(l.label)}">
          <span class="dot" style="background:${l.color}"></span>${esc(l.label)}</a>`).join('')}
      </div>
      <p class="hint">Walk into a building or pick a slot in the hotbar.</p>`;
  }

  if (s.kind === 'text') {
    return `<p class="kicker">${esc(s.label)}</p>
      <h1 class="title">${esc(s.title)}</h1>
      <p class="subtitle">${esc(s.subtitle)}</p>
      ${s.items.map(t => `<p class="body">${esc(t)}</p>`).join('')}`;
  }

  if (s.kind === 'skills') {
    return `<p class="kicker">${esc(s.label)}</p>
      <h1 class="title">${esc(s.title)}</h1>
      <p class="subtitle">${esc(s.subtitle)}</p>
      <div class="skillgroups">
      ${s.groups.map(g => `
        <div class="skillgroup">
          <h3>${esc(g.name)}</h3>
          <div class="chips">${g.skills.map(k => `<span class="chip">${esc(k)}</span>`).join('')}</div>
        </div>`).join('')}
      </div>`;
  }

  if (s.kind === 'timeline') {
    return `<p class="kicker">${esc(s.label)}</p>
      <h1 class="title">${esc(s.title)}</h1>
      <p class="subtitle">${esc(s.subtitle)}</p>
      <ol class="timeline">
      ${s.items.map(i => `
        <li>
          <span class="when">${esc(i.when)}</span>
          <h3>${esc(i.what)}</h3>
          <span class="where">${esc(i.where)}</span>
          <p class="body">${esc(i.desc)}</p>
        </li>`).join('')}
      </ol>`;
  }

  if (s.kind === 'projects') {
    return `<p class="kicker">${esc(s.label)}</p>
      <h1 class="title">${esc(s.title)}</h1>
      <p class="subtitle">${esc(s.subtitle)}</p>
      <div class="cards">
      ${s.items.map((p, i) => `
        <a class="card" ${p.link ? `href="${esc(p.link)}" target="_blank" rel="noopener noreferrer"` : ''}>
          <span class="num">#${i + 1}</span>
          <h3>${esc(p.name)}</h3>
          <span class="tag">${esc(p.tag)}</span>
          <p class="body">${esc(p.desc)}</p>
        </a>`).join('')}
      </div>`;
  }

  if (s.kind === 'contact') {
    return `<p class="kicker">${esc(s.label)}</p>
      <h1 class="title">${esc(s.title)}</h1>
      <p class="subtitle">${esc(s.subtitle)}</p>
      <div class="contacts">
      ${s.items.map(c => `
        <a class="contact" href="${esc(c.url)}" target="_blank" rel="noopener noreferrer">
          <span class="clabel">${esc(c.label)}</span>
          <span class="cvalue">${esc(c.value)}</span>
          <span class="cnote">${esc(c.note)}</span>
        </a>`).join('')}
      </div>
      <div class="links">
        ${PROFILE.links.map(l => `<a class="link" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">
          <span class="dot" style="background:${l.color}"></span>${esc(l.label)}</a>`).join('')}
      </div>
      <p class="hint">${esc(s.note)}</p>`;
  }
  return '';
}

/* ---------------- the UI controller ---------------- */

export class UI {
  constructor(root) {
    this.root = root;
    this.active = null;
    this.selected = 0;
    this.onSelect = null;
    this.panels = new Map();
    this._build();
  }

  _build() {
    this.root.innerHTML = `
      <!-- crosshair -->
      <div class="crosshair" id="crosshair"><span></span><span></span></div>

      <!-- top-left name tag -->
      <div class="nametag">
        <div class="nt-name">${PROFILE.name}</div>
        <div class="nt-role">${PROFILE.role}</div>
      </div>

      <!-- top-right readouts -->
      <div class="stats">
        <div class="stat"><span class="slabel">TIME</span><span class="sval" id="clock">--:--</span></div>
        <div class="stat"><span class="slabel">POS</span><span class="sval" id="coords">0 0 0</span></div>
        <div class="stat"><span class="slabel">MODE</span><span class="sval" id="mode">SURVIVAL</span></div>
        <button class="stat btn" id="timeBtn" title="Cycle time of day">☀ TIME</button>
      </div>

      <!-- keybinds hint -->
      <div class="keyhint" id="keyhint">
        <b>WASD</b> move · <b>Space</b> jump · <b>Mouse</b> look · <b>Click</b> break ·
        <b>1-6</b> sections · <b>F</b> fly · <b>V</b> view · <b>Esc</b> release mouse
        <button class="dismiss" id="hintClose">×</button>
      </div>

      <!-- section panel -->
      <aside class="panel" id="panel" aria-hidden="true">
        <button class="panel-close" id="panelClose" aria-label="Close">×</button>
        <div class="panel-scroll" id="panelBody"></div>
        <div class="panel-foot"><span id="panelNav"></span></div>
      </aside>

      <!-- hotbar -->
      <nav class="hotbar" id="hotbar" aria-label="Sections"></nav>

      <!-- hotbar item name flash -->
      <div class="itemname" id="itemname"></div>

      <!-- toasts -->
      <div class="toasts" id="toasts"></div>

      <!-- water / damage overlays -->
      <div class="overlay water" id="waterOverlay"></div>
      <div class="overlay flash" id="flashOverlay"></div>

      <!-- block-break progress -->
      <div class="breakring" id="breakring"><div class="breakfill" id="breakfill"></div></div>
    `;

    /* hotbar slots */
    const bar = this.root.querySelector('#hotbar');
    this.slots = [];
    SECTIONS.forEach((s, i) => {
      const b = document.createElement('button');
      b.className = 'slot';
      b.dataset.id = s.id;
      b.style.setProperty('--accent', s.color);
      b.setAttribute('aria-label', s.label);
      b.innerHTML = `
        <span class="slot-key">${s.slot}</span>
        <span class="slot-icon" data-icon="${s.icon}"></span>
        <span class="slot-label">${s.label}</span>
        <span class="slot-sel"></span>`;
      b.addEventListener('click', e => { e.stopPropagation(); this.select(i, true); });
      bar.appendChild(b);
      this.slots.push(b);
    });

    /* panels (one per section, kept in the DOM) */
    for (const s of SECTIONS) {
      const d = document.createElement('section');
      d.className = 'panel-inner';
      d.id = 'panel-' + s.id;
      d.dataset.kind = s.kind;
      d.style.setProperty('--accent', s.color);
      d.innerHTML = panelHTML(s);
      this.root.querySelector('#panelBody').appendChild(d);
      this.panels.set(s.id, d);
    }

    this.el = {
      panel: this.root.querySelector('#panel'),
      panelBody: this.root.querySelector('#panelBody'),
      itemname: this.root.querySelector('#itemname'),
      toasts: this.root.querySelector('#toasts'),
      clock: this.root.querySelector('#clock'),
      coords: this.root.querySelector('#coords'),
      mode: this.root.querySelector('#mode'),
      water: this.root.querySelector('#waterOverlay'),
      flash: this.root.querySelector('#flashOverlay'),
      breakring: this.root.querySelector('#breakring'),
      breakfill: this.root.querySelector('#breakfill'),
      crosshair: this.root.querySelector('#crosshair'),
      keyhint: this.root.querySelector('#keyhint')
    };

    this.root.querySelector('#panelClose').addEventListener('click', () => this.close());
    this.root.querySelector('#hintClose').addEventListener('click', e => {
      e.stopPropagation(); this.el.keyhint.classList.add('gone');
    });
    this.root.querySelector('#timeBtn').addEventListener('click', e => {
      e.stopPropagation(); this.onTimeClick?.();
    });

    this.select(0, false);
  }

  select(i, announce) {
    this.selected = i;
    this.slots.forEach((b, j) => b.classList.toggle('on', j === i));
    const s = SECTIONS[i];
    if (announce) {
      this.flashItemName(s);
      this.onSelect?.(s);
    }
  }

  selectById(id) {
    const i = SECTIONS.findIndex(s => s.id === id);
    if (i >= 0) this.select(i, true);
  }

  open(s) {
    this.active = s;
    for (const [id, d] of this.panels) d.classList.toggle('on', id === s.id);
    this.el.panel.classList.add('open');
    this.el.panel.setAttribute('aria-hidden', 'false');
    const i = SECTIONS.findIndex(x => x.id === s.id);
    if (i >= 0) this.select(i, false);
    this.flashItemName(s);
  }

  close() {
    this.active = null;
    this.el.panel.classList.remove('open');
    this.el.panel.setAttribute('aria-hidden', 'true');
  }

  get isOpen() { return !!this.active; }

  flashItemName(s) {
    const el = this.el.itemname;
    el.textContent = s.label;
    el.style.color = s.color;
    el.classList.remove('show');
    void el.offsetWidth;
    el.classList.add('show');
  }

  toast(msg, color) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    if (color) t.style.borderColor = color;
    this.el.toasts.appendChild(t);
    requestAnimationFrame(() => t.classList.add('in'));
    setTimeout(() => {
      t.classList.remove('in');
      setTimeout(() => t.remove(), 400);
    }, 2600);
  }

  setClock(v) { this.el.clock.textContent = v; }
  setCoords(x, y, z) { this.el.coords.textContent = `${Math.floor(x)} ${Math.floor(y)} ${Math.floor(z)}`; }
  setMode(m) { this.el.mode.textContent = m; }

  setWater(on) { this.el.water.classList.toggle('on', on); }

  setCrosshair(mode) {
    this.el.crosshair.className = 'crosshair' + (mode ? ' ' + mode : '');
  }

  setBreak(p) {
    if (p <= 0) { this.el.breakring.classList.remove('on'); return; }
    this.el.breakring.classList.add('on');
    this.el.breakfill.style.width = Math.min(100, p * 100) + '%';
  }

  flash() {
    this.el.flash.classList.remove('go');
    void this.el.flash.offsetWidth;
    this.el.flash.classList.add('go');
  }
}
