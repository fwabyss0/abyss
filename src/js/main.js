/* ============================================================
   ALISH SHRESTHA — portfolio behaviour
   Vanilla JS. Anime.js (vendored at js/vendor/anime.min.js) drives
   the motion; everything degrades to visible-and-static without it.
   ============================================================ */
(function () {
  'use strict';

  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // Anime.js is vendored locally, so this only trips if the file is
  // missing or 404s. Every animation below is guarded on it.
  var A = window.anime || null;
  var anim = A && A.animate ? A.animate : null;

  // Runs the hero entrance once the loader has handed over.
  var heroReady = function () {};

  /* ---- hero entrance, timed to land as the loader dissolves ---- */
  (function heroIntro() {
    var run = function () {
      var lines = $$('.hero__title .line');
      var rest = $$('.hero [data-reveal]');

      if (!anim || reduced) {
        lines.concat(rest).forEach(function (el) {
          el.style.opacity = '1';
          el.style.transform = 'none';
        });
        return;
      }

      // The title leads, then the supporting copy follows underneath it.
      anim(lines, {
        opacity: [0, 1],
        translateY: [38, 0],
        skewY: [2.5, 0],
        duration: 950,
        delay: A.stagger(110),
        ease: 'outExpo'
      });

      anim(rest, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 820,
        delay: A.stagger(90, { start: 260 }),
        ease: 'outCubic'
      });
    };

    heroReady = run;
    // If the loader already finished (or was skipped), the hero is
    // already visible and needs no entrance at all.
    if (!$('#loader')) run();
  })();

  /* ==========================================================
     0. CINEMATIC LOADER  (Anime.js, but never required)

     Progress is real, not a fake timer: it tracks the portrait images
     and the window load event. The displayed value is eased toward
     the real one so the bar never jumps.

     Two things are load-bearing here and must not be weakened:
       - the failsafe timeout, or a stalled asset leaves the user
         staring at a black screen forever;
       - the single-run guard, or a slow asset can start the exit
         twice and tear the DOM mid-transition.
     ========================================================== */
  (function loader() {
    var el = $('#loader');
    if (!el) { heroReady(); return; }

    var bar = $('#loaderBar');
    var pctEl = $('#loaderPct');
    var statusEl = $('#loaderStatus');
    var mark = $('#loaderMark');
    var glyph = $('.loader__glyph', el);
    var halo = $('.loader__halo', el);
    var chars = $$('[data-ch]', el);

    var shown = 0;
    var target = 0;
    var done = false;

    // Reduced motion: no intro at all. CSS already hides the loader,
    // so this just marks the page ready and gets out of the way.
    if (reduced) {
      el.parentNode && el.parentNode.removeChild(el);
      document.documentElement.classList.add('is-loaded');
      heroReady();
      return;
    }

    function setTarget(v, label) {
      if (v > target) target = v;
      if (label && statusEl) statusEl.textContent = label;
    }

    function paint() {
      shown += (target - shown) * 0.1;
      if (target - shown < 0.4) shown = target;
      var v = Math.round(shown);
      if (bar) bar.style.width = v + '%';
      if (pctEl) pctEl.textContent = v;
      if (!done && shown < 99.5) requestAnimationFrame(paint);
    }

    /* ---- intro: logo, then the name, character by character ---- */
    if (anim) {
      anim(mark, { scale: [0.86, 1], opacity: [0, 1], duration: 900, ease: 'outElastic(1, .7)' });
      anim(glyph, { opacity: [0, 1], translateY: [14, 0], duration: 760, ease: 'outCubic' });
      anim(halo, {
        opacity: [0, 0.9],
        scale: [0.7, 1.25],
        duration: 1500,
        loop: true,
        alternate: true,
        ease: 'inOutSine'
      });
      anim(chars, {
        opacity: [0, 1],
        translateY: [10, 0],
        duration: 460,
        delay: A.stagger(28, { start: 380 }),
        ease: 'outQuad'
      });
    } else {
      // No Anime.js: show the loader content statically.
      [mark, glyph, halo].concat(chars).forEach(function (n) { if (n) n.style.opacity = '1'; });
    }

    requestAnimationFrame(paint);

    /* ---- what we actually wait for ---- */
    var tracked = 0, settled = 0;
    function settle() { if (++settled >= tracked) setTarget(100, 'Almost there'); }

    var imgs = ['assets/alish-900.jpg', 'assets/alish-900.webp', 'assets/alish-1100.webp'];
    tracked = imgs.length;
    imgs.forEach(function (src) {
      var im = new Image();
      im.onload = im.onerror = settle;
      im.src = src;
    });

    setTarget(18, 'Descending');
    var t1 = setTimeout(function () { setTarget(58, 'The light fades'); }, 260);
    var t2 = setTimeout(function () { setTarget(82, 'Something stirs'); }, 700);

    var RELEASE = 900;   // how long the exit sequence is allowed to take
    if (document.readyState === 'complete') {
      setTarget(100, 'Almost there');
    } else {
      window.addEventListener('load', function () {
        setTarget(100, 'Almost there');
        // safety: if an image never fires its callback, still finish
        setTimeout(function () { setTarget(100, 'Almost there'); }, 1200);
      });
    }

    function finish() {
      if (done) return;
      done = true;
      clearTimeout(t1); clearTimeout(t2);
      target = 100; shown = 100;
      if (bar) bar.style.width = '100%';
      if (pctEl) pctEl.textContent = '100';
      if (statusEl) statusEl.textContent = 'Eyes open';

      if (!anim) {
        // Straight to the page, no transition to run.
        el.parentNode && el.parentNode.removeChild(el);
        document.documentElement.classList.add('is-loaded');
        heroReady();
        return;
      }

      if (anim.pause) anim.pause();   // stop the halo loop before it is torn down

      el.classList.add('is-in');
      anim(el, {
        opacity: [1, 0],
        scale: [1, 1.04],
        duration: RELEASE,
        ease: 'inOutQuad',
        onComplete: function () {
          el.parentNode && el.parentNode.removeChild(el);
          document.documentElement.classList.add('is-loaded');
          heroReady();
        }
      });
    }

    // Failsafe: however slow or broken the assets are, the page opens.
    setTimeout(finish, 4200 + RELEASE);
    window.addEventListener('load', function () { setTimeout(finish, 600); });
  })();

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

     Two states driven by [data-state] on the container:
     "collapsed" shows only the orb, "open" expands the panel.
     Anime.js animates the transform between them; CSS holds the two
     resting states.

     Design constraints that shaped this:

     - The orb is a real <button>, so the expansion is reachable by
       keyboard and announced, not a hover-only trick. Touch devices
       get the same behaviour because a tap produces a click.
     - Nothing autoplays. Browsers block it, and unsolicited audio is
       hostile. The Spotify iframe is only created on the first real
       play, so a visitor who never presses play never loads it.
     - The equalizer is a looping Anime.js animation that is *stopped*
       on pause, not merely faded, so the bars freeze where they are
       instead of sliding back down.
     - With no tracks configured the panel says so and every transport
       control is disabled. Nothing 404s and nothing is fetched.
     ========================================================== */
  (function player() {
    var root = $('#player');
    if (!root) return;

    var orb = $('#playerOrb');
    var panel = $('#playerPanel');
    var closeBtn = $('#playerClose');
    var audio = $('#playerAudio');
    var toggle = $('#playerToggle');
    var prevBtn = $('#playerPrev');
    var nextBtn = $('#playerNext');
    var titleEl = $('#playerTitle');
    var artistEl = $('#playerArtist');
    var timeEl = $('#playerTime');
    var bar = $('#playerBar');
    var fill = $('#playerFill');
    var volume = $('#playerVolume');
    var embed = $('#playerEmbed');
    var bars = $$('.player__eq i', root);
    if (!orb || !audio) return;

    var tracks = (typeof TRACKS !== 'undefined' && TRACKS.length) ? TRACKS : [];
    var index = 0;
    var seeking = false;
    var open = false;
    var collapseTimer = 0;
    var eqAnim = null;
    var idleTimer = 0;

    /* ---------- expand / collapse ---------- */
    function setOpen(state) {
      if (open === state) return;
      open = state;
      root.setAttribute('data-state', state ? 'open' : 'collapsed');
      orb.setAttribute('aria-expanded', String(state));
      orb.setAttribute('aria-label', state ? 'Collapse music player' : 'Open music player');

      if (anim) {
        if (state) {
          anim(panel, {
            scale: [0.86, 1],
            translateY: [6, 0],
            opacity: [0, 1],
            duration: 420,
            ease: 'outBack(1.3)'
          });
        } else {
          anim(panel, {
            scale: 0.86,
            translateY: 6,
            opacity: 0,
            duration: 280,
            ease: 'inQuad'
          });
        }
      } else {
        // No Anime.js: fall back to the resting states in CSS.
        panel.style.opacity = state ? '1' : '0';
        panel.style.transform = state ? 'none' : 'scale(.86) translateY(6px)';
      }

      if (state) {
        clearTimeout(collapseTimer);
        // While open, a timer collapses it again if it is left untouched.
        clearTimeout(idleTimer);
        idleTimer = setTimeout(function () { setOpen(false); }, 15000);
      }
    }

    orb.addEventListener('click', function () { setOpen(!open); });
    if (closeBtn) closeBtn.addEventListener('click', function () { setOpen(false); orb.focus(); });

    // Hover expands on a real pointer only. On touch this never fires, so
    // the tap handler above is the whole mobile interaction.
    if (fine) {
      root.addEventListener('pointerenter', function () { setOpen(true); });
      root.addEventListener('pointerleave', function () {
        // Only collapse on leave if nothing is playing — collapsing mid-song
        // would hide the controls the listener is there to use.
        if (audio.paused) setOpen(false);
      });
    }

    // Escape closes, matching the mobile menu's behaviour.
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && open) { setOpen(false); orb.focus(); }
    });

    // Any interaction resets the idle countdown.
    ['pointerdown', 'keydown'].forEach(function (evt) {
      root.addEventListener(evt, function () {
        if (!open) return;
        clearTimeout(idleTimer);
        idleTimer = setTimeout(function () { setOpen(false); }, 15000);
      }, true);
    });

    /* ---------- equalizer ---------- */
    function eqPlay() {
      if (eqAnim || !anim || !bars.length) return;
      eqAnim = anim(bars, {
        scaleY: [
          { to: 1, duration: 260 },
          { to: 0.28, duration: 220 },
          { to: 0.72, duration: 300 },
          { to: 0.22, duration: 240 }
        ],
        loop: true,
        // each bar offset so they do not pulse in lockstep
        delay: A.stagger(110),
        ease: 'inOutSine'
      });
    }
    function eqStop() {
      if (!eqAnim) return;
      // .pause() leaves the bars exactly where they are, which is the
      // "freeze" behaviour wanted; the transition below eases them to rest.
      if (eqAnim.pause) eqAnim.pause();
      if (eqAnim.revert) eqAnim.revert();
      eqAnim = null;
      if (!anim) return;
      anim(bars, { scaleY: 0.22, duration: 260, ease: 'outQuad' });
    }

    /* ---------- Spotify embed ----------
       Built lazily. A Spotify track/playlist embed URL looks like
       https://open.spotify.com/embed/track/<ID> — the page URL from the
       share sheet with /embed/ inserted after the type. */
    function buildEmbed(t) {
      if (!embed || !t || !t.spotify) return;
      if (embed.getAttribute('data-src') === t.spotify) return;
      embed.setAttribute('data-src', t.spotify);
      embed.innerHTML = '';
      var f = document.createElement('iframe');
      f.src = t.spotify;
      f.title = 'Spotify player: ' + (t.title || 'track');
      f.loading = 'lazy';
      f.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
      f.setAttribute('allowtransparency', 'true');
      embed.appendChild(f);
      embed.hidden = false;
    }

    function dropEmbed() {
      if (!embed) return;
      // Removes the iframe and stops it playing in the background.
      embed.innerHTML = '';
      embed.removeAttribute('data-src');
      embed.hidden = true;
    }

    /* ---------- playback ---------- */
    function fmt(sec) {
      if (!isFinite(sec) || sec < 0) sec = 0;
      var m = Math.floor(sec / 60);
      var s = Math.floor(sec % 60);
      return m + ':' + (s < 10 ? '0' : '') + s;
    }

    function paint() {
      var dur = audio.duration;
      var pct = (dur && isFinite(dur)) ? (audio.currentTime / dur) * 100 : 0;
      if (!seeking && fill) fill.style.width = pct + '%';
      if (bar) {
        bar.setAttribute('aria-valuenow', Math.round(pct));
        bar.setAttribute('aria-valuetext', fmt(audio.currentTime) + ' of ' + fmt(dur));
      }
      if (timeEl) timeEl.textContent = fmt(audio.currentTime) + ' / ' + fmt(dur);
    }

    function load(i, autoplay) {
      if (!tracks.length) return;
      index = ((i % tracks.length) + tracks.length) % tracks.length;
      var t = tracks[index];

      if (titleEl) titleEl.textContent = t.title || 'Untitled';
      if (artistEl) artistEl.textContent = t.artist || '';

      // A track with a Spotify embed plays through the iframe; one with a
      // plain audio src plays through the <audio> element. Having both means
      // the player works before you get round to adding Spotify links.
      if (t.spotify) {
        audio.removeAttribute('src');
        audio.load();
        buildEmbed(t);
        if (autoplay) setOpen(true);
      } else {
        dropEmbed();
        audio.src = t.src || '';
        audio.load();
        if (autoplay) {
          var p = audio.play();
          // Autoplay policy rejects this until a real gesture; swallowing it
          // is correct, the button simply stays in its off state.
          if (p && p.catch) p.catch(function () {});
        }
      }
      paint();
    }

    function play() {
      if (!tracks.length) return;
      setOpen(true);
      if (tracks[index] && tracks[index].spotify) {
        // The iframe controls its own playback; nothing to call here.
        // Ask the user to press play inside it.
        if (titleEl) titleEl.textContent = tracks[index].title || 'Untitled';
        return;
      }
      var p = audio.play();
      if (p && p.catch) p.catch(function () {});
    }

    function pause() {
      if (tracks[index] && tracks[index].spotify) { dropEmbed(); buildEmbed(tracks[index]); return; }
      audio.pause();
    }

    if (toggle) toggle.addEventListener('click', function () {
      if (audio.paused) play(); else pause();
    });
    if (prevBtn) prevBtn.addEventListener('click', function () { load(index - 1, true); });
    if (nextBtn) nextBtn.addEventListener('click', function () { load(index + 1, true); });

    audio.addEventListener('play', function () {
      root.classList.add('is-playing');
      if (toggle) { toggle.setAttribute('aria-pressed', 'true'); toggle.setAttribute('aria-label', 'Pause'); }
      eqPlay();
    });
    audio.addEventListener('pause', function () {
      root.classList.remove('is-playing');
      if (toggle) { toggle.setAttribute('aria-pressed', 'false'); toggle.setAttribute('aria-label', 'Play'); }
      eqStop();
    });
    audio.addEventListener('timeupdate', paint);
    audio.addEventListener('loadedmetadata', paint);
    audio.addEventListener('ended', function () { load(index + 1, true); });
    audio.addEventListener('error', function () {
      root.classList.remove('is-playing');
      eqStop();
      if (toggle) toggle.setAttribute('aria-pressed', 'false');
      if (titleEl) titleEl.textContent = 'Track unavailable';
    });

    /* ---------- seek ---------- */
    function seekFrom(e) {
      var r = bar.getBoundingClientRect();
      var ratio = Math.max(0, Math.min(1, ((e.clientX || 0) - r.left) / r.width));
      if (audio.duration && isFinite(audio.duration)) audio.currentTime = ratio * audio.duration;
      paint();
    }
    bar.addEventListener('pointerdown', function (e) {
      if (!audio.duration) return;
      seeking = true;
      seekFrom(e);
      function move(ev) { seekFrom(ev); }
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
      volume.addEventListener('input', function () { audio.volume = Number(volume.value) / 100; });
    }

    /* ---------- no tracks: say so honestly and disable everything ---------- */
    if (!tracks.length) {
      if (toggle) toggle.disabled = true;
      if (prevBtn) prevBtn.disabled = true;
      if (nextBtn) nextBtn.disabled = true;
      if (bar) bar.setAttribute('aria-disabled', 'true');
      if (orb) {
        orb.setAttribute('aria-label', 'Music player — no tracks configured');
        orb.style.opacity = '.55';
        orb.style.cursor = 'default';
      }
    } else {
      // Show the first track's name at rest without playing or fetching it.
      if (titleEl) titleEl.textContent = tracks[0].title || 'Untitled';
      if (artistEl) artistEl.textContent = tracks[0].artist || '';
    }
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
     2. SCROLL REVEAL + MOTION (Anime.js)

     The old implementation animated these with CSS transitions and an
     IntersectionObserver that toggled a class. The triggers are kept
     exactly the same — same observer settings, same data-reveal and
     .stagger selectors, same "unobserve after firing" behaviour — so
     what appears on scroll does not change. Only the animation
     changes: Anime.js now drives opacity and transform directly.

     Everything here animates opacity and transform only, so it stays
     on the compositor and does not trigger layout.
     ========================================================== */
  (function reveal() {
    var targets = $$('[data-reveal]');
    targets.forEach(function (el, i) {
      if (!el.hasAttribute('data-d')) el.setAttribute('data-d', String(i % 4));
    });

    // No Anime.js, or the user wants less motion: show everything, animate nothing.
    if (!window.anime || reduced) {
      targets.forEach(function (el) { el.classList.add('is-in'); });
      ['#skillsGrid', '#projectsGrid', '#eduList', '#expList', '#contactLinks', '#stackTags']
        .forEach(function (sel) {
          var g = $(sel);
          if (g) {
            g.classList.add('stagger');
            Array.prototype.forEach.call(g.children, function (c) { c.classList.add('is-in'); });
          }
        });
      return;
    }

    var animate = window.anime.animate;
    var stagger = window.anime.stagger;

    // Set the pre-animation state without waiting for a frame, so the first
    // paint of an in-view element is already hidden rather than flashing in.
    function prep(el) { el.style.opacity = '0'; el.style.transform = 'translateY(18px)'; }

    function play(el, delay) {
      animate(el, {
        opacity: [0, 1],
        translateY: [18, 0],
        duration: 700,
        delay: delay || 0,
        ease: 'outCubic'
      });
      el.classList.add('is-in');
    }

    if (!('IntersectionObserver' in window)) {
      targets.forEach(function (el) { play(el, 0); });
      return;
    }

    targets.forEach(prep);

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        play(en.target, Number(en.target.getAttribute('data-d') || 0) * 90);
        io.unobserve(en.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });

    targets.forEach(function (el) { io.observe(el); });

    /* Safety net: anything still hidden after load gets shown. Without this,
       a viewport shorter than the content (or a slow IO callback) can leave
       hero text permanently invisible. */
    function revealInView() {
      targets.forEach(function (el) {
        if (el.classList.contains('is-in')) return;
        var b = el.getBoundingClientRect();
        if (b.bottom < window.innerHeight * 1.05) play(el, 0);
      });
    }
    setTimeout(revealInView, 420);
    window.addEventListener('resize', revealInView, { passive: true });

    // Generated grids stagger their children, same as before.
    ['#skillsGrid', '#projectsGrid', '#eduList', '#expList', '#contactLinks', '#stackTags']
      .forEach(function (sel) {
        var g = $(sel);
        if (!g) return;
        g.classList.add('stagger');
        var kids = Array.prototype.slice.call(g.children);
        kids.forEach(prep);
        var gio = new IntersectionObserver(function (entries) {
          entries.forEach(function (en) {
            if (!en.isIntersecting) return;
            animate(kids, {
              opacity: [0, 1],
              translateY: [18, 0],
              duration: 680,
              delay: stagger(Math.min(55, 520 / Math.max(kids.length, 1))),
              ease: 'outCubic'
            });
            kids.forEach(function (c) { c.classList.add('is-in'); });
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
