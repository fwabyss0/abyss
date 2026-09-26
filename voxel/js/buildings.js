/* ============================================================
   BUILDINGS — one structure per portfolio section. Every
   building is placed on a flattened plot, and each registers a
   trigger volume so walking near it opens that section.
   ============================================================ */

import { B, AIR } from './world.js';

export class Builder {
  constructor(world) { this.w = world; }

  /** Flatten a plot to a level Y and lay a floor. */
  plot(x, z, half, y, floorId) {
    for (let dz = -half - 1; dz <= half + 1; dz++)
      for (let dx = -half - 1; dx <= half + 1; dx++) {
        const px = x + dx, pz = z + dz;
        const edge = Math.max(Math.abs(dx), Math.abs(dz)) === half + 1;
        for (let py = y - 3; py < y; py++)
          if (this.w.get(px, py, pz) !== AIR) this.w.set(px, py, pz, B.DIRT, false);
        this.w.set(px, y - 1, pz, edge ? B.COBBLE : (floorId ?? B.PLANK), false);
        // clear anything above
        for (let py = y; py < y + 16; py++) this.w.set(px, py, pz, AIR, false);
      }
    this.w._markDirtyAround(x, y, z);
    return this;
  }

  /** Stepped pyramid roof of `depth` layers. */
  roof(x, y, z, half, depth, id, ridgeAlongZ = true) {
    let h = half;
    for (let d = 0; d < depth; d++) {
      const n = half - d;
      for (let dz = -n; dz <= n; dz++)
        for (let dx = -n; dx <= n; dx++) {
          const edge = Math.max(Math.abs(dx), Math.abs(dz)) === n;
          if (edge || d === depth - 1) this.w.set(x + dx, y + d, z + dz, id, false);
        }
    }
    this.w._markDirtyAround(x, y, z);
    return this;
  }

  /** Two-layer eave overhang, very Minecraft. */
  eave(x, y, z, half, id) {
    this.w.box(x - half - 1, y, z - half - 1, x + half + 1, y, z + half + 1, id, { floor: true, wall: false });
    this.w._markDirtyAround(x, y, z);
    return this;
  }

  /** Door opening: clears 2 blocks and marks a trigger. */
  door(x, y, z, facing) {
    for (let dy = 0; dy < 2; dy++) for (let d = -1; d <= 1; d++) {
      if (facing === 'z+') this.w.set(x + d, y + dy, z, AIR, false);
      if (facing === 'z-') this.w.set(x + d, y + dy, z, AIR, false);
      if (facing === 'x+') this.w.set(x, y + dy, z + d, AIR, false);
      if (facing === 'x-') this.w.set(x, y + dy, z + d, AIR, false);
    }
    this.w._markDirtyAround(x, y, z);
    return this;
  }

  /** Window: 2x2 glass in a wall. */
  window(x, y, z, facing) {
    for (let dy = 1; dy <= 2; dy++) for (let d = 0; d <= 1; d++) {
      const px = facing === 'x' ? x : x + d;
      const pz = facing === 'x' ? z + d : z;
      this.w.set(px, y + dy, pz, B.GLASS, false);
    }
    this.w._markDirtyAround(x, y, z);
    return this;
  }

  /** Fence posts + rail. */
  fence(x, z, radius, y, id = B.PLANK) {
    for (let a = 0; a < 360; a += 45) {
      const px = Math.round(x + Math.cos(a * Math.PI / 180) * radius);
      const pz = Math.round(z + Math.sin(a * Math.PI / 180) * radius);
      this.w.set(px, y, pz, id, false);
      this.w.set(px, y + 1, pz, id, false);
    }
    this.w._markDirtyAround(x, y, z);
    return this;
  }

  /** Torches on posts — the only light sources after dark. */
  torchPost(x, y, z) {
    this.w.set(x, y, z, B.LOG, false);
    this.w.set(x, y + 1, z, B.GLOW, false);
    this.w._markDirtyAround(x, y, z);
    return this;
  }

  /** Banner: a vertical strip of the section's signature block. */
  banner(x, y, z, id, h = 3) {
    for (let i = 0; i < h; i++) this.w.set(x, y + i, z, id, false);
    this.w._markDirtyAround(x, y, z);
    return this;
  }

  /** A standing sign post: log + plank plate. */
  sign(x, y, z) {
    this.w.set(x, y, z, B.LOG, false);
    this.w.set(x, y + 1, z, B.LOG, false);
    this.w.set(x, y + 2, z, B.PLANK, false);
    this.w._markDirtyAround(x, y, z);
    return this;
  }
}

/** Averages the ground height around a plot so buildings sit level. */
export function groundNear(world, dx, dz, span = 4) {
  const CX = Math.floor(world.w / 2), CZ = Math.floor(world.d / 2);
  const x = Math.max(span, Math.min(world.w - span - 1, CX + dx));
  const z = Math.max(span, Math.min(world.d - span - 1, CZ + dz));
  let sum = 0, n = 0;
  for (let sx = -span; sx <= span; sx += 2)
    for (let sz = -span; sz <= span; sz += 2) {
      const y = world.surfaceY(x + sx, z + sz);
      if (y >= 0) { sum += y; n++; }
    }
  return n ? Math.round(sum / n) + 1 : 8;
}

/* ------------------------------------------------------------------
   The six buildings. Each returns a trigger descriptor.
   ------------------------------------------------------------------ */

export function buildVillage(world) {
  const b = new Builder(world);
  const triggers = [];
  // Building positions in data.js are offsets from the world centre.
  const CX = Math.floor(world.w / 2), CZ = Math.floor(world.d / 2);

  /* ===== HOME — the central great house ===== */
  {
    const x = CX, z = CZ, y = world.surfaceY(CX, CZ) + 1;
    b.plot(x, z, 9, y, B.PLANK);
    // walls
    b.w.box(x - 7, y, z - 7, x + 7, y + 4, z + 7, B.PLANK, { floor: false, wall: true });
    // clear interior
    b.w.fill(x - 6, y, z - 6, x + 6, y + 4, z + 6, AIR, false);
    // pillars
    for (const [px, pz] of [[-7, -7], [7, -7], [-7, 7], [7, 7]])
      b.w.fill(px, y, pz, px, y + 5, pz, B.LOG, false);
    // windows + door
    b.door(x, y, z - 7, 'z-'); b.door(x, y, z + 7, 'z+');
    b.window(x - 4, y, z - 7, 'x'); b.window(x + 3, y, z - 7, 'x');
    b.window(x - 4, y, z + 7, 'x'); b.window(x + 3, y, z + 7, 'x');
    b.window(x - 7, y, z - 4, 'z'); b.window(x - 7, y, z + 3, 'z');
    b.window(x + 7, y, z - 4, 'z'); b.window(x + 7, y, z + 3, 'z');
    // roof
    b.eave(x, y + 5, z, 7, B.PLANK);
    b.roof(x, y + 6, z, 8, 4, B.BRICK);
    // sign + torches
    b.sign(x - 1, y - 1, z - 10);
    b.torchPost(x + 1, y - 1, z - 10);
    b.torchPost(x - 5, y - 1, z - 5);
    b.torchPost(x + 5, y - 1, z + 5);
    // interior detail: a small table + glow lamp
    b.w.fill(x - 2, y, z + 4, x + 2, y, z + 5, B.PLANK, false);
    b.w.set(x, y + 2, z, B.GLOW, false);
    b.w._markDirtyAround(x, y, z);
    triggers.push({ id: 'home', x, z, y, r: 9 });
  }

  /* ===== ABOUT — the amethyst library ===== */
  {
    const [dx, dz] = [-34, -24];
    const x = CX + dx, z = CZ + dz, y = groundNear(world, dx, dz);
    b.plot(x, z, 7, y, B.PLANK);
    b.w.box(x - 5, y, z - 5, x + 5, y + 5, z + 5, B.AMETHYST, { floor: false, wall: true });
    b.w.fill(x - 4, y, z - 4, x + 4, y + 5, z + 4, AIR, false);
    b.door(x, y, z - 5, 'z-');
    b.window(x - 3, y, z - 5, 'x'); b.window(x + 2, y, z - 5, 'x');
    b.window(x - 5, y, z + 1, 'z'); b.window(x + 5, y, z - 2, 'z');
    // bookshelves: alternating tall blocks
    for (let i = -4; i <= 4; i++) {
      b.w.fill(x + i, y, z - 4, x + i, y + 3, z - 4, i % 2 ? B.AMETHYST : B.PLANK, false);
      b.w.fill(x + i, y, z + 4, x + i, y + 3, z + 4, i % 2 ? B.PLANK : B.AMETHYST, false);
    }
    b.eave(x, y + 6, z, 5, B.AMETHYST);
    b.roof(x, y + 7, z, 6, 3, B.AMETHYST);
    b.torchPost(x - 6, y - 1, z - 6);
    b.torchPost(x + 6, y - 1, z - 6);
    b.fence(x, z, 8, y - 1);
    b.w.addFlowerPatch(x, z, 14, B.AMETHYST);
    triggers.push({ id: 'about', x, z, y, r: 7 });
  }

  /* ===== SKILLS — the copper workshop ===== */
  {
    const [dx, dz] = [32, -26];
    const x = CX + dx, z = CZ + dz, y = groundNear(world, dx, dz);
    b.plot(x, z, 7, y, B.COBBLE);
    b.w.box(x - 5, y, z - 5, x + 5, y + 4, z + 5, B.COPPER, { floor: false, wall: true });
    b.w.fill(x - 4, y, z - 4, x + 4, y + 4, z + 4, AIR, false);
    b.door(x, y, z + 5, 'z+');
    b.window(x - 4, y, z - 5, 'x'); b.window(x + 2, y, z - 5, 'x');
    b.window(x - 5, y, z - 2, 'z'); b.window(x + 5, y, z + 2, 'z');
    // workshop chimney
    b.w.fill(x + 3, y + 5, z + 3, x + 4, y + 9, z + 4, B.COBBLE, false);
    b.eave(x, y + 5, z, 5, B.COPPER);
    b.roof(x, y + 6, z, 6, 2, B.COPPER);
    // anvil-ish workbench + barrels of "ore"
    b.w.fill(x - 2, y, z + 1, x + 2, y, z + 2, B.PLANK, false);
    b.w.set(x - 1, y + 1, z + 1, B.GLOW, false);
    b.w.set(x + 1, y + 1, z + 1, B.GLOW, false);
    b.w.set(x - 7, y - 1, z + 2, B.COPPER, false);
    b.w.set(x + 7, y - 1, z - 2, B.COPPER, false);
    b.torchPost(x - 6, y - 1, z + 5);
    b.torchPost(x + 6, y - 1, z + 5);
    b.fence(x, z, 8, y - 1);
    triggers.push({ id: 'skills', x, z, y, r: 7 });
  }

  /* ===== EXPERIENCE — the lapis watchtower ===== */
  {
    const [dx, dz] = [-32, 28];
    const x = CX + dx, z = CZ + dz, y = groundNear(world, dx, dz);
    b.plot(x, z, 6, y, B.COBBLE);
    // round-ish tower
    const R = 4;
    for (let dy = 0; dy < 11; dy++) {
      const r = dy < 8 ? R : R + 1;
      for (let dz = -r; dz <= r; dz++)
        for (let dx = -r; dx <= r; dx++) {
          if (dx * dx + dz * dz > r * r + r) continue;
          const edge = dx * dx + dz * dz > (r - 1) * (r - 1) + (r - 1);
          if (edge) b.w.set(x + dx, y + dy, z + dz, dy < 9 ? B.LAPIS : B.COBBLE, false);
        }
    }
    b.w.fill(x - 1, y, z - 1, x + 1, y + 10, z + 1, AIR, false);
    b.door(x, y, z - R, 'z-');
    b.roof(x, y + 11, z, R + 2, 2, B.LAPIS);
    // beacon on top
    b.w.set(x, y + 11, z, B.GLOW, false);
    b.w.set(x, y + 12, z, B.DIAMOND, false);
    // brazier at the base
    b.w.set(x - 5, y - 1, z - 5, B.LAPIS, false);
    b.w.set(x + 5, y - 1, z - 5, B.LAPIS, false);
    b.torchPost(x, y - 1, z - 7);
    b.fence(x, z, 7, y - 1);
    triggers.push({ id: 'experience', x, z, y, r: 7 });
  }

  /* ===== PROJECTS — the diamond build site ===== */
  {
    const [dx, dz] = [32, 26];
    const x = CX + dx, z = CZ + dz, y = groundNear(world, dx, dz);
    b.plot(x, z, 8, y, B.COBBLE);
    // open-air platform with three build frames
    for (const [ox, oz] of [[-5, -4], [5, -4], [0, 5]]) {
      for (const [px, pz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]])
        b.w.fill(x + ox + px, y, z + oz + pz, x + ox + px, y + 3, z + oz + pz, B.DIAMOND, false);
      b.w.fill(x + ox - 1, y + 4, z + oz - 1, x + ox + 1, y + 4, z + oz + 1, B.DIAMOND, false);
    }
    // glass showcase walls
    b.w.box(x - 6, y, z - 6, x + 6, y + 2, z + 6, B.GLASS, { floor: false, wall: true });
    b.w.fill(x - 5, y, z - 5, x + 5, y + 2, z + 5, AIR, false);
    b.door(x, y, z - 6, 'z-');
    b.roof(x, y + 3, z, 6, 1, B.DIAMOND);
    b.w.set(x, y + 3, z, B.GLOW, false);
    b.torchPost(x - 7, y - 1, z - 7);
    b.torchPost(x + 7, y - 1, z - 7);
    b.torchPost(x - 7, y - 1, z + 7);
    b.torchPost(x + 7, y - 1, z + 7);
    b.fence(x, z, 9, y - 1);
    b.w.addFlowerPatch(x, z, 16, B.DIAMOND);
    triggers.push({ id: 'projects', x, z, y, r: 8 });
  }

  /* ===== CONTACT — the emerald beacon ===== */
  {
    const [dx, dz] = [2, 40];
    const x = CX + dx, z = CZ + dz, y = groundNear(world, dx, dz);
    b.plot(x, z, 6, y, B.EMERALD);
    b.w.box(x - 4, y, z - 4, x + 4, y + 4, z + 4, B.EMERALD, { floor: false, wall: true });
    b.w.fill(x - 3, y, z - 3, x + 3, y + 4, z + 3, AIR, false);
    b.door(x, y, z - 4, 'z-');
    b.window(x - 4, y, z - 2, 'z'); b.window(x + 4, y, z + 1, 'z');
    b.eave(x, y + 5, z, 4, B.EMERALD);
    b.roof(x, y + 6, z, 5, 2, B.EMERALD);
    // signal pillar — the tallest thing in the village, visible from anywhere
    b.w.fill(x + 6, y - 1, z - 1, x + 6, y + 12, z - 1, B.EMERALD, false);
    b.w.set(x + 6, y + 13, z - 1, B.GLOW, false);
    b.w.set(x + 6, y + 14, z - 1, B.GLOW, false);
    b.torchPost(x - 5, y - 1, z - 5);
    b.torchPost(x + 5, y - 1, z - 5);
    b.fence(x, z, 7, y - 1);
    b.w.addFlowerPatch(x, z, 12, B.EMERALD);
    triggers.push({ id: 'contact', x, z, y, r: 7 });
  }

  /* ===== shared village dressing ===== */
  const cy = groundNear(world, 0, 0, 6);
  // lantern posts along the crossroads
  for (const [ox, oz] of [[6, 6], [-6, 6], [6, -6], [-6, -6], [6, 20], [-6, 20], [18, 4], [-18, 4], [18, -20], [-18, -20]]) {
    const lx = Math.max(1, Math.min(world.w - 2, CX + ox));
    const lz = Math.max(1, Math.min(world.d - 2, CZ + oz));
    const ly = world.surfaceY(lx, lz);
    if (ly > 0 && b.w.get(lx, ly + 1, lz) === AIR) b.torchPost(lx, ly, lz);
  }
  // a small well in the plaza
  const wx = CX, wz = CZ + 11;
  b.w.fill(wx - 2, cy - 1, wz - 2, wx + 2, cy - 1, wz + 2, B.COBBLE, false);
  b.w.fill(wx - 1, cy - 1, wz - 1, wx + 1, cy - 1, wz + 1, B.WATER, false);
  b.w.fill(wx - 2, cy, wz - 2, wx - 2, cy + 1, wz + 2, B.PLANK, false);
  b.w.fill(wx + 2, cy, wz - 2, wx + 2, cy + 1, wz + 2, B.PLANK, false);
  b.w.fill(wx - 3, cy + 2, wz - 2, wx + 3, cy + 2, wz + 2, B.PLANK, false);
  b.w._markDirtyAround(wx, cy, wz);

  return triggers;
}
