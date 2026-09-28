/**
 * Theme switch — dark ("nuit", default) / light ("jour").
 * The saved choice is applied before first paint by the inline script in <head>;
 * this file wires the toggle and tells the canvases to repaint ("themechange").
 */
(() => {
  const root = document.documentElement;
  const toggles = document.querySelectorAll('.theme-toggle');
  const meta = document.querySelector('meta[name="theme-color"]');

  const current = () => (root.dataset.theme === 'light' ? 'light' : 'dark');

  const sync = () => {
    const light = current() === 'light';
    toggles.forEach((toggle) => toggle.setAttribute('aria-checked', String(light)));
    meta?.setAttribute('content', light ? '#f4f4ef' : '#000000');
  };

  const setTheme = (theme) => {
    // Colors fade during the switch only (not on page load).
    root.classList.add('theme-transition');
    root.dataset.theme = theme;
    try { localStorage.setItem('theme', theme); } catch { /* private mode */ }
    sync();
    document.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
    setTimeout(() => root.classList.remove('theme-transition'), 450);
  };

  toggles.forEach((toggle) => {
    toggle.addEventListener('click', () => setTheme(current() === 'light' ? 'dark' : 'light'));
  });

  sync();
})();
