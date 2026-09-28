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
