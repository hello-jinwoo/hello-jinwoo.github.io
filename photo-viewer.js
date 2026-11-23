(() => {
  const photos = new Map();
  for (const figure of document.querySelectorAll('.photo-grid figure')) {
    photos.set(figure.querySelector('figcaption').textContent, figure);
  }

  const viewer = document.createElement('dialog');
  viewer.className = 'photo-viewer';
  viewer.setAttribute('aria-labelledby', 'viewer-title');
  viewer.innerHTML = `
    <button type="button" class="viewer-back" autofocus>Back to gallery</button>
    <figure><img alt=""><figcaption id="viewer-title"></figcaption></figure>`;
  document.body.append(viewer);
  const image = viewer.querySelector('img');
  const title = viewer.querySelector('figcaption');
  let currentFigure;

  function syncViewer() {
    const key = location.hash.slice(1);
    const figure = key.startsWith('photo=') && photos.get(key.slice(6));
    if (figure) {
      currentFigure = figure;
      const thumbnail = figure.querySelector('img');
      image.src = thumbnail.src;
      image.alt = thumbnail.alt;
      title.textContent = figure.querySelector('figcaption').textContent;
      if (!viewer.open) viewer.showModal();
    } else if (viewer.open) {
      viewer.close();
      currentFigure.querySelector('a').focus({ preventScroll: true });
    }
  }

  function returnToGallery() {
    if (history.state?.photoViewer) {
      history.back();
    } else {
      history.replaceState(null, '', location.pathname + location.search + (document.getElementById('photos') ? '#photos' : ''));
      syncViewer();
      currentFigure.scrollIntoView({block: 'center', behavior: 'instant'});
    }
  }

  for (const [name, figure] of photos) {
    const link = figure.querySelector('a');
    link.setAttribute('href', '#photo=' + name);
    link.addEventListener('click', event => {
      if (event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      history.pushState({photoViewer: true}, '', '#photo=' + name);
      syncViewer();
    });
  }
  viewer.querySelector('button').addEventListener('click', returnToGallery);
  viewer.addEventListener('cancel', event => {
    event.preventDefault();
    returnToGallery();
  });
  window.addEventListener('popstate', syncViewer);
  window.addEventListener('hashchange', syncViewer);
  syncViewer();
})();
