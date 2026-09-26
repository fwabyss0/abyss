/* ============================================================
   PLAYER — capsule-ish AABB physics against the voxel grid,
   first/third person camera, sprint, sneak, jump, step-up,
   swimming, creative flight, and block interaction.
   ============================================================ */

import * as THREE from 'three';
import { B, AIR } from './world.js';

const WIDTH = 0.62;          // player AABB width/height scale
const HEIGHT = 1.8;
const EYE = 1.62;
const SNEAK_EYE = 1.34;
const GRAVITY = 26;
const JUMP_V = 8.6;
const WALK = 4.6;
const SPRINT = 7.6;
const SNEAK = 1.9;
const FLY = 11;
const FLY_FAST = 26;
const SWIM = 3.4;
const EPS = 1e-4;

export class Player {
  constructor(world, camera) {
    this.world = world;
    this.camera = camera;
    this.pos = new THREE.Vector3(0, 40, 0);
    this.vel = new THREE.Vector3();
    this.yaw = 0;
    this.pitch = 0;
    this.onGround = false;
    this.inWater = false;
    this.headInWater = false;
    this.flying = false;
    this.sprinting = false;
    this.sneaking = false;
    this.thirdPerson = false;
    this.thirdDist = 5.2;
    this.bob = 0;
    this.keys = new Set();
    this.enabled = true;
    this.aim = new THREE.Vector3();
    this._lastJumpTap = 0;
  }

  spawn(x, y, z) { this.pos.set(x, y, z); this.vel.set(0, 0, 0); }

  look(dx, dy) {
    this.yaw -= dx;
    this.pitch -= dy;
    const lim = Math.PI / 2 - 0.001;
    this.pitch = Math.max(-lim, Math.min(lim, this.pitch));
  }

  /* ---- collision ---- */
  /** True if the player AABB at pos overlaps any non-transparent voxel. */
  _solidAt(px, py, pz) {
    const h = WIDTH / 2;
    const x0 = Math.floor(px - h), x1 = Math.floor(px + h - EPS);
    const y0 = Math.floor(py + EPS), y1 = Math.floor(py + HEIGHT - EPS);
    const z0 = Math.floor(pz - h), z1 = Math.floor(pz + h - EPS);
    const w = this.world;
    for (let y = y0; y <= y1; y++)
      for (let z = z0; z <= z1; z++)
        for (let x = x0; x <= x1; x++) {
          if (w.isSolid(x, y, z)) return true;
        }
    return false;
  }

  /** Axis-separated sweep: resolve each axis independently for clean sliding. */
  _moveAxis(axis, delta) {
    if (delta === 0) return;
    const step = Math.sign(delta) * Math.min(Math.abs(delta), 0.4);
    let remaining = delta;
    let guard = 0;
    while (Math.abs(remaining) > EPS && guard++ < 40) {
      const d = Math.abs(remaining) < Math.abs(step) ? remaining : step;
      this.pos[axis] += d;
      if (this._solidAt(this.pos.x, this.pos.y, this.pos.z)) {
        this.pos[axis] -= d;
        if (axis === 'y') { if (d < 0) this.onGround = true; this.vel.y = 0; }
        else this.vel[axis] = 0;
        remaining = 0;
      } else {
        remaining -= d;
      }
    }
  }

  _inLiquid(x, y, z) {
    const b = this.world.get(Math.floor(x), Math.floor(y), Math.floor(z));
    return b === B.WATER;
  }

  update(dt) {
    if (!this.enabled) return;
    dt = Math.min(dt, 0.05);

    const k = this.keys;
    let fwd = 0, strafe = 0;
    if (k.has('KeyW') || k.has('ArrowUp')) fwd += 1;
    if (k.has('KeyS') || k.has('ArrowDown')) fwd -= 1;
    if (k.has('KeyA') || k.has('ArrowLeft')) strafe -= 1;
    if (k.has('KeyD') || k.has('ArrowRight')) strafe += 1;

    this.sneaking = k.has('ShiftLeft') || k.has('ShiftRight');
    this.sprinting = k.has('ControlLeft') || k.has('ControlRight') || (k.has('KeyR') && fwd > 0);

    // water state
    const feetWet = this._inLiquid(this.pos.x, this.pos.y + 0.3, this.pos.z);
    this.inWater = feetWet;
    this.headInWater = this._inLiquid(this.pos.x, this.pos.y + EYE, this.pos.z);

    let speed;
    if (this.flying) speed = this.sprinting ? FLY_FAST : FLY;
    else if (this.inWater) speed = SWIM;
    else if (this.sneaking) speed = SNEAK;
    else speed = this.sprinting ? SPRINT : WALK;

    // desired horizontal direction in world space
    const sinY = Math.sin(this.yaw), cosY = Math.cos(this.yaw);
    let dx = -sinY * fwd + cosY * strafe;
    let dz = -cosY * fwd - sinY * strafe;
    const len = Math.hypot(dx, dz);
    if (len > 0) { dx /= len; dz /= len; }

    const targetVX = dx * speed, targetVZ = dz * speed;
    const accel = this.onGround || this.flying ? 18 : 6;
    this.vel.x += (targetVX - this.vel.x) * Math.min(1, accel * dt);
    this.vel.z += (targetVZ - this.vel.z) * Math.min(1, accel * dt);

    // vertical
    if (this.flying) {
      let up = 0;
      if (k.has('Space')) up += 1;
      if (this.sneaking) up -= 1;
      this.vel.y += (up * speed - this.vel.y) * Math.min(1, 14 * dt);
    } else if (this.inWater) {
      this.vel.y -= GRAVITY * 0.28 * dt;
      if (k.has('Space')) this.vel.y = Math.min(this.vel.y + 24 * dt, 3.4);
      this.vel.y = Math.max(this.vel.y, -3.2);
    } else {
      this.vel.y -= GRAVITY * dt;
      if (k.has('Space') && this.onGround) {
        this.vel.y = JUMP_V;
        this.onGround = false;
      }
    }
    this.vel.y = Math.max(this.vel.y, -58);

    const wasGround = this.onGround;
    this.onGround = false;

    // integrate with collision
    this._moveAxis('x', this.vel.x * dt);
    this._moveAxis('z', this.vel.z * dt);

    // step-up: if blocked horizontally and we're grounded, try to climb 1
    if (!this.flying && wasGround && (this.vel.x === 0 || this.vel.z === 0) && len > 0) {
      const oldX = this.pos.x, oldZ = this.pos.z;
      const saveY = this.pos.y;
      this.pos.y += 0.6;
      if (!this._solidAt(this.pos.x, this.pos.y, this.pos.z)) {
        const tx = oldX + dx * 0.35, tz = oldZ + dz * 0.35;
        this.pos.x = tx; this.pos.z = tz;
        if (!this._solidAt(this.pos.x, this.pos.y, this.pos.z)) {
          // dropped back down onto the step
        } else { this.pos.x = oldX; this.pos.z = oldZ; this.pos.y = saveY; }
      } else { this.pos.y = saveY; }
    }

    this._moveAxis('y', this.vel.y * dt);

    // safety: never fall out of the world
    if (this.pos.y < -8) this.spawn(this.pos.x, 40, this.pos.z);

    // head bob
    const speedNow = Math.hypot(this.vel.x, this.vel.z);
    if (this.onGround && speedNow > 0.6) this.bob += dt * speedNow * 2.0;
    else this.bob += (0 - this.bob) * 0.0;

    this._updateCamera(dt);
  }

  _updateCamera(dt) {
    const eyeH = this.sneaking ? SNEAK_EYE : EYE;
    const bobY = this.onGround ? Math.sin(this.bob) * 0.045 * Math.min(1, Math.hypot(this.vel.x, this.vel.z) / WALK) : 0;
    const bobX = this.onGround ? Math.cos(this.bob * 0.5) * 0.03 * Math.min(1, Math.hypot(this.vel.x, this.vel.z) / WALK) : 0;

    const eye = new THREE.Vector3(this.pos.x, this.pos.y + eyeH + bobY, this.pos.z);
    eye.x += bobX * 0.4;

    const dir = new THREE.Vector3(
      -Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      -Math.cos(this.yaw) * Math.cos(this.pitch)
    );
    this.aim.copy(eye).addScaledVector(dir, 3);

    if (this.thirdPerson) {
      // raycast backwards against the world so the camera never clips in
      let dist = this.thirdDist;
      const back = dir.clone().negate();
      const test = eye.clone();
      for (let t = 0.3; t <= this.thirdDist; t += 0.2) {
        test.copy(eye).addScaledVector(back, t);
        if (this.world.isSolid(test.x, test.y, test.z)) { dist = Math.max(0.6, t - 0.35); break; }
      }
      const cam = eye.clone().addScaledVector(back, dist);
      this.camera.position.lerp(cam, 1 - Math.pow(0.0015, dt));
      this.camera.lookAt(eye);
      // slight FOV widen when moving fast
      const sp = Math.min(1, Math.hypot(this.vel.x, this.vel.z) / SPRINT);
      this.camera.fov += (72 + sp * 8 - this.camera.fov) * Math.min(1, 6 * dt);
    } else {
      this.camera.position.lerp(eye, 1 - Math.pow(0.00001, dt));
      this.camera.quaternion.setFromEuler(new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ'));
      const sp = Math.min(1, Math.hypot(this.vel.x, this.vel.z) / SPRINT);
      this.camera.fov += ((this.sprinting ? 80 : 72) + sp * 4 - this.camera.fov) * Math.min(1, 6 * dt);
    }
    this.camera.updateProjectionMatrix();
  }

  /* ---- interaction ---- */

  /** DDA voxel raycast. Returns {x,y,z,block,nx,ny,nz,dist} or null. */
  raycastVoxel(maxDist = 6) {
    const dir = new THREE.Vector3(
      -Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      -Math.cos(this.yaw) * Math.cos(this.pitch)
    );
    const ox = this.pos.x, oy = this.pos.y + (this.sneaking ? SNEAK_EYE : EYE), oz = this.pos.z;

    let x = Math.floor(ox), y = Math.floor(oy), z = Math.floor(oz);
    const stepX = dir.x > 0 ? 1 : -1, stepY = dir.y > 0 ? 1 : -1, stepZ = dir.z > 0 ? 1 : -1;
    const tDeltaX = Math.abs(1 / (dir.x || 1e-9));
    const tDeltaY = Math.abs(1 / (dir.y || 1e-9));
    const tDeltaZ = Math.abs(1 / (dir.z || 1e-9));
    let tMaxX = ((dir.x > 0 ? x + 1 - ox : ox - x) || 1e-9) * tDeltaX;
    let tMaxY = ((dir.y > 0 ? y + 1 - oy : oy - y) || 1e-9) * tDeltaY;
    let tMaxZ = ((dir.z > 0 ? z + 1 - oz : oz - z) || 1e-9) * tDeltaZ;

    let nx = 0, ny = 0, nz = 0, t = 0;
    for (let i = 0; i < 256; i++) {
      const b = this.world.get(x, y, z);
      if (b !== AIR) {
        // non-solid decor (grass/flowers) is still selectable
        return { x, y, z, block: b, nx, ny, nz, dist: t };
      }
      if (tMaxX < tMaxY && tMaxX < tMaxZ) {
        x += stepX; t = tMaxX; tMaxX += tDeltaX; nx = -stepX; ny = 0; nz = 0;
      } else if (tMaxY < tMaxZ) {
        y += stepY; t = tMaxY; tMaxY += tDeltaY; nx = 0; ny = -stepY; nz = 0;
      } else {
        z += stepZ; t = tMaxZ; tMaxZ += tDeltaZ; nx = 0; ny = 0; nz = -stepZ;
      }
      if (t > maxDist) return null;
      if (y < 0 || y >= this.world.h) return null;
    }
    return null;
  }
}
