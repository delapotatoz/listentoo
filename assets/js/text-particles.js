/**
 * Text particles — vanilla port of the Framer "TextParticles" component.
 * The text is sampled into a grid of dots that are pushed away by the pointer
 * and spring back to their place.
 *
 * Usage:
 *   <div data-text-particles="CX\nIS\nHU\nMAN">
 *     <img …>  ← static fallback, hidden once the canvas is live
 *   </div>
 * The font size is derived from the element's width (the text always fits).
 */
(() => {
  const SETTINGS = {
    fontFamily: '"Didot", "Bodoni Moda", serif',
    lineHeight: 0.8,
    particleColor: '#ffffff',
    particleSize: 2,
    resolution: 3,     // px between sampled dots
    repelRadius: 100,
    repelForce: 0.8,
    returnSpeed: 0.15,
    bleed: 140,        // extra canvas room around the text so pushed dots stay visible
    hairline: 0.025,   // stroke width added before sampling (× font size)
  };

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function init(root, settings = SETTINGS) {
    const lines = root.dataset.textParticles.split('\\n');
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.className = 'text-particles';
    root.append(canvas);

    const ctx = canvas.getContext('2d');
    const pointer = { x: -1e4, y: -1e4 };
    const { bleed } = settings;
    canvas.style.inset = `${-bleed}px`;
    let particles = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let visible = false;

    const font = (size) => `italic ${size}px ${settings.fontFamily}`;

    // Sample the text into particle "home" positions (CSS pixels).
    const build = () => {
      width = root.clientWidth;
      if (!width) return;

      const probe = document.createElement('canvas').getContext('2d');
      probe.font = font(100);
      const widest = Math.max(...lines.map((line) => probe.measureText(line).width));
      const fontSize = (width / (widest + 50)) * 100; // keeps the Framer 0.5em safety margin
      const lineHeight = fontSize * settings.lineHeight;
      height = Math.ceil(lines.length * lineHeight + fontSize * 0.5);
      root.style.height = `${height}px`;

      // The canvas overflows the element by `bleed` on every side.
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round((width + bleed * 2) * dpr);
      canvas.height = Math.round((height + bleed * 2) * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, bleed * dpr, bleed * dpr);

      const off = document.createElement('canvas');
      off.width = width;
      off.height = height;
      const offCtx = off.getContext('2d', { willReadFrequently: true });
      offCtx.fillStyle = settings.particleColor;
      offCtx.font = font(fontSize);
      offCtx.textBaseline = 'top';
      // A thin stroke keeps the Didone hairlines from falling between samples.
      offCtx.strokeStyle = settings.particleColor;
      offCtx.lineWidth = fontSize * settings.hairline;
      lines.forEach((line, i) => {
        const y = i * lineHeight + fontSize * 0.1;
        offCtx.fillText(line, 0, y);
        offCtx.strokeText(line, 0, y);
      });

      const { data } = offCtx.getImageData(0, 0, width, height);
      const scatter = reducedMotion.matches ? 0 : 20;
      particles = [];
      for (let y = 0; y < height; y += settings.resolution) {
        for (let x = 0; x < width; x += settings.resolution) {
          const i = (y * width + x) * 4;
          if (data[i + 3] > 128) {
            particles.push({
              baseX: x,
              baseY: y,
              x: x + (Math.random() - 0.5) * scatter,
              y: y + (Math.random() - 0.5) * scatter,
              density: Math.random() * 30 + 1,
              color: `rgb(${data[i]},${data[i + 1]},${data[i + 2]})`,
            });
          }
        }
      }
      root.classList.add('is-live');
    };

    const step = () => {
      const { repelRadius, repelForce, returnSpeed, particleSize } = settings;
      ctx.clearRect(-bleed, -bleed, width + bleed * 2, height + bleed * 2);

      for (const p of particles) {
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, particleSize, particleSize);

        const dx = pointer.x - p.x;
        const dy = pointer.y - p.y;
        const distance = Math.hypot(dx, dy) || 1;

        if (distance < repelRadius) {
          const force = ((repelRadius - distance) / repelRadius) * p.density * repelForce;
          p.x -= (dx / distance) * force;
          p.y -= (dy / distance) * force;
        } else {
          p.x -= (p.x - p.baseX) * returnSpeed;
          p.y -= (p.y - p.baseY) * returnSpeed;
        }
      }

      frame = visible ? requestAnimationFrame(step) : 0;
    };

    const start = () => {
      if (!frame) frame = requestAnimationFrame(step);
    };

    // The canvas ignores pointer events (it overlaps the text column),
    // so the pointer is tracked on the window, relative to the text box.
    const setPointer = (event) => {
      if (!visible) return;
      const rect = root.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    };
    const clearPointer = () => { pointer.x = -1e4; pointer.y = -1e4; };

    window.addEventListener('pointermove', setPointer, { passive: true });
    window.addEventListener('pointerdown', setPointer, { passive: true });
    document.documentElement.addEventListener('pointerleave', clearPointer);
    window.addEventListener('pointerup', (event) => {
      if (event.pointerType !== 'mouse') clearPointer();
    });

    // Rebuild when the element is resized; animate only while on screen.
    let lastWidth = 0;
    new ResizeObserver(() => {
      if (root.clientWidth === lastWidth) return;
      lastWidth = root.clientWidth;
      build();
      start();
    }).observe(root);

    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
    }).observe(root);
  }

  document.querySelectorAll('[data-text-particles]').forEach((root) => {
    // Wait for the serif font so the sampled shape is the right one.
    document.fonts.load(`italic 100px ${SETTINGS.fontFamily}`).finally(() => init(root));
  });
})();
