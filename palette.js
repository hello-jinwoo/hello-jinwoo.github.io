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

  function getPreference(season) {
    try {
      const [savedSeason, palette] = (sessionStorage.getItem(preferenceKey) || '').split(':');
      return savedSeason === season && seasonsByMonth.includes(palette) ? palette : season;
    } catch {
      return season;
    }
  }

  function currentSeason() {
    const month = Number(seoulMonth.format(new Date()));
    return seasonsByMonth[month - 1];
  }

  function updateBrowserColor() {
    const background = getComputedStyle(page).getPropertyValue('--background').trim();
    document.querySelector('meta[name="theme-color"]').content = background;
  }

  let dateSeason = currentSeason();
  page.dataset.season = getPreference(dateSeason);

  document.addEventListener('DOMContentLoaded', () => {
    const control = document.getElementById('palette');
    const options = control.querySelectorAll('button[data-palette]');

    function reflectSelection() {
      for (const option of options) {
        const season = option.dataset.palette;
        const active = page.dataset.season === season;
        const name = option.getAttribute('aria-label');
        option.setAttribute('aria-pressed', String(active));
        option.title = season === dateSeason
          ? `${name} · automatic`
          : active ? `${name} · replay scene` : name;
      }
      updateBrowserColor();
    }

    reflectSelection();
    control.hidden = false;

    function refreshDateSeason() {
      const season = currentSeason();
      if (season !== dateSeason) {
        dateSeason = season;
        page.dataset.season = getPreference(dateSeason);
        reflectSelection();
      }
    }

    document.addEventListener('visibilitychange', refreshDateSeason);
    window.addEventListener('pageshow', event => {
      if (event.persisted) {
        dateSeason = currentSeason();
        page.dataset.season = getPreference(dateSeason);
        reflectSelection();
      }
    });
    setInterval(refreshDateSeason, 60_000);

    for (const option of options) {
      option.addEventListener('click', () => {
        const chosen = option.dataset.palette;
        dateSeason = currentSeason();
        page.dataset.season = chosen;
        reflectSelection();
        control.dispatchEvent(new Event('season-selected'));
        try {
          if (chosen === dateSeason) {
            sessionStorage.removeItem(preferenceKey);
          } else {
            sessionStorage.setItem(preferenceKey, `${dateSeason}:${chosen}`);
          }
        } catch {
          // The selection still works for the current visit.
        }
      });
    }
  });
})();
