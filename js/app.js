/**
 * ==========================================================================
 * EDITORIAL RETRO SCRAPBOOK PORTFOLIO — JAVASCRIPT LOGIC
 * Alish Shrestha (Abyss) — Portfolio Interactions & Dynamic Utilities
 * ==========================================================================
 */

import { initCreative3DElevation } from './creative3d.js';
import { initAnalytics } from './analytics.js';

document.addEventListener('DOMContentLoaded', () => {
  initThemeLoader();
  initDockedNavigation();
  initMobileGlassDrawer();
  initMobileBottomDock();
  initScrollReadingBar();
  initGearInteraction();
  initCatInteraction();
  initContactFormAndCopy();
  initLiveNepalClock();
  initSmoothScroll();
  initSkillProgressHover();
  initCreative3DElevation();
  initAnalytics();
});

/**
 * 1. DOCKED NAVIGATION & ACTIVE SECTION SPY
 */
function initDockedNavigation() {
  const dockedNav = document.getElementById('docked-nav');
  const bottomDock = document.getElementById('mobile-bottom-dock');
  if (!dockedNav) return;

  const sections = document.querySelectorAll('.editorial-section');
  const navLinks = document.querySelectorAll('.docked-links a');
  const dockButtons = document.querySelectorAll('.mobile-dock-btn[data-dock-target]');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Show docked nav once scrolled past hero
    if (scrollY > 340) {
      dockedNav.classList.add('visible');
      if (bottomDock) bottomDock.classList.add('dock-visible');
    } else {
      dockedNav.classList.remove('visible');
      if (bottomDock) bottomDock.classList.remove('dock-visible');
    }

    // Active link highlighting
    let currentSectionId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 140;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    if (scrollY < 340) {
      currentSectionId = 'hero';
    }

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });

    dockButtons.forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-dock-target') === currentSectionId) {
        btn.classList.add('active');
      }
    });
  }, { passive: true });
}

/**
 * 1B. MOBILE GLASSMORPHISM NAVIGATION DRAWER
 */
function initMobileGlassDrawer() {
  const toggleBtn = document.getElementById('mobile-nav-toggle');
  const closeBtn = document.getElementById('mobile-nav-close');
  const overlay = document.getElementById('mobile-glass-overlay');
  const drawer = document.getElementById('mobile-glass-drawer');
  const drawerLinks = document.querySelectorAll('.glass-drawer-link');

  if (!drawer) return;

  function openDrawer() {
    document.body.classList.add('drawer-open');
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
  }

  function closeDrawer() {
    document.body.classList.remove('drawer-open');
    if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openDrawer();
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeDrawer);
  }

  if (overlay) {
    overlay.addEventListener('click', closeDrawer);
  }

  // Close on Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('drawer-open')) {
      closeDrawer();
    }
  });

  // Handle drawer links: smooth scroll and auto-close
  drawerLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetHref = link.getAttribute('href');
      if (targetHref && targetHref.startsWith('#')) {
        e.preventDefault();
        closeDrawer();
        const targetElement = document.querySelector(targetHref);
        if (targetElement) {
          setTimeout(() => {
            targetElement.scrollIntoView({ behavior: 'smooth' });
          }, 200);
        }
      }
    });
  });
}

/**
 * 1C. MOBILE BOTTOM GLASS QUICK DOCK
 */
function initMobileBottomDock() {
  const menuTrigger = document.getElementById('mobile-dock-menu-trigger');
  if (menuTrigger) {
    menuTrigger.addEventListener('click', () => {
      document.body.classList.add('drawer-open');
    });
  }
}

/**
 * 1D. SCROLL READING PROGRESS BAR
 */
function initScrollReadingBar() {
  const bar = document.getElementById('scroll-reading-bar');
  if (!bar) return;

  function updateProgress() {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight <= 0) {
      bar.style.width = '0%';
      return;
    }
    const progress = Math.min(Math.max((window.scrollY / totalHeight) * 100, 0), 100);
    bar.style.width = `${progress}%`;
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });
  updateProgress();
}

/**
 * 2. GEAR INTERACTION & PHYSICS
 */
function initGearInteraction() {
  const gearSlot = document.querySelector('.gear-slot');
  const gearSvg = document.querySelector('.gear-svg');
  if (!gearSlot || !gearSvg) return;

  let currentRotation = 0;

  // Click to spin gear with playful velocity
  gearSlot.addEventListener('click', () => {
    currentRotation += 180;
    gearSvg.style.transform = `rotate(${currentRotation}deg) scale(1.15)`;
    setTimeout(() => {
      gearSvg.style.transform = `rotate(${currentRotation}deg) scale(1)`;
    }, 400);
  });
}

/**
 * 3. PIXEL CAT STICKER INTERACTION
 */
function initCatInteraction() {
  const catWrapper = document.querySelector('.cat-sticker-wrapper');
  if (!catWrapper) return;

  const meowMessages = [
    'Meow! Welcome to the portfolio! ✨',
    'Purrr... Nice to meet you! 🐾',
    'Click "Enter in my world" below! ↓',
    'Crafted with pixel love & coffee ☕'
  ];

  let clickCount = 0;

  catWrapper.addEventListener('click', () => {
    // Playful bounce animation
    catWrapper.style.transform = 'rotate(-12deg) scale(1.25) translateY(-8px)';
    setTimeout(() => {
      catWrapper.style.transform = 'rotate(8deg) scale(1.1)';
      setTimeout(() => {
        catWrapper.style.transform = '';
      }, 200);
    }, 180);

    const message = meowMessages[clickCount % meowMessages.length];
    showToast(message);
    clickCount++;
  });
}

/**
 * 4. CONTACT MESSAGE FORM & 1-CLICK CLIPBOARD COPY
 */
function initContactFormAndCopy() {
  const form = document.getElementById('contact-composer-form');
  if (form) {
    const nameInput = document.getElementById('sender-name');
    const emailInput = document.getElementById('sender-email');
    const messageInput = document.getElementById('sender-message');
    const submitBtn = document.getElementById('form-submit-btn');
    const statusMsg = document.getElementById('form-status-msg');
    const nameError = document.getElementById('name-error');
    const emailError = document.getElementById('email-error');
    const messageError = document.getElementById('message-error');

    // Email validation regex (RFC 5322 compliant subset)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    function clearErrors() {
      if (nameError) nameError.textContent = '';
      if (emailError) emailError.textContent = '';
      if (messageError) messageError.textContent = '';
      if (statusMsg) {
        statusMsg.textContent = '';
        statusMsg.className = 'form-status-msg';
      }
      [nameInput, emailInput, messageInput].forEach(input => {
        if (input) input.classList.remove('is-invalid');
      });
    }

    // Clear error on user typing
    [nameInput, emailInput, messageInput].forEach(input => {
      if (input) {
        input.addEventListener('input', () => {
          input.classList.remove('is-invalid');
          const errorSpan = document.getElementById(`${input.name}-error`);
          if (errorSpan) errorSpan.textContent = '';
        });
      }
    });

    let isSubmitting = false;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (isSubmitting) return;

      clearErrors();

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const message = messageInput ? messageInput.value.trim() : '';

      let hasError = false;

      if (!name || name.length < 2) {
        if (nameError) nameError.textContent = 'Please enter your name (at least 2 characters).';
        if (nameInput) nameInput.classList.add('is-invalid');
        hasError = true;
      }

      if (!email || !emailRegex.test(email)) {
        if (emailError) emailError.textContent = 'Please enter a valid email address.';
        if (emailInput) emailInput.classList.add('is-invalid');
        hasError = true;
      }

      if (!message || message.length < 10) {
        if (messageError) messageError.textContent = 'Please provide a message with at least 10 characters.';
        if (messageInput) messageInput.classList.add('is-invalid');
        hasError = true;
      }

      if (hasError) {
        if (nameInput && nameInput.classList.contains('is-invalid')) nameInput.focus();
        else if (emailInput && emailInput.classList.contains('is-invalid')) emailInput.focus();
        else if (messageInput && messageInput.classList.contains('is-invalid')) messageInput.focus();
        return;
      }

      isSubmitting = true;
      if (submitBtn) {
        submitBtn.disabled = true;
        const btnText = submitBtn.querySelector('.btn-text');
        if (btnText) btnText.textContent = 'Preparing Transmission...';
      }

      const endpoint = form.getAttribute('action');

      if (endpoint && endpoint !== '#' && !endpoint.startsWith('mailto:')) {
        try {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({ name, email, message })
          });

          if (response.ok) {
            form.reset();
            if (statusMsg) {
              statusMsg.textContent = 'Transmission received successfully! I will reply soon. ✨';
              statusMsg.className = 'form-status-msg success';
            }
            showToast('Transmission received! ✨');
          } else {
            throw new Error(`Server returned ${response.status}`);
          }
        } catch (err) {
          if (statusMsg) {
            statusMsg.textContent = 'Online dispatch unavailable. Launching direct email client as fallback...';
            statusMsg.className = 'form-status-msg error';
          }
          const recipient = 'shrestaalish444@gmail.com';
          const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
          const body = encodeURIComponent(`Hi Alish,\n\n${message}\n\nFrom: ${name} (${email})`);
          window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
        } finally {
          isSubmitting = false;
          if (submitBtn) {
            submitBtn.disabled = false;
            const btnText = submitBtn.querySelector('.btn-text');
            if (btnText) btnText.textContent = 'Send Transmission';
          }
        }
      } else {
        const recipient = 'shrestaalish444@gmail.com';
        const subject = encodeURIComponent(`Portfolio Inquiry from ${name}`);
        const body = encodeURIComponent(`Hi Alish,\n\n${message}\n\nFrom: ${name} (${email})`);

        if (statusMsg) {
          statusMsg.textContent = 'Launching your default email client with your prefilled transmission... 🚀';
          statusMsg.className = 'form-status-msg success';
        }
        showToast('Launching email client... 🚀');

        setTimeout(() => {
          window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
          setTimeout(() => {
            isSubmitting = false;
            if (submitBtn) {
              submitBtn.disabled = false;
              const btnText = submitBtn.querySelector('.btn-text');
              if (btnText) btnText.textContent = 'Send Transmission';
            }
          }, 1500);
        }, 300);
      }
    });
  }

  // 1-Click Copy Buttons
  const copyButtons = document.querySelectorAll('[data-copy-text]');
  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const textToCopy = btn.getAttribute('data-copy-text');
      const label = btn.getAttribute('data-copy-label') || 'Text';

      navigator.clipboard.writeText(textToCopy).then(() => {
        showToast(`Copied ${label} to clipboard! 📋`);
      }).catch(() => {
        showToast(`Selected: ${textToCopy}`);
      });
    });
  });
}

/**
 * 5. TOAST NOTIFICATION UTILITY
 */
let toastTimeout;
function showToast(message) {
  let toast = document.getElementById('toast-notice');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-notice';
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

/**
 * 6. LIVE NEPAL TIME CLOCK (ASIA/KATHMANDU UTC+5:45)
 */
function initLiveNepalClock() {
  const clockElement = document.getElementById('nepal-live-clock');
  const drawerClock = document.querySelector('.nepal-clock-drawer');

  function updateClock() {
    try {
      const options = {
        timeZone: 'Asia/Kathmandu',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      const formatter = new Intl.DateTimeFormat('en-US', options);
      const timeStr = formatter.format(new Date()) + ' NPT';
      if (clockElement) clockElement.textContent = timeStr;
      if (drawerClock) drawerClock.textContent = timeStr;
    } catch {
      const fallback = new Date().toLocaleTimeString();
      if (clockElement) clockElement.textContent = fallback;
      if (drawerClock) drawerClock.textContent = fallback;
    }
  }

  updateClock();
  setInterval(updateClock, 1000);
}

/**
 * 7. SMOOTH SCROLLING FOR CTA
 */
function initSmoothScroll() {
  const heroCta = document.querySelector('.hero-cta');
  if (heroCta) {
    heroCta.addEventListener('click', (e) => {
      const targetId = heroCta.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  }
}

/**
 * 8. THEME LOADING SCREEN: SCRAPBOOK & GEAR CALIBRATION
 */
function initThemeLoader() {
  const loader = document.getElementById('theme-loader');
  const barFill = document.getElementById('loader-bar-fill');
  const percentText = document.getElementById('loader-percent-text');
  const statusText = document.getElementById('loader-status-text');
  const skipBtn = document.getElementById('loader-skip-btn');

  if (!loader) return;

  // Respect reduced motion accessibility
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    loader.classList.add('loader-hidden');
    return;
  }

  let progress = 0;
  let timer = null;
  const duration = 1900; // 1.9s for a brisk, satisfying intro
  const intervalTime = 30;
  const step = 100 / (duration / intervalTime);

  function dismissLoader() {
    clearInterval(timer);
    loader.classList.add('loader-hidden');
  }

  // Skip button click handler
  if (skipBtn) {
    skipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      dismissLoader();
    });
  }

  // Keyboard shortcut: Press Escape to skip instantly
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !loader.classList.contains('loader-hidden')) {
      dismissLoader();
    }
  });

  // Start progress sequence
  timer = setInterval(() => {
    progress += step;
    if (progress >= 100) {
      progress = 100;
      clearInterval(timer);
      if (barFill) barFill.style.width = '100%';
      if (percentText) percentText.textContent = '100%';
      if (statusText) statusText.textContent = 'WELCOME TO MY WORLD!';
      setTimeout(dismissLoader, 350);
    } else {
      const rounded = Math.floor(progress);
      if (barFill) barFill.style.width = `${rounded}%`;
      if (percentText) percentText.textContent = `${rounded < 10 ? '0' + rounded : rounded}%`;

      if (statusText) {
        if (rounded < 25) {
          statusText.textContent = 'ASSEMBLING CANVAS...';
        } else if (rounded < 55) {
          statusText.textContent = 'WINDING GEARS...';
        } else if (rounded < 82) {
          statusText.textContent = 'POLISHING PIXELS...';
        } else {
          statusText.textContent = 'PREPARING SCRAPBOOK...';
        }
      }
    }
  }, intervalTime);
}

/**
 * 9. INTERACTIVE SKILL PROFICIENCY LOADING BARS
 * When hovering on skills like Python, JS, etc., smoothly loads
 * the progress bar and dynamically counts up the percentage readout.
 */
function initSkillProgressHover() {
  const skillRows = document.querySelectorAll('.skill-item-row');
  if (!skillRows.length) return;

  skillRows.forEach(row => {
    const targetPct = parseInt(row.getAttribute('data-percent') || '0', 10);
    const progressBar = row.querySelector('.skill-progress-bar');
    const pctLabel = row.querySelector('.skill-pct-label');
    if (!progressBar || !pctLabel) return;

    let animFrame = null;

    function startProgress() {
      row.classList.add('is-hovered');
      progressBar.style.width = `${targetPct}%`;

      const startTime = performance.now();
      const duration = 550; // ms

      function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // easeOutQuart
        const ease = 1 - Math.pow(1 - progress, 4);
        const currentNum = Math.round(ease * targetPct);

        pctLabel.textContent = `${currentNum}%`;

        if (progress < 1) {
          animFrame = requestAnimationFrame(step);
        } else {
          pctLabel.textContent = `${targetPct}%`;
        }
      }

      if (animFrame) cancelAnimationFrame(animFrame);
      animFrame = requestAnimationFrame(step);
    }

    function resetProgress() {
      row.classList.remove('is-hovered');
      progressBar.style.width = '0%';
      if (animFrame) cancelAnimationFrame(animFrame);
      pctLabel.textContent = '0%';
    }

    // Hover events for desktop
    row.addEventListener('mouseenter', startProgress);
    row.addEventListener('mouseleave', resetProgress);

    // Touch / tap events for mobile
    row.addEventListener('touchstart', () => {
      startProgress();
    }, { passive: true });
  });
}



