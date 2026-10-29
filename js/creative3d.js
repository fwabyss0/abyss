/**
 * ============================================================================
 * CREATIVE 3D ENGINE & SPATIAL INTERACTION SPECIALIST
 * Alish Shrestha (Abyss) — Portfolio Elevation
 * 
 * Includes:
 * 1. Spatial 3D Canvas Scene (#spatial-canvas-3d):
 *    - Ambient Volumetric Depth Light Orbs (Floating Chromatic Lighting)
 *    - 3D Drifting Quantum Dust & Constellation Web with Scroll Parallax
 * 2. Hero 3D Geometric Sculpture (#hero-3d-sculpture-canvas):
 *    - Translucent Glass Icosahedron with 20 Refractive Facets
 *    - Dual Counter-Rotating Amber Intelligence Core
 *    - Interlocking Metallic Orbital Rings with Quantum Satellite Beads
 *    - Pointer-Responsive Inertia & Spring Damping
 * 3. Perspective 3D Card Tilt with Dynamic Specular Glare
 * 4. Magnetic Button Dynamics for Primary Interactive CTAs
 * 5. Multi-Plane Spatial Parallax for Hero Scrapbook Floating Elements
 * 6. Scroll-Triggered Fluid 3D Reveals via IntersectionObserver
 * 7. Dynamic Glass Specular Spotlight Tracking
 * ============================================================================
 */

export function initCreative3DElevation() {
  initSpatialCanvas3D();
  initHeroSculpture3D();
  initCard3DTilt();
  initMagneticButtons();
  initHeroSpatialParallax();
  initScrollReveal();
  initGlassSpotlight();
}

/**
 * --------------------------------------------------------------------------
 * 1. SPATIAL 3D CANVAS SCENE (FULL-VIEWPORT BACKGROUND)
 * Lightweight, zero-dependency, GPU-accelerated background rendering:
 * - Floating Volumetric Ambient Light Orbs
 * - 3D Drifting Quantum Dust & Constellation Web with Scroll Parallax
 * --------------------------------------------------------------------------
 */
function initSpatialCanvas3D() {
  const canvas = document.getElementById('spatial-canvas-3d');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();

  // Mouse & Scroll Tracking
  const pointer = {
    x: width * 0.5,
    y: height * 0.35,
    targetX: width * 0.5,
    targetY: height * 0.35
  };

  let scrollOffset = window.scrollY;
  let targetScrollOffset = window.scrollY;

  window.addEventListener('scroll', () => {
    targetScrollOffset = window.scrollY;
  }, { passive: true });

  window.addEventListener('pointermove', (e) => {
    pointer.targetX = e.clientX;
    pointer.targetY = e.clientY;
  }, { passive: true });

  // ------------------------------------------------------------------------
  // A. Volumetric Chromatic Light Orbs (Floating Ambient Lighting)
  // ------------------------------------------------------------------------
  const orbs = [
    {
      x: width * 0.15,
      y: height * 0.25,
      baseX: 0.15,
      baseY: 0.25,
      radius: Math.min(width, height) * 0.44,
      color: 'rgba(0, 102, 255, 0.065)', // Electric Blue
      speed: 0.0006,
      angle: 0
    },
    {
      x: width * 0.85,
      y: height * 0.42,
      baseX: 0.85,
      baseY: 0.42,
      radius: Math.min(width, height) * 0.4,
      color: 'rgba(56, 189, 248, 0.075)', // Soft Cyan
      speed: 0.0008,
      angle: Math.PI * 0.7
    },
    {
      x: width * 0.5,
      y: height * 0.88,
      baseX: 0.5,
      baseY: 0.88,
      radius: Math.min(width, height) * 0.48,
      color: 'rgba(255, 241, 104, 0.05)', // Warm Sticky Amber
      speed: 0.0007,
      angle: Math.PI * 1.4
    }
  ];

  // ------------------------------------------------------------------------
  // B. 3D Drifting Quantum Particle Dust & Constellation Web
  // ------------------------------------------------------------------------
  const isMobile = width < 768;
  const particleCount = isMobile ? 24 : 52;
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: (Math.random() - 0.5) * width * 1.4,
      y: (Math.random() - 0.5) * height * 2.4,
      z: 50 + Math.random() * 700,
      radius: 1.2 + Math.random() * 2.0,
      baseAlpha: 0.25 + Math.random() * 0.5,
      speedX: (Math.random() - 0.5) * 0.25,
      speedY: (Math.random() - 0.5) * 0.25,
      pulseSpeed: 0.02 + Math.random() * 0.03,
      pulsePhase: Math.random() * Math.PI * 2,
      colorType: Math.random() > 0.4 ? 'blue' : (Math.random() > 0.5 ? 'cyan' : 'amber')
    });
  }

  function project3D(x, y, z, cx, cy, fov, dist) {
    const factor = fov / (dist + z);
    return [x * factor + cx, y * factor + cy, factor, z];
  }

  let animId = null;

  function render() {
    scrollOffset += (targetScrollOffset - scrollOffset) * 0.08;
    pointer.x += (pointer.targetX - pointer.x) * 0.05;
    pointer.y += (pointer.targetY - pointer.y) * 0.05;

    ctx.clearRect(0, 0, width, height);

    // 1. Draw Volumetric Ambient Light Orbs
    for (let i = 0; i < orbs.length; i++) {
      const orb = orbs[i];
      orb.angle += orb.speed;
      const wobbleX = Math.sin(orb.angle) * 75;
      const wobbleY = Math.cos(orb.angle * 0.8) * 60;

      const pointerShiftX = (pointer.x - width * 0.5) * 0.035;
      const pointerShiftY = (pointer.y - height * 0.5) * 0.035;
      const scrollShiftY = -scrollOffset * 0.14;

      const currentX = orb.baseX * width + wobbleX + pointerShiftX;
      const currentY = orb.baseY * height + wobbleY + pointerShiftY + scrollShiftY;

      const grad = ctx.createRadialGradient(currentX, currentY, 0, currentX, currentY, orb.radius);
      grad.addColorStop(0, orb.color);
      grad.addColorStop(0.55, orb.color.replace(/[\d\.]+\)$/, '0.02)'));
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(currentX, currentY, orb.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Draw 3D Drifting Quantum Particle Dust & Constellation Web
    const fov = 420;
    const dist = 500;
    const projectedParticles = [];

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      if (!prefersReducedMotion) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulsePhase += p.pulseSpeed;
      }

      if (p.x < -width * 0.7) p.x = width * 0.7;
      if (p.x > width * 0.7) p.x = -width * 0.7;
      if (p.y < -height * 1.2) p.y = height * 1.2;
      if (p.y > height * 1.2) p.y = -height * 1.2;

      const scrollParallaxY = p.y - (scrollOffset * (fov / (dist + p.z)) * 0.35);
      const mouseParallaxX = p.x + ((pointer.x - width * 0.5) * (1 - p.z / 900) * 0.12);
      const mouseParallaxY = scrollParallaxY + ((pointer.y - height * 0.5) * (1 - p.z / 900) * 0.12);

      const [projX, projY, scale] = project3D(
        mouseParallaxX,
        mouseParallaxY,
        p.z,
        width * 0.5,
        height * 0.5,
        fov,
        dist
      );

      if (projX >= -20 && projX <= width + 20 && projY >= -20 && projY <= height + 20) {
        const pulse = Math.sin(p.pulsePhase) * 0.2;
        const alpha = Math.max(0.08, Math.min(0.85, (p.baseAlpha + pulse) * scale * 1.2));
        projectedParticles.push({ x: projX, y: projY, z: p.z, scale, alpha, colorType: p.colorType });

        ctx.beginPath();
        ctx.arc(projX, projY, p.radius * scale, 0, Math.PI * 2);

        if (p.colorType === 'blue') {
          ctx.fillStyle = `rgba(0, 102, 255, ${alpha})`;
        } else if (p.colorType === 'cyan') {
          ctx.fillStyle = `rgba(56, 189, 248, ${alpha})`;
        } else {
          ctx.fillStyle = `rgba(245, 158, 11, ${alpha * 0.8})`;
        }
        ctx.fill();
      }
    }

    // Connect close nodes in 3D space with subtle constellation threads
    const maxLinkDist = isMobile ? 80 : 115;
    ctx.lineWidth = 0.75;
    for (let i = 0; i < projectedParticles.length; i++) {
      for (let j = i + 1; j < projectedParticles.length; j++) {
        const p1 = projectedParticles[i];
        const p2 = projectedParticles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const dist2D = Math.hypot(dx, dy);

        if (dist2D < maxLinkDist && Math.abs(p1.z - p2.z) < 180) {
          const lineAlpha = (1 - dist2D / maxLinkDist) * Math.min(p1.alpha, p2.alpha) * 0.45;
          ctx.strokeStyle = `rgba(0, 102, 255, ${lineAlpha})`;
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    if (!document.hidden) {
      animId = requestAnimationFrame(render);
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      animId = requestAnimationFrame(render);
    } else if (animId) {
      cancelAnimationFrame(animId);
    }
  });

  animId = requestAnimationFrame(render);
}

/**
 * --------------------------------------------------------------------------
 * 2. HERO 3D GEOMETRIC SCULPTURE (#hero-3d-sculpture-canvas)
 * Renders right in the center of the hero card, behind the headline:
 * - 3D Translucent Glass Icosahedron with 20 Refractive Facets
 * - Counter-Rotating Amber Intelligence Core
 * - Interlocking Metallic Orbital Rings with Quantum Satellite Beads
 * - Interactive pointer tilt with inertia & spring damping
 * --------------------------------------------------------------------------
 */
function initHeroSculpture3D() {
  const canvas = document.getElementById('hero-3d-sculpture-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let width = 0;
  let height = 0;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();

  // ------------------------------------------------------------------------
  // A. Mathematical Icosahedron Geometry (12 vertices, 30 edges, 20 faces)
  // ------------------------------------------------------------------------
  const phi = (1 + Math.sqrt(5)) * 0.5; // Golden Ratio (~1.618)
  const baseVertices = [
    [-1,  phi, 0], [ 1,  phi, 0], [-1, -phi, 0], [ 1, -phi, 0],
    [ 0, -1,  phi], [ 0,  1,  phi], [ 0, -1, -phi], [ 0,  1, -phi],
    [ phi, 0, -1], [ phi, 0,  1], [-phi, 0, -1], [-phi, 0,  1]
  ];

  // Normalize vertices to unit sphere
  const icoVertices = baseVertices.map(v => {
    const len = Math.hypot(v[0], v[1], v[2]);
    return [v[0] / len, v[1] / len, v[2] / len];
  });

  // 30 unique edges
  const icoEdges = [];
  for (let i = 0; i < icoVertices.length; i++) {
    for (let j = i + 1; j < icoVertices.length; j++) {
      const dx = icoVertices[i][0] - icoVertices[j][0];
      const dy = icoVertices[i][1] - icoVertices[j][1];
      const dz = icoVertices[i][2] - icoVertices[j][2];
      if (Math.abs(Math.hypot(dx, dy, dz) - 1.05146) < 0.15) {
        icoEdges.push([i, j]);
      }
    }
  }

  // 20 Triangular Faces
  const icoFaces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
  ];

  // Core scaled vertices
  const coreScale = 0.52;
  const coreVertices = icoVertices.map(v => [v[0] * coreScale, v[1] * coreScale, v[2] * coreScale]);

  // Mouse tilt tracking with inertia & spring physics
  const pointer = {
    targetX: 0,
    targetY: 0,
    currX: 0,
    currY: 0,
    isHoveringGear: false
  };

  const heroCard = document.querySelector('.hero-card');
  if (heroCard) {
    heroCard.addEventListener('pointermove', (e) => {
      const rect = heroCard.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      pointer.targetX = normX * 0.95;
      pointer.targetY = -normY * 0.95;
    }, { passive: true });

    heroCard.addEventListener('pointerleave', () => {
      pointer.targetX = 0;
      pointer.targetY = 0;
    });

    const gearSlot = heroCard.querySelector('.gear-slot');
    if (gearSlot) {
      gearSlot.addEventListener('pointerenter', () => {
        pointer.isHoveringGear = true;
      });
      gearSlot.addEventListener('pointerleave', () => {
        pointer.isHoveringGear = false;
      });
    }
  }

  // 3D Matrix Transformations
  function rotate3D(x, y, z, rx, ry, rz) {
    // X
    let y1 = y * Math.cos(rx) - z * Math.sin(rx);
    let z1 = y * Math.sin(rx) + z * Math.cos(rx);
    // Y
    let x2 = x * Math.cos(ry) + z1 * Math.sin(ry);
    let z2 = -x * Math.sin(ry) + z1 * Math.cos(ry);
    // Z
    let x3 = x2 * Math.cos(rz) - y1 * Math.sin(rz);
    let y3 = x2 * Math.sin(rz) + y1 * Math.cos(rz);
    return [x3, y3, z2];
  }

  function project3D(x, y, z, cx, cy, fov, dist) {
    const factor = fov / (dist + z);
    return [x * factor + cx, y * factor + cy, factor, z];
  }

  // Rotation State
  let rotX = 0.35;
  let rotY = 0.55;
  let rotZ = 0.15;
  let pulse = 0;
  let gearLuminescence = 0;
  let animId = null;

  function render() {
    // Spring physics on pointer
    pointer.currX += (pointer.targetX - pointer.currX) * 0.08;
    pointer.currY += (pointer.targetY - pointer.currY) * 0.08;

    if (!prefersReducedMotion) {
      rotX += 0.004 + pointer.currY * 0.012;
      rotY += 0.006 + pointer.currX * 0.014;
      rotZ += 0.002;
      pulse += 0.025;
    }

    // Luminescence trigger on gear hover
    if (pointer.isHoveringGear) {
      gearLuminescence += (1 - gearLuminescence) * 0.12;
    } else {
      gearLuminescence += (0 - gearLuminescence) * 0.06;
    }

    ctx.clearRect(0, 0, width, height);

    const cx = width * 0.5;
    const cy = height * 0.5;
    const baseScale = Math.min(width, height) * 0.38;
    const scScale = baseScale * (1 + Math.sin(pulse) * 0.02 + gearLuminescence * 0.08);
    const fov = 480;
    const dist = 500;

    // Projected Outer Vertices
    const outerTransformed = icoVertices.map(v => {
      const [rx, ry, rz] = rotate3D(
        v[0] * scScale,
        v[1] * scScale,
        v[2] * scScale,
        rotX + pointer.currY * 0.25,
        rotY + pointer.currX * 0.25,
        rotZ
      );
      const [px, py, scale, z] = project3D(rx, ry, rz, cx, cy, fov, dist);
      return { px, py, scale, z, rx, ry, rz };
    });

    // Projected Inner Core Vertices
    const coreTransformed = coreVertices.map(v => {
      const [rx, ry, rz] = rotate3D(
        v[0] * scScale,
        v[1] * scScale,
        v[2] * scScale,
        -rotX * 1.5,
        -rotY * 1.3,
        rotZ * 0.8
      );
      const [px, py, scale, z] = project3D(rx, ry, rz, cx, cy, fov, dist);
      return { px, py, scale, z };
    });

    // 1. Draw 20 Translucent Glass Facets (Triangles)
    // Sort faces by depth (painter's algorithm)
    const sortedFaces = icoFaces.map((face, index) => {
      const v0 = outerTransformed[face[0]];
      const v1 = outerTransformed[face[1]];
      const v2 = outerTransformed[face[2]];
      const avgZ = (v0.z + v1.z + v2.z) / 3;

      // Surface normal Z component to determine facing
      const ax = v1.px - v0.px;
      const ay = v1.py - v0.py;
      const bx = v2.px - v0.px;
      const by = v2.py - v0.py;
      const normalZ = ax * by - ay * bx;

      return { face, avgZ, normalZ, v0, v1, v2 };
    }).sort((a, b) => a.avgZ - b.avgZ);

    for (let i = 0; i < sortedFaces.length; i++) {
      const { v0, v1, v2, normalZ, avgZ } = sortedFaces[i];
      const isFrontFacing = normalZ > 0;

      // Alpha varies by orientation & depth
      const depthFactor = (avgZ + scScale) / (scScale * 2);
      const alpha = isFrontFacing 
        ? Math.max(0.025, Math.min(0.08 + gearLuminescence * 0.06, depthFactor * 0.08))
        : 0.015;

      ctx.beginPath();
      ctx.moveTo(v0.px, v0.py);
      ctx.lineTo(v1.px, v1.py);
      ctx.lineTo(v2.px, v2.py);
      ctx.closePath();

      if (isFrontFacing) {
        const faceGrad = ctx.createLinearGradient(v0.px, v0.py, v2.px, v2.py);
        faceGrad.addColorStop(0, `rgba(0, 102, 255, ${alpha})`);
        faceGrad.addColorStop(0.5, `rgba(56, 189, 248, ${alpha * 1.5})`);
        faceGrad.addColorStop(1, `rgba(255, 255, 255, ${alpha * 0.8})`);
        ctx.fillStyle = faceGrad;
      } else {
        ctx.fillStyle = `rgba(0, 102, 255, ${alpha})`;
      }
      ctx.fill();
    }

    // 2. Draw 30 Wireframe Edges with Glowing Specular Gradient
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 0; i < icoEdges.length; i++) {
      const [idxA, idxB] = icoEdges[i];
      const vA = outerTransformed[idxA];
      const vB = outerTransformed[idxB];
      const avgZ = (vA.z + vB.z) * 0.5;

      const depthAlpha = ((avgZ + scScale) / (scScale * 2)) * 0.32 + 0.12;
      const finalAlpha = Math.max(0.08, Math.min(0.65, depthAlpha + gearLuminescence * 0.25));

      const grad = ctx.createLinearGradient(vA.px, vA.py, vB.px, vB.py);
      grad.addColorStop(0, `rgba(0, 102, 255, ${finalAlpha})`);
      grad.addColorStop(0.5, `rgba(56, 189, 248, ${finalAlpha * 1.3})`);
      grad.addColorStop(1, `rgba(0, 102, 255, ${finalAlpha})`);

      ctx.lineWidth = 1.35;
      ctx.strokeStyle = grad;
      ctx.beginPath();
      ctx.moveTo(vA.px, vA.py);
      ctx.lineTo(vB.px, vB.py);
      ctx.stroke();
    }

    // 3. Draw Inner Counter-Rotating Intelligence Core (Golden Amber)
    for (let i = 0; i < icoEdges.length; i++) {
      const [idxA, idxB] = icoEdges[i];
      const vA = coreTransformed[idxA];
      const vB = coreTransformed[idxB];
      const coreAlpha = 0.28 + gearLuminescence * 0.3;

      ctx.lineWidth = 0.95;
      ctx.strokeStyle = `rgba(245, 158, 11, ${coreAlpha})`; // Amber Gold
      ctx.beginPath();
      ctx.moveTo(vA.px, vA.py);
      ctx.lineTo(vB.px, vB.py);
      ctx.stroke();
    }

    // 4. Outer Vertices (Gleaming Facet Nodes)
    for (let i = 0; i < outerTransformed.length; i++) {
      const v = outerTransformed[i];
      const pointAlpha = Math.min(0.9, (((v.z + scScale) / (scScale * 2)) * 0.5 + 0.3) + gearLuminescence * 0.2);
      const ptSize = Math.max(1.8, 3.2 * v.scale);

      // Core white sparkle
      ctx.fillStyle = `rgba(255, 255, 255, ${pointAlpha})`;
      ctx.beginPath();
      ctx.arc(v.px, v.py, ptSize, 0, Math.PI * 2);
      ctx.fill();

      // Outer cyan halo
      ctx.fillStyle = `rgba(56, 189, 248, ${pointAlpha * 0.45})`;
      ctx.beginPath();
      ctx.arc(v.px, v.py, ptSize * 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 5. Dual Interlocking Metallic Orbital Rings
    const ringSegments = 48;
    const ring1Radius = scScale * 1.35;
    const ring2Radius = scScale * 1.18;

    // Ring 1 (Tilted Electric Blue Ring)
    ctx.beginPath();
    for (let s = 0; s <= ringSegments; s++) {
      const theta = (s / ringSegments) * Math.PI * 2;
      const rx = Math.cos(theta) * ring1Radius;
      const rz = Math.sin(theta) * ring1Radius;
      const ry = Math.sin(theta * 2 + pulse) * (scScale * 0.12);

      const [tx, ty, tz] = rotate3D(rx, ry, rz, (rotX + pointer.currY * 0.25) * 0.6, (rotY + pointer.currX * 0.25) * 0.8, 0.45);
      const [px, py] = project3D(tx, ty, tz, cx, cy, fov, dist);

      if (s === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.lineWidth = 1.1;
    ctx.strokeStyle = `rgba(0, 102, 255, ${0.22 + gearLuminescence * 0.2})`;
    ctx.stroke();

    // Orbiting Satellite Bead 1
    const sat1Theta = pulse * 1.5;
    const s1x = Math.cos(sat1Theta) * ring1Radius;
    const s1z = Math.sin(sat1Theta) * ring1Radius;
    const s1y = Math.sin(sat1Theta * 2 + pulse) * (scScale * 0.12);
    const [stx, sty, stz] = rotate3D(s1x, s1y, s1z, (rotX + pointer.currY * 0.25) * 0.6, (rotY + pointer.currX * 0.25) * 0.8, 0.45);
    const [spx, spy, sScale] = project3D(stx, sty, stz, cx, cy, fov, dist);

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(spx, spy, 2.5 * sScale, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(56, 189, 248, 0.55)';
    ctx.beginPath();
    ctx.arc(spx, spy, 5 * sScale, 0, Math.PI * 2);
    ctx.fill();

    // Ring 2 (Counter-Tilted Cyan Ring)
    ctx.beginPath();
    for (let s = 0; s <= ringSegments; s++) {
      const theta = (s / ringSegments) * Math.PI * 2;
      const rx = Math.cos(theta) * ring2Radius;
      const ry = Math.sin(theta) * ring2Radius;
      const rz = Math.cos(theta * 2 - pulse) * (scScale * 0.1);

      const [tx, ty, tz] = rotate3D(rx, ry, rz, -0.65, (rotY + pointer.currX * 0.25) * 0.5, (rotX + pointer.currY * 0.25) * 0.7);
      const [px, py] = project3D(tx, ty, tz, cx, cy, fov, dist);

      if (s === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.lineWidth = 0.95;
    ctx.strokeStyle = `rgba(56, 189, 248, ${0.18 + gearLuminescence * 0.2})`;
    ctx.stroke();

    // Orbiting Satellite Bead 2
    const sat2Theta = -pulse * 1.2;
    const s2x = Math.cos(sat2Theta) * ring2Radius;
    const s2y = Math.sin(sat2Theta) * ring2Radius;
    const s2z = Math.cos(sat2Theta * 2 - pulse) * (scScale * 0.1);
    const [s2tx, s2ty, s2tz] = rotate3D(s2x, s2y, s2z, -0.65, (rotY + pointer.currX * 0.25) * 0.5, (rotX + pointer.currY * 0.25) * 0.7);
    const [s2px, s2py, s2Scale] = project3D(s2tx, s2ty, s2tz, cx, cy, fov, dist);

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(s2px, s2py, 2.2 * s2Scale, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(0, 102, 255, 0.45)';
    ctx.beginPath();
    ctx.arc(s2px, s2py, 4.5 * s2Scale, 0, Math.PI * 2);
    ctx.fill();

    if (!document.hidden) {
      animId = requestAnimationFrame(render);
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      animId = requestAnimationFrame(render);
    } else if (animId) {
      cancelAnimationFrame(animId);
    }
  });

  animId = requestAnimationFrame(render);
}

/**
 * --------------------------------------------------------------------------
 * 3. PERSPECTIVE 3D CARD TILT WITH DYNAMIC SPECULAR HIGHLIGHTS
 * Silky smooth lerp-based 3D tilt on mousemove for cards.
 * Automatically disabled on mobile/touch screens for native scrolling speed.
 * --------------------------------------------------------------------------
 */
function initCard3DTilt() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const tiltTargets = document.querySelectorAll(`
    .hero-card,
    .project-card,
    .pillar-card,
    .skill-category-card,
    .service-card,
    .about-sidebar-card,
    .timeline-card,
    .contact-card
  `);

  if (!tiltTargets.length) return;

  tiltTargets.forEach(card => {
    let animFrame = null;
    let targetRotateX = 0;
    let targetRotateY = 0;
    let currentRotateX = 0;
    let currentRotateY = 0;

    const isHero = card.classList.contains('hero-card');
    const isProject = card.classList.contains('project-card');
    const maxTilt = isHero ? 3.0 : (isProject ? 6.0 : 4.5);

    function updateTilt() {
      currentRotateX += (targetRotateX - currentRotateX) * 0.12;
      currentRotateY += (targetRotateY - currentRotateY) * 0.12;

      card.style.setProperty('--card-tilt-x', `${currentRotateX.toFixed(2)}deg`);
      card.style.setProperty('--card-tilt-y', `${currentRotateY.toFixed(2)}deg`);

      if (Math.abs(targetRotateX - currentRotateX) > 0.05 || Math.abs(targetRotateY - currentRotateY) > 0.05) {
        animFrame = requestAnimationFrame(updateTilt);
      } else {
        card.style.setProperty('--card-tilt-x', `${targetRotateX}deg`);
        card.style.setProperty('--card-tilt-y', `${targetRotateY}deg`);
        animFrame = null;
      }
    }

    card.addEventListener('pointermove', (e) => {
      const rect = card.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      card.style.setProperty('--mouse-x', `${mouseX.toFixed(1)}px`);
      card.style.setProperty('--mouse-y', `${mouseY.toFixed(1)}px`);

      const normX = (mouseX / rect.width) * 2 - 1;
      const normY = (mouseY / rect.height) * 2 - 1;

      targetRotateX = -normY * maxTilt;
      targetRotateY = normX * maxTilt;

      if (!animFrame) {
        animFrame = requestAnimationFrame(updateTilt);
      }
    }, { passive: true });

    card.addEventListener('pointerleave', () => {
      targetRotateX = 0;
      targetRotateY = 0;
      if (!animFrame) {
        animFrame = requestAnimationFrame(updateTilt);
      }
    });
  });
}

/**
 * --------------------------------------------------------------------------
 * 4. MAGNETIC BUTTON DYNAMICS
 * Subtle, tactile gravitational attraction for primary interactive buttons.
 * --------------------------------------------------------------------------
 */
function initMagneticButtons() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const magneticBtns = document.querySelectorAll(`
    .hero-cta,
    .btn-project-primary,
    .form-submit-btn,
    .docked-cta
  `);

  if (!magneticBtns.length) return;

  magneticBtns.forEach(btn => {
    let animFrame = null;
    let targetX = 0;
    let targetY = 0;
    let currX = 0;
    let currY = 0;

    function step() {
      currX += (targetX - currX) * 0.18;
      currY += (targetY - currY) * 0.18;

      btn.style.transform = `translate3d(${currX.toFixed(1)}px, ${currY.toFixed(1)}px, 0)`;

      if (Math.abs(targetX - currX) > 0.1 || Math.abs(targetY - currY) > 0.1) {
        animFrame = requestAnimationFrame(step);
      } else {
        btn.style.transform = targetX === 0 ? '' : `translate3d(${targetX}px, ${targetY}px, 0)`;
        animFrame = null;
      }
    }

    btn.addEventListener('pointermove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - (rect.left + rect.width / 2);
      const y = e.clientY - (rect.top + rect.height / 2);

      targetX = x * 0.28;
      targetY = y * 0.28;

      if (!animFrame) animFrame = requestAnimationFrame(step);
    }, { passive: true });

    btn.addEventListener('pointerleave', () => {
      targetX = 0;
      targetY = 0;
      if (!animFrame) animFrame = requestAnimationFrame(step);
    });
  });
}

/**
 * --------------------------------------------------------------------------
 * 5. MULTI-PLANE SPATIAL PARALLAX FOR HERO FLOATING ELEMENTS
 * Subtle spatial depth separation for profile, cat, headphones, sticky note.
 * --------------------------------------------------------------------------
 */
function initHeroSpatialParallax() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const heroWrapper = document.getElementById('hero');
  if (!heroWrapper) return;

  const items = [
    { el: heroWrapper.querySelector('.float-profile'), factorX: 18, factorY: 14, rotFactor: 0.12 },
    { el: heroWrapper.querySelector('.float-cat'), factorX: -22, factorY: -16, rotFactor: -0.15 },
    { el: heroWrapper.querySelector('.float-headphones'), factorX: 25, factorY: -18, rotFactor: 0.18 },
    { el: heroWrapper.querySelector('.float-sticky-note'), factorX: -16, factorY: 20, rotFactor: -0.1 },
    { el: heroWrapper.querySelector('.float-envelope'), factorX: 14, factorY: 22, rotFactor: 0.14 }
  ];

  let mouseX = 0;
  let mouseY = 0;
  let animFrame = null;

  function updateParallax() {
    items.forEach(({ el, factorX, factorY, rotFactor }) => {
      if (!el) return;
      const offsetX = mouseX * factorX;
      const offsetY = mouseY * factorY;
      const rot = mouseX * rotFactor;
      el.style.setProperty('--spatial-parallax-x', `${offsetX.toFixed(1)}px`);
      el.style.setProperty('--spatial-parallax-y', `${offsetY.toFixed(1)}px`);
      el.style.setProperty('--spatial-parallax-rot', `${rot.toFixed(1)}deg`);
    });
    animFrame = null;
  }

  heroWrapper.addEventListener('pointermove', (e) => {
    const rect = heroWrapper.getBoundingClientRect();
    mouseX = (e.clientX - (rect.left + rect.width * 0.5)) / (rect.width * 0.5);
    mouseY = (e.clientY - (rect.top + rect.height * 0.5)) / (rect.height * 0.5);

    if (!animFrame) {
      animFrame = requestAnimationFrame(updateParallax);
    }
  }, { passive: true });

  heroWrapper.addEventListener('pointerleave', () => {
    mouseX = 0;
    mouseY = 0;
    if (!animFrame) {
      animFrame = requestAnimationFrame(updateParallax);
    }
  });
}

/**
 * --------------------------------------------------------------------------
 * 6. SCROLL-TRIGGERED 3D REVEAL ANIMATIONS
 * Smooth, staggered spatial entry of editorial sections and cards.
 * --------------------------------------------------------------------------
 */
function initScrollReveal() {
  const revealElements = document.querySelectorAll(`
    .editorial-section,
    .pillar-card,
    .project-card,
    .skill-category-card,
    .service-card,
    .contact-card,
    .timeline-card
  `);

  if (!revealElements.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealElements.forEach(el => el.classList.add('is-revealed'));
    return;
  }

  revealElements.forEach(el => el.classList.add('reveal-spatial'));

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        obs.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.08
  });

  revealElements.forEach(el => observer.observe(el));
}

/**
 * --------------------------------------------------------------------------
 * 7. DYNAMIC GLASS SPECULAR SPOTLIGHT TRACKING
 * Global cursor spotlight on frosted glass containers.
 * --------------------------------------------------------------------------
 */
function initGlassSpotlight() {
  const glassCards = document.querySelectorAll(`
    .hero-card,
    .about-sidebar-card,
    .skill-category-card,
    .contact-card
  `);

  if (!glassCards.length) return;

  glassCards.forEach(card => card.classList.add('has-glass-spotlight'));
}
