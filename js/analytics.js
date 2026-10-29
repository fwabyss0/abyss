/**
 * ==========================================================================
 * PRIVACY-CONSCIENTIOUS GOOGLE ANALYTICS 4 ENGINE
 * Alish Shrestha (Abyss) — Portfolio Analytics Preparation
 * ==========================================================================
 * - Checks for genuine window.GA_MEASUREMENT_ID or meta tag
 * - Zero PII transmission (form inputs and personal messages are excluded)
 * - Single deduplicated page views for initial load and hash navigation
 * - Graceful fallback / standby mode when unconfigured
 */

export function initAnalytics() {
  // Retrieve Measurement ID from window configuration, meta tag, or environment
  const metaTag = document.querySelector('meta[name="ga-measurement-id"]');
  const measurementId = window.GA_MEASUREMENT_ID || (metaTag ? metaTag.getAttribute('content') : null);

  if (!measurementId || measurementId === 'G-XXXXXXXXXX') {
    // Standby mode: cleanly documented, no console spam, no fake requests
    return {
      status: 'standby',
      message: 'GA4 ready. Define window.GA_MEASUREMENT_ID or <meta name="ga-measurement-id" content="G-..."> to activate tracking.'
    };
  }

  // Inject Google Tag Manager script
  if (!document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${measurementId}"]`)) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', measurementId, {
      anonymize_ip: true,
      send_page_view: true
    });

    // Track hash-based section transitions without duplicating full page loads
    let lastSection = window.location.hash || '#hero';
    window.addEventListener('hashchange', () => {
      const currentSection = window.location.hash || '#hero';
      if (currentSection !== lastSection) {
        lastSection = currentSection;
        gtag('event', 'page_view', {
          page_path: window.location.pathname + currentSection,
          page_title: document.title + ' — ' + currentSection.replace('#', '')
        });
      }
    }, { passive: true });
  }

  return { status: 'active', id: measurementId };
}
