/**
 * Main Application Orchestrator
 * Alish Shrestha (Abyss) Portfolio
 * Handles navigation, interactive components, dynamic rendering, and scroll triggers.
 */

import { PROFILE, SOCIALS, NAV_LINKS, PROJECTS, SKILL_CATEGORIES, MILESTONES } from './data.js';
import { AsciiPortrait } from './ascii-portrait.js';
import { Particles3D } from './particles-3d.js';

document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  initLoader();
  initParticles3D();
  renderProjects();
  renderSkills();
  renderMilestones();
  renderSocialLinks();
  initAsciiPortrait();
  initNavigation();
  initScrollEffects();
  initContactActions();
  initFooterYear();
}

/**
 * Initialize Living 3D Particle Constellation
 */
function initParticles3D() {
  try {
    new Particles3D('particles-3d-canvas');
  } catch (err) {
    console.warn('Particles3D init failed:', err);
  }
}

/**
 * Initialize Signature ASCII Portrait Effect
 */
function initAsciiPortrait() {
  const container = document.getElementById('ascii-portrait-container');
  if (!container) return;

  new AsciiPortrait({
    container: container,
    imageSrc: PROFILE.portraitImage,
    fallbackSrc: PROFILE.portraitFallback,
    altText: PROFILE.portraitAlt
  });
}

/**
 * Render Project Showcase (2 x 2 Balanced Grid)
 */
function renderProjects() {
  const grid = document.getElementById('projects-grid');
  if (!grid) return;

  grid.innerHTML = PROJECTS.map((p, idx) => `
    <article class="project-glass-card reveal-on-scroll" data-index="${idx}">
      <div class="project-card-header">
        <span class="project-tag">${p.tag}</span>
        <span class="project-year">${p.year}</span>
      </div>

      <h3 class="project-title">${p.title}</h3>
      <p class="project-desc">${p.description}</p>

      <ul class="project-stack" aria-label="Technologies used">
        ${p.stack.map(tech => `<li class="tech-pill">${tech}</li>`).join('')}
      </ul>

      <div class="project-links">
        ${p.liveUrl ? `
          <a href="${p.liveUrl}" target="_blank" rel="noopener noreferrer" class="glass-btn glass-btn-primary" aria-label="Visit live website for ${p.title}">
            <span>Live Experience</span>
            <svg class="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </a>
        ` : `
          <span class="badge-internal" title="Operational Internal Tool">
            <span>Production Workflow</span>
          </span>
        `}

        ${p.githubUrl ? `
          <a href="${p.githubUrl}" target="_blank" rel="noopener noreferrer" class="glass-btn glass-btn-secondary" aria-label="View source code for ${p.title} on GitHub">
            <svg class="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <span>GitHub</span>
          </a>
        ` : ''}
      </div>
    </article>
  `).join('');
}

/**
 * Render Categorized Skills (2x2 Glassmorphic Technical Matrix)
 */
function renderSkills() {
  const container = document.getElementById('skills-grid');
  if (!container) return;

  container.innerHTML = SKILL_CATEGORIES.map((cat, idx) => `
    <article 
      class="skill-glass-card reveal-on-scroll" 
      data-category="${cat.id}"
      data-index="${idx}"
      style="--cat-accent: ${cat.accent};"
    >
      <header class="skill-card-header">
        <div class="skill-card-meta">
          <span class="skill-card-number">// 0${idx + 1}</span>
          <span class="skill-card-tag">${cat.tag}</span>
        </div>
        <h3 class="skill-card-title">${cat.name}</h3>
        <p class="skill-card-desc">${cat.description}</p>
      </header>

      <div class="skill-card-items-grid" role="list">
        ${cat.skills.map(s => `
          <div class="skill-tech-badge" role="listitem">
            <div class="tech-badge-icon" aria-hidden="true">${s.badge}</div>
            <div class="tech-badge-info">
              <span class="tech-name">${s.name}</span>
              <span class="tech-highlight">${s.highlight}</span>
            </div>
            <span class="tech-level-tag">${s.level}</span>
          </div>
        `).join('')}
      </div>
    </article>
  `).join('');

  initSkillsFilter();
}

/**
 * Interactive Skills Domain Filtering
 */
function initSkillsFilter() {
  const filterNav = document.getElementById('skills-filter-nav');
  if (!filterNav) return;

  const filterBtns = filterNav.querySelectorAll('.skills-filter-btn');
  const cards = document.querySelectorAll('.skill-glass-card');
  if (!filterBtns.length || !cards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');

      // Update button active state
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      // Filter cards
      cards.forEach(card => {
        const cat = card.getAttribute('data-category');
        if (filter === 'all' || cat === filter) {
          card.classList.remove('is-filtered-out');
          card.classList.add('is-filtered-in');
        } else {
          card.classList.add('is-filtered-out');
          card.classList.remove('is-filtered-in');
        }
      });
    });
  });
}

/**
 * Render Milestones & Background (Open Timeline Track)
 */
function renderMilestones() {
  const container = document.getElementById('milestones-list');
  if (!container) return;

  container.innerHTML = MILESTONES.map((m, idx) => `
    <div class="timeline-step reveal-on-scroll" data-index="${idx}">
      <div class="timeline-rail-node">
        <span class="node-glow-ring" aria-hidden="true"></span>
        <span class="node-core-dot" aria-hidden="true"></span>
      </div>
      <div class="timeline-step-body">
        <div class="timeline-step-meta">
          <span class="step-period">${m.period}</span>
          <span class="step-location">${m.location}</span>
        </div>
        <h4 class="step-role">${m.role}</h4>
        <p class="step-org">${m.organization}</p>
        <p class="step-details">${m.details}</p>
      </div>
    </div>
  `).join('');
}

/**
 * Render Verified Social Links
 */
function renderSocialLinks() {
  const heroLinks = document.getElementById('hero-social-links');
  const contactLinks = document.getElementById('contact-social-links');
  const footerLinks = document.getElementById('footer-social-links');

  const icons = {
    github: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>',
    linkedin: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>',
    instagram: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>',
    globe: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>'
  };

  const html = SOCIALS.map(s => `
    <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="social-glass-pill" aria-label="${s.name} (${s.handle})">
      <span class="social-icon" aria-hidden="true">${icons[s.icon] || ''}</span>
      <span class="social-name">${s.name}</span>
    </a>
  `).join('');

  if (heroLinks) {
    heroLinks.innerHTML = SOCIALS.slice(0, 2).map(s => `
      <a href="${s.url}" target="_blank" rel="noopener noreferrer" class="hero-social-link" aria-label="${s.name}">
        <span class="social-icon" aria-hidden="true">${icons[s.icon] || ''}</span>
        <span>${s.name}</span>
      </a>
    `).join('');
  }

  if (contactLinks) contactLinks.innerHTML = html;
  if (footerLinks) footerLinks.innerHTML = html;
}

/**
 * Navigation & Scroll Indicator
 */
function initNavigation() {
  const navbar = document.getElementById('main-nav');
  const menuToggle = document.getElementById('mobile-menu-toggle');
  const navLinksContainer = document.getElementById('nav-links');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  // Scroll glass enhancement
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar?.classList.add('nav-scrolled');
    } else {
      navbar?.classList.remove('nav-scrolled');
    }
  }, { passive: true });

  // Mobile menu toggle
  if (menuToggle && navLinksContainer) {
    menuToggle.addEventListener('click', () => {
      const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!isExpanded));
      navLinksContainer.classList.toggle('nav-open', !isExpanded);
      document.body.classList.toggle('menu-open', !isExpanded);
    });

    // Close mobile menu on link click
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        navLinksContainer.classList.remove('nav-open');
        document.body.classList.remove('menu-open');
      });
    });
  }

  // Active section indicator via IntersectionObserver
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        navLinks.forEach(link => {
          const href = link.getAttribute('href');
          if (href === `#${id}`) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'page');
          } else {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
          }
        });
      }
    });
  }, {
    rootMargin: '-20% 0px -60% 0px',
    threshold: 0
  });

  sections.forEach(sec => navObserver.observe(sec));
}

/**
 * Scroll Reveal Animations
 */
function initScrollEffects() {
  const reveals = document.querySelectorAll('.reveal-on-scroll');
  if (!reveals.length) return;

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    reveals.forEach(el => el.classList.add('revealed'));
    return;
  }

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: '0px 0px -40px 0px',
    threshold: 0.1
  });

  reveals.forEach(el => revealObserver.observe(el));
}

/**
 * Contact Actions & Clipboard Toast
 */
function initContactActions() {
  const copyBtn = document.getElementById('copy-email-btn');
  const toast = document.getElementById('clipboard-toast');

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(PROFILE.email);
        showToast('Email copied to clipboard!');
      } catch (err) {
        // Fallback
        const textarea = document.createElement('textarea');
        textarea.value = PROFILE.email;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Email copied to clipboard!');
      }
    });
  }

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('toast-visible');
    setTimeout(() => {
      toast.classList.remove('toast-visible');
    }, 2800);
  }
}

/**
 * Dynamic Footer Year
 */
function initFooterYear() {
  const yearEl = document.getElementById('footer-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

/**
 * 7-Second Cinematic Video Loading Screen
 */
function initLoader() {
  const loaderEl = document.getElementById('loader-screen');
  const videoEl = document.getElementById('loader-video');
  const timerEl = document.getElementById('loader-timer');
  const progressBar = document.getElementById('loader-progress-bar');
  const skipBtn = document.getElementById('loader-skip-btn');

  if (!loaderEl) return;

  const DURATION_MS = 7000; // Exactly 7 seconds
  const startTime = performance.now();
  let isDismissed = false;
  let rafId = null;

  // Reduced motion preference
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    dismissLoader(true);
    return;
  }

  // Crop 1 second from beginning and handle seamless video reveal
  const CROP_START = 1.0;

  if (videoEl) {
    videoEl.muted = true;
    videoEl.defaultMuted = true;
    videoEl.playsInline = true;

    const enforceCropTime = () => {
      try {
        if (videoEl.currentTime < CROP_START) {
          videoEl.currentTime = CROP_START;
        }
      } catch (err) {
        // Ignored if readyState is not yet ready
      }
    };

    const makeVideoVisible = () => {
      videoEl.classList.add('video-ready');
    };

    // If metadata is already loaded or partially available
    if (videoEl.readyState >= 1) {
      enforceCropTime();
    } else {
      videoEl.addEventListener('loadedmetadata', enforceCropTime, { once: true });
    }

    videoEl.addEventListener('canplay', enforceCropTime);
    videoEl.addEventListener('seeked', makeVideoVisible, { once: true });
    videoEl.addEventListener('playing', makeVideoVisible, { once: true });

    // Loop boundary guard: prevent returning before 1.0s
    videoEl.addEventListener('timeupdate', () => {
      if (videoEl.currentTime < CROP_START && !videoEl.seeking) {
        enforceCropTime();
      }
    });

    const playPromise = videoEl.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          makeVideoVisible();
        })
        .catch(() => {
          // Autoplay fallback: display the cropped frame
          makeVideoVisible();
        });
    }

    // Safety timeout: guaranteed visibility within 300ms
    setTimeout(makeVideoVisible, 300);
  }

  function tick() {
    if (isDismissed) return;

    const elapsed = performance.now() - startTime;
    const progress = Math.min(1, elapsed / DURATION_MS);

    // Update progress bar
    if (progressBar) {
      progressBar.style.width = `${(progress * 100).toFixed(1)}%`;
    }

    // Update countdown timer text (7s -> 1s -> Ready)
    if (timerEl) {
      const remainingSeconds = Math.max(0, Math.ceil((DURATION_MS - elapsed) / 1000));
      timerEl.textContent = remainingSeconds > 0 ? `${remainingSeconds}s` : 'Ready';
    }

    if (elapsed >= DURATION_MS) {
      dismissLoader();
    } else {
      rafId = requestAnimationFrame(tick);
    }
  }

  function dismissLoader(immediate = false) {
    if (isDismissed) return;
    isDismissed = true;

    if (rafId) cancelAnimationFrame(rafId);

    if (videoEl) {
      try { videoEl.pause(); } catch (e) {}
    }

    document.body.classList.remove('is-loading');

    if (immediate) {
      loaderEl.style.display = 'none';
      return;
    }

    loaderEl.classList.add('loader-hidden');

    // Remove from layout after fade-out transition
    setTimeout(() => {
      loaderEl.style.display = 'none';
    }, 700);
  }

  // Skip button click
  if (skipBtn) {
    skipBtn.addEventListener('click', () => dismissLoader());
  }

  // Escape key to skip
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      dismissLoader();
    }
  });

  // Start the 7-second loop
  rafId = requestAnimationFrame(tick);
}

