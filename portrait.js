(() => {
  const frame = document.querySelector('.portrait-frame');
  const toggle = frame.querySelector('.portrait-toggle');
  const face = frame.querySelector('.blade-face');
  const seam = frame.querySelector('.blade-seam');
  const ring = frame.querySelector('.blade-ring');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const bladeCount = 9;
  const pitch = 2 * Math.PI / bladeCount;
  const cos = Math.cos(pitch);
  const sin = Math.sin(pitch);
  const openRadius = 224;
  const rim = [202, -227];
  let animation = 0;
  const readyRadius = 146;
  const hint = frame.querySelector('.shoot-hint');

  for (let index = 0; index < bladeCount; index++) {
    const blade = document.createElementNS(ring.namespaceURI, 'use');
    blade.setAttribute('href', '#aperture-blade');
    blade.setAttribute('transform', 'rotate(' + index * 360 / bladeCount + ')');
    ring.append(blade);
  }

  function nextBlade([x, y]) {
    return [x * cos - y * sin, x * sin + y * cos];
  }

  // Each leaf ends at the swept edge of its neighbour, at every aperture size.
  const nextRim = nextBlade(rim);
  function drawIris(radius, centerOffset) {
    const closed = (openRadius - radius) / (openRadius - 1.4);
    const tip = [radius, 0];
    const innerControl = [radius * .925, radius * .337];
    const sweep = [radius + (275 - radius) * .6, -17 - 13 * closed];
    const outline = 'M' + tip + 'Q' + innerControl + ' ' + nextBlade(tip) +
      'Q' + nextBlade(sweep) + ' ' + nextRim + 'A304 304 0 0 0 ' + rim +
      'Q' + sweep + ' ' + tip + 'Z';
    face.setAttribute('d', outline);
    seam.setAttribute('d', 'M' + tip + 'Q' + sweep + ' ' + rim);
    ring.setAttribute('transform', 'translate(0 ' + centerOffset + ') rotate(' + (-16 + 26 * closed) + ')');
  }

  function settle() {
    cancelAnimationFrame(animation);
    animation = 0;
    frame.classList.remove('is-exposing');
  }

  function ease(t) {
    return t * t * (3 - 2 * t);
  }

  function showCurrentImage() {
    frame.classList.toggle('is-developed', toggle.checked);
  }

  function capture() {
    drawIris(readyRadius, 38);
    frame.classList.add('is-exposing');
    const start = performance.now();
    const closeMs = 178;
    const openAt = closeMs + 22;
    const openMs = 278;

    function tick(now) {
      const elapsed = Math.max(0, now - start);
      if (elapsed >= openAt + openMs) {
        showCurrentImage();
        settle();
        return;
      }
      const closed = elapsed < openAt
        ? ease(Math.min(1, elapsed / closeMs))
        : 1 - ease((elapsed - openAt) / openMs);
      const closing = elapsed < openAt;
      const outerRadius = closing ? readyRadius : openRadius;
      drawIris(outerRadius + (1.4 - outerRadius) * closed, closing ? 38 * (1 - closed) : 0);
      if (elapsed >= closeMs) showCurrentImage();
      animation = requestAnimationFrame(tick);
    }
    animation = requestAnimationFrame(tick);
  }

  function syncPortrait() {
    settle();
    hint.textContent = toggle.checked ? 'Back to RAW' : 'Click to shoot 📸';
    if (toggle.checked && !reducedMotion.matches) {
      capture();
    } else {
      drawIris(readyRadius, 38);
      showCurrentImage();
    }
  }

  function positionHint(event) {
    if (event.pointerType === 'touch') return;
    const rect = frame.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const gap = 13;
    const left = x + gap + hint.offsetWidth < rect.width ? x + gap : x - hint.offsetWidth - gap;
    const top = y + gap + hint.offsetHeight < rect.height ? y + gap : y - hint.offsetHeight - gap;
    frame.style.setProperty('--hint-x', Math.max(2, left) + 'px');
    frame.style.setProperty('--hint-y', Math.max(2, top) + 'px');
    frame.classList.add('has-pointer');
  }

  frame.addEventListener('pointerenter', positionHint);
  frame.addEventListener('pointermove', positionHint);
  frame.addEventListener('pointerleave', () => frame.classList.remove('has-pointer'));
  toggle.addEventListener('change', syncPortrait);
  reducedMotion.addEventListener('change', () => {
    settle();
    drawIris(readyRadius, 38);
    showCurrentImage();
  });
  frame.classList.add('has-iris');
  drawIris(readyRadius, 38);
  showCurrentImage();
})();
