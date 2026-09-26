/* ============================================================
   ROOMS — the world is a HUB of small floating rooms in a black
   void, not one connected structure.

   Shape of the layout (looking down, +x is right, +z is south):

        PROJECTS
           |
   ABOUT -+-+- SKILLS      <- satellites sit off the hub
           |
         HOME  (hub)
           |
   CONTACT -+-+- EXPERIENCE

   Every room is built inside its own tight footprint with a ragged
   island under it and a real gap of black void on all sides. The
   only things that connect them are 1-block-wide illuminated
   bridges, so the silhouette always reads as separate islands.

   Rooms also publish LIGHT ANCHORS: positions where main.js hangs
   real PointLights. The world is lit by those plus a low ambient
   floor, never by one global light.
   ============================================================ */

import { B, AIR, valueNoise } from './world.js';

/* Portal frame. Tall and narrow so it dominates the room it sits in,
   but it has to fit under the room's ceiling: the rooms are 6 tall and
   the portal is built at floor+1, so PORTAL_H must stay at or below 5
   or the arch punches through the roof. 5 gives a 6-block arch inside a
   6-block room — still the tallest, most dominant thing in view. */
const PORTAL_H = 5;
const PORTAL_W = 5;

/* Per-room block palette: [structure, floor, accent, emissive] */
const THEMES = {
  home:       { shell: B.OBSIDIAN,  floor: B.DEEPSLATE, accent: B.AMETHYST, glow: B.GLOW },
  about:      { shell: B.STONE,     floor: B.COBBLE,    accent: B.LAPIS,    glow: B.GLOW },
  skills:     { shell: B.DEEPSLATE, floor: B.STONE,     accent: B.EMERALD,  glow: B.GLOW },
  experience: { shell: B.COBBLE,    floor: B.DEEPSLATE, accent: B.COPPER,   glow: B.GLOW },
  projects:   { shell: B.STONE,     floor: B.COBBLE,    accent: B.AMETHYST, glow: B.GLOW },
  contact:    { shell: B.OBSIDIAN,  floor: B.DEEPSLATE, accent: B.AMETHYST, glow: B.GLOW }
};

/* ------------------------------------------------------------------
   Low-level voxel helpers
   ------------------------------------------------------------------ */

function fill(w, x0, y0, z0, x1, y1, z1, id) {
  for (let y = Math.min(y0, y1); y <= Math.max(y0, y1); y++)
    for (let z = Math.min(z0, z1); z <= Math.max(z0, z1); z++)
      for (let x = Math.min(x0, x1); x <= Math.max(x0, x1); x++)
        w.set(x, y, z, id, false);
}

/** Hollow room: floor, four walls, open ceiling ring, accent corner posts. */
function shell(w, cx, cz, half, y, h, t) {
  const inner = half - 1;
  fill(w, cx - half, y, cz - half, cx + half, y, cz + half, t.floor);

  // walls
  fill(w, cx - half, y, cz - half, cx - inner, y + h, cz + half, t.shell);
  fill(w, cx + inner, y, cz - half, cx + half, y + h, cz + half, t.shell);
  fill(w, cx - inner, y, cz - half, cx + inner, y + h, cz - inner, t.shell);
  fill(w, cx - inner, y, cz + inner, cx + inner, y + h, cz + half, t.shell);

  // Ceiling ring only — the centre stays open so the room is lit from
  // above and reads as a distinct volume rather than a sealed box.
  fill(w, cx - half, y + h, cz - half, cx + half, y + h, cz + half, t.shell);
  fill(w, cx - inner + 1, y + h, cz - inner + 1, cx + inner - 1, y + h, cz + inner - 1, AIR);

  // Corner posts in the accent block: a strong vertical read, and
  // they catch the portal light so the room's colour lands on real
  // geometry rather than on empty air.
  for (const dx of [-half, half])
    for (const dz of [-half, half])
      for (let k = 1; k <= h; k++) w.set(cx + dx, y + k, cz + dz, t.accent, false);

  // A light band one course under the ceiling: cheap, very readable
  // rim light that makes the ceiling line pop out of the dark.
  for (let dz = -half + 1; dz <= half - 1; dz++) {
    w.set(cx - half + 1, y + h - 1, cz + dz, t.glow, false);
    w.set(cx + half - 1, y + h - 1, cz + dz, t.glow, false);
  }
  for (let dx = -half + 1; dx <= half - 1; dx++) {
    w.set(cx + dx, y + h - 1, cz - half + 1, t.glow, false);
    w.set(cx + dx, y + h - 1, cz + half - 1, t.glow, false);
  }
  w._markDirtyAround(cx, y, cz);
}

/**
 * A ragged island of rock under a room. Tapers to nothing so each
 * room reads as a floating slab, not a column reaching the ground.
 */
function island(w, cx, cz, half, y, t) {
  for (let l = 0; l < 3; l++) {
    const yy = y - 1 - l;
    if (yy < 0) break;
    for (let dz = -half - 1 + l; dz <= half + 1 - l; dz++)
      for (let dx = -half - 1 + l; dx <= half + 1 - l; dx++) {
        const d = Math.max(Math.abs(dx), Math.abs(dz)) / (half + 1);
        const n = valueNoise(cx + dx * 3, cz + dz * 3, 7);
        if (d > 0.70 + n * 0.30) continue;
        if (n < 0.28 && d > 0.52) continue;
        w.set(cx + dx, yy, cz + dz, l === 0 ? t.floor : B.DEEPSLATE, false);
      }
  }
  // a few roots trailing off into nothing
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + 0.4;
    const rx = cx + Math.round(Math.cos(a) * (half - 1));
    const rz = cz + Math.round(Math.sin(a) * (half - 1));
    const len = 2 + ((valueNoise(rx, rz, 5) * 4) | 0);
    for (let k = 0; k < len; k++) {
      const yy = y - 4 - k;
      if (yy < 0) break;
      w.set(rx, yy, rz, B.DEEPSLATE, false);
    }
  }
  w._markDirtyAround(cx, y, cz);
}

/**
 * The portal. A gothic arch of the accent block with an emissive
 * spine. The middle lane stays open so the player can walk through
 * it into the room.
 *
 * `face` is the outward normal: 'n' (-z), 's' (+z), 'e' (+x), 'w' (-x).
 */
function portal(w, cx, cz, y, face, t) {
  const hw = Math.floor(PORTAL_W / 2);   // 2 -> frame is 5 wide
  const clear = hw - 1;                  // 3-block clear opening

  // place a block in the portal's local frame: `a` runs along the
  // opening (left-right), `b` runs through the wall (depth)
  const put = (a, dy, b, id) => {
    let x, z;
    switch (face) {
      case 'n': x = cx + a; z = cz - b; break;
      case 's': x = cx + a; z = cz + b; break;
      case 'e': x = cx + b; z = cz + a; break;
      default:  x = cx - b; z = cz + a; break;   // 'w'
    }
    w.set(x, y + dy, z, id, false);
  };

  // two side columns
  for (let dy = 0; dy <= PORTAL_H; dy++) {
    put(-hw, dy, 0, t.accent);
    put(hw, dy, 0, t.accent);
  }
  // lintel across the top, then a gothic taper course
  for (let a = -hw + 1; a <= hw - 1; a++) put(a, PORTAL_H, 0, t.accent);
  for (let a = -hw + 1; a <= hw - 1; a++) {
    put(a, PORTAL_H - 1, 0, a === 0 ? t.accent : t.shell);
    put(a, PORTAL_H - 2, 0, a === 0 ? t.accent : t.shell);
  }
  // Emissive spine inside the opening plus a bright sill. These
  // blocks are drawn unlit, so they read as a real light source.
  for (let dy = 2; dy < PORTAL_H - 2; dy++) {
    put(-1, dy, 0, t.glow);
    put(1, dy, 0, t.glow);
  }
  for (let a = -clear; a <= clear; a++) put(a, 0, 0, t.glow);
  put(0, 0, 0, AIR);            // one walking lane stays open

  w._markDirtyAround(cx, y, cz);
}

/**
 * A 1-block-wide illuminated bridge. Thin on purpose: it reads as a
 * thread of light, never as a road that could merge two rooms into
 * one mass. Deck at `y`, emissive kerb on top.
 */
function bridge(w, x0, z0, x1, z1, y, t) {
  const dx = Math.sign(x1 - x0), dz = Math.sign(z1 - z0);
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(z1 - z0));
  let x = x0, z = z0;
  for (let i = 0; i <= steps; i++) {
    w.set(x, y, z, t.glow, false);        // emissive deck
    w.set(x, y + 1, z, AIR, false);       // headroom to walk through
    x += dx; z += dz;
  }
  // lantern posts every 8 blocks: light sources along the path
  for (let i = 0; i <= steps; i += 8) {
    const px = x0 + dx * i, pz = z0 + dz * i;
    w.set(px, y + 1, pz, t.accent, false);
    w.set(px, y + 2, pz, t.glow, false);
    w.set(px, y + 3, pz, t.glow, false);
  }
  w._markDirtyAround(x0, y, z0);
  w._markDirtyAround(x1, y, z1);
}

/* ------------------------------------------------------------------
   Room interiors — each one a small themed diorama so the rooms read
   as different places, not six copies of the same box.
   ------------------------------------------------------------------ */

function furnish(w, cx, cz, y, kind, t, sx, sz) {
  const put = (dx, dy, dz, id) => w.set(cx + dx, y + dy, cz + dz, id, false);

  // The player spawns at the room centre, so keep a clear pocket THERE.
  // Without this the furnishings — the HOME dais, the SKILLS core column,
  // the EXPERIENCE timeline and the CONTACT console — are all built at
  // floor+1 and bury the player on arrival.
  //
  // THREE blocks tall, not two. The player is 1.62 tall and stands on
  // the floor at y+1, putting the eye at y+2.62 — i.e. inside the
  // third block. A camera enclosed by geometry renders only near-plane
  // faces, and with FrontSide culling that looks identical to "the
  // scene is not rendering at all". Clearing y+1..y+3 guarantees the
  // eye and the whole body column are in open air.
  //
  // dy starts at 1, not 0: dy=0 is the room FLOOR. Clearing it dropped
  // a 3x3 hole in the ground under the spawn.
  const clearSpawn = () => {
    const bx = Math.round(sx - 0.5), bz = Math.round(sz - 0.5);
    for (let dy = 1; dy < 4; dy++)
      for (let dz = -1; dz <= 1; dz++)
        for (let dx = -1; dx <= 1; dx++) w.set(bx + dx, y + dy, bz + dz, AIR, false);
  };

  if (kind === 'home') {
    // Dais and spire, pushed off to one side. They used to sit at the
    // exact centre — which is now the spawn — so the spire landed
    // inside the player's head and the camera rendered from within a
    // solid block. Off-centre keeps the focal point and frees the view.
    const ox = 3;
    fill(w, cx + ox - 1, y + 1, cz - 1, cx + ox + 1, y + 1, cz + 1, t.accent);
    put(ox, 2, 0, t.glow); put(ox, 3, 0, t.glow);
    // banner pillars at the diagonals
    for (const [dx, dz] of [[-3, -3], [3, -3], [-3, 3], [3, 3]]) {
      for (let k = 1; k <= 3; k++) put(dx, k, dz, t.accent);
      put(dx, 4, dz, t.glow);
    }
  }

  if (kind === 'about') {
    // two desks with lit monitors + a shelf of books
    for (const [dx, dz] of [[-3, -2], [3, 2]]) {
      fill(w, cx + dx - 1, y + 1, cz + dz - 1, cx + dx + 1, y + 1, cz + dz + 1, B.PLANK);
      put(dx, 2, dz, B.OBSIDIAN);
      put(dx, 3, dz, t.glow);
    }
    for (let i = 0; i < 4; i++) put(-4, 1 + (i % 2), -3 + i, t.accent);
  }

  if (kind === 'skills') {
    // four pillars and a green core column
    for (const [dx, dz] of [[-3, -3], [3, 3], [-3, 3], [3, -3]]) {
      for (let k = 1; k <= 4; k++) put(dx, k, dz, t.accent);
      put(dx, 5, dz, t.glow);
    }
    for (let k = 1; k <= 3; k++) put(0, k, 0, t.glow);
    put(0, 4, 0, t.accent);
  }

  if (kind === 'experience') {
    // stepped platforms reading as a timeline
    for (let s = 0; s < 3; s++) {
      const zz = -3 + s * 3;
      for (let k = 0; k <= s; k++)
        fill(w, cx - 2, y + 1 + k, cz + zz, cx + 2, y + 1 + k, cz + zz, t.accent);
      put(0, s + 2, zz, t.glow);
    }
  }

  if (kind === 'projects') {
    // a bank of monitors on the back wall
    for (let i = 0; i < 3; i++) {
      const dx = -2 + i * 2;
      put(dx, 1, -3, B.OBSIDIAN);
      put(dx, 2, -3, t.glow);
      put(dx, 1, -2, B.PLANK);
    }
    put(0, 1, 2, t.accent); put(1, 1, 2, t.accent);
    put(0, 2, 2, t.glow);
  }

  if (kind === 'contact') {
    // comms array: console + antenna mast
    fill(w, cx - 1, y + 1, cz - 1, cx + 1, y + 1, cz + 1, t.accent);
    for (let k = 1; k <= 3; k++) put(0, k + 1, 0, B.PLANK);
    put(0, 5, 0, t.glow);
    for (const [dx, dz] of [[-3, 3], [3, -3]]) {
      put(dx, 1, dz, t.glow);
      put(dx, 2, dz, t.accent);
    }
  }
  // Re-open the spawn pocket last, so no furnishing can seal the player in.
  clearSpawn();
  w._markDirtyAround(cx, y, cz);
}

/* ------------------------------------------------------------------
   Layout
   ------------------------------------------------------------------ */

/* Offsets from world centre. Wide on purpose: the big black gaps
   between rooms are the entire point of the composition.

   `h` is deliberately low. A first-person camera sits at eye height
   1.62, so a room only frames the player if the ceiling is within a
   few blocks of that: at h=8-9 the ceiling is 7 blocks up and the
   walls sink into a thin band with void above and below. h=6 puts the
   ceiling ~4.4 blocks over the eye, which keeps the room enclosing
   while still leaving the skylight ring open to the void. */
const LAYOUT = [
  { id: 'home',       dx:   0, dz:   0, half: 7, h: 6, face: 'n' },
  { id: 'about',      dx: -62, dz: -54, half: 6, h: 6, face: 'e' },
  { id: 'projects',   dx:   2, dz: -64, half: 6, h: 6, face: 's' },
  { id: 'skills',     dx:  62, dz: -50, half: 6, h: 6, face: 'w' },
  { id: 'experience', dx:  64, dz:  50, half: 6, h: 6, face: 'w' },
  { id: 'contact',    dx: -62, dz:  50, half: 6, h: 6, face: 'e' }
];

export const ROOM_LAYOUT = LAYOUT;

const DIRS = { n: [0, -1], s: [0, 1], e: [1, 0], w: [-1, 0] };

/* Two opposing quarter points, used as extra light anchors. Placed on a
   diagonal so each of the four walls has a wash within ~half a room,
   which is what stops inverse-square falloff from leaving whole walls
   unlit. Values are in blocks, relative to the room centre. */
const CORNERS = [[-3, -3], [3, 3]];

/** The wall block on a room's outward face. */
function faceOffset(face, half) {
  const [fx, fz] = DIRS[face];
  return { x: fx * half, z: fz * half };
}

/**
 * Build every room, its island, its portal and the bridges back to
 * the hub. Returns the trigger list, per-room metadata, the LIGHT
 * ANCHORS main.js needs, and the hub.
 */
export function buildRooms(world) {
  const CX = Math.floor(world.w / 2);
  const CZ = Math.floor(world.d / 2);
  const BASE_Y = 26;
  const triggers = [];
  const rooms = [];
  const lights = [];

  for (const r of LAYOUT) {
    const t = THEMES[r.id] || THEMES.home;
    const x = CX + r.dx;
    const z = CZ + r.dz;
    const y = BASE_Y;
    const isHub = r.id === 'home';

    // The portal goes on the wall that faces the hub, so following a
    // bridge takes you straight into that room's arch.
    const toHub = isHub ? r.face : (Math.abs(r.dx) > Math.abs(r.dz)
      ? (r.dx > 0 ? 'w' : 'e')
      : (r.dz > 0 ? 'n' : 's'));
    const portalFace = toHub;
    const fo = faceOffset(portalFace, r.half);

    // The player spawns at the room's centre, where the walls are only
    // ~half a room away in every direction. Spawning back at the arch
    // (as this once did) leaves the far wall 11 blocks off, and a
    // 6-block room cannot fill a 72-degree frame from that range.
    //
    // The pocket must be TWO blocks tall. The player is 1.62 tall and
    // stands on the floor at y+1, so the eye sits at y+2.62 — i.e.
    // inside the second block. Clearing only y+1 buried the camera
    // inside geometry, and with FrontSide culling you then see straight
    // through the room into the void, which looks exactly like "the
    // scene is not rendering".
    const spawnPt = { x: x + 0.5, y: y + 1.2, z: z + 0.5 };

    island(world, x, z, r.half, y, t);
    shell(world, x, z, r.half, y, r.h, t);
    furnish(world, x, z, y, r.id, t, spawnPt.x, spawnPt.z);
    portal(world, x + fo.x, z + fo.z, y + 1, portalFace, t);

    /* ---- light anchors ----------------------------------------
       Real PointLights, hung by main.js. Five per room:

         portal - in the throat, throws its colour onto the frame and
                  the floor just outside
         core   - over the centre, lights the interior and furnishings
         fill   - low and soft so nothing bottoms out
         two corner washes - see the note below

       Inverse-square falloff is brutal at room scale. With only the
       three lights above, a wall 2 blocks from the portal light reads
       E~54 while the wall directly opposite reads E~1.7: a 30x
       hotspot swing that left most of every room near-black. The two
       corner washes sit at opposing quarter points so each of the
       four walls gets one close to it, flattening the falloff. */
    lights.push({
      room: r.id, kind: 'portal',
      pos: {
        x: x + fo.x - DIRS[portalFace][0] * 1.5,
        y: y + 5.0,
        z: z + fo.z - DIRS[portalFace][1] * 1.5
      },
      intensity: 210, distance: 36, phase: (x * 0.13 + z * 0.07) % 6.28
    });
    lights.push({
      room: r.id, kind: 'core',
      pos: { x: x + 0.5, y: y + r.h - 0.5, z: z + 0.5 },
      intensity: 380, distance: 44, phase: (x * 0.07 - z * 0.11) % 6.28
    });
    lights.push({
      room: r.id, kind: 'fill',
      pos: { x: x + 0.5, y: y + 2.2, z: z + 0.5 },
      intensity: 130, distance: 28, phase: 0
    });
    for (const [ox, oz] of CORNERS) {
      lights.push({
        room: r.id, kind: 'wash',
        pos: { x: x + 0.5 + ox, y: y + 2.6, z: z + 0.5 + oz },
        intensity: 165, distance: 26, phase: (x * 0.05 + z * 0.09 + ox) % 6.28
      });
    }

    triggers.push({ id: r.id, x, z, y, r: r.half + 1 });
    // `spawn` is the room centre: see the note on `spawnPt` above.
    rooms.push({
      id: r.id, x, z, y, half: r.half, h: r.h,
      face: portalFace,
      spawn: spawnPt
    });
  }

  /* ---- bridges: every room back to the hub --------------------- */
  const hub = rooms[0];
  for (let i = 1; i < rooms.length; i++) {
    const r = rooms[i];
    const t = THEMES[r.id] || THEMES.home;
    const dx = r.x - hub.x, dz = r.z - hub.z;
    const len = Math.hypot(dx, dz);
    const ux = dx / len, uz = dz / len;
    // start just outside the room's island, end just off the hub
    const sx = Math.round(r.x + ux * (r.half + 2));
    const sz = Math.round(r.z + uz * (r.half + 2));
    const ex = Math.round(hub.x - ux * (hub.half + 2));
    const ez = Math.round(hub.z - uz * (hub.half + 2));
    bridge(world, sx, sz, ex, ez, hub.y, t);

    // A light on the bridge, mid-span, so the path is lit along its
    // length instead of fading to black halfway across.
    lights.push({
      room: r.id, kind: 'bridge',
      pos: {
        x: (sx + ex) / 2 + 0.5,
        y: hub.y + 2.5,
        z: (sz + ez) / 2 + 0.5
      },
      intensity: 90, distance: 34, phase: len * 0.03
    });
  }

  /* ---- lone shards drifting in the gaps -----------------------
     Sparse on purpose: depth cues in the void without filling the
     negative space that makes the rooms read as separate. */
  shard(world, CX + 26, BASE_Y + 10, CZ - 34, 2, B.DEEPSLATE);
  shard(world, CX - 30, BASE_Y - 9, CZ + 30, 2, B.OBSIDIAN);
  shard(world, CX + 34, BASE_Y + 6, CZ + 30, 1, B.DEEPSLATE);

  return { triggers, rooms, hub, lights };
}

/** A small lone chunk of rock drifting in the void. */
function shard(world, x, y, z, size, id) {
  for (let dy = 0; dy <= size; dy++)
    for (let dz = -size; dz <= size; dz++)
      for (let dx = -size; dx <= size; dx++) {
        if (Math.abs(dx) + Math.abs(dz) > size + 1) continue;
        world.set(x + dx, y - dy, z + dz, id, false);
      }
  world._markDirtyAround(x, y, z);
}
