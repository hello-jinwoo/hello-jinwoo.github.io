(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const atCover = ['', '#top', '#main'].includes(location.hash);
  if (!atCover || motion.matches || document.hidden || scrollY > 8) return;

  const root = document.documentElement;
  const events = new AbortController();
  const options = { signal: events.signal };
  const lightMask = new Image();
  lightMask.src = 'assets/portrait-flash-mask.png';
  let deadline;
  let cover;

  function finish(completed = false) {
    if (events.signal.aborted) return;
    clearTimeout(deadline);
    root.classList.remove('portrait-opening');
    cover?.classList.remove('taking-portrait', 'printing-caption');
    events.abort();
    document.dispatchEvent(new CustomEvent('portrait-ended', { detail: { completed: completed === true } }));
  }

  async function start() {
    try {
      cover = document.querySelector('.cover');
      const frame = cover.querySelector('.portrait-frame');
      const photo = frame.querySelector('.portrait-color');
      frame.addEventListener('pointerdown', finish, { ...options, passive: true });
      await Promise.all([
        photo.decode(), lightMask.decode(),
        document.fonts.load('1em "Instrument Serif"', '321Jinwoo'),
        document.fonts.load('italic 1em "Instrument Serif"', 'Kim')
      ]);
      if (events.signal.aborted) return;
      const bounds = frame.getBoundingClientRect();
      if (document.hidden || motion.matches || scrollY > 8 || bounds.bottom <= 0 || bounds.top >= innerHeight) return;
      clearTimeout(deadline);
      cover.classList.add('taking-portrait');
      const exposure = photo.getAnimations().find(animation => animation.animationName === 'develop-portrait');
      if (!exposure) return;
      const release = exposure.effect.getTiming().delay;
      deadline = setTimeout(finish, release + 6500);
      let lowerDoor;
      document.dispatchEvent(new CustomEvent('portrait-started', { detail: {
        release,
        waitForLowerDoor(passage) {
          if (lowerDoor) {
            clearTimeout(deadline);
            deadline = setTimeout(finish, Math.max(release, 6500) + 1800);
          }
          lowerDoor = passage;
        }
      } }));
      await exposure.finished;
      // A visitor can ask for a picture while the bear is still on the lower floor.
      let passage;
      do {
        passage = lowerDoor;
        await passage;
      } while (passage !== lowerDoor);
      if (events.signal.aborted) return;
      cover.classList.add('printing-caption');
      const ink = cover.getAnimations({ subtree: true }).filter(animation => animation.animationName === 'print-caption');
      clearTimeout(deadline);
      deadline = setTimeout(finish, Math.max(0, ...ink.map(animation => animation.effect.getComputedTiming().endTime)) + 400);
      await Promise.all(ink.map(animation => animation.finished));
      finish(true);
    } catch {
      // An unavailable exposure or an interrupted animation goes straight to the finished cover.
    } finally {
      finish();
    }
  }

  motion.addEventListener('change', finish, options);
  document.addEventListener('portrait-skip', finish, options);
  document.addEventListener('visibilitychange', () => { if (document.hidden) finish(); }, options);
  document.addEventListener('keydown', event => { if (event.key === 'Escape') finish(); }, options);
  window.addEventListener('scroll', () => { if (scrollY > 8) finish(); }, { ...options, passive: true });
  window.addEventListener('pagehide', finish, options);
  window.addEventListener('hashchange', finish, options);

  // Restore the full masthead if the image or type cannot be prepared promptly.
  deadline = setTimeout(finish, 900);
  root.classList.add('portrait-opening');
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, options);
  else start();
})();
