/* ============================================================
   ALISH SHRESTHA — portfolio behaviour
   Vanilla JS, no dependencies. Progressive: everything renders
   from data.js, and every interaction is an enhancement.
   ============================================================ */
(function () {
  'use strict';

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* ==========================================================
     1. CONTENT + INTERACTIVITY

     Projects, skills, education, experience, contact links and the tool
     tags are all written out as real HTML in index.html so search engines
     can read them without executing JavaScript. The blocks below therefore
     do NOT build those sections — they only attach the behaviour that
     cannot live in markup: the chip hover ring, the rail measurement, and
     the generative card previews.

     Consequence for editing: data.js is no longer the only place the copy
     lives. The HTML is what Google sees, so changing a project, skill,
     school or job means editing BOTH index.html and the matching array
     here — the arrays are still read for the rail's done-flags.
     ========================================================== */

  // skills — attach the conic ring to chips that are already in the DOM
  (function skills() {
    var host = $('#skillsGrid');
    if (!host) return;

    // Touch devices fire synthetic hover with no ring to show, so the whole
    // interaction is gated on a real pointer.
    if (fine) {
      host.querySelectorAll('.sc-wrap').forEach(function (wrap) {
        var chip = wrap.querySelector('.sc');
        var border = wrap.querySelector('.sc-border');
        if (!chip || !border) return;
        var pct = chip.getAttribute('data-percent');

        function openChip() {
          if (chip.classList.contains('sc-active')) return;
          var label = document.createElement('span');
          label.className = 'sc-pct-label';
          label.textContent = pct + '%';
          chip.appendChild(label);
          chip.classList.add('sc-active');
          border.classList.add('visible');
          border.style.background =
            'conic-gradient(from -90deg, var(--cc) 0 ' + pct + '%, rgba(255,255,255,.08) ' + pct + '% 100%)';
        }
        function closeChip() {
          chip.classList.remove('sc-active');
          border.classList.remove('visible');
          var label = chip.querySelector('.sc-pct-label');
          if (label) label.remove();
        }

        wrap.addEventListener('pointerenter', openChip);
        wrap.addEventListener('pointerleave', closeChip);
        chip.addEventListener('focus', openChip);
        chip.addEventListener('blur', closeChip);
      });
    }
  })();


  // projects — cards are static HTML; only the generative preview is ours
  (function projects() {
    var host = $('#projectsGrid');
    if (!host) return;

    // The preview is a purely decorative layer, so it is the one part that
    // still has to be created in JS. Walk the cards that are already in the
    // document and start a canvas for each, using the accent inline style as
    // the colour source so the HTML and the canvas can never disagree.
    $$('.proj', host).forEach(function (card, i) {
      var canvas = card.querySelector('.proj__preview canvas');
      if (!canvas) return;
      var accent = card.style.getPropertyValue('--accent') || '#ffffff';
      startPreview(canvas, accent, i);
    });
  })();

  /* ==========================================================
     MUSIC PLAYER

     A single <audio> element driven by the TRACKS list in data.js.
     Three deliberate constraints:

     - Nothing autoplays. Browsers block it, and unsolicited audio is
       hostile. Playback starts only on a real click.
     - The list is walked in order, then loops. There is no visible
       playlist, because the pill only has room for the current
       track; the next/prev behaviour is on the button and keys.
     - With no tracks configured the whole thing stays at its
       resting frame and downloads nothing.
     ========================================================== */
  (function player() {
    var root = $('#player');
    if (!root) return;

    var audio = $('#playerAudio');
    var toggle = $('#playerToggle');
    var titleEl = $('#playerTitle');
    var artistEl = $('#playerArtist');
    var timeEl = $('#playerTime');
    var bar = $('#playerBar');
    var fill = $('#playerFill');
    var volume = $('#playerVolume');
    if (!audio || !toggle) return;

    var tracks = (typeof TRACKS !== 'undefined' && TRACKS.length) ? TRACKS : [];
    var index = -1;
    var seeking = false;

    // No tracks: show a truthful resting state and stop. Nothing is fetched.
    if (!tracks.length) {
      titleEl.textContent = 'No tracks yet';
      artistEl.textContent = 'add files to audio/';
      toggle.disabled = true;
      toggle.style.opacity = '.45';
      toggle.style.cursor = 'not-allowed';
      toggle.setAttribute('aria-disabled', 'true');
      bar.setAttribute('aria-disabled', 'true');
      bar.style.pointerEvents = 'none';
      return;
    }

    function fmt(sec) {
      if (!isFinite(sec) || sec < 0) sec = 0;
      var m = Math.floor(sec / 60);
      var s = Math.floor(sec % 60);
      return m + ':' + (s < 10 ? '0' : '') + s;
    }

    function load(i, autoplay) {
      index = (i + tracks.length) % tracks.length;
      var t = tracks[index];
      audio.src = t.src;
      titleEl.textContent = t.title || 'Untitled';
      artistEl.textContent = t.artist || '';
      audio.load();
      if (autoplay) {
        // A play() rejection here is expected (autoplay policy) and is
        // swallowed deliberately — the button simply stays in its off state.
        var p = audio.play();
        if (p && p.catch) p.catch(function () {});
      }
    }

    function paint() {
      var dur = audio.duration;
      var pct = (dur && isFinite(dur)) ? (audio.currentTime / dur) * 100 : 0;
      if (!seeking) fill.style.width = pct + '%';
      bar.setAttribute('aria-valuenow', Math.round(pct));
      bar.setAttribute('aria-valuetext', fmt(audio.currentTime) + ' of ' + fmt(dur));
      timeEl.textContent = fmt(audio.currentTime) + ' / ' + fmt(dur);
    }

    toggle.addEventListener('click', function () {
      if (index < 0) { load(0, true); return; }
      if (audio.paused) {
        var p = audio.play();
        if (p && p.catch) p.catch(function () {});
      } else {
        audio.pause();
      }
    });

    audio.addEventListener('play', function () {
      root.classList.add('is-playing');
      toggle.setAttribute('aria-pressed', 'true');
      toggle.setAttribute('aria-label', 'Pause music');
    });
    audio.addEventListener('pause', function () {
      root.classList.remove('is-playing');
      toggle.setAttribute('aria-pressed', 'false');
      toggle.setAttribute('aria-label', 'Play music');
    });
    audio.addEventListener('timeupdate', paint);
    audio.addEventListener('loadedmetadata', paint);
    audio.addEventListener('ended', function () { load(index + 1, true); });
    // A missing file should not leave the UI claiming to play.
    audio.addEventListener('error', function () {
      root.classList.remove('is-playing');
      toggle.setAttribute('aria-pressed', 'false');
      titleEl.textContent = 'Track unavailable';
      artistEl.textContent = tracks[index] ? (tracks[index].title || '') : '';
    });

    // Seek by click, and by keyboard because the bar is a slider.
    function seekFromEvent(e) {
      var r = bar.getBoundingClientRect();
      var x = (e.clientX != null ? e.clientX : 0) - r.left;
      var ratio = Math.max(0, Math.min(1, x / r.width));
      if (audio.duration && isFinite(audio.duration)) {
        audio.currentTime = ratio * audio.duration;
      }
      paint();
    }
    bar.addEventListener('pointerdown', function (e) {
      if (!audio.duration) return;
      seeking = true;
      seekFromEvent(e);
      function move(ev) { seekFromEvent(ev); }
      function up() {
        seeking = false;
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
      }
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
    });
    bar.addEventListener('keydown', function (e) {
      if (!audio.duration) return;
      var d = audio.duration;
      if (e.key === 'ArrowRight') { audio.currentTime = Math.min(d, audio.currentTime + 5); paint(); e.preventDefault(); }
      if (e.key === 'ArrowLeft') { audio.currentTime = Math.max(0, audio.currentTime - 5); paint(); e.preventDefault(); }
    });

    if (volume) {
      audio.volume = Number(volume.value) / 100;
      volume.addEventListener('input', function () {
        audio.volume = Number(volume.value) / 100;
      });
    }

    // Show the first track's name at rest without playing it.
    load(0, false);
    audio.pause();
  })();

  // timeline lists — static HTML; only the progress rail is measured here
  function timeline(hostSel, items) {
    var host = $(hostSel);
    if (!host) return;
    if (items.some(function (it) { return it.done; })) {
      host.classList.add('tl--progress');
      // The solid part of the rail must end at the last completed dot, not at
      // some guessed percentage: items vary in height, so measure instead.
      var last = host.querySelector('.tl__item--done:last-of-type');
      if (last) {
        requestAnimationFrame(function () {
          var dot = last.getBoundingClientRect().top - host.getBoundingClientRect().top + 3;
          var total = host.getBoundingClientRect().height;
          if (total > 0) host.style.setProperty('--done-to', (dot / total * 100).toFixed(1) + '%');
        });
      }
    }
  }
  timeline('#eduList', EDUCATION);
  timeline('#expList', EXPERIENCE);

  // contact links — static HTML; nothing to build
  (function contact() {
    var host = $('#contactLinks');
    if (!host) return;
  })();

  // footer year + live clock
  $('#year').textContent = new Date().getFullYear();
  function tick() {
    var el = $('#clock');
    if (!el) return;
    el.textContent = new Date().toLocaleTimeString('en-GB', {
      timeZone: PROFILE.timezone, hour12: false
    }) + ' NPT';
  }
  tick();
  setInterval(tick, 1000);

  /* ==========================================================
     2. SCROLL REVEAL
     ========================================================== */
  (function reveal() {
    var targets = $$('[data-reveal]');
    targets.forEach(function (el, i) {
      if (!el.hasAttribute('data-d')) el.setAttribute('data-d', String(i % 4));
    });

    if (reduced || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    targets.forEach(function (el) { io.observe(el); });

    /* Safety net: anything still hidden after load gets shown. Without this,
       a viewport shorter than the content (or a slow IO callback) can leave
       hero text permanently invisible. */
    setTimeout(function () {
      targets.forEach(function (el) {
        var b = el.getBoundingClientRect();
        if (b.bottom < window.innerHeight * 1.05) el.classList.add('is-in');
      });
    }, 420);

    window.addEventListener('resize', function () {
      targets.forEach(function (el) {
        var b = el.getBoundingClientRect();
        if (b.bottom < window.innerHeight * 1.05) el.classList.add('is-in');
      });
    }, { passive: true });

    // stagger the generated grids
    ['#skillsGrid', '#projectsGrid', '#eduList', '#expList', '#contactLinks', '#stackTags']
      .forEach(function (sel) {
        var g = $(sel);
        if (!g) return;
        g.classList.add('stagger');
        var gio = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            Array.prototype.forEach.call(en.target.children, function (c, i) {
              c.style.transitionDelay = Math.min(i * 55, 520) + 'ms';
              c.classList.add('is-in');
            });
            gio.unobserve(en.target);
          });
        }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
        gio.observe(g);
      });
  })();

  /* ==========================================================
     3. SKILL COUNTERS — driven by HOVER, like the progress bar
     ========================================================== */
  (function counters() {
    var nodes = $$('.skill');
    if (!nodes.length) return;

    // Animate from the value currently on screen to the target. `to` is 0 on
    // leave and the real level on enter, so the bar and the number stay in step
    // instead of negating into "-88%".
    function run(el, to) {
      var out = el.querySelector('.skill__pct');
      var target = parseInt(out.dataset.pct, 10);
      var from = parseInt(out.textContent, 10);
      if (isNaN(from)) from = 0;
      if (reduced) { out.textContent = to + '%'; return; }
      var t0 = null, dur = 850;
      function step(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        var e = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);   // easeOutExpo
        out.textContent = Math.round(from + (to - from) * e) + '%';
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    nodes.forEach(function (el) {
      var busy = false;
      var open = function () { if (busy) return; busy = true; run(el, parseInt(el.querySelector('.skill__pct').dataset.pct, 10)); };
      var shut = function () { if (busy) return; busy = true; run(el, 0); };
      // one timer retires the lock so a fast re-hover can restart cleanly
      var lock = 0;
      function arm() { clearTimeout(lock); lock = setTimeout(function () { busy = false; }, 900); }
      el.addEventListener('pointerenter', function () { open(); arm(); });
      el.addEventListener('pointerleave', function () { shut(); arm(); });
      el.addEventListener('focus', function () { open(); arm(); });
      el.addEventListener('blur', function () { shut(); arm(); });

      // No hover (touch) or no animation allowed (reduced motion): there is no
      // reveal gesture to hang the number on, so show the real value up front
      // rather than leaving the card reading a permanent 0%.
      if (!fine || reduced) {
        var out = el.querySelector('.skill__pct');
        out.textContent = out.dataset.pct + '%';
      }
    });
  })();

  /* ==========================================================
     4. NAV: sticky state, active link, mobile menu
     ========================================================== */
  (function nav() {
    var nav = $('#nav');
    var bar = $('#progressBar');
    var toTop = $('#toTop');
    var links = $$('.nav__links a');
    var sections = links.map(function (a) { return $(a.getAttribute('href')); });
    var burger = $('#burger');
    var menu = $('#mobileMenu');
    var ticking = false;

    function onScroll() {
      var y = window.scrollY || window.pageYOffset;
      var h = document.documentElement.scrollHeight - window.innerHeight;
      if (bar) bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
      if (nav) nav.classList.toggle('is-stuck', y > 40);
      if (toTop) toTop.classList.toggle('is-on', y > window.innerHeight * 0.9);

      // active section
      var mid = y + window.innerHeight * 0.35;
      var best = -1;
      sections.forEach(function (s, i) {
        if (s && s.offsetTop <= mid) best = i;
      });
      links.forEach(function (a, i) { a.classList.toggle('is-active', i === best); });

      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
    }, { passive: true });
    onScroll();

    // mobile menu
    function setMenu(open) {
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) {
        menu.hidden = false;
        requestAnimationFrame(function () { menu.classList.add('is-open'); });
      } else {
        menu.classList.remove('is-open');
        setTimeout(function () { menu.hidden = true; }, 320);
      }
    }
    burger.addEventListener('click', function () {
      setMenu(burger.getAttribute('aria-expanded') !== 'true');
    });
    $$('a', menu).forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && burger.getAttribute('aria-expanded') === 'true') {
        setMenu(false); burger.focus();
      }
    });

    if (toTop) {
      toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
      });
    }
  })();

  /* ==========================================================
     5. CUSTOM CURSOR
     ========================================================== */
  if (fine) {
    (function cursor() {
      var cur = $('.cursor');
      if (!cur) return;
      var dot = $('.cursor__dot', cur);
      var ring = $('.cursor__ring', cur);
      var mx = window.innerWidth / 2, my = window.innerHeight / 2;
      var dx = mx, dy = my, rx = mx, ry = my;

      window.addEventListener('pointermove', function (e) {
        mx = e.clientX; my = e.clientY;
        dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
      }, { passive: true });

      (function loop() {
        // Ring now moves with a very tight, high-frequency snap to feel synchronized but organic
        dx += (mx - dx) * 0.6;
        dy += (my - dy) * 0.6;
        ring.style.transform = 'translate(' + dx + 'px,' + dy + 'px) translate(-50%,-50%)';
        requestAnimationFrame(loop);
      })();

      var HOVER = 'a, button, .skill, .proj, .contact__links a, .nav__mark';
      document.addEventListener('pointerover', function (e) {
        if (e.target.closest && e.target.closest(HOVER)) cur.classList.add('is-hover');
      });
      document.addEventListener('pointerout', function (e) {
        if (e.target.closest && e.target.closest(HOVER)) cur.classList.remove('is-hover');
      });
      window.addEventListener('pointerdown', function () { cur.classList.add('is-down'); });
      window.addEventListener('pointerup', function () { cur.classList.remove('is-down'); });
    })();
  }

  /* ==========================================================
     6. CONTROLLED GLITCH (hero only, occasional)
     ========================================================== */
  if (!reduced) {
    (function glitch() {
      var lines = $$('.hero__title .line');
      if (!lines.length) return;
      function fire() {
        var el = lines[Math.floor(Math.random() * lines.length)];
        el.classList.add('is-glitch');
        setTimeout(function () { el.classList.remove('is-glitch'); }, 760);
        setTimeout(fire, 3800 + Math.random() * 6000);
      }
      setTimeout(fire, 3400);
    })();
  }

  /* ==========================================================
     7. SCROLL TILT on the big cards
     ========================================================== */
  if (fine && !reduced) {
    $$('.proj, .skill').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = 'perspective(900px) rotateX(' + (-py * 4).toFixed(2) +
                             'deg) rotateY(' + (px * 5).toFixed(2) + 'deg) translateY(-5px)';
      });
      el.addEventListener('pointerleave', function () { el.style.transform = ''; });
    });
  }

  /* ==========================================================
     8. HERO FIELD — two layers on canvas
        - #drift : slow, large, blurred motes that give depth
        - #fx    : the tight constellation and cursor links

     They are separate canvases on purpose. The drift is cheap and
     slow; the constellation is smaller and does the reacting. A
     single canvas would force one compromise between the two, and
     drawing the drift without blur would just look like a busier
     version of what is already there.
     ========================================================== */
  (function drift() {
    var cv = $('#drift');
    if (!cv || reduced) return;
    var ctx = cv.getContext('2d');
    // Full device pixel ratio is wasted on this layer: it is blurred and
    // low-contrast, so the extra resolution is invisible — but it would
    // multiply the fill cost and the CSS blur radius over a full-screen
    // element. At a 2560px viewport, dpr 2 means a 5120x2880 backbuffer;
    // dpr 1 is 4x cheaper and looks identical once blurred.
    var dpr = 1;
    var W = 0, H = 0, motes = [];
    // The pointer gently biases the whole field, so moving the mouse
    // pushes the haze around as well as the constellation.
    var mx = 0, my = 0, tx = 0, ty = 0;

    function rand(a, b) { return a + Math.random() * (b - a); }

    function resize() {
      var r = cv.getBoundingClientRect();
      W = r.width; H = r.height;
      cv.width = Math.max(1, W * dpr);
      cv.height = Math.max(1, H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function seed() {
      // Fewer, larger motes than the constellation: this is haze, not
      // detail. Density scales with area so ultrawide stays calm.
      var n = Math.max(14, Math.min(Math.round((W * H) / 46000), 54));
      motes = [];
      for (var i = 0; i < n; i++) {
        motes.push({
          x: rand(0, W), y: rand(0, H),
          vx: rand(-0.16, 0.16), vy: rand(-0.09, 0.09),
          r: rand(1.6, 5.2),
          b: rand(0.03, 0.10),
          // one in six carries the violet accent, so the layer is not
          // purely monochrome but never reads as colourful
          a: Math.random() < 0.16
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);
      // ease the field toward the pointer
      tx = mx * 0.06; ty = my * 0.06;
      var t = performance.now();
      // a slow breathing brightness, so the layer is never fully static
      var breathe = 0.82 + 0.18 * Math.sin(t * 0.00035);

      for (var i = 0; i < motes.length; i++) {
        var p = motes[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < -30) p.x = W + 30; if (p.x > W + 30) p.x = -30;
        if (p.y < -30) p.y = H + 30; if (p.y > H + 30) p.y = -30;

        // a slow vertical sine on each mote keeps the motion organic
        // rather than a uniform glide
        var wob = Math.sin(t * 0.0004 + i) * 0.22;
        var x = p.x + tx + wob;
        var y = p.y + ty + Math.cos(t * 0.00031 + i) * 0.18;

        var alpha = p.b * breathe;
        ctx.fillStyle = p.a
          ? 'rgba(167,139,250,' + (alpha * 1.5).toFixed(3) + ')'
          : 'rgba(255,255,255,' + alpha.toFixed(3) + ')';
        ctx.beginPath();
        ctx.arc(x, y, p.r, 0, 6.2832);
        ctx.fill();
      }

      requestAnimationFrame(draw);
    }

    var rz;
    window.addEventListener('resize', function () {
      clearTimeout(rz); rz = setTimeout(resize, 160);
    });
    window.addEventListener('pointermove', function (e) {
      mx = e.clientX - cv.getBoundingClientRect().left;
      my = e.clientY - cv.getBoundingClientRect().top;
    }, { passive: true });

    resize();
    requestAnimationFrame(draw);

    // exposed for automated verification
    window.__drift = { motes: function () { return motes.length; } };
  })();

  (function field() {
    var cv = $('#fx');
    if (!cv || reduced) return;
    var ctx = cv.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, pts = [], mouse = { x: -999, y: -999 };
    var d1, d2, d3, d4;

    function rand(min, max) { return min + Math.random() * (max - min); }

    function resize() {
      var r = cv.getBoundingClientRect();
      W = r.width; H = r.height;
      cv.width = Math.max(1, W * dpr);
      cv.height = Math.max(1, H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function seed() {
      var n = Math.min(Math.round((W * H) / 30000), 40);
      pts = [];
      for (var i = 0; i < n; i++) {
        pts.push({
          x: rand(0, W), y: rand(0, H),
          vx: rand(-0.05, 0.05), vy: rand(-0.05, 0.05),
          r: rand(0.3, 0.8),
          b: Math.random() < 0.1 ? rand(0.3, 0.5) : rand(0.05, 0.2)
        });
      }
    }

    // 4 wandering "chaos" anchors that pull the field around
    function anchors(t) {
      return [
        { x: W * (0.5 + 0.30 * Math.sin(t * 0.00021)), y: H * (0.42 + 0.22 * Math.cos(t * 0.00017)) },
        { x: W * (0.5 + 0.34 * Math.cos(t * 0.00013 + 1)), y: H * (0.55 + 0.20 * Math.sin(t * 0.00023 + 2)) },
        { x: W * (0.5 + 0.26 * Math.sin(t * 0.00029 + 3)), y: H * (0.35 + 0.26 * Math.cos(t * 0.00011 + 4)) },
        { x: W * (0.5 + 0.32 * Math.sin(t * 0.00019 + 5)), y: H * (0.62 + 0.18 * Math.cos(t * 0.00027 + 5)) }
      ];
    }

    var LINK = 132;

    function draw() {
      ctx.clearRect(0, 0, W, H);
      var t = performance.now();
      var A = anchors(t);
      d1 = A[0]; d2 = A[1]; d3 = A[2]; d4 = A[3];

      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20; if (p.y > H + 20) p.y = -20;

        // subtle pull toward the nearest anchor
        var near = null, nd = 1e9;
        for (var k = 0; k < A.length; k++) {
          var dx = p.x - A[k].x, dy = p.y - A[k].y;
          var dd = dx * dx + dy * dy;
          if (dd < nd) { nd = dd; near = A[k]; }
        }
        if (near && nd < 36000) {
          var f = 0.00022 * (1 - Math.sqrt(nd) / 190);
          p.x += (near.x - p.x) * f;
          p.y += (near.y - p.y) * f;
        }

        // links
        for (var j = i + 1; j < pts.length; j++) {
          var q = pts[j];
          var ax = p.x - q.x, ay = p.y - q.y;
          var dist = Math.sqrt(ax * ax + ay * ay);
          if (dist < LINK) {
            ctx.strokeStyle = 'rgba(255,255,255,' + (0.1 * (1 - dist / LINK)).toFixed(3) + ')';        ctx.lineWidth = 0.3;
            ctx.lineWidth = 0.6;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }

        // link to cursor
        var mdx = p.x - mouse.x, mdy = p.y - mouse.y;
        var md = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < 220) {
          var strength = (1 - md / 220);
          ctx.strokeStyle = 'rgba(255,255,255,' + (0.4 * strength).toFixed(3) + ')';
          ctx.lineWidth = 0.2 + (strength * 0.8); // Line gets thicker as cursor nears (venomous/organic feel)
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }

        ctx.fillStyle = 'rgba(255,255,255,' + p.b + ')';        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fill();
      }

      // anchor glyphs
      var cols = ['rgba(255,255,255,.15)', 'rgba(255,255,255,.12)', 'rgba(255,255,255,.1)', 'rgba(255,255,255,.08)'];
      for (var m = 0; m < A.length; m++) {
        var a = A[m];
        var pulse = 1 + 0.15 * Math.sin(t * 0.002 + m * 1.6);
        ctx.strokeStyle = cols[m];
        ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.arc(a.x, a.y, 12 * pulse, 0, 6.2832); ctx.stroke();
        ctx.beginPath(); ctx.arc(a.x, a.y, 2, 0, 6.2832); ctx.fillStyle = cols[m]; ctx.fill();
        // crosshair ticks
        ctx.beginPath();
        ctx.moveTo(a.x - 12, a.y); ctx.lineTo(a.x - 8, a.y);
        ctx.moveTo(a.x + 8, a.y); ctx.lineTo(a.x + 12, a.y);
        ctx.moveTo(a.x, a.y - 12); ctx.lineTo(a.x, a.y - 8);
        ctx.moveTo(a.x, a.y + 8); ctx.lineTo(a.x, a.y + 12);
        ctx.stroke();
      }

      requestAnimationFrame(draw);
    }

    var rz;
    window.addEventListener('resize', function () {
      clearTimeout(rz); rz = setTimeout(resize, 160);
    });
    window.addEventListener('pointermove', function (e) {
      var r = cv.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    }, { passive: true });

    resize();
    requestAnimationFrame(draw);

    // expose for automated verification
    window.__fx = { anchors: anchors, points: function () { return pts.length; } };
  })();

  /* ==========================================================
     9. PROJECT PREVIEW CANVASES (generative, hover-only cost)
     ========================================================== */
  function startPreview(cv, accent, seedIdx) {
    if (!cv) return;
    var ctx = cv.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    var W = 0, H = 0, raf = 0, t0 = performance.now();
    var rgb = hexRGB(accent);

    function resize() {
      var r = cv.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      cv.width = W * dpr; cv.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function frame(now) {
      var t = (now - t0) / 1000;
      var s = 1 + seedIdx * 7.3;
      ctx.clearRect(0, 0, W, H);

      // flowing contour bands
      ctx.lineWidth = 1;
      for (var b = 0; b < 16; b++) {
        var yb = (b / 16) * H + Math.sin(t * 0.5 + s + b * 0.4) * 9;
        ctx.strokeStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',' + (0.05 + 0.09 * Math.abs(Math.sin(t * 0.7 + b * 0.3 + s))).toFixed(3) + ')';
        ctx.beginPath();
        for (var x = 0; x <= W; x += 7) {
          var y = yb
            + Math.sin(x * 0.012 + t * 0.9 + s) * 16
            + Math.sin(x * 0.031 - t * 0.6 + s * 2) * 7;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // drifting blocks
      for (var i = 0; i < 7; i++) {
        var bs = 10 + (i * 13 % 26);
        var bx = ((t * (12 + i * 5) + i * 97 + s * 40) % (W + bs * 2)) - bs;
        var by = (H / 7) * (i + 1) + Math.sin(t * 0.8 + i + s) * 26;
        ctx.fillStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',.11)';
        ctx.fillRect(bx, by, bs, bs);
        ctx.strokeStyle = 'rgba(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ',.26)';
        ctx.strokeRect(bx + 0.5, by + 0.5, bs, bs);
      }

      raf = requestAnimationFrame(frame);
    }

    var ro = null;
    // only animate while visible-ish: start on hover, stop after leaving
    var start = function () {
      if (raf) return;
      resize();
      t0 = performance.now();
      raf = requestAnimationFrame(frame);
    };
    var stop = function () {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    var card = cv.closest('.proj');
    if (!card) return;

    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { resize(); }
      });
    }, { threshold: 0 });
    io.observe(card);

    card.addEventListener('pointerenter', function () {
      if (!reduced) start();
    });
    card.addEventListener('pointerleave', stop);
    card.addEventListener('focus', function () { if (!reduced) start(); });
    card.addEventListener('blur', stop);
  }

  function hexRGB(h) {
    h = h.replace('#', '');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }

  /* ==========================================================
     10. KEYBOARD: '/' focuses nothing useful here, but Esc
         closes menu (done above). Add '/' as a quick jump.
     ========================================================== */
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName)) {
      e.preventDefault();
      var m = document.getElementById('mobileMenu');
      if (m && !m.hidden) return;
      var first = document.querySelector('.nav__links a');
      if (first) first.focus();
    }
  });

  /* ==========================================================
     11. HERO BLINKER — frequent flicker on the name lines
     ========================================================== */
  (function blinker() {
    var lines = $$('.hero__title .line');
    if (!lines.length || reduced) return;
    // both lines share one class toggle so they flicker in sync
    lines.forEach(function (el) { el.classList.add('is-blink'); });
  })();

  /* ==========================================================
     12. ABOUT HIGHLIGHTER — as the paragraph scrolls up through
         the viewport, each marked term wipes its accent band in
         left-to-right, in document order. Leaving the viewport
         resets the terms so the sweep replays on the way back in.
     ========================================================== */
  (function aboutHi() {
    var para = $('[data-hi]');
    if (!para) return;
    var terms = $$('b[data-mark]', para);
    if (!terms.length) return;

    function lightAll() { terms.forEach(function (t) { t.classList.add('is-lit'); }); }
    function unlightAll() { terms.forEach(function (t) { t.classList.remove('is-lit'); }); }

    // No animation wanted: show the finished state immediately.
    if (reduced || !('IntersectionObserver' in window)) { lightAll(); return; }

    var timers = [];

    function schedule() {
      unlightAll();
      timers.forEach(clearTimeout);
      timers = [];
      // stagger each term so they wipe in one after another
      terms.forEach(function (t, i) {
        timers.push(setTimeout(function () { t.classList.add('is-lit'); }, 160 + i * 230));
      });
    }

    // Fire when the paragraph is well inside the viewport, so the highlight
    // is actually being *scrolled into*, not already off the top. On exit the
    // terms go dark again, so scrolling back up replays the whole sweep.
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { schedule(); } else { unlightAll(); }
      });
    }, { threshold: 0.35, rootMargin: '0px 0px -18% 0px' });
    io.observe(para);

    // Failsafe: a deep-link, a restored scroll position or a slow observer
    // must never leave the paragraph half-lit.
    setTimeout(function () {
      var r = para.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) lightAll();
    }, 1200);
  })();
})();
