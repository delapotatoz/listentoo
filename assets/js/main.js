(() => {
  /**
   * Marquees: duplicate each track so the CSS animation loops seamlessly.
   * The clone is hidden from assistive technologies.
   */
  document.querySelectorAll('[data-marquee]').forEach((marquee) => {
    const track = marquee.querySelector('.marquee__track');
    if (!track) return;

    const clone = track.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    clone.removeAttribute('aria-label');
    marquee.append(clone);

    // Keep a constant speed whatever the content width (~60px/s).
    marquee.style.setProperty('--duration', `${track.scrollWidth / 60}s`);
  });

  /**
   * Burger menu (mobile): toggles the full-screen navigation.
   */
  const burger = document.querySelector('.burger');
  const nav = document.getElementById('nav');

  if (burger && nav) {
    const root = document.documentElement;
    const mobile = window.matchMedia('(max-width: 640px)');

    const setOpen = (open) => {
      root.classList.toggle('is-menu-open', open);
      root.style.overflow = open ? 'hidden' : '';
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
      if (open) window.lenis?.stop(); else window.lenis?.start();
    };

    burger.addEventListener('click', () => setOpen(!root.classList.contains('is-menu-open')));
    nav.addEventListener('click', (event) => { if (event.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && root.classList.contains('is-menu-open')) {
        setOpen(false);
        burger.focus();
      }
    });
    mobile.addEventListener('change', () => setOpen(false));
  }

  /**
   * Contact form: tells the form service where to come back after sending,
   * and shows the confirmation message on return (?envoye=1).
   */
  const form = document.querySelector('[data-contact-form]');

  if (form) {
    const next = form.querySelector('input[name="_next"]');
    if (location.protocol.startsWith('http')) {
      next.value = `${location.origin}${location.pathname}?envoye=1`;
    } else {
      next.remove(); // local file: fall back to the service's own thank-you page
    }

    if (new URLSearchParams(location.search).has('envoye')) {
      form.hidden = true;
      document.querySelector('[data-contact-success]').hidden = false;
    }
  }
})();
