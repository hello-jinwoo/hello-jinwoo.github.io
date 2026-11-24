(() => {
  const photographs = [...document.querySelectorAll('.photo-grid figure')].map(figure => ({
    figure,
    name: figure.querySelector('figcaption').textContent.trim(),
    thumbnail: figure.querySelector('img'),
    link: figure.querySelector('a')
  }));
  if (!photographs.length) return;

  const picker = document.querySelector('.print-picker');
  const choices = [];
  function selectPrint(index) {
    if (!picker) return;
    photographs.forEach(({ figure }, i) => {
      figure.hidden = i !== index;
      choices[i].setAttribute('aria-pressed', String(i === index));
    });
  }
  if (picker) {
    photographs.forEach(({ name, thumbnail, figure }, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      figure.id = 'print-' + name;
      button.setAttribute('aria-controls', figure.id);
      const sample = new Image();
      sample.alt = '';
      sample.loading = 'lazy';
      sample.src = thumbnail.src;
      const label = document.createElement('span');
      for (const part of figure.querySelector('figcaption').childNodes) label.append(part.cloneNode(true));
      button.setAttribute('aria-label', name);
      button.append(sample, label);
      button.addEventListener('click', () => selectPrint(index));
      choices.push(button);
      picker.append(button);
    });
    selectPrint(0);
    picker.hidden = false;
  }

  const viewer = document.createElement('dialog');
  if (typeof viewer.showModal !== 'function') return;
  viewer.className = 'photo-viewer';
  viewer.setAttribute('aria-labelledby', 'viewer-title');
  viewer.innerHTML = `
    <div class="viewer-toolbar">
      <button type="button" class="viewer-back" autofocus>Back to gallery</button>
      <div class="viewer-paging" role="group" aria-label="Browse photographs">
        <button type="button" class="viewer-prev" aria-label="Previous photograph">Previous</button>
        <button type="button" class="viewer-next" aria-label="Next photograph">Next</button>
      </div>
    </div>
    <figure><img alt=""><figcaption id="viewer-title" aria-live="polite"></figcaption></figure>`;
  document.body.append(viewer);
  const image = viewer.querySelector('img');
  const title = viewer.querySelector('figcaption');
  const previous = viewer.querySelector('.viewer-prev');
  const next = viewer.querySelector('.viewer-next');
  let current = -1;

  function syncViewer() {
    const index = photographs.findIndex(photo => location.hash === '#photo=' + photo.name);
    if (index < 0) {
      if (viewer.open) {
        viewer.close();
        photographs[current].link.focus({ preventScroll: true });
      }
      return;
    }
    if (viewer.open && current === index) return;
    current = index;
    selectPrint(index);
    const photo = photographs[index];
    image.src = photo.thumbnail.currentSrc || photo.thumbnail.src;
    image.alt = photo.thumbnail.alt;
    title.textContent = photo.name;
    const focused = document.activeElement;
    previous.disabled = index === 0;
    next.disabled = index === photographs.length - 1;
    if (!viewer.open) viewer.showModal();
    else if (focused === next && next.disabled) previous.focus();
    else if (focused === previous && previous.disabled) next.focus();
  }

  function step(offset) {
    const photo = photographs[current + offset];
    if (!photo) return;
    // Browsing prints is one visit to the viewer. Back returns to the gallery.
    history.replaceState(history.state, '', '#photo=' + photo.name);
    syncViewer();
  }
  function returnToGallery() {
    if (history.state?.photoViewer) {
      history.back();
    } else {
      const anchor = picker ? '#photos' : '';
      history.replaceState(history.state, '', location.pathname + location.search + anchor);
      syncViewer();
      photographs[current].figure.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
  }

  for (const { name, link } of photographs) {
    link.setAttribute('href', '#photo=' + name);
    link.addEventListener('click', event => {
      if (event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      history.pushState({ photoViewer: true }, '', '#photo=' + name);
      syncViewer();
    });
  }
  previous.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  viewer.querySelector('.viewer-back').addEventListener('click', returnToGallery);
  viewer.addEventListener('cancel', event => {
    event.preventDefault();
    returnToGallery();
  });
  viewer.addEventListener('keydown', event => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    step(event.key === 'ArrowLeft' ? -1 : 1);
  });
  window.addEventListener('popstate', syncViewer);
  window.addEventListener('hashchange', syncViewer);
  syncViewer();
})();
