/* ============================================================
   TEXTURES — every block texture is drawn procedurally on a
   16x16 canvas at load time. No image files, no ripped assets:
   the look comes from per-pixel noise + hand-placed speckles.
   ============================================================ */

import * as THREE from 'three';

export const TILE = 16;                 // px per tile in the atlas
export const COLS = 16;                 // atlas is COLS x COLS tiles
export const ATLAS_PX = TILE * COLS;

/* ---- tile name -> index (row-major) ---- */
export const TILES = {
  grass_top: 0, dirt: 1, grass_side: 2, stone: 3, cobble: 4,
  sand: 5, log_side: 6, log_top: 7, leaves: 8, planks: 9,
  amethyst: 10, copper: 11, lapis: 12, diamond: 13, emerald: 14,
  bricks: 15, glass: 16, water: 17, snow: 18, gravel: 19,
  glowstone: 20, wool: 21, obsidian: 22, deepslate: 23
};
export const TILE_COUNT = 24;

const clamp255 = v => v < 0 ? 0 : v > 255 ? 255 : v | 0;

function px(ctx, x, y, rgb, a = 255) {
  ctx.fillStyle = `rgba(${clamp255(rgb[0])},${clamp255(rgb[1])},${clamp255(rgb[2])},${a / 255})`;
  ctx.fillRect(x, y, 1, 1);
}

/** Deterministic per-tile RNG so the world looks the same every reload. */
function mulberry(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/** base colour + variance speckle: the backbone of every block. */
function grain(ctx, ox, oy, base, amount, seed, cluster = 1) {
  const rnd = mulberry(seed);
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const n = (rnd() - 0.5) * 2 * amount;
      // cluster pushes a few pixels darker, gives it hand-painted depth
      const c = rnd() < 0.06 * cluster ? n * 1.9 : n;
      px(ctx, ox + x, oy + y, [base[0] + c, base[1] + c, base[2] + c]);
    }
  }
}

function blobby(ctx, ox, oy, base, spots, seed, size = 1) {
  const rnd = mulberry(seed);
  for (let i = 0; i < spots; i++) {
    const x = (rnd() * TILE) | 0, y = (rnd() * TILE) | 0;
    const d = (rnd() - 0.5) * 34;
    for (let j = 0; j < size; j++) {
      px(ctx, ox + (x + j) % TILE, oy + y, [base[0] + d, base[1] + d, base[2] + d]);
    }
  }
}

function rect(ctx, ox, oy, x, y, w, h, rgb, a = 255) {
  ctx.fillStyle = `rgba(${clamp255(rgb[0])},${clamp255(rgb[1])},${clamp255(rgb[2])},${a / 255})`;
  ctx.fillRect(ox + x, oy + y, w, h);
}

/* ------------------------------------------------------------------
   Individual painters. All original art.
   ------------------------------------------------------------------ */
const PAINT = {
  grass_top(c, ox, oy) {
    grain(c, ox, oy, [96, 158, 68], 13, 11, 2);
    blobby(c, ox, oy, [80, 142, 58], 26, 12, 2);
    blobby(c, ox, oy, [120, 180, 84], 18, 13, 1);
  },
  dirt(c, ox, oy) {
    grain(c, ox, oy, [134, 96, 67], 15, 21, 1);
    blobby(c, ox, oy, [110, 78, 53], 20, 22, 2);
  },
  grass_side(c, ox, oy) {
    PAINT.dirt(c, ox, oy);
    // ragged grass lip
    const rnd = mulberry(31);
    for (let x = 0; x < TILE; x++) {
      const h = 3 + ((rnd() * 3) | 0);
      for (let y = 0; y < h; y++) {
        const d = (rnd() - 0.5) * 26;
        px(c, ox + x, oy + y, [96 + d, 158 + d, 68 + d]);
      }
    }
    for (let x = 0; x < TILE; x++) if (rnd() < 0.5) {
      const d = (rnd() - 0.5) * 30;
      px(c, ox + x, oy + 4, [92 + d, 152 + d, 64 + d]);
    }
  },
  stone(c, ox, oy) {
    grain(c, ox, oy, [128, 128, 132], 11, 41);
    blobby(c, ox, oy, [112, 112, 117], 22, 42, 3);
  },
  cobble(c, ox, oy) {
    grain(c, ox, oy, [120, 120, 124], 8, 51);
    const rnd = mulberry(52);
    // irregular stones with dark mortar gaps
    const stones = [[0, 0, 7, 6], [8, 0, 8, 5], [0, 7, 5, 9], [6, 6, 10, 5], [6, 12, 6, 4], [13, 6, 3, 10], [13, 0, 3, 5]];
    for (const [x, y, w, h] of stones) {
      const d = (rnd() - 0.5) * 26;
      rect(c, ox, oy, x, y, w, h, [136 + d, 136 + d, 140 + d]);
    }
    for (let i = 0; i < 40; i++) {
      const d = (rnd() - 0.5) * 22;
      px(c, ox + ((rnd() * TILE) | 0), oy + ((rnd() * TILE) | 0), [126 + d, 126 + d, 130 + d]);
    }
  },
  sand(c, ox, oy) {
    grain(c, ox, oy, [222, 205, 155], 10, 61);
    blobby(c, ox, oy, [206, 188, 138], 18, 62, 1);
  },
  log_side(c, ox, oy) {
    grain(c, ox, oy, [110, 82, 50], 8, 71, 0);
    const rnd = mulberry(72);
    for (let x = 0; x < TILE; x++) {
      if (rnd() < 0.45) {
        const y0 = (rnd() * 10) | 0, h = 4 + ((rnd() * 8) | 0);
        const d = (rnd() - 0.5) * 24;
        for (let y = y0; y < Math.min(TILE, y0 + h); y++)
          px(c, ox + x, oy + y, [96 + d, 70 + d, 42 + d]);
      }
    }
  },
  log_top(c, ox, oy) {
    grain(c, ox, oy, [166, 130, 84], 9, 73);
    const rnd = mulberry(74);
    const cx = 7.5, cy = 7.5;
    for (let y = 0; y < TILE; y++) for (let x = 0; x < TILE; x++) {
      const r = Math.hypot(x - cx, y - cy);
      if (r > 3 && r < 6.5 && rnd() < 0.6) {
        const d = (rnd() - 0.5) * 22;
        px(c, ox + x, oy + y, [128 + d, 96 + d, 58 + d]);
      }
    }
  },
  leaves(c, ox, oy) {
    const rnd = mulberry(81);
    for (let y = 0; y < TILE; y++) for (let x = 0; x < TILE; x++) {
      const v = rnd();
      // holes at the edges read as a leafy silhouette once alpha-tested
      const edge = (x === 0 || y === 0 || x === 15 || y === 15) && v < 0.28;
      if (edge) { c.clearRect(ox + x, oy + y, 1, 1); continue; }
      const d = (v - 0.5) * 40;
      px(c, ox + x, oy + y, [58 + d, 122 + d, 44 + d]);
    }
  },
  planks(c, ox, oy) {
    grain(c, ox, oy, [176, 137, 88], 8, 91, 0);
    const rnd = mulberry(92);
    for (const y of [0, 4, 8, 12]) rect(c, ox, oy, 0, y, TILE, 1, [120, 90, 54], 235);
    for (let y = 0; y < TILE; y++) for (let x = 0; x < TILE; x++) {
      const d = (rnd() - 0.5) * 16;
      px(c, ox + x, oy + y, [176 + d, 137 + d, 88 + d]);
    }
    for (const x of [5, 11]) for (const y of [0, 4, 8, 12]) rect(c, ox, oy, x, y + 1, 1, 3, [120, 90, 54], 150);
  },
  amethyst(c, ox, oy) {
    grain(c, ox, oy, [126, 84, 168], 12, 101, 2);
    blobby(c, ox, oy, [162, 120, 200], 14, 102, 2);
    blobby(c, ox, oy, [96, 62, 134], 10, 103, 1);
  },
  copper(c, ox, oy) {
    grain(c, ox, oy, [200, 118, 66], 11, 111, 2);
    const rnd = mulberry(112);
    // faint verdigris patches: copper oxidising
    for (let i = 0; i < 7; i++) {
      const x = (rnd() * 14) | 0, y = (rnd() * 14) | 0;
      rect(c, ox, oy, x, y, 2, 2, [96, 168, 140], 120);
    }
  },
  lapis(c, ox, oy) {
    grain(c, ox, oy, [42, 82, 168], 12, 121, 2);
    blobby(c, ox, oy, [62, 108, 200], 14, 122, 2);
    blobby(c, ox, oy, [28, 58, 130], 12, 123, 1);
  },
  diamond(c, ox, oy) {
    grain(c, ox, oy, [88, 214, 216], 10, 131, 2);
    const rnd = mulberry(132);
    for (let i = 0; i < 10; i++) {
      const x = (rnd() * 12) | 0, y = (rnd() * 12) | 0;
      const d = 30 + rnd() * 40;
      rect(c, ox, oy, x, y, 2, 2, [140 + d, 240, 242 + d * 0.4]);
    }
    for (let i = 0; i < 8; i++) {
      const x = (rnd() * 13) | 0, y = (rnd() * 13) | 0;
      rect(c, ox, oy, x, y, 1, 1, [40, 140, 150], 180);
    }
  },
  emerald(c, ox, oy) {
    grain(c, ox, oy, [56, 178, 96], 11, 141, 2);
    blobby(c, ox, oy, [90, 214, 130], 12, 142, 2);
    blobby(c, ox, oy, [34, 134, 70], 10, 143, 1);
  },
  bricks(c, ox, oy) {
    grain(c, ox, oy, [150, 84, 68], 7, 151, 0);
    rect(c, ox, oy, 0, 0, TILE, 1, [186, 186, 186], 190);
    rect(c, ox, oy, 0, 8, TILE, 1, [186, 186, 186], 190);
    rect(c, ox, oy, 0, 4, 1, 4, [186, 186, 186], 190);
    rect(c, ox, oy, 8, 12, 1, 4, [186, 186, 186], 190);
    rect(c, ox, oy, 4, 0, 1, 4, [186, 186, 186], 190);
    rect(c, ox, oy, 12, 8, 1, 4, [186, 186, 186], 190);
  },
  glass(c, ox, oy) {
    c.clearRect(ox, oy, TILE, TILE);
    const rnd = mulberry(161);
    rect(c, ox, oy, 0, 0, TILE, 1, [206, 232, 240], 205);
    rect(c, ox, oy, 0, 15, TILE, 1, [206, 232, 240], 205);
    rect(c, ox, oy, 0, 0, 1, TILE, [206, 232, 240], 205);
    rect(c, ox, oy, 15, 0, 1, TILE, [206, 232, 240], 205);
    rect(c, ox, oy, 3, 3, 4, 1, [255, 255, 255], 90);
    rect(c, ox, oy, 3, 4, 1, 3, [255, 255, 255], 70);
    for (let i = 0; i < 10; i++) px(c, ox + ((rnd() * TILE) | 0), oy + ((rnd() * TILE) | 0), [230, 246, 250], 60 + rnd() * 70);
  },
  water(c, ox, oy) {
    grain(c, ox, oy, [58, 118, 196], 8, 171, 1);
    const rnd = mulberry(172);
    for (let y = 1; y < TILE; y += 4) for (let x = 0; x < TILE; x++) {
      if (rnd() < 0.5) rect(c, ox, oy, x, y, 1, 1, [110, 170, 226], 170);
    }
  },
  snow(c, ox, oy) {
    grain(c, ox, oy, [242, 246, 250], 6, 181);
    blobby(c, ox, oy, [226, 234, 244], 12, 182, 1);
  },
  gravel(c, ox, oy) {
    grain(c, ox, oy, [126, 122, 118], 16, 191, 2);
    blobby(c, ox, oy, [96, 92, 90], 26, 192, 2);
    blobby(c, ox, oy, [156, 152, 148], 14, 193, 1);
  },
  glowstone(c, ox, oy) {
    grain(c, ox, oy, [206, 164, 88], 10, 201, 1);
    const rnd = mulberry(202);
    for (let i = 0; i < 16; i++) {
      const x = 1 + ((rnd() * 13) | 0), y = 1 + ((rnd() * 13) | 0);
      rect(c, ox, oy, x, y, 2, 2, [255, 232, 160]);
      px(c, ox + x - 1, oy + y - 1, [255, 216, 120], 120);
    }
  },
  wool(c, ox, oy) {
    grain(c, ox, oy, [232, 232, 236], 8, 211, 1);
    const rnd = mulberry(212);
    for (let i = 0; i < 24; i++) {
      const x = (rnd() * TILE) | 0, y = (rnd() * TILE) | 0;
      rect(c, ox, oy, x, y, 2, 1, [214, 214, 220], 160);
    }
  },
  obsidian(c, ox, oy) {
    // Raised well above true black. Obsidian is used as a wall block in
    // several rooms, and at its original [24,20,34] (~1% linear) it
    // stayed black under any amount of light — the room read as a hole.
    // It is still the darkest block in the palette, but now it holds
    // its purple hue and takes a highlight.
    grain(c, ox, oy, [58, 47, 79], 8, 221, 1);
    const rnd = mulberry(222);
    for (let i = 0; i < 11; i++) {
      const x = (rnd() * 13) | 0, y = (rnd() * 13) | 0;
      rect(c, ox, oy, x, y, 1, 1, [128, 98, 186], 200);
    }
  },
  deepslate(c, ox, oy) {
    grain(c, ox, oy, [92, 90, 104], 11, 231, 2);
    blobby(c, ox, oy, [72, 70, 84], 20, 232, 2);
  }
};

/** Build the atlas texture. Nearest filtering keeps it crisp and blocky. */
export function buildAtlas() {
  const cv = document.createElement('canvas');
  cv.width = cv.height = ATLAS_PX;
  const ctx = cv.getContext('2d', { willReadFrequently: false });
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, ATLAS_PX, ATLAS_PX);

  for (const name in TILES) {
    const i = TILES[name];
    const ox = (i % COLS) * TILE, oy = ((i / COLS) | 0) * TILE;
    ctx.save();
    ctx.beginPath();
    ctx.rect(ox, oy, TILE, TILE);
    ctx.clip();
    PAINT[name](ctx, ox, oy);
    ctx.restore();
  }

  const tex = new THREE.CanvasTexture(cv);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestMipmapNearestFilter;
  tex.generateMipmaps = true;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.anisotropy = 4;
  return { texture: tex, canvas: cv };
}

/**
 * UV rect for a tile index, inset by half a texel to stop neighbouring
 * tiles bleeding in under mipmapping.
 */
const E = 0.5 / ATLAS_PX;
export function tileUV(i) {
  const cx = (i % COLS) * TILE, cy = ((i / COLS) | 0) * TILE;
  return {
    u0: cx / ATLAS_PX + E, u1: (cx + TILE) / ATLAS_PX - E,
    // canvas Y grows downward, texture V grows upward -> flip
    v0: 1 - (cy + TILE) / ATLAS_PX + E, v1: 1 - cy / ATLAS_PX - E
  };
}

/** Draw a single tile onto a fresh canvas — used for HUD/inventory icons. */
export function tileCanvas(name, scale = 4) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = TILE * scale;
  const ctx = cv.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.save();
  ctx.scale(scale, scale);
  PAINT[name](ctx, 0, 0);
  ctx.restore();
  return cv;
}
