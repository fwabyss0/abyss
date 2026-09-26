/* ============================================================
   VOXEL WORLD — chunked voxel grid, a face-culled mesher that
   emits one BufferGeometry per chunk.

   This is a VOID world, not an island. Nothing is generated
   here: rooms.js carves each floating room-island, its portal
   and its bridges. The grid is only the canvas they share, and
   it is deliberately much larger than any single room so the
   rooms sit far apart with real black space between them.
   ============================================================ */

import * as THREE from 'three';
import { TILES, tileUV } from './textures.js';

export const CHUNK = 16;          // x/z size of a chunk
export const WORLD_W = 12;        // chunks across  -> 192 voxels
export const WORLD_D = 12;        // chunks deep
export const HEIGHT = 64;         // max voxel Y (rooms sit high, roots hang low)

const T = TILES;

/* Block ids we actually place. 0 = air. */
export const AIR = 0;
export const B = {
  GRASS: 1, DIRT: 2, STONE: 3, COBBLE: 4, SAND: 5,
  LOG: 6, LEAVES: 7, PLANK: 8, GLASS: 9, WATER: 10,
  SNOW: 11, GRAVEL: 12, GLOW: 13, WOOL: 14, OBSIDIAN: 15,
  DEEPSLATE: 16, AMETHYST: 17, COPPER: 18, LAPIS: 19,
  DIAMOND: 20, EMERALD: 21, BRICK: 22
};

/* Which tile each block shows on each face.
   [+x,-x,+y(top),-y(bottom),+z,-z] */
const FACE_TILES = {
  [B.GRASS]:    [T.grass_side, T.grass_side, T.grass_top, T.dirt, T.grass_side, T.grass_side],
  [B.DIRT]:     [T.dirt, T.dirt, T.dirt, T.dirt, T.dirt, T.dirt],
  [B.STONE]:    [T.stone, T.stone, T.stone, T.stone, T.stone, T.stone],
  [B.COBBLE]:   [T.cobble, T.cobble, T.cobble, T.cobble, T.cobble, T.cobble],
  [B.SAND]:     [T.sand, T.sand, T.sand, T.sand, T.sand, T.sand],
  [B.LOG]:      [T.log_side, T.log_side, T.log_top, T.log_top, T.log_side, T.log_side],
  [B.LEAVES]:   [T.leaves, T.leaves, T.leaves, T.leaves, T.leaves, T.leaves],
  [B.PLANK]:    [T.planks, T.planks, T.planks, T.planks, T.planks, T.planks],
  [B.GLASS]:    [T.glass, T.glass, T.glass, T.glass, T.glass, T.glass],
  [B.WATER]:    [T.water, T.water, T.water, T.water, T.water, T.water],
  [B.SNOW]:     [T.snow, T.snow, T.snow, T.snow, T.snow, T.snow],
  [B.GRAVEL]:   [T.gravel, T.gravel, T.gravel, T.gravel, T.gravel, T.gravel],
  [B.GLOW]:     [T.glowstone, T.glowstone, T.glowstone, T.glowstone, T.glowstone, T.glowstone],
  [B.WOOL]:     [T.wool, T.wool, T.wool, T.wool, T.wool, T.wool],
  [B.OBSIDIAN]: [T.obsidian, T.obsidian, T.obsidian, T.obsidian, T.obsidian, T.obsidian],
  [B.DEEPSLATE]:[T.deepslate, T.deepslate, T.deepslate, T.deepslate, T.deepslate, T.deepslate],
  [B.AMETHYST]: [T.amethyst, T.amethyst, T.amethyst, T.amethyst, T.amethyst, T.amethyst],
  [B.COPPER]:   [T.copper, T.copper, T.copper, T.copper, T.copper, T.copper],
  [B.LAPIS]:    [T.lapis, T.lapis, T.lapis, T.lapis, T.lapis, T.lapis],
  [B.DIAMOND]:  [T.diamond, T.diamond, T.diamond, T.diamond, T.diamond, T.diamond],
  [B.EMERALD]:  [T.emerald, T.emerald, T.emerald, T.emerald, T.emerald, T.emerald],
  [B.BRICK]:    [T.bricks, T.bricks, T.bricks, T.bricks, T.bricks, T.bricks]
};

/* Blocks that do not cull their neighbours (glass, leaves, water). */
const TRANSPARENT = new Set([B.GLASS, B.LEAVES, B.WATER]);
/* Blocks that should not have faces drawn against each other. */
const CULL_SELF = new Set([B.WATER]);

/* Faces: dir, 4 corner offsets (CCW seen from outside), normal, AO test dirs */
const FACES = [
  { // +x
    dir: [1, 0, 0],
    corners: [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]],
    ao: [[1, 1, 0], [1, 1, 1], [1, 0, 1], [1, 0, 0]]
  },
  { // -x
    dir: [-1, 0, 0],
    corners: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]],
    ao: [[0, 1, 1], [0, 1, 0], [0, 0, 0], [0, 0, 1]]
  },
  { // +y (top)
    dir: [0, 1, 0],
    corners: [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]],
    ao: [[0, 1, 0], [1, 1, 0], [0, 1, 1], [1, 1, 1]]
  },
  { // -y (bottom)
    dir: [0, -1, 0],
    corners: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]],
    ao: [[0, 0, 1], [1, 0, 1], [0, 0, 0], [1, 0, 0]]
  },
  { // +z
    dir: [0, 0, 1],
    corners: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]],
    ao: [[0, 0, 0], [0, 1, 0], [1, 0, 0], [1, 1, 0]]
  },
  { // -z
    dir: [0, 0, -1],
    corners: [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]],
    ao: [[0, 0, 1], [0, 1, 1], [1, 0, 1], [1, 1, 1]]
  }
];

/* Light emission per block.

   `EMIT` is a *vertex tint* multiplier — it only makes the block's own
   texture brighter, it does not light its neighbours. Real local light
   comes from rooms.js placing PointLights, which is why every room's
   portal and glow fixtures get one. Values are tuned so a glowstone
   reads as a bright surface without blowing out to white. */
const EMIT = {
  [B.GLOW]: 2.30,
  [B.AMETHYST]: 1.35,
  [B.DIAMOND]: 1.28,
  [B.EMERALD]: 1.24,
  [B.COPPER]: 1.14,
  [B.LAPIS]: 1.12
};

export const BLOCK_LIGHT = EMIT;

/* ------------------------------------------------------------------
   Noise helpers. No terrain is generated any more, but rooms.js
   reuses these to make each floating island's silhouette ragged
   instead of a hard rectangle.
   ------------------------------------------------------------------ */

export function hash2(x, z) {
  let h = x * 374761393 + z * 668265263;
  h = (h ^ (h >> 13)) * 1274126177;
  return ((h ^ (h >> 16)) >>> 0) / 4294967296;
}

function smoothstep(t) { return t * t * (3 - 2 * t); }
function lerp(a, b, t) { return a + (b - a) * t; }

/** Smooth value noise on the chunk grid. */
export function valueNoise(x, z, scale) {
  const xs = x / scale, zs = z / scale;
  const x0 = Math.floor(xs), z0 = Math.floor(zs);
  const fx = smoothstep(xs - x0), fz = smoothstep(zs - z0);
  const a = hash2(x0, z0), b = hash2(x0 + 1, z0);
  const c = hash2(x0, z0 + 1), d = hash2(x0 + 1, z0 + 1);
  return lerp(lerp(a, b, fx), lerp(c, d, fx), fz);
}

export class VoxelWorld {
  constructor() {
    this.w = WORLD_W * CHUNK;
    this.d = WORLD_D * CHUNK;
    this.h = HEIGHT;
    this.data = new Uint8Array(this.w * this.d * this.h);
    this.chunkMeshes = new Map();   // key -> THREE.Mesh (lit, solid blocks)
    this.glowMeshes = new Map();   // key -> THREE.Mesh (unlit, emissive blocks)
    this.group = new THREE.Group();
    this.group.name = 'voxel-world';
    this.edits = new Map();         // "x,y,z" -> blockId, for rebuilds
    this.dirty = new Set();
  }

  idx(x, y, z) { return x + this.w * (z + this.d * y); }

  get(x, y, z) {
    if (x < 0 || z < 0 || y < 0 || x >= this.w || z >= this.d || y >= this.h) return AIR;
    return this.data[x + this.w * (z + this.d * y)];
  }

  /** Writes a block and marks its chunk dirty for remeshing. */
  set(x, y, z, id, remesh = true) {
    if (x < 0 || z < 0 || y < 0 || x >= this.w || z >= this.d || y >= this.h) return;
    const i = x + this.w * (z + this.d * y);
    if (this.data[i] === id) return;
    this.data[i] = id;
    this.edits.set(`${x},${y},${z}`, id);
    if (remesh) this._markDirtyAround(x, y, z);
  }

  _markDirtyAround(x, y, z) {
    const cx = x >> 4, cz = z >> 4;
    this.dirty.add(cx + ',' + cz);
    // neighbours matter at chunk borders
    if ((x & 15) === 0) this.dirty.add((cx - 1) + ',' + cz);
    if ((x & 15) === 15) this.dirty.add((cx + 1) + ',' + cz);
    if ((z & 15) === 0) this.dirty.add(cx + ',' + (cz - 1));
    if ((z & 15) === 15) this.dirty.add(cx + ',' + (cz + 1));
  }

  /** Flatten + texture a rectangular footprint. */
  fill(x0, y0, z0, x1, y1, z1, id) {
    for (let y = y0; y <= y1; y++)
      for (let z = Math.min(z0, z1); z <= Math.max(z0, z1); z++)
        for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++)
          this.set(x, y, z, id, false);
    this._markDirtyAround((x0 + x1) >> 1, y0, (z0 + z1) >> 1);
  }

  /** Hollow box shell (walls + optional floor, no roof unless asked). */
  box(x0, y0, z0, x1, y1, z1, id, { floor = true, roof = false, wall = true } = {}) {
    for (let y = y0; y <= y1; y++)
      for (let z = z0; z <= z1; z++)
        for (let x = x0; x <= x1; x++) {
          const edge = x === x0 || x === x1 || z === z0 || z === z1;
          if (edge && wall) this.set(x, y, z, id, false);
          else if (!edge && floor && y === y0) this.set(x, y, z, id, false);
          else if (!edge && roof && y === y1) this.set(x, y, z, id, false);
        }
    this._markDirtyAround((x0 + x1) >> 1, y0, (z0 + z1) >> 1);
  }

  /* ---------------- void ---------------- */

  /**
   * Nothing is generated. The world is pure black space; rooms.js
   * builds each floating room individually. Kept as a method so
   * main.js has the same call shape it always had.
   */
  generate() {
    return this;
  }

  /**
   * Ensure a chunk mesh exists for a chunk that contains no blocks.
   * An empty chunk returns null geometry, which is correct — the
   * black void is the absence of geometry, not a mesh.
   */
  ensureChunkMesh(cx, cz) {
    this.dirty.add(cx + ',' + cz);
  }

  /**
   * Topmost solid block y at (x,z), or -1 when that column is empty
   * void. Rooms live on floating islands, so this returns -1 over
   * most of the grid — callers must handle that rather than assume
   * there is ground everywhere.
   */
  surfaceY(x, z) {
    if (x < 0 || z < 0 || x >= this.w || z >= this.d) return -1;
    for (let y = this.h - 1; y >= 0; y--) {
      const id = this.get(x, y, z);
      if (id !== AIR && id !== B.WATER && !TRANSPARENT.has(id)) return y;
    }
    return -1;
  }

  /** True when the column (x,z) has no solid block at all. */
  isVoid(x, z) { return this.surfaceY(x, z) < 0; }

  /** True when a solid block sits inside the box (drops a shadow/hits). */
  anySolidIn(x0, y0, z0, x1, y1, z1) {
    for (let y = y0; y <= y1; y++)
      for (let z = z0; z <= z1; z++)
        for (let x = x0; x <= x1; x++)
          if (this.isSolid(x + 0.5, y + 0.5, z + 0.5)) return true;
    return false;
  }

  /* ---------------- meshing ---------------- */

  buildMeshes(atlas, material, glowMaterial) {
    for (let cz = 0; cz < WORLD_D; cz++)
      for (let cx = 0; cx < WORLD_W; cx++) {
        const key = cx + ',' + cz;
        this.dirty.add(key);
      }
    this.material = material;
    this.glowMaterial = glowMaterial;
    this.atlas = atlas;
    this.flushDirty();
    return this;
  }

  flushDirty() {
    for (const key of this.dirty) {
      const [cx, cz] = key.split(',').map(Number);
      if (cx < 0 || cz < 0 || cx >= WORLD_W || cz >= WORLD_D) continue;
      this._meshChunk(cx, cz);
    }
    this.dirty.clear();
  }

  _meshChunk(cx, cz) {
    const key = cx + ',' + cz;
    const old = this.chunkMeshes.get(key);
    const oldGlow = this.glowMeshes.get(key);
    const built = this._buildChunkGeometry(cx, cz);

    // replace/remove the solid pass
    if (built.solid) {
      if (old) { this.group.remove(old); old.geometry.dispose(); }
      const mesh = new THREE.Mesh(built.solid, this.material);
      mesh.name = 'chunk:' + key;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      // The geometry is built in ABSOLUTE world coordinates
      // (`ox + lx` in _buildChunkGeometry), so the mesh must sit at the
      // origin. Offsetting it by cx*CHUNK as well pushed every chunk
      // to twice its real position, which is why the rooms were never
      // visible from inside one: the walls you stood in were 16 blocks
      // away, and the geometry at your feet was somewhere else
      // entirely.
      mesh.position.set(0, 0, 0);
      mesh.userData.chunk = key;
      this.group.add(mesh);
      this.chunkMeshes.set(key, mesh);
    } else if (old) {
      this.group.remove(old); old.geometry.dispose();
      this.chunkMeshes.delete(key);
    }

    // replace/remove the emissive pass. Emissive blocks are meshed
    // separately into an unlit material so they glow on their own
    // instead of depending on the room lights reaching them.
    if (built.glow) {
      if (oldGlow) { this.group.remove(oldGlow); oldGlow.geometry.dispose(); }
      const mesh = new THREE.Mesh(built.glow, this.glowMaterial);
      mesh.name = 'glow:' + key;
      // absolute-coordinate geometry, same as the solid pass above
      mesh.position.set(0, 0, 0);
      mesh.userData.chunk = key;
      this.group.add(mesh);
      this.glowMeshes.set(key, mesh);
    } else if (oldGlow) {
      this.group.remove(oldGlow); oldGlow.geometry.dispose();
      this.glowMeshes.delete(key);
    }
  }

  _buildChunkGeometry(cx, cz) {
    const x0 = cx * CHUNK, z0 = cz * CHUNK;
    const S = { pos: [], uv: [], col: [], idx: [], nor: [] };
    const G = { pos: [], uv: [], col: [], idx: [], nor: [] };
    const solid = S, glow = G;
    let solidCount = 0, glowCount = 0;

    const ox = cx * CHUNK, oz = cz * CHUNK;

    for (let y = 0; y < this.h; y++) {
      for (let lz = 0; lz < CHUNK; lz++) {
        for (let lx = 0; lx < CHUNK; lx++) {
          const x = x0 + lx, z = z0 + lz;
          const id = this.get(x, y, z);
          if (id === AIR) continue;
          const tiles = FACE_TILES[id];
          if (!tiles) continue;

          /* Emissive blocks are emitted into the unlit `glow` pass.
             Everything else goes into the lit `solid` pass. */
          const isGlow = id === B.GLOW;
          const BUF = isGlow ? glow : solid;
          const vbase = isGlow ? glowCount : solidCount;

          for (let f = 0; f < 6; f++) {
            const face = FACES[f];
            const nx = x + face.dir[0], ny = y + face.dir[1], nz = z + face.dir[2];
            const nb = this.get(nx, ny, nz);
            if (nb !== AIR) {
              if (CULL_SELF.has(id) && nb === id) continue;
              if (!TRANSPARENT.has(id) && !TRANSPARENT.has(nb)) continue;
              if (TRANSPARENT.has(id) && nb === id) continue;
            }

            const tile = tiles[f];
            const { u0, u1, v0, v1 } = tileUV(tile);
            // per-face UV corners in the order of face.corners
            const uvs = [[u0, v0], [u1, v0], [u1, v1], [u0, v1]];

            // ambient occlusion from the 4 corners around this face
            const ao = [0, 0, 0, 0];
            for (let ci = 0; ci < 4; ci++) {
              const d = face.ao[ci];
              const s1 = this.get(x + face.dir[0] + d[0], y + face.dir[1] + d[1], z + face.dir[2] + d[2]);
              const c = face.corners[ci];
              const s2 = this.get(x + face.dir[0] + c[0], y + face.dir[1] + c[1], z + face.dir[2] + c[2]);
              const occluded = (s1 !== AIR && !TRANSPARENT.has(s1)) || (s2 !== AIR && !TRANSPARENT.has(s2));
              ao[ci] = occluded ? 0.52 : 1.0;
            }
            // flip quad triangulation to avoid the AO seam artifact
            const flip = ao[0] + ao[2] > ao[1] + ao[3] ? 1 : 0;

            // Per-face baked shading. Kept subtle on purpose: the real
            // illumination comes from the scene lights, and this is only
            // here to keep voxel faces legible against each other. Values
            // stay well above zero so no face can crush to pure black.
            const shade = face.dir[1] === 1 ? 1.0 : face.dir[1] === -1 ? 0.58
              : face.dir[0] === 1 ? 0.84 : face.dir[0] === -1 ? 0.80
              : face.dir[2] === 1 ? 0.90 : 0.86;

            /* Emissive blocks bypass lighting entirely (unlit pass) so
               their brightness is independent of the room lights. A
               modest face-shade and AO is still applied so a cluster of
               glowstone keeps its blocky form instead of blowing out to
               a flat white slab. */
            const emit = EMIT[id] ?? 1.0;
            const cap = isGlow ? 1.55 : 1.18;
            for (let ci = 0; ci < 4; ci++) {
              const c = face.corners[ci];
              BUF.pos.push(ox + lx + c[0], y + c[1], oz + lz + c[2]);
              BUF.nor.push(face.dir[0], face.dir[1], face.dir[2]);
              BUF.uv.push(uvs[ci][0], uvs[ci][1]);
              const l = Math.min(cap, shade * ao[ci] * emit);
              BUF.col.push(l, l, l);
            }
            const a = vbase, b = vbase + 1, c2 = vbase + 2, d2 = vbase + 3;
            /* Pick the diagonal by AO, but keep the winding CONSTANT.
               The flip case triangulates along b-d and the other along
               a-c, both in the corner order a,b,c,d. Emitting the other
               corner pair would flip the face's facing, and with
               side: FrontSide those triangles get culled - a wall
               right in front of the camera silently vanishing. */
            if (flip) BUF.idx.push(a, b, d2, b, c2, d2);
            else BUF.idx.push(a, b, c2, a, c2, d2);

            // advance to the next face's four corners. FOUR per face,
            // not 24: the old code stepped 4*6 per block while only
            // 4 vertices are emitted per face, so vbase raced ahead of
            // the position buffer and every index past the first face
            // pointed outside the geometry. Three.js's Uint16 index
            // buffer made that silent - the draw call succeeded and
            // the walls simply did not appear.
            if (isGlow) glowCount += 4; else solidCount += 4;
          }
        }
      }
    }

    return {
      solid: this._finishGeometry(solid),
      glow: this._finishGeometry(glow)
    };
  }

  _finishGeometry(BUF) {
    if (!BUF.pos.length) return null;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(BUF.pos, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(BUF.nor, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(BUF.uv, 2));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(BUF.col, 3));
    geo.setIndex(BUF.idx);
    geo.computeBoundingSphere();
    return geo;
  }

  /** True when a solid block occupies the voxel. */
  isSolid(x, y, z) {
    const b = this.get(Math.floor(x), Math.floor(y), Math.floor(z));
    if (b === AIR) return false;
    if (TRANSPARENT.has(b)) return false;
    return true;
  }
}
