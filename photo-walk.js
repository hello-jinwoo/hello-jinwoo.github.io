(() => {
  const stage = document.querySelector('.photo-walk');
  if (!stage) return;
  const header = stage.closest('header');
  const frame = document.querySelector('.portrait-frame');
  const photo = frame.querySelector('.portrait-color');
  const actor = stage.querySelector('.bear-actor');
  const shutterButton = actor.querySelector('.photographer-button');
  const bubble = shutterButton.querySelector('.count-bubble');
  const status = stage.querySelector('.bear-status');
  const bearArt = actor.querySelector('.bear-art');
  const legs = Array.from(actor.querySelectorAll('.bear-leg'), leg => ({
    shin: leg.querySelector('.bear-shin'), pad: leg.querySelector('.bear-pad')
  }));
  const subject = stage.querySelector('.walk-subject');
  const pause = header.querySelector('.walk-switch');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const template = stage.querySelector('.door-template');
  const [lowerDoor, upperDoor] = ['portrait', 'header'].map(level => {
    const door = template.content.firstElementChild.cloneNode(true);
    door.dataset.level = level;
    subject.before(door);
    return door;
  });
  let running;
  let waitForLowerDoor;
  let x = 0;
  let shotBag = [];
  let lastSubject;
  let paused = false;
  let canAnimate = typeof actor.animate === 'function';
  let onScreen = header.getBoundingClientRect().bottom > 0;
  let stageWidth = stage.getBoundingClientRect().width;
  const random = (low, high) => low + (high - low) * Math.random();
  const clamp = (n, low, high) => Math.min(high, Math.max(low, n));

  function wait(ms, signal) {
    return new Promise((resolve, reject) => {
      signal.throwIfAborted();
      const timer = setTimeout(() => { signal.removeEventListener('abort', cancel); resolve(); }, ms);
      function cancel() { clearTimeout(timer); reject(signal.reason); }
      signal.addEventListener('abort', cancel, { once: true });
    });
  }

  function play(sequence) {
    running?.abort();
    const controller = new AbortController();
    running = controller;
    return sequence(controller.signal).catch(() => {
      if (!controller.signal.aborted) { canAnimate = false; park(); }
    });
  }

  function bounds() {
    const base = stage.getBoundingClientRect();
    const height = shutterButton.getBoundingClientRect().height;
    const separateRow = getComputedStyle(header).paddingBottom !== '0px';
    const nav = header.querySelector('nav').getBoundingClientRect();
    const tools = header.querySelector('.masthead-tools').getBoundingClientRect();
    const left = separateRow ? base.width * .16 : Math.max(base.width * .27, nav.right - base.left + height * .68);
    const right = separateRow ? base.width * .84 : Math.min(base.width * .73, tools.left - base.left - height * .68);
    return { left, right, middle: clamp(base.width * .5, left, right), base, height };
  }

  function place(nextX, floor = 0) {
    x = nextX;
    actor.style.transform = 'translate(' + x + 'px, ' + floor + 'px)';
  }

  // One paw rolls off its toes and swings forward while its partner stays on the ground.
  const swingPoses = [
    { phase: 0, lift: 0, tilt: 0 }, { phase: .18, lift: 1.25, tilt: 8 },
    { phase: .45, lift: 3.9, tilt: 1 }, { phase: .66, lift: 3.25, tilt: -10 },
    { phase: .86, lift: 1.05, tilt: -5 }, { phase: 1, lift: 0, tilt: 0 }
  ];

  function footPose(track, offset, advance, lift, tilt) {
    // The ankle sits seven drawing units below the hip. Only the shin flexes.
    track.shin.push({ offset, transform: `matrix(1, 0, ${advance / 7}, ${1 - lift / 7}, 0, 0)` });
    track.pad.push({ offset, transform: `translate(${advance}px, ${-lift}px) rotate(${tilt}deg)` });
  }

  async function walk(nextX, floor, duration, signal) {
    signal.throwIfAborted();
    const from = x;
    const steps = Math.max(2, Math.round(duration / 320));
    const stepWidth = (nextX - from) / (steps - 1);
    const stride = Math.abs(stepWidth) * bearArt.viewBox.baseVal.height / shutterButton.getBoundingClientRect().height;
    const travel = [];
    const paws = legs.map(() => ({ shin: [], pad: [] }));
    for (let step = 0; step < steps; step++) {
      const first = step === 0;
      const last = step === steps - 1;
      const lead = step % 2;
      const plantedStart = first ? 0 : .5;
      for (const { phase, lift, tilt } of swingPoses) {
        if (step && phase === 0) continue;
        const offset = (step + phase) / steps;
        // Two half-length steps bookend a steady walk and bring both paws together at the stop.
        let progress = phase;
        if (first) progress = phase * phase / 2;
        else if (last) progress = phase * (1 - phase / 2);
        const worldX = from + ((first ? 0 : step - .5) + progress) * stepWidth;
        travel.push({ offset, transform: `translate(${worldX}px, ${floor}px)` });
        footPose(paws[1 - lead], offset, (plantedStart - progress) * stride, 0, 0);
        const swing = phase * phase * (3 - 2 * phase) * (first || last ? 1 : 2);
        footPose(paws[lead], offset, (swing - plantedStart - progress) * stride, lift, tilt);
      }
    }
    actor.style.setProperty('--footfall', duration / steps + 'ms');
    actor.dataset.facing = nextX < from ? 'left' : 'right';
    actor.dataset.pose = 'walk';
    place(nextX, floor);
    const tracks = [actor.animate(travel, { duration })];
    for (const [i, leg] of legs.entries()) {
      tracks.push(leg.shin.animate(paws[i].shin, { duration }), leg.pad.animate(paws[i].pad, { duration }));
    }
    const cancel = () => tracks.forEach(track => track.cancel());
    signal.addEventListener('abort', cancel, { once: true });
    try { await Promise.all(tracks.map(track => track.finished)); }
    finally { signal.removeEventListener('abort', cancel); cancel(); }
    signal.throwIfAborted();
    actor.dataset.pose = 'stand';
  }

  // The portrait exposure is the shutter cue. A missed browser event gets the same CSS delay.
  function shutterCue(release, signal) {
    return new Promise((resolve, reject) => {
      const backup = setTimeout(done, release + 160);
      function clean() {
        clearTimeout(backup);
        photo.removeEventListener('animationstart', started);
        signal.removeEventListener('abort', cancel);
      }
      function started(event) { if (event.animationName === 'develop-portrait') done(); }
      function done() { clean(); resolve(); }
      function cancel() { clean(); reject(signal.reason); }
      photo.addEventListener('animationstart', started);
      signal.addEventListener('abort', cancel, { once: true });
    });
  }

  function positionDoor(door, left, floor) {
    door.style.left = left + 'px';
    door.style.setProperty('--floor', floor + 'px');
  }

  async function enterLowerDoor(release, signal) {
    const { base, height } = bounds();
    const picture = frame.getBoundingClientRect();
    const floor = frame.closest('.cover').getBoundingClientRect().bottom - base.top - 3;
    const leftOfPicture = picture.left - base.left - Math.max(height * 1.7, picture.width * .45);
    const cameraX = clamp(leftOfPicture, height * .65, base.width * .045 + height * 1.95);
    const entranceX = Math.max(-height * .12, cameraX - height * 1.95);
    place(entranceX, floor);
    actor.dataset.facing = 'right';
    stage.dataset.place = 'portrait';
    actor.classList.add('arriving');
    async function approach() {
      await wait(170, signal);
      await walk(cameraX, floor, Math.max(200, release - 1080), signal);
      actor.classList.remove('arriving');
      actor.dataset.pose = 'aim-up';
    }
    await Promise.all([approach(), shutterCue(release, signal)]);
    actor.classList.add('firing');
    await wait(340, signal);
    actor.classList.remove('firing');
    await useLowerDoor(cameraX + height * .89, floor, height, signal);
  }

  async function useLowerDoor(lowerX, floor, height, signal) {
    positionDoor(lowerDoor, lowerX, floor);
    actor.dataset.pose = 'notice';
    stage.dataset.place = 'passage';
    lowerDoor.classList.add('visible');
    await wait(260, signal);
    await walk(lowerX - height * .28, floor, 950, signal);
    actor.dataset.pose = 'open-door';
    lowerDoor.classList.add('open');
    await wait(180, signal);
    actor.classList.add('at-threshold');
    shutterButton.inert = true;
    await walk(lowerX, floor, 510, signal);
    lowerDoor.classList.remove('open');
    await Promise.all(lowerDoor.querySelector('.door-panel').getAnimations().map(animation => animation.finished));
    signal.throwIfAborted();
    lowerDoor.classList.remove('visible');
    await Promise.all(lowerDoor.getAnimations().map(animation => animation.finished));
  }

  async function leaveUpperDoor(signal) {
    await wait(1000, signal);
    const { middle, right, height } = bounds();
    const exitX = Math.min(right, middle + height * .76);
    positionDoor(upperDoor, middle, 0);
    place(middle, 0);
    upperDoor.classList.add('visible', 'open');
    await wait(500, signal);
    actor.classList.remove('at-threshold');
    shutterButton.inert = false;
    await walk(exitX, 0, 1150, signal);
    upperDoor.classList.remove('open');
    await wait(670, signal);
    upperDoor.classList.remove('visible');
    park(true, 650);
  }

  function nextSubject() {
    if (!shotBag.length) {
      shotBag = ['pine', 'flower', 'snow', 'puppy', 'leaf'];
      for (let i = shotBag.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shotBag[i], shotBag[j]] = [shotBag[j], shotBag[i]];
      }
      const end = shotBag.length - 1;
      if (shotBag[end] === lastSubject) [shotBag[0], shotBag[end]] = [shotBag[end], shotBag[0]];
    }
    lastSubject = shotBag.pop();
    return lastSubject;
  }

  async function patrol(signal, firstDelay) {
    await wait(firstDelay, signal);
    while (!signal.aborted) {
      const { left, right, height } = bounds();
      const span = right - left;
      if (span < height * 1.4) return;
      const clearance = Math.min(height * 1.65, span * .27);
      const nearbyLeft = Math.max(left, x - height * 3.55);
      const nearbyRight = Math.min(right, x + height * 3.55);
      const leftRoom = Math.max(0, x - clearance - nearbyLeft);
      const rightRoom = Math.max(0, nearbyRight - x - clearance);
      const leftSide = Math.random() * (leftRoom + rightRoom) < leftRoom;
      const target = leftSide ? random(nearbyLeft, x - clearance) : random(x + clearance, nearbyRight);
      const side = leftSide ? -1 : 1;
      const stop = target - side * Math.min(height * 1.03, span * .17);
      subject.style.left = target + 'px';
      subject.dataset.subject = nextSubject();
      subject.toggleAttribute('data-reverse', leftSide);
      subject.classList.add('visible');
      await wait(420, signal);
      actor.dataset.facing = leftSide ? 'left' : 'right';
      actor.dataset.pose = 'notice';
      await wait(360, signal);
      await walk(stop, 0, Math.max(950, Math.abs(stop - x) / height * 1720), signal);
      actor.dataset.pose = 'aim';
      await wait(430, signal);
      actor.classList.add('firing');
      await wait(330, signal);
      actor.classList.remove('firing');
      await wait(340, signal);
      actor.dataset.pose = 'stand';
      await wait(960, signal);
      subject.classList.remove('visible');
      await wait(random(3200, 6100), signal);
    }
  }

  function finishVisitorPose() {
    delete actor.dataset.visitor;
    bubble.removeAttribute('data-visible');
  }

  async function photographVisitor(signal, position, floor) {
    const { base, height } = bounds();
    stage.dataset.place = 'visitor';
    place(position, floor);
    subject.classList.remove('visible');
    lowerDoor.classList.remove('visible', 'open');
    upperDoor.classList.remove('visible', 'open');
    actor.classList.remove('firing', 'arriving');
    actor.dataset.pose = 'stand';
    actor.dataset.visitor = 'look';
    status.textContent = 'The bear is counting down.';
    for (const number of ['3', '2', '1']) {
      bubble.textContent = number;
      bubble.setAttribute('data-visible', '');
      if (number === '2') actor.dataset.visitor = 'aim';
      await wait(730, signal);
    }
    bubble.removeAttribute('data-visible');
    actor.dataset.visitor = 'shot';
    status.textContent = 'Click! The bear took your picture.';
    await wait(370, signal);
    actor.dataset.visitor = 'look';
    await wait(540, signal);
    finishVisitorPose();
    if (floor > 1 && canAnimate && !motion.matches) {
      const doorX = Math.min(position + height * .89, base.width - height / 2);
      await useLowerDoor(doorX, floor, height, signal);
      if (!waitForLowerDoor) await leaveUpperDoor(signal);
    } else {
      park(true, 1300);
    }
  }

  function park(keepPosition = false, firstDelay = 1100) {
    const current = actor.getBoundingClientRect().left - stage.getBoundingClientRect().left;
    running?.abort();
    const { left, right, middle } = bounds();
    stage.dataset.place = 'lane';
    shutterButton.inert = false;
    finishVisitorPose();
    actor.classList.remove('firing', 'arriving', 'at-threshold');
    actor.dataset.pose = 'stand';
    lowerDoor.classList.remove('visible', 'open');
    upperDoor.classList.remove('visible', 'open');
    subject.classList.remove('visible');
    pause.hidden = motion.matches || !canAnimate;
    place(keepPosition ? clamp(current, left, right) : middle);
    if (canAnimate && !paused && onScreen && !document.hidden && !motion.matches) play(signal => patrol(signal, firstDelay));
  }

  function resetWalk() {
    if (stage.dataset.place !== 'lane') document.dispatchEvent(new Event('portrait-skip'));
    park(stage.dataset.place === 'lane');
  }

  stage.dataset.ready = '';
  stage.dataset.place = 'waiting';
  shutterButton.disabled = false;
  shutterButton.addEventListener('click', () => {
    if (actor.hasAttribute('data-visitor') || actor.classList.contains('at-threshold') || stage.dataset.place === 'waiting') return;
    // Read the animated position before interrupting a step, so the bear turns on the spot.
    const here = actor.getBoundingClientRect();
    const base = stage.getBoundingClientRect();
    const position = here.left - base.left;
    const floor = here.top - base.top;
    const reaction = play(signal => photographVisitor(signal, position, floor));
    if (floor > 1) waitForLowerDoor?.(reaction);
  });
  document.addEventListener('portrait-started', ({ detail }) => {
    waitForLowerDoor = detail.waitForLowerDoor;
    waitForLowerDoor(play(signal => enterLowerDoor(detail.release, signal)));
  });
  document.addEventListener('portrait-ended', ({ detail }) => {
    waitForLowerDoor = undefined;
    if (!detail.completed) park();
    else if (stage.dataset.place === 'passage') play(leaveUpperDoor);
  });
  if (!document.documentElement.classList.contains('portrait-opening')) park();
  motion.addEventListener('change', resetWalk);
  document.addEventListener('visibilitychange', resetWalk);
  window.addEventListener('pagehide', () => running?.abort());
  window.addEventListener('pageshow', event => { if (event.persisted) resetWalk(); });
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting === onScreen) return;
    onScreen = entry.isIntersecting;
    resetWalk();
  }).observe(header);
  new ResizeObserver(() => {
    const width = stage.getBoundingClientRect().width;
    if (Math.abs(width - stageWidth) < 24) return;
    stageWidth = width;
    if (stage.dataset.place !== 'waiting') resetWalk();
  }).observe(header);
  pause.addEventListener('click', () => {
    paused = !paused;
    pause.setAttribute('aria-pressed', String(paused));
    pause.title = paused ? 'Resume the photo walk' : 'Pause the photo walk';
    park(true, 300);
  });
})();
