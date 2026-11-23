(() => {
  const preferenceKey = 'jinwoo-palette';
  const seasonsByMonth = [
    'winter', 'winter', 'spring', 'spring', 'spring', 'summer',
    'summer', 'summer', 'autumn', 'autumn', 'autumn', 'winter'
  ];
  const seoulMonth = new Intl.DateTimeFormat('en-US', {
    month: 'numeric',
    timeZone: 'Asia/Seoul'
  });
  const page = document.documentElement;

  function getPreference() {
    try {
      const saved = localStorage.getItem(preferenceKey);
      return seasonsByMonth.includes(saved) ? saved : 'seasonal';
    } catch {
      return 'seasonal';
    }
  }

  function currentSeason() {
    const month = Number(seoulMonth.format(new Date()));
    return seasonsByMonth[month - 1];
  }

  function applyPalette(preference) {
    page.dataset.season = preference === 'seasonal' ? currentSeason() : preference;
  }

  function updateBrowserColor() {
    const background = getComputedStyle(page).getPropertyValue('--background').trim();
    document.querySelector('meta[name="theme-color"]').content = background;
  }

  let preference = getPreference();
  applyPalette(preference);

  document.addEventListener('DOMContentLoaded', () => {
    const control = document.getElementById('palette');
    const options = control.querySelectorAll('button[data-palette]');

    function reflectSelection() {
      for (const option of options) {
        const season = option.dataset.palette;
        const active = page.dataset.season === season;
        const name = option.getAttribute('aria-label');
        option.setAttribute('aria-pressed', String(active));
        option.title = preference === season && season === currentSeason()
          ? `${name} · select again for automatic`
          : active ? `${name} · ${preference === 'seasonal' ? 'automatic' : 'replay scene'}` : name;
      }
      updateBrowserColor();
    }

    reflectSelection();
    control.hidden = false;

    for (const option of options) {
      option.addEventListener('click', () => {
        const chosen = option.dataset.palette;
        preference = preference === chosen && chosen === currentSeason() ? 'seasonal' : chosen;
        applyPalette(preference);
        reflectSelection();
        control.dispatchEvent(new Event('season-selected'));
        try {
          localStorage.setItem(preferenceKey, preference);
        } catch {
          // The selection still works for the current visit.
        }
      });
    }
  });
})();
