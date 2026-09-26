/* ============================================================
   MAIN — boots the renderer, builds the world, wires input,
   drives the loop, and ties the world to the section UI.
   ============================================================ */

import * as THREE from 'three';
import { buildAtlas } from './textures.js';
import { VoxelWorld, B, AIR, WORLD_W, WORLD_D } from './world.js';
import { buildRooms, ROOM_LAYOUT } from './rooms.js';
import { Player } from './player.js';
import { Atmosphere } from './atmosphere.js';
import { Particles } from './particles.js';
import { UI } from './ui.js';
import { itemCanvas } from './icons.js';
import { SECTIONS } from './data.js';

const CX = () => Math.floor(WORLD_W * 16 / 2);   // world centre, derived from the grid
const CZ = () => Math.floor(WORLD_D * 16 / 2);

/* ---------------- renderer ---------------- */
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: false,          // we want hard pixel edges
  powerPreference: 'high-performance',
  stencil: false
});
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
// Exposure is a readability control, not a brightness control: it lifts
// the lit surfaces out of ACES' toe without touching the black void.
renderer.toneMappingExposure = 1.32;

const scene = new THREE.Scene();
// The void is near-black, not a sky. atmosphere.js owns the fog and
// keeps it dark and weak so the rooms float in genuinely empty space.
scene.background = new THREE.Color(0x05040a);
const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.1, 900);

/* ---------------- world ---------------- */
const atlas = buildAtlas();
const voxelMat = new THREE.MeshLambertMaterial({
  map: atlas.texture,
  vertexColors: true,
  transparent: true,
  alphaTest: 0.5
});

const world = new VoxelWorld();
world.generate();
const { triggers, rooms, hub, lights: lightAnchors } = buildRooms(world);

/* The solid pass is lit by the scene lights; the glow pass is unlit
   so emissive blocks read as light sources instead of dark stone
   that happens to have a bright texture. Both share the atlas. */
const glowMat = new THREE.MeshBasicMaterial({
  map: atlas.texture,
  vertexColors: true,
  transparent: true,
  alphaTest: 0.5
});
world.buildMeshes(atlas, voxelMat, glowMat);
scene.add(world.group);

// underwater tint
const waterMat = new THREE.MeshLambertMaterial({
  map: atlas.texture, vertexColors: true, transparent: true, opacity: 0.78
});

/* ---------------- global light floor ----------------
   These live in atmosphere.js, which owns the global lights and the
   fog and rewrites them every frame — main.js only adds the per-room
   lights on top. See that file for why the intensities are what they
   are under Three.js r180. */

/* ---------------- per-room lights ----------------
   rooms.js publishes anchors: `portal` (in the arch, throws the
   section colour onto the frame and the floor outside), `core` (over
   the middle, lights the interior and furnishings), `fill` (low, so
   nothing bottoms out) and one `bridge` light per connecting path. */
const SECTION_COLOR = new Map(SECTIONS.map(s => [s.id, s.accent]));
const roomLights = [];

for (const anchor of lightAnchors) {
  const color = SECTION_COLOR.get(anchor.room) ?? 0xa855f7;
  const light = new THREE.PointLight(color, anchor.intensity, anchor.distance, 2);
  light.position.set(anchor.pos.x, anchor.pos.y, anchor.pos.z);
  scene.add(light);
  roomLights.push({ light, base: anchor.intensity, phase: anchor.phase });
}

/* ---------------- floating room labels ----------------
   Each room gets a glowing billboard name so the layout is
   readable from the wide camera without opening the HUD. */
function labelSprite(text, color) {
  const pad = 34, fs = 78;
  const c = document.createElement('canvas');
  const g = c.getContext('2d');
  g.font = `700 ${fs}px ui-monospace, "Cascadia Mono", Consolas, monospace`;
  const w = Math.ceil(g.measureText(text).width) + pad * 2;
  c.width = w; c.height = fs + pad * 1.4;
  const g2 = c.getContext('2d');
  g2.font = `700 ${fs}px ui-monospace, "Cascadia Mono", Consolas, monospace`;
  g2.textAlign = 'center';
  g2.textBaseline = 'middle';
  g2.shadowColor = color;
  g2.shadowBlur = 26;
  g2.fillStyle = color;
  g2.fillText(text, w / 2, c.height / 2);
  g2.shadowBlur = 8;
  g2.fillText(text, w / 2, c.height / 2);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  const spr = new THREE.Sprite(new THREE.SpriteMaterial({
    map: tex, transparent: true, depthWrite: false, fog: false
  }));
  const scale = 0.055;
  spr.scale.set(c.width * scale, c.height * scale, 1);
  return spr;
}

const LABEL_COLOR = {
  home: '#d8b4fe', about: '#7dd3fc', skills: '#86efac',
  experience: '#fcd34d', projects: '#fb7185', contact: '#c4b5fd'
};
for (const r of rooms) {
  const spr = labelSprite(r.id.toUpperCase(), LABEL_COLOR[r.id] ?? '#d8b4fe');
  // float the label just above the room's ceiling ring
  spr.position.set(r.x + 0.5, r.y + r.h + 3.5, r.z + 0.5);
  scene.add(spr);
  r.label = spr;
}

/* ---------------- player, sky, particles ---------------- */
const player = new Player(world, camera);
const atmo = new Atmosphere(scene, renderer);
const particles = new Particles(scene);

// Spawn in the HOME hub, facing INTO the room.
//
// This used to be `yaw = 0` ("face -z, toward PROJECTS"). The hub's
// spawn sits just inside its own portal arch, and yaw 0 points the
// camera straight back out through that arch's 3-block doorway — so the
// player arrived staring into empty void and the room read as a black
// screen. Face the interior instead, with a slight downward tilt so the
// floor, the dais and the far wall are all in frame.
{
  player.spawn(hub.spawn.x, hub.spawn.y, hub.spawn.z);
  // rooms.js publishes spawn on the portal side, so facing the room
  // centre means facing the opposite way to the portal's own normal.
  const toCentre = hub.x + 0.5 - hub.spawn.x;
  const toCentreZ = hub.z + 0.5 - hub.spawn.z;
  player.yaw = Math.atan2(-toCentre, -toCentreZ);
  player.pitch = -0.12;
  player.flying = true;           // start airborne so the wide view reads
  player.vel.set(0, 0, 0);
}

/* ---------------- block selection ring ---------------- */
const selGeo = new THREE.BoxGeometry(1.002, 1.002, 1.002);
const selMat = new THREE.LineBasicMaterial({ color: 0x101018, transparent: true, opacity: 0.85 });
const selBox = new THREE.LineSegments(new THREE.EdgesGeometry(selGeo), selMat);
selBox.visible = false;
scene.add(selBox);

/* ---------------- UI ---------------- */
const ui = new UI(document.getElementById('ui'));
ui.onSelect = (s) => openSection(s);
ui.onTimeClick = () => {
  const stops = [0.30, 0.50, 0.74, 0.02];
  atmo.t = stops[(stops.indexOf(atmo.t) + 1) % stops.length];
  ui.toast('Time set to ' + atmo.clock());
};

// paint the hotbar item icons
for (const s of SECTIONS) {
  const el = ui.root.querySelector(`.slot[data-id="${s.id}"] .slot-icon`);
  if (!el) continue;
  const c = itemCanvas(s.icon, 3);
  c.style.width = c.width + 'px';
  c.style.height = c.height + 'px';
  el.appendChild(c);
}

/* ---------------- section open logic ---------------- */
const navIndex = new Map(SECTIONS.map((s, i) => [s.id, i]));

function openSection(s, viaWalk) {
  if (!s) return;
  ui.open(s);
  if (viaWalk) ui.toast('Entered ' + s.label, s.color);
}

function closePanel() {
  ui.close();
}

ui.el.panel.addEventListener('click', e => e.stopPropagation());

/* ---------------- keyboard ---------------- */
const MOVE_KEYS = new Set([
  'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space', 'ShiftLeft', 'ShiftRight',
  'ControlLeft', 'ControlRight', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
  'KeyR', 'KeyF', 'KeyQ', 'KeyE'
]);

addEventListener('keydown', e => {
  // number keys pick a hotbar slot
  if (e.code.startsWith('Digit')) {
    const n = parseInt(e.code.slice(5), 10);
    if (n >= 1 && n <= SECTIONS.length) {
      ui.select(n - 1, true);
      e.preventDefault();
      return;
    }
  }

  if (MOVE_KEYS.has(e.code)) {
    player.keys.add(e.code);
    e.preventDefault();
  }

  switch (e.code) {
    case 'KeyV':
      player.thirdPerson = !player.thirdPerson;
      ui.toast(player.thirdPerson ? 'Third person' : 'First person');
      break;
    case 'KeyF':
      player.flying = !player.flying;
      player.vel.y = 0;
      ui.setMode(player.flying ? 'CREATIVE' : 'SURVIVAL');
      ui.toast(player.flying ? 'Flight enabled' : 'Flight disabled');
      break;
    case 'Escape':
      if (ui.isOpen) closePanel();
      else if (pointerLocked) document.exitPointerLock();
      break;
    case 'KeyP':
      atmo.paused = !atmo.paused;
      ui.toast(atmo.paused ? 'Time paused' : 'Time running');
      break;
    case 'KeyM':
      ui.setMode(ui.el.mode.textContent === 'SURVIVAL' ? 'CREATIVE' : 'SURVIVAL');
      break;
  }
}, { passive: false });

addEventListener('keyup', e => player.keys.delete(e.code));
addEventListener('blur', () => player.keys.clear());

/* ---------------- pointer lock + look ---------------- */
let pointerLocked = false;
let dragging = false;

canvas.addEventListener('mousedown', e => {
  if (e.button === 0) {
    if (!pointerLocked && !ui.isOpen) { canvas.requestPointerLock?.(); return; }
    if (pointerLocked) startBreak();
  }
  if (e.button === 2) placeBlock();
});
addEventListener('mouseup', e => { if (e.button === 0) endBreak(); });
addEventListener('contextmenu', e => e.preventDefault());

canvas.addEventListener('click', e => {
  if (ui.isOpen) closePanel();
  else if (player.flying) placeBlock();
});

document.addEventListener('pointerlockchange', () => {
  pointerLocked = document.pointerLockElement === canvas;
  ui.setCrosshair(pointerLocked ? '' : 'unlocked');
  if (pointerLocked) ui.close();
});

document.addEventListener('mousemove', e => {
  if (pointerLocked) {
    player.look(e.movementX * 0.0024, e.movementY * 0.0024);
  } else if (dragging) {
    player.look(e.movementX * 0.0032, e.movementY * 0.0032);
  }
});

/* touch: drag to look, tap to select */
let touchLook = null;
canvas.addEventListener('touchstart', e => {
  if (e.touches.length === 1) {
    touchLook = { id: e.touches[0].identifier, x: e.touches[0].clientX, y: e.touches[0].clientY, moved: 0 };
  }
}, { passive: true });
canvas.addEventListener('touchmove', e => {
  if (!touchLook) return;
  for (const t of e.changedTouches) {
    if (t.identifier !== touchLook.id) continue;
    const dx = t.clientX - touchLook.x, dy = t.clientY - touchLook.y;
    touchLook.x = t.clientX; touchLook.y = t.clientY;
    touchLook.moved += Math.abs(dx) + Math.abs(dy);
    player.look(dx * 0.005, dy * 0.005);
  }
}, { passive: true });
canvas.addEventListener('touchend', e => {
  if (touchLook && touchLook.moved < 12) {
    const i = Math.floor(Math.random() * SECTIONS.length);
    ui.select(i, true);
  }
  touchLook = null;
}, { passive: true });

/* ---------------- block break / place ---------------- */
let breaking = null;       // {x,y,z,progress,total}
let breakProgress = 0;
let breakTarget = null;

const BLOCK_COLOR = {};
function blockRGB(id) {
  if (BLOCK_COLOR[id]) return BLOCK_COLOR[id];
  const map = {
    [B.GRASS]: [96, 158, 68], [B.DIRT]: [134, 96, 67], [B.STONE]: [128, 128, 132],
    [B.COBBLE]: [120, 120, 124], [B.SAND]: [222, 205, 155], [B.LOG]: [110, 82, 50],
    [B.LEAVES]: [58, 122, 44], [B.PLANK]: [176, 137, 88], [B.GLASS]: [200, 230, 240],
    [B.WATER]: [58, 118, 196], [B.SNOW]: [242, 246, 250], [B.GRAVEL]: [126, 122, 118],
    [B.GLOW]: [255, 226, 150], [B.WOOL]: [232, 232, 236], [B.OBSIDIAN]: [24, 20, 34],
    [B.DEEPSLATE]: [62, 62, 68], [B.AMETHYST]: [126, 84, 168], [B.COPPER]: [200, 118, 66],
    [B.LAPIS]: [42, 82, 168], [B.DIAMOND]: [88, 214, 216], [B.EMERALD]: [56, 178, 96],
    [B.BRICK]: [150, 84, 68]
  };
  return (BLOCK_COLOR[id] = map[id] || [180, 180, 180]);
}

/* protected blocks: the village shell stays intact so the world never
   gets destroyed by an accidental click */
const PROTECTED = new Set([B.OBSIDIAN, B.WOOL]);

function startBreak() {
  const hit = player.raycastVoxel(6);
  if (!hit) return;
  breakTarget = hit;
  breakProgress = 0;
  breaking = hit;
  particles.blockHit(hit.x, hit.y, hit.z, blockRGB(hit.block));
}

function endBreak() {
  if (breaking && breakProgress > 0.85) {
    const h = breaking;
    world.set(h.x, h.y, h.z, AIR);
    particles.blockBreak(h.x, h.y, h.z, blockRGB(h.block), 18);
  }
  breakProgress = 0;
  breakTarget = null;
  breaking = null;
  ui.setBreak(0);
}

function updateBreaking(dt) {
  const hit = player.raycastVoxel(6);
  if (!hit) { ui.setBreak(0); breakTarget = null; breaking = null; breakProgress = 0; return; }

  // show the selection box
  selBox.visible = true;
  selBox.position.set(hit.x + 0.5, hit.y + 0.5, hit.z + 0.5);

  if (!pointerLocked) { ui.setBreak(0); return; }

  const same = breaking && breaking.x === hit.x && breaking.y === hit.y && breaking.z === hit.z;
  if (!same) {
    // new target: require a fresh click unless the player holds the button
    if (breaking) {
      // held: decay instead of resetting hard
      breakProgress = Math.max(0, breakProgress - dt * 2.2);
    }
    breaking = null;
    if (breakProgress <= 0) { ui.setBreak(0); return; }
  }
  if (!breaking) { breaking = { ...hit, auto: true }; }

  const hardness = { [B.OBSIDIAN]: 6, [B.LEAVES]: 0.25, [B.GLASS]: 0.3, [B.WATER]: 0.4 }[hit.block] ?? 1;
  breakProgress += dt / (hardness * 0.42);
  ui.setBreak(breakProgress);
  if (Math.random() < dt * 14) particles.blockHit(hit.x, hit.y, hit.z, blockRGB(hit.block));
  if (breakProgress >= 1) {
    world.set(hit.x, hit.y, hit.z, AIR);
    particles.blockBreak(hit.x, hit.y, hit.z, blockRGB(hit.block), 18);
    breakProgress = 0;
    breaking = null;
    ui.setBreak(0);
  }
}

function placeBlock() {
  const hit = player.raycastVoxel(6);
  if (!hit) return;
  const nx = hit.x + hit.nx, ny = hit.y + hit.ny, nz = hit.z + hit.nz;
  if (world.get(nx, ny, nz) !== AIR) return;
  // don't place inside the player
  const px = player.pos.x, py = player.pos.y, pz = player.pos.z;
  if (nx + 1 > px - 0.31 && nx < px + 0.31 && nz + 1 > pz - 0.31 && nz < pz + 0.31 &&
      ny + 1 > py && ny < py + 1.8) return;
  // place the section's signature block as the "held item"
  const sec = SECTIONS[ui.selected];
  const id = {
    home: B.PLANK, about: B.AMETHYST, skills: B.COPPER,
    experience: B.LAPIS, projects: B.DIAMOND, contact: B.EMERALD
  }[sec.id] ?? B.COBBLE;
  world.set(nx, ny, nz, id);
  particles.placePuff(nx, ny, nz, blockRGB(id));
}

/* ---------------- section proximity ---------------- */
let lastTrigger = null;
let triggerCooldown = 0;

function checkTriggers(dt) {
  triggerCooldown -= dt;
  if (triggerCooldown > 0) return;
  for (const t of triggers) {
    const dx = player.pos.x - (t.x + 0.5);
    const dz = player.pos.z - (t.z + 0.5);
    const dy = Math.abs(player.pos.y - t.y);
    if (dx * dx + dz * dz < t.r * t.r && dy < 6) {
      if (lastTrigger !== t.id) {
        lastTrigger = t.id;
        triggerCooldown = 2.2;
        const sec = SECTIONS[navIndex.get(t.id)];
        if (sec) openSection(sec, true);
      }
      return;
    }
  }
  lastTrigger = null;
}

/* ---------------- resize ---------------- */
function resize() {
  const w = innerWidth, h = innerHeight;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.setSize(w, h);
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
}
addEventListener('resize', resize);
addEventListener('orientationchange', () => setTimeout(resize, 120));

/* ---------------- loop ---------------- */
const clock = new THREE.Clock();
let frames = 0, fpsAcc = 0, fps = 60;
let lastHud = 0;
let wasUnder = false;

function tick() {
  requestAnimationFrame(tick);
  const dt = Math.min(clock.getDelta(), 0.06);

  player.update(dt);
  world.flushDirty();

  // portals breathe: a slow sine on each light so the rooms feel alive
  // and never read as a static colour wash
  for (const p of roomLights)
    p.light.intensity = p.base * (0.86 + 0.14 * Math.sin(clock.elapsedTime * 1.3 + p.phase));

  const night = Math.max(0, 1 - Math.max(0, atmo.sunDirection(atmo.t).y) * 4.2);
  atmo.update(dt, player.pos);
  particles.ambient(dt, player.pos, night);
  particles.update(dt, world);

  updateBreaking(dt);
  checkTriggers(dt);

  // underwater feel
  ui.setWater(player.headInWater);
  if (player.headInWater && !wasUnder) particles.splash(player.pos.x, player.pos.y, player.pos.z, 10);
  wasUnder = player.headInWater;

  // HUD. Throttle on an accumulating timer: `dt` alone is ~0.016 at
  // 60fps, so a `dt > threshold` test effectively never fires and the
  // clock/coords freeze on their initial placeholder text.
  frames++; fpsAcc += dt;
  if (fpsAcc >= 0.5) { fps = frames / fpsAcc; frames = 0; fpsAcc = 0; }
  lastHud += dt;
  if (lastHud >= 0.12) {
    lastHud = 0;
    ui.setClock(atmo.clock());
    ui.setCoords(player.pos.x, player.pos.y, player.pos.z);
  }

  renderer.render(scene, camera);
}

/* start immediately: no loading screen */
ui.close();
ui.toast('Welcome — click to look around', '#f2c14e');
tick();

/* expose a tiny debug handle (harmless, useful) */
window.__world = { world, player, atmo, ui, renderer, scene, camera, particles, SECTIONS, rooms, triggers, hub, roomLights };
