/* ============================================================
   ATMOSPHERE — gradient sky dome, blocky drifting clouds,
   sun + moon, stars that fade in at night, and the day/night
   colour grading that ties the whole scene together.
   ============================================================ */

import * as THREE from 'three';

/* Key frames for the day cycle. t in [0,1), 0 = midnight.
   This world is a permanent night: the only light is what the
   portals and the player's torches throw, so the keys never
   reach a bright daytime. The range is small — a slow drift
   between deep violet night and a faint cold pre-dawn. */
const KEYS = [
  { t: 0.00, top: '#05040a', bot: '#0a0714', sun: '#2b1f4a', amb: 0.10, fog: '#07050f' },
  { t: 0.20, top: '#07050f', bot: '#0e0a1c', sun: '#3a2a5e', amb: 0.13, fog: '#0a0716' },
  { t: 0.26, top: '#0d0a1e', bot: '#1a1030', sun: '#5b3f8f', amb: 0.20, fog: '#120b26' },
  { t: 0.32, top: '#150f2c', bot: '#2a1a44', sun: '#8a5fd0', amb: 0.26, fog: '#1d1236' },
  { t: 0.50, top: '#1a1338', bot: '#33204f', sun: '#a97ce8', amb: 0.30, fog: '#241642' },
  { t: 0.68, top: '#150f2c', bot: '#2a1a44', sun: '#8a5fd0', amb: 0.26, fog: '#1d1236' },
  { t: 0.74, top: '#0d0a1e', bot: '#1a1030', sun: '#5b3f8f', amb: 0.20, fog: '#120b26' },
  { t: 0.80, top: '#07050f', bot: '#0e0a1c', sun: '#3a2a5e', amb: 0.13, fog: '#0a0716' },
  { t: 1.00, top: '#05040a', bot: '#0a0714', sun: '#2b1f4a', amb: 0.10, fog: '#07050f' }
];

const c1 = new THREE.Color(), c2 = new THREE.Color();

function lerpKeys(t) {
  let a = KEYS[0], b = KEYS[KEYS.length - 1];
  for (let i = 0; i < KEYS.length - 1; i++) {
    if (t >= KEYS[i].t && t <= KEYS[i + 1].t) { a = KEYS[i]; b = KEYS[i + 1]; break; }
  }
  const span = (b.t - a.t) || 1;
  const k = (t - a.t) / span;
  return {
    top: c1.set(a.top).lerp(c2.set(b.top), k).clone(),
    bot: c1.set(a.bot).lerp(c2.set(b.bot), k).clone(),
    sun: c1.set(a.sun).lerp(c2.set(b.sun), k).clone(),
    fog: c1.set(a.fog).lerp(c2.set(b.fog), k).clone(),
    amb: a.amb + (b.amb - a.amb) * k
  };
}

/* ---------------- sky dome ---------------- */
const SKY_VERT = `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p.xyww;   // force to the far plane
}`;

const SKY_FRAG = `
uniform vec3 topColor;
uniform vec3 botColor;
uniform vec3 sunDir;
uniform vec3 sunColor;
uniform float night;
uniform float uTimeFade;
varying vec3 vDir;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

void main() {
  vec3 d = normalize(vDir);
  float h = clamp(d.y * 0.5 + 0.5, 0.0, 1.0);
  // horizon band: quantised slightly for a blocky, poster feel
  float band = floor(h * 12.0) / 12.0;
  vec3 col = mix(botColor, topColor, smoothstep(0.42, 0.92, mix(h, band, 0.35)));

  // sun glow
  float sd = max(dot(d, normalize(sunDir)), 0.0);
  col += sunColor * pow(sd, 220.0) * 1.6;
  col += sunColor * pow(sd, 9.0) * 0.28;
  col += sunColor * pow(sd, 2.0) * 0.06;

  // stars only at night
  if (night > 0.01 && d.y > -0.05) {
    vec2 cell = floor(d.xz * 210.0 / max(0.25, d.y + 0.4));
    float s = hash(cell);
    if (s > 0.9915) {
      float tw = 0.6 + 0.4 * sin(s * 90.0 + uTimeFade);
      col += vec3(0.95, 0.97, 1.0) * night * tw * 1.4;
    }
  }
  gl_FragColor = vec4(col, 1.0);
}`;

export class Atmosphere {
  constructor(scene, renderer) {
    this.scene = scene;
    this.renderer = renderer;
    this.t = 0.46;             // start deep in the night
    this.dayLength = 600;      // seconds per full cycle
    this.paused = false;

    /* --- sky dome --- */
    this.skyUniforms = {
      topColor: { value: new THREE.Color('#1a1338') },
      botColor: { value: new THREE.Color('#33204f') },
      sunDir: { value: new THREE.Vector3(0, 1, 0) },
      sunColor: { value: new THREE.Color('#a97ce8') },
      night: { value: 0 },
      uTimeFade: { value: 0 }
    };
    const skyMat = new THREE.ShaderMaterial({
      uniforms: this.skyUniforms,
      vertexShader: SKY_VERT,
      fragmentShader: SKY_FRAG,
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: false
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 16), skyMat);
    this.sky.frustumCulled = false;
    this.sky.renderOrder = -1000;
    scene.add(this.sky);

    /* --- lights ---
       Three.js r180 removed `useLegacyLights`, so intensities are in
       physical units: point/spot lights deliver candela and fall off
       as intensity / d², and these global terms are deliberately
       small. The world is lit by the per-room PointLights in
       main.js; these three only set the floor so that nothing in
       shadow is pure black, and the overall direction. */
    this.sun = new THREE.DirectionalLight(0xffffff, 2.0);
    this.sun.castShadow = false;
    scene.add(this.sun);
    scene.add(this.sun.target);

    // violet from above, near-black from below: vertical faces get a
    // cool top-light, floors stay dark
    this.hemi = new THREE.HemisphereLight(0x8b6fd6, 0x0a0710, 0.95);
    scene.add(this.hemi);

    this.ambient = new THREE.AmbientLight(0x6b4fa8, 0.5);
    scene.add(this.ambient);

    /* --- sun & moon billboards --- */
    this.sunSprite = this._disc('#8a5fd0', 5.5);
    this.moonSprite = this._disc('#e8eef8', 4.4);
    scene.add(this.sunSprite, this.moonSprite);

    /* --- blocky clouds --- */
    this.clouds = this._buildClouds();
    scene.add(this.clouds);

    /* --- fog: the far rooms fade into the void ---
       Linear fog, not exponential: the rooms are 60-90 blocks apart,
       and an exponential curve greys out the gaps between them (which
       is exactly the "one huge structure" read we are avoiding).
       The far plane is pushed out so only the true horizon dims. */
    this.fog = new THREE.Fog(0x07050f, 150, 620);
    scene.fog = this.fog;

    this.state = lerpKeys(this.t);
  }

  _disc(hex, size) {
    // a chunky pixel-art sun: an 8x8 quad grid with rounded corners
    const g = new THREE.Group();
    const mat = new THREE.MeshBasicMaterial({ color: hex, transparent: true, fog: false, depthWrite: false, depthTest: false });
    const cells = [];
    for (let y = 0; y < 8; y++)
      for (let x = 0; x < 8; x++) {
        const dx = x - 3.5, dy = y - 3.5;
        const d = Math.hypot(dx, dy);
        if (d < 3.2) cells.push([x, y, d]);
      }
    const step = size / 8;
    const geos = [];
    for (const [x, y, d] of cells) {
      const pl = new THREE.PlaneGeometry(step, step);
      pl.translate((x - 3.5) * step, (y - 3.5) * step, 0);
      geos.push(pl);
    }
    const merged = mergeGeos(geos);
    const mesh = new THREE.Mesh(merged, mat);
    mesh.renderOrder = -900;
    g.add(mesh);
    g.userData.mat = mat;
    return g;
  }

  _buildClouds() {
    const group = new THREE.Group();
    group.name = 'clouds';
    const rnd = mulberry(9001);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x2a1a44, transparent: true, opacity: 0.55, fog: false, depthWrite: false
    });
    this.cloudMat = mat;
    this.cloudGroups = [];
    // sparse, dark, high: barely-there silhouettes against the void
    for (let i = 0; i < 12; i++) {
      const cg = new THREE.Group();
      const blocks = 3 + ((rnd() * 4) | 0);
      for (let b = 0; b < blocks; b++) {
        const w = 7 + ((rnd() * 14) | 0);
        const d = 6 + ((rnd() * 10) | 0);
        const h = 2 + ((rnd() * 2) | 0);
        const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        m.position.set((rnd() - 0.5) * 16, (rnd() - 0.5) * 1.4, (rnd() - 0.5) * 14);
        cg.add(m);
      }
      cg.position.set((rnd() - 0.5) * 320, 76 + rnd() * 26, (rnd() - 0.5) * 320);
      group.add(cg);
      this.cloudGroups.push({ g: cg, sp: 0.4 + rnd() * 0.5 });
    }
    return group;
  }

  /** Sun direction for a given time. */
  sunDirection(t) {
    const ang = (t - 0.25) * Math.PI * 2;   // t=0.25 -> sunrise at +x
    return new THREE.Vector3(Math.cos(ang) * 0.35, Math.sin(ang), Math.cos(ang) * 0.9).normalize();
  }

  update(dt, cameraPos) {
    if (!this.paused) this.t = (this.t + dt / this.dayLength) % 1;
    const t = this.t;
    const s = lerpKeys(t);
    this.state = s;

    const dir = this.sunDirection(t);
    const night = Math.max(0, 1 - Math.max(0, dir.y) * 4.2);

    // sky
    this.skyUniforms.topColor.value.copy(s.top);
    this.skyUniforms.botColor.value.copy(s.bot);
    this.skyUniforms.sunColor.value.copy(s.sun);
    this.skyUniforms.night.value = night;
    this.skyUniforms.sunDir.value.copy(dir);
    this.skyUniforms.uTimeFade.value += dt * 2.2;

    // Fog + the global light floor. There is no real sun in this
    // world: the directional light is a dim violet moon fill, and the
    // per-room PointLights (main.js) do the actual lighting work.
    // The cycle only *modulates* these — at its darkest the world
    // still has to stay readable, so the floor is never allowed to
    // fall to zero. See the constructor for the units.
    this.fog.color.copy(s.fog);
    this.sun.color.copy(s.sun);
    this.sun.intensity = 0.16 + Math.max(0, dir.y) * 0.34;
    this.hemi.intensity = 0.62 + s.amb * 0.75;
    this.hemi.color.copy(s.top).lerp(new THREE.Color(0x8a6fd0), 0.4);
    this.ambient.intensity = 0.34 + s.amb * 0.42;

    // keep the sky and shadow frustum centred on the player
    if (cameraPos) {
      this.sky.position.copy(cameraPos);
      this.sun.position.copy(cameraPos).addScaledVector(dir, 110);
      this.sun.target.position.copy(cameraPos);
      this.sun.target.updateMatrixWorld();

      // sun/moon sprites ride along, far away
      this.sunSprite.position.copy(cameraPos).addScaledVector(dir, 300);
      this.sunSprite.lookAt(cameraPos);
      this.moonSprite.position.copy(cameraPos).addScaledVector(dir, -300);
      this.moonSprite.lookAt(cameraPos);
      this.sunSprite.userData.mat.opacity = Math.max(0, dir.y * 1.5 + 0.10) * 0.5;
      this.moonSprite.userData.mat.opacity = Math.max(0, -dir.y * 3) * 0.8;
      this.moonSprite.userData.mat.color.set(night > 0.4 ? '#e8eef8' : '#8f97ad');

      // clouds drift and follow the camera horizontally so they never run out
      for (const c of this.cloudGroups) {
        c.g.position.x += c.sp * dt;
        if (c.g.position.x > 160) c.g.position.x = -160;
        c.g.position.z = cameraPos.z + (c.g.userData.zOff ??= c.g.position.z - cameraPos.z);
      }
      this.clouds.position.set(0, 0, 0);
      this.cloudMat.color.copy(s.bot).lerp(new THREE.Color(0x2a1a44), 0.5);
      this.cloudMat.opacity = 0.5;
    }

    return s;
  }

  /** "06:24" style clock from the cycle time. */
  clock() {
    const total = this.t * 24;
    const h = Math.floor(total);
    const m = Math.floor((total - h) * 60);
    return String(h).padStart(2, '0') + ':' + String(m).padStart(2, '0');
  }

  isNight() { return this.sunDirection(this.t).y < -0.02; }
}

/* helpers */
function mulberry(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/** Minimal geometry merge for non-indexed box planes. */
function mergeGeos(geos) {
  let total = 0;
  const nonIdx = geos.map(g => g.index ? g.toNonIndexed() : g);
  for (const g of nonIdx) total += g.attributes.position.count;
  const pos = new Float32Array(total * 3);
  const uv = new Float32Array(total * 2);
  const nor = new Float32Array(total * 3);
  let o = 0;
  for (const g of nonIdx) {
    pos.set(g.attributes.position.array, o * 3);
    nor.set(g.attributes.normal.array, o * 3);
    if (g.attributes.uv) uv.set(g.attributes.uv.array, o * 2);
    o += g.attributes.position.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  out.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  return out;
}
