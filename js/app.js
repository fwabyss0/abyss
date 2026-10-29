/**
 * ==========================================================================
 * EDITORIAL RETRO SCRAPBOOK PORTFOLIO — JAVASCRIPT LOGIC
 * Alish Shrestha (Abyss) — Portfolio Interactions & Dynamic Utilities
 * ==========================================================================
 */

document.addEventListener('DOMContentLoaded', () => {
  initDockedNavigation();
  initGearInteraction();
  initCatInteraction();
  initContactFormAndCopy();
  initLiveNepalClock();
  initSmoothScroll();
});

/**
 * 1. DOCKED NAVIGATION & ACTIVE SECTION SPY
 */
function initDockedNavigation() {
  const dockedNav = document.getElementById('docked-nav');
  if (!dockedNav) return;

  const sections = document.querySelectorAll('.editorial-section');
  const navLinks = document.querySelectorAll('.docked-links a');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Show docked nav once scrolled past hero
    if (scrollY > 380) {
      dockedNav.classList.add('visible');
    } else {
      dockedNav.classList.remove('visible');
    }

    // Active link highlighting
    let currentSectionId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSectionId}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
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
  // Form submission via mailto link
  const form = document.getElementById('contact-composer-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('sender-name');
      const emailInput = document.getElementById('sender-email');
      const messageInput = document.getElementById('sender-message');

      const name = nameInput ? nameInput.value.trim() : '';
      const email = emailInput ? emailInput.value.trim() : '';
      const message = messageInput ? messageInput.value.trim() : '';

      if (!message) {
        showToast('Please enter a message first! ✍️');
        return;
      }

      const recipient = 'shrestaalish444@gmail.com';
      const subject = encodeURIComponent(`Portfolio Inquiry from ${name || 'Collaborator'}`);
      const body = encodeURIComponent(`Hi Alish,\n\n${message}\n\nFrom: ${name} (${email})`);

      window.location.href = `mailto:${recipient}?subject=${subject}&body=${body}`;
      showToast('Opening your email client... 🚀');
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
  if (!clockElement) return;

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
      clockElement.textContent = formatter.format(new Date()) + ' NPT';
    } catch {
      clockElement.textContent = new Date().toLocaleTimeString();
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
