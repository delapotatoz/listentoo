/**
 * Theme switch — dark ("nuit", default) / light ("jour").
 * The saved choice is applied before first paint by the inline script in <head>;
 * this file wires the toggle and tells the canvases to repaint ("themechange").
 *
 * The switch uses the View Transitions API: the browser snapshots the whole page
 * and reveals the new theme in one piece (a circle growing from the toggle), so
 * nothing flickers. Browsers without the API switch instantly.
 */
(() => {
  const root = document.documentElement;
  const toggles = document.querySelectorAll('.theme-toggle');
  const meta = document.querySelector('meta[name="theme-color"]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const current = () => (root.dataset.theme === 'light' ? 'light' : 'dark');

  const sync = () => {
    const light = current() === 'light';
    toggles.forEach((toggle) => toggle.setAttribute('aria-checked', String(light)));
    meta?.setAttribute('content', light ? '#f4f4ef' : '#000000');
  };

  const apply = (theme) => {
    root.dataset.theme = theme;
    try { localStorage.setItem('theme', theme); } catch { /* private mode */ }
    sync();
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  };

  const setTheme = (theme, toggle) => {
    if (!document.startViewTransition) {
      apply(theme);
      return;
    }

    // Reduced motion: the browser's default short cross-fade.
    if (reducedMotion.matches) {
      document.startViewTransition(() => apply(theme));
      return;
    }

    // Circle reveal from the center of the toggle.
    const { left, top, width, height } = toggle.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    root.classList.add('is-theme-switching');
    const transition = document.startViewTransition(() => apply(theme));

    transition.ready.then(() => {
      root.animate(
        { clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 700, easing: 'cubic-bezier(.2, .7, .2, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    });
    transition.finished.finally(() => root.classList.remove('is-theme-switching'));
  };

  toggles.forEach((toggle) => {
    toggle.addEventListener('click', () => setTheme(current() === 'light' ? 'dark' : 'light', toggle));
  });

  sync();
})();
