/* ============================================================
   PARTICLES — one InstancedMesh pool drives every effect:
   block-break debris, ambient motes, night fireflies, and
   water splashes. Cheap, GPU-instanced, no per-frame allocation.
   ============================================================ */

import * as THREE from 'three';

const MAX = 900;

export class Particles {
  constructor(scene) {
    this.count = MAX;
    this.pos = new Float32Array(MAX * 3);
    this.vel = new Float32Array(MAX * 3);
    this.life = new Float32Array(MAX);
    this.maxLife = new Float32Array(MAX);
    this.size = new Float32Array(MAX);
    this.spin = new Float32Array(MAX);
    this.grav = new Float32Array(MAX);
    this.base = new Float32Array(MAX * 3);
    this.head = 0;
    this.active = 0;

    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshLambertMaterial({ vertexColors: false, transparent: true, opacity: 0.95 });
    this.mesh = new THREE.InstancedMesh(geo, mat, MAX);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.mesh.frustumCulled = false;
    this.mesh.castShadow = false;
    this.mesh.count = MAX;
    const colors = new Float32Array(MAX * 3);
    this.colors = colors;
    this.mesh.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);
    this.mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
    scene.add(this.mesh);

    this._m = new THREE.Matrix4();
    this._q = new THREE.Quaternion();
    this._e = new THREE.Euler();
    this._v = new THREE.Vector3();
    this._s = new THREE.Vector3();
    this._hidden = new THREE.Matrix4().makeScale(0, 0, 0);
  }

  _spawn(x, y, z, vx, vy, vz, r, g, b, size, life, grav = 1) {
    const i = this.head;
    this.head = (this.head + 1) % MAX;
    this.pos[i * 3] = x; this.pos[i * 3 + 1] = y; this.pos[i * 3 + 2] = z;
    this.vel[i * 3] = vx; this.vel[i * 3 + 1] = vy; this.vel[i * 3 + 2] = vz;
    this.colors[i * 3] = r; this.colors[i * 3 + 1] = g; this.colors[i * 3 + 2] = b;
    this.size[i] = size;
    this.life[i] = life;
    this.maxLife[i] = life;
    this.grav[i] = grav;
    this.spin[i] = (Math.random() - 0.5) * 8;
  }

  /** Chunky debris burst when a block is broken. */
  blockBreak(x, y, z, rgb, n = 14) {
    for (let i = 0; i < n; i++) {
      const s = 0.10 + Math.random() * 0.10;
      this._spawn(
        x + (Math.random() - 0.5) * 0.8,
        y + (Math.random() - 0.5) * 0.8,
        z + (Math.random() - 0.5) * 0.8,
        (Math.random() - 0.5) * 3.4,
        1.6 + Math.random() * 3.4,
        (Math.random() - 0.5) * 3.4,
        rgb[0] * (0.8 + Math.random() * 0.4),
        rgb[1] * (0.8 + Math.random() * 0.4),
        rgb[2] * (0.8 + Math.random() * 0.4),
        s, 0.7 + Math.random() * 0.7
      );
    }
  }

  blockHit(x, y, z, rgb) {
    this.blockBreak(x + 0.5, y + 0.5, z + 0.5, rgb, 5);
  }

  placePuff(x, y, z, rgb) {
    for (let i = 0; i < 8; i++) {
      this._spawn(
        x + 0.5 + (Math.random() - 0.5), y + 1, z + 0.5 + (Math.random() - 0.5),
        (Math.random() - 0.5) * 1.2, 0.6 + Math.random() * 0.8, (Math.random() - 0.5) * 1.2,
        rgb[0], rgb[1], rgb[2], 0.09, 0.5
      );
    }
  }

  splash(x, y, z, n = 16) {
    for (let i = 0; i < n; i++) {
      this._spawn(
        x + (Math.random() - 0.5) * 0.7, y, z + (Math.random() - 0.5) * 0.7,
        (Math.random() - 0.5) * 2.2, 2.2 + Math.random() * 3, (Math.random() - 0.5) * 2.2,
        0.45, 0.72, 0.95, 0.09, 0.55 + Math.random() * 0.4, 1.1
      );
    }
  }

  /** Slow drifting motes — reads as atmosphere/fireflies. */
  ambient(dt, camPos, night, water) {
    const rate = night > 0.4 ? 2.2 : 0.8;
    if (Math.random() < rate * dt) {
      const r = 14;
      this._spawn(
        camPos.x + (Math.random() - 0.5) * r * 2,
        camPos.y + (Math.random() - 0.4) * r,
        camPos.z + (Math.random() - 0.5) * r * 2,
        (Math.random() - 0.5) * 0.4, 0.05 + Math.random() * 0.25, (Math.random() - 0.5) * 0.4,
        night > 0.4 ? 1.0 : 1.0, night > 0.4 ? 0.92 : 0.97, night > 0.4 ? 0.45 : 0.8,
        night > 0.4 ? 0.075 : 0.05, night > 0.4 ? 3.0 : 5.0, night > 0.4 ? 0.02 : 0.03
      );
    }
  }

  update(dt, world) {
    const P = this.pos, V = this.vel, L = this.life;
    let live = 0;
    for (let i = 0; i < MAX; i++) {
      if (L[i] <= 0) { this._m.copy(this._hidden); this.mesh.setMatrixAt(i, this._m); continue; }
      L[i] -= dt;
      if (L[i] <= 0) { this._m.copy(this._hidden); this.mesh.setMatrixAt(i, this._m); continue; }
      live++;
      V[i * 3 + 1] -= 9.0 * this.grav[i] * dt;
      P[i * 3] += V[i * 3] * dt;
      P[i * 3 + 1] += V[i * 3 + 1] * dt;
      P[i * 3 + 2] += V[i * 3 + 2] * dt;
      // cheap floor collision: bounce once off whatever is underneath
      if (world && world.isSolid(P[i * 3], P[i * 3 + 1] - 0.06, P[i * 3 + 2])) {
        P[i * 3 + 1] = Math.floor(P[i * 3 + 1]) + 0.07;
        V[i * 3] *= 0.6; V[i * 3 + 2] *= 0.6;
        V[i * 3 + 1] = Math.abs(V[i * 3 + 1]) * 0.22;
        if (Math.abs(V[i * 3 + 1]) < 0.4) this.grav[i] = 0;
      }
      const t = L[i] / this.maxLife[i];
      const sc = this.size[i] * Math.min(1, t * 2.2);
      this._e.set(this.spin[i] * (1 - t) * 2, this.spin[i] * (1 - t) * 1.3, 0);
      this._q.setFromEuler(this._e);
      this._v.set(P[i * 3], P[i * 3 + 1], P[i * 3 + 2]);
      this._s.set(sc, sc, sc);
      this._m.compose(this._v, this._q, this._s);
      this.mesh.setMatrixAt(i, this._m);
    }
    this.active = live;
    this.mesh.instanceMatrix.needsUpdate = true;
    this.mesh.instanceColor.needsUpdate = true;
  }
}
