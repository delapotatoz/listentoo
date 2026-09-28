/**
 * Motion — smooth scrolling (Lenis) and scroll-triggered reveals.
 * Everything is skipped when the visitor prefers reduced motion.
 */
(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ---------- Smooth scrolling ---------- */
  if (window.Lenis) {
    // Exposed so other scripts can pause it (e.g. while the menu is open).
    window.lenis = new window.Lenis({
      autoRaf: true,
      anchors: true,   // smooth scroll for in-page links (#contact…)
      lerp: 0.09,
    });
  }

  /* ---------- Reveals ----------
     Single elements fade/slide in on their own; groups reveal their
     children one after the other. */
  const SINGLE = [
    '.section .title:not(.contact *)',
    '.section .lead:not(.contact *)',
    '.hook .btn',
    '.refs__text',
    '.oktav__logo',
    '.oktav__head .btn',
    '.human__visual',
    '.marquee',
    '.contact',
    '.contact-card',
    '.legal__block',
    '.footer__top',
    '.footer__bottom',
  ];

  const GROUPS = [
    '.pillars__list',
    '.roles',
    '.steps',
    '.team',
    '.join__list',
  ];

  const STAGGER = 90; // ms between siblings
  const MAX_STEPS = 6;

  const targets = new Set(document.querySelectorAll(SINGLE.join(',')));

  document.querySelectorAll(GROUPS.join(',')).forEach((group) => {
    [...group.children].forEach((child, i) => {
      child.style.setProperty('--reveal-delay', `${Math.min(i, MAX_STEPS) * STAGGER}ms`);
      targets.add(child);
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(({ isIntersecting, target }) => {
      if (!isIntersecting) return;
      target.classList.add('is-revealed');
      observer.unobserve(target);
    });
  }, { rootMargin: '0px 0px -12% 0px' });

  targets.forEach((el) => {
    el.classList.add('reveal');
    observer.observe(el);
  });
})();
