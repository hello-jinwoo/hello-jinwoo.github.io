(() => {
  const stage = document.querySelector('.reader-stage');
  const button = stage.querySelector('.reader-button');
  const status = stage.querySelector('.bear-status');
  let timer;
  let inView = true;

  function returnToReading() {
    clearTimeout(timer);
    stage.removeAttribute('data-idea');
    status.textContent = '';
  }

  function updateVisibility() {
    const resting = document.hidden || !inView;
    stage.toggleAttribute('data-resting', resting);
    if (resting) returnToReading();
  }

  button.disabled = false;
  button.addEventListener('click', () => {
    if (stage.hasAttribute('data-idea')) return;
    stage.setAttribute('data-idea', '');
    status.textContent = 'Aha! The bear had an idea.';
    timer = setTimeout(returnToReading, 2100);
  });
  new IntersectionObserver(([entry]) => {
    inView = entry.isIntersecting;
    updateVisibility();
  }).observe(stage);
  document.addEventListener('visibilitychange', updateVisibility);
  window.addEventListener('pagehide', returnToReading);
})();
